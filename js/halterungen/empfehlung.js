/* ---------- Druckempfehlung nach Gewicht des Bauteils ----------
   Grobe Schätzung, keine Statik: Was trägt die gewählte Befestigung dauerhaft, wenn sie aus PLA gedruckt ist,
   und welches Material reicht mit Sicherheitsabstand für das Gewicht des Bauteils.
   Werte in kg Dauerlast bei PLA (PLA gibt unter Dauerlast mit der Zeit nach, deshalb vorsichtig angesetzt). */
const TRAGKRAFT={schraube:4, skadisHaken:1, tuerHaken:2.5};   // Türhaken: je 50 mm Breite bei 3 mm Stärke
const MATERIALIEN=[
  {name:"PLA", faktor:1},
  {name:"PETG", faktor:1.3},
  {name:"PA-CF (Nylon mit Carbonfasern)", faktor:2}
];
// Bauteile, die weit vor der Wand hängen, hebeln stärker an der Befestigung
const HEBEL={koecher:1, leiste:1, konsole:1.5, individuell:1.3};

function mountCapacity(model){
  const i=model.mount||{kind:"schrauben"};
  if(i.kind==="tuer") return TRAGKRAFT.tuerHaken*(i.width/50)*(i.t/3)**2;
  if(i.kind==="skadis") return TRAGKRAFT.skadisHaken*i.hooks;
  return TRAGKRAFT.schraube*((model.screw&&model.screw.n)||0);
}

/* Liefert {text, detail} und hängt bei Bedarf Warnungen an model.warn an */
function recommend(type,v,model){
  const kg=(+v.mass||0)/1000, hebel=type==="individuell"&&model.mode==="stellen"?1:HEBEL[type]||1, last=kg*hebel, cap=mountCapacity(model);
  if(!cap) return {text:"–", detail:"Ohne Befestigung lässt sich nichts abschätzen."};
  // Sicherheitsabstand: höchstens 60 % der geschätzten Tragkraft ausnutzen
  const mat=MATERIALIEN.find(m=>last<=0.6*cap*m.faktor)||MATERIALIEN[MATERIALIEN.length-1], u=last/(cap*mat.faktor);
  const druck = u<=0.3 ? "3 Wände, 15 % Füllung" : u<=0.45 ? "4 Wände, 30 % Füllung" : "5 Wände, 50 % Füllung";
  const art={schrauben:"die Schrauben",tuer:"der Türhaken",skadis:"die SKÅDIS-Haken"}[(model.mount||{}).kind||"schrauben"];
  if(u>0.6) model.warn.push(`Für ${mmDE(kg)} kg ist die Halterung auch in ${mat.name} an der Grenze.`+(model.mount&&model.mount.kind!=="schrauben"?" Besser „Schrauben“ als Befestigung wählen.":" Mehr Schrauben oder eine dickere Rückwand wählen."));
  else if(mat.name!=="PLA"&&model.mount&&model.mount.kind!=="schrauben") model.warn.push(`Für ${mmDE(kg)} kg ${art==="der Türhaken"?"hält":"halten"} ${art} in PLA auf Dauer voraussichtlich nicht. Entweder in ${mat.name} drucken oder „Schrauben“ als Befestigung wählen.`);
  const traegt=(art[0].toUpperCase()+art.slice(1))+(art==="der Türhaken"?" trägt":" tragen");
  return {text:`${mat.name} · ${druck}`, detail:`Geschätzte Last ${mmDE(last)} kg${hebel>1?" (mit Hebelwirkung)":""}. ${traegt} in PLA dauerhaft etwa ${mmDE(cap)} kg.`};
}
