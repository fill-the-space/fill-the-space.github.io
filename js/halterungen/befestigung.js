/* ---------- Befestigung: Schrauben, Haken über eine Schranktür oder Haken für IKEA SKÅDIS ----------
   Die Haken sitzen hinten an der Rückwand (Seite y < 0) und werden zur Form dazugerechnet.
   SKÅDIS: Schlitze 5 × 15 mm, Spalten 40 mm auseinander, Platte etwa 5 mm dick. */
const SKADIS={slotW:5, slotH:15, pitch:40, board:5};

const MONTAGE_FELDER=[
  {row:[{k:"mass",l:"Gewicht des Bauteils",u:"g",min:10,max:20000,step:10}]},
  {k:"mount",c:"seg",l:"Befestigung",o:[["schrauben","Schrauben"],["tuer","Türhaken"],["skadis","SKÅDIS"]]},
  {row:[{k:"door",l:"Türstärke",min:8,max:40},{k:"hookL",l:"Hakenlänge",min:10,max:60},{k:"hookT",l:"Hakenstärke",min:1.6,max:12,step:0.2,follow:"@wand"}],l:"Haken über die Schranktür",show:v=>v.mount==="tuer"},
  {k:"doorScrews",c:"check",l:"Schraublöcher oben in die Türkante",show:v=>v.mount==="tuer"}
];
const MONTAGE_STANDARD={mass:300,mount:"schrauben",door:19,hookL:25,hookT:3,doorScrews:false};
const TUER_SCHRAUBE=3.5;  // mm, Senkkopfschraube von oben in die Türkante

/* Haken-Teile als Quader [x0,x1,y0,y1,z0,z1] für eine Rückwand von x0 bis x1, Oberkante bei top, Dicke wall.
   Jeder Haken ragt 0,5 mm in die Rückwand hinein, damit er fest verbunden ist und das Netz geschlossen bleibt.
   arm: Abstand des Bauteils von der Wand in mm (für die Anzahl der SKÅDIS-Haken) */
function mountParts(p,x0,x1,top,wall,warn,arm=0){
  const parts=[], W=x1-x0, xm=(x0+x1)/2;
  parts.info={kind:p.mount||"schrauben", width:W, t:p.hookT, hooks:0, zFix:top, pin:false};
  if(p.mount==="tuer"){
    // Die Oberkante der Halterung läuft bündig als Brücke über die Tür weiter, das Bein greift hinter die Tür; 0,8 mm Luft zur Tür
    const d=p.door, c=0.8, sc=p.doorScrews?screwSpec({sd:TUER_SCHRAUBE}):null;
    let th=p.hookT; if(sc&&th<screwWall(sc)){ th=screwWall(sc); warn.push(`Hakenstärke auf ${mmDE(th)} mm erhöht, damit die Senkköpfe oben ganz versenkt sind.`); }
    const back=-(d+c+th);
    parts.push([x0,x1,back,wall,top-th,top],[x0,x1,back,back+th,top-Math.max(p.hookL,th+5),top]);
    parts.info.t=th;
    if(th>3.5) warn.push(`Der Haken ist ${mmDE(th)} mm dick. Prüfe, ob oberhalb der Schranktür so viel Luft ist, sonst schließt die Tür nicht.`);
    // Senkkopf-Löcher von oben mitten in die Türkante, Senkung oben
    if(sc){ const yc=-(c+d/2), off=W>=50?Math.min(W/2-12,W/4):0, xs=off?[xm-off,xm+off]:[xm];
      parts.cuts=xs.map(hx=>(x,y,z)=>{ const rho=hyp(x-hx,y-yc), r=Math.min(sc.hole/2+Math.max(0,z-(top-sc.depth)),sc.hole/2+sc.depth); return ext(rho-r,z,top-th-1,top+1); });
      parts.cutInfo=`${xs.length} × Senkkopfschraube ${mmDE(TUER_SCHRAUBE)} mm von oben in die Türkante bei x = ${xs.map(f2).join(", ")}, y = ${f2(yc)}`; }
  } else if(p.mount==="skadis"){
    // Zunge 4,4 mm breit, 5 mm hoch, geht durch den Schlitz; dahinter ein Haken 8 mm nach unten. Alles zusammen 13 mm hoch, passt also durch den 15-mm-Schlitz
    const tw=4.4, deep=SKADIS.board+0.6, zt=top-4, hook=(x,tip)=>{ parts.push([x-tw/2,x+tw/2,-deep,0.5,zt-5,zt]);
      if(tip){ parts.push([x-tw/2,x+tw/2,-deep-3,-deep+0.5,zt-13,zt]); parts.info.hooks++; } };
    parts.info.zFix=zt;
    if(zt-13<0) warn.push("Die Rückwand ist für einen SKÅDIS-Haken zu niedrig. Halterung höher machen.");
    // So viele Haken, dass PLA mit Sicherheitsabstand reicht und höchstens 200 mm zwischen zwei Haken liegen; mindestens 2 gegen Verdrehen
    const cols=Math.max(1,Math.floor((W-16)/SKADIS.pitch)+1), kg=(+p.mass||0)/1000*Math.hypot(1,arm/Math.max(zt,10));
    const n=Math.min(cols,Math.max(2,Math.ceil(kg/(0.6*TRAGKRAFT.skadisHaken)),Math.ceil((cols-1)*SKADIS.pitch/200)+1));
    if(n>=2) for(let i=0;i<n;i++){ const c=Math.round(i*(cols-1)/(n-1)); hook(xm+(c-(cols-1)/2)*SKADIS.pitch,true); }
    else { hook(xm,true);
      // Nur ein Haken passt in die Breite: ein Stift im Schlitz 40 mm darunter verhindert das Verdrehen
      if(zt-SKADIS.pitch-5>=2){ parts.push([xm-2.2,xm+2.2,-SKADIS.board+0.5,0.5,zt-SKADIS.pitch-5,zt-SKADIS.pitch]); parts.info.pin=true; } }
  }
  return parts;
}

/* Haken zur Form f dazurechnen, Begrenzungsbox erweitern, OpenSCAD-Zeilen und Druckhinweis */
function mountApply(m,parts){
  m.mount=parts.info;
  if(!parts.length) return m;
  const f0=m.f, cuts=parts.cuts||[];
  m.f=(x,y,z)=>{ let d=f0(x,y,z); for(const b of parts) d=Math.min(d,box3(x,y,z,...b)); for(const c of cuts) d=Math.max(d,-c(x,y,z)); return d; };
  for(const b of parts){ m.bb[2]=Math.min(m.bb[2],b[2]); m.bb[5]=Math.max(m.bb[5],b[5]); }
  m.dims=[m.bb[1]-m.bb[0],m.bb[3]-m.bb[2],m.bb[5]-m.bb[4]];
  m.scad+="\n// Haken zum Aufhängen\n"+parts.map(b=>`translate([${f2(b[0])}, ${f2(b[2])}, ${f2(b[4])}]) cube([${f2(b[1]-b[0])}, ${f2(b[3]-b[2])}, ${f2(b[5]-b[4])}]);`).join("\n")+(parts.cutInfo?`\n// ${parts.cutInfo}`:"");
  if(m.dir!=="Boden unten") m.dir="Seitlich liegend";
  m.warn.push("Beim Drucken unter dem Haken Stützmaterial verwenden.");
  return m;
}
