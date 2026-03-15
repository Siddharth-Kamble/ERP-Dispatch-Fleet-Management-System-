
    import React, { useEffect, useState, useMemo } from "react"; // Added useMemo
    import axios from "axios";
    import {
        FaTruck, FaPlusCircle, FaHistory, FaWallet,
        FaTimes, FaChevronRight, FaRegCalendarAlt,
        FaFileDownload, FaFilter, FaGasPump, FaTools, FaRoad,
        FaSearch // Added FaSearch icon
    } from "react-icons/fa";

    export default function DriverExpensePage() {
        const user = JSON.parse(localStorage.getItem("user"));
        const eCode = user?.eCode;

        // --- State Management ---
        const [vehicles, setVehicles] = useState([]);
        const [loading, setLoading] = useState(true);
        const [selectedVehicle, setSelectedVehicle] = useState(null);
        const [showAddModal, setShowAddModal] = useState(false);
        const [showHistoryModal, setShowHistoryModal] = useState(false);
        const [expenseHistory, setExpenseHistory] = useState([]);
        const [submitting, setSubmitting] = useState(false);
        const [searchQuery, setSearchQuery] = useState(""); // NEW: Search Query State

        // --- Filters & Form ---
        const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
        const [filterYear, setFilterYear] = useState(new Date().getFullYear());
        const [formData, setFormData] = useState({
            type: "FUEL",
            amount: "",
            description: "",
            date: new Date().toISOString().split('T')[0]
        });

        // --- Data Fetching ---
        useEffect(() => {
            if (!eCode) return;
            const loadVehicles = async () => {
                try {
                   const res = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/trips/driver/${eCode}/unique-vehicles`
    );
                    setVehicles(res.data || []);
                } catch (err) { console.error("Fleet Load Error", err); }
                finally { setLoading(false); }
            };
            loadVehicles();
        }, [eCode]);

        // --- NEW: Search Filter Logic ---
        const filteredVehicles = useMemo(() => {
            return vehicles.filter((v) => {
                const vNum = typeof v === "string" ? v : v.vehicleNumber;
                return vNum.toLowerCase().includes(searchQuery.toLowerCase());
            });
        }, [vehicles, searchQuery]);

        const handleOpenHistory = async (v) => {
            const vNum = typeof v === "string" ? v : v.vehicleNumber;
            setSelectedVehicle(vNum);
            setShowHistoryModal(true);
            try {
                const res = await axios.get(`http://localhost:8080/api/expenses/view/${vNum}`, {
                    params: { eCode: eCode }
                });
                setExpenseHistory(res.data || []);
            } catch (err) { setExpenseHistory([]); }
        };

        const handleSubmitExpense = async (e) => {
            e.preventDefault();
            setSubmitting(true);
            const vNum = typeof selectedVehicle === "string" ? selectedVehicle : selectedVehicle.vehicleNumber;
            try {
                await axios.post(`http://localhost:8080/api/expenses/add`, {
                    ...formData,
                    vehicleNumber: vNum,
                    driverECode: eCode,
                    amount: parseFloat(formData.amount)
                });
                alert("Expense Saved!");
                setShowAddModal(false);
                setFormData({ ...formData, amount: "", description: "" });
            } catch (err) { alert("Save failed"); }
            finally { setSubmitting(false); }
        };

        // --- CSV & Calculation Logic ---
        const filteredHistory = expenseHistory.filter(h => {
            const d = new Date(h.date);
            return (d.getMonth() + 1) === parseInt(filterMonth) && d.getFullYear() === parseInt(filterYear);
        });

        const totalAmount = filteredHistory.reduce((sum, item) => sum + item.amount, 0);

        const downloadCSV = () => {
            const headers = "Date,Category,Description,Amount\n";
            const rows = filteredHistory.map(h => `${h.date},${h.type},"${h.description || ''}",${h.amount}`).join("\n");
            const blob = new Blob([headers + rows], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `Expense_Report_${selectedVehicle}.csv`;
            link.click();
        };

        return (
            <div className="dash-fit-wrapper">
                {/* STICKY HEADER */}
                <header className="dash-fit-header">
                    <div className="header-left">
                        <div className="icon-badge"><FaWallet /></div>
                        <div>
                            <h1>Vehicle Expenses</h1>
                            <p>Manage fleet costs and operational spending</p>
                        </div>
                    </div>
                    <div className="header-right">
                        {/* NEW: SEARCH INPUT */}
                        <div className="search-box-container">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                className="header-search-input"
                                placeholder="Search Plate Number..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="count-pill">Units: {filteredVehicles.length}</div>
                    </div>
                </header>

                {/* FLUID SCROLL AREA */}
                <main className="dash-fit-scroll">
                    {loading ? <div className="loading-state">Initialising Fleet View...</div> : (
                        <div className="card-grid">
                            {filteredVehicles.length > 0 ? filteredVehicles.map((v, i) => {
                                const vNum = typeof v === "string" ? v : v.vehicleNumber;
                                return (
                                    <div key={i} className="aesthetic-card">
                                        <div className="card-top">
                                            <div className="v-avatar">
                                                <FaTruck />
                                            </div>
                                            <div className="v-identity">
                                                <span className="v-status-badge">Available</span>
                                                <h3 className="v-plate">{vNum}</h3>
                                            </div>
                                        </div>

                                        <div className="card-middle">
                                            <div className="info-stat">
                                                <FaRegCalendarAlt />
                                                <span>Last Entry: Today</span>
                                            </div>
                                            <div className="info-stat">
                                                <FaGasPump />
                                                <span>Type: Commercial</span>
                                            </div>
                                        </div>

                                        <div className="card-actions">
                                            <button className="btn-secondary" onClick={() => handleOpenHistory(vNum)}>
                                                <FaHistory /> Logs
                                            </button>
                                            <button className="btn-primary" onClick={() => { setSelectedVehicle(vNum); setShowAddModal(true); }}>
                                                <FaPlusCircle /> Add Expense
                                            </button>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="no-results">No vehicles found matching "{searchQuery}"</div>
                            )}
                        </div>
                    )}
                </main>

                {/* VIEW HISTORY MODAL - [UNCHANGED] */}
                {showHistoryModal && (
                    <div className="modal-overlay">
                        <div className="modal-card wide">
                            <div className="modal-header">
                                <h3>Vehicle Logs: {selectedVehicle}</h3>
                                <FaTimes className="close-x" onClick={() => setShowHistoryModal(false)} />
                            </div>
                            <div className="filter-summary-row">
                                <div className="filter-group">
                                    <FaFilter size={12} color="#94a3b8" />
                                    <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
                                        {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m,i) => (
                                            <option key={i} value={i+1}>{m}</option>
                                        ))}
                                    </select>
                                    <select value={filterYear} onChange={e => setFilterYear(e.target.value)}>
                                        <option value="2025">2025</option>
                                        <option value="2026">2026</option>
                                    </select>
                                    <button className="btn-csv-export" onClick={downloadCSV}><FaFileDownload /> CSV</button>
                                </div>
                                <div className="total-group">
                                    <label>MONTHLY TOTAL</label>
                                    <h2>₹{totalAmount.toLocaleString('en-IN')}</h2>
                                </div>
                            </div>
                            <div className="table-wrapper">
                                <table className="record-table">
                                    <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Category</th>
                                        <th>Description</th>
                                        <th style={{textAlign:'right'}}>Amount</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {filteredHistory.length > 0 ? filteredHistory.map((h, i) => (
                                        <tr key={i}>
                                            <td>{h.date}</td>
                                            <td><span className={`cat-tag ${h.type}`}>{h.type}</span></td>
                                            <td className="desc-text">{h.description || "-"}</td>
                                            <td className="amt-text">₹{h.amount}</td>
                                        </tr>
                                    )) : <tr><td colSpan="4" className="empty-row">No records found for this period.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ADD EXPENSE MODAL - [UNCHANGED] */}
                {showAddModal && (
                    <div className="modal-overlay">
                        <div className="modal-card small">
                            <div className="modal-header">
                                <h3>Log Cost: {selectedVehicle}</h3>
                                <FaTimes className="close-x" onClick={() => setShowAddModal(false)} />
                            </div>
                            <form className="expense-form" onSubmit={handleSubmitExpense}>
                                <div className="form-item">
                                    <label>Category</label>
                                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                                        <option value="FUEL">Fuel</option>
                                        <option value="TOLL">Toll</option>
                                        <option value="MAINTENANCE">Maintenance</option>
                                        <option value="SERVICING">Servicing</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                                <div className="form-item">
                                    <label>Amount (₹)</label>
                                    <input type="number" step="0.01" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
                                </div>
                                <div className="form-item">
                                    <label>Date</label>
                                    <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                                </div>
                                <div className="form-item">
                                    <label>Remarks</label>
                                    <textarea placeholder="Add any details..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                                </div>
                                <button type="submit" className="confirm-btn" disabled={submitting}>
                                    {submitting ? "Saving..." : "Confirm & Save"}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                <style>{`
                    .dash-fit-wrapper {
                        height: 100%; width: 100%; display: flex; flex-direction: column;
                        background: #f1f5f9; box-sizing: border-box; padding: 25px; overflow: hidden;
                    }

                    .dash-fit-header {
                        display: flex; justify-content: space-between; align-items: center;
                        padding-bottom: 25px; flex-shrink: 0;
                    }
                    .header-right { display: flex; align-items: center; gap: 15px; }

                    /* NEW SEARCH STYLES */
                    .search-box-container { position: relative; display: flex; align-items: center; }
                    .search-icon { position: absolute; left: 12px; color: #94a3b8; font-size: 0.9rem; pointer-events: none; }
                    .header-search-input {
                        padding: 10px 15px 10px 38px; border-radius: 12px; border: 1px solid #e2e8f0;
                        font-size: 0.85rem; width: 220px; transition: all 0.3s ease; outline: none;
                    }
                    .header-search-input:focus { width: 300px; border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
                    .no-results { grid-column: 1 / -1; text-align: center; padding: 50px; color: #64748b; font-weight: 600; }

                    .icon-badge { background: #4f46e5; color: white; padding: 12px; border-radius: 14px; display: flex; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }
                    .header-left h1 { margin: 0; font-size: 1.6rem; color: #0f172a; font-weight: 800; letter-spacing: -0.5px; }
                    .header-left p { margin: 0; font-size: 0.9rem; color: #64748b; margin-top: 2px; }
                    .count-pill { background: white; color: #4f46e5; padding: 8px 18px; border-radius: 12px; font-weight: 800; font-size: 0.85rem; border: 1px solid #e2e8f0; }

                    /* SCROLL AREA & GRID */
                    .dash-fit-scroll { flex: 1; overflow-y: auto; padding-top: 5px; }
                    .card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }

                    /* CARDS */
                    .aesthetic-card {
                        background: white; border-radius: 20px; padding: 20px;
                        border: 1px solid #e2e8f0; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        position: relative; overflow: hidden; display: flex; flex-direction: column; gap: 15px;
                    }
                    .aesthetic-card:hover { transform: translateY(-5px); border-color: #4f46e5; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }

                    .card-top { display: flex; align-items: center; gap: 15px; }
                    .v-avatar {
                        width: 50px; height: 50px; background: #f8fafc; color: #6366f1;
                        display: flex; align-items: center; justify-content: center;
                        border-radius: 15px; font-size: 1.4rem; border: 1px solid #eef2ff;
                    }
                    .v-plate { margin: 0; font-size: 1.25rem; color: #1e293b; font-weight: 800; }
                    .v-status-badge { font-size: 0.65rem; text-transform: uppercase; color: #10b981; font-weight: 900; background: #dcfce7; padding: 2px 8px; border-radius: 6px; display: inline-block; margin-bottom: 4px; }

                    .card-middle { display: flex; gap: 15px; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; padding: 12px 0; }
                    .info-stat { display: flex; align-items: center; gap: 6px; font-size: 0.8rem; color: #64748b; font-weight: 500; }
                    .info-stat svg { color: #94a3b8; }

                    .card-actions { display: grid; grid-template-columns: 1fr 1.5fr; gap: 10px; }
                    .btn-primary {
                        background: #4f46e5; color: white; border: none; padding: 12px; border-radius: 12px;
                        font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 0.85rem;
                    }
                    .btn-secondary {
                        background: #f8fafc; color: #475569; border: 1px solid #e2e8f0; padding: 12px; border-radius: 12px;
                        font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 0.85rem;
                    }

                    /* MODALS */
                    .modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.6); backdrop-filter: blur(8px); display: flex; justify-content: center; align-items: center; z-index: 9999; }
                    .modal-card { background: white; border-radius: 24px; padding: 30px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
                    .modal-card.small { width: 400px; }
                    .modal-card.wide { width: 850px; }
                    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
                    .modal-header h3 { font-size: 1.3rem; font-weight: 800; color: #0f172a; margin: 0; }
                    .close-x { cursor: pointer; color: #94a3b8; transition: 0.2s; font-size: 1.2rem; }
                    .close-x:hover { color: #ef4444; }

                    .filter-summary-row { background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                    .filter-group { display: flex; align-items: center; gap: 12px; }
                    .filter-group select { padding: 10px; border-radius: 10px; border: 1px solid #cbd5e1; font-weight: 600; font-size: 0.85rem; background: white; }
                    .btn-csv-export { background: #10b981; color: white; border: none; padding: 10px 18px; border-radius: 10px; font-size: 0.85rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; }

                    .total-group label { font-size: 0.65rem; font-weight: 800; color: #94a3b8; letter-spacing: 1px; }
                    .total-group h2 { margin: 0; color: #4f46e5; font-size: 1.8rem; font-weight: 900; letter-spacing: -1px; }

                    .table-wrapper { max-height: 400px; overflow-y: auto; border: 1px solid #f1f5f9; border-radius: 12px; }
                    .record-table { width: 100%; border-collapse: collapse; }
                    .record-table th { text-align: left; padding: 14px; background: #f8fafc; font-size: 0.75rem; color: #64748b; font-weight: 800; text-transform: uppercase; position: sticky; top: 0; }
                    .record-table td { padding: 16px 14px; border-bottom: 1px solid #f1f5f9; font-size: 0.95rem; color: #1e293b; }

                    .cat-tag { padding: 4px 10px; border-radius: 8px; font-size: 0.7rem; font-weight: 800; }
                    .FUEL { background: #fff7ed; color: #c2410c; }
                    .TOLL { background: #f0fdf4; color: #15803d; }
                    .MAINTENANCE { background: #fef2f2; color: #dc2626; }
                    .SERVICING { background: #eef2ff; color: #4338ca; }
                    .amt-text { text-align: right; font-weight: 800; color: #0f172a; }
                    .desc-text { color: #64748b; font-size: 0.85rem; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

                    .form-item { margin-bottom: 18px; }
                    .form-item label { display: block; margin-bottom: 8px; font-size: 0.85rem; font-weight: 700; color: #334155; }
                    .form-item input, .form-item select, .form-item textarea { width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 0.95rem; }
                    .confirm-btn { width: 100%; background: #4f46e5; color: white; padding: 16px; border: none; border-radius: 12px; font-weight: 800; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }
                    .confirm-btn:hover { background: #4338ca; }
                `}</style>
            </div>
        );
    }