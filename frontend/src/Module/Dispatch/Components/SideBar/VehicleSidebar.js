function VehicleSidebar({ vehicles, onSelect, selectedId }) {
    return (
        <>
            <h3 style={{ color: "#fff" }}>🚛 Vehicles</h3>

            {vehicles.map((v) => (
                <div
                    key={v.id}
                    onClick={() => onSelect(v)}
                    style={{
                        padding: "10px",
                        marginBottom: "10px",
                        background: selectedId === v.id ? "#10b981" : "#334155",
                        cursor: "pointer",
                        borderRadius: "6px",
                        color: "#fff",
                    }}
                >
                    {v.vehicleNumber}
                </div>
            ))}
        </>
    );
}

export default VehicleSidebar;
