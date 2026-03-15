//
//import { useEffect, useState, useMemo, useCallback, useRef } from "react";
//import { useNavigate } from "react-router-dom";
//import axios from "axios";
//
//function ViewRoutes() {
//
//    const navigate = useNavigate();
//    const API = process.env.REACT_APP_API_URL;
//
//    const [trips, setTrips] = useState([]);
//    const [loading, setLoading] = useState(true);
//    const [refreshing, setRefreshing] = useState(false);
//
//    const [searchQuery, setSearchQuery] = useState("");
//    const [startDate, setStartDate] = useState("");
//    const [endDate, setEndDate] = useState("");
//
//    const [autoRefresh, setAutoRefresh] = useState(false);
//
//    const timerRef = useRef(null);
//
//    /* ================= FETCH TRIPS ================= */
//
//    const fetchTrips = useCallback(async (manual = false) => {
//
//        try {
//
//            manual ? setRefreshing(true) : setLoading(true);
//
//            const res = await axios.get(`${API}/api/trips`);
//
//            const sorted = (res.data || [])
//                .sort((a, b) => (b.id || 0) - (a.id || 0));
//
//            setTrips(sorted);
//
//        } catch (err) {
//
//            console.error("Trip fetch error:", err);
//
//        } finally {
//
//            setLoading(false);
//            setRefreshing(false);
//        }
//
//    }, [API]);
//
//    /* ================= INITIAL LOAD ================= */
//
//    useEffect(() => {
//        fetchTrips();
//    }, [fetchTrips]);
//
//    /* ================= AUTO REFRESH ================= */
//
//    useEffect(() => {
//
//        if (autoRefresh) {
//
//            timerRef.current = setInterval(() => {
//                fetchTrips(true);
//            }, 60000);
//
//        } else {
//
//            clearInterval(timerRef.current);
//        }
//
//        return () => clearInterval(timerRef.current);
//
//    }, [autoRefresh, fetchTrips]);
//
//    /* ================= FILTER TRIPS ================= */
//
//    const filteredTrips = useMemo(() => {
//
//        const query = searchQuery.toLowerCase();
//
//        return trips.filter((trip) => {
//
//            const tripDate = trip.tripDate
//                ? new Date(trip.tripDate).getTime()
//                : 0;
//
//            const start = startDate ? new Date(startDate).getTime() : null;
//            const end = endDate ? new Date(endDate).getTime() : null;
//
//            const matchesSearch =
//                trip.driverName?.toLowerCase().includes(query) ||
//                trip.vehicleNumber?.toLowerCase().includes(query) ||
//                String(trip.id).includes(query);
//
//            const matchesDate =
//                (!start || tripDate >= start) &&
//                (!end || tripDate <= end);
//
//            return matchesSearch && matchesDate;
//
//        });
//
//    }, [trips, searchQuery, startDate, endDate]);
//
//    /* ================= STATS ================= */
//
//    const stats = useMemo(() => {
//
//        const completed = filteredTrips.filter(
//            t => t.status === "RETURN_JOURNEY_COMPLETED"
//        ).length;
//
//        return {
//            total: filteredTrips.length,
//            active: filteredTrips.length - completed,
//            completed
//        };
//
//    }, [filteredTrips]);
//
//    /* ================= NAVIGATION ================= */
//
//    const handleViewHistory = (tripId) => {
//        navigate(`/dispatch-dashboard/routes/history/${tripId}`);
//    };
//
//    /* ================= UI ================= */
//
//    return (
//
//        <div style={styles.container}>
//
//            {/* HEADER */}
//
//            <div className="no-print">
//
//                <div style={styles.header}>
//
//                    <div>
//
//                        <h2 style={styles.title}>Fleet Logistics</h2>
//
//                        <p style={styles.subtitle}>
//                            {autoRefresh
//                                ? "🌐 Live Syncing Active"
//                                : "Operational movement history"}
//                        </p>
//
//                    </div>
//
//                    {/* STATS */}
//
//                    <div style={styles.summaryContainer}>
//
//                        <StatCard label="Total Trips" value={stats.total} />
//
//                        <StatCard
//                            label="In Progress"
//                            value={stats.active}
//                            color="#10b981"
//                        />
//
//                        <StatCard
//                            label="Completed"
//                            value={stats.completed}
//                            color="#3b82f6"
//                        />
//
//                    </div>
//
//                </div>
//
//                {/* FILTER BAR */}
//
//                <div style={styles.filterBar}>
//
//                    <div style={styles.dateGroup}>
//
//                        <DateInput
//                            label="From"
//                            value={startDate}
//                            onChange={setStartDate}
//                        />
//
//                        <DateInput
//                            label="To"
//                            value={endDate}
//                            onChange={setEndDate}
//                        />
//
//                    </div>
//
//                    <div style={styles.actionGroup}>
//
//                        {/* LIVE MODE */}
//
//                        <div
//                            style={styles.toggleWrapper}
//                            onClick={() => setAutoRefresh(!autoRefresh)}
//                        >
//
//                            <div
//                                style={{
//                                    ...styles.toggleTrack,
//                                    backgroundColor: autoRefresh
//                                        ? "#10b981"
//                                        : "#cbd5e1"
//                                }}
//                            >
//
//                                <div
//                                    style={{
//                                        ...styles.toggleThumb,
//                                        transform: autoRefresh
//                                            ? "translateX(20px)"
//                                            : "translateX(0px)"
//                                    }}
//                                />
//
//                            </div>
//
//                            <span style={styles.toggleLabel}>
//                                Live Mode
//                            </span>
//
//                        </div>
//
//                        {/* SEARCH */}
//
//                        <div style={styles.searchWrapper}>
//
//                            <span style={styles.searchIcon}>🔍</span>
//
//                            <input
//                                type="text"
//                                placeholder="Search trips..."
//                                value={searchQuery}
//                                onChange={(e) =>
//                                    setSearchQuery(e.target.value)
//                                }
//                                style={styles.searchInput}
//                            />
//
//                        </div>
//
//                        {/* REFRESH */}
//
//                        <button
//                            onClick={() => fetchTrips(true)}
//                            style={styles.refreshBtn}
//                            disabled={refreshing || loading}
//                        >
//                            🔄
//                        </button>
//
//                        {/* PRINT */}
//
//                        <button
//                            onClick={() => window.print()}
//                            style={styles.printBtn}
//                        >
//                            Report
//                        </button>
//
//                    </div>
//
//                </div>
//
//            </div>
//
//            {/* TABLE */}
//
//            {loading ? (
//
//                <div style={styles.loaderContainer}>
//                    Loading trips...
//                </div>
//
//            ) : (
//
//                <div style={styles.tableWrapper}>
//
//                    <table style={styles.table}>
//
//                        <thead>
//
//                        <tr>
//                            <th style={styles.th}>Trip ID</th>
//                            <th style={styles.th}>Vehicle</th>
//                            <th style={styles.th}>Driver</th>
//                            <th style={styles.th}>Status</th>
//                            <th style={styles.th}>Trip Date</th>
//                            <th
//                                style={{ ...styles.th, textAlign: "right" }}
//                                className="no-print"
//                            >
//                                Action
//                            </th>
//                        </tr>
//
//                        </thead>
//
//                        <tbody>
//
//                        {filteredTrips.map((trip) => {
//
//                            const isCompleted =
//                                trip.status === "RETURN_JOURNEY_COMPLETED";
//
//                            const isNew =
//                                new Date() -
//                                new Date(trip.tripDate || 0) <
//                                300000;
//
//                            return (
//
//                                <tr key={trip.id} style={styles.tr}>
//
//                                    <td style={styles.td}>
//                                        #{trip.id}
//                                        {isNew && (
//                                            <span style={styles.newBadge}>
//                                                NEW
//                                            </span>
//                                        )}
//                                    </td>
//
//                                    <td style={styles.td}>
//                                        {trip.vehicleNumber}
//                                    </td>
//
//                                    <td style={styles.td}>
//                                        {trip.driverName}
//                                    </td>
//
//                                    <td style={styles.td}>
//                                        <span
//                                            style={{
//                                                ...styles.statusBadge,
//                                                backgroundColor: isCompleted
//                                                    ? "#f1f5f9"
//                                                    : "#dcfce7",
//                                                color: isCompleted
//                                                    ? "#475569"
//                                                    : "#166534"
//                                            }}
//                                        >
//                                            {isCompleted
//                                                ? "Completed"
//                                                : "Active"}
//                                        </span>
//                                    </td>
//
//                                    <td style={styles.td}>
//                                        {trip.tripDate
//                                            ? new Date(
//                                                  trip.tripDate
//                                              ).toLocaleDateString()
//                                            : "-"}
//                                    </td>
//
//                                    <td
//                                        style={{
//                                            ...styles.td,
//                                            textAlign: "right"
//                                        }}
//                                        className="no-print"
//                                    >
//
//                                        <button
//                                            style={styles.viewBtn}
//                                            onClick={() =>
//                                                handleViewHistory(trip.id)
//                                            }
//                                        >
//                                            View
//                                        </button>
//
//                                    </td>
//
//                                </tr>
//
//                            );
//
//                        })}
//
//                        </tbody>
//
//                    </table>
//
//                </div>
//
//            )}
//
//        </div>
//    );
//}
//
///* ================= Small Components ================= */
//
//function StatCard({ label, value, color }) {
//
//    return (
//        <div
//            style={{
//                ...styles.statCard,
//                borderTop: color ? `4px solid ${color}` : ""
//            }}
//        >
//            <span style={styles.statLabel}>{label}</span>
//            <span style={{ ...styles.statValue, color }}>
//                {value}
//            </span>
//        </div>
//    );
//}
//
//function DateInput({ label, value, onChange }) {
//
//    return (
//        <div style={styles.inputWrapper}>
//
//            <label style={styles.inputLabel}>{label}</label>
//
//            <input
//                type="date"
//                value={value}
//                onChange={(e) => onChange(e.target.value)}
//                style={styles.dateInput}
//            />
//
//        </div>
//    );
//}
//
///* ================= Styles ================= */
//
//const styles = {
//    container: {
//        padding: "40px",
//        background: "#f8fafc",
//        minHeight: "100vh"
//    },
//    header: {
//        display: "flex",
//        justifyContent: "space-between",
//        marginBottom: "25px"
//    },
//    title: {
//        fontSize: "28px",
//        fontWeight: "800"
//    },
//    subtitle: {
//        color: "#64748b"
//    },
//    summaryContainer: {
//        display: "flex",
//        gap: "12px"
//    },
//    statCard: {
//        background: "#fff",
//        padding: "15px 20px",
//        borderRadius: "10px",
//        border: "1px solid #e2e8f0"
//    },
//    statLabel: {
//        fontSize: "11px",
//        color: "#94a3b8"
//    },
//    statValue: {
//        fontSize: "22px",
//        fontWeight: "800"
//    },
//    filterBar: {
//        background: "#fff",
//        padding: "20px",
//        borderRadius: "12px",
//        border: "1px solid #e2e8f0",
//        display: "flex",
//        justifyContent: "space-between",
//        flexWrap: "wrap"
//    },
//    dateGroup: { display: "flex", gap: "10px" },
//    inputWrapper: { display: "flex", flexDirection: "column" },
//    inputLabel: { fontSize: "11px", color: "#94a3b8" },
//    dateInput: { padding: "8px", borderRadius: "6px", border: "1px solid #e2e8f0" },
//    actionGroup: { display: "flex", gap: "10px", alignItems: "center" },
//    searchWrapper: { position: "relative" },
//    searchIcon: { position: "absolute", left: "8px", top: "8px" },
//    searchInput: { padding: "8px 8px 8px 25px", borderRadius: "6px", border: "1px solid #e2e8f0" },
//    refreshBtn: { padding: "8px 10px", cursor: "pointer" },
//    printBtn: { padding: "8px 14px", background: "#0f172a", color: "#fff", border: "none", borderRadius: "6px" },
//    tableWrapper: { marginTop: "20px", background: "#fff", borderRadius: "12px", overflow: "hidden" },
//    table: { width: "100%", borderCollapse: "collapse" },
//    th: { padding: "12px", textAlign: "left", background: "#f1f5f9" },
//    td: { padding: "12px" },
//    tr: { borderBottom: "1px solid #f1f5f9" },
//    newBadge: { marginLeft: "6px", fontSize: "10px", color: "#3b82f6" },
//    statusBadge: { padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" },
//    viewBtn: { padding: "6px 12px", borderRadius: "6px", border: "1px solid #e2e8f0", cursor: "pointer" },
//    loaderContainer: { textAlign: "center", padding: "100px" }
//};
//
//export default ViewRoutes;




