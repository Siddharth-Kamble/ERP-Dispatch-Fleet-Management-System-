import axios from "axios";

const BASE_URL = `${process.env.REACT_APP_API_URL}/vehicle-activities`;
const getActivitiesByVehicle = async (vehicleId) => {
    const response = await axios.get(`${BASE_URL}/vehicle/${vehicleId}`);
    return response.data;
};

const addActivity = async (vehicleId, activity) => {
    const response = await axios.post(`${BASE_URL}/vehicle/${vehicleId}`, activity);
    return response.data;
};

const updateActivity = async (activityId, activity) => {
    const response = await axios.put(`${BASE_URL}/${activityId}`, activity);
    return response.data;
};

export default {
    getActivitiesByVehicle,
    addActivity,
    updateActivity
};
