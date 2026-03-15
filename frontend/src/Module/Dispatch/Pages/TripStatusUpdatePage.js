
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
                capture="environment" // Forces camera on mobile
            />
            <label
                htmlFor={`file-${tripId}`}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "#f1f5f9",
                    color: "#475569",
                    padding: "10px 16px",
                    borderRadius: "10px",
                    fontWeight: "600",
                    cursor: "pointer",
                    border: "1px solid #e2e8f0",
                    transition: "all 0.2s ease",
                    whiteSpace: "nowrap"
                }}
            >
                {loading ? <RefreshCw size={16} style={{ animation: "spin 2s linear infinite" }} /> : <Camera size={16} />}
                <span style={{ fontSize: '14px' }}>{loading ? "..." : "Photo"}</span>
            </label>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
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
        <div style={{
            minHeight: "100vh",
            backgroundColor: "#f1f5f9",
            padding: "clamp(1rem, 3vw, 2rem)",
            fontFamily: "'Inter', sans-serif",
            boxSizing: "border-box"
        }}>
            {/* Header */}
            <header style={{ maxWidth: "1200px", margin: "0 auto 2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                    <h1 style={{ fontSize: "clamp(1.5rem, 5vw, 2.25rem)", fontWeight: "800", color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>
                        Fleet Dispatch
                    </h1>
                    <p style={{ color: "#64748b", fontSize: "1rem", marginTop: "4px" }}>Real-time transit management</p>
                </div>
                <div style={{ background: '#fff', padding: '10px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }}></div>
                    <span style={{ fontWeight: '600', color: '#475569' }}>{sortedTrips.length} Units</span>
                </div>
            </header>

            <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {sortedTrips.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "80px 20px", background: "#fff", borderRadius: "24px", border: "1px solid #e2e8f0" }}>
                        <ClipboardList size={48} color="#cbd5e1" style={{ marginBottom: "16px" }} />
                        <h3 style={{ color: "#64748b" }}>No active trips found.</h3>
                    </div>
                ) : (
                    sortedTrips.map((t) => {
                        const steps = getTimelineSteps(t);
                        const isOnBreak = breakActiveTrips[t.tripId];

                        return (
                            <div key={t.tripId} style={{
                                background: "#fff",
                                borderRadius: "20px",
                                overflow: "hidden",
                                border: isOnBreak ? "2px solid #f59e0b" : "1px solid #e2e8f0",
                                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)"
                            }}>

                                <div style={{ padding: "24px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
                                        <div style={{ display: "flex", gap: "16px" }}>
                                            <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                                                <Truck size={24} color="#334155" />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a" }}>{t.vehicleNumber}</div>
                                                <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "500" }}>Manifest: #{t.tripId}</div>
                                            </div>
                                        </div>

                                        {/* Action Container - Flexbox handles the dynamic movement */}
                                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>

                                            {/* 1. Photo Upload (Always stays on left) */}
                                            <VehicleImageUploader tripId={t.tripId} />

                                            {/* 2. Break UI (Dynamic width) */}
                                            {breakTripId === t.tripId ? (
                                                <div style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "6px",
                                                    background: "#fffbeb",
                                                    padding: "4px",
                                                    borderRadius: "12px",
                                                    border: "1px solid #fef3c7"
                                                }}>
                                                    <input
                                                        type="text"
                                                        placeholder="Reason..."
                                                        value={breakReason}
                                                        onChange={(e) => setBreakReason(e.target.value)}
                                                        style={{
                                                            padding: "10px 12px",
                                                            borderRadius: "8px",
                                                            border: "1px solid #fde68a",
                                                            fontSize: "14px",
                                                            outline: "none",
                                                            width: "140px"
                                                        }}
                                                    />
                                                    <button
                                                        onClick={() => startBreak(t.tripId)}
                                                        style={{ background: "#f59e0b", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
                                                    >
                                                        Confirm
                                                    </button>
                                                </div>
                                            ) : isOnBreak ? (
                                                <button
                                                    onClick={() => endBreak(t.tripId)}
                                                    style={{ display: "flex", alignItems: "center", gap: "8px", background: "#ef4444", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "10px", fontWeight: "600", cursor: "pointer" }}
                                                >
                                                    <Play size={16} fill="white" /> Resume Trip
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => { handleBreakClick(t.tripId); setBreakTripId(t.tripId); }}
                                                    style={{ display: "flex", alignItems: "center", gap: "8px", background: "#fff", color: "#f59e0b", border: "1.5px solid #f59e0b", padding: "10px 16px", borderRadius: "10px", fontWeight: "600", cursor: "pointer" }}
                                                >
                                                    <Coffee size={16} /> Break
                                                </button>
                                            )}

                                            {/* 3. Status Update (Always stays on right) */}
                                            <button
                                                onClick={() => handleStatusUpdateWithGPS(t)}
                                                style={{ display: "flex", alignItems: "center", gap: "8px", background: "#0f172a", color: "#fff", border: "none", padding: "11px 20px", borderRadius: "10px", fontWeight: "600", cursor: "pointer" }}
                                            >
                                                <RefreshCw size={16} /> Update
                                            </button>
                                        </div>
                                    </div>

                                    {/* Status Info */}
                                    <div style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
                                        <div style={{ background: "#e0f2fe", color: "#0369a1", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" }}>
                                            {t.status?.replaceAll("_", " ")}
                                        </div>
                                        {isOnBreak && (
                                            <div style={{ background: "#fef3c7", color: "#92400e", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
                                                <AlertCircle size={12} /> ON BREAK
                                            </div>
                                        )}
                                    </div>

                                    {/* Timeline */}
                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        overflowX: "auto",
                                        paddingBottom: "10px",
                                        msOverflowStyle: "none",
                                        scrollbarWidth: "none"
                                    }}>
                                        {steps.map((step, index) => (
                                            <React.Fragment key={index}>
                                                <div style={{ flexShrink: 0, textAlign: "center", width: "80px" }}>
                                                    <div style={{
                                                        width: "36px",
                                                        height: "36px",
                                                        margin: "0 auto 8px",
                                                        borderRadius: "10px",
                                                        background: step.active ? "#3b82f6" : "#f1f5f9",
                                                        color: step.active ? "#fff" : "#94a3b8",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center"
                                                    }}>
                                                        {step.icon}
                                                    </div>
                                                    <div style={{ fontSize: "10px", fontWeight: "700", color: step.active ? "#1e293b" : "#cbd5e1", textTransform: "uppercase" }}>
                                                        {step.label}
                                                    </div>
                                                    {step.active && step.time && (
                                                        <div style={{ fontSize: "9px", color: "#64748b", marginTop: "4px" }}>
                                                            {getTimeAgo(step.time)}
                                                        </div>
                                                    )}
                                                </div>
                                                {index < steps.length - 1 && (
                                                    <div style={{
                                                        flex: "1 0 40px",
                                                        height: "2px",
                                                        background: steps[index + 1].active ? "#3b82f6" : "#f1f5f9",
                                                        marginBottom: "20px"
                                                    }} />
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
        </div>
    );
}

export default TripStatusUpdatePage;