// src/Driver/Services/breakService.js
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL + "/api/driver-break";

// Handle break click: this just prepares for break
export const handleBreakClick = (tripId) => {
    console.log("Driver clicked Take Break for Trip:", tripId);
    // No prompt here — page will show input box for reason
};

// Start break: called when driver clicks Start Break after entering reason
export const startBreakService = async (tripId, reason) => {
    if (!reason || reason.trim() === "") {
        alert("Please enter break reason before starting break!");
        return;
    }

    try {
        const response = await axios.post(
            `${BASE_URL}/start`,
            null,
            { params: { tripId, reason } }
        );

        console.log("Break Started:", response.data);
        alert("Break started successfully!");

        return response.data;
    } catch (error) {
        console.error("Error starting break:", error);
        alert("Failed to start break. Check console for details.");
    }
};

// End break
export const endBreakService = async (tripId) => {
    try {
        const response = await axios.post(
            `${BASE_URL}/end`,
            null,
            { params: { tripId } }
        );

        console.log("Break Ended:", response.data);
        alert("Break ended successfully!");

        return response.data;
    } catch (error) {
        console.error("Error ending break:", error);
        alert("Failed to end break. Check console for details.");
    }
};

// Get total break time
export const getTotalBreakService = async (tripId) => {
    try {
        const response = await axios.get(
            `${BASE_URL}/total`,
            { params: { tripId } }
        );

        return response.data;
    } catch (error) {
        console.error("Error getting total break time:", error);
        throw error;
    }
};