////import React, { useState } from "react";
////import axios from "axios";
////
////const FLOOR_API = "http://localhost:8080/floors";
////const FLAT_API = "http://localhost:8080/flats";
////
////const FloorFlatManager = () => {
////  const [projectName, setProjectName] = useState("");
////  const [projectId, setProjectId] = useState(null);
////
////  const [floors, setFloors] = useState([]);
////  const [selectedFloorId, setSelectedFloorId] = useState(null);
////
////  const [flats, setFlats] = useState([]);
////  const [flatNumber, setFlatNumber] = useState("");
////
////  // ✅ Get Project ID
////  const fetchProjectId = async () => {
////    const res = await axios.get(`${FLOOR_API}/projectId/${projectName}`);
////    setProjectId(res.data);
////
////    if (res.data !== 0) {
////      loadFloors(res.data);
////    } else {
////      alert("Project not found ❌");
////    }
////  };
////
////  // ✅ Load Floors
////  const loadFloors = async (id) => {
////    const res = await axios.get(`${FLOOR_API}/project/${id}`);
////    setFloors(res.data);
////  };
////
////  // ✅ Select Floor + Load Flats
////  const handleSelectFloor = async (floorId) => {
////    setSelectedFloorId(floorId);
////
////    const res = await axios.get(`${FLAT_API}/floor/${floorId}`);
////    setFlats(res.data);
////  };
////
////  // ✅ Add Flat
////  const handleAddFlat = async (e) => {
////    e.preventDefault();
////
////    if (!selectedFloorId) {
////      alert("Select a floor first ❗");
////      return;
////    }
////
////    const flatData = {
////      flatNumber: flatNumber,
////    };
////
////    await axios.post(`${FLAT_API}/${selectedFloorId}`, flatData);
////
////    alert("Flat Added ✅");
////    setFlatNumber("");
////
////    // reload flats
////    handleSelectFloor(selectedFloorId);
////  };
////
////  return (
////    <div style={{ padding: "20px" }}>
////      <h2>🏢 Floor & Flat Allocation</h2>
////
////      {/* PROJECT */}
////      <input
////        placeholder="Enter Project Name"
////        value={projectName}
////        onChange={(e) => setProjectName(e.target.value)}
////      />
////      <button onClick={fetchProjectId}>Load Project</button>
////
////      <hr />
////
////      {/* FLOORS */}
////      <h3>Floors</h3>
////      <ul>
////        {floors.map((f) => (
////          <li key={f.floorId}>
////            Floor {f.floorNumber}
////            <button onClick={() => handleSelectFloor(f.floorId)}>
////              View Flats
////            </button>
////          </li>
////        ))}
////      </ul>
////
////      <hr />
////
////      {/* FLATS */}
////      {selectedFloorId && (
////        <>
////          <h3>Flats (Floor ID: {selectedFloorId})</h3>
////
////          <form onSubmit={handleAddFlat}>
////            <input
////              placeholder="Flat Number (e.g. F101)"
////              value={flatNumber}
////              onChange={(e) => setFlatNumber(e.target.value)}
////              required
////            />
////            <button type="submit">Add Flat</button>
////          </form>
////
////          <ul>
////            {flats.map((f) => (
////              <li key={f.flatId}>{f.flatNumber}</li>
////            ))}
////          </ul>
////        </>
////      )}
////    </div>
////  );
////};
////
////export default FloorFlatManager;
//
//import React, { useState } from "react";
//import axios from "axios";
//
//const PROJECT_API = "http://localhost:8080/projects";
//const FLOOR_API = "http://localhost:8080/floors";
//const FLAT_API = "http://localhost:8080/flats";
//
//const FloorFlatManager = () => {
//  const [projects, setProjects] = useState([]);
//  const [projectId, setProjectId] = useState(null);
//
//  const [floors, setFloors] = useState([]);
//  const [selectedFloorId, setSelectedFloorId] = useState(null);
//
//  const [flats, setFlats] = useState([]);
//  const [flatNumber, setFlatNumber] = useState("");
//
//  const [showDropdown, setShowDropdown] = useState(false);
//
//  // ✅ Load all projects (from your API)
//  const loadProjects = async () => {
//    try {
//      const res = await axios.get(PROJECT_API);
//      setProjects(res.data);
//      setShowDropdown(true);
//    } catch (err) {
//      console.error(err);
//    }
//  };
//
//  // ✅ When user selects project
//  const handleSelectProject = async (id) => {
//    setProjectId(id);
//    setShowDropdown(false);
//
//    loadFloors(id);
//  };
//
//  // ✅ Load Floors
//  const loadFloors = async (id) => {
//    const res = await axios.get(`${FLOOR_API}/project/${id}`);
//    setFloors(res.data);
//  };
//
//  // ✅ Select Floor + Load Flats
//  const handleSelectFloor = async (floorId) => {
//    setSelectedFloorId(floorId);
//
//    const res = await axios.get(`${FLAT_API}/floor/${floorId}`);
//    setFlats(res.data);
//  };
//
//  // ✅ Add Flat
//  const handleAddFlat = async (e) => {
//    e.preventDefault();
//
//    if (!selectedFloorId) {
//      alert("Select a floor first ❗");
//      return;
//    }
//
//    const flatData = {
//      flatNumber: flatNumber,
//    };
//
//    await axios.post(`${FLAT_API}/${selectedFloorId}`, flatData);
//
//    alert("Flat Added ✅");
//    setFlatNumber("");
//
//    handleSelectFloor(selectedFloorId);
//  };
//
//  return (
//    <div style={{ padding: "20px" }}>
//      <h2>🏢 Floor & Flat Allocation</h2>
//
//      {/* LOAD PROJECT BUTTON */}
//      <button onClick={loadProjects}>Load Projects</button>
//
//      {/* DROPDOWN */}
//      {showDropdown && (
//        <div>
//          <h4>Select Project</h4>
//          <select onChange={(e) => handleSelectProject(e.target.value)}>
//            <option value="">-- Select Project --</option>
//            {projects.map((p) => (
//              <option key={p.projectId} value={p.projectId}>
//                {p.projectName}
//              </option>
//            ))}
//          </select>
//        </div>
//      )}
//
//      {projectId && <p>Selected Project ID: {projectId}</p>}
//
//      <hr />
//
//      {/* FLOORS */}
//      <h3>Floors</h3>
//      <ul>
//        {floors.map((f) => (
//          <li key={f.floorId}>
//            Floor {f.floorNumber}
//            <button onClick={() => handleSelectFloor(f.floorId)}>
//              View Flats
//            </button>
//          </li>
//        ))}
//      </ul>
//
//      <hr />
//
//      {/* FLATS */}
//      {selectedFloorId && (
//        <>
//          <h3>Flats (Floor ID: {selectedFloorId})</h3>
//
//          <form onSubmit={handleAddFlat}>
//            <input
//              placeholder="Flat Number (e.g. F101)"
//              value={flatNumber}
//              onChange={(e) => setFlatNumber(e.target.value)}
//              required
//            />
//            <button type="submit">Add Flat</button>
//          </form>
//
//          <ul>
//            {flats.map((f) => (
//              <li key={f.flatId}>{f.flatNumber}</li>
//            ))}
//          </ul>
//        </>
//      )}
//    </div>
//  );
//};
//
//export default FloorFlatManager;

