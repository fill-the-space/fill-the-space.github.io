/* ---------- Netz vereinfachen (Kanten zusammenlegen nach Garland/Heckbert) ----------
   Legt immer einen Punkt auf einen Nachbarpunkt, solange die Form dabei höchstens um etwa tol mm abweicht.
   Ebene Flächen schrumpfen so auf wenige große Dreiecke, Rundungen behalten ihre Punkte. Das Netz bleibt geschlossen. */
const MAXDEG=20;

/* Punkte des feinen Netzes genau auf die Oberfläche schieben (das Raster schrägt Kanten sonst leicht ab) */
function snapToSurface(mesh,f,it=3){
  const p=Float32Array.from(mesh.pos), e=0.01;
  for(let i=0;i<p.length;i+=3){ let x=p[i],y=p[i+1],z=p[i+2];
    for(let k=0;k<it;k++){ const d=f(x,y,z); if(Math.abs(d)<1e-4) break;
      const gx=(f(x+e,y,z)-d)/e, gy=(f(x,y+e,z)-d)/e, gz=(f(x,y,z+e)-d)/e, g2=gx*gx+gy*gy+gz*gz; if(g2<1e-6) break;
      x-=d*gx/g2; y-=d*gy/g2; z-=d*gz/g2; }
    p[i]=x; p[i+1]=y; p[i+2]=z; }
  return {pos:p, idx:mesh.idx};
}

