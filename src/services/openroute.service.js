import axios from "axios";
import OPENROUTE_API_KEY from "./credentials";

const API_URL = "https://api.openrouteservice.org/geocode/search?api_key=" + OPENROUTE_API_KEY;

const getLatLngFromAddress = (city, address, name) => {
    return axios.get(API_URL + "&boundary.country=PL&text=" + name + ", " + address + ", " + city + ", Polska");
};

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    getLatLngFromAddress
};