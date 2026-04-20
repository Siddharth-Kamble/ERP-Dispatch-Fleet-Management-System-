import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
    Calendar,
    MapPin,
    CheckCircle2,
    X,
    Activity,
    Box,
    Search,
    Download,
    FileText,
    Clock,
    Filter,
    RefreshCcw
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function CompletedTrips({ completedTrips }) {
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [tripHistory, setTripHistory] = useState({});
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [isExporting, setIsExporting] = useState(false);

    // Filtering States
    const [searchQuery, setSearchQuery] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const reportRef = useRef(null);

    const sortedTrips = [...completedTrips].sort(
        (a, b) => (b.tripId || 0) - (a.tripId || 0)
    );

    // Advanced Filtering Logic
    const filteredTrips = sortedTrips.filter(trip => {
        const history = tripHistory[trip.tripId] || [];
        const tripDateStr = history.length > 0 ? history[0].eventTime : null;
        const tripDate = tripDateStr ? new Date(tripDateStr) : null;

        const matchesSearch = trip.tripId.toString().includes(searchQuery) ||
            trip.status.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesDate = true;
        if (tripDate) {
            if (startDate && new Date(startDate) > tripDate) matchesDate = false;
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                if (end < tripDate) matchesDate = false;
            }
        } else if (startDate || endDate) {
            matchesDate = false;
        }

        return matchesSearch && matchesDate;
    });

    useEffect(() => {
        const fetchAllHistory = async () => {
            try {
                const historyData = {};
                for (const trip of sortedTrips) {
                    const res = await axios.get(
                        `${process.env.REACT_APP_API_URL}/api/vehicle-activity/history/${trip.tripId}`
                    );
                    historyData[trip.tripId] = res.data;
                }
                setTripHistory(historyData);
            } catch (err) {
                console.error("Failed to load completed trips history:", err);
            } finally {
                setLoadingHistory(false);
            }
        };

        if (sortedTrips.length > 0) fetchAllHistory();
        else setLoadingHistory(false);
    }, [completedTrips]);

    const handleDownloadPDF = async () => {
        setIsExporting(true);
        const element = reportRef.current;
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            backgroundColor: "#f8fafc"
        });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Fleet-Activity-Report.pdf`);
        setIsExporting(false);
    };

    const resetFilters = () => {
        setSearchQuery("");
        setStartDate("");
        setEndDate("");
    };

    const formatDate = (dateStr) =>
        dateStr ? new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "--/--/----";

    if (loadingHistory) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
                <div className="loader-container">
                    <div className="loader-ring" />
                    <p style={{ color: '#64748b', fontWeight: '600', marginTop: '20px', fontFamily: 'sans-serif' }}>Generating Analytics...</p>
                </div>
                <style>{`.loader-ring { width: 50px; height: 50px; border: 4px solid #e2e8f0; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div className="ct-root">

            {/* ===== HEADER ===== */}
            <div className="ct-header-wrap">
                <div className="ct-header-left">
                    <h1 className="ct-title">Fleet Logbook</h1>
                    <p className="ct-subtitle">Review, filter, and export completed vehicle operations.</p>
                </div>
                <div className="ct-results-badge">
                    <div className="ct-results-label">Results Found</div>
                    <div className="ct-results-count">
                        {filteredTrips.length} <span className="ct-results-total">/ {sortedTrips.length}</span>
                    </div>
                </div>
            </div>

            {/* ===== FILTER BAR ===== */}
            <div className="ct-filter-bar">
                <div className="ct-filter-row">
                    {/* Search */}
                    <div className="ct-filter-search">
                        <label className="ct-filter-label">SEARCH RECORDS</label>
                        <div style={{ position: 'relative' }}>
                            <Search size={18} className="ct-search-icon" />
                            <input
                                type="text"
                                placeholder="ID or Status..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="ct-input ct-input-search"
                            />
                        </div>
                    </div>

                    {/* Date From */}
                    <div className="ct-filter-date">
                        <label className="ct-filter-label">FROM DATE</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="ct-input"
                        />
                    </div>

                    {/* Date To */}
                    <div className="ct-filter-date">
                        <label className="ct-filter-label">TO DATE</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="ct-input"
                        />
                    </div>

                    {/* Actions */}
                    <div className="ct-filter-actions">
                        <button onClick={resetFilters} className="ct-btn-icon" title="Reset Filters">
                            <RefreshCcw size={20} />
                        </button>
                        <button
                            onClick={handleDownloadPDF}
                            disabled={isExporting}
                            className="ct-btn-export"
                        >
                            {isExporting ? <Activity size={18} className="spin" /> : <Download size={18} />}
                            <span>{isExporting ? "Exporting..." : "Export PDF"}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ===== GRID AREA ===== */}
            <div ref={reportRef} className="ct-grid-area">
                {filteredTrips.length === 0 ? (
                    <div className="ct-empty">
                        <div className="ct-empty-icon">
                            <Filter size={32} color="#94a3b8" />
                        </div>
                        <h3 className="ct-empty-title">No matches found</h3>
                        <p className="ct-empty-sub">Try changing your keywords or date range to see more results.</p>
                        <button onClick={resetFilters} className="ct-empty-reset">Clear all filters</button>
                    </div>
                ) : (
                    <div className="ct-grid">
                        {filteredTrips.map((trip) => {
                            const history = tripHistory[trip.tripId] || [];
                            const date = history.length > 0 ? history[0].eventTime : null;
                            return (
                                <div
                                    key={trip.tripId}
                                    onClick={() => setSelectedTrip(trip)}
                                    className="ct-card card-hover"
                                >
                                    <div className="ct-card-top">
                                        <div className="ct-card-icon-wrap">
                                            <Box size={24} color="#3b82f6" />
                                        </div>
                                        <div className="ct-card-status">
                                            {trip.status}
                                        </div>
                                    </div>
                                    <div className="ct-card-ref-label">TRIP REFERENCE</div>
                                    <h2 className="ct-card-trip-id">#{trip.tripId}</h2>
                                    <div className="ct-card-footer">
                                        <div>
                                            <div className="ct-card-meta-label">COMPLETED ON</div>
                                            <div className="ct-card-meta-value">
                                                <Calendar size={14} /> {formatDate(date)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="ct-card-meta-label">ACTIVITY LOG</div>
                                            <div className="ct-card-meta-value">
                                                <Activity size={14} /> {history.length} Points
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ===== DETAIL MODAL ===== */}
            {selectedTrip && (
                <div className="overlay" onClick={() => setSelectedTrip(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="ct-modal-header">
                            <div>
                                <h3 className="ct-modal-title">Audit Trail</h3>
                                <p className="ct-modal-sub">Manifest Details for #{selectedTrip.tripId}</p>
                            </div>
                            <button onClick={() => setSelectedTrip(null)} className="ct-modal-close">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="ct-modal-body">
                            <div className="ct-timeline">
                                {(tripHistory[selectedTrip.tripId] || []).map((step, idx) => (
                                    <div key={idx} className="ct-timeline-item">
                                        <div className={`ct-timeline-dot ${idx === 0 ? 'ct-dot-active' : ''}`} />
                                        <div className="ct-timeline-status">{step.status}</div>
                                        <div className="ct-timeline-time">
                                            <Clock size={12} />
                                            {new Date(step.eventTime).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                * { box-sizing: border-box; }

                /* ===== ROOT ===== */
                .ct-root {
                    min-height: 100vh;
                    background-color: #f8fafc;
                    padding: 2rem;
                    font-family: 'Inter', sans-serif;
                }

                /* ===== HEADER ===== */
                .ct-header-wrap {
                    max-width: 1250px;
                    margin: 0 auto 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    flex-wrap: wrap;
                    gap: 16px;
                }
                .ct-title {
                    font-size: 2.5rem;
                    font-weight: 900;
                    color: #0f172a;
                    margin: 0;
                    letter-spacing: -0.04em;
                }
                .ct-subtitle {
                    color: #64748b;
                    font-size: 1.1rem;
                    margin-top: 4px;
                    margin-bottom: 0;
                }
                .ct-results-badge {
                    background: #fff;
                    padding: 15px 25px;
                    border-radius: 20px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.03);
                    border: 1px solid #f1f5f9;
                    flex-shrink: 0;
                }
                .ct-results-label {
                    font-size: 12px;
                    color: #94a3b8;
                    font-weight: 800;
                    text-transform: uppercase;
                }
                .ct-results-count {
                    font-size: 24px;
                    font-weight: 900;
                    color: #3b82f6;
                }
                .ct-results-total {
                    font-size: 14px;
                    color: #cbd5e1;
                }

                /* ===== FILTER BAR ===== */
                .ct-filter-bar {
                    max-width: 1250px;
                    margin: 0 auto 2.5rem;
                    background: #fff;
                    padding: 20px;
                    border-radius: 24px;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 10px 30px -10px rgba(0,0,0,0.04);
                }
                .ct-filter-row {
                    display: flex;
                    gap: 16px;
                    flex-wrap: wrap;
                    align-items: flex-end;
                }
                .ct-filter-search {
                    flex: 2;
                    min-width: 200px;
                }
                .ct-filter-date {
                    flex: 1;
                    min-width: 140px;
                }
                .ct-filter-label {
                    display: block;
                    font-size: 12px;
                    font-weight: 700;
                    color: #475569;
                    margin-bottom: 8px;
                    margin-left: 4px;
                }
                .ct-input {
                    width: 100%;
                    padding: 11px 14px;
                    border-radius: 14px;
                    border: 1px solid #e2e8f0;
                    outline: none;
                    background: #f8fafc;
                    color: #475569;
                    font-size: 14px;
                }
                .ct-input-search {
                    padding-left: 45px;
                }
                .ct-search-icon {
                    position: absolute;
                    left: 15px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #94a3b8;
                }
                .ct-filter-actions {
                    display: flex;
                    gap: 10px;
                    align-items: center;
                    flex-shrink: 0;
                }
                .ct-btn-icon {
                    padding: 11px;
                    border-radius: 14px;
                    border: 1px solid #e2e8f0;
                    background: #fff;
                    cursor: pointer;
                    color: #64748b;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .ct-btn-export {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: #0f172a;
                    color: #fff;
                    padding: 11px 20px;
                    border-radius: 14px;
                    border: none;
                    font-weight: 600;
                    cursor: pointer;
                    font-size: 14px;
                    white-space: nowrap;
                }
                .ct-btn-export:disabled { opacity: 0.7; cursor: not-allowed; }

                /* ===== GRID AREA ===== */
                .ct-grid-area {
                    max-width: 1250px;
                    margin: 0 auto;
                }
                .ct-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 1.5rem;
                }

                /* ===== CARD ===== */
                .ct-card {
                    background: #fff;
                    border-radius: 28px;
                    padding: 1.75rem;
                    border: 1px solid #f1f5f9;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }
                .ct-card-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }
                .ct-card-icon-wrap {
                    background: #eff6ff;
                    padding: 12px;
                    border-radius: 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .ct-card-status {
                    background: #ecfdf5;
                    color: #059669;
                    padding: 6px 15px;
                    border-radius: 99px;
                    font-size: 11px;
                    font-weight: 900;
                }
                .ct-card-ref-label {
                    font-size: 12px;
                    color: #94a3b8;
                    font-weight: 700;
                    letter-spacing: 0.05em;
                }
                .ct-card-trip-id {
                    font-size: 1.6rem;
                    font-weight: 900;
                    color: #0f172a;
                    margin: 5px 0 1.2rem;
                }
                .ct-card-footer {
                    display: flex;
                    gap: 25px;
                    padding-top: 1.2rem;
                    border-top: 1px solid #f8fafc;
                    flex-wrap: wrap;
                }
                .ct-card-meta-label {
                    font-size: 11px;
                    color: #94a3b8;
                    font-weight: 700;
                    margin-bottom: 4px;
                }
                .ct-card-meta-value {
                    font-size: 14px;
                    font-weight: 700;
                    color: #334155;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                /* ===== EMPTY STATE ===== */
                .ct-empty {
                    text-align: center;
                    padding: 80px 20px;
                    background: #fff;
                    border-radius: 30px;
                    border: 2px dashed #e2e8f0;
                }
                .ct-empty-icon {
                    width: 80px;
                    height: 80px;
                    background: #f1f5f9;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px;
                }
                .ct-empty-title {
                    font-size: 1.5rem;
                    color: #1e293b;
                    margin-bottom: 10px;
                }
                .ct-empty-sub {
                    color: #64748b;
                    margin: 0;
                }
                .ct-empty-reset {
                    margin-top: 20px;
                    color: #3b82f6;
                    background: none;
                    border: none;
                    font-weight: 700;
                    cursor: pointer;
                    font-size: 15px;
                }

                /* ===== MODAL ===== */
                .overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.6);
                    backdrop-filter: blur(8px);
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 16px;
                }
                .modal {
                    background: #fff;
                    width: 100%;
                    max-width: 500px;
                    border-radius: 32px;
                    overflow: hidden;
                    animation: pop 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);
                }
                .ct-modal-header {
                    padding: 24px 28px;
                    background: #0f172a;
                    color: #fff;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 12px;
                }
                .ct-modal-title {
                    margin: 0;
                    font-size: 1.4rem;
                    font-weight: 800;
                }
                .ct-modal-sub {
                    margin: 4px 0 0;
                    opacity: 0.6;
                    font-size: 0.9rem;
                }
                .ct-modal-close {
                    background: rgba(255,255,255,0.1);
                    border: none;
                    border-radius: 12px;
                    padding: 10px;
                    color: #fff;
                    cursor: pointer;
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .ct-modal-body {
                    padding: 28px;
                    max-height: 60vh;
                    overflow-y: auto;
                }
                .ct-timeline {
                    border-left: 2px solid #e2e8f0;
                    margin-left: 10px;
                    padding-left: 28px;
                }
                .ct-timeline-item {
                    position: relative;
                    margin-bottom: 30px;
                }
                .ct-timeline-dot {
                    position: absolute;
                    left: -37px;
                    top: 2px;
                    width: 14px;
                    height: 14px;
                    background: #fff;
                    border: 3px solid #3b82f6;
                    border-radius: 50%;
                    z-index: 2;
                }
                .ct-dot-active {
                    background: #3b82f6;
                }
                .ct-timeline-status {
                    font-weight: 800;
                    font-size: 15px;
                    color: #1e293b;
                }
                .ct-timeline-time {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    color: #94a3b8;
                    margin-top: 6px;
                }

                /* ===== ANIMATIONS ===== */
                .card-hover:hover { transform: translateY(-10px); border-color: rgba(59,130,246,0.25); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.08); }
                .spin { animation: rotate 1s linear infinite; }
                @keyframes pop { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                @keyframes rotate { to { transform: rotate(360deg); } }
                ::-webkit-scrollbar { width: 8px; }
                ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }

                /* ===== RESPONSIVE: TABLET ===== */
                @media (max-width: 900px) {
                    .ct-root { padding: 1.25rem; }
                    .ct-title { font-size: 1.8rem; }
                    .ct-subtitle { font-size: 0.95rem; }
                    .ct-grid { grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; }
                    .ct-filter-search { flex: 1 1 100%; }
                    .ct-filter-date { flex: 1 1 calc(50% - 8px); min-width: 120px; }
                    .ct-filter-actions { width: 100%; justify-content: flex-end; }
                }

                /* ===== RESPONSIVE: MOBILE ===== */
                @media (max-width: 600px) {
                    .ct-root { padding: 1rem; }
                    .ct-title { font-size: 1.5rem; }
                    .ct-subtitle { font-size: 0.88rem; }
                    .ct-header-wrap { flex-direction: column; gap: 12px; }
                    .ct-results-badge { width: 100%; padding: 12px 18px; border-radius: 14px; }
                    .ct-results-count { font-size: 20px; }

                    .ct-filter-bar { padding: 14px; border-radius: 16px; }
                    .ct-filter-row { gap: 10px; }
                    .ct-filter-search { flex: 1 1 100%; }
                    .ct-filter-date { flex: 1 1 calc(50% - 5px); min-width: 0; }
                    .ct-filter-actions { width: 100%; justify-content: space-between; }
                    .ct-btn-export { flex: 1; justify-content: center; }
                    .ct-btn-icon { flex-shrink: 0; }

                    .ct-grid { grid-template-columns: 1fr; gap: 12px; }
                    .ct-card { padding: 1.2rem; border-radius: 20px; }
                    .ct-card-trip-id { font-size: 1.3rem; }
                    .ct-card-status { font-size: 10px; }

                    .ct-empty { padding: 50px 16px; }
                    .ct-empty-icon { width: 60px; height: 60px; }
                    .ct-empty-title { font-size: 1.2rem; }

                    .modal { border-radius: 24px; }
                    .ct-modal-header { padding: 18px 20px; }
                    .ct-modal-title { font-size: 1.1rem; }
                    .ct-modal-body { padding: 20px; max-height: 55vh; }
                    .ct-timeline { padding-left: 22px; }
                    .ct-timeline-dot { left: -31px; }

                    .card-hover:hover { transform: none; }
                    .card-hover:active { transform: scale(0.98); }
                }
            `}</style>
        </div>
    );
}

export default CompletedTrips;
