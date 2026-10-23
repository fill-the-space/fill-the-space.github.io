HALTERUNGEN.koecher = {
  name:"Köcher",
  hint:"Das Gerät steht in einer Schale. Für Fernbedienungen, Handys, Dosen und Flakons.",
  defaults:{shape:"eckig",B:45,T:22,H:170,r:6,hs:68,lip:18,t:2.4,s:0.5,slot:false,...SCHRAUB_STANDARD},
  fields:[
    {k:"shape",c:"seg",l:"Querschnitt",o:[["eckig","Eckig"],["abgerundet","Abgerundet"],["rund","Rund / oval"]]},
    {row:[{k:"B",l:"Breite",min:10,max:300},{k:"T",l:"Tiefe",min:5,max:250},{k:"H",l:"Höhe",min:20,max:400}],l:"Maße des Geräts"},
    {k:"r",c:"range",l:"Eckenradius",u:"mm",min:1,max:30,step:0.5,show:v=>v.shape==="abgerundet"},
    {k:"hs",c:"range",l:"Höhe der Schale",u:"mm",min:10,max:250,step:1},
    {k:"lip",c:"range",l:"Lippe vorne",u:"mm",min:4,max:80,step:1},
    {k:"t",c:"range",l:"Wandstärke",u:"mm",min:1.6,max:4,step:0.2},
    {k:"s",c:"range",l:"Spiel pro Seite",u:"mm",min:0,max:2,step:0.1},
    {k:"slot",c:"check",l:"Kabelschlitz im Boden"},
    ...SCHRAUB_FELDER
  ],
  build:p=>buildKoecher(p)
};

/* ---------- Köcher ---------- */
function buildKoecher(p){
  const iw=p.B+2*p.s, id=p.T+2*p.s, t=p.t;
  const ri = p.shape==="rund" ? Math.min(iw,id)/2 : p.shape==="abgerundet" ? Math.min(p.r+p.s,Math.min(iw,id)/2) : 0;
  const warn=[], hs=Math.min(p.hs,p.H); if(p.hs>p.H) warn.push(`Höhe der Schale auf die Gerätehöhe von ${f2(p.H)} mm begrenzt.`);
  const Wo=iw+2*t, Do=id+2*t, Ho=t+hs, cx=Wo/2, cy=t+id/2;
  const lip=Math.min(p.lip,Ho-t), m=Math.max(3,Math.min(10,p.B*0.15));
  const win = lip < Ho-t-1;
  const cw=Math.min(12,p.B*0.4), round=p.shape==="rund";
  // Bei runder Innenseite liegt der Kopf nicht plan auf, deshalb ohne Senkung
  const sc=screwSpec(p,t,warn,!round), plan=screwPlan(p,sc,0,Wo,0,Ho,warn), holes=plan.pts;
  const f=(x,y,z)=>{
    let d=ext(Math.min(rr2(x,y,cx,cy,Wo/2,Do/2,ri+t), rr2(x,y,cx,cy/2,Wo/2,cy/2,0)),z,0,Ho);
    d=Math.max(d,-ext(rr2(x,y,cx,cy,iw/2,id/2,ri),z,t,Ho+5));
    if(win) d=Math.max(d,-box3(x,y,z,cx-(iw/2-m),cx+(iw/2-m),cy,Do+5,t+lip,Ho+5));
    d=screwCut(d,x,y,z,holes,sc,-5,cy,t);
    if(p.slot) d=Math.max(d,-box3(x,y,z,cx-cw/2,cx+cw/2,cy-id*0.15,Do+5,-5,t+0.01));
    return d; };
  const rs=Math.max(0.01,Math.min(ri,Math.min(iw,id)/2-0.01));
  const L=[`// Halterungs-Generator – Köcher (${p.shape})`,`// Gerät ${f2(p.B)} x ${f2(p.T)} x ${f2(p.H)} mm, Spiel ${f2(p.s)} mm`,`$fn = 96;`,
    `wand = ${f2(t)}; iw = ${f2(iw)}; id = ${f2(id)}; ri = ${f2(rs)};`,`Wo = ${f2(Wo)}; Do = ${f2(Do)}; Ho = ${f2(Ho)}; cx = ${f2(cx)}; cy = ${f2(cy)};`,``,
    `module rr(w, d, rad) { if (rad > 0.05) offset(r = rad) square([max(w - 2*rad, 0.02), max(d - 2*rad, 0.02)], center = true); else square([w, d], center = true); }`,``,
    `difference() {`,`  linear_extrude(Ho) union() { translate([cx, cy]) rr(Wo, Do, ri + wand); square([Wo, cy]); }`,
    `  translate([0, 0, wand]) linear_extrude(Ho) translate([cx, cy]) rr(iw, id, ri);`];
  if(win) L.push(`  // Sichtfenster vorne, Lippe ${f2(lip)} mm`,`  translate([cx - ${f2(iw/2-m)}, cy, wand + ${f2(lip)}]) cube([${f2(iw-2*m)}, Do, Ho]);`);
  L.push(...screwSCAD(holes,sc,"cy + 1","wand"));
  if(p.slot) L.push(`  // Kabelschlitz`,`  translate([cx - ${f2(cw/2)}, cy - ${f2(id*0.15)}, -1]) cube([${f2(cw)}, Do, wand + 1.01]);`);
  L.push(`}`);
  const ghost=[{k:"rr",cx,cy,w:p.B,d:p.T,r:Math.max(0,ri-p.s),z0:t,z1:t+p.H}];
  return {f,bb:[0,Wo,0,Do,0,Ho],dims:[Wo,Do,Ho],scad:L.join("\n"),ghost,dir:"Boden unten",warn,screw:plan};
}
