/* ---------- Beschriftung: Text und kleines Bild als erhabenes Relief auf einer Fläche des Bauteils ----------
   Text (in der gewählten Schrift) und Bild werden unsichtbar auf eine Zeichenfläche gemalt. Daraus entsteht ein
   Abstandsfeld (wie weit jeder Punkt vom Rand der Buchstaben entfernt ist), so lassen sie sich wie alle anderen Formen
   in ein Dreiecksnetz umrechnen. Erhaben: Das Relief steht 1 mm vor und ragt 0,3 mm ins Bauteil, damit beides fest verbunden ist.
   Eingelegt: Die Schrift füllt eine Vertiefung bündig aus (sichtbar nur zweifarbig). Vertieft: nur eingraviert, kein eigener Körper.
   Die Tiefe ist höchstens 1 mm und lässt hinter der Schrift mindestens 0,8 mm Wand stehen (t = Wandstärke hinter der Fläche).
   Jede Bauteilart gibt in model.schilder die Flächen an, auf denen Platz ist:
   {ax: "y" oder "x" (Richtung der Flächennormalen), dir: +1/−1, p: Lage der Fläche, u0..u1: waagerechter Bereich
    (x bei ax "y", y bei ax "x"), z0..z1: senkrechter Bereich, t: Wandstärke dahinter, avoid: [{u0,u1,z0,z1}] freizuhaltende Stellen, z. B. Schraublöcher} */
const SCHRIFTEN={
  grotesk:{name:"Grotesk", css:"Space Grotesk", w:[400,700]},
  breit:{name:"Breit", css:"Unbounded", w:[400,800]},
  schmal:{name:"Schmal", css:"Bebas Neue", w:[400,400]},
  serif:{name:"Serif", css:"Roboto Slab", w:[400,700]},
  rund:{name:"Rund", css:"Nunito", w:[400,800]}
};
// Felder der Beschriftung; flaechen = mögliche Flächen der jeweiligen Bauteilart
function textFelder(flaechen){
  const an=v=>v.txt;
  return [
    {k:"txt",c:"check",l:"Beschriftung"},
    {k:"text",c:"text",l:"Text",ph:"z. B. Schrauben",max:30,show:an},
    {k:"img",c:"image",l:"Bild",show:an},
    {k:"font",c:"seg",l:"Schriftart",o:Object.entries(SCHRIFTEN).map(([k,s])=>[k,s.name]),oStyle:val=>`"${SCHRIFTEN[val].css}"`,show:an},
    {k:"fett",c:"check",l:"Fett",show:an},
    {k:"kursiv",c:"check",l:"Kursiv",show:an},
    {k:"relief",c:"seg",l:"Art der Schrift",o:[["erhaben","Erhaben"],["eingelegt","Eingelegt"],["vertieft","Vertieft"]],show:an,
      note:v=>v.relief==="eingelegt"?"Die Schrift liegt bündig im Bauteil. Sichtbar wird sie nur zweifarbig: als 3MF speichern und der Beschriftung eine zweite Farbe geben.":v.relief==="vertieft"?"Die Schrift wird bis 1 mm tief eingraviert, gut für einfarbigen Druck.":"Die Schrift steht 1 mm vor."},
    {k:"th",c:"range",l:"Schriftgröße",u:"mm",min:3,max:30,step:0.5,show:an,fmt:x=>`${mmDE(x)} mm (Höhe der Großbuchstaben)`},
    {k:"flaeche",c:"seg",l:"Fläche",o:flaechen,show:an},
    {k:"lage",c:"range",l:"Lage auf der Fläche",u:"mm",min:-40,max:40,step:0.5,show:an,fmt:x=>x>0?`${mmDE(x)} mm höher`:x<0?`${mmDE(-x)} mm tiefer`:"Mitte"}
  ];
}
const TEXT_STANDARD={txt:false,text:"",th:8,font:"grotesk",fett:true,kursiv:false,relief:"erhaben",flaeche:"vorne",lage:0,img:null};
const SCHRIFT_HOCH=1, SCHRIFT_TIEF=0.3;
const schriftCache=new Map(), schriftGeladen=new Set();
// Schrift erst laden, dann rechnen; bis dahin mit einer Ersatzschrift
function schriftLaden(css,w,stil){ const key=`${stil} ${w} ${css}`; if(schriftGeladen.has(key)) return true;
  if(document.fonts&&document.fonts.load&&!schriftGeladen.has("…"+key)){ schriftGeladen.add("…"+key);
    document.fonts.load(`${stil} ${w} 100px "${css}"`).then(()=>{ schriftGeladen.add(key); if(typeof planCache!=="undefined") planCache.clear(); if(typeof schedule==="function") schedule(); },()=>{}); }
  return false; }

