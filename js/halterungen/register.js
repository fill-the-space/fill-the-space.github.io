/* ---------- Halterungsarten ----------
   Jede Art trägt sich in einer eigenen Datei hier ein:
   HALTERUNGEN.<id> = { name, hint, defaults, fields, build(p, {ghostKind, seg}) }
   Die Reihenfolge der <script>-Zeilen in index.html bestimmt die Reihenfolge der Knöpfe. */
const HALTERUNGEN = {};
// holes: Schraublöcher nur, wenn als Befestigung „Schrauben“ gewählt ist
function build(type,p,ghostKind,seg){ return HALTERUNGEN[type].build({...p,holes:(p.mount||"schrauben")==="schrauben"},{ghostKind,seg}); }
