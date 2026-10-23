/* ---------- ZIP (Deflate, wenn der Browser es kann) ---------- */
const CRC=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0;}return t;})();
const crc32=b=>{let c=0xFFFFFFFF;for(let i=0;i<b.length;i++)c=CRC[(c^b[i])&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0;};
async function deflate(data){ try{ if(typeof CompressionStream==="undefined") return null;
  const s=new Blob([data]).stream().pipeThrough(new CompressionStream("deflate-raw")); return new Uint8Array(await new Response(s).arrayBuffer()); }catch(e){ return null; } }
async function zip(files){
  const enc=new TextEncoder(), parts=[], central=[]; let off=0;
  for(const f of files){
    const name=enc.encode(f.name), raw=f.data, crc=crc32(raw), comp=await deflate(raw), method=comp?8:0, data=comp||raw;
    const h=new DataView(new ArrayBuffer(30));
    h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(6,0x0800,true);h.setUint16(8,method,true);h.setUint16(12,0x5d50,true);
    h.setUint32(14,crc,true);h.setUint32(18,data.length,true);h.setUint32(22,raw.length,true);h.setUint16(26,name.length,true);
    parts.push(new Uint8Array(h.buffer),name,data);
    const c=new DataView(new ArrayBuffer(46));
    c.setUint32(0,0x02014b50,true);c.setUint16(4,20,true);c.setUint16(6,20,true);c.setUint16(8,0x0800,true);c.setUint16(10,method,true);c.setUint16(14,0x5d50,true);
    c.setUint32(16,crc,true);c.setUint32(20,data.length,true);c.setUint32(24,raw.length,true);c.setUint16(28,name.length,true);c.setUint32(42,off,true);
    central.push(new Uint8Array(c.buffer),name);
    off+=30+name.length+data.length;
  }
  const csize=central.reduce((a,b)=>a+b.length,0);
  const e=new DataView(new ArrayBuffer(22));
  e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,csize,true);e.setUint32(16,off,true);
  return new Blob([...parts,...central,new Uint8Array(e.buffer)],{type:"application/zip"});
}
