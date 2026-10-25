/* ---------- Boxen: gemeinsame Grundform ----------
   Rechteckige Box mit abgerundeten Ecken (Außenmaße L × B × H), Wand t, Boden tb.
   Optionen o: stack (Fuß zum Stapeln), lid ("steck", "schiebe" oder "einlege", Deckel wird neben die Box gelegt),
   grips (Griffmulden an den Schmalseiten), label (Beschriftungsfeld vorne), fx/fy (Fächer in Länge/Breite). */
const BOX_SPIEL=0.3;     // mm Luft zwischen Teilen, die ineinander passen
const BOX_FUSS=3;        // mm Höhe des Stapelfußes
const BOX_STECK=5;       // mm Höhe des Steckrands am Deckel

const BOX_MASSE={row:[{k:"L",l:"Länge",min:30,max:400},{k:"B",l:"Breite",min:20,max:400},{k:"H",l:"Höhe",min:10,max:300}],l:"Außenmaße der Box"};
const BOX_FAECHER={row:[{k:"fx",l:"Fächer längs",u:"",min:1,max:10,step:1},{k:"fy",l:"Fächer quer",u:"",min:1,max:10,step:1}],l:"Fächer"};
const BOX_WAND=[
  {k:"r",c:"range",l:"Eckenradius",u:"mm",min:0,max:30,step:0.5},
  {k:"t",c:"range",l:"Wandstärke",u:"mm",min:1,max:5,step:0.2},
  {k:"tb",c:"range",l:"Bodenstärke",u:"mm",min:1,max:5,step:0.2}
];

