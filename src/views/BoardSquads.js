import React, {useEffect, useRef, useState} from "react";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";
import Squad from "../components/Squad"
import {positions, Provider} from "react-alert";
import AlertTemplate from "../components/AlertTemplate";
import {useParams} from "react-router-dom";

import SquadService from "../services/squad.service";
import AuthService from "../services/auth.service";
import "../assets/css/squad.css";
import {getErrorResponseMessage} from "../utils/ErrorHandlingUtils";

const BoardSquads = () => {
    const {id} = useParams();
    const form = useRef();
    const checkBtn = useRef();

    const [content, setContent] = useState([]);
    const [searchResult, setSearchResult] = useState([]);
    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(false);
    const [showError, setShowError] = useState(false);

    const [errorMessage, setErrorMessage] = useState("");

    const [showAdminButtons, setShowAdminButtons] = useState(false);

    const options = {
        timeout: 2000,
        position: positions.BOTTOM_CENTER
    };

    const NO_SQUADS_MESSAGE = "There was no squad matching 😓";
    const NO_PLACE_MESSAGE = "No such place in database 😓";

    useEffect(() => {
        SquadService.getSquadsBoard().then(
            (response) => {
                setContent(response.data);
                if (id) {
                    handleMapRedirection(id);
                } else {
                    setSearchResult(response.data);
                    if (response.data.length === 0) {
                        setErrorMessage(NO_SQUADS_MESSAGE);
                        setShowError(true);
                    }
                }

                let user = AuthService.getCurrentUser();

                if (user) {
                    setShowAdminButtons(user.roles.includes("ROLE_ADMIN"));
                }
            },
            (error) => {
                setShowError(true);
                setErrorMessage(getErrorResponseMessage(error));
            }
        );
    }, [id]);

    const handleMapRedirection = (id) => {
        SquadService.getPlaceSquads(id).then(
            (response) => {
                if (response.data) {
                    if (response.data.length === 0) {
                        setErrorMessage(NO_SQUADS_MESSAGE);
                        setShowError(true);
                    } else {
                        setSearch(response.data[0].place.name);
                        setSearchResult(response.data);
                    }
                } else {
                    setErrorMessage(NO_PLACE_MESSAGE);
                    setShowError(true);
                }
            },
            (error) => {
                const _content =
                    (error.response &&
                        error.response.data &&
                        error.response.data.message) ||
                    error.message ||
                    error.toString();

                setErrorMessage(_content);
                setShowError(true);
            }
        );
    }

    const changeSearchInput = (e) => {
        const search = e.target.value
        setSearch(search)
    }

    const filterSquads = (squad) => {
        let lowerSquad = search.toLowerCase()
        return (squad.creator.name.toLowerCase().includes(lowerSquad) ||
            squad.creator.surname.toLowerCase().includes(lowerSquad) ||
            (squad.creator.name + ' ' + squad.creator.surname).toLowerCase().includes(lowerSquad) ||
            squad.sport.toLowerCase().includes(lowerSquad) ||
            squad.place.name.toLowerCase().includes(lowerSquad) ||
            squad.place.city.toLowerCase().includes(lowerSquad) ||
            squad.place.street.toLowerCase().includes(lowerSquad)
        )
    }

    const handleFilterSquads = (squad) => {
        if (filterSquads(squad)) {
            setShowError(false);
            return true;
        }
        return false;
    }

    const handleSearch = (e) => {
        e.preventDefault();
        setLoading(true);
        setShowError(true);
        setErrorMessage(NO_SQUADS_MESSAGE);

        setSearchResult(
            content.filter((squad) => {
                return handleFilterSquads(squad);
            })
        )
        setLoading(false);
    }

    return (
        <div className="squads-boxed">
            <div className="container-fluid">
                <div className="intro">
                    <h2 className="text-center">Squads </h2>
                </div>
                <Form onSubmit={handleSearch} ref={form}>
                    <div className="form-group search">
                        <Input
                            placeholder="search for squads in your city..."
                            type="text"
                            className="form-control"
                            name="search"
                            value={search}
                            onChange={changeSearchInput}
                        />

                        <button className="btn btn-danger" disabled={loading}>
                            {loading && (
                                <span className="spinner-border spinner-border-sm"></span>
                            )}
                            <span>search</span>
                        </button>
                    </div>

                    {showError && (
                        <div className="form-group">
                            <div className="alert alert-danger error" role="alert">
                                {errorMessage}
                            </div>
                        </div>
                    )}
                    <CheckButton style={{display: "none"}} ref={checkBtn}/>

                </Form>

                <div className="row squads">
                    {searchResult &&
                    (searchResult.map((squad, index) => <Provider template={AlertTemplate} {...options}
                                                                  key={index}><Squad info={squad} board={"squads"}
                                                                                     mod={showAdminButtons}/></Provider>)
                    )}
                </div>
            </div>
        </div>
    );
};
export default BoardSquads;