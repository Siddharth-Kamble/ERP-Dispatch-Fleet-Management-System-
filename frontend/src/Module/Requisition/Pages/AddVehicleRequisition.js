import React, { useState } from "react";
import { createRequisition } from "../Services/requisitionService";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

function AddVehicleRequisition() {

    const storedUser =
        JSON.parse(localStorage.getItem("user") || "{}");

    const loginUserName =
        storedUser?.fullName || "Unknown User";

    const department =
        storedUser?.role || "PURCHASE";

    const [form, setForm] = useState({
        requisitionBy: loginUserName,
        requisitionDate: "",
        requisitionTime: "",
        projectName: "",
        locationFrom: "",
        locationTo: "",
        startLat: null,
        startLng: null,
        endLat: null,
        endLng: null
    });

    const [file, setFile] = useState(null);
    const [message, setMessage] = useState("");



    // ================= HANDLE INPUT =================

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };



    // ================= GEOCODE CITY =================

    const getCoordinates = async (city) => {

        try {

            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${city}`
            );

            const data = await res.json();

            if (data.length > 0) {

                return {
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon)
                };
            }

        } catch (error) {

            console.error("Geocode failed", error);
        }

        return null;
    };



    // ================= SUBMIT =================

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            // GET COORDINATES
            const start = await getCoordinates(form.locationFrom);
            const end = await getCoordinates(form.locationTo);

            const payload = {
                ...form,
                startLat: start?.lat,
                startLng: start?.lng,
                endLat: end?.lat,
                endLng: end?.lng
            };

            // CREATE REQUISITION
            const response =
                await createRequisition(payload, department);

            const requisitionNo =
                response?.requisitionNo;


            // FILE UPLOAD
            if (file && requisitionNo) {

                const formData = new FormData();

                formData.append("file", file);
                formData.append("eCode", storedUser?.eCode);
                formData.append("requisitionNo", requisitionNo);

                await fetch(
                    `${API_URL}/api/files/upload`,
                    {
                        method: "POST",
                        body: formData
                    }
                );
            }


            setMessage("✅ Requisition Created Successfully!");


            setForm({
                requisitionBy: loginUserName,
                requisitionDate: "",
                requisitionTime: "",
                projectName: "",
                locationFrom: "",
                locationTo: "",
                startLat: null,
                startLng: null,
                endLat: null,
                endLng: null
            });

            setFile(null);

        } catch (error) {

            console.error(error);

            setMessage("❌ Failed to Create Requisition");
        }
    };



    return (

        <div style={styles.container}>

            <div style={styles.card}>

                <h2 style={styles.title}>
                    Create Vehicle Requisition
                </h2>

                {message &&
                    <p style={styles.message}>{message}</p>
                }

                <form onSubmit={handleSubmit}>

                    <div style={styles.grid}>

                        <div style={styles.group}>
                            <label style={styles.label}>Requested By</label>
                            <input
                                style={styles.input}
                                name="requisitionBy"
                                value={form.requisitionBy}
                                readOnly
                            />
                        </div>

                        <div style={styles.group}>
                            <label style={styles.label}>Date</label>
                            <input
                                style={styles.input}
                                type="date"
                                name="requisitionDate"
                                value={form.requisitionDate}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div style={styles.group}>
                            <label style={styles.label}>Time</label>
                            <input
                                style={styles.input}
                                type="time"
                                name="requisitionTime"
                                value={form.requisitionTime}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div style={styles.group}>
                            <label style={styles.label}>Project Name</label>
                            <input
                                style={styles.input}
                                name="projectName"
                                value={form.projectName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div style={styles.group}>
                            <label style={styles.label}>Location From</label>
                            <input
                                style={styles.input}
                                name="locationFrom"
                                value={form.locationFrom}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div style={styles.group}>
                            <label style={styles.label}>Location To</label>
                            <input
                                style={styles.input}
                                name="locationTo"
                                value={form.locationTo}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div style={{...styles.group, gridColumn:"span 2"}}>
                            <label style={styles.label}>Attach Document</label>
                            <input
                                style={styles.input}
                                type="file"
                                onChange={(e) =>
                                    setFile(e.target.files[0])
                                }
                            />
                        </div>

                    </div>

                    <button
                        style={styles.button}
                        type="submit"
                    >
                        Create Requisition
                    </button>

                </form>

            </div>

        </div>
    );
}

export default AddVehicleRequisition;



// ================= STYLES =================

const styles = {

container:{
display:"flex",
justifyContent:"center",
padding:"40px",
background:"#f5f7fb",
minHeight:"100vh"
},

card:{
background:"#fff",
padding:"30px 40px",
borderRadius:"10px",
boxShadow:"0 4px 20px rgba(0,0,0,0.08)",
width:"700px"
},

title:{
marginBottom:"25px",
color:"#333"
},

grid:{
display:"grid",
gridTemplateColumns:"1fr 1fr",
gap:"18px"
},

group:{
display:"flex",
flexDirection:"column"
},

label:{
fontWeight:"500",
marginBottom:"6px"
},

input:{
padding:"10px",
border:"1px solid #ccc",
borderRadius:"6px",
fontSize:"14px"
},

button:{
marginTop:"25px",
padding:"12px",
width:"100%",
background:"#2563eb",
color:"white",
border:"none",
borderRadius:"6px",
fontSize:"15px",
cursor:"pointer"
},

message:{
marginBottom:"15px",
fontWeight:"500"
}

};