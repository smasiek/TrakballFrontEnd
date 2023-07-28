import React, {useEffect, useRef, useState} from "react";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";
import {isEmail} from "validator";

import UserService from "../services/user.service";
import "../assets/css/squad.css";
import EditAuthentionModal from "./EditAuthentionModal";
import AuthService from "../services/auth.service";
import {generateAvatarUrl} from "../utils/PhotoUtils";
import {getErrorResponseMessage, unauthorizedErrorCheckAndHandle} from "../utils/ErrorHandlingUtils";

const validEmail = (value) => {
    if (value) {
        if (!isEmail(value)) {
            return (
                <div className="alert alert-danger" role="alert">
                    This is not a valid email.
                </div>
            );
        }
    }
};

const vpassword = (value) => {
    if (value) {
        if (value.length < 6 || value.length > 40) {
            return (
                <div className="alert alert-danger" role="alert">
                    The password must be between 6 and 40 characters.
                </div>
            );
        }
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

const EditProfile = (props) => {
    const form = useRef();
    const checkBtn = useRef();

    const currentUser = AuthService.getCurrentUser();
    const [formData, setFormData] = useState({});
    const [message, setMessage] = useState("");

    const [imageSelected, setImageSelected] = useState("");
    const [imagePreview, setImagePreview] = useState(undefined);

    const [modalShow, setModalShow] = useState(false);

    useEffect(() => {
        setImagePreview(currentUser.photo || generateAvatarUrl(currentUser.name, currentUser.surname))
    }, [currentUser.name, currentUser.photo, currentUser.surname])

    const changeFormData = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleEdit = (formData) => {
        setMessage("");

        form.current.validateAll();

        if (checkBtn.current.context._errors.length === 0) {
            const formDataWithFile = new FormData();
            formDataWithFile.append("file", imageSelected);
            (!!formData.email) && formDataWithFile.append("email", formData.email);
            (!!formData.password) && formDataWithFile.append("password", formData.password);
            (!!formData.name) && formDataWithFile.append("name", formData.name);
            (!!formData.surname) && formDataWithFile.append("surname", formData.surname);
            (!!formData.phone) && formDataWithFile.append("phone", formData.phone);
            (!!formData.oldEmail) && formDataWithFile.append("oldEmail", formData.oldEmail);
            (!!formData.oldPassword) && formDataWithFile.append("oldPassword", formData.oldPassword);
            UserService.editData(formDataWithFile).then(
                () => {
                    props.history.push("/profile");
                },
                (error) => {
                    const resMessage = getErrorResponseMessage(error);

                    setMessage(resMessage);
                    unauthorizedErrorCheckAndHandle(error);
                }
            );
        }
    };

    const handleEditRequest = (e) => {
        e.preventDefault();

        form.current.validateAll();

        if (checkBtn.current.context._errors.length === 0) {
            setModalShow(true)
        }
    };

    const handleImageChange = (e) => {
        setImageSelected(e.target.files[0]);
    }

    useEffect(() => {
        if (!!imageSelected) {
            const reader = new FileReader();
            reader.readAsDataURL(imageSelected);

            reader.onloadend = function (e) {
                setImagePreview(reader.result)
            };
        }
    }, [imageSelected])

    return (
        <div className="col-md-12">
            <div className="card card-container">
                <Form onSubmit={handleEditRequest} enctype="multipart/form-data" ref={form}>
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
                        <label htmlFor="email">New Email</label>
                        <Input
                            type="text"
                            className="form-control"
                            name="email"
                            value={formData.email}
                            onChange={changeFormData}
                            validations={[validEmail]}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">New Password</label>
                        <Input
                            type="password"
                            className="form-control"
                            name="password"
                            value={formData.password}
                            onChange={changeFormData}
                            validations={[vpassword]}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confPassword">Confirm Password</label>
                        <Input
                            type="password"
                            className="form-control"
                            name="confPassword"
                            value={formData.confPassword}
                            onChange={changeFormData}
                            validations={[samePasswords]}
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
                        />
                    </div>

                    <div className="form-group" style={{marginBottom: 0}}>

                        <button className="btn btn-danger btn-block">
                            Save
                        </button>
                    </div>

                    {message && (
                        <div className="form-group">
                            <div
                                className="alert alert-danger"
                                role="alert"
                            >
                                {message}
                            </div>
                        </div>
                    )}
                    <CheckButton style={{display: "none"}} ref={checkBtn}/>
                </Form>
                <EditAuthentionModal
                    show={modalShow}
                    onHide={() => setModalShow(false)}
                    formData={formData}
                    setFormData={changeFormData}
                    handleEdit={handleEdit}
                />
            </div>
        </div>
    );
};

export default EditProfile;