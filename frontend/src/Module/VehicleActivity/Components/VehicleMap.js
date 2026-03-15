import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function VehicleMap({ activities }) {
    // Default Pune location
    let position = [18.5204, 73.8567];

    // Use latest GPS if available
    if (activities && activities.length > 0) {
        const last = activities[activities.length - 1];

        if (last.latitude && last.longitude) {
            position = [last.latitude, last.longitude];
        }
    }

    return (
        <div
            style={{
                marginTop: "30px",
                background: "white",
                padding: "20px",
                borderRadius: "8px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
        >
            <h3>Vehicle Live Map</h3>

            {/* ⭐ IMPORTANT: fixed height container */}
            <div style={{ height: "400px", width: "100%" }}>
                <MapContainer
                    center={position}
                    zoom={10}
                    style={{ height: "100%", width: "100%" }}
                >
                    <TileLayer
                        attribution="&copy; OpenStreetMap contributors"
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <Marker position={position}>
                        <Popup>Vehicle Current Location</Popup>
                    </Marker>
                </MapContainer>
            </div>
        </div>
    );
}

export default VehicleMap;
