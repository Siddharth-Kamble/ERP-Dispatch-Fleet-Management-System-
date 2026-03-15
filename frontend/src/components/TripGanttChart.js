import React from "react";
import Chart from "react-apexcharts";

const TripGanttChart = ({ trip }) => {

    const safe = (d) => d ? new Date(d) : null;

    const loadingStart = safe(trip.loadingStartedAt);
    const loadingEnd = safe(trip.loadingCompletedAt);

    const transitStart = safe(trip.inTransitAt);
    const transitEnd = safe(trip.reachedDestinationAt);

    const unloadingStart = safe(trip.unloadingStartedAt);
    const unloadingEnd = safe(trip.unloadingCompletedAt);

    const returnStart = safe(trip.returnJourneyStartedAt);
    const returnEnd = safe(trip.returnJourneyCompletedAt);

    const rows = [];

    if (loadingStart && loadingEnd)
        rows.push(["Loading", "Loading", loadingStart, loadingEnd, null, 100, null]);

    if (transitStart && transitEnd)
        rows.push(["Transit", "In Transit", transitStart, transitEnd, null, 100, null]);

    if (unloadingStart && unloadingEnd)
        rows.push(["Unloading", "Unloading", unloadingStart, unloadingEnd, null, 100, null]);

    if (returnStart && returnEnd)
        rows.push(["Return", "Return Journey", returnStart, returnEnd, null, 100, null]);

    if (rows.length === 0) return null;

    const data = [
        [
            { type: "string", label: "Task ID" },
            { type: "string", label: "Task Name" },
            { type: "date", label: "Start Date" },
            { type: "date", label: "End Date" },
            { type: "number", label: "Duration" },
            { type: "number", label: "Percent Complete" },
            { type: "string", label: "Dependencies" },
        ],
        ...rows
    ];

    /* 🔥 CALCULATE TOTAL ACTIVE TIME */
    const allTimes = rows.flatMap(r => [r[2], r[3]]);
    const minTime = new Date(Math.min(...allTimes));
    const maxTime = new Date(Math.max(...allTimes));

    const totalMinutes = Math.floor((maxTime - minTime) / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return (
        <div>
            <Chart
                chartType="Gantt"
                width="100%"
                height="300px"
                data={data}
                options={{
                    gantt: {
                        trackHeight: 40
                    }
                }}
            />

            <p style={{ marginTop: 10, fontWeight: "bold" }}>
                🚛 Vehicle Active Time: {hours}h {minutes}m
            </p>
        </div>
    );
};