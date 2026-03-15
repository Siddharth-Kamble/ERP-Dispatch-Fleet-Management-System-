//
//
//
//
//    import React from "react";
//    import { Chart } from "react-google-charts";
//
//    /**
//     * DriverGanttChart.js
//     * Features:
//     * - Waterfall Flow: Automatically snaps each task start to the previous task end.
//     * - Dynamic Labels: Displays status and segment duration directly on the bar.
//     * - Total Trip Summary: Displays total elapsed time in the footer.
//     * - Modern UI: Includes backdrop blur, glassmorphism, and Inter-based typography.
//     */
//
//    // Modern SaaS Color Palette
//    const STATUS_COLORS = {
//        ASSIGNED: "#3b82f6",     // Blue
//        ACKNOWLEDGED: "#6366f1", // Indigo
//        LOADING: "#f59e0b",      // Amber
//        IN_TRANSIT: "#8b5cf6",   // Violet
//        DELAYED: "#ef4444",      // Red
//        COMPLETED: "#10b981",    // Emerald
//    };
//
//    // Helper: Formats duration in milliseconds to "Xh Ym" or "Ym"
//    const formatDuration = (ms) => {
//        if (ms <= 0) return "0m";
//        const mins = Math.floor(ms / (1000 * 60));
//        const hrs = Math.floor(mins / 60);
//        const remainingMins = mins % 60;
//        return hrs > 0 ? `${hrs}h ${remainingMins}m` : `${remainingMins}m`;
//    };
//
//    const DriverGanttChart = ({ tasksData, isOpen, onClose }) => {
//        if (!isOpen || !tasksData || tasksData.length === 0) return null;
//
//        // Tracker to force the "Waterfall" sequence
//        let sequenceTracker = null;
//        const firstStartTime = new Date(tasksData[0].start);
//
//        // 1. Columns Definition
//        const columns = [
//            { type: "string", label: "Task ID" },
//            { type: "string", label: "Task Name" },
//            { type: "string", label: "Resource" },
//            { type: "date", label: "Start Date" },
//            { type: "date", label: "End Date" },
//            { type: "number", label: "Duration" },
//            { type: "number", label: "Percent Complete" },
//            { type: "string", label: "Dependencies" },
//        ];
//
//        // 2. Data Mapping with Continuity Logic
//        const rows = tasksData.map((task, index) => {
//            let rawStart = new Date(task.start);
//            let rawEnd = new Date(task.end);
//            let start = rawStart;
//            let end = rawEnd;
//
//            // --- SNAP TO PREVIOUS END (WATERFALL LOGIC) ---
//            if (sequenceTracker) {
//                const originalDurationMs = rawEnd.getTime() - rawStart.getTime();
//                start = sequenceTracker;
//                // Ensure a minimum 15-minute bar if the duration is zero or invalid
//                const duration = originalDurationMs > 0 ? originalDurationMs : 15 * 60 * 1000;
//                end = new Date(start.getTime() + duration);
//            }
//
//            // Update tracker for the next iteration
//            sequenceTracker = end;
//
//            const durationLabel = formatDuration(end.getTime() - start.getTime());
//
//            return [
//                `ID-${index}`,
//                `${task.status} (${durationLabel})`, // Inline Label
//                task.status,                        // Resource ID for palette
//                start,
//                end,
//                null,                               // Auto-calculate duration
//                100,                                // Full progress
//                null,                               // No arrows
//            ];
//        });
//
//        // Calculate total trip duration from start of first task to end of last task
//        const totalTripMs = sequenceTracker.getTime() - firstStartTime.getTime();
//        const data = [columns, ...rows];
//
//        // 3. Chart Options
//        const options = {
//            height: tasksData.length * 50 + 80,
//            gantt: {
//                trackHeight: 45,
//                barHeight: 32,
//                criticalPathEnabled: false,
//                innerGridHorizLine: { stroke: "#e2e8f0", strokeWidth: 1 },
//                innerGridTrack: { fill: "#f8fafc" },
//                innerGridDarkTrack: { fill: "#ffffff" },
//                labelStyle: {
//                    fontName: "Inter, sans-serif",
//                    fontSize: 12,
//                    color: "#475569",
//                },
//                palette: Object.keys(STATUS_COLORS).map(status => ({
//                    color: STATUS_COLORS[status],
//                    dark: STATUS_COLORS[status],
//                    light: STATUS_COLORS[status]
//                }))
//            },
//        };
//
//        return (
//            <div style={styles.overlay} onClick={onClose}>
//                <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
//                    <div style={styles.header}>
//                        <div>
//                            <h2 style={styles.title}>Trip Execution Timeline</h2>
//                            <p style={styles.subtitle}>Sequential Activity Log | Fleet ID: #8821</p>
//                        </div>
//                        <button style={styles.closeX} onClick={onClose}>&times;</button>
//                    </div>
//
//                    <div style={styles.chartContainer}>
//                        <Chart
//                            chartType="Gantt"
//                            width="100%"
//                            height="100%"
//                            data={data}
//                            options={options}
//                            loader={<div style={styles.loader}>Generating Timeline Analytics...</div>}
//                        />
//                    </div>
//
//                    {/* Status Legend */}
//                    <div style={styles.legendContainer}>
//                        {Object.entries(STATUS_COLORS).map(([status, color]) => (
//                            <div key={status} style={styles.legendItem}>
//                                <span style={{ ...styles.dot, backgroundColor: color }} />
//                                <span style={styles.legendText}>{status}</span>
//                            </div>
//                        ))}
//                    </div>
//
//                    {/* Summary Footer */}
//                    <div style={styles.footer}>
//                        <div style={styles.totalBox}>
//                            <span style={styles.totalLabel}>TOTAL TRIP TIME</span>
//                            <span style={styles.totalValue}>{formatDuration(totalTripMs)}</span>
//                        </div>
//                        <button style={styles.closeBtn} onClick={onClose}>Close Dashboard</button>
//                    </div>
//                </div>
//            </div>
//        );
//    };
//
//    // --- Professional Styling ---
//    const styles = {
//        overlay: {
//            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
//            backgroundColor: "rgba(15, 23, 42, 0.85)", display: "flex",
//            justifyContent: "center", alignItems: "center", zIndex: 1000,
//            backdropFilter: "blur(8px)", padding: "20px"
//        },
//        modal: {
//            backgroundColor: "#ffffff", borderRadius: "24px", width: "100%", maxWidth: "1000px",
//            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.3)", overflow: "hidden"
//        },
//        header: {
//            padding: "24px 32px", borderBottom: "1px solid #f1f5f9",
//            display: "flex", justifyContent: "space-between", alignItems: "center"
//        },
//        title: { margin: 0, fontSize: "1.25rem", fontWeight: "800", color: "#0f172a" },
//        subtitle: { margin: "2px 0 0 0", fontSize: "0.85rem", color: "#64748b" },
//        closeX: { background: "none", border: "none", fontSize: "32px", cursor: "pointer", color: "#cbd5e1" },
//        chartContainer: { padding: "32px", minHeight: "300px", overflowX: "auto" },
//        loader: { padding: "100px", textAlign: "center", color: "#94a3b8" },
//        legendContainer: { display: "flex", gap: "20px", padding: "0 32px 32px", flexWrap: "wrap" },
//        legendItem: { display: "flex", alignItems: "center", gap: "8px" },
//        dot: { width: "10px", height: "10px", borderRadius: "50%" },
//        legendText: { fontSize: "0.7rem", fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" },
//        footer: {
//            padding: "20px 32px", backgroundColor: "#f8fafc", textAlign: "right",
//            borderTop: "1px solid #f1f5f9", display: 'flex', justifyContent: 'space-between', alignItems: 'center'
//        },
//        totalBox: { display: 'flex', flexDirection: 'column', textAlign: 'left' },
//        totalLabel: { fontSize: '0.65rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '1px' },
//        totalValue: { fontSize: '1.25rem', fontWeight: '800', color: '#1e293b' },
//        closeBtn: {
//            backgroundColor: "#0f172a", color: "white", padding: "12px 28px", borderRadius: "10px",
//            border: "none", fontWeight: "600", cursor: "pointer", transition: "all 0.2s"
//        }
//    };
//
//    export default DriverGanttChart;


