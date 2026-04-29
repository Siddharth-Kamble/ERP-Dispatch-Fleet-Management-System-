


import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaPlus, FaClock, FaCalendarAlt, FaCheckCircle,
    FaTimesCircle, FaExclamationCircle, FaSignOutAlt,
    FaBell, FaDownload, FaHistory, FaSearch, FaSync, FaFileAlt,
    FaMapMarkerAlt, FaUserTie, FaFlag
} from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_URL = "http://localhost:8080/api/appointments";

const PRIORITY_CONFIG = {
    HIGH:   { color: "#dc2626", bg: "#fee2e2", label: "High" },
    MEDIUM: { color: "#d97706", bg: "#fef3c7", label: "Medium" },
    LOW:    { color: "#16a34a", bg: "#dcfce7", label: "Low" },
};

function PAAppointmentPage() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const [appointments, setAppointments] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [showNotif, setShowNotif] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [filter, setFilter] = useState("ALL");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [req, setReq] = useState({
        title: "", date: "", time: "", reason: "",
        personName: "", priority: "MEDIUM", duration: "30", location: ""
    });
    const [pdfRange, setPdfRange] = useState({ from: "", to: "" });
    const [showPdfPanel, setShowPdfPanel] = useState(false);
    const prevRef = useRef([]);

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const loadData = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/all`);
            const data = await res.json();
            const safe = Array.isArray(data) ? data : [];
            const prev = prevRef.current;
            const newNotifs = [];
            safe.forEach(apt => {
                const old = prev.find(p => p.id === apt.id);
                if (old && old.status !== apt.status) {
                    newNotifs.push({
                        id: Date.now() + apt.id,
                        msg: `"${apt.title}" is now ${apt.status}${apt.bossComment ? ` — "${apt.bossComment}"` : ""}`,
                        time: new Date().toLocaleTimeString(), type: apt.status
                    });
                }
                if (!old && apt.status === "AVAILABLE") {
                    newNotifs.push({
                        id: Date.now() + apt.id,
                        msg: `Boss posted a new open slot: ${new Date(apt.startTime).toLocaleString()}`,
                        time: new Date().toLocaleTimeString(), type: "AVAILABLE"
                    });
                }
            });
            if (newNotifs.length) setNotifications(p => [...newNotifs, ...p].slice(0, 20));
            prevRef.current = safe;
            setAppointments(safe);
        } catch (err) { console.error(err); }
    }, []);

    useEffect(() => {
        loadData();
        const iv = setInterval(loadData, 8000);
        return () => clearInterval(iv);
    }, [loadData]);

    const handleSchedule = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/schedule`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: req.title, reason: req.reason,
                    personName: req.personName, priority: req.priority,
                    duration: parseInt(req.duration), location: req.location,
                    startTime: `${req.date}T${req.time}:00`,
                    status: "PENDING", paId: user.id, bossId: 1
                })
            });
            if (res.ok) {
                showToast("Appointment request sent to Boss!");
                setReq({ title: "", date: "", time: "", reason: "", personName: "", priority: "MEDIUM", duration: "30", location: "" });
                setShowForm(false);
                loadData();
            }
        } catch { showToast("Failed to send request", "error"); }
        setLoading(false);
    };

    const bookSlot = async (slot) => {
        try {
            const res = await fetch(`${API_URL}/schedule`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...slot, status: "AVAILABLE", paId: user.id })
            });
            if (res.ok) { showToast("Slot booked and auto-approved!"); loadData(); }
        } catch { showToast("Booking failed", "error"); }
    };

    const downloadPDF = () => {
        const from = pdfRange.from ? new Date(pdfRange.from) : null;
        const to   = pdfRange.to   ? new Date(pdfRange.to + "T23:59:59") : null;
        const filtered = appointments.filter(a => {
            if (!a.startTime) return false;
            const d = new Date(a.startTime);
            if (from && d < from) return false;
            if (to   && d > to)   return false;
            return true;
        });
        const doc = new jsPDF({ orientation: "landscape" });
        doc.setFontSize(18); doc.setTextColor(124, 58, 237);
        doc.text("OneDeo Leela — PA Appointment Report", 14, 20);
        doc.setFontSize(10); doc.setTextColor(100, 100, 100);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
        if (from || to) doc.text(`Period: ${pdfRange.from || "All"} to ${pdfRange.to || "Now"}`, 14, 34);
        autoTable(doc, {
            startY: 40,
            head: [["#", "Purpose", "Person", "Priority", "Date & Time", "Duration", "Location", "Reason", "Status", "Boss Note"]],
            body: filtered.map(a => [
                `#${a.id}`, a.title || "-", a.personName || "-", a.priority || "-",
                a.startTime ? new Date(a.startTime).toLocaleString() : "-",
                a.duration ? `${a.duration} min` : "-", a.location || "-",
                a.reason || "-", a.status || "-", a.bossComment || "-"
            ]),
            styles: { fontSize: 8, cellPadding: 3 },
            headStyles: { fillColor: [124, 58, 237], textColor: 255, fontStyle: "bold" },
            alternateRowStyles: { fillColor: [248, 245, 255] }
        });
        doc.save(`PA_Appointments_${Date.now()}.pdf`);
        showToast("PDF downloaded!"); setShowPdfPanel(false);
    };

    const unread = notifications.filter(n => !n.read).length;
    const markAllRead = () => setNotifications(p => p.map(n => ({ ...n, read: true })));

    const statusColor = s => ({ APPROVED:"#16a34a", REJECTED:"#ef4444", RESCHEDULED:"#0284c7", AVAILABLE:"#7c3aed" }[s] || "#d97706");
    const statusBg    = s => ({ APPROVED:"#dcfce7", REJECTED:"#fee2e2", RESCHEDULED:"#e0f2fe", AVAILABLE:"#f3e8ff" }[s] || "#fef3c7");

    const availableSlots = appointments.filter(a => a.status === "AVAILABLE");
