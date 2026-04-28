import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaBell, FaCheck, FaTimes, FaRedo,
    FaClock, FaUserTie, FaMapMarkerAlt, FaExternalLinkAlt,
    FaChevronUp, FaGripVertical, FaMinus
} from "react-icons/fa";

const API_URL = "http://localhost:8080/api/appointments";

const PRIORITY_META = {
    HIGH:   { color: "#dc2626", bg: "#fee2e2", label: "High" },
    MEDIUM: { color: "#d97706", bg: "#fef3c7", label: "Medium" },
    LOW:    { color: "#16a34a", bg: "#dcfce7", label: "Low" },
};

const STATUS_COLOR = {
    APPROVED:    "#15803d",
    REJECTED:    "#dc2626",
    RESCHEDULED: "#0369a1",
    AVAILABLE:   "#7c3aed",
    PENDING:     "#b45309",
};

const STATUS_BG = {
    APPROVED:    "#dcfce7",
    REJECTED:    "#fee2e2",
    RESCHEDULED: "#e0f2fe",
    AVAILABLE:   "#f3e8ff",
    PENDING:     "#fef3c7",
};

// ─── Safe initial position — computed once at module load ────────────────────
function getDefaultPos() {
    return {
        x: window.innerWidth  - 380,
        y: window.innerHeight - 80,
    };
}

