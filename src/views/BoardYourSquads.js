import React, {useEffect, useRef, useState} from "react";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";
import {positions, Provider} from "react-alert";
import AlertTemplate from "../components/AlertTemplate";
import Squad from "../components/Squad"

import UserService from "../services/user.service";
import "../assets/css/squad.css";
import {getErrorResponseMessage, unauthorizedErrorCheckAndHandle} from "../utils/ErrorHandlingUtils";

const BoardYourSquads = () => {
    const form = useRef();
    const checkBtn = useRef();

    const [content, setContent] = useState([]);
    const [searchResult, setSearchResult] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [showError, setShowError] = useState(false);

    const NO_SQUADS_MESSAGE = "There was no squad matching 😓";

    const options = {
        timeout: 5000,
        position: positions.BOTTOM_CENTER
    };

    useEffect(() => {
        UserService.getYourSquadsBoard().then(
            (response) => {
                setContent(response.data);
                setSearchResult(response.data);
                if (response.data.length === 0) {
                    setErrorMessage(NO_SQUADS_MESSAGE);
                    setShowError(true);
                }

            },
            (error) => {
                setErrorMessage(getErrorResponseMessage(error));
                setShowError(true);

                unauthorizedErrorCheckAndHandle(error);
            }
        );
    }, []);

    const changeSearchInput = (e) => {
        const search = e.target.value
        setSearch(search)
    };

    const filterSquads = (squad) => {
        let match;
        match = (squad.creator.name.toLowerCase().includes(search) ||
            squad.creator.surname.toLowerCase().includes(search) ||
            (squad.creator.name + ' ' + squad.creator.surname).toLowerCase().includes(search) ||
            squad.sport.toLowerCase().includes(search) ||
            squad.place.name.toLowerCase().includes(search) ||
            squad.place.city.toLowerCase().includes(search) ||
            squad.place.street.toLowerCase().includes(search)
        )
        console.log(search);
        return match
    };

    const handleFilterSquads = (squad) => {
        if (filterSquads(squad)) {
            setShowError(false);
            return true;
        }
        return false;
    };

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
    };

    return (
        <div className="squads-boxed">
            <div className="container-fluid">
                <div className="intro">
                    <h2 className="text-center">Your Squads</h2>
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
                                                                  key={index}><Squad info={squad}
                                                                                     board={"your_squads"}/></Provider>))
                    }
                </div>
            </div>
        </div>
    );
};

export default BoardYourSquads;