//
//
//import { useEffect, useState, useMemo, useCallback, useRef } from "react";
//import { useNavigate } from "react-router-dom";
//import axios from "axios";
//
//function ViewRoutes() {
//
//    const navigate = useNavigate();
//    const API = process.env.REACT_APP_API_URL;
//
//    const [trips, setTrips] = useState([]);
//    const [loading, setLoading] = useState(true);
//    const [refreshing, setRefreshing] = useState(false);
//
//    const [searchQuery, setSearchQuery] = useState("");
//    const [startDate, setStartDate] = useState("");
//    const [endDate, setEndDate] = useState("");
//
//    const [autoRefresh, setAutoRefresh] = useState(false);
//
//    const timerRef = useRef(null);
//
//    /* ================= FETCH TRIPS ================= */
//
//    const fetchTrips = useCallback(async (manual = false) => {
//
//        try {
//
//            manual ? setRefreshing(true) : setLoading(true);
//
//            const res = await axios.get(`${API}/api/trips`);
//
//            const sorted = (res.data || [])
//                .sort((a, b) => (b.id || 0) - (a.id || 0));
//
//            setTrips(sorted);
//
//        } catch (err) {
//
//            console.error("Trip fetch error:", err);
//
//        } finally {
//
//            setLoading(false);
//            setRefreshing(false);
//        }
//
//    }, [API]);
//
//    /* ================= INITIAL LOAD ================= */
//
//    useEffect(() => {
//        fetchTrips();
//    }, [fetchTrips]);
//
//    /* ================= AUTO REFRESH ================= */
//
//    useEffect(() => {
//
//        if (autoRefresh) {
//
//            timerRef.current = setInterval(() => {
//                fetchTrips(true);
//            }, 60000);
//
//        } else {
//
//            clearInterval(timerRef.current);
//        }
//
//        return () => clearInterval(timerRef.current);
//
//    }, [autoRefresh, fetchTrips]);
//
//    /* ================= FILTER TRIPS ================= */
//
//    const filteredTrips = useMemo(() => {
//
//        const query = searchQuery.toLowerCase();
//
//        return trips.filter((trip) => {
//
//            const tripDate = trip.tripDate
//                ? new Date(trip.tripDate).getTime()
//                : 0;
//
//            const start = startDate ? new Date(startDate).getTime() : null;
//            const end = endDate ? new Date(endDate).getTime() : null;
//
//            const matchesSearch =
//                trip.driverName?.toLowerCase().includes(query) ||
//                trip.vehicleNumber?.toLowerCase().includes(query) ||
//                trip.status?.toLowerCase().includes(query) || // Added status to search
//                String(trip.id).includes(query);
//
//            const matchesDate =
//                (!start || tripDate >= start) &&
//                (!end || tripDate <= end);
//
//            return matchesSearch && matchesDate;
//
//        });
//
//    }, [trips, searchQuery, startDate, endDate]);
//
//    /* ================= STATS ================= */
//
//    const stats = useMemo(() => {
//
//        const completed = filteredTrips.filter(
//            t => t.status === "RETURN_JOURNEY_COMPLETED"
//        ).length;
//
//        const cancelled = filteredTrips.filter(
//            t => t.status === "CANCELLED"
//        ).length;
//
//        return {
//            total: filteredTrips.length,
//            active: filteredTrips.length - completed - cancelled,
//            completed,
//            cancelled // New stat
//        };
//
//    }, [filteredTrips]);
//
//    /* ================= NAVIGATION ================= */
//
//    const handleViewHistory = (tripId) => {
//        navigate(`/dispatch-dashboard/routes/history/${tripId}`);
//    };
//
//    /* ================= UI ================= */
//
//    return (
//
//        <div style={styles.container}>
//
//            {/* HEADER */}
//
//            <div className="no-print">
//
//                <div style={styles.header}>
//
//                    <div>
//
//                        <h2 style={styles.title}>Fleet Logistics</h2>
//
//                        <p style={styles.subtitle}>
//                            {autoRefresh
//                                ? "🌐 Live Syncing Active"
//                                : "Operational movement history"}
//                        </p>
//
//                    </div>
//
//                    {/* STATS */}
//
//                    <div style={styles.summaryContainer}>
//
//                        <StatCard label="Total Trips" value={stats.total} />
//
//                        <StatCard
//                            label="In Progress"
//                            value={stats.active}
//                            color="#10b981"
//                        />
//
//                        <StatCard
//                            label="Completed"
//                            value={stats.completed}
//                            color="#3b82f6"
//                        />
//
//                        {/* NEW STAT CARD FOR CANCELLATION */}
//                        <StatCard
//                            label="Cancelled"
//                            value={stats.cancelled}
//                            color="#ef4444"
//                        />
//
//                    </div>
//
//                </div>
//
//                {/* FILTER BAR */}
//
//                <div style={styles.filterBar}>
//
//                    <div style={styles.dateGroup}>
//
//                        <DateInput
//                            label="From"
//                            value={startDate}
//                            onChange={setStartDate}
//                        />
//
//                        <DateInput
//                            label="To"
//                            value={endDate}
//                            onChange={setEndDate}
//                        />
//
//                    </div>
//
//                    <div style={styles.actionGroup}>
//
//                        {/* LIVE MODE */}
//
//                        <div
//                            style={styles.toggleWrapper}
//                            onClick={() => setAutoRefresh(!autoRefresh)}
//                        >
//
//                            <div
//                                style={{
//                                    ...styles.toggleTrack,
//                                    backgroundColor: autoRefresh
//                                        ? "#10b981"
//                                        : "#cbd5e1"
//                                }}
//                            >
//
//                                <div
//                                    style={{
//                                        ...styles.toggleThumb,
//                                        transform: autoRefresh
//                                            ? "translateX(20px)"
//                                            : "translateX(0px)"
//                                    }}
//                                />
//
//                            </div>
//
//                            <span style={styles.toggleLabel}>
//                                Live Mode
//                            </span>
//
//                        </div>
//
//                        {/* SEARCH */}
//
//                        <div style={styles.searchWrapper}>
//
//                            <span style={styles.searchIcon}>🔍</span>
//
//                            <input
//                                type="text"
//                                placeholder="Search trips..."
//                                value={searchQuery}
//                                onChange={(e) =>
//                                    setSearchQuery(e.target.value)
//                                }
//                                style={styles.searchInput}
//                            />
//
//                        </div>
//
//                        {/* REFRESH */}
//
//                        <button
//                            onClick={() => fetchTrips(true)}
//                            style={styles.refreshBtn}
//                            disabled={refreshing || loading}
//                        >
//                            🔄
//                        </button>
//
//                        {/* PRINT */}
//
//                        <button
//                            onClick={() => window.print()}
//                            style={styles.printBtn}
//                        >
//                            Report
//                        </button>
//
//                    </div>
//
//                </div>
//
//            </div>
//
//            {/* TABLE */}
//
//            {loading ? (
//
//                <div style={styles.loaderContainer}>
//                    Loading trips...
//                </div>
//
//            ) : (
//
//                <div style={styles.tableWrapper}>
//
//                    <table style={styles.table}>
//
//                        <thead>
//
//                        <tr>
//                            <th style={styles.th}>Trip ID</th>
//                            <th style={styles.th}>Vehicle</th>
//                            <th style={styles.th}>Driver</th>
//                            <th style={styles.th}>Status</th>
//                            <th style={styles.th}>Trip Date</th>
//                            <th
//                                style={{ ...styles.th, textAlign: "right" }}
//                                className="no-print"
//                            >
//                                Action
//                            </th>
//                        </tr>
//
//                        </thead>
//
//                        <tbody>
//
//                        {filteredTrips.map((trip) => {
//
//                            const isCompleted =
//                                trip.status === "RETURN_JOURNEY_COMPLETED";
//
//                            const isCancelled =
//                                trip.status === "CANCELLED";
//
//                            const isNew =
//                                new Date() -
//                                new Date(trip.tripDate || 0) <
//                                300000;
//
//                            return (
//
//                                <tr key={trip.id} style={{
//                                    ...styles.tr,
//                                    backgroundColor: isCancelled ? "#fff5f5" : "transparent" // Red highlight row
//                                }}>
//
//                                    <td style={styles.td}>
//                                        #{trip.id}
//                                        {isNew && (
//                                            <span style={styles.newBadge}>
//                                                NEW
//                                            </span>
//                                        )}
//                                    </td>
//
//                                    <td style={styles.td}>
//                                        {trip.vehicleNumber}
//                                    </td>
//
//                                    <td style={styles.td}>
//                                        {trip.driverName}
//                                    </td>
//
//                                    <td style={styles.td}>
//                                        <span
//                                            style={{
//                                                ...styles.statusBadge,
//                                                backgroundColor: isCancelled
//                                                    ? "#fee2e2" // Soft Red
//                                                    : isCompleted
//                                                    ? "#f1f5f9"
//                                                    : "#dcfce7",
//                                                color: isCancelled
//                                                    ? "#dc2626" // Dark Red Text
//                                                    : isCompleted
//                                                    ? "#475569"
//                                                    : "#166534"
//                                            }}
//                                        >
//                                            {isCancelled
//                                                ? "Cancelled"
//                                                : isCompleted
//                                                ? "Completed"
//                                                : "Active"}
//                                        </span>
//                                    </td>
//
//                                    <td style={styles.td}>
//                                        {trip.tripDate
//                                            ? new Date(
//                                                  trip.tripDate
//                                              ).toLocaleDateString()
//                                            : "-"}
//                                    </td>
//
//                                    <td
//                                        style={{
//                                            ...styles.td,
//                                            textAlign: "right"
//                                        }}
//                                        className="no-print"
//                                    >
//
//                                        <button
//                                            style={{
//                                                ...styles.viewBtn,
//                                                backgroundColor: isCancelled ? "#ef4444" : "#fff",
//                                                color: isCancelled ? "#fff" : "#000",
//                                                borderColor: isCancelled ? "#ef4444" : "#e2e8f0"
//                                            }}
//                                            onClick={() =>
//                                                handleViewHistory(trip.id)
//                                            }
//                                        >
//                                            View
//                                        </button>
//
//                                    </td>
//
//                                </tr>
//
//                            );
//
//                        })}
//
//                        </tbody>
//
//                    </table>
//
//                </div>
//
//            )}
//
//        </div>
//    );
//}
//
///* ================= Small Components ================= */
//
//function StatCard({ label, value, color }) {
//
//    return (
//        <div
//            style={{
//                ...styles.statCard,
//                borderTop: color ? `4px solid ${color}` : ""
//            }}
//        >
//            <span style={styles.statLabel}>{label}</span>
//            <span style={{ ...styles.statValue, color }}>
//                {value}
//            </span>
//        </div>
//    );
//}
//
//function DateInput({ label, value, onChange }) {
//
//    return (
//        <div style={styles.inputWrapper}>
//
//            <label style={styles.inputLabel}>{label}</label>
//
//            <input
//                type="date"
//                value={value}
//                onChange={(e) => onChange(e.target.value)}
//                style={styles.dateInput}
//            />
//
//        </div>
//    );
//}
//
///* ================= Styles ================= */
//
//const styles = {
//    container: {
//        padding: "40px",
//        background: "#f8fafc",
//        minHeight: "100vh"
//    },
//    header: {
//        display: "flex",
//        justifyContent: "space-between",
//        marginBottom: "25px"
//    },
//    title: {
//        fontSize: "28px",
//        fontWeight: "800"
//    },
//    subtitle: {
//        color: "#64748b"
//    },
//    summaryContainer: {
//        display: "flex",
//        gap: "12px"
//    },
//    statCard: {
//        background: "#fff",
//        padding: "15px 20px",
//        borderRadius: "10px",
//        border: "1px solid #e2e8f0"
//    },
//    statLabel: {
//        fontSize: "11px",
//        color: "#94a3b8"
//    },
//    statValue: {
//        fontSize: "22px",
//        fontWeight: "800"
//    },
//    filterBar: {
//        background: "#fff",
//        padding: "20px",
//        borderRadius: "12px",
//        border: "1px solid #e2e8f0",
//        display: "flex",
//        justifyContent: "space-between",
//        flexWrap: "wrap"
//    },
//    dateGroup: { display: "flex", gap: "10px" },
//    inputWrapper: { display: "flex", flexDirection: "column" },
//    inputLabel: { fontSize: "11px", color: "#94a3b8" },
//    dateInput: { padding: "8px", borderRadius: "6px", border: "1px solid #e2e8f0" },
//    actionGroup: { display: "flex", gap: "10px", alignItems: "center" },
//    toggleWrapper: { display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" },
//    toggleTrack: { width: "40px", height: "20px", borderRadius: "10px", padding: "2px", transition: "0.3s" },
//    toggleThumb: { width: "16px", height: "16px", background: "#fff", borderRadius: "50%", transition: "0.3s" },
//    toggleLabel: { fontSize: "12px", fontWeight: "600" },
//    searchWrapper: { position: "relative" },
//    searchIcon: { position: "absolute", left: "8px", top: "8px" },
//    searchInput: { padding: "8px 8px 8px 25px", borderRadius: "6px", border: "1px solid #e2e8f0" },
//    refreshBtn: { padding: "8px 10px", cursor: "pointer", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "6px" },
//    printBtn: { padding: "8px 14px", background: "#0f172a", color: "#fff", border: "none", borderRadius: "6px" },
//    tableWrapper: { marginTop: "20px", background: "#fff", borderRadius: "12px", overflow: "hidden" },
//    table: { width: "100%", borderCollapse: "collapse" },
//    th: { padding: "12px", textAlign: "left", background: "#f1f5f9" },
//    td: { padding: "12px" },
//    tr: { borderBottom: "1px solid #f1f5f9" },
//    newBadge: { marginLeft: "6px", fontSize: "10px", color: "#3b82f6" },
//    statusBadge: { padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" },
//    viewBtn: { padding: "6px 12px", borderRadius: "6px", border: "1px solid #e2e8f0", cursor: "pointer" },
//    loaderContainer: { textAlign: "center", padding: "100px" }
//};
//
//export default ViewRoutes;

