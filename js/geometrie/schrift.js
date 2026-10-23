/* ---------- Beschriftung: Text als erhabene Schrift auf einer Fläche des Bauteils ----------
   Der Text wird in der Schrift der App (Space Grotesk, fett) auf eine unsichtbare Zeichenfläche gemalt. Daraus entsteht ein
   Abstandsfeld (wie weit jeder Punkt vom Rand der Buchstaben entfernt ist), so lässt sich die Schrift wie alle anderen Formen
   in ein Dreiecksnetz umrechnen. Die Schrift steht 1 mm vor und ragt 0,3 mm ins Bauteil, damit beides fest verbunden ist.
   Jede Bauteilart gibt in model.schild die Fläche an, auf der Platz ist:
   {y, dir (+1 = Fläche schaut nach +y, −1 = nach −y), x0, x1, z0, z1, avoid: [[x, z, r], …] Schraublöcher} */
const TEXT_FELDER=[
  {k:"txt",c:"check",l:"Beschriftung"},
  {k:"text",c:"text",l:"Text",ph:"z. B. Schrauben",max:30,show:v=>v.txt},
  {k:"th",c:"range",l:"Schrifthöhe",u:"mm",min:3,max:30,step:0.5,show:v=>v.txt}
];
const TEXT_STANDARD={txt:false,text:"",th:8};
const SCHRIFT_HOCH=1, SCHRIFT_TIEF=0.3, SCHRIFT="Space Grotesk";
const schriftCache=new Map();
// Erst rechnen, wenn die Schrift geladen ist; danach einmal neu zeichnen
let schriftBereit=false;
if(document.fonts&&document.fonts.load) document.fonts.load(`700 100px "${SCHRIFT}"`).then(()=>{ schriftBereit=true; schriftCache.clear(); if(typeof planCache!=="undefined") planCache.clear(); if(typeof schedule==="function") schedule(); },()=>{});

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

/* Abstandsfeld eines Texts in Einheiten der Großbuchstabenhöhe (1 = Höhe eines „H“), Mitte des Texts bei (0, 0).
   Liefert {w, h, d(u, v)}: Breite und Höhe des Texts, Abstand (negativ = in einem Buchstaben) */
function schriftFeld(str){
  let e=schriftCache.get(str); if(e) return e;
  const c=document.createElement("canvas").getContext("2d"), S=140, font=`700 ${S}px "${SCHRIFT}", Arial, sans-serif`;
  c.font=font; const cap=c.measureText("H").actualBoundingBoxAscent||S*0.7, m=c.measureText(str), pad=12;
  const L=Math.ceil(m.actualBoundingBoxLeft||0), R=Math.ceil(m.actualBoundingBoxRight||m.width), A=Math.ceil(m.actualBoundingBoxAscent||cap), D=Math.ceil(m.actualBoundingBoxDescent||0);
  const W=Math.max(1,L+R)+2*pad, H=A+D+2*pad; c.canvas.width=W; c.canvas.height=H;
  c.font=font; c.fillStyle="#000"; c.textBaseline="alphabetic"; c.fillText(str,pad+L,pad+A);
  const px=c.getImageData(0,0,W,H).data, ink=new Uint8Array(W*H); for(let i=0;i<W*H;i++) ink[i]=px[4*i+3]>=128?1:0;
  const dAus=abstandsBild(ink,W,H,1), dIn=abstandsBild(ink,W,H,0), sd=new Float32Array(W*H);
  for(let i=0;i<W*H;i++) sd[i]=(ink[i]?-(Math.sqrt(dIn[i])-0.5):Math.sqrt(dAus[i])-0.5)/cap;
  const mx=pad+(L+R)/2, my=pad+(A+D)/2;
  const d=(u,v)=>{ const X=mx+u*cap, Y=my-v*cap, cx=Math.max(0,Math.min(W-1.001,X)), cy=Math.max(0,Math.min(H-1.001,Y));
    const i=Math.floor(cx), j=Math.floor(cy), a=cx-i, b=cy-j, o=j*W+i;
    const s=(sd[o]*(1-a)+sd[o+1]*a)*(1-b)+(sd[o+W]*(1-a)+sd[o+W+1]*a)*b;
    return s+hyp(X-cx,Y-cy)/cap; };
  e={w:(L+R)/cap, h:(A+D)/cap, d}; schriftCache.set(str,e); return e;
}

/* Text auf die Fläche model.schild setzen: Schrift notfalls kleiner, damit sie passt; Schraublöchern ausweichen.
   Legt model.text = {f, bb, th} an (eigener Körper, damit er in 3MF eine eigene Farbe bekommen kann). */
function schriftModel(model,p,warn){
  const S=model.schild, str=(p.text||"").trim(); if(!p.txt||!str) return;
  if(!S){ warn.push("Bei dieser Form gibt es keinen Platz für eine Beschriftung."); return; }
  const F=schriftFeld(str), bw=S.x1-S.x0, bh=S.z1-S.z0, maxTh=Math.floor(2*Math.min(bh/F.h,bw/F.w))/2;
  let th=p.th;
  if(th>maxTh){ if(maxTh<3){ warn.push("Für die Beschriftung ist auf der Fläche zu wenig Platz. Text kürzen oder das Bauteil größer machen."); return; }
    th=maxTh; warn.push(`Schrifthöhe auf ${mmDE(th)} mm verkleinert, damit der Text auf die Fläche passt.`); }
  const tw=F.w*th, thh=F.h*th, xc=(S.x0+S.x1)/2; let zc=(S.z0+S.z1)/2;
  // Schraublöchern ausweichen: nächstgelegener freier Streifen
  const frei=z=>!(S.avoid||[]).some(([hx,hz,r])=>Math.abs(hx-xc)<tw/2+r&&Math.abs(hz-z)<thh/2+r);
  if(!frei(zc)){ let best=null; for(let z=S.z1-thh/2;z>=S.z0+thh/2-1e-6;z-=0.5) if(frei(z)&&(best==null||Math.abs(z-zc)<Math.abs(best-zc))) best=z;
    if(best==null){ warn.push("Neben den Schraublöchern ist kein Platz für die Beschriftung. Schrift kleiner oder die Rückwand größer machen."); return; }
    zc=best; }
  // Von vorne gelesen: Bei einer Fläche nach +y zeigt die x-Achse nach links
  const Y=S.y, dir=S.dir;
  const f=(x,y,z)=>ext(F.d((dir>0?xc-x:x-xc)/th,(z-zc)/th)*th,dir>0?y-Y:Y-y,-SCHRIFT_TIEF,SCHRIFT_HOCH);
  const y0=dir>0?Y-SCHRIFT_TIEF:Y-SCHRIFT_HOCH, y1=dir>0?Y+SCHRIFT_HOCH:Y+SCHRIFT_TIEF;
  model.text={f,bb:[xc-tw/2-0.5,xc+tw/2+0.5,y0,y1,zc-thh/2-0.5,zc+thh/2+0.5],th};
}
