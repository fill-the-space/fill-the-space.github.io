/* ---------- Halterungsarten ----------
   Jede Art trägt sich in einer eigenen Datei hier ein:
   HALTERUNGEN.<id> = { name, hint, defaults, fields, build(p, {ghostKind, seg}) }
   Die Reihenfolge der <script>-Zeilen in index.html bestimmt die Reihenfolge der Knöpfe.
   bereich: auf welcher Seite die Art erscheint ("halterung" oder "box"; ohne Angabe "halterung"). */
const SEITEN={halterung:{name:"Halterungen",art:"Halterungsart",datei:"halterung"}, box:{name:"Boxen",art:"Boxenart",datei:"box"}};
const bereichVon=k=>HALTERUNGEN[k].bereich||"halterung";
const HALTERUNGEN = {};
// holes: Schraublöcher nur, wenn als Befestigung „Schrauben“ gewählt ist
// Beschriftung: als eigener Körper model.text (siehe geometrie/schrift.js)
function build(type,p,ghostKind,seg){ const m=HALTERUNGEN[type].build({...p,holes:(p.mount||"schrauben")==="schrauben"},{ghostKind,seg}); schriftModel(m,p,m.warn); return m; }
