import PlaceService from "../services/place.service";
import {useAlert} from "react-alert";
import {useHistory} from 'react-router-dom';
import {FaMapMarkedAlt, GiCancel, IoPeople} from "react-icons/all";
import {getErrorResponseMessage} from "../utils/ErrorHandlingUtils";
import def from '../assets/img/defPlace.jpg';

const Place = (props) => {
    const history = useHistory();
    const alertReact = useAlert();

    const handleShowOnMap = () => {
        history.push("/home/" + props.info.latitude + "/" + props.info.longitude);
        window.location.reload();
    };

    const handleUnfollowPlace = () => {
        PlaceService.unfollowPlace(props.info.place_id).then(
            () => {
                window.location.reload();
            },
            (error) => {
                const message = getErrorResponseMessage(error);
                alertReact.show(message);
            }
        );
    };

    const handlePlaceSquads = () => {
        history.push("/squads/" + props.info.place_id);
    };

    const Footer = () => {
        return <div className="place-footer">
            <h3 className="name">{props.info.name}</h3>
            <p>{props.info.street}, {props.info.city}</p>
            <div className="controls" style={{margin: 'auto'}}>
                <div>
                    <button onClick={() => handleUnfollowPlace()} style={{color: 'lightcoral'}}><GiCancel
                        style={{margin: '5px'}}/>Unfollow place
                    </button>
                    <button onClick={() => handleShowOnMap()}><FaMapMarkedAlt style={{margin: '5px'}}/>Show on map
                    </button>
                    <button onClick={() => handlePlaceSquads()}><IoPeople style={{margin: '5px'}}/>Show squads</button>
                </div>
            </div>
        </div>
    };

    return (
        <div className="item w-100" key={props.info.place_id}>
            <img className="place-photo" src={(!!props.info.photo) ? props.info.photo : def} alt="placePhoto"/>
            <Footer/>
        </div>
    );
};

export default Place;