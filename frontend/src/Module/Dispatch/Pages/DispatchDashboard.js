    import { useEffect, useState } from "react";
    import vehicleService from "../Services/vehicleService";
    import VehicleForm from "../Components/Vehicle/VehicleForm";
    import VehicleCard from "../Components/Vehicle/VehicleCard";
    import { FaTruck, FaPlus, FaArrowLeft, FaSearch, FaTimes } from "react-icons/fa";

    function DispatchDashboard() {
        const [vehicles, setVehicles] = useState([]);
        const [searchTerm, setSearchTerm] = useState("");
        const [mode, setMode] = useState("list");
        // "list" | "add"

        const user = JSON.parse(localStorage.getItem("user"));

        // Load vehicles
        const loadVehicles = async () => {
            try {
                const data = await vehicleService.getAll(user?.eCode);
                setVehicles(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Failed to load vehicles:", err);
                setVehicles([]);
            }
        };

        useEffect(() => {
            if (user?.eCode) loadVehicles();
        }, [user?.eCode]);

        // Search Filtering Logic
        const filteredVehicles = vehicles.filter((v) => {
            const searchLower = searchTerm.toLowerCase();
            return (
                v.vehicleNumber?.toLowerCase().includes(searchLower) ||
                v.driverName?.toLowerCase().includes(searchLower) ||
                v.model?.toLowerCase().includes(searchLower)
            );
        });

        return (
            <div style={styles.dashboardWrapper}>
                <div style={styles.container}>
                    {/* ================= LIST PAGE ================= */}
                    {mode === "list" && (
                        <>
                            <div style={styles.headerRow}>
                                <h2 style={styles.title}>
                                    <FaTruck style={{ marginRight: 10, color: '#22c55e' }} />
                                    Vehicle Management
                                </h2>
                                <div style={styles.actionGroup}>
                                    {/* Search Bar */}
                                    <div style={styles.searchBox}>
                                        <FaSearch style={styles.searchIcon} />
                                        <input
                                            type="text"
                                            placeholder="Search vehicle or driver..."
                                            style={styles.searchInput}
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        {searchTerm && (
                                            <FaTimes
                                                style={styles.clearIcon}
                                                onClick={() => setSearchTerm("")}
                                            />
                                        )}
                                    </div>
                                    <button style={btnGreen} onClick={() => setMode("add")}>
                                        <FaPlus style={{ marginRight: 8 }} /> Add Vehicle
                                    </button>
                                </div>
                            </div>

                            {/* Responsive Vehicle Grid */}
                            {vehicles.length === 0 ? (
                                <div style={styles.emptyState}>
                                    <p>No vehicles available in the fleet.</p>
                                </div>
                            ) : filteredVehicles.length === 0 ? (
                                <div style={styles.emptyState}>
                                    <p>No vehicles match your search "{searchTerm}".</p>
                                </div>
                            ) : (
                                <div style={styles.grid}>
                                    {filteredVehicles.map((v) => (
                                        <div className="vehicle-card-wrapper" key={v.id}>
                                            <VehicleCard vehicle={v} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* ================= ADD PAGE ================= */}
                    {mode === "add" && (
                        <div style={styles.formContainer}>
                            <button style={btnBack} onClick={() => setMode("list")}>
                                <FaArrowLeft style={{ marginRight: 8 }} /> Back to Fleet
                            </button>

                            <h2 style={styles.title}>Add New Vehicle</h2>

                            <div style={styles.cardForm}>
                                <VehicleForm
                                    reloadVehicles={() => {
                                        loadVehicles();
                                        setMode("list");
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <style>{`
                    * { box-sizing: border-box; }
                    .vehicle-card-wrapper {
                        transition: transform 0.3s ease, box-shadow 0.3s ease;
                    }
                    .vehicle-card-wrapper:hover {
                        transform: translateY(-5px);
                    }
                    input::placeholder { color: #94a3b8; }
                `}</style>
            </div>
        );
    }

    export default DispatchDashboard;

    /* ================= STYLES ================= */

    const styles = {
        dashboardWrapper: {
            backgroundColor: "#f8fafc",
            minHeight: "100vh",
            width: "100%",
            fontFamily: "sans-serif"
        },
        container: {
            padding: "30px",
            maxWidth: "1400px",
            margin: "0 auto"
        },
        headerRow: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "25px",
            flexWrap: "wrap",
            gap: "20px"
        },
        actionGroup: {
            display: "flex",
            alignItems: "center",
            gap: "15px",
            flexWrap: "wrap"
        },
        title: {
            fontSize: "24px",
            color: "#1e293b",
            margin: 0,
            display: "flex",
            alignItems: "center"
        },
        searchBox: {
            position: "relative",
            display: "flex",
            alignItems: "center",
            background: "#fff",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            padding: "0 12px",
            width: "300px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
        },
        searchIcon: {
            color: "#94a3b8",
            marginRight: "10px"
        },
        clearIcon: {
            color: "#94a3b8",
            cursor: "pointer",
            marginLeft: "10px"
        },
        searchInput: {
            border: "none",
            padding: "10px 0",
            outline: "none",
            width: "100%",
            fontSize: "14px",
            color: "#1e293b"
        },
        grid: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "25px",
            width: "100%"
        },
        emptyState: {
            textAlign: "center",
            padding: "60px 20px",
            background: "#fff",
            borderRadius: "15px",
            border: "1px solid #e2e8f0",
            color: "#64748b",
            fontSize: "16px"
        },
        formContainer: {
            maxWidth: "800px",
            margin: "0 auto"
        },
        cardForm: {
            background: "#fff",
            padding: "30px",
            borderRadius: "15px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
            marginTop: "20px"
        }
    };

    const btnGreen = {
        padding: "10px 20px",
        borderRadius: "8px",
        border: "none",
        background: "#22c55e",
        color: "#fff",
        cursor: "pointer",
        fontWeight: "bold",
        display: "flex",
        alignItems: "center",
        fontSize: "14px"
    };

    const btnBack = {
        marginBottom: 20,
        padding: "10px 20px",
        background: "#334155",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "bold",
        display: "flex",
        alignItems: "center",
        fontSize: "14px"
    };