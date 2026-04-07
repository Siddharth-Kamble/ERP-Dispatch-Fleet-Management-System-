
import React from 'react';
import { FaExclamationTriangle, FaTruck, FaCalendarAlt, FaCommentDots } from 'react-icons/fa';


const CancelledTrips = ({ cancelledTrips }) => {

    // Function to format the timestamp coming from Spring Boot
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="section-container">
            <header className="section-header-flex">
                <h2 className="section-heading">Cancelled Trip History</h2>
                <span className="count-badge">{cancelledTrips.length} Total Logs</span>
            </header>

            <div className="horizontal-list">
                {cancelledTrips && cancelledTrips.length === 0 ? (
                    <div className="empty-box">
                        <FaExclamationTriangle size={30} color="#cbd5e1" />
                        <p>No cancelled trips found for your account.</p>
                    </div>
                ) : (
                    cancelledTrips.map((log) => (
                        <div className="horizontal-request-row cancelled-row" key={log.id}>
                            {/* Left Status Bar (Red for Cancellation) */}
                            <div className="status-indicator-red"></div>

                            {/* Icon Section */}
                            <div className="row-icon-container">
                                <FaExclamationTriangle className="icon-alert" />
                            </div>

                            {/* Vehicle Details */}
                            <div className="row-details">
                                <span className="row-label"><FaTruck /> Vehicle</span>
                                <span className="row-data">{log.vehicleNumber || "N/A"}</span>
                            </div>

                            {/* Reason for Rejection */}
                            <div className="row-details">
                                <span className="row-label">Reason</span>
                                <span className="row-data reason-text">{log.reason}</span>
                            </div>

                            {/* Date & Time */}
                            <div className="row-details">
                                <span className="row-label"><FaCalendarAlt /> Cancelled On</span>
                                <span className="row-data">{formatDate(log.cancelledAt)}</span>
                            </div>

                            {/* Remarks - Flexible Width */}
                            <div className="row-details remarks-section">
                                <span className="row-label"><FaCommentDots /> Driver Remarks</span>
                                <span className="row-data italic-subtext">
                                    "{log.remarks || "No additional comments provided"}"
                                </span>
                            </div>

                            {/* Trip ID Badge */}
                            <div className="row-id-tag">
                                ID: #{log.tripId || log.id}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <style>{`
                * { box-sizing: border-box; }

                /* ===== HEADER ===== */
                .section-header-flex {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                    gap: 10px;
                }
                .count-badge {
                    background: #fee2e2;
                    color: #ef4444;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 700;
                    white-space: nowrap;
                }

                /* ===== CANCELLED ROW — DESKTOP GRID ===== */
                .cancelled-row {
                    position: relative;
                    display: grid !important;
                    grid-template-columns: 50px 1fr 1.5fr 1.5fr 2fr 80px !important;
                    align-items: center;
                    gap: 12px;
                    overflow: hidden;
                    padding: 16px 20px 16px 24px !important;
                }

                /* ===== LEFT RED BAR ===== */
                .status-indicator-red {
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 5px;
                    background: #ef4444;
                }

                /* ===== ICON ===== */
                .row-icon-container {
                    background: #fef2f2;
                    height: 40px;
                    width: 40px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .icon-alert { color: #ef4444; font-size: 18px; }

                /* ===== TEXT STYLES ===== */
                .reason-text { color: #b91c1c; }
                .italic-subtext {
                    font-style: italic;
                    font-weight: 400 !important;
                    font-size: 13px !important;
                    color: #64748b;
                }
                .row-id-tag {
                    font-size: 10px;
                    color: #94a3b8;
                    text-align: right;
                    align-self: flex-start;
                    white-space: nowrap;
                }

                /* ===== EMPTY BOX ===== */
                .empty-box {
                    text-align: center;
                    padding: 50px 20px;
                    background: #f8fafc;
                    border: 2px dashed #e2e8f0;
                    border-radius: 12px;
                    color: #64748b;
                }

                /* ===== REMARKS DIVIDER ===== */
                .remarks-section {
                    border-left: 1px solid #f1f5f9;
                    padding-left: 15px;
                }

                /* ===== TABLET (≤900px): collapse to 3-col grid ===== */
                @media (max-width: 900px) {
                    .cancelled-row {
                        grid-template-columns: 50px 1fr 1fr !important;
                        grid-template-rows: auto auto auto;
                        padding: 16px 16px 16px 22px !important;
                        gap: 10px 14px;
                    }
                    /* Icon spans col 1, rows 1–2 */
                    .row-icon-container {
                        grid-column: 1;
                        grid-row: 1 / 3;
                        align-self: start;
                        margin-top: 2px;
                    }
                    /* Vehicle → col 2 row 1 */
                    .cancelled-row .row-details:nth-child(3) { grid-column: 2; grid-row: 1; }
                    /* Reason → col 3 row 1 */
                    .cancelled-row .row-details:nth-child(4) { grid-column: 3; grid-row: 1; }
                    /* Date → col 2 row 2 */
                    .cancelled-row .row-details:nth-child(5) { grid-column: 2; grid-row: 2; }
                    /* Remarks → col 3 row 2, no left border */
                    .cancelled-row .remarks-section {
                        grid-column: 3;
                        grid-row: 2;
                        border-left: none;
                        padding-left: 0;
                    }
                    /* ID badge → full-width bottom row */
                    .row-id-tag {
                        grid-column: 1 / -1;
                        text-align: right;
                        padding-top: 6px;
                        border-top: 1px solid #f1f5f9;
                    }
                }

                /* ===== MOBILE (≤600px): single column stacked card ===== */
                @media (max-width: 600px) {
                    .section-heading { font-size: 17px !important; }

                    .cancelled-row {
                        display: flex !important;
                        flex-direction: column !important;
                        align-items: flex-start !important;
                        gap: 10px !important;
                        padding: 14px 14px 14px 20px !important;
                    }

                    /* Show icon inline at top with vehicle number */
                    .row-icon-container {
                        display: none;
                    }

                    /* All detail rows full width */
                    .cancelled-row .row-details {
                        width: 100%;
                    }

                    /* Remarks: remove left border on mobile, add top separator */
                    .cancelled-row .remarks-section {
                        border-left: none;
                        padding-left: 0;
                        border-top: 1px dashed #f1f5f9;
                        padding-top: 8px;
                    }

                    /* ID badge: right-align at bottom */
                    .row-id-tag {
                        align-self: flex-end;
                        font-size: 11px;
                        border-top: 1px solid #f1f5f9;
                        width: 100%;
                        text-align: right;
                        padding-top: 6px;
                    }

                    .empty-box { padding: 40px 16px; }
                    .italic-subtext { font-size: 12px !important; }
                }

                /* ===== VERY SMALL (≤380px) ===== */
                @media (max-width: 380px) {
                    .cancelled-row { padding: 12px 12px 12px 18px !important; }
                    .row-data { font-size: 13px !important; }
                    .row-label { font-size: 10px !important; }
                }
            `}</style>
        </div>
    );
};

export default CancelledTrips;
