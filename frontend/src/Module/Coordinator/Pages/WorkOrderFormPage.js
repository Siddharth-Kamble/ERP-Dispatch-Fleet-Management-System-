//
//
//import React, { useState, useEffect } from "react";
////import { useNavigate, useParams, useSearchParams } from "react-router-dom";
//import { useNavigate, useParams, useLocation } from "react-router-dom";
//
//import {
//    FaPlus, FaTrash, FaSave,
//    FaCheckCircle, FaExclamationTriangle, FaSpinner,
//    FaRegArrowAltCircleLeft, FaLayerGroup, FaCalendarAlt, FaHashtag
//} from "react-icons/fa";
//
//// ── Calculations ──────────────────────────────────────────────────────────────
//function calcSqft(length, height) {
//    const l = parseFloat(length);
//    const h = parseFloat(height);
//    if (isNaN(l) || l <= 0 || isNaN(h) || h <= 0) return "";
//    return ((l * h) / 1_000_000 * 10.764).toFixed(4);
//}
//
//function convertWoQty(rawValue, woQtyUnit) {
//    const v = parseFloat(rawValue);
//    if (isNaN(v) || v <= 0) return "";
//    return woQtyUnit === "sqm" ? (v * 10.764).toFixed(4) : v.toFixed(4);
//}
//
//function calcWoQtyNos(woQtySqft, sqft) {
//    const qty  = parseFloat(woQtySqft);
//    const area = parseFloat(sqft);
//    if (isNaN(qty) || isNaN(area) || area <= 0) return "";
//    return Math.floor(qty / area).toString();
//}
//
//// ── Empty row ─────────────────────────────────────────────────────────────────
//const emptyRow = () => ({
//    _id:          Date.now() + Math.random(),
//    srNo:         "",
//    location:     "",
//    windowCode:   "",
//    typology:     "",
//    series:       "",
//    length:       "",
//    height:       "",
//    sqft:         "",        // auto: L × H ÷ 1,000,000 × 10.764
//    woQtySqftRaw: "",        // user entry (sqft or sqm)
//    woQtySqft:    "",        // converted to sqft
//    woQtyNos:     "",        // auto: floor(woQtySqft / sqft)
//    floorPlanQty: "",
//});
//
//export default function WorkOrderFormPage() {
//    const navigate       = useNavigate();
//    const { id }         = useParams();
////    const [searchParams] = useSearchParams();
////    const projectFromUrl = searchParams.get("project") || "";
//    const location = useLocation();
//    const projectFromUrl = location.state?.project?.projectName || "";
//    const isEdit         = Boolean(id);
//
//    const [workOrderNo, setWorkOrderNo] = useState("");
//    const [projectName, setProjectName] = useState(projectFromUrl);
//    const [date,        setDate]        = useState(new Date().toISOString().split("T")[0]);
//    const [woQtyUnit,   setWoQtyUnit]   = useState("sqft");
//    const [rows,        setRows]        = useState([emptyRow()]);
//    const [saving,      setSaving]      = useState(false);
//    const [loading,     setLoading]     = useState(isEdit);
//    const [saveMsg,     setSaveMsg]     = useState(null);
//
//    const isSqm = woQtyUnit === "sqm";
//
//    // ── Load WO for editing ───────────────────────────────────────────────────
//    useEffect(() => {
//        if (!isEdit) return;
//        (async () => {
//            try {
//                const res  = await fetch(`${process.env.REACT_APP_API_URL}/api/work-orders/${id}`);
//                const data = await res.json();
//                setWorkOrderNo(data.workOrderNo || "");
//                setProjectName(data.projectName || "");
//                setDate(data.date || "");
//                if (data.items?.[0]?.woQtyUnit) setWoQtyUnit(data.items[0].woQtyUnit);
//                setRows(
//                    (data.items || []).map(i => ({
//                        _id:          Date.now() + Math.random(),
//                        srNo:         i.srNo         || "",
//                        location:     i.location     || "",
//                        windowCode:   i.windowCode   || "",
//                        typology:     i.typology     || "",
//                        series:       i.series       || "",
//                        length:       i.length       ?? "",
//                        height:       i.height       ?? "",
//                        sqft:         i.sqft         ?? "",
//                        woQtySqftRaw: i.woQtySqftRaw ?? i.woQtySqft ?? "",
//                        woQtySqft:    i.woQtySqft    ?? "",
//                        woQtyNos:     i.woQtyNos     ?? "",
//                        floorPlanQty: i.floorPlanQty ?? "",
//                    }))
//                );
//            } catch {
//                setSaveMsg({ type: "error", text: "Failed to load structural data matrix layers." });
//            } finally {
//                setLoading(false);
//            }
//        })();
//    }, [id, isEdit]);
//
//    // ── Re-convert when unit changes ─────────────────────────────────────────
//    useEffect(() => {
//        setRows(prev => prev.map(row => {
//            const converted = convertWoQty(row.woQtySqftRaw, woQtyUnit);
//            return { ...row, woQtySqft: converted, woQtyNos: calcWoQtyNos(converted, row.sqft) };
//        }));
//    }, [woQtyUnit]);
//
//    // ── Row operations ────────────────────────────────────────────────────────
//    const addRow    = () => setRows(r => [...r, emptyRow()]);
//    const deleteRow = (_id) => setRows(r => r.filter(row => row._id !== _id));
//
//    const updateRow = (_id, field, value) =>
//        setRows(prev => prev.map(row => {
//            if (row._id !== _id) return row;
//            const u = { ...row, [field]: value };
//            if (field === "length" || field === "height") {
//                u.sqft     = calcSqft(u.length, u.height);
//                u.woQtyNos = calcWoQtyNos(u.woQtySqft, u.sqft);
//            }
//            if (field === "woQtySqftRaw") {
//                u.woQtySqft = convertWoQty(value, woQtyUnit);
//                u.woQtyNos  = calcWoQtyNos(u.woQtySqft, u.sqft);
//            }
//            return u;
//        }));
//
//    // ── Save ──────────────────────────────────────────────────────────────────
//    const handleSave = async () => {
//        if (!workOrderNo.trim()) { setSaveMsg({ type: "error", text: "Work Order No. configuration is required." }); return; }
//        if (!projectName.trim()) { setSaveMsg({ type: "error", text: "Project tracking reference is required."   }); return; }
//        const valid = rows.filter(r => r.srNo || r.location || r.windowCode || r.length);
//        if (!valid.length) { setSaveMsg({ type: "error", text: "Declare at least one product parameter array entry." }); return; }
//
//        setSaving(true); setSaveMsg(null);
//        const payload = {
//            workOrderNo, projectName, date,
//            items: valid.map(({ _id, woQtySqftRaw, ...rest }) => ({ ...rest, woQtyUnit, woQtySqftRaw })),
//        };
//        try {
//            const res  = await fetch(
//                `${process.env.REACT_APP_API_URL}/api/work-orders${isEdit ? `/${id}` : ""}`,
//                { method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
//            );
//            const data = await res.json();
//            if (!res.ok) throw new Error(data.message || "Server configuration conflict encountered.");
//            setSaveMsg({ type: "success", text: `Work Order processing database updated cleanly.` });
//            setTimeout(() => navigate("/coordinator-dashboard/work-orders"), 1400);
//        } catch (err) {
//            setSaveMsg({ type: "error", text: err.message });
//        } finally {
//            setSaving(false);
//        }
//    };
//
//    // ── Totals ────────────────────────────────────────────────────────────────
//    const totalSqft = rows.reduce((s, r) => s + (parseFloat(r.woQtySqft)    || 0), 0);
//    const totalNos  = rows.reduce((s, r) => s + (parseInt(r.woQtyNos)       || 0), 0);
//    const totalFP   = rows.reduce((s, r) => s + (parseFloat(r.floorPlanQty) || 0), 0);
//
//    if (loading) return <div style={css.loadingWrap}><FaSpinner style={spinStyle} /> Loading Workspace Config...</div>;
//
//    // ── Column definitions ────────────────────────────────────────────────────
//    const COLS = [
//        { key: "srNo",         label: "Sr. No",       type: "text",   w: 60  },
//        { key: "location",     label: "Location",      type: "text",   w: 130 },
//        { key: "windowCode",   label: "Window Code",   type: "text",   w: 120 },
//        { key: "typology",     label: "Typology",      type: "text",   w: 120 },
//        { key: "series",       label: "Series",        type: "text",   w: 110 },
//        { key: "length",       label: "Length (mm)",   type: "number", w: 100 },
//        { key: "height",       label: "Height (mm)",   type: "number", w: 100 },
//        { key: "sqft",         label: "Sqft",          type: "number", w: 110, auto: true  },
//        { key: "woQtySqftRaw", label: "W/O Qty",       type: "number", w: 120, hasUnit: true },
//        ...(isSqm ? [{ key: "woQtySqft", label: "W/O Order Converted Sqft", type: "number", w: 180, auto: true, converted: true }] : []),
//        { key: "woQtyNos",     label: "W/O Qty (Nos)", type: "number", w: 120, auto: true  },
//        { key: "floorPlanQty", label: "Floor Plan Qty",type: "number", w: 120 },
//    ];
//
//    const colsBefore = 8;
//    const colsAfter  = isSqm ? 4 : 3;
//
//    return (
//        <div style={css.page}>
//            <style>{`
//                @keyframes spin { to { transform: rotate(360deg); } }
//                .wo-row { transition: background 0.15s ease; }
//                .wo-row:hover { background: #f8fafc !important; }
//                .wo-del-btn { transition: all 0.15s ease; color: #94a3b8; }
//                .wo-del-btn:hover { color: #ef4444 !important; background: #fef2f2 !important; border-color: #fecaca !important; }
//                .wo-add-btn { transition: all 0.2s ease; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
//                .wo-add-btn:hover { background: #4f46e5 !important; transform: translateY(-1px); }
//                .wo-save-btn { transition: all 0.2s ease; box-shadow: 0 2px 4px rgba(5, 150, 105, 0.1); }
//                .wo-save-btn:hover:not(:disabled) { background: #047857 !important; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(5, 150, 105, 0.15); }
//                .wo-unit-pill { transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1); }
//                .wo-unit-pill:hover:not(.active) { background: #334155 !important; color: #f8fafc !important; }
//                .wo-unit-pill.active { background: #6366f1 !important; color: #ffffff !important; font-weight: 700; }
//                .wo-cell-input { transition: border-color 0.15s ease, box-shadow: 0.15s ease; }
//                .wo-cell-input:focus { border-color: #6366f1 !important; background: #fff !important; box-shadow: inset 0 0 0 1px #6366f1 !important; }
//                .wo-meta-card-input:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.08) !important; }
//                input[type=number]::-webkit-inner-spin-button,
//                input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
//                input[type=number] { -moz-appearance: textfield; }
//            `}</style>
//
//            {/* Top Operational Navigation bar */}
//            <div style={css.pageHeader}>
//                <div style={css.headerLeft}>
//                    <button
//                        style={css.backBtn}
//                        onClick={() => navigate("/coordinator-dashboard/work-orders")}
//                    >
//                        <FaRegArrowAltCircleLeft /> Back to Management Listing
//                    </button>
//
//                    <div style={css.titleBlock}>
//                        <h1 style={css.pageTitle}>
//                            {isEdit ? "Update System Parameters" : "Generate Production Framework"}
//                        </h1>
//                        {projectName && (
//                            <div style={css.projectLine}>
//                                <span style={css.projectDot} />
//                                Pipeline Context: <strong style={{ color: "#0f172a", marginLeft: 2 }}>{projectName}</strong>
//                            </div>
//                        )}
//                    </div>
//                </div>
//
//                <button
//                    className="wo-save-btn"
//                    style={css.saveBtn}
//                    onClick={handleSave}
//                    disabled={saving}
//                >
//                    {saving ? <FaSpinner style={spinStyle} /> : <FaSave style={{ fontSize: 13 }} />}
//                    <span>{saving ? "Commiting Layer Changes..." : isEdit ? "Update Framework" : "Commit Record"}</span>
//                </button>
//            </div>
//
//            {/* Notification system */}
//            {saveMsg && (
//                <div style={{ ...css.toast, ...(saveMsg.type === "success" ? css.toastOk : css.toastErr) }}>
//                    {saveMsg.type === "success"
//                        ? <FaCheckCircle style={{ flexShrink: 0, fontSize: 16 }} />
//                        : <FaExclamationTriangle style={{ flexShrink: 0, fontSize: 16 }} />}
//                    <span>{saveMsg.text}</span>
//                </div>
//            )}
//
//            {/* Metadata Reference Fields Block */}
//            <div style={css.card}>
//                <div style={css.cardHeader}>
//                    <FaLayerGroup style={{ color: "#6366f1" }} />
//                    <span style={css.cardLabel}>Deployment Details</span>
//                </div>
//                <div style={css.detailsGrid}>
//                    <div style={css.fieldWrap}>
//                        <label style={css.fieldLabel}>WORK ORDER IDENTIFIER <span style={css.req}>*</span></label>
//                        <div style={css.inputIconWrapper}>
//                            <FaHashtag style={css.inputIcon} />
//                            <input
//                                className="wo-meta-card-input"
//                                style={{ ...css.fieldInput, paddingLeft: 34, ...(isEdit ? css.fieldInputDisabled : {}) }}
//                                value={workOrderNo}
//                                onChange={e => setWorkOrderNo(e.target.value)}
//                                placeholder="e.g. WO-2026-9954"
//                                disabled={isEdit}
//                            />
//                        </div>
//                    </div>
//                    <div style={css.fieldWrap}>
//                        <label style={css.fieldLabel}>TARGET PROJECT ENTITY</label>
//                        <div style={css.fieldStatic}>{projectName || <span style={{ color: "#94a3b8" }}>—</span>}</div>
//                    </div>
//                    <div style={css.fieldWrap}>
//                        <label style={css.fieldLabel}>ALLOCATION TIMESTAMP</label>
//                        <div style={css.inputIconWrapper}>
//                            <FaCalendarAlt style={css.inputIcon} />
//                            <input
//                                className="wo-meta-card-input"
//                                style={{ ...css.fieldInput, paddingLeft: 34 }}
//                                type="date"
//                                value={date}
//                                onChange={e => setDate(e.target.value)}
//                            />
//                        </div>
//                    </div>
//                </div>
//            </div>
//
//            {/* Main Interactive Row Grid Structure */}
//            <div style={css.card}>
//                <div style={css.tableToolbar}>
//                    <div style={css.tableToolbarLeft}>
//                        <span style={css.tableCardTitle}>Line Item Arrays</span>
//                        <span style={css.rowCount}>{rows.length} Matrix Entry Rows Loaded</span>
//                    </div>
//                    <button className="wo-add-btn" style={css.addBtn} onClick={addRow}>
//                        <FaPlus style={{ fontSize: 11 }} />
//                        <span>Insert Sequence Row</span>
//                    </button>
//                </div>
//
//                <div style={css.tableWrap}>
//                    <table style={css.table}>
//                        <thead>
//                            <tr>
//                                {COLS.map(c => (
//                                    <th key={c.key} style={{ ...css.th, minWidth: c.w, maxWidth: c.w }}>
//                                        {c.hasUnit ? (
//                                            <div style={css.thWithUnit}>
//                                                <span style={css.thLabel}>W/O Quantity Target</span>
//                                                <div style={css.unitPills}>
//                                                    {["sqft", "sqm"].map(u => (
//                                                        <button
//                                                            key={u}
//                                                            className={`wo-unit-pill ${woQtyUnit === u ? "active" : ""}`}
//                                                            style={css.unitPill}
//                                                            onClick={() => setWoQtyUnit(u)}
//                                                        >
//                                                            {u}
//                                                        </button>
//                                                    ))}
//                                                </div>
//                                            </div>
//                                        ) : c.auto ? (
//                                            <div style={css.thAuto}>
//                                                <span style={css.thLabel}>{c.label}</span>
//                                                <span style={css.autoTag}>Computed</span>
//                                            </div>
//                                        ) : (
//                                            <span style={css.thLabel}>{c.label}</span>
//                                        )}
//                                    </th>
//                                ))}
//                                <th style={{ ...css.th, minWidth: 48, maxWidth: 48, textAlign: "center" }}>Actions</th>
//                            </tr>
//                        </thead>
//
//                        <tbody>
//                            {rows.map((row, idx) => (
//                                <tr key={row._id} className="wo-row" style={css.tr}>
//                                    {COLS.map(c => {
//                                        const isAuto      = c.auto;
//                                        const isConverted = c.converted;
//                                        const hasVal      = Boolean(row[c.key]);
//                                        return (
//                                            <td key={c.key} style={css.td}>
//                                                <input
//                                                    className="wo-cell-input"
//                                                    style={{
//                                                        ...css.cell,
//                                                        ...(isAuto && !isConverted ? css.cellAuto : {}),
//                                                        ...(isConverted ? css.cellConverted : {}),
//                                                        ...(c.key === "woQtyNos" && hasVal ? css.cellNos : {}),
//                                                        textAlign: (c.type === "number" || isAuto) ? "right" : "left"
//                                                    }}
//                                                    type={c.type}
//                                                    value={row[c.key]}
//                                                    readOnly={isAuto}
//                                                    placeholder={c.key === "srNo" ? String(idx + 1) : ""}
//                                                    onChange={e => updateRow(row._id, c.key, e.target.value)}
//                                                />
//                                            </td>
//                                        );
//                                    })}
//                                    <td style={{ ...css.td, textAlign: "center" }}>
//                                        <button
//                                            className="wo-del-btn"
//                                            style={css.delBtn}
//                                            onClick={() => deleteRow(row._id)}
//                                            title="Purge row record"
//                                        >
//                                            <FaTrash style={{ fontSize: 11 }} />
//                                        </button>
//                                    </td>
//                                </tr>
//                            ))}
//                        </tbody>
//
//                        <tfoot>
//                            <tr style={css.tfootRow}>
//                                <td colSpan={colsBefore} style={css.tfootLabel}>Aggregated Summaries</td>
//                                <td style={css.tfootCell} />
//                                {isSqm && (
//                                    <td style={{ ...css.tfootCell, ...css.tfootConverted }}>
//                                        {totalSqft.toFixed(2)}
//                                    </td>
//                                )}
//                                <td style={{ ...css.tfootCell, ...css.tfootNos }}>{totalNos}</td>
//                                <td style={{ ...css.tfootCell, color: "#059669", fontWeight: 700 }}>{totalFP}</td>
//                                <td style={css.tfootCell} />
//                            </tr>
//                        </tfoot>
//                    </table>
//                </div>
//
//                {/* Realtime Streamlined Bottom Banner Metrics Strip */}
//                <div style={css.summaryStrip}>
//                    {[
//                        { label: "Active Array Rows", val: rows.length,             accent: "#475569" },
//                        { label: "Selected Processing Unit", val: woQtyUnit.toUpperCase(), accent: "#4f46e5" },
//                        { label: "Cumulative Volume (Sqft)", val: totalSqft.toFixed(2),   accent: "#0891b2" },
//                        { label: "Cumulative Count (Nos)",  val: totalNos,                accent: "#7c3aed" },
//                        { label: "Target Floor plan Sum", val: totalFP,                 accent: "#059669" },
//                    ].map(s => (
//                        <div key={s.label} style={css.summaryItem}>
//                            <span style={css.summaryLabel}>{s.label}</span>
//                            <span style={{ ...css.summaryVal, color: s.accent }}>{s.val}</span>
//                        </div>
//                    ))}
//                </div>
//            </div>
//
//            {/* Bottom Form Completion Submission Row */}
//            <div style={css.bottomBar}>
//                <button
//                    className="wo-save-btn"
//                    style={css.saveBtn}
//                    onClick={handleSave}
//                    disabled={saving}
//                >
//                    {saving ? <FaSpinner style={spinStyle} /> : <FaSave style={{ fontSize: 13 }} />}
//                    <span>{saving ? "Processing Commit..." : isEdit ? "Update Metrics Package" : "Complete Work Order Configuration"}</span>
//                </button>
//            </div>
//        </div>
//    );
//}
//
//// ── Uniform Style Token Definitions ──────────────────────────────────────────
//const spinStyle = { animation: "spin 0.9s linear infinite", display: "inline-block" };
//
//const css = {
//    page: {
//        maxWidth: 1440,
//        margin: "0 auto",
//        padding: "0 24px 56px",
//        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
//    },
//    loadingWrap: {
//        display: "flex",
//        alignItems: "center",
//        justifyContent: "center",
//        gap: 12,
//        padding: "120px 0",
//        color: "#64748b",
//        fontSize: 15,
//        fontWeight: 500
//    },
//    pageHeader: {
//        display: "flex",
//        alignItems: "center",
//        justifyContent: "space-between",
//        gap: 20,
//        padding: "32px 0 24px",
//        flexWrap: "wrap"
//    },
//    headerLeft: {
//        display: "flex",
//        flexDirection: "column",
//        gap: 8
//    },
//    backBtn: {
//        background: "none",
//        border: "none",
//        padding: 0,
//        cursor: "pointer",
//        fontSize: 13,
//        color: "#64748b",
//        fontWeight: 500,
//        display: "flex",
//        alignItems: "center",
//        gap: 6,
//        width: "fit-content",
//        transition: "color 0.15s"
//    },
//    titleBlock: {
//        display: "flex",
//        flexDirection: "column",
//        gap: 4
//    },
//    pageTitle: {
//        margin: 0,
//        fontSize: 24,
//        fontWeight: 800,
//        color: "#0f172a",
//        letterSpacing: "-0.02em"
//    },
//    projectLine: {
//        display: "flex",
//        alignItems: "center",
//        gap: 8,
//        fontSize: 13,
//        color: "#475569",
//        fontWeight: 500
//    },
//    projectDot: {
//        width: 7,
//        height: 7,
//        borderRadius: "50%",
//        background: "#6366f1",
//        flexShrink: 0
//    },
//    saveBtn: {
//        display: "flex",
//        alignItems: "center",
//        gap: 8,
//        padding: "11px 22px",
//        background: "#10b981",
//        color: "#fff",
//        border: "none",
//        borderRadius: 8,
//        cursor: "pointer",
//        fontWeight: 600,
//        fontSize: 13,
//    },
//    toast: {
//        display: "flex",
//        alignItems: "center",
//        gap: 12,
//        padding: "14px 18px",
//        borderRadius: 8,
//        fontSize: 14,
//        fontWeight: 500,
//        marginBottom: 24,
//        border: "1px solid"
//    },
//    toastOk: { background: "#ecfdf5", color: "#047857", borderColor: "#a7f3d0" },
//    toastErr: { background: "#fef2f2", color: "#b91c1c", borderColor: "#fecaca" },
//
//    card: {
//        background: "#ffffff",
//        borderRadius: 12,
//        border: "1px solid #e2e8f0",
//        boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
//        marginBottom: 24,
//        overflow: "hidden"
//    },
//    cardHeader: {
//        display: "flex",
//        alignItems: "center",
//        gap: 10,
//        padding: "20px 24px 0"
//    },
//    cardLabel: {
//        margin: 0,
//        fontSize: 12,
//        fontWeight: 700,
//        color: "#475569",
//        letterSpacing: "0.05em",
//        textTransform: "uppercase"
//    },
//    detailsGrid: {
//        display: "grid",
//        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
//        gap: 24,
//        padding: "20px 24px 24px"
//    },
//    fieldWrap: {
//        display: "flex",
//        flexDirection: "column",
//        gap: 6
//    },
//    fieldLabel: {
//        fontSize: 11,
//        fontWeight: 700,
//        color: "#64748b",
//        letterSpacing: "0.05em"
//    },
//    req: { color: "#ef4444" },
//    inputIconWrapper: {
//        position: "relative",
//        display: "flex",
//        alignItems: "center"
//    },
//    inputIcon: {
//        position: "absolute",
//        left: 12,
//        color: "#94a3b8",
//        fontSize: 12,
//        pointerEvents: "none"
//    },
//    fieldInput: {
//        width: "100%",
//        padding: "9px 14px",
//        border: "1px solid #cbd5e1",
//        borderRadius: 8,
//        fontSize: 13,
//        color: "#0f172a",
//        background: "#fff",
//        outline: "none",
//        transition: "all 0.15s ease"
//    },
//    fieldInputDisabled: { background: "#f8fafc", color: "#94a3b8", cursor: "not-allowed", borderStyle: "dashed" },
//    fieldStatic: {
//        padding: "9px 14px",
//        border: "1px solid #e2e8f0",
//        borderRadius: 8,
//        fontSize: 13,
//        color: "#1e293b",
//        background: "#f8fafc",
//        fontWeight: 600
//    },
//    tableToolbar: {
//        display: "flex",
//        alignItems: "center",
//        justifyContent: "space-between",
//        padding: "20px 24px",
//        borderBottom: "1px solid #e2e8f0",
//        backgroundColor: "#ffffff"
//    },
//    tableToolbarLeft: {
//        display: "flex",
//        alignItems: "center",
//        gap: 12
//    },
//    tableCardTitle: {
//        fontSize: 15,
//        fontWeight: 700,
//        color: "#0f172a"
//    },
//    rowCount: {
//        fontSize: 12,
//        color: "#64748b",
//        fontWeight: 500,
//        backgroundColor: "#f1f5f9",
//        padding: "2px 10px",
//        borderRadius: 20
//    },
//    addBtn: {
//        display: "flex",
//        alignItems: "center",
//        gap: 8,
//        padding: "9px 16px",
//        background: "#6366f1",
//        color: "#fff",
//        border: "none",
//        borderRadius: 8,
//        cursor: "pointer",
//        fontWeight: 600,
//        fontSize: 12,
//    },
//    tableWrap: { overflowX: "auto" },
//    table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
//    th: {
//        padding: "12px 10px",
//        background: "#1e293b",
//        color: "#f8fafc",
//        fontWeight: 600,
//        textAlign: "left",
//        fontSize: 12,
//        whiteSpace: "nowrap",
//        borderRight: "1px solid #334155",
//        verticalAlign: "middle",
//    },
//    thLabel: { display: "block", lineHeight: 1.2 },
//    thAuto: { display: "flex", flexDirection: "column", gap: 2 },
//    autoTag: { fontSize: 8, fontWeight: 700, color: "#a5b4fc", textTransform: "uppercase", letterSpacing: "0.05em" },
//    thWithUnit: { display: "flex", flexDirection: "column", gap: 6 },
//    unitPills: { display: "flex", background: "#0f172a", padding: 2, borderRadius: 6, width: "fit-content" },
//    unitPill: {
//        fontSize: 9, fontWeight: 600, padding: "3px 8px", borderRadius: 4,
//        border: "none", cursor: "pointer", background: "transparent", color: "#64748b",
//        textTransform: "uppercase", letterSpacing: "0.02em"
//    },
//    tr: { borderBottom: "1px solid #e2e8f0" },
//    td: { padding: "6px 8px", verticalAlign: "middle" },
//    cell: {
//        width: "100%", padding: "7px 10px",
//        border: "1px solid #cbd5e1", borderRadius: 6,
//        fontSize: 13, color: "#0f172a",
//        background: "#fff", outline: "none",
//    },
//    cellAuto: {
//        background: "#f1f5f9", color: "#475569",
//        cursor: "not-allowed", fontWeight: 500,
//        borderColor: "#e2e8f0",
//    },
//    cellConverted: {
//        background: "#f0f9ff", color: "#0284c7",
//        cursor: "not-allowed", fontWeight: 600,
//        borderColor: "#bae6fd",
//    },
//    cellNos: {
//        background: "#faf5ff", color: "#6b21a8",
//        fontWeight: 600,
//        borderColor: "#e9d5ff",
//        cursor: "not-allowed"
//    },
//    delBtn: {
//        display: "inline-flex", alignItems: "center", justifyContent: "center",
//        width: 30, height: 30, borderRadius: 6,
//        background: "#ffffff", border: "1px solid #e2e8f0",
//        cursor: "pointer",
//    },
//    tfootRow: { background: "#f8fafc", borderTop: "2px solid #cbd5e1" },
//    tfootLabel: { padding: "14px 16px", fontWeight: 700, fontSize: 13, color: "#1e293b", textAlign: "left" },
//    tfootCell: { padding: "14px 10px", fontSize: 13, textAlign: "right", color: "#334155", fontWeight: 600 },
//    tfootConverted: { color: "#0284c7" },
//    tfootNos: { color: "#6b21a8" },
//    summaryStrip: { display: "flex", gap: 0, borderTop: "1px solid #e2e8f0", backgroundColor: "#ffffff", flexWrap: "wrap" },
//    summaryItem: { flex: "1 1 180px", display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 12px", borderRight: "1px solid #e2e8f0" },
//    summaryLabel: { fontSize: 10, color: "#64748b", fontWeight: 600, letterSpacing: "0.05em", marginBottom: 6, textTransform: "uppercase" },
//    summaryVal: { fontSize: 20, fontWeight: 800, letterSpacing: "-0.01em" },
//    bottomBar: { display: "flex", justifyContent: "flex-end", paddingTop: 16 },
//};

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
    FaFilePdf, FaMagic, FaPlus, FaTrash,
    FaSave, FaCheckCircle, FaExclamationTriangle,
    FaRobot, FaCloudUploadAlt, FaSpinner,
    FaEye, FaInfoCircle, FaCalculator,
    FaRegArrowAltCircleLeft, FaHashtag, FaCalendarAlt, FaLayerGroup
} from "react-icons/fa";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import * as PDFJS from "pdfjs-dist";

