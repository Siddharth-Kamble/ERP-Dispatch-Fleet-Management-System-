import { Link, useLocation, useNavigate } from "react-router-dom";

function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();

    const menuItem = (path) => ({
        display: "block",
        padding: "12px",
        marginBottom: "10px",
        borderRadius: "8px",
        textDecoration: "none",
        background:
            location.pathname === path || location.pathname.startsWith(path + "/")
                ? "#10b981"
                : "#374151",
        color: "#fff",
    });

    const logout = () => {
        localStorage.removeItem("user");
        navigate("/");
    };

    return (
        <>
            <h2 style={{ marginBottom: "30px" }}>🚛 Dispatch ERP</h2>

            <Link to="/dispatch-dashboard" style={menuItem("/dispatch-dashboard")}>
                Dashboard
            </Link>

            <Link
                to="/dispatch-dashboard/vehicles"
                style={menuItem("/dispatch-dashboard/vehicles")}
            >
                Vehicles
            </Link>

            <div style={{ flex: 1 }} />

            <button
                onClick={logout}
                style={{
                    padding: "10px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#ef4444",
                    color: "#fff",
                    cursor: "pointer",
                }}
            >
                Logout
            </button>
        </>
    );
}

export default Sidebar;
