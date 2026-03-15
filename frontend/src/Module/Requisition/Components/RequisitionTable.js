import axios from "axios";

const API = `${process.env.REACT_APP_API_URL}/api/vehicle-requisition`;

export const createRequisition = (data, department) => {
    return axios.post(API, data, {
        headers: {
            department: department
        }
    });
};

export const getRequisitions = () => {
    return axios.get(API);
};