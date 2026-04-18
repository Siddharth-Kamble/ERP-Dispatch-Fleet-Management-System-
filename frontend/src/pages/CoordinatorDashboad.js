
import React, { useState, useEffect } from "react";
import {
    FaBars,
    FaSignOutAlt,
    FaClipboardList,
    FaFolderOpen,
    FaPlusCircle,
    FaListAlt,
    FaArrowLeft,
    FaProjectDiagram,
    FaBuilding,
    FaTruck
} from "react-icons/fa";
import { useNavigate, useLocation, Outlet } from "react-router-dom";

// Importing the requisition sub-pages as per your requirement
import AddVehicleRequisition from "../Module/Requisition/Pages/AddVehicleRequisition";
import VehicleRequisitionList from "../Module/Requisition/Pages/VehicleRequisitionList";

function CoordinatorDashboard() {
    const navigate = useNavigate();
    const location = useLocation();

    // internal state for Requisition sub-navigation
    const [activePage, setActivePage] = useState("dashboard");
    const [requestCount, setRequestCount] = useState(0);
    const [error, setError] = useState("");


    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const departmentName = user?.role || "COORDINATOR";
    useEffect(() => {
      if (!user?.eCode) return;
        const loadRequestCount = async () => {
            try {
              const res = await fetch(
                `${process.env.REACT_APP_API_URL}/api/vehicle-requests/notifications/requester/${user?.eCode}/count`
              );
                const data = await res.json();
                setRequestCount(data.count || 0);
            } catch (err) {
                console.error("Failed to load request count", err);
            }
        };

        loadRequestCount();

        const interval = setInterval(loadRequestCount, 15000); // auto refresh
        return () => clearInterval(interval);
    }, []);




    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/");
    };

    // ✅ Routing & UI State Checks
    const isHome = location.pathname === "/coordinator-dashboard" && activePage === "dashboard";
    const isProjects = location.pathname === "/coordinator-dashboard/projects";
    const isFloorFlat = location.pathname === "/coordinator-dashboard/floor-flat";


    const goBack = () => {
        if (activePage === "create" || activePage === "view") {
            setActivePage("planning");
        } else if (activePage === "planning") {
            setActivePage("dashboard");
            navigate("/coordinator-dashboard");
        } else if (isProjects || isFloorFlat) {
            navigate("/coordinator-dashboard");
            setActivePage("dashboard");
        } else {
            navigate("/coordinator-dashboard");
            setActivePage("dashboard");
        }
    };

    const activeMenu = (path, internalPage = null) => {
        const isPathActive = location.pathname === path;
        const isInternalActive = internalPage && activePage === internalPage;

        return (isPathActive || isInternalActive)
            ? { ...styles.navItem, ...styles.activeNav }
            : styles.navItem;
    };

    return (
        <div style={styles.container}>
            {/* SIDEBAR */}
            <aside style={styles.sidebar}>
                <h2 style={styles.logo}>🚛 COORDINATOR</h2>

                <button
                    style={activeMenu("/coordinator-dashboard", "dashboard")}
                    onClick={() => {
                        setActivePage("dashboard");
                        navigate("/coordinator-dashboard");
                    }}
                >
                    <FaClipboardList style={styles.icon}/> Dashboard
                </button>

                <button
                    style={activeMenu("/coordinator-dashboard/planning", "planning")}
                    onClick={() => {
                        setActivePage("planning");
                        navigate("/coordinator-dashboard");
                    }}
                >
                    <FaFolderOpen style={styles.icon}/> Requisition Planning
                </button>

                <button
                    style={activeMenu("/coordinator-dashboard/projects")}
                    onClick={() => {
                        setActivePage("other");
                        navigate("/coordinator-dashboard/projects");
                    }}
                >
                    <FaProjectDiagram style={styles.icon}/> Projects
                </button>

                <button
                    style={activeMenu("/coordinator-dashboard/floor-flat")}
                    onClick={() => {
                        setActivePage("other");
                        navigate("/coordinator-dashboard/floor-flat");
                    }}
                >
                    <FaBuilding style={styles.icon}/> Floor & Flat Manager
                </button>
              <button
                  style={{ ...activeMenu("/coordinator-dashboard/vehicle-requests"), position: "relative" }}
                  onClick={() => {
                      setActivePage("other");
                      navigate("/coordinator-dashboard/vehicle-requests");
                  }}
              >
                  <FaTruck style={styles.icon}/> Vehicle Requests

                  {requestCount > 0 && (
                      <span style={{
                          position: "absolute",
                          top: "6px",
                          right: "10px",
                          background: "#ef4444",
                          color: "#fff",
                          borderRadius: "50%",
                          padding: "2px 6px",
                          fontSize: "10px",
                          fontWeight: "700",
                          minWidth: "18px",
                          textAlign: "center"
                      }}>
                          {requestCount}
                      </span>
                  )}
              </button>

                <button style={styles.logout} onClick={handleLogout}>
                    <FaSignOutAlt style={styles.icon}/> Logout
                </button>
            </aside>

            {/* MAIN CONTENT */}
            <div style={styles.mainWrapper}>
                <header style={styles.header}>
                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                        <FaBars color="#64748b" />
                        <span style={styles.title}>{departmentName} Module</span>
                    </div>
                    <div style={styles.userBadge}>{user?.fullName}</div>
                </header>

                <main style={styles.main}>
                    {(!isHome) && (
                        <button style={styles.backBtn} onClick={goBack}>
                            <FaArrowLeft/> Back
                        </button>
                    )}

                    {/* DASHBOARD OVERVIEW */}
                    {isHome && (
                        <div className="content-container">
                             <div className="section">
                                <h2>Overview</h2>
                                <div className="grid">
                                    <div className="card" style={{ borderTop: "4px solid #7c3aed" }} onClick={() => setActivePage("planning")}>
                                        <div style={{ fontSize: 30, color: "#7c3aed", marginBottom: 15 }}><FaFolderOpen /></div>
                                        <h3>Requisition Planning</h3>
                                        <p style={{ fontSize: '14px', color: '#64748b' }}>Manage Vehicle Requests</p>
                                    </div>

                                    <div className="card" style={{ borderTop: "4px solid #0ea5e9" }} onClick={() => navigate("/coordinator-dashboard/projects")}>
                                        <div style={{ fontSize: 30, color: "#0ea5e9", marginBottom: 15 }}><FaProjectDiagram /></div>
                                        <h3>Projects</h3>
                                        <p style={{ fontSize: '14px', color: '#64748b' }}>Project Manager Dashboard</p>
                                    </div>

                                    <div className="card" style={{ borderTop: "4px solid #f59e0b" }} onClick={() => navigate("/coordinator-dashboard/floor-flat")}>
                                        <div style={{ fontSize: 30, color: "#f59e0b", marginBottom: 15 }}><FaBuilding /></div>
                                        <h3>Floor & Flat Manager</h3>
                                        <p style={{ fontSize: '14px', color: '#64748b' }}>Unit Inventory & Details</p>
                                    </div>

                                    <div
                                      className="card"
                                      style={{ borderTop: "4px solid #22c55e" }}
                                      onClick={() => navigate("/coordinator-dashboard/vehicle-requests")}
                                    >
                                        <div style={{ fontSize: 30, color: "#22c55e", marginBottom: 15 }}>
                                            <FaTruck />
                                        </div>
                                        <h3>Vehicle Requests</h3>
                                        <p style={{ fontSize: '14px', color: '#64748b' }}>
                                            Raise & Track Vehicle Requests
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PLANNING SECTION (INTERNAL STATE LOGIC) */}
                    {activePage === "planning" && location.pathname === "/coordinator-dashboard" && (
                        <div className="content-container">
                            <div className="section">
                                <h2>Requisition Planning</h2>
                                <div className="grid">
                                    <div className="card" style={{ borderTop: "4px solid #2563eb" }} onClick={()=>setActivePage("create")}>
                                        <div style={{ fontSize: 30, color: "#2563eb", marginBottom: 15 }}><FaPlusCircle /></div>
                                        <h3>Create Requisition</h3>
                                    </div>
                                    <div className="card" style={{ borderTop: "4px solid #16a34a" }} onClick={()=>setActivePage("view")}>
                                        <div style={{ fontSize: 30, color: "#16a34a", marginBottom: 15 }}><FaListAlt /></div>
                                        <h3>View Requisitions</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* REQUISITION SUB-PAGES */}
                    {activePage === "create" && <AddVehicleRequisition/>}
                    {activePage === "view" && <VehicleRequisitionList/>}

                    {/* PROJECT/FLOOR-FLAT OUTLET */}
                    <Outlet />

                </main>

                <footer style={styles.footer}>
                    © 2026 OneDeoleela Transit System
                    <span>Coordinator Module • Version 1.0</span>
                </footer>
            </div>

            <style>{`
                .content-container { max-width: 1400px; margin: 0 auto; }
                .section { margin-bottom: 40px; }
                .section h2 { margin-bottom: 20px; font-size: 20px; color: #1e293b; border-left: 4px solid #1d4ed8; padding-left: 12px; }
                .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 25px; }
                .card { background: white; padding: 30px; border-radius: 15px; border: 1px solid #e2e8f0; cursor: pointer; transition: 0.3s; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
                .card:hover { transform: translateY(-5px); box-shadow: 0 10px 15px rgba(0,0,0,0.1); }
                .card h3 { margin: 10px 0 5px; font-size: 16px; font-weight: 600; color: #1e293b; }
            `}</style>
        </div>
    );
}

const styles = {
    container:{ display:"flex", height:"100vh", fontFamily:"'Inter', sans-serif", background:"#f8fafc" },
    sidebar:{ width:"260px", background:"#1e1b4b", padding:"25px", display:"flex", flexDirection:"column", color: "white" },
    logo:{ fontSize:"22px", fontWeight:"700", marginBottom:"40px", color:"#a78bfa" },
    navItem:{ display:"flex", alignItems:"center", padding:"12px 15px", marginBottom:"10px", border:"none", background:"transparent", cursor:"pointer", borderRadius:"8px", color:"#cbd5e1", fontSize: "15px", transition: "0.2s", textAlign: "left", width: "100%" },
    activeNav:{ background:"#2563eb", color:"#fff", fontWeight: "600" },
    icon:{ marginRight:"12px" },
    logout:{ marginTop:"auto", padding:"12px", background:"#ef4444", border:"none", color:"#fff", borderRadius:"8px", cursor:"pointer", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center" },
    mainWrapper:{ flex:1, display:"flex", flexDirection:"column" },
    header:{ height:"60px", background:"#fff", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 25px", borderBottom:"1px solid #e2e8f0" },
    title:{ fontWeight:"bold", color: "#334155" },
    userBadge:{ background:"#1d4ed8", color:"#fff", padding:"6px 16px", borderRadius:"20px", fontSize:"13px", fontWeight: "600" },
    main:{ padding:"30px", flex:1, overflowY:"auto" },
    backBtn:{ marginBottom:"20px", padding:"8px 16px", border:"none", background:"#1d4ed8", color:"#fff", borderRadius:"6px", cursor:"pointer", display: "flex", alignItems: "center", gap: "8px", fontWeight: "600" },
    footer:{ height:"50px", background:"#fff", borderTop:"1px solid #e2e8f0", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 25px", fontSize:"13px", color:"#64748b" }
};

export default CoordinatorDashboard;