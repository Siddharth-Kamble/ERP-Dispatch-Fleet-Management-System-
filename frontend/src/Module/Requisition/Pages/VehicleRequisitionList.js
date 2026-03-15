import React, { useEffect, useState } from "react";
import { getSmartGroups } from "../Services/requisitionService";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

function VehicleRequisitionList() {

    const [groups, setGroups] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {

        try {

            const data = await getSmartGroups();

            setGroups(data);

        } catch (error) {

            console.error("Failed to load groups", error);
        }
    };

    const statusColor = (status) => {

        switch (status) {
            case "APPROVED":
                return "green";
            case "REJECTED":
                return "red";
            case "PENDING":
                return "orange";
            default:
                return "gray";
        }
    };

    return (

        <div style={styles.container}>

            <h2 style={styles.title}>
                Smart Vehicle Requisition Groups
            </h2>

            {groups.length === 0 && (
                <p style={{color:"#64748b"}}>No Smart Groups Found</p>
            )}

            {groups.map((group, index) => (

                <div key={index} style={styles.card}>

                    <div style={styles.header}>
                        {group[0]?.locationFrom} → {group[group.length-1]?.locationTo}
                        {" "}({group.length} Requests)
                    </div>

                    <table style={styles.table}>

                        <thead style={styles.thead}>
                            <tr>
                                <th style={styles.th}>Req No</th>
                                <th style={styles.th}>Requested By</th>
                                <th style={styles.th}>Date</th>
                                <th style={styles.th}>Time</th>
                                <th style={styles.th}>Project</th>
                                <th style={styles.th}>From</th>
                                <th style={styles.th}>To</th>
                                <th style={styles.th}>Department</th>
                                <th style={styles.th}>Status</th>
                                <th style={styles.th}>Attachment</th>
                            </tr>
                        </thead>

                        <tbody>

                            {group.map((r) => (

                                <tr key={r.id} style={styles.row}>

                                    <td style={styles.td}>{r.requisitionNo}</td>
                                    <td style={styles.td}>{r.requisitionBy}</td>
                                    <td style={styles.td}>{r.requisitionDate}</td>
                                    <td style={styles.td}>{r.requisitionTime}</td>
                                    <td style={styles.td}>{r.projectName}</td>
                                    <td style={styles.td}>{r.locationFrom}</td>
                                    <td style={styles.td}>{r.locationTo}</td>
                                    <td style={styles.td}>{r.department}</td>

                                    <td style={styles.td}>
                                        <span
                                            style={{
                                                padding:"4px 10px",
                                                borderRadius:"6px",
                                                color:"white",
                                                fontSize:"12px",
                                                background:statusColor(r.status)
                                            }}
                                        >
                                            {r.status}
                                        </span>
                                    </td>

                                    <td style={styles.td}>

                                        {r.fileId ? (

                                            <button
                                                style={styles.btn}
                                                onClick={() =>
                                                    window.open(
                                                        `${API_URL}/api/files/download/${r.fileId}`
                                                    )
                                                }
                                            >
                                                View File
                                            </button>

                                        ) : "No File"}

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            ))}

        </div>
    );
}

export default VehicleRequisitionList;



// ================= STYLES =================

const styles = {

container:{
 padding:"30px",
 background:"#f8fafc",
 minHeight:"100vh"
},

title:{
 marginBottom:"20px"
},

card:{
 border:"1px solid #e5e7eb",
 borderRadius:"10px",
 marginBottom:"25px",
 background:"white",
 boxShadow:"0 2px 8px rgba(0,0,0,0.05)"
},

header:{
 background:"#f1f5f9",
 padding:"12px",
 fontWeight:"600"
},

table:{
 width:"100%",
 borderCollapse:"collapse"
},

thead:{
 background:"#f9fafb"
},

th:{
 padding:"10px",
 fontSize:"14px",
 fontWeight:"600"
},

td:{
 padding:"10px",
 fontSize:"14px"
},

row:{
 borderTop:"1px solid #eee"
},

btn:{
 padding:"5px 10px",
 background:"#2563eb",
 color:"white",
 border:"none",
 borderRadius:"5px",
 cursor:"pointer"
}

};