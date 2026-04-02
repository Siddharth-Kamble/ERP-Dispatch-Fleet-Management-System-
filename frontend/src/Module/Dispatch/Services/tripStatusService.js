

import axios from "axios";

const BASE_URL = `${process.env.REACT_APP_API_URL}/api/trip-status-update`;

const validateTripId = (tripId) => {
    if (!tripId) {
        console.error("Trip ID missing:", tripId);
        throw new Error("Trip ID missing");
    }
};

// Get driver trips
const getDriverTrips = async (eCode) => {
    console.log("Fetching driver trips for:", eCode);
    const res = await axios.get(`${BASE_URL}/driver/${eCode}`);
    return res.data;
};

// Acknowledge trip
const acknowledgeTrip = async (tripId) => {
    validateTripId(tripId);

    console.log("Acknowledging trip:", tripId);

    const res = await axios.patch(
        `${BASE_URL}/trip/${tripId}/acknowledge`,
        {} // send empty body to avoid Spring 400
    );

    return res.data;
};

// Update trip status
const updateTripStatus = async (tripId, status) => {
    validateTripId(tripId);

    console.log("Updating trip status:", tripId, status);

    const res = await axios.patch(
        `${BASE_URL}/trip/${tripId}/status`,
        {},
        { params: { status } }
    );

    return res.data;
};

// Get latest status
const getTripStatus = async (tripId) => {
    validateTripId(tripId);

    const res = await axios.get(`${BASE_URL}/trip/${tripId}/latest`);
    return res.data;
};

export default {
    getDriverTrips,
    acknowledgeTrip,
    updateTripStatus,
    getTripStatus
};