import React from "react";
import { Chart } from "react-google-charts";

/**
 * Updated DriverGanttChart.js
 * - Added DRIVER_BREAK color mapping.
 * - Maintained existing Waterfall sequence and functionality.
 */

// Modern SaaS Color Palette - Added DRIVER_BREAK
const STATUS_COLORS = {
    ASSIGNED: "#3b82f6",     // Blue
    ACKNOWLEDGED: "#6366f1", // Indigo
    LOADING_STARTED: "#f59e0b", // Amber (Matching your history status)
    LOADING_COMPLETED: "#10b981", // Emerald
    IN_TRANSIT: "#8b5cf6",   // Violet
    DRIVER_BREAK: "#ef4444", // Red - Added for Break Requirement
    REACHED_DESTINATION: "#06b6d4",
    UNLOADING_STARTED: "#f97316",
    UNLOADING_COMPLETED: "#22c55e",
    RETURN_JOURNEY_COMPLETED: "#111827",
};

// Helper: Formats duration in milliseconds to "Xh Ym" or "Ym"
const formatDuration = (ms) => {
    if (ms <= 0) return "0m";
    const mins = Math.floor(ms / (1000 * 60));
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return hrs > 0 ? `${hrs}h ${remainingMins}m` : `${remainingMins}m`;
};

