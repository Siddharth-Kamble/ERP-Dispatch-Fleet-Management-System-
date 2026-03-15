
import React, { useEffect, useState } from "react";
import {
    FaArrowLeft, FaEye, FaDownload, FaSearch,
    FaFileInvoice, FaUserEdit, FaCalendarAlt, FaFileAlt
} from "react-icons/fa";

function ViewUploadedPlans({ onBack }) {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
  fetch(`${process.env.REACT_APP_API_URL}/api/files/all`)
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch files");
      return res.json();
    })
    .then(data => {
      setFiles(Array.isArray(data) ? data : []);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setError("Unable to retrieve production plans.");
      setLoading(false);
    });
}, []);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const handleView = (id) => {
  window.open(
    `${process.env.REACT_APP_API_URL}/api/files/download/${id}`,
    "_blank"
  );
};

   const handleDownload = (id, fileName) => {
  const link = document.createElement("a");

  link.href = `${process.env.REACT_APP_API_URL}/api/files/download/${id}`;
  link.setAttribute("download", fileName || "production_plan");

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

    // --- LOGIC: FILTER AND SORT (NEWEST FIRST) ---
    const processedFiles = files
        .filter(f =>
            f.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase())
        )
        // Sort by date: Newest (highest timestamp) to Oldest
        .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    return (
        <div style={styles.pageWrapper}>
            <div style={styles.topBar}>
                <button style={styles.backButton} onClick={onBack}>
                    <FaArrowLeft /> Back
                </button>
                <div style={styles.searchContainer}>
                    <FaSearch style={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search plans or users..."
                        style={styles.searchInput}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div style={styles.headerSection}>
                <h2 style={styles.title}>
                    <FaFileInvoice style={{ color: "#2563eb", marginRight: 12 }} />
                    Uploaded Production Plans
                </h2>
                <p style={styles.subtitle}>Showing latest uploads first.</p>
            </div>

            {loading ? (
                <div style={styles.loaderContainer}>
                    <p>Fetching plans from server...</p>
                </div>
            ) : error ? (
                <div style={styles.errorCard}>{error}</div>
            ) : (
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                        <tr>
                            <th style={styles.th}><FaFileAlt /> File Name</th>
                            <th style={styles.th}><FaUserEdit /> Uploaded By</th>
                            <th style={styles.th}><FaCalendarAlt /> Date & Time</th>
                            <th style={{...styles.th, textAlign: 'center'}}>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {processedFiles.length > 0 ? processedFiles.map((file) => (
                            <tr key={file.id} style={styles.tr}>
                                <td style={styles.td}>
                                    <span style={styles.fileNameText}>{file.fileName}</span>
                                    {/* Sublte "New" tag for the very first item if it's very recent */}
                                    {processedFiles[0].id === file.id && (
                                        <span style={styles.newTag}>Latest</span>
                                    )}
                                </td>
                                <td style={styles.td}>
                                    <div style={styles.userBadge}>{file.uploadedBy}</div>
                                </td>
                                <td style={styles.td}>
                                    <span style={styles.dateText}>{formatDate(file.uploadedAt)}</span>
                                </td>
                                <td style={{...styles.td, textAlign: 'center'}}>
                                    <div style={styles.actionGroup}>
                                        <button
                                            style={styles.viewBtn}
                                            onClick={() => handleView(file.id)}
                                            title="View Online"
                                        >
                                            <FaEye /> View
                                        </button>
                                        <button
                                            style={styles.downloadBtn}
                                            onClick={() => handleDownload(file.id, file.fileName)}
                                            title="Download Local"
                                        >
                                            <FaDownload />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" style={styles.noData}>No plans match your search.</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// Added a small "newTag" style to the existing styles object
const styles = {
    // ... all your existing styles ...
    pageWrapper: { animation: "fadeIn 0.4s ease-out", padding: "10px" },
    topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 },
    backButton: { display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "#ffffff", color: "#1e293b", border: "1px solid #e2e8f0", borderRadius: 10, fontWeight: "600", cursor: "pointer", transition: "0.2s", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" },
    searchContainer: { position: "relative", width: "300px" },
    searchIcon: { position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" },
    searchInput: { width: "100%", padding: "10px 10px 10px 35px", borderRadius: 10, border: "1px solid #e2e8f0", outline: "none", fontSize: "14px", transition: "border 0.2s" },
    headerSection: { marginBottom: 25 },
    title: { fontSize: "24px", fontWeight: "700", color: "#0f172a", margin: 0, display: "flex", alignItems: "center" },
    subtitle: { color: "#64748b", marginTop: 5, fontSize: "15px" },
    tableContainer: { background: "#ffffff", borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.04)", overflow: "hidden" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { padding: "16px 20px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" },
    tr: { transition: "background 0.2s", borderBottom: "1px solid #f1f5f9" },
    td: { padding: "16px 20px", verticalAlign: "middle" },
    fileNameText: { fontWeight: "600", color: "#334155", fontSize: "14px" },
    newTag: { marginLeft: '8px', padding: '2px 8px', background: '#dcfce7', color: '#166534', borderRadius: '4px', fontSize: '10px', textTransform: 'uppercase' },
    userBadge: { display: "inline-block", padding: "4px 12px", background: "#eff6ff", color: "#1e40af", borderRadius: "20px", fontSize: "12px", fontWeight: "500" },
    dateText: { fontSize: "13px", color: "#64748b" },
    actionGroup: { display: "flex", gap: 8, justifyContent: "center" },
    viewBtn: { padding: "8px 14px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: "13px", fontWeight: "600", display: "flex", alignItems: "center", gap: 6, transition: "transform 0.2s" },
    downloadBtn: { padding: "8px 12px", background: "#f1f5f9", color: "#475569", border: "none", borderRadius: 8, cursor: "pointer", transition: "0.2s" },
    noData: { padding: "40px", textAlign: "center", color: "#94a3b8", fontSize: "15px" },
    errorCard: { padding: "20px", background: "#fef2f2", color: "#b91c1c", borderRadius: 12, border: "1px solid #fee2e2", textAlign: "center" },
    loaderContainer: { padding: "40px", textAlign: "center" }
};

export default ViewUploadedPlans;