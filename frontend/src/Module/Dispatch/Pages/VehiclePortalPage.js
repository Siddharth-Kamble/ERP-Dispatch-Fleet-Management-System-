


import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const VehiclePortal = () => {
    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Date Filter States (UI List Filter)
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // State for the Details Popup
    const [selectedTrip, setSelectedTrip] = useState(null);

    const [formData, setFormData] = useState({
        crnNumber: "",
        pickupLocation: "",
        dropLocation: "",
        fare: "",
        status: "",
        vehicleNumber: "",
        driverName: "",
        tripDate: new Date().toISOString().split('T')[0], // Default to today
    });
    const [photo, setPhoto] = useState(null);

    // Load Trips from Backend
    const loadTrips = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/portaltrip/all`);
            setTrips(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
            console.error("Fetch trips failed", e);
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    useEffect(() => {
        loadTrips();
    }, [loadTrips]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setPhoto(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (photo) data.append("photo", photo);

        try {
            await axios.post(`${API_URL}/portaltrip/save`, data);
            alert("✅ Trip Saved Successfully!");
            setFormData({
                crnNumber: "", pickupLocation: "", dropLocation: "",
                fare: "", status: "", vehicleNumber: "", driverName: "",
                tripDate: new Date().toISOString().split('T')[0]
            });
            setPhoto(null);
            loadTrips();
        } catch (error) {
            console.error("Error saving trip:", error);
            alert("❌ Failed to save trip");
        } finally {
            setIsSubmitting(false);
        }
    };

    /* FILTER + SORT LOGIC: Latest first */
    const filteredTrips = useMemo(() => {
        const filtered = trips.filter(t => {
            const matchesSearch =
                t.crnNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.vehicleNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.driverName?.toLowerCase().includes(searchQuery.toLowerCase());

            const tripDateValue = t.tripDate || t.createdAt || new Date().toISOString();
            const tripTime = new Date(tripDateValue).getTime();

            const start = startDate ? new Date(startDate).getTime() : -Infinity;
            const end = endDate ? new Date(endDate).getTime() : Infinity;
            const adjustedEnd = endDate ? end + 86400000 : Infinity;

            const matchesDate = tripTime >= start && tripTime <= adjustedEnd;
            return matchesSearch && matchesDate;
        });

        return filtered.sort((a, b) => {
            const dateA = new Date(a.tripDate || a.createdAt || 0);
            const dateB = new Date(b.tripDate || b.createdAt || 0);
            return dateB - dateA;
        });
    }, [trips, searchQuery, startDate, endDate]);

    /* Logic for Total Fare Summary */
    const totalFare = useMemo(() => {
        return filteredTrips.reduce((sum, trip) => sum + (Number(trip.fare) || 0), 0);
    }, [filteredTrips]);

    /* EXPORT EXCEL LOGIC */
    const exportToExcel = () => {
        if (filteredTrips.length === 0) {
            alert("No data available to export.");
            return;
        }
        const worksheet = XLSX.utils.json_to_sheet(filteredTrips.map(t => ({
            "CRN Number": t.crnNumber,
            "Vehicle Number": t.vehicleNumber,
            "Driver Name": t.driverName,
            "Pickup": t.pickupLocation,
            "Drop": t.dropLocation,
            "Fare": t.fare,
            "Status": t.status,
            "Trip Date": t.tripDate || "N/A"
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Trips");
        XLSX.writeFile(workbook, `Trip_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    /* EXPORT PDF LOGIC WITH IMAGES */
    const exportToPDF = () => {
        if (filteredTrips.length === 0) {
            alert("No data available to export.");
            return;
        }

        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Vehicle Portal - Detailed Report", 14, 20);
        doc.setFontSize(10);
        doc.text(`Range: ${startDate || 'All'} to ${endDate || 'Now'}`, 14, 28);
        doc.text(`Total Revenue: Rs. ${totalFare}`, 14, 34);

        autoTable(doc, {
            startY: 40,
            head: [["CRN", "Vehicle", "Driver", "Route", "Fare", "Status", "Date"]],
            body: filteredTrips.map(t => [
                t.crnNumber, t.vehicleNumber, t.driverName,
                `${t.pickupLocation} to ${t.dropLocation}`, `Rs. ${t.fare}`, t.status, t.tripDate || ""
            ]),
            headStyles: { fillColor: [15, 23, 42] }
        });

        filteredTrips.forEach((t) => {
            if (t.photo) {
                doc.addPage();
                doc.setFontSize(14);
                doc.text(`Details for CRN: ${t.crnNumber}`, 14, 20);
                doc.setFontSize(10);
                doc.text(`Date: ${t.tripDate || "N/A"}`, 14, 26);
                doc.text(`Driver: ${t.driverName} | Vehicle: ${t.vehicleNumber}`, 14, 32);
                doc.text(`Fare: Rs. ${t.fare} | Status: ${t.status}`, 14, 38);

                try {
                    const imgData = `data:image/jpeg;base64,${t.photo}`;
                    doc.addImage(imgData, 'JPEG', 14, 45, 180, 100);
                } catch (err) {
                    doc.text("[Image could not be rendered]", 14, 50);
                }
            }
        });

        doc.save(`Trip_Report_Detailed.pdf`);
    };

    const renderPhoto = (byteData) => {
        if (!byteData) return null;
        return `data:image/jpeg;base64,${byteData}`;
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h2 style={styles.title}>🚢 Vehicle Portal Management</h2>
                    <p style={styles.subtitle}>Filter the history by date and click entries to view receipts.</p>
                </div>
                <div style={styles.statsRow}>
                    <div style={styles.statCard}>
                        <div style={styles.statIcon}>🛣️</div>
                        <div>
                            <span style={styles.statLabel}>Active Results</span>
                            <span style={styles.statValue}>{filteredTrips.length}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={styles.mainGrid}>
                <div style={styles.sideColumn}>
                    <div style={styles.card}>
                        <div style={styles.cardHeader}><h3 style={styles.cardTitle}>Register New Trip</h3></div>
                        <form onSubmit={handleSubmit} style={styles.formContainer}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Trip Date</label>
                                <input type="date" style={styles.input} name="tripDate" value={formData.tripDate} onChange={handleChange} required />
                            </div>

                            <div style={styles.inputGroup}><label style={styles.label}>CRN Number</label><input style={styles.input} name="crnNumber" value={formData.crnNumber} onChange={handleChange} placeholder="e.g. CRN100234" required /></div>
                            <div style={styles.inputGroup}><label style={styles.label}>Vehicle Number</label><input style={styles.input} name="vehicleNumber" value={formData.vehicleNumber} onChange={handleChange} placeholder="MH-12-AB-1234" required /></div>
                            <div style={styles.inputGroup}><label style={styles.label}>Route</label><div style={{display: 'flex', gap: '10px'}}><input style={{...styles.input, flex: 1}} name="pickupLocation" value={formData.pickupLocation} onChange={handleChange} placeholder="From" required /><input style={{...styles.input, flex: 1}} name="dropLocation" value={formData.dropLocation} onChange={handleChange} placeholder="To" required /></div></div>
                            <div style={styles.inputGroup}><label style={styles.label}>Fare Amount</label><input style={styles.input} type="number" name="fare" value={formData.fare} onChange={handleChange} placeholder="₹ 0.00" required /></div>
                            <div style={styles.inputGroup}><label style={styles.label}>Driver Name</label><input style={styles.input} name="driverName" value={formData.driverName} onChange={handleChange} required /></div>
                            <div style={styles.inputGroup}><label style={styles.label}>Status</label><select style={styles.select} name="status" value={formData.status} onChange={handleChange} required><option value="">Select Status</option><option value="Completed">Completed</option><option value="In Progress">In Progress</option><option value="Cancelled">Cancelled</option></select></div>
                            <div style={styles.inputGroup}><label style={styles.label}>Upload Receipt</label><input style={styles.input} type="file" onChange={handleFileChange} accept="image/*" /></div>
                            <button type="submit" style={styles.submitBtn} disabled={isSubmitting}>{isSubmitting ? "⌛ Saving..." : "➕ Save Trip Details"}</button>
                        </form>
                    </div>
                </div>

                <div style={styles.directoryColumn}>
                    <div style={styles.card}>
                        <div style={styles.directoryHeader}>
                            <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                                <div style={styles.dateGroup}><label style={styles.miniLabel}>Start</label><input type="date" style={styles.miniInput} value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
                                <div style={styles.dateGroup}><label style={styles.miniLabel}>End</label><input type="date" style={styles.miniInput} value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div>
                                <button onClick={exportToPDF} style={styles.exportBtn}>📄 PDF</button>
                                <button onClick={exportToExcel} style={{...styles.exportBtn, backgroundColor: '#166534'}}>Excel 📊</button>
                            </div>
                            <div style={styles.searchWrapper}><span style={styles.searchIcon}>🔍</span><input style={styles.searchInput} placeholder="Search History..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
                        </div>

                        {loading ? (
                            <div style={styles.loader}><div className="loading-spinner"></div><p>Syncing Portal Data...</p></div>
                        ) : filteredTrips.length === 0 ? (
                            <div style={styles.emptyState}>📑<p>No trips match filters.</p></div>
                        ) : (
                            <div style={styles.tableWrapper}>
                                <table style={styles.table}>
                                    <thead><tr><th style={styles.th}>Trip Info</th><th style={styles.th}>Route</th><th style={styles.th}>Fare</th><th style={styles.th}>Status</th></tr></thead>
                                    <tbody>
                                        {filteredTrips.map(t => (
                                            <tr key={t.id} className="row-hover" onClick={() => setSelectedTrip(t)} style={{cursor: 'pointer'}}>
                                                <td style={styles.td}><div style={styles.nameCell}><div style={styles.avatar}>{t.crnNumber?.charAt(0)}</div><div><div style={{fontWeight: '700'}}>{t.crnNumber}</div><div style={{fontSize: '11px', color: '#94a3b8'}}>{t.vehicleNumber} | {t.tripDate}</div></div></div></td>
                                                <td style={styles.td}><div style={{fontSize: '13px'}}>{t.pickupLocation}</div><div style={{fontSize: '11px', color: '#94a3b8'}}>to {t.dropLocation}</div></td>
                                                <td style={styles.td}>₹ {t.fare}</td>
                                                <td style={styles.td}><span style={{...styles.licenseBadge, backgroundColor: t.status === 'Completed' ? '#ecfdf5' : '#fff7ed', color: t.status === 'Completed' ? '#059669' : '#d97706'}}>{t.status}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    {/* ADDED: Summary Footer */}
                                    <tfoot>
                                        <tr style={{backgroundColor: '#f8fafc', borderTop: '2px solid #e2e8f0'}}>
                                            <td style={{...styles.td, fontWeight: '800', color: '#0f172a'}}>TOTAL ({filteredTrips.length} Trips)</td>
                                            <td style={styles.td}></td>
                                            <td style={{...styles.td, fontWeight: '800', color: '#059669', fontSize: '16px'}}>₹ {totalFare.toLocaleString()}</td>
                                            <td style={styles.td}></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {selectedTrip && (
                <div style={styles.modalOverlay} onClick={() => setSelectedTrip(null)}>
                    <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div style={styles.modalHeader}><h3 style={styles.cardTitle}>Trip Information</h3><button style={styles.closeBtn} onClick={() => setSelectedTrip(null)}>✕</button></div>
                        <div style={styles.modalBody}>
                            <div style={styles.infoGrid}>
                                <div style={styles.infoItem}><label>Date</label><span>{selectedTrip.tripDate}</span></div>
                                <div style={styles.infoItem}><label>CRN</label><span>{selectedTrip.crnNumber}</span></div>
                                <div style={styles.infoItem}><label>Driver</label><span>{selectedTrip.driverName}</span></div>
                                <div style={styles.infoItem}><label>Vehicle</label><span>{selectedTrip.vehicleNumber}</span></div>
                                <div style={styles.infoItem}><label>Fare</label><span>₹ {selectedTrip.fare}</span></div>
                            </div>
                            {selectedTrip.photo && <div style={styles.receiptSection}><label style={styles.label}>Receipt</label><img src={renderPhoto(selectedTrip.photo)} alt="Receipt" style={styles.receiptImg} /></div>}
                        </div>
                    </div>
                </div>
            )}
            <style>{`.row-hover:hover { background-color: #f8fafc !important; } .loading-spinner { width: 30px; height: 30px; border: 3px solid #f1f5f9; border-top: 3px solid #3b82f6; border-radius: 50%; animation: spin 0.8s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

const styles = {
    container: { padding: '40px', backgroundColor: '#f4f7fa', minHeight: '100vh', fontFamily: "'Inter', sans-serif" },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' },
    title: { fontSize: '30px', fontWeight: '800', color: '#0f172a', margin: 0 },
    subtitle: { color: '#64748b', fontSize: '15px' },
    statsRow: { display: 'flex', gap: '20px' },
    statCard: { backgroundColor: '#fff', padding: '15px 25px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid #e2e8f0' },
    statIcon: { fontSize: '24px', backgroundColor: '#eff6ff', padding: '10px', borderRadius: '12px' },
    statLabel: { fontSize: '11px', fontWeight: '700', color: '#94a3b8' },
    statValue: { display: 'block', fontSize: '24px', fontWeight: '800' },
    mainGrid: { display: 'grid', gridTemplateColumns: '350px 1fr', gap: '30px', alignItems: 'start' },
    sideColumn: { position: 'sticky', top: '20px' },
    card: { backgroundColor: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.04)', overflow: 'hidden' },
    cardHeader: { padding: '25px', borderBottom: '1px solid #f1f5f9' },
    cardTitle: { fontSize: '18px', fontWeight: '700' },
    formContainer: { padding: '25px', display: 'flex', flexDirection: 'column', gap: '18px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '13px', fontWeight: '600' },
    input: { padding: '12px 15px', borderRadius: '12px', border: '1px solid #cbd5e1' },
    select: { padding: '12px 15px', borderRadius: '12px', border: '1px solid #cbd5e1' },
    submitBtn: { backgroundColor: '#059669', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' },
    directoryHeader: { padding: '20px 25px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    dateGroup: { display: 'flex', flexDirection: 'column', gap: '2px' },
    miniLabel: { fontSize: '10px', fontWeight: 'bold', color: '#94a3b8' },
    miniInput: { padding: '6px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' },
    exportBtn: { backgroundColor: '#0f172a', color: 'white', padding: '10px 15px', borderRadius: '10px', border: 'none', fontSize: '12px', fontWeight: '700', cursor: 'pointer' },
    searchWrapper: { position: 'relative', width: '220px' },
    searchIcon: { position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' },
    searchInput: { width: '100%', padding: '10px 10px 10px 40px', borderRadius: '12px', border: '1px solid #e2e8f0' },
    tableWrapper: { padding: '10px' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '15px', textAlign: 'left', fontSize: '12px', color: '#94a3b8' },
    td: { padding: '18px', borderBottom: '1px solid #f1f5f9' },
    nameCell: { display: 'flex', alignItems: 'center', gap: '15px' },
    avatar: { width: '35px', height: '35px', borderRadius: '10px', backgroundColor: '#059669', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    licenseBadge: { padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '700' },
    modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { background: 'white', width: '500px', borderRadius: '24px', padding: '30px' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    closeBtn: { background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' },
    infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
    infoItem: { display: 'flex', flexDirection: 'column' },
    receiptSection: { marginTop: '20px' },
    receiptImg: { width: '100%', borderRadius: '12px', maxHeight: '250px', objectFit: 'cover' }
};

export default VehiclePortal;