PDFJS.GlobalWorkerOptions.workerSrc =
    new URL("pdfjs-dist/build/pdf.worker.mjs", import.meta.url).toString();

// ── Calculations ──────────────────────────────────────────────────────────────
function calcSqft(length, height) {
    const l = parseFloat(length);
    const h = parseFloat(height);
    if (isNaN(l) || l <= 0 || isNaN(h) || h <= 0) return "";
    return ((l * h) / 1_000_000 * 10.764).toFixed(4);
}

function convertWoQty(rawValue, woQtyUnit) {
    const v = parseFloat(rawValue);
    if (isNaN(v) || v <= 0) return "";
    return woQtyUnit === "sqm" ? (v * 10.764).toFixed(4) : v.toFixed(4);
}

function calcWoQtyNos(woQtySqft, sqft) {
    const qty  = parseFloat(woQtySqft);
    const area = parseFloat(sqft);
    if (isNaN(qty) || isNaN(area) || area <= 0) return "";
    return Math.floor(qty / area).toString();
}

const emptyRow = () => ({
    _id:          Date.now() + Math.random(),
    srNo:         "",
    location:     "",
    windowCode:   "",
    typology:     "",
    series:       "",
    length:       "",
    height:       "",
    sqft:         "",
    woQtySqftRaw: "",
    woQtySqft:    "",
    woQtyNos:     "",
    floorPlanQty: "",
});

