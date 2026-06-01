//import React, { useState, useEffect } from "react";
//import { useNavigate, useParams, useLocation } from "react-router-dom";
//import {
//    FaRegArrowAltCircleLeft, FaPlus, FaEdit,
//    FaLayerGroup, FaSpinner, FaHome, FaCalendarAlt
//} from "react-icons/fa";
//
//export default function InfoSheetListPage() {
//    const navigate       = useNavigate();
//    const { workOrderId } = useParams();
//    const location       = useLocation();
//    const workOrder      = location.state?.workOrder || {};
//    const project        = location.state?.project   || {};
//
//    const [sheets,  setSheets]  = useState([]);
//    const [loading, setLoading] = useState(true);
//    const [error,   setError]   = useState("");
//
//    useEffect(() => {
//        fetch(`${process.env.REACT_APP_API_URL}/api/info-sheets/by-work-order/${workOrderId}`)
//            .then(r => r.json())
//            .then(data => { setSheets(Array.isArray(data) ? data : []); setLoading(false); })
//            .catch(() => { setError("Failed to load info sheets."); setLoading(false); });
//    }, [workOrderId]);
//
//    const flatTypeColor = (ft) => ({
//        "1BHK": { bg: "#e0f2fe", color: "#0284c7", border: "#bae6fd" },
//        "2BHK": { bg: "#dcfce7", color: "#16a34a", border: "#bbf7d0" },
//        "3BHK": { bg: "#fef3c7", color: "#d97706", border: "#fde68a" },
//        "4BHK": { bg: "#fae8ff", color: "#9333ea", border: "#f5d0fe" },
//    }[ft] || { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" });
//
//    return (
//        <div style={s.page}>
//            {/* Header */}
//            <div style={s.pageHeader}>
//                <div style={s.headerLeft}>
//                    <button
//                        style={s.backBtn}
//                        onClick={() => navigate("/coordinator-dashboard/tracker")}
//                    >
//                        <FaRegArrowAltCircleLeft /> Back to Tracker
//                    </button>
//                    <div>
//                        <h1 style={s.pageTitle}>Info Sheets</h1>
//                        <div style={s.metaLine}>
//                            <span style={s.metaItem}>
//                                <strong>{workOrder.workOrderNo || "—"}</strong>
//                            </span>
//                            {workOrder.towerName && (
//                                <span style={s.towerBadge}>{workOrder.towerName}</span>
//                            )}
//                            <span style={{ color: "#94a3b8" }}>
//                                {project.projectName || workOrder.projectName || ""}
//                            </span>
//                        </div>
//                    </div>
//                </div>
//
//                <button
//                    style={s.createBtn}
//                    onClick={() => navigate(
//                        `/coordinator-dashboard/tracker/${workOrderId}/sheets/create`,
//                        { state: { workOrder, project } }
//                    )}
//                >
//                    <FaPlus />&nbsp;New Info Sheet
//                </button>
//            </div>
//
//            {error && <div style={s.errorBox}>{error}</div>}
//
//            {loading ? (
//                <div style={s.centerMsg}><FaSpinner style={spin} />&nbsp;Loading…</div>
//            ) : sheets.length === 0 ? (
//                <div style={s.emptyState}>
//                    <FaLayerGroup style={{ fontSize: 52, color: "#cbd5e1", marginBottom: 16 }} />
//                    <div style={{ fontSize: 17, color: "#94a3b8", fontWeight: 600 }}>
//                        No info sheets yet
//                    </div>
//                    <div style={{ fontSize: 14, color: "#cbd5e1", marginTop: 6, marginBottom: 24 }}>
//                        Click "New Info Sheet" to create the first one
//                    </div>
//                    <button
//                        style={s.createBtn}
//                        onClick={() => navigate(
//                            `/coordinator-dashboard/tracker/${workOrderId}/sheets/create`,
//                            { state: { workOrder, project } }
//                        )}
//                    >
//                        <FaPlus />&nbsp;New Info Sheet
//                    </button>
//                </div>
//            ) : (
//                <div style={s.grid}>
//                    {sheets.map(sheet => {
//                        const ftColor = flatTypeColor(sheet.flatType);
//                        const totalSqft = (sheet.items || [])
//                            .reduce((sum, i) => sum + (parseFloat(i.sqft) || 0), 0);
//                        return (
//                            <div
//                                key={sheet.id}
//                                style={s.card}
//                                onClick={() => navigate(
//                                    `/coordinator-dashboard/tracker/${workOrderId}/sheets/${sheet.id}/edit`,
//                                    { state: { workOrder, project } }
//                                )}
//                            >
//                                <div style={s.cardTop}>
//                                    <span style={{
//                                        ...s.ftBadge,
//                                        background:   ftColor.bg,
//                                        color:        ftColor.color,
//                                        border:       `1px solid ${ftColor.border}`,
//                                    }}>
//                                        {sheet.flatType || "—"}
//                                    </span>
//                                    <FaEdit style={{ color: "#94a3b8", fontSize: 14 }} />
//                                </div>
//
//                                <div style={s.flatNo}>
//                                    <FaHome style={{ color: "#64748b", fontSize: 14 }} />
//                                    &nbsp;Flat {sheet.flatNo || "—"}
//                                </div>
//
//                                <div style={s.cardMeta}>
//                                    <FaCalendarAlt style={{ fontSize: 11, color: "#94a3b8" }} />
//                                    &nbsp;{sheet.date || "—"}
//                                </div>
//
//                                <div style={s.cardStats}>
//                                    <div style={s.stat}>
//                                        <span style={s.statLabel}>Items</span>
//                                        <span style={s.statVal}>{sheet.items?.length || 0}</span>
//                                    </div>
//                                    <div style={s.stat}>
//                                        <span style={s.statLabel}>Total Sqft</span>
//                                        <span style={{ ...s.statVal, color: "#0284c7" }}>
//                                            {totalSqft.toFixed(2)}
//                                        </span>
//                                    </div>
//                                </div>
//                            </div>
//                        );
//                    })}
//                </div>
//            )}
//
//            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
//        </div>
//    );
//}
//
//const spin = { animation: "spin 1s linear infinite" };
//
//const s = {
//    page:       { maxWidth: 1400, margin: "0 auto", padding: "0 4px 40px", fontFamily: "'Inter',-apple-system,sans-serif" },
//    pageHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, padding: "32px 0 24px", flexWrap: "wrap" },
//    headerLeft: { display: "flex", flexDirection: "column", gap: 8 },
//    backBtn:    { background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 13, color: "#64748b", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 },
//    pageTitle:  { margin: 0, fontSize: 24, fontWeight: 800, color: "#0f172a" },
//    metaLine:   { display: "flex", alignItems: "center", gap: 10, marginTop: 6, fontSize: 13 },
//    metaItem:   { color: "#1e293b" },
//    towerBadge: { background: "#fef3c7", color: "#92400e", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 12, border: "1px solid #fde68a" },
//    createBtn:  { display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "linear-gradient(135deg,#0ea5e9,#0284c7)", color: "#fff", border: "none", borderRadius: 9, cursor: "pointer", fontWeight: 700, fontSize: 14 },
//    errorBox:   { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 16px", marginBottom: 16, fontSize: 14 },
//    centerMsg:  { padding: "60px", textAlign: "center", color: "#94a3b8", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" },
//    emptyState: { display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 40px", background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0" },
//    grid:       { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 },
//    card:       { background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", padding: "20px", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 2px 6px rgba(0,0,0,0.04)" },
//    cardTop:    { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
//    ftBadge:    { fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20 },
//    flatNo:     { fontSize: 18, fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", marginBottom: 6 },
//    cardMeta:   { fontSize: 12, color: "#94a3b8", display: "flex", alignItems: "center", marginBottom: 16 },
//    cardStats:  { display: "flex", gap: 12, borderTop: "1px solid #f1f5f9", paddingTop: 14 },
//    stat:       { flex: 1, display: "flex", flexDirection: "column", alignItems: "center" },
//    statLabel:  { fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 },
//    statVal:    { fontSize: 18, fontWeight: 800, color: "#1e293b" },
//};
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
    FaRegArrowAltCircleLeft, FaPlus, FaEdit, FaTrash,
    FaLayerGroup, FaSpinner, FaCalendarAlt, FaChevronDown,
    FaChevronUp, FaHome, FaExclamationTriangle
} from "react-icons/fa";

