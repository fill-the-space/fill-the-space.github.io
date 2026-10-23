/* ---------- Zustand ---------- */
const DEFAULTS={}; for(const k in HALTERUNGEN) DEFAULTS[k]=HALTERUNGEN[k].defaults;
const STORE="halterung-v3";
const state={type:"koecher", v:JSON.parse(JSON.stringify(DEFAULTS))};
try{ const sv=JSON.parse(localStorage.getItem(STORE)||"null"); if(sv&&sv.v&&HALTERUNGEN[sv.type]){ state.type=sv.type; for(const k in DEFAULTS) state.v[k]={...DEFAULTS[k],...(sv.v[k]||{})}; if(state.v.koecher.shape==="rund") state.v.koecher.shape="abgerundet"; } }catch(e){}
