import React, { useEffect, useRef } from "react";

function VehicleActivityGantt({ activities }) {
    const chartRef = useRef(null);

    useEffect(() => {
        if (!window.google || !activities.length) return;

        window.google.charts.load("current", { packages: ["timeline"] });

        window.google.charts.setOnLoadCallback(() => {
            const container = chartRef.current;
            const chart = new window.google.visualization.Timeline(container);

            const dataTable = new window.google.visualization.DataTable();
            dataTable.addColumn({ type: "string", id: "Activity" });
            dataTable.addColumn({ type: "string", id: "Location" });
            dataTable.addColumn({ type: "date", id: "Start" });
            dataTable.addColumn({ type: "date", id: "End" });

            const rows = activities
                .filter((a) => a.outTime)
                .map((a) => [
                    a.activityType,
                    a.location || "",
                    new Date(a.inTime),
                    new Date(a.outTime),
                ]);

            dataTable.addRows(rows);

            chart.draw(dataTable);
        });
    }, [activities]);

    return <div ref={chartRef} style={{ height: "300px" }} />;
}

export default VehicleActivityGantt;
