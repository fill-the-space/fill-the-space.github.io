/* ---------- Formular ---------- */
let effMode="haengen";

function renderTypes(){
  const box=$("types"); box.innerHTML="";
  // Seitenumschalter oben und Überschrift der Auswahl passend zur Seite
  for(const b of document.querySelectorAll("#pages button")) b.setAttribute("aria-pressed",String(b.dataset.page===state.page));
  $("typesLegend").textContent=SEITEN[state.page].art; box.setAttribute("aria-label",SEITEN[state.page].art);
  $("legendModel").textContent=state.page==="box"?"Box":"Halterung"; $("legendGhost").hidden=state.page==="box";
  for(const k in HALTERUNGEN){ if(bereichVon(k)!==state.page) continue; const b=document.createElement("button"); b.type="button"; b.id="ty-"+k; b.textContent=HALTERUNGEN[k].name; b.setAttribute("aria-pressed",String(state.type===k));
    b.addEventListener("click",()=>{ if(state.type===k) return; state.type=k; state.plan[state.page].sel=null; renderAll(); }); box.appendChild(b); }
  $("typeHint").textContent=HALTERUNGEN[state.type].hint;
}
// Grenzen der Regler, die von anderen Maßen abhängen; ändern sie sich, wird das Formular neu gezeichnet
let shownLimits="";
function rangeLimits(v){ return HALTERUNGEN[state.type].fields.filter(f=>f.c==="range"&&typeof f.min==="function").map(f=>f.min(v)+"-"+f.max(v)).join(","); }
function renderFields(){
  const box=$("fields"), v=state.v[state.type]; shownLimits=rangeLimits(v); const focus=document.activeElement&&box.contains(document.activeElement)?document.activeElement.id:null; box.innerHTML="";
  $("konturPanel").hidden = state.type!=="individuell";
  if(state.type==="individuell"&&!photo.canvas) setPhotoSample("gun");
  const mk=(f)=>{
    if(f.show&&!f.show(v)) return null;
    const id=`f-${state.type}-${f.k}`;
    if(f.c==="seg"){ const w=document.createElement("div"); w.style.cssText="display:flex;flex-direction:column;gap:4px";
      const l=document.createElement("span"); l.className="seg-label"; l.textContent=f.l; const s=document.createElement("div"); s.className="seg"; s.setAttribute("role","group"); s.setAttribute("aria-label",f.l);
      // Festgelegt: Wert anzeigen und Knopf zurück zur Auswahl
      const fest=f.fest&&f.fest(v);
      if(fest){ l.textContent=`${f.l}: ${(f.o.find(([val])=>val===fest)||[0,fest])[1]}`; s.className="seg back"; const b=document.createElement("button"); b.type="button"; b.id=id+"-zurueck"; b.textContent=f.zurueck.text;
        b.addEventListener("click",f.zurueck.tun); s.appendChild(b); w.append(l,s); return w; }
      (f.oShow?f.o.filter(([val])=>f.oShow(val,v)):f.o).forEach(([val,lab])=>{ const b=document.createElement("button"); b.type="button"; b.id=id+"-"+val; b.textContent=lab; b.setAttribute("aria-pressed",String(v[f.k]===val));
        b.addEventListener("click",()=>{ v[f.k]=val; renderFields(); schedule(); }); s.appendChild(b); });
      w.append(l,s); return w; }
    if(f.c==="check"){ const l=document.createElement("label"); l.className="check"; const i=document.createElement("input"); i.type="checkbox"; i.id=id; i.checked=!!v[f.k];
      i.addEventListener("change",()=>{ v[f.k]=i.checked; if(f.on) f.on(v); if(f.on||HALTERUNGEN[state.type].fields.some(x=>x.show||x.oShow)) renderFields(); schedule(); }); l.append(i,document.createTextNode(" "+f.l)); return l; }
    if(f.c==="range"){ const w=document.createElement("div"); w.className="slider"; const sp=document.createElement("span"); sp.textContent=f.l; const o=document.createElement("output"); o.id=id+"-out";
      const i=document.createElement("input"); i.type="range"; i.id=id; i.min=typeof f.min==="function"?f.min(v):f.min; i.max=typeof f.max==="function"?f.max(v):f.max; i.step=f.step; i.value=v[f.k];
      const upd=()=>{ o.textContent = f.fmt ? f.fmt(+v[f.k],v) : `${(+v[f.k]).toLocaleString("de-DE",{maximumFractionDigits:1})} ${f.u}`; };
      i.addEventListener("input",()=>{ v[f.k]=parseFloat(i.value); upd(); schedule(); }); upd(); w.append(sp,o,i); return w; }
  };
  for(const f of HALTERUNGEN[state.type].fields){
    if(f.row){ if(f.show&&!f.show(v)) continue; if(f.l){ const h=document.createElement("span"); h.className="seg-label"; h.textContent=f.l; box.appendChild(h); }
      const r=document.createElement("div"); r.className="nums";
      f.row.forEach(c=>{ if(c.show&&!c.show(v)) return; const l=document.createElement("label"); l.className="num"; const u=c.u??"mm"; l.textContent=c.lab?c.lab(v):c.l;
        const i=document.createElement("input"); i.type="number"; i.id=`f-${state.type}-${c.k}`; i.min=c.min; i.max=c.max; i.step=c.step||0.5; i.value=v[c.k]; i.inputMode="decimal";
        i.addEventListener("input",()=>{ const x=parseFloat(i.value); if(isFinite(x)&&x>0){ v[c.k]=Math.min(c.max,Math.max(c.min,x)); schedule(); } });
        // Einheit steht im Eingabefeld, damit der Feldname in eine Zeile passt
        const w=document.createElement("span"); w.className="inp"; if(u) w.dataset.u=u; w.appendChild(i); l.appendChild(w); r.appendChild(l); });
      box.appendChild(r); continue; }
    const el=mk(f); if(el) box.appendChild(el);
  }
  // Beim Tippen nicht aus dem Feld fallen, wenn die Felder neu aufgebaut werden
  if(focus&&$(focus)) $(focus).focus();
}
function renderAll(){ renderTypes(); renderFields(); renderPlanPanel(); schedule(); }
