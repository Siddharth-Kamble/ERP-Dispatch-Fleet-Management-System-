//
//
//import React, { useState, useEffect } from "react";
//import axios from "axios";
//import jsPDF from "jspdf";
//import autoTable from "jspdf-autotable"; // ✅ Function import for reliability
//
//const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
//
//const WindowManager = () => {
//  const [tripId, setTripId] = useState("");
//  const [flatNumber, setFlatNumber] = useState("");
//  const [windows, setWindows] = useState([]);
//  const [selectedWindow, setSelectedWindow] = useState(null);
//
//  const initialState = {
//    windowSeriesNumber: "",
//    location: "",
//    wcodeNo: "",
//    jobCardNo: "",
//    series: "",
//    description: "",
//    width: "",
//    height: "",
//    trackOuter: "",
//    bottomFix: "",
//    glassShutter: "",
//    meshShutter: "",
//    units: "",
//    sqft: "",
//    remark: ""
//  };
//
//  const [formData, setFormData] = useState(initialState);
//
//  useEffect(() => {
//    getAllWindows();
//  }, []);
//
//  const handleChange = (e) => {
//    const { name, value } = e.target;
//    setFormData((prev) => {
//      const updated = { ...prev, [name]: value };
//      if (name === "width" || name === "height") {
//        const w = name === "width" ? parseFloat(value) : parseFloat(prev.width);
//        const h = name === "height" ? parseFloat(value) : parseFloat(prev.height);
//        if (!isNaN(w) && !isNaN(h)) {
//          updated.sqft = (w * h).toFixed(2);
//        }
//      }
//      return updated;
//    });
//  };
//
//  const getAllWindows = async () => {
//    try {
//      const response = await axios.get(`${API_URL}/windows/all`);
//      setWindows(Array.isArray(response.data) ? response.data : []);
//      console.log("Database synced: All entries loaded.");
//    } catch (error) {
//      console.error("Initial load failed:", error);
//    }
//  };
//
//  const createWindow = async () => {
//    try {
//      if (!tripId || !flatNumber) {
//        alert("Please enter both Trip ID and Flat Number");
//        return;
//      }
//
//      const payload = {
//        ...formData,
//        width: parseFloat(formData.width) || 0.0,
//        height: parseFloat(formData.height) || 0.0,
//        trackOuter: parseInt(formData.trackOuter) || 0,
//        bottomFix: parseInt(formData.bottomFix) || 0,
//        glassShutter: parseInt(formData.glassShutter) || 0,
//        meshShutter: parseInt(formData.meshShutter) || 0,
//        units: parseInt(formData.units) || 0,
//        sqft: parseFloat(formData.sqft) || 0.0
//      };
//
//      await axios.post(`${API_URL}/windows/trip/${tripId}/flat/${flatNumber}`, payload);
//      alert("Window Created Successfully!");
//      getAllWindows();
//      setFormData(initialState);
//    } catch (error) {
//      console.error("Creation Error:", error);
//      alert("Check backend connection (CORS/Server)");
//    }
//  };
//
//  const getWindowsByTrip = async () => {
//    if (!tripId) return alert("Enter Trip ID");
//    try {
//      const response = await axios.get(`${API_URL}/windows/trip/${tripId}/windows`);
//      setWindows(Array.isArray(response.data) ? response.data : []);
//    } catch (error) {
//      alert("Error fetching windows for this trip");
//    }
//  };
//
//  // ✅ PDF GENERATION LOGIC
//  const downloadPDF = () => {
//    const doc = new jsPDF("landscape");
//
//    doc.setFontSize(16);
//    doc.text("ONEDEO LEELA FAÇADE SYSTEMS PRIVATE LIMITED", 148, 15, { align: "center" });
//    doc.setFontSize(8);
//    doc.text("Building No/Flat No 327, Bopgaon Chouck, Pune, Maharashtra 412301", 148, 22, { align: "center" });
//
//    doc.setFontSize(10);
//    doc.text(`DC No: ${tripId || "N/A"}`, 250, 35);
//    doc.text(`Date: ${new Date().toLocaleDateString()}`, 250, 40);
//    doc.text(`Vehicle No: ${windows[0]?.trip?.vehicleNumber || "N/A"}`, 14, 35);
//
//    const tableColumn = [
//      "Sr.", "Trip ID", "Win.Sr", "Flat", "Loc", "W.Code", "Job Card", "Series",
//      "Width", "Height", "Trk", "Bot", "Glass", "Mesh", "Unit", "SqFt"
//    ];
//
//    const tableRows = windows.map((w, index) => [
//      index + 1,
//      w.trip?.id || "N/A", // ✅ Updated to check both tripId and nested object
//      w.windowSeriesNumber || "N/A",
//      w.flat?.flatNumber || w.flatId || "N/A",
//      w.location || "N/A",
//      w.wcodeNo || w.wCodeNo || "N/A",
//      w.jobCardNo || "N/A",
//      w.series || "N/A",
//      w.width || 0,
//      w.height || 0,
//      w.trackOuter || 0,
//      w.bottomFix || 0,
//      w.glassShutter || 0,
//      w.meshShutter || 0,
//      w.units || 0,
//      w.sqft || 0
//    ]);
//
//    autoTable(doc, {
//      head: [tableColumn],
//      body: tableRows,
//      startY: 50,
//      theme: "grid",
//      styles: { fontSize: 7 },
//      headStyles: { fillColor: [44, 62, 80] }
//    });
//
//    const finalY = (doc.lastAutoTable?.finalY || 50) + 10;
//    const totalSqFt = windows
//      .reduce((sum, w) => sum + (parseFloat(w.sqft) || 0), 0)
//      .toFixed(2);
//
//    doc.text(`Total SqFt: ${totalSqFt}`, 250, finalY);
//    doc.text("Prepared By: ________________", 14, finalY + 20);
//    doc.text("Checked By: ________________", 110, finalY + 20);
//    doc.text("Received By: ________________", 210, finalY + 20);
//
//    doc.save(`Onedeo_Report_Trip_${tripId || "All"}.pdf`);
//  };
//
//  return (
//    <div style={{ padding: "25px", fontFamily: "'Segoe UI', Tahoma, sans-serif", backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
//      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #3498db", marginBottom: "20px", paddingBottom: "10px" }}>
//        <h2 style={{ color: "#2c3e50", margin: 0 }}>Window Logistics Management (Auto-Sync)</h2>
//        <button
//          onClick={downloadPDF}
//          style={{ padding: "10px 20px", backgroundColor: "#e67e22", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
//        >
//          📥 DOWNLOAD PDF REPORT
//        </button>
//      </div>
//
//      <div style={{ display: "flex", gap: "15px", marginBottom: "25px", background: "#fff", padding: "15px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
//        <div>
//          <label style={{ fontSize: "12px", fontWeight: "bold" }}>TRIP ID</label><br/>
//          <input type="number" value={tripId} onChange={(e) => setTripId(e.target.value)} style={{ padding: "8px" }} />
//        </div>
//        <div>
//          <label style={{ fontSize: "12px", fontWeight: "bold" }}>FLAT NUMBER</label><br/>
//          <input type="number" value={flatNumber} onChange={(e) => setFlatNumber(e.target.value)} style={{ padding: "8px" }} />
//        </div>
//        <div style={{ alignSelf: "flex-end" }}>
//          <button onClick={getWindowsByTrip} style={{ padding: "10px 15px", backgroundColor: "#3498db", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", marginRight: "10px" }}>Filter by Trip</button>
//          <button onClick={getAllWindows} style={{ padding: "10px 15px", backgroundColor: "#95a5a6", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Refresh All Data</button>
//        </div>
//      </div>
//
//      <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
//        <h4 style={{ marginTop: 0 }}>Add New Window Details</h4>
//        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "15px" }}>
//          {Object.keys(initialState).map((key) => (
//            <div key={key}>
//              <label style={{ fontSize: "11px", color: "#7f8c8d", textTransform: "uppercase" }}>{key.replace(/([A-Z])/g, ' $1')}</label>
//              <input
//                name={key}
//                value={formData[key]}
//                onChange={handleChange}
//                placeholder={key}
//                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd", boxSizing: "border-box" }}
//              />
//            </div>
//          ))}
//        </div>
//        <button onClick={createWindow} style={{ marginTop: "20px", padding: "12px 30px", backgroundColor: "#27ae60", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
//          SUBMIT WINDOW TO DATABASE
//        </button>
//      </div>
//
//      <h3 style={{ marginTop: "40px", color: "#2c3e50" }}>Data Results (Database View)</h3>
//      <div style={{ overflowX: "auto", background: "#fff", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
//        <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
//          <thead style={{ backgroundColor: "#2c3e50", color: "#ecf0f1" }}>
//            <tr>
//              <th>Sr.No</th>
//              <th>Trip ID</th>
//              <th>Win Series</th>
//              <th>Flat No</th>
//              <th>Location</th>
//              <th>W-Code</th>
//              <th>Dimensions (WxH)</th>
//              <th>Units</th>
//              <th>SqFt</th>
//              <th>Trip Status</th>
//            </tr>
//          </thead>
//          <tbody>
//            {windows.length > 0 ? (
//              windows.map((w, index) => (
//                <tr
//                  key={w.windowId || index}
//                  onClick={() => setSelectedWindow(w)}
//                  style={{ borderBottom: "1px solid #eee", cursor: "pointer" }}
//                >
//                  <td>{index + 1}</td>
//                  <td style={{ fontWeight: "bold", color: "#2980b9" }}>
//                    {w.trip?.id || "N/A"} {/* ✅ Changed to support tripId property */}
//                  </td>
//                  <td style={{ fontWeight: "bold" }}>{w.windowSeriesNumber}</td>
//                  <td style={{ color: "#e67e22", fontWeight: "bold" }}>{w.flat?.flatNumber || w.flatId || "N/A"}</td>
//                  <td>{w.location}</td>
//                  <td>{w.wcodeNo || w.wCodeNo || "N/A"}</td>
//                  <td>{w.width} x {w.height}</td>
//                  <td>{w.units}</td>
//                  <td>{w.sqft}</td>
//                  <td style={{ fontSize: "10px", color: "#7f8c8d" }}>
//                    {w.trip?.status || (w.tripId ? "ASSIGNED" : "NO TRIP")}
//                  </td>
//                </tr>
//              ))
//            ) : (
//              <tr><td colSpan="10" style={{ textAlign: "center", padding: "30px", color: "#95a5a6" }}>Fetching data from server...</td></tr>
//            )}
//          </tbody>
//        </table>
//      </div>
//
//      {selectedWindow && (
//        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
//          <div style={{ background: "#fff", padding: "30px", borderRadius: "12px", width: "80%", maxHeight: "90vh", overflowY: "auto", position: "relative", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
//            <button
//              onClick={() => setSelectedWindow(null)}
//              style={{ position: "absolute", top: "15px", right: "15px", border: "none", background: "#e74c3c", color: "white", borderRadius: "50%", width: "30px", height: "30px", cursor: "pointer", fontWeight: "bold" }}
//            >
//              X
//            </button>
//
//            <h3 style={{ borderBottom: "3px solid #3498db", paddingBottom: "10px", color: "#2c3e50" }}>
//                Window Detailed Record: #{selectedWindow.windowId}
//            </h3>
//
//            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "25px", marginTop: "20px" }}>
//              <div style={{ background: "#f1f4f9", padding: "20px", borderRadius: "8px" }}>
//                <h4 style={{ color: "#2980b9", marginTop: 0 }}>Production Details</h4>
//                <p><strong>Job Card:</strong> {selectedWindow.jobCardNo}</p>
//                <p><strong>Series Type:</strong> {selectedWindow.series}</p>
//                <p><strong>W-Code:</strong> {selectedWindow.wcodeNo || "N/A"}</p>
//                <p><strong>Description:</strong> {selectedWindow.description}</p>
//                <p><strong>Remark:</strong> {selectedWindow.remark || "None"}</p>
//              </div>
//
//              <div style={{ background: "#f1f4f9", padding: "20px", borderRadius: "8px" }}>
//                <h4 style={{ color: "#2980b9", marginTop: 0 }}>Technical Specs</h4>
//                <p><strong>Dimensions:</strong> {selectedWindow.width}mm (W) x {selectedWindow.height}mm (H)</p>
//                <p><strong>Total Area:</strong> {selectedWindow.sqft} SqFt</p>
//                <p><strong>Units:</strong> {selectedWindow.units}</p>
//                <p><strong>Track Outer:</strong> {selectedWindow.trackOuter}</p>
//                <p><strong>Glass Shutters:</strong> {selectedWindow.glassShutter}</p>
//                <p><strong>Mesh Shutters:</strong> {selectedWindow.meshShutter}</p>
//              </div>
//
//              <div style={{ background: "#f1f4f9", padding: "20px", borderRadius: "8px" }}>
//                <h4 style={{ color: "#d35400", marginTop: 0 }}>Logistics & Site</h4>
//                <p><strong>Flat No:</strong> {selectedWindow.flat?.flatNumber || selectedWindow.flatId || "N/A"}</p>
//                <p><strong>Trip ID:</strong> {selectedWindow.trip?.id || "N/A"}</p>
//                {selectedWindow.trip && (
//                  <>
//                    <p><strong>Trip Status:</strong> <span style={{color: selectedWindow.trip.status === "CANCELLED" ? "red" : "green", fontWeight: "bold"}}>{selectedWindow.trip.status}</span></p>
//                    <p><strong>Vehicle:</strong> {selectedWindow.trip.vehicleNumber}</p>
//                    <p><strong>Driver:</strong> {selectedWindow.trip.driverName}</p>
//                    <p><strong>Trip Date:</strong> {new Date(selectedWindow.trip.tripDate).toLocaleDateString()}</p>
//                  </>
//                )}
//              </div>
//            </div>
//          </div>
//        </div>
//      )}
//    </div>
//  );
//};
//
//export default WindowManager;

