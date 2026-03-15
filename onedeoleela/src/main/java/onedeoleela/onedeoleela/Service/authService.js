import axios from "axios";

export const login = (eCode, password) => {
    return axios.post(
        "http://localhost:8080/api/auth/login",
        null,
        {
            params: {
                eCode: eCode,
                password: password
            }
        }
    );
};
