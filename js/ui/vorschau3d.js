/* ---------- 3D-Vorschau ---------- */
const bed=$("bed");
let renderer=null, scene, camera, group, view={theta:-0.7,phi:1.05,zoom:1}, radius=100, center=new THREE.Vector3();
function initGL(){
  try{ renderer=new THREE.WebGLRenderer({antialias:true,alpha:true}); }catch(e){ $("tag").textContent="3D-Vorschau in diesem Browser nicht verfügbar"; return; }
  renderer.setPixelRatio(Math.min(2,window.devicePixelRatio||1));
  bed.appendChild(renderer.domElement);
  scene=new THREE.Scene();
  camera=new THREE.PerspectiveCamera(35,4/3,1,8000); camera.up.set(0,0,1);
  scene.add(new THREE.HemisphereLight(0xffffff,0x667066,0.75));
  const dir=new THREE.DirectionalLight(0xffffff,0.65); dir.position.set(1,-1.5,2); camera.add(dir); scene.add(camera);
  group=new THREE.Group(); scene.add(group);
  new ResizeObserver(resize).observe(bed); resize();
  let drag=null;
  bed.addEventListener("pointerdown",e=>{drag={x:e.clientX,y:e.clientY};bed.setPointerCapture(e.pointerId);bed.style.cursor="grabbing";});
  bed.addEventListener("pointermove",e=>{if(!drag)return;view.theta-=(e.clientX-drag.x)*0.01;view.phi=Math.min(1.55,Math.max(0.12,view.phi-(e.clientY-drag.y)*0.01));drag={x:e.clientX,y:e.clientY};draw();});
  const end=()=>{drag=null;bed.style.cursor="grab";};
  bed.addEventListener("pointerup",end);bed.addEventListener("pointercancel",end);
  bed.addEventListener("wheel",e=>{e.preventDefault();view.zoom=Math.min(3,Math.max(0.35,view.zoom*(e.deltaY>0?1.1:0.9)));draw();},{passive:false});
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change",()=>schedule());
  new MutationObserver(()=>schedule()).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});
}
function resize(){ if(!renderer)return; const w=bed.clientWidth,h=bed.clientHeight; renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix(); draw(); }
// Abstand so, dass auch hohe oder breite Halterungen ganz ins Bild passen
function draw(){ if(!renderer)return; const r=radius/Math.sin(camera.fov*Math.PI/360)*1.1*view.zoom;
  camera.position.set(center.x+r*Math.sin(view.phi)*Math.sin(view.theta), center.y-r*Math.sin(view.phi)*Math.cos(view.theta), center.z+r*Math.cos(view.phi));
  camera.lookAt(center); renderer.render(scene,camera); }
