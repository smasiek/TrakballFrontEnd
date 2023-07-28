import {useAlert} from "react-alert";
import SquadService from "../services/squad.service";
import {useHistory} from 'react-router-dom';
import {TiContacts, TiUserAdd, TiUserDelete} from "react-icons/ti";
import {RiDeleteBin5Fill} from "react-icons/ri";
import {useEffect, useState} from "react";
import {generateAvatarUrl} from "../utils/PhotoUtils";
import {getErrorResponseMessage, unauthorizedErrorCheckAndHandle} from "../utils/ErrorHandlingUtils";

const Squad = (props) => {

    const alert = useAlert();
    const history = useHistory();

    const [date, setDate] = useState("");
    const [creatorPhoto, setCreatorPhoto] = useState("");
    const [vacancies, setVacancies] = useState(0);

    useEffect(() => {
        setVacancies(props.info.maxMembers - props.info.currentMembers);
    }, [props.info.maxMembers, props.info.currentMembers]);

    useEffect(() => {
        const dateString = new Date(props.info.date).toLocaleString();
        setDate(dateString.substr(0, dateString.length - 3));
    }, [props.info.date]);

    useEffect(() => {
        setCreatorPhoto(props.info.creator.photo || generateAvatarUrl(props.info.creator.name, props.info.creator.surname))
    }, [props.info.creator.name, props.info.creator.surname, props.info.creator.photo]);

    const handleShowDetailedInfo = () => {
        history.push("/squad/" + props.info.squad_id);
    };

    const handleJoinSquad = () => {
        SquadService.joinSquad(props.info.squad_id).then(
            () => {
                history.push("/your_squads");
            },
            (error) => {
                alert.error(getErrorResponseMessage(error));
                unauthorizedErrorCheckAndHandle(error);
            }
        );
    };

    const handleLeaveSquad = () => {
        SquadService.leaveSquad(props.info.squad_id).then(
            () => {
                window.location.reload();
            },
            (error) => {
                alert.error(getErrorResponseMessage(error));
            }
        );
    };

    const handleDeleteSquad = () => {
        SquadService.deleteSquad(props.info.squad_id).then(
            () => {
                window.location.reload();
            },
            (error) => {
                alert.error(getErrorResponseMessage(error));
            }
        );
    };

    const Footer = () => {
        return <div className="controls">
            {(props.board === "squads") ?
                <div>
                    <button onClick={handleShowDetailedInfo}><TiContacts style={{margin: '5px'}}/>Detailed info
                    </button>
                    <button onClick={handleJoinSquad}><TiUserAdd style={{margin: '5px'}}/>Join squad</button>
                </div>
                :
                <div>
                    <button onClick={handleShowDetailedInfo}><TiContacts style={{margin: '5px'}}/>Detailed info
                    </button>
                    <button onClick={handleLeaveSquad} style={{color: 'lightcoral'}}><TiUserDelete
                        style={{margin: '5px'}}/>Leave squad
                    </button>
                </div>
            }
            {props.mod && (
                <button onClick={handleDeleteSquad} style={{color: 'lightcoral'}}><RiDeleteBin5Fill
                    style={{margin: '5px'}}/>Delete</button>
            )
            }
        </div>
    };

    return (
        <div className="col-sm-12 col-md-6 col-lg-4 item" key={props.info.squad_id}>
            <div className="box">
                <div className="info">
                    <img className="rounded-circle user-photo" src={creatorPhoto} alt="creatorPhoto"/>
                    <h3 className="name">{props.info.creator.name} {props.info.creator.surname}</h3>
                    <p className="sport">{props.info.sport}</p>
                    <div className="description">
                        <p>Liczebność skladu: {props.info.maxMembers}</p>
                        <p>{vacancies === 1 ? 'Poszukiwany: 1 zawodnik' : 'Poszukiwanych: ' + vacancies + ' zawodników'}</p>
                        <p>Opłata: {props.info.fee.toFixed(2)} zł</p>
                        <p>Miejsce: {props.info.place.name}</p>
                        <p>Miasto: {props.info.place.city}</p>
                        <p>Ulica: {props.info.place.street}</p>
                        <p>Data: {date}</p>
                    </div>
                </div>
                <Footer/>
            </div>
        </div>
    );
};

export default Squad;