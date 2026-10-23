/* ---------- Foto-Erkennung: Gerät im Foto finden, Auflagekante suchen ---------- */
function segment(data,w,h,sens){
  const R=[],G=[],B=[];
  const push=i=>{R.push(data[4*i]);G.push(data[4*i+1]);B.push(data[4*i+2]);};
  for(let x=0;x<w;x+=2){push(x);push((h-1)*w+x);} for(let y=0;y<h;y+=2){push(y*w);push(y*w+w-1);}
  const med=a=>{a.sort((p,q)=>p-q);return a[a.length>>1];}; const br=med(R),bg=med(G),bb=med(B);
  const m=new Uint8Array(w*h), s2=sens*sens;
  for(let i=0;i<w*h;i++){const dr=data[4*i]-br,dg=data[4*i+1]-bg,db=data[4*i+2]-bb; if(dr*dr+dg*dg+db*db>s2) m[i]=1;}
  // größte zusammenhängende Fläche behalten
  const lab=new Int32Array(w*h), st=new Int32Array(w*h); let best=0,bestSize=0,cur=0;
  for(let i=0;i<w*h;i++){ if(!m[i]||lab[i]) continue; cur++; let sp=0,size=0; st[sp++]=i; lab[i]=cur;
    while(sp){ const p=st[--sp]; size++; const x=p%w,y=(p/w)|0;
      if(x>0&&m[p-1]&&!lab[p-1]){lab[p-1]=cur;st[sp++]=p-1;} if(x<w-1&&m[p+1]&&!lab[p+1]){lab[p+1]=cur;st[sp++]=p+1;}
      if(y>0&&m[p-w]&&!lab[p-w]){lab[p-w]=cur;st[sp++]=p-w;} if(y<h-1&&m[p+w]&&!lab[p+w]){lab[p+w]=cur;st[sp++]=p+w;} }
    if(size>bestSize){bestSize=size;best=cur;} }
  if(!best) return null;
  // Löcher füllen: alles, was der Rand nicht erreicht, gehört zum Gerät
  const out=new Uint8Array(w*h); let sp=0;
  const seed=p=>{ if(lab[p]!==best&&!out[p]){out[p]=1;st[sp++]=p;} };
  for(let x=0;x<w;x++){seed(x);seed((h-1)*w+x);} for(let y=0;y<h;y++){seed(y*w);seed(y*w+w-1);}
  while(sp){ const p=st[--sp], x=p%w, y=(p/w)|0; if(x>0)seed(p-1); if(x<w-1)seed(p+1); if(y>0)seed(p-w); if(y<h-1)seed(p+w); }
  let x0=w,y0=h,x1=-1,y1=-1, area=0;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){ const i=y*w+x; m[i]=out[i]?0:1; if(m[i]){area++; if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y;} }
  if(area<200) return null;
  return {mask:m,w,h,bbox:[x0,y0,x1,y1],area,touches:x0===0||y0===0||x1===w-1||y1===h-1};
}
function edt1(f,n,d,v,z){ let k=0; v[0]=0; z[0]=-Infinity; z[1]=Infinity;
  for(let q=1;q<n;q++){ let s=((f[q]+q*q)-(f[v[k]]+v[k]*v[k]))/(2*q-2*v[k]); while(s<=z[k]){ k--; s=((f[q]+q*q)-(f[v[k]]+v[k]*v[k]))/(2*q-2*v[k]); } k++; v[k]=q; z[k]=s; z[k+1]=Infinity; }
  k=0; for(let q=0;q<n;q++){ while(z[k+1]<q) k++; d[q]=(q-v[k])*(q-v[k])+f[v[k]]; } }
function edt(m,W,H,target){ const INF=1e12, g=new Float64Array(W*H), n=Math.max(W,H), f=new Float64Array(n), d=new Float64Array(n), v=new Int32Array(n), z=new Float64Array(n+1);
  for(let i=0;i<W*H;i++) g[i]=m[i]===target?0:INF;
  for(let x=0;x<W;x++){ for(let y=0;y<H;y++) f[y]=g[y*W+x]; edt1(f,H,d,v,z); for(let y=0;y<H;y++) g[y*W+x]=d[y]; }
  for(let y=0;y<H;y++){ for(let x=0;x<W;x++) f[x]=g[y*W+x]; edt1(f,W,d,v,z); for(let x=0;x<W;x++) g[y*W+x]=Math.sqrt(d[x]); }
  return g; }
function signedField(m,W,H,cell){ const dO=edt(m,W,H,1), dI=edt(m,W,H,0), s=new Float32Array(W*H);
  for(let i=0;i<W*H;i++) s[i]= m[i] ? -(dI[i]-0.5)*cell : (dO[i]-0.5)*cell; return s; }
