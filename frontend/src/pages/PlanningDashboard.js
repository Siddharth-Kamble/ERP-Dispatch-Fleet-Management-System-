
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  FaPlus, FaArrowLeft, FaEdit, FaTrash, FaHistory,
  FaSave, FaTimes, FaExclamationTriangle,
  FaProjectDiagram, FaTools, FaListAlt, FaHome,
  FaChevronRight, FaSearch, FaCalendarAlt, FaLink,
  FaCheck, FaExclamationCircle, FaClock, FaBan,
  FaDownload, FaUser, FaBuilding, FaChevronDown, FaChevronUp,
  FaBell, FaColumns,
} from "react-icons/fa";
import { FaRegClock } from "react-icons/fa";
import axios from "axios";

const BASE     = process.env.REACT_APP_API_URL || "http://localhost:8080";
const PROJ_API = `${BASE}/projects`;
const PLAN_API = `${BASE}/api/planning`;

const STATUS_OPTIONS = ["NOT STARTED", "IN PROGRESS", "DONE", "ON HOLD", "CANCELLED"];
const DEPARTMENTS    = [
  "PROJECT DEPT", "DESIGN", "PURCHASE", "FACTORY",
  "POWDER COATING", "SITE", "ACCOUNTS", "MD", "OTHER",
];

// Linking trigger types
const LINK_TRIGGER_OPTIONS = [
  { value: "END_TO_START",    label: "When linked item ENDS → this starts" },
  { value: "START_TO_START",  label: "When linked item STARTS → this starts" },
  { value: "MIDDLE_TO_START", label: "When linked item is at MID-POINT → this starts" },
];

const STATUS_META = {
  "DONE":        { bg: "#d1fae5", color: "#065f46", icon: <FaCheck size={9}/> },
  "IN PROGRESS": { bg: "#dbeafe", color: "#1e40af", icon: <FaClock size={9}/> },
  "NOT STARTED": { bg: "#f1f5f9", color: "#475569", icon: <FaRegClock size={9}/> },
  "ON HOLD":     { bg: "#fef9c3", color: "#92400e", icon: <FaExclamationCircle size={9}/> },
  "CANCELLED":   { bg: "#fee2e2", color: "#991b1b", icon: <FaBan size={9}/> },
};

const PROJECT_STATUS_META = {
  "ONGOING":   { bg: "#e0f2fe", color: "#075985" },
  "COMPLETED": { bg: "#d1fae5", color: "#065f46" },
  "DELAYED":   { bg: "#fee2e2", color: "#991b1b" },
  "PLANNED":   { bg: "#f1f5f9", color: "#475569" },
};

const FIELD_LABELS = {
  startDate:    "Start Date",
  endDate:      "End Date",
  lineItemName: "Line Item Name",
  department:   "Department",
  actionPerson: "Assigned Person",
  status:       "Status",
  remark:       "Remark",
  srNo:         "SR No",
};

// ─── Date helpers ────────────────────────────────────────────────────────────
const daysBetween = (a, b) => {
  if (!a || !b) return 0;
  return Math.round((new Date(b) - new Date(a)) / 86400000);
};

const addDaysToDate = (dateStr, days) => {
  if (!dateStr) return dateStr;
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
};

const midDate = (start, end) => {
  if (!start || !end) return null;
  const s = new Date(start), e = new Date(end);
  return new Date((s.getTime() + e.getTime()) / 2).toISOString().split("T")[0];
};

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  }) : "—";

const fmtDateTime = (d) =>
  d ? new Date(d).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }) : "—";

// ─── Nav config ──────────────────────────────────────────────────────────────
const NAV = [
  { key: "home",      icon: FaHome,           label: "Dashboard",      color: "#10b981" },
  { key: "projects",  icon: FaProjectDiagram, label: "Projects",       color: "#3b82f6" },
  { key: "works",     icon: FaTools,          label: "Works",          color: "#8b5cf6" },
  { key: "lineItems", icon: FaListAlt,        label: "Line Items",     color: "#f59e0b" },
  { key: "revisions", icon: FaColumns,        label: "Revisions",      color: "#06b6d4" },
  { key: "history",   icon: FaHistory,        label: "Change History", color: "#ef4444" },
  { key: "notifications", icon: FaBell,       label: "Notifications",  color: "#f97316" },
];

// ─── Download history (enhanced with project + work name header) ──────────────
function downloadHistory(history, title = "Change History", projectName = "", workName = "") {
  if (!history || history.length === 0) { alert("No history to download."); return; }
  const lines = [
    "=".repeat(70),
    `  CHANGE HISTORY REPORT`,
    `  Project  : ${projectName || "—"}`,
    `  Work     : ${workName || "—"}`,
    `  Downloaded: ${fmtDateTime(new Date().toISOString())}`,
    `  Total Changes: ${history.length}`,
    "=".repeat(70), "",
  ];
  history.forEach((h, i) => {
    lines.push(`[${i + 1}] ${h.lineItemName || "Unknown Item"}`);
    lines.push(`    What changed : ${FIELD_LABELS[h.field] || h.field}`);
    lines.push(`    From         : ${h.field?.includes("Date") ? fmt(h.oldValue) : (h.oldValue || "—")}`);
    lines.push(`    To           : ${h.field?.includes("Date") ? fmt(h.newValue) : (h.newValue || "—")}`);
    if (h.field?.includes("Date") && h.oldValue && h.newValue) {
      const diff = daysBetween(h.oldValue, h.newValue);
      if (diff !== 0)
        lines.push(`    Delay        : ${diff > 0 ? `+${diff}` : diff} days ${diff > 0 ? "(delayed)" : "(moved earlier)"}`);
    }
    lines.push(`    Reason       : ${h.reason || "No reason provided"}`);
    lines.push(`    Changed By   : ${h.changedBy || "System"}`);
    lines.push(`    Changed At   : ${fmtDateTime(h.changedAt)}`);
    if (h.cascadedItemNames) lines.push(`    Also affected: ${h.cascadedItemNames}`);
    lines.push("");
  });
  lines.push("=".repeat(70));
  lines.push("End of Report");
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = `history-${Date.now()}.txt`; a.click();
  URL.revokeObjectURL(url);
}

// ─── Download Revisions in horizontal table format ─────────────────────────
function downloadRevisions(history, projectName, workName) {
  if (!history || history.length === 0) { alert("No revisions to download."); return; }

  // Group by lineItemId
  const byItem = {};
  history.forEach(h => {
    const key = h.lineItemId || h.lineItemName;
    if (!byItem[key]) byItem[key] = { name: h.lineItemName, changes: [] };
    byItem[key].changes.push(h);
  });

  const lines = [
    "=".repeat(90),
    `  REVISION HISTORY — HORIZONTAL VIEW`,
    `  Project : ${projectName || "—"}`,
    `  Work    : ${workName || "—"}`,
    `  Downloaded: ${fmtDateTime(new Date().toISOString())}`,
    "=".repeat(90), "",
  ];

  Object.values(byItem).forEach(({ name, changes }) => {
    lines.push(`LINE ITEM: ${name}`);
    lines.push("-".repeat(80));
    changes.forEach((h, i) => {
      lines.push(`  Rev ${i + 1}:`);
      lines.push(`    Field    : ${FIELD_LABELS[h.field] || h.field}`);
      lines.push(`    From     : ${h.field?.includes("Date") ? fmt(h.oldValue) : (h.oldValue || "—")}`);
      lines.push(`    To       : ${h.field?.includes("Date") ? fmt(h.newValue) : (h.newValue || "—")}`);
      if (h.field?.includes("Date") && h.oldValue && h.newValue) {
        const diff = daysBetween(h.oldValue, h.newValue);
        if (diff !== 0)
          lines.push(`    Shift    : ${diff > 0 ? `+${diff}` : diff} days ${diff > 0 ? "(delayed)" : "(earlier)"}`);
      }
      lines.push(`    Reason   : ${h.reason || "—"}`);
      lines.push(`    Changed  : ${fmtDateTime(h.changedAt)} by ${h.changedBy || "System"}`);
      if (h.cascadedItemNames) lines.push(`    Affected : ${h.cascadedItemNames}`);
    });
    lines.push("");
  });
  lines.push("=".repeat(90));
  lines.push("End of Report");
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = `revisions-${Date.now()}.txt`; a.click();
  URL.revokeObjectURL(url);
}