// ═════════════════════════════════════════════════════════════════════════════
export default function NotificationWidget() {
    const navigate = useNavigate();

    // ── Core state ────────────────────────────────────────────────────────────
    const [appointments,   setAppointments]   = useState([]);
    const [notifications,  setNotifications]  = useState([]);
    const [open,           setOpen]           = useState(false);
    const [minimized,      setMinimized]      = useState(false);
    const [activeTab,      setActiveTab]      = useState("pending");

    // Inline action state
    const [actionModal,  setActionModal]  = useState(null); // { apt, action }
    const [reschedDate,  setReschedDate]  = useState("");
    const [reschedTime,  setReschedTime]  = useState("");
    const [comment,      setComment]      = useState("");
    const [toast,        setToast]        = useState(null);

    // Drag state
    const [pos,      setPos]     = useState(getDefaultPos);
    const dragging               = useRef(false);
    const dragOffset             = useRef({ x: 0, y: 0 });
    const prevApts               = useRef([]);

    // ── Polling ───────────────────────────────────────────────────────────────
    const loadData = useCallback(async () => {
        try {
            const res  = await fetch(`${API_URL}/all`);
            if (!res.ok) return;
            const data = await res.json();
            const safe = Array.isArray(data) ? data : [];
            const prev = prevApts.current;
            const newNotifs = [];

            safe.forEach(apt => {
                const old = prev.find(p => p.id === apt.id);

                // Brand-new PENDING request
                if (!old && apt.status === "PENDING") {
                    newNotifs.push({
                        id:    Date.now() + apt.id,
                        aptId: apt.id,
                        msg:   `New request: "${apt.title}"${apt.personName ? ` — ${apt.personName}` : ""}`,
                        time:  new Date().toLocaleTimeString(),
                        type:  "PENDING",
                        read:  false,
                    });
                }

                // Status changed externally
                if (old && old.status !== apt.status && apt.status !== "PENDING") {
                    newNotifs.push({
                        id:    Date.now() + apt.id + 1,
                        aptId: apt.id,
                        msg:   `#${apt.id} "${apt.title}" → ${apt.status}`,
                        time:  new Date().toLocaleTimeString(),
                        type:  apt.status,
                        read:  false,
                    });
                }
            });

            if (newNotifs.length) {
                setNotifications(p => [...newNotifs, ...p].slice(0, 30));
                // Auto-open panel on new pending
                if (newNotifs.some(n => n.type === "PENDING")) {
                    setOpen(true);
                    setMinimized(false);
                }
            }

            prevApts.current = safe;
            setAppointments(safe);
        } catch (_) { /* silent — network blips should not crash the widget */ }
    }, []);

    useEffect(() => {
        loadData();
        const iv = setInterval(loadData, 8000);
        return () => clearInterval(iv);
    }, [loadData]);

    // ── Toast ─────────────────────────────────────────────────────────────────
    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    // ── Inline actions ────────────────────────────────────────────────────────
    const openAction = (apt, action) => {
        setActionModal({ apt, action });
        setReschedDate("");
        setReschedTime("");
        setComment("");
    };

    const applyAction = async () => {
        if (!actionModal) return;
        const { apt, action } = actionModal;
        let startTime = apt.startTime;

        if (action === "RESCHEDULED") {
            if (!reschedDate || !reschedTime) {
                showToast("Pick a new date and time", "error");
                return;
            }
            startTime = `${reschedDate}T${reschedTime}:00`;
        }

        try {
            const res = await fetch(`${API_URL}/${apt.id}/status`, {
                method:  "PUT",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ status: action, bossComment: comment, startTime }),
            });
            if (res.ok) {
                showToast(`${action.charAt(0) + action.slice(1).toLowerCase()} ✓`);
                setActionModal(null);
                loadData();
            } else {
                showToast("Server error", "error");
            }
        } catch (_) {
            showToast("Action failed", "error");
        }
    };

    // ── Helpers ───────────────────────────────────────────────────────────────
    const markAllRead = () => setNotifications(p => p.map(n => ({ ...n, read: true })));
    const clearAll    = () => setNotifications([]);

    const unread   = notifications.filter(n => !n.read).length;
    const pending  = appointments.filter(a => a.status === "PENDING");
    const upcoming = appointments
        .filter(a =>
            (a.status === "APPROVED" || a.status === "PENDING") &&
            a.startTime && new Date(a.startTime) > new Date()
        )
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    // ── Drag ──────────────────────────────────────────────────────────────────
    const onMouseDown = (e) => {
        if (e.button !== 0) return;
        dragging.current   = true;
        dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
        e.preventDefault();
    };

    useEffect(() => {
        const onMove = (e) => {
            if (!dragging.current) return;
            setPos({
                x: Math.max(0, Math.min(e.clientX - dragOffset.current.x, window.innerWidth  - 360)),
                y: Math.max(0, Math.min(e.clientY - dragOffset.current.y, window.innerHeight - 60)),
            });
        };
        const onUp = () => { dragging.current = false; };
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup",   onUp);
        return () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup",   onUp);
        };
    }, []);

    const openUpward = pos.y > window.innerHeight / 2;

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <>
            {/* ── GLOBAL TOAST ── */}
            {toast && (
                <div style={{
                    ...W.toast,
                    background: toast.type === "error" ? "#dc2626" : "#0a1128",
                }}>
                    {toast.type === "error" ? <FaTimes size={11}/> : <FaCheck size={11}/>}
                    &nbsp;{toast.msg}
                </div>
            )}

            {/* ── INLINE ACTION MODAL ── */}
            {actionModal && (
                <div style={W.overlay} onClick={() => setActionModal(null)}>
                    <div style={W.modal} onClick={e => e.stopPropagation()}>

                        {/* Modal header */}
                        <div style={W.modalHdr}>
                            <span style={{ fontWeight: 700, fontSize: 14, color: "#0a1128" }}>
                                {actionModal.action === "APPROVED"    && "✅ Approve"}
                                {actionModal.action === "REJECTED"    && "❌ Reject"}
                                {actionModal.action === "RESCHEDULED" && "🔄 Reschedule"}
                                &nbsp;— #{actionModal.apt.id}
                            </span>
                            <button style={W.iconBtn} onClick={() => setActionModal(null)}>
                                <FaTimes size={13}/>
                            </button>
                        </div>

                        {/* Modal body */}
                        <div style={W.modalBody}>
                            {/* Appointment info */}
                            <div style={W.aptInfoBox}>
                                <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>
                                    {actionModal.apt.title}
                                </div>
                                {actionModal.apt.personName && (
                                    <div style={W.metaRow}>
                                        <FaUserTie size={9}/> {actionModal.apt.personName}
                                    </div>
                                )}
                                <div style={W.metaRow}>
                                    <FaClock size={9}/>
                                    {actionModal.apt.startTime
                                        ? new Date(actionModal.apt.startTime).toLocaleString()
                                        : "—"}
                                    {actionModal.apt.location && (
                                        <><FaMapMarkerAlt size={9}/> {actionModal.apt.location}</>
                                    )}
                                </div>
                            </div>

                            {/* Action chip selector */}
                            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                                {["APPROVED", "REJECTED", "RESCHEDULED"].map(a => (
                                    <button key={a}
                                        onClick={() => setActionModal(m => ({ ...m, action: a }))}
                                        style={{
                                            ...W.chipBtn,
                                            background: actionModal.action === a ? STATUS_BG[a]    : "#f1f5f9",
                                            color:      actionModal.action === a ? STATUS_COLOR[a] : "#64748b",
                                            border:     actionModal.action === a
                                                ? `1.5px solid ${STATUS_COLOR[a]}`
                                                : "1.5px solid transparent",
                                        }}>
                                        {a === "APPROVED"    && <FaCheck size={9}/>}
                                        {a === "REJECTED"    && <FaTimes size={9}/>}
                                        {a === "RESCHEDULED" && <FaRedo  size={9}/>}
                                        {a}
                                    </button>
                                ))}
                            </div>

                            {/* Reschedule date + time */}
                            {actionModal.action === "RESCHEDULED" && (
                                <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={W.lbl}>New Date</label>
                                        <input type="date" style={W.inp}
                                            value={reschedDate}
                                            onChange={e => setReschedDate(e.target.value)}/>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={W.lbl}>New Time</label>
                                        <input type="time" style={W.inp}
                                            value={reschedTime}
                                            onChange={e => setReschedTime(e.target.value)}/>
                                    </div>
                                </div>
                            )}

                            {/* Comment */}
                            <div style={{ marginBottom: 14 }}>
                                <label style={W.lbl}>Note (optional)</label>
                                <textarea
                                    style={{ ...W.inp, height: 60, resize: "none" }}
                                    placeholder="Add a note for the PA…"
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                />
                            </div>

                            {/* Confirm / Cancel */}
                            <div style={{ display: "flex", gap: 8 }}>
                                <button style={W.confirmBtn} onClick={applyAction}>Confirm</button>
                                <button style={W.cancelBtn}  onClick={() => setActionModal(null)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ══ FLOATING WIDGET ══════════════════════════════════════════════ */}
            <div style={{
                position:   "fixed",
                left:       pos.x,
                top:        pos.y,
                zIndex:     99999,
                userSelect: "none",
                fontFamily: "'DM Sans','Segoe UI',sans-serif",
            }}>

                {/* ── EXPANDED PANEL ── */}
                {open && !minimized && (
                    <div style={{
                        ...W.panel,
                        bottom: openUpward ? 68 : "auto",
                        top:    openUpward ? "auto" : 68,
                    }}>

                        {/* Panel header */}
                        <div style={W.panelHdr}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <FaBell size={13} style={{ color: "#38bdf8" }}/>
                                <span style={{ fontWeight: 800, fontSize: 13, color: "#0a1128" }}>
                                    Notifications
                                </span>
                                {unread > 0 && <span style={W.badge}>{unread}</span>}
                            </div>
                            <div style={{ display: "flex", gap: 6 }}>
                                <button style={W.hdrBtn} onClick={markAllRead}>✓ All</button>
                                <button style={W.hdrBtn} onClick={clearAll}>Clear</button>
                                <button
                                    style={{ ...W.hdrBtn, color: "#38bdf8", borderColor: "#bae6fd" }}
                                    onClick={() => { navigate("/boss-appointments"); setOpen(false); }}>
                                    <FaExternalLinkAlt size={9}/> Open
                                </button>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div style={W.tabs}>
                            {[
                                { key: "pending",  label: "Pending",  count: pending.length },
                                { key: "upcoming", label: "Upcoming", count: 0 },
                                { key: "feed",     label: "Feed",     count: unread },
                            ].map(tab => (
                                <button key={tab.key}
                                    style={{ ...W.tab, ...(activeTab === tab.key ? W.tabActive : {}) }}
                                    onClick={() => setActiveTab(tab.key)}>
                                    {tab.label}
                                    {tab.count > 0 && (
                                        <span style={{ ...W.badge, marginLeft: 5, fontSize: 10 }}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Scrollable content */}
                        <div style={W.scrollArea}>

                            {/* ── PENDING TAB ── */}
                            {activeTab === "pending" && (
                                pending.length === 0 ? (
                                    <EmptyState icon="🎉" text="No pending requests" />
                                ) : pending.map(apt => {
                                    const pc = PRIORITY_META[apt.priority] || PRIORITY_META.MEDIUM;
                                    return (
                                        <div key={apt.id} style={W.aptCard}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 3 }}>
                                                        <span style={{ fontWeight: 700, fontSize: 13, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 170 }}>
                                                            {apt.title}
                                                        </span>
                                                        <span style={{ ...W.pill, background: pc.bg, color: pc.color }}>
                                                            {pc.label}
                                                        </span>
                                                    </div>
                                                    {apt.personName && (
                                                        <div style={W.aptMeta}>
                                                            <FaUserTie size={9}/> {apt.personName}
                                                        </div>
                                                    )}
                                                    <div style={W.aptMeta}>
                                                        <FaClock size={9}/>
                                                        {apt.startTime
                                                            ? new Date(apt.startTime).toLocaleString("en-IN", {
                                                                day: "2-digit", month: "short",
                                                                hour: "2-digit", minute: "2-digit",
                                                            })
                                                            : "—"}
                                                        {apt.duration && <span>· {apt.duration}m</span>}
                                                    </div>
                                                    {apt.location && (
                                                        <div style={W.aptMeta}>
                                                            <FaMapMarkerAlt size={9}/> {apt.location}
                                                        </div>
                                                    )}
                                                    {apt.reason && (
                                                        <div style={{ fontSize: 11, color: "#64748b", marginTop: 3, fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                            "{apt.reason}"
                                                        </div>
                                                    )}
                                                </div>
                                                <span style={{ fontSize: 10, fontFamily: "monospace", color: "#94a3b8", marginLeft: 6, flexShrink: 0 }}>
                                                    #{apt.id}
                                                </span>
                                            </div>
                                            {/* Quick action buttons */}
                                            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                                                <button style={W.approveBtn} onClick={() => openAction(apt, "APPROVED")}>
                                                    <FaCheck size={9}/> Approve
                                                </button>
                                                <button style={W.rejectBtn}  onClick={() => openAction(apt, "REJECTED")}>
                                                    <FaTimes size={9}/> Reject
                                                </button>
                                                <button style={W.reschedBtn} onClick={() => openAction(apt, "RESCHEDULED")}>
                                                    <FaRedo size={9}/> Resched
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}

                            {/* ── UPCOMING TAB ── */}
                            {activeTab === "upcoming" && (
                                upcoming.length === 0 ? (
                                    <EmptyState icon="📭" text="No upcoming appointments" />
                                ) : upcoming.slice(0, 8).map(apt => (
                                    <div key={apt.id} style={W.aptCard}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ marginBottom: 4 }}>
                                                    <span style={{ ...W.pill, background: STATUS_BG[apt.status], color: STATUS_COLOR[apt.status] }}>
                                                        {apt.status}
                                                    </span>
                                                </div>
                                                <div style={{ fontWeight: 600, fontSize: 13, color: "#0f172a", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {apt.title}
                                                </div>
                                                {apt.personName && (
                                                    <div style={W.aptMeta}><FaUserTie size={9}/> {apt.personName}</div>
                                                )}
                                                <div style={W.aptMeta}>
                                                    <FaClock size={9}/>
                                                    {new Date(apt.startTime).toLocaleString("en-IN", {
                                                        day: "2-digit", month: "short", year: "numeric",
                                                        hour: "2-digit", minute: "2-digit",
                                                    })}
                                                </div>
                                                {apt.location && (
                                                    <div style={W.aptMeta}><FaMapMarkerAlt size={9}/> {apt.location}</div>
                                                )}
                                            </div>
                                            <button
                                                style={{ ...W.hdrBtn, marginTop: 2, flexShrink: 0 }}
                                                onClick={() => { navigate("/boss-appointments"); setOpen(false); }}
                                                title="Open Dashboard">
                                                <FaExternalLinkAlt size={9}/>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}

                            {/* ── FEED TAB ── */}
                            {activeTab === "feed" && (
                                notifications.length === 0 ? (
                                    <EmptyState icon="🔔" text="No notifications yet" />
                                ) : notifications.map(n => (
                                    <div key={n.id} style={{ ...W.feedItem, opacity: n.read ? 0.55 : 1 }}>
                                        <div style={{
                                            width: 8, height: 8, borderRadius: "50%", flexShrink: 0, marginTop: 4,
                                            background: STATUS_COLOR[n.type] || "#94a3b8",
                                        }}/>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 12, color: "#1e293b", fontWeight: n.read ? 400 : 600, lineHeight: 1.45 }}>
                                                {n.msg}
                                            </div>
                                            <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{n.time}</div>
                                        </div>
                                        {!n.read && (
                                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#38bdf8", flexShrink: 0, marginTop: 5 }}/>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Panel footer */}
                        <div style={W.panelFooter}>
                            <span style={{ fontSize: 11, color: "#94a3b8" }}>
                                {appointments.length} total · auto-refresh 8s
                            </span>
                            <button
                                style={{ ...W.hdrBtn, color: "#38bdf8", borderColor: "#bae6fd", fontSize: 11 }}
                                onClick={() => { navigate("/boss-appointments"); setOpen(false); }}>
                                Full Dashboard <FaExternalLinkAlt size={9}/>
                            </button>
                        </div>
                    </div>
                )}

                {/* ── BELL + DRAG HANDLE ROW ── */}
                <div style={W.bellRow} onMouseDown={onMouseDown}>

                    {/* Grip handle */}
                    <div style={W.grip} title="Drag to reposition">
                        <FaGripVertical size={11} style={{ color: "#94a3b8" }}/>
                    </div>

                    {/* Minimize / expand toggle (only when open) */}
                    {open && (
                        <button
                            style={W.minBtn}
                            title={minimized ? "Expand" : "Minimise"}
                            onClick={e => { e.stopPropagation(); setMinimized(m => !m); }}>
                            {minimized ? <FaChevronUp size={9}/> : <FaMinus size={9}/>}
                        </button>
                    )}

                    {/* Bell button */}
                    <button
                        style={{
                            ...W.bell,
                            background:  open ? "#0a1128" : "#ffffff",
                            boxShadow:   `0 4px 20px rgba(0,0,0,${open ? ".32" : ".14"})`,
                        }}
                        onClick={e => {
                            e.stopPropagation();
                            if (!open) { markAllRead(); setMinimized(false); }
                            setOpen(o => !o);
                        }}>
                        <FaBell size={20} style={{ color: open ? "#38bdf8" : "#0a1128" }}/>

                        {/* Unread count badge */}
                        {unread > 0 && !open && (
                            <span style={W.bellBadge}>{unread > 9 ? "9+" : unread}</span>
                        )}

                        {/* Pulsing amber dot when there are pending items */}
                        {pending.length > 0 && !open && (
                            <span style={W.pendingDot}/>
                        )}
                    </button>

                    {/* Minimised label pill */}
                    {minimized && open && (
                        <div style={W.miniPill}>
                            {pending.length > 0
                                ? <span style={{ color: "#d97706", fontWeight: 700 }}>{pending.length} pending</span>
                                : <span style={{ color: "#64748b" }}>Notifications</span>}
                        </div>
                    )}
                </div>
            </div>

            {/* Keyframe animations */}
            <style>{`
                @keyframes wPulse {
                    0%, 100% { transform: scale(1);    opacity: 1; }
                    50%      { transform: scale(1.25); opacity: .75; }
                }
                @keyframes wFadeIn {
                    from { opacity: 0; transform: translateY(8px) scale(.97); }
                    to   { opacity: 1; transform: translateY(0)   scale(1);   }
                }
            `}</style>
        </>
    );
}

// ── Small helper component ────────────────────────────────────────────────────
function EmptyState({ icon, text }) {
    return (
        <div style={{
            textAlign: "center", padding: "30px 16px",
            color: "#94a3b8", fontSize: 12,
            display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
        }}>
            <span style={{ fontSize: 26 }}>{icon}</span>
            <span>{text}</span>
        </div>
    );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const W = {
    // Toast
    toast: {
        position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)",
        zIndex: 999999, color: "white", padding: "10px 20px", borderRadius: 10,
        fontWeight: 700, fontSize: 13,
        display: "flex", alignItems: "center", gap: 8,
        boxShadow: "0 8px 24px rgba(0,0,0,.22)",
        fontFamily: "'DM Sans','Segoe UI',sans-serif",
        whiteSpace: "nowrap",
    },

    // Bell row (drag handle)
    bellRow: {
        display: "flex", alignItems: "center", gap: 6,
        cursor: "grab",
    },
    grip: {
        padding: "4px 2px",
        display: "flex", alignItems: "center",
        cursor: "grab",
    },
    bell: {
        width: 52, height: 52, borderRadius: "50%",
        border: "1.5px solid #e2e8f0",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", transition: "background .18s, box-shadow .18s",
        position: "relative", flexShrink: 0,
    },
    bellBadge: {
        position: "absolute", top: -3, right: -3,
        background: "#ef4444", color: "white",
        borderRadius: 99, minWidth: 18, height: 18,
        fontSize: 10, fontWeight: 800,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "0 4px", border: "2px solid white",
    },
    pendingDot: {
        position: "absolute", bottom: 2, right: 2,
        width: 10, height: 10, borderRadius: "50%",
        background: "#f59e0b", border: "2px solid white",
        animation: "wPulse 2s infinite",
    },
    minBtn: {
        width: 24, height: 24, borderRadius: "50%",
        background: "#f1f5f9", border: "1px solid #e2e8f0",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", color: "#64748b", flexShrink: 0,
    },
    miniPill: {
        background: "white", border: "1px solid #e2e8f0",
        borderRadius: 20, padding: "5px 13px",
        fontSize: 12, boxShadow: "0 2px 8px rgba(0,0,0,.09)",
        whiteSpace: "nowrap",
    },

    // Panel
    panel: {
        position: "absolute", right: 0,
        width: 360,
        background: "white",
        border: "1px solid #e2e8f0",
        borderRadius: 16,
        boxShadow: "0 16px 50px rgba(0,0,0,.16)",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
        maxHeight: 560,
        animation: "wFadeIn .18s ease",
    },
    panelHdr: {
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "12px 14px",
        borderBottom: "1px solid #f1f5f9",
        background: "#f8fafc",
        flexShrink: 0,
    },
    tabs: {
        display: "flex",
        borderBottom: "1px solid #f1f5f9",
        background: "#fff",
        flexShrink: 0,
    },
    tab: {
        flex: 1, padding: "9px 4px", fontSize: 11, fontWeight: 600,
        color: "#94a3b8", background: "none", border: "none",
        cursor: "pointer", borderBottom: "2px solid transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 4, transition: "color .15s, border-color .15s",
    },
    tabActive: {
        color: "#0a1128",
        borderBottom: "2px solid #38bdf8",
    },
    scrollArea: {
        flex: 1, overflowY: "auto",
        padding: "8px",
        display: "flex", flexDirection: "column", gap: 6,
    },
    panelFooter: {
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "8px 14px",
        borderTop: "1px solid #f1f5f9",
        background: "#f8fafc",
        flexShrink: 0,
    },

    // Appointment card
    aptCard: {
        background: "#fff",
        border: "1px solid #f1f5f9",
        borderLeft: "3px solid #38bdf8",
        borderRadius: 10,
        padding: "10px 12px",
        flexShrink: 0,
    },
    aptMeta: {
        fontSize: 11, color: "#94a3b8", marginTop: 2,
        display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap",
    },

    // Feed item
    feedItem: {
        display: "flex", gap: 10, alignItems: "flex-start",
        padding: "8px 6px",
        borderBottom: "1px solid #f8fafc",
    },

    // Pills & badges
    pill: {
        padding: "2px 8px", borderRadius: 20,
        fontSize: 9, fontWeight: 800, textTransform: "uppercase",
        display: "inline-block",
    },
    badge: {
        background: "#ef4444", color: "white",
        borderRadius: 99, minWidth: 16, height: 16,
        fontSize: 10, fontWeight: 800,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        padding: "0 4px",
    },

    // Header buttons (small)
    hdrBtn: {
        background: "#f8fafc", border: "1px solid #e2e8f0",
        borderRadius: 7, padding: "4px 9px",
        fontSize: 11, fontWeight: 600, color: "#64748b",
        cursor: "pointer",
        display: "flex", alignItems: "center", gap: 4,
        fontFamily: "'DM Sans','Segoe UI',sans-serif",
    },

    // Quick-action buttons on pending cards
    approveBtn: {
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
        background: "#dcfce7", color: "#15803d", border: "1px solid #86efac",
        padding: "6px 0", borderRadius: 7, fontWeight: 700, fontSize: 11,
        cursor: "pointer", fontFamily: "'DM Sans','Segoe UI',sans-serif",
    },
    rejectBtn: {
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
        background: "#fee2e2", color: "#dc2626", border: "1px solid #fca5a5",
        padding: "6px 0", borderRadius: 7, fontWeight: 700, fontSize: 11,
        cursor: "pointer", fontFamily: "'DM Sans','Segoe UI',sans-serif",
    },
    reschedBtn: {
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
        background: "#e0f2fe", color: "#0369a1", border: "1px solid #7dd3fc",
        padding: "6px 0", borderRadius: 7, fontWeight: 700, fontSize: 11,
        cursor: "pointer", fontFamily: "'DM Sans','Segoe UI',sans-serif",
    },

    // Action modal
    overlay: {
        position: "fixed", inset: 0,
        background: "rgba(10,17,40,.52)",
        zIndex: 999998,
        display: "flex", alignItems: "center", justifyContent: "center",
        backdropFilter: "blur(3px)",
    },
    modal: {
        background: "white", borderRadius: 16,
        width: 420, maxWidth: "94vw",
        boxShadow: "0 24px 60px rgba(0,0,0,.24)",
        overflow: "hidden",
        fontFamily: "'DM Sans','Segoe UI',sans-serif",
    },
    modalHdr: {
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "14px 18px",
        borderBottom: "1px solid #f1f5f9",
        background: "#f8fafc",
    },
    modalBody: {
        padding: "16px 18px",
    },
    iconBtn: {
        background: "none", border: "none",
        cursor: "pointer", color: "#94a3b8", padding: 4,
    },
    aptInfoBox: {
        background: "#f0f9ff", border: "1px solid #bae6fd",
        borderRadius: 8, padding: "10px 14px", marginBottom: 14,
    },
    metaRow: {
        fontSize: 11, color: "#64748b", marginTop: 3,
        display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap",
    },
    chipBtn: {
        flex: 1, padding: "8px 4px", borderRadius: 8,
        fontSize: 11, fontWeight: 700, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
        fontFamily: "'DM Sans','Segoe UI',sans-serif",
    },
    confirmBtn: {
        flex: 1, background: "#0a1128", color: "#38bdf8",
        border: "1px solid #38bdf8", padding: "10px 16px",
        borderRadius: 9, fontWeight: 700, fontSize: 13,
        cursor: "pointer", fontFamily: "'DM Sans','Segoe UI',sans-serif",
    },
    cancelBtn: {
        background: "#f1f5f9", color: "#64748b",
        border: "1px solid #e2e8f0", padding: "10px 16px",
        borderRadius: 9, fontWeight: 600, fontSize: 13,
        cursor: "pointer", fontFamily: "'DM Sans','Segoe UI',sans-serif",
    },
    lbl: {
        display: "block", fontSize: 10, fontWeight: 800,
        color: "#64748b", textTransform: "uppercase",
        letterSpacing: ".05em", marginBottom: 4,
    },
    inp: {
        width: "100%", padding: "8px 11px",
        border: "1px solid #e2e8f0", borderRadius: 8,
        fontSize: 13, fontFamily: "'DM Sans','Segoe UI',sans-serif",
        background: "#f8fafc", boxSizing: "border-box",
        color: "#1e293b",
    },
};

//import React, { useState, useEffect, useCallback, useRef } from "react";
//import { useNavigate } from "react-router-dom";
//import {
//    FaBell, FaCheck, FaTimes, FaRedo,
//    FaClock, FaUserTie, FaMapMarkerAlt, FaExternalLinkAlt,
//    FaChevronUp, FaGripVertical, FaMinus
//} from "react-icons/fa";
//
//const API_URL = "http://localhost:8080/api/appointments";
//
//const PRIORITY_META = {
//    HIGH:   { color: "#dc2626", bg: "#fee2e2", label: "High" },
//    MEDIUM: { color: "#d97706", bg: "#fef3c7", label: "Medium" },
//    LOW:    { color: "#16a34a", bg: "#dcfce7", label: "Low" },
//};
//
//const STATUS_COLOR = {
//    APPROVED:    "#15803d",
//    REJECTED:    "#dc2626",
//    RESCHEDULED: "#0369a1",
//    AVAILABLE:   "#7c3aed",
//    PENDING:     "#b45309",
//};
//const STATUS_BG = {
//    APPROVED:    "#dcfce7",
//    REJECTED:    "#fee2e2",
//    RESCHEDULED: "#e0f2fe",
//    AVAILABLE:   "#f3e8ff",
//    PENDING:     "#fef3c7",
//};
//
//// ─── Detect Electron ──────────────────────────────────────────────────────────
//const isElectron = typeof window !== 'undefined' && window.electronAPI?.isElectron;
//
//// ═════════════════════════════════════════════════════════════════════════════
//export default function NotificationWidget() {
//    const navigate = useNavigate();
//
//    // ── Core state ────────────────────────────────────────────────────────────
//    const [appointments,  setAppointments]  = useState([]);
//    const [notifications, setNotifications] = useState([]);
//    const [open,          setOpen]          = useState(false);
//    const [minimized,     setMinimized]     = useState(false);
//    const [activeTab,     setActiveTab]     = useState("pending");
//
//    // Inline action state
//    const [actionModal, setActionModal] = useState(null);
//    const [reschedDate, setReschedDate] = useState("");
//    const [reschedTime, setReschedTime] = useState("");
//    const [comment,     setComment]     = useState("");
//    const [toast,       setToast]       = useState(null);
//
//    // ── Drag — in Electron we move the OS window; in browser we use CSS pos ──
//    // pos is only used in browser mode (fallback)
//    const [pos,      setPos]     = useState({ x: window.innerWidth - 420, y: window.innerHeight - 90 });
//    const dragging               = useRef(false);
//    const dragStart              = useRef({ mouseX: 0, mouseY: 0, winX: 0, winY: 0 });
//    const prevApts               = useRef([]);
//
//    // ── Polling ───────────────────────────────────────────────────────────────
//    const loadData = useCallback(async () => {
//        try {
//            const res  = await fetch(`${API_URL}/all`);
//            if (!res.ok) return;
//            const data = await res.json();
//            const safe = Array.isArray(data) ? data : [];
//            const prev = prevApts.current;
//            const newNotifs = [];
//
//            safe.forEach(apt => {
//                const old = prev.find(p => p.id === apt.id);
//                if (!old && apt.status === "PENDING") {
//                    newNotifs.push({
//                        id:    Date.now() + apt.id,
//                        aptId: apt.id,
//                        msg:   `New request: "${apt.title}"${apt.personName ? ` — ${apt.personName}` : ""}`,
//                        time:  new Date().toLocaleTimeString(),
//                        type:  "PENDING",
//                        read:  false,
//                    });
//                }
//                if (old && old.status !== apt.status && apt.status !== "PENDING") {
//                    newNotifs.push({
//                        id:    Date.now() + apt.id + 1,
//                        aptId: apt.id,
//                        msg:   `#${apt.id} "${apt.title}" → ${apt.status}`,
//                        time:  new Date().toLocaleTimeString(),
//                        type:  apt.status,
//                        read:  false,
//                    });
//                }
//            });
//
//            if (newNotifs.length) {
//                setNotifications(p => [...newNotifs, ...p].slice(0, 30));
//                if (newNotifs.some(n => n.type === "PENDING")) {
//                    setOpen(true);
//                    setMinimized(false);
//                }
//            }
//
//            prevApts.current = safe;
//            setAppointments(safe);
//        } catch (_) { /* silent */ }
//    }, []);
//
//    useEffect(() => {
//        loadData();
//        const iv = setInterval(loadData, 8000);
//        return () => clearInterval(iv);
//    }, [loadData]);
//
//    // ── Toast ─────────────────────────────────────────────────────────────────
//    const showToast = (msg, type = "success") => {
//        setToast({ msg, type });
//        setTimeout(() => setToast(null), 3000);
//    };
//
//    // ── Inline actions ────────────────────────────────────────────────────────
//    const openAction = (apt, action) => {
//        setActionModal({ apt, action });
//        setReschedDate(""); setReschedTime(""); setComment("");
//    };
//
//    const applyAction = async () => {
//        if (!actionModal) return;
//        const { apt, action } = actionModal;
//        let startTime = apt.startTime;
//        if (action === "RESCHEDULED") {
//            if (!reschedDate || !reschedTime) { showToast("Pick a new date and time", "error"); return; }
//            startTime = `${reschedDate}T${reschedTime}:00`;
//        }
//        try {
//            const res = await fetch(`${API_URL}/${apt.id}/status`, {
//                method:  "PUT",
//                headers: { "Content-Type": "application/json" },
//                body:    JSON.stringify({ status: action, bossComment: comment, startTime }),
//            });
//            if (res.ok) {
//                showToast(`${action.charAt(0) + action.slice(1).toLowerCase()} ✓`);
//                setActionModal(null);
//                loadData();
//            } else showToast("Server error", "error");
//        } catch (_) { showToast("Action failed", "error"); }
//    };
//
//    // ── Helpers ───────────────────────────────────────────────────────────────
//    const markAllRead = () => setNotifications(p => p.map(n => ({ ...n, read: true })));
//    const clearAll    = () => setNotifications([]);
//
//    const unread   = notifications.filter(n => !n.read).length;
//    const pending  = appointments.filter(a => a.status === "PENDING");
//    const upcoming = appointments
//        .filter(a => (a.status === "APPROVED" || a.status === "PENDING") && a.startTime && new Date(a.startTime) > new Date())
//        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
//
//    // ── Navigate — in Electron, open in browser; in web app, use router ───────
//    const openDashboard = () => {
//        if (isElectron) {
//            window.electronAPI.openExternal('http://localhost:3000/boss-appointments');
//        } else {
//            navigate('/boss-appointments');
//        }
//        setOpen(false);
//    };
//
//    // ── Drag implementation ───────────────────────────────────────────────────
//    // In Electron: we move the actual OS window via IPC
//    // In browser:  we move a CSS `position:fixed` element
//    const onMouseDown = async (e) => {
//        if (e.button !== 0) return;
//        e.preventDefault();
//        dragging.current = true;
//
//        if (isElectron) {
//            const [winX, winY] = await window.electronAPI.getWindowPosition();
//            dragStart.current = { mouseX: e.screenX, mouseY: e.screenY, winX, winY };
//        } else {
//            dragStart.current = { mouseX: e.clientX, mouseY: e.clientY, winX: pos.x, winY: pos.y };
//        }
//    };
//
//    useEffect(() => {
//        const onMove = (e) => {
//            if (!dragging.current) return;
//            if (isElectron) {
//                const dx = e.screenX - dragStart.current.mouseX;
//                const dy = e.screenY - dragStart.current.mouseY;
//                window.electronAPI.moveWindow(
//                    dragStart.current.winX + dx,
//                    dragStart.current.winY + dy
//                );
//            } else {
//                setPos({
//                    x: Math.max(0, Math.min(e.clientX - dragStart.current.mouseX + dragStart.current.winX, window.innerWidth  - 360)),
//                    y: Math.max(0, Math.min(e.clientY - dragStart.current.mouseY + dragStart.current.winY, window.innerHeight - 60)),
//                });
//            }
//        };
//        const onUp = () => { dragging.current = false; };
//        window.addEventListener("mousemove", onMove);
//        window.addEventListener("mouseup",   onUp);
//        return () => {
//            window.removeEventListener("mousemove", onMove);
//            window.removeEventListener("mouseup",   onUp);
//        };
//    }, [pos]);
//
//    // In Electron: widget is always bottom-right of the OS window, not CSS-positioned
//    // In browser: use CSS fixed position
//    const widgetStyle = isElectron
//        ? {
//            position:   "fixed",
//            right:      12,
//            bottom:     12,
//            zIndex:     99999,
//            userSelect: "none",
//            fontFamily: "'DM Sans','Segoe UI',sans-serif",
//          }
//        : {
//            position:   "fixed",
//            left:       pos.x,
//            top:        pos.y,
//            zIndex:     99999,
//            userSelect: "none",
//            fontFamily: "'DM Sans','Segoe UI',sans-serif",
//          };
//
//    const openUpward = true; // In Electron widget, panel always opens upward
//
//    // ─────────────────────────────────────────────────────────────────────────
//    return (
//        <>
//            {/* ── GLOBAL TOAST ── */}
//            {toast && (
//                <div style={{ ...W.toast, background: toast.type === "error" ? "#dc2626" : "#0a1128" }}>
//                    {toast.type === "error" ? <FaTimes size={11}/> : <FaCheck size={11}/>}
//                    &nbsp;{toast.msg}
//                </div>
//            )}
//
//            {/* ── INLINE ACTION MODAL ── */}
//            {actionModal && (
//                <div style={W.overlay} onClick={() => setActionModal(null)}>
//                    <div style={W.modal} onClick={e => e.stopPropagation()}>
//                        <div style={W.modalHdr}>
//                            <span style={{ fontWeight: 700, fontSize: 14, color: "#0a1128" }}>
//                                {actionModal.action === "APPROVED"    && "✅ Approve"}
//                                {actionModal.action === "REJECTED"    && "❌ Reject"}
//                                {actionModal.action === "RESCHEDULED" && "🔄 Reschedule"}
//                                &nbsp;— #{actionModal.apt.id}
//                            </span>
//                            <button style={W.iconBtn} onClick={() => setActionModal(null)}><FaTimes size={13}/></button>
//                        </div>
//                        <div style={W.modalBody}>
//                            <div style={W.aptInfoBox}>
//                                <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{actionModal.apt.title}</div>
//                                {actionModal.apt.personName && (
//                                    <div style={W.metaRow}><FaUserTie size={9}/> {actionModal.apt.personName}</div>
//                                )}
//                                <div style={W.metaRow}>
//                                    <FaClock size={9}/>
//                                    {actionModal.apt.startTime ? new Date(actionModal.apt.startTime).toLocaleString() : "—"}
//                                    {actionModal.apt.location && <><FaMapMarkerAlt size={9}/> {actionModal.apt.location}</>}
//                                </div>
//                            </div>
//                            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
//                                {["APPROVED","REJECTED","RESCHEDULED"].map(a => (
//                                    <button key={a}
//                                        onClick={() => setActionModal(m => ({ ...m, action: a }))}
//                                        style={{
//                                            ...W.chipBtn,
//                                            background: actionModal.action === a ? STATUS_BG[a]    : "#f1f5f9",
//                                            color:      actionModal.action === a ? STATUS_COLOR[a] : "#64748b",
//                                            border:     actionModal.action === a ? `1.5px solid ${STATUS_COLOR[a]}` : "1.5px solid transparent",
//                                        }}>
//                                        {a === "APPROVED" && <FaCheck size={9}/>}
//                                        {a === "REJECTED" && <FaTimes size={9}/>}
//                                        {a === "RESCHEDULED" && <FaRedo size={9}/>}
//                                        {a}
//                                    </button>
//                                ))}
//                            </div>
//                            {actionModal.action === "RESCHEDULED" && (
//                                <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
//                                    <div style={{ flex: 1 }}>
//                                        <label style={W.lbl}>New Date</label>
//                                        <input type="date" style={W.inp} value={reschedDate} onChange={e => setReschedDate(e.target.value)}/>
//                                    </div>
//                                    <div style={{ flex: 1 }}>
//                                        <label style={W.lbl}>New Time</label>
//                                        <input type="time" style={W.inp} value={reschedTime} onChange={e => setReschedTime(e.target.value)}/>
//                                    </div>
//                                </div>
//                            )}
//                            <div style={{ marginBottom: 14 }}>
//                                <label style={W.lbl}>Note (optional)</label>
//                                <textarea style={{ ...W.inp, height: 60, resize: "none" }}
//                                    placeholder="Add a note for the PA…"
//                                    value={comment} onChange={e => setComment(e.target.value)}/>
//                            </div>
//                            <div style={{ display: "flex", gap: 8 }}>
//                                <button style={W.confirmBtn} onClick={applyAction}>Confirm</button>
//                                <button style={W.cancelBtn}  onClick={() => setActionModal(null)}>Cancel</button>
//                            </div>
//                        </div>
//                    </div>
//                </div>
//            )}
//
//            {/* ══ FLOATING WIDGET ══════════════════════════════════════════════ */}
//            <div style={widgetStyle}>
//
//                {/* ── EXPANDED PANEL (opens upward) ── */}
//                {open && !minimized && (
//                    <div style={{ ...W.panel, bottom: 68, top: "auto" }}>
//                        {/* Panel header */}
//                        <div style={W.panelHdr}>
//                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//                                <FaBell size={13} style={{ color: "#38bdf8" }}/>
//                                <span style={{ fontWeight: 800, fontSize: 13, color: "#0a1128" }}>Notifications</span>
//                                {unread > 0 && <span style={W.badge}>{unread}</span>}
//                            </div>
//                            <div style={{ display: "flex", gap: 6 }}>
//                                <button style={W.hdrBtn} onClick={markAllRead}>✓ All</button>
//                                <button style={W.hdrBtn} onClick={clearAll}>Clear</button>
//                                <button style={{ ...W.hdrBtn, color: "#38bdf8", borderColor: "#bae6fd" }} onClick={openDashboard}>
//                                    <FaExternalLinkAlt size={9}/> Open
//                                </button>
//                            </div>
//                        </div>
//
//                        {/* Tabs */}
//                        <div style={W.tabs}>
//                            {[
//                                { key: "pending",  label: "Pending",  count: pending.length },
//                                { key: "upcoming", label: "Upcoming", count: 0 },
//                                { key: "feed",     label: "Feed",     count: unread },
//                            ].map(tab => (
//                                <button key={tab.key}
//                                    style={{ ...W.tab, ...(activeTab === tab.key ? W.tabActive : {}) }}
//                                    onClick={() => setActiveTab(tab.key)}>
//                                    {tab.label}
//                                    {tab.count > 0 && <span style={{ ...W.badge, marginLeft: 5, fontSize: 10 }}>{tab.count}</span>}
//                                </button>
//                            ))}
//                        </div>
//
//                        {/* Scrollable content */}
//                        <div style={W.scrollArea}>
//                            {/* ── PENDING TAB ── */}
//                            {activeTab === "pending" && (
//                                pending.length === 0 ? <EmptyState icon="🎉" text="No pending requests" />
//                                : pending.map(apt => {
//                                    const pc = PRIORITY_META[apt.priority] || PRIORITY_META.MEDIUM;
//                                    return (
//                                        <div key={apt.id} style={W.aptCard}>
//                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
//                                                <div style={{ flex: 1, minWidth: 0 }}>
//                                                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 3 }}>
//                                                        <span style={{ fontWeight: 700, fontSize: 13, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 170 }}>
//                                                            {apt.title}
//                                                        </span>
//                                                        <span style={{ ...W.pill, background: pc.bg, color: pc.color }}>{pc.label}</span>
//                                                    </div>
//                                                    {apt.personName && <div style={W.aptMeta}><FaUserTie size={9}/> {apt.personName}</div>}
//                                                    <div style={W.aptMeta}>
//                                                        <FaClock size={9}/>
//                                                        {apt.startTime ? new Date(apt.startTime).toLocaleString("en-IN", { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" }) : "—"}
//                                                        {apt.duration && <span>· {apt.duration}m</span>}
//                                                    </div>
//                                                    {apt.location && <div style={W.aptMeta}><FaMapMarkerAlt size={9}/> {apt.location}</div>}
//                                                    {apt.reason && (
//                                                        <div style={{ fontSize: 11, color: "#64748b", marginTop: 3, fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
//                                                            "{apt.reason}"
//                                                        </div>
//                                                    )}
//                                                </div>
//                                                <span style={{ fontSize: 10, fontFamily: "monospace", color: "#94a3b8", marginLeft: 6, flexShrink: 0 }}>#{apt.id}</span>
//                                            </div>
//                                            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
//                                                <button style={W.approveBtn} onClick={() => openAction(apt, "APPROVED")}><FaCheck size={9}/> Approve</button>
//                                                <button style={W.rejectBtn}  onClick={() => openAction(apt, "REJECTED")}><FaTimes size={9}/> Reject</button>
//                                                <button style={W.reschedBtn} onClick={() => openAction(apt, "RESCHEDULED")}><FaRedo size={9}/> Resched</button>
//                                            </div>
//                                        </div>
//                                    );
//                                })
//                            )}
//
//                            {/* ── UPCOMING TAB ── */}
//                            {activeTab === "upcoming" && (
//                                upcoming.length === 0 ? <EmptyState icon="📭" text="No upcoming appointments" />
//                                : upcoming.slice(0, 8).map(apt => (
//                                    <div key={apt.id} style={W.aptCard}>
//                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
//                                            <div style={{ flex: 1, minWidth: 0 }}>
//                                                <div style={{ marginBottom: 4 }}>
//                                                    <span style={{ ...W.pill, background: STATUS_BG[apt.status], color: STATUS_COLOR[apt.status] }}>{apt.status}</span>
//                                                </div>
//                                                <div style={{ fontWeight: 600, fontSize: 13, color: "#0f172a", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{apt.title}</div>
//                                                {apt.personName && <div style={W.aptMeta}><FaUserTie size={9}/> {apt.personName}</div>}
//                                                <div style={W.aptMeta}>
//                                                    <FaClock size={9}/>
//                                                    {new Date(apt.startTime).toLocaleString("en-IN", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" })}
//                                                </div>
//                                                {apt.location && <div style={W.aptMeta}><FaMapMarkerAlt size={9}/> {apt.location}</div>}
//                                            </div>
//                                            <button style={{ ...W.hdrBtn, marginTop: 2, flexShrink: 0 }} onClick={openDashboard} title="Open Dashboard">
//                                                <FaExternalLinkAlt size={9}/>
//                                            </button>
//                                        </div>
//                                    </div>
//                                ))
//                            )}
//
//                            {/* ── FEED TAB ── */}
//                            {activeTab === "feed" && (
//                                notifications.length === 0 ? <EmptyState icon="🔔" text="No notifications yet" />
//                                : notifications.map(n => (
//                                    <div key={n.id} style={{ ...W.feedItem, opacity: n.read ? 0.55 : 1 }}>
//                                        <div style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, marginTop: 4, background: STATUS_COLOR[n.type] || "#94a3b8" }}/>
//                                        <div style={{ flex: 1, minWidth: 0 }}>
//                                            <div style={{ fontSize: 12, color: "#1e293b", fontWeight: n.read ? 400 : 600, lineHeight: 1.45 }}>{n.msg}</div>
//                                            <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{n.time}</div>
//                                        </div>
//                                        {!n.read && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#38bdf8", flexShrink: 0, marginTop: 5 }}/>}
//                                    </div>
//                                ))
//                            )}
//                        </div>
//
//                        {/* Panel footer */}
//                        <div style={W.panelFooter}>
//                            <span style={{ fontSize: 11, color: "#94a3b8" }}>{appointments.length} total · auto-refresh 8s</span>
//                            <button style={{ ...W.hdrBtn, color: "#38bdf8", borderColor: "#bae6fd", fontSize: 11 }} onClick={openDashboard}>
//                                Full Dashboard <FaExternalLinkAlt size={9}/>
//                            </button>
//                        </div>
//                    </div>
//                )}
//
//                {/* ── BELL + DRAG HANDLE ROW ── */}
//                <div style={W.bellRow} onMouseDown={onMouseDown}>
//                    <div style={W.grip} title="Drag to reposition">
//                        <FaGripVertical size={11} style={{ color: "#94a3b8" }}/>
//                    </div>
//                    {open && (
//                        <button style={W.minBtn} title={minimized ? "Expand" : "Minimise"}
//                            onClick={e => { e.stopPropagation(); setMinimized(m => !m); }}>
//                            {minimized ? <FaChevronUp size={9}/> : <FaMinus size={9}/>}
//                        </button>
//                    )}
//                    <button
//                        style={{ ...W.bell, background: open ? "#0a1128" : "#ffffff", boxShadow: `0 4px 20px rgba(0,0,0,${open ? ".32" : ".14"})` }}
//                        onClick={e => {
//                            e.stopPropagation();
//                            if (!open) { markAllRead(); setMinimized(false); }
//                            setOpen(o => !o);
//                        }}>
//                        <FaBell size={20} style={{ color: open ? "#38bdf8" : "#0a1128" }}/>
//                        {unread > 0 && !open && <span style={W.bellBadge}>{unread > 9 ? "9+" : unread}</span>}
//                        {pending.length > 0 && !open && <span style={W.pendingDot}/>}
//                    </button>
//                    {minimized && open && (
//                        <div style={W.miniPill}>
//                            {pending.length > 0
//                                ? <span style={{ color: "#d97706", fontWeight: 700 }}>{pending.length} pending</span>
//                                : <span style={{ color: "#64748b" }}>Notifications</span>}
//                        </div>
//                    )}
//                </div>
//            </div>
//
//            <style>{`
//                @keyframes wPulse {
//                    0%, 100% { transform: scale(1);    opacity: 1; }
//                    50%      { transform: scale(1.25); opacity: .75; }
//                }
//                @keyframes wFadeIn {
//                    from { opacity: 0; transform: translateY(8px) scale(.97); }
//                    to   { opacity: 1; transform: translateY(0)   scale(1);   }
//                }
//            `}</style>
//        </>
//    );
//}
//
//function EmptyState({ icon, text }) {
//    return (
//        <div style={{ textAlign:"center", padding:"30px 16px", color:"#94a3b8", fontSize:12, display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
//            <span style={{ fontSize: 26 }}>{icon}</span>
//            <span>{text}</span>
//        </div>
//    );
//}
//
//// ── Styles (identical to your original) ──────────────────────────────────────
//const W = {
//    toast: { position:"fixed", top:16, left:"50%", transform:"translateX(-50%)", zIndex:999999, color:"white", padding:"10px 20px", borderRadius:10, fontWeight:700, fontSize:13, display:"flex", alignItems:"center", gap:8, boxShadow:"0 8px 24px rgba(0,0,0,.22)", fontFamily:"'DM Sans','Segoe UI',sans-serif", whiteSpace:"nowrap" },
//    bellRow: { display:"flex", alignItems:"center", gap:6, cursor:"grab" },
//    grip: { padding:"4px 2px", display:"flex", alignItems:"center", cursor:"grab" },
//    bell: { width:52, height:52, borderRadius:"50%", border:"1.5px solid #e2e8f0", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", transition:"background .18s, box-shadow .18s", position:"relative", flexShrink:0 },
//    bellBadge: { position:"absolute", top:-3, right:-3, background:"#ef4444", color:"white", borderRadius:99, minWidth:18, height:18, fontSize:10, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 4px", border:"2px solid white" },
//    pendingDot: { position:"absolute", bottom:2, right:2, width:10, height:10, borderRadius:"50%", background:"#f59e0b", border:"2px solid white", animation:"wPulse 2s infinite" },
//    minBtn: { width:24, height:24, borderRadius:"50%", background:"#f1f5f9", border:"1px solid #e2e8f0", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#64748b", flexShrink:0 },
//    miniPill: { background:"white", border:"1px solid #e2e8f0", borderRadius:20, padding:"5px 13px", fontSize:12, boxShadow:"0 2px 8px rgba(0,0,0,.09)", whiteSpace:"nowrap" },
//    panel: { position:"absolute", right:0, width:360, background:"white", border:"1px solid #e2e8f0", borderRadius:16, boxShadow:"0 16px 50px rgba(0,0,0,.16)", display:"flex", flexDirection:"column", overflow:"hidden", maxHeight:520, animation:"wFadeIn .18s ease" },
//    panelHdr: { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 14px", borderBottom:"1px solid #f1f5f9", background:"#f8fafc", flexShrink:0 },
//    tabs: { display:"flex", borderBottom:"1px solid #f1f5f9", background:"#fff", flexShrink:0 },
//    tab: { flex:1, padding:"9px 4px", fontSize:11, fontWeight:600, color:"#94a3b8", background:"none", border:"none", cursor:"pointer", borderBottom:"2px solid transparent", display:"flex", alignItems:"center", justifyContent:"center", gap:4, transition:"color .15s, border-color .15s" },
//    tabActive: { color:"#0a1128", borderBottom:"2px solid #38bdf8" },
//    scrollArea: { flex:1, overflowY:"auto", padding:"8px", display:"flex", flexDirection:"column", gap:6 },
//    panelFooter: { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 14px", borderTop:"1px solid #f1f5f9", background:"#f8fafc", flexShrink:0 },
//    aptCard: { background:"#fff", border:"1px solid #f1f5f9", borderLeft:"3px solid #38bdf8", borderRadius:10, padding:"10px 12px", flexShrink:0 },
//    aptMeta: { fontSize:11, color:"#94a3b8", marginTop:2, display:"flex", alignItems:"center", gap:4, flexWrap:"wrap" },
//    feedItem: { display:"flex", gap:10, alignItems:"flex-start", padding:"8px 6px", borderBottom:"1px solid #f8fafc" },
//    pill: { padding:"2px 8px", borderRadius:20, fontSize:9, fontWeight:800, textTransform:"uppercase", display:"inline-block" },
//    badge: { background:"#ef4444", color:"white", borderRadius:99, minWidth:16, height:16, fontSize:10, fontWeight:800, display:"inline-flex", alignItems:"center", justifyContent:"center", padding:"0 4px" },
//    hdrBtn: { background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:7, padding:"4px 9px", fontSize:11, fontWeight:600, color:"#64748b", cursor:"pointer", display:"flex", alignItems:"center", gap:4, fontFamily:"'DM Sans','Segoe UI',sans-serif" },
//    approveBtn: { flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:4, background:"#dcfce7", color:"#15803d", border:"1px solid #86efac", padding:"6px 0", borderRadius:7, fontWeight:700, fontSize:11, cursor:"pointer", fontFamily:"'DM Sans','Segoe UI',sans-serif" },
//    rejectBtn:  { flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:4, background:"#fee2e2", color:"#dc2626", border:"1px solid #fca5a5", padding:"6px 0", borderRadius:7, fontWeight:700, fontSize:11, cursor:"pointer", fontFamily:"'DM Sans','Segoe UI',sans-serif" },
//    reschedBtn: { flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:4, background:"#e0f2fe", color:"#0369a1", border:"1px solid #7dd3fc", padding:"6px 0", borderRadius:7, fontWeight:700, fontSize:11, cursor:"pointer", fontFamily:"'DM Sans','Segoe UI',sans-serif" },
//    overlay: { position:"fixed", inset:0, background:"rgba(10,17,40,.52)", zIndex:999998, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(3px)" },
//    modal: { background:"white", borderRadius:16, width:420, maxWidth:"94vw", boxShadow:"0 24px 60px rgba(0,0,0,.24)", overflow:"hidden", fontFamily:"'DM Sans','Segoe UI',sans-serif" },
//    modalHdr: { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 18px", borderBottom:"1px solid #f1f5f9", background:"#f8fafc" },
//    modalBody: { padding:"16px 18px" },
//    iconBtn: { background:"none", border:"none", cursor:"pointer", color:"#94a3b8", padding:4 },
//    aptInfoBox: { background:"#f0f9ff", border:"1px solid #bae6fd", borderRadius:8, padding:"10px 14px", marginBottom:14 },
//    metaRow: { fontSize:11, color:"#64748b", marginTop:3, display:"flex", alignItems:"center", gap:5, flexWrap:"wrap" },
//    chipBtn: { flex:1, padding:"8px 4px", borderRadius:8, fontSize:11, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:5, fontFamily:"'DM Sans','Segoe UI',sans-serif" },
//    confirmBtn: { flex:1, background:"#0a1128", color:"#38bdf8", border:"1px solid #38bdf8", padding:"10px 16px", borderRadius:9, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"'DM Sans','Segoe UI',sans-serif" },
//    cancelBtn:  { background:"#f1f5f9", color:"#64748b", border:"1px solid #e2e8f0", padding:"10px 16px", borderRadius:9, fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"'DM Sans','Segoe UI',sans-serif" },
//    lbl: { display:"block", fontSize:10, fontWeight:800, color:"#64748b", textTransform:"uppercase", letterSpacing:".05em", marginBottom:4 },
//    inp: { width:"100%", padding:"8px 11px", border:"1px solid #e2e8f0", borderRadius:8, fontSize:13, fontFamily:"'DM Sans','Segoe UI',sans-serif", background:"#f8fafc", boxSizing:"border-box", color:"#1e293b" },
//};
