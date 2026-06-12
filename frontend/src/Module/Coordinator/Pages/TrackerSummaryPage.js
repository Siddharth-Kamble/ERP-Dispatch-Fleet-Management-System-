//import React, { useState, useEffect } from "react";
//import { useNavigate } from "react-router-dom";
//import {
//    FaChartBar, FaSearch, FaBuilding, FaClipboardList,
//    FaSpinner, FaFilePdf, FaFileExcel, FaEye
//} from "react-icons/fa";
//import jsPDF from "jspdf";
//import autoTable from "jspdf-autotable";
//import * as XLSX from "xlsx-js-style";
//
//const SUB_COLS = ["FRAME","DOOR FRAME","SHUTTER","OPENABLE DOOR","FIX GLASS","TOP / BOTTOM FIX"];
//const HANDOVER_SUB_COLS = [...SUB_COLS, "HARDWARE"];
//
//export default function SummaryPage() {
//    const navigate = useNavigate();
//
//    const [projects,        setProjects]        = useState([]);
//    const [selectedProject, setSelectedProject] = useState(null);
//    const [workOrders,      setWorkOrders]       = useState([]);
//    const [selectedWO,      setSelectedWO]       = useState(null);
//    const [trackerSheet,    setTrackerSheet]     = useState(null);
//    const [summaryData,     setSummaryData]      = useState(null);
//    const [search,          setSearch]           = useState("");
//    const [loadingProjects, setLoadingProjects]  = useState(true);
//    const [loadingWOs,      setLoadingWOs]       = useState(false);
//    const [loadingTracker,  setLoadingTracker]   = useState(false);
//    const [exportingPdf,    setExportingPdf]     = useState(false);
//    const [exportingXlsx,   setExportingXlsx]    = useState(false);
//    const [step,            setStep]             = useState("project"); // project | wo | view
//
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
//        setTrackerSheet(null);
//        setSummaryData(null);
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
//        setTrackerSheet(null);
//        setSummaryData(null);
//        setLoadingTracker(true);
//        try {
//            // Load tracker sheet
//            const tsRes  = await fetch(
//                `${process.env.REACT_APP_API_URL}/api/tracker-sheets/by-work-order/${wo.id}`
//            );
//            if (!tsRes.ok) throw new Error("No tracker sheet");
//            const ts = await tsRes.json();
//            setTrackerSheet(ts);
//
//            // Load summary data
//            const sumRes = await fetch(
//                `${process.env.REACT_APP_API_URL}/api/tracker-sheets/${ts.id}/summary`
//            );
//            const sum = await sumRes.json();
//            setSummaryData(sum);
//            setStep("view");
//        } catch {
//            setTrackerSheet(null);
//            setSummaryData(null);
//        } finally {
//            setLoadingTracker(false);
//        }
//    };
//
//    const filtered = projects.filter(p =>
//        p.projectName?.toLowerCase().includes(search.toLowerCase()) ||
//        p.projectCode?.toLowerCase().includes(search.toLowerCase())
//    );
//
//    // ── PDF Export ────────────────────────────────────────────────────────────
//    const exportPDF = async () => {
//        if (!trackerSheet || !summaryData) return;
//        setExportingPdf(true);
//        try {
//            const doc  = new jsPDF({ orientation: "landscape", unit: "mm", format: "a3" });
//            const rows = trackerSheet.rows || [];
//            const proj = selectedProject?.projectName || "";
//            const wo   = selectedWO?.workOrderNo || "";
//            const tower= selectedWO?.towerName || "";
//
//            // Title
//            doc.setFontSize(16);
//            doc.setFont("helvetica", "bold");
//            doc.text(`PROJECT: ${proj}   |   WO: ${wo}   |   Tower: ${tower}`, 14, 16);
//            doc.setFontSize(9);
//            doc.setFont("helvetica", "normal");
//
//            // Main tracker table
//            const head = [[
//                "SR","FLAT","LOCATION","WCODE","TYPOLOGY","SERIES",
//                "WO LNT","WO HGT","SQFT","LENGTH","HEIGHT","JOB CARD",
//                "DC-FRAME","DC-DOOR","DC-SHUT","DC-OD","DC-FG","DC-TB",
//                "ST-FRAME","ST-DOOR","ST-SHUT","ST-OD","ST-FG","ST-TB",
//                "SUP-FRAME","SUP-DOOR","SUP-SHUT","SUP-OD","SUP-FG","SUP-TB",
//                "INS-FRAME","INS-DOOR","INS-SHUT","INS-OD","INS-FG","INS-TB",
//                "H-FRAME","H-DOOR","H-SHUT","H-OD","H-FG","H-TB","H-HW",
//            ]];
//            const body = rows.map(r => [
//                r.srNo||"", r.flat||"", r.location||"", r.wcode||"",
//                r.typology||"", r.series||"",
//                r.woLnt||"", r.woHgt||"", r.sqft ? parseFloat(r.sqft).toFixed(2) : "",
//                r.length||"", r.height||"", r.jobCard||"",
//                r.dcnoFrame||0, r.dcnoDoorFrame||0, r.dcnoShutter||0,
//                r.dcnoOpenableDoor||0, r.dcnoFixGlass||0, r.dcnoTopBottomFix||0,
//                r.statusFrame||"", r.statusDoorFrame||"", r.statusShutter||"",
//                r.statusOpenableDoor||"", r.statusFixGlass||"", r.statusTopBottomFix||"",
//                r.supplyFrame||0, r.supplyDoorFrame||0, r.supplyShutter||0,
//                r.supplyOpenableDoor||0, r.supplyFixGlass||0, r.supplyTopBottomFix||0,
//                r.installFrame||0, r.installDoorFrame||0, r.installShutter||0,
//                r.installOpenableDoor||0, r.installFixGlass||0, r.installTopBottomFix||0,
//                r.handoverFrame||0, r.handoverDoorFrame||0, r.handoverShutter||0,
//                r.handoverOpenableDoor||0, r.handoverFixGlass||0, r.handoverTopBottomFix||0,
//                r.handoverHardware||0,
//            ]);
//
//            autoTable(doc, {
//                head, body, startY: 22, theme: "grid",
//                headStyles: { fillColor: [30,41,59], textColor:255, fontSize:6, halign:"center" },
//                bodyStyles: { fontSize: 6 },
//                columnStyles: { 0:{cellWidth:8}, 1:{cellWidth:10}, 2:{cellWidth:22},
//                    3:{cellWidth:12}, 4:{cellWidth:28}, 5:{cellWidth:10} },
//            });
//
//            // Summary table
//            const sy = doc.lastAutoTable.finalY + 10;
//            doc.setFontSize(12);
//            doc.setFont("helvetica","bold");
//            doc.text("SUMMARY", 14, sy);
//
//            const sumBody = [
//                ["Total Window Qty",              summaryData.totalWindowQty],
//                ["Total Sizes Received",           summaryData.totalSizesReceived],
//                ["Total Track Received",           summaryData.totalTrackReceived],
//                ["Total Shutter Received",         summaryData.totalShutterReceived],
//                ["Total Track Installation",       summaryData.totalTrackInstallation],
//                ["Total Shutter Installation",     summaryData.totalShutterInstallation],
//                ["Pending Sizes",                  summaryData.pendingSizes],
//                ["Total Measurement (sqft)",       parseFloat(summaryData.totalMeasurementSqft).toFixed(2)],
//                ["Total Frame Supplied (sqft)",    parseFloat(summaryData.totalFrameSuppliedSqft).toFixed(2)],
//                ["Total Frame Installed (sqft)",   parseFloat(summaryData.totalFrameInstalledSqft).toFixed(2)],
//                ["Total Shutter Supplied (sqft)",  parseFloat(summaryData.totalShutterSuppliedSqft).toFixed(2)],
//                ["Total Shutter Installed (sqft)", parseFloat(summaryData.totalShutterInstalledSqft).toFixed(2)],
//                ["Total Window Handover (sqft)",   parseFloat(summaryData.totalHandoverSqft).toFixed(2)],
//            ];
//            autoTable(doc, {
//                body: sumBody, startY: sy + 6, theme: "grid", tableWidth: 120,
//                bodyStyles: { fontSize: 9 },
//                columnStyles: {
//                    0: { fontStyle:"bold", fillColor:[241,245,249], cellWidth:80 },
//                    1: { halign:"right", cellWidth:40 },
//                },
//            });
//
//            doc.save(`Summary_${proj}_${wo}.pdf`);
//        } catch (err) {
//            alert("PDF export failed: " + err.message);
//        } finally {
//            setExportingPdf(false);
//        }
//    };
//
//    // ── Excel Export ──────────────────────────────────────────────────────────
//    const exportExcel = () => {
//        if (!trackerSheet || !summaryData) return;
//        setExportingXlsx(true);
//        try {
//            const wb   = XLSX.utils.book_new();
//            const rows = trackerSheet.rows || [];
//            const proj = selectedProject?.projectName || "";
//            const wo   = selectedWO?.workOrderNo || "";
//
//            // ── Sheet 1: Tracker (view-only data) ────────────────────────────
//            buildTrackerSheet(wb, rows, proj, wo, selectedWO?.towerName || "");
//
//            // ── Sheet 2: Summary ──────────────────────────────────────────────
//            buildSummarySheet(wb, summaryData, proj, wo);
//
//            XLSX.writeFile(wb, `Summary_${proj}_${wo}.xlsx`);
//        } catch (err) {
//            alert("Excel export failed: " + err.message);
//        } finally {
//            setExportingXlsx(false);
//        }
//    };
//
//    const totalSqft = (trackerSheet?.rows || [])
//        .reduce((s, r) => s + (parseFloat(r.sqft) || 0), 0);
//
//    // ── Render ────────────────────────────────────────────────────────────────
//    return (
//        <div style={css.page}>
//            <style>{`
//                @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
//                .sum-proj:hover { background: #eff6ff !important; }
//                .sum-wo:hover   { background: #f0fdf4 !important; }
//            `}</style>
//
//            {/* Header */}
//            <div style={css.pageHeader}>
//                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
//                    <div style={css.headerIcon}><FaChartBar /></div>
//                    <div>
//                        <h1 style={css.pageTitle}>Tracker Summary</h1>
//                        <p style={css.pageSubtitle}>
//                            Select project → work order → view tracker + download report
//                        </p>
//                    </div>
//                </div>
//                {step === "view" && trackerSheet && (
//                    <div style={{ display:"flex", gap:10 }}>
//                        <button style={css.pdfBtn} onClick={exportPDF} disabled={exportingPdf}>
//                            {exportingPdf
//                                ? <FaSpinner style={{ animation:"spin 1s linear infinite" }} />
//                                : <FaFilePdf />}
//                            &nbsp;PDF
//                        </button>
//                        <button style={css.xlsxBtn} onClick={exportExcel} disabled={exportingXlsx}>
//                            {exportingXlsx
//                                ? <FaSpinner style={{ animation:"spin 1s linear infinite" }} />
//                                : <FaFileExcel />}
//                            &nbsp;Excel
//                        </button>
//                    </div>
//                )}
//            </div>
//
//            <div style={css.panels}>
//                {/* LEFT: Project + WO selectors */}
//                <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
//                    {/* Projects */}
//                    <div style={css.selPanel}>
//                        <div style={css.selPanelHeader}>
//                            <FaBuilding style={{ color:"#0ea5e9", marginRight:8 }} />
//                            <span style={{ fontWeight:700, fontSize:14 }}>Projects</span>
//                        </div>
//                        <div style={css.searchBox}>
//                            <FaSearch style={{ color:"#94a3b8", fontSize:12 }} />
//                            <input style={css.searchInput} placeholder="Search…"
//                                value={search} onChange={e => setSearch(e.target.value)} />
//                        </div>
//                        <div style={css.selList}>
//                            {loadingProjects ? (
//                                <div style={css.centerMsg}>
//                                    <FaSpinner style={{ animation:"spin 1s linear infinite" }} />&nbsp;Loading…
//                                </div>
//                            ) : filtered.map(p => (
//                                <div key={p.projectId} className="sum-proj"
//                                    style={{ ...css.selItem, ...(selectedProject?.projectId === p.projectId ? css.selItemActive : {}) }}
//                                    onClick={() => handleSelectProject(p)}>
//                                    <div style={{ fontWeight:700, fontSize:13, color:"#1e293b" }}>{p.projectName}</div>
//                                    <div style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>{p.projectCode}</div>
//                                </div>
//                            ))}
//                        </div>
//                    </div>
//
//                    {/* Work Orders */}
//                    {selectedProject && (
//                        <div style={css.selPanel}>
//                            <div style={css.selPanelHeader}>
//                                <FaClipboardList style={{ color:"#8b5cf6", marginRight:8 }} />
//                                <span style={{ fontWeight:700, fontSize:14 }}>
//                                    Work Orders ({workOrders.length})
//                                </span>
//                            </div>
//                            <div style={css.selList}>
//                                {loadingWOs ? (
//                                    <div style={css.centerMsg}>
//                                        <FaSpinner style={{ animation:"spin 1s linear infinite" }} />&nbsp;Loading…
//                                    </div>
//                                ) : workOrders.length === 0 ? (
//                                    <div style={css.centerMsg}>No work orders found</div>
//                                ) : workOrders.map(wo => (
//                                    <div key={wo.id} className="sum-wo"
//                                        style={{ ...css.selItem, ...(selectedWO?.id === wo.id ? css.selItemActiveGreen : {}) }}
//                                        onClick={() => handleSelectWO(wo)}>
//                                        <div style={{ fontWeight:700, fontSize:13, color:"#1e293b" }}>{wo.workOrderNo}</div>
//                                        <div style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>
//                                            {wo.towerName && (
//                                                <span style={css.towerBadge}>{wo.towerName}</span>
//                                            )}
//                                            &nbsp;{wo.items?.length || 0} items
//                                        </div>
//                                    </div>
//                                ))}
//                            </div>
//                        </div>
//                    )}
//                </div>
//
//                {/* RIGHT: Summary cards + view-only tracker */}
//                <div style={{ flex:1, minWidth:0 }}>
//                    {step !== "view" && !loadingTracker && (
//                        <div style={css.emptyState}>
//                            <FaChartBar style={{ fontSize:52, color:"#cbd5e1", marginBottom:16 }} />
//                            <div style={{ fontSize:17, color:"#94a3b8", fontWeight:600 }}>
//                                {step === "project" ? "Select a project" : "Select a work order"}
//                            </div>
//                        </div>
//                    )}
//
//                    {loadingTracker && (
//                        <div style={css.centerMsg}>
//                            <FaSpinner style={{ animation:"spin 1s linear infinite", marginRight:8 }} />
//                            Loading tracker data…
//                        </div>
//                    )}
//
//                    {step === "view" && summaryData && !loadingTracker && (
//                        <>
//                            {/* Summary cards */}
//                            <div style={css.summaryGrid}>
//                                {[
//                                    { label:"Total Windows",         val: summaryData.totalWindowQty,          color:"#0284c7", bg:"#e0f2fe" },
//                                    { label:"Sizes Received",        val: summaryData.totalSizesReceived,      color:"#16a34a", bg:"#dcfce7" },
//                                    { label:"Track Received",        val: summaryData.totalTrackReceived,      color:"#d97706", bg:"#fef3c7" },
//                                    { label:"Track Installed",       val: summaryData.totalTrackInstallation,  color:"#7c3aed", bg:"#ede9fe" },
//                                    { label:"Pending Sizes",         val: summaryData.pendingSizes,            color:"#dc2626", bg:"#fef2f2" },
//                                    { label:"Measurement (sqft)",    val: parseFloat(summaryData.totalMeasurementSqft).toFixed(2), color:"#0284c7", bg:"#e0f2fe" },
//                                    { label:"Frame Supplied (sqft)", val: parseFloat(summaryData.totalFrameSuppliedSqft).toFixed(2), color:"#16a34a", bg:"#dcfce7" },
//                                    { label:"Frame Installed (sqft)",val: parseFloat(summaryData.totalFrameInstalledSqft).toFixed(2), color:"#7c3aed", bg:"#ede9fe" },
//                                    { label:"Handover (sqft)",       val: parseFloat(summaryData.totalHandoverSqft).toFixed(2), color:"#d97706", bg:"#fef3c7" },
//                                ].map(card => (
//                                    <div key={card.label} style={{ ...css.summaryCard, background: card.bg }}>
//                                        <div style={{ fontSize:11, fontWeight:600, color:"#64748b", marginBottom:6, textTransform:"uppercase" }}>
//                                            {card.label}
//                                        </div>
//                                        <div style={{ fontSize:22, fontWeight:800, color: card.color }}>
//                                            {card.val}
//                                        </div>
//                                    </div>
//                                ))}
//                            </div>
//
//                            {/* Location summary table */}
//                            <div style={css.tableCard}>
//                                <div style={{ padding:"14px 18px", borderBottom:"1px solid #f1f5f9", fontWeight:700, fontSize:14, color:"#1e293b" }}>
//                                    Summary by Location
//                                </div>
//                                <div style={{ overflowX:"auto" }}>
//                                    <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
//                                        <thead>
//                                            <tr style={{ background:"#1e293b" }}>
//                                                {["LOCATION","WCODE","Total Windows","Sizes Received","Track Received",
//                                                  "Shutter Received","Track Installed","Shutter Installed","Pending"].map(h => (
//                                                    <th key={h} style={css.th}>{h}</th>
//                                                ))}
//                                            </tr>
//                                        </thead>
//                                        <tbody>
//                                            {(summaryData.locationRows || []).map((row, i) => (
//                                                <tr key={i} style={{ background: i%2===0?"#fff":"#f8fafc", borderBottom:"1px solid #f1f5f9" }}>
//                                                    <td style={css.td}>{row.location}</td>
//                                                    <td style={css.td}>{row.wcode}</td>
//                                                    <td style={{ ...css.td, textAlign:"right" }}>{row.totalWindowQty}</td>
//                                                    <td style={{ ...css.td, textAlign:"right" }}>{row.totalSizesReceived}</td>
//                                                    <td style={{ ...css.td, textAlign:"right" }}>{row.totalTrackReceived}</td>
//                                                    <td style={{ ...css.td, textAlign:"right" }}>{row.totalShutterReceived}</td>
//                                                    <td style={{ ...css.td, textAlign:"right" }}>{row.totalTrackInstallation}</td>
//                                                    <td style={{ ...css.td, textAlign:"right" }}>{row.totalShutterInstallation}</td>
//                                                    <td style={{ ...css.td, textAlign:"right", color:"#dc2626", fontWeight:600 }}>{row.pendingSizes}</td>
//                                                </tr>
//                                            ))}
//                                            {/* Total row */}
//                                            <tr style={{ background:"#f1f5f9", borderTop:"2px solid #cbd5e1", fontWeight:700 }}>
//                                                <td style={css.td} colSpan={2}>TOTAL</td>
//                                                <td style={{ ...css.td, textAlign:"right" }}>{summaryData.totalWindowQty}</td>
//                                                <td style={{ ...css.td, textAlign:"right" }}>{summaryData.totalSizesReceived}</td>
//                                                <td style={{ ...css.td, textAlign:"right" }}>{summaryData.totalTrackReceived}</td>
//                                                <td style={{ ...css.td, textAlign:"right" }}>{summaryData.totalShutterReceived}</td>
//                                                <td style={{ ...css.td, textAlign:"right" }}>{summaryData.totalTrackInstallation}</td>
//                                                <td style={{ ...css.td, textAlign:"right" }}>{summaryData.totalShutterInstallation}</td>
//                                                <td style={{ ...css.td, textAlign:"right", color:"#dc2626", fontWeight:700 }}>{summaryData.pendingSizes}</td>
//                                            </tr>
//                                        </tbody>
//                                    </table>
//                                </div>
//                            </div>
//
//                            {/* View-only tracker table */}
//                            <div style={{ ...css.tableCard, marginTop:20 }}>
//                                <div style={{ padding:"14px 18px", borderBottom:"1px solid #f1f5f9", display:"flex", alignItems:"center", gap:10 }}>
//                                    <FaEye style={{ color:"#0284c7" }} />
//                                    <span style={{ fontWeight:700, fontSize:14, color:"#1e293b" }}>
//                                        Tracker Data (View Only)
//                                    </span>
//                                    <span style={{ fontSize:12, color:"#64748b" }}>
//                                        {trackerSheet.rows?.length || 0} rows — {totalSqft.toFixed(2)} sqft
//                                    </span>
//                                </div>
//                                <div style={{ overflowX:"auto" }}>
//                                    <table style={{ borderCollapse:"collapse", fontSize:10, whiteSpace:"nowrap" }}>
//                                        <thead>
//                                            <tr>
//                                                {["SR","FLAT","LOCATION","WCODE","TYPOLOGY","SERIES",
//                                                  "WO LNT","WO HGT","SQFT","LENGTH","HEIGHT","JOB CARD"].map(h => (
//                                                    <th key={h} style={{ ...css.th, background:"#1e293b" }}>{h}</th>
//                                                ))}
//                                                {[
//                                                    { label:"DC.NO",        cols: SUB_COLS,         bg:"#7D6608" },
//                                                    { label:"STATUS",       cols: SUB_COLS,         bg:"#8B0000" },
//                                                    { label:"SUPPLY",       cols: SUB_COLS,         bg:"#1A5276" },
//                                                    { label:"INSTALLATION", cols: SUB_COLS,         bg:"#1E8449" },
//                                                    { label:"HANDOVER",     cols: HANDOVER_SUB_COLS,bg:"#4A235A" },
//                                                ].map(sec =>
//                                                    sec.cols.map((sub, si) => (
//                                                        <th key={`${sec.label}_${sub}`}
//                                                            style={{ ...css.th, background: sec.bg, fontSize:9, minWidth:70 }}>
//                                                            {si === 0 ? `${sec.label}: ` : ""}{sub}
//                                                        </th>
//                                                    ))
//                                                )}
//                                            </tr>
//                                        </thead>
//                                        <tbody>
//                                            {(trackerSheet.rows || []).map((row, idx) => (
//                                                <tr key={row.id || idx}
//                                                    style={{ background: idx%2===0?"#fff":"#f8fafc", borderBottom:"1px solid #e2e8f0" }}>
//                                                    <td style={css.tdv}>{row.srNo}</td>
//                                                    <td style={css.tdv}>{row.flat}</td>
//                                                    <td style={css.tdv}>{row.location}</td>
//                                                    <td style={css.tdv}>{row.wcode}</td>
//                                                    <td style={{ ...css.tdv, maxWidth:160, overflow:"hidden", textOverflow:"ellipsis" }}>{row.typology}</td>
//                                                    <td style={css.tdv}>{row.series}</td>
//                                                    <td style={{ ...css.tdv, textAlign:"right" }}>{row.woLnt}</td>
//                                                    <td style={{ ...css.tdv, textAlign:"right" }}>{row.woHgt}</td>
//                                                    <td style={{ ...css.tdv, textAlign:"right", color:"#0284c7", fontWeight:600 }}>
//                                                        {row.sqft ? parseFloat(row.sqft).toFixed(2) : ""}
//                                                    </td>
//                                                    <td style={{ ...css.tdv, textAlign:"right" }}>{row.length}</td>
//                                                    <td style={{ ...css.tdv, textAlign:"right" }}>{row.height}</td>
//                                                    <td style={css.tdv}>{row.jobCard}</td>
//                                                    {/* DCNO */}
//                                                    {[row.dcnoFrame,row.dcnoDoorFrame,row.dcnoShutter,row.dcnoOpenableDoor,row.dcnoFixGlass,row.dcnoTopBottomFix].map((v,i) => (
//                                                        <td key={i} style={{ ...css.tdv, textAlign:"right", background:"#FDFDE7" }}>{v||""}</td>
//                                                    ))}
//                                                    {/* STATUS */}
//                                                    {[row.statusFrame,row.statusDoorFrame,row.statusShutter,row.statusOpenableDoor,row.statusFixGlass,row.statusTopBottomFix].map((v,i) => (
//                                                        <td key={i} style={{ ...css.tdv, textAlign:"center", background:"#FDEDEC", fontWeight:700, color:"#8B0000" }}>{v||""}</td>
//                                                    ))}
//                                                    {/* SUPPLY */}
//                                                    {[row.supplyFrame,row.supplyDoorFrame,row.supplyShutter,row.supplyOpenableDoor,row.supplyFixGlass,row.supplyTopBottomFix].map((v,i) => (
//                                                        <td key={i} style={{ ...css.tdv, textAlign:"right", background:"#EBF5FB" }}>{v ? parseFloat(v).toFixed(2) : ""}</td>
//                                                    ))}
//                                                    {/* INSTALLATION */}
//                                                    {[row.installFrame,row.installDoorFrame,row.installShutter,row.installOpenableDoor,row.installFixGlass,row.installTopBottomFix].map((v,i) => (
//                                                        <td key={i} style={{ ...css.tdv, textAlign:"right", background:"#E9F7EF" }}>{v ? parseFloat(v).toFixed(2) : ""}</td>
//                                                    ))}
//                                                    {/* HANDOVER */}
//                                                    {[row.handoverFrame,row.handoverDoorFrame,row.handoverShutter,row.handoverOpenableDoor,row.handoverFixGlass,row.handoverTopBottomFix,row.handoverHardware].map((v,i) => (
//                                                        <td key={i} style={{ ...css.tdv, textAlign:"right", background:"#F3E5F5" }}>{v ? parseFloat(v).toFixed(2) : ""}</td>
//                                                    ))}
//                                                </tr>
//                                            ))}
//                                        </tbody>
//                                    </table>
//                                </div>
//                            </div>
//                        </>
//                    )}
//
//                    {step === "view" && !trackerSheet && !loadingTracker && (
//                        <div style={css.emptyState}>
//                            <FaClipboardList style={{ fontSize:40, color:"#e2e8f0", marginBottom:12 }} />
//                            <div style={{ color:"#94a3b8", fontWeight:600 }}>No tracker sheet found for this work order</div>
//                        </div>
//                    )}
//                </div>
//            </div>
//        </div>
//    );
//}
//
//// ── Excel sheet builders ──────────────────────────────────────────────────────
//
//function buildTrackerSheet(wb, rows, projectName, workOrderNo, towerName) {
//    const ws   = {};
//    const col  = (n) => n <= 26
//        ? String.fromCharCode(64 + n)
//        : String.fromCharCode(64 + Math.floor((n-1)/26)) + String.fromCharCode(65 + ((n-1)%26));
//
//    const bdr    = (rgb="A8C4DC", style="thin") => ({ style, color:{ rgb } });
//    const allBdr = (rgb="A8C4DC") => ({ top:bdr(rgb), bottom:bdr(rgb), left:bdr(rgb), right:bdr(rgb) });
//    const setCell = (ref, value, style) => {
//        ws[ref] = { v: value ?? "", t: typeof value === "number" ? "n" : "s" };
//        if (style) ws[ref].s = style;
//    };
//
//    const SEC = {
//        BASE:    { hdr:"1E3A5F", sub:"2E5F8A", data:["EBF3FB","FFFFFF"] },
//        DCNO:    { hdr:"7D6608", sub:"F9E79F", data:["FDFDE7","FEFEF5"] },
//        STATUS:  { hdr:"8B0000", sub:"F1948A", data:["FDEDEC","FEF5F5"] },
//        SUPPLY:  { hdr:"1A5276", sub:"AED6F1", data:["EBF5FB","F8FCFE"] },
//        INSTALL: { hdr:"1E8449", sub:"A9DFBF", data:["E9F7EF","F4FCF7"] },
//        HANDOVER:{ hdr:"4A235A", sub:"CE93D8", data:["F3E5F5","FAF5FC"] },
//    };
//
//    const hStyle = (sec, isOdd) => ({
//        font:  { sz:9, name:"Calibri", color:{ rgb:"1A2940" } },
//        fill:  { patternType:"solid", fgColor:{ rgb: isOdd ? sec.data[0] : sec.data[1] } },
//        alignment: { horizontal:"right", vertical:"center" },
//        border: allBdr("D8E2EC"),
//    });
//
//    // Title row 1
//    setCell("B1", `PROJECT: ${projectName}   |   WO: ${workOrderNo}   |   Tower: ${towerName}`, {
//        font: { bold:true, sz:14, name:"Calibri", color:{ rgb:"0070C0" } },
//        alignment: { horizontal:"center", vertical:"center" },
//    });
//
//    // Section headers row 2
//    const secHdrs = [
//        { label:"DC.NO",        c:20, span:6, sec:SEC.DCNO    },
//        { label:"STATUS",       c:26, span:7, sec:SEC.STATUS  },
//        { label:"SUPPLY",       c:33, span:6, sec:SEC.SUPPLY  },
//        { label:"INSTALLATION", c:39, span:6, sec:SEC.INSTALL },
//        { label:"HANDOVER",     c:45, span:7, sec:SEC.HANDOVER},
//    ];
//    secHdrs.forEach(({ label, c, sec }) => {
//        setCell(`${col(c)}2`, label, {
//            font:  { bold:true, sz:11, name:"Calibri", color:{ rgb:"FFFFFF" } },
//            fill:  { patternType:"solid", fgColor:{ rgb:sec.hdr } },
//            alignment: { horizontal:"center", vertical:"center" },
//            border: allBdr("000000"),
//        });
//    });
//
//    // Sub-headers row 3
//    const subHdrs = [
//        {c:2,  label:"SR NO.",        sec:SEC.BASE},
//        {c:3,  label:"FLAT",          sec:SEC.BASE},
//        {c:4,  label:"LOCATION",      sec:SEC.BASE},
//        {c:5,  label:"WCODE",         sec:SEC.BASE},
//        {c:6,  label:"TYPOLOGY",      sec:SEC.BASE},
//        {c:7,  label:"SERIES",        sec:SEC.BASE},
//        {c:8,  label:"WO LNT",        sec:SEC.BASE},
//        {c:9,  label:"WO HGT",        sec:SEC.BASE},
//        {c:10, label:"SQ FT.",        sec:SEC.BASE},
//        {c:11, label:"LENGTH",        sec:SEC.BASE},
//        {c:12, label:"HEIGHT",        sec:SEC.BASE},
//        {c:13, label:"JOB CARD",      sec:SEC.BASE},
//        // DCNO
//        {c:14, label:"FRAME",         sec:SEC.DCNO},
//        {c:15, label:"DOOR FRAME",    sec:SEC.DCNO},
//        {c:16, label:"SHUTTER",       sec:SEC.DCNO},
//        {c:17, label:"OPENABLE DOOR", sec:SEC.DCNO},
//        {c:18, label:"FIX GLASS",     sec:SEC.DCNO},
//        {c:19, label:"TOP/BTM FIX",   sec:SEC.DCNO},
//        // STATUS
//        {c:20, label:"FRAME",         sec:SEC.STATUS},
//        {c:21, label:"DOOR FRAME",    sec:SEC.STATUS},
//        {c:22, label:"SHUTTER",       sec:SEC.STATUS},
//        {c:23, label:"OPENABLE DOOR", sec:SEC.STATUS},
//        {c:24, label:"FIX GLASS",     sec:SEC.STATUS},
//        {c:25, label:"TOP/BTM FIX",   sec:SEC.STATUS},
//        {c:26, label:"HARDWARE",      sec:SEC.STATUS},
//        // SUPPLY
//        {c:27, label:"FRAME",         sec:SEC.SUPPLY},
//        {c:28, label:"DOOR FRAME",    sec:SEC.SUPPLY},
//        {c:29, label:"SHUTTER",       sec:SEC.SUPPLY},
//        {c:30, label:"OPENABLE DOOR", sec:SEC.SUPPLY},
//        {c:31, label:"FIX GLASS",     sec:SEC.SUPPLY},
//        {c:32, label:"TOP/BTM FIX",   sec:SEC.SUPPLY},
//        // INSTALLATION
//        {c:33, label:"FRAME",         sec:SEC.INSTALL},
//        {c:34, label:"DOOR FRAME",    sec:SEC.INSTALL},
//        {c:35, label:"SHUTTER",       sec:SEC.INSTALL},
//        {c:36, label:"OPENABLE DOOR", sec:SEC.INSTALL},
//        {c:37, label:"FIX GLASS",     sec:SEC.INSTALL},
//        {c:38, label:"TOP/BTM FIX",   sec:SEC.INSTALL},
//        // HANDOVER
//        {c:39, label:"FRAME",         sec:SEC.HANDOVER},
//        {c:40, label:"DOOR FRAME",    sec:SEC.HANDOVER},
//        {c:41, label:"SHUTTER",       sec:SEC.HANDOVER},
//        {c:42, label:"OPENABLE DOOR", sec:SEC.HANDOVER},
//        {c:43, label:"FIX GLASS",     sec:SEC.HANDOVER},
//        {c:44, label:"TOP/BTM FIX",   sec:SEC.HANDOVER},
//        {c:45, label:"HARDWARE",      sec:SEC.HANDOVER},
//    ];
//    subHdrs.forEach(({ c: ci, label, sec }) => {
//        setCell(`${col(ci)}3`, label, {
//            font:  { bold:true, sz:9, name:"Calibri", color:{ rgb:"000000" } },
//            fill:  { patternType:"solid", fgColor:{ rgb:sec.sub } },
//            alignment: { horizontal:"center", vertical:"center", wrapText:true },
//            border: allBdr("888888"),
//        });
//    });
//
//    // Data rows
//    rows.forEach((r, idx) => {
//        const er    = 4 + idx;
//        const isOdd = idx % 2 === 1;
//        const dc    = (ci, val, sec, isNum=false) => {
//            setCell(`${col(ci)}${er}`, val, {
//                font:  { sz:9, name:"Calibri", color:{ rgb:"1A2940" } },
//                fill:  { patternType:"solid", fgColor:{ rgb: isOdd ? sec.data[0] : sec.data[1] } },
//                alignment: { horizontal: isNum?"right":"left", vertical:"center" },
//                border: allBdr("D8E2EC"),
//            });
//        };
//        dc(2,  r.srNo||"",                          SEC.BASE);
//        dc(3,  r.flat||"",                          SEC.BASE);
//        dc(4,  r.location||"",                      SEC.BASE);
//        dc(5,  r.wcode||"",                         SEC.BASE);
//        dc(6,  r.typology||"",                      SEC.BASE);
//        dc(7,  r.series||"",                        SEC.BASE);
//        dc(8,  r.woLnt  ? Number(r.woLnt)  : "",    SEC.BASE, true);
//        dc(9,  r.woHgt  ? Number(r.woHgt)  : "",    SEC.BASE, true);
//        dc(10, r.sqft   ? parseFloat(parseFloat(r.sqft).toFixed(4)) : 0, SEC.BASE, true);
//        dc(11, r.length ? Number(r.length) : "",    SEC.BASE, true);
//        dc(12, r.height ? Number(r.height) : "",    SEC.BASE, true);
//        dc(13, r.jobCard||"",                       SEC.BASE);
//        // DCNO
//        [r.dcnoFrame,r.dcnoDoorFrame,r.dcnoShutter,r.dcnoOpenableDoor,r.dcnoFixGlass,r.dcnoTopBottomFix]
//            .forEach((v,i) => dc(14+i, v ? parseFloat(v) : 0, SEC.DCNO, true));
//        // STATUS
//        [r.statusFrame,r.statusDoorFrame,r.statusShutter,r.statusOpenableDoor,r.statusFixGlass,r.statusTopBottomFix]
//            .forEach((v,i) => setCell(`${col(20+i)}${er}`, v||"", hStyle(SEC.STATUS, isOdd)));
//        dc(26, "", SEC.STATUS);
//        // SUPPLY
//        [r.supplyFrame,r.supplyDoorFrame,r.supplyShutter,r.supplyOpenableDoor,r.supplyFixGlass,r.supplyTopBottomFix]
//            .forEach((v,i) => dc(27+i, v ? parseFloat(v) : 0, SEC.SUPPLY, true));
//        // INSTALLATION
//        [r.installFrame,r.installDoorFrame,r.installShutter,r.installOpenableDoor,r.installFixGlass,r.installTopBottomFix]
//            .forEach((v,i) => dc(33+i, v ? parseFloat(v) : 0, SEC.INSTALL, true));
//        // HANDOVER
//        [r.handoverFrame,r.handoverDoorFrame,r.handoverShutter,r.handoverOpenableDoor,r.handoverFixGlass,r.handoverTopBottomFix]
//            .forEach((v,i) => dc(39+i, v ? parseFloat(v) : 0, SEC.HANDOVER, true));
//        dc(45, r.handoverHardware ? parseFloat(r.handoverHardware) : 0, SEC.HANDOVER, true);
//    });
//
//    ws["!ref"]  = `A1:${col(45)}${4+rows.length+2}`;
//    ws["!cols"] = [
//        {wch:4},{wch:6},{wch:8},{wch:22},{wch:10},{wch:30},{wch:8},
//        {wch:9},{wch:9},{wch:10},{wch:9},{wch:9},{wch:12},
//        ...Array(6).fill({wch:11}),   // DCNO
//        ...Array(7).fill({wch:11}),   // STATUS
//        ...Array(6).fill({wch:11}),   // SUPPLY
//        ...Array(6).fill({wch:11}),   // INSTALLATION
//        ...Array(7).fill({wch:11}),   // HANDOVER
//    ];
//    ws["!rows"] = [{hpt:24},{hpt:40},{hpt:80},...Array(rows.length).fill({hpt:22})];
//    ws["!merges"] = [
//        { s:{r:0,c:1}, e:{r:0,c:44} },
//        ...Array.from({length:13},(_,i)=>({ s:{r:1,c:1+i}, e:{r:2,c:1+i} })),
//        { s:{r:1,c:13}, e:{r:1,c:18} },
//        { s:{r:1,c:19}, e:{r:1,c:25} },
//        { s:{r:1,c:26}, e:{r:1,c:31} },
//        { s:{r:1,c:32}, e:{r:1,c:37} },
//        { s:{r:1,c:38}, e:{r:1,c:44} },
//    ];
//
//    XLSX.utils.book_append_sheet(wb, ws, "Tracker");
//}
//
//function buildSummarySheet(wb, summaryData, projectName, workOrderNo) {
//    const wsData = [];
//    wsData.push([`${projectName} — ${workOrderNo}`, "", "", "", "", "", "", "", ""]);
//    wsData.push([]);
//    wsData.push(["LOCATION","WCODE","Total Windows","Sizes Received","Track Received",
//                 "Shutter Received","Track Installed","Shutter Installed","Pending Sizes"]);
//
//    (summaryData.locationRows || []).forEach(row => {
//        wsData.push([
//            row.location, row.wcode,
//            row.totalWindowQty, row.totalSizesReceived, row.totalTrackReceived,
//            row.totalShutterReceived, row.totalTrackInstallation,
//            row.totalShutterInstallation, row.pendingSizes,
//        ]);
//    });
//
//    wsData.push(["TOTAL","",
//        summaryData.totalWindowQty, summaryData.totalSizesReceived,
//        summaryData.totalTrackReceived, summaryData.totalShutterReceived,
//        summaryData.totalTrackInstallation, summaryData.totalShutterInstallation,
//        summaryData.pendingSizes,
//    ]);
//    wsData.push([]);
//    wsData.push(["Total Window's qty",       "", summaryData.totalWindowQty]);
//    wsData.push(["Total Sizes Release qty",  "", summaryData.totalSizesReceived]);
//    wsData.push(["TOTAL WINDOW RECEIVED",    "", summaryData.totalTrackReceived]);
//    wsData.push(["TOTAL WINDOW INSTALLED",   "", summaryData.totalTrackInstallation]);
//    wsData.push(["TOTAL INSTALLATION PENDING","", summaryData.totalWindowQty - summaryData.totalTrackInstallation]);
//    wsData.push(["TOTAL DISPATCH PENDING",   "", summaryData.totalWindowQty - summaryData.totalTrackReceived]);
//    wsData.push(["TOTAL PENDING SIZES",      "", summaryData.pendingSizes]);
//    wsData.push([]);
//    wsData.push([projectName]);
//    wsData.push(["TOTAL WINDOW HANDOVER",         "IN SFT", parseFloat(summaryData.totalHandoverSqft).toFixed(4)]);
//    wsData.push(["TOTAL WINDOW SHUTTER INSTALLED","IN SFT", parseFloat(summaryData.totalShutterInstalledSqft).toFixed(4)]);
//    wsData.push(["TOTAL WINDOW FRAME INSTALLED",  "IN SFT", parseFloat(summaryData.totalFrameInstalledSqft).toFixed(4)]);
//    wsData.push(["TOTAL WINDOW SHUTTER SUPPLIED", "IN SFT", parseFloat(summaryData.totalShutterSuppliedSqft).toFixed(4)]);
//    wsData.push(["TOTAL WINDOW FRAME SUPPLIED",   "IN SFT", parseFloat(summaryData.totalFrameSuppliedSqft).toFixed(4)]);
//    wsData.push(["TOTAL MEASUREMENT RECEIVED",    "IN SFT", parseFloat(summaryData.totalMeasurementSqft).toFixed(4)]);
//    wsData.push(["Frame Supply Balance",           "IN SFT",
//        parseFloat(summaryData.totalMeasurementSqft - summaryData.totalFrameSuppliedSqft).toFixed(4)]);
//    wsData.push(["Shutter Supply Balance",         "IN SFT",
//        parseFloat(summaryData.totalMeasurementSqft - summaryData.totalShutterSuppliedSqft).toFixed(4)]);
//    wsData.push(["Frame Installation Balance",     "IN SFT",
//        parseFloat(summaryData.totalMeasurementSqft - summaryData.totalFrameInstalledSqft).toFixed(4)]);
//    wsData.push(["Shutter Installation Balance",   "IN SFT",
//        parseFloat(summaryData.totalMeasurementSqft - summaryData.totalShutterInstalledSqft).toFixed(4)]);
//
//    const ws = XLSX.utils.aoa_to_sheet(wsData);
//    ws["!cols"] = [{wch:32},{wch:10},{wch:14},{wch:16},{wch:16},{wch:18},{wch:18},{wch:20},{wch:14}];
//    XLSX.utils.book_append_sheet(wb, ws, "Summary");
//}
//
//// ── Styles ────────────────────────────────────────────────────────────────────
//const css = {
//    page:             { maxWidth:1600, margin:"0 auto", padding:"0 4px 56px", fontFamily:"'Inter',-apple-system,sans-serif" },
//    pageHeader:       { display:"flex", alignItems:"center", justifyContent:"space-between", gap:20, padding:"28px 0 20px", flexWrap:"wrap" },
//    headerIcon:       { width:48, height:48, background:"linear-gradient(135deg,#6366f1,#4f46e5)", borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:22 },
//    pageTitle:        { margin:0, fontSize:24, fontWeight:800, color:"#1e293b" },
//    pageSubtitle:     { margin:"3px 0 0", fontSize:13, color:"#64748b" },
//    panels:           { display:"grid", gridTemplateColumns:"320px 1fr", gap:20, alignItems:"start" },
//    selPanel:         { background:"#fff", borderRadius:12, border:"1px solid #e2e8f0", overflow:"hidden", boxShadow:"0 2px 6px rgba(0,0,0,0.04)" },
//    selPanelHeader:   { display:"flex", alignItems:"center", padding:"14px 18px", borderBottom:"1px solid #f1f5f9", background:"#fafbfc" },
//    searchBox:        { display:"flex", alignItems:"center", gap:8, padding:"10px 14px", borderBottom:"1px solid #f1f5f9", background:"#f8fafc" },
//    searchInput:      { border:"none", background:"transparent", outline:"none", fontSize:13, flex:1 },
//    selList:          { maxHeight:260, overflowY:"auto" },
//    selItem:          { padding:"12px 18px", cursor:"pointer", borderBottom:"1px solid #f8fafc", borderLeft:"3px solid transparent", transition:"all 0.15s" },
//    selItemActive:    { background:"#eff6ff", borderLeft:"3px solid #0284c7" },
//    selItemActiveGreen:{ background:"#f0fdf4", borderLeft:"3px solid #16a34a" },
//    towerBadge:       { background:"#fef3c7", color:"#92400e", fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:10, border:"1px solid #fde68a" },
//    emptyState:       { display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"80px 40px", background:"#fff", borderRadius:16, border:"1px solid #e2e8f0" },
//    centerMsg:        { padding:"40px", textAlign:"center", color:"#94a3b8", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", gap:8 },
//    summaryGrid:      { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:12, marginBottom:20 },
//    summaryCard:      { borderRadius:10, padding:"14px 16px", border:"1px solid #e2e8f0" },
//    tableCard:        { background:"#fff", borderRadius:12, border:"1px solid #e2e8f0", boxShadow:"0 1px 6px rgba(0,0,0,0.04)", overflow:"hidden" },
//    th:               { padding:"9px 10px", color:"#f8fafc", fontWeight:600, textAlign:"left", fontSize:11, borderRight:"1px solid rgba(255,255,255,0.15)", whiteSpace:"nowrap" },
//    td:               { padding:"8px 10px", fontSize:12, color:"#1e293b", borderBottom:"1px solid #f8fafc" },
//    tdv:              { padding:"5px 7px", fontSize:10, color:"#1e293b", whiteSpace:"nowrap" },
//    pdfBtn:           { display:"flex", alignItems:"center", gap:8, padding:"10px 18px", background:"#fef2f2", color:"#dc2626", border:"1px solid #fecaca", borderRadius:8, cursor:"pointer", fontWeight:700, fontSize:13 },
//    xlsxBtn:          { display:"flex", alignItems:"center", gap:8, padding:"10px 18px", background:"#f0fdf4", color:"#16a34a", border:"1px solid #bbf7d0", borderRadius:8, cursor:"pointer", fontWeight:700, fontSize:13 },
//};