//import React, { useState } from "react";
//import axios from "axios";
//
//const PROJECT_API = "http://localhost:8080/projects";
//const FLOOR_API = "http://localhost:8080/floors";
//const FLAT_API = "http://localhost:8080/flats";
//
//const FloorFlatManager = () => {
//  const [projects, setProjects] = useState([]);
//  const [projectId, setProjectId] = useState("");
//
//  const [floors, setFloors] = useState([]);
//  const [selectedFloorId, setSelectedFloorId] = useState("");
//
//  const [flats, setFlats] = useState([]);
//  const [flatName, setFlatName] = useState("");
//
//  // ✅ Load Projects
//  const loadProjects = async () => {
//    const res = await axios.get(PROJECT_API);
//    setProjects(res.data);
//  };
//
//  // ✅ Load Floors
//  const loadFloors = async (projectId) => {
//    const res = await axios.get(`${FLOOR_API}/project/${projectId}`);
//    setFloors(res.data);
//  };
//
//  // ✅ When Project Selected
//  const handleProjectChange = (id) => {
//    setProjectId(id);
//    loadFloors(id);
//  };
//
//  // ✅ Select Floor
//  const handleSelectFloor = async (floorId) => {
//    setSelectedFloorId(floorId);
//
//    const res = await axios.get(`${FLAT_API}/floor/${floorId}`);
//    setFlats(res.data);
//  };
//
//  // ✅ Add Flat (Manual Name)
//  const handleAddFlat = async (e) => {
//    e.preventDefault();
//
//    if (!flatName) {
//      alert("Enter flat name ❗");
//      return;
//    }
//
//    await axios.post(`${FLAT_API}/floor/${selectedFloorId}`, {
//      flatNumber: flatName,
//    });
//
//    setFlatName("");
//    handleSelectFloor(selectedFloorId);
//  };
//
//  return (
//    <div style={{ padding: "20px" }}>
//      <h2>🏢 Manual Flat Allocation</h2>
//
//      {/* PROJECT */}
//      <button onClick={loadProjects}>Load Projects</button>
//
//      <select onChange={(e) => handleProjectChange(e.target.value)}>
//        <option value="">-- Select Project --</option>
//        {projects.map((p) => (
//          <option key={p.projectId} value={p.projectId}>
//            {p.projectName}
//          </option>
//        ))}
//      </select>
//
//      <hr />
//
//      {/* FLOORS */}
//      <h3>Floors</h3>
//      <ul>
//        {floors.map((f) => (
//          <li key={f.floorId}>
//            Floor {f.floorNumber}
//            <button onClick={() => handleSelectFloor(f.floorId)}>
//              Select
//            </button>
//          </li>
//        ))}
//      </ul>
//
//      <hr />
//
//      {/* FLATS */}
//      {selectedFloorId && (
//        <>
//          <h3>Flats (Floor ID: {selectedFloorId})</h3>
//
//          <form onSubmit={handleAddFlat}>
//            <input
//              placeholder="Enter Flat Name (e.g. A-101)"
//              value={flatName}
//              onChange={(e) => setFlatName(e.target.value)}
//            />
//            <button type="submit">Add Flat</button>
//          </form>
//
//          <ul>
//            {flats.map((f) => (
//              <li key={f.flatId}>{f.flatNumber}</li>
//            ))}
//          </ul>
//        </>
//      )}
//    </div>
//  );
//};
//
//export default FloorFlatManager;

