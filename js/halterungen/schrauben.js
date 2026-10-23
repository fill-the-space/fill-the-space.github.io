/* ---------- Schrauben: Größe, Kopfform, Anzahl und Lage der Löcher ----------
   Jede Halterungsart hängt SCHRAUB_FELDER an ihre Felder und SCHRAUB_STANDARD an ihre Standardwerte.
   Loch = Schraube + 0,5 mm, Senkkopf ≈ 2 × Schraube + 1 mm, Senkung 90°. */
const SCHRAUB_FELDER=[
  {k:"holes",c:"check",l:"Schraublöcher in der Rückwand"},
  {k:"sd",c:"seg",l:"Schraube Ø (mm)",o:[[3,"3"],[3.5,"3,5"],[4,"4"],[5,"5"],[6,"6"]],show:v=>v.holes},
  {k:"sk",c:"seg",l:"Schraubenkopf",o:[["senk","Senkkopf"],["flach","Flach- / Linsenkopf"]],show:v=>v.holes},
  {k:"sn",c:"seg",l:"Anzahl Schrauben",o:[[1,"1"],[2,"2"],[3,"3"],[4,"4"]],show:v=>v.holes}
];
const SCHRAUB_STANDARD={holes:true,sd:4,sk:"senk",sn:2};
const mmDE=x=>x.toLocaleString("de-DE",{maximumFractionDigits:1});

/* Maße der gewählten Schraube; wall = Dicke der Rückwand, sink=false erzwingt Löcher ohne Senkung */
function screwSpec(p,wall,warn,sink=true){
  const d=+p.sd||4, hole=d+0.5, dk=2*d+1, depth=(dk-hole)/2;
  const s={d,hole,dk,depth,sink:sink&&p.sk!=="flach"};
  // Senkung höchstens bis 0,4 mm vor die Wandseite, damit der Kopf nicht durchrutscht; ein wenig Überstand ist unkritisch
  if(s.sink&&depth>wall-0.4){ s.depth=Math.max(0.3,wall-0.4); s.dk=hole+2*s.depth;
    if(depth>wall) warn.push(`Die Rückwand ist nur ${mmDE(wall)} mm dick, der ${mmDE(d)}-mm-Senkkopf steht deshalb etwa ${mmDE(depth-s.depth)} mm über. Wand dicker machen oder Flachkopf wählen.`); }
  return s;
}

/* Lochpositionen [x, z]: xa/xb äußere Spalten, zc Höhe der Reihe, zLo/zHi nutzbarer Bereich der Rückwand */
function screwLayout(p,s,xa,xb,zc,zLo,zHi,warn){
  if(!p.holes) return [];
  const n=Math.max(1,Math.min(4,Math.round(+p.sn||2))), xm=(xa+xb)/2;
  let pts;
  if(n===1) pts=[[xm,zc]];
  else if(n===2) pts=[[xa,zc],[xb,zc]];
  else if(n===3) pts=[[xa,zc],[xm,zc],[xb,zc]];
  // zwei Reihen mit mindestens 3 mm Material zwischen Schraubenkopf und Plattenkante
  else { const dz=Math.min(zc-zLo,zHi-zc)-s.dk/2-3;
    pts = dz>=(s.dk+2)/2 ? [[xa,zc-dz],[xb,zc-dz],[xa,zc+dz],[xb,zc+dz]] : [0,1,2,3].map(i=>[xa+(xb-xa)*i/3,zc]); }
  let gap=Infinity; for(let i=0;i<pts.length;i++) for(let j=i+1;j<pts.length;j++) gap=Math.min(gap,hyp(pts[i][0]-pts[j][0],pts[i][1]-pts[j][1]));
  if(gap<s.dk+2) warn.push(`Die ${n} Schrauben sitzen sehr eng (${mmDE(gap)} mm Abstand). Halterung breiter machen oder weniger bzw. kleinere Schrauben wählen.`);
  return pts;
}

/* Löcher von y0 bis y1 in die Form schneiden; Senkung öffnet zur Kopfseite yHead */
function screwCut(d,x,y,z,pts,s,y0,y1,yHead){
  for(const [hx,hz] of pts) d=Math.max(d,-screw(x,y,z,hx,hz,y0,y1,s.sink?yHead:null,s.hole,s.depth));
  return d;
}

/* OpenSCAD-Zeilen; len und yHead als Ausdruck im SCAD-Code, z. B. "P + 2" und "P" */
function screwSCAD(pts,s,len,yHead){
  if(!pts.length) return [];
  const L=[`  // ${pts.length} × Schraube ${f2(s.d)} mm, ${s.sink?"Senkkopf":"Flach- oder Linsenkopf"}`];
  pts.forEach(([x,z])=>{ L.push(`  translate([${f2(x)}, -1, ${f2(z)}]) rotate([-90, 0, 0]) cylinder(d = ${f2(s.hole)}, h = ${len});`);
    if(s.sink) L.push(`  translate([${f2(x)}, ${yHead} - ${f2(s.depth)}, ${f2(z)}]) rotate([-90, 0, 0]) cylinder(d1 = ${f2(s.hole)}, d2 = ${f2(s.dk)}, h = ${f2(s.depth+0.01)});`); });
  return L;
}
