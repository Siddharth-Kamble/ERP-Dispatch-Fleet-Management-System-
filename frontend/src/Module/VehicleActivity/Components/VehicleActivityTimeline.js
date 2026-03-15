import React from "react";
import { Chart } from "react-google-charts";

function VehicleActivityTimeline({ activities }) {
    // Prepare data for timeline chart
    const data = [
        [
            { type: "string", label: "ID" },
            { type: "string", label: "Activity" },
            { type: "date", label: "Start" },
            { type: "date", label: "End" },
        ],

        // Convert activities → chart rows
        ...activities
            .filter((a) => a.outTime) // only completed activities
            .map((a) => [
                a.id.toString(),
                a.activityType,
                new Date(a.inTime),
                new Date(a.outTime),
            ]),
    ];

    return (
        <div style={{ marginTop: "30px" }}>
            <h3>Vehicle Activity Timeline</h3>

            <Chart
                chartType="Timeline"
                width="100%"
                height="300px"
                data={data}
            />
        </div>
    );
}

export default VehicleActivityTimeline;
