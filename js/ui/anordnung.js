/* ---------- Anordnung: Teile an der Wand oder im Kasten ----------
   Jede Seite hat einen eigenen Platz: Halterungen hängen an einer Wand (von vorne gesehen: a = von links, b = von unten),
   Boxen stehen in einem Kasten, z. B. Schublade, Kiste oder Regalfach (von oben gesehen: a = von links, b = von vorne).
   Jedes Teil merkt sich Art und Maße. Ist ein Teil ausgewählt, gelten Änderungen im Formular für dieses Teil.
   Im Kasten lassen sich Boxen stapeln (stack): Sie stehen dann auf den Boxen darunter, so = Reihenfolge des Stapelns.
   Die Wand richtet sich nach der Befestigung des ersten Teils (ohne Teile: nach dem Teil im Formular):
   Schrauben = normale Wand, frei platzierbar; SKÅDIS = Lochplatte, die Haken rasten in die Schlitze ein; Türhaken = Schranktür,
   die Teile hängen oben an der Türkante. Teile mit anderer Befestigung passen dann nicht dazu. */
const PLAN_ART={
  halterung:{kind:"wand", b:"von unten", gap:20, raster:100,
    hint:"Teile mit der Maus oder dem Finger verschieben, sie rasten an den Kanten der anderen Teile ein. Ein angetipptes Teil ist ausgewählt: Änderungen im Formular gelten dann nur für dieses Teil. Für eine weitere Halterung wieder „Teil hinzufügen“ oder „Duplizieren“ drücken und das neue Teil anpassen. Auf eine freie Stelle tippen hebt die Auswahl auf. Mit „Neu anfangen“ lässt sich eine andere Wandart beginnen."},
  box:{kind:"kasten", name:"Kasten", knopf:"Im Kasten", ort:"im Kasten", rand:"des Kastens", dazu:"In den Kasten legen", size:[["L","Länge"],["B","Breite"],["H","Höhe"]], b:"von vorne", gap:0, raster:50,
    hint:"Trag die Innenmaße deines Kastens ein, z. B. einer Schublade, Kiste oder eines Regalfachs. „Teil hinzufügen“ stellt die Box aus dem Formular hinein, die Ansicht zeigt sie von oben, vorne ist unten. Boxen mit der Maus oder dem Finger verschieben, sie rasten an den Kanten der anderen Boxen ein. „Drehen“ dreht die ausgewählte Box um 90°. „Stapeln“ stellt die ausgewählte Box auf eine andere, am liebsten auf eine gleich große. Das geht nur mit stapelbaren Boxen (Stapelbox, Sortierkasten und Deckelbox mit „Stapelbar“) und nur mit gleich großen Boxen der gleichen Art, genau übereinander. Am einfachsten: Box auswählen, „Duplizieren“, dann „Stapeln“. In der Ansicht von oben ist jede gestapelte Box etwas kleiner gezeichnet und mit ▲ markiert: Wer die oberste Box zieht, nimmt sie vom Stapel; wer die untere Box am Rand greift, verschiebt den ganzen Stapel. Stapelboxen greifen mit ihrem Fuß in die Box darunter, wenn beide gleich groß sind. Ein angetipptes Teil ist ausgewählt: Änderungen im Formular gelten dann nur für diese Box. Auf eine freie Stelle tippen hebt die Auswahl auf."}
};
// Wandarten nach Befestigung
const WAND_ART={
  wand:{name:"Wand", knopf:"An der Wand", dazu:"An die Wand hängen", ort:"an der Wand", rand:"der Wand", akk:"die Wand", mount:"Schrauben", size:[["W","Breite"],["H","Höhe"]],
    hint:"Halterungen mit Schrauben lassen sich frei an der Wand platzieren. Trag ein, wie groß die freie Wandfläche ist."},
  skadis:{name:"SKÅDIS-Lochplatte", knopf:"An der SKÅDIS-Platte", dazu:"An die SKÅDIS-Platte hängen", ort:"an der Lochplatte", rand:"der Lochplatte", akk:"die SKÅDIS-Lochplatte", mount:"SKÅDIS", size:[["W","Plattenbreite"],["H","Plattenhöhe"]],
    hint:"An der IKEA-SKÅDIS-Lochplatte sitzen die Haken immer genau in einem Schlitz: Beim Ziehen springt das Teil von Schlitz zu Schlitz. Es passen nur Halterungen mit SKÅDIS-Haken. Trag die Größe deiner Platte ein, z. B. 560 × 560 mm."},
  tuer:{name:"Schranktür", knopf:"An der Tür", dazu:"An die Tür hängen", ort:"an der Tür", rand:"der Tür", akk:"die Schranktür", mount:"Türhaken", size:[["W","Türbreite"],["H","Türhöhe"]],
    hint:"An der Schranktür hängen die Halterungen mit ihrem Haken oben an der Türkante. Sie lassen sich deshalb nur nach links und rechts verschieben. Es passen nur Halterungen mit Türhaken."}
};
const MOUNT_NAME={schrauben:"Schrauben",skadis:"SKÅDIS",tuer:"Türhaken"};
const mountOf=v=>({skadis:"skadis",tuer:"tuer"})[v&&v.mount]||"wand";
function wandArt(){ const P=state.plan.halterung; return mountOf(P.items.length?P.items[0].v:state.v[state.page==="halterung"?state.type:state.last.halterung]); }
const planCache=new Map();
const plan=()=>state.plan[state.page];
const planArt=()=>state.page==="halterung"?{...PLAN_ART.halterung,...WAND_ART[wandArt()],art:wandArt()}:PLAN_ART.box;
const planSize=()=>state.page==="halterung"?state.plan.halterung.dims[wandArt()]:plan();
const planDims=()=>{ const S=planSize(); return planArt().kind==="wand"?[S.W,S.H]:[S.L,S.B]; };
const planKey=(type,v)=>type+JSON.stringify(v);
const nameOf=t=>HALTERUNGEN[t].name.replace(/­/g,"");
const clone=o=>JSON.parse(JSON.stringify(o));
const mm=x=>x.toLocaleString("de-DE",{maximumFractionDigits:0});

