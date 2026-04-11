//
//
//import { useEffect, useState, useMemo, useCallback } from "react";
//import vehicleService from "../Services/vehicleService";
//import axios from "axios";
//import Modal from "react-modal";
//import {
//    FaTruck, FaCalendarAlt, FaSearch, FaTimes,
//    FaWallet, FaUserTie, FaFilter, FaPrint, FaPlus
//} from "react-icons/fa";
//
//Modal.setAppElement('#root');
//
//function VehicleExpensesPage() {
//    const user = JSON.parse(localStorage.getItem("user"));
//    const [vehicles, setVehicles] = useState([]);
//    const [loading, setLoading] = useState(true);
//    const [selectedVehicle, setSelectedVehicle] = useState(null);
//    const [expenses, setExpenses] = useState([]);
//    const [modalOpen, setModalOpen] = useState(false);
//    const [addModalOpen, setAddModalOpen] = useState(false);
//    const [searchQuery, setSearchQuery] = useState("");
//    const [selectedBill, setSelectedBill] = useState(null);
//    const [showBillModal, setShowBillModal] = useState(false);
//    // Filter States
//    const [startDate, setStartDate] = useState("");
//    const [endDate, setEndDate] = useState("");
//    const [categoryFilter, setCategoryFilter] = useState("ALL");
//    const [billUrl, setBillUrl] = useState(null);
//    const [showBill, setShowBill] = useState(false);
//    const userMap = {
//        [user?.eCode]: user?.name || user?.fullName
//        // Add more users if needed
//    };
//    useEffect(() => {
//        if (!addModalOpen) {
//            setNewExpense({
//                type: "FUEL",
//                amount: "",
//                date: new Date().toISOString().split('T')[0],
//                description: "",
//                kmReading: "",
//                dieselRate: "",
//                dieselLiter: ""
//            });
//            setBillFile(null);
//        }
//    }, [addModalOpen]);
//
//    const openBillModal = (id) => {
//        setSelectedBill(`http://localhost:8080/api/expenses/bill/${id}`);
//        setShowBillModal(true);
//    };
//
//    const closeBillModal = () => {
//        setShowBillModal(false);
//        setSelectedBill(null);
//    };
//    // Add Expense Form State
//    const [newExpense, setNewExpense] = useState({
//        type: "FUEL",
//        amount: "",
//        date: new Date().toISOString().split('T')[0],
//        description: "",
//        kmReading: "",
//        dieselRate: ""
//    });
//
//    const [billFile, setBillFile] = useState(null);
//
//    /* ================= 1. API CALLS ================= */
//    const loadVehicles = useCallback(async () => {
//        try {
//            const res = await vehicleService.getAll(user?.eCode);
//            setVehicles(Array.isArray(res) ? res : []);
//        } catch (err) {
//            console.error("Failed to load vehicles:", err);
//        } finally {
//            setLoading(false);
//        }
//    }, [user?.eCode]);
//
//    const fetchExpenses = async (vehicleNumber) => {
//        try {
//            const res = await axios.get(
//                `http://localhost:8080/api/expenses/vehicle-number/${vehicleNumber}`
//            );
//            setExpenses(Array.isArray(res.data) ? res.data : []);
//        } catch (err) {
//            console.error("Failed to fetch expenses:", err);
//        }
//    };
//    const openBill = (expenseId) => {
//
//        const url = `http://localhost:8080/api/expenses/bill/${expenseId}`;
//
//        setBillUrl(url);
//        setShowBill(true);
//    };
//    useEffect(() => {
//        if (user?.eCode) loadVehicles();
//    }, [user?.eCode, loadVehicles]);
//
//    /* ================= 2. SEARCH LOGIC ================= */
//    const filteredVehicles = useMemo(() => {
//        return vehicles.filter(v =>
//            v.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase())
//        );
//    }, [vehicles, searchQuery]);
//
//    /* ================= 3. MODAL HANDLERS ================= */
//    const openExpenses = async (vehicle) => {
//        setSelectedVehicle(vehicle);
//        setStartDate("");
//        setEndDate("");
//        setCategoryFilter("ALL");
//        await fetchExpenses(vehicle.vehicleNumber);
//        setModalOpen(true);
//    };
//
//    const openAddModal = (e, vehicle) => {
//        e.stopPropagation(); // Prevents the main card click from firing
//        setSelectedVehicle(vehicle);
//        setAddModalOpen(true);
//    };
//
//
//const handleAddExpense = async (e) => {
//    e.preventDefault();
//
//    if (!selectedVehicle) {
//        alert("Please select a vehicle first.");
//        return;
//    }
//
//    try {
//
//        // ✅ 1. Fuel Table Update (UNCHANGED)
//        if (newExpense.type === "FUEL") {
//            const fuelData = {
//                vehicleNumber: selectedVehicle.vehicleNumber,
//                kmReading: parseFloat(newExpense.kmReading),
//                dieselRate: parseFloat(newExpense.dieselRate),
//                fuelAmount: parseFloat(newExpense.amount),
//                updatedBy: user?.eCode
//            };
//
//            await axios.post(
//                "http://localhost:8080/api/vehicle-fuel/update",
//                fuelData
//            );
//        }
//
//        // ✅ 2. Prepare FormData for Expense API
//        const formData = new FormData();
//
//        formData.append("vehicleNumber", selectedVehicle.vehicleNumber);
//        formData.append("driverECode", user?.eCode);
//        formData.append("type", newExpense.type);
//        formData.append("amount", parseFloat(newExpense.amount));
//        formData.append("date", newExpense.date);
//        formData.append("description", newExpense.description || "");
//
//        // ✅ 3. FUEL LOGIC (IMPORTANT FIX)
//        if (newExpense.type === "FUEL") {
//
//            const amount = parseFloat(newExpense.amount);
//            const rate = parseFloat(newExpense.dieselRate);
//
//            if (!rate || rate === 0) {
//                alert("Diesel rate must be greater than 0");
//                return;
//            }
//
//            const liters = amount / rate;
//
//            // ✔ Backend mapping
//            formData.append("rate", rate);                         // ✅ correct
//            formData.append("dieselLiter", liters.toFixed(2));     // ✅ correct
//        }
//
//        // ✅ 4. Image Upload
//        if (billFile) {
//            formData.append("image", billFile);
//        }
//
//        // ✅ 5. API Call
//        await axios.post(
//            "http://localhost:8080/api/expenses/add",
//            formData,
//            {
//                headers: {
//                    "Content-Type": "multipart/form-data"
//                }
//            }
//        );
//
//        // ✅ SUCCESS
//        alert("Expense added successfully! ✅");
//
//        await fetchExpenses(selectedVehicle.vehicleNumber);
//
//        setAddModalOpen(false);
//        setBillFile(null);
//
//        // Reset Form
//        setNewExpense({
//            type: "FUEL",
//            amount: "",
//            date: new Date().toISOString().split('T')[0],
//            description: "",
//            kmReading: "",
//            dieselRate: ""
//        });
//
//    } catch (err) {
//        console.error("Failed to add expense:", err);
//        alert("Error: " + (err.response?.data || "Check console"));
//    }
//};
//
//
////    const handleAddExpense = async (e) => {
////        e.preventDefault();
////
////        if (!selectedVehicle) {
////            alert("Please select a vehicle first.");
////            return;
////        }
////
////        try {
////            // 1️⃣ If FUEL, send to /api/vehicle-fuel/update
////            if (newExpense.type === "FUEL") {
////                const fuelData = {
////                    vehicleNumber: selectedVehicle.vehicleNumber,
////                    kmReading: parseFloat(newExpense.kmReading),
////                    dieselRate: parseFloat(newExpense.dieselRate),
////                    fuelAmount: parseFloat(newExpense.amount),
////                    updatedBy:   user?.eCode
////                };
////
////                await axios.post(
////                    "http://localhost:8080/api/vehicle-fuel/update",
////                    fuelData
////                );
////            }
////
////            // 2️⃣ Send to expenses table (for reporting)
////            const formData = new FormData();
////            formData.append("type", newExpense.type);
////            formData.append("amount", newExpense.amount);
////            formData.append("date", newExpense.date);
////            formData.append("description", newExpense.description);
////            formData.append("vehicleNumber", selectedVehicle.vehicleNumber);
////            formData.append("driverECode", user?.eCode);
////
////            if (newExpense.type === "FUEL" && newExpense.kmReading) {
////                formData.append("kmReading", newExpense.kmReading);
////            }
////            if (newExpense.type === "FUEL" && newExpense.dieselRate) {
////                formData.append("dieselRate", newExpense.dieselRate);
////            }
////            if (billFile) {
////                formData.append("image", billFile);
////            }
////
////            await axios.post(
////                "http://localhost:8080/api/expenses/add",
////                formData,
////                { headers: { "Content-Type": "multipart/form-data" } }
////            );
////
////            // ✅ Success notification
////            alert("Expense added successfully!");
////
////            // 3️⃣ Refresh expenses list
////            await fetchExpenses(selectedVehicle.vehicleNumber);
////
////            // 4️⃣ Reset modal and form
////            setAddModalOpen(false);
////            setBillFile(null);
////            setNewExpense({
////                type: "FUEL",
////                amount: "",
////                date: new Date().toISOString().split('T')[0],
////                description: "",
////                kmReading: "",
////                dieselRate: ""
////            });
////        } catch (err) {
////            console.error("Failed to add expense:", err);
////            alert("Error adding expense");
////        }
////    };
//
//    /* ================= 4. DATA PROCESSING ================= */
//    const filteredExpenses = expenses.filter((e) => {
//        const matchesCategory = categoryFilter === "ALL" || e.type === categoryFilter;
//        if (!startDate && !endDate) return matchesCategory;
//        const expenseDate = new Date(e.date);
//        const start = startDate ? new Date(startDate) : new Date("1900-01-01");
//        const end = endDate ? new Date(endDate) : new Date("2100-01-01");
//        return matchesCategory && expenseDate >= start && expenseDate <= end;
//    });
//
//    const totalExpense = filteredExpenses.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
//
//
//    const handlePrint = () => {
//        const vehicleNumber = selectedVehicle?.vehicleNumber;
//
//        // Build query params for filter
//        const params = new URLSearchParams();
//        if (startDate) params.append("startDate", startDate);
//        if (endDate) params.append("endDate", endDate);
//        if (categoryFilter && categoryFilter !== "ALL") params.append("category", categoryFilter);
//
//        window.open(
//            `http://localhost:8080/api/expenses/download/${vehicleNumber}?${params.toString()}`,
//            "_blank"
//        );
//    };
//    /* ================= 5. STYLES ================= */
//    const styles = {
//        container: { padding: "30px", backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" },
//        headerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" },
//        iconBox: { background: "#4f46e5", color: "#fff", padding: "12px", borderRadius: "12px", display: "flex" },
//        searchInput: { padding: "12px 15px 12px 40px", borderRadius: "12px", border: "1px solid #e2e8f0", width: "300px", fontSize: "14px", outline: "none" },
//        grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" },
//        summaryCard: {
//            background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534",
//            padding: "25px", borderRadius: "20px", display: "flex",
//            justifyContent: "space-between", alignItems: "center", marginBottom: "25px"
//        },
//        modalOverlay: {
//            backgroundColor: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(6px)",
//            zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center",
//            position: 'fixed', inset: 0
//        },
//        modalContent: {
//            width: "95%", maxWidth: "1100px", backgroundColor: "#fff", borderRadius: "24px",
//            padding: "0", maxHeight: "90vh", overflowY: "auto", border: "none",
//            outline: "none", position: 'relative', inset: 'auto'
//        }
//    };
//
//    return (
//        <div style={styles.container}>
//            {/* MAIN DASHBOARD */}
//            <div className="no-print">
//                <div style={styles.headerRow}>
//                    <div style={{display: "flex", alignItems: "center", gap: "15px"}}>
//                        <div style={styles.iconBox}><FaWallet size={20}/></div>
//                        <div>
//                            <h1 style={{margin: 0, fontSize: "22px", color: "#0f172a", fontWeight: "800"}}>Fleet Expenses</h1>
//                            {loading && <p style={{margin:0, fontSize: "12px", color: "#64748b"}}>Loading records...</p>}
//                        </div>
//                    </div>
//                    <div style={{position: "relative", display: "flex", alignItems: "center"}}>
//                        <FaSearch style={{position: "absolute", left: "15px", color: "#94a3b8"}} />
//                        <input
//                            style={styles.searchInput}
//                            placeholder="Search vehicle number..."
//                            value={searchQuery}
//                            onChange={(e) => setSearchQuery(e.target.value)}
//                        />
//                    </div>
//                </div>
//
//                <div style={styles.grid}>
//                    {filteredVehicles.map((v) => (
//                        <div key={v.id} className="v-card" onClick={() => openExpenses(v)}>
//                            <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px"}}>
//                                <div style={{background: "#f1f5f9", color: "#475569", padding: "8px", borderRadius: "10px"}}><FaTruck size={18}/></div>
//
//                                {/* BLUE ADD EXPENSE BUTTON */}
//                                <button
//                                    className="add-expense-btn-blue"
//                                    onClick={(e) => openAddModal(e, v)}
//                                >
//                                    <FaPlus size={10} /> Add Expense
//                                </button>
//                            </div>
//
//                            <p style={{fontSize: "11px", color: "#94a3b8", fontWeight: "700", textTransform: "uppercase", margin: 0}}>Plate Number</p>
//                            <h2 style={{margin: "2px 0 10px 0", color: "#1e293b", fontSize: "20px"}}>{v.vehicleNumber}</h2>
//
//                            <div style={{display: "flex", alignItems: "center", gap: "8px", borderTop: "1px solid #f1f5f9", paddingTop: "12px", marginTop: "5px"}}>
//                                <FaUserTie size={12} color="#94a3b8"/>
//                                <span style={{fontSize: "13px", color: "#475569", fontWeight: "600"}}>
//                                    {v.driverName || "Not Assigned"}
//                                </span>
//                            </div>
//                        </div>
//                    ))}
//                </div>
//            </div>
//
//            {/* MODAL 1: VIEW EXPENSE REPORT */}
//            <Modal
//                isOpen={modalOpen}
//                onRequestClose={() => setModalOpen(false)}
//                style={{ overlay: styles.modalOverlay, content: styles.modalContent }}
//            >
//                <div id="printable-area">
//                    <div style={{padding: "25px 30px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center"}}>
//                        <div>
//                            <h2 style={{margin: 0, fontSize: "20px", color: "#1e293b"}}>Expense Report</h2>
//                            <p style={{margin: 0, fontSize: "14px", color: "#64748b"}}>
//                                <strong>Vehicle:</strong> {selectedVehicle?.vehicleNumber} |
//                                <strong> Driver:</strong> {selectedVehicle?.driverName || "N/A"}
//                            </p>
//                        </div>
//                        <div className="no-print" style={{display: "flex", gap: "10px"}}>
//                            <button className="btn-print" onClick={handlePrint}><FaPrint /> Print PDF</button>
//                            <button style={{background: "none", border: "none", cursor: "pointer", color: "#94a3b8"}} onClick={() => setModalOpen(false)}><FaTimes size={24}/></button>
//                        </div>
//                    </div>
//
//                    <div style={{padding: "30px"}}>
//                        <div style={styles.summaryCard}>
//                            <div>
//                                <p style={{margin: 0, fontSize: "12px", fontWeight: "800", opacity: 0.8, textTransform: "uppercase"}}>Total Expenditure</p>
//                                <h1 style={{margin: "5px 0 0 0", fontSize: "32px", fontWeight: "900", color: "#15803d"}}>₹{totalExpense.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</h1>
//                            </div>
//                            <div style={{textAlign: "right"}}>
//                                <p style={{margin: 0, fontSize: "11px", fontWeight: "700", opacity: 0.7}}>RECORDS</p>
//                                <p style={{margin: 0, fontSize: "22px", fontWeight: "800"}}>{filteredExpenses.length}</p>
//                            </div>
//                        </div>
//
//                        {/* FILTER SECTION */}
//                        <div className="no-print" style={{display: "flex", gap: "15px", alignItems: "center", marginBottom: "25px", flexWrap: "wrap"}}>
//                            <FaFilter size={14} color="#94a3b8"/>
//                            <select className="select-input" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
//                                <option value="ALL">All Categories</option>
//                                <option value="FUEL">Fuel</option>
//                                <option value="TOLL">Toll</option>
//                                <option value="MAINTENANCE">Maintenance</option>
//                                <option value="SERVICING">Servicing</option>
//                                <option value="OTHER">Other</option>
//                            </select>
//                            <div style={{display: "flex", alignItems: "center", gap: "8px", marginLeft: "10px"}}>
//                                <FaCalendarAlt size={14} color="#94a3b8"/>
//                                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="date-input" />
//                                <span style={{color: "#cbd5e1"}}>to</span>
//                                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="date-input" />
//                            </div>
//                            {(startDate || endDate || categoryFilter !== "ALL") && (
//                                <button onClick={() => {setStartDate(""); setEndDate(""); setCategoryFilter("ALL");}} style={{color: "#ef4444", background: "none", border: "none", fontSize: "12px", cursor: "pointer", fontWeight: "700"}}>Reset Filters</button>
//                            )}
//                        </div>
//
//                        {/* TABLE SECTION */}
//                        <div style={{borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden"}}>
//                            <table style={{width: "100%", borderCollapse: "collapse"}}>
//                                <thead style={{backgroundColor: "#f8fafc"}}>
//                                <tr>
//                                    <th className="th-style">Category</th>
//                                    <th className="th-style">Date</th>
//                                    <th className="th-style">Updated By </th>
//                                    <th className="th-style">Description</th>
//                                    <th className="th-style">Bill</th>
//                                    <th className="th-style" style={{textAlign: "right"}}>Amount</th>
//
//
//                                </tr>
//                                </thead>
//                                <tbody>
//                                {filteredExpenses.length > 0 ? filteredExpenses.map((e, idx) => (
//                                    <tr key={idx} style={{borderBottom: "1px solid #f1f5f9"}}>
//                                        <td style={{padding: "14px"}}><span className="type-badge">{e.type}</span></td>
//                                        <td style={{padding: "14px", fontSize: "14px", color: "#475569"}}>{new Date(e.date).toLocaleDateString("en-IN")}</td>
//                                        <td style={{padding: "14px", fontSize: "14px", fontWeight: "600", color: "#1e293b"}}>
//                                            {e.driverName || e.driverECode || selectedVehicle?.driverName || "N/A"}
//                                        </td>
//                                        <td style={{padding: "14px", fontSize: "13px", color: "#64748b"}}>
//                                            {e.description || "-"}
//                                        </td>
//
//                                        <td style={{padding: "14px"}}>
//                                            {e.id ? (
//                                                <button
//                                                    onClick={() => openBillModal(e.id)}
//                                                    style={{
//                                                        background: "#eff6ff",
//                                                        border: "1px solid #bfdbfe",
//                                                        color: "#2563eb",
//                                                        padding: "6px 10px",
//                                                        borderRadius: "6px",
//                                                        cursor: "pointer",
//                                                        fontSize: "12px",
//                                                        fontWeight: "600"
//                                                    }}
//                                                >
//                                                    View Bill
//                                                </button>
//                                            ) : (
//                                                "-"
//                                            )}
//                                        </td>
//
//                                        <td style={{padding: "14px", textAlign: "right", fontWeight: "700", color: "#1e293b"}}>
//                                            ₹{parseFloat(e.amount).toFixed(2)}
//                                        </td>
//                                    </tr>
//                                )) : (
//                                    <tr>
//                                        <td colSpan="5" style={{padding: "30px", textAlign: "center", color: "#94a3b8"}}>No records found.</td>
//                                    </tr>
//                                )}
//                                </tbody>
//                            </table>
//                        </div>
//                    </div>
//                </div>
//            </Modal>
//
//            {/* MODAL 2: ADD NEW EXPENSE FORM */}
//            <Modal
//                isOpen={addModalOpen}
//                onRequestClose={() => setAddModalOpen(false)}
//                style={{ overlay: styles.modalOverlay, content: { ...styles.modalContent, maxWidth: "500px", padding: "30px" } }}
//            >
//                <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px"}}>
//                    <h2 style={{margin: 0, fontSize: "22px", color: "#1e293b"}}>Add New Expense</h2>
//                    <button onClick={() => setAddModalOpen(false)} style={{border: "none", background: "none", cursor: "pointer", color: "#94a3b8"}}><FaTimes size={20}/></button>
//                </div>
//                <div style={{marginBottom: "20px", padding: "12px", background: "#f1f5f9", borderRadius: "10px", fontSize: "14px"}}>
//                    Vehicle: <strong>{selectedVehicle?.vehicleNumber}</strong>
//                </div>
//
//                <form onSubmit={handleAddExpense} style={{display: "flex", flexDirection: "column", gap: "15px"}}>
//                    <div>
//                        <label className="form-label">Expense Category</label>
//                        <select
//                            className="select-input" style={{width: "100%"}}
//                            value={newExpense.type}
//                            onChange={(e) => setNewExpense({...newExpense, type: e.target.value})}
//                        >
//                            <option value="FUEL">Fuel</option>
//                            <option value="TOLL">Toll</option>
//                            <option value="MAINTENANCE">Maintenance</option>
//                            <option value="SERVICING">Servicing</option>
//                            <option value="OTHER">Other</option>
//                        </select>
//                    </div>
//                    <div>
//                        <label className="form-label">Amount (₹)</label>
//                        <input
//                            type="number" required placeholder="0.00" className="date-input" style={{width: "100%"}}
//                            value={newExpense.amount}
//                            onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
//                        />
//                    </div>
//                    <div>
//                        <label className="form-label">Transaction Date</label>
//                        <input
//                            type="date" required className="date-input" style={{width: "100%"}}
//                            value={newExpense.date}
//                            onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
//                        />
//                    </div>
//                    <div>
//                        <label className="form-label">Description / Remarks</label>
//                        <textarea
//                            className="date-input" placeholder="Enter details..." style={{width: "100%", height: "80px", resize: "none"}}
//                            value={newExpense.description}
//                            onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
//                        />
//                    </div>
//                    {newExpense.type === "FUEL" && (
//                        <>
//                            <div>
//                                <label className="form-label">KM Reading</label>
//                                <input
//                                    type="number"
//                                    required
//                                    placeholder="Enter KM Reading"
//                                    className="date-input"
//                                    style={{ width: "100%" }}
//                                    value={newExpense.kmReading}
//                                    onChange={(e) =>
//                                        setNewExpense({ ...newExpense, kmReading: e.target.value })
//                                    }
//                                />
//                            </div>
//
//                            <div>
//                                <label className="form-label">Diesel Rate (₹ per Litre)</label>
//                                <input
//                                    type="number"
//                                    required
//                                    placeholder="Enter Diesel Rate"
//                                    className="date-input"
//                                    style={{ width: "100%" }}
//                                    value={newExpense.dieselRate}
//                                    onChange={(e) =>
//                                        setNewExpense({ ...newExpense, dieselRate: e.target.value })
//                                    }
//                                />
//                            </div>
//
//
//                    {newExpense.type === "FUEL" && (
//                      <div>
//                          <label className="form-label">Diesel Quantity (Liters)</label>
//                          <input
//                              type="number"
//                              placeholder="Enter Diesel Liters"
//                              className="date-input"
//                              style={{ width: "100%" }}
//                              value={newExpense.dieselLiter}
//                              onChange={(e) =>
//                                  setNewExpense({ ...newExpense, dieselLiter: e.target.value })
//                              }
//                          />
//                      </div>
//                    )}
//
//
//                            {newExpense.kmReading && newExpense.dieselRate && (
//                                <p style={{ fontSize: "13px", color: "#475569", marginTop: "5px" }}>
//                                    Approx. Fuel Efficiency: { (parseFloat(newExpense.kmReading) / (parseFloat(newExpense.amount) / parseFloat(newExpense.dieselRate))).toFixed(2) } km/l
//                                </p>
//                            )}
//                        </>
//                    )}
//                    <div>
//                        <label className="form-label">Upload Bill</label>
//                        <input
//                            type="file"
//                            accept="image/*"
//                            className="date-input"
//                            style={{width: "100%"}}
//                            onChange={(e) => setBillFile(e.target.files[0])}
//                        />
//                    </div>
//                    <button type="submit" className="submit-expense-btn">Save Expense Record</button>
//                </form>
//            </Modal>
//            {showBillModal && (
//                <Modal
//                    isOpen={showBillModal}
//                    onRequestClose={closeBillModal}
//                    style={{
//                        overlay: styles.modalOverlay,
//                        content: {
//                            maxWidth: "700px",
//                            margin: "auto",
//                            borderRadius: "16px",
//                            padding: "20px"
//                        }
//                    }}
//                >
//                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:"10px"}}>
//                        <h3>Bill Preview</h3>
//                        <button
//                            onClick={closeBillModal}
//                            style={{border:"none",background:"none",cursor:"pointer"}}
//                        >
//                            <FaTimes size={20}/>
//                        </button>
//                    </div>
//
//                    <img
//                        src={selectedBill}
//                        alt="Bill"
//                        style={{width:"100%",borderRadius:"10px"}}
//                    />
//
//                    <div style={{marginTop:"10px"}}>
//                        <a href={selectedBill} target="_blank" rel="noopener noreferrer">
//                            Open Full Image
//                        </a>
//                    </div>
//                </Modal>
//            )}
//            <style>{`
//                .v-card { background: white; padding: 20px; border-radius: 16px; border: 1px solid #e2e8f0; cursor: pointer; transition: 0.2s ease; position: relative; }
//                .v-card:hover { transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); border-color: #4f46e5; }
//
//                .add-expense-btn-blue {
//                    background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe;
//                    padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 700;
//                    cursor: pointer; display: flex; align-items: center; gap: 6px; transition: 0.2s;
//                }
//                .add-expense-btn-blue:hover { background: #2563eb; color: white; border-color: #2563eb; }
//
//                .form-label { display: block; font-size: 12px; font-weight: 700; margin-bottom: 5px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
//
//                .date-input, .select-input { border: 1px solid #e2e8f0; padding: 10px 12px; border-radius: 8px; font-size: 14px; color: #475569; outline: none; background: #fff; box-sizing: border-box; }
//                .date-input:focus, .select-input:focus { border-color: #4f46e5; }
//
//                .btn-print { background: #4f46e5; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; }
//                .submit-expense-btn { margin-top: 10px; background: #4f46e5; color: white; border: none; padding: 14px; border-radius: 10px; font-weight: 700; cursor: pointer; transition: 0.2s; }
//                .submit-expense-btn:hover { background: #4338ca; }
//
//                .th-style { padding: 12px 14px; text-align: left; font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
//                .type-badge { background: #f1f5f9; color: #475569; padding: 4px 8px; border-radius: 5px; font-size: 11px; font-weight: 700; }
//
//                @media print {
//                    .no-print { display: none !important; }
//                    body { background: white !important; padding: 0 !important; }
//                    .ReactModal__Content { position: absolute !important; top: 0 !important; left: 0 !important; width: 100% !important; height: auto !important; border: none !important; box-shadow: none !important; overflow: visible !important; }
//                    #printable-area { width: 100%; }
//                }
//            `}</style>
//        </div>
//    );
//}
//
//export default VehicleExpensesPage;


