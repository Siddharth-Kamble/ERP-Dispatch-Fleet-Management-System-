import { useEffect, useState } from "react";
import axios from "axios";

function ActiveTripPage() {

    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {

        const loadVehicles = async () => {

            try {

                const res = await axios.get(
                    `${process.env.REACT_APP_API_URL}/api/trips/active-vehicles`
                );


if (Array.isArray(res.data)) {

    const uniqueVehicles = [...new Set(
        res.data
            .filter(v => v !== null)
            .map(v => v.trim().toUpperCase())
    )];

    setVehicles(uniqueVehicles);

} else {
    setVehicles([]);
}

            } catch (err) {

                console.error("Error fetching active vehicles:", err);

                setError("Failed to load active vehicles");

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
                    <h2 style={styles.title}>Live Fleet Status</h2>

                    <p style={styles.subtitle}>
                        Real-time monitoring of vehicles currently on active trips.
                    </p>
                </div>

              {!loading && (
                  <div style={styles.activeBadge}>
                      <span style={styles.pulseDot}></span>
                      {vehicles.length} Active Now
                  </div>
              )}

            </div>

            {/* Error Message */}

            {error && (

                <div style={styles.errorBanner}>
                    <span>🚫</span> {error}
                </div>

            )}

            {/* Loading State */}

            {loading && (

                <div style={styles.loaderContainer}>

                    <div className="spinner" style={styles.spinner}></div>

                    <p style={{ color: '#64748b', marginTop: '12px', fontWeight: '500' }}>
                        Fetching live data...
                    </p>

                </div>

            )}

            {/* Empty State */}

            {!loading && !error && vehicles.length === 0 && (

                <div style={styles.emptyCard}>

                    <div style={{ fontSize: '50px', marginBottom: '15px' }}>📍</div>

                    <h3 style={{ color: '#1e293b', margin: '0 0 10px 0' }}>
                        No Active Trips
                    </h3>

                    <p style={{ color: '#94a3b8', margin: 0 }}>
                        All vehicles are currently stationed at the depot.
                    </p>

                </div>

            )}

            {/* Vehicle Grid */}

            {!loading && vehicles.length > 0 && (

                <div style={styles.grid}>

                    {vehicles.map((vehicle, index) => (

                        <div key={index} style={styles.card}>

                            <div style={styles.cardTop}>

                                <div style={styles.iconBox}>🚚</div>

                                <div style={styles.liveTag}>LIVE</div>

                            </div>

                            <div style={styles.cardContent}>

                                <span style={styles.label}>Registry Number</span>

                                <div style={styles.vehicleID}>{vehicle}</div>

                            </div>

                            {/* Moving animation */}

                            <div style={styles.movementBar}>
                                <div className="progress" style={styles.progressBar}></div>
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

                @keyframes pulse {

                    0% {
                        transform: scale(0.95);
                        box-shadow: 0 0 0 0 rgba(34,197,94,0.7);
                    }

                    70% {
                        transform: scale(1);
                        box-shadow: 0 0 0 10px rgba(34,197,94,0);
                    }

                    100% {
                        transform: scale(0.95);
                        box-shadow: 0 0 0 0 rgba(34,197,94,0);
                    }

                }

                @keyframes shimmer {

                    0% { transform: translateX(-100%); }

                    100% { transform: translateX(100%); }

                }

                .spinner {

                    width: 35px;
                    height: 35px;

                    border: 3px solid #e2e8f0;
                    border-top: 3px solid #10b981;

                    border-radius: 50%;

                    animation: spin 0.8s linear infinite;

                }

                .progress {

                    width: 40%;
                    height: 100%;

                    background: linear-gradient(
                        90deg,
                        transparent,
                        #10b981,
                        transparent
                    );

                    animation: shimmer 1.5s infinite linear;

                }

            `}</style>

        </div>

    );

}

const styles = {

    container: {
        padding: '40px 24px',
        maxWidth: '1200px',
        margin: '0 auto',
        fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
        backgroundColor: '#fcfcfd',
        minHeight: '100vh'
    },

    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '40px'
    },

    title: {
        fontSize: '32px',
        fontWeight: '800',
        color: '#111827',
        letterSpacing: '-0.025em',
        margin: 0
    },

    subtitle: {
        color: '#6b7280',
        marginTop: '6px',
        fontSize: '16px'
    },

    activeBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        backgroundColor: '#ecfdf5',
        color: '#065f46',
        padding: '10px 20px',
        borderRadius: '12px',
        fontWeight: '700',
        fontSize: '14px',
        border: '1px solid #d1fae5'
    },

    pulseDot: {
        width: '8px',
        height: '8px',
        backgroundColor: '#10b981',
        borderRadius: '50%',
        animation: 'pulse 2s infinite'
    },

    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '24px'
    },

    card: {
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        padding: '24px',
        border: '1px solid #f1f5f9',
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)'
    },

    cardTop: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
    },

    iconBox: {
        width: '48px',
        height: '48px',
        backgroundColor: '#f0fdf4',
        borderRadius: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px'
    },

    liveTag: {
        fontSize: '10px',
        fontWeight: '800',
        color: '#10b981',
        backgroundColor: '#d1fae5',
        padding: '4px 10px',
        borderRadius: '6px',
        letterSpacing: '0.05em'
    },

    label: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#94a3b8',
        textTransform: 'uppercase'
    },

    vehicleID: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1e293b',
        marginTop: '4px'
    },

    movementBar: {
        marginTop: '20px',
        height: '3px',
        backgroundColor: '#f1f5f9',
        borderRadius: '2px',
        overflow: 'hidden'
    },

    loaderContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: '100px'
    },

    errorBanner: {
        backgroundColor: '#fef2f2',
        color: '#991b1b',
        padding: '16px',
        borderRadius: '12px',
        marginBottom: '24px',
        border: '1px solid #fee2e2',
        fontWeight: '500'
    },

    emptyCard: {
        textAlign: 'center',
        padding: '100px 24px',
        backgroundColor: '#fff',
        borderRadius: '24px',
        border: '2px dashed #e2e8f0'
    }

};

export default ActiveTripPage;