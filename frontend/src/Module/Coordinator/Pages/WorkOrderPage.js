
import React, { useState, useRef, useCallback } from "react";
import {
    FaArrowLeft, FaFilePdf, FaMagic, FaPlus, FaTrash,
    FaSave, FaCheckCircle, FaExclamationTriangle,
    FaRobot, FaCloudUploadAlt, FaListOl, FaSpinner,
    FaEye, FaInfoCircle
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import * as PDFJS from "pdfjs-dist";

// Match worker to installed pdfjs-dist version (works for v5.x with CRA & Vite)
PDFJS.GlobalWorkerOptions.workerSrc =
    new URL("pdfjs-dist/build/pdf.worker.mjs", import.meta.url).toString();

// ─── helpers ──────────────────────────────────────────────────────────────────
const emptyRow = () => ({
    id: Date.now() + Math.random(),
    srNo: "", length: "", height: "", sqft: "",
    woQtySqft: "", woQtyNos: "", floorPlanQty: "",
});

const calcSqft = (length, height) => {
    const l = parseFloat(length), h = parseFloat(height);
    return (!isNaN(l) && !isNaN(h) && l > 0 && h > 0) ? (l * h).toFixed(2) : "";
};

// ─── Convert PDF pages → base64 JPEG (capped at 1600px, quality 0.80) ────────
async function pdfToImages(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFJS.getDocument({ data: arrayBuffer }).promise;
    const images = [];
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 });
        // Cap max dimension to 1600px so Grok doesn't reject large payloads
        const maxDim = 1600;
        const ratio = Math.min(1, maxDim / Math.max(viewport.width, viewport.height));
        const finalViewport = page.getViewport({ scale: 1.5 * ratio });
        const canvas = document.createElement("canvas");
        canvas.width  = Math.floor(finalViewport.width);
        canvas.height = Math.floor(finalViewport.height);
        await page.render({ canvasContext: canvas.getContext("2d"), viewport: finalViewport }).promise;
        images.push(canvas.toDataURL("image/jpeg", 0.80).split(",")[1]);
    }
    return images;
}

// ─── Grok Vision: one API call per page (avoids 400 / payload-too-large) ─────
async function extractPageWithGrok(base64Image, pageNum, apiKey) {
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "grok-4.3",
             temperature: 0,
            max_tokens: 2000,
            messages: [{
                role: "user",
                content: [
                    {
                        type: "image_url",
                        image_url: {
                            url: `data:image/jpeg;base64,${base64Image}`,
                            detail: "auto"
                        }
                    },
                    {
                        type: "text",
                        text: `This is page ${pageNum} of a scanned printed work order. Extract ALL table rows visible on this page.

For each row return exactly these 7 fields:
- srNo        : serial / row number (string)
- length      : length in ft — numbers only, no units
- height      : height in ft — numbers only, no units
- sqft        : area in sqft — numbers only. If missing, calculate length x height.
- woQtySqft   : work order qty in sqft — numbers only
- woQtyNos    : work order qty in nos/units — numbers only
- floorPlanQty: floor plan quantity — numbers only

Rules:
• Missing or illegible field → use ""
• Numbers only — no units, no commas
• Extract EVERY row including partial ones
• Map column headers to nearest field using judgment
• If no table rows found on this page → return []

Return ONLY a raw JSON array, no markdown, no explanation:
[{"srNo":"1","length":"10","height":"8","sqft":"80","woQtySqft":"80","woQtyNos":"2","floorPlanQty":"3"}]`
                    }
                ]
            }]
        })
    });

    if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        const msg = errBody?.error?.message || JSON.stringify(errBody);
        throw new Error(`Grok API error ${response.status}: ${msg}`);
    }

    const data = await response.json();
    const text = (data.choices?.[0]?.message?.content || "").trim();
    const clean = text.replace(/```json|```/g, "").trim();
    if (!clean || clean === "[]") return [];
    return JSON.parse(clean);
}

// ─── Process all pages one by one, collect all rows ───────────────────────────
async function extractWithGrok(base64Images, onProgress) {
    const apiKey = process.env.REACT_APP_GROK_API_KEY;
    let allRows = [];
    for (let i = 0; i < base64Images.length; i++) {
        onProgress(`Step 2/2 — Processing page ${i + 1} of ${base64Images.length} with Grok Vision…`);
        const rows = await extractPageWithGrok(base64Images[i], i + 1, apiKey);
        allRows = [...allRows, ...rows];
        // Small pause between pages to respect rate limits
        if (i < base64Images.length - 1) await new Promise(r => setTimeout(r, 400));
    }
    return allRows;
}