import { useEffect, useState, useMemo, useCallback } from "react";
import vehicleService from "../Services/vehicleService";
import axios from "axios";
import Modal from "react-modal";
import {
    FaTruck, FaCalendarAlt, FaSearch, FaTimes,
    FaWallet, FaUserTie, FaFilter, FaPrint, FaPlus
} from "react-icons/fa";

Modal.setAppElement('#root');

function VehicleExpensesPage() {
    const user = JSON.parse(localStorage.getItem("user"));
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedBill, setSelectedBill] = useState(null);
    const [showBillModal, setShowBillModal] = useState(false);
    // Filter States
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("ALL");
    const [billUrl, setBillUrl] = useState(null);
    const [showBill, setShowBill] = useState(false);

    const userMap = {
        [user?.eCode]: user?.name || user?.fullName
    };

    useEffect(() => {
        if (!addModalOpen) {
            setNewExpense({
                type: "FUEL",
                amount: "",
                date: new Date().toISOString().split('T')[0],
                description: "",
                kmReading: "",
                dieselRate: "",
                dieselLiter: ""
            });
            setBillFile(null);
        }
    }, [addModalOpen]);

    const openBillModal = (id) => {
        setSelectedBill(`http://localhost:8080/api/expenses/bill/${id}`);
        setShowBillModal(true);
    };

    const closeBillModal = () => {
        setShowBillModal(false);
        setSelectedBill(null);
    };

    // Add Expense Form State
    const [newExpense, setNewExpense] = useState({
        type: "FUEL",
        amount: "",
        date: new Date().toISOString().split('T')[0],
        description: "",
        kmReading: "",
        dieselRate: ""
    });

    const [billFile, setBillFile] = useState(null);

    /* ================= 1. API CALLS ================= */
    const loadVehicles = useCallback(async () => {
        try {
            const res = await vehicleService.getAll(user?.eCode);
            setVehicles(Array.isArray(res) ? res : []);
        } catch (err) {
            console.error("Failed to load vehicles:", err);
        } finally {
            setLoading(false);
        }
    }, [user?.eCode]);

    const fetchExpenses = async (vehicleNumber) => {
        try {
            const res = await axios.get(
                `http://localhost:8080/api/expenses/vehicle-number/${vehicleNumber}`
            );
            setExpenses(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Failed to fetch expenses:", err);
        }
    };

    const openBill = (expenseId) => {
        const url = `http://localhost:8080/api/expenses/bill/${expenseId}`;
        setBillUrl(url);
        setShowBill(true);
    };

    useEffect(() => {
        if (user?.eCode) loadVehicles();
    }, [user?.eCode, loadVehicles]);

    /* ================= 2. SEARCH LOGIC ================= */
    const filteredVehicles = useMemo(() => {
        return vehicles.filter(v =>
            v.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [vehicles, searchQuery]);

    /* ================= 3. MODAL HANDLERS ================= */
    const openExpenses = async (vehicle) => {
        setSelectedVehicle(vehicle);
        setStartDate("");
        setEndDate("");
        setCategoryFilter("ALL");
        await fetchExpenses(vehicle.vehicleNumber);
        setModalOpen(true);
    };

    const openAddModal = (e, vehicle) => {
        e.stopPropagation();
        setSelectedVehicle(vehicle);
        setAddModalOpen(true);
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();

        if (!selectedVehicle) {
            alert("Please select a vehicle first.");
            return;
        }

        try {
            // ✅ 1. Fuel Table Update
            if (newExpense.type === "FUEL") {
                const fuelData = {
                    vehicleNumber: selectedVehicle.vehicleNumber,
                    kmReading: parseFloat(newExpense.kmReading),
                    dieselRate: parseFloat(newExpense.dieselRate),
                    fuelAmount: parseFloat(newExpense.amount),
                    updatedBy: user?.eCode
                };
                await axios.post("http://localhost:8080/api/vehicle-fuel/update", fuelData);
            }

            // ✅ 2. Prepare FormData
            const formData = new FormData();
            formData.append("vehicleNumber", selectedVehicle.vehicleNumber);
            formData.append("driverECode", user?.eCode);
            formData.append("type", newExpense.type);
            formData.append("amount", parseFloat(newExpense.amount));
            formData.append("date", newExpense.date);
            formData.append("description", newExpense.description || "");

            // ✅ 3. FUEL specific fields
            if (newExpense.type === "FUEL") {
                const amount = parseFloat(newExpense.amount);
                const rate = parseFloat(newExpense.dieselRate);
                if (!rate || rate === 0) {
                    alert("Diesel rate must be greater than 0");
                    return;
                }
                const liters = amount / rate;
                formData.append("rate", rate);
                formData.append("dieselLiter", liters.toFixed(2));
            }

            // ✅ 4. Image Upload
            if (billFile) {
                formData.append("image", billFile);
            }

            // ✅ 5. API Call
            await axios.post(
                "http://localhost:8080/api/expenses/add",
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            alert("Expense added successfully! ✅");
            await fetchExpenses(selectedVehicle.vehicleNumber);
            setAddModalOpen(false);
            setBillFile(null);
            setNewExpense({
                type: "FUEL",
                amount: "",
                date: new Date().toISOString().split('T')[0],
                description: "",
                kmReading: "",
                dieselRate: ""
            });

        } catch (err) {
            console.error("Failed to add expense:", err);
            alert("Error: " + (err.response?.data || "Check console"));
        }
    };

    /* ================= 4. DATA PROCESSING ================= */

    // ✅ Normalize date to "YYYY-MM-DD" to avoid timezone issues
    const normalizeDate = (dateVal) => {
        if (!dateVal) return null;
        return dateVal.toString().split("T")[0];
    };

    const filteredExpenses = expenses.filter((e) => {
        // ✅ Category filter - safe trim + uppercase comparison
        const matchesCategory =
            categoryFilter === "ALL" ||
            (e.type && e.type.trim().toUpperCase() === categoryFilter.trim().toUpperCase());

        if (!startDate && !endDate) return matchesCategory;

        // ✅ String-based date comparison to avoid timezone shift bugs
        const expenseDate = normalizeDate(e.date);
        const afterStart = startDate ? expenseDate >= startDate : true;
        const beforeEnd  = endDate   ? expenseDate <= endDate   : true;

        return matchesCategory && afterStart && beforeEnd;
    });

    const totalExpense = filteredExpenses.reduce(
        (sum, item) => sum + (parseFloat(item.amount) || 0), 0
    );

    // ✅ FIXED: Pass "type" param to backend (matches @RequestParam String type in controller)
    const handlePrint = () => {
        const vehicleNumber = selectedVehicle?.vehicleNumber;
        if (!vehicleNumber) return;

        const params = new URLSearchParams();
        if (startDate) params.append("startDate", startDate);
        if (endDate)   params.append("endDate", endDate);

        // ✅ "type" matches the backend @RequestParam name exactly
        if (categoryFilter && categoryFilter !== "ALL") {
            params.append("type", categoryFilter);
        }

        window.open(
            `http://localhost:8080/api/expenses/download/${encodeURIComponent(vehicleNumber)}?${params.toString()}`,
            "_blank"
        );
    };

    /* ================= 5. STYLES ================= */
    const styles = {
        container: { padding: "30px", backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" },
        headerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" },
        iconBox: { background: "#4f46e5", color: "#fff", padding: "12px", borderRadius: "12px", display: "flex" },
        searchInput: { padding: "12px 15px 12px 40px", borderRadius: "12px", border: "1px solid #e2e8f0", width: "300px", fontSize: "14px", outline: "none" },
        grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" },
        summaryCard: {
            background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534",
            padding: "25px", borderRadius: "20px", display: "flex",
            justifyContent: "space-between", alignItems: "center", marginBottom: "25px"
        },
        modalOverlay: {
            backgroundColor: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(6px)",
            zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center",
            position: 'fixed', inset: 0
        },
        modalContent: {
            width: "95%", maxWidth: "1100px", backgroundColor: "#fff", borderRadius: "24px",
            padding: "0", maxHeight: "90vh", overflowY: "auto", border: "none",
            outline: "none", position: 'relative', inset: 'auto'
        }
    };

    return (
        <div style={styles.container}>
            {/* MAIN DASHBOARD */}
            <div className="no-print">
                <div style={styles.headerRow}>
                    <div style={{display: "flex", alignItems: "center", gap: "15px"}}>
                        <div style={styles.iconBox}><FaWallet size={20}/></div>
                        <div>
                            <h1 style={{margin: 0, fontSize: "22px", color: "#0f172a", fontWeight: "800"}}>Fleet Expenses</h1>
                            {loading && <p style={{margin:0, fontSize: "12px", color: "#64748b"}}>Loading records...</p>}
                        </div>
                    </div>
                    <div style={{position: "relative", display: "flex", alignItems: "center"}}>
                        <FaSearch style={{position: "absolute", left: "15px", color: "#94a3b8"}} />
                        <input
                            style={styles.searchInput}
                            placeholder="Search vehicle number..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div style={styles.grid}>
                    {filteredVehicles.map((v) => (
                        <div key={v.id} className="v-card" onClick={() => openExpenses(v)}>
                            <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px"}}>
                                <div style={{background: "#f1f5f9", color: "#475569", padding: "8px", borderRadius: "10px"}}><FaTruck size={18}/></div>
                                <button
                                    className="add-expense-btn-blue"
                                    onClick={(e) => openAddModal(e, v)}
                                >
                                    <FaPlus size={10} /> Add Expense
                                </button>
                            </div>

                            <p style={{fontSize: "11px", color: "#94a3b8", fontWeight: "700", textTransform: "uppercase", margin: 0}}>Plate Number</p>
                            <h2 style={{margin: "2px 0 10px 0", color: "#1e293b", fontSize: "20px"}}>{v.vehicleNumber}</h2>

                            <div style={{display: "flex", alignItems: "center", gap: "8px", borderTop: "1px solid #f1f5f9", paddingTop: "12px", marginTop: "5px"}}>
                                <FaUserTie size={12} color="#94a3b8"/>
                                <span style={{fontSize: "13px", color: "#475569", fontWeight: "600"}}>
                                    {v.driverName || "Not Assigned"}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* MODAL 1: VIEW EXPENSE REPORT */}
            <Modal
                isOpen={modalOpen}
                onRequestClose={() => setModalOpen(false)}
                style={{ overlay: styles.modalOverlay, content: styles.modalContent }}
            >
                <div id="printable-area">
                    <div style={{padding: "25px 30px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                        <div>
                            <h2 style={{margin: 0, fontSize: "20px", color: "#1e293b"}}>Expense Report</h2>
                            <p style={{margin: 0, fontSize: "14px", color: "#64748b"}}>
                                <strong>Vehicle:</strong> {selectedVehicle?.vehicleNumber} |
                                <strong> Driver:</strong> {selectedVehicle?.driverName || "N/A"}
                            </p>
                        </div>
                        <div className="no-print" style={{display: "flex", gap: "10px"}}>
                            <button className="btn-print" onClick={handlePrint}><FaPrint /> Print PDF</button>
                            <button style={{background: "none", border: "none", cursor: "pointer", color: "#94a3b8"}} onClick={() => setModalOpen(false)}><FaTimes size={24}/></button>
                        </div>
                    </div>

                    <div style={{padding: "30px"}}>
                        <div style={styles.summaryCard}>
                            <div>
                                <p style={{margin: 0, fontSize: "12px", fontWeight: "800", opacity: 0.8, textTransform: "uppercase"}}>Total Expenditure</p>
                                <h1 style={{margin: "5px 0 0 0", fontSize: "32px", fontWeight: "900", color: "#15803d"}}>₹{totalExpense.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</h1>
                            </div>
                            <div style={{textAlign: "right"}}>
                                <p style={{margin: 0, fontSize: "11px", fontWeight: "700", opacity: 0.7}}>RECORDS</p>
                                <p style={{margin: 0, fontSize: "22px", fontWeight: "800"}}>{filteredExpenses.length}</p>
                            </div>
                        </div>

                        {/* FILTER SECTION */}
                        <div className="no-print" style={{display: "flex", gap: "15px", alignItems: "center", marginBottom: "25px", flexWrap: "wrap"}}>
                            <FaFilter size={14} color="#94a3b8"/>
                            <select className="select-input" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                                <option value="ALL">All Categories</option>
                                <option value="FUEL">Fuel</option>
                                <option value="TOLL">Toll</option>
                                <option value="MAINTENANCE">Maintenance</option>
                                <option value="SERVICING">Servicing</option>
                                <option value="OTHER">Other</option>
                            </select>
                            <div style={{display: "flex", alignItems: "center", gap: "8px", marginLeft: "10px"}}>
                                <FaCalendarAlt size={14} color="#94a3b8"/>
                                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="date-input" />
                                <span style={{color: "#cbd5e1"}}>to</span>
                                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="date-input" />
                            </div>
                            {(startDate || endDate || categoryFilter !== "ALL") && (
                                <button
                                    onClick={() => {setStartDate(""); setEndDate(""); setCategoryFilter("ALL");}}
                                    style={{color: "#ef4444", background: "none", border: "none", fontSize: "12px", cursor: "pointer", fontWeight: "700"}}
                                >
                                    Reset Filters
                                </button>
                            )}
                        </div>

                        {/* TABLE SECTION */}
                        <div style={{borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden"}}>
                            <table style={{width: "100%", borderCollapse: "collapse"}}>
                                <thead style={{backgroundColor: "#f8fafc"}}>
                                <tr>
                                    <th className="th-style">Category</th>
                                    <th className="th-style">Date</th>
                                    <th className="th-style">Updated By</th>
                                    <th className="th-style">Description</th>
                                    <th className="th-style">Bill</th>
                                    <th className="th-style" style={{textAlign: "right"}}>Amount</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredExpenses.length > 0 ? filteredExpenses.map((e, idx) => (
                                    <tr key={idx} style={{borderBottom: "1px solid #f1f5f9"}}>
                                        <td style={{padding: "14px"}}><span className="type-badge">{e.type}</span></td>
                                        <td style={{padding: "14px", fontSize: "14px", color: "#475569"}}>{new Date(e.date).toLocaleDateString("en-IN")}</td>
                                        <td style={{padding: "14px", fontSize: "14px", fontWeight: "600", color: "#1e293b"}}>
                                            {e.driverName || e.driverECode || selectedVehicle?.driverName || "N/A"}
                                        </td>
                                        <td style={{padding: "14px", fontSize: "13px", color: "#64748b"}}>
                                            {e.description || "-"}
                                        </td>
                                        <td style={{padding: "14px"}}>
                                            {e.id ? (
                                                <button
                                                    onClick={() => openBillModal(e.id)}
                                                    style={{
                                                        background: "#eff6ff",
                                                        border: "1px solid #bfdbfe",
                                                        color: "#2563eb",
                                                        padding: "6px 10px",
                                                        borderRadius: "6px",
                                                        cursor: "pointer",
                                                        fontSize: "12px",
                                                        fontWeight: "600"
                                                    }}
                                                >
                                                    View Bill
                                                </button>
                                            ) : "-"}
                                        </td>
                                        <td style={{padding: "14px", textAlign: "right", fontWeight: "700", color: "#1e293b"}}>
                                            ₹{parseFloat(e.amount).toFixed(2)}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" style={{padding: "30px", textAlign: "center", color: "#94a3b8"}}>No records found.</td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* MODAL 2: ADD NEW EXPENSE FORM */}
            <Modal
                isOpen={addModalOpen}
                onRequestClose={() => setAddModalOpen(false)}
                style={{ overlay: styles.modalOverlay, content: { ...styles.modalContent, maxWidth: "500px", padding: "30px" } }}
            >
                <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px"}}>
                    <h2 style={{margin: 0, fontSize: "22px", color: "#1e293b"}}>Add New Expense</h2>
                    <button onClick={() => setAddModalOpen(false)} style={{border: "none", background: "none", cursor: "pointer", color: "#94a3b8"}}><FaTimes size={20}/></button>
                </div>
                <div style={{marginBottom: "20px", padding: "12px", background: "#f1f5f9", borderRadius: "10px", fontSize: "14px"}}>
                    Vehicle: <strong>{selectedVehicle?.vehicleNumber}</strong>
                </div>

                <form onSubmit={handleAddExpense} style={{display: "flex", flexDirection: "column", gap: "15px"}}>
                    <div>
                        <label className="form-label">Expense Category</label>
                        <select
                            className="select-input" style={{width: "100%"}}
                            value={newExpense.type}
                            onChange={(e) => setNewExpense({...newExpense, type: e.target.value})}
                        >
                            <option value="FUEL">Fuel</option>
                            <option value="TOLL">Toll</option>
                            <option value="MAINTENANCE">Maintenance</option>
                            <option value="SERVICING">Servicing</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="form-label">Amount (₹)</label>
                        <input
                            type="number" required placeholder="0.00" className="date-input" style={{width: "100%"}}
                            value={newExpense.amount}
                            onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="form-label">Transaction Date</label>
                        <input
                            type="date" required className="date-input" style={{width: "100%"}}
                            value={newExpense.date}
                            onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="form-label">Description / Remarks</label>
                        <textarea
                            className="date-input" placeholder="Enter details..." style={{width: "100%", height: "80px", resize: "none"}}
                            value={newExpense.description}
                            onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                        />
                    </div>
                    {newExpense.type === "FUEL" && (
                        <>
                            <div>
                                <label className="form-label">KM Reading</label>
                                <input
                                    type="number" required placeholder="Enter KM Reading"
                                    className="date-input" style={{ width: "100%" }}
                                    value={newExpense.kmReading}
                                    onChange={(e) => setNewExpense({ ...newExpense, kmReading: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="form-label">Diesel Rate (₹ per Litre)</label>
                                <input
                                    type="number" required placeholder="Enter Diesel Rate"
                                    className="date-input" style={{ width: "100%" }}
                                    value={newExpense.dieselRate}
                                    onChange={(e) => setNewExpense({ ...newExpense, dieselRate: e.target.value })}
                                />
                            </div>
                            {newExpense.type === "FUEL" && (
                                <div>
                                    <label className="form-label">Diesel Quantity (Liters)</label>
                                    <input
                                        type="number" placeholder="Enter Diesel Liters"
                                        className="date-input" style={{ width: "100%" }}
                                        value={newExpense.dieselLiter}
                                        onChange={(e) => setNewExpense({ ...newExpense, dieselLiter: e.target.value })}
                                    />
                                </div>
                            )}
                            {newExpense.kmReading && newExpense.dieselRate && (
                                <p style={{ fontSize: "13px", color: "#475569", marginTop: "5px" }}>
                                    Approx. Fuel Efficiency: {(parseFloat(newExpense.kmReading) / (parseFloat(newExpense.amount) / parseFloat(newExpense.dieselRate))).toFixed(2)} km/l
                                </p>
                            )}
                        </>
                    )}
                    <div>
                        <label className="form-label">Upload Bill</label>
                        <input
                            type="file" accept="image/*"
                            className="date-input" style={{width: "100%"}}
                            onChange={(e) => setBillFile(e.target.files[0])}
                        />
                    </div>
                    <button type="submit" className="submit-expense-btn">Save Expense Record</button>
                </form>
            </Modal>

            {/* MODAL 3: BILL PREVIEW */}
            {showBillModal && (
                <Modal
                    isOpen={showBillModal}
                    onRequestClose={closeBillModal}
                    style={{
                        overlay: styles.modalOverlay,
                        content: {
                            maxWidth: "700px",
                            margin: "auto",
                            borderRadius: "16px",
                            padding: "20px"
                        }
                    }}
                >
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:"10px"}}>
                        <h3>Bill Preview</h3>
                        <button onClick={closeBillModal} style={{border:"none",background:"none",cursor:"pointer"}}>
                            <FaTimes size={20}/>
                        </button>
                    </div>
                    <img src={selectedBill} alt="Bill" style={{width:"100%",borderRadius:"10px"}} />
                    <div style={{marginTop:"10px"}}>
                        <a href={selectedBill} target="_blank" rel="noopener noreferrer">Open Full Image</a>
                    </div>
                </Modal>
            )}

            <style>{`
                .v-card { background: white; padding: 20px; border-radius: 16px; border: 1px solid #e2e8f0; cursor: pointer; transition: 0.2s ease; position: relative; }
                .v-card:hover { transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); border-color: #4f46e5; }

                .add-expense-btn-blue {
                    background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe;
                    padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 700;
                    cursor: pointer; display: flex; align-items: center; gap: 6px; transition: 0.2s;
                }
                .add-expense-btn-blue:hover { background: #2563eb; color: white; border-color: #2563eb; }

                .form-label { display: block; font-size: 12px; font-weight: 700; margin-bottom: 5px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }

                .date-input, .select-input { border: 1px solid #e2e8f0; padding: 10px 12px; border-radius: 8px; font-size: 14px; color: #475569; outline: none; background: #fff; box-sizing: border-box; }
                .date-input:focus, .select-input:focus { border-color: #4f46e5; }

                .btn-print { background: #4f46e5; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; }
                .submit-expense-btn { margin-top: 10px; background: #4f46e5; color: white; border: none; padding: 14px; border-radius: 10px; font-weight: 700; cursor: pointer; transition: 0.2s; }
                .submit-expense-btn:hover { background: #4338ca; }

                .th-style { padding: 12px 14px; text-align: left; font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
                .type-badge { background: #f1f5f9; color: #475569; padding: 4px 8px; border-radius: 5px; font-size: 11px; font-weight: 700; }

                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; padding: 0 !important; }
                    .ReactModal__Content { position: absolute !important; top: 0 !important; left: 0 !important; width: 100% !important; height: auto !important; border: none !important; box-shadow: none !important; overflow: visible !important; }
                    #printable-area { width: 100%; }
                }
            `}</style>
        </div>
    );
}

export default VehicleExpensesPage;
