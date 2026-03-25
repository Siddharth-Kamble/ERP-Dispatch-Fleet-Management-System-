

import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const WindowManager = () => {
  const [windows, setWindows] = useState([]);
  const [selectedWindow, setSelectedWindow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [floors, setFloors] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState("");
  const [flats, setFlats] = useState([]);
  const [flatNumber, setFlatNumber] = useState("");
  const [projects, setProjects] = useState([]);
  const [dispatchDetails, setDispatchDetails] = useState({
    projectName: "",
    dcNo: "",
    workOrderNumber: "",
    codeNo: "",
    tripId: ""
  });

  const initialState = {
    windowSeriesNumber: "",
    location: "",
    wcodeNo: "",
    jobCardNo: "",
    series: "",
    description: "",
    width: "",
    height: "",
    trackOuter: "",
    bottomFix: "",
    glassShutter: "",
    meshShutter: "",
    units: "",
    sqft: "",
    remark: ""
  };

  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    getAllWindows();
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_URL}/projects`);
      setProjects(response.data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setProjects([]);
    }
  };

  const fetchDispatchDetails = async (tripId) => {
    if (!tripId) return;
    try {
      const response = await axios.get(`${API_URL}/logs/trip/${tripId}`);
      if (response.data) {
        setDispatchDetails(prev => ({
          ...prev,
          projectName: response.data.projectName || prev.projectName,
          dcNo: response.data.dcNo || prev.dcNo,
          workOrderNumber: response.data.workOrderNumber || prev.workOrderNumber,
          codeNo: response.data.codeNo || prev.codeNo,
          tripId: tripId
        }));
      }
    } catch (error) {
      console.error("Error fetching trip details:", error);
    }
  };

  const handleDispatchChange = async (e) => {
    const { name, value } = e.target;
    setDispatchDetails(prev => ({ ...prev, [name]: value }));

    if (name === "projectName" && value) {
      const selectedProjectObj = projects.find(p => p.projectName === value);
      if (selectedProjectObj) {
        const projectId = selectedProjectObj.id ?? selectedProjectObj.projectId;
        if (projectId) {
          try {
            const floorResponse = await axios.get(`${API_URL}/floors/project/${projectId}`);
            setFloors(floorResponse.data || []);
            setSelectedFloor("");
            setFlats([]);
          } catch (error) {
            console.error("Error fetching floors:", error);
            setFloors([]);
            setSelectedFloor("");
            setFlats([]);
          }
        }
      }
      try {
        const logResponse = await axios.get(`${API_URL}/logs/project/${value}`);
        if (logResponse.data && logResponse.data.length > 0) {
          const latestLog = logResponse.data[0];
          setDispatchDetails(prev => ({
            ...prev,
            dcNo: latestLog.dcNo || prev.dcNo,
            workOrderNumber: latestLog.workOrderNumber || prev.workOrderNumber,
            codeNo: latestLog.codeNo || prev.codeNo,
            tripId: latestLog.tripId || prev.tripId
          }));
        }
      } catch (error) {
        console.error("Error fetching logs:", error);
      }
    }

    if (name === "tripId" && value) {
      fetchDispatchDetails(value);
    }
  };

  const handleFloorChange = async (e) => {
    const floorId = e.target.value;
    setSelectedFloor(floorId);
    setFlatNumber("");
    if (floorId) {
      try {
        const response = await axios.get(`${API_URL}/flats/floor/${floorId}`);
        setFlats(response.data || []);
      } catch (error) {
        console.error("Error fetching flats:", error);
        setFlats([]);
      }
    } else {
      setFlats([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      const w = parseFloat(name === "width" ? value : prev.width) || 0;
      const h = parseFloat(name === "height" ? value : prev.height) || 0;
      const u = parseInt(name === "units" ? value : prev.units) || 0;

      if (w > 0 && h > 0 && u > 0) {
        const calculatedSqft = ((w * h * u) / 1000000) * 10.764;
        updated.sqft = calculatedSqft.toFixed(2);
      } else {
        updated.sqft = "";
      }
      return updated;
    });
  };

  const getAllWindows = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/windows/all`);
      setWindows(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Load failed:", error);
      setWindows([]);
    } finally {
      setLoading(false);
    }
  };

  const submitProjectLog = async () => {
    try {
      if (!dispatchDetails.projectName || !dispatchDetails.tripId) {
        alert("Please enter both Project Name and Trip ID");
        return;
      }
      const payload = {
        ...dispatchDetails,
        tripId: parseInt(dispatchDetails.tripId)
      };
      await axios.post(`${API_URL}/logs`, payload);
      alert("Project Log Submitted Successfully!");
    } catch (error) {
      alert("Failed to submit project log");
    }
  };

  const createWindow = async () => {
    try {
      if (!dispatchDetails?.tripId || !flatNumber) {
        alert("Please select a Trip and Flat Number.");
        return;
      }
      const floorQuery = selectedFloor ? `?floorId=${selectedFloor}` : "";
      const payload = {
        ...formData,
        wCodeNo: formData.wcodeNo,
        width: parseFloat(formData.width) || 0,
        height: parseFloat(formData.height) || 0,
        units: parseInt(formData.units) || 0,
        sqft: parseFloat(formData.sqft) || 0,
        trackOuter: parseInt(formData.trackOuter) || 0,
        bottomFix: parseInt(formData.bottomFix) || 0,
        glassShutter: parseInt(formData.glassShutter) || 0,
        meshShutter: parseInt(formData.meshShutter) || 0
      };

      await axios.post(
        `${API_URL}/windows/trip/${dispatchDetails.tripId}/flat/${flatNumber}${floorQuery}`,
        payload
      );
      alert("Window created successfully!");
      getAllWindows();
      setFormData(initialState);
    } catch (error) {
      alert(`Error: ${error.response?.data?.message || "Check Console"}`);
    }
  };

  // --- UPDATED DOWNLOAD PDF LOGIC ---
  const downloadPDF = () => {
    const doc = new jsPDF("landscape");

    doc.setFontSize(16);
    doc.text("ONEDEO LEELA FAÇADE SYSTEMS PRIVATE LIMITED", 148, 15, { align: "center" });
    doc.setFontSize(8);
    doc.text("Building No/Flat No 327, Bopgaon Chouck, Pune, Maharashtra 412301", 148, 22, { align: "center" });

    doc.setFontSize(10);
    doc.text(`Project Name: ${dispatchDetails.projectName || "N/A"}`, 14, 32);
    doc.text(`DC No: ${dispatchDetails.dcNo || "N/A"}`, 14, 38);
    doc.text(`Work Order No: ${dispatchDetails.workOrderNumber || "N/A"}`, 14, 44);
    doc.text(`Code No: ${dispatchDetails.codeNo || "N/A"}`, 14, 50);
    doc.text(`Trip ID: ${dispatchDetails.tripId || "N/A"}`, 220, 32);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 220, 38);
    doc.text(`Vehicle No: ${windows?.[0]?.trip?.vehicleNumber || "N/A"}`, 220, 44);

    const tableColumn = ["Sr.", "Trip ID", "Win.Sr", "Flat", "Loc", "W.Code", "Job Card", "Series", "Width", "Height", "Trk", "Bot", "Glass", "Mesh", "Unit", "SqFt"];
    const tableRows = windows.map((w, index) => [
      index + 1,
      w?.trip?.id ?? w?.tripId ?? "N/A",
      w.windowSeriesNumber || "N/A",
      w?.flat?.flatNumber ?? w?.flatNumber ?? w?.flatId ?? "N/A",
      w.location || "N/A",
      w.wcodeNo || w.wCodeNo || "N/A",
      w.jobCardNo || "N/A",
      w.series || "N/A",
      w.width || 0,
      w.height || 0,
      w.trackOuter || 0,
      w.bottomFix || 0,
      w.glassShutter || 0,
      w.meshShutter || 0,
      w.units || 0,
      w.sqft || 0
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 58,
      theme: "grid",
      styles: { fontSize: 7 },
      headStyles: { fillColor: [44, 62, 80] }
    });

    const finalY = (doc.lastAutoTable?.finalY || 58) + 10;
    const totalSqFt = windows?.reduce((sum, w) => sum + (parseFloat(w?.sqft) || 0), 0).toFixed(2);

    doc.text(`Total SqFt: ${totalSqFt}`, 250, finalY);
    doc.text("Prepared By: ________________", 14, finalY + 20);
    doc.text("Checked By: ________________", 110, finalY + 20);
    doc.text("Received By: ________________", 210, finalY + 20);

    doc.save(`Onedeo_Report_Trip_${dispatchDetails.tripId || "All"}.pdf`);
  };

  return (
    <div style={{ padding: "25px", fontFamily: "'Segoe UI', sans-serif", backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #3498db", marginBottom: "20px", paddingBottom: "10px" }}>
        <h2 style={{ color: "#2c3e50", margin: 0 }}>Window Logistics Management (Auto-Sync)</h2>
        <button onClick={downloadPDF} style={{ padding: "10px 20px", backgroundColor: "#e67e22", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
          📥 DOWNLOAD PDF REPORT
        </button>
      </div>

      {/* Dispatch Details Section */}
      <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", marginBottom: "25px" }}>
        <h4>Project / Dispatch Details</h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "15px" }}>
          <div>
            <label style={{ fontSize: "11px", color: "#7f8c8d" }}>PROJECT NAME</label>
            <select name="projectName" value={dispatchDetails.projectName} onChange={handleDispatchChange} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}>
              <option value="">-- Select Project --</option>
              {projects.map((p, index) => <option key={index} value={p.projectName}>{p.projectName}</option>)}
            </select>
          </div>

          {["dcNo", "workOrderNumber", "codeNo", "tripId"].map(field => (
            <div key={field}>
              <label style={{ fontSize: "11px", color: "#7f8c8d" }}>{field.replace(/([A-Z])/g, " $1").toUpperCase()}</label>
              <input
                name={field}
                type={field === "tripId" ? "number" : "text"}
                value={dispatchDetails[field]}
                onChange={handleDispatchChange}
                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
              />
            </div>
          ))}

          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button onClick={submitProjectLog} style={{ width: "100%", padding: "10px 15px", backgroundColor: "#8e44ad", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
              SUBMIT PROJECT LOG
            </button>
          </div>
        </div>

        <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "11px", color: "#7f8c8d" }}>FLOOR</label>
            <select value={selectedFloor} onChange={handleFloorChange} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}>
              <option value="">-- Select Floor --</option>
              {floors.map((f, idx) => (
                <option key={f.floorId || idx} value={f.floorId}>Floor {f.floorNumber}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "11px", color: "#7f8c8d" }}>FLAT NUMBER</label>
            <select
              value={flatNumber}
              onChange={(e) => setFlatNumber(e.target.value)}
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
            >
              <option value="">-- Select Flat --</option>
              {flats.map(flat => (
                <option key={flat.flatId} value={flat.flatNumber}>{flat.flatNumber}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Add Window Form */}
      <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", marginBottom: "25px" }}>
        <h4>Add New Window Details</h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "15px" }}>
          {Object.keys(initialState).map(key => (
            <div key={key}>
              <label style={{ fontSize: "11px", color: "#7f8c8d" }}>{key.replace(/([A-Z])/g, " $1").toUpperCase()}</label>
              <input name={key} value={formData[key]} onChange={handleChange} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }} />
            </div>
          ))}
        </div>
        <button onClick={createWindow} style={{ marginTop: "20px", padding: "12px 30px", backgroundColor: "#27ae60", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
          SUBMIT WINDOW TO DATABASE
        </button>
      </div>

      {/* --- REPLACED UPDATED TABLE UI --- */}
      <div style={{ marginTop: "40px" }}>
        <h3 style={{ color: "#2c3e50" }}>Data Results (Database View)</h3>
        <div style={{ overflowX: "auto", background: "#fff", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
          <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
            <thead style={{ backgroundColor: "#2c3e50", color: "#ecf0f1" }}>
              <tr>
                <th>Sr.No</th>
                <th>Trip ID</th>
                <th>Win Series</th>
                <th>Flat No</th>
                <th>Location</th>
                <th>W-Code</th>
                <th>Dimensions (WxH)</th>
                <th>Units</th>
                <th>SqFt</th>
                <th>Trip Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="10" style={{ textAlign: "center", padding: "30px" }}>Fetching data...</td></tr>
              ) : windows.length > 0 ? (
                windows.map((w, index) => (
                  <tr key={w.windowId || index} onClick={() => setSelectedWindow(w)} style={{ borderBottom: "1px solid #eee", cursor: "pointer" }}>
                    <td>{index + 1}</td>
                    <td style={{ fontWeight: "bold", color: "#2980b9" }}>{w?.trip?.id ?? w?.tripId ?? "N/A"}</td>
                    <td style={{ fontWeight: "bold" }}>{w.windowSeriesNumber || "N/A"}</td>
                    <td style={{ color: "#e67e22", fontWeight: "bold" }}>{w?.flat?.flatNumber ?? w?.flatNumber ?? w?.flatId ?? "N/A"}</td>
                    <td>{w.location || "N/A"}</td>
                    <td>{w.wcodeNo || w.wCodeNo || "N/A"}</td>
                    <td>{w.width || 0} x {w.height || 0}</td>
                    <td>{w.units || 0}</td>
                    <td>{w.sqft || 0}</td>
                    <td style={{ fontSize: "10px", color: "#7f8c8d" }}>{w.trip?.status || (w.tripId ? "ASSIGNED" : "NO TRIP")}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="10" style={{ textAlign: "center", padding: "30px" }}>No data found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- REPLACED UPDATED DETAILED MODAL VIEW --- */}
      {selectedWindow && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", padding: "30px", borderRadius: "12px", width: "80%", maxHeight: "90vh", overflowY: "auto", position: "relative", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
            <button onClick={() => setSelectedWindow(null)} style={{ position: "absolute", top: "15px", right: "15px", border: "none", background: "#e74c3c", color: "white", borderRadius: "50%", width: "30px", height: "30px", cursor: "pointer", fontWeight: "bold" }}>X</button>

            <h3 style={{ borderBottom: "3px solid #3498db", paddingBottom: "10px", color: "#2c3e50" }}>Window Detailed Record: #{selectedWindow.windowId}</h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "25px", marginTop: "20px" }}>
              <div style={{ background: "#f1f4f9", padding: "20px", borderRadius: "8px" }}>
                <h4 style={{ color: "#2980b9", marginTop: 0 }}>Production Details</h4>
                <p><strong>Job Card:</strong> {selectedWindow.jobCardNo || "N/A"}</p>
                <p><strong>Series Type:</strong> {selectedWindow.series || "N/A"}</p>
                <p><strong>W-Code:</strong> {selectedWindow.wcodeNo || selectedWindow.wCodeNo || "N/A"}</p>
                <p><strong>Description:</strong> {selectedWindow.description || "N/A"}</p>
              </div>

              <div style={{ background: "#f1f4f9", padding: "20px", borderRadius: "8px" }}>
                <h4 style={{ color: "#2980b9", marginTop: 0 }}>Technical Specs</h4>
                <p><strong>Dimensions:</strong> {selectedWindow.width || 0}mm x {selectedWindow.height || 0}mm</p>
                <p><strong>Total Area:</strong> {selectedWindow.sqft || 0} SqFt</p>
                <p><strong>Units:</strong> {selectedWindow.units || 0}</p>
                <p><strong>Shutters:</strong> Glass: {selectedWindow.glassShutter}, Mesh: {selectedWindow.meshShutter}</p>
              </div>

              <div style={{ background: "#f1f4f9", padding: "20px", borderRadius: "8px" }}>
                <h4 style={{ color: "#d35400", marginTop: 0 }}>Logistics & Site</h4>
                <p><strong>Flat No:</strong> {selectedWindow.flat?.flatNumber || selectedWindow.flatNumber || "N/A"}</p>
                <p><strong>Trip ID:</strong> {selectedWindow.trip?.id || selectedWindow.tripId || "N/A"}</p>
                {selectedWindow.trip && (
                  <>
                    <p><strong>Status:</strong> <span style={{ color: selectedWindow.trip.status === "CANCELLED" ? "red" : "green", fontWeight: "bold" }}>{selectedWindow.trip.status}</span></p>
                    <p><strong>Vehicle:</strong> {selectedWindow.trip.vehicleNumber || "N/A"}</p>
                    <p><strong>Driver:</strong> {selectedWindow.trip.driverName || "N/A"}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WindowManager;