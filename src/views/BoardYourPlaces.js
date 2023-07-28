import React, {useEffect, useState} from "react";
import {positions, Provider} from "react-alert";
import AlertTemplate from "../components/AlertTemplate";
import Place from "../components/Place"
import UserService from "../services/user.service";
import "../assets/css/place.css";
import {Carousel} from '3d-react-carousal';
import {getErrorResponseMessage, unauthorizedErrorCheckAndHandle} from "../utils/ErrorHandlingUtils";
import MessageView from "../components/MessageView";

const BoardYourPlaces = () => {

    const [showError, setShowError] = useState(false);
    const [content, setContent] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");

    const options = {
        timeout: 5000,
        position: positions.BOTTOM_CENTER
    };

    const NO_PLACE_MESSAGE = "You haven't followed any place 😓\nTry to find and follow any place on map!";

    useEffect(() => {
        UserService.getYourPlacesBoard().then(
            (response) => {
                setContent(response.data);
                if (response.data.length === 0) {
                    setErrorMessage(NO_PLACE_MESSAGE)
                    setShowError(true);
                }
            },
            (error) => {
                setShowError(true);
                setErrorMessage(getErrorResponseMessage(error));

                unauthorizedErrorCheckAndHandle(error);
            }
        );
    }, []);

    return (
        <div className="places-boxed">
            <div className="container-fluid">
                <div className="intro">
                    <h2 className="text-center">Your Places</h2>
                </div>
                {showError && (
                    <div className="card card-container">
                        <MessageView alert_type="alert-danger" message={errorMessage}/>
                    </div>
                )}
                <div className="row">
                    <Carousel slides={content.map((place, index) =>
                        <Provider template={AlertTemplate} {...options}
                                  key={index}> <Place info={place}
                                                      board={"your_places"}
                                                      alt={index}/>
                        </Provider>)} autoplay={false} interval={1000}/>
                </div>
            </div>
        </div>
    );
};

export default BoardYourPlaces;