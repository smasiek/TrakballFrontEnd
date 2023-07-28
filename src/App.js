import React, {useCallback, useEffect, useState} from "react";
import {Link, Route, Switch, useHistory} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import {Nav, Navbar} from "react-bootstrap";
import "./assets/css/App.css";
import logo from './assets/img/Logo big.png';
import AuthService from "./services/auth.service";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./views/Home";
import Profile from "./components/Profile";
import BoardSquads from "./views/BoardSquads";
import BoardSquadInfo from "./views/BoardSquadInfo";
import BoardYourSquads from "./views/BoardYourSquads";
import BoardAddNewSquad from "./views/BoardAddNewSquad";
import BoardYourPlaces from "./views/BoardYourPlaces";
import EditProfile from "./components/EditProfile";
import BoardAddNewPlace from "./views/BoardAddNewPlace";
import BoardAdmin from "./views/BoardAdmin";
import EventBus from "./common/EventBus";

const App = () => {
    const [showUserBoards, setShowYourSquadsBoard] = useState(false);
    const [showAdminBoard, setShowAdminBoard] = useState(false);
    const [currentUser, setCurrentUser] = useState(undefined);
    const history = useHistory();

    const logIn = useCallback(() => {
        setCurrentUser(AuthService.getCurrentUser());
    }, []);

    const logOut = useCallback(() => {
        AuthService.logout();
        setCurrentUser(undefined);
        setShowYourSquadsBoard(false);
        setShowAdminBoard(false);
        history.push("/login", {message: "You need to be logged in to access this resource"});
    }, [history]);

    useEffect(() => {
        if (currentUser) {
            setShowYourSquadsBoard(currentUser.roles.includes("ROLE_USER"));
            setShowAdminBoard(currentUser.roles.includes("ROLE_ADMIN"));
        } else {
            setShowYourSquadsBoard(false);
            setShowAdminBoard(false);
        }
        EventBus.on("login", () => {
            logIn();
        });

        EventBus.on("logout", () => {
            logOut();
        });

        return () => {
            EventBus.remove("login");
            EventBus.remove("logout");
        };
    }, [currentUser, logIn, logOut])

    useEffect(() => {
        const user = AuthService.getCurrentUser();
        setCurrentUser(user);
    }, [])

    return (
        <div style={{display: "flex"}}>
            <Navbar collapseOnSelect expand="lg" bg="success" variant="dark">

                <Navbar.Brand href={"/"}>
                    <img src={logo} alt="Logo" style={{height: '6vh'}}/>
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="responsive-navbar-nav"/>
                <Navbar.Collapse id="responsive-navbar-nav">

                    <Nav className="mr-auto">

                        <Nav.Link as={Link} to={"/home"}>Home</Nav.Link>
                        <Nav.Link as={Link} to={"/squads"}>Squads</Nav.Link>
                        {showUserBoards && (
                            [<Nav.Link as={Link} to={"/your_squads"}>Your squads</Nav.Link>,
                                <Nav.Link as={Link} to={"/your_places"}>Your places</Nav.Link>])
                        }
                        {currentUser && (
                            <Nav.Link as={Link} to={"/new_squad"}>New squad</Nav.Link>
                        )}

                        {currentUser ? ([
                                <Nav.Link as={Link} to={"/profile"}>Your profile</Nav.Link>,
                                <Nav.Link as={Link} to={"/login"} onClick={() => {
                                    AuthService.logout()
                                    setCurrentUser(undefined);
                                }}>Log out</Nav.Link>
                            ]
                        ) : (
                            [<Nav.Link as={Link} to={"/login"}>Login</Nav.Link>,
                                <Nav.Link as={Link} to={"/register"}>Sign up</Nav.Link>]
                        )}

                        {showAdminBoard && (
                            <Nav.Link as={Link} to={"/admin_board"}>Admin board</Nav.Link>
                        )}
                    </Nav>
                </Navbar.Collapse>

            </Navbar>
            <div className="container-xl content">
                <Switch>
                    <Route exact path={["/", "/home"]} component={Home}/>
                    <Route path="/home/:lat/:lng" component={Home}/>
                    <Route exact path="/login" component={Login}/>
                    <Route exact path="/register" component={Register}/>
                    <Route exact path="/profile" component={Profile}/>
                    <Route exact path="/edit_profile" component={EditProfile}/>
                    <Route path="/squad/:id" component={BoardSquadInfo}/>
                    <Route path="/squads/:id" component={BoardSquads}/>
                    <Route path="/squads" component={BoardSquads}/>
                    <Route path="/your_squads" component={BoardYourSquads}/>
                    <Route path="/your_places" component={BoardYourPlaces}/>
                    <Route path="/new_place" component={BoardAddNewPlace}/>
                    <Route path="/new_squad" component={BoardAddNewSquad}/>
                    <Route path="/admin_board" component={BoardAdmin}/>
                </Switch>
            </div>
        </div>
    );
};

export default App;