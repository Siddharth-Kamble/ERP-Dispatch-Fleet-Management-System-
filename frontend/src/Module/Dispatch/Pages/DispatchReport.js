import React, { useState, useEffect } from "react";
import axios from "axios";

const DispatchManager = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [materials, setMaterials] = useState([{ materialName: "", quantity: "" }]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [formData, setFormData] = useState({
    sqft: "", jobCardNo: "", dcNo: "", remark: "",
    vehicleDriver: "", driver: "", recordDate: ""
  });

  // Fetch records state
  const [fetchStart, setFetchStart] = useState("");
  const [fetchEnd, setFetchEnd]     = useState("");
  const [fetchedRecords, setFetchedRecords] = useState([]);
  const [editRecord, setEditRecord] = useState(null); // record being edited

  // Report download state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate]     = useState("");
  const [loading, setLoading]     = useState(false);

  useEffect(() => {
    axios.get("http://localhost:8080/projects")
      .then(res => setProjects(res.data))
      .catch(err => console.error("Error fetching projects", err));

    axios.get("http://localhost:8080/api/vehicles")
      .then(res => setVehicles(res.data))
      .catch(err => console.error("Error fetching vehicles", err));

    axios.get("http://localhost:8080/api/drivers/names")
      .then(res => setDrivers(res.data))
      .catch(err => console.error("Error fetching drivers", err));
  }, []);

  // ── Add record ──────────────────────────────────────────────────────────
  const handleMaterialChange = (index, e) => {
    const updated = [...materials];
    updated[index][e.target.name] = e.target.value;
    setMaterials(updated);
  };

  const addMaterialRow    = () => setMaterials([...materials, { materialName: "", quantity: "" }]);
  const removeMaterialRow = (i) => setMaterials(materials.filter((_, idx) => idx !== i));
  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAddRecord = async (e) => {
    e.preventDefault();
    if (!selectedProject)      return alert("Select a project");
    if (!formData.recordDate)  return alert("Select a date");

    const finalData = {
      ...formData,
      materials: materials.map(m => ({
        materialName: m.materialName,
        quantity: Number(m.quantity)
      }))
    };

    try {
      setLoading(true);
      await axios.post(`http://localhost:8080/project-records/${selectedProject}`, finalData);
      alert("Record added successfully!");
      setFormData({ sqft: "", jobCardNo: "", dcNo: "", remark: "", vehicleDriver: "", driver: "", recordDate: "" });
      setMaterials([{ materialName: "", quantity: "" }]);
      setSelectedProject("");
    } catch {
      alert("Error adding record");
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch records by date range ─────────────────────────────────────────
  const handleFetchRecords = async () => {
    if (!fetchStart || !fetchEnd) return alert("Select both dates");
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8080/project-records/filter", {
        params: { startDate: fetchStart, endDate: fetchEnd }
      });
      setFetchedRecords(res.data);
      if (res.data.length === 0) alert("No records found for this date range");
    } catch {
      alert("Error fetching records");
    } finally {
      setLoading(false);
    }
  };

  // ── Edit / Update ───────────────────────────────────────────────────────
  const openEdit = (record) => {
    setEditRecord({
      ...record,
      materials: record.materials?.length
        ? record.materials.map(m => ({ materialName: m.materialName, quantity: m.quantity }))
        : [{ materialName: "", quantity: "" }]
    });
  };

  const handleEditChange = (e) => setEditRecord({ ...editRecord, [e.target.name]: e.target.value });

  const handleEditMaterialChange = (index, e) => {
    const updated = [...editRecord.materials];
    updated[index][e.target.name] = e.target.value;
    setEditRecord({ ...editRecord, materials: updated });
  };

  const addEditMaterialRow    = () => setEditRecord({ ...editRecord, materials: [...editRecord.materials, { materialName: "", quantity: "" }] });
  const removeEditMaterialRow = (i) => setEditRecord({ ...editRecord, materials: editRecord.materials.filter((_, idx) => idx !== i) });

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const payload = {
        ...editRecord,
        materials: editRecord.materials.map(m => ({
          materialName: m.materialName,
          quantity: Number(m.quantity)
        }))
      };
      await axios.put(`http://localhost:8080/project-records/${editRecord.id}`, payload);
      alert("Record updated!");
      setEditRecord(null);
      // Refresh the fetched list
      handleFetchRecords();
    } catch {
      alert("Error updating record");
    } finally {
      setLoading(false);
    }
  };

