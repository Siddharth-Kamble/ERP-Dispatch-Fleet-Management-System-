//
//
//
//import React, { useState, useRef, useCallback, useEffect } from "react";
//import {
//    FaFilePdf, FaMagic, FaPlus, FaTrash,
//    FaSave, FaCheckCircle, FaExclamationTriangle,
//    FaRobot, FaCloudUploadAlt, FaListOl, FaSpinner,
//    FaEye, FaInfoCircle, FaCalculator
//} from "react-icons/fa";
//import { useNavigate, useLocation } from "react-router-dom";
//import * as PDFJS from "pdfjs-dist";
//
//PDFJS.GlobalWorkerOptions.workerSrc =
//    new URL("pdfjs-dist/build/pdf.worker.mjs", import.meta.url).toString();
//
//// ── Sqft auto-calc: Length(mm) × Height(mm) ÷ 1,000,000 × 10.764 ────────────
//function calcSqft(length, height) {
//    const l = parseFloat(length);
//    const h = parseFloat(height);
//    if (isNaN(l) || l <= 0 || isNaN(h) || h <= 0) return "";
//    return ((l * h) / 1_000_000 * 10.764).toFixed(4);
//}
//
//// ── W/O Qty unit options ──────────────────────────────────────────────────────
//const WO_QTY_UNITS = [
//    { value: "sqft", label: "sqft — already in sq ft (use as-is)" },
//    { value: "sqm",  label: "sqm  — convert to sq ft (× 10.764)"  },
//];
//
//function convertWoQty(rawValue, woQtyUnit) {
//    const v = parseFloat(rawValue);
//    if (isNaN(v) || v <= 0) return "";
//    if (woQtyUnit === "sqm") return (v * 10.764).toFixed(4);
//    return v.toFixed(4);
//}
//
///**
// * W/O QTY (Nos) = woQtySqft / sqft  (integer, rounded down)
// */
//function calcWoQtyNos(woQtySqft, sqft) {
//    const qty  = parseFloat(woQtySqft);
//    const area = parseFloat(sqft);
//    if (isNaN(qty) || isNaN(area) || area <= 0) return "";
//    return Math.floor(qty / area).toString();
//}
//
//// ── Empty row factory ─────────────────────────────────────────────────────────
//const emptyRow = () => ({
//    id:           Date.now() + Math.random(),
//    srNo:         "",
//    location:     "",
//    windowCode:   "",
//    typology:     "",
//    series:       "",
//    length:       "",
//    height:       "",
//    sqft:         "",
//    woQtySqftRaw: "",
//    woQtySqft:    "",
//    woQtyNos:     "",
//    floorPlanQty: "",
//});
//
//// ── PDF → base64 JPEG ─────────────────────────────────────────────────────────
//async function pdfToImages(file) {
//    const arrayBuffer = await file.arrayBuffer();
//    const pdf = await PDFJS.getDocument({ data: arrayBuffer }).promise;
//    const images = [];
//    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
//        const page     = await pdf.getPage(pageNum);
//        const viewport = page.getViewport({ scale: 1.5 });
//        const maxDim   = 1600;
//        const ratio    = Math.min(1, maxDim / Math.max(viewport.width, viewport.height));
//        const final    = page.getViewport({ scale: 1.5 * ratio });
//        const canvas   = document.createElement("canvas");
//        canvas.width   = Math.floor(final.width);
//        canvas.height  = Math.floor(final.height);
//        await page.render({ canvasContext: canvas.getContext("2d"), viewport: final }).promise;
//        images.push(canvas.toDataURL("image/jpeg", 0.80).split(",")[1]);
//    }
//    return images;
//}
//
//// ── Grok Vision — one call per page ──────────────────────────────────────────
//async function extractPageWithGrok(base64Image, pageNum, apiKey) {
//    const response = await fetch("https://api.x.ai/v1/chat/completions", {
//        method: "POST",
//        headers: {
//            "Content-Type": "application/json",
//            "Authorization": `Bearer ${apiKey}`,
//        },
//        body: JSON.stringify({
//            model: "grok-4.3",
//            temperature: 0,
//            max_tokens: 2000,
//            messages: [{
//                role: "user",
//                content: [
//                    {
//                        type: "image_url",
//                        image_url: { url: `data:image/jpeg;base64,${base64Image}`, detail: "auto" },
//                    },
//                    {
//                        type: "text",
//                        text: `This is page ${pageNum} of a scanned work order. Length and Height values are in millimetres (mm).
//
//Extract ALL table rows on this page. For each row return these fields:
//- srNo        : serial / row number (string)
//- location    : location or area name
//- windowCode  : window code or ID
//- typology    : typology or type description
//- series      : series name
//- length      : numeric length value in mm (no units)
//- height      : numeric height value in mm (no units)
//- woQtySqftRaw: W/O quantity value as shown in the table (numbers only, no units — user will select if sqft or sqm)
//- floorPlanQty: floor plan quantity (numbers only)
//
//Rules:
//• Missing/illegible → use ""
//• Numbers only — no commas, no units in values
//• Extract EVERY row including partial ones
//• sqft and woQtyNos will be calculated automatically — do NOT include them
//• If no rows found → return []
//
//Return ONLY a raw JSON array, no markdown, no explanation:
//[{"srNo":"1","location":"Living Room","windowCode":"W1","typology":"Sliding","series":"32mm","length":"2700","height":"2350","woQtySqftRaw":"","floorPlanQty":"4"}]`,
//                    },
//                ],
//            }],
//        }),
//    });
//
//    if (!response.ok) {
//        const err = await response.json().catch(() => ({}));
//        throw new Error(`Grok API error ${response.status}: ${err?.error?.message || JSON.stringify(err)}`);
//    }
//
//    const data  = await response.json();
//    const text  = (data.choices?.[0]?.message?.content || "").trim();
//    const clean = text.replace(/```json|```/g, "").trim();
//    if (!clean || clean === "[]") return [];
//    return JSON.parse(clean);
//}
//
//async function extractWithGrok(base64Images, onProgress) {
//    const apiKey  = process.env.REACT_APP_GROK_API_KEY;
//    let allRows   = [];
//    for (let i = 0; i < base64Images.length; i++) {
//        onProgress(`Step 2/2 — Processing page ${i + 1} of ${base64Images.length} with Grok Vision…`);
//        const rows = await extractPageWithGrok(base64Images[i], i + 1, apiKey);
//        allRows    = [...allRows, ...rows];
//        if (i < base64Images.length - 1) await new Promise(r => setTimeout(r, 400));
//    }
//    return allRows;
//}
//
//// ── Component ─────────────────────────────────────────────────────────────────
//export default function WorkOrderPage() {
//    const navigate = useNavigate();
//    const location = useLocation();
//    const fileRef  = useRef(null);
//
//    const [woQtyUnit,     setWoQtyUnit]     = useState("sqft");
//    const [rows,          setRows]          = useState([emptyRow()]);
//    const [workOrderNo,   setWorkOrderNo]   = useState("");
//    const [projectName, setProjectName] = useState(
//        location.state?.project?.projectName || ""
//    );
//    const [date,          setDate]          = useState(new Date().toISOString().split("T")[0]);
//
//    const [pdfFile,       setPdfFile]       = useState(null);
//    const [previewImages, setPreviewImages] = useState([]);
//    const [showPreview,   setShowPreview]   = useState(false);
//    const [step,          setStep]          = useState("idle");
//    const [stepMsg,       setStepMsg]       = useState("");
//    const [extractMsg,    setExtractMsg]    = useState(null);
//    const [saving,        setSaving]        = useState(false);
//    const [saveMsg,       setSaveMsg]       = useState(null);
//    const [dragOver,      setDragOver]      = useState(false);
//
//    const isExtracting = step === "converting" || step === "extracting";
//
//    // ── When woQtyUnit changes — reconvert and recalculate nos ────────────────
//    useEffect(() => {
//        setRows(prev => prev.map(row => {
//            const converted = convertWoQty(row.woQtySqftRaw, woQtyUnit);
//            const nos       = calcWoQtyNos(converted, row.sqft);
//            return { ...row, woQtySqft: converted, woQtyNos: nos };
//        }));
//    }, [woQtyUnit]);
//
//    // ── Row ops ───────────────────────────────────────────────────────────────
//    const addRow    = () => setRows(r => [...r, emptyRow()]);
//    const deleteRow = (id) => setRows(r => r.filter(row => row.id !== id));
//
//    const updateRow = (id, field, value) =>
//        setRows(prev => prev.map(row => {
//            if (row.id !== id) return row;
//            const u = { ...row, [field]: value };
//
//            if (field === "length" || field === "height") {
//                const auto  = calcSqft(u.length, u.height);
//                u.sqft      = auto;
//                u.woQtyNos  = calcWoQtyNos(u.woQtySqft, auto);
//            }
//
//            if (field === "woQtySqftRaw") {
//                const converted = convertWoQty(value, woQtyUnit);
//                u.woQtySqft     = converted;
//                u.woQtyNos      = calcWoQtyNos(converted, u.sqft);
//            }
//
//            return u;
//        }));
//
//    // ── File select ───────────────────────────────────────────────────────────
//    const handleFileSelect = useCallback(async (e) => {
//        e.preventDefault();
//        setDragOver(false);
//        const file = e.dataTransfer?.files?.[0] || e.target?.files?.[0];
//        if (!file || file.type !== "application/pdf") {
//            setExtractMsg({ type: "error", text: "Please upload a valid PDF file." });
//            return;
//        }
//        setPdfFile(file);
//        setExtractMsg(null);
//        setStep("idle");
//        setPreviewImages([]);
//        setShowPreview(false);
//    }, []);
//
//    // ── AI pipeline ───────────────────────────────────────────────────────────
//    const handleExtract = async () => {
//        if (!pdfFile) return;
//        setExtractMsg(null);
//        setStep("converting");
//        setStepMsg("Step 1/2 — Converting PDF pages to images…");
//        try {
//            const images = await pdfToImages(pdfFile);
//            setPreviewImages(images);
//            setStep("extracting");
//            setStepMsg(`Step 2/2 — Sending ${images.length} page(s) to Grok Vision…`);
//
//            const extracted = await extractWithGrok(images, setStepMsg);
//            if (!Array.isArray(extracted) || extracted.length === 0)
//                throw new Error("No rows detected. Try a higher quality scan or enter data manually.");
//
//            // Apply sqft formula and calculate nos for each extracted row
//            const withCalcs = extracted.map(item => {
//                const auto      = calcSqft(item.length, item.height);
//                const converted = convertWoQty(item.woQtySqftRaw || "", woQtyUnit);
//                const nos       = calcWoQtyNos(converted, auto);
//                return {
//                    ...emptyRow(),
//                    ...item,
//                    id:          Date.now() + Math.random(),
//                    sqft:        auto,
//                    woQtySqftRaw: item.woQtySqftRaw || "",
//                    woQtySqft:   converted,
//                    woQtyNos:    nos,
//                };
//            });
//
//            setRows(withCalcs);
//            setStep("done");
//            setExtractMsg({
//                type: "success",
//                text: `Grok AI extracted ${withCalcs.length} row(s) from ${images.length} page(s). Sqft auto-calculated from L×H÷1,000,000×10.764. Review W/O Qty values and select the correct unit (sqft or sqm) above.`,
//            });
//        } catch (err) {
//            setStep("error");
//            setExtractMsg({ type: "error", text: `${err.message}` });
//        }
//    };
//
//    // ── Save ──────────────────────────────────────────────────────────────────
//    const handleSave = async () => {
//        if (!workOrderNo || !projectName) {
//            setSaveMsg({ type: "error", text: "Fill Work Order No. and Project Name." }); return;
//        }
//        const validRows = rows.filter(r => r.srNo || r.length);
//        if (!validRows.length) {
//            setSaveMsg({ type: "error", text: "Add at least one row." }); return;
//        }
//
//        setSaving(true);
//        setSaveMsg(null);
//        try {
//            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/work-orders`, {
//                method: "POST",
//                headers: { "Content-Type": "application/json" },
//                body: JSON.stringify({
//                    workOrderNo,
//                    projectName,
//                    date,
//                    items: validRows.map(({ id, woQtySqftRaw, ...rest }) => ({
//                        ...rest,
//                        woQtyUnit,
//                        woQtySqftRaw,
//                    })),
//                }),
//            });
//            if (!res.ok) {
//                const e = await res.json().catch(() => ({}));
//                throw new Error(e.message || "Server error");
//            }
//            setSaveMsg({ type: "success", text: "Work Order saved to database!" });
//        } catch (err) {
//            setSaveMsg({ type: "error", text: `${err.message}` });
//        } finally {
//            setSaving(false);
//        }
//    };
//
//    const totalSqft = rows.reduce((s, r) => s + (parseFloat(r.woQtySqft) || 0), 0);
//    const totalNos  = rows.reduce((s, r) => s + (parseInt(r.woQtyNos)    || 0), 0);
//
//    // ── Column config ─────────────────────────────────────────────────────────
//    const TABLE_COLS = [
//        { key: "srNo",         label: "Sr. No",                       isText: true                },
//        { key: "location",     label: "Location",                      isText: true                },
//        { key: "windowCode",   label: "Window Code",                   isText: true                },
//        { key: "typology",     label: "Typology",                      isText: true                },
//        { key: "series",       label: "Series",                        isText: true                },
//        { key: "length",       label: "Length (mm)"                                                },
//        { key: "height",       label: "Height (mm)"                                                },
//        { key: "sqft",         label: "Sqft (Auto) ✦",                 readOnly: true              },
//        { key: "woQtySqftRaw", label: `W/O Qty (${woQtyUnit === "sqm" ? "sqm→sqft" : "sqft"})`   },
//        { key: "woQtySqft",    label: "W/O Qty Converted",             readOnly: true              },
//        { key: "woQtyNos",     label: "W/O QTY (Nos) ✦",              readOnly: true              },
//        { key: "floorPlanQty", label: "Floor Plan Qty"                                             },
//    ];
//
//    return (
//        <div style={pg.wrapper}>
//            {/* Top Bar */}
//            <div style={pg.topBar}>
//                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//                    <FaListOl style={{ color: "#7c3aed", fontSize: 22 }} />
//                    <h1 style={pg.pageTitle}>Work Order Entry</h1>
//                </div>
//                <button style={pg.saveBtn} onClick={handleSave} disabled={saving}>
//                    {saving ? <FaSpinner style={spin} /> : <FaSave />}
//                    &nbsp;{saving ? "Saving…" : "Save Work Order"}
//                </button>
//            </div>
//
//            {saveMsg && (
//                <div style={{ ...pg.alert, ...(saveMsg.type === "success" ? pg.alertSuccess : pg.alertError) }}>
//                    {saveMsg.type === "success" ? <FaCheckCircle /> : <FaExclamationTriangle />}
//                    &nbsp;{saveMsg.text}
//                </div>
//            )}
//
// {/* Meta */}
// <div style={pg.card}>
//     <h2 style={pg.sectionTitle}>Work Order Details</h2>
//     <div style={pg.metaGrid}>
//         {/* Work Order No */}
//         <div style={pg.fieldGroup}>
//             <label style={pg.label}>Work Order No. *</label>
//             <input
//                 style={pg.input}
//                 type="text"
//                 value={workOrderNo}
//                 onChange={e => setWorkOrderNo(e.target.value)}
//                 placeholder="WO-2026-001"
//             />
//         </div>
//
//         {/* Project Name — auto-filled, read-only */}
//         <div style={pg.fieldGroup}>
//             <label style={pg.label}>Project Name *</label>
//             <input
//                 style={{ ...pg.input, background: "#f8fafc", color: "#1e293b",
//                          fontWeight: 600, cursor: "default", border: "1px solid #e2e8f0" }}
//                 type="text"
//                 value={projectName}
//                 readOnly
//                 placeholder="Select a project from Work Orders page"
//             />
//             {!projectName && (
//                 <span style={{ fontSize: 11, color: "#f59e0b", marginTop: 3 }}>
//                     ⚠ No project selected — go back and select one
//                 </span>
//             )}
//         </div>
//
//         {/* Date */}
//         <div style={pg.fieldGroup}>
//             <label style={pg.label}>Date</label>
//             <input
//                 style={pg.input}
//                 type="date"
//                 value={date}
//                 onChange={e => setDate(e.target.value)}
//             />
//         </div>
//     </div>
// </div>
//
//
//            {/* ── Calculation Info + W/O Qty Unit Selector ─────────────────── */}
//            <div style={pg.unitCard}>
//                <div style={pg.unitLeft}>
//                    <FaCalculator style={{ color: "#2563eb", fontSize: 18, flexShrink: 0, marginTop: 2 }} />
//                    <div>
//                        <div style={pg.unitTitle}>Calculation Rules</div>
//                        <div style={pg.unitSub}>
//                            <span style={pg.formulaBadge}>Sqft (Auto)</span>&nbsp;=&nbsp;
//                            <code style={pg.formula}>Length(mm) × Height(mm) ÷ 1,000,000 × 10.764</code>
//                        </div>
//                        <div style={pg.unitSub}>
//                            <span style={pg.formulaBadge}>W/O QTY (Nos)</span>&nbsp;=&nbsp;
//                            <code style={pg.formula}>W/O Qty (sqft converted) ÷ Sqft (Auto) — integer</code>
//                        </div>
//                        <div style={{ fontSize: 12, color: "#3b82f6", marginTop: 6 }}>
//                            ✦ Sqft (Auto) and W/O QTY (Nos) are auto-calculated and read-only.<br />
//                            Enter <strong>W/O Qty</strong> values and pick whether they are in sqft or sqm below.
//                            {woQtyUnit === "sqm"
//                                ? " Each W/O Qty value will be multiplied by 10.764 (sqm → sqft)."
//                                : " W/O Qty values are used as-is (already sqft)."}
//                        </div>
//                    </div>
//                </div>
//                <div style={pg.unitRight}>
//                    <label style={pg.label}>W/O Qty input unit</label>
//                    <select
//                        style={pg.unitSelect}
//                        value={woQtyUnit}
//                        onChange={e => setWoQtyUnit(e.target.value)}
//                    >
//                        {WO_QTY_UNITS.map(u => (
//                            <option key={u.value} value={u.value}>{u.label}</option>
//                        ))}
//                    </select>
//                    <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>
//                        Set this <strong>before</strong> entering W/O Qty values.<br />
//                        Changing it will re-convert all existing rows automatically.
//                    </div>
//                </div>
//            </div>
//
//            {/* Grok AI Panel */}
//            <div style={pg.card}>
//                <div style={{ marginBottom: 16 }}>
//                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
//                        <FaRobot style={{ color: "#7c3aed", fontSize: 20 }} />
//                        <h2 style={pg.sectionTitle}>AI Auto-Fill from Scanned PDF</h2>
//                        <span style={pg.badge}>Grok Vision</span>
//                    </div>
//                    <p style={pg.hint}>
//                        Upload the scanned work order PDF → Grok Vision reads and fills all rows →
//                        Sqft is auto-calculated using L×H÷1,000,000×10.764. Then set W/O Qty unit above.
//                    </p>
//                </div>
//
//                <div style={pg.infoBox}>
//                    <FaInfoCircle style={{ color: "#2563eb", flexShrink: 0, marginTop: 2 }} />
//                    <span>
//                        Grok extracts raw numeric values. <strong>Sqft (Auto)</strong> is calculated immediately from mm dimensions.
//                        Set <strong>W/O Qty unit</strong> (sqft or sqm) after extraction to convert W/O Qty values and auto-calculate W/O QTY (Nos).
//                    </span>
//                </div>
//
//                {/* Drop zone */}
//                <div
//                    style={{ ...pg.dropZone, ...(dragOver ? pg.dropZoneActive : {}), ...(pdfFile ? pg.dropZoneDone : {}) }}
//                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
//                    onDragLeave={() => setDragOver(false)}
//                    onDrop={handleFileSelect}
//                    onClick={() => fileRef.current?.click()}
//                >
//                    <input ref={fileRef} type="file" accept="application/pdf" style={{ display: "none" }} onChange={handleFileSelect} />
//                    {pdfFile ? (
//                        <>
//                            <FaFilePdf style={{ fontSize: 38, color: "#ef4444", marginBottom: 8 }} />
//                            <div style={{ fontWeight: 700, color: "#1e293b", fontSize: 15 }}>{pdfFile.name}</div>
//                            <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
//                                {(pdfFile.size / 1024).toFixed(1)} KB — click to change
//                            </div>
//                        </>
//                    ) : (
//                        <>
//                            <FaCloudUploadAlt style={{ fontSize: 42, color: "#94a3b8", marginBottom: 8 }} />
//                            <div style={{ fontWeight: 600, color: "#334155" }}>Drag &amp; drop scanned Work Order PDF</div>
//                            <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>or click to browse</div>
//                        </>
//                    )}
//                </div>
//
//                {isExtracting && (
//                    <div style={pg.progressBox}>
//                        <FaSpinner style={{ ...spin, color: "#7c3aed", fontSize: 18 }} />
//                        <span style={{ color: "#4c1d95", fontWeight: 600, fontSize: 14 }}>{stepMsg}</span>
//                    </div>
//                )}
//
//                <div style={{ display: "flex", gap: 12, marginTop: 14, flexWrap: "wrap" }}>
//                    {pdfFile && (
//                        <button style={pg.extractBtn} onClick={handleExtract} disabled={isExtracting}>
//                            {isExtracting
//                                ? <><FaSpinner style={spin} />&nbsp;Processing…</>
//                                : <><FaMagic />&nbsp;Extract with Grok AI</>}
//                        </button>
//                    )}
//                    {previewImages.length > 0 && (
//                        <button style={pg.previewBtn} onClick={() => setShowPreview(v => !v)}>
//                            <FaEye />&nbsp;{showPreview ? "Hide" : "Show"} Preview ({previewImages.length} page{previewImages.length > 1 ? "s" : ""})
//                        </button>
//                    )}
//                </div>
//
//                {showPreview && previewImages.length > 0 && (
//                    <div style={pg.previewGrid}>
//                        {previewImages.map((img, i) => (
//                            <div key={i}>
//                                <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Page {i + 1}</div>
//                                <img src={`data:image/jpeg;base64,${img}`} alt={`Page ${i + 1}`}
//                                    style={{ width: "100%", borderRadius: 6, border: "1px solid #e2e8f0" }} />
//                            </div>
//                        ))}
//                    </div>
//                )}
//
//                {extractMsg && (
//                    <div style={{ ...pg.alert, ...(extractMsg.type === "success" ? pg.alertSuccess : pg.alertError), marginTop: 14 }}>
//                        {extractMsg.type === "success" ? <FaCheckCircle /> : <FaExclamationTriangle />}
//                        &nbsp;{extractMsg.text}
//                    </div>
//                )}
//            </div>
//
//            {/* Table */}
//            <div style={pg.card}>
//                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
//                    <h2 style={pg.sectionTitle}>Work Order Items</h2>
//                    <button style={pg.addBtn} onClick={addRow}><FaPlus />&nbsp;Add Row</button>
//                </div>
//                <div style={{ overflowX: "auto" }}>
//                    <table style={tbl.table}>
//                        <thead>
//                            <tr style={tbl.headRow}>
//                                {TABLE_COLS.map(c => (
//                                    <th key={c.key} style={tbl.th}>
//                                        {c.label}
//                                        {c.readOnly && <span style={tbl.roTag}>auto</span>}
//                                    </th>
//                                ))}
//                                <th style={tbl.th}></th>
//                            </tr>
//                        </thead>
//                        <tbody>
//                            {rows.map((row, idx) => (
//                                <tr key={row.id} style={idx % 2 === 0 ? tbl.rowEven : tbl.rowOdd}>
//                                    {TABLE_COLS.map(c => (
//                                        <td key={c.key} style={tbl.td}>
//                                            <input
//                                                style={{
//                                                    ...tbl.cell,
//                                                    ...(c.readOnly ? tbl.cellRO : {}),
//                                                    ...(c.key === "sqft"      && row.sqft      ? tbl.cellGreen  : {}),
//                                                    ...(c.key === "woQtySqft" && row.woQtySqft ? tbl.cellBlue   : {}),
//                                                    ...(c.key === "woQtyNos"  && row.woQtyNos  ? tbl.cellPurple : {}),
//                                                }}
//                                                type={c.isText ? "text" : "number"}
//                                                value={row[c.key]}
//                                                onChange={e => updateRow(row.id, c.key, e.target.value)}
//                                                placeholder={c.key === "srNo" ? `${idx + 1}` : ""}
//                                                readOnly={c.readOnly}
//                                            />
//                                        </td>
//                                    ))}
//                                    <td style={tbl.td}>
//                                        <button style={tbl.delBtn} onClick={() => deleteRow(row.id)}>
//                                            <FaTrash />
//                                        </button>
//                                    </td>
//                                </tr>
//                            ))}
//                        </tbody>
//                        <tfoot>
//                            <tr style={tbl.footRow}>
//                                <td colSpan={8} style={{ ...tbl.td, fontWeight: 700, color: "#1e293b", textAlign: "left", paddingLeft: 12 }}>
//                                    Totals
//                                </td>
//                                <td style={tbl.td} />
//                                <td style={{ ...tbl.td, fontWeight: 700, color: "#2563eb" }}>{totalSqft.toFixed(2)}</td>
//                                <td style={{ ...tbl.td, fontWeight: 700, color: "#7c3aed" }}>{totalNos}</td>
//                                <td style={tbl.td} /><td style={tbl.td} />
//                            </tr>
//                        </tfoot>
//                    </table>
//                </div>
//                <div style={pg.summary}>
//                    {[
//                        { label: "Total Rows",     val: rows.length,          color: "#1e293b" },
//                        { label: "W/O Qty Unit",   val: woQtyUnit.toUpperCase(), color: "#2563eb" },
//                        { label: "Total W/O Sqft", val: totalSqft.toFixed(2), color: "#059669" },
//                        { label: "Total W/O Nos",  val: totalNos,             color: "#7c3aed" },
//                    ].map(s => (
//                        <div key={s.label} style={pg.stat}>
//                            <span style={pg.statLabel}>{s.label}</span>
//                            <span style={{ ...pg.statVal, color: s.color }}>{s.val}</span>
//                        </div>
//                    ))}
//                </div>
//            </div>
//
//            <div style={{ textAlign: "right", paddingBottom: 40 }}>
//                <button style={pg.saveBtn} onClick={handleSave} disabled={saving}>
//                    {saving ? <FaSpinner style={spin} /> : <FaSave />}
//                    &nbsp;{saving ? "Saving…" : "Save Work Order"}
//                </button>
//            </div>
//
//            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
//        </div>
//    );
//}
//
//const spin = { animation: "spin 1s linear infinite" };
//
//const pg = {
//    wrapper:      { maxWidth: 1400, margin: "0 auto", padding: "0 4px 40px" },
//    topBar:       { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 },
//    pageTitle:    { margin: 0, fontSize: 22, fontWeight: 700, color: "#1e293b" },
//    saveBtn:      { display: "flex", alignItems: "center", gap: 6, padding: "10px 22px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 15 },
//    card:         { background: "#fff", borderRadius: 15, border: "1px solid #e2e8f0", padding: "24px 28px", marginBottom: 24, boxShadow: "0 4px 6px rgba(0,0,0,0.04)" },
//    sectionTitle: { margin: "0 0 4px", fontSize: 17, fontWeight: 700, color: "#1e293b", borderLeft: "4px solid #1d4ed8", paddingLeft: 10, display: "inline-block" },
//    metaGrid:     { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 18, marginTop: 16 },
//    fieldGroup:   { display: "flex", flexDirection: "column", gap: 6 },
//    label:        { fontSize: 13, fontWeight: 600, color: "#475569" },
//    input:        { padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, color: "#1e293b", outline: "none" },
//    badge:        { background: "#ede9fe", color: "#6d28d9", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 },
//    hint:         { margin: "6px 0 0", fontSize: 13, color: "#64748b" },
//    infoBox:      { display: "flex", alignItems: "flex-start", gap: 10, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#1e40af", marginBottom: 16 },
//    dropZone:     { border: "2px dashed #cbd5e1", borderRadius: 12, padding: "36px 24px", textAlign: "center", cursor: "pointer", transition: "all 0.2s", background: "#f8fafc" },
//    dropZoneActive:{ border: "2px dashed #2563eb", background: "#eff6ff" },
//    dropZoneDone: { border: "2px dashed #16a34a", background: "#f0fdf4" },
//    progressBox:  { display: "flex", alignItems: "center", gap: 12, background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: 8, padding: "12px 16px", marginTop: 14 },
//    extractBtn:   { display: "flex", alignItems: "center", gap: 8, padding: "11px 24px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14 },
//    previewBtn:   { display: "flex", alignItems: "center", gap: 8, padding: "11px 20px", background: "#0ea5e9", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14 },
//    previewGrid:  { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16, marginTop: 16 },
//    addBtn:       { display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 600, fontSize: 13 },
//    alert:        { padding: "12px 16px", borderRadius: 8, fontSize: 14, fontWeight: 500, display: "flex", alignItems: "center", gap: 8 },
//    alertSuccess: { background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" },
//    alertError:   { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" },
//    summary:      { display: "flex", gap: 16, marginTop: 20, flexWrap: "wrap" },
//    stat:         { background: "#f8fafc", borderRadius: 10, padding: "14px 24px", textAlign: "center", minWidth: 130, border: "1px solid #e2e8f0" },
//    statLabel:    { display: "block", fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 4 },
//    statVal:      { fontSize: 24, fontWeight: 700 },
//
//    // Calc info + unit card
//    unitCard:     { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 12, padding: "16px 22px", marginBottom: 24, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap" },
//    unitLeft:     { display: "flex", alignItems: "flex-start", gap: 12, flex: 1 },
//    unitTitle:    { fontSize: 14, fontWeight: 700, color: "#1e40af", marginBottom: 6 },
//    unitSub:      { fontSize: 12, color: "#3b82f6", lineHeight: 1.8 },
//    formula:      { background: "#dbeafe", color: "#1e40af", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontFamily: "monospace" },
//    formulaBadge: { background: "#1e40af", color: "#fff", padding: "1px 7px", borderRadius: 4, fontSize: 11, fontWeight: 700 },
//    unitRight:    { display: "flex", flexDirection: "column", gap: 6, minWidth: 260 },
//    unitSelect:   { padding: "9px 12px", border: "1px solid #93c5fd", borderRadius: 8, fontSize: 14, color: "#1e293b", background: "#fff", outline: "none", cursor: "pointer" },
//};
//
//const tbl = {
//    table:        { width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 900 },
//    headRow:      { background: "#1e1b4b" },
//    th:           { padding: "12px 10px", color: "#e2e8f0", fontWeight: 600, textAlign: "center", whiteSpace: "nowrap" },
//    roTag:        { marginLeft: 5, fontSize: 9, background: "#4338ca", color: "#c7d2fe", padding: "1px 5px", borderRadius: 10, verticalAlign: "middle" },
//    td:           { padding: "6px 8px", borderBottom: "1px solid #f1f5f9", textAlign: "center" },
//    rowEven:      { background: "#fff" },
//    rowOdd:       { background: "#f8fafc" },
//    footRow:      { background: "#eff6ff", borderTop: "2px solid #bfdbfe" },
//    cell:         { width: "100%", padding: "8px 6px", border: "1px solid #e2e8f0", borderRadius: 6, textAlign: "center", fontSize: 13, color: "#1e293b", background: "#fff", outline: "none" },
//    cellRO:       { background: "#f1f5f9", color: "#94a3b8", cursor: "not-allowed" },
//    cellGreen:    { background: "#f0fdf4", color: "#15803d", fontWeight: 600, border: "1px solid #bbf7d0" },
//    cellBlue:     { background: "#eff6ff", color: "#2563eb", fontWeight: 600, border: "1px solid #bfdbfe" },
//    cellPurple:   { background: "#faf5ff", color: "#7c3aed", fontWeight: 700, border: "1px solid #e9d5ff" },
//    delBtn:       { background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 15, padding: 4 },
//};


