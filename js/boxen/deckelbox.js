HALTERUNGEN.deckelbox = {
  bereich:"box",
  name:"Deckelbox",
  hint:"Box mit Deckel, der gleich mitgedruckt wird. Steckdeckel: Der Deckel hat einen Rand, der in die Box greift. Schiebedeckel: Der Deckel gleitet von vorne in eine Nut. Einlegedeckel: flache Platte, die innen auf einem Absatz liegt. Stapelbar: Die Box bekommt unten einen Fuß, der Deckel liegt etwas tiefer, damit der Fuß der nächsten Box darüber Platz hat. Das geht mit Schiebe- und Einlegedeckel.",
  defaults:{...TEXT_STANDARD,lid:"steck",stack:false,L:120,B:80,H:50,r:4,t:2,tb:1.6,fx:1,fy:1,label:false},
  fields:[
    // Steckdeckel ist nicht stapelbar (sein Rand steht oben über); bei „Stapelbar“ wird daraus der Einlegedeckel
    {k:"lid",c:"seg",l:"Deckel",o:[["steck","Steckdeckel"],["schiebe","Schiebedeckel"],["einlege","Einlegedeckel"]],oShow:(val,v)=>!(v.stack&&val==="steck")},
    {k:"stack",c:"check",l:"Stapelbar (Fuß unten)",on:v=>{ if(v.stack&&v.lid==="steck") v.lid="einlege"; }},
    BOX_MASSE,
    ...BOX_WAND,
    BOX_FAECHER,
    {k:"label",c:"check",l:"Vertieftes Feld vorne (für ein Etikett)"},
    ...TEXT_FELDER
  ],
  build:p=>buildBox(p,{lid:p.stack&&p.lid==="steck"?"einlege":p.lid,stack:p.stack,label:p.label})
};
