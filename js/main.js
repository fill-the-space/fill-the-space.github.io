/* ---------- Berechnen, Anzeigen, Speichern ---------- */
let current=null, pending=false;
function schedule(){ if(pending) return; pending=true; requestAnimationFrame(()=>{ pending=false; update(); }); }
function update(){
  const v=state.v[state.type];
  // follow: Ein Wert, der noch auf einem anderen Maß steht (Schale = Bauteilhöhe, Hakenstärke = Wandstärke), wandert mit ihm mit,
  // bis man ihn selbst ändert. "@wand" ist das Wandmaß der jeweiligen Halterungsart.
  const T=HALTERUNGEN[state.type]; let moved=false;
  // Befestigung steht durch die Teile an der Wand fest
  const fest=bereichVon(state.type)==="halterung"&&befestigungFest(); if(fest&&v.mount&&v.mount!==fest){ v.mount=fest; moved=true; }
  for(const f of T.fields.flatMap(f=>f.row||[f])){
    const fk=f.follow==="@wand"?T.wall:f.follow;
    // Nur das betroffene Feld aktualisieren, nicht das ganze Formular, sonst bricht das Ziehen am Regler ab
    if(fk){ const old=v["_"+fk]; if(old!=null&&v[f.k]===old&&v[fk]!==old){ v[f.k]=v[fk]; const el=$(`f-${state.type}-${f.k}`); if(el&&f.c!=="range") el.value=v[f.k]; else moved=true; } v["_"+fk]=v[fk]; }
    // Regler mit Grenzen, die von anderen Maßen abhängen
    if(f.c==="range"&&typeof f.min==="function") v[f.k]=Math.min(f.max(v),Math.max(f.min(v),v[f.k]));
  }
  if(moved||rangeLimits(v)!==shownLimits) renderFields();
  let sc=null;
  if(state.type==="individuell"){
    sc=currentSeg(v);
    if(!sc||!sc.seg){ drawPhoto(sc,null); const w=$("warn"); w.hidden=false; w.textContent="Auf dem Foto wurde kein Bauteil erkannt. Erkennungsschwelle senken oder ein Foto mit hellerem, ruhigem Hintergrund wählen."; return; }
  }
  // Anordnung: Ist ein Teil ausgewählt, übernimmt es die Maße aus dem Formular
  // (in der Anordnung das ausgewählte Teil, auf dem Handy auch das Teil, das gerade über „Teil bearbeiten“ geändert wird)
  const P=state.plan[state.page], selId=P.on?P.sel:P.edit, sel=(P.on||P.edit!=null)&&P.items.find(i=>i.id===selId);
  if(sel&&sel.type===state.type) sel.v=clone(v);
  const model=build(state.type,v,null,sc&&sc.seg);
  if(sc){ if(sc.seg.touches) model.warn.unshift("Der Umriss berührt den Bildrand. Das Bauteil sollte ganz auf dem Foto sein.");
    drawPhoto(sc,model.info); $("detect").textContent=model.info.text;
    if(model.mode!==effMode){ effMode=model.mode; renderFields(); } }
  // Nur Schraubenanzahlen anbieten, die auf die Rückwand passen
  if(model.screw){ const av=model.screw.avail, changed=av.join()!==screwAvail.join();
    screwAvail=av; if(v.holes&&model.screw.n&&v.sn!==model.screw.n){ v.sn=model.screw.n; renderFields(); } else if(changed) renderFields(); }
  const rec=recommend(state.type,v,model); $("outRec").textContent=rec.text; $("outRecInfo").textContent=rec.detail;
  showAlerts(model.alerts||[]);
  const b=model.bb, vol=(b[1]-b[0]+4)*(b[3]-b[2]+4)*(b[5]-b[4]+4);
  const wall=model.minWand||v.t||v.P||3;
  const h=Math.max(Math.min(0.8,wall*0.6),Math.min(Math.cbrt(vol/260000),wall*0.7));
  // Teile (z. B. Box und Deckel) einzeln rechnen, sonst wird das Raster durch den Platz dazwischen unnötig grob
  const teile=model.teile||[{f:model.f,bb:b}];
  const mesh=teile.map(t=>polygonize(t.f,t.bb,h)).reduce((a,m)=>a?netzeVerbinden(a,m):m,null), st=meshStats(mesh);
  // Beschriftung: eigener Körper, feiner gerechnet, weil die Buchstaben klein sind
  const tx=model.text||model.textPreview, textMesh=tx?polygonize(tx.f,tx.bb,Math.max(0.12,Math.min(0.3,tx.th/30))):null;
  const fmt=x=>x.toLocaleString("de-DE",{maximumFractionDigits:0});
  $("outDim").textContent=model.dims.map(fmt).join("×");
  const use=filamentUse(st.vol,st.area,rec); $("outG").textContent=`≈ ${Math.round(use.g)} g`;
  $("outGInfo").textContent=`${use.m.toLocaleString("de-DE",{maximumFractionDigits:1})} m ${rec.mat.kurz}`;
  $("outDir").textContent=model.dir;
  const w=$("warn"); w.hidden=!model.warn.length; w.textContent=model.warn.join(" ");
  current={model,area:st.area,h};
  renderFormat();
  if(P.on){ if(!model.plan&&!planCache.has(planKey(state.type,v))) planCache.set(planKey(state.type,v),{bb:model.bb,mesh,mount:model.mount,textMesh}); drawPlan(); }
  else show(model,mesh,textMesh);
  planLabels();
  try{localStorage.setItem(STORE,JSON.stringify(state));}catch(e){}
}

