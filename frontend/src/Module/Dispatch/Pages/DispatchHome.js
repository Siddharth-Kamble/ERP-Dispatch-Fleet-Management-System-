
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import vehicleService from "../Services/vehicleService";
import {
    FaTruck,
    FaCamera,
    FaBus,
    FaMapMarkedAlt,
    FaRoad,
    FaUser,
    FaHeartbeat,
    FaBars,
    FaSignOutAlt,
    FaPlusCircle,
    FaListAlt,
    FaTachometerAlt,
    FaWindowMaximize,
    FaUpload
} from "react-icons/fa";

function DispatchHome() {

    const navigate = useNavigate();
    const location = useLocation();

    const API_URL = process.env.REACT_APP_API_URL;

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const [totalVehicles, setTotalVehicles] = useState(0);
    const [activeVehicles, setActiveVehicles] = useState(0);
    const [inactiveVehicles, setInactiveVehicles] = useState(0);
    const [totalRequisitions, setTotalRequisitions] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /* ================= LOAD COUNTS ================= */

    useEffect(() => {

        const loadCounts = async () => {

            try {

                setLoading(true);

                const [
                    allVehicles,
                    activeRes,
                    inactiveRes,
                    requisitionRes
                ] = await Promise.all([
                    vehicleService.getAll(user?.eCode),
                    fetch(`${API_URL}/api/trips/active-vehicles`),
                    fetch(`${API_URL}/api/trips/inactive-vehicles`),
                    fetch(`${API_URL}/api/vehicle-requisition`)
                ]);

                const vehicles = Array.isArray(allVehicles) ? allVehicles : [];
                setTotalVehicles(vehicles.length);

                const activeData = await activeRes.json();
                setActiveVehicles(Array.isArray(activeData) ? activeData.length : 0);

                const inactiveData = await inactiveRes.json();
                setInactiveVehicles(Array.isArray(inactiveData) ? inactiveData.length : 0);

                const requisitionData = await requisitionRes.json();
                setTotalRequisitions(Array.isArray(requisitionData) ? requisitionData.length : 0);

            } catch (err) {

                console.error("Dashboard load error:", err);
                setError("Failed to load dashboard data");

            } finally {

                setLoading(false);
            }
        };

        if (user?.eCode) loadCounts();

    }, [user?.eCode]);

    /* ================= LOGOUT ================= */

    const logout = () => {

        localStorage.removeItem("user");
        navigate("/");
    };

    const isHome = location.pathname === "/dispatch-dashboard";

    const activeMenu = (path) =>
        location.pathname === path ? "menu active" : "menu";

    /* ================= CARD DATA ================= */

    const vehicleCards = [
        {
            title: "Total Vehicles",
            value: totalVehicles,
            icon: <FaTruck />,
            color: "#2563eb",
            onClick: () => navigate("/dispatch-dashboard/vehicles"),
        },
        {
            title: "Active Vehicles",
            value: activeVehicles,
            icon: <FaBus />,
            color: "#16a34a",
            onClick: () => navigate("/dispatch-dashboard/active-vehicles"),
        },
        {
            title: "Inactive Vehicles",
            value: inactiveVehicles,
            icon: <FaTruck />,
            color: "#f59e0b",
            onClick: () => navigate("/dispatch-dashboard/inactive-vehicles"),
        },
    ];

    const tripCards = [
        {
            title: "Add Trip",
            icon: <FaMapMarkedAlt />,
            color: "#7c3aed",
            onClick: () => navigate("/dispatch-dashboard/routes/add"),
        },
        {
            title: "View Trips",
            icon: <FaRoad />,
            color: "#0891b2",
            onClick: () => navigate("/dispatch-dashboard/routes"),
        },
        {
            title: "Live Tracking",
            icon: <FaMapMarkedAlt />,
            color: "#16a34a",
            onClick: () => navigate("/dispatch-dashboard/live-tracking"),
        },
    ];

    const windowCards = [
        {
            title: "Window DC",
            icon: <FaWindowMaximize />,
            color: "#0ea5e9",
            onClick: () => navigate("/dispatch-dashboard/window-dc"),
        },
           {
                title: "Advanced Bulk DC",
                icon: <FaUpload />,
                color: "#9333ea",
                onClick: () => navigate("/dispatch-dashboard/bulk-upload-window"),
            },
                {
                    title: "Material DC",
                    icon: <FaPlusCircle />, // you can choose any icon you like
                    color: "#f97316",       // pick a new color
                    onClick: () => navigate("/dispatch-dashboard/material-dc"), // new route
                },
    ];

    const requisitionCards = [
        {
            title: "Create Requisition",
            icon: <FaPlusCircle />,
            color: "#7c3aed",
            onClick: () => navigate("/vehicle-requisition"),
        },
        {
            title: "View Requisitions",
            value: totalRequisitions,
            icon: <FaListAlt />,
            color: "#2563eb",
            onClick: () => navigate("/vehicle-requisition-list"),
        },
    ];

    const managementCards = [
        {
            title: "Driver Management",
            icon: <FaUser />,
            color: "#16a34a",
            onClick: () => navigate("/dispatch-dashboard/drivers"),
        },
        {
            title: "Vehicle Expenses",
            icon: <FaTruck />,
            color: "#f59e0b",
            onClick: () => navigate("/dispatch-dashboard/expenses"),
        },
    ];

    const healthCards = [
        {
            title: "Vehicle Monitoring", // renamed
            icon: <FaTachometerAlt />,   // tachometer icon for vehicle mileage/monitoring
            color: "#ef4444",
            onClick: () => navigate("/dispatch-dashboard/vehicle-monitoring"),
        },
     {
         title: "Vehicle Status Images",
         icon: <FaCamera />, // Matches the "Photo Upload" context perfectly
         color: "#6366f1",
         onClick: () => navigate("/dispatch-dashboard/vehicle-status-images"),
     },
    ];

    /* ================= PORTAL DATA ================= */
        const portalCards = [
            {
                title: "Vehicle Portal",
                icon: <FaBars />, // You can change this to FaGlobe if you import it
                color: "#059669",
                onClick: () => navigate("/dispatch-dashboard/vehicle-portal"),
            },
        ];

        const reportCards = [
            {
                title: "Dispatch Report",
                icon: <FaListAlt />,
                color: "#2563eb",
                onClick: () => navigate("/dispatch-dashboard/dispatch-report"),
            },
        ];


    /* ================= UI ================= */

    if (loading) {
        return <div style={{ padding: 40 }}>Loading dashboard...</div>;
    }

    if (error) {
        return <div style={{ padding: 40, color: "red" }}>{error}</div>;
    }

    return (
        <div className="erp">

            {/* SIDEBAR */}

            <aside className="sidebar">

                <h2 className="logo" style={{ color: "#a78bfa" }}>
                    🚛 Dispatch
                </h2>

                <Link to="/dispatch-dashboard" className={activeMenu("/dispatch-dashboard")}>
                    Dashboard
                </Link>

                <Link to="/dispatch-dashboard/vehicles" className={activeMenu("/dispatch-dashboard/vehicles")}>
                    Vehicles
                </Link>

                <Link to="/dispatch-dashboard/expenses" className={activeMenu("/dispatch-dashboard/expenses")}>
                    Expenses
                </Link>

                <Link to="/vehicle-requisition-list" className="menu">
                    Requisitions
                </Link>

                <Link to="/dispatch-dashboard/live-tracking" className={activeMenu("/dispatch-dashboard/live-tracking")}>
                    Live Tracking
                </Link>

                <button className="logout" onClick={logout}>
                    <FaSignOutAlt /> Logout
                </button>

            </aside>

            {/* RIGHT SIDE */}

            <div className="mainWrapper">

                <header className="header">
                    <FaBars color="#64748b" />
                    <span style={{ marginLeft: 12 }}>
                        Dispatch & Fleet Management
                    </span>
                </header>

                <main className="main">

                    {isHome ? (
                        <div className="content-container">

                            <Section title="Vehicle Overview" cards={vehicleCards} />

                            <Section title="Trip Management" cards={tripCards} />
                            <Section title="Driver Challan" cards={windowCards} />

                            <Section title="Requisition Planning" cards={requisitionCards} />

                            <Section title="Management" cards={managementCards} />

                            <Section title="Vehicle Monitoring" cards={healthCards} />
                            <Section title="Vehicle Portal Management" cards={portalCards} />
                            <Section title="Reports" cards={reportCards} />

                        </div>
                    ) : (
                        <div className="content-container">
                            <Outlet />
                        </div>
                    )}

                </main>

            </div>

            <style>{`
            * { box-sizing: border-box; }
            .erp { display: flex; height: 100vh; background: #f8fafc; font-family: 'Inter', sans-serif; }
            .sidebar { width: 240px; background: #1e1b4b; padding: 25px; color: white; display: flex; flex-direction: column; gap: 10px; }
            .logo { font-size: 22px; font-weight: bold; margin-bottom: 30px; }
            .menu { padding: 12px 15px; border-radius: 8px; color: #cbd5e1; text-decoration: none; transition: 0.2s; font-size: 15px; display: block; }
            .menu:hover { background: rgba(255,255,255,0.1); color: white; }
            .active { background: #2563eb; color: white; font-weight: 600; }
            .logout { margin-top: auto; padding: 12px; border: none; background: #ef4444; color: white; border-radius: 8px; cursor: pointer; display: flex; gap: 8px; align-items: center; justify-content: center; font-weight: 600; }
            .header { height: 60px; background: white; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; padding: 0 25px; font-weight: bold; color: #334155; }
            .mainWrapper { flex: 1; display: flex; flex-direction: column; }
            .main { flex: 1; padding: 30px; overflow-y: auto; }
            .content-container { max-width: 1400px; margin: 0 auto; }
            .section { margin-bottom: 40px; }
            .section h2 { margin-bottom: 20px; font-size: 20px; color: #1e293b; border-left: 4px solid #2563eb; padding-left: 12px; }
            .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 25px; }
            .card { background: white; padding: 25px; border-radius: 15px; border: 1px solid #e2e8f0; cursor: pointer; transition: 0.3s; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
            .card:hover { transform: translateY(-5px); box-shadow: 0 10px 15px rgba(0,0,0,0.1); }
            .card h3 { margin: 15px 0 5px; font-size: 15px; color: #64748b; }
            .card p { font-size: 26px; font-weight: bold; margin: 0; color: #1e293b; }
            `}</style>

        </div>
    );
}

/* ================= SECTION COMPONENT ================= */

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

                        {c.value !== undefined && <p>{c.value}</p>}

                    </div>

                ))}

            </div>

        </div>
    );
}

export default DispatchHome;