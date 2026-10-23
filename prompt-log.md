# Prompt-Protokoll: Halterungs-Generator

Ziel der App: Aus Gerätemaßen oder einem Foto automatisch eine 3D-druckbare Wandhalterung erzeugen und als STL speichern.
Start: 16.10.2026
Werkzeuge: Claude (Desktop-App), Claude Code, GitHub Desktop

Die Prompts 1–6 stammen aus dem Ideen-Chat mit Claude und sind im Original-Wortlaut übernommen. Ab Prompt 7 geht es in Claude Code weiter.

---

## Prompt 1 – Die Idee (16.10.2026)

**Prompt:**
> Es gibt so viele 3-D Modelle der unterschiedlichsten Art online zum Beispiel von Firmen, die ihre Bauteile als 3-D Datensatz online stellen, aber auch in Foren in den 3-D Druckdaten vorgehalten werden. Könnte man aus diesen ganzen Daten nicht was schönes vibe coden, was für den Alltag nützlich ist.

**Entscheidung:**
- Claude schlug vier Ideen vor: Ersatzteil-Finder, Halterungs-Generator, Normteil-Erkenner und Schubladen-Organizer. Dazu kam der Hinweis, dass viele Modelle unter Lizenzen stehen und die App deshalb verlinken statt selbst hosten sollte.

**Betroffene Dateien:** keine

---

## Prompt 2 – Erste Demo (16.10.2026)

**Prompt:**
> Halterungs-Generator

**Was sich geändert hat:**
- Eine erste klickbare Web-App entstand. Man wählt ein Gerät oder gibt Breite, Tiefe und Höhe ein, sieht die Halterung live in 3D und kann sie als STL- und OpenSCAD-Datei speichern.
- Vier Vorlagen gab es: Fernbedienung, Smartphone, Powerbank und Router.

**Betroffene Dateien:** halterung.html

**Screenshot:** prompt-log-bilder/02-nachher.png (nachträglich aufnehmen)

**Commit-Nachricht:** Prompt 2: Erste Demo des Halterungs-Generators

---

## Prompt 3 – Werkzeug, Kosmetik und runde Formen (16.10.2026)

**Prompt:**
> Könnte man noch weitere Geräte hinzufügen, zum Beispiel Akkuschrauber oder andere Hanwerklich Geräte, vielleicht auch irgendwelche Kosmetikprode? Die Form würde dann nicht immer rechteckig aussehen. Vielleicht wäre sie dann etwas komplizierter.

**Was sich geändert hat:**
- Statt nur eines Kastens gibt es drei Halterungsarten. Der Köcher kann eckig, abgerundet oder rund sein. Die Ablage hat einen Schlitz oder Ring, zum Beispiel für Akkuschrauber und Föhn. Die Leiste hat Löcher, etwa für Schraubendreher und Lippenstifte.
- Die Geometrie wird jetzt als mathematische Form beschrieben und in ein Dreiecksnetz umgerechnet. Dadurch sind Rundungen und Stützen möglich.

**Betroffene Dateien:** halterung.html

**Commit-Nachricht:** Prompt 3: Drei Halterungsarten und runde Formen

---

## Prompt 4 – Bedienung umgebaut (16.10.2026)

**Prompt:**
> Das sieht schon sehr gut aus. Eine kleine Anmerkung hätte ich. Ich würde die Halterung Arth als oberstes platzieren und darunter vielleicht als Dropdown Menü oder ähnlich. Die Anzeige wechseln je nachdem, worauf der Benutzer klickt. Beispiel kriegt er auf den Köcher, kriegt er die Vorlagenmöglichkeiten angezeigt vom Köcher klickt er auf Werkzeug bekommt er die entsprechenden Werkzeugvorlagen angezeigt und so weiter

**Was sich geändert hat:**
- Ganz oben wählt man jetzt die Halterungsart. Darunter zeigt ein Dropdown nur die passenden Vorlagen an.

**Betroffene Dateien:** halterung.html

**Commit-Nachricht:** Prompt 4: Halterungsart oben, Vorlagen als Dropdown

---

## Prompt 5 – Umriss aus Foto (16.10.2026)

**Prompt:**
> Diese Idee von dir können wir jetzt noch umsetzen : Ein sinnvoller nächster Schritt wäre eine vierte Art, bei der die Aussparung direkt aus dem Umriss des Geräts entsteht. Du lädst ein Foto von der Seite oder eine Kontur hoch und bekommst eine passgenaue Form, etwa für eine Heißklebepistole oder einen Lockenstab.

