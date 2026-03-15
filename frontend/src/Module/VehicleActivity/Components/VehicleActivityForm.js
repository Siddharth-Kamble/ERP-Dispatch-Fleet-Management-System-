import React, { useState } from "react";
import vehicleActivityService from "../Services/vehicleActivityService";

function VehicleActivityForm({ vehicleId, reload }) {
    // form state (stores input values)
    const [form, setForm] = useState({
        activityType: "",
        location: "",
        distance: "",
        details: "",
    });

    // handle input change
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // handle submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        // call backend API
        await vehicleActivityService.addActivity(vehicleId, form);

        // clear form after save
        setForm({
            activityType: "",
            location: "",
            distance: "",
            details: "",
        });

        // reload activity list
        reload();
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3>Add Vehicle Activity</h3>

            <input
                name="activityType"
                placeholder="Activity Type (Loading / Moving / Unloading)"
                value={form.activityType}
                onChange={handleChange}
                required
            />

            <br /><br />

            <input
                name="location"
                placeholder="Location"
                value={form.location}
                onChange={handleChange}
            />

            <br /><br />

            <input
                name="distance"
                placeholder="Distance (km)"
                value={form.distance}
                onChange={handleChange}
            />

            <br /><br />

            <input
                name="details"
                placeholder="Details"
                value={form.details}
                onChange={handleChange}
            />

            <br /><br />

            <button type="submit">Save Activity</button>
        </form>
    );
}

export default VehicleActivityForm;
