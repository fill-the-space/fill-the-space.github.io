# FILL THE SPACE

Der Halterungs-Generator heißt jetzt „FILL THE SPACE“. Das Repository und die Adresse behalten den alten Namen.

Erzeugt Wandhalterungen für den 3D-Drucker: Halterungsart wählen, Maße mit Schiebereglern und Feldern einstellen (alle Längen in Millimetern), Halterung in 3D ansehen und als STL-Datei speichern.

**App öffnen:** https://lioba-source.github.io/halterungs-generator/ (nachdem GitHub Pages eingeschaltet ist)

Lokal ausprobieren: `index.html` im Finder doppelklicken.

## Halterungsarten

| Art | Wofür |
|---|---|
| Köcher | Bauteil steht in einer Schale, z. B. Fernbedienung, Smartphone, Haarspray |
| Konsole | L-Form: Bauteil steckt mit dem schmalen Teil in einem Schlitz oder Ring, der breitere Teil liegt oben auf, z. B. Akkuschrauber, Föhn |
| Leiste | Mehrere Löcher nebeneinander, z. B. Schraubendreher, Lippenstifte, Pinsel |
| Individuell (derzeit ausgeblendet, Code bleibt erhalten) | Foto hochladen und ein bekanntes Maß angeben. Die App erkennt, wo das Bauteil aufliegen kann, und baut eine einfache Halterung zum Einhängen oder Hineinstellen |

## Aufbau des Projekts

```
index.html                    Seitenaufbau
css/style.css                 Aussehen
js/geometrie/formen.js        Grundformen (Kasten, Rundung, Schraubloch)
js/geometrie/netz.js          Form in ein Dreiecksnetz umrechnen
js/foto/erkennung.js          Bauteil im Foto finden, Auflagekante suchen
js/halterungen/register.js    Liste aller Halterungs- und Boxenarten, die zwei Seiten
js/halterungen/befestigung.js Befestigung: Schrauben, Haken über die Schranktür oder IKEA SKÅDIS
js/halterungen/schrauben.js   Schraubengröße, Anzahl und Lage der Löcher (für alle Arten)
js/halterungen/empfehlung.js  Druckempfehlung (Material, Wände, Füllung) nach Gewicht und Befestigung
js/halterungen/koecher.js     je Halterungsart: Name, Standardmaße,
js/halterungen/konsole.js     Eingabefelder und Berechnung der Form
js/halterungen/leiste.js      (der OpenSCAD-Code wird intern noch erzeugt, aber nicht angeboten)
js/halterungen/individuell.js
js/boxen/grundform.js         Seite „Boxen“: gemeinsame Form (Wände, Fächer, Stapelfuß, Deckel, Griffmulden)
js/boxen/stapelbox.js         je Boxenart: Name, Standardmaße, Eingabefelder
js/boxen/deckelbox.js
js/boxen/sortierkasten.js
js/export/stl.js              STL-Datei erzeugen
js/export/vereinfachen.js     Netz verkleinern (ebene Flächen mit wenigen Dreiecken)
js/export/download.js         Datei in den Download-Ordner speichern
js/ui/…                       3D-Vorschau, Foto-Anzeige, Formular
js/ui/anordnung.js            Anordnung: Teile an der Wand oder in der Schublade platzieren und verschieben
js/zustand.js                 aktuelle Auswahl, wird im Browser gemerkt
js/main.js                    verbindet alles
archiv/halterung-demo.html    ursprüngliche Demo aus dem Chat
prompt-log.md                 Prompt-Protokoll für die Präsentation
```

### Neue Halterungsart hinzufügen

Eine neue Boxenart funktioniert genauso, nur in `js/boxen/` mit `bereich:"box"` und `build:p=>buildBox(p,{…})`.


1. Neue Datei in `js/halterungen/`, z. B. `haken.js`, nach dem Muster der anderen: `HALTERUNGEN.haken = { name, hint, defaults, fields, build }`. Für die Wandbefestigung `...SCHRAUB_STANDARD` in `defaults` und `...SCHRAUB_FELDER` in `fields` übernehmen und in `build` `screwSpec`, `screwLayout`, `screwCut` und `screwSCAD` nutzen.
2. In `index.html` eine Zeile `<script src="js/halterungen/haken.js"></script>` unter den anderen Halterungsarten ergänzen.

Längen immer in Millimetern angeben (`u:"mm"` bei Schiebereglern; Zahlenfelder zeigen „(mm)“ automatisch, außer bei `u:""`).

Die 3D-Ansicht nutzt [three.js](https://threejs.org) (r128) über cdnjs.
