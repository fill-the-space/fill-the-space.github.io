/* ---------- 3MF: mehrere Teile mit eigener Farbe in einer Datei ----------
   3MF ist ein ZIP-Archiv mit einer XML-Beschreibung der Netze. Jedes Teil (Bauteil, Beschriftung) wird ein eigenes Netz
   mit eigener Farbe; ein gemeinsames Objekt fasst sie als Bauteile zusammen. So lädt der Slicer ein Objekt mit zwei Teilen,
   die an ihrem Platz zueinander bleiben, und jedem Teil lässt sich ein eigenes Filament zuordnen.
   Das ZIP wird ohne Komprimierung geschrieben, das reicht und braucht keine Bibliothek. */
const CRC_TAB=(()=>{ const t=new Uint32Array(256); for(let n=0;n<256;n++){ let c=n; for(let k=0;k<8;k++) c=c&1?0xEDB88320^(c>>>1):c>>>1; t[n]=c>>>0; } return t; })();
function crc32(u){ let c=0xFFFFFFFF; for(let i=0;i<u.length;i++) c=CRC_TAB[(c^u[i])&255]^(c>>>8); return (c^0xFFFFFFFF)>>>0; }

function zipOhneKompression(files){
  const enc=new TextEncoder(), parts=[], central=[]; let off=0;
  for(const f of files){ const name=enc.encode(f.name), data=f.data, crc=crc32(data);
    const h=new DataView(new ArrayBuffer(30)); h.setUint32(0,0x04034b50,true); h.setUint16(4,20,true); h.setUint16(8,0,true);
    h.setUint32(14,crc,true); h.setUint32(18,data.length,true); h.setUint32(22,data.length,true); h.setUint16(26,name.length,true);
    parts.push(new Uint8Array(h.buffer),name,data);
    const c=new DataView(new ArrayBuffer(46)); c.setUint32(0,0x02014b50,true); c.setUint16(4,20,true); c.setUint16(6,20,true);
    c.setUint32(16,crc,true); c.setUint32(20,data.length,true); c.setUint32(24,data.length,true); c.setUint16(28,name.length,true); c.setUint32(42,off,true);
    central.push(new Uint8Array(c.buffer),name); off+=30+name.length+data.length; }
  const size=central.reduce((s,a)=>s+a.length,0), e=new DataView(new ArrayBuffer(22));
  e.setUint32(0,0x06054b50,true); e.setUint16(8,files.length,true); e.setUint16(10,files.length,true); e.setUint32(12,size,true); e.setUint32(16,off,true);
  return new Blob([...parts,...central,new Uint8Array(e.buffer)],{type:"model/3mf"});
}

/* teile: [{name, mesh, color: "#RRGGBB"}] */
function dreiMF(teile){
  const enc=new TextEncoder(), x=[];
  x.push(`<?xml version="1.0" encoding="UTF-8"?>\n<model unit="millimeter" xml:lang="de-DE" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02">\n<metadata name="Title">FILL THE SPACE</metadata>\n<resources>\n<basematerials id="1">`);
  for(const t of teile) x.push(`<base name="${t.name}" displaycolor="${t.color}FF"/>`);
  x.push(`</basematerials>\n`);
  teile.forEach((t,i)=>{ const p=t.mesh.pos, idx=t.mesh.idx;
    x.push(`<object id="${i+2}" type="model" name="${t.name}" pid="1" pindex="${i}"><mesh><vertices>`);
    for(let k=0;k<p.length;k+=3) x.push(`<vertex x="${p[k].toFixed(3)}" y="${p[k+1].toFixed(3)}" z="${p[k+2].toFixed(3)}"/>`);
    x.push(`</vertices><triangles>`);
    for(let k=0;k<idx.length;k+=3) x.push(`<triangle v1="${idx[k]}" v2="${idx[k+1]}" v3="${idx[k+2]}"/>`);
    x.push(`</triangles></mesh></object>\n`); });
  const gruppe=teile.length+2;
  x.push(`<object id="${gruppe}" type="model" name="FILL THE SPACE"><components>${teile.map((t,i)=>`<component objectid="${i+2}"/>`).join("")}</components></object>\n`);
  x.push(`</resources>\n<build><item objectid="${gruppe}"/></build>\n</model>\n`);
  return zipOhneKompression([
    {name:"[Content_Types].xml",data:enc.encode(`<?xml version="1.0" encoding="UTF-8"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/></Types>`)},
    {name:"_rels/.rels",data:enc.encode(`<?xml version="1.0" encoding="UTF-8"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/></Relationships>`)},
    {name:"3D/3dmodel.model",data:enc.encode(x.join(""))}
  ]);
}

// Zwei Netze zu einem zusammenhängen (für STL: Bauteil und Schrift in einer Datei)
function netzeVerbinden(a,b){
  const pos=new Float32Array(a.pos.length+b.pos.length), idx=new Uint32Array(a.idx.length+b.idx.length), n=a.pos.length/3;
  pos.set(a.pos); pos.set(b.pos,a.pos.length); idx.set(a.idx); for(let i=0;i<b.idx.length;i++) idx[a.idx.length+i]=b.idx[i]+n;
  return {pos,idx};
}
