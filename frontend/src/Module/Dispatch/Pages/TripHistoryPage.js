//
//
//import { useEffect, useState, useMemo } from "react";
//import { useParams } from "react-router-dom";
//import axios from "axios";
//import DriverGanttChart from "./DriverGanttChart";
//
//// Restored Modern SaaS Color Palette with DRIVER_BREAK added
//const STATUS_COLORS = {
//    ASSIGNED: "#64748b",
//    ACKNOWLEDGED: "#3b82f6",
//    LOADING_STARTED: "#f59e0b",
//    LOADING_COMPLETED: "#10b981",
//    IN_TRANSIT: "#8b5cf6",
//    REACHED_DESTINATION: "#06b6d4",
//    UNLOADING_STARTED: "#f97316",
//    UNLOADING_COMPLETED: "#22c55e",
//    RETURN_JOURNEY_STARTED: "#ec4899",
//    RETURN_JOURNEY_COMPLETED: "#111827",
//    DRIVER_BREAK: "#ef4444", // Dedicated color for breaks
//};
//
//function TripHistoryPage() {
//    const { tripId } = useParams();
//    const [history, setHistory] = useState([]);
//    const [breakData, setBreakData] = useState([]);
//    const [cancelData, setCancelData] = useState(null);
//    const [loading, setLoading] = useState(true);
//    const [isChartOpen, setIsChartOpen] = useState(false);
//    const [searchQuery, setSearchQuery] = useState("");
//
//    const API_BASE = "http://localhost:8080/api";
//
//    useEffect(() => {
//        const fetchAllHistory = async () => {
//            try {
//                // Fetching from both your original milestones and new break facility
//                const [historyRes, breaksRes] = await Promise.all([
//                    axios.get(`${API_BASE}/vehicle-activity/history/${tripId}`),
//                    axios.get(`${API_BASE}/driver-break/history/${tripId}`)
//                ]);
//
//                setHistory(historyRes.data || []);
//                setBreakData(breaksRes.data || []);
//            } catch (e) {
//                console.error("Failed to fetch consolidated history", e);
//            } finally {
//                setLoading(false);
//            }
//        };
//        fetchAllHistory();
//    }, [tripId]);
//
//    // Format and Merge data for the Gantt Chart and Table
//    const mergedTimeline = useMemo(() => {
//        // 1. Transform Breaks to match history structure
//        const formattedBreaks = breakData.map(b => ({
//            eventTime: b.breakStart,
//            status: "DRIVER_BREAK",
//            breakEnd: b.breakEnd,
//            reason: b.reason,
//            isBreak: true
//        }));
//
//        // 2. Combine and sort everything by time
//        const combined = [...history, ...formattedBreaks].sort(
//            (a, b) => new Date(a.eventTime) - new Date(b.eventTime)
//        );
//
//        let totalBreakTime = 0;
//
//        // 3. Process data for table display (durations)
//        const processed = combined.map((item, index) => {
//            const startTime = new Date(item.eventTime).getTime();
//            const nextItem = combined[index + 1];
//
//            let duration = 0;
//            if (item.status === "DRIVER_BREAK" && item.breakEnd) {
//                // Use actual duration of the break from your break entity
//                duration = (new Date(item.breakEnd).getTime() - startTime) / (1000 * 60);
//                totalBreakTime += duration;
//            } else if (nextItem) {
//                // Standard milestone interval
//                duration = (new Date(nextItem.eventTime).getTime() - startTime) / (1000 * 60);
//            }
//
//            return {
//                ...item,
//                durationFormatted: duration > 0 ? duration.toFixed(1) : 'N/A'
//            };
//        });
//
//        return { processed, totalBreakTime };
//    }, [history, breakData]);
//
//    // Data for the Gantt Chart (Full processed timeline)
//    const formattedChartData = useMemo(() => {
//        return mergedTimeline.processed.map((item, index) => {
//            const nextItem = mergedTimeline.processed[index + 1];
//            return {
//                status: item.status,
//                start: item.eventTime,
//                // If it's a break with a specific end, use it; otherwise use next event
//                end: item.breakEnd || (nextItem ? nextItem.eventTime : new Date(new Date(item.eventTime).getTime() + 15 * 60000).toISOString())
//            };
//        });
//    }, [mergedTimeline]);
//
//    // Data for the Table (Filtered by Search)
//    const tableData = useMemo(() => {
//        if (!searchQuery) return mergedTimeline.processed;
//        return mergedTimeline.processed.filter(item =>
//            item.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
//            (item.reason && item.reason.toLowerCase().includes(searchQuery.toLowerCase()))
//        );
//    }, [mergedTimeline, searchQuery]);
//
//    if (loading) return (
//        <div className="loader-container">
//            <div className="spinner"></div>
//            <p>Syncing Fleet Records...</p>
//        </div>
//    );
//
//    return (
//        <div className="trip-history-page">
//            <header className="page-header">
//                <div className="header-content">
//                    <div className="title-group">
//                        <span className="badge">REAL-TIME MONITORING</span>
//                        <h1>Trip Analytics <span className="text-thin"># {tripId}</span></h1>
//                    </div>
//                    <button className="view-chart-btn" onClick={() => setIsChartOpen(true)}>
//                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
//                        View Gantt Timeline
//                    </button>
//                </div>
//            </header>
//
//            <main className="content-container">
//                {/* Summary Stats */}
//                <div className="stats-grid">
//                    <div className="stat-card">
//                        <label>Live Status</label>
//                        <div className="stat-value" style={{ color: STATUS_COLORS[history[history.length - 1]?.status] || "#000" }}>
//                            {history[history.length - 1]?.status.replace(/_/g, ' ')}
//                        </div>
//                    </div>
//                    <div className="stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
//                        <label>Driver Rest Time</label>
//                        <div className="stat-value" style={{ color: '#ef4444' }}>
//                            {Math.round(mergedTimeline.totalBreakTime)} <small>min</small>
//                        </div>
//                    </div>
//                    <div className="stat-card">
//                        <label>Total Milestones</label>
//                        <div className="stat-value">{history.length}</div>
//                    </div>
//                </div>
//
//                {/* Table & Search Section */}
//                <div className="table-wrapper">
//                    <div className="table-controls">
//                        <div className="search-container">
//                            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
//                            <input
//                                type="text"
//                                placeholder="Search by status or reason..."
//                                value={searchQuery}
//                                onChange={(e) => setSearchQuery(e.target.value)}
//                                className="search-input"
//                            />
//                        </div>
//                        <p className="results-count">Showing {tableData.length} entries</p>
//                    </div>
//
//                    <table className="modern-table">
//                        <thead>
//                        <tr>
//                            <th>Event Status</th>
//                            <th>Timestamp</th>
//                            <th>Note/Reason</th>
//                            <th className="text-center">Duration</th>
//                        </tr>
//                        </thead>
//                        <tbody>
//                        {tableData.length > 0 ? tableData.map((record, idx) => {
//                            const dateObj = new Date(record.eventTime);
//                            const isBreak = record.status === "DRIVER_BREAK";
//                            return (
//                                <tr key={idx} style={isBreak ? { backgroundColor: '#fff1f2' } : {}}>
//                                    <td>
//                                        <div className="status-pill" style={{ '--color': STATUS_COLORS[record.status] || '#64748b' }}>
//                                            {record.status.replace(/_/g, ' ')}
//                                        </div>
//                                    </td>
//                                    <td className="text-dark">
//                                        <div style={{ fontSize: '11px', color: '#64748b' }}>{dateObj.toLocaleDateString()}</div>
//                                        {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
//                                    </td>
//                                    <td className="text-muted" style={{ fontStyle: 'italic' }}>
//                                        {record.reason || (isBreak ? "Break started" : "—")}
//                                    </td>
//                                    <td className="text-center">
//                                        {record.durationFormatted !== 'N/A' ? (
//                                            <span className="duration-tag">{record.durationFormatted} <small>min</small></span>
//                                        ) : <span className="text-muted">—</span>}
//                                    </td>
//                                </tr>
//                            );
//                        }) : (
//                            <tr>
//                                <td colSpan="4" className="empty-search">No records matching "{searchQuery}"</td>
//                            </tr>
//                        )}
//                        </tbody>
//                    </table>
//                </div>
//            </main>
//
//            <DriverGanttChart
//                tasksData={formattedChartData}
//                isOpen={isChartOpen}
//                onClose={() => setIsChartOpen(false)}
//            />
//
//            <style>{`
//                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono&display=swap');
//
//                :root {
//                    --bg: #f8fafc;
//                    --primary: #2563eb;
//                    --text-main: #0f172a;
//                    --text-muted: #64748b;
//                    --border: #e2e8f0;
//                }
//
//                .trip-history-page { padding: 40px 5%; font-family: 'Inter', sans-serif; background: var(--bg); min-height: 100vh; color: var(--text-main); }
//                .page-header { margin-bottom: 40px; }
//                .header-content { display: flex; justify-content: space-between; align-items: flex-end; }
//                .badge { font-size: 10px; font-weight: 800; letter-spacing: 1.5px; color: var(--primary); background: #dbeafe; padding: 4px 10px; border-radius: 20px; margin-bottom: 8px; display: inline-block; }
//                h1 { margin: 0; font-size: 2.25rem; font-weight: 800; letter-spacing: -1px; }
//                .text-thin { font-weight: 300; color: var(--text-muted); }
//
//                .view-chart-btn {
//                    background: var(--text-main); color: white; border: none; padding: 12px 24px; border-radius: 12px;
//                    font-weight: 600; cursor: pointer; transition: all 0.3s ease;
//                    display: flex; align-items: center; gap: 10px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
//                }
//                .view-chart-btn:hover { transform: translateY(-2px); background: #1e293b; }
//
//                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
//                .stat-card { background: white; padding: 24px; border-radius: 16px; border: 1px solid var(--border); box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
//                .stat-card label { font-size: 12px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
//                .stat-value { font-size: 1.5rem; font-weight: 700; margin-top: 8px; }
//
//                .table-wrapper { background: white; border-radius: 20px; border: 1px solid var(--border); overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
//                .table-controls { padding: 20px 32px; display: flex; justify-content: space-between; align-items: center; background: #fff; border-bottom: 1px solid var(--border); }
//
//                .search-container { position: relative; width: 350px; }
//                .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
//                .search-input { width: 100%; padding: 10px 15px 10px 40px; border-radius: 10px; border: 1px solid var(--border); font-family: inherit; font-size: 14px; transition: all 0.2s; }
//                .search-input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
//                .results-count { font-size: 13px; color: var(--text-muted); font-weight: 500; }
//
//                .modern-table { width: 100%; border-collapse: collapse; }
//                .modern-table th { background: #f8fafc; padding: 16px 32px; text-align: left; font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
//                .modern-table td { padding: 18px 32px; border-bottom: 1px solid var(--border); font-size: 14px; }
//
//                .status-pill {
//                    display: inline-flex; align-items: center; padding: 4px 12px; border-radius: 8px;
//                    font-size: 11px; font-weight: 700; background: color-mix(in srgb, var(--color), white 88%);
//                    color: var(--color); border: 1px solid color-mix(in srgb, var(--color), white 75%);
//                }
//
//                .text-center { text-align: center; }
//                .duration-tag { background: #f1f5f9; padding: 5px 10px; border-radius: 6px; color: var(--text-main); font-weight: 600; font-family: 'JetBrains Mono', monospace; }
//                .empty-search { text-align: center; padding: 40px !important; color: var(--text-muted); font-style: italic; }
//
//                .loader-container { height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; }
//                .spinner { width: 30px; height: 30px; border: 3px solid #e2e8f0; border-top: 3px solid var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 16px; }
//                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
//            `}</style>
//        </div>
//    );
//}
//
//export default TripHistoryPage;


