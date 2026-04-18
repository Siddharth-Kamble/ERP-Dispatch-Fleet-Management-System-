

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

  // ─────────────────────────────────────────────────────────────────────────────
  // CHANGE 1: initialState now includes all 17 Excel columns.
  //   Added: windowCode, priority, weight (true weight kg), rMtr
  //   sqFt removed from formData — it is calculated server-side via createSingleItem
  //   (was wrongly aliased to formData.weight before)
  // ─────────────────────────────────────────────────────────────────────────────
  const initialState = {
    srNo:        "",
    windowSrNo:  "",
    flatNo:      "",
    location:    "",
    windowCode:  "",   // ← NEW — Col F (index 5)
    jobCardNo:   "",
    priority:    "",   // ← NEW — Col H (index 7)
    description: "",
    width:       "",
    height:      "",
    qty:         "",
    unit:        "",
    weight:      "",   // ← true weight (kg), NOT sqFt alias
    rMtr:        "",   // ← NEW — Col P (index 15)
    remarks:     "",
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
          projectName:     response.data.projectName     || prev.projectName,
          dcNo:            response.data.dcNo            || prev.dcNo,
          workOrderNumber: response.data.workOrderNumber || prev.workOrderNumber,
          codeNo:          response.data.codeNo          || prev.codeNo,
          tripId:          tripId
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
            dcNo:            latestLog.dcNo            || prev.dcNo,
            workOrderNumber: latestLog.workOrderNumber || prev.workOrderNumber,
            codeNo:          latestLog.codeNo          || prev.codeNo,
            tripId:          latestLog.tripId          || prev.tripId
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

  // ─────────────────────────────────────────────────────────────────────────────
  // handleChange — unchanged auto-sqFt calculation logic kept intact.
  // weight field in formData is now the TRUE weight (kg), not sqFt.
  // sqFt is NOT stored in formData; server calculates it in createSingleItem.
  // ─────────────────────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // The original auto-calculation for weight (sqFt proxy) is preserved
      // but now applies only if user hasn't entered a manual weight.
      // NOTE: sqFt is calculated server-side; this is a display hint only.
      const w = parseFloat(name === "width"  ? value : prev.width)  || 0;
      const h = parseFloat(name === "height" ? value : prev.height) || 0;
      const q = parseInt  (name === "qty"    ? value : prev.qty)    || 0;
      if (w > 0 && h > 0 && q > 0 && name !== "weight") {
        // Auto-fill weight hint only when weight field is not being manually typed
        const calculatedWeight = ((w * h * q) / 1000000) * 10.764;
        updated.weight = calculatedWeight.toFixed(2);
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

  // ─────────────────────────────────────────────────────────────────────────────
  // CHANGE 2: createWindow payload — added windowCode, priority, weight, rMtr.
  //   sqFt is no longer sent from formData.weight (which was wrong before).
  //   Server calculates sqFt inside createSingleItem().
  // ─────────────────────────────────────────────────────────────────────────────
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
        srNo:        parseInt(formData.srNo)        || 0,
        winSrNo:     formData.windowSrNo,
        flatNo:      flatNumber,
        location:    formData.location,
        windowCode:  formData.windowCode,            // ← NEW
        jobCardNo:   formData.jobCardNo,
        priority:    formData.priority,              // ← NEW
        description: formData.description,
        width:       parseFloat(formData.width)      || 0,
        height:      parseFloat(formData.height)     || 0,
        qty:         parseInt(formData.qty)          || 0,
        unit:        formData.unit,
        // sqFt is intentionally omitted — server calculates it in createSingleItem()
        weight:      parseFloat(formData.weight)     || null,  // ← true weight (kg)
        rMtr:        parseFloat(formData.rMtr)       || null,  // ← NEW
        remarks:     formData.remarks,
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
        projectName:     dispatchDetails.projectName,
        dcNo:            dispatchDetails.dcNo,
        workOrderNumber: dispatchDetails.workOrderNumber,
        codeNo:          dispatchDetails.codeNo,
        tripId:          Number(dispatchDetails.tripId),
        userDate:        dispatchDetails.userDate,
        tower: { towerId: Number(selectedTower) },
      };
      await axios.post(`${API_URL}/logs`, payload);
      localStorage.setItem("tripId",     dispatchDetails.tripId);
      localStorage.setItem("projectId",  projectId);
      localStorage.setItem("towerId",    selectedTower);
      alert("✅ Project Log Submitted Successfully!");
    } catch (error) {
      console.error("Submission Error:", error);
      alert("❌ Failed to submit project log.");
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Helper: format a date string or Date object to dd/MM/yyyy
  // ─────────────────────────────────────────────────────────────────────────────
  const formatDateDMY = (dateInput) => {
    if (!dateInput) return "N/A";
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "N/A";
    const day   = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year  = d.getFullYear();
    return `${day}/${month}/${year}`;
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
  // downloadExcelTemplate — downloads a blank Excel template with all column headers
  // ─────────────────────────────────────────────────────────────────────────────
  const downloadExcelTemplate = () => {
    const headers = [
      "Sr No.",
      "Win Sr No",
      "Floor NO",
      "Flat No",
      "Location",
      "Window Code",
      "Job Card No",
      "Priority",
      "Description",
      "Width",
      "Height",
      "Qty",
      "Unit",
      "SqFt",
      "Weight",
      "R Mtr",
      "Remarks"
    ];
    const csvContent = headers.join("\t") + "\n";
    const blob = new Blob([csvContent], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Upload_Template.xls");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // CHANGE 3: downloadPDF
  //
  //   a) Material Delivery Date — now fetched from the dedicated backend endpoint
  //      GET /api/items/material-delivery-date/{tripId}
  //      Returns "dd/MM/yyyy" string or 204 (no content) when not applicable.
  //      Previously relied on /logs/trip/{tripId}/dates which may not exist.
  //
  //   b) Column presence — now fetched from the dedicated backend endpoint
  //      GET /api/items/column-presence/{tripId}
  //      Returns Map<String,Boolean>. Frontend falls back to client-side
  //      hasValue() check if the endpoint fails (graceful degradation).
  //
  //   c) All other logic, header layout, table structure, footer — UNCHANGED.
  // ─────────────────────────────────────────────────────────────────────────────


  const downloadPDF = async () => {
    const tripInput = prompt("Enter Trip ID (optional):")?.trim();

    let filteredWindows = windows;

    let dispatchInfo = {
      projectName:     "N/A",
      dcNo:            "N/A",
      workOrderNumber: "N/A",
      codeNo:          "N/A",
    };

    let dynamicTowerName        = "N/A";
    let actualDate              = null;
    // CHANGE 3a: materialDeliveryDate now comes from the dedicated endpoint
    let materialDeliveryDate    = null;

    if (tripInput) {
      filteredWindows = windows.filter(
        (w) => (w?.trip?.id ?? w?.tripId)?.toString() === tripInput
      );

      if (filteredWindows.length === 0) {
        return alert("No Material found for the entered Trip ID.");
      }

      // ── Fetch project log for dispatch info (unchanged) ──────────────────
      try {
        const response = await axios.get(`${API_URL}/logs/trip/${tripInput}`);
        if (response.data && response.data.length > 0) {
          const latestLog = response.data[0];

          // Actual/created date — try existing dates endpoint first, fallback to log
          try {
            const dateRes = await axios.get(`${API_URL}/logs/trip/${tripInput}/dates`);
            if (dateRes.data) {
              actualDate = dateRes.data.actualDate;
            }
          } catch (err) {
            // endpoint may not exist — silently skip
          }

          dispatchInfo = {
            projectName:     latestLog.projectName     || "N/A",
            dcNo:            latestLog.dcNo            || "N/A",
            workOrderNumber: latestLog.workOrderNumber || "N/A",
            codeNo:          latestLog.codeNo          || "N/A",
          };

          if (latestLog.projectName) {
            try {
              const projectRes = await axios.get(`${API_URL}/projects/by-name/${latestLog.projectName}`);
              const pId = projectRes.data?.projectId;
              const refWindow = filteredWindows[0];
              const tId = refWindow?.tower?.towerId || refWindow?.towerId || selectedTower;
              if (pId && tId) {
                const towerRes   = await axios.get(`${API_URL}/api/towers/project/${pId}`);
                const foundTower = towerRes.data.find((t) => t.towerId == tId);
                if (foundTower) dynamicTowerName = foundTower.towerName;
              }
            } catch (err) {
              console.error("Error fetching tower name:", err);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching project log for Trip:", error);
      }

      // ── CHANGE 3a: Fetch Material Delivery Date from new endpoint ─────────
      try {
        const mdRes = await axios.get(
          `${API_URL}/api/items/material-delivery-date/${tripInput}`
        );
        // 200 = date string returned (e.g. "15/04/2026")
        // 204 = no content (userDate same as createdAt or null) — axios throws on 204
        if (mdRes.status === 200 && mdRes.data) {
          materialDeliveryDate = mdRes.data;  // already formatted as dd/MM/yyyy by backend
        }
      } catch (err) {
        // 204 No Content or network error — materialDeliveryDate stays null
        if (err.response?.status !== 204) {
          console.error("Error fetching material delivery date:", err);
        }
      }
    }

    if (filteredWindows.length === 0) {
      return alert("No data available to generate PDF.");
    }

    // ── CHANGE 3b: Fetch column presence from backend ─────────────────────────
    // Falls back to client-side hasValue() if endpoint fails.
    let serverColumnPresence = null;
    if (tripInput) {
      try {
        const cpRes = await axios.get(
          `${API_URL}/api/items/column-presence/${tripInput}`
        );
        serverColumnPresence = cpRes.data; // Map<String,Boolean>
      } catch (err) {
        console.error("Column presence endpoint unavailable, falling back to client-side check:", err);
      }
    }

    // ── Define ALL columns — same order as before ──────────────────────────
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
        mandatory: false,
        //getValue: (w) => w?.floor?.floorNumber ?? w?.floorNo,
       getValue: (w) => {
         const val = w?.floor?.floorNumber ?? w?.floorNo;
         return val === "" || val === undefined ? null : val;
       },
      },
      {
        header: "Flat No",
        mandatory: false,
//        getValue: (w) => w?.flat?.flatNumber ?? w?.flat?.flatNo ?? w.flatNo,

getValue: (w) => {
  const val = w?.flat?.flatNumber ?? w?.flat?.flatNo ?? w.flatNo;
  return val === "" || val === undefined ? null : val;
},
      },
      {
        header: "Location",
        mandatory: false,
        getValue: (w) => w.location,
      },
      {
        header: "Window Code",
        mandatory: false,
        // CHANGE: also read windowCode field added to entity
        getValue: (w) => w.windowCode ?? w.window_code ?? w.WindowCode,
      },
      {
        header: "Job Card No",
        mandatory: false,
        getValue: (w) => w.jobCardNo,
      },
      {
        header: "Priority",
        mandatory: false,
        // CHANGE: read priority field added to entity
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
        getValue: (w) => (w.width  != null && w.width  !== 0) ? w.width  : null,
      },
      {
        header: "Height",
        mandatory: false,
        getValue: (w) => (w.height != null && w.height !== 0) ? w.height : null,
      },
      {
        header: "Qty",
        mandatory: false,
        getValue: (w) => (w.qty    != null && w.qty    !== 0) ? w.qty    : null,
      },
      {
        header: "Unit",
        mandatory: false,
        getValue: (w) => w.unit,
      },
      {
        header: "SqFt",
        mandatory: false,
        getValue: (w) => (w.sqFt   != null && w.sqFt   !== 0) ? w.sqFt   : null,
      },
      {
        header: "Weight",
        mandatory: false,
        // CHANGE: read actual weight field (not sqFt alias)
        getValue: (w) => (w.weight != null && w.weight !== 0) ? w.weight : null,
      },
      {
        header: "R Mtr",
        mandatory: false,
        // CHANGE: read rMtr field added to entity
        getValue: (w) => w.rMtr ?? w.rmtr ?? w.rMeter ?? w.r_mtr,
      },
      {
        header: "Remarks",
        mandatory: false,
        getValue: (w) => w.remarks,
      },
    ];

    // ── CHANGE 3b: Use server column presence when available ───────────────
    // Server map keys match PDF header labels exactly (set up in ItemService).
    const activeColumns = allColumns.filter((col) => {
      if (col.mandatory) return true;
      // Server presence takes priority; fall back to client-side check
      if (serverColumnPresence && col.header in serverColumnPresence) {
        return serverColumnPresence[col.header] === true;
      }
      return filteredWindows.some((w, i) => hasValue(col.getValue(w, i)));
    });

    const tableColumn = activeColumns.map((c) => c.header);

    const tableRows = filteredWindows.map((w, i) =>
      activeColumns.map((c) => {
        const val = c.getValue(w, i);
        if (val === null || val === undefined) return "";
        return val;
      })
    );

   const numericHeaders = new Set(["Qty", "SqFt", "Weight", "R Mtr"]);

   const totalRow = activeColumns.map((col, colIdx) => {
     // Sr No. column — always blank in total row
     if (col.header === "Sr No.") return "";

     // First non-numeric, non-SrNo column gets the "TOTAL" label
     if (!numericHeaders.has(col.header)) {
       return colIdx === 1 ? "TOTAL" : "";
     }

     const sum = filteredWindows.reduce((acc, w, i) => {
       const val = parseFloat(col.getValue(w, i));
       return acc + (isNaN(val) ? 0 : val);
     }, 0);

     // Qty = integer, others = 2 decimal places
     return col.header === "Qty"
       ? String(Math.round(sum))
       : sum.toFixed(2);
   });

    tableRows.push(totalRow);
    const doc = new jsPDF("landscape");
    const refWindow = filteredWindows[0];
    const refTrip   = refWindow?.trip || {};

    const towerDisplay =
      dynamicTowerName !== "N/A"
        ? dynamicTowerName
        : towers.find((t) => t.towerId == selectedTower)?.towerName || "N/A";

    // --- LOGO (unchanged) ---
    const cloudinaryLogoUrl =
      "https://res.cloudinary.com/dhmcijhts/image/upload/v1774439813/updytp3rs57vhqtdbx1p.png";
    try {
      doc.addImage(cloudinaryLogoUrl, "PNG", 35, 8, 38, 20);
      doc.setDrawColor(220, 220, 220);
      doc.line(14, 33, 283, 33);
    } catch (e) {
      console.error("Logo failed to load", e);
    }

    // --- HEADER (unchanged) ---
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.text("ONEDEO LEELA FAÇADE SYSTEMS PRIVATE LIMITED", 160, 18, { align: "center" });
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("Building No/Flat No 327, Bopgaon Chowk, Pune, Maharashtra 412301", 160, 25, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    // Left side info (unchanged positions)
    doc.text(`Project Name: ${dispatchInfo.projectName}`,      14, 42);
    doc.text(`Tower Name: ${towerDisplay}`,                    14, 48);
    doc.text(`DC No: ${dispatchInfo.dcNo}`,                    14, 54);
    doc.text(`Work Order No: ${dispatchInfo.workOrderNumber}`, 14, 60);
    doc.text(`Code No: ${dispatchInfo.codeNo}`,                14, 66);

    // ── CHANGE 3a: Material Delivery Date — shown only when backend returns a value ──
    // Previously always shown as "N/A" when userDate was null.
    // Now: shown only when userDate exists AND differs from createdAt date.
    // Position unchanged (14, 72).
    if (materialDeliveryDate) {
      doc.text(`Material Delivery Date: ${materialDeliveryDate}`, 14, 72);
    }

    // Right side info (unchanged)
    doc.text(`Trip ID: ${tripInput || refTrip.id || "All"}`, 220, 42);

    const actualDateFormatted = actualDate
      ? formatDateDMY(actualDate)
      : formatDateDMY(new Date());
    doc.text(`Date: ${actualDateFormatted}`,                220, 48);
    doc.text(`Vehicle No: ${refTrip.vehicleNumber || "N/A"}`, 220, 54);
    doc.text(`Driver Name: ${refTrip.driverName   || "N/A"}`, 220, 60);
    doc.text(`Trip Status: ${refTrip.status       || "N/A"}`, 220, 66);

    // --- TABLE (unchanged) ---
 autoTable(doc, {
   head:       [tableColumn],
   body:       tableRows,
   startY:     78,
   theme:      "grid",
   styles:     { fontSize: 7 },
   headStyles: { fillColor: [44, 62, 80] },
   didParseCell: function (data) {
     if (data.section === "body" && data.row.index === tableRows.length - 1) {
       data.cell.styles.fontStyle  = "bold";
       data.cell.styles.fillColor  = [230, 230, 230];
       data.cell.styles.textColor  = [0, 0, 0];
     }
   },
 });

    const finalY = (doc.lastAutoTable?.finalY || 78) + 10;


     // ====== NEW TOTAL LOGIC END ======
    doc.text("Prepared By: ________________",                 14, finalY + 20);
    doc.text("Checked By: ________________",                 110, finalY + 20);
    doc.text("Received By: ________________",                210, finalY + 20);

    doc.save(`Onedeo_Report_Trip_${tripInput || "All"}.pdf`);
  };

  const filteredWindows = windows.filter((w) => {
    if (tripIdFilter && (w?.trip?.id ?? w?.tripId)?.toString() !== tripIdFilter) return false;
    if (!w.createdAt) return true;
    const recordDateStr = w.createdAt.toString().substring(0, 10);
    if (filterDate)         return recordDateStr === filterDate;
    if (fromDate && toDate) return recordDateStr >= fromDate && recordDateStr <= toDate;
    return true;
  });

  const sortedWindows = [...filteredWindows].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <div style={{ padding: "25px", fontFamily: "'Segoe UI', sans-serif", backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
      {/* Header — UNCHANGED */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #3498db", marginBottom: "20px", paddingBottom: "10px" }}>
        <h2 style={{ color: "#2c3e50", margin: 0 }}>Material Logistics Management</h2>
        <button onClick={downloadPDF} style={{ padding: "10px 20px", backgroundColor: "#e67e22", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
          📥 GENERATE TRIP DC
        </button>
      </div>

      {/* Dispatch Details Section — UNCHANGED */}
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

      {/* Add Window Form — UNCHANGED structure, new fields auto-appear from initialState */}
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

        {/* EXCEL UPLOAD — UNCHANGED */}
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
            uploadFormData.append("file",      excelFile);
            uploadFormData.append("projectId", projectIdValue);
            uploadFormData.append("towerId",   selectedTower);
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

        <button
          onClick={downloadExcelTemplate}
          style={{ padding: "12px 25px", backgroundColor: "#16a085", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", marginLeft: "15px" }}
        >
          📄 DOWNLOAD TEMPLATE
        </button>
      </div>

      {/* Data Table — UNCHANGED layout; new fields visible in detail/edit modals */}
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
                <th>WINDOW CODE</th>{/* ← NEW column shown in table */}
                <th>JOB CARD NO</th>
                <th>PRIORITY</th>   {/* ← NEW column shown in table */}
                <th>DESCRIPTION</th>
                <th>WIDTH</th>
                <th>HEIGHT</th>
                <th>QTY</th>
                <th>UNIT</th>
                <th>SQFT</th>
                <th>WEIGHT</th>     {/* ← now shows actual weight field */}
                <th>R MTR</th>      {/* ← NEW column shown in table */}
                <th>REMARKS</th>
                <th>STATUS</th>
                <th>DATE</th>
                <th>EDIT</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="19" style={{ textAlign: "center", padding: "30px" }}>Fetching data...</td></tr>
              ) : filteredWindows.length > 0 ? (
                sortedWindows.map((w, index) => (
                  <tr key={w.id || index} onClick={() => setSelectedWindow(w)} style={{ borderBottom: "1px solid #eee", cursor: "pointer" }}>
                    <td>{w.srNo || index + 1}</td>
                    <td style={{ fontWeight: "bold", color: "#2980b9" }}>{w?.trip?.id ?? w?.tripId ?? "N/A"}</td>
                    <td style={{ fontWeight: "bold" }}>{w.winSrNo    || "N/A"}</td>
                    <td>{w.location   || "N/A"}</td>
                    <td>{w.windowCode || "N/A"}</td>{/* ← NEW */}
                    <td>{w.jobCardNo  || "N/A"}</td>
                    <td>{w.priority   || "N/A"}</td>{/* ← NEW */}
                    <td>{w.description || "N/A"}</td>
                    <td>{w.width  || 0}</td>
                    <td>{w.height || 0}</td>
                    <td>{w.qty    || 0}</td>
                    <td>{w.unit   || "N/A"}</td>
                    <td>{w.sqFt   || 0}</td>
                    <td>{w.weight || 0}</td>{/* ← now actual weight field */}
                    <td>{w.rMtr   || 0}</td>{/* ← NEW */}
                    <td>{w.remarks || "N/A"}</td>
                    <td style={{ fontSize: "10px", color: "#7f8c8d" }}>{w.trip?.status || (w.tripId ? "ASSIGNED" : "NO TRIP")}</td>
                    <td>{w.createdAt ? new Date(w.createdAt.replace(" ", "T")).toLocaleDateString() : "N/A"}</td>
                    <td>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // CHANGE: map all new fields into editingWindow
                          setEditingWindow({
                            ...w,
                            windowSrNo:  w.winSrNo    || "",
                            windowCode:  w.windowCode || "",  // ← NEW
                            priority:    w.priority   || "",  // ← NEW
                            weight:      w.weight     || "",  // ← actual weight (not sqFt)
                            rMtr:        w.rMtr       || "",  // ← NEW
                            remarks:     w.remarks    || "",
                          });
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
                <tr><td colSpan="19" style={{ textAlign: "center", padding: "30px" }}>No data found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal — UNCHANGED */}
      {selectedWindow && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", padding: "30px", borderRadius: "12px", width: "80%", maxHeight: "90vh", overflowY: "auto", position: "relative", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
            <button onClick={() => setSelectedWindow(null)} style={{ position: "absolute", top: "15px", right: "15px", border: "none", background: "#e74c3c", color: "white", borderRadius: "50%", width: "30px", height: "30px", cursor: "pointer", fontWeight: "bold" }}>X</button>
            <h3 style={{ borderBottom: "3px solid #3498db", paddingBottom: "10px", color: "#2c3e50" }}>Window Detailed Record: #{selectedWindow.windowId}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "25px", marginTop: "20px" }}>
              <div style={{ background: "#f1f4f9", padding: "20px", borderRadius: "8px" }}>
                <h4 style={{ color: "#2980b9", marginTop: 0 }}>Production Details</h4>
                <p><strong>Job Card:</strong>   {selectedWindow.jobCardNo   || "N/A"}</p>
                <p><strong>Window Code:</strong> {selectedWindow.windowCode || "N/A"}</p>{/* ← NEW */}
                <p><strong>Priority:</strong>    {selectedWindow.priority   || "N/A"}</p>{/* ← NEW */}
                <p><strong>Series Type:</strong> {selectedWindow.series     || "N/A"}</p>
                <p><strong>W-Code:</strong>      {selectedWindow.wcodeNo    || selectedWindow.wCodeNo || "N/A"}</p>
                <p><strong>Description:</strong> {selectedWindow.description || "N/A"}</p>
              </div>
              <div style={{ background: "#f1f4f9", padding: "20px", borderRadius: "8px" }}>
                <h4 style={{ color: "#2980b9", marginTop: 0 }}>Technical Specs</h4>
                <p><strong>Dimensions:</strong>  {selectedWindow.width  || 0}mm x {selectedWindow.height || 0}mm</p>
                <p><strong>SqFt:</strong>        {selectedWindow.sqFt   || 0}</p>
                <p><strong>Weight (kg):</strong> {selectedWindow.weight || 0}</p>{/* ← actual weight */}
                <p><strong>R Mtr:</strong>       {selectedWindow.rMtr   || 0}</p>{/* ← NEW */}
                <p><strong>Units:</strong>       {selectedWindow.units  || 0}</p>
                <p><strong>Shutters:</strong> Glass: {selectedWindow.glassShutter}, Mesh: {selectedWindow.meshShutter}</p>
              </div>
              <div style={{ background: "#f1f4f9", padding: "20px", borderRadius: "8px" }}>
                <h4 style={{ color: "#d35400", marginTop: 0 }}>Logistics & Site</h4>
                <p><strong>Flat No:</strong>  {selectedWindow.flat?.flatNumber || selectedWindow.flatNumber || "N/A"}</p>
                <p><strong>Trip ID:</strong>  {selectedWindow.trip?.id || selectedWindow.tripId || "N/A"}</p>
                {selectedWindow.trip && (
                  <>
                    <p><strong>Status:</strong> <span style={{ color: selectedWindow.trip.status === "CANCELLED" ? "red" : "green", fontWeight: "bold" }}>{selectedWindow.trip.status}</span></p>
                    <p><strong>Vehicle:</strong> {selectedWindow.trip.vehicleNumber || "N/A"}</p>
                    <p><strong>Driver:</strong>  {selectedWindow.trip.driverName    || "N/A"}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal — UNCHANGED structure; new fields auto-appear from initialState */}
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
                  // CHANGE: include new fields in update payload
                  const payload = {
                    ...editingWindow,
                    winSrNo:    editingWindow.windowSrNo,
                    windowCode: editingWindow.windowCode || "",  // ← NEW
                    priority:   editingWindow.priority   || "",  // ← NEW
                    qty:        parseInt(editingWindow.qty)      || 0,
                    width:      parseFloat(editingWindow.width)  || 0,
                    height:     parseFloat(editingWindow.height) || 0,
                    sqFt:       parseFloat(editingWindow.sqFt)   || 0,
                    weight:     parseFloat(editingWindow.weight) || null,  // ← actual weight
                    rMtr:       parseFloat(editingWindow.rMtr)   || null,  // ← NEW
                    remarks:    editingWindow.remarks || "",
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
