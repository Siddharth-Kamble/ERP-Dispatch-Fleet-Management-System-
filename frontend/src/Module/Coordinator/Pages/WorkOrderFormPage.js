
import React, { useState, useRef, useCallback, useEffect } from "react";
import {
    FaFilePdf, FaMagic, FaPlus, FaTrash,
    FaSave, FaCheckCircle, FaExclamationTriangle,
    FaRobot, FaCloudUploadAlt, FaSpinner,
    FaEye, FaInfoCircle, FaFileExcel, FaDownload,
    FaRegArrowAltCircleLeft, FaHashtag, FaCalendarAlt, FaLayerGroup
} from "react-icons/fa";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import * as PDFJS from "pdfjs-dist";
//import XLSX from "xlsx-js-style;
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

PDFJS.GlobalWorkerOptions.workerSrc =
    new URL("pdfjs-dist/build/pdf.worker.mjs", import.meta.url).toString();

// ── Calculations ──────────────────────────────────────────────────────────────
function calcSqft(length, height) {
    const l = parseFloat(length);
    const h = parseFloat(height);
    if (isNaN(l) || l <= 0 || isNaN(h) || h <= 0) return "";
    return ((l * h) / 1_000_000 * 10.764).toFixed(4);
}

function convertWoQty(rawValue, woQtyUnit) {
    const v = parseFloat(rawValue);
    if (isNaN(v) || v <= 0) return "";
    return woQtyUnit === "sqm" ? (v * 10.764).toFixed(4) : v.toFixed(4);
}

function calcWoQtyNos(woQtySqft, sqft) {
    const qty  = parseFloat(woQtySqft);
    const area = parseFloat(sqft);
    if (isNaN(qty) || isNaN(area) || area <= 0) return "";
    return Math.floor(qty / area).toString();
}

function calcDifference(woQtyNos, qtyAsPerFloorPlan) {
    const fp  = parseFloat(woQtyNos);
    const qfp = parseFloat(qtyAsPerFloorPlan);
    if (isNaN(fp) || isNaN(qfp)) return "";
    return (fp - qfp).toString();
}

const emptyRow = () => ({
    _id:               Date.now() + Math.random(),
    srNo:              "",
    location:          "",
    windowCode:        "",
    typology:          "",
    series:            "",
    length:            "",
    height:            "",
    sqft:              "",
    woQtySqftRaw:      "",
    woQtySqft:         "",
    woQtyNos:          "",
    floorPlanQty:      "",
    qtyAsPerFloorPlan: "",
    difference:        "",
});

// ── PDF helpers ───────────────────────────────────────────────────────────────
async function pdfToImages(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFJS.getDocument({ data: arrayBuffer }).promise;
    const images = [];
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page     = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 });
        const maxDim   = 1600;
        const ratio    = Math.min(1, maxDim / Math.max(viewport.width, viewport.height));
        const final    = page.getViewport({ scale: 1.5 * ratio });
        const canvas   = document.createElement("canvas");
        canvas.width   = Math.floor(final.width);
        canvas.height  = Math.floor(final.height);
        await page.render({ canvasContext: canvas.getContext("2d"), viewport: final }).promise;
        images.push(canvas.toDataURL("image/jpeg", 0.80).split(",")[1]);
    }
    return images;
}

