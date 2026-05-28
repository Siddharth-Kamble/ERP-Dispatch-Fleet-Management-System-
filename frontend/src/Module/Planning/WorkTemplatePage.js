import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaSave, FaTimes, FaTrash, FaSearch, FaPlus,
  FaLayerGroup, FaCheck, FaListAlt, FaLink,
} from "react-icons/fa";

const BASE      = process.env.REACT_APP_API_URL || "http://localhost:8080";
const TMPL_API  = `${BASE}/api/templates`;
const PROJ_API  = `${BASE}/projects`;
const PLAN_API  = `${BASE}/api/planning`;

// ─── tiny helpers ─────────────────────────────────────────────────────────────
const fmt = d => d ? new Date(d).toLocaleDateString("en-IN",
  { day:"2-digit", month:"short", year:"numeric" }) : "—";

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function WorkTemplatePage({ onTemplateApplied }) {
  const [templates,    setTemplates]    = useState([]);
  const [search,       setSearch]       = useState("");
  const [loading,      setLoading]      = useState(false);
  const [toast,        setToast]        = useState(null);

  // Modal states
  const [saveModal,    setSaveModal]    = useState(null);  // { workId, workName }
  const [applyModal,   setApplyModal]   = useState(null);  // { template }
  const [previewModal, setPreviewModal] = useState(null);  // { template, items }

  useEffect(() => { loadTemplates(); }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── API ────────────────────────────────────────────────────────────────────
  const loadTemplates = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        search.trim() ? `${TMPL_API}/search?name=${encodeURIComponent(search)}` : TMPL_API
      );
      setTemplates(data || []);
    } catch { showToast("Failed to load templates", "error"); }
    finally { setLoading(false); }
  };

  const deleteTemplate = async (id, name) => {
    if (!window.confirm(`Delete template "${name}"? This cannot be undone.`)) return;
    try {
      await axios.delete(`${TMPL_API}/${id}`);
      showToast("Template deleted");
      loadTemplates();
    } catch { showToast("Delete failed", "error"); }
  };

  const openPreview = async (tmpl) => {
    try {
      const { data } = await axios.get(`${TMPL_API}/${tmpl.id}/items`);
      setPreviewModal({ template: tmpl, items: data || [] });
    } catch { showToast("Failed to load template items", "error"); }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div style={S.page}>

      {/* Toast */}
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

      {/* Header */}
      <div style={S.header}>
        <div>
          <h2 style={S.title}>
            <FaLayerGroup style={{ marginRight: 10, color: "#8b5cf6" }} />
            Work Templates
          </h2>
          <p style={S.subtitle}>
            Save any completed work as a reusable template. Apply it later to skip
            re-creating line items and dependencies from scratch.
          </p>
        </div>
      </div>

      {/* Info banner */}
      <div style={S.infoBanner}>
        <span style={{ fontSize: 16 }}>💡</span>
        <span>
          After building a work with all line items and dependencies, go to that work's
          Line Items page and click <strong>"Save as Template"</strong>.
          Next time, pick the template here, fill in project + work order details,
          and all items are copied instantly — just add your dates.
        </span>
      </div>

      {/* Search bar */}
      <div style={S.searchRow}>
        <div style={S.searchBox}>
          <FaSearch style={{ color: "#94a3b8", flexShrink: 0 }} size={13}/>
          <input
            style={S.searchInput}
            placeholder="Search templates by name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && loadTemplates()}
          />
          {search && (
            <button onClick={() => { setSearch(""); loadTemplates(); }}
              style={S.clearBtn}>
              <FaTimes size={11}/>
            </button>
          )}
        </div>
        <button onClick={loadTemplates} style={S.searchBtn}>Search</button>
      </div>

      {/* Template grid */}
      {loading ? (
        <div style={S.empty}>Loading templates…</div>
      ) : templates.length === 0 ? (
        <div style={S.emptyBox}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
            No templates yet
          </div>
          <div style={{ fontSize: 13, color: "#94a3b8", maxWidth: 380, textAlign: "center" }}>
            Create a work, add all your line items and dependencies, then click
            "Save as Template" on the Line Items page.
          </div>
        </div>
      ) : (
        <div style={S.grid}>
          {templates.map(t => (
            <TemplateCard
              key={t.id}
              template={t}
              onPreview={() => openPreview(t)}
              onApply={() => setApplyModal({ template: t })}
              onDelete={() => deleteTemplate(t.id, t.templateName)}
            />
          ))}
        </div>
      )}

      {/* ── MODALS ── */}
      {previewModal && (
        <PreviewModal
          template={previewModal.template}
          items={previewModal.items}
          onApply={() => {
            setPreviewModal(null);
            setApplyModal({ template: previewModal.template });
          }}
          onClose={() => setPreviewModal(null)}
        />
      )}

      {applyModal && (
        <ApplyModal
          template={applyModal.template}
          onClose={() => setApplyModal(null)}
          onApplied={(newWork) => {
            setApplyModal(null);
            showToast(`Work "${newWork.workName}" created from template ✓`);
            onTemplateApplied?.(newWork);
          }}
          showToast={showToast}
        />
      )}

      {saveModal && (
        <SaveAsTemplateModal
          workId={saveModal.workId}
          workName={saveModal.workName}
          onClose={() => setSaveModal(null)}
          onSaved={() => {
            setSaveModal(null);
            showToast("Template saved ✓");
            loadTemplates();
          }}
          showToast={showToast}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE CARD
// ═══════════════════════════════════════════════════════════════════════════════
function TemplateCard({ template: t, onPreview, onApply, onDelete }) {
  return (
    <div style={S.card}>
      <div style={S.cardTop}>
        <div style={S.cardIcon}><FaLayerGroup size={18} color="#8b5cf6"/></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={S.cardName}>{t.templateName}</div>
          {t.defaultWorkName && (
            <div style={S.cardSub}>📋 {t.defaultWorkName}</div>
          )}
        </div>
        <button onClick={onDelete} style={S.deleteBtn} title="Delete template">
          <FaTrash size={11}/>
        </button>
      </div>

      {t.templateDescription && (
        <div style={S.cardDesc}>{t.templateDescription}</div>
      )}

      <div style={S.cardMeta}>
        <span style={S.metaPill}>
          <FaListAlt size={9} style={{ marginRight: 4 }}/>{t.itemCount} line items
        </span>
        <span style={{ ...S.metaPill, background: "#f0fdf4", color: "#065f46" }}>
          {t.createdBy || "System"}
        </span>
        <span style={{ marginLeft: "auto", fontSize: 10, color: "#94a3b8" }}>
          {fmt(t.createdAt)}
        </span>
      </div>

      <div style={S.cardActions}>
        <button onClick={onPreview} style={S.previewBtn}>
          👁 Preview Items
        </button>
        <button onClick={onApply} style={S.applyBtn}>
          <FaPlus size={11}/> Use This Template
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PREVIEW MODAL — shows all line items in the template
// ═══════════════════════════════════════════════════════════════════════════════
function PreviewModal({ template, items, onApply, onClose }) {
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={{ ...S.modalBox, maxWidth: 700 }} onClick={e => e.stopPropagation()}>
        <div style={S.modalHead}>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>
            📋 {template.templateName} — Line Items Preview
          </span>
          <button onClick={onClose} style={S.iconBtn}><FaTimes size={14}/></button>
        </div>
        <div style={{ padding: "16px 22px", overflowY: "auto", maxHeight: 460 }}>
          {template.templateDescription && (
            <div style={S.descBox}>{template.templateDescription}</div>
          )}
          <table style={S.table}>
            <thead>
              <tr style={S.thead}>
                {["SR", "Line Item", "Department", "Action Person", "Links", "Remark"].map(h =>
                  <th key={h} style={S.th}>{h}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr><td colSpan={6} style={S.emptyCell}>No items</td></tr>
              )}
              {items.map((item, i) => {
                const linkedCount = (item.linkedItemIds || "").split(",").filter(Boolean).length;
                return (
                  <tr key={item.id} style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc" }}>
                    <td style={{ ...S.td, textAlign: "center", color: "#94a3b8" }}>{item.srNo}</td>
                    <td style={{ ...S.td, fontWeight: 600, color: "#1e293b" }}>{item.lineItemName}</td>
                    <td style={S.td}>
                      {item.department
                        ? <span style={S.deptTag}>{item.department}</span>
                        : <span style={{ color: "#cbd5e1" }}>—</span>}
                    </td>
                    <td style={S.td}>{item.actionPerson || <span style={{ color: "#cbd5e1" }}>—</span>}</td>
                    <td style={{ ...S.td, textAlign: "center" }}>
                      {linkedCount > 0
                        ? <span style={S.linkPill}><FaLink size={8}/> {linkedCount}</span>
                        : <span style={{ color: "#e2e8f0" }}>—</span>}
                    </td>
                    <td style={{ ...S.td, color: "#64748b", fontSize: 11 }}>
                      {item.remark || "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={S.modalFoot}>
          <button onClick={onClose} style={S.cancelBtn}>Close</button>
          <button onClick={onApply} style={S.saveBtn}>
            <FaPlus size={11}/> Use This Template
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// APPLY MODAL — user fills in project + work details
// ═══════════════════════════════════════════════════════════════════════════════
function ApplyModal({ template, onClose, onApplied, showToast }) {
  const [projects,    setProjects]    = useState([]);
  const [form, setForm] = useState({
    projectId:   "",
    workName:    template.defaultWorkName || "",
    workOrderNo: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(PROJ_API).then(r => setProjects(r.data || [])).catch(() => {});
  }, []);

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleApply = async () => {
    if (!form.projectId) { showToast("Please select a project", "error"); return; }
    if (!form.workName.trim()) { showToast("Work Name is required", "error"); return; }
    setLoading(true);
    try {
      const { data } = await axios.post(`${TMPL_API}/apply`, {
        templateId:  template.id,
        projectId:   Number(form.projectId),
        workName:    form.workName.trim(),
        workOrderNo: form.workOrderNo.trim() || null,
        description: form.description.trim() || null,
      });
      onApplied(data);
    } catch (e) {
      showToast("Failed to apply template: " + (e.response?.data?.message || e.message), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={{ ...S.modalBox, maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <div style={{ ...S.modalHead, background: "#0f172a", borderRadius: "14px 14px 0 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <FaLayerGroup size={15} color="#8b5cf6"/>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>
              Use Template: {template.templateName}
            </span>
          </div>
          <button onClick={onClose} style={{ ...S.iconBtn, color: "#94a3b8" }}>
            <FaTimes size={14}/>
          </button>
        </div>

        <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Info */}
          <div style={S.infoBox}>
            <span style={{ fontWeight: 700 }}>📋 {template.itemCount} line items</span>
            &nbsp;will be created automatically.
            <br/>
            <span style={{ color: "#475569" }}>
              Dates are NOT set — fill them in on the Line Items page after creation.
            </span>
          </div>

          {/* Project */}
          <div>
            <label style={S.lbl}>Project <span style={{ color: "#ef4444" }}>*</span></label>
            <select value={form.projectId} onChange={e => f("projectId", e.target.value)}
              style={S.input}>
              <option value="">— Select Project —</option>
              {projects.map(p => (
                <option key={p.projectId} value={p.projectId}>
                  {p.projectName} ({p.projectCode})
                </option>
              ))}
            </select>
          </div>

          {/* Work Name */}
          <div>
            <label style={S.lbl}>Work Name <span style={{ color: "#ef4444" }}>*</span></label>
            <input value={form.workName} onChange={e => f("workName", e.target.value)}
              placeholder="e.g. 30TH TO 35TH FLOORS"
              style={S.input}/>
          </div>

          {/* Work Order No */}
          <div>
            <label style={S.lbl}>Work Order No.</label>
            <input value={form.workOrderNo} onChange={e => f("workOrderNo", e.target.value)}
              placeholder="e.g. BAWOJ/00019/25-26"
              style={S.input}/>
          </div>

          {/* Description (NOS / SQFT for PDF) */}
          <div>
            <label style={S.lbl}>Description
              <span style={{ marginLeft: 6, fontSize: 10, color: "#94a3b8", fontWeight: 400,
                textTransform: "none" }}>
                (used in PDF header, e.g. "249 NOS 15417 SQFT")
              </span>
            </label>
            <input value={form.description} onChange={e => f("description", e.target.value)}
              placeholder="e.g. 249 NOS 15417 SQFT"
              style={S.input}/>
          </div>
        </div>

        <div style={S.modalFoot}>
          <button onClick={onClose} style={S.cancelBtn}>Cancel</button>
          <button onClick={handleApply} disabled={loading}
            style={{ ...S.saveBtn, background: "#8b5cf6", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Creating…" : <><FaPlus size={11}/> Create Work from Template</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SAVE AS TEMPLATE MODAL — called from WorkCard / Line Items page
// Export this so PlanningDashboard can open it from the Works tab.
// ═══════════════════════════════════════════════════════════════════════════════
export function SaveAsTemplateModal({ workId, workName, onClose, onSaved, showToast }) {
  const [form, setForm] = useState({
    templateName:        workName ? `${workName} - TEMPLATE` : "",
    templateDescription: "",
    createdBy:           "",
  });
  const [loading, setLoading] = useState(false);

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.templateName.trim()) {
      showToast?.("Template name is required", "error");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${TMPL_API}/save-from-work`, {
        workId,
        templateName:        form.templateName.trim(),
        templateDescription: form.templateDescription.trim() || null,
        createdBy:           form.createdBy.trim() || "User",
      });
      onSaved?.();
    } catch (e) {
      showToast?.(
        "Failed to save template: " + (e.response?.data?.message || e.message),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={{ ...S.modalBox, maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <div style={{ ...S.modalHead, background: "#0f172a", borderRadius: "14px 14px 0 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <FaLayerGroup size={15} color="#10b981"/>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>
              Save as Template
            </span>
          </div>
          <button onClick={onClose} style={{ ...S.iconBtn, color: "#94a3b8" }}>
            <FaTimes size={14}/>
          </button>
        </div>

        <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={S.infoBox}>
            Saving <strong>"{workName}"</strong> as a reusable template.
            All line items and their dependencies will be preserved.
            <strong> Dates are NOT saved</strong> — they will be set fresh each time.
          </div>

          <div>
            <label style={S.lbl}>Template Name <span style={{ color: "#ef4444" }}>*</span></label>
            <input value={form.templateName}
              onChange={e => f("templateName", e.target.value)}
              placeholder="e.g. ALU CASEMENT WINDOW - STANDARD"
              style={S.input} autoFocus/>
          </div>

          <div>
            <label style={S.lbl}>Description (optional)</label>
            <textarea value={form.templateDescription}
              onChange={e => f("templateDescription", e.target.value)}
              placeholder="When to use this template, any notes…"
              style={{ ...S.input, height: 72, resize: "vertical" }}/>
          </div>

          <div>
            <label style={S.lbl}>Saved By</label>
            <input value={form.createdBy}
              onChange={e => f("createdBy", e.target.value)}
              placeholder="Your name"
              style={S.input}/>
          </div>
        </div>

        <div style={S.modalFoot}>
          <button onClick={onClose} style={S.cancelBtn}>Cancel</button>
          <button onClick={handleSave} disabled={loading}
            style={{ ...S.saveBtn, opacity: loading ? 0.7 : 1 }}>
            {loading ? "Saving…" : <><FaSave size={11}/> Save Template</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════════
const S = {
  page:       { padding: "0 0 40px" },
  header:     { display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                marginBottom: 16, flexWrap: "wrap", gap: 12 },
  title:      { margin: 0, fontSize: 21, fontWeight: 700, color: "#1e293b",
                borderLeft: "4px solid #8b5cf6", paddingLeft: 12,
                display: "flex", alignItems: "center" },
  subtitle:   { margin: "4px 0 0 16px", fontSize: 12, color: "#94a3b8" },

  infoBanner: { display: "flex", alignItems: "flex-start", gap: 10,
                background: "#f5f3ff", border: "1px solid #ddd6fe",
                borderRadius: 10, padding: "10px 16px", marginBottom: 20,
                fontSize: 12, color: "#5b21b6" },

  searchRow:  { display: "flex", gap: 10, marginBottom: 20 },
  searchBox:  { display: "flex", alignItems: "center", gap: 8, flex: 1,
                background: "#fff", border: "1px solid #e2e8f0",
                borderRadius: 10, padding: "8px 14px", maxWidth: 440 },
  searchInput:{ border: "none", outline: "none", fontSize: 13, flex: 1,
                color: "#334155", background: "transparent" },
  clearBtn:   { background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 0 },
  searchBtn:  { padding: "9px 18px", background: "#8b5cf6", color: "#fff",
                border: "none", borderRadius: 8, fontSize: 13,
                fontWeight: 600, cursor: "pointer" },

  grid:       { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px,1fr))", gap: 18 },

  card:       { background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0",
                padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,.04)",
                borderTop: "4px solid #8b5cf6",
                display: "flex", flexDirection: "column", gap: 12 },
  cardTop:    { display: "flex", alignItems: "flex-start", gap: 12 },
  cardIcon:   { background: "#f5f3ff", borderRadius: 8, padding: 8,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  cardName:   { fontSize: 14, fontWeight: 700, color: "#1e293b" },
  cardSub:    { fontSize: 11, color: "#64748b", marginTop: 2 },
  cardDesc:   { fontSize: 12, color: "#64748b", fontStyle: "italic",
                background: "#f8fafc", borderRadius: 6, padding: "6px 10px" },
  cardMeta:   { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  metaPill:   { background: "#f1f5f9", color: "#475569", padding: "2px 8px",
                borderRadius: 20, fontSize: 10, fontWeight: 600,
                display: "inline-flex", alignItems: "center" },
  cardActions:{ display: "flex", gap: 8, marginTop: 4 },
  previewBtn: { flex: 1, padding: "8px 12px", background: "#f8fafc",
                border: "1px solid #e2e8f0", borderRadius: 8, cursor: "pointer",
                fontSize: 12, fontWeight: 600, color: "#475569" },
  applyBtn:   { flex: 1, padding: "8px 12px", background: "#8b5cf6",
                border: "none", borderRadius: 8, cursor: "pointer",
                fontSize: 12, fontWeight: 600, color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6 },
  deleteBtn:  { background: "none", border: "none", cursor: "pointer",
                color: "#ef4444", padding: 4, flexShrink: 0 },

  empty:      { textAlign: "center", padding: 40, color: "#94a3b8" },
  emptyBox:   { padding: 60, textAlign: "center", color: "#94a3b8",
                background: "#fff", borderRadius: 14,
                border: "1px dashed #e2e8f0" },

  // Table
  table:      { width: "100%", borderCollapse: "collapse", fontSize: 12 },
  thead:      { background: "#f8fafc", borderBottom: "2px solid #e2e8f0" },
  th:         { padding: "9px 12px", textAlign: "left", fontSize: 10,
                fontWeight: 700, color: "#64748b", textTransform: "uppercase",
                letterSpacing: ".05em", whiteSpace: "nowrap" },
  td:         { padding: "8px 12px", color: "#334155", verticalAlign: "middle",
                borderBottom: "1px solid #f1f5f9" },
  emptyCell:  { textAlign: "center", padding: 32, color: "#94a3b8" },
  deptTag:    { background: "#f0fdf4", color: "#065f46", padding: "2px 7px",
                borderRadius: 5, fontSize: 11, fontWeight: 600 },
  linkPill:   { background: "#ede9fe", color: "#6d28d9", padding: "2px 7px",
                borderRadius: 20, fontSize: 10, fontWeight: 700,
                display: "inline-flex", alignItems: "center", gap: 4 },

  // Modal
  overlay:    { position: "fixed", inset: 0, background: "rgba(15,23,42,.55)",
                backdropFilter: "blur(4px)", zIndex: 1100,
                display: "flex", alignItems: "center", justifyContent: "center", padding: 16 },
  modalBox:   { background: "#fff", borderRadius: 14, width: "100%",
                maxHeight: "90vh", display: "flex", flexDirection: "column",
                boxShadow: "0 20px 60px rgba(0,0,0,.2)" },
  modalHead:  { padding: "15px 22px", borderBottom: "1px solid #f1f5f9",
                display: "flex", justifyContent: "space-between", alignItems: "center" },
  modalFoot:  { padding: "14px 22px", borderTop: "1px solid #e2e8f0",
                display: "flex", justifyContent: "flex-end", gap: 10,
                background: "#f8fafc", borderRadius: "0 0 14px 14px" },

  infoBox:    { background: "#f0fdf4", border: "1px solid #bbf7d0",
                borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#065f46" },
  descBox:    { background: "#f5f3ff", border: "1px solid #ddd6fe",
                borderRadius: 8, padding: "8px 12px", fontSize: 12,
                color: "#5b21b6", marginBottom: 12, fontStyle: "italic" },

  // Form
  lbl:        { display: "block", fontSize: 10, fontWeight: 700, color: "#94a3b8",
                textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 5 },
  input:      { width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0",
                borderRadius: 8, fontSize: 13, outline: "none",
                boxSizing: "border-box", color: "#334155",
                background: "#fff", fontFamily: "inherit" },
  saveBtn:    { background: "#10b981", color: "#fff", border: "none",
                borderRadius: 8, padding: "9px 18px", fontSize: 13,
                fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6 },
  cancelBtn:  { background: "#f8fafc", border: "1px solid #e2e8f0",
                borderRadius: 8, padding: "9px 18px", fontSize: 13,
                fontWeight: 600, cursor: "pointer", color: "#64748b" },
  iconBtn:    { background: "none", border: "none", cursor: "pointer",
                color: "#94a3b8", padding: 4 },

  toast:      { position: "fixed", top: 18, right: 20, zIndex: 9999,
                padding: "11px 18px", borderRadius: 10, fontWeight: 600,
                fontSize: 13, boxShadow: "0 8px 24px rgba(0,0,0,.12)" },
};
