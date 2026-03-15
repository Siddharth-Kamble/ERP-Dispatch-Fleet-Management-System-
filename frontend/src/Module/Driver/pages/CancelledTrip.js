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

            <style jsx>{`
                .section-header-flex {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                .count-badge {
                    background: #fee2e2;
                    color: #ef4444;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 700;
                }
                .cancelled-row {
                    position: relative;
                    grid-template-columns: 60px 1fr 1.5fr 1.5fr 2fr 80px !important;
                    overflow: hidden;
                }
                .status-indicator-red {
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 5px;
                    background: #ef4444;
                }
                .row-icon-container {
                    background: #fef2f2;
                    height: 40px;
                    width: 40px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .icon-alert { color: #ef4444; font-size: 18px; }
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
                }
                .empty-box {
                    text-align: center;
                    padding: 50px;
                    background: #f8fafc;
                    border: 2px dashed #e2e8f0;
                    border-radius: 12px;
                    color: #64748b;
                }
                .remarks-section {
                    border-left: 1px solid #f1f5f9;
                    padding-left: 15px;
                }
            `}</style>
        </div>
    );
};

export default CancelledTrips;