import { useEffect, useState } from "react";
import vehicleService from "../../Services/vehicleService";
import driverService from "../../Services/driverService";

function VehicleForm({ reloadVehicles }) {
    const user = JSON.parse(localStorage.getItem("user"));

    const [drivers, setDrivers] = useState([]);

    const [form, setForm] = useState({
        type: "",
        vehicleNumber: "",
        driverId: "",
    });

    // ================= LOAD DRIVERS =================
    useEffect(() => {
        const loadDrivers = async () => {
            try {
                const data = await driverService.getAll(user?.eCode);
                setDrivers(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Failed to load drivers:", err);
                setDrivers([]);
            }
        };

        if (user?.eCode) loadDrivers();
    }, [user?.eCode]);

    // ================= INPUT CHANGE =================
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // ================= SUBMIT =================
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.type || !form.vehicleNumber || !form.driverId) {
            alert("Please fill all fields");
            return;
        }

        try {
            await vehicleService.create(
                user.eCode,
                form.driverId,
                {
                    type: form.type,
                    vehicleNumber: form.vehicleNumber,
                }
            );

            // reset form
            setForm({
                type: "",
                vehicleNumber: "",
                driverId: "",
            });

            // reload parent list
            reloadVehicles();
        } catch (err) {
            console.error("Failed to save vehicle:", err);
            alert("Error saving vehicle");
        }
    };

    return (
        <div style={page}>
            <div style={card}>
                <h2 style={title}>Add New Vehicle</h2>

                <form onSubmit={handleSubmit}>
                    {/* Vehicle Type */}
                    <div style={formRow}>
                        <label style={label}>Vehicle Type</label>
                        <select
                            name="type"
                            value={form.type}
                            onChange={handleChange}
                            style={input}
                            required
                        >
                            <option value="">Select Type</option>
                            <option value="Truck">Truck</option>
                            <option value="Bus">Bus</option>
                            <option value="Car">Car</option>
                        </select>
                    </div>

                    {/* Vehicle Number */}
                    <div style={formRow}>
                        <label style={label}>Vehicle Number (Req No)</label>
                        <input
                            name="vehicleNumber"
                            value={form.vehicleNumber}
                            onChange={handleChange}
                            style={input}
                            placeholder="Enter vehicle number"
                            required
                        />
                    </div>

                    {/* Driver */}
                    <div style={formRow}>
                        <label style={label}>Driver</label>
                        <select
                            name="driverId"
                            value={form.driverId}
                            onChange={handleChange}
                            style={input}
                            required
                        >
                            <option value="">Select Driver</option>
                            {drivers.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Submit */}
                    <button type="submit" style={saveBtn}>
                        Save Vehicle
                    </button>
                </form>
            </div>
        </div>
    );
}

export default VehicleForm;

//
// ================= STYLES =================
//

const page = {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingTop: "40px",
};

const card = {
    width: "420px",
    background: "#ffffff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
};

const title = {
    marginBottom: "20px",
    color: "#1f2937",
};

const formRow = {
    display: "flex",
    flexDirection: "column",
    marginBottom: "15px",
};

const label = {
    marginBottom: "6px",
    fontWeight: "500",
    color: "#374151",
};

const input = {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
};

const saveBtn = {
    width: "100%",
    padding: "12px",
    marginTop: "10px",
    border: "none",
    borderRadius: "8px",
    background: "#10b981",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
};
