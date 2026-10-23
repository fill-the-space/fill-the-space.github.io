HALTERUNGEN.individuell = {
  name:"Individuell",
  hint:"Foto vom Bauteil hochladen. Die App erkennt, wo es aufliegen kann, und baut eine einfache Halterung zum Einhängen oder Hineinstellen. Heiße Bauteile besser in PETG oder ASA drucken, PLA wird ab etwa 60 °C weich.",
  defaults:{mode:"auto",insert:"vorne",refAxis:"w",ref:230,T:48,P:5,fill:60,lip:15,t:2.4,s:1,sens:60,rot:0,...SCHRAUB_STANDARD,mass:500},
  fields:[
    {k:"mode",c:"seg",l:"Haltart",o:[["auto","Automatisch"],["haengen","Einhängen"],["stellen","Hineinstellen"]]},
    {k:"insert",c:"seg",l:"Einsetzen",o:[["vorne","Von vorne"],["oben","Von oben"]],show:()=>effMode==="haengen"},
    {k:"refAxis",c:"seg",l:"Bekanntes Maß am Bauteil",o:[["w","Länge links–rechts"],["h","Höhe oben–unten"]]},
    {row:[{k:"ref",l:"Länge",min:20,max:600,lab:v=>v.refAxis==="h"?"Höhe":"Länge"},{k:"T",l:"Dicke",min:5,max:150},{k:"P",l:"Stärke",min:3,max:10,show:()=>effMode==="haengen"}]},
    {k:"fill",c:"range",l:"Höhe der Schale",u:"mm",min:10,max:300,step:1,show:()=>effMode==="stellen"},
    {k:"lip",c:"range",l:"Lippe vorne",u:"mm",min:4,max:80,step:1,show:()=>effMode==="stellen"},
    {k:"t",c:"range",l:"Wandstärke",u:"mm",min:1.6,max:4,step:0.2,show:()=>effMode==="stellen"},
    {k:"s",c:"range",l:"Spiel pro Seite",u:"mm",min:0,max:3,step:0.1},
    {k:"sens",c:"range",l:"Erkennungsschwelle",u:"",min:10,max:150,step:1,fmt:x=>`${x} · ${x<40?"niedrig":x<90?"mittel":"hoch"}`},
    ...SCHRAUB_FELDER
  ],
  build:(p,o)=>buildIndividuell(p,o.seg)
};