function rdp(pts,eps){ if(pts.length<3) return pts; const a=pts[0], b=pts[pts.length-1]; let idx=0, md=0;
  const L=hyp(b[0]-a[0],b[1]-a[1])||1;
  for(let i=1;i<pts.length-1;i++){ const d=Math.abs((b[0]-a[0])*(a[1]-pts[i][1])-(a[0]-pts[i][0])*(b[1]-a[1]))/L; if(d>md){md=d;idx=i;} }
  if(md<=eps) return [a,b]; const l=rdp(pts.slice(0,idx+1),eps), r=rdp(pts.slice(idx),eps); return l.slice(0,-1).concat(r); }

/* Umriss aus Foto in ein Raster in mm übertragen */
function silGrid(p,seg){
  const [bx0,by0,bx1,by1]=seg.bbox, bw=bx1-bx0+1, bh=by1-by0+1;
  const scale=p.ref/(p.refAxis==="h"?bh:bw);               // mm pro Pixel
  const silW=bw*scale, silH=bh*scale;
  const cell=Math.max(0.4,Math.max(silW,silH)/420), pad=12;
  const nx=Math.ceil((silW+2*pad)/cell), nz=Math.ceil((silH+2*pad)/cell);
  const sil=new Uint8Array(nx*nz);
  for(let r=0;r<nz;r++){ const py=Math.floor(by0+((r+0.5)*cell-pad)/scale); if(py<0||py>=seg.h) continue;
    for(let i=0;i<nx;i++){ const px=Math.floor(bx0+((i+0.5)*cell-pad)/scale); if(px<0||px>=seg.w) continue; if(seg.mask[py*seg.w+px]) sil[r*nx+i]=1; } }
  const rx0=new Float64Array(nz).fill(NaN), rx1=new Float64Array(nz).fill(NaN); let rTop=-1,rBot=-1,c0=nx,c1=-1;
  for(let r=0;r<nz;r++) for(let i=0;i<nx;i++) if(sil[r*nx+i]){ if(isNaN(rx0[r])) rx0[r]=i*cell; rx1[r]=(i+1)*cell; if(rTop<0) rTop=r; rBot=r; if(i<c0)c0=i; if(i>c1)c1=i; }
  const sd=signedField(sil,nx,nz,cell);
  const sample=(x,z)=>{ const fi=x/cell-0.5, fr=nz-z/cell-0.5;
    if(fi<0||fr<0||fi>nx-1||fr>nz-1) return 50; const i=Math.floor(fi), r=Math.floor(fr), a=fi-i, b=fr-r, i1=Math.min(i+1,nx-1), r1=Math.min(r+1,nz-1);
    return (sd[r*nx+i]*(1-a)+sd[r*nx+i1]*a)*(1-b)+(sd[r1*nx+i]*(1-a)+sd[r1*nx+i1]*a)*b; };
  const zOf=r=>(nz-r-1)*cell;                                  // Unterkante einer Rasterzeile
  return {scale,silW,silH,cell,pad,nx,nz,rx0,rx1,rTop,rBot,xL:c0*cell,xR:(c1+1)*cell,zLow:zOf(rBot),zHigh:zOf(rTop)+cell,sample,zOf,
    rowPx:z=>by0+((nz*cell-z)-pad)/scale};
}
/* Auflagekante suchen: von unten nach oben die erste Höhe, über der das Gerät deutlich breiter ist als alles darunter.
   Beidseitige Auflage hat Vorrang, einseitige (mind. 12 mm) nur, wenn es keine beidseitige gibt. */
function findShoulder(g){
  const band=Math.max(2,Math.round(8/g.cell)), cand=[];
  let h0=Infinity,h1=-Infinity;
  for(let r=g.rBot;r>=g.rTop;r--){ if(isNaN(g.rx0[r])) continue; const z=g.zOf(r);
    if(h0<Infinity && z-g.zLow>=10){ let b0=Infinity,b1=-Infinity;
      for(let q=r;q>=Math.max(g.rTop,r-band);q--) if(!isNaN(g.rx0[q])){ b0=Math.min(b0,g.rx0[q]); b1=Math.max(b1,g.rx1[q]); }
      const eL=h0-b0, eR=b1-h1;
      // Auflage beginnt an der untersten Zeile, die über den Hals hinausragt
      const start=()=>{ for(let q=r;q>=Math.max(g.rTop,r-band);q--) if(!isNaN(g.rx0[q])&&(g.rx0[q]<h0-1.5||g.rx1[q]>h1+1.5)) return g.zOf(q); return z; };
      if(eL>=3&&eR>=3) return {zS:start(),n0:h0,n1:h1,availL:eL,availR:eR};
      if(Math.max(eL,eR)>=12&&!cand.length) cand.push({zS:start(),n0:h0,n1:h1,availL:Math.max(0,eL),availR:Math.max(0,eR)}); }
    h0=Math.min(h0,g.rx0[r]); h1=Math.max(h1,g.rx1[r]); }
  return cand[0]||null;
}
function hullBelow(g,zMax){ let h0=Infinity,h1=-Infinity;
  for(let r=g.rBot;r>=g.rTop;r--){ if(isNaN(g.rx0[r])) continue; if(g.zOf(r)>zMax) break; h0=Math.min(h0,g.rx0[r]); h1=Math.max(h1,g.rx1[r]); }
  return [h0,h1]; }
