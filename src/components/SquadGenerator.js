import {useAlert} from "react-alert";
import SquadService from "../services/squad.service";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";
import React, {useEffect, useRef, useState} from "react";
import PlaceService from "../services/place.service";
import "../assets/css/squad_generator.css";
import {floatRegExp, intRegExp} from "../utils/InputUtils";
import {getErrorResponseMessage} from "../utils/ErrorHandlingUtils";

const required = (value, props) => {
    if (!value && !props.commited) {
        return (
            <div className="alert alert-danger mb-0" role="alert">
                This field is required!
            </div>
        );
    }
};

const dateToValidation = (value, props, components) => {
    if (value < components['dateFrom'][0].value) {
        return (
            <div className="alert alert-danger mb-0" role="alert">
                Set date higher than minimum date!
            </div>
        )
    }
};

const feeMaxValidation = (value, props, components) => {
    if (parseFloat(value) < parseFloat(components['feeFrom'][0].value)) {
        return (
            <div className="alert alert-danger mb-0" role="alert">
                Set fee higher than minimum of range!
            </div>
        );
    }
};

const maxMembersValidation = (value, props, components) => {
    if (parseInt(value) < parseInt(components['maxMembersFrom'][0].value)) {
        return (
            <div className="alert alert-danger mb-0" role="alert">
                Set value higher than minimum of range!
            </div>
        );
    }
};

