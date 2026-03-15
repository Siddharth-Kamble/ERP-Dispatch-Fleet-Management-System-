

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

        // Search Match
        const matchesSearch = trip.tripId.toString().includes(searchQuery) ||
            trip.status.toLowerCase().includes(searchQuery.toLowerCase());

        // Date Range Match
        let matchesDate = true;
        if (tripDate) {
            if (startDate && new Date(startDate) > tripDate) matchesDate = false;
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999); // Include the full end day
                if (end < tripDate) matchesDate = false;
            }
        } else if (startDate || endDate) {
            matchesDate = false; // If searching by date but trip has no date
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
        <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", padding: "2rem", fontFamily: "'Inter', sans-serif" }}>
            {/* Header & Stats */}
            <div style={{ maxWidth: "1250px", margin: "0 auto", marginBottom: "2rem" }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                    <div>
                        <h1 style={{ fontSize: "2.5rem", fontWeight: "900", color: "#0f172a", margin: 0, letterSpacing: '-0.04em' }}>Fleet Logbook</h1>
                        <p style={{ color: "#64748b", fontSize: '1.1rem', marginTop: '4px' }}>Review, filter, and export completed vehicle operations.</p>
                    </div>
                    <div style={{ background: '#fff', padding: '15px 25px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
                        <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>Results Found</div>
                        <div style={{ fontSize: '24px', fontWeight: '900', color: '#3b82f6' }}>{filteredTrips.length} <span style={{ fontSize: '14px', color: '#cbd5e1' }}>/ {sortedTrips.length}</span></div>
                    </div>
                </div>
            </div>

            {/* Advanced Filter Bar */}
            <div style={{ maxWidth: "1250px", margin: "0 auto 2.5rem", background: "#fff", padding: "20px", borderRadius: "24px", border: "1px solid #e2e8f0", boxShadow: "0 10px 30px -10px rgba(0,0,0,0.04)" }}>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-end' }}>

                    {/* Search */}
                    <div style={{ flex: '2', minWidth: '250px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '8px', marginLeft: '4px' }}>SEARCH RECORDS</label>
                        <div style={{ position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input
                                type="text"
                                placeholder="ID or Status..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ width: '100%', padding: '12px 12px 12px 45px', borderRadius: '14px', border: '1px solid #e2e8f0', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }}
                            />
                        </div>
                    </div>

                    {/* Date From */}
                    <div style={{ flex: '1', minWidth: '160px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '8px', marginLeft: '4px' }}>FROM DATE</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            style={{ width: '100%', padding: '11px', borderRadius: '14px', border: '1px solid #e2e8f0', outline: 'none', background: '#f8fafc', color: '#475569', boxSizing: 'border-box' }}
                        />
                    </div>

                    {/* Date To */}
                    <div style={{ flex: '1', minWidth: '160px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '8px', marginLeft: '4px' }}>TO DATE</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            style={{ width: '100%', padding: '11px', borderRadius: '14px', border: '1px solid #e2e8f0', outline: 'none', background: '#f8fafc', color: '#475569', boxSizing: 'border-box' }}
                        />
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={resetFilters} style={{ padding: '12px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', color: '#64748b' }} title="Reset Filters">
                            <RefreshCcw size={20} />
                        </button>
                        <button
                            onClick={handleDownloadPDF}
                            disabled={isExporting}
                            style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#0f172a', color: '#fff', padding: '12px 24px', borderRadius: '14px', border: 'none', fontWeight: '600', cursor: 'pointer' }}
                        >
                            {isExporting ? <Activity size={18} className="spin" /> : <Download size={18} />}
                            {isExporting ? "Exporting..." : "Export PDF"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Grid Area */}
            <div ref={reportRef} style={{ maxWidth: "1250px", margin: "0 auto" }}>
                {filteredTrips.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '100px 20px', background: '#fff', borderRadius: '30px', border: '2px dashed #e2e8f0' }}>
                        <div style={{ width: '80px', height: '80px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <Filter size={32} color="#94a3b8" />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', color: '#1e293b', marginBottom: '10px' }}>No matches found</h3>
                        <p style={{ color: '#64748b' }}>Try changing your keywords or date range to see more results.</p>
                        <button onClick={resetFilters} style={{ marginTop: '20px', color: '#3b82f6', background: 'none', border: 'none', fontWeight: '700', cursor: 'pointer' }}>Clear all filters</button>
                    </div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "1.5rem" }}>
                        {filteredTrips.map((trip) => {
                            const history = tripHistory[trip.tripId] || [];
                            const date = history.length > 0 ? history[0].eventTime : null;
                            return (
                                <div key={trip.tripId} onClick={() => setSelectedTrip(trip)} className="card-hover" style={{ background: "#fff", borderRadius: "28px", padding: "1.75rem", border: "1px solid #f1f5f9", cursor: "pointer", transition: "all 0.3s ease", position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                        <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '15px' }}>
                                            <Box size={24} color="#3b82f6" />
                                        </div>
                                        <div style={{ background: '#ecfdf5', color: '#059669', padding: '6px 15px', borderRadius: '99px', fontSize: '11px', fontWeight: '900' }}>
                                            {trip.status}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700', letterSpacing: '0.05em' }}>TRIP REFERENCE</div>
                                    <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#0f172a', margin: '5px 0 1.2rem' }}>#{trip.tripId}</h2>
                                    <div style={{ display: 'flex', gap: '25px', paddingTop: '1.2rem', borderTop: '1px solid #f8fafc' }}>
                                        <div>
                                            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', marginBottom: '4px' }}>COMPLETED ON</div>
                                            <div style={{ fontSize: '14px', fontWeight: '700', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Calendar size={14} /> {formatDate(date)}
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', marginBottom: '4px' }}>ACTIVITY LOG</div>
                                            <div style={{ fontSize: '14px', fontWeight: '700', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
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

            {/* Detail Modal */}
            {selectedTrip && (
                <div className="overlay" onClick={() => setSelectedTrip(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '24px 32px', background: '#0f172a', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800' }}>Audit Trail</h3>
                                <p style={{ margin: '4px 0 0', opacity: 0.6, fontSize: '0.9rem' }}>Manifest Details for #{selectedTrip.tripId}</p>
                            </div>
                            <button onClick={() => setSelectedTrip(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '12px', padding: '10px', color: '#fff', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        <div style={{ padding: '32px', maxHeight: '65vh', overflowY: 'auto' }}>
                            <div style={{ borderLeft: '2px solid #e2e8f0', marginLeft: '10px', paddingLeft: '30px' }}>
                                {(tripHistory[selectedTrip.tripId] || []).map((step, idx) => (
                                    <div key={idx} style={{ position: 'relative', marginBottom: '35px' }}>
                                        <div style={{ position: 'absolute', left: '-37px', top: '2px', width: '14px', height: '14px', background: idx === 0 ? '#3b82f6' : '#fff', border: '3px solid #3b82f6', borderRadius: '50%', zIndex: 2 }} />
                                        <div style={{ fontWeight: '800', fontSize: '15px', color: '#1e293b' }}>{step.status}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>
                                            <Clock size={12} /> {new Date(step.eventTime).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .card-hover:hover { transform: translateY(-10px); border-color: #3b82f640; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.08); }
                .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; }
                .modal { background: #fff; width: 100%; maxWidth: 500px; borderRadius: 32px; overflow: hidden; animation: pop 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28); }
                .spin { animation: rotate 1s linear infinite; }
                @keyframes pop { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                @keyframes rotate { to { transform: rotate(360deg); } }
                ::-webkit-scrollbar { width: 8px; }
                ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}</style>
        </div>
    );
}

export default CompletedTrips;