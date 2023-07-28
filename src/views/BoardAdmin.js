import React, {useEffect, useState} from "react";
import "../assets/css/map.css";
import "../assets/css/admin_board.css";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import PlaceService from "../services/place.service";
import {TiTick, TiTimes} from "react-icons/all";
import SquadGenerator from "../components/SquadGenerator";
import AlertTemplate from "../components/AlertTemplate";
import {positions, Provider} from "react-alert";
import def from '../assets/img/defPlace.jpg';
import PlacePhotoChangeModal from "../components/PlacePhotoChangeModal";
import {unauthorizedErrorCheckAndHandle} from "../utils/ErrorHandlingUtils";

const BoardAdmin = () => {

    const [placeRequests, setPlaceRequests] = useState([]);
    const [places, setPlaces] = useState([]);
    const [clickedPlaceId, setClickedPlaceId] = useState(0);

    const [modalShow, setModalShow] = useState(false);

    const options = {
        timeout: 5000,
        position: positions.BOTTOM_CENTER,
    };

    useEffect(() => {
        PlaceService.getPlaceRequests().then(
            (response) => {
                let requestsList = [];
                const parseFoundPlaces = (item, index) => {
                    let primary = (item.name) + ' ' + ((item.street) ? item.street : '') +
                        ((item.city) ? ', ' + item.city : '') + ' lat: ' + item.latitude + ' lng: ' + item.longitude
                    requestsList.push({
                        "index": index,
                        "primary": primary,
                        "secondary": item.requester,
                        "coords": [item.latitude, item.longitude],
                        "place_request_id": item.place_request_id,
                    })
                }
                response.data.forEach(parseFoundPlaces)
                setPlaceRequests(requestsList);
            })
    }, [])

    useEffect(() => {
        PlaceService.getPlaces().then(
            (response) => {
                let placesList = [];
                const parseFoundPlaces = (item, index) => {
                    let primary = (item.name) + ' ' + ((item.street) ? item.street : '') +
                        ((item.city) ? ', ' + item.city : '');
                    placesList.push({
                        "index": index,
                        "primary": primary,
                        "secondary": ' lat: ' + item.latitude + ' lng: ' + item.longitude,
                        "coords": [item.latitude, item.longitude],
                        "place_id": item.place_id,
                        "photo_url": item.photo,
                    })
                }
                response.data.forEach(parseFoundPlaces)
                setPlaces(placesList);
            })
    }, [])

    const handleRemoveRequest = (index, id) => {
        setPlaceRequests(placeRequests.filter(item => item.index !== index))

        PlaceService.removeRequest(id).then(
            () => {
            },
            () => {
            }
        )
    };

    const handleRemovePlace = (index, id) => {
        setPlaces(places.filter(item => item.index !== index))

        PlaceService.removePlace(id).then(
            () => {
            },
            () => {
            }
        )
    };

    const handleApproveRequest = (index, id) => {
        setPlaceRequests(placeRequests.filter(item => item.index !== index))

        PlaceService.approveRequest(id).then(
            () => {
            },
            (error) => {

                unauthorizedErrorCheckAndHandle(error);
            }
        )
    };

    const handleEditRequest = (selectedPlace) => {
        setClickedPlaceId(selectedPlace);
        setModalShow(true)
    };

    const updatePlaces = (places) => {
        setPlaces(places);
    };

    return (
        <div className="admin-boxed">
            <div className="container-fluid">
                <div className="intro">
                    <h2 className="text-center">Admin board </h2>
                </div>
                <div className="row col-12">
                    <div className="item col-lg-6 col-md-6 col-sm-12">
                        <div className="box">
                            <div className="intro">
                                <h2 className="text-center">Place requests</h2>
                            </div>

                            <div className="place-requests">

                                <List dense sx={{width: '100%', bgcolor: 'background.paper'}}>
                                    {placeRequests.map(row => {
                                        const labelId = `checkbox-list-secondary-label-${row.index}`;

                                        return (

                                            <ListItem
                                                key={row.index}
                                                secondaryAction={
                                                    /*              TODO przyda se do wizualizacji na mapie ale to drugorzędne
                                                                                                           <Radio
                                                                                                            checked={selectedValue === row.index}
                                                                                                            onChange={()=>{setSelectedValue(row.index)}}
                                                                                                            value={'' + row.index}
                                                                                                            name="radio-buttons"
                                                                                                            inputProps={{'aria-label': row.index}}
                                                                                                        />*/
                                                    <>
                                                        <button className="btn btn-danger m-1"
                                                                onClick={() => handleRemoveRequest(row.index, row.place_request_id)}>
                                                            <TiTimes/>
                                                        </button>
                                                        <button className="btn btn-success"
                                                                onClick={() => handleApproveRequest(row.index, row.place_request_id)}>
                                                            <TiTick/>
                                                        </button>
                                                    </>
                                                }
                                                disablePadding>
                                                <ListItemButton>
                                                    <ListItemText id={labelId} primary={`${row.primary}`}
                                                                  secondary={`${row.secondary}`}/>
                                                </ListItemButton>
                                            </ListItem>
                                        );
                                    })}
                                </List>
                            </div>
                        </div>
                    </div>
                    <div className="item col-lg-6 col-md-6 col-sm-12">
                        <div className="box">
                            <div className="intro">
                                <h2 className="text-center">Places</h2>
                            </div>
                            <div className="places">
                                <List dense sx={{width: '100%', bgcolor: 'background.paper'}}>
                                    {places.map(row => {
                                        const labelId = `checkbox-list-secondary-label-${row.index}`;

                                        return (
                                            <ListItem
                                                key={row.index}
                                                secondaryAction={
                                                    <>
                                                        <button className="btn btn-danger m-1"
                                                                onClick={() => handleRemovePlace(row.index, row.place_id)}>
                                                            <TiTimes/>
                                                        </button>
                                                    </>
                                                }
                                                disablePadding>

                                                <ListItemButton className="place-item" onClick={() => {
                                                    handleEditRequest(row.place_id)
                                                }}>
                                                    <img className="rounded-circle user-photo"
                                                         src={(row.photo_url) ? row.photo_url : def} alt="placePhoto"/>
                                                    <ListItemText id={labelId} primary={`${row.primary}`}
                                                                  secondary={`${row.secondary}`}/>
                                                </ListItemButton>
                                            </ListItem>
                                        );
                                    })}
                                </List>
                                <PlacePhotoChangeModal
                                    show={modalShow}
                                    onHide={() => setModalShow(false)}
                                    place_id={clickedPlaceId}
                                    places={places}
                                    updatePlaces={updatePlaces}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="item col-lg-6 col-md-6 col-sm-12">
                        <div className="box">
                            <Provider template={AlertTemplate} {...options}><SquadGenerator/></Provider>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BoardAdmin;