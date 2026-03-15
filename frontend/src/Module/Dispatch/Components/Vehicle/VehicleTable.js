import React from "react";

function VehicleTable({ vehicles, setEditVehicle, onVehicleClick }) {

    return (
        <div style={{ background: "white", padding: "20px" }}>
            <h4>Vehicle List</h4>

            <table border="1" width="100%" cellPadding="10">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Vehicle Number</th>
                    <th>Driver</th>
                    <th>KM</th>
                    <th>Distance</th>
                    <th>Action</th>
                </tr>
                </thead>

                <tbody>
                {vehicles.map((v) => (
                    <tr key={v.id}>
                        <td>{v.id}</td>

                        {/* CLICKABLE VEHICLE NAME */}
                        <td
                            style={{
                                cursor: "pointer",
                                color: "blue",
                                textDecoration: "underline"
                            }}
                            onClick={() => onVehicleClick(v)}
                        >
                            {v.vehicleNumber}
                        </td>

                        <td>{v.driverName}</td>
                        <td>{v.kmReading}</td>
                        <td>{v.distance}</td>

                        <td>
                            <button onClick={() => setEditVehicle(v)}>
                                Edit
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default VehicleTable;
