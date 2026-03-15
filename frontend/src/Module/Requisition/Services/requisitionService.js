import axios from "axios";

const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "http://localhost:8080"
});


// CREATE REQUISITION
export const createRequisition = async (data, department) => {

    try {

        const response = await API.post(
            "/api/vehicle-requisition",
            data,
            {
                headers: {
                    "Content-Type": "application/json",
                    department: (department || "PURCHASE").toUpperCase()
                }
            }
        );

        return response.data;

    } catch (error) {

        console.error("Create requisition failed:", error);

        throw error;
    }
};



// GET ALL REQUISITIONS
export const getRequisitions = async () => {

    try {

        const response = await API.get("/api/vehicle-requisition");

        return response.data;

    } catch (error) {

        console.error("Fetch requisitions failed:", error);

        throw error;
    }
};



// GET SMART GROUPS
export const getSmartGroups = async () => {

    try {

        const response = await API.get("/api/vehicle-requisition/smart-groups");

        return response.data;

    } catch (error) {

        console.error("Fetch smart groups failed:", error);

        throw error;
    }
};