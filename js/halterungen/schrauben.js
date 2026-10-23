/* ---------- Schrauben: Größe, Kopfform, Anzahl und Lage der Löcher ----------
   Jede Halterungsart hängt SCHRAUB_FELDER an ihre Felder und SCHRAUB_STANDARD an ihre Standardwerte.
   Loch = Schraube + 0,5 mm, Senkkopf ≈ 2 × Schraube + 1 mm, Senkung 90°. */
const SCHRAUB_FELDER=[
  {k:"holes",c:"check",l:"Schraublöcher in der Rückwand"},
  {k:"sd",c:"seg",l:"Schraube Ø (mm)",o:[[3,"3"],[3.5,"3,5"],[4,"4"],[5,"5"],[6,"6"]],show:v=>v.holes&&screwAvail.length>0},
  {k:"sk",c:"seg",l:"Schraubenkopf",o:[["senk","Senkkopf"],["flach","Flach- / Linsenkopf"]],show:v=>v.holes&&screwAvail.length>0},
  {k:"sn",c:"seg",l:"Anzahl Schrauben",o:[[1,"1"],[2,"2"],[3,"3"],[4,"4"]],show:v=>v.holes&&screwAvail.length>0,oShow:val=>screwAvail.includes(val)}
];
// Anzahlen, die auf die aktuelle Rückwand passen; wird nach jeder Berechnung aktualisiert
let screwAvail=[1,2,3,4];
const RAND=20;   // mm vom Bohrloch bis zur Kante der Rückwand
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

/* Mindesthöhe der Rückwand für eine Schraubenreihe mit RAND Abstand nach oben und unten */
function screwMinPlate(s){ return 2*(RAND+s.hole/2); }

/* Lochpositionen [x, z] auf der Rückwand x0..x1 × z0..z1, immer mittig und mit RAND Abstand vom Bohrloch zur Kante.
   Liefert {pts, avail, n}: avail = Anzahlen, die passen; n = tatsächlich genutzte Anzahl. */
function screwPlan(p,s,x0,x1,z0,z1,warn){
  const m=RAND+s.hole/2, gap=s.dk+4;
  const X0=x0+m, X1=x1-m, Z0=z0+m, Z1=z1-m, w=X1-X0, h=Z1-Z0, xm=(X0+X1)/2, zm=(Z0+Z1)/2;
  const grid=w>=gap&&h>=gap;
  const fits={1:w>=0&&h>=0, 2:w>=gap&&h>=0, 3:w>=2*gap&&h>=0, 4:grid||(w>=3*gap&&h>=0)};
  const avail=[1,2,3,4].filter(n=>fits[n]);
  if(!p.holes) return {pts:[],avail,n:0};
  if(!avail.length){ warn.push(`Die Rückwand ist zu klein für Schraublöcher mit ${RAND} mm Abstand zum Rand. Dafür braucht sie mindestens ${mmDE(2*m)} × ${mmDE(2*m)} mm.`); return {pts:[],avail,n:0}; }
  const want=Math.round(+p.sn||2), n=avail.includes(want)?want:Math.max(...avail.filter(k=>k<want),avail[0]);
  let pts;
  if(n===1) pts=[[xm,zm]];
  else if(n===2) pts=[[X0,zm],[X1,zm]];
  else if(n===3) pts=[[X0,zm],[xm,zm],[X1,zm]];
  else pts = grid ? [[X0,Z1],[X1,Z1],[X0,Z0],[X1,Z0]] : [0,1,2,3].map(i=>[X0+w*i/3,zm]);
  return {pts,avail,n};
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
