import axios from "axios";

const API = `${process.env.REACT_APP_API_URL}/api/vehicles`;

/*
   Fetch vehicles assigned to driver using eCode
*/
const getDriverVehicles = async (eCode) => {
    const res = await axios.get(`${API}/assigned?eCode=${eCode}`);
    return res.data;
};

export default {
    getDriverVehicles,
};
