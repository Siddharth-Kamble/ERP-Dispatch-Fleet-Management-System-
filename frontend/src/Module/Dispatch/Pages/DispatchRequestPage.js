import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  FaTruck, FaCalendarAlt, FaClock, FaUser, FaBuilding,
  FaCheck, FaTimes, FaRedo, FaBell, FaFilter, FaSearch,
  FaExclamationTriangle, FaInfoCircle, FaCheckCircle,
  FaSpinner, FaChevronDown, FaChevronUp
} from "react-icons/fa";

const API = process.env.REACT_APP_API_URL || "http://localhost:8080";
const BASE = `${API}/api/vehicle-requests`;

const PRIORITY_META = {
  URGENT:    { label: "URGENT",    bg: "#fee2e2", color: "#dc2626", border: "#fca5a5", dot: "#ef4444" },
  HIGH:      { label: "HIGH",      bg: "#fff7ed", color: "#ea580c", border: "#fdba74", dot: "#f97316" },
  NORMAL:    { label: "NORMAL",    bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe", dot: "#3b82f6" },
  LOW:       { label: "LOW",       bg: "#f8fafc", color: "#64748b", border: "#cbd5e1", dot: "#94a3b8" },
  SCHEDULED: { label: "SCHEDULED", bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0", dot: "#22c55e" },
};

const STATUS_META = {
  PENDING:          { label: "PENDING",          bg: "#fef9c3", color: "#a16207", icon: "⏳" },
  SCHEDULED:        { label: "SCHEDULED",        bg: "#dbeafe", color: "#1d4ed8", icon: "📅" },
  ACCEPTED:         { label: "ACCEPTED",         bg: "#dcfce7", color: "#15803d", icon: "✅" },
  REJECTED_BY_USER: { label: "REJECTED BY USER", bg: "#fee2e2", color: "#dc2626", icon: "↩️" },
  RESCHEDULED:      { label: "RESCHEDULED",      bg: "#ede9fe", color: "#7c3aed", icon: "🔄" },
  COMPLETED:        { label: "COMPLETED",        bg: "#d1fae5", color: "#065f46", icon: "🏁" },
  CANCELLED:        { label: "CANCELLED",        bg: "#f1f5f9", color: "#475569", icon: "🚫" },
};

export default function DispatcherRequestsPage() {
  const [requests, setRequests]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [notifCount, setNotifCount]     = useState(0);
  const [search, setSearch]             = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterPriority, setFilterPriority] = useState("ALL");
  const [expandedId, setExpandedId]     = useState(null);
  const [scheduleModal, setScheduleModal] = useState(null); // request being scheduled
  const [toast, setToast]               = useState(null);
  const [saving, setSaving]             = useState(false);
  const toastRef = useRef(null);

  const [scheduleForm, setScheduleForm] = useState({
    vehicleNumber: "", driverName: "", scheduledDate: "", scheduledTime: "", note: ""
  });

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadNotifCount, 15000);
    return () => clearInterval(interval);
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [reqRes] = await Promise.all([
        axios.get(BASE),
      ]);
      setRequests(reqRes.data || []);
      await loadNotifCount();
    } catch (e) {
      showToast("Failed to load requests", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadNotifCount = async () => {
    try {
      const { data } = await axios.get(`${BASE}/notifications/dispatcher/count`);
      setNotifCount(data.count || 0);
    } catch {}
  };

  const markRead = async () => {
    try {
      await axios.put(`${BASE}/notifications/dispatcher/read`);
      setNotifCount(0);
    } catch {}
  };

  const showToast = (msg, type = "success") => {
    clearTimeout(toastRef.current);
    setToast({ msg, type });
    toastRef.current = setTimeout(() => setToast(null), 3500);
  };

  const openScheduleModal = (req, isReschedule = false) => {
    setScheduleForm({
      vehicleNumber: req.assignedVehicleNumber || "",
      driverName:    req.assignedDriverName    || "",
      scheduledDate: req.scheduledDate         || "",
      scheduledTime: req.scheduledTime         || "",
      note:          "",
      isReschedule,
    });
    setScheduleModal(req);
  };

  const submitSchedule = async () => {
    if (!scheduleForm.vehicleNumber || !scheduleForm.scheduledDate || !scheduleForm.scheduledTime) {
      showToast("Vehicle, date and time are required", "error"); return;
    }
    setSaving(true);
    try {
      const endpoint = scheduleForm.isReschedule
        ? `${BASE}/${scheduleModal.id}/reschedule`
        : `${BASE}/${scheduleModal.id}/schedule`;
      await axios.put(endpoint, {
        vehicleNumber: scheduleForm.vehicleNumber,
        driverName:    scheduleForm.driverName,
        scheduledDate: scheduleForm.scheduledDate,
        scheduledTime: scheduleForm.scheduledTime,
        note:          scheduleForm.note,
      });
      showToast(scheduleForm.isReschedule ? "Rescheduled successfully" : "Scheduled successfully");
      setScheduleModal(null);
      loadAll();
    } catch { showToast("Failed to save schedule", "error"); }
    finally  { setSaving(false); }
  };

  const handleComplete = async (id) => {
    try { await axios.put(`${BASE}/${id}/complete`); showToast("Marked as completed"); loadAll(); }
    catch { showToast("Failed", "error"); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this request?")) return;
    try { await axios.put(`${BASE}/${id}/cancel`); showToast("Cancelled"); loadAll(); }
    catch { showToast("Failed", "error"); }
  };

  const filtered = requests.filter(r => {
    const q = search.toLowerCase();
    const ms = filterStatus   === "ALL" || r.status   === filterStatus;
    const mp = filterPriority === "ALL" || r.priority === filterPriority;
    const mq = !q ||
      (r.requesterName  || "").toLowerCase().includes(q) ||
      (r.department     || "").toLowerCase().includes(q) ||
      (r.destination    || "").toLowerCase().includes(q) ||
      (r.reason         || "").toLowerCase().includes(q);
    return ms && mp && mq;
  });

  const stats = {
    total:    requests.length,
    pending:  requests.filter(r => r.status === "PENDING").length,
    active:   requests.filter(r => ["SCHEDULED","RESCHEDULED"].includes(r.status)).length,
    rejected: requests.filter(r => r.status === "REJECTED_BY_USER").length,
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", display: "flex", flexDirection: "column", gap: 24 }}>

      {/* TOAST */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          display: "flex", alignItems: "center", gap: 8,
          padding: "10px 18px", borderRadius: 10, fontWeight: 600, fontSize: 13,
          boxShadow: "0 8px 24px rgba(0,0,0,.12)",
          background: toast.type === "success" ? "#dcfce7" : "#fee2e2",
          border: `1px solid ${toast.type === "success" ? "#86efac" : "#fca5a5"}`,
          color: toast.type === "success" ? "#166534" : "#991b1b",
        }}>
          {toast.type === "success" ? <FaCheckCircle/> : <FaInfoCircle/>}
          {toast.msg}
        </div>
      )}

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1e293b", borderLeft: "4px solid #2563eb", paddingLeft: 12 }}>
            Vehicle Requests
          </h2>
          <p style={{ margin: 0, fontSize: 12, color: "#94a3b8", paddingLeft: 16 }}>Manage and schedule vehicle requests from all departments</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={() => { markRead(); loadAll(); }}
            style={{
              position: "relative", background: "#fff", border: "1px solid #e2e8f0",
              borderRadius: 8, padding: "8px 14px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#64748b"
            }}
          >
            <FaBell color={notifCount > 0 ? "#f59e0b" : "#94a3b8"}/>
            Notifications
            {notifCount > 0 && (
              <span style={{
                position: "absolute", top: -6, right: -6,
                background: "#ef4444", color: "#fff", borderRadius: "50%",
                width: 18, height: 18, fontSize: 10, fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>{notifCount}</span>
            )}
          </button>
          <button onClick={loadAll} style={{
            background: "#2563eb", color: "#fff", border: "none",
            borderRadius: 8, padding: "8px 16px", cursor: "pointer",
            fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6
          }}>
            <FaRedo size={12}/> Refresh
          </button>
        </div>
      </div>

      {/* STAT CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: 20 }}>
        {[
          { title: "Total Requests",  value: stats.total,    color: "#2563eb", icon: "📋" },
          { title: "Pending",         value: stats.pending,  color: "#f59e0b", icon: "⏳" },
          { title: "Active / Scheduled", value: stats.active, color: "#16a34a", icon: "🚗" },
          { title: "Needs Attention", value: stats.rejected, color: "#ef4444", icon: "⚠️" },
        ].map(s => (
          <div key={s.title} className="card" style={{ borderTop: `4px solid ${s.color}`, padding: 20, cursor: "default" }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
            <h3 style={{ margin: "0 0 4px", fontSize: 13, color: "#64748b", fontWeight: 500 }}>{s.title}</h3>
            <p style={{ margin: 0, fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* FILTERS */}
      <div style={{
        display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center",
        background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px 16px"
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8, background: "#f8fafc",
          border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 12px", flex: 1, minWidth: 180
        }}>
          <FaSearch size={13} color="#94a3b8"/>
          <input
            style={{ background: "none", border: "none", outline: "none", flex: 1, fontSize: 13, color: "#334155", fontFamily: "Inter" }}
            placeholder="Search name, department, destination…"
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#475569", background: "#fff", outline: "none" }}
        >
          <option value="ALL">All Status</option>
          {Object.entries(STATUS_META).map(([k,v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
        </select>
        <select
          value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
          style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#475569", background: "#fff", outline: "none" }}
        >
          <option value="ALL">All Priority</option>
          {Object.keys(PRIORITY_META).map(k => <option key={k} value={k}>{k}</option>)}
        </select>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "#94a3b8" }}>{filtered.length} / {requests.length} requests</span>
      </div>

      {/* REQUEST CARDS */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>
          <FaSpinner size={28} style={{ animation: "spin 1s linear infinite" }}/>
          <p>Loading requests…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#64748b" }}>No requests found</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filtered.map(r => {
            const pm    = PRIORITY_META[r.priority] || PRIORITY_META.NORMAL;
            const sm    = STATUS_META[r.status]     || STATUS_META.PENDING;
            const isExp = expandedId === r.id;
            const needsAction = ["PENDING", "REJECTED_BY_USER"].includes(r.status);

            return (
              <div key={r.id} style={{
                background: "#fff", border: `1px solid ${needsAction ? "#fde68a" : "#e2e8f0"}`,
                borderRadius: 14, overflow: "hidden",
                boxShadow: needsAction ? "0 0 0 2px rgba(245,158,11,.15)" : "0 1px 3px rgba(0,0,0,.04)"
              }}>
                {/* CARD HEADER */}
                <div
                  style={{ padding: "16px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}
                  onClick={() => setExpandedId(isExp ? null : r.id)}
                >
                  {/* Priority dot */}
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: pm.dot, flexShrink: 0 }}/>

                  {/* Who */}
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ fontWeight: 700, color: "#1e293b", fontSize: 14 }}>{r.requesterName}</div>
                    <div style={{ fontSize: 12, color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}>
                      <FaBuilding size={10}/> {r.department}
                    </div>
                  </div>

                  {/* Destination */}
                  <div style={{ flex: 1, minWidth: 140 }}>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>Destination</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>{r.destination}</div>
                  </div>

                  {/* Requested time */}
                  <div style={{ flex: 1, minWidth: 120 }}>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>Requested</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>
                      {r.requestedDate} {r.requestedTime}
                    </div>
                  </div>

                  {/* Priority badge */}
                  <span style={{
                    background: pm.bg, color: pm.color, border: `1px solid ${pm.border}`,
                    borderRadius: 20, padding: "3px 10px", fontSize: 10, fontWeight: 800
                  }}>{pm.label}</span>

                  {/* Status badge */}
                  <span style={{
                    background: sm.bg, color: sm.color,
                    borderRadius: 20, padding: "3px 10px", fontSize: 10, fontWeight: 800
                  }}>{sm.icon} {sm.label}</span>

                  {/* Unread dot */}
                  {r.notifyDispatcher && (
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b", flexShrink: 0 }}/>
                  )}

                  {isExp ? <FaChevronUp size={12} color="#94a3b8"/> : <FaChevronDown size={12} color="#94a3b8"/>}
                </div>

                {/* EXPANDED DETAILS */}
                {isExp && (
                  <div style={{ borderTop: "1px solid #f1f5f9", padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>

                    {/* Info grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: 16 }}>
                      <InfoBox label="Reason" value={r.reason}/>
                      <InfoBox label="Passengers" value={r.numberOfPassengers || "—"}/>
                      <InfoBox label="Priority Note" value={r.priorityNote || "—"}/>
                      {r.assignedVehicleNumber && <InfoBox label="Assigned Vehicle" value={r.assignedVehicleNumber}/>}
                      {r.assignedDriverName    && <InfoBox label="Driver" value={r.assignedDriverName}/>}
                      {r.scheduledDate         && <InfoBox label="Scheduled Time" value={`${r.scheduledDate} ${r.scheduledTime}`}/>}
                      {r.dispatcherNote        && <InfoBox label="Dispatcher Note" value={r.dispatcherNote}/>}
                    </div>

                    {/* Requester rejection details */}
                    {r.status === "REJECTED_BY_USER" && (
                      <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 10, padding: 14 }}>
                        <div style={{ fontWeight: 700, color: "#dc2626", fontSize: 13, marginBottom: 8 }}>⚠️ User Rejected — Reason</div>
                        <div style={{ fontSize: 13, color: "#7f1d1d" }}>{r.requesterRejectionReason}</div>
                        <div style={{ fontSize: 12, color: "#b91c1c", marginTop: 6 }}>
                          Proposed: <strong>{r.requesterProposedDate} at {r.requesterProposedTime}</strong>
                        </div>
                      </div>
                    )}

                    {/* ACTION BUTTONS */}
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {(r.status === "PENDING") && (
                        <ActionBtn color="#2563eb" icon={<FaCalendarAlt size={12}/>} label="Schedule Vehicle"
                          onClick={() => openScheduleModal(r, false)}/>
                      )}
                      {(r.status === "REJECTED_BY_USER") && (
                        <ActionBtn color="#7c3aed" icon={<FaRedo size={12}/>} label="Reschedule"
                          onClick={() => openScheduleModal(r, true)}/>
                      )}
                      {(r.status === "ACCEPTED" || r.status === "RESCHEDULED" || r.status === "SCHEDULED") && (
                        <ActionBtn color="#16a34a" icon={<FaCheck size={12}/>} label="Mark Completed"
                          onClick={() => handleComplete(r.id)}/>
                      )}
                      {!["COMPLETED","CANCELLED"].includes(r.status) && (
                        <ActionBtn color="#ef4444" icon={<FaTimes size={12}/>} label="Cancel Request"
                          onClick={() => handleCancel(r.id)}/>
                      )}
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* SCHEDULE MODAL */}
      {scheduleModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15,23,42,.5)",
          backdropFilter: "blur(4px)", zIndex: 500,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 16
        }} onClick={() => setScheduleModal(null)}>
          <div style={{
            background: "#fff", borderRadius: 16, width: "100%", maxWidth: 480,
            boxShadow: "0 20px 60px rgba(0,0,0,.18)", overflow: "hidden"
          }} onClick={e => e.stopPropagation()}>

            <div style={{ padding: "18px 22px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#1e293b" }}>
                {scheduleForm.isReschedule ? "Reschedule Vehicle" : "Schedule Vehicle"}
              </span>
              <button onClick={() => setScheduleModal(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                <FaTimes size={16}/>
              </button>
            </div>

            <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ background: "#f8fafc", borderRadius: 8, padding: 12, fontSize: 13, color: "#475569" }}>
                Request from <strong>{scheduleModal.requesterName}</strong> ({scheduleModal.department}) → <strong>{scheduleModal.destination}</strong>
              </div>

              {[
                { label: "Vehicle Number *", key: "vehicleNumber", type: "text",   placeholder: "e.g. MH12AB1234" },
                { label: "Driver Name",      key: "driverName",    type: "text",   placeholder: "e.g. RAJAN" },
                { label: "Scheduled Date *", key: "scheduledDate", type: "date",   placeholder: "" },
                { label: "Scheduled Time *", key: "scheduledTime", type: "time",   placeholder: "" },
                { label: "Note to requester",key: "note",          type: "text",   placeholder: "Optional message…" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 5 }}>{f.label}</label>
                  <input
                    type={f.type} placeholder={f.placeholder}
                    value={scheduleForm[f.key]}
                    onChange={e => setScheduleForm(p => ({ ...p, [f.key]: e.target.value }))}
                    style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }}
                  />
                </div>
              ))}
            </div>

            <div style={{ padding: "14px 22px", borderTop: "1px solid #f1f5f9", display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setScheduleModal(null)} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#64748b" }}>
                Cancel
              </button>
              <button onClick={submitSchedule} disabled={saving} style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                {saving ? <FaSpinner size={12}/> : <FaCheck size={12}/>}
                {scheduleForm.isReschedule ? "Reschedule" : "Schedule"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 13, color: "#334155" }}>{value}</div>
    </div>
  );
}

function ActionBtn({ color, icon, label, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: color, color: "#fff", border: "none",
      borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 600,
      cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: ".2s"
    }}>{icon}{label}</button>
  );
}
