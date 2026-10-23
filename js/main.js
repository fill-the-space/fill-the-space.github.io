/* ---------- Berechnen, Anzeigen, Speichern ---------- */
let current=null, pending=false;
function schedule(){ if(pending) return; pending=true; requestAnimationFrame(()=>{ pending=false; update(); }); }
function update(){
  const v=state.v[state.type];
  let sc=null;
  if(state.type==="individuell"){
    sc=currentSeg(v);
    if(!sc||!sc.seg){ drawPhoto(sc,null); const w=$("warn"); w.hidden=false; w.textContent="Auf dem Foto wurde kein Bauteil erkannt. Erkennungsschwelle senken oder ein Foto mit hellerem, ruhigem Hintergrund wählen."; return; }
  }
  const model=build(state.type,v,null,sc&&sc.seg);
  if(sc){ if(sc.seg.touches) model.warn.unshift("Der Umriss berührt den Bildrand. Das Bauteil sollte ganz auf dem Foto sein.");
    drawPhoto(sc,model.info); $("detect").textContent=model.info.text;
    if(model.mode!==effMode){ effMode=model.mode; renderFields(); } }
  // Nur Schraubenanzahlen anbieten, die auf die Rückwand passen
  if(model.screw){ const av=model.screw.avail, changed=av.join()!==screwAvail.join();
    screwAvail=av; if(v.holes&&model.screw.n&&v.sn!==model.screw.n){ v.sn=model.screw.n; renderFields(); } else if(changed) renderFields(); }
  const b=model.bb, vol=(b[1]-b[0]+4)*(b[3]-b[2]+4)*(b[5]-b[4]+4);
  const wall=v.t||v.P||3;
  const h=Math.max(0.8,Math.min(Math.cbrt(vol/260000),wall*0.7));
  const mesh=polygonize(model.f,b,h), st=meshStats(mesh);
  const fmt=x=>x.toLocaleString("de-DE",{maximumFractionDigits:0});
  $("outDim").textContent=model.dims.map(fmt).join("×");
  $("outVol").textContent=`${(st.vol/1000).toLocaleString("de-DE",{maximumFractionDigits:1})} cm³`;
  $("outG").textContent=`≈ ${Math.round(st.vol/1000*1.24)} g`;
  $("outDir").textContent=model.dir;
  const w=$("warn"); w.hidden=!model.warn.length; w.textContent=model.warn.join(" ");
  current={model,area:st.area,h};
  show(model,mesh);
  try{localStorage.setItem(STORE,JSON.stringify(state));}catch(e){}
}

function slug(){ return HALTERUNGEN[state.type].name.toLowerCase().replace(/ä/g,"ae").replace(/ö/g,"oe").replace(/ü/g,"ue").replace(/ß/g,"ss").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""); }
// Innerhalb von Claude speichert die Vorschau über claude.use, sonst normaler Browser-Download
let dlReady=(async()=>{ try{ return window.claude?.use ? await claude.use("downloads") : null; }catch(e){ return null; } })();
$("dl").addEventListener("click",async()=>{
  const st=$("status"), btn=$("dl"); btn.disabled=true; st.textContent="Feines Netz wird berechnet …";
  await new Promise(r=>setTimeout(r,30));
  try{
    const d=await dlReady;
    const m=current.model, hE=Math.min(current.h, Math.max(0.45, Math.sqrt(2*current.area/250000)));
    const fine=polygonize(m.f,m.bb,hE);
    st.textContent="Datei wird verkleinert …"; await new Promise(r=>setTimeout(r,30));
    const mesh=simplifyMesh(fine), name="halterung-"+slug()+".stl", file=new Blob([stl(mesh)],{type:"model/stl"});
    if(d) await d.save({filename:name,data:file}); else saveFile(name,file);
    st.textContent=`Gespeichert: ${name} (${(file.size/1e3).toLocaleString("de-DE",{maximumFractionDigits:0})} kB, ${(mesh.idx.length/3).toLocaleString("de-DE")} Dreiecke)`;
  }catch(e){
    st.textContent = e&&e.code==="declined" ? "Speichern abgebrochen." : e&&e.code==="rate_limited" ? "Bitte kurz warten und erneut versuchen." : "Speichern ist hier nicht möglich.";
  }finally{ btn.disabled=false; }
});
initGL(); renderAll();
