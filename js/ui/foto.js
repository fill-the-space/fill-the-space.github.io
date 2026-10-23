/* ---------- Foto: Beispiele, eigenes Foto, Anzeige mit erkanntem Umriss ---------- */
const photo={id:"",canvas:null};
function sampleCanvas(kind){
  const c=document.createElement("canvas"); c.width=900; c.height=800; const x=c.getContext("2d");
  x.fillStyle="#efeee8"; x.fillRect(0,0,900,800); x.fillStyle="#2b2d2f";
  const poly=pts=>{x.beginPath(); pts.forEach(([a,b],i)=>i?x.lineTo(a,b):x.moveTo(a,b)); x.closePath(); x.fill();};
  const rr=(a,b,w,h,r)=>{x.beginPath(); x.moveTo(a+r,b); x.arcTo(a+w,b,a+w,b+h,r); x.arcTo(a+w,b+h,a,b+h,r); x.arcTo(a,b+h,a,b,r); x.arcTo(a,b,a+w,b,r); x.closePath(); x.fill();};
  if(kind==="gun"){
    rr(170,170,440,120,55); x.fillRect(110,205,70,50);
    poly([[600,200],[690,215],[690,245],[600,262]]); poly([[690,220],[740,240],[690,245]]);
    poly([[240,270],[345,270],[325,520],[215,520]]); rr(213,490,114,40,18);
    poly([[370,285],[405,285],[395,370],[372,365]]);
  } else if(kind==="curl"){
    x.fillRect(437,20,26,45); rr(410,60,80,250,30); x.fillRect(395,300,110,22);
    rr(422,318,56,420,26); rr(470,330,22,330,10); poly([[480,230],[522,236],[505,302],[486,302]]);
    x.beginPath(); x.ellipse(450,742,22,24,0,0,Math.PI*2); x.fill();
  } else {
    rr(395,120,70,62,8); poly([[400,180],[460,180],[530,262],[330,262]]); rr(330,250,200,500,40);
  }
  // leichtes Rauschen wie bei einem echten Foto
  const im=x.getImageData(0,0,900,800), d=im.data; for(let i=0;i<d.length;i+=4){ const n=(Math.random()-0.5)*14; d[i]+=n; d[i+1]+=n; d[i+2]+=n; } x.putImageData(im,0,0);
  return c;
}
function setPhotoSample(kind){ photo.id="sample-"+kind; photo.canvas=sampleCanvas(kind); }
let segCache={key:"",seg:null,img:null};
function currentSeg(v){
  if(!photo.canvas) return null;
  const key=`${photo.id}|${v.rot}|${v.sens}`; if(segCache.key===key) return segCache;
  const src=photo.canvas, rot=((v.rot%4)+4)%4, sw=rot%2?src.height:src.width, sh=rot%2?src.width:src.height;
  const c=document.createElement("canvas"); c.width=sw; c.height=sh; const x=c.getContext("2d");
  x.translate(sw/2,sh/2); x.rotate(rot*Math.PI/2); x.drawImage(src,-src.width/2,-src.height/2);
  const im=x.getImageData(0,0,sw,sh);
  segCache={key,seg:segment(im.data,sw,sh,v.sens),img:c};
  return segCache;
}
function drawPhoto(sc,info){
  const cv=$("photo"); if(!sc||!sc.img) return; const src=sc.img, ctx=cv.getContext("2d");
  cv.width=src.width; cv.height=src.height; ctx.drawImage(src,0,0);
  if(!sc.seg) return;
  const s=sc.seg, ov=ctx.getImageData(0,0,s.w,s.h), d=ov.data, acc=new THREE.Color(cssColor("--accent"));
  const ar=acc.r*255, ag=acc.g*255, ab=acc.b*255;
  for(let i=0;i<s.w*s.h;i++) if(s.mask[i]){ d[4*i]=d[4*i]*0.45+ar*0.55; d[4*i+1]=d[4*i+1]*0.45+ag*0.55; d[4*i+2]=d[4*i+2]*0.45+ab*0.55; }
  ctx.putImageData(ov,0,0);
  const [x0,y0,x1,y1]=s.bbox, lw=Math.max(2,s.w/300);
  ctx.strokeStyle=cssColor("--ghost"); ctx.lineWidth=lw; ctx.setLineDash([lw*4,lw*3]); ctx.strokeRect(x0,y0,x1-x0,y1-y0);
  if(info){ ctx.strokeStyle=cssColor("--ink"); ctx.beginPath(); ctx.moveTo(Math.max(0,x0-30),info.lineRowPx); ctx.lineTo(Math.min(s.w,x1+30),info.lineRowPx); ctx.stroke();
    ctx.setLineDash([]); ctx.font=`600 ${Math.round(s.w/32)}px "IBM Plex Mono",monospace`; ctx.fillStyle=cssColor("--ink");
    const txt=`${Math.round(info.silW)} × ${Math.round(info.silH)} mm`; const tw=ctx.measureText(txt).width;
    ctx.fillStyle="rgba(255,255,255,.8)"; ctx.fillRect(x0,Math.max(0,y0-s.w/24),tw+12,s.w/24); ctx.fillStyle="#1d2621"; ctx.fillText(txt,x0+6,Math.max(s.w/32,y0-s.w/24+s.w/32)); }
}
$("file").addEventListener("change",async e=>{
  const fl=e.target.files&&e.target.files[0]; if(!fl) return;
  try{
    const url=URL.createObjectURL(fl); const img=new Image(); img.src=url; await img.decode();
    const k=Math.min(1,1000/Math.max(img.naturalWidth,img.naturalHeight)); const c=document.createElement("canvas");
    c.width=Math.round(img.naturalWidth*k); c.height=Math.round(img.naturalHeight*k); c.getContext("2d").drawImage(img,0,0,c.width,c.height); URL.revokeObjectURL(url);
    photo.id="file-"+Date.now(); photo.canvas=c; state.type="individuell"; state.v.individuell.rot=0;
    renderAll();
  }catch(err){ $("status").textContent="Das Bild ließ sich nicht öffnen. Bitte ein JPG oder PNG wählen."; }
  e.target.value="";
});
$("rotL").addEventListener("click",()=>{ state.v.individuell.rot=(state.v.individuell.rot+3)%4; schedule(); });
$("rotR").addEventListener("click",()=>{ state.v.individuell.rot=(state.v.individuell.rot+1)%4; schedule(); });
