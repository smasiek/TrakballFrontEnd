import axios from "axios";
import authHeader from "./auth-header";

const API_URL = "http://localhost:8080/api/comments/";

const getComments = (squadId) => {
    return axios.get(API_URL, {headers: authHeader(), params: {squad_id: squadId}})
};

const postComment = (squadId, text, date) => {
    return axios.post(API_URL, {text, date}, {headers: authHeader(), params: {squad_id: squadId}});
};

const deleteComment = (commentId) => {
    return axios.delete(API_URL, {headers: authHeader(), data: {comment_id: commentId}});
};

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    getComments,
    postComment,
    deleteComment,
};