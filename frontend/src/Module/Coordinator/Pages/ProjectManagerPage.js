
    import React, { useState, useEffect } from "react";
    import axios from "axios";
    import * as XLSX from "xlsx"; // Import for Excel Export

    const API_BASE_URL = "http://localhost:8080/projects";
    const TOWER_API = "http://localhost:8080/api/towers";
    const ProjectManagerPage = () => {
        const [projects, setProjects] = useState([]);
        const [loading, setLoading] = useState(true);

        // UI States
        const [viewProject, setViewProject] = useState(null);
        const [isEditing, setIsEditing] = useState(false);
         const [towerCount, setTowerCount] = useState(0);
         const [towerInputs, setTowerInputs] = useState([]);
         const [towers, setTowers] = useState([]);
        const initialFormState = {
            projectCode: "",
            projectName: "",
            projectType: "",
            description: "",
            clientName: "",
            clientContact: "",
            clientEmail: "",
            siteName: "",
            siteAddress: "",
            city: "",
            state: "",
            country: "",
            startDate: "",
            expectedEndDate: "",
            actualEndDate: "",
            projectStatus: "ONGOING",
            estimatedCost: 0,
            contractValue: 0,
            projectManager: "",
            siteEngineer: "",
            totalAreaSqFt: 0,
            numberOfFloors: 0
        };

        const [newProject, setNewProject] = useState(initialFormState);

        useEffect(() => {
            loadProjects();
        }, []);

        const loadProjects = async () => {
            try {
                const res = await axios.get(API_BASE_URL);
                setProjects(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

     // ENHANCED EXCEL EXPORT (Includes all requested columns + Towers)
         const exportToExcel = async () => {
             if (projects.length === 0) {
                 alert("No data available to export.");
                 return;
             }

             try {
                 // Map through projects and fetch towers for each to include in the file
                 const dataToExport = await Promise.all(projects.map(async (p) => {
                     let towerList = "No towers";

                     try {
                         const res = await axios.get(`${TOWER_API}/project/${p.projectId}`);
                         if (Array.isArray(res.data) && res.data.length > 0) {
                             towerList = res.data.map(t => t.towerName).join(", ");
                         }
                     } catch (err) {
                         console.error(`Error fetching towers for project ${p.projectId}`, err);
                     }

                     // Returning every field as a column in the Excel row
                     return {
                         "Project ID": p.projectId,
                         "Project Code": p.projectCode,
                         "Project Name": p.projectName,
                         "Project Type": p.projectType,
                         "Description": p.description,
                         "Client Name": p.clientName,
                         "Client Contact": p.clientContact,
                         "Client Email": p.clientEmail,
                         "Site Name": p.siteName,
                         "Site Address": p.siteAddress,
                         "City": p.city,
                         "State": p.state,
                         "Country": p.country,
                         "Start Date": p.startDate,
                         "Expected End Date": p.expectedEndDate,
                         "Actual End Date": p.actualEndDate || "N/A",
                         "Project Status": p.projectStatus,
                         "Estimated Cost": p.estimatedCost,
                         "Contract Value": p.contractValue,
                         "Project Manager": p.projectManager,
                         "Site Engineer": p.siteEngineer,
                         "Total Area (SqFt)": p.totalAreaSqFt,
                         "Number of Floors": p.numberOfFloors,
                         "Towers Registered": towerList // The joined tower names
                     };
                 }));

                 // Generate worksheet and workbook
                 const worksheet = XLSX.utils.json_to_sheet(dataToExport);
                 const workbook = XLSX.utils.book_new();
                 XLSX.utils.book_append_sheet(workbook, worksheet, "Full_Project_Report");

                 // Write and download the file
                 XLSX.writeFile(workbook, "Comprehensive_Project_Report.xlsx");

             } catch (error) {
                 console.error("Export failed:", error);
                 alert("An error occurred while preparing the Excel report.");
             }
         };
//
//     const handleCreateOrUpdate = async (e) => {
//         e.preventDefault();
//
//         try {
//             let savedProject;
//
//             // ✅ CREATE OR UPDATE PROJECT
//             if (isEditing) {
//                 const res = await axios.put(`${API_BASE_URL}/${newProject.projectId}`, newProject);
//                 savedProject = res.data;
//                 alert("Project Record Updated Successfully ✅");
//             } else {
//                 const res = await axios.post(API_BASE_URL, newProject);
//                 savedProject = res.data;
//                 alert("New Project Registered Successfully ✅");
//             }
//
//             // ✅ DELETE OLD TOWERS (ONLY IN EDIT MODE)
//             if (isEditing && savedProject?.projectId) {
//                 const existingTowers = await axios.get(`${TOWER_API}/project/${savedProject.projectId}`);
//
//                 for (let t of existingTowers.data) {
//                     await axios.delete(`${TOWER_API}/${t.towerId}`);
//                 }
//             }
//
//             // ✅ SAVE NEW TOWERS
//             if (towerInputs.length > 0 && savedProject?.projectId) {
//                 for (let t of towerInputs) {
//                     if (!t.towerName || t.towerName.trim() === "") continue;
//
//                     await axios.post(`${TOWER_API}/project/${savedProject.projectId}`, {
//                         towerName: t.towerName
//                     });
//                 }
//             }
//
//             // ✅ RESET STATES (IMPORTANT)
//             setTowerCount(0);
//             setTowerInputs([]);
//             setTowers([]); // clear UI list
//
//             resetForm();
//             loadProjects();
//
//         } catch (err) {
//             console.error(err);
//             alert("Action failed. Check API connectivity.");
//         }
//     };


// FIND THIS (lines ~100-146) and REPLACE:
const handleCreateOrUpdate = async (e) => {
    e.preventDefault();

    try {
        let savedProject;

        if (isEditing) {
            const res = await axios.put(`${API_BASE_URL}/${newProject.projectId}`, newProject);
            savedProject = res.data;
            alert("Project Record Updated Successfully ✅");
        } else {
            const res = await axios.post(API_BASE_URL, newProject);
            savedProject = res.data;
            alert("New Project Registered Successfully ✅");
        }

        // ❌ REMOVE THIS ENTIRE BLOCK — this is what causes the error
        // if (isEditing && savedProject?.projectId) {
        //     const existingTowers = await axios.get(`${TOWER_API}/project/${savedProject.projectId}`);
        //     for (let t of existingTowers.data) {
        //         await axios.delete(`${TOWER_API}/${t.towerId}`);
        //     }
        // }

        // ✅ TOWERS — only act if user actually typed something
        const hasNewTowerInput = towerInputs.some(t => t.towerName?.trim() !== "");

        if (hasNewTowerInput && savedProject?.projectId) {
            // Add new towers (works for both create and edit)
            for (let t of towerInputs) {
                if (!t.towerName || t.towerName.trim() === "") continue;
                await axios.post(`${TOWER_API}/project/${savedProject.projectId}`, {
                    towerName: t.towerName
                });
            }
        }
        // If user left tower inputs empty in edit mode → existing towers untouched ✅

        setTowerCount(0);
        setTowerInputs([]);
        setTowers([]);
        resetForm();
        loadProjects();

    } catch (err) {
        console.error(err);
        alert("Action failed: " + (err.response?.data?.message || err.message));
    }
};


        const handleDelete = async (e, id) => {
            e.stopPropagation();
            if (!window.confirm("Are you sure you want to delete this project?")) return;
            try {
                await axios.delete(`${API_BASE_URL}/${id}`);
                loadProjects();
            } catch (err) {
                console.error(err);
            }
        };

       const handleEditClick = async (e, project) => {
           e.stopPropagation();
           setIsEditing(true);
           setNewProject(project);

           try {
               const res = await axios.get(`${TOWER_API}/project/${project.projectId}`);
               const towerData = Array.isArray(res.data) ? res.data : [];

               setTowers(towerData);

               // ✅ PREFILL FORM
               setTowerCount(towerData.length);
               setTowerInputs(towerData.map(t => ({ towerName: t.towerName })));

           } catch (err) {
               console.error("Error loading towers", err);
           }

           window.scrollTo({ top: 0, behavior: 'smooth' });
       };

        // ✅ Load Towers
        const loadTowers = async (projectId) => {
            try {
                const res = await axios.get(`${TOWER_API}/project/${projectId}`);
                setTowers(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error("Error loading towers", err);
            }
        };

        // ✅ Handle Tower Count
        const handleTowerCountChange = (count) => {
            setTowerCount(count);

            const inputs = [];
            for (let i = 0; i < count; i++) {
                inputs.push({ towerName: "" });
            }

            setTowerInputs(inputs);
        };

        // ✅ Handle Input Change
        const handleTowerInputChange = (index, value) => {
            const updated = [...towerInputs];
            updated[index].towerName = value;
            setTowerInputs(updated);
        };

        // ✅ Save All Towers
        const handleSaveAllTowers = async (e) => {
            e.preventDefault();

            if (!viewProject?.projectId) {
                alert("Project not selected ❗");
                return;
            }

            try {
                for (let t of towerInputs) {
                    if (t.towerName.trim() === "") continue;

                    await axios.post(`${TOWER_API}/project/${viewProject.projectId}`, {
                        towerName: t.towerName
                    });
                }

                alert("All Towers Added Successfully ✅");

                setTowerCount(0);
                setTowerInputs([]);

                loadTowers(viewProject.projectId);

            } catch (err) {
                console.error(err);
                alert("Error saving towers ❌");
            }
        };

        const resetForm = () => {
            setNewProject(initialFormState);
            setIsEditing(false);
        };

        return (
            <div style={styles.container}>
                <header style={styles.header}>
                    <div>
                        <h1 style={styles.title}>Project Management Portal</h1>
                        <p style={styles.subtitle}>Full-cycle construction and financial tracking</p>
                    </div>
                    {/* Export Button in Header */}
                    <button style={styles.btnExcel} onClick={exportToExcel}>
                        📊 Export Report to Excel
                    </button>
                </header>

                {/* MAIN DATA ENTRY FORM */}
                <section style={styles.card}>
                    <div style={styles.cardHeader}>
                        <h2 style={styles.sectionTitle}>
                            {isEditing ? "Update Project Parameters" : "Project Registration Form"}
                        </h2>
                        {isEditing && (
                            <button onClick={resetForm} style={styles.btnCancel}>Cancel Edit</button>
                        )}
                    </div>

                    <form onSubmit={handleCreateOrUpdate}>
                        <div style={styles.formGrid}>
                            {/* Group 1: Identity */}
                            <div style={styles.formGroup}>
                                <h3 style={styles.formSubTitle}>Core Identity</h3>
                                <input style={styles.input} placeholder="Project Name" value={newProject.projectName} onChange={e => setNewProject({...newProject, projectName: e.target.value})} />
                                <input style={styles.input} placeholder="Project Code" value={newProject.projectCode} onChange={e => setNewProject({...newProject, projectCode: e.target.value})} />
                                <input style={styles.input} placeholder="Project Type" value={newProject.projectType} onChange={e => setNewProject({...newProject, projectType: e.target.value})} />
                                <textarea style={{...styles.input, height: '50px'}} placeholder="Detailed Description" value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} />
                            </div>

                            {/* Group 2: Client */}
                            <div style={styles.formGroup}>
                                <h3 style={styles.formSubTitle}>Client Information</h3>
                                <input style={styles.input} placeholder="Client Name" value={newProject.clientName} onChange={e => setNewProject({...newProject, clientName: e.target.value})} />
                                <input style={styles.input} placeholder="Client Contact" value={newProject.clientContact} onChange={e => setNewProject({...newProject, clientContact: e.target.value})} />
                                <input style={styles.input} placeholder="Client Email" value={newProject.clientEmail} onChange={e => setNewProject({...newProject, clientEmail: e.target.value})} />
                            </div>

                            {/* Group 3: Location */}
                            <div style={styles.formGroup}>
                                <h3 style={styles.formSubTitle}>Site Logistics</h3>
                                <input style={styles.input} placeholder="Site Name" value={newProject.siteName} onChange={e => setNewProject({...newProject, siteName: e.target.value})} />
                                <input style={styles.input} placeholder="Address" value={newProject.siteAddress} onChange={e => setNewProject({...newProject, siteAddress: e.target.value})} />
                                <div style={{display:'flex', gap:'8px'}}>
                                    <input style={{...styles.input, flex:1}} placeholder="City" value={newProject.city} onChange={e => setNewProject({...newProject, city: e.target.value})} />
                                    <input style={{...styles.input, flex:1}} placeholder="State" value={newProject.state} onChange={e => setNewProject({...newProject, state: e.target.value})} />
                                </div>
                                <input style={styles.input} placeholder="Country" value={newProject.country} onChange={e => setNewProject({...newProject, country: e.target.value})} />
                            </div>

                            {/* Group 4: Timeline */}
                            <div style={styles.formGroup}>
                                <h3 style={styles.formSubTitle}>Project Timeline</h3>
                                <label style={styles.label}>Start Date</label>
                                <input style={styles.input} type="date" value={newProject.startDate} onChange={e => setNewProject({...newProject, startDate: e.target.value})} />
                                <label style={styles.label}>Expected End</label>
                                <input style={styles.input} type="date" value={newProject.expectedEndDate} onChange={e => setNewProject({...newProject, expectedEndDate: e.target.value})} />
                                <label style={styles.label}>Actual End</label>
                                <input style={styles.input} type="date" value={newProject.actualEndDate || ""} onChange={e => setNewProject({...newProject, actualEndDate: e.target.value})} />
                            </div>

                            {/* Group 5: Finance */}
                            <div style={styles.formGroup}>
                                <h3 style={styles.formSubTitle}>Financials</h3>
                                <label style={styles.label}>Est. Cost (₹)</label>
                                <input style={styles.input} type="number" value={newProject.estimatedCost} onChange={e => setNewProject({...newProject, estimatedCost: Number(e.target.value)})} />
                                <label style={styles.label}>Contract Value (₹)</label>
                                <input style={styles.input} type="number" value={newProject.contractValue} onChange={e => setNewProject({...newProject, contractValue: Number(e.target.value)})} />
                                <input style={styles.input} placeholder="Manager" value={newProject.projectManager} onChange={e => setNewProject({...newProject, projectManager: e.target.value})} />
                                <input style={styles.input} placeholder="Engineer" value={newProject.siteEngineer} onChange={e => setNewProject({...newProject, siteEngineer: e.target.value})} />
                            </div>

                            {/* Group 6: Specs */}
                            <div style={styles.formGroup}>
                                <h3 style={styles.formSubTitle}>Technical Specs</h3>
                                <label style={styles.label}>Area (Sq Ft)</label>
                                <input style={styles.input} type="number" value={newProject.totalAreaSqFt} onChange={e => setNewProject({...newProject, totalAreaSqFt: Number(e.target.value)})} />
                                <label style={styles.label}>Floors</label>
                                <input style={styles.input} type="number" value={newProject.numberOfFloors} onChange={e => setNewProject({...newProject, numberOfFloors: Number(e.target.value)})} />
                                <label style={styles.label}>Status</label>
                                <select style={styles.input} value={newProject.projectStatus} onChange={e => setNewProject({...newProject, projectStatus: e.target.value})}>
                                    <option value="ONGOING">ONGOING</option>
                                    <option value="COMPLETED">COMPLETED</option>
                                    <option value="DELAYED">DELAYED</option>
                                    <option value="PLANNED">PLANNED</option>
                                </select>
                            </div>

                            {/* Group 7: Tower Setup */}
                            <div style={styles.formGroup}>
                                <h3 style={styles.formSubTitle}>Tower Configuration</h3>

                                <label style={styles.label}>Number of Towers</label>
                                <input
                                    style={styles.input}
                                    type="number"
                                    placeholder="Enter number of towers"
                                    value={towerCount}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        handleTowerCountChange(value ? Number(value) : 0);
                                    }}
                                />

                                {towerInputs.map((t, index) => (
                                    <input
                                        key={index}
                                        style={styles.input}
                                        placeholder={`Tower ${index + 1} Name`}
                                        value={t.towerName}
                                        onChange={(e) => handleTowerInputChange(index, e.target.value)}
                                    />
                                ))}
                            </div>
                        </div>
                        <button type="submit" style={isEditing ? styles.btnUpdate : styles.btnPrimary}>
                            {isEditing ? "Synchronize Updates" : "Register Project Asset"}
                        </button>
                    </form>
                </section>

                {/* PROJECT TABLE */}
                <section style={styles.card}>
                    <h2 style={styles.sectionTitle}>Global Records</h2>
                    <div style={{overflowX: 'auto'}}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Project</th>
                                    <th style={styles.th}>Manager</th>
                                    <th style={styles.th}>Status</th>
                                    <th style={styles.th}>Budget</th>
                                    <th style={styles.th}>Area</th>
                                    <th style={styles.th}>Control</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projects.length > 0 ? (
                                    projects.map((p) => (
                                        <tr key={p.projectId || p.projectCode} style={styles.tr} onClick={() => {
                                                                                                     setViewProject(p);
                                                                                                     loadTowers(p.projectId); // ✅ ADD THIS
                                                                                                 }}>
                                            <td style={styles.td}>
                                                <div style={{fontWeight:'700'}}>{p.projectName}</div>
                                                <div style={{fontSize:'11px', color:'#6366f1'}}>{p.projectCode}</div>
                                            </td>
                                            <td style={styles.td}>{p.projectManager}</td>
                                            <td style={styles.td}>
                                                <span style={{...styles.badge, ...getStatusColors(p.projectStatus)}}>
                                                    {p.projectStatus}
                                                </span>
                                            </td>
                                            <td style={styles.td}>
                                                {new Intl.NumberFormat('en-IN', {
                                                    style: 'currency',
                                                    currency: 'INR',
                                                    maximumFractionDigits: 0
                                                }).format(p.estimatedCost || 0)}
                                            </td>
                                            <td style={styles.td}>{p.totalAreaSqFt} sqft</td>
                                            <td style={styles.td}>
                                                <button style={styles.btnEdit} onClick={(e) => handleEditClick(e, p)}>Edit</button>
                                                <button style={styles.btnDelete} onClick={(e) => handleDelete(e, p.projectId)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" style={{textAlign:'center', padding:'40px', color:'#64748b'}}>
                                            No matching records found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* DETAIL POPUP MODAL */}
                {viewProject && (
                    <div style={styles.modalOverlay} onClick={() => setViewProject(null)}>
                        <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                            <div style={styles.modalHeader}>
                                <div>
                                    <h2 style={{margin:0, color:'#1e293b'}}>{viewProject.projectName}</h2>
                                    <span style={styles.modalCode}>{viewProject.projectCode} | {viewProject.projectType}</span>
                                </div>
                                <button onClick={() => setViewProject(null)} style={styles.btnClose}>✕</button>
                            </div>
                            <div style={styles.modalBody}>
                           <div style={{ ...styles.modalGrid, gap: "10px", rowGap: "1px" }}>
                               <ModalDetailBox title="Stakeholders" items={[
                                   { label: "Project Manager", value: viewProject.projectManager },
                                   { label: "Site Engineer", value: viewProject.siteEngineer },
                                   { label: "Client", value: viewProject.clientName },
                                   { label: "Client Contact", value: viewProject.clientContact }
                               ]} />

                               <ModalDetailBox title="Site & Location" items={[
                                   { label: "Site Name", value: viewProject.siteName },
                                   { label: "Address", value: viewProject.siteAddress },
                                   { label: "Location", value: `${viewProject.city}, ${viewProject.state}` },
                                   { label: "Country", value: viewProject.country }
                               ]} />

                               <ModalDetailBox title="Financial Snapshot" items={[
                                {
                                    label: "Estimated Cost",
                                    value: viewProject.estimatedCost
                                        ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(viewProject.estimatedCost)
                                        : "₹0"
                                },
                                {
                                    label: "Contract Value",
                                    value: viewProject.contractValue
                                        ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(viewProject.contractValue)
                                        : "₹0"
                                },
                                   { label: "Project Status", value: viewProject.projectStatus }
                               ]} />

                               <ModalDetailBox title="Specifications" items={[
                                   { label: "Total Area", value: `${viewProject.totalAreaSqFt} SqFt` },
                                   { label: "Floors", value: `${viewProject.numberOfFloors} Levels` },
                                   { label: "Start Date", value: viewProject.startDate },
                                   { label: "Expected End", value: viewProject.expectedEndDate }
                               ]} />

                               {/* Integrated Towers Section */}
                               <ModalDetailBox
                                   title="Towers"
                                   items={towers.length > 0 ? (
                                       towers.map((t, idx) => ({
                                           label: `Tower ${idx + 1}`,
                                           value: t.towerName || `Tower ${idx + 1}`
                                       }))
                                   ) : [
                                       { label: "Status", value: "No towers registered for this project." }
                                   ]}
                               />
                           </div>
                            {/* Existing Towers */}
                         {/* Display Towers in Modal */}

                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // HELPERS
    const ModalDetailBox = ({title, items}) => (
        <div style={{padding: '10px'}}>
            <h4 style={{fontSize:'12px', color:'#6366f1', textTransform:'uppercase', borderBottom:'2px solid #f1f5f9', paddingBottom:'5px', marginBottom:'10px'}}>{title}</h4>
            {items.map((item, idx) => (
                <div key={idx} style={{display:'flex', justifyContent:'space-between', marginBottom:'6px', fontSize:'13px'}}>
                    <span style={{color:'#94a3b8'}}>{item.label}:</span>
                    <span style={{fontWeight:'600', color:'#1e293b'}}>{item.value || "—"}</span>
                </div>
            ))}
        </div>
    );

    const getStatusColors = (status) => {
        switch(status) {
            case 'COMPLETED': return { backgroundColor: '#dcfce7', color: '#166534' };
            case 'DELAYED': return { backgroundColor: '#fee2e2', color: '#991b1b' };
            case 'ONGOING': return { backgroundColor: '#e0f2fe', color: '#075985' };
            default: return { backgroundColor: '#f1f5f9', color: '#475569' };
        }
    };

    const styles = {
        container: { fontFamily: "'Inter', sans-serif", backgroundColor: "#f1f5f9", minHeight: "100vh", padding: "30px" },
        header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", backgroundColor:'white', padding:'20px', borderRadius:'16px', boxShadow:'0 4px 6px -1px rgba(0,0,0,0.05)' },
        title: { fontSize: "24px", fontWeight: "900", color: "#0f172a", margin: 0 },
        subtitle: { color: "#64748b", margin: 0, fontSize: "13px" },

        btnExcel: { backgroundColor: '#107c41', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' },

        card: { backgroundColor: "white", borderRadius: "20px", padding: "25px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.04)", marginBottom: '20px' },
        cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
        sectionTitle: { fontSize: "18px", fontWeight: "800", color: "#1e293b" },
        formGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" },
        formGroup: { display: "flex", flexDirection: "column", gap: "8px", padding: '15px', backgroundColor: '#fcfcfd', borderRadius: '12px', border: '1px solid #f1f5f9' },
        formSubTitle: { fontSize: "11px", color: "#6366f1", fontWeight: "900", textTransform: "uppercase", letterSpacing: '0.5px' },
        label: { fontSize: "11px", fontWeight: "700", color: "#94a3b8", marginBottom: '-5px' },
        input: { padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px", outline:'none', backgroundColor:'white' },
        btnPrimary: { marginTop: "20px", backgroundColor: "#0f172a", color: "white", padding: "14px", border: "none", borderRadius: "12px", fontWeight: "700", cursor: "pointer", width: "100%" },
        btnUpdate: { marginTop: "20px", backgroundColor: "#059669", color: "white", padding: "14px", border: "none", borderRadius: "12px", fontWeight: "700", cursor: "pointer", width: "100%" },
        btnCancel: { backgroundColor: "#ef4444", color: "white", padding: "6px 12px", border: "none", borderRadius: "8px", fontSize: "12px", cursor: "pointer" },

        table: { width: "100%", borderCollapse: "separate", borderSpacing: "0 8px" },
        th: { textAlign: "left", padding: "12px", color: "#64748b", fontSize: "11px", textTransform: "uppercase", fontWeight: "800" },
        td: { padding: "15px", backgroundColor: "white", fontSize: "13px", borderTop: "1px solid #f1f5f9", borderBottom: "1px solid #f1f5f9" },
        tr: { cursor: "pointer", transition: "0.2s" },
        badge: { padding: "4px 10px", borderRadius: "8px", fontSize: "10px", fontWeight: "800" },
        btnEdit: { color: "#4f46e5", background: "none", border: "none", fontWeight: "700", cursor: "pointer", marginRight: "12px" },
        btnDelete: { color: "#ef4444", background: "none", border: "none", fontWeight: "700", cursor: "pointer" },

        modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
        modalContent: { backgroundColor: 'white', padding: '30px', borderRadius: '24px', width: '800px', maxWidth: '95%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' },
        modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom:'1px solid #f1f5f9', paddingBottom:'15px' },
        modalCode: { fontSize: '12px', color: '#6366f1', fontWeight: 'bold' },
        btnClose: { background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold' },
        modalGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }
    };

    export default ProjectManagerPage;