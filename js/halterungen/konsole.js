HALTERUNGEN.konsole = {
  name:"Konsole",
  hint:"Konsole in L-Form. Das Bauteil steckt mit seinem schmalen Teil, z. B. dem Griff, in einem Schlitz oder Ring, der breitere Teil liegt oben auf. Z. B. ein Akkuschrauber oder ein Föhn.",
  defaults:{ap:"schlitz",rp:"mitte",ra:20,N:46,L:80,Dp:125,W:150,P:6,Hp:70,s:1,...SCHRAUB_STANDARD,...TEXT_STANDARD,mass:1500,hookT:6},
  fields:[
    {k:"ap",c:"seg",l:"Aussparung",o:[["schlitz","Schlitz, vorne offen"],["ring","Ring, geschlossen"]]},
    {k:"rp",c:"seg",l:"Lage des Rings",o:[["mitte","Mittig"],["wand","Abstand zur Wand"]],show:v=>v.ap==="ring"},
    {row:[{k:"ra",l:"Abstand Ring zur Wand",min:3,max:200}],show:v=>v.ap==="ring"&&v.rp==="wand"},
    {row:[{k:"N",l:"Griffbreite",min:10,max:150,lab:v=>v.ap==="ring"?"Ring-Ø":"Griffbreite"},{k:"L",l:"Schlitztiefe",min:10,max:200,show:v=>v.ap!=="ring"},{k:"Dp",l:"Konsolentiefe",min:30,max:250}]},
    {row:[{k:"W",l:"Breite",min:40,max:300},{k:"Hp",l:"Plattenhöhe",min:30,max:200},{k:"P",l:"Stärke",min:3,max:12}]},
    {k:"s",c:"range",l:"Spiel pro Seite",u:"mm",min:0,max:3,step:0.1},
    ...textFelder([["vorne","Rückwand"],["kante","Ablagekante"]]),
    ...SCHRAUB_FELDER
  ],
  wall:"P",   // Hakenstärke des Türhakens folgt der Stärke
  build:p=>buildKonsole(p)
};

