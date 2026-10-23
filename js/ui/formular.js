/* ---------- Formular ---------- */
let effMode="haengen";
let lastSilH=0;

function applyPreset(id){
  const pr=PRESETS.find(p=>p.id===id); state.preset=id;
  if(id==="foto"){ $("file").click(); const back=PRESETS.find(p=>p.id===photoPresetBefore()); if(back) state.preset=back.id; return; }
  if(pr&&!pr.custom){ state.type=pr.type; state.ghost=pr.ghost||null; state.v[pr.type]={...DEFAULTS[pr.type],...pr.p}; if(pr.sample) setPhotoSample(pr.sample); } else state.ghost=null;
}
function photoPresetBefore(){ return photo.id.startsWith("sample-") ? (photo.id==="sample-curl"?"lockenstab":"klebepistole") : null; }
function renderPresets(){
  const sel=$("presetSel"); sel.innerHTML=""; let last=null, grp=null;
  PRESETS.filter(p=>p.type===state.type).forEach(pr=>{
    if(pr.g!==last){ last=pr.g; grp=document.createElement("optgroup"); grp.label=pr.g; sel.appendChild(grp); }
    const o=document.createElement("option"); o.value=pr.id; o.textContent=pr.name; grp.appendChild(o); });
  const own=state.type==="individuell"?["foto","Eigenes Foto …"]:["eigene","Eigene Maße"];
  const o=document.createElement("option"); o.value=own[0]; o.textContent=own[1]; sel.appendChild(o);
  sel.value=[...sel.options].some(x=>x.value===state.preset)?state.preset:own[0];
  $("presetHint").textContent = state.type==="individuell" ? "Beispielfotos sind gezeichnete Umrisse zum Ausprobieren. Mit eigenem Foto wird es passgenau." : "Maße der Vorlagen sind Richtwerte. Vor dem Druck am echten Gerät nachmessen.";
}
$("presetSel").addEventListener("change",e=>{ applyPreset(e.target.value); renderPresets(); renderFields(); schedule(); try{localStorage.setItem("halterung-v2",JSON.stringify(state));}catch(_){} });
function renderTypes(){
  const box=$("types"); box.innerHTML="";
  for(const k in HALTERUNGEN){ const b=document.createElement("button"); b.type="button"; b.id="ty-"+k; b.textContent=HALTERUNGEN[k].name; b.setAttribute("aria-pressed",String(state.type===k));
    b.addEventListener("click",()=>{ if(state.type===k) return; const first=PRESETS.find(p=>p.type===k); state.type=k; if(first) applyPreset(first.id); else { state.preset="eigene"; state.ghost=null; } renderAll(); }); box.appendChild(b); }
  $("typeHint").textContent=HALTERUNGEN[state.type].hint;
}
function custom(){ if(state.type==="individuell") return; state.preset="eigene"; state.ghost=null; $("presetSel").value="eigene"; }
function renderFields(){
  const box=$("fields"), v=state.v[state.type]; box.innerHTML="";
  $("konturPanel").hidden = state.type!=="individuell";
  if(state.type==="individuell"&&!photo.canvas){ const pr=PRESETS.find(p=>p.id===state.preset&&p.sample)||PRESETS.find(p=>p.id==="klebepistole"); setPhotoSample(pr.sample); }
  const mk=(f)=>{
    if(f.show&&!f.show(v)) return null;
    const id=`f-${state.type}-${f.k}`;
    if(f.c==="seg"){ const w=document.createElement("div"); w.style.cssText="display:flex;flex-direction:column;gap:4px";
      const l=document.createElement("span"); l.className="seg-label"; l.textContent=f.l; const s=document.createElement("div"); s.className="seg"; s.setAttribute("role","group"); s.setAttribute("aria-label",f.l);
      f.o.forEach(([val,lab])=>{ const b=document.createElement("button"); b.type="button"; b.id=id+"-"+val; b.textContent=lab; b.setAttribute("aria-pressed",String(v[f.k]===val));
        b.addEventListener("click",()=>{ v[f.k]=val; if(f.k==="shape"&&val==="rund"&&state.preset==="eigene"){} custom(); renderFields(); schedule(); }); s.appendChild(b); });
      w.append(l,s); return w; }
    if(f.c==="check"){ const l=document.createElement("label"); l.className="check"; const i=document.createElement("input"); i.type="checkbox"; i.id=id; i.checked=!!v[f.k];
      i.addEventListener("change",()=>{ v[f.k]=i.checked; custom(); if(HALTERUNGEN[state.type].fields.some(x=>x.show)) renderFields(); schedule(); }); l.append(i,document.createTextNode(" "+f.l)); return l; }
    if(f.c==="range"){ const w=document.createElement("div"); w.className="slider"; const sp=document.createElement("span"); sp.textContent=f.l; const o=document.createElement("output"); o.id=id+"-out";
      const i=document.createElement("input"); i.type="range"; i.id=id; i.min=f.min; i.max=f.max; i.step=f.step; i.value=v[f.k];
      const upd=()=>{ o.textContent = f.fmt ? f.fmt(+v[f.k],v) : `${(+v[f.k]).toLocaleString("de-DE",{maximumFractionDigits:1})} ${f.u}`; };
      i.addEventListener("input",()=>{ v[f.k]=parseFloat(i.value); upd(); custom(); schedule(); }); upd(); w.append(sp,o,i); return w; }
  };
  for(const f of HALTERUNGEN[state.type].fields){
    if(f.row){ const r=document.createElement("div"); r.className="nums";
      f.row.forEach(c=>{ if(c.show&&!c.show(v)) return; const l=document.createElement("label"); l.className="num"; l.textContent=c.lab?c.lab(v):c.l;
        const i=document.createElement("input"); i.type="number"; i.id=`f-${state.type}-${c.k}`; i.min=c.min; i.max=c.max; i.step=c.step||0.5; i.value=v[c.k]; i.inputMode="decimal";
        i.addEventListener("input",()=>{ const x=parseFloat(i.value); if(isFinite(x)&&x>0){ v[c.k]=Math.min(c.max,Math.max(c.min,x)); custom(); schedule(); } });
        l.appendChild(i); r.appendChild(l); });
      box.appendChild(r); continue; }
    const el=mk(f); if(el) box.appendChild(el);
  }
}
function renderAll(){ renderPresets(); renderTypes(); renderFields(); schedule(); }