//
//import { useEffect, useState, useMemo, useCallback, useRef } from "react";
//import { useNavigate } from "react-router-dom";
//import axios from "axios";
//
//function ViewRoutes() {
//
//    const navigate = useNavigate();
//    const API = process.env.REACT_APP_API_URL;
//
//    const [trips, setTrips] = useState([]);
//    const [loading, setLoading] = useState(true);
//    const [refreshing, setRefreshing] = useState(false);
//
//    const [searchQuery, setSearchQuery] = useState("");
//    const [startDate, setStartDate] = useState("");
//    const [endDate, setEndDate] = useState("");
//
//    const [autoRefresh, setAutoRefresh] = useState(false);
//
//    const timerRef = useRef(null);
//
//    /* ================= FETCH TRIPS ================= */
//
//    const fetchTrips = useCallback(async (manual = false) => {
//
//        try {
//
//            manual ? setRefreshing(true) : setLoading(true);
//
//            const res = await axios.get(`${API}/api/trips`);
//
//            const sorted = (res.data || [])
//                .sort((a, b) => (b.id || 0) - (a.id || 0));
//
//            setTrips(sorted);
//
//        } catch (err) {
//
//            console.error("Trip fetch error:", err);
//
//        } finally {
//
//            setLoading(false);
//            setRefreshing(false);
//        }
//
//    }, [API]);
//
//    /* ================= INITIAL LOAD ================= */
//
//    useEffect(() => {
//        fetchTrips();
//    }, [fetchTrips]);
//
//    /* ================= AUTO REFRESH ================= */
//
//    useEffect(() => {
//
//        if (autoRefresh) {
//
//            timerRef.current = setInterval(() => {
//                fetchTrips(true);
//            }, 60000);
//
//        } else {
//
//            clearInterval(timerRef.current);
//        }
//
//        return () => clearInterval(timerRef.current);
//
//    }, [autoRefresh, fetchTrips]);
//
//    /* ================= FILTER TRIPS ================= */
//
//    const filteredTrips = useMemo(() => {
//
//        const query = searchQuery.toLowerCase();
//
//        return trips.filter((trip) => {
//
//            const tripDate = trip.tripDate
//                ? new Date(trip.tripDate).getTime()
//                : 0;
//
//            const start = startDate ? new Date(startDate).getTime() : null;
//            const end = endDate ? new Date(endDate).getTime() : null;
//
//            const matchesSearch =
//                trip.driverName?.toLowerCase().includes(query) ||
//                trip.vehicleNumber?.toLowerCase().includes(query) ||
//                trip.status?.toLowerCase().includes(query) ||
//                String(trip.id).includes(query);
//
//            const matchesDate =
//                (!start || tripDate >= start) &&
//                (!end || tripDate <= end);
//
//            return matchesSearch && matchesDate;
//
//        });
//
//    }, [trips, searchQuery, startDate, endDate]);
//
//    /* ================= STATS ================= */
//
//    const stats = useMemo(() => {
//
//        const completed = filteredTrips.filter(
//            t => t.status === "RETURN_JOURNEY_COMPLETED"
//        ).length;
//
//        const cancelled = filteredTrips.filter(
//            t => t.status === "CANCELLED"
//        ).length;
//
//        return {
//            total: filteredTrips.length,
//            active: filteredTrips.length - completed - cancelled,
//            completed,
//            cancelled
//        };
//
//    }, [filteredTrips]);
//
//    /* ================= NAVIGATION ================= */
//
//    const handleViewHistory = (tripId) => {
//        navigate(`/dispatch-dashboard/routes/history/${tripId}`);
//    };
//   const handleSeeWhy = (tripId) => {
//           navigate(`/dispatch-dashboard/routes/cancellation/${tripId}`);
//       };
//    /* ================= UI ================= */
//
//    return (
//
//        <div style={styles.container}>
//
//            {/* HEADER */}
//
//            <div className="no-print">
//
//                <div style={styles.header}>
//
//                    <div>
//
//                        <h2 style={styles.title}>Fleet Logistics</h2>
//
//                        <p style={styles.subtitle}>
//                            {autoRefresh
//                                ? "🌐 Live Syncing Active"
//                                : "Operational movement history"}
//                        </p>
//
//                    </div>
//
//                    {/* STATS */}
//
//                    <div style={styles.summaryContainer}>
//
//                        <StatCard label="Total Trips" value={stats.total} />
//
//                        <StatCard
//                            label="In Progress"
//                            value={stats.active}
//                            color="#10b981"
//                        />
//
//                        <StatCard
//                            label="Completed"
//                            value={stats.completed}
//                            color="#3b82f6"
//                        />
//
//                        <StatCard
//                            label="Cancelled"
//                            value={stats.cancelled}
//                            color="#ef4444"
//                        />
//
//                    </div>
//
//                </div>
//
//                {/* FILTER BAR */}
//
//                <div style={styles.filterBar}>
//
//                    <div style={styles.dateGroup}>
//
//                        <DateInput
//                            label="From"
//                            value={startDate}
//                            onChange={setStartDate}
//                        />
//
//                        <DateInput
//                            label="To"
//                            value={endDate}
//                            onChange={setEndDate}
//                        />
//
//                    </div>
//
//                    <div style={styles.actionGroup}>
//
//                        <div
//                            style={styles.toggleWrapper}
//                            onClick={() => setAutoRefresh(!autoRefresh)}
//                        >
//
//                            <div
//                                style={{
//                                    ...styles.toggleTrack,
//                                    backgroundColor: autoRefresh
//                                        ? "#10b981"
//                                        : "#cbd5e1"
//                                }}
//                            >
//
//                                <div
//                                    style={{
//                                        ...styles.toggleThumb,
//                                        transform: autoRefresh
//                                            ? "translateX(20px)"
//                                            : "translateX(0px)"
//                                    }}
//                                />
//
//                            </div>
//
//                            <span style={styles.toggleLabel}>
//                                Live Mode
//                            </span>
//
//                        </div>
//
//                        <div style={styles.searchWrapper}>
//
//                            <span style={styles.searchIcon}>🔍</span>
//
//                            <input
//                                type="text"
//                                placeholder="Search trips..."
//                                value={searchQuery}
//                                onChange={(e) =>
//                                    setSearchQuery(e.target.value)
//                                }
//                                style={styles.searchInput}
//                            />
//
//                        </div>
//
//                        <button
//                            onClick={() => fetchTrips(true)}
//                            style={styles.refreshBtn}
//                            disabled={refreshing || loading}
//                        >
//                            🔄
//                        </button>
//
//                        <button
//                            onClick={() => window.print()}
//                            style={styles.printBtn}
//                        >
//                            Report
//                        </button>
//
//                    </div>
//
//                </div>
//
//            </div>
//
//            {/* TABLE */}
//
//            {loading ? (
//
//                <div style={styles.loaderContainer}>
//                    Loading trips...
//                </div>
//
//            ) : (
//
//                <div style={styles.tableWrapper}>
//
//                    <table style={styles.table}>
//
//                        <thead>
//
//                        <tr>
//                            <th style={styles.th}>Trip ID</th>
//                            <th style={styles.th}>Vehicle</th>
//                            <th style={styles.th}>Driver</th>
//                            <th style={styles.th}>Status</th>
//                            <th style={styles.th}>Trip Date</th>
//                            <th
//                                style={{ ...styles.th, textAlign: "right" }}
//                                className="no-print"
//                            >
//                                Action
//                            </th>
//                        </tr>
//
//                        </thead>
//
//                        <tbody>
//
//                        {filteredTrips.map((trip) => {
//
//                            const isCompleted =
//                                trip.status === "RETURN_JOURNEY_COMPLETED";
//
//                            const isCancelled = trip.status === "CANCELLED";
//
//                            const isNew =
//                                new Date() -
//                                new Date(trip.tripDate || 0) <
//                                300000;
//
//                            return (
//
//                                <tr key={trip.id} style={{
//                                    ...styles.tr,
//                                    backgroundColor: isCancelled ? "#fff5f5" : "transparent"
//                                }}>
//
//                                    <td style={styles.td}>
//                                        #{trip.id}
//                                        {isNew && (
//                                            <span style={styles.newBadge}>
//                                                NEW
//                                            </span>
//                                        )}
//                                    </td>
//
//                                    <td style={styles.td}>
//                                        {trip.vehicleNumber}
//                                    </td>
//
//                                    <td style={styles.td}>
//                                        {trip.driverName}
//                                    </td>
//
//                                    <td style={styles.td}>
//                                        <span
//                                            style={{
//                                                ...styles.statusBadge,
//                                                backgroundColor: isCancelled
//                                                    ? "#fee2e2"
//                                                    : isCompleted
//                                                    ? "#f1f5f9"
//                                                    : "#dcfce7",
//                                                color: isCancelled
//                                                    ? "#dc2626"
//                                                    : isCompleted
//                                                    ? "#475569"
//                                                    : "#166534"
//                                            }}
//                                        >
//                                            {isCancelled
//                                                ? "Cancelled"
//                                                : isCompleted
//                                                ? "Completed"
//                                                : "Active"}
//                                        </span>
//                                    </td>
//
//                                    <td style={styles.td}>
//                                        {trip.tripDate
//                                            ? new Date(
//                                                  trip.tripDate
//                                              ).toLocaleDateString()
//                                            : "-"}
//                                    </td>
//
//                                    <td
//                                        style={{
//                                            ...styles.td,
//                                            textAlign: "right"
//                                        }}
//                                        className="no-print"
//                                    >
//                                        {isCancelled ? (
//                                            <button
//                                                style={{
//                                                    ...styles.viewBtn,
//                                                    backgroundColor: "#ef4444",
//                                                    color: "#fff",
//                                                    borderColor: "#dc2626",
//                                                    fontWeight: "bold"
//                                                }}
//                                                onClick={() => handleViewHistory(trip.id)}
//                                                title={`Reason: ${trip.reason || 'Not provided'}`}
//                                            >
//                                                See Why??
//                                            </button>
//                                        ) : (
//                                            <button
//                                                style={styles.viewBtn}
//                                                onClick={() =>
//                                                    handleViewHistory(trip.id)
//                                                }
//                                            >
//                                                View
//                                            </button>
//                                        )}
//                                    </td>
//
//                                </tr>
//
//                            );
//
//                        })}
//
//                        </tbody>
//
//                    </table>
//
//                </div>
//
//            )}
//
//        </div>
//    );
//}
//
///* ================= Small Components ================= */
//
//function StatCard({ label, value, color }) {
//
//    return (
//        <div
//            style={{
//                ...styles.statCard,
//                borderTop: color ? `4px solid ${color}` : ""
//            }}
//        >
//            <span style={styles.statLabel}>{label}</span>
//            <span style={{ ...styles.statValue, color }}>
//                {value}
//            </span>
//        </div>
//    );
//}
//
//function DateInput({ label, value, onChange }) {
//
//    return (
//        <div style={styles.inputWrapper}>
//
//            <label style={styles.inputLabel}>{label}</label>
//
//            <input
//                type="date"
//                value={value}
//                onChange={(e) => onChange(e.target.value)}
//                style={styles.dateInput}
//            />
//
//        </div>
//    );
//}
//
///* ================= Styles ================= */
//
//const styles = {
//    container: {
//        padding: "40px",
//        background: "#f8fafc",
//        minHeight: "100vh"
//    },
//    header: {
//        display: "flex",
//        justifyContent: "space-between",
//        marginBottom: "25px"
//    },
//    title: {
//        fontSize: "28px",
//        fontWeight: "800"
//    },
//    subtitle: {
//        color: "#64748b"
//    },
//    summaryContainer: {
//        display: "flex",
//        gap: "12px"
//    },
//    statCard: {
//        background: "#fff",
//        padding: "15px 20px",
//        borderRadius: "10px",
//        border: "1px solid #e2e8f0"
//    },
//    statLabel: {
//        fontSize: "11px",
//        color: "#94a3b8"
//    },
//    statValue: {
//        fontSize: "22px",
//        fontWeight: "800"
//    },
//    filterBar: {
//        background: "#fff",
//        padding: "20px",
//        borderRadius: "12px",
//        border: "1px solid #e2e8f0",
//        display: "flex",
//        justifyContent: "space-between",
//        flexWrap: "wrap"
//    },
//    dateGroup: { display: "flex", gap: "10px" },
//    inputWrapper: { display: "flex", flexDirection: "column" },
//    inputLabel: { fontSize: "11px", color: "#94a3b8" },
//    dateInput: { padding: "8px", borderRadius: "6px", border: "1px solid #e2e8f0" },
//    actionGroup: { display: "flex", gap: "10px", alignItems: "center" },
//    toggleWrapper: { display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" },
//    toggleTrack: { width: "40px", height: "20px", borderRadius: "10px", padding: "2px", transition: "0.3s" },
//    toggleThumb: { width: "16px", height: "16px", background: "#fff", borderRadius: "50%", transition: "0.3s" },
//    toggleLabel: { fontSize: "12px", fontWeight: "600" },
//    searchWrapper: { position: "relative" },
//    searchIcon: { position: "absolute", left: "8px", top: "8px" },
//    searchInput: { padding: "8px 8px 8px 25px", borderRadius: "6px", border: "1px solid #e2e8f0" },
//    refreshBtn: { padding: "8px 10px", cursor: "pointer", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "6px" },
//    printBtn: { padding: "8px 14px", background: "#0f172a", color: "#fff", border: "none", borderRadius: "6px" },
//    tableWrapper: { marginTop: "20px", background: "#fff", borderRadius: "12px", overflow: "hidden" },
//    table: { width: "100%", borderCollapse: "collapse" },
//    th: { padding: "12px", textAlign: "left", background: "#f1f5f9" },
//    td: { padding: "12px" },
//    tr: { borderBottom: "1px solid #f1f5f9" },
//    newBadge: { marginLeft: "6px", fontSize: "10px", color: "#3b82f6" },
//    statusBadge: { padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" },
//    viewBtn: { padding: "6px 12px", borderRadius: "6px", border: "1px solid #e2e8f0", cursor: "pointer" },
//    loaderContainer: { textAlign: "center", padding: "100px" }
//};
//
//export default ViewRoutes;

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function ViewRoutes() {

    const navigate = useNavigate();
    const API = process.env.REACT_APP_API_URL;

    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [autoRefresh, setAutoRefresh] = useState(false);

    const timerRef = useRef(null);

    /* ================= FETCH TRIPS ================= */

    const fetchTrips = useCallback(async (manual = false) => {

        try {

            manual ? setRefreshing(true) : setLoading(true);

            const res = await axios.get(`${API}/api/trips`);

            const sorted = (res.data || [])
                .sort((a, b) => (b.id || 0) - (a.id || 0));

            setTrips(sorted);

        } catch (err) {

            console.error("Trip fetch error:", err);

        } finally {

            setLoading(false);
            setRefreshing(false);
        }

    }, [API]);

    /* ================= INITIAL LOAD ================= */

    useEffect(() => {
        fetchTrips();
    }, [fetchTrips]);

    /* ================= AUTO REFRESH ================= */

    useEffect(() => {

        if (autoRefresh) {

            timerRef.current = setInterval(() => {
                fetchTrips(true);
            }, 60000);

        } else {

            clearInterval(timerRef.current);
        }

        return () => clearInterval(timerRef.current);

    }, [autoRefresh, fetchTrips]);

    /* ================= FILTER TRIPS ================= */

    const filteredTrips = useMemo(() => {

        const query = searchQuery.toLowerCase();

        return trips.filter((trip) => {

            const tripDate = trip.tripDate
                ? new Date(trip.tripDate).getTime()
                : 0;

            const start = startDate ? new Date(startDate).getTime() : null;
            const end = endDate ? new Date(endDate).getTime() : null;

            const matchesSearch =
                trip.driverName?.toLowerCase().includes(query) ||
                trip.vehicleNumber?.toLowerCase().includes(query) ||
                trip.status?.toLowerCase().includes(query) ||
                String(trip.id).includes(query);

            const matchesDate =
                (!start || tripDate >= start) &&
                (!end || tripDate <= end);

            return matchesSearch && matchesDate;

        });

    }, [trips, searchQuery, startDate, endDate]);

    /* ================= STATS ================= */

    const stats = useMemo(() => {

        const completed = filteredTrips.filter(
            t => t.status === "RETURN_JOURNEY_COMPLETED"
        ).length;

        const cancelled = filteredTrips.filter(
            t => t.status === "CANCELLED"
        ).length;

        return {
            total: filteredTrips.length,
            active: filteredTrips.length - completed - cancelled,
            completed,
            cancelled
        };

    }, [filteredTrips]);

    /* ================= NAVIGATION ================= */

    const handleViewHistory = (tripId) => {
        navigate(`/dispatch-dashboard/routes/history/${tripId}`);
    };

    const handleSeeWhy = (tripId) => {
        navigate(`/dispatch-dashboard/routes/cancellation/${tripId}`);
    };

    /* ================= UI ================= */

    return (

        <div style={styles.container}>

            {/* HEADER */}

            <div className="no-print">

                <div style={styles.header}>

                    <div>

                        <h2 style={styles.title}>Fleet Logistics</h2>

                        <p style={styles.subtitle}>
                            {autoRefresh
                                ? "🌐 Live Syncing Active"
                                : "Operational movement history"}
                        </p>

                    </div>

                    {/* STATS */}

                    <div style={styles.summaryContainer}>

                        <StatCard label="Total Trips" value={stats.total} />

                        <StatCard
                            label="In Progress"
                            value={stats.active}
                            color="#10b981"
                        />

                        <StatCard
                            label="Completed"
                            value={stats.completed}
                            color="#3b82f6"
                        />

                        <StatCard
                            label="Cancelled"
                            value={stats.cancelled}
                            color="#ef4444"
                        />

                    </div>

                </div>

                {/* FILTER BAR */}

                <div style={styles.filterBar}>

                    <div style={styles.dateGroup}>

                        <DateInput
                            label="From"
                            value={startDate}
                            onChange={setStartDate}
                        />

                        <DateInput
                            label="To"
                            value={endDate}
                            onChange={setEndDate}
                        />

                    </div>

                    <div style={styles.actionGroup}>

                        <div
                            style={styles.toggleWrapper}
                            onClick={() => setAutoRefresh(!autoRefresh)}
                        >

                            <div
                                style={{
                                    ...styles.toggleTrack,
                                    backgroundColor: autoRefresh
                                        ? "#10b981"
                                        : "#cbd5e1"
                                }}
                            >

                                <div
                                    style={{
                                        ...styles.toggleThumb,
                                        transform: autoRefresh
                                            ? "translateX(20px)"
                                            : "translateX(0px)"
                                    }}
                                />

                            </div>

                            <span style={styles.toggleLabel}>
                                Live Mode
                            </span>

                        </div>

                        <div style={styles.searchWrapper}>

                            <span style={styles.searchIcon}>🔍</span>

                            <input
                                type="text"
                                placeholder="Search trips..."
                                value={searchQuery}
                                onChange={(e) =>
                                    setSearchQuery(e.target.value)
                                }
                                style={styles.searchInput}
                            />

                        </div>

                        <button
                            onClick={() => fetchTrips(true)}
                            style={styles.refreshBtn}
                            disabled={refreshing || loading}
                        >
                            🔄
                        </button>

                        <button
                            onClick={() => window.print()}
                            style={styles.printBtn}
                        >
                            Report
                        </button>

                    </div>

                </div>

            </div>

            {/* TABLE */}

            {loading ? (

                <div style={styles.loaderContainer}>
                    Loading trips...
                </div>

            ) : (

                <div style={styles.tableWrapper}>

                    <table style={styles.table}>

                        <thead>

                        <tr>
                            <th style={styles.th}>Trip ID</th>
                            <th style={styles.th}>Vehicle</th>
                            <th style={styles.th}>Driver</th>
                            <th style={styles.th}>Status</th>
                            <th style={styles.th}>Trip Date</th>
                            <th
                                style={{ ...styles.th, textAlign: "right" }}
                                className="no-print"
                            >
                                Action
                            </th>
                        </tr>

                        </thead>

                        <tbody>

                        {filteredTrips.map((trip) => {

                            const isCompleted =
                                trip.status === "RETURN_JOURNEY_COMPLETED";

                            const isCancelled = trip.status === "CANCELLED";

                            const isNew =
                                new Date() -
                                new Date(trip.tripDate || 0) <
                                300000;

                            return (

                                <tr key={trip.id} style={{
                                    ...styles.tr,
                                    backgroundColor: isCancelled ? "#fff5f5" : "transparent"
                                }}>

                                    <td style={styles.td}>
                                        #{trip.id}
                                        {isNew && (
                                            <span style={styles.newBadge}>
                                                NEW
                                            </span>
                                        )}
                                    </td>

                                    <td style={styles.td}>
                                        {trip.vehicleNumber}
                                    </td>

                                    <td style={styles.td}>
                                        {trip.driverName}
                                    </td>

                                    <td style={styles.td}>
                                        <span
                                            style={{
                                                ...styles.statusBadge,
                                                backgroundColor: isCancelled
                                                    ? "#fee2e2"
                                                    : isCompleted
                                                    ? "#f1f5f9"
                                                    : "#dcfce7",
                                                color: isCancelled
                                                    ? "#dc2626"
                                                    : isCompleted
                                                    ? "#475569"
                                                    : "#166534"
                                            }}
                                        >
                                            {isCancelled
                                                ? "Cancelled"
                                                : isCompleted
                                                ? "Completed"
                                                : "Active"}
                                        </span>
                                    </td>

                                    <td style={styles.td}>
                                        {trip.tripDate
                                            ? new Date(
                                                  trip.tripDate
                                              ).toLocaleDateString()
                                            : "-"}
                                    </td>

                                    <td
                                        style={{
                                            ...styles.td,
                                            textAlign: "right"
                                        }}
                                        className="no-print"
                                    >
                                        {isCancelled ? (
                                            <button
                                                style={{
                                                    ...styles.viewBtn,
                                                    backgroundColor: "#ef4444",
                                                    color: "#fff",
                                                    borderColor: "#dc2626",
                                                    fontWeight: "bold"
                                                }}
                                                // EXACT CHANGE: Calling handleSeeWhy instead of handleViewHistory
                                                onClick={() => handleSeeWhy(trip.id)}
                                                title={`Reason: ${trip.reason || 'Not provided'}`}
                                            >
                                                See Why??
                                            </button>
                                        ) : (
                                            <button
                                                style={styles.viewBtn}
                                                onClick={() =>
                                                    handleViewHistory(trip.id)
                                                }
                                            >
                                                View
                                            </button>
                                        )}
                                    </td>

                                </tr>

                            );

                        })}

                        </tbody>

                    </table>

                </div>

            )}

        </div>
    );
}

