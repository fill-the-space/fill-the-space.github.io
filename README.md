# FILL THE SPACE

Der Halterungs-Generator heißt jetzt „FILL THE SPACE“. Seit dem 23.10.2026 heißen auch Repository und Adresse „fill-the-space“ (vorher „halterungs-generator“).

Erzeugt Wandhalterungen für den 3D-Drucker: Halterungsart wählen, Maße mit Schiebereglern und Feldern einstellen (alle Längen in Millimetern), Halterung in 3D ansehen und als STL-Datei speichern.

**App öffnen:** https://fill-the-space.netlify.app/ (lässt sich auf dem Handy über „Zum Home-Bildschirm“ wie eine App installieren)

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
manifest.webmanifest          Web-App: Name, Symbol und Farbe für den Startbildschirm des Handys
sw.js                         Web-App: Offline-Speicher (funktioniert nach dem ersten Öffnen auch ohne Internet)
icons/                        App-Symbole
css/style.css                 Aussehen
js/geometrie/formen.js        Grundformen (Kasten, Rundung, Schraubloch)
js/geometrie/netz.js          Form in ein Dreiecksnetz umrechnen
js/geometrie/schrift.js       Beschriftung: Text und kleines Bild als Relief, Schriftarten, Flächen
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
js/export/dreimf.js           3MF-Datei: Bauteil und Beschriftung als zwei Teile mit eigener Farbe
js/export/download.js         Datei in den Download-Ordner speichern
js/ui/…                       3D-Vorschau, Foto-Anzeige, Formular
js/ui/anordnung.js            Anordnung: Teile an Wand, SKÅDIS-Lochplatte, Schranktür oder im Kasten platzieren, verschieben und stapeln
js/ui/werkzeuge.js            Handy: Werkzeugleiste unter der 3D-Vorschau, zeigt nur die Einstellungen des gewählten Werkzeugs
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
