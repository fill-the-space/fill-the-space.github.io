/* ---------- STL (binär) ---------- */
function stl(m){
  const nt=m.idx.length/3, buf=new ArrayBuffer(84+nt*50), dv=new DataView(buf), p=m.pos, t=m.idx;
  const head="Halterungs-Generator"; for(let i=0;i<head.length;i++) dv.setUint8(i,head.charCodeAt(i));
  dv.setUint32(80,nt,true); let o=84;
  for(let q=0;q<t.length;q+=3){ const a=3*t[q],b=3*t[q+1],c=3*t[q+2];
    const ux=p[b]-p[a],uy=p[b+1]-p[a+1],uz=p[b+2]-p[a+2],vx=p[c]-p[a],vy=p[c+1]-p[a+1],vz=p[c+2]-p[a+2];
    let n0=uy*vz-uz*vy,n1=uz*vx-ux*vz,n2=ux*vy-uy*vx; const l=Math.hypot(n0,n1,n2)||1;
    dv.setFloat32(o,n0/l,true);dv.setFloat32(o+4,n1/l,true);dv.setFloat32(o+8,n2/l,true);o+=12;
    for(const v of [a,b,c]){dv.setFloat32(o,p[v],true);dv.setFloat32(o+4,p[v+1],true);dv.setFloat32(o+8,p[v+2],true);o+=12;}
    o+=2; }
  return new Uint8Array(buf); }
