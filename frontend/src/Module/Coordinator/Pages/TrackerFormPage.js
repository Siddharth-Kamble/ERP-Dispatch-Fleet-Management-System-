//////import React, { useState, useEffect } from "react";
//////import { useNavigate } from "react-router-dom";
//////import {
//////    FaLayerGroup, FaSearch, FaBuilding, FaClipboardList,
//////    FaSpinner, FaFileExcel, FaDownload, FaSave,
//////    FaCheckCircle, FaExclamationTriangle, FaRegArrowAltCircleLeft
//////} from "react-icons/fa";
//////import * as XLSX from "xlsx-js-style";
//////
//////// ── Sub-columns for SUPPLY, INSTALLATION, HARDWARE ───────────────────────────
//////const SUB_COLS = [
//////    "FRAME",
//////    "DOOR FRAME",
//////    "SHUTTER",
//////    "OPENABLE DOOR",
//////    "FIX GLASS",
//////    "TOP / BOTTOM FIX",
//////];
//////
//////const SECTIONS = ["SUPPLY", "INSTALLATION", "HARDWARE"];
//////
//////// ── Empty tracker row ─────────────────────────────────────────────────────────
//////const emptyTrackerRow = (srNo = "", flat = "", woItem = null) => {
//////    const base = {
//////        _id:      Date.now() + Math.random(),
//////        srNo,
//////        flat,
//////        location:  woItem?.location   || "",
//////        wcode:     woItem?.windowCode  || "",
//////        typology:  woItem?.typology    || "",
//////        series:    woItem?.series      || "",
//////        woLnt:     woItem?.length      || "",
//////        woHgt:     woItem?.height      || "",
//////        sqft:      woItem?.sqft        || "",
//////        length:    "",
//////        height:    "",
//////        jobCard:   "",
//////    };
//////    // Add supply/installation/hardware sub-cols
//////    SECTIONS.forEach(sec => {
//////        SUB_COLS.forEach(sub => {
//////            base[`${sec}__${sub}`] = "";
//////        });
//////    });
//////    return base;
//////};
//////
//////// ── Excel export — exact PDF structure ───────────────────────────────────────
//////function exportExcel(rows, projectName, workOrderNo, towerName) {
//////    const wb = XLSX.utils.book_new();
//////    const ws = XLSX.utils.json_to_sheet([]);
//////
//////    // Helper
//////    const setS = (ref, s) => {
//////        if (!ws[ref]) ws[ref] = { t: "z", v: "" };
//////        ws[ref].s = s;
//////    };
//////    const setV = (ref, v, s) => {
//////        ws[ref] = { v, t: typeof v === "number" ? "n" : "s", s };
//////    };
//////
//////    const allCols = [
//////        "SR NO.", "FLAT", "LOCATION", "WCODE", "TYPOLOGY", "SERIES",
//////        "WO LNT", "WO HGT", "SQ FT.", "LENGTH", "HEIGHT", "JOB CARD",
//////        // SUPPLY x6
//////        ...SUB_COLS.map(s => `SUPPLY_${s}`),
//////        // INSTALLATION x6
//////        ...SUB_COLS.map(s => `INSTALL_${s}`),
//////        // HARDWARE x6
//////        ...SUB_COLS.map(s => `HW_${s}`),
//////        "HANDOVER STATUS", "DC.NO",
//////    ];
//////    const totalCols = allCols.length; // 12 + 18 + 2 = 32
//////
//////    const colLetters = [];
//////    for (let i = 0; i < totalCols; i++) {
//////        if (i < 26) colLetters.push(String.fromCharCode(65 + i));
//////        else colLetters.push(String.fromCharCode(64 + Math.floor(i / 26)) + String.fromCharCode(65 + (i % 26)));
//////    }
//////
//////    // ── Row 1: Project name ───────────────────────────────────────────────────
//////    XLSX.utils.sheet_add_aoa(ws, [[`PROJECT : ${projectName || "—"}  |  WO: ${workOrderNo || "—"}  |  Tower: ${towerName || "—"}`]], { origin: "A1" });
//////
//////    // ── Row 2: Main headers ───────────────────────────────────────────────────
//////    // Cols A-L individual, then SUPPLY (M-R), INSTALLATION (S-X), HARDWARE (Y-AD), then AE-AF
//////    const row2 = [];
//////    for (let i = 0; i < 12; i++) row2.push("");
//////    row2.push("SUPPLY"); for (let i = 1; i < 6; i++) row2.push("");
//////    row2.push("INSTALLATION"); for (let i = 1; i < 6; i++) row2.push("");
//////    row2.push("HARDWARE"); for (let i = 1; i < 6; i++) row2.push("");
//////    row2.push("HANDOVER", "DC.NO");
//////    XLSX.utils.sheet_add_aoa(ws, [row2], { origin: "A2" });
//////
//////    // ── Row 3: Sub-headers ────────────────────────────────────────────────────
//////    const row3 = [
//////        "SR NO.", "FLAT", "LOCATION", "WCODE", "TYPOLOGY", "SERIES",
//////        "WO LNT", "WO HGT", "SQ FT.", "LENGTH", "HEIGHT", "JOB CARD",
//////        ...SUB_COLS, ...SUB_COLS, ...SUB_COLS,
//////        "STATUS", "DC.NO",
//////    ];
//////    XLSX.utils.sheet_add_aoa(ws, [row3], { origin: "A3" });
//////
//////    // ── Rows 4+: Data ─────────────────────────────────────────────────────────
//////    const dataRows = rows.map(r => [
//////        r.srNo || "", r.flat || "", r.location || "", r.wcode || "",
//////        r.typology || "", r.series || "",
//////        r.woLnt !== "" ? Number(r.woLnt) : "",
//////        r.woHgt !== "" ? Number(r.woHgt) : "",
//////        r.sqft  !== "" ? parseFloat(parseFloat(r.sqft).toFixed(2)) : "",
//////        r.length !== "" ? Number(r.length) : "",
//////        r.height !== "" ? Number(r.height) : "",
//////        r.jobCard || "",
//////        ...SUB_COLS.map(sub => r[`SUPPLY__${sub}`] !== "" ? parseFloat(r[`SUPPLY__${sub}`] || 0) : ""),
//////        ...SUB_COLS.map(sub => r[`INSTALLATION__${sub}`] !== "" ? parseFloat(r[`INSTALLATION__${sub}`] || 0) : ""),
//////        ...SUB_COLS.map(sub => r[`HARDWARE__${sub}`] !== "" ? parseFloat(r[`HARDWARE__${sub}`] || 0) : ""),
//////        r.handoverStatus || "", r.dcNo || "",
//////    ]);
//////    XLSX.utils.sheet_add_aoa(ws, dataRows, { origin: "A4" });
//////
//////    // ── Totals row ────────────────────────────────────────────────────────────
//////    const totalRow = new Array(totalCols).fill("");
//////    totalRow[0] = "TOTAL";
//////    // Sum numeric cols from col 6 onwards (WO LNT=6, WO HGT=7, SQFT=8 ... supply/install/hw)
//////    [6, 7, 8, 9, 10].forEach(ci => {
//////        totalRow[ci] = rows.reduce((s, r) => {
//////            const vals = [r.woLnt, r.woHgt, r.sqft, r.length, r.height];
//////            return s + (parseFloat(vals[ci - 6]) || 0);
//////        }, 0);
//////    });
//////    let colIdx = 12;
//////    SECTIONS.forEach(sec => {
//////        SUB_COLS.forEach(sub => {
//////            totalRow[colIdx] = rows.reduce((s, r) => s + (parseFloat(r[`${sec}__${sub}`]) || 0), 0);
//////            colIdx++;
//////        });
//////    });
//////    XLSX.utils.sheet_add_aoa(ws, [totalRow], { origin: `A${4 + rows.length}` });
//////
//////    // ── Merges ────────────────────────────────────────────────────────────────
//////    const r = (row) => row - 1; // to 0-based
//////    ws["!merges"] = [
//////        // Row 1: full merge
//////        { s: { r: r(1), c: 0 }, e: { r: r(1), c: totalCols - 1 } },
//////        // Row 2: first 12 cols span 2 rows each (merge r2 and r3 for A-L)
//////        ...Array.from({ length: 12 }, (_, i) => ({ s: { r: r(2), c: i }, e: { r: r(3), c: i } })),
//////        // Row 2: SUPPLY spans 6 cols (M-R = cols 12-17)
//////        { s: { r: r(2), c: 12 }, e: { r: r(2), c: 17 } },
//////        // Row 2: INSTALLATION spans 6 cols (S-X = cols 18-23)
//////        { s: { r: r(2), c: 18 }, e: { r: r(2), c: 23 } },
//////        // Row 2: HARDWARE spans 6 cols (Y-AD = cols 24-29)
//////        { s: { r: r(2), c: 24 }, e: { r: r(2), c: 29 } },
//////        // Row 2: HANDOVER and DC.NO span 2 rows
//////        { s: { r: r(2), c: 30 }, e: { r: r(3), c: 30 } },
//////        { s: { r: r(2), c: 31 }, e: { r: r(3), c: 31 } },
//////    ];
//////
//////    // ── Column widths ─────────────────────────────────────────────────────────
//////    ws["!cols"] = [
//////        { wch: 7  }, // SR NO
//////        { wch: 8  }, // FLAT
//////        { wch: 20 }, // LOCATION
//////        { wch: 10 }, // WCODE
//////        { wch: 30 }, // TYPOLOGY
//////        { wch: 8  }, // SERIES
//////        { wch: 8  }, // WO LNT
//////        { wch: 8  }, // WO HGT
//////        { wch: 8  }, // SQ FT
//////        { wch: 8  }, // LENGTH
//////        { wch: 8  }, // HEIGHT
//////        { wch: 12 }, // JOB CARD
//////        // 18 sub-cols
//////        ...Array(18).fill({ wch: 14 }),
//////        { wch: 14 }, // HANDOVER
//////        { wch: 10 }, // DC.NO
//////    ];
//////    ws["!rows"] = [{ hpt: 22 }, { hpt: 20 }, { hpt: 30 }];
//////
//////    // ── Styles ────────────────────────────────────────────────────────────────
//////    const b  = (rgb, style = "thin") => ({ style, color: { rgb } });
//////    const ba = (rgb) => ({ top: b(rgb), bottom: b(rgb), left: b(rgb), right: b(rgb) });
//////
//////    const titleStyle = {
//////        font:      { bold: true, sz: 13, name: "Calibri", color: { rgb: "1A2940" } },
//////        alignment: { horizontal: "center", vertical: "center" },
//////        fill:      { patternType: "solid", fgColor: { rgb: "EEF2F7" } },
//////        border:    { bottom: b("A0B0C8", "medium") },
//////    };
//////    setS("A1", titleStyle);
//////
//////    // Section header styles
//////    const secColors = { SUPPLY: "D6EAF8", INSTALLATION: "D5F5E3", HARDWARE: "FDEBD0" };
//////    const secTextColors = { SUPPLY: "1A5276", INSTALLATION: "1E8449", HARDWARE: "784212" };
//////
//////    // Row 2 styles
//////    colLetters.forEach((col, ci) => {
//////        const ref  = `${col}2`;
//////        let fillRgb = "D6E4F0";
//////        let textRgb = "1A2940";
//////        if (ci >= 12 && ci <= 17) { fillRgb = secColors.SUPPLY;       textRgb = secTextColors.SUPPLY; }
//////        if (ci >= 18 && ci <= 23) { fillRgb = secColors.INSTALLATION;  textRgb = secTextColors.INSTALLATION; }
//////        if (ci >= 24 && ci <= 29) { fillRgb = secColors.HARDWARE;      textRgb = secTextColors.HARDWARE; }
//////        setS(ref, {
//////            font:      { bold: true, sz: 9, name: "Calibri", color: { rgb: textRgb } },
//////            alignment: { horizontal: "center", vertical: "center", wrapText: true },
//////            fill:      { patternType: "solid", fgColor: { rgb: fillRgb } },
//////            border:    ba("A8C4DC"),
//////        });
//////    });
//////
//////    // Row 3 sub-header styles
//////    colLetters.forEach((col, ci) => {
//////        let fillRgb = "BDD7EE";
//////        if (ci >= 12 && ci <= 17) fillRgb = "AED6F1";
//////        if (ci >= 18 && ci <= 23) fillRgb = "A9DFBF";
//////        if (ci >= 24 && ci <= 29) fillRgb = "FAD7A0";
//////        setS(`${col}3`, {
//////            font:      { bold: true, sz: 8, name: "Calibri", color: { rgb: "000000" } },
//////            alignment: { horizontal: "center", vertical: "center", wrapText: true },
//////            fill:      { patternType: "solid", fgColor: { rgb: fillRgb } },
//////            border:    ba("A8C4DC"),
//////        });
//////    });
//////
//////    // Data rows
//////    dataRows.forEach((row, ri) => {
//////        const excelR = ri + 4;
//////        const isEven = ri % 2 === 1;
//////        colLetters.forEach((col, ci) => {
//////            const isNum = ci >= 6;
//////            let fillRgb = isEven ? "F0F4F8" : "FFFFFF";
//////            if (ci >= 12 && ci <= 17) fillRgb = isEven ? "EBF5FB" : "F8FCFE";
//////            if (ci >= 18 && ci <= 23) fillRgb = isEven ? "E9F7EF" : "F4FCF7";
//////            if (ci >= 24 && ci <= 29) fillRgb = isEven ? "FEF9E7" : "FFFDF5";
//////            setS(`${col}${excelR}`, {
//////                font:      { sz: 9, name: "Calibri", color: { rgb: "1A2940" } },
//////                alignment: { horizontal: isNum ? "right" : ci <= 1 ? "center" : "left", vertical: "center" },
//////                fill:      { patternType: "solid", fgColor: { rgb: fillRgb } },
//////                border:    ba("D8E2EC"),
//////            });
//////        });
//////    });
//////
//////    // Total row style
//////    const totalR = 4 + rows.length;
//////    colLetters.forEach((col, ci) => {
//////        setS(`${col}${totalR}`, {
//////            font:      { bold: true, sz: 9, name: "Calibri", color: { rgb: "1A2940" } },
//////            alignment: { horizontal: ci >= 6 ? "right" : "center", vertical: "center" },
//////            fill:      { patternType: "solid", fgColor: { rgb: "D9D9D9" } },
//////            border:    { top: b("888888", "medium"), bottom: b("888888", "medium"), left: b("AAAAAA"), right: b("AAAAAA") },
//////        });
//////    });
//////
//////    XLSX.utils.book_append_sheet(wb, ws, "Tracker");
//////    XLSX.writeFile(wb, `Tracker_${projectName || "export"}_${workOrderNo || ""}.xlsx`);
//////}
//////
//////// ─────────────────────────────────────────────────────────────────────────────
//////export default function TrackerFormPage() {
//////    const navigate = useNavigate();
//////
//////    // ── Selection state ───────────────────────────────────────────────────────
//////    const [projects,        setProjects]        = useState([]);
//////    const [selectedProject, setSelectedProject]  = useState(null);
//////    const [workOrders,      setWorkOrders]       = useState([]);
//////    const [selectedWO,      setSelectedWO]       = useState(null);
//////    const [infoSheets,      setInfoSheets]       = useState([]);
//////    const [search,          setSearch]           = useState("");
//////
//////    // ── Loading flags ─────────────────────────────────────────────────────────
//////    const [loadingProjects, setLoadingProjects]  = useState(true);
//////    const [loadingWOs,      setLoadingWOs]       = useState(false);
//////    const [loadingRows,     setLoadingRows]      = useState(false);
//////
//////    // ── Tracker rows ──────────────────────────────────────────────────────────
//////    const [rows,    setRows]    = useState([]);
//////    const [saveMsg, setSaveMsg] = useState(null);
//////    const [saving,  setSaving]  = useState(false);
//////    const [sheetId, setSheetId] = useState(null);  // null = not yet saved, number = existing sheet
//////
//////    const [step, setStep] = useState("project"); // project | wo | tracker
//////
//////    // Load projects
//////    useEffect(() => {
//////        fetch(`${process.env.REACT_APP_API_URL}/projects`)
//////            .then(r => r.json())
//////            .then(data => { setProjects(data); setLoadingProjects(false); })
//////            .catch(() => setLoadingProjects(false));
//////    }, []);
//////
//////    // When WO selected — build rows from WO items + Info Sheet flats
//////    const handleSelectWO = async (wo) => {
//////        setSelectedWO(wo);
//////        setLoadingRows(true);
//////        setRows([]);
//////        try {
//////            // Fetch info sheets to get flat numbers
//////            const sheetRes = await fetch(
//////                `${process.env.REACT_APP_API_URL}/api/info-sheets/by-work-order/${wo.id}`
//////            );
//////            const sheets = await sheetRes.json();
//////            const sheet  = Array.isArray(sheets) && sheets.length > 0 ? sheets[0] : null;
//////
//////            // Build a flat list from info sheet flats
//////            const flatList = sheet
//////                ? (sheet.flats || []).map(f => ({ flatNo: f.flatNo, items: f.items || [] }))
//////                : [];
//////
//////            // WO items provide master data
//////            const woItems = wo.items || [];
//////
//////            // Build tracker rows:
//////            // For each WO item, find which flat(s) have it in their info sheet items
//////            // If info sheet exists → pair each WO item with its flat
//////            // If no info sheet → just list WO items with empty flat
//////            const trackerRows = [];
//////            let srNo = 1;
//////
//////            if (flatList.length > 0) {
//////                flatList.forEach(flat => {
//////                    (flat.items || []).forEach(sheetItem => {
//////                        // Find matching WO item by location + windowCode + typology
//////                        const woItem = woItems.find(w =>
//////                            w.location   === sheetItem.location &&
//////                            w.windowCode === sheetItem.windowCode &&
//////                            w.typology   === sheetItem.typology
//////                        ) || sheetItem;
//////                        trackerRows.push(emptyTrackerRow(srNo++, flat.flatNo, woItem));
//////                    });
//////                });
//////            } else {
//////                // Fallback: just WO items, no flat
//////                woItems.forEach(item => {
//////                    trackerRows.push(emptyTrackerRow(srNo++, "", item));
//////                });
//////            }
//////
//////            setRows(trackerRows);
//////
//////            // Check if a tracker sheet already exists for this WO
//////            try {
//////                const tsRes = await fetch(
//////                    `${process.env.REACT_APP_API_URL}/api/tracker-sheets/by-work-order/${wo.id}`
//////                );
//////                if (tsRes.ok) {
//////                    const tsData = await tsRes.json();
//////                    setSheetId(tsData.id);
//////                    // Restore saved user-filled values into rows
//////                    if (tsData.rows && tsData.rows.length > 0) {
//////                        setRows(prev => prev.map((row, idx) => {
//////                            const saved = tsData.rows[idx];
//////                            if (!saved) return row;
//////                            const restored = { ...row };
//////                            // Restore user-filled fields only
//////                            restored.length = saved.length ?? "";
//////                            restored.height = saved.height ?? "";
//////                            restored.jobCard = saved.jobCard || "";
//////                            restored.handoverStatus = saved.handoverStatus || "";
//////                            restored.dcNo = saved.dcNo || "";
//////                            // Restore section fields
//////                            const secMap = {
//////                                SUPPLY:       ["Frame","DoorFrame","Shutter","OpenableDoor","FixGlass","TopBottomFix"],
//////                                INSTALLATION: ["Frame","DoorFrame","Shutter","OpenableDoor","FixGlass","TopBottomFix"],
//////                                HARDWARE:     ["Frame","DoorFrame","Shutter","OpenableDoor","FixGlass","TopBottomFix"],
//////                            };
//////                            const dbKeyMap = {
//////                                SUPPLY:       "supply",
//////                                INSTALLATION: "install",
//////                                HARDWARE:     "hw",
//////                            };
//////                            const subMap = {
//////                                "FRAME":           "Frame",
//////                                "DOOR FRAME":      "DoorFrame",
//////                                "SHUTTER":         "Shutter",
//////                                "OPENABLE DOOR":   "OpenableDoor",
//////                                "FIX GLASS":       "FixGlass",
//////                                "TOP / BOTTOM FIX":"TopBottomFix",
//////                            };
//////                            ["SUPPLY","INSTALLATION","HARDWARE"].forEach(sec => {
//////                                const prefix = dbKeyMap[sec];
//////                                ["FRAME","DOOR FRAME","SHUTTER","OPENABLE DOOR","FIX GLASS","TOP / BOTTOM FIX"].forEach(sub => {
//////                                    const fkey   = `${sec}__${sub}`;
//////                                    const dbKey  = `${prefix}${subMap[sub]}`;
//////                                    restored[fkey] = saved[dbKey] ?? "";
//////                                });
//////                            });
//////                            return restored;
//////                        }));
//////                    }
//////                } else {
//////                    setSheetId(null);
//////                }
//////            } catch {
//////                setSheetId(null);
//////            }
//////
//////            setStep("tracker");
//////        } catch {
//////            setSaveMsg({ type: "error", text: "Failed to load work order data." });
//////        } finally {
//////            setLoadingRows(false);
//////        }
//////    };
//////
//////    const handleSelectProject = async (project) => {
//////        setSelectedProject(project);
//////        setSelectedWO(null);
//////        setRows([]);
//////        setStep("wo");
//////        setLoadingWOs(true);
//////        try {
//////            const res  = await fetch(
//////                `${process.env.REACT_APP_API_URL}/api/work-orders/by-project/${encodeURIComponent(project.projectName)}`
//////            );
//////            const data = await res.json();
//////            setWorkOrders(Array.isArray(data) ? data : []);
//////        } catch {
//////            setWorkOrders([]);
//////        } finally {
//////            setLoadingWOs(false);
//////        }
//////    };
//////
//////    const updateRow = (_id, field, value) =>
//////        setRows(prev => prev.map(r => r._id === _id ? { ...r, [field]: value } : r));
//////
//////    const filtered = projects.filter(p =>
//////        p.projectName?.toLowerCase().includes(search.toLowerCase()) ||
//////        p.projectCode?.toLowerCase().includes(search.toLowerCase())
//////    );
//////
//////    // Totals
//////    const totalSqft = rows.reduce((s, r) => s + (parseFloat(r.sqft) || 0), 0);
//////
//////    // ── Fixed left columns ────────────────────────────────────────────────────
//////    const LEFT_COLS = [
//////        { key: "srNo",     label: "SR NO.",    w: 55,  auto: true },
//////        { key: "flat",     label: "FLAT",      w: 70,  auto: true },
//////        { key: "location", label: "LOCATION",  w: 140, auto: true },
//////        { key: "wcode",    label: "WCODE",     w: 90,  auto: true },
//////        { key: "typology", label: "TYPOLOGY",  w: 200, auto: true },
//////        { key: "series",   label: "SERIES",    w: 80,  auto: true },
//////        { key: "woLnt",    label: "WO LNT",    w: 75,  auto: true },
//////        { key: "woHgt",    label: "WO HGT",    w: 75,  auto: true },
//////        { key: "sqft",     label: "SQ FT.",    w: 80,  auto: true },
//////        { key: "length",   label: "LENGTH",    w: 80  },
//////        { key: "height",   label: "HEIGHT",    w: 80  },
//////        { key: "jobCard",  label: "JOB CARD",  w: 100 },
//////    ];
//////
//////    const sectionColors = {
//////        SUPPLY:       { bg: "#EBF5FB", hdr: "#AED6F1", text: "#1A5276" },
//////        INSTALLATION: { bg: "#E9F7EF", hdr: "#A9DFBF", text: "#1E8449" },
//////        HARDWARE:     { bg: "#FEF9E7", hdr: "#FAD7A0", text: "#784212" },
//////    };
//////
//////    if (step === "project" || step === "wo") {
//////        return (
//////            <div style={css.page}>
//////                <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
//////                <div style={css.pageHeader}>
//////                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
//////                        <div style={css.headerIcon}><FaLayerGroup /></div>
//////                        <div>
//////                            <h1 style={css.pageTitle}>Project Tracker</h1>
//////                            <p style={css.pageSubtitle}>Select project → work order → fill tracker data</p>
//////                        </div>
//////                    </div>
//////                </div>
//////
//////                <div style={css.selectionPanels}>
//////                    {/* Projects */}
//////                    <div style={css.selPanel}>
//////                        <div style={css.selPanelHeader}>
//////                            <FaBuilding style={{ color: "#0ea5e9", marginRight: 8 }} />
//////                            <span style={{ fontWeight: 700, fontSize: 14 }}>Projects ({filtered.length})</span>
//////                        </div>
//////                        <div style={css.searchBox}>
//////                            <FaSearch style={{ color: "#94a3b8", fontSize: 12 }} />
//////                            <input style={css.searchInput} placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
//////                        </div>
//////                        <div style={css.selList}>
//////                            {loadingProjects ? (
//////                                <div style={css.centerMsg}><FaSpinner style={{ animation: "spin 1s linear infinite" }} />&nbsp;Loading…</div>
//////                            ) : filtered.map(p => (
//////                                <div
//////                                    key={p.projectId}
//////                                    style={{ ...css.selItem, ...(selectedProject?.projectId === p.projectId ? css.selItemActive : {}) }}
//////                                    onClick={() => handleSelectProject(p)}
//////                                >
//////                                    <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>{p.projectName}</div>
//////                                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{p.projectCode}</div>
//////                                </div>
//////                            ))}
//////                        </div>
//////                    </div>
//////
//////                    {/* Work Orders */}
//////                    <div style={css.selPanel}>
//////                        <div style={css.selPanelHeader}>
//////                            <FaClipboardList style={{ color: "#8b5cf6", marginRight: 8 }} />
//////                            <span style={{ fontWeight: 700, fontSize: 14 }}>
//////                                Work Orders {selectedProject ? `(${workOrders.length})` : ""}
//////                            </span>
//////                        </div>
//////                        <div style={css.selList}>
//////                            {!selectedProject ? (
//////                                <div style={css.centerMsg}>Select a project first</div>
//////                            ) : loadingWOs ? (
//////                                <div style={css.centerMsg}><FaSpinner style={{ animation: "spin 1s linear infinite" }} />&nbsp;Loading…</div>
//////                            ) : workOrders.length === 0 ? (
//////                                <div style={css.centerMsg}>No work orders found</div>
//////                            ) : workOrders.map(wo => (
//////                                <div
//////                                    key={wo.id}
//////                                    style={{ ...css.selItem, ...(selectedWO?.id === wo.id ? css.selItemActive : {}) }}
//////                                    onClick={() => handleSelectWO(wo)}
//////                                >
//////                                    <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>{wo.workOrderNo}</div>
//////                                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
//////                                        {wo.towerName && <span style={css.towerBadge}>{wo.towerName}</span>}
//////                                        &nbsp;{wo.items?.length || 0} items
//////                                    </div>
//////                                </div>
//////                            ))}
//////                        </div>
//////                    </div>
//////                </div>
//////
//////                {loadingRows && (
//////                    <div style={css.centerMsg}>
//////                        <FaSpinner style={{ animation: "spin 1s linear infinite", marginRight: 8 }} />
//////                        Building tracker rows…
//////                    </div>
//////                )}
//////            </div>
//////        );
//////    }
//////
//////    // ── TRACKER FORM ──────────────────────────────────────────────────────────
//////    return (
//////        <div style={css.page}>
//////            <style>{`
//////                @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
//////                .tr-row:hover { background: #f8fafc !important; }
//////                .tr-cell:focus { border-color: #0284c7 !important; outline: none; }
//////                .dl-btn:hover { background: #15803d !important; transform: translateY(-1px); }
//////            `}</style>
//////
//////            {/* Header */}
//////            <div style={css.pageHeader}>
//////                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
//////                    <button style={css.backBtn} onClick={() => { setStep("project"); setSelectedProject(null); setSelectedWO(null); setRows([]); }}>
//////                        <FaRegArrowAltCircleLeft /> Back to Selection
//////                    </button>
//////                    <h1 style={css.pageTitle}>Production Tracker</h1>
//////                    <div style={css.metaLine}>
//////                        <span style={css.projBadge}>{selectedProject?.projectName}</span>
//////                        <span style={css.woBadge}>{selectedWO?.workOrderNo}</span>
//////                        {selectedWO?.towerName && <span style={css.towerBadge}>{selectedWO.towerName}</span>}
//////                        <span style={{ fontSize: 12, color: "#64748b" }}>{rows.length} rows</span>
//////                    </div>
//////                </div>
//////
//////                <div style={{ display: "flex", gap: 10 }}>
//////                <button
//////                    style={{ ...css.excelBtn, background: "#10b981" }}
//////                    onClick={async () => {
//////                        setSaving(true); setSaveMsg(null);
//////                        const subMap = {
//////                            "FRAME":"Frame","DOOR FRAME":"DoorFrame","SHUTTER":"Shutter",
//////                            "OPENABLE DOOR":"OpenableDoor","FIX GLASS":"FixGlass","TOP / BOTTOM FIX":"TopBottomFix"
//////                        };
//////                        const dbKeyMap = { SUPPLY:"supply", INSTALLATION:"install", HARDWARE:"hw" };
//////                        const payload = {
//////                            workOrderId: selectedWO.id,
//////                            projectName: selectedProject?.projectName || "",
//////                            towerName:   selectedWO?.towerName || "",
//////                            date:        new Date().toISOString().split("T")[0],
//////                            rows: rows.map(r => {
//////                                const row = {
//////                                    srNo: r.srNo, flat: r.flat, location: r.location,
//////                                    wcode: r.wcode, typology: r.typology, series: r.series,
//////                                    woLnt: r.woLnt || null, woHgt: r.woHgt || null, sqft: r.sqft || null,
//////                                    length: r.length || null, height: r.height || null,
//////                                    jobCard: r.jobCard || null,
//////                                    handoverStatus: r.handoverStatus || null, dcNo: r.dcNo || null,
//////                                };
//////                                ["SUPPLY","INSTALLATION","HARDWARE"].forEach(sec => {
//////                                    const prefix = dbKeyMap[sec];
//////                                    ["FRAME","DOOR FRAME","SHUTTER","OPENABLE DOOR","FIX GLASS","TOP / BOTTOM FIX"].forEach(sub => {
//////                                        const fkey  = `${sec}__${sub}`;
//////                                        const dbKey = `${prefix}${subMap[sub]}`;
//////                                        row[dbKey]  = r[fkey] !== "" ? parseFloat(r[fkey]) || null : null;
//////                                    });
//////                                });
//////                                return row;
//////                            }),
//////                        };
//////                        try {
//////                            const url    = sheetId
//////                                ? `${process.env.REACT_APP_API_URL}/api/tracker-sheets/${sheetId}`
//////                                : `${process.env.REACT_APP_API_URL}/api/tracker-sheets`;
//////                            const method = sheetId ? "PUT" : "POST";
//////                            const res    = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
//////                            const data   = await res.json();
//////                            if (!res.ok) throw new Error(data.message || "Server error");
//////                            if (!sheetId) setSheetId(data.id);
//////                            setSaveMsg({ type: "success", text: sheetId ? "Tracker sheet updated!" : "Tracker sheet saved!" });
//////                        } catch (err) {
//////                            setSaveMsg({ type: "error", text: err.message });
//////                        } finally {
//////                            setSaving(false);
//////                        }
//////                    }}
//////                    disabled={saving}
//////                >
//////                    {saving
//////                        ? <FaSpinner style={{ animation: "spin 1s linear infinite" }} />
//////                        : <FaSave style={{ fontSize: 14 }} />}
//////                    <span>{saving ? "Saving…" : sheetId ? "Update" : "Save"}</span>
//////                </button>
//////
//////                <button
//////                    className="dl-btn"
//////                    style={css.excelBtn}
//////                    onClick={() => exportExcel(
//////                        rows,
//////                        selectedProject?.projectName,
//////                        selectedWO?.workOrderNo,
//////                        selectedWO?.towerName
//////                    )}
//////                >
//////                    <FaFileExcel style={{ fontSize: 15 }} />
//////                    <span>Download Excel</span>
//////                </button>
//////                </div>
//////            </div>
//////
//////            {saveMsg && (
//////                <div style={{ ...css.toast, ...(saveMsg.type === "success" ? css.toastOk : css.toastErr) }}>
//////                    {saveMsg.type === "success" ? <FaCheckCircle /> : <FaExclamationTriangle />}
//////                    &nbsp;{saveMsg.text}
//////                </div>
//////            )}
//////
//////            {/* Table */}
//////            <div style={css.tableCard}>
//////                <div style={{ overflowX: "auto" }}>
//////                    <table style={{ borderCollapse: "collapse", fontSize: 11, whiteSpace: "nowrap" }}>
//////                        {/* ── Header rows ── */}
//////                        <thead>
//////                            {/* Row 1: Section headers */}
//////                            <tr>
//////                                {LEFT_COLS.map(col => (
//////                                    <th
//////                                        key={col.key}
//////                                        rowSpan={2}
//////                                        style={{ ...css.th, minWidth: col.w, background: "#1e293b", color: "#f8fafc", verticalAlign: "middle" }}
//////                                    >
//////                                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
//////                                            <span>{col.label}</span>
//////                                            {col.auto && <span style={{ fontSize: 8, color: "#a5b4fc", fontWeight: 700 }}>AUTO</span>}
//////                                        </div>
//////                                    </th>
//////                                ))}
//////                                {SECTIONS.map(sec => (
//////                                    <th
//////                                        key={sec}
//////                                        colSpan={SUB_COLS.length}
//////                                        style={{
//////                                            ...css.th,
//////                                            background: sectionColors[sec].hdr,
//////                                            color: sectionColors[sec].text,
//////                                            textAlign: "center",
//////                                            fontWeight: 800,
//////                                            fontSize: 12,
//////                                            letterSpacing: "0.05em",
//////                                        }}
//////                                    >
//////                                        {sec}
//////                                    </th>
//////                                ))}
//////                                <th rowSpan={2} style={{ ...css.th, minWidth: 110, background: "#334155", color: "#f8fafc" }}>HANDOVER STATUS</th>
//////                                <th rowSpan={2} style={{ ...css.th, minWidth: 80, background: "#334155", color: "#f8fafc" }}>DC.NO</th>
//////                            </tr>
//////                            {/* Row 2: Sub-column headers */}
//////                            <tr>
//////                                {SECTIONS.map(sec =>
//////                                    SUB_COLS.map(sub => (
//////                                        <th
//////                                            key={`${sec}_${sub}`}
//////                                            style={{
//////                                                ...css.th,
//////                                                minWidth: 100,
//////                                                background: sectionColors[sec].bg,
//////                                                color: sectionColors[sec].text,
//////                                                fontSize: 10,
//////                                                fontWeight: 700,
//////                                                textAlign: "center",
//////                                                whiteSpace: "normal",
//////                                                lineHeight: 1.2,
//////                                                padding: "6px 6px",
//////                                            }}
//////                                        >
//////                                            {sub}
//////                                        </th>
//////                                    ))
//////                                )}
//////                            </tr>
//////                        </thead>
//////
//////                        {/* ── Body ── */}
//////                        <tbody>
//////                            {rows.map((row, idx) => (
//////                                <tr key={row._id} className="tr-row" style={{ background: idx % 2 === 0 ? "#fff" : "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
//////                                    {/* Fixed left cols */}
//////                                    {LEFT_COLS.map(col => (
//////                                        <td key={col.key} style={css.td}>
//////                                            {col.auto ? (
//////                                                <div style={css.autoCell}>
//////                                                    {col.key === "sqft" && row[col.key]
//////                                                        ? parseFloat(row[col.key]).toFixed(2)
//////                                                        : row[col.key] || "—"}
//////                                                </div>
//////                                            ) : (
//////                                                <input
//////                                                    className="tr-cell"
//////                                                    style={{ ...css.cell, width: col.w - 16 }}
//////                                                    value={row[col.key]}
//////                                                    onChange={e => updateRow(row._id, col.key, e.target.value)}
//////                                                    placeholder={col.key === "jobCard" ? "e.g. 208-01" : ""}
//////                                                />
//////                                            )}
//////                                        </td>
//////                                    ))}
//////
//////                                    {/* Section sub-cols */}
//////                                    {SECTIONS.map(sec =>
//////                                        SUB_COLS.map(sub => {
//////                                            const fkey = `${sec}__${sub}`;
//////                                            return (
//////                                                <td key={fkey} style={{ ...css.td, background: idx % 2 === 0 ? sectionColors[sec].bg.replace("FB", "FE").replace("EF", "F7").replace("E7", "FD") : sectionColors[sec].bg }}>
//////                                                    <input
//////                                                        className="tr-cell"
//////                                                        style={{ ...css.cell, width: 84, textAlign: "right" }}
//////                                                        type="number"
//////                                                        value={row[fkey]}
//////                                                        onChange={e => updateRow(row._id, fkey, e.target.value)}
//////                                                        placeholder="0.00"
//////                                                    />
//////                                                </td>
//////                                            );
//////                                        })
//////                                    )}
//////
//////                                    {/* Handover + DC.No */}
//////                                    <td style={css.td}>
//////                                        <input className="tr-cell" style={{ ...css.cell, width: 94 }} value={row.handoverStatus || ""} onChange={e => updateRow(row._id, "handoverStatus", e.target.value)} placeholder="Status" />
//////                                    </td>
//////                                    <td style={css.td}>
//////                                        <input className="tr-cell" style={{ ...css.cell, width: 64 }} value={row.dcNo || ""} onChange={e => updateRow(row._id, "dcNo", e.target.value)} placeholder="DC No" />
//////                                    </td>
//////                                </tr>
//////                            ))}
//////                        </tbody>
//////
//////                        {/* ── Footer totals ── */}
//////                        <tfoot>
//////                            <tr style={{ background: "#f1f5f9", borderTop: "2px solid #cbd5e1" }}>
//////                                <td colSpan={9} style={{ padding: "10px 14px", fontWeight: 800, fontSize: 12, color: "#1e293b" }}>
//////                                    TOTAL &nbsp;
//////                                    <span style={{ color: "#0284c7" }}>Sqft: {totalSqft.toFixed(2)}</span>
//////                                </td>
//////                                {/* Supply totals */}
//////                                {SECTIONS.map(sec =>
//////                                    SUB_COLS.map(sub => {
//////                                        const fkey = `${sec}__${sub}`;
//////                                        const total = rows.reduce((s, r) => s + (parseFloat(r[fkey]) || 0), 0);
//////                                        return (
//////                                            <td key={fkey} style={{ padding: "10px 6px", textAlign: "right", fontWeight: 700, fontSize: 11, color: sectionColors[sec].text }}>
//////                                                {total > 0 ? total.toFixed(2) : ""}
//////                                            </td>
//////                                        );
//////                                    })
//////                                )}
//////                                <td colSpan={2} />
//////                            </tr>
//////                        </tfoot>
//////                    </table>
//////                </div>
//////            </div>
//////
//////            {/* Summary strip */}
//////            <div style={css.summaryStrip}>
//////                {[
//////                    { label: "Project",    val: selectedProject?.projectName || "—", color: "#1e293b" },
//////                    { label: "Work Order", val: selectedWO?.workOrderNo || "—",       color: "#0284c7" },
//////                    { label: "Tower",      val: selectedWO?.towerName   || "—",       color: "#d97706" },
//////                    { label: "Total Rows", val: rows.length,                          color: "#475569" },
//////                    { label: "Total Sqft", val: totalSqft.toFixed(2),                color: "#0284c7" },
//////                ].map(s => (
//////                    <div key={s.label} style={css.summaryItem}>
//////                        <span style={css.summaryLabel}>{s.label}</span>
//////                        <span style={{ fontSize: 15, fontWeight: 800, color: s.color }}>{s.val}</span>
//////                    </div>
//////                ))}
//////            </div>
//////        </div>
//////    );
//////}
//////
//////// ── Styles ────────────────────────────────────────────────────────────────────
//////const css = {
//////    page:           { maxWidth: 1600, margin: "0 auto", padding: "0 4px 56px", fontFamily: "'Inter',-apple-system,sans-serif" },
//////    pageHeader:     { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, padding: "28px 0 20px", flexWrap: "wrap" },
//////    headerIcon:     { width: 44, height: 44, background: "linear-gradient(135deg,#f59e0b,#d97706)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 20 },
//////    pageTitle:      { margin: 0, fontSize: 22, fontWeight: 800, color: "#0f172a" },
//////    pageSubtitle:   { margin: "3px 0 0", fontSize: 13, color: "#64748b" },
//////    backBtn:        { background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 13, color: "#64748b", fontWeight: 500, display: "flex", alignItems: "center", gap: 6, marginBottom: 4 },
//////    metaLine:       { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 4 },
//////    projBadge:      { background: "#e0f2fe", color: "#0284c7", fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 12 },
//////    woBadge:        { background: "#ede9fe", color: "#7c3aed", fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 12 },
//////    towerBadge:     { background: "#fef3c7", color: "#92400e", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 10, border: "1px solid #fde68a" },
//////    excelBtn:       { display: "flex", alignItems: "center", gap: 8, padding: "11px 22px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 9, cursor: "pointer", fontWeight: 700, fontSize: 14, transition: "all 0.2s" },
//////    toast:          { display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500, marginBottom: 16, border: "1px solid" },
//////    toastOk:        { background: "#ecfdf5", color: "#047857", borderColor: "#a7f3d0" },
//////    toastErr:       { background: "#fef2f2", color: "#b91c1c", borderColor: "#fecaca" },
//////    tableCard:      { background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 1px 6px rgba(0,0,0,0.04)", marginBottom: 20, overflow: "hidden" },
//////    th:             { padding: "10px 8px", fontWeight: 700, textAlign: "left", fontSize: 11, borderRight: "1px solid rgba(255,255,255,0.15)", verticalAlign: "middle", whiteSpace: "nowrap" },
//////    td:             { padding: "4px 5px", verticalAlign: "middle" },
//////    cell:           { padding: "5px 7px", border: "1px solid #cbd5e1", borderRadius: 4, fontSize: 11, color: "#0f172a", background: "#fff", outline: "none" },
//////    autoCell:       { padding: "5px 8px", background: "#f1f5f9", borderRadius: 4, fontSize: 11, color: "#475569", fontWeight: 500, border: "1px solid #e2e8f0", minWidth: 40, textAlign: "right" },
//////    summaryStrip:   { display: "flex", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" },
//////    summaryItem:    { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "14px 10px", borderRight: "1px solid #e2e8f0" },
//////    summaryLabel:   { fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 },
//////    selectionPanels:{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 },
//////    selPanel:       { background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 2px 6px rgba(0,0,0,0.04)" },
//////    selPanelHeader: { display: "flex", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid #f1f5f9", background: "#fafbfc" },
//////    searchBox:      { display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" },
//////    searchInput:    { border: "none", background: "transparent", outline: "none", fontSize: 13, flex: 1 },
//////    selList:        { maxHeight: 320, overflowY: "auto" },
//////    selItem:        { padding: "12px 18px", cursor: "pointer", borderBottom: "1px solid #f8fafc", borderLeft: "3px solid transparent", transition: "all 0.15s" },
//////    selItemActive:  { background: "#eff6ff", borderLeft: "3px solid #0284c7" },
//////    centerMsg:      { padding: "30px", textAlign: "center", color: "#94a3b8", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
//////};
////
////
////import React, { useState, useEffect } from "react";
////import { useNavigate } from "react-router-dom";
////import {
////    FaLayerGroup, FaSearch, FaBuilding, FaClipboardList,
////    FaSpinner, FaFileExcel, FaSave,
////    FaCheckCircle, FaExclamationTriangle, FaRegArrowAltCircleLeft
////} from "react-icons/fa";
////import * as XLSX from "xlsx-js-style";
////
////// ── Column definitions ────────────────────────────────────────────────────────
////const SUB_COLS = [
////    "FRAME", "DOOR FRAME", "SHUTTER", "OPENABLE DOOR", "FIX GLASS", "TOP / BOTTOM FIX",
////];
////
////const DCNO_SUB_COLS = [
////    "FRAME", "DOOR FRAME", "SHUTTER", "OPENABLE DOOR", "FIX GLASS", "TOP / BOTTOM FIX",
////];
////
////const STATUS_SUB_COLS = [
////    "FRAME", "DOOR FRAME", "SHUTTER", "OPENABLE DOOR", "FIX GLASS", "TOP / BOTTOM FIX", "HARDWARE",
////];
////
////// All 5 sections in order
////const ALL_SECTIONS = ["DCNO", "STATUS", "SUPPLY", "INSTALLATION", "HARDWARE"];
////
////const SECTION_SUB_COLS = {
////    DCNO:         DCNO_SUB_COLS,
////    STATUS:       STATUS_SUB_COLS,
////    SUPPLY:       SUB_COLS,
////    INSTALLATION: SUB_COLS,
////    HARDWARE:     SUB_COLS,
////};
////
////// DB key prefixes
////const DB_PREFIX = {
////    DCNO: "dcno", STATUS: "status",
////    SUPPLY: "supply", INSTALLATION: "install", HARDWARE: "hw",
////};
////
////// Sub-col → camelCase suffix
////const SUB_SUFFIX = {
////    "FRAME":           "Frame",
////    "DOOR FRAME":      "DoorFrame",
////    "SHUTTER":         "Shutter",
////    "OPENABLE DOOR":   "OpenableDoor",
////    "FIX GLASS":       "FixGlass",
////    "TOP / BOTTOM FIX":"TopBottomFix",
////    "HARDWARE":        "Hardware",
////};
////
////// ── Empty tracker row ─────────────────────────────────────────────────────────
////const emptyTrackerRow = (srNo = "", flat = "", woItem = null) => {
////    const base = {
////        _id:      Date.now() + Math.random(),
////        srNo,
////        flat,
////        location:  woItem?.location   || "",
////        wcode:     woItem?.windowCode  || "",
////        typology:  woItem?.typology    || "",
////        series:    woItem?.series      || "",
////        woLnt:     woItem?.length      || "",
////        woHgt:     woItem?.height      || "",
////        sqft:      woItem?.sqft        || "",
////        length:    "",
////        height:    "",
////        jobCard:   "",
////        handoverStatus: "",
////    };
////    ALL_SECTIONS.forEach(sec => {
////        SECTION_SUB_COLS[sec].forEach(sub => {
////            base[`${sec}__${sub}`] = "";
////        });
////    });
////    return base;
////};
////
////// ── Excel export ──────────────────────────────────────────────────────────────
////function exportExcel(rows, projectName, workOrderNo, towerName) {
////    const wb = XLSX.utils.book_new();
////    const ws = XLSX.utils.json_to_sheet([]);
////
////    const setS = (ref, s) => {
////        if (!ws[ref]) ws[ref] = { t: "z", v: "" };
////        ws[ref].s = s;
////    };
////
////    // Column order:
////    // 0-11:  SR NO, FLAT, LOCATION, WCODE, TYPOLOGY, SERIES, WO LNT, WO HGT, SQ FT, LENGTH, HEIGHT, JOB CARD
////    // 12-17: DCNO (6)
////    // 18-24: STATUS (7)
////    // 25-30: SUPPLY (6)
////    // 31-36: INSTALLATION (6)
////    // 37-42: HARDWARE (6)
////    // 43:    HANDOVER STATUS
////    const totalCols = 44;
////
////    // Build column letter array (A..AR for 44 cols)
////    const colLetters = [];
////    for (let i = 0; i < totalCols; i++) {
////        if (i < 26) colLetters.push(String.fromCharCode(65 + i));
////        else colLetters.push(
////            String.fromCharCode(64 + Math.floor(i / 26)) +
////            String.fromCharCode(65 + (i % 26))
////        );
////    }
////
////    // ── Totals ────────────────────────────────────────────────────────────────
////    const totalSqft = rows.reduce((s, r) => s + (parseFloat(r.sqft) || 0), 0);
////
////    // ── Row 1: Project / WO title ─────────────────────────────────────────────
////    XLSX.utils.sheet_add_aoa(ws,
////        [[`PROJECT: ${projectName || "—"}   |   WO: ${workOrderNo || "—"}   |   Tower: ${towerName || "—"}`]],
////        { origin: "A1" }
////    );
////
////    // ── Row 2: Section group headers ──────────────────────────────────────────
////    const row2 = new Array(totalCols).fill("");
////    row2[12] = "DC.NO";
////    row2[18] = "STATUS";
////    row2[25] = "SUPPLY";
////    row2[31] = "INSTALLATION";
////    row2[37] = "HARDWARE";
////    XLSX.utils.sheet_add_aoa(ws, [row2], { origin: "A2" });
////
////    // ── Row 3: Sub-headers ────────────────────────────────────────────────────
////    const row3 = [
////        "SR NO.", "FLAT", "LOCATION", "WCODE", "TYPOLOGY", "SERIES",
////        "WO LNT", "WO HGT", "SQ FT.", "LENGTH", "HEIGHT", "JOB CARD",
////        ...DCNO_SUB_COLS,
////        ...STATUS_SUB_COLS,
////        ...SUB_COLS, ...SUB_COLS, ...SUB_COLS,
////        "HANDOVER STATUS",
////    ];
////    XLSX.utils.sheet_add_aoa(ws, [row3], { origin: "A3" });
////
////    // ── Rows 4+: Data ─────────────────────────────────────────────────────────
////    const dataRows = rows.map(r => [
////        r.srNo || "", r.flat || "", r.location || "", r.wcode || "",
////        r.typology || "", r.series || "",
////        r.woLnt !== "" ? Number(r.woLnt) : "",
////        r.woHgt !== "" ? Number(r.woHgt) : "",
////        r.sqft  !== "" ? parseFloat(parseFloat(r.sqft).toFixed(2)) : "",
////        r.length !== "" ? Number(r.length) : "",
////        r.height !== "" ? Number(r.height) : "",
////        r.jobCard || "",
////        // DCNO
////        ...DCNO_SUB_COLS.map(sub => r[`DCNO__${sub}`] !== "" ? parseFloat(r[`DCNO__${sub}`] || 0) : ""),
////        // STATUS
////        ...STATUS_SUB_COLS.map(sub => r[`STATUS__${sub}`] !== "" ? parseFloat(r[`STATUS__${sub}`] || 0) : ""),
////        // SUPPLY
////        ...SUB_COLS.map(sub => r[`SUPPLY__${sub}`] !== "" ? parseFloat(r[`SUPPLY__${sub}`] || 0) : ""),
////        // INSTALLATION
////        ...SUB_COLS.map(sub => r[`INSTALLATION__${sub}`] !== "" ? parseFloat(r[`INSTALLATION__${sub}`] || 0) : ""),
////        // HARDWARE
////        ...SUB_COLS.map(sub => r[`HARDWARE__${sub}`] !== "" ? parseFloat(r[`HARDWARE__${sub}`] || 0) : ""),
////        r.handoverStatus || "",
////    ]);
////    XLSX.utils.sheet_add_aoa(ws, dataRows, { origin: "A4" });
////
////    // ── Total row ─────────────────────────────────────────────────────────────
////    const totalR = 4 + rows.length;
////    const totalRow = new Array(totalCols).fill("");
////    totalRow[0] = "TOTAL";
////    totalRow[8] = parseFloat(totalSqft.toFixed(2));
////    let ci = 12;
////    ALL_SECTIONS.forEach(sec => {
////        SECTION_SUB_COLS[sec].forEach(sub => {
////            totalRow[ci++] = rows.reduce((s, r) => s + (parseFloat(r[`${sec}__${sub}`]) || 0), 0);
////        });
////    });
////    XLSX.utils.sheet_add_aoa(ws, [totalRow], { origin: `A${totalR}` });
////
////    // ── Merges ────────────────────────────────────────────────────────────────
////    const r0 = (row) => row - 1;
////    ws["!merges"] = [
////        { s: { r: r0(1), c: 0  }, e: { r: r0(1), c: totalCols - 1 } }, // Row 1 full
////        ...Array.from({ length: 12 }, (_, i) => ({ s: { r: r0(2), c: i }, e: { r: r0(3), c: i } })), // A-L 2-row span
////        { s: { r: r0(2), c: 12 }, e: { r: r0(2), c: 17 } }, // DC.NO
////        { s: { r: r0(2), c: 18 }, e: { r: r0(2), c: 24 } }, // STATUS
////        { s: { r: r0(2), c: 25 }, e: { r: r0(2), c: 30 } }, // SUPPLY
////        { s: { r: r0(2), c: 31 }, e: { r: r0(2), c: 36 } }, // INSTALLATION
////        { s: { r: r0(2), c: 37 }, e: { r: r0(2), c: 42 } }, // HARDWARE
////        { s: { r: r0(2), c: 43 }, e: { r: r0(3), c: 43 } }, // HANDOVER 2-row span
////    ];
////
////    // ── Column widths ─────────────────────────────────────────────────────────
////    ws["!cols"] = [
////        { wch: 7  }, { wch: 8  }, { wch: 20 }, { wch: 10 }, { wch: 30 }, { wch: 8  },
////        { wch: 8  }, { wch: 8  }, { wch: 9  }, { wch: 8  }, { wch: 8  }, { wch: 12 },
////        ...Array(6).fill({ wch: 13 }),  // DCNO
////        ...Array(7).fill({ wch: 13 }),  // STATUS
////        ...Array(18).fill({ wch: 13 }), // SUPPLY/INSTALL/HW
////        { wch: 14 },                    // HANDOVER
////    ];
////    ws["!rows"] = [{ hpt: 22 }, { hpt: 20 }, { hpt: 32 }];
////
////    // ── Style helpers ─────────────────────────────────────────────────────────
////    const bdr = (rgb, style = "thin") => ({ style, color: { rgb } });
////    const allBdr = (rgb) => ({ top: bdr(rgb), bottom: bdr(rgb), left: bdr(rgb), right: bdr(rgb) });
////
////    // Row 1 — title
////    setS("A1", {
////        font:      { bold: true, sz: 13, name: "Calibri", color: { rgb: "1A2940" } },
////        alignment: { horizontal: "center", vertical: "center" },
////        fill:      { patternType: "solid", fgColor: { rgb: "EEF2F7" } },
////        border:    { bottom: bdr("A0B0C8", "medium") },
////    });
////
////    // Section group header colors
////    const secHdr = {
////        base:         { fill: "D6E4F0", text: "1A2940" },
////        DCNO:         { fill: "FCF3CF", text: "7D6608" },
////        STATUS:       { fill: "FADBD8", text: "922B21" },
////        SUPPLY:       { fill: "D6EAF8", text: "1A5276" },
////        INSTALLATION: { fill: "D5F5E3", text: "1E8449" },
////        HARDWARE:     { fill: "FDEBD0", text: "784212" },
////    };
////    const secSub = {
////        base:         "BDD7EE",
////        DCNO:         "F9E79F",
////        STATUS:       "F1948A",
////        SUPPLY:       "AED6F1",
////        INSTALLATION: "A9DFBF",
////        HARDWARE:     "FAD7A0",
////    };
////
////    const getSecForCol = (ci) => {
////        if (ci >= 12 && ci <= 17) return "DCNO";
////        if (ci >= 18 && ci <= 24) return "STATUS";
////        if (ci >= 25 && ci <= 30) return "SUPPLY";
////        if (ci >= 31 && ci <= 36) return "INSTALLATION";
////        if (ci >= 37 && ci <= 42) return "HARDWARE";
////        return "base";
////    };
////
////    // Row 2 group headers
////    colLetters.forEach((col, i) => {
////        const sec = getSecForCol(i);
////        const c   = secHdr[sec];
////        setS(`${col}2`, {
////            font:      { bold: true, sz: 9, name: "Calibri", color: { rgb: c.text } },
////            alignment: { horizontal: "center", vertical: "center", wrapText: true },
////            fill:      { patternType: "solid", fgColor: { rgb: c.fill } },
////            border:    allBdr("A8C4DC"),
////        });
////    });
////
////    // Row 3 sub-headers
////    colLetters.forEach((col, i) => {
////        const sec = getSecForCol(i);
////        setS(`${col}3`, {
////            font:      { bold: true, sz: 8, name: "Calibri", color: { rgb: "000000" } },
////            alignment: { horizontal: "center", vertical: "center", wrapText: true },
////            fill:      { patternType: "solid", fgColor: { rgb: secSub[sec] } },
////            border:    allBdr("A8C4DC"),
////        });
////    });
////
////    // Data rows
////    const dataTint = {
////        base:         ["F0F4F8", "FFFFFF"],
////        DCNO:         ["FDFDE7", "FEFEF5"],
////        STATUS:       ["FDEDEC", "FEF5F5"],
////        SUPPLY:       ["EBF5FB", "F8FCFE"],
////        INSTALLATION: ["E9F7EF", "F4FCF7"],
////        HARDWARE:     ["FEF9E7", "FFFDF5"],
////    };
////
////    dataRows.forEach((_, ri) => {
////        const excelR = ri + 4;
////        const isOdd  = ri % 2 === 1;
////        colLetters.forEach((col, i) => {
////            const sec    = getSecForCol(i);
////            const colors = dataTint[sec];
////            setS(`${col}${excelR}`, {
////                font:      { sz: 9, name: "Calibri", color: { rgb: "1A2940" } },
////                alignment: { horizontal: i >= 6 ? "right" : i <= 1 ? "center" : "left", vertical: "center" },
////                fill:      { patternType: "solid", fgColor: { rgb: isOdd ? colors[0] : colors[1] } },
////                border:    allBdr("D8E2EC"),
////            });
////        });
////    });
////
////    // Total row
////    colLetters.forEach((col, i) => {
////        setS(`${col}${totalR}`, {
////            font:      { bold: true, sz: 9, name: "Calibri", color: { rgb: "1A2940" } },
////            alignment: { horizontal: i >= 6 ? "right" : "center", vertical: "center" },
////            fill:      { patternType: "solid", fgColor: { rgb: "D9D9D9" } },
////            border:    {
////                top:    bdr("888888", "medium"),
////                bottom: bdr("888888", "medium"),
////                left:   bdr("AAAAAA"),
////                right:  bdr("AAAAAA"),
////            },
////        });
////    });
////
////    XLSX.utils.book_append_sheet(wb, ws, "Tracker");
////    XLSX.writeFile(wb, `Tracker_${projectName || "export"}_${workOrderNo || ""}.xlsx`);
////}
////
////// ─────────────────────────────────────────────────────────────────────────────
////export default function TrackerFormPage() {
////    const navigate = useNavigate();
////
////    const [projects,        setProjects]       = useState([]);
////    const [selectedProject, setSelectedProject] = useState(null);
////    const [workOrders,      setWorkOrders]      = useState([]);
////    const [selectedWO,      setSelectedWO]      = useState(null);
////    const [search,          setSearch]          = useState("");
////    const [loadingProjects, setLoadingProjects]  = useState(true);
////    const [loadingWOs,      setLoadingWOs]       = useState(false);
////    const [loadingRows,     setLoadingRows]      = useState(false);
////    const [rows,            setRows]            = useState([]);
////    const [saveMsg,         setSaveMsg]         = useState(null);
////    const [saving,          setSaving]          = useState(false);
////    const [sheetId,         setSheetId]         = useState(null);
////    const [step,            setStep]            = useState("project");
////
////    // Load projects
////    useEffect(() => {
////        fetch(`${process.env.REACT_APP_API_URL}/projects`)
////            .then(r => r.json())
////            .then(data => { setProjects(data); setLoadingProjects(false); })
////            .catch(() => setLoadingProjects(false));
////    }, []);
////
////    const handleSelectProject = async (project) => {
////        setSelectedProject(project);
////        setSelectedWO(null);
////        setRows([]);
////        setSheetId(null);
////        setStep("wo");
////        setLoadingWOs(true);
////        try {
////            const res  = await fetch(
////                `${process.env.REACT_APP_API_URL}/api/work-orders/by-project/${encodeURIComponent(project.projectName)}`
////            );
////            const data = await res.json();
////            setWorkOrders(Array.isArray(data) ? data : []);
////        } catch {
////            setWorkOrders([]);
////        } finally {
////            setLoadingWOs(false);
////        }
////    };
////
////    const handleSelectWO = async (wo) => {
////        setSelectedWO(wo);
////        setLoadingRows(true);
////        setRows([]);
////        setSheetId(null);
////        setSaveMsg(null);
////        try {
////            // Fetch info sheets to get flat numbers
////            const sheetRes = await fetch(
////                `${process.env.REACT_APP_API_URL}/api/info-sheets/by-work-order/${wo.id}`
////            );
////            const sheets   = await sheetRes.json();
////            const sheet    = Array.isArray(sheets) && sheets.length > 0 ? sheets[0] : null;
////            const flatList = sheet
////                ? (sheet.flats || []).map(f => ({ flatNo: f.flatNo, items: f.items || [] }))
////                : [];
////            const woItems  = wo.items || [];
////
////            // Build tracker rows
////            const trackerRows = [];
////            let srNo = 1;
////            if (flatList.length > 0) {
////                flatList.forEach(flat => {
////                    (flat.items || []).forEach(sheetItem => {
////                        const woItem = woItems.find(w =>
////                            w.location   === sheetItem.location &&
////                            w.windowCode === sheetItem.windowCode &&
////                            w.typology   === sheetItem.typology
////                        ) || sheetItem;
////                        trackerRows.push(emptyTrackerRow(srNo++, flat.flatNo, woItem));
////                    });
////                });
////            } else {
////                woItems.forEach(item => trackerRows.push(emptyTrackerRow(srNo++, "", item)));
////            }
////
////            // Check if tracker sheet already exists — restore saved values
////            try {
////                const tsRes = await fetch(
////                    `${process.env.REACT_APP_API_URL}/api/tracker-sheets/by-work-order/${wo.id}`
////                );
////                if (tsRes.ok) {
////                    const tsData = await tsRes.json();
////                    setSheetId(tsData.id);
////                    if (tsData.rows && tsData.rows.length > 0) {
////                        const restored = trackerRows.map((row, idx) => {
////                            const saved = tsData.rows[idx];
////                            if (!saved) return row;
////                            const r = { ...row };
////                            r.length         = saved.length         ?? "";
////                            r.height         = saved.height         ?? "";
////                            r.jobCard        = saved.jobCard        || "";
////                            r.handoverStatus = saved.handoverStatus || "";
////                            ALL_SECTIONS.forEach(sec => {
////                                const prefix = DB_PREFIX[sec];
////                                SECTION_SUB_COLS[sec].forEach(sub => {
////                                    const fkey  = `${sec}__${sub}`;
////                                    const dbKey = `${prefix}${SUB_SUFFIX[sub]}`;
////                                    r[fkey] = saved[dbKey] ?? "";
////                                });
////                            });
////                            return r;
////                        });
////                        setRows(restored);
////                    } else {
////                        setRows(trackerRows);
////                    }
////                } else {
////                    setSheetId(null);
////                    setRows(trackerRows);
////                }
////            } catch {
////                setSheetId(null);
////                setRows(trackerRows);
////            }
////
////            setStep("tracker");
////        } catch {
////            setSaveMsg({ type: "error", text: "Failed to load work order data." });
////        } finally {
////            setLoadingRows(false);
////        }
////    };
////
////    const updateRow = (_id, field, value) =>
////        setRows(prev => prev.map(r => r._id === _id ? { ...r, [field]: value } : r));
////
////    // Save to DB
////    const handleSave = async () => {
////        setSaving(true);
////        setSaveMsg(null);
////        const payload = {
////            workOrderId: selectedWO.id,
////            projectName: selectedProject?.projectName || "",
////            towerName:   selectedWO?.towerName        || "",
////            date:        new Date().toISOString().split("T")[0],
////            rows: rows.map(r => {
////                const row = {
////                    srNo: r.srNo, flat: r.flat, location: r.location,
////                    wcode: r.wcode, typology: r.typology, series: r.series,
////                    woLnt: r.woLnt || null, woHgt: r.woHgt || null, sqft: r.sqft || null,
////                    length: r.length || null, height: r.height || null,
////                    jobCard: r.jobCard || null,
////                    handoverStatus: r.handoverStatus || null,
////                };
////                ALL_SECTIONS.forEach(sec => {
////                    const prefix = DB_PREFIX[sec];
////                    SECTION_SUB_COLS[sec].forEach(sub => {
////                        const fkey  = `${sec}__${sub}`;
////                        const dbKey = `${prefix}${SUB_SUFFIX[sub]}`;
////                        row[dbKey]  = r[fkey] !== "" ? parseFloat(r[fkey]) || null : null;
////                    });
////                });
////                return row;
////            }),
////        };
////
////        try {
////            const url    = sheetId
////                ? `${process.env.REACT_APP_API_URL}/api/tracker-sheets/${sheetId}`
////                : `${process.env.REACT_APP_API_URL}/api/tracker-sheets`;
////            const method = sheetId ? "PUT" : "POST";
////            const res    = await fetch(url, {
////                method,
////                headers: { "Content-Type": "application/json" },
////                body:    JSON.stringify(payload),
////            });
////            const data = await res.json();
////            if (!res.ok) throw new Error(data.message || "Server error");
////            if (!sheetId) setSheetId(data.id);
////            setSaveMsg({ type: "success", text: sheetId ? "Tracker sheet updated!" : "Tracker sheet saved!" });
////        } catch (err) {
////            setSaveMsg({ type: "error", text: err.message });
////        } finally {
////            setSaving(false);
////        }
////    };
////
////    const totalSqft = rows.reduce((s, r) => s + (parseFloat(r.sqft) || 0), 0);
////
////    const filtered = projects.filter(p =>
////        p.projectName?.toLowerCase().includes(search.toLowerCase()) ||
////        p.projectCode?.toLowerCase().includes(search.toLowerCase())
////    );
////
////    const sectionColors = {
////        DCNO:         { bg: "#FDFDE7", hdr: "#F9E79F", text: "#7D6608" },
////        STATUS:       { bg: "#FDEDEC", hdr: "#F1948A", text: "#922B21" },
////        SUPPLY:       { bg: "#EBF5FB", hdr: "#AED6F1", text: "#1A5276" },
////        INSTALLATION: { bg: "#E9F7EF", hdr: "#A9DFBF", text: "#1E8449" },
////        HARDWARE:     { bg: "#FEF9E7", hdr: "#FAD7A0", text: "#784212" },
////    };
////
////    const LEFT_COLS = [
////        { key: "srNo",     label: "SR NO.",    w: 55,  auto: true },
////        { key: "flat",     label: "FLAT",      w: 70,  auto: true },
////        { key: "location", label: "LOCATION",  w: 140, auto: true },
////        { key: "wcode",    label: "WCODE",     w: 90,  auto: true },
////        { key: "typology", label: "TYPOLOGY",  w: 200, auto: true },
////        { key: "series",   label: "SERIES",    w: 80,  auto: true },
////        { key: "woLnt",    label: "WO LNT",    w: 75,  auto: true },
////        { key: "woHgt",    label: "WO HGT",    w: 75,  auto: true },
////        { key: "sqft",     label: "SQ FT.",    w: 80,  auto: true },
////        { key: "length",   label: "LENGTH",    w: 80  },
////        { key: "height",   label: "HEIGHT",    w: 80  },
////        { key: "jobCard",  label: "JOB CARD",  w: 100 },
////    ];
////
////    // ── Selection screen ──────────────────────────────────────────────────────
////    if (step === "project" || step === "wo") {
////        return (
////            <div style={css.page}>
////                <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
////                <div style={css.pageHeader}>
////                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
////                        <div style={css.headerIcon}><FaLayerGroup /></div>
////                        <div>
////                            <h1 style={css.pageTitle}>Project Tracker</h1>
////                            <p style={css.pageSubtitle}>Select project → work order → fill tracker data</p>
////                        </div>
////                    </div>
////                </div>
////
////                <div style={css.selectionPanels}>
////                    {/* Projects */}
////                    <div style={css.selPanel}>
////                        <div style={css.selPanelHeader}>
////                            <FaBuilding style={{ color: "#0ea5e9", marginRight: 8 }} />
////                            <span style={{ fontWeight: 700, fontSize: 14 }}>Projects ({filtered.length})</span>
////                        </div>
////                        <div style={css.searchBox}>
////                            <FaSearch style={{ color: "#94a3b8", fontSize: 12 }} />
////                            <input style={css.searchInput} placeholder="Search…"
////                                value={search} onChange={e => setSearch(e.target.value)} />
////                        </div>
////                        <div style={css.selList}>
////                            {loadingProjects ? (
////                                <div style={css.centerMsg}><FaSpinner style={{ animation: "spin 1s linear infinite" }} />&nbsp;Loading…</div>
////                            ) : filtered.map(p => (
////                                <div
////                                    key={p.projectId}
////                                    style={{ ...css.selItem, ...(selectedProject?.projectId === p.projectId ? css.selItemActive : {}) }}
////                                    onClick={() => handleSelectProject(p)}
////                                >
////                                    <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>{p.projectName}</div>
////                                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{p.projectCode}</div>
////                                </div>
////                            ))}
////                        </div>
////                    </div>
////
////                    {/* Work Orders */}
////                    <div style={css.selPanel}>
////                        <div style={css.selPanelHeader}>
////                            <FaClipboardList style={{ color: "#8b5cf6", marginRight: 8 }} />
////                            <span style={{ fontWeight: 700, fontSize: 14 }}>
////                                Work Orders {selectedProject ? `(${workOrders.length})` : ""}
////                            </span>
////                        </div>
////                        <div style={css.selList}>
////                            {!selectedProject ? (
////                                <div style={css.centerMsg}>Select a project first</div>
////                            ) : loadingWOs ? (
////                                <div style={css.centerMsg}><FaSpinner style={{ animation: "spin 1s linear infinite" }} />&nbsp;Loading…</div>
////                            ) : workOrders.length === 0 ? (
////                                <div style={css.centerMsg}>No work orders found</div>
////                            ) : workOrders.map(wo => (
////                                <div
////                                    key={wo.id}
////                                    style={{ ...css.selItem, ...(selectedWO?.id === wo.id ? css.selItemActive : {}) }}
////                                    onClick={() => handleSelectWO(wo)}
////                                >
////                                    <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>{wo.workOrderNo}</div>
////                                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
////                                        {wo.towerName && <span style={css.towerBadge}>{wo.towerName}</span>}
////                                        &nbsp;{wo.items?.length || 0} items
////                                    </div>
////                                </div>
////                            ))}
////                        </div>
////                    </div>
////                </div>
////
////                {loadingRows && (
////                    <div style={css.centerMsg}>
////                        <FaSpinner style={{ animation: "spin 1s linear infinite", marginRight: 8 }} />
////                        Building tracker rows…
////                    </div>
////                )}
////            </div>
////        );
////    }
////
////    // ── Tracker form ──────────────────────────────────────────────────────────
////    return (
////        <div style={css.page}>
////            <style>{`
////                @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
////                .tr-row:hover { background: #f8fafc !important; }
////                .tr-cell:focus { border-color: #0284c7 !important; outline: none; }
////                .save-btn:hover:not(:disabled) { background: #047857 !important; transform: translateY(-1px); }
////                .dl-btn:hover { background: #15803d !important; transform: translateY(-1px); }
////                input[type=number]::-webkit-inner-spin-button,
////                input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
////                input[type=number] { -moz-appearance: textfield; }
////            `}</style>
////
////            {/* Header */}
////            <div style={css.pageHeader}>
////                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
////                    <button style={css.backBtn} onClick={() => {
////                        setStep("project"); setSelectedProject(null);
////                        setSelectedWO(null); setRows([]); setSheetId(null);
////                    }}>
////                        <FaRegArrowAltCircleLeft /> Back to Selection
////                    </button>
////                    <h1 style={css.pageTitle}>Production Tracker</h1>
////                    <div style={css.metaLine}>
////                        <span style={css.projBadge}>{selectedProject?.projectName}</span>
////                        <span style={css.woBadge}>{selectedWO?.workOrderNo}</span>
////                        {selectedWO?.towerName && <span style={css.towerBadge}>{selectedWO.towerName}</span>}
////                        <span style={{ fontSize: 12, color: "#64748b" }}>{rows.length} rows</span>
////                        {sheetId && <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 600 }}>✓ Saved</span>}
////                    </div>
////                </div>
////
////                <div style={{ display: "flex", gap: 10 }}>
////                    <button
////                        className="save-btn"
////                        style={css.saveBtn}
////                        onClick={handleSave}
////                        disabled={saving}
////                    >
////                        {saving ? <FaSpinner style={{ animation: "spin 1s linear infinite" }} /> : <FaSave style={{ fontSize: 14 }} />}
////                        <span>{saving ? "Saving…" : sheetId ? "Update" : "Save"}</span>
////                    </button>
////                    <button
////                        className="dl-btn"
////                        style={css.excelBtn}
////                        onClick={() => exportExcel(rows, selectedProject?.projectName, selectedWO?.workOrderNo, selectedWO?.towerName)}
////                    >
////                        <FaFileExcel style={{ fontSize: 15 }} />
////                        <span>Download Excel</span>
////                    </button>
////                </div>
////            </div>
////
////            {saveMsg && (
////                <div style={{ ...css.toast, ...(saveMsg.type === "success" ? css.toastOk : css.toastErr) }}>
////                    {saveMsg.type === "success" ? <FaCheckCircle /> : <FaExclamationTriangle />}
////                    &nbsp;{saveMsg.text}
////                </div>
////            )}
////
////            {/* Table */}
////            <div style={css.tableCard}>
////                <div style={{ overflowX: "auto" }}>
////                    <table style={{ borderCollapse: "collapse", fontSize: 11, whiteSpace: "nowrap" }}>
////                        <thead>
////                            {/* Row 1: Section group headers */}
////                            <tr>
////                                {LEFT_COLS.map(col => (
////                                    <th key={col.key} rowSpan={2}
////                                        style={{ ...css.th, minWidth: col.w, background: "#1e293b", color: "#f8fafc", verticalAlign: "middle" }}>
////                                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
////                                            <span>{col.label}</span>
////                                            {col.auto && <span style={{ fontSize: 8, color: "#a5b4fc", fontWeight: 700 }}>AUTO</span>}
////                                        </div>
////                                    </th>
////                                ))}
////                                {ALL_SECTIONS.map(sec => (
////                                    <th key={sec}
////                                        colSpan={SECTION_SUB_COLS[sec].length}
////                                        style={{
////                                            ...css.th,
////                                            background: sectionColors[sec].hdr,
////                                            color: sectionColors[sec].text,
////                                            textAlign: "center",
////                                            fontWeight: 800,
////                                            fontSize: 12,
////                                            letterSpacing: "0.05em",
////                                        }}>
////                                        {sec === "DCNO" ? "DC.NO" : sec}
////                                    </th>
////                                ))}
////                                <th rowSpan={2} style={{ ...css.th, minWidth: 110, background: "#334155", color: "#f8fafc" }}>
////                                    HANDOVER STATUS
////                                </th>
////                            </tr>
////
////                            {/* Row 2: Sub-column headers */}
////                            <tr>
////                                {ALL_SECTIONS.map(sec =>
////                                    SECTION_SUB_COLS[sec].map(sub => (
////                                        <th key={`${sec}_${sub}`}
////                                            style={{
////                                                ...css.th,
////                                                minWidth: 100,
////                                                background: sectionColors[sec].bg,
////                                                color: sectionColors[sec].text,
////                                                fontSize: 10,
////                                                fontWeight: 700,
////                                                textAlign: "center",
////                                                whiteSpace: "normal",
////                                                lineHeight: 1.2,
////                                                padding: "6px 6px",
////                                            }}>
////                                            {sub}
////                                        </th>
////                                    ))
////                                )}
////                            </tr>
////                        </thead>
////
////                        <tbody>
////                            {rows.map((row, idx) => (
////                                <tr key={row._id} className="tr-row"
////                                    style={{ background: idx % 2 === 0 ? "#fff" : "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
////
////                                    {/* Left auto/editable cols */}
////                                    {LEFT_COLS.map(col => (
////                                        <td key={col.key} style={css.td}>
////                                            {col.auto ? (
////                                                <div style={css.autoCell}>
////                                                    {col.key === "sqft" && row[col.key]
////                                                        ? parseFloat(row[col.key]).toFixed(2)
////                                                        : row[col.key] || "—"}
////                                                </div>
////                                            ) : (
////                                                <input
////                                                    className="tr-cell"
////                                                    style={{ ...css.cell, width: col.w - 16 }}
////                                                    value={row[col.key]}
////                                                    onChange={e => updateRow(row._id, col.key, e.target.value)}
////                                                    placeholder={col.key === "jobCard" ? "e.g. 208-01" : ""}
////                                                />
////                                            )}
////                                        </td>
////                                    ))}
////
////                                    {/* Section sub-cols */}
////                                    {ALL_SECTIONS.map(sec =>
////                                        SECTION_SUB_COLS[sec].map(sub => {
////                                            const fkey = `${sec}__${sub}`;
////                                            return (
////                                                <td key={fkey}
////                                                    style={{ ...css.td, background: idx % 2 === 0 ? sectionColors[sec].bg : `${sectionColors[sec].hdr}55` }}>
////                                                    <input
////                                                        className="tr-cell"
////                                                        style={{ ...css.cell, width: 84, textAlign: "right" }}
////                                                        type="number"
////                                                        value={row[fkey]}
////                                                        onChange={e => updateRow(row._id, fkey, e.target.value)}
////                                                        placeholder="0.00"
////                                                    />
////                                                </td>
////                                            );
////                                        })
////                                    )}
////
////                                    {/* Handover status */}
////                                    <td style={css.td}>
////                                        <input
////                                            className="tr-cell"
////                                            style={{ ...css.cell, width: 94 }}
////                                            value={row.handoverStatus || ""}
////                                            onChange={e => updateRow(row._id, "handoverStatus", e.target.value)}
////                                            placeholder="Status"
////                                        />
////                                    </td>
////                                </tr>
////                            ))}
////                        </tbody>
////
////                        <tfoot>
////                            <tr style={{ background: "#f1f5f9", borderTop: "2px solid #cbd5e1" }}>
////                                <td colSpan={9} style={{ padding: "10px 14px", fontWeight: 800, fontSize: 12, color: "#1e293b" }}>
////                                    TOTAL &nbsp;
////                                    <span style={{ color: "#0284c7" }}>Sqft: {totalSqft.toFixed(2)}</span>
////                                </td>
////                                <td colSpan={3} />
////                                {ALL_SECTIONS.map(sec =>
////                                    SECTION_SUB_COLS[sec].map(sub => {
////                                        const fkey = `${sec}__${sub}`;
////                                        const total = rows.reduce((s, r) => s + (parseFloat(r[fkey]) || 0), 0);
////                                        return (
////                                            <td key={fkey}
////                                                style={{ padding: "10px 6px", textAlign: "right", fontWeight: 700, fontSize: 11, color: sectionColors[sec].text }}>
////                                                {total > 0 ? total.toFixed(2) : ""}
////                                            </td>
////                                        );
////                                    })
////                                )}
////                                <td />
////                            </tr>
////                        </tfoot>
////                    </table>
////                </div>
////            </div>
////
////            {/* Summary strip */}
////            <div style={css.summaryStrip}>
////                {[
////                    { label: "Project",    val: selectedProject?.projectName || "—", color: "#1e293b" },
////                    { label: "Work Order", val: selectedWO?.workOrderNo || "—",       color: "#0284c7" },
////                    { label: "Tower",      val: selectedWO?.towerName   || "—",       color: "#d97706" },
////                    { label: "Total Rows", val: rows.length,                          color: "#475569" },
////                    { label: "Total Sqft", val: totalSqft.toFixed(2),                color: "#0284c7" },
////                    { label: "DB Status",  val: sheetId ? "Saved" : "Not saved",      color: sheetId ? "#16a34a" : "#94a3b8" },
////                ].map(s => (
////                    <div key={s.label} style={css.summaryItem}>
////                        <span style={css.summaryLabel}>{s.label}</span>
////                        <span style={{ fontSize: 14, fontWeight: 800, color: s.color }}>{s.val}</span>
////                    </div>
////                ))}
////            </div>
////        </div>
////    );
////}
////
////// ── Styles ────────────────────────────────────────────────────────────────────
////const css = {
////    page:            { maxWidth: 1600, margin: "0 auto", padding: "0 4px 56px", fontFamily: "'Inter',-apple-system,sans-serif" },
////    pageHeader:      { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, padding: "28px 0 20px", flexWrap: "wrap" },
////    headerIcon:      { width: 44, height: 44, background: "linear-gradient(135deg,#f59e0b,#d97706)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 20 },
////    pageTitle:       { margin: 0, fontSize: 22, fontWeight: 800, color: "#0f172a" },
////    pageSubtitle:    { margin: "3px 0 0", fontSize: 13, color: "#64748b" },
////    backBtn:         { background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 13, color: "#64748b", fontWeight: 500, display: "flex", alignItems: "center", gap: 6, marginBottom: 4 },
////    metaLine:        { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 4 },
////    projBadge:       { background: "#e0f2fe", color: "#0284c7", fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 12 },
////    woBadge:         { background: "#ede9fe", color: "#7c3aed", fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 12 },
////    towerBadge:      { background: "#fef3c7", color: "#92400e", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 10, border: "1px solid #fde68a" },
////    saveBtn:         { display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "#10b981", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13, transition: "all 0.2s" },
////    excelBtn:        { display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13, transition: "all 0.2s" },
////    toast:           { display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500, marginBottom: 16, border: "1px solid" },
////    toastOk:         { background: "#ecfdf5", color: "#047857", borderColor: "#a7f3d0" },
////    toastErr:        { background: "#fef2f2", color: "#b91c1c", borderColor: "#fecaca" },
////    tableCard:       { background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 1px 6px rgba(0,0,0,0.04)", marginBottom: 20, overflow: "hidden" },
////    th:              { padding: "10px 8px", fontWeight: 700, textAlign: "left", fontSize: 11, borderRight: "1px solid rgba(255,255,255,0.15)", verticalAlign: "middle", whiteSpace: "nowrap" },
////    td:              { padding: "4px 5px", verticalAlign: "middle" },
////    cell:            { padding: "5px 7px", border: "1px solid #cbd5e1", borderRadius: 4, fontSize: 11, color: "#0f172a", background: "#fff", outline: "none" },
////    autoCell:        { padding: "5px 8px", background: "#f1f5f9", borderRadius: 4, fontSize: 11, color: "#475569", fontWeight: 500, border: "1px solid #e2e8f0", minWidth: 40, textAlign: "right" },
////    summaryStrip:    { display: "flex", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" },
////    summaryItem:     { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "14px 10px", borderRight: "1px solid #e2e8f0" },
////    summaryLabel:    { fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 },
////    selectionPanels: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 },
////    selPanel:        { background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 2px 6px rgba(0,0,0,0.04)" },
////    selPanelHeader:  { display: "flex", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid #f1f5f9", background: "#fafbfc" },
////    searchBox:       { display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" },
////    searchInput:     { border: "none", background: "transparent", outline: "none", fontSize: 13, flex: 1 },
////    selList:         { maxHeight: 320, overflowY: "auto" },
////    selItem:         { padding: "12px 18px", cursor: "pointer", borderBottom: "1px solid #f8fafc", borderLeft: "3px solid transparent", transition: "all 0.15s" },
////    selItemActive:   { background: "#eff6ff", borderLeft: "3px solid #0284c7" },
////    centerMsg:       { padding: "30px", textAlign: "center", color: "#94a3b8", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
////};
//
//
//
//
//import React, { useState, useEffect } from "react";
//import { useNavigate } from "react-router-dom";
//import {
//    FaLayerGroup, FaSearch, FaBuilding, FaClipboardList,
//    FaSpinner, FaFileExcel, FaSave,
//    FaCheckCircle, FaExclamationTriangle, FaRegArrowAltCircleLeft
//} from "react-icons/fa";
//import * as XLSX from "xlsx-js-style";
//
//// ── Column definitions ────────────────────────────────────────────────────────
//const SUB_COLS = [
//    "FRAME", "DOOR FRAME", "SHUTTER", "OPENABLE DOOR", "FIX GLASS", "TOP / BOTTOM FIX",
//];
//
//const DCNO_SUB_COLS = [
//    "FRAME", "DOOR FRAME", "SHUTTER", "OPENABLE DOOR", "FIX GLASS", "TOP / BOTTOM FIX",
//];
//
//// STATUS has 6 sub-cols (HARDWARE dropped, TOP/BOTTOM FIX kept)
//const STATUS_SUB_COLS = [
//    "FRAME", "DOOR FRAME", "SHUTTER", "OPENABLE DOOR", "FIX GLASS", "TOP / BOTTOM FIX",
//];
//
//// All 5 sections in order
//// HARDWARE section dropped entirely
//const ALL_SECTIONS = ["DCNO", "STATUS", "SUPPLY", "INSTALLATION"];
//
//const SECTION_SUB_COLS = {
//    DCNO:         DCNO_SUB_COLS,
//    STATUS:       STATUS_SUB_COLS,
//    SUPPLY:       SUB_COLS,
//    INSTALLATION: SUB_COLS,
//};
//
//// DB key prefixes
//const DB_PREFIX = {
//    DCNO: "dcno", STATUS: "status",
//    SUPPLY: "supply", INSTALLATION: "install",
//};
//
//// Sub-col → camelCase suffix
//const SUB_SUFFIX = {
//    "FRAME":           "Frame",
//    "DOOR FRAME":      "DoorFrame",
//    "SHUTTER":         "Shutter",
//    "OPENABLE DOOR":   "OpenableDoor",
//    "FIX GLASS":       "FixGlass",
//    "TOP / BOTTOM FIX":"TopBottomFix",
//    "HARDWARE":        "Hardware",
//};
//
//// ── Empty tracker row ─────────────────────────────────────────────────────────
//const emptyTrackerRow = (srNo = "", flat = "", woItem = null) => {
//    const base = {
//        _id:      Date.now() + Math.random(),
//        srNo,
//        flat,
//        location:  woItem?.location   || "",
//        wcode:     woItem?.windowCode  || "",
//        typology:  woItem?.typology    || "",
//        series:    woItem?.series      || "",
//        woLnt:     woItem?.length      || "",
//        woHgt:     woItem?.height      || "",
//        sqft:      woItem?.sqft        || "",
//        length:    "",
//        height:    "",
//        jobCard:   "",
//        handoverStatus: "",
//    };
//    ALL_SECTIONS.forEach(sec => {
//        SECTION_SUB_COLS[sec].forEach(sub => {
//            base[`${sec}__${sub}`] = "";
//        });
//    });
//    return base;
//};
//
//// ── Excel export ──────────────────────────────────────────────────────────────
//function exportExcel(rows, projectName, workOrderNo, towerName) {
//    const wb = XLSX.utils.book_new();
//    const ws = XLSX.utils.json_to_sheet([]);
//
//    const setS = (ref, s) => {
//        if (!ws[ref]) ws[ref] = { t: "z", v: "" };
//        ws[ref].s = s;
//    };
//
//    // Column order:
//    // 0-11:  SR NO, FLAT, LOCATION, WCODE, TYPOLOGY, SERIES, WO LNT, WO HGT, SQ FT, LENGTH, HEIGHT, JOB CARD
//    // 12-17: DCNO (6)
//    // 18-23: STATUS (6) — HARDWARE dropped, TOP/BOTTOM FIX kept
//    // 24-29: SUPPLY (6)
//    // 30-35: INSTALLATION (6)
//    // 36:    HANDOVER STATUS
//    const totalCols = 37;
//
//    // Build column letter array (A..AR for 44 cols)
//    const colLetters = [];
//    for (let i = 0; i < totalCols; i++) {
//        if (i < 26) colLetters.push(String.fromCharCode(65 + i));
//        else colLetters.push(
//            String.fromCharCode(64 + Math.floor(i / 26)) +
//            String.fromCharCode(65 + (i % 26))
//        );
//    }
//
//    // ── Totals ────────────────────────────────────────────────────────────────
//    const totalSqft = rows.reduce((s, r) => s + (parseFloat(r.sqft) || 0), 0);
//
//    // ── Row 1: Project / WO title ─────────────────────────────────────────────
//    XLSX.utils.sheet_add_aoa(ws,
//        [[`PROJECT: ${projectName || "—"}   |   WO: ${workOrderNo || "—"}   |   Tower: ${towerName || "—"}`]],
//        { origin: "A1" }
//    );
//
//    // ── Row 2: Section group headers ──────────────────────────────────────────
//    const row2 = new Array(totalCols).fill("");
//    row2[12] = "DC.NO";
//    row2[18] = "STATUS";
//    row2[24] = "SUPPLY";
//    row2[30] = "INSTALLATION";
//    XLSX.utils.sheet_add_aoa(ws, [row2], { origin: "A2" });
//
//    // ── Row 3: Sub-headers ────────────────────────────────────────────────────
//    const row3 = [
//        "SR NO.", "FLAT", "LOCATION", "WCODE", "TYPOLOGY", "SERIES",
//        "WO LNT", "WO HGT", "SQ FT.", "LENGTH", "HEIGHT", "JOB CARD",
//        ...DCNO_SUB_COLS,      // 6 cols (12-17)
//        ...STATUS_SUB_COLS,    // 6 cols (18-23)
//        ...SUB_COLS,           // SUPPLY 6 cols (24-29)
//        ...SUB_COLS,           // INSTALLATION 6 cols (30-35)
//        "HANDOVER STATUS",     // col 36
//    ];
//    XLSX.utils.sheet_add_aoa(ws, [row3], { origin: "A3" });
//
//    // ── Rows 4+: Data ─────────────────────────────────────────────────────────
//    const dataRows = rows.map(r => [
//        r.srNo || "", r.flat || "", r.location || "", r.wcode || "",
//        r.typology || "", r.series || "",
//        r.woLnt !== "" ? Number(r.woLnt) : "",
//        r.woHgt !== "" ? Number(r.woHgt) : "",
//        r.sqft  !== "" ? parseFloat(parseFloat(r.sqft).toFixed(2)) : "",
//        r.length !== "" ? Number(r.length) : "",
//        r.height !== "" ? Number(r.height) : "",
//        r.jobCard || "",
//        // DCNO
//        ...DCNO_SUB_COLS.map(sub => r[`DCNO__${sub}`] !== "" ? parseFloat(r[`DCNO__${sub}`] || 0) : ""),
//        // STATUS
//        ...STATUS_SUB_COLS.map(sub => r[`STATUS__${sub}`] !== "" ? parseFloat(r[`STATUS__${sub}`] || 0) : ""),
//        // SUPPLY
//        ...SUB_COLS.map(sub => r[`SUPPLY__${sub}`] !== "" ? parseFloat(r[`SUPPLY__${sub}`] || 0) : ""),
//        // INSTALLATION
//        ...SUB_COLS.map(sub => r[`INSTALLATION__${sub}`] !== "" ? parseFloat(r[`INSTALLATION__${sub}`] || 0) : ""),
//        r.handoverStatus || "",
//    ]);
//    XLSX.utils.sheet_add_aoa(ws, dataRows, { origin: "A4" });
//
//    // ── Total row ─────────────────────────────────────────────────────────────
//    const totalR = 4 + rows.length;
//    const totalRow = new Array(totalCols).fill("");
//    totalRow[0] = "TOTAL";
//    totalRow[8] = parseFloat(totalSqft.toFixed(2));
//    let ci = 12;
//    ALL_SECTIONS.forEach(sec => {
//        SECTION_SUB_COLS[sec].forEach(sub => {
//            totalRow[ci++] = rows.reduce((s, r) => s + (parseFloat(r[`${sec}__${sub}`]) || 0), 0);
//        });
//    });
//    XLSX.utils.sheet_add_aoa(ws, [totalRow], { origin: `A${totalR}` });
//
//    // ── Merges ────────────────────────────────────────────────────────────────
//    const r0 = (row) => row - 1;
//    ws["!merges"] = [
//        { s: { r: r0(1), c: 0  }, e: { r: r0(1), c: totalCols - 1 } }, // Row 1 full
//        ...Array.from({ length: 12 }, (_, i) => ({ s: { r: r0(2), c: i }, e: { r: r0(3), c: i } })), // A-L 2-row span
//        { s: { r: r0(2), c: 12 }, e: { r: r0(2), c: 17 } }, // DC.NO (6)
//        { s: { r: r0(2), c: 18 }, e: { r: r0(2), c: 23 } }, // STATUS (6)
//        { s: { r: r0(2), c: 24 }, e: { r: r0(2), c: 29 } }, // SUPPLY (6)
//        { s: { r: r0(2), c: 30 }, e: { r: r0(2), c: 35 } }, // INSTALLATION (6)
//        { s: { r: r0(2), c: 36 }, e: { r: r0(3), c: 36 } }, // HANDOVER 2-row span
//    ];
//
//    // ── Column widths ─────────────────────────────────────────────────────────
//    ws["!cols"] = [
//        { wch: 7  }, { wch: 8  }, { wch: 20 }, { wch: 10 }, { wch: 30 }, { wch: 8  },
//        { wch: 8  }, { wch: 8  }, { wch: 9  }, { wch: 8  }, { wch: 8  }, { wch: 12 },
//        ...Array(6).fill({ wch: 13 }),  // DCNO (6)
//        ...Array(6).fill({ wch: 13 }),  // STATUS (6)
//        ...Array(6).fill({ wch: 13 }),  // SUPPLY (6)
//        ...Array(6).fill({ wch: 13 }),  // INSTALLATION (6)
//        { wch: 14 },                    // HANDOVER
//    ];
//    ws["!rows"] = [{ hpt: 22 }, { hpt: 20 }, { hpt: 32 }];
//
//    // ── Style helpers ─────────────────────────────────────────────────────────
//    const bdr = (rgb, style = "thin") => ({ style, color: { rgb } });
//    const allBdr = (rgb) => ({ top: bdr(rgb), bottom: bdr(rgb), left: bdr(rgb), right: bdr(rgb) });
//
//    // Row 1 — title
//    setS("A1", {
//        font:      { bold: true, sz: 13, name: "Calibri", color: { rgb: "1A2940" } },
//        alignment: { horizontal: "center", vertical: "center" },
//        fill:      { patternType: "solid", fgColor: { rgb: "EEF2F7" } },
//        border:    { bottom: bdr("A0B0C8", "medium") },
//    });
//
//    // Section group header colors
//    const secHdr = {
//        base:         { fill: "D6E4F0", text: "1A2940" },
//        DCNO:         { fill: "FCF3CF", text: "7D6608" },
//        STATUS:       { fill: "FADBD8", text: "922B21" },
//        SUPPLY:       { fill: "D6EAF8", text: "1A5276" },
//        INSTALLATION: { fill: "D5F5E3", text: "1E8449" },
//    };
//    const secSub = {
//        base:         "BDD7EE",
//        DCNO:         "F9E79F",
//        STATUS:       "F1948A",
//        SUPPLY:       "AED6F1",
//        INSTALLATION: "A9DFBF",
//    };
//
//    const getSecForCol = (ci) => {
//        if (ci >= 12 && ci <= 17) return "DCNO";
//        if (ci >= 18 && ci <= 23) return "STATUS";
//        if (ci >= 24 && ci <= 29) return "SUPPLY";
//        if (ci >= 30 && ci <= 35) return "INSTALLATION";
//        return "base";
//    };
//
//    // Row 2 group headers
//    colLetters.forEach((col, i) => {
//        const sec = getSecForCol(i);
//        const c   = secHdr[sec];
//        setS(`${col}2`, {
//            font:      { bold: true, sz: 9, name: "Calibri", color: { rgb: c.text } },
//            alignment: { horizontal: "center", vertical: "center", wrapText: true },
//            fill:      { patternType: "solid", fgColor: { rgb: c.fill } },
//            border:    allBdr("A8C4DC"),
//        });
//    });
//
//    // Row 3 sub-headers
//    colLetters.forEach((col, i) => {
//        const sec = getSecForCol(i);
//        setS(`${col}3`, {
//            font:      { bold: true, sz: 8, name: "Calibri", color: { rgb: "000000" } },
//            alignment: { horizontal: "center", vertical: "center", wrapText: true },
//            fill:      { patternType: "solid", fgColor: { rgb: secSub[sec] } },
//            border:    allBdr("A8C4DC"),
//        });
//    });
//
//    // Data rows
//    const dataTint = {
//        base:         ["F0F4F8", "FFFFFF"],
//        DCNO:         ["FDFDE7", "FEFEF5"],
//        STATUS:       ["FDEDEC", "FEF5F5"],
//        SUPPLY:       ["EBF5FB", "F8FCFE"],
//        INSTALLATION: ["E9F7EF", "F4FCF7"],
//    };
//
//    dataRows.forEach((_, ri) => {
//        const excelR = ri + 4;
//        const isOdd  = ri % 2 === 1;
//        colLetters.forEach((col, i) => {
//            const sec    = getSecForCol(i);
//            const colors = dataTint[sec];
//            setS(`${col}${excelR}`, {
//                font:      { sz: 9, name: "Calibri", color: { rgb: "1A2940" } },
//                alignment: { horizontal: i >= 6 ? "right" : i <= 1 ? "center" : "left", vertical: "center" },
//                fill:      { patternType: "solid", fgColor: { rgb: isOdd ? colors[0] : colors[1] } },
//                border:    allBdr("D8E2EC"),
//            });
//        });
//    });
//
//    // Total row
//    colLetters.forEach((col, i) => {
//        setS(`${col}${totalR}`, {
//            font:      { bold: true, sz: 9, name: "Calibri", color: { rgb: "1A2940" } },
//            alignment: { horizontal: i >= 6 ? "right" : "center", vertical: "center" },
//            fill:      { patternType: "solid", fgColor: { rgb: "D9D9D9" } },
//            border:    {
//                top:    bdr("888888", "medium"),
//                bottom: bdr("888888", "medium"),
//                left:   bdr("AAAAAA"),
//                right:  bdr("AAAAAA"),
//            },
//        });
//    });
//
//    XLSX.utils.book_append_sheet(wb, ws, "Tracker");
//    XLSX.writeFile(wb, `Tracker_${projectName || "export"}_${workOrderNo || ""}.xlsx`);
//}
//
//// ─────────────────────────────────────────────────────────────────────────────
//export default function TrackerFormPage() {
//    const navigate = useNavigate();
//
//    const [projects,        setProjects]       = useState([]);
//    const [selectedProject, setSelectedProject] = useState(null);
//    const [workOrders,      setWorkOrders]      = useState([]);
//    const [selectedWO,      setSelectedWO]      = useState(null);
//    const [search,          setSearch]          = useState("");
//    const [loadingProjects, setLoadingProjects]  = useState(true);
//    const [loadingWOs,      setLoadingWOs]       = useState(false);
//    const [loadingRows,     setLoadingRows]      = useState(false);
//    const [rows,            setRows]            = useState([]);
//    const [saveMsg,         setSaveMsg]         = useState(null);
//    const [saving,          setSaving]          = useState(false);
//    const [sheetId,         setSheetId]         = useState(null);
//    const [step,            setStep]            = useState("project");
//
//    // Load projects
//    useEffect(() => {
//        fetch(`${process.env.REACT_APP_API_URL}/projects`)
//            .then(r => r.json())
//            .then(data => { setProjects(data); setLoadingProjects(false); })
//            .catch(() => setLoadingProjects(false));
//    }, []);
//
//    const handleSelectProject = async (project) => {
//        setSelectedProject(project);
//        setSelectedWO(null);
//        setRows([]);
//        setSheetId(null);
//        setStep("wo");
//        setLoadingWOs(true);
//        try {
//            const res  = await fetch(
//                `${process.env.REACT_APP_API_URL}/api/work-orders/by-project/${encodeURIComponent(project.projectName)}`
//            );
//            const data = await res.json();
//            setWorkOrders(Array.isArray(data) ? data : []);
//        } catch {
//            setWorkOrders([]);
//        } finally {
//            setLoadingWOs(false);
//        }
//    };
//
//    const handleSelectWO = async (wo) => {
//        setSelectedWO(wo);
//        setLoadingRows(true);
//        setRows([]);
//        setSheetId(null);
//        setSaveMsg(null);
//        try {
//            // Fetch info sheets to get flat numbers
//            const sheetRes = await fetch(
//                `${process.env.REACT_APP_API_URL}/api/info-sheets/by-work-order/${wo.id}`
//            );
//            const sheets   = await sheetRes.json();
//            const sheet    = Array.isArray(sheets) && sheets.length > 0 ? sheets[0] : null;
//            const flatList = sheet
//                ? (sheet.flats || []).map(f => ({ flatNo: f.flatNo, items: f.items || [] }))
//                : [];
//            const woItems  = wo.items || [];
//
//            // Build tracker rows
//            const trackerRows = [];
//            let srNo = 1;
//            if (flatList.length > 0) {
//                flatList.forEach(flat => {
//                    (flat.items || []).forEach(sheetItem => {
//                        const woItem = woItems.find(w =>
//                            w.location   === sheetItem.location &&
//                            w.windowCode === sheetItem.windowCode &&
//                            w.typology   === sheetItem.typology
//                        ) || sheetItem;
//                        trackerRows.push(emptyTrackerRow(srNo++, flat.flatNo, woItem));
//                    });
//                });
//            } else {
//                woItems.forEach(item => trackerRows.push(emptyTrackerRow(srNo++, "", item)));
//            }
//
//            // Check if tracker sheet already exists — restore saved values
//            try {
//                const tsRes = await fetch(
//                    `${process.env.REACT_APP_API_URL}/api/tracker-sheets/by-work-order/${wo.id}`
//                );
//                if (tsRes.ok) {
//                    const tsData = await tsRes.json();
//                    setSheetId(tsData.id);
//                    if (tsData.rows && tsData.rows.length > 0) {
//                        const restored = trackerRows.map((row, idx) => {
//                            const saved = tsData.rows[idx];
//                            if (!saved) return row;
//                            const r = { ...row };
//                            r.length         = saved.length         ?? "";
//                            r.height         = saved.height         ?? "";
//                            r.jobCard        = saved.jobCard        || "";
//                            r.handoverStatus = saved.handoverStatus || "";
//                            ALL_SECTIONS.forEach(sec => {
//                                const prefix = DB_PREFIX[sec];
//                                SECTION_SUB_COLS[sec].forEach(sub => {
//                                    const fkey  = `${sec}__${sub}`;
//                                    const dbKey = `${prefix}${SUB_SUFFIX[sub]}`;
//                                    // STATUS fields are strings (R/I), others are numeric
//                                    if (sec === "STATUS") {
//                                        r[fkey] = saved[dbKey] || "";
//                                    } else {
//                                        r[fkey] = saved[dbKey] ?? "";
//                                    }
//                                });
//                            });
//                            return r;
//                        });
//                        setRows(restored);
//                    } else {
//                        setRows(trackerRows);
//                    }
//                } else {
//                    setSheetId(null);
//                    setRows(trackerRows);
//                }
//            } catch {
//                setSheetId(null);
//                setRows(trackerRows);
//            }
//
//            setStep("tracker");
//        } catch {
//            setSaveMsg({ type: "error", text: "Failed to load work order data." });
//        } finally {
//            setLoadingRows(false);
//        }
//    };
//
//    const updateRow = (_id, field, value) =>
//        setRows(prev => prev.map(r => {
//            if (r._id !== _id) return r;
//            const updated = { ...r, [field]: value };
//
//            // ── STATUS → SUPPLY / INSTALLATION auto-fill logic ────────────────
//            // If field is a STATUS sub-col (STATUS__FRAME, STATUS__DOOR FRAME etc.)
//            if (field.startsWith("STATUS__")) {
//                const sub = field.replace("STATUS__", ""); // e.g. "FRAME"
//                const supplyKey  = `SUPPLY__${sub}`;
//                const installKey = `INSTALLATION__${sub}`;
//                const sqftVal    = parseFloat(r.sqft) || 0;
//                const v          = value.trim().toLowerCase();
//
//                if (v === "r") {
//                    // Fill SUPPLY with sqft, clear INSTALLATION
//                    updated[supplyKey]  = sqftVal.toFixed(4);
//                    updated[installKey] = "0";
//                } else if (v === "i") {
//                    // Fill INSTALLATION with sqft, clear SUPPLY
//                    updated[installKey] = sqftVal.toFixed(4);
//                    updated[supplyKey]  = "0";
//                } else {
//                    // Cleared — reset both to 0
//                    updated[supplyKey]  = "0";
//                    updated[installKey] = "0";
//                }
//            }
//
//            return updated;
//        }));
//
//    // Save to DB
//    const handleSave = async () => {
//        setSaving(true);
//        setSaveMsg(null);
//        const payload = {
//            workOrderId: selectedWO.id,
//            projectName: selectedProject?.projectName || "",
//            towerName:   selectedWO?.towerName        || "",
//            date:        new Date().toISOString().split("T")[0],
//            rows: rows.map(r => {
//                const row = {
//                    srNo: r.srNo, flat: r.flat, location: r.location,
//                    wcode: r.wcode, typology: r.typology, series: r.series,
//                    woLnt: r.woLnt || null, woHgt: r.woHgt || null, sqft: r.sqft || null,
//                    length: r.length || null, height: r.height || null,
//                    jobCard: r.jobCard || null,
//                    handoverStatus: r.handoverStatus || null,
//                };
//                ALL_SECTIONS.forEach(sec => {
//                    const prefix = DB_PREFIX[sec];
//                    SECTION_SUB_COLS[sec].forEach(sub => {
//                        const fkey  = `${sec}__${sub}`;
//                        const dbKey = `${prefix}${SUB_SUFFIX[sub]}`;
//                        row[dbKey]  = r[fkey] !== "" ? parseFloat(r[fkey]) || null : null;
//                    });
//                });
//                return row;
//            }),
//        };
//
//        try {
//            const url    = sheetId
//                ? `${process.env.REACT_APP_API_URL}/api/tracker-sheets/${sheetId}`
//                : `${process.env.REACT_APP_API_URL}/api/tracker-sheets`;
//            const method = sheetId ? "PUT" : "POST";
//            const res    = await fetch(url, {
//                method,
//                headers: { "Content-Type": "application/json" },
//                body:    JSON.stringify(payload),
//            });
//            const data = await res.json();
//            if (!res.ok) throw new Error(data.message || "Server error");
//            if (!sheetId) setSheetId(data.id);
//            setSaveMsg({ type: "success", text: sheetId ? "Tracker sheet updated!" : "Tracker sheet saved!" });
//        } catch (err) {
//            setSaveMsg({ type: "error", text: err.message });
//        } finally {
//            setSaving(false);
//        }
//    };
//
//    const totalSqft = rows.reduce((s, r) => s + (parseFloat(r.sqft) || 0), 0);
//
//    const filtered = projects.filter(p =>
//        p.projectName?.toLowerCase().includes(search.toLowerCase()) ||
//        p.projectCode?.toLowerCase().includes(search.toLowerCase())
//    );
//
//    const sectionColors = {
//        DCNO:         { bg: "#FDFDE7", hdr: "#F9E79F", text: "#7D6608" },
//        STATUS:       { bg: "#FDEDEC", hdr: "#F1948A", text: "#922B21" },
//        SUPPLY:       { bg: "#EBF5FB", hdr: "#AED6F1", text: "#1A5276" },
//        INSTALLATION: { bg: "#E9F7EF", hdr: "#A9DFBF", text: "#1E8449" },
//    };
//
//    const LEFT_COLS = [
//        { key: "srNo",     label: "SR NO.",    w: 55,  auto: true },
//        { key: "flat",     label: "FLAT",      w: 70,  auto: true },
//        { key: "location", label: "LOCATION",  w: 140, auto: true },
//        { key: "wcode",    label: "WCODE",     w: 90,  auto: true },
//        { key: "typology", label: "TYPOLOGY",  w: 200, auto: true },
//        { key: "series",   label: "SERIES",    w: 80,  auto: true },
//        { key: "woLnt",    label: "WO LNT",    w: 75,  auto: true },
//        { key: "woHgt",    label: "WO HGT",    w: 75,  auto: true },
//        { key: "sqft",     label: "SQ FT.",    w: 80,  auto: true },
//        { key: "length",   label: "LENGTH",    w: 80  },
//        { key: "height",   label: "HEIGHT",    w: 80  },
//        { key: "jobCard",  label: "JOB CARD",  w: 100 },
//    ];
//
//    // ── Selection screen ──────────────────────────────────────────────────────
//    if (step === "project" || step === "wo") {
//        return (
//            <div style={css.page}>
//                <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
//                <div style={css.pageHeader}>
//                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
//                        <div style={css.headerIcon}><FaLayerGroup /></div>
//                        <div>
//                            <h1 style={css.pageTitle}>Production Tracker</h1>
//                            <p style={css.pageSubtitle}>Select project → work order → fill tracker data</p>
//                        </div>
//                    </div>
//                </div>
//
//                <div style={css.selectionPanels}>
//                    {/* Projects */}
//                    <div style={css.selPanel}>
//                        <div style={css.selPanelHeader}>
//                            <FaBuilding style={{ color: "#0ea5e9", marginRight: 8 }} />
//                            <span style={{ fontWeight: 700, fontSize: 14 }}>Projects ({filtered.length})</span>
//                        </div>
//                        <div style={css.searchBox}>
//                            <FaSearch style={{ color: "#94a3b8", fontSize: 12 }} />
//                            <input style={css.searchInput} placeholder="Search…"
//                                value={search} onChange={e => setSearch(e.target.value)} />
//                        </div>
//                        <div style={css.selList}>
//                            {loadingProjects ? (
//                                <div style={css.centerMsg}><FaSpinner style={{ animation: "spin 1s linear infinite" }} />&nbsp;Loading…</div>
//                            ) : filtered.map(p => (
//                                <div
//                                    key={p.projectId}
//                                    style={{ ...css.selItem, ...(selectedProject?.projectId === p.projectId ? css.selItemActive : {}) }}
//                                    onClick={() => handleSelectProject(p)}
//                                >
//                                    <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>{p.projectName}</div>
//                                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{p.projectCode}</div>
//                                </div>
//                            ))}
//                        </div>
//                    </div>
//
//                    {/* Work Orders */}
//                    <div style={css.selPanel}>
//                        <div style={css.selPanelHeader}>
//                            <FaClipboardList style={{ color: "#8b5cf6", marginRight: 8 }} />
//                            <span style={{ fontWeight: 700, fontSize: 14 }}>
//                                Work Orders {selectedProject ? `(${workOrders.length})` : ""}
//                            </span>
//                        </div>
//                        <div style={css.selList}>
//                            {!selectedProject ? (
//                                <div style={css.centerMsg}>Select a project first</div>
//                            ) : loadingWOs ? (
//                                <div style={css.centerMsg}><FaSpinner style={{ animation: "spin 1s linear infinite" }} />&nbsp;Loading…</div>
//                            ) : workOrders.length === 0 ? (
//                                <div style={css.centerMsg}>No work orders found</div>
//                            ) : workOrders.map(wo => (
//                                <div
//                                    key={wo.id}
//                                    style={{ ...css.selItem, ...(selectedWO?.id === wo.id ? css.selItemActive : {}) }}
//                                    onClick={() => handleSelectWO(wo)}
//                                >
//                                    <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>{wo.workOrderNo}</div>
//                                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
//                                        {wo.towerName && <span style={css.towerBadge}>{wo.towerName}</span>}
//                                        &nbsp;{wo.items?.length || 0} items
//                                    </div>
//                                </div>
//                            ))}
//                        </div>
//                    </div>
//                </div>
//
//                {loadingRows && (
//                    <div style={css.centerMsg}>
//                        <FaSpinner style={{ animation: "spin 1s linear infinite", marginRight: 8 }} />
//                        Building tracker rows…
//                    </div>
//                )}
//            </div>
//        );
//    }
//
//    // ── Tracker form ──────────────────────────────────────────────────────────
//    return (
//        <div style={css.page}>
//            <style>{`
//                @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
//                .tr-row:hover { background: #f8fafc !important; }
//                .tr-cell:focus { border-color: #0284c7 !important; outline: none; }
//                .save-btn:hover:not(:disabled) { background: #047857 !important; transform: translateY(-1px); }
//                .dl-btn:hover { background: #15803d !important; transform: translateY(-1px); }
//                input[type=number]::-webkit-inner-spin-button,
//                input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
//                input[type=number] { -moz-appearance: textfield; }
//            `}</style>
//
//            {/* Header */}
//            <div style={css.pageHeader}>
//                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
//                    <button style={css.backBtn} onClick={() => {
//                        setStep("project"); setSelectedProject(null);
//                        setSelectedWO(null); setRows([]); setSheetId(null);
//                    }}>
//                        <FaRegArrowAltCircleLeft /> Back to Selection
//                    </button>
//                    <h1 style={css.pageTitle}>Production Tracker</h1>
//                    <div style={css.metaLine}>
//                        <span style={css.projBadge}>{selectedProject?.projectName}</span>
//                        <span style={css.woBadge}>{selectedWO?.workOrderNo}</span>
//                        {selectedWO?.towerName && <span style={css.towerBadge}>{selectedWO.towerName}</span>}
//                        <span style={{ fontSize: 12, color: "#64748b" }}>{rows.length} rows</span>
//                        {sheetId && <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 600 }}>✓ Saved</span>}
//                    </div>
//                </div>
//
//                <div style={{ display: "flex", gap: 10 }}>
//                    <button
//                        className="save-btn"
//                        style={css.saveBtn}
//                        onClick={handleSave}
//                        disabled={saving}
//                    >
//                        {saving ? <FaSpinner style={{ animation: "spin 1s linear infinite" }} /> : <FaSave style={{ fontSize: 14 }} />}
//                        <span>{saving ? "Saving…" : sheetId ? "Update" : "Save"}</span>
//                    </button>
//                    <button
//                        className="dl-btn"
//                        style={css.excelBtn}
//                        onClick={() => exportExcel(rows, selectedProject?.projectName, selectedWO?.workOrderNo, selectedWO?.towerName)}
//                    >
//                        <FaFileExcel style={{ fontSize: 15 }} />
//                        <span>Download Excel</span>
//                    </button>
//                </div>
//            </div>
//
//            {saveMsg && (
//                <div style={{ ...css.toast, ...(saveMsg.type === "success" ? css.toastOk : css.toastErr) }}>
//                    {saveMsg.type === "success" ? <FaCheckCircle /> : <FaExclamationTriangle />}
//                    &nbsp;{saveMsg.text}
//                </div>
//            )}
//
//            {/* Table */}
//            <div style={css.tableCard}>
//                <div style={{ overflowX: "auto" }}>
//                    <table style={{ borderCollapse: "collapse", fontSize: 11, whiteSpace: "nowrap" }}>
//                        <thead>
//                            {/* Row 1: Section group headers */}
//                            <tr>
//                                {LEFT_COLS.map(col => (
//                                    <th key={col.key} rowSpan={2}
//                                        style={{ ...css.th, minWidth: col.w, background: "#1e293b", color: "#f8fafc", verticalAlign: "middle" }}>
//                                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
//                                            <span>{col.label}</span>
//                                            {col.auto && <span style={{ fontSize: 8, color: "#a5b4fc", fontWeight: 700 }}>AUTO</span>}
//                                        </div>
//                                    </th>
//                                ))}
//                                {ALL_SECTIONS.map(sec => (
//                                    <th key={sec}
//                                        colSpan={SECTION_SUB_COLS[sec].length}
//                                        style={{
//                                            ...css.th,
//                                            background: sectionColors[sec].hdr,
//                                            color: sectionColors[sec].text,
//                                            textAlign: "center",
//                                            fontWeight: 800,
//                                            fontSize: 12,
//                                            letterSpacing: "0.05em",
//                                        }}>
//                                        {sec === "DCNO" ? "DC.NO" : sec}
//                                    </th>
//                                ))}
//                                <th rowSpan={2} style={{ ...css.th, minWidth: 110, background: "#334155", color: "#f8fafc" }}>
//                                    HANDOVER STATUS
//                                </th>
//                            </tr>
//
//                            {/* Row 2: Sub-column headers */}
//                            <tr>
//                                {ALL_SECTIONS.map(sec =>
//                                    SECTION_SUB_COLS[sec].map(sub => (
//                                        <th key={`${sec}_${sub}`}
//                                            style={{
//                                                ...css.th,
//                                                minWidth: 100,
//                                                background: sectionColors[sec].bg,
//                                                color: sectionColors[sec].text,
//                                                fontSize: 10,
//                                                fontWeight: 700,
//                                                textAlign: "center",
//                                                whiteSpace: "normal",
//                                                lineHeight: 1.2,
//                                                padding: "6px 6px",
//                                            }}>
//                                            {sub}
//                                        </th>
//                                    ))
//                                )}
//                            </tr>
//                        </thead>
//
//                        <tbody>
//                            {rows.map((row, idx) => (
//                                <tr key={row._id} className="tr-row"
//                                    style={{ background: idx % 2 === 0 ? "#fff" : "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
//
//                                    {/* Left auto/editable cols */}
//                                    {LEFT_COLS.map(col => (
//                                        <td key={col.key} style={css.td}>
//                                            {col.auto ? (
//                                                <div style={css.autoCell}>
//                                                    {col.key === "sqft" && row[col.key]
//                                                        ? parseFloat(row[col.key]).toFixed(2)
//                                                        : row[col.key] || "—"}
//                                                </div>
//                                            ) : (
//                                                <input
//                                                    className="tr-cell"
//                                                    style={{ ...css.cell, width: col.w - 16 }}
//                                                    value={row[col.key]}
//                                                    onChange={e => updateRow(row._id, col.key, e.target.value)}
//                                                    placeholder={col.key === "jobCard" ? "e.g. 208-01" : ""}
//                                                />
//                                            )}
//                                        </td>
//                                    ))}
//
//                                    {/* Section sub-cols */}
//                                    {ALL_SECTIONS.map(sec =>
//                                        SECTION_SUB_COLS[sec].map(sub => {
//                                            const fkey      = `${sec}__${sub}`;
//                                            const isStatus  = sec === "STATUS";
//                                            // SUPPLY/INSTALL cells driven by STATUS are auto (read-only)
//                                            const statusKey = `STATUS__${sub}`;
//                                            const statusVal = row[statusKey]?.trim().toLowerCase();
//                                            const isAutoSupply  = sec === "SUPPLY"       && STATUS_SUB_COLS.includes(sub) && (statusVal === "r" || statusVal === "i");
//                                            const isAutoInstall = sec === "INSTALLATION" && STATUS_SUB_COLS.includes(sub) && (statusVal === "r" || statusVal === "i");
//                                            const isAutoDriven  = isAutoSupply || isAutoInstall;
//
//                                            return (
//                                                <td key={fkey}
//                                                    style={{ ...css.td, background: idx % 2 === 0 ? sectionColors[sec].bg : `${sectionColors[sec].hdr}55` }}>
//                                                    <input
//                                                        className="tr-cell"
//                                                        style={{
//                                                            ...css.cell,
//                                                            width: 84,
//                                                            textAlign: isStatus ? "center" : "right",
//                                                            // STATUS: plain white editable
//                                                            // Auto-driven: blue read-only
//                                                            ...(isAutoDriven ? css.cellAutoDriven : {}),
//                                                            ...(isStatus ? { fontWeight: 700, textTransform: "uppercase" } : {}),
//                                                        }}
//                                                        type={isStatus ? "text" : "number"}
//                                                        value={row[fkey]}
//                                                        readOnly={isAutoDriven}
//                                                        onChange={e => updateRow(row._id, fkey, e.target.value)}
//                                                        placeholder={isStatus ? "R / I" : "0.00"}
//                                                        maxLength={isStatus ? 1 : undefined}
//                                                    />
//                                                </td>
//                                            );
//                                        })
//                                    )}
//
//                                    {/* Handover status */}
//                                    <td style={css.td}>
//                                        <input
//                                            className="tr-cell"
//                                            style={{ ...css.cell, width: 94 }}
//                                            value={row.handoverStatus || ""}
//                                            onChange={e => updateRow(row._id, "handoverStatus", e.target.value)}
//                                            placeholder="Status"
//                                        />
//                                    </td>
//                                </tr>
//                            ))}
//                        </tbody>
//
//                        <tfoot>
//                            <tr style={{ background: "#f1f5f9", borderTop: "2px solid #cbd5e1" }}>
//                                <td colSpan={9} style={{ padding: "10px 14px", fontWeight: 800, fontSize: 12, color: "#1e293b" }}>
//                                    TOTAL &nbsp;
//                                    <span style={{ color: "#0284c7" }}>Sqft: {totalSqft.toFixed(2)}</span>
//                                </td>
//                                <td colSpan={3} />
//                                {ALL_SECTIONS.map(sec =>
//                                    SECTION_SUB_COLS[sec].map(sub => {
//                                        const fkey = `${sec}__${sub}`;
//                                        const total = rows.reduce((s, r) => s + (parseFloat(r[fkey]) || 0), 0);
//                                        return (
//                                            <td key={fkey}
//                                                style={{ padding: "10px 6px", textAlign: "right", fontWeight: 700, fontSize: 11, color: sectionColors[sec].text }}>
//                                                {total > 0 ? total.toFixed(2) : ""}
//                                            </td>
//                                        );
//                                    })
//                                )}
//                                <td />
//                            </tr>
//                        </tfoot>
//                    </table>
//                </div>
//            </div>
//
//            {/* Summary strip */}
//            <div style={css.summaryStrip}>
//                {[
//                    { label: "Project",    val: selectedProject?.projectName || "—", color: "#1e293b" },
//                    { label: "Work Order", val: selectedWO?.workOrderNo || "—",       color: "#0284c7" },
//                    { label: "Tower",      val: selectedWO?.towerName   || "—",       color: "#d97706" },
//                    { label: "Total Rows", val: rows.length,                          color: "#475569" },
//                    { label: "Total Sqft", val: totalSqft.toFixed(2),                color: "#0284c7" },
//                    { label: "DB Status",  val: sheetId ? "Saved" : "Not saved",      color: sheetId ? "#16a34a" : "#94a3b8" },
//                ].map(s => (
//                    <div key={s.label} style={css.summaryItem}>
//                        <span style={css.summaryLabel}>{s.label}</span>
//                        <span style={{ fontSize: 14, fontWeight: 800, color: s.color }}>{s.val}</span>
//                    </div>
//                ))}
//            </div>
//        </div>
//    );
//}
//
//// ── Styles ────────────────────────────────────────────────────────────────────
//const css = {
//    page:            { maxWidth: 1600, margin: "0 auto", padding: "0 4px 56px", fontFamily: "'Inter',-apple-system,sans-serif" },
//    pageHeader:      { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, padding: "28px 0 20px", flexWrap: "wrap" },
//    headerIcon:      { width: 44, height: 44, background: "linear-gradient(135deg,#f59e0b,#d97706)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 20 },
//    pageTitle:       { margin: 0, fontSize: 22, fontWeight: 800, color: "#0f172a" },
//    pageSubtitle:    { margin: "3px 0 0", fontSize: 13, color: "#64748b" },
//    backBtn:         { background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 13, color: "#64748b", fontWeight: 500, display: "flex", alignItems: "center", gap: 6, marginBottom: 4 },
//    metaLine:        { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 4 },
//    projBadge:       { background: "#e0f2fe", color: "#0284c7", fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 12 },
//    woBadge:         { background: "#ede9fe", color: "#7c3aed", fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 12 },
//    towerBadge:      { background: "#fef3c7", color: "#92400e", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 10, border: "1px solid #fde68a" },
//    saveBtn:         { display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "#10b981", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13, transition: "all 0.2s" },
//    excelBtn:        { display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13, transition: "all 0.2s" },
//    toast:           { display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500, marginBottom: 16, border: "1px solid" },
//    toastOk:         { background: "#ecfdf5", color: "#047857", borderColor: "#a7f3d0" },
//    toastErr:        { background: "#fef2f2", color: "#b91c1c", borderColor: "#fecaca" },
//    tableCard:       { background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 1px 6px rgba(0,0,0,0.04)", marginBottom: 20, overflow: "hidden" },
//    th:              { padding: "10px 8px", fontWeight: 700, textAlign: "left", fontSize: 11, borderRight: "1px solid rgba(255,255,255,0.15)", verticalAlign: "middle", whiteSpace: "nowrap" },
//    td:              { padding: "4px 5px", verticalAlign: "middle" },
//    cell:            { padding: "5px 7px", border: "1px solid #cbd5e1", borderRadius: 4, fontSize: 11, color: "#0f172a", background: "#fff", outline: "none" },
//    autoCell:        { padding: "5px 8px", background: "#f1f5f9", borderRadius: 4, fontSize: 11, color: "#475569", fontWeight: 500, border: "1px solid #e2e8f0", minWidth: 40, textAlign: "right" },
//    cellAutoDriven:  { background: "#eff6ff", color: "#0284c7", cursor: "not-allowed", fontWeight: 700, borderColor: "#bfdbfe" },
//    summaryStrip:    { display: "flex", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" },
//    summaryItem:     { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "14px 10px", borderRight: "1px solid #e2e8f0" },
//    summaryLabel:    { fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 },
//    selectionPanels: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 },
//    selPanel:        { background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 2px 6px rgba(0,0,0,0.04)" },
//    selPanelHeader:  { display: "flex", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid #f1f5f9", background: "#fafbfc" },
//    searchBox:       { display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" },
//    searchInput:     { border: "none", background: "transparent", outline: "none", fontSize: 13, flex: 1 },
//    selList:         { maxHeight: 320, overflowY: "auto" },
//    selItem:         { padding: "12px 18px", cursor: "pointer", borderBottom: "1px solid #f8fafc", borderLeft: "3px solid transparent", transition: "all 0.15s" },
//    selItemActive:   { background: "#eff6ff", borderLeft: "3px solid #0284c7" },
//    centerMsg:       { padding: "30px", textAlign: "center", color: "#94a3b8", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
//};