**Was sich geändert hat:**
- Es gibt eine vierte Art namens „Kontur“. Man lädt ein Foto hoch, die App erkennt den Umriss des Geräts und baut eine Tasche, die genau dem Umriss folgt. Den Maßstab liefert ein bekanntes Maß am Gerät.
- Zum Ausprobieren gibt es Beispielumrisse einer Heißklebepistole und eines Lockenstabs.

**Betroffene Dateien:** halterung.html

**Commit-Nachricht:** Prompt 5: Vierte Halterungsart aus Foto-Umriss

---

## Prompt 6 – Kurswechsel: einfache individuelle Halterung (16.10.2026)

**Prompt:**
> Das erkennen der Kontur so wie du es beschrieben hast. Mit dem Foto und dem Maßstab finde ich gut. Ich würde jedoch nicht die Kontur eins zu eins nachbauen. Vielmehr müsste auch hier ein einfaches Modell gebaut werden, was ein Gerät oder Gegenstand, der von oben oder von vorne eingesetzt, wird festhält und der Nichte von der Schwerkraft her nach unten fallen wird durch die Halterung. Deshalb würde ich auch die Halterungs Art nicht Kontur nennen. Sondern eher so etwas wie individuelle Halterung.

**Was sich geändert hat:**
- Die vierte Art heißt jetzt „Individuell“ und baut den Umriss nicht mehr nach. Aus dem Foto wird nur noch erkannt, wo das Gerät breiter wird und dort aufliegen kann.
- Mit einer solchen Auflagekante entsteht eine Ablage mit Schlitz, in die man das Gerät von vorne oder von oben einsetzt. Ohne Auflagekante entsteht eine einfache Schale.
- Fehler beim Testen: Die Heißklebepistole lag zuerst nur auf dem Abzug auf und hätte kippen können. Jetzt hat eine Auflage auf beiden Seiten Vorrang. Das wurde im selben Prompt behoben.

**Betroffene Dateien:** halterung.html

**Commit-Nachricht:** Prompt 6: Individuelle Halterung statt Kontur-Nachbau

### Etappe: Prototyp im Chat (Prompts 1–6, 16.10.2026)

**Ziel:** Von einer vagen Idee zu einer klickbaren Demo, die echte druckbare Halterungen erzeugt.
**Ergebnis:** Die Web-App kennt vier Halterungsarten (Köcher, Ablage, Leiste, Individuell) mit 16 Vorlagen. Sie zeigt die Halterung in 3D und speichert STL und OpenSCAD. Bei der Art „Individuell“ erkennt sie aus einem Foto, wo ein Gerät aufliegen kann.
**Schlüssel-Prompt:** Nr. 6, weil hier Lioba die Richtung korrigiert hat: lieber eine einfache, sinnvolle Halterung als eine exakte Kopie des Umrisses.
**Schwierigkeiten:** Der Kontur-Ansatz aus Prompt 5 wurde in Prompt 6 wieder verworfen. Die Auflageerkennung wählte zuerst eine einseitige Auflage (Abzug statt Korpus). Den Foto-Upload konnte Claude im Chat nicht selbst im Browser testen.
**Präsentationstauglich:** ja. Ein guter Vorher-nachher-Vergleich ist Prompt 5 gegen Prompt 6, also Kontur-Tasche gegen Ablage mit Schlitz bei der Heißklebepistole.

---

## Prompt 7 – Vom Chat-Prototyp zum Projekt: der Plan (23.10.2026)

