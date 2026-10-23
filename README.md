# Halterungs-Generator

Erzeugt Wandhalterungen für den 3D-Drucker: Halterungsart wählen, Vorlage aussuchen oder Maße eintragen, Halterung in 3D ansehen und als STL- und OpenSCAD-Datei speichern.

**App öffnen:** https://lioba-source.github.io/halterungs-generator/ (nachdem GitHub Pages eingeschaltet ist)

Lokal ausprobieren: `index.html` im Finder doppelklicken.

## Halterungsarten

| Art | Wofür |
|---|---|
| Köcher | Gerät steht in einer Schale, z. B. Fernbedienung, Smartphone, Haarspray |
| Ablage | Werkzeug hängt mit Griff oder Körper in einem Schlitz oder Ring, z. B. Akkuschrauber, Föhn |
| Leiste | Mehrere Löcher nebeneinander, z. B. Schraubendreher, Lippenstifte, Pinsel |
| Individuell | Foto hochladen und ein bekanntes Maß angeben. Die App erkennt, wo das Gerät aufliegen kann, und baut eine einfache Halterung zum Einhängen oder Hineinstellen |

## Aufbau des Projekts

```
index.html                    Seitenaufbau
css/style.css                 Aussehen
js/geometrie/formen.js        Grundformen (Kasten, Rundung, Schraubloch)
js/geometrie/netz.js          Form in ein Dreiecksnetz umrechnen
js/foto/erkennung.js          Gerät im Foto finden, Auflagekante suchen
js/halterungen/register.js    Liste aller Halterungsarten
js/halterungen/koecher.js     je Halterungsart: Name, Standardmaße,
js/halterungen/ablage.js      Eingabefelder und Berechnung der Form
js/halterungen/leiste.js      samt OpenSCAD-Code
js/halterungen/individuell.js
js/vorlagen.js                Vorlagen im Dropdown
js/export/stl.js, zip.js      Dateien zum Speichern erzeugen
js/export/download.js         ZIP in den Download-Ordner speichern
js/ui/…                       3D-Vorschau, Foto-Anzeige, Formular
js/zustand.js                 aktuelle Auswahl, wird im Browser gemerkt
js/main.js                    verbindet alles
archiv/halterung-demo.html    ursprüngliche Demo aus dem Chat
prompt-log.md                 Prompt-Protokoll für die Präsentation
```

### Neue Halterungsart hinzufügen

1. Neue Datei in `js/halterungen/`, z. B. `haken.js`, nach dem Muster der anderen: `HALTERUNGEN.haken = { name, hint, defaults, fields, build }`.
2. In `index.html` eine Zeile `<script src="js/halterungen/haken.js"></script>` unter den anderen Halterungsarten ergänzen.
3. Passende Vorlagen in `js/vorlagen.js` mit `type:"haken"` eintragen.

Die 3D-Ansicht nutzt [three.js](https://threejs.org) (r128) über cdnjs.
