//////import React, { useState, useEffect } from "react";
//////import { useNavigate, useParams, useSearchParams } from "react-router-dom";
//////import {
//////    FaPlus, FaTrash, FaSave, FaArrowLeft,
//////    FaCheckCircle, FaExclamationTriangle, FaSpinner
//////} from "react-icons/fa";
//////
//////// ── helpers ──────────────────────────────────────────────────────────────────
//////const emptyRow = () => ({
//////    _id:          Date.now() + Math.random(),
//////    srNo:         "",
//////    location:     "",
//////    windowCode:   "",
//////    typology:     "",
//////    series:       "",
//////    length:       "",
//////    height:       "",
//////    sqft:         "",
//////    woQtySqft:    "",
//////    woQtyNos:     "",
//////    floorPlanQty: "",
//////});
//////
//////const calcSqft = (l, h) => {
//////    const lv = parseFloat(l), hv = parseFloat(h);
//////    return (!isNaN(lv) && !isNaN(hv) && lv > 0 && hv > 0) ? (lv * hv).toFixed(2) : "";
//////};
//////
//////// ── Component ─────────────────────────────────────────────────────────────────
//////export default function WorkOrderFormPage() {
//////    const navigate      = useNavigate();
//////    const { id }        = useParams();                          // present when editing
//////    const [searchParams] = useSearchParams();
//////    const projectFromUrl = searchParams.get("project") || "";
//////
//////    const isEdit = Boolean(id);
//////
//////    const [workOrderNo,  setWorkOrderNo]  = useState("");
//////    const [projectName,  setProjectName]  = useState(projectFromUrl);
//////    const [date,         setDate]         = useState(new Date().toISOString().split("T")[0]);
//////    const [rows,         setRows]         = useState([emptyRow()]);
//////    const [saving,       setSaving]       = useState(false);
//////    const [loading,      setLoading]      = useState(isEdit);
//////    const [saveMsg,      setSaveMsg]      = useState(null);
//////
//////    // ── Load existing WO when editing ────────────────────────────────────────
//////    useEffect(() => {
//////        if (!isEdit) return;
//////        const load = async () => {
//////            try {
//////                const res  = await fetch(`${process.env.REACT_APP_API_URL}/api/work-orders/${id}`);
//////                const data = await res.json();
//////                setWorkOrderNo(data.workOrderNo  || "");
//////                setProjectName(data.projectName  || "");
//////                setDate(data.date                || "");
//////                setRows(
//////                    (data.items || []).map(i => ({
//////                        _id:          Date.now() + Math.random(),
//////                        srNo:         i.srNo         || "",
//////                        location:     i.location     || "",
//////                        windowCode:   i.windowCode   || "",
//////                        typology:     i.typology     || "",
//////                        series:       i.series       || "",
//////                        length:       i.length       ?? "",
//////                        height:       i.height       ?? "",
//////                        sqft:         i.sqft         ?? "",
//////                        woQtySqft:    i.woQtySqft    ?? "",
//////                        woQtyNos:     i.woQtyNos     ?? "",
//////                        floorPlanQty: i.floorPlanQty ?? "",
//////                    }))
//////                );
//////            } catch {
//////                setSaveMsg({ type: "error", text: "Failed to load work order." });
//////            } finally {
//////                setLoading(false);
//////            }
//////        };
//////        load();
//////    }, [id, isEdit]);
//////
//////    // ── Row operations ────────────────────────────────────────────────────────
//////    const addRow    = () => setRows(r => [...r, emptyRow()]);
//////    const deleteRow = (_id) => setRows(r => r.filter(row => row._id !== _id));
//////    const updateRow = (_id, field, value) =>
//////        setRows(r => r.map(row => {
//////            if (row._id !== _id) return row;
//////            const u = { ...row, [field]: value };
//////            if (field === "length" || field === "height") {
//////                const auto = calcSqft(u.length, u.height);
//////                if (auto) { u.sqft = auto; u.woQtySqft = auto; }
//////            }
//////            return u;
//////        }));
//////
//////    // ── Save ──────────────────────────────────────────────────────────────────
//////    const handleSave = async () => {
//////        if (!workOrderNo.trim()) { setSaveMsg({ type: "error", text: "Work Order No. is required." }); return; }
//////        if (!projectName.trim()) { setSaveMsg({ type: "error", text: "Project Name is required." }); return; }
//////
//////        const validRows = rows.filter(r => r.srNo || r.location || r.windowCode || r.length);
//////        if (!validRows.length) { setSaveMsg({ type: "error", text: "Add at least one row." }); return; }
//////
//////        setSaving(true);
//////        setSaveMsg(null);
//////
//////        const payload = {
//////            workOrderNo,
//////            projectName,
//////            date,
//////            items: validRows.map(({ _id, ...rest }) => rest),
//////        };
//////
//////        try {
//////            const url    = isEdit
//////                ? `${process.env.REACT_APP_API_URL}/api/work-orders/${id}`
//////                : `${process.env.REACT_APP_API_URL}/api/work-orders`;
//////            const method = isEdit ? "PUT" : "POST";
//////
//////            const res  = await fetch(url, {
//////                method,
//////                headers: { "Content-Type": "application/json" },
//////                body: JSON.stringify(payload),
//////            });
//////            const data = await res.json();
//////
//////            if (!res.ok) throw new Error(data.message || "Server error");
//////
//////            setSaveMsg({ type: "success", text: `✅ Work Order ${isEdit ? "updated" : "saved"} successfully!` });
//////
//////            // Navigate back after short delay
//////            setTimeout(() => navigate("/coordinator-dashboard/work-orders"), 1200);
//////        } catch (err) {
//////            setSaveMsg({ type: "error", text: `❌ ${err.message}` });
//////        } finally {
//////            setSaving(false);
//////        }
//////    };
//////
//////    // ── Totals ────────────────────────────────────────────────────────────────
//////    const totalSqft = rows.reduce((s, r) => s + (parseFloat(r.woQtySqft)    || 0), 0);
//////    const totalNos  = rows.reduce((s, r) => s + (parseFloat(r.woQtyNos)     || 0), 0);
//////    const totalFP   = rows.reduce((s, r) => s + (parseFloat(r.floorPlanQty) || 0), 0);
//////
//////    if (loading) return <div style={f.center}>Loading work order…</div>;
//////
//////    // ── Columns config ────────────────────────────────────────────────────────
//////    const COLS = [
//////        { key: "srNo",         label: "Sr. No",          type: "text",   width: 70  },
//////        { key: "location",     label: "Location",         type: "text",   width: 120 },
//////        { key: "windowCode",   label: "Window Code",      type: "text",   width: 120 },
//////        { key: "typology",     label: "Typology",         type: "text",   width: 110 },
//////        { key: "series",       label: "Series",           type: "text",   width: 100 },
//////        { key: "length",       label: "Length (ft)",      type: "number", width: 90  },
//////        { key: "height",       label: "Height (ft)",      type: "number", width: 90  },
//////        { key: "sqft",         label: "Sqft (Auto)",      type: "number", width: 90, readOnly: true },
//////        { key: "woQtySqft",    label: "W/O Qty (Sqft)",   type: "number", width: 110 },
//////        { key: "woQtyNos",     label: "W/O QTY (Nos)",    type: "number", width: 100 },
//////        { key: "floorPlanQty", label: "Floor Plan Qty",   type: "number", width: 110 },
//////    ];
//////
//////    return (
//////        <div style={f.wrapper}>
//////
//////            {/* ── Top bar ───────────────────────────────────────────────── */}
//////            <div style={f.topBar}>
//////
//////                <h1 style={f.title}>
//////                    {isEdit ? "Edit Work Order" : "Create Work Order"}
//////                    {projectName && <span style={f.projectTag}>{projectName}</span>}
//////                </h1>
//////                <button style={f.saveBtn} onClick={handleSave} disabled={saving}>
//////                    {saving ? <FaSpinner style={spin} /> : <FaSave />}
//////                    &nbsp;{saving ? "Saving…" : isEdit ? "Update" : "Save Work Order"}
//////                </button>
//////            </div>
//////
//////            {/* ── Save message ──────────────────────────────────────────── */}
//////            {saveMsg && (
//////                <div style={{ ...f.alert, ...(saveMsg.type === "success" ? f.alertOk : f.alertErr) }}>
//////                    {saveMsg.type === "success" ? <FaCheckCircle /> : <FaExclamationTriangle />}
//////                    &nbsp;{saveMsg.text}
//////                </div>
//////            )}
//////
//////            {/* ── Work Order Meta ───────────────────────────────────────── */}
//////            <div style={f.card}>
//////                <h2 style={f.sectionTitle}>Work Order Details</h2>
//////                <div style={f.metaGrid}>
//////                    <div style={f.field}>
//////                        <label style={f.label}>Work Order No. *</label>
//////                        <input
//////                            style={f.input}
//////                            value={workOrderNo}
//////                            onChange={e => setWorkOrderNo(e.target.value)}
//////                            placeholder="WO-2026-001"
//////                            disabled={isEdit}
//////                        />
//////                    </div>
//////                    <div style={f.field}>
//////                        <label style={f.label}>Project Name *</label>
//////                        <input
//////                            style={{ ...f.input, background: "#f1f5f9" }}
//////                            value={projectName}
//////                            readOnly
//////                        />
//////                    </div>
//////                    <div style={f.field}>
//////                        <label style={f.label}>Date</label>
//////                        <input
//////                            style={f.input}
//////                            type="date"
//////                            value={date}
//////                            onChange={e => setDate(e.target.value)}
//////                        />
//////                    </div>
//////                </div>
//////            </div>
//////
//////            {/* ── Items Table ───────────────────────────────────────────── */}
//////            <div style={f.card}>
//////                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
//////                    <h2 style={f.sectionTitle}>Work Order Items</h2>
//////                    <button style={f.addBtn} onClick={addRow}>
//////                        <FaPlus /> &nbsp;Add Row
//////                    </button>
//////                </div>
//////
//////                <div style={{ overflowX: "auto" }}>
//////                    <table style={t.table}>
//////                        <thead>
//////                            <tr style={t.headRow}>
//////                                {COLS.map(c => (
//////                                    <th key={c.key} style={{ ...t.th, minWidth: c.width }}>{c.label}</th>
//////                                ))}
//////                                <th style={t.th}>Action</th>
//////                            </tr>
//////                        </thead>
//////                        <tbody>
//////                            {rows.map((row, idx) => (
//////                                <tr key={row._id} style={idx % 2 === 0 ? t.rowEven : t.rowOdd}>
//////                                    {COLS.map(c => (
//////                                        <td key={c.key} style={t.td}>
//////                                            <input
//////                                                style={{
//////                                                    ...t.cell,
//////                                                    ...(c.readOnly ? t.cellRO : {}),
//////                                                }}
//////                                                type={c.type}
//////                                                value={row[c.key]}
//////                                                readOnly={c.readOnly}
//////                                                placeholder={c.key === "srNo" ? `${idx + 1}` : ""}
//////                                                onChange={e => updateRow(row._id, c.key, e.target.value)}
//////                                            />
//////                                        </td>
//////                                    ))}
//////                                    <td style={t.td}>
//////                                        <button style={t.delBtn} onClick={() => deleteRow(row._id)}>
//////                                            <FaTrash />
//////                                        </button>
//////                                    </td>
//////                                </tr>
//////                            ))}
//////                        </tbody>
//////                        <tfoot>
//////                            <tr style={t.footRow}>
//////                                <td colSpan={8} style={{ ...t.td, fontWeight: 700, color: "#1e293b", paddingLeft: 12, textAlign: "left" }}>
//////                                    Totals
//////                                </td>
//////                                <td style={{ ...t.td, fontWeight: 700, color: "#2563eb" }}>{totalSqft.toFixed(2)}</td>
//////                                <td style={{ ...t.td, fontWeight: 700, color: "#7c3aed" }}>{totalNos}</td>
//////                                <td style={{ ...t.td, fontWeight: 700, color: "#16a34a" }}>{totalFP}</td>
//////                                <td style={t.td} />
//////                            </tr>
//////                        </tfoot>
//////                    </table>
//////                </div>
//////
//////                {/* Summary cards */}
//////                <div style={f.summaryRow}>
//////                    {[
//////                        { label: "Total Rows",     val: rows.length,            color: "#1e293b" },
//////                        { label: "Total W/O Sqft", val: totalSqft.toFixed(2),   color: "#2563eb" },
//////                        { label: "Total W/O Nos",  val: totalNos,               color: "#7c3aed" },
//////                        { label: "Floor Plan Qty", val: totalFP,                color: "#16a34a" },
//////                    ].map(s => (
//////                        <div key={s.label} style={f.statCard}>
//////                            <span style={f.statLabel}>{s.label}</span>
//////                            <span style={{ ...f.statVal, color: s.color }}>{s.val}</span>
//////                        </div>
//////                    ))}
//////                </div>
//////            </div>
//////
//////            {/* Bottom save */}
//////            <div style={{ textAlign: "right", paddingBottom: 40 }}>
//////                <button style={f.saveBtn} onClick={handleSave} disabled={saving}>
//////                    {saving ? <FaSpinner style={spin} /> : <FaSave />}
//////                    &nbsp;{saving ? "Saving…" : isEdit ? "Update Work Order" : "Save Work Order"}
//////                </button>
//////            </div>
//////
//////            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
//////        </div>
//////    );
//////}
//////
//////const spin = { animation: "spin 1s linear infinite" };
//////
//////const f = {
//////    wrapper:    { maxWidth: 1400, margin: "0 auto", padding: "0 0 40px" },
//////    topBar:     { display: "flex", alignItems: "center", gap: 16, marginBottom: 20, flexWrap: "wrap" },
//////    backBtn:    { display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#1d4ed8", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: 14 },
//////    title:      { flex: 1, margin: 0, fontSize: 20, fontWeight: 700, color: "#1e293b", display: "flex", alignItems: "center", gap: 12 },
//////    projectTag: { fontSize: 13, fontWeight: 600, background: "#ede9fe", color: "#7c3aed", padding: "3px 12px", borderRadius: 20 },
//////    saveBtn:    { display: "flex", alignItems: "center", gap: 6, padding: "10px 22px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 15 },
//////    card:       { background: "#fff", borderRadius: 15, border: "1px solid #e2e8f0", padding: "24px 28px", marginBottom: 24, boxShadow: "0 4px 6px rgba(0,0,0,0.04)" },
//////    sectionTitle:{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: "#1e293b", borderLeft: "4px solid #1d4ed8", paddingLeft: 10, display: "inline-block" },
//////    metaGrid:   { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 18, marginTop: 16 },
//////    field:      { display: "flex", flexDirection: "column", gap: 6 },
//////    label:      { fontSize: 13, fontWeight: 600, color: "#475569" },
//////    input:      { padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, color: "#1e293b", outline: "none" },
//////    addBtn:     { display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 600, fontSize: 13 },
//////    alert:      { padding: "12px 16px", borderRadius: 8, fontSize: 14, fontWeight: 500, display: "flex", alignItems: "center", gap: 8, marginBottom: 16 },
//////    alertOk:    { background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" },
//////    alertErr:   { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" },
//////    summaryRow: { display: "flex", gap: 16, marginTop: 20, flexWrap: "wrap" },
//////    statCard:   { background: "#f8fafc", borderRadius: 10, padding: "14px 24px", textAlign: "center", minWidth: 130, border: "1px solid #e2e8f0" },
//////    statLabel:  { display: "block", fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 4 },
//////    statVal:    { fontSize: 22, fontWeight: 700 },
//////    center:     { padding: 40, textAlign: "center", color: "#94a3b8" },
//////};
//////
//////const t = {
//////    table:    { width: "100%", borderCollapse: "collapse", fontSize: 13 },
//////    headRow:  { background: "#1e1b4b" },
//////    th:       { padding: "11px 8px", color: "#e2e8f0", fontWeight: 600, textAlign: "center", whiteSpace: "nowrap" },
//////    td:       { padding: "5px 6px", borderBottom: "1px solid #f1f5f9", textAlign: "center" },
//////    rowEven:  { background: "#fff" },
//////    rowOdd:   { background: "#f8fafc" },
//////    footRow:  { background: "#eff6ff", borderTop: "2px solid #bfdbfe" },
//////    cell:     { width: "100%", padding: "7px 6px", border: "1px solid #e2e8f0", borderRadius: 6, textAlign: "center", fontSize: 13, color: "#1e293b", background: "#fff", outline: "none" },
//////    cellRO:   { background: "#f1f5f9", color: "#94a3b8", cursor: "not-allowed" },
//////    delBtn:   { background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 15, padding: 4 },
//////};
////
////
////
////    import React, { useState, useEffect } from "react";
////    import { useNavigate, useParams, useSearchParams } from "react-router-dom";
////    import {
////        FaPlus, FaTrash, FaSave,
////        FaCheckCircle, FaExclamationTriangle, FaSpinner,
////    } from "react-icons/fa";
////
////    // ── Calculations ──────────────────────────────────────────────────────────────
////    function calcSqft(length, height) {
////        const l = parseFloat(length);
////        const h = parseFloat(height);
////        if (isNaN(l) || l <= 0 || isNaN(h) || h <= 0) return "";
////        return ((l * h) / 1_000_000 * 10.764).toFixed(4);
////    }
////
////    function convertWoQty(rawValue, woQtyUnit) {
////        const v = parseFloat(rawValue);
////        if (isNaN(v) || v <= 0) return "";
////        return woQtyUnit === "sqm" ? (v * 10.764).toFixed(4) : v.toFixed(4);
////    }
////
////    function calcWoQtyNos(woQtySqft, sqft) {
////        const qty  = parseFloat(woQtySqft);
////        const area = parseFloat(sqft);
////        if (isNaN(qty) || isNaN(area) || area <= 0) return "";
////        return Math.floor(qty / area).toString();
////    }
////
////    // ── Empty row ─────────────────────────────────────────────────────────────────
////    const emptyRow = () => ({
////        _id:          Date.now() + Math.random(),
////        srNo:         "",
////        location:     "",
////        windowCode:   "",
////        typology:     "",
////        series:       "",
////        length:       "",
////        height:       "",
////        sqft:         "",        // auto: L × H ÷ 1,000,000 × 10.764
////        woQtySqftRaw: "",        // user entry (sqft or sqm)
////        woQtySqft:    "",        // converted to sqft
////        woQtyNos:     "",        // auto: floor(woQtySqft / sqft)
////        floorPlanQty: "",
////    });
////
////    // ── Component ─────────────────────────────────────────────────────────────────
////    export default function WorkOrderFormPage() {
////        const navigate       = useNavigate();
////        const { id }         = useParams();
////        const [searchParams] = useSearchParams();
////        const projectFromUrl = searchParams.get("project") || "";
////        const isEdit         = Boolean(id);
////
////        const [workOrderNo, setWorkOrderNo] = useState("");
////        const [projectName, setProjectName] = useState(projectFromUrl);
////        const [date,        setDate]        = useState(new Date().toISOString().split("T")[0]);
////        const [woQtyUnit,   setWoQtyUnit]   = useState("sqft");
////        const [rows,        setRows]        = useState([emptyRow()]);
////        const [saving,      setSaving]      = useState(false);
////        const [loading,     setLoading]     = useState(isEdit);
////        const [saveMsg,     setSaveMsg]     = useState(null);
////
////        const isSqm = woQtyUnit === "sqm";
////
////        // ── Load WO for editing ───────────────────────────────────────────────────
////        useEffect(() => {
////            if (!isEdit) return;
////            (async () => {
////                try {
////                    const res  = await fetch(`${process.env.REACT_APP_API_URL}/api/work-orders/${id}`);
////                    const data = await res.json();
////                    setWorkOrderNo(data.workOrderNo || "");
////                    setProjectName(data.projectName || "");
////                    setDate(data.date || "");
////                    if (data.items?.[0]?.woQtyUnit) setWoQtyUnit(data.items[0].woQtyUnit);
////                    setRows(
////                        (data.items || []).map(i => ({
////                            _id:          Date.now() + Math.random(),
////                            srNo:         i.srNo         || "",
////                            location:     i.location     || "",
////                            windowCode:   i.windowCode   || "",
////                            typology:     i.typology     || "",
////                            series:       i.series       || "",
////                            length:       i.length       ?? "",
////                            height:       i.height       ?? "",
////                            sqft:         i.sqft         ?? "",
////                            woQtySqftRaw: i.woQtySqftRaw ?? i.woQtySqft ?? "",
////                            woQtySqft:    i.woQtySqft    ?? "",
////                            woQtyNos:     i.woQtyNos     ?? "",
////                            floorPlanQty: i.floorPlanQty ?? "",
////                        }))
////                    );
////                } catch {
////                    setSaveMsg({ type: "error", text: "Failed to load work order." });
////                } finally {
////                    setLoading(false);
////                }
////            })();
////        }, [id, isEdit]);
////
////        // ── Re-convert when unit changes ─────────────────────────────────────────
////        useEffect(() => {
////            setRows(prev => prev.map(row => {
////                const converted = convertWoQty(row.woQtySqftRaw, woQtyUnit);
////                return { ...row, woQtySqft: converted, woQtyNos: calcWoQtyNos(converted, row.sqft) };
////            }));
////        }, [woQtyUnit]);
////
////        // ── Row operations ────────────────────────────────────────────────────────
////        const addRow    = () => setRows(r => [...r, emptyRow()]);
////        const deleteRow = (_id) => setRows(r => r.filter(row => row._id !== _id));
////
////        const updateRow = (_id, field, value) =>
////            setRows(prev => prev.map(row => {
////                if (row._id !== _id) return row;
////                const u = { ...row, [field]: value };
////                if (field === "length" || field === "height") {
////                    u.sqft     = calcSqft(u.length, u.height);
////                    u.woQtyNos = calcWoQtyNos(u.woQtySqft, u.sqft);
////                }
////                if (field === "woQtySqftRaw") {
////                    u.woQtySqft = convertWoQty(value, woQtyUnit);
////                    u.woQtyNos  = calcWoQtyNos(u.woQtySqft, u.sqft);
////                }
////                return u;
////            }));
////
////        // ── Save ──────────────────────────────────────────────────────────────────
////        const handleSave = async () => {
////            if (!workOrderNo.trim()) { setSaveMsg({ type: "error", text: "Work Order No. is required." }); return; }
////            if (!projectName.trim()) { setSaveMsg({ type: "error", text: "Project Name is required."   }); return; }
////            const valid = rows.filter(r => r.srNo || r.location || r.windowCode || r.length);
////            if (!valid.length) { setSaveMsg({ type: "error", text: "Add at least one row." }); return; }
////
////            setSaving(true); setSaveMsg(null);
////            const payload = {
////                workOrderNo, projectName, date,
////                items: valid.map(({ _id, woQtySqftRaw, ...rest }) => ({ ...rest, woQtyUnit, woQtySqftRaw })),
////            };
////            try {
////                const res  = await fetch(
////                    `${process.env.REACT_APP_API_URL}/api/work-orders${isEdit ? `/${id}` : ""}`,
////                    { method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
////                );
////                const data = await res.json();
////                if (!res.ok) throw new Error(data.message || "Server error");
////                setSaveMsg({ type: "success", text: `Work order ${isEdit ? "updated" : "saved"} successfully.` });
////                setTimeout(() => navigate("/coordinator-dashboard/work-orders"), 1400);
////            } catch (err) {
////                setSaveMsg({ type: "error", text: err.message });
////            } finally {
////                setSaving(false);
////            }
////        };
////
////        // ── Totals ────────────────────────────────────────────────────────────────
////        const totalSqft = rows.reduce((s, r) => s + (parseFloat(r.woQtySqft)    || 0), 0);
////        const totalNos  = rows.reduce((s, r) => s + (parseInt(r.woQtyNos)       || 0), 0);
////        const totalFP   = rows.reduce((s, r) => s + (parseFloat(r.floorPlanQty) || 0), 0);
////
////        if (loading) return <div style={css.loadingWrap}><FaSpinner style={spinStyle} /> Loading…</div>;
////
////        // ── Column definitions ────────────────────────────────────────────────────
////        // W/O Qty Converted (Sqft) column only appears when unit = sqm
////        const COLS = [
////            { key: "srNo",         label: "Sr. No",       type: "text",   w: 64  },
////            { key: "location",     label: "Location",      type: "text",   w: 120 },
////            { key: "windowCode",   label: "Window Code",   type: "text",   w: 108 },
////            { key: "typology",     label: "Typology",      type: "text",   w: 108 },
////            { key: "series",       label: "Series",        type: "text",   w: 96  },
////            { key: "length",       label: "Length (mm)",   type: "number", w: 100 },
////            { key: "height",       label: "Height (mm)",   type: "number", w: 100 },
////            { key: "sqft",         label: "Sqft",          type: "number", w: 108, auto: true  },
////            { key: "woQtySqftRaw", label: "W/O Qty",       type: "number", w: 108, hasUnit: true },
////            ...(isSqm ? [{ key: "woQtySqft", label: "W/O Order Converted Sqft", type: "number", w: 160, auto: true, converted: true }] : []),
////            { key: "woQtyNos",     label: "W/O Qty (Nos)", type: "number", w: 108, auto: true  },
////            { key: "floorPlanQty", label: "Floor Plan Qty",type: "number", w: 116 },
////        ];
////
////        // tfoot colspans
////        const colsBefore = 8;                    // Sr.No … Sqft
////        const colsAfter  = isSqm ? 4 : 3;       // converted? + Nos + FP + action
////
////        return (
////            <div style={css.page}>
////                <style>{`
////                    @keyframes spin { to { transform: rotate(360deg); } }
////                    .wo-row:hover { background: #f8fafc !important; }
////                    .wo-del-btn:hover { color: #b91c1c !important; background: #fef2f2 !important; }
////                    .wo-add-btn:hover { background: #1d4ed8 !important; }
////                    .wo-save-btn:hover { background: #15803d !important; }
////                    .wo-unit-pill:hover { background: #e2e8f0 !important; }
////                    .wo-unit-pill.active { background: #1e293b !important; color: #fff !important; }
////                    input[type=number]::-webkit-inner-spin-button,
////                    input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
////                    input[type=number] { -moz-appearance: textfield; }
////                `}</style>
////
////                {/* ── Page header ───────────────────────────────────────────── */}
////                <div style={css.pageHeader}>
////                    <div style={css.headerLeft}>
////                        {/* Back breadcrumb */}
////                        <button
////                            style={css.backBtn}
////                            onClick={() => navigate("/coordinator-dashboard/work-orders")}
////                        >
////                            ← Work Orders
////                        </button>
////
////                        {/* Title block */}
////                        <div style={css.titleBlock}>
////                            <h1 style={css.pageTitle}>
////                                {isEdit ? "Edit Work Order" : "New Work Order"}
////                            </h1>
////                            {projectName && (
////                                <div style={css.projectLine}>
////                                    <span style={css.projectDot} />
////                                    {projectName}
////                                </div>
////                            )}
////                        </div>
////                    </div>
////
////                    {/* Save button */}
////                    <button
////                        className="wo-save-btn"
////                        style={css.saveBtn}
////                        onClick={handleSave}
////                        disabled={saving}
////                    >
////                        {saving ? <FaSpinner style={spinStyle} /> : <FaSave style={{ fontSize: 14 }} />}
////                        <span>{saving ? "Saving…" : isEdit ? "Update" : "Save Work Order"}</span>
////                    </button>
////                </div>
////
////                {/* ── Toast ─────────────────────────────────────────────────── */}
////                {saveMsg && (
////                    <div style={{ ...css.toast, ...(saveMsg.type === "success" ? css.toastOk : css.toastErr) }}>
////                        {saveMsg.type === "success"
////                            ? <FaCheckCircle style={{ flexShrink: 0 }} />
////                            : <FaExclamationTriangle style={{ flexShrink: 0 }} />}
////                        <span>{saveMsg.text}</span>
////                    </div>
////                )}
////
////                {/* ── Details card ──────────────────────────────────────────── */}
////                <div style={css.card}>
////                    <p style={css.cardLabel}>Work Order Details</p>
////                    <div style={css.detailsGrid}>
////                        <div style={css.fieldWrap}>
////                            <label style={css.fieldLabel}>Work Order No. <span style={css.req}>*</span></label>
////                            <input
////                                style={{ ...css.fieldInput, ...(isEdit ? css.fieldInputDisabled : {}) }}
////                                value={workOrderNo}
////                                onChange={e => setWorkOrderNo(e.target.value)}
////                                placeholder="e.g. WO-2026-001"
////                                disabled={isEdit}
////                            />
////                        </div>
////                        <div style={css.fieldWrap}>
////                            <label style={css.fieldLabel}>Project Name</label>
////                            <div style={css.fieldStatic}>{projectName || <span style={{ color: "#94a3b8" }}>—</span>}</div>
////                        </div>
////                        <div style={css.fieldWrap}>
////                            <label style={css.fieldLabel}>Date</label>
////                            <input
////                                style={css.fieldInput}
////                                type="date"
////                                value={date}
////                                onChange={e => setDate(e.target.value)}
////                            />
////                        </div>
////                    </div>
////                </div>
////
////                {/* ── Items card ────────────────────────────────────────────── */}
////                <div style={css.card}>
////                    {/* Card toolbar */}
////                    <div style={css.tableToolbar}>
////                        <div style={css.tableToolbarLeft}>
////                            <p style={css.cardLabel}>Work Order Items</p>
////                            <span style={css.rowCount}>{rows.length} row{rows.length !== 1 ? "s" : ""}</span>
////                        </div>
////                        <button className="wo-add-btn" style={css.addBtn} onClick={addRow}>
////                            <FaPlus style={{ fontSize: 11 }} />
////                            <span>Add Row</span>
////                        </button>
////                    </div>
////
////                    {/* Table */}
////                    <div style={css.tableWrap}>
////                        <table style={css.table}>
////                            <thead>
////                                <tr>
////                                    {COLS.map(c => (
////                                        <th key={c.key} style={{ ...css.th, minWidth: c.w, maxWidth: c.w }}>
////                                            {/* W/O Qty column header has an inline unit toggle */}
////                                            {c.hasUnit ? (
////                                                <div style={css.thWithUnit}>
////                                                    <span style={css.thLabel}>W/O Qty</span>
////                                                    <div style={css.unitPills}>
////                                                        {["sqft", "sqm"].map(u => (
////                                                            <button
////                                                                key={u}
////                                                                className={`wo-unit-pill${woQtyUnit === u ? " active" : ""}`}
////                                                                style={css.unitPill}
////                                                                onClick={() => setWoQtyUnit(u)}
////                                                            >
////                                                                {u}
////                                                            </button>
////                                                        ))}
////                                                    </div>
////                                                </div>
////                                            ) : c.auto ? (
////                                                <div style={css.thAuto}>
////                                                    <span style={css.thLabel}>{c.label}</span>
////                                                    <span style={css.autoTag}>auto</span>
////                                                </div>
////                                            ) : (
////                                                <span style={css.thLabel}>{c.label}</span>
////                                            )}
////                                        </th>
////                                    ))}
////                                    <th style={{ ...css.th, minWidth: 44, maxWidth: 44 }} />
////                                </tr>
////                            </thead>
////
////                            <tbody>
////                                {rows.map((row, idx) => (
////                                    <tr key={row._id} className="wo-row" style={css.tr}>
////                                        {COLS.map(c => {
////                                            const isAuto      = c.auto;
////                                            const isConverted = c.converted;
////                                            const hasVal      = Boolean(row[c.key]);
////                                            return (
////                                                <td key={c.key} style={css.td}>
////                                                    <input
////                                                        style={{
////                                                            ...css.cell,
////                                                            ...(isAuto && !isConverted ? css.cellAuto : {}),
////                                                            ...(isConverted ? css.cellConverted : {}),
////                                                            ...(c.key === "woQtyNos" && hasVal ? css.cellNos : {}),
////                                                        }}
////                                                        type={c.type}
////                                                        value={row[c.key]}
////                                                        readOnly={isAuto}
////                                                        placeholder={c.key === "srNo" ? String(idx + 1) : ""}
////                                                        onChange={e => updateRow(row._id, c.key, e.target.value)}
////                                                    />
////                                                </td>
////                                            );
////                                        })}
////                                        <td style={{ ...css.td, textAlign: "center" }}>
////                                            <button
////                                                className="wo-del-btn"
////                                                style={css.delBtn}
////                                                onClick={() => deleteRow(row._id)}
////                                                title="Remove row"
////                                            >
////                                                <FaTrash style={{ fontSize: 12 }} />
////                                            </button>
////                                        </td>
////                                    </tr>
////                                ))}
////                            </tbody>
////
////                            <tfoot>
////                                <tr style={css.tfootRow}>
////                                    <td colSpan={colsBefore} style={css.tfootLabel}>Totals</td>
////                                    {/* W/O Qty raw — no total shown */}
////                                    <td style={css.tfootCell} />
////                                    {/* Converted col total — only when sqm */}
////                                    {isSqm && (
////                                        <td style={{ ...css.tfootCell, ...css.tfootConverted }}>
////                                            {totalSqft.toFixed(2)}
////                                        </td>
////                                    )}
////                                    {/* Nos total */}
////                                    <td style={{ ...css.tfootCell, ...css.tfootNos }}>{totalNos}</td>
////                                    {/* Floor plan total */}
////                                    <td style={{ ...css.tfootCell, color: "#059669", fontWeight: 600 }}>{totalFP}</td>
////                                    {/* Action column */}
////                                    <td style={css.tfootCell} />
////                                </tr>
////                            </tfoot>
////                        </table>
////                    </div>
////
////                    {/* Summary strip */}
////                    <div style={css.summaryStrip}>
////                        {[
////                            { label: "Rows",           val: rows.length,             accent: "#64748b" },
////                            { label: "W/O Qty Unit",   val: woQtyUnit.toUpperCase(), accent: "#2563eb" },
////                            { label: "Total W/O Sqft", val: totalSqft.toFixed(2),   accent: "#0891b2" },
////                            { label: "Total W/O Nos",  val: totalNos,                accent: "#7c3aed" },
////                            { label: "Floor Plan Qty", val: totalFP,                 accent: "#059669" },
////                        ].map(s => (
////                            <div key={s.label} style={css.summaryItem}>
////                                <span style={css.summaryLabel}>{s.label}</span>
////                                <span style={{ ...css.summaryVal, color: s.accent }}>{s.val}</span>
////                            </div>
////                        ))}
////                    </div>
////                </div>
////
////                {/* ── Bottom save ───────────────────────────────────────────── */}
////                <div style={css.bottomBar}>
////                    <button
////                        className="wo-save-btn"
////                        style={css.saveBtn}
////                        onClick={handleSave}
////                        disabled={saving}
////                    >
////                        {saving ? <FaSpinner style={spinStyle} /> : <FaSave style={{ fontSize: 14 }} />}
////                        <span>{saving ? "Saving…" : isEdit ? "Update Work Order" : "Save Work Order"}</span>
////                    </button>
////                </div>
////            </div>
////        );
////    }
////
////    // ── Styles ────────────────────────────────────────────────────────────────────
////    const spinStyle = { animation: "spin 0.9s linear infinite" };
////
////    const css = {
////        // Layout
////        page:        { maxWidth: 1440, margin: "0 auto", padding: "0 0 56px", fontFamily: "inherit" },
////        loadingWrap: { display: "flex", alignItems: "center", gap: 10, padding: 48, color: "#94a3b8", fontSize: 14 },
////
////        // Page header
////        pageHeader:  { display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, padding: "28px 0 24px", flexWrap: "wrap" },
////        headerLeft:  { display: "flex", flexDirection: "column", gap: 6 },
////        backBtn:     { background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 12, color: "#94a3b8", letterSpacing: "0.01em", width: "fit-content", marginBottom: 2 },
////        titleBlock:  { display: "flex", flexDirection: "column", gap: 4 },
////        pageTitle:   { margin: 0, fontSize: 22, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.3px" },
////        projectLine: { display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "#475569", fontWeight: 500 },
////        projectDot:  { width: 6, height: 6, borderRadius: "50%", background: "#6366f1", flexShrink: 0 },
////
////        // Save button
////        saveBtn:     { display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14, transition: "background 0.15s" },
////
////        // Toast
////        toast:       { display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500, marginBottom: 20, border: "1px solid" },
////        toastOk:     { background: "#f0fdf4", color: "#15803d", borderColor: "#bbf7d0" },
////        toastErr:    { background: "#fef2f2", color: "#dc2626", borderColor: "#fecaca" },
////
////        // Card
////        card:        { background: "#ffffff", borderRadius: 12, border: "1px solid #e2e8f0", marginBottom: 20, overflow: "hidden" },
////        cardLabel:   { margin: "0 0 16px", padding: "20px 24px 0", fontSize: 13, fontWeight: 600, color: "#64748b", letterSpacing: "0.04em", textTransform: "uppercase" },
////
////        // Details grid
////        detailsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 20, padding: "0 24px 24px" },
////        fieldWrap:   { display: "flex", flexDirection: "column", gap: 6 },
////        fieldLabel:  { fontSize: 12, fontWeight: 600, color: "#475569", letterSpacing: "0.02em" },
////        req:         { color: "#ef4444" },
////        fieldInput:  { padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, color: "#0f172a", background: "#fff", outline: "none", transition: "border-color 0.15s" },
////        fieldInputDisabled: { background: "#f8fafc", color: "#94a3b8", cursor: "not-allowed" },
////        fieldStatic: { padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, color: "#0f172a", background: "#f8fafc", fontWeight: 600 },
////
////        // Table toolbar
////        tableToolbar:     { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 14px", borderBottom: "1px solid #f1f5f9" },
////        tableToolbarLeft: { display: "flex", alignItems: "baseline", gap: 10 },
////        rowCount:         { fontSize: 12, color: "#94a3b8", fontWeight: 500 },
////        addBtn:           { display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 600, fontSize: 13, transition: "background 0.15s" },
////
////        // Table
////        tableWrap: { overflowX: "auto" },
////        table:     { width: "100%", borderCollapse: "collapse", fontSize: 13 },
////
////        // Table header
////        th: {
////            padding: "0 8px",
////            height: 46,
////            background: "#0f172a",
////            color: "#e2e8f0",
////            fontWeight: 600,
////            textAlign: "left",
////            fontSize: 12,
////            letterSpacing: "0.02em",
////            whiteSpace: "nowrap",
////            borderRight: "1px solid #1e293b",
////            verticalAlign: "middle",
////        },
////        thLabel:    { display: "block", lineHeight: 1.3 },
////        thAuto:     { display: "flex", flexDirection: "column", gap: 3 },
////        autoTag:    { fontSize: 9, fontWeight: 700, color: "#6366f1", letterSpacing: "0.06em", textTransform: "uppercase" },
////
////        // Unit pills inside th
////        thWithUnit: { display: "flex", flexDirection: "column", gap: 5, padding: "4px 0" },
////        unitPills:  { display: "flex", gap: 3 },
////        unitPill:   {
////            fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 4,
////            border: "none", cursor: "pointer", background: "#1e293b", color: "#94a3b8",
////            letterSpacing: "0.03em", transition: "background 0.15s, color 0.15s",
////        },
////
////        // Rows
////        tr: { borderBottom: "1px solid #f1f5f9", transition: "background 0.1s" },
////        td: { padding: "4px 6px", verticalAlign: "middle" },
////
////        // Cells
////        cell: {
////            width: "100%", padding: "7px 8px",
////            border: "1px solid #e8ecf0", borderRadius: 6,
////            fontSize: 13, color: "#0f172a",
////            background: "#fff", outline: "none",
////            textAlign: "right",
////            transition: "border-color 0.15s",
////        },
////        cellAuto: {
////            background: "#f8fafc", color: "#64748b",
////            cursor: "not-allowed", fontWeight: 500,
////            borderColor: "transparent",
////            textAlign: "right",
////        },
////        cellConverted: {
////            background: "#eff6ff", color: "#2563eb",
////            cursor: "not-allowed", fontWeight: 600,
////            border: "1px solid #bfdbfe",
////            textAlign: "right",
////        },
////        cellNos: {
////            background: "#faf5ff", color: "#7c3aed",
////            fontWeight: 700,
////            border: "1px solid #e9d5ff",
////            textAlign: "right",
////        },
////
////        // Delete button
////        delBtn: {
////            display: "inline-flex", alignItems: "center", justifyContent: "center",
////            width: 28, height: 28, borderRadius: 6,
////            background: "none", border: "none",
////            color: "#cbd5e1", cursor: "pointer",
////            transition: "color 0.15s, background 0.15s",
////        },
////
////        // Tfoot
////        tfootRow:      { background: "#f8fafc", borderTop: "2px solid #e2e8f0" },
////        tfootLabel:    { padding: "10px 16px", fontWeight: 700, fontSize: 12, color: "#475569", textAlign: "left", letterSpacing: "0.02em" },
////        tfootCell:     { padding: "10px 14px", fontSize: 13, textAlign: "right", color: "#64748b" },
////        tfootConverted:{ color: "#2563eb", fontWeight: 700 },
////        tfootNos:      { color: "#7c3aed", fontWeight: 700 },
////
////        // Summary strip
////        summaryStrip: { display: "flex", gap: 0, borderTop: "1px solid #f1f5f9" },
////        summaryItem:  { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "14px 8px", borderRight: "1px solid #f1f5f9" },
////        summaryLabel: { fontSize: 11, color: "#94a3b8", fontWeight: 500, letterSpacing: "0.03em", marginBottom: 4, textTransform: "uppercase" },
////        summaryVal:   { fontSize: 18, fontWeight: 700 },
////
////        // Bottom bar
////        bottomBar: { display: "flex", justifyContent: "flex-end", paddingTop: 8 },
////    };
//
//
//import React, { useState, useEffect } from "react";
//import { useNavigate, useParams, useSearchParams } from "react-router-dom";
//import {
//    FaPlus, FaTrash, FaSave, FaArrowLeft,
//    FaCheckCircle, FaExclamationTriangle, FaSpinner
//} from "react-icons/fa";
//
//// ── Unit options ──────────────────────────────────────────────────────────────
//const UNITS = ["mm", "inches", "ft", "meters", "sqft"];
//
//// ── Sqft formula per unit ─────────────────────────────────────────────────────
//// mm      → (L × H) / 1,000,000 × 10.764
//// inches  → (L × H) / 144
//// ft      → L × H
//// meters  → L × H × 10.764
//// sqft    → user types directly, no auto calc
//const computeSqft = (length, height, unit) => {
//    const l = parseFloat(length);
//    const h = parseFloat(height);
//    if (isNaN(l) || isNaN(h) || l <= 0 || h <= 0) return "";
//    switch (unit) {
//        case "mm":     return ((l * h) / 1_000_000 * 10.764).toFixed(4);
//        case "inches": return ((l * h) / 144).toFixed(4);
//        case "ft":     return (l * h).toFixed(4);
//        case "meters": return (l * h * 10.764).toFixed(4);
//        default:       return ""; // sqft — user enters directly
//    }
//};
//
//// ── Helpers ───────────────────────────────────────────────────────────────────
//const emptyRow = () => ({
//    _id:          Date.now() + Math.random(),
//    srNo:         "",
//    location:     "",
//    windowCode:   "",
//    typology:     "",
//    series:       "",
//    unit:         "mm",   // default unit per row
//    length:       "",
//    height:       "",
//    sqft:         "",
//    woQtySqft:    "",
//    woQtyNos:     "",
//    floorPlanQty: "",
//});
//
//const itemToRow = (i) => ({
//    _id:          Date.now() + Math.random(),
//    srNo:         i.srNo         || "",
//    location:     i.location     || "",
//    windowCode:   i.windowCode   || "",
//    typology:     i.typology     || "",
//    series:       i.series       || "",
//    unit:         i.unit         || "mm",
//    length:       i.length       ?? "",
//    height:       i.height       ?? "",
//    sqft:         i.sqft         ?? "",
//    woQtySqft:    i.woQtySqft    ?? "",
//    woQtyNos:     i.woQtyNos     ?? "",
//    floorPlanQty: i.floorPlanQty ?? "",
//});
//
//// ── Component ─────────────────────────────────────────────────────────────────
//export default function WorkOrderFormPage() {
//    const navigate       = useNavigate();
//    const { id }         = useParams();
//    const [searchParams] = useSearchParams();
//    const projectFromUrl = searchParams.get("project") || "";
//
//    const isEdit = Boolean(id);
//
//    const [workOrderNo, setWorkOrderNo] = useState("");
//    const [projectName, setProjectName] = useState(projectFromUrl);
//    const [date,        setDate]        = useState(new Date().toISOString().split("T")[0]);
//    const [rows,        setRows]        = useState([emptyRow()]);
//    const [saving,      setSaving]      = useState(false);
//    const [loading,     setLoading]     = useState(isEdit);
//    const [saveMsg,     setSaveMsg]     = useState(null);
//
//    // ── Load existing WO when editing ─────────────────────────────────────────
//    useEffect(() => {
//        if (!isEdit) return;
//        const load = async () => {
//            try {
//                const res  = await fetch(`${process.env.REACT_APP_API_URL}/api/work-orders/${id}`);
//                const data = await res.json();
//                setWorkOrderNo(data.workOrderNo || "");
//                setProjectName(data.projectName || "");
//                setDate(data.date               || "");
//                setRows((data.items || []).map(itemToRow));
//            } catch {
//                setSaveMsg({ type: "error", text: "Failed to load work order." });
//            } finally {
//                setLoading(false);
//            }
//        };
//        load();
//    }, [id, isEdit]);
//
//    // ── Row operations ────────────────────────────────────────────────────────
//    const addRow    = () => setRows(r => [...r, emptyRow()]);
//    const deleteRow = (_id) => setRows(r => r.filter(row => row._id !== _id));
//
//    const updateRow = (_id, field, value) =>
//        setRows(prev => prev.map(row => {
//            if (row._id !== _id) return row;
//            const updated = { ...row, [field]: value };
//
//            // When unit changes TO sqft: disable length/height, clear sqft for fresh input
//            if (field === "unit" && value === "sqft") {
//                updated.sqft = "";
//                return updated;
//            }
//
//            // When unit changes FROM sqft to something else: recalculate
//            if (field === "unit" && value !== "sqft") {
//                const auto = computeSqft(updated.length, updated.height, value);
//                updated.sqft      = auto;
//                updated.woQtySqft = auto;
//                return updated;
//            }
//
//            // When length or height changes (and unit is not sqft): recalculate
//            if ((field === "length" || field === "height") && updated.unit !== "sqft") {
//                const auto = computeSqft(updated.length, updated.height, updated.unit);
//                updated.sqft      = auto;
//                updated.woQtySqft = auto;
//            }
//
//            return updated;
//        }));
//
//    // ── Totals ────────────────────────────────────────────────────────────────
//    const totalSqft = rows.reduce((s, r) => s + (parseFloat(r.woQtySqft)    || 0), 0);
//    const totalNos  = rows.reduce((s, r) => s + (parseFloat(r.woQtyNos)     || 0), 0);
//    const totalFP   = rows.reduce((s, r) => s + (parseFloat(r.floorPlanQty) || 0), 0);
//
//    // ── Save ──────────────────────────────────────────────────────────────────
//    const handleSave = async () => {
//        if (!workOrderNo.trim()) { setSaveMsg({ type: "error", text: "Work Order No. is required." }); return; }
//        if (!projectName.trim()) { setSaveMsg({ type: "error", text: "Project Name is required."  }); return; }
//
//        const validRows = rows.filter(r => r.srNo || r.location || r.windowCode || r.length);
//        if (!validRows.length) { setSaveMsg({ type: "error", text: "Add at least one row." }); return; }
//
//        setSaving(true);
//        setSaveMsg(null);
//
//        const payload = {
//            workOrderNo,
//            projectName,
//            date,
//            items: validRows.map(({ _id, ...rest }) => rest),
//        };
//
//        try {
//            const url    = isEdit
//                ? `${process.env.REACT_APP_API_URL}/api/work-orders/${id}`
//                : `${process.env.REACT_APP_API_URL}/api/work-orders`;
//            const method = isEdit ? "PUT" : "POST";
//
//            const res  = await fetch(url, {
//                method,
//                headers: { "Content-Type": "application/json" },
//                body: JSON.stringify(payload),
//            });
//            const data = await res.json();
//            if (!res.ok) throw new Error(data.message || "Server error");
//
//            setSaveMsg({ type: "success", text: `✅ Work Order ${isEdit ? "updated" : "saved"} successfully!` });
//            setTimeout(() => navigate("/coordinator-dashboard/work-orders"), 1200);
//        } catch (err) {
//            setSaveMsg({ type: "error", text: `❌ ${err.message}` });
//        } finally {
//            setSaving(false);
//        }
//    };
//
//    if (loading) return <div style={f.center}>Loading work order…</div>;
//
//    // ── Column definitions ────────────────────────────────────────────────────
//    const COLS = [
//        { key: "srNo",         label: "Sr. No",         type: "text",   width: 65  },
//        { key: "location",     label: "Location",        type: "text",   width: 110 },
//        { key: "windowCode",   label: "Window Code",     type: "text",   width: 110 },
//        { key: "typology",     label: "Typology",        type: "text",   width: 100 },
//        { key: "series",       label: "Series",          type: "text",   width: 90  },
//        { key: "unit",         label: "Unit",            type: "unit",   width: 95  },
//        { key: "length",       label: "Length",          type: "number", width: 85  },
//        { key: "height",       label: "Height",          type: "number", width: 85  },
//        { key: "sqft",         label: "Sqft (Auto)",     type: "sqft",   width: 110 },
//        { key: "woQtySqft",    label: "W/O Qty (Sqft)",  type: "number", width: 110 },
//        { key: "woQtyNos",     label: "W/O QTY (Nos)",   type: "number", width: 100 },
//        { key: "floorPlanQty", label: "Floor Plan Qty",  type: "number", width: 110 },
//    ];
//
//    // ── Render ────────────────────────────────────────────────────────────────
//    return (
//        <div style={f.wrapper}>
//
//            {/* Top bar */}
//            <div style={f.topBar}>
//                <h1 style={f.title}>
//                    {isEdit ? "Edit Work Order" : "Create Work Order"}
//                    {projectName && <span style={f.projectTag}>{projectName}</span>}
//                </h1>
//                <button style={f.saveBtn} onClick={handleSave} disabled={saving}>
//                    {saving ? <FaSpinner style={spin} /> : <FaSave />}
//                    &nbsp;{saving ? "Saving…" : isEdit ? "Update" : "Save Work Order"}
//                </button>
//            </div>
//
//            {/* Alert */}
//            {saveMsg && (
//                <div style={{ ...f.alert, ...(saveMsg.type === "success" ? f.alertOk : f.alertErr) }}>
//                    {saveMsg.type === "success" ? <FaCheckCircle /> : <FaExclamationTriangle />}
//                    &nbsp;{saveMsg.text}
//                </div>
//            )}
//
//            {/* Work Order Details */}
//            <div style={f.card}>
//                <h2 style={f.sectionTitle}>Work Order Details</h2>
//                <div style={f.metaGrid}>
//                    <div style={f.field}>
//                        <label style={f.label}>Work Order No. *</label>
//                        <input
//                            style={f.input}
//                            value={workOrderNo}
//                            onChange={e => setWorkOrderNo(e.target.value)}
//                            placeholder="WO-2026-001"
//                            disabled={isEdit}
//                        />
//                    </div>
//                    <div style={f.field}>
//                        <label style={f.label}>Project Name *</label>
//                        <input style={{ ...f.input, background: "#f1f5f9" }} value={projectName} readOnly />
//                    </div>
//                    <div style={f.field}>
//                        <label style={f.label}>Date</label>
//                        <input style={f.input} type="date" value={date} onChange={e => setDate(e.target.value)} />
//                    </div>
//                </div>
//            </div>
//
//            {/* Formula info bar */}
//            <div style={f.formulaBar}>
//                <span style={{ fontWeight: 700, color: "#1d4ed8", whiteSpace: "nowrap" }}>📐 Sqft Formulas:</span>
//                <span style={{ color: "#1e40af", fontSize: 12, lineHeight: 1.6 }}>
//                    <b>mm</b> → (L×H) ÷ 1,000,000 × 10.764 &nbsp;|&nbsp;
//                    <b>inches</b> → (L×H) ÷ 144 &nbsp;|&nbsp;
//                    <b>ft</b> → L×H &nbsp;|&nbsp;
//                    <b>meters</b> → L×H × 10.764 &nbsp;|&nbsp;
//                    <b>sqft</b> → entered directly <em>(L &amp; H disabled)</em>
//                </span>
//            </div>
//
//            {/* Items Table */}
//            <div style={f.card}>
//                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
//                    <h2 style={f.sectionTitle}>Work Order Items</h2>
//                    <button style={f.addBtn} onClick={addRow}><FaPlus />&nbsp;Add Row</button>
//                </div>
//
//                <div style={{ overflowX: "auto" }}>
//                    <table style={t.table}>
//                        <thead>
//                            <tr style={t.headRow}>
//                                {COLS.map(c => (
//                                    <th key={c.key} style={{ ...t.th, minWidth: c.width }}>{c.label}</th>
//                                ))}
//                                <th style={{ ...t.th, minWidth: 50 }}>Del</th>
//                            </tr>
//                        </thead>
//                        <tbody>
//                            {rows.map((row, idx) => {
//                                const isSqftUnit = row.unit === "sqft";
//                                return (
//                                    <tr key={row._id} style={idx % 2 === 0 ? t.rowEven : t.rowOdd}>
//                                        {COLS.map(col => {
//
//                                            /* ── Unit dropdown ─────────────────────────── */
//                                            if (col.type === "unit") return (
//                                                <td key={col.key} style={t.td}>
//                                                    <select
//                                                        style={t.select}
//                                                        value={row.unit}
//                                                        onChange={e => updateRow(row._id, "unit", e.target.value)}
//                                                    >
//                                                        {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
//                                                    </select>
//                                                </td>
//                                            );
//
//                                            /* ── Length ────────────────────────────────── */
//                                            if (col.key === "length") return (
//                                                <td key={col.key} style={t.td}>
//                                                    <input
//                                                        style={{ ...t.cell, ...(isSqftUnit ? t.cellDisabled : {}) }}
//                                                        type="number"
//                                                        value={row.length}
//                                                        readOnly={isSqftUnit}
//                                                        placeholder={isSqftUnit ? "—" : "0"}
//                                                        onChange={e => updateRow(row._id, "length", e.target.value)}
//                                                    />
//                                                    {!isSqftUnit && <div style={t.hint}>{row.unit}</div>}
//                                                </td>
//                                            );
//
//                                            /* ── Height ────────────────────────────────── */
//                                            if (col.key === "height") return (
//                                                <td key={col.key} style={t.td}>
//                                                    <input
//                                                        style={{ ...t.cell, ...(isSqftUnit ? t.cellDisabled : {}) }}
//                                                        type="number"
//                                                        value={row.height}
//                                                        readOnly={isSqftUnit}
//                                                        placeholder={isSqftUnit ? "—" : "0"}
//                                                        onChange={e => updateRow(row._id, "height", e.target.value)}
//                                                    />
//                                                    {!isSqftUnit && <div style={t.hint}>{row.unit}</div>}
//                                                </td>
//                                            );
//
//                                            /* ── Sqft (auto or direct) ─────────────────── */
//                                            if (col.type === "sqft") return (
//                                                <td key={col.key} style={t.td}>
//                                                    <input
//                                                        style={{
//                                                            ...t.cell,
//                                                            ...(isSqftUnit ? t.cellSqftDirect : t.cellRO),
//                                                        }}
//                                                        type="number"
//                                                        value={row.sqft}
//                                                        readOnly={!isSqftUnit}
//                                                        placeholder={isSqftUnit ? "Enter sqft" : "Auto"}
//                                                        onChange={e => isSqftUnit && updateRow(row._id, "sqft", e.target.value)}
//                                                    />
//                                                    <div style={t.hint}>{isSqftUnit ? "direct input" : "auto-calc"}</div>
//                                                </td>
//                                            );
//
//                                            /* ── All other cells ───────────────────────── */
//                                            return (
//                                                <td key={col.key} style={t.td}>
//                                                    <input
//                                                        style={t.cell}
//                                                        type={col.type === "number" ? "number" : "text"}
//                                                        value={row[col.key]}
//                                                        placeholder={col.key === "srNo" ? `${idx + 1}` : ""}
//                                                        onChange={e => updateRow(row._id, col.key, e.target.value)}
//                                                    />
//                                                </td>
//                                            );
//                                        })}
//
//                                        {/* Delete button */}
//                                        <td style={t.td}>
//                                            <button style={t.delBtn} onClick={() => deleteRow(row._id)}>
//                                                <FaTrash />
//                                            </button>
//                                        </td>
//                                    </tr>
//                                );
//                            })}
//                        </tbody>
//                        <tfoot>
//                            <tr style={t.footRow}>
//                                <td colSpan={8} style={{ ...t.td, fontWeight: 700, color: "#1e293b", paddingLeft: 12, textAlign: "left" }}>
//                                    Totals
//                                </td>
//                                <td style={{ ...t.td, fontWeight: 700, color: "#2563eb" }}>{totalSqft.toFixed(4)}</td>
//                                <td style={{ ...t.td, fontWeight: 700, color: "#7c3aed" }}>{totalNos}</td>
//                                <td style={{ ...t.td, fontWeight: 700, color: "#16a34a" }}>{totalFP}</td>
//                                <td style={t.td} />
//                            </tr>
//                        </tfoot>
//                    </table>
//                </div>
//
//                {/* Summary cards */}
//                <div style={f.summaryRow}>
//                    {[
//                        { label: "Total Rows",     val: rows.length,          color: "#1e293b" },
//                        { label: "Total W/O Sqft", val: totalSqft.toFixed(4), color: "#2563eb" },
//                        { label: "Total W/O Nos",  val: totalNos,             color: "#7c3aed" },
//                        { label: "Floor Plan Qty", val: totalFP,              color: "#16a34a" },
//                    ].map(s => (
//                        <div key={s.label} style={f.statCard}>
//                            <span style={f.statLabel}>{s.label}</span>
//                            <span style={{ ...f.statVal, color: s.color }}>{s.val}</span>
//                        </div>
//                    ))}
//                </div>
//            </div>
//
//            {/* Bottom save */}
//            <div style={{ textAlign: "right", paddingBottom: 40 }}>
//                <button style={f.saveBtn} onClick={handleSave} disabled={saving}>
//                    {saving ? <FaSpinner style={spin} /> : <FaSave />}
//                    &nbsp;{saving ? "Saving…" : isEdit ? "Update Work Order" : "Save Work Order"}
//                </button>
//            </div>
//
//            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
//        </div>
//    );
//}
//
//const spin = { animation: "spin 1s linear infinite" };
//
//const f = {
//    wrapper:     { maxWidth: 1500, margin: "0 auto", padding: "0 0 40px" },
//    topBar:      { display: "flex", alignItems: "center", gap: 16, marginBottom: 20, flexWrap: "wrap" },
//    title:       { flex: 1, margin: 0, fontSize: 20, fontWeight: 700, color: "#1e293b", display: "flex", alignItems: "center", gap: 12 },
//    projectTag:  { fontSize: 13, fontWeight: 600, background: "#ede9fe", color: "#7c3aed", padding: "3px 12px", borderRadius: 20 },
//    saveBtn:     { display: "flex", alignItems: "center", gap: 6, padding: "10px 22px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 15 },
//    card:        { background: "#fff", borderRadius: 15, border: "1px solid #e2e8f0", padding: "24px 28px", marginBottom: 24, boxShadow: "0 4px 6px rgba(0,0,0,0.04)" },
//    sectionTitle:{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: "#1e293b", borderLeft: "4px solid #1d4ed8", paddingLeft: 10, display: "inline-block" },
//    metaGrid:    { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 18, marginTop: 16 },
//    field:       { display: "flex", flexDirection: "column", gap: 6 },
//    label:       { fontSize: 13, fontWeight: 600, color: "#475569" },
//    input:       { padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, color: "#1e293b", outline: "none" },
//    formulaBar:  { display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "12px 18px", marginBottom: 20 },
//    addBtn:      { display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 600, fontSize: 13 },
//    alert:       { padding: "12px 16px", borderRadius: 8, fontSize: 14, fontWeight: 500, display: "flex", alignItems: "center", gap: 8, marginBottom: 16 },
//    alertOk:     { background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" },
//    alertErr:    { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" },
//    summaryRow:  { display: "flex", gap: 16, marginTop: 20, flexWrap: "wrap" },
//    statCard:    { background: "#f8fafc", borderRadius: 10, padding: "14px 24px", textAlign: "center", minWidth: 130, border: "1px solid #e2e8f0" },
//    statLabel:   { display: "block", fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 4 },
//    statVal:     { fontSize: 22, fontWeight: 700 },
//    center:      { padding: 40, textAlign: "center", color: "#94a3b8" },
//};
//
//const t = {
//    table:          { width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 1200 },
//    headRow:        { background: "#1e1b4b" },
//    th:             { padding: "11px 8px", color: "#e2e8f0", fontWeight: 600, textAlign: "center", whiteSpace: "nowrap" },
//    td:             { padding: "4px 5px", borderBottom: "1px solid #f1f5f9", textAlign: "center", verticalAlign: "top" },
//    rowEven:        { background: "#fff" },
//    rowOdd:         { background: "#f8fafc" },
//    footRow:        { background: "#eff6ff", borderTop: "2px solid #bfdbfe" },
//    cell:           { width: "100%", padding: "7px 5px", border: "1px solid #e2e8f0", borderRadius: 6, textAlign: "center", fontSize: 12, color: "#1e293b", background: "#fff", outline: "none" },
//    cellRO:         { background: "#f1f5f9", color: "#94a3b8", cursor: "not-allowed" },
//    cellDisabled:   { background: "#f8fafc", color: "#cbd5e1", cursor: "not-allowed", border: "1px solid #e2e8f0" },
//    cellSqftDirect: { background: "#fefce8", border: "1px solid #fcd34d", color: "#92400e", fontWeight: 600 },
//    select:         { width: "100%", padding: "7px 4px", border: "1px solid #c4b5fd", borderRadius: 6, fontSize: 12, color: "#5b21b6", background: "#f5f3ff", outline: "none", fontWeight: 600, cursor: "pointer" },
//    delBtn:         { background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 15, padding: 4 },
//    hint:           { fontSize: 10, color: "#94a3b8", marginTop: 2, textAlign: "center" },
//};
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
    FaPlus, FaTrash, FaSave,
    FaCheckCircle, FaExclamationTriangle, FaSpinner,
    FaRegArrowAltCircleLeft, FaLayerGroup, FaCalendarAlt, FaHashtag
} from "react-icons/fa";

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

