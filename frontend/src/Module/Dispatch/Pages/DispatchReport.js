import React, { useState, useEffect } from "react";
import axios from "axios";

const DispatchManager = () => {

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");


  const [materials, setMaterials] = useState([{ materialName: "", quantity: "" }]);
   const [vehicles, setVehicles] = useState([]);   // ✅ NEW
   const [drivers, setDrivers] = useState([]);
  const [formData, setFormData] = useState({
    sqft: "",
    jobCardNo: "",
    dcNo: "",
    remark: "",
    vehicleDriver: "",
     driver: "",        // ✅ NEW
      recordDate: ""
  });

  // States for Report
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  // Load projects for the dropdown on mount
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

  // Handle changes for dynamic material rows
  const handleMaterialChange = (index, e) => {
    const newMaterials = [...materials];
    newMaterials[index][e.target.name] = e.target.value;
    setMaterials(newMaterials);
  };

  const addMaterialRow = () => {
    setMaterials([...materials, { materialName: "", quantity: "" }]);
  };

  const removeMaterialRow = (index) => {
    if (materials.length > 1) {
      const newMaterials = materials.filter((_, i) => i !== index);
      setMaterials(newMaterials);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();
    if (!selectedProject) return alert("Select a Project");
      if (!formData.recordDate) return alert("Select Date");

    // Combine form data with the dynamic materials list
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
      // Reset form and materials
     setFormData({
       sqft: "",
       jobCardNo: "",
       dcNo: "",
       remark: "",
       vehicleDriver: "",
       driver: "",
       recordDate: ""
     });
      setMaterials([{ materialName: "", quantity: "" }]);
      setSelectedProject("");
    } catch (error) {
      alert("Error adding record");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!startDate || !endDate) return alert("Select date range");

    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8080/project-records/download-pdf`,
        {
          params: { startDate, endDate },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Dispatch_Report_${startDate}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert("Error generating PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageBackground}>
      <div style={styles.glassContainer}>
        <h2 style={styles.heading}>Dispatch & Project Records</h2>

        {/* SECTION 1: ADD NEW RECORD */}
        <section style={styles.section}>
          <h3 style={styles.subHeading}>Add New Entry</h3>
          <form onSubmit={handleAddRecord}>
            <div style={styles.gridForm}>
              <select
                style={styles.input}
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
              >
                <option value="">Select Project</option>
                {projects.map(p => <option key={p.projectId} value={p.projectId}>{p.projectName}</option>)}
              </select>

              <input type="number" name="sqft" placeholder="Sqft" style={styles.input} value={formData.sqft} onChange={handleInputChange} />
              <input type="text" name="jobCardNo" placeholder="Job Card No" style={styles.input} value={formData.jobCardNo} onChange={handleInputChange} />
              <input type="text" name="dcNo" placeholder="DC No" style={styles.input} value={formData.dcNo} onChange={handleInputChange} />
<select
   name="vehicleDriver"
  style={styles.input}
  value={formData.vehicleDriver}
  onChange={handleInputChange}
>
  <option value="">Select Vehicle</option>
  {vehicles.map(v => (
    <option key={v.id} value={v.vehicleNumber}>
      {v.vehicleNumber}
    </option>
  ))}
</select>            <select
                       name="driver"
                       style={styles.input}
                       value={formData.driver}
                       onChange={handleInputChange}
                     >
                       <option value="">Select Driver</option>
                       {drivers.map((d, index) => (
                         <option key={index} value={d}>
                           {d}
                         </option>
                       ))}
                     </select>

              <input
                type="date"
                name="recordDate"
                style={styles.input}
                value={formData.recordDate}
                onChange={handleInputChange}
              />

            </div>

            {/* DYNAMIC MATERIALS SECTION */}
            <div style={{ marginTop: "15px" }}>
              <label style={{ fontSize: "14px", fontWeight: "bold", color: "#34495e" }}>Materials & Quantity</label>
              {materials.map((item, index) => (
                <div key={index} style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <input
                    type="text"
                    name="materialName"
                    placeholder="Material Name"
                    style={{ ...styles.input, flex: 3 }}
                    value={item.materialName}
                    onChange={(e) => handleMaterialChange(index, e)}
                  />
                  <input
                    type="text"
                    name="quantity"
                    placeholder="Qty"
                    style={{ ...styles.input, flex: 1 }}
                    value={item.quantity}
                    onChange={(e) => handleMaterialChange(index, e)}
                  />
                  {index === materials.length - 1 ? (
                    <button type="button" onClick={addMaterialRow} style={styles.plusButton}>+</button>
                  ) : (
                    <button type="button" onClick={() => removeMaterialRow(index)} style={styles.removeButton}>×</button>
                  )}
                </div>
              ))}
            </div>

            <textarea
              name="remark"
              placeholder="Remarks"
              style={{...styles.input, width: "100%", marginTop: "15px", height: "80px"}}
              value={formData.remark}
              onChange={handleInputChange}
            />

            <button type="submit" style={styles.primaryButton} disabled={loading}>
              {loading ? "Processing..." : "Save Record"}
            </button>
          </form>
        </section>

        <hr style={styles.divider} />

        {/* SECTION 2: DOWNLOAD REPORT */}
        <section style={styles.section}>
          <h3 style={styles.subHeading}>Generate Dispatch Report</h3>
          <div style={styles.reportRow}>
            <input type="date" style={styles.input} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <input type="date" style={styles.input} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            <button onClick={handleDownload} style={styles.secondaryButton} disabled={loading}>
              Download PDF Report
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

const styles = {
  pageBackground: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    padding: "40px 20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  glassContainer: {
    maxWidth: "800px",
    margin: "0 auto",
    background: "rgba(255, 255, 255, 0.7)",
    backdropFilter: "blur(10px)",
    borderRadius: "15px",
    padding: "40px",
    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
    border: "1px solid rgba(255, 255, 255, 0.18)",
  },
  heading: { color: "#2c3e50", textAlign: "center", marginBottom: "30px", fontSize: "24px" },
  subHeading: { color: "#34495e", marginBottom: "15px", fontSize: "18px" },
  section: { marginBottom: "20px" },
  gridForm: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" },
  reportRow: { display: "flex", gap: "10px", alignItems: "center" },
  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    outline: "none",
    background: "white",
    boxSizing: "border-box"
  },
  plusButton: {
    padding: "0 15px",
    backgroundColor: "#2ecc71",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "20px",
    fontWeight: "bold"
  },
  removeButton: {
    padding: "0 15px",
    backgroundColor: "#e74c3c",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "18px"
  },
  primaryButton: {
    width: "100%",
    marginTop: "20px",
    padding: "12px",
    backgroundColor: "#2ecc71",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold"
  },
  secondaryButton: {
    padding: "12px 25px",
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold"
  },
  divider: { margin: "30px 0", border: "0", borderTop: "1px solid #eee" }
};

export default DispatchManager;