import React, { useState } from "react";
import axios from "axios";

const VehicleImageUploader = ({ tripId, onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            alert("Please select an image first!");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("tripId", tripId);

        try {
            setLoading(true);
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/vehicle-images/upload`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            alert(response.data); // show backend success message
            setFile(null);
            onUploadSuccess?.(); // optional callback
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Failed to upload image.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "12px" }}>
            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ border: "1px solid #cbd5e1", borderRadius: "6px", padding: "6px" }}
            />
            <button
                onClick={handleUpload}
                disabled={loading}
                style={{
                    backgroundColor: "#3b82f6",
                    color: "#fff",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    fontWeight: "600",
                    cursor: "pointer",
                }}
            >
                {loading ? "Uploading..." : "Upload"}
            </button>
        </div>
    );
};

export default VehicleImageUploader;