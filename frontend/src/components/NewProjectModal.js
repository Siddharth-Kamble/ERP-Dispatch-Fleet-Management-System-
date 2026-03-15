import React, { useState } from "react";

const NewProjectModal = ({ isOpen, onClose, onCreate }) => {
    // =========================
    // STATE
    // =========================
    const [projectName, setProjectName] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState(null);

    if (!isOpen) return null;

    // =========================
    // SUBMIT HANDLER
    // =========================
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!file) {
            console.warn("⚠️ No file selected!");
            return;
        }

        // Log all form values before sending
        console.log("📤 Preparing New Project:");
        console.log("Project Name:", projectName);
        console.log("Description:", description);
        console.log("File:", file.name, file.type, file.size);

        // Create object to send to parent
        const projectData = {
            projectName,
            description,
            file,
        };

        // Call parent's onCreate
        onCreate(projectData);
    };

    // =========================
    // RENDER
    // =========================
    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <h2>Create New Project</h2>

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Project Name"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        style={inputStyle}
                        required
                    />

                    <textarea
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        style={inputStyle}
                        required
                    />

                    <input
                        type="file"
                        onChange={(e) => setFile(e.target.files[0])}
                        style={inputStyle}
                        required
                    />

                    <div style={{ marginTop: "15px" }}>
                        <button type="submit">Create</button>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{ marginLeft: "10px" }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// =========================
// STYLES
// =========================
const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
};

const modalStyle = {
    background: "#fff",
    padding: "20px",
    borderRadius: "8px",
    width: "400px",
};

const inputStyle = {
    width: "100%",
    marginBottom: "10px",
    padding: "8px",
};

export default NewProjectModal;
