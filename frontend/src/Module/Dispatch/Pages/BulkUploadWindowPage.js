

import React, { useState, useEffect } from "react";
import axios from "axios";

// --- Professional SVG Icons ---
const IconTruck = () => <svg style={{width: '24px', marginRight: '10px'}} fill="none" stroke="#2563eb" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 8v2m-2 4h10"/></svg>;
const IconCloud = () => <svg style={{width: '32px', color: '#94a3b8', marginBottom: '10px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>;
const IconCheck = () => <svg style={{width: '18px', marginRight: '8px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>;

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const ProjectLogAndUpload = () => {
  const [projects, setProjects] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const [dispatchDetails, setDispatchDetails] = useState({
    projectId: "",
    dcNo: "",
    workOrderNumber: "",
    codeNo: "",
    tripId: ""
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  /* ================= RESET FORM FUNCTION ================= */
  const resetForm = () => {
    setDispatchDetails({
      projectId: "",
      dcNo: "",
      workOrderNumber: "",
      codeNo: "",
      tripId: ""
    });
    setFile(null);
    setUploadProgress(0);
  };

  /* ================= INTERNAL LOGIC (UNCHANGED) ================= */
  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${API_URL}/projects`);
      setProjects(res.data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDispatchDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadProgress(0);
  };

  const submitProjectLog = async () => {
    try {
      const { projectId, tripId } = dispatchDetails;
      if (!projectId || !tripId) {
        alert("Please select Project and Trip ID");
        return;
      }
      setLoading(true);
      const selectedProject = projects.find(p => p.projectId === Number(projectId));
      const payload = {
        projectName: selectedProject?.projectName,
        dcNo: dispatchDetails.dcNo,
        workOrderNumber: dispatchDetails.workOrderNumber,
        codeNo: dispatchDetails.codeNo,
        tripId: Number(tripId)
      };
      await axios.post(`${API_URL}/logs`, payload);
      localStorage.setItem("tripId", tripId);
      localStorage.setItem("projectId", projectId);
      alert("✅ Project Log Submitted Successfully!");
    } catch (error) {
      console.error(error);
      alert("❌ Failed to submit project log");
    } finally {
      setLoading(false);
    }
  };

  const uploadExcel = async () => {
    try {
      const storedTripId = localStorage.getItem("tripId");
      const storedProjectId = localStorage.getItem("projectId");
      if (!file || !storedTripId || !storedProjectId) {
        alert("Please submit project log first and select file");
        return;
      }

      setLoading(true);
      let interval = setInterval(() => {
        setUploadProgress((prev) => (prev < 90 ? prev + 10 : prev));
      }, 200);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("projectId", storedProjectId);

      const res = await axios.post(`${API_URL}/windows/trip/${storedTripId}/bulk-upload`, formData);

      clearInterval(interval);
      setUploadProgress(100);

      setTimeout(() => {
        setShowSuccess(true);
        setLoading(false);
        resetForm(); // Auto-Reset after success
      }, 500);

    } catch (error) {
      console.error("Upload Error:", error);
      alert(error.response?.data || "❌ Upload failed");
      setLoading(false);
      setUploadProgress(0);
    }
  };

  /* ================= CLEAN LIGHT UI STYLES ================= */

  const containerStyle = {
    minHeight: "100vh",
    padding: "60px 20px",
    backgroundColor: "#f9fafb", // Clean light background
    fontFamily: "'Inter', sans-serif",
    color: "#1f2937",
  };

  const cardStyle = {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "32px",
    marginBottom: "24px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
  };

  const labelStyle = {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "#4b5563",
    marginBottom: "6px"
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    marginBottom: "20px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    backgroundColor: "#ffffff",
    color: "#1f2937",
    outline: "none",
    fontSize: "14px",
    boxSizing: "border-box",
    transition: "border-color 0.2s"
  };

  const progressBarStyle = {
    width: "100%",
    height: "6px",
    backgroundColor: "#f3f4f6",
    borderRadius: "10px",
    marginTop: "12px",
    overflow: "hidden"
  };

  const progressFillStyle = {
    width: `${uploadProgress}%`,
    height: "100%",
    backgroundColor: "#2563eb",
    transition: "width 0.4s ease-out"
  };

  const primaryBtnStyle = {
    width: "100%",
    padding: "14px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontWeight: "700",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.2s"
  };

  const secondaryBtnStyle = {
    width: "100%",
    padding: "14px",
    borderRadius: "8px",
    border: "none",
    cursor: file && !loading ? "pointer" : "not-allowed",
    fontWeight: "700",
    backgroundColor: file ? "#10b981" : "#9ca3af",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <div style={containerStyle}>
      <div style={{ maxWidth: "600px", margin: "auto" }}>

        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px" }}>
            <IconTruck />
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#2563eb", letterSpacing: "1px" }}>DISPATCH MODULE</span>
          </div>
          <h1 style={{ fontSize: "32px", fontWeight: "800", color: "#111827", margin: 0 }}>Logistics Portal</h1>
          <p style={{ color: "#6b7280", marginTop: "8px" }}>Submit trip manifests and synchronize data</p>
        </div>

        {/* STEP 1 */}
        <div style={cardStyle}>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px'}}>
             <h2 style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>1. Dispatch Registration</h2>
             <span style={{color: '#2563eb', fontSize: '11px', fontWeight: '800'}}>STEP 01</span>
          </div>

          <label style={labelStyle}>Project Selection</label>
          <select name="projectId" value={dispatchDetails.projectId} onChange={handleChange} style={inputStyle}>
            <option value="">-- Choose Project --</option>
            {projects.map(p => <option key={p.projectId} value={p.projectId}>{p.projectName}</option>)}
          </select>

          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
            <div>
                <label style={labelStyle}>DC Number</label>
                <input name="dcNo" value={dispatchDetails.dcNo} placeholder="e.g. DC-001" style={inputStyle} onChange={handleChange} />
            </div>
            <div>
                <label style={labelStyle}>Work Order</label>
                <input name="workOrderNumber" value={dispatchDetails.workOrderNumber} placeholder="e.g. WO-500" style={inputStyle} onChange={handleChange} />
            </div>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
            <div>
                <label style={labelStyle}>Code No</label>
                <input name="codeNo" value={dispatchDetails.codeNo} placeholder="Code" style={inputStyle} onChange={handleChange} />
            </div>
            <div>
                <label style={labelStyle}>Trip ID</label>
                <input name="tripId" value={dispatchDetails.tripId} type="number" placeholder="Numeric ID" style={inputStyle} onChange={handleChange} />
            </div>
          </div>

          <button style={primaryBtnStyle} onClick={submitProjectLog} disabled={loading}>
            {loading ? "Processing..." : <><IconCheck /> Save Dispatch Log</>}
          </button>
        </div>

        {/* STEP 2 */}
        <div style={cardStyle}>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px'}}>
             <h2 style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>2. Excel Manifest Sync</h2>
             <span style={{color: '#10b981', fontSize: '11px', fontWeight: '800'}}>STEP 02</span>
          </div>

          <div style={{
            border: "2px dashed #d1d5db",
            borderRadius: "12px",
            padding: "30px",
            textAlign: "center",
            backgroundColor: "#f9fafb",
            position: 'relative',
            marginBottom: '20px'
          }}>
            <IconCloud />
            <p style={{ fontSize: '14px', color: file ? '#111827' : '#6b7280', fontWeight: file ? '600' : '400' }}>
              {file ? file.name : "Click to select Excel file"}
            </p>
            <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} style={{ opacity: 0, position: 'absolute', inset: 0, cursor: 'pointer' }} />
          </div>

          {loading && (
            <div style={{marginBottom: '20px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280', marginBottom: '5px'}}>
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div style={progressBarStyle}>
                <div style={progressFillStyle}></div>
              </div>
            </div>
          )}

          <button style={secondaryBtnStyle} onClick={uploadExcel} disabled={loading || !file}>
            {loading ? "Syncing..." : "Upload Manifest"}
          </button>
        </div>

        {/* SUCCESS OVERLAY */}
        {showSuccess && (
          <div style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
            backdropFilter: 'blur(4px)'
          }}>
            <div style={{textAlign: 'center', backgroundColor: '#ffffff', padding: '48px', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #e5e7eb'}}>
              <div style={{backgroundColor: '#d1fae5', color: '#059669', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px'}}>
                <IconCheck />
              </div>
              <h2 style={{fontSize: '24px', fontWeight: '800', color: '#111827', marginBottom: '8px'}}>Upload Successful!</h2>
              <p style={{color: '#6b7280', marginBottom: '32px'}}>Your manifest has been registered. The form has been reset for the next entry.</p>
              <button
                onClick={() => setShowSuccess(false)}
                style={{...primaryBtnStyle, width: 'auto', padding: '12px 32px', margin: '0 auto'}}
              >
                Continue
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProjectLogAndUpload;