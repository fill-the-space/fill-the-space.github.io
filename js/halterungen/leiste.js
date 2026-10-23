HALTERUNGEN.leiste = {
  name:"Leiste",
  hint:"Mehrere Löcher nebeneinander. Werkzeug hängt durch, Kosmetik steht in Sacklöchern.",
  defaults:{n:6,d:9,a:34,wd:26,blind:false,depth:20,P:6,Hp:45,s:0.5,holes:true},
  fields:[
    {row:[{k:"n",l:"Anzahl",min:1,max:20,step:1},{k:"d",l:"Loch-Ø",min:3,max:60},{k:"a",l:"Abstand",min:6,max:100}]},
    {row:[{k:"wd",l:"Wandabstand",min:6,max:100},{k:"Hp",l:"Plattenhöhe",min:25,max:150},{k:"P",l:"Stärke",min:4,max:12}]},
    {k:"blind",c:"check",l:"Sacklöcher (Teile stehen darin)"},
    {k:"depth",c:"range",l:"Lochtiefe",u:"mm",min:5,max:60,step:1,show:v=>v.blind},
    {k:"s",c:"range",l:"Spiel pro Seite",u:"mm",min:0,max:2,step:0.1},
    {k:"holes",c:"check",l:"Schraublöcher mit Senkung"}
  ],
  build:p=>buildLeiste(p)
};

/* ---------- Leiste mit Löchern ---------- */
function buildLeiste(p){
  const warn=[]; const s=p.s, P=Math.max(4,p.P), n=Math.max(1,Math.round(p.n)), r=p.d/2+s;
  let a=p.a, wd=p.wd;
  if(a<p.d+2*s+3){a=p.d+2*s+3;warn.push(`Lochabstand auf ${f2(a)} mm erhöht, damit Stege zwischen den Löchern bleiben.`);}
  if(wd<P+r+2){wd=P+r+2;warn.push(`Wandabstand auf ${f2(wd)} mm erhöht.`);}
  const th= p.blind ? p.depth+3 : P;
  let Hp=p.Hp; if(Hp<th+25){Hp=th+25;warn.push(`Plattenhöhe auf ${f2(Hp)} mm erhöht.`);}
  const margin=Math.max(a/2, r+P+6), W=(n-1)*a+2*margin;
  const rim=Math.max(6,P), Dp=wd+r+rim, z0=Hp-th;
  const xs=[...Array(n)].map((_,i)=>margin+i*a);
  const Dg=Dp*0.8, Hg=Math.min(Hp-th,Dp*0.8), gx=[2,W-2-P], tri=[[0,z0],[Dg,z0],[0,z0-Hg]];
  const hz=(Hp-th)*0.45, hx=[W*0.25,W*0.75];
  const hz0 = p.blind ? Hp-p.depth : z0-5;
  const f=(x,y,z)=>{
    let d=box3(x,y,z,0,W,0,P,0,Hp);
    d=Math.min(d,ext(Math.max(rr2(x,y,W/2,(Dp-6)/2,W/2,(Dp+6)/2,6),-y),z,z0,Hp));
    if(Hg>4) for(const g of gx) d=Math.min(d,ext(poly2(y,z,tri),x,g,g+P));
    // nächstes Loch genügt
    const i=Math.max(0,Math.min(n-1,Math.round((x-margin)/a)));
    d=Math.max(d,-ext(hyp(x-xs[i],y-wd)-r,z,hz0,Hp+5));
    if(p.holes) for(const h of hx) d=Math.max(d,-screw(x,y,z,h,hz,-5,P+5,P));
    return d; };
  const S=[`// Halterungs-Generator – Leiste mit ${n} ${p.blind?"Sacklöchern":"Löchern"}`,`$fn = 64;`,
    `W = ${f2(W)}; Dp = ${f2(Dp)}; P = ${f2(P)}; Hp = ${f2(Hp)}; dicke = ${f2(th)};`,`loch = ${f2(2*r)}; abstand = ${f2(a)}; rand = ${f2(margin)}; wandabstand = ${f2(wd)};`,``,
    `module leiste2d() { hull() { square([W, 1]); translate([6, Dp - 6]) circle(6); translate([W - 6, Dp - 6]) circle(6); } }`,
    `module stuetze() { rotate([90, 0, 90]) linear_extrude(P) polygon([[0, Hp - dicke], [${f2(Dg)}, Hp - dicke], [0, Hp - dicke - ${f2(Hg)}]]); }`,``,
    `difference() {`,`  union() {`,`    cube([W, P, Hp]);`,`    translate([0, 0, Hp - dicke]) linear_extrude(dicke) leiste2d();`,
    ...(Hg>4?gx.map(g=>`    translate([${f2(g)}, 0, 0]) stuetze();`):[]),`  }`,
    `  for (i = [0 : ${n-1}]) translate([rand + i*abstand, wandabstand, ${f2(hz0)}]) cylinder(d = loch, h = ${f2(Hp-hz0+5)});`];
  if(p.holes) hx.forEach(h=>S.push(`  translate([${f2(h)}, -1, ${f2(hz)}]) rotate([-90, 0, 0]) cylinder(d = 4.5, h = P + 2);`,
    `  translate([${f2(h)}, P - 2.2, ${f2(hz)}]) rotate([-90, 0, 0]) cylinder(d1 = 4.5, d2 = 9, h = 2.21);`));
  S.push(`}`);
  const ghost=[];
  xs.forEach(x=>{ if(p.blind) ghost.push({k:"cyl",x,y:wd,r:p.d/2,z0:hz0,z1:hz0+80});
    else ghost.push({k:"cyl",x,y:wd,r:p.d/2*0.55,z0:Hp-100,z1:Hp},{k:"cyl",x,y:wd,r:Math.min(a*0.42,p.d*1.5),z0:Hp+2,z1:Hp+95}); });
  return {f,bb:[0,W,0,Dp,0,Hp],dims:[W,Dp,Hp],scad:S.join("\n"),ghost,dir:"Rückwand unten",warn};
}