import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaLayerGroup, FaSearch, FaBuilding, FaClipboardList,
    FaSpinner, FaFileExcel, FaSave,
    FaCheckCircle, FaExclamationTriangle, FaRegArrowAltCircleLeft
} from "react-icons/fa";
import * as XLSX from "xlsx-js-style";

// ── Column definitions ────────────────────────────────────────────────────────
const SUB_COLS = [
    "FRAME", "DOOR FRAME", "SHUTTER", "OPENABLE DOOR", "FIX GLASS", "TOP / BOTTOM FIX",
];

const DCNO_SUB_COLS = [
    "FRAME", "DOOR FRAME", "SHUTTER", "OPENABLE DOOR", "FIX GLASS", "TOP / BOTTOM FIX",
];

// STATUS has 6 sub-cols (HARDWARE dropped, TOP/BOTTOM FIX kept)
const STATUS_SUB_COLS = [
    "FRAME", "DOOR FRAME", "SHUTTER", "OPENABLE DOOR", "FIX GLASS", "TOP / BOTTOM FIX",
];

// All 5 sections in order
// HARDWARE section dropped entirely
const ALL_SECTIONS = ["DCNO", "STATUS", "SUPPLY", "INSTALLATION"];

const SECTION_SUB_COLS = {
    DCNO:         DCNO_SUB_COLS,
    STATUS:       STATUS_SUB_COLS,
    SUPPLY:       SUB_COLS,
    INSTALLATION: SUB_COLS,
};

