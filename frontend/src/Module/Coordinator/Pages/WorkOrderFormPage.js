import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
    FaPlus, FaTrash, FaSave, FaArrowLeft,
    FaCheckCircle, FaExclamationTriangle, FaSpinner
} from "react-icons/fa";

// ── helpers ──────────────────────────────────────────────────────────────────
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
    woQtySqft:    "",
    woQtyNos:     "",
    floorPlanQty: "",
});

const calcSqft = (l, h) => {
    const lv = parseFloat(l), hv = parseFloat(h);
    return (!isNaN(lv) && !isNaN(hv) && lv > 0 && hv > 0) ? (lv * hv).toFixed(2) : "";
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function WorkOrderFormPage() {
    const navigate      = useNavigate();
    const { id }        = useParams();                          // present when editing
    const [searchParams] = useSearchParams();
    const projectFromUrl = searchParams.get("project") || "";

    const isEdit = Boolean(id);

    const [workOrderNo,  setWorkOrderNo]  = useState("");
    const [projectName,  setProjectName]  = useState(projectFromUrl);
    const [date,         setDate]         = useState(new Date().toISOString().split("T")[0]);
    const [rows,         setRows]         = useState([emptyRow()]);
    const [saving,       setSaving]       = useState(false);
    const [loading,      setLoading]      = useState(isEdit);
    const [saveMsg,      setSaveMsg]      = useState(null);

    // ── Load existing WO when editing ────────────────────────────────────────
    useEffect(() => {
        if (!isEdit) return;
        const load = async () => {
            try {
                const res  = await fetch(`${process.env.REACT_APP_API_URL}/api/work-orders/${id}`);
                const data = await res.json();
                setWorkOrderNo(data.workOrderNo  || "");
                setProjectName(data.projectName  || "");
                setDate(data.date                || "");
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
                        woQtySqft:    i.woQtySqft    ?? "",
                        woQtyNos:     i.woQtyNos     ?? "",
                        floorPlanQty: i.floorPlanQty ?? "",
                    }))
                );
            } catch {
                setSaveMsg({ type: "error", text: "Failed to load work order." });
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id, isEdit]);

    // ── Row operations ────────────────────────────────────────────────────────
    const addRow    = () => setRows(r => [...r, emptyRow()]);
    const deleteRow = (_id) => setRows(r => r.filter(row => row._id !== _id));
    const updateRow = (_id, field, value) =>
        setRows(r => r.map(row => {
            if (row._id !== _id) return row;
            const u = { ...row, [field]: value };
            if (field === "length" || field === "height") {
                const auto = calcSqft(u.length, u.height);
                if (auto) { u.sqft = auto; u.woQtySqft = auto; }
            }
            return u;
        }));

    // ── Save ──────────────────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!workOrderNo.trim()) { setSaveMsg({ type: "error", text: "Work Order No. is required." }); return; }
        if (!projectName.trim()) { setSaveMsg({ type: "error", text: "Project Name is required." }); return; }

        const validRows = rows.filter(r => r.srNo || r.location || r.windowCode || r.length);
        if (!validRows.length) { setSaveMsg({ type: "error", text: "Add at least one row." }); return; }

        setSaving(true);
        setSaveMsg(null);

        const payload = {
            workOrderNo,
            projectName,
            date,
            items: validRows.map(({ _id, ...rest }) => rest),
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

            setSaveMsg({ type: "success", text: `✅ Work Order ${isEdit ? "updated" : "saved"} successfully!` });

            // Navigate back after short delay
            setTimeout(() => navigate("/coordinator-dashboard/work-orders"), 1200);
        } catch (err) {
            setSaveMsg({ type: "error", text: `❌ ${err.message}` });
        } finally {
            setSaving(false);
        }
    };

    // ── Totals ────────────────────────────────────────────────────────────────
    const totalSqft = rows.reduce((s, r) => s + (parseFloat(r.woQtySqft)    || 0), 0);
    const totalNos  = rows.reduce((s, r) => s + (parseFloat(r.woQtyNos)     || 0), 0);
    const totalFP   = rows.reduce((s, r) => s + (parseFloat(r.floorPlanQty) || 0), 0);

    if (loading) return <div style={f.center}>Loading work order…</div>;

    // ── Columns config ────────────────────────────────────────────────────────
    const COLS = [
        { key: "srNo",         label: "Sr. No",          type: "text",   width: 70  },
        { key: "location",     label: "Location",         type: "text",   width: 120 },
        { key: "windowCode",   label: "Window Code",      type: "text",   width: 120 },
        { key: "typology",     label: "Typology",         type: "text",   width: 110 },
        { key: "series",       label: "Series",           type: "text",   width: 100 },
        { key: "length",       label: "Length (ft)",      type: "number", width: 90  },
        { key: "height",       label: "Height (ft)",      type: "number", width: 90  },
        { key: "sqft",         label: "Sqft (Auto)",      type: "number", width: 90, readOnly: true },
        { key: "woQtySqft",    label: "W/O Qty (Sqft)",   type: "number", width: 110 },
        { key: "woQtyNos",     label: "W/O QTY (Nos)",    type: "number", width: 100 },
        { key: "floorPlanQty", label: "Floor Plan Qty",   type: "number", width: 110 },
    ];

    return (
        <div style={f.wrapper}>

            {/* ── Top bar ───────────────────────────────────────────────── */}
            <div style={f.topBar}>

                <h1 style={f.title}>
                    {isEdit ? "Edit Work Order" : "Create Work Order"}
                    {projectName && <span style={f.projectTag}>{projectName}</span>}
                </h1>
                <button style={f.saveBtn} onClick={handleSave} disabled={saving}>
                    {saving ? <FaSpinner style={spin} /> : <FaSave />}
                    &nbsp;{saving ? "Saving…" : isEdit ? "Update" : "Save Work Order"}
                </button>
            </div>

            {/* ── Save message ──────────────────────────────────────────── */}
            {saveMsg && (
                <div style={{ ...f.alert, ...(saveMsg.type === "success" ? f.alertOk : f.alertErr) }}>
                    {saveMsg.type === "success" ? <FaCheckCircle /> : <FaExclamationTriangle />}
                    &nbsp;{saveMsg.text}
                </div>
            )}

            {/* ── Work Order Meta ───────────────────────────────────────── */}
            <div style={f.card}>
                <h2 style={f.sectionTitle}>Work Order Details</h2>
                <div style={f.metaGrid}>
                    <div style={f.field}>
                        <label style={f.label}>Work Order No. *</label>
                        <input
                            style={f.input}
                            value={workOrderNo}
                            onChange={e => setWorkOrderNo(e.target.value)}
                            placeholder="WO-2026-001"
                            disabled={isEdit}
                        />
                    </div>
                    <div style={f.field}>
                        <label style={f.label}>Project Name *</label>
                        <input
                            style={{ ...f.input, background: "#f1f5f9" }}
                            value={projectName}
                            readOnly
                        />
                    </div>
                    <div style={f.field}>
                        <label style={f.label}>Date</label>
                        <input
                            style={f.input}
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* ── Items Table ───────────────────────────────────────────── */}
            <div style={f.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                    <h2 style={f.sectionTitle}>Work Order Items</h2>
                    <button style={f.addBtn} onClick={addRow}>
                        <FaPlus /> &nbsp;Add Row
                    </button>
                </div>

                <div style={{ overflowX: "auto" }}>
                    <table style={t.table}>
                        <thead>
                            <tr style={t.headRow}>
                                {COLS.map(c => (
                                    <th key={c.key} style={{ ...t.th, minWidth: c.width }}>{c.label}</th>
                                ))}
                                <th style={t.th}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, idx) => (
                                <tr key={row._id} style={idx % 2 === 0 ? t.rowEven : t.rowOdd}>
                                    {COLS.map(c => (
                                        <td key={c.key} style={t.td}>
                                            <input
                                                style={{
                                                    ...t.cell,
                                                    ...(c.readOnly ? t.cellRO : {}),
                                                }}
                                                type={c.type}
                                                value={row[c.key]}
                                                readOnly={c.readOnly}
                                                placeholder={c.key === "srNo" ? `${idx + 1}` : ""}
                                                onChange={e => updateRow(row._id, c.key, e.target.value)}
                                            />
                                        </td>
                                    ))}
                                    <td style={t.td}>
                                        <button style={t.delBtn} onClick={() => deleteRow(row._id)}>
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr style={t.footRow}>
                                <td colSpan={8} style={{ ...t.td, fontWeight: 700, color: "#1e293b", paddingLeft: 12, textAlign: "left" }}>
                                    Totals
                                </td>
                                <td style={{ ...t.td, fontWeight: 700, color: "#2563eb" }}>{totalSqft.toFixed(2)}</td>
                                <td style={{ ...t.td, fontWeight: 700, color: "#7c3aed" }}>{totalNos}</td>
                                <td style={{ ...t.td, fontWeight: 700, color: "#16a34a" }}>{totalFP}</td>
                                <td style={t.td} />
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Summary cards */}
                <div style={f.summaryRow}>
                    {[
                        { label: "Total Rows",     val: rows.length,            color: "#1e293b" },
                        { label: "Total W/O Sqft", val: totalSqft.toFixed(2),   color: "#2563eb" },
                        { label: "Total W/O Nos",  val: totalNos,               color: "#7c3aed" },
                        { label: "Floor Plan Qty", val: totalFP,                color: "#16a34a" },
                    ].map(s => (
                        <div key={s.label} style={f.statCard}>
                            <span style={f.statLabel}>{s.label}</span>
                            <span style={{ ...f.statVal, color: s.color }}>{s.val}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom save */}
            <div style={{ textAlign: "right", paddingBottom: 40 }}>
                <button style={f.saveBtn} onClick={handleSave} disabled={saving}>
                    {saving ? <FaSpinner style={spin} /> : <FaSave />}
                    &nbsp;{saving ? "Saving…" : isEdit ? "Update Work Order" : "Save Work Order"}
                </button>
            </div>

            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
    );
}

