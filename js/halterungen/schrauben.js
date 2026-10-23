/* ---------- Schrauben: Größe, Kopfform, Anzahl und Lage der Löcher ----------
   Jede Halterungsart hängt SCHRAUB_FELDER an ihre Felder und SCHRAUB_STANDARD an ihre Standardwerte (beides enthält auch die Auswahl der Befestigung).
   Immer Senkkopfschrauben, damit kein Kopf in die Halterung ragt.
   Loch = Schraube + 0,5 mm, Senkkopf ≈ 2 × Schraube + 1 mm, Senkung 90°. */
const SCHRAUB_FELDER=[
  ...MONTAGE_FELDER,
  {k:"sd",c:"seg",l:"Schraube Ø (mm)",o:[[3,"3"],[3.5,"3,5"],[4,"4"],[5,"5"],[6,"6"]],show:v=>v.mount==="schrauben"&&screwAvail.length>0},
  {k:"sn",c:"seg",l:"Anzahl Schrauben",o:[[1,"1"],[2,"2"],[3,"3"],[4,"4"]],show:v=>v.mount==="schrauben"&&screwAvail.length>0,oShow:val=>screwAvail.includes(val)}
];
// Anzahlen, die auf die aktuelle Rückwand passen; wird nach jeder Berechnung aktualisiert
let screwAvail=[1,2,3,4];
const RAND=20;   // mm vom Bohrloch bis zur Kante der Rückwand
const SCHRAUB_STANDARD={...MONTAGE_STANDARD,sd:4,sn:2};
const mmDE=x=>x.toLocaleString("de-DE",{maximumFractionDigits:1});

/* Maße der gewählten Senkkopfschraube */
function screwSpec(p){
  const d=+p.sd||4, hole=d+0.5, dk=2*d+1;
  return {d,hole,dk,depth:(dk-hole)/2};
}
/* Mindestdicke der Rückwand: Senkung ganz versenkt plus 1,2 mm Material dahinter */
function screwWall(s){ return s.depth+1.2; }

/* Mindesthöhe der Rückwand für eine Schraubenreihe mit RAND Abstand nach oben und unten */
function screwMinPlate(s){ return 2*(RAND+s.hole/2); }

/* Lochpositionen [x, z] auf der Rückwand x0..x1 × z0..z1, immer mittig und mit RAND Abstand vom Bohrloch zur Kante.
   acc = {x0,x1,z0,z1,msg}: Bereich, in dem man von vorne mit dem Schraubendreher an die Löcher kommt (optional).
   Liefert {pts, avail, n}: avail = Anzahlen, die passen; n = tatsächlich genutzte Anzahl. */
function screwPlan(p,s,x0,x1,z0,z1,warn,acc){
  const m=RAND+s.hole/2, gap=s.dk+4;
  let X0=x0+m, X1=x1-m, Z0=z0+m, Z1=z1-m;
  const randOk=X1>=X0&&Z1>=Z0;
  if(acc){ X0=Math.max(X0,acc.x0); X1=Math.min(X1,acc.x1); Z0=Math.max(Z0,acc.z0); Z1=Math.min(Z1,acc.z1); }
  const w=X1-X0, h=Z1-Z0, xm=(X0+X1)/2, zm=(Z0+Z1)/2;
  const grid=w>=gap&&h>=gap;
  const fits={1:w>=0&&h>=0, 2:w>=gap&&h>=0, 3:w>=2*gap&&h>=0, 4:grid||(w>=3*gap&&h>=0)};
  const avail=[1,2,3,4].filter(n=>fits[n]);
  if(!p.holes) return {pts:[],avail,n:0};
  if(!avail.length&&randOk&&acc){ warn.push(acc.msg); return {pts:[],avail,n:0}; }
  if(!avail.length){ warn.push(`Die Rückwand ist zu klein für Schraublöcher mit ${RAND} mm Abstand zum Rand. Dafür braucht sie mindestens ${mmDE(2*m)} × ${mmDE(2*m)} mm.`); return {pts:[],avail,n:0}; }
  const want=Math.round(+p.sn||2), n=avail.includes(want)?want:Math.max(...avail.filter(k=>k<want),avail[0]);
  let pts;
  if(n===1) pts=[[xm,zm]];
  else if(n===2) pts=[[X0,zm],[X1,zm]];
  else if(n===3) pts=[[X0,zm],[xm,zm],[X1,zm]];
  else pts = grid ? [[X0,Z1],[X1,Z1],[X0,Z0],[X1,Z0]] : [0,1,2,3].map(i=>[X0+w*i/3,zm]);
  return {pts,avail,n};
}

/* Löcher von y0 bis y1 in die Form schneiden; Senkung öffnet zur Kopfseite yHead, dahinter Platz für den Kopf bis y1 */
function screwCut(d,x,y,z,pts,s,y0,y1,yHead){
  for(const [hx,hz] of pts) d=Math.max(d,-screw(x,y,z,hx,hz,y0,y1,yHead,s.hole,s.depth));
  return d;
}

/* OpenSCAD-Zeilen; len, yHead und clear (Platz für den Kopf hinter der Senkung) als Ausdruck im SCAD-Code, z. B. "P + 2" und "P" */
function screwSCAD(pts,s,len,yHead,clear){
  if(!pts.length) return [];
  const L=[`  // ${pts.length} × Senkkopfschraube ${f2(s.d)} mm`];
  pts.forEach(([x,z])=>{ L.push(`  translate([${f2(x)}, -1, ${f2(z)}]) rotate([-90, 0, 0]) cylinder(d = ${f2(s.hole)}, h = ${len});`);
    L.push(`  translate([${f2(x)}, ${yHead} - ${f2(s.depth)}, ${f2(z)}]) rotate([-90, 0, 0]) cylinder(d1 = ${f2(s.hole)}, d2 = ${f2(s.dk)}, h = ${f2(s.depth+0.01)});`);
    if(clear) L.push(`  translate([${f2(x)}, ${yHead}, ${f2(z)}]) rotate([-90, 0, 0]) cylinder(d = ${f2(s.dk)}, h = ${clear});`); });
  return L;
}
