import {useParams} from 'react-router-dom';
import React, {useEffect, useState} from "react";
import "../assets/css/squad-info.css";
import SquadService from "../services/squad.service";
import SquadSecurity from "../components/SquadSecurity";
import SquadInfo from "../components/SquadInfo";
import AlertTemplate from "../components/AlertTemplate";
import {positions, Provider} from "react-alert";
import {unauthorizedErrorCheckAndHandle} from "../utils/ErrorHandlingUtils";

const BoardSquadInfo = () => {

    const {id} = useParams();
    const [secured, setSecured] = useState(true);

    useEffect(() => {
        SquadService.getSecuredInfo(id).then(
            (response) => {
                setSecured(response.data.message === 'true');
                if (response.data.message === 'true') {
                    document.getElementById("squad-password-form").style.display = "block";
                }
            },
            (error) => {
                unauthorizedErrorCheckAndHandle(error);
            }
        )
    }, [id]);

    const options = {
        timeout: 5000,
        position: positions.BOTTOM_CENTER,
    };

    return (
        <div className="squad-info pb-1">
            <div className="container-fluid">
                <div className="intro">
                    <h2 className="text-center">Squad Info</h2>
                </div>

                {secured &&
                <SquadSecurity squadId={id} setSecured={setSecured}/>
                }
                {!secured &&
                <Provider template={AlertTemplate} {...options}>
                    <SquadInfo squadId={id} secured={secured}/>
                </Provider>
                }
            </div>
        </div>
    );
};

export default BoardSquadInfo;