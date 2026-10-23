/* ---------- SDF-Grundformen (mm, negativ = innen) ---------- */
const hyp=(x,y)=>Math.sqrt(x*x+y*y);
function rr2(px,py,cx,cy,hw,hh,r){ r=Math.max(0,Math.min(r,hw,hh)); const qx=Math.abs(px-cx)-(hw-r), qy=Math.abs(py-cy)-(hh-r); return hyp(Math.max(qx,0),Math.max(qy,0))+Math.min(Math.max(qx,qy),0)-r; }
function ext(d2,a,lo,hi){ const w=Math.max(lo-a,a-hi); return Math.min(Math.max(d2,w),0)+hyp(Math.max(d2,0),Math.max(w,0)); }
function box3(x,y,z,x0,x1,y0,y1,z0,z1){ return ext(rr2(x,y,(x0+x1)/2,(y0+y1)/2,(x1-x0)/2,(y1-y0)/2,0),z,z0,z1); }
function poly2(px,py,v){ let d=(px-v[0][0])**2+(py-v[0][1])**2, s=1;
  for(let i=0,j=v.length-1;i<v.length;j=i,i++){ const ex=v[j][0]-v[i][0], ey=v[j][1]-v[i][1], wx=px-v[i][0], wy=py-v[i][1];
    const t=Math.max(0,Math.min(1,(wx*ex+wy*ey)/(ex*ex+ey*ey))); const bx=wx-ex*t, by=wy-ey*t; d=Math.min(d,bx*bx+by*by);
    const c1=py>=v[i][1], c2=py<v[j][1], c3=ex*wy>ey*wx; if((c1&&c2&&c3)||(!c1&&!c2&&!c3)) s=-s; }
  return s*Math.sqrt(d); }
/* Schraubloch entlang y, optional mit 90°-Senkung (Kopfseite bei yHead, Senkung öffnet zu +y) */
function screw(x,y,z,hx,hz,y0,y1,yHead,hole=4.5,depth=2.2){ const rho=hyp(x-hx,z-hz); let r=hole/2; if(yHead!=null) r+=Math.max(0,y-(yHead-depth)); return ext(rho-r,y,y0,y1); }

const f2=v=>(+(+v).toFixed(2)).toString();
