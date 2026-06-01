////import React, { useState, useEffect } from "react";
////import { useNavigate, useParams, useLocation } from "react-router-dom";
////import {
////    FaRegArrowAltCircleLeft, FaPlus, FaTrash,
////    FaSave, FaCheckCircle, FaExclamationTriangle,
////    FaSpinner, FaHashtag, FaCalendarAlt, FaLayerGroup, FaHome
////} from "react-icons/fa";
////
////// Sqft: L(mm) × H(mm) ÷ 1,000,000 × 10.764
////function calcSqft(length, height) {
////    const l = parseFloat(length);
////    const h = parseFloat(height);
////    if (isNaN(l) || l <= 0 || isNaN(h) || h <= 0) return "";
////    return ((l * h) / 1_000_000 * 10.764).toFixed(4);
////}
////
////const FLAT_TYPES = ["1BHK", "2BHK", "3BHK", "4BHK"];
////
////const emptyRow = () => ({
////    _id:        Date.now() + Math.random(),
////    srNo:       "",
////    location:   "",
////    windowCode: "",
////    typology:   "",
////    series:     "",
////    length:     "",
////    height:     "",
////    sqft:       "",
////});
////
////export default function InfoSheetFormPage() {
////    const navigate        = useNavigate();
////    const location        = useLocation();
////    const { workOrderId, id } = useParams();
////    const isEdit          = Boolean(id);
////
////    const workOrder = location.state?.workOrder || {};
////    const project   = location.state?.project   || {};
////
////    // ── Master data from work order items ─────────────────────────────────────
////    const [woItems, setWoItems] = useState([]);
////
////    // ── Form state ────────────────────────────────────────────────────────────
////    const [flatType,    setFlatType]    = useState("");
////    const [flatNo,      setFlatNo]      = useState("");
////    const [date,        setDate]        = useState(new Date().toISOString().split("T")[0]);
////    const [rows,        setRows]        = useState([emptyRow()]);
////
////    // ── UI state ──────────────────────────────────────────────────────────────
////    const [loading,  setLoading]  = useState(isEdit);
////    const [saving,   setSaving]   = useState(false);
////    const [saveMsg,  setSaveMsg]  = useState(null);
////
////    // ── Load WO items for dropdowns ───────────────────────────────────────────
////    useEffect(() => {
////        if (!workOrderId) return;
////        fetch(`${process.env.REACT_APP_API_URL}/api/work-orders/${workOrderId}`)
////            .then(r => r.json())
////            .then(data => setWoItems(data.items || []))
////            .catch(() => setWoItems([]));
////    }, [workOrderId]);
////
////    // ── Load existing sheet when editing ──────────────────────────────────────
////    useEffect(() => {
////        if (!isEdit) return;
////        (async () => {
////            try {
////                const res  = await fetch(`${process.env.REACT_APP_API_URL}/api/info-sheets/${id}`);
////                if (!res.ok) throw new Error("Not found");
////                const data = await res.json();
////                setFlatType(data.flatType || "");
////                setFlatNo(data.flatNo     || "");
////                setDate(data.date         || new Date().toISOString().split("T")[0]);
////                setRows((data.items || []).map(item => ({
////                    _id:        Date.now() + Math.random(),
////                    srNo:       item.srNo       || "",
////                    location:   item.location   || "",
////                    windowCode: item.windowCode || "",
////                    typology:   item.typology   || "",
////                    series:     item.series     || "",
////                    length:     item.length     ?? "",
////                    height:     item.height     ?? "",
////                    sqft:       item.sqft       ?? "",
////                })));
////            } catch {
////                setSaveMsg({ type: "error", text: "Failed to load info sheet." });
////            } finally {
////                setLoading(false);
////            }
////        })();
////    }, [id, isEdit]);
////
////    // ── Dropdown helpers ──────────────────────────────────────────────────────
////    // Distinct locations from WO items
////    const allLocations = [...new Set(woItems.map(i => i.location).filter(Boolean))].sort();
////
////    // WCodes for a given location
////    const wcodesForLocation = (loc) =>
////        [...new Set(
////            woItems.filter(i => i.location === loc).map(i => i.windowCode).filter(Boolean)
////        )].sort();
////
////    // Typologies for a given location + wcode
////    const typologiesForWcode = (loc, wcode) =>
////        [...new Set(
////            woItems
////                .filter(i => i.location === loc && i.windowCode === wcode)
////                .map(i => i.typology)
////                .filter(Boolean)
////        )].sort();
////
////    // Find exact WO item matching location + wcode + typology
////    const findWoItem = (loc, wcode, typology) =>
////        woItems.find(
////            i => i.location === loc &&
////                 i.windowCode === wcode &&
////                 (typology ? i.typology === typology : true)
////        );
////
////    // ── Row operations ────────────────────────────────────────────────────────
////    const addRow    = () => setRows(r => [...r, emptyRow()]);
////    const deleteRow = (_id) => setRows(r => r.filter(row => row._id !== _id));
////
////    const updateRow = (_id, field, value) => {
////        setRows(prev => prev.map(row => {
////            if (row._id !== _id) return row;
////            let u = { ...row, [field]: value };
////
////            // When location changes → reset downstream
////            if (field === "location") {
////                u.windowCode = "";
////                u.typology   = "";
////                u.series     = "";
////                u.length     = "";
////                u.height     = "";
////                u.sqft       = "";
////            }
////
////            // When wcode changes → reset downstream, try auto-fill
////            if (field === "windowCode") {
////                u.typology = "";
////                u.series   = "";
////                u.length   = "";
////                u.height   = "";
////                u.sqft     = "";
////
////                const typologies = typologiesForWcode(u.location, value);
////                if (typologies.length === 1) {
////                    // Only one typology — auto-fill everything
////                    const match = findWoItem(u.location, value, typologies[0]);
////                    if (match) {
////                        u.typology = match.typology   || "";
////                        u.series   = match.series     || "";
////                        u.length   = match.length     ?? "";
////                        u.height   = match.height     ?? "";
////                        u.sqft     = match.sqft
////                            ? String(match.sqft)
////                            : calcSqft(match.length, match.height);
////                    }
////                }
////                // If multiple typologies — leave blank for user to pick
////            }
////
////            // When typology changes → auto-fill rest
////            if (field === "typology") {
////                const match = findWoItem(u.location, u.windowCode, value);
////                if (match) {
////                    u.series = match.series   || "";
////                    u.length = match.length   ?? "";
////                    u.height = match.height   ?? "";
////                    u.sqft   = match.sqft
////                        ? String(match.sqft)
////                        : calcSqft(match.length, match.height);
////                }
////            }
////
////            return u;
////        }));
////    };
////
////    // ── Save ──────────────────────────────────────────────────────────────────
////    const handleSave = async () => {
////        setSaveMsg(null);
////        if (!flatType)       { setSaveMsg({ type: "error", text: "Select a Flat Type." });    return; }
////        if (!flatNo.trim())  { setSaveMsg({ type: "error", text: "Enter a Flat No." });       return; }
////        const validRows = rows.filter(r => r.location || r.windowCode);
////        if (!validRows.length) { setSaveMsg({ type: "error", text: "Add at least one row." }); return; }
////
////        setSaving(true);
////        const payload = {
////            workOrderId: parseInt(workOrderId),
////            projectName: workOrder.projectName || "",
////            towerName:   workOrder.towerName   || "",
////            flatType,
////            flatNo,
////            date,
////            items: validRows.map(({ _id, ...rest }) => rest),
////        };
////
////        try {
////            const url    = isEdit
////                ? `${process.env.REACT_APP_API_URL}/api/info-sheets/${id}`
////                : `${process.env.REACT_APP_API_URL}/api/info-sheets`;
////            const method = isEdit ? "PUT" : "POST";
////            const res    = await fetch(url, {
////                method,
////                headers: { "Content-Type": "application/json" },
////                body:    JSON.stringify(payload),
////            });
////            const data = await res.json();
////            if (!res.ok) throw new Error(data.message || "Server error");
////            setSaveMsg({ type: "success", text: isEdit ? "Info sheet updated!" : "Info sheet saved!" });
////            setTimeout(() => navigate(
////                `/coordinator-dashboard/tracker/${workOrderId}/sheets`,
////                { state: { workOrder, project } }
////            ), 1400);
////        } catch (err) {
////            setSaveMsg({ type: "error", text: err.message });
////        } finally {
////            setSaving(false);
////        }
////    };
////
////    // ── Totals ────────────────────────────────────────────────────────────────
////    const totalSqft = rows.reduce((s, r) => s + (parseFloat(r.sqft) || 0), 0);
////
////    if (loading) return (
////        <div style={css.loadingWrap}>
////            <FaSpinner style={spinStyle} /><span>Loading…</span>
////        </div>
////    );
////
////    // ─────────────────────────────────────────────────────────────────────────
////    return (
////        <div style={css.page}>
////            <style>{`
////                @keyframes spin { to { transform: rotate(360deg); } }
////                .is-row:hover { background: #f8fafc !important; }
////                .is-del:hover { color: #ef4444 !important; background: #fef2f2 !important; border-color: #fecaca !important; }
////                .is-add:hover { background: #0369a1 !important; transform: translateY(-1px); }
////                .is-save:hover:not(:disabled) { background: #047857 !important; transform: translateY(-1px); }
////                select.is-sel { appearance: none; cursor: pointer; }
////                select.is-sel:focus { border-color: #0284c7 !important; box-shadow: 0 0 0 3px rgba(2,132,199,0.1) !important; }
////                .ft-pill { transition: all 0.15s; }
////                .ft-pill:hover { transform: translateY(-1px); }
////            `}</style>
////
////            {/* Header */}
////            <div style={css.pageHeader}>
////                <div style={css.headerLeft}>
////                    <button
////                        style={css.backBtn}
////                        onClick={() => navigate(
////                            `/coordinator-dashboard/tracker/${workOrderId}/sheets`,
////                            { state: { workOrder, project } }
////                        )}
////                    >
////                        <FaRegArrowAltCircleLeft /> Back to Sheets
////                    </button>
////                    <div>
////                        <h1 style={css.pageTitle}>
////                            {isEdit ? "Edit Info Sheet" : "New Info Sheet"}
////                        </h1>
////                        <div style={css.metaLine}>
////                            <span style={css.woBadge}>{workOrder.workOrderNo || "—"}</span>
////                            {workOrder.towerName && (
////                                <span style={css.towerBadge}>{workOrder.towerName}</span>
////                            )}
////                            <span style={{ color: "#64748b", fontSize: 13 }}>
////                                {workOrder.projectName || project.projectName || ""}
////                            </span>
////                        </div>
////                    </div>
////                </div>
////
////                <button
////                    className="is-save"
////                    style={css.saveBtn}
////                    onClick={handleSave}
////                    disabled={saving}
////                >
////                    {saving ? <FaSpinner style={spinStyle} /> : <FaSave style={{ fontSize: 13 }} />}
////                    <span>{saving ? "Saving…" : isEdit ? "Update Sheet" : "Save Sheet"}</span>
////                </button>
////            </div>
////
////            {/* Toast */}
////            {saveMsg && (
////                <div style={{ ...css.toast, ...(saveMsg.type === "success" ? css.toastOk : css.toastErr) }}>
////                    {saveMsg.type === "success"
////                        ? <FaCheckCircle style={{ flexShrink: 0 }} />
////                        : <FaExclamationTriangle style={{ flexShrink: 0 }} />}
////                    <span>{saveMsg.text}</span>
////                </div>
////            )}
////
////            {/* Metadata card */}
////            <div style={css.card}>
////                <div style={css.cardHeader}>
////                    <FaLayerGroup style={{ color: "#0284c7" }} />
////                    <span style={css.cardLabel}>Sheet Details</span>
////                </div>
////
////                <div style={{ padding: "20px 24px 24px" }}>
////                    {/* Flat Type pills */}
////                    <div style={{ marginBottom: 20 }}>
////                        <label style={css.fieldLabel}>FLAT TYPE <span style={{ color: "#ef4444" }}>*</span></label>
////                        <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
////                            {FLAT_TYPES.map(ft => (
////                                <button
////                                    key={ft}
////                                    className="ft-pill"
////                                    style={{
////                                        ...css.ftPill,
////                                        ...(flatType === ft ? css.ftPillActive : {}),
////                                    }}
////                                    onClick={() => setFlatType(ft)}
////                                >
////                                    {ft}
////                                </button>
////                            ))}
////                        </div>
////                    </div>
////
////                    <div style={css.metaGrid}>
////                        {/* Flat No */}
////                        <div style={css.fieldWrap}>
////                            <label style={css.fieldLabel}>FLAT NO <span style={{ color: "#ef4444" }}>*</span></label>
////                            <div style={css.iconWrap}>
////                                <FaHome style={css.inputIcon} />
////                                <input
////                                    style={{ ...css.fieldInput, paddingLeft: 34 }}
////                                    value={flatNo}
////                                    onChange={e => setFlatNo(e.target.value)}
////                                    placeholder="e.g. 101, A-203"
////                                />
////                            </div>
////                        </div>
////
////                        {/* Project */}
////                        <div style={css.fieldWrap}>
////                            <label style={css.fieldLabel}>PROJECT</label>
////                            <div style={css.fieldStatic}>
////                                {workOrder.projectName || project.projectName || "—"}
////                            </div>
////                        </div>
////
////                        {/* Tower */}
////                        <div style={css.fieldWrap}>
////                            <label style={css.fieldLabel}>TOWER</label>
////                            <div style={css.fieldStatic}>
////                                {workOrder.towerName || "—"}
////                            </div>
////                        </div>
////
////                        {/* Date */}
////                        <div style={css.fieldWrap}>
////                            <label style={css.fieldLabel}>DATE</label>
////                            <div style={css.iconWrap}>
////                                <FaCalendarAlt style={css.inputIcon} />
////                                <input
////                                    style={{ ...css.fieldInput, paddingLeft: 34 }}
////                                    type="date"
////                                    value={date}
////                                    onChange={e => setDate(e.target.value)}
////                                />
////                            </div>
////                        </div>
////                    </div>
////                </div>
////            </div>
////
////            {/* Items table */}
////            <div style={css.card}>
////                <div style={css.tableToolbar}>
////                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
////                        <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
////                            Window Items
////                        </span>
////                        <span style={css.rowCount}>{rows.length} rows</span>
////                    </div>
////                    <button className="is-add" style={css.addBtn} onClick={addRow}>
////                        <FaPlus style={{ fontSize: 11 }} />&nbsp;Add Row
////                    </button>
////                </div>
////
////                <div style={{ overflowX: "auto" }}>
////                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
////                        <thead>
////                            <tr>
////                                {[
////                                    { label: "Sr No",     w: 60  },
////                                    { label: "Location",  w: 160, note: "select" },
////                                    { label: "WCode",     w: 120, note: "select" },
////                                    { label: "Typology",  w: 200, note: "select/auto" },
////                                    { label: "Series",    w: 100, note: "auto" },
////                                    { label: "Length (mm)", w: 100, note: "auto" },
////                                    { label: "Height (mm)", w: 100, note: "auto" },
////                                    { label: "Sqft",      w: 110, note: "auto" },
////                                ].map(col => (
////                                    <th key={col.label} style={{ ...css.th, minWidth: col.w }}>
////                                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
////                                            <span>{col.label}</span>
////                                            {col.note && (
////                                                <span style={css.colNote}>
////                                                    {col.note === "auto" ? "Auto-filled" : col.note}
////                                                </span>
////                                            )}
////                                        </div>
////                                    </th>
////                                ))}
////                                <th style={{ ...css.th, minWidth: 48, textAlign: "center" }}>Del</th>
////                            </tr>
////                        </thead>
////
////                        <tbody>
////                            {rows.map((row, idx) => {
////                                const wcodes    = wcodesForLocation(row.location);
////                                const typologies = typologiesForWcode(row.location, row.windowCode);
////                                const hasMultiTypology = typologies.length > 1;
////                                const isAutoFilled = Boolean(row.series || row.length);
////
////                                return (
////                                    <tr key={row._id} className="is-row" style={{ borderBottom: "1px solid #e2e8f0" }}>
////                                        {/* Sr No */}
////                                        <td style={css.td}>
////                                            <input
////                                                style={css.cell}
////                                                value={row.srNo}
////                                                placeholder={String(idx + 1)}
////                                                onChange={e => updateRow(row._id, "srNo", e.target.value)}
////                                            />
////                                        </td>
////
////                                        {/* Location dropdown */}
////                                        <td style={css.td}>
////                                            <select
////                                                className="is-sel"
////                                                style={css.selectCell}
////                                                value={row.location}
////                                                onChange={e => updateRow(row._id, "location", e.target.value)}
////                                            >
////                                                <option value="">— Select —</option>
////                                                {allLocations.map(loc => (
////                                                    <option key={loc} value={loc}>{loc}</option>
////                                                ))}
////                                            </select>
////                                        </td>
////
////                                        {/* WCode dropdown — filtered by location */}
////                                        <td style={css.td}>
////                                            <select
////                                                className="is-sel"
////                                                style={{
////                                                    ...css.selectCell,
////                                                    ...(row.location ? {} : css.selectDisabled),
////                                                }}
////                                                value={row.windowCode}
////                                                disabled={!row.location}
////                                                onChange={e => updateRow(row._id, "windowCode", e.target.value)}
////                                            >
////                                                <option value="">— Select —</option>
////                                                {wcodes.map(wc => (
////                                                    <option key={wc} value={wc}>{wc}</option>
////                                                ))}
////                                            </select>
////                                        </td>
////
////                                        {/* Typology — dropdown if multiple, auto-filled if single */}
////                                        <td style={css.td}>
////                                            {hasMultiTypology ? (
////                                                <select
////                                                    className="is-sel"
////                                                    style={css.selectCell}
////                                                    value={row.typology}
////                                                    onChange={e => updateRow(row._id, "typology", e.target.value)}
////                                                >
////                                                    <option value="">— Select —</option>
////                                                    {typologies.map(t => (
////                                                        <option key={t} value={t}>{t}</option>
////                                                    ))}
////                                                </select>
////                                            ) : (
////                                                <input
////                                                    style={{ ...css.cell, ...css.cellAuto }}
////                                                    value={row.typology}
////                                                    readOnly
////                                                    placeholder="auto"
////                                                />
////                                            )}
////                                        </td>
////
////                                        {/* Series — auto */}
////                                        <td style={css.td}>
////                                            <input
////                                                style={{ ...css.cell, ...css.cellAuto }}
////                                                value={row.series}
////                                                readOnly
////                                                placeholder="auto"
////                                            />
////                                        </td>
////
////                                        {/* Length — auto */}
////                                        <td style={css.td}>
////                                            <input
////                                                style={{ ...css.cell, ...css.cellAuto, textAlign: "right" }}
////                                                value={row.length}
////                                                readOnly
////                                                placeholder="auto"
////                                            />
////                                        </td>
////
////                                        {/* Height — auto */}
////                                        <td style={css.td}>
////                                            <input
////                                                style={{ ...css.cell, ...css.cellAuto, textAlign: "right" }}
////                                                value={row.height}
////                                                readOnly
////                                                placeholder="auto"
////                                            />
////                                        </td>
////
////                                        {/* Sqft — auto */}
////                                        <td style={css.td}>
////                                            <input
////                                                style={{ ...css.cell, ...css.cellSqft, textAlign: "right" }}
////                                                value={row.sqft ? parseFloat(row.sqft).toFixed(2) : ""}
////                                                readOnly
////                                                placeholder="auto"
////                                            />
////                                        </td>
////
////                                        {/* Delete */}
////                                        <td style={{ ...css.td, textAlign: "center" }}>
////                                            <button
////                                                className="is-del"
////                                                style={css.delBtn}
////                                                onClick={() => deleteRow(row._id)}
////                                            >
////                                                <FaTrash style={{ fontSize: 11 }} />
////                                            </button>
////                                        </td>
////                                    </tr>
////                                );
////                            })}
////                        </tbody>
////
////                        <tfoot>
////                            <tr style={{ background: "#f8fafc", borderTop: "2px solid #cbd5e1" }}>
////                                <td colSpan={7} style={{ padding: "14px 16px", fontWeight: 700, fontSize: 13, color: "#1e293b" }}>
////                                    Total Sqft
////                                </td>
////                                <td style={{ padding: "14px 10px", fontSize: 15, fontWeight: 800, color: "#0284c7", textAlign: "right" }}>
////                                    {totalSqft.toFixed(4)}
////                                </td>
////                                <td />
////                            </tr>
////                        </tfoot>
////                    </table>
////                </div>
////
////                {/* Summary strip */}
////                <div style={css.summaryStrip}>
////                    {[
////                        { label: "Flat Type",   val: flatType || "—",          color: "#0284c7" },
////                        { label: "Flat No",     val: flatNo   || "—",          color: "#1e293b" },
////                        { label: "Total Rows",  val: rows.length,              color: "#475569" },
////                        { label: "Total Sqft",  val: totalSqft.toFixed(2),     color: "#0284c7" },
////                    ].map(s => (
////                        <div key={s.label} style={css.summaryItem}>
////                            <span style={css.summaryLabel}>{s.label}</span>
////                            <span style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.val}</span>
////                        </div>
////                    ))}
////                </div>
////            </div>
////
////            {/* Bottom save */}
////            <div style={{ display: "flex", justifyContent: "flex-end", paddingBottom: 40 }}>
////                <button
////                    className="is-save"
////                    style={css.saveBtn}
////                    onClick={handleSave}
////                    disabled={saving}
////                >
////                    {saving ? <FaSpinner style={spinStyle} /> : <FaSave style={{ fontSize: 13 }} />}
////                    <span>{saving ? "Saving…" : isEdit ? "Update Sheet" : "Save Sheet"}</span>
////                </button>
////            </div>
////        </div>
////    );
////}
////
////const spinStyle = { animation: "spin 0.9s linear infinite", display: "inline-block" };
////
////const css = {
////    page:          { maxWidth: 1440, margin: "0 auto", padding: "0 4px 56px", fontFamily: "'Inter',-apple-system,sans-serif" },
////    loadingWrap:   { display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "120px 0", color: "#64748b", fontSize: 15 },
////    pageHeader:    { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, padding: "32px 0 24px", flexWrap: "wrap" },
////    headerLeft:    { display: "flex", flexDirection: "column", gap: 8 },
////    backBtn:       { background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 13, color: "#64748b", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 },
////    pageTitle:     { margin: 0, fontSize: 24, fontWeight: 800, color: "#0f172a" },
////    metaLine:      { display: "flex", alignItems: "center", gap: 10, marginTop: 6 },
////    woBadge:       { background: "#e0f2fe", color: "#0284c7", fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 12 },
////    towerBadge:    { background: "#fef3c7", color: "#92400e", fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 12, border: "1px solid #fde68a" },
////    saveBtn:       { display: "flex", alignItems: "center", gap: 8, padding: "11px 22px", background: "#10b981", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13, transition: "all 0.2s" },
////    toast:         { display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderRadius: 8, fontSize: 14, fontWeight: 500, marginBottom: 24, border: "1px solid" },
////    toastOk:       { background: "#ecfdf5", color: "#047857", borderColor: "#a7f3d0" },
////    toastErr:      { background: "#fef2f2", color: "#b91c1c", borderColor: "#fecaca" },
////    card:          { background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)", marginBottom: 24, overflow: "hidden" },
////    cardHeader:    { display: "flex", alignItems: "center", gap: 10, padding: "20px 24px 0" },
////    cardLabel:     { fontSize: 12, fontWeight: 700, color: "#475569", letterSpacing: "0.05em", textTransform: "uppercase" },
////    metaGrid:      { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 20 },
////    fieldWrap:     { display: "flex", flexDirection: "column", gap: 6 },
////    fieldLabel:    { fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.05em" },
////    iconWrap:      { position: "relative", display: "flex", alignItems: "center" },
////    inputIcon:     { position: "absolute", left: 12, color: "#94a3b8", fontSize: 12, pointerEvents: "none" },
////    fieldInput:    { width: "100%", padding: "9px 14px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13, color: "#0f172a", background: "#fff", outline: "none", boxSizing: "border-box" },
////    fieldStatic:   { padding: "9px 14px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, color: "#1e293b", background: "#f8fafc", fontWeight: 600 },
////    ftPill:        { padding: "8px 20px", borderRadius: 20, border: "2px solid #e2e8f0", background: "#f8fafc", color: "#475569", fontSize: 13, fontWeight: 600, cursor: "pointer" },
////    ftPillActive:  { background: "#0284c7", color: "#fff", borderColor: "#0284c7" },
////    tableToolbar:  { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid #e2e8f0" },
////    rowCount:      { fontSize: 12, color: "#64748b", fontWeight: 500, background: "#f1f5f9", padding: "2px 10px", borderRadius: 20 },
////    addBtn:        { display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", background: "#0284c7", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 12, transition: "all 0.2s" },
////    th:            { padding: "12px 10px", background: "#1e293b", color: "#f8fafc", fontWeight: 600, textAlign: "left", fontSize: 11, whiteSpace: "nowrap", borderRight: "1px solid #334155", verticalAlign: "middle" },
////    colNote:       { fontSize: 8, fontWeight: 700, color: "#a5b4fc", textTransform: "uppercase", letterSpacing: "0.05em" },
////    td:            { padding: "6px 8px", verticalAlign: "middle" },
////    cell:          { width: "100%", padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 12, color: "#0f172a", background: "#fff", outline: "none" },
////    cellAuto:      { background: "#f1f5f9", color: "#475569", cursor: "not-allowed", fontWeight: 500, borderColor: "#e2e8f0" },
////    cellSqft:      { background: "#eff6ff", color: "#0284c7", cursor: "not-allowed", fontWeight: 700, borderColor: "#bfdbfe" },
////    selectCell:    { width: "100%", padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 12, color: "#0f172a", background: "#fff", outline: "none" },
////    selectDisabled:{ background: "#f8fafc", color: "#94a3b8", cursor: "not-allowed" },
////    delBtn:        { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 6, background: "#fff", border: "1px solid #e2e8f0", cursor: "pointer", color: "#94a3b8", transition: "all 0.15s" },
////    summaryStrip:  { display: "flex", borderTop: "1px solid #e2e8f0", flexWrap: "wrap" },
////    summaryItem:   { flex: "1 1 160px", display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 12px", borderRight: "1px solid #e2e8f0" },
////    summaryLabel:  { fontSize: 10, color: "#64748b", fontWeight: 600, letterSpacing: "0.05em", marginBottom: 6, textTransform: "uppercase" },
////};
//
//
//import React, { useState, useEffect } from "react";
//import { useNavigate, useParams, useLocation } from "react-router-dom";
//import {
//    FaRegArrowAltCircleLeft, FaPlus, FaTrash,
//    FaSave, FaCheckCircle, FaExclamationTriangle,
//    FaSpinner, FaCalendarAlt, FaLayerGroup, FaHome,
//    FaChevronDown, FaChevronUp
//} from "react-icons/fa";
//
//function calcSqft(length, height) {
//    const l = parseFloat(length);
//    const h = parseFloat(height);
//    if (isNaN(l) || l <= 0 || isNaN(h) || h <= 0) return "";
//    return ((l * h) / 1_000_000 * 10.764).toFixed(4);
//}
//
//const FLAT_TYPES = ["1BHK", "2BHK", "3BHK", "4BHK"];
//
//const emptyRow = () => ({
//    _id:        Date.now() + Math.random(),
//    srNo:       "",
//    location:   "",
//    windowCode: "",
//    typology:   "",
//    series:     "",
//    length:     "",
//    height:     "",
//    sqft:       "",
//});
//
//const emptyFlat = () => ({
//    _fid:      Date.now() + Math.random(),
//    flatType:  "",
//    flatNo:    "",
//    collapsed: false,
//    rows:      [emptyRow()],
//});
//
//const ftColors = {
//    "1BHK": { bg: "#e0f2fe", color: "#0284c7", border: "#bae6fd", active: "#0284c7" },
//    "2BHK": { bg: "#dcfce7", color: "#16a34a", border: "#bbf7d0", active: "#16a34a" },
//    "3BHK": { bg: "#fef3c7", color: "#d97706", border: "#fde68a", active: "#d97706" },
//    "4BHK": { bg: "#fae8ff", color: "#9333ea", border: "#f5d0fe", active: "#9333ea" },
//};
//
//export default function InfoSheetFormPage() {
//    const navigate            = useNavigate();
//    const location            = useLocation();
//    const { workOrderId, id } = useParams();
//    const isEdit              = Boolean(id);
//
//    const workOrder = location.state?.workOrder || {};
//    const project   = location.state?.project   || {};
//
//    const [woItems, setWoItems] = useState([]);
//    const [date,    setDate]    = useState(new Date().toISOString().split("T")[0]);
//    const [flats,   setFlats]   = useState([emptyFlat()]);
//    const [loading, setLoading] = useState(isEdit);
//    const [saving,  setSaving]  = useState(false);
//    const [saveMsg, setSaveMsg] = useState(null);
//
//    // Load WO items for dropdowns
//    useEffect(() => {
//        if (!workOrderId) return;
//        fetch(`${process.env.REACT_APP_API_URL}/api/work-orders/${workOrderId}`)
//            .then(r => r.json())
//            .then(data => setWoItems(data.items || []))
//            .catch(() => setWoItems([]));
//    }, [workOrderId]);
//
//    // Load existing sheet on edit
//    useEffect(() => {
//        if (!isEdit) return;
//        (async () => {
//            try {
//                const res  = await fetch(`${process.env.REACT_APP_API_URL}/api/info-sheets/${id}`);
//                if (!res.ok) throw new Error("Not found");
//                const data = await res.json();
//                setDate(data.date || new Date().toISOString().split("T")[0]);
//                setFlats((data.flats || []).map(f => ({
//                    _fid:      f.id,
//                    dbId:      f.id,
//                    flatType:  f.flatType  || "",
//                    flatNo:    f.flatNo    || "",
//                    collapsed: false,
//                    rows: (f.items || []).map(item => ({
//                        _id:        Date.now() + Math.random(),
//                        srNo:       item.srNo       || "",
//                        location:   item.location   || "",
//                        windowCode: item.windowCode || "",
//                        typology:   item.typology   || "",
//                        series:     item.series     || "",
//                        length:     item.length     ?? "",
//                        height:     item.height     ?? "",
//                        sqft:       item.sqft       ?? "",
//                    })),
//                })));
//            } catch {
//                setSaveMsg({ type: "error", text: "Failed to load info sheet." });
//            } finally {
//                setLoading(false);
//            }
//        })();
//    }, [id, isEdit]);
//
//    // ── Dropdown helpers ──────────────────────────────────────────────────────
//    const allLocations = [...new Set(woItems.map(i => i.location).filter(Boolean))].sort();
//
//    const wcodesFor = (loc) =>
//        [...new Set(woItems.filter(i => i.location === loc).map(i => i.windowCode).filter(Boolean))].sort();
//
//    const typologiesFor = (loc, wc) =>
//        [...new Set(woItems.filter(i => i.location === loc && i.windowCode === wc).map(i => i.typology).filter(Boolean))].sort();
//
//    const findWoItem = (loc, wc, typ) =>
//        woItems.find(i => i.location === loc && i.windowCode === wc && (!typ || i.typology === typ));
//
//    // ── Flat operations ───────────────────────────────────────────────────────
//    const addFlat    = () => setFlats(f => [...f, emptyFlat()]);
//    const removeFlat = (_fid) => setFlats(f => f.filter(fl => fl._fid !== _fid));
//    const toggleCollapse = (_fid) =>
//        setFlats(f => f.map(fl => fl._fid === _fid ? { ...fl, collapsed: !fl.collapsed } : fl));
//
//    const updateFlat = (_fid, field, value) =>
//        setFlats(f => f.map(fl => fl._fid === _fid ? { ...fl, [field]: value } : fl));
//
//    // ── Row operations ────────────────────────────────────────────────────────
//    const addRow = (_fid) =>
//        setFlats(f => f.map(fl =>
//            fl._fid === _fid ? { ...fl, rows: [...fl.rows, emptyRow()] } : fl
//        ));
//
//    const deleteRow = (_fid, _id) =>
//        setFlats(f => f.map(fl =>
//            fl._fid === _fid
//                ? { ...fl, rows: fl.rows.filter(r => r._id !== _id) }
//                : fl
//        ));
//
//    const updateRow = (_fid, _id, field, value) => {
//        setFlats(prev => prev.map(fl => {
//            if (fl._fid !== _fid) return fl;
//            const rows = fl.rows.map(row => {
//                if (row._id !== _id) return row;
//                let u = { ...row, [field]: value };
//
//                if (field === "location") {
//                    u.windowCode = ""; u.typology = "";
//                    u.series = ""; u.length = ""; u.height = ""; u.sqft = "";
//                }
//                if (field === "windowCode") {
//                    u.typology = ""; u.series = ""; u.length = ""; u.height = ""; u.sqft = "";
//                    const typs = typologiesFor(u.location, value);
//                    if (typs.length === 1) {
//                        const m = findWoItem(u.location, value, typs[0]);
//                        if (m) {
//                            u.typology = m.typology || "";
//                            u.series   = m.series   || "";
//                            u.length   = m.length   ?? "";
//                            u.height   = m.height   ?? "";
//                            u.sqft     = m.sqft ? String(m.sqft) : calcSqft(m.length, m.height);
//                        }
//                    }
//                }
//                if (field === "typology") {
//                    const m = findWoItem(u.location, u.windowCode, value);
//                    if (m) {
//                        u.series = m.series || "";
//                        u.length = m.length ?? "";
//                        u.height = m.height ?? "";
//                        u.sqft   = m.sqft ? String(m.sqft) : calcSqft(m.length, m.height);
//                    }
//                }
//                return u;
//            });
//            return { ...fl, rows };
//        }));
//    };
//
//    // ── Save ──────────────────────────────────────────────────────────────────
//    const handleSave = async () => {
//        setSaveMsg(null);
//        for (const fl of flats) {
//            if (!fl.flatType) { setSaveMsg({ type: "error", text: `Select Flat Type for flat ${fl.flatNo || "(unnamed)"}` }); return; }
//            if (!fl.flatNo.trim()) { setSaveMsg({ type: "error", text: "Enter Flat No for all flats." }); return; }
//        }
//        const validFlats = flats.filter(fl => fl.flatType && fl.flatNo.trim());
//        if (!validFlats.length) { setSaveMsg({ type: "error", text: "Add at least one flat." }); return; }
//
//        setSaving(true);
//        const payload = {
//            workOrderId: parseInt(workOrderId),
//            projectName: workOrder.projectName || "",
//            towerName:   workOrder.towerName   || "",
//            date,
//            flats: validFlats.map(fl => ({
//                id:       fl.dbId || null,
//                flatType: fl.flatType,
//                flatNo:   fl.flatNo,
//                items:    fl.rows
//                    .filter(r => r.location || r.windowCode)
//                    .map(({ _id, ...rest }) => rest),
//            })),
//        };
//
//        try {
//            const url    = isEdit
//                ? `${process.env.REACT_APP_API_URL}/api/info-sheets/${id}`
//                : `${process.env.REACT_APP_API_URL}/api/info-sheets`;
//            const method = isEdit ? "PUT" : "POST";
//            const res    = await fetch(url, {
//                method,
//                headers: { "Content-Type": "application/json" },
//                body:    JSON.stringify(payload),
//            });
//            const data = await res.json();
//            if (!res.ok) throw new Error(data.message || "Server error");
//            setSaveMsg({ type: "success", text: isEdit ? "Info sheet updated!" : "Info sheet saved!" });
//            setTimeout(() => navigate(
//                `/coordinator-dashboard/tracker/${workOrderId}/sheets`,
//                { state: { workOrder, project } }
//            ), 1400);
//        } catch (err) {
//            setSaveMsg({ type: "error", text: err.message });
//        } finally {
//            setSaving(false);
//        }
//    };
//
//    const grandTotalSqft = flats.reduce((sum, fl) =>
//        sum + fl.rows.reduce((s, r) => s + (parseFloat(r.sqft) || 0), 0), 0
//    );
//
//    if (loading) return (
//        <div style={css.loadingWrap}>
//            <FaSpinner style={spinStyle} /><span>Loading…</span>
//        </div>
//    );
//
//    return (
//        <div style={css.page}>
//            <style>{`
//                @keyframes spin { to { transform: rotate(360deg); } }
//                .is-row:hover { background: #f8fafc !important; }
//                .is-del:hover { color: #ef4444 !important; background: #fef2f2 !important; border-color: #fecaca !important; }
//                .is-save:hover:not(:disabled) { background: #047857 !important; transform: translateY(-1px); }
//                .ft-pill { transition: all 0.15s; border: 2px solid #e2e8f0; background: #f8fafc; color: #475569; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; cursor: pointer; }
//                .ft-pill:hover { transform: translateY(-1px); }
//                select.is-sel { appearance: none; cursor: pointer; }
//                select.is-sel:focus { border-color: #0284c7 !important; outline: none; }
//                .flat-card { border-radius: 12px; border: 1.5px solid #e2e8f0; background: #fff; margin-bottom: 20px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.04); }
//                .flat-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; cursor: pointer; transition: background 0.15s; }
//                .flat-header:hover { background: #f8fafc; }
//            `}</style>
//
//            {/* Page header */}
//            <div style={css.pageHeader}>
//                <div style={css.headerLeft}>
//                    <button style={css.backBtn} onClick={() => navigate(
//                        `/coordinator-dashboard/tracker/${workOrderId}/sheets`,
//                        { state: { workOrder, project } }
//                    )}>
//                        <FaRegArrowAltCircleLeft /> Back to Sheets
//                    </button>
//                    <div>
//                        <h1 style={css.pageTitle}>{isEdit ? "Edit Info Sheet" : "New Info Sheet"}</h1>
//                        <div style={css.metaLine}>
//                            <span style={css.woBadge}>{workOrder.workOrderNo || "—"}</span>
//                            {workOrder.towerName && <span style={css.towerBadge}>{workOrder.towerName}</span>}
//                            <span style={{ color: "#64748b", fontSize: 13 }}>
//                                {workOrder.projectName || project.projectName || ""}
//                            </span>
//                        </div>
//                    </div>
//                </div>
//
//                <button className="is-save" style={css.saveBtn} onClick={handleSave} disabled={saving}>
//                    {saving ? <FaSpinner style={spinStyle} /> : <FaSave style={{ fontSize: 13 }} />}
//                    <span>{saving ? "Saving…" : isEdit ? "Update Sheet" : "Save Sheet"}</span>
//                </button>
//            </div>
//
//            {saveMsg && (
//                <div style={{ ...css.toast, ...(saveMsg.type === "success" ? css.toastOk : css.toastErr) }}>
//                    {saveMsg.type === "success" ? <FaCheckCircle style={{ flexShrink: 0 }} /> : <FaExclamationTriangle style={{ flexShrink: 0 }} />}
//                    <span>{saveMsg.text}</span>
//                </div>
//            )}
//
//            {/* Sheet meta */}
//            <div style={css.card}>
//                <div style={css.cardHeader}>
//                    <FaLayerGroup style={{ color: "#0284c7" }} />
//                    <span style={css.cardLabel}>Sheet Info</span>
//                </div>
//                <div style={{ padding: "16px 24px 20px", display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-end" }}>
//                    <div style={css.fieldWrap}>
//                        <label style={css.fieldLabel}>WORK ORDER</label>
//                        <div style={css.fieldStatic}>{workOrder.workOrderNo || "—"}</div>
//                    </div>
//                    <div style={css.fieldWrap}>
//                        <label style={css.fieldLabel}>PROJECT</label>
//                        <div style={css.fieldStatic}>{workOrder.projectName || project.projectName || "—"}</div>
//                    </div>
//                    <div style={css.fieldWrap}>
//                        <label style={css.fieldLabel}>TOWER</label>
//                        <div style={css.fieldStatic}>{workOrder.towerName || "—"}</div>
//                    </div>
//                    <div style={css.fieldWrap}>
//                        <label style={css.fieldLabel}>DATE</label>
//                        <div style={css.iconWrap}>
//                            <FaCalendarAlt style={css.inputIcon} />
//                            <input
//                                style={{ ...css.fieldInput, paddingLeft: 32 }}
//                                type="date"
//                                value={date}
//                                onChange={e => setDate(e.target.value)}
//                            />
//                        </div>
//                    </div>
//                    <div style={{ marginLeft: "auto" }}>
//                        <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.05em", marginBottom: 4 }}>GRAND TOTAL SQFT</div>
//                        <div style={{ fontSize: 26, fontWeight: 800, color: "#0284c7" }}>{grandTotalSqft.toFixed(2)}</div>
//                    </div>
//                </div>
//            </div>
//
//            {/* Flat cards */}
//            {flats.map((fl, flatIdx) => {
//                const ftC       = ftColors[fl.flatType] || { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" };
//                const flatSqft  = fl.rows.reduce((s, r) => s + (parseFloat(r.sqft) || 0), 0);
//                const wcodes    = wcodesFor.bind(null);
//                return (
//                    <div key={fl._fid} className="flat-card">
//                        {/* Flat header */}
//                        <div
//                            className="flat-header"
//                            style={{ borderBottom: fl.collapsed ? "none" : "1px solid #f1f5f9" }}
//                            onClick={() => toggleCollapse(fl._fid)}
//                        >
//                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
//                                <span style={{
//                                    background: ftC.bg, color: ftC.color,
//                                    border: `1px solid ${ftC.border}`,
//                                    fontSize: 12, fontWeight: 700,
//                                    padding: "3px 12px", borderRadius: 20
//                                }}>
//                                    {fl.flatType || "No Type"}
//                                </span>
//                                <span style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>
//                                    {fl.flatNo ? `Flat ${fl.flatNo}` : `Flat #${flatIdx + 1}`}
//                                </span>
//                                <span style={{ fontSize: 12, color: "#94a3b8" }}>
//                                    {fl.rows.length} rows &nbsp;•&nbsp;
//                                    <span style={{ color: "#0284c7", fontWeight: 600 }}>{flatSqft.toFixed(2)} sqft</span>
//                                </span>
//                            </div>
//                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//                                <button
//                                    style={css.removeFlatBtn}
//                                    onClick={e => { e.stopPropagation(); removeFlat(fl._fid); }}
//                                    title="Remove this flat"
//                                >
//                                    <FaTrash style={{ fontSize: 11 }} />
//                                </button>
//                                {fl.collapsed
//                                    ? <FaChevronDown style={{ color: "#64748b" }} />
//                                    : <FaChevronUp   style={{ color: "#64748b" }} />}
//                            </div>
//                        </div>
//
//                        {!fl.collapsed && (
//                            <div style={{ padding: "16px 20px 20px" }}>
//                                {/* Flat type + No */}
//                                <div style={{ display: "flex", gap: 20, marginBottom: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
//                                    <div style={css.fieldWrap}>
//                                        <label style={css.fieldLabel}>FLAT TYPE <span style={{ color: "#ef4444" }}>*</span></label>
//                                        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
//                                            {FLAT_TYPES.map(ft => {
//                                                const c = ftColors[ft];
//                                                return (
//                                                    <button
//                                                        key={ft}
//                                                        className="ft-pill"
//                                                        style={fl.flatType === ft ? {
//                                                            border: `2px solid ${c.active}`,
//                                                            background: c.bg,
//                                                            color: c.color,
//                                                            padding: "6px 16px", borderRadius: 20,
//                                                            fontSize: 12, fontWeight: 700, cursor: "pointer"
//                                                        } : undefined}
//                                                        onClick={() => updateFlat(fl._fid, "flatType", ft)}
//                                                    >
//                                                        {ft}
//                                                    </button>
//                                                );
//                                            })}
//                                        </div>
//                                    </div>
//                                    <div style={css.fieldWrap}>
//                                        <label style={css.fieldLabel}>FLAT NO <span style={{ color: "#ef4444" }}>*</span></label>
//                                        <div style={css.iconWrap}>
//                                            <FaHome style={css.inputIcon} />
//                                            <input
//                                                style={{ ...css.fieldInput, paddingLeft: 32, width: 160 }}
//                                                value={fl.flatNo}
//                                                onChange={e => updateFlat(fl._fid, "flatNo", e.target.value)}
//                                                placeholder="e.g. 101, A-202"
//                                            />
//                                        </div>
//                                    </div>
//                                </div>
//
//                                {/* Rows table */}
//                                <div style={{ overflowX: "auto", borderRadius: 8, border: "1px solid #e2e8f0" }}>
//                                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
//                                        <thead>
//                                            <tr>
//                                                {[
//                                                    { label: "Sr No",       w: 55  },
//                                                    { label: "Location",    w: 150, note: "select" },
//                                                    { label: "WCode",       w: 110, note: "select" },
//                                                    { label: "Typology",    w: 190, note: "select / auto" },
//                                                    { label: "Series",      w: 90,  note: "auto" },
//                                                    { label: "Length (mm)", w: 95,  note: "auto" },
//                                                    { label: "Height (mm)", w: 95,  note: "auto" },
//                                                    { label: "Sqft",        w: 100, note: "auto" },
//                                                ].map(col => (
//                                                    <th key={col.label} style={{ ...css.th, minWidth: col.w }}>
//                                                        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
//                                                            <span>{col.label}</span>
//                                                            {col.note && <span style={css.colNote}>{col.note}</span>}
//                                                        </div>
//                                                    </th>
//                                                ))}
//                                                <th style={{ ...css.th, minWidth: 44, textAlign: "center" }}>Del</th>
//                                            </tr>
//                                        </thead>
//                                        <tbody>
//                                            {fl.rows.map((row, rowIdx) => {
//                                                const wcs  = wcodesFor(row.location);
//                                                const typs = typologiesFor(row.location, row.windowCode);
//                                                return (
//                                                    <tr key={row._id} className="is-row" style={{ borderBottom: "1px solid #f1f5f9" }}>
//                                                        <td style={css.td}>
//                                                            <input style={css.cell} value={row.srNo}
//                                                                placeholder={String(rowIdx + 1)}
//                                                                onChange={e => updateRow(fl._fid, row._id, "srNo", e.target.value)} />
//                                                        </td>
//                                                        <td style={css.td}>
//                                                            <select className="is-sel" style={css.selectCell}
//                                                                value={row.location}
//                                                                onChange={e => updateRow(fl._fid, row._id, "location", e.target.value)}>
//                                                                <option value="">— Select —</option>
//                                                                {allLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
//                                                            </select>
//                                                        </td>
//                                                        <td style={css.td}>
//                                                            <select className="is-sel"
//                                                                style={{ ...css.selectCell, ...(row.location ? {} : css.selectDisabled) }}
//                                                                value={row.windowCode}
//                                                                disabled={!row.location}
//                                                                onChange={e => updateRow(fl._fid, row._id, "windowCode", e.target.value)}>
//                                                                <option value="">— Select —</option>
//                                                                {wcs.map(wc => <option key={wc} value={wc}>{wc}</option>)}
//                                                            </select>
//                                                        </td>
//                                                        <td style={css.td}>
//                                                            {typs.length > 1 ? (
//                                                                <select className="is-sel" style={css.selectCell}
//                                                                    value={row.typology}
//                                                                    onChange={e => updateRow(fl._fid, row._id, "typology", e.target.value)}>
//                                                                    <option value="">— Select —</option>
//                                                                    {typs.map(t => <option key={t} value={t}>{t}</option>)}
//                                                                </select>
//                                                            ) : (
//                                                                <input style={{ ...css.cell, ...css.cellAuto }} value={row.typology} readOnly placeholder="auto" />
//                                                            )}
//                                                        </td>
//                                                        <td style={css.td}><input style={{ ...css.cell, ...css.cellAuto }} value={row.series} readOnly placeholder="auto" /></td>
//                                                        <td style={css.td}><input style={{ ...css.cell, ...css.cellAuto, textAlign: "right" }} value={row.length} readOnly placeholder="auto" /></td>
//                                                        <td style={css.td}><input style={{ ...css.cell, ...css.cellAuto, textAlign: "right" }} value={row.height} readOnly placeholder="auto" /></td>
//                                                        <td style={css.td}><input style={{ ...css.cell, ...css.cellSqft, textAlign: "right" }} value={row.sqft ? parseFloat(row.sqft).toFixed(2) : ""} readOnly placeholder="auto" /></td>
//                                                        <td style={{ ...css.td, textAlign: "center" }}>
//                                                            <button className="is-del" style={css.delBtn}
//                                                                onClick={() => deleteRow(fl._fid, row._id)}>
//                                                                <FaTrash style={{ fontSize: 10 }} />
//                                                            </button>
//                                                        </td>
//                                                    </tr>
//                                                );
//                                            })}
//                                        </tbody>
//                                        <tfoot>
//                                            <tr style={{ background: "#f8fafc", borderTop: "2px solid #e2e8f0" }}>
//                                                <td colSpan={7} style={{ padding: "10px 14px", fontWeight: 700, fontSize: 12, color: "#1e293b" }}>
//                                                    Flat Sqft Total
//                                                </td>
//                                                <td style={{ padding: "10px 10px", fontSize: 13, fontWeight: 800, color: "#0284c7", textAlign: "right" }}>
//                                                    {flatSqft.toFixed(4)}
//                                                </td>
//                                                <td />
//                                            </tr>
//                                        </tfoot>
//                                    </table>
//                                </div>
//
//                                <button
//                                    style={css.addRowBtn}
//                                    onClick={() => addRow(fl._fid)}
//                                >
//                                    <FaPlus style={{ fontSize: 10 }} />&nbsp;Add Row
//                                </button>
//                            </div>
//                        )}
//                    </div>
//                );
//            })}
//
//            {/* Add Flat button */}
//            <button style={css.addFlatBtn} onClick={addFlat}>
//                <FaPlus style={{ fontSize: 13 }} />&nbsp;Add Another Flat
//            </button>
//
//            {/* Bottom save */}
//            <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 16, paddingBottom: 40 }}>
//                <button className="is-save" style={css.saveBtn} onClick={handleSave} disabled={saving}>
//                    {saving ? <FaSpinner style={spinStyle} /> : <FaSave style={{ fontSize: 13 }} />}
//                    <span>{saving ? "Saving…" : isEdit ? "Update Sheet" : "Save Sheet"}</span>
//                </button>
//            </div>
//        </div>
//    );
//}
//
//const spinStyle = { animation: "spin 0.9s linear infinite", display: "inline-block" };
//
//const css = {
//    page:          { maxWidth: 1440, margin: "0 auto", padding: "0 4px 56px", fontFamily: "'Inter',-apple-system,sans-serif" },
//    loadingWrap:   { display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "120px 0", color: "#64748b", fontSize: 15 },
//    pageHeader:    { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, padding: "32px 0 24px", flexWrap: "wrap" },
//    headerLeft:    { display: "flex", flexDirection: "column", gap: 8 },
//    backBtn:       { background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 13, color: "#64748b", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 },
//    pageTitle:     { margin: 0, fontSize: 24, fontWeight: 800, color: "#0f172a" },
//    metaLine:      { display: "flex", alignItems: "center", gap: 10, marginTop: 6 },
//    woBadge:       { background: "#e0f2fe", color: "#0284c7", fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 12 },
//    towerBadge:    { background: "#fef3c7", color: "#92400e", fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 12, border: "1px solid #fde68a" },
//    saveBtn:       { display: "flex", alignItems: "center", gap: 8, padding: "11px 22px", background: "#10b981", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13, transition: "all 0.2s" },
//    toast:         { display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderRadius: 8, fontSize: 14, fontWeight: 500, marginBottom: 24, border: "1px solid" },
//    toastOk:       { background: "#ecfdf5", color: "#047857", borderColor: "#a7f3d0" },
//    toastErr:      { background: "#fef2f2", color: "#b91c1c", borderColor: "#fecaca" },
//    card:          { background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)", marginBottom: 24, overflow: "hidden" },
//    cardHeader:    { display: "flex", alignItems: "center", gap: 10, padding: "18px 24px 0" },
//    cardLabel:     { fontSize: 11, fontWeight: 700, color: "#475569", letterSpacing: "0.05em", textTransform: "uppercase" },
//    fieldWrap:     { display: "flex", flexDirection: "column", gap: 5 },
//    fieldLabel:    { fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.05em" },
//    iconWrap:      { position: "relative", display: "flex", alignItems: "center" },
//    inputIcon:     { position: "absolute", left: 10, color: "#94a3b8", fontSize: 11, pointerEvents: "none" },
//    fieldInput:    { padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13, color: "#0f172a", background: "#fff", outline: "none", boxSizing: "border-box" },
//    fieldStatic:   { padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, color: "#1e293b", background: "#f8fafc", fontWeight: 600, minWidth: 120 },
//    th:            { padding: "10px 8px", background: "#1e293b", color: "#f8fafc", fontWeight: 600, textAlign: "left", fontSize: 11, whiteSpace: "nowrap", borderRight: "1px solid #334155", verticalAlign: "middle" },
//    colNote:       { fontSize: 8, fontWeight: 700, color: "#a5b4fc", textTransform: "uppercase" },
//    td:            { padding: "5px 6px", verticalAlign: "middle" },
//    cell:          { width: "100%", padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: 5, fontSize: 12, color: "#0f172a", background: "#fff", outline: "none" },
//    cellAuto:      { background: "#f1f5f9", color: "#475569", cursor: "not-allowed", fontWeight: 500, borderColor: "#e2e8f0" },
//    cellSqft:      { background: "#eff6ff", color: "#0284c7", cursor: "not-allowed", fontWeight: 700, borderColor: "#bfdbfe" },
//    selectCell:    { width: "100%", padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: 5, fontSize: 12, color: "#0f172a", background: "#fff", outline: "none" },
//    selectDisabled:{ background: "#f8fafc", color: "#94a3b8", cursor: "not-allowed" },
//    delBtn:        { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: 5, background: "#fff", border: "1px solid #e2e8f0", cursor: "pointer", color: "#94a3b8", transition: "all 0.15s" },
//    removeFlatBtn: { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 6, background: "#fef2f2", border: "1px solid #fecaca", cursor: "pointer", color: "#ef4444", transition: "all 0.15s" },
//    addRowBtn:     { display: "flex", alignItems: "center", gap: 6, marginTop: 10, padding: "7px 14px", background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0", borderRadius: 7, cursor: "pointer", fontWeight: 600, fontSize: 12, transition: "all 0.15s" },
//    addFlatBtn:    { display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", background: "#0284c7", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 14, marginBottom: 24, transition: "all 0.2s" },
//};