/* Quadrierter Abstand jedes Pixels zum nächsten Pixel mit Wert ziel (Verfahren nach Felzenszwalb, erst Spalten, dann Zeilen) */
function abstandsBild(img,W,H,ziel){
  const INF=1e10, n=Math.max(W,H), out=new Float64Array(W*H), f=new Float64Array(n), v=new Int32Array(n), z=new Float64Array(n+1);
  for(let i=0;i<W*H;i++) out[i]=img[i]===ziel?0:INF;
  const pass=(N,get,set)=>{ for(let q=0;q<N;q++) f[q]=get(q);
    let k=0; v[0]=0; z[0]=-INF; z[1]=INF;
    for(let q=1;q<N;q++){ let s=((f[q]+q*q)-(f[v[k]]+v[k]*v[k]))/(2*q-2*v[k]);
      while(s<=z[k]){ k--; s=((f[q]+q*q)-(f[v[k]]+v[k]*v[k]))/(2*q-2*v[k]); }
      k++; v[k]=q; z[k]=s; z[k+1]=INF; }
    k=0; for(let q=0;q<N;q++){ while(z[k+1]<q) k++; set(q,(q-v[k])*(q-v[k])+f[v[k]]); } };
  for(let x=0;x<W;x++) pass(H,q=>out[q*W+x],(q,d)=>{ out[q*W+x]=d; });
  for(let y=0;y<H;y++) pass(W,q=>out[y*W+q],(q,d)=>{ out[y*W+q]=d; });
  return out;
}
/* Abstandsfeld aus einer Schwarz-Weiß-Maske (1 = Relief), Mitte (mx, my) in Pixeln, einheit = Pixel pro Einheit.
   Liefert d(u, v) in Einheiten, Mitte bei (0, 0), v nach oben */
function maskenFeld(ink,W,H,mx,my,einheit){
  const dAus=abstandsBild(ink,W,H,1), dIn=abstandsBild(ink,W,H,0), sd=new Float32Array(W*H);
  for(let i=0;i<W*H;i++) sd[i]=(ink[i]?-(Math.sqrt(dIn[i])-0.5):Math.sqrt(dAus[i])-0.5)/einheit;
  return (u,v)=>{ const X=mx+u*einheit, Y=my-v*einheit, cx=Math.max(0,Math.min(W-1.001,X)), cy=Math.max(0,Math.min(H-1.001,Y));
    const i=Math.floor(cx), j=Math.floor(cy), a=cx-i, b=cy-j, o=j*W+i;
    return (sd[o]*(1-a)+sd[o+1]*a)*(1-b)+(sd[o+W]*(1-a)+sd[o+W+1]*a)*b+hyp(X-cx,Y-cy)/einheit; };
}

/* Text: Einheit = Höhe eines Großbuchstabens „H“. Liefert {w, h, d} */
function schriftFeld(str,font,fett,kursiv){
  const S=SCHRIFTEN[font]||SCHRIFTEN.grotesk, w=fett?S.w[1]:S.w[0], stil=kursiv?"italic":"normal", bereit=schriftLaden(S.css,w,stil);
  const key=[str,font,fett,kursiv].join("|"); let e=schriftCache.get(key); if(e&&e.bereit===bereit) return e;
  const c=document.createElement("canvas").getContext("2d"), px=140, css=`${stil} ${w} ${px}px "${S.css}", Arial, sans-serif`;
  c.font=css; const cap=c.measureText("H").actualBoundingBoxAscent||px*0.7, m=c.measureText(str), pad=14;
  const L=Math.ceil(m.actualBoundingBoxLeft||0), R=Math.ceil(m.actualBoundingBoxRight||m.width), A=Math.ceil(m.actualBoundingBoxAscent||cap), D=Math.ceil(m.actualBoundingBoxDescent||0);
  const W=Math.max(1,L+R)+2*pad, H=A+D+2*pad; c.canvas.width=W; c.canvas.height=H;
  c.font=css; c.fillStyle="#000"; c.textBaseline="alphabetic"; c.fillText(str,pad+L,pad+A);
  const p=c.getImageData(0,0,W,H).data, ink=new Uint8Array(W*H); for(let i=0;i<W*H;i++) ink[i]=p[4*i+3]>=128?1:0;
  e={w:(L+R)/cap, h:(A+D)/cap, d:maskenFeld(ink,W,H,pad+(L+R)/2,pad+(A+D)/2,cap), bereit}; schriftCache.set(key,e); return e;
}

