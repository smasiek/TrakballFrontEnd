import React, {useEffect, useRef, useState} from "react";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import Radio from '@mui/material/Radio';

import OpenRouteService from "../services/openroute.service";
import PlaceService from "../services/place.service";
import ListItemText from "@mui/material/ListItemText";

import "../assets/css/place.css";
import {useAlert} from "react-alert";
import {getErrorResponseMessage, unauthorizedErrorCheckAndHandle} from "../utils/ErrorHandlingUtils";

const required = (value) => {
    if (!value) {
        return (
            <div className="alert alert-danger" role="alert">
                This field is required!
            </div>
        );
    }
};

const BoardAddNewPlace = (props) => {
    const form = useRef();
    const checkBtn = useRef();
    const alertReact = useAlert();

    const [city, setCity] = useState("");

    const [street, setStreet] = useState("");

    const [place, setPlace] = useState("");

    const [searchResult, setSearchResult] = useState([]);
    const [isResultFound, setIsResultFound] = useState(false);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const [newPlace, setNewPlace] = useState({});
    const [selectedValue, setSelectedValue] = useState(null);

    useEffect(() => {
        setIsResultFound(searchResult.length > 0);
    }, [searchResult])

    const changeCityInput = (e) => {
        const city = e.target.value
        setCity(city)
    };

    const changeStreetInput = (e) => {
        const street = e.target.value
        setStreet(street)
    };

    const changePlaceInput = (e) => {
        const place = e.target.value
        setPlace(place)
    };

    const handleSearchForPlaces = (e) => {
        e.preventDefault();

        setSelectedValue(null);
        props.setNewPlaceMarker([]);
        if (!city && !street && !place) {
            return
        }

        setMessage("");
        setLoading(true);
        OpenRouteService.getLatLngFromAddress(city, street, place).then(
            (response) => {
                let foundResult = [];
                const parseFoundPlaces = (item, index) => {
                    let secondary = ((item.properties.street) ? item.properties.street + ' ' : '') +
                        ((item.properties.housenumber) ? item.properties.housenumber + ', ' : '') +
                        ((item.properties.locality) ? item.properties.locality : '')
                    foundResult.push({
                        "index": index,
                        "primary": item.properties.name,
                        "secondary": secondary,
                        "coords": item.geometry.coordinates,
                        "name": item.properties.name,
                        "street": item.properties.street,
                        "house_number": item.properties.housenumber,
                        "city": item.properties.locality,
                        "postal_code": item.properties.postalcode,
                    })
                }
                response.data.features.forEach(parseFoundPlaces)
                setSearchResult(foundResult);
                console.log(isResultFound);
                setLoading(false);
            },
            (error) => {
                const resMessage = getErrorResponseMessage(error)

                setLoading(false);
                setMessage(resMessage);
                unauthorizedErrorCheckAndHandle(error);
            }
        );
    };


    const handleSendNewPlaceRequest = () => {
        setLoading(true);
        PlaceService.newPlace(newPlace["name"], newPlace["street"], newPlace["city"], newPlace["latitude"], newPlace["longitude"], newPlace["postal_code"]).then(
            () => {
                alertReact.show("Place request sent!");
                setLoading(false);
            },
            (error) => {
                alertReact.error(getErrorResponseMessage(error));
                setLoading(false);
            }
        );
    };

    const handleChange = (event) => {
        setSelectedValue(parseInt(event.target.value));
        const selectedPlace = searchResult.filter((place) => '' + place.index === event.target.value)[0];
        props.setNewPlaceLatLng(selectedPlace.coords);
        setNewPlace({
            "name": selectedPlace.name,
            "street": ((!!selectedPlace.street) ? selectedPlace.street : '' + ((!!selectedPlace.house_number) ? (' ' + selectedPlace.house_number) : "")),
            "city": selectedPlace.city,
            "postal_code": selectedPlace.postal_code,
            "latitude": selectedPlace.coords[1],
            "longitude": selectedPlace.coords[0]
        })
    };

    return (
        <div className={'card m-0 w-100'}>

            <Form onSubmit={handleSearchForPlaces} ref={form}>
                <div className="intro">
                    <h4 className="text-center">Add new place</h4>
                </div>
                <div className="form-groups">
                    <div className="form-group">
                        <label htmlFor="city">City</label>
                        <Input
                            type="text"
                            className="form-control"
                            placeholder="type city"
                            name="city"
                            autocomplete="password"
                            value={city}
                            onChange={changeCityInput}
                            validations={[required]}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="street">Street</label>
                        <Input
                            type="text"
                            className="form-control"
                            placeholder="type street"
                            name="street"
                            autocomplete="password"
                            value={street}
                            onChange={changeStreetInput}
                        />

                        <div id="streetErr" className="alert alert-danger" role="alert" style={{display: "none"}}>
                            No such street in database
                        </div>

                    </div>

                    <div className="form-group">
                        <label htmlFor="placeName">Place name</label>
                        <Input
                            type="text"
                            className="form-control"
                            placeholder="type place name"
                            name="placeName"
                            autocomplete="password"
                            value={place}
                            onChange={changePlaceInput}
                        />
                    </div>
                </div>
                <div className="form-group" style={{marginBottom: 0}}>
                    <button className="btn btn-danger btn-block" disabled={loading}>
                        {loading && (
                            <span className="spinner-border spinner-border-sm"></span>
                        )}
                        <span>Find</span>
                    </button>
                </div>

                {message && (
                    <div className="form-group">
                        <div className="alert alert-danger" role="alert">
                            {message}
                        </div>
                    </div>
                )}
                <CheckButton style={{display: "none"}} ref={checkBtn}/>
            </Form>

            {isResultFound && (
                <div>
                    <div className={"result-list"}>
                        <List dense sx={{width: '100%', bgcolor: 'background.paper'}}>
                            {searchResult.map((row) => {
                                const labelId = `checkbox-list-secondary-label-${row.index}`;

                                return (
                                    <ListItem
                                        key={row.index}
                                        secondaryAction={
                                            <Radio
                                                checked={selectedValue === row.index}
                                                onChange={handleChange}
                                                value={'' + row.index}
                                                name="radio-buttons"
                                                inputProps={{'aria-label': row.index}}
                                            />
                                        }
                                        disablePadding
                                    >
                                        <ListItemButton>
                                            <ListItemText id={labelId} primary={`${row.primary}`}
                                                          secondary={`${row.secondary}`}/>
                                        </ListItemButton>
                                    </ListItem>
                                );
                            })}

                        </List>
                        <div className="attribution">
                            <span className="bg-white">©<a
                                href="https://openrouteservice.org/terms-of-service/">openrouteservice.org</a> by HeiGIT</span>
                            <span className="bg-white">Map data ©<a href="http://osm.org/copyright">OpenStreetMap</a> contributors</span>
                        </div>
                    </div>
                    <button className="btn btn-danger btn-block" disabled={loading || (selectedValue === null)}
                            onClick={handleSendNewPlaceRequest}>
                        {loading && (
                            <span className="spinner-border spinner-border-sm"></span>
                        )}
                        <span>Send request</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default BoardAddNewPlace;