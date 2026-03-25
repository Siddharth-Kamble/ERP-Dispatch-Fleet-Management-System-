



import React, { useState, useEffect, useRef } from "react";
import tripStatusService from "../Services/tripStatusService";
import axios from "axios";

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

import { useEffect, useState, useRef } from "react";

function OngoingTripManager({ ongoingTrips, setOngoingTrips }) {

  const [loadingIds, setLoadingIds] = useState([]);
  const intervalRefs = useRef({});

  useEffect(() => {
    const fetchLiveTracking = async () => {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/live-tracking/update`
      );

      const data = await res.json();
      console.log(data);
    };

    fetchLiveTracking();
  }, []);

    const startGPSTracking = (tripId) => {
        if (!navigator.geolocation) {
            console.error("Geolocation not supported");
            return;
        }

        if (intervalRefs.current[tripId]) return;

        console.log(`🚀 GPS Started for trip ${tripId}`);

        const intervalId = setInterval(() => {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const payload = {
                        tripId: Number(tripId),
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };

                    try {
                        await axios.post(LIVE_TRACKING_API, payload);
                        console.log("✅ Location sent:", payload);
                    } catch (err) {
                        console.error("❌ GPS Update failed:", err.message);
                    }
                },
                (err) => console.error("GPS Error:", err.message),
                {
                    enableHighAccuracy: true,
                    timeout: 10000
                }
            );
        }, 5000); // send every 5 seconds

        intervalRefs.current[tripId] = intervalId;
    };

    const stopTracking = (tripId) => {
        if (intervalRefs.current[tripId]) {
            clearInterval(intervalRefs.current[tripId]);
            delete intervalRefs.current[tripId];
            console.log(`🛑 GPS Stopped for trip ${tripId}`);
        }
    };

    // ✅ Clean up on Unmount
    useEffect(() => {
        return () => {
            Object.values(intervalRefs.current).forEach((id) => {
                navigator.geolocation.clearWatch(id);
            });
        };
    }, []);

    // ✅ Single Unified Effect to Sync Tracking with Status
    useEffect(() => {
        ongoingTrips.forEach((trip) => {
            const tripId = trip.tripId || trip.id;
            const isMoving = ["IN_TRANSIT", "RETURN_JOURNEY_STARTED"].includes(trip.status);

            if (isMoving) {
                startGPSTracking(tripId);
            } else {
                stopGPSTracking(tripId);
            }
        });
    }, [ongoingTrips]);

    const handleStatusUpdate = async (trip) => {
        const tripId = trip.tripId || trip.id; // ✅ Support both id formats
        const currentIndex = STATUS_FLOW.indexOf(trip.status);
        if (currentIndex === -1 || currentIndex === STATUS_FLOW.length - 1) return;
        const nextStatus = STATUS_FLOW[currentIndex + 1];

        try {
            setLoadingIds((prev) => [...prev, tripId]);

            // 1. Update Backend
            await tripStatusService.updateTripStatus(tripId, nextStatus);

            // 2. Update Local State (This triggers the GPS Effect above)
            setOngoingTrips((prev) =>
                prev.map((t) => (t.tripId === tripId || t.id === tripId) ? { ...t, status: nextStatus } : t)
            );

        } catch (err) {
            console.error("Status update failed:", err);
            alert("Status update failed");
        } finally {
            setLoadingIds((prev) => prev.filter((id) => id !== tripId));
        }
    };

    /* ================= STYLES ================= */
    const styles = {
        wrapper: { minHeight: "100vh", backgroundColor: "#f8fafc", padding: "20px", fontFamily: "'Inter', system-ui, sans-serif", color: "#1e293b" },
        container: { maxWidth: "1200px", margin: "0 auto" },
        header: { marginBottom: "30px", display: "flex", alignItems: "center", gap: "12px" },
        card: { backgroundColor: "#fff", borderRadius: "12px", padding: "24px", marginBottom: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "24px", alignItems: "center" },
        section: { flex: "1 1 200px", minWidth: "150px" },
        label: { fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px", display: "block" },
        vehicleId: { fontSize: "18px", fontWeight: "800", color: "#2563eb", margin: 0 },
        statusBadge: { display: "inline-flex", alignItems: "center", padding: "4px 12px", borderRadius: "9999px", fontSize: "12px", fontWeight: "600", backgroundColor: "#dbeafe", color: "#1e40af" },
        progressBarContainer: { width: "100%", height: "6px", backgroundColor: "#e2e8f0", borderRadius: "10px", marginTop: "12px", overflow: "hidden" },
        progressBar: (percent) => ({ width: `${percent}%`, height: "100%", backgroundColor: "#2563eb", transition: "width 0.5s ease" }),
        actionBtn: (isLoading) => ({ width: "100%", padding: "12px", backgroundColor: isLoading ? "#cbd5e1" : "#1e293b", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "700", cursor: isLoading ? "not-allowed" : "pointer", transition: "all 0.2s", fontSize: "14px" })
    };

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                <div style={styles.header}>
                    <h1 style={{ fontSize: "24px", fontWeight: "800", margin: 0 }}>Active Fleet Status</h1>
                    <span style={{ backgroundColor: "#2563eb", color: "#fff", padding: "2px 10px", borderRadius: "6px", fontSize: "14px" }}>
                        {ongoingTrips.length} Active
                    </span>
                </div>

                {ongoingTrips.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "60px", backgroundColor: "#fff", borderRadius: "12px", border: "2px dashed #e2e8f0" }}>
                        <p style={{ color: "#64748b" }}>No ongoing trips found.</p>
                    </div>
                ) : (
                    ongoingTrips.map((trip) => {
                        const tripId = trip.tripId || trip.id;
                        const currentIndex = STATUS_FLOW.indexOf(trip.status);
                        const progressPercent = ((currentIndex + 1) / STATUS_FLOW.length) * 100;
                        const nextStatus = currentIndex < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIndex + 1] : null;
                        const isLoading = loadingIds.includes(tripId);
                        const isLive = ["IN_TRANSIT", "RETURN_JOURNEY_STARTED"].includes(trip.status);

                        return (
                            <div key={tripId} style={styles.card}>
                                <div style={styles.section}>
                                    <span style={styles.label}>Vehicle & Driver</span>
                                    <p style={styles.vehicleId}>{trip.vehicleNumber}</p>
                                    <p style={{ margin: 0, color: "#475569", fontWeight: "500", fontSize: '14px' }}>{trip.driverName}</p>
                                    {isLive && <div style={{color: '#10b981', fontSize: '10px', fontWeight: 'bold', marginTop: '5px'}}>📡 LIVE TRACKING ACTIVE</div>}
                                </div>

                                <div style={{ ...styles.section, flex: "2 1 300px" }}>
                                    <span style={styles.label}>Current Progress</span>
                                    <div style={styles.statusBadge}>
                                        {trip.status?.replace(/_/g, " ")}
                                    </div>
                                    <div style={styles.progressBarContainer}>
                                        <div style={styles.progressBar(progressPercent)} />
                                    </div>
                                </div>

                                <div style={styles.section}>
                                    <span style={styles.label}>Trip ID</span>
                                    <p style={{ margin: 0, fontSize: "14px", fontWeight: "600" }}>#{tripId}</p>
                                </div>

                                <div style={{ ...styles.section, minWidth: "200px" }}>
                                    <span style={styles.label}>Logistics Action</span>
                                    {nextStatus ? (
                                        <button
                                            style={styles.actionBtn(isLoading)}
                                            onClick={() => handleStatusUpdate(trip)}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? "Updating..." : `Mark as ${nextStatus.replace(/_/g, " ")}`}
                                        </button>
                                    ) : (
                                        <div style={{ color: "#059669", fontWeight: "700", textAlign: "center", padding: "10px", backgroundColor: "#ecfdf5", borderRadius: "8px" }}>
                                            Trip Completed
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default OngoingTripManager;