// Netz und Umriss eines Teils; für gleiche Maße nur einmal berechnet (Boxen mit geschlossenem Deckel)
function planEntry(type,v){
  const k=planKey(type,v); let e=planCache.get(k);
  if(!e){ const m=build(type,v), g=m.plan||{f:m.f,bb:m.bb}, b=g.bb, vol=(b[1]-b[0]+4)*(b[3]-b[2]+4)*(b[5]-b[4]+4);
    e={bb:b, box:m.box, mount:m.mount, mesh:polygonize(g.f,b,Math.max(1,Math.min(Math.cbrt(vol/120000),(v.t||v.P||3)*0.8)))}; planCache.set(k,e); }
  return e;
}
// Umriss eines Teils in der Ansicht (Rechteck a, b, w, h in mm)
function planRect(it){
  const e=planEntry(it.type,it.v), b=e.bb, wand=planArt().kind==="wand";
  let w=b[1]-b[0], h=wand?b[5]-b[4]:b[3]-b[2]; if(!wand&&it.rot) [w,h]=[h,w];
  return {it,e,a:it.a,b:it.b,w,h};
}
const hit=(r,s)=>r.a<s.a+s.w-0.01&&s.a<r.a+r.w-0.01&&r.b<s.b+s.h-0.01&&s.b<r.b+r.h-0.01;
// Freie Stelle: Wand von oben links, Kasten von vorne links, jeweils neben oder unter/hinter den vorhandenen Teilen
function freeSpot(w,h,rects){
  const [CW,CH]=planDims(), g=planArt().gap, wand=planArt().kind==="wand";
  const as=[g,...rects.map(r=>r.a+r.w+g)].sort((x,y)=>x-y), bs=(wand?[CH-h-g,...rects.map(r=>r.b-h-g)]:[g,...rects.map(r=>r.b+r.h+g)]).sort((x,y)=>wand?y-x:x-y);
  for(const b of bs) for(const a of as){ const r={a,b,w,h}; if(a>=0&&b>=0&&a+w<=CW+0.01&&b+h<=CH+0.01&&!rects.some(s=>hit(r,s))) return {a,b}; }
  return {a:Math.max(0,Math.min(g,CW-w)), b:wand?Math.max(0,CH-h-g):g};
}
/* Stapel im Kasten: Höhe z jeder Box und auf welchen Boxen sie steht (rest). Erst alle Boxen am Boden, dann die gestapelten
   in der Reihenfolge, in der sie gestapelt wurden. Gestapelt werden nur gleich große Boxen der gleichen Art, genau übereinander;
   der Fuß der oberen Box greift in den Rand der unteren. */
