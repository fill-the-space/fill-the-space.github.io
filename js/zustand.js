/* ---------- Zustand ---------- */
const DEFAULTS={}; for(const k in HALTERUNGEN) DEFAULTS[k]=HALTERUNGEN[k].defaults;
const STORE="halterung-v3";
const state={type:"koecher", bed:{x:DRUCKBETT,y:DRUCKBETT,z:DRUCKBETT}, v:JSON.parse(JSON.stringify(DEFAULTS))};
try{ const sv=JSON.parse(localStorage.getItem(STORE)||"null"); if(sv&&sv.v){ if(HALTERUNGEN[sv.type]) state.type=sv.type;
  // Druckbett: früher eine Zahl, jetzt Länge und Breite
  if(+sv.bed>0) state.bed={x:+sv.bed,y:+sv.bed,z:DRUCKBETT}; else if(sv.bed&&sv.bed.x>0&&sv.bed.y>0) state.bed={x:+sv.bed.x,y:+sv.bed.y,z:+sv.bed.z>0?+sv.bed.z:DRUCKBETT};
  for(const k in DEFAULTS) state.v[k]={...DEFAULTS[k],...(sv.v[k]||{})}; if(state.v.koecher.shape==="rund") state.v.koecher.shape="abgerundet"; } }catch(e){}