const spin = { animation: "spin 1s linear infinite" };

const f = {
    wrapper:    { maxWidth: 1400, margin: "0 auto", padding: "0 0 40px" },
    topBar:     { display: "flex", alignItems: "center", gap: 16, marginBottom: 20, flexWrap: "wrap" },
    backBtn:    { display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#1d4ed8", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: 14 },
    title:      { flex: 1, margin: 0, fontSize: 20, fontWeight: 700, color: "#1e293b", display: "flex", alignItems: "center", gap: 12 },
    projectTag: { fontSize: 13, fontWeight: 600, background: "#ede9fe", color: "#7c3aed", padding: "3px 12px", borderRadius: 20 },
    saveBtn:    { display: "flex", alignItems: "center", gap: 6, padding: "10px 22px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 15 },
    card:       { background: "#fff", borderRadius: 15, border: "1px solid #e2e8f0", padding: "24px 28px", marginBottom: 24, boxShadow: "0 4px 6px rgba(0,0,0,0.04)" },
    sectionTitle:{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: "#1e293b", borderLeft: "4px solid #1d4ed8", paddingLeft: 10, display: "inline-block" },
    metaGrid:   { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 18, marginTop: 16 },
    field:      { display: "flex", flexDirection: "column", gap: 6 },
    label:      { fontSize: 13, fontWeight: 600, color: "#475569" },
    input:      { padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, color: "#1e293b", outline: "none" },
    addBtn:     { display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 600, fontSize: 13 },
    alert:      { padding: "12px 16px", borderRadius: 8, fontSize: 14, fontWeight: 500, display: "flex", alignItems: "center", gap: 8, marginBottom: 16 },
    alertOk:    { background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" },
    alertErr:   { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" },
    summaryRow: { display: "flex", gap: 16, marginTop: 20, flexWrap: "wrap" },
    statCard:   { background: "#f8fafc", borderRadius: 10, padding: "14px 24px", textAlign: "center", minWidth: 130, border: "1px solid #e2e8f0" },
    statLabel:  { display: "block", fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 4 },
    statVal:    { fontSize: 22, fontWeight: 700 },
    center:     { padding: 40, textAlign: "center", color: "#94a3b8" },
};

const t = {
    table:    { width: "100%", borderCollapse: "collapse", fontSize: 13 },
    headRow:  { background: "#1e1b4b" },
    th:       { padding: "11px 8px", color: "#e2e8f0", fontWeight: 600, textAlign: "center", whiteSpace: "nowrap" },
    td:       { padding: "5px 6px", borderBottom: "1px solid #f1f5f9", textAlign: "center" },
    rowEven:  { background: "#fff" },
    rowOdd:   { background: "#f8fafc" },
    footRow:  { background: "#eff6ff", borderTop: "2px solid #bfdbfe" },
    cell:     { width: "100%", padding: "7px 6px", border: "1px solid #e2e8f0", borderRadius: 6, textAlign: "center", fontSize: 13, color: "#1e293b", background: "#fff", outline: "none" },
    cellRO:   { background: "#f1f5f9", color: "#94a3b8", cursor: "not-allowed" },
    delBtn:   { background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 15, padding: 4 },
};