function buildBox(p,o){
  const warn=[], c=BOX_SPIEL, L=p.L, B=p.B, H=p.H, lid=o.lid||"";
  let t=p.t; if(lid==="schiebe"&&t<2){ t=2; warn.push("Wandstärke auf 2 mm erhöht, damit die Nut für den Schiebedeckel Platz hat."); }
  const tb=p.tb, r=Math.max(0,Math.min(p.r,L/2-t-1,B/2-t-1)), cx=L/2, cy=B/2;
  const sh=o.stack?BOX_FUSS:0, z0=sh+tb;                       // Innenboden
  if(H<z0+5){ warn.push(`Die Box ist zu niedrig für Boden${sh?" und Stapelfuß":""}. Mindestens ${mmDE(z0+5)} mm Höhe wählen.`); }
  // Schiebedeckel: vorne (Einschubseite x = 0) eckige Ecken, damit Nut und Deckel dort nicht durch die runde Ecke laufen
  const rEcke=x=>lid==="schiebe"&&x<cx?0:r;
  const shape=(x,y,inset)=>rr2(x,y,cx,cy,L/2-inset,B/2-inset,Math.max(0,rEcke(x)-inset));
  // Stapelbar mit Deckel: Der Deckel liegt so tief, dass über ihm der Fuß der nächsten Box Platz hat
  const frei=o.stack&&lid?BOX_FUSS+0.4:0;
  // Schiebedeckel: Nut in den Längswänden, vorne (x = 0) offen
  // Über der Nut bleiben 0,8 mm volle Wand stehen, die 45°-Schräge darunter endet also nicht in einer scharfen Kante
  const tl=2, gd=Math.min(1.2,t-0.8), zg1=H-gd-0.8-frei, zg0=zg1-tl-c;
  // Einlegedeckel: flache Platte liegt innen auf einem schmalen Absatz (unten 45° schräg, druckt ohne Stützen)
  const tp=Math.max(1.6,t), le=1.5, zl=H-frei-tp;
  // Fächer: Trennwände bis knapp unter den Rand (Platz für Deckelrand oder Stapelfuß der nächsten Box)
  const fx=Math.max(1,Math.round(p.fx||1)), fy=Math.max(1,Math.round(p.fy||1)), td=Math.max(1.2,t*0.75);
  const top=lid==="steck"?H-BOX_STECK-0.5:lid==="schiebe"?zg0-0.5:lid==="einlege"?zl-le-0.5:o.stack?H-sh-0.5:H;
  const xs=[...Array(fx-1)].map((_,i)=>t+(i+1)*(L-2*t)/fx), ys=[...Array(fy-1)].map((_,i)=>t+(i+1)*(B-2*t)/fy);
  // Griffmulde und Beschriftungsfeld
  const gw=Math.min(40,B*0.45), gh=Math.min(14,(H-z0)*0.4), lw=Math.min(60,L*0.5), lh=Math.min(15,(H-z0)*0.3);
  const f=(x,y,z)=>{
    let d = sh ? Math.min(ext(shape(x,y,0),z,sh,H), ext(shape(x,y,t+c),z,0,sh+0.01)) : ext(shape(x,y,0),z,0,H);
    d=Math.max(d,-ext(shape(x,y,t),z,z0,H+5));
    for(const xi of xs) d=Math.min(d,Math.max(box3(x,y,z,xi-td/2,xi+td/2,t-0.5,B-t+0.5,z0-0.5,top),shape(x,y,0)));
    for(const yi of ys) d=Math.min(d,Math.max(box3(x,y,z,t-0.5,L-t+0.5,yi-td/2,yi+td/2,z0-0.5,top),shape(x,y,0)));
    if(lid==="einlege"){ const di=shape(x,y,t); d=Math.min(d,Math.max(-le-di,z-zl,(zl-le-di-z)*0.7071,z0-z,shape(x,y,0))); }
    // Nut mit 45°-Dach: Die Kante über der Nut hängt sonst waagerecht in der Luft und lässt sich nicht sauber drucken
    // Nut folgt hinten der Rundung der Box (sonst läuft sie an den Ecken durch die Außenwand)
    if(lid==="schiebe"){ const dr=shape(x,y,t-gd), di=Math.max(0,shape(x,y,t));
      d=Math.max(d,-Math.max(dr,zg0-z,(z-zg1-gd+di)*0.7071)); d=Math.max(d,-box3(x,y,z,-1,t+0.01,t-gd,B-t+gd,zg0,H+1)); }
    if(o.grips){ const g=ext(rr2(y,z,cy,H,gw/2,gh,Math.min(gw/2,gh)),x,-1,t+1), g2=ext(rr2(y,z,cy,H,gw/2,gh,Math.min(gw/2,gh)),x,L-t-1,L+1); d=Math.max(d,-g,-g2); }
    if(o.label) d=Math.max(d,-box3(x,y,z,cx-lw/2,cx+lw/2,-1,0.6,H-6-lh,H-6));
    return d; };

  // Deckel daneben (in Druckrichtung: Platte unten)
  let lidF=null, bb=[0,L,0,B,0,H];
  if(lid==="steck"){ const ox=L+10, tp=Math.max(1.6,t);
    lidF=(x,y,z)=>{ const X=x-ox; const plate=ext(shape(X,y,0),z,0,tp), ring=ext(Math.max(shape(X,y,t+c),-shape(X,y,2*t+c)),z,tp-0.01,tp+BOX_STECK); return Math.min(plate,ring); };
    bb=[0,2*L+10,0,B,0,H]; }
  if(lid==="schiebe"){ const oy=B+10, lx=L-t+gd-c, ly=B-2*t+2*gd-2*c, th=tl-c;
    // Deckelplatte mit Griffrille vorne
    // Deckel hat hinten dieselbe Rundung wie die Nut, vorne schließt er bündig mit der Box ab
    lidF=(x,y,z)=>{ const Y=y-oy; let d=ext(Math.max(shape(Math.max(x,t-gd+c+0.01),Y,t-gd+c),-x),z,0,th); d=Math.max(d,-box3(x,Y,z,6,9,t+4,t-gd+c+ly-4+0,th-0.6,th+1)); return d; };
    bb=[0,L,0,2*B+10,0,H]; }
  if(lid==="einlege"){ const ox=L+10, gy=t+c+12;
    // Platte mit Griffloch vorne
    lidF=(x,y,z)=>{ const X=x-ox; return Math.max(ext(shape(X,y,t+c),z,0,tp),-(hyp(X-cx,y-gy)-8)); };
    bb=[0,2*L+10,0,B,0,H]; }
  const fAll=lidF?(x,y,z)=>Math.min(f(x,y,z),lidF(x,y,z)):f;
  // Box und Deckel als getrennte Teile, damit jedes für sich fein genug gerechnet wird (dünne Wände bekommen sonst Löcher)
  const teile=[{f,bb:[0,L,0,B,0,H]}];
  if(lid==="steck") teile.push({f:lidF,bb:[L+10,2*L+10,0,B,0,Math.max(1.6,t)+BOX_STECK]});
  if(lid==="schiebe"){ const oy=B+10; teile.push({f:lidF,bb:[0,L-t+gd-c,oy+t-gd+c,oy+B-t+gd-c,0,tl-c]}); }
  if(lid==="einlege") teile.push({f:lidF,bb:[L+10,2*L+10,0,B,0,tp]});
  const minWand=Math.min(t,tb,lid==="schiebe"?tl-c:lid?Math.max(1.6,t):99);
  // Für die Anordnung im Kasten: Box mit geschlossenem Deckel statt Box und Deckel nebeneinander
  let plan={f,bb:[0,L,0,B,0,H]};
  if(lid==="steck"){ const ox=L+10, tp=Math.max(1.6,t); plan={f:(x,y,z)=>Math.min(f(x,y,z),lidF(x+ox,y,H+tp-z)),bb:[0,L,0,B,0,H+tp]}; }
  if(lid==="einlege"){ const ox=L+10; plan={f:(x,y,z)=>Math.min(f(x,y,z),lidF(x+ox,y,z-zl)),bb:[0,L,0,B,0,H]}; }
  if(lid==="schiebe"){ const oy=B+10; plan={f:(x,y,z)=>Math.min(f(x,y,z),lidF(x,y+oy,z-zg0-c)),bb:[0,L,0,B,0,H]}; }

  // Flächen für die Beschriftung: vorne (im vertieften Feld, falls vorhanden), hinten und an den Seiten (dort nicht in Griffmulde oder Deckelschlitz)
  const seiteFrei=[...(o.grips?[{u0:cy-gw/2-1,u1:cy+gw/2+1,z0:H-gh-1,z1:H+1}]:[])], links=[...seiteFrei,...(lid==="schiebe"?[{u0:-1,u1:B+1,z0:zg0-1,z1:H+1}]:[])];
  const schilder={vorne:o.label?{ax:"y",dir:-1,p:0.6,t:t-0.6,u0:cx-lw/2+1.5,u1:cx+lw/2-1.5,z0:H-6-lh+1,z1:H-7}:{ax:"y",dir:-1,p:0,t,u0:r+2,u1:L-r-2,z0:sh+2,z1:H-3},
    hinten:{ax:"y",dir:1,p:B,t,u0:r+2,u1:L-r-2,z0:sh+2,z1:H-3},
    links:{ax:"x",dir:-1,p:0,t,u0:r+2,u1:B-r-2,z0:sh+2,z1:H-3,avoid:links}, rechts:{ax:"x",dir:1,p:L,t,u0:r+2,u1:B-r-2,z0:sh+2,z1:H-3,avoid:seiteFrei}};
  const innen=[L-2*t,B-2*t,H-z0], liter=Math.max(0,innen[0]*innen[1]*innen[2])/1e6;
  return {f:fAll,bb,dims:[L,B,H],printDims:[bb[1]-bb[0],bb[3]-bb[2],bb[5]-bb[4]],scad:`// FILL THE SPACE – Box ${mmDE(L)} × ${mmDE(B)} × ${mmDE(H)} mm`,ghost:[],dir:"Boden unten",warn,plan,teile,minWand,schilder,box:{innen,liter,lid,stack:!!o.stack,t,r}};
}
