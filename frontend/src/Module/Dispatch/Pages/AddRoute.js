

import { useEffect, useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import vehicleService from "../Services/vehicleService";
import driverService from "../Services/driverService";
import { FaPlus, FaTrash, FaRoute, FaPrint, FaTimes, FaSave } from "react-icons/fa";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function MapController({ onMapClick }) {
    useMapEvents({ click: (e) => onMapClick(e.latlng) });
    return null;
}

function AddRoute() {

    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);

    const [selectedVehicle, setSelectedVehicle] = useState("");
    const [selectedDriverId, setSelectedDriverId] = useState("");
    const [selectedDriverName, setSelectedDriverName] = useState("");

    const [points, setPoints] = useState(["", ""]);
    const [pointCoords, setPointCoords] = useState([null, null]);

    const [activePointIndex, setActivePointIndex] = useState(0);
    const [totalDistance, setTotalDistance] = useState(0);

    const [showModal, setShowModal] = useState(false);
    const [submittedData, setSubmittedData] = useState(null);

    useEffect(() => {

        const user = JSON.parse(localStorage.getItem("user"));

        const loadData = async () => {
            try {

                const vData = await vehicleService.getAll(user?.eCode);
                setVehicles(Array.isArray(vData) ? vData : []);

                const dData = await driverService.getAll(user?.eCode);
                setDrivers(Array.isArray(dData) ? dData : []);

            } catch (err) {
                console.error(err);
            }
        };

        loadData();

    }, []);

    // ================= DISTANCE =================

    useEffect(() => {

        const calculateDistance = async () => {

            const valid = pointCoords.filter(c => c !== null);

            if (valid.length < 2) {
                setTotalDistance(0);
                return;
            }

            const coordStr = valid.map(c => `${c[1]},${c[0]}`).join(';');

            try {

                const res = await axios.get(
                    `https://router.project-osrm.org/route/v1/driving/${coordStr}?overview=false`
                );

                const km = res.data.routes[0].distance / 1000;

                setTotalDistance(Number(km.toFixed(2)));

            } catch {
                console.log("Distance error");
            }
        };

        calculateDistance();

    }, [pointCoords]);

    // ================= INPUT LOCATION =================

    const handleManualInput = async (idx, val) => {

        const newPoints = [...points];
        newPoints[idx] = val;
        setPoints(newPoints);

        if (val.length > 3) {

            try {

                const res = await axios.get(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${val}`
                );

                if (res.data[0]) {

                    const newCoords = [...pointCoords];

                    newCoords[idx] = [
                        parseFloat(res.data[0].lat),
                        parseFloat(res.data[0].lon)
                    ];

                    setPointCoords(newCoords);
                }

            } catch {}

        }
    };

    // ================= MAP CLICK =================

    const handleMapClick = async (latlng) => {

        const { lat, lng } = latlng;

        const newCoords = [...pointCoords];
        newCoords[activePointIndex] = [lat, lng];

        setPointCoords(newCoords);

        try {

            const res = await axios.get(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );

            const address =
                res.data.display_name.split(',').slice(0, 2).join(',');

            const newPoints = [...points];
            newPoints[activePointIndex] = address;

            setPoints(newPoints);

        } catch {}
    };

    // ================= SAVE ROUTE =================

    const handleSubmit = async (e) => {

        e.preventDefault();

        const vehicleObj =
            vehicles.find(v => v.id === parseInt(selectedVehicle));

        const cleanPoints =
            points.filter(p => p && p.trim() !== "");

        if (cleanPoints.length < 2) {
            alert("Route must have Start and End");
            return;
        }

        const payload = {

            vehicleNumber: vehicleObj?.vehicleNumber,

            driverName: selectedDriverName,
            driverId: selectedDriverId,

            points: cleanPoints,

            distance: parseFloat(totalDistance),

            tripDate: new Date().toISOString()

        };

        try {

            await axios.post(
                `${process.env.REACT_APP_API_URL}/api/trips/planned`,
                payload
            );

            setSubmittedData(payload);

            alert("Route Saved Successfully!");

        } catch (err) {

            console.error(err.response?.data || err);

            alert("Error saving route");

        }
    };

    return (

        <div style={styles.pageWrapper}>

            <div style={styles.mainLayout}>

                {/* ================= FORM ================= */}

                <div style={styles.formCard}>

                    <div style={styles.header}>
                        <div style={styles.iconCircle}><FaRoute /></div>
                        <h2 style={styles.title}>Add Route</h2>
                    </div>

                    <form onSubmit={handleSubmit} style={styles.form}>

                        {/* VEHICLE + DRIVER */}

                        <div style={styles.row}>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Vehicle</label>

                                <select
                                    required
                                    style={styles.select}
                                    value={selectedVehicle}
                                    onChange={e => setSelectedVehicle(e.target.value)}
                                >
                                    <option value="">Select Vehicle</option>

                                    {vehicles.map(v =>
                                        <option key={v.id} value={v.id}>
                                            {v.vehicleNumber}
                                        </option>
                                    )}
                                </select>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Driver</label>

                                <select
                                    required
                                    style={styles.select}
                                    value={selectedDriverId}
                                    onChange={e => {

                                        const d =
                                            drivers.find(
                                                drv => drv.id === parseInt(e.target.value)
                                            );

                                        setSelectedDriverId(e.target.value);

                                        setSelectedDriverName(
                                            d?.fullName || d?.name || ""
                                        );
                                    }}
                                >

                                    <option value="">Select Driver</option>

                                    {drivers.map(d =>
                                        <option key={d.id} value={d.id}>
                                            {d.fullName || d.name}
                                        </option>
                                    )}

                                </select>

                            </div>

                        </div>

                        {/* ROUTE POINTS */}

                        <div style={styles.section}>

                            <div style={styles.sectionHeader}>
                                <label style={styles.label}>Route Points</label>
                                <span style={styles.distBadge}>
                                    {totalDistance} KM
                                </span>
                            </div>

                            {points.map((p, idx) => (

                                <div
                                    key={idx}
                                    style={{
                                        ...styles.pointRow,
                                        border:
                                            activePointIndex === idx
                                                ? '1px solid #7c3aed'
                                                : '1px solid #e2e8f0'
                                    }}
                                >

                                    <div style={styles.pointBadge}>
                                        {idx === 0
                                            ? "START"
                                            : idx === points.length - 1
                                            ? "END"
                                            : `STOP ${idx}`}
                                    </div>

                                    <input
                                        type="text"
                                        value={p}
                                        onChange={(e) =>
                                            handleManualInput(idx, e.target.value)
                                        }
                                        onFocus={() =>
                                            setActivePointIndex(idx)
                                        }
                                        placeholder="Type city or click map..."
                                        style={styles.inputHidden}
                                    />

                                    {points.length > 2 &&
                                        <FaTrash
                                            style={{
                                                color: '#ef4444',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => {

                                                setPoints(
                                                    points.filter((_, i) => i !== idx)
                                                );

                                                setPointCoords(
                                                    pointCoords.filter((_, i) => i !== idx)
                                                );
                                            }}
                                        />
                                    }

                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={() => {

                                    setPoints([...points, ""]);
                                    setPointCoords([...pointCoords, null]);

                                }}
                                style={styles.addPointBtn}
                            >
                                <FaPlus /> Add Another Stop
                            </button>

                        </div>

                        {/* ACTION BUTTONS */}

                        <div style={styles.actionGrid}>

                            <button type="submit" style={styles.submitBtn}>
                                <FaSave /> Save Route
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    submittedData
                                        ? setShowModal(true)
                                        : alert("Save route first")
                                }
                                style={styles.receiptBtn}
                            >
                                <FaPrint /> View Receipt
                            </button>

                        </div>

                    </form>

                </div>

                {/* ================= MAP ================= */}

                <div style={styles.mapCard}>

                    <MapContainer
                        center={[19.076, 72.877]}
                        zoom={6}
                        style={{ height: "100%", width: "100%" }}
                    >

                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <MapController onMapClick={handleMapClick} />

                        {pointCoords.map((coord, i) =>
                            coord && <Marker key={i} position={coord} />
                        )}

                        {pointCoords.filter(c => c !== null).length > 1 && (

                            <Polyline
                                positions={pointCoords.filter(c => c !== null)}
                                color="#7c3aed"
                                weight={4}
                            />

                        )}

                    </MapContainer>

                </div>

            </div>

        </div>
    );
}

const styles = {
    pageWrapper: { background: "#f8fafc", minHeight: "100vh", padding: "20px" },
    mainLayout: { display: "grid", gridTemplateColumns: "450px 1fr", gap: "20px", height: "88vh" },
    formCard: { background: "#fff", padding: "25px", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", overflowY: "auto" },
    header: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" },
    iconCircle: { background: "#7c3aed", color: "#fff", padding: "10px", borderRadius: "8px" },
    title: { margin: 0, fontSize: "20px" },
    row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "15px" },
    inputGroup: { display: "flex", flexDirection: "column", gap: "5px" },
    label: { fontSize: "12px", fontWeight: "bold", color: "#64748b" },
    select: { padding: "10px", borderRadius: "6px", border: "1px solid #e2e8f0" },
    section: { background: "#f1f5f9", padding: "15px", borderRadius: "10px" },
    sectionHeader: { display: "flex", justifyContent: "space-between", marginBottom: "10px" },
    distBadge: { background: "#7c3aed", color: "#fff", padding: "2px 8px", borderRadius: "5px", fontSize: "12px" },
    pointRow: { background: "#fff", padding: "10px", borderRadius: "6px", display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" },
    pointBadge: { fontSize: "10px", fontWeight: "bold", color: "#7c3aed", width: "50px" },
    inputHidden: { border: "none", outline: "none", flex: 1, fontSize: "13px" },
    addPointBtn: { width: "100%", padding: "8px", border: "1px dashed #7c3aed", background: "none", color: "#7c3aed", cursor: "pointer", borderRadius: "6px" },
    actionGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "20px" },
    submitBtn: { padding: "12px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" },
    receiptBtn: { padding: "12px", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: "8px", cursor: "pointer" },
    mapCard: { borderRadius: "12px", overflow: "hidden" }
};

export default AddRoute;