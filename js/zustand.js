/* ---------- Zustand ---------- */
const DEFAULTS={}; for(const k in HALTERUNGEN) DEFAULTS[k]=HALTERUNGEN[k].defaults;
const STORE="halterung-v3";
const state={page:"halterung", type:"koecher", last:{halterung:"koecher", box:"stapelbox"}, bed:{x:DRUCKBETT,y:DRUCKBETT,z:DRUCKBETT},
  // Anordnung: Wand (Halterungen) und Kasten (Boxen) mit den platzierten Teilen; on = Ansicht eingeschaltet, sel = ausgewähltes Teil
  plan:{halterung:{on:false,W:1000,H:600,items:[],sel:null,n:0}, box:{on:false,L:500,B:400,H:200,items:[],sel:null,n:0}}, v:JSON.parse(JSON.stringify(DEFAULTS))};
try{ const sv=JSON.parse(localStorage.getItem(STORE)||"null"); if(sv&&sv.v){ if(HALTERUNGEN[sv.type]){ state.type=sv.type; state.page=bereichVon(sv.type); }
  if(sv.last) for(const p in state.last) if(HALTERUNGEN[sv.last[p]]&&bereichVon(sv.last[p])===p) state.last[p]=sv.last[p];
  // Druckbett: früher eine Zahl, jetzt Länge und Breite
  if(+sv.bed>0) state.bed={x:+sv.bed,y:+sv.bed,z:DRUCKBETT}; else if(sv.bed&&sv.bed.x>0&&sv.bed.y>0) state.bed={x:+sv.bed.x,y:+sv.bed.y,z:+sv.bed.z>0?+sv.bed.z:DRUCKBETT};
  if(sv.plan) for(const p in state.plan) if(sv.plan[p]){ const P={...state.plan[p],...sv.plan[p]};
    P.items=(P.items||[]).filter(i=>HALTERUNGEN[i.type]&&bereichVon(i.type)===p).map(i=>({...i,v:{...DEFAULTS[i.type],...i.v}}));
    if(!P.items.some(i=>i.id===P.sel)) P.sel=null; state.plan[p]=P; }
  for(const k in DEFAULTS) state.v[k]={...DEFAULTS[k],...(sv.v[k]||{})}; if(state.v.koecher.shape==="rund") state.v.koecher.shape="abgerundet"; } }catch(e){}