// ═══════════════════════════════════════════════════════════════════════════════
// NOTIFICATION HELPERS
// ═══════════════════════════════════════════════════════════════════════════════
function buildNotifications(lineItems, selProject, selWork) {
  const today = new Date().toISOString().split("T")[0];
  const notifs = [];

  lineItems.forEach(item => {
    const label = `${selProject?.projectName || "?"} → ${selWork?.workName || "?"} → ${item.lineItemName}`;

    // Started today
    if (item.startDate === today && item.status === "IN PROGRESS") {
      notifs.push({ id: `start-${item.id}`, type: "started", label, item, time: item.startDate, msg: "Process started today" });
    }

    // Completed early (endDate in future but status = DONE)
    if (item.status === "DONE" && item.endDate && item.endDate > today) {
      const early = daysBetween(today, item.endDate);
      notifs.push({ id: `early-${item.id}`, type: "early", label, item, time: item.endDate, msg: `Completed ${early} day(s) early 🎉` });
    }

    // Delayed (endDate passed, not done)
    if (item.endDate && item.endDate < today && item.status !== "DONE" && item.status !== "CANCELLED") {
      const delayed = daysBetween(item.endDate, today);
      notifs.push({ id: `delay-${item.id}`, type: "delayed", label, item, time: item.endDate, msg: `Delayed by ${delayed} day(s) ⚠️` });
    }

    // Upcoming start in 3 days
    const daysToStart = daysBetween(today, item.startDate);
    if (daysToStart > 0 && daysToStart <= 3 && item.status === "NOT STARTED") {
      notifs.push({ id: `upcoming-${item.id}`, type: "upcoming", label, item, time: item.startDate, msg: `Starts in ${daysToStart} day(s)` });
    }
  });

  return notifs;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function PlanningDashboard({ onBack }) {
  const [activeNav, setActiveNav] = useState("home");
  const [collapsed, setCollapsed] = useState(false);

  const [projects, setProjects]   = useState([]);
  const [works, setWorks]         = useState([]);
  const [lineItems, setLineItems] = useState([]);
  const [history, setHistory]     = useState([]);
  const [historyTitle, setHistoryTitle] = useState("Change History");

  const [expandedItem, setExpandedItem]   = useState(null);
  const [itemRevisions, setItemRevisions] = useState({});

  const [selProject, setSelProject] = useState(null);
  const [selWork, setSelWork]       = useState(null);

  const [showWorkForm, setShowWorkForm]         = useState(false);
  const [showLineItemForm, setShowLineItemForm] = useState(false);
  const [editingItem, setEditingItem]           = useState(null);

  const [dayModal, setDayModal]   = useState(null);
  const [dayInput, setDayInput]   = useState("");
  const [dayReason, setDayReason] = useState("");

  const [editReasonModal, setEditReasonModal] = useState(null);
  const [editReason, setEditReason]           = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast]           = useState(null);
  const toastTimer                  = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [dismissedNotifs, setDismissedNotifs] = useState(new Set());

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => { loadProjects(); }, []);
  useEffect(() => {
    if (selProject) loadWorks(selProject.projectId);
    else setWorks([]);
  }, [selProject]);
  useEffect(() => {
    if (selWork) loadLineItems(selWork.id);
    else setLineItems([]);
  }, [selWork]);

  // Build notifications whenever line items change
  useEffect(() => {
    if (lineItems.length > 0 && selProject && selWork) {
      setNotifications(buildNotifications(lineItems, selProject, selWork));
    }
  }, [lineItems, selProject, selWork]);

  const showToast = (msg, type = "success") => {
    clearTimeout(toastTimer.current);
    setToast({ msg, type });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  };

  // ── API ────────────────────────────────────────────────────────────────────
  const loadProjects = async () => {
    try {
      const { data } = await axios.get(PROJ_API);
      setProjects(Array.isArray(data) ? data : []);
    } catch { showToast("Failed to load projects", "error"); }
  };

  const loadWorks = async (projectId) => {
    try {
      const { data } = await axios.get(`${PLAN_API}/projects/${projectId}/works`);
      setWorks(data || []);
    } catch { showToast("Failed to load works", "error"); }
  };

  const saveWork = async (form) => {
    try {
      const payload = { ...form, projectId: selProject.projectId };
      if (form.id) await axios.put(`${PLAN_API}/works/${form.id}`, payload);
      else         await axios.post(`${PLAN_API}/works`, payload);
      showToast("Work saved ✓");
      setShowWorkForm(false); setEditingItem(null);
      loadWorks(selProject.projectId);
    } catch { showToast("Failed to save work", "error"); }
  };

  const deleteWork = async (id) => {
    if (!window.confirm("Delete this work and all its line items?")) return;
    try {
      await axios.delete(`${PLAN_API}/works/${id}`);
      showToast("Work deleted");
      loadWorks(selProject.projectId);
    } catch { showToast("Delete failed", "error"); }
  };

  const loadLineItems = async (workId) => {
    try {
      const { data } = await axios.get(`${PLAN_API}/works/${workId}/line-items`);
      setLineItems(data || []);
    } catch { showToast("Failed to load line items", "error"); }
  };

  const loadItemRevisions = async (item) => {
    if (expandedItem === item.id) { setExpandedItem(null); return; }
    setExpandedItem(item.id);
    if (itemRevisions[item.id]) return;
    try {
      const { data } = await axios.get(`${PLAN_API}/line-items/${item.id}/history`);
      const forItem = (data || []).reverse();
      setItemRevisions(prev => ({ ...prev, [item.id]: forItem }));
    } catch { showToast("Failed to load revisions", "error"); }
  };

  const handleLineItemSave = (form) => {
    if (form.id) {
      setShowLineItemForm(false);
      setEditReasonModal({ item: editingItem, newForm: form });
      setEditReason("");
    } else {
      doSaveLineItem(form, null);
    }
  };

  const doSaveLineItem = async (form, reason) => {
    try {
      // Normalize linkedItemIds to string before sending
      const payload = {
        ...form,
        workId: selWork.id,
        linkedItemIds: Array.isArray(form.linkedItemIds)
          ? form.linkedItemIds.map(l => (typeof l === "object" ? `${l.targetId}:${l.trigger}:${l.offsetDays || 0}` : l)).join(",")
          : form.linkedItemIds,
      };

      if (form.id) {
        await axios.put(`${PLAN_API}/line-items/${form.id}`, payload);
        if (reason && editReasonModal?.item) {
          const old = editReasonModal.item;
          // Only track date, status, remark changes in history
          const trackedFields = ["startDate", "endDate", "status", "remark"];
          const changed = [];
          for (const field of trackedFields) {
            const oldVal = old[field]  != null ? String(old[field])  : "";
            const newVal = form[field] != null ? String(form[field]) : "";
            if (oldVal !== newVal) changed.push({ field, oldVal, newVal });
          }
          for (const ch of changed) {
            await axios.post(`${PLAN_API}/history`, {
              workId: selWork.id, lineItemId: form.id,
              lineItemName: form.lineItemName || old.lineItemName,
              field: ch.field, oldValue: ch.oldVal, newValue: ch.newVal,
              reason, changedBy: "User",
            });
          }
          if (changed.length === 0 && reason) {
            await axios.post(`${PLAN_API}/history`, {
              workId: selWork.id, lineItemId: form.id,
              lineItemName: form.lineItemName || old.lineItemName,
              field: "general", oldValue: "", newValue: "",
              reason, changedBy: "User",
            });
          }
        }
      } else {
        await axios.post(`${PLAN_API}/line-items`, payload);
      }
      showToast("Line item saved ✓");
      setShowLineItemForm(false); setEditingItem(null);
      setEditReasonModal(null); setEditReason("");
      setItemRevisions({});
      setExpandedItem(null);
      loadLineItems(selWork.id);
    } catch { showToast("Failed to save line item", "error"); }
  };

  const deleteLineItem = async (id) => {
    if (!window.confirm("Delete this line item?")) return;
    try {
      await axios.delete(`${PLAN_API}/line-items/${id}`);
      showToast("Deleted");
      setItemRevisions(prev => { const n = { ...prev }; delete n[id]; return n; });
      if (expandedItem === id) setExpandedItem(null);
      loadLineItems(selWork.id);
    } catch { showToast("Delete failed", "error"); }
  };

  // ── Day-offset date change ─────────────────────────────────────────────────
  const openDayModal = (item, field) => {
    setDayModal({ item, field });
    setDayInput("");
    setDayReason("");
  };

  const confirmDayChange = async () => {
    const days = parseInt(dayInput, 10);
    if (isNaN(days) || days === 0) { showToast("Enter a valid number of days (non-zero)", "error"); return; }
    if (!dayReason.trim()) { showToast("Please enter a reason", "error"); return; }

    const { item, field } = dayModal;
    const oldVal = item[field];
    if (!oldVal) { showToast("Original date is missing — edit the item first", "error"); return; }
    const newVal = addDaysToDate(oldVal, days);

    // Auto-compute new end date when start date changes (preserve duration)
    let autoEndDate = null;
    if (field === "startDate" && item.endDate) {
      const duration = daysBetween(item.startDate, item.endDate);
      autoEndDate = addDaysToDate(newVal, duration);
    }

    try {
      const res = await axios.put(`${PLAN_API}/line-items/${item.id}/change-date`, {
        field,
        oldValue:  oldVal,
        newValue:  newVal,
        reason:    dayReason,
        cascade:   Math.abs(days) >= 2,
        changedBy: "User",
      });

      // If startDate changed, also update endDate with same reason
      if (field === "startDate" && autoEndDate && autoEndDate !== item.endDate) {
        await axios.put(`${PLAN_API}/line-items/${item.id}/change-date`, {
          field:     "endDate",
          oldValue:  item.endDate,
          newValue:  autoEndDate,
          reason:    `Auto-adjusted: same shift as Start Date — ${dayReason}`,
          cascade:   false,
          changedBy: "System (auto)",
        });
      }

      const cascaded = res.data?.cascadedItems || [];
      let msg = `Date shifted by ${days > 0 ? "+" : ""}${days} days ✓`;
      if (autoEndDate && field === "startDate") msg += ` · End Date auto-adjusted`;
      if (cascaded.length > 0) msg += ` · Also shifted: ${cascaded.join(", ")}`;
      showToast(msg);

      setDayModal(null); setDayInput(""); setDayReason("");
      setItemRevisions({});
      setExpandedItem(null);
      loadLineItems(selWork.id);
    } catch { showToast("Failed to update date", "error"); }
  };

  const loadHistory = async (type, id, title) => {
    try {
      const url = type === "project"
        ? `${PLAN_API}/projects/${id}/history`
        : `${PLAN_API}/works/${id}/history`;
      const { data } = await axios.get(url);
      setHistory(data || []);
      setHistoryTitle(title || "Change History");
      setActiveNav("history");
    } catch { showToast("Failed to load history", "error"); }
  };

  const loadRevisions = async () => {
    if (!selWork) return;
    try {
      const { data } = await axios.get(`${PLAN_API}/works/${selWork.id}/history`);
      setHistory(data || []);
      setActiveNav("revisions");
    } catch { showToast("Failed to load revisions", "error"); }
  };

  const goToWorks     = (project) => { setSelProject(project); setSelWork(null); setActiveNav("works"); };
  const goToLineItems = (work)    => { setSelWork(work); setActiveNav("lineItems"); };

  const filteredProjects = projects.filter(p =>
    !searchTerm ||
    p.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.projectCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.clientName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const doneCount       = lineItems.filter(i => i.status === "DONE").length;
  const inProgressCount = lineItems.filter(i => i.status === "IN PROGRESS").length;
  const overdueCount    = lineItems.filter(i => {
    const today = new Date().toISOString().split("T")[0];
    return i.endDate && i.endDate < today && i.status !== "DONE" && i.status !== "CANCELLED";
  }).length;

  const activeNotifs = notifications.filter(n => !dismissedNotifs.has(n.id));

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div style={S.shell}>

      {/* ── SIDEBAR ── */}
      <aside style={{ ...S.sidebar, width: collapsed ? 60 : 224 }}>
        <div style={S.sideTop}>
          {!collapsed && (
            <div style={S.brandBlock}>
              <span style={S.brandIcon}>📅</span>
              <span style={S.brandText}>Planning ERP</span>
            </div>
          )}
          <button style={S.collapseBtn} onClick={() => setCollapsed(v => !v)}>
            {collapsed ? "▶" : "◀"}
          </button>
        </div>

        <nav style={{ flex: 1, padding: "6px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map(({ key, icon: Icon, label, color }) => {
            const active = activeNav === key;
            const badge = key === "notifications" ? activeNotifs.length
                        : key === "history"       ? history.length
                        : 0;
            return (
              <button key={key} onClick={() => setActiveNav(key)}
                style={{
                  ...S.navItem,
                  background: active ? color + "22" : "transparent",
                  color:      active ? color : "#8892a4",
                  borderLeft: active ? `3px solid ${color}` : "3px solid transparent",
                }}>
                <Icon size={14} style={{ flexShrink: 0 }} />
                {!collapsed && <span style={S.navLabel}>{label}</span>}
                {!collapsed && badge > 0 && (
                  <span style={{ marginLeft: "auto", background: key === "notifications" ? "#f97316" : "#ef4444", color: "#fff", borderRadius: 99, padding: "1px 6px", fontSize: 10, fontWeight: 700 }}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {!collapsed && (selProject || selWork) && (
          <div style={S.sideContext}>
            {selProject && (
              <div style={S.sideCtxItem}>
                <FaBuilding size={9} style={{ color: "#10b981", flexShrink: 0 }} />
                <span style={{ fontSize: 10, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {selProject.projectName}
                </span>
              </div>
            )}
            {selWork && (
              <div style={S.sideCtxItem}>
                <FaTools size={9} style={{ color: "#8b5cf6", flexShrink: 0 }} />
                <span style={{ fontSize: 10, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {selWork.workName}
                </span>
              </div>
            )}
          </div>
        )}

        {!collapsed && onBack && (
          <button style={S.sideBack} onClick={onBack}>
            <FaArrowLeft size={11} /> Back to App
          </button>
        )}
      </aside>

      {/* ── MAIN ── */}
      <main style={S.main}>
        {toast && (
          <div style={{
            ...S.toast,
            background: toast.type === "success" ? "#ecfdf5" : "#fef2f2",
            borderLeft: `4px solid ${toast.type === "success" ? "#10b981" : "#ef4444"}`,
            color:      toast.type === "success" ? "#065f46" : "#991b1b",
          }}>
            {toast.type === "success" ? "✓" : "✕"} {toast.msg}
          </div>
        )}

        {/* ══ HOME ══ */}
        {activeNav === "home" && (
          <div>
            <PageHeader title="Planning Dashboard" subtitle="Track works, line items and all changes in one place" />
            <div style={S.kpiRow}>
              <KpiCard label="Total Projects" value={projects.length}   icon="🏗️" color="#10b981" onClick={() => setActiveNav("projects")} />
              <KpiCard label="Works"          value={works.length}      icon="🔧" color="#3b82f6" sub={selProject ? selProject.projectName : "Select a project"} onClick={() => setActiveNav("works")} />
              <KpiCard label="Line Items"     value={lineItems.length}  icon="📋" color="#8b5cf6" sub={selWork ? selWork.workName : "Select a work"} onClick={() => setActiveNav("lineItems")} />
              <KpiCard label="Completed"      value={doneCount}         icon="✅" color="#059669" sub={`of ${lineItems.length} items`} />
              <KpiCard label="In Progress"    value={inProgressCount}   icon="🔄" color="#f59e0b" />
              <KpiCard label="Overdue"        value={overdueCount}      icon="⚠️" color="#ef4444" />
              <KpiCard label="Notifications"  value={activeNotifs.length} icon="🔔" color="#f97316" onClick={() => setActiveNav("notifications")} />
            </div>

            {/* Quick notifications banner */}
            {activeNotifs.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <SectionTitle>🔔 Active Alerts</SectionTitle>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {activeNotifs.slice(0, 5).map(n => (
                    <NotifBanner key={n.id} n={n} onDismiss={() => setDismissedNotifs(s => new Set([...s, n.id]))} />
                  ))}
                  {activeNotifs.length > 5 && (
                    <button style={S.viewAllBtn} onClick={() => setActiveNav("notifications")}>
                      View all {activeNotifs.length} notifications →
                    </button>
                  )}
                </div>
              </div>
            )}

            {projects.length > 0 && (
              <div>
                <SectionTitle>Recent Projects</SectionTitle>
                <div style={S.cardGrid}>
                  {projects.slice(0, 4).map(p => (
                    <ProjectCard key={p.projectId} p={p}
                      onOpen={() => goToWorks(p)}
                      onHistory={() => loadHistory("project", p.projectId, `Project: ${p.projectName}`)} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ PROJECTS ══ */}
        {activeNav === "projects" && (
          <div>
            <PageHeader title="🏗️ Projects" subtitle="Select a project to manage its work schedules" />
            <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search by name, code, or client…" />
            <div style={S.cardGrid}>
              {filteredProjects.length === 0 && <EmptyState msg="No projects found." />}
              {filteredProjects.map(p => (
                <ProjectCard key={p.projectId} p={p}
                  onOpen={() => goToWorks(p)}
                  onHistory={() => loadHistory("project", p.projectId, `Project: ${p.projectName}`)} />
              ))}
            </div>
          </div>
        )}

        {/* ══ WORKS ══ */}
        {activeNav === "works" && (
          <div>
            <Breadcrumb parts={[
              { label: "Projects", onClick: () => setActiveNav("projects") },
              selProject ? { label: selProject.projectName } : null,
            ].filter(Boolean)} />
            <PageHeader title="🔧 Works"
              subtitle={selProject ? `${selProject.projectName} — ${selProject.projectCode}` : "Select a project first"}>
              {selProject && (
                <PrimaryBtn icon={<FaPlus size={11}/>} label="New Work"
                  onClick={() => { setEditingItem(null); setShowWorkForm(true); }} />
              )}
            </PageHeader>
            {!selProject ? (
              <div style={S.cardGrid}>
                {projects.map(p => (
                  <ProjectCard key={p.projectId} p={p}
                    onOpen={() => setSelProject(p)}
                    onHistory={() => loadHistory("project", p.projectId, `Project: ${p.projectName}`)} />
                ))}
              </div>
            ) : (
              <div style={S.cardGrid}>
                {works.length === 0 && <EmptyState msg='No works yet. Click "New Work" to create the first one.' />}
                {works.map(w => (
                  <WorkCard key={w.id} w={w}
                    onOpen={() => goToLineItems(w)}
                    onEdit={() => { setEditingItem(w); setShowWorkForm(true); }}
                    onDelete={() => deleteWork(w.id)}
                    onHistory={() => loadHistory("work", w.id, `Work: ${w.workName}`)} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ LINE ITEMS ══ */}
        {activeNav === "lineItems" && (
          <div>
            <Breadcrumb parts={[
              { label: "Projects", onClick: () => setActiveNav("projects") },
              selProject ? { label: selProject.projectName, onClick: () => setActiveNav("works") } : null,
              selWork    ? { label: selWork.workName } : null,
            ].filter(Boolean)} />
            <PageHeader
              title={`📋 ${selWork?.workName || "Line Items"}`}
              subtitle={selWork ? `Work Order: ${selWork.workOrderNo}  ·  ${selProject?.projectName}` : "Select a work first"}>
              <div style={{ display: "flex", gap: 8 }}>
                {selWork && (
                  <>
                    <SecondaryBtn icon={<FaColumns size={11}/>} label="Revisions"
                      onClick={loadRevisions} />
                    <SecondaryBtn icon={<FaHistory size={11}/>} label="Full History"
                      onClick={() => loadHistory("work", selWork.id, `Work: ${selWork.workName}`)} />
                    <PrimaryBtn icon={<FaPlus size={11}/>} label="Add Line Item"
                      onClick={() => { setEditingItem(null); setShowLineItemForm(true); }} />
                  </>
                )}
              </div>
            </PageHeader>

            {!selWork ? (
              <div style={{ color: "#64748b", textAlign: "center", padding: 60, fontSize: 14 }}>
                Please select a Work from the Works tab first.
              </div>
            ) : (
              <>
                <div style={S.lineItemStrip}>
                  {Object.entries(STATUS_META).map(([status, meta]) => {
                    const count = lineItems.filter(i => i.status === status).length;
                    return (
                      <div key={status} style={{ ...S.stripPill, background: meta.bg, color: meta.color }}>
                        {meta.icon} <span style={{ marginLeft: 5 }}>{status}: {count}</span>
                      </div>
                    );
                  })}
                </div>

                <div style={S.infoBanner}>
                  <span style={{ fontSize: 15 }}>💡</span>
                  <span>
                    Use <strong>± Days</strong> on Start/End date to shift with reason tracking.
                    When <strong>Start Date shifts</strong>, End Date auto-adjusts to preserve duration.
                    Click row name to view per-item revisions. Linked items cascade automatically (≥2 days).
                  </span>
                </div>

                <div style={S.tableWrap}>
                  <table style={S.table}>
                    <thead>
                      <tr style={S.thead}>
                        {["SR","Line Item","Start Date","End Date","Days","Department","Assigned To","Status","Remark","Links","Revs","Actions"].map(h =>
                          <th key={h} style={S.th}>{h}</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.length === 0 && (
                        <tr><td colSpan={12} style={{ textAlign: "center", padding: 48, color: "#94a3b8", fontSize: 13 }}>
                          No line items yet. Click "Add Line Item" to start.
                        </td></tr>
                      )}
                      {lineItems.map((item, idx) => {
                        const days    = daysBetween(item.startDate, item.endDate);
                        const today   = new Date().toISOString().split("T")[0];
                        const overdue = item.endDate && item.endDate < today
                          && item.status !== "DONE" && item.status !== "CANCELLED";
                        const isExpanded = expandedItem === item.id;
                        const revs = itemRevisions[item.id] || [];
                        const dateRevCount = revs.filter(h => h.field === "startDate" || h.field === "endDate").length;

                        // Parse linked items count from structured format
                        const linkedCount = (item.linkedItemIds || "").split(",").filter(Boolean).length;

                        return (
                          <React.Fragment key={item.id}>
                            <tr style={{
                              ...S.tr,
                              background: overdue ? "#fff5f5" : idx % 2 === 0 ? "#fff" : "#fafafa",
                              cursor: "pointer",
                            }}>
                              <td style={{ ...S.td, color: "#94a3b8", width: 40, textAlign: "center" }}>{item.srNo}</td>

                              <td style={{ ...S.td, fontWeight: 600, color: "#1e293b", minWidth: 180 }}
                                onClick={() => loadItemRevisions(item)}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  {overdue && <FaExclamationTriangle size={10} color="#ef4444" />}
                                  <span>{item.lineItemName}</span>
                                  {isExpanded ? <FaChevronUp size={9} color="#94a3b8"/> : <FaChevronDown size={9} color="#94a3b8"/>}
                                </div>
                              </td>

                              <td style={S.td}>
                                <DateShiftCell value={item.startDate} onShift={() => openDayModal(item, "startDate")} />
                              </td>

                              <td style={S.td}>
                                <DateShiftCell value={item.endDate} onShift={() => openDayModal(item, "endDate")} />
                              </td>

                              <td style={{ ...S.td, textAlign: "center", fontWeight: 700,
                                color: days > 14 ? "#dc2626" : days > 7 ? "#d97706" : "#059669" }}>
                                {days}d
                              </td>

                              <td style={S.td}>
                                {item.department
                                  ? <span style={S.deptTag}>{item.department}</span>
                                  : <span style={{ color: "#cbd5e1" }}>—</span>}
                              </td>

                              <td style={S.td}>
                                {item.actionPerson
                                  ? <div style={S.personTag}><FaUser size={8}/> {item.actionPerson}</div>
                                  : <span style={{ color: "#cbd5e1" }}>—</span>}
                              </td>

                              <td style={S.td}><StatusBadge status={item.status} /></td>

                              <td style={{ ...S.td, color: "#64748b", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 12 }}>
                                {item.remark || <span style={{ color: "#cbd5e1" }}>—</span>}
                              </td>

                              <td style={{ ...S.td, textAlign: "center" }}>
                                {linkedCount > 0
                                  ? <span style={S.linkPill}><FaLink size={8}/> {linkedCount}</span>
                                  : <span style={{ color: "#e2e8f0" }}>—</span>}
                              </td>

                              <td style={{ ...S.td, textAlign: "center" }}>
                                <button
                                  onClick={() => loadItemRevisions(item)}
                                  style={{
                                    background: dateRevCount > 0 ? "#fff7ed" : "#f8fafc",
                                    border: `1px solid ${dateRevCount > 0 ? "#fdba74" : "#e2e8f0"}`,
                                    color: dateRevCount > 0 ? "#c2410c" : "#94a3b8",
                                    borderRadius: 99, padding: "3px 9px",
                                    fontSize: 11, fontWeight: 700, cursor: "pointer",
                                    display: "inline-flex", alignItems: "center", gap: 4,
                                  }}>
                                  <FaHistory size={8}/>
                                  {isExpanded ? "Close" : dateRevCount > 0 ? `Rev ${dateRevCount}` : "0"}
                                </button>
                              </td>

                              <td style={S.td}>
                                <div style={{ display: "flex", gap: 4 }}>
                                  <ActionBtn color="#2563eb" title="Edit"
                                    onClick={() => { setEditingItem(item); setShowLineItemForm(true); }}>
                                    <FaEdit size={11}/>
                                  </ActionBtn>
                                  <ActionBtn color="#ef4444" title="Delete" onClick={() => deleteLineItem(item.id)}>
                                    <FaTrash size={11}/>
                                  </ActionBtn>
                                </div>
                              </td>
                            </tr>

                            {isExpanded && (
                              <tr>
                                <td colSpan={12} style={{ padding: 0, background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                                  <RevisionPanel item={item} revisions={revs} />
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* ══ REVISIONS PAGE (Horizontal Columns) ══ */}
        {activeNav === "revisions" && (
          <RevisionsPage
            history={history}
            lineItems={lineItems}
            selProject={selProject}
            selWork={selWork}
            onDownload={() => downloadRevisions(history, selProject?.projectName, selWork?.workName)}
          />
        )}

        {/* ══ HISTORY ══ */}
        {activeNav === "history" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 21, fontWeight: 700, color: "#1e293b", borderLeft: "4px solid #ef4444", paddingLeft: 12 }}>
                  📊 Change History
                </h2>
                <p style={{ margin: "4px 0 0 16px", fontSize: 12, color: "#94a3b8" }}>{historyTitle}</p>
              </div>
              {history.length > 0 && (
                <button onClick={() => downloadHistory(history, historyTitle, selProject?.projectName, selWork?.workName)}
                  style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px",
                    background: "#1e293b", color: "#fff", border: "none", borderRadius: 8,
                    fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  <FaDownload size={12}/> Download History
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <EmptyState msg="No change history yet. Every date change or edit will appear here with the reason." />
            ) : (
              <>
                <div style={S.histSummary}>
                  <div style={S.histSumItem}>
                    <span style={{ fontSize: 22, fontWeight: 800, color: "#1e293b" }}>{history.length}</span>
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>Total Changes</span>
                  </div>
                  <div style={S.histSumItem}>
                    <span style={{ fontSize: 22, fontWeight: 800, color: "#f59e0b" }}>
                      {history.filter(h => h.cascadedItemNames).length}
                    </span>
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>With Cascade</span>
                  </div>
                  <div style={S.histSumItem}>
                    <span style={{ fontSize: 22, fontWeight: 800, color: "#ef4444" }}>
                      {history.filter(h => h.field?.includes("Date") && daysBetween(h.oldValue, h.newValue) > 0).length}
                    </span>
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>Date Delays</span>
                  </div>
                  <div style={S.histSumItem}>
                    <span style={{ fontSize: 22, fontWeight: 800, color: "#8b5cf6" }}>
                      {[...new Set(history.map(h => h.changedBy).filter(Boolean))].length}
                    </span>
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>Contributors</span>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {history.map((h, i) => <HistoryCard key={i} h={h} index={i + 1} />)}
                </div>
              </>
            )}
          </div>
        )}

        {/* ══ NOTIFICATIONS ══ */}
        {activeNav === "notifications" && (
          <NotificationsPage
            notifications={activeNotifs}
            dismissed={dismissedNotifs}
            onDismiss={(id) => setDismissedNotifs(s => new Set([...s, id]))}
            onDismissAll={() => setDismissedNotifs(new Set(notifications.map(n => n.id)))}
          />
        )}
      </main>

      {/* ══ MODALS ══ */}
      {showWorkForm && (
        <Modal title={editingItem ? "Edit Work" : "New Work"} onClose={() => { setShowWorkForm(false); setEditingItem(null); }}>
          <WorkForm
            initial={editingItem}
            projects={projects}
            selectedProject={selProject}
            onProjectSelect={p => setSelProject(p)}
            onSave={saveWork}
            onCancel={() => { setShowWorkForm(false); setEditingItem(null); }} />
        </Modal>
      )}

      {showLineItemForm && (
        <Modal
          title={editingItem ? "Edit Line Item" : "Add Line Item"}
          onClose={() => { setShowLineItemForm(false); setEditingItem(null); }}
          wide>
          <LineItemForm
            initial={editingItem}
            existingItems={lineItems}
            onSave={handleLineItemSave}
            onCancel={() => { setShowLineItemForm(false); setEditingItem(null); }} />
        </Modal>
      )}

      {editReasonModal && (
        <Modal title="✏️ Reason for Edit" onClose={() => { setEditReasonModal(null); setEditReason(""); }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 10, padding: 14, fontSize: 13 }}>
              <div style={{ fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>{editReasonModal.item?.lineItemName}</div>
              <div style={{ color: "#0369a1", fontSize: 12 }}>
                You are editing this line item. Describe why this change is needed.
                <br/>
                <strong>Note:</strong> Linking changes are not tracked in history — only date, status, and remark changes.
              </div>
            </div>
            <div>
              <label style={S.lbl}>Reason for Edit <span style={{ color: "#ef4444" }}>*</span></label>
              <textarea value={editReason} onChange={e => setEditReason(e.target.value)}
                placeholder="e.g. Client changed design, department reassigned, status updated after site visit…"
                style={{ ...S.input, height: 88, resize: "vertical" }} autoFocus />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button style={S.cancelBtn} onClick={() => { setEditReasonModal(null); setEditReason(""); }}>Cancel</button>
              <button style={S.saveBtn} onClick={() => {
                if (!editReason.trim()) { showToast("Please enter a reason", "error"); return; }
                doSaveLineItem(editReasonModal.newForm, editReason);
              }}>
                <FaSave size={11}/> Save with Reason
              </button>
            </div>
          </div>
        </Modal>
      )}

      {dayModal && (
        <Modal title="📅 Shift Date — Enter Days" onClose={() => setDayModal(null)}>
          <DayOffsetModalContent
            item={dayModal.item}
            field={dayModal.field}
            dayInput={dayInput}
            setDayInput={setDayInput}
            dayReason={dayReason}
            setDayReason={setDayReason}
            onConfirm={confirmDayChange}
            onCancel={() => setDayModal(null)}
            lineItems={lineItems}
          />
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// REVISIONS PAGE — Horizontal Column Layout
// Each line item = one column. Rows = revision number, field, from, to, reason, affected
// ═══════════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════════
// HELPER — parse rich cascade string
// Format: "Name|field|oldValue|newValue;Name2|field|oldValue|newValue"
// Returns: [{ name, field, oldValue, newValue }, ...]
// ═══════════════════════════════════════════════════════════════════════════════
function parseCascadeDetails(raw) {
  if (!raw) return [];

  // Backward-compat: old format was plain "Name1, Name2" (no "|" separators)
  // If no "|" found at all, treat it as legacy plain names only
  if (!raw.includes("|")) {
    return raw.split(",").map(name => ({
      name:     name.trim(),
      field:    null,
      oldValue: null,
      newValue: null,
    })).filter(e => e.name);
  }

  return raw.split(";").map(entry => {
    const parts = entry.split("|");
    return {
      name:     parts[0]?.trim() || "",
      field:    parts[1]?.trim() || "",
      oldValue: parts[2]?.trim() || "",
      newValue: parts[3]?.trim() || "",
    };
  }).filter(e => e.name);
}

// ═══════════════════════════════════════════════════════════════════════════════
// AFFECTED ITEMS CELL
// Shows each affected item with:
//   • Item name
//   • Which field changed (Start Date / End Date)
//   • Old value ~~strikethrough~~ → New value (formatted as dates)
//   • Shift in days pill (+Nd / -Nd)
// ═══════════════════════════════════════════════════════════════════════════════
function AffectedItemsCell({ names }) {
  const details = parseCascadeDetails(names);

  if (details.length === 0) {
    return <span style={{ color: "#cbd5e1", fontSize: 12 }}>None</span>;
  }

  // Group by item name — one item can have both startDate and endDate shifted
  const grouped = {};
  details.forEach(d => {
    if (!grouped[d.name]) grouped[d.name] = [];
    grouped[d.name].push(d);
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 220 }}>
      {Object.entries(grouped).map(([itemName, changes], gi) => (
        <div
          key={gi}
          style={{
            background: "#faf5ff",
            border: "1px solid #ddd6fe",
            borderLeft: "3px solid #7c3aed",
            borderRadius: "0 8px 8px 0",
            padding: "7px 10px",
          }}
        >
          {/* Item name */}
          <div style={{
            fontWeight: 700,
            fontSize: 12,
            color: "#4c1d95",
            marginBottom: 5,
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}>
            🔗 {itemName}
          </div>

          {/* Each field change for this item */}
          {changes.map((ch, ci) => {
            // If legacy (no field info), just show the name — already shown above
            if (!ch.field) return null;

            const isDate = ch.field?.includes("Date") || ch.field?.includes("date");
            const diff   = isDate ? daysBetween(ch.oldValue, ch.newValue) : 0;

            return (
              <div
                key={ci}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                  paddingTop: ci > 0 ? 6 : 0,
                  borderTop: ci > 0 ? "1px dashed #ede9fe" : "none",
                }}
              >
                {/* Field label */}
                <div style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#7c3aed",
                  textTransform: "uppercase",
                  letterSpacing: ".04em",
                }}>
                  {FIELD_LABELS[ch.field] || ch.field}
                </div>

                {/* Old → New + shift pill */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  flexWrap: "wrap",
                }}>
                  <span style={{
                    color: "#ef4444",
                    fontWeight: 700,
                    fontSize: 12,
                    textDecoration: isDate ? "line-through" : "none",
                  }}>
                    {isDate ? fmt(ch.oldValue) : (ch.oldValue || "—")}
                  </span>

                  <span style={{ color: "#94a3b8", fontSize: 11 }}>→</span>

                  <span style={{
                    color: "#059669",
                    fontWeight: 700,
                    fontSize: 12,
                  }}>
                    {isDate ? fmt(ch.newValue) : (ch.newValue || "—")}
                  </span>

                  {/* Shift pill — only for date fields with a non-zero diff */}
                  {isDate && diff !== 0 && (
                    <span style={{
                      background: diff > 0 ? "#fee2e2" : "#d1fae5",
                      color:      diff > 0 ? "#991b1b" : "#065f46",
                      padding: "1px 7px",
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 800,
                    }}>
                      {diff > 0 ? `+${diff}d` : `${diff}d`}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// REVISIONS PAGE
// ═══════════════════════════════════════════════════════════════════════════════
function RevisionsPage({ history, lineItems, selProject, selWork, onDownload }) {
  // Group history by lineItemId → ordered by changedAt asc
  const byItem = {};
  [...history]
    .sort((a, b) => new Date(a.changedAt) - new Date(b.changedAt))
    .forEach(h => {
      const key = String(h.lineItemId || h.lineItemName);
      if (!byItem[key]) byItem[key] = { name: h.lineItemName, changes: [] };
      byItem[key].changes.push(h);
    });

  const items = Object.values(byItem);

  if (items.length === 0) {
    return (
      <div>
        <PageHeader
          title="📊 Revisions — Line Item Wise"
          subtitle={selWork ? `${selProject?.projectName} → ${selWork?.workName}` : "Select a work first"}
        />
        <EmptyState msg="No revision history yet. Date, status, and remark changes will appear here." />
      </div>
    );
  }

  // ── Row definitions ────────────────────────────────────────────────────────
  const ROWS = [
    {
      label: "What Changed",
      render: h => (
        <span style={RS.fieldPill}>
          {FIELD_LABELS[h.field] || h.field}
        </span>
      ),
    },
    {
      label: "From",
      render: h => (
        <span style={{ color: "#ef4444", fontWeight: 700 }}>
          {h.field?.includes("Date") ? fmt(h.oldValue) : (h.oldValue || "—")}
        </span>
      ),
    },
    {
      label: "To",
      render: h => (
        <span style={{ color: "#059669", fontWeight: 700 }}>
          {h.field?.includes("Date") ? fmt(h.newValue) : (h.newValue || "—")}
        </span>
      ),
    },
    {
      label: "Shift",
      render: h => {
        if (!h.field?.includes("Date")) return <span style={{ color: "#cbd5e1" }}>—</span>;
        const d = daysBetween(h.oldValue, h.newValue);
        if (!d) return <span style={{ color: "#cbd5e1" }}>—</span>;
        return (
          <span style={{
            background: d > 0 ? "#fee2e2" : "#d1fae5",
            color:      d > 0 ? "#991b1b" : "#065f46",
            padding: "2px 8px",
            borderRadius: 20,
            fontWeight: 800,
          }}>
            {d > 0 ? `+${d}d` : `${d}d`}
          </span>
        );
      },
    },
    {
      label: "Reason",
      render: h => (
        <span style={{ color: "#92400e", fontStyle: "italic" }}>
          {h.reason || "—"}
        </span>
      ),
    },
    {
      label: "Changed At",
      render: h => (
        <span style={{ color: "#64748b" }}>
          {fmtDateTime(h.changedAt)}
        </span>
      ),
    },
    {
      label: "Also Affected",
      // ✅ Updated: shows name + field + old→new + shift pill per affected item
      render: h =>
        h.cascadedItemNames
          ? <AffectedItemsCell names={h.cascadedItemNames} />
          : <span style={{ color: "#cbd5e1" }}>None</span>,
    },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* HEADER */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: 20,
        flexWrap: "wrap", gap: 12,
      }}>
        <div>
          <h2 style={{
            margin: 0, fontSize: 21, fontWeight: 700, color: "#1e293b",
            borderLeft: "4px solid #06b6d4", paddingLeft: 12,
          }}>
            📊 Revisions — Line Item Wise
          </h2>
          <p style={{ margin: "4px 0 0 16px", fontSize: 12, color: "#94a3b8" }}>
            {selProject?.projectName} → {selWork?.workName}
          </p>
        </div>

        <button
          onClick={onDownload}
          style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "9px 16px", background: "#1e293b", color: "#fff",
            border: "none", borderRadius: 8, fontSize: 13,
            fontWeight: 600, cursor: "pointer",
          }}
        >
          <FaDownload size={12} /> Download Report
        </button>
      </div>

      {/* VERTICAL BLOCKS — one block per line item */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {items.map((item, idx) => {
          const changes = item.changes;

          return (
            <div
              key={idx}
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 10,
                padding: 16,
              }}
            >
              {/* LINE ITEM TITLE */}
              <div style={{
                fontWeight: 800, fontSize: 14,
                color: "#0f172a", marginBottom: 8,
              }}>
                LINE ITEM: {item.name}
              </div>

              <div style={{ height: 1, background: "#e2e8f0", marginBottom: 12 }} />

              {/* TABLE — rows = fields, columns = Rev 1, Rev 2, Rev N */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12 }}>
                  <thead>
                    <tr>
                      {/* Sticky label column */}
                      <th style={RS.rowLabel}>FIELD</th>
                      {changes.map((h, i) => {
                        const isDate  = h.field?.includes("Date");
                        const diff    = isDate ? daysBetween(h.oldValue, h.newValue) : 0;
                        const isDelay = diff > 0;
                        return (
                          <th key={i} style={{
                            ...RS.revHead,
                            background: isDelay ? "#fff7ed" : diff < 0 ? "#f0fdf4" : RS.revHead.background,
                            color:      isDelay ? "#c2410c" : diff < 0 ? "#065f46" : RS.revHead.color,
                          }}>
                            <div>Rev {i + 1}</div>
                            {isDate && diff !== 0 && (
                              <div style={{
                                fontSize: 10,
                                background: isDelay ? "#fee2e2" : "#d1fae5",
                                color:      isDelay ? "#991b1b" : "#065f46",
                                borderRadius: 20, padding: "1px 7px",
                                display: "inline-block", marginTop: 3, fontWeight: 800,
                              }}>
                                {isDelay ? `+${diff}d` : `${diff}d`}
                              </div>
                            )}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>

                  <tbody>
                    {ROWS.map((row, ri) => (
                      <tr key={ri} style={{ background: ri % 2 === 0 ? "#fff" : "#fafafa" }}>
                        <td style={RS.rowLabel}>{row.label}</td>
                        {changes.map((h, ci) => (
                          <td key={ci} style={RS.cell}>
                            {row.render(h)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
//

// ═══════════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS PAGE
// ═══════════════════════════════════════════════════════════════════════════════
function NotificationsPage({ notifications, onDismiss, onDismissAll }) {
  const NOTIF_META = {
    started:  { bg: "#dbeafe", color: "#1e40af", icon: "🚀", label: "Started" },
    delayed:  { bg: "#fee2e2", color: "#991b1b", icon: "⚠️", label: "Delayed" },
    early:    { bg: "#d1fae5", color: "#065f46", icon: "🎉", label: "Early Completion" },
    upcoming: { bg: "#fef9c3", color: "#92400e", icon: "⏰", label: "Upcoming" },
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 21, fontWeight: 700, color: "#1e293b", borderLeft: "4px solid #f97316", paddingLeft: 12 }}>
            🔔 Notifications
          </h2>
          <p style={{ margin: "4px 0 0 16px", fontSize: 12, color: "#94a3b8" }}>
            {notifications.length} active alert{notifications.length !== 1 ? "s" : ""}
          </p>
        </div>
        {notifications.length > 0 && (
          <button onClick={onDismissAll}
            style={{ ...S.cancelBtn, display: "flex", alignItems: "center", gap: 6 }}>
            <FaTimes size={11}/> Dismiss All
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState msg="No active notifications. All clear! 🎉" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {notifications.map(n => {
            const meta = NOTIF_META[n.type] || NOTIF_META.upcoming;
            return (
              <div key={n.id} style={{
                background: meta.bg, border: `1px solid ${meta.color}33`,
                borderLeft: `5px solid ${meta.color}`, borderRadius: 10,
                padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "flex-start",
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 18 }}>{meta.icon}</span>
                    <span style={{ fontWeight: 700, color: meta.color, fontSize: 12, textTransform: "uppercase", letterSpacing: ".05em" }}>
                      {meta.label}
                    </span>
                  </div>
                  <div style={{ fontWeight: 700, color: "#1e293b", fontSize: 14, marginBottom: 3 }}>
                    {n.label}
                  </div>
                  <div style={{ fontSize: 12, color: "#475569" }}>
                    {n.msg}
                    {n.item?.endDate && (
                      <span style={{ marginLeft: 10, color: "#94a3b8" }}>
                        End Date: {fmt(n.item.endDate)}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 6, flexWrap: "wrap" }}>
                    <span style={{ ...S.deptTag, fontSize: 11 }}>{n.item?.department || "—"}</span>
                    {n.item?.actionPerson && (
                      <span style={{ ...S.personTag, fontSize: 11 }}>
                        <FaUser size={8}/> {n.item.actionPerson}
                      </span>
                    )}
                    <StatusBadge status={n.item?.status} />
                  </div>
                </div>
                <button onClick={() => onDismiss(n.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: meta.color, padding: 4, flexShrink: 0, marginTop: 2 }}>
                  <FaTimes size={13}/>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NotifBanner({ n, onDismiss }) {
  const colors = {
    started:  "#1e40af",
    delayed:  "#991b1b",
    early:    "#065f46",
    upcoming: "#92400e",
  };
  const icons = { started: "🚀", delayed: "⚠️", early: "🎉", upcoming: "⏰" };
  const color = colors[n.type] || "#475569";
  return (
    <div style={{
      background: "#fff", border: `1px solid ${color}33`, borderLeft: `4px solid ${color}`,
      borderRadius: 8, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center",
    }}>
      <div style={{ fontSize: 13, color: "#1e293b" }}>
        <span style={{ marginRight: 8 }}>{icons[n.type]}</span>
        <strong>{n.label}</strong>
        <span style={{ color: "#64748b", marginLeft: 8 }}>{n.msg}</span>
      </div>
      <button onClick={onDismiss} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
        <FaTimes size={11}/>
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DAY OFFSET MODAL CONTENT
// ═══════════════════════════════════════════════════════════════════════════════
function DayOffsetModalContent({ item, field, dayInput, setDayInput, dayReason, setDayReason, onConfirm, onCancel, lineItems }) {
  const days       = parseInt(dayInput, 10);
  const validDays  = !isNaN(days) && days !== 0;
  const oldDate    = item[field];
  const newDate    = validDays ? addDaysToDate(oldDate, days) : null;
  const fieldLabel = field === "startDate" ? "Start Date" : "End Date";

  // Auto end date preview when shifting start
  const duration       = daysBetween(item.startDate, item.endDate);
  const autoNewEndDate = field === "startDate" && validDays && item.endDate
    ? addDaysToDate(addDaysToDate(oldDate, days), duration)
    : null;

  // Parse linked items from structured format: "targetId:trigger:offsetDays"
  const linkedEntries = (item.linkedItemIds || "").split(",").filter(Boolean);
  const linkedIds = linkedEntries.map(e => {
    const parts = e.split(":");
    return Number(parts[0]);
  });
  const linkedItems = lineItems.filter(i => linkedIds.includes(i.id));
  const willCascade = validDays && Math.abs(days) >= 2 && linkedItems.length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ fontWeight: 700, color: "#1e293b", fontSize: 15 }}>
        {item.lineItemName}
        <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 400, color: "#64748b" }}>— {fieldLabel}</span>
      </div>

      <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: 14 }}>
        <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".05em" }}>
          Current {fieldLabel}
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#1e293b" }}>
          {fmt(oldDate) || "Not set"}
        </div>
        {field === "startDate" && item.endDate && (
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
            Duration: {duration} days → End Date will auto-adjust
          </div>
        )}
      </div>

      <div>
        <label style={S.lbl}>Shift by how many days? <span style={{ color: "#ef4444" }}>*</span></label>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button style={S.quickBtn} onClick={() => setDayInput(v => String((parseInt(v,10)||0) - 1))}>−1</button>
          <button style={S.quickBtn} onClick={() => setDayInput(v => String((parseInt(v,10)||0) - 7))}>−7</button>
          <input
            type="number"
            value={dayInput}
            onChange={e => setDayInput(e.target.value)}
            placeholder="e.g. +5 or -3"
            style={{ ...S.input, textAlign: "center", fontSize: 18, fontWeight: 700, flex: 1 }}
            autoFocus
          />
          <button style={S.quickBtn} onClick={() => setDayInput(v => String((parseInt(v,10)||0) + 1))}>+1</button>
          <button style={S.quickBtn} onClick={() => setDayInput(v => String((parseInt(v,10)||0) + 7))}>+7</button>
        </div>
      </div>

      {validDays && (
        <div style={{
          background: days > 0 ? "#fff7ed" : "#f0fdf4",
          border: `1px solid ${days > 0 ? "#fdba74" : "#86efac"}`,
          borderRadius: 10, padding: 14,
        }}>
          <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: ".05em" }}>Preview</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 3 }}>{fieldLabel.toUpperCase()}</div>
                <span style={{ color: "#ef4444", fontWeight: 800, fontSize: 16, textDecoration: "line-through" }}>{fmt(oldDate)}</span>
                <span style={{ color: "#94a3b8", margin: "0 8px" }}>→</span>
                <span style={{ color: "#059669", fontWeight: 800, fontSize: 16 }}>{fmt(newDate)}</span>
              </div>
              <span style={{
                background: days > 0 ? "#fee2e2" : "#d1fae5",
                color: days > 0 ? "#991b1b" : "#065f46",
                borderRadius: 8, padding: "6px 14px", fontSize: 14, fontWeight: 800,
              }}>
                {days > 0 ? `+${days}` : days} days {days > 0 ? "delayed" : "earlier"}
              </span>
            </div>

            {/* Auto end date preview */}
            {autoNewEndDate && (
              <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#1e40af" }}>
                🔄 <strong>End Date auto-adjusts:</strong>{" "}
                <span style={{ textDecoration: "line-through", color: "#ef4444" }}>{fmt(item.endDate)}</span>
                {" → "}
                <span style={{ color: "#059669", fontWeight: 700 }}>{fmt(autoNewEndDate)}</span>
                {" "}(same {duration}-day duration preserved)
              </div>
            )}

            {willCascade && (
              <div style={{ padding: "8px 12px", background: "#ede9fe", borderRadius: 8, fontSize: 12, color: "#6d28d9" }}>
                <div style={{ fontWeight: 700, marginBottom: 5 }}>
                  <FaLink size={10}/> Linked items will also shift:
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {linkedItems.map(li => (
                    <span key={li.id} style={{ background: "#ddd6fe", color: "#4c1d95", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                      {li.lineItemName}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div>
        <label style={S.lbl}>Reason for Change <span style={{ color: "#ef4444" }}>*</span></label>
        <textarea
          value={dayReason}
          onChange={e => setDayReason(e.target.value)}
          placeholder="e.g. Client requested delay, material delivery delayed…"
          style={{ ...S.input, height: 80, resize: "vertical" }}
        />
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button style={S.cancelBtn} onClick={onCancel}>Cancel</button>
        <button style={S.saveBtn} onClick={onConfirm} disabled={!validDays || !dayReason.trim()}>
          <FaSave size={11}/> Confirm & Record
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// REVISION PANEL (inline below row)
// ═══════════════════════════════════════════════════════════════════════════════
function RevisionPanel({ item, revisions }) {
  if (revisions.length === 0) {
    return (
      <div style={{ padding: "20px 28px", color: "#94a3b8", fontSize: 13 }}>
        No change history yet for this line item.
      </div>
    );
  }

  const dateRevs  = revisions.filter(h => h.field === "startDate" || h.field === "endDate");
  const otherRevs = revisions.filter(h => h.field !== "startDate" && h.field !== "endDate");

  return (
    <div style={{ padding: "16px 28px 20px" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 12 }}>
        📋 Revision History — {item.lineItemName}
      </div>

      {dateRevs.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 8, textTransform: "uppercase" }}>Date Changes</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {dateRevs.map((h, i) => {
              const diff = daysBetween(h.oldValue, h.newValue);
              const isDelay = diff > 0;
              return (
                <div key={i} style={{ display: "flex", gap: 0, alignItems: "stretch" }}>
                  <div style={{ width: 36, display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: "50%",
                      background: isDelay ? "#fee2e2" : "#d1fae5",
                      color: isDelay ? "#991b1b" : "#065f46",
                      fontSize: 10, fontWeight: 800,
                      display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2,
                    }}>R{i + 1}</div>
                    {i < dateRevs.length - 1 && <div style={{ width: 2, flex: 1, background: "#e2e8f0", margin: "4px 0" }} />}
                  </div>
                  <div style={{
                    flex: 1, marginLeft: 10, marginBottom: 12,
                    background: "#fff", border: "1px solid #e2e8f0",
                    borderLeft: `3px solid ${isDelay ? "#ef4444" : "#10b981"}`,
                    borderRadius: "0 8px 8px 0", padding: "10px 14px",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 6 }}>
                      <div>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>
                          {FIELD_LABELS[h.field] || h.field}
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4, flexWrap: "wrap" }}>
                          <span style={{ color: "#ef4444", fontWeight: 700, fontSize: 13, textDecoration: "line-through" }}>{fmt(h.oldValue)}</span>
                          <span style={{ color: "#94a3b8" }}>→</span>
                          <span style={{ color: "#059669", fontWeight: 700, fontSize: 13 }}>{fmt(h.newValue)}</span>
                          {diff !== 0 && (
                            <span style={{ background: isDelay ? "#fee2e2" : "#d1fae5", color: isDelay ? "#991b1b" : "#065f46", padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                              {diff > 0 ? `+${diff}` : diff} days
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ textAlign: "right", fontSize: 11, color: "#94a3b8" }}>
                        <div>{fmtDateTime(h.changedAt)}</div>
                        <div style={{ marginTop: 2 }}><FaUser size={8}/> {h.changedBy || "System"}</div>
                      </div>
                    </div>
                    <div style={{ marginTop: 8, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 6, padding: "5px 10px", fontSize: 12, color: "#92400e" }}>
                      📝 <strong>Reason:</strong> {h.reason || "No reason provided"}
                    </div>
                    {h.cascadedItemNames && (
                      <div style={{ marginTop: 6, padding: "5px 10px", background: "#ede9fe", borderRadius: 6, fontSize: 11, color: "#6d28d9" }}>
                        <FaLink size={9}/> <strong>Also shifted:</strong> {h.cascadedItemNames}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {otherRevs.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 8, textTransform: "uppercase" }}>Other Edits</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {otherRevs.map((h, i) => (
              <div key={i} style={{ background: "#fff", border: "1px solid #e2e8f0", borderLeft: "3px solid #8b5cf6", borderRadius: "0 8px 8px 0", padding: "8px 12px", fontSize: 12, minWidth: 200 }}>
                <div style={{ fontWeight: 700, color: "#1e293b", fontSize: 11, marginBottom: 3 }}>{FIELD_LABELS[h.field] || h.field} changed</div>
                {h.oldValue && (
                  <div style={{ color: "#64748b" }}>
                    <span style={{ textDecoration: "line-through", color: "#ef4444" }}>{h.oldValue || "—"}</span>
                    {" → "}
                    <span style={{ color: "#059669", fontWeight: 600 }}>{h.newValue || "—"}</span>
                  </div>
                )}
                <div style={{ marginTop: 4, color: "#92400e", fontSize: 11 }}>📝 {h.reason || "No reason"}</div>
                <div style={{ marginTop: 3, color: "#94a3b8", fontSize: 10 }}>{fmtDateTime(h.changedAt)} · {h.changedBy || "System"}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DATE SHIFT CELL
// ═══════════════════════════════════════════════════════════════════════════════
function DateShiftCell({ value, onShift }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 110 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>
        {value ? fmt(value) : <span style={{ color: "#cbd5e1" }}>—</span>}
      </div>
      {value && (
        <button onClick={onShift} style={{
          fontSize: 10, padding: "2px 8px", borderRadius: 5, cursor: "pointer",
          background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1d4ed8",
          fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4,
        }}>
          ± Days
        </button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HISTORY CARD
// ═══════════════════════════════════════════════════════════════════════════════
function HistoryCard({ h, index }) {
  const isDateField = h.field?.includes("Date") || h.field?.includes("date");
  const isGeneral   = h.field === "general";
  const diff        = isDateField ? daysBetween(h.oldValue, h.newValue) : 0;
  const hasCascade  = h.cascadedItemNames?.length > 0;
  const fieldLabel  = FIELD_LABELS[h.field] || h.field || "General Edit";

  let accentColor = "#3b82f6";
  if (isDateField && diff > 0) accentColor = "#ef4444";
  if (isDateField && diff < 0) accentColor = "#059669";
  if (h.field === "status")    accentColor = "#8b5cf6";

  return (
    <div style={{
      background: "#fff", border: "1px solid #e2e8f0",
      borderLeft: `4px solid ${accentColor}`, borderRadius: 10, padding: "14px 16px",
      boxShadow: "0 1px 3px rgba(0,0,0,.03)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
            <span style={{ fontWeight: 700, color: "#1e293b", fontSize: 14 }}>{h.lineItemName || "Unknown"}</span>
            <span style={{ background: accentColor + "18", color: accentColor, padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700 }}>
              {isGeneral ? "EDIT" : fieldLabel.toUpperCase()}
            </span>
            {hasCascade && (
              <span style={{ background: "#ede9fe", color: "#6d28d9", padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700 }}>CASCADE</span>
            )}
          </div>
          {!isGeneral && (
            <div style={{ fontSize: 13, color: "#475569", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ color: "#94a3b8" }}>{fieldLabel}:</span>
              <span style={{ color: "#ef4444", fontWeight: 700, textDecoration: "line-through" }}>
                {isDateField ? fmt(h.oldValue) : (h.oldValue || "—")}
              </span>
              <span style={{ color: "#94a3b8" }}>→</span>
              <span style={{ color: "#059669", fontWeight: 700 }}>
                {isDateField ? fmt(h.newValue) : (h.newValue || "—")}
              </span>
              {isDateField && diff !== 0 && (
                <span style={{
                  background: diff > 0 ? "#fee2e2" : "#d1fae5",
                  color: diff > 0 ? "#991b1b" : "#065f46",
                  padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                }}>
                  {diff > 0 ? `+${diff} days delayed` : `${Math.abs(diff)} days earlier`}
                </span>
              )}
            </div>
          )}
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>{fmtDateTime(h.changedAt)}</div>
          <div style={{ fontSize: 12, color: "#475569", marginTop: 2, display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
            <FaUser size={9} color="#94a3b8"/> {h.changedBy || "System"}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 10, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 7, padding: "7px 12px", fontSize: 12, color: "#92400e", display: "flex", gap: 6, alignItems: "flex-start" }}>
        <span style={{ fontWeight: 700, flexShrink: 0 }}>📝 Reason:</span>
        <span>{h.reason || "No reason provided"}</span>
      </div>
      {hasCascade && (
        <div style={{ marginTop: 8, padding: "6px 10px", background: "#ede9fe", borderRadius: 7, fontSize: 11, color: "#6d28d9", display: "flex", gap: 5, alignItems: "center" }}>
          <FaLink size={9}/>
          <span><strong>Also shifted:</strong> {h.cascadedItemNames}</span>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// WORK FORM
// ═══════════════════════════════════════════════════════════════════════════════
function WorkForm({ initial, projects, selectedProject, onProjectSelect, onSave, onCancel }) {
  const [form, setForm] = useState({ workName: "", workOrderNo: "", startDate: "", endDate: "", description: "", ...initial });
  const [projId, setProjId] = useState(initial?.project?.projectId || selectedProject?.projectId || "");
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    if (!projId) { alert("Please select a project"); return; }
    if (!form.workName.trim()) { alert("Work Name is required"); return; }
    const proj = projects.find(p => String(p.projectId) === String(projId));
    if (proj) onProjectSelect(proj);
    onSave(form);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <label style={S.lbl}>Project <span style={{ color: "#ef4444" }}>*</span></label>
        <select value={projId} onChange={e => setProjId(e.target.value)} style={S.input}>
          <option value="">— Select Project —</option>
          {projects.map(p => <option key={p.projectId} value={p.projectId}>{p.projectName} ({p.projectCode})</option>)}
        </select>
      </div>
      <div style={S.row2}>
        <Field label="Work Name *"    value={form.workName}    onChange={v => f("workName", v)}    placeholder="e.g. Toilet Casement Window Work" />
        <Field label="Work Order No." value={form.workOrderNo} onChange={v => f("workOrderNo", v)} placeholder="e.g. ARPL/2025/206" />
      </div>
      <div style={S.row2}>
        <Field label="Start Date" value={form.startDate} onChange={v => f("startDate", v)} type="date" />
        <Field label="End Date"   value={form.endDate}   onChange={v => f("endDate", v)}   type="date" />
      </div>
      <Field label="Description / Notes" value={form.description} onChange={v => f("description", v)} placeholder="Optional notes" />
      <FormActions onSave={handleSave} onCancel={onCancel} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LINE ITEM FORM — with enhanced linking
// ═══════════════════════════════════════════════════════════════════════════════
function LineItemForm({ initial, existingItems, onSave, onCancel }) {
  // Parse structured linkedItemIds: "targetId:trigger:offsetDays"
  const parseLinks = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    return raw.split(",").filter(Boolean).map(e => {
      const parts = e.split(":");
      return {
        targetId:   Number(parts[0]),
        trigger:    parts[1] || "END_TO_START",
        offsetDays: Number(parts[2] || 0),
      };
    });
  };

  const [form, setForm] = useState({
    srNo: "", lineItemName: "", startDate: "", endDate: "",
    department: "", actionPerson: "", status: "NOT STARTED",
    remark: "",
    ...initial,
    linkedItemIds: parseLinks(initial?.linkedItemIds),
  });
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const others = existingItems.filter(i => i.id !== form.id);

  const isLinked = (id) => form.linkedItemIds.some(l => l.targetId === id);

  const toggleLink = (id) => {
    setForm(p => {
      const exists = p.linkedItemIds.some(l => l.targetId === id);
      if (exists) return { ...p, linkedItemIds: p.linkedItemIds.filter(l => l.targetId !== id) };
      return { ...p, linkedItemIds: [...p.linkedItemIds, { targetId: id, trigger: "END_TO_START", offsetDays: 0 }] };
    });
  };

  const updateLink = (id, field, value) => {
    setForm(p => ({
      ...p,
      linkedItemIds: p.linkedItemIds.map(l =>
        l.targetId === id ? { ...l, [field]: field === "offsetDays" ? Number(value) : value } : l
      ),
    }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={S.row2}>
        <Field label="SR No"            value={form.srNo}        onChange={v => f("srNo", v)}        type="number" />
        <Field label="Line Item Name *" value={form.lineItemName} onChange={v => f("lineItemName", v)} placeholder="e.g. SITE SURVEY" />
      </div>
      <div style={S.row2}>
        <Field label="Start Date *" value={form.startDate} onChange={v => f("startDate", v)} type="date" />
        <Field label="End Date *"   value={form.endDate}   onChange={v => f("endDate", v)}   type="date" />
      </div>
      {initial?.id && (
        <div style={{ background: "#fef9c3", border: "1px solid #fde68a", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#92400e" }}>
          💡 To change dates with cascade & reason tracking, use the <strong>± Days</strong> button on the table row.
        </div>
      )}
      <div style={S.row2}>
        <div>
          <label style={S.lbl}>Department</label>
          <select value={form.department} onChange={e => f("department", e.target.value)} style={S.input}>
            <option value="">— Select —</option>
            {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
        <Field label="Assigned Person" value={form.actionPerson} onChange={v => f("actionPerson", v)} placeholder="e.g. SURAJ" />
      </div>
      <div style={S.row2}>
        <div>
          <label style={S.lbl}>Status</label>
          <select value={form.status} onChange={e => f("status", e.target.value)} style={S.input}>
            {STATUS_OPTIONS.map(st => <option key={st}>{st}</option>)}
          </select>
        </div>
        <Field label="Remark" value={form.remark} onChange={v => f("remark", v)} placeholder="Optional" />
      </div>

      {/* ── Enhanced Linking Section ── */}
      {others.length > 0 && (
        <div>
          <label style={S.lbl}><FaLink size={9} style={{ marginRight: 4 }}/> Link to Other Line Items</label>
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: 14, marginTop: 8 }}>
            <p style={{ fontSize: 11, color: "#64748b", margin: "0 0 12px 0" }}>
              Select items and define <strong>when this item should start</strong> relative to the linked item.
              Note: Linking changes are <strong>not tracked</strong> in revision history.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {others.map(i => {
                const linked = isLinked(i.id);
                const linkDef = form.linkedItemIds.find(l => l.targetId === i.id);
                return (
                  <div key={i.id} style={{
                    border: `1px solid ${linked ? "#a78bfa" : "#e2e8f0"}`,
                    borderRadius: 8, padding: "10px 12px",
                    background: linked ? "#faf5ff" : "#fff",
                    transition: "all .15s",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <input type="checkbox" checked={linked} onChange={() => toggleLink(i.id)} style={{ cursor: "pointer" }} />
                      <div style={{ flex: 1 }}>
                        <span style={{ fontWeight: 600, color: "#1e293b", fontSize: 13 }}>{i.lineItemName}</span>
                        <span style={{ marginLeft: 8, fontSize: 11, color: "#94a3b8" }}>
                          {fmt(i.startDate)} → {fmt(i.endDate)}
                        </span>
                      </div>
                      <StatusBadge status={i.status} />
                    </div>

                    {linked && linkDef && (
                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px dashed #e2e8f0", display: "flex", flexDirection: "column", gap: 8 }}>
                        <div>
                          <label style={{ ...S.lbl, marginBottom: 4 }}>Trigger: When should THIS item start?</label>
                          <select
                            value={linkDef.trigger}
                            onChange={e => updateLink(i.id, "trigger", e.target.value)}
                            style={{ ...S.input, fontSize: 12 }}>
                            {LINK_TRIGGER_OPTIONS.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ ...S.lbl, marginBottom: 4 }}>
                              + Offset Days after trigger (optional)
                            </label>
                            <input
                              type="number"
                              value={linkDef.offsetDays || 0}
                              onChange={e => updateLink(i.id, "offsetDays", e.target.value)}
                              placeholder="0"
                              style={{ ...S.input, fontSize: 12 }}
                            />
                          </div>
                          <div style={{ fontSize: 11, color: "#6d28d9", background: "#ede9fe", padding: "8px 12px", borderRadius: 8, marginTop: 18, whiteSpace: "nowrap" }}>
                            {linkDef.trigger === "END_TO_START"    && `Starts when ${i.lineItemName} ends${linkDef.offsetDays ? ` + ${linkDef.offsetDays}d` : ""}`}
                            {linkDef.trigger === "START_TO_START"  && `Starts when ${i.lineItemName} starts${linkDef.offsetDays ? ` + ${linkDef.offsetDays}d` : ""}`}
                            {linkDef.trigger === "MIDDLE_TO_START" && `Starts at midpoint of ${i.lineItemName}${linkDef.offsetDays ? ` + ${linkDef.offsetDays}d` : ""}`}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <FormActions onSave={() => onSave(form)} onCancel={onCancel} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SMALL REUSABLE COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════
function ProjectCard({ p, onOpen, onHistory }) {
  const meta = PROJECT_STATUS_META[p.projectStatus] || PROJECT_STATUS_META["PLANNED"];
  return (
    <div style={S.projectCard}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={S.cardTitle}>{p.projectName}</div>
          <div style={S.cardSub}>📋 {p.projectCode}</div>
        </div>
        <span style={{ ...S.pill, background: meta.bg, color: meta.color, flexShrink: 0 }}>{p.projectStatus || "—"}</span>
      </div>
      <div style={S.cardMeta}>
        {p.clientName      && <span>🏢 {p.clientName}</span>}
        {p.city            && <span>📍 {p.city}</span>}
        {p.projectManager  && <span>👤 {p.projectManager}</span>}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <button style={{ ...S.openBtn, flex: 1 }} onClick={onOpen}>Open Works →</button>
        <button style={S.histBtn} onClick={onHistory}><FaHistory size={11}/> History</button>
      </div>
    </div>
  );
}

function WorkCard({ w, onOpen, onEdit, onDelete, onHistory }) {
  return (
    <div style={S.workCard}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={S.cardTitle}>{w.workName}</div>
          <div style={S.cardSub}>📄 {w.workOrderNo}</div>
        </div>
        <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
          <ActionBtn color="#8b5cf6" title="History" onClick={onHistory}><FaHistory size={11}/></ActionBtn>
          <ActionBtn color="#2563eb" title="Edit"    onClick={onEdit}><FaEdit size={11}/></ActionBtn>
          <ActionBtn color="#ef4444" title="Delete"  onClick={onDelete}><FaTrash size={11}/></ActionBtn>
        </div>
      </div>
      {(w.startDate || w.endDate) && (
        <div style={S.cardMeta}>
          <FaCalendarAlt size={10} style={{ color: "#94a3b8" }} />
          {fmt(w.startDate)} → {fmt(w.endDate)}
        </div>
      )}
      {w.description && (
        <div style={{ fontSize: 12, color: "#64748b", marginTop: 4, fontStyle: "italic" }}>{w.description}</div>
      )}
      <button style={{ ...S.openBtn, marginTop: 14, width: "100%" }} onClick={onOpen}>Open Line Items →</button>
    </div>
  );
}

function Modal({ title, children, onClose, wide }) {
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={{ ...S.modalBox, maxWidth: wide ? 760 : 580 }} onClick={e => e.stopPropagation()}>
        <div style={S.modalHead}>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>{title}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4 }}>
            <FaTimes size={15}/>
          </button>
        </div>
        <div style={{ padding: "20px 22px", overflowY: "auto", flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder = "" }) {
  return (
    <div>
      <label style={S.lbl}>{label}</label>
      <input type={type} value={value || ""} placeholder={placeholder}
        onChange={e => onChange(e.target.value)} style={S.input} />
    </div>
  );
}

function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META["NOT STARTED"];
  return (
    <span style={{ ...S.pill, background: m.bg, color: m.color, display: "inline-flex", alignItems: "center", gap: 4 }}>
      {m.icon} {status || "—"}
    </span>
  );
}

function KpiCard({ label, value, icon, color, sub, onClick }) {
  return (
    <div style={{ ...S.kpiCard, borderTop: `4px solid ${color}`, cursor: onClick ? "pointer" : "default" }} onClick={onClick}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#1e293b" }}>{value}</div>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginTop: 2 }}>{label}</div>
          {sub && <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 3 }}>{sub}</div>}
        </div>
        <div style={{ fontSize: 24 }}>{icon}</div>
      </div>
    </div>
  );
}

function Breadcrumb({ parts }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16, fontSize: 12 }}>
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          {i > 0 && <FaChevronRight style={{ color: "#cbd5e1", fontSize: 9 }} />}
          {part.onClick
            ? <span style={{ color: "#3b82f6", cursor: "pointer", fontWeight: 500 }} onClick={part.onClick}>{part.label}</span>
            : <span style={{ color: "#1e293b", fontWeight: 700 }}>{part.label}</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

function PageHeader({ title, subtitle, children }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 21, fontWeight: 700, color: "#1e293b", borderLeft: "4px solid #10b981", paddingLeft: 12 }}>
          {title}
        </h2>
        {subtitle && <p style={{ margin: "4px 0 0 16px", fontSize: 12, color: "#94a3b8" }}>{subtitle}</p>}
      </div>
      {children && <div style={{ display: "flex", gap: 8, alignItems: "center" }}>{children}</div>}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h3 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: ".06em" }}>
      {children}
    </h3>
  );
}

function SearchBar({ value, onChange, placeholder }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "8px 14px", marginBottom: 20, maxWidth: 420 }}>
      <FaSearch style={{ color: "#94a3b8", flexShrink: 0 }} size={13}/>
      <input style={{ border: "none", outline: "none", fontSize: 13, flex: 1, color: "#334155", background: "transparent" }}
        placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
      {value && (
        <button onClick={() => onChange("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 0 }}>
          <FaTimes size={11}/>
        </button>
      )}
    </div>
  );
}

function PrimaryBtn({ icon, label, onClick }) {
  return (
    <button onClick={onClick} style={{ background: "#10b981", color: "#fff", border: "none", borderRadius: 8, padding: "9px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
      {icon} {label}
    </button>
  );
}

function SecondaryBtn({ icon, label, onClick }) {
  return (
    <button onClick={onClick} style={{ background: "#ede9fe", color: "#6d28d9", border: "1px solid #c4b5fd", borderRadius: 8, padding: "9px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
      {icon} {label}
    </button>
  );
}

function ActionBtn({ color, title, children, onClick }) {
  return (
    <button onClick={onClick} title={title}
      style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, padding: "5px 8px", cursor: "pointer", color, display: "flex", alignItems: "center" }}>
      {children}
    </button>
  );
}

function FormActions({ onSave, onCancel }) {
  return (
    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4, paddingTop: 12, borderTop: "1px solid #f1f5f9" }}>
      <button onClick={onCancel} style={S.cancelBtn}>Cancel</button>
      <button onClick={onSave}   style={S.saveBtn}><FaSave size={11}/> Save</button>
    </div>
  );
}

function EmptyState({ msg }) {
  return (
    <div style={{ padding: 60, textAlign: "center", color: "#94a3b8", background: "#fff", borderRadius: 14, border: "1px dashed #e2e8f0", gridColumn: "1 / -1" }}>
      <div style={{ fontSize: 38, marginBottom: 10 }}>📭</div>
      <div style={{ fontSize: 14 }}>{msg}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════════
const S = {
  shell:       { display: "flex", height: "100vh", overflow: "hidden", fontFamily: "'Segoe UI', 'Inter', sans-serif", background: "#f1f5f9" },
  sidebar:     { background: "#0f172a", display: "flex", flexDirection: "column", transition: "width .2s ease", flexShrink: 0, overflow: "hidden" },
  sideTop:     { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 12px 10px" },
  brandBlock:  { display: "flex", alignItems: "center", gap: 8 },
  brandIcon:   { fontSize: 18 },
  brandText:   { color: "#fff", fontWeight: 700, fontSize: 14, whiteSpace: "nowrap" },
  collapseBtn: { background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 11, padding: 4, flexShrink: 0 },
  navItem:     { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, transition: "all .15s", textAlign: "left", width: "100%" },
  navLabel:    { whiteSpace: "nowrap", overflow: "hidden" },
  sideContext: { margin: "0 10px 10px", padding: "10px 12px", background: "#1e293b", borderRadius: 8, display: "flex", flexDirection: "column", gap: 6 },
  sideCtxItem: { display: "flex", alignItems: "center", gap: 6, overflow: "hidden" },
  sideBack:    { margin: "8px 10px 14px", padding: "9px 12px", background: "#1e293b", border: "none", color: "#64748b", borderRadius: 8, cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", gap: 7 },

  main:        { flex: 1, overflow: "auto", padding: "28px 30px" },
  toast:       { position: "fixed", top: 18, right: 20, zIndex: 9999, padding: "11px 18px", borderRadius: 10, fontWeight: 600, fontSize: 13, boxShadow: "0 8px 24px rgba(0,0,0,.12)" },

  infoBanner:  { display: "flex", alignItems: "flex-start", gap: 10, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "10px 16px", marginBottom: 14, fontSize: 12, color: "#1e40af" },

  kpiRow:      { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 14, marginBottom: 28 },
  kpiCard:     { background: "#fff", borderRadius: 12, padding: "16px 18px", border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,.04)" },

  cardGrid:    { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 18 },
  projectCard: { background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,.04)", borderTop: "4px solid #10b981" },
  workCard:    { background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,.04)", borderTop: "4px solid #3b82f6" },
  cardTitle:   { fontSize: 15, fontWeight: 700, color: "#1e293b" },
  cardSub:     { fontSize: 12, color: "#64748b", marginTop: 3 },
  cardMeta:    { display: "flex", gap: 12, fontSize: 11, color: "#94a3b8", marginTop: 8, flexWrap: "wrap", alignItems: "center" },

  openBtn:     { padding: "8px 14px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, cursor: "pointer", fontWeight: 600, color: "#1e293b", fontSize: 12 },
  histBtn:     { padding: "8px 12px", background: "#ede9fe", border: "1px solid #c4b5fd", borderRadius: 8, cursor: "pointer", fontWeight: 600, color: "#6d28d9", fontSize: 11, display: "flex", alignItems: "center", gap: 5 },
  pill:        { padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700 },

  lineItemStrip: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 },
  stripPill:     { display: "flex", alignItems: "center", padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 },

  tableWrap:   { overflowX: "auto", background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,.04)" },
  table:       { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  thead:       { background: "#f8fafc", borderBottom: "2px solid #e2e8f0" },
  tr:          { borderBottom: "1px solid #f1f5f9" },
  th:          { padding: "11px 13px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: ".05em", whiteSpace: "nowrap" },
  td:          { padding: "9px 13px", color: "#334155", verticalAlign: "middle" },
  deptTag:     { background: "#f0fdf4", color: "#065f46", padding: "2px 8px", borderRadius: 5, fontSize: 11, fontWeight: 600 },
  personTag:   { display: "inline-flex", alignItems: "center", gap: 4, background: "#eff6ff", color: "#1e40af", padding: "2px 8px", borderRadius: 5, fontSize: 11, fontWeight: 600 },
  linkPill:    { background: "#ede9fe", color: "#6d28d9", padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 },

  histSummary: { display: "flex", gap: 0, marginBottom: 20, background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0", overflow: "hidden" },
  histSumItem: { flex: 1, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 3, borderRight: "1px solid #f1f5f9" },

  overlay:     { position: "fixed", inset: 0, background: "rgba(15,23,42,.5)", backdropFilter: "blur(4px)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 },
  modalBox:    { background: "#fff", borderRadius: 14, width: "100%", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,.2)" },
  modalHead:   { padding: "15px 22px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" },

  lbl:         { display: "block", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 5 },
  input:       { width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", color: "#334155", background: "#fff", fontFamily: "inherit" },
  row2:        { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
  saveBtn:     { background: "#10b981", color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 },
  cancelBtn:   { background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#64748b" },
  quickBtn:    { background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 7, padding: "7px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", color: "#334155", flexShrink: 0 },
  viewAllBtn:  { background: "none", border: "1px dashed #e2e8f0", borderRadius: 8, padding: "8px 16px", cursor: "pointer", color: "#64748b", fontSize: 12, textAlign: "center" },
};

// Revisions page table styles
const RS = {
  fixedColHead: {
    position: "sticky", left: 0, zIndex: 2,
    background: "#0f172a", color: "#fff",
    padding: "12px 16px", textAlign: "left",
    fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
    borderRight: "2px solid #334155", minWidth: 130,
  },
  colHead: {
    background: "#1e293b", color: "#e2e8f0",
    padding: "12px 14px", textAlign: "center",
    borderLeft: "2px solid #334155", borderBottom: "1px solid #334155",
    minWidth: 160,
  },
  revHead: {
    background: "#f8fafc", color: "#64748b",
    padding: "6px 12px", textAlign: "center",
    fontSize: 10, fontWeight: 700, textTransform: "uppercase",
    borderLeft: "1px solid #e2e8f0", letterSpacing: ".05em",
  },
  rowLabel: {
    position: "sticky", left: 0, zIndex: 1,
    background: "#f8fafc", color: "#475569",
    padding: "10px 14px", fontWeight: 700,
    fontSize: 11, textTransform: "uppercase",
    letterSpacing: ".05em", whiteSpace: "nowrap",
    borderRight: "2px solid #e2e8f0",
    verticalAlign: "top",
  },
  cell: {
    padding: "10px 14px",
    verticalAlign: "top",
    fontSize: 12,
    color: "#334155",
  },
  fieldPill: {
    background: "#eff6ff", color: "#1e40af",
    padding: "3px 9px", borderRadius: 20,
    fontSize: 11, fontWeight: 700,
    display: "inline-block",
  },
};