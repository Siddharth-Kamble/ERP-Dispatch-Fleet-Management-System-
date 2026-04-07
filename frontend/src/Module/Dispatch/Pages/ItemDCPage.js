//
//            import React, { useState, useEffect } from "react";
//            import axios from "axios";
//            import jsPDF from "jspdf";
//            import autoTable from "jspdf-autotable";
//            const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
//
//            const WindowManager = () => {
//              const [windows, setWindows] = useState([]);
//              const [selectedWindow, setSelectedWindow] = useState(null);
//              const [loading, setLoading] = useState(false);
//              const [floors, setFloors] = useState([]);
//              const [selectedFloor, setSelectedFloor] = useState("");
//              const [flats, setFlats] = useState([]);
//              const [flatNumber, setFlatNumber] = useState("");
//              const [projects, setProjects] = useState([]);
//              const [fromDate, setFromDate] = useState("");
//              const [toDate, setToDate] = useState("");
//              const [filterDate, setFilterDate] = useState("");
//              const [editModalVisible, setEditModalVisible] = useState(false);
//              const [editingWindow, setEditingWindow] = useState(null);
//              const [tripIdFilter, setTripIdFilter] = useState("");
//              const [excelFile, setExcelFile] = useState(null);
//              const [towers, setTowers] = useState([]);
//              const [selectedTower, setSelectedTower] = useState("");
//              const [dispatchDetails, setDispatchDetails] = useState({
//                projectName: "",
//                dcNo: "",
//                workOrderNumber: "",
//                codeNo: "",
//                tripId: "",
//                 userDate: ""
//              });
//
//             const initialState = {
//               srNo: "",
//               windowSrNo: "",
//               flatNo: "",
//               location: "",
//               jobCardNo: "",
//               description: "",
//               width: "",
//               height: "",
//               qty: "",
//               unit: "",
//               weight: "",
//               remarks: "",
//
//             };
//
//              const [formData, setFormData] = useState(initialState);
//
//              useEffect(() => {
//                getAllWindows();
//                fetchProjects();
//              }, []);
//
//              const fetchProjects = async () => {
//                try {
//                  const response = await axios.get(`${API_URL}/projects`);
//                  setProjects(response.data || []);
//                } catch (error) {
//                  console.error("Error fetching projects:", error);
//                  setProjects([]);
//                }
//              };
//
//              const fetchDispatchDetails = async (tripId) => {
//                if (!tripId) return;
//                try {
//                  const response = await axios.get(`${API_URL}/logs/trip/${tripId}`);
//                  if (response.data) {
//                    setDispatchDetails(prev => ({
//                      ...prev,
//                      projectName: response.data.projectName || prev.projectName,
//                      dcNo: response.data.dcNo || prev.dcNo,
//                      workOrderNumber: response.data.workOrderNumber || prev.workOrderNumber,
//                      codeNo: response.data.codeNo || prev.codeNo,
//                      tripId: tripId
//                    }));
//                  }
//                } catch (error) {
//                  console.error("Error fetching trip details:", error);
//                }
//              };
//
//
//
//
//
//const handleDispatchChange = async (e) => {
//  const { name, value } = e.target;
//  setDispatchDetails(prev => ({ ...prev, [name]: value }));
//
//  if (name === "projectName" && value) {
//    const selectedProjectObj = projects.find(p => p.projectName === value);
//    if (selectedProjectObj) {
//      const projectId = selectedProjectObj.id ?? selectedProjectObj.projectId;
//      if (projectId) {
//        try {
//          // NEW: fetch towers first
//    const towerResponse = await axios.get(`${API_URL}/api/towers/project/${projectId}`);
//          setTowers(towerResponse.data || []);
//          setSelectedTower("");
//          setFloors([]);
//          setSelectedFloor("");
//          setFlats([]);
//          setFlatNumber("");
//        } catch (error) {
//          console.error("Error fetching towers:", error);
//          setTowers([]);
//        }
//      }
//    }
//    try {
//      const logResponse = await axios.get(`${API_URL}/logs/project/${value}`);
//      if (logResponse.data && logResponse.data.length > 0) {
//        const latestLog = logResponse.data[0];
//        setDispatchDetails(prev => ({
//          ...prev,
//          dcNo: latestLog.dcNo || prev.dcNo,
//          workOrderNumber: latestLog.workOrderNumber || prev.workOrderNumber,
//          codeNo: latestLog.codeNo || prev.codeNo,
//          tripId: latestLog.tripId || prev.tripId
//        }));
//      }
//    } catch (error) {
//      console.error("Error fetching logs:", error);
//    }
//  }
//
//  if (name === "tripId" && value) {
//    fetchDispatchDetails(value);
//  }
//};
//
//
//
//
//
//
//const handleTowerChange = async (e) => {
//  const towerId = e.target.value;
//  setSelectedTower(towerId);
//  setFloors([]);
//  setSelectedFloor("");
//  setFlats([]);
//  setFlatNumber("");
//  if (towerId) {
//    try {
//      const floorResponse = await axios.get(`${API_URL}/floors/tower/${towerId}`);
//      setFloors(floorResponse.data || []);
//    } catch (error) {
//      console.error("Error fetching floors:", error);
//    }
//  }
//};
//
//              const handleFloorChange = async (e) => {
//                const floorId = e.target.value;
//                setSelectedFloor(floorId);
//                setFlatNumber("");
//                if (floorId) {
//                  try {
//                    const response = await axios.get(`${API_URL}/flats/floor/${floorId}`);
//                    setFlats(response.data || []);
//                  } catch (error) {
//                    console.error("Error fetching flats:", error);
//                    setFlats([]);
//                  }
//                } else {
//                  setFlats([]);
//                }
//              };
//
//              const handleChange = (e) => {
//                const { name, value } = e.target;
//
//                setFormData((prev) => {
//                  const updated = { ...prev, [name]: value };
//
//                  const w = parseFloat(name === "width" ? value : prev.width) || 0;
//                  const h = parseFloat(name === "height" ? value : prev.height) || 0;
//                  const q = parseInt(name === "qty" ? value : prev.qty) || 0;
//
//                  if (w > 0 && h > 0 && q > 0) {
//                    const calculatedWeight = ((w * h * q) / 1000000) * 10.764;
//                    updated.weight = calculatedWeight.toFixed(2);  // ✅ HERE ONLY CHANGE
//                  } else {
//                    updated.weight = "";
//                  }
//
//                  return updated;
//                });
//              };
//
//              const getAllWindows = async () => {
//                setLoading(true);
//                try {
//                  const response = await axios.get(`${API_URL}/api/items`);
//                  setWindows(Array.isArray(response.data) ? response.data : []);
//                } catch (error) {
//                  console.error("Load failed:", error);
//                  setWindows([]);
//                } finally {
//                  setLoading(false);
//                }
//              };
//
//
//const submitProjectLog = async () => {
//  if (!dispatchDetails.projectName || !selectedTower || !dispatchDetails.tripId) {
//    alert("Please select Project, Tower and enter Trip ID");
//    return;
//  }
//
//  try {
//    setLoading(true);
//
//    // Get Project ID from project name
//    const selectedProjectObj = projects.find(
//      (p) => p.projectName === dispatchDetails.projectName
//    );
//
//    const projectId = selectedProjectObj?.projectId || selectedProjectObj?.id;
//
//    const payload = {
//      projectName: dispatchDetails.projectName,
//      dcNo: dispatchDetails.dcNo,
//      workOrderNumber: dispatchDetails.workOrderNumber,
//      codeNo: dispatchDetails.codeNo,
//      tripId: Number(dispatchDetails.tripId),
//        userDate: dispatchDetails.userDate,   // ✅ ADD THIS
//      tower: {
//        towerId: Number(selectedTower), // ✅ correct
//      },
//    };
//
//    await axios.post(`${API_URL}/logs`, payload);
//
//    // ✅ Store correct values
//    localStorage.setItem("tripId", dispatchDetails.tripId);
//    localStorage.setItem("projectId", projectId);
//    localStorage.setItem("towerId", selectedTower);
//
//    alert("✅ Project Log Submitted Successfully!");
//  } catch (error) {
//    console.error("Submission Error:", error);
//    alert("❌ Failed to submit project log.");
//  } finally {
//    setLoading(false);
//  }
//};
////              const submitProjectLog = async () => {
////                try {
////                  if (!dispatchDetails.projectName || !dispatchDetails.tripId) {
////                    alert("Please enter both Project Name and Trip ID");
////                    return;
////                  }
////                  const payload = {
////                    ...dispatchDetails,
////                    tripId: parseInt(dispatchDetails.tripId),
////                      tower: {
////                                towerId: Number(dispatchDetails.towerId)
////                              }
////                  };
////                  await axios.post(`${API_URL}/logs`, payload);
////                  alert("Project Log Submitted Successfully!");
////                } catch (error) {
////                  alert("Failed to submit project log");
////                }
////              };
//
//            const createWindow = async () => {
//              try {
//                if (!dispatchDetails?.tripId || !selectedTower || !flatNumber) {
//                  alert("Please select a Trip, Tower and Flat Number.");
//                  return;
//                }
//
//                // ✅ Get correct projectId from selected project
//                const selectedProjectObj = projects.find(
//                  p => p.projectName === dispatchDetails.projectName
//                );
//
//                const projectId = selectedProjectObj?.id || selectedProjectObj?.projectId;
//
//                if (!projectId) {
//                  alert("Project ID not found!");
//                  return;
//                }
//
//                const payload = {
//                  srNo: parseInt(formData.srNo) || 0,
//                  winSrNo: formData.windowSrNo,
//                  flatNo: flatNumber,
//                  location: formData.location,
//                  jobCardNo: formData.jobCardNo,
//                  description: formData.description,
//                  width: parseFloat(formData.width) || 0,
//                  height: parseFloat(formData.height) || 0,
//                  qty: parseInt(formData.qty) || 0,
//                  unit: formData.unit,
//                  sqFt: parseFloat(formData.weight) || 0, // ✅ SAME FORMULA USED
//                  remarks: formData.remarks,
//                   //towerId: parseInt(selectedTower) || null
//                };
//
//                // ✅ ONLY ITEM API CALL (original removed)
//               await axios.post(
//                 `${API_URL}/api/items/create?tripId=${dispatchDetails.tripId}&projectId=${projectId}&towerId=${selectedTower}`,
//                 payload
//               );
//
//                alert("Item created successfully!");
//                getAllWindows(); // optional refresh
//                setFormData(initialState);
//
//              } catch (error) {
//                console.error(error);
//                alert(`Error: ${error.response?.data?.message || "Check Console"}`);
//              }
//            };
//
//
// const downloadPDF = async () => {
//   const tripInput = prompt("Enter Trip ID (optional):")?.trim();
//
//   let filteredWindows = windows;
//
//   let dispatchInfo = {
//     projectName: "N/A",
//     dcNo: "N/A",
//     workOrderNumber: "N/A",
//     codeNo: "N/A",
//   };
//
//   // ✅ ADDED: Tower name variable
//   let dynamicTowerName = "N/A";
//
//   // ✅ FIX: Declare date variables OUTSIDE
//   let actualDate = null;
//   let userDate = null;
//   let sameDate = true;
//
//   if (tripInput) {
//     filteredWindows = windows.filter(
//       (w) => (w?.trip?.id ?? w?.tripId)?.toString() === tripInput
//     );
//
//     if (filteredWindows.length === 0) {
//       return alert("No windows found for the entered Trip ID.");
//     }
//
//     try {
//       const response = await axios.get(`${API_URL}/logs/trip/${tripInput}`);
//       if (response.data && response.data.length > 0) {
//         const latestLog = response.data[0];
//
//         // ✅ FETCH DATE COMPARISON API
//         try {
//           const dateRes = await axios.get(
//             `${API_URL}/logs/trip/${tripInput}/dates`
//           );
//
//           if (dateRes.data) {
//             actualDate = dateRes.data.actualDate;
//             userDate = dateRes.data.userDate;
//             sameDate = dateRes.data.sameDate;
//           }
//         } catch (err) {
//           console.error("Error fetching date comparison:", err);
//         }
//
//         dispatchInfo = {
//           projectName: latestLog.projectName || "N/A",
//           dcNo: latestLog.dcNo || "N/A",
//           workOrderNumber: latestLog.workOrderNumber || "N/A",
//           codeNo: latestLog.codeNo || "N/A",
//         };
//
//         // ✅ ADDED: Fetch Tower Name dynamically
//         if (latestLog.projectName) {
//           const projectRes = await axios.get(
//             `${API_URL}/projects/by-name/${latestLog.projectName}`
//           );
//           const pId = projectRes.data?.projectId;
//
//           const refWindow = filteredWindows[0];
//           const tId =
//             refWindow?.tower?.towerId ||
//             refWindow?.towerId ||
//             selectedTower;
//
//           if (pId && tId) {
//             const towerRes = await axios.get(
//               `${API_URL}/api/towers/project/${pId}`
//             );
//             const foundTower = towerRes.data.find(
//               (t) => t.towerId == tId
//             );
//             if (foundTower) {
//               dynamicTowerName = foundTower.towerName;
//             }
//           }
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching project log for Trip:", error);
//     }
//   }
//
//   if (filteredWindows.length === 0) {
//     return alert("No data available to generate PDF.");
//   }
//
//   const doc = new jsPDF("landscape");
//   const refWindow = filteredWindows[0];
//   const refTrip = refWindow?.trip || {};
//
//   // ✅ Tower display
//   const towerDisplay =
//     dynamicTowerName !== "N/A"
//       ? dynamicTowerName
//       : towers.find((t) => t.towerId == selectedTower)?.towerName ||
//         "N/A";
//
//   // --- LOGO ---
//   const cloudinaryLogoUrl =
//     "https://res.cloudinary.com/dhmcijhts/image/upload/v1774439813/updytp3rs57vhqtdbx1p.png";
//
//   try {
//     doc.addImage(cloudinaryLogoUrl, "PNG", 35, 8, 38, 20);
//     doc.setDrawColor(220, 220, 220);
//     doc.line(14, 33, 283, 33);
//   } catch (e) {
//     console.error("Logo failed to load", e);
//   }
//
//   // --- HEADER ---
//   doc.setFontSize(16);
//   doc.setTextColor(40, 40, 40);
//   doc.text(
//     "ONEDEO LEELA FAÇADE SYSTEMS PRIVATE LIMITED",
//     160,
//     18,
//     { align: "center" }
//   );
//
//   doc.setFontSize(8);
//   doc.setTextColor(100, 100, 100);
//   doc.text(
//     "Building No/Flat No 327, Bopgaon Chowk, Pune, Maharashtra 412301",
//     160,
//     25,
//     { align: "center" }
//   );
//
//   // --- PROJECT/TRIP INFO ---
//   doc.setFontSize(10);
//   doc.setTextColor(0, 0, 0);
//   doc.text(`Project Name: ${dispatchInfo.projectName}`, 14, 42);
//   doc.text(`Tower Name: ${towerDisplay}`, 14, 48);
//   doc.text(`DC No: ${dispatchInfo.dcNo}`, 14, 54);
//   doc.text(`Work Order No: ${dispatchInfo.workOrderNumber}`, 14, 60);
//   doc.text(`Code No: ${dispatchInfo.codeNo}`, 14, 66);
//
//   doc.text(`Trip ID: ${tripInput || refTrip.id || "All"}`, 220, 42);
//
//   // ✅ FORMAT DATES (FIXED)
//   const actualDateFormatted = actualDate
//     ? new Date(actualDate).toLocaleDateString()
//     : new Date().toLocaleDateString();
//
//   const userDateFormatted = userDate
//     ? new Date(userDate).toLocaleDateString()
//     : null;
//
//   let yPosition = 54;
//
//   // ✅ SHOW BOTH DATES IF DIFFERENT
//  // ✅ RIGHT SIDE DATE (ONLY ACTUAL DATE)
//  doc.text(`Date: ${actualDateFormatted}`, 220, 48);
//
//  // ✅ LEFT SIDE → BELOW CODE NO (NEW POSITION)
//  if (!sameDate && userDateFormatted) {
//    doc.text(`Material Delivery Date: ${userDateFormatted}`, 14, 72);
//  }
//
//   doc.text(
//     `Vehicle No: ${refTrip.vehicleNumber || "N/A"}`,
//     220,
//     yPosition
//   );
//   doc.text(
//     `Driver Name: ${refTrip.driverName || "N/A"}`,
//     220,
//     yPosition + 6
//   );
//   doc.text(
//     `Trip Status: ${refTrip.status || "N/A"}`,
//     220,
//     yPosition + 12
//   );
//
//   // --- TABLE ---
//   const tableColumn = [
//     "Sr No.",
//     "Win. Sr. No.",
//     "Flat No",
//     "Location",
//     "Job Card No.",
//     "Description",
//     "Width",
//     "Height",
//     "Qty.",
//     "Unit",
//     "Weight",
//     "Remarks",
//   ];
//
//   const tableRows = filteredWindows.map((w, index) => [
//     index + 1,
//     w.winSrNo ?? "N/A",
//     w?.flat?.flatNo ?? w.flatNo ?? "N/A",
//     w.location ?? "N/A",
//     w.jobCardNo ?? "N/A",
//     w.description ?? "N/A",
//     w.width != null ? w.width : 0,
//     w.height != null ? w.height : 0,
//     w.qty != null ? w.qty : 0,
//     w.unit ?? "N/A",
//     w.sqFt != null ? w.sqFt : 0,
//     w.remarks ?? "",
//   ]);
//
//   autoTable(doc, {
//     head: [tableColumn],
//     body: tableRows,
//     startY: 75,
//     theme: "grid",
//     styles: { fontSize: 7 },
//     headStyles: { fillColor: [44, 62, 80] },
//   });
//
//   const finalY = (doc.lastAutoTable?.finalY || 75) + 10;
//
//   const totalWeight = filteredWindows
//     .reduce((sum, w) => sum + (parseFloat(w.sqFt) || 0), 0)
//     .toFixed(2);
//
//   doc.text(`Total Weight: ${totalWeight}`, 250, finalY);
//
//   doc.text("Prepared By: ________________", 14, finalY + 20);
//   doc.text("Checked By: ________________", 110, finalY + 20);
//   doc.text("Received By: ________________", 210, finalY + 20);
//
//   doc.save(`Onedeo_Report_Trip_${tripInput || "All"}.pdf`);
// };
//
//
//
//        const filteredWindows = windows.filter((w) => {
//          // --- Trip ID filter ---
//          if (tripIdFilter && (w?.trip?.id ?? w?.tripId)?.toString() !== tripIdFilter) {
//            return false;
//          }
//
//          // --- Date filters ---
//          if (!w.createdAt) return true;
//          const recordDateStr = w.createdAt.toString().substring(0, 10);
//
//          if (filterDate) return recordDateStr === filterDate;
//          if (fromDate && toDate) return recordDateStr >= fromDate && recordDateStr <= toDate;
//
//          return true;
//        });
//
//
//
//        // Create a new variable for sorted data, leave filteredWindows untouched
//        const sortedWindows = [...filteredWindows].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//
//
//          return (
//            <div style={{ padding: "25px", fontFamily: "'Segoe UI', sans-serif", backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
//              {/* Header */}
//              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #3498db", marginBottom: "20px", paddingBottom: "10px" }}>
//                <h2 style={{ color: "#2c3e50", margin: 0 }}>Material Logistics Management</h2>
//                <button onClick={downloadPDF} style={{ padding: "10px 20px", backgroundColor: "#e67e22", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
//                  📥 GENERATE TRIP DC
//                </button>
//              </div>
//
//              {/* Dispatch Details Section */}
//              <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", marginBottom: "25px" }}>
//                <h4>Project / Dispatch Details</h4>
//                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "15px" }}>
//                  <div>
//                    <label style={{ fontSize: "11px", color: "#7f8c8d" }}>PROJECT NAME</label>
//                    <select name="projectName" value={dispatchDetails.projectName} onChange={handleDispatchChange} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}>
//                      <option value="">-- Select Project --</option>
//                      {projects.map((p, index) => <option key={index} value={p.projectName}>{p.projectName}</option>)}
//                    </select>
//                  </div>
//
//
// <div>
//    <label style={{ fontSize: "11px", color: "#7f8c8d" }}>TOWER</label>
//    <select
//      value={selectedTower}
//      onChange={handleTowerChange}
//      style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
//    >
//      <option value="">-- Select Tower --</option>
//      {towers.map((t, idx) => (
//        <option key={t.towerId || idx} value={t.towerId}>{t.towerName}</option>
//      ))}
//    </select>
//  </div>
//
//
//                  {["dcNo", "workOrderNumber", "codeNo", "tripId"].map(field => (
//                    <div key={field}>
//                      <label style={{ fontSize: "11px", color: "#7f8c8d" }}>{field.replace(/([A-Z])/g, " $1").toUpperCase()}</label>
//                      <input
//                        name={field}
//                        type={field === "tripId" ? "number" : "text"}
//                        value={dispatchDetails[field]}
//                        onChange={handleDispatchChange}
//                        style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
//                      />
//                    </div>
//                  ))}
//                 <div>
//                   <label style={{ fontSize: "11px", color: "#7f8c8d" }}>
//                     USER DATE
//                   </label>
//                   <input
//                     type="date"
//                     name="userDate"
//                     value={dispatchDetails.userDate}
//                     onChange={handleDispatchChange}
//                     style={{
//                       width: "100%",
//                       padding: "8px",
//                       borderRadius: "4px",
//                       border: "1px solid #ddd"
//                     }}
//                   />
//                 </div>
//                  <div style={{ display: "flex", alignItems: "flex-end" }}>
//                    <button onClick={submitProjectLog} style={{ width: "100%", padding: "10px 15px", backgroundColor: "#8e44ad", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
//                      SUBMIT PROJECT LOG
//                    </button>
//                  </div>
//                </div>
//
//                <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
//                  <div style={{ flex: 1 }}>
//                    <label style={{ fontSize: "11px", color: "#7f8c8d" }}>FLOOR</label>
//                    <select value={selectedFloor} onChange={handleFloorChange} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}>
//                      <option value="">-- Select Floor --</option>
//                      {floors.map((f, idx) => (
//                        <option key={f.floorId || idx} value={f.floorId}>Floor {f.floorNumber}</option>
//                      ))}
//                    </select>
//                  </div>
//                  <div style={{ flex: 1 }}>
//                    <label style={{ fontSize: "11px", color: "#7f8c8d" }}>FLAT NUMBER</label>
//                    <select
//                      value={flatNumber}
//                      onChange={(e) => setFlatNumber(e.target.value)}
//                      style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
//                    >
//                      <option value="">-- Select Flat --</option>
//                      {flats.map(flat => (
//                        <option key={flat.flatId} value={flat.flatNumber}>{flat.flatNumber}</option>
//                      ))}
//                    </select>
//                  </div>
//                </div>
//              </div>
//
//              {/* Add Window Form */}
//              <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", marginBottom: "25px" }}>
//                <h4>Add New Material Details</h4>
//                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "15px" }}>
//                 {Object.keys(initialState)
//                   .filter(key => key !== "flatNo")
//                   .map(key => (
//                    <div key={key}>
//                      <label style={{ fontSize: "11px", color: "#7f8c8d" }}>{key.replace(/([A-Z])/g, " $1").toUpperCase()}</label>
//                      <input name={key} value={formData[key]} onChange={handleChange} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }} />
//                    </div>
//                  ))}
//                </div>
//
//
//                <button onClick={createWindow} style={{ marginTop: "20px", padding: "12px 30px", backgroundColor: "#27ae60", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
//                  SUBMIT ASSET TO DATABASE
//                </button>
//
//
//
//                 {/* EXCEL UPLOAD BUTTON */}
//                 <input
//                   type="file"
//                   accept=".xlsx, .xls"
//                   onChange={(e) => setExcelFile(e.target.files[0])}
//                   style={{
//                     padding: "10px",
//                     borderRadius: "4px",
//                     border: "1px solid #ddd",
//                     cursor: "pointer",
//                     marginLeft: "20px"   // <-- horizontal space
//                   }}
//                 />
//
//                 <button
//                   onClick={async () => {
//                     if (!excelFile) {
//                       alert("Please select an Excel file first!");
//                       return;
//                     }
//
//                     // ✅ Get tripId and projectId dynamically from state
//                     const tripIdValue = dispatchDetails.tripId;
//                     const selectedProjectObj = projects.find(
//                       (p) => p.projectName === dispatchDetails.projectName
//                     );
//                     const projectIdValue = selectedProjectObj?.id || selectedProjectObj?.projectId;
//
//                     if (!tripIdValue || !projectIdValue) {
//                       alert("Please provide Trip ID and Project ID!");
//                       return;
//                     }
//
//                     const uploadFormData = new FormData();
//                     uploadFormData.append("file", excelFile);
//                     uploadFormData.append("projectId", projectIdValue);
//                     uploadFormData.append("towerId", selectedTower);
//
//                     try {
//                       const response = await axios.post(
//                         `${API_URL}/api/items/upload/${tripIdValue}`,
//                         uploadFormData,
//                         {
//                           headers: { "Content-Type": "multipart/form-data" },
//                         }
//                       );
//                       alert(response.data || "Excel file uploaded successfully!");
//                       getAllWindows(); // refresh table after upload
//
//                       // ✅ Optional: reset file input after upload
//                       setExcelFile(null);
//                     } catch (error) {
//                       console.error("Upload failed:", error);
//                       alert(`Upload failed: ${error.response?.data || error.message}`);
//                     }
//                   }}
//
//
//                   style={{
//                     padding: "12px 25px",
//                     backgroundColor: "#2980b9",
//                     color: "white",
//                     border: "none",
//                     borderRadius: "4px",
//                     cursor: "pointer",
//                     fontWeight: "bold",
//                     marginLeft: "15px" // horizontal spacing
//                   }}
//                 >
//                   SUBMIT EXCEL
//                 </button>
//              </div>
//
//              {/* --- REPLACED UPDATED TABLE UI --- */}
//              <div style={{ marginTop: "40px" }}>
//                <h3 style={{ color: "#2c3e50" }}>Data Results (Database View)</h3>
//                <div style={{
//                  display: "flex",
//                  gap: "15px",
//                  marginBottom: "20px",
//                  flexWrap: "wrap"
//                }}>
//                  <div>
//                    <label>From Date</label>
//                    <input
//                      type="date"
//                      value={fromDate}
//                      onChange={(e) => {
//                        setFromDate(e.target.value);
//                        setFilterDate("");
//                      }}
//                    />
//                  </div>
//
//                  <div>
//                    <label>To Date</label>
//                    <input
//                      type="date"
//                      value={toDate}
//                      onChange={(e) => {
//                        setToDate(e.target.value);
//                        setFilterDate("");
//                      }}
//                    />
//                  </div>
//
//                  <div>
//                    <label>Specific Date</label>
//                    <input
//                      type="date"
//                      value={filterDate}
//                      onChange={(e) => {
//                        setFilterDate(e.target.value);
//                        setFromDate("");
//                        setToDate("");
//                      }}
//                    />
//                  </div>
//
//
//
//
//
//
//                  <button
//                    onClick={() => {
//                      setFromDate("");
//                      setToDate("");
//                      setFilterDate("");
//                    }}
//                    style={{
//                      height: "35px",
//                      alignSelf: "flex-end",
//                      background: "#e74c3c",
//                      color: "#fff",
//                      border: "none",
//                      padding: "5px 15px",
//                      cursor: "pointer",
//                      borderRadius: "4px"
//                    }}
//                  >
//                    Reset
//                  </button>
//
//                    <div>
//                             <label>Trip ID</label>
//                             <input
//                               type="text"
//                               value={tripIdFilter}
//                               onChange={(e) => setTripIdFilter(e.target.value)}
//                               placeholder="Enter Trip ID"
//                               style={{ padding: "5px 10px", borderRadius: "4px", border: "1px solid #ddd" }}
//                             />
//                           </div>
//                </div>
//                <div style={{ overflowX: "auto", background: "#fff", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
//                  <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
//           <thead style={{ backgroundColor: "#2c3e50", color: "#ecf0f1" }}>
//             <tr>
//               <th>SR NO</th>
//               <th>TRIP ID</th>
//               <th>WINDOW SR NO</th>
//               <th>LOCATION</th>
//               <th>JOB CARD NO</th>
//               <th>DESCRIPTION</th>
//               <th>WIDTH</th>
//               <th>HEIGHT</th>
//               <th>QTY</th>
//               <th>UNIT</th>
//               <th>WEIGHT</th>
//               <th>REMARKS</th>
//
//               <th>STATUS</th>
//               <th>DATE</th>
//               <th>EDIT</th>
//             </tr>
//           </thead>
//                   <tbody>
//                     {loading ? (
//                       <tr>
//                         <td colSpan="15" style={{ textAlign: "center", padding: "30px" }}>
//                           Fetching data...
//                         </td>
//                       </tr>
//                     ) : filteredWindows.length > 0 ? (
//                       sortedWindows.map((w, index) => (
//                         <tr
//                           key={w.id || index}
//                           onClick={() => setSelectedWindow(w)}
//                           style={{ borderBottom: "1px solid #eee", cursor: "pointer" }}
//                         >
//                           {/* 1. SR NO */}
//                           <td>{w.srNo || index + 1}</td>
//
//                           {/* ✅ 2. TRIP ID (MOVED HERE) */}
//                           <td style={{ fontWeight: "bold", color: "#2980b9" }}>
//                             {w?.trip?.id ?? w?.tripId ?? "N/A"}
//                           </td>
//
//                           {/* REST SAME */}
//                           <td style={{ fontWeight: "bold" }}>{w.winSrNo || "N/A"}</td>
//                           <td>{w.location || "N/A"}</td>
//                           <td>{w.jobCardNo || "N/A"}</td>
//                           <td>{w.description || "N/A"}</td>
//                           <td>{w.width || 0}</td>
//                           <td>{w.height || 0}</td>
//                           <td>{w.qty || 0}</td>
//                           <td>{w.unit || "N/A"}</td>
//                           <td>{w.sqFt || 0}</td>
//                           <td>{w.remarks || "N/A"}</td>
//
//                           {/* STATUS */}
//                           <td style={{ fontSize: "10px", color: "#7f8c8d" }}>
//                             {w.trip?.status || (w.tripId ? "ASSIGNED" : "NO TRIP")}
//                           </td>
//
//                           {/* DATE */}
//                           <td>
//                             {w.createdAt
//                               ? new Date(w.createdAt.replace(" ", "T")).toLocaleDateString()
//                               : "N/A"}
//                           </td>
//
//                           {/* EDIT BUTTON */}
//                           <td>
//                             <button
//
//                             onClick={(e) => {
//                               e.stopPropagation();
//
//                               setEditingWindow({
//                                 ...w,
//                                 windowSrNo: w.winSrNo,   // ✅ FIX
//                                 weight: w.sqFt,          // ✅ FIX
//                                 remarks: w.remarks || "" // ✅ SAFE FIX
//                               });
//
//                               setEditModalVisible(true);
//                             }}
//                               style={{
//                                 padding: "5px 10px",
//                                 background: "#3498db",
//                                 color: "#fff",
//                                 border: "none",
//                                 borderRadius: "4px",
//                                 cursor: "pointer"
//                               }}
//                             >
//                               Edit
//                             </button>
//                           </td>
//                         </tr>
//                       ))
//                     ) : (
//                       <tr>
//                         <td colSpan="15" style={{ textAlign: "center", padding: "30px" }}>
//                           No data found.
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                  </table>
//                </div>
//              </div>
//
//              {/* --- REPLACED UPDATED DETAILED MODAL VIEW --- */}
//              {selectedWindow && (
//                <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
//                  <div style={{ background: "#fff", padding: "30px", borderRadius: "12px", width: "80%", maxHeight: "90vh", overflowY: "auto", position: "relative", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
//                    <button onClick={() => setSelectedWindow(null)} style={{ position: "absolute", top: "15px", right: "15px", border: "none", background: "#e74c3c", color: "white", borderRadius: "50%", width: "30px", height: "30px", cursor: "pointer", fontWeight: "bold" }}>X</button>
//
//                    <h3 style={{ borderBottom: "3px solid #3498db", paddingBottom: "10px", color: "#2c3e50" }}>Window Detailed Record: #{selectedWindow.windowId}</h3>
//
//                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "25px", marginTop: "20px" }}>
//                      <div style={{ background: "#f1f4f9", padding: "20px", borderRadius: "8px" }}>
//                        <h4 style={{ color: "#2980b9", marginTop: 0 }}>Production Details</h4>
//                        <p><strong>Job Card:</strong> {selectedWindow.jobCardNo || "N/A"}</p>
//                        <p><strong>Series Type:</strong> {selectedWindow.series || "N/A"}</p>
//                        <p><strong>W-Code:</strong> {selectedWindow.wcodeNo || selectedWindow.wCodeNo || "N/A"}</p>
//                        <p><strong>Description:</strong> {selectedWindow.description || "N/A"}</p>
//                      </div>
//
//                      <div style={{ background: "#f1f4f9", padding: "20px", borderRadius: "8px" }}>
//                        <h4 style={{ color: "#2980b9", marginTop: 0 }}>Technical Specs</h4>
//                        <p><strong>Dimensions:</strong> {selectedWindow.width || 0}mm x {selectedWindow.height || 0}mm</p>
//                        <p><strong>Total Area:</strong> {selectedWindow.weight || 0} SqFt</p>
//                        <p><strong>Units:</strong> {selectedWindow.units || 0}</p>
//                        <p><strong>Shutters:</strong> Glass: {selectedWindow.glassShutter}, Mesh: {selectedWindow.meshShutter}</p>
//                      </div>
//
//                      <div style={{ background: "#f1f4f9", padding: "20px", borderRadius: "8px" }}>
//                        <h4 style={{ color: "#d35400", marginTop: 0 }}>Logistics & Site</h4>
//                        <p><strong>Flat No:</strong> {selectedWindow.flat?.flatNumber || selectedWindow.flatNumber || "N/A"}</p>
//                        <p><strong>Trip ID:</strong> {selectedWindow.trip?.id || selectedWindow.tripId || "N/A"}</p>
//                        {selectedWindow.trip && (
//                          <>
//                            <p><strong>Status:</strong> <span style={{ color: selectedWindow.trip.status === "CANCELLED" ? "red" : "green", fontWeight: "bold" }}>{selectedWindow.trip.status}</span></p>
//                            <p><strong>Vehicle:</strong> {selectedWindow.trip.vehicleNumber || "N/A"}</p>
//                            <p><strong>Driver:</strong> {selectedWindow.trip.driverName || "N/A"}</p>
//                          </>
//                        )}
//                      </div>
//                    </div>
//                  </div>
//                </div>
//              )}
//
//              {editModalVisible && editingWindow && (
//                <div
//                  style={{
//                    position: "fixed",
//                    top: 0,
//                    left: 0,
//                    width: "100%",
//                    height: "100%",
//                    background: "rgba(0,0,0,0.7)",
//                    display: "flex",
//                    justifyContent: "center",
//                    alignItems: "center",
//                    zIndex: 1000
//                  }}
//                >
//                  <div
//                    style={{
//                      background: "#fff",
//                      padding: "30px",
//                      borderRadius: "12px",
//                      width: "70%",
//                      maxHeight: "90vh",
//                      overflowY: "auto",
//                      position: "relative",
//                      boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
//                    }}
//                  >
//                    <button
//                      onClick={() => setEditModalVisible(false)}
//                      style={{
//                        position: "absolute",
//                        top: "15px",
//                        right: "15px",
//                        border: "none",
//                        background: "#e74c3c",
//                        color: "white",
//                        borderRadius: "50%",
//                        width: "30px",
//                        height: "30px",
//                        cursor: "pointer",
//                        fontWeight: "bold"
//                      }}
//                    >
//                      X
//                    </button>
//
//                    <h3 style={{ borderBottom: "3px solid #3498db", paddingBottom: "10px", color: "#2c3e50" }}>
//                      Edit Window: #{editingWindow.windowId}
//                    </h3>
//
//                    <div style={{
//                      display: "grid",
//                      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
//                      gap: "15px",
//                      marginTop: "20px"
//                    }}>
//                      {Object.keys(initialState).map((key) => (
//                        <div key={key}>
//                          <label style={{ fontSize: "11px", color: "#7f8c8d" }}>
//                            {key.replace(/([A-Z])/g, " $1").toUpperCase()}
//                          </label>
//                          <input
//                            name={key}
//                            value={editingWindow[key] || ""}
//                            onChange={(e) => setEditingWindow(prev => ({ ...prev, [key]: e.target.value }))}
//                            style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
//                          />
//                        </div>
//                      ))}
//                    </div>
//
//                  <button
//                    onClick={async () => {
//                      try {
//                      const payload = {
//                        ...editingWindow,
//                        winSrNo: editingWindow.windowSrNo,  // ✅ FIX
//                        qty: parseInt(editingWindow.qty) || 0,
//                        width: parseFloat(editingWindow.width) || 0,
//                        height: parseFloat(editingWindow.height) || 0,
//                        sqFt: parseFloat(editingWindow.weight) || 0, // ✅ FIX
//                        remarks: editingWindow.remarks || ""
//                      };
//
//                        await axios.put(`${API_URL}/api/items/${editingWindow.id}`, payload);
//
//                        alert("Item updated successfully!");
//                        setEditModalVisible(false);
//                        getAllWindows(); // refresh table
//                      } catch (error) {
//                        alert(`Update failed: ${error.response?.data?.message || error.message}`);
//                      }
//                    }}
//                    style={{
//                      marginTop: "20px",
//                      padding: "12px 30px",
//                      backgroundColor: "#27ae60",
//                      color: "white",
//                      border: "none",
//                      borderRadius: "4px",
//                      cursor: "pointer",
//                      fontWeight: "bold"
//                    }}
//                  >
//                    Update Item
//                  </button>
//                  </div>
//                </div>
//              )}
//            </div>
//          );
//        };
//
//        export default WindowManager;