// ─── Component ────────────────────────────────────────────────────────────────
export default function WorkOrderPage() {
    const navigate = useNavigate();
    const fileRef = useRef(null);

    const [rows, setRows] = useState([emptyRow()]);
    const [workOrderNo, setWorkOrderNo] = useState("");
    const [projectName, setProjectName] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

    const [pdfFile, setPdfFile] = useState(null);
    const [previewImages, setPreviewImages] = useState([]);
    const [showPreview, setShowPreview] = useState(false);
    const [step, setStep] = useState("idle"); // idle|converting|extracting|done|error
    const [stepMsg, setStepMsg] = useState("");
    const [extractMsg, setExtractMsg] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState(null);
    const [dragOver, setDragOver] = useState(false);

    // row ops
    const addRow = () => setRows(r => [...r, emptyRow()]);
    const deleteRow = (id) => setRows(r => r.filter(row => row.id !== id));
    const updateRow = (id, field, value) => setRows(r => r.map(row => {
        if (row.id !== id) return row;
        const u = { ...row, [field]: value };
        if (field === "length" || field === "height") {
            const auto = calcSqft(u.length, u.height);
            if (auto) { u.sqft = auto; u.woQtySqft = auto; }
        }
        return u;
    }));

    // file select
    const handleFileSelect = useCallback(async (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer?.files?.[0] || e.target?.files?.[0];
        if (!file || file.type !== "application/pdf") {
            setExtractMsg({ type: "error", text: "Please upload a valid PDF file." });
            return;
        }
        setPdfFile(file);
        setExtractMsg(null);
        setStep("idle");
        setPreviewImages([]);
        setShowPreview(false);
    }, []);

    // AI pipeline
    const handleExtract = async () => {
        if (!pdfFile) return;
        setExtractMsg(null);
        setStep("converting");
        setStepMsg("Step 1/2 — Converting scanned PDF pages to high-res images…");
        try {
            const images = await pdfToImages(pdfFile);
            setPreviewImages(images);
            setStep("extracting");
            setStepMsg(`Step 2/2 — Sending ${images.length} page(s) to Grok Vision for OCR…`);
            const extracted = await extractWithGrok(images, setStepMsg);
            if (!Array.isArray(extracted) || extracted.length === 0)
                throw new Error("No rows detected. Try a higher quality scan or enter data manually.");
            setRows(extracted.map(item => ({ ...emptyRow(), ...item, id: Date.now() + Math.random() })));
            setStep("done");
            setExtractMsg({ type: "success", text: `✅ Grok AI extracted ${extracted.length} row(s) from ${images.length} page(s). Review and save.` });
        } catch (err) {
            setStep("error");
            setExtractMsg({ type: "error", text: `❌ ${err.message}` });
        }
    };

    // save
    const handleSave = async () => {
        if (!workOrderNo || !projectName) { setSaveMsg({ type: "error", text: "Fill Work Order No. and Project Name." }); return; }
        const validRows = rows.filter(r => r.srNo || r.length);
        if (!validRows.length) { setSaveMsg({ type: "error", text: "Add at least one row." }); return; }
        setSaving(true); setSaveMsg(null);
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/work-orders`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ workOrderNo, projectName, date, items: validRows.map(({ id, ...rest }) => rest) })
            });
            if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || "Server error"); }
            setSaveMsg({ type: "success", text: "✅ Work Order saved to database!" });
        } catch (err) {
            setSaveMsg({ type: "error", text: `❌ ${err.message}` });
        } finally { setSaving(false); }
    };

    const totalSqft = rows.reduce((s, r) => s + (parseFloat(r.woQtySqft) || 0), 0);
    const totalNos  = rows.reduce((s, r) => s + (parseFloat(r.woQtyNos)  || 0), 0);
    const isExtracting = step === "converting" || step === "extracting";

    return (
        <div style={pg.wrapper}>
            {/* Top Bar */}
            <div style={pg.topBar}>
                 <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <FaListOl style={{ color:"#7c3aed", fontSize:22 }} />
                    <h1 style={pg.pageTitle}>Work Order Entry</h1>
                </div>
                <button style={pg.saveBtn} onClick={handleSave} disabled={saving}>
                    {saving ? <FaSpinner style={spin} /> : <FaSave />}&nbsp;{saving ? "Saving…" : "Save Work Order"}
                </button>
            </div>

            {saveMsg && <div style={{ ...pg.alert, ...(saveMsg.type==="success"?pg.alertSuccess:pg.alertError) }}>
                {saveMsg.type==="success"?<FaCheckCircle/>:<FaExclamationTriangle/>}&nbsp;{saveMsg.text}
            </div>}

            {/* Meta */}
            <div style={pg.card}>
                <h2 style={pg.sectionTitle}>Work Order Details</h2>
                <div style={pg.metaGrid}>
                    {[
                        { label:"Work Order No. *", val:workOrderNo, set:setWorkOrderNo, ph:"WO-2026-001", type:"text" },
                        { label:"Project Name *",   val:projectName,  set:setProjectName,  ph:"OneDeoleela Phase 2", type:"text" },
                        { label:"Date",             val:date,         set:setDate,          ph:"",           type:"date" },
                    ].map(f => (
                        <div key={f.label} style={pg.fieldGroup}>
                            <label style={pg.label}>{f.label}</label>
                            <input style={pg.input} type={f.type} value={f.val} onChange={e=>f.set(e.target.value)} placeholder={f.ph} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Grok AI Panel */}
            <div style={pg.card}>
                <div style={{ marginBottom:16 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                        <FaRobot style={{ color:"#7c3aed", fontSize:20 }} />
                        <h2 style={pg.sectionTitle}>AI Auto-Fill from Scanned PDF</h2>
                        <span style={pg.badge}>Grok Vision</span>
                    </div>
                    <p style={pg.hint}>Upload the scanned work order PDF → Grok Vision reads the image and fills all rows automatically.</p>
                </div>

                <div style={pg.infoBox}>
                    <FaInfoCircle style={{ color:"#2563eb", flexShrink:0, marginTop:2 }} />
                    <span>Works best with clear scans ≥ 150 DPI. Grok handles skewed text, imperfect borders, and irregular columns.</span>
                </div>

                {/* Drop zone */}
                <div
                    style={{ ...pg.dropZone, ...(dragOver?pg.dropZoneActive:{}), ...(pdfFile?pg.dropZoneDone:{}) }}
                    onDragOver={e=>{e.preventDefault();setDragOver(true);}}
                    onDragLeave={()=>setDragOver(false)}
                    onDrop={handleFileSelect}
                    onClick={()=>fileRef.current?.click()}
                >
                    <input ref={fileRef} type="file" accept="application/pdf" style={{display:"none"}} onChange={handleFileSelect}/>
                    {pdfFile ? (
                        <>
                            <FaFilePdf style={{ fontSize:38, color:"#ef4444", marginBottom:8 }}/>
                            <div style={{ fontWeight:700, color:"#1e293b", fontSize:15 }}>{pdfFile.name}</div>
                            <div style={{ fontSize:12, color:"#64748b", marginTop:4 }}>{(pdfFile.size/1024).toFixed(1)} KB — click to change</div>
                        </>
                    ) : (
                        <>
                            <FaCloudUploadAlt style={{ fontSize:42, color:"#94a3b8", marginBottom:8 }}/>
                            <div style={{ fontWeight:600, color:"#334155" }}>Drag & drop scanned Work Order PDF</div>
                            <div style={{ fontSize:13, color:"#64748b", marginTop:4 }}>or click to browse</div>
                        </>
                    )}
                </div>

                {isExtracting && (
                    <div style={pg.progressBox}>
                        <FaSpinner style={{ ...spin, color:"#7c3aed", fontSize:18 }}/>
                        <span style={{ color:"#4c1d95", fontWeight:600, fontSize:14 }}>{stepMsg}</span>
                    </div>
                )}

                <div style={{ display:"flex", gap:12, marginTop:14, flexWrap:"wrap" }}>
                    {pdfFile && (
                        <button style={pg.extractBtn} onClick={handleExtract} disabled={isExtracting}>
                            {isExtracting
                                ? <><FaSpinner style={spin}/>&nbsp;Processing…</>
                                : <><FaMagic/>&nbsp;Extract with Grok AI</>}
                        </button>
                    )}
                    {previewImages.length > 0 && (
                        <button style={pg.previewBtn} onClick={()=>setShowPreview(v=>!v)}>
                            <FaEye/>&nbsp;{showPreview?"Hide":"Show"} Preview ({previewImages.length} page{previewImages.length>1?"s":""})
                        </button>
                    )}
                </div>

                {showPreview && previewImages.length > 0 && (
                    <div style={pg.previewGrid}>
                        {previewImages.map((img,i) => (
                            <div key={i}>
                                <div style={{ fontSize:12, fontWeight:600, color:"#64748b", marginBottom:4 }}>Page {i+1}</div>
                                <img src={`data:image/jpeg;base64,${img}`} alt={`Page ${i+1}`}
                                    style={{ width:"100%", borderRadius:6, border:"1px solid #e2e8f0" }}/>
                            </div>
                        ))}
                    </div>
                )}

                {extractMsg && (
                    <div style={{ ...pg.alert, ...(extractMsg.type==="success"?pg.alertSuccess:pg.alertError), marginTop:14 }}>
                        {extractMsg.type==="success"?<FaCheckCircle/>:<FaExclamationTriangle/>}&nbsp;{extractMsg.text}
                    </div>
                )}
            </div>

            {/* Table */}
            <div style={pg.card}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
                    <h2 style={pg.sectionTitle}>Work Order Items</h2>
                    <button style={pg.addBtn} onClick={addRow}><FaPlus/>&nbsp;Add Row</button>
                </div>
                <div style={{ overflowX:"auto" }}>
                    <table style={tbl.table}>
                        <thead>
                            <tr style={tbl.headRow}>
                                {["Sr. No","Length (ft)","Height (ft)","Sqft (Auto)","W/O Qty (Sqft)","W/O Qty (Nos)","Floor Plan Qty",""].map(h=>(
                                    <th key={h} style={tbl.th}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row,idx) => (
                                <tr key={row.id} style={idx%2===0?tbl.rowEven:tbl.rowOdd}>
                                    {["srNo","length","height","sqft","woQtySqft","woQtyNos","floorPlanQty"].map(f=>(
                                        <td key={f} style={tbl.td}>
                                            <input
                                                style={{ ...tbl.cell, ...(f==="sqft"?tbl.cellRO:{}) }}
                                                type={f==="srNo"?"text":"number"}
                                                value={row[f]}
                                                onChange={e=>updateRow(row.id,f,e.target.value)}
                                                placeholder={f==="srNo"?`${idx+1}`:"0"}
                                                readOnly={f==="sqft"}
                                            />
                                        </td>
                                    ))}
                                    <td style={tbl.td}>
                                        <button style={tbl.delBtn} onClick={()=>deleteRow(row.id)}><FaTrash/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr style={tbl.footRow}>
                                <td colSpan={3} style={{ ...tbl.td, fontWeight:700, color:"#1e293b", textAlign:"left", paddingLeft:12 }}>Totals</td>
                                <td style={tbl.td}/>
                                <td style={{ ...tbl.td, fontWeight:700, color:"#2563eb" }}>{totalSqft.toFixed(2)}</td>
                                <td style={{ ...tbl.td, fontWeight:700, color:"#7c3aed" }}>{totalNos}</td>
                                <td style={tbl.td}/><td style={tbl.td}/>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                <div style={pg.summary}>
                    {[
                        { label:"Total Rows",      val:rows.length,         color:"#1e293b" },
                        { label:"Total W/O Sqft",  val:totalSqft.toFixed(2),color:"#2563eb" },
                        { label:"Total W/O Nos",   val:totalNos,            color:"#7c3aed" },
                    ].map(s=>(
                        <div key={s.label} style={pg.stat}>
                            <span style={pg.statLabel}>{s.label}</span>
                            <span style={{ ...pg.statVal, color:s.color }}>{s.val}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ textAlign:"right", paddingBottom:40 }}>
                <button style={pg.saveBtn} onClick={handleSave} disabled={saving}>
                    {saving?<FaSpinner style={spin}/>:<FaSave/>}&nbsp;{saving?"Saving…":"Save Work Order"}
                </button>
            </div>

            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
    );
}

const spin = { animation:"spin 1s linear infinite" };

const pg = {
    wrapper:{ maxWidth:1400, margin:"0 auto", padding:"0 4px 40px" },
    topBar:{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24, flexWrap:"wrap", gap:12 },
    backBtn:{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", background:"#1d4ed8", color:"#fff", border:"none", borderRadius:6, cursor:"pointer", fontWeight:600, fontSize:14 },
    pageTitle:{ margin:0, fontSize:22, fontWeight:700, color:"#1e293b" },
    saveBtn:{ display:"flex", alignItems:"center", gap:6, padding:"10px 22px", background:"#16a34a", color:"#fff", border:"none", borderRadius:8, cursor:"pointer", fontWeight:700, fontSize:15 },
    card:{ background:"#fff", borderRadius:15, border:"1px solid #e2e8f0", padding:"24px 28px", marginBottom:24, boxShadow:"0 4px 6px rgba(0,0,0,0.04)" },
    sectionTitle:{ margin:"0 0 4px", fontSize:17, fontWeight:700, color:"#1e293b", borderLeft:"4px solid #1d4ed8", paddingLeft:10, display:"inline-block" },
    metaGrid:{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:18, marginTop:16 },
    fieldGroup:{ display:"flex", flexDirection:"column", gap:6 },
    label:{ fontSize:13, fontWeight:600, color:"#475569" },
    input:{ padding:"10px 12px", border:"1px solid #e2e8f0", borderRadius:8, fontSize:14, color:"#1e293b", outline:"none" },
    badge:{ background:"#ede9fe", color:"#6d28d9", fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20 },
    hint:{ margin:"6px 0 0", fontSize:13, color:"#64748b" },
    infoBox:{ display:"flex", alignItems:"flex-start", gap:10, background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:8, padding:"10px 14px", fontSize:13, color:"#1e40af", marginBottom:16 },
    dropZone:{ border:"2px dashed #cbd5e1", borderRadius:12, padding:"36px 24px", textAlign:"center", cursor:"pointer", transition:"all 0.2s", background:"#f8fafc" },
    dropZoneActive:{ border:"2px dashed #2563eb", background:"#eff6ff" },
    dropZoneDone:{ border:"2px dashed #16a34a", background:"#f0fdf4" },
    progressBox:{ display:"flex", alignItems:"center", gap:12, background:"#faf5ff", border:"1px solid #e9d5ff", borderRadius:8, padding:"12px 16px", marginTop:14 },
    extractBtn:{ display:"flex", alignItems:"center", gap:8, padding:"11px 24px", background:"#7c3aed", color:"#fff", border:"none", borderRadius:8, cursor:"pointer", fontWeight:700, fontSize:14 },
    previewBtn:{ display:"flex", alignItems:"center", gap:8, padding:"11px 20px", background:"#0ea5e9", color:"#fff", border:"none", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:14 },
    previewGrid:{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:16, marginTop:16 },
    addBtn:{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", background:"#2563eb", color:"#fff", border:"none", borderRadius:7, cursor:"pointer", fontWeight:600, fontSize:13 },
    alert:{ padding:"12px 16px", borderRadius:8, fontSize:14, fontWeight:500, display:"flex", alignItems:"center", gap:8 },
    alertSuccess:{ background:"#f0fdf4", color:"#15803d", border:"1px solid #bbf7d0" },
    alertError:{ background:"#fef2f2", color:"#dc2626", border:"1px solid #fecaca" },
    summary:{ display:"flex", gap:16, marginTop:20, flexWrap:"wrap" },
    stat:{ background:"#f8fafc", borderRadius:10, padding:"14px 24px", textAlign:"center", minWidth:130, border:"1px solid #e2e8f0" },
    statLabel:{ display:"block", fontSize:12, color:"#64748b", fontWeight:600, marginBottom:4 },
    statVal:{ fontSize:24, fontWeight:700 },
};

const tbl = {
    table:{ width:"100%", borderCollapse:"collapse", fontSize:13, minWidth:820 },
    headRow:{ background:"#1e1b4b" },
    th:{ padding:"12px 10px", color:"#e2e8f0", fontWeight:600, textAlign:"center", whiteSpace:"nowrap" },
    td:{ padding:"6px 8px", borderBottom:"1px solid #f1f5f9", textAlign:"center" },
    rowEven:{ background:"#fff" },
    rowOdd:{ background:"#f8fafc" },
    footRow:{ background:"#eff6ff", borderTop:"2px solid #bfdbfe" },
    cell:{ width:"100%", padding:"8px 6px", border:"1px solid #e2e8f0", borderRadius:6, textAlign:"center", fontSize:13, color:"#1e293b", background:"#fff", outline:"none" },
    cellRO:{ background:"#f1f5f9", color:"#94a3b8", cursor:"not-allowed" },
    delBtn:{ background:"none", border:"none", color:"#ef4444", cursor:"pointer", fontSize:15, padding:4 },
};
