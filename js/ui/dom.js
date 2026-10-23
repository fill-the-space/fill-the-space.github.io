/* ---------- Kleine DOM-Helfer ---------- */
const $=id=>document.getElementById(id);
function cssColor(name){return getComputedStyle(document.documentElement).getPropertyValue(name).trim()||"#888";}
