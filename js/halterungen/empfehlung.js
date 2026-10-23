/* ---------- Druckempfehlung nach Gewicht des Bauteils ----------
   Grobe Schätzung, keine Statik: Was trägt die gewählte Befestigung dauerhaft, wenn sie aus PLA gedruckt ist,
   und welches Material reicht mit Sicherheitsabstand für das Gewicht des Bauteils.
   Werte in kg Dauerlast bei PLA (PLA gibt unter Dauerlast mit der Zeit nach, deshalb vorsichtig angesetzt). */
const TRAGKRAFT={schraube:4, skadisHaken:1, tuerHaken:2.5};   // Türhaken: je 50 mm Breite bei 3 mm Stärke
const MATERIALIEN=[
  {name:"PLA", kurz:"PLA", faktor:1, dichte:1.24},
  {name:"PETG", kurz:"PETG", faktor:1.3, dichte:1.27},
  {name:"PA-CF (Nylon mit Carbonfasern)", kurz:"PA-CF", faktor:2, dichte:1.2}
];
// Bauteile, die weit vor der Wand hängen, hebeln stärker an der Befestigung
const HEBEL={koecher:1, leiste:1, konsole:1.5, individuell:1.3};

function mountCapacity(model){
  const i=model.mount||{kind:"schrauben"};
  if(i.kind==="tuer") return TRAGKRAFT.tuerHaken*(i.width/50)*(i.t/3)**2;
  if(i.kind==="skadis") return TRAGKRAFT.skadisHaken*i.hooks;
  return TRAGKRAFT.schraube*((model.screw&&model.screw.n)||0);
}

/* Liefert {text, detail} und legt bei Bedarf Warnhinweise in model.alerts ab */
function recommend(type,v,model){
  const kg=(+v.mass||0)/1000, hebel=type==="individuell"&&model.mode==="stellen"?1:HEBEL[type]||1, last=kg*hebel, cap=mountCapacity(model);
  if(!cap) return {text:"–", detail:"Ohne Befestigung lässt sich nichts abschätzen.", mat:MATERIALIEN[0], walls:3, infill:0.15};
  // Sicherheitsabstand: höchstens 60 % der geschätzten Tragkraft ausnutzen
  const mat=MATERIALIEN.find(m=>last<=0.6*cap*m.faktor)||MATERIALIEN[MATERIALIEN.length-1], u=last/(cap*mat.faktor);
  const [walls,infill] = u<=0.3 ? [3,0.15] : u<=0.45 ? [4,0.3] : [5,0.5], druck=`${walls} Wände, ${Math.round(infill*100)} % Füllung`;
  const art={schrauben:"die Schrauben",tuer:"der Türhaken",skadis:"die SKÅDIS-Haken"}[(model.mount||{}).kind||"schrauben"];
  // Warnhinweise: kurze Überschrift plus Einzelheiten zum Aufklappen
  const alerts=model.alerts=[], haken=model.mount&&model.mount.kind!=="schrauben", wer={schrauben:"die Schrauben",tuer:"den Türhaken",skadis:"die SKÅDIS-Haken"}[(model.mount||{}).kind||"schrauben"];
  if(u>0.6) alerts.push({id:"gewicht",kurz:`Zu schwer für ${wer}`, lang:`Für ${mmDE(kg)} kg ist die Halterung auch in ${mat.name} an der Grenze.`+(haken?" Besser „Schrauben“ als Befestigung wählen.":" Mehr Schrauben oder eine dickere Rückwand wählen.")});
  else if(mat.name!=="PLA"&&haken) alerts.push({id:"gewicht",kurz:`Zu schwer für ${wer} in PLA`, lang:`Für ${mmDE(kg)} kg ${art==="der Türhaken"?"hält":"halten"} ${art} in PLA auf Dauer voraussichtlich nicht. Entweder in ${mat.name} drucken oder „Schrauben“ als Befestigung wählen.`});
  const traegt=(art[0].toUpperCase()+art.slice(1))+(art==="der Türhaken"?" trägt":" tragen");
  return {mat, walls, infill, text:`${mat.name} · ${druck}`, detail:`Geschätzte Last ${mmDE(last)} kg${hebel>1?" (mit Hebelwirkung)":""}. ${traegt} in PLA dauerhaft etwa ${mmDE(cap)} kg.`};
}

/* Filamentverbrauch mit den empfohlenen Einstellungen: Außenhaut (Wände, Boden, Deckel je 0,45 mm) voll, Inneres mit Füllung.
   Ohne Stützmaterial. Liefert Gramm und Meter bei 1,75-mm-Filament. */
function filamentUse(vol,area,rec){
  const shell=Math.min(vol,area*rec.walls*0.45), cm3=(shell+(vol-shell)*rec.infill)/1000;
  return {g:cm3*rec.mat.dichte, m:cm3*1000/(Math.PI*0.875*0.875)/1000};
}
