// import axios from "axios";
//
// /**
//  * Base API instance
//  */
// const API = axios.create({
//     baseURL: "http://localhost:8080/api",
// });
//
// /**
//  * CREATE PROJECT (multipart/form-data for PDF upload)
//  */
// export const createProject = (formData) => {
//     console.log("📦 Sending project form data to backend:", formData);
//     return API.post("/projects/create", formData, {
//         headers: {
//             "Content-Type": "multipart/form-data",
//         },
//     })
//         .then((res) => {
//             console.log("✅ Project created successfully:", res.data);
//             return res;
//         })
//         .catch((err) => {
//             console.error("❌ Error creating project:", err);
//             throw err;
//         });
// };
//
// /**
//  * GET ALL PROJECTS
//  */
// export const getProjects = () => {
//     return API.get("/projects")
//         .then((res) => {
//             console.log("📂 Fetched projects:", res.data);
//             return res;
//         })
//         .catch((err) => {
//             console.error("❌ Error fetching projects:", err);
//             throw err;
//         });
// };
import axios from "axios";

const API = axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}/api`,
});

export const createProject = (formData) => {
    return API.post("/projects/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};

export const getProjects = () => {
    return API.get("/projects");
};
