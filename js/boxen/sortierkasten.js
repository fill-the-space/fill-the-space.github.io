HALTERUNGEN.sortierkasten = {
  bereich:"box",
  name:"Sortier\u00adkasten",   // weiches Trennzeichen: bricht im schmalen Knopf als „Sortier-kasten“ um
  hint:"Flacher Kasten mit vielen Fächern für Schrauben, Perlen, Bits oder Kosmetik. Wahlweise stapelbar.",
  defaults:{...TEXT_STANDARD,L:200,B:120,H:40,r:3,t:1.6,tb:1.6,fx:4,fy:3,stack:false},
  fields:[
    BOX_MASSE,
    BOX_FAECHER,
    ...BOX_WAND,
    {k:"stack",c:"check",l:"Stapelbar (Fuß unten)"},
    ...textFelder([["vorne","Vorne"],["hinten","Hinten"],["links","Links"],["rechts","Rechts"]])
  ],
  build:p=>buildBox(p,{stack:p.stack})
};