import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
    FaRegArrowAltCircleLeft, FaPlus, FaTrash,
    FaSave, FaCheckCircle, FaExclamationTriangle,
    FaSpinner, FaCalendarAlt, FaLayerGroup, FaHome,
    FaChevronDown, FaChevronUp
} from "react-icons/fa";

function calcSqft(length, height) {
    const l = parseFloat(length);
    const h = parseFloat(height);
    if (isNaN(l) || l <= 0 || isNaN(h) || h <= 0) return "";
    return ((l * h) / 1_000_000 * 10.764).toFixed(4);
}

const FLAT_TYPES = ["1BHK", "2BHK", "3BHK", "4BHK"];

const emptyRow = () => ({
    _id:        Date.now() + Math.random(),
    srNo:       "",
    location:   "",
    windowCode: "",
    typology:   "",
    series:     "",
    length:     "",
    height:     "",
    sqft:       "",
});

const emptyFlat = () => ({
    _fid:      Date.now() + Math.random(),
    flatType:  "",
    flatNo:    "",
    collapsed: false,
    rows:      [emptyRow()],
});

const ftColors = {
    "1BHK": { bg: "#e0f2fe", color: "#0284c7", border: "#bae6fd", active: "#0284c7" },
    "2BHK": { bg: "#dcfce7", color: "#16a34a", border: "#bbf7d0", active: "#16a34a" },
    "3BHK": { bg: "#fef3c7", color: "#d97706", border: "#fde68a", active: "#d97706" },
    "4BHK": { bg: "#fae8ff", color: "#9333ea", border: "#f5d0fe", active: "#9333ea" },
};

