


import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

/* ─── CONSTANTS ─────────────────────────────────────────────────────────── */
const API  = process.env.REACT_APP_API_URL || "";
const BASE = `${API}/api/daily-progress-report`;
const LOOK = `${API}/api/lookup`;


const STATUS_META = {
  ACHIEVE:      { label: "ACHIEVE",      bg: "#16a34a", text: "#fff", dot: "#4ade80" },
  NOT_ACHIEVED: { label: "NOT ACHIEVED", bg: "#b91c1c", text: "#fff", dot: "#fca5a5" },
  CANCELLED:    { label: "CANCELLED",    bg: "#dc2626", text: "#fff", dot: "#f87171" },
  BREAKDOWN:    { label: "BREAKDOWN",    bg: "#ef4444", text: "#fff", dot: "#fca5a5" },
  PENDING:      { label: "PENDING",      bg: "#94a3b8", text: "#fff", dot: "#cbd5e1" },
  OTHER:        { label: "OTHER",        bg: "#f97316", text: "#fff", dot: "#fdba74" },
};

const EMPTY_ROW = {
  reportDate:         new Date().toISOString().split("T")[0],
  employeeName:       "",
  srNo:               1,
  vehicleNumber:      "",
  tripNumber:         1,
  driverName:         "",
  description:        "",
  fromLocation:       "",
  toLocation:         "",
  timeSlot:           "",
  targetAchieve:      "PENDING",
  targetAchieveOther: "",
  remark:             "",
};

