import axios from "axios";

const API = `${process.env.REACT_APP_API_URL}/api/vehicles`;

const vehicleService = {
    getAll: async (eCode) => {
        try {
            const res = await axios.get(API, { params: { eCode } });
            return Array.isArray(res.data) ? res.data : res.data.data || [];
        } catch (err) {
            console.error("Vehicle service error:", err);
            return [];
        }
    },

    create: async (eCode, driverId, data) => {
        try {
            const res = await axios.post(`${API}/create/${eCode}/${driverId}`, data);
            return res.data;
        } catch (err) {
            console.error("Vehicle create error:", err);
            return null;
        }
    },

    getDriverVehicles: async (driverId) => {
        try {
            const res = await axios.get(`${API}/driver/${driverId}`);
            return Array.isArray(res.data) ? res.data : res.data.data || [];
        } catch (err) {
            console.error("getDriverVehicles error:", err);
            return [];
        }
    },

    remove: async (id) => {
        try {
            await axios.delete(`${API}/${id}`);
        } catch (err) {
            console.error("Vehicle remove error:", err);
        }
    },
};

export default vehicleService;
