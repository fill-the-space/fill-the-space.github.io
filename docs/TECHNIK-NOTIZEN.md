# Technik-Notizen für die Weiterentwicklung

Ergänzt die README (Dateiliste, neue Halterungs-/Boxenart). Hier stehen das Zusammenspiel der Teile, Konventionen und die Stolperfallen, die im Lauf der Prompts aufgefallen sind – damit sie nicht noch einmal passieren.

## Grundprinzip

- **Kein Build-Schritt.** `index.html` lädt alle Skripte als klassische `<script>`-Tags in fester Reihenfolge (keine Module). Globale Funktionen/Konstanten werden über Dateigrenzen hinweg benutzt; die Reihenfolge in `index.html` ist wichtig.
- **Formen als Abstandsfelder (SDF).** Jede Form ist eine Funktion `f(x,y,z)` (negativ = innen). Grundbausteine in `js/geometrie/formen.js` (`rr2`, `ext`, `box3`, `poly2`, `screw`). Kombinieren: `Math.min` = vereinigen, `Math.max(a,-b)` = abziehen.
- **Netz:** `polygonize(f, bb, h)` in `js/geometrie/netz.js` (Surface Nets) macht daraus Dreiecke; beim Speichern `snapToSurface` (scharfe Kanten) und `simplifyMesh` (ebene Flächen zusammenfassen, `js/export/vereinfachen.js`).
- **Koordinaten:** mm. x = Breite, y = Tiefe (Halterungen: Rückwand bei y = 0, Teil ragt nach +y; Boxen: Vorderseite bei y = 0), z = Höhe.
- **3D-Vorschau:** three.js r128 (`js/ui/vorschau3d.js`), Kamera folgt der Begrenzungsbox.

## Bauteile (Registry)

`HALTERUNGEN.<id> = { bereich?, name, hint, defaults, fields, wall?, build }` – `bereich:"box"` legt fest, dass die Art auf der Seite „Boxen“ erscheint.
`build(p)` liefert ein Modell-Objekt:

| Feld | Bedeutung |
|---|---|
| `f`, `bb`, `dims` | Form, Begrenzungsbox `[x0,x1,y0,y1,z0,z1]`, Außenmaße |
| `teile` | (Boxen) einzelne Teile `[{f,bb}]`, z. B. Box und Deckel – werden getrennt gerechnet |
| `minWand` | dünnste Stelle in mm; bestimmt das Rechenraster (sonst Löcher!) |
| `plan` | (Boxen) Form im geschlossenen Zustand für die Anordnung im Kasten |
| `schilder` | Flächen für die Beschriftung (`ax` "x"/"y"/"z", `dir`, `p`, Bereich, `t` Wandstärke, `avoid`, `teil`, `zuPlan`, `nurEingelassen`) |
| `text` / `textPreview` / `textPlan` | Beschriftung als eigener Körper (3MF-Teil) / nur Vorschau (vertieft) / in der Anordnung |
| `mount`, `screw`, `beam`, `arm` | Befestigung, Schraubplan, Biegung, Hebel – für Empfehlung und Anordnung |
| `warn`, `alerts` | Hinweise unter dem Formular / rote Warnkästen |

Felder (`fields`): `seg`, `check`, `range`, `row` (Zahlenfelder), `text`, `image`; Optionen `show`, `oShow`, `oStyle`, `note`, `follow`, `on`, dynamische `min/max`.
Beschriftungsfelder: `textFelder([[fläche,Name],…])` aus `js/geometrie/schrift.js`.

## Zustand und Speicherung

`js/zustand.js`: `state` (Seite, Art, Werte je Art, Druckbett, Anordnung `plan`, Dateiformat, Farben) wird im `localStorage` unter `halterung-v3` gemerkt. Neue Felder beim Laden mit Standardwerten zusammenführen (alte gespeicherte Stände müssen weiter laden).

## Konventionen

