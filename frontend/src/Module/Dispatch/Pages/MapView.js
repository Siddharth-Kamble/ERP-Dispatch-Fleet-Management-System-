// // src/Module/Dispatch/Pages/LiveTrackingPage.js
// import React, { useEffect, useState } from "react";
// import { FaTimes, FaMapMarkerAlt } from "react-icons/fa";
// import LiveTrackingService from "../Services/LiveTrackingService";
//
//
// function LiveTrackingPage() {
//     const [vehicles, setVehicles] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [selectedVehicleId, setSelectedVehicleId] = useState(null);
//
//     // Fetch data interval
//     useEffect(() => {
//         const fetchVehicles = async () => {
//             try {
//                 const res = await LiveTrackingService.getAll();
//                 setVehicles(Array.isArray(res) ? res : []);
//             } catch (err) {
//                 console.error("GPS Fetch Error:", err);
//             } finally {
//                 setLoading(false);
//             }
//         };
//
//         fetchVehicles();
//         const interval = setInterval(fetchVehicles, 10000);
//         return () => clearInterval(interval);
//     }, []);
//
//     // Get the latest data for the selected vehicle to keep the map live
//     const activeVehicle = vehicles.find(v => v.vehicleNumber === selectedVehicleId);
//
//     if (loading) return <div className="loader">Loading Live Fleet Data...</div>;
//
//     return (
//         <div style={{ padding: "30px", fontFamily: "Inter, sans-serif", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
//             <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
//                 <h2 style={{ color: "#1e293b", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
//                     <span style={{ width: "4px", height: "24px", background: "#16a34a", borderRadius: "4px" }}></span>
//                     Live Fleet Tracking
//                 </h2>
//                 <div style={{ fontSize: "14px", color: "#64748b" }}>
//                     Updating live every 10s • {vehicles.length} Vehicles Online
//                 </div>
//             </header>
//
//             <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", overflow: "hidden" }}>
//                 <table style={{ width: "100%", borderCollapse: "collapse" }}>
//                     <thead>
//                     <tr style={{ background: "#f1f5f9", color: "#475569", textTransform: "uppercase", fontSize: "12px", letterSpacing: "0.05em" }}>
//                         <th style={thStyle}>Vehicle</th>
//                         <th style={thStyle}>Driver</th>
//                         <th style={thStyle}>Coordinates</th>
//                         <th style={thStyle}>Status</th>
//                         <th style={thStyle}>Action</th>
//                     </tr>
//                     </thead>
//                     <tbody>
//                     {vehicles.map((v) => (
//                         <tr key={v.vehicleNumber} style={{ borderBottom: "1px solid #f1f5f9", transition: "0.2s" }}>
//                             <td style={tdStyle}><strong>{v.vehicleNumber}</strong></td>
//                             <td style={tdStyle}>{v.driverName}</td>
//                             <td style={tdStyle}><code style={{fontSize: "12px"}}>{v.lat?.toFixed(4)}, {v.lng?.toFixed(4)}</code></td>
//                             <td style={tdStyle}>
//                                 <span style={statusBadge(v.status)}>{v.status}</span>
//                             </td>
//                             <td style={tdStyle}>
//                                 <button
//                                     onClick={() => setSelectedVehicleId(v.vehicleNumber)}
//                                     className="view-btn"
//                                 >
//                                     <FaMapMarkerAlt /> View Map
//                                 </button>
//                             </td>
//                         </tr>
//                     ))}
//                     </tbody>
//                 </table>
//             </div>
//
//             {/* Professional Modal */}
//             {selectedVehicleId && (
//                 <div className="modal-overlay">
//                     <div className="modal-content">
//                         <div className="modal-header">
//                             <div>
//                                 <h3 style={{margin: 0}}>{activeVehicle?.vehicleNumber}</h3>
//                                 <small style={{color: "#64748b"}}>Live Tracking Active</small>
//                             </div>
//                             <button className="close-icon-btn" onClick={() => setSelectedVehicleId(null)}>
//                                 <FaTimes />
//                             </button>
//                         </div>
//                         <div className="map-container-wrapper">
//                             <LiveMap vehicle={activeVehicle} />
//                         </div>
//                     </div>
//                 </div>
//             )}
//
//             <style>{`
//                 .view-btn {
//                     display: flex; align-items: center; gap: 8px;
//                     background: #16a34a; color: white; border: none;
//                     padding: 8px 16px; border-radius: 6px; cursor: pointer;
//                     font-weight: 500; transition: all 0.2s;
//                 }
//                 .view-btn:hover { background: #15803d; transform: translateY(-1px); }
//
//                 .modal-overlay {
//                     position: fixed; top: 0; left: 0; width: 100%; height: 100%;
//                     background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(4px);
//                     display: flex; align-items: center; justify-content: center; z-index: 9999;
//                 }
//                 .modal-content {
//                     background: white; border-radius: 16px; width: 90%; max-width: 1000px;
//                     height: 80vh; display: flex; flex-direction: column; overflow: hidden;
//                     box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
//                 }
//                 .modal-header {
//                     padding: 15px 25px; display: flex; justify-content: space-between;
//                     align-items: center; border-bottom: 1px solid #e2e8f0;
//                 }
//                 .close-icon-btn {
//                     background: #fee2e2; color: #ef4444; border: none;
//                     width: 35px; height: 35px; border-radius: 50%; cursor: pointer;
//                     display: flex; align-items: center; justify-content: center; font-size: 18px;
//                 }
//                 .map-container-wrapper { flex-grow: 1; padding: 15px; background: #f8fafc; }
//             `}</style>
//         </div>
//     );
// }
//
// const statusBadge = (status) => ({
//     padding: "4px 10px",
//     borderRadius: "12px",
//     fontSize: "12px",
//     fontWeight: "600",
//     background: status === "Active" || status === "Moving" ? "#dcfce7" : "#fee2e2",
//     color: status === "Active" || status === "Moving" ? "#166534" : "#991b1b"
// });
//
// const thStyle = { padding: "16px 20px", textAlign: "left" };
// const tdStyle = { padding: "16px 20px", color: "#334155" };
//
// export default LiveTrackingPage;

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import Modal from "react-modal";
import "leaflet/dist/leaflet.css";

// Recenter helper
function RecenterMap({ lat, lng }) {
    const map = useMap();
    map.setView([lat, lng], 13); // recenter whenever lat/lng changes
    return null;
}

export default function MapViewModal({ vehicle, isOpen, onClose }) {
    if (!vehicle?.lat || !vehicle?.lng) return null;

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="Vehicle Map"
            style={{
                content: { maxWidth: "800px", margin: "auto", maxHeight: "90vh", overflow: "auto" },
            }}
        >
            <h3>
                Map - {vehicle.vehicleNumber} ({vehicle.id})
            </h3>
            <MapContainer
                center={[vehicle.lat, vehicle.lng]}
                zoom={13}
                style={{ height: "400px", width: "100%" }}
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[vehicle.lat, vehicle.lng]}>
                    <Popup>
                        {vehicle.vehicleNumber} - {vehicle.driverName}
                    </Popup>
                </Marker>
                <RecenterMap lat={vehicle.lat} lng={vehicle.lng} />
            </MapContainer>
            <button onClick={onClose} style={{ marginTop: 10 }}>
                Close Map
            </button>
        </Modal>
    );
}