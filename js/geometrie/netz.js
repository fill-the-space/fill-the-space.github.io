/* ---------- Surface Nets: SDF -> geschlossenes Dreiecksnetz ---------- */
function polygonize(f,bb,h){
  const pad=2*h, X0=bb[0]-pad, Y0=bb[2]-pad, Z0=bb[4]-pad;
  const nx=Math.ceil((bb[1]-bb[0]+2*pad)/h)+1, ny=Math.ceil((bb[3]-bb[2]+2*pad)/h)+1, nz=Math.ceil((bb[5]-bb[4]+2*pad)/h)+1;
  const V=new Float32Array(nx*ny*nz), sxy=nx*ny;
  for(let k=0;k<nz;k++){ const z=Z0+k*h; for(let j=0;j<ny;j++){ const y=Y0+j*h, o=k*sxy+j*nx; for(let i=0;i<nx;i++){ let v=f(X0+i*h,y,z); if(v===0) v=1e-6; V[o+i]=v; } } }
  const cx=nx-1, cy=ny-1, cz=nz-1, cxy=cx*cy;
  const vid=new Int32Array(cx*cy*cz).fill(-1), P=[];
  const CO=[[0,0,0],[1,0,0],[0,1,0],[1,1,0],[0,0,1],[1,0,1],[0,1,1],[1,1,1]];
  const ED=[[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]];
  const val=new Float64Array(8);
  for(let k=0;k<cz;k++)for(let j=0;j<cy;j++)for(let i=0;i<cx;i++){
    let mask=0;
    for(let c=0;c<8;c++){ const q=CO[c]; const v=V[(k+q[2])*sxy+(j+q[1])*nx+i+q[0]]; val[c]=v; if(v<0) mask|=1<<c; }
    if(mask===0||mask===255) continue;
    let sx=0,sy=0,sz=0,cnt=0;
    for(const e of ED){ const a=e[0],b=e[1]; if(((mask>>a)&1)===((mask>>b)&1)) continue;
      const t=val[a]/(val[a]-val[b]), A=CO[a], B=CO[b];
      sx+=A[0]+(B[0]-A[0])*t; sy+=A[1]+(B[1]-A[1])*t; sz+=A[2]+(B[2]-A[2])*t; cnt++; }
    vid[k*cxy+j*cx+i]=P.length/3;
    P.push(X0+(i+sx/cnt)*h, Y0+(j+sy/cnt)*h, Z0+(k+sz/cnt)*h);
  }
  const T=[];
  const cell=(i,j,k)=>vid[k*cxy+j*cx+i];
  function quad(a,b,c,d,nx_,ny_,nz_){
    const ax=P[3*a],ay=P[3*a+1],az=P[3*a+2];
    const ux=P[3*c]-ax,uy=P[3*c+1]-ay,uz=P[3*c+2]-az, vx=P[3*d]-P[3*b],vy=P[3*d+1]-P[3*b+1],vz=P[3*d+2]-P[3*b+2];
    const n0=uy*vz-uz*vy,n1=uz*vx-ux*vz,n2=ux*vy-uy*vx;
    if(n0*nx_+n1*ny_+n2*nz_<0){ T.push(a,c,b,a,d,c); } else { T.push(a,b,c,a,c,d); }
  }
  for(let k=1;k<nz-1;k++)for(let j=1;j<ny-1;j++)for(let i=1;i<nx-1;i++){
    const o=k*sxy+j*nx+i, v0=V[o], in0=v0<0;
    if(i<nx-1 && (V[o+1]<0)!==in0) quad(cell(i,j-1,k-1),cell(i,j,k-1),cell(i,j,k),cell(i,j-1,k), in0?1:-1,0,0);
    if(j<ny-1 && (V[o+nx]<0)!==in0) quad(cell(i-1,j,k-1),cell(i,j,k-1),cell(i,j,k),cell(i-1,j,k), 0,in0?1:-1,0);
    if(k<nz-1 && (V[o+sxy]<0)!==in0) quad(cell(i-1,j-1,k),cell(i,j-1,k),cell(i,j,k),cell(i-1,j,k), 0,0,in0?1:-1);
  }
  return {pos:new Float32Array(P), idx:new Uint32Array(T)};
}
function meshStats(m){ let vol=0, area=0; const p=m.pos, t=m.idx;
  for(let q=0;q<t.length;q+=3){ const a=3*t[q],b=3*t[q+1],c=3*t[q+2];
    const ax=p[a],ay=p[a+1],az=p[a+2],bx=p[b],by=p[b+1],bz=p[b+2],cx=p[c],cy=p[c+1],cz=p[c+2];
    vol+=(ax*(by*cz-bz*cy)-ay*(bx*cz-bz*cx)+az*(bx*cy-by*cx))/6;
    const ux=bx-ax,uy=by-ay,uz=bz-az,vx=cx-ax,vy=cy-ay,vz=cz-az; area+=hyp(hyp(uy*vz-uz*vy,uz*vx-ux*vz),ux*vy-uy*vx)/2; }
  return {vol,area}; }