**Prompt:**
> Ich möchte mit dir eine App bauen: den Halterungs-Generator. Die Idee ist, dass man
> für ein Gerät oder einen Gegenstand automatisch eine Wandhalterung für den 3D-Drucker
> erzeugen kann, zum Beispiel für eine Fernbedienung, einen Akkuschrauber, einen Föhn
> oder Kosmetikprodukte. Die Halterung soll man in 3D sehen und als STL-Datei und als
> OpenSCAD-Datei speichern können.
>
> Ich habe die Idee schon mit Claude im Chat entwickelt. Im Ordner liegt die Demo
> halterung-demo.html. Die soll der Ausgangspunkt sein. Die App hat vier Halterungsarten:
> Köcher, Ablage, Leiste und Individuell. Ganz oben wählt man die Halterungsart, darunter
> kommen in einem Dropdown die passenden Vorlagen. Bei „Individuell“ lädt man ein Foto
> vom Gerät hoch und gibt ein bekanntes Maß an. Die App erkennt dann, wo das Gerät
> aufliegen kann, und baut eine einfache Halterung, in die man es von oben oder von vorne
> einsetzt und aus der es durch die Schwerkraft nicht herausfällt. Es soll also keine
> 1:1-Kopie vom Umriss sein, sondern ein einfaches Modell.
>
> Bitte mach daraus ein ordentliches Projekt:
> - Teile den Code sinnvoll auf, damit man ihn später leichter erweitern kann.
> - Die App soll im Browser laufen und über GitHub Pages erreichbar sein.
> - Das Projekt soll auf GitHub liegen, Repository „halterungs-generator“ unter
>   meinem Benutzer lioba-source.
>
> Wichtig für mich: Ich arbeite nicht mit dem Terminal, sondern mit GitHub Desktop.
> Sag mir bei GitHub bitte genau, was ich in GitHub Desktop klicken muss, und gib mir
> nach jeder Änderung die Commit-Nachricht.
>
> Parallel soll das Prompt-Protokoll für meine Präsentation in der Vorlesung
> mitgeschrieben werden. Nutze dafür den Skill „app-prompt-protokoll“. Die Datei
> prompt-log.md liegt schon im Ordner und enthält die Prompts 1 bis 6 aus dem Chat.
> Mach mit Prompt 7 weiter. Dieser Prompt hier ist Nr. 7. Falls du den Skill nicht
> findest, dann bitte so: nach jedem Prompt, der etwas ändert, einen Eintrag anhängen
> mit meinem Prompt im genauen Wortlaut, was sich geändert hat (verständlich, ohne
> Fachchinesisch), betroffenen Dateien und Commit-Nachricht. Fehler ehrlich festhalten.
> Nach einer größeren Etappe eine kurze Zusammenfassung ergänzen.
>
> Bevor du loslegst, zeig mir bitte zuerst deinen Plan: wie du das Projekt aufteilst
> und in welchen Schritten wir vorgehen. Dann bauen wir Schritt für Schritt.

**Entscheidung:**
- Claude hat die Demo durchgesehen und einen Plan vorgeschlagen: Die eine große Datei wird in mehrere kleine Dateien aufgeteilt, je eine pro Halterungsart, dazu eigene Dateien für Foto-Erkennung, 3D-Ansicht und Export. Es gibt keinen Build-Schritt, damit die App direkt per Doppelklick und auf GitHub Pages läuft.
- Zwei Probleme sind dabei aufgefallen: Der Speichern-Knopf der Demo funktioniert nur innerhalb von Claude und muss für GitHub Pages umgebaut werden. Außerdem heißt das verbundene GitHub-Repository bisher „halterungs-generato_app“ statt „halterungs-generator“.
- Der Ordner prompt-log-bilder/ für Screenshots wurde angelegt.

**Betroffene Dateien:** prompt-log.md, prompt-log-bilder/

**Commit-Nachricht:** Prompt 7–9: Projektplan, .gitignore und Code aufgeteilt (zusammen mit Prompt 9 committet)

---

## Prompt 8 – .gitignore (23.10.2026)

**Prompt:**
> Lege bitte auch eine .gitignore an, die die macOS-Dateien (.DS_Store) ausschließt und alles, was für das Projekt sonst nicht ins Repository gehört.

**Was sich geändert hat:**
- Eine Liste mit Dateien, die GitHub Desktop ab jetzt ignoriert: versteckte macOS-Dateien wie .DS_Store, Einstellungsordner von Editoren, persönliche Claude-Einstellungen und lokal gespeicherte ZIP-Downloads der App.

**Betroffene Dateien:** .gitignore

**Commit-Nachricht:** Prompt 7–9: Projektplan, .gitignore und Code aufgeteilt (zusammen mit Prompt 9 committet)

---

## Prompt 9 – Repository umbenennen, Code aufteilen (23.10.2026)

**Prompt:**
> Ich benenne das bestehende Repository auf GitHub in halterungs-generator um. Sag mir die Klicks dafür und leg dann mit Schritt 2 los.

**Was sich geändert hat:**
- Die Demo bestand aus einer einzigen großen Datei mit fast 800 Zeilen. Jetzt ist sie auf 17 JavaScript-Dateien, eine CSS-Datei und index.html verteilt: eine pro Halterungsart, dazu eigene Dateien für Grundformen, Foto-Erkennung, 3D-Ansicht, Export und Bedienung.
- Jede Halterungsart trägt sich selbst in eine gemeinsame Liste ein. Eine neue Art braucht deshalb nur eine neue Datei und eine Zeile in index.html. Das steht auch in der neuen README.
- Die App sieht aus und rechnet wie vorher. Zur Kontrolle hat Claude alle 16 Vorlagen in der alten und der neuen Version im Browser durchgerechnet und verglichen: Maße, Material, Gewicht und OpenSCAD-Code waren überall gleich.
- Die alte Demo liegt jetzt in archiv/ für den Vorher-nachher-Vergleich.
- Beim Testen aufgefallen: Die alte Demo zeigt Umlaute falsch an, wenn man sie außerhalb von Claude öffnet („GerÃ¤t“ statt „Gerät“), weil die Angabe zur Zeichenkodierung fehlte. In der neuen index.html ist das behoben, die Archivdatei bleibt unverändert.
- Noch offen: Der Speichern-Knopf funktioniert weiterhin nur innerhalb von Claude. Das kommt im nächsten Schritt.