// DB key prefixes
const DB_PREFIX = {
    DCNO: "dcno", STATUS: "status",
    SUPPLY: "supply", INSTALLATION: "install",
};

// Sub-col → camelCase suffix
const SUB_SUFFIX = {
    "FRAME":           "Frame",
    "DOOR FRAME":      "DoorFrame",
    "SHUTTER":         "Shutter",
    "OPENABLE DOOR":   "OpenableDoor",
    "FIX GLASS":       "FixGlass",
    "TOP / BOTTOM FIX":"TopBottomFix",
    "HARDWARE":        "Hardware",
};

// ── Empty tracker row ─────────────────────────────────────────────────────────
const emptyTrackerRow = (srNo = "", flat = "", woItem = null) => {
    const base = {
        _id:      Date.now() + Math.random(),
        srNo,
        flat,
        location:  woItem?.location   || "",
        wcode:     woItem?.windowCode  || "",
        typology:  woItem?.typology    || "",
        series:    woItem?.series      || "",
        woLnt:     woItem?.length      || "",
        woHgt:     woItem?.height      || "",
        sqft:      woItem?.sqft        || "",
        length:    "",
        height:    "",
        jobCard:   "",
        handoverStatus: "",
    };
    ALL_SECTIONS.forEach(sec => {
        SECTION_SUB_COLS[sec].forEach(sub => {
            base[`${sec}__${sub}`] = "";
        });
    });
    return base;
};

