//import React, { useState, useEffect } from "react";
//import { useNavigate } from "react-router-dom";
//import {
//    FaLayerGroup, FaSearch, FaBuilding,
//    FaClipboardList, FaChevronRight, FaSpinner,
//    FaCalendarAlt, FaListOl, FaPlusCircle
//} from "react-icons/fa";
//
//export default function TrackerPage() {
//    const navigate = useNavigate();
//
//    const [projects,        setProjects]        = useState([]);
//    const [loadingProjects, setLoadingProjects]  = useState(true);
//    const [search,          setSearch]           = useState("");
//    const [selectedProject, setSelectedProject]  = useState(null);
//    const [workOrders,      setWorkOrders]       = useState([]);
//    const [loadingWOs,      setLoadingWOs]       = useState(false);
//    const [error,           setError]            = useState("");
//
//    // Load all projects
//    useEffect(() => {
//        fetch(`${process.env.REACT_APP_API_URL}/projects`)
//            .then(r => r.json())
//            .then(data => { setProjects(data); setLoadingProjects(false); })
//            .catch(() => { setError("Failed to load projects."); setLoadingProjects(false); });
//    }, []);
//
//    // Load WOs when project selected
//    const handleSelectProject = async (project) => {
//        setSelectedProject(project);
//        setWorkOrders([]);
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
//    const filtered = projects.filter(p =>
//        p.projectName?.toLowerCase().includes(search.toLowerCase()) ||
//        p.projectCode?.toLowerCase().includes(search.toLowerCase()) ||
//        p.city?.toLowerCase().includes(search.toLowerCase())
//    );
//
//    const statusColor = (s) => ({
//        "Active":    "#16a34a",
//        "Completed": "#2563eb",
//        "On Hold":   "#f59e0b",
//        "Cancelled": "#ef4444"
//    }[s] || "#64748b");
//
//    return (
//        <div style={s.wrapper}>
//            {/* Header */}
//            <div style={s.pageHeader}>
//                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
//                    <div style={s.headerIcon}><FaLayerGroup /></div>
//                    <div>
//                        <h1 style={s.pageTitle}>Info Sheet Tracker</h1>
//                        <p style={s.pageSubtitle}>
//                            Select a project → select a work order → manage flat info sheets
//                        </p>
//                    </div>
//                </div>
//            </div>
//
//            {error && <div style={s.errorBox}>{error}</div>}
//
//            <div style={s.panels}>
//                {/* LEFT — Projects */}
//                <div style={s.leftPanel}>
//                    <div style={s.panelHeader}>
//                        <span style={s.panelTitle}>
//                            <FaBuilding style={{ marginRight: 8, color: "#0ea5e9" }} />
//                            Projects ({filtered.length})
//                        </span>
//                        <div style={s.searchBox}>
//                            <FaSearch style={{ color: "#94a3b8", fontSize: 13 }} />
//                            <input
//                                style={s.searchInput}
//                                placeholder="Search projects…"
//                                value={search}
//                                onChange={e => setSearch(e.target.value)}
//                            />
//                        </div>
//                    </div>
//
//                    <div style={s.projectList}>
//                        {loadingProjects ? (
//                            <div style={s.centerMsg}><FaSpinner style={spin} />&nbsp;Loading…</div>
//                        ) : filtered.length === 0 ? (
//                            <div style={s.centerMsg}>No projects found.</div>
//                        ) : filtered.map(p => (
//                            <div
//                                key={p.projectId}
//                                style={{
//                                    ...s.projectCard,
//                                    ...(selectedProject?.projectId === p.projectId
//                                        ? s.projectCardActive : {})
//                                }}
//                                onClick={() => handleSelectProject(p)}
//                            >
//                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
//                                    <div>
//                                        <div style={s.projName}>{p.projectName}</div>
//                                        <div style={s.projCode}>{p.projectCode}</div>
//                                    </div>
//                                    <span style={{
//                                        ...s.statusBadge,
//                                        background: statusColor(p.projectStatus) + "22",
//                                        color:      statusColor(p.projectStatus)
//                                    }}>
//                                        {p.projectStatus || "—"}
//                                    </span>
//                                </div>
//                                <div style={s.projMeta}>
//                                    <span>{p.city || "—"}</span>
//                                    <span>{p.projectManager || "—"}</span>
//                                </div>
//                            </div>
//                        ))}
//                    </div>
//                </div>
//
//                {/* RIGHT — Work Orders */}
//                <div style={s.rightPanel}>
//                    {!selectedProject ? (
//                        <div style={s.emptyState}>
//                            <FaClipboardList style={{ fontSize: 52, color: "#cbd5e1", marginBottom: 16 }} />
//                            <div style={{ fontSize: 17, color: "#94a3b8", fontWeight: 600 }}>
//                                Select a project
//                            </div>
//                            <div style={{ fontSize: 14, color: "#cbd5e1", marginTop: 6 }}>
//                                Work orders will appear here
//                            </div>
//                        </div>
//                    ) : (
//                        <>
//                            <div style={s.projInfoBar}>
//                                <div>
//                                    <div style={s.projInfoName}>{selectedProject.projectName}</div>
//                                    <div style={s.projInfoMeta}>
//                                        {selectedProject.projectCode}&nbsp;•&nbsp;
//                                        {selectedProject.city}, {selectedProject.state}
//                                    </div>
//                                </div>
//                            </div>
//
//                            {loadingWOs ? (
//                                <div style={s.centerMsg}><FaSpinner style={spin} />&nbsp;Loading work orders…</div>
//                            ) : workOrders.length === 0 ? (
//                                <div style={s.emptyState}>
//                                    <FaListOl style={{ fontSize: 40, color: "#e2e8f0", marginBottom: 12 }} />
//                                    <div style={{ color: "#94a3b8", fontWeight: 600 }}>No work orders found</div>
//                                    <div style={{ fontSize: 13, color: "#cbd5e1", marginTop: 4 }}>
//                                        Create a work order first
//                                    </div>
//                                </div>
//                            ) : (
//                                <div style={s.woList}>
//                                    <div style={s.woListHeader}>
//                                        <span style={{ fontWeight: 700, color: "#1e293b", fontSize: 14 }}>
//                                            Work Orders — select one to manage info sheets
//                                        </span>
//                                    </div>
//                                    {workOrders.map(wo => (
//                                        <div
//                                            key={wo.id}
//                                            style={s.woCard}
//                                            onClick={() => navigate(
//                                                `/coordinator-dashboard/tracker/${wo.id}/sheets`,
//                                                { state: { workOrder: wo, project: selectedProject } }
//                                            )}
//                                        >
//                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//                                                <div>
//                                                    <div style={s.woNo}>{wo.workOrderNo}</div>
//                                                    <div style={s.woMeta}>
//                                                        {wo.towerName && (
//                                                            <span style={s.towerBadge}>{wo.towerName}</span>
//                                                        )}
//                                                        <FaCalendarAlt style={{ fontSize: 11 }} />
//                                                        &nbsp;{wo.date || "—"}
//                                                        &nbsp;&nbsp;
//                                                        <FaListOl style={{ fontSize: 11 }} />
//                                                        &nbsp;{wo.items?.length || 0} items
//                                                    </div>
//                                                </div>
//                                                <div style={s.woArrow}>
//                                                    <span style={{ fontSize: 12, fontWeight: 600, marginRight: 6 }}>
//                                                        View Sheets
//                                                    </span>
//                                                    <FaChevronRight style={{ fontSize: 12 }} />
//                                                </div>
//                                            </div>
//                                        </div>
//                                    ))}
//                                </div>
//                            )}
//                        </>
//                    )}
//                </div>
//            </div>
//
//            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
//        </div>
//    );
//}
//
//const spin = { animation: "spin 1s linear infinite" };
//
//const s = {
//    wrapper:           { maxWidth: 1400, margin: "0 auto", padding: "0 0 40px" },
//    pageHeader:        { display: "flex", alignItems: "center", marginBottom: 28, padding: "20px 4px 0" },
//    headerIcon:        { width: 48, height: 48, background: "linear-gradient(135deg,#0ea5e9,#0284c7)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 22 },
//    pageTitle:         { margin: 0, fontSize: 24, fontWeight: 800, color: "#1e293b" },
//    pageSubtitle:      { margin: "3px 0 0", fontSize: 13, color: "#64748b" },
//    errorBox:          { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 16px", marginBottom: 16, fontSize: 14 },
//    panels:            { display: "grid", gridTemplateColumns: "360px 1fr", gap: 20, alignItems: "start" },
//    leftPanel:         { background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 4px 6px rgba(0,0,0,0.04)", overflow: "hidden" },
//    panelHeader:       { padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: 10 },
//    panelTitle:        { fontWeight: 700, color: "#1e293b", fontSize: 15, display: "flex", alignItems: "center" },
//    searchBox:         { display: "flex", alignItems: "center", gap: 8, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 12px" },
//    searchInput:       { border: "none", background: "transparent", outline: "none", fontSize: 13, color: "#1e293b", flex: 1 },
//    projectList:       { maxHeight: "calc(100vh - 300px)", overflowY: "auto" },
//    projectCard:       { padding: "14px 20px", cursor: "pointer", borderBottom: "1px solid #f8fafc", transition: "background 0.15s", borderLeft: "4px solid transparent" },
//    projectCardActive: { background: "#e0f2fe", borderLeft: "4px solid #0284c7" },
//    projName:          { fontWeight: 700, color: "#1e293b", fontSize: 14 },
//    projCode:          { fontSize: 12, color: "#64748b", marginTop: 2 },
//    statusBadge:       { fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20 },
//    projMeta:          { display: "flex", gap: 14, marginTop: 8, fontSize: 12, color: "#94a3b8" },
//    rightPanel:        { background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 4px 6px rgba(0,0,0,0.04)", minHeight: 400 },
//    emptyState:        { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 40px" },
//    projInfoBar:       { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #f1f5f9", flexWrap: "wrap", gap: 12 },
//    projInfoName:      { fontWeight: 800, color: "#1e293b", fontSize: 17 },
//    projInfoMeta:      { fontSize: 13, color: "#64748b", marginTop: 3 },
//    woList:            { padding: "0" },
//    woListHeader:      { padding: "14px 20px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" },
//    woCard:            { padding: "16px 20px", borderBottom: "1px solid #f1f5f9", cursor: "pointer", transition: "background 0.15s" },
//    woNo:              { fontWeight: 700, color: "#1e293b", fontSize: 15 },
//    woMeta:            { display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#94a3b8", marginTop: 6 },
//    towerBadge:        { background: "#fef3c7", color: "#92400e", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 12, border: "1px solid #fde68a" },
//    woArrow:           { display: "flex", alignItems: "center", color: "#0284c7", fontWeight: 600 },
//    centerMsg:         { padding: "40px", textAlign: "center", color: "#94a3b8", fontSize: 14 },
//};


