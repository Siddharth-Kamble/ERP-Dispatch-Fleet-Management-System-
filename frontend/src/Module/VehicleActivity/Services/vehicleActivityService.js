import axios from "axios";

const API_BASE = `${process.env.REACT_APP_API_URL}/api/vehicle-activities`;

// ===== GET activities by vehicle =====
const getByVehicle = async (vehicleId) => {
    const res = await axios.get(`${API_BASE}/vehicle/${vehicleId}`);
    return res.data; // returns ONLY data
};

// ===== ADD activity =====
const addActivity = async (vehicleId, activity) => {
    const res = await axios.post(`${API_BASE}/vehicle/${vehicleId}`, activity);
    return res.data;
};

// ===== SET out time =====
const setOutTime = async (id) => {
    const res = await axios.put(`${API_BASE}/${id}/out-time`);
    return res.data;
};

// ===== DELETE =====
const deleteActivity = async (id) => {
    await axios.delete(`${API_BASE}/${id}`);
};

const vehicleActivityService = {
    getByVehicle,
    addActivity,
    setOutTime,
    deleteActivity,
};

export default vehicleActivityService;