// ── Empty row ─────────────────────────────────────────────────────────────────
const emptyRow = () => ({
    _id:          Date.now() + Math.random(),
    srNo:         "",
    location:     "",
    windowCode:   "",
    typology:     "",
    series:       "",
    length:       "",
    height:       "",
    sqft:         "",        // auto: L × H ÷ 1,000,000 × 10.764
    woQtySqftRaw: "",        // user entry (sqft or sqm)
    woQtySqft:    "",        // converted to sqft
    woQtyNos:     "",        // auto: floor(woQtySqft / sqft)
    floorPlanQty: "",
});

export default function WorkOrderFormPage() {
    const navigate       = useNavigate();
    const { id }         = useParams();
    const [searchParams] = useSearchParams();
    const projectFromUrl = searchParams.get("project") || "";
    const isEdit         = Boolean(id);

    const [workOrderNo, setWorkOrderNo] = useState("");
    const [projectName, setProjectName] = useState(projectFromUrl);
    const [date,        setDate]        = useState(new Date().toISOString().split("T")[0]);
    const [woQtyUnit,   setWoQtyUnit]   = useState("sqft");
    const [rows,        setRows]        = useState([emptyRow()]);
    const [saving,      setSaving]      = useState(false);
    const [loading,     setLoading]     = useState(isEdit);
    const [saveMsg,     setSaveMsg]     = useState(null);

    const isSqm = woQtyUnit === "sqm";

    // ── Load WO for editing ───────────────────────────────────────────────────
    useEffect(() => {
        if (!isEdit) return;
        (async () => {
            try {
                const res  = await fetch(`${process.env.REACT_APP_API_URL}/api/work-orders/${id}`);
                const data = await res.json();
                setWorkOrderNo(data.workOrderNo || "");
                setProjectName(data.projectName || "");
                setDate(data.date || "");
                if (data.items?.[0]?.woQtyUnit) setWoQtyUnit(data.items[0].woQtyUnit);
                setRows(
                    (data.items || []).map(i => ({
                        _id:          Date.now() + Math.random(),
                        srNo:         i.srNo         || "",
                        location:     i.location     || "",
                        windowCode:   i.windowCode   || "",
                        typology:     i.typology     || "",
                        series:       i.series       || "",
                        length:       i.length       ?? "",
                        height:       i.height       ?? "",
                        sqft:         i.sqft         ?? "",
                        woQtySqftRaw: i.woQtySqftRaw ?? i.woQtySqft ?? "",
                        woQtySqft:    i.woQtySqft    ?? "",
                        woQtyNos:     i.woQtyNos     ?? "",
                        floorPlanQty: i.floorPlanQty ?? "",
                    }))
                );
            } catch {
                setSaveMsg({ type: "error", text: "Failed to load structural data matrix layers." });
            } finally {
                setLoading(false);
            }
        })();
    }, [id, isEdit]);

    // ── Re-convert when unit changes ─────────────────────────────────────────
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

    // ── Save ──────────────────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!workOrderNo.trim()) { setSaveMsg({ type: "error", text: "Work Order No. configuration is required." }); return; }
        if (!projectName.trim()) { setSaveMsg({ type: "error", text: "Project tracking reference is required."   }); return; }
        const valid = rows.filter(r => r.srNo || r.location || r.windowCode || r.length);
        if (!valid.length) { setSaveMsg({ type: "error", text: "Declare at least one product parameter array entry." }); return; }

        setSaving(true); setSaveMsg(null);
        const payload = {
            workOrderNo, projectName, date,
            items: valid.map(({ _id, woQtySqftRaw, ...rest }) => ({ ...rest, woQtyUnit, woQtySqftRaw })),
        };
        try {
            const res  = await fetch(
                `${process.env.REACT_APP_API_URL}/api/work-orders${isEdit ? `/${id}` : ""}`,
                { method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Server configuration conflict encountered.");
            setSaveMsg({ type: "success", text: `Work Order processing database updated cleanly.` });
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

    if (loading) return <div style={css.loadingWrap}><FaSpinner style={spinStyle} /> Loading Workspace Config...</div>;

    // ── Column definitions ────────────────────────────────────────────────────
    const COLS = [
        { key: "srNo",         label: "Sr. No",       type: "text",   w: 60  },
        { key: "location",     label: "Location",      type: "text",   w: 130 },
        { key: "windowCode",   label: "Window Code",   type: "text",   w: 120 },
        { key: "typology",     label: "Typology",      type: "text",   w: 120 },
        { key: "series",       label: "Series",        type: "text",   w: 110 },
        { key: "length",       label: "Length (mm)",   type: "number", w: 100 },
        { key: "height",       label: "Height (mm)",   type: "number", w: 100 },
        { key: "sqft",         label: "Sqft",          type: "number", w: 110, auto: true  },
        { key: "woQtySqftRaw", label: "W/O Qty",       type: "number", w: 120, hasUnit: true },
        ...(isSqm ? [{ key: "woQtySqft", label: "W/O Order Converted Sqft", type: "number", w: 180, auto: true, converted: true }] : []),
        { key: "woQtyNos",     label: "W/O Qty (Nos)", type: "number", w: 120, auto: true  },
        { key: "floorPlanQty", label: "Floor Plan Qty",type: "number", w: 120 },
    ];

    const colsBefore = 8;
    const colsAfter  = isSqm ? 4 : 3;

    return (
        <div style={css.page}>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                .wo-row { transition: background 0.15s ease; }
                .wo-row:hover { background: #f8fafc !important; }
                .wo-del-btn { transition: all 0.15s ease; color: #94a3b8; }
                .wo-del-btn:hover { color: #ef4444 !important; background: #fef2f2 !important; border-color: #fecaca !important; }
                .wo-add-btn { transition: all 0.2s ease; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
                .wo-add-btn:hover { background: #4f46e5 !important; transform: translateY(-1px); }
                .wo-save-btn { transition: all 0.2s ease; box-shadow: 0 2px 4px rgba(5, 150, 105, 0.1); }
                .wo-save-btn:hover:not(:disabled) { background: #047857 !important; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(5, 150, 105, 0.15); }
                .wo-unit-pill { transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1); }
                .wo-unit-pill:hover:not(.active) { background: #334155 !important; color: #f8fafc !important; }
                .wo-unit-pill.active { background: #6366f1 !important; color: #ffffff !important; font-weight: 700; }
                .wo-cell-input { transition: border-color 0.15s ease, box-shadow: 0.15s ease; }
                .wo-cell-input:focus { border-color: #6366f1 !important; background: #fff !important; box-shadow: inset 0 0 0 1px #6366f1 !important; }
                .wo-meta-card-input:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.08) !important; }
                input[type=number]::-webkit-inner-spin-button,
                input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
                input[type=number] { -moz-appearance: textfield; }
            `}</style>

            {/* Top Operational Navigation bar */}
            <div style={css.pageHeader}>
                <div style={css.headerLeft}>
                    <button
                        style={css.backBtn}
                        onClick={() => navigate("/coordinator-dashboard/work-orders")}
                    >
                        <FaRegArrowAltCircleLeft /> Back to Management Listing
                    </button>

                    <div style={css.titleBlock}>
                        <h1 style={css.pageTitle}>
                            {isEdit ? "Update System Parameters" : "Generate Production Framework"}
                        </h1>
                        {projectName && (
                            <div style={css.projectLine}>
                                <span style={css.projectDot} />
                                Pipeline Context: <strong style={{ color: "#0f172a", marginLeft: 2 }}>{projectName}</strong>
                            </div>
                        )}
                    </div>
                </div>

                <button
                    className="wo-save-btn"
                    style={css.saveBtn}
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? <FaSpinner style={spinStyle} /> : <FaSave style={{ fontSize: 13 }} />}
                    <span>{saving ? "Commiting Layer Changes..." : isEdit ? "Update Framework" : "Commit Record"}</span>
                </button>
            </div>

            {/* Notification system */}
            {saveMsg && (
                <div style={{ ...css.toast, ...(saveMsg.type === "success" ? css.toastOk : css.toastErr) }}>
                    {saveMsg.type === "success"
                        ? <FaCheckCircle style={{ flexShrink: 0, fontSize: 16 }} />
                        : <FaExclamationTriangle style={{ flexShrink: 0, fontSize: 16 }} />}
                    <span>{saveMsg.text}</span>
                </div>
            )}

            {/* Metadata Reference Fields Block */}
            <div style={css.card}>
                <div style={css.cardHeader}>
                    <FaLayerGroup style={{ color: "#6366f1" }} />
                    <span style={css.cardLabel}>Deployment Details</span>
                </div>
                <div style={css.detailsGrid}>
                    <div style={css.fieldWrap}>
                        <label style={css.fieldLabel}>WORK ORDER IDENTIFIER <span style={css.req}>*</span></label>
                        <div style={css.inputIconWrapper}>
                            <FaHashtag style={css.inputIcon} />
                            <input
                                className="wo-meta-card-input"
                                style={{ ...css.fieldInput, paddingLeft: 34, ...(isEdit ? css.fieldInputDisabled : {}) }}
                                value={workOrderNo}
                                onChange={e => setWorkOrderNo(e.target.value)}
                                placeholder="e.g. WO-2026-9954"
                                disabled={isEdit}
                            />
                        </div>
                    </div>
                    <div style={css.fieldWrap}>
                        <label style={css.fieldLabel}>TARGET PROJECT ENTITY</label>
                        <div style={css.fieldStatic}>{projectName || <span style={{ color: "#94a3b8" }}>—</span>}</div>
                    </div>
                    <div style={css.fieldWrap}>
                        <label style={css.fieldLabel}>ALLOCATION TIMESTAMP</label>
                        <div style={css.inputIconWrapper}>
                            <FaCalendarAlt style={css.inputIcon} />
                            <input
                                className="wo-meta-card-input"
                                style={{ ...css.fieldInput, paddingLeft: 34 }}
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Interactive Row Grid Structure */}
            <div style={css.card}>
                <div style={css.tableToolbar}>
                    <div style={css.tableToolbarLeft}>
                        <span style={css.tableCardTitle}>Line Item Arrays</span>
                        <span style={css.rowCount}>{rows.length} Matrix Entry Rows Loaded</span>
                    </div>
                    <button className="wo-add-btn" style={css.addBtn} onClick={addRow}>
                        <FaPlus style={{ fontSize: 11 }} />
                        <span>Insert Sequence Row</span>
                    </button>
                </div>

                <div style={css.tableWrap}>
                    <table style={css.table}>
                        <thead>
                            <tr>
                                {COLS.map(c => (
                                    <th key={c.key} style={{ ...css.th, minWidth: c.w, maxWidth: c.w }}>
                                        {c.hasUnit ? (
                                            <div style={css.thWithUnit}>
                                                <span style={css.thLabel}>W/O Quantity Target</span>
                                                <div style={css.unitPills}>
                                                    {["sqft", "sqm"].map(u => (
                                                        <button
                                                            key={u}
                                                            className={`wo-unit-pill ${woQtyUnit === u ? "active" : ""}`}
                                                            style={css.unitPill}
                                                            onClick={() => setWoQtyUnit(u)}
                                                        >
                                                            {u}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : c.auto ? (
                                            <div style={css.thAuto}>
                                                <span style={css.thLabel}>{c.label}</span>
                                                <span style={css.autoTag}>Computed</span>
                                            </div>
                                        ) : (
                                            <span style={css.thLabel}>{c.label}</span>
                                        )}
                                    </th>
                                ))}
                                <th style={{ ...css.th, minWidth: 48, maxWidth: 48, textAlign: "center" }}>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {rows.map((row, idx) => (
                                <tr key={row._id} className="wo-row" style={css.tr}>
                                    {COLS.map(c => {
                                        const isAuto      = c.auto;
                                        const isConverted = c.converted;
                                        const hasVal      = Boolean(row[c.key]);
                                        return (
                                            <td key={c.key} style={css.td}>
                                                <input
                                                    className="wo-cell-input"
                                                    style={{
                                                        ...css.cell,
                                                        ...(isAuto && !isConverted ? css.cellAuto : {}),
                                                        ...(isConverted ? css.cellConverted : {}),
                                                        ...(c.key === "woQtyNos" && hasVal ? css.cellNos : {}),
                                                        textAlign: (c.type === "number" || isAuto) ? "right" : "left"
                                                    }}
                                                    type={c.type}
                                                    value={row[c.key]}
                                                    readOnly={isAuto}
                                                    placeholder={c.key === "srNo" ? String(idx + 1) : ""}
                                                    onChange={e => updateRow(row._id, c.key, e.target.value)}
                                                />
                                            </td>
                                        );
                                    })}
                                    <td style={{ ...css.td, textAlign: "center" }}>
                                        <button
                                            className="wo-del-btn"
                                            style={css.delBtn}
                                            onClick={() => deleteRow(row._id)}
                                            title="Purge row record"
                                        >
                                            <FaTrash style={{ fontSize: 11 }} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                        <tfoot>
                            <tr style={css.tfootRow}>
                                <td colSpan={colsBefore} style={css.tfootLabel}>Aggregated Summaries</td>
                                <td style={css.tfootCell} />
                                {isSqm && (
                                    <td style={{ ...css.tfootCell, ...css.tfootConverted }}>
                                        {totalSqft.toFixed(2)}
                                    </td>
                                )}
                                <td style={{ ...css.tfootCell, ...css.tfootNos }}>{totalNos}</td>
                                <td style={{ ...css.tfootCell, color: "#059669", fontWeight: 700 }}>{totalFP}</td>
                                <td style={css.tfootCell} />
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Realtime Streamlined Bottom Banner Metrics Strip */}
                <div style={css.summaryStrip}>
                    {[
                        { label: "Active Array Rows", val: rows.length,             accent: "#475569" },
                        { label: "Selected Processing Unit", val: woQtyUnit.toUpperCase(), accent: "#4f46e5" },
                        { label: "Cumulative Volume (Sqft)", val: totalSqft.toFixed(2),   accent: "#0891b2" },
                        { label: "Cumulative Count (Nos)",  val: totalNos,                accent: "#7c3aed" },
                        { label: "Target Floor plan Sum", val: totalFP,                 accent: "#059669" },
                    ].map(s => (
                        <div key={s.label} style={css.summaryItem}>
                            <span style={css.summaryLabel}>{s.label}</span>
                            <span style={{ ...css.summaryVal, color: s.accent }}>{s.val}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Form Completion Submission Row */}
            <div style={css.bottomBar}>
                <button
                    className="wo-save-btn"
                    style={css.saveBtn}
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? <FaSpinner style={spinStyle} /> : <FaSave style={{ fontSize: 13 }} />}
                    <span>{saving ? "Processing Commit..." : isEdit ? "Update Metrics Package" : "Complete Work Order Configuration"}</span>
                </button>
            </div>
        </div>
    );
}

// ── Uniform Style Token Definitions ──────────────────────────────────────────
const spinStyle = { animation: "spin 0.9s linear infinite", display: "inline-block" };

const css = {
    page: {
        maxWidth: 1440,
        margin: "0 auto",
        padding: "0 24px 56px",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    },
    loadingWrap: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: "120px 0",
        color: "#64748b",
        fontSize: 15,
        fontWeight: 500
    },
    pageHeader: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 20,
        padding: "32px 0 24px",
        flexWrap: "wrap"
    },
    headerLeft: {
        display: "flex",
        flexDirection: "column",
        gap: 8
    },
    backBtn: {
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
        fontSize: 13,
        color: "#64748b",
        fontWeight: 500,
        display: "flex",
        alignItems: "center",
        gap: 6,
        width: "fit-content",
        transition: "color 0.15s"
    },
    titleBlock: {
        display: "flex",
        flexDirection: "column",
        gap: 4
    },
    pageTitle: {
        margin: 0,
        fontSize: 24,
        fontWeight: 800,
        color: "#0f172a",
        letterSpacing: "-0.02em"
    },
    projectLine: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 13,
        color: "#475569",
        fontWeight: 500
    },
    projectDot: {
        width: 7,
        height: 7,
        borderRadius: "50%",
        background: "#6366f1",
        flexShrink: 0
    },
    saveBtn: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "11px 22px",
        background: "#10b981",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
        fontWeight: 600,
        fontSize: 13,
    },
    toast: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 18px",
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 500,
        marginBottom: 24,
        border: "1px solid"
    },
    toastOk: { background: "#ecfdf5", color: "#047857", borderColor: "#a7f3d0" },
    toastErr: { background: "#fef2f2", color: "#b91c1c", borderColor: "#fecaca" },

    card: {
        background: "#ffffff",
        borderRadius: 12,
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
        marginBottom: 24,
        overflow: "hidden"
    },
    cardHeader: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "20px 24px 0"
    },
    cardLabel: {
        margin: 0,
        fontSize: 12,
        fontWeight: 700,
        color: "#475569",
        letterSpacing: "0.05em",
        textTransform: "uppercase"
    },
    detailsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 24,
        padding: "20px 24px 24px"
    },
    fieldWrap: {
        display: "flex",
        flexDirection: "column",
        gap: 6
    },
    fieldLabel: {
        fontSize: 11,
        fontWeight: 700,
        color: "#64748b",
        letterSpacing: "0.05em"
    },
    req: { color: "#ef4444" },
    inputIconWrapper: {
        position: "relative",
        display: "flex",
        alignItems: "center"
    },
    inputIcon: {
        position: "absolute",
        left: 12,
        color: "#94a3b8",
        fontSize: 12,
        pointerEvents: "none"
    },
    fieldInput: {
        width: "100%",
        padding: "9px 14px",
        border: "1px solid #cbd5e1",
        borderRadius: 8,
        fontSize: 13,
        color: "#0f172a",
        background: "#fff",
        outline: "none",
        transition: "all 0.15s ease"
    },
    fieldInputDisabled: { background: "#f8fafc", color: "#94a3b8", cursor: "not-allowed", borderStyle: "dashed" },
    fieldStatic: {
        padding: "9px 14px",
        border: "1px solid #e2e8f0",
        borderRadius: 8,
        fontSize: 13,
        color: "#1e293b",
        background: "#f8fafc",
        fontWeight: 600
    },
    tableToolbar: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "20px 24px",
        borderBottom: "1px solid #e2e8f0",
        backgroundColor: "#ffffff"
    },
    tableToolbarLeft: {
        display: "flex",
        alignItems: "center",
        gap: 12
    },
    tableCardTitle: {
        fontSize: 15,
        fontWeight: 700,
        color: "#0f172a"
    },
    rowCount: {
        fontSize: 12,
        color: "#64748b",
        fontWeight: 500,
        backgroundColor: "#f1f5f9",
        padding: "2px 10px",
        borderRadius: 20
    },
    addBtn: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "9px 16px",
        background: "#6366f1",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
        fontWeight: 600,
        fontSize: 12,
    },
    tableWrap: { overflowX: "auto" },
    table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
    th: {
        padding: "12px 10px",
        background: "#1e293b",
        color: "#f8fafc",
        fontWeight: 600,
        textAlign: "left",
        fontSize: 12,
        whiteSpace: "nowrap",
        borderRight: "1px solid #334155",
        verticalAlign: "middle",
    },
    thLabel: { display: "block", lineHeight: 1.2 },
    thAuto: { display: "flex", flexDirection: "column", gap: 2 },
    autoTag: { fontSize: 8, fontWeight: 700, color: "#a5b4fc", textTransform: "uppercase", letterSpacing: "0.05em" },
    thWithUnit: { display: "flex", flexDirection: "column", gap: 6 },
    unitPills: { display: "flex", background: "#0f172a", padding: 2, borderRadius: 6, width: "fit-content" },
    unitPill: {
        fontSize: 9, fontWeight: 600, padding: "3px 8px", borderRadius: 4,
        border: "none", cursor: "pointer", background: "transparent", color: "#64748b",
        textTransform: "uppercase", letterSpacing: "0.02em"
    },
    tr: { borderBottom: "1px solid #e2e8f0" },
    td: { padding: "6px 8px", verticalAlign: "middle" },
    cell: {
        width: "100%", padding: "7px 10px",
        border: "1px solid #cbd5e1", borderRadius: 6,
        fontSize: 13, color: "#0f172a",
        background: "#fff", outline: "none",
    },
    cellAuto: {
        background: "#f1f5f9", color: "#475569",
        cursor: "not-allowed", fontWeight: 500,
        borderColor: "#e2e8f0",
    },
    cellConverted: {
        background: "#f0f9ff", color: "#0284c7",
        cursor: "not-allowed", fontWeight: 600,
        borderColor: "#bae6fd",
    },
    cellNos: {
        background: "#faf5ff", color: "#6b21a8",
        fontWeight: 600,
        borderColor: "#e9d5ff",
        cursor: "not-allowed"
    },
    delBtn: {
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 30, height: 30, borderRadius: 6,
        background: "#ffffff", border: "1px solid #e2e8f0",
        cursor: "pointer",
    },
    tfootRow: { background: "#f8fafc", borderTop: "2px solid #cbd5e1" },
    tfootLabel: { padding: "14px 16px", fontWeight: 700, fontSize: 13, color: "#1e293b", textAlign: "left" },
    tfootCell: { padding: "14px 10px", fontSize: 13, textAlign: "right", color: "#334155", fontWeight: 600 },
    tfootConverted: { color: "#0284c7" },
    tfootNos: { color: "#6b21a8" },
    summaryStrip: { display: "flex", gap: 0, borderTop: "1px solid #e2e8f0", backgroundColor: "#ffffff", flexWrap: "wrap" },
    summaryItem: { flex: "1 1 180px", display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 12px", borderRight: "1px solid #e2e8f0" },
    summaryLabel: { fontSize: 10, color: "#64748b", fontWeight: 600, letterSpacing: "0.05em", marginBottom: 6, textTransform: "uppercase" },
    summaryVal: { fontSize: 20, fontWeight: 800, letterSpacing: "-0.01em" },
    bottomBar: { display: "flex", justifyContent: "flex-end", paddingTop: 16 },
};