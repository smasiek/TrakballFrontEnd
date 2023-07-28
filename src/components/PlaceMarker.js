import React from "react";
import {Marker, Popup} from 'react-leaflet'
import {useHistory} from 'react-router-dom';
import PlaceService from "../services/place.service";
import {renderToStaticMarkup} from "react-dom/server";
import {FaMapMarkerAlt} from "react-icons/all";
import {divIcon} from "leaflet/dist/leaflet-src.esm";
import {useAlert} from "react-alert";
import {getErrorResponseMessage} from "../utils/ErrorHandlingUtils";

const PlaceMarker = (props) => {

    const alert = useAlert();
    const history = useHistory();
    const iconMarkup = renderToStaticMarkup(<FaMapMarkerAlt style={{width: '100%', height: '100%', color: "orange"}}/>);
    const customMarkerIcon = divIcon({
        iconSize: [25, 41],
        iconAnchor: [0, 40],
        popupAnchor: [13, -35],
        html: iconMarkup,
    });

    const handlePlaceSquads = () => {
        history.push("/squads/" + props.place.place_id);
    };

    const handleFollowPlace = () => {
        PlaceService.followPlace(props.place.place_id).then(
            () => {
                history.push("/your_places");
            },
            (error) => {
                console.log(error.response)
                alert.error(getErrorResponseMessage(error))
            }
        );
    };

    return (
        <>
            <Marker position={[props.place.latitude, props.place.longitude]} icon={customMarkerIcon}>
                <Popup>
                    <div className="popup">
                        <h6>{props.place.name}</h6>
                        <span>{(!!props.place.street) ? 'ul. ' + props.place.street : '-'}</span>
                        <div>
                            <button className="btn btn-outline-success mr-2"
                                    onClick={() => handleFollowPlace()}>Follow
                            </button>
                            <button className="btn btn-warning" onClick={() => handlePlaceSquads()}>Check squads
                            </button>
                        </div>
                    </div>
                </Popup>
            </Marker>
        </>
    )
};

export default PlaceMarker;