const hoehe=r=>r.e.bb[5]-r.e.bb[4];
const gleich=(r,o)=>r.it.type===o.it.type&&Math.abs(r.w-o.w)<0.5&&Math.abs(r.h-o.h)<0.5;
const greift=(r,o)=>stapelbar(r)&&stapelbar(o)&&gleich(r,o)&&Math.abs(r.a-o.a)<0.5&&Math.abs(r.b-o.b)<0.5;
// Stapelbar: Box mit Stapelfuß (Stapelbox, Sortierkasten und Deckelbox mit „Stapelbar“). Nur solche Boxen kommen auf andere,
// und nur auf solche wird gestapelt. Eine nicht stapelbare Box mit stack steht am Boden.
const stapelbar=r=>!!(r.e.box&&r.e.box.stack);
let planMsg="";
function planLayout(rects){
  const L=new Map(), kasten=planArt().kind!=="wand", done=[];
  for(const r of rects) if(!kasten||!r.it.stack||!stapelbar(r)){ L.set(r.it.id,{z:0,rest:[]}); done.push(r); }
  for(const r of rects.filter(r=>kasten&&r.it.stack&&stapelbar(r)).sort((x,y)=>(x.it.so||0)-(y.it.so||0))){ let z=0, rest=[];
    for(const o of done) if(hit(r,o)){ const top=L.get(o.it.id).z+hoehe(o)-(greift(r,o)?BOX_FUSS:0);
      if(top>z+0.01){ z=top; rest=[o.it.id]; } else if(Math.abs(top-z)<=0.01) rest.push(o.it.id); }
    L.set(r.it.id,{z,rest}); done.push(r); }
  return L;
}
// Stockwerk im Stapel (0 = am Boden) und wie weit die Box in der Ansicht von oben eingerückt gezeichnet wird,
// damit man die Box darunter am Rand noch greifen kann
function stock(id,L){ const l=L.get(id); return l&&l.rest.length ? 1+Math.max(...l.rest.map(x=>stock(x,L))) : 0; }
const einzug=(r,L)=>Math.min(r.w,r.h)*0.08*stock(r.it.id,L);
// Alle Boxen, die (auch über andere) auf der Box id stehen
function aufgestapelt(id,L){ const out=new Set([id]); let more=true;
  while(more){ more=false; for(const [k,l] of L) if(!out.has(k)&&l.rest.some(x=>out.has(x))){ out.add(k); more=true; } }
  out.delete(id); return out; }
/* SKÅDIS: Schlitze 5 × 15 mm in Spalten 40 mm auseinander, jede zweite Reihe um 20 mm versetzt, Reihen 20 mm übereinander.
   x = Mitte des Schlitzes von links, z = Unterkante von unten */
function skadisSlots(W,H){ const out=[];
  for(let k=0;15+20*k+15<=H-15;k++) for(let x=20+(k%2?20:0);x<=W-20;x+=SKADIS.pitch) out.push({x,z:15+20*k}); return out; }
// Mögliche Lagen eines SKÅDIS-Teils: der erste Haken sitzt auf dem Boden eines Schlitzes (Haken von vorne gesehen gespiegelt)
function skadisLagen(r){ const m=r.e.mount, [W,H]=planDims(); if(!m||!m.hx||!m.hx.length) return [];
  const ox=r.e.bb[1]-m.hx[0], oz=m.zt-5-r.e.bb[4];
  return skadisSlots(W,H).map(q=>({a:q.x-ox,b:q.z-oz})).filter(p=>p.a>=-0.01&&p.b>=-0.01&&p.a+r.w<=W+0.01&&p.b+r.h<=H+0.01); }
// Tür: Unterseite der Brücke liegt auf der Türoberkante
const tuerB=r=>planDims()[1]-((r.e.mount&&r.e.mount.doorTop!=null?r.e.mount.doorTop:r.e.bb[5])-r.e.bb[4]);
// Lage eines Teils an Lochplatte oder Tür erzwingen (Wand und Kasten: frei)
function fitPos(r){ const A=planArt(); if(A.kind!=="wand"||mountOf(r.it.v)!==A.art) return;
  if(A.art==="tuer"){ const W=planDims()[0]; r.it.b=r.b=tuerB(r); r.it.a=r.a=Math.max(0,Math.min(r.a,W-r.w)); }
  if(A.art==="skadis"){ let best=null, bd=1e18; for(const p of skadisLagen(r)){ const d=(p.a-r.a)**2+(p.b-r.b)**2; if(d<bd){ bd=d; best=p; } }
    if(best){ r.it.a=r.a=best.a; r.it.b=r.b=best.b; } } }
// Freier Platz für ein neues Teil, passend zur Wandart
function placeFree(r,rects){ const A=planArt(), g=A.gap, W=planDims()[0], frei=p=>!rects.some(s=>hit({...p,w:r.w,h:r.h},s));
  if(A.kind==="wand"&&A.art==="skadis"){ const L=skadisLagen(r).sort((x,y)=>y.b-x.b||x.a-y.a); return L.find(frei)||L[0]||{a:0,b:0}; }
  if(A.kind==="wand"&&A.art==="tuer"){ const b=tuerB(r), as=[g,...rects.map(o=>o.a+o.w+g)].sort((x,y)=>x-y);
    return {a:as.find(a=>a+r.w<=W+0.01&&frei({a,b}))??Math.max(0,Math.min(g,W-r.w)), b}; }
  return freeSpot(r.w,r.h,rects); }
