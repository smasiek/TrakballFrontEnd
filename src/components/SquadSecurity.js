import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";
import React, {useRef, useState} from "react";
import SquadService from "../services/squad.service";
import {getErrorResponseMessage} from "../utils/ErrorHandlingUtils";
import LoadingIndicator from "./LoadingIndicator";

const required = (value) => {
    if (!value) {
        return (
            <div className="alert alert-danger" role="alert">
                This field is required!
            </div>
        );
    }
};

const BoardSquadInfo = (props) => {

    const form = useRef();
    const checkBtn = useRef();

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const [password, setPassword] = useState("");

    const changePasswordInput = (e) => {
        setPassword(e.target.value);
    }

    const handlePassword = (e) => {
        e.preventDefault();
        setLoading(true);
        SquadService.verifyPassword(props.squadId, password).then(
            (response) => {
                props.setSecured(response.data.message !== 'true');
                setLoading(false);
            },
            (error) => {
                setMessage(getErrorResponseMessage(error));
                setLoading(false);
            }
        )
    };

    return (
        <div id="squad-password-form" className="card card-container" style={{display: "none"}}>
            <Form onSubmit={handlePassword} ref={form}>
                <h4 className="text-center">Squad is secured</h4>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <Input
                        type="password"
                        className="form-control"
                        name="password"
                        placeholder="type in password..."
                        value={password}
                        onChange={changePasswordInput}
                        validations={[required]}
                    />
                </div>

                <div className="form-group">
                    <button className="btn btn-danger btn-block" disabled={loading}>
                        {loading && (
                            <LoadingIndicator/>
                        )}
                        <span>Enter</span>
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

export default BoardSquadInfo;