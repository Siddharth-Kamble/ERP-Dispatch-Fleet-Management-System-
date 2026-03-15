// import React, { useEffect, useState } from "react";
// import axios from "axios";
//
// function AdminDashboard() {
//     const API = "http://localhost:8080/api/users";
//
//     const [users, setUsers] = useState([]);
//     const [form, setForm] = useState({
//         eCode: "",
//         fullName: "",
//         email: "",
//         password: "",
//         role: "USER",
//     });
//
//     const [editId, setEditId] = useState(null);
//     const [loading, setLoading] = useState(false);
//
//     // ================= FETCH USERS =================
//     const fetchUsers = async () => {
//         const res = await axios.get(API);
//         setUsers(res.data);
//     };
//
//     useEffect(() => {
//         fetchUsers();
//     }, []);
//
//     // ================= INPUT CHANGE =================
//     const handleChange = (e) =>
//         setForm({ ...form, [e.target.name]: e.target.value });
//
//     // ================= SUBMIT =================
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//
//         try {
//             let payload = { ...form };
//
//             // do not send empty password on update
//             if (editId && !payload.password) {
//                 delete payload.password;
//             }
//
//             if (editId) {
//                 await axios.put(`${API}/${editId}`, payload);
//                 alert("User Updated");
//                 setEditId(null);
//             } else {
//                 await axios.post(API, payload);
//                 alert("User Created");
//             }
//
//             setForm({
//                 eCode: "",
//                 fullName: "",
//                 email: "",
//                 password: "",
//                 role: "USER",
//             });
//
//             fetchUsers();
//         } catch (error) {
//             alert("Backend Error");
//         } finally {
//             setLoading(false);
//         }
//     };
//
//     // ================= EDIT =================
//     const handleEdit = (u) => {
//         setForm({
//             eCode: u.eCode,
//             fullName: u.fullName,
//             email: u.email,
//             password: "",
//             role: u.role,
//         });
//         setEditId(u.id);
//     };
//
//     // ================= DELETE =================
//     const handleDelete = async (id) => {
//         if (!window.confirm("Delete user?")) return;
//         await axios.delete(`${API}/${id}`);
//         fetchUsers();
//     };
//
//     // ================= STATS =================
//     const totalUsers = users.length;
//     const drivers = users.filter(u => u.role === "DRIVER").length;
//     const admins = users.filter(u => u.role === "ADMIN").length;
//     const dispatch = users.filter(u => u.role === "DISPATCH").length;
//
//
//     return (
//         <div className="erp">
//
//             {/* SIDEBAR */}
//             <div className="sidebar">
//                 <h2>ERP</h2>
//                 <p>Dashboard</p>
//                 <p>Users</p>
//                 <p>Dispatch</p>
//                 <p>Production</p>
//                 <p>Reports</p>
//                 <p>Settings</p>
//             </div>
//
//             {/* MAIN AREA */}
//             <div className="main">
//
//                 {/* TOPBAR */}
//                 <div className="topbar">
//                     <h3>User Management</h3>
//                     <span>Admin</span>
//                 </div>
//
//                 {/* CONTENT */}
//                 <div className="content">
//
//                     {/* STATS */}
//                     <div className="stats">
//                         <div className="card">Total Users <b>{totalUsers}</b></div>
//                         <div className="card">Drivers <b>{drivers}</b></div>
//                         <div className="card">Admins <b>{admins}</b></div>
//                     </div>
//
//                     {/* FORM */}
//                     <div className="card">
//                         <h3>{editId ? "Update User" : "Create User"}</h3>
//
//                         <form onSubmit={handleSubmit} className="form">
//                             <input name="eCode" placeholder="E Code" value={form.eCode} onChange={handleChange} required />
//                             <input name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange} required />
//                             <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
//
//                             <input
//                                 type="password"
//                                 name="password"
//                                 placeholder={editId ? "New Password (Optional)" : "Password"}
//                                 value={form.password}
//                                 onChange={handleChange}
//                                 required={!editId}
//                             />
//
//                             <select name="role" value={form.role} onChange={handleChange}>
//                                 <option>ADMIN</option>
//                                 <option>VP</option>
//                                 <option>COORDINATOR</option>
//                                 <option>PRODUCTION</option>
//                                 <option>DISPATCH</option>
//                                 <option>DRIVER</option>
//                                 <option>SITE_SUPERVISOR</option>
//                                 <option>PURCHASE</option>
//
//                             </select>
//
//                             <button disabled={loading}>
//                                 {loading ? "Processing..." : editId ? "Update" : "Add User"}
//                             </button>
//                         </form>
//                     </div>
//
//                     {/* TABLE */}
//                     <div className="card">
//                         <h3>User List</h3>
//
//                         <table>
//                             <thead>
//                             <tr>
//                                 <th>ID</th>
//                                 <th>E Code</th>
//                                 <th>Name</th>
//                                 <th>Email</th>
//                                 <th>Role</th>
//                                 <th>Actions</th>
//                             </tr>
//                             </thead>
//
//                             <tbody>
//                             {users.map(u => (
//                                 <tr key={u.id}>
//                                     <td>{u.id}</td>
//                                     <td>{u.eCode}</td>
//                                     <td>{u.fullName}</td>
//                                     <td>{u.email}</td>
//                                     <td>
//                                         <span className={`badge ${u.role.toLowerCase()}`}>
//                                             {u.role}
//                                         </span>
//                                     </td>
//                                     <td>
//                                         <button onClick={() => handleEdit(u)}>Edit</button>
//                                         <button className="danger" onClick={() => handleDelete(u.id)}>Delete</button>
//                                     </td>
//                                 </tr>
//                             ))}
//                             </tbody>
//                         </table>
//                     </div>
//
//                 </div>
//             </div>
//
//             {/* ================= ERP STYLE ================= */}
//             <style>{`
//                 body { margin:0;font-family:Arial; }
//
//                 .erp { display:flex;height:100vh;background:#f1f5f9; }
//
//                 .sidebar {
//                     width:220px;
//                     background:#0f172a;
//                     color:white;
//                     padding:20px;
//                 }
//
//                 .sidebar p {
//                     padding:10px;
//                     cursor:pointer;
//                 }
//
//                 .sidebar p:hover {
//                     background:#1e293b;
//                 }
//
//                 .main { flex:1;display:flex;flex-direction:column; }
//
//                 .topbar {
//                     background:white;
//                     padding:15px;
//                     display:flex;
//                     justify-content:space-between;
//                     border-bottom:1px solid #ddd;
//                 }
//
//                 .content { padding:20px;overflow:auto; }
//
//                 .stats { display:flex;gap:20px;margin-bottom:20px; }
//
//                 .card {
//                     background:white;
//                     padding:20px;
//                     border-radius:8px;
//                     box-shadow:0 2px 6px rgba(0,0,0,.1);
//                     margin-bottom:20px;
//                 }
//
//                 .form { display:flex;gap:10px;flex-wrap:wrap; }
//
//                 input,select {
//                     padding:8px;
//                     border:1px solid #ccc;
//                     border-radius:4px;
//                 }
//
//                 button {
//                     background:#2563eb;
//                     color:white;
//                     border:none;
//                     padding:8px 12px;
//                     border-radius:4px;
//                     cursor:pointer;
//                 }
//
//                 button:hover { background:#1d4ed8; }
//
//                 .danger { background:#dc2626; }
//
//                 table { width:100%;border-collapse:collapse; }
//
//                 th,td {
//                     padding:10px;
//                     border-bottom:1px solid #eee;
//                     text-align:left;
//                 }
//
//                 .badge {
//                     padding:4px 8px;
//                     border-radius:4px;
//                     color:white;
//                     font-size:12px;
//                 }
//
//                 .admin { background:#16a34a; }
//                 .driver { background:#2563eb; }
//                 .dispatch { background:#9333ea; }
//                 .production { background:#f59e0b; }
//                 .coordinator { background:#14b8a6; }
//                 .vp { background:#ef4444; }
//             `}</style>
//         </div>
//     );
// }
//
// export default AdminDashboard;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
    FaUsers, FaUserShield, FaTruck, FaChartLine,
    FaUserPlus, FaTrashAlt, FaEdit, FaSearch,
    FaCog, FaFileAlt, FaWarehouse, FaSignOutAlt,
    FaCircleNotch, FaCheckCircle, FaUserTie,
    FaUserEdit, FaHardHat, FaShoppingCart, FaUserTag, FaFillDrip
} from "react-icons/fa";

