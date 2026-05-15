// ════════════════════════════════════════════════════════════════════
// UPDATED TrackerPage.jsx — Drop-in replacement
// Fixes: 1) Job Card filter  2) WCode filter  3) Download Excel
//        4) Unified "Window Job Card" form  5) Job card save + download
//        6) Excel export identical to original format
// ════════════════════════════════════════════════════════════════════
import React, { useState, useEffect, useMemo, useRef } from "react";

// ─── STAGE CONFIG ────────────────────────────────────────────────────────────
const STAGE_CFG = {
  Handover:  { label:"Handover",  bg:"#d1fae5", color:"#065f46", dot:"#10b981" },
  Installed: { label:"Installed", bg:"#dbeafe", color:"#1d4ed8", dot:"#3b82f6" },
  Supplied:  { label:"Supplied",  bg:"#fef3c7", color:"#92400e", dot:"#f59e0b" },
  Pending:   { label:"Pending",   bg:"#fee2e2", color:"#991b1b", dot:"#ef4444" },
};

// ─── DEFAULT DATA (same as before – truncated for brevity, use existing DEFAULT_TRACKER_DATA) ──
// In your actual file keep the full DEFAULT_TRACKER_DATA array as-is
// We just export the TrackerPage component here

// ─── SHARED STYLES ───────────────────────────────────────────────────────────
const TH = { padding:"8px 10px", background:"#f1f5f9", fontWeight:700, fontSize:11,
             color:"#475569", textTransform:"uppercase", letterSpacing:"0.05em",
             borderBottom:"1px solid #e2e8f0", borderRight:"1px solid #e2e8f0", whiteSpace:"nowrap" };
const TD = { padding:"6px 8px", fontSize:12, color:"#1e293b", borderBottom:"1px solid #f1f5f9",
             borderRight:"1px solid #f1f5f9", verticalAlign:"middle" };
const CALC_TD = { ...TD, background:"#f8fafc", color:"#475569", fontStyle:"italic", textAlign:"right" };

const inp = { border:"1px solid #e2e8f0", borderRadius:6, padding:"5px 9px", fontSize:12,
              color:"#1e293b", outline:"none", width:"100%", boxSizing:"border-box" };

function pctColor(p) {
  if (p===100) return "#10b981"; if (p>=80) return "#3b82f6"; if (p>=50) return "#f59e0b"; return "#ef4444";
}