function simplifyMesh(mesh,tol=0.01){
  const P=mesh.pos, T=Int32Array.from(mesh.idx), nv=P.length/3, nt=T.length/3, maxErr=tol*tol;
  const alive=new Uint8Array(nt).fill(1), gone=new Uint8Array(nv), ver=new Uint32Array(nv), Q=new Float64Array(nv*10);
  const vf=Array.from({length:nv},()=>[]), mark=new Int32Array(nv); let stamp=0;
  const norm=(a,b,c)=>{ const ux=P[3*b]-P[3*a],uy=P[3*b+1]-P[3*a+1],uz=P[3*b+2]-P[3*a+2],wx=P[3*c]-P[3*a],wy=P[3*c+1]-P[3*a+1],wz=P[3*c+2]-P[3*a+2];
    return [uy*wz-uz*wy,uz*wx-ux*wz,ux*wy-uy*wx]; };
  // Fehlermaß je Punkt: Summe der quadrierten Abstände zu den Ebenen der anliegenden Dreiecke
  for(let f=0;f<nt;f++){ const a=T[3*f],b=T[3*f+1],c=T[3*f+2]; vf[a].push(f); vf[b].push(f); vf[c].push(f);
    const n=norm(a,b,c), l=Math.hypot(n[0],n[1],n[2]); if(l<1e-12) continue;
    const x=n[0]/l,y=n[1]/l,z=n[2]/l,d=-(x*P[3*a]+y*P[3*a+1]+z*P[3*a+2]), q=[x*x,x*y,x*z,x*d,y*y,y*z,y*d,z*z,z*d,d*d];
    for(const v of [a,b,c]) for(let i=0;i<10;i++) Q[10*v+i]+=q[i]; }
  const err=(r,k)=>{ const x=P[3*k],y=P[3*k+1],z=P[3*k+2]; let s=0;
    for(const v of [r,k]){ const q=10*v; s+=Q[q]*x*x+2*Q[q+1]*x*y+2*Q[q+2]*x*z+2*Q[q+3]*x+Q[q+4]*y*y+2*Q[q+5]*y*z+2*Q[q+6]*y+Q[q+7]*z*z+2*Q[q+8]*z+Q[q+9]; }
    return s; };
  const faces=v=>{ const a=vf[v].filter(f=>alive[f]); vf[v]=a; return a; };
  // Nachbarn von v als Liste; markiert sie zugleich mit dem aktuellen Stempel
  const nbrs=v=>{ stamp++; const out=[]; for(const f of faces(v)) for(let i=0;i<3;i++){ const w=T[3*f+i]; if(w!==v&&mark[w]!==stamp){ mark[w]=stamp; out.push(w); } } return out; };

  // Warteschlange (Min-Heap) in Zahlenfeldern: günstigste Zusammenlegung zuerst
  let cap=1<<16, len=0, HK=new Float64Array(cap), HR=new Int32Array(cap), HC=new Int32Array(cap), HS=new Uint32Array(cap), HT=new Uint32Array(cap);
  const swap=(i,j)=>{ let t=HK[i];HK[i]=HK[j];HK[j]=t; t=HR[i];HR[i]=HR[j];HR[j]=t; t=HC[i];HC[i]=HC[j];HC[j]=t; t=HS[i];HS[i]=HS[j];HS[j]=t; t=HT[i];HT[i]=HT[j];HT[j]=t; };
  const grow=()=>{ cap*=2; const k=new Float64Array(cap),r=new Int32Array(cap),c=new Int32Array(cap),s=new Uint32Array(cap),t=new Uint32Array(cap);
    k.set(HK);r.set(HR);c.set(HC);s.set(HS);t.set(HT); HK=k;HR=r;HC=c;HS=s;HT=t; };
  // Reihenfolge: kleinster Fehler zuerst, bei gleichem Fehler (ebene Flächen) die kürzere Kante, damit sich die Dreiecke gleichmäßig verteilen
  const push=(r,k)=>{ const c=err(r,k); if(c>maxErr) return; const dx=P[3*r]-P[3*k],dy=P[3*r+1]-P[3*k+1],dz=P[3*r+2]-P[3*k+2];
    if(len===cap) grow(); let i=len++; HK[i]=c+1e-6*(dx*dx+dy*dy+dz*dz); HR[i]=r; HC[i]=k; HS[i]=ver[r]; HT[i]=ver[k];
    while(i){ const p=(i-1)>>1; if(HK[p]<=HK[i]) break; swap(p,i); i=p; } };
  const popTop=()=>{ len--; if(len){ swap(0,len); let i=0; for(;;){ const l=2*i+1,r=l+1; let m=i; if(l<len&&HK[l]<HK[m]) m=l; if(r<len&&HK[r]<HK[m]) m=r; if(m===i) break; swap(m,i); i=m; } } };
  for(let f=0;f<nt;f++) for(let i=0;i<3;i++){ const a=T[3*f+i], b=T[3*f+(i+1)%3]; if(a<b){ push(a,b); push(b,a); } }

  while(len){
    const r=HR[0], k=HC[0], sr=HS[0], sk=HT[0]; popTop();
    if(gone[r]||gone[k]||ver[r]!==sr||ver[k]!==sk) continue;
    const fr=faces(r); let s0=-1,s1=-1,ns=0;
    for(const f of fr) if(T[3*f]===k||T[3*f+1]===k||T[3*f+2]===k){ if(ns===0) s0=f; else s1=f; ns++; }
    if(ns!==2) continue;
    // Netz muss geschlossen bleiben: r und k dürfen nur die beiden gemeinsamen Dreiecks-Nachbarn teilen
    const nr=nbrs(r), nk=nbrs(k); let common=0; for(const v of nr) if(mark[v]===stamp) common++;
    if(common!==2) continue;
    // Nicht zu viele Dreiecke an einem Punkt sammeln (hält die Rechnung schnell und die Dreiecke ordentlich)
    if(nk.length+nr.length-common-2>MAXDEG) continue;
    // Kein Dreieck darf umklappen oder zu einer Linie werden
    let ok=true;
    for(const f of fr){ if(f===s0||f===s1) continue;
      const a=T[3*f],b=T[3*f+1],c=T[3*f+2], n0=norm(a,b,c), n1=norm(a===r?k:a,b===r?k:b,c===r?k:c);
      const l0=Math.hypot(n0[0],n0[1],n0[2]), l1=Math.hypot(n1[0],n1[1],n1[2]);
      if(l1<1e-9||(n0[0]*n1[0]+n0[1]*n1[1]+n0[2]*n1[2])<0.5*l0*l1){ ok=false; break; } }
    if(!ok) continue;
    alive[s0]=0; alive[s1]=0;
    for(const f of fr){ if(!alive[f]) continue; for(let i=0;i<3;i++) if(T[3*f+i]===r) T[3*f+i]=k; vf[k].push(f); }
    for(let i=0;i<10;i++) Q[10*k+i]+=Q[10*r+i];
    gone[r]=1; ver[k]++;
    for(const v of nbrs(k)){ push(k,v); push(v,k); }
  }

  // Übrige Punkte und Dreiecke neu durchnummerieren
  const map=new Int32Array(nv).fill(-1), pos=[], idx=[];
  for(let f=0;f<nt;f++){ if(!alive[f]) continue;
    for(let i=0;i<3;i++){ const v=T[3*f+i]; if(map[v]<0){ map[v]=pos.length/3; pos.push(P[3*v],P[3*v+1],P[3*v+2]); } idx.push(map[v]); } }
  return {pos:new Float32Array(pos), idx:new Uint32Array(idx)};
}