import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaLayerGroup, FaSearch, FaBuilding,
    FaClipboardList, FaSpinner, FaCalendarAlt,
    FaListOl, FaPlusCircle, FaEdit, FaCheckCircle
} from "react-icons/fa";

export default function TrackerPage() {
    const navigate = useNavigate();

    const [projects,        setProjects]        = useState([]);
    const [loadingProjects, setLoadingProjects]  = useState(true);
    const [search,          setSearch]           = useState("");
    const [selectedProject, setSelectedProject]  = useState(null);
    const [workOrders,      setWorkOrders]       = useState([]);
    const [loadingWOs,      setLoadingWOs]       = useState(false);
    // Map of workOrderId → infoSheet (null if none exists)
    const [sheetMap,        setSheetMap]         = useState({});
    const [error,           setError]            = useState("");


const locationState = location.state;

useEffect(() => {
    if (!locationState?.autoSelectProject) return;
    // Wait for projects to load, then auto-select
    setAutoSelectTarget(locationState.autoSelectProject);
}, []);

// ADD this new state near your other useState declarations:
const [autoSelectTarget, setAutoSelectTarget] = useState(null);

// ADD this new useEffect after the projects-load useEffect:
useEffect(() => {
    if (!autoSelectTarget || loadingProjects || projects.length === 0) return;
    // Find the matching project and select it
    const match = projects.find(
        p => p.projectName === autoSelectTarget.projectName ||
             p.projectId   === autoSelectTarget.projectId
    );
    if (match) {
        handleSelectProject(match);
        setAutoSelectTarget(null);
    }
}, [autoSelectTarget, loadingProjects, projects]);
    // Load all projects
    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_URL}/projects`)
            .then(r => r.json())
            .then(data => { setProjects(data); setLoadingProjects(false); })
            .catch(() => { setError("Failed to load projects."); setLoadingProjects(false); });
    }, []);

    // When project selected → load its WOs → then load info sheets for each WO
    const handleSelectProject = async (project) => {
        setSelectedProject(project);
        setWorkOrders([]);
        setSheetMap({});
        setLoadingWOs(true);
        try {
            // Step 1: fetch work orders
            const woRes  = await fetch(
                `${process.env.REACT_APP_API_URL}/api/work-orders/by-project/${encodeURIComponent(project.projectName)}`
            );
            const wos = await woRes.json();
            const woList = Array.isArray(wos) ? wos : [];
            setWorkOrders(woList);

            // Step 2: for each WO fetch its info sheets in parallel
            const sheetResults = await Promise.all(
                woList.map(wo =>
                    fetch(`${process.env.REACT_APP_API_URL}/api/info-sheets/by-work-order/${wo.id}`)
                        .then(r => r.json())
                        .then(data => ({ woId: wo.id, sheets: Array.isArray(data) ? data : [] }))
                        .catch(() => ({ woId: wo.id, sheets: [] }))
                )
            );

            // Build map: woId → first sheet (or null)
            const map = {};
            sheetResults.forEach(({ woId, sheets }) => {
                map[woId] = sheets.length > 0 ? sheets[0] : null;
            });
            setSheetMap(map);
        } catch {
            setWorkOrders([]);
        } finally {
            setLoadingWOs(false);
        }
    };

    const filtered = projects.filter(p =>
        p.projectName?.toLowerCase().includes(search.toLowerCase()) ||
        p.projectCode?.toLowerCase().includes(search.toLowerCase()) ||
        p.city?.toLowerCase().includes(search.toLowerCase())
    );

    const statusColor = (s) => ({
        "Active":    "#16a34a",
        "Completed": "#2563eb",
        "On Hold":   "#f59e0b",
        "Cancelled": "#ef4444"
    }[s] || "#64748b");

    return (
        <div style={s.wrapper}>
            {/* Header */}
            <div style={s.pageHeader}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={s.headerIcon}><FaLayerGroup /></div>
                    <div>
                        <h1 style={s.pageTitle}>Info Sheet Tracker</h1>
                        <p style={s.pageSubtitle}>
                            Select a project → select a work order → create or update info sheets
                        </p>
                    </div>
                </div>
            </div>

            {error && <div style={s.errorBox}>{error}</div>}

            <div style={s.panels}>
                {/* LEFT — Projects */}
                <div style={s.leftPanel}>
                    <div style={s.panelHeader}>
                        <span style={s.panelTitle}>
                            <FaBuilding style={{ marginRight: 8, color: "#0ea5e9" }} />
                            Projects ({filtered.length})
                        </span>
                        <div style={s.searchBox}>
                            <FaSearch style={{ color: "#94a3b8", fontSize: 13 }} />
                            <input
                                style={s.searchInput}
                                placeholder="Search projects…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div style={s.projectList}>
                        {loadingProjects ? (
                            <div style={s.centerMsg}><FaSpinner style={spin} />&nbsp;Loading…</div>
                        ) : filtered.length === 0 ? (
                            <div style={s.centerMsg}>No projects found.</div>
                        ) : filtered.map(p => (
                            <div
                                key={p.projectId}
                                style={{
                                    ...s.projectCard,
                                    ...(selectedProject?.projectId === p.projectId ? s.projectCardActive : {})
                                }}
                                onClick={() => handleSelectProject(p)}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <div>
                                        <div style={s.projName}>{p.projectName}</div>
                                        <div style={s.projCode}>{p.projectCode}</div>
                                    </div>
                                    <span style={{
                                        ...s.statusBadge,
                                        background: statusColor(p.projectStatus) + "22",
                                        color:      statusColor(p.projectStatus)
                                    }}>
                                        {p.projectStatus || "—"}
                                    </span>
                                </div>
                                <div style={s.projMeta}>
                                    <span>{p.city || "—"}</span>
                                    <span>{p.projectManager || "—"}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT — Work Orders with sheet status */}
                <div style={s.rightPanel}>
                    {!selectedProject ? (
                        <div style={s.emptyState}>
                            <FaClipboardList style={{ fontSize: 52, color: "#cbd5e1", marginBottom: 16 }} />
                            <div style={{ fontSize: 17, color: "#94a3b8", fontWeight: 600 }}>
                                Select a project
                            </div>
                            <div style={{ fontSize: 14, color: "#cbd5e1", marginTop: 6 }}>
                                Work orders will appear here
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Project info bar */}
                            <div style={s.projInfoBar}>
                                <div>
                                    <div style={s.projInfoName}>{selectedProject.projectName}</div>
                                    <div style={s.projInfoMeta}>
                                        {selectedProject.projectCode}&nbsp;•&nbsp;
                                        {selectedProject.city}, {selectedProject.state}
                                    </div>
                                </div>
                            </div>

                            {loadingWOs ? (
                                <div style={s.centerMsg}>
                                    <FaSpinner style={spin} />&nbsp;Loading work orders…
                                </div>
                            ) : workOrders.length === 0 ? (
                                <div style={s.emptyState}>
                                    <FaListOl style={{ fontSize: 40, color: "#e2e8f0", marginBottom: 12 }} />
                                    <div style={{ color: "#94a3b8", fontWeight: 600 }}>No work orders found</div>
                                    <div style={{ fontSize: 13, color: "#cbd5e1", marginTop: 4 }}>
                                        Create a work order first from the Work Orders module
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div style={s.woListHeader}>
                                        <span style={{ fontWeight: 700, color: "#1e293b", fontSize: 14 }}>
                                            Work Orders
                                        </span>
                                        <span style={s.hintText}>
                                            Click a work order to create or update its info sheet
                                        </span>
                                    </div>

                                    {workOrders.map(wo => {
                                        const existingSheet = sheetMap[wo.id];
                                        const hasSheet      = Boolean(existingSheet);
                                        const totalFlats    = hasSheet ? (existingSheet.flats?.length || 0) : 0;
                                        const totalSqft     = hasSheet
                                            ? (existingSheet.flats || []).reduce((sum, fl) =>
                                                sum + (fl.items || []).reduce((s2, it) =>
                                                    s2 + (parseFloat(it.sqft) || 0), 0), 0)
                                            : 0;

                                        return (
                                            <div key={wo.id} style={s.woCard}>
                                                {/* WO info row */}
                                                <div style={s.woInfoRow}>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                            <span style={s.woNo}>{wo.workOrderNo}</span>
                                                            {wo.towerName && (
                                                                <span style={s.towerBadge}>{wo.towerName}</span>
                                                            )}
                                                            {/* Sheet status indicator */}
                                                            {hasSheet ? (
                                                                <span style={s.sheetExistsBadge}>
                                                                    <FaCheckCircle style={{ fontSize: 10 }} />
                                                                    &nbsp;Sheet Created
                                                                </span>
                                                            ) : (
                                                                <span style={s.noSheetBadge}>
                                                                    No Sheet Yet
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div style={s.woMeta}>
                                                            <FaCalendarAlt style={{ fontSize: 11 }} />
                                                            &nbsp;{wo.date || "—"}
                                                            &nbsp;&nbsp;
                                                            <FaListOl style={{ fontSize: 11 }} />
                                                            &nbsp;{wo.items?.length || 0} WO items
                                                            {hasSheet && (
                                                                <>
                                                                    &nbsp;&nbsp;•&nbsp;&nbsp;
                                                                    <span style={{ color: "#0284c7", fontWeight: 600 }}>
                                                                        {totalFlats} flat{totalFlats !== 1 ? "s" : ""}
                                                                    </span>
                                                                    &nbsp;&nbsp;•&nbsp;&nbsp;
                                                                    <span style={{ color: "#059669", fontWeight: 600 }}>
                                                                        {totalSqft.toFixed(2)} sqft
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Action button — Create or Edit */}
                                                    {hasSheet ? (
                                                        <button
                                                            style={s.editBtn}
                                                            onClick={() => navigate(
                                                                `/coordinator-dashboard/tracker/${wo.id}/sheets/${existingSheet.id}/edit`,
                                                                { state: { workOrder: wo, project: selectedProject } }
                                                            )}
                                                        >
                                                            <FaEdit style={{ fontSize: 12 }} />
                                                            &nbsp;View / Edit Sheet
                                                        </button>
                                                    ) : (
                                                        <button
                                                            style={s.createSheetBtn}
                                                            onClick={() => navigate(
                                                                `/coordinator-dashboard/tracker/${wo.id}/sheets/create`,
                                                                { state: { workOrder: wo, project: selectedProject } }
                                                            )}
                                                        >
                                                            <FaPlusCircle style={{ fontSize: 12 }} />
                                                            &nbsp;Create Info Sheet
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
                .wo-card-hover:hover { background: #f8fafc !important; }
            `}</style>
        </div>
    );
}