function AdminDashboard() {
   const API = `${process.env.REACT_APP_API_URL}/api/users`;

    const [users, setUsers] = useState([]);
    const [form, setForm] = useState({
        eCode: "",
        fullName: "",
        email: "",
        password: "",
        role: "USER",
    });

    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/");
    };

    const fetchUsers = async () => {
        setFetching(true);
        try {
            const res = await axios.get(API);
            setUsers(res.data || []);
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const showToast = (msg) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(""), 3000);
    };

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let payload = { ...form };
            payload.eCode = parseInt(form.eCode);

            if (editId && !payload.password) delete payload.password;

            if (editId) {
                await axios.put(`${API}/${editId}`, payload);
                showToast("User updated successfully!");
                setEditId(null);
            } else {
                await axios.post(API, payload);
                showToast("User created successfully!");
            }

            setForm({ eCode: "", fullName: "", email: "", password: "", role: "USER" });
            fetchUsers();
        } catch (error) {
            alert("Error: Operation failed. Ensure E-Code is unique.");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (u) => {
        setForm({
            eCode: u.eCode.toString(),
            fullName: u.fullName,
            email: u.email,
            password: "",
            role: u.role
        });
        setEditId(u.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        await axios.delete(`${API}/${id}`);
        showToast("User deleted.");
        fetchUsers();
    };

    const filteredUsers = users.filter(u => {
        const search = searchTerm.toLowerCase();
        const nameMatch = u.fullName ? u.fullName.toLowerCase().includes(search) : false;
        const eCodeMatch = u.eCode ? String(u.eCode).toLowerCase().includes(search) : false;
        return nameMatch || eCodeMatch;
    });

    // ================= DYNAMIC ROLE COUNTS =================
    const getCount = (role) => users.filter(u => u.role === role).length;

    return (
        <div className="erp-app">
            {successMsg && (
                <div className="toast-message">
                    <FaCheckCircle /> {successMsg}
                </div>
            )}

            <aside className="erp-sidebar">
                <div className="brand">
                    <div className="logo-icon">E</div>
                    <h2>ADMIN</h2>
                </div>
                <nav className="nav-links">
                    <div className="nav-item active"><FaChartLine /> Dashboard</div>
                    <div className="nav-item"><FaUsers /> Users Management</div>
                    <div className="nav-item"><FaWarehouse /> Production</div>
                    <div className="nav-item"><FaFileAlt /> Reports</div>
                    <div className="nav-item"><FaCog /> Settings</div>
                </nav>

                <div className="nav-item logout" onClick={handleLogout}>
                    <FaSignOutAlt /> Logout
                </div>
            </aside>

            <main className="erp-main">
                <header className="erp-topbar">
                    <div className="header-info">
                        <h1>Administration</h1>
                        <p>Detailed view of personnel distribution</p>
                    </div>
                    <div className="admin-profile">
                        <div className="admin-avatar">AD</div>
                        <span>Super Admin</span>
                    </div>
                </header>

                <div className="erp-content">

                    {/* ENHANCED STATS GRID - SHOWING ALL ROLES */}
                    <div className="stats-grid">
                        <div className="stat-card total">
                            <div className="stat-icon"><FaUsers /></div>
                            <div className="stat-data"><h3>{users.length}</h3><p>Total Staff</p></div>
                        </div>
                        <div className="stat-card admin">
                            <div className="stat-icon"><FaUserShield /></div>
                            <div className="stat-data"><h3>{getCount("ADMIN")}</h3><p>Admins</p></div>
                        </div>
                        <div className="stat-card vp">
                            <div className="stat-icon"><FaUserTie /></div>
                            <div className="stat-data"><h3>{getCount("VP")}</h3><p>VP</p></div>
                        </div>
                        <div className="stat-card coord">
                            <div className="stat-icon"><FaUserEdit /></div>
                            <div className="stat-data"><h3>{getCount("COORDINATOR")}</h3><p>Coordinators</p></div>
                        </div>
                        <div className="stat-card prod">
                            <div className="stat-icon"><FaWarehouse /></div>
                            <div className="stat-data"><h3>{getCount("PRODUCTION")}</h3><p>Production</p></div>
                        </div>
                        <div className="stat-card dispatch">
                            <div className="stat-icon"><FaUserTag /></div>
                            <div className="stat-data"><h3>{getCount("DISPATCH")}</h3><p>Dispatch</p></div>
                        </div>
                        <div className="stat-card driver">
                            <div className="stat-icon"><FaTruck /></div>
                            <div className="stat-data"><h3>{getCount("DRIVER")}</h3><p>Drivers</p></div>
                        </div>
                        <div className="stat-card site">
                            <div className="stat-icon"><FaHardHat /></div>
                            <div className="stat-data"><h3>{getCount("SITE_SUPERVISOR")}</h3><p>Supervisors</p></div>
                        </div>
                        <div className="stat-card purchase">
                            <div className="stat-icon"><FaShoppingCart /></div>
                            <div className="stat-data"><h3>{getCount("PURCHASE")}</h3><p>Purchase</p></div>
                        </div>
                        <div className="stat-card powder-coating">
                            <div className="stat-icon">
                                <FaFillDrip /> {/* or FaIndustry / FaLayerGroup */}
                            </div>
                            <div className="stat-data">
                                <h3>{getCount("POWDER_COATING")}</h3>
                                <p>Powder Coating</p>
                            </div>
                        </div>
                    </div>

                    <div className="action-grid">
                        {/* FORM SECTION */}
                        <section className="glass-card form-section">
                            <div className="card-header">
                                <FaUserPlus />
                                <h3>{editId ? "Update Employee" : "Create Account"}</h3>
                            </div>
                            <form onSubmit={handleSubmit} className="modern-form">
                                <div className="input-group">
                                    <label>Employee Code (Integer)</label>
                                    <input type="number" name="eCode" value={form.eCode} onChange={handleChange} required />
                                </div>
                                <div className="input-group">
                                    <label>Full Name</label>
                                    <input name="fullName" value={form.fullName} onChange={handleChange} required />
                                </div>
                                <div className="input-group">
                                    <label>Email Address</label>
                                    <input type="email" name="email" value={form.email} onChange={handleChange} required />
                                </div>
                                <div className="input-group">
                                    <label>Password</label>
                                    <input type="password" name="password" placeholder={editId ? "Skip to keep same" : ""} value={form.password} onChange={handleChange} required={!editId} />
                                </div>
                                <div className="input-group">
                                    <label>Role</label>
                                    <select name="role" value={form.role} onChange={handleChange}>
                                        <option value="ADMIN">ADMIN</option>
                                        <option value="VP">VP</option>
                                        <option value="COORDINATOR">COORDINATOR</option>
                                        <option value="PRODUCTION">PRODUCTION</option>
                                        <option value="DISPATCH">DISPATCH</option>
                                        <option value="DRIVER">DRIVER</option>
                                        <option value="SITE_SUPERVISOR">SITE_SUPERVISOR</option>
                                        <option value="PURCHASE">PURCHASE</option>
                                        <option value="POWDER_COATING">POWDER_COATING</option>

                                    </select>
                                </div>
                                <button className={`submit-btn ${editId ? 'update' : ''}`} disabled={loading}>
                                    {loading ? <FaCircleNotch className="spin" /> : editId ? "Apply Changes" : "Register User"}
                                </button>
                                {editId && <button type="button" className="cancel-btn" onClick={() => {setEditId(null); setForm({eCode:"",fullName:"",email:"",password:"",role:"USER"})}}>Cancel</button>}
                            </form>
                        </section>

                        {/* TABLE SECTION */}
                        <section className="glass-card table-section">
                            <div className="card-header list-header">
                                <h3>Staff Directory</h3>
                                <div className="search-box">
                                    <FaSearch />
                                    <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                </div>
                            </div>
                            <div className="table-container">
                                {fetching ? (
                                    <div className="loader-container">
                                        <FaCircleNotch className="spin-large" />
                                        <p>Refreshing Database...</p>
                                    </div>
                                ) : (
                                    <table className="modern-table">
                                        <thead>
                                        <tr>
                                            <th>Staff</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th className="text-right">Actions</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {filteredUsers.map(u => (
                                            <tr key={u.id}>
                                                <td>
                                                    <div className="user-info">
                                                        <span className="user-name">{u.fullName}</span>
                                                        <span className="user-code">ID: {u.eCode}</span>
                                                    </div>
                                                </td>
                                                <td>{u.email}</td>
                                                <td><span className={`role-badge ${u.role.toLowerCase()}`}>{u.role}</span></td>
                                                <td className="text-right">
                                                    <div className="action-btns">
                                                        <button className="btn-edit" onClick={() => handleEdit(u)}><FaEdit /></button>
                                                        <button className="btn-delete" onClick={() => handleDelete(u.id)}><FaTrashAlt /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </section>
                    </div>
                </div>

            </main>


            <style>{`
                :root { --primary: #6366f1; --primary-hover: #4f46e5; --bg-app: #f8fafc; --sidebar-dark: #0f172a; }
                body { margin: 0; font-family: 'Inter', sans-serif; background: var(--bg-app); }
                .erp-app { display: flex; height: 100vh; overflow: hidden; position: relative; }

                .toast-message {
                    position: fixed; top: 20px; right: 20px;
                    background: #10b981; color: white;
                    padding: 15px 25px; border-radius: 12px;
                    display: flex; align-items: center; gap: 10px;
                    box-shadow: 0 10px 15px rgba(0,0,0,0.1);
                    z-index: 1000; animation: slideIn 0.3s ease-out;
                }
                @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

                .erp-sidebar { width: 260px; background: var(--sidebar-dark); color: white; padding: 30px 20px; display: flex; flex-direction: column; }
                .brand { display: flex; align-items: center; gap: 12px; margin-bottom: 40px; }
                .logo-icon { background: var(--primary); width: 35px; height: 35px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; }
                .nav-links { flex: 1; }
                .nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 15px; border-radius: 8px; margin-bottom: 5px; cursor: pointer; color: #94a3b8; }
                .nav-item.active { background: var(--primary); color: white; }

                .erp-main { flex: 1; display: flex; flex-direction: column; overflow-y: auto; }
                .erp-topbar { background: white; padding: 20px 40px; display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; }

                .erp-content { padding: 30px; }

                /* DYNAMIC STATS GRID - 3 columns, auto-expanding rows */
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px; }
                .stat-card { background: white; padding: 15px; border-radius: 12px; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-left: 4px solid #cbd5e1; }
                .stat-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 16px; }
                
                .stat-card.total { border-left-color: #6366f1; }
                .stat-card.admin { border-left-color: #ef4444; }
                .stat-card.vp { border-left-color: #8b5cf6; }
                .stat-card.coord { border-left-color: #ec4899; }
                .stat-card.prod { border-left-color: #f59e0b; }
                .stat-card.dispatch { border-left-color: #10b981; }
                .stat-card.driver { border-left-color: #3b82f6; }
                .stat-card.site { border-left-color: #06b6d4; }
                .stat-card.purchase { border-left-color: #71717a; }

                .total .stat-icon { background: #e0e7ff; color: #4338ca; }
                .admin .stat-icon { background: #fee2e2; color: #991b1b; }
                .vp .stat-icon { background: #ede9fe; color: #5b21b6; }
                .driver .stat-icon { background: #dbeafe; color: #1e40af; }

                .stat-data h3 { margin: 0; font-size: 20px; color: #1e293b; }
                .stat-data p { margin: 0; color: #64748b; font-size: 12px; font-weight: 600; }

                .action-grid { display: grid; grid-template-columns: 350px 1fr; gap: 25px; }
                .glass-card { background: white; border-radius: 15px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
                .card-header { padding: 15px 20px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; gap: 10px; font-weight: 600; }
                
                .modern-form { padding: 20px; display: flex; flex-direction: column; gap: 15px; }
                .input-group { display: flex; flex-direction: column; gap: 5px; }
                .input-group label { font-size: 12px; font-weight: 700; color: #475569; }
                .input-group input, .input-group select { padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; }
                
                .submit-btn { background: var(--primary); color: white; border: none; padding: 12px; border-radius: 8px; font-weight: bold; cursor: pointer; display: flex; justify-content: center; }
                .submit-btn.update { background: #10b981; }

                .modern-table { width: 100%; border-collapse: collapse; }
                .modern-table th { background: #f8fafc; padding: 15px; text-align: left; font-size: 11px; color: #64748b; text-transform: uppercase; }
                .modern-table td { padding: 12px 15px; border-bottom: 1px solid #f1f5f9; }
                .user-name { font-weight: 600; color: #1e293b; font-size: 14px; }
                .user-code { font-size: 11px; color: #94a3b8; }
                
                .role-badge { padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: bold; text-transform: uppercase; }
                .role-badge.admin { background: #fee2e2; color: #991b1b; }
                .role-badge.driver { background: #dbeafe; color: #1e40af; }
                .role-badge.production { background: #fef3c7; color: #92400e; }
                .role-badge.vp { background: #ede9fe; color: #5b21b6; }
                
                .action-btns { display: flex; gap: 8px; justify-content: flex-end; }
                .action-btns button { padding: 8px; border-radius: 8px; border: none; cursor: pointer; }
                .btn-edit { background: #f1f5f9; color: #475569; }
                .btn-delete { background: #fee2e2; color: #dc2626; }
                
                .spin { animation: rotate 1s linear infinite; }
                .spin-large { font-size: 30px; margin-bottom: 10px; animation: rotate 1s linear infinite; color: var(--primary); }
                @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .loader-container { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; color: #64748b; }
            `}</style>

        </div>
    );
}

export default AdminDashboard;