/* Warnhinweise: kurz und farbig, Einzelheiten erst nach Antippen. Geöffnete bleiben beim Neuberechnen offen. */
function showAlerts(list){
  document.querySelector('#tools [data-w="speichern"]').classList.toggle("dot",list.length>0);
  const box=$("alerts"), open=new Set([...box.querySelectorAll("details[open]")].map(d=>d.dataset.id));
  box.innerHTML="";
  for(const a of list){ const d=document.createElement("details"); d.className="alert"; d.dataset.id=a.id||a.kurz; const s=document.createElement("summary"); s.textContent=a.kurz;
    const p=document.createElement("p"); p.textContent=a.lang; d.append(s,p); if(open.has(d.dataset.id)) d.open=true; box.appendChild(d); }
}

function slug(){ return HALTERUNGEN[state.type].name.replace(/\u00ad/g,"").toLowerCase().replace(/ä/g,"ae").replace(/ö/g,"oe").replace(/ü/g,"ue").replace(/ß/g,"ss").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""); }
// Innerhalb von Claude speichert die Vorschau über claude.use, sonst normaler Browser-Download
let dlReady=(async()=>{ try{ return window.claude?.use ? await claude.use("downloads") : null; }catch(e){ return null; } })();
$("dl").addEventListener("click",async()=>{
  const st=$("status"), btn=$("dl"); btn.disabled=true; st.textContent="Feines Netz wird berechnet …";
  await new Promise(r=>setTimeout(r,30));
  try{
    const d=await dlReady;
    // Fein rechnen (bis etwa 400.000 Dreiecke), Punkte auf die echte Oberfläche schieben, dann ebene Flächen zusammenfassen
    // Dünne Wände: Raster höchstens 45 % der dünnsten Wand, damit keine Löcher entstehen (aber nicht feiner als der Speicher erlaubt)
    const m=current.model, teile=m.teile||[{f:m.f,bb:m.bb}];
    const hE0=Math.min(current.h, Math.max(0.4, Math.sqrt(2*current.area/400000)), m.schnitt?Math.max(0.4,m.schnitt/16):1e9, m.minWand?Math.max(0.3,m.minWand*0.45):1e9);
    const netze=teile.map(t=>{ const b=t.bb, v=(b[1]-b[0]+2)*(b[3]-b[2]+2)*(b[5]-b[4]+2), h=Math.max(hE0,Math.cbrt(v/30e6)); return snapToSurface(polygonize(t.f,b,h),t.f); });
    st.textContent="Datei wird verkleinert …"; await new Promise(r=>setTimeout(r,30));
    const mesh=netze.map(n=>simplifyMesh(n,0.01)).reduce((a,n)=>a?netzeVerbinden(a,n):n,null);
    // Beschriftung fein für sich; STL: in dieselbe Datei, 3MF: als eigenes Teil mit eigener Farbe
    const text=m.text?simplifyMesh(snapToSurface(polygonize(m.text.f,m.text.bb,Math.max(0.08,Math.min(0.15,m.text.th/50))),m.text.f),0.005):null;
    const fmt=dateiFormat(), name=SEITEN[state.page].datei+"-"+slug()+"."+fmt;
    const file = fmt==="3mf"
      ? dreiMF([{name:state.page==="box"?"Box":"Halterung",mesh,color:state.farben.teil.toUpperCase()},...(text?[{name:"Beschriftung",mesh:text,color:state.farben.text.toUpperCase()}]:[])])
      : new Blob([stl(text?netzeVerbinden(mesh,text):mesh)],{type:"model/stl"});
    if(d) await d.save({filename:name,data:file}); else saveFile(name,file);
    const nTri=(mesh.idx.length+(text?text.idx.length:0))/3;
    st.textContent=`Gespeichert: ${name} (${(file.size/1e3).toLocaleString("de-DE",{maximumFractionDigits:0})} kB, ${nTri.toLocaleString("de-DE")} Dreiecke${fmt==="3mf"&&text?", Bauteil und Beschriftung als zwei Teile":""})`;
  }catch(e){
    st.textContent = e&&e.code==="declined" ? "Speichern abgebrochen." : e&&e.code==="rate_limited" ? "Bitte kurz warten und erneut versuchen." : "Speichern ist hier nicht möglich.";
  }finally{ btn.disabled=false; }
});
// Dateiformat: STL (eine Farbe) oder 3MF (Beschriftung als eigenes Teil für eine zweite Farbe)
// Die Auswahl erscheint erst, wenn das Bauteil eine Beschriftung hat; sonst wird immer STL gespeichert
const dateiFormat=()=>current&&current.model.text?state.format:"stl";
function renderFormat(){ $("fmt").hidden=!(current&&current.model.text); $("farben").hidden=dateiFormat()!=="3mf";
  for(const b of document.querySelectorAll("#fmt button")) b.setAttribute("aria-pressed",String(b.dataset.fmt===dateiFormat()));
  $("dl").textContent=dateiFormat().toUpperCase()+" speichern"; }