// ── Excel export ──────────────────────────────────────────────────────────────
function exportExcel(rows, projectName, workOrderNo, towerName) {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([]);

    const setS = (ref, s) => {
        if (!ws[ref]) ws[ref] = { t: "z", v: "" };
        ws[ref].s = s;
    };

    // Column order:
    // 0-11:  SR NO, FLAT, LOCATION, WCODE, TYPOLOGY, SERIES, WO LNT, WO HGT, SQ FT, LENGTH, HEIGHT, JOB CARD
    // 12-17: DCNO (6)
    // 18-23: STATUS (6) — HARDWARE dropped, TOP/BOTTOM FIX kept
    // 24-29: SUPPLY (6)
    // 30-35: INSTALLATION (6)
    // 36:    HANDOVER STATUS
    const totalCols = 37;

    // Build column letter array (A..AR for 44 cols)
    const colLetters = [];
    for (let i = 0; i < totalCols; i++) {
        if (i < 26) colLetters.push(String.fromCharCode(65 + i));
        else colLetters.push(
            String.fromCharCode(64 + Math.floor(i / 26)) +
            String.fromCharCode(65 + (i % 26))
        );
    }

    // ── Totals ────────────────────────────────────────────────────────────────
    const totalSqft = rows.reduce((s, r) => s + (parseFloat(r.sqft) || 0), 0);

    // ── Row 1: Project / WO title ─────────────────────────────────────────────
    XLSX.utils.sheet_add_aoa(ws,
        [[`PROJECT: ${projectName || "—"}   |   WO: ${workOrderNo || "—"}   |   Tower: ${towerName || "—"}`]],
        { origin: "A1" }
    );

    // ── Row 2: Section group headers ──────────────────────────────────────────
    const row2 = new Array(totalCols).fill("");
    row2[12] = "DC.NO";
    row2[18] = "STATUS";
    row2[24] = "SUPPLY";
    row2[30] = "INSTALLATION";
    XLSX.utils.sheet_add_aoa(ws, [row2], { origin: "A2" });

    // ── Row 3: Sub-headers ────────────────────────────────────────────────────
    const row3 = [
        "SR NO.", "FLAT", "LOCATION", "WCODE", "TYPOLOGY", "SERIES",
        "WO LNT", "WO HGT", "SQ FT.", "LENGTH", "HEIGHT", "JOB CARD",
        ...DCNO_SUB_COLS,      // 6 cols (12-17)
        ...STATUS_SUB_COLS,    // 6 cols (18-23)
        ...SUB_COLS,           // SUPPLY 6 cols (24-29)
        ...SUB_COLS,           // INSTALLATION 6 cols (30-35)
        "HANDOVER STATUS",     // col 36
    ];
    XLSX.utils.sheet_add_aoa(ws, [row3], { origin: "A3" });

    // ── Rows 4+: Data ─────────────────────────────────────────────────────────
    const dataRows = rows.map(r => [
        r.srNo || "", r.flat || "", r.location || "", r.wcode || "",
        r.typology || "", r.series || "",
        r.woLnt !== "" ? Number(r.woLnt) : "",
        r.woHgt !== "" ? Number(r.woHgt) : "",
        r.sqft  !== "" ? parseFloat(parseFloat(r.sqft).toFixed(2)) : "",
        r.length !== "" ? Number(r.length) : "",
        r.height !== "" ? Number(r.height) : "",
        r.jobCard || "",
        // DCNO
        ...DCNO_SUB_COLS.map(sub => r[`DCNO__${sub}`] !== "" ? parseFloat(r[`DCNO__${sub}`] || 0) : ""),
        // STATUS
...STATUS_SUB_COLS.map(sub => r[`STATUS__${sub}`] !== "" ? r[`STATUS__${sub}`].trim().toUpperCase() : ""),        // SUPPLY
        ...SUB_COLS.map(sub => r[`SUPPLY__${sub}`] !== "" ? parseFloat(r[`SUPPLY__${sub}`] || 0) : ""),
        // INSTALLATION
        ...SUB_COLS.map(sub => r[`INSTALLATION__${sub}`] !== "" ? parseFloat(r[`INSTALLATION__${sub}`] || 0) : ""),
        r.handoverStatus || "",
    ]);
    XLSX.utils.sheet_add_aoa(ws, dataRows, { origin: "A4" });

    // ── Total row ─────────────────────────────────────────────────────────────
    const totalR = 4 + rows.length;
    const totalRow = new Array(totalCols).fill("");
    totalRow[0] = "TOTAL";
    totalRow[8] = parseFloat(totalSqft.toFixed(2));
    let ci = 12;
   ALL_SECTIONS.forEach(sec => {
       SECTION_SUB_COLS[sec].forEach(sub => {
           if (sec === "STATUS") {
               totalRow[ci++] = ""; // STATUS is R/I strings — no numeric total
           } else {
               totalRow[ci++] = rows.reduce((s, r) => s + (parseFloat(r[`${sec}__${sub}`]) || 0), 0);
           }
       });
   });
    XLSX.utils.sheet_add_aoa(ws, [totalRow], { origin: `A${totalR}` });

    // ── Merges ────────────────────────────────────────────────────────────────
    const r0 = (row) => row - 1;
    ws["!merges"] = [
        { s: { r: r0(1), c: 0  }, e: { r: r0(1), c: totalCols - 1 } }, // Row 1 full
        ...Array.from({ length: 12 }, (_, i) => ({ s: { r: r0(2), c: i }, e: { r: r0(3), c: i } })), // A-L 2-row span
        { s: { r: r0(2), c: 12 }, e: { r: r0(2), c: 17 } }, // DC.NO (6)
        { s: { r: r0(2), c: 18 }, e: { r: r0(2), c: 23 } }, // STATUS (6)
        { s: { r: r0(2), c: 24 }, e: { r: r0(2), c: 29 } }, // SUPPLY (6)
        { s: { r: r0(2), c: 30 }, e: { r: r0(2), c: 35 } }, // INSTALLATION (6)
        { s: { r: r0(2), c: 36 }, e: { r: r0(3), c: 36 } }, // HANDOVER 2-row span
    ];

    // ── Column widths ─────────────────────────────────────────────────────────
    ws["!cols"] = [
        { wch: 7  }, { wch: 8  }, { wch: 20 }, { wch: 10 }, { wch: 30 }, { wch: 8  },
        { wch: 8  }, { wch: 8  }, { wch: 9  }, { wch: 8  }, { wch: 8  }, { wch: 12 },
        ...Array(6).fill({ wch: 13 }),  // DCNO (6)
        ...Array(6).fill({ wch: 13 }),  // STATUS (6)
        ...Array(6).fill({ wch: 13 }),  // SUPPLY (6)
        ...Array(6).fill({ wch: 13 }),  // INSTALLATION (6)
        { wch: 14 },                    // HANDOVER
    ];
    ws["!rows"] = [{ hpt: 22 }, { hpt: 20 }, { hpt: 32 }];

    // ── Style helpers ─────────────────────────────────────────────────────────
    const bdr = (rgb, style = "thin") => ({ style, color: { rgb } });
    const allBdr = (rgb) => ({ top: bdr(rgb), bottom: bdr(rgb), left: bdr(rgb), right: bdr(rgb) });

    // Row 1 — title
    setS("A1", {
        font:      { bold: true, sz: 13, name: "Calibri", color: { rgb: "1A2940" } },
        alignment: { horizontal: "center", vertical: "center" },
        fill:      { patternType: "solid", fgColor: { rgb: "EEF2F7" } },
        border:    { bottom: bdr("A0B0C8", "medium") },
    });

    // Section group header colors
    const secHdr = {
        base:         { fill: "D6E4F0", text: "1A2940" },
        DCNO:         { fill: "FCF3CF", text: "7D6608" },
        STATUS:       { fill: "FADBD8", text: "922B21" },
        SUPPLY:       { fill: "D6EAF8", text: "1A5276" },
        INSTALLATION: { fill: "D5F5E3", text: "1E8449" },
    };
    const secSub = {
        base:         "BDD7EE",
        DCNO:         "F9E79F",
        STATUS:       "F1948A",
        SUPPLY:       "AED6F1",
        INSTALLATION: "A9DFBF",
    };

    const getSecForCol = (ci) => {
        if (ci >= 12 && ci <= 17) return "DCNO";
        if (ci >= 18 && ci <= 23) return "STATUS";
        if (ci >= 24 && ci <= 29) return "SUPPLY";
        if (ci >= 30 && ci <= 35) return "INSTALLATION";
        return "base";
    };

    // Row 2 group headers
    colLetters.forEach((col, i) => {
        const sec = getSecForCol(i);
        const c   = secHdr[sec];
        setS(`${col}2`, {
            font:      { bold: true, sz: 9, name: "Calibri", color: { rgb: c.text } },
            alignment: { horizontal: "center", vertical: "center", wrapText: true },
            fill:      { patternType: "solid", fgColor: { rgb: c.fill } },
            border:    allBdr("A8C4DC"),
        });
    });

    // Row 3 sub-headers
    colLetters.forEach((col, i) => {
        const sec = getSecForCol(i);
        setS(`${col}3`, {
            font:      { bold: true, sz: 8, name: "Calibri", color: { rgb: "000000" } },
            alignment: { horizontal: "center", vertical: "center", wrapText: true },
            fill:      { patternType: "solid", fgColor: { rgb: secSub[sec] } },
            border:    allBdr("A8C4DC"),
        });
    });

    // Data rows
    const dataTint = {
        base:         ["F0F4F8", "FFFFFF"],
        DCNO:         ["FDFDE7", "FEFEF5"],
        STATUS:       ["FDEDEC", "FEF5F5"],
        SUPPLY:       ["EBF5FB", "F8FCFE"],
        INSTALLATION: ["E9F7EF", "F4FCF7"],
    };

    dataRows.forEach((_, ri) => {
        const excelR = ri + 4;
        const isOdd  = ri % 2 === 1;
        colLetters.forEach((col, i) => {
            const sec    = getSecForCol(i);
            const colors = dataTint[sec];
            setS(`${col}${excelR}`, {
                font:      { sz: 9, name: "Calibri", color: { rgb: "1A2940" } },
                alignment: { horizontal: i >= 6 ? "right" : i <= 1 ? "center" : "left", vertical: "center" },
                fill:      { patternType: "solid", fgColor: { rgb: isOdd ? colors[0] : colors[1] } },
                border:    allBdr("D8E2EC"),
            });
        });
    });

    // Total row
    colLetters.forEach((col, i) => {
        setS(`${col}${totalR}`, {
            font:      { bold: true, sz: 9, name: "Calibri", color: { rgb: "1A2940" } },
            alignment: { horizontal: i >= 6 ? "right" : "center", vertical: "center" },
            fill:      { patternType: "solid", fgColor: { rgb: "D9D9D9" } },
            border:    {
                top:    bdr("888888", "medium"),
                bottom: bdr("888888", "medium"),
                left:   bdr("AAAAAA"),
                right:  bdr("AAAAAA"),
            },
        });
    });

    XLSX.utils.book_append_sheet(wb, ws, "Tracker");
    XLSX.writeFile(wb, `Tracker_${projectName || "export"}_${workOrderNo || ""}.xlsx`);
}

