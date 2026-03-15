


import React, { useState, useEffect, useCallback } from 'react';
import {
    FaCamera, FaFilter, FaTruck, FaTimes, FaSearch,
    FaCalendarAlt, FaImage, FaClock, FaChevronRight,
    FaHistory, FaCheckCircle, FaDownload, FaSpinner
} from 'react-icons/fa';
import axios from 'axios';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const VehicleStatusImages = () => {
    const [trips, setTrips] = useState([]);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [images, setImages] = useState([]);
    const [filter, setFilter] = useState({
        vehicleNumber: '',
        status: '',
        startDate: '',
        endDate: ''
    });
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [zoomImage, setZoomImage] = useState(null);

    const API_BASE = process.env.REACT_APP_API_URL;

    // --- Logic for Status Colors ---
    const getStatusColor = (status) => {
        switch (status?.toUpperCase()) {
            case 'COMPLETED': return { color: '#10b981', bg: '#ecfdf5' };
            case 'STARTED': return { color: '#3b82f6', bg: '#eff6ff' };
            case 'IN_TRANSIT': return { color: '#8b5cf6', bg: '#f5f3ff' };
            default: return { color: '#64748b', bg: '#f8fafc' };
        }
    };

    const fetchTrips = useCallback(async () => {
        try {
            const res = await axios.get(`${API_BASE}/api/trips/latest-logs`, { params: filter });
            setTrips(res.data);
            if (res.data.length > 0 && !selectedTrip) {
                handleTripSelect(res.data[0]);
            }
        } catch (err) {
            console.error("Error fetching trips", err);
        }
    }, [filter, API_BASE, selectedTrip]);

    useEffect(() => {
        const handler = setTimeout(() => fetchTrips(), 400);
        return () => clearTimeout(handler);
    }, [fetchTrips]);

    const handleTripSelect = async (trip) => {
        setSelectedTrip(trip);
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/api/vehicle-images/trip/${trip.id}`);
            setImages(res.data);
        } catch (err) {
            setImages([]);
        } finally {
            setLoading(false);
        }
    };

    /* ================= DOWNLOAD LOGIC ================= */
    const handleDownload = async () => {
        if (trips.length === 0) return alert("No records found to download.");

        setDownloading(true);
        const zip = new JSZip();
        const dateTag = filter.startDate && filter.endDate
            ? `${filter.startDate}_to_${filter.endDate}`
            : "all_dates";

        const mainFolder = zip.folder(`vehicle_image_info_${dateTag}`);

        try {
            // Process each trip in the filtered list
            for (const trip of trips) {
                const tripFolder = mainFolder.folder(`${trip.vehicleNumber}_ID_${trip.id}`);

                // Fetch images for this specific trip
                const imgRes = await axios.get(`${API_BASE}/api/vehicle-images/trip/${trip.id}`);
                const tripImages = imgRes.data;

                for (const img of tripImages) {
                    const imageUrl = `${API_BASE}/api/vehicle-images/${img.id}`;
                    const imageResponse = await axios.get(imageUrl, { responseType: 'blob' });
                    tripFolder.file(`${img.status}_${img.id}.jpg`, imageResponse.data);
                }
            }

            const content = await zip.generateAsync({ type: "blob" });
            saveAs(content, `vehicle_image_info_${dateTag}.zip`);
        } catch (error) {
            console.error("Download failed", error);
            alert("Error generating download package.");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div style={styles.dashboardContainer}>
            {/* Header Section */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Visual Fleet Audit</h1>
                    <p style={styles.subtitle}>Real-time photo logs and visual verification center</p>
                </div>

                <div style={styles.filterGroup}>
                    {/* Bulk Download Button */}
                    <button
                        onClick={handleDownload}
                        style={{...styles.downloadBtn, opacity: downloading ? 0.7 : 1}}
                        disabled={downloading}
                    >
                        {downloading ? <FaSpinner className="spin" /> : <FaDownload />}
                        {downloading ? "Zipping..." : "Export Photos"}
                    </button>

                    <div style={styles.searchBox}>
                        <FaSearch size={12} color="#cbd5e1" />
                        <input
                            type="text"
                            placeholder="Vehicle No."
                            style={styles.searchInput}
                            value={filter.vehicleNumber}
                            onChange={(e) => setFilter({...filter, vehicleNumber: e.target.value})}
                        />
                    </div>

                    <div style={styles.dateBox}>
                        <FaCalendarAlt size={12} color="#cbd5e1" />
                        <input type="date" style={styles.dateInput} value={filter.startDate} onChange={(e) => setFilter({...filter, startDate: e.target.value})} />
                        <span style={styles.dateSep}>to</span>
                        <input type="date" style={styles.dateInput} value={filter.endDate} onChange={(e) => setFilter({...filter, endDate: e.target.value})} />
                    </div>

                    <div style={styles.selectBox}>
                        <FaFilter size={12} color="#cbd5e1" />
                        <select style={styles.selectInput} value={filter.status} onChange={(e) => setFilter({...filter, status: e.target.value})}>
                            <option value="">Status</option>
                            <option value="STARTED">Started</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="IN_TRANSIT">In Transit</option>
                        </select>
                    </div>
                </div>
            </div>

            <div style={styles.contentGrid}>
                {/* Sidebar */}
                <div style={styles.sidebar}>
                    <h3 style={styles.sectionTitle}><FaHistory /> RECENT ACTIVITY</h3>
                    <div style={styles.listContainer}>
                        {trips.map((trip) => {
                            const status = getStatusColor(trip.status);
                            const isActive = selectedTrip?.id === trip.id;
                            return (
                                <div
                                    key={trip.id}
                                    onClick={() => handleTripSelect(trip)}
                                    style={{
                                        ...styles.vehicleItem,
                                        borderLeft: isActive ? '4px solid #4f46e5' : '4px solid transparent',
                                        backgroundColor: isActive ? '#eff6ff' : '#fff'
                                    }}
                                >
                                    <div style={styles.vehicleInfo}>
                                        <span style={styles.vNum}>{trip.vehicleNumber}</span>
                                        <span style={styles.vDetail}>{new Date(trip.tripDate).toLocaleDateString()}</span>
                                    </div>
                                    <span style={{...styles.statusTag, color: status.color, backgroundColor: status.bg}}>
                                        {trip.status}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Main Content */}
                <div style={styles.mainContent}>
                    {selectedTrip ? (
                        <>
                            <div style={styles.statusBanner}>
                                <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                                    <div style={styles.bannerIcon}><FaTruck /></div>
                                    <div>
                                        <h2 style={styles.bannerTitle}>{selectedTrip.vehicleNumber}</h2>
                                        <p style={styles.bannerSubtitle}>Driver: {selectedTrip.driverName} • ID: #{selectedTrip.id}</p>
                                    </div>
                                </div>
                                <div style={styles.statusBadge}>
                                    <FaCheckCircle color="#10b981" /> Verified Records
                                </div>
                            </div>

                            <div style={styles.card}>
                                <div style={styles.cardHeader}>
                                    <h3 style={{margin:0, fontSize: '15px', fontWeight: '800'}}>Inspection Gallery</h3>
                                </div>
                                {loading ? (
                                    <div style={styles.loader}>Syncing Photos...</div>
                                ) : (
                                    <div style={styles.imageGrid}>
                                        {images.map((img) => (
                                            <div key={img.id} style={styles.imageCard} onClick={() => setZoomImage(`${API_BASE}/api/vehicle-images/${img.id}`)}>
                                                <div style={styles.imgWrapper}>
                                                    <img src={`${API_BASE}/api/vehicle-images/${img.id}`} alt="Log" style={styles.mainImg} />
                                                    <div style={styles.imgOverlay} className="hover-zoom"><FaSearch /></div>
                                                </div>
                                                <div style={styles.imgMeta}>
                                                    <span style={{...styles.imgStatus, color: getStatusColor(img.status).color}}>● {img.status}</span>
                                                    <span style={styles.imgTime}>{new Date(img.uploadedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div style={styles.placeholderCard}>
                            <FaCamera size={50} color="#cbd5e1" style={{marginBottom: '20px'}} />
                            <h3>No Selection</h3>
                            <p>Select a trip to view audit photos.</p>
                        </div>
                    )}
                </div>
            </div>

            {zoomImage && (
                <div style={styles.lightbox} onClick={() => setZoomImage(null)}>
                    <div style={{position: 'relative'}}>
                        <img src={zoomImage} style={styles.lightboxImg} alt="Zoomed" />
                        <button style={styles.closeBtn} onClick={() => setZoomImage(null)}><FaTimes /></button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .spin { animation: spin 1s linear infinite; }
                .hover-zoom:hover { opacity: 1 !important; }
            `}</style>
        </div>
    );
};