//    import React, { useState } from "react";
//    import axios from "axios";
//
//    const PROJECT_API = "http://localhost:8080/projects";
//    const FLOOR_API = "http://localhost:8080/floors";
//    const FLAT_API = "http://localhost:8080/flats";
//
//    const FloorFlatManager = () => {
//      const [projects, setProjects] = useState([]);
//      const [projectId, setProjectId] = useState("");
//
//      const [floors, setFloors] = useState([]);
//      const [floorNumber, setFloorNumber] = useState("");
//
//      const [selectedFloorId, setSelectedFloorId] = useState("");
//      const [flats, setFlats] = useState([]);
//      const [flatName, setFlatName] = useState("");
//
//      // ✅ Load Projects
//      const loadProjects = async () => {
//        const res = await axios.get(PROJECT_API);
//        setProjects(res.data);
//      };
//
//      // ✅ Load Floors
//      const loadFloors = async (projectId) => {
//        const res = await axios.get(`${FLOOR_API}/project/${projectId}`);
//        setFloors(res.data);
//      };
//
//      // ✅ Select Project
//      const handleProjectChange = (id) => {
//        setProjectId(id);
//        loadFloors(id);
//        setSelectedFloorId("");
//        setFlats([]);
//      };
//
//      // ✅ Add Floor
//      const handleAddFloor = async (e) => {
//        e.preventDefault();
//
//        if (!floorNumber) {
//          alert("Enter floor number ❗");
//          return;
//        }
//
//        await axios.post(`${FLOOR_API}/project/${projectId}`, {
//          floorNumber: floorNumber,
//        });
//
//        setFloorNumber("");
//        loadFloors(projectId);
//      };
//
//      // ✅ Select Floor
//      const handleSelectFloor = async (floorId) => {
//        setSelectedFloorId(floorId);
//
//        const res = await axios.get(`${FLAT_API}/floor/${floorId}`);
//        setFlats(res.data);
//      };
//
//      // ✅ Add Flat
//      const handleAddFlat = async (e) => {
//        e.preventDefault();
//
//        if (!flatName) {
//          alert("Enter flat name ❗");
//          return;
//        }
//
//        await axios.post(`${FLAT_API}/floor/${selectedFloorId}`, {
//          flatNumber: flatName,
//        });
//
//        setFlatName("");
//        handleSelectFloor(selectedFloorId);
//      };
//
//      return (
//        <div style={{ padding: "20px" }}>
//          <h2>🏢 Floor & Flat Management</h2>
//
//          {/* PROJECT */}
//          <button onClick={loadProjects}>Load Projects</button>
//
//          <select onChange={(e) => handleProjectChange(e.target.value)}>
//            <option value="">-- Select Project --</option>
//            {projects.map((p) => (
//              <option key={p.projectId} value={p.projectId}>
//                {p.projectName}
//              </option>
//            ))}
//          </select>
//
//          <hr />
//
//          {/* ADD FLOOR */}
//          {projectId && (
//            <>
//              <h3>Add Floor</h3>
//              <form onSubmit={handleAddFloor}>
//                <input
//                  type="number"
//                  placeholder="Enter Floor Number (e.g. 1)"
//                  value={floorNumber}
//                  onChange={(e) => setFloorNumber(e.target.value)}
//                />
//                <button type="submit">Add Floor</button>
//              </form>
//
//              <hr />
//
//              {/* FLOOR LIST */}
//              <h3>Floors</h3>
//              <ul>
//                {floors.map((f) => (
//                  <li key={f.floorId}>
//                    Floor {f.floorNumber}
//                    <button onClick={() => handleSelectFloor(f.floorId)}>
//                      Manage Flats
//                    </button>
//                  </li>
//                ))}
//              </ul>
//            </>
//          )}
//
//          <hr />
//
//          {/* ADD FLAT */}
//          {selectedFloorId && (
//            <>
//              <h3>Flats (Floor ID: {selectedFloorId})</h3>
//
//              <form onSubmit={handleAddFlat}>
//                <input
//                  placeholder="Enter Flat Name (e.g. A-101)"
//                  value={flatName}
//                  onChange={(e) => setFlatName(e.target.value)}
//                />
//                <button type="submit">Add Flat</button>
//              </form>
//
//              <ul>
//                {flats.map((f) => (
//                  <li key={f.flatId}>{f.flatNumber}</li>
//                ))}
//              </ul>
//            </>
//          )}
//        </div>
//      );
//    };
//
//    export default FloorFlatManager;