function ghostMesh(gs,mat){
  const out=[];
  for(const g of gs){ let geo;
    if(g.k==="box"){ geo=new THREE.BoxGeometry(g.x1-g.x0,g.y1-g.y0,g.z1-g.z0); geo.translate((g.x0+g.x1)/2,(g.y0+g.y1)/2,(g.z0+g.z1)/2); }
    else if(g.k==="cyl"){ if(g.ax==="y"){ geo=new THREE.CylinderGeometry(g.r,g.r,g.len,40); geo.translate(g.x,g.y+g.len/2,(g.z0+g.z1)/2); }
      else { geo=new THREE.CylinderGeometry(g.r,g.r,g.z1-g.z0,48); geo.rotateX(Math.PI/2); geo.translate(g.x,g.y,(g.z0+g.z1)/2); } }
    else if(g.k==="rr"){ const s=new THREE.Shape(), hw=g.w/2, hh=g.d/2, r=Math.min(g.r,hw,hh)-0.001;
      if(r>0.05){ s.moveTo(-hw+r,-hh); s.lineTo(hw-r,-hh); s.absarc(hw-r,-hh+r,r,-Math.PI/2,0); s.lineTo(hw,hh-r); s.absarc(hw-r,hh-r,r,0,Math.PI/2); s.lineTo(-hw+r,hh); s.absarc(-hw+r,hh-r,r,Math.PI/2,Math.PI); s.lineTo(-hw,-hh+r); s.absarc(-hw+r,-hh+r,r,Math.PI,1.5*Math.PI); }
      else { s.moveTo(-hw,-hh); s.lineTo(hw,-hh); s.lineTo(hw,hh); s.lineTo(-hw,hh); }
      geo=new THREE.ExtrudeGeometry(s,{depth:g.z1-g.z0,bevelEnabled:false,curveSegments:16}); geo.translate(g.cx,g.cy,g.z0); }
    else if(g.k==="sdf"){ const b=g.bb, vol=(b[1]-b[0]+4)*(b[3]-b[2]+4)*(b[5]-b[4]+4), m=polygonize(g.f,b,Math.max(1.2,Math.cbrt(vol/150000)));
      geo=new THREE.BufferGeometry(); geo.setAttribute("position",new THREE.BufferAttribute(m.pos,3)); geo.setIndex(new THREE.BufferAttribute(m.idx,1)); geo.computeVertexNormals(); }
    out.push(new THREE.Mesh(geo,mat)); }
  return out;
}
// Alte Darstellung entfernen; Netze aus dem Zwischenspeicher der Anordnung (keep) bleiben erhalten
function clearGroup(){ while(group.children.length){const c=group.children.pop(); if(!c.userData.keep) c.geometry&&c.geometry.dispose(); c.material&&c.material.dispose();} }
function meshGeo(mesh){ const geo=new THREE.BufferGeometry(); geo.setAttribute("position",new THREE.BufferAttribute(mesh.pos,3)); geo.setIndex(new THREE.BufferAttribute(mesh.idx,1)); geo.computeVertexNormals(); return geo; }
function show(model,mesh){
  if(!renderer)return;
  clearGroup();
  const geo=meshGeo(mesh);
  group.add(new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:new THREE.Color(cssColor("--model")),roughness:0.6,metalness:0.02})));
  const gmat=new THREE.MeshStandardMaterial({color:new THREE.Color(cssColor("--ghost")),transparent:true,opacity:0.28,depthWrite:false,roughness:0.8});
  ghostMesh(model.ghost,gmat).forEach(m=>group.add(m));
  const b=model.bb, size=Math.max(b[1],b[3])*1.8, div=Math.max(4,Math.round(size/10));
  const grid=new THREE.GridHelper(div*10,div,new THREE.Color(cssColor("--grid")),new THREE.Color(cssColor("--grid")));
  grid.rotation.x=Math.PI/2; grid.position.set(b[1]/2,b[3]/2,Math.min(0,...model.ghost.map(g=>g.z0))-0.1); group.add(grid);
  const box=new THREE.Box3().setFromObject(group.children[0]); model.ghost.length&&group.children.slice(1,-1).forEach(c=>box.expandByObject(c));
  box.getCenter(center); radius=box.getSize(new THREE.Vector3()).length()/2;
  draw();
}

/* Anordnung: Wand (von vorne, Teile mit der Rückseite bei y = 0) oder Kasten (Boden bei z = 0, vorne bei y = 0).
   parts: [{geo, x, y, z, rot, sel, bad}]; rot = 1 dreht das Teil um 90° */
function showPlan(sp){
  if(!renderer)return;
  clearGroup();
  const mat=c=>new THREE.MeshStandardMaterial({color:new THREE.Color(cssColor(c)),roughness:0.6,metalness:0.02});
  const slab=(x0,x1,y0,y1,z0,z1,m)=>{ const g=new THREE.BoxGeometry(x1-x0,y1-y0,z1-z0); g.translate((x0+x1)/2,(y0+y1)/2,(z0+z1)/2); const o=new THREE.Mesh(g,m); group.add(o); return o; };
  const wall=new THREE.MeshStandardMaterial({color:new THREE.Color(cssColor("--wall")),roughness:0.95});
  let depth=0;
  // ghost: neues Teil, das noch nicht hinzugefügt ist (durchscheinend)
  for(const p of sp.parts){ const m=new THREE.Mesh(p.geo,p.ghost?new THREE.MeshStandardMaterial({color:new THREE.Color(cssColor("--model")),transparent:true,opacity:0.45,depthWrite:false,roughness:0.6}):mat(p.bad?"--alert-bg":p.sel?"--model":"--placed")); m.userData.keep=true;
    if(p.rot) m.rotation.z=Math.PI/2; m.position.set(p.x,p.y,p.z); group.add(m); depth=Math.max(depth,p.depth||0); }
  if(sp.kind==="wand"){ slab(0,sp.W,-12,0,0,sp.H,wall);
    center.set(sp.W/2,depth/2,sp.H/2); radius=Math.hypot(sp.W,sp.H,depth)/2; }
  else { const t=8, glas=new THREE.MeshStandardMaterial({color:new THREE.Color(cssColor("--wall")),transparent:true,opacity:0.35,depthWrite:false,roughness:0.9});
    slab(-t,sp.L+t,-t,sp.B+t,-t,0,wall);
    slab(-t,0,-t,sp.B+t,0,sp.H,glas); slab(sp.L,sp.L+t,-t,sp.B+t,0,sp.H,glas); slab(0,sp.L,sp.B,sp.B+t,0,sp.H,glas); slab(0,sp.L,-t,0,0,sp.H,glas);
    center.set(sp.L/2,sp.B/2,sp.H/3); radius=Math.hypot(sp.L,sp.B,sp.H)/2; }
  draw();
}