/* Bild: Maske {w, h, b} (b = Bits als Base64), Einheit = Bildhöhe. Liefert {w, h: 1, d} */
function bildFeld(img){
  const key="bild|"+img.b; let e=schriftCache.get(key); if(e) return e;
  const bin=atob(img.b), pad=6, W=img.w+2*pad, H=img.h+2*pad, ink=new Uint8Array(W*H);
  for(let y=0;y<img.h;y++) for(let x=0;x<img.w;x++){ const i=y*img.w+x; if(bin.charCodeAt(i>>3)&(128>>(i&7))) ink[(y+pad)*W+x+pad]=1; }
  e={w:img.w/img.h, h:1, d:maskenFeld(ink,W,H,pad+img.w/2,pad+img.h/2,img.h)}; schriftCache.set(key,e); return e;
}
/* Hochgeladenes Bild (GIF, PNG …) in eine Schwarz-Weiß-Maske umwandeln: dunkle, nicht durchsichtige Pixel werden zum Relief.
   Bei GIF-Animationen zählt das erste Bild. Höchstens 200 Pixel, auf den Inhalt zugeschnitten. */
async function bildMaske(file){
  const url=URL.createObjectURL(file), im=new Image();
  try{ await new Promise((ok,err)=>{ im.onload=ok; im.onerror=err; im.src=url; }); } finally{ URL.revokeObjectURL(url); }
  const s=200/Math.max(im.width,im.height), W=Math.max(1,Math.round(im.width*s)), H=Math.max(1,Math.round(im.height*s));
  const c=document.createElement("canvas").getContext("2d"); c.canvas.width=W; c.canvas.height=H; c.drawImage(im,0,0,W,H);
  const p=c.getImageData(0,0,W,H).data, ink=new Uint8Array(W*H); let n=0;
  for(let i=0;i<W*H;i++){ const a=p[4*i+3], lum=0.3*p[4*i]+0.59*p[4*i+1]+0.11*p[4*i+2]; if(a>=128&&lum<140){ ink[i]=1; n++; } }
  // Ganz ohne dunkle Pixel (z. B. weißes Motiv auf Durchsichtigem): alles Nicht-Durchsichtige nehmen
  if(n===0) for(let i=0;i<W*H;i++) if(p[4*i+3]>=128){ ink[i]=1; n++; }
  if(n===0) return null;
  let x0=W,x1=-1,y0=H,y1=-1; for(let y=0;y<H;y++) for(let x=0;x<W;x++) if(ink[y*W+x]){ x0=Math.min(x0,x); x1=Math.max(x1,x); y0=Math.min(y0,y); y1=Math.max(y1,y); }
  const w=x1-x0+1, h=y1-y0+1, bytes=new Uint8Array(Math.ceil(w*h/8));
  for(let y=0;y<h;y++) for(let x=0;x<w;x++) if(ink[(y+y0)*W+x+x0]){ const i=y*w+x; bytes[i>>3]|=128>>(i&7); }
  let b=""; for(const v of bytes) b+=String.fromCharCode(v);
  return {w,h,b:btoa(b)};
}

/* Text und Bild auf die gewählte Fläche setzen: kleiner, wenn es nicht passt; Lage höher/tiefer; Schraublöchern ausweichen.
   Legt model.text = {f, bb, th} an (eigener Körper, damit er in 3MF eine eigene Farbe bekommen kann). */
