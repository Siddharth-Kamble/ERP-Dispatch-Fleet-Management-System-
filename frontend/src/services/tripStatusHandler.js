// import axios from "axios";
//
// const BASE_URL = "http://localhost:8080/api/trip-status-update";
//
// export const acknowledgeTrip = async (tripId) => {
//     if (!tripId) throw new Error("Trip ID missing");
//
//     return axios.patch(`${BASE_URL}/trip/${tripId}/acknowledge`);
// };
//
// export const updateTripStatus = async (tripId, status) => {
//     if (!tripId) throw new Error("Trip ID missing");
//
//     return axios.patch(
//         `${BASE_URL}/trip/${tripId}/status`,
//         null,
//         { params: { status } }
//     );
// };
//
// export const getDriverTrips = async (eCode) => {
//     return axios.get(`${BASE_URL}/driver/${eCode}`);
// };


import axios from "axios";

const BASE_URL = `${process.env.REACT_APP_API_URL}/api/trip-status-update`;

export const createTripStatus = async (tripId) => {
    if (!tripId) throw new Error("Trip ID missing");

    return axios.post(`${BASE_URL}/trip/${tripId}/create`);
};

export const acknowledgeTrip = async (tripId) => {
    if (!tripId) throw new Error("Trip ID missing");

    return axios.patch(`${BASE_URL}/trip/${tripId}/acknowledge`);
};

export const updateTripStatus = async (tripId, status) => {
    if (!tripId) throw new Error("Trip ID missing");

    return axios.patch(
        `${BASE_URL}/trip/${tripId}/status`,
        null,
        { params: { status } }
    );
};

export const getDriverTrips = async (eCode) => {
    return axios.get(`${BASE_URL}/driver/${eCode}`);
};