function clampItem(it){ const r=planRect(it), [CW,CH]=planDims(); it.a=Math.max(0,Math.min(it.a,CW-r.w)); it.b=Math.max(0,Math.min(it.b,CH-r.h)); }
function savePlan(){ try{localStorage.setItem(STORE,JSON.stringify(state));}catch(e){} }

/* ---------- Bedienung ---------- */
function selectItem(id){
  const P=plan(); P.sel=id; const it=P.items.find(i=>i.id===id);
  if(it){ state.type=it.type; state.v[it.type]=clone(it.v); }
  renderAll();
}
function addItem(it){
  const P=plan(), A=planArt();
  // An Lochplatte oder Tür passen nur Teile mit derselben Befestigung
  if(A.kind==="wand"&&P.items.length&&mountOf(it.v)!==A.art){ planMsg=`An ${A.akk} passen nur Halterungen mit der Befestigung „${A.mount}“. Im Formular die Befestigung ändern oder mit „Neu anfangen“ eine andere Wand beginnen.`; renderAll(); return; }
  const rects=P.items.map(planRect).filter(o=>!o.it.stack), r=planRect({...it,a:0,b:0}), s=placeFree(r,rects);
  it.id=++P.n; it.a=s.a; it.b=s.b; P.items.push(it); selectItem(it.id);
}
$("planAdd").addEventListener("click",()=>addItem({type:state.type,v:clone(state.v[state.type]),rot:0}));
$("planDup").addEventListener("click",()=>{ const P=plan(), it=P.items.find(i=>i.id===P.sel); if(it) addItem({type:it.type,v:clone(it.v),rot:it.rot||0,stack:false}); });
$("planRot").addEventListener("click",()=>{ const P=plan(), it=P.items.find(i=>i.id===P.sel); if(!it) return; it.rot=it.rot?0:1; clampItem(it); drawPlan(); savePlan(); });
// Stapeln: auf eine Box stellen, auf der noch nichts steht (gleich große zuerst); zurück: auf einen freien Platz am Boden
$("planStack").addEventListener("click",()=>{ const P=plan(), it=P.items.find(i=>i.id===P.sel); if(!it) return;
  const rects=P.items.map(planRect), me=rects.find(r=>r.it===it), others=rects.filter(r=>r.it!==it);
  if(it.stack){ it.stack=false; const floor=others.filter(r=>!r.it.stack); if(floor.some(o=>hit(me,o))){ const s=freeSpot(me.w,me.h,floor); it.a=s.a; it.b=s.b; } }
  else { if(!stapelbar(me)) return;
    const L=planLayout(rects), frei=others.filter(o=>stapelbar(o)&&gleich(me,o)&&![...L].some(([k,l])=>k!==it.id&&l.rest.includes(o.it.id)));
    if(!others.some(o=>hit(me,o))&&!frei.length){ planMsg="Gestapelt werden nur gleich große Boxen der gleichen Art, und hier ist keine frei. Am einfachsten: „Duplizieren“ und dann die Kopie „Stapeln“."; drawPlan(); return; }
    if(!others.some(o=>hit(me,o))){ const gleich=o=>Math.abs(o.w-me.w)<0.5&&Math.abs(o.h-me.h)<0.5;
      const o=frei.find(gleich)||frei.sort((x,y)=>L.get(y.it.id).z-L.get(x.it.id).z)[0];
      it.a=o.a+(o.w-me.w)/2; it.b=o.b+(o.h-me.h)/2; clampItem(it); }
    it.stack=true; it.so=++P.n; }
  drawPlan(); savePlan(); });
// Neu anfangen: alle Teile entfernen (nach Rückfrage); die Größe von Wand bzw. Kasten bleibt
$("planReset").addEventListener("click",()=>{ const P=plan(), A=planArt(); if(!P.items.length) return;
  if(!confirm(`Alle ${P.items.length} Teile ${A.ort} entfernen und neu anfangen? Die Größe ${A.rand} bleibt.`)) return;
  P.items=[]; P.sel=null; renderAll(); });
$("planDel").addEventListener("click",()=>{ const P=plan(); P.items=P.items.filter(i=>i.id!==P.sel); P.sel=null; renderAll(); });
// Aus der Einzelteil-Ansicht: Teil hinzufügen und gleich zur Wand bzw. in den Kasten wechseln
$("toPlan").addEventListener("click",()=>{ const P=plan(); P.on=true; planCamera(); $("bed").scrollIntoView({behavior:"smooth",block:"start"});
  addItem({type:state.type,v:clone(state.v[state.type]),rot:0}); });