const handleDelete = async (recordId) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
        setLoading(true);
        await axios.delete(`http://localhost:8080/project-records/${recordId}`);
        alert("Record deleted!");
        setFetchedRecords(prev => prev.filter(r => r.id !== recordId));
    } catch {
        alert("Error deleting record");
    } finally {
        setLoading(false);
    }
};

  // ── PDF download ────────────────────────────────────────────────────────
  const handleDownload = async () => {
    if (!startDate || !endDate) return alert("Select date range");
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8080/project-records/download-pdf", {
        params: { startDate, endDate },
        responseType: "blob"
      });
      const url  = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href  = url;
      link.setAttribute("download", `Dispatch_Report_${startDate}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert("Error generating PDF");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB");
  };

  const formatMaterials = (mats) => {
    if (!mats?.length) return "-";
    return mats.map(m => `${m.materialName}: ${m.quantity}`).join(", ");
  };

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div style={styles.pageBackground}>
      <div style={styles.glassContainer}>
        <h2 style={styles.heading}>Dispatch & Project Records</h2>

        {/* ── SECTION 1: ADD RECORD ── */}
        <section style={styles.section}>
          <h3 style={styles.subHeading}>Add new entry</h3>
          <form onSubmit={handleAddRecord}>
            <div style={styles.gridForm}>
              <select style={styles.input} value={selectedProject} onChange={e => setSelectedProject(e.target.value)}>
                <option value="">Select project</option>
                {projects.map(p => <option key={p.projectId} value={p.projectId}>{p.projectName}</option>)}
              </select>
              <input type="number" name="sqft" placeholder="Sqft" style={styles.input} value={formData.sqft} onChange={handleInputChange} />
              <input type="text" name="jobCardNo" placeholder="Job card no" style={styles.input} value={formData.jobCardNo} onChange={handleInputChange} />
              <input type="text" name="dcNo" placeholder="DC no" style={styles.input} value={formData.dcNo} onChange={handleInputChange} />
              <select name="vehicleDriver" style={styles.input} value={formData.vehicleDriver} onChange={handleInputChange}>
                <option value="">Select vehicle</option>
                {vehicles.map(v => <option key={v.id} value={v.vehicleNumber}>{v.vehicleNumber}</option>)}
              </select>
              <select name="driver" style={styles.input} value={formData.driver} onChange={handleInputChange}>
                <option value="">Select driver</option>
                {drivers.map((d, i) => <option key={i} value={d}>{d}</option>)}
              </select>
              <input type="date" name="recordDate" style={{ ...styles.input, gridColumn: "span 2" }} value={formData.recordDate} onChange={handleInputChange} />
            </div>

            <div style={{ marginTop: 15 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: "#34495e" }}>Materials & quantity</label>
              {materials.map((item, index) => (
                <div key={index} style={{ display: "flex", gap: 10, marginTop: 10 }}>
                  <input type="text" name="materialName" placeholder="Material name" style={{ ...styles.input, flex: 3 }} value={item.materialName} onChange={e => handleMaterialChange(index, e)} />
                  <input type="text" name="quantity" placeholder="Qty" style={{ ...styles.input, flex: 1 }} value={item.quantity} onChange={e => handleMaterialChange(index, e)} />
                  {index === materials.length - 1
                    ? <button type="button" onClick={addMaterialRow} style={styles.plusButton}>+</button>
                    : <button type="button" onClick={() => removeMaterialRow(index)} style={styles.removeButton}>×</button>
                  }
                </div>
              ))}
            </div>

            <textarea name="remark" placeholder="Remarks" style={{ ...styles.input, width: "100%", marginTop: 15, height: 80 }} value={formData.remark} onChange={handleInputChange} />
            <button type="submit" style={styles.primaryButton} disabled={loading}>{loading ? "Processing..." : "Save record"}</button>
          </form>
        </section>

        <hr style={styles.divider} />

        {/* ── SECTION 2: FETCH RECORDS ── */}
        <section style={styles.section}>
          <h3 style={styles.subHeading}>Fetch records by date range</h3>
          <div style={styles.reportRow}>
            <input type="date" style={styles.input} value={fetchStart} onChange={e => setFetchStart(e.target.value)} />
            <input type="date" style={styles.input} value={fetchEnd}   onChange={e => setFetchEnd(e.target.value)} />
            <button onClick={handleFetchRecords} style={styles.fetchButton} disabled={loading}>
              {loading ? "Loading..." : "Fetch records"}
            </button>
          </div>

          {fetchedRecords.length > 0 && (
            <div style={{ overflowX: "auto", marginTop: 20 }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {["#", "Date", "Project", "Sqft", "Job card", "DC no", "Vehicle", "Driver", "Materials", "Remark", "Action"].map(h => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fetchedRecords.map((r, i) => (
                    <tr key={r.id} style={i % 2 === 0 ? {} : { background: "rgba(0,0,0,0.02)" }}>
                      <td style={styles.td}>{i + 1}</td>
                      <td style={styles.td}>{formatDate(r.recordDate)}</td>
                      <td style={styles.td}>{r.project?.projectName || "-"}</td>
                      <td style={styles.td}>{r.sqft || "-"}</td>
                      <td style={styles.td}>{r.jobCardNo || "-"}</td>
                      <td style={styles.td}>{r.dcNo || "-"}</td>
                      <td style={styles.td}>{r.vehicleDriver || "-"}</td>
                      <td style={styles.td}>{r.driver || "-"}</td>
                      <td style={styles.td}>{formatMaterials(r.materials)}</td>
                      <td style={styles.td}>{r.remark || "-"}</td>
                    <td style={styles.td}>
                        <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => openEdit(r)} style={styles.editButton}>Edit</button>
                            <button onClick={() => handleDelete(r.id)} style={styles.deleteButton}>Delete</button>
                        </div>
                    </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ── EDIT MODAL ── */}
        {editRecord && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalBox}>
              <h3 style={{ ...styles.subHeading, marginBottom: 16 }}>Edit record</h3>

              <div style={styles.gridForm}>
                <input type="number" name="sqft" placeholder="Sqft" style={styles.input} value={editRecord.sqft || ""} onChange={handleEditChange} />
                <input type="text" name="jobCardNo" placeholder="Job card no" style={styles.input} value={editRecord.jobCardNo || ""} onChange={handleEditChange} />
                <input type="text" name="dcNo" placeholder="DC no" style={styles.input} value={editRecord.dcNo || ""} onChange={handleEditChange} />
                <select name="vehicleDriver" style={styles.input} value={editRecord.vehicleDriver || ""} onChange={handleEditChange}>
                  <option value="">Select vehicle</option>
                  {vehicles.map(v => <option key={v.id} value={v.vehicleNumber}>{v.vehicleNumber}</option>)}
                </select>
                <select name="driver" style={styles.input} value={editRecord.driver || ""} onChange={handleEditChange}>
                  <option value="">Select driver</option>
                  {drivers.map((d, i) => <option key={i} value={d}>{d}</option>)}
                </select>
                <input type="date" name="recordDate" style={styles.input} value={editRecord.recordDate || ""} onChange={handleEditChange} />
              </div>

              <div style={{ marginTop: 14 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: "#34495e" }}>Materials & quantity</label>
                {editRecord.materials.map((item, index) => (
                  <div key={index} style={{ display: "flex", gap: 10, marginTop: 10 }}>
                    <input type="text" name="materialName" placeholder="Material name" style={{ ...styles.input, flex: 3 }} value={item.materialName} onChange={e => handleEditMaterialChange(index, e)} />
                    <input type="text" name="quantity" placeholder="Qty" style={{ ...styles.input, flex: 1 }} value={item.quantity} onChange={e => handleEditMaterialChange(index, e)} />
                    {index === editRecord.materials.length - 1
                      ? <button type="button" onClick={addEditMaterialRow} style={styles.plusButton}>+</button>
                      : <button type="button" onClick={() => removeEditMaterialRow(index)} style={styles.removeButton}>×</button>
                    }
                  </div>
                ))}
              </div>

              <textarea name="remark" placeholder="Remarks" style={{ ...styles.input, width: "100%", marginTop: 14, height: 70 }} value={editRecord.remark || ""} onChange={handleEditChange} />

              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <button onClick={handleUpdate} style={{ ...styles.primaryButton, marginTop: 0, flex: 1 }} disabled={loading}>
                  {loading ? "Saving..." : "Update record"}
                </button>
                <button onClick={() => setEditRecord(null)} style={{ ...styles.primaryButton, marginTop: 0, flex: 1, background: "#95a5a6" }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <hr style={styles.divider} />

        {/* ── SECTION 3: DOWNLOAD PDF ── */}
        <section style={styles.section}>
          <h3 style={styles.subHeading}>Generate dispatch report</h3>
          <div style={styles.reportRow}>
            <input type="date" style={styles.input} value={startDate} onChange={e => setStartDate(e.target.value)} />
            <input type="date" style={styles.input} value={endDate}   onChange={e => setEndDate(e.target.value)} />
            <button onClick={handleDownload} style={styles.secondaryButton} disabled={loading}>
              Download PDF
            </button>
          </div>
        </section>

      </div>
    </div>
  );
};

const styles = {
  pageBackground: { minHeight: "100vh", background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", padding: "40px 20px", fontFamily: "'Segoe UI', sans-serif" },
  glassContainer: { maxWidth: "900px", margin: "0 auto", background: "rgba(255,255,255,0.75)", backdropFilter: "blur(10px)", borderRadius: 15, padding: 40, boxShadow: "0 8px 32px rgba(31,38,135,0.15)", border: "1px solid rgba(255,255,255,0.18)" },
  heading:    { color: "#2c3e50", textAlign: "center", marginBottom: 30, fontSize: 24 },
  subHeading: { color: "#34495e", marginBottom: 15, fontSize: 18 },
  section:    { marginBottom: 20 },
  gridForm:   { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 },
  reportRow:  { display: "flex", gap: 10, alignItems: "center" },
  input: { padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 13, outline: "none", background: "white", boxSizing: "border-box" },
  plusButton:      { padding: "0 14px", background: "#2ecc71", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 20, fontWeight: "bold" },
  removeButton:    { padding: "0 14px", background: "#e74c3c", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 18 },
  primaryButton:   { width: "100%", marginTop: 20, padding: 12, background: "#2ecc71", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold" },
  secondaryButton: { padding: "10px 24px", background: "#3498db", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold" },
  fetchButton:     { padding: "10px 24px", background: "#9b59b6", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold", whiteSpace: "nowrap" },
  editButton:      { padding: "4px 12px", background: "#f39c12", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12 },
      deleteButton: { padding: "4px 12px", background: "#e74c3c", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12 },

  divider: { margin: "30px 0", border: 0, borderTop: "1px solid #eee" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 12, background: "white", borderRadius: 8, overflow: "hidden" },
  th: { background: "#f8f9fa", padding: "10px 12px", textAlign: "left", fontWeight: 600, color: "#34495e", borderBottom: "1px solid #eee", whiteSpace: "nowrap" },
  td: { padding: "9px 12px", borderBottom: "1px solid #f0f0f0", color: "#2c3e50", verticalAlign: "top" },
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modalBox: { background: "white", borderRadius: 12, padding: 30, width: "90%", maxWidth: 600, maxHeight: "90vh", overflowY: "auto" }
};

export default DispatchManager;