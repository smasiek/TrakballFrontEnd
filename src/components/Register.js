import React, {useEffect, useRef, useState} from "react";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";
import def from '../assets/img/default.png';
import {isEmail} from "validator";

import AuthService from "../services/auth.service";
import {getErrorResponseMessage} from "../utils/ErrorHandlingUtils";
import MessageView from "./MessageView";
import isMobilePhone from "validator/es/lib/isMobilePhone";

const required = (value) => {
    if (!value) {
        return (
            <div className="alert alert-danger" role="alert">
                This field is required!
            </div>
        );
    }
};

const validEmail = (value) => {
    if (!isEmail(value)) {
        return (
            <div className="alert alert-danger" role="alert">
                This is not a valid email.
            </div>
        );
    }
};

const validPhone = (value) => {
    if (value && !isMobilePhone(value)) {
        return (
            <div className="alert alert-danger" role="alert">
                This is not a valid phone number.
            </div>
        );
    }
};

const vpassword = (value) => {
    if (value.length < 6 || value.length > 40) {
        return (
            <div className="alert alert-danger" role="alert">
                The password must be between 6 and 40 characters.
            </div>
        );
    }
};

const samePasswords = (value, props, components) => {

    if (value !== components['password'][0].value) {
        return (
            <div className="alert alert-danger mb-0" role="alert">
                Password doesn't match!
            </div>
        )
    }
};

const Register = () => {
    const form = useRef();
    const checkBtn = useRef();

    const [formData, setFormData] = useState({});
    const [successful, setSuccessful] = useState(false);
    const [message, setMessage] = useState("");

    const [imageSelected, setImageSelected] = useState("");
    const [imagePreview, setImagePreview] = useState(def);

    const changeConfPassword = (e) => {
        changeFormData(e);
    };

    const changeFormData = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    };

    const handleImageChange = (e) => {
        setImageSelected(e.target.files[0]);
    };

    useEffect(() => {
        if (!!imageSelected) {
            const reader = new FileReader();
            reader.readAsDataURL(imageSelected);

            reader.onloadend = function (e) {
                setImagePreview(reader.result)
            };
        }
    }, [imageSelected]);


    const handleRegister = (e) => {
        e.preventDefault();

        setMessage("");
        setSuccessful(false);

        form.current.validateAll();

        if (checkBtn.current.context._errors.length === 0) {
            const formDataWithFile = new FormData();
            formDataWithFile.append("file", imageSelected);
            (!!formData.email) && formDataWithFile.append("email", formData.email);
            (!!formData.password) && formDataWithFile.append("password", formData.password);
            (!!formData.name) && formDataWithFile.append("name", formData.name);
            (!!formData.surname) && formDataWithFile.append("surname", formData.surname);
            (!!formData.phone) && formDataWithFile.append("phone", formData.phone);
            console.log(formData.email);
            console.log(formDataWithFile);
            AuthService.register(formDataWithFile).then(
                (response) => {
                    setMessage(response.data.message);
                    setSuccessful(true);
                },
                (error) => {
                    const resMessage = getErrorResponseMessage(error);
                    setMessage(resMessage);
                    setSuccessful(false);
                }
            );
        }
    };

    return (
        <div className="col-md-12">
            <div className="card card-container">
                <Form onSubmit={handleRegister} ref={form}>
                    {!successful && (<>
                            <div className="flex-form-group">
                                <div className="form-group w-50">
                                    <label htmlFor="photo">Photo</label>
                                    <Input
                                        id="file-selector"
                                        type="file"
                                        className="form-control"
                                        name="photo"
                                        accept="image/*"
                                        value={formData.photo}
                                        onChange={handleImageChange}
                                    />
                                </div>
                                <img
                                    id="image-preview"
                                    src={imagePreview}
                                    alt="profile-img"
                                    className="profile-img-card"
                                    style={{objectFit: "cover"}}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <Input
                                    type="text"
                                    className="form-control"
                                    name="email"
                                    value={formData.email}
                                    onChange={changeFormData}
                                    validations={[required, validEmail]}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <Input
                                    type="password"
                                    className="form-control"
                                    name="password"
                                    value={formData.password}
                                    onChange={changeFormData}
                                    validations={[required, vpassword]}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="confPassword">Confirm Password</label>
                                <Input
                                    type="password"
                                    className="form-control"
                                    name="confPassword"
                                    value={formData.confPassword}
                                    onChange={changeConfPassword}
                                    validations={[required, samePasswords]}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="name">Name</label>
                                <Input
                                    type="text"
                                    className="form-control"
                                    name="name"
                                    value={formData.name}
                                    onChange={changeFormData}
                                    validations={[required]}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Surname</label>
                                <Input
                                    type="text"
                                    className="form-control"
                                    name="surname"
                                    value={formData.surname}
                                    onChange={changeFormData}
                                    validations={[]}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="phone">Phone</label>
                                <Input
                                    type="number"
                                    className="form-control"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={changeFormData}
                                    validations={[validPhone]}
                                />
                            </div>

                            <div className="form-group mt-3">
                                <button className="btn btn-danger btn-block">Sign Up</button>
                            </div>
                        </>
                    )}

                    {message && (
                        <div>
                            {successful ?
                                (<MessageView alert_type="alert-success" message={message}/>)
                                :
                                (<div className={"alert alert-danger"} role="alert">
                                    {message}
                                </div>)
                            }
                        </div>
                    )}
                    <CheckButton style={{display: "none"}} ref={checkBtn}/>
                </Form>
            </div>
        </div>
    );
};

export default Register;