for(const b of document.querySelectorAll("#viewMode button")) b.addEventListener("click",()=>{ const P=plan(), on=b.dataset.mode==="plan"; if(P.on===on) return;
  P.on=on; if(!on) P.sel=null; planCamera(); renderAll(); });

// Blickwinkel: Einzelteil schräg von vorne, Wand von vorne, Kasten von vorne oben
function planCamera(){
  Object.assign(view, !plan().on ? {theta:-0.7,phi:1.05,zoom:1} : planArt().kind==="wand" ? {theta:Math.PI+0.4,phi:1.3,zoom:0.8} : {theta:-0.4,phi:0.8,zoom:0.85});
}

// Feste Teile des Bereichs (Größe, Position): nur bei Seiten- oder Ansichtswechsel neu aufbauen, damit man beim Tippen im Feld bleibt
function numField(label,val,min,max,on){
  const l=document.createElement("label"); l.className="num"; l.textContent=label;
  const w=document.createElement("span"); w.className="inp"; w.dataset.u="mm";
  const i=document.createElement("input"); i.type="number"; i.min=min; i.max=max; i.step=1; i.value=val; i.inputMode="decimal";
  i.addEventListener("input",()=>{ const x=parseFloat(i.value); if(isFinite(x)&&x>=min) on(Math.min(max,x)); });
  w.appendChild(i); l.appendChild(w); return l;
}
// Beschriftung der Knöpfe; ändert sich mit der Wandart, deshalb bei jedem Neuberechnen
function planLabels(){ const P=plan(), A=planArt();
  $("planBtn").textContent=A.knopf+(P.items.length?` (${P.items.length})`:""); $("toPlan").textContent=A.dazu; }
let shownArt=null;
function renderPlanPanel(){
  const P=plan(), A=planArt(), S=planSize(); shownArt=A.art;
  for(const b of document.querySelectorAll("#viewMode button")) b.setAttribute("aria-pressed",String((b.dataset.mode==="plan")===P.on));
  planLabels(); $("plan").hidden=!P.on; $("toPlan").hidden=P.on;
  // Legende der 3D-Vorschau: in der Anordnung ausgewähltes Teil und weitere Teile
  $("legendGhostDot").style.background=P.on?"var(--placed)":"var(--ghost)"; $("legendGhostText").textContent=P.on?"Weitere Teile":"Bauteil";
  if(P.on){ $("legendModel").textContent="Ausgewählt"; $("legendGhost").hidden=false; }
  if(!P.on){ $("formSel").hidden=true; return; }
  $("planTitle").textContent=A.name; $("planHint").textContent=(A.kind==="wand"?WAND_ART[A.art].hint+" ":"")+A.hint; $("planRot").hidden=$("planStack").hidden=A.kind==="wand";
  $("planSvg").setAttribute("aria-label",A.kind==="wand"?"Wand von vorne mit den Halterungen":"Kasten von oben mit den Boxen");
  const sz=$("planSize"); sz.innerHTML=""; sz.className="nums"+(A.size.length===2?" two":"");
  for(const [k,l] of A.size) sz.appendChild(numField(l,S[k],k==="H"&&A.kind!=="wand"?10:50,5000,x=>{ S[k]=x; drawPlan(); savePlan(); }));
  const pos=$("planPos"); pos.innerHTML="";
  pos.append(numField("von links",0,0,5000,x=>{ const it=P.items.find(i=>i.id===P.sel); if(it){ it.a=x; drawPlan(); savePlan(); } }),
             numField(A.b,0,0,5000,x=>{ const it=P.items.find(i=>i.id===P.sel); if(it){ it.b=x; drawPlan(); savePlan(); } }));
}