// ── PDF helpers ───────────────────────────────────────────────────────────────
async function pdfToImages(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFJS.getDocument({ data: arrayBuffer }).promise;
    const images = [];
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page     = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 });
        const maxDim   = 1600;
        const ratio    = Math.min(1, maxDim / Math.max(viewport.width, viewport.height));
        const final    = page.getViewport({ scale: 1.5 * ratio });
        const canvas   = document.createElement("canvas");
        canvas.width   = Math.floor(final.width);
        canvas.height  = Math.floor(final.height);
        await page.render({ canvasContext: canvas.getContext("2d"), viewport: final }).promise;
        images.push(canvas.toDataURL("image/jpeg", 0.80).split(",")[1]);
    }
    return images;
}

async function extractPageWithGrok(base64Image, pageNum, apiKey) {
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify({
            model: "grok-4.3",
            temperature: 0,
            max_tokens: 2000,
            messages: [{
                role: "user",
                content: [
                    { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}`, detail: "auto" } },
                    {
                        type: "text",
                        text: `This is page ${pageNum} of a scanned work order. Length and Height values are in millimetres (mm).
Extract ALL table rows. For each row return:
- srNo, location, windowCode, typology, series
- length, height (numeric mm, no units)
- woQtySqftRaw (numbers only, no units)
- floorPlanQty (numbers only)
Rules: missing/illegible → "". Numbers only. sqft and woQtyNos will be auto-calculated.
Return ONLY a raw JSON array, no markdown:
[{"srNo":"1","location":"Living Room","windowCode":"W1","typology":"Sliding","series":"32mm","length":"2700","height":"2350","woQtySqftRaw":"","floorPlanQty":"4"}]`,
                    },
                ],
            }],
        }),
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(`Grok API error ${response.status}: ${err?.error?.message || JSON.stringify(err)}`);
    }
    const data  = await response.json();
    const text  = (data.choices?.[0]?.message?.content || "").trim();
    const clean = text.replace(/```json|```/g, "").trim();
    if (!clean || clean === "[]") return [];
    return JSON.parse(clean);
}

async function extractWithGrok(base64Images, onProgress) {
    const apiKey = process.env.REACT_APP_GROK_API_KEY;
    let allRows  = [];
    for (let i = 0; i < base64Images.length; i++) {
        onProgress(`Processing page ${i + 1} of ${base64Images.length} with Grok Vision…`);
        const rows = await extractPageWithGrok(base64Images[i], i + 1, apiKey);
        allRows    = [...allRows, ...rows];
        if (i < base64Images.length - 1) await new Promise(r => setTimeout(r, 400));
    }
    return allRows;
}

// ── Column definitions ────────────────────────────────────────────────────────
const makeCols = (woQtyUnit) => [
    { key: "srNo",         label: "Sr. No",        type: "text",   w: 60  },
    { key: "location",     label: "Location",       type: "text",   w: 130 },
    { key: "windowCode",   label: "Window Code",    type: "text",   w: 120 },
    { key: "typology",     label: "Typology",       type: "text",   w: 120 },
    { key: "series",       label: "Series",         type: "text",   w: 110 },
    { key: "length",       label: "Length (mm)",    type: "number", w: 100 },
    { key: "height",       label: "Height (mm)",    type: "number", w: 100 },
    { key: "sqft",         label: "Sqft",           type: "number", w: 110, auto: true },
    { key: "woQtySqftRaw", label: "W/O Qty",        type: "number", w: 120, hasUnit: true },
    ...(woQtyUnit === "sqm"
        ? [{ key: "woQtySqft", label: "Converted Sqft", type: "number", w: 160, auto: true, converted: true }]
        : []),
    { key: "woQtyNos",     label: "W/O Qty (Nos)", type: "number", w: 120, auto: true },
    { key: "floorPlanQty", label: "Floor Plan Qty", type: "number", w: 120 },
];

// ─────────────────────────────────────────────────────────────────────────────
export default function WorkOrderFormPage() {
    const navigate  = useNavigate();
    const location  = useLocation();
    const { id }    = useParams();          // present on edit route /:id/edit
    const isEdit    = Boolean(id);

    // Project comes from WorkOrdersPage via navigate(..., { state: { project } })
    const projectFromState = location.state?.project?.projectName || "";

    // ── Form state ────────────────────────────────────────────────────────────
    const [workOrderNo, setWorkOrderNo] = useState("");
    const [projectName, setProjectName] = useState(projectFromState);
    const [date,        setDate]        = useState(new Date().toISOString().split("T")[0]);
    const [woQtyUnit,   setWoQtyUnit]   = useState("sqft");
    const [rows,        setRows]        = useState([emptyRow()]);

    // ── UI state ──────────────────────────────────────────────────────────────
    const [loading,     setLoading]     = useState(isEdit);
    const [saving,      setSaving]      = useState(false);
    const [saveMsg,     setSaveMsg]     = useState(null);

    // ── AI / PDF state (create mode only) ────────────────────────────────────
    const fileRef                             = useRef(null);
    const [pdfFile,       setPdfFile]         = useState(null);
    const [previewImages, setPreviewImages]   = useState([]);
    const [showPreview,   setShowPreview]     = useState(false);
    const [aiStep,        setAiStep]          = useState("idle"); // idle|converting|extracting|done|error
    const [aiStepMsg,     setAiStepMsg]       = useState("");
    const [extractMsg,    setExtractMsg]      = useState(null);
    const [dragOver,      setDragOver]        = useState(false);
    const isExtracting = aiStep === "converting" || aiStep === "extracting";

    // ── Load existing WO when editing ─────────────────────────────────────────
    useEffect(() => {
        if (!isEdit) return;
        (async () => {
            try {
                const res  = await fetch(`${process.env.REACT_APP_API_URL}/api/work-orders/${id}`);
                if (!res.ok) throw new Error("Not found");
                const data = await res.json();

                setWorkOrderNo(data.workOrderNo || "");
                setProjectName(data.projectName || "");
                setDate(data.date   || new Date().toISOString().split("T")[0]);

                // Determine unit from first item
                const firstUnit = data.items?.[0]?.woQtyUnit;
                if (firstUnit) setWoQtyUnit(firstUnit);

                setRows(
                    (data.items || []).map(item => ({
                        _id:          Date.now() + Math.random(),
                        srNo:         item.srNo          || "",
                        location:     item.location      || "",
                        windowCode:   item.windowCode    || "",
                        typology:     item.typology      || "",
                        series:       item.series        || "",
                        length:       item.length        ?? "",
                        height:       item.height        ?? "",
                        sqft:         item.sqft          ?? "",
                        woQtySqftRaw: item.woQtySqftRaw  ?? "",
                        woQtySqft:    item.woQtySqft     ?? "",
                        woQtyNos:     item.woQtyNos      ?? "",
                        floorPlanQty: item.floorPlanQty  ?? "",
                    }))
                );
            } catch {
                setSaveMsg({ type: "error", text: "Failed to load work order data." });
            } finally {
                setLoading(false);
            }
        })();
    }, [id, isEdit]);

    // ── Re-convert all rows when unit switches ────────────────────────────────
    useEffect(() => {
        setRows(prev => prev.map(row => {
            const converted = convertWoQty(row.woQtySqftRaw, woQtyUnit);
            return { ...row, woQtySqft: converted, woQtyNos: calcWoQtyNos(converted, row.sqft) };
        }));
    }, [woQtyUnit]);

    // ── Row operations ────────────────────────────────────────────────────────
    const addRow    = () => setRows(r => [...r, emptyRow()]);
    const deleteRow = (_id) => setRows(r => r.filter(row => row._id !== _id));

    const updateRow = (_id, field, value) =>
        setRows(prev => prev.map(row => {
            if (row._id !== _id) return row;
            const u = { ...row, [field]: value };
            if (field === "length" || field === "height") {
                u.sqft     = calcSqft(u.length, u.height);
                u.woQtyNos = calcWoQtyNos(u.woQtySqft, u.sqft);
            }
            if (field === "woQtySqftRaw") {
                u.woQtySqft = convertWoQty(value, woQtyUnit);
                u.woQtyNos  = calcWoQtyNos(u.woQtySqft, u.sqft);
            }
            return u;
        }));

    // ── PDF file select ───────────────────────────────────────────────────────
    const handleFileSelect = useCallback(async (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer?.files?.[0] || e.target?.files?.[0];
        if (!file || file.type !== "application/pdf") {
            setExtractMsg({ type: "error", text: "Please upload a valid PDF file." });
            return;
        }
        setPdfFile(file);
        setExtractMsg(null);
        setAiStep("idle");
        setPreviewImages([]);
        setShowPreview(false);
    }, []);

    // ── AI extraction ─────────────────────────────────────────────────────────
    const handleExtract = async () => {
        if (!pdfFile) return;
        setExtractMsg(null);
        setAiStep("converting");
        setAiStepMsg("Step 1/2 — Converting PDF pages to images…");
        try {
            const images = await pdfToImages(pdfFile);
            setPreviewImages(images);
            setAiStep("extracting");
            const extracted = await extractWithGrok(images, setAiStepMsg);
            if (!Array.isArray(extracted) || extracted.length === 0)
                throw new Error("No rows detected. Try a higher quality scan or enter data manually.");

            const withCalcs = extracted.map(item => {
                const sqft      = calcSqft(item.length, item.height);
                const converted = convertWoQty(item.woQtySqftRaw || "", woQtyUnit);
                const nos       = calcWoQtyNos(converted, sqft);
                return { ...emptyRow(), ...item, _id: Date.now() + Math.random(), sqft, woQtySqft: converted, woQtyNos: nos };
            });

            setRows(withCalcs);
            setAiStep("done");
            setExtractMsg({
                type: "success",
                text: `Grok AI extracted ${withCalcs.length} row(s) from ${images.length} page(s). Review and save.`,
            });
        } catch (err) {
            setAiStep("error");
            setExtractMsg({ type: "error", text: err.message });
        }
    };

    // ── Save / Update ─────────────────────────────────────────────────────────
    const handleSave = async () => {
        setSaveMsg(null);
        if (!workOrderNo.trim()) { setSaveMsg({ type: "error", text: "Work Order No. is required." }); return; }
        if (!projectName.trim()) { setSaveMsg({ type: "error", text: "Project Name is required."   }); return; }

        const validRows = rows.filter(r => r.srNo || r.location || r.windowCode || r.length);
        if (!validRows.length) { setSaveMsg({ type: "error", text: "Add at least one row." }); return; }

        setSaving(true);
        const payload = {
            workOrderNo,
            projectName,
            date,
            items: validRows.map(({ _id, ...rest }) => ({ ...rest, woQtyUnit })),
        };

        try {
            const url    = isEdit
                ? `${process.env.REACT_APP_API_URL}/api/work-orders/${id}`
                : `${process.env.REACT_APP_API_URL}/api/work-orders`;
            const method = isEdit ? "PUT" : "POST";

            const res  = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Server error");

            setSaveMsg({ type: "success", text: isEdit ? "Work Order updated successfully!" : "Work Order created successfully!" });
            setTimeout(() => navigate("/coordinator-dashboard/work-orders"), 1400);
        } catch (err) {
            setSaveMsg({ type: "error", text: err.message });
        } finally {
            setSaving(false);
        }
    };

    // ── Totals ────────────────────────────────────────────────────────────────
    const totalSqft = rows.reduce((s, r) => s + (parseFloat(r.woQtySqft)    || 0), 0);
    const totalNos  = rows.reduce((s, r) => s + (parseInt(r.woQtyNos)       || 0), 0);
    const totalFP   = rows.reduce((s, r) => s + (parseFloat(r.floorPlanQty) || 0), 0);

    const COLS = makeCols(woQtyUnit);
    const isSqm = woQtyUnit === "sqm";

    // ── Loading state ─────────────────────────────────────────────────────────
    if (loading) return (
        <div style={css.loadingWrap}>
            <FaSpinner style={spinStyle} />
            <span>Loading work order…</span>
        </div>
    );

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div style={css.page}>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                .wo-row:hover { background: #f8fafc !important; }
                .wo-del-btn:hover { color: #ef4444 !important; background: #fef2f2 !important; border-color: #fecaca !important; }
                .wo-add-btn:hover { background: #4f46e5 !important; transform: translateY(-1px); }
                .wo-save-btn:hover:not(:disabled) { background: #047857 !important; transform: translateY(-1px); }
                .wo-unit-pill.active { background: #6366f1 !important; color: #fff !important; font-weight: 700; }
                .wo-unit-pill:hover:not(.active) { background: #334155 !important; color: #f8fafc !important; }
                .wo-cell:focus { border-color: #6366f1 !important; box-shadow: inset 0 0 0 1px #6366f1 !important; background: #fff !important; }
                .wo-meta-input:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.08) !important; }
                .drop-zone:hover { border-color: #6366f1 !important; }
                input[type=number]::-webkit-inner-spin-button,
                input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
                input[type=number] { -moz-appearance: textfield; }
            `}</style>

            {/* ── Header ── */}
            <div style={css.pageHeader}>
                <div style={css.headerLeft}>
                    <button style={css.backBtn} onClick={() => navigate("/coordinator-dashboard/work-orders")}>
                        <FaRegArrowAltCircleLeft /> Back to Work Orders
                    </button>
                    <div>
                        <h1 style={css.pageTitle}>
                            {isEdit ? "Edit Work Order" : "Create Work Order"}
                        </h1>
                        {projectName && (
                            <div style={css.projectLine}>
                                <span style={css.dot} />
                                Project: <strong style={{ color: "#0f172a", marginLeft: 4 }}>{projectName}</strong>
                            </div>
                        )}
                    </div>
                </div>
                <button className="wo-save-btn" style={css.saveBtn} onClick={handleSave} disabled={saving}>
                    {saving ? <FaSpinner style={spinStyle} /> : <FaSave style={{ fontSize: 13 }} />}
                    <span>{saving ? "Saving…" : isEdit ? "Update Work Order" : "Save Work Order"}</span>
                </button>
            </div>

            {/* ── Toast ── */}
            {saveMsg && (
                <div style={{ ...css.toast, ...(saveMsg.type === "success" ? css.toastOk : css.toastErr) }}>
                    {saveMsg.type === "success"
                        ? <FaCheckCircle style={{ flexShrink: 0 }} />
                        : <FaExclamationTriangle style={{ flexShrink: 0 }} />}
                    <span>{saveMsg.text}</span>
                </div>
            )}

            {/* ── Metadata card ── */}
            <div style={css.card}>
                <div style={css.cardHeader}>
                    <FaLayerGroup style={{ color: "#6366f1" }} />
                    <span style={css.cardLabel}>Work Order Details</span>
                </div>
                <div style={css.metaGrid}>
                    {/* Work Order No */}
                    <div style={css.fieldWrap}>
                        <label style={css.fieldLabel}>WORK ORDER NO <span style={{ color: "#ef4444" }}>*</span></label>
                        <div style={css.iconWrap}>
                            <FaHashtag style={css.inputIcon} />
                            <input
                                className="wo-meta-input"
                                style={{
                                    ...css.fieldInput,
                                    paddingLeft: 34,
                                    ...(isEdit ? css.fieldInputDisabled : {})
                                }}
                                value={workOrderNo}
                                onChange={e => setWorkOrderNo(e.target.value)}
                                placeholder="e.g. WO-2026-001"
                                disabled={isEdit}
                            />
                        </div>
                    </div>

                    {/* Project Name — read-only, auto-filled */}
                    <div style={css.fieldWrap}>
                        <label style={css.fieldLabel}>PROJECT NAME <span style={{ color: "#ef4444" }}>*</span></label>
                        <div style={{ ...css.fieldStatic, fontWeight: 600 }}>
                            {projectName || <span style={{ color: "#94a3b8" }}>No project selected</span>}
                        </div>
                        {!projectName && (
                            <span style={{ fontSize: 11, color: "#f59e0b", marginTop: 4 }}>
                                ⚠ Go back and select a project first
                            </span>
                        )}
                    </div>

                    {/* Date */}
                    <div style={css.fieldWrap}>
                        <label style={css.fieldLabel}>DATE</label>
                        <div style={css.iconWrap}>
                            <FaCalendarAlt style={css.inputIcon} />
                            <input
                                className="wo-meta-input"
                                style={{ ...css.fieldInput, paddingLeft: 34 }}
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            

            {/* ── AI / PDF panel — CREATE MODE ONLY ── */}
            {!isEdit && (
                <div style={css.card}>
                    <div style={css.cardHeader}>
                        <FaRobot style={{ color: "#7c3aed" }} />
                        <span style={css.cardLabel}>AI Auto-Fill from Scanned PDF</span>
                        <span style={css.grokBadge}>Grok Vision</span>
                    </div>

                    <p style={{ fontSize: 13, color: "#64748b", margin: "12px 24px 0" }}>
                        Upload a scanned work order PDF → Grok Vision reads all rows → Sqft auto-calculated.
                    </p>

                    <div style={{ padding: "16px 24px 0" }}>
                        <div style={css.infoBox}>
                            <FaInfoCircle style={{ color: "#2563eb", flexShrink: 0 }} />
                            <span>Sqft is auto-calculated from mm dimensions. Set W/O Qty unit above before or after extraction.</span>
                        </div>

                        {/* Drop zone */}
                        <div
                            className="drop-zone"
                            style={{
                                ...css.dropZone,
                                ...(dragOver ? { borderColor: "#2563eb", background: "#eff6ff" } : {}),
                                ...(pdfFile  ? { borderColor: "#16a34a", background: "#f0fdf4" } : {}),
                            }}
                            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleFileSelect}
                            onClick={() => fileRef.current?.click()}
                        >
                            <input ref={fileRef} type="file" accept="application/pdf" style={{ display: "none" }} onChange={handleFileSelect} />
                            {pdfFile ? (
                                <>
                                    <FaFilePdf style={{ fontSize: 38, color: "#ef4444", marginBottom: 8 }} />
                                    <div style={{ fontWeight: 700, color: "#1e293b" }}>{pdfFile.name}</div>
                                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{(pdfFile.size / 1024).toFixed(1)} KB — click to change</div>
                                </>
                            ) : (
                                <>
                                    <FaCloudUploadAlt style={{ fontSize: 42, color: "#94a3b8", marginBottom: 8 }} />
                                    <div style={{ fontWeight: 600, color: "#334155" }}>Drag &amp; drop scanned Work Order PDF</div>
                                    <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>or click to browse</div>
                                </>
                            )}
                        </div>

                        {isExtracting && (
                            <div style={css.progressBox}>
                                <FaSpinner style={{ ...spinStyle, color: "#7c3aed", fontSize: 18 }} />
                                <span style={{ color: "#4c1d95", fontWeight: 600, fontSize: 14 }}>{aiStepMsg}</span>
                            </div>
                        )}

                        <div style={{ display: "flex", gap: 12, marginTop: 14, flexWrap: "wrap", paddingBottom: 24 }}>
                            {pdfFile && (
                                <button style={css.extractBtn} onClick={handleExtract} disabled={isExtracting}>
                                    {isExtracting
                                        ? <><FaSpinner style={spinStyle} />&nbsp;Processing…</>
                                        : <><FaMagic />&nbsp;Extract with Grok AI</>}
                                </button>
                            )}
                            {previewImages.length > 0 && (
                                <button style={css.previewBtn} onClick={() => setShowPreview(v => !v)}>
                                    <FaEye />&nbsp;{showPreview ? "Hide" : "Show"} Preview ({previewImages.length} page{previewImages.length > 1 ? "s" : ""})
                                </button>
                            )}
                        </div>

                        {showPreview && previewImages.length > 0 && (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16, padding: "0 0 24px" }}>
                                {previewImages.map((img, i) => (
                                    <div key={i}>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Page {i + 1}</div>
                                        <img src={`data:image/jpeg;base64,${img}`} alt={`Page ${i + 1}`}
                                            style={{ width: "100%", borderRadius: 6, border: "1px solid #e2e8f0" }} />
                                    </div>
                                ))}
                            </div>
                        )}

                        {extractMsg && (
                            <div style={{
                                ...css.toast,
                                ...(extractMsg.type === "success" ? css.toastOk : css.toastErr),
                                marginBottom: 16
                            }}>
                                {extractMsg.type === "success" ? <FaCheckCircle style={{ flexShrink: 0 }} /> : <FaExclamationTriangle style={{ flexShrink: 0 }} />}
                                <span>{extractMsg.text}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Items table ── */}
            <div style={css.card}>
                <div style={css.tableToolbar}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Line Items</span>
                        <span style={css.rowCount}>{rows.length} rows</span>
                    </div>
                    <button className="wo-add-btn" style={css.addBtn} onClick={addRow}>
                        <FaPlus style={{ fontSize: 11 }} />&nbsp;Add Row
                    </button>
                </div>

                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                        <thead>
                            <tr>
                                {COLS.map(c => (
                                    <th key={c.key} style={{ ...css.th, minWidth: c.w, maxWidth: c.w }}>
                                        {c.hasUnit ? (
                                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                                <span>W/O Quantity</span>
                                                <div style={{ display: "flex", background: "#0f172a", padding: 2, borderRadius: 6, width: "fit-content" }}>
                                                    {["sqft", "sqm"].map(u => (
                                                        <button
                                                            key={u}
                                                            className={`wo-unit-pill ${woQtyUnit === u ? "active" : ""}`}
                                                            style={css.unitPillSm}
                                                            onClick={() => setWoQtyUnit(u)}
                                                        >
                                                            {u}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : c.auto ? (
                                            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                                <span>{c.label}</span>
                                                <span style={{ fontSize: 8, fontWeight: 700, color: "#a5b4fc", textTransform: "uppercase" }}>Auto</span>
                                            </div>
                                        ) : (
                                            <span>{c.label}</span>
                                        )}
                                    </th>
                                ))}
                                <th style={{ ...css.th, minWidth: 48, maxWidth: 48, textAlign: "center" }}>Del</th>
                            </tr>
                        </thead>

                        <tbody>
                            {rows.map((row, idx) => (
                                <tr key={row._id} className="wo-row" style={{ borderBottom: "1px solid #e2e8f0" }}>
                                    {COLS.map(c => (
                                        <td key={c.key} style={{ padding: "6px 8px" }}>
                                            <input
                                                className="wo-cell"
                                                style={{
                                                    ...css.cell,
                                                    ...(c.auto && !c.converted ? css.cellAuto : {}),
                                                    ...(c.converted ? css.cellConverted : {}),
                                                    ...(c.key === "woQtyNos" && row[c.key] ? css.cellNos : {}),
                                                    textAlign: c.type === "number" || c.auto ? "right" : "left",
                                                }}
                                                type={c.type}
                                                value={row[c.key]}
                                                readOnly={c.auto}
                                                placeholder={c.key === "srNo" ? String(idx + 1) : ""}
                                                onChange={e => updateRow(row._id, c.key, e.target.value)}
                                            />
                                        </td>
                                    ))}
                                    <td style={{ padding: "6px 8px", textAlign: "center" }}>
                                        <button
                                            className="wo-del-btn"
                                            style={css.delBtn}
                                            onClick={() => deleteRow(row._id)}
                                            title="Delete row"
                                        >
                                            <FaTrash style={{ fontSize: 11 }} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                        <tfoot>
                            <tr style={{ background: "#f8fafc", borderTop: "2px solid #cbd5e1" }}>
                                <td colSpan={8} style={{ padding: "14px 16px", fontWeight: 700, fontSize: 13, color: "#1e293b" }}>
                                    Totals
                                </td>
                                <td style={css.tfootCell} />
                                {isSqm && <td style={{ ...css.tfootCell, color: "#0284c7" }}>{totalSqft.toFixed(2)}</td>}
                                <td style={{ ...css.tfootCell, color: "#6b21a8" }}>{totalNos}</td>
                                <td style={{ ...css.tfootCell, color: "#059669" }}>{totalFP.toFixed(2)}</td>
                                <td style={css.tfootCell} />
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Summary strip */}
                <div style={css.summaryStrip}>
                    {[
                        { label: "Rows",          val: rows.length,             color: "#475569" },
                        { label: "Unit",           val: woQtyUnit.toUpperCase(), color: "#4f46e5" },
                        { label: "Total Sqft",     val: totalSqft.toFixed(2),   color: "#0891b2" },
                        { label: "Total Nos",      val: totalNos,               color: "#7c3aed" },
                        { label: "Floor Plan Sum", val: totalFP,                color: "#059669" },
                    ].map(s => (
                        <div key={s.label} style={css.summaryItem}>
                            <span style={css.summaryLabel}>{s.label}</span>
                            <span style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.val}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Bottom save bar ── */}
            <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 8, paddingBottom: 40 }}>
                <button className="wo-save-btn" style={css.saveBtn} onClick={handleSave} disabled={saving}>
                    {saving ? <FaSpinner style={spinStyle} /> : <FaSave style={{ fontSize: 13 }} />}
                    <span>{saving ? "Saving…" : isEdit ? "Update Work Order" : "Save Work Order"}</span>
                </button>
            </div>
        </div>
    );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const spinStyle = { animation: "spin 0.9s linear infinite", display: "inline-block" };

const css = {
    page:        { maxWidth: 1440, margin: "0 auto", padding: "0 24px 56px", fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif" },
    loadingWrap: { display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "120px 0", color: "#64748b", fontSize: 15 },
    pageHeader:  { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, padding: "32px 0 24px", flexWrap: "wrap" },
    headerLeft:  { display: "flex", flexDirection: "column", gap: 8 },
    backBtn:     { background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 13, color: "#64748b", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 },
    pageTitle:   { margin: 0, fontSize: 24, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" },
    projectLine: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#475569", fontWeight: 500 },
    dot:         { width: 7, height: 7, borderRadius: "50%", background: "#6366f1", flexShrink: 0 },
    saveBtn:     { display: "flex", alignItems: "center", gap: 8, padding: "11px 22px", background: "#10b981", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13, transition: "all 0.2s" },
    toast:       { display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderRadius: 8, fontSize: 14, fontWeight: 500, marginBottom: 24, border: "1px solid" },
    toastOk:     { background: "#ecfdf5", color: "#047857", borderColor: "#a7f3d0" },
    toastErr:    { background: "#fef2f2", color: "#b91c1c", borderColor: "#fecaca" },
    card:        { background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)", marginBottom: 24, overflow: "hidden" },
    cardHeader:  { display: "flex", alignItems: "center", gap: 10, padding: "20px 24px 0" },
    cardLabel:   { fontSize: 12, fontWeight: 700, color: "#475569", letterSpacing: "0.05em", textTransform: "uppercase" },
    grokBadge:   { background: "#ede9fe", color: "#6d28d9", fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20, marginLeft: 8 },
    metaGrid:    { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 24, padding: "20px 24px 24px" },
    fieldWrap:   { display: "flex", flexDirection: "column", gap: 6 },
    fieldLabel:  { fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.05em" },
    iconWrap:    { position: "relative", display: "flex", alignItems: "center" },
    inputIcon:   { position: "absolute", left: 12, color: "#94a3b8", fontSize: 12, pointerEvents: "none" },
    fieldInput:  { width: "100%", padding: "9px 14px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13, color: "#0f172a", background: "#fff", outline: "none", transition: "all 0.15s", boxSizing: "border-box" },
    fieldInputDisabled: { background: "#f8fafc", color: "#94a3b8", cursor: "not-allowed", borderStyle: "dashed" },
    fieldStatic: { padding: "9px 14px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, color: "#1e293b", background: "#f8fafc" },
    unitCard:    { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 12, padding: "16px 22px", marginBottom: 24, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap" },
    unitLeft:    { display: "flex", alignItems: "flex-start", gap: 12, flex: 1 },
    unitTitle:   { fontSize: 14, fontWeight: 700, color: "#1e40af", marginBottom: 6 },
    formula:     { background: "#dbeafe", color: "#1e40af", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontFamily: "monospace" },
    formulaBadge:{ background: "#1e40af", color: "#fff", padding: "1px 7px", borderRadius: 4, fontSize: 11, fontWeight: 700 },
    unitRight:   { display: "flex", flexDirection: "column", gap: 8, minWidth: 200 },
    unitPills:   { display: "flex", background: "#1e293b", padding: 3, borderRadius: 8, width: "fit-content", gap: 2 },
    unitPill:    { fontSize: 12, fontWeight: 600, padding: "5px 16px", borderRadius: 6, border: "none", cursor: "pointer", background: "transparent", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.02em", transition: "all 0.15s" },
    infoBox:     { display: "flex", alignItems: "flex-start", gap: 10, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#1e40af", marginBottom: 16 },
    dropZone:    { border: "2px dashed #cbd5e1", borderRadius: 12, padding: "36px 24px", textAlign: "center", cursor: "pointer", transition: "all 0.2s", background: "#f8fafc" },
    progressBox: { display: "flex", alignItems: "center", gap: 12, background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: 8, padding: "12px 16px", marginTop: 14 },
    extractBtn:  { display: "flex", alignItems: "center", gap: 8, padding: "11px 24px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14 },
    previewBtn:  { display: "flex", alignItems: "center", gap: 8, padding: "11px 20px", background: "#0ea5e9", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14 },
    tableToolbar:{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid #e2e8f0" },
    rowCount:    { fontSize: 12, color: "#64748b", fontWeight: 500, background: "#f1f5f9", padding: "2px 10px", borderRadius: 20 },
    addBtn:      { display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 12, transition: "all 0.2s" },
    th:          { padding: "12px 10px", background: "#1e293b", color: "#f8fafc", fontWeight: 600, textAlign: "left", fontSize: 12, whiteSpace: "nowrap", borderRight: "1px solid #334155", verticalAlign: "middle" },
    cell:        { width: "100%", padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, color: "#0f172a", background: "#fff", outline: "none", transition: "border-color 0.15s" },
    cellAuto:    { background: "#f1f5f9", color: "#475569", cursor: "not-allowed", fontWeight: 500, borderColor: "#e2e8f0" },
    cellConverted:{ background: "#f0f9ff", color: "#0284c7", cursor: "not-allowed", fontWeight: 600, borderColor: "#bae6fd" },
    cellNos:     { background: "#faf5ff", color: "#6b21a8", fontWeight: 600, borderColor: "#e9d5ff", cursor: "not-allowed" },
    delBtn:      { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: 6, background: "#fff", border: "1px solid #e2e8f0", cursor: "pointer", color: "#94a3b8", transition: "all 0.15s" },
    tfootCell:   { padding: "14px 10px", fontSize: 13, textAlign: "right", fontWeight: 600 },
    summaryStrip:{ display: "flex", gap: 0, borderTop: "1px solid #e2e8f0", flexWrap: "wrap" },
    summaryItem: { flex: "1 1 160px", display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 12px", borderRight: "1px solid #e2e8f0" },
    summaryLabel:{ fontSize: 10, color: "#64748b", fontWeight: 600, letterSpacing: "0.05em", marginBottom: 6, textTransform: "uppercase" },
    unitPillSm:  { fontSize: 9, fontWeight: 600, padding: "3px 8px", borderRadius: 4, border: "none", cursor: "pointer", background: "transparent", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.02em" },
};
