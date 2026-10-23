HALTERUNGEN.leiste = {
  name:"Leiste",
  hint:"Mehrere Löcher nebeneinander. Die Bauteile hängen durch die Löcher oder stehen in Sacklöchern, z. B. Schraubendreher oder Lippenstifte.",
  defaults:{n:6,d:9,a:34,wd:26,blind:false,depth:20,P:6,Hp:45,s:0.5,...SCHRAUB_STANDARD,...TEXT_STANDARD,mass:400,hookT:6},
  fields:[
    {row:[{k:"n",l:"Anzahl",u:"",min:1,max:20,step:1},{k:"d",l:"Loch-Ø",min:3,max:60},{k:"a",l:"Abstand",min:6,max:100}]},
    {row:[{k:"wd",l:"Wandabstand",min:6,max:100},{k:"Hp",l:"Plattenhöhe",min:25,max:150},{k:"P",l:"Stärke",min:4,max:12}]},
    {k:"blind",c:"check",l:"Sacklöcher (Bauteile stehen darin)"},
    {k:"depth",c:"range",l:"Lochtiefe",u:"mm",min:5,max:60,step:1,show:v=>v.blind},
    {k:"s",c:"range",l:"Spiel pro Seite",u:"mm",min:0,max:2,step:0.1},
    ...textFelder([["vorne","Rückwand"],["kante","Leistenkante"]]),
    ...SCHRAUB_FELDER
  ],
  wall:"P",   // Hakenstärke des Türhakens folgt der Stärke
  build:p=>buildLeiste(p)
};

/* ---------- Leiste mit Löchern ---------- */
function buildLeiste(p){
  const warn=[], sc=screwSpec(p); const s=p.s, P=Math.max(4,p.P,p.holes?screwWall(sc):0), n=Math.max(1,Math.round(p.n)), r=p.d/2+s;
  if(P>Math.max(4,p.P)) warn.push(`Stärke auf ${mmDE(P)} mm erhöht, damit der Senkkopf ganz in der Rückwand verschwindet.`);
  let a=p.a, wd=p.wd;
  if(a<p.d+2*s+3){a=p.d+2*s+3;warn.push(`Lochabstand auf ${f2(a)} mm erhöht, damit Stege zwischen den Löchern bleiben.`);}
  if(wd<P+r+2){wd=P+r+2;warn.push(`Wandabstand auf ${f2(wd)} mm erhöht.`);}
  const th= p.blind ? p.depth+3 : P;
  const margin=Math.max(a/2, r+P+6), W=(n-1)*a+2*margin;
  // Platte nur für Schrauben erhöhen, wenn sie auch in der Breite Platz haben
  const forScrews=p.holes&&W>=screwMinPlate(sc), hMin=Math.max(25,forScrews?screwMinPlate(sc):0);
  let Hp=p.Hp; if(Hp<th+hMin){Hp=th+hMin;warn.push(`Plattenhöhe auf ${mmDE(Hp)} mm erhöht${forScrews?`, damit die Schrauben ${RAND} mm Abstand zum Rand haben`:""}.`);}
  const rim=Math.max(6,P), Dp=wd+r+rim, z0=Hp-th;
  const xs=[...Array(n)].map((_,i)=>margin+i*a);
  const Dg=Dp*0.8, Hg=Math.min(Hp-th,Dp*0.8), gx=[2,W-2-P], tri=[[0,z0],[Dg,z0],[0,z0-Hg]];
  const plan=screwPlan(p,sc,0,W,0,Hp-th,warn), holes=plan.pts;
  const hz0 = p.blind ? Hp-p.depth : z0-5;
  const f=(x,y,z)=>{
    let d=box3(x,y,z,0,W,0,P,0,Hp);
    d=Math.min(d,ext(Math.max(rr2(x,y,W/2,(Dp-6)/2,W/2,(Dp+6)/2,6),-y),z,z0,Hp));
    if(Hg>4) for(const g of gx) d=Math.min(d,ext(poly2(y,z,tri),x,g,g+P));
    // nächstes Loch genügt
    const i=Math.max(0,Math.min(n-1,Math.round((x-margin)/a)));
    d=Math.max(d,-ext(hyp(x-xs[i],y-wd)-r,z,hz0,Hp+5));
    d=screwCut(d,x,y,z,holes,sc,-5,P+5,P);
    return d; };
  const S=[`// FILL THE SPACE – Leiste mit ${n} ${p.blind?"Sacklöchern":"Löchern"}`,`$fn = 64;`,
    `W = ${f2(W)}; Dp = ${f2(Dp)}; P = ${f2(P)}; Hp = ${f2(Hp)}; dicke = ${f2(th)};`,`loch = ${f2(2*r)}; abstand = ${f2(a)}; rand = ${f2(margin)}; wandabstand = ${f2(wd)};`,``,
    `module leiste2d() { hull() { square([W, 1]); translate([6, Dp - 6]) circle(6); translate([W - 6, Dp - 6]) circle(6); } }`,
    `module stuetze() { rotate([90, 0, 90]) linear_extrude(P) polygon([[0, Hp - dicke], [${f2(Dg)}, Hp - dicke], [0, Hp - dicke - ${f2(Hg)}]]); }`,``,
    `difference() {`,`  union() {`,`    cube([W, P, Hp]);`,`    translate([0, 0, Hp - dicke]) linear_extrude(dicke) leiste2d();`,
    ...(Hg>4?gx.map(g=>`    translate([${f2(g)}, 0, 0]) stuetze();`):[]),`  }`,
    `  for (i = [0 : ${n-1}]) translate([rand + i*abstand, wandabstand, ${f2(hz0)}]) cylinder(d = loch, h = ${f2(Hp-hz0+5)});`];
  S.push(...screwSCAD(holes,sc,"P + 2","P"));
  S.push(`}`);
  const ghost=[];
  xs.forEach(x=>{ if(p.blind) ghost.push({k:"cyl",x,y:wd,r:p.d/2,z0:hz0,z1:hz0+80});
    else ghost.push({k:"cyl",x,y:wd,r:p.d/2*0.55,z0:Hp-100,z1:Hp},{k:"cyl",x,y:wd,r:Math.min(a*0.42,p.d*1.5),z0:Hp+2,z1:Hp+95}); });
  // Flächen für die Beschriftung: vorne auf der Rückwand unter der Leiste (neben den Schraublöchern) oder auf der Vorderkante
  const schilder={vorne:{ax:"y",dir:1,p:P,t:P,u0:(Hg>4?2+P:0)+2,u1:W-(Hg>4?2+P:0)-2,z0:2,z1:z0-2,avoid:holes.map(([x,z])=>({u0:x-sc.dk/2-1.5,u1:x+sc.dk/2+1.5,z0:z-sc.dk/2-1.5,z1:z+sc.dk/2+1.5}))},
    kante:{ax:"y",dir:1,p:Dp,t:3,u0:8,u1:W-8,z0:z0+0.8,z1:Hp-0.8}};
  return mountApply({f,bb:[0,W,0,Dp,0,Hp],dims:[W,Dp,Hp],scad:S.join("\n"),ghost,dir:"Rückwand unten",warn,screw:plan,arm:wd,schilder,beam:{Wsec:W*th*th/6+(Hg>4?2*P*Hg*Hg/6:0),name:"Die Leiste",tipp:"Stärke oder Plattenhöhe erhöhen oder den Wandabstand verringern."}},mountParts(p,0,W,Hp,P,warn,wd));
}