import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaBuilding,
  FaLayerGroup,
  FaDoorOpen,
  FaPlusCircle,
  FaSyncAlt,
  FaChevronRight
} from "react-icons/fa";

const PROJECT_API = "http://localhost:8080/projects";
const FLOOR_API = "http://localhost:8080/floors";
const FLAT_API = "http://localhost:8080/flats";

const FloorFlatManager = () => {
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");

  const [floors, setFloors] = useState([]);
  const [floorNumber, setFloorNumber] = useState("");

  const [selectedFloorId, setSelectedFloorId] = useState("");
  const [flats, setFlats] = useState([]);
  const [flatName, setFlatName] = useState("");

  // Auto-load projects on mount
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await axios.get(PROJECT_API);
      setProjects(res.data);
    } catch (err) {
      console.error("Error loading projects", err);
    }
  };

  const loadFloors = async (projectId) => {
    try {
      const res = await axios.get(`${FLOOR_API}/project/${projectId}`);
      setFloors(res.data);
    } catch (err) {
      console.error("Error loading floors", err);
    }
  };

  const handleProjectChange = (id) => {
    setProjectId(id);
    loadFloors(id);
    setSelectedFloorId("");
    setFlats([]);
  };

  const handleAddFloor = async (e) => {
    e.preventDefault();
    if (!floorNumber) {
      alert("Enter floor number ❗");
      return;
    }
    await axios.post(`${FLOOR_API}/project/${projectId}`, {
      floorNumber: floorNumber,
    });
    setFloorNumber("");
    loadFloors(projectId);
  };

  const handleSelectFloor = async (floorId) => {
    setSelectedFloorId(floorId);
    try {
      const res = await axios.get(`${FLAT_API}/floor/${floorId}`);
      setFlats(res.data);
    } catch (err) {
      console.error("Error loading flats", err);
    }
  };

  const handleAddFlat = async (e) => {
    e.preventDefault();
    if (!flatName) {
      alert("Enter flat name ❗");
      return;
    }
    await axios.post(`${FLAT_API}/floor/${selectedFloorId}`, {
      flatNumber: flatName,
    });
    setFlatName("");
    handleSelectFloor(selectedFloorId);
  };

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <FaBuilding style={{ marginRight: "12px", color: "#6366f1" }} />
            Floor & Flat Inventory
          </h1>
          <p style={styles.subtitle}>Structure your property levels and units efficiently</p>
        </div>
        <button style={styles.refreshBtn} onClick={loadProjects}>
          <FaSyncAlt /> Refresh Data
        </button>
      </header>

      <div style={styles.mainGrid}>
        {/* Left Column: Projects & Floors */}
        <div style={styles.column}>
          <section style={styles.card}>
            <h3 style={styles.cardTitle}>1. Select Project</h3>
            <div style={styles.selectWrapper}>
              <select
                style={styles.select}
                onChange={(e) => handleProjectChange(e.target.value)}
                value={projectId}
              >
                <option value="">Choose a construction project...</option>
                {projects.map((p) => (
                  <option key={p.projectId} value={p.projectId}>
                    {p.projectName}
                  </option>
                ))}
              </select>
            </div>

            {projectId && (
              <div style={{ marginTop: "25px" }}>
                <h3 style={styles.cardTitle}>2. Add New Floor</h3>
                <form onSubmit={handleAddFloor} style={styles.inlineForm}>
                  <input
                    type="number"
                    style={styles.input}
                    placeholder="Floor Level (e.g. 5)"
                    value={floorNumber}
                    onChange={(e) => setFloorNumber(e.target.value)}
                  />
                  <button type="submit" style={styles.primaryBtn}>
                    <FaPlusCircle /> Add
                  </button>
                </form>

                <div style={styles.listContainer}>
                  <h4 style={styles.listTitle}>Available Floors</h4>
                  {floors.length === 0 ? (
                    <p style={styles.emptyText}>No floors added yet.</p>
                  ) : (
                    floors.map((f) => (
                      <div
                        key={f.floorId}
                        style={{
                          ...styles.listItem,
                          backgroundColor: selectedFloorId === f.floorId ? "#eef2ff" : "white",
                          border: selectedFloorId === f.floorId ? "1px solid #6366f1" : "1px solid #e2e8f0"
                        }}
                        onClick={() => handleSelectFloor(f.floorId)}
                      >
                        <div style={styles.listInfo}>
                          <FaLayerGroup style={{ color: "#6366f1" }} />
                          <span>Floor {f.floorNumber}</span>
                        </div>
                        <FaChevronRight style={{ color: "#94a3b8", fontSize: "12px" }} />
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Flats */}
        <div style={styles.column}>
          <section style={styles.card}>
            <h3 style={styles.cardTitle}>
              {selectedFloorId ? `Manage Units: Floor ${floors.find(f => f.floorId === selectedFloorId)?.floorNumber}` : "3. Unit Management"}
            </h3>

            {!selectedFloorId ? (
              <div style={styles.placeholder}>
                <FaDoorOpen style={styles.placeholderIcon} />
                <p>Select a floor level from the left to manage individual flats or units.</p>
              </div>
            ) : (
              <>
                <form onSubmit={handleAddFlat} style={styles.inlineForm}>
                  <input
                    style={styles.input}
                    placeholder="Unit Name (e.g. B-402)"
                    value={flatName}
                    onChange={(e) => setFlatName(e.target.value)}
                  />
                  <button type="submit" style={styles.successBtn}>
                    <FaPlusCircle /> Register Flat
                  </button>
                </form>

                <div style={styles.flatGrid}>
                  {flats.length === 0 ? (
                    <div style={styles.emptyFlat}>No flats registered on this floor.</div>
                  ) : (
                    flats.map((f) => (
                      <div key={f.flatId} style={styles.flatCard}>
                        <div style={styles.flatIcon}><FaDoorOpen /></div>
                        <div style={styles.flatNumber}>{f.flatNumber}</div>
                        <div style={styles.flatStatus}>Residential</div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "30px",
    fontFamily: "'Inter', sans-serif",
    backgroundColor: "#f8fafc",
    minHeight: "100vh",
    color: "#1e293b"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px"
  },
  title: {
    fontSize: "28px",
    fontWeight: "800",
    margin: 0,
    display: "flex",
    alignItems: "center",
    color: "#0f172a"
  },
  subtitle: {
    color: "#64748b",
    marginTop: "5px",
    fontSize: "15px"
  },
  refreshBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "white",
    border: "1px solid #e2e8f0",
    padding: "10px 18px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    color: "#475569",
    transition: "all 0.2s"
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: "25px"
  },
  column: {
    display: "flex",
    flexDirection: "column"
  },
  card: {
    backgroundColor: "white",
    borderRadius: "20px",
    padding: "25px",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    height: "100%",
    border: "1px solid #f1f5f9"
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: "700",
    marginBottom: "15px",
    color: "#334155",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  selectWrapper: {
    position: "relative"
  },
  select: {
    width: "100%",
    padding: "12px 15px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    backgroundColor: "#fcfcfd",
    fontSize: "14px",
    color: "#1e293b",
    outline: "none",
    cursor: "pointer"
  },
  inlineForm: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px"
  },
  input: {
    flex: 1,
    padding: "12px 15px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    outline: "none",
    transition: "border 0.2s"
  },
  primaryBtn: {
    backgroundColor: "#6366f1",
    color: "white",
    border: "none",
    padding: "0 20px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  successBtn: {
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    padding: "0 20px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  listContainer: {
    marginTop: "20px"
  },
  listTitle: {
    fontSize: "13px",
    color: "#94a3b8",
    fontWeight: "600",
    marginBottom: "10px"
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px",
    borderRadius: "12px",
    marginBottom: "8px",
    cursor: "pointer",
    transition: "all 0.2s"
  },
  listInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontWeight: "600",
    fontSize: "14px"
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: "14px",
    textAlign: "center",
    padding: "20px"
  },
  placeholder: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "300px",
    color: "#94a3b8",
    textAlign: "center",
    padding: "0 40px"
  },
  placeholderIcon: {
    fontSize: "50px",
    marginBottom: "15px",
    color: "#f1f5f9"
  },
  flatGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
    gap: "15px",
    marginTop: "20px"
  },
  flatCard: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "15px",
    padding: "15px",
    textAlign: "center",
    transition: "transform 0.2s, box-shadow 0.2s",
    ":hover": {
        transform: "translateY(-3px)",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
    }
  },
  flatIcon: {
    color: "#10b981",
    marginBottom: "8px",
    fontSize: "20px"
  },
  flatNumber: {
    fontWeight: "700",
    fontSize: "15px",
    color: "#1e293b"
  },
  flatStatus: {
    fontSize: "11px",
    color: "#94a3b8",
    marginTop: "4px"
  },
  emptyFlat: {
    gridColumn: "1 / -1",
    textAlign: "center",
    padding: "40px",
    color: "#94a3b8",
    backgroundColor: "#f8fafc",
    borderRadius: "15px",
    border: "1px dashed #e2e8f0"
  }
};

export default FloorFlatManager;