import React, { useState } from "react";
import {
    FaBars,
    FaSignOutAlt,
    FaClipboardList,
    FaFolderOpen,
    FaPlusCircle,
    FaListAlt,
    FaArrowLeft
} from "react-icons/fa";

import AddVehicleRequisition from "../Module/Requisition/Pages/AddVehicleRequisition";
import VehicleRequisitionList from "../Module/Requisition/Pages/VehicleRequisitionList";

function PurchaseDashboard() {

    const [activePage, setActivePage] = useState("dashboard");

    const user = JSON.parse(localStorage.getItem("user"));
    const departmentName = user?.role || "PURCHASE";

    const handleLogout = () => {
        localStorage.removeItem("user");
        window.location.href = "/";
    };

    /* ===== BACK BUTTON LOGIC ===== */
    const goBack = () => {
        if (activePage === "create" || activePage === "view")
            setActivePage("planning");
        else if (activePage === "planning")
            setActivePage("dashboard");
    };

    return (
        <div style={styles.container}>

            {/* ===== SIDEBAR ===== */}
            <aside style={styles.sidebar}>

                <h2 style={styles.logo}>PURCHASE DASHBOARD</h2>

                <button
                    style={{
                        ...styles.navItem,
                        ...(activePage === "dashboard" && styles.activeNav)
                    }}
                    onClick={() => setActivePage("dashboard")}
                >
                    <FaClipboardList style={styles.icon}/>
                    Dashboard
                </button>

                <button
                    style={{
                        ...styles.navItem,
                        ...(activePage !== "dashboard" && styles.activeNav)
                    }}
                    onClick={() => setActivePage("planning")}
                >
                    <FaFolderOpen style={styles.icon}/>
                    Requisition Planning
                </button>

                <button style={styles.logout} onClick={handleLogout}>
                    <FaSignOutAlt style={styles.icon}/>
                    Logout
                </button>

            </aside>

            {/* ===== MAIN ===== */}
            <div style={styles.mainWrapper}>

                {/* HEADER */}
                <header style={styles.header}>
                    <FaBars/>

                    <span style={styles.title}>
                        {departmentName} Module
                    </span>

                    <div style={styles.userBadge}>
                        {user?.fullName}
                    </div>
                </header>

                {/* CONTENT */}
                <main style={styles.main}>

                    {(activePage !== "dashboard") && (
                        <button style={styles.backBtn} onClick={goBack}>
                            <FaArrowLeft/> Back
                        </button>
                    )}

                    {/* DASHBOARD */}
                    {activePage === "dashboard" && (
                        <div style={styles.dashboardCard}
                             onClick={()=>setActivePage("planning")}>
                            <FaFolderOpen size={45}/>
                            <h2>Requisition Planning</h2>
                            <p>Create & Manage Vehicle Requests</p>
                        </div>
                    )}

                    {/* PLANNING */}
                    {activePage === "planning" && (
                        <div style={styles.folderBox}>

                            <h2>Requisition Planning</h2>

                            <div style={styles.grid}>

                                <div
                                    style={styles.card}
                                    onClick={()=>setActivePage("create")}
                                >
                                    <FaPlusCircle size={30}/>
                                    <h3>Create Requisition</h3>
                                </div>

                                <div
                                    style={styles.card}
                                    onClick={()=>setActivePage("view")}
                                >
                                    <FaListAlt size={30}/>
                                    <h3>View Requisitions</h3>
                                </div>

                            </div>

                        </div>
                    )}

                    {activePage === "create" && <AddVehicleRequisition/>}
                    {activePage === "view" && <VehicleRequisitionList/>}

                </main>

                {/* FOOTER */}
                <footer style={styles.footer}>
                    © 2026 OneDeoleela Transit System
                    <span>Purchase Module • Version 1.0</span>
                </footer>

            </div>
        </div>
    );
}

export default PurchaseDashboard;


/* ====================== STYLES ====================== */

const styles = {

    container:{
        display:"flex",
        height:"100vh",
        fontFamily:"Segoe UI",
        background:"#f3f4f6"
    },

    /* SIDEBAR */
    sidebar:{
        width:"240px",
        background:"#ffffff",
        borderRight:"1px solid #e5e7eb",
        padding:"25px",
        display:"flex",
        flexDirection:"column"
    },

    logo:{
        fontSize:"20px",
        fontWeight:"700",
        marginBottom:"40px",
        color:"#2563eb"
    },

    navItem:{
        display:"flex",
        alignItems:"center",
        padding:"12px",
        marginBottom:"10px",
        border:"none",
        background:"transparent",
        cursor:"pointer",
        borderRadius:"8px",
        color:"#374151",
        transition:"0.3s"
    },

    activeNav:{
        background:"#eff6ff",
        borderLeft:"4px solid #2563eb",
        color:"#2563eb"
    },

    icon:{marginRight:"10px"},

    logout:{
        marginTop:"auto",
        padding:"12px",
        background:"#ef4444",
        border:"none",
        color:"#fff",
        borderRadius:"8px",
        cursor:"pointer"
    },

    /* MAIN */
    mainWrapper:{
        flex:1,
        display:"flex",
        flexDirection:"column"
    },

    header:{
        height:"65px",
        background:"#fff",
        display:"flex",
        alignItems:"center",
        justifyContent:"space-between",
        padding:"0 25px",
        borderBottom:"1px solid #e5e7eb"
    },

    title:{
        fontWeight:"600"
    },

    userBadge:{
        background:"#2563eb",
        color:"#fff",
        padding:"6px 14px",
        borderRadius:"20px",
        fontSize:"13px"
    },

    main:{
        padding:"35px",
        flex:1,
        overflowY:"auto"
    },

    /* BACK BUTTON */
    backBtn:{
        marginBottom:"20px",
        padding:"8px 15px",
        border:"none",
        background:"#2563eb",
        color:"#fff",
        borderRadius:"6px",
        cursor:"pointer"
    },

    /* DASHBOARD CARD */
    dashboardCard:{
        background:"#fff",
        padding:"60px",
        borderRadius:"15px",
        textAlign:"center",
        boxShadow:"0 10px 25px rgba(0,0,0,0.05)",
        cursor:"pointer",
        maxWidth:"420px",
        margin:"auto"
    },

    /* PLANNING BOX */
    folderBox:{
        background:"#fff",
        padding:"35px",
        borderRadius:"15px",
        boxShadow:"0 10px 25px rgba(0,0,0,0.05)"
    },

    grid:{
        display:"flex",
        gap:"25px",
        marginTop:"20px"
    },

    card:{
        flex:1,
        background:"#f9fafb",
        padding:"40px",
        borderRadius:"12px",
        textAlign:"center",
        cursor:"pointer",
        border:"1px solid #e5e7eb"
    },

    /* FOOTER */
    footer:{
        height:"50px",
        background:"#fff",
        borderTop:"1px solid #e5e7eb",
        display:"flex",
        alignItems:"center",
        justifyContent:"space-between",
        padding:"0 25px",
        fontSize:"13px",
        color:"#6b7280"
    }
};