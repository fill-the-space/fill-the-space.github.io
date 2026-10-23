/* ---------- Vorlagen: Liste der fertigen Geräte im Dropdown ---------- */
const PRESETS = [
  {g:"Elektronik", id:"fernbedienung", name:"Fernbedienung", type:"koecher", p:{shape:"eckig",B:45,T:22,H:170,pct:40,lip:18,slot:false}},
  {g:"Elektronik", id:"smartphone", name:"Smartphone", type:"koecher", p:{shape:"abgerundet",B:76,T:12,H:150,r:9,pct:45,lip:14,slot:true}},
  {g:"Elektronik", id:"powerbank", name:"Powerbank", type:"koecher", p:{shape:"abgerundet",B:70,T:25,H:140,r:5,pct:50,lip:20,slot:true}},
  {g:"Elektronik", id:"router", name:"Router hochkant", type:"koecher", p:{shape:"eckig",B:48,T:200,H:250,pct:30,lip:30,slot:true}},
  {g:"Werkzeug", id:"akkuschrauber", name:"Akkuschrauber", type:"ablage", ghost:"drill", p:{ap:"schlitz",N:46,L:80,Dp:125,W:150,P:6,Hp:70,s:1}},
  {g:"Werkzeug", id:"bohrhammer", name:"Akku-Bohrhammer", type:"ablage", ghost:"drill", p:{ap:"schlitz",N:58,L:95,Dp:145,W:175,P:7,Hp:80,s:1}},
  {g:"Werkzeug", id:"schraubendreher", name:"Schraubendreher", type:"leiste", p:{n:6,d:9,a:34,wd:26,blind:false,P:6,Hp:45,s:0.5}},
  {g:"Werkzeug", id:"inbus", name:"Bit-Halter", type:"leiste", p:{n:10,d:7.2,a:12,wd:12,blind:true,depth:12,P:5,Hp:40,s:0.2}},
  {g:"Bad & Kosmetik", id:"foehn", name:"Föhn", type:"ablage", ghost:"dryer", p:{ap:"ring",N:72,Dp:115,W:130,P:6,Hp:70,s:1}},
  {g:"Bad & Kosmetik", id:"haarspray", name:"Haarspray-Dose", type:"koecher", p:{shape:"rund",B:54,T:54,H:230,pct:30,lip:30,slot:false}},
  {g:"Bad & Kosmetik", id:"parfum", name:"Parfümflakon", type:"koecher", p:{shape:"rund",B:62,T:36,H:110,pct:45,lip:25,slot:false}},
  {g:"Bad & Kosmetik", id:"lippenstifte", name:"Lippenstifte", type:"leiste", p:{n:5,d:21,a:28,wd:20,blind:true,depth:18,P:5,Hp:50,s:0.4}},
  {g:"Bad & Kosmetik", id:"pinsel", name:"Make-up-Pinsel", type:"leiste", p:{n:6,d:13,a:22,wd:16,blind:true,depth:28,P:5,Hp:60,s:0.4}},
  {g:"Beispielfotos", id:"klebepistole", name:"Heißklebepistole", type:"individuell", sample:"gun", p:{refAxis:"w",ref:230,T:48,insert:"vorne",rot:0}},
  {g:"Beispielfotos", id:"lockenstab", name:"Lockenstab", type:"individuell", sample:"curl", p:{refAxis:"h",ref:310,T:36,insert:"oben",rot:0}},
  {g:"Beispielfotos", id:"shampoo", name:"Shampooflasche", type:"individuell", sample:"bottle", p:{refAxis:"h",ref:250,T:50,fill:40,lip:20,rot:0}},
  {g:"Eigene", id:"eigene", name:"Eigene Maße", custom:true}
];
