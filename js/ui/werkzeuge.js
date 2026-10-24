/* ---------- Handy: Werkzeugleiste ----------
   Auf schmalen Bildschirmen bleibt der Kopf wie er ist; darunter steht die 3D-Vorschau fest oben, darunter eine Leiste mit
   Werkzeugen zum Wischen. Antippen zeigt nur die Einstellungen dieses Werkzeugs. Welche Teile der Seite zu welchem Werkzeug
   gehören, steht in index.html (data-tool); die Felder im Formular ordnet feldWerkzeug() zu. Am Computer ändert sich nichts. */
let werkzeug="masse";
const BEFESTIGUNG_FELDER=new Set(["mass","mount","door","hookL","hookT","doorScrews","sd","sn"]);
const SCHRIFT_FELDER=new Set(["txt","text","img","font","fett","kursiv","relief","th","flaeche","lage"]);
function feldWerkzeug(f){ const k=f.k||(f.row&&f.row[0].k); return BEFESTIGUNG_FELDER.has(k)?"befestigung":SCHRIFT_FELDER.has(k)?"text":"masse"; }

function werkzeugeZeigen(){
  const halter=state.page==="halterung";
  if(!halter&&werkzeug==="befestigung") werkzeug="masse";
  for(const b of document.querySelectorAll("#tools button")){ b.setAttribute("aria-pressed",String(b.dataset.w===werkzeug)); }
  document.querySelector('#tools [data-w="befestigung"]').hidden=!halter;
  $("wPlan").textContent=halter?"Wand":"Kasten";
  // mob-off blendet nur auf dem Handy aus (siehe CSS)
  for(const el of document.querySelectorAll("[data-tool]")) el.classList.toggle("mob-off",!el.dataset.tool.split(" ").includes(werkzeug));
}
// Wischen: Die Leiste scrollt normalerweise von selbst. Falls ein Gerät das nicht tut, verschiebt Ziehen sie per Hand;
// nach dem Ziehen zählt das Loslassen nicht als Tippen auf einen Knopf.
(()=>{ const t=$("tools"); let start=null, gezogen=false;
  t.addEventListener("pointerdown",e=>{ start={x:e.clientX,s:t.scrollLeft}; gezogen=false; });
  t.addEventListener("pointermove",e=>{ if(!start) return; const dx=e.clientX-start.x; if(Math.abs(dx)>6){ gezogen=true; t.scrollLeft=start.s-dx; } });
  const ende=()=>{ start=null; }; t.addEventListener("pointerup",ende); t.addEventListener("pointercancel",ende); t.addEventListener("pointerleave",ende);
  t.addEventListener("click",e=>{ if(gezogen){ e.stopPropagation(); e.preventDefault(); gezogen=false; } },true);
})();
for(const b of document.querySelectorAll("#tools button")) b.addEventListener("click",()=>{ werkzeug=b.dataset.w;
  // „Wand“ bzw. „Kasten“ schaltet die Vorschau gleich auf die Anordnung um
  if(werkzeug==="plan"&&!plan().on){ plan().on=true; planCamera(); renderAll(); } else werkzeugeZeigen();
  b.scrollIntoView({inline:"nearest",block:"nearest",behavior:"smooth"});
  // Nach dem Wechsel zum Anfang der Einstellungen, damit man nicht mitten im Menü landet
  const t=$("tools"); if(t.getBoundingClientRect().top<=parseFloat(getComputedStyle(t).top)+1) window.scrollTo({top:t.offsetTop-parseFloat(getComputedStyle(t).top),behavior:"smooth"}); });
