import axios from "axios";
import userToken from "./user-token";
import authHeader from "./auth-header";

const API_URL = "http://localhost:8080/api/squads/";

const getSquadsBoard = () => {
    return axios.get(API_URL + "all", {headers: authHeader()});
};

const getSquadInfo = (squadId) => {
    return axios.get(API_URL, {headers: authHeader(), params: {squad_id: squadId}})
};

const getSquadMembers = (squadId) => {
    return axios.get(API_URL + "members", {headers: authHeader(), params: {squad_id: squadId}})
};

const getSecuredInfo = (squadId) => {
    return axios.get(API_URL + "secured", {headers: authHeader(), params: {squad_id: squadId}})
};

const verifyPassword = (squadId, password) => {
    return axios.get(API_URL + "verify", {headers: authHeader(), params: {squad_id: squadId, password: password}})
};

const getPlaceSquads = (placeId) => {
    return axios.get(API_URL + "place/all", {headers: authHeader(), params: {place_id: placeId}});
};

const joinSquad = (squadId) => {
    return axios.post(API_URL + "join", {}, {headers: authHeader(), params: {squad_id: squadId}});
};

const leaveSquad = (squadId) => {
    return axios.post(API_URL + "leave", {}, {headers: authHeader(), params: {squad_id: squadId}});
};

const deleteSquad = (squadId) => {
    return axios.delete(API_URL, {headers: authHeader(), data: {squad_id: squadId}});
};

const publish = (place, city, street, sport, date, fee, maxMembers, secured, password) => {
    return axios.post(API_URL, {
            place,
            city,
            street,
            sport,
            date,
            fee,
            maxMembers,
            secured,
            password,
        },
        {
            headers: authHeader(),
            params: {token: userToken()}
        });
};

const generateSquads = (squadRequests) => {
    return axios.post(API_URL + "all", {
            squadRequests
        },
        {
            headers: authHeader(),
            params: {token: userToken()}
        });
}

/* eslint import/no-anonymous-default-export: [2, {"allowObject": true}] */
export default {
    getSquadsBoard,
    getPlaceSquads,
    joinSquad,
    leaveSquad,
    deleteSquad,
    publish,
    getSquadInfo,
    getSquadMembers,
    getSecuredInfo,
    verifyPassword,
    generateSquads,
};