// ─────────────────────────────────────────────────────────────────────────────
export default function TrackerFormPage() {
    const navigate = useNavigate();

    const [projects,        setProjects]       = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [workOrders,      setWorkOrders]      = useState([]);
    const [selectedWO,      setSelectedWO]      = useState(null);
    const [search,          setSearch]          = useState("");
    const [loadingProjects, setLoadingProjects]  = useState(true);
    const [loadingWOs,      setLoadingWOs]       = useState(false);
    const [loadingRows,     setLoadingRows]      = useState(false);
    const [rows,            setRows]            = useState([]);
    const [saveMsg,         setSaveMsg]         = useState(null);
    const [saving,          setSaving]          = useState(false);
    const [sheetId,         setSheetId]         = useState(null);
    const [step,            setStep]            = useState("project");

    // Load projects
    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_URL}/projects`)
            .then(r => r.json())
            .then(data => { setProjects(data); setLoadingProjects(false); })
            .catch(() => setLoadingProjects(false));
    }, []);

    const handleSelectProject = async (project) => {
        setSelectedProject(project);
        setSelectedWO(null);
        setRows([]);
        setSheetId(null);
        setStep("wo");
        setLoadingWOs(true);
        try {
            const res  = await fetch(
                `${process.env.REACT_APP_API_URL}/api/work-orders/by-project/${encodeURIComponent(project.projectName)}`
            );
            const data = await res.json();
            setWorkOrders(Array.isArray(data) ? data : []);
        } catch {
            setWorkOrders([]);
        } finally {
            setLoadingWOs(false);
        }
    };

    const handleSelectWO = async (wo) => {
        setSelectedWO(wo);
        setLoadingRows(true);
        setRows([]);
        setSheetId(null);
        setSaveMsg(null);
        try {
            // Fetch info sheets to get flat numbers
            const sheetRes = await fetch(
                `${process.env.REACT_APP_API_URL}/api/info-sheets/by-work-order/${wo.id}`
            );
            const sheets   = await sheetRes.json();
            const sheet    = Array.isArray(sheets) && sheets.length > 0 ? sheets[0] : null;
            const flatList = sheet
                ? (sheet.flats || []).map(f => ({ flatNo: f.flatNo, items: f.items || [] }))
                : [];
            const woItems  = wo.items || [];

            // Build tracker rows
            const trackerRows = [];
            let srNo = 1;
            if (flatList.length > 0) {
                flatList.forEach(flat => {
                    (flat.items || []).forEach(sheetItem => {
                        const woItem = woItems.find(w =>
                            w.location   === sheetItem.location &&
                            w.windowCode === sheetItem.windowCode &&
                            w.typology   === sheetItem.typology
                        ) || sheetItem;
                        trackerRows.push(emptyTrackerRow(srNo++, flat.flatNo, woItem));
                    });
                });
            } else {
                woItems.forEach(item => trackerRows.push(emptyTrackerRow(srNo++, "", item)));
            }

            // Check if tracker sheet already exists — restore saved values
            try {
                const tsRes = await fetch(
                    `${process.env.REACT_APP_API_URL}/api/tracker-sheets/by-work-order/${wo.id}`
                );
                if (tsRes.ok) {
                    const tsData = await tsRes.json();
                    setSheetId(tsData.id);
                    if (tsData.rows && tsData.rows.length > 0) {
                       const restored = trackerRows.map((row, idx) => {
                           const saved = tsData.rows[idx];
                           if (!saved) return row;
                           const r = { ...row };
                           r.length         = saved.length         ?? "";
                           r.height         = saved.height         ?? "";
                           r.jobCard        = saved.jobCard        || "";
                           r.handoverStatus = saved.handoverStatus || "";

                           // Restore DCNO fields
                           SECTION_SUB_COLS["DCNO"].forEach(sub => {
                               const fkey  = `DCNO__${sub}`;
                               const dbKey = `dcno${SUB_SUFFIX[sub]}`;
                               r[fkey] = saved[dbKey] ?? "";
                           });

                           // Restore STATUS and re-derive SUPPLY/INSTALLATION from it
                           SECTION_SUB_COLS["STATUS"].forEach(sub => {
                               const statusFkey  = `STATUS__${sub}`;
                               const supplyFkey  = `SUPPLY__${sub}`;
                               const installFkey = `INSTALLATION__${sub}`;
                               const statusVal   = saved[`status${SUB_SUFFIX[sub]}`] || "";
                               const sqftVal     = parseFloat(r.sqft) || 0;
                               const v           = statusVal.trim().toLowerCase();

                               r[statusFkey] = statusVal;

                               if (v === "r") {
                                   r[supplyFkey]  = sqftVal.toFixed(4);
                                   r[installFkey] = "0";
                               } else if (v === "i") {
                                   r[supplyFkey]  = sqftVal.toFixed(4);
                                   r[installFkey] = sqftVal.toFixed(4);
                               } else {
                                   r[supplyFkey]  = saved[`supply${SUB_SUFFIX[sub]}`] ?? "";
                                   r[installFkey] = saved[`install${SUB_SUFFIX[sub]}`] ?? "";
                               }
                           });

                           return r;
                       });
                        setRows(restored);
                    } else {
                        setRows(trackerRows);
                    }
                } else {
                    setSheetId(null);
                    setRows(trackerRows);
                }
            } catch {
                setSheetId(null);
                setRows(trackerRows);
            }

            setStep("tracker");
        } catch {
            setSaveMsg({ type: "error", text: "Failed to load work order data." });
        } finally {
            setLoadingRows(false);
        }
    };

    const updateRow = (_id, field, value) =>
        setRows(prev => prev.map(r => {
            if (r._id !== _id) return r;
            const updated = { ...r, [field]: value };

            // ── STATUS → SUPPLY / INSTALLATION auto-fill logic ────────────────
            // If field is a STATUS sub-col (STATUS__FRAME, STATUS__DOOR FRAME etc.)
            if (field.startsWith("STATUS__")) {
                const sub = field.replace("STATUS__", ""); // e.g. "FRAME"
                const supplyKey  = `SUPPLY__${sub}`;
                const installKey = `INSTALLATION__${sub}`;
                const sqftVal    = parseFloat(r.sqft) || 0;
                const v          = value.trim().toLowerCase();

                if (v === "r") {
                    // R — fill SUPPLY with sqft only
                    updated[supplyKey]  = sqftVal.toFixed(4);
                    updated[installKey] = "0";
                } else if (v === "i") {
                    // I — fill BOTH SUPPLY and INSTALLATION with sqft
                    updated[supplyKey]  = sqftVal.toFixed(4);
                    updated[installKey] = sqftVal.toFixed(4);
                } else {
                    // Cleared — reset both to 0
                    updated[supplyKey]  = "0";
                    updated[installKey] = "0";
                }
            }

            return updated;
        }));

    // Save to DB
    const handleSave = async () => {
        setSaving(true);
        setSaveMsg(null);
        const payload = {
            workOrderId: selectedWO.id,
            projectName: selectedProject?.projectName || "",
            towerName:   selectedWO?.towerName        || "",
            date:        new Date().toISOString().split("T")[0],
            rows: rows.map(r => {
                const row = {
                    srNo: r.srNo, flat: r.flat, location: r.location,
                    wcode: r.wcode, typology: r.typology, series: r.series,
                    woLnt: r.woLnt || null, woHgt: r.woHgt || null, sqft: r.sqft || null,
                    length: r.length || null, height: r.height || null,
                    jobCard: r.jobCard || null,
                    handoverStatus: r.handoverStatus || null,
                };
             ALL_SECTIONS.forEach(sec => {
                 if (sec === "SUPPLY" || sec === "INSTALLATION") return;
                 const prefix = DB_PREFIX[sec];
                 SECTION_SUB_COLS[sec].forEach(sub => {
                     const fkey  = `${sec}__${sub}`;
                     const dbKey = `${prefix}${SUB_SUFFIX[sub]}`;
                     if (sec === "STATUS") {
                         row[dbKey] = r[fkey] !== "" ? r[fkey].trim().toUpperCase() : null;
                     } else {
                         row[dbKey] = r[fkey] !== "" ? parseFloat(r[fkey]) || null : null;
                     }
                 });
             });
                return row;
            }),
        };

        try {
            const url    = sheetId
                ? `${process.env.REACT_APP_API_URL}/api/tracker-sheets/${sheetId}`
                : `${process.env.REACT_APP_API_URL}/api/tracker-sheets`;
            const method = sheetId ? "PUT" : "POST";
            const res    = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Server error");
            if (!sheetId) setSheetId(data.id);
            setSaveMsg({ type: "success", text: sheetId ? "Tracker sheet updated!" : "Tracker sheet saved!" });
        } catch (err) {
            setSaveMsg({ type: "error", text: err.message });
        } finally {
            setSaving(false);
        }
    };

    const totalSqft = rows.reduce((s, r) => s + (parseFloat(r.sqft) || 0), 0);

    const filtered = projects.filter(p =>
        p.projectName?.toLowerCase().includes(search.toLowerCase()) ||
        p.projectCode?.toLowerCase().includes(search.toLowerCase())
    );

    const sectionColors = {
        DCNO:         { bg: "#FDFDE7", hdr: "#F9E79F", text: "#7D6608" },
        STATUS:       { bg: "#FDEDEC", hdr: "#F1948A", text: "#922B21" },
        SUPPLY:       { bg: "#EBF5FB", hdr: "#AED6F1", text: "#1A5276" },
        INSTALLATION: { bg: "#E9F7EF", hdr: "#A9DFBF", text: "#1E8449" },
    };

    const LEFT_COLS = [
        { key: "srNo",     label: "SR NO.",    w: 55,  auto: true },
        { key: "flat",     label: "FLAT",      w: 70,  auto: true },
        { key: "location", label: "LOCATION",  w: 140, auto: true },
        { key: "wcode",    label: "WCODE",     w: 90,  auto: true },
        { key: "typology", label: "TYPOLOGY",  w: 200, auto: true },
        { key: "series",   label: "SERIES",    w: 80,  auto: true },
        { key: "woLnt",    label: "WO LNT",    w: 75,  auto: true },
        { key: "woHgt",    label: "WO HGT",    w: 75,  auto: true },
        { key: "sqft",     label: "SQ FT.",    w: 80,  auto: true },
        { key: "length",   label: "LENGTH",    w: 80  },
        { key: "height",   label: "HEIGHT",    w: 80  },
        { key: "jobCard",  label: "JOB CARD",  w: 100 },
    ];

    // ── Selection screen ──────────────────────────────────────────────────────
    if (step === "project" || step === "wo") {
        return (
            <div style={css.page}>
                <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
                <div style={css.pageHeader}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={css.headerIcon}><FaLayerGroup /></div>
                        <div>
                            <h1 style={css.pageTitle}>Production Tracker</h1>
                            <p style={css.pageSubtitle}>Select project → work order → fill tracker data</p>
                        </div>
                    </div>
                </div>

                <div style={css.selectionPanels}>
                    {/* Projects */}
                    <div style={css.selPanel}>
                        <div style={css.selPanelHeader}>
                            <FaBuilding style={{ color: "#0ea5e9", marginRight: 8 }} />
                            <span style={{ fontWeight: 700, fontSize: 14 }}>Projects ({filtered.length})</span>
                        </div>
                        <div style={css.searchBox}>
                            <FaSearch style={{ color: "#94a3b8", fontSize: 12 }} />
                            <input style={css.searchInput} placeholder="Search…"
                                value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <div style={css.selList}>
                            {loadingProjects ? (
                                <div style={css.centerMsg}><FaSpinner style={{ animation: "spin 1s linear infinite" }} />&nbsp;Loading…</div>
                            ) : filtered.map(p => (
                                <div
                                    key={p.projectId}
                                    style={{ ...css.selItem, ...(selectedProject?.projectId === p.projectId ? css.selItemActive : {}) }}
                                    onClick={() => handleSelectProject(p)}
                                >
                                    <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>{p.projectName}</div>
                                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{p.projectCode}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Work Orders */}
                    <div style={css.selPanel}>
                        <div style={css.selPanelHeader}>
                            <FaClipboardList style={{ color: "#8b5cf6", marginRight: 8 }} />
                            <span style={{ fontWeight: 700, fontSize: 14 }}>
                                Work Orders {selectedProject ? `(${workOrders.length})` : ""}
                            </span>
                        </div>
                        <div style={css.selList}>
                            {!selectedProject ? (
                                <div style={css.centerMsg}>Select a project first</div>
                            ) : loadingWOs ? (
                                <div style={css.centerMsg}><FaSpinner style={{ animation: "spin 1s linear infinite" }} />&nbsp;Loading…</div>
                            ) : workOrders.length === 0 ? (
                                <div style={css.centerMsg}>No work orders found</div>
                            ) : workOrders.map(wo => (
                                <div
                                    key={wo.id}
                                    style={{ ...css.selItem, ...(selectedWO?.id === wo.id ? css.selItemActive : {}) }}
                                    onClick={() => handleSelectWO(wo)}
                                >
                                    <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>{wo.workOrderNo}</div>
                                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                                        {wo.towerName && <span style={css.towerBadge}>{wo.towerName}</span>}
                                        &nbsp;{wo.items?.length || 0} items
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {loadingRows && (
                    <div style={css.centerMsg}>
                        <FaSpinner style={{ animation: "spin 1s linear infinite", marginRight: 8 }} />
                        Building tracker rows…
                    </div>
                )}
            </div>
        );
    }

    // ── Tracker form ──────────────────────────────────────────────────────────
    return (
        <div style={css.page}>
            <style>{`
                @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
                .tr-row:hover { background: #f8fafc !important; }
                .tr-cell:focus { border-color: #0284c7 !important; outline: none; }
                .save-btn:hover:not(:disabled) { background: #047857 !important; transform: translateY(-1px); }
                .dl-btn:hover { background: #15803d !important; transform: translateY(-1px); }
                input[type=number]::-webkit-inner-spin-button,
                input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
                input[type=number] { -moz-appearance: textfield; }
            `}</style>

            {/* Header */}
            <div style={css.pageHeader}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <button style={css.backBtn} onClick={() => {
                        setStep("project"); setSelectedProject(null);
                        setSelectedWO(null); setRows([]); setSheetId(null);
                    }}>
                        <FaRegArrowAltCircleLeft /> Back to Selection
                    </button>
                    <h1 style={css.pageTitle}>Production Tracker</h1>
                    <div style={css.metaLine}>
                        <span style={css.projBadge}>{selectedProject?.projectName}</span>
                        <span style={css.woBadge}>{selectedWO?.workOrderNo}</span>
                        {selectedWO?.towerName && <span style={css.towerBadge}>{selectedWO.towerName}</span>}
                        <span style={{ fontSize: 12, color: "#64748b" }}>{rows.length} rows</span>
                        {sheetId && <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 600 }}>✓ Saved</span>}
                    </div>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                    <button
                        className="save-btn"
                        style={css.saveBtn}
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? <FaSpinner style={{ animation: "spin 1s linear infinite" }} /> : <FaSave style={{ fontSize: 14 }} />}
                        <span>{saving ? "Saving…" : sheetId ? "Update" : "Save"}</span>
                    </button>
                    <button
                        className="dl-btn"
                        style={css.excelBtn}
                        onClick={() => exportExcel(rows, selectedProject?.projectName, selectedWO?.workOrderNo, selectedWO?.towerName)}
                    >
                        <FaFileExcel style={{ fontSize: 15 }} />
                        <span>Download Excel</span>
                    </button>
                </div>
            </div>

            {saveMsg && (
                <div style={{ ...css.toast, ...(saveMsg.type === "success" ? css.toastOk : css.toastErr) }}>
                    {saveMsg.type === "success" ? <FaCheckCircle /> : <FaExclamationTriangle />}
                    &nbsp;{saveMsg.text}
                </div>
            )}

            {/* Table */}
            <div style={css.tableCard}>
                <div style={{ overflowX: "auto" }}>
                    <table style={{ borderCollapse: "collapse", fontSize: 11, whiteSpace: "nowrap" }}>
                        <thead>
                            {/* Row 1: Section group headers */}
                            <tr>
                                {LEFT_COLS.map(col => (
                                    <th key={col.key} rowSpan={2}
                                        style={{ ...css.th, minWidth: col.w, background: "#1e293b", color: "#f8fafc", verticalAlign: "middle" }}>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                            <span>{col.label}</span>
                                            {col.auto && <span style={{ fontSize: 8, color: "#a5b4fc", fontWeight: 700 }}>AUTO</span>}
                                        </div>
                                    </th>
                                ))}
                                {ALL_SECTIONS.map(sec => (
                                    <th key={sec}
                                        colSpan={SECTION_SUB_COLS[sec].length}
                                        style={{
                                            ...css.th,
                                            background: sectionColors[sec].hdr,
                                            color: sectionColors[sec].text,
                                            textAlign: "center",
                                            fontWeight: 800,
                                            fontSize: 12,
                                            letterSpacing: "0.05em",
                                        }}>
                                        {sec === "DCNO" ? "DC.NO" : sec}
                                    </th>
                                ))}
                                <th rowSpan={2} style={{ ...css.th, minWidth: 110, background: "#334155", color: "#f8fafc" }}>
                                    HANDOVER STATUS
                                </th>
                            </tr>

                            {/* Row 2: Sub-column headers */}
                            <tr>
                                {ALL_SECTIONS.map(sec =>
                                    SECTION_SUB_COLS[sec].map(sub => (
                                        <th key={`${sec}_${sub}`}
                                            style={{
                                                ...css.th,
                                                minWidth: 100,
                                                background: sectionColors[sec].bg,
                                                color: sectionColors[sec].text,
                                                fontSize: 10,
                                                fontWeight: 700,
                                                textAlign: "center",
                                                whiteSpace: "normal",
                                                lineHeight: 1.2,
                                                padding: "6px 6px",
                                            }}>
                                            {sub}
                                        </th>
                                    ))
                                )}
                            </tr>
                        </thead>

                        <tbody>
                            {rows.map((row, idx) => (
                                <tr key={row._id} className="tr-row"
                                    style={{ background: idx % 2 === 0 ? "#fff" : "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>

                                    {/* Left auto/editable cols */}
                                    {LEFT_COLS.map(col => (
                                        <td key={col.key} style={css.td}>
                                            {col.auto ? (
                                                <div style={css.autoCell}>
                                                    {col.key === "sqft" && row[col.key]
                                                        ? parseFloat(row[col.key]).toFixed(2)
                                                        : row[col.key] || "—"}
                                                </div>
                                            ) : (
                                                <input
                                                    className="tr-cell"
                                                    style={{ ...css.cell, width: col.w - 16 }}
                                                    value={row[col.key]}
                                                    onChange={e => updateRow(row._id, col.key, e.target.value)}
                                                    placeholder={col.key === "jobCard" ? "e.g. 208-01" : ""}
                                                />
                                            )}
                                        </td>
                                    ))}

                                    {/* Section sub-cols */}
                                    {ALL_SECTIONS.map(sec =>
                                        SECTION_SUB_COLS[sec].map(sub => {
                                            const fkey      = `${sec}__${sub}`;
                                            const isStatus  = sec === "STATUS";
                                            // SUPPLY/INSTALL cells driven by STATUS are auto (read-only)
                                            const statusKey = `STATUS__${sub}`;
                                            const statusVal = row[statusKey]?.trim().toLowerCase();
                                            // R → SUPPLY auto-driven | I → BOTH SUPPLY and INSTALLATION auto-driven
                                            const isAutoSupply  = sec === "SUPPLY"       && STATUS_SUB_COLS.includes(sub) && (statusVal === "r" || statusVal === "i");
                                            const isAutoInstall = sec === "INSTALLATION" && STATUS_SUB_COLS.includes(sub) && statusVal === "i";
                                            const isAutoDriven  = isAutoSupply || isAutoInstall;

                                            return (
                                                <td key={fkey}
                                                    style={{ ...css.td, background: idx % 2 === 0 ? sectionColors[sec].bg : `${sectionColors[sec].hdr}55` }}>
                                                    <input
                                                        className="tr-cell"
                                                        style={{
                                                            ...css.cell,
                                                            width: 84,
                                                            textAlign: isStatus ? "center" : "right",
                                                            // STATUS: plain white editable
                                                            // Auto-driven: blue read-only
                                                            ...(isAutoDriven ? css.cellAutoDriven : {}),
                                                            ...(isStatus ? { fontWeight: 700, textTransform: "uppercase" } : {}),
                                                        }}
                                                        type={isStatus ? "text" : "number"}
                                                        value={row[fkey]}
                                                        readOnly={isAutoDriven}
                                                        onChange={e => updateRow(row._id, fkey, e.target.value)}
                                                        placeholder={isStatus ? "R / I" : "0.00"}
                                                        maxLength={isStatus ? 1 : undefined}
                                                    />
                                                </td>
                                            );
                                        })
                                    )}

                                    {/* Handover status */}
                                    <td style={css.td}>
                                        <input
                                            className="tr-cell"
                                            style={{ ...css.cell, width: 94 }}
                                            value={row.handoverStatus || ""}
                                            onChange={e => updateRow(row._id, "handoverStatus", e.target.value)}
                                            placeholder="Status"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                        <tfoot>
                            <tr style={{ background: "#f1f5f9", borderTop: "2px solid #cbd5e1" }}>
                                <td colSpan={9} style={{ padding: "10px 14px", fontWeight: 800, fontSize: 12, color: "#1e293b" }}>
                                    TOTAL &nbsp;
                                    <span style={{ color: "#0284c7" }}>Sqft: {totalSqft.toFixed(2)}</span>
                                </td>
                                <td colSpan={3} />
                                {ALL_SECTIONS.map(sec =>
                                    SECTION_SUB_COLS[sec].map(sub => {
                                        const fkey = `${sec}__${sub}`;
                                        const total = rows.reduce((s, r) => s + (parseFloat(r[fkey]) || 0), 0);
                                        return (
                                            <td key={fkey}
                                                style={{ padding: "10px 6px", textAlign: "right", fontWeight: 700, fontSize: 11, color: sectionColors[sec].text }}>
                                                {total > 0 ? total.toFixed(2) : ""}
                                            </td>
                                        );
                                    })
                                )}
                                <td />
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Summary strip */}
            <div style={css.summaryStrip}>
                {[
                    { label: "Project",    val: selectedProject?.projectName || "—", color: "#1e293b" },
                    { label: "Work Order", val: selectedWO?.workOrderNo || "—",       color: "#0284c7" },
                    { label: "Tower",      val: selectedWO?.towerName   || "—",       color: "#d97706" },
                    { label: "Total Rows", val: rows.length,                          color: "#475569" },
                    { label: "Total Sqft", val: totalSqft.toFixed(2),                color: "#0284c7" },
                    { label: "DB Status",  val: sheetId ? "Saved" : "Not saved",      color: sheetId ? "#16a34a" : "#94a3b8" },
                ].map(s => (
                    <div key={s.label} style={css.summaryItem}>
                        <span style={css.summaryLabel}>{s.label}</span>
                        <span style={{ fontSize: 14, fontWeight: 800, color: s.color }}>{s.val}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const css = {
    page:            { maxWidth: 1600, margin: "0 auto", padding: "0 4px 56px", fontFamily: "'Inter',-apple-system,sans-serif" },
    pageHeader:      { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, padding: "28px 0 20px", flexWrap: "wrap" },
    headerIcon:      { width: 44, height: 44, background: "linear-gradient(135deg,#f59e0b,#d97706)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 20 },
    pageTitle:       { margin: 0, fontSize: 22, fontWeight: 800, color: "#0f172a" },
    pageSubtitle:    { margin: "3px 0 0", fontSize: 13, color: "#64748b" },
    backBtn:         { background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 13, color: "#64748b", fontWeight: 500, display: "flex", alignItems: "center", gap: 6, marginBottom: 4 },
    metaLine:        { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 4 },
    projBadge:       { background: "#e0f2fe", color: "#0284c7", fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 12 },
    woBadge:         { background: "#ede9fe", color: "#7c3aed", fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 12 },
    towerBadge:      { background: "#fef3c7", color: "#92400e", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 10, border: "1px solid #fde68a" },
    saveBtn:         { display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "#10b981", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13, transition: "all 0.2s" },
    excelBtn:        { display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13, transition: "all 0.2s" },
    toast:           { display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500, marginBottom: 16, border: "1px solid" },
    toastOk:         { background: "#ecfdf5", color: "#047857", borderColor: "#a7f3d0" },
    toastErr:        { background: "#fef2f2", color: "#b91c1c", borderColor: "#fecaca" },
    tableCard:       { background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 1px 6px rgba(0,0,0,0.04)", marginBottom: 20, overflow: "hidden" },
    th:              { padding: "10px 8px", fontWeight: 700, textAlign: "left", fontSize: 11, borderRight: "1px solid rgba(255,255,255,0.15)", verticalAlign: "middle", whiteSpace: "nowrap" },
    td:              { padding: "4px 5px", verticalAlign: "middle" },
    cell:            { padding: "5px 7px", border: "1px solid #cbd5e1", borderRadius: 4, fontSize: 11, color: "#0f172a", background: "#fff", outline: "none" },
    autoCell:        { padding: "5px 8px", background: "#f1f5f9", borderRadius: 4, fontSize: 11, color: "#475569", fontWeight: 500, border: "1px solid #e2e8f0", minWidth: 40, textAlign: "right" },
    cellAutoDriven:  { background: "#eff6ff", color: "#0284c7", cursor: "not-allowed", fontWeight: 700, borderColor: "#bfdbfe" },
    summaryStrip:    { display: "flex", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" },
    summaryItem:     { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "14px 10px", borderRight: "1px solid #e2e8f0" },
    summaryLabel:    { fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 },
    selectionPanels: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 },
    selPanel:        { background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 2px 6px rgba(0,0,0,0.04)" },
    selPanelHeader:  { display: "flex", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid #f1f5f9", background: "#fafbfc" },
    searchBox:       { display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" },
    searchInput:     { border: "none", background: "transparent", outline: "none", fontSize: 13, flex: 1 },
    selList:         { maxHeight: 320, overflowY: "auto" },
    selItem:         { padding: "12px 18px", cursor: "pointer", borderBottom: "1px solid #f8fafc", borderLeft: "3px solid transparent", transition: "all 0.15s" },
    selItemActive:   { background: "#eff6ff", borderLeft: "3px solid #0284c7" },
    centerMsg:       { padding: "30px", textAlign: "center", color: "#94a3b8", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
};
