import React, { useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const ProjectLogAndUpload = () => {

  const [dispatchDetails, setDispatchDetails] = useState({
    projectName: "",
    dcNo: "",
    workOrderNumber: "",
    codeNo: "",
    tripId: ""
  });

  const [file, setFile] = useState(null);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setDispatchDetails(prev => ({ ...prev, [name]: value }));
  };

  // Submit Project Log
  const submitProjectLog = async () => {
    try {
      if (!dispatchDetails.projectName || !dispatchDetails.tripId) {
        alert("Please fill Project Name and Trip ID");
        return;
      }

      await axios.post(`${API_URL}/logs`, {
        ...dispatchDetails,
        tripId: parseInt(dispatchDetails.tripId)
      });

      alert("✅ Project Log Submitted Successfully!");
    } catch (error) {
      console.error(error);
      alert("❌ Failed to submit project log");
    }
  };

  // Handle file select
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Upload Excel
  const uploadExcel = async () => {
    try {
      if (!file || !dispatchDetails.tripId || !dispatchDetails.projectName) {
        alert("Please select file, tripId and project");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      await axios.post(
        `${API_URL}/windows/trip/${dispatchDetails.tripId}/bulk-upload?projectName=${dispatchDetails.projectName}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" }
        }
      );

      alert("✅ Excel Uploaded Successfully!");
    } catch (error) {
      console.error(error);
      alert("❌ Upload failed");
    }
  };

  return (
    <div style={{ padding: "30px", maxWidth: "600px", margin: "auto" }}>

      {/* PROJECT LOG FORM */}
      <h2>Submit Project Log</h2>

      <input name="projectName" placeholder="Project Name" onChange={handleChange} /><br /><br />
      <input name="dcNo" placeholder="DC No" onChange={handleChange} /><br /><br />
      <input name="workOrderNumber" placeholder="Work Order Number" onChange={handleChange} /><br /><br />
      <input name="codeNo" placeholder="Code No" onChange={handleChange} /><br /><br />
      <input name="tripId" type="number" placeholder="Trip ID" onChange={handleChange} /><br /><br />

      <button onClick={submitProjectLog}>Submit Log</button>

      <hr style={{ margin: "30px 0" }} />

      {/* EXCEL UPLOAD */}
      <h2>Upload Excel File</h2>

      <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} /><br /><br />

      <button onClick={uploadExcel}>Upload Excel</button>

    </div>
  );
};

export default ProjectLogAndUpload;