const DriverGanttChart = ({ tasksData, isOpen, onClose }) => {
    if (!isOpen || !tasksData || tasksData.length === 0) return null;

    // Tracker to force the "Waterfall" sequence (Functionality Unchanged)
    let sequenceTracker = null;
    const firstStartTime = new Date(tasksData[0].start);

    // 1. Columns Definition
    const columns = [
        { type: "string", label: "Task ID" },
        { type: "string", label: "Task Name" },
        { type: "string", label: "Resource" },
        { type: "date", label: "Start Date" },
        { type: "date", label: "End Date" },
        { type: "number", label: "Duration" },
        { type: "number", label: "Percent Complete" },
        { type: "string", label: "Dependencies" },
    ];

    // 2. Data Mapping with Continuity Logic (Waterflow Logic preserved)
    const rows = tasksData.map((task, index) => {
        let rawStart = new Date(task.start);
        let rawEnd = new Date(task.end);
        let start = rawStart;
        let end = rawEnd;

        // --- SNAP TO PREVIOUS END (WATERFALL LOGIC) ---
        if (sequenceTracker) {
            const originalDurationMs = rawEnd.getTime() - rawStart.getTime();
            start = sequenceTracker;
            const duration = originalDurationMs > 0 ? originalDurationMs : 15 * 60 * 1000;
            end = new Date(start.getTime() + duration);
        }

        sequenceTracker = end;
        const durationLabel = formatDuration(end.getTime() - start.getTime());

        return [
            `ID-${index}`,
            `${task.status.replace(/_/g, ' ')} (${durationLabel})`,
            task.status,
            start,
            end,
            null,
            100,
            null,
        ];
    });

    const totalTripMs = sequenceTracker.getTime() - firstStartTime.getTime();
    const data = [columns, ...rows];

    // 3. Chart Options
    const options = {
        height: tasksData.length * 50 + 100, // Adjusted height for more entries
        gantt: {
            trackHeight: 45,
            barHeight: 32,
            criticalPathEnabled: false,
            innerGridHorizLine: { stroke: "#e2e8f0", strokeWidth: 1 },
            innerGridTrack: { fill: "#f8fafc" },
            innerGridDarkTrack: { fill: "#ffffff" },
            labelStyle: {
                fontName: "Inter, sans-serif",
                fontSize: 11,
                color: "#475569",
            },
            // The palette uses the resource name (task.status) to match colors
            palette: Object.keys(STATUS_COLORS).map(status => ({
                color: STATUS_COLORS[status],
                dark: STATUS_COLORS[status],
                light: STATUS_COLORS[status]
            }))
        },
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div style={styles.header}>
                    <div>
                        <h2 style={styles.title}>Trip Execution Timeline</h2>
                        <p style={styles.subtitle}>Sequential Activity & Break Log</p>
                    </div>
                    <button style={styles.closeX} onClick={onClose}>&times;</button>
                </div>

                <div style={styles.chartContainer}>
                    <Chart
                        chartType="Gantt"
                        width="100%"
                        height="100%"
                        data={data}
                        options={options}
                        loader={<div style={styles.loader}>Generating Timeline Analytics...</div>}
                    />
                </div>

                {/* Status Legend - Now includes Breaks */}
                <div style={styles.legendContainer}>
                    {Object.entries(STATUS_COLORS).map(([status, color]) => (
                        <div key={status} style={styles.legendItem}>
                            <span style={{ ...styles.dot, backgroundColor: color }} />
                            <span style={styles.legendText}>{status.replace(/_/g, ' ')}</span>
                        </div>
                    ))}
                </div>

                <div style={styles.footer}>
                    <div style={styles.totalBox}>
                        <span style={styles.totalLabel}>TOTAL ELAPSED TIME</span>
                        <span style={styles.totalValue}>{formatDuration(totalTripMs)}</span>
                    </div>
                    <button style={styles.closeBtn} onClick={onClose}>Close Dashboard</button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.85)", display: "flex",
        justifyContent: "center", alignItems: "center", zIndex: 1000,
        backdropFilter: "blur(8px)", padding: "20px"
    },
    modal: {
        backgroundColor: "#ffffff", borderRadius: "24px", width: "100%", maxWidth: "1100px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.3)", overflow: "hidden",
        maxHeight: "90vh", display: 'flex', flexDirection: 'column'
    },
    header: {
        padding: "24px 32px", borderBottom: "1px solid #f1f5f9",
        display: "flex", justifyBetween: "space-between", alignItems: "center"
    },
    title: { margin: 0, fontSize: "1.25rem", fontWeight: "800", color: "#0f172a" },
    subtitle: { margin: "2px 0 0 0", fontSize: "0.85rem", color: "#64748b" },
    closeX: { background: "none", border: "none", fontSize: "32px", cursor: "pointer", color: "#cbd5e1" },
    chartContainer: { padding: "32px", overflowY: "auto", flex: 1 },
    loader: { padding: "100px", textAlign: "center", color: "#94a3b8" },
    legendContainer: { display: "flex", gap: "15px", padding: "0 32px 24px", flexWrap: "wrap", justifyContent: 'center' },
    legendItem: { display: "flex", alignItems: "center", gap: "6px" },
    dot: { width: "8px", height: "8px", borderRadius: "50%" },
    legendText: { fontSize: "0.65rem", fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" },
    footer: {
        padding: "20px 32px", backgroundColor: "#f8fafc", textAlign: "right",
        borderTop: "1px solid #f1f5f9", display: 'flex', justifyContent: 'space-between', alignItems: 'center'
    },
    totalBox: { display: 'flex', flexDirection: 'column', textAlign: 'left' },
    totalLabel: { fontSize: '0.65rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '1px' },
    totalValue: { fontSize: '1.25rem', fontWeight: '800', color: '#1e293b' },
    closeBtn: {
        backgroundColor: "#0f172a", color: "white", padding: "12px 28px", borderRadius: "10px",
        border: "none", fontWeight: "600", cursor: "pointer", transition: "all 0.2s"
    }
};

export default DriverGanttChart;