function schriftModel(model,p,warn){
  const str=(p.text||"").trim(), img=p.img&&p.img.b?p.img:null; if(!p.txt||(!str&&!img)) return;
  const all=model.schilder||{}, S=all[p.flaeche]||null;
  if(!S){ warn.push(all[p.flaeche]===null?"Auf dieser Fläche ist hier kein Platz für die Beschriftung, z. B. weil der Schlitz die Kante teilt. Eine andere Fläche wählen.":"Bei dieser Form gibt es keinen Platz für eine Beschriftung."); return; }
  // Teile nebeneinander, in Vielfachen der Schriftgröße: Bild 1,4 hoch, dann Abstand, dann Text
  const T=str?schriftFeld(str,p.font,p.fett,p.kursiv):null, B=img?bildFeld(img):null, bh=1.4, gap=T&&B?0.35:0;
  const wB=B?B.w*bh:0, wT=T?T.w:0, wAll=wB+gap+wT, hAll=Math.max(B?bh:0,T?T.h:0);
  const fw=S.u1-S.u0, fh=S.z1-S.z0, maxTh=Math.floor(2*Math.min(fh/hAll,fw/wAll))/2;
  let th=p.th;
  if(th>maxTh){ if(maxTh<3){ warn.push("Für die Beschriftung ist auf dieser Fläche zu wenig Platz. Text kürzen, eine andere Fläche wählen oder das Bauteil größer machen."); return; }
    th=maxTh; warn.push(`Schriftgröße auf ${mmDE(th)} mm verkleinert, damit die Beschriftung auf die Fläche passt.`); }
  const tw=wAll*th, thh=hAll*th, uc=(S.u0+S.u1)/2, zmin=S.z0+thh/2, zmax=S.z1-thh/2;
  let zc=Math.max(zmin,Math.min(zmax,(S.z0+S.z1)/2+(+p.lage||0)));
  // Freizuhaltenden Stellen ausweichen: nächstgelegene freie Höhe
  const frei=z=>!(S.avoid||[]).some(a=>a.u0<uc+tw/2&&a.u1>uc-tw/2&&a.z0<z+thh/2&&a.z1>z-thh/2);
  if(!frei(zc)){ let best=null; for(let z=zmax;z>=zmin-1e-6;z-=0.5) if(frei(z)&&(best==null||Math.abs(z-zc)<Math.abs(best-zc))) best=z;
    if(best==null){ warn.push("Auf dieser Fläche ist neben den Schraublöchern kein Platz für die Beschriftung. Schrift kleiner, eine andere Fläche wählen oder die Rückwand größer machen."); return; }
    zc=best; }
  const uB=-wAll/2+wB/2, uT=-wAll/2+wB+gap+wT/2;
  const e2=(u,v)=>{ let d=1e9; if(B) d=B.d((u-uB)/bh,v/bh)*bh; if(T) d=Math.min(d,T.d(u-uT,v)); return d; };
  // Von vorne gelesen: rechts ist bei einer Fläche nach +y die −x-Richtung, nach −y +x, nach +x +y, nach −x −y
  const sgn=S.ax==="y"?-S.dir:S.dir, P=S.p, dir=S.dir, art=p.relief||"erhaben";
  // Abstand in der Fläche (mm) und Abstand vor der Fläche (positiv = nach außen)
  const lage=S.ax==="y" ? (x,y,z)=>[e2(sgn*(x-uc)/th,(z-zc)/th)*th,dir*(y-P)] : (x,y,z)=>[e2(sgn*(y-uc)/th,(z-zc)/th)*th,dir*(x-P)];
  const dep=Math.min(1,(S.t??2)-0.8);
  if(art!=="erhaben"&&dep<0.4){ warn.push("Die Wand ist hier zu dünn, um die Schrift einzulassen. „Erhaben“ wählen oder die Wand dicker machen."); return; }
  const lo=art==="erhaben"?-SCHRIFT_TIEF:-dep, hi=art==="erhaben"?SCHRIFT_HOCH:0;
  const f=(x,y,z)=>{ const [d,s]=lage(x,y,z); return ext(d,s,lo,hi); };
  const n0=dir>0?P+lo:P-hi, n1=dir>0?P+hi:P-lo, a0=uc-tw/2-0.5, a1=uc+tw/2+0.5, z0=zc-thh/2-0.5, z1=zc+thh/2+0.5;
  const bb=S.ax==="y"?[a0,a1,n0,n1,z0,z1]:[n0,n1,a0,a1,z0,z1];
  // Eingelegt und vertieft: Vertiefung aus dem Bauteil schneiden (außerhalb des Schriftbereichs nichts rechnen)
  if(art!=="erhaben"){ const c0=dir>0?P-dep:P-1, c1=dir>0?P+1:P+dep, cb=S.ax==="y"?[a0,a1,c0,c1,z0,z1]:[c0,c1,a0,a1,z0,z1];
    const cut=(x,y,z)=>{ if(x<cb[0]||x>cb[1]||y<cb[2]||y>cb[3]||z<cb[4]||z>cb[5]) return 1e3; const [d,s]=lage(x,y,z); return ext(d,s,-dep,1); };
    model.schnitt=th;   // Export rechnet dann feiner, damit die eingelassene Schrift scharf bleibt
    const f0=model.f; model.f=(x,y,z)=>Math.max(f0(x,y,z),-cut(x,y,z));
    if(model.plan){ const g0=model.plan.f; model.plan={...model.plan,f:(x,y,z)=>Math.max(g0(x,y,z),-cut(x,y,z))}; } }
  // Vertieft: kein eigener Körper; in der Vorschau trotzdem dunkel zeigen, damit man die Schrift sieht
  if(art==="vertieft") model.textPreview={f,th,bb}; else model.text={f,th,bb};
}