//import React, { useState, useEffect } from "react";
//import axios from "axios";
//import jsPDF from "jspdf";
//import autoTable from "jspdf-autotable";
//
//const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
//
//const WindowManager = () => {
//  const [tripId, setTripId] = useState("");
//  const [flatNumber, setFlatNumber] = useState("");
//  const [windows, setWindows] = useState([]);
//  const [selectedWindow, setSelectedWindow] = useState(null);
//  const [loading, setLoading] = useState(false);
//
//  const [dispatchDetails, setDispatchDetails] = useState({
//    projectName: "",
//    dcNo: "",
//    workOrderNumber: "",
//    codeNo: "",
//    tripId: ""
//  });
//
//  const initialState = {
//    windowSeriesNumber: "",
//    location: "",
//    wcodeNo: "",
//    jobCardNo: "",
//    series: "",
//    description: "",
//    width: "",
//    height: "",
//    trackOuter: "",
//    bottomFix: "",
//    glassShutter: "",
//    meshShutter: "",
//    units: "",
//    sqft: "",
//    remark: ""
//  };
//
//  const [formData, setFormData] = useState(initialState);
//
//  useEffect(() => {
//    getAllWindows();
//  }, []);
//
//  const handleDispatchChange = (e) => {
//    const { name, value } = e.target;
//    setDispatchDetails((prev) => ({
//      ...prev,
//      [name]: value
//    }));
//
//    if (name === "tripId") {
//      setTripId(value);
//    }
//  };
//
//  const handleChange = (e) => {
//    const { name, value } = e.target;
//
//    setFormData((prev) => {
//      const updated = { ...prev, [name]: value };
//
//      const widthValue = name === "width" ? value : prev.width;
//      const heightValue = name === "height" ? value : prev.height;
//
//      const w = parseFloat(widthValue);
//      const h = parseFloat(heightValue);
//
//      if (!isNaN(w) && !isNaN(h)) {
//        updated.sqft = (w * h).toFixed(2);
//      } else {
//        updated.sqft = "";
//      }
//
//      return updated;
//    });
//  };
//
//  const getAllWindows = async () => {
//    setLoading(true);
//    try {
//      const response = await axios.get(`${API_URL}/windows/all`);
//      setWindows(Array.isArray(response.data) ? response.data : []);
//      console.log("Database synced: All entries loaded.");
//    } catch (error) {
//      console.error("Initial load failed:", error);
//      setWindows([]);
//    } finally {
//      setLoading(false);
//    }
//  };
//
//  const createWindow = async () => {
//    try {
//      if (!tripId || !flatNumber) {
//        alert("Please enter both Trip ID and Flat Number");
//        return;
//      }
//
//      const payload = {
//        ...formData,
//        width: parseFloat(formData.width) || 0.0,
//        height: parseFloat(formData.height) || 0.0,
//        trackOuter: parseInt(formData.trackOuter) || 0,
//        bottomFix: parseInt(formData.bottomFix) || 0,
//        glassShutter: parseInt(formData.glassShutter) || 0,
//        meshShutter: parseInt(formData.meshShutter) || 0,
//        units: parseInt(formData.units) || 0,
//        sqft: parseFloat(formData.sqft) || 0.0
//      };
//
//      await axios.post(`${API_URL}/windows/trip/${tripId}/flat/${flatNumber}`, payload);
//      alert("Window Created Successfully!");
//      setFormData(initialState);
//      getAllWindows();
//    } catch (error) {
//      console.error("Creation Error:", error);
//      alert("Check backend connection (CORS/Server)");
//    }
//  };
//
//  const getWindowsByTrip = async () => {
//    if (!tripId) {
//      alert("Enter Trip ID");
//      return;
//    }
//
//    setLoading(true);
//    try {
//      const response = await axios.get(`${API_URL}/windows/trip/${tripId}/windows`);
//      setWindows(Array.isArray(response.data) ? response.data : []);
//    } catch (error) {
//      console.error("Error fetching windows for trip:", error);
//      setWindows([]);
//      alert("Error fetching windows for this trip");
//    } finally {
//      setLoading(false);
//    }
//  };
//
//  const downloadPDF = () => {
//    const doc = new jsPDF("landscape");
//
//    doc.setFontSize(16);
//    doc.text("ONEDEO LEELA FAÇADE SYSTEMS PRIVATE LIMITED", 148, 15, { align: "center" });
//    doc.setFontSize(8);
//    doc.text("Building No/Flat No 327, Bopgaon Chouck, Pune, Maharashtra 412301", 148, 22, { align: "center" });
//
//    doc.setFontSize(10);
//    doc.text(`Project Name: ${dispatchDetails.projectName || "N/A"}`, 14, 32);
//    doc.text(`DC No: ${dispatchDetails.dcNo || tripId || "N/A"}`, 14, 38);
//    doc.text(`Work Order No: ${dispatchDetails.workOrderNumber || "N/A"}`, 14, 44);
//    doc.text(`Code No: ${dispatchDetails.codeNo || "N/A"}`, 14, 50);
//
//    doc.text(`Trip ID: ${tripId || dispatchDetails.tripId || "N/A"}`, 220, 32);
//    doc.text(`Date: ${new Date().toLocaleDateString()}`, 220, 38);
//    doc.text(`Vehicle No: ${windows[0]?.trip?.vehicleNumber || "N/A"}`, 220, 44);
//
//    const tableColumn = [
//      "Sr.",
//      "Trip ID",
//      "Win.Sr",
//      "Flat",
//      "Loc",
//      "W.Code",
//      "Job Card",
//      "Series",
//      "Width",
//      "Height",
//      "Trk",
//      "Bot",
//      "Glass",
//      "Mesh",
//      "Unit",
//      "SqFt"
//    ];
//
//    const tableRows = windows.map((w, index) => [
//      index + 1,
//      w.trip?.id || w.tripId || "N/A",
//      w.windowSeriesNumber || "N/A",
//      w.flat?.flatNumber || w.flatNumber || w.flatId || "N/A",
//      w.location || "N/A",
//      w.wcodeNo || w.wCodeNo || "N/A",
//      w.jobCardNo || "N/A",
//      w.series || "N/A",
//      w.width || 0,
//      w.height || 0,
//      w.trackOuter || 0,
//      w.bottomFix || 0,
//      w.glassShutter || 0,
//      w.meshShutter || 0,
//      w.units || 0,
//      w.sqft || 0
//    ]);
//
//    autoTable(doc, {
//      head: [tableColumn],
//      body: tableRows,
//      startY: 58,
//      theme: "grid",
//      styles: { fontSize: 7 },
//      headStyles: { fillColor: [44, 62, 80] }
//    });
//
//    const finalY = (doc.lastAutoTable?.finalY || 58) + 10;
//    const totalSqFt = windows
//      .reduce((sum, w) => sum + (parseFloat(w.sqft) || 0), 0)
//      .toFixed(2);
//
//    doc.text(`Total SqFt: ${totalSqFt}`, 250, finalY);
//    doc.text("Prepared By: ________________", 14, finalY + 20);
//    doc.text("Checked By: ________________", 110, finalY + 20);
//    doc.text("Received By: ________________", 210, finalY + 20);
//
//    doc.save(`Onedeo_Report_Trip_${tripId || "All"}.pdf`);
//  };
//
//  return (
//    <div
//      style={{
//        padding: "25px",
//        fontFamily: "'Segoe UI', Tahoma, sans-serif",
//        backgroundColor: "#f9f9f9",
//        minHeight: "100vh"
//      }}
//    >
//      <div
//        style={{
//          display: "flex",
//          justifyContent: "space-between",
//          alignItems: "center",
//          borderBottom: "2px solid #3498db",
//          marginBottom: "20px",
//          paddingBottom: "10px"
//        }}
//      >
//        <h2 style={{ color: "#2c3e50", margin: 0 }}>
//          Window Logistics Management (Auto-Sync)
//        </h2>
//        <button
//          onClick={downloadPDF}
//          style={{
//            padding: "10px 20px",
//            backgroundColor: "#e67e22",
//            color: "white",
//            border: "none",
//            borderRadius: "4px",
//            cursor: "pointer",
//            fontWeight: "bold"
//          }}
//        >
//          📥 DOWNLOAD PDF REPORT
//        </button>
//      </div>
//
//      <div
//        style={{
//          display: "flex",
//          gap: "15px",
//          marginBottom: "25px",
//          background: "#fff",
//          padding: "15px",
//          borderRadius: "8px",
//          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
//        }}
//      >
//        <div>
//          <label style={{ fontSize: "12px", fontWeight: "bold" }}>TRIP ID</label>
//          <br />
//          <input
//            type="number"
//            value={tripId}
//            onChange={(e) => {
//              setTripId(e.target.value);
//              setDispatchDetails((prev) => ({ ...prev, tripId: e.target.value }));
//            }}
//            style={{ padding: "8px" }}
//          />
//        </div>
//        <div>
//          <label style={{ fontSize: "12px", fontWeight: "bold" }}>FLAT NUMBER</label>
//          <br />
//          <input
//            type="number"
//            value={flatNumber}
//            onChange={(e) => setFlatNumber(e.target.value)}
//            style={{ padding: "8px" }}
//          />
//        </div>
//        <div style={{ alignSelf: "flex-end" }}>
//          <button
//            onClick={getWindowsByTrip}
//            style={{
//              padding: "10px 15px",
//              backgroundColor: "#3498db",
//              color: "white",
//              border: "none",
//              borderRadius: "4px",
//              cursor: "pointer",
//              marginRight: "10px"
//            }}
//          >
//            Filter by Trip
//          </button>
//          <button
//            onClick={getAllWindows}
//            style={{
//              padding: "10px 15px",
//              backgroundColor: "#95a5a6",
//              color: "white",
//              border: "none",
//              borderRadius: "4px",
//              cursor: "pointer"
//            }}
//          >
//            Refresh All Data
//          </button>
//        </div>
//      </div>
//
//      <div
//        style={{
//          backgroundColor: "#fff",
//          padding: "20px",
//          borderRadius: "8px",
//          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
//          marginBottom: "25px"
//        }}
//      >
//        <h4 style={{ marginTop: 0 }}>Project / Dispatch Details</h4>
//        <div
//          style={{
//            display: "grid",
//            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
//            gap: "15px"
//          }}
//        >
//          <div>
//            <label style={{ fontSize: "11px", color: "#7f8c8d", textTransform: "uppercase" }}>
//              Project Name
//            </label>
//            <input
//              name="projectName"
//              value={dispatchDetails.projectName}
//              onChange={handleDispatchChange}
//              placeholder="Project Name"
//              style={{
//                width: "100%",
//                padding: "8px",
//                borderRadius: "4px",
//                border: "1px solid #ddd",
//                boxSizing: "border-box"
//              }}
//            />
//          </div>
//
//          <div>
//            <label style={{ fontSize: "11px", color: "#7f8c8d", textTransform: "uppercase" }}>
//              DC No
//            </label>
//            <input
//              name="dcNo"
//              value={dispatchDetails.dcNo}
//              onChange={handleDispatchChange}
//              placeholder="DC No"
//              style={{
//                width: "100%",
//                padding: "8px",
//                borderRadius: "4px",
//                border: "1px solid #ddd",
//                boxSizing: "border-box"
//              }}
//            />
//          </div>
//
//          <div>
//            <label style={{ fontSize: "11px", color: "#7f8c8d", textTransform: "uppercase" }}>
//              Work Order Number
//            </label>
//            <input
//              name="workOrderNumber"
//              value={dispatchDetails.workOrderNumber}
//              onChange={handleDispatchChange}
//              placeholder="Work Order Number"
//              style={{
//                width: "100%",
//                padding: "8px",
//                borderRadius: "4px",
//                border: "1px solid #ddd",
//                boxSizing: "border-box"
//              }}
//            />
//          </div>
//
//          <div>
//            <label style={{ fontSize: "11px", color: "#7f8c8d", textTransform: "uppercase" }}>
//              Code No
//            </label>
//            <input
//              name="codeNo"
//              value={dispatchDetails.codeNo}
//              onChange={handleDispatchChange}
//              placeholder="Code No"
//              style={{
//                width: "100%",
//                padding: "8px",
//                borderRadius: "4px",
//                border: "1px solid #ddd",
//                boxSizing: "border-box"
//              }}
//            />
//          </div>
//
//          <div>
//            <label style={{ fontSize: "11px", color: "#7f8c8d", textTransform: "uppercase" }}>
//              Trip ID
//            </label>
//            <input
//              name="tripId"
//              type="number"
//              value={dispatchDetails.tripId}
//              onChange={handleDispatchChange}
//              placeholder="Trip ID"
//              style={{
//                width: "100%",
//                padding: "8px",
//                borderRadius: "4px",
//                border: "1px solid #ddd",
//                boxSizing: "border-box"
//              }}
//            />
//          </div>
//        </div>
//      </div>
//
//      <div
//        style={{
//          backgroundColor: "#fff",
//          padding: "20px",
//          borderRadius: "8px",
//          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
//        }}
//      >
//        <h4 style={{ marginTop: 0 }}>Add New Window Details</h4>
//        <div
//          style={{
//            display: "grid",
//            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
//            gap: "15px"
//          }}
//        >
//          {Object.keys(initialState).map((key) => (
//            <div key={key}>
//              <label
//                style={{
//                  fontSize: "11px",
//                  color: "#7f8c8d",
//                  textTransform: "uppercase"
//                }}
//              >
//                {key.replace(/([A-Z])/g, " $1")}
//              </label>
//              <input
//                name={key}
//                value={formData[key]}
//                onChange={handleChange}
//                placeholder={key}
//                style={{
//                  width: "100%",
//                  padding: "8px",
//                  borderRadius: "4px",
//                  border: "1px solid #ddd",
//                  boxSizing: "border-box"
//                }}
//              />
//            </div>
//          ))}
//        </div>
//        <button
//          onClick={createWindow}
//          style={{
//            marginTop: "20px",
//            padding: "12px 30px",
//            backgroundColor: "#27ae60",
//            color: "white",
//            border: "none",
//            borderRadius: "4px",
//            cursor: "pointer",
//            fontWeight: "bold"
//          }}
//        >
//          SUBMIT WINDOW TO DATABASE
//        </button>
//      </div>
//
//      <h3 style={{ marginTop: "40px", color: "#2c3e50" }}>Data Results (Database View)</h3>
//      <div
//        style={{
//          overflowX: "auto",
//          background: "#fff",
//          borderRadius: "8px",
//          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
//        }}
//      >
//        <table
//          border="1"
//          cellPadding="10"
//          style={{
//            width: "100%",
//            borderCollapse: "collapse",
//            fontSize: "12px",
//            textAlign: "left"
//          }}
//        >
//          <thead style={{ backgroundColor: "#2c3e50", color: "#ecf0f1" }}>
//            <tr>
//              <th>Sr.No</th>
//              <th>Trip ID</th>
//              <th>Win Series</th>
//              <th>Flat No</th>
//              <th>Location</th>
//              <th>W-Code</th>
//              <th>Dimensions (WxH)</th>
//              <th>Units</th>
//              <th>SqFt</th>
//              <th>Trip Status</th>
//            </tr>
//          </thead>
//          <tbody>
//            {loading ? (
//              <tr>
//                <td colSpan="10" style={{ textAlign: "center", padding: "30px", color: "#95a5a6" }}>
//                  Fetching data from server...
//                </td>
//              </tr>
//            ) : windows.length > 0 ? (
//              windows.map((w, index) => (
//                <tr
//                  key={w.windowId || index}
//                  onClick={() => setSelectedWindow(w)}
//                  style={{ borderBottom: "1px solid #eee", cursor: "pointer" }}
//                >
//                  <td>{index + 1}</td>
//                  <td style={{ fontWeight: "bold", color: "#2980b9" }}>
//                    {w.trip?.id || w.tripId || "N/A"}
//                  </td>
//                  <td style={{ fontWeight: "bold" }}>{w.windowSeriesNumber || "N/A"}</td>
//                  <td style={{ color: "#e67e22", fontWeight: "bold" }}>
//                    {w.flat?.flatNumber || w.flatNumber || w.flatId || "N/A"}
//                  </td>
//                  <td>{w.location || "N/A"}</td>
//                  <td>{w.wcodeNo || w.wCodeNo || "N/A"}</td>
//                  <td>
//                    {w.width || 0} x {w.height || 0}
//                  </td>
//                  <td>{w.units || 0}</td>
//                  <td>{w.sqft || 0}</td>
//                  <td style={{ fontSize: "10px", color: "#7f8c8d" }}>
//                    {w.trip?.status || (w.tripId ? "ASSIGNED" : "NO TRIP")}
//                  </td>
//                </tr>
//              ))
//            ) : (
//              <tr>
//                <td colSpan="10" style={{ textAlign: "center", padding: "30px", color: "#95a5a6" }}>
//                  No window data found.
//                </td>
//              </tr>
//            )}
//          </tbody>
//        </table>
//      </div>
//
//      {selectedWindow && (
//        <div
//          style={{
//            position: "fixed",
//            top: 0,
//            left: 0,
//            width: "100%",
//            height: "100%",
//            background: "rgba(0,0,0,0.7)",
//            display: "flex",
//            justifyContent: "center",
//            alignItems: "center",
//            zIndex: 1000
//          }}
//        >
//          <div
//            style={{
//              background: "#fff",
//              padding: "30px",
//              borderRadius: "12px",
//              width: "80%",
//              maxHeight: "90vh",
//              overflowY: "auto",
//              position: "relative",
//              boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
//            }}
//          >
//            <button
//              onClick={() => setSelectedWindow(null)}
//              style={{
//                position: "absolute",
//                top: "15px",
//                right: "15px",
//                border: "none",
//                background: "#e74c3c",
//                color: "white",
//                borderRadius: "50%",
//                width: "30px",
//                height: "30px",
//                cursor: "pointer",
//                fontWeight: "bold"
//              }}
//            >
//              X
//            </button>
//
//            <h3
//              style={{
//                borderBottom: "3px solid #3498db",
//                paddingBottom: "10px",
//                color: "#2c3e50"
//              }}
//            >
//              Window Detailed Record: #{selectedWindow.windowId}
//            </h3>
//
//            <div
//              style={{
//                display: "grid",
//                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
//                gap: "25px",
//                marginTop: "20px"
//              }}
//            >
//              <div style={{ background: "#f1f4f9", padding: "20px", borderRadius: "8px" }}>
//                <h4 style={{ color: "#2980b9", marginTop: 0 }}>Production Details</h4>
//                <p><strong>Job Card:</strong> {selectedWindow.jobCardNo || "N/A"}</p>
//                <p><strong>Series Type:</strong> {selectedWindow.series || "N/A"}</p>
//                <p><strong>W-Code:</strong> {selectedWindow.wcodeNo || selectedWindow.wCodeNo || "N/A"}</p>
//                <p><strong>Description:</strong> {selectedWindow.description || "N/A"}</p>
//                <p><strong>Remark:</strong> {selectedWindow.remark || "None"}</p>
//              </div>
//
//              <div style={{ background: "#f1f4f9", padding: "20px", borderRadius: "8px" }}>
//                <h4 style={{ color: "#2980b9", marginTop: 0 }}>Technical Specs</h4>
//                <p><strong>Dimensions:</strong> {selectedWindow.width || 0}mm (W) x {selectedWindow.height || 0}mm (H)</p>
//                <p><strong>Total Area:</strong> {selectedWindow.sqft || 0} SqFt</p>
//                <p><strong>Units:</strong> {selectedWindow.units || 0}</p>
//                <p><strong>Track Outer:</strong> {selectedWindow.trackOuter || 0}</p>
//                <p><strong>Glass Shutters:</strong> {selectedWindow.glassShutter || 0}</p>
//                <p><strong>Mesh Shutters:</strong> {selectedWindow.meshShutter || 0}</p>
//              </div>
//
//              <div style={{ background: "#f1f4f9", padding: "20px", borderRadius: "8px" }}>
//                <h4 style={{ color: "#d35400", marginTop: 0 }}>Logistics & Site</h4>
//                <p><strong>Flat No:</strong> {selectedWindow.flat?.flatNumber || selectedWindow.flatNumber || selectedWindow.flatId || "N/A"}</p>
//                <p><strong>Trip ID:</strong> {selectedWindow.trip?.id || selectedWindow.tripId || "N/A"}</p>
//                {selectedWindow.trip && (
//                  <>
//                    <p>
//                      <strong>Trip Status:</strong>{" "}
//                      <span
//                        style={{
//                          color: selectedWindow.trip.status === "CANCELLED" ? "red" : "green",
//                          fontWeight: "bold"
//                        }}
//                      >
//                        {selectedWindow.trip.status}
//                      </span>
//                    </p>
//                    <p><strong>Vehicle:</strong> {selectedWindow.trip.vehicleNumber || "N/A"}</p>
//                    <p><strong>Driver:</strong> {selectedWindow.trip.driverName || "N/A"}</p>
//                    <p>
//                      <strong>Trip Date:</strong>{" "}
//                      {selectedWindow.trip.tripDate
//                        ? new Date(selectedWindow.trip.tripDate).toLocaleDateString()
//                        : "N/A"}
//                    </p>
//                  </>
//                )}
//              </div>
//            </div>
//          </div>
//        </div>
//      )}
//    </div>
//  );
//};
//
//export default WindowManager;