/* ================= Small Components ================= */

function StatCard({ label, value, color }) {

    return (
        <div
            style={{
                ...styles.statCard,
                borderTop: color ? `4px solid ${color}` : ""
            }}
        >
            <span style={styles.statLabel}>{label}</span>
            <span style={{ ...styles.statValue, color }}>
                {value}
            </span>
        </div>
    );
}

function DateInput({ label, value, onChange }) {

    return (
        <div style={styles.inputWrapper}>

            <label style={styles.inputLabel}>{label}</label>

            <input
                type="date"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={styles.dateInput}
            />

        </div>
    );
}

/* ================= Styles ================= */

const styles = {
    container: {
        padding: "40px",
        background: "#f8fafc",
        minHeight: "100vh"
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "25px"
    },
    title: {
        fontSize: "28px",
        fontWeight: "800"
    },
    subtitle: {
        color: "#64748b"
    },
    summaryContainer: {
        display: "flex",
        gap: "12px"
    },
    statCard: {
        background: "#fff",
        padding: "15px 20px",
        borderRadius: "10px",
        border: "1px solid #e2e8f0"
    },
    statLabel: {
        fontSize: "11px",
        color: "#94a3b8"
    },
    statValue: {
        fontSize: "22px",
        fontWeight: "800"
    },
    filterBar: {
        background: "#fff",
        padding: "20px",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
        display: "flex",
        justifyContent: "space-between",
        flexWrap: "wrap"
    },
    dateGroup: { display: "flex", gap: "10px" },
    inputWrapper: { display: "flex", flexDirection: "column" },
    inputLabel: { fontSize: "11px", color: "#94a3b8" },
    dateInput: { padding: "8px", borderRadius: "6px", border: "1px solid #e2e8f0" },
    actionGroup: { display: "flex", gap: "10px", alignItems: "center" },
    toggleWrapper: { display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" },
    toggleTrack: { width: "40px", height: "20px", borderRadius: "10px", padding: "2px", transition: "0.3s" },
    toggleThumb: { width: "16px", height: "16px", background: "#fff", borderRadius: "50%", transition: "0.3s" },
    toggleLabel: { fontSize: "12px", fontWeight: "600" },
    searchWrapper: { position: "relative" },
    searchIcon: { position: "absolute", left: "8px", top: "8px" },
    searchInput: { padding: "8px 8px 8px 25px", borderRadius: "6px", border: "1px solid #e2e8f0" },
    refreshBtn: { padding: "8px 10px", cursor: "pointer", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "6px" },
    printBtn: { padding: "8px 14px", background: "#0f172a", color: "#fff", border: "none", borderRadius: "6px" },
    tableWrapper: { marginTop: "20px", background: "#fff", borderRadius: "12px", overflow: "hidden" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { padding: "12px", textAlign: "left", background: "#f1f5f9" },
    td: { padding: "12px" },
    tr: { borderBottom: "1px solid #f1f5f9" },
    newBadge: { marginLeft: "6px", fontSize: "10px", color: "#3b82f6" },
    statusBadge: { padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" },
    viewBtn: { padding: "6px 12px", borderRadius: "6px", border: "1px solid #e2e8f0", cursor: "pointer" },
    loaderContainer: { textAlign: "center", padding: "100px" }
};

export default ViewRoutes;