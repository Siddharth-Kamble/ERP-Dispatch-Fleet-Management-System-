import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaClipboardList, FaPlus, FaEye, FaSearch,
    FaProjectDiagram, FaCalendarAlt, FaListOl
} from "react-icons/fa";

export default function WorkOrderListPage() {
    const navigate = useNavigate();

    const [projects, setProjects]           = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [workOrders, setWorkOrders]       = useState([]);
    const [searchTerm, setSearchTerm]       = useState("");
    const [loading, setLoading]             = useState(false);
    const [error, setError]                 = useState("");

    // ── Load all projects on mount ─────────────────────────────────────────
    useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${process.env.REACT_APP_API_URL}/projects`);
                const data = await res.json();
                setProjects(data);
            } catch {
                setError("Failed to load projects.");
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    // ── Load work orders when project selected ─────────────────────────────
    const handleSelectProject = async (project) => {
        setSelectedProject(project);
        setWorkOrders([]);
        setLoading(true);
        try {
            const res = await fetch(
                `${process.env.REACT_APP_API_URL}/api/work-orders/by-project/${encodeURIComponent(project.projectName)}`
            );
            const data = await res.json();
            setWorkOrders(Array.isArray(data) ? data : []);
        } catch {
            setError("Failed to load work orders.");
        } finally {
            setLoading(false);
        }
    };

    const filtered = projects.filter(p =>
        p.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.projectCode?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ── Status badge color ────────────────────────────────────────────────
    const statusColor = (s) => {
        if (!s) return "#94a3b8";
        const l = s.toLowerCase();
        if (l.includes("active") || l.includes("ongoing")) return "#16a34a";
        if (l.includes("complete")) return "#2563eb";
        if (l.includes("hold")) return "#f59e0b";
        return "#7c3aed";
    };

    return (
        <div style={s.wrapper}>

            {/* ── Header ─────────────────────────────────────────────────── */}
            <div style={s.header}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <FaClipboardList style={{ color: "#8b5cf6", fontSize: 26 }} />
                    <div>
                        <h1 style={s.title}>Work Orders</h1>
                        <p style={s.subtitle}>Select a project to view or create work orders</p>
                    </div>
                </div>
            </div>

            {error && <div style={s.errorBox}>{error}</div>}

            {/* ── Two-column layout ──────────────────────────────────────── */}
            <div style={s.layout}>

                {/* LEFT — Project list */}
                <div style={s.leftPanel}>
                    <div style={s.panelHeader}>
                        <FaProjectDiagram style={{ color: "#0ea5e9" }} />
                        <span style={s.panelTitle}>All Projects</span>
                        <span style={s.badge}>{projects.length}</span>
                    </div>

                    {/* Search */}
                    <div style={s.searchBox}>
                        <FaSearch style={{ color: "#94a3b8", fontSize: 13 }} />
                        <input
                            style={s.searchInput}
                            placeholder="Search project..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {loading && !selectedProject && (
                        <div style={s.center}>Loading projects…</div>
                    )}

                    <div style={s.projectList}>
                        {filtered.map(p => (
                            <div
                                key={p.projectId}
                                style={{
                                    ...s.projectCard,
                                    ...(selectedProject?.projectId === p.projectId ? s.projectCardActive : {})
                                }}
                                onClick={() => handleSelectProject(p)}
                            >
                                <div style={s.projectName}>{p.projectName}</div>
                                <div style={s.projectMeta}>
                                    <span style={{ color: "#64748b", fontSize: 12 }}>{p.projectCode}</span>
                                    <span style={{
                                        ...s.statusPill,
                                        background: statusColor(p.projectStatus) + "20",
                                        color: statusColor(p.projectStatus)
                                    }}>
                                        {p.projectStatus || "N/A"}
                                    </span>
                                </div>
                                {p.siteName && (
                                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
                                        📍 {p.siteName}
                                    </div>
                                )}
                            </div>
                        ))}
                        {filtered.length === 0 && !loading && (
                            <div style={s.center}>No projects found</div>
                        )}
                    </div>
                </div>

                {/* RIGHT — Work Orders for selected project */}
                <div style={s.rightPanel}>
                    {!selectedProject ? (
                        <div style={s.emptyState}>
                            <FaClipboardList style={{ fontSize: 56, color: "#e2e8f0", marginBottom: 16 }} />
                            <p style={{ color: "#94a3b8", fontSize: 16 }}>
                                Select a project from the left to view its work orders
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Project summary bar */}
                            <div style={s.projectBar}>
                                <div>
                                    <div style={s.projectBarName}>{selectedProject.projectName}</div>
                                    <div style={{ fontSize: 13, color: "#64748b" }}>
                                        {selectedProject.projectCode} • {selectedProject.city || ""} {selectedProject.state || ""}
                                    </div>
                                </div>
                                <button
                                    style={s.createBtn}
                                    onClick={() => navigate(
                                        `/coordinator-dashboard/work-orders/create?project=${encodeURIComponent(selectedProject.projectName)}`
                                    )}
                                >
                                    <FaPlus /> &nbsp;Create Work Order
                                </button>
                            </div>

                            {loading && <div style={s.center}>Loading work orders…</div>}

                            {/* Work order cards */}
                            {!loading && workOrders.length === 0 && (
                                <div style={s.emptyState}>
                                    <FaListOl style={{ fontSize: 44, color: "#e2e8f0", marginBottom: 12 }} />
                                    <p style={{ color: "#94a3b8" }}>No work orders yet for this project</p>
                                    <button
                                        style={{ ...s.createBtn, marginTop: 16 }}
                                        onClick={() => navigate(
                                            `/coordinator-dashboard/work-orders/create?project=${encodeURIComponent(selectedProject.projectName)}`
                                        )}
                                    >
                                        <FaPlus /> &nbsp;Create First Work Order
                                    </button>
                                </div>
                            )}

                            <div style={s.woGrid}>
                                {workOrders.map(wo => (
                                    <div key={wo.id} style={s.woCard}>
                                        <div style={s.woCardHeader}>
                                            <span style={s.woNo}>{wo.workOrderNo}</span>
                                            <span style={s.woItemCount}>
                                                {wo.items?.length || 0} items
                                            </span>
                                        </div>
                                        <div style={s.woDate}>
                                            <FaCalendarAlt style={{ color: "#94a3b8", marginRight: 6 }} />
                                            {wo.date || "—"}
                                        </div>
                                        <div style={s.woStats}>
                                            <div style={s.woStat}>
                                                <span style={s.woStatLabel}>Total Sqft</span>
                                                <span style={{ ...s.woStatVal, color: "#2563eb" }}>
                                                    {wo.items?.reduce((s, r) => s + (parseFloat(r.woQtySqft) || 0), 0).toFixed(2)}
                                                </span>
                                            </div>
                                            <div style={s.woStat}>
                                                <span style={s.woStatLabel}>Total Nos</span>
                                                <span style={{ ...s.woStatVal, color: "#7c3aed" }}>
                                                    {wo.items?.reduce((s, r) => s + (parseFloat(r.woQtyNos) || 0), 0)}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            style={s.viewBtn}
                                            onClick={() => navigate(
                                                `/coordinator-dashboard/work-orders/${wo.id}?project=${encodeURIComponent(selectedProject.projectName)}`
                                            )}
                                        >
                                            <FaEye /> &nbsp;View / Edit
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Styles ──────────────────────────────────────────────────────────────────
const s = {
    wrapper:    { maxWidth: 1400, margin: "0 auto", padding: "0 0 40px" },
    header:     { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
    title:      { margin: 0, fontSize: 22, fontWeight: 700, color: "#1e293b" },
    subtitle:   { margin: "4px 0 0", fontSize: 13, color: "#64748b" },
    errorBox:   { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 8, padding: "12px 16px", marginBottom: 16 },

    layout:     { display: "grid", gridTemplateColumns: "320px 1fr", gap: 24, alignItems: "start" },

    // Left panel
    leftPanel:  { background: "#fff", borderRadius: 15, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 6px rgba(0,0,0,0.04)" },
    panelHeader:{ display: "flex", alignItems: "center", gap: 10, padding: "18px 20px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" },
    panelTitle: { fontWeight: 700, color: "#1e293b", fontSize: 15, flex: 1 },
    badge:      { background: "#e0e7ff", color: "#4338ca", fontSize: 12, fontWeight: 700, padding: "2px 8px", borderRadius: 12 },
    searchBox:  { display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderBottom: "1px solid #f1f5f9" },
    searchInput:{ flex: 1, border: "none", outline: "none", fontSize: 13, color: "#1e293b", background: "transparent" },
    projectList:{ maxHeight: 520, overflowY: "auto" },
    projectCard:{ padding: "14px 20px", cursor: "pointer", borderBottom: "1px solid #f8fafc", transition: "0.15s" },
    projectCardActive: { background: "#eff6ff", borderLeft: "4px solid #2563eb" },
    projectName:{ fontWeight: 600, color: "#1e293b", fontSize: 14, marginBottom: 6 },
    projectMeta:{ display: "flex", justifyContent: "space-between", alignItems: "center" },
    statusPill: { fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 10 },

    // Right panel
    rightPanel: { background: "#fff", borderRadius: 15, border: "1px solid #e2e8f0", minHeight: 400, boxShadow: "0 4px 6px rgba(0,0,0,0.04)" },
    emptyState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 40px", textAlign: "center" },
    projectBar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc", borderRadius: "15px 15px 0 0" },
    projectBarName: { fontWeight: 700, color: "#1e293b", fontSize: 16 },
    createBtn:  { display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", background: "#8b5cf6", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13 },

    woGrid:     { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16, padding: 20 },
    woCard:     { background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0", padding: 18 },
    woCardHeader:{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
    woNo:       { fontWeight: 700, color: "#1e293b", fontSize: 15 },
    woItemCount:{ background: "#e0e7ff", color: "#4338ca", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 10 },
    woDate:     { display: "flex", alignItems: "center", fontSize: 12, color: "#64748b", marginBottom: 12 },
    woStats:    { display: "flex", gap: 12, marginBottom: 14 },
    woStat:     { flex: 1, background: "#fff", borderRadius: 8, padding: "8px 12px", border: "1px solid #e2e8f0", textAlign: "center" },
    woStatLabel:{ display: "block", fontSize: 11, color: "#94a3b8", marginBottom: 2 },
    woStatVal:  { fontSize: 18, fontWeight: 700 },
    viewBtn:    { display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", padding: "9px", background: "#1d4ed8", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 600, fontSize: 13 },

    center:     { padding: 30, textAlign: "center", color: "#94a3b8" },
};