const spin = { animation: "spin 1s linear infinite" };

const s = {
    wrapper:           { maxWidth: 1400, margin: "0 auto", padding: "0 0 40px" },
    pageHeader:        { display: "flex", alignItems: "center", marginBottom: 28, padding: "20px 4px 0" },
    headerIcon:        { width: 48, height: 48, background: "linear-gradient(135deg,#0ea5e9,#0284c7)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 22 },
    pageTitle:         { margin: 0, fontSize: 24, fontWeight: 800, color: "#1e293b" },
    pageSubtitle:      { margin: "3px 0 0", fontSize: 13, color: "#64748b" },
    errorBox:          { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 16px", marginBottom: 16, fontSize: 14 },
    panels:            { display: "grid", gridTemplateColumns: "360px 1fr", gap: 20, alignItems: "start" },
    leftPanel:         { background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 4px 6px rgba(0,0,0,0.04)", overflow: "hidden" },
    panelHeader:       { padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: 10 },
    panelTitle:        { fontWeight: 700, color: "#1e293b", fontSize: 15, display: "flex", alignItems: "center" },
    searchBox:         { display: "flex", alignItems: "center", gap: 8, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 12px" },
    searchInput:       { border: "none", background: "transparent", outline: "none", fontSize: 13, color: "#1e293b", flex: 1 },
    projectList:       { maxHeight: "calc(100vh - 300px)", overflowY: "auto" },
    projectCard:       { padding: "14px 20px", cursor: "pointer", borderBottom: "1px solid #f8fafc", transition: "background 0.15s", borderLeft: "4px solid transparent" },
    projectCardActive: { background: "#e0f2fe", borderLeft: "4px solid #0284c7" },
    projName:          { fontWeight: 700, color: "#1e293b", fontSize: 14 },
    projCode:          { fontSize: 12, color: "#64748b", marginTop: 2 },
    statusBadge:       { fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20 },
    projMeta:          { display: "flex", gap: 14, marginTop: 8, fontSize: 12, color: "#94a3b8" },
    rightPanel:        { background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 4px 6px rgba(0,0,0,0.04)", minHeight: 400, overflow: "hidden" },
    emptyState:        { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 40px" },
    projInfoBar:       { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #f1f5f9", background: "#fafbfc" },
    projInfoName:      { fontWeight: 800, color: "#1e293b", fontSize: 17 },
    projInfoMeta:      { fontSize: 13, color: "#64748b", marginTop: 3 },
    woListHeader:      { padding: "12px 20px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "space-between" },
    hintText:          { fontSize: 12, color: "#94a3b8", fontStyle: "italic" },
    woCard:            { borderBottom: "1px solid #f1f5f9", transition: "background 0.15s" },
    woInfoRow:         { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", gap: 12, flexWrap: "wrap" },
    woNo:              { fontWeight: 700, color: "#1e293b", fontSize: 15 },
    towerBadge:        { background: "#fef3c7", color: "#92400e", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 12, border: "1px solid #fde68a" },
    sheetExistsBadge:  { background: "#dcfce7", color: "#16a34a", fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 12, border: "1px solid #bbf7d0", display: "inline-flex", alignItems: "center" },
    noSheetBadge:      { background: "#f1f5f9", color: "#94a3b8", fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 12, border: "1px solid #e2e8f0" },
    woMeta:            { display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#94a3b8", marginTop: 6 },
    createSheetBtn:    { display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", background: "linear-gradient(135deg,#0ea5e9,#0284c7)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13, whiteSpace: "nowrap" },
    editBtn:           { display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", background: "#ede9fe", color: "#7c3aed", border: "1px solid #ddd6fe", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13, whiteSpace: "nowrap" },
    centerMsg:         { padding: "40px", textAlign: "center", color: "#94a3b8", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
};
