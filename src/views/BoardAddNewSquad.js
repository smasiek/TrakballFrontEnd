import React, {useRef, useState} from "react";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";
import SquadService from "../services/squad.service";
import PlaceService from "../services/place.service";
import {floatRegExp} from "../utils/InputUtils";
import {Checkbox} from "@mui/material";
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

const BoardAddNewSquad = (props) => {
    const form = useRef();
    const checkBtn = useRef();

    const [formData, setFormData] = useState({});
    const [city, setCity] = useState("");
    const [citiesList, setCitiesList] = useState([]);

    const [street, setStreet] = useState("");
    const [streetsList, setStreetsList] = useState([]);

    const [place, setPlace] = useState("");
    const [placesList, setPlacesList] = useState([]);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const [privateSquad, setPrivateSquad] = useState(false);

    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 1);
    const minDate = currentDate.toISOString().split('T')[0] + 'T' +
        currentDate.toTimeString().split(' ')[0].substr(0, 5);

    const changeFormData = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const changeCityInput = (e) => {
        const city = e.target.value;
        setCity(city);
        document.getElementById("cityErr").style.display = "none";
        handleCitiesInputChange();
    };

    const changeFeeInput = (e) => {
        let value = e.target.value;
        if (value === '' || floatRegExp.test(value)) {
            changeFormData(e);
        } else {
            console.log(formData.fee);
            e.target.value = (!!formData.fee) ? formData.fee : 0;
            changeFormData(e);
        }
    };

    const handleCitiesInputChange = () => {
        if (city && city.length >= 1) {
            fetchCitiesList();
        }
    };

    const fetchCitiesList = () => {
        PlaceService.getCitiesList(city, street, place).then(
            (response) => {
                setCitiesList(response.data);
            },
            (error) => {
                setMessage(getErrorResponseMessage(error));
                unauthorizedErrorCheckAndHandle(error);
            }
        );
    };

    const CitySuggestions = (e) => {
        const options = e.results.map((r, index) => (
            <option value={r} key={index}/>
        ));
        return <datalist id="cities">{options}</datalist>
    };

    const changeStreetInput = (e) => {
        const street = e.target.value;
        setStreet(street);

        document.getElementById("streetErr").style.display = "none";
        handleStreetsInputChange(e);
    };

    const handleStreetsInputChange = (e) => {
        if (e.target.value && e.target.value.length >= 1) {
            fetchStreetsList();
        }
    };

    const fetchStreetsList = () => {
        PlaceService.getStreetsList(city, street, place).then(
            (response) => {
                setStreetsList(response.data);
            },
            (error) => {
                const _content =
                    (error.response &&
                        error.response.data &&
                        error.response.data.message) ||
                    error.message ||
                    error.toString();

                setStreetsList(_content);
            }
        );
    };

    const StreetSuggestions = (e) => {
        const options = e.results.map((r, index) => (
            <option value={r} key={index}/>
        ))
        return <datalist id="streets">{options}</datalist>
    };

    const changePlaceInput = (e) => {
        const place = e.target.value;
        setPlace(place);

        document.getElementById("placeErr").style.display = "none";
        handlePlacesInputChange(e);
    };

    const handlePlacesInputChange = (e) => {
        if (e.target.value && e.target.value.length >= 1) {
            fetchPlacesList();
        }
    };

    const handlePrivateSquad = (event) => {
        setPrivateSquad(event.target.checked);
    };

    const fetchPlacesList = () => {
        PlaceService.getPlacesList(city, street, place).then(
            (response) => {
                setPlacesList(response.data);
            },
            (error) => {
                const _content =
                    (error.response &&
                        error.response.data &&
                        error.response.data.message) ||
                    error.message ||
                    error.toString();

                setPlacesList(_content);
            }
        );
    };

    const PlaceSuggestions = (e) => {
        const options = e.results.map((r, index) => (
            <option value={r} key={index}/>
        ));
        return <datalist id="places">{options}</datalist>
    };

    const isValid = () => {
        let isValid = true;

        let cityCheck = citiesList.filter((val) => val === city);
        let streetCheck = streetsList.filter((val) => val === street);
        let placeCheck = placesList.filter((val) => val === place);

        if (cityCheck.length === 0 && city) {
            isValid = false;
            document.getElementById("cityErr").style.display = "block";
        }
        if (streetCheck.length === 0 && street) {
            isValid = false;
            document.getElementById("streetErr").style.display = "block";
        }
        if (placeCheck.length === 0 && place) {
            isValid = false;
            document.getElementById("placeErr").style.display = "block";
        }

        return isValid;
    };

    const handleNewSquad = (e) => {
        e.preventDefault();

        setMessage("");
        setLoading(true);

        form.current.validateAll();

        if (checkBtn.current.context._errors.length === 0 && isValid()) {
            SquadService.publish(place, city, street,
                formData.sport, new Date(formData.date).getTime(),
                formData.fee, formData.maxMembers, privateSquad, formData.password).then(
                () => {
                    props.history.push("/squads");
                    window.location.reload();
                },
                (error) => {
                    const resMessage =
                        (error.response &&
                            error.response.data &&
                            error.response.data.message) ||
                        error.message ||
                        error.toString();

                    setLoading(false);
                    setMessage(resMessage);
                    unauthorizedErrorCheckAndHandle(error);
                }
            );
        } else {
            setLoading(false);
        }
    };

    return (
        <div className="col-md-12">
            <div className="card card-container" style={{marginTop: "2em", padding: '20px 40px'}}>

                <Form onSubmit={handleNewSquad} ref={form}>
                    <div className="intro">
                        <h2 className="text-center">Add new squad</h2>
                    </div>
                    <div className="form-group">
                        <label htmlFor="city">City</label>
                        <Input
                            type="text"
                            className="form-control"
                            placeholder="type and choose from list..."
                            name="city"
                            value={city}
                            list="cities"
                            onChange={changeCityInput}
                            autoComplete="new-password"
                            validations={[required]}
                        />

                        <Input
                            type="text"
                            className="form-control"
                            value={city}
                            list="cities"

                            style={{display: 'none'}}
                        />

                        <CitySuggestions results={citiesList}/>
                        <div id="cityErr" className="alert alert-danger" role="alert" style={{display: "none"}}>
                            No such city in database
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="street">Street</label>
                        <Input
                            type="text"
                            className="form-control"
                            placeholder="type and choose from list..."
                            name="street"
                            value={street}
                            list="streets"
                            onChange={changeStreetInput}
                            validations={[required]}
                            autoComplete="new-password"
                        />

                        <div id="streetErr" className="alert alert-danger" role="alert" style={{display: "none"}}>
                            No such street in database
                        </div>
                    </div>

                    <StreetSuggestions results={streetsList}/>

                    <div className="form-group">
                        <label htmlFor="placeName">Place name</label>
                        <Input
                            type="text"
                            className="form-control"
                            placeholder="type and choose from list..."
                            name="placeName"
                            value={place}
                            list="places"
                            onChange={changePlaceInput}
                            validations={[required]}
                            autoComplete="new-password"
                        />

                        <div id="placeErr" className="alert alert-danger" role="alert" style={{display: "none"}}>
                            No such place in database
                        </div>

                    </div>

                    <PlaceSuggestions results={placesList}/>

                    <div className="form-group">
                        <label htmlFor="sport">Sport</label>
                        <Input
                            type="text"
                            className="form-control"
                            name="sport"
                            value={formData.sport}
                            onChange={changeFormData}
                            validations={[required]}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="date">Date</label>
                        <Input
                            type="datetime-local"
                            className="form-control"
                            min={minDate}
                            name="date"
                            value={formData.date}
                            onChange={changeFormData}
                            validations={[required]}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="fee">Fee</label>
                        <Input
                            type="text"
                            className="form-control"
                            name="fee"
                            value={formData.fee}
                            onChange={changeFeeInput}
                            validations={[required]}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="maxMembers">Max members</label>
                        <Input
                            type="number"
                            className="form-control"
                            name="maxMembers"
                            value={formData.maxMembers}
                            onChange={changeFormData}
                            validations={[required]}
                        />
                    </div>

                    <div className="form-group justify-content-between" style={{display: "flex"}}>
                        <label htmlFor="maxMembers">Create private squad</label>
                        <Checkbox
                            checked={privateSquad}
                            onChange={handlePrivateSquad}
                            inputProps={{'aria-label': 'controlled'}}
                        />
                    </div>

                    {privateSquad &&
                    <div className="form-group">
                        <span htmlFor="password">Password</span>
                        <Input
                            type="password"
                            className="form-control"
                            name="password"
                            value={formData.password}
                            onChange={changeFormData}
                            validations={[required]}
                        />
                    </div>
                    }

                    <div className="form-group" style={{marginBottom: 0}}>
                        <button className="btn btn-danger btn-block" disabled={loading}>
                            {loading && (
                                <span className="spinner-border spinner-border-sm"></span>
                            )}
                            <span>Publish</span>
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
            </div>
        </div>
    );
};

export default BoardAddNewSquad;