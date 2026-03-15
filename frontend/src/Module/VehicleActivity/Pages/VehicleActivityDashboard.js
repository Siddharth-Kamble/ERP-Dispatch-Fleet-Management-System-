import React, { useEffect, useState } from "react";
import VehicleActivityForm from "../Components/VehicleActivityForm";
import VehicleActivityTable from "../Components/VehicleActivityTable";
import VehicleActivityTimeline from "../Components/VehicleActivityTimeline";
import VehicleMap from "../Components/VehicleMap";
import vehicleActivityService from "../Services/vehicleActivityService";

function VehicleActivityDashboard() {
    const vehicleId = 1;
    const [activities, setActivities] = useState([]);

    const loadActivities = async () => {
        try {
            const data = await vehicleActivityService.getByVehicle(vehicleId);
            setActivities(data || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        loadActivities();
    }, []);

    return (
        <div style={{ padding: "20px" }}>
            {/* 🔴 FORCE MAP AT VERY TOP */}
            <div style={{ border: "3px solid red", marginBottom: "20px" }}>
                <VehicleMap activities={activities} />
            </div>

            <h2>Vehicle Activity Dashboard</h2>

            <VehicleActivityForm vehicleId={vehicleId} reload={loadActivities} />
            <br />

            <VehicleActivityTable activities={activities} reload={loadActivities} />
            <br />

            <VehicleActivityTimeline activities={activities} />
        </div>
    );
}

export default VehicleActivityDashboard;