- **Versionsnummer** `?v=<Prompt-Nr.>` an allen eigenen Dateien in `index.html` – bei jeder CSS/JS-Änderung hochsetzen.
- Texte in der Oberfläche auf Deutsch, Längen in mm.
- **Großbuchstaben-Stellen** (Überschriften, Knöpfe, Werkzeugleiste) dürfen kein „ß“ enthalten: CSS `text-transform:uppercase` macht daraus „SS“, die Schriften (Unbounded, Space Grotesk) haben kein großes ẞ → „Abmessungen“ statt „Maße“.
- **Handy vs. Computer:** Handy-Layout per `@media (max-width:820px)`. Auf dem Handy sind `.panel` und `.view` `display:contents`; Teile der Seite tragen `data-tool` und werden über die Werkzeugleiste (`js/ui/werkzeuge.js`) ein-/ausgeblendet. Nur-Handy-Elemente `.mob-only`.
- Design: „Wrapped Party“-Stil – #efefea, Schwarz, Limette #a4d63a, harte Schatten, Fonts Unbounded + Space Grotesk; Farben als CSS-Variablen in `:root` inkl. Dark Mode.

## Testen

- Lokaler Server: `.claude/launch.json` → `python3 -m http.server 8766` (im Repository enthalten). Im Browser-Bereich von Claude öffnen. Unter Windows den Eintrag `halterung-windows` nehmen (`python` statt `python3`, Letzteres öffnet dort nur den Microsoft Store).
- Immer Desktop **und** Handygröße (390 × 844; kleinste 320 × 568) prüfen; Konsole auf Fehler prüfen.
- Netze prüfen: geschlossen (jede Kante genau zweimal), bei dünnen Wänden Boden/Wand-Test, bei symmetrischen Teilen Spiegelprobe.
- Echte Geräte (iPhone) und echte Drucke finden Fehler, die der Test im Browser nicht zeigt – Lioba berichtet sie mit Screenshots.

## Bekannte Stolperfallen und Lösungen

| Problem | Ursache | Lösung (Prompt) |
|---|---|---|
| Browser mischt alte und neue Dateien | Zwischenspeicher | `?v=` hochsetzen (seit früh im Projekt) |
| Lokal kommen Änderungen nicht an | Offline-Speicher (`sw.js`) liefert alte Dateien | Service Worker nur auf https registrieren (87) |
| Mitlaufende Vorschau (sticky) geht nicht | `overflow-x:hidden` auf html/body | `overflow-x:clip` (80) |
| Löcher in dünnen Wänden/Böden | Rechenraster gröber als die Wand; Box+Deckel gemeinsam vergrößern das Raster | Teile getrennt rechnen, Raster ≤ 45 % von `minWand` (96–98) |
| Lücke nur auf einer Seite | Raster begann an einer Kante → links/rechts unterschiedlich abgetastet | Raster mittig auf die Begrenzungsbox legen (98) |
| Nut läuft durch die runde Ecke | rechteckige Nut, runde Box | Nut/Deckel folgen der Rundung, vorne eckig (97) |
| Kante über der Nut hängt in der Luft | waagerechter Überhang | 45°-Dach, oben 0,8 mm volle Wand (96/97) |
| Eingelassene Schrift verschwindet | Gleitkomma: 1,2 − 0,8 = 0,3999… < 0,4 | Werte runden (97) |
| 3MF-Teile liegen im Slicer getrennt | zwei Objekte im Build | ein Gruppenobjekt mit Komponenten (96) |
| „MASSE“ statt „Maße“ | uppercase + kein großes ẞ | „Abmessungen“ (89) |
| Werkzeugleiste auf iPhone nicht wischbar | – | `touch-action:pan-x` + Ziehen per Zeiger (87) |
| Netlify veröffentlicht nicht mehr | kostenloses Guthaben (~20 Veröffentlichungen/Monat) aufgebraucht | Umzug zu GitHub Pages der Organisation (101) |
| Push in die Organisation scheitert | neue Organisationen sperren Deploy Keys | Org → Settings → Deploy keys → Enabled (101) |
| Test-Server startet unter Windows nicht | `python3` ist dort nur ein Store-Platzhalter; Git nicht im PATH | Eintrag `halterung-windows` mit `python`; Git aus GitHub Desktop (103) |
| GitHub Desktop-Commits kamen nicht an | Ordner war in GitHub Desktop nicht eingebunden | Push-Zugang für Claude, nach jedem Push `git fetch` prüfen (früh) |

## Veröffentlichung

- GitHub Pages aus Branch `main`, Ordner `/`, Repository `fill-the-space/fill-the-space.github.io`.
- Push durch Claude über Deploy Key (Remote `claude`, SSH), GitHub Desktop nutzt `origin` (HTTPS). Siehe `CLAUDE.md` und `UEBERGABE.md` (neuer Rechner → neuer Schlüssel).