**Betroffene Dateien:** index.html, css/style.css, js/ (17 Dateien), README.md, archiv/halterung-demo.html (verschoben), .gitignore

**Wichtigster Code-Ausschnitt:** So meldet sich eine Halterungsart an (js/halterungen/koecher.js):
```js
HALTERUNGEN.koecher = {
  name:"Köcher",
  hint:"Das Gerät steht in einer Schale. …",
  defaults:{shape:"eckig",B:45,T:22,H:170, …},
  fields:[ … Eingabefelder … ],
  build:p=>buildKoecher(p)
};
```

**Commit-Nachricht:** Prompt 7–9: Projektplan, .gitignore und Code aufgeteilt

---

## Prompt 10 – Speichern im normalen Browser (23.10.2026)

**Prompt:**
> Committet und gepusht. Mach mit Schritt 3 weiter: Speichern für den normalen Browser.

**Was sich geändert hat:**
- Der Knopf „STL + OpenSCAD speichern“ funktioniert jetzt in jedem Browser. Bisher ging er nur innerhalb von Claude und zeigte sonst „Speichern geht in dieser Ansicht nicht“. Jetzt landet eine ZIP-Datei mit der STL- und der OpenSCAD-Datei im Download-Ordner. Innerhalb von Claude speichert die App wie bisher.
- Getestet mit der Vorlage Akkuschrauber: Die ZIP enthält halterung-akkuschrauber.stl mit 261.120 Dreiecken und halterung-akkuschrauber.scad. Beide Dateien ließen sich wieder auspacken und waren vollständig.
- Fehler beim Committen: Der Commit aus Prompt 9 ist im Projektordner nicht angekommen. Git zeigte danach immer noch nur den ersten Commit, und alle neuen Dateien waren noch nicht eingecheckt.

**Betroffene Dateien:** js/export/download.js (neu), js/main.js, index.html, README.md

**Wichtigster Code-Ausschnitt:** (js/export/download.js)
```js
function saveFile(name,blob){
  const url=URL.createObjectURL(blob), a=document.createElement("a");
  a.href=url; a.download=name; a.hidden=true; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),10000);
}
```

**Commit-Nachricht:** Prompt 7–10: Projekt aufgeteilt, Speichern im Browser

---

## Prompt 11 – GitHub Pages vorbereiten (23.10.2026)

**Prompt:**
> Ich habe den Ordner geprüft, committet und gepusht. Mach mit Schritt 4 weiter: GitHub Pages einschalten.

**Was sich geändert hat:**
- Eine leere Datei .nojekyll wurde angelegt. Sie sagt GitHub Pages, dass die Dateien unverändert ausgeliefert werden sollen, ohne den Umweg über den Seitenbauer „Jekyll“. Das macht die Veröffentlichung schneller und verhindert, dass Dateien verschluckt werden.
- Claude hat die Klicks erklärt, mit denen man Pages auf github.com einschaltet.
- Fehler: Der Commit und die Umbenennung sind wieder nicht angekommen. Im Projektordner und auf GitHub gab es weiterhin nur den ersten Commit. Das Repository hieß auf GitHub noch „halterungs-generato_app“, die Adresse „halterungs-generator“ lieferte „nicht gefunden“. Pages konnte deshalb noch nicht eingeschaltet werden.

**Betroffene Dateien:** .nojekyll (neu)

**Commit-Nachricht:** Prompt 7–11: Projekt aufgeteilt, Speichern im Browser, Pages vorbereitet

---

## Prompt 12 – Claude committet (23.10.2026)

**Prompt:**
> Committe du bitte lokal mit der Nachricht aus dem Protokoll. Pushen mache ich danach selbst in GitHub Desktop.

**Entscheidung:**
- Weil der Commit über GitHub Desktop zweimal nicht angekommen war, hat Claude die Änderungen aus den Prompts 7 bis 12 selbst im Projektordner committet. Hochladen (Push) und das Umbenennen des Repositorys auf GitHub macht Lioba weiterhin selbst.

**Betroffene Dateien:** keine neuen Änderungen an der App

**Commit-Nachricht:** Prompt 7–11: Projekt aufgeteilt, Speichern im Browser, Pages vorbereitet (enthält auch diesen Eintrag)
