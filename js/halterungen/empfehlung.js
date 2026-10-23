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
const SPANNUNG=6;      // N/mm², was ein PLA-Druck dauerhaft auf Biegung aushält (vorsichtig)
const DRUCKBETT=250;  // mm, übliche Druckbettgröße als Voreinstellung; einstellbar unter „Drucker“

function mountCapacity(model){
  const i=model.mount||{kind:"schrauben"};
  if(i.kind==="tuer") return TRAGKRAFT.tuerHaken*(i.width/50)*(i.t/3)**2;
  if(i.kind==="skadis") return TRAGKRAFT.skadisHaken*i.hooks;
  return TRAGKRAFT.schraube*((model.screw&&model.screw.n)||0);
}

/* Liefert {text, detail, mat, walls, infill} und legt Warnhinweise in model.alerts ab */
function recommend(type,v,model){
  const kg=(+v.mass||0)/1000, alerts=model.alerts=[], i=model.mount||{kind:"schrauben"}, haken=i.kind!=="schrauben";
  // Hebel: Je weiter das Bauteil vor der Wand hängt und je tiefer die Befestigung sitzt, desto stärker zieht es an ihr
  const pts=(model.screw&&model.screw.pts)||[], zFix=haken ? i.zFix : pts.length ? pts.reduce((a,q)=>a+q[1],0)/pts.length : 0;
  const hebel=Math.hypot(1,(model.arm||0)/Math.max(zFix,10)), last=kg*hebel, cap=mountCapacity(model);
  // Biegung der Halterung selbst (Konsole, Leiste, Ablage): Spannung an der Rückwand in N/mm²
  const sigma=model.beam&&model.beam.Wsec>0 ? kg*9.81*(model.arm||0)/model.beam.Wsec : 0;
  if(!cap) return {text:"–", detail:"Ohne Befestigung lässt sich nichts abschätzen.", mat:MATERIALIEN[0], walls:3, infill:0.15};
  // Material: das einfachste, bei dem Befestigung (höchstens 60 % der Tragkraft) und Halterung (Biegung) reichen
  const ausl=m=>Math.max(last/(cap*m.faktor), 0.6*sigma/(SPANNUNG*m.faktor));
  const mat=MATERIALIEN.find(m=>ausl(m)<=0.6)||MATERIALIEN[MATERIALIEN.length-1], u=ausl(mat);
  const [walls,infill] = u<=0.3 ? [3,0.15] : u<=0.45 ? [4,0.3] : [5,0.5], druck=`${walls} Wände, ${Math.round(infill*100)} % Füllung`;
  const art={schrauben:"die Schrauben",tuer:"der Türhaken",skadis:"die SKÅDIS-Haken"}[i.kind], wer={schrauben:"die Schrauben",tuer:"den Türhaken",skadis:"die SKÅDIS-Haken"}[i.kind];

  // Warnhinweise: kurze Überschrift plus Einzelheiten zum Aufklappen
  const mountU=last/(cap*mat.faktor), beamU=0.6*sigma/(SPANNUNG*mat.faktor);
  if(beamU>0.6) alerts.push({id:"biegung",kurz:`${model.beam.name} biegt sich durch`, lang:`Bei ${mmDE(kg)} kg und ${mmDE(model.arm)} mm Abstand zur Wand wird ${model.beam.name.toLowerCase()} selbst zu stark belastet und biegt sich auf Dauer durch oder bricht, auch in ${mat.name}. ${model.beam.tipp}`});
  if(mountU>0.6) alerts.push({id:"gewicht",kurz:`Zu schwer für ${wer}`, lang:`Für ${mmDE(kg)} kg ist die Befestigung auch in ${mat.name} an der Grenze.`+(i.kind==="skadis"?" Die Halterung breiter machen, dann passen mehr SKÅDIS-Haken, oder „Schrauben“ wählen.":haken?" Besser „Schrauben“ als Befestigung wählen.":" Mehr Schrauben wählen. Hilfreich ist auch eine höhere Rückwand (die Schrauben sitzen dann höher und der Hebel wird kleiner) oder eine weniger tiefe Halterung.")});
  else if(mat.name!=="PLA"&&haken&&last>0.6*cap) alerts.push({id:"gewicht",kurz:`Zu schwer für ${wer} in PLA`, lang:`Für ${mmDE(kg)} kg ${art==="der Türhaken"?"hält":"halten"} ${art} in PLA auf Dauer voraussichtlich nicht. Entweder in ${mat.name} drucken oder „Schrauben“ als Befestigung wählen.`});
  // Verdrehen: nur ein Befestigungspunkt
  if(!haken&&model.screw&&model.screw.n===1) alerts.push({id:"drehen",kurz:"Kann sich verdrehen", lang: model.screw.avail.includes(2)
    ? "Mit nur einer Schraube kann sich die Halterung um die Schraube drehen. Besser 2 Schrauben wählen."
    : "Mit nur einer Schraube kann sich die Halterung um die Schraube drehen. Für eine zweite Schraube ist die Rückwand zu klein: Halterung breiter oder höher machen oder SKÅDIS-Haken verwenden."});
  if(i.kind==="skadis"&&i.hooks===1&&!i.pin) alerts.push({id:"drehen",kurz:"Kann sich verdrehen", lang:"Es passt nur ein SKÅDIS-Haken und darunter kein Stift. Die Halterung kann sich am Haken drehen. Halterung mindestens 56 mm breit oder 60 mm hoch machen."});
  // Lange Halterungen: zu großer Abstand zwischen den Schrauben oder bis zum Rand
  const xs=(haken?[]:pts.map(q=>q[0])).sort((a,b)=>a-b), W=model.bb[1]-model.bb[0];
  if(xs.length){ const spans=[2*xs[0],2*(W-xs[xs.length-1])].concat(xs.slice(1).map((x,k)=>x-xs[k]));
    if(Math.max(...spans)>300) alerts.push({id:"laenge",kurz:"Zu lang für die Schrauben", lang:`Die Halterung ist ${mmDE(W)} mm breit. Zwischen den Schrauben oder am Rand ist zu viel Abstand, dort hängt sie durch oder steht von der Wand ab. Mehr Schrauben wählen oder die Halterung kürzer machen.`}); }
  // Druckbett
  // Grundfläche in der empfohlenen Druckrichtung; das Teil darf auf dem Bett auch um 90° gedreht liegen
  const [dx,dy,dz]=model.dims, [a,b]=model.dir==="Boden unten"?[dx,dy]:model.dir==="Rückwand unten"?[dx,dz]:[dy,dz], L=state.bed.x, B=state.bed.y;
  if(!((a<=L&&b<=B)||(a<=B&&b<=L))) alerts.push({id:"bett",kurz:"Größer als das Druckbett", lang:`Beim Drucken liegt die Halterung auf einer Fläche von ${mmDE(a)} × ${mmDE(b)} mm, das Druckbett ist auf ${mmDE(L)} × ${mmDE(B)} mm eingestellt. Kleiner machen, in Teilen drucken oder unter „Drucker“ die Größe deines Druckbetts eintragen.`});

  const traegt=(art[0].toUpperCase()+art.slice(1))+(art==="der Türhaken"?" trägt":" tragen");
  return {mat, walls, infill, text:`${mat.name} · ${druck}`, detail:`Geschätzte Last ${mmDE(last)} kg${hebel>1.05?" (mit Hebelwirkung)":""}. ${traegt} in PLA dauerhaft etwa ${mmDE(cap)} kg.`};
}

/* Filamentverbrauch mit den empfohlenen Einstellungen: Außenhaut (Wände, Boden, Deckel je 0,45 mm) voll, Inneres mit Füllung.
   Ohne Stützmaterial. Liefert Gramm und Meter bei 1,75-mm-Filament. */
function filamentUse(vol,area,rec){
  const shell=Math.min(vol,area*rec.walls*0.45), cm3=(shell+(vol-shell)*rec.infill)/1000;
  return {g:cm3*rec.mat.dichte, m:cm3*1000/(Math.PI*0.875*0.875)/1000};
}