/* ---------- Zeichnen: Ansicht von vorne bzw. oben, Liste, Hinweise und 3D ---------- */
function drawPlan(){
  if(planArt().art!==shownArt) renderPlanPanel();
  const P=plan(), A=planArt(), wand=A.kind==="wand", [CW,CH]=planDims(), rects=P.items.map(planRect), bad=new Set(), warn=[];
  // Lochplatte und Tür: Teile in die Schlitze bzw. an die Türkante setzen
  rects.forEach(fitPos); const CH0=planSize().H;
  const nr=it=>P.items.indexOf(it)+1, L=planLayout(rects), Z=r=>L.get(r.it.id);
  // Prüfen: Überlappen (auch in der Höhe, außer eine Box steht auf der anderen), über den Rand, zu hoch für den Kasten
  rects.forEach((r,i)=>{
    for(let j=i+1;j<rects.length;j++){ const o=rects[j], zr=Z(r), zo=Z(o);
      if(hit(r,o)&&zr.z<zo.z+hoehe(o)-0.01&&zo.z<zr.z+hoehe(r)-0.01&&!zr.rest.includes(o.it.id)&&!zo.rest.includes(r.it.id)){ bad.add(r.it.id); bad.add(o.it.id); warn.push(`Teil ${i+1} und Teil ${j+1} überlappen.`); } }
    const passt=!wand||mountOf(r.it.v)===A.art, ueber=wand&&A.art==="tuer"&&passt?r.e.bb[5]-r.e.bb[4]-(CH-tuerB(r)):0;
    if(!passt){ bad.add(r.it.id); warn.push(`Teil ${i+1} hat die Befestigung „${MOUNT_NAME[r.it.v.mount||"schrauben"]}“ und passt nicht an ${A.akk}. Im Formular „${A.mount}“ wählen oder das Teil entfernen.`); }
    if(passt&&(r.a<-0.01||r.b<-0.01||r.a+r.w>CW+0.01||r.b+r.h>CH+ueber+0.01)){ bad.add(r.it.id); warn.push(`Teil ${i+1} ragt über den Rand ${A.rand}.`); }
    if(!wand&&r.it.stack&&!stapelbar(r)) warn.push(`Teil ${i+1} ist nicht stapelbar und steht deshalb am Boden.`);
    const unter=Z(r).rest.map(id=>rects.find(o=>o.it.id===id)), falsch=unter.filter(o=>!stapelbar(o)).map(o=>o.it.id), schief=unter.filter(o=>stapelbar(o)&&!greift(r,o));
    if(schief.length){ bad.add(r.it.id); warn.push(`Teil ${i+1} passt nicht genau auf Teil ${schief.map(o=>nr(o.it)).join(" und ")}. Gestapelt werden nur gleich große Boxen der gleichen Art, genau übereinander.`); }
    if(falsch.length){ bad.add(r.it.id); warn.push(`Teil ${i+1} steht auf Teil ${falsch.map(id=>P.items.findIndex(x=>x.id===id)+1).join(" und ")}, ${falsch.length>1?"die nicht stapelbar sind":"das nicht stapelbar ist"}.`); }
    const top=Z(r).z+hoehe(r); if(!wand&&top>CH0+0.01){ bad.add(r.it.id); warn.push(Z(r).z>0?`Der Stapel mit Teil ${i+1} ist ${mm(top)} mm hoch, der Kasten nur ${mm(CH0)} mm.`:`Teil ${i+1} ist ${mm(top)} mm hoch, der Kasten nur ${mm(CH0)} mm.`); } });
  const boden=rects.filter(r=>Z(r).z===0), used=boden.reduce((s,r)=>s+Math.max(0,Math.min(r.a+r.w,CW)-Math.max(r.a,0))*Math.max(0,Math.min(r.b+r.h,CH)-Math.max(r.b,0)),0);
  $("planSum").textContent=`${rects.length} ${rects.length===1?"Teil":"Teile"} · ${mm(100*used/(CW*CH))} % ${wand?"belegt":"der Bodenfläche belegt"}`;

  // Ansicht als SVG: y wächst nach unten, deshalb b von unten umrechnen
  const svg=$("planSvg"), pad=Math.max(CW,CH)*0.02, padT=A.art==="tuer"?Math.max(pad,20):pad, fs0=Math.max(CW,CH)/22;
  svg.setAttribute("viewBox",`${-pad} ${-padT} ${CW+2*pad} ${CH+pad+padT}`);
  let h=`<rect class="pl-box" x="0" y="0" width="${CW}" height="${CH}"/>`;
  const slots=A.art==="skadis"?skadisSlots(CW,CH):[];
  if(A.art==="skadis") for(const q of slots) h+=`<rect class="pl-slot" x="${q.x-2.5}" y="${CH-q.z-15}" width="5" height="15" rx="2.5"/>`;
  else if(A.art!=="tuer"){
    for(let x=A.raster;x<CW;x+=A.raster) h+=`<line class="pl-grid" x1="${x}" y1="0" x2="${x}" y2="${CH}"/>`;
    for(let y=A.raster;y<CH;y+=A.raster) h+=`<line class="pl-grid" x1="0" y1="${CH-y}" x2="${CW}" y2="${CH-y}"/>`; }
  // Von unten nach oben zeichnen; gestapelte Boxen etwas eingerückt, damit die Box darunter sichtbar bleibt
  for(const r of [...rects].sort((x,y)=>Z(x).z-Z(y).z)){ const y=CH-r.b-r.h, fs=Math.min(fs0,Math.min(r.w,r.h)*0.6), up=Z(r).z>0, k=einzug(r,L);
    h+=`<rect class="pl-item${r.it.id===P.sel?" sel":""}${bad.has(r.it.id)?" bad":""}${up?" up":""}" x="${r.a+k}" y="${y+k}" width="${r.w-2*k}" height="${r.h-2*k}" rx="${Math.min(4,r.w/4)}"/>`+
       `<text class="pl-nr" x="${r.a+r.w/2}" y="${y+r.h/2}" font-size="${fs}">${nr(r.it)}${up?"▲":""}</text>`; }
  // Ohne Auswahl: das Teil aus dem Formular gestrichelt dort zeigen, wo „Teil hinzufügen“ es hinlegen würde
  const it0=P.items.find(i=>i.id===P.sel);
  let neu=null;
  if(!it0&&bereichVon(state.type)===state.page&&(!wand||mountOf(state.v[state.type])===A.art)){ const r=planRect({type:state.type,v:state.v[state.type],a:0,b:0,rot:0}), s=placeFree(r,rects.filter(o=>!o.it.stack)); neu={...r,a:s.a,b:s.b};
    const y=CH-neu.b-neu.h; h+=`<rect class="pl-new" x="${neu.a}" y="${y}" width="${neu.w}" height="${neu.h}" rx="${Math.min(4,neu.w/4)}"/><text class="pl-nr" x="${neu.a+neu.w/2}" y="${y+neu.h/2}" font-size="${Math.min(fs0,Math.min(neu.w,neu.h)*0.6)}">+</text>`; }
  svg.innerHTML=h;

  // Liste der Teile: antippen wählt aus
  const ul=$("planList"); ul.innerHTML="";
  for(const r of rects){ const li=document.createElement("li"), b=document.createElement("button"); b.type="button"; b.setAttribute("aria-pressed",String(r.it.id===P.sel));
    const hz=r.e.bb[5]-r.e.bb[4], tief=r.e.bb[3]-r.e.bb[2];
    const auf=Z(r).rest.map(id=>P.items.findIndex(i=>i.id===id)+1);
    b.textContent=`${nr(r.it)} · ${nameOf(r.it.type)} · `+(wand?`${mm(r.w)} × ${mm(r.h)} mm, ${mm(tief)} mm tief`:`${mm(r.w)} × ${mm(r.h)} × ${mm(hz)} mm`)+(auf.length?` · steht auf Teil ${auf.join(" und ")}`:"");
    b.addEventListener("click",()=>selectItem(r.it.id===P.sel?null:r.it.id)); li.appendChild(b); ul.appendChild(li); }
  const w=$("planWarn"); w.innerHTML=""; for(const t of warn){ const p=document.createElement("p"); p.textContent=t; w.appendChild(p); }

  // Auswahl: Knöpfe, Position und Hinweis im Formular
  const it=P.items.find(i=>i.id===P.sel);
  for(const id of ["planDup","planRot","planStack","planDel"]) $(id).disabled=!it;
  $("planReset").disabled=!P.items.length;
  const meR=it&&rects.find(r=>r.it===it);
  $("planStack").textContent=it&&it.stack?"Auf den Boden":"Stapeln"; if(it&&!it.stack&&!stapelbar(meR)) $("planStack").disabled=true;
  $("planPos").hidden=!it;
  if(it){ const ins=$("planPos").querySelectorAll("input"); [it.a,it.b].forEach((x,k)=>{ if(document.activeElement!==ins[k]) ins[k].value=Math.round(x); }); ins[1].disabled=A.art==="tuer"; }
  const nichtStapelbar = it&&!wand&&!stapelbar(meR) ? (HALTERUNGEN[it.type].fields.some(f=>f.k==="stack") ? " Zum Stapeln im Formular „Stapelbar“ einschalten." : "") : "";
  $("planSel").textContent = planMsg ? planMsg : it ? `Teil ${nr(it)} ist ausgewählt. Änderungen im Formular gelten nur für dieses Teil. Zum Verschieben ziehen.${nichtStapelbar}` : P.items.length ? "Kein Teil ausgewählt. Gestrichelt: das Teil aus dem Formular, das „Teil hinzufügen“ dort hinlegt. Ein Teil antippen, um es zu verschieben oder zu ändern." : `Noch leer. Gestrichelt siehst du, wo das Teil aus dem Formular hinkäme. Stell im Formular ${wand?"eine Halterung":"eine Box"} ein und drück „Teil hinzufügen“. Oder unter „Einzelteil“ das Teil ansehen und dort „${A.dazu}“ drücken.`;
  planMsg="";
  const fs=$("formSel"); fs.hidden=false;
  fs.textContent = it ? `Du bearbeitest Teil ${nr(it)} ${A.ort}.` : `Neues Teil: ${A.ort} gestrichelt zu sehen, bis du „Teil hinzufügen“ drückst.`;

  // 3D: Netze aus dem Zwischenspeicher an ihre Stelle setzen
  const parts=rects.map(r=>{ const b=r.e.bb; if(!r.e.geo&&renderer) r.e.geo=meshGeo(r.e.mesh);
    const p={geo:r.e.geo, sel:r.it.id===P.sel, bad:bad.has(r.it.id), depth:b[3]};
    // Wand: Von vorne gesehen zeigt die x-Achse der Halterungen nach links, deshalb von rechts her einsetzen
    if(wand) Object.assign(p,{x:CW-r.a-r.w-b[0],y:0,z:r.b-b[4]});
    else if(r.it.rot) Object.assign(p,{x:r.a+b[3],y:r.b-b[0],z:Z(r).z-b[4],rot:1});
    else Object.assign(p,{x:r.a-b[0],y:r.b-b[2],z:Z(r).z-b[4]});
    return p; });
  if(neu){ const b=neu.e.bb; if(!neu.e.geo&&renderer) neu.e.geo=meshGeo(neu.e.mesh);
    parts.push(wand?{geo:neu.e.geo,ghost:true,x:CW-neu.a-neu.w-b[0],y:0,z:neu.b-b[4]}:{geo:neu.e.geo,ghost:true,x:neu.a-b[0],y:neu.b-b[2],z:-b[4]}); }
  const tuerDicke=(P.items.find(i=>mountOf(i.v)==="tuer")||{v:state.v[state.type]}).v.door||19;
  showPlan({kind:A.kind, art:A.art, W:CW, H:wand?CH:P.H, L:P.L, B:P.B, slots, door:tuerDicke, parts});

  // Zwischenspeicher klein halten: Netze, die kein Teil mehr braucht, wegwerfen
  if(planCache.size>40){ const keep=new Set(Object.values(state.plan).flatMap(Q=>Q.items.map(i=>planKey(i.type,i.v))));
    for(const [k,e] of planCache) if(!keep.has(k)){ e.geo&&e.geo.dispose(); planCache.delete(k); } }
}