for(const b of document.querySelectorAll("#fmt button")) b.addEventListener("click",()=>{ state.format=b.dataset.fmt; renderFormat(); schedule(); try{localStorage.setItem(STORE,JSON.stringify(state));}catch(e){} });
// Farben für den zweifarbigen Druck (3MF): stehen in der Datei und färben die 3D-Vorschau
for(const [id,k] of [["farbeTeil","teil"],["farbeText","text"]]){ const i=$(id); i.value=state.farben[k];
  i.addEventListener("input",()=>{ state.farben[k]=i.value; schedule(); }); }
renderFormat();
// Druckbett gilt für alle Halterungsarten und wird mit gemerkt
for(const k of ["x","y","z"]){ const i=$("bed"+k.toUpperCase()); i.value=state.bed[k];
  i.addEventListener("input",()=>{ const x=parseFloat(i.value); if(isFinite(x)&&x>=50){ state.bed[k]=Math.min(1000,x); schedule(); } }); }

// Zwischen den Seiten Halterungen und Boxen wechseln; jede Seite merkt sich ihre zuletzt gewählte Art
for(const b of document.querySelectorAll("#pages button")) b.addEventListener("click",()=>{ const p=b.dataset.page; if(p===state.page) return;
  state.last[state.page]=state.type; state.page=p; state.type=state.last[p]; planCamera(); renderAll(); });

planCamera(); initGL(); renderAll();
// Web-App: Offline-Speicher anmelden (nur auf der veröffentlichten Seite über https; lokal beim Testen nicht, sonst kämen alte Dateien aus dem Speicher)
if("serviceWorker" in navigator&&location.protocol==="https:") navigator.serviceWorker.register("sw.js").catch(()=>{});
