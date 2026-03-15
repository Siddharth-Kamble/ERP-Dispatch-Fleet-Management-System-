import React from "react";

const VehicleCard = ({ vehicle, onSelect, onTrackActivities }) => {

    const handleSelect = (e) => {
        e.stopPropagation();
        if (onSelect) onSelect(vehicle);
    };

    const handleTrackActivities = (e) => {
        e.stopPropagation();
        if (onTrackActivities) onTrackActivities(vehicle);
    };

    return (
        <div style={styles.card} className="vehicle-card">

            {/* Header */}
            <div style={styles.header}>

                <h3 style={styles.title}> <b>Vehicle Number:</b>{" "}{vehicle.vehicleNumber}</h3>

                <span style={styles.typeBadge}>
                    {vehicle.type || "N/A"}
                </span>
            </div>

            {/* Details */}
            <div style={styles.info}>
                <p>
                    <b>Driver Name:</b>{" "}
                    {vehicle?.driver?.name || "Not Assigned"}
                </p>


            </div>


        </div>
    );
};

export default VehicleCard;


/* ================= STYLES ================= */

const styles = {
    card: {
        borderRadius: 14,
        padding: 20,
        marginBottom: 18,
        background: "#ffffff",
        boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
        transition: "all 0.2s ease",
        cursor: "pointer",
    },

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },

    title: {
        margin: 0,
        color: "#111827",
        fontSize: "18px",
        fontWeight: "600",
    },

    typeBadge: {
        background: "#e0f2fe",
        color: "#0369a1",
        padding: "4px 10px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: "600",
    },

    info: {
        fontSize: "14px",
        color: "#374151",
        lineHeight: "1.6",
    },

    btnRow: {
        marginTop: 14,
        display: "flex",
        gap: 10,
    },

    btnGreen: {
        padding: "8px 16px",
        border: "none",
        borderRadius: 8,
        background: "#22c55e",
        color: "#fff",
        cursor: "pointer",
        fontWeight: "500",
    },

    btnOrange: {
        padding: "8px 16px",
        border: "none",
        borderRadius: 8,
        background: "#f59e0b",
        color: "#fff",
        cursor: "pointer",
        fontWeight: "500",
    },
};
