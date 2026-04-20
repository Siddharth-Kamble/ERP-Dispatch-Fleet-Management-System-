

import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";



const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const WindowManager = () => {
  const [windows, setWindows] = useState([]);
  const [selectedWindow, setSelectedWindow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tripDates, setTripDates] = useState(null);
  // Hierarchy States
  const [projects, setProjects] = useState([]);
  const [towers, setTowers] = useState([]);
  const [selectedTower, setSelectedTower] = useState("");
  const [floors, setFloors] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState("");
  const [flats, setFlats] = useState([]);
  const [flatNumber, setFlatNumber] = useState("");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingWindow, setEditingWindow] = useState(null);
  const [tripIdFilter, setTripIdFilter] = useState("");

  const [dispatchDetails, setDispatchDetails] = useState({
    projectName: "",
    dcNo: "",
    workOrderNumber: "",
    codeNo: "",
    tripId: "",
    userDate: ""
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
            // New Flow: Fetch Towers first
            const towerResponse = await axios.get(`${API_URL}/api/towers/project/${projectId}`);
            setTowers(towerResponse.data || []);
            setSelectedTower("");
            setFloors([]);
            setSelectedFloor("");
            setFlats([]);
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
   if (!dispatchDetails.projectName || !selectedTower || !dispatchDetails.tripId) {
     alert("Please select Project, Tower and enter Trip ID");
     return;
   }

   try {
     setLoading(true);

     // Get Project ID from project name
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
       tower: {
         towerId: Number(selectedTower), // ✅ correct
       },
     };

     await axios.post(`${API_URL}/logs`, payload);

     // ✅ Store correct values
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
const formatDate = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-IN");
};



const downloadPDF = async () => {
  const tripInput    = prompt("Enter Trip ID (optional):")?.trim();
  const extraName    = prompt("Enter Receiver Name (optional):")?.trim() || "";
  const extraContact = prompt("Enter Receiver Contact No (optional):")?.trim() || "";

  let filteredWindows = windows;
  let tripDateData    = null;
  let driverMobile    = "N/A";
  let dispatchInfo = {
    projectName:         "N/A",
    clientName:          "N/A",
    dcNo:                "N/A",
    workOrderNumber:     "N/A",
    codeNo:              "N/A",
    userDate:            null,
    materialDeliveryDate:"N/A",
  };
  let dynamicTowerName = "N/A";

  if (tripInput) {
    filteredWindows = windows.filter(
      (w) => (w?.trip?.id ?? w?.tripId)?.toString() === tripInput
    );

    if (filteredWindows.length === 0) {
      return alert("No windows found for the entered Trip ID.");
    }

    // 1. Fetch trip date comparison — independent
    try {
      const dateRes = await axios.get(`${API_URL}/logs/trip/${tripInput}/dates`);
      tripDateData = dateRes.data;
    } catch (err) {
      console.error("Error fetching trip date comparison:", err);
    }

    // 2. Fetch Project Log using Trip ID — independent
    try {
      const response = await axios.get(`${API_URL}/logs/trip/${tripInput}`);
      if (response.data && response.data.length > 0) {
        const tripLog = response.data.find(
          (log) => log.tripId?.toString() === tripInput
        );
        if (tripLog) {
          dispatchInfo = {
            projectName: tripLog.projectName || "N/A",
            clientName:  "N/A",
            dcNo:        tripLog.dcNo || "N/A",
            workOrderNumber: tripLog.workOrderNumber || "N/A",
            codeNo:      tripLog.codeNo || "N/A",
            userDate:    tripLog.userDate || null,
            materialDeliveryDate: tripLog.materialDeliveryDate
              ? new Date(tripLog.materialDeliveryDate).toLocaleDateString("en-IN")
              : "N/A",
          };

          if (tripLog.projectName) {
            try {
              const projectRes = await axios.get(
                `${API_URL}/projects/by-name/${encodeURIComponent(tripLog.projectName)}`
              );
              dispatchInfo.clientName = projectRes.data?.clientName || "N/A";
            } catch (err) {
              console.error("Error fetching client name:", err);
            }
          }
        }
      }
    } catch (err) {
      console.error("Error fetching project log:", err);
    }

    // 3. Tower name — independent, robust string + object handling
    try {
      const towerRes = await axios.get(`${API_URL}/api/towers/trip/${tripInput}`);
      console.log("🏗️ Tower raw response:", towerRes.data, typeof towerRes.data);
      const raw = towerRes.data;
      if (typeof raw === "string" && raw.trim() !== "") {
        dynamicTowerName = raw.trim();
      } else if (raw && typeof raw === "object") {
        dynamicTowerName =
          String(raw.towerName || raw.name || raw.tower || "").trim() || "N/A";
      }
      console.log("✅ Tower name resolved:", dynamicTowerName);
    } catch (err) {
      console.error("❌ Error fetching tower name:", err.response?.status, err.response?.data);
    }

    // 4. Driver Mobile — independent, robust string + object handling
    try {
      const mobileRes = await axios.get(`${API_URL}/api/trips/${tripInput}/driver-mobile`);
      console.log("📱 Driver mobile raw response:", mobileRes.data, typeof mobileRes.data);
      const rawMobile = mobileRes.data;
      if (rawMobile && typeof rawMobile === "object") {
        driverMobile = String(rawMobile.mobile || rawMobile.driverMobile || "").trim() || "N/A";
      } else if (rawMobile !== null && rawMobile !== undefined) {
        driverMobile = String(rawMobile).trim() || "N/A";
      }
      console.log("✅ Driver mobile fetched:", driverMobile);
    } catch (err) {
      console.error("❌ Error fetching driver mobile:", err.response?.status, err.response?.data);
    }
  }

  if (filteredWindows.length === 0) {
    return alert("No data available to generate PDF.");
  }

  console.log("📄 dynamicTowerName:", dynamicTowerName);
  console.log("📄 driverMobile:", driverMobile);
  console.log("📄 dispatchInfo:", dispatchInfo);

  const doc       = new jsPDF("portrait");
  const refWindow = filteredWindows[0];
  const refTrip   = refWindow?.trip || {};

  const towerDisplay =
    dynamicTowerName !== "N/A"
      ? dynamicTowerName
      : towers.find((t) => t.towerId == selectedTower)?.towerName || "N/A";

  console.log("📄 towerDisplay:", towerDisplay);

  const cloudinaryLogoUrl =
    "https://res.cloudinary.com/dhmcijhts/image/upload/v1774439813/updytp3rs57vhqtdbx1p.png";

  // ═══════════════════════════════════════════════════════════
  // LAYOUT CONSTANTS  (portrait page = 210 × 297 mm)
  // ═══════════════════════════════════════════════════════════
  const boxLeft           = 10;
  const boxRight          = 200;
  const boxTop            = 8;

  // Column X positions
  const leftLabel         = 14;
  const leftValue         = 57;
  const rightLabel        = 112;
  const rightValue        = 150;
  const dividerX          = 108;   // vertical divider between left / right info columns
  const maxTextWidthLeft  = 48;
  const maxTextWidthRight = 45;

  const rowGap     = 7;
  // Address block: company name at y=14, then 8 lines × 4.2 = 33.6 → last line at ~47.8
  // dividerY sits just below that with a small gap
  const dividerY   = 53;           // horizontal line separating address from info rows
  const infoStartY = 60;           // first info row (Client Name) — 7 mm below dividerY

  const fitText = (text, maxWidth, fontSize = 9) => {
    doc.setFontSize(fontSize);
    const strText = String(text ?? "N/A");
    const lines   = doc.splitTextToSize(strText, maxWidth);
    return lines[0] + (lines.length > 1 ? "..." : "");
  };

  let materialDeliveryDisplay = dispatchInfo.materialDeliveryDate;
  let actualDateDisplay       = "N/A";
  if (tripDateData) {
    materialDeliveryDisplay =
      formatDate(tripDateData.userDate) || dispatchInfo.materialDeliveryDate;
    actualDateDisplay = formatDate(tripDateData.actualDate) || "N/A";
  }

  // ── LEFT rows ───────────────────────────────────────────────
  const leftRows = [
    { label: "Client Name",    value: dispatchInfo.clientName },
    { label: "Project Name",   value: dispatchInfo.projectName },
    { label: "Tower Name",     value: towerDisplay },
    { label: "Code No.",       value: dispatchInfo.codeNo },
    { label: "Work Order No.", value: dispatchInfo.workOrderNumber },
    { label: "DC No",          value: dispatchInfo.dcNo },
    { label: "Delivery Date",  value: materialDeliveryDisplay },
  ];

  // ── RIGHT rows ──────────────────────────────────────────────
  const rightRows = [
    ...(!tripDateData?.sameDate && actualDateDisplay !== "N/A"
      ? [{ label: "DC Date",     value: actualDateDisplay }]
      : []),
    { label: "Trip ID",       value: String(tripInput || refTrip.id || "All") },
    { label: "Vehicle No",    value: refTrip.vehicleNumber || "N/A" },
    { label: "Driver",        value: refTrip.driverName    || "N/A" },
    { label: "Driver Mo.",    value: driverMobile },
    ...(extraName    ? [{ label: "Recv. Name",    value: extraName    }] : []),
    ...(extraContact ? [{ label: "Recv. Contact", value: extraContact }] : []),
  ];

  const maxInfoRows = Math.max(leftRows.length, rightRows.length);
  const boxBottom   = infoStartY + (maxInfoRows - 1) * rowGap + 8;
  const boxHeight   = boxBottom - boxTop;

  // ── Outer border box ────────────────────────────────────────
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.rect(boxLeft, boxTop, boxRight - boxLeft, boxHeight);

  // ── Logo ────────────────────────────────────────────────────
  try {
    doc.addImage(cloudinaryLogoUrl, "PNG", 12, 10, 28, 18);
  } catch (e) {
    console.error("Logo failed to load", e);
  }

  // ── Company name ────────────────────────────────────────────
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("ONEDEO LEELA FACADE SYSTEMS PRIVATE LIMITED", 105, 14, { align: "center" });

  // ── Address block (8 lines × 4.2 mm spacing, starts at y=20) ──
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  [
    "Building No/Flat No 327",
    "Road/Street: Ganeshwadi Road, Bhopgaon Chowk",
    "Nearby Landmark: Bhopgaon Bus Stand",
    "Locality/Sub Locality: Bhopgaon",
    "City/Town/Village: Purandhar Fort",
    "Pune, Maharashtra, 412301",
    "Tel. No.: - 9011333735",
    "E-Mail :- info@onedlfs.com",
  ].forEach((line, i) => {
    doc.text(line, 105, 20 + i * 4.2, { align: "center" });
  });

  // ── Horizontal divider below address block ──────────────────
  doc.setLineWidth(0.3);
  doc.line(boxLeft, dividerY, boxRight, dividerY);

  // ── Vertical divider between left / right info columns ──────
  doc.line(dividerX, dividerY, dividerX, boxBottom);

  // ── Left info rows ───────────────────────────────────────────
  doc.setFontSize(9);
  leftRows.forEach((row, i) => {
    const y = infoStartY + i * rowGap;
    doc.setFont("helvetica", "bold");
    doc.text(row.label, leftLabel, y);
    doc.text(":", leftValue - 3, y);
    doc.setFont("helvetica", "normal");
    doc.text(fitText(row.value, maxTextWidthLeft), leftValue, y);
  });

  // ── Right info rows ──────────────────────────────────────────
  doc.setFontSize(9);
  rightRows.forEach((row, i) => {
    const y = infoStartY + i * rowGap;
    doc.setFont("helvetica", "bold");
    doc.text(row.label, rightLabel, y);
    doc.text(":", rightValue - 3, y);
    doc.setFont("helvetica", "normal");
    doc.text(fitText(row.value, maxTextWidthRight), rightValue, y);
  });

  // ── Disclaimer strip ─────────────────────────────────────────
  const disclaimerY = boxBottom + 5;
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text(
    "Please receive following goods dispatched in good order and condition & Kindly return the duplicate duly signed.",
    boxLeft, disclaimerY
  );
  doc.setLineWidth(0.3);
  doc.line(boxLeft, disclaimerY + 2, boxRight, disclaimerY + 2);

  // ═══════════════════════════════════════════════════════════
  // TABLE
  // ═══════════════════════════════════════════════════════════
  const tableStartY = disclaimerY + 6;

  const tableColumn = [
    "Sr.", "Trip ID", "Win.Sr", "Flat", "Loc", "W.Code",
    "Description", "Job Card", "Series", "Width", "Height",
    "Track", "Bottom", "Glass", "Mesh", "Unit", "SqFt",
  ];

  const windowTableRows = filteredWindows.map((w, index) => [
    index + 1,
    w?.trip?.id ?? w?.tripId ?? "N/A",
    w.windowSeriesNumber || "N/A",
    w?.flat?.flatNumber ?? w?.flatNumber ?? "N/A",
    w.location || "N/A",
    w.wcodeNo || w.wCodeNo || "N/A",
    w.description || "N/A",
    w.jobCardNo || "N/A",
    w.series || "N/A",
    w.width || 0,
    w.height || 0,
    w.trackOuter || 0,
    w.bottomFix || 0,
    w.glassShutter || 0,
    w.meshShutter || 0,
    w.units || 0,
    w.sqft || 0,
  ]);

  const totalTrack  = filteredWindows.reduce((sum, w) => sum + (parseInt(w.trackOuter)   || 0), 0);
  const totalBottom = filteredWindows.reduce((sum, w) => sum + (parseInt(w.bottomFix)    || 0), 0);
  const totalGlass  = filteredWindows.reduce((sum, w) => sum + (parseInt(w.glassShutter) || 0), 0);
  const totalMesh   = filteredWindows.reduce((sum, w) => sum + (parseInt(w.meshShutter)  || 0), 0);
  const totalUnits  = filteredWindows.reduce((sum, w) => sum + (parseInt(w.units)        || 0), 0);
  const totalSqFt   = filteredWindows.reduce((sum, w) => sum + (parseFloat(w.sqft)       || 0), 0);

  const totalsRow = [
    "", "", "", "", "", "", "", "", "", "", "",
    totalTrack, totalBottom, totalGlass, totalMesh, totalUnits, totalSqFt.toFixed(2),
  ];

  autoTable(doc, {
    head: [tableColumn],
    body: [...windowTableRows, totalsRow],
    startY: tableStartY,
    theme: "grid",
    styles: {
      fontSize: 6,
      cellPadding: 1.2,
      fontStyle: "bold",
    },
    headStyles: {
      fillColor: [44, 62, 80],
      fontStyle: "bold",
      fontSize: 6,
    },
    columnStyles: { 6: { cellWidth: 22 } },
    didParseCell: function (data) {
      if (data.row.index === windowTableRows.length) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fillColor = [230, 230, 230];
      }
    },
    margin: { left: 10, right: 10 },
  });

  // ═══════════════════════════════════════════════════════════
  // FOOTER — with page overflow protection
  // ═══════════════════════════════════════════════════════════
  const finalY       = (doc.lastAutoTable?.finalY || tableStartY) + 10;
  const pageHeight   = doc.internal.pageSize.getHeight();
  const footerHeight = 30;

  let footerY;
  if (finalY + footerHeight > pageHeight - 10) {
    doc.addPage();
    footerY = 20;
  } else {
    footerY = finalY;
  }

  doc.setLineWidth(0.3);
  doc.line(10, footerY, 200, footerY);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text(`Total SqFt: ${totalSqFt.toFixed(2)}`, 155, footerY + 8);
  doc.text("Prepared By: ________________", 10,  footerY + 20);
  doc.text("Checked By: ________________",  75,  footerY + 20);
  doc.text("Recv. Sign & Stamp: ________", 145,  footerY + 20);

  doc.save(`Onedeo_Report_Trip_${tripInput || "All"}.pdf`);
};

  const filteredWindowsByCriteria = windows.filter((w) => {
    if (tripIdFilter && (w?.trip?.id ?? w?.tripId)?.toString() !== tripIdFilter) return false;
    if (!w.createdAt) return true;
    const recordDateStr = w.createdAt.toString().substring(0, 10);
    if (filterDate) return recordDateStr === filterDate;
    if (fromDate && toDate) return recordDateStr >= fromDate && recordDateStr <= toDate;
    return true;
  });

  const sortedWindows = [...filteredWindowsByCriteria].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div style={{ padding: "25px", fontFamily: "'Segoe UI', sans-serif", backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #3498db", marginBottom: "20px", paddingBottom: "10px" }}>
        <h2 style={{ color: "#2c3e50", margin: 0 }}>Window Logistics Management</h2>
        <button onClick={downloadPDF} style={{ padding: "10px 20px", backgroundColor: "#e67e22", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
          📥 GENERATE TRIP DC
        </button>
      </div>

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

          {/* ADDED TOWER DROPDOWN HERE */}
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
                         <label style={{ fontSize: "11px", color: "#7f8c8d" }}>
                           USER DATE
                         </label>
                         <input
                           type="date"
                           name="userDate"
                           value={dispatchDetails.userDate}
                           onChange={handleDispatchChange}
                           style={{
                             width: "100%",
                             padding: "8px",
                             borderRadius: "4px",
                             border: "1px solid #ddd"
                           }}
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

      <div style={{ marginTop: "40px" }}>
        <h3 style={{ color: "#2c3e50" }}>Data Results (Database View)</h3>
        <div style={{ display: "flex", gap: "15px", marginBottom: "20px", flexWrap: "wrap" }}>
          <div><label>From Date</label><input type="date" value={fromDate} onChange={(e) => {setFromDate(e.target.value); setFilterDate("");}} /></div>
          <div><label>To Date</label><input type="date" value={toDate} onChange={(e) => {setToDate(e.target.value); setFilterDate("");}} /></div>
          <div><label>Specific Date</label><input type="date" value={filterDate} onChange={(e) => {setFilterDate(e.target.value); setFromDate(""); setToDate("");}} /></div>
          <button onClick={() => {setFromDate(""); setToDate(""); setFilterDate("");}} style={{ height: "35px", alignSelf: "flex-end", background: "#e74c3c", color: "#fff", border: "none", padding: "5px 15px", cursor: "pointer", borderRadius: "4px" }}>Reset</button>
          <div><label>Trip ID</label><input type="text" value={tripIdFilter} onChange={(e) => setTripIdFilter(e.target.value)} placeholder="Enter Trip ID" style={{ padding: "5px 10px", borderRadius: "4px", border: "1px solid #ddd" }} /></div>
        </div>
        <div style={{ overflowX: "auto", background: "#fff", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
          <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
            <thead style={{ backgroundColor: "#2c3e50", color: "#ecf0f1" }}>
              <tr>
                <th>Sr.No</th><th>Trip ID</th><th>Win Series</th><th>Flat No</th><th>Location</th><th>W-Code</th><th>Dimensions (WxH)</th><th>Units</th><th>SqFt</th><th>Trip Status</th><th>Date</th><th>Edit</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="12" style={{ textAlign: "center", padding: "30px" }}>Fetching data...</td></tr>
              ) : sortedWindows.length > 0 ? (
                sortedWindows.map((w, index) => (
                  <tr key={w.windowId || index} onClick={() => setSelectedWindow(w)} style={{ borderBottom: "1px solid #eee", cursor: "pointer" }}>
                    <td>{index + 1}</td>
                    <td style={{ fontWeight: "bold", color: "#2980b9" }}>{w?.trip?.id ?? w?.tripId ?? "N/A"}</td>
                    <td style={{ fontWeight: "bold" }}>{w.windowSeriesNumber || "N/A"}</td>
                    <td style={{ color: "#e67e22", fontWeight: "bold" }}>{w?.flat?.flatNumber ?? w?.flatNumber ?? "N/A"}</td>
                    <td>{w.location || "N/A"}</td>
                    <td>{w.wcodeNo || w.wCodeNo || "N/A"}</td>
                    <td>{w.width || 0} x {w.height || 0}</td>
                    <td>{w.units || 0}</td>
                    <td>{w.sqft || 0}</td>
                    <td style={{ fontSize: "10px", color: "#7f8c8d" }}>{w.trip?.status || "ASSIGNED"}</td>
                    <td>{w.createdAt ? new Date(w.createdAt.replace(" ", "T")).toLocaleDateString() : "N/A"}</td>
                    <td>
                      <button onClick={(e) => { e.stopPropagation(); setEditingWindow(w); setEditModalVisible(true); }} style={{ padding: "5px 10px", background: "#3498db", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>Edit</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="12" style={{ textAlign: "center", padding: "30px" }}>No data found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
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
              </div>
              <div style={{ background: "#f1f4f9", padding: "20px", borderRadius: "8px" }}>
                <h4 style={{ color: "#2980b9", marginTop: 0 }}>Technical Specs</h4>
                <p><strong>Dimensions:</strong> {selectedWindow.width || 0}mm x {selectedWindow.height || 0}mm</p>
                <p><strong>Total Area:</strong> {selectedWindow.sqft || 0} SqFt</p>
              </div>
              <div style={{ background: "#f1f4f9", padding: "20px", borderRadius: "8px" }}>
                <h4 style={{ color: "#d35400", marginTop: 0 }}>Logistics & Site</h4>
                <p><strong>Flat No:</strong> {selectedWindow.flat?.flatNumber || "N/A"}</p>
                <p><strong>Trip ID:</strong> {selectedWindow.trip?.id || "N/A"}</p>
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
                  <input name={key} value={editingWindow[key] || ""} onChange={(e) => setEditingWindow(prev => ({ ...prev, [key]: e.target.value }))} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }} />
                </div>
              ))}
            </div>
            <button onClick={async () => {
              try {
                const payload = { ...editingWindow, width: parseFloat(editingWindow.width) || 0, height: parseFloat(editingWindow.height) || 0, units: parseInt(editingWindow.units) || 0, sqft: parseFloat(editingWindow.sqft) || 0 };
                await axios.put(`${API_URL}/windows/${editingWindow.windowId}`, payload);
                alert("Window updated successfully!");
                setEditModalVisible(false);
                getAllWindows();
              } catch (error) { alert(`Update failed: ${error.message}`); }
            }} style={{ marginTop: "20px", padding: "12px 30px", backgroundColor: "#27ae60", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>Update Window</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WindowManager;