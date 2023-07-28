import EventBus from "../common/EventBus";

export function getErrorResponseMessage(error) {
    console.log(error.response)
    return (error.response &&
        error.response.data &&
        error.response.data.message) ||
        error.message ||
        error.toString()
}

export function unauthorizedErrorCheckAndHandle(error) {
    if (error.response && error.response.status === 401) {
        EventBus.dispatch("logout");
    }
}