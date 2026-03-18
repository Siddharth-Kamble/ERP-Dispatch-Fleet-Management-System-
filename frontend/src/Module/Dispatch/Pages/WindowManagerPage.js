//
//import React, { useState, useEffect } from "react";
//import axios from "axios";
//import jsPDF from "jspdf";
//import autoTable from "jspdf-autotable";
//
//const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
//
//const [floors, setFloors] = useState([]);      // Floors for selected project
//const [selectedFloor, setSelectedFloor] = useState("");  // Currently selected floor
//const [flats, setFlats] = useState([]);
// // -------------------- ADD HERE --------------------
// const fetchDispatchDetails = async (tripId) => {
//   if (!tripId) return;
//
//   try {
//     const response = await axios.get(`${API_URL}/logs/trip/${tripId}`);
//     if (response.data) {
//       setDispatchDetails({
//         projectName: response.data.projectName || "",
//         dcNo: response.data.dcNo || "",
//         workOrderNumber: response.data.workOrderNumber || "",
//         codeNo: response.data.codeNo || "",
//         tripId: response.data.tripId || tripId
//       });
//     } else {
//       // Optional: clear fields if no data exists
//       setDispatchDetails((prev) => ({ ...prev, tripId }));
//     }
//   } catch (error) {
//     console.error("Error fetching dispatch details:", error);
//     alert("Failed to fetch project/dispatch details.");
//   }
// };
//const WindowManager = () => {
////  const [tripId, setTripId] = useState("");
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
//   const [projects, setProjects] = useState([]);
//  useEffect(() => {
//    getAllWindows();
//  }, []);
//  useEffect(() => {
//    getAllWindows(); // your existing function
//
//    const fetchProjects = async () => {
//      try {
//        const response = await axios.get(`${API_URL}/projects`);
//        setProjects(response.data || []);
//      } catch (error) {
//        console.error("Error fetching projects:", error);
//        setProjects([]);
//      }
//    };
//
//    fetchProjects();
//  }, []);
//
//
//const handleDispatchChange = async (e) => {
//  const { name, value } = e.target;
//  setDispatchDetails(prev => ({ ...prev, [name]: value }));
//
//  if (name === "projectName" && value) {
//    try {
//      // Fetch project logs by project name
//      const logResponse = await axios.get(`${API_URL}/logs/project/${value}`);
//      const logs = logResponse.data;
//
//      if (logs && logs.length > 0) {
//        // Use latest log details
//        const latestLog = logs[0];
//        setDispatchDetails({
//          projectName: latestLog.projectName,
//          dcNo: latestLog.dcNo,
//          workOrderNumber: latestLog.workOrderNumber,
//          codeNo: latestLog.codeNo,
//          tripId: latestLog.tripId
//        });
//      } else {
//        // No logs exist, use project master
//        const project = projects.find(p => p.projectName === value);
//        if (project) {
//          setDispatchDetails(prev => ({
//            ...prev,
//            dcNo: project.dcNo || "",
//            workOrderNumber: project.workOrderNumber || "",
//            codeNo: project.codeNo || "",
//            tripId: "" // empty until user enters
//          }));
//        }
//      }
//    } catch (error) {
//      console.error("Error fetching project logs:", error);
//    }
//    // Fetch floors for selected project
//    try {
//      const floorResponse = await axios.get(`${API_URL}/floors/project/${value}`);
//      setFloors(floorResponse.data || []);
//      setSelectedFloor("");  // Reset floor selection
//      setFlats([]);          // Reset flats
//    } catch (error) {
//      console.error("Error fetching floors:", error);
//      setFloors([]);
//    }
//  }
//
//  // Trip ID change
//  if (name === "tripId" && value) {
//    fetchDispatchDetails(value);
//  }
//};
//
//  const handleChange = (e) => {
//    const { name, value } = e.target;
//
//    setFormData((prev) => {
//      const updated = { ...prev, [name]: value };
//      const widthValue = name === "width" ? value : prev.width;
//      const heightValue = name === "height" ? value : prev.height;
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
//  const handleFloorChange = (e) => {
//    const floorNumber = e.target.value;
//    setSelectedFloor(floorNumber);
//
//    // Generate flat numbers dynamically based on floor (assuming totalFlats is available)
//    const floorObj = floors.find(f => f.floorNumber.toString() === floorNumber);
//    if (floorObj && floorObj.totalFlats) {
//      const flatList = Array.from({ length: floorObj.totalFlats }, (_, i) => i + 1);
//      setFlats(flatList);
//    } else {
//      setFlats([]);
//    }
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
//
//      await axios.post(`${API_URL}/logs`, payload);
//      alert("Project Log Submitted Successfully!");
//    } catch (error) {
//      console.error("Project Log Submission Error:", error);
//      alert("Failed to submit project log");
//    }
//  };
//
//const createWindow = async () => {
//  try {
//    if (!dispatchDetails.tripId?.toString().trim() || !flatNumber?.toString().trim()) {
//      alert("Please enter both Trip ID in Dispatch Details and Flat Number");
//      return;
//    }
//
//    const payload = {
//      ...formData,
//      width: parseFloat(formData.width) || 0.0,
//      height: parseFloat(formData.height) || 0.0,
//      trackOuter: parseInt(formData.trackOuter) || 0,
//      bottomFix: parseInt(formData.bottomFix) || 0,
//      glassShutter: parseInt(formData.glassShutter) || 0,
//      meshShutter: parseInt(formData.meshShutter) || 0,
//      units: parseInt(formData.units) || 0,
//      sqft: parseFloat(formData.sqft) || 0.0
//    };
//
//    await axios.post(
//      `${API_URL}/windows/trip/${dispatchDetails.tripId}/flat/${flatNumber}`,
//      payload
//    );
//
//    alert("Window Created Successfully!");
//    setFormData(initialState);
//    getAllWindows();
//  } catch (error) {
//    console.error("Creation Error:", error);
//    alert("Check backend connection (CORS/Server)");
//  }
//};
//
//  const getWindowsByTrip = async () => {
//    if (!dispatchDetails.tripId) {
//      alert("Enter Trip ID");
//      return;
//    }
//
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
//    doc.text("ONEDEO LEELA FAÇADE SYSTEMS PRIVATE LIMITED", 148, 15, {
//      align: "center"
//    });
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
//   doc.text(`Trip ID: ${dispatchDetails.tripId || "N/A"}`, 220, 32);
//    doc.text(`Date: ${new Date().toLocaleDateString()}`, 220, 38);
//    doc.text(`Vehicle No: ${windows?.[0]?.trip?.vehicleNumber || "N/A"}`, 220, 44);
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
//      w?.trip?.id ?? w?.tripId ?? "N/A",
//      w.windowSeriesNumber || "N/A",
//      w?.flat?.flatNumber ?? w?.flatNumber ?? w?.flatId ?? "N/A",
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
//      ?.reduce((sum, w) => sum + (parseFloat(w?.sqft) || 0), 0)
//      .toFixed(2);
//
//    doc.text(`Total SqFt: ${totalSqFt}`, 250, finalY);
//    doc.text("Prepared By: ________________", 14, finalY + 20);
//    doc.text("Checked By: ________________", 110, finalY + 20);
//    doc.text("Received By: ________________", 210, finalY + 20);
//
//    doc.save(`Onedeo_Report_Trip_${dispatchDetails.tripId || "All"}.pdf`);
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
//<div>
//  <label
//    style={{
//      fontSize: "11px",
//      color: "#7f8c8d",
//      textTransform: "uppercase"
//    }}
//  >
//    Project Name
//  </label>
//  <select
//    name="projectName"
//    value={dispatchDetails.projectName}
//    onChange={handleDispatchChange}
//    style={{
//      width: "100%",
//      padding: "8px",
//      borderRadius: "4px",
//      border: "1px solid #ddd",
//      boxSizing: "border-box",
//      backgroundColor: "#fff"
//    }}
//  >
//    <option value="">-- Select Project --</option>
//    {projects.map((p, index) => (
//      <option key={index} value={p.projectName}>
//        {p.projectName}
//      </option>
//    ))}
//  </select>
//</div>
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
//
//        <>
//      <h4 style={{ marginTop: 0 }}>Add New Window Details</h4>
//      <div
//        style={{
//          display: "grid",
//          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
//          gap: "15px"
//        }}
//      >
//        {/* Floor Dropdown */}
//        <div>
//          <label style={{ fontSize: "11px", color: "#7f8c8d", textTransform: "uppercase" }}>Floor</label>
//          <select
//            value={selectedFloor}
//            onChange={handleFloorChange}
//            style={{
//              width: "100%",
//              padding: "8px",
//              borderRadius: "4px",
//              border: "1px solid #ddd",
//              backgroundColor: "#fff"
//            }}
//          >
//            <option value="">-- Select Floor --</option>
//            {floors.map((f) => (
//              <option key={f.floorId} value={f.floorNumber}>
//                {f.floorNumber}
//              </option>
//            ))}
//          </select>
//        </div>
//
//
//        {/* Flat Dropdown */}
//        <div>
//          <label style={{ fontSize: "11px", color: "#7f8c8d", textTransform: "uppercase" }}>Flat</label>
//          <select
//            value={flatNumber}
//            onChange={(e) => setFlatNumber(e.target.value)}
//            style={{
//              width: "100%",
//              padding: "8px",
//              borderRadius: "4px",
//              border: "1px solid #ddd",
//              backgroundColor: "#fff"
//            }}
//          >
//            <option value="">-- Select Flat --</option>
//            {flats.map((f, idx) => (
//              <option key={idx} value={f}>
//                {f}
//              </option>
//            ))}
//          </select>
//        </div>
//
//        {/* Other Window Inputs */}
//        {Object.keys(initialState).map((key) => (
//          <div key={key}>
//            <label
//              style={{
//                fontSize: "11px",
//                color: "#7f8c8d",
//                textTransform: "uppercase"
//              }}
//            >
//              {key.replace(/([A-Z])/g, " $1")}
//            </label>
//            <input
//              name={key}
//              value={formData[key]}
//              onChange={handleChange}
//              placeholder={key}
//              style={{
//                width: "100%",
//                padding: "8px",
//                borderRadius: "4px",
//                border: "1px solid #ddd",
//                boxSizing: "border-box"
//              }}
//            />
//          </div>
//        ))}
//      </div>
//
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
//                    {w?.trip?.id ?? w?.tripId ?? "N/A"}
//                  </td>
//                  <td style={{ fontWeight: "bold" }}>{w.windowSeriesNumber || "N/A"}</td>
//                  <td style={{ color: "#e67e22", fontWeight: "bold" }}>
//                    {w?.flat?.flatNumber ?? w?.flatNumber ?? w?.flatId ?? "N/A"}
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
//    import React, { useState, useEffect } from "react";
//    import axios from "axios";
//    import jsPDF from "jspdf";
//    import autoTable from "jspdf-autotable";
//
//    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
//
//    const WindowManager = () => {
//      const [windows, setWindows] = useState([]);
//      const [selectedWindow, setSelectedWindow] = useState(null);
//      const [loading, setLoading] = useState(false);
//      const [floors, setFloors] = useState([]);
//      const [selectedFloor, setSelectedFloor] = useState("");
//      const [flats, setFlats] = useState([]);
//      const [flatNumber, setFlatNumber] = useState("");
//      const [projects, setProjects] = useState([]);
//      const [dispatchDetails, setDispatchDetails] = useState({
//        projectName: "",
//        dcNo: "",
//        workOrderNumber: "",
//        codeNo: "",
//        tripId: ""
//      });
//
//      const initialState = {
//        windowSeriesNumber: "",
//        location: "",
//        wcodeNo: "",
//        jobCardNo: "",
//        series: "",
//        description: "",
//        width: "",
//        height: "",
//        trackOuter: "",
//        bottomFix: "",
//        glassShutter: "",
//        meshShutter: "",
//        units: "",
//        sqft: "",
//        remark: ""
//      };
//
//      const [formData, setFormData] = useState(initialState);
//
//      useEffect(() => {
//        getAllWindows();
//        fetchProjects();
//      }, []);
//
//      const fetchProjects = async () => {
//        try {
//          const response = await axios.get(`${API_URL}/projects`);
//          setProjects(response.data || []);
//        } catch (error) {
//          console.error("Error fetching projects:", error);
//          setProjects([]);
//        }
//      };
//
//      const fetchDispatchDetails = async (tripId) => {
//        if (!tripId) return;
//        try {
//          const response = await axios.get(`${API_URL}/logs/trip/${tripId}`);
//          if (response.data) {
//            setDispatchDetails(prev => ({
//              ...prev,
//              projectName: response.data.projectName || prev.projectName,
//              dcNo: response.data.dcNo || prev.dcNo,
//              workOrderNumber: response.data.workOrderNumber || prev.workOrderNumber,
//              codeNo: response.data.codeNo || prev.codeNo,
//              tripId: tripId
//            }));
//          }
//        } catch (error) {
//          console.error("Error fetching trip details:", error);
//        }
//      };
//
//     const handleDispatchChange = async (e) => {
//       const { name, value } = e.target;
//
//       // Update dispatchDetails state
//       setDispatchDetails(prev => ({ ...prev, [name]: value }));
//
//       // When projectName changes, fetch floors and optionally logs
//       if (name === "projectName" && value) {
//         // Find project object safely
//         const selectedProjectObj = projects.find(p => p.projectName === value);
//
//         if (selectedProjectObj) {
//           // Determine the backend key (id or projectId)
//           const projectId = selectedProjectObj.id ?? selectedProjectObj.projectId;
//
//           if (projectId) {
//             try {
//               // Fetch floors for selected project
//               const floorResponse = await axios.get(`${API_URL}/floors/project/${projectId}`);
//               setFloors(floorResponse.data || []);
//               setSelectedFloor("");
//               setFlats([]);
//             } catch (error) {
//               console.error("Error fetching floors:", error);
//               setFloors([]);
//               setSelectedFloor("");
//               setFlats([]);
//             }
//           } else {
//             console.warn("Project ID not found in selected project object");
//             setFloors([]);
//             setSelectedFloor("");
//             setFlats([]);
//           }
//         } else {
//           console.warn("Selected project object not found");
//           setFloors([]);
//           setSelectedFloor("");
//           setFlats([]);
//         }
//
//         // Optionally fetch latest logs for this project
//         try {
//           const logResponse = await axios.get(`${API_URL}/logs/project/${value}`);
//           if (logResponse.data && logResponse.data.length > 0) {
//             const latestLog = logResponse.data[0];
//             setDispatchDetails(prev => ({
//               ...prev,
//               dcNo: latestLog.dcNo || prev.dcNo,
//               workOrderNumber: latestLog.workOrderNumber || prev.workOrderNumber,
//               codeNo: latestLog.codeNo || prev.codeNo,
//               tripId: latestLog.tripId || prev.tripId
//             }));
//           }
//         } catch (error) {
//           console.error("Error fetching logs:", error);
//         }
//       }
//
//       // When tripId changes, fetch dispatch details
//       if (name === "tripId" && value) {
//         fetchDispatchDetails(value);
//       }
//     };
//
//      const handleFloorChange = async (e) => {
//        const floorId = e.target.value;
//        setSelectedFloor(floorId);
//        setFlatNumber("");
//
//        if (floorId) {
//          try {
//            const response = await axios.get(`${API_URL}/flats/floor/${floorId}`);
//            setFlats(response.data || []);
//          } catch (error) {
//            console.error("Error fetching flats:", error);
//            setFlats([]);
//          }
//        } else {
//          setFlats([]);
//        }
//      };
//
////      const handleChange = (e) => {
////        const { name, value } = e.target;
////        setFormData((prev) => {
////          const updated = { ...prev, [name]: value };
////          const w = parseFloat(name === "width" ? value : prev.width);
////          const h = parseFloat(name === "height" ? value : prev.height);
////          updated.sqft = (!isNaN(w) && !isNaN(h)) ? (w * h).toFixed(2) : "";
////          return updated;
////        });
////      };
//
//     const handleChange = (e) => {
//         const { name, value } = e.target;
//
//         setFormData((prev) => {
//           const updated = { ...prev, [name]: value };
//
//           // Get latest values from state/event
//           const w = parseFloat(name === "width" ? value : prev.width) || 0;
//           const h = parseFloat(name === "height" ? value : prev.height) || 0;
//           const u = parseInt(name === "units" ? value : prev.units) || 0;
//
//           // Apply formula: (W * H * Units / 1,000,000) * 10.764
//           if (w > 0 && h > 0 && u > 0) {
//             const calculatedSqft = ((w * h * u) / 1000000) * 10.764;
//             updated.sqft = calculatedSqft.toFixed(2);
//           } else {
//             updated.sqft = "";
//           }
//
//           return updated;
//         });
//       };
//
//      const getAllWindows = async () => {
//        setLoading(true);
//        try {
//          const response = await axios.get(`${API_URL}/windows/all`);
//          setWindows(Array.isArray(response.data) ? response.data : []);
//        } catch (error) {
//          console.error("Load failed:", error);
//          setWindows([]);
//        } finally {
//          setLoading(false);
//        }
//      };
//
//      const submitProjectLog = async () => {
//        try {
//          if (!dispatchDetails.projectName || !dispatchDetails.tripId) {
//            alert("Please enter both Project Name and Trip ID");
//            return;
//          }
//          const payload = {
//            ...dispatchDetails,
//            tripId: parseInt(dispatchDetails.tripId)
//          };
//          await axios.post(`${API_URL}/logs`, payload);
//          alert("Project Log Submitted Successfully!");
//        } catch (error) {
//          alert("Failed to submit project log");
//        }
//      };
//
// const createWindow = async () => {
//   try {
//     if (!dispatchDetails?.tripId || !flatNumber) {
//       alert("Please select a Trip and Flat Number.");
//       return;
//     }
//
//     const floorQuery = selectedFloor ? `?floorId=${selectedFloor}` : "";
//
//     const payload = {
//       ...formData,
//       wCodeNo: formData.wcodeNo, // Fixes the @JsonProperty mapping
//       // Ensure numeric types for the backend
//       width: parseFloat(formData.width) || 0,
//       height: parseFloat(formData.height) || 0,
//       units: parseInt(formData.units) || 0,
//       sqft: parseFloat(formData.sqft) || 0,
//       trackOuter: parseInt(formData.trackOuter) || 0,
//       bottomFix: parseInt(formData.bottomFix) || 0,
//       glassShutter: parseInt(formData.glassShutter) || 0,
//       meshShutter: parseInt(formData.meshShutter) || 0
//     };
//
//     const response = await axios.post(
//       `${API_URL}/windows/trip/${dispatchDetails.tripId}/flat/${flatNumber}${floorQuery}`,
//       payload
//     );
//
//     alert("Window created successfully!");
//     getAllWindows();
//     setFormData(initialState);
//   } catch (error) {
//     // This will now show you the specific "Flat not found" or "Trip not found" message
//     alert(`Error: ${error.response?.data?.message || "Check Console"}`);
//   }
// };
//
//      const downloadPDF = () => {
//        const doc = new jsPDF("landscape");
//        doc.setFontSize(16);
//        doc.text("ONEDEO LEELA FAÇADE SYSTEMS PRIVATE LIMITED", 148, 15, { align: "center" });
//        doc.setFontSize(8);
//        doc.text("Building No/Flat No 327, Bopgaon Chouck, Pune, Maharashtra 412301", 148, 22, { align: "center" });
//
//        doc.setFontSize(10);
//        doc.text(`Project Name: ${dispatchDetails.projectName || "N/A"}`, 14, 32);
//        doc.text(`Trip ID: ${dispatchDetails.tripId || "N/A"}`, 220, 32);
//
//        const tableColumn = ["Sr.", "Trip ID", "Win.Sr", "Flat", "Loc", "W.Code", "Job Card", "Series", "Width", "Height", "Trk", "Bot", "Glass", "Mesh", "Unit", "SqFt"];
//        const tableRows = windows.map((w, index) => [
//          index + 1,
//          w?.trip?.id ?? w?.tripId ?? "N/A",
//          w.windowSeriesNumber || "N/A",
//          w?.flat?.flatNumber ?? w?.flatNumber ?? w?.flatId ?? "N/A",
//          w.location || "N/A",
//          w.wcodeNo || "N/A",
//          w.jobCardNo || "N/A",
//          w.series || "N/A",
//          w.width || 0,
//          w.height || 0,
//          w.trackOuter || 0,
//          w.bottomFix || 0,
//          w.glassShutter || 0,
//          w.meshShutter || 0,
//          w.units || 0,
//          w.sqft || 0
//        ]);
//
//        autoTable(doc, {
//          head: [tableColumn],
//          body: tableRows,
//          startY: 58,
//          theme: "grid",
//          styles: { fontSize: 7 }
//        });
//        doc.save(`Onedeo_Report_Trip_${dispatchDetails.tripId || "All"}.pdf`);
//      };
//
//      return (
//        <div style={{ padding: "25px", fontFamily: "'Segoe UI', sans-serif", backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
//          {/* Header */}
//          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #3498db", marginBottom: "20px", paddingBottom: "10px" }}>
//            <h2 style={{ color: "#2c3e50", margin: 0 }}>Window Logistics Management (Auto-Sync)</h2>
//            <button onClick={downloadPDF} style={{ padding: "10px 20px", backgroundColor: "#e67e22", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
//              📥 DOWNLOAD PDF REPORT
//            </button>
//          </div>
//
//          {/* Dispatch Details */}
//          <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", marginBottom: "25px" }}>
//            <h4>Project / Dispatch Details</h4>
//            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "15px" }}>
//              {/* Project Select */}
//              <div>
//                <label style={{ fontSize: "11px", color: "#7f8c8d" }}>PROJECT NAME</label>
//                <select name="projectName" value={dispatchDetails.projectName} onChange={handleDispatchChange} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}>
//                  <option value="">-- Select Project --</option>
//                  {projects.map((p, index) => <option key={index} value={p.projectName}>{p.projectName}</option>)}
//                </select>
//              </div>
//
//              {/* Other Dispatch Inputs */}
//              {["dcNo", "workOrderNumber", "codeNo", "tripId"].map(field => (
//                <div key={field}>
//                  <label style={{ fontSize: "11px", color: "#7f8c8d" }}>{field.replace(/([A-Z])/g, " $1").toUpperCase()}</label>
//                  <input
//                    name={field}
//                    type={field === "tripId" ? "number" : "text"}
//                    value={dispatchDetails[field]}
//                    onChange={handleDispatchChange}
//                    style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
//                  />
//                </div>
//              ))}
//
//              <div style={{ display: "flex", alignItems: "flex-end" }}>
//                <button onClick={submitProjectLog} style={{ width: "100%", padding: "10px 15px", backgroundColor: "#8e44ad", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
//                  SUBMIT PROJECT LOG
//                </button>
//              </div>
//            </div>
//
//            {/* Floor & Flat */}
//            <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
//              <div style={{ flex: 1 }}>
//                <label style={{ fontSize: "11px", color: "#7f8c8d" }}>FLOOR</label>
//                <select value={selectedFloor} onChange={handleFloorChange} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}>
//                  <option value="">-- Select Floor --</option>
//                  {floors.map((f, idx) => (
//                    <option key={f.floorId || idx} value={f.floorId}>Floor {f.floorNumber}</option>
//                  ))}
//                </select>
//              </div>
//              <div style={{ flex: 1 }}>
//                <label style={{ fontSize: "11px", color: "#7f8c8d" }}>FLAT NUMBER</label>
//                <select
//                  value={flatNumber}
//                  onChange={(e) => setFlatNumber(e.target.value)} // This will now store "FLAT2502"
//                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
//                >
//                  <option value="">-- Select Flat --</option>
//                  {flats.map(flat => (
//                    <option key={flat.flatId} value={flat.flatNumber}> {/* Change this line */}
//                      {flat.flatNumber}
//                    </option>
//                  ))}
//                </select>
//              </div>
//            </div>
//          </div>
//
//          {/* Add Window Form */}
//          <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", marginBottom: "25px" }}>
//            <h4>Add New Window Details</h4>
//            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "15px" }}>
//              {Object.keys(initialState).map(key => (
//                <div key={key}>
//                  <label style={{ fontSize: "11px", color: "#7f8c8d" }}>{key.replace(/([A-Z])/g, " $1").toUpperCase()}</label>
//                  <input name={key} value={formData[key]} onChange={handleChange} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }} />
//                </div>
//              ))}
//            </div>
//            <button onClick={createWindow} style={{ marginTop: "20px", padding: "12px 30px", backgroundColor: "#27ae60", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
//              SUBMIT WINDOW TO DATABASE
//            </button>
//          </div>
//
//          {/* Database Table */}
//          <h3 style={{ marginTop: "40px", color: "#2c3e50" }}>Data Results (Database View)</h3>
//          <div style={{ overflowX: "auto", background: "#fff", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
//            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
//              <thead style={{ backgroundColor: "#2c3e50", color: "#ecf0f1" }}>
//                <tr>
//                  <th style={{ padding: "10px" }}>Sr.No</th>
//                  <th>Trip ID</th>
//                  <th>Win Series</th>
//                  <th>Flat No</th>
//                  <th>Location</th>
//                  <th>W-Code</th>
//                  <th>Dimensions</th>
//                  <th>Units</th>
//                  <th>SqFt</th>
//                  <th>Status</th>
//                </tr>
//              </thead>
//              <tbody>
//                {loading ? (
//                  <tr><td colSpan="10" style={{ textAlign: "center", padding: "20px" }}>Loading...</td></tr>
//                ) : windows.map((w, index) => (
//                  <tr key={w.windowId || index} onClick={() => setSelectedWindow(w)} style={{ borderBottom: "1px solid #eee", cursor: "pointer" }}>
//                    <td style={{ padding: "10px" }}>{index + 1}</td>
//                    <td>{w?.trip?.id ?? w?.tripId ?? "N/A"}</td>
//                    <td>{w.windowSeriesNumber}</td>
//                    <td>{w?.flat?.flatNumber ?? w?.flatId ?? "N/A"}</td>
//                    <td>{w.location}</td>
//                    <td>{w.wcodeNo}</td>
//                    <td>{w.width}x{w.height}</td>
//                    <td>{w.units}</td>
//                    <td>{w.sqft}</td>
//                    <td>{w.trip?.status || "ASSIGNED"}</td>
//                  </tr>
//                ))}
//              </tbody>
//            </table>
//          </div>
//
//          {/* Modal for Selected Window */}
//          {selectedWindow && (
//            <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
//              <div style={{ background: "#fff", padding: "30px", borderRadius: "12px", width: "80%", maxHeight: "90vh", overflowY: "auto", position: "relative" }}>
//                <button onClick={() => setSelectedWindow(null)} style={{ position: "absolute", top: "15px", right: "15px", background: "#e74c3c", color: "white", border: "none", borderRadius: "50%", width: "30px", height: "30px", cursor: "pointer" }}>X</button>
//                <h3>Window Detailed Record: #{selectedWindow.windowId}</h3>
//                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
//                  <div style={{ background: "#f1f4f9", padding: "15px", borderRadius: "8px" }}>
//                    <h4 style={{ color: "#2980b9" }}>Production</h4>
//                    <p><strong>Job Card:</strong> {selectedWindow.jobCardNo}</p>
//                    <p><strong>Series:</strong> {selectedWindow.series}</p>
//                    <p><strong>W-Code:</strong> {selectedWindow.wcodeNo}</p>
//                  </div>
//                  <div style={{ background: "#f1f4f9", padding: "15px", borderRadius: "8px" }}>
//                    <h4 style={{ color: "#2980b9" }}>Technical</h4>
//                    <p><strong>Area:</strong> {selectedWindow.sqft} SqFt</p>
//                    <p><strong>Units:</strong> {selectedWindow.units}</p>
//                  </div>
//                </div>
//              </div>
//            </div>
//          )}
//        </div>
//      );
//    };
//
//    export default WindowManager;

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