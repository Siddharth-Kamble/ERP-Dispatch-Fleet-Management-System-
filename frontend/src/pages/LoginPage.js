import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function LoginPage() {
    const [eCode, setECode] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/auth/login`,
                {
                    eCode: Number(eCode),
                    password: password,
                }
            );

            const user = response.data;
            localStorage.setItem("user", JSON.stringify(user));
            navigate(`/${user.role.toLowerCase()}-dashboard`);
        } catch (error) {
            alert("Invalid Credentials");
        }
    };

    return (
        <>
            <div style={styles.wrapper}>
                <div style={styles.overlay}></div>

                <div style={styles.card}>
                    <img src="/logo.jpg" alt="Company Logo" style={styles.logo} />

                    <h1 style={styles.title}>ONEDLFS TRANSIT</h1>
                    <p style={styles.subtitle}>
                        Engineering Excellence • Structural Precision
                    </p>

                    <form onSubmit={handleLogin} style={styles.form}>
                        <input
                            type="number"
                            placeholder="Employee Code"
                            value={eCode}
                            onChange={(e) => setECode(e.target.value)}
                            required
                            style={styles.input}
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={styles.input}
                        />

                        <button type="submit" style={styles.button}>
                            Secure Login
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}

const styles = {
    wrapper: {
        height: "100vh",
        background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        fontFamily: "Segoe UI, sans-serif",
    },

    overlay: {
        position: "absolute",
        width: "100%",
        height: "100%",
        backgroundImage:
            "url('https://images.unsplash.com/photo-1503387762-592deb58ef4e')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        opacity: 0.08,
    },

    card: {
        width: "420px",
        padding: "50px 40px",
        background: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(15px)",
        borderRadius: "12px",
        boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
        textAlign: "center",
        zIndex: 2,
        border: "1px solid rgba(255,255,255,0.1)",
    },

    logo: {
        width: "100px",
        marginBottom: "10px",
    },

    title: {
        color: "#ffffff",
        letterSpacing: "2px",
        marginBottom: "5px",
    },

    subtitle: {
        fontSize: "12px",
        color: "#cccccc",
        marginBottom: "30px",
    },

    form: {
        display: "flex",
        flexDirection: "column",
    },

    input: {
        padding: "14px",
        marginBottom: "18px",
        borderRadius: "6px",
        border: "none",
        background: "rgba(255,255,255,0.15)",
        color: "white",
        fontSize: "14px",
        outline: "none",
    },

    button: {
        padding: "14px",
        borderRadius: "6px",
        border: "none",
        background: "linear-gradient(45deg, #c9a227, #f5d76e)",
        color: "#111",
        fontWeight: "bold",
        cursor: "pointer",
        fontSize: "15px",
        transition: "0.3s",
    },
};

export default LoginPage;