const styles = {
    dashboardContainer: { padding: '30px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
    title: { fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: 0 },
    subtitle: { color: '#64748b', fontSize: '13px', marginTop: '4px' },

    downloadBtn: { backgroundColor: '#0f172a', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '12px', cursor: 'pointer', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s' },

    filterGroup: { display: 'flex', gap: '10px', alignItems: 'center' },
    searchBox: { display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', padding: '8px 12px', borderRadius: '12px', border: '1px solid #e2e8f0' },
    searchInput: { border: 'none', outline: 'none', fontSize: '12px', width: '100px' },
    dateBox: { display: 'flex', alignItems: 'center', gap: '5px', background: '#fff', padding: '8px 12px', borderRadius: '12px', border: '1px solid #e2e8f0' },
    dateInput: { border: 'none', fontSize: '11px', color: '#475569', fontWeight: '700', outline: 'none' },
    dateSep: { fontSize: '10px', fontWeight: '800', color: '#cbd5e1' },
    selectBox: { display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', padding: '8px 12px', borderRadius: '12px', border: '1px solid #e2e8f0' },
    selectInput: { border: 'none', fontSize: '12px', color: '#475569', fontWeight: '700', outline: 'none' },

    contentGrid: { display: 'grid', gridTemplateColumns: '280px 1fr', gap: '30px' },
    sidebar: { backgroundColor: '#fff', borderRadius: '20px', padding: '20px', border: '1px solid #f1f5f9', maxHeight: '80vh', overflowY: 'auto' },
    sectionTitle: { fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: '20px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' },
    listContainer: { display: 'flex', flexDirection: 'column', gap: '10px' },
    vehicleItem: { padding: '14px', borderRadius: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    vNum: { fontWeight: '800', color: '#1e293b', fontSize: '13px' },
    vDetail: { fontSize: '11px', color: '#94a3b8' },
    statusTag: { fontSize: '9px', fontWeight: '900', padding: '4px 8px', borderRadius: '6px' },

    mainContent: { display: 'flex', flexDirection: 'column', gap: '20px' },
    statusBanner: { background: '#fff', padding: '25px', borderRadius: '20px', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    bannerIcon: { width: '50px', height: '50px', background: '#eef2ff', color: '#4f46e5', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' },
    bannerTitle: { margin: 0, fontSize: '22px', fontWeight: '900' },
    bannerSubtitle: { margin: '4px 0 0', fontSize: '13px', color: '#64748b' },
    statusBadge: { padding: '6px 12px', background: '#ecfdf5', color: '#10b981', borderRadius: '20px', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' },

    card: { backgroundColor: '#fff', borderRadius: '20px', border: '1px solid #f1f5f9', overflow: 'hidden' },
    cardHeader: { padding: '20px 25px', borderBottom: '1px solid #f1f5f9' },
    imageGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '25px', padding: '25px' },
    imageCard: { borderRadius: '16px', overflow: 'hidden', border: '1px solid #f1f5f9', cursor: 'pointer' },
    imgWrapper: { height: '160px', position: 'relative' },
    mainImg: { width: '100%', height: '100%', objectFit: 'cover' },
    imgOverlay: { position: 'absolute', inset: 0, background: 'rgba(79, 70, 229, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', opacity: 0, transition: '0.3s' },
    imgMeta: { padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    imgStatus: { fontSize: '10px', fontWeight: '800' },
    imgTime: { fontSize: '10px', color: '#94a3b8' },

    placeholderCard: { backgroundColor: '#fff', borderRadius: '20px', border: '2px dashed #e2e8f0', padding: '120px 20px', textAlign: 'center', color: '#94a3b8' },
    loader: { textAlign: 'center', padding: '50px', color: '#94a3b8' },
    lightbox: { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 },
    lightboxImg: { maxWidth: '100%', maxHeight: '80vh', borderRadius: '12px' },
    closeBtn: { position: 'absolute', top: '-45px', right: '0', background: '#fff', border: 'none', width: '35px', height: '35px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }
};

export default VehicleStatusImages;