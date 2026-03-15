
import { useEffect, useState, useCallback, useMemo } from "react";
import driverService from "../Services/driverService";

function Drivers() {
    const [drivers, setDrivers] = useState([]);
    const [driverUsers, setDriverUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editId, setEditId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    const [form, setForm] = useState({
        name: "",
        mobile: "",
        licenseNo: "",
        joiningDate: "",
    });

    const user = JSON.parse(localStorage.getItem("user"));
    const eCode = user?.eCode;

    const loadDrivers = useCallback(async () => {
        const data = await driverService.getAll(eCode);
        setDrivers(Array.isArray(data) ? data : []);
    }, [eCode]);

    const loadDriverUsers = useCallback(async () => {
        try {
          const res = await fetch(`${process.env.REACT_APP_API_URL}/api/users/drivers`);
            const data = await res.json();
            setDriverUsers(data || []);
        } catch (e) {
            console.error("User fetch failed", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (eCode) {
            loadDrivers();
            loadDriverUsers();
        }
    }, [eCode, loadDrivers, loadDriverUsers]);

    /* SUBMIT */
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editId)
            await driverService.update(editId, form, eCode);
        else
            await driverService.create(form, eCode);

        setEditId(null);
        setForm({ name: "", mobile: "", licenseNo: "", joiningDate: "" });
        loadDrivers();
    };

    /* EDIT */
    const handleEdit = (d) => {
        setForm(d);
        setEditId(d.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    /* SEARCH FILTER LOGIC */
    const filteredDrivers = useMemo(() => {
        return drivers.filter(d =>
            d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.licenseNo?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [drivers, searchQuery]);

    /* NEW: BULK EXPORT TO EXCEL (CSV) */
    const handleExport = () => {
        if (drivers.length === 0) return;

        // Define Headers
        const headers = ["Driver ID", "Name", "Mobile", "License Number", "Joining Date"];

        // Map data to rows
        const rows = drivers.map(d => [
            d.id,
            d.name,
            d.mobile || "N/A",
            d.licenseNo,
            d.joiningDate || "—"
        ]);

        // Create CSV content
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        // Trigger Download
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Fleet_Drivers_Report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div style={styles.container}>
            {/* TOP ANALYTICS HEADER */}
            <div style={styles.header}>
                <div>
                    <h2 style={styles.title}>🚚 Driver Management</h2>
                    <p style={styles.subtitle}>Onboard, track, and manage your fleet personnel efficiently.</p>
                </div>
                <div style={styles.statsRow}>
                    <div style={styles.statCard}>
                        <div style={styles.statIcon}>👥</div>
                        <div>
                            <span style={styles.statLabel}>Total Drivers</span>
                            <span style={styles.statValue}>{drivers.length}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={styles.mainGrid}>
                {/* LEFT COLUMN: REGISTRATION FORM */}
                <div style={styles.sideColumn}>
                    <div style={styles.card}>
                        <div style={styles.cardHeader}>
                            <h3 style={styles.cardTitle}>{editId ? "Update Profile" : "New Registration"}</h3>
                            {editId && <button onClick={() => {setEditId(null); setForm({name:"", mobile:"", licenseNo:"", joiningDate:""})}} style={styles.cancelBtn}>Cancel</button>}
                        </div>

                        <form onSubmit={handleSubmit} style={styles.formContainer}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Full Name</label>
                                <select
                                    style={styles.select}
                                    value={form.name}
                                    onChange={(e)=>setForm({...form, name:e.target.value})}
                                    required
                                >
                                    <option value="">Select registered user...</option>
                                    {driverUsers.map(u=>(
                                        <option key={u.id} value={u.fullName}>{u.fullName}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Mobile Number</label>
                                <input
                                    style={styles.input}
                                    placeholder="Enter mobile"
                                    value={form.mobile}
                                    onChange={(e)=>setForm({...form, mobile:e.target.value})}
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>License Number</label>
                                <input
                                    style={styles.input}
                                    placeholder="DL-00000000"
                                    value={form.licenseNo}
                                    onChange={(e)=>setForm({...form, licenseNo:e.target.value})}
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Joining Date</label>
                                <input
                                    style={styles.input}
                                    type="date"
                                    value={form.joiningDate}
                                    onChange={(e)=>setForm({...form, joiningDate:e.target.value})}
                                />
                            </div>

                            <button style={{...styles.submitBtn, backgroundColor: editId ? '#3b82f6' : '#0f172a'}}>
                                {editId ? "💾 Save Changes" : "➕ Register Driver"}
                            </button>
                        </form>
                    </div>
                </div>

                {/* RIGHT COLUMN: DIRECTORY & SEARCH */}
                <div style={styles.directoryColumn}>
                    <div style={styles.card}>
                        <div style={styles.directoryHeader}>
                            <h3 style={styles.cardTitle}>Fleet Directory</h3>

                            <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
                                {/* SEARCH BAR */}
                                <div style={styles.searchWrapper}>
                                    <span style={styles.searchIcon}>🔍</span>
                                    <input
                                        style={styles.searchInput}
                                        placeholder="Search name or license..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                {/* EXCEL EXPORT BUTTON */}
                                <button onClick={handleExport} style={styles.exportBtn} title="Export to CSV/Excel">
                                    Excel 📥
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div style={styles.loader}>
                                <div className="loading-spinner"></div>
                                <p>Syncing Driver Data...</p>
                            </div>
                        ) : filteredDrivers.length === 0 ? (
                            <div style={styles.emptyState}>
                                <span style={{fontSize: '40px'}}>📭</span>
                                <p>No drivers found matching your search.</p>
                            </div>
                        ) : (
                            <div style={styles.tableWrapper}>
                                <table style={styles.table}>
                                    <thead>
                                    <tr>
                                        <th style={styles.th}>Driver Details</th>
                                        <th style={styles.th}>Mobile</th>
                                        <th style={styles.th}>License ID</th>
                                        <th style={styles.th}>Joined</th>
                                        <th style={{...styles.th, textAlign: 'right'}}>Action</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {filteredDrivers.map(d=>(
                                        <tr key={d.id} className="row-hover">
                                            <td style={styles.td}>
                                                <div style={styles.nameCell}>
                                                    <div style={styles.avatar}>{d.name?.charAt(0)}</div>
                                                    <div>
                                                        <div style={{fontWeight: '700', color: '#1e293b'}}>{d.name}</div>
                                                        <div style={{fontSize: '11px', color: '#94a3b8'}}>Driver ID: #{d.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={styles.td}>{d.mobile || "N/A"}</td>
                                            <td style={styles.td}>
                                                <span style={styles.licenseBadge}>{d.licenseNo}</span>
                                            </td>
                                            <td style={styles.td}>{d.joiningDate || "—"}</td>
                                            <td style={{...styles.td, textAlign: 'right'}}>
                                                <button
                                                    style={styles.editBtn}
                                                    onClick={()=>handleEdit(d)}
                                                >
                                                    Edit Profile
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

                .row-hover { transition: 0.2s; }
                .row-hover:hover { background-color: #f8fafc !important; }

                .loading-spinner {
                    width: 30px; height: 30px; border: 3px solid #f1f5f9; border-top: 3px solid #3b82f6;
                    border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 10px;
                }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

                input:focus, select:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); outline: none; }
                button:active { transform: scale(0.96); }
            `}</style>
        </div>
    );
}

const styles = {
    container: { padding: '40px', backgroundColor: '#f4f7fa', minHeight: '100vh', fontFamily: "'Inter', sans-serif" },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' },
    title: { fontSize: '30px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.5px' },
    subtitle: { color: '#64748b', marginTop: '6px', fontSize: '15px' },
    statsRow: { display: 'flex', gap: '20px' },
    statCard: { backgroundColor: '#fff', padding: '15px 25px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
    statIcon: { fontSize: '24px', backgroundColor: '#eff6ff', padding: '10px', borderRadius: '12px' },
    statLabel: { fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' },
    statValue: { display: 'block', fontSize: '24px', fontWeight: '800', color: '#1e293b' },

    mainGrid: { display: 'grid', gridTemplateColumns: '350px 1fr', gap: '30px', alignItems: 'start' },
    sideColumn: { position: 'sticky', top: '20px' },
    card: { backgroundColor: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.04)', overflow: 'hidden' },
    cardHeader: { padding: '25px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    cardTitle: { fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 },
    formContainer: { padding: '25px', display: 'flex', flexDirection: 'column', gap: '18px' },

    inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '13px', fontWeight: '600', color: '#475569' },
    input: { padding: '12px 15px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', transition: '0.2s' },
    select: { padding: '12px 15px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#fff', cursor: 'pointer' },
    submitBtn: { color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', transition: '0.2s', fontSize: '14px' },
    cancelBtn: { background: '#fff1f2', color: '#e11d48', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },

    directoryHeader: { padding: '25px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fcfcfd' },
    searchWrapper: { position: 'relative', width: '220px' },
    searchIcon: { position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '14px' },
    searchInput: { width: '100%', padding: '10px 15px 10px 40px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' },
    exportBtn: { backgroundColor: '#10b981', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', fontSize: '13px' },

    tableWrapper: { padding: '10px' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '15px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', borderBottom: '1px solid #f1f5f9' },
    td: { padding: '18px 20px', borderBottom: '1px solid #f1f5f9', fontSize: '14px' },
    nameCell: { display: 'flex', alignItems: 'center', gap: '15px' },
    avatar: { width: '38px', height: '38px', borderRadius: '12px', backgroundColor: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '16px', boxShadow: '0 4px 6px rgba(59, 130, 246, 0.2)' },
    licenseBadge: { backgroundColor: '#f1f5f9', padding: '5px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', color: '#475569', border: '1px solid #e2e8f0', letterSpacing: '0.5px' },
    editBtn: { background: 'white', border: '1px solid #e2e8f0', color: '#475569', padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: '0.2s' },

    loader: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px', color: '#64748b' },
    emptyState: { textAlign: 'center', padding: '60px', color: '#94a3b8' }
};

export default Drivers;