/* ---------- Verschieben mit Maus oder Finger; rastet an Kanten ein ---------- */
(()=>{
  const svg=$("planSvg"); let drag=null;
  const toMM=e=>{ const m=svg.getScreenCTM(), p=new DOMPoint(e.clientX,e.clientY).matrixTransform(m.inverse()); return {a:p.x, b:planDims()[1]-p.y, px:1/m.a}; };
  svg.addEventListener("pointerdown",e=>{
    const P=plan(), pt=toMM(e), rects=P.items.map(planRect), L=planLayout(rects);
    const r=rects.filter(r=>{ const k=einzug(r,L); return pt.a>=r.a+k&&pt.a<=r.a+r.w-k&&pt.b>=r.b+k&&pt.b<=r.b+r.h-k; }).sort((x,y)=>L.get(y.it.id).z-L.get(x.it.id).z||P.items.indexOf(y.it)-P.items.indexOf(x.it))[0];
    if(!r){ if(P.sel!=null) selectItem(null); return; }
    if(P.sel!==r.it.id) selectItem(r.it.id);
    // Boxen, die darauf stehen, wandern beim Verschieben mit
    const mit=[...aufgestapelt(r.it.id,L)].map(id=>P.items.find(i=>i.id===id)).map(i=>({i,a:i.a-r.a,b:i.b-r.b}));
    drag={id:r.it.id, da:pt.a-r.a, db:pt.b-r.b, mit}; svg.setPointerCapture(e.pointerId); e.preventDefault();
  });
  svg.addEventListener("pointermove",e=>{
    if(!drag) return; const P=plan(), it=P.items.find(i=>i.id===drag.id); if(!it) return;
    const pt=toMM(e), [CW,CH]=planDims(), me=planRect(it), others=P.items.filter(i=>i!==it&&!drag.mit.some(m=>m.i===i)).map(planRect), g=planArt().gap, tol=10*pt.px;
    const snap=(x,len,edges,max)=>{ let best=null;
      for(const s of edges) for(const c of [s,s-len]) if(Math.abs(x-c)<tol&&(best==null||Math.abs(x-c)<Math.abs(x-best))) best=c;
      x=best!=null?best:Math.round(x/5)*5; return Math.max(0,Math.min(x,max-len)); };
    it.a=snap(pt.a-drag.da,me.w,[0,CW,...others.flatMap(o=>[o.a,o.a+o.w,o.a-g,o.a+o.w+g])],CW);
    it.b=snap(pt.b-drag.db,me.h,[0,CH,...others.flatMap(o=>[o.b,o.b+o.h,o.b-g,o.b+o.h+g])],CH);
    for(const m of drag.mit){ m.i.a=it.a+m.a; m.i.b=it.b+m.b; }
    drawPlan();
  });
  const end=()=>{ if(drag){ drag=null; savePlan(); } };
  svg.addEventListener("pointerup",end); svg.addEventListener("pointercancel",end);
})();
