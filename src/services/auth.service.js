import axios from "axios";

const API_URL = "http://localhost:8080/api/auth/";

const register = (file) => {
    return axios.post(API_URL + "signup", file);
};

const login = (email, password) => {
    return axios.post(API_URL + "login", {email, password,}).then(
        (response) => {
            if (response.data.accessToken) {
                localStorage.setItem("user", JSON.stringify(response.data));
            }
            return response.data;
        });
};

const logout = () => {
    localStorage.removeItem("user");
};

const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem("user"));
};
/* eslint import/no-anonymous-default-export: [2, {"allowObject": true}] */
export default {
    register,
    login,
    logout,
    getCurrentUser,
};