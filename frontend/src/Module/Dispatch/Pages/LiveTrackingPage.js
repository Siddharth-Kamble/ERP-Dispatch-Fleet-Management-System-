    //
    //
    // import dayjs from "dayjs";
    // import {useEffect, useRef, useState} from "react";
    // import axios from "axios";
    // import Modal from "react-modal";
    // import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
    // import "leaflet/dist/leaflet.css";
    // import L from "leaflet";
    //
    // // Fix Leaflet default marker icon
    // delete L.Icon.Default.prototype._getIconUrl;
    // L.Icon.Default.mergeOptions({
    //     iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    //     iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    //     shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    // });
    //
    // const API_TRIPS = "http://localhost:8080/api/trips";
    // const API_GPS = "http://localhost:8080/api/live-tracking/latest";
    // const API_HISTORY = "http://localhost:8080/api/live-tracking/history";
    //
    //
    //
    // function RecenterMap({ lat, lng }) {
    //     const map = useMap();
    //     const prevPosition = useRef(null);
    //
    //     useEffect(() => {
    //         if (lat != null && lng != null) {
    //             const newPosition = [lat, lng];
    //
    //             if (
    //                 !prevPosition.current ||
    //                 prevPosition.current[0] !== lat ||
    //                 prevPosition.current[1] !== lng
    //             ) {
    //                 map.panTo(newPosition, { animate: true });
    //                 prevPosition.current = newPosition;
    //             }
    //         }
    //     }, [lat, lng, map]);
    //
    //     return null;
    // }
    //
    // /* ✅ ADD THIS HERE */
    // function LiveMarker({ vehicle }) {
    //     const markerRef = useRef(null);
    //
    //     useEffect(() => {
    //         if (markerRef.current && vehicle?.lat != null && vehicle?.lng != null) {
    //             markerRef.current.setLatLng([vehicle.lat, vehicle.lng]);
    //         }
    //     }, [vehicle?.lat, vehicle?.lng]);
    //
    //     if (!vehicle?.lat || !vehicle?.lng) return null;
    //
    //     return (
    //         <Marker ref={markerRef} position={[vehicle.lat, vehicle.lng]}>
    //             <Popup>
    //                 <strong>{vehicle.vehicleNumber}</strong><br />
    //                 Status: {vehicle.status}
    //             </Popup>
    //         </Marker>
    //     );
    // }
    //
    // function LiveTrackingPage() {
    //     const [vehicles, setVehicles] = useState([]);
    //     const [loading, setLoading] = useState(true);
    //     const [historyData, setHistoryData] = useState([]);
    //     const [modalOpen, setModalOpen] = useState(false);
    //     const [mapData, setMapData] = useState(null);
    //     const [selectedTrip, setSelectedTrip] = useState(null);
    //     const [mapModalOpen, setMapModalOpen] = useState(false);
    //
    //     const fetchLiveTracking = async () => {
    //         try {
    //             const tripsRes = await axios.get(API_TRIPS);
    //             const trips = tripsRes.data || [];
    //             const tripsWithGPS = await Promise.all(
    //                 trips.map(async (trip) => {
    //                     try {
    //                         const gpsRes = await axios.get(`${API_GPS}/${trip.id}`);
    //                         return {
    //                             ...trip,
    //                             lat: gpsRes.data?.lat ?? null,
    //                             lng: gpsRes.data?.lng ?? null,
    //                             status: gpsRes.data?.status ?? trip.status,
    //                         };
    //                     } catch {
    //                         return { ...trip, lat: null, lng: null, status: trip.status };
    //                     }
    //                 })
    //             );
    //             tripsWithGPS.sort((a, b) => b.id - a.id);
    //             setVehicles(tripsWithGPS);
    //             if (mapData) {
    //                 const updatedVehicle = tripsWithGPS.find(v => v.id === mapData.id);
    //                 if (updatedVehicle) setMapData(updatedVehicle);
    //             }
    //         } catch (err) {
    //             console.error("Failed to fetch live tracking:", err);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };
    //
    //     useEffect(() => {
    //         fetchLiveTracking();
    //         const interval = setInterval(fetchLiveTracking, 10000);
    //         return () => clearInterval(interval);
    //     }, []);
    //
    //     const openHistory = async (trip) => {
    //         setSelectedTrip(trip);
    //         try {
    //             const res = await axios.get(`${API_HISTORY}/${trip.id}`);
    //             const history = res.data || [];
    //             const sortedHistory = history
    //                 .map(h => ({ ...h, displayTime: dayjs(h.recordedAt).format("DD MMM YYYY, HH:mm") }))
    //                 .sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt));
    //             setHistoryData(sortedHistory);
    //             setModalOpen(true);
    //         } catch (err) {
    //             console.error("Failed to fetch history:", err);
    //         }
    //     };
    //
    //     const openMap = (vehicle) => {
    //         if (vehicle.lat != null && vehicle.lng != null) {
    //             setMapData({ ...vehicle, lat: Number(vehicle.lat), lng: Number(vehicle.lng) });
    //             setMapModalOpen(true);
    //         } else {
    //             alert("GPS data not available for this vehicle yet.");
    //         }
    //     };
    //
    //     /* ================= MODERN UI STYLES ================= */
    //     const styles = {
    //         container: { padding: "30px", backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" },
    //         card: { backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", overflow: "hidden", border: "1px solid #e2e8f0" },
    //         header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" },
    //         title: { fontSize: "24px", fontWeight: "700", color: "#1e293b", borderLeft: "5px solid #16a34a", paddingLeft: "15px", margin: 0 },
    //         table: { width: "100%", borderCollapse: "separate", borderSpacing: 0 },
    //         th: { backgroundColor: "#f1f5f9", color: "#64748b", fontWeight: "600", textAlign: "left", padding: "12px 20px", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.05em" },
    //         td: { padding: "16px 20px", fontSize: "14px", color: "#334155", borderBottom: "1px solid #f1f5f9" },
    //         badge: (status) => ({
    //             padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600",
    //             backgroundColor: status?.includes("COMPLETED") ? "#dcfce7" : "#eff6ff",
    //             color: status?.includes("COMPLETED") ? "#166534" : "#1e40af"
    //         }),
    //         btnMap: { backgroundColor: "#2563eb", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "6px", cursor: "pointer", fontWeight: "500", transition: "0.2s" },
    //         btnHistory: { backgroundColor: "#f1f5f9", color: "#475569", border: "none", padding: "8px 14px", borderRadius: "6px", cursor: "pointer", fontWeight: "500", marginLeft: "8px" },
    //         modalOverlay: { backgroundColor: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 },
    //         modalContent: { position: "relative", width: "90%", maxWidth: "900px", background: "#fff", borderRadius: "16px", padding: "30px", maxHeight: "90vh", outline: "none" }
    //     };
    //
    //     const isLoading = loading && vehicles.length === 0;
    //
    //     return (
    //         <div style={styles.container}>
    //             <div style={styles.header}>
    //                 <h2 style={styles.title}>Live Fleet Tracking</h2>
    //                 <div style={{ fontSize: "14px", color: "#64748b" }}>
    //                     <span style={{ color: "#16a34a" }}>●</span> System Live | Auto-refreshing 10s
    //                 </div>
    //             </div>
    //
    //             <div style={styles.card}>
    //                 <table style={styles.table}>
    //                     <thead>
    //                     <tr>
    //                         <th style={styles.th}>Trip Details</th>
    //                         <th style={styles.th}>Driver</th>
    //                         <th style={styles.th}>Status</th>
    //                         <th style={styles.th}>Coordinates</th>
    //                         <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
    //                     </tr>
    //                     </thead>
    //                     <tbody>
    //                     {isLoading ? (
    //                         <tr><td colSpan="5" style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Syncing live GPS data...</td></tr>
    //                     ) : vehicles.map((v) => (
    //                         <tr key={v.id}>
    //                             <td style={styles.td}>
    //                                 <div style={{ fontWeight: "700", color: "#1e293b" }}>{v.vehicleNumber}</div>
    //                                 <div style={{ fontSize: "12px", color: "#64748b" }}>Trip ID: #{v.id}</div>
    //                             </td>
    //                             <td style={styles.td}>{v.driverName}</td>
    //                             <td style={styles.td}>
    //                                 <span style={styles.badge(v.status)}>{v.status?.replace(/_/g, " ")}</span>
    //                             </td>
    //                             <td style={styles.td}>
    //                                 <div style={{ fontFamily: "monospace", fontSize: "12px" }}>
    //                                     {v.lat ? `${v.lat.toFixed(4)}, ${v.lng.toFixed(4)}` : "Waiting for GPS..."}
    //                                 </div>
    //                             </td>
    //                             <td style={{ ...styles.td, textAlign: "right" }}>
    //                                 <button style={styles.btnMap} onClick={() => openMap(v)}>Track</button>
    //                                 <button style={styles.btnHistory} onClick={() => openHistory(v)}>Log</button>
    //                             </td>
    //                         </tr>
    //                     ))}
    //                     </tbody>
    //                 </table>
    //             </div>
    //
    //             {/* History Modal */}
    //             <Modal isOpen={modalOpen} onRequestClose={() => setModalOpen(false)} style={{ overlay: styles.modalOverlay, content: styles.modalContent }}>
    //                 <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
    //                     <h3>Trip Activity Log: {selectedTrip?.vehicleNumber}</h3>
    //                     <button onClick={() => setModalOpen(false)} style={{ border: "none", background: "#f1f5f9", padding: "8px 15px", borderRadius: "6px", cursor: "pointer" }}>Close</button>
    //                 </div>
    //                 <div style={{ maxHeight: "60vh", overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
    //                     <table style={styles.table}>
    //                         <thead style={{ position: "sticky", top: 0 }}>
    //                         <tr>
    //                             <th style={styles.th}>Timestamp</th>
    //                             <th style={styles.th}>Event</th>
    //                             <th style={styles.th}>Location</th>
    //                         </tr>
    //                         </thead>
    //                         <tbody>
    //                         {historyData.map((h, idx) => (
    //                             <tr key={idx}>
    //                                 <td style={styles.td}>{h.displayTime}</td>
    //                                 <td style={styles.td}><span style={styles.badge(h.status)}>{h.status}</span></td>
    //                                 <td style={{ ...styles.td, fontFamily: "monospace" }}>{h.lat}, {h.lng}</td>
    //                             </tr>
    //                         ))}
    //                         </tbody>
    //                     </table>
    //                 </div>
    //             </Modal>
    //
    //             {/* Map Modal */}
    //             <Modal
    //                 isOpen={mapModalOpen}
    //                 onRequestClose={() => { setMapModalOpen(false); setMapData(null); }}
    //                 style={{ overlay: styles.modalOverlay, content: { ...styles.modalContent, padding: "10px", height: "80vh" } }}
    //             >
    //                 <div style={{ padding: "15px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    //                     <h4 style={{ margin: 0 }}>Live Map: {mapData?.vehicleNumber} ({mapData?.driverName})</h4>
    //                     <button onClick={() => { setMapModalOpen(false); setMapData(null); }} style={styles.btnHistory}>Exit Map</button>
    //                 </div>
    //                 {mapData && (
    //                     <MapContainer
    //                        // key={mapData.id}
    //                         center={[mapData.lat, mapData.lng]}
    //                         zoom={15}
    //                         style={{ height: "calc(100% - 70px)", width: "100%", borderRadius: "12px" }}
    //                     >
    //                         <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    //                         <LiveMarker vehicle={mapData} />
    //                         <RecenterMap lat={mapData.lat} lng={mapData.lng} />
    //                     </MapContainer>
    //                 )}
    //             </Modal>
    //         </div>
    //     );
    // }
    //
    // export default LiveTrackingPage;













    // src/Module/Dispatch/Pages/LiveTrackingPage.js

    import dayjs from "dayjs";
    import { useEffect, useRef, useState } from "react";
    import axios from "axios";
    import Modal from "react-modal";
    import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
    import "leaflet/dist/leaflet.css";
    import L from "leaflet";

    // Fix Leaflet default marker icon
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });

    const API_TRIPS = `${process.env.REACT_APP_API_URL}/api/trips`;
    const API_GPS = `${process.env.REACT_APP_API_URL}/api/live-tracking/latest`;
    const API_HISTORY =`${process.env.REACT_APP_API_URL}/api/live-tracking/history`;

    /* ---------------- Recenter Map ---------------- */
    function RecenterMap({ lat, lng }) {
        const map = useMap();
        const prevPosition = useRef(null);

        useEffect(() => {
            if (lat != null && lng != null) {
                const newPosition = [lat, lng];

                if (
                    !prevPosition.current ||
                    prevPosition.current[0] !== lat ||
                    prevPosition.current[1] !== lng
                ) {
                    map.panTo(newPosition, { animate: true });
                    prevPosition.current = newPosition;
                }
            }
        }, [lat, lng, map]);

        return null;
    }

    /* ---------------- Live Marker ---------------- */
    function LiveMarker({ vehicle }) {
        const markerRef = useRef(null);

        useEffect(() => {
            if (
                markerRef.current &&
                vehicle?.lat != null &&
                vehicle?.lng != null
            ) {
                markerRef.current.setLatLng([vehicle.lat, vehicle.lng]);
            }
        }, [vehicle?.lat, vehicle?.lng]);

        if (vehicle?.lat == null || vehicle?.lng == null) return null;

        return (
            <Marker ref={markerRef} position={[vehicle.lat, vehicle.lng]}>
                <Popup>
                    <strong>{vehicle.vehicleNumber}</strong>
                    <br />
                    Status: {vehicle.status}
                </Popup>
            </Marker>
        );
    }

    /* ---------------- Main Page ---------------- */
    function LiveTrackingPage() {
        const [vehicles, setVehicles] = useState([]);
        const [loading, setLoading] = useState(true);
        const [historyData, setHistoryData] = useState([]);
        const [modalOpen, setModalOpen] = useState(false);
        const [mapData, setMapData] = useState(null);
        const [selectedTrip, setSelectedTrip] = useState(null);
        const [mapModalOpen, setMapModalOpen] = useState(false);

        /* ---------- Fetch Trips + GPS ---------- */
        const fetchLiveTracking = async () => {
            try {
                const tripsRes = await axios.get(API_TRIPS);
                const trips = tripsRes.data || [];

                const tripsWithGPS = await Promise.all(
                    trips.map(async (trip) => {
                        try {
                            const gpsRes = await axios.get(
                                `${API_GPS}/${trip.id}`
                            );

                            return {
                                ...trip,
                                lat: gpsRes.data?.lat ?? null,
                                lng: gpsRes.data?.lng ?? null,
                                status:
                                    gpsRes.data?.status ?? trip.status,
                                timestamp:
                                    gpsRes.data?.timestamp ?? null,
                            };
                        } catch {
                            return {
                                ...trip,
                                lat: null,
                                lng: null,
                                status: trip.status,
                                timestamp: null,
                            };
                        }
                    })
                );

                tripsWithGPS.sort((a, b) => b.id - a.id);

                setVehicles(tripsWithGPS);

                if (mapData) {
                    const updatedVehicle = tripsWithGPS.find(
                        (v) => v.id === mapData.id
                    );
                    if (updatedVehicle) setMapData(updatedVehicle);
                }
            } catch (err) {
                console.error("Failed to fetch live tracking:", err);
            } finally {
                setLoading(false);
            }
        };

        /* ---------- Auto Refresh Every 10s ---------- */
        useEffect(() => {
            fetchLiveTracking();
            const interval = setInterval(fetchLiveTracking, 10000);
            return () => clearInterval(interval);
        }, []);

        /* ---------- History ---------- */
        const openHistory = async (trip) => {
            setSelectedTrip(trip);
            try {
                const res = await axios.get(
                    `${API_HISTORY}/${trip.id}`
                );
                const history = res.data || [];

                const sortedHistory = history
                    .map((h) => ({
                        ...h,
                        displayTime: dayjs(h.recordedAt).format(
                            "DD MMM YYYY, HH:mm"
                        ),
                    }))
                    .sort(
                        (a, b) =>
                            new Date(a.recordedAt) -
                            new Date(b.recordedAt)
                    );

                setHistoryData(sortedHistory);
                setModalOpen(true);
            } catch (err) {
                console.error("Failed to fetch history:", err);
            }
        };

        /* ---------- Open Map ---------- */
        const openMap = (vehicle) => {
            if (
                vehicle.lat != null &&
                vehicle.lng != null
            ) {
                setMapData({
                    ...vehicle,
                    lat: Number(vehicle.lat),
                    lng: Number(vehicle.lng),
                });
                setMapModalOpen(true);
            } else {
                alert(
                    "GPS data not available for this vehicle yet."
                );
            }
        };

        /* ================= UI (UNCHANGED) ================= */
        const styles = {
            container: {
                padding: "30px",
                backgroundColor: "#f8fafc",
                minHeight: "100vh",
                fontFamily: "'Inter', sans-serif",
            },
            card: {
                backgroundColor: "#fff",
                borderRadius: "12px",
                boxShadow:
                    "0 4px 6px -1px rgba(0,0,0,0.1)",
                overflow: "hidden",
                border: "1px solid #e2e8f0",
            },
            header: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "25px",
            },
            title: {
                fontSize: "24px",
                fontWeight: "700",
                color: "#1e293b",
                borderLeft: "5px solid #16a34a",
                paddingLeft: "15px",
                margin: 0,
            },
            table: {
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: 0,
            },
            th: {
                backgroundColor: "#f1f5f9",
                color: "#64748b",
                fontWeight: "600",
                textAlign: "left",
                padding: "12px 20px",
                fontSize: "13px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
            },
            td: {
                padding: "16px 20px",
                fontSize: "14px",
                color: "#334155",
                borderBottom: "1px solid #f1f5f9",
            },
            badge: (status) => ({
                padding: "4px 10px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "600",
                backgroundColor:
                    status?.includes("COMPLETED")
                        ? "#dcfce7"
                        : "#eff6ff",
                color:
                    status?.includes("COMPLETED")
                        ? "#166534"
                        : "#1e40af",
            }),
            btnMap: {
                backgroundColor: "#2563eb",
                color: "#fff",
                border: "none",
                padding: "8px 14px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "500",
            },
            btnHistory: {
                backgroundColor: "#f1f5f9",
                color: "#475569",
                border: "none",
                padding: "8px 14px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "500",
                marginLeft: "8px",
            },
            modalOverlay: {
                backgroundColor:
                    "rgba(15, 23, 42, 0.7)",
                backdropFilter: "blur(4px)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 9999,
            },
            modalContent: {
                position: "relative",
                width: "90%",
                maxWidth: "900px",
                background: "#fff",
                borderRadius: "16px",
                padding: "30px",
                maxHeight: "90vh",
                outline: "none",
            },
        };

        const isLoading =
            loading && vehicles.length === 0;

        return (
            <div style={styles.container}>
                <div style={styles.header}>
                    <h2 style={styles.title}>
                        Live Fleet Tracking
                    </h2>
                    <div
                        style={{
                            fontSize: "14px",
                            color: "#64748b",
                        }}
                    >
                    <span
                        style={{
                            color: "#16a34a",
                        }}
                    >
                        ●
                    </span>{" "}
                        System Live | Auto-refreshing 10s
                    </div>
                </div>

                <div style={styles.card}>
                    <table style={styles.table}>
                        <thead>
                        <tr>
                            <th style={styles.th}>
                                Trip Details
                            </th>
                            <th style={styles.th}>
                                Driver
                            </th>
                            <th style={styles.th}>
                                Status
                            </th>
                            <th style={styles.th}>
                                Coordinates
                            </th>
                            <th
                                style={{
                                    ...styles.th,
                                    textAlign: "right",
                                }}
                            >
                                Actions
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {isLoading ? (
                            <tr>
                                <td
                                    colSpan="5"
                                    style={{
                                        padding: "40px",
                                        textAlign:
                                            "center",
                                        color:
                                            "#64748b",
                                    }}
                                >
                                    Syncing live GPS
                                    data...
                                </td>
                            </tr>
                        ) : vehicles.map((v) => (
                            <tr key={v.id}>
                                <td style={styles.td}>
                                    <div
                                        style={{
                                            fontWeight:
                                                "700",
                                            color:
                                                "#1e293b",
                                        }}
                                    >
                                        {
                                            v.vehicleNumber
                                        }
                                    </div>
                                    <div
                                        style={{
                                            fontSize:
                                                "12px",
                                            color:
                                                "#64748b",
                                        }}
                                    >
                                        Trip ID: #
                                        {v.id}
                                    </div>
                                    {v.timestamp && (
                                        <div
                                            style={{
                                                fontSize:
                                                    "10px",
                                                color:
                                                    "#94a3b8",
                                            }}
                                        >
                                            {dayjs(
                                                v.timestamp
                                            ).format(
                                                "HH:mm:ss"
                                            )}
                                        </div>
                                    )}
                                </td>
                                <td style={styles.td}>
                                    {v.driverName}
                                </td>
                                <td style={styles.td}>
                                    <span
                                        style={styles.badge(
                                            v.status
                                        )}
                                    >
                                        {v.status?.replace(
                                            /_/g,
                                            " "
                                        )}
                                    </span>
                                </td>
                                <td style={styles.td}>
                                    <div
                                        style={{
                                            fontFamily:
                                                "monospace",
                                            fontSize:
                                                "12px",
                                        }}
                                    >
                                        {v.lat !=
                                        null &&
                                        v.lng !=
                                        null
                                            ? `${Number(
                                                v.lat
                                            ).toFixed(
                                                4
                                            )}, ${Number(
                                                v.lng
                                            ).toFixed(
                                                4
                                            )}`
                                            : "Waiting for GPS..."}
                                    </div>
                                </td>
                                <td
                                    style={{
                                        ...styles.td,
                                        textAlign:
                                            "right",
                                    }}
                                >
                                    <button
                                        style={
                                            styles.btnMap
                                        }
                                        onClick={() =>
                                            openMap(
                                                v
                                            )
                                        }
                                    >
                                        Track
                                    </button>
                                    <button
                                        style={
                                            styles.btnHistory
                                        }
                                        onClick={() =>
                                            openHistory(
                                                v
                                            )
                                        }
                                    >
                                        Log
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* History Modal */}
                <Modal
                    isOpen={modalOpen}
                    onRequestClose={() =>
                        setModalOpen(false)
                    }
                    style={{
                        overlay:
                        styles.modalOverlay,
                        content:
                        styles.modalContent,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent:
                                "space-between",
                            marginBottom:
                                "20px",
                        }}
                    >
                        <h3>
                            Trip Activity Log:{" "}
                            {
                                selectedTrip?.vehicleNumber
                            }
                        </h3>
                        <button
                            onClick={() =>
                                setModalOpen(false)
                            }
                            style={{
                                border: "none",
                                background:
                                    "#f1f5f9",
                                padding:
                                    "8px 15px",
                                borderRadius:
                                    "6px",
                                cursor: "pointer",
                            }}
                        >
                            Close
                        </button>
                    </div>

                    <div
                        style={{
                            maxHeight: "60vh",
                            overflowY:
                                "auto",
                            border:
                                "1px solid #e2e8f0",
                            borderRadius:
                                "8px",
                        }}
                    >
                        <table
                            style={styles.table}
                        >
                            <thead
                                style={{
                                    position:
                                        "sticky",
                                    top: 0,
                                }}
                            >
                            <tr>
                                <th
                                    style={
                                        styles.th
                                    }
                                >
                                    Timestamp
                                </th>
                                <th
                                    style={
                                        styles.th
                                    }
                                >
                                    Event
                                </th>
                                <th
                                    style={
                                        styles.th
                                    }
                                >
                                    Location
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {historyData.map(
                                (h, idx) => (
                                    <tr
                                        key={
                                            idx
                                        }
                                    >
                                        <td
                                            style={
                                                styles.td
                                            }
                                        >
                                            {
                                                h.displayTime
                                            }
                                        </td>
                                        <td
                                            style={
                                                styles.td
                                            }
                                        >
                                            <span
                                                style={styles.badge(
                                                    h.status
                                                )}
                                            >
                                                {
                                                    h.status
                                                }
                                            </span>
                                        </td>
                                        <td
                                            style={{
                                                ...styles.td,
                                                fontFamily:
                                                    "monospace",
                                            }}
                                        >
                                            {h.lat},{" "}
                                            {h.lng}
                                        </td>
                                    </tr>
                                )
                            )}
                            </tbody>
                        </table>
                    </div>
                </Modal>

                {/* Map Modal */}
                <Modal
                    isOpen={mapModalOpen}
                    onRequestClose={() => {
                        setMapModalOpen(
                            false
                        );
                        setMapData(null);
                    }}
                    style={{
                        overlay:
                        styles.modalOverlay,
                        content: {
                            ...styles.modalContent,
                            padding: "10px",
                            height:
                                "80vh",
                        },
                    }}
                >
                    <div
                        style={{
                            padding: "15px",
                            display: "flex",
                            justifyContent:
                                "space-between",
                            alignItems:
                                "center",
                        }}
                    >
                        <h4
                            style={{
                                margin: 0,
                            }}
                        >
                            Live Map:{" "}
                            {
                                mapData?.vehicleNumber
                            }{" "}
                            (
                            {
                                mapData?.driverName
                            }
                            )
                        </h4>
                        <button
                            onClick={() => {
                                setMapModalOpen(
                                    false
                                );
                                setMapData(
                                    null
                                );
                            }}
                            style={
                                styles.btnHistory
                            }
                        >
                            Exit Map
                        </button>
                    </div>

                    {mapData &&
                        mapData.lat != null &&
                        mapData.lng !=
                        null && (
                            <MapContainer
                                center={[
                                    mapData.lat,
                                    mapData.lng,
                                ]}
                                zoom={15}
                                style={{
                                    height:
                                        "calc(100% - 70px)",
                                    width:
                                        "100%",
                                    borderRadius:
                                        "12px",
                                }}
                            >
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <LiveMarker
                                    vehicle={
                                        mapData
                                    }
                                />
                                <RecenterMap
                                    lat={
                                        mapData.lat
                                    }
                                    lng={
                                        mapData.lng
                                    }
                                />
                            </MapContainer>
                        )}
                </Modal>
            </div>
        );
    }

    export default LiveTrackingPage;