export default function InfoSheetFormPage() {
    const navigate            = useNavigate();
    const location            = useLocation();
    const { workOrderId, id } = useParams();
    const isEdit              = Boolean(id);

    const workOrder = location.state?.workOrder || {};
    const project   = location.state?.project   || {};

    const [woItems, setWoItems] = useState([]);
    const [date,    setDate]    = useState(new Date().toISOString().split("T")[0]);
    const [flats,   setFlats]   = useState([emptyFlat()]);
    const [loading, setLoading] = useState(isEdit);
    const [saving,  setSaving]  = useState(false);
    const [saveMsg, setSaveMsg] = useState(null);

    // Load WO items for dropdowns
    useEffect(() => {
        if (!workOrderId) return;
        fetch(`${process.env.REACT_APP_API_URL}/api/work-orders/${workOrderId}`)
            .then(r => r.json())
            .then(data => setWoItems(data.items || []))
            .catch(() => setWoItems([]));
    }, [workOrderId]);

    // Load existing sheet on edit
    useEffect(() => {
        if (!isEdit) return;
        (async () => {
            try {
                const res  = await fetch(`${process.env.REACT_APP_API_URL}/api/info-sheets/${id}`);
                if (!res.ok) throw new Error("Not found");
                const data = await res.json();
                setDate(data.date || new Date().toISOString().split("T")[0]);
                setFlats((data.flats || []).map(f => ({
                    _fid:      f.id,
                    dbId:      f.id,
                    flatType:  f.flatType  || "",
                    flatNo:    f.flatNo    || "",
                    collapsed: false,
                    rows: (f.items || []).map(item => ({
                        _id:        Date.now() + Math.random(),
                        srNo:       item.srNo       || "",
                        location:   item.location   || "",
                        windowCode: item.windowCode || "",
                        typology:   item.typology   || "",
                        series:     item.series     || "",
                        length:     item.length     ?? "",
                        height:     item.height     ?? "",
                        sqft:       item.sqft       ?? "",
                    })),
                })));
            } catch {
                setSaveMsg({ type: "error", text: "Failed to load info sheet." });
            } finally {
                setLoading(false);
            }
        })();
    }, [id, isEdit]);

    // ── Dropdown helpers — only show WO items not yet used in any row ─────────

    // Build set of used "loc|wcode|typology" keys across all flats/rows
    // excludeFid + excludeRowId = the row currently being edited (keep its own value)
    const usedKeys = (excludeFid, excludeRowId) => {
        const keys = new Set();
        flats.forEach(fl => {
            fl.rows.forEach(row => {
                if (fl._fid === excludeFid && row._id === excludeRowId) return;
                if (row.location && row.windowCode) {
                    keys.add(`${row.location}|${row.windowCode}|${row.typology || ""}`);
                }
            });
        });
        return keys;
    };

    // Locations that still have at least one unused combo
    const availableLocations = (excludeFid, excludeRowId) => {
        const used = usedKeys(excludeFid, excludeRowId);
        return [...new Set(
            woItems
                .filter(i => i.location)
                .filter(i => !used.has(`${i.location}|${i.windowCode}|${i.typology || ""}`))
                .map(i => i.location)
        )].sort();
    };

    // WCodes for a location with at least one unused typology combo
    const wcodesFor = (loc, excludeFid, excludeRowId) => {
        const used = usedKeys(excludeFid, excludeRowId);
        return [...new Set(
            woItems
                .filter(i => i.location === loc && i.windowCode)
                .filter(i => !used.has(`${i.location}|${i.windowCode}|${i.typology || ""}`))
                .map(i => i.windowCode)
        )].sort();
    };

    // Typologies for loc+wcode that are not yet used
    const typologiesFor = (loc, wc, excludeFid, excludeRowId) => {
        const used = usedKeys(excludeFid, excludeRowId);
        return [...new Set(
            woItems
                .filter(i => i.location === loc && i.windowCode === wc && i.typology)
                .filter(i => !used.has(`${i.location}|${i.windowCode}|${i.typology || ""}`))
                .map(i => i.typology)
        )].sort();
    };

    const findWoItem = (loc, wc, typ) =>
        woItems.find(i => i.location === loc && i.windowCode === wc && (!typ || i.typology === typ));

    // ── Flat operations ───────────────────────────────────────────────────────
    const addFlat    = () => setFlats(f => [...f, emptyFlat()]);
    const removeFlat = (_fid) => setFlats(f => f.filter(fl => fl._fid !== _fid));
    const toggleCollapse = (_fid) =>
        setFlats(f => f.map(fl => fl._fid === _fid ? { ...fl, collapsed: !fl.collapsed } : fl));

    const updateFlat = (_fid, field, value) =>
        setFlats(f => f.map(fl => fl._fid === _fid ? { ...fl, [field]: value } : fl));

    // ── Row operations ────────────────────────────────────────────────────────
    const addRow = (_fid) =>
        setFlats(f => f.map(fl =>
            fl._fid === _fid ? { ...fl, rows: [...fl.rows, emptyRow()] } : fl
        ));

    const deleteRow = (_fid, _id) =>
        setFlats(f => f.map(fl =>
            fl._fid === _fid
                ? { ...fl, rows: fl.rows.filter(r => r._id !== _id) }
                : fl
        ));

    const updateRow = (_fid, _id, field, value) => {
        setFlats(prev => prev.map(fl => {
            if (fl._fid !== _fid) return fl;
            const rows = fl.rows.map(row => {
                if (row._id !== _id) return row;
                let u = { ...row, [field]: value };

                if (field === "location") {
                    u.windowCode = ""; u.typology = "";
                    u.series = ""; u.length = ""; u.height = ""; u.sqft = "";
                }
                if (field === "windowCode") {
                    u.typology = ""; u.series = ""; u.length = ""; u.height = ""; u.sqft = "";
                    const typs = typologiesFor(u.location, value, null, null);
                    if (typs.length === 1) {
                        const m = findWoItem(u.location, value, typs[0]);
                        if (m) {
                            u.typology = m.typology || "";
                            u.series   = m.series   || "";
                            u.length   = m.length   ?? "";
                            u.height   = m.height   ?? "";
                            u.sqft     = m.sqft ? String(m.sqft) : calcSqft(m.length, m.height);
                        }
                    }
                }
                if (field === "typology") {
                    const m = findWoItem(u.location, u.windowCode, value);
                    if (m) {
                        u.series = m.series || "";
                        u.length = m.length ?? "";
                        u.height = m.height ?? "";
                        u.sqft   = m.sqft ? String(m.sqft) : calcSqft(m.length, m.height);
                    }
                }
                return u;
            });
            return { ...fl, rows };
        }));
    };

    // ── Save ──────────────────────────────────────────────────────────────────
    const handleSave = async () => {
        setSaveMsg(null);
        for (const fl of flats) {
            if (!fl.flatType) { setSaveMsg({ type: "error", text: `Select Flat Type for flat ${fl.flatNo || "(unnamed)"}` }); return; }
            if (!fl.flatNo.trim()) { setSaveMsg({ type: "error", text: "Enter Flat No for all flats." }); return; }
        }
        const validFlats = flats.filter(fl => fl.flatType && fl.flatNo.trim());
        if (!validFlats.length) { setSaveMsg({ type: "error", text: "Add at least one flat." }); return; }

        setSaving(true);
        const payload = {
            workOrderId: parseInt(workOrderId),
            projectName: workOrder.projectName || "",
            towerName:   workOrder.towerName   || "",
            date,
            flats: validFlats.map(fl => ({
                id:       fl.dbId || null,
                flatType: fl.flatType,
                flatNo:   fl.flatNo,
                items:    fl.rows
                    .filter(r => r.location || r.windowCode)
                    .map(({ _id, ...rest }) => rest),
            })),
        };

        try {
            const url    = isEdit
                ? `${process.env.REACT_APP_API_URL}/api/info-sheets/${id}`
                : `${process.env.REACT_APP_API_URL}/api/info-sheets`;
            const method = isEdit ? "PUT" : "POST";
            const res    = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Server error");
            setSaveMsg({ type: "success", text: isEdit ? "Info sheet updated!" : "Info sheet saved!" });
            setTimeout(() => navigate(
                `/coordinator-dashboard/tracker`,
                { state: { project } }
            ), 1400);
        } catch (err) {
            setSaveMsg({ type: "error", text: err.message });
        } finally {
            setSaving(false);
        }
    };

    const grandTotalSqft = flats.reduce((sum, fl) =>
        sum + fl.rows.reduce((s, r) => s + (parseFloat(r.sqft) || 0), 0), 0
    );

    if (loading) return (
        <div style={css.loadingWrap}>
            <FaSpinner style={spinStyle} /><span>Loading…</span>
        </div>
    );

    return (
        <div style={css.page}>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                .is-row:hover { background: #f8fafc !important; }
                .is-del:hover { color: #ef4444 !important; background: #fef2f2 !important; border-color: #fecaca !important; }
                .is-save:hover:not(:disabled) { background: #047857 !important; transform: translateY(-1px); }
                .ft-pill { transition: all 0.15s; border: 2px solid #e2e8f0; background: #f8fafc; color: #475569; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; cursor: pointer; }
                .ft-pill:hover { transform: translateY(-1px); }
                select.is-sel { appearance: none; cursor: pointer; }
                select.is-sel:focus { border-color: #0284c7 !important; outline: none; }
                .flat-card { border-radius: 12px; border: 1.5px solid #e2e8f0; background: #fff; margin-bottom: 20px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.04); }
                .flat-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; cursor: pointer; transition: background 0.15s; }
                .flat-header:hover { background: #f8fafc; }
            `}</style>

            {/* Page header */}
            <div style={css.pageHeader}>
                <div style={css.headerLeft}>
                    <button style={css.backBtn} onClick={() => navigate(
                        `/coordinator-dashboard/tracker`
                    )}>
                        <FaRegArrowAltCircleLeft /> Back to Tracker
                    </button>
                    <div>
                        <h1 style={css.pageTitle}>{isEdit ? "Edit Info Sheet" : "New Info Sheet"}</h1>
                        <div style={css.metaLine}>
                            <span style={css.woBadge}>{workOrder.workOrderNo || "—"}</span>
                            {workOrder.towerName && <span style={css.towerBadge}>{workOrder.towerName}</span>}
                            <span style={{ color: "#64748b", fontSize: 13 }}>
                                {workOrder.projectName || project.projectName || ""}
                            </span>
                        </div>
                    </div>
                </div>

                <button className="is-save" style={css.saveBtn} onClick={handleSave} disabled={saving}>
                    {saving ? <FaSpinner style={spinStyle} /> : <FaSave style={{ fontSize: 13 }} />}
                    <span>{saving ? "Saving…" : isEdit ? "Update Sheet" : "Save Sheet"}</span>
                </button>
            </div>

            {saveMsg && (
                <div style={{ ...css.toast, ...(saveMsg.type === "success" ? css.toastOk : css.toastErr) }}>
                    {saveMsg.type === "success" ? <FaCheckCircle style={{ flexShrink: 0 }} /> : <FaExclamationTriangle style={{ flexShrink: 0 }} />}
                    <span>{saveMsg.text}</span>
                </div>
            )}

            {/* Sheet meta */}
            <div style={css.card}>
                <div style={css.cardHeader}>
                    <FaLayerGroup style={{ color: "#0284c7" }} />
                    <span style={css.cardLabel}>Sheet Info</span>
                </div>
                <div style={{ padding: "16px 24px 20px", display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-end" }}>
                    <div style={css.fieldWrap}>
                        <label style={css.fieldLabel}>WORK ORDER</label>
                        <div style={css.fieldStatic}>{workOrder.workOrderNo || "—"}</div>
                    </div>
                    <div style={css.fieldWrap}>
                        <label style={css.fieldLabel}>PROJECT</label>
                        <div style={css.fieldStatic}>{workOrder.projectName || project.projectName || "—"}</div>
                    </div>
                    <div style={css.fieldWrap}>
                        <label style={css.fieldLabel}>TOWER</label>
                        <div style={css.fieldStatic}>{workOrder.towerName || "—"}</div>
                    </div>
                    <div style={css.fieldWrap}>
                        <label style={css.fieldLabel}>DATE</label>
                        <div style={css.iconWrap}>
                            <FaCalendarAlt style={css.inputIcon} />
                            <input
                                style={{ ...css.fieldInput, paddingLeft: 32 }}
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                            />
                        </div>
                    </div>
                    <div style={{ marginLeft: "auto" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.05em", marginBottom: 4 }}>GRAND TOTAL SQFT</div>
                        <div style={{ fontSize: 26, fontWeight: 800, color: "#0284c7" }}>{grandTotalSqft.toFixed(2)}</div>
                    </div>
                </div>
            </div>

            {/* Flat cards */}
            {flats.map((fl, flatIdx) => {
                const ftC       = ftColors[fl.flatType] || { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" };
                const flatSqft  = fl.rows.reduce((s, r) => s + (parseFloat(r.sqft) || 0), 0);
                return (
                    <div key={fl._fid} className="flat-card">
                        {/* Flat header */}
                        <div
                            className="flat-header"
                            style={{ borderBottom: fl.collapsed ? "none" : "1px solid #f1f5f9" }}
                            onClick={() => toggleCollapse(fl._fid)}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <span style={{
                                    background: ftC.bg, color: ftC.color,
                                    border: `1px solid ${ftC.border}`,
                                    fontSize: 12, fontWeight: 700,
                                    padding: "3px 12px", borderRadius: 20
                                }}>
                                    {fl.flatType || "No Type"}
                                </span>
                                <span style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>
                                    {fl.flatNo ? `Flat ${fl.flatNo}` : `Flat #${flatIdx + 1}`}
                                </span>
                                <span style={{ fontSize: 12, color: "#94a3b8" }}>
                                    {fl.rows.length} rows &nbsp;•&nbsp;
                                    <span style={{ color: "#0284c7", fontWeight: 600 }}>{flatSqft.toFixed(2)} sqft</span>
                                </span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <button
                                    style={css.removeFlatBtn}
                                    onClick={e => { e.stopPropagation(); removeFlat(fl._fid); }}
                                    title="Remove this flat"
                                >
                                    <FaTrash style={{ fontSize: 11 }} />
                                </button>
                                {fl.collapsed
                                    ? <FaChevronDown style={{ color: "#64748b" }} />
                                    : <FaChevronUp   style={{ color: "#64748b" }} />}
                            </div>
                        </div>

                        {!fl.collapsed && (
                            <div style={{ padding: "16px 20px 20px" }}>
                                {/* Flat type + No */}
                                <div style={{ display: "flex", gap: 20, marginBottom: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
                                    <div style={css.fieldWrap}>
                                        <label style={css.fieldLabel}>FLAT TYPE <span style={{ color: "#ef4444" }}>*</span></label>
                                        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                                            {FLAT_TYPES.map(ft => {
                                                const c = ftColors[ft];
                                                return (
                                                    <button
                                                        key={ft}
                                                        className="ft-pill"
                                                        style={fl.flatType === ft ? {
                                                            border: `2px solid ${c.active}`,
                                                            background: c.bg,
                                                            color: c.color,
                                                            padding: "6px 16px", borderRadius: 20,
                                                            fontSize: 12, fontWeight: 700, cursor: "pointer"
                                                        } : undefined}
                                                        onClick={() => updateFlat(fl._fid, "flatType", ft)}
                                                    >
                                                        {ft}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div style={css.fieldWrap}>
                                        <label style={css.fieldLabel}>FLAT NO <span style={{ color: "#ef4444" }}>*</span></label>
                                        <div style={css.iconWrap}>
                                            <FaHome style={css.inputIcon} />
                                            <input
                                                style={{ ...css.fieldInput, paddingLeft: 32, width: 160 }}
                                                value={fl.flatNo}
                                                onChange={e => updateFlat(fl._fid, "flatNo", e.target.value)}
                                                placeholder="e.g. 101, A-202"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Rows table */}
                                <div style={{ overflowX: "auto", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                                        <thead>
                                            <tr>
                                                {[
                                                    { label: "Sr No",       w: 55  },
                                                    { label: "Location",    w: 150, note: "select" },
                                                    { label: "WCode",       w: 110, note: "select" },
                                                    { label: "Typology",    w: 190, note: "select / auto" },
                                                    { label: "Series",      w: 90,  note: "auto" },
                                                    { label: "Length (mm)", w: 95,  note: "auto" },
                                                    { label: "Height (mm)", w: 95,  note: "auto" },
                                                    { label: "Sqft",        w: 100, note: "auto" },
                                                ].map(col => (
                                                    <th key={col.label} style={{ ...css.th, minWidth: col.w }}>
                                                        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                                            <span>{col.label}</span>
                                                            {col.note && <span style={css.colNote}>{col.note}</span>}
                                                        </div>
                                                    </th>
                                                ))}
                                                <th style={{ ...css.th, minWidth: 44, textAlign: "center" }}>Del</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {fl.rows.map((row, rowIdx) => {
                                                const wcs  = wcodesFor(row.location, fl._fid, row._id);
                                                const typs = typologiesFor(row.location, row.windowCode, fl._fid, row._id);
                                                return (
                                                    <tr key={row._id} className="is-row" style={{ borderBottom: "1px solid #f1f5f9" }}>
                                                        <td style={css.td}>
                                                            <input style={css.cell} value={row.srNo}
                                                                placeholder={String(rowIdx + 1)}
                                                                onChange={e => updateRow(fl._fid, row._id, "srNo", e.target.value)} />
                                                        </td>
                                                        <td style={css.td}>
                                                            <select className="is-sel" style={css.selectCell}
                                                                value={row.location}
                                                                onChange={e => updateRow(fl._fid, row._id, "location", e.target.value)}>
                                                                <option value="">— Select —</option>
                                                                {availableLocations(fl._fid, row._id).map(loc => <option key={loc} value={loc}>{loc}</option>)}
                                                            </select>
                                                        </td>
                                                        <td style={css.td}>
                                                            <select className="is-sel"
                                                                style={{ ...css.selectCell, ...(row.location ? {} : css.selectDisabled) }}
                                                                value={row.windowCode}
                                                                disabled={!row.location}
                                                                onChange={e => updateRow(fl._fid, row._id, "windowCode", e.target.value)}>
                                                                <option value="">— Select —</option>
                                                                {wcs.map(wc => <option key={wc} value={wc}>{wc}</option>)}
                                                            </select>
                                                        </td>
                                                        <td style={css.td}>
                                                            {typs.length > 1 ? (
                                                                <select className="is-sel" style={css.selectCell}
                                                                    value={row.typology}
                                                                    onChange={e => updateRow(fl._fid, row._id, "typology", e.target.value)}>
                                                                    <option value="">— Select —</option>
                                                                    {typs.map(t => <option key={t} value={t}>{t}</option>)}
                                                                </select>
                                                            ) : (
                                                                <input style={{ ...css.cell, ...css.cellAuto }} value={row.typology} readOnly placeholder="auto" />
                                                            )}
                                                        </td>
                                                        <td style={css.td}><input style={{ ...css.cell, ...css.cellAuto }} value={row.series} readOnly placeholder="auto" /></td>
                                                        <td style={css.td}><input style={{ ...css.cell, ...css.cellAuto, textAlign: "right" }} value={row.length} readOnly placeholder="auto" /></td>
                                                        <td style={css.td}><input style={{ ...css.cell, ...css.cellAuto, textAlign: "right" }} value={row.height} readOnly placeholder="auto" /></td>
                                                        <td style={css.td}><input style={{ ...css.cell, ...css.cellSqft, textAlign: "right" }} value={row.sqft ? parseFloat(row.sqft).toFixed(2) : ""} readOnly placeholder="auto" /></td>
                                                        <td style={{ ...css.td, textAlign: "center" }}>
                                                            <button className="is-del" style={css.delBtn}
                                                                onClick={() => deleteRow(fl._fid, row._id)}>
                                                                <FaTrash style={{ fontSize: 10 }} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                        <tfoot>
                                            <tr style={{ background: "#f8fafc", borderTop: "2px solid #e2e8f0" }}>
                                                <td colSpan={7} style={{ padding: "10px 14px", fontWeight: 700, fontSize: 12, color: "#1e293b" }}>
                                                    Flat Sqft Total
                                                </td>
                                                <td style={{ padding: "10px 10px", fontSize: 13, fontWeight: 800, color: "#0284c7", textAlign: "right" }}>
                                                    {flatSqft.toFixed(4)}
                                                </td>
                                                <td />
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>

                                <button
                                    style={css.addRowBtn}
                                    onClick={() => addRow(fl._fid)}
                                >
                                    <FaPlus style={{ fontSize: 10 }} />&nbsp;Add Row
                                </button>
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Add Flat button */}
            <button style={css.addFlatBtn} onClick={addFlat}>
                <FaPlus style={{ fontSize: 13 }} />&nbsp;Add Another Flat
            </button>

            {/* Bottom save */}
            <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 16, paddingBottom: 40 }}>
                <button className="is-save" style={css.saveBtn} onClick={handleSave} disabled={saving}>
                    {saving ? <FaSpinner style={spinStyle} /> : <FaSave style={{ fontSize: 13 }} />}
                    <span>{saving ? "Saving…" : isEdit ? "Update Sheet" : "Save Sheet"}</span>
                </button>
            </div>
        </div>
    );
}

const spinStyle = { animation: "spin 0.9s linear infinite", display: "inline-block" };

const css = {
    page:          { maxWidth: 1440, margin: "0 auto", padding: "0 4px 56px", fontFamily: "'Inter',-apple-system,sans-serif" },
    loadingWrap:   { display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "120px 0", color: "#64748b", fontSize: 15 },
    pageHeader:    { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, padding: "32px 0 24px", flexWrap: "wrap" },
    headerLeft:    { display: "flex", flexDirection: "column", gap: 8 },
    backBtn:       { background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 13, color: "#64748b", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 },
    pageTitle:     { margin: 0, fontSize: 24, fontWeight: 800, color: "#0f172a" },
    metaLine:      { display: "flex", alignItems: "center", gap: 10, marginTop: 6 },
    woBadge:       { background: "#e0f2fe", color: "#0284c7", fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 12 },
    towerBadge:    { background: "#fef3c7", color: "#92400e", fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 12, border: "1px solid #fde68a" },
    saveBtn:       { display: "flex", alignItems: "center", gap: 8, padding: "11px 22px", background: "#10b981", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13, transition: "all 0.2s" },
    toast:         { display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderRadius: 8, fontSize: 14, fontWeight: 500, marginBottom: 24, border: "1px solid" },
    toastOk:       { background: "#ecfdf5", color: "#047857", borderColor: "#a7f3d0" },
    toastErr:      { background: "#fef2f2", color: "#b91c1c", borderColor: "#fecaca" },
    card:          { background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)", marginBottom: 24, overflow: "hidden" },
    cardHeader:    { display: "flex", alignItems: "center", gap: 10, padding: "18px 24px 0" },
    cardLabel:     { fontSize: 11, fontWeight: 700, color: "#475569", letterSpacing: "0.05em", textTransform: "uppercase" },
    fieldWrap:     { display: "flex", flexDirection: "column", gap: 5 },
    fieldLabel:    { fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.05em" },
    iconWrap:      { position: "relative", display: "flex", alignItems: "center" },
    inputIcon:     { position: "absolute", left: 10, color: "#94a3b8", fontSize: 11, pointerEvents: "none" },
    fieldInput:    { padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13, color: "#0f172a", background: "#fff", outline: "none", boxSizing: "border-box" },
    fieldStatic:   { padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, color: "#1e293b", background: "#f8fafc", fontWeight: 600, minWidth: 120 },
    th:            { padding: "10px 8px", background: "#1e293b", color: "#f8fafc", fontWeight: 600, textAlign: "left", fontSize: 11, whiteSpace: "nowrap", borderRight: "1px solid #334155", verticalAlign: "middle" },
    colNote:       { fontSize: 8, fontWeight: 700, color: "#a5b4fc", textTransform: "uppercase" },
    td:            { padding: "5px 6px", verticalAlign: "middle" },
    cell:          { width: "100%", padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: 5, fontSize: 12, color: "#0f172a", background: "#fff", outline: "none" },
    cellAuto:      { background: "#f1f5f9", color: "#475569", cursor: "not-allowed", fontWeight: 500, borderColor: "#e2e8f0" },
    cellSqft:      { background: "#eff6ff", color: "#0284c7", cursor: "not-allowed", fontWeight: 700, borderColor: "#bfdbfe" },
    selectCell:    { width: "100%", padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: 5, fontSize: 12, color: "#0f172a", background: "#fff", outline: "none" },
    selectDisabled:{ background: "#f8fafc", color: "#94a3b8", cursor: "not-allowed" },
    delBtn:        { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: 5, background: "#fff", border: "1px solid #e2e8f0", cursor: "pointer", color: "#94a3b8", transition: "all 0.15s" },
    removeFlatBtn: { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 6, background: "#fef2f2", border: "1px solid #fecaca", cursor: "pointer", color: "#ef4444", transition: "all 0.15s" },
    addRowBtn:     { display: "flex", alignItems: "center", gap: 6, marginTop: 10, padding: "7px 14px", background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0", borderRadius: 7, cursor: "pointer", fontWeight: 600, fontSize: 12, transition: "all 0.15s" },
    addFlatBtn:    { display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", background: "#0284c7", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 14, marginBottom: 24, transition: "all 0.2s" },
};

