import defBuilding from "../assets/img/defPlace.jpg";
import Modal from 'react-bootstrap/Modal'
import {FaMapMarkedAlt} from "react-icons/all";
import {TiContacts, TiTimes, TiUserAdd, TiUserDelete} from "react-icons/ti";
import {RiDeleteBin5Fill} from "react-icons/ri";
import moment from "moment";
import React, {useEffect, useRef, useState} from "react";
import SquadService from "../services/squad.service";
import CommentService from "../services/comment.service";
import {useHistory} from "react-router-dom";
import AuthService from "../services/auth.service";
import {useAlert} from "react-alert";
import {Button} from "react-bootstrap";
import {generateAvatarUrl} from "../utils/PhotoUtils";
import {getErrorResponseMessage} from "../utils/ErrorHandlingUtils";
import LoadingIndicator from "./LoadingIndicator";

const SquadInfo = (props) => {

    const history = useHistory();
    const alert = useAlert();
    const squadId = useRef(props.squadId).current;

    const [loadingJoin, setLoadingJoin] = useState(false);
    const [loadingLeave, setLoadingLeave] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);

    const [place, setPlace] = useState({});
    const [creator, setCreator] = useState({});
    const [squad, setSquad] = useState({});

    const [modalShow, setModalShow] = useState(false);

    const [date, setDate] = useState("");
    const [comments, setComments] = useState([]);

    const [members, setMembers] = useState([]);

    const currentUser = AuthService.getCurrentUser();
    const [userId, setUserId] = useState(0);
    const [avatarUrl, setAvatarUrl] = useState("");

    useEffect(() => {
        if (!!currentUser) {
            setUserId(currentUser.id);
            setAvatarUrl(currentUser.photo || generateAvatarUrl(currentUser.name, currentUser.surname))
        }
    }, [currentUser]);

    const [userInSquad, setUserInSquad] = useState(false);

    const [count, setCount] = useState(0);

    const [comment, setComment] = useState("");
    const [cancelDisplay, setCancelDisplay] = useState("none");

    useEffect(() => {
        if (props.secured) {
            return;
        }
        SquadService.getSquadInfo(squadId).then(
            (response) => {
                setPlace(response.data.place);
                setCreator(response.data.creator);
                setSquad(response.data);

                const dateString = new Date(response.data.date).toLocaleString();
                setDate(dateString.substr(0, dateString.length - 3));
            },
            (error) => {
                alert.error(getErrorResponseMessage(error));
            }
        );
    }, [squadId, props.secured, alert]);

    useEffect(() => {
        if (props.secured) {
            return;
        }
        SquadService.getSquadMembers(squadId).then(
            (response) => {
                setMembers(response.data);
            },
            (error) => {
                alert.error(getErrorResponseMessage(error));
            }
        );
    }, [squadId, props.secured, alert]);

    useEffect(() => {
        members.forEach(member => {
            if (member.user_id === userId) {
                setUserInSquad(true);
            }
        })
    }, [members, userId]);

    useEffect(() => {
        if (props.secured) {
            return;
        }
        CommentService.getComments(squadId).then(
            (response) => {
                setComments(response.data)
                setCount(response.data.length);
            }
        )
    }, [squadId, props.secured]);

    const handlePostComment = (e) => {
        e.preventDefault();

        let currentTimeStamp = Date.now();

        (comment.length>0) && CommentService.postComment(squadId, comment, currentTimeStamp).then(
            (response) => {
                let tempComments = comments;
                tempComments.push({
                    "comment_id": response.data.comment_id,
                    "text": comment,
                    "date": currentTimeStamp,
                    "creator_id": userId,
                    "creator_name": currentUser.name,
                    "creator_surname": currentUser.surname,
                    "creator_avatar_url": avatarUrl,
                    "squad_id": squadId
                })
                setComments(tempComments);
                setComment("");
                setCount(tempComments.length);
                alert.success("You've posted a comment! 🙂");
            },
            (error) => {
                alert.error(getErrorResponseMessage(error));
            }
        );
    };

    const handleDeleteComment = (commentId) => {

        CommentService.deleteComment(commentId).then(
            (response) => {
                let tempComments = comments.filter(comment => comment.comment_id !== commentId);
                setComments(tempComments);
                setComment("");
                setCount(tempComments.length);
                alert.success(response.data.message);
            },
            (error) => {
                alert.error(getErrorResponseMessage(error));
            }
        );
    };

    const handleCommentChange = (e) => {
        setComment(e.target.value);
        if (e.target.value !== "") {
            setCancelDisplay("inherit");
        } else {
            setCancelDisplay("none");
        }
    };

    const handleSignIn = () => {
        history.push("/login");
    };

    const handleSignUp = () => {
        history.push("/register");
    };

    const handleCancel = (e) => {
        e.preventDefault();
        setComment("");
        setCancelDisplay("none");
    };

    const handleJoinSquad = (e) => {
        e.preventDefault();
        setLoadingJoin(true);

        SquadService.joinSquad(squadId).then(
            (response) => {
                members.push({
                    user_id: userId,
                    name: currentUser.name,
                    surname: currentUser.surname,
                    photo: currentUser.photo,
                    phone: currentUser.phone
                });
                setUserInSquad(true);
                alert.success(response.data.message);
                setLoadingJoin(false);
            },
            (error) => {
                alert.error(getErrorResponseMessage(error));
                setLoadingJoin(false);
            }
        );
    };

    const handleLeaveSquad = (e) => {
        e.preventDefault();
        setLoadingLeave(true);

        SquadService.leaveSquad(squadId).then(
            (response) => {
                setMembers(members.filter(member => member.user_id !== userId));
                setUserInSquad(false);
                alert.show(response.data.message);
                setLoadingLeave(false);
            },
            (error) => {
                alert.error(getErrorResponseMessage(error));
                setLoadingLeave(false);
            }
        );
    };

    const handleDeleteSquad = (e) => {
        e.preventDefault();
        setLoadingDelete(true);

        SquadService.deleteSquad(props.info.squad_id).then(
            () => {
                history.push("/squads");
                setLoadingDelete(false);
            },
            (error) => {
                alert.error(getErrorResponseMessage(error));
                setLoadingDelete(false);
            }
        );
    };

    const handleShowOnMap = () => {
        history.push("/home/" + place.latitude + "/" + place.longitude);
    };

    const handleContactOrganiser = () => setModalShow(true);

    const VerticallyCenteredModal = (props) => {
        return (
            <Modal
                {...props}
                size="md"
                aria-labelledby="contained-modal-title-vcenter"
                centered>
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Organiser contact
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h4><img className="rounded-circle user-photo w-25 m-3" src={creator.photo}
                             alt="creatorPhoto"/>{creator.name} {creator.surname}</h4>
                    <ul className="creator-contact">
                        <li><h6>Telefon:</h6><p>{creator.phone}</p></li>
                        <li><h6>E-mail:</h6><p>{creator.email}</p></li>
                    </ul>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={props.onHide}>Close</Button>
                </Modal.Footer>
            </Modal>
        );
    }

    return (
        <div id="squad-info-content" className="row">
            <div className="container-fluid col-md-7 col-sm-12">
                <div className="row">
                    <div className="container-fluid col-6">
                        <div className="place item" key={''}>
                            <div className="box">
                                <img className="place-photo" src={place.photo || defBuilding} alt="creatorPhoto"/>
                                <div className="place-footer">
                                    <h3 className="name">{place.name}</h3>
                                    <p>{place.street}, {place.city}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="container-fluid col-6" style={{maxHeight: "75vh"}}>
                        <div className="item squad">
                            <div className="box align-items-center" key={''}>
                                <div className="creator align-items-center" key={''} style={{display: "flex"}}>
                                    <img className="rounded-circle user-photo ml-3 mr-3" src={creator.photo}
                                         alt="creatorPhoto"/>
                                    <h4>{creator.name} {creator.surname}</h4>
                                </div>
                                <p>Sport: {squad.sport}</p>
                                <p>Liczebność skladu: {members.length}/{squad.maxMembers}</p>
                                <p>Opłata: {parseFloat(squad.fee).toFixed(2)} zł</p>
                                <p>Data: {date}</p>
                            </div>
                        </div>
                        <div className="item info " key={''}>
                            <h5 style={{textAlign: "start", marginLeft: "0.5em"}}>Members:</h5>
                            <div className="box">
                                <ul className="members">
                                    {members && members.map((member, index) =>
                                        <li key={member.comId}>
                                            <div className="member">
                                                <img className="rounded-circle user-photo"
                                                     src={member.photo || generateAvatarUrl(member.name, member.surname)}
                                                     alt="memberPhoto"/>
                                                <span className="ml-2">{member.name} {member.surname}</span>
                                            </div>
                                        </li>
                                    )}
                                    {members.length === 0 &&
                                    <div>
                                        <h6>Squad is empty</h6>
                                    </div>}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container-fluid col-md-5 col-sm-12">
                <div className="row">
                    <div className="controls">
                        <div className="flex-wrap">
                            <button onClick={() => handleContactOrganiser()}><TiContacts
                                style={{margin: '5px'}}/>Contact organiser
                            </button>
                            <VerticallyCenteredModal
                                show={modalShow}
                                onHide={() => setModalShow(false)}
                            />
                            <button className="" onClick={() => handleShowOnMap()}><FaMapMarkedAlt
                                style={{margin: '5px'}}/>Show on map
                            </button>
                            {currentUser &&
                            ((userInSquad) ?
                                    <button className="" onClick={handleLeaveSquad} style={{color: 'lightcoral'}}
                                            disabled={loadingLeave}>
                                        {loadingLeave && (<LoadingIndicator/>)}
                                        <TiUserDelete style={{margin: '5px'}}/>
                                        Leave squad
                                    </button>
                                    :
                                    (!userInSquad && members.length < squad.maxMembers) &&
                                    <button style={{color: 'forestgreen'}} onClick={handleJoinSquad}
                                            disabled={loadingJoin}>
                                        {loadingJoin && (<LoadingIndicator/>)}
                                        <TiUserAdd style={{margin: '5px'}}/>
                                        Join squad
                                    </button>
                            )
                            }
                            {currentUser && (currentUser.roles.includes("ROLE_ADMIN") || creator.user_id === userId) && (
                                <button onClick={handleDeleteSquad} style={{color: 'lightcoral'}}
                                        disabled={loadingDelete}>
                                    {loadingDelete && (<LoadingIndicator/>)}
                                    <RiDeleteBin5Fill style={{margin: '5px'}}/>
                                    Delete
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="container-fluid comment-section">
                        <h5 className="m-1">Comments: {count} </h5>
                        <div className="comment-form-row">
                            {(currentUser) ? (userInSquad) ?
                                <form className="comment-form" onSubmit={handlePostComment}>
                                    <img className="rounded-circle user-photo" src={avatarUrl}
                                         alt="creatorPhoto"/>
                                    <input type="text" className="comment-input ml-3 mr-3"
                                           placeholder={"Type your comment here."} value={comment}
                                           onChange={handleCommentChange}/>
                                    <input type="submit" className="btn btn-warning"/>
                                    <button className="btn btn-secondary ml-1" onClick={handleCancel}
                                            style={{display: cancelDisplay}}>Cancel
                                    </button>
                                </form> :
                                <div className="comment-form">
                                    <img className="rounded-circle user-photo" src={avatarUrl}
                                         alt="creatorPhoto"/>
                                    <span className="m-0">Join the squad to comment</span>
                                    <TiTimes/>
                                </div>
                                :
                                <div className="comment-form">
                                    <span className="m-0">Sign in to see comments</span>
                                    <div className="d-flex">
                                        <button className="btn btn-secondary" onClick={handleSignIn}>
                                            Sign in
                                        </button>
                                        <button className="btn btn-outline-secondary ml-1" onClick={handleSignUp}>
                                            Sign up
                                        </button>
                                    </div>
                                </div>
                            }
                        </div>
                        {currentUser && userInSquad && comments.length > 0 &&
                        <ul className="comments mt-2">
                            {comments && comments.map((comment, index) =>
                                <li key={comment.comment_id} className="comment">
                                    <div className="comment-content">
                                                <span>
                                                    {comment.text}
                                                </span>
                                        <div className="comment-info">
                                            <div>
                                                <img className="rounded-circle user-photo"
                                                     src={(comment.creator_avatar_url) ?
                                                         comment.creator_avatar_url :
                                                         generateAvatarUrl(comment.creator_name, comment.creator_surname)}
                                                     alt="creatorPhoto"/>
                                                <p className="ml-2">{comment.creator_name + ' ' + comment.creator_surname}</p>
                                            </div>
                                            <p className="ml-2">{moment(comment.date).format('DD-MM-YYYY HH:mm')}</p>
                                        </div>
                                    </div>
                                    {(userId === comment.creator_id) &&
                                    <button className="btn btn-danger remove-comment"
                                            onClick={() => handleDeleteComment(comment.comment_id)}><TiTimes/></button>}
                                </li>
                            )}
                        </ul>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SquadInfo;