/* ---------- Konsole (L-Form) mit Schlitz/Ring ---------- */
function buildKonsole(p){
  const warn=[], sc=screwSpec(p); const s=p.s, P=Math.max(p.P,p.holes?screwWall(sc):0), ring=p.ap==="ring", N=p.N, half=N/2+s;
  if(P>p.P) warn.push(`Stärke auf ${mmDE(P)} mm erhöht, damit der Senkkopf ganz in der Rückwand verschwindet.`);
  let W=p.W, Dp=p.Dp, Hp=p.Hp, L=Math.min(p.L,p.Dp);
  const rim=Math.max(P*1.5,8);
  const minW=N+2*s+2*(P+12); if(W<minW){W=minW;warn.push(`Breite auf ${f2(W)} mm erhöht, damit Stützen neben die Aussparung passen.`);}
  // Ring: mittig auf der Konsole oder mit gewähltem Abstand von der Wand bis zum Ringrand
  const gap = p.rp==="wand" ? Math.max(3,p.ra) : null;
  if(ring){ const minD = gap!=null ? P+gap+2*half+rim : N+2*s+rim+P+5;
    if(Dp<minD){Dp=minD;warn.push(`Konsolentiefe auf ${mmDE(Dp)} mm erhöht, damit der Ring${gap!=null?` mit ${mmDE(gap)} mm Abstand zur Wand`:""} Platz hat.`);} }
  else { if(L<half+5){L=half+5;} if(Dp<L+15){Dp=L+15;warn.push(`Konsolentiefe auf ${mmDE(Dp)} mm erhöht, damit hinter dem Schlitz genug Material bleibt.`);} }
  const hMin=Math.max(30,p.holes?screwMinPlate(sc):0);
  if(Hp<P+hMin){Hp=P+hMin;warn.push(`Plattenhöhe auf ${mmDE(Hp)} mm erhöht, damit die Schrauben ${RAND} mm Abstand zum Rand haben.`);}
  const cx=W/2, yc= !ring ? Dp-L+half : gap!=null ? P+gap+half : Math.max(P+3+half,Math.min((P+Dp)/2,Dp-rim-half));
  const Dg=Dp*0.75, Hg=Math.min(Hp-P,Dp*0.75), z0=Hp-P;
  const gx=[4,W-4-P], plan=screwPlan(p,sc,0,W,0,Hp-P,warn), holes=plan.pts;
  const tri=[[0,z0],[Dg,z0],[0,z0-Hg]];
  const ap2=(x,y)=> ring ? hyp(x-cx,y-yc)-half : Math.min(hyp(x-cx,y-yc)-half, rr2(x,y,cx,(yc+Dp+10)/2,half,(Dp+10-yc)/2,0));
  const f=(x,y,z)=>{
    let d=box3(x,y,z,0,W,0,P,0,Hp);
    d=Math.min(d,ext(Math.max(Math.max(rr2(x,y,W/2,(Dp-6)/2,W/2,(Dp+6)/2,6),-y),-ap2(x,y)),z,z0,Hp));
    for(const g of gx) d=Math.min(d,ext(poly2(y,z,tri),x,g,g+P));
    d=screwCut(d,x,y,z,holes,sc,-5,P+5,P);
    return d; };
  const S=[`// FILL THE SPACE – Konsole (L-Form) mit ${ring?"Ring":"Schlitz"}`,`$fn = 96;`,
    `W = ${f2(W)}; Dp = ${f2(Dp)}; P = ${f2(P)}; Hp = ${f2(Hp)};`,`cx = ${f2(cx)}; yc = ${f2(yc)}; ap = ${f2(2*half)};  // Aussparung inkl. Spiel`,``,
    `module konsole2d() { hull() { square([W, 1]); translate([6, Dp - 6]) circle(6); translate([W - 6, Dp - 6]) circle(6); } }`,
    ring ? `module aussparung2d() { translate([cx, yc]) circle(d = ap); }`
         : `module aussparung2d() { translate([cx, yc]) circle(d = ap); translate([cx - ap/2, yc]) square([ap, Dp]); }`,
    `module stuetze() { rotate([90, 0, 90]) linear_extrude(P) polygon([[0, Hp - P], [${f2(Dg)}, Hp - P], [0, Hp - P - ${f2(Hg)}]]); }`,``,
    `difference() {`,`  union() {`,`    cube([W, P, Hp]);`,`    translate([0, 0, Hp - P]) linear_extrude(P) konsole2d();`,
    ...gx.map(g=>`    translate([${f2(g)}, 0, 0]) stuetze();`),`  }`,`  translate([0, 0, Hp - P - 1]) linear_extrude(P + 2) aussparung2d();`];
  S.push(...screwSCAD(holes,sc,"P + 2","P"));
  S.push(`}`);
  // Beispiel-Bauteil: schmaler Teil in der Aussparung, breiterer Teil liegt oben auf der Konsole auf
  let ghost;
  if(ring){ const rTop=half+10, yTop=Math.max(yc,P+1+rTop);   // oberer Teil nicht in die Wand, notfalls etwas nach vorne
    ghost=[{k:"cyl",x:cx,y:yc,r:Math.max(2,half-s-0.5),z0:Hp-70,z1:Hp},{k:"cyl",x:cx,y:yTop,r:rTop,z0:Hp,z1:Hp+90}]; }
  else { const y0=Math.max(P+3,yc-60), wb=Math.max(N*0.8,half+10);
    ghost=[{k:"cyl",x:cx,y:yc,r:N/2,z0:Hp-115,z1:Hp},{k:"box",x0:cx-wb,x1:cx+wb,y0,y1:y0+200,z0:Hp,z1:Hp+68},
           {k:"cyl",x:cx,y:y0+200,r:N*0.32,z0:Hp+12,z1:Hp+56,ax:"y",len:45},
           {k:"box",x0:cx-wb,x1:cx+wb,y0:Math.max(P+3,yc-58),y1:Math.max(P+3,yc-58)+116,z0:Hp-190,z1:Hp-115}]; }
  // Flächen für die Beschriftung: vorne auf der Rückwand unter der Konsole (zwischen den Stützen, neben den Schraublöchern)
  // oder auf der Vorderkante der Ablage (beim Schlitz nur, wenn er die Kante nicht teilt)
  const schilder={vorne:{ax:"y",dir:1,p:P,u0:4+P+2,u1:W-4-P-2,z0:2,z1:z0-2,avoid:holes.map(([x,z])=>({u0:x-sc.dk/2-1.5,u1:x+sc.dk/2+1.5,z0:z-sc.dk/2-1.5,z1:z+sc.dk/2+1.5}))},
    kante:ring?{ax:"y",dir:1,p:Dp,u0:8,u1:W-8,z0:z0+0.8,z1:Hp-0.8}:null};
  return mountApply({f,bb:[0,W,0,Dp,0,Hp],dims:[W,Dp,Hp],scad:S.join("\n"),ghost,dir:"Rückwand unten",warn,screw:plan,arm:yc,schilder,beam:{Wsec:2*P*Hg*Hg/6,name:"Die Konsole",tipp:"Stärke oder Plattenhöhe erhöhen (größere Stützen) oder die Konsole weniger tief machen."}},mountParts(p,0,W,Hp,P,warn,yc));
}
