HALTERUNGEN.stapelbox = {
  bereich:"box",
  name:"Stapelbox",
  hint:"Offene Box mit Fuß: Der Boden ist etwas schmaler und steckt in der Box darunter, so lassen sich gleich große Boxen sicher stapeln. Mit Griffmulden, Beschriftungsfeld und Fächern.",
  defaults:{...TEXT_STANDARD,L:160,B:110,H:80,r:6,t:2,tb:2,fx:1,fy:1,grips:true,label:true},
  fields:[
    BOX_MASSE,
    ...BOX_WAND,
    BOX_FAECHER,
    {k:"grips",c:"check",l:"Griffmulden an den Schmalseiten"},
    {k:"label",c:"check",l:"Vertieftes Feld vorne (für ein Etikett)"},
    ...textFelder([["vorne","Vorne"],["hinten","Hinten"],["links","Links"],["rechts","Rechts"]])
  ],
  build:p=>buildBox(p,{stack:true,grips:p.grips,label:p.label})
};