async function extractPageWithGrok(base64Image, pageNum, apiKey) {
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify({
            model: "grok-4.3",
            temperature: 0,
            max_tokens: 2000,
            messages: [{
                role: "user",
                content: [
                    { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}`, detail: "auto" } },
                    {
                        type: "text",
                        text: `This is page ${pageNum} of a scanned work order. Length and Height values are in millimetres (mm).
Extract ALL table rows. For each row return:
- srNo, location, windowCode, typology, series
- length, height (numeric mm, no units)
- woQtySqftRaw (numbers only, no units)
- floorPlanQty (numbers only)
Rules: missing/illegible → "". Numbers only. sqft and woQtyNos will be auto-calculated.
Return ONLY a raw JSON array, no markdown:
[{"srNo":"1","location":"Living Room","windowCode":"W1","typology":"Sliding","series":"32mm","length":"2700","height":"2350","woQtySqftRaw":"","floorPlanQty":"4"}]`,
                    },
                ],
            }],
        }),
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(`Grok API error ${response.status}: ${err?.error?.message || JSON.stringify(err)}`);
    }
    const data  = await response.json();
    const text  = (data.choices?.[0]?.message?.content || "").trim();
    const clean = text.replace(/```json|```/g, "").trim();
    if (!clean || clean === "[]") return [];
    return JSON.parse(clean);
}

async function extractWithGrok(base64Images, onProgress) {
    const apiKey = process.env.REACT_APP_GROK_API_KEY;
    let allRows  = [];
    for (let i = 0; i < base64Images.length; i++) {
        onProgress(`Processing page ${i + 1} of ${base64Images.length} with Grok Vision…`);
        const rows = await extractPageWithGrok(base64Images[i], i + 1, apiKey);
        allRows    = [...allRows, ...rows];
        if (i < base64Images.length - 1) await new Promise(r => setTimeout(r, 400));
    }
    return allRows;
}

// ── Column definitions ────────────────────────────────────────────────────────
const makeCols = (woQtyUnit) => [
    { key: "srNo",               label: "Sr. No",              type: "text",   w: 60  },
    { key: "location",           label: "Location",            type: "text",   w: 130 },
    { key: "windowCode",         label: "W Code",              type: "text",   w: 100 },
    { key: "typology",           label: "Typology",            type: "text",   w: 180 },
    { key: "series",             label: "Series",              type: "text",   w: 90  },
    { key: "length",             label: "Length (mm)",         type: "number", w: 90  },
    { key: "height",             label: "Height (mm)",         type: "number", w: 90  },
    { key: "sqft",               label: "Sqft",                type: "number", w: 90,  auto: true },
    { key: "woQtySqftRaw",       label: "W/O Qty",             type: "number", w: 100, hasUnit: true },
    ...(woQtyUnit === "sqm"
        ? [{ key: "woQtySqft",   label: "Converted Sqft",      type: "number", w: 130, auto: true, converted: true }]
        : []),
    { key: "woQtyNos",           label: "W/O Qty (Nos)",       type: "number", w: 110, auto: true },
    { key: "floorPlanQty",       label: "Floor Plan Qty",      type: "number", w: 110 },
    { key: "qtyAsPerFloorPlan",  label: "Qty As Per Floor Plan", type: "number", w: 150 },
    { key: "difference",         label: "Difference",          type: "number", w: 110, auto: true, isDiff: true },
];

// ── Excel export ──────────────────────────────────────────────────────────────
// Professional modern style:
// Row 1 : Project name — full merge, white bg, bold 14pt, centered, bottom border accent
// Row 2 : A-E = WO info (gray italic) | F-K merged = Tower name, orange #FFC000, bold centered
// Row 3 : Headers — light blue #BDD7EE, black bold, centered, wrapped, thin borders
// Rows 4+: Data — alternating white / #F2F2F2, thin gray borders, numbers right-aligned
// Last  : Total — #D9D9D9 bg, bold, top medium border
// ── Excel export ──────────────────────────────────────────────────────────────
function exportExcel(rows, projectName, towerName, workOrderNo, date, woQtyUnit) {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([]);
    const COLS = 13;
    const colLetters = ["A","B","C","D","E","F","G","H","I","J","K","L","M"];

    // ── Totals ────────────────────────────────────────────────────────────────
    const totalSqft    = rows.reduce((s,r) => s + (parseFloat(r.sqft)              || 0), 0);
    const totalWoSqmtr = rows.reduce((s,r) => s + (parseFloat(r.woQtySqftRaw)      || 0), 0);
    const totalWoSqft  = rows.reduce((s,r) => s + (parseFloat(r.woQtySqft)         || 0), 0);
    const totalNos     = rows.reduce((s,r) => s + (parseInt(r.woQtyNos)            || 0), 0);
    const totalQtyFP   = rows.reduce((s,r) => s + (parseFloat(r.qtyAsPerFloorPlan) || 0), 0);
    const totalDiff    = rows.reduce((s,r) => s + (parseFloat(r.difference)        || 0), 0);

    // ── ROW 1: Project name — light orange bg, black bold centered ────────────
    XLSX.utils.sheet_add_aoa(ws, [[projectName || "MANJARI HOUSING PROJECTS LLP"]], { origin: "A1" });

    // ── ROW 2: WO info left | Tower right ─────────────────────────────────────
    XLSX.utils.sheet_add_aoa(ws, [[
        `Work Order No: ${workOrderNo || "—"}     Date: ${date || "—"}     Unit: ${woQtyUnit?.toUpperCase() || "SQFT"}`,
        "","","","","","","","","","","",
        towerName || ""
    ]], { origin: "A2" });

    // ── ROW 3: Column headers ─────────────────────────────────────────────────
    XLSX.utils.sheet_add_aoa(ws, [[
        "Sr No","Location","Wcode","Typology","Series",
        "Length","Height","Sqft",
        "W/O Qty\nin Sqmtr","W/O in\nSqft","Qty in\nNos",
        "Qty As per\nFloor plan","Difference"
    ]], { origin: "A3" });

    // ── DATA ROWS ─────────────────────────────────────────────────────────────
    const dataRows = rows.map((r, i) => [
        r.srNo || (i + 1),
        r.location          || "",
        r.windowCode        || "",
        r.typology          || "",
        r.series            || "",
        r.length            !== "" ? Number(r.length)                                   : "",
        r.height            !== "" ? Number(r.height)                                   : "",
        r.sqft              !== "" ? parseFloat(parseFloat(r.sqft).toFixed(2))          : "",
        r.woQtySqftRaw      !== "" ? parseFloat(parseFloat(r.woQtySqftRaw).toFixed(2)) : "",
        r.woQtySqft         !== "" ? parseFloat(parseFloat(r.woQtySqft).toFixed(2))    : "",
        r.woQtyNos          !== "" ? parseInt(r.woQtyNos)                              : "",
        r.qtyAsPerFloorPlan !== "" ? parseFloat(r.qtyAsPerFloorPlan)                  : "",
        r.difference        !== "" ? parseFloat(r.difference)                         : "",
    ]);
    XLSX.utils.sheet_add_aoa(ws, dataRows, { origin: "A4" });

    // ── Total row ─────────────────────────────────────────────────────────────
    const totalR = 4 + rows.length;
    XLSX.utils.sheet_add_aoa(ws, [[
        "Total","","","","","","",
        parseFloat(totalSqft.toFixed(2)),
        parseFloat(totalWoSqmtr.toFixed(2)),
        parseFloat(totalWoSqft.toFixed(2)),
        totalNos,
        parseFloat(totalQtyFP.toFixed(2)),
        parseFloat(totalDiff.toFixed(2)),
    ]], { origin: `A${totalR}` });

    // ── Merges ────────────────────────────────────────────────────────────────
    ws["!merges"] = [
        { s:{r:0,c:0},        e:{r:0,c:COLS-1}   },  // Row1 project name full width
        { s:{r:1,c:0},        e:{r:1,c:11}        },  // Row2 WO info A–L
        { s:{r:totalR-1,c:0}, e:{r:totalR-1,c:6}  },  // Total label A:G
    ];

    // ── Column widths ─────────────────────────────────────────────────────────
    ws["!cols"] = [
        {wch:7},{wch:24},{wch:10},{wch:44},{wch:9},
        {wch:9},{wch:9},{wch:11},{wch:14},{wch:13},
        {wch:10},{wch:18},{wch:13},
    ];

    // ── Row heights ───────────────────────────────────────────────────────────
    ws["!rows"] = [
        {hpt:28}, // Row1 project name
        {hpt:18}, // Row2 WO info
        {hpt:36}, // Row3 headers
    ];

    // ── Border helpers ────────────────────────────────────────────────────────
    const thinGray   = { style:"thin",   color:{rgb:"BFBFBF"} };
    const thinNavy   = { style:"thin",   color:{rgb:"1F3864"} };
    const thinSky    = { style:"thin",   color:{rgb:"87CEEB"} };
    const medGray    = { style:"medium", color:{rgb:"595959"} };
    const bdr = (t,b,l,r) => ({ top:t, bottom:b, left:l, right:r });

    // IMPORTANT: SheetJS needs ws[ref] to exist before setting .s
    // We set both value type and style together
    const applyStyle = (ref, style) => {
        if (!ws[ref]) ws[ref] = { t:"z", v:"" };
        ws[ref].s = style;
    };

    // ── ROW 1: Light orange bg, black bold, centered ──────────────────────────
    // Light orange: #FFE0B2
    applyStyle("A1", {
        font:      { bold:true, sz:14, name:"Calibri", color:{rgb:"7B3F00"} },
        alignment: { horizontal:"center", vertical:"center" },
        fill:      { patternType:"solid", fgColor:{rgb:"FFE0B2"} },
        border:    bdr(thinNavy, thinNavy, thinNavy, thinNavy),
    });

    // ── ROW 2: WO info — white bg, gray italic ────────────────────────────────
    applyStyle("A2", {
        font:      { sz:9, name:"Calibri", color:{rgb:"595959"}, italic:true },
        alignment: { vertical:"center", wrapText:false },
        fill:      { patternType:"solid", fgColor:{rgb:"FFFFFF"} },
        border:    bdr(thinGray, thinGray, thinGray, thinGray),
    });
    ["B2","C2","D2","E2","F2","G2","H2","I2","J2","K2","L2"].forEach(ref => applyStyle(ref, {
        fill:   { patternType:"solid", fgColor:{rgb:"FFFFFF"} },
        border: bdr(thinGray, thinGray, thinGray, thinGray),
    }));

    // ── ROW 2: Tower name M2 — light blue tint, navy bold ────────────────────
    applyStyle("M2", {
        font:      { bold:true, sz:10, name:"Calibri", color:{rgb:"1F3864"} },
        alignment: { horizontal:"right", vertical:"center" },
        fill:      { patternType:"solid", fgColor:{rgb:"DEEAF1"} },
        border:    bdr(thinGray, thinGray, thinGray, thinGray),
    });

    // ── ROW 3: Column headers — VERY LIGHT SKY BLUE bg, BLACK bold ───────────
    // Sky blue: #E0F4FF  (very light)
    colLetters.forEach(col => {
        applyStyle(`${col}3`, {
            font:      { bold:true, sz:9, name:"Calibri", color:{rgb:"000000"} },
            alignment: { horizontal:"center", vertical:"center", wrapText:true },
            fill:      { patternType:"solid", fgColor:{rgb:"E0F4FF"} },
            border:    bdr(thinSky, thinSky, thinSky, thinSky),
        });
    });

    // ── DATA ROWS: white / very light gray alternating ────────────────────────
    dataRows.forEach((row, ri) => {
        const excelR = ri + 4;
        const bg     = ri % 2 === 0 ? "FFFFFF" : "F5F5F5";
        colLetters.forEach((col, ci) => {
            const isNum   = ci >= 5;
            const isDiff  = ci === 12;
            const diffVal = isDiff ? parseFloat(row[ci]) : NaN;

            let fontColor = "000000";
            let fontBold  = false;
            if (isDiff && !isNaN(diffVal) && diffVal !== 0) {
                fontBold  = true;
                fontColor = diffVal < 0 ? "C00000" : "375623";
            }

            applyStyle(`${col}${excelR}`, {
                font:      { sz:9, name:"Calibri", bold:fontBold, color:{rgb:fontColor} },
                alignment: {
                    horizontal: ci === 0 ? "center" : isNum ? "right" : "left",
                    vertical:   "center",
                },
                fill:   { patternType:"solid", fgColor:{rgb:bg} },
                border: bdr(thinGray, thinGray, thinGray, thinGray),
            });
        });
    });

    // ── TOTAL ROW: light yellow bg, black bold ────────────────────────────────
    colLetters.forEach((col, ci) => {
        const isTotalDiff = ci === 12;
        let fontColor = "000000";
        if (isTotalDiff) {
            fontColor = totalDiff < 0 ? "C00000" : totalDiff > 0 ? "375623" : "000000";
        }
        applyStyle(`${col}${totalR}`, {
            font:      { bold:true, sz:10, name:"Calibri", color:{rgb:fontColor} },
            alignment: {
                horizontal: ci === 0 ? "center" : ci >= 7 ? "right" : "left",
                vertical:   "center",
            },
            fill:   { patternType:"solid", fgColor:{rgb:"FFFF99"} },
            border: bdr(medGray, thinGray, thinGray, thinGray),
        });
    });

    // ── Write file ────────────────────────────────────────────────────────────
    // CRITICAL: xlsx-js-style or SheetJS Pro needed for cell styles.
    // Using standard sheetjs — styles via !sheetFormat + ws['!style'] where supported.
    // The applyStyle approach works with xlsx-style / xlsx-js-style packages.
    XLSX.utils.book_append_sheet(wb, ws, "Work Order");
    XLSX.writeFile(wb, `WorkOrder_${workOrderNo||"export"}_${towerName||"report"}.xlsx`);
}


// ── PDF export ────────────────────────────────────────────────────────────────
// Professional modern style matching Excel exactly:
// Header band: white bg, project name black bold centered, indigo accent bottom line
// Tower: orange #FFC000 pill right side
// Table headers: #BDD7EE light blue, black bold, centered
// Data: alternating white/#F2F2F2, all centered, thin gray borders
// Total row: #D9D9D9 gray bg, bold, all centered
// Difference: red if negative, green if positive

// ── PDF export ────────────────────────────────────────────────────────────────
function exportPDF(rows, projectName, towerName, workOrderNo, date) {
    const doc   = new jsPDF({ orientation:"landscape", unit:"mm", format:"a3" });
    const pageW = doc.internal.pageSize.width;
    const pageH = doc.internal.pageSize.height;
    const mX    = 14;   // horizontal margin

    // ─────────────────────────────────────────────────────────────────────────
    // HEADER SECTION
    // ─────────────────────────────────────────────────────────────────────────

    // ── Project name box — light orange bg, dark brown bold, full width ───────
    const projBoxH = 14;
    doc.setFillColor(255, 224, 178);         // #FFE0B2 light orange
    doc.rect(mX, 8, pageW - mX * 2, projBoxH, "F");

    // Orange border around project name box
    doc.setDrawColor(230, 126, 34);          // #E67E22 orange border
    doc.setLineWidth(0.6);
    doc.rect(mX, 8, pageW - mX * 2, projBoxH, "S");

    // Project name text — dark brown bold centered
    doc.setTextColor(123, 63, 0);            // #7B3F00 dark brown
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(
        projectName ,
        pageW / 2,
        8 + projBoxH / 2 + 4,
        { align: "center" }
    );

    // ─────────────────────────────────────────────────────────────────────────
    // WORK ORDER NO + TOWER NAME — single box with vertical divider
    // ─────────────────────────────────────────────────────────────────────────
    const infoBoxY  = 26;
    const infoBoxH  = 11;
    const infoBoxW  = pageW - mX * 2;
    const halfW     = infoBoxW / 2;

    // Box background — very light gray
    doc.setFillColor(248, 248, 248);
    doc.rect(mX, infoBoxY, infoBoxW, infoBoxH, "F");

    // Box outer border — navy
    doc.setDrawColor(31, 56, 100);           // #1F3864
    doc.setLineWidth(0.6);
    doc.rect(mX, infoBoxY, infoBoxW, infoBoxH, "S");

    // Vertical divider in the middle
    doc.setDrawColor(31, 56, 100);
    doc.setLineWidth(0.4);
    doc.line(mX + halfW, infoBoxY, mX + halfW, infoBoxY + infoBoxH);

    // LEFT side: Work Order No + Date
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text("Work Order No:", mX + 4, infoBoxY + 4.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(31, 56, 100);
    doc.text(workOrderNo || "—", mX + 35, infoBoxY + 4.5);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text("Date:", mX + 4, infoBoxY + 9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(31, 56, 100);
    doc.text(date || "—", mX + 18, infoBoxY + 9);

    // RIGHT side: Tower Name
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text("Tower Name: ", mX + halfW + 4, infoBoxY + 4.5);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(31, 56, 100);
    doc.text(towerName || "—", mX + halfW + 22, infoBoxY + 4.5);

    // Unit info right side bottom
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(`Unit: ${(typeof woQtyUnit !== "undefined" ? woQtyUnit : "sqft").toUpperCase()}`, mX + halfW + 4, infoBoxY + 9);

    // ─────────────────────────────────────────────────────────────────────────
    // TABLE
    // ─────────────────────────────────────────────────────────────────────────
    const tableRows = rows.map((r, i) => [
        r.srNo              || (i + 1),
        r.location          || "",
        r.windowCode        || "",
        r.typology          || "",
        r.series            || "",
        r.length            || "",
        r.height            || "",
        r.sqft              ? parseFloat(r.sqft).toFixed(2)         : "",
        r.woQtySqftRaw      ? parseFloat(r.woQtySqftRaw).toFixed(2) : "",
        r.woQtySqft         ? parseFloat(r.woQtySqft).toFixed(2)    : "",
        r.woQtyNos          || "",
        r.qtyAsPerFloorPlan || "",
        r.difference        || "",
    ]);

    const totalSqft    = rows.reduce((s,r) => s + (parseFloat(r.sqft)              || 0), 0);
    const totalWoSqmtr = rows.reduce((s,r) => s + (parseFloat(r.woQtySqftRaw)      || 0), 0);
    const totalWoSqft  = rows.reduce((s,r) => s + (parseFloat(r.woQtySqft)         || 0), 0);
    const totalNos     = rows.reduce((s,r) => s + (parseInt(r.woQtyNos)            || 0), 0);
    const totalQtyFP   = rows.reduce((s,r) => s + (parseFloat(r.qtyAsPerFloorPlan) || 0), 0);
    const totalDiff    = rows.reduce((s,r) => s + (parseFloat(r.difference)        || 0), 0);

    const totalRowIndex = tableRows.length;
    tableRows.push([
        "Total","","","","","","",
        totalSqft.toFixed(2),
        totalWoSqmtr.toFixed(2),
        totalWoSqft.toFixed(2),
        totalNos,
        totalQtyFP.toFixed(2),
        totalDiff.toFixed(2),
    ]);

    let tableEndY = infoBoxY + infoBoxH + 2;

    autoTable(doc, {
        startY:     tableEndY,
        tableWidth: pageW - mX * 2,
        margin:     { left: mX, right: mX },

        head: [[
            "Sr\nNo","Location","Wcode","Typology","Series",
            "Length","Height","Sqft",
            "W/O Qty\nin Sqmtr","W/O in\nSqft","Qty in\nNos",
            "Qty As per\nFloor plan","Difference"
        ]],
        body: tableRows,
        theme: "grid",

        // Header: VERY LIGHT SKY BLUE bg, BLACK bold text
        headStyles: {
            fillColor:     [224, 244, 255],  // #E0F4FF very light sky blue
            textColor:     [0, 0, 0],        // black
            fontStyle:     "bold",
            fontSize:      7.5,
            halign:        "center",
            valign:        "middle",
            cellPadding:   { top:3.5, bottom:3.5, left:1.5, right:1.5 },
            lineColor:     [0, 0, 0],
            lineWidth:     0.3,
            minCellHeight: 12,
        },

        // Body: white bg, black text, thin gray borders
        bodyStyles: {
            fontSize:      8,
            fontStyle:     "normal",
            cellPadding:   { top:2.5, bottom:2.5, left:2, right:2 },
            textColor:     [0, 0, 0],
            halign:        "center",
            valign:        "middle",
            fillColor:     [255, 255, 255],
            lineColor:     [0, 0, 0],
            lineWidth:     0.2,
        },

        // Alternating: very light gray
        alternateRowStyles: {
            fillColor: [245, 245, 245],
        },

        columnStyles: {
            0:  { halign:"center" },
            1:  { halign:"left"   },
            2:  { halign:"center" },
            3:  { halign:"left"   },
            4:  { halign:"center" },
            5:  { halign:"right"  },
            6:  { halign:"right"  },
            7:  { halign:"right"  },
            8:  { halign:"right"  },
            9:  { halign:"right"  },
            10: { halign:"right"  },
            11: { halign:"right"  },
            12: { halign:"right"  },
        },

        // ── BOX BORDER around entire table data ───────────────────────────────
        didDrawPage(data) {
            // Draw a navy border box wrapping the entire table on this page
            doc.setDrawColor(31, 56, 100);   // #1F3864 navy
            doc.setLineWidth(0.7);
            doc.rect(
                data.settings.margin.left,
                data.settings.startY,
                pageW - data.settings.margin.left - data.settings.margin.right,
                data.cursor.y - data.settings.startY,
                "S"
            );
        },

        didParseCell(data) {
            // ── Total row: light yellow, black bold ───────────────────────────
            if (data.row.index === totalRowIndex) {
                data.cell.styles.fillColor  = [255, 255, 153];
                data.cell.styles.fontStyle  = "bold";
                data.cell.styles.fontSize   = 8.5;
                data.cell.styles.textColor  = [0, 0, 0];
                data.cell.styles.halign     =
                    data.column.index >= 7 ? "right" :
                    data.column.index === 0 ? "center" : "left";
                data.cell.styles.lineColor  = [0, 0, 0];
                data.cell.styles.lineWidth  = 0.4;
            }

            // ── Difference col: red / green bold ─────────────────────────────
            if (data.section === "body" && data.column.index === 12) {
                const val = parseFloat(data.cell.raw);
                if (!isNaN(val) && val < 0) {
                    data.cell.styles.textColor = [192, 0, 0];
                    data.cell.styles.fontStyle = "bold";
                } else if (!isNaN(val) && val > 0) {
                    data.cell.styles.textColor = [55, 86, 35];
                    data.cell.styles.fontStyle = "bold";
                }
                if (data.row.index === totalRowIndex) {
                    const td = parseFloat(data.cell.raw);
                    if (!isNaN(td)) {
                        data.cell.styles.textColor =
                            td < 0 ? [192, 0, 0] :
                            td > 0 ? [55, 86, 35] : [0,0,0];
                    }
                }
            }
        },

        // Draw the outer box border AFTER table finishes on last page
        didDrawCell(data) {
            // nothing needed here — handled in didDrawPage
        },
    });

    // ── Draw final outer box border once table is complete ────────────────────
    // (didDrawPage fires per page; for single-page tables we also draw here)
    const finalY = doc.lastAutoTable.finalY;
    doc.setDrawColor(31, 56, 100);
    doc.setLineWidth(0.8);
    doc.rect(
        mX,
        tableEndY,
        pageW - mX * 2,
        finalY - tableEndY,
        "S"
    );

    // ── Footer on every page ──────────────────────────────────────────────────
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setDrawColor(191, 191, 191);
        doc.setLineWidth(0.3);
        doc.line(mX, pageH - 8, pageW - mX, pageH - 8);
        doc.setFontSize(7);
        doc.setTextColor(127, 127, 127);
        doc.setFont("helvetica", "normal");
        doc.text(
            `${projectName || ""}     |     Work Order: ${workOrderNo || "—"}     |     Page ${i} of ${pageCount}     |     ${new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}`,
            pageW / 2,
            pageH - 3.5,
            { align: "center" }
        );
    }

    doc.save(`WorkOrder_${workOrderNo||"export"}_${towerName||"report"}.pdf`);
}


// ─────────────────────────────────────────────────────────────────────────────
export default function WorkOrderFormPage() {
    const navigate  = useNavigate();
    const location  = useLocation();
    const { id }    = useParams();
    const isEdit    = Boolean(id);
    const projectFromState = location.state?.project?.projectName || "";

    // ── Form state ────────────────────────────────────────────────────────────
    const [workOrderNo, setWorkOrderNo] = useState("");
    const [projectName, setProjectName] = useState(projectFromState);
    const [towerName,   setTowerName]   = useState("");
    const [date,        setDate]        = useState(new Date().toISOString().split("T")[0]);
    const [woQtyUnit,   setWoQtyUnit]   = useState("sqft");
    const [rows,        setRows]        = useState([emptyRow()]);

    // ── UI state ──────────────────────────────────────────────────────────────
    const [loading,      setLoading]      = useState(isEdit);
    const [saving,       setSaving]       = useState(false);
    const [saveMsg,      setSaveMsg]      = useState(null);
    const [showDlMenu,   setShowDlMenu]   = useState(false);

    // ── AI / PDF state ────────────────────────────────────────────────────────
    const fileRef                           = useRef(null);
    const [pdfFile,       setPdfFile]       = useState(null);
    const [previewImages, setPreviewImages] = useState([]);
    const [showPreview,   setShowPreview]   = useState(false);
    const [aiStep,        setAiStep]        = useState("idle");
    const [aiStepMsg,     setAiStepMsg]     = useState("");
    const [extractMsg,    setExtractMsg]    = useState(null);
    const [dragOver,      setDragOver]      = useState(false);
    const isExtracting = aiStep === "converting" || aiStep === "extracting";

    // ── Load existing WO when editing ─────────────────────────────────────────
    useEffect(() => {
        if (!isEdit) return;
        (async () => {
            try {
                const res  = await fetch(`${process.env.REACT_APP_API_URL}/api/work-orders/${id}`);
                if (!res.ok) throw new Error("Not found");
                const data = await res.json();

                setWorkOrderNo(data.workOrderNo || "");
                setProjectName(data.projectName || "");
                setTowerName(data.towerName || "");
                setDate(data.date || new Date().toISOString().split("T")[0]);

                const firstUnit = data.items?.[0]?.woQtyUnit;
                if (firstUnit) setWoQtyUnit(firstUnit);

                setRows((data.items || []).map(item => {
                    const diff = calcDifference(item.woQtyNos, item.qtyAsPerFloorPlan);
                    return {
                        _id:               Date.now() + Math.random(),
                        srNo:              item.srNo          || "",
                        location:          item.location      || "",
                        windowCode:        item.windowCode    || "",
                        typology:          item.typology      || "",
                        series:            item.series        || "",
                        length:            item.length        ?? "",
                        height:            item.height        ?? "",
                        sqft:              item.sqft          ?? "",
                        woQtySqftRaw:      item.woQtySqftRaw  ?? "",
                        woQtySqft:         item.woQtySqft     ?? "",
                        woQtyNos:          item.woQtyNos      ?? "",
                        floorPlanQty:      item.floorPlanQty  ?? "",
                        qtyAsPerFloorPlan: item.qtyAsPerFloorPlan ?? "",
                        difference:        diff,
                    };
                }));
            } catch {
                setSaveMsg({ type: "error", text: "Failed to load work order data." });
            } finally {
                setLoading(false);
            }
        })();
    }, [id, isEdit]);

    // ── Re-convert when unit changes ──────────────────────────────────────────
    useEffect(() => {
        setRows(prev => prev.map(row => {
            const converted = convertWoQty(row.woQtySqftRaw, woQtyUnit);
            return { ...row, woQtySqft: converted, woQtyNos: calcWoQtyNos(converted, row.sqft) };
        }));
    }, [woQtyUnit]);

    // ── Row operations ────────────────────────────────────────────────────────
    const addRow    = () => setRows(r => [...r, emptyRow()]);
    const deleteRow = (_id) => setRows(r => r.filter(row => row._id !== _id));

    const updateRow = (_id, field, value) =>
        setRows(prev => prev.map(row => {
            if (row._id !== _id) return row;
            const u = { ...row, [field]: value };
            if (field === "length" || field === "height") {
                u.sqft     = calcSqft(u.length, u.height);
                u.woQtyNos = calcWoQtyNos(u.woQtySqft, u.sqft);
            }
            if (field === "woQtySqftRaw") {
                u.woQtySqft = convertWoQty(value, woQtyUnit);
                u.woQtyNos  = calcWoQtyNos(u.woQtySqft, u.sqft);
            }
            // Recalc woQtyNos if length/height/woQtySqftRaw changed
            if (field === "length" || field === "height" || field === "woQtySqftRaw") {
                u.difference = calcDifference(u.woQtyNos, u.qtyAsPerFloorPlan);
            }
            // Recalc difference if qtyAsPerFloorPlan changed
            if (field === "qtyAsPerFloorPlan") {
                u.difference = calcDifference(u.woQtyNos, value);
            }
            return u;
        }));

    // ── PDF file select ───────────────────────────────────────────────────────
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
        setAiStep("idle");
        setPreviewImages([]);
        setShowPreview(false);
    }, []);

    // ── AI extraction ─────────────────────────────────────────────────────────
    const handleExtract = async () => {
        if (!pdfFile) return;
        setExtractMsg(null);
        setAiStep("converting");
        setAiStepMsg("Step 1/2 — Converting PDF pages to images…");
        try {
            const images = await pdfToImages(pdfFile);
            setPreviewImages(images);
            setAiStep("extracting");
            const extracted = await extractWithGrok(images, setAiStepMsg);
            if (!Array.isArray(extracted) || extracted.length === 0)
                throw new Error("No rows detected. Try a higher quality scan or enter data manually.");

            const withCalcs = extracted.map(item => {
                const sqft      = calcSqft(item.length, item.height);
                const converted = convertWoQty(item.woQtySqftRaw || "", woQtyUnit);
                const nos       = calcWoQtyNos(converted, sqft);
                const diff      = calcDifference(nos, "");
                return { ...emptyRow(), ...item, _id: Date.now() + Math.random(), sqft, woQtySqft: converted, woQtyNos: nos, difference: diff };
            });

            setRows(withCalcs);
            setAiStep("done");
            setExtractMsg({ type: "success", text: `Grok AI extracted ${withCalcs.length} row(s). Review and save.` });
        } catch (err) {
            setAiStep("error");
            setExtractMsg({ type: "error", text: err.message });
        }
    };

    // ── Save ──────────────────────────────────────────────────────────────────
    const handleSave = async () => {
        setSaveMsg(null);
        if (!workOrderNo.trim()) { setSaveMsg({ type: "error", text: "Work Order No. is required." }); return; }
        if (!projectName.trim()) { setSaveMsg({ type: "error", text: "Project Name is required."   }); return; }

        const validRows = rows.filter(r => r.srNo || r.location || r.windowCode || r.length);
        if (!validRows.length) { setSaveMsg({ type: "error", text: "Add at least one row." }); return; }

        setSaving(true);
        const payload = {
            workOrderNo,
            projectName,
            towerName,
            date,
            items: validRows.map(({ _id, difference, ...rest }) => ({ ...rest, woQtyUnit })),
        };

        try {
            const url    = isEdit
                ? `${process.env.REACT_APP_API_URL}/api/work-orders/${id}`
                : `${process.env.REACT_APP_API_URL}/api/work-orders`;
            const method = isEdit ? "PUT" : "POST";

            const res  = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Server error");

            setSaveMsg({ type: "success", text: isEdit ? "Work Order updated successfully!" : "Work Order created successfully!" });
            setTimeout(() => navigate("/coordinator-dashboard/work-orders"), 1400);
        } catch (err) {
            setSaveMsg({ type: "error", text: err.message });
        } finally {
            setSaving(false);
        }
    };

    // ── Totals ────────────────────────────────────────────────────────────────
    const validRows  = rows.filter(r => r.srNo || r.location || r.windowCode || r.length);
    const totalSqft  = rows.reduce((s, r) => s + (parseFloat(r.woQtySqft)         || 0), 0);
    const totalNos   = rows.reduce((s, r) => s + (parseInt(r.woQtyNos)            || 0), 0);
    const totalFP    = rows.reduce((s, r) => s + (parseFloat(r.floorPlanQty)      || 0), 0);
    const totalQtyFP = rows.reduce((s, r) => s + (parseFloat(r.qtyAsPerFloorPlan) || 0), 0);
    const totalDiff  = rows.reduce((s, r) => s + (parseFloat(r.difference)        || 0), 0);

    const COLS  = makeCols(woQtyUnit);
    const isSqm = woQtyUnit === "sqm";

    if (loading) return (
        <div style={css.loadingWrap}>
            <FaSpinner style={spinStyle} /><span>Loading work order…</span>
        </div>
    );

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div style={css.page}>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                .wo-row:hover { background: #f8fafc !important; }
                .wo-del-btn:hover  { color: #ef4444 !important; background: #fef2f2 !important; border-color: #fecaca !important; }
                .wo-add-btn:hover  { background: #4f46e5 !important; transform: translateY(-1px); }
                .wo-save-btn:hover:not(:disabled) { background: #047857 !important; transform: translateY(-1px); }
                .wo-dl-btn:hover   { background: #1d4ed8 !important; transform: translateY(-1px); }
                .wo-unit-pill.active { background: #6366f1 !important; color: #fff !important; font-weight: 700; }
                .wo-unit-pill:hover:not(.active) { background: #334155 !important; color: #f8fafc !important; }
                .wo-cell:focus { border-color: #6366f1 !important; box-shadow: inset 0 0 0 1px #6366f1 !important; background: #fff !important; }
                .wo-meta-input:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.08) !important; }
                .dl-menu { position: absolute; top: 110%; right: 0; background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.12); min-width: 180px; z-index: 100; overflow: hidden; }
                .dl-item  { display: flex; align-items: center; gap: 10px; padding: 12px 16px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.1s; }
                .dl-item:hover { background: #f1f5f9; }
                input[type=number]::-webkit-inner-spin-button,
                input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
                input[type=number] { -moz-appearance: textfield; }
            `}</style>

            {/* ── Header ── */}
            <div style={css.pageHeader}>
                <div style={css.headerLeft}>
                    <button style={css.backBtn} onClick={() => navigate("/coordinator-dashboard/work-orders")}>
                        <FaRegArrowAltCircleLeft /> Back to Work Orders
                    </button>
                    <div>
                        <h1 style={css.pageTitle}>{isEdit ? "Edit Work Order" : "Create Work Order"}</h1>
                        {projectName && (
                            <div style={css.projectLine}>
                                <span style={css.dot} />
                                Project: <strong style={{ color: "#0f172a", marginLeft: 4 }}>{projectName}</strong>
                                {towerName && <><span style={{ margin: "0 6px", color: "#cbd5e1" }}>•</span><strong style={{ color: "#6366f1" }}>{towerName}</strong></>}
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    {/* Download button */}
                    <div style={{ position: "relative" }}>
                        <button
                            className="wo-dl-btn"
                            style={css.dlBtn}
                            onClick={() => setShowDlMenu(v => !v)}
                        >
                            <FaDownload style={{ fontSize: 13 }} />
                            <span>Download</span>
                        </button>
                        {showDlMenu && (
                            <div className="dl-menu" onClick={() => setShowDlMenu(false)}>
                                <div
                                    className="dl-item"
                                    style={{ color: "#16a34a" }}
                                    onClick={() => exportExcel(rows, projectName, towerName, workOrderNo, date, woQtyUnit)}
                                >
                                    <FaFileExcel style={{ fontSize: 16 }} /> Download Excel
                                </div>
                                <div
                                    className="dl-item"
                                    style={{ color: "#dc2626" }}
                                    onClick={() => exportPDF(rows, projectName, towerName, workOrderNo, date)}
                                >
                                    <FaFilePdf style={{ fontSize: 16 }} /> Download PDF
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Save button */}
                    <button className="wo-save-btn" style={css.saveBtn} onClick={handleSave} disabled={saving}>
                        {saving ? <FaSpinner style={spinStyle} /> : <FaSave style={{ fontSize: 13 }} />}
                        <span>{saving ? "Saving…" : isEdit ? "Update Work Order" : "Save Work Order"}</span>
                    </button>
                </div>
            </div>

            {/* ── Toast ── */}
            {saveMsg && (
                <div style={{ ...css.toast, ...(saveMsg.type === "success" ? css.toastOk : css.toastErr) }}>
                    {saveMsg.type === "success" ? <FaCheckCircle style={{ flexShrink: 0 }} /> : <FaExclamationTriangle style={{ flexShrink: 0 }} />}
                    <span>{saveMsg.text}</span>
                </div>
            )}

            {/* ── Metadata card ── */}
            <div style={css.card}>
                <div style={css.cardHeader}>
                    <FaLayerGroup style={{ color: "#6366f1" }} />
                    <span style={css.cardLabel}>Work Order Details</span>
                </div>
                <div style={css.metaGrid}>
                    {/* Work Order No */}
                    <div style={css.fieldWrap}>
                        <label style={css.fieldLabel}>WORK ORDER NO <span style={{ color: "#ef4444" }}>*</span></label>
                        <div style={css.iconWrap}>
                            <FaHashtag style={css.inputIcon} />
                            <input
                                className="wo-meta-input"
                                style={{ ...css.fieldInput, paddingLeft: 34, ...(isEdit ? css.fieldInputDisabled : {}) }}
                                value={workOrderNo}
                                onChange={e => setWorkOrderNo(e.target.value)}
                                placeholder="e.g. WO-2026-001"
                                disabled={isEdit}
                            />
                        </div>
                    </div>

                    {/* Project Name — read-only */}
                    <div style={css.fieldWrap}>
                        <label style={css.fieldLabel}>PROJECT NAME <span style={{ color: "#ef4444" }}>*</span></label>
                        <div style={{ ...css.fieldStatic, fontWeight: 600 }}>
                            {projectName || <span style={{ color: "#94a3b8" }}>No project selected</span>}
                        </div>
                        {!projectName && (
                            <span style={{ fontSize: 11, color: "#f59e0b", marginTop: 4 }}>⚠ Go back and select a project first</span>
                        )}
                    </div>

                    {/* Tower Name */}
                    <div style={css.fieldWrap}>
                        <label style={css.fieldLabel}>TOWER NAME</label>
                        <input
                            className="wo-meta-input"
                            style={css.fieldInput}
                            value={towerName}
                            onChange={e => setTowerName(e.target.value)}
                            placeholder="e.g. Tower-6"
                        />
                    </div>

                    {/* Date */}
                    <div style={css.fieldWrap}>
                        <label style={css.fieldLabel}>DATE</label>
                        <div style={css.iconWrap}>
                            <FaCalendarAlt style={css.inputIcon} />
                            <input
                                className="wo-meta-input"
                                style={{ ...css.fieldInput, paddingLeft: 34 }}
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>



            {/* ── Items table ── */}
            <div style={css.card}>
                <div style={css.tableToolbar}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Line Items</span>
                        <span style={css.rowCount}>{rows.length} rows</span>
                    </div>
                    <button className="wo-add-btn" style={css.addBtn} onClick={addRow}>
                        <FaPlus style={{ fontSize: 11 }} />&nbsp;Add Row
                    </button>
                </div>

                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                        <thead>
                            <tr>
                                {COLS.map(c => (
                                    <th key={c.key} style={{ ...css.th, minWidth: c.w, maxWidth: c.w }}>
                                        {c.hasUnit ? (
                                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                                <span>W/O Quantity</span>
                                                <div style={{ display: "flex", background: "#0f172a", padding: 2, borderRadius: 6, width: "fit-content" }}>
                                                    {["sqft", "sqm"].map(u => (
                                                        <button key={u} className={`wo-unit-pill ${woQtyUnit === u ? "active" : ""}`} style={css.unitPillSm} onClick={() => setWoQtyUnit(u)}>{u}</button>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : c.auto ? (
                                            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                                <span>{c.label}</span>
                                                <span style={{ fontSize: 8, fontWeight: 700, color: c.isDiff ? "#fcd34d" : "#a5b4fc", textTransform: "uppercase" }}>
                                                    {c.isDiff ? "FP Qty − Qty As Per FP" : "Auto"}
                                                </span>
                                            </div>
                                        ) : (
                                            <span>{c.label}</span>
                                        )}
                                    </th>
                                ))}
                                <th style={{ ...css.th, minWidth: 48, maxWidth: 48, textAlign: "center" }}>Del</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, idx) => (
                                <tr key={row._id} className="wo-row" style={{ borderBottom: "1px solid #e2e8f0" }}>
                                    {COLS.map(c => {
                                        const diffVal = c.isDiff ? parseFloat(row[c.key]) : null;
                                        const diffStyle = c.isDiff && !isNaN(diffVal)
                                            ? diffVal < 0
                                                ? { ...css.cellAuto, background: "#fef2f2", color: "#b91c1c", borderColor: "#fecaca" }
                                                : diffVal > 0
                                                    ? { ...css.cellAuto, background: "#f0fdf4", color: "#15803d", borderColor: "#bbf7d0" }
                                                    : { ...css.cellAuto, background: "#f8fafc", color: "#475569" }
                                            : {};
                                        return (
                                            <td key={c.key} style={{ padding: "5px 6px" }}>
                                                <input
                                                    className="wo-cell"
                                                    style={{
                                                        ...css.cell,
                                                        ...(c.auto && !c.converted && !c.isDiff ? css.cellAuto : {}),
                                                        ...(c.converted ? css.cellConverted : {}),
                                                        ...(c.key === "woQtyNos" && row[c.key] ? css.cellNos : {}),
                                                        ...(c.isDiff ? diffStyle : {}),
                                                        textAlign: c.type === "number" || c.auto ? "right" : "left",
                                                    }}
                                                    type={c.type}
                                                    value={row[c.key]}
                                                    readOnly={c.auto}
                                                    placeholder={c.key === "srNo" ? String(idx + 1) : ""}
                                                    onChange={e => updateRow(row._id, c.key, e.target.value)}
                                                />
                                            </td>
                                        );
                                    })}
                                    <td style={{ padding: "5px 6px", textAlign: "center" }}>
                                        <button className="wo-del-btn" style={css.delBtn} onClick={() => deleteRow(row._id)} title="Delete row">
                                            <FaTrash style={{ fontSize: 11 }} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr style={{ background: "#f8fafc", borderTop: "2px solid #cbd5e1" }}>
                                <td colSpan={isSqm ? 9 : 8} style={{ padding: "14px 16px", fontWeight: 700, fontSize: 13, color: "#1e293b" }}>Totals</td>
                                {isSqm && <td style={css.tfootCell} />}
                                <td style={{ ...css.tfootCell, color: "#7c3aed" }}>{totalNos}</td>
                                <td style={{ ...css.tfootCell, color: "#059669" }}>{totalFP.toFixed(2)}</td>
                                <td style={{ ...css.tfootCell, color: "#0891b2" }}>{totalQtyFP.toFixed(2)}</td>
                                <td style={{ ...css.tfootCell, color: totalDiff < 0 ? "#b91c1c" : "#059669", fontWeight: 800 }}>{totalDiff.toFixed(2)}</td>
                                <td style={css.tfootCell} />
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Summary strip */}
                <div style={css.summaryStrip}>
                    {[
                        { label: "Rows",             val: rows.length,            color: "#475569" },
                        { label: "Unit",             val: woQtyUnit.toUpperCase(),color: "#4f46e5" },
                        { label: "Total W/O Sqft",   val: totalSqft.toFixed(2),  color: "#0891b2" },
                        { label: "Total Nos",        val: totalNos,              color: "#7c3aed" },
                        { label: "Floor Plan",       val: totalFP.toFixed(2),    color: "#059669" },
                        { label: "Qty As Per FP",    val: totalQtyFP.toFixed(2), color: "#0891b2" },
                        { label: "Difference",       val: totalDiff.toFixed(2),  color: totalDiff < 0 ? "#b91c1c" : "#059669" },
                    ].map(s => (
                        <div key={s.label} style={css.summaryItem}>
                            <span style={css.summaryLabel}>{s.label}</span>
                            <span style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.val}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Bottom bar ── */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 8, paddingBottom: 40 }}>
                <button className="wo-save-btn" style={css.saveBtn} onClick={handleSave} disabled={saving}>
                    {saving ? <FaSpinner style={spinStyle} /> : <FaSave style={{ fontSize: 13 }} />}
                    <span>{saving ? "Saving…" : isEdit ? "Update Work Order" : "Save Work Order"}</span>
                </button>
            </div>
        </div>
    );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const spinStyle = { animation: "spin 0.9s linear infinite", display: "inline-block" };

const css = {
    page:             { maxWidth: 1600, margin: "0 auto", padding: "0 24px 56px", fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif" },
    loadingWrap:      { display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "120px 0", color: "#64748b", fontSize: 15 },
    pageHeader:       { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, padding: "32px 0 24px", flexWrap: "wrap" },
    headerLeft:       { display: "flex", flexDirection: "column", gap: 8 },
    backBtn:          { background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 13, color: "#64748b", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 },
    pageTitle:        { margin: 0, fontSize: 24, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" },
    projectLine:      { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#475569", fontWeight: 500 },
    dot:              { width: 7, height: 7, borderRadius: "50%", background: "#6366f1", flexShrink: 0 },
    saveBtn:          { display: "flex", alignItems: "center", gap: 8, padding: "11px 22px", background: "#10b981", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13, transition: "all 0.2s" },
    dlBtn:            { display: "flex", alignItems: "center", gap: 8, padding: "11px 18px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13, transition: "all 0.2s" },
    toast:            { display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderRadius: 8, fontSize: 14, fontWeight: 500, marginBottom: 24, border: "1px solid" },
    toastOk:          { background: "#ecfdf5", color: "#047857", borderColor: "#a7f3d0" },
    toastErr:         { background: "#fef2f2", color: "#b91c1c", borderColor: "#fecaca" },
    card:             { background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)", marginBottom: 24, overflow: "hidden" },
    cardHeader:       { display: "flex", alignItems: "center", gap: 10, padding: "20px 24px 0" },
    cardLabel:        { fontSize: 12, fontWeight: 700, color: "#475569", letterSpacing: "0.05em", textTransform: "uppercase" },
    grokBadge:        { background: "#ede9fe", color: "#6d28d9", fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20, marginLeft: 8 },
    metaGrid:         { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 24, padding: "20px 24px 24px" },
    fieldWrap:        { display: "flex", flexDirection: "column", gap: 6 },
    fieldLabel:       { fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.05em" },
    iconWrap:         { position: "relative", display: "flex", alignItems: "center" },
    inputIcon:        { position: "absolute", left: 12, color: "#94a3b8", fontSize: 12, pointerEvents: "none" },
    fieldInput:       { width: "100%", padding: "9px 14px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13, color: "#0f172a", background: "#fff", outline: "none", transition: "all 0.15s", boxSizing: "border-box" },
    fieldInputDisabled:{ background: "#f8fafc", color: "#94a3b8", cursor: "not-allowed", borderStyle: "dashed" },
    fieldStatic:      { padding: "9px 14px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, color: "#1e293b", background: "#f8fafc" },
    infoBox:          { display: "flex", alignItems: "flex-start", gap: 10, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#1e40af", marginBottom: 16 },
    dropZone:         { border: "2px dashed #cbd5e1", borderRadius: 12, padding: "36px 24px", textAlign: "center", cursor: "pointer", transition: "all 0.2s", background: "#f8fafc" },
    progressBox:      { display: "flex", alignItems: "center", gap: 12, background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: 8, padding: "12px 16px", marginTop: 14 },
    extractBtn:       { display: "flex", alignItems: "center", gap: 8, padding: "11px 24px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14 },
    previewBtn:       { display: "flex", alignItems: "center", gap: 8, padding: "11px 20px", background: "#0ea5e9", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14 },
    tableToolbar:     { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid #e2e8f0" },
    rowCount:         { fontSize: 12, color: "#64748b", fontWeight: 500, background: "#f1f5f9", padding: "2px 10px", borderRadius: 20 },
    addBtn:           { display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 12, transition: "all 0.2s" },
    th:               { padding: "12px 8px", background: "#1e293b", color: "#f8fafc", fontWeight: 600, textAlign: "left", fontSize: 11, whiteSpace: "nowrap", borderRight: "1px solid #334155", verticalAlign: "middle" },
    cell:             { width: "100%", padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 12, color: "#0f172a", background: "#fff", outline: "none", transition: "border-color 0.15s" },
    cellAuto:         { background: "#f1f5f9", color: "#475569", cursor: "not-allowed", fontWeight: 500, borderColor: "#e2e8f0" },
    cellConverted:    { background: "#f0f9ff", color: "#0284c7", cursor: "not-allowed", fontWeight: 600, borderColor: "#bae6fd" },
    cellNos:          { background: "#faf5ff", color: "#6b21a8", fontWeight: 600, borderColor: "#e9d5ff", cursor: "not-allowed" },
    delBtn:           { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 6, background: "#fff", border: "1px solid #e2e8f0", cursor: "pointer", color: "#94a3b8", transition: "all 0.15s" },
    tfootCell:        { padding: "14px 8px", fontSize: 13, textAlign: "right", fontWeight: 600 },
    summaryStrip:     { display: "flex", gap: 0, borderTop: "1px solid #e2e8f0", flexWrap: "wrap" },
    summaryItem:      { flex: "1 1 120px", display: "flex", flexDirection: "column", alignItems: "center", padding: "14px 10px", borderRight: "1px solid #e2e8f0" },
    summaryLabel:     { fontSize: 10, color: "#64748b", fontWeight: 600, letterSpacing: "0.05em", marginBottom: 6, textTransform: "uppercase" },
    unitPillSm:       { fontSize: 9, fontWeight: 600, padding: "3px 8px", borderRadius: 4, border: "none", cursor: "pointer", background: "transparent", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.02em" },
};