/* ---------- Individuell: einfache Halterung aus Foto ---------- */
function buildIndividuell(p,seg){
  const g=silGrid(p,seg), warn=[], s=p.s, T=p.T;
  const sh=findShoulder(g);
  let mode = p.mode==="stellen" ? "stellen" : sh ? "haengen" : "stellen";
  if(p.mode==="haengen"&&!sh) warn.push("Keine Auflagekante erkannt. Das Bauteil wird deshalb in eine Schale gestellt.");
  const ghostOf=(dx,dy,dz)=>({k:"sdf",f:(X,y,Z)=>ext(g.sample(X-dx,Z-dz),y,dy,dy+T),bb:[g.xL+dx,g.xR+dx,dy,dy+T,g.zLow+dz,g.zHigh+dz],z0:g.zLow+dz});
  const info={silW:g.silW,silH:g.silH};

  if(mode==="stellen"){
    const zFill=g.zLow+Math.min(p.fill,g.zHigh-g.zLow), [q0,q1]=hullBelow(g,zFill);
    const m=buildKoecher({shape:"abgerundet",B:q1-q0,T,H:g.zHigh-g.zLow,r:4,hs:p.fill,low:true,lip:p.lip,t:p.t,s,holes:p.holes,sd:p.sd,sn:p.sn,mount:p.mount,mass:p.mass,door:p.door,hookL:p.hookL,hookT:p.hookT,slot:false});
    m.ghost=[ghostOf(p.t+s-q0,p.t+s,p.t-g.zLow)];
    m.scad=m.scad.replace("Köcher (abgerundet)","Individuell, Schale zum Hineinstellen");
    m.warn=warn.concat(m.warn); m.mode="stellen";
    m.info={...info,lineRowPx:g.rowPx(zFill),text:`Keine Auflagekante nötig: Das Bauteil steht in einer Schale, ${Math.round(q1-q0)} mm breit und ${Math.round(zFill-g.zLow)} mm hoch.`};
    if(sh&&p.mode==="stellen") m.info.text=`Hineinstellen gewählt. Die Schale ist ${Math.round(q1-q0)} mm breit und ${Math.round(zFill-g.zLow)} mm hoch.`;
    return m;
  }

  // Einhängen: Konsole mit Schlitz für den schmalen Teil, die breite Stelle liegt auf
  const sc=screwSpec(p), P=Math.max(3,p.P,p.holes?screwWall(sc):0), front=p.insert!=="oben";
  if(P>Math.max(3,p.P)) warn.push(`Stärke auf ${mmDE(P)} mm erhöht, damit der Senkkopf ganz in der Rückwand verschwindet.`);
  const nw=sh.n1-sh.n0+2*s, supL=Math.min(sh.availL,30), supR=Math.min(sh.availR,30);
  if(Math.min(supL,supR)<3) warn.push("Das Bauteil liegt nur auf einer Seite auf und kann kippen. Prüfe, ob der Schwerpunkt über der Auflage liegt.");
  const armL=Math.max(supL,P+12), armR=Math.max(supR,P+12), W=armL+nw+armR;
  const rim=6, D=P+T+2*s+rim, th=Math.max(4,P), Hp=th+Math.max(40,p.holes?screwMinPlate(sc):0), ridge=front?4:0;
  const sx0=armL, sx1=armL+nw, sy0=P, sy1=front?D+6:D-rim;
  const Dg=D*0.75, Hg=Math.min(Hp-th,D*0.75), gx=[2,W-2-P], tri=[[0,Hp-th],[Dg,Hp-th],[0,Hp-th-Hg]];
  const plan=screwPlan(p,sc,0,W,0,Hp-th,warn), holes=plan.pts;
  const slot2=(x,y)=>rr2(x,y,(sx0+sx1)/2,(sy0+sy1)/2,(sx1-sx0)/2,(sy1-sy0)/2,front?0:Math.min(4,nw/2));
  const f=(x,y,z)=>{
    let d=box3(x,y,z,0,W,0,P,0,Hp);
    d=Math.min(d,ext(Math.max(Math.max(rr2(x,y,W/2,(D-6)/2,W/2,(D+6)/2,6),-y),-slot2(x,y)),z,Hp-th,Hp));
    if(front){ d=Math.min(d,box3(x,y,z,1,sx0,D-4,D,Hp-0.01,Hp+ridge), box3(x,y,z,sx1,W-1,D-4,D,Hp-0.01,Hp+ridge)); }
    for(const gg of gx) d=Math.min(d,ext(poly2(y,z,tri),x,gg,gg+P));
    d=screwCut(d,x,y,z,holes,sc,-5,P+5,P);
    return d; };
  const S=[`// FILL THE SPACE – Individuell, zum Einhängen (${front?"von vorne":"von oben"})`,`$fn = 64;`,
    `W = ${f2(W)}; D = ${f2(D)}; P = ${f2(P)}; dicke = ${f2(th)}; Hp = ${f2(Hp)};`,`// Schlitz für den schmalen Teil des Bauteils inkl. Spiel`,
    `sx0 = ${f2(sx0)}; sx1 = ${f2(sx1)}; sy0 = ${f2(sy0)}; sy1 = ${f2(sy1)};`,``,
    `module konsole2d() { hull() { square([W, 1]); translate([6, D - 6]) circle(6); translate([W - 6, D - 6]) circle(6); } }`,
    front ? `module schlitz2d() { translate([sx0, sy0]) square([sx1 - sx0, sy1 - sy0]); }`
          : `module schlitz2d() { r = ${f2(Math.min(4,nw/2))}; translate([sx0 + r, sy0 + r]) offset(r = r) square([sx1 - sx0 - 2*r, sy1 - sy0 - 2*r]); }`,
    `module stuetze() { rotate([90, 0, 90]) linear_extrude(P) polygon([[0, Hp - dicke], [${f2(Dg)}, Hp - dicke], [0, Hp - dicke - ${f2(Hg)}]]); }`,``,
    `difference() {`,`  union() {`,`    cube([W, P, Hp]);`,`    translate([0, 0, Hp - dicke]) linear_extrude(dicke) difference() { konsole2d(); schlitz2d(); }`,
    ...(front?[`    // Kante vorne, damit das Bauteil nicht nach vorne rutscht`,`    translate([1, D - 4, Hp - 0.01]) cube([sx0 - 1, 4, ${ridge}]);`,`    translate([sx1, D - 4, Hp - 0.01]) cube([W - 1 - sx1, 4, ${ridge}]);`]:[]),
    ...gx.map(gg=>`    translate([${f2(gg)}, 0, 0]) stuetze();`),`  }`];
  S.push(...screwSCAD(holes,sc,"P + 2","P"));
  S.push(`}`);
  return mountApply({f,bb:[0,W,0,D,0,Hp+ridge],dims:[W,D,Hp+ridge],scad:S.join("\n"),dir:"Rückwand unten",warn,mode:"haengen",screw:plan,arm:P+s+T/2,beam:{Wsec:2*P*Hg*Hg/6,name:"Die Ablage",tipp:"Stärke erhöhen."},
    ghost:[ghostOf(armL+s-sh.n0,P+s,Hp-sh.zS)],
    info:{...info,lineRowPx:g.rowPx(sh.zS),text:`Auflagekante ${Math.round(sh.zS-g.zLow)} mm über dem unteren Ende erkannt. Der schmale Teil darunter ist ${Math.round(sh.n1-sh.n0)} mm breit und hängt durch den Schlitz.`}},mountParts(p,0,W,Hp,P,warn,P+s+T/2));
}
