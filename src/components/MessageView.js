import React from "react";
import {useHistory} from "react-router-dom";
import AuthService from "../services/auth.service";

const MessageView = (props) => {

    const history = useHistory();
    const currentUser = AuthService.getCurrentUser();

    return (
        <div className={"alert mb-0 " + props.alert_type}
             style={{display: "flex", flexDirection: "column", alignItems: "center"}}
             role="alert">
            {props.message}
            {(currentUser == null) && <button className="btn btn-danger mt-3" onClick={() =>
                history.push("/login")}>Try to login!
            </button>
            }
        </div>);
};

export default MessageView;