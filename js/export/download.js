/* ---------- Datei im Browser speichern (landet im Download-Ordner) ---------- */
function saveFile(name,blob){
  const url=URL.createObjectURL(blob), a=document.createElement("a");
  a.href=url; a.download=name; a.hidden=true; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),10000);
}
