
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const CancellationInfo = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const reportRef = useRef(null);
    const API = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const fetchCancellationDetails = async () => {
            try {
                const res = await axios.get(`${API}/api/cancellations/trip/${id}`);
                setData(res.data);
            } catch (err) {
                console.error("Error fetching cancellation details:", err);
                setData(null);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchCancellationDetails();
    }, [id, API]);

    const handleDownloadPDF = async () => {
        const element = reportRef.current;

        // Hide UI elements so they don't appear in the PDF
        const buttons = element.querySelectorAll('.no-pdf');
        buttons.forEach(btn => btn.style.visibility = 'hidden');

        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: "#ffffff"
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const imgProps = pdf.getImageProperties(imgData);
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Cancellation_Report_Trip_${id}.pdf`);
        } catch (error) {
            console.error("PDF Generation Error:", error);
        } finally {
            buttons.forEach(btn => btn.style.visibility = 'visible');
        }
    };

    if (loading) return <div style={styles.loader}>Fetching cancellation records...</div>;

    if (!data) return (
        <div style={styles.container}>
            <div style={styles.errorCard}>
                <h3>No Record Found</h3>
                <p>No cancellation data exists for Trip ID #{id}</p>
                <button onClick={() => navigate(-1)} style={styles.backBtnDark}>Back to Dashboard</button>
            </div>
        </div>
    );

    return (
        <div style={styles.container}>
            <div style={styles.card} ref={reportRef}>
                {/* Updated Header with Cancellation Title */}
                <div style={styles.header}>
                    <button
                        onClick={() => navigate(-1)}
                        style={styles.backBtn}
                        className="no-pdf"
                    >
                        ← Back
                    </button>
                    <h2 style={styles.title}>Cancellation Report Info</h2>
                    <span style={styles.tripBadge}>Trip #{data.tripId}</span>
                </div>

                <div style={styles.content}>
                    <div style={styles.infoRow}>
                        <strong>Driver Name:</strong>
                        <span style={styles.highlightText}>{data.driverName}</span>
                    </div>
                    <div style={styles.infoRow}>
                        <strong>Employee Code:</strong>
                        <span>{data.eCode}</span>
                    </div>

                    <hr style={styles.divider} />

                    <div style={styles.reasonBox}>
                        <h3 style={styles.reasonTitle}>Cancellation Reason</h3>
                        <p style={styles.reasonText}>{data.reason || "No reason selected"}</p>
                    </div>

                    <div style={styles.infoRow}>
                        <strong>Cancellation Date:</strong>
                        <span>{data.cancelledAt ? new Date(data.cancelledAt).toLocaleString() : "N/A"}</span>
                    </div>

                    <div style={styles.remarksBox}>
                        <strong>Additional Remarks:</strong>
                        <p style={styles.remarksText}>
                            {data.remarks || "No additional remarks were provided for this cancellation."}
                        </p>
                    </div>
                </div>

                <div style={styles.footer} className="no-pdf">
                    <button onClick={handleDownloadPDF} style={styles.downloadBtn}>
                        📄 Download PDF Report
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ================= STYLES ================= */

const styles = {
    container: { padding: '40px', background: '#f8fafc', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' },
    card: { background: '#fff', width: '100%', maxWidth: '650px', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #e2e8f0' },
    header: { padding: '25px', background: '#ef4444', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    title: { margin: 0, fontSize: '22px', fontWeight: '700' },
    backBtn: { background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', cursor: 'pointer', padding: '6px 12px', borderRadius: '6px', fontSize: '14px' },
    tripBadge: { background: '#fff', color: '#ef4444', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '800' },
    content: { padding: '35px' },
    infoRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '18px', fontSize: '16px', color: '#334155' },
    highlightText: { color: '#1e293b', fontWeight: '600' },
    divider: { border: '0', borderTop: '1px solid #f1f5f9', margin: '25px 0' },
    reasonBox: { background: '#fff1f2', padding: '20px', borderRadius: '12px', marginBottom: '25px', borderLeft: '5px solid #ef4444' },
    reasonTitle: { margin: '0 0 8px 0', fontSize: '13px', color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.5px' },
    reasonText: { margin: 0, fontSize: '20px', fontWeight: '800', color: '#b91c1c' },
    remarksBox: { marginTop: '25px' },
    remarksText: { background: '#f8fafc', padding: '15px', borderRadius: '10px', color: '#64748b', fontStyle: 'italic', marginTop: '10px', lineHeight: '1.6', border: '1px solid #e2e8f0' },
    footer: { padding: '20px 35px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', textAlign: 'right', display: 'flex', justifyContent: 'flex-end' },
    downloadBtn: { padding: '12px 24px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '15px' },
    loader: { textAlign: 'center', padding: '100px', fontSize: '18px', color: '#64748b' },
    errorCard: { textAlign: 'center', background: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
    backBtnDark: { background: '#475569', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', marginTop: '15px' }
};

export default CancellationInfo;