const filteredList = React.useMemo(() => {
    return appointments
        .filter(a => {
            const mf = filter === "ALL" || a.status === filter;
            const ms = !search ||
                (a.title || "").toLowerCase().includes(search.toLowerCase()) ||
                (a.personName || "").toLowerCase().includes(search.toLowerCase());

            return mf && ms && a.status !== "AVAILABLE";
        })
  .sort((a, b) => Number(b.id) - Number(a.id))
}, [appointments, filter, search]);
    const stats = {
        total:    appointments.filter(a => a.status !== "AVAILABLE").length,
        approved: appointments.filter(a => a.status === "APPROVED").length,
        pending:  appointments.filter(a => a.status === "PENDING").length,
        rejected: appointments.filter(a => a.status === "REJECTED").length
    };

    return (
        <div style={st.root}>
            {toast && (
                <div style={{ ...st.toast, background: toast.type === "error" ? "#ef4444" : "#7c3aed" }}>
                    {toast.type === "error" ? <FaTimesCircle /> : <FaCheckCircle />} {toast.msg}
                </div>
            )}

            {/* ── SIDEBAR ── no stats block ── */}
            <aside style={st.sidebar}>
                <div style={st.sidebarTop}>
                    <div style={st.logoBox}><span style={st.logoText}>PA</span></div>
                    <div>
                        <div style={st.brandName}>Assistant Portal</div>
                        <div style={st.brandSub}>OneDeo Leela</div>
                    </div>
                </div>

                <nav style={st.nav}>
                    {[
                        { label: "My Appointments",  icon: <FaCalendarAlt />, active: true },
                        { label: "Schedule Request", icon: <FaPlus />,        action: () => setShowForm(!showForm) },
                        { label: "Available Slots",  icon: <FaClock />,       count: availableSlots.length },
                        { label: "Download Report",  icon: <FaDownload />,    action: () => setShowPdfPanel(!showPdfPanel) }
                    ].map((item, i) => (
                        <div key={i}
                            style={{ ...st.navItem, ...(item.active ? st.navItemActive : {}) }}
                            onClick={item.action}>
                            <span style={st.navIcon}>{item.icon}</span>
                            <span>{item.label}</span>
                            {item.count > 0 && <span style={st.navBadge}>{item.count}</span>}
                        </div>
                    ))}
                </nav>

                <button style={st.logoutBtn} onClick={() => navigate("/")}>
                    <FaSignOutAlt /> Logout
                </button>
            </aside>

            {/* ── MAIN ── */}
            <main style={st.main}>
                <header style={st.topbar}>
                    <div style={st.searchWrap}>
                        <FaSearch style={st.searchIcon} />
                        <input placeholder="Search by title or person…" value={search}
                            onChange={e => setSearch(e.target.value)} style={st.searchInput} />
                    </div>
                    <div style={st.topActions}>
                        <button style={st.iconBtn} onClick={loadData}><FaSync /></button>
                        <div style={{ position: "relative" }}>
                            <button style={st.bellBtn} onClick={() => { setShowNotif(!showNotif); markAllRead(); }}>
                                <FaBell />
                                {unread > 0 && <span style={st.badge}>{unread}</span>}
                            </button>
                            {showNotif && (
                                <div style={st.notifPanel}>
                                    <div style={st.notifHeader}>Notifications</div>
                                    {notifications.length === 0
                                        ? <div style={st.notifEmpty}>No notifications yet</div>
                                        : notifications.map(n => (
                                            <div key={n.id} style={st.notifItem}>
                                                <div style={{ ...st.notifDot, background: statusColor(n.type) }} />
                                                <div>
                                                    <div style={st.notifMsg}>{n.msg}</div>
                                                    <div style={st.notifTime}>{n.time}</div>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                            )}
                        </div>
                        <div style={st.userChip}>
                            <div style={st.avatar}>{(user.name || "PA")[0].toUpperCase()}</div>
                            <span style={st.userName}>{user.name || "PA User"}</span>
                        </div>
                    </div>
                </header>

                <div style={st.body}>
                    <div style={st.pageTitle}>
                        <div>
                            <h1 style={st.h1}>Appointment Dashboard</h1>
                            <p style={st.subtitle}>Manage and track all your appointment requests</p>
                        </div>
                        <button style={st.primaryBtn} onClick={() => setShowForm(!showForm)}>
                            <FaPlus /> New Appointment
                        </button>
                    </div>

                    {/* STATS CARDS */}
                    <div style={st.statsGrid}>
                        {[
                            { label:"Total Requests", val:stats.total,    color:"#7c3aed", bg:"#f3e8ff", icon:<FaFileAlt /> },
                            { label:"Approved",       val:stats.approved, color:"#16a34a", bg:"#dcfce7", icon:<FaCheckCircle /> },
                            { label:"Pending",        val:stats.pending,  color:"#d97706", bg:"#fef3c7", icon:<FaExclamationCircle /> },
                            { label:"Rejected",       val:stats.rejected, color:"#ef4444", bg:"#fee2e2", icon:<FaTimesCircle /> }
                        ].map((s, i) => (
                            <div key={i} style={st.statCard}>
                                <div style={{ ...st.statIcon, background:s.bg, color:s.color }}>{s.icon}</div>
                                <div style={{ ...st.statVal, color:s.color }}>{s.val}</div>
                                <div style={st.statLabel}>{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* NEW APPOINTMENT FORM */}
                    {showForm && (
                        <div style={st.formCard}>
                            <div style={st.formTitle}><FaPlus /> Schedule New Appointment</div>
                            <form onSubmit={handleSchedule} style={st.form}>
                                {/* Row 1: Purpose · Person · Priority */}
                                <div style={st.grid3}>
                                    <div style={st.fg}>
                                        <label style={st.label}>Purpose / Title</label>
                                        <input style={st.input} type="text" placeholder="e.g. Project Review"
                                            value={req.title} onChange={e => setReq({...req, title: e.target.value})} required />
                                    </div>
                                    <div style={st.fg}>
                                        <label style={st.label}><FaUserTie style={{marginRight:4}}/> Person Name</label>
                                        <input style={st.input} type="text" placeholder="Who is this meeting with?"
                                            value={req.personName} onChange={e => setReq({...req, personName: e.target.value})} required />
                                    </div>
                                    <div style={st.fg}>
                                        <label style={st.label}><FaFlag style={{marginRight:4}}/> Priority</label>
                                        <select style={st.input} value={req.priority}
                                            onChange={e => setReq({...req, priority: e.target.value})}>
                                            <option value="HIGH">🔴  High</option>
                                            <option value="MEDIUM">🟡  Medium</option>
                                            <option value="LOW">🟢  Low</option>
                                        </select>
                                    </div>
                                </div>
                                {/* Row 2: Date · Time · Duration · Location */}
                                <div style={st.grid4}>
                                    <div style={st.fg}>
                                        <label style={st.label}>Date</label>
                                        <input style={st.input} type="date" value={req.date}
                                            onChange={e => setReq({...req, date: e.target.value})} required />
                                    </div>
                                    <div style={st.fg}>
                                        <label style={st.label}>Start Time</label>
                                        <input style={st.input} type="time" value={req.time}
                                            onChange={e => setReq({...req, time: e.target.value})} required />
                                    </div>
                                    <div style={st.fg}>
                                        <label style={st.label}>Duration (mins)</label>
                                        <select style={st.input} value={req.duration}
                                            onChange={e => setReq({...req, duration: e.target.value})}>
                                            {["15","30","45","60","90","120"].map(d =>
                                                <option key={d} value={d}>{d} min</option>)}
                                        </select>
                                    </div>
                                    <div style={st.fg}>
                                        <label style={st.label}><FaMapMarkerAlt style={{marginRight:4}}/> Location</label>
                                        <input style={st.input} type="text" placeholder="Office / Virtual / Site"
                                            value={req.location} onChange={e => setReq({...req, location: e.target.value})} />
                                    </div>
                                </div>
                                {/* Row 3: Reason */}
                                <div style={st.fg}>
                                    <label style={st.label}>Reason for Appointment</label>
                                    <textarea style={{...st.input, height:"75px", resize:"vertical"}}
                                        placeholder="Briefly describe why this appointment is needed…"
                                        value={req.reason} onChange={e => setReq({...req, reason: e.target.value})} required />
                                </div>
                                <div style={{display:"flex", gap:"12px"}}>
                                    <button type="submit" style={st.submitBtn} disabled={loading}>
                                        {loading ? "Sending…" : "Send Request to Boss"}
                                    </button>
                                    <button type="button" style={st.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* PDF PANEL */}
                    {showPdfPanel && (
                        <div style={st.formCard}>
                            <div style={st.formTitle}><FaDownload /> Download Report as PDF</div>
                            <div style={{display:"flex", gap:"16px", alignItems:"flex-end", flexWrap:"wrap"}}>
                                <div style={st.fg}>
                                    <label style={st.label}>From Date</label>
                                    <input style={st.input} type="date" value={pdfRange.from}
                                        onChange={e => setPdfRange({...pdfRange, from: e.target.value})} />
                                </div>
                                <div style={st.fg}>
                                    <label style={st.label}>To Date</label>
                                    <input style={st.input} type="date" value={pdfRange.to}
                                        onChange={e => setPdfRange({...pdfRange, to: e.target.value})} />
                                </div>
                                <button style={st.submitBtn} onClick={downloadPDF}><FaDownload /> Download PDF</button>
                                <button style={st.cancelBtn} onClick={() => setShowPdfPanel(false)}>Cancel</button>
                            </div>
                        </div>
                    )}

                    {/* AVAILABLE SLOTS */}
                    {availableSlots.length > 0 && (
                        <div style={{marginBottom:"24px"}}>
                            <div style={st.sectionTitle}><FaClock style={{color:"#7c3aed"}}/> Boss Open Availability</div>
                            <div style={st.slotsGrid}>
                                {availableSlots.map(slot => (
                                    <div key={slot.id} style={st.slotCard}>
                                        <div style={st.slotTime}>
                                            {new Date(slot.startTime).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}
                                        </div>
                                        <div style={st.slotDate}>{new Date(slot.startTime).toLocaleDateString()}</div>
                                        <div style={st.slotTitle}>{slot.title}</div>
                                        <button style={st.bookBtn} onClick={() => bookSlot(slot)}>Book This Slot</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* FILTER BAR */}
                    <div style={st.filterBar}>
                        <div style={st.sectionTitle}><FaHistory style={{color:"#7c3aed"}}/> My Appointment History</div>
                        <div style={{display:"flex", gap:"8px"}}>
                            {["ALL","PENDING","APPROVED","REJECTED","RESCHEDULED"].map(f => (
                                <button key={f}
                                    style={{...st.filterBtn, ...(filter===f ? st.filterBtnActive : {})}}
                                    onClick={() => setFilter(f)}>{f}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* TABLE */}
                    <div style={st.tableWrap}>
                        <table style={st.table}>
                            <thead>
                                <tr>
                                    {["Ref","Purpose","Person","Priority","Date & Time","Duration","Location","Status","Boss Note"].map(h => (
                                        <th key={h} style={st.th}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredList.length === 0
                                    ? <tr><td colSpan={9} style={st.emptyCell}>No appointments found</td></tr>
                                    : filteredList.map(apt => {
                                        const pc = PRIORITY_CONFIG[apt.priority] || PRIORITY_CONFIG.MEDIUM;
                                        return (
                                            <tr key={apt.id} style={st.tr}>
                                                <td style={st.tdRef}>#{apt.id}</td>
                                                <td style={st.td}>
                                                    <strong>{apt.title}</strong>
                                                    {apt.reason && <div style={{fontSize:"11px",color:"#94a3b8",marginTop:"2px"}}>{apt.reason}</div>}
                                                </td>
                                                <td style={st.td}>
                                                    <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                                                        <FaUserTie style={{color:"#a78bfa",fontSize:"11px"}}/>
                                                        {apt.personName || "—"}
                                                    </div>
                                                </td>
                                                <td style={st.td}>
                                                    <span style={{...st.pill, background:pc.bg, color:pc.color}}>{pc.label}</span>
                                                </td>
                                                <td style={st.td}>
                                                    <div style={{fontWeight:600}}>{new Date(apt.startTime).toLocaleDateString()}</div>
                                                    <div style={{color:"#64748b",fontSize:"12px"}}>{new Date(apt.startTime).toLocaleTimeString()}</div>
                                                </td>
                                                <td style={{...st.td,color:"#64748b",fontSize:"12px"}}>
                                                    {apt.duration ? `${apt.duration} min` : "—"}
                                                </td>
                                                <td style={{...st.td,color:"#64748b",fontSize:"12px"}}>
                                                    {apt.location ? <><FaMapMarkerAlt style={{fontSize:"10px"}}/> {apt.location}</> : "—"}
                                                </td>
                                                <td style={st.td}>
                                                    <span style={{...st.pill, background:statusBg(apt.status), color:statusColor(apt.status)}}>{apt.status}</span>
                                                </td>
                                                <td style={{...st.td,fontStyle:"italic",color:"#64748b",fontSize:"12px"}}>
                                                    {apt.bossComment || <span style={{color:"#cbd5e1"}}>Note is not added…</span>}
                                                </td>
                                            </tr>
                                        );
                                    })
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');
                *{box-sizing:border-box;}body{margin:0;font-family:'Sora',sans-serif;}
                input:focus,textarea:focus,select:focus{outline:none;border-color:#7c3aed!important;box-shadow:0 0 0 3px rgba(124,58,237,.15);}
                ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:#f1f5f9}::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px}
                @keyframes slideIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
            `}</style>
        </div>
    );
}

const st = {
    root:        { display:"flex", height:"100vh", fontFamily:"'Sora',sans-serif", background:"#f5f3ff", overflow:"hidden" },
    toast:       { position:"fixed", top:20, right:20, zIndex:9999, color:"white", padding:"12px 24px", borderRadius:"10px", fontWeight:600, fontSize:"14px", display:"flex", alignItems:"center", gap:"10px", boxShadow:"0 8px 24px rgba(0,0,0,.2)", animation:"slideIn .3s ease" },
    sidebar:     { width:"260px", background:"#1e0a3c", color:"white", display:"flex", flexDirection:"column", padding:"24px 16px", flexShrink:0 },
    sidebarTop:  { display:"flex", alignItems:"center", gap:"12px", marginBottom:"32px" },
    logoBox:     { width:"44px", height:"44px", background:"linear-gradient(135deg,#7c3aed,#a855f7)", borderRadius:"12px", display:"flex", alignItems:"center", justifyContent:"center" },
    logoText:    { color:"white", fontWeight:800, fontSize:"16px" },
    brandName:   { fontWeight:800, fontSize:"15px", color:"#e9d5ff" },
    brandSub:    { fontSize:"11px", color:"#7c3aed" },
    nav:         { flex:1 },
    navItem:     { display:"flex", alignItems:"center", gap:"12px", padding:"12px 14px", borderRadius:"10px", color:"#a78bfa", fontSize:"13px", fontWeight:500, cursor:"pointer", marginBottom:"4px", transition:"all .2s" },
    navItemActive:{ background:"rgba(124,58,237,.3)", color:"white", borderLeft:"3px solid #a855f7" },
    navIcon:     { fontSize:"14px", width:"18px", textAlign:"center" },
    navBadge:    { marginLeft:"auto", background:"#7c3aed", color:"white", borderRadius:"10px", padding:"2px 8px", fontSize:"11px", fontWeight:700 },
    logoutBtn:   { display:"flex", alignItems:"center", gap:"10px", background:"rgba(239,68,68,.15)", color:"#f87171", border:"1px solid rgba(239,68,68,.3)", padding:"10px 16px", borderRadius:"10px", cursor:"pointer", fontSize:"13px", fontWeight:600, marginTop:"16px", fontFamily:"'Sora',sans-serif" },
    main:        { flex:1, display:"flex", flexDirection:"column", overflow:"hidden" },
    topbar:      { background:"white", padding:"14px 32px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid #ede9fe", boxShadow:"0 2px 8px rgba(124,58,237,.06)" },
    searchWrap:  { position:"relative", flex:1, maxWidth:"360px" },
    searchIcon:  { position:"absolute", left:"12px", top:"50%", transform:"translateY(-50%)", color:"#a78bfa", fontSize:"13px" },
    searchInput: { width:"100%", padding:"10px 10px 10px 36px", border:"1px solid #ede9fe", borderRadius:"10px", background:"#faf5ff", fontSize:"13px", fontFamily:"'Sora',sans-serif" },
    topActions:  { display:"flex", alignItems:"center", gap:"12px" },
    iconBtn:     { background:"#faf5ff", border:"1px solid #ede9fe", color:"#7c3aed", borderRadius:"8px", padding:"8px 12px", cursor:"pointer", fontSize:"14px" },
    bellBtn:     { position:"relative", background:"#faf5ff", border:"1px solid #ede9fe", color:"#7c3aed", borderRadius:"8px", padding:"8px 12px", cursor:"pointer", fontSize:"16px" },
    badge:       { position:"absolute", top:"-4px", right:"-4px", background:"#ef4444", color:"white", borderRadius:"50%", width:"16px", height:"16px", fontSize:"10px", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700 },
    notifPanel:  { position:"absolute", right:0, top:"44px", width:"320px", background:"white", border:"1px solid #ede9fe", borderRadius:"14px", boxShadow:"0 16px 40px rgba(124,58,237,.15)", zIndex:999, animation:"slideIn .2s ease" },
    notifHeader: { padding:"14px 18px", borderBottom:"1px solid #ede9fe", fontWeight:700, fontSize:"13px", color:"#4c1d95" },
    notifEmpty:  { padding:"20px", textAlign:"center", color:"#a78bfa", fontSize:"13px" },
    notifItem:   { padding:"12px 18px", borderBottom:"1px solid #faf5ff", display:"flex", gap:"12px", alignItems:"flex-start" },
    notifDot:    { width:"8px", height:"8px", borderRadius:"50%", marginTop:"5px", flexShrink:0 },
    notifMsg:    { fontSize:"12px", color:"#1e293b", fontWeight:500, lineHeight:1.5 },
    notifTime:   { fontSize:"11px", color:"#a78bfa", marginTop:"2px" },
    userChip:    { display:"flex", alignItems:"center", gap:"10px", background:"#faf5ff", border:"1px solid #ede9fe", borderRadius:"10px", padding:"6px 14px" },
    avatar:      { width:"30px", height:"30px", background:"linear-gradient(135deg,#7c3aed,#a855f7)", borderRadius:"50%", color:"white", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:"13px" },
    userName:    { fontSize:"13px", fontWeight:600, color:"#4c1d95" },
    body:        { flex:1, overflow:"auto", padding:"28px 32px" },
    pageTitle:   { display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"24px" },
    h1:          { margin:0, fontSize:"24px", fontWeight:800, color:"#1e0a3c" },
    subtitle:    { margin:"4px 0 0", fontSize:"13px", color:"#7c3aed" },
    primaryBtn:  { display:"flex", alignItems:"center", gap:"8px", background:"linear-gradient(135deg,#7c3aed,#a855f7)", color:"white", border:"none", padding:"12px 22px", borderRadius:"10px", fontWeight:700, fontSize:"13px", cursor:"pointer", fontFamily:"'Sora',sans-serif", boxShadow:"0 4px 14px rgba(124,58,237,.3)" },
    statsGrid:   { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"16px", marginBottom:"24px" },
    statCard:    { background:"white", borderRadius:"14px", padding:"20px", border:"1px solid #ede9fe", boxShadow:"0 2px 8px rgba(124,58,237,.04)" },
    statIcon:    { width:"40px", height:"40px", borderRadius:"10px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px", marginBottom:"12px" },
    statVal:     { fontSize:"28px", fontWeight:800, lineHeight:1 },
    statLabel:   { fontSize:"12px", color:"#64748b", fontWeight:600, marginTop:"4px" },
    formCard:    { background:"white", borderRadius:"16px", border:"1px solid #ede9fe", padding:"24px", marginBottom:"24px", boxShadow:"0 4px 16px rgba(124,58,237,.08)", animation:"slideIn .3s ease" },
    formTitle:   { fontWeight:800, fontSize:"15px", color:"#1e0a3c", marginBottom:"20px", display:"flex", alignItems:"center", gap:"8px" },
    form:        { display:"flex", flexDirection:"column", gap:"16px" },
    grid3:       { display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"16px" },
    grid4:       { display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:"16px" },
    fg:          { display:"flex", flexDirection:"column", gap:"6px" },
    label:       { fontSize:"11px", fontWeight:700, color:"#7c3aed", textTransform:"uppercase", letterSpacing:"0.5px", display:"flex", alignItems:"center" },
    input:       { padding:"11px 14px", border:"1px solid #ede9fe", borderRadius:"8px", fontSize:"13px", fontFamily:"'Sora',sans-serif", background:"#faf5ff" },
    submitBtn:   { display:"flex", alignItems:"center", gap:"8px", background:"linear-gradient(135deg,#7c3aed,#a855f7)", color:"white", border:"none", padding:"12px 24px", borderRadius:"10px", fontWeight:700, fontSize:"13px", cursor:"pointer", fontFamily:"'Sora',sans-serif" },
    cancelBtn:   { background:"#f1f5f9", color:"#64748b", border:"1px solid #e2e8f0", padding:"12px 20px", borderRadius:"10px", fontWeight:600, fontSize:"13px", cursor:"pointer", fontFamily:"'Sora',sans-serif" },
    sectionTitle:{ fontWeight:700, fontSize:"14px", color:"#1e0a3c", marginBottom:"14px", display:"flex", alignItems:"center", gap:"8px" },
    slotsGrid:   { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:"14px" },
    slotCard:    { background:"white", border:"2px dashed #a855f7", borderRadius:"14px", padding:"18px", textAlign:"center" },
    slotTime:    { fontSize:"22px", fontWeight:800, color:"#7c3aed" },
    slotDate:    { fontSize:"12px", color:"#64748b", marginBottom:"8px" },
    slotTitle:   { fontSize:"13px", fontWeight:600, color:"#1e0a3c", marginBottom:"14px" },
    bookBtn:     { background:"#7c3aed", color:"white", border:"none", padding:"8px 18px", borderRadius:"8px", fontWeight:700, fontSize:"12px", cursor:"pointer", fontFamily:"'Sora',sans-serif" },
    filterBar:   { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"14px" },
    filterBtn:   { background:"white", border:"1px solid #ede9fe", color:"#7c3aed", padding:"6px 14px", borderRadius:"8px", fontSize:"11px", fontWeight:700, cursor:"pointer", fontFamily:"'Sora',sans-serif" },
    filterBtnActive:{ background:"#7c3aed", color:"white", border:"1px solid #7c3aed" },
    tableWrap:   { background:"white", borderRadius:"16px", border:"1px solid #ede9fe", overflow:"auto", boxShadow:"0 2px 8px rgba(124,58,237,.04)" },
    table:       { width:"100%", borderCollapse:"collapse", minWidth:"1000px" },
    th:          { background:"#faf5ff", padding:"14px 16px", textAlign:"left", fontSize:"11px", fontWeight:700, color:"#7c3aed", textTransform:"uppercase", letterSpacing:"0.5px", borderBottom:"2px solid #ede9fe", whiteSpace:"nowrap" },
    tr:          { borderBottom:"1px solid #faf5ff" },
    tdRef:       { padding:"14px 16px", fontSize:"12px", fontFamily:"monospace", fontWeight:700, color:"#7c3aed" },
    td:          { padding:"14px 16px", fontSize:"13px", color:"#1e293b", verticalAlign:"middle" },
    emptyCell:   { padding:"40px", textAlign:"center", color:"#a78bfa", fontSize:"13px" },
    pill:        { padding:"4px 10px", borderRadius:"6px", fontSize:"11px", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.5px" }
};

export default PAAppointmentPage;

