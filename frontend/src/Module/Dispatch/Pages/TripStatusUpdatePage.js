
import {
    handleBreakClick,
    startBreakService,
    endBreakService
} from "../../Driver/Services/breakService";
import React, { useState } from "react";
import axios from "axios";
import {
    Truck,
    Package,
    Navigation,
    CheckCircle2,
    RefreshCw,
    MapPin,
    ArrowLeftRight,
    ClipboardList,
    Clock,
    Coffee,
    Play,
    AlertCircle,
    Camera
} from "lucide-react";

import liveTrackingService from "../Services/LiveTrackingService";

// Integrated Photo Uploader Component
const VehicleImageUploader = ({ tripId }) => {
    const [loading, setLoading] = useState(false);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("tripId", tripId);

        try {
            setLoading(true);
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/vehicle-images/upload`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            alert(response.data || "Image uploaded successfully!");
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Failed to upload image.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'relative' }}>
            <input
                type="file"
                accept="image/*"
                id={`file-${tripId}`}
                onChange={handleUpload}
                style={{ display: 'none' }}
                capture="environment"
            />
            <label
                htmlFor={`file-${tripId}`}
                className="photo-btn"
            >
                {loading
                    ? <RefreshCw size={16} style={{ animation: "spin 2s linear infinite" }} />
                    : <Camera size={16} />}
                <span style={{ fontSize: '14px' }}>{loading ? "..." : "Photo"}</span>
            </label>
        </div>
    );
};

function TripStatusUpdatePage({ ongoingTrips, handleUpdateStatus }) {
    const [breakTripId, setBreakTripId] = React.useState(null);
    const [breakReason, setBreakReason] = React.useState("");
    const [breakActiveTrips, setBreakActiveTrips] = React.useState({});

    const filteredTrips = ongoingTrips.filter(
        (t) => t.status !== "RETURN_JOURNEY_COMPLETED"
    );

    const sortedTrips = [...filteredTrips].sort(
        (a, b) => Number(b.tripId) - Number(a.tripId)
    );

    const handleStatusUpdateWithGPS = async (trip) => {
        await handleUpdateStatus(trip);
        if (trip.status === "ACKNOWLEDGED") {
            liveTrackingService.startTracking(trip.tripId);
        }
        if (
            trip.status === "UNLOADING_COMPLETED" ||
            trip.status === "RETURN_COMPLETED" ||
            trip.status === "RETURN_JOURNEY_COMPLETED"
        ) {
            liveTrackingService.stopTracking(trip.tripId);
        }
    };

    const startBreak = async (tripId) => {
        if (!breakReason) {
            alert("Please enter a reason for the break.");
            return;
        }
        await startBreakService(tripId, breakReason);
        setBreakActiveTrips(prev => ({ ...prev, [tripId]: true }));
        setBreakTripId(null);
        setBreakReason("");
    };

    const endBreak = async (tripId) => {
        await endBreakService(tripId);
        setBreakActiveTrips(prev => ({ ...prev, [tripId]: false }));
    };

    const getTimeAgo = (timestamp) => {
        if (!timestamp) return null;
        const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
        if (seconds < 60) return "Just now";
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return Math.floor(hours / 24) + "d ago";
    };

    const getTimelineSteps = (t) => [
        { label: "Loading", active: !!t.loadingStartedAt, time: t.loadingStartedAt, icon: <Package size={16} /> },
        { label: "Transit", active: !!t.inTransitAt, time: t.inTransitAt, icon: <Navigation size={16} /> },
        { label: "Unloading", active: !!t.unloadingStartedAt, time: t.unloadingStartedAt, icon: <MapPin size={16} /> },
        { label: "Return", active: t.status?.includes("RETURN"), time: t.updatedAt || null, icon: <ArrowLeftRight size={16} /> },
        { label: "Final", active: t.status === "RETURN_JOURNEY_COMPLETED", time: null, icon: <CheckCircle2 size={16} /> },
    ];

    return (
        <div className="tsp-root">

            {/* ===== HEADER ===== */}
            <header className="tsp-header">
                <div>
                    <h1 className="tsp-title">Fleet Dispatch</h1>
                    <p className="tsp-subtitle">Real-time transit management</p>
                </div>
                <div className="tsp-units-badge">
                    <div className="tsp-units-dot" />
                    <span className="tsp-units-label">{sortedTrips.length} Units</span>
                </div>
            </header>

            {/* ===== TRIP LIST ===== */}
            <div className="tsp-list">
                {sortedTrips.length === 0 ? (
                    <div className="tsp-empty">
                        <ClipboardList size={48} color="#cbd5e1" style={{ marginBottom: "16px" }} />
                        <h3 style={{ color: "#64748b", margin: 0 }}>No active trips found.</h3>
                    </div>
                ) : (
                    sortedTrips.map((t) => {
                        const steps = getTimelineSteps(t);
                        const isOnBreak = breakActiveTrips[t.tripId];

                        return (
                            <div
                                key={t.tripId}
                                className={`tsp-card ${isOnBreak ? "tsp-card-break" : ""}`}
                            >
                                <div className="tsp-card-inner">

                                    {/* ===== TOP ROW: Vehicle info + Actions ===== */}
                                    <div className="tsp-card-top">

                                        {/* Vehicle Info */}
                                        <div className="tsp-vehicle-info">
                                            <div className="tsp-truck-icon">
                                                <Truck size={24} color="#334155" />
                                            </div>
                                            <div>
                                                <div className="tsp-vehicle-num">{t.vehicleNumber}</div>
                                                <div className="tsp-manifest">Manifest: #{t.tripId}</div>
                                            </div>
                                        </div>

                                        {/* Action Buttons Row */}
                                        <div className="tsp-actions">

                                            {/* Photo */}
                                            <VehicleImageUploader tripId={t.tripId} />

                                            {/* Break UI */}
                                            {breakTripId === t.tripId ? (
                                                <div className="tsp-break-input-row">
                                                    <input
                                                        type="text"
                                                        placeholder="Reason..."
                                                        value={breakReason}
                                                        onChange={(e) => setBreakReason(e.target.value)}
                                                        className="tsp-break-input"
                                                    />
                                                    <button
                                                        onClick={() => startBreak(t.tripId)}
                                                        className="tsp-btn-confirm"
                                                    >
                                                        Confirm
                                                    </button>
                                                </div>
                                            ) : isOnBreak ? (
                                                <button
                                                    onClick={() => endBreak(t.tripId)}
                                                    className="tsp-btn-resume"
                                                >
                                                    <Play size={16} fill="white" /> Resume Trip
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => { handleBreakClick(t.tripId); setBreakTripId(t.tripId); }}
                                                    className="tsp-btn-break"
                                                >
                                                    <Coffee size={16} /> Break
                                                </button>
                                            )}

                                            {/* Status Update */}
                                            <button
                                                onClick={() => handleStatusUpdateWithGPS(t)}
                                                className="tsp-btn-update"
                                            >
                                                <RefreshCw size={16} /> Update
                                            </button>
                                        </div>
                                    </div>

                                    {/* ===== STATUS BADGES ===== */}
                                    <div className="tsp-status-row">
                                        <div className="tsp-status-badge">
                                            {t.status?.replaceAll("_", " ")}
                                        </div>
                                        {isOnBreak && (
                                            <div className="tsp-break-badge">
                                                <AlertCircle size={12} /> ON BREAK
                                            </div>
                                        )}
                                    </div>

                                    {/* ===== TIMELINE ===== */}
                                    <div className="tsp-timeline-scroll">
                                        {steps.map((step, index) => (
                                            <React.Fragment key={index}>
                                                <div className="tsp-step">
                                                    <div className={`tsp-step-icon ${step.active ? "tsp-step-active" : ""}`}>
                                                        {step.icon}
                                                    </div>
                                                    <div className={`tsp-step-label ${step.active ? "tsp-step-label-active" : ""}`}>
                                                        {step.label}
                                                    </div>
                                                    {step.active && step.time && (
                                                        <div className="tsp-step-time">
                                                            {getTimeAgo(step.time)}
                                                        </div>
                                                    )}
                                                </div>
                                                {index < steps.length - 1 && (
                                                    <div className={`tsp-connector ${steps[index + 1].active ? "tsp-connector-active" : ""}`} />
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>

                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <style>{`
                * { box-sizing: border-box; }

                /* ===== ROOT ===== */
                .tsp-root {
                    min-height: 100vh;
                    background-color: #f1f5f9;
                    padding: clamp(1rem, 3vw, 2rem);
                    font-family: 'Inter', sans-serif;
                }

                /* ===== HEADER ===== */
                .tsp-header {
                    max-width: 1200px;
                    margin: 0 auto 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    flex-wrap: wrap;
                    gap: 1rem;
                }
                .tsp-title {
                    font-size: clamp(1.5rem, 5vw, 2.25rem);
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0;
                    letter-spacing: -0.02em;
                }
                .tsp-subtitle {
                    color: #64748b;
                    font-size: 1rem;
                    margin: 4px 0 0;
                }
                .tsp-units-badge {
                    background: #fff;
                    padding: 10px 20px;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    flex-shrink: 0;
                }
                .tsp-units-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background-color: #22c55e;
                    flex-shrink: 0;
                }
                .tsp-units-label {
                    font-weight: 600;
                    color: #475569;
                    white-space: nowrap;
                }

                /* ===== LIST ===== */
                .tsp-list {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                /* ===== EMPTY ===== */
                .tsp-empty {
                    text-align: center;
                    padding: 80px 20px;
                    background: #fff;
                    border-radius: 24px;
                    border: 1px solid #e2e8f0;
                }

                /* ===== CARD ===== */
                .tsp-card {
                    background: #fff;
                    border-radius: 20px;
                    overflow: hidden;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
                }
                .tsp-card-break {
                    border: 2px solid #f59e0b;
                }
                .tsp-card-inner {
                    padding: 20px;
                }

                /* ===== CARD TOP ===== */
                .tsp-card-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 14px;
                    margin-bottom: 20px;
                }
                .tsp-vehicle-info {
                    display: flex;
                    gap: 14px;
                    align-items: center;
                }
                .tsp-truck-icon {
                    background: #f8fafc;
                    padding: 12px;
                    border-radius: 12px;
                    border: 1px solid #f1f5f9;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .tsp-vehicle-num {
                    font-size: 18px;
                    font-weight: 700;
                    color: #0f172a;
                }
                .tsp-manifest {
                    font-size: 12px;
                    color: #94a3b8;
                    font-weight: 500;
                }

                /* ===== ACTIONS ===== */
                .tsp-actions {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                    align-items: center;
                }

                /* Photo button (via label) */
                .photo-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: #f1f5f9;
                    color: #475569;
                    padding: 10px 16px;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    border: 1px solid #e2e8f0;
                    transition: all 0.2s ease;
                    white-space: nowrap;
                    font-size: 14px;
                    user-select: none;
                }
                .photo-btn:hover { background: #e2e8f0; }

                /* Break input row */
                .tsp-break-input-row {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    background: #fffbeb;
                    padding: 4px;
                    border-radius: 12px;
                    border: 1px solid #fef3c7;
                }
                .tsp-break-input {
                    padding: 10px 12px;
                    border-radius: 8px;
                    border: 1px solid #fde68a;
                    font-size: 14px;
                    outline: none;
                    width: 130px;
                    background: #fff;
                }
                .tsp-btn-confirm {
                    background: #f59e0b;
                    color: #fff;
                    border: none;
                    padding: 10px 14px;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    white-space: nowrap;
                    font-size: 13px;
                }
                .tsp-btn-resume {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: #ef4444;
                    color: #fff;
                    border: none;
                    padding: 10px 18px;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    white-space: nowrap;
                    font-size: 14px;
                }
                .tsp-btn-break {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: #fff;
                    color: #f59e0b;
                    border: 1.5px solid #f59e0b;
                    padding: 10px 16px;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    white-space: nowrap;
                    font-size: 14px;
                }
                .tsp-btn-update {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: #0f172a;
                    color: #fff;
                    border: none;
                    padding: 11px 18px;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    white-space: nowrap;
                    font-size: 14px;
                }

                /* ===== STATUS BADGES ===== */
                .tsp-status-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                }
                .tsp-status-badge {
                    background: #e0f2fe;
                    color: #0369a1;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 700;
                }
                .tsp-break-badge {
                    background: #fef3c7;
                    color: #92400e;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                /* ===== TIMELINE ===== */
                .tsp-timeline-scroll {
                    display: flex;
                    align-items: center;
                    overflow-x: auto;
                    padding-bottom: 8px;
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .tsp-timeline-scroll::-webkit-scrollbar { display: none; }

                .tsp-step {
                    flex-shrink: 0;
                    text-align: center;
                    width: 72px;
                }
                .tsp-step-icon {
                    width: 36px;
                    height: 36px;
                    margin: 0 auto 8px;
                    border-radius: 10px;
                    background: #f1f5f9;
                    color: #94a3b8;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .tsp-step-active {
                    background: #3b82f6;
                    color: #fff;
                }
                .tsp-step-label {
                    font-size: 10px;
                    font-weight: 700;
                    color: #cbd5e1;
                    text-transform: uppercase;
                }
                .tsp-step-label-active {
                    color: #1e293b;
                }
                .tsp-step-time {
                    font-size: 9px;
                    color: #64748b;
                    margin-top: 4px;
                }
                .tsp-connector {
                    flex: 1 0 30px;
                    height: 2px;
                    background: #f1f5f9;
                    margin-bottom: 20px;
                }
                .tsp-connector-active {
                    background: #3b82f6;
                }

                /* ===== ANIMATIONS ===== */
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                /* ===== RESPONSIVE: TABLET (≤900px) ===== */
                @media (max-width: 900px) {
                    .tsp-card-top {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    .tsp-actions {
                        width: 100%;
                    }
                    .tsp-btn-update {
                        margin-left: auto;
                    }
                }

                /* ===== RESPONSIVE: MOBILE (≤600px) ===== */
                @media (max-width: 600px) {
                    .tsp-root { padding: 1rem; }
                    .tsp-header { margin-bottom: 1.25rem; }
                    .tsp-subtitle { font-size: 0.88rem; }
                    .tsp-units-badge { padding: 8px 14px; }

                    .tsp-card-inner { padding: 14px; }

                    .tsp-vehicle-num { font-size: 15px; }
                    .tsp-truck-icon { padding: 10px; }

                    /* Actions: full width, wrap nicely */
                    .tsp-actions {
                        width: 100%;
                        gap: 8px;
                    }
                    .photo-btn {
                        flex: 1;
                        justify-content: center;
                    }
                    .tsp-btn-break {
                        flex: 1;
                        justify-content: center;
                    }
                    .tsp-btn-resume {
                        flex: 1;
                        justify-content: center;
                    }
                    .tsp-btn-update {
                        flex: 1;
                        justify-content: center;
                        margin-left: 0;
                    }

                    /* Break input row: stack on very small */
                    .tsp-break-input-row {
                        width: 100%;
                        flex-wrap: wrap;
                    }
                    .tsp-break-input {
                        width: 100%;
                        flex: 1 1 auto;
                    }
                    .tsp-btn-confirm {
                        width: 100%;
                    }

                    /* Timeline: smaller steps */
                    .tsp-step { width: 60px; }
                    .tsp-step-icon { width: 30px; height: 30px; border-radius: 8px; }
                    .tsp-step-label { font-size: 9px; }
                    .tsp-connector { flex: 1 0 20px; }

                    .tsp-list { gap: 1rem; }
                    .tsp-empty { padding: 50px 16px; }
                }

                /* ===== VERY SMALL (≤380px) ===== */
                @media (max-width: 380px) {
                    .tsp-vehicle-num { font-size: 14px; }
                    .tsp-manifest { font-size: 11px; }
                    .tsp-btn-break,
                    .tsp-btn-update,
                    .tsp-btn-resume,
                    .photo-btn { font-size: 12px; padding: 9px 10px; }
                }
            `}</style>
        </div>
    );
}

export default TripStatusUpdatePage;