/* ─── WORKING HOURS PARSER ──────────────────────────────────────────────── */
function parseHours(timeSlot) {
  if (!timeSlot || !timeSlot.trim()) return 0;
  const ts = timeSlot.trim().toUpperCase();
  if (ts === "CANCEL" || ts === "CANCELLED") return 0;
  const endIsPM = ts.endsWith("PM");
  const endIsAM = ts.endsWith("AM");
  const clean = ts.replace("PM", "").replace("AM", "").trim();
  const parts = clean.split("-");
  if (parts.length !== 2) return 0;
  const toDecimal = (t) => {
    const hm = t.trim().split(":");
    if (hm.length !== 2) return NaN;
    return parseFloat(hm[0]) + parseFloat(hm[1]) / 60;
  };
  let startH = toDecimal(parts[0]);
  let endH   = toDecimal(parts[1]);
  if (isNaN(startH) || isNaN(endH)) return 0;
  if (endIsPM && endH < 12) endH += 12;
  if (endIsAM && endH === 12) endH = 0;
  if (endH < startH) endH += 12;
  return Math.max(0, endH - startH);
}
function formatHours(total) {
  const h = Math.floor(total);
  const m = Math.round((total - h) * 60);
  if (h === 0 && m === 0) return "0h";
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/* ─── HELPERS ───────────────────────────────────────────────────────────── */
const fmt = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const pluralise = (n, w) => `${n} ${w}${n !== 1 ? "s" : ""}`;

/* ─── ICONS ─────────────────────────────────────────────────────────────── */
const Icon = ({ d, size = 16, stroke = "currentColor", fill = "none" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
       stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const IDownload = (p) => <Icon {...p} d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />;
const IPlus     = (p) => <Icon {...p} d="M12 5v14M5 12h14" />;
const ITrash    = (p) => <Icon {...p} d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />;
const ISearch   = (p) => <Icon {...p} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />;
const IRefresh  = (p) => <Icon {...p} d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.38-3.36L23 10M1 14l5.09 4.36A9 9 0 0020.49 15" />;
const ICalendar = (p) => <Icon {...p} d="M3 4h18v18H3zM16 2v4M8 2v4M3 10h18" />;
const IClose    = (p) => <Icon {...p} d="M18 6L6 18M6 6l12 12" />;
const ICheck    = (p) => <Icon {...p} d="M20 6L9 17l-5-5" />;
const IClock    = (p) => <Icon {...p} d="M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2" />;
const IReport   = (p) => <Icon {...p} d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8" />;
const IChevron  = (p) => <Icon {...p} d="M6 9l6 6 6-6" />;
const IUsers    = (p) => <Icon {...p} d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />;

/* ─── MULTI-SELECT DROPDOWN COMPONENT ──────────────────────────────────── */
function MultiSelectDropdown({ options, value, onChange, placeholder = "Select…" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = new Set(
    value ? value.split(" & ").map(s => s.trim()).filter(Boolean) : []
  );

  const toggle = (val) => {
    const next = new Set(selected);
    if (next.has(val)) next.delete(val);
    else next.add(val);
    onChange([...next].join(" & "));
  };

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const displayText = selected.size === 0
    ? placeholder
    : [...selected].join(" & ");

  return (
    <div className="msd-wrap" ref={ref}>
      <button
        type="button"
        className={`msd-trigger dpr-input${open ? " msd-open" : ""}`}
        onClick={() => setOpen(o => !o)}
      >
        <span className={`msd-display${selected.size === 0 ? " msd-placeholder" : ""}`}>
          {displayText}
        </span>
        <IChevron size={13}/>
      </button>
      {open && (
        <div className="msd-dropdown">
          {options.length === 0 ? (
            <div className="msd-empty">No options available</div>
          ) : (
            options.map(opt => (
              <label key={opt.value} className="msd-item">
                <input
                  type="checkbox"
                  checked={selected.has(opt.value)}
                  onChange={() => toggle(opt.value)}
                  className="msd-checkbox"
                />
                <span className="msd-label">{opt.label}</span>
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════════════ */
export default function DailyProgressReportPage() {

  /* ── data state ── */
  const [rows,         setRows]         = useState([]);
  const [dates,        setDates]        = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [specialNote,  setSpecialNote]  = useState("");

  /* ── lookup data for dropdowns ── */
  const [dispatchUsers, setDispatchUsers] = useState([]);
  const [driverUsers,   setDriverUsers]   = useState([]);
  const [vehicles,      setVehicles]      = useState([]);

  /* ── ui state ── */
  const [loading,      setLoading]      = useState(false);
  const [exportingDPR, setExportingDPR] = useState(false);
  const [exportingDP,  setExportingDP]  = useState(false);
  const [search,       setSearch]       = useState("");
  const [showForm,     setShowForm]     = useState(false);
  const [formData,     setFormData]     = useState(EMPTY_ROW);
  const [saving,       setSaving]       = useState(false);
  const [toast,        setToast]        = useState(null);
  const [deleteId,     setDeleteId]     = useState(null);
  // ✅ editId state
  const [editId,       setEditId]       = useState(null);
  const [filterStatus, setFilterStatus] = useState("ALL");

  const toastTimer = useRef(null);

  /* ── effects ── */
  useEffect(() => {
    fetchDates();
    fetchLookups();
  }, []);

  useEffect(() => { if (selectedDate) fetchRows(); }, [selectedDate]);

  /* ── api: lookups ── */
  const fetchLookups = async () => {
    try {
      const [dispRes, drvRes, vehRes] = await Promise.all([
        axios.get(`${LOOK}/users/dispatch`),
        axios.get(`${LOOK}/users/driver`),
        axios.get(`${LOOK}/vehicles`),
      ]);
      setDispatchUsers((dispRes.data || []).map(u => ({ label: u.fullName, value: u.fullName })));
      setDriverUsers((drvRes.data || []).map(u => ({ label: u.fullName, value: u.fullName })));
      setVehicles((vehRes.data || []).map(v => ({ label: v.vehicleNumber, value: v.vehicleNumber })));
    } catch (e) {
      console.error("Lookup fetch failed", e);
    }
  };

  /* ── api: rows ── */
  const fetchDates = async () => {
    try {
      const { data } = await axios.get(`${BASE}/available-dates`);
      setDates(data || []);
    } catch { /* silent */ }
  };

  const fetchRows = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${BASE}/by-date`, { params: { date: selectedDate } });
      setRows(data || []);
      const note = (data || []).find(r => r.specialNote)?.specialNote || "";
      setSpecialNote(note);
    } catch { showToast("Failed to load report data", "error"); }
    finally   { setLoading(false); }
  };

  // ✅ handleSave handles both ADD and EDIT
  const handleSave = async () => {
    if (formData.targetAchieve === "OTHER" && !formData.targetAchieveOther?.trim()) {
      showToast("Please enter custom status for OTHER", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...formData,
        reportDate: selectedDate,
        specialNote,
        targetAchieveOther:
          formData.targetAchieve === "OTHER"
            ? (formData.targetAchieveOther || "").trim()
            : null,
      };

      if (editId) {
        await axios.put(`${BASE}/${editId}`, payload);
        showToast("Trip row updated successfully", "success");
      } else {
        await axios.post(BASE, payload);
        showToast("Trip row saved successfully", "success");
      }

      setShowForm(false);
      setEditId(null);
      setFormData({ ...EMPTY_ROW, reportDate: selectedDate });
      fetchRows();
      fetchDates();
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed to save trip";
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE}/${id}`);
      showToast("Row deleted", "success");
      setDeleteId(null);
      fetchRows();
    } catch { showToast("Failed to delete", "error"); }
  };

  /* ── exports ── */
  const handleExportDPR = async () => {
    setExportingDPR(true);
    try {
      const res = await axios.get(`${BASE}/export`, { params: { date: selectedDate }, responseType: "blob" });
      triggerDownload(res.data, `Daily_Progress_Report_${selectedDate}.xlsx`);
      showToast("Daily Progress Report downloaded!", "success");
    } catch { showToast("Export failed", "error"); }
    finally   { setExportingDPR(false); }
  };

  const handleExportDP = async () => {
    setExportingDP(true);
    try {
      const res = await axios.get(`${BASE}/export-planning`, { params: { date: selectedDate }, responseType: "blob" });
      triggerDownload(res.data, `Daily_Planning_${selectedDate}.xlsx`);
      showToast("Daily Planning downloaded!", "success");
    } catch { showToast("Export failed", "error"); }
    finally   { setExportingDP(false); }
  };

  const triggerDownload = (blobData, filename) => {
    const url = window.URL.createObjectURL(new Blob([blobData]));
    const a   = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    window.URL.revokeObjectURL(url);
  };

  /* ── helpers ── */
  const showToast = (msg, type = "success") => {
    clearTimeout(toastTimer.current);
    setToast({ msg, type });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  };

  const setField = (key, val) => setFormData(p => ({ ...p, [key]: val }));

  const openAddForm = () => {
    setEditId(null);
    setFormData({ ...EMPTY_ROW, reportDate: selectedDate });
    setShowForm(true);
  };

  // ✅ openEditForm — populates form with existing row data
  const openEditForm = (row) => {
    setEditId(row.id);
    setFormData({
      reportDate:         row.reportDate         || selectedDate,
      employeeName:       row.employeeName        || "",
      srNo:               row.srNo                || 1,
      vehicleNumber:      row.vehicleNumber       || "",
      tripNumber:         row.tripNumber          || 1,
      driverName:         row.driverName          || "",
      description:        row.description         || "",
      fromLocation:       row.fromLocation        || "",
      toLocation:         row.toLocation          || "",
      timeSlot:           row.timeSlot            || "",
      targetAchieve:      row.targetAchieve       || "PENDING",
      targetAchieveOther: row.targetAchieveOther  || "",
      remark:             row.remark              || "",
    });
    setShowForm(true);
  };

  /* ── filtered rows ── */
  const filtered = rows.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (r.vehicleNumber || "").toLowerCase().includes(q) ||
      (r.driverName    || "").toLowerCase().includes(q) ||
      (r.description   || "").toLowerCase().includes(q) ||
      (r.fromLocation  || "").toLowerCase().includes(q) ||
      (r.toLocation    || "").toLowerCase().includes(q);
    const matchStatus = filterStatus === "ALL" || r.targetAchieve === filterStatus;
    return matchSearch && matchStatus;
  });

  /* ── computed stats ── */
  const totalWorkingHours = rows.reduce((s, r) => s + parseHours(r.timeSlot), 0);
  const stats = {
    total:   rows.length,
    achieve: rows.filter(r => r.targetAchieve === "ACHIEVE").length,
    issues:  rows.filter(r => ["CANCELLED","BREAKDOWN","NOT_ACHIEVED"].includes(r.targetAchieve)).length,
    pending: rows.filter(r => r.targetAchieve === "PENDING").length,
  };

  /* ════════════════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="dpr-page">

      {/* ── TOAST ── */}
      {toast && (
        <div className={`dpr-toast dpr-toast--${toast.type}`}>
          {toast.type === "success" ? <ICheck size={14}/> : <IClose size={14}/>}
          {toast.msg}
        </div>
      )}

      {/* ══ PAGE HEADER ══ */}
      <div className="dpr-page-header">
        <div className="dpr-header-left">
          <h2 className="dpr-section-title">Daily Progress Reports</h2>
          <p className="dpr-section-sub">ONE DEO LEELA FAÇADE SYSTEMS PVT LTD.</p>
        </div>
        <div className="dpr-header-right">
          <div className="dpr-date-pill">
            <ICalendar size={13}/>
            <input
              type="date" className="dpr-date-input" value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <button className="dpr-btn dpr-btn-ghost" onClick={fetchRows} disabled={loading}>
            <IRefresh size={14}/> Refresh
          </button>
          <button className="dpr-btn dpr-btn-outline" onClick={openAddForm}>
            <IPlus size={14}/> Add Row
          </button>
          <div className="dpr-export-group">
            <button
              className="dpr-btn dpr-btn-export-dpr"
              onClick={handleExportDPR}
              disabled={exportingDPR || rows.length === 0}
              title="Download Daily Progress Report (.xlsx)"
            >
              {exportingDPR ? <span className="dpr-spin"/> : <IDownload size={14}/>}
              Daily Progress Report
            </button>
            <button
              className="dpr-btn dpr-btn-export-dp"
              onClick={handleExportDP}
              disabled={exportingDP || rows.length === 0}
              title="Download Daily Planning (.xlsx)"
            >
              {exportingDP ? <span className="dpr-spin dpr-spin-dark"/> : <IReport size={14}/>}
              Daily Planning
            </button>
          </div>
        </div>
      </div>

      {/* ══ STAT CARDS ══ */}
      <div className="dpr-stats-grid">
        {[
          { title:"Total Trips",  value:stats.total,   color:"#2563eb", icon:"🚚", sub:"all trips today" },
          { title:"Achieved",     value:stats.achieve, color:"#16a34a", icon:"✅", sub:"on target" },
          { title:"Issues",       value:stats.issues,  color:"#ef4444", icon:"⚠️", sub:"cancelled / breakdown" },
          { title:"Pending",      value:stats.pending, color:"#f59e0b", icon:"⏳", sub:"awaiting update" },
        ].map(s => (
          <div key={s.title} className="card dpr-stat-card" style={{ borderTop:`4px solid ${s.color}` }}>
            <div className="dpr-stat-icon">{s.icon}</div>
            <h3 className="dpr-stat-label">{s.title}</h3>
            <p  className="dpr-stat-value" style={{ color:s.color }}>{s.value}</p>
            <span className="dpr-stat-sub">{s.sub}</span>
            <div className="dpr-stat-bar" style={{
              background:s.color,
              width:`${stats.total ? (s.value/stats.total)*100 : 0}%`
            }}/>
          </div>
        ))}
      </div>

      {/* ══ WORKING HOURS BANNER ══ */}
      <div className="dpr-hours-banner">
        <IClock size={18} stroke="#2563eb"/>
        <span className="dpr-hours-label">Total Working Hours for {fmt(selectedDate)}:</span>
        <span className="dpr-hours-value">{formatHours(totalWorkingHours)}</span>
        <span className="dpr-hours-note">
          ({rows.filter(r => parseHours(r.timeSlot) > 0).length} trips with valid time slots)
        </span>
      </div>

      {/* ══ SPECIAL NOTE ══ */}
      <div className="dpr-note-section">
        <div className="dpr-note-header">
          <span className="dpr-note-icon">📝</span>
          <span className="dpr-note-title">Special Note</span>
          <span className="dpr-note-hint">Appears in the footer of both exported Excel files</span>
        </div>
        <textarea
          className="dpr-note-input"
          rows={2}
          placeholder="Enter a special note for this date's report… (e.g. 'Delivery delayed due to traffic')"
          value={specialNote}
          onChange={e => setSpecialNote(e.target.value)}
        />
      </div>

      {/* ══ DATE QUICK-SELECT ══ */}
      {dates.length > 0 && (
        <div className="dpr-date-row">
          <span className="dpr-date-row-label">Quick dates:</span>
          <div className="dpr-date-chips">
            {dates.slice(0, 10).map(d => (
              <button
                key={d}
                className={`dpr-date-chip${selectedDate === d ? " dpr-date-chip-active" : ""}`}
                onClick={() => setSelectedDate(d)}
              >
                {fmt(d)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ══ FILTER BAR ══ */}
      <div className="dpr-filterbar">
        <div className="dpr-search-box">
          <ISearch size={14}/>
          <input
            className="dpr-search-input"
            placeholder="Search vehicle, driver, description…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="dpr-search-clear" onClick={() => setSearch("")}>
              <IClose size={12}/>
            </button>
          )}
        </div>
        <div className="dpr-chip-group">
          {["ALL","ACHIEVE","PENDING","CANCELLED","BREAKDOWN","NOT_ACHIEVED","OTHER"].map(s => (
            <button
              key={s}
              className={`dpr-filter-chip${filterStatus===s?" dpr-chip-active":""}`}
              style={filterStatus===s && s!=="ALL"
                ? { background:STATUS_META[s]?.bg, color:"#fff", borderColor:STATUS_META[s]?.bg }
                : {}}
              onClick={() => setFilterStatus(s)}
            >
              {s === "ALL" ? "All Status" : STATUS_META[s]?.label}
            </button>
          ))}
        </div>
        <span className="dpr-result-count">
          {pluralise(filtered.length, "record")} / {rows.length} total
        </span>
      </div>

      {/* ══ TABLE ══ */}
      <div className="card dpr-table-card">
        {loading ? (
          <div className="dpr-state-box">
            <span className="dpr-spin dpr-spin-lg"/>
            <span className="dpr-state-text">Loading report…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="dpr-state-box">
            <div style={{ fontSize:40, marginBottom:10 }}>📋</div>
            <div className="dpr-state-title">No records found</div>
            <div className="dpr-state-sub">Try adjusting your filters or add a new row.</div>
          </div>
        ) : (
          <div className="dpr-table-scroll">
            <table className="dpr-table">
              <thead>
                <tr>
                  {/* ✅ Added empty header for edit button column */}
                  {["SR","Vehicle","Trip","Driver","Description","From","To","Time","Target Achieve","Remark","",""].map((h, i) => (
                    <th key={i}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => {
                  const meta = STATUS_META[r.targetAchieve] || STATUS_META.PENDING;
                  const badgeLabel = r.targetAchieve === "OTHER" && r.targetAchieveOther
                    ? r.targetAchieveOther.toUpperCase()
                    : meta.label;
                  return (
                    <tr key={r.id || i} className="dpr-tr">
                      <td className="dpr-td-sr">{r.srNo}</td>
                      <td><span className="dpr-vehicle-tag">{r.vehicleNumber || "—"}</span></td>
                      <td className="dpr-td-c">{r.tripNumber}</td>
                      <td className="dpr-td-driver">{r.driverName || "—"}</td>
                      <td className="dpr-td-wrap">
                        {(r.description || "—").replace(/(\d+)\.0\b/g, "$1")}
                      </td>
                      <td className="dpr-td-loc">{r.fromLocation || "—"}</td>
                      <td className="dpr-td-loc">{r.toLocation   || "—"}</td>
                      <td className="dpr-td-time">
                        <span className={r.targetAchieve === "CANCELLED" ? "dpr-cancelled-time" : ""}>
                          {r.timeSlot || "—"}
                        </span>
                      </td>
                      <td>
                        <span className="dpr-badge" style={{ background:meta.bg, color:meta.text }}>
                          <span className="dpr-dot" style={{ background:meta.dot }}/>
                          {badgeLabel}
                        </span>
                      </td>
                      <td className="dpr-td-rem">{r.remark || "—"}</td>

                      {/* ✅ EDIT BUTTON — between Remark and Delete */}
                      <td>
                        <button
                          className="dpr-edit-btn"
                          onClick={() => openEditForm(r)}
                          title="Edit"
                        >
                          <Icon d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" size={13}/>
                        </button>
                      </td>

                      {/* DELETE BUTTON */}
                      <td>
                        <button className="dpr-del-btn" onClick={() => setDeleteId(r.id)} title="Delete">
                          <ITrash size={13}/>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ══ ADD / EDIT ROW MODAL ══ */}
      {showForm && (
        <div className="dpr-overlay" onClick={() => { setShowForm(false); setEditId(null); }}>
          <div className="dpr-modal" onClick={e => e.stopPropagation()}>
            <div className="dpr-modal-hd">
              {/* ✅ Dynamic title */}
              <span className="dpr-modal-title">{editId ? "Edit Trip Row" : "Add Trip Row"}</span>
              {/* ✅ X button resets editId */}
              <button className="dpr-modal-x" onClick={() => { setShowForm(false); setEditId(null); }}><IClose size={15}/></button>
            </div>
            <div className="dpr-modal-bd">
              <div className="dpr-form-grid">

                {/* Date */}
                <div className="dpr-field">
                  <label className="dpr-label">Date</label>
                  <input className="dpr-input" type="date"
                    value={formData.reportDate}
                    onChange={e => setField("reportDate", e.target.value)}
                  />
                </div>

                {/* SR No */}
                <div className="dpr-field">
                  <label className="dpr-label">SR. No</label>
                  <input className="dpr-input" type="number"
                    value={formData.srNo}
                    onChange={e => setField("srNo", e.target.value)}
                  />
                </div>

                {/* Employee Name */}
                <div className="dpr-field dpr-field-full">
                  <label className="dpr-label">
                    <IUsers size={11}/> Employee Name
                    <span className="dpr-label-role"> (Dispatch Dept.)</span>
                  </label>
                  <MultiSelectDropdown
                    options={dispatchUsers}
                    value={formData.employeeName}
                    onChange={val => setField("employeeName", val)}
                    placeholder="Select dispatch employee(s)…"
                  />
                </div>

                {/* Vehicle Number */}
                <div className="dpr-field">
                  <label className="dpr-label">Vehicle No.</label>
                  <select
                    className="dpr-input dpr-select"
                    value={formData.vehicleNumber}
                    onChange={e => setField("vehicleNumber", e.target.value)}
                  >
                    <option value="">— Select vehicle —</option>
                    {vehicles.map(v => (
                      <option key={v.value} value={v.value}>{v.label}</option>
                    ))}
                  </select>
                </div>

                {/* Trip No */}
                <div className="dpr-field">
                  <label className="dpr-label">Trip No.</label>
                  <input className="dpr-input" type="number"
                    value={formData.tripNumber}
                    onChange={e => setField("tripNumber", e.target.value)}
                  />
                </div>

                {/* Driver */}
                <div className="dpr-field">
                  <label className="dpr-label">Driver</label>
                  <select
                    className="dpr-input dpr-select"
                    value={formData.driverName}
                    onChange={e => setField("driverName", e.target.value)}
                  >
                    <option value="">— Select driver —</option>
                    {driverUsers.map(d => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="dpr-field dpr-field-full">
                  <label className="dpr-label">Description</label>
                  <input className="dpr-input" type="text"
                    placeholder="e.g. ALU. BOX PIPE & HARDWARE MATERIAL"
                    value={formData.description}
                    onChange={e => setField("description", e.target.value)}
                  />
                </div>

                {/* From */}
                <div className="dpr-field">
                  <label className="dpr-label">From</label>
                  <input className="dpr-input" type="text"
                    placeholder="e.g. ONE DEO"
                    value={formData.fromLocation}
                    onChange={e => setField("fromLocation", e.target.value)}
                  />
                </div>

                {/* To */}
                <div className="dpr-field">
                  <label className="dpr-label">To</label>
                  <input className="dpr-input" type="text"
                    placeholder="e.g. GODREJ AVAMARK LLP. MANJARI"
                    value={formData.toLocation}
                    onChange={e => setField("toLocation", e.target.value)}
                  />
                </div>

                {/* Time Slot */}
                <div className="dpr-field">
                  <label className="dpr-label">Time Slot</label>
                  <input className="dpr-input" type="text"
                    placeholder="e.g. 9:00-5:30 PM"
                    value={formData.timeSlot}
                    onChange={e => setField("timeSlot", e.target.value)}
                  />
                </div>

                {/* Remark */}
                <div className="dpr-field">
                  <label className="dpr-label">Remark</label>
                  <input className="dpr-input" type="text"
                    placeholder="e.g. LOADING, SITE DISPATCH"
                    value={formData.remark}
                    onChange={e => setField("remark", e.target.value)}
                  />
                </div>

                {/* Target Achieve */}
                <div className="dpr-field">
                  <label className="dpr-label">Target Achieve</label>
                  <select
                    className="dpr-input dpr-select"
                    value={formData.targetAchieve}
                    onChange={e => {
                      const val = e.target.value;
                      setField("targetAchieve", val);
                      if (val !== "OTHER") {
                        setField("targetAchieveOther", "");
                      }
                    }}
                  >
                    {Object.entries(STATUS_META).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>

                {/* Custom text — only when OTHER */}
                {formData.targetAchieve === "OTHER" && (
                  <div className="dpr-field dpr-field-other">
                    <label className="dpr-label">
                      Custom Status Text <span className="dpr-label-req">*</span>
                    </label>
                    <input
                      className="dpr-input dpr-input-other"
                      type="text"
                      placeholder="e.g. PARTIALLY DONE, RESCHEDULED…"
                      value={formData.targetAchieveOther || ""}
                      onChange={e => setField("targetAchieveOther", e.target.value)}
                    />
                    <span className="dpr-field-hint">
                      Shown as an orange cell in the Excel report.
                    </span>
                  </div>
                )}

              </div>
            </div>

            <div className="dpr-modal-ft">
              {/* ✅ Cancel button resets editId */}
              <button className="dpr-btn dpr-btn-ghost" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</button>
              <button className="dpr-btn dpr-btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <span className="dpr-spin"/> : <ICheck size={14}/>}
                Save Row
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ DELETE CONFIRM ══ */}
      {deleteId && (
        <div className="dpr-overlay" onClick={() => setDeleteId(null)}>
          <div className="dpr-confirm" onClick={e => e.stopPropagation()}>
            <div style={{ fontSize:36, marginBottom:12 }}>🗑️</div>
            <div className="dpr-confirm-title">Delete this row?</div>
            <div className="dpr-confirm-sub">This action cannot be undone.</div>
            <div className="dpr-confirm-actions">
              <button className="dpr-btn dpr-btn-ghost"  onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="dpr-btn dpr-btn-danger" onClick={() => handleDelete(deleteId)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ STYLES ══ */}
      <style>{`
        .dpr-page {
          width:100%; display:flex; flex-direction:column; gap:24px;
          font-family:'Inter',sans-serif; position:relative;
        }

        /* TOAST */
        .dpr-toast {
          position:fixed; top:20px; right:20px; z-index:9999;
          display:flex; align-items:center; gap:8px;
          padding:10px 18px; border-radius:10px;
          font-size:13px; font-weight:600;
          box-shadow:0 8px 24px rgba(0,0,0,.12);
          animation:dprToastIn .3s ease;
        }
        .dpr-toast--success{background:#dcfce7;border:1px solid #86efac;color:#166534}
        .dpr-toast--error  {background:#fee2e2;border:1px solid #fca5a5;color:#991b1b}
        @keyframes dprToastIn{from{transform:translateX(110%);opacity:0}to{transform:translateX(0);opacity:1}}

        /* PAGE HEADER */
        .dpr-page-header{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px}
        .dpr-header-left{display:flex;flex-direction:column;gap:2px}
        .dpr-section-title{font-size:20px;font-weight:700;color:#1e293b;border-left:4px solid #2563eb;padding-left:12px;margin:0}
        .dpr-section-sub{font-size:12px;color:#94a3b8;padding-left:16px;margin:0}
        .dpr-header-right{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
        .dpr-date-pill{display:flex;align-items:center;gap:6px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:7px 12px;color:#64748b;font-size:13px;box-shadow:0 1px 3px rgba(0,0,0,.04)}
        .dpr-date-input{background:none;border:none;outline:none;color:#334155;font-size:13px;cursor:pointer;font-family:'Inter',sans-serif}

        /* EXPORT GROUP */
        .dpr-export-group{display:flex;gap:6px;align-items:center;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:10px;padding:4px}
        .dpr-btn-export-dpr{background:#2563eb;color:#fff;box-shadow:0 2px 8px rgba(37,99,235,.25);font-size:12px;padding:7px 14px;border-radius:7px;display:inline-flex;align-items:center;gap:6px;border:none;cursor:pointer;font-weight:600;font-family:'Inter',sans-serif;white-space:nowrap;transition:all .2s}
        .dpr-btn-export-dpr:hover:not(:disabled){background:#1d4ed8}
        .dpr-btn-export-dpr:disabled{opacity:.5;cursor:not-allowed}
        .dpr-btn-export-dp{background:#fff;color:#374151;border:1px solid #d1d5db;font-size:12px;padding:7px 14px;border-radius:7px;display:inline-flex;align-items:center;gap:6px;cursor:pointer;font-weight:600;font-family:'Inter',sans-serif;white-space:nowrap;transition:all .2s}
        .dpr-btn-export-dp:hover:not(:disabled){background:#f9fafb;border-color:#9ca3af}
        .dpr-btn-export-dp:disabled{opacity:.5;cursor:not-allowed}

        /* BUTTONS */
        .dpr-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:8px;border:none;font-size:13px;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif;transition:all .2s;white-space:nowrap}
        .dpr-btn:disabled{opacity:.5;cursor:not-allowed}
        .dpr-btn-ghost  {background:#f8fafc;color:#64748b;border:1px solid #e2e8f0}
        .dpr-btn-ghost:hover:not(:disabled){background:#f1f5f9;color:#334155}
        .dpr-btn-outline{background:#eff6ff;color:#2563eb;border:1px solid #bfdbfe}
        .dpr-btn-outline:hover:not(:disabled){background:#dbeafe}
        .dpr-btn-primary{background:#2563eb;color:#fff;box-shadow:0 4px 12px rgba(37,99,235,.2)}
        .dpr-btn-primary:hover:not(:disabled){background:#1d4ed8}
        .dpr-btn-danger {background:#ef4444;color:#fff}
        .dpr-btn-danger:hover{background:#dc2626}

        /* SPINNER */
        .dpr-spin{display:inline-block;width:13px;height:13px;border:2px solid rgba(255,255,255,.35);border-top-color:#fff;border-radius:50%;animation:dprSpin .6s linear infinite}
        .dpr-spin-dark{border-color:rgba(0,0,0,.12);border-top-color:#374151}
        .dpr-spin-lg{width:30px;height:30px;border-width:3px;border-color:#e2e8f0;border-top-color:#2563eb}
        @keyframes dprSpin{to{transform:rotate(360deg)}}

        /* STAT CARDS */
        .dpr-stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px}
        .dpr-stat-card{position:relative;overflow:hidden;cursor:default!important}
        .dpr-stat-icon{font-size:26px;margin-bottom:6px}
        .dpr-stat-label{font-size:13px;color:#64748b;margin:0 0 4px;font-weight:500}
        .dpr-stat-value{font-size:28px;font-weight:800;margin:0 0 2px}
        .dpr-stat-sub  {font-size:11px;color:#94a3b8}
        .dpr-stat-bar  {position:absolute;bottom:0;left:0;height:4px;border-radius:0 2px 0 0;transition:width .8s cubic-bezier(.22,1,.36,1)}

        /* HOURS BANNER */
        .dpr-hours-banner{display:flex;align-items:center;gap:10px;flex-wrap:wrap;background:linear-gradient(135deg,#eff6ff,#dbeafe);border:1px solid #bfdbfe;border-radius:12px;padding:14px 18px;box-shadow:0 1px 4px rgba(37,99,235,.08)}
        .dpr-hours-label{font-size:13px;font-weight:600;color:#1e40af}
        .dpr-hours-value{font-size:22px;font-weight:800;color:#1d4ed8;letter-spacing:-.5px}
        .dpr-hours-note {font-size:11px;color:#64748b;margin-left:auto;font-style:italic}

        /* SPECIAL NOTE */
        .dpr-note-section{background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:16px 18px;display:flex;flex-direction:column;gap:10px}
        .dpr-note-header{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
        .dpr-note-icon  {font-size:16px}
        .dpr-note-title {font-size:14px;font-weight:700;color:#92400e}
        .dpr-note-hint  {font-size:11px;color:#b45309;margin-left:auto;font-style:italic}
        .dpr-note-input {width:100%;border:1px solid #fde68a;background:#fff;border-radius:8px;padding:10px 14px;font-size:13px;color:#334155;font-family:'Inter',sans-serif;outline:none;resize:vertical;min-height:56px;transition:border-color .2s,box-shadow .2s;box-sizing:border-box}
        .dpr-note-input:focus{border-color:#f59e0b;box-shadow:0 0 0 3px rgba(245,158,11,.12)}
        .dpr-note-input::placeholder{color:#d97706;opacity:.65}

        /* DATE CHIPS */
        .dpr-date-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
        .dpr-date-row-label{font-size:12px;font-weight:600;color:#94a3b8;white-space:nowrap}
        .dpr-date-chips{display:flex;gap:6px;flex-wrap:wrap}
        .dpr-date-chip{padding:4px 12px;border-radius:20px;background:#f8fafc;border:1px solid #e2e8f0;color:#64748b;font-size:12px;font-weight:600;cursor:pointer;transition:all .15s;font-family:'Inter',sans-serif}
        .dpr-date-chip:hover{background:#eff6ff;border-color:#bfdbfe;color:#2563eb}
        .dpr-date-chip-active{background:#2563eb!important;border-color:#2563eb!important;color:#fff!important}

        /* FILTER BAR */
        .dpr-filterbar{display:flex;align-items:center;gap:12px;flex-wrap:wrap;background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:12px 16px;box-shadow:0 1px 3px rgba(0,0,0,.04)}
        .dpr-search-box{display:flex;align-items:center;gap:8px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:8px 12px;flex:1;min-width:180px;color:#94a3b8;transition:border-color .2s,box-shadow .2s}
        .dpr-search-box:focus-within{border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,.1)}
        .dpr-search-input{background:none;border:none;outline:none;flex:1;font-size:13px;color:#334155;font-family:'Inter',sans-serif}
        .dpr-search-input::placeholder{color:#94a3b8}
        .dpr-search-clear{background:none;border:none;cursor:pointer;color:#94a3b8;display:flex;padding:1px;transition:color .15s}
        .dpr-search-clear:hover{color:#64748b}
        .dpr-chip-group{display:flex;gap:6px;flex-wrap:wrap}
        .dpr-filter-chip{padding:4px 12px;border-radius:20px;border:1px solid #e2e8f0;background:#f8fafc;color:#64748b;font-size:11px;font-weight:600;cursor:pointer;transition:all .15s;font-family:'Inter',sans-serif}
        .dpr-filter-chip:hover{border-color:#93c5fd;color:#2563eb;background:#eff6ff}
        .dpr-chip-active{background:#2563eb!important;border-color:#2563eb!important;color:#fff!important}
        .dpr-result-count{margin-left:auto;font-size:12px;color:#94a3b8;white-space:nowrap}

        /* TABLE */
        .dpr-table-card{padding:0!important;overflow:hidden}
        .dpr-table-scroll{overflow-x:auto}
        .dpr-state-box{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:80px 20px;color:#94a3b8}
        .dpr-state-title{font-size:15px;font-weight:600;color:#64748b}
        .dpr-state-text {font-size:14px;color:#94a3b8}
        .dpr-state-sub  {font-size:13px;color:#94a3b8}
        .dpr-table{width:100%;border-collapse:collapse;font-size:13px}
        .dpr-table thead tr{border-bottom:2px solid #f1f5f9}
        .dpr-table th{padding:13px 14px;text-align:left;font-size:11px;font-weight:700;color:#94a3b8;letter-spacing:.07em;text-transform:uppercase;white-space:nowrap;background:#f8fafc}
        .dpr-tr{border-bottom:1px solid #f1f5f9;transition:background .12s}
        .dpr-tr:last-child{border-bottom:none}
        .dpr-tr:hover{background:#f8fafc}
        .dpr-table td{padding:12px 14px;vertical-align:middle;color:#334155}
        .dpr-td-sr    {color:#94a3b8;font-weight:700;font-size:12px}
        .dpr-td-c     {text-align:center;color:#64748b}
        .dpr-td-driver{font-weight:600;color:#1e293b}
        .dpr-td-wrap  {max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#64748b}
        .dpr-td-loc   {max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#64748b;font-size:12px}
        .dpr-td-time  {white-space:nowrap;font-size:12px;color:#f59e0b;font-weight:700}
        .dpr-cancelled-time{color:#dc2626;font-weight:800}
        .dpr-td-rem   {font-size:12px;color:#94a3b8;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .dpr-vehicle-tag{background:#eff6ff;color:#2563eb;padding:3px 8px;border-radius:6px;font-weight:700;font-size:11px;letter-spacing:.04em;white-space:nowrap}
        .dpr-badge{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:20px;font-size:10px;font-weight:800;letter-spacing:.05em;white-space:nowrap;max-width:160px;overflow:hidden;text-overflow:ellipsis}
        .dpr-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0}
        .dpr-del-btn{background:none;border:none;cursor:pointer;color:#cbd5e1;padding:5px;border-radius:6px;display:flex;transition:all .15s}
        .dpr-del-btn:hover{background:#fee2e2;color:#ef4444}
        /* ✅ EDIT BUTTON CSS */
        .dpr-edit-btn{background:none;border:none;cursor:pointer;color:#cbd5e1;padding:5px;border-radius:6px;display:flex;transition:all .15s}
        .dpr-edit-btn:hover{background:#eff6ff;color:#2563eb}

        /* MODAL */
        .dpr-overlay{position:fixed;inset:0;background:rgba(15,23,42,.5);backdrop-filter:blur(4px);z-index:500;display:flex;align-items:center;justify-content:center;padding:16px}
        .dpr-modal{background:#fff;border-radius:16px;border:1px solid #e2e8f0;width:100%;max-width:740px;max-height:90vh;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,.18);animation:dprModalIn .22s cubic-bezier(.22,1,.36,1)}
        @keyframes dprModalIn{from{opacity:0;transform:scale(.95) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}
        .dpr-modal-hd{display:flex;justify-content:space-between;align-items:center;padding:18px 22px;border-bottom:1px solid #f1f5f9}
        .dpr-modal-title{font-size:16px;font-weight:700;color:#1e293b}
        .dpr-modal-x{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:5px;cursor:pointer;color:#64748b;display:flex;transition:all .15s}
        .dpr-modal-x:hover{background:#f1f5f9;color:#1e293b}
        .dpr-modal-bd{padding:22px;overflow-y:auto;flex:1}
        .dpr-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
        .dpr-field{display:flex;flex-direction:column;gap:5px}
        .dpr-field-full {grid-column:1/-1}
        .dpr-field-other{grid-column:1/-1;background:#fff7ed;border:1px dashed #fb923c;border-radius:8px;padding:12px 14px}
        .dpr-label{font-size:11px;font-weight:700;color:#94a3b8;letter-spacing:.06em;text-transform:uppercase;display:flex;align-items:center;gap:4px}
        .dpr-label-req     {color:#ef4444}
        .dpr-label-role    {font-size:10px;color:#94a3b8;font-weight:400;text-transform:none;letter-spacing:0}
        .dpr-input{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:9px 12px;color:#334155;font-size:13px;font-family:'Inter',sans-serif;outline:none;transition:border-color .15s,box-shadow .15s;width:100%;box-sizing:border-box}
        .dpr-input:focus{border-color:#2563eb;background:#fff;box-shadow:0 0 0 3px rgba(37,99,235,.1)}
        .dpr-select{cursor:pointer}
        .dpr-input-other{border-color:#fb923c;background:#fff}
        .dpr-input-other:focus{border-color:#ea580c;box-shadow:0 0 0 3px rgba(249,115,22,.12)}
        .dpr-field-hint{font-size:11px;color:#9a3412;font-style:italic}
        .dpr-modal-ft{display:flex;justify-content:flex-end;gap:10px;padding:14px 22px;border-top:1px solid #f1f5f9}

        /* MULTI-SELECT DROPDOWN */
        .msd-wrap{position:relative;width:100%}
        .msd-trigger{display:flex!important;align-items:center;justify-content:space-between;cursor:pointer;text-align:left;gap:8px}
        .msd-trigger.msd-open{border-color:#2563eb;background:#fff;box-shadow:0 0 0 3px rgba(37,99,235,.1)}
        .msd-display{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;color:#334155}
        .msd-placeholder{color:#94a3b8}
        .msd-dropdown{position:absolute;top:calc(100% + 4px);left:0;right:0;background:#fff;border:1px solid #e2e8f0;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.12);z-index:600;max-height:200px;overflow-y:auto}
        .msd-item{display:flex;align-items:center;gap:10px;padding:9px 14px;cursor:pointer;transition:background .12s}
        .msd-item:hover{background:#f8fafc}
        .msd-checkbox{width:15px;height:15px;accent-color:#2563eb;cursor:pointer;flex-shrink:0}
        .msd-label{font-size:13px;color:#334155;font-family:'Inter',sans-serif}
        .msd-empty{padding:16px;text-align:center;color:#94a3b8;font-size:13px}

        /* CONFIRM */
        .dpr-confirm{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:36px 28px;text-align:center;max-width:340px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.15);animation:dprModalIn .22s cubic-bezier(.22,1,.36,1)}
        .dpr-confirm-title{font-size:17px;font-weight:700;color:#1e293b;margin-bottom:8px}
        .dpr-confirm-sub  {font-size:13px;color:#64748b;margin-bottom:22px}
        .dpr-confirm-actions{display:flex;gap:10px;justify-content:center}

        /* RESPONSIVE */
        @media(max-width:900px){
          .dpr-stats-grid{grid-template-columns:repeat(2,1fr)}
          .dpr-page-header{flex-direction:column;align-items:flex-start}
          .dpr-header-right{width:100%}
        }
        @media(max-width:700px){
          .dpr-export-group{flex-direction:column;width:100%}
          .dpr-btn-export-dpr,.dpr-btn-export-dp{justify-content:center}
        }
        @media(max-width:600px){
          .dpr-stats-grid{grid-template-columns:1fr 1fr;gap:12px}
          .dpr-form-grid {grid-template-columns:1fr}
          .dpr-field-full,.dpr-field-other{grid-column:1}
          .dpr-filterbar {flex-direction:column;align-items:stretch}
          .dpr-search-box{min-width:unset}
          .dpr-result-count{margin-left:0}
          .dpr-btn{font-size:12px;padding:7px 12px}
          .dpr-stat-value{font-size:22px}
          .dpr-hours-note{display:none}
        }
      `}</style>
    </div>
  );
}