//
//import React, { useState, useEffect } from "react";
//import axios from "axios";
//import jsPDF from "jspdf";
//import autoTable from "jspdf-autotable";
//const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
//const WindowManager = () => {
//  const [tripId, setTripId] = useState("");
//  const [flatNumber, setFlatNumber] = useState("");
//  const [windows, setWindows] = useState([]);
//  const [selectedWindow, setSelectedWindow] = useState(null);
//  const [loading, setLoading] = useState(false);
//  const [dispatchDetails, setDispatchDetails] = useState({
//    projectName: "",
//    dcNo: "",
//    workOrderNumber: "",
//    codeNo: "",
//    tripId: ""
//  });
//  const initialState = {
//    windowSeriesNumber: "",
//    location: "",
//    wcodeNo: "",
//    jobCardNo: "",
//    series: "",
//    description: "",
//    width: "",
//    height: "",
//    trackOuter: "",
//    bottomFix: "",
//    glassShutter: "",
//    meshShutter: "",
//    units: "",
//    sqft: "",
//    remark: ""
//  };
//  const [formData, setFormData] = useState(initialState);
//  useEffect(() => {
//    getAllWindows();
//  }, []);
//  const handleDispatchChange = (e) => {
//    const { name, value } = e.target;
//    setDispatchDetails((prev) => ({
//      ...prev,
//      [name]: value
//    }));
//   if (name === "tripId") {
//     setTripId(value);
//     setDispatchDetails((prev) => ({
//       ...prev,
//       tripId: value
//     }));
//   }
//  };
//  const handleChange = (e) => {
//    const { name, value } = e.target;
//    setFormData((prev) => {
//      const updated = { ...prev, [name]: value };
//      const widthValue = name === "width" ? value : prev.width;
//      const heightValue = name === "height" ? value : prev.height;
//      const w = parseFloat(widthValue);
//      const h = parseFloat(heightValue);
//      if (!isNaN(w) && !isNaN(h)) {
//        updated.sqft = (w * h).toFixed(2);
//      } else {
//        updated.sqft = "";
//      }
//      return updated;
//    });
//  };
//  const getAllWindows = async () => {
//    setLoading(true);
//    try {
//      const response = await axios.get(`${API_URL}/windows/all`);
//      setWindows(Array.isArray(response.data) ? response.data : []);
//      console.log("Database synced: All entries loaded.");
//    } catch (error) {
//      console.error("Initial load failed:", error);
//      setWindows([]);
//    } finally {
//      setLoading(false);
//    }
//  };
//  const submitProjectLog = async () => {
//    try {
//      if (!dispatchDetails.projectName || !dispatchDetails.tripId) {
//        alert("Please enter both Project Name and Trip ID");
//        return;
//      }
//
//      const payload = {
//        projectName: dispatchDetails.projectName,
//        dcNo: dispatchDetails.dcNo,
//        workOrderNumber: dispatchDetails.workOrderNumber,
//        codeNo: dispatchDetails.codeNo,
//        tripId: parseInt(dispatchDetails.tripId)
//      };
//      await axios.post(`${API_URL}/logs`, payload);
//      alert("Project Log Submitted Successfully!");
//    } catch (error) {
//      console.error("Project Log Submission Error:", error);
//      alert("Failed to submit project log");
//    }
//  };
//  const createWindow = async () => {
//    try {
//      if (!dispatchDetails.tripId || !flatNumber) {
//        alert("Please enter both Trip ID and Flat Number");
//        return;
//      }
//      const payload = {
//        ...formData,
//        width: parseFloat(formData.width) || 0.0,
//        height: parseFloat(formData.height) || 0.0,
//        trackOuter: parseInt(formData.trackOuter) || 0,
//        bottomFix: parseInt(formData.bottomFix) || 0,
//        glassShutter: parseInt(formData.glassShutter) || 0,
//        meshShutter: parseInt(formData.meshShutter) || 0,
//        units: parseInt(formData.units) || 0,
//        sqft: parseFloat(formData.sqft) || 0.0
//      };
//
//      await axios.post(
//        `${API_URL}/windows/trip/${dispatchDetails.tripId}/flat/${flatNumber}`,
//        payload
//      );
//      alert("Window Created Successfully!");
//      setFormData(initialState);
//      getAllWindows();
//    } catch (error) {
//      console.error("Creation Error:", error);
//      alert("Check backend connection (CORS/Server)");
//    }
//  };
//  const getWindowsByTrip = async () => {
//    if (!dispatchDetails.tripId) {
//      alert("Enter Trip ID");
//      return;
//    }
//    setLoading(true);
//    try {
//      const response = await axios.get(
//        `${API_URL}/windows/trip/${dispatchDetails.tripId}/windows`
//      );
//      setWindows(Array.isArray(response.data) ? response.data : []);
//    } catch (error) {
//      console.error("Error fetching windows for trip:", error);
//      setWindows([]);
//      alert("Error fetching windows for this trip");
//    } finally {
//      setLoading(false);
//    }
//  };
//
//  const downloadPDF = () => {
//    const doc = new jsPDF("landscape");
//
//    doc.setFontSize(16);
//    doc.text("ONEDEO LEELA FAÇADE SYSTEMS PRIVATE LIMITED", 148, 15, { align: "center" });
//    doc.setFontSize(8);
//    doc.text("Building No/Flat No 327, Bopgaon Chouck, Pune, Maharashtra 412301", 148, 22, {
//      align: "center"
//    });
//
//    doc.setFontSize(10);
//    doc.text(`Project Name: ${dispatchDetails.projectName || "N/A"}`, 14, 32);
//    doc.text(`DC No: ${dispatchDetails.dcNo || dispatchDetails.tripId || "N/A"}`, 14, 38);
//    doc.text(`Work Order No: ${dispatchDetails.workOrderNumber || "N/A"}`, 14, 44);
//    doc.text(`Code No: ${dispatchDetails.codeNo || "N/A"}`, 14, 50);
//    doc.text(`Trip ID: ${dispatchDetails.tripId || tripId || "N/A"}`, 220, 32);
//    doc.text(`Date: ${new Date().toLocaleDateString()}`, 220, 38);
//    doc.text(`Vehicle No: ${windows[0]?.trip?.vehicleNumber || "N/A"}`, 220, 44);
//    const tableColumn = [
//      "Sr.",
//      "Trip ID",
//      "Win.Sr",
//      "Flat",
//      "Loc",
//      "W.Code",
//      "Job Card",
//      "Series",
//      "Width",
//      "Height",
//      "Trk",
//      "Bot",
//      "Glass",
//      "Mesh",
//      "Unit",
//      "SqFt"
//    ];
//    const tableRows = windows.map((w, index) => [
//      index + 1,
//      w.trip?.id || w.tripId || "N/A",
//      w.windowSeriesNumber || "N/A",
//      w.flat?.flatNumber || w.flatNumber || w.flatId || "N/A",
//      w.location || "N/A",
//      w.wcodeNo || w.wCodeNo || "N/A",
//      w.jobCardNo || "N/A",
//      w.series || "N/A",
//      w.width || 0,
//      w.height || 0,
//      w.trackOuter || 0,
//      w.bottomFix || 0,
//      w.glassShutter || 0,
//      w.meshShutter || 0,
//      w.units || 0,
//      w.sqft || 0
//    ]);
//    autoTable(doc, {
//      head: [tableColumn],
//      body: tableRows,
//      startY: 58,
//      theme: "grid",
//      styles: { fontSize: 7 },
//      headStyles: { fillColor: [44, 62, 80] }
//    });
//    const finalY = (doc.lastAutoTable?.finalY || 58) + 10;
//    const totalSqFt = windows
//      .reduce((sum, w) => sum + (parseFloat(w.sqft) || 0), 0)
//      .toFixed(2);
//    doc.text(`Total SqFt: ${totalSqFt}`, 250, finalY);
//    doc.text("Prepared By: ________________", 14, finalY + 20);
//    doc.text("Checked By: ________________", 110, finalY + 20);
//    doc.text("Received By: ________________", 210, finalY + 20);
//    doc.save(`Onedeo_Report_Trip_${dispatchDetails.tripId || "All"}.pdf`);
//  };
//  return (
//    <div
//      style={{
//        padding: "25px",
//        fontFamily: "'Segoe UI', Tahoma, sans-serif",
//        backgroundColor: "#f9f9f9",
//        minHeight: "100vh"
//      }}
//    >
//      <div
//        style={{
//          display: "flex",
//          justifyContent: "space-between",
//          alignItems: "center",
//          borderBottom: "2px solid #3498db",
//          marginBottom: "20px",
//          paddingBottom: "10px"
//        }}
//      >
//        <h2 style={{ color: "#2c3e50", margin: 0 }}>
//          Window Logistics Management (Auto-Sync)
//        </h2>
//        <button
//          onClick={downloadPDF}
//          style={{
//            padding: "10px 20px",
//            backgroundColor: "#e67e22",
//            color: "white",
//            border: "none",
//            borderRadius: "4px",
//            cursor: "pointer",
//            fontWeight: "bold"
//          }}
//        >
//          📥 DOWNLOAD PDF REPORT
//        </button>
//      </div>
//      <div
//        style={{
//          backgroundColor: "#fff",
//          padding: "20px",
//          borderRadius: "8px",
//          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
//          marginBottom: "25px"
//        }}
//      >
//        <h4 style={{ marginTop: 0 }}>Project / Dispatch Details</h4>
//        <div
//          style={{
//            display: "grid",
//            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
//            gap: "15px"
//          }}
//        >
//          <div>
//            <label style={{ fontSize: "11px", color: "#7f8c8d", textTransform: "uppercase" }}>
//              Project Name
//            </label>
//            <input
//              name="projectName"
//              value={dispatchDetails.projectName}
//              onChange={handleDispatchChange}
//              placeholder="Project Name"
//              style={{
//                width: "100%",
//                padding: "8px",
//                borderRadius: "4px",
//                border: "1px solid #ddd",
//                boxSizing: "border-box"
//              }}
//            />
//          </div>
//          <div>
//            <label style={{ fontSize: "11px", color: "#7f8c8d", textTransform: "uppercase" }}>
//              DC No
//            </label>
//            <input
//              name="dcNo"
//              value={dispatchDetails.dcNo}
//              onChange={handleDispatchChange}
//              placeholder="DC No"
//              style={{
//                width: "100%",
//                padding: "8px",
//                borderRadius: "4px",
//                border: "1px solid #ddd",
//                boxSizing: "border-box"
//              }}
//            />
//          </div>
//          <div>
//            <label style={{ fontSize: "11px", color: "#7f8c8d", textTransform: "uppercase" }}>
//              Work Order Number
//            </label>
//            <input
//              name="workOrderNumber"
//              value={dispatchDetails.workOrderNumber}
//              onChange={handleDispatchChange}
//              placeholder="Work Order Number"
//              style={{
//                width: "100%",
//                padding: "8px",
//                borderRadius: "4px",
//                border: "1px solid #ddd",
//                boxSizing: "border-box"
//              }}
//            />
//          </div>
//
//          <div>
//            <label style={{ fontSize: "11px", color: "#7f8c8d", textTransform: "uppercase" }}>
//              Code No
//            </label>
//            <input
//              name="codeNo"
//              value={dispatchDetails.codeNo}
//              onChange={handleDispatchChange}
//              placeholder="Code No"
//              style={{
//                width: "100%",
//                padding: "8px",
//                borderRadius: "4px",
//                border: "1px solid #ddd",
//                boxSizing: "border-box"
//              }}
//            />
//          </div>
//          <div>
//            <label style={{ fontSize: "11px", color: "#7f8c8d", textTransform: "uppercase" }}>
//              Trip ID
//            </label>
//            <input
//              name="tripId"
//              type="number"
//              value={dispatchDetails.tripId}
//              onChange={handleDispatchChange}
//              placeholder="Trip ID"
//              style={{
//                width: "100%",
//                padding: "8px",
//                borderRadius: "4px",
//                border: "1px solid #ddd",
//                boxSizing: "border-box"
//              }}
//            />
//          </div>
//
//          <div style={{ display: "flex", alignItems: "flex-end" }}>
//            <button
//              onClick={submitProjectLog}
//              style={{
//                width: "100%",
//                padding: "10px 15px",
//                backgroundColor: "#8e44ad",
//                color: "white",
//                border: "none",
//                borderRadius: "4px",
//                cursor: "pointer",
//                fontWeight: "bold"
//              }}
//            >
//              SUBMIT PROJECT LOG
//            </button>
//          </div>
//        </div>
//      </div>
//
//      <div
//        style={{
//          backgroundColor: "#fff",
//          padding: "20px",
//          borderRadius: "8px",
//          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
//          marginBottom: "25px"
//        }}
//      >
//        <div
//          style={{
//            display: "flex",
//            gap: "15px",
//            alignItems: "flex-end",
//            flexWrap: "wrap",
//            marginBottom: "20px"
//          }}
//        >
//          <div>
//            <label style={{ fontSize: "12px", fontWeight: "bold" }}>FLAT NUMBER</label>
//            <br />
//            <input
//              type="number"
//              value={flatNumber}
//              onChange={(e) => setFlatNumber(e.target.value)}
//              style={{ padding: "8px" }}
//            />
//          </div>
//
//          <div>
//            <button
//              onClick={getWindowsByTrip}
//              style={{
//                padding: "10px 15px",
//                backgroundColor: "#3498db",
//                color: "white",
//                border: "none",
//                borderRadius: "4px",
//                cursor: "pointer",
//                marginRight: "10px"
//              }}
//            >
//              Filter by Trip
//            </button>
//
//            <button
//              onClick={getAllWindows}
//              style={{
//                padding: "10px 15px",
//                backgroundColor: "#95a5a6",
//                color: "white",
//                border: "none",
//                borderRadius: "4px",
//                cursor: "pointer"
//              }}
//            >
//              Refresh All Data
//            </button>
//          </div>
//        </div>
//
//        <h4 style={{ marginTop: 0 }}>Add New Window Details</h4>
//        <div
//          style={{
//            display: "grid",
//            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
//            gap: "15px"
//          }}
//        >
//          {Object.keys(initialState).map((key) => (
//            <div key={key}>
//              <label
//                style={{
//                  fontSize: "11px",
//                  color: "#7f8c8d",
//                  textTransform: "uppercase"
//                }}
//              >
//                {key.replace(/([A-Z])/g, " $1")}
//              </label>
//              <input
//                name={key}
//                value={formData[key]}
//                onChange={handleChange}
//                placeholder={key}
//                style={{
//                  width: "100%",
//                  padding: "8px",
//                  borderRadius: "4px",
//                  border: "1px solid #ddd",
//                  boxSizing: "border-box"
//                }}
//              />
//            </div>
//          ))}
//        </div>
//        <button
//          onClick={createWindow}
//          style={{
//            marginTop: "20px",
//            padding: "12px 30px",
//            backgroundColor: "#27ae60",
//            color: "white",
//            border: "none",
//            borderRadius: "4px",
//            cursor: "pointer",
//            fontWeight: "bold"
//          }}
//        >
//          SUBMIT WINDOW TO DATABASE
//        </button>
//      </div>
//
//      <h3 style={{ marginTop: "40px", color: "#2c3e50" }}>Data Results (Database View)</h3>
//      <div
//        style={{
//          overflowX: "auto",
//          background: "#fff",
//          borderRadius: "8px",
//          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
//        }}
//      >
//        <table
//          border="1"
//          cellPadding="10"
//          style={{
//            width: "100%",
//            borderCollapse: "collapse",
//            fontSize: "12px",
//            textAlign: "left"
//          }}
//        >
//          <thead style={{ backgroundColor: "#2c3e50", color: "#ecf0f1" }}>
//            <tr>
//              <th>Sr.No</th>
//              <th>Trip ID</th>
//              <th>Win Series</th>
//              <th>Flat No</th>
//              <th>Location</th>
//              <th>W-Code</th>
//              <th>Dimensions (WxH)</th>
//              <th>Units</th>
//              <th>SqFt</th>
//              <th>Trip Status</th>
//            </tr>
//          </thead>
//          <tbody>
//            {loading ? (
//              <tr>
//                <td colSpan="10" style={{ textAlign: "center", padding: "30px", color: "#95a5a6" }}>
//                  Fetching data from server...
//                </td>
//              </tr>
//            ) : windows.length > 0 ? (
//              windows.map((w, index) => (
//                <tr
//                  key={w.windowId || index}
//                  onClick={() => setSelectedWindow(w)}
//                  style={{ borderBottom: "1px solid #eee", cursor: "pointer" }}
//                >
//                  <td>{index + 1}</td>
//                  <td style={{ fontWeight: "bold", color: "#2980b9" }}>
//                    {w.trip?.id || w.tripId || "N/A"}
//                  </td>
//                  <td style={{ fontWeight: "bold" }}>{w.windowSeriesNumber || "N/A"}</td>
//                  <td style={{ color: "#e67e22", fontWeight: "bold" }}>
//                    {w.flat?.flatNumber || w.flatNumber || w.flatId || "N/A"}
//                  </td>
//                  <td>{w.location || "N/A"}</td>
//                  <td>{w.wcodeNo || w.wCodeNo || "N/A"}</td>
//                  <td>
//                    {w.width || 0} x {w.height || 0}
//                  </td>
//                  <td>{w.units || 0}</td>
//                  <td>{w.sqft || 0}</td>
//                  <td style={{ fontSize: "10px", color: "#7f8c8d" }}>
//                    {w.trip?.status || (w.tripId ? "ASSIGNED" : "NO TRIP")}
//                  </td>
//                </tr>
//              ))
//            ) : (
//              <tr>
//                <td colSpan="10" style={{ textAlign: "center", padding: "30px", color: "#95a5a6" }}>
//                  No window data found.
//                </td>
//              </tr>
//            )}
//          </tbody>
//        </table>
//      </div>
//
//      {selectedWindow && (
//        <div
//          style={{
//            position: "fixed",
//            top: 0,
//            left: 0,
//            width: "100%",
//            height: "100%",
//            background: "rgba(0,0,0,0.7)",
//            display: "flex",
//            justifyContent: "center",
//            alignItems: "center",
//            zIndex: 1000
//          }}
//        >
//          <div
//            style={{
//              background: "#fff",
//              padding: "30px",
//              borderRadius: "12px",
//              width: "80%",
//              maxHeight: "90vh",
//              overflowY: "auto",
//              position: "relative",
//              boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
//            }}
//          >
//            <button
//              onClick={() => setSelectedWindow(null)}
//              style={{
//                position: "absolute",
//                top: "15px",
//                right: "15px",
//                border: "none",
//                background: "#e74c3c",
//                color: "white",
//                borderRadius: "50%",
//                width: "30px",
//                height: "30px",
//                cursor: "pointer",
//                fontWeight: "bold"
//              }}
//            >
//              X
//            </button>
//
//            <h3
//              style={{
//                borderBottom: "3px solid #3498db",
//                paddingBottom: "10px",
//                color: "#2c3e50"
//              }}
//            >
//              Window Detailed Record: #{selectedWindow.windowId}
//            </h3>
//
//            <div
//              style={{
//                display: "grid",
//                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
//                gap: "25px",
//                marginTop: "20px"
//              }}
//            >
//              <div style={{ background: "#f1f4f9", padding: "20px", borderRadius: "8px" }}>
//                <h4 style={{ color: "#2980b9", marginTop: 0 }}>Production Details</h4>
//                <p><strong>Job Card:</strong> {selectedWindow.jobCardNo || "N/A"}</p>
//                <p><strong>Series Type:</strong> {selectedWindow.series || "N/A"}</p>
//                <p><strong>W-Code:</strong> {selectedWindow.wcodeNo || selectedWindow.wCodeNo || "N/A"}</p>
//                <p><strong>Description:</strong> {selectedWindow.description || "N/A"}</p>
//                <p><strong>Remark:</strong> {selectedWindow.remark || "None"}</p>
//              </div>
//              <div style={{ background: "#f1f4f9", padding: "20px", borderRadius: "8px" }}>
//                <h4 style={{ color: "#2980b9", marginTop: 0 }}>Technical Specs</h4>
//                <p><strong>Dimensions:</strong> {selectedWindow.width || 0}mm (W) x {selectedWindow.height || 0}mm (H)</p>
//                <p><strong>Total Area:</strong> {selectedWindow.sqft || 0} SqFt</p>
//                <p><strong>Units:</strong> {selectedWindow.units || 0}</p>
//                <p><strong>Track Outer:</strong> {selectedWindow.trackOuter || 0}</p>
//                <p><strong>Glass Shutters:</strong> {selectedWindow.glassShutter || 0}</p>
//                <p><strong>Mesh Shutters:</strong> {selectedWindow.meshShutter || 0}</p>
//              </div>
//
//              <div style={{ background: "#f1f4f9", padding: "20px", borderRadius: "8px" }}>
//                <h4 style={{ color: "#d35400", marginTop: 0 }}>Logistics & Site</h4>
//                <p><strong>Flat No:</strong> {selectedWindow.flat?.flatNumber || selectedWindow.flatNumber || selectedWindow.flatId || "N/A"}</p>
//                <p><strong>Trip ID:</strong> {selectedWindow.trip?.id || selectedWindow.tripId || "N/A"}</p>
//                {selectedWindow.trip && (
//                  <>
//                    <p>
//                      <strong>Trip Status:</strong>{" "}
//                      <span
//                        style={{
//                          color: selectedWindow.trip.status === "CANCELLED" ? "red" : "green",
//                          fontWeight: "bold"
//                        }}
//                      >
//                        {selectedWindow.trip.status}
//                      </span>
//                    </p>
//                    <p><strong>Vehicle:</strong> {selectedWindow.trip.vehicleNumber || "N/A"}</p>
//                    <p><strong>Driver:</strong> {selectedWindow.trip.driverName || "N/A"}</p>
//                    <p>
//                      <strong>Trip Date:</strong>{" "}
//                      {selectedWindow.trip.tripDate
//                        ? new Date(selectedWindow.trip.tripDate).toLocaleDateString()
//                        : "N/A"}
//                    </p>
//                  </>
//                )}
//              </div>
//            </div>
//          </div>
//        </div>
//      )}
//    </div>
//  );
//};
//export default WindowManager;

