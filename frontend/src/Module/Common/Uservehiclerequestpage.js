import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  FaTruck, FaCalendarAlt, FaClock, FaBuilding, FaMapMarkerAlt,
  FaUsers, FaExclamationTriangle, FaBell, FaPlus, FaTimes,
  FaCheck, FaRedo, FaSpinner, FaChevronDown, FaChevronUp,
  FaCheckCircle, FaInfoCircle
} from "react-icons/fa";

const API  = process.env.REACT_APP_API_URL || "http://localhost:8080";
const BASE = `${API}/api/vehicle-requests`;

const PRIORITY_META = {
  URGENT:    { label: "URGENT",    bg: "#fee2e2", color: "#dc2626", border: "#fca5a5", dot: "#ef4444", desc: "Needs vehicle immediately" },
  HIGH:      { label: "HIGH",      bg: "#fff7ed", color: "#ea580c", border: "#fdba74", dot: "#f97316", desc: "Important, some flexibility" },
  NORMAL:    { label: "NORMAL",    bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe", dot: "#3b82f6", desc: "Regular request" },
  LOW:       { label: "LOW",       bg: "#f8fafc", color: "#64748b", border: "#cbd5e1", dot: "#94a3b8", desc: "Whenever available" },
  SCHEDULED: { label: "SCHEDULED", bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0", dot: "#22c55e", desc: "Planned in advance" },
};

const STATUS_META = {
  PENDING:          { label: "PENDING",          bg: "#fef9c3", color: "#a16207", icon: "⏳", desc: "Waiting for dispatcher" },
  SCHEDULED:        { label: "SCHEDULED",        bg: "#dbeafe", color: "#1d4ed8", icon: "📅", desc: "Dispatcher scheduled a vehicle" },
  ACCEPTED:         { label: "ACCEPTED",         bg: "#dcfce7", color: "#15803d", icon: "✅", desc: "You accepted the schedule" },
  REJECTED_BY_USER: { label: "REJECTED",         bg: "#fee2e2", color: "#dc2626", icon: "↩️", desc: "You rejected, awaiting dispatcher" },
  RESCHEDULED:      { label: "RESCHEDULED",      bg: "#ede9fe", color: "#7c3aed", icon: "🔄", desc: "New schedule assigned" },
  COMPLETED:        { label: "COMPLETED",        bg: "#d1fae5", color: "#065f46", icon: "🏁", desc: "Trip completed" },
  CANCELLED:        { label: "CANCELLED",        bg: "#f1f5f9", color: "#475569", icon: "🚫", desc: "Request cancelled" },
};

const DEPARTMENTS = [
  "ACCOUNTS", "HR", "PURCHASE", "SITE", "DISPATCH",
  "ADMIN", "DESIGN", "FABRICATION", "INSTALLATION", "OTHER"
];

const EMPTY_FORM = {
  requesterECode: "", requesterName: "", department: "",
  reason: "", requestedDate: "", requestedTime: "",
  destination: "", numberOfPassengers: "",
  priority: "NORMAL", priorityNote: "",
};

export default function UserVehicleRequestPage() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [requests, setRequests]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [form, setForm]                 = useState({ ...EMPTY_FORM, requesterECode: user?.eCode || "", requesterName: user?.fullName || user?.name || "" });
  const [saving, setSaving]             = useState(false);
  const [notifCount, setNotifCount]     = useState(0);
  const [expandedId, setExpandedId]     = useState(null);
  const [rejectModal, setRejectModal]   = useState(null);
  const [rejectForm, setRejectForm]     = useState({ reason: "", proposedDate: "", proposedTime: "" });
  const [toast, setToast]               = useState(null);
  const toastRef = useRef(null);

  useEffect(() => {
    if (user?.eCode) {
      loadMyRequests();
      const iv = setInterval(loadNotifCount, 15000);
      return () => clearInterval(iv);
    }
  }, []);

  const loadMyRequests = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${BASE}/my/${user.eCode}`);
      setRequests(data || []);
      await loadNotifCount();
    } catch { showToast("Failed to load requests", "error"); }
    finally  { setLoading(false); }
  };

  const loadNotifCount = async () => {
    try {
      const { data } = await axios.get(`${BASE}/notifications/requester/${user.eCode}/count`);
      setNotifCount(data.count || 0);
    } catch {}
  };

  const markRead = async () => {
    try {
      await axios.put(`${BASE}/notifications/requester/${user.eCode}/read`);
      setNotifCount(0);
    } catch {}
  };

  const showToast = (msg, type = "success") => {
    clearTimeout(toastRef.current);
    setToast({ msg, type });
    toastRef.current = setTimeout(() => setToast(null), 3500);
  };

  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submitRequest = async () => {
    if (!form.department || !form.reason || !form.requestedDate || !form.requestedTime || !form.destination) {
      showToast("Please fill all required fields", "error"); return;
    }
    setSaving(true);
    try {
      await axios.post(BASE, form);
      showToast("Request submitted successfully! ✅");
      setShowForm(false);
      setForm({ ...EMPTY_FORM, requesterECode: user?.eCode || "", requesterName: user?.fullName || user?.name || "" });
      loadMyRequests();
    } catch (e) {
      showToast(e?.response?.data || "Failed to submit", "error");
    } finally { setSaving(false); }
  };

  const handleAccept = async (id) => {
    try {
      await axios.put(`${BASE}/${id}/accept`);
      showToast("Schedule accepted! ✅");
      loadMyRequests();
    } catch { showToast("Failed", "error"); }
  };

  const submitReject = async () => {
    if (!rejectForm.reason || !rejectForm.proposedDate || !rejectForm.proposedTime) {
      showToast("Please fill all rejection fields", "error"); return;
    }
    setSaving(true);
    try {
      await axios.put(`${BASE}/${rejectModal.id}/reject`, {
        rejectionReason: rejectForm.reason,
        proposedDate:    rejectForm.proposedDate,
        proposedTime:    rejectForm.proposedTime,
      });
      showToast("Rejection sent with your proposed time");
      setRejectModal(null);
      setRejectForm({ reason: "", proposedDate: "", proposedTime: "" });
      loadMyRequests();
    } catch { showToast("Failed", "error"); }
    finally  { setSaving(false); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this request?")) return;
    try { await axios.put(`${BASE}/${id}/cancel`); showToast("Cancelled"); loadMyRequests(); }
    catch { showToast("Failed", "error"); }
  };

  const stats = {
    total:    requests.length,
    pending:  requests.filter(r => ["PENDING","REJECTED_BY_USER"].includes(r.status)).length,
    active:   requests.filter(r => ["SCHEDULED","RESCHEDULED","ACCEPTED"].includes(r.status)).length,
    done:     requests.filter(r => r.status === "COMPLETED").length,
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", display: "flex", flexDirection: "column", gap: 24, padding: "0" }}>

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
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1e293b", borderLeft: "4px solid #7c3aed", paddingLeft: 12 }}>
            Vehicle Requests
          </h2>
          <p style={{ margin: 0, fontSize: 12, color: "#94a3b8", paddingLeft: 16 }}>Request a vehicle from the dispatch team</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={() => { markRead(); loadMyRequests(); }}
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
          <button onClick={() => setShowForm(true)} style={{
            background: "#7c3aed", color: "#fff", border: "none",
            borderRadius: 8, padding: "9px 16px", cursor: "pointer",
            fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6
          }}>
            <FaPlus size={12}/> New Request
          </button>
        </div>
      </div>

      {/* STAT CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 16 }}>
        {[
          { title: "My Requests",  value: stats.total,   color: "#7c3aed", icon: "📋" },
          { title: "In Progress",  value: stats.pending, color: "#f59e0b", icon: "⏳" },
          { title: "Scheduled",    value: stats.active,  color: "#2563eb", icon: "🚗" },
          { title: "Completed",    value: stats.done,    color: "#16a34a", icon: "✅" },
        ].map(s => (
          <div key={s.title} className="card" style={{ borderTop: `4px solid ${s.color}`, padding: 18, cursor: "default" }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
            <h3 style={{ margin: "0 0 2px", fontSize: 12, color: "#64748b", fontWeight: 500 }}>{s.title}</h3>
            <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* REQUEST LIST */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>
          <FaSpinner size={26} style={{ animation: "spin 1s linear infinite" }}/>
          <p>Loading…</p>
        </div>
      ) : requests.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#94a3b8", background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: 42, marginBottom: 10 }}>🚗</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#64748b" }}>No requests yet</div>
          <div style={{ fontSize: 13, marginTop: 6 }}>Click "New Request" to request a vehicle</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {requests.map(r => {
            const pm    = PRIORITY_META[r.priority] || PRIORITY_META.NORMAL;
            const sm    = STATUS_META[r.status]     || STATUS_META.PENDING;
            const isExp = expandedId === r.id;
            const needsAction = ["SCHEDULED","RESCHEDULED"].includes(r.status);

            return (
              <div key={r.id} style={{
                background: "#fff",
                border: `1px solid ${needsAction ? "#bfdbfe" : "#e2e8f0"}`,
                borderRadius: 14, overflow: "hidden",
                boxShadow: needsAction ? "0 0 0 2px rgba(37,99,235,.1)" : "0 1px 3px rgba(0,0,0,.04)"
              }}>
                {/* Unread notification banner */}
                {r.notifyRequester && (
                  <div style={{ background: "#fef9c3", borderBottom: "1px solid #fde68a", padding: "6px 16px", fontSize: 12, fontWeight: 600, color: "#a16207" }}>
                    🔔 New update on this request
                  </div>
                )}

                {/* Card row */}
                <div
                  style={{ padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}
                  onClick={() => setExpandedId(isExp ? null : r.id)}
                >
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: pm.dot, flexShrink: 0 }}/>

                  <div style={{ flex: 1, minWidth: 140 }}>
                    <div style={{ fontWeight: 700, color: "#1e293b", fontSize: 14 }}>{r.destination}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{r.reason}</div>
                  </div>

                  <div style={{ flex: 1, minWidth: 120 }}>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>Requested for</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>{r.requestedDate} {r.requestedTime}</div>
                  </div>

                  <span style={{
                    background: pm.bg, color: pm.color, border: `1px solid ${pm.border}`,
                    borderRadius: 20, padding: "3px 10px", fontSize: 10, fontWeight: 800
                  }}>{pm.label}</span>

                  <span style={{
                    background: sm.bg, color: sm.color,
                    borderRadius: 20, padding: "3px 10px", fontSize: 10, fontWeight: 800
                  }}>{sm.icon} {sm.label}</span>

                  {isExp ? <FaChevronUp size={12} color="#94a3b8"/> : <FaChevronDown size={12} color="#94a3b8"/>}
                </div>

                {/* EXPANDED */}
                {isExp && (
                  <div style={{ borderTop: "1px solid #f1f5f9", padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14 }}>
                      <InfoBox label="Department" value={r.department}/>
                      <InfoBox label="Passengers" value={r.numberOfPassengers || "—"}/>
                      {r.priorityNote && <InfoBox label="Priority Note" value={r.priorityNote}/>}
                    </div>

                    {/* Dispatcher scheduled info */}
                    {(r.scheduledDate || r.assignedVehicleNumber) && (
                      <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: 14 }}>
                        <div style={{ fontWeight: 700, color: "#1d4ed8", fontSize: 13, marginBottom: 8 }}>📅 Dispatcher Schedule</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                          {r.scheduledDate && <InfoBox label="Date & Time" value={`${r.scheduledDate} at ${r.scheduledTime}`}/>}
                          {r.assignedVehicleNumber && <InfoBox label="Vehicle" value={r.assignedVehicleNumber}/>}
                          {r.assignedDriverName    && <InfoBox label="Driver" value={r.assignedDriverName}/>}
                          {r.dispatcherNote        && <InfoBox label="Note from Dispatcher" value={r.dispatcherNote}/>}
                        </div>
                      </div>
                    )}

                    {/* Action buttons for SCHEDULED / RESCHEDULED */}
                    {["SCHEDULED","RESCHEDULED"].includes(r.status) && (
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <button onClick={() => handleAccept(r.id)} style={{
                          background: "#16a34a", color: "#fff", border: "none",
                          borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 600,
                          cursor: "pointer", display: "flex", alignItems: "center", gap: 6
                        }}>
                          <FaCheck size={11}/> Accept This Schedule
                        </button>
                        <button onClick={() => { setRejectModal(r); setRejectForm({ reason: "", proposedDate: r.requestedDate, proposedTime: r.requestedTime }); }} style={{
                          background: "#ef4444", color: "#fff", border: "none",
                          borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 600,
                          cursor: "pointer", display: "flex", alignItems: "center", gap: 6
                        }}>
                          <FaTimes size={11}/> Reject & Propose New Time
                        </button>
                      </div>
                    )}

                    {/* Cancel option */}
                    {["PENDING"].includes(r.status) && (
                      <div>
                        <button onClick={() => handleCancel(r.id)} style={{
                          background: "#f8fafc", color: "#ef4444", border: "1px solid #fca5a5",
                          borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer"
                        }}>
                          Cancel Request
                        </button>
                      </div>
                    )}

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* NEW REQUEST MODAL */}
      {showForm && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15,23,42,.5)",
          backdropFilter: "blur(4px)", zIndex: 500,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 16
        }} onClick={() => setShowForm(false)}>
          <div style={{
            background: "#fff", borderRadius: 16, width: "100%", maxWidth: 560,
            maxHeight: "90vh", display: "flex", flexDirection: "column",
            boxShadow: "0 20px 60px rgba(0,0,0,.18)"
          }} onClick={e => e.stopPropagation()}>

            <div style={{ padding: "18px 22px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#1e293b" }}>New Vehicle Request</span>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}><FaTimes size={16}/></button>
            </div>

            <div style={{ padding: 22, overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>

              {/* 2-col grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <FField label="Your Name *" value={form.requesterName} onChange={v => setField("requesterName", v)} type="text" placeholder="Full name"/>
                <FField label="Employee Code *" value={form.requesterECode} onChange={v => setField("requesterECode", v)} type="text" placeholder="e.g. E001"/>
              </div>

              <div>
                <label style={lbl}>Department *</label>
                <select value={form.department} onChange={e => setField("department", e.target.value)} style={sel}>
                  <option value="">— Select Department —</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <FField label="Destination *" value={form.destination} onChange={v => setField("destination", v)} type="text" placeholder="e.g. Client office, Site name"/>
              <FField label="Reason / Purpose *" value={form.reason} onChange={v => setField("reason", v)} type="text" placeholder="Why do you need the vehicle?"/>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <FField label="Date Needed *" value={form.requestedDate} onChange={v => setField("requestedDate", v)} type="date"/>
                <FField label="Time Needed *" value={form.requestedTime} onChange={v => setField("requestedTime", v)} type="time"/>
              </div>

              <FField label="No. of Passengers" value={form.numberOfPassengers} onChange={v => setField("numberOfPassengers", v)} type="number" placeholder="How many people?"/>

              {/* Priority */}
              <div>
                <label style={lbl}>Priority *</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px,1fr))", gap: 8 }}>
                  {Object.entries(PRIORITY_META).map(([k, v]) => (
                    <button
                      key={k} type="button"
                      onClick={() => setField("priority", k)}
                      style={{
                        padding: "8px 6px", border: `2px solid ${form.priority === k ? v.dot : "#e2e8f0"}`,
                        borderRadius: 8, background: form.priority === k ? v.bg : "#f8fafc",
                        color: form.priority === k ? v.color : "#94a3b8",
                        fontSize: 11, fontWeight: 700, cursor: "pointer", transition: ".15s"
                      }}
                    >
                      <div style={{ fontSize: 6, marginBottom: 3, display: "flex", justifyContent: "center" }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: form.priority === k ? v.dot : "#d1d5db", display: "inline-block" }}/>
                      </div>
                      {v.label}
                      <div style={{ fontSize: 9, fontWeight: 400, color: "#94a3b8", marginTop: 2 }}>{v.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <FField label="Priority Note" value={form.priorityNote} onChange={v => setField("priorityNote", v)} type="text" placeholder="Additional context (optional)"/>

            </div>

            <div style={{ padding: "14px 22px", borderTop: "1px solid #f1f5f9", display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setShowForm(false)} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#64748b" }}>
                Cancel
              </button>
              <button onClick={submitRequest} disabled={saving} style={{ background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                {saving ? <FaSpinner size={12}/> : <FaCheck size={12}/>}
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT + PROPOSE MODAL */}
      {rejectModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15,23,42,.5)",
          backdropFilter: "blur(4px)", zIndex: 500,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 16
        }} onClick={() => setRejectModal(null)}>
          <div style={{
            background: "#fff", borderRadius: 16, width: "100%", maxWidth: 440,
            boxShadow: "0 20px 60px rgba(0,0,0,.18)"
          }} onClick={e => e.stopPropagation()}>

            <div style={{ padding: "18px 22px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#dc2626" }}>Reject & Propose New Time</span>
              <button onClick={() => setRejectModal(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}><FaTimes size={16}/></button>
            </div>

            <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ background: "#fff7ed", border: "1px solid #fdba74", borderRadius: 8, padding: 12, fontSize: 13, color: "#92400e" }}>
                The dispatcher scheduled: <strong>{rejectModal.scheduledDate} at {rejectModal.scheduledTime}</strong>.
                Tell us why this doesn't work and propose a better time.
              </div>

              <div>
                <label style={lbl}>Reason for rejection *</label>
                <textarea
                  value={rejectForm.reason} onChange={e => setRejectForm(p => ({ ...p, reason: e.target.value }))}
                  placeholder="e.g. I have a meeting at that time, can we shift to afternoon?"
                  style={{ ...sel, height: 70, resize: "none" }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={lbl}>Proposed Date *</label>
                  <input type="date" value={rejectForm.proposedDate} onChange={e => setRejectForm(p => ({ ...p, proposedDate: e.target.value }))} style={sel}/>
                </div>
                <div>
                  <label style={lbl}>Proposed Time *</label>
                  <input type="time" value={rejectForm.proposedTime} onChange={e => setRejectForm(p => ({ ...p, proposedTime: e.target.value }))} style={sel}/>
                </div>
              </div>
            </div>

            <div style={{ padding: "14px 22px", borderTop: "1px solid #f1f5f9", display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setRejectModal(null)} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#64748b" }}>
                Cancel
              </button>
              <button onClick={submitReject} disabled={saving} style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                {saving ? <FaSpinner size={12}/> : <FaTimes size={12}/>}
                Send Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const lbl = { display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 5 };
const sel = { width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "Inter", color: "#334155", background: "#fff" };

function FField({ label, value, onChange, type, placeholder }) {
  return (
    <div>
      <label style={lbl}>{label}</label>
      <input type={type} value={value} placeholder={placeholder || ""} onChange={e => onChange(e.target.value)}
        style={sel}/>
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
