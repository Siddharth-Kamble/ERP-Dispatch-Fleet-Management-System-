
import React, { useState, useEffect } from "react";
import {
    FaBars,
    FaSignOutAlt,
    FaClipboardList,
    FaPlusCircle,
    FaListAlt,
    FaArrowLeft,
    FaTruck
} from "react-icons/fa";

import AddVehicleRequisition from "../Module/Requisition/Pages/AddVehicleRequisition";
import VehicleRequisitionList from "../Module/Requisition/Pages/VehicleRequisitionList";
import UserVehicleRequestPage from "../Module/Common/Uservehiclerequestpage";

const API_URL = process.env.REACT_APP_API_URL;

function ProductionDashboard() {

    const [activePage, setActivePage] = useState("dashboard");
    const [requestCount, setRequestCount] = useState(0);

    const user = JSON.parse(localStorage.getItem("user"));
    const departmentName = user?.role || "PRODUCTION";

    /* ===== LOAD NOTIFICATION COUNT ===== */
    useEffect(() => {
        if (!user?.eCode) return;

        const loadRequestCount = async () => {
            try {
                const res = await fetch(`${API_URL}/api/vehicle-requests/notifications/requester/${user.eCode}/count`);
                const data = await res.json();
                setRequestCount(data.count || 0);
            } catch (err) {
                console.error("Notification count error:", err);
            }
        };

        loadRequestCount();
        const interval = setInterval(loadRequestCount, 15000);
        return () => clearInterval(interval);

    }, [user?.eCode]);

    const handleLogout = () => {
        localStorage.removeItem("user");
        window.location.href = "/";
    };

    /* ===== BACK BUTTON LOGIC ===== */
    const goBack = () => {
        setActivePage("dashboard");
    };

    /* ===== CARD DATA ===== */
    const requisitionCards = [
        {
            title: "Create Requisition",
            icon: <FaPlusCircle />,
            color: "#7c3aed",
            onClick: () => setActivePage("create"),
        },
        {
            title: "View Requisitions",
            icon: <FaListAlt />,
            color: "#2563eb",
            onClick: () => setActivePage("view"),
        },
        {
            title: "Vehicle Requests",
            icon: <FaTruck />,
            color: "#0ea5e9",
            desc: "Request a vehicle from dispatch",
            onClick: () => setActivePage("vehicle-requests"),
        },
    ];

    const isHome = activePage === "dashboard";

    return (
        <div className="erp">

            {/* ===== SIDEBAR ===== */}
            <aside className="sidebar">

                <h2 className="logo" style={{ color: "#a78bfa" }}>
                    🏭 Production
                </h2>

                <button
                    className={activePage === "dashboard" ? "menu active" : "menu"}
                    onClick={() => setActivePage("dashboard")}
                >
                    <FaClipboardList style={{ marginRight: 8 }} />
                    Dashboard
                </button>

                <button
                    className={activePage === "create" ? "menu active" : "menu"}
                    onClick={() => setActivePage("create")}
                >
                    <FaPlusCircle style={{ marginRight: 8 }} />
                    Create Requisition
                </button>

                <button
                    className={activePage === "view" ? "menu active" : "menu"}
                    onClick={() => setActivePage("view")}
                >
                    <FaListAlt style={{ marginRight: 8 }} />
                    View Requisitions
                </button>

                {/* ===== VEHICLE REQUESTS WITH BADGE ===== */}
                <button
                    className={activePage === "vehicle-requests" ? "menu active" : "menu"}
                    onClick={() => setActivePage("vehicle-requests")}
                    style={{ position: "relative" }}
                >
                    <FaTruck style={{ marginRight: 8 }} />
                    Vehicle Requests
                    {requestCount > 0 && (
                        <span style={{
                            position: "absolute",
                            top: 6,
                            right: 10,
                            background: "#ef4444",
                            color: "#fff",
                            borderRadius: "50%",
                            minWidth: 18,
                            height: 18,
                            fontSize: 10,
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "0 5px"
                        }}>
                            {requestCount}
                        </span>
                    )}
                </button>

                <button className="logout" onClick={handleLogout}>
                    <FaSignOutAlt /> Logout
                </button>

            </aside>

            {/* ===== MAIN ===== */}
            <div className="mainWrapper">

                {/* HEADER */}
                <header className="header">
                    <FaBars color="#64748b" />
                    <span style={{ marginLeft: 12 }}>
                        {departmentName} Module
                    </span>
                    <div className="userBadge">
                        {user?.fullName}
                    </div>
                </header>

                {/* CONTENT */}
                <main className="main">
                    <div className="content-container">

                        {!isHome && (
                            <button className="backBtn" onClick={goBack}>
                                <FaArrowLeft /> Back
                            </button>
                        )}

                        {/* DASHBOARD */}
                        {isHome && (
                            <Section
                                title="Requisition Planning"
                                cards={requisitionCards}
                            />
                        )}

                        {/* SUB PAGES */}
                        {activePage === "create"           && <AddVehicleRequisition />}
                        {activePage === "view"             && <VehicleRequisitionList />}
                        {activePage === "vehicle-requests" && <UserVehicleRequestPage />}

                    </div>
                </main>

                {/* FOOTER */}
                <footer className="footer">
                    <span>© 2026 OneDeoleela Transit System</span>
                    <span>Production Module • Version 1.0</span>
                </footer>

            </div>

            <style>{`
                * { box-sizing: border-box; }
                .erp { display: flex; height: 100vh; background: #f8fafc; font-family: 'Inter', sans-serif; }
                .sidebar { width: 240px; background: #1e1b4b; padding: 25px; color: white; display: flex; flex-direction: column; gap: 10px; }
                .logo { font-size: 22px; font-weight: bold; margin-bottom: 30px; }
                .menu { padding: 12px 15px; border-radius: 8px; color: #cbd5e1; text-decoration: none; transition: 0.2s; font-size: 15px; display: flex; align-items: center; background: transparent; border: none; cursor: pointer; width: 100%; text-align: left; }
                .menu:hover { background: rgba(255,255,255,0.1); color: white; }
                .active { background: #2563eb !important; color: white !important; font-weight: 600; }
                .logout { margin-top: auto; padding: 12px; border: none; background: #ef4444; color: white; border-radius: 8px; cursor: pointer; display: flex; gap: 8px; align-items: center; justify-content: center; font-weight: 600; }
                .header { height: 60px; background: white; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; padding: 0 25px; font-weight: bold; color: #334155; }
                .userBadge { margin-left: auto; background: #2563eb; color: #fff; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 500; }
                .mainWrapper { flex: 1; display: flex; flex-direction: column; }
                .main { flex: 1; padding: 30px; overflow-y: auto; }
                .content-container { max-width: 1400px; margin: 0 auto; }
                .backBtn { margin-bottom: 20px; padding: 8px 15px; border: none; background: #2563eb; color: #fff; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 500; }
                .backBtn:hover { background: #1d4ed8; }
                .section { margin-bottom: 40px; }
                .section h2 { margin-bottom: 20px; font-size: 20px; color: #1e293b; border-left: 4px solid #2563eb; padding-left: 12px; }
                .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 25px; }
                .card { background: white; padding: 25px; border-radius: 15px; border: 1px solid #e2e8f0; cursor: pointer; transition: 0.3s; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
                .card:hover { transform: translateY(-5px); box-shadow: 0 10px 15px rgba(0,0,0,0.1); }
                .card h3 { margin: 15px 0 5px; font-size: 15px; color: #64748b; }
                .card p { font-size: 13px; color: #94a3b8; margin: 0; font-weight: 400; }
                .footer { height: 50px; background: white; border-top: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; padding: 0 25px; font-size: 13px; color: #6b7280; }
            `}</style>

        </div>
    );
}

/* ===== SECTION COMPONENT ===== */
function Section({ title, cards }) {
    return (
        <div className="section">
            <h2>{title}</h2>
            <div className="grid">
                {cards.map((c, i) => (
                    <div
                        key={i}
                        className="card"
                        style={{ borderTop: `4px solid ${c.color}` }}
                        onClick={c.onClick}
                    >
                        <div style={{ fontSize: 26, color: c.color }}>
                            {c.icon}
                        </div>
                        <h3>{c.title}</h3>
                        {c.desc && <p>{c.desc}</p>}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ProductionDashboard;
