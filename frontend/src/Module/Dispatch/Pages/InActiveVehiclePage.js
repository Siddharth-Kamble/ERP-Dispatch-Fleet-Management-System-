import { useEffect, useState } from "react";
import axios from "axios";

function InactiveVehiclePage() {

    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {

        const loadVehicles = async () => {

            try {

                const res = await axios.get(
                    `${process.env.REACT_APP_API_URL}/api/trips/inactive-vehicles`
                );

                console.log("Inactive Vehicles:", res.data);

                if (Array.isArray(res.data)) {
                    setVehicles(res.data);
                } else {
                    setVehicles([]);
                }

            } catch (err) {

                console.error("Error fetching inactive vehicles:", err);

                setError("Failed to load inactive vehicles");

            } finally {

                setLoading(false);

            }
        };

        loadVehicles();

    }, []);

    return (

        <div style={styles.container}>

            {/* Header Section */}

            <div style={styles.header}>

                <div>

                    <h2 style={styles.title}>Inactive Fleet</h2>

                    <p style={styles.subtitle}>
                        List of vehicles currently not assigned to any active trips.
                    </p>

                </div>

                <div style={styles.badge}>
                    {vehicles.length} Units Found
                </div>

            </div>

            {/* Error State */}

            {error && (

                <div style={styles.errorCard}>

                    <span style={{ fontSize: '20px' }}>⚠️</span>

                    <p>{error}</p>

                </div>

            )}

            {/* Loading State */}

            {loading && (

                <div style={styles.loadingContainer}>

                    <div className="spinner" style={styles.spinner}></div>

                    <p style={{ color: '#64748b', marginTop: '10px' }}>
                        Syncing fleet data...
                    </p>

                </div>

            )}

            {/* Empty State */}

            {!loading && !error && vehicles.length === 0 && (

                <div style={styles.emptyState}>

                    <div style={styles.emptyIcon}>🚗</div>

                    <h3 style={{ color: '#1e293b', marginBottom: '8px' }}>
                        All Clear!
                    </h3>

                    <p style={{ color: '#64748b' }}>
                        Every vehicle is currently on the move or active.
                    </p>

                </div>

            )}

            {/* Vehicle Grid */}

            {!loading && vehicles.length > 0 && (

                <div style={styles.grid}>

                    {vehicles.map((vehicle, index) => (

                        <div key={index} style={styles.card}>

                            <div style={styles.cardHeader}>

                                <div style={styles.iconCircle}>🚙</div>

                                <span style={styles.statusDot}></span>

                            </div>

                            <div style={styles.cardBody}>

                                <label style={styles.label}>
                                    Vehicle Number
                                </label>

                                <div style={styles.vehicleId}>
                                    {vehicle}
                                </div>

                            </div>

                            <div style={styles.cardFooter}>

                                <span style={styles.inactiveTag}>
                                    Currently Inactive
                                </span>

                            </div>

                        </div>

                    ))}

                </div>

            )}

            <style>{`

                @keyframes spin {

                    0% { transform: rotate(0deg); }

                    100% { transform: rotate(360deg); }

                }

                .spinner {

                    width: 40px;
                    height: 40px;

                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #3b82f6;

                    border-radius: 50%;

                    animation: spin 1s linear infinite;

                }

            `}</style>

        </div>

    );

}

// ================= STYLES =================

const styles = {

    container: {
        padding: '40px 20px',
        maxWidth: '1200px',
        margin: '0 auto',
        fontFamily: "'Inter', system-ui, sans-serif",
        backgroundColor: '#f8fafc',
        minHeight: '100vh'
    },

    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '20px'
    },

    title: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#0f172a',
        margin: 0
    },

    subtitle: {
        color: '#64748b',
        marginTop: '4px'
    },

    badge: {
        backgroundColor: '#f1f5f9',
        color: '#475569',
        padding: '8px 16px',
        borderRadius: '20px',
        fontWeight: '600',
        fontSize: '14px',
        border: '1px solid #e2e8f0'
    },

    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '24px'
    },

    card: {
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
        border: '1px solid #f1f5f9',
        display: 'flex',
        flexDirection: 'column'
    },

    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '16px'
    },

    iconCircle: {
        width: '40px',
        height: '40px',
        backgroundColor: '#eff6ff',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px'
    },

    statusDot: {
        width: '10px',
        height: '10px',
        backgroundColor: '#cbd5e1',
        borderRadius: '50%',
        marginTop: '5px'
    },

    label: {
        fontSize: '12px',
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        fontWeight: '600'
    },

    vehicleId: {
        fontSize: '20px',
        fontWeight: '700',
        color: '#1e293b',
        marginTop: '4px'
    },

    cardFooter: {
        marginTop: '20px',
        paddingTop: '12px',
        borderTop: '1px solid #f1f5f9'
    },

    inactiveTag: {
        fontSize: '12px',
        color: '#64748b',
        backgroundColor: '#f8fafc',
        padding: '4px 8px',
        borderRadius: '4px'
    },

    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '100px 0'
    },

    errorCard: {
        backgroundColor: '#fef2f2',
        color: '#dc2626',
        padding: '16px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        border: '1px solid #fee2e2',
        marginBottom: '20px'
    },

    emptyState: {
        textAlign: 'center',
        padding: '80px 20px',
        backgroundColor: '#fff',
        borderRadius: '24px',
        border: '2px dashed #e2e8f0'
    },

    emptyIcon: {
        fontSize: '48px',
        marginBottom: '16px',
        opacity: 0.5
    }

};

export default InactiveVehiclePage;