import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaClipboardList, FaSearch, FaPlusCircle, FaEye,
    FaBuilding, FaCalendarAlt, FaListOl, FaSpinner
} from "react-icons/fa";

export default function WorkOrdersPage() {
    const navigate = useNavigate();

    const [projects,         setProjects]        = useState([]);
    const [loadingProjects,  setLoadingProjects]  = useState(true);
    const [search,           setSearch]           = useState("");
    const [selectedProject,  setSelectedProject]  = useState(null);
    const [workOrders,       setWorkOrders]       = useState([]);
    const [loadingWOs,       setLoadingWOs]       = useState(false);
    const [error,            setError]            = useState("");

    // ── Load all projects ─────────────────────────────────────────────────────
    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_URL}/projects`)
            .then(r => r.json())
            .then(data => { setProjects(data); setLoadingProjects(false); })
            .catch(() => { setError("Failed to load projects."); setLoadingProjects(false); });
    }, []);

    // ── Load work orders for selected project ─────────────────────────────────
    const handleSelectProject = async (project) => {
        setSelectedProject(project);
        setWorkOrders([]);
        setLoadingWOs(true);
        try {
            const res  = await fetch(
                `${process.env.REACT_APP_API_URL}/api/work-orders/by-project/${encodeURIComponent(project.projectName)}`
            );
            const data = await res.json();
            setWorkOrders(Array.isArray(data) ? data : []);
        } catch {
            setWorkOrders([]);
        } finally {
            setLoadingWOs(false);
        }
    };

    const filtered = projects.filter(p =>
        p.projectName?.toLowerCase().includes(search.toLowerCase()) ||
        p.projectCode?.toLowerCase().includes(search.toLowerCase()) ||
        p.city?.toLowerCase().includes(search.toLowerCase())
    );

    const statusColor = (s) => ({
        "Active": "#16a34a", "Completed": "#2563eb",
        "On Hold": "#f59e0b", "Cancelled": "#ef4444"
    }[s] || "#64748b");

    return (
        <div style={s.wrapper}>
            {/* Header */}
            <div style={s.pageHeader}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={s.headerIcon}><FaClipboardList /></div>
                    <div>
                        <h1 style={s.pageTitle}>Work Orders</h1>
                        <p style={s.pageSubtitle}>Select a project to create or view work orders</p>
                    </div>
                </div>
            </div>

            {error && <div style={s.errorBox}>{error}</div>}

            {/* Two-panel layout */}
            <div style={s.panels}>

                {/* LEFT — Project list */}
                <div style={s.leftPanel}>
                    <div style={s.panelHeader}>
                        <span style={s.panelTitle}>
                            <FaBuilding style={{ marginRight: 8, color: "#0ea5e9" }} />
                            Projects ({filtered.length})
                        </span>
                        <div style={s.searchBox}>
                            <FaSearch style={{ color: "#94a3b8", fontSize: 13 }} />
                            <input
                                style={s.searchInput}
                                placeholder="Search projects…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div style={s.projectList}>
                        {loadingProjects ? (
                            <div style={s.centerMsg}><FaSpinner style={spin} />&nbsp;Loading projects…</div>
                        ) : filtered.length === 0 ? (
                            <div style={s.centerMsg}>No projects found.</div>
                        ) : filtered.map(p => (
                            <div
                                key={p.projectId}
                                style={{
                                    ...s.projectCard,
                                    ...(selectedProject?.projectId === p.projectId ? s.projectCardActive : {})
                                }}
                                onClick={() => handleSelectProject(p)}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <div>
                                        <div style={s.projName}>{p.projectName}</div>
                                        <div style={s.projCode}>{p.projectCode}</div>
                                    </div>
                                    <span style={{
                                        ...s.statusBadge,
                                        background: statusColor(p.projectStatus) + "22",
                                        color: statusColor(p.projectStatus)
                                    }}>
                                        {p.projectStatus || "—"}
                                    </span>
                                </div>
                                <div style={s.projMeta}>
                                    <span>{p.city || "—"}</span>
                                    <span>{p.projectManager || "—"}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT — Work orders */}
                <div style={s.rightPanel}>
                    {!selectedProject ? (
                        <div style={s.emptyState}>
                            <FaClipboardList style={{ fontSize: 52, color: "#cbd5e1", marginBottom: 16 }} />
                            <div style={{ fontSize: 17, color: "#94a3b8", fontWeight: 600 }}>Select a project</div>
                            <div style={{ fontSize: 14, color: "#cbd5e1", marginTop: 6 }}>Work orders will appear here</div>
                        </div>
                    ) : (
                        <>
                            {/* Project info bar */}
                            <div style={s.projInfoBar}>
                                <div>
                                    <div style={s.projInfoName}>{selectedProject.projectName}</div>
                                    <div style={s.projInfoMeta}>
                                        {selectedProject.projectCode}&nbsp;•&nbsp;
                                        {selectedProject.city}, {selectedProject.state}
                                    </div>
                                </div>
                                {/* ✅ Create: passes project via location.state */}
                                <button
                                    style={s.createBtn}
                                    onClick={() => navigate(
                                        "/coordinator-dashboard/work-orders/create",
                                        { state: { project: selectedProject } }
                                    )}
                                >
                                    <FaPlusCircle />&nbsp;Create Work Order
                                </button>
                            </div>

                            {/* Work order list */}
                            {loadingWOs ? (
                                <div style={s.centerMsg}><FaSpinner style={spin} />&nbsp;Loading…</div>
                            ) : workOrders.length === 0 ? (
                                <div style={s.emptyState}>
                                    <FaListOl style={{ fontSize: 40, color: "#e2e8f0", marginBottom: 12 }} />
                                    <div style={{ color: "#94a3b8", fontWeight: 600 }}>No work orders yet</div>
                                    <div style={{ fontSize: 13, color: "#cbd5e1", marginTop: 4 }}>
                                        Click "Create Work Order" to add one
                                    </div>
                                </div>
                            ) : (
                                <div style={s.woList}>
                                    {workOrders.map(wo => (
                                        <div key={wo.id} style={s.woCard}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <div>
                                                    <div style={s.woNo}>{wo.workOrderNo}</div>
                                                    <div style={s.woMeta}>
                                                        <FaCalendarAlt style={{ fontSize: 11 }} />
                                                        &nbsp;{wo.date || "—"}
                                                        &nbsp;&nbsp;
                                                        <FaListOl style={{ fontSize: 11 }} />
                                                        &nbsp;{wo.items?.length || 0} items
                                                    </div>
                                                </div>
                                                {/*
                                                  ✅ Edit: navigates to /:id/edit
                                                     passes project via state so header shows project name
                                                */}
                                                <button
                                                    style={s.viewBtn}
                                                    onClick={() => navigate(
                                                        `/coordinator-dashboard/work-orders/${wo.id}/edit`,
                                                        { state: { project: selectedProject } }
                                                    )}
                                                >
                                                    <FaEye />&nbsp;View / Edit
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
    );
}

const spin = { animation: "spin 1s linear infinite" };

const s = {
    wrapper:           { maxWidth: 1400, margin: "0 auto", padding: "0 0 40px" },
    pageHeader:        { display: "flex", alignItems: "center", marginBottom: 28, padding: "20px 4px 0" },
    headerIcon:        { width: 48, height: 48, background: "linear-gradient(135deg,#8b5cf6,#6d28d9)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 22 },
    pageTitle:         { margin: 0, fontSize: 24, fontWeight: 800, color: "#1e293b" },
    pageSubtitle:      { margin: "3px 0 0", fontSize: 13, color: "#64748b" },
    errorBox:          { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 16px", marginBottom: 16, fontSize: 14 },
    panels:            { display: "grid", gridTemplateColumns: "360px 1fr", gap: 20, alignItems: "start" },
    leftPanel:         { background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 4px 6px rgba(0,0,0,0.04)", overflow: "hidden" },
    panelHeader:       { padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: 10 },
    panelTitle:        { fontWeight: 700, color: "#1e293b", fontSize: 15, display: "flex", alignItems: "center" },
    searchBox:         { display: "flex", alignItems: "center", gap: 8, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 12px" },
    searchInput:       { border: "none", background: "transparent", outline: "none", fontSize: 13, color: "#1e293b", flex: 1 },
    projectList:       { maxHeight: "calc(100vh - 300px)", overflowY: "auto" },
    projectCard:       { padding: "14px 20px", cursor: "pointer", borderBottom: "1px solid #f8fafc", transition: "background 0.15s", borderLeft: "4px solid transparent" },
    projectCardActive: { background: "#ede9fe", borderLeft: "4px solid #7c3aed" },
    projName:          { fontWeight: 700, color: "#1e293b", fontSize: 14 },
    projCode:          { fontSize: 12, color: "#64748b", marginTop: 2 },
    statusBadge:       { fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20 },
    projMeta:          { display: "flex", gap: 14, marginTop: 8, fontSize: 12, color: "#94a3b8" },
    rightPanel:        { background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 4px 6px rgba(0,0,0,0.04)", minHeight: 400 },
    emptyState:        { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 40px" },
    projInfoBar:       { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #f1f5f9", flexWrap: "wrap", gap: 12 },
    projInfoName:      { fontWeight: 800, color: "#1e293b", fontSize: 17 },
    projInfoMeta:      { fontSize: 13, color: "#64748b", marginTop: 3 },
    createBtn:         { display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "linear-gradient(135deg,#7c3aed,#6d28d9)", color: "#fff", border: "none", borderRadius: 9, cursor: "pointer", fontWeight: 700, fontSize: 14 },
    woList:            { padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 },
    woCard:            { background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 18px" },
    woNo:              { fontWeight: 700, color: "#1e293b", fontSize: 15 },
    woMeta:            { display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#94a3b8", marginTop: 5 },
    viewBtn:           { display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#ede9fe", color: "#7c3aed", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 700, fontSize: 13 },
    centerMsg:         { padding: "40px", textAlign: "center", color: "#94a3b8", fontSize: 14 },
};
