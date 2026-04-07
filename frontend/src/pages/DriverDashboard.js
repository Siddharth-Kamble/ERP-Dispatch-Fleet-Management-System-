

import LiveTrackingService from "../Module/Dispatch/Services/LiveTrackingService";

import React, { useEffect, useState } from "react";
import {
    FaTruck,
    FaMapMarkedAlt,
    FaRoad,
    FaBars,
    FaSignOutAlt,
    FaClock,
    FaCheckCircle,
    FaArrowRight,
    FaMoon,
    FaSun,
    FaBell,
    FaIdCard,
    FaTimesCircle,
    FaTools,
    FaMapPin,
    FaUserCircle, FaWallet,
    FaTimes,
    FaChevronLeft
} from "react-icons/fa";
import axios from "axios";
import DriverExpensePage from "../Module/Driver/pages/DriverExpensePage";
import {acknowledgeTrip, createTripStatus, updateTripStatus} from "../services/tripStatusHandler";
import TripStatusUpdatePage from "../Module/Dispatch/Pages/TripStatusUpdatePage";
import CompletedTrips from "../Module/Driver/pages/CompletedTrips";
import CancelledTrips from "../Module/Driver/pages/CancelledTrip";

function DriverDashboard() {
    const user = JSON.parse(localStorage.getItem("user"));
    const eCode = user?.eCode;
    const [cancelledTrips, setCancelledTrips] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [tripsToday, setTripsToday] = useState([]);
    const [completedTrips, setCompletedTrips] = useState([]);
    const [ongoingTrips, setOngoingTrips] = useState([]);
    const [activePage, setActivePage] = useState("dashboard");
    const [currentVehicle, setCurrentVehicle] = useState(null);
    const [currentTrip, setCurrentTrip] = useState(null);
    const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");
    const [notifications, setNotifications] = useState([]);
    const [location, setLocation] = useState({ lat: null, lng: null });

    /* ---- NEW: sidebar open/close state for mobile ---- */
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleTheme = () => {
        const newTheme = !darkMode;
        setDarkMode(newTheme);
        localStorage.setItem("theme", newTheme ? "dark" : "light");
    };

    /* ================= DATA LOADING ================= */
    const loadVehicles = async () => {
        try {
           const res = await axios.get(
  `${process.env.REACT_APP_API_URL}/api/vehicles/driver-assigned`,
  { params: { eCode } }
);
            setVehicles(res.data || []);
        } catch (e) { console.error("Vehicles load failed"); }
    };

    const loadTripsToday = async () => {
        try {
            const res = await axios.get(
                 `${process.env.REACT_APP_API_URL}/api/trips/trip/${eCode}/today`
            );

            const normalized = (res.data || []).map(t => ({
                ...t,
                tripId: t.trip?.id || t.id
            }));

            setTripsToday(normalized);

        } catch (e) {
            console.error("Trips failed");
        }
    };


    const loadOngoingTrips = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/trip-status-update/driver/${eCode}`);
            const normalized = (res.data || []).map((t) => ({
                ...t,
                tripId: t.trip?.id
            }));

            setOngoingTrips(
                normalized.filter(t => t.status !== "RETURN_JOURNEY_COMPLETED")
            );

            setCompletedTrips(
                normalized.filter(t => t.status === "RETURN_JOURNEY_COMPLETED")
            );

        } catch (e) {
            console.error("Ongoing failed");
        }
    };

const loadCancelledTrips = async () => {
    try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/cancellations/driver/${eCode}`);
        console.log("Cancelled Data Received:", res.data);
        setCancelledTrips(res.data || []);
    } catch (e) {
        console.error("Cancelled logs fetch failed", e);
    }
};

    useEffect(() => {
        if (!eCode) return;
        loadVehicles();
        loadTripsToday();
        loadOngoingTrips();
        loadCancelledTrips();
        const poll = setInterval(loadTripsToday, 30000);
        return () => clearInterval(poll);
    }, [eCode]);

    const addNotification = (msg) => {
        const id = Date.now();
        setNotifications(prev => [{ id, msg }, ...prev]);
        setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 5000);
    };

    useEffect(() => {
        if (!eCode) return;
        loadVehicles();
        loadTripsToday();
        loadOngoingTrips();
        const poll = setInterval(loadTripsToday, 30000);
        return () => clearInterval(poll);
    }, [eCode]);

    const handleAcknowledge = async (trip) => {
        try {
            const tripId = trip.id || trip.tripId;

            if (!tripId) {
                alert("Trip ID missing from entry");
                return;
            }

            await createTripStatus(tripId);
            await new Promise(resolve => setTimeout(resolve, 300));
            await acknowledgeTrip(tripId);

            setTripsToday(prev => prev.filter(t => (t.tripId || t.id) !== tripId));
            await loadOngoingTrips();

            addNotification("Trip Accepted Successfully!");
            setActivePage("ongoing");

        } catch (e) {
            console.error("Acknowledge Error:", e);
            alert("Failed to accept trip. Please check connection.");
        }
    };

    /* ================= REJECTION LOGIC ================= */
        const handleRejectTrip = async (trip) => {
            const reason = prompt("Select Reason: (e.g. Vehicle Issue, Personal, Shift End)");
            if (!reason) return;

            const remarks = prompt("Enter additional remarks (Optional):");
            const tripId = trip.tripId || trip.id;

            try {
                const body = {
                    eCode: String(eCode),
                    reason: reason,
                    remarks: remarks || ""
                };

                await axios.post(
                    `${process.env.REACT_APP_API_URL}/api/cancellations/reject/${tripId}`,
                    body
                );

                setTripsToday(prev => prev.filter(t => (t.tripId || t.id) !== tripId));
                addNotification("Trip Rejected Successfully");

            } catch (e) {
                console.error("Rejection Error:", e);
                alert("Failed to reject trip. Check your connection.");
            }
        };

    const handleUpdateStatus = async (trip) => {
        const STATUS_FLOW = [
            "ACKNOWLEDGED",
            "LOADING_STARTED",
            "LOADING_COMPLETED",
            "IN_TRANSIT",
            "REACHED_DESTINATION",
            "UNLOADING_STARTED",
            "UNLOADING_COMPLETED",
            "RETURN_JOURNEY_STARTED",
            "RETURN_JOURNEY_COMPLETED",
        ];

        const tripId = trip.tripId || trip.id;
        const currentIndex = STATUS_FLOW.indexOf(trip.status);
        const nextStatus = STATUS_FLOW[currentIndex + 1];

        if (!nextStatus) return;

        try {
            await updateTripStatus(tripId, nextStatus);
            await loadOngoingTrips();
            addNotification(`Updated to ${nextStatus.replaceAll("_", " ")}`);
        } catch (err) {
            console.error("Failed to update status:", err);
            alert("Status update failed. Please try again.");
        }
    };


    const formatTime = (t) => t ? new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--";

    /* ---- Navigate helper: closes mobile sidebar on nav ---- */
    const navigateTo = (page) => {
        setActivePage(page);
        setSidebarOpen(false);
    };

    return (
        <div className={`erp-container ${darkMode ? 'dark-mode' : ''}`}>
            {/* Notifications */}
            <div className="toast-container">
                {notifications.map(n => (
                    <div key={n.id} className="toast"><FaBell /> {n.msg}</div>
                ))}
            </div>

            {/* Mobile sidebar overlay backdrop */}
            {sidebarOpen && (
                <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
            )}

            <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
                <div className="sidebar-brand">
                    <div className="logo-box"><FaTruck /></div>
                    <span>DRIVER ERP</span>
                    {/* Close button visible on mobile */}
                    <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>
                        <FaTimes />
                    </button>
                </div>
                <nav className="nav-menu">
                    <button className={activePage === "dashboard" ? "active" : ""} onClick={() => navigateTo("dashboard")}>
                        <FaBars className="m-icon"/> Dashboard
                    </button>
                    <button className={activePage === "vehicles" ? "active" : ""} onClick={() => navigateTo("vehicles")}>
                        <FaIdCard className="m-icon"/> Assigned Vehicle
                    </button>
                    <button className={activePage === "tripsToday" ? "active" : ""} onClick={() => navigateTo("tripsToday")}>
                        <FaMapMarkedAlt className="m-icon"/> Trip Requests {tripsToday.length > 0 && <span className="badge-count">{tripsToday.length}</span>}
                    </button>
                    <button className={activePage === "ongoing" ? "active" : ""} onClick={() => navigateTo("ongoing")}>
                        <FaRoad className="m-icon"/> Ongoing Trips
                    </button>
                    <button className={activePage === "cancelled" ? "active" : ""} onClick={() => navigateTo("cancelled")}>
                        <FaTimesCircle className="m-icon"/> Cancelled Trips
                    </button>
                    <button className={activePage === "expenses" ? "active" : ""} onClick={() => navigateTo("expenses")}>
                        <FaWallet className="m-icon"/> Expense Log
                    </button>
                </nav>
                <div className="sidebar-footer">
                    <button className="theme-btn" onClick={toggleTheme}>{darkMode ? <FaSun /> : <FaMoon />}</button>
                    <button className="logout-btn" onClick={() => { localStorage.clear(); window.location.href="/"; }}><FaSignOutAlt /> Logout</button>
                </div>
            </aside>

            <div className="main-wrapper">
                <header className="header">
                    <div className="header-left">
                        {/* Hamburger — opens sidebar on mobile, decorative on desktop */}
                        <button className="hamburger-btn" onClick={() => setSidebarOpen(prev => !prev)}>
                            <FaBars color="#64748b" />
                        </button>
                        <span className="header-title">Logistics Management</span>
                    </div>
                    <div className="user-profile">
                        <FaUserCircle /> <span className="profile-name">{user?.fullName || "Driver"}</span>
                    </div>
                </header>

                <main className="main-content">
                    {/* DASHBOARD GRID */}
                    {activePage === "dashboard" && (
                        <div className="grid">
                            <div className="card-item blue" onClick={() => setActivePage("vehicles")}>
                                <FaTruck className="card-icon" />
                                <h3 className="card-title">Assigned Vehicle</h3>
                                <p className="card-value">{vehicles.length}</p>
                            </div>
                            <div className="card-item yellow" onClick={() => setActivePage("tripsToday")}>
                                <FaMapMarkedAlt className="card-icon" />
                                <h3 className="card-title">New Requests</h3>
                                <p className="card-value">{tripsToday.length}</p>
                            </div>
                            <div className="card-item green" onClick={() => setActivePage("ongoing")}>
                                <FaRoad className="card-icon" />
                                <h3 className="card-title">Active Trips</h3>
                                <p className="card-value">{ongoingTrips.length}</p>
                            </div>

                            <div className="card-item red"
                                 onClick={() => setActivePage("cancelled")}
                                 style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)' }}>
                                <FaTimesCircle className="card-icon" />
                                <h3 className="card-title">Cancelled Trips</h3>
                                <p className="card-value">{cancelledTrips.length}</p>
                            </div>
                            <div className="card-item purple" onClick={() => setActivePage("completed")}>
                                <h3>Completed Trips</h3>
                                <p>{completedTrips.length}</p>
                            </div>
                            <div className="card-item purple" onClick={() => setActivePage("expenses")}>
                                <FaWallet className="card-icon" />
                                <h3 className="card-title">Expense Log</h3>
                                <p className="card-value">Track</p>
                            </div>
                        </div>
                    )}

                    {/* ASSIGNED VEHICLE SECTION */}
                    {activePage === "vehicles" && (
                        <div className="section-container">
                            <h2 className="section-heading">Assigned Vehicle Details</h2>
                            <div className="vehicle-list">
                                {vehicles.map((v) => (
                                    <div className="v-horizontal-card" key={v.id}>
                                        <div className="v-icon-section"><FaTruck size={24}/></div>
                                        <div className="v-info-section">
                                            <h4>{v.vehicleNumber}</h4>
                                            <p>Capacity: Standard | Status: <span className="text-success">Operational</span></p>
                                        </div>
                                        <div className="v-specs-section">
                                            <span><FaTools /> Fitness Check: OK</span>
                                            <span><FaClock /> Shift: Day/Night</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* PENDING TRIP REQUESTS */}
                    {activePage === "tripsToday" && (
                        <div className="section-container">
                            <h2 className="section-heading">Pending Trip Requests</h2>
                            <div className="horizontal-list">
                                {tripsToday.length === 0 ? (
                                    <div className="empty-box">No pending requests available.</div>
                                ) : (
                                    tripsToday.map((t) => (
                                        <div className="horizontal-request-row" key={t.tripId}>
                                            <div className="row-icon"><FaMapPin color="#f59e0b" /></div>
                                            <div className="row-details">
                                                <span className="row-label">Vehicle Number</span>
                                                <span className="row-data">{t.vehicleNumber}</span>
                                            </div>
                                            <div className="row-details">
                                                <span className="row-label">Trip Reference</span>
                                                <span className="row-data">#{t.tripId}</span>
                                            </div>
                                            <div className="row-details">
                                                <span className="row-label">Request Time</span>
                                                <span className="row-data">Today, {new Date().toLocaleDateString()}</span>
                                            </div>

                                          <div className="row-action" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                              <button
                                                  className="row-ack-btn"
                                                  style={{ background: '#ef4444', padding: '10px 15px' }}
                                                  onClick={() => handleRejectTrip(t)}
                                              >
                                                  Reject Trip
                                              </button>

                                              <button className="row-ack-btn" onClick={() => handleAcknowledge(t)}>
                                                  Accept Trip<FaArrowRight />
                                              </button>
                                          </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* ONGOING TRIPS */}
                    {activePage === "ongoing" && (
                        <TripStatusUpdatePage
                            ongoingTrips={ongoingTrips}
                            handleUpdateStatus={handleUpdateStatus}
                        />
                    )}
                    {activePage === "completed" && (
                        <CompletedTrips completedTrips={completedTrips} />
                    )}
                    {activePage === "cancelled" && <CancelledTrips cancelledTrips={cancelledTrips} />}
                    {activePage === "expenses" && <DriverExpensePage />}
                </main>
            </div>

            {/* ===== MOBILE BOTTOM NAVIGATION BAR ===== */}
            <nav className="bottom-nav">
                <button
                    className={`bottom-nav-btn ${activePage === "dashboard" ? "bottom-active" : ""}`}
                    onClick={() => navigateTo("dashboard")}
                >
                    <FaBars className="bn-icon" />
                    <span>Home</span>
                </button>
                <button
                    className={`bottom-nav-btn ${activePage === "tripsToday" ? "bottom-active" : ""}`}
                    onClick={() => navigateTo("tripsToday")}
                >
                    <FaMapMarkedAlt className="bn-icon" />
                    <span>Requests</span>
                    {tripsToday.length > 0 && <span className="bn-badge">{tripsToday.length}</span>}
                </button>
                <button
                    className={`bottom-nav-btn ${activePage === "ongoing" ? "bottom-active" : ""}`}
                    onClick={() => navigateTo("ongoing")}
                >
                    <FaRoad className="bn-icon" />
                    <span>Ongoing</span>
                </button>
                <button
                    className={`bottom-nav-btn ${activePage === "expenses" ? "bottom-active" : ""}`}
                    onClick={() => navigateTo("expenses")}
                >
                    <FaWallet className="bn-icon" />
                    <span>Expenses</span>
                </button>
                <button
                    className="bottom-nav-btn"
                    onClick={() => setSidebarOpen(true)}
                >
                    <FaBars className="bn-icon" />
                    <span>More</span>
                </button>
            </nav>

            <style>{`
                :root { --sidebar-bg: #1e1b4b; --main-bg: #f8fafc; --card-bg: #ffffff; --text-dark: #1e293b; --accent: #6366f1; --border: #e2e8f0; --bottom-nav-height: 65px; }
                .dark-mode { --sidebar-bg: #020617; --main-bg: #0b0e14; --card-bg: #1e222d; --text-dark: #f1f5f9; --border: #334155; }

                * { box-sizing: border-box; }

                .erp-container { display: flex; min-height: 100vh; background: var(--main-bg); color: var(--text-dark); font-family: 'Inter', sans-serif; position: relative; }

                /* ===== SIDEBAR ===== */
                .sidebar { width: 260px; min-width: 260px; background: var(--sidebar-bg); color: white; padding: 25px; display: flex; flex-direction: column; z-index: 300; transition: transform 0.3s ease; }
                .sidebar-brand { display: flex; align-items: center; gap: 12px; margin-bottom: 40px; font-weight: 800; font-size: 1.2rem; color: #a78bfa; }
                .logo-box { background: #4f46e5; padding: 8px; border-radius: 10px; flex-shrink: 0; }
                .sidebar-close-btn { display: none; margin-left: auto; background: none; border: none; color: #a78bfa; font-size: 20px; cursor: pointer; padding: 4px; }
                .nav-menu { flex: 1; display: flex; flex-direction: column; gap: 8px; }
                .nav-menu button { background: none; border: none; color: #cbd5e1; padding: 12px 15px; text-align: left; cursor: pointer; border-radius: 10px; display: flex; align-items: center; transition: 0.2s; font-size: 14px; }
                .nav-menu button:hover, .nav-menu button.active { background: rgba(255,255,255,0.1); color: white; }
                .m-icon { margin-right: 12px; font-size: 18px; flex-shrink: 0; }
                .badge-count { background: #ef4444; color: white; margin-left: auto; padding: 2px 8px; border-radius: 10px; font-size: 11px; }

                /* ===== SIDEBAR OVERLAY (mobile backdrop) ===== */
                .sidebar-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 290; }

                /* ===== HEADER ===== */
                .main-wrapper { flex: 1; display: flex; flex-direction: column; min-width: 0; }
                .header { height: 65px; background: var(--card-bg); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 20px; position: sticky; top: 0; z-index: 100; }
                .header-left { display: flex; align-items: center; gap: 15px; }
                .header-title { font-weight: 700; color: var(--text-dark); font-size: 15px; }
                .hamburger-btn { background: none; border: none; cursor: pointer; padding: 8px; display: flex; align-items: center; border-radius: 8px; }
                .hamburger-btn:hover { background: var(--border); }
                .user-profile { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #64748b; }
                .profile-name { display: inline; }

                /* ===== MAIN CONTENT ===== */
                .main-content { padding: 30px; flex: 1; overflow-y: auto; display: flex; flex-direction: column; padding-bottom: calc(30px + var(--bottom-nav-height)); }

                /* ===== DASHBOARD GRID ===== */
                .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; width: 100%; margin-bottom: 40px; }
                .card-item { padding: 25px; border-radius: 16px; color: white; cursor: pointer; transition: 0.3s; }
                .card-item:hover { transform: translateY(-2px); }
                .card-item.blue { background: linear-gradient(135deg, #6366f1, #4338ca); }
                .card-item.yellow { background: linear-gradient(135deg, #f59e0b, #d97706); }
                .card-item.green { background: linear-gradient(135deg, #10b981, #059669); }
                .card-item.purple { background: linear-gradient(135deg, #8b5cf6, #6d28d9); }
                .card-icon { font-size: 24px; margin-bottom: 10px; }
                .card-title { font-size: 13px; opacity: 0.9; margin: 0; text-transform: uppercase; }
                .card-value { font-size: 28px; font-weight: 800; margin: 5px 0 0; }

                /* ===== TRIP REQUESTS LIST ===== */
                .section-container { width: 100%; max-width: 1100px; }
                .section-heading { font-size: 20px; font-weight: 700; margin-bottom: 20px; }
                .horizontal-list { display: flex; flex-direction: column; gap: 12px; width: 100%; }
                .horizontal-request-row {
                    background: var(--card-bg);
                    border: 1px solid var(--border);
                    padding: 15px 25px;
                    border-radius: 12px;
                    display: grid;
                    grid-template-columns: 50px 1.5fr 1fr 1fr 180px;
                    align-items: center;
                    transition: 0.2s;
                    gap: 10px;
                }
                .horizontal-request-row:hover { border-color: var(--accent); transform: scale(1.01); }
                .row-icon { background: #fffbeb; padding: 10px; border-radius: 10px; display: flex; justify-content: center; }
                .row-details { display: flex; flex-direction: column; }
                .row-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
                .row-data { font-size: 15px; font-weight: 700; color: var(--text-dark); }
                .row-action { text-align: right; }
                .row-ack-btn { background: var(--accent); color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 8px; margin-left: auto; }

                /* ===== VEHICLES ===== */
                .vehicle-list { display: flex; flex-direction: column; gap: 10px; width: 100%; }
                .v-horizontal-card { background: var(--card-bg); border: 1px solid var(--border); padding: 20px; border-radius: 12px; display: flex; align-items: center; gap: 20px; }
                .v-icon-section { background: #eef2ff; color: #6366f1; padding: 15px; border-radius: 12px; flex-shrink: 0; }
                .v-info-section { flex: 1; min-width: 0; }
                .v-info-section h4 { margin: 0; font-size: 18px; }
                .v-info-section p { margin: 4px 0 0; font-size: 13px; color: #64748b; }
                .v-specs-section { display: flex; flex-direction: column; gap: 5px; font-size: 12px; color: #64748b; text-align: right; }

                /* ===== JOURNEY CARDS ===== */
                .journey-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 16px; padding: 25px; width: 100%; max-width: 600px; margin-bottom: 20px; }
                .j-card-header { display: flex; justify-content: space-between; margin-bottom: 20px; border-bottom: 1px solid var(--border); padding-bottom: 10px; }
                .j-v-num { font-weight: 800; font-size: 18px; }
                .j-status { color: var(--accent); font-weight: 700; font-size: 12px; text-transform: uppercase; }
                .j-flow { display: flex; justify-content: space-between; margin: 20px 0; position: relative; }
                .flow-step { display: flex; flex-direction: column; align-items: center; font-size: 11px; z-index: 2; }
                .dot { width: 12px; height: 12px; background: #e2e8f0; border-radius: 50%; margin-top: 5px; }
                .dot.active { background: var(--accent); box-shadow: 0 0 10px var(--accent); }
                .status-update-btn { width: 100%; padding: 12px; background: #1e293b; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; }

                /* ===== TOASTS ===== */
                .toast-container { position: fixed; top: 20px; right: 20px; z-index: 1000; }
                .toast { background: #1e1b4b; color: white; padding: 15px 25px; border-radius: 10px; margin-bottom: 10px; display: flex; align-items: center; gap: 10px; box-shadow: 0 10px 15px rgba(0,0,0,0.2); animation: slide 0.3s ease; }
                @keyframes slide { from { transform: translateX(100%); } to { transform: translateX(0); } }
                .text-success { color: #10b981; font-weight: bold; }

                /* ===== SIDEBAR FOOTER ===== */
                .sidebar-footer { display: flex; align-items: center; gap: 10px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); }
                .theme-btn { background: rgba(255,255,255,0.1); border: none; color: white; padding: 10px 14px; border-radius: 8px; cursor: pointer; font-size: 16px; }
                .logout-btn { flex: 1; background: rgba(239,68,68,0.2); border: none; color: #fca5a5; padding: 10px 14px; border-radius: 8px; cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 8px; }
                .logout-btn:hover { background: rgba(239,68,68,0.35); }

                /* ===== EMPTY BOX ===== */
                .empty-box { background: var(--card-bg); border: 1px dashed var(--border); padding: 40px; border-radius: 12px; text-align: center; color: #94a3b8; }

                /* ===== BOTTOM NAVIGATION BAR ===== */
                .bottom-nav {
                    display: none;
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: var(--bottom-nav-height);
                    background: var(--sidebar-bg);
                    border-top: 1px solid rgba(255,255,255,0.1);
                    z-index: 280;
                    padding: 0 8px;
                    align-items: center;
                    justify-content: space-around;
                }
                .bottom-nav-btn {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 3px;
                    background: none;
                    border: none;
                    color: #94a3b8;
                    cursor: pointer;
                    padding: 8px 10px;
                    border-radius: 10px;
                    font-size: 10px;
                    font-weight: 600;
                    letter-spacing: 0.3px;
                    position: relative;
                    transition: color 0.2s, background 0.2s;
                    min-width: 56px;
                }
                .bottom-nav-btn:hover { background: rgba(255,255,255,0.07); }
                .bottom-nav-btn.bottom-active { color: #a78bfa; }
                .bottom-nav-btn.bottom-active .bn-icon { color: #a78bfa; }
                .bn-icon { font-size: 18px; color: #94a3b8; transition: color 0.2s; }
                .bottom-nav-btn.bottom-active .bn-icon { color: #a78bfa; }
                .bn-badge {
                    position: absolute;
                    top: 4px;
                    right: 6px;
                    background: #ef4444;
                    color: white;
                    font-size: 9px;
                    font-weight: 700;
                    padding: 1px 5px;
                    border-radius: 10px;
                    min-width: 16px;
                    text-align: center;
                }

                /* ===== RESPONSIVE BREAKPOINTS ===== */

                /* Tablet and below: hide desktop sidebar, show overlay + bottom nav */
                @media (max-width: 900px) {
                    .sidebar {
                        position: fixed;
                        top: 0;
                        left: 0;
                        height: 100vh;
                        transform: translateX(-100%);
                        box-shadow: 4px 0 20px rgba(0,0,0,0.3);
                    }
                    .sidebar.sidebar-open {
                        transform: translateX(0);
                    }
                    .sidebar-overlay {
                        display: block;
                    }
                    .sidebar-close-btn {
                        display: flex;
                        align-items: center;
                    }
                    .bottom-nav {
                        display: flex;
                    }
                    .main-content {
                        padding-bottom: calc(20px + var(--bottom-nav-height));
                    }
                }

                /* Mobile: smaller padding and stacked trip rows */
                @media (max-width: 640px) {
                    .main-content { padding: 16px; }
                    .grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
                    .card-item { padding: 18px 14px; }
                    .card-value { font-size: 22px; }
                    .section-heading { font-size: 17px; }

                    /* Stack trip request rows vertically on mobile */
                    .horizontal-request-row {
                        grid-template-columns: 1fr;
                        gap: 12px;
                        padding: 16px;
                    }
                    .row-icon { display: none; }
                    .row-action {
                        display: flex !important;
                        flex-direction: column;
                        gap: 8px;
                    }
                    .row-ack-btn {
                        width: 100%;
                        justify-content: center;
                        margin-left: 0;
                    }

                    /* Stack vehicle cards vertically */
                    .v-horizontal-card { flex-direction: column; align-items: flex-start; gap: 12px; }
                    .v-specs-section { text-align: left; flex-direction: row; flex-wrap: wrap; gap: 10px; }

                    .profile-name { display: none; }
                    .header-title { font-size: 13px; }
                    .toast { padding: 12px 16px; font-size: 13px; }
                    .toast-container { right: 10px; left: 10px; }
                }

                /* Very small screens */
                @media (max-width: 380px) {
                    .grid { grid-template-columns: 1fr; }
                    .bottom-nav-btn { min-width: 44px; font-size: 9px; padding: 6px 4px; }
                }
            `}</style>
        </div>
    );
}

export default DriverDashboard;
