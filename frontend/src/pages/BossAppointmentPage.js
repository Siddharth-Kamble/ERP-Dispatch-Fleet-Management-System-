
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaCheck, FaTimes, FaCalendarPlus, FaBell, FaClock, FaHistory,
    FaSignOutAlt, FaCalendarAlt, FaCheckCircle, FaHourglassHalf,
    FaCalendarCheck, FaDownload, FaEdit, FaSync, FaSearch,
    FaExclamationCircle, FaRedo, FaFileAlt, FaTachometerAlt,
    FaMapMarkerAlt, FaUserTie, FaFlag, FaLayerGroup
} from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
const API_URL = "http://localhost:8080/api/appointments";

const PRIORITY_CONFIG = {
    HIGH:   { color:"#dc2626", bg:"#fee2e2", label:"High" },
    MEDIUM: { color:"#d97706", bg:"#fef3c7", label:"Medium" },
    LOW:    { color:"#16a34a", bg:"#dcfce7", label:"Low" },
};

function BossAppointmentPage() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const [appointments, setAppointments] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [showNotif, setShowNotif] = useState(false);
    const [slot, setSlot] = useState({ title:"Executive Meeting", date:"", time:"" });
    const [filter, setFilter] = useState("ALL");
    const [search, setSearch] = useState("");
    const [toast, setToast] = useState(null);
    const [editModal, setEditModal] = useState(null);
    const [rescheduleData, setRescheduleData] = useState({ date:"", time:"" });
    const [showSlotForm, setShowSlotForm] = useState(false);
    const [pdfRange, setPdfRange] = useState({ from:"", to:"" });
    const [showPdfPanel, setShowPdfPanel] = useState(false);
    const [activeSection, setActiveSection] = useState("overview");
    const prevRef = useRef([]);

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const loadData = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/all`);
            if (!res.ok) throw new Error();
            const data = await res.json();
const safe = Array.isArray(data) ? data : [];

safe.sort((a, b) => {
    return Number(b.id || 0) - Number(a.id || 0);
});            const prev = prevRef.current;
            const newNotifs = [];
            safe.forEach(apt => {
                const old = prev.find(p => p.id === apt.id);
                if (!old && apt.status === "PENDING") {
                    newNotifs.push({
                        id: Date.now() + apt.id,
                        msg: `New request: "${apt.title}"${apt.personName ? ` (${apt.personName})` : ""}${apt.priority ? ` — ${apt.priority} priority` : ""}`,
                        time: new Date().toLocaleTimeString(), type: "PENDING"
                    });
                }
            });
            if (newNotifs.length) setNotifications(p => [...newNotifs, ...p].slice(0, 20));
            prevRef.current = safe;
            setAppointments(safe);
        } catch { setAppointments([]); }
    }, []);

    useEffect(() => {
        loadData();
        const iv = setInterval(loadData, 8000);
        return () => clearInterval(iv);
    }, [loadData]);

    const postSlot = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/post-slot`, {
                method:"POST", headers:{"Content-Type":"application/json"},
                body: JSON.stringify({ title:slot.title, startTime:`${slot.date}T${slot.time}:00`, boss:{ id:user.id } })
            });
            if (res.ok) {
                showToast("Open slot dispatched to PA!");
                setSlot({ title:"Executive Meeting", date:"", time:"" });
                setShowSlotForm(false); loadData();
            }
        } catch { showToast("Failed to post slot","error"); }
    };

    const openEditModal = (apt, defaultAction = "APPROVED") => {
        setEditModal({ apt, action:defaultAction });
        setRescheduleData({ date:"", time:"" });
    };

    const applyAction = async () => {
        if (!editModal) return;
        const { apt, action } = editModal;
        let startTime = apt.startTime;
        if (action === "RESCHEDULED") {
            if (!rescheduleData.date || !rescheduleData.time) {
                showToast("Please pick a new date and time","error"); return;
            }
            startTime = `${rescheduleData.date}T${rescheduleData.time}:00`;
        }
        try {
            const res = await fetch(`${API_URL}/${apt.id}/status`, {
                method:"PUT", headers:{"Content-Type":"application/json"},
                body: JSON.stringify({ status:action, bossComment:editModal.comment||"", startTime })
            });
            if (res.ok) {
                showToast(`Appointment ${action.toLowerCase()} successfully!`);
                setEditModal(null); loadData();
            }
        } catch { showToast("Action failed","error"); }
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
        const doc = new jsPDF({ orientation:"landscape" });
        doc.setFontSize(20); doc.setTextColor(14,17,40);
        doc.text("OneDeo Leela — Boss Schedule Report", 14, 22);
        doc.setFontSize(10); doc.setTextColor(100,100,120);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
        if (from || to) doc.text(`Period: ${pdfRange.from||"All"} → ${pdfRange.to||"Now"}`, 14, 36);
        autoTable(doc, {
            startY: 44,
            head: [["Ref","Purpose","Person","Priority","Date & Time","Duration","Location","Reason","Status","Boss Note"]],
            body: filtered.map(a => [
                `#${a.id}`, a.title||"-", a.personName||"-", a.priority||"-",
                a.startTime ? new Date(a.startTime).toLocaleString() : "-",
                a.duration ? `${a.duration} min` : "-", a.location||"-",
                a.reason||"-", a.status||"-", a.bossComment||"-"
            ]),
            styles:{ fontSize:8, cellPadding:3 },
            headStyles:{ fillColor:[14,17,40], textColor:255, fontStyle:"bold" },
            alternateRowStyles:{ fillColor:[240,245,255] }
        });
        doc.save(`Boss_Schedule_${Date.now()}.pdf`);
        showToast("PDF downloaded!"); setShowPdfPanel(false);
    };

    const unread = notifications.filter(n => !n.read).length;
    const markAllRead = () => setNotifications(p => p.map(n => ({...n, read:true})));

    const statusColor = s => ({APPROVED:"#15803d",REJECTED:"#dc2626",RESCHEDULED:"#0369a1",AVAILABLE:"#7c3aed"}[s]||"#b45309");
    const statusBg    = s => ({APPROVED:"#dcfce7",REJECTED:"#fee2e2",RESCHEDULED:"#e0f2fe",AVAILABLE:"#f3e8ff"}[s]||"#fef3c7");

    const stats = {
        total:      appointments.length,
        pending:    appointments.filter(a => a.status==="PENDING").length,
        approved:   appointments.filter(a => a.status==="APPROVED").length,
        available:  appointments.filter(a => a.status==="AVAILABLE").length,
        rescheduled:appointments.filter(a => a.status==="RESCHEDULED").length
    };

    const upcoming = appointments.filter(a =>
        (a.status==="APPROVED"||a.status==="PENDING") && a.startTime && new Date(a.startTime)>new Date()
    ).sort((a,b)=>new Date(a.startTime)-new Date(b.startTime));

    const filteredList = appointments.filter(a => {
        const mf = filter==="ALL" || a.status===filter;
        const ms = !search
            || (a.title||"").toLowerCase().includes(search.toLowerCase())
            || (a.personName||"").toLowerCase().includes(search.toLowerCase());
        return mf && ms;
    });

    return (
        <div style={s.root}>
            {/* TOAST */}
            {toast && (
                <div style={{...s.toast, background:toast.type==="error"?"#dc2626":"#0a1128"}}>
                    {toast.type==="error" ? <FaTimes/> : <FaCheck/>} {toast.msg}
                </div>
            )}

            {/* EDIT / ACTION MODAL */}
            {editModal && (
                <div style={s.modalOverlay} onClick={() => setEditModal(null)}>
                    <div style={s.modal} onClick={e => e.stopPropagation()}>
                        <div style={s.modalTitle}><FaEdit style={{color:"#38bdf8"}}/> Update Appointment #{editModal.apt.id}</div>
                        <div style={s.modalInfo}>
                            <strong>{editModal.apt.title}</strong>
                            {editModal.apt.personName && <span style={{color:"#64748b",marginLeft:"8px"}}>· {editModal.apt.personName}</span>}
                            {editModal.apt.priority && (() => {
                                const pc = PRIORITY_CONFIG[editModal.apt.priority]||PRIORITY_CONFIG.MEDIUM;
                                return <span style={{...s.pill, background:pc.bg, color:pc.color, marginLeft:"8px"}}>{pc.label}</span>;
                            })()}
                            <br/>
                            <span style={{fontSize:"12px",color:"#64748b"}}>
                                {editModal.apt.startTime ? new Date(editModal.apt.startTime).toLocaleString() : ""}
                                {editModal.apt.location ? ` · ${editModal.apt.location}` : ""}
                            </span>
                        </div>
                        <div style={s.actionRow}>
                            {["APPROVED","REJECTED","RESCHEDULED"].map(action => (
                                <button key={action} style={{
                                    ...s.actionChip,
                                    background: editModal.action===action ? statusBg(action) : "#f1f5f9",
                                    color: editModal.action===action ? statusColor(action) : "#64748b",
                                    border: editModal.action===action ? `2px solid ${statusColor(action)}` : "2px solid transparent"
                                }} onClick={() => setEditModal({...editModal, action})}>
                                    {action==="APPROVED" && <FaCheck/>}
                                    {action==="REJECTED" && <FaTimes/>}
                                    {action==="RESCHEDULED" && <FaRedo/>}
                                    {action}
                                </button>
                            ))}
                        </div>
                        {editModal.action==="RESCHEDULED" && (
                            <div style={{display:"flex",gap:"12px",marginBottom:"16px"}}>
                                <div style={s.fg}>
                                    <label style={s.label}>New Date</label>
                                    <input type="date" style={s.input} value={rescheduleData.date}
                                        onChange={e => setRescheduleData({...rescheduleData,date:e.target.value})}/>
                                </div>
                                <div style={s.fg}>
                                    <label style={s.label}>New Time</label>
                                    <input type="time" style={s.input} value={rescheduleData.time}
                                        onChange={e => setRescheduleData({...rescheduleData,time:e.target.value})}/>
                                </div>
                            </div>
                        )}
                        <div style={s.fg}>
                            <label style={s.label}>Note / Comment (optional)</label>
                            <textarea style={{...s.input,height:"70px",resize:"vertical"}}
                                placeholder="Add a note for the PA…"
                                value={editModal.comment||""}
                                onChange={e => setEditModal({...editModal,comment:e.target.value})}/>
                        </div>
                        <div style={{display:"flex",gap:"12px",marginTop:"16px"}}>
                            <button style={s.confirmBtn} onClick={applyAction}>Confirm Action</button>
                            <button style={s.cancelBtn} onClick={() => setEditModal(null)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── SIDEBAR ── no stats block ── */}
            <aside style={s.sidebar}>
                <div style={s.sideTop}>
                    <div style={s.logoBox}><span style={s.logoTxt}>OD</span></div>
                    <div>
                        <div style={s.brandName}>OneDeo Leela</div>
                        <div style={s.brandRole}>Boss Console</div>
                    </div>
                </div>

                <nav style={s.nav}>
                    {[
                        { id:"overview",  icon:<FaTachometerAlt/>, label:"Overview" },
                        { id:"upcoming",  icon:<FaCalendarAlt/>,   label:"Upcoming",       count:upcoming.length },
                        { id:"pending",   icon:<FaHourglassHalf/>, label:"Pending Actions", count:stats.pending },
                        { id:"log",       icon:<FaHistory/>,       label:"Full Log" },
                    ].map(item => (
                        <div key={item.id}
                            style={{...s.navItem,...(activeSection===item.id?s.navActive:{})}}
                            onClick={() => setActiveSection(item.id)}>
                            <span style={s.navIcon}>{item.icon}</span>
                            <span>{item.label}</span>
                            {item.count>0 && <span style={s.navBadge}>{item.count}</span>}
                        </div>
                    ))}
                    <div style={{...s.navItem,marginTop:"8px"}} onClick={() => setShowSlotForm(!showSlotForm)}>
                        <span style={s.navIcon}><FaCalendarPlus/></span><span>Post Open Slot</span>
                    </div>
                    <div style={s.navItem} onClick={() => setShowPdfPanel(!showPdfPanel)}>
                        <span style={s.navIcon}><FaDownload/></span><span>Download Report</span>
                    </div>
                </nav>

           <button style={s.logoutBtn} onClick={async () => {

               // ✅ Step 1 — Tell Spring Boot to delete boss_session.txt
               try {
                   await fetch(`${process.env.REACT_APP_API_URL}/api/auth/logout`, {
                       method:  "POST",
                       headers: { "Content-Type": "application/json" },
                       body:    JSON.stringify({ role: user.role }),
                   });
                   console.log("✅ Logout API called");
               } catch (_) {
                   console.log("⚠️ Logout API failed — continuing anyway");
               }

               // ✅ Step 2 — Clear localStorage completely
               localStorage.removeItem("user");
               localStorage.clear();

               // ✅ Step 3 — Navigate to login
               navigate("/");
           }}>
               <FaSignOutAlt /> Logout
           </button>
            </aside>

            {/* ── MAIN ── */}
            <main style={s.main}>
                <header style={s.topbar}>
                    <div style={s.searchWrap}>
                        <FaSearch style={s.searchIcon}/>
                        <input placeholder="Search by title or person…" value={search}
                            onChange={e => setSearch(e.target.value)} style={s.searchInput}/>
                    </div>
                    <div style={s.topRight}>
                        <button style={s.iconBtn} onClick={loadData}><FaSync/></button>
                        <div style={{position:"relative"}}>
                            <button style={s.bellBtn} onClick={() => { setShowNotif(!showNotif); markAllRead(); }}>
                                <FaBell/>
                                {unread>0 && <span style={s.badge}>{unread}</span>}
                            </button>
                            {showNotif && (
                                <div style={s.notifPanel}>
                                    <div style={s.notifHead}>Notifications</div>
                                    {notifications.length===0
                                        ? <div style={s.notifEmpty}>No notifications yet</div>
                                        : notifications.map(n => (
                                            <div key={n.id} style={s.notifItem}>
                                                <div style={{...s.notifDot, background:statusColor(n.type)}}/>
                                                <div>
                                                    <div style={s.notifMsg}>{n.msg}</div>
                                                    <div style={s.notifTime}>{n.time}</div>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                            )}
                        </div>
                        <div style={s.userChip}>
                            <div style={s.avatar}>{(user.name||"B")[0].toUpperCase()}</div>
                            <span style={s.uname}>{user.name||"Boss"}</span>
                        </div>
                    </div>
                </header>

                <div style={s.body}>
                    <div style={s.pageHead}>
                        <div>
                            <h1 style={s.h1}>Appointment Dispatch Console</h1>
                            <p style={s.subtext}>Manage PA requests, post availability, and track all schedules</p>
                        </div>
                    </div>

                    {/* KPI CARDS */}
                    <div style={s.kpiGrid}>
                        {[
                            { label:"Total",       val:stats.total,      icon:<FaCalendarCheck/>, color:"#1e40af", bg:"#dbeafe" },
                            { label:"Pending",     val:stats.pending,    icon:<FaHourglassHalf/>, color:"#b45309", bg:"#fef3c7" },
                            { label:"Approved",    val:stats.approved,   icon:<FaCheckCircle/>,   color:"#15803d", bg:"#dcfce7" },
                            { label:"Open Slots",  val:stats.available,  icon:<FaClock/>,         color:"#6d28d9", bg:"#ede9fe" }
                        ].map((k,i) => (
                            <div key={i} style={s.kpiCard}>
                                <div style={{...s.kpiIcon, background:k.bg, color:k.color}}>{k.icon}</div>
                                <div style={{...s.kpiVal, color:k.color}}>{k.val}</div>
                                <div style={s.kpiLabel}>{k.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* POST SLOT FORM */}
                    {showSlotForm && (
                        <div style={s.panel}>
                            <div style={s.panelTitle}><FaCalendarPlus/> Post Open Availability</div>
                            <form onSubmit={postSlot} style={{display:"flex",gap:"16px",flexWrap:"wrap",alignItems:"flex-end"}}>
                                <div style={s.fg}>
                                    <label style={s.label}>Purpose</label>
                                    <input style={s.input} type="text" value={slot.title}
                                        onChange={e => setSlot({...slot, title:e.target.value})}/>
                                </div>
                                <div style={s.fg}>
                                    <label style={s.label}>Date</label>
                                    <input style={s.input} type="date" required
                                        onChange={e => setSlot({...slot, date:e.target.value})}/>
                                </div>
                                <div style={s.fg}>
                                    <label style={s.label}>Time</label>
                                    <input style={s.input} type="time" required
                                        onChange={e => setSlot({...slot, time:e.target.value})}/>
                                </div>
                                <button type="submit" style={s.confirmBtn}>Dispatch Slot</button>
                                <button type="button" style={s.cancelBtn} onClick={() => setShowSlotForm(false)}>Cancel</button>
                            </form>
                        </div>
                    )}

                    {/* PDF PANEL */}
                    {showPdfPanel && (
                        <div style={s.panel}>
                            <div style={s.panelTitle}><FaDownload/> Download Report as PDF</div>
                            <div style={{display:"flex",gap:"16px",flexWrap:"wrap",alignItems:"flex-end"}}>
                                <div style={s.fg}>
                                    <label style={s.label}>From</label>
                                    <input style={s.input} type="date" value={pdfRange.from}
                                        onChange={e => setPdfRange({...pdfRange,from:e.target.value})}/>
                                </div>
                                <div style={s.fg}>
                                    <label style={s.label}>To</label>
                                    <input style={s.input} type="date" value={pdfRange.to}
                                        onChange={e => setPdfRange({...pdfRange,to:e.target.value})}/>
                                </div>
                                <button style={s.confirmBtn} onClick={downloadPDF}><FaDownload/> Download PDF</button>
                                <button style={s.cancelBtn} onClick={() => setShowPdfPanel(false)}>Cancel</button>
                            </div>
                        </div>
                    )}

                    {/* PENDING ACTIONS */}
                    {(activeSection==="overview"||activeSection==="pending") && stats.pending>0 && (
                        <div style={s.panel}>
                            <div style={s.panelTitle}><FaExclamationCircle style={{color:"#f59e0b"}}/> Action Required — Pending Requests</div>
                            <div style={s.feedList}>
                                {appointments.filter(a => a.status==="PENDING").map(apt => {
                                    const pc = PRIORITY_CONFIG[apt.priority]||PRIORITY_CONFIG.MEDIUM;
                                    return (
                                        <div key={apt.id} style={s.feedCard}>
                                            <div style={s.feedLeft}>
                                                <div style={s.feedRef}>#{apt.id}</div>
                                                <div>
                                                    <div style={{display:"flex",alignItems:"center",gap:"8px",flexWrap:"wrap"}}>
                                                        <span style={s.feedTitle}>{apt.title}</span>
                                                        <span style={{...s.pill, background:pc.bg, color:pc.color}}>{pc.label}</span>
                                                    </div>
                                                    {apt.personName && (
                                                        <div style={{fontSize:"12px",color:"#64748b",margin:"2px 0",display:"flex",alignItems:"center",gap:"5px"}}>
                                                            <FaUserTie style={{fontSize:"10px"}}/> {apt.personName}
                                                        </div>
                                                    )}
                                                    {apt.reason && <div style={s.feedReason}>{apt.reason}</div>}
                                                    <div style={s.feedMeta}>
                                                        <span><FaClock style={{fontSize:"10px"}}/> {apt.startTime?new Date(apt.startTime).toLocaleString():"—"}</span>
                                                        {apt.duration && <span>· {apt.duration} min</span>}
                                                        {apt.location && <span><FaMapMarkerAlt style={{fontSize:"10px"}}/> {apt.location}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={s.feedActions}>
                                                <button style={s.approveBtn} onClick={() => openEditModal(apt,"APPROVED")}><FaCheck/> Approve</button>
                                                <button style={s.rejectBtn}  onClick={() => openEditModal(apt,"REJECTED")}><FaTimes/> Reject</button>
                                                <button style={s.reschedBtn} onClick={() => openEditModal(apt,"RESCHEDULED")}><FaRedo/> Reschedule</button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* UPCOMING */}
                    {(activeSection==="overview"||activeSection==="upcoming") && upcoming.length>0 && (
                        <div style={s.panel}>
                            <div style={s.panelTitle}><FaCalendarAlt style={{color:"#38bdf8"}}/> Upcoming Appointments</div>
                            <div style={s.upcomingGrid}>
                                {upcoming.slice(0,6).map(apt => {
                                    const pc = PRIORITY_CONFIG[apt.priority]||PRIORITY_CONFIG.MEDIUM;
                                    return (
                                        <div key={apt.id} style={s.upcomingCard}>
                                            <div style={{display:"flex",justifyContent:"space-between",marginBottom:"8px"}}>
                                                <span style={{...s.pill, background:statusBg(apt.status), color:statusColor(apt.status)}}>{apt.status}</span>
                                                <span style={{...s.pill, background:pc.bg, color:pc.color}}>{pc.label}</span>
                                            </div>
                                            <div style={s.feedTitle}>{apt.title}</div>
                                            {apt.personName && (
                                                <div style={{fontSize:"12px",color:"#64748b",margin:"3px 0",display:"flex",alignItems:"center",gap:"5px"}}>
                                                    <FaUserTie style={{fontSize:"10px"}}/> {apt.personName}
                                                </div>
                                            )}
                                            {apt.reason && <div style={{...s.feedReason,marginBottom:"4px"}}>{apt.reason}</div>}
                                            <div style={s.feedMeta}>
                                                <span>{new Date(apt.startTime).toLocaleString()}</span>
                                                {apt.duration && <span>· {apt.duration} min</span>}
                                            </div>
                                            {apt.location && (
                                                <div style={{fontSize:"11px",color:"#94a3b8",margin:"3px 0",display:"flex",alignItems:"center",gap:"4px"}}>
                                                    <FaMapMarkerAlt style={{fontSize:"9px"}}/> {apt.location}
                                                </div>
                                            )}
                                            <button style={s.editStatusBtn} onClick={() => openEditModal(apt)}>
                                                <FaEdit/> Edit Status
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* FULL LOG TABLE */}
                    {(activeSection==="overview"||activeSection==="log") && (
                        <div style={s.panel}>
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px",flexWrap:"wrap",gap:"12px"}}>
                                <div style={s.panelTitle}><FaHistory/> Master Schedule Log</div>
                                <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
                                    {["ALL","PENDING","APPROVED","REJECTED","RESCHEDULED","AVAILABLE"].map(f => (
                                        <button key={f}
                                            style={{...s.filterBtn,...(filter===f?s.filterBtnActive:{})}}
                                            onClick={() => setFilter(f)}>{f}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div style={{overflowX:"auto"}}>
                                <table style={s.table}>
                                    <thead>
                                        <tr>
                                            {["Ref","Purpose","Person","Priority","Date & Time","Duration","Location","Status","Boss Note","Actions"].map(h => (
                                                <th key={h} style={s.th}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredList.length===0
                                            ? <tr><td colSpan={10} style={s.emptyCell}>No records found</td></tr>
                                            : filteredList.map(apt => {
                                                const pc = PRIORITY_CONFIG[apt.priority]||PRIORITY_CONFIG.MEDIUM;
                                                return (
                                                    <tr key={apt.id} style={s.tr}>
                                                        <td style={s.tdRef}>#{apt.id}</td>
                                                        <td style={s.td}>
                                                            <strong>{apt.title}</strong>
                                                            {apt.reason && <div style={{fontSize:"11px",color:"#94a3b8",marginTop:"2px"}}>{apt.reason}</div>}
                                                        </td>
                                                        <td style={s.td}>
                                                            {apt.personName
                                                                ? <div style={{display:"flex",alignItems:"center",gap:"5px"}}>
                                                                    <FaUserTie style={{color:"#38bdf8",fontSize:"10px"}}/> {apt.personName}
                                                                  </div>
                                                                : "—"}
                                                        </td>
                                                        <td style={s.td}>
                                                            <span style={{...s.pill,background:pc.bg,color:pc.color}}>{pc.label}</span>
                                                        </td>
                                                        <td style={s.td}>
                                                            <div style={{fontWeight:600,fontSize:"13px"}}>{new Date(apt.startTime).toLocaleDateString()}</div>
                                                            <div style={{color:"#64748b",fontSize:"11px"}}>{new Date(apt.startTime).toLocaleTimeString()}</div>
                                                        </td>
                                                        <td style={{...s.td,color:"#64748b",fontSize:"12px"}}>
                                                            {apt.duration ? `${apt.duration} min` : "—"}
                                                        </td>
                                                        <td style={{...s.td,color:"#64748b",fontSize:"12px"}}>
                                                            {apt.location
                                                                ? <><FaMapMarkerAlt style={{fontSize:"9px"}}/> {apt.location}</>
                                                                : "—"}
                                                        </td>
                                                        <td style={s.td}>
                                                            <span style={{...s.pill,background:statusBg(apt.status),color:statusColor(apt.status)}}>{apt.status}</span>
                                                        </td>
                                                        <td style={{...s.td,fontStyle:"italic",color:"#64748b",fontSize:"12px"}}>
                                                            {apt.bossComment || <span style={{color:"#cbd5e1"}}>—</span>}
                                                        </td>
                                                        <td style={s.td}>
                                                            <button style={s.editStatusBtn} onClick={() => openEditModal(apt)}>
                                                                <FaEdit/> Edit
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
                *{box-sizing:border-box;}body{margin:0;font-family:'DM Sans',sans-serif;}
                input:focus,textarea:focus,select:focus{outline:none;border-color:#38bdf8!important;box-shadow:0 0 0 3px rgba(56,189,248,.15);}
                ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:#f1f5f9}::-webkit-scrollbar-thumb{background:#334155;border-radius:3px}
                @keyframes slideIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
            `}</style>
        </div>
    );
}

const s = {
    root:        { display:"flex", height:"100vh", fontFamily:"'DM Sans',sans-serif", background:"#f0f2f5", overflow:"hidden" },
    toast:       { position:"fixed", top:20, right:20, zIndex:9999, color:"white", padding:"12px 24px", borderRadius:"10px", fontWeight:700, fontSize:"14px", display:"flex", alignItems:"center", gap:"10px", boxShadow:"0 8px 24px rgba(0,0,0,.25)", animation:"slideIn .3s ease" },
    modalOverlay:{ position:"fixed", inset:0, background:"rgba(10,17,40,.6)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(4px)" },
    modal:       { background:"white", borderRadius:"18px", padding:"28px", width:"460px", maxWidth:"95vw", boxShadow:"0 24px 60px rgba(0,0,0,.25)", animation:"slideIn .3s ease" },
    modalTitle:  { fontWeight:800, fontSize:"16px", color:"#0a1128", marginBottom:"14px", display:"flex", alignItems:"center", gap:"10px" },
    modalInfo:   { background:"#f0f9ff", border:"1px solid #bae6fd", borderRadius:"8px", padding:"12px 16px", marginBottom:"16px", fontSize:"13px" },
    actionRow:   { display:"flex", gap:"10px", marginBottom:"18px" },
    actionChip:  { flex:1, padding:"10px", borderRadius:"10px", fontWeight:700, fontSize:"12px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"6px", fontFamily:"'DM Sans',sans-serif" },
    confirmBtn:  { background:"#0a1128", color:"#38bdf8", border:"1px solid #38bdf8", padding:"11px 22px", borderRadius:"10px", fontWeight:700, fontSize:"13px", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", gap:"6px" },
    cancelBtn:   { background:"#f1f5f9", color:"#64748b", border:"1px solid #e2e8f0", padding:"11px 20px", borderRadius:"10px", fontWeight:600, fontSize:"13px", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" },
    sidebar:     { width:"268px", background:"#0a1128", color:"white", display:"flex", flexDirection:"column", padding:"24px 16px", flexShrink:0 },
    sideTop:     { display:"flex", alignItems:"center", gap:"12px", marginBottom:"32px" },
    logoBox:     { width:"44px", height:"44px", background:"#38bdf8", borderRadius:"12px", display:"flex", alignItems:"center", justifyContent:"center" },
    logoTxt:     { color:"#0a1128", fontWeight:900, fontSize:"16px" },
    brandName:   { fontWeight:800, fontSize:"15px", color:"#e2e8f0" },
    brandRole:   { fontSize:"11px", color:"#38bdf8" },
    nav:         { flex:1 },
    navItem:     { display:"flex", alignItems:"center", gap:"12px", padding:"11px 14px", borderRadius:"10px", color:"#94a3b8", fontSize:"13px", fontWeight:500, cursor:"pointer", marginBottom:"2px", transition:"all .2s" },
    navActive:   { background:"rgba(56,189,248,.12)", color:"#38bdf8", borderLeft:"3px solid #38bdf8" },
    navIcon:     { fontSize:"13px", width:"18px", textAlign:"center" },
    navBadge:    { marginLeft:"auto", background:"#ef4444", color:"white", borderRadius:"10px", padding:"2px 7px", fontSize:"10px", fontWeight:800 },
    logoutBtn:   { display:"flex", alignItems:"center", gap:"10px", background:"rgba(239,68,68,.1)", color:"#f87171", border:"1px solid rgba(239,68,68,.3)", padding:"10px 16px", borderRadius:"10px", cursor:"pointer", fontSize:"13px", fontWeight:600, marginTop:"16px", fontFamily:"'DM Sans',sans-serif" },
    main:        { flex:1, display:"flex", flexDirection:"column", overflow:"hidden" },
    topbar:      { background:"white", padding:"14px 32px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid #e2e8f0", boxShadow:"0 2px 6px rgba(0,0,0,.04)" },
    searchWrap:  { position:"relative", flex:1, maxWidth:"380px" },
    searchIcon:  { position:"absolute", left:"12px", top:"50%", transform:"translateY(-50%)", color:"#94a3b8", fontSize:"13px" },
    searchInput: { width:"100%", padding:"10px 10px 10px 36px", border:"1px solid #e2e8f0", borderRadius:"10px", background:"#f8fafc", fontSize:"13px", fontFamily:"'DM Sans',sans-serif" },
    topRight:    { display:"flex", alignItems:"center", gap:"12px" },
    iconBtn:     { background:"#f8fafc", border:"1px solid #e2e8f0", color:"#64748b", borderRadius:"8px", padding:"8px 12px", cursor:"pointer", fontSize:"14px" },
    bellBtn:     { position:"relative", background:"#f8fafc", border:"1px solid #e2e8f0", color:"#38bdf8", borderRadius:"8px", padding:"8px 12px", cursor:"pointer", fontSize:"16px" },
    badge:       { position:"absolute", top:"-4px", right:"-4px", background:"#ef4444", color:"white", borderRadius:"50%", width:"16px", height:"16px", fontSize:"10px", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700 },
    notifPanel:  { position:"absolute", right:0, top:"44px", width:"320px", background:"white", border:"1px solid #e2e8f0", borderRadius:"14px", boxShadow:"0 16px 40px rgba(0,0,0,.12)", zIndex:999, animation:"slideIn .2s ease" },
    notifHead:   { padding:"14px 18px", borderBottom:"1px solid #e2e8f0", fontWeight:800, fontSize:"13px", color:"#0a1128" },
    notifEmpty:  { padding:"20px", textAlign:"center", color:"#94a3b8", fontSize:"13px" },
    notifItem:   { padding:"12px 18px", borderBottom:"1px solid #f8fafc", display:"flex", gap:"12px", alignItems:"flex-start" },
    notifDot:    { width:"8px", height:"8px", borderRadius:"50%", marginTop:"5px", flexShrink:0 },
    notifMsg:    { fontSize:"12px", color:"#1e293b", fontWeight:500, lineHeight:1.5 },
    notifTime:   { fontSize:"11px", color:"#94a3b8", marginTop:"2px" },
    userChip:    { display:"flex", alignItems:"center", gap:"10px", background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:"10px", padding:"6px 14px" },
    avatar:      { width:"30px", height:"30px", background:"#38bdf8", borderRadius:"50%", color:"#0a1128", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:"13px" },
    uname:       { fontSize:"13px", fontWeight:700, color:"#0a1128" },
    body:        { flex:1, overflow:"auto", padding:"28px 32px" },
    pageHead:    { display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"24px" },
    h1:          { margin:0, fontSize:"22px", fontWeight:800, color:"#0a1128" },
    subtext:     { margin:"4px 0 0", fontSize:"13px", color:"#64748b" },
    kpiGrid:     { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"16px", marginBottom:"24px" },
    kpiCard:     { background:"white", borderRadius:"14px", padding:"20px", border:"1px solid #e2e8f0", boxShadow:"0 2px 6px rgba(0,0,0,.03)" },
    kpiIcon:     { width:"40px", height:"40px", borderRadius:"10px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px", marginBottom:"10px" },
    kpiVal:      { fontSize:"28px", fontWeight:900, lineHeight:1 },
    kpiLabel:    { fontSize:"12px", color:"#64748b", fontWeight:600, marginTop:"4px" },
    panel:       { background:"white", borderRadius:"14px", border:"1px solid #e2e8f0", padding:"22px 24px", marginBottom:"20px", boxShadow:"0 2px 6px rgba(0,0,0,.03)" },
    panelTitle:  { fontWeight:800, fontSize:"14px", color:"#0a1128", marginBottom:"18px", display:"flex", alignItems:"center", gap:"8px" },
    feedList:    { display:"flex", flexDirection:"column", gap:"12px" },
    feedCard:    { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px", background:"#fffbeb", border:"1px solid #fde68a", borderRadius:"12px", flexWrap:"wrap", gap:"12px" },
    feedLeft:    { display:"flex", gap:"14px", alignItems:"flex-start" },
    feedRef:     { fontSize:"11px", fontFamily:"monospace", fontWeight:800, color:"#94a3b8", marginTop:"2px" },
    feedTitle:   { fontWeight:700, fontSize:"14px", color:"#0f172a" },
    feedReason:  { fontSize:"12px", color:"#64748b", marginTop:"2px" },
    feedMeta:    { fontSize:"11px", color:"#94a3b8", marginTop:"4px", display:"flex", alignItems:"center", gap:"8px", flexWrap:"wrap" },
    feedActions: { display:"flex", gap:"8px", flexWrap:"wrap" },
    approveBtn:  { display:"flex", alignItems:"center", gap:"6px", background:"#dcfce7", color:"#15803d", border:"1px solid #86efac", padding:"8px 14px", borderRadius:"8px", fontWeight:700, fontSize:"12px", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" },
    rejectBtn:   { display:"flex", alignItems:"center", gap:"6px", background:"#fee2e2", color:"#dc2626", border:"1px solid #fca5a5", padding:"8px 14px", borderRadius:"8px", fontWeight:700, fontSize:"12px", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" },
    reschedBtn:  { display:"flex", alignItems:"center", gap:"6px", background:"#e0f2fe", color:"#0369a1", border:"1px solid #7dd3fc", padding:"8px 14px", borderRadius:"8px", fontWeight:700, fontSize:"12px", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" },
   // editStatusBtn:{ display:"flex", alignItems:"center", gap:"6px", background:"#0a1128", color:"#38bdf8", border:"1px solid #38bdf8", padding:"7px 14px", borderRadius:"8px", fontWeight:700, fontSize:"11px", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", marginTop:"8px" },
    editStatusBtn: {
        display:"flex",
        alignItems:"center",
        gap:"6px",
        background:"#f1f5f9",   // ✅ changed from black to light gray
        color:"#0a1128",       // or keep "#38bdf8" if you want blue text
        border:"1px solid #cbd5e1",
        padding:"7px 14px",
        borderRadius:"8px",
        fontWeight:700,
        fontSize:"11px",
        cursor:"pointer",
        fontFamily:"'DM Sans',sans-serif",
        marginTop:"8px"
    },
    upcomingGrid:{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))", gap:"14px" },
    upcomingCard:{ background:"#f0f9ff", border:"1px solid #bae6fd", borderRadius:"12px", padding:"16px" },
    filterBtn:   { background:"#f8fafc", border:"1px solid #e2e8f0", color:"#64748b", padding:"5px 12px", borderRadius:"8px", fontSize:"10px", fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" },
    filterBtnActive:{ background:"#0a1128", color:"#38bdf8", border:"1px solid #38bdf8" },
    table:       { width:"100%", borderCollapse:"collapse", minWidth:"1000px" },
    th:          { background:"#f8fafc", padding:"14px 16px", textAlign:"left", fontSize:"10px", fontWeight:800, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.5px", borderBottom:"2px solid #e2e8f0", whiteSpace:"nowrap" },
    tr:          { borderBottom:"1px solid #f8fafc" },
    tdRef:       { padding:"14px 16px", fontSize:"11px", fontFamily:"monospace", fontWeight:800, color:"#38bdf8" },
    td:          { padding:"14px 16px", fontSize:"13px", color:"#1e293b", verticalAlign:"middle" },
    emptyCell:   { padding:"40px", textAlign:"center", color:"#94a3b8", fontSize:"13px" },
    pill:        { padding:"4px 10px", borderRadius:"6px", fontSize:"10px", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.5px" },
    fg:          { display:"flex", flexDirection:"column", gap:"6px" },
    label:       { fontSize:"10px", fontWeight:800, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.5px" },
    input:       { padding:"10px 13px", border:"1px solid #e2e8f0", borderRadius:"8px", fontSize:"13px", fontFamily:"'DM Sans',sans-serif", background:"#f8fafc" }
};

export default BossAppointmentPage;