const ftColors = {
    "1BHK": { bg: "#e0f2fe", color: "#0284c7", border: "#bae6fd" },
    "2BHK": { bg: "#dcfce7", color: "#16a34a", border: "#bbf7d0" },
    "3BHK": { bg: "#fef3c7", color: "#d97706", border: "#fde68a" },
    "4BHK": { bg: "#fae8ff", color: "#9333ea", border: "#f5d0fe" },
};

export default function InfoSheetListPage() {
    const navigate        = useNavigate();
    const { workOrderId } = useParams();
    const location        = useLocation();
    const workOrder       = location.state?.workOrder || {};
    const project         = location.state?.project   || {};

    const [sheets,       setSheets]       = useState([]);
    const [loading,      setLoading]      = useState(true);
    const [error,        setError]        = useState("");
    const [expandedFlats, setExpandedFlats] = useState({});  // { flatId: bool }
    const [deleteConfirm, setDeleteConfirm] = useState(null); // { sheetId, flatId, flatNo }
    const [deleting,     setDeleting]     = useState(false);

    const fetchSheets = () => {
        setLoading(true);
        fetch(`${process.env.REACT_APP_API_URL}/api/info-sheets/by-work-order/${workOrderId}`)
            .then(r => r.json())
            .then(data => { setSheets(Array.isArray(data) ? data : []); setLoading(false); })
            .catch(() => { setError("Failed to load info sheets."); setLoading(false); });
    };

    useEffect(() => { fetchSheets(); }, [workOrderId]);

    const toggleFlat = (flatId) =>
        setExpandedFlats(prev => ({ ...prev, [flatId]: !prev[flatId] }));

    const handleDeleteFlat = async () => {
        if (!deleteConfirm) return;
        setDeleting(true);
        try {
            const res = await fetch(
                `${process.env.REACT_APP_API_URL}/api/info-sheets/${deleteConfirm.sheetId}/flats/${deleteConfirm.flatId}`,
                { method: "DELETE" }
            );
            if (!res.ok) throw new Error("Delete failed");
            setDeleteConfirm(null);
            fetchSheets();
        } catch {
            setError("Failed to delete flat.");
        } finally {
            setDeleting(false);
        }
    };

    // Grand totals across all sheets
    const grandTotal = sheets.reduce((sum, sheet) =>
        sum + (sheet.flats || []).reduce((s2, fl) =>
            s2 + (fl.items || []).reduce((s3, it) => s3 + (parseFloat(it.sqft) || 0), 0), 0
        ), 0
    );
    const totalFlats = sheets.reduce((sum, sheet) => sum + (sheet.flats || []).length, 0);

    return (
        <div style={s.page}>
            <style>{`
                @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
                .flat-row:hover { background: #f8fafc !important; }
                .del-btn:hover  { background: #fef2f2 !important; border-color: #fecaca !important; color: #ef4444 !important; }
                .edit-btn:hover { background: #eff6ff !important; border-color: #bfdbfe !important; color: #0284c7 !important; }
            `}</style>

            {/* Header */}
            <div style={s.pageHeader}>
                <div style={s.headerLeft}>
                    <button style={s.backBtn} onClick={() => navigate("/coordinator-dashboard/tracker")}>
                        <FaRegArrowAltCircleLeft /> Back to Tracker
                    </button>
                    <div>
                        <h1 style={s.pageTitle}>Info Sheets</h1>
                        <div style={s.metaLine}>
                            <span style={s.woBadge}>{workOrder.workOrderNo || "—"}</span>
                            {workOrder.towerName && <span style={s.towerBadge}>{workOrder.towerName}</span>}
                            <span style={{ color: "#64748b", fontSize: 13 }}>
                                {workOrder.projectName || project.projectName || ""}
                            </span>
                        </div>
                    </div>
                </div>

                <button
                    style={s.createBtn}
                    onClick={() => navigate(
                        `/coordinator-dashboard/tracker/${workOrderId}/sheets/create`,
                        { state: { workOrder, project } }
                    )}
                >
                    <FaPlus />&nbsp;New Info Sheet
                </button>
            </div>

            {error && (
                <div style={s.errorBox}>
                    <FaExclamationTriangle /> &nbsp;{error}
                </div>
            )}

            {/* Summary bar */}
            {!loading && sheets.length > 0 && (
                <div style={s.summaryBar}>
                    {[
                        { label: "Total Sheets",     val: sheets.length  },
                        { label: "Total Flats",      val: totalFlats     },
                        { label: "Grand Total Sqft", val: grandTotal.toFixed(2), color: "#0284c7" },
                    ].map(stat => (
                        <div key={stat.label} style={s.summaryItem}>
                            <span style={s.summaryLabel}>{stat.label}</span>
                            <span style={{ ...s.summaryVal, color: stat.color || "#1e293b" }}>{stat.val}</span>
                        </div>
                    ))}
                </div>
            )}

            {loading ? (
                <div style={s.centerMsg}>
                    <FaSpinner style={{ animation: "spin 1s linear infinite" }} />&nbsp;Loading…
                </div>
            ) : sheets.length === 0 ? (
                <div style={s.emptyState}>
                    <FaLayerGroup style={{ fontSize: 52, color: "#cbd5e1", marginBottom: 16 }} />
                    <div style={{ fontSize: 17, color: "#94a3b8", fontWeight: 600 }}>No info sheets yet</div>
                    <div style={{ fontSize: 14, color: "#cbd5e1", marginTop: 6, marginBottom: 24 }}>
                        Click "New Info Sheet" to create the first one
                    </div>
                    <button
                        style={s.createBtn}
                        onClick={() => navigate(
                            `/coordinator-dashboard/tracker/${workOrderId}/sheets/create`,
                            { state: { workOrder, project } }
                        )}
                    >
                        <FaPlus />&nbsp;New Info Sheet
                    </button>
                </div>
            ) : (
                sheets.map(sheet => {
                    const sheetTotal = (sheet.flats || []).reduce((sum, fl) =>
                        sum + (fl.items || []).reduce((s2, it) => s2 + (parseFloat(it.sqft) || 0), 0), 0
                    );
                    return (
                        <div key={sheet.id} style={s.sheetCard}>
                            {/* Sheet header */}
                            <div style={s.sheetHeader}>
                                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                    <FaLayerGroup style={{ color: "#0284c7", fontSize: 18 }} />
                                    <div>
                                        <div style={s.sheetTitle}>Info Sheet #{sheet.id}</div>
                                        <div style={{ fontSize: 12, color: "#94a3b8", display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                                            <FaCalendarAlt style={{ fontSize: 11 }} />
                                            {sheet.date || "—"}
                                            &nbsp;•&nbsp;
                                            <span style={{ fontWeight: 600, color: "#475569" }}>
                                                {(sheet.flats || []).length} flat{(sheet.flats || []).length !== 1 ? "s" : ""}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <div style={{ textAlign: "right", marginRight: 8 }}>
                                        <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>Sheet Sqft</div>
                                        <div style={{ fontSize: 18, fontWeight: 800, color: "#0284c7" }}>{sheetTotal.toFixed(2)}</div>
                                    </div>
                                    <button
                                        className="edit-btn"
                                        style={s.iconBtn}
                                        onClick={() => navigate(
                                            `/coordinator-dashboard/tracker/${workOrderId}/sheets/${sheet.id}/edit`,
                                            { state: { workOrder, project } }
                                        )}
                                        title="Edit this sheet"
                                    >
                                        <FaEdit style={{ fontSize: 13 }} />
                                    </button>
                                </div>
                            </div>

                            {/* Flats list */}
                            <div style={s.flatsContainer}>
                                {(sheet.flats || []).map((fl, idx) => {
                                    const ftC      = ftColors[fl.flatType] || { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" };
                                    const flatSqft = (fl.items || []).reduce((s, it) => s + (parseFloat(it.sqft) || 0), 0);
                                    const expanded = expandedFlats[fl.id];
                                    return (
                                        <div key={fl.id} style={s.flatBlock}>
                                            {/* Flat row */}
                                            <div
                                                className="flat-row"
                                                style={s.flatRow}
                                                onClick={() => toggleFlat(fl.id)}
                                            >
                                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                    <span style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", minWidth: 20 }}>
                                                        {idx + 1}.
                                                    </span>
                                                    <span style={{
                                                        background: ftC.bg, color: ftC.color,
                                                        border: `1px solid ${ftC.border}`,
                                                        fontSize: 11, fontWeight: 700,
                                                        padding: "2px 10px", borderRadius: 16,
                                                    }}>
                                                        {fl.flatType || "—"}
                                                    </span>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                                        <FaHome style={{ color: "#64748b", fontSize: 12 }} />
                                                        <span style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>
                                                            Flat {fl.flatNo || "—"}
                                                        </span>
                                                    </div>
                                                    <span style={{ fontSize: 12, color: "#94a3b8" }}>
                                                        {(fl.items || []).length} items
                                                    </span>
                                                    <span style={{ fontSize: 13, fontWeight: 700, color: "#0284c7" }}>
                                                        {flatSqft.toFixed(2)} sqft
                                                    </span>
                                                </div>

                                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                    <button
                                                        className="del-btn"
                                                        style={s.iconBtn}
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            setDeleteConfirm({ sheetId: sheet.id, flatId: fl.id, flatNo: fl.flatNo });
                                                        }}
                                                        title="Delete this flat"
                                                    >
                                                        <FaTrash style={{ fontSize: 11 }} />
                                                    </button>
                                                    {expanded
                                                        ? <FaChevronUp   style={{ color: "#94a3b8", fontSize: 12 }} />
                                                        : <FaChevronDown style={{ color: "#94a3b8", fontSize: 12 }} />}
                                                </div>
                                            </div>

                                            {/* Expanded items table */}
                                            {expanded && (fl.items || []).length > 0 && (
                                                <div style={{ overflowX: "auto", borderTop: "1px solid #f1f5f9" }}>
                                                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                                                        <thead>
                                                            <tr style={{ background: "#f8fafc" }}>
                                                                {["Sr No","Location","WCode","Typology","Series","Length","Height","Sqft"].map(h => (
                                                                    <th key={h} style={s.viewTh}>{h}</th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {fl.items.map((item, ii) => (
                                                                <tr key={item.id || ii} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                                                    <td style={s.viewTd}>{item.srNo || (ii + 1)}</td>
                                                                    <td style={s.viewTd}>{item.location   || "—"}</td>
                                                                    <td style={s.viewTd}>{item.windowCode || "—"}</td>
                                                                    <td style={s.viewTd}>{item.typology   || "—"}</td>
                                                                    <td style={s.viewTd}>{item.series     || "—"}</td>
                                                                    <td style={{ ...s.viewTd, textAlign: "right" }}>{item.length || "—"}</td>
                                                                    <td style={{ ...s.viewTd, textAlign: "right" }}>{item.height || "—"}</td>
                                                                    <td style={{ ...s.viewTd, textAlign: "right", color: "#0284c7", fontWeight: 700 }}>
                                                                        {item.sqft ? parseFloat(item.sqft).toFixed(2) : "—"}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                        <tfoot>
                                                            <tr style={{ background: "#eff6ff" }}>
                                                                <td colSpan={7} style={{ padding: "8px 12px", fontWeight: 700, fontSize: 12, color: "#0284c7" }}>
                                                                    Flat Total
                                                                </td>
                                                                <td style={{ padding: "8px 12px", fontWeight: 800, fontSize: 13, color: "#0284c7", textAlign: "right" }}>
                                                                    {flatSqft.toFixed(2)}
                                                                </td>
                                                            </tr>
                                                        </tfoot>
                                                    </table>
                                                </div>
                                            )}
                                            {expanded && (fl.items || []).length === 0 && (
                                                <div style={{ padding: "16px 20px", color: "#94a3b8", fontSize: 13, borderTop: "1px solid #f1f5f9" }}>
                                                    No items added for this flat.
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })
            )}

            {/* Delete confirmation modal */}
            {deleteConfirm && (
                <div style={s.modalOverlay}>
                    <div style={s.modal}>
                        <div style={{ fontSize: 36, marginBottom: 12 }}>🗑️</div>
                        <h3 style={{ margin: "0 0 8px", color: "#0f172a", fontSize: 18 }}>Delete Flat?</h3>
                        <p style={{ margin: "0 0 24px", color: "#64748b", fontSize: 14 }}>
                            This will permanently delete <strong>Flat {deleteConfirm.flatNo}</strong> and all its items.
                            This cannot be undone.
                        </p>
                        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                            <button
                                style={s.cancelBtn}
                                onClick={() => setDeleteConfirm(null)}
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                style={s.confirmDeleteBtn}
                                onClick={handleDeleteFlat}
                                disabled={deleting}
                            >
                                {deleting ? <FaSpinner style={{ animation: "spin 1s linear infinite" }} /> : <FaTrash />}
                                &nbsp;{deleting ? "Deleting…" : "Yes, Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const s = {
    page:           { maxWidth: 1440, margin: "0 auto", padding: "0 4px 56px", fontFamily: "'Inter',-apple-system,sans-serif" },
    pageHeader:     { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, padding: "32px 0 24px", flexWrap: "wrap" },
    headerLeft:     { display: "flex", flexDirection: "column", gap: 8 },
    backBtn:        { background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 13, color: "#64748b", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 },
    pageTitle:      { margin: 0, fontSize: 24, fontWeight: 800, color: "#0f172a" },
    metaLine:       { display: "flex", alignItems: "center", gap: 10, marginTop: 6 },
    woBadge:        { background: "#e0f2fe", color: "#0284c7", fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 12 },
    towerBadge:     { background: "#fef3c7", color: "#92400e", fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 12, border: "1px solid #fde68a" },
    createBtn:      { display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "linear-gradient(135deg,#0ea5e9,#0284c7)", color: "#fff", border: "none", borderRadius: 9, cursor: "pointer", fontWeight: 700, fontSize: 14 },
    errorBox:       { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 16px", marginBottom: 16, fontSize: 14, display: "flex", alignItems: "center" },
    summaryBar:     { display: "flex", gap: 0, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, marginBottom: 24, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
    summaryItem:    { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 12px", borderRight: "1px solid #e2e8f0" },
    summaryLabel:   { fontSize: 10, color: "#64748b", fontWeight: 600, letterSpacing: "0.05em", marginBottom: 6, textTransform: "uppercase" },
    summaryVal:     { fontSize: 22, fontWeight: 800 },
    centerMsg:      { padding: "60px", textAlign: "center", color: "#94a3b8", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
    emptyState:     { display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 40px", background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0" },
    sheetCard:      { background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", marginBottom: 20, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" },
    sheetHeader:    { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #f1f5f9", background: "#fafbfc" },
    sheetTitle:     { fontWeight: 800, fontSize: 16, color: "#0f172a" },
    flatsContainer: { padding: "8px 0" },
    flatBlock:      { borderBottom: "1px solid #f8fafc" },
    flatRow:        { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", cursor: "pointer", transition: "background 0.15s" },
    iconBtn:        { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: 6, background: "#f8fafc", border: "1px solid #e2e8f0", cursor: "pointer", color: "#64748b", transition: "all 0.15s" },
    viewTh:         { padding: "9px 10px", background: "#f8fafc", color: "#475569", fontWeight: 600, fontSize: 11, textAlign: "left", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" },
    viewTd:         { padding: "8px 10px", fontSize: 12, color: "#1e293b", borderBottom: "1px solid #f8fafc" },
    modalOverlay:   { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
    modal:          { background: "#fff", borderRadius: 16, padding: "32px 40px", maxWidth: 420, width: "90%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" },
    cancelBtn:      { padding: "10px 24px", background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14 },
    confirmDeleteBtn:{ padding: "10px 24px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 8 },
};