// ─── EXCEL EXPORT UTILITY ────────────────────────────────────────────────────
// Exports tracker data to Excel in the same format as the original file
async function exportTrackerToExcel(trackerData, title) {
  if (!window.XLSX) {
    await new Promise((res,rej)=>{
      const s=document.createElement("script");
      s.src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
      s.onload=res; s.onerror=rej; document.head.appendChild(s);
    });
  }
  const XLSX = window.XLSX;
  const wb = XLSX.utils.book_new();

  // ── TRACKER sheet (same column layout as original) ──
  const rows = [];
  // Row 1: blank
  rows.push([]);
  // Row 2: blank
  rows.push([]);
  // Row 3: header info row
  rows.push(["","PROJECT : "+title,"","","","","","","","","","","","","","","","","","DC.NO","","","","","STATUS","","","","","","","SUPPLY","","","","INSTALLATION","","","","HANDOVER"]);
  // Row 4: column headers
  rows.push(["","SR NO.","FLAT","LOCATION","WCODE","TYPOLOGY","SERIES","LENGTH","","","HEIGHT","","","WO LNT","WO HGT","SQ FT.","LENGTH","HEIGHT","JOB CARD","FRAME","SHUTTER","FIX FRAME","B/FIX GLASS","TOP FIX GLASS","FRAME","SHUTTER","FIX FRAME","B/F FIX GLASS","TOP FIX GLASS","SLIDING LOCK","OPENABLE HANDLE","FRAME","SHUTTER","FIX FRAME","BOTTOM FIX","FRAME","SHUTTER","FIX FRAME","FIX GLASS","HANDOVER QTY"]);

  // Data rows
  trackerData.forEach(flat => {
    flat.windows.forEach(w => {
      const isHandover  = w.stage === "Handover";
      const isInstalled = w.stage === "Installed";
      const isSupplied  = w.stage === "Supplied";
      const sqft = w.sqft || 0;
      const supplyVal   = (isHandover || isInstalled || isSupplied) ? sqft : 0;
      const installVal  = (isHandover || isInstalled) ? sqft : 0;
      const handoverVal = isHandover ? sqft : 0;
      rows.push([
        "", w.sr, flat.flatNo, w.location, w.wcode, w.typology, w.series,
        "","","","","","","","",sqft,"","",
        w.jobCard,
        isInstalled||isHandover?"I":"", isInstalled||isHandover?"I":"",
        "","","","","","","","","","",
        supplyVal, supplyVal, 0, 0,
        installVal, installVal, 0, 0,
        handoverVal
      ]);
    });
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Column widths
  ws["!cols"] = [
    {wch:4},{wch:6},{wch:6},{wch:18},{wch:8},{wch:24},{wch:8},
    {wch:8},{wch:4},{wch:4},{wch:8},{wch:4},{wch:4},{wch:8},{wch:8},{wch:10},{wch:8},{wch:8},{wch:12},
    {wch:7},{wch:7},{wch:8},{wch:9},{wch:10},
    {wch:7},{wch:7},{wch:8},{wch:10},{wch:10},{wch:10},{wch:13},
    {wch:8},{wch:8},{wch:8},{wch:9},
    {wch:8},{wch:8},{wch:8},{wch:8},
    {wch:10}
  ];

  XLSX.utils.book_append_sheet(wb, ws, "TRACKER");

  // ── SUMMARY sheet ──
  const sumRows = [
    ["TRACKER SUMMARY — "+title],
    [],
    ["Floor","Flat No","Total Windows","Handover","Installed","Supplied","Pending","Total SqFt","% Complete"],
  ];
  trackerData.forEach(f=>{
    sumRows.push([f.floor, f.flatNo, f.totalWindows, f.handover, f.installed, f.supplied||0, f.pending,
                  Math.round(f.totalSqft*100)/100, f.pctComplete+"%"]);
  });
  const wsSum = XLSX.utils.aoa_to_sheet(sumRows);
  wsSum["!cols"] = [{wch:6},{wch:8},{wch:14},{wch:10},{wch:10},{wch:10},{wch:10},{wch:12},{wch:12}];
  XLSX.utils.book_append_sheet(wb, wsSum, "SUMMARY");

  XLSX.writeFile(wb, title.replace(/\s+/g,"_")+"_TRACKER_EXPORT.xlsx");
}

// ─── JOB CARD SAVE/DOWNLOAD ──────────────────────────────────────────────────
async function exportJobCardToExcel(jc) {
  if (!window.XLSX) {
    await new Promise((res,rej)=>{
      const s=document.createElement("script");
      s.src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
      s.onload=res; s.onerror=rej; document.head.appendChild(s);
    });
  }
  const XLSX = window.XLSX;
  const wb = XLSX.utils.book_new();

  // ── JC Header ──
  const jcRows = [
    ["ONE DEO LEELA FACADE SYSTEMS PVT. LTD."],
    ["Authorized Fabricator Engineers For: Domal, Technal & Wicona Systems"],
    [],
    ["JOB CARD — WINDOW","","","","","JC No:",jc.header.jcNo],
    ["Project:",jc.header.projectName,"","","","Date:",jc.header.date],
    ["Tower:",jc.header.tower,"","","","Drawing No:",jc.header.drawingNo],
    ["Scope:",jc.header.scope],
    [],
    // Window Description
    ["WINDOW DESCRIPTION"],
    ["SR","Location","WCode","Typology","Series","Qty","SqFt","SqMtr","Rate (₹)",
     "30% Outer Supply","40% Glass & Shutter","10% Frame Install","10% Shutter & Glass","10% Handover"],
  ];
  jc.winRows.forEach((r,i)=>{
    const sqmtr = ((parseFloat(r.sqft)||0)/10.764);
    const rate  = parseFloat(r.rate)||0;
    jcRows.push([
      i+1, r.location, r.wcode, r.typology, r.series,
      parseFloat(r.qty)||0, parseFloat(r.sqft)||0,
      +sqmtr.toFixed(3), rate,
      +(sqmtr*rate*0.30).toFixed(0),
      +(sqmtr*rate*0.40).toFixed(0),
      +(sqmtr*rate*0.10).toFixed(0),
      +(sqmtr*rate*0.10).toFixed(0),
      +(sqmtr*rate*0.10).toFixed(0),
    ]);
  });
  const totalSqft  = jc.winRows.reduce((s,r)=>s+(parseFloat(r.sqft)||0),0);
  jcRows.push(["TOTAL","","","","","",+totalSqft.toFixed(3),+(totalSqft/10.764).toFixed(3)]);

  jcRows.push([]);
  jcRows.push(["HARDWARE SPECIFICATIONS"]);
  const hwLabels = ["ALUMINIUM","ALU FINISH","EXHAUST","LOCK","MESH","SCREW","GASKET","SILICONE SEALANT","WOOLPILE","NYLON ROLLERS","BUTT / FRICTION HINGES"];
  const hwKeys   = ["aluminium","aluFinish","exhaust","lock","mesh","screw","gasket","sealant","woolpile","nylonRollers","hinges"];
  hwKeys.forEach((k,i)=>{ jcRows.push([hwLabels[i], jc.hw[k]||""]); });

  jcRows.push([]);
  jcRows.push(["GLASS SPECIFICATIONS"]);
  jcRows.push(["Glass Type","Make","Thickness","Zoning","Location / Floor"]);
  jc.glassRows.forEach(r=>{ jcRows.push([r.glassType,r.make,r.thickness,r.zoning,r.location]); });

  jcRows.push([]);
  jcRows.push(["WINDOW SPECIFICATIONS (PER FLAT)"]);
  jcRows.push(["SR","Flat No","Location","WCode","Typology","Series","Length (mm)","Height (mm)","SqFt","Exhaust Location"]);
  jc.specRows.forEach((r,i)=>{
    const sf = (parseFloat(r.length)||0)*(parseFloat(r.height)||0)/1000000*10.764;
    jcRows.push([i+1,r.flatNo,r.location,r.wcode,r.typology,r.series,r.length,r.height,+sf.toFixed(3),r.exhaustLoc]);
  });

  const ws = XLSX.utils.aoa_to_sheet(jcRows);
  ws["!cols"]=[{wch:4},{wch:20},{wch:10},{wch:26},{wch:8},{wch:6},{wch:10},{wch:10},{wch:10},{wch:14},{wch:16},{wch:14},{wch:16},{wch:12}];
  XLSX.utils.book_append_sheet(wb, ws, "JOB CARD");
  const fname = (jc.header.jcNo||"JC").replace(/[\/\\:]/g,"-")+"_JobCard.xlsx";
  XLSX.writeFile(wb, fname);
}

// ─── UPLOAD MODAL ─────────────────────────────────────────────────────────────
async function parseExcelToTrackerData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const XLSX = window.XLSX;
        if (!XLSX) { reject(new Error("XLSX library not loaded")); return; }
        const wb = XLSX.read(e.target.result, { type:"array" });
        const sheetName = wb.SheetNames.find(s=>s.toUpperCase()==="TRACKER")||wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
        const raw = XLSX.utils.sheet_to_json(ws, { header:1, defval:null });
        const dataRows = raw.slice(3).filter(r=>r && r[1]!=null && r[1]!=="");

        function getStage(row) {
          // Col 39 = HANDOVER, col 35-38 = INSTALL, col 31-34 = SUPPLY
          const h = parseFloat(row[39]);
          const i35 = parseFloat(row[35]), i36 = parseFloat(row[36]);
          const s31 = parseFloat(row[31]);
          if (!isNaN(h) && h>0) return "Handover";
          if ((!isNaN(i35)&&i35>0)||(!isNaN(i36)&&i36>0)) return "Installed";
          if (!isNaN(s31) && s31>0) return "Supplied";
          // Also check status text col 24/25 = "I" or "R"
          const st24 = String(row[24]||"").trim().toUpperCase();
          const st25 = String(row[25]||"").trim().toUpperCase();
          if (st24==="I"||st25==="I") return "Installed";
          if (st24==="R"||st25==="R") return "Installed";
          return "Pending";
        }

        function getFloor(flat) {
          const fn=parseInt(flat); if(isNaN(fn)) return "G";
          if(fn<100) return "G";
          return String(Math.floor(fn/100));
        }

        const flatsMap = {};
        dataRows.forEach(r=>{
          try {
            const sr   = parseInt(r[1]);
            const flat = parseInt(r[2]);
            const sqft = parseFloat(r[15])||0;
            const stage= getStage(r);
            const win = {
              sr, location:String(r[3]||"").trim(),
              wcode:String(r[4]||"").trim(),
              typology:String(r[5]||"").trim(),
              series:String(r[6]||"").trim(),
              sqft:Math.round(sqft*100)/100,
              jobCard:String(r[18]||"").trim(),
              stage,
            };
            if(!flatsMap[flat]) flatsMap[flat]=[];
            flatsMap[flat].push(win);
          } catch{}
        });

        const result = Object.keys(flatsMap).sort((a,b)=>parseInt(a)-parseInt(b)).map(flatNo=>{
          const fn=parseInt(flatNo), wins=flatsMap[flatNo];
          const total=wins.length;
          const handover=wins.filter(w=>w.stage==="Handover").length;
          const installed=wins.filter(w=>w.stage==="Installed").length;
          const supplied=wins.filter(w=>w.stage==="Supplied").length;
          const pending=wins.filter(w=>w.stage==="Pending").length;
          const totalSqft=Math.round(wins.reduce((s,w)=>s+w.sqft,0)*100)/100;
          const done=handover+installed+supplied;
          const pct=total>0?Math.round((done/total)*1000)/10:0;
          return {flatNo:fn, floor:getFloor(fn), totalWindows:total,
                  handover, installed, supplied, pending, totalSqft, pctComplete:pct, windows:wins};
        });
        resolve(result);
      } catch(err){reject(err);}
    };
    reader.onerror=reject;
    reader.readAsArrayBuffer(file);
  });
}

