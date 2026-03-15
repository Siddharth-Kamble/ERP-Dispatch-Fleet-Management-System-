import React, { useEffect, useState } from "react";
import NewProjectModal from "../components/NewProjectModal";
import { createProject, getProjects } from "../services/projectService";

const VPDashboard = () => {
    // =========================
    // STATE
    // =========================
    const [openNewProject, setOpenNewProject] = useState(false);
    const [projects, setProjects] = useState([]);
    const [successMessage, setSuccessMessage] = useState("");

    // ⚠️ Later this should come from login/auth
    const loggedInVpName = "Siddharth Kamble";

    // =========================
    // SAMPLE DASHBOARD DATA
    // =========================


    // =========================
    // LOAD PROJECTS
    // =========================
    const loadProjects = async () => {
        try {
            const res = await getProjects();
            setProjects(res.data);
        } catch (error) {
            console.error("Failed to load projects", error);
        }
    };

    useEffect(() => {
        loadProjects();
    }, []);

    // =========================
    // CREATE PROJECT
    // =========================
    const handleCreateProject = async (data) => {
        try {
            const formData = new FormData();
            formData.append("projectName", data.projectName);
            formData.append("description", data.description);
            formData.append("createdBy", loggedInVpName);
            formData.append("workOrder", data.file);

            await createProject(formData);

            // ✅ Success UX
            setSuccessMessage("✅ Project created successfully");
            setOpenNewProject(false);
            loadProjects();

            // Auto-hide message
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (error) {
            console.error("Project creation failed", error);
        }
    };
    // =========================
// MONTHLY PROJECT COUNT (DYNAMIC)
// =========================
    // =========================
// FIXED LAST 5 MONTHS + DB COUNT
// =========================
    // =========================
// LAST 5 MONTHS + YEAR (CURRENT FIRST)
// =========================
    const getLastFiveMonthsOrders = () => {
        const now = new Date();

        const result = [];

        for (let i = 0; i < 5; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);

            const monthYear = d.toLocaleString("default", {
                month: "short",
                year: "numeric",
            });

            result.push({
                name: monthYear, // ✅ Feb 2026
                orders: 0,
            });
        }

        // As per your requirement:
        // Only current month orders from DB
        result[0].orders = projects.length;

        return result;
    };

    const monthlyOrders = getLastFiveMonthsOrders();






    // =========================
    // UI
    // =========================
    return (
        <div style={pageStyle}>
            {/* Header */}
            <div style={headerStyle}>
                <h1>VP Dashboard</h1>

                <button
                    style={newProjectBtn}
                    onClick={() => setOpenNewProject(true)}
                >
                    + New Project
                </button>
            </div>

            {/* ✅ Success Message */}
            {successMessage && (
                <div
                    style={{
                        backgroundColor: "#d4edda",
                        color: "#155724",
                        padding: "10px",
                        borderRadius: "4px",
                        marginBottom: "15px",
                        textAlign: "center",
                    }}
                >
                    {successMessage}
                </div>
            )}

            {/* Dashboard Cards */}
            <div style={cardContainer}>
                {monthlyOrders.map((item, index) => (
                    <div key={index} style={cardStyle}>
                        <h3>{item.name}</h3>
                        <p>Total Orders: {item.orders}</p>
                    </div>
                ))}
            </div>

            {/* =========================
               PROJECT LIST
               ========================= */}
            <div style={{ marginTop: "30px" }}>
                <h2>Projects</h2>

                {projects.length === 0 ? (
                    <p>No projects created yet.</p>
                ) : (
                    <ul style={projectListStyle}>
                        {projects.map((project) => (
                            <li key={project.id} style={projectItemStyle}>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <div>
                                        <strong>{project.projectName}</strong>
                                        <p style={{ margin: "4px 0" }}>
                                            {project.createdBy === loggedInVpName
                                                ? "Created by You"
                                                : `Created by ${project.createdBy}`}
                                        </p>
                                    </div>

                                    <a
                                        href={`http://localhost:8080/api/projects/${project.id}/work-order`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            padding: "6px 10px",
                                            backgroundColor: "#1976d2",
                                            color: "#fff",
                                            borderRadius: "4px",
                                            textDecoration: "none",
                                            fontSize: "13px",
                                        }}
                                    >
                                        Download PDF
                                    </a>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* =========================
               MODAL
               ========================= */}
            <NewProjectModal
                isOpen={openNewProject}
                onClose={() => setOpenNewProject(false)}
                onCreate={handleCreateProject}
            />
        </div>
    );
};

/* =========================
   STYLES
   ========================= */

const pageStyle = {
    padding: "20px",
    minHeight: "100vh",
    backgroundColor: "#f4f6f8",
};

const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
};

const newProjectBtn = {
    padding: "10px 16px",
    backgroundColor: "#1976d2",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
};

const cardContainer = {
    display: "flex",
    gap: "15px",
    flexWrap: "wrap",
};

const cardStyle = {
    background: "#fff",
    padding: "15px",
    borderRadius: "6px",
    width: "180px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
};

const projectListStyle = {
    listStyle: "none",
    padding: 0,
    marginTop: "15px",
};

const projectItemStyle = {
    background: "#fff",
    padding: "12px",
    borderRadius: "6px",
    marginBottom: "10px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
};

export default VPDashboard;