const SquadGenerator = () => {

    const alert = useAlert();

    const form = useRef();
    const checkBtn = useRef();
    const [formData, setFormData] = useState({});
    const [city, setCity] = useState("");
    const [citiesList, setCitiesList] = useState([]);
    const [citiesSuggestions, setCitiesSuggestionsList] = useState([]);

    const commited = useRef(false);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const currentDate = new Date();
    const minDate = currentDate.toISOString().split('T')[0] + 'T' +
        currentDate.toTimeString().split(' ')[0].substr(0, 5);

    useEffect(() => {
        PlaceService.getCitiesList("", "", "").then(
            (response) => {
                setCitiesList(response.data);
            },
            (error) => {
                alert.error(getErrorResponseMessage(error));
            }
        );
    }, [alert]);

    const changeFormData = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
        if (commited.current) {
            commited.current = false;
        }
    };

    const changeCityInput = (e) => {
        const city = e.target.value
        setCity(city)
        document.getElementById("cityErr").style.display = "none";
        handleCitiesInputChange()
    };

    const handleCitiesInputChange = () => {
        if (city && city.length >= 1) {
            setCitiesSuggestionsList(citiesList.filter(cityElem => cityElem.toLowerCase().includes(city.toLowerCase())));
        }
    };

    const CitySuggestions = (e) => {
        const options = e.results.map((r, index) => (
            <option value={r} key={index}/>
        ))
        return <datalist id="cities">{options}</datalist>
    };

    const handleGenerateSquads = (e) => {
        e.preventDefault();
        form.current.validateAll();

        if (checkBtn.current.context._errors.length === 0 && isValid()) {
            setLoading(true);
            processDataAndGenerateSquads(city, formData.sport.split(";"));
        }
    };

    const isValid = () => {
        let isValid = true;
        let cityCheck = citiesList.filter((val) => val === city);
        if (cityCheck.length === 0 && city) {
            isValid = false;
            document.getElementById("cityErr").style.display = "block";
        }
        return isValid;
    };

    const processDataAndGenerateSquads = ((city, sports) => {
        PlaceService.getPlacesFromCity(city).then(
            (response) => {
                generateSquads(response.data, sports);
            },
            (error) => {
                setMessage(getErrorResponseMessage(error));
                setLoading(false);
            }
        );
    });

    const generateSquads = (placesList, sports) => {
        if (placesList.length !== 0) {
            let newSquads = [];
            for (let i = 0; i < formData.noSquads; i++) {
                let randPlaceId = getRandomInteger(0, placesList.length)
                newSquads.push({
                    city: placesList[randPlaceId].city,
                    street: placesList[randPlaceId].street,
                    place: placesList[randPlaceId].name,
                    sport: sports[getRandomInteger(0, sports.length)],
                    maxMembers: getRandomInteger(formData.maxMembersFrom, formData.maxMembersTo),
                    fee: getRandomMoneyValue(formData.feeFrom, formData.feeTo),
                    date: getRandomTimestampWithoutSeconds(new Date(formData.dateFrom).getTime(), new Date(formData.dateTo).getTime())
                })
            }
            if (newSquads) {
                SquadService.generateSquads(newSquads).then(
                    (response) => {
                        alert.success(response.data.message);
                        commited.current = true;
                        const keys = Object.keys(formData);
                        keys.forEach((key) => {
                            formData[key] = '';
                        })
                        setCity('');
                        setLoading(false);
                    },
                    (error) => {
                        alert.error(getErrorResponseMessage(error));
                        setLoading(false);
                    }
                );
            }
        }
    };

    const getRandomTimestampWithoutSeconds = (dateFrom, dateTo) => {
        return Math.round(getRandomInteger(dateFrom, dateTo) / 10000) * 10000;
    };

    const getRandomInteger = (min, max) => {
        min = parseInt(min + '');
        max = parseInt(max + '');
        return Math.floor(Math.random() * (max - min) + min);
    };

    const getRandomMoneyValue = (min, max) => {
        let floatMin = parseFloat(min);
        let floatMax = parseFloat(max);
        return ((Math.random() * (floatMax - floatMin) + floatMin).toFixed(2));
    };

    const handleValidationOnFromChange = (e) => {
        let value = e.target.value;
        if (value === '' || floatRegExp.test(value)) {
            changeFormData(e)
        } else {
            e.target.value = (!!formData.feeFrom) ? formData.feeFrom : 0;
            changeFormData(e);
        }
    };

    const handleValidationOnToChange = (e) => {
        let value = e.target.value;
        if (value === '' || floatRegExp.test(value)) {
            changeFormData(e)
        } else {
            e.target.value = (!!formData.feeTo) ? formData.feeTo : 0;
            changeFormData(e);
        }
    };

    const handleMembersFromOnChange = (e) => {
        let value = e.target.value;
        if (value === '' || intRegExp.test(value)) {
            changeFormData(e)
        } else {
            e.target.value = (!!formData.maxMembersFrom) ? formData.maxMembersFrom : 1;
            changeFormData(e);
        }
    };

    const handleMembersToOnChange = (e) => {
        let value = e.target.value;
        if (value === '' || intRegExp.test(value)) {
            changeFormData(e)
        } else {
            e.target.value = (!!formData.maxMembersTo) ? formData.maxMembersTo : 1;
            changeFormData(e);
        }
    };

    const handleSquadsToGenerateChange = (e) => {
        let value = e.target.value;
        if (value === '' || intRegExp.test(value)) {
            changeFormData(e)
        } else {
            e.target.value = (!!formData.noSquads) ? formData.noSquads : 1;
            changeFormData(e);
        }
    };

    return (
        <div className="squad-generator">
            <Form onSubmit={handleGenerateSquads} ref={form}>
                <div className="intro">
                    <h2 className="text-center">New squads generator</h2>
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
                        commited={commited.current}
                    />

                    <Input
                        type="text"
                        className="form-control"
                        value={city}
                        list="cities"
                        style={{display: 'none'}}
                    />

                    <CitySuggestions results={citiesSuggestions}/>
                    <div id="cityErr" className="alert alert-danger" role="alert" style={{display: "none"}}>
                        No such city in database
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="sport">Sports</label>
                    <Input
                        type="text"
                        className="form-control"
                        name="sport"
                        value={formData.sport}
                        onChange={changeFormData}
                        validations={[required]}
                        placeholder="ex. Piłka nożna;Piłka koszykowa;Siatkówka"
                        commited={commited.current}
                    />
                </div>
                <div className="flex-form-group w-100">
                    <div className="form-group date">
                        <label htmlFor="dateFrom">Date from</label>
                        <Input
                            type="datetime-local"
                            className="form-control"
                            min={minDate}
                            name="dateFrom"
                            value={formData.dateFrom}
                            onChange={changeFormData}
                            validations={[required]}
                            commited={commited.current}
                        />
                    </div>

                    <div className="form-group date">
                        <label htmlFor="dateTo">Date to</label>
                        <Input
                            type="datetime-local"
                            className="form-control"
                            min={formData.dateFrom}
                            name="dateTo"
                            value={formData.dateTo}
                            onChange={changeFormData}
                            validations={[required, dateToValidation]}
                            commited={commited.current}
                        />
                    </div>
                </div>
                <div className="flex-form-group">
                    <div className="form-group mr-3">
                        <label htmlFor="feeFrom">Fee range:</label>
                        <Input
                            type="text"
                            className="form-control"
                            name="feeFrom"
                            value={formData.feeFrom}
                            onChange={handleValidationOnFromChange}
                            validations={[required]}
                            commited={commited.current}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="feeTo">Fee range max</label>
                        <Input
                            type="text"
                            className="form-control"
                            name="feeTo"
                            value={formData.feeTo}
                            onChange={handleValidationOnToChange}
                            validations={[required, feeMaxValidation]}
                            commited={commited.current}
                        />
                    </div>
                </div>
                <div className="flex-form-group">
                    <div className="form-group mr-3">
                        <label htmlFor="maxMembersFrom">Max members range min</label>
                        <Input
                            type="text"
                            className="form-control"
                            name="maxMembersFrom"
                            value={formData.maxMembersFrom}
                            onChange={handleMembersFromOnChange}
                            validations={[required]}
                            commited={commited.current}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="maxMembersTo">Max members range max</label>
                        <Input
                            type="text"
                            className="form-control"
                            name="maxMembersTo"
                            value={formData.maxMembersTo}
                            onChange={handleMembersToOnChange}
                            validations={[required, maxMembersValidation]}
                            commited={commited.current}
                        />
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="noSquads">Squads to generate</label>
                    <Input
                        type="text"
                        className="form-control"
                        name="noSquads"
                        value={formData.noSquads}
                        onChange={handleSquadsToGenerateChange}
                        validations={[required]}
                        commited={commited.current}
                    />
                </div>
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
    );
};

export default SquadGenerator;