function UploadModal({onClose, onUpload}) {
  const [file,setFile]=useState(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [success,setSuccess]=useState(false);
  const inputRef=useRef();
  const handleFile=f=>{
    if(!f) return;
    if(!f.name.match(/\.xlsx?$/i)){setError("Please upload a valid .xlsx Excel file.");return;}
    setFile(f); setError(""); setSuccess(false);
  };
  const handleDrop=e=>{e.preventDefault();handleFile(e.dataTransfer.files[0]);};
  const handleProcess=async()=>{
    if(!file){setError("Please select a file first.");return;}
    setLoading(true); setError("");
    try {
      if(!window.XLSX){
        await new Promise((res,rej)=>{
          const s=document.createElement("script");
          s.src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
          s.onload=res; s.onerror=rej; document.head.appendChild(s);
        });
      }
      const data=await parseExcelToTrackerData(file);
      if(!data||data.length===0){setError("No tracker data found.");setLoading(false);return;}
      setSuccess(true);
      setTimeout(()=>{onUpload(data,file.name);onClose();},800);
    } catch(err){setError("Failed to parse file: "+err.message);}
    setLoading(false);
  };
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(15,23,42,.65)",zIndex:3000,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:20,width:"100%",maxWidth:560,padding:36}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <div><h2 style={{margin:0,fontSize:20,color:"#1e293b"}}>📤 Upload New Tracker</h2>
          <p style={{margin:"6px 0 0",fontSize:13,color:"#64748b"}}>Upload Excel file with a TRACKER sheet</p></div>
          <button onClick={onClose} style={{border:"none",background:"transparent",fontSize:20,cursor:"pointer",color:"#94a3b8"}}>✕</button>
        </div>
        <div onDrop={handleDrop} onDragOver={e=>e.preventDefault()} onClick={()=>inputRef.current.click()}
          style={{border:`2px dashed ${file?"#10b981":"#cbd5e1"}`,borderRadius:14,padding:"32px 24px",textAlign:"center",cursor:"pointer",background:file?"#f0fdf4":"#f8fafc",marginBottom:16}}>
          <input ref={inputRef} type="file" accept=".xlsx,.xls" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>
          <div style={{fontSize:36,marginBottom:12}}>{file?"✅":"📂"}</div>
          {file?(<div><div style={{fontWeight:700,color:"#10b981",fontSize:15}}>{file.name}</div><div style={{fontSize:12,color:"#64748b",marginTop:4}}>{(file.size/1024).toFixed(1)} KB</div></div>)
               :(<div><div style={{fontWeight:600,color:"#475569",fontSize:15}}>Drag & drop or click to select</div><div style={{fontSize:12,color:"#94a3b8",marginTop:6}}>.xlsx files only</div></div>)}
        </div>
        {error   && <div style={{background:"#fee2e2",color:"#991b1b",borderRadius:8,padding:"10px 14px",marginBottom:14,fontSize:13}}>⚠️ {error}</div>}
        {success && <div style={{background:"#d1fae5",color:"#065f46",borderRadius:8,padding:"10px 14px",marginBottom:14,fontSize:13}}>✅ Data parsed successfully!</div>}
        <div style={{display:"flex",gap:10}}>
          <button onClick={handleProcess} disabled={!file||loading||success}
            style={{flex:1,border:"none",background:(!file||loading||success)?"#94a3b8":"#1d4ed8",color:"#fff",borderRadius:10,padding:"12px",cursor:(!file||loading||success)?"default":"pointer",fontWeight:700,fontSize:14}}>
            {loading?"⏳ Processing…":success?"✅ Done!":"🚀 Process & Load Tracker"}
          </button>
          <button onClick={onClose} style={{border:"1px solid #e2e8f0",background:"#fff",borderRadius:10,padding:"12px 20px",cursor:"pointer",fontWeight:600,color:"#64748b"}}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── MINI BAR ────────────────────────────────────────────────────────────────
function MiniBar({handover,installed,supplied,total}) {
  const hP=(handover/total)*100, iP=(installed/total)*100, sP=(supplied/total)*100;
  return (<div style={{width:"100%",height:6,borderRadius:3,background:"#f1f5f9",display:"flex",overflow:"hidden"}}>
    <div style={{width:`${hP}%`,background:"#10b981"}}/><div style={{width:`${iP}%`,background:"#3b82f6"}}/><div style={{width:`${sP}%`,background:"#f59e0b"}}/>
  </div>);
}

// ─── FLAT CARD ───────────────────────────────────────────────────────────────
function FlatCard({flat,onClick,onEdit}) {
  const c=pctColor(flat.pctComplete);
  return (
    <div onClick={()=>onClick(flat)}
      style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:"14px 16px",cursor:"pointer",transition:"all .2s",borderTop:`3px solid ${c}`,position:"relative"}}
      onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 4px 14px rgba(0,0,0,.10)";e.currentTarget.style.transform="translateY(-2px)";}}
      onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";e.currentTarget.style.transform="none";}}>
      <button onClick={ev=>{ev.stopPropagation();onEdit(flat);}} title="Edit flat"
        style={{position:"absolute",top:8,right:8,border:"none",background:"transparent",cursor:"pointer",color:"#94a3b8",fontSize:12,padding:2}}>✏️</button>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <span style={{fontWeight:700,fontSize:14,color:"#1e293b"}}>Flat {flat.flatNo}</span>
        <span style={{fontSize:12,fontWeight:700,color:c}}>{flat.pctComplete}%</span>
      </div>
      <MiniBar handover={flat.handover} installed={flat.installed} supplied={flat.supplied||0} total={flat.totalWindows}/>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:8,fontSize:11,color:"#64748b"}}>
        <span>{flat.totalWindows} windows</span><span>{flat.totalSqft.toFixed(1)} sqft</span>
      </div>
      <div style={{marginTop:6,display:"flex",gap:4,flexWrap:"wrap"}}>
        {flat.handover  >0&&<span style={{fontSize:10,background:"#d1fae5",color:"#065f46",borderRadius:4,padding:"2px 6px",fontWeight:600}}>H:{flat.handover}</span>}
        {flat.installed >0&&<span style={{fontSize:10,background:"#dbeafe",color:"#1d4ed8",borderRadius:4,padding:"2px 6px",fontWeight:600}}>I:{flat.installed}</span>}
        {flat.supplied  >0&&<span style={{fontSize:10,background:"#fef3c7",color:"#92400e",borderRadius:4,padding:"2px 6px",fontWeight:600}}>S:{flat.supplied}</span>}
        {flat.pending   >0&&<span style={{fontSize:10,background:"#fee2e2",color:"#991b1b",borderRadius:4,padding:"2px 6px",fontWeight:600}}>P:{flat.pending}</span>}
      </div>
    </div>
  );
}

