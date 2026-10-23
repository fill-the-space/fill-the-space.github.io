/* ---------- Befestigung: Schrauben, Haken über eine Schranktür oder Haken für IKEA SKÅDIS ----------
   Die Haken sitzen hinten an der Rückwand (Seite y < 0) und werden zur Form dazugerechnet.
   SKÅDIS: Schlitze 5 × 15 mm, Spalten 40 mm auseinander, Platte etwa 5 mm dick. */
const SKADIS={slotW:5, slotH:15, pitch:40, board:5};

const MONTAGE_FELDER=[
  {k:"mount",c:"seg",l:"Befestigung",o:[["schrauben","Schrauben"],["tuer","Türhaken"],["skadis","SKÅDIS"]]},
  {row:[{k:"door",l:"Türstärke",min:8,max:40},{k:"hookL",l:"Hakenlänge",min:10,max:60},{k:"hookT",l:"Hakenstärke",min:2,max:6,step:0.5}],l:"Haken über die Schranktür",show:v=>v.mount==="tuer"}
];
const MONTAGE_STANDARD={mount:"schrauben",door:19,hookL:25,hookT:3};

/* Haken-Teile als Quader [x0,x1,y0,y1,z0,z1] für eine Rückwand von x0 bis x1, Oberkante bei top, Dicke wall.
   Jeder Haken ragt 0,5 mm in die Rückwand hinein, damit er fest verbunden ist und das Netz geschlossen bleibt. */
function mountParts(p,x0,x1,top,wall,warn){
  const parts=[], W=x1-x0, xm=(x0+x1)/2;
  if(p.mount==="tuer"){
    // Brücke liegt oben auf der Tür, Bein greift hinter die Tür; 0,8 mm Luft zur Tür
    const d=p.door, c=0.8, th=p.hookT, back=-(d+c+th);
    parts.push([x0,x1,back,wall,top-0.5,top+th],[x0,x1,back,back+th,top+th-Math.max(p.hookL,th+5),top+th]);
    if(th>3) warn.push(`Der Haken ist ${mmDE(th)} mm dick. Prüfe, ob oberhalb der Schranktür so viel Luft ist, sonst schließt die Tür nicht.`);
  } else if(p.mount==="skadis"){
    // Zunge 4,4 mm breit, 5 mm hoch, geht durch den Schlitz; dahinter ein Haken 8 mm nach unten. Alles zusammen 13 mm hoch, passt also durch den 15-mm-Schlitz
    const tw=4.4, deep=SKADIS.board+0.6, zt=top-4, hook=(x,tip)=>{ parts.push([x-tw/2,x+tw/2,-deep,0.5,zt-5,zt]);
      if(tip) parts.push([x-tw/2,x+tw/2,-deep-3,-deep+0.5,zt-13,zt]); };
    const k=Math.floor((W-16)/SKADIS.pitch);
    if(zt-13<0) warn.push("Die Rückwand ist für einen SKÅDIS-Haken zu niedrig. Halterung höher machen.");
    if(k>=1){ const half=k*SKADIS.pitch/2; hook(xm-half,true); hook(xm+half,true); }
    else { hook(xm,true);
      // Nur ein Haken passt in die Breite: ein Stift im Schlitz 40 mm darunter verhindert das Verdrehen
      if(zt-SKADIS.pitch-5>=2) parts.push([xm-2.2,xm+2.2,-SKADIS.board+0.5,0.5,zt-SKADIS.pitch-5,zt-SKADIS.pitch]); }
  }
  return parts;
}

/* Haken zur Form f dazurechnen, Begrenzungsbox erweitern, OpenSCAD-Zeilen und Druckhinweis */
function mountApply(m,parts){
  if(!parts.length) return m;
  const f0=m.f; m.f=(x,y,z)=>{ let d=f0(x,y,z); for(const b of parts) d=Math.min(d,box3(x,y,z,...b)); return d; };
  for(const b of parts){ m.bb[2]=Math.min(m.bb[2],b[2]); m.bb[5]=Math.max(m.bb[5],b[5]); }
  m.dims=[m.bb[1]-m.bb[0],m.bb[3]-m.bb[2],m.bb[5]-m.bb[4]];
  m.scad+="\n// Haken zum Aufhängen\n"+parts.map(b=>`translate([${f2(b[0])}, ${f2(b[2])}, ${f2(b[4])}]) cube([${f2(b[1]-b[0])}, ${f2(b[3]-b[2])}, ${f2(b[5]-b[4])}]);`).join("\n");
  if(m.dir!=="Boden unten") m.dir="Seitlich liegend";
  m.warn.push("Beim Drucken unter dem Haken Stützmaterial verwenden.");
  return m;
}
