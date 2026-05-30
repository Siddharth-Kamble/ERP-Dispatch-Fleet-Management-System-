import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
    FaRegArrowAltCircleLeft, FaPlus, FaEdit,
    FaLayerGroup, FaSpinner, FaHome, FaCalendarAlt
} from "react-icons/fa";

export default function InfoSheetListPage() {
    const navigate       = useNavigate();
    const { workOrderId } = useParams();
    const location       = useLocation();
    const workOrder      = location.state?.workOrder || {};
    const project        = location.state?.project   || {};

    const [sheets,  setSheets]  = useState([]);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState("");

    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_URL}/api/info-sheets/by-work-order/${workOrderId}`)
            .then(r => r.json())
            .then(data => { setSheets(Array.isArray(data) ? data : []); setLoading(false); })
            .catch(() => { setError("Failed to load info sheets."); setLoading(false); });
    }, [workOrderId]);

    const flatTypeColor = (ft) => ({
        "1BHK": { bg: "#e0f2fe", color: "#0284c7", border: "#bae6fd" },
        "2BHK": { bg: "#dcfce7", color: "#16a34a", border: "#bbf7d0" },
        "3BHK": { bg: "#fef3c7", color: "#d97706", border: "#fde68a" },
        "4BHK": { bg: "#fae8ff", color: "#9333ea", border: "#f5d0fe" },
    }[ft] || { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" });

    return (
        <div style={s.page}>
            {/* Header */}
            <div style={s.pageHeader}>
                <div style={s.headerLeft}>
                    <button
                        style={s.backBtn}
                        onClick={() => navigate("/coordinator-dashboard/tracker")}
                    >
                        <FaRegArrowAltCircleLeft /> Back to Tracker
                    </button>
                    <div>
                        <h1 style={s.pageTitle}>Info Sheets</h1>
                        <div style={s.metaLine}>
                            <span style={s.metaItem}>
                                <strong>{workOrder.workOrderNo || "—"}</strong>
                            </span>
                            {workOrder.towerName && (
                                <span style={s.towerBadge}>{workOrder.towerName}</span>
                            )}
                            <span style={{ color: "#94a3b8" }}>
                                {project.projectName || workOrder.projectName || ""}
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

            {error && <div style={s.errorBox}>{error}</div>}

            {loading ? (
                <div style={s.centerMsg}><FaSpinner style={spin} />&nbsp;Loading…</div>
            ) : sheets.length === 0 ? (
                <div style={s.emptyState}>
                    <FaLayerGroup style={{ fontSize: 52, color: "#cbd5e1", marginBottom: 16 }} />
                    <div style={{ fontSize: 17, color: "#94a3b8", fontWeight: 600 }}>
                        No info sheets yet
                    </div>
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
                <div style={s.grid}>
                    {sheets.map(sheet => {
                        const ftColor = flatTypeColor(sheet.flatType);
                        const totalSqft = (sheet.items || [])
                            .reduce((sum, i) => sum + (parseFloat(i.sqft) || 0), 0);
                        return (
                            <div
                                key={sheet.id}
                                style={s.card}
                                onClick={() => navigate(
                                    `/coordinator-dashboard/tracker/${workOrderId}/sheets/${sheet.id}/edit`,
                                    { state: { workOrder, project } }
                                )}
                            >
                                <div style={s.cardTop}>
                                    <span style={{
                                        ...s.ftBadge,
                                        background:   ftColor.bg,
                                        color:        ftColor.color,
                                        border:       `1px solid ${ftColor.border}`,
                                    }}>
                                        {sheet.flatType || "—"}
                                    </span>
                                    <FaEdit style={{ color: "#94a3b8", fontSize: 14 }} />
                                </div>

                                <div style={s.flatNo}>
                                    <FaHome style={{ color: "#64748b", fontSize: 14 }} />
                                    &nbsp;Flat {sheet.flatNo || "—"}
                                </div>

                                <div style={s.cardMeta}>
                                    <FaCalendarAlt style={{ fontSize: 11, color: "#94a3b8" }} />
                                    &nbsp;{sheet.date || "—"}
                                </div>

                                <div style={s.cardStats}>
                                    <div style={s.stat}>
                                        <span style={s.statLabel}>Items</span>
                                        <span style={s.statVal}>{sheet.items?.length || 0}</span>
                                    </div>
                                    <div style={s.stat}>
                                        <span style={s.statLabel}>Total Sqft</span>
                                        <span style={{ ...s.statVal, color: "#0284c7" }}>
                                            {totalSqft.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
    );
}

const spin = { animation: "spin 1s linear infinite" };

const s = {
    page:       { maxWidth: 1400, margin: "0 auto", padding: "0 4px 40px", fontFamily: "'Inter',-apple-system,sans-serif" },
    pageHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, padding: "32px 0 24px", flexWrap: "wrap" },
    headerLeft: { display: "flex", flexDirection: "column", gap: 8 },
    backBtn:    { background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 13, color: "#64748b", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 },
    pageTitle:  { margin: 0, fontSize: 24, fontWeight: 800, color: "#0f172a" },
    metaLine:   { display: "flex", alignItems: "center", gap: 10, marginTop: 6, fontSize: 13 },
    metaItem:   { color: "#1e293b" },
    towerBadge: { background: "#fef3c7", color: "#92400e", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 12, border: "1px solid #fde68a" },
    createBtn:  { display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "linear-gradient(135deg,#0ea5e9,#0284c7)", color: "#fff", border: "none", borderRadius: 9, cursor: "pointer", fontWeight: 700, fontSize: 14 },
    errorBox:   { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 16px", marginBottom: 16, fontSize: 14 },
    centerMsg:  { padding: "60px", textAlign: "center", color: "#94a3b8", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" },
    emptyState: { display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 40px", background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0" },
    grid:       { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 },
    card:       { background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", padding: "20px", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 2px 6px rgba(0,0,0,0.04)" },
    cardTop:    { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    ftBadge:    { fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20 },
    flatNo:     { fontSize: 18, fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", marginBottom: 6 },
    cardMeta:   { fontSize: 12, color: "#94a3b8", display: "flex", alignItems: "center", marginBottom: 16 },
    cardStats:  { display: "flex", gap: 12, borderTop: "1px solid #f1f5f9", paddingTop: 14 },
    stat:       { flex: 1, display: "flex", flexDirection: "column", alignItems: "center" },
    statLabel:  { fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 },
    statVal:    { fontSize: 18, fontWeight: 800, color: "#1e293b" },
};