// ─── FLAT DETAIL MODAL ───────────────────────────────────────────────────────
function FlatModal({flat,onClose}) {
  if (!flat) return null;
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(15,23,42,.55)",zIndex:2000,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"40px 20px",overflowY:"auto"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:900,padding:28,maxHeight:"85vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div>
            <h2 style={{margin:0,fontSize:20,color:"#1e293b"}}>Flat {flat.flatNo} — Floor {flat.floor==="G"?"Ground":flat.floor}</h2>
            <p style={{margin:"4px 0 0",fontSize:13,color:"#64748b"}}>{flat.totalWindows} windows · {flat.totalSqft.toFixed(1)} sqft total</p>
          </div>
          <button onClick={onClose} style={{border:"1px solid #e2e8f0",background:"#fff",borderRadius:8,padding:"6px 14px",cursor:"pointer",fontSize:13,color:"#64748b"}}>Close ✕</button>
        </div>
        <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap"}}>
          {Object.entries(STAGE_CFG).map(([key,cfg])=>{
            const count=flat.windows.filter(w=>w.stage===key).length;
            if(!count) return null;
            return (<div key={key} style={{background:cfg.bg,borderRadius:8,padding:"8px 16px",textAlign:"center",minWidth:70}}>
              <div style={{fontSize:22,fontWeight:700,color:cfg.color}}>{count}</div>
              <div style={{fontSize:11,color:cfg.color,fontWeight:600}}>{cfg.label}</div>
            </div>);
          })}
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead><tr>{["SR","Location","Code","Typology","Series","Sqft","Job Card","Stage"].map(h=><th key={h} style={TH}>{h}</th>)}</tr></thead>
            <tbody>
              {flat.windows.map(w=>{
                const cfg=STAGE_CFG[w.stage]||STAGE_CFG.Pending;
                return (<tr key={w.sr} style={{borderBottom:"1px solid #f1f5f9"}}>
                  <td style={TD}>{w.sr}</td><td style={TD}>{w.location}</td>
                  <td style={TD}><code style={{background:"#f1f5f9",padding:"2px 6px",borderRadius:4,fontSize:11}}>{w.wcode}</code></td>
                  <td style={{...TD,fontSize:11,color:"#475569"}}>{w.typology}</td>
                  <td style={TD}>{w.series}</td>
                  <td style={{...TD,textAlign:"right"}}>{w.sqft.toFixed(2)}</td>
                  <td style={TD}><code style={{fontSize:11}}>{w.jobCard}</code></td>
                  <td style={TD}><span style={{background:cfg.bg,color:cfg.color,fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20}}>{w.stage}</span></td>
                </tr>);
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── EDIT FLAT MODAL ──────────────────────────────────────────────────────────
function EditFlatModal({flat,onClose,onSave}) {
  const [windows,setWindows]=useState(flat?flat.windows.map(w=>({...w})):[]);
  const updateWindow=(idx,field,val)=>setWindows(prev=>prev.map((w,i)=>i===idx?{...w,[field]:val}:w));
  const handleSave=()=>{
    const total=windows.length;
    const handover=windows.filter(w=>w.stage==="Handover").length;
    const installed=windows.filter(w=>w.stage==="Installed").length;
    const supplied=windows.filter(w=>w.stage==="Supplied").length;
    const pending=windows.filter(w=>w.stage==="Pending").length;
    const totalSqft=Math.round(windows.reduce((s,w)=>s+parseFloat(w.sqft||0),0)*100)/100;
    const done=handover+installed+supplied;
    const pct=total>0?Math.round((done/total)*1000)/10:0;
    onSave({...flat,windows,totalWindows:total,handover,installed,supplied,pending,totalSqft,pctComplete:pct});
  };
  if(!flat) return null;
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(15,23,42,.65)",zIndex:3000,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"30px 16px",overflowY:"auto"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:980,padding:28,maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <h2 style={{margin:0,fontSize:18,color:"#1e293b"}}>✏️ Edit — Flat {flat.flatNo}</h2>
          <div style={{display:"flex",gap:10}}>
            <button onClick={handleSave} style={{border:"none",background:"#10b981",color:"#fff",borderRadius:8,padding:"8px 20px",cursor:"pointer",fontWeight:700,fontSize:13}}>💾 Save</button>
            <button onClick={onClose} style={{border:"1px solid #e2e8f0",background:"#fff",borderRadius:8,padding:"8px 14px",cursor:"pointer",fontSize:13,color:"#64748b"}}>Cancel</button>
          </div>
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead><tr>{["SR","Location","Code","Typology","Series","Sqft","Job Card","Stage"].map(h=><th key={h} style={TH}>{h}</th>)}</tr></thead>
            <tbody>
              {windows.map((w,idx)=>{
                const cfg=STAGE_CFG[w.stage]||STAGE_CFG.Pending;
                return (<tr key={w.sr} style={{borderBottom:"1px solid #f1f5f9"}}>
                  <td style={TD}>{w.sr}</td><td style={TD}>{w.location}</td>
                  <td style={TD}><code style={{background:"#f1f5f9",padding:"2px 6px",borderRadius:4,fontSize:11}}>{w.wcode}</code></td>
                  <td style={{...TD,fontSize:11,color:"#475569"}}>{w.typology}</td>
                  <td style={TD}>{w.series}</td>
                  <td style={TD}><input type="number" step="0.01" value={w.sqft} onChange={e=>updateWindow(idx,"sqft",parseFloat(e.target.value)||0)} style={{width:72,border:"1px solid #e2e8f0",borderRadius:6,padding:"4px 8px",fontSize:12}}/></td>
                  <td style={TD}><input value={w.jobCard} onChange={e=>updateWindow(idx,"jobCard",e.target.value)} style={{width:80,border:"1px solid #e2e8f0",borderRadius:6,padding:"4px 8px",fontSize:12}}/></td>
                  <td style={TD}>
                    <select value={w.stage} onChange={e=>updateWindow(idx,"stage",e.target.value)}
                      style={{border:"none",background:cfg.bg,color:cfg.color,fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:20,cursor:"pointer"}}>
                      {Object.keys(STAGE_CFG).map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>);
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── PAYMENT COLS ────────────────────────────────────────────────────────────
const PAYMENT_COLS = [
  {label:"30% Outer Supply",pct:0.30},{label:"40% Glass & Shutter",pct:0.40},
  {label:"10% Frame Install",pct:0.10},{label:"10% Shutter & Glass",pct:0.10},{label:"10% Handover",pct:0.10},
];
const HW_FIELDS=[
  {key:"aluminium",label:"ALUMINIUM"},{key:"aluFinish",label:"ALU FINISH"},{key:"exhaust",label:"EXHAUST"},
  {key:"lock",label:"LOCK"},{key:"mesh",label:"MESH"},{key:"screw",label:"SCREW"},
  {key:"gasket",label:"GASKET"},{key:"sealant",label:"SILICONE SEALANT"},{key:"woolpile",label:"WOOLPILE"},
  {key:"nylonRollers",label:"NYLON ROLLERS"},{key:"hinges",label:"BUTT / FRICTION HINGES"},
];

const calcSqft=(l,h)=>{const v=(parseFloat(l)||0)*(parseFloat(h)||0)/1000000*10.764;return v>0?v.toFixed(3):"—";};
const calcSqmtr=(sqft)=>{const v=(parseFloat(sqft)||0)/10.764;return v>0?v.toFixed(3):"—";};
const calcPayment=(sqmtr,rate,pct)=>{const v=(parseFloat(sqmtr)||0)*(parseFloat(rate)||0)*pct;return v>0?`₹ ${v.toLocaleString("en-IN",{maximumFractionDigits:0})}`:"—";};

const SectionTitle=({children,color="#1d4ed8"})=>(
  <div style={{display:"flex",alignItems:"center",gap:8,margin:"22px 0 10px"}}>
    <div style={{width:3,height:18,background:color,borderRadius:2}}/>
    <h3 style={{margin:0,fontSize:13,fontWeight:700,color:"#1e293b",textTransform:"uppercase",letterSpacing:"0.05em"}}>{children}</h3>
  </div>
);
const AddRowBtn=({onClick,color})=>(
  <button onClick={onClick} style={{marginTop:8,padding:"5px 14px",border:"none",background:color,color:"#fff",borderRadius:6,fontSize:12,fontWeight:600,cursor:"pointer"}}>+ Add Row</button>
);

// ─── WINDOW JOB CARD FORM (single unified form) ──────────────────────────────
function WindowJobCardForm({onSaved}) {
  const [header,setHeader]=useState({jcNo:"",projectName:"",tower:"",date:"",drawingNo:"",scope:""});
  const [winRows,setWinRows]=useState([{location:"",wcode:"",typology:"",series:"",qty:"",sqft:"",rate:""}]);
  const [hw,setHw]=useState({aluminium:"",aluFinish:"",exhaust:"",lock:"",mesh:"",screw:"",gasket:"",sealant:"",woolpile:"",nylonRollers:"",hinges:""});
  const [glassRows,setGlassRows]=useState([{glassType:"",make:"",thickness:"",zoning:"",location:""}]);
  const [specRows,setSpecRows]=useState([{flatNo:"",location:"",wcode:"",typology:"",series:"",length:"",height:"",exhaustLoc:""}]);
  const [saved,setSaved]=useState(false);

  const addWinRow=()=>setWinRows(r=>[...r,{location:"",wcode:"",typology:"",series:"",qty:"",sqft:"",rate:""}]);
  const updWin=(i,f,v)=>setWinRows(r=>r.map((row,idx)=>idx===i?{...row,[f]:v}:row));
  const delWinRow=(i)=>setWinRows(r=>r.filter((_,idx)=>idx!==i));
  const addGlassRow=()=>setGlassRows(r=>[...r,{glassType:"",make:"",thickness:"",zoning:"",location:""}]);
  const updGlass=(i,f,v)=>setGlassRows(r=>r.map((row,idx)=>idx===i?{...row,[f]:v}:row));
  const delGlassRow=(i)=>setGlassRows(r=>r.filter((_,idx)=>idx!==i));
  const addSpecRow=()=>setSpecRows(r=>[...r,{flatNo:"",location:"",wcode:"",typology:"",series:"",length:"",height:"",exhaustLoc:""}]);
  const updSpec=(i,f,v)=>setSpecRows(r=>r.map((row,idx)=>idx===i?{...row,[f]:v}:row));
  const delSpecRow=(i)=>setSpecRows(r=>r.filter((_,idx)=>idx!==i));

  const totalSqft=winRows.reduce((s,r)=>s+(parseFloat(r.sqft)||0),0);
  const totalSqmtr=totalSqft/10.764;
  const totalsByPct=PAYMENT_COLS.map(({pct})=>winRows.reduce((s,r)=>{
    const sqmtr=(parseFloat(r.sqft)||0)/10.764;
    return s+sqmtr*(parseFloat(r.rate)||0)*pct;
  },0));

  const jcObj={header,winRows,hw,glassRows,specRows};

  const handleSave=()=>{
    const key="jc_"+Date.now();
    try { const existing=JSON.parse(sessionStorage.getItem("savedJCs")||"{}"); existing[key]=jcObj; sessionStorage.setItem("savedJCs",JSON.stringify(existing)); } catch{}
    setSaved(true);
    if(onSaved) onSaved(jcObj);
    setTimeout(()=>setSaved(false),2000);
  };

  const handleDownload=()=>exportJobCardToExcel(jcObj);

  return (
    <div style={{fontFamily:"'Inter',sans-serif",maxWidth:1300}}>
      {/* Company Header */}
      <div style={{background:"#1e1b4b",color:"#fff",borderRadius:10,padding:"16px 22px",marginBottom:20,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontWeight:800,fontSize:15,letterSpacing:"0.03em"}}>ONE DEO LEELA FACADE SYSTEMS PVT. LTD.</div>
          <div style={{fontSize:11,color:"#a5b4fc",marginTop:3}}>Authorized Fabricator Engineers For: Domal, Technal & Wicona Systems</div>
        </div>
        <div style={{background:"#a78bfa",color:"#1e1b4b",fontWeight:800,fontSize:13,padding:"6px 18px",borderRadius:6,letterSpacing:"0.08em"}}>JOB CARD — WINDOW</div>
      </div>

      {/* Header Details */}
      <SectionTitle color="#1d4ed8">Header Details</SectionTitle>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:18}}>
        {[["jcNo","Job Card No *","GA/PUNE/T7/198-07"],["projectName","Project Name *","GODREJ AVAMARK LLP TOWER-07"],["tower","Tower / Location","Tower-07"],["drawingNo","Drawing No","DWG-001"]].map(([k,label,ph])=>(
          <div key={k}><label style={{fontSize:11,fontWeight:600,color:"#64748b",display:"block",marginBottom:4}}>{label}</label>
          <input style={inp} placeholder={ph} value={header[k]} onChange={e=>setHeader(h=>({...h,[k]:e.target.value}))}/></div>
        ))}
        <div><label style={{fontSize:11,fontWeight:600,color:"#64748b",display:"block",marginBottom:4}}>Date *</label>
        <input style={inp} type="date" value={header.date} onChange={e=>setHeader(h=>({...h,date:e.target.value}))}/></div>
        <div style={{gridColumn:"span 3"}}>
          <label style={{fontSize:11,fontWeight:600,color:"#64748b",display:"block",marginBottom:4}}>Scope of Work</label>
          <textarea style={{...inp,height:60,resize:"vertical"}} placeholder="Describe scope…" value={header.scope} onChange={e=>setHeader(h=>({...h,scope:e.target.value}))}/>
        </div>
      </div>

      {/* Window Description */}
      <SectionTitle color="#1d4ed8">Window Description</SectionTitle>
      <div style={{overflowX:"auto",border:"1px solid #e2e8f0",borderRadius:10,background:"#fff"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead><tr>
            <th style={TH}>SR</th><th style={TH}>Location</th><th style={TH}>WCode</th><th style={TH}>Typology</th>
            <th style={TH}>Series</th><th style={{...TH,textAlign:"right"}}>Qty</th><th style={{...TH,textAlign:"right"}}>SqFt</th>
            <th style={{...TH,textAlign:"right",color:"#94a3b8"}}>SqMtr ⟵</th><th style={{...TH,textAlign:"right"}}>Rate (₹)</th>
            {PAYMENT_COLS.map(c=><th key={c.label} style={{...TH,textAlign:"right",fontSize:10,color:"#94a3b8"}}>{c.label} ⟵</th>)}
            <th style={TH}></th>
          </tr></thead>
          <tbody>
            {winRows.map((r,i)=>{
              const sqmtr=calcSqmtr(r.sqft);
              return (<tr key={i} style={{background:i%2===0?"#fff":"#fafbfc"}}>
                <td style={{...TD,textAlign:"center",color:"#94a3b8",fontWeight:600}}>{i+1}</td>
                <td style={TD}><input style={inp} value={r.location} onChange={e=>updWin(i,"location",e.target.value)} placeholder="LIVING"/></td>
                <td style={TD}><input style={{...inp,width:70}} value={r.wcode} onChange={e=>updWin(i,"wcode",e.target.value)} placeholder="W1"/></td>
                <td style={TD}><input style={inp} value={r.typology} onChange={e=>updWin(i,"typology",e.target.value)} placeholder="3T+2G+1MESH"/></td>
                <td style={TD}><input style={{...inp,width:70}} value={r.series} onChange={e=>updWin(i,"series",e.target.value)} placeholder="27MM"/></td>
                <td style={TD}><input style={{...inp,width:60,textAlign:"right"}} type="number" value={r.qty} onChange={e=>updWin(i,"qty",e.target.value)} placeholder="0"/></td>
                <td style={TD}><input style={{...inp,width:80,textAlign:"right"}} type="number" step="0.001" value={r.sqft} onChange={e=>updWin(i,"sqft",e.target.value)} placeholder="0.000"/></td>
                <td style={CALC_TD}>{sqmtr}</td>
                <td style={TD}><input style={{...inp,width:80,textAlign:"right"}} type="number" value={r.rate} onChange={e=>updWin(i,"rate",e.target.value)} placeholder="0"/></td>
                {PAYMENT_COLS.map(c=><td key={c.label} style={CALC_TD}>{calcPayment(sqmtr,r.rate,c.pct)}</td>)}
                <td style={TD}><button onClick={()=>delWinRow(i)} style={{border:"none",background:"#fee2e2",color:"#ef4444",borderRadius:4,cursor:"pointer",padding:"3px 8px",fontSize:12}}>✕</button></td>
              </tr>);
            })}
            <tr style={{background:"#f0f9ff",fontWeight:700}}>
              <td colSpan={5} style={{...TD,fontWeight:700,color:"#1d4ed8"}}>TOTAL</td>
              <td style={{...TD,textAlign:"right",fontWeight:700}}></td>
              <td style={{...TD,textAlign:"right",fontWeight:700}}>{totalSqft>0?totalSqft.toFixed(3):"—"}</td>
              <td style={{...CALC_TD,fontWeight:700}}>{totalSqmtr>0?totalSqmtr.toFixed(3):"—"}</td>
              <td style={TD}></td>
              {totalsByPct.map((t,i)=><td key={i} style={{...CALC_TD,fontWeight:700}}>{t>0?`₹ ${t.toLocaleString("en-IN",{maximumFractionDigits:0})}`:"—"}</td>)}
              <td style={TD}></td>
            </tr>
          </tbody>
        </table>
      </div>
      <AddRowBtn onClick={addWinRow} color="#1d4ed8"/>

      {/* Hardware Specs */}
      <SectionTitle color="#7c3aed">Project Hardware Specifications</SectionTitle>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:18}}>
        {HW_FIELDS.map(({key,label})=>(
          <div key={key} style={{display:"flex",alignItems:"center",gap:10,borderBottom:"1px solid #f1f5f9",paddingBottom:8}}>
            <div style={{minWidth:160,fontSize:11,fontWeight:700,color:"#475569",textTransform:"uppercase"}}>{label}</div>
            <input style={{...inp,flex:1}} value={hw[key]} onChange={e=>setHw(h=>({...h,[key]:e.target.value}))} placeholder={`Enter ${label.toLowerCase()}…`}/>
          </div>
        ))}
      </div>

      {/* Glass Specs */}
      <SectionTitle color="#0d9488">Glass Specifications</SectionTitle>
      <div style={{overflowX:"auto",border:"1px solid #e2e8f0",borderRadius:10,background:"#fff"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead><tr>
            <th style={TH}>Glass Type</th><th style={TH}>Make</th><th style={TH}>Thickness</th>
            <th style={TH}>Zoning</th><th style={TH}>Location / Floor</th><th style={TH}></th>
          </tr></thead>
          <tbody>
            {glassRows.map((r,i)=>(
              <tr key={i} style={{background:i%2===0?"#fff":"#fafbfc"}}>
                <td style={TD}><input style={inp} value={r.glassType} onChange={e=>updGlass(i,"glassType",e.target.value)} placeholder="NEUTRAL 34 HS GLASS"/></td>
                <td style={TD}><input style={{...inp,width:120}} value={r.make} onChange={e=>updGlass(i,"make",e.target.value)} placeholder="SAINT GOBAIN"/></td>
                <td style={TD}><input style={{...inp,width:70}} value={r.thickness} onChange={e=>updGlass(i,"thickness",e.target.value)} placeholder="6 MM"/></td>
                <td style={TD}><input style={{...inp,width:100}} value={r.zoning} onChange={e=>updGlass(i,"zoning",e.target.value)} placeholder="Zone A"/></td>
                <td style={TD}><input style={inp} value={r.location} onChange={e=>updGlass(i,"location",e.target.value)} placeholder="Above 13th Floors"/></td>
                <td style={TD}><button onClick={()=>delGlassRow(i)} style={{border:"none",background:"#fee2e2",color:"#ef4444",borderRadius:4,cursor:"pointer",padding:"3px 8px",fontSize:12}}>✕</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AddRowBtn onClick={addGlassRow} color="#0d9488"/>

      {/* Window Specs per Flat */}
      <SectionTitle color="#ea580c">Window Specifications (Per Flat)</SectionTitle>
      <div style={{overflowX:"auto",border:"1px solid #e2e8f0",borderRadius:10,background:"#fff"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead><tr>
            <th style={TH}>SR</th><th style={TH}>Flat No</th><th style={TH}>Location</th><th style={TH}>WCode</th>
            <th style={TH}>Typology</th><th style={TH}>Series</th><th style={{...TH,textAlign:"right"}}>Length (mm)</th>
            <th style={{...TH,textAlign:"right"}}>Height (mm)</th><th style={{...TH,textAlign:"right",color:"#94a3b8"}}>SqFt ⟵</th>
            <th style={TH}>Exhaust Location</th><th style={TH}></th>
          </tr></thead>
          <tbody>
            {specRows.map((r,i)=>{
              const sf=calcSqft(r.length,r.height);
              return (<tr key={i} style={{background:i%2===0?"#fff":"#fafbfc"}}>
                <td style={{...TD,textAlign:"center",color:"#94a3b8",fontWeight:600}}>{i+1}</td>
                <td style={TD}><input style={{...inp,width:70}} value={r.flatNo} onChange={e=>updSpec(i,"flatNo",e.target.value)} placeholder="1403"/></td>
                <td style={TD}><input style={inp} value={r.location} onChange={e=>updSpec(i,"location",e.target.value)} placeholder="Living"/></td>
                <td style={TD}><input style={{...inp,width:70}} value={r.wcode} onChange={e=>updSpec(i,"wcode",e.target.value)} placeholder="W1"/></td>
                <td style={TD}><input style={inp} value={r.typology} onChange={e=>updSpec(i,"typology",e.target.value)} placeholder="3T+2G+1MESH"/></td>
                <td style={TD}><input style={{...inp,width:70}} value={r.series} onChange={e=>updSpec(i,"series",e.target.value)} placeholder="27MM"/></td>
                <td style={TD}><input style={{...inp,width:80,textAlign:"right"}} type="number" value={r.length} onChange={e=>updSpec(i,"length",e.target.value)} placeholder="2065"/></td>
                <td style={TD}><input style={{...inp,width:80,textAlign:"right"}} type="number" value={r.height} onChange={e=>updSpec(i,"height",e.target.value)} placeholder="2210"/></td>
                <td style={CALC_TD}>{sf}</td>
                <td style={TD}><input style={inp} value={r.exhaustLoc} onChange={e=>updSpec(i,"exhaustLoc",e.target.value)} placeholder="Top / Bottom / —"/></td>
                <td style={TD}><button onClick={()=>delSpecRow(i)} style={{border:"none",background:"#fee2e2",color:"#ef4444",borderRadius:4,cursor:"pointer",padding:"3px 8px",fontSize:12}}>✕</button></td>
              </tr>);
            })}
            <tr style={{background:"#fff7ed",fontWeight:700}}>
              <td colSpan={8} style={{...TD,fontWeight:700,color:"#ea580c"}}>TOTAL SqFt</td>
              <td style={{...CALC_TD,fontWeight:700,color:"#ea580c"}}>
                {(()=>{const t=specRows.reduce((s,r)=>{const v=parseFloat(calcSqft(r.length,r.height));return s+(isNaN(v)?0:v);},0);return t>0?t.toFixed(3):"—";})()}
              </td>
              <td colSpan={2} style={TD}></td>
            </tr>
          </tbody>
        </table>
      </div>
      <AddRowBtn onClick={addSpecRow} color="#ea580c"/>
      <p style={{fontSize:11,color:"#94a3b8",marginTop:6}}>⟵ SqFt = Length × Height ÷ 1,000,000 × 10.764 (matching Excel formula)</p>

      {/* Save + Download Buttons */}
      <div style={{marginTop:24,display:"flex",gap:12,alignItems:"center"}}>
        <button onClick={handleSave} style={{padding:"11px 30px",border:"none",borderRadius:8,background:"#10b981",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}}>
          💾 Save Job Card
        </button>
        <button onClick={handleDownload} style={{padding:"11px 24px",border:"1px solid #e2e8f0",borderRadius:8,background:"#fff",color:"#1d4ed8",fontWeight:700,fontSize:14,cursor:"pointer"}}>
          📥 Download Excel
        </button>
        {saved && <span style={{color:"#10b981",fontSize:13,fontWeight:600}}>✅ Saved!</span>}
      </div>
    </div>
  );
}

// ─── SAVED JOB CARDS LIST ─────────────────────────────────────────────────────
function SavedJobCardsList() {
  const [savedJCs,setSavedJCs]=useState({});
  useEffect(()=>{
    try {setSavedJCs(JSON.parse(sessionStorage.getItem("savedJCs")||"{}"));}
    catch{setSavedJCs({});}
  },[]);
  const entries=Object.entries(savedJCs);
  if(!entries.length) return <p style={{color:"#64748b",fontSize:13}}>No saved job cards yet. Create one above.</p>;
  return (
    <div style={{overflowX:"auto",border:"1px solid #e2e8f0",borderRadius:10,background:"#fff",marginTop:12}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
        <thead><tr>
          <th style={TH}>JC No</th><th style={TH}>Project</th><th style={TH}>Tower</th>
          <th style={TH}>Date</th><th style={TH}>Windows</th><th style={TH}>Total SqFt</th><th style={TH}>Action</th>
        </tr></thead>
        <tbody>
          {entries.map(([key,jc])=>{
            const totalSqft=jc.winRows.reduce((s,r)=>s+(parseFloat(r.sqft)||0),0);
            return (<tr key={key} style={{borderBottom:"1px solid #f1f5f9"}}>
              <td style={{...TD,fontWeight:700,color:"#1d4ed8"}}>{jc.header.jcNo||"—"}</td>
              <td style={TD}>{jc.header.projectName||"—"}</td>
              <td style={TD}>{jc.header.tower||"—"}</td>
              <td style={TD}>{jc.header.date||"—"}</td>
              <td style={{...TD,textAlign:"center"}}>{jc.winRows.length}</td>
              <td style={{...TD,textAlign:"right"}}>{totalSqft>0?totalSqft.toFixed(2):"—"}</td>
              <td style={TD}>
                <button onClick={()=>exportJobCardToExcel(jc)}
                  style={{border:"none",background:"#1d4ed8",color:"#fff",borderRadius:6,padding:"5px 12px",cursor:"pointer",fontSize:12,fontWeight:600}}>
                  📥 Download
                </button>
              </td>
            </tr>);
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── MAIN TRACKER PAGE ────────────────────────────────────────────────────────
export default function TrackerPage({DEFAULT_TRACKER_DATA=[]}) {
  const [trackerData,setTrackerData]=useState(()=>{
    try{const s=sessionStorage.getItem("trackerData");return s?JSON.parse(s):DEFAULT_TRACKER_DATA;}
    catch{return DEFAULT_TRACKER_DATA;}
  });
  const [trackerTitle,setTrackerTitle]=useState(()=>sessionStorage.getItem("trackerTitle")||"VTP-Sierra Tower-02");
  const [selFloor,setSelFloor]=useState("all");
  const [stageFilt,setStageFilt]=useState("all");
  const [search,setSearch]=useState("");
  const [jobCardFilt,setJobCardFilt]=useState("all");  // NEW
  const [wcodeFilt,setWcodeFilt]=useState("all");       // NEW
  const [selFlat,setSelFlat]=useState(null);
  const [editFlat,setEditFlat]=useState(null);
  const [showUpload,setShowUpload]=useState(false);
  const [activeTab,setActiveTab]=useState("tracker"); // tracker | jobcards | saved

  const saveData=(data,title)=>{
    setTrackerData(data);
    if(title) setTrackerTitle(title);
    try{sessionStorage.setItem("trackerData",JSON.stringify(data));if(title)sessionStorage.setItem("trackerTitle",title);}catch{}
  };

  const handleUpload=(data,fileName)=>{
    const title=fileName.replace(/\.xlsx?$/i,"").replace(/_/g," ");
    saveData(data,title);
  };

  const handleEditSave=(updatedFlat)=>{
    const newData=trackerData.map(f=>f.flatNo===updatedFlat.flatNo?updatedFlat:f);
    saveData(newData,null);
    setEditFlat(null);
  };

  const floors=useMemo(()=>{
    const f=[...new Set(trackerData.map(d=>d.floor))];
    return f.sort((a,b)=>{if(a==="G") return -1;if(b==="G") return 1;return parseInt(a)-parseInt(b);});
  },[trackerData]);

  // ── Collect all unique job cards and wcodes ──
  const allJobCards=useMemo(()=>{
    const s=new Set();
    trackerData.forEach(f=>f.windows.forEach(w=>{if(w.jobCard) s.add(w.jobCard);}));
    return [...s].sort();
  },[trackerData]);

  const allWcodes=useMemo(()=>{
    const s=new Set();
    trackerData.forEach(f=>f.windows.forEach(w=>{if(w.wcode) s.add(w.wcode);}));
    return [...s].sort();
  },[trackerData]);

  // ── Filter logic — job card + wcode filter at window level, then flat level ──
  const filtered=useMemo(()=>{
    return trackerData.filter(f=>{
      if(selFloor!=="all" && f.floor!==selFloor) return false;
      if(search && !String(f.flatNo).includes(search)) return false;

      // Apply window-level filters: job card, wcode
      let wins=f.windows;
      if(jobCardFilt!=="all") wins=wins.filter(w=>w.jobCard===jobCardFilt);
      if(wcodeFilt!=="all")   wins=wins.filter(w=>w.wcode===wcodeFilt);
      if((jobCardFilt!=="all"||wcodeFilt!=="all") && wins.length===0) return false;

      // Apply flat-level stage filter
      if(stageFilt==="complete"   && f.pctComplete<100) return false;
      if(stageFilt==="incomplete" && f.pctComplete===100) return false;
      if(stageFilt==="pending"    && f.pending===0) return false;
      if(stageFilt==="handover"   && f.handover===0) return false;
      if(stageFilt==="installed"  && f.installed===0) return false;
      return true;
    });
  },[trackerData,selFloor,stageFilt,search,jobCardFilt,wcodeFilt]);

  const totals=useMemo(()=>{
    const t={windows:0,handover:0,installed:0,supplied:0,pending:0,sqft:0};
    trackerData.forEach(f=>{t.windows+=f.totalWindows;t.handover+=f.handover;t.installed+=f.installed;t.supplied+=f.supplied||0;t.pending+=f.pending;t.sqft+=f.totalSqft;});
    return t;
  },[trackerData]);

  const overallPct=Math.round(((totals.handover+totals.installed+totals.supplied)/totals.windows)*100)||0;

  const tabBtn=(tab,label,accent)=>({
    padding:"8px 18px",border:"none",borderRadius:8,cursor:"pointer",fontWeight:600,fontSize:13,
    background:activeTab===tab?accent:"#f1f5f9",color:activeTab===tab?"#fff":"#475569"
  });

  return (
    <div style={{fontFamily:"'Inter',sans-serif",color:"#1e293b"}}>
      {showUpload && <UploadModal onClose={()=>setShowUpload(false)} onUpload={handleUpload}/>}
      {selFlat   && <FlatModal flat={selFlat} onClose={()=>setSelFlat(null)}/>}
      {editFlat  && <EditFlatModal flat={editFlat} onClose={()=>setEditFlat(null)} onSave={handleEditSave}/>}

      {/* ── Tab Bar ── */}
      <div style={{display:"flex",gap:8,marginBottom:18,borderBottom:"2px solid #e2e8f0",paddingBottom:12,flexWrap:"wrap",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",gap:8}}>
          <button style={tabBtn("tracker","📊 Tracker","#1d4ed8")} onClick={()=>setActiveTab("tracker")}>📊 Tracker</button>
          <button style={tabBtn("jobcards","🗂️ New Job Card","#ea580c")} onClick={()=>setActiveTab("jobcards")}>🗂️ New Job Card</button>
          <button style={tabBtn("saved","💾 Saved JCs","#10b981")} onClick={()=>setActiveTab("saved")}>💾 Saved JCs</button>
        </div>
        {activeTab==="tracker" && (
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setShowUpload(true)}
              style={{border:"none",background:"#1d4ed8",color:"#fff",borderRadius:8,padding:"7px 14px",cursor:"pointer",fontWeight:600,fontSize:12}}>
              📤 Upload Excel
            </button>
            <button onClick={()=>exportTrackerToExcel(trackerData,trackerTitle)}
              style={{border:"none",background:"#10b981",color:"#fff",borderRadius:8,padding:"7px 14px",cursor:"pointer",fontWeight:600,fontSize:12}}>
              📥 Download Excel
            </button>
          </div>
        )}
      </div>

      {/* ═══ TRACKER TAB ═══ */}
      {activeTab==="tracker" && (<>
        {/* KPI Cards */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10,marginBottom:16}}>
          {[
            {label:"Total Windows",value:totals.windows.toLocaleString(),color:"#1d4ed8"},
            {label:"Handover",value:totals.handover.toLocaleString(),color:"#10b981"},
            {label:"Installed",value:totals.installed.toLocaleString(),color:"#3b82f6"},
            {label:"Supplied",value:totals.supplied.toLocaleString(),color:"#f59e0b"},
            {label:"Pending",value:totals.pending.toLocaleString(),color:"#ef4444"},
            {label:"Total Area",value:totals.sqft.toFixed(0)+" sqft",color:"#7c3aed"},
            {label:"Overall",value:overallPct+"%",color:pctColor(overallPct)},
          ].map(s=>(
            <div key={s.label} style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:"10px 14px",borderLeft:`3px solid ${s.color}`}}>
              <div style={{fontSize:10,color:"#64748b",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4}}>{s.label}</div>
              <div style={{fontSize:20,fontWeight:700,color:s.color}}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div style={{display:"flex",gap:16,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
          <span style={{fontSize:11,color:"#64748b",fontWeight:600}}>Legend:</span>
          {Object.values(STAGE_CFG).map(cfg=>(
            <span key={cfg.label} style={{display:"flex",alignItems:"center",gap:5,fontSize:12}}>
              <span style={{width:9,height:9,borderRadius:"50%",background:cfg.dot,display:"inline-block"}}/>
              <span style={{color:"#475569"}}>{cfg.label}</span>
            </span>
          ))}
        </div>

        {/* Filters Row */}
        <div style={{display:"flex",gap:8,marginBottom:18,flexWrap:"wrap",alignItems:"center"}}>
          <input type="text" placeholder="Search flat no…" value={search} onChange={e=>setSearch(e.target.value)}
            style={{border:"1px solid #e2e8f0",borderRadius:8,padding:"7px 12px",fontSize:12,outline:"none",width:130}}/>

          <select value={selFloor} onChange={e=>setSelFloor(e.target.value)}
            style={{border:"1px solid #e2e8f0",borderRadius:8,padding:"7px 10px",fontSize:12,outline:"none",cursor:"pointer"}}>
            <option value="all">All Floors</option>
            {floors.map(f=><option key={f} value={f}>{f==="G"?"Ground / Common":`Floor ${f}`}</option>)}
          </select>

          <select value={stageFilt} onChange={e=>setStageFilt(e.target.value)}
            style={{border:"1px solid #e2e8f0",borderRadius:8,padding:"7px 10px",fontSize:12,outline:"none",cursor:"pointer"}}>
            <option value="all">All Status</option>
            <option value="complete">100% Complete</option>
            <option value="incomplete">Incomplete</option>
            <option value="pending">Has Pending</option>
            <option value="handover">Has Handover</option>
            <option value="installed">Has Installed</option>
          </select>

          {/* NEW: Job Card Filter */}
          <select value={jobCardFilt} onChange={e=>setJobCardFilt(e.target.value)}
            style={{border:"1px solid #e2e8f0",borderRadius:8,padding:"7px 10px",fontSize:12,outline:"none",cursor:"pointer",background:jobCardFilt!=="all"?"#dbeafe":"#fff",color:jobCardFilt!=="all"?"#1d4ed8":"inherit"}}>
            <option value="all">All Job Cards</option>
            {allJobCards.map(jc=><option key={jc} value={jc}>{jc}</option>)}
          </select>

          {/* NEW: WCode Filter */}
          <select value={wcodeFilt} onChange={e=>setWcodeFilt(e.target.value)}
            style={{border:"1px solid #e2e8f0",borderRadius:8,padding:"7px 10px",fontSize:12,outline:"none",cursor:"pointer",background:wcodeFilt!=="all"?"#fef3c7":"#fff",color:wcodeFilt!=="all"?"#92400e":"inherit"}}>
            <option value="all">All WCodes</option>
            {allWcodes.map(w=><option key={w} value={w}>{w}</option>)}
          </select>

          {(jobCardFilt!=="all"||wcodeFilt!=="all")&&(
            <button onClick={()=>{setJobCardFilt("all");setWcodeFilt("all");}}
              style={{border:"1px solid #e2e8f0",background:"#fff",borderRadius:6,padding:"6px 12px",cursor:"pointer",fontSize:12,color:"#ef4444",fontWeight:600}}>
              ✕ Clear Filters
            </button>
          )}

          <span style={{fontSize:12,color:"#94a3b8",marginLeft:"auto"}}>{filtered.length} flats</span>
        </div>

        {/* Floor sections */}
        {selFloor==="all"?(
          floors.map(floor=>{
            const fFlats=filtered.filter(f=>f.floor===floor);
            if(!fFlats.length) return null;
            const fTotal=fFlats.reduce((s,f)=>s+f.totalWindows,0);
            const fDone =fFlats.reduce((s,f)=>s+f.handover+f.installed+(f.supplied||0),0);
            const fPct  =Math.round((fDone/fTotal)*100)||0;
            return (<div key={floor} style={{marginBottom:24}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                <h3 style={{margin:0,fontSize:14,fontWeight:700,color:"#1e293b",borderLeft:"3px solid #1d4ed8",paddingLeft:10}}>
                  {floor==="G"?"Ground / Common Area":`Floor ${floor}`}
                </h3>
                <span style={{fontSize:12,color:"#64748b"}}>{fFlats.length} flats · {fTotal} windows</span>
                <span style={{marginLeft:"auto",fontSize:13,fontWeight:700,color:pctColor(fPct)}}>{fPct}%</span>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(168px,1fr))",gap:10}}>
                {fFlats.map(f=><FlatCard key={f.flatNo} flat={f} onClick={setSelFlat} onEdit={setEditFlat}/>)}
              </div>
            </div>);
          })
        ):(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(168px,1fr))",gap:10}}>
            {filtered.map(f=><FlatCard key={f.flatNo} flat={f} onClick={setSelFlat} onEdit={setEditFlat}/>)}
          </div>
        )}

        {/* Filtered windows table when job card or wcode filter active */}
        {(jobCardFilt!=="all"||wcodeFilt!=="all")&&(
          <div style={{marginTop:28}}>
            <h3 style={{fontSize:14,fontWeight:700,color:"#1e293b",borderLeft:"3px solid #f59e0b",paddingLeft:10,margin:"0 0 12px"}}>
              Filtered Window Details
              {jobCardFilt!=="all"&&<span style={{marginLeft:8,fontSize:12,background:"#dbeafe",color:"#1d4ed8",padding:"2px 8px",borderRadius:4}}>{jobCardFilt}</span>}
              {wcodeFilt!=="all"&&<span style={{marginLeft:6,fontSize:12,background:"#fef3c7",color:"#92400e",padding:"2px 8px",borderRadius:4}}>{wcodeFilt}</span>}
            </h3>
            <div style={{overflowX:"auto",border:"1px solid #e2e8f0",borderRadius:10,background:"#fff"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead><tr>
                  {["SR","Flat","Floor","Location","WCode","Typology","Series","SqFt","Job Card","Stage"].map(h=>
                    <th key={h} style={TH}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {trackerData.flatMap(f=>{
                    let wins=f.windows;
                    if(jobCardFilt!=="all") wins=wins.filter(w=>w.jobCard===jobCardFilt);
                    if(wcodeFilt!=="all")   wins=wins.filter(w=>w.wcode===wcodeFilt);
                    return wins.map(w=>{
                      const cfg=STAGE_CFG[w.stage]||STAGE_CFG.Pending;
                      return (<tr key={w.sr} style={{borderBottom:"1px solid #f1f5f9"}}>
                        <td style={TD}>{w.sr}</td>
                        <td style={{...TD,fontWeight:700}}>{f.flatNo}</td>
                        <td style={TD}>{f.floor==="G"?"G":f.floor}</td>
                        <td style={TD}>{w.location}</td>
                        <td style={TD}><code style={{background:"#fef3c7",color:"#92400e",padding:"2px 6px",borderRadius:4,fontSize:11}}>{w.wcode}</code></td>
                        <td style={{...TD,fontSize:11,color:"#475569"}}>{w.typology}</td>
                        <td style={TD}>{w.series}</td>
                        <td style={{...TD,textAlign:"right"}}>{w.sqft.toFixed(2)}</td>
                        <td style={TD}><code style={{fontSize:11,background:"#dbeafe",color:"#1d4ed8",padding:"2px 6px",borderRadius:4}}>{w.jobCard}</code></td>
                        <td style={TD}><span style={{background:cfg.bg,color:cfg.color,fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20}}>{w.stage}</span></td>
                      </tr>);
                    });
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </>)}

      {/* ═══ JOB CARDS TAB ═══ */}
      {activeTab==="jobcards" && (
        <div>
          <h3 style={{margin:"0 0 16px",fontSize:16,color:"#1e293b",borderLeft:"3px solid #ea580c",paddingLeft:10}}>🗂️ New Window Job Card</h3>
          <p style={{color:"#64748b",fontSize:13,marginBottom:20}}>Fill in the details below. Hardware, Glass, and Window specifications are all in one form. Save to session and download as Excel anytime.</p>
          <WindowJobCardForm onSaved={()=>{}}/>
        </div>
      )}

      {/* ═══ SAVED JCs TAB ═══ */}
      {activeTab==="saved" && (
        <div>
          <h3 style={{margin:"0 0 8px",fontSize:16,color:"#1e293b",borderLeft:"3px solid #10b981",paddingLeft:10}}>💾 Saved Job Cards</h3>
          <p style={{color:"#64748b",fontSize:13,marginBottom:16}}>Job cards saved this session. Click Download to export any as Excel.</p>
          <SavedJobCardsList/>
        </div>
      )}
    </div>
  );
}