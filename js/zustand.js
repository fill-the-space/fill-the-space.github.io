/* ---------- Zustand ---------- */
const DEFAULTS={}; for(const k in HALTERUNGEN) DEFAULTS[k]=HALTERUNGEN[k].defaults;
const state={preset:"fernbedienung", type:"koecher", ghost:null, v:JSON.parse(JSON.stringify(DEFAULTS))};
try{ const sv=JSON.parse(localStorage.getItem("halterung-v2")||"null"); if(sv&&sv.v&&HALTERUNGEN[sv.type]){ Object.assign(state,sv); for(const k in DEFAULTS) state.v[k]={...DEFAULTS[k],...(sv.v[k]||{})}; } }catch(e){}
// Fotos werden nicht gespeichert: nach dem Neuladen mit dem Beispiel weitermachen
if(state.type==="individuell"&&!PRESETS.some(p=>p.id===state.preset&&p.sample)){ state.preset="klebepistole"; state.v.individuell={...DEFAULTS.individuell,...PRESETS.find(p=>p.id==="klebepistole").p}; }
