
    import { useEffect, useState, useMemo } from "react";
    import axios from "axios";
    import {
        FaGasPump, FaTruck, FaChartLine, FaCalendarAlt, FaUserEdit,
        FaHashtag, FaFilter, FaDownload, FaTrophy, FaTachometerAlt,
        FaClipboardList, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaSearch, FaCrown
    } from "react-icons/fa";
    import {
        AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell
    } from 'recharts';

    function VehicleMonitoringPage() {
        const [vehicles, setVehicles] = useState([]);
        const [loading, setLoading] = useState(true);
        const [selectedVehicle, setSelectedVehicle] = useState(null);
        const [history, setHistory] = useState([]);
        const [monthFilter, setMonthFilter] = useState("");
        const [searchTerm, setSearchTerm] = useState("");

        /* ================= 1. INITIAL LOAD ================= */
        useEffect(() => {
            const loadVehiclesWithMileage = async () => {
                try {
                    const res = await axios.get("http://localhost:8080/api/vehicle-fuel/all-vehicles-monthly-mileage");
                    const vehiclesArray = Object.entries(res.data || {}).map(([vehicleNumber, monthlyMileage]) => ({
                        vehicleNumber,
                        monthlyMileage,
                    }));
                    vehiclesArray.forEach((v) => {
                        const mileages = Object.values(v.monthlyMileage);
                        v.totalAverage = mileages.length > 0 ? mileages.reduce((a, b) => a + b, 0) / mileages.length : null;
                    });
                    setVehicles(vehiclesArray);
                } catch (error) {
                    console.error("Error loading vehicle mileage:", error);
                    setVehicles([]);
                } finally {
                    setLoading(false);
                }
            };
            loadVehiclesWithMileage();
        }, []);

        /* ================= 2. DYNAMIC HISTORY LOAD ================= */
        const loadVehicleHistory = async (vehicleNumber) => {
            try {
                const res = await axios.get(`http://localhost:8080/api/vehicle-fuel/vehicle-history/${vehicleNumber}`);
                // FIX: Ensure history is sorted Newest to Oldest by date
                const sortedData = (res.data || []).sort((a, b) => new Date(b.updatedDate) - new Date(a.updatedDate));
                setHistory(sortedData);
                setSelectedVehicle(vehicleNumber);
                setMonthFilter("");
            } catch (error) {
                console.error("Error loading vehicle history:", error);
                setHistory([]);
            }
        };

        /* ================= 3. PERFORMANCE & CHART LOGIC ================= */
        const filteredHistory = useMemo(() => {
            return monthFilter && history.length > 0
                ? history.filter((h) => h.updatedDate && h.updatedDate.startsWith(monthFilter))
                : history;
        }, [history, monthFilter]);

        const mileageChartData = useMemo(() => {
            return [...filteredHistory].reverse().map(h => ({
                date: new Date(h.updatedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
                mileage: parseFloat(h.mileage?.toFixed(2) || 0)
            }));
        }, [filteredHistory]);

        // NEW: Monthly Fuel Spend Chart Data
        const fuelSpendData = useMemo(() => {
            const months = {};
            [...history].forEach(h => {
                const month = h.updatedDate.substring(0, 7); // YYYY-MM
                months[month] = (months[month] || 0) + (h.fuelAmount || 0);
            });
            return Object.entries(months).map(([name, total]) => ({ name, total })).reverse();
        }, [history]);

        // NEW: Vehicle Leaderboard (Top 3)
        const leaderboard = useMemo(() => {
            return [...vehicles]
                .filter(v => v.totalAverage > 0)
                .sort((a, b) => b.totalAverage - a.totalAverage)
                .slice(0, 3);
        }, [vehicles]);

        const performanceStats = useMemo(() => {
            if (history.length === 0) return null;

            const validMileages = history.map(h => h.mileage).filter(m => m != null && m > 0);
            const best = validMileages.length > 0 ? Math.max(...validMileages) : 0;

            // Use history[0] because it is sorted as newest
            const current = history[0]?.mileage || 0;
            const latestKm = history[0]?.kmReading || 0;

            const ratio = best > 0 ? (current / best) * 100 : 0;

            let status = { label: "Unknown", color: "#94a3b8", icon: <FaCheckCircle /> };
            if (ratio >= 90) status = { label: "Optimal", color: "#10b981", icon: <FaCheckCircle /> };
            else if (ratio >= 75) status = { label: "Stable", color: "#f59e0b", icon: <FaExclamationTriangle /> };
            else status = { label: "Critical Drop", color: "#ef4444", icon: <FaTimesCircle /> };

            return {
                best: best.toFixed(2),
                current: current.toFixed(2),
                latestKm: latestKm,
                ratio: ratio.toFixed(1),
                status
            };
        }, [history]);

        /* ================= 4. UTILITIES ================= */
        const downloadCSV = () => {
            if (filteredHistory.length === 0) return;
            const headers = ["S.No", "Km Reading", "Diesel Rate", "Fuel Amount", "Mileage", "Updated By", "Date"];
            const rows = filteredHistory.map((h, idx) => [
                idx + 1, h.kmReading, h.dieselRate, h.fuelAmount,
                h.mileage ? h.mileage.toFixed(2) : "N/A", h.updatedBy, h.updatedDate
            ]);
            let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `Performance_Log_${selectedVehicle}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        const avgFleetMileage = vehicles.length > 0
            ? vehicles.reduce((acc, curr) => acc + (curr.totalAverage || 0), 0) / vehicles.length : 0;

        return (
            <div style={styles.dashboardContainer}>
                {/* Header */}
                <div style={styles.header}>
                    <div>
                        <h1 style={styles.title}>Vehicle Performance Center</h1>
                        <p style={styles.subtitle}>Smart monitoring of fuel efficiency and mechanical health</p>
                    </div>
                    <div style={styles.fleetStatus}>
                        <div style={styles.statusCard}>
                            <FaTruck style={{ color: '#4f46e5' }} />
                            <span>{vehicles.length} Units</span>
                        </div>
                        <div style={styles.statusCard}>
                            <FaChartLine style={{ color: '#10b981' }} />
                            <span>{avgFleetMileage.toFixed(2)} Avg Fleet Km/L</span>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div style={styles.loader}><div className="spinner"></div><p>Syncing Data...</p></div>
                ) : (
                    <div style={styles.contentGrid}>
                        {/* Sidebar */}
                        <div style={styles.sidebar}>
                            {/* NEW: Leaderboard Section */}
                            <h3 style={styles.sectionTitle}><FaCrown color="#f59e0b" /> Top Performers</h3>
                            <div style={{marginBottom: '20px'}}>
                                {leaderboard.map((v, i) => (
                                    <div key={i} style={styles.leaderboardItem}>
                                        <span style={{fontSize: '10px', fontWeight: 'bold', color: '#94a3b8'}}>#{i+1}</span>
                                        <span style={{fontSize: '12px', fontWeight: '700'}}>{v.vehicleNumber}</span>
                                        <span style={{fontSize: '11px', color: '#10b981'}}>{v.totalAverage.toFixed(1)}</span>
                                    </div>
                                ))}
                            </div>

                            <h3 style={styles.sectionTitle}><FaHashtag /> Vehicle Roster</h3>
                            <div style={styles.searchBox}>
                                <FaSearch size={12} color="#cbd5e1" />
                                <input
                                    type="text"
                                    placeholder="Search vehicle..."
                                    style={styles.searchInput}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div style={styles.listContainer}>
                                {vehicles.filter(v => v.vehicleNumber.includes(searchTerm)).map((v) => (
                                    <div key={v.vehicleNumber} onClick={() => loadVehicleHistory(v.vehicleNumber)}
                                         style={{...styles.vehicleItem,
                                             borderLeft: selectedVehicle === v.vehicleNumber ? '4px solid #4f46e5' : '4px solid transparent',
                                             backgroundColor: selectedVehicle === v.vehicleNumber ? '#eff6ff' : '#fff'
                                         }}
                                    >
                                        <div style={styles.vehicleInfo}>
                                            <span style={styles.vNum}>{v.vehicleNumber}</span>
                                            <span style={styles.vMileage}>{v.totalAverage ? `${v.totalAverage.toFixed(2)} km/l` : "N/A"}</span>
                                        </div>
                                        <FaChartLine style={{ color: selectedVehicle === v.vehicleNumber ? '#4f46e5' : '#cbd5e1' }} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div style={styles.mainContent}>
                            {selectedVehicle && performanceStats ? (
                                <>
                                    {/* INDICATOR ROW */}
                                    <div style={{...styles.statusBanner, borderColor: performanceStats.status.color}}>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                                            <span style={{color: performanceStats.status.color, fontSize: '24px'}}>{performanceStats.status.icon}</span>
                                            <div>
                                                <h4 style={{margin: 0, fontSize: '18px', color: '#1e293b'}}>Health Status: {performanceStats.status.label}</h4>
                                                <p style={{margin: 0, fontSize: '12px', color: '#64748b'}}>Running at <strong>{performanceStats.ratio}%</strong> of peak efficiency</p>
                                            </div>
                                        </div>
                                        <div style={styles.efficiencyMeterContainer}>
                                            <div style={{...styles.efficiencyMeterBar, width: `${performanceStats.ratio}%`, background: performanceStats.status.color}}></div>
                                        </div>
                                    </div>

                                    {/* Metrics Row */}
                                    <div style={styles.metricsRow}>
                                        <div style={styles.metricCard}>
                                            <div style={{...styles.metricIcon, color: '#f59e0b', background: '#fffbeb'}}><FaTrophy /></div>
                                            <div><p style={styles.metricLabel}>Best Ever</p><h4 style={styles.metricValue}>{performanceStats.best} <small>km/l</small></h4></div>
                                        </div>
                                        <div style={styles.metricCard}>
                                            <div style={{...styles.metricIcon, color: '#10b981', background: '#ecfdf5'}}><FaGasPump /></div>
                                            <div><p style={styles.metricLabel}>Current</p><h4 style={styles.metricValue}>{performanceStats.current} <small>km/l</small></h4></div>
                                        </div>
                                        <div style={styles.metricCard}>
                                            <div style={{...styles.metricIcon, color: '#6366f1', background: '#eef2ff'}}><FaTachometerAlt /></div>
                                            <div><p style={styles.metricLabel}>Odometer</p><h4 style={styles.metricValue}>{performanceStats.latestKm} <small>km</small></h4></div>
                                        </div>
                                    </div>

                                    {/* Grid for Two Charts */}
                                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                                        {/* Mileage Trend Chart */}
                                        <div style={styles.chartCard}>
                                            <h3 style={styles.sectionTitle}><FaChartLine color="#4f46e5"/> Efficiency Trend</h3>
                                            <div style={{ width: '100%', height: 200, marginTop: '15px' }}>
                                                <ResponsiveContainer>
                                                    <AreaChart data={mileageChartData}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                        <XAxis dataKey="date" fontSize={10} tickLine={false} axisLine={false} />
                                                        <YAxis fontSize={10} tickLine={false} axisLine={false} />
                                                        <Tooltip />
                                                        <Area type="monotone" dataKey="mileage" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.1} />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        {/* Monthly Fuel Spend Chart */}
                                        <div style={styles.chartCard}>
                                            <h3 style={styles.sectionTitle}><FaGasPump color="#6366f1"/> Fuel Spending (₹)</h3>
                                            <div style={{ width: '100%', height: 200, marginTop: '15px' }}>
                                                <ResponsiveContainer>
                                                    <BarChart data={fuelSpendData}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                        <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                                                        <YAxis fontSize={10} tickLine={false} axisLine={false} />
                                                        <Tooltip cursor={{fill: '#f8fafc'}} />
                                                        <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Table Section */}
                                    <div style={styles.card}>
                                        <div style={styles.cardHeader}>
                                            <h3 style={{margin:0, fontSize: '16px'}}>Fuel Log History</h3>
                                            <div style={{display: 'flex', gap: '10px'}}>
                                                <div style={styles.filterGroup}>
                                                    <FaFilter color="#94a3b8" /><input type="month" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} style={styles.dateInput} />
                                                </div>
                                                <button onClick={downloadCSV} style={styles.downloadBtn}><FaDownload /> Export</button>
                                            </div>
                                        </div>
                                        <div style={styles.tableWrapper}>
                                            <table style={styles.table}>
                                                <thead><tr><th>S.No</th><th>KM Reading</th><th>Fuel Amount</th><th>Mileage</th><th>Updated By</th><th>Date</th></tr></thead>
                                                <tbody>
                                                {filteredHistory.map((h, idx) => (
                                                    <tr key={idx} style={idx % 2 === 0 ? {} : styles.altRow}>
                                                        <td style={{color: '#94a3b8'}}>{idx + 1}</td>
                                                        <td style={{fontWeight: '700'}}>{h.kmReading}</td>
                                                        <td>₹{h.fuelAmount}</td>
                                                        <td><span style={{...styles.mileageBadge,
                                                            backgroundColor: (h.mileage / performanceStats.best) >= 0.9 ? '#f0fdf4' : (h.mileage / performanceStats.best) >= 0.75 ? '#fffbeb' : '#fef2f2',
                                                            color: (h.mileage / performanceStats.best) >= 0.9 ? '#166534' : (h.mileage / performanceStats.best) >= 0.75 ? '#92400e' : '#991b1b'
                                                        }}>
                                                                {h.mileage ? `${h.mileage.toFixed(2)} km/l` : "N/A"}
                                                            </span></td>
                                                        <td><div style={styles.userColumn}><FaUserEdit /> {h.updatedBy}</div></td>
                                                        <td style={styles.dateCol}>{h.updatedDate}</td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div style={styles.placeholderCard}>
                                    <FaTruck size={50} color="#cbd5e1" style={{marginBottom: '20px'}} />
                                    <h3>No Vehicle Selected</h3>
                                    <p>Select a vehicle from the roster to view mechanical health and efficiency analytics.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                <style>{`.spinner { border: 3px solid #f3f3f3; border-top: 3px solid #4f46e5; border-radius: 50%; width: 24px; height: 24px; animation: spin 1s linear infinite; margin-bottom: 10px; } @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } th { padding: 16px; font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; background: #f8fafc; border-bottom: 2px solid #f1f5f9; text-align: left; } td { padding: 16px; border-bottom: 1px solid #f1f5f9; color: #334155; font-size: 13.5px; } tr:hover td { background-color: #f8fafc; }`}</style>
            </div>
        );
    }

    const styles = {
        dashboardContainer: { padding: '30px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
        title: { fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: 0 },
        subtitle: { color: '#64748b', fontSize: '13px', marginTop: '4px' },
        fleetStatus: { display: 'flex', gap: '10px' },
        statusCard: { backgroundColor: '#fff', padding: '10px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', fontWeight: '700', color: '#475569', fontSize: '12px', border: '1px solid #f1f5f9' },
        contentGrid: { display: 'grid', gridTemplateColumns: '260px 1fr', gap: '30px' },
        sidebar: { backgroundColor: '#fff', borderRadius: '20px', padding: '20px', boxShadow: '0 4px 15px -3px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', maxHeight: '85vh', overflowY: 'auto' },
        sectionTitle: { fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: '15px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' },
        searchBox: { display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '8px 12px', borderRadius: '10px', marginBottom: '15px', border: '1px solid #f1f5f9' },
        searchInput: { border: 'none', background: 'transparent', outline: 'none', fontSize: '12px', color: '#1e293b', width: '100%' },
        leaderboardItem: { display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' },
        listContainer: { display: 'flex', flexDirection: 'column', gap: '8px' },
        vehicleItem: { padding: '12px', borderRadius: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: '0.2s ease' },
        vehicleInfo: { display: 'flex', flexDirection: 'column' },
        vNum: { fontWeight: '800', color: '#1e293b', fontSize: '13px' },
        vMileage: { fontSize: '11px', color: '#64748b' },
        mainContent: { display: 'flex', flexDirection: 'column', gap: '20px' },
        statusBanner: { background: '#fff', padding: '20px', borderRadius: '20px', borderLeft: '6px solid', boxShadow: '0 4px 15px -3px rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
        efficiencyMeterContainer: { width: '200px', height: '8px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' },
        efficiencyMeterBar: { height: '100%', borderRadius: '10px', transition: 'width 1s ease' },
        metricsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
        metricCard: { background: '#fff', padding: '18px', borderRadius: '20px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '15px' },
        metricIcon: { width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' },
        metricLabel: { margin: 0, fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' },
        metricValue: { margin: 0, fontSize: '18px', color: '#1e293b', fontWeight: '900' },
        chartCard: { backgroundColor: '#fff', borderRadius: '20px', padding: '20px', boxShadow: '0 4px 15px -3px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' },
        card: { backgroundColor: '#fff', borderRadius: '20px', boxShadow: '0 4px 15px -3px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', overflow: 'hidden' },
        cardHeader: { padding: '15px 25px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
        filterGroup: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f8fafc', padding: '6px 12px', borderRadius: '10px', border: '1px solid #e2e8f0' },
        dateInput: { border: 'none', backgroundColor: 'transparent', color: '#475569', fontSize: '12px', fontWeight: '700', outline: 'none' },
        downloadBtn: { backgroundColor: '#0f172a', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' },
        tableWrapper: { overflowX: 'auto' },
        table: { width: '100%', borderCollapse: 'collapse' },
        altRow: { backgroundColor: '#fafafa' },
        mileageBadge: { padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '800' },
        userColumn: { display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '12px' },
        dateCol: { fontSize: '12px', color: '#94a3b8' },
        placeholderCard: { backgroundColor: '#fff', borderRadius: '20px', border: '2px dashed #e2e8f0', padding: '100px 20px', textAlign: 'center', color: '#94a3b8' },
        loader: { textAlign: 'center', padding: '100px', color: '#64748b' }
    };

    export default VehicleMonitoringPage;