import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import DriverGanttChart from "./DriverGanttChart";

// Restored Modern SaaS Color Palette with DRIVER_BREAK added
const STATUS_COLORS = {
    ASSIGNED: "#64748b",
    ACKNOWLEDGED: "#3b82f6",
    LOADING_STARTED: "#f59e0b",
    LOADING_COMPLETED: "#10b981",
    IN_TRANSIT: "#8b5cf6",
    REACHED_DESTINATION: "#06b6d4",
    UNLOADING_STARTED: "#f97316",
    UNLOADING_COMPLETED: "#22c55e",
    RETURN_JOURNEY_STARTED: "#ec4899",
    RETURN_JOURNEY_COMPLETED: "#111827",
    DRIVER_BREAK: "#ef4444",
};

function TripHistoryPage() {
    const { tripId } = useParams();
    const [history, setHistory] = useState([]);
    const [breakData, setBreakData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isChartOpen, setIsChartOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const API_BASE = "http://localhost:8080/api";

    useEffect(() => {
        const fetchAllHistory = async () => {
            try {
                // Only fetching milestones and breaks (Cancelled trips excluded)
                const [historyRes, breaksRes] = await Promise.all([
                    axios.get(`${API_BASE}/vehicle-activity/history/${tripId}`),
                    axios.get(`${API_BASE}/driver-break/history/${tripId}`)
                ]);

                setHistory(historyRes.data || []);
                setBreakData(breaksRes.data || []);
            } catch (e) {
                console.error("Failed to fetch consolidated history", e);
            } finally {
                setLoading(false);
            }
        };
        fetchAllHistory();
    }, [tripId]);

    // Format and Merge data for the Gantt Chart and Table
    const mergedTimeline = useMemo(() => {
        // 1. Transform Breaks to match history structure
        const formattedBreaks = breakData.map(b => ({
            eventTime: b.breakStart,
            status: "DRIVER_BREAK",
            breakEnd: b.breakEnd,
            reason: b.reason,
            isBreak: true
        }));

        // 2. Combine history and breaks - NO cancellation events added here
        const combined = [...history, ...formattedBreaks].sort(
            (a, b) => new Date(a.eventTime) - new Date(b.eventTime)
        );

        let totalBreakTime = 0;

        // 3. Process data for table display (durations)
        const processed = combined.map((item, index) => {
            const startTime = new Date(item.eventTime).getTime();
            const nextItem = combined[index + 1];

            let duration = 0;
            if (item.status === "DRIVER_BREAK" && item.breakEnd) {
                duration = (new Date(item.breakEnd).getTime() - startTime) / (1000 * 60);
                totalBreakTime += duration;
            } else if (nextItem) {
                duration = (new Date(nextItem.eventTime).getTime() - startTime) / (1000 * 60);
            }

            return {
                ...item,
                durationFormatted: duration > 0 ? duration.toFixed(1) : 'N/A'
            };
        });

        return { processed, totalBreakTime };
    }, [history, breakData]);

    // Data for the Gantt Chart
    const formattedChartData = useMemo(() => {
        return mergedTimeline.processed.map((item, index) => {
            const nextItem = mergedTimeline.processed[index + 1];
            return {
                status: item.status,
                start: item.eventTime,
                end: item.breakEnd || (nextItem ? nextItem.eventTime : new Date(new Date(item.eventTime).getTime() + 15 * 60000).toISOString())
            };
        });
    }, [mergedTimeline]);

    // Data for the Table (Filtered by Search)
    const tableData = useMemo(() => {
        if (!searchQuery) return mergedTimeline.processed;
        return mergedTimeline.processed.filter(item =>
            item.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.reason && item.reason.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [mergedTimeline, searchQuery]);

    if (loading) return (
        <div className="loader-container">
            <div className="spinner"></div>
            <p>Syncing Fleet Records...</p>
        </div>
    );

    return (
        <div className="trip-history-page">
            <header className="page-header">
                <div className="header-content">
                    <div className="title-group">
                        <span className="badge">REAL-TIME MONITORING</span>
                        <h1>Trip Analytics <span className="text-thin"># {tripId}</span></h1>
                    </div>
                    <button className="view-chart-btn" onClick={() => setIsChartOpen(true)}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
                        View Gantt Timeline
                    </button>
                </div>
            </header>

            <main className="content-container">
                <div className="stats-grid">
                    <div className="stat-card">
                        <label>Live Status</label>
                        <div className="stat-value" style={{ color: STATUS_COLORS[history[history.length - 1]?.status] || "#000" }}>
                            {history[history.length - 1]?.status?.replace(/_/g, ' ') || "N/A"}
                        </div>
                    </div>
                    <div className="stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
                        <label>Driver Rest Time</label>
                        <div className="stat-value" style={{ color: '#ef4444' }}>
                            {Math.round(mergedTimeline.totalBreakTime)} <small>min</small>
                        </div>
                    </div>
                    <div className="stat-card">
                        <label>Total Milestones</label>
                        <div className="stat-value">{history.length}</div>
                    </div>
                </div>

                <div className="table-wrapper">
                    <div className="table-controls">
                        <div className="search-container">
                            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                            <input
                                type="text"
                                placeholder="Search records..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input"
                            />
                        </div>
                        <p className="results-count">Showing {tableData.length} entries</p>
                    </div>

                    <table className="modern-table">
                        <thead>
                        <tr>
                            <th>Event Status</th>
                            <th>Timestamp</th>
                            <th>Note/Reason</th>
                            <th className="text-center">Duration</th>
                        </tr>
                        </thead>
                        <tbody>
                        {tableData.length > 0 ? tableData.map((record, idx) => {
                            const dateObj = new Date(record.eventTime);
                            const isBreak = record.status === "DRIVER_BREAK";
                            return (
                                <tr key={idx} style={isBreak ? { backgroundColor: '#fff1f2' } : {}}>
                                    <td>
                                        <div className="status-pill" style={{ '--color': STATUS_COLORS[record.status] || '#64748b' }}>
                                            {record.status.replace(/_/g, ' ')}
                                        </div>
                                    </td>
                                    <td className="text-dark">
                                        <div style={{ fontSize: '11px', color: '#64748b' }}>{dateObj.toLocaleDateString()}</div>
                                        {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </td>
                                    <td className="text-muted" style={{ fontStyle: 'italic' }}>
                                        {record.reason || (isBreak ? "Break started" : "—")}
                                    </td>
                                    <td className="text-center">
                                        {record.durationFormatted !== 'N/A' ? (
                                            <span className="duration-tag">{record.durationFormatted} <small>min</small></span>
                                        ) : <span className="text-muted">—</span>}
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan="4" className="empty-search">No records matching "{searchQuery}"</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </main>

            <DriverGanttChart
                tasksData={formattedChartData}
                isOpen={isChartOpen}
                onClose={() => setIsChartOpen(false)}
            />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono&display=swap');

                :root {
                    --bg: #f8fafc;
                    --primary: #2563eb;
                    --text-main: #0f172a;
                    --text-muted: #64748b;
                    --border: #e2e8f0;
                }

                .trip-history-page { padding: 40px 5%; font-family: 'Inter', sans-serif; background: var(--bg); min-height: 100vh; color: var(--text-main); }
                .page-header { margin-bottom: 40px; }
                .header-content { display: flex; justify-content: space-between; align-items: flex-end; }
                .badge { font-size: 10px; font-weight: 800; letter-spacing: 1.5px; color: var(--primary); background: #dbeafe; padding: 4px 10px; border-radius: 20px; margin-bottom: 8px; display: inline-block; }
                h1 { margin: 0; font-size: 2.25rem; font-weight: 800; letter-spacing: -1px; }
                .text-thin { font-weight: 300; color: var(--text-muted); }

                .view-chart-btn {
                    background: var(--text-main); color: white; border: none; padding: 12px 24px; border-radius: 12px;
                    font-weight: 600; cursor: pointer; transition: all 0.3s ease;
                    display: flex; align-items: center; gap: 10px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
                }
                .view-chart-btn:hover { transform: translateY(-2px); background: #1e293b; }

                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
                .stat-card { background: white; padding: 24px; border-radius: 16px; border: 1px solid var(--border); box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
                .stat-card label { font-size: 12px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
                .stat-value { font-size: 1.5rem; font-weight: 700; margin-top: 8px; }

                .table-wrapper { background: white; border-radius: 20px; border: 1px solid var(--border); overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
                .table-controls { padding: 20px 32px; display: flex; justify-content: space-between; align-items: center; background: #fff; border-bottom: 1px solid var(--border); }

                .search-container { position: relative; width: 350px; }
                .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
                .search-input { width: 100%; padding: 10px 15px 10px 40px; border-radius: 10px; border: 1px solid var(--border); font-family: inherit; font-size: 14px; transition: all 0.2s; }
                .search-input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
                .results-count { font-size: 13px; color: var(--text-muted); font-weight: 500; }

                .modern-table { width: 100%; border-collapse: collapse; }
                .modern-table th { background: #f8fafc; padding: 16px 32px; text-align: left; font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
                .modern-table td { padding: 18px 32px; border-bottom: 1px solid var(--border); font-size: 14px; }

                .status-pill {
                    display: inline-flex; align-items: center; padding: 4px 12px; border-radius: 8px;
                    font-size: 11px; font-weight: 700; background: color-mix(in srgb, var(--color), white 88%);
                    color: var(--color); border: 1px solid color-mix(in srgb, var(--color), white 75%);
                }

                .text-center { text-align: center; }
                .duration-tag { background: #f1f5f9; padding: 5px 10px; border-radius: 6px; color: var(--text-main); font-weight: 600; font-family: 'JetBrains Mono', monospace; }
                .empty-search { text-align: center; padding: 40px !important; color: var(--text-muted); font-style: italic; }

                .loader-container { height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; }
                .spinner { width: 30px; height: 30px; border: 3px solid #e2e8f0; border-top: 3px solid var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 16px; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}

export default TripHistoryPage;