import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const WindowManager = () => {
  const [tripId, setTripId] = useState("");
  const [flatNumber, setFlatNumber] = useState("");
  const [windows, setWindows] = useState([]);
  const [selectedWindow, setSelectedWindow] = useState(null);
  const [loading, setLoading] = useState(false);

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
  }, []);

  const handleDispatchChange = (e) => {
    const { name, value } = e.target;

    if (name === "tripId") {
      setTripId(value);
    }

    setDispatchDetails((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      const widthValue = name === "width" ? value : prev.width;
      const heightValue = name === "height" ? value : prev.height;
      const w = parseFloat(widthValue);
      const h = parseFloat(heightValue);

      if (!isNaN(w) && !isNaN(h)) {
        updated.sqft = (w * h).toFixed(2);
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
      console.log("Database synced: All entries loaded.");
    } catch (error) {
      console.error("Initial load failed:", error);
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
        projectName: dispatchDetails.projectName,
        dcNo: dispatchDetails.dcNo,
        workOrderNumber: dispatchDetails.workOrderNumber,
        codeNo: dispatchDetails.codeNo,
        tripId: parseInt(dispatchDetails.tripId)
      };

      await axios.post(`${API_URL}/logs`, payload);
      alert("Project Log Submitted Successfully!");
    } catch (error) {
      console.error("Project Log Submission Error:", error);
      alert("Failed to submit project log");
    }
  };

  const createWindow = async () => {
    try {
      if (!dispatchDetails.tripId?.toString().trim() || !flatNumber?.toString().trim()) {
        alert("Please enter both Trip ID and Flat Number");
        return;
      }

      const payload = {
        ...formData,
        width: parseFloat(formData.width) || 0.0,
        height: parseFloat(formData.height) || 0.0,
        trackOuter: parseInt(formData.trackOuter) || 0,
        bottomFix: parseInt(formData.bottomFix) || 0,
        glassShutter: parseInt(formData.glassShutter) || 0,
        meshShutter: parseInt(formData.meshShutter) || 0,
        units: parseInt(formData.units) || 0,
        sqft: parseFloat(formData.sqft) || 0.0
      };

      await axios.post(
        `${API_URL}/windows/trip/${dispatchDetails.tripId}/flat/${flatNumber}`,
        payload
      );

      alert("Window Created Successfully!");
      setFormData(initialState);
      getAllWindows();
    } catch (error) {
      console.error("Creation Error:", error);
      alert("Check backend connection (CORS/Server)");
    }
  };

  const getWindowsByTrip = async () => {
    if (!dispatchDetails.tripId) {
      alert("Enter Trip ID");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/windows/trip/${dispatchDetails.tripId}/windows`
      );
      setWindows(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching windows for trip:", error);
      setWindows([]);
      alert("Error fetching windows for this trip");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF("landscape");

    doc.setFontSize(16);
    doc.text("ONEDEO LEELA FAÇADE SYSTEMS PRIVATE LIMITED", 148, 15, {
      align: "center"
    });
    doc.setFontSize(8);
    doc.text("Building No/Flat No 327, Bopgaon Chouck, Pune, Maharashtra 412301", 148, 22, {
      align: "center"
    });

    doc.setFontSize(10);
    doc.text(`Project Name: ${dispatchDetails.projectName || "N/A"}`, 14, 32);
    doc.text(`DC No: ${dispatchDetails.dcNo || dispatchDetails.tripId || "N/A"}`, 14, 38);
    doc.text(`Work Order No: ${dispatchDetails.workOrderNumber || "N/A"}`, 14, 44);
    doc.text(`Code No: ${dispatchDetails.codeNo || "N/A"}`, 14, 50);
    doc.text(`Trip ID: ${dispatchDetails.tripId || tripId || "N/A"}`, 220, 32);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 220, 38);
    doc.text(`Vehicle No: ${windows?.[0]?.trip?.vehicleNumber || "N/A"}`, 220, 44);

    const tableColumn = [
      "Sr.",
      "Trip ID",
      "Win.Sr",
      "Flat",
      "Loc",
      "W.Code",
      "Job Card",
      "Series",
      "Width",
      "Height",
      "Trk",
      "Bot",
      "Glass",
      "Mesh",
      "Unit",
      "SqFt"
    ];

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
    const totalSqFt = windows
      ?.reduce((sum, w) => sum + (parseFloat(w?.sqft) || 0), 0)
      .toFixed(2);

    doc.text(`Total SqFt: ${totalSqFt}`, 250, finalY);
    doc.text("Prepared By: ________________", 14, finalY + 20);
    doc.text("Checked By: ________________", 110, finalY + 20);
    doc.text("Received By: ________________", 210, finalY + 20);

    doc.save(`Onedeo_Report_Trip_${dispatchDetails.tripId || "All"}.pdf`);
  };

  return (
    <div
      style={{
        padding: "25px",
        fontFamily: "'Segoe UI', Tahoma, sans-serif",
        backgroundColor: "#f9f9f9",
        minHeight: "100vh"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "2px solid #3498db",
          marginBottom: "20px",
          paddingBottom: "10px"
        }}
      >
        <h2 style={{ color: "#2c3e50", margin: 0 }}>
          Window Logistics Management (Auto-Sync)
        </h2>
        <button
          onClick={downloadPDF}
          style={{
            padding: "10px 20px",
            backgroundColor: "#e67e22",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          📥 DOWNLOAD PDF REPORT
        </button>
      </div>

      <div
        style={{
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          marginBottom: "25px"
        }}
      >
        <h4 style={{ marginTop: 0 }}>Project / Dispatch Details</h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "15px"
          }}
        >
          <div>
            <label style={{ fontSize: "11px", color: "#7f8c8d", textTransform: "uppercase" }}>
              Project Name
            </label>
            <input
              name="projectName"
              value={dispatchDetails.projectName}
              onChange={handleDispatchChange}
              placeholder="Project Name"
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ddd",
                boxSizing: "border-box"
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: "11px", color: "#7f8c8d", textTransform: "uppercase" }}>
              DC No
            </label>
            <input
              name="dcNo"
              value={dispatchDetails.dcNo}
              onChange={handleDispatchChange}
              placeholder="DC No"
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ddd",
                boxSizing: "border-box"
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: "11px", color: "#7f8c8d", textTransform: "uppercase" }}>
              Work Order Number
            </label>
            <input
              name="workOrderNumber"
              value={dispatchDetails.workOrderNumber}
              onChange={handleDispatchChange}
              placeholder="Work Order Number"
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ddd",
                boxSizing: "border-box"
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: "11px", color: "#7f8c8d", textTransform: "uppercase" }}>
              Code No
            </label>
            <input
              name="codeNo"
              value={dispatchDetails.codeNo}
              onChange={handleDispatchChange}
              placeholder="Code No"
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ddd",
                boxSizing: "border-box"
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: "11px", color: "#7f8c8d", textTransform: "uppercase" }}>
              Trip ID
            </label>
            <input
              name="tripId"
              type="number"
              value={dispatchDetails.tripId}
              onChange={handleDispatchChange}
              placeholder="Trip ID"
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ddd",
                boxSizing: "border-box"
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button
              onClick={submitProjectLog}
              style={{
                width: "100%",
                padding: "10px 15px",
                backgroundColor: "#8e44ad",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              SUBMIT PROJECT LOG
            </button>
          </div>
        </div>
      </div>

      <div
        style={{
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          marginBottom: "25px"
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "15px",
            alignItems: "flex-end",
            flexWrap: "wrap",
            marginBottom: "20px"
          }}
        >
          <div>
            <label style={{ fontSize: "12px", fontWeight: "bold" }}>FLAT NUMBER</label>
            <br />
            <input
              type="number"
              value={flatNumber}
              onChange={(e) => setFlatNumber(e.target.value)}
              style={{ padding: "8px" }}
            />
          </div>

          <div>
            <button
              onClick={getWindowsByTrip}
              style={{
                padding: "10px 15px",
                backgroundColor: "#3498db",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                marginRight: "10px"
              }}
            >
              Filter by Trip
            </button>

            <button
              onClick={getAllWindows}
              style={{
                padding: "10px 15px",
                backgroundColor: "#95a5a6",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Refresh All Data
            </button>
          </div>
        </div>

        <h4 style={{ marginTop: 0 }}>Add New Window Details</h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: "15px"
          }}
        >
          {Object.keys(initialState).map((key) => (
            <div key={key}>
              <label
                style={{
                  fontSize: "11px",
                  color: "#7f8c8d",
                  textTransform: "uppercase"
                }}
              >
                {key.replace(/([A-Z])/g, " $1")}
              </label>
              <input
                name={key}
                value={formData[key]}
                onChange={handleChange}
                placeholder={key}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                  boxSizing: "border-box"
                }}
              />
            </div>
          ))}
        </div>

        <button
          onClick={createWindow}
          style={{
            marginTop: "20px",
            padding: "12px 30px",
            backgroundColor: "#27ae60",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          SUBMIT WINDOW TO DATABASE
        </button>
      </div>

      <h3 style={{ marginTop: "40px", color: "#2c3e50" }}>Data Results (Database View)</h3>
      <div
        style={{
          overflowX: "auto",
          background: "#fff",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}
      >
        <table
          border="1"
          cellPadding="10"
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "12px",
            textAlign: "left"
          }}
        >
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
              <tr>
                <td colSpan="10" style={{ textAlign: "center", padding: "30px", color: "#95a5a6" }}>
                  Fetching data from server...
                </td>
              </tr>
            ) : windows.length > 0 ? (
              windows.map((w, index) => (
                <tr
                  key={w.windowId || index}
                  onClick={() => setSelectedWindow(w)}
                  style={{ borderBottom: "1px solid #eee", cursor: "pointer" }}
                >
                  <td>{index + 1}</td>
                  <td style={{ fontWeight: "bold", color: "#2980b9" }}>
                    {w?.trip?.id ?? w?.tripId ?? "N/A"}
                  </td>
                  <td style={{ fontWeight: "bold" }}>{w.windowSeriesNumber || "N/A"}</td>
                  <td style={{ color: "#e67e22", fontWeight: "bold" }}>
                    {w?.flat?.flatNumber ?? w?.flatNumber ?? w?.flatId ?? "N/A"}
                  </td>
                  <td>{w.location || "N/A"}</td>
                  <td>{w.wcodeNo || w.wCodeNo || "N/A"}</td>
                  <td>
                    {w.width || 0} x {w.height || 0}
                  </td>
                  <td>{w.units || 0}</td>
                  <td>{w.sqft || 0}</td>
                  <td style={{ fontSize: "10px", color: "#7f8c8d" }}>
                    {w.trip?.status || (w.tripId ? "ASSIGNED" : "NO TRIP")}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" style={{ textAlign: "center", padding: "30px", color: "#95a5a6" }}>
                  No window data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedWindow && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "30px",
              borderRadius: "12px",
              width: "80%",
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
            }}
          >
            <button
              onClick={() => setSelectedWindow(null)}
              style={{
                position: "absolute",
                top: "15px",
                right: "15px",
                border: "none",
                background: "#e74c3c",
                color: "white",
                borderRadius: "50%",
                width: "30px",
                height: "30px",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              X
            </button>

            <h3
              style={{
                borderBottom: "3px solid #3498db",
                paddingBottom: "10px",
                color: "#2c3e50"
              }}
            >
              Window Detailed Record: #{selectedWindow.windowId}
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "25px",
                marginTop: "20px"
              }}
            >
              <div style={{ background: "#f1f4f9", padding: "20px", borderRadius: "8px" }}>
                <h4 style={{ color: "#2980b9", marginTop: 0 }}>Production Details</h4>
                <p><strong>Job Card:</strong> {selectedWindow.jobCardNo || "N/A"}</p>
                <p><strong>Series Type:</strong> {selectedWindow.series || "N/A"}</p>
                <p><strong>W-Code:</strong> {selectedWindow.wcodeNo || selectedWindow.wCodeNo || "N/A"}</p>
                <p><strong>Description:</strong> {selectedWindow.description || "N/A"}</p>
                <p><strong>Remark:</strong> {selectedWindow.remark || "None"}</p>
              </div>

              <div style={{ background: "#f1f4f9", padding: "20px", borderRadius: "8px" }}>
                <h4 style={{ color: "#2980b9", marginTop: 0 }}>Technical Specs</h4>
                <p><strong>Dimensions:</strong> {selectedWindow.width || 0}mm (W) x {selectedWindow.height || 0}mm (H)</p>
                <p><strong>Total Area:</strong> {selectedWindow.sqft || 0} SqFt</p>
                <p><strong>Units:</strong> {selectedWindow.units || 0}</p>
                <p><strong>Track Outer:</strong> {selectedWindow.trackOuter || 0}</p>
                <p><strong>Glass Shutters:</strong> {selectedWindow.glassShutter || 0}</p>
                <p><strong>Mesh Shutters:</strong> {selectedWindow.meshShutter || 0}</p>
              </div>

              <div style={{ background: "#f1f4f9", padding: "20px", borderRadius: "8px" }}>
                <h4 style={{ color: "#d35400", marginTop: 0 }}>Logistics & Site</h4>
                <p><strong>Flat No:</strong> {selectedWindow.flat?.flatNumber || selectedWindow.flatNumber || selectedWindow.flatId || "N/A"}</p>
                <p><strong>Trip ID:</strong> {selectedWindow.trip?.id || selectedWindow.tripId || "N/A"}</p>
                {selectedWindow.trip && (
                  <>
                    <p>
                      <strong>Trip Status:</strong>{" "}
                      <span
                        style={{
                          color: selectedWindow.trip.status === "CANCELLED" ? "red" : "green",
                          fontWeight: "bold"
                        }}
                      >
                        {selectedWindow.trip.status}
                      </span>
                    </p>
                    <p><strong>Vehicle:</strong> {selectedWindow.trip.vehicleNumber || "N/A"}</p>
                    <p><strong>Driver:</strong> {selectedWindow.trip.driverName || "N/A"}</p>
                    <p>
                      <strong>Trip Date:</strong>{" "}
                      {selectedWindow.trip.tripDate
                        ? new Date(selectedWindow.trip.tripDate).toLocaleDateString()
                        : "N/A"}
                    </p>
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