//
//import React, { useState, useEffect } from "react";
//import axios from "axios";
//import jsPDF from "jspdf";
//import autoTable from "jspdf-autotable";
//const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
//
//const WindowManager = () => {
//  const [windows, setWindows] = useState([]);
//  const [selectedWindow, setSelectedWindow] = useState(null);
//  const [loading, setLoading] = useState(false);
//  const [floors, setFloors] = useState([]);
//  const [selectedFloor, setSelectedFloor] = useState("");
//  const [flats, setFlats] = useState([]);
//  const [flatNumber, setFlatNumber] = useState("");
//  const [projects, setProjects] = useState([]);
//  const [fromDate, setFromDate] = useState("");
//  const [toDate, setToDate] = useState("");
//  const [filterDate, setFilterDate] = useState("");
//  const [editModalVisible, setEditModalVisible] = useState(false);
//  const [editingWindow, setEditingWindow] = useState(null);
//  const [tripIdFilter, setTripIdFilter] = useState("");
//  const [excelFile, setExcelFile] = useState(null);
//  const [towers, setTowers] = useState([]);
//  const [selectedTower, setSelectedTower] = useState("");
//  const [dispatchDetails, setDispatchDetails] = useState({
//    projectName: "",
//    dcNo: "",
//    workOrderNumber: "",
//    codeNo: "",
//    tripId: "",
//    userDate: ""
//  });
//
//  const initialState = {
//    srNo: "",
//    windowSrNo: "",
//    flatNo: "",
//    location: "",
//    jobCardNo: "",
//    description: "",
//    width: "",
//    height: "",
//    qty: "",
//    unit: "",
//    weight: "",
//    remarks: "",
//  };
//
//  const [formData, setFormData] = useState(initialState);
//
//  useEffect(() => {
//    getAllWindows();
//    fetchProjects();
//  }, []);
//
//  const fetchProjects = async () => {
//    try {
//      const response = await axios.get(`${API_URL}/projects`);
//      setProjects(response.data || []);
//    } catch (error) {
//      console.error("Error fetching projects:", error);
//      setProjects([]);
//    }
//  };
//
//  const fetchDispatchDetails = async (tripId) => {
//    if (!tripId) return;
//    try {
//      const response = await axios.get(`${API_URL}/logs/trip/${tripId}`);
//      if (response.data) {
//        setDispatchDetails(prev => ({
//          ...prev,
//          projectName: response.data.projectName || prev.projectName,
//          dcNo: response.data.dcNo || prev.dcNo,
//          workOrderNumber: response.data.workOrderNumber || prev.workOrderNumber,
//          codeNo: response.data.codeNo || prev.codeNo,
//          tripId: tripId
//        }));
//      }
//    } catch (error) {
//      console.error("Error fetching trip details:", error);
//    }
//  };
//
//  const handleDispatchChange = async (e) => {
//    const { name, value } = e.target;
//    setDispatchDetails(prev => ({ ...prev, [name]: value }));
//
//    if (name === "projectName" && value) {
//      const selectedProjectObj = projects.find(p => p.projectName === value);
//      if (selectedProjectObj) {
//        const projectId = selectedProjectObj.id ?? selectedProjectObj.projectId;
//        if (projectId) {
//          try {
//            const towerResponse = await axios.get(`${API_URL}/api/towers/project/${projectId}`);
//            setTowers(towerResponse.data || []);
//            setSelectedTower("");
//            setFloors([]);
//            setSelectedFloor("");
//            setFlats([]);
//            setFlatNumber("");
//          } catch (error) {
//            console.error("Error fetching towers:", error);
//            setTowers([]);
//          }
//        }
//      }
//      try {
//        const logResponse = await axios.get(`${API_URL}/logs/project/${value}`);
//        if (logResponse.data && logResponse.data.length > 0) {
//          const latestLog = logResponse.data[0];
//          setDispatchDetails(prev => ({
//            ...prev,
//            dcNo: latestLog.dcNo || prev.dcNo,
//            workOrderNumber: latestLog.workOrderNumber || prev.workOrderNumber,
//            codeNo: latestLog.codeNo || prev.codeNo,
//            tripId: latestLog.tripId || prev.tripId
//          }));
//        }
//      } catch (error) {
//        console.error("Error fetching logs:", error);
//      }
//    }
//
//    if (name === "tripId" && value) {
//      fetchDispatchDetails(value);
//    }
//  };
//
//  const handleTowerChange = async (e) => {
//    const towerId = e.target.value;
//    setSelectedTower(towerId);
//    setFloors([]);
//    setSelectedFloor("");
//    setFlats([]);
//    setFlatNumber("");
//    if (towerId) {
//      try {
//        const floorResponse = await axios.get(`${API_URL}/floors/tower/${towerId}`);
//        setFloors(floorResponse.data || []);
//      } catch (error) {
//        console.error("Error fetching floors:", error);
//      }
//    }
//  };
//
//  const handleFloorChange = async (e) => {
//    const floorId = e.target.value;
//    setSelectedFloor(floorId);
//    setFlatNumber("");
//    if (floorId) {
//      try {
//        const response = await axios.get(`${API_URL}/flats/floor/${floorId}`);
//        setFlats(response.data || []);
//      } catch (error) {
//        console.error("Error fetching flats:", error);
//        setFlats([]);
//      }
//    } else {
//      setFlats([]);
//    }
//  };
//
//  const handleChange = (e) => {
//    const { name, value } = e.target;
//    setFormData((prev) => {
//      const updated = { ...prev, [name]: value };
//      const w = parseFloat(name === "width" ? value : prev.width) || 0;
//      const h = parseFloat(name === "height" ? value : prev.height) || 0;
//      const q = parseInt(name === "qty" ? value : prev.qty) || 0;
//      if (w > 0 && h > 0 && q > 0) {
//        const calculatedWeight = ((w * h * q) / 1000000) * 10.764;
//        updated.weight = calculatedWeight.toFixed(2);
//      } else {
//        updated.weight = "";
//      }
//      return updated;
//    });
//  };
//
//  const getAllWindows = async () => {
//    setLoading(true);
//    try {
//      const response = await axios.get(`${API_URL}/api/items`);
//      setWindows(Array.isArray(response.data) ? response.data : []);
//    } catch (error) {
//      console.error("Load failed:", error);
//      setWindows([]);
//    } finally {
//      setLoading(false);
//    }
//  };
//
//  const submitProjectLog = async () => {
//    if (!dispatchDetails.projectName || !selectedTower || !dispatchDetails.tripId) {
//      alert("Please select Project, Tower and enter Trip ID");
//      return;
//    }
//    try {
//      setLoading(true);
//      const selectedProjectObj = projects.find(
//        (p) => p.projectName === dispatchDetails.projectName
//      );
//      const projectId = selectedProjectObj?.projectId || selectedProjectObj?.id;
//      const payload = {
//        projectName: dispatchDetails.projectName,
//        dcNo: dispatchDetails.dcNo,
//        workOrderNumber: dispatchDetails.workOrderNumber,
//        codeNo: dispatchDetails.codeNo,
//        tripId: Number(dispatchDetails.tripId),
//        userDate: dispatchDetails.userDate,
//        tower: { towerId: Number(selectedTower) },
//      };
//      await axios.post(`${API_URL}/logs`, payload);
//      localStorage.setItem("tripId", dispatchDetails.tripId);
//      localStorage.setItem("projectId", projectId);
//      localStorage.setItem("towerId", selectedTower);
//      alert("✅ Project Log Submitted Successfully!");
//    } catch (error) {
//      console.error("Submission Error:", error);
//      alert("❌ Failed to submit project log.");
//    } finally {
//      setLoading(false);
//    }
//  };
//
//  const createWindow = async () => {
//    try {
//      if (!dispatchDetails?.tripId || !selectedTower || !flatNumber) {
//        alert("Please select a Trip, Tower and Flat Number.");
//        return;
//      }
//      const selectedProjectObj = projects.find(
//        p => p.projectName === dispatchDetails.projectName
//      );
//      const projectId = selectedProjectObj?.id || selectedProjectObj?.projectId;
//      if (!projectId) {
//        alert("Project ID not found!");
//        return;
//      }
//      const payload = {
//        srNo: parseInt(formData.srNo) || 0,
//        winSrNo: formData.windowSrNo,
//        flatNo: flatNumber,
//        location: formData.location,
//        jobCardNo: formData.jobCardNo,
//        description: formData.description,
//        width: parseFloat(formData.width) || 0,
//        height: parseFloat(formData.height) || 0,
//        qty: parseInt(formData.qty) || 0,
//        unit: formData.unit,
//        sqFt: parseFloat(formData.weight) || 0,
//        remarks: formData.remarks,
//      };
//      await axios.post(
//        `${API_URL}/api/items/create?tripId=${dispatchDetails.tripId}&projectId=${projectId}&towerId=${selectedTower}`,
//        payload
//      );
//      alert("Item created successfully!");
//      getAllWindows();
//      setFormData(initialState);
//    } catch (error) {
//      console.error(error);
//      alert(`Error: ${error.response?.data?.message || "Check Console"}`);
//    }
//  };
//
//  // ─────────────────────────────────────────────────────────────────────────────
//  // downloadPDF — drops columns that are entirely empty across all filtered rows
//  // ─────────────────────────────────────────────────────────────────────────────
//  const downloadPDF = async () => {
//    const tripInput = prompt("Enter Trip ID (optional):")?.trim();
//
//    let filteredWindows = windows;
//
//    let dispatchInfo = {
//      projectName: "N/A",
//      dcNo: "N/A",
//      workOrderNumber: "N/A",
//      codeNo: "N/A",
//    };
//
//    let dynamicTowerName = "N/A";
//    let actualDate = null;
//    let userDate = null;
//    let sameDate = true;
//
//    if (tripInput) {
//      filteredWindows = windows.filter(
//        (w) => (w?.trip?.id ?? w?.tripId)?.toString() === tripInput
//      );
//
//      if (filteredWindows.length === 0) {
//        return alert("No windows found for the entered Trip ID.");
//      }
//
//      try {
//        const response = await axios.get(`${API_URL}/logs/trip/${tripInput}`);
//        if (response.data && response.data.length > 0) {
//          const latestLog = response.data[0];
//
//          try {
//            const dateRes = await axios.get(`${API_URL}/logs/trip/${tripInput}/dates`);
//            if (dateRes.data) {
//              actualDate = dateRes.data.actualDate;
//              userDate   = dateRes.data.userDate;
//              sameDate   = dateRes.data.sameDate;
//            }
//          } catch (err) {
//            console.error("Error fetching date comparison:", err);
//          }
//
//          dispatchInfo = {
//            projectName:     latestLog.projectName     || "N/A",
//            dcNo:            latestLog.dcNo            || "N/A",
//            workOrderNumber: latestLog.workOrderNumber || "N/A",
//            codeNo:          latestLog.codeNo          || "N/A",
//          };
//
//          if (latestLog.projectName) {
//            const projectRes = await axios.get(`${API_URL}/projects/by-name/${latestLog.projectName}`);
//            const pId = projectRes.data?.projectId;
//            const refWindow = filteredWindows[0];
//            const tId = refWindow?.tower?.towerId || refWindow?.towerId || selectedTower;
//            if (pId && tId) {
//              const towerRes = await axios.get(`${API_URL}/api/towers/project/${pId}`);
//              const foundTower = towerRes.data.find((t) => t.towerId == tId);
//              if (foundTower) dynamicTowerName = foundTower.towerName;
//            }
//          }
//        }
//      } catch (error) {
//        console.error("Error fetching project log for Trip:", error);
//      }
//    }
//
//    if (filteredWindows.length === 0) {
//      return alert("No data available to generate PDF.");
//    }
//
//    // ── Define all possible columns ──────────────────────────────────────────
//    // Each entry: { header, getValue }
//    const allColumns = [
//      { header: "Sr No.",       getValue: (w, i) => i + 1 },
//      { header: "Win. Sr. No.", getValue: (w)    => w.winSrNo },
//      { header: "Floor No",     getValue: (w)    => w?.floor?.floorNumber ?? w?.floorNo },
//      { header: "Flat No",      getValue: (w)    => w?.flat?.flatNumber ?? w?.flat?.flatNo ?? w.flatNo },
//      { header: "Location",     getValue: (w)    => w.location },
//      { header: "Job Card No.", getValue: (w)    => w.jobCardNo },
//      { header: "Description",  getValue: (w)    => w.description },
//      { header: "Width",        getValue: (w)    => w.width  != null ? w.width  : null },
//      { header: "Height",       getValue: (w)    => w.height != null ? w.height : null },
//      { header: "Qty.",         getValue: (w)    => w.qty    != null ? w.qty    : null },
//      { header: "Unit",         getValue: (w)    => w.unit },
//      { header: "Weight",       getValue: (w)    => w.sqFt  != null ? w.sqFt   : null },
//      { header: "Remarks",      getValue: (w)    => w.remarks },
//    ];
//
//    // ── Determine which columns have at least one non-empty value ────────────
//    // Sr No. (index 0) is always kept.
//    // Floor No (index 2) and Flat No (index 3) are mandatory — always kept.
//    const mandatoryIndices = new Set([0, 2, 3]);
//
//    const activeColumns = allColumns.filter((col, colIdx) => {
//      if (mandatoryIndices.has(colIdx)) return true;
//      // Check if any row has a meaningful value for this column
//      return filteredWindows.some((w, i) => {
//        const val = col.getValue(w, i);
//        if (val === null || val === undefined) return false;
//        if (typeof val === "string" && val.trim() === "") return false;
//        if (typeof val === "number" && val === 0) return false; // treat 0 as empty for optional cols
//        return true;
//      });
//    });
//
//    // ── Build table data ─────────────────────────────────────────────────────
//    const tableColumn = activeColumns.map(c => c.header);
//    const tableRows   = filteredWindows.map((w, i) =>
//      activeColumns.map(c => {
//        const val = c.getValue(w, i);
//        if (val === null || val === undefined) return "";
//        return val;
//      })
//    );
//
//    const doc = new jsPDF("landscape");
//    const refWindow = filteredWindows[0];
//    const refTrip   = refWindow?.trip || {};
//
//    const towerDisplay =
//      dynamicTowerName !== "N/A"
//        ? dynamicTowerName
//        : towers.find((t) => t.towerId == selectedTower)?.towerName || "N/A";
//
//    // --- LOGO ---
//    const cloudinaryLogoUrl =
//      "https://res.cloudinary.com/dhmcijhts/image/upload/v1774439813/updytp3rs57vhqtdbx1p.png";
//    try {
//      doc.addImage(cloudinaryLogoUrl, "PNG", 35, 8, 38, 20);
//      doc.setDrawColor(220, 220, 220);
//      doc.line(14, 33, 283, 33);
//    } catch (e) {
//      console.error("Logo failed to load", e);
//    }
//
//    // --- HEADER ---
//    doc.setFontSize(16);
//    doc.setTextColor(40, 40, 40);
//    doc.text("ONEDEO LEELA FAÇADE SYSTEMS PRIVATE LIMITED", 160, 18, { align: "center" });
//    doc.setFontSize(8);
//    doc.setTextColor(100, 100, 100);
//    doc.text("Building No/Flat No 327, Bopgaon Chowk, Pune, Maharashtra 412301", 160, 25, { align: "center" });
//
//    // --- PROJECT/TRIP INFO ---
//    doc.setFontSize(10);
//    doc.setTextColor(0, 0, 0);
//    doc.text(`Project Name: ${dispatchInfo.projectName}`, 14, 42);
//    doc.text(`Tower Name: ${towerDisplay}`, 14, 48);
//    doc.text(`DC No: ${dispatchInfo.dcNo}`, 14, 54);
//    doc.text(`Work Order No: ${dispatchInfo.workOrderNumber}`, 14, 60);
//    doc.text(`Code No: ${dispatchInfo.codeNo}`, 14, 66);
//    doc.text(`Trip ID: ${tripInput || refTrip.id || "All"}`, 220, 42);
//
//    const actualDateFormatted = actualDate
//      ? new Date(actualDate).toLocaleDateString()
//      : new Date().toLocaleDateString();
//    const userDateFormatted = userDate ? new Date(userDate).toLocaleDateString() : null;
//
//    let yPosition = 54;
//    doc.text(`Date: ${actualDateFormatted}`, 220, 48);
//    if (!sameDate && userDateFormatted) {
//      doc.text(`Material Delivery Date: ${userDateFormatted}`, 14, 72);
//    }
//
//    doc.text(`Vehicle No: ${refTrip.vehicleNumber || "N/A"}`, 220, yPosition);
//    doc.text(`Driver Name: ${refTrip.driverName   || "N/A"}`, 220, yPosition + 6);
//    doc.text(`Trip Status: ${refTrip.status        || "N/A"}`, 220, yPosition + 12);
//
//    // --- TABLE (only active columns) ---
//    autoTable(doc, {
//      head:     [tableColumn],
//      body:     tableRows,
//      startY:   75,
//      theme:    "grid",
//      styles:   { fontSize: 7 },
//      headStyles: { fillColor: [44, 62, 80] },
//    });
//
//    const finalY = (doc.lastAutoTable?.finalY || 75) + 10;
//
//    const totalWeight = filteredWindows
//      .reduce((sum, w) => sum + (parseFloat(w.sqFt) || 0), 0)
//      .toFixed(2);
//
//    doc.text(`Total Weight: ${totalWeight}`, 250, finalY);
//    doc.text("Prepared By: ________________", 14,  finalY + 20);
//    doc.text("Checked By: ________________",  110, finalY + 20);
//    doc.text("Received By: ________________", 210, finalY + 20);
//
//    doc.save(`Onedeo_Report_Trip_${tripInput || "All"}.pdf`);
//  };
//
//  const filteredWindows = windows.filter((w) => {
//    if (tripIdFilter && (w?.trip?.id ?? w?.tripId)?.toString() !== tripIdFilter) return false;
//    if (!w.createdAt) return true;
//    const recordDateStr = w.createdAt.toString().substring(0, 10);
//    if (filterDate) return recordDateStr === filterDate;
//    if (fromDate && toDate) return recordDateStr >= fromDate && recordDateStr <= toDate;
//    return true;
//  });
//
//  const sortedWindows = [...filteredWindows].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//
//  return (
//    <div style={{ padding: "25px", fontFamily: "'Segoe UI', sans-serif", backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
//      {/* Header */}
//      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #3498db", marginBottom: "20px", paddingBottom: "10px" }}>
//        <h2 style={{ color: "#2c3e50", margin: 0 }}>Material Logistics Management</h2>
//        <button onClick={downloadPDF} style={{ padding: "10px 20px", backgroundColor: "#e67e22", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
//          📥 GENERATE TRIP DC
//        </button>
//      </div>
//
//      {/* Dispatch Details Section */}
//      <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", marginBottom: "25px" }}>
//        <h4>Project / Dispatch Details</h4>
//        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "15px" }}>
//          <div>
//            <label style={{ fontSize: "11px", color: "#7f8c8d" }}>PROJECT NAME</label>
//            <select name="projectName" value={dispatchDetails.projectName} onChange={handleDispatchChange} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}>
//              <option value="">-- Select Project --</option>
//              {projects.map((p, index) => <option key={index} value={p.projectName}>{p.projectName}</option>)}
//            </select>
//          </div>
//
//          <div>
//            <label style={{ fontSize: "11px", color: "#7f8c8d" }}>TOWER</label>
//            <select value={selectedTower} onChange={handleTowerChange} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}>
//              <option value="">-- Select Tower --</option>
//              {towers.map((t, idx) => (
//                <option key={t.towerId || idx} value={t.towerId}>{t.towerName}</option>
//              ))}
//            </select>
//          </div>
//
//          {["dcNo", "workOrderNumber", "codeNo", "tripId"].map(field => (
//            <div key={field}>
//              <label style={{ fontSize: "11px", color: "#7f8c8d" }}>{field.replace(/([A-Z])/g, " $1").toUpperCase()}</label>
//              <input
//                name={field}
//                type={field === "tripId" ? "number" : "text"}
//                value={dispatchDetails[field]}
//                onChange={handleDispatchChange}
//                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
//              />
//            </div>
//          ))}
//          <div>
//            <label style={{ fontSize: "11px", color: "#7f8c8d" }}>USER DATE</label>
//            <input
//              type="date"
//              name="userDate"
//              value={dispatchDetails.userDate}
//              onChange={handleDispatchChange}
//              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
//            />
//          </div>
//          <div style={{ display: "flex", alignItems: "flex-end" }}>
//            <button onClick={submitProjectLog} style={{ width: "100%", padding: "10px 15px", backgroundColor: "#8e44ad", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
//              SUBMIT PROJECT LOG
//            </button>
//          </div>
//        </div>
//
//        <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
//          <div style={{ flex: 1 }}>
//            <label style={{ fontSize: "11px", color: "#7f8c8d" }}>FLOOR</label>
//            <select value={selectedFloor} onChange={handleFloorChange} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}>
//              <option value="">-- Select Floor --</option>
//              {floors.map((f, idx) => (
//                <option key={f.floorId || idx} value={f.floorId}>Floor {f.floorNumber}</option>
//              ))}
//            </select>
//          </div>
//          <div style={{ flex: 1 }}>
//            <label style={{ fontSize: "11px", color: "#7f8c8d" }}>FLAT NUMBER</label>
//            <select value={flatNumber} onChange={(e) => setFlatNumber(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}>
//              <option value="">-- Select Flat --</option>
//              {flats.map(flat => (
//                <option key={flat.flatId} value={flat.flatNumber}>{flat.flatNumber}</option>
//              ))}
//            </select>
//          </div>
//        </div>
//      </div>
//
//      {/* Add Window Form */}
//      <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", marginBottom: "25px" }}>
//        <h4>Add New Material Details</h4>
//        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "15px" }}>
//          {Object.keys(initialState)
//            .filter(key => key !== "flatNo")
//            .map(key => (
//              <div key={key}>
//                <label style={{ fontSize: "11px", color: "#7f8c8d" }}>{key.replace(/([A-Z])/g, " $1").toUpperCase()}</label>
//                <input name={key} value={formData[key]} onChange={handleChange} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }} />
//              </div>
//            ))}
//        </div>
//
//        <button onClick={createWindow} style={{ marginTop: "20px", padding: "12px 30px", backgroundColor: "#27ae60", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
//          SUBMIT ASSET TO DATABASE
//        </button>
//
//        {/* EXCEL UPLOAD */}
//        <input
//          type="file"
//          accept=".xlsx, .xls"
//          onChange={(e) => setExcelFile(e.target.files[0])}
//          style={{ padding: "10px", borderRadius: "4px", border: "1px solid #ddd", cursor: "pointer", marginLeft: "20px" }}
//        />
//
//        <button
//          onClick={async () => {
//            if (!excelFile) {
//              alert("Please select an Excel file first!");
//              return;
//            }
//
//            const tripIdValue = dispatchDetails.tripId;
//            const selectedProjectObj = projects.find(
//              (p) => p.projectName === dispatchDetails.projectName
//            );
//            const projectIdValue = selectedProjectObj?.id || selectedProjectObj?.projectId;
//
//            if (!tripIdValue || !projectIdValue) {
//              alert("Please provide Trip ID and Project ID!");
//              return;
//            }
//
//            const uploadFormData = new FormData();
//            uploadFormData.append("file", excelFile);
//            uploadFormData.append("projectId", projectIdValue);
//            uploadFormData.append("towerId", selectedTower);
//
//            try {
//              const response = await axios.post(
//                `${API_URL}/api/items/upload/${tripIdValue}`,
//                uploadFormData,
//                { headers: { "Content-Type": "multipart/form-data" } }
//              );
//              alert(response.data || "Excel file uploaded successfully!");
//              getAllWindows();
//              setExcelFile(null);
//            } catch (error) {
//              console.error("Upload failed:", error);
//              // ✅ Show the full validation error message from backend (400 response)
//              const errorMsg =
//                error.response?.data ||
//                error.response?.data?.message ||
//                error.message;
//              alert(`❌ Upload Failed:\n\n${errorMsg}`);
//            }
//          }}
//          style={{ padding: "12px 25px", backgroundColor: "#2980b9", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", marginLeft: "15px" }}
//        >
//          SUBMIT EXCEL
//        </button>
//      </div>
//
//      {/* Data Table */}
//      <div style={{ marginTop: "40px" }}>
//        <h3 style={{ color: "#2c3e50" }}>Data Results (Database View)</h3>
//        <div style={{ display: "flex", gap: "15px", marginBottom: "20px", flexWrap: "wrap" }}>
//          <div>
//            <label>From Date</label>
//            <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setFilterDate(""); }} />
//          </div>
//          <div>
//            <label>To Date</label>
//            <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setFilterDate(""); }} />
//          </div>
//          <div>
//            <label>Specific Date</label>
//            <input type="date" value={filterDate} onChange={(e) => { setFilterDate(e.target.value); setFromDate(""); setToDate(""); }} />
//          </div>
//          <button
//            onClick={() => { setFromDate(""); setToDate(""); setFilterDate(""); }}
//            style={{ height: "35px", alignSelf: "flex-end", background: "#e74c3c", color: "#fff", border: "none", padding: "5px 15px", cursor: "pointer", borderRadius: "4px" }}
//          >
//            Reset
//          </button>
//          <div>
//            <label>Trip ID</label>
//            <input
//              type="text"
//              value={tripIdFilter}
//              onChange={(e) => setTripIdFilter(e.target.value)}
//              placeholder="Enter Trip ID"
//              style={{ padding: "5px 10px", borderRadius: "4px", border: "1px solid #ddd" }}
//            />
//          </div>
//        </div>
//        <div style={{ overflowX: "auto", background: "#fff", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
//          <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
//            <thead style={{ backgroundColor: "#2c3e50", color: "#ecf0f1" }}>
//              <tr>
//                <th>SR NO</th>
//                <th>TRIP ID</th>
//                <th>WINDOW SR NO</th>
//                <th>LOCATION</th>
//                <th>JOB CARD NO</th>
//                <th>DESCRIPTION</th>
//                <th>WIDTH</th>
//                <th>HEIGHT</th>
//                <th>QTY</th>
//                <th>UNIT</th>
//                <th>WEIGHT</th>
//                <th>REMARKS</th>
//                <th>STATUS</th>
//                <th>DATE</th>
//                <th>EDIT</th>
//              </tr>
//            </thead>
//            <tbody>
//              {loading ? (
//                <tr><td colSpan="15" style={{ textAlign: "center", padding: "30px" }}>Fetching data...</td></tr>
//              ) : filteredWindows.length > 0 ? (
//                sortedWindows.map((w, index) => (
//                  <tr key={w.id || index} onClick={() => setSelectedWindow(w)} style={{ borderBottom: "1px solid #eee", cursor: "pointer" }}>
//                    <td>{w.srNo || index + 1}</td>
//                    <td style={{ fontWeight: "bold", color: "#2980b9" }}>{w?.trip?.id ?? w?.tripId ?? "N/A"}</td>
//                    <td style={{ fontWeight: "bold" }}>{w.winSrNo || "N/A"}</td>
//                    <td>{w.location || "N/A"}</td>
//                    <td>{w.jobCardNo || "N/A"}</td>
//                    <td>{w.description || "N/A"}</td>
//                    <td>{w.width || 0}</td>
//                    <td>{w.height || 0}</td>
//                    <td>{w.qty || 0}</td>
//                    <td>{w.unit || "N/A"}</td>
//                    <td>{w.sqFt || 0}</td>
//                    <td>{w.remarks || "N/A"}</td>
//                    <td style={{ fontSize: "10px", color: "#7f8c8d" }}>{w.trip?.status || (w.tripId ? "ASSIGNED" : "NO TRIP")}</td>
//                    <td>{w.createdAt ? new Date(w.createdAt.replace(" ", "T")).toLocaleDateString() : "N/A"}</td>
//                    <td>
//                      <button
//                        onClick={(e) => {
//                          e.stopPropagation();
//                          setEditingWindow({ ...w, windowSrNo: w.winSrNo, weight: w.sqFt, remarks: w.remarks || "" });
//                          setEditModalVisible(true);
//                        }}
//                        style={{ padding: "5px 10px", background: "#3498db", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
//                      >
//                        Edit
//                      </button>
//                    </td>
//                  </tr>
//                ))
//              ) : (
//                <tr><td colSpan="15" style={{ textAlign: "center", padding: "30px" }}>No data found.</td></tr>
//              )}
//            </tbody>
//          </table>
//        </div>
//      </div>
//
//      {/* Detail Modal */}
//      {selectedWindow && (
//        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
//          <div style={{ background: "#fff", padding: "30px", borderRadius: "12px", width: "80%", maxHeight: "90vh", overflowY: "auto", position: "relative", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
//            <button onClick={() => setSelectedWindow(null)} style={{ position: "absolute", top: "15px", right: "15px", border: "none", background: "#e74c3c", color: "white", borderRadius: "50%", width: "30px", height: "30px", cursor: "pointer", fontWeight: "bold" }}>X</button>
//            <h3 style={{ borderBottom: "3px solid #3498db", paddingBottom: "10px", color: "#2c3e50" }}>Window Detailed Record: #{selectedWindow.windowId}</h3>
//            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "25px", marginTop: "20px" }}>
//              <div style={{ background: "#f1f4f9", padding: "20px", borderRadius: "8px" }}>
//                <h4 style={{ color: "#2980b9", marginTop: 0 }}>Production Details</h4>
//                <p><strong>Job Card:</strong> {selectedWindow.jobCardNo || "N/A"}</p>
//                <p><strong>Series Type:</strong> {selectedWindow.series || "N/A"}</p>
//                <p><strong>W-Code:</strong> {selectedWindow.wcodeNo || selectedWindow.wCodeNo || "N/A"}</p>
//                <p><strong>Description:</strong> {selectedWindow.description || "N/A"}</p>
//              </div>
//              <div style={{ background: "#f1f4f9", padding: "20px", borderRadius: "8px" }}>
//                <h4 style={{ color: "#2980b9", marginTop: 0 }}>Technical Specs</h4>
//                <p><strong>Dimensions:</strong> {selectedWindow.width || 0}mm x {selectedWindow.height || 0}mm</p>
//                <p><strong>Total Area:</strong> {selectedWindow.weight || 0} SqFt</p>
//                <p><strong>Units:</strong> {selectedWindow.units || 0}</p>
//                <p><strong>Shutters:</strong> Glass: {selectedWindow.glassShutter}, Mesh: {selectedWindow.meshShutter}</p>
//              </div>
//              <div style={{ background: "#f1f4f9", padding: "20px", borderRadius: "8px" }}>
//                <h4 style={{ color: "#d35400", marginTop: 0 }}>Logistics & Site</h4>
//                <p><strong>Flat No:</strong> {selectedWindow.flat?.flatNumber || selectedWindow.flatNumber || "N/A"}</p>
//                <p><strong>Trip ID:</strong> {selectedWindow.trip?.id || selectedWindow.tripId || "N/A"}</p>
//                {selectedWindow.trip && (
//                  <>
//                    <p><strong>Status:</strong> <span style={{ color: selectedWindow.trip.status === "CANCELLED" ? "red" : "green", fontWeight: "bold" }}>{selectedWindow.trip.status}</span></p>
//                    <p><strong>Vehicle:</strong> {selectedWindow.trip.vehicleNumber || "N/A"}</p>
//                    <p><strong>Driver:</strong> {selectedWindow.trip.driverName || "N/A"}</p>
//                  </>
//                )}
//              </div>
//            </div>
//          </div>
//        </div>
//      )}
//
//      {/* Edit Modal */}
//      {editModalVisible && editingWindow && (
//        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
//          <div style={{ background: "#fff", padding: "30px", borderRadius: "12px", width: "70%", maxHeight: "90vh", overflowY: "auto", position: "relative", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
//            <button onClick={() => setEditModalVisible(false)} style={{ position: "absolute", top: "15px", right: "15px", border: "none", background: "#e74c3c", color: "white", borderRadius: "50%", width: "30px", height: "30px", cursor: "pointer", fontWeight: "bold" }}>X</button>
//            <h3 style={{ borderBottom: "3px solid #3498db", paddingBottom: "10px", color: "#2c3e50" }}>Edit Window: #{editingWindow.windowId}</h3>
//            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "15px", marginTop: "20px" }}>
//              {Object.keys(initialState).map((key) => (
//                <div key={key}>
//                  <label style={{ fontSize: "11px", color: "#7f8c8d" }}>{key.replace(/([A-Z])/g, " $1").toUpperCase()}</label>
//                  <input
//                    name={key}
//                    value={editingWindow[key] || ""}
//                    onChange={(e) => setEditingWindow(prev => ({ ...prev, [key]: e.target.value }))}
//                    style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
//                  />
//                </div>
//              ))}
//            </div>
//            <button
//              onClick={async () => {
//                try {
//                  const payload = {
//                    ...editingWindow,
//                    winSrNo: editingWindow.windowSrNo,
//                    qty:     parseInt(editingWindow.qty)    || 0,
//                    width:   parseFloat(editingWindow.width)  || 0,
//                    height:  parseFloat(editingWindow.height) || 0,
//                    sqFt:    parseFloat(editingWindow.weight) || 0,
//                    remarks: editingWindow.remarks || ""
//                  };
//                  await axios.put(`${API_URL}/api/items/${editingWindow.id}`, payload);
//                  alert("Item updated successfully!");
//                  setEditModalVisible(false);
//                  getAllWindows();
//                } catch (error) {
//                  alert(`Update failed: ${error.response?.data?.message || error.message}`);
//                }
//              }}
//              style={{ marginTop: "20px", padding: "12px 30px", backgroundColor: "#27ae60", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
//            >
//              Update Item
//            </button>
//          </div>
//        </div>
//      )}
//    </div>
//  );
//};
//
//export default WindowManager;







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
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingWindow, setEditingWindow] = useState(null);
  const [tripIdFilter, setTripIdFilter] = useState("");
  const [excelFile, setExcelFile] = useState(null);
  const [towers, setTowers] = useState([]);
  const [selectedTower, setSelectedTower] = useState("");
  const [dispatchDetails, setDispatchDetails] = useState({
    projectName: "",
    dcNo: "",
    workOrderNumber: "",
    codeNo: "",
    tripId: "",
    userDate: ""
  });

  const initialState = {
    srNo: "",
    windowSrNo: "",
    flatNo: "",
    location: "",
    jobCardNo: "",
    description: "",
    width: "",
    height: "",
    qty: "",
    unit: "",
    weight: "",
    remarks: "",
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
            const towerResponse = await axios.get(`${API_URL}/api/towers/project/${projectId}`);
            setTowers(towerResponse.data || []);
            setSelectedTower("");
            setFloors([]);
            setSelectedFloor("");
            setFlats([]);
            setFlatNumber("");
          } catch (error) {
            console.error("Error fetching towers:", error);
            setTowers([]);
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

  const handleTowerChange = async (e) => {
    const towerId = e.target.value;
    setSelectedTower(towerId);
    setFloors([]);
    setSelectedFloor("");
    setFlats([]);
    setFlatNumber("");
    if (towerId) {
      try {
        const floorResponse = await axios.get(`${API_URL}/floors/tower/${towerId}`);
        setFloors(floorResponse.data || []);
      } catch (error) {
        console.error("Error fetching floors:", error);
      }
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
      const q = parseInt(name === "qty" ? value : prev.qty) || 0;
      if (w > 0 && h > 0 && q > 0) {
        const calculatedWeight = ((w * h * q) / 1000000) * 10.764;
        updated.weight = calculatedWeight.toFixed(2);
      } else {
        updated.weight = "";
      }
      return updated;
    });
  };

  const getAllWindows = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/items`);
      setWindows(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Load failed:", error);
      setWindows([]);
    } finally {
      setLoading(false);
    }
  };

  const submitProjectLog = async () => {
    if (!dispatchDetails.projectName || !selectedTower || !dispatchDetails.tripId) {
      alert("Please select Project, Tower and enter Trip ID");
      return;
    }
    try {
      setLoading(true);
      const selectedProjectObj = projects.find(
        (p) => p.projectName === dispatchDetails.projectName
      );
      const projectId = selectedProjectObj?.projectId || selectedProjectObj?.id;
      const payload = {
        projectName: dispatchDetails.projectName,
        dcNo: dispatchDetails.dcNo,
        workOrderNumber: dispatchDetails.workOrderNumber,
        codeNo: dispatchDetails.codeNo,
        tripId: Number(dispatchDetails.tripId),
        userDate: dispatchDetails.userDate,
        tower: { towerId: Number(selectedTower) },
      };
      await axios.post(`${API_URL}/logs`, payload);
      localStorage.setItem("tripId", dispatchDetails.tripId);
      localStorage.setItem("projectId", projectId);
      localStorage.setItem("towerId", selectedTower);
      alert("✅ Project Log Submitted Successfully!");
    } catch (error) {
      console.error("Submission Error:", error);
      alert("❌ Failed to submit project log.");
    } finally {
      setLoading(false);
    }
  };

  const createWindow = async () => {
    try {
      if (!dispatchDetails?.tripId || !selectedTower || !flatNumber) {
        alert("Please select a Trip, Tower and Flat Number.");
        return;
      }
      const selectedProjectObj = projects.find(
        p => p.projectName === dispatchDetails.projectName
      );
      const projectId = selectedProjectObj?.id || selectedProjectObj?.projectId;
      if (!projectId) {
        alert("Project ID not found!");
        return;
      }
      const payload = {
        srNo: parseInt(formData.srNo) || 0,
        winSrNo: formData.windowSrNo,
        flatNo: flatNumber,
        location: formData.location,
        jobCardNo: formData.jobCardNo,
        description: formData.description,
        width: parseFloat(formData.width) || 0,
        height: parseFloat(formData.height) || 0,
        qty: parseInt(formData.qty) || 0,
        unit: formData.unit,
        sqFt: parseFloat(formData.weight) || 0,
        remarks: formData.remarks,
      };
      await axios.post(
        `${API_URL}/api/items/create?tripId=${dispatchDetails.tripId}&projectId=${projectId}&towerId=${selectedTower}`,
        payload
      );
      alert("Item created successfully!");
      getAllWindows();
      setFormData(initialState);
    } catch (error) {
      console.error(error);
      alert(`Error: ${error.response?.data?.message || "Check Console"}`);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Helper: check if a value is non-empty/non-zero for column inclusion logic
  // ─────────────────────────────────────────────────────────────────────────────
  const hasValue = (val) => {
    if (val === null || val === undefined) return false;
    if (typeof val === "string" && val.trim() === "") return false;
    if (typeof val === "number" && val === 0) return false;
    return true;
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // downloadPDF — includes ALL of these columns:
  //   Sr No | Win Sr No | Floor No | Flat No | Location | Job Card No |
  //   Priority | Description | Width | Height | Qty | Unit | SqFt | Weight | R Mtr | Remarks
  // Only prints a column if at least one row has a non-empty value for it.
  // Sr No, Floor No, Flat No are always included.
  // ─────────────────────────────────────────────────────────────────────────────
  const downloadPDF = async () => {
    const tripInput = prompt("Enter Trip ID (optional):")?.trim();

    let filteredWindows = windows;

    let dispatchInfo = {
      projectName: "N/A",
      dcNo: "N/A",
      workOrderNumber: "N/A",
      codeNo: "N/A",
    };

    let dynamicTowerName = "N/A";
    let actualDate = null;
    let userDate = null;
    let sameDate = true;

    if (tripInput) {
      filteredWindows = windows.filter(
        (w) => (w?.trip?.id ?? w?.tripId)?.toString() === tripInput
      );

      if (filteredWindows.length === 0) {
        return alert("No windows found for the entered Trip ID.");
      }

      try {
        const response = await axios.get(`${API_URL}/logs/trip/${tripInput}`);
        if (response.data && response.data.length > 0) {
          const latestLog = response.data[0];

          try {
            const dateRes = await axios.get(`${API_URL}/logs/trip/${tripInput}/dates`);
            if (dateRes.data) {
              actualDate = dateRes.data.actualDate;
              userDate   = dateRes.data.userDate;
              sameDate   = dateRes.data.sameDate;
            }
          } catch (err) {
            console.error("Error fetching date comparison:", err);
          }

          dispatchInfo = {
            projectName:     latestLog.projectName     || "N/A",
            dcNo:            latestLog.dcNo            || "N/A",
            workOrderNumber: latestLog.workOrderNumber || "N/A",
            codeNo:          latestLog.codeNo          || "N/A",
          };

          if (latestLog.projectName) {
            const projectRes = await axios.get(`${API_URL}/projects/by-name/${latestLog.projectName}`);
            const pId = projectRes.data?.projectId;
            const refWindow = filteredWindows[0];
            const tId = refWindow?.tower?.towerId || refWindow?.towerId || selectedTower;
            if (pId && tId) {
              const towerRes = await axios.get(`${API_URL}/api/towers/project/${pId}`);
              const foundTower = towerRes.data.find((t) => t.towerId == tId);
              if (foundTower) dynamicTowerName = foundTower.towerName;
            }
          }
        }
      } catch (error) {
        console.error("Error fetching project log for Trip:", error);
      }
    }

    if (filteredWindows.length === 0) {
      return alert("No data available to generate PDF.");
    }

    // ── Define ALL columns with their header and value extractor ─────────────
    // mandatory: always included regardless of data (Sr No, Floor No, Flat No)
    const allColumns = [
      {
        header: "Sr No.",
        mandatory: true,
        getValue: (w, i) => i + 1,
      },
      {
        header: "Win Sr No",
        mandatory: false,
        getValue: (w) => w.winSrNo,
      },
      {
        header: "Floor No",
        mandatory: true,
        getValue: (w) => w?.floor?.floorNumber ?? w?.floorNo,
      },
      {
        header: "Flat No",
        mandatory: true,
        getValue: (w) => w?.flat?.flatNumber ?? w?.flat?.flatNo ?? w.flatNo,
      },
      {
        header: "Location",
        mandatory: false,
        getValue: (w) => w.location,
      },
      {
        header: "Job Card No",
        mandatory: false,
        getValue: (w) => w.jobCardNo,
      },
      {
        header: "Priority",
        mandatory: false,
        getValue: (w) => w.priority,
      },
      {
        header: "Description",
        mandatory: false,
        getValue: (w) => w.description,
      },
      {
        header: "Width",
        mandatory: false,
        getValue: (w) => (w.width != null && w.width !== 0) ? w.width : null,
      },
      {
        header: "Height",
        mandatory: false,
        getValue: (w) => (w.height != null && w.height !== 0) ? w.height : null,
      },
      {
        header: "Qty",
        mandatory: false,
        getValue: (w) => (w.qty != null && w.qty !== 0) ? w.qty : null,
      },
      {
        header: "Unit",
        mandatory: false,
        getValue: (w) => w.unit,
      },
      {
        header: "SqFt",
        mandatory: false,
        getValue: (w) => (w.sqFt != null && w.sqFt !== 0) ? w.sqFt : null,
      },
      {
        header: "Weight",
        mandatory: false,
        getValue: (w) => (w.weight != null && w.weight !== 0) ? w.weight : null,
      },
      {
        header: "R Mtr",
        mandatory: false,
        getValue: (w) => w.rMtr ?? w.rmtr ?? w.rMeter ?? w.r_mtr,
      },
      {
        header: "Remarks",
        mandatory: false,
        getValue: (w) => w.remarks,
      },
    ];

    // ── Filter: keep mandatory columns always; keep optional only if ≥1 row has data ──
    const activeColumns = allColumns.filter((col) => {
      if (col.mandatory) return true;
      return filteredWindows.some((w, i) => hasValue(col.getValue(w, i)));
    });

    // ── Build table header and rows ──────────────────────────────────────────
    const tableColumn = activeColumns.map((c) => c.header);
    const tableRows = filteredWindows.map((w, i) =>
      activeColumns.map((c) => {
        const val = c.getValue(w, i);
        if (val === null || val === undefined) return "";
        return val;
      })
    );

    const doc = new jsPDF("landscape");
    const refWindow = filteredWindows[0];
    const refTrip   = refWindow?.trip || {};

    const towerDisplay =
      dynamicTowerName !== "N/A"
        ? dynamicTowerName
        : towers.find((t) => t.towerId == selectedTower)?.towerName || "N/A";

    // --- LOGO ---
    const cloudinaryLogoUrl =
      "https://res.cloudinary.com/dhmcijhts/image/upload/v1774439813/updytp3rs57vhqtdbx1p.png";
    try {
      doc.addImage(cloudinaryLogoUrl, "PNG", 35, 8, 38, 20);
      doc.setDrawColor(220, 220, 220);
      doc.line(14, 33, 283, 33);
    } catch (e) {
      console.error("Logo failed to load", e);
    }

    // --- HEADER ---
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.text("ONEDEO LEELA FAÇADE SYSTEMS PRIVATE LIMITED", 160, 18, { align: "center" });
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("Building No/Flat No 327, Bopgaon Chowk, Pune, Maharashtra 412301", 160, 25, { align: "center" });

    // --- PROJECT/TRIP INFO ---
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Project Name: ${dispatchInfo.projectName}`, 14, 42);
    doc.text(`Tower Name: ${towerDisplay}`, 14, 48);
    doc.text(`DC No: ${dispatchInfo.dcNo}`, 14, 54);
    doc.text(`Work Order No: ${dispatchInfo.workOrderNumber}`, 14, 60);
    doc.text(`Code No: ${dispatchInfo.codeNo}`, 14, 66);
    doc.text(`Trip ID: ${tripInput || refTrip.id || "All"}`, 220, 42);

    const actualDateFormatted = actualDate
      ? new Date(actualDate).toLocaleDateString()
      : new Date().toLocaleDateString();
    const userDateFormatted = userDate ? new Date(userDate).toLocaleDateString() : null;

    let yPosition = 54;
    doc.text(`Date: ${actualDateFormatted}`, 220, 48);
    if (!sameDate && userDateFormatted) {
      doc.text(`Material Delivery Date: ${userDateFormatted}`, 14, 72);
    }

    doc.text(`Vehicle No: ${refTrip.vehicleNumber || "N/A"}`, 220, yPosition);
    doc.text(`Driver Name: ${refTrip.driverName   || "N/A"}`, 220, yPosition + 6);
    doc.text(`Trip Status: ${refTrip.status        || "N/A"}`, 220, yPosition + 12);

    // --- TABLE (only active columns) ---
    autoTable(doc, {
      head:       [tableColumn],
      body:       tableRows,
      startY:     75,
      theme:      "grid",
      styles:     { fontSize: 7 },
      headStyles: { fillColor: [44, 62, 80] },
    });

    const finalY = (doc.lastAutoTable?.finalY || 75) + 10;

    const totalWeight = filteredWindows
      .reduce((sum, w) => sum + (parseFloat(w.sqFt) || 0), 0)
      .toFixed(2);

    doc.text(`Total Weight: ${totalWeight}`, 250, finalY);
    doc.text("Prepared By: ________________", 14,  finalY + 20);
    doc.text("Checked By: ________________",  110, finalY + 20);
    doc.text("Received By: ________________", 210, finalY + 20);

    doc.save(`Onedeo_Report_Trip_${tripInput || "All"}.pdf`);
  };

  const filteredWindows = windows.filter((w) => {
    if (tripIdFilter && (w?.trip?.id ?? w?.tripId)?.toString() !== tripIdFilter) return false;
    if (!w.createdAt) return true;
    const recordDateStr = w.createdAt.toString().substring(0, 10);
    if (filterDate) return recordDateStr === filterDate;
    if (fromDate && toDate) return recordDateStr >= fromDate && recordDateStr <= toDate;
    return true;
  });

  const sortedWindows = [...filteredWindows].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div style={{ padding: "25px", fontFamily: "'Segoe UI', sans-serif", backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #3498db", marginBottom: "20px", paddingBottom: "10px" }}>
        <h2 style={{ color: "#2c3e50", margin: 0 }}>Material Logistics Management</h2>
        <button onClick={downloadPDF} style={{ padding: "10px 20px", backgroundColor: "#e67e22", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
          📥 GENERATE TRIP DC
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

          <div>
            <label style={{ fontSize: "11px", color: "#7f8c8d" }}>TOWER</label>
            <select value={selectedTower} onChange={handleTowerChange} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}>
              <option value="">-- Select Tower --</option>
              {towers.map((t, idx) => (
                <option key={t.towerId || idx} value={t.towerId}>{t.towerName}</option>
              ))}
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
          <div>
            <label style={{ fontSize: "11px", color: "#7f8c8d" }}>USER DATE</label>
            <input
              type="date"
              name="userDate"
              value={dispatchDetails.userDate}
              onChange={handleDispatchChange}
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
            />
          </div>
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
            <select value={flatNumber} onChange={(e) => setFlatNumber(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}>
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
        <h4>Add New Material Details</h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "15px" }}>
          {Object.keys(initialState)
            .filter(key => key !== "flatNo")
            .map(key => (
              <div key={key}>
                <label style={{ fontSize: "11px", color: "#7f8c8d" }}>{key.replace(/([A-Z])/g, " $1").toUpperCase()}</label>
                <input name={key} value={formData[key]} onChange={handleChange} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }} />
              </div>
            ))}
        </div>

        <button onClick={createWindow} style={{ marginTop: "20px", padding: "12px 30px", backgroundColor: "#27ae60", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
          SUBMIT ASSET TO DATABASE
        </button>

        {/* EXCEL UPLOAD */}
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={(e) => setExcelFile(e.target.files[0])}
          style={{ padding: "10px", borderRadius: "4px", border: "1px solid #ddd", cursor: "pointer", marginLeft: "20px" }}
        />

        <button
          onClick={async () => {
            if (!excelFile) {
              alert("Please select an Excel file first!");
              return;
            }

            const tripIdValue = dispatchDetails.tripId;
            const selectedProjectObj = projects.find(
              (p) => p.projectName === dispatchDetails.projectName
            );
            const projectIdValue = selectedProjectObj?.id || selectedProjectObj?.projectId;

            if (!tripIdValue || !projectIdValue) {
              alert("Please provide Trip ID and Project ID!");
              return;
            }

            const uploadFormData = new FormData();
            uploadFormData.append("file", excelFile);
            uploadFormData.append("projectId", projectIdValue);
            uploadFormData.append("towerId", selectedTower);

            try {
              const response = await axios.post(
                `${API_URL}/api/items/upload/${tripIdValue}`,
                uploadFormData,
                { headers: { "Content-Type": "multipart/form-data" } }
              );
              alert(response.data || "Excel file uploaded successfully!");
              getAllWindows();
              setExcelFile(null);
            } catch (error) {
              console.error("Upload failed:", error);
              const errorMsg =
                error.response?.data ||
                error.response?.data?.message ||
                error.message;
              alert(`❌ Upload Failed:\n\n${errorMsg}`);
            }
          }}
          style={{ padding: "12px 25px", backgroundColor: "#2980b9", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", marginLeft: "15px" }}
        >
          SUBMIT EXCEL
        </button>
      </div>

      {/* Data Table */}
      <div style={{ marginTop: "40px" }}>
        <h3 style={{ color: "#2c3e50" }}>Data Results (Database View)</h3>
        <div style={{ display: "flex", gap: "15px", marginBottom: "20px", flexWrap: "wrap" }}>
          <div>
            <label>From Date</label>
            <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setFilterDate(""); }} />
          </div>
          <div>
            <label>To Date</label>
            <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setFilterDate(""); }} />
          </div>
          <div>
            <label>Specific Date</label>
            <input type="date" value={filterDate} onChange={(e) => { setFilterDate(e.target.value); setFromDate(""); setToDate(""); }} />
          </div>
          <button
            onClick={() => { setFromDate(""); setToDate(""); setFilterDate(""); }}
            style={{ height: "35px", alignSelf: "flex-end", background: "#e74c3c", color: "#fff", border: "none", padding: "5px 15px", cursor: "pointer", borderRadius: "4px" }}
          >
            Reset
          </button>
          <div>
            <label>Trip ID</label>
            <input
              type="text"
              value={tripIdFilter}
              onChange={(e) => setTripIdFilter(e.target.value)}
              placeholder="Enter Trip ID"
              style={{ padding: "5px 10px", borderRadius: "4px", border: "1px solid #ddd" }}
            />
          </div>
        </div>
        <div style={{ overflowX: "auto", background: "#fff", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
          <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
            <thead style={{ backgroundColor: "#2c3e50", color: "#ecf0f1" }}>
              <tr>
                <th>SR NO</th>
                <th>TRIP ID</th>
                <th>WINDOW SR NO</th>
                <th>LOCATION</th>
                <th>JOB CARD NO</th>
                <th>DESCRIPTION</th>
                <th>WIDTH</th>
                <th>HEIGHT</th>
                <th>QTY</th>
                <th>UNIT</th>
                <th>WEIGHT</th>
                <th>REMARKS</th>
                <th>STATUS</th>
                <th>DATE</th>
                <th>EDIT</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="15" style={{ textAlign: "center", padding: "30px" }}>Fetching data...</td></tr>
              ) : filteredWindows.length > 0 ? (
                sortedWindows.map((w, index) => (
                  <tr key={w.id || index} onClick={() => setSelectedWindow(w)} style={{ borderBottom: "1px solid #eee", cursor: "pointer" }}>
                    <td>{w.srNo || index + 1}</td>
                    <td style={{ fontWeight: "bold", color: "#2980b9" }}>{w?.trip?.id ?? w?.tripId ?? "N/A"}</td>
                    <td style={{ fontWeight: "bold" }}>{w.winSrNo || "N/A"}</td>
                    <td>{w.location || "N/A"}</td>
                    <td>{w.jobCardNo || "N/A"}</td>
                    <td>{w.description || "N/A"}</td>
                    <td>{w.width || 0}</td>
                    <td>{w.height || 0}</td>
                    <td>{w.qty || 0}</td>
                    <td>{w.unit || "N/A"}</td>
                    <td>{w.sqFt || 0}</td>
                    <td>{w.remarks || "N/A"}</td>
                    <td style={{ fontSize: "10px", color: "#7f8c8d" }}>{w.trip?.status || (w.tripId ? "ASSIGNED" : "NO TRIP")}</td>
                    <td>{w.createdAt ? new Date(w.createdAt.replace(" ", "T")).toLocaleDateString() : "N/A"}</td>
                    <td>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingWindow({ ...w, windowSrNo: w.winSrNo, weight: w.sqFt, remarks: w.remarks || "" });
                          setEditModalVisible(true);
                        }}
                        style={{ padding: "5px 10px", background: "#3498db", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="15" style={{ textAlign: "center", padding: "30px" }}>No data found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
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
                <p><strong>Total Area:</strong> {selectedWindow.weight || 0} SqFt</p>
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

      {/* Edit Modal */}
      {editModalVisible && editingWindow && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", padding: "30px", borderRadius: "12px", width: "70%", maxHeight: "90vh", overflowY: "auto", position: "relative", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
            <button onClick={() => setEditModalVisible(false)} style={{ position: "absolute", top: "15px", right: "15px", border: "none", background: "#e74c3c", color: "white", borderRadius: "50%", width: "30px", height: "30px", cursor: "pointer", fontWeight: "bold" }}>X</button>
            <h3 style={{ borderBottom: "3px solid #3498db", paddingBottom: "10px", color: "#2c3e50" }}>Edit Window: #{editingWindow.windowId}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "15px", marginTop: "20px" }}>
              {Object.keys(initialState).map((key) => (
                <div key={key}>
                  <label style={{ fontSize: "11px", color: "#7f8c8d" }}>{key.replace(/([A-Z])/g, " $1").toUpperCase()}</label>
                  <input
                    name={key}
                    value={editingWindow[key] || ""}
                    onChange={(e) => setEditingWindow(prev => ({ ...prev, [key]: e.target.value }))}
                    style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                  />
                </div>
              ))}
            </div>
            <button
              onClick={async () => {
                try {
                  const payload = {
                    ...editingWindow,
                    winSrNo: editingWindow.windowSrNo,
                    qty:     parseInt(editingWindow.qty)    || 0,
                    width:   parseFloat(editingWindow.width)  || 0,
                    height:  parseFloat(editingWindow.height) || 0,
                    sqFt:    parseFloat(editingWindow.weight) || 0,
                    remarks: editingWindow.remarks || ""
                  };
                  await axios.put(`${API_URL}/api/items/${editingWindow.id}`, payload);
                  alert("Item updated successfully!");
                  setEditModalVisible(false);
                  getAllWindows();
                } catch (error) {
                  alert(`Update failed: ${error.response?.data?.message || error.message}`);
                }
              }}
              style={{ marginTop: "20px", padding: "12px 30px", backgroundColor: "#27ae60", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
            >
              Update Item
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WindowManager;