import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaChartBar, FaSearch, FaBuilding, FaClipboardList,
    FaSpinner, FaFilePdf, FaFileExcel, FaArrowLeft,
    FaCheckCircle
} from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx-js-style";

export default function TrackerSummaryPage() {
    const navigate = useNavigate();

    const [step,            setStep]            = useState("project"); // project | wo | data
    const [projects,        setProjects]        = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [workOrders,      setWorkOrders]      = useState([]);
    const [selectedWO,      setSelectedWO]      = useState(null);
    const [summaryData,     setSummaryData]     = useState(null);
    const [search,          setSearch]          = useState("");
    const [loadingProjects, setLoadingProjects] = useState(true);
    const [loadingWOs,      setLoadingWOs]      = useState(false);
    const [loadingData,     setLoadingData]     = useState(false);
    const [exportingPdf,    setExportingPdf]    = useState(false);
    const [exportingXlsx,   setExportingXlsx]   = useState(false);

    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_URL}/projects`)
            .then(r => r.json())
            .then(data => { setProjects(data); setLoadingProjects(false); })
            .catch(() => setLoadingProjects(false));
    }, []);

    const handleSelectProject = async (project) => {
        setSelectedProject(project);
        setSelectedWO(null);
        setSummaryData(null);
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
        setSummaryData(null);
        setLoadingData(true);
        try {
            // Load tracker sheet first
            const tsRes = await fetch(
                `${process.env.REACT_APP_API_URL}/api/tracker-sheets/by-work-order/${wo.id}`
            );
            if (!tsRes.ok) throw new Error("No tracker sheet found");
            const ts = await tsRes.json();

            // Load summary
            const sumRes = await fetch(
                `${process.env.REACT_APP_API_URL}/api/tracker-sheets/${ts.id}/summary`
            );
            if (!sumRes.ok) throw new Error("Failed to load summary");
            const sum = await sumRes.json();
            setSummaryData(sum);
            setStep("data");
        } catch (err) {
            alert(err.message);
        } finally {
            setLoadingData(false);
        }
    };

    const filtered = projects.filter(p =>
        p.projectName?.toLowerCase().includes(search.toLowerCase()) ||
        p.projectCode?.toLowerCase().includes(search.toLowerCase())
    );

    // ── PDF Export ────────────────────────────────────────────────────────────
    const exportPDF = async () => {
        if (!summaryData) return;
        setExportingPdf(true);
        try {
            const doc  = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
            const proj = selectedProject?.projectName || "";
            const wo   = selectedWO?.workOrderNo || "";
            const tower= selectedWO?.towerName || "";

            // Title
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(0, 70, 127);
            doc.text(`${proj}${tower ? " — " + tower : ""}`, 14, 16);
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(80, 80, 80);
            doc.text(`Work Order: ${wo}`, 14, 23);

            // ── Section 1: Location table ─────────────────────────────────────
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(30, 41, 59);
            doc.text("Window Schedule Summary", 14, 32);

            const tableHead = [[
                "LOCATION", "WCODE",
                "Total\nWindows", "Sizes\nReceived",
                "Track\nReceived", "Shutter\nReceived",
                "Track\nInstalled", "Shutter\nInstalled",
                "PENDING\nSIZES"
            ]];
            const tableBody = (summaryData.locationRows || []).map(r => [
                r.location, r.wcode,
                r.totalWindowQty, r.totalSizesReceived,
                r.totalTrackReceived, r.totalShutterReceived,
                r.totalTrackInstallation, r.totalShutterInstallation,
                r.pendingSizes,
            ]);
            // Total row
            tableBody.push([
                "TOTAL", "",
                summaryData.totalWindowQty, summaryData.totalSizesReceived,
                summaryData.totalTrackReceived, summaryData.totalShutterReceived,
                summaryData.totalTrackInstallation, summaryData.totalShutterInstallation,
                summaryData.pendingSizes,
            ]);

            autoTable(doc, {
                head: tableHead, body: tableBody, startY: 36, theme: "grid",
                headStyles: { fillColor:[30,41,59], textColor:255, fontSize:8, halign:"center" },
                bodyStyles: { fontSize: 8 },
                columnStyles: {
                    0: { cellWidth:36 }, 1: { cellWidth:18 },
                    2: { halign:"right" }, 3: { halign:"right" },
                    4: { halign:"right" }, 5: { halign:"right" },
                    6: { halign:"right" }, 7: { halign:"right" },
                    8: { halign:"right", textColor:[220,38,38], fontStyle:"bold" },
                },
                didDrawRow: (data) => {
                    // Style total row
                    if (data.row.index === tableBody.length - 1) {
                        doc.setFillColor(241, 245, 249);
                    }
                },
            });

            let y = doc.lastAutoTable.finalY + 8;

            // ── Section 2: Quick stats ────────────────────────────────────────
            autoTable(doc, {
                body: [
                    ["Total Window's qty",       summaryData.totalWindowQty,         "Total Sizes release qty",     summaryData.totalSizesReceived],
                    ["TOTAL WINDOW RECEIVED",    summaryData.totalTrackReceived,      "TOTAL WINDOW INSTALLED",      summaryData.totalTrackInstallation],
                    ["TOTAL INSTALLATION PENDING",summaryData.totalWindowQty - summaryData.totalTrackInstallation, "TOTAL DISPATCH PENDING", summaryData.totalWindowQty - summaryData.totalTrackReceived],
                    ["TOTAL PENDING SIZES",      summaryData.pendingSizes,            "", ""],
                ],
                startY: y, theme: "grid",
                bodyStyles: { fontSize: 9 },
                columnStyles: {
                    0: { fontStyle:"bold", fillColor:[248,250,252], cellWidth:55 },
                    1: { halign:"right", cellWidth:20 },
                    2: { fontStyle:"bold", fillColor:[248,250,252], cellWidth:55 },
                    3: { halign:"right", cellWidth:20 },
                },
            });

            y = doc.lastAutoTable.finalY + 8;

            // ── Section 3: Sqft summary ───────────────────────────────────────
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(30, 41, 59);
            doc.text(proj.toUpperCase(), 14, y);
            y += 5;

            autoTable(doc, {
                body: [
                    ["TOTAL WINDOW HANDOVER",          "IN SFT", parseFloat(summaryData.totalHandoverSqft).toFixed(4)],
                    ["TOTAL WINDOW SHUTTER INSTALLED", "IN SFT", parseFloat(summaryData.totalShutterInstalledSqft).toFixed(4)],
                    ["TOTAL WINDOW FRAME INSTALLED",   "IN SFT", parseFloat(summaryData.totalFrameInstalledSqft).toFixed(4)],
                    ["TOTAL WINDOW SHUTTER SUPPLIED",  "IN SFT", parseFloat(summaryData.totalShutterSuppliedSqft).toFixed(4)],
                    ["TOTAL WINDOW FRAME SUPPLIED",    "IN SFT", parseFloat(summaryData.totalFrameSuppliedSqft).toFixed(4)],
                    ["TOTAL MEASUREMENT RECEIVED",     "IN SFT", parseFloat(summaryData.totalMeasurementSqft).toFixed(4)],
                    ["Frame Supply Balance",            "IN SFT", parseFloat(summaryData.totalMeasurementSqft - summaryData.totalFrameSuppliedSqft).toFixed(4)],
                    ["Shutter Supply Balance",          "IN SFT", parseFloat(summaryData.totalMeasurementSqft - summaryData.totalShutterSuppliedSqft).toFixed(4)],
                    ["Frame Installation Balance",      "IN SFT", parseFloat(summaryData.totalMeasurementSqft - summaryData.totalFrameInstalledSqft).toFixed(4)],
                    ["Shutter Installation Balance",    "IN SFT", parseFloat(summaryData.totalMeasurementSqft - summaryData.totalShutterInstalledSqft).toFixed(4)],
                ],
                startY: y, theme: "grid",
                bodyStyles: { fontSize: 9 },
                columnStyles: {
                    0: { fontStyle:"bold", fillColor:[248,250,252], cellWidth:80 },
                    1: { cellWidth:20 },
                    2: { halign:"right", cellWidth:40 },
                },
            });

            doc.save(`TrackerSummary_${proj}_${wo}.pdf`);
        } catch (err) {
            alert("PDF export failed: " + err.message);
        } finally {
            setExportingPdf(false);
        }
    };

    // ── Excel Export — exact TrackerSummary.xlsx format ───────────────────────
    const exportExcel = () => {
        if (!summaryData) return;
        setExportingXlsx(true);
        try {
            const wb   = XLSX.utils.book_new();
            const ws   = {};
            const proj = selectedProject?.projectName || "";
            const wo   = selectedWO?.workOrderNo || "";
            const locationRows = summaryData.locationRows || [];
            const dataStartRow = 33; // matches sample — data starts at row 33
            const lastDataRow  = dataStartRow + locationRows.length - 1;
            const totalRow     = lastDataRow + 1;
            const statsRow1    = totalRow + 1;
            const sqftStartRow = statsRow1 + 6; // blank line then project name then sqft table
            const lastRow      = sqftStartRow + 10;

            // ── Style helpers ─────────────────────────────────────────────────
            const bdr = (rgb = "AAAAAA") => ({
                top:    { style:"thin", color:{ rgb } },
                bottom: { style:"thin", color:{ rgb } },
                left:   { style:"thin", color:{ rgb } },
                right:  { style:"thin", color:{ rgb } },
            });
            const medBdr = () => ({
                top:    { style:"medium", color:{ rgb:"888888" } },
                bottom: { style:"medium", color:{ rgb:"888888" } },
                left:   { style:"thin",   color:{ rgb:"AAAAAA" } },
                right:  { style:"thin",   color:{ rgb:"AAAAAA" } },
            });

            const hdrStyle = {
                font:      { bold:true, sz:11, name:"Calibri" },
                fill:      { patternType:"solid", fgColor:{ rgb:"1E293B" } },
                alignment: { horizontal:"center", vertical:"center", wrapText:true },
                border:    bdr("FFFFFF"),
                color:     { rgb:"FFFFFF" },
            };
            // override text color for header
            const hdrS = (label) => ({ v: label, t:"s", s:{
                font:      { bold:true, sz:11, name:"Calibri", color:{ rgb:"FFFFFF" } },
                fill:      { patternType:"solid", fgColor:{ rgb:"1E293B" } },
                alignment: { horizontal:"center", vertical:"center", wrapText:true },
                border:    bdr("FFFFFF"),
            }});

            const dataS = (val, isOdd, isNum=false, isRed=false) => ({
                v: val ?? (isNum ? 0 : ""),
                t: isNum ? "n" : "s",
                s: {
                    font:      { sz:11, name:"Calibri", color:{ rgb: isRed ? "DC2626" : "1A2940" }, bold: isRed },
                    fill:      { patternType:"solid", fgColor:{ rgb: isOdd ? "F0F4F8" : "FFFFFF" } },
                    alignment: { horizontal: isNum ? "right" : "left", vertical:"center" },
                    border:    bdr(),
                },
            });

            const totalS = (val, isNum=false) => ({
                v: val ?? (isNum ? 0 : ""),
                t: isNum ? "n" : "s",
                s: {
                    font:      { bold:true, sz:11, name:"Calibri", color:{ rgb:"1A2940" } },
                    fill:      { patternType:"solid", fgColor:{ rgb:"E2E8F0" } },
                    alignment: { horizontal: isNum ? "right" : "left", vertical:"center" },
                    border:    medBdr(),
                },
            });

            const labelS = (val, fill="F8FAFC") => ({
                v: val, t:"s",
                s: {
                    font:      { bold:true, sz:11, name:"Calibri", color:{ rgb:"1E293B" } },
                    fill:      { patternType:"solid", fgColor:{ rgb: fill } },
                    alignment: { horizontal:"left", vertical:"center" },
                    border:    bdr(),
                },
            });
            const valueS = (val) => ({
                v: val, t: typeof val === "number" ? "n" : "s",
                s: {
                    font:      { sz:11, name:"Calibri", color:{ rgb:"0284C7" }, bold:true },
                    fill:      { patternType:"solid", fgColor:{ rgb:"EFF6FF" } },
                    alignment: { horizontal:"right", vertical:"center" },
                    border:    bdr(),
                },
            });
            const unitS = (val) => ({
                v: val, t:"s",
                s: {
                    font:      { sz:11, name:"Calibri", color:{ rgb:"64748B" } },
                    fill:      { patternType:"solid", fgColor:{ rgb:"F8FAFC" } },
                    alignment: { horizontal:"center", vertical:"center" },
                    border:    bdr(),
                },
            });

            // ── Row 31: blank spacer ──────────────────────────────────────────
            ws["B31"] = { v:" ", t:"s" };

            // ── Row 32: Column headers ────────────────────────────────────────
            ws["B32"] = hdrS("LOCATION");
            ws["C32"] = hdrS("WCODE");
            ws["D32"] = hdrS("Total Window's qty");
            ws["E32"] = hdrS("Total Sizes receive qty");
            ws["F32"] = hdrS("Total Track Received qty");
            ws["G32"] = hdrS("Total Shutter Received qty");
            ws["H32"] = hdrS("Total Track Installation qty");
            ws["I32"] = hdrS("Total Shutter Installation qty");
            ws["J32"] = hdrS("PENDING SIZES");

            // ── Rows 33+: Data rows ───────────────────────────────────────────
            locationRows.forEach((row, idx) => {
                const r     = dataStartRow + idx;
                const isOdd = idx % 2 === 1;
                ws[`B${r}`] = dataS(row.location,              isOdd, false);
                ws[`C${r}`] = dataS(row.wcode,                 isOdd, false);
                ws[`D${r}`] = dataS(row.totalWindowQty,        isOdd, true);
                ws[`E${r}`] = dataS(row.totalSizesReceived,    isOdd, true);
                ws[`F${r}`] = dataS(row.totalTrackReceived,    isOdd, true);
                ws[`G${r}`] = dataS(row.totalShutterReceived,  isOdd, true);
                ws[`H${r}`] = dataS(row.totalTrackInstallation,   isOdd, true);
                ws[`I${r}`] = dataS(row.totalShutterInstallation, isOdd, true);
                ws[`J${r}`] = dataS(row.pendingSizes,          isOdd, true, true);
            });

            // ── Total row ─────────────────────────────────────────────────────
            ws[`B${totalRow}`] = totalS("TOTAL");
            ws[`C${totalRow}`] = totalS("");
            ws[`D${totalRow}`] = totalS(summaryData.totalWindowQty,          true);
            ws[`E${totalRow}`] = totalS(summaryData.totalSizesReceived,      true);
            ws[`F${totalRow}`] = totalS(summaryData.totalTrackReceived,      true);
            ws[`G${totalRow}`] = totalS(summaryData.totalShutterReceived,    true);
            ws[`H${totalRow}`] = totalS(summaryData.totalTrackInstallation,  true);
            ws[`I${totalRow}`] = totalS(summaryData.totalShutterInstallation,true);
            ws[`J${totalRow}`] = totalS(summaryData.pendingSizes,            true);

            // ── Stats block (rows after total) — matches sample rows 71-74 ───
            const s1 = totalRow + 1;
            ws[`B${s1}`] = labelS("Total Window's qty");
            ws[`D${s1}`] = valueS(summaryData.totalWindowQty);
            ws[`E${s1}`] = labelS("Total Sizes release qty");
            ws[`F${s1}`] = valueS(summaryData.totalSizesReceived);
            ws[`G${s1}`] = labelS("TOTAL WINDOW RECEIVED");
            ws[`H${s1}`] = valueS(summaryData.totalTrackReceived);
            ws[`I${s1}`] = labelS("TOTAL WINDOW INSTALLED");
            ws[`J${s1}`] = valueS(summaryData.totalTrackInstallation);

            const s2 = s1 + 1;
            ws[`I${s2}`] = labelS("TOTAL INSTALLATION PENDING");
            ws[`J${s2}`] = valueS(summaryData.totalWindowQty - summaryData.totalTrackInstallation);

            const s3 = s2 + 1;
            ws[`G${s3}`] = labelS("TOTAL DISPATCH PENDING");
            ws[`H${s3}`] = valueS(summaryData.totalWindowQty - summaryData.totalTrackReceived);

            const s4 = s3 + 1;
            ws[`E${s4}`] = labelS("TOTAL PENDING SIZES");
            ws[`F${s4}`] = valueS(summaryData.pendingSizes);

            // ── Blank row then project name ───────────────────────────────────
            const projRow = s4 + 2;
            ws[`B${projRow}`] = {
                v: proj.toUpperCase(), t:"s",
                s: { font:{ bold:true, sz:13, name:"Calibri", color:{ rgb:"0070C0" } } }
            };

            // ── Sqft table — matches sample rows 77-86 ───────────────────────
            const sqftRows = [
                ["TOTAL WINDOW HANDOVER",          parseFloat(summaryData.totalHandoverSqft).toFixed(4)],
                ["TOTAL WINDOW SHUTTER INSTALLED", parseFloat(summaryData.totalShutterInstalledSqft).toFixed(4)],
                ["TOTAL WINDOW FRAME INSTALLED",   parseFloat(summaryData.totalFrameInstalledSqft).toFixed(4)],
                ["TOTAL WINDOW SHUTTER SUPPLIED",  parseFloat(summaryData.totalShutterSuppliedSqft).toFixed(4)],
                ["TOTAL WINDOW FRAME SUPPLIED",    parseFloat(summaryData.totalFrameSuppliedSqft).toFixed(4)],
                ["TOTAL MEASUREMENT RECEIVED",     parseFloat(summaryData.totalMeasurementSqft).toFixed(4)],
                ["Frame Supply Balance",            parseFloat(summaryData.totalMeasurementSqft - summaryData.totalFrameSuppliedSqft).toFixed(4)],
                ["Shutter Supply Balance",          parseFloat(summaryData.totalMeasurementSqft - summaryData.totalShutterSuppliedSqft).toFixed(4)],
                ["Frame Installation Balance",      parseFloat(summaryData.totalMeasurementSqft - summaryData.totalFrameInstalledSqft).toFixed(4)],
                ["Shutter Installation Balance",    parseFloat(summaryData.totalMeasurementSqft - summaryData.totalShutterInstalledSqft).toFixed(4)],
            ];

            sqftRows.forEach(([label, val], idx) => {
                const r = projRow + 1 + idx;
                ws[`B${r}`] = labelS(label);
                ws[`D${r}`] = unitS("IN SFT");
                ws[`E${r}`] = valueS(parseFloat(val));
            });

            // ── Sheet ref + column widths ─────────────────────────────────────
            ws["!ref"] = `B31:J${projRow + 11}`;
            ws["!cols"] = [
                { wch: 4  }, // A — unused
                { wch: 36 }, // B
                { wch: 18 }, // C
                { wch: 22 }, // D
                { wch: 22 }, // E
                { wch: 26 }, // F
                { wch: 22 }, // G
                { wch: 26 }, // H
                { wch: 24 }, // I
                { wch: 26 }, // J
            ];

            // Row heights
            const rowHeights = {};
            rowHeights[32] = { hpt: 40 }; // header
            for (let i = dataStartRow; i <= lastDataRow; i++) rowHeights[i] = { hpt: 22 };
            rowHeights[totalRow] = { hpt: 24 };
            ws["!rows"] = Array.from(
                { length: projRow + 12 },
                (_, i) => rowHeights[i + 1] || { hpt: 20 }
            );

            XLSX.utils.book_append_sheet(wb, ws, "Summary");
            XLSX.writeFile(wb, `TrackerSummary_${proj}_${wo}.xlsx`);
        } catch (err) {
            alert("Excel export failed: " + err.message);
        } finally {
            setExportingXlsx(false);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div style={css.page}>
            <style>{`
                @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
                .sp-row:hover { background: #f8fafc !important; }
                .sp-proj:hover { background: #eff6ff !important; border-left-color: #0284c7 !important; }
                .sp-wo:hover   { background: #f0fdf4 !important; border-left-color: #16a34a !important; }
            `}</style>

            {/* ── Header ── */}
            <div style={css.pageHeader}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={css.headerIcon}><FaChartBar /></div>
                    <div>
                        <h1 style={css.pageTitle}>Tracker Summary</h1>
                        <p style={css.pageSubtitle}>
                            {step === "project" && "Select a project to begin"}
                            {step === "wo"      && `${selectedProject?.projectName} — select a work order`}
                            {step === "data"    && `${selectedProject?.projectName} — ${selectedWO?.workOrderNo}${selectedWO?.towerName ? " — " + selectedWO.towerName : ""}`}
                        </p>
                    </div>
                </div>
                {step === "data" && summaryData && (
                    <div style={{ display:"flex", gap:10 }}>
                        <button style={css.pdfBtn} onClick={exportPDF} disabled={exportingPdf}>
                            {exportingPdf
                                ? <FaSpinner style={{ animation:"spin 1s linear infinite" }} />
                                : <FaFilePdf />}
                            &nbsp;PDF
                        </button>
                        <button style={css.xlsxBtn} onClick={exportExcel} disabled={exportingXlsx}>
                            {exportingXlsx
                                ? <FaSpinner style={{ animation:"spin 1s linear infinite" }} />
                                : <FaFileExcel />}
                            &nbsp;Excel
                        </button>
                        <button style={css.backSelBtn} onClick={() => { setStep("wo"); setSummaryData(null); }}>
                            <FaArrowLeft />&nbsp;Change WO
                        </button>
                    </div>
                )}
            </div>

            {/* ── Selection + Data area ── */}
            {step !== "data" && (
                <div style={css.selectionGrid}>
                    {/* Projects panel */}
                    <div style={css.selPanel}>
                        <div style={css.selPanelHdr}>
                            <FaBuilding style={{ color:"#0ea5e9", marginRight:8 }} />
                            <span style={{ fontWeight:700, fontSize:14 }}>
                                Projects ({filtered.length})
                            </span>
                        </div>
                        <div style={css.searchBox}>
                            <FaSearch style={{ color:"#94a3b8", fontSize:12 }} />
                            <input style={css.searchInput} placeholder="Search projects…"
                                value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <div style={css.selList}>
                            {loadingProjects ? (
                                <div style={css.centerMsg}>
                                    <FaSpinner style={{ animation:"spin 1s linear infinite" }} />&nbsp;Loading…
                                </div>
                            ) : filtered.map(p => (
                                <div key={p.projectId} className="sp-proj"
                                    style={{ ...css.selItem, ...(selectedProject?.projectId === p.projectId ? css.selActive : {}) }}
                                    onClick={() => handleSelectProject(p)}>
                                    <div style={{ fontWeight:700, fontSize:13, color:"#1e293b" }}>{p.projectName}</div>
                                    <div style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>{p.projectCode}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Work Orders panel */}
                    <div style={css.selPanel}>
                        <div style={css.selPanelHdr}>
                            <FaClipboardList style={{ color:"#8b5cf6", marginRight:8 }} />
                            <span style={{ fontWeight:700, fontSize:14 }}>
                                Work Orders {selectedProject ? `(${workOrders.length})` : ""}
                            </span>
                        </div>
                        <div style={css.selList}>
                            {!selectedProject ? (
                                <div style={css.centerMsg}>Select a project first</div>
                            ) : loadingWOs ? (
                                <div style={css.centerMsg}>
                                    <FaSpinner style={{ animation:"spin 1s linear infinite" }} />&nbsp;Loading…
                                </div>
                            ) : workOrders.length === 0 ? (
                                <div style={css.centerMsg}>No work orders found</div>
                            ) : workOrders.map(wo => (
                                <div key={wo.id} className="sp-wo"
                                    style={{ ...css.selItem, ...(selectedWO?.id === wo.id ? css.selActiveGreen : {}) }}
                                    onClick={() => handleSelectWO(wo)}>
                                    <div style={{ fontWeight:700, fontSize:13, color:"#1e293b" }}>{wo.workOrderNo}</div>
                                    <div style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>
                                        {wo.towerName && <span style={css.towerBadge}>{wo.towerName}</span>}
                                        &nbsp;{wo.items?.length || 0} items
                                    </div>
                                </div>
                            ))}
                        </div>
                        {loadingData && (
                            <div style={css.centerMsg}>
                                <FaSpinner style={{ animation:"spin 1s linear infinite" }} />&nbsp;Loading summary…
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── DATA VIEW ── */}
            {step === "data" && summaryData && (
                <div>
                    {/* ── KPI Cards ── */}
                    <div style={css.kpiGrid}>
                        {[
                            { label:"Total Windows",          val: summaryData.totalWindowQty,                                             color:"#0284c7", bg:"#e0f2fe", border:"#bae6fd" },
                            { label:"Sizes Received",         val: summaryData.totalSizesReceived,                                         color:"#16a34a", bg:"#dcfce7", border:"#bbf7d0" },
                            { label:"Track Received",         val: summaryData.totalTrackReceived,                                         color:"#d97706", bg:"#fef3c7", border:"#fde68a" },
                            { label:"Shutter Received",       val: summaryData.totalShutterReceived,                                       color:"#7c3aed", bg:"#ede9fe", border:"#ddd6fe" },
                            { label:"Track Installed",        val: summaryData.totalTrackInstallation,                                     color:"#0369a1", bg:"#e0f2fe", border:"#bae6fd" },
                            { label:"Shutter Installed",      val: summaryData.totalShutterInstallation,                                   color:"#15803d", bg:"#dcfce7", border:"#bbf7d0" },
                            { label:"Pending Sizes",          val: summaryData.pendingSizes,                                               color:"#dc2626", bg:"#fef2f2", border:"#fecaca" },
                            { label:"Dispatch Pending",       val: summaryData.totalWindowQty - summaryData.totalTrackReceived,            color:"#b45309", bg:"#fef3c7", border:"#fde68a" },
                            { label:"Installation Pending",   val: summaryData.totalWindowQty - summaryData.totalTrackInstallation,        color:"#7e22ce", bg:"#faf5ff", border:"#e9d5ff" },
                        ].map(card => (
                            <div key={card.label} style={{ ...css.kpiCard, background:card.bg, borderColor:card.border }}>
                                <div style={{ fontSize:11, fontWeight:600, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.04em", marginBottom:6 }}>
                                    {card.label}
                                </div>
                                <div style={{ fontSize:28, fontWeight:800, color:card.color }}>{card.val}</div>
                            </div>
                        ))}
                    </div>

                    {/* ── Location Table ── */}
                    <div style={css.tableCard}>
                        <div style={css.tableCardHdr}>
                            <FaChartBar style={{ color:"#6366f1" }} />
                            <span style={{ fontWeight:700, fontSize:15, color:"#1e293b" }}>
                                Window Schedule Summary
                            </span>
                            <span style={{ fontSize:12, color:"#94a3b8", marginLeft:"auto" }}>
                                {(summaryData.locationRows || []).length} location-wcode combinations
                            </span>
                        </div>
                        <div style={{ overflowX:"auto" }}>
                            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                                <thead>
                                    <tr style={{ background:"#1e293b" }}>
                                        {[
                                            "LOCATION","WCODE",
                                            "Total Windows","Sizes Received",
                                            "Track Received","Shutter Received",
                                            "Track Installed","Shutter Installed",
                                            "PENDING SIZES"
                                        ].map(h => (
                                            <th key={h} style={css.th}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {(summaryData.locationRows || []).map((row, i) => (
                                        <tr key={i} className="sp-row"
                                            style={{ background: i%2===0?"#fff":"#f8fafc", borderBottom:"1px solid #f1f5f9" }}>
                                            <td style={css.td}>{row.location}</td>
                                            <td style={{ ...css.td, fontWeight:600, color:"#0284c7" }}>{row.wcode}</td>
                                            <td style={{ ...css.td, textAlign:"right" }}>{row.totalWindowQty}</td>
                                            <td style={{ ...css.td, textAlign:"right", color:"#16a34a", fontWeight:600 }}>{row.totalSizesReceived}</td>
                                            <td style={{ ...css.td, textAlign:"right" }}>{row.totalTrackReceived}</td>
                                            <td style={{ ...css.td, textAlign:"right" }}>{row.totalShutterReceived}</td>
                                            <td style={{ ...css.td, textAlign:"right" }}>{row.totalTrackInstallation}</td>
                                            <td style={{ ...css.td, textAlign:"right" }}>{row.totalShutterInstallation}</td>
                                            <td style={{ ...css.td, textAlign:"right", color:"#dc2626", fontWeight:700 }}>{row.pendingSizes}</td>
                                        </tr>
                                    ))}
                                    {/* Total row */}
                                    <tr style={{ background:"#f1f5f9", borderTop:"2px solid #cbd5e1", fontWeight:700 }}>
                                        <td style={css.td} colSpan={2}>TOTAL</td>
                                        <td style={{ ...css.td, textAlign:"right" }}>{summaryData.totalWindowQty}</td>
                                        <td style={{ ...css.td, textAlign:"right", color:"#16a34a" }}>{summaryData.totalSizesReceived}</td>
                                        <td style={{ ...css.td, textAlign:"right" }}>{summaryData.totalTrackReceived}</td>
                                        <td style={{ ...css.td, textAlign:"right" }}>{summaryData.totalShutterReceived}</td>
                                        <td style={{ ...css.td, textAlign:"right" }}>{summaryData.totalTrackInstallation}</td>
                                        <td style={{ ...css.td, textAlign:"right" }}>{summaryData.totalShutterInstallation}</td>
                                        <td style={{ ...css.td, textAlign:"right", color:"#dc2626" }}>{summaryData.pendingSizes}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ── Sqft Summary ── */}
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginTop:20 }}>
                        {/* Left: stats */}
                        <div style={css.tableCard}>
                            <div style={css.tableCardHdr}>
                                <FaCheckCircle style={{ color:"#16a34a" }} />
                                <span style={{ fontWeight:700, fontSize:15, color:"#1e293b" }}>Quick Stats</span>
                            </div>
                            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                                <tbody>
                                    {[
                                        { label:"Total Window's qty",        val: summaryData.totalWindowQty },
                                        { label:"Total Sizes release qty",   val: summaryData.totalSizesReceived },
                                        { label:"TOTAL WINDOW RECEIVED",     val: summaryData.totalTrackReceived },
                                        { label:"TOTAL WINDOW INSTALLED",    val: summaryData.totalTrackInstallation },
                                        { label:"TOTAL INSTALLATION PENDING",val: summaryData.totalWindowQty - summaryData.totalTrackInstallation },
                                        { label:"TOTAL DISPATCH PENDING",    val: summaryData.totalWindowQty - summaryData.totalTrackReceived },
                                        { label:"TOTAL PENDING SIZES",       val: summaryData.pendingSizes },
                                    ].map((row, i) => (
                                        <tr key={i} style={{ background: i%2===0?"#f8fafc":"#fff", borderBottom:"1px solid #f1f5f9" }}>
                                            <td style={{ padding:"10px 16px", fontWeight:600, color:"#334155", fontSize:13 }}>{row.label}</td>
                                            <td style={{ padding:"10px 16px", textAlign:"right", fontWeight:800, color:"#0284c7", fontSize:15 }}>{row.val}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Right: sqft table */}
                        <div style={css.tableCard}>
                            <div style={css.tableCardHdr}>
                                <FaChartBar style={{ color:"#6366f1" }} />
                                <span style={{ fontWeight:700, fontSize:15, color:"#1e293b" }}>
                                    {selectedProject?.projectName?.toUpperCase()} — Area Summary (SFT)
                                </span>
                            </div>
                            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                                <tbody>
                                    {[
                                        { label:"TOTAL WINDOW HANDOVER",          val: summaryData.totalHandoverSqft,                                                               color:"#7c3aed" },
                                        { label:"TOTAL WINDOW SHUTTER INSTALLED", val: summaryData.totalShutterInstalledSqft,                                                      color:"#16a34a" },
                                        { label:"TOTAL WINDOW FRAME INSTALLED",   val: summaryData.totalFrameInstalledSqft,                                                        color:"#16a34a" },
                                        { label:"TOTAL WINDOW SHUTTER SUPPLIED",  val: summaryData.totalShutterSuppliedSqft,                                                       color:"#d97706" },
                                        { label:"TOTAL WINDOW FRAME SUPPLIED",    val: summaryData.totalFrameSuppliedSqft,                                                         color:"#d97706" },
                                        { label:"TOTAL MEASUREMENT RECEIVED",     val: summaryData.totalMeasurementSqft,                                                           color:"#0284c7" },
                                        { label:"Frame Supply Balance",            val: summaryData.totalMeasurementSqft - summaryData.totalFrameSuppliedSqft,                     color:"#dc2626" },
                                        { label:"Shutter Supply Balance",          val: summaryData.totalMeasurementSqft - summaryData.totalShutterSuppliedSqft,                   color:"#dc2626" },
                                        { label:"Frame Installation Balance",      val: summaryData.totalMeasurementSqft - summaryData.totalFrameInstalledSqft,                    color:"#dc2626" },
                                        { label:"Shutter Installation Balance",    val: summaryData.totalMeasurementSqft - summaryData.totalShutterInstalledSqft,                  color:"#dc2626" },
                                    ].map((row, i) => (
                                        <tr key={i} style={{ background: i%2===0?"#f8fafc":"#fff", borderBottom:"1px solid #f1f5f9" }}>
                                            <td style={{ padding:"10px 16px", fontWeight:600, color:"#334155", fontSize:12 }}>{row.label}</td>
                                            <td style={{ padding:"6px 10px", textAlign:"center", color:"#64748b", fontSize:11 }}>IN SFT</td>
                                            <td style={{ padding:"10px 16px", textAlign:"right", fontWeight:800, color:row.color, fontSize:14 }}>
                                                {parseFloat(row.val).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const css = {
    page:          { maxWidth:1400, margin:"0 auto", padding:"0 4px 56px", fontFamily:"'Inter',-apple-system,sans-serif" },
    pageHeader:    { display:"flex", alignItems:"center", justifyContent:"space-between", gap:20, padding:"28px 0 24px", flexWrap:"wrap" },
    headerIcon:    { width:48, height:48, background:"linear-gradient(135deg,#6366f1,#4f46e5)", borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:22 },
    pageTitle:     { margin:0, fontSize:24, fontWeight:800, color:"#1e293b" },
    pageSubtitle:  { margin:"3px 0 0", fontSize:13, color:"#64748b" },
    selectionGrid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:24 },
    selPanel:      { background:"#fff", borderRadius:14, border:"1px solid #e2e8f0", overflow:"hidden", boxShadow:"0 2px 6px rgba(0,0,0,0.04)" },
    selPanelHdr:   { display:"flex", alignItems:"center", padding:"14px 18px", borderBottom:"1px solid #f1f5f9", background:"#fafbfc" },
    searchBox:     { display:"flex", alignItems:"center", gap:8, padding:"10px 14px", borderBottom:"1px solid #f1f5f9", background:"#f8fafc" },
    searchInput:   { border:"none", background:"transparent", outline:"none", fontSize:13, flex:1 },
    selList:       { maxHeight:300, overflowY:"auto" },
    selItem:       { padding:"12px 18px", cursor:"pointer", borderBottom:"1px solid #f8fafc", borderLeft:"3px solid transparent", transition:"all 0.15s" },
    selActive:     { background:"#eff6ff", borderLeft:"3px solid #0284c7" },
    selActiveGreen:{ background:"#f0fdf4", borderLeft:"3px solid #16a34a" },
    towerBadge:    { background:"#fef3c7", color:"#92400e", fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:10, border:"1px solid #fde68a" },
    centerMsg:     { padding:"30px", textAlign:"center", color:"#94a3b8", fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", gap:8 },
    kpiGrid:       { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:12, marginBottom:20 },
    kpiCard:       { borderRadius:12, padding:"16px", border:"1.5px solid", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" },
    tableCard:     { background:"#fff", borderRadius:14, border:"1px solid #e2e8f0", boxShadow:"0 1px 6px rgba(0,0,0,0.04)", overflow:"hidden", marginBottom:0 },
    tableCardHdr:  { padding:"14px 18px", borderBottom:"1px solid #f1f5f9", display:"flex", alignItems:"center", gap:10 },
    th:            { padding:"10px 14px", color:"#f8fafc", fontWeight:600, textAlign:"left", fontSize:12, borderRight:"1px solid rgba(255,255,255,0.1)", whiteSpace:"nowrap" },
    td:            { padding:"9px 14px", fontSize:13, color:"#1e293b", borderBottom:"1px solid #f8fafc" },
    pdfBtn:        { display:"flex", alignItems:"center", gap:8, padding:"10px 18px", background:"#fef2f2", color:"#dc2626", border:"1px solid #fecaca", borderRadius:8, cursor:"pointer", fontWeight:700, fontSize:13 },
    xlsxBtn:       { display:"flex", alignItems:"center", gap:8, padding:"10px 18px", background:"#f0fdf4", color:"#16a34a", border:"1px solid #bbf7d0", borderRadius:8, cursor:"pointer", fontWeight:700, fontSize:13 },
    backSelBtn:    { display:"flex", alignItems:"center", gap:8, padding:"10px 18px", background:"#f1f5f9", color:"#475569", border:"1px solid #e2e8f0", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:13 },
};