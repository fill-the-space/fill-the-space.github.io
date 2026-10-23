/* ---------- Netz vereinfachen (Kanten zusammenlegen nach Garland/Heckbert) ----------
   Legt immer einen Punkt auf einen Nachbarpunkt, solange die Form dabei höchstens um etwa tol mm abweicht.
   Ebene Flächen schrumpfen so auf wenige große Dreiecke, Rundungen behalten ihre Punkte. Das Netz bleibt geschlossen. */
const MAXDEG=20;
function simplifyMesh(mesh,tol=0.05){
  const P=mesh.pos, T=Int32Array.from(mesh.idx), nv=P.length/3, nt=T.length/3, maxErr=tol*tol;
  const alive=new Uint8Array(nt).fill(1), gone=new Uint8Array(nv), ver=new Uint32Array(nv), Q=new Float64Array(nv*10);
  const vf=Array.from({length:nv},()=>[]);
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
  const nbrs=v=>{ const s=new Set(); for(const f of faces(v)) for(let i=0;i<3;i++) if(T[3*f+i]!==v) s.add(T[3*f+i]); return s; };

  // Warteschlange (Min-Heap) mit den günstigsten Zusammenlegungen zuerst
  const H=[]; const up=i=>{ while(i){ const p=(i-1)>>1; if(H[p][0]<=H[i][0]) break; [H[p],H[i]]=[H[i],H[p]]; i=p; } };
  const down=i=>{ for(;;){ const l=2*i+1,r=l+1; let m=i; if(l<H.length&&H[l][0]<H[m][0]) m=l; if(r<H.length&&H[r][0]<H[m][0]) m=r; if(m===i) break; [H[m],H[i]]=[H[i],H[m]]; i=m; } };
  // Reihenfolge: kleinster Fehler zuerst, bei gleichem Fehler (ebene Flächen) die kürzere Kante, damit sich die Dreiecke gleichmäßig verteilen
  const push=(r,k)=>{ const c=err(r,k); if(c>maxErr) return; const dx=P[3*r]-P[3*k],dy=P[3*r+1]-P[3*k+1],dz=P[3*r+2]-P[3*k+2];
    H.push([c+1e-6*(dx*dx+dy*dy+dz*dz),r,k,ver[r],ver[k]]); up(H.length-1); };
  const pop=()=>{ const t=H[0], last=H.pop(); if(H.length){ H[0]=last; down(0); } return t; };
  for(let f=0;f<nt;f++) for(let i=0;i<3;i++){ const a=T[3*f+i], b=T[3*f+(i+1)%3]; push(a,b); push(b,a); }

  while(H.length){
    const [,r,k,sr,sk]=pop();
    if(gone[r]||gone[k]||ver[r]!==sr||ver[k]!==sk) continue;
    const fr=faces(r), shared=fr.filter(f=>T[3*f]===k||T[3*f+1]===k||T[3*f+2]===k);
    if(shared.length!==2) continue;
    // Netz muss geschlossen bleiben: r und k dürfen nur die beiden gemeinsamen Dreiecks-Nachbarn teilen
    const nk=nbrs(k), nr=nbrs(r); let common=0; for(const v of nr) if(nk.has(v)) common++;
    if(common!==2) continue;
    // Nicht zu viele Dreiecke an einem Punkt sammeln (hält die Rechnung schnell und die Dreiecke ordentlich)
    if(nk.size+nr.size-common-2>MAXDEG) continue;
    // Kein Dreieck darf umklappen oder zu einer Linie werden
    let ok=true;
    for(const f of fr){ if(shared.includes(f)) continue;
      const v=[T[3*f],T[3*f+1],T[3*f+2]], n0=norm(...v), w=v.map(x=>x===r?k:x), n1=norm(...w);
      const l0=Math.hypot(...n0), l1=Math.hypot(...n1);
      if(l1<1e-9||(n0[0]*n1[0]+n0[1]*n1[1]+n0[2]*n1[2])<0.5*l0*l1){ ok=false; break; } }
    if(!ok) continue;
    for(const f of shared) alive[f]=0;
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
