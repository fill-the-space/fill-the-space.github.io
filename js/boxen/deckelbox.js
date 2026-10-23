HALTERUNGEN.deckelbox = {
  bereich:"box",
  name:"Deckelbox",
  hint:"Box mit Deckel, der gleich mitgedruckt wird. Steckdeckel: Der Deckel hat einen Rand, der in die Box greift. Schiebedeckel: Der Deckel gleitet von vorne in eine Nut.",
  defaults:{lid:"steck",L:120,B:80,H:50,r:4,t:2,tb:1.6,fx:1,fy:1,label:false},
  fields:[
    {k:"lid",c:"seg",l:"Deckel",o:[["steck","Steckdeckel"],["schiebe","Schiebedeckel"]]},
    BOX_MASSE,
    ...BOX_WAND,
    BOX_FAECHER,
    {k:"label",c:"check",l:"Beschriftungsfeld vorne"}
  ],
  build:p=>buildBox(p,{lid:p.lid,label:p.label})
};
