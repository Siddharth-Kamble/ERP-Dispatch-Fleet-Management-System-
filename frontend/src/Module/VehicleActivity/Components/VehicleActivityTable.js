import React from "react";
import vehicleActivityService from "../Services/vehicleActivityService";

function VehicleActivityTable({ activities, reload }) {

    const handleSetOut = async (id) => {
        await vehicleActivityService.setOutTime(id);
        if (reload) reload();   // ⭐ safe call
    };

    const handleDelete = async (id) => {
        await vehicleActivityService.deleteActivity(id);
        if (reload) reload();   // ⭐ safe call
    };

    return (
        <div>
            <h3>Vehicle Activity List</h3>

            <table border="1" width="100%">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Location</th>
                    <th>Distance</th>
                    <th>In Time</th>
                    <th>Out Time</th>
                    <th>Actions</th>
                </tr>
                </thead>

                <tbody>
                {activities.map((a) => (
                    <tr key={a.id}>
                        <td>{a.id}</td>
                        <td>{a.activityType}</td>
                        <td>{a.location}</td>
                        <td>{a.distance}</td>
                        <td>{a.inTime}</td>
                        <td>{a.outTime || "—"}</td>
                        <td>
                            <button onClick={() => handleSetOut(a.id)}>
                                Set Out-Time
                            </button>
                            <button onClick={() => handleDelete(a.id)}>
                                Delete
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default VehicleActivityTable;
