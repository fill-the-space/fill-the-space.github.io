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

---

## Prompt 13 – Online-Prüfung (23.10.2026)

**Prompt:**
> Ich habe umbenannt, gepusht und Pages eingeschaltet. Prüf bitte, ob die App online läuft, und schreib die Etappen-Zusammenfassung.

**Entscheidung:**
- Claude hat GitHub und die Pages-Adresse geprüft. Die App war noch nicht online: Die Adresse lioba-source.github.io/halterungs-generator lieferte „nicht gefunden“. Das Repository hieß auf GitHub weiterhin „halterungs-generato_app“, der letzte Upload stammte vom Vormittag vor Beginn der Arbeit in Claude Code, und Pages war dort ausgeschaltet. Der lokale Commit aus Prompt 12 war noch nicht hochgeladen.
- Die Etappen-Zusammenfassung wird deshalb erst geschrieben, wenn die App wirklich online läuft.
- Fehler: Zum dritten Mal sind Schritte in GitHub Desktop bzw. auf github.com nicht angekommen, obwohl sie als erledigt gemeldet wurden. Lehre für die Präsentation: Nach jedem Schritt das Ergebnis prüfen, z. B. im Reiter „History“ oder auf der GitHub-Seite.

**Betroffene Dateien:** prompt-log.md

**Commit-Nachricht:** Prompt 13–18: Repository umbenannt, Pages eingeschaltet

---

## Prompt 14 – Kann Claude umbenennen? (23.10.2026)

**Prompt:**
> Kannst du das selber umbenennen

**Entscheidung:**
- Claude kann GitHub über den Browser-Bereich der Claude-App bedienen, braucht dafür aber eine Anmeldung. Passwörter darf Claude nicht selbst eingeben, deshalb meldet sich Lioba an.

**Betroffene Dateien:** keine

---

## Prompt 15 – Anmeldung im falschen Browser (23.10.2026)

**Prompt:**
> Ich bin jetzt im Browser auf Github angemeldet.

**Entscheidung:**
- Fehler: Die Anmeldung war in einem anderen Browser passiert, nicht im Browser-Bereich von Claude. Dort zeigte GitHub weiter „Sign in“. Claude hat die Anmeldeseite im Browser-Bereich geöffnet.

**Betroffene Dateien:** keine

---

## Prompt 16 – Repository umbenannt (23.10.2026)

**Prompt:**
> Ich habe mich jetzt im Browser-Bereich von Claude angemeldet. Benenne das Repository um.

**Was sich geändert hat:**
- Claude hat das Repository auf GitHub von „halterungs-generato_app“ in „halterungs-generator“ umbenannt. Die neue Adresse ist github.com/lioba-source/halterungs-generator.
- Der Projektordner zeigt jetzt auf die neue Adresse, GitHub Desktop lädt also künftig dorthin hoch.
- Kleiner Stolperer: Der erste Klick auf „Rename“ kam zu früh, weil GitHub noch prüfte, ob der Name frei ist. Erst der zweite Klick hat funktioniert.
- Noch offen: Hochladen (Push) und GitHub Pages.

**Betroffene Dateien:** keine Dateien der App (nur die Projekteinstellung „Remote-Adresse“)

**Commit-Nachricht:** Prompt 13–18: Repository umbenannt, Pages eingeschaltet

---

## Prompt 17 – GitHub Pages eingeschaltet (23.10.2026)

**Prompt:**
> Ich habe in GitHub Desktop committet und gepusht. Schalte bitte GitHub Pages ein und prüfe, ob die App online läuft.

**Was sich geändert hat:**
- Claude hat GitHub Pages im Browser-Bereich eingeschaltet: Quelle ist der Branch „main“, Ordner „/ (root)“. GitHub hat die Einstellung bestätigt.
- Fehler: Der Push war wieder nicht angekommen. Auf GitHub lag weiterhin nur der erste Commit, und der Commit „Prompt 13–16“ fehlte auch im Projektordner. Die App ist deshalb noch nicht online, die Pages-Adresse liefert „nicht gefunden“. Sobald der Push durch ist, baut GitHub die Seite automatisch.

**Betroffene Dateien:** keine Dateien der App (Einstellung auf GitHub)

**Commit-Nachricht:** Prompt 13–18: Repository umbenannt, Pages eingeschaltet

---

## Prompt 18 – Claude pusht (23.10.2026)

**Prompt:**
> Ja, committe das Protokoll und pushe du beide Commits. Prüf danach, ob die App online läuft, und schreib die Etappen-Zusammenfassung.

**Entscheidung:**
- Weil der Push aus GitHub Desktop mehrmals nicht angekommen war, hat Claude das Protokoll committet und beide Commits selbst zu GitHub hochgeladen.

**Betroffene Dateien:** prompt-log.md

**Commit-Nachricht:** Prompt 13–18: Repository umbenannt, Pages eingeschaltet

**Nachtrag zu Prompt 18:**
- Fehler: Claude konnte nicht pushen, weil auf dem Mac keine GitHub-Anmeldung für die Kommandozeile gespeichert ist. Die Anmeldung kennt nur GitHub Desktop.
- Ursache aller bisherigen Commit- und Push-Probleme gefunden: GitHub Desktop kannte den Projektordner gar nicht. In seiner Liste stand nur ein anderes Projekt (stl-parametrisch). Commits und Pushes landeten deshalb nie in diesem Ordner. Lösung: den Ordner in GitHub Desktop über „File → Add Local Repository…“ hinzufügen.

---

## Prompt 19 – Claude öffnet den Ordner in GitHub Desktop (23.10.2026)

**Prompt:**
> kannst du das machen

**Entscheidung:**
- Claude kann in dieser Sitzung keine Desktop-Programme fernsteuern. GitHub Desktop bringt aber einen eigenen Befehl mit, der einen Ordner öffnet. Damit hat Claude den Projektordner an GitHub Desktop übergeben und den Nachtrag selbst committet. Den Push muss Lioba in GitHub Desktop auslösen, weil nur dort ihre GitHub-Anmeldung gespeichert ist.

**Betroffene Dateien:** prompt-log.md

**Commit-Nachricht:** Prompt 18–19: Nachtrag Push-Problem

---

## Prompt 20 – Die App ist online (23.10.2026)

**Prompt:**
> Ich habe in GitHub Desktop auf Push origin geklickt. Prüf bitte, ob die App online läuft, und schreib die Etappen-Zusammenfassung.

**Was sich geändert hat:**
- Der Push ist angekommen, und die App läuft jetzt unter https://lioba-source.github.io/halterungs-generator/. Claude hat sie dort getestet: Alle 16 Vorlagen werden berechnet, die 3D-Ansicht funktioniert, das Speichern liefert eine ZIP-Datei (Föhn: 263.720 Dreiecke), und die Konsole zeigt keine Fehler.
- Fehler beim Online-Test gefunden und behoben: Der Bereich „Foto und Erkennung“ war auch bei Köcher, Ablage und Leiste zu sehen. Eine Gestaltungsregel hat das Ausblenden überstimmt. Innerhalb von Claude fiel das nicht auf, weil Claude die Seite in ein eigenes Grundgerüst mit passender Regel einbettet. Eine zusätzliche Zeile im Stylesheet behebt das. Lokal getestet, online erst nach dem nächsten Push.

**Betroffene Dateien:** css/style.css, prompt-log-bilder/20-vorher.jpg, prompt-log-bilder/20-nachher.jpg

**Wichtigster Code-Ausschnitt:** (css/style.css)
```css
[hidden]{display:none!important}
```

**Screenshot:** prompt-log-bilder/20-vorher.jpg / 20-nachher.jpg

**Commit-Nachricht:** Prompt 20–22: Foto-Bereich bei anderen Halterungsarten ausblenden

### Etappe: Vom Chat-Prototyp zum Online-Projekt (Prompts 7–20, 23.10.2026)

**Ziel:** Aus der einzelnen Demo-Datei ein sauber aufgeteiltes Projekt machen, das auf GitHub liegt und über GitHub Pages im Browser erreichbar ist.
**Ergebnis:** Der Code ist auf 17 kleine JavaScript-Dateien verteilt, jede Halterungsart hat ihre eigene Datei. Das Speichern funktioniert in jedem Browser. Die App liegt im Repository „halterungs-generator“ und läuft online unter lioba-source.github.io/halterungs-generator.
**Schlüssel-Prompt:** Nr. 9, weil dort die Aufteilung entstand. Claude hat alle 16 Vorlagen in alter und neuer Version verglichen, um sicherzugehen, dass nichts kaputtgegangen ist.
**Schwierigkeiten:** Der größte Umweg kam nicht vom Code, sondern vom Werkzeug. Commits und Pushes aus GitHub Desktop kamen viermal nicht an, weil der Projektordner dort gar nicht eingetragen war. Gefunden wurde das erst in Prompt 18. Außerdem gab es eine Anmeldung im falschen Browser (Prompt 15) und zwei Fehler, die nur außerhalb von Claude sichtbar wurden: das Speichern (Prompt 10) und der Foto-Bereich (Prompt 20).
**Präsentationstauglich:** ja. Gut zeigen lassen sich die Live-Adresse, die Ordnerstruktur in der README und der Vorher-nachher-Vergleich 20-vorher/20-nachher. Die Lehre aus der Git-Odyssee: Nach jedem Schritt das Ergebnis prüfen, nicht nur die Meldung „erledigt“.

---

## Prompt 21 – Korrektur noch nicht angekommen (23.10.2026)

**Prompt:**
> Ich habe die Korrektur committet und gepusht. Prüf bitte kurz, ob der Foto-Bereich online jetzt richtig ausgeblendet wird.

**Entscheidung:**
- Fehler: Die Korrektur war weder committet noch hochgeladen. Online erschien der Foto-Bereich deshalb weiterhin bei allen Halterungsarten. Vermutlich fehlte der Klick auf „Commit to main“, sodass „Push origin“ nichts hochzuladen hatte.

**Betroffene Dateien:** keine

---

## Prompt 22 – Claude committet die Korrektur (23.10.2026)

**Prompt:**
> Ja, committe du die Korrektur lokal. Ich klicke dann in GitHub Desktop auf Push origin.

**Entscheidung:**
- Claude hat die Korrektur aus Prompt 20 samt Screenshots und Protokoll lokal committet. Lioba lädt sie mit „Push origin“ hoch. Diese Arbeitsteilung hatte in Prompt 20 schon funktioniert.

**Betroffene Dateien:** css/style.css, prompt-log.md, prompt-log-bilder/20-vorher.jpg, prompt-log-bilder/20-nachher.jpg

**Commit-Nachricht:** Prompt 20–22: Foto-Bereich bei anderen Halterungsarten ausblenden

---

## Prompt 23 – Korrektur online bestätigt (23.10.2026)

**Prompt:**
> Ich habe auf Push origin geklickt. Prüf bitte, ob der Foto-Bereich online richtig ausgeblendet wird.

**Entscheidung:**
- Der Push ist angekommen. Auf der Live-Seite ist der Foto-Bereich jetzt bei Köcher, Ablage und Leiste ausgeblendet und nur bei „Individuell“ sichtbar. Die Konsole zeigt keine Fehler.
- Beobachtung: Beim ersten Aufruf zeigte der Browser noch die alte Version, weil er die Gestaltungsdatei zwischengespeichert hatte. GitHub Pages hält Dateien etwa 10 Minuten im Zwischenspeicher. Mit Cmd+Shift+R lädt man die Seite frisch.

**Betroffene Dateien:** keine Dateien der App

**Commit-Nachricht:** Prompt 23–24: Online-Prüfung, Arbeitsregeln für Claude

---

## Prompt 24 – Claude übernimmt Protokoll, Commit und Push (23.10.2026)

**Prompt:**
> Kannst du den Push selber machen zukünftig und die Protokollierung auch

**Was sich geändert hat:**
- Neue Datei CLAUDE.md im Projekt. Darin stehen die Arbeitsregeln, die Claude in jeder künftigen Sitzung automatisch liest: nach jeder Änderung selbst protokollieren, selbst committen und pushen und danach prüfen, ob alles online angekommen ist. Zusätzlich hat sich Claude Liobas Arbeitsweise in seinem Gedächtnis gemerkt.
- Fehler bzw. Grenze: Zum Pushen braucht Claude einen eigenen Zugang zu GitHub. Den Versuch, dafür einen Zugangsschlüssel nur für dieses Repository zu erzeugen, hat die automatische Sicherheitsprüfung von Claude Code blockiert. Pushen bleibt deshalb vorerst bei Lioba in GitHub Desktop, bis sie entscheidet, wie der Zugang eingerichtet wird.

**Betroffene Dateien:** CLAUDE.md (neu), prompt-log.md

**Commit-Nachricht:** Prompt 23–24: Online-Prüfung, Arbeitsregeln für Claude

---

## Prompt 25 – Claude darf pushen (23.10.2026)

**Prompt:**
> Erzeuge den Zugangsschlüssel nur für dieses Repository. Ich erlaube das und trage ihn auf GitHub als Deploy Key ein.

**Prompt 26:**
> Ich habe den Deploy Key mit Schreibzugriff eingetragen. Teste bitte den Push.

**Was sich geändert hat:**
- Claude hat auf dem Mac einen Zugangsschlüssel erzeugt, der nur für dieses eine Repository gilt. Lioba hat ihn auf GitHub als „Deploy Key“ mit Schreibzugriff eingetragen. Er kann nichts anderes in ihrem Konto verändern und lässt sich jederzeit wieder löschen.
- Der erste Push mit dem Schlüssel hat funktioniert. Ab jetzt committet und pusht Claude nach jeder Änderung selbst, Lioba muss in GitHub Desktop nichts mehr klicken. In der CLAUDE.md ist das festgehalten.

**Betroffene Dateien:** CLAUDE.md

**Commit-Nachricht:** Prompt 25–26: Claude pusht selbst per Deploy Key

---

## Prompt 27 – Seite in Chrome öffnen (23.10.2026)

**Prompt:**
> Für die Seite gerne im Google Browser öffnen

**Entscheidung:**
- Claude öffnet die fertige Seite für Lioba ab jetzt in Google Chrome. Eigene Tests macht Claude weiter in seinem eingebauten Browser.

**Betroffene Dateien:** keine

---

## Prompt 28 – Ohne Vorlagen, alle Maße in Millimetern (23.10.2026)

**Prompt:**
> Ich würde den Reitervorlage weglassen und nur oben die Auswahl Köcherablageleiste und individuell nutzen. Der Nutzer kann selber seine Daten unten mit den Schieberegler einstellen. Der Schieberegler umschließen des Bauteilsist für mich missverständlich. Als Nutzer sagt eine Prozentzahl hier nichts. Für den Nutzer sind immer wichtig zu wissen, ob es Millimeter oder Zentimeter sind. Beim umschließen des Bauteil würde ich vielleicht die Höhen Ständerndungen nehmen. Das ist hier aus meiner Sicht mehr sinnvoll.

**Was sich geändert hat:**
- Das Dropdown „Vorlage“ ist weg. Man wählt oben nur noch Köcher, Ablage, Leiste oder Individuell und stellt die Maße darunter selbst ein. Jede Art startet mit sinnvollen Standardmaßen, und die App merkt sich die zuletzt eingestellten Werte.
- Der Regler „Umschließt Gerät zu … %“ heißt jetzt „Höhe der Schale“ und wird direkt in Millimetern eingestellt. Ist die Schale höher als das Gerät, wird sie auf die Gerätehöhe begrenzt, und ein Hinweis erscheint. Bei „Individuell“ wurde die Schalenhöhe genauso von Prozent auf Millimeter umgestellt.
- Alle Zahlenfelder zeigen jetzt ihre Einheit, z. B. „Breite (mm)“. Beim Köcher steht über Breite, Tiefe und Höhe „Maße des Geräts“, damit klar ist, dass das Gerät gemeint ist und nicht die Halterung.
- Für „Individuell“ ist ohne eigenes Foto weiter das Beispiel der Heißklebepistole zu sehen. Die Beispiele Lockenstab und Shampooflasche sind mit dem Dropdown weggefallen.
- Kleiner Stolperer beim Testen: Der Testbrowser hatte die alten Dateien zwischengespeichert und meldete deshalb Fehler, die es gar nicht mehr gab. Abhilfe: Testserver auf einem neuen Port starten.

**Betroffene Dateien:** index.html, css/style.css, js/ui/formular.js, js/zustand.js, js/main.js, js/ui/foto.js, js/halterungen/koecher.js, js/halterungen/individuell.js, js/halterungen/leiste.js, js/vorlagen.js (gelöscht), README.md, CLAUDE.md

**Wichtigster Code-Ausschnitt:** (js/halterungen/koecher.js)
```js
{k:"hs",c:"range",l:"Höhe der Schale",u:"mm",min:10,max:250,step:1},
…
const warn=[], hs=Math.min(p.hs,p.H);
if(p.hs>p.H) warn.push(`Höhe der Schale auf die Gerätehöhe von ${f2(p.H)} mm begrenzt.`);
```

**Screenshot:** prompt-log-bilder/28-vorher.jpg / 28-nachher.jpg

**Commit-Nachricht:** Prompt 27–28: Ohne Vorlagen, alle Maße in Millimetern

---

## Prompt 29 – Schrauben selbst wählen (23.10.2026)

**Prompt:**
> Als Nächstes würde ich noch eine Auswahl zur Verfügung stellen will, mit welcher Schraubenöse man die Halterung an der wann festmachen möchte und wie viel Schrauben man dafür verwenden möchte

**Was sich geändert hat:**
- Bei allen vier Halterungsarten wählt man jetzt unter „Schraublöcher in der Rückwand“ selbst aus:
  - **Schraube Ø:** 3, 3,5, 4, 5 oder 6 mm. Das Loch wird automatisch 0,5 mm größer.
  - **Schraubenkopf:** Senkkopf (Loch mit kegelförmiger Vertiefung, der Kopf liegt bündig) oder Flach-/Linsenkopf (gerades Loch).
  - **Anzahl Schrauben:** 1 bis 4. Bei 4 Schrauben setzt die App zwei Reihen übereinander, wenn die Rückwand hoch genug ist, sonst vier nebeneinander.
- Die App warnt, wenn die Schrauben zu eng sitzen oder wenn die Rückwand für einen versenkten Kopf zu dünn ist. Die OpenSCAD-Datei enthält die gewählten Löcher samt einer Kommentarzeile, welche Schraube gemeint ist.
- Unter der Vorschau steht jetzt ein Hinweis zu passenden Dübeln: 4-mm-Schrauben passen zu 6er-Dübeln, 5-mm-Schrauben zu 8er-Dübeln.
- Den Begriff „Schraubenöse“ hat Claude als Schraubengröße und Kopfform verstanden.
- Beim Testen gefunden und gleich behoben: Der Köcher zeigte schon in der Grundeinstellung eine Warnung, weil seine Rückwand nur 2,4 mm dick ist. Jetzt wird die Senkung still angepasst, und eine Warnung erscheint nur, wenn der Kopf spürbar übersteht. Außerdem lag bei 4 Schrauben die untere Reihe zu nah an der Kante (1 mm Material). Jetzt sind es mindestens 3 mm.
- Getestet: alle 160 Kombinationen aus Halterungsart, Schraubengröße, Kopfform und Anzahl. Jede liefert die richtige Zahl an Löchern und Senkungen.

**Betroffene Dateien:** js/halterungen/schrauben.js (neu), js/geometrie/formen.js, js/halterungen/koecher.js, ablage.js, leiste.js, individuell.js, index.html, README.md

**Wichtigster Code-Ausschnitt:** (js/halterungen/schrauben.js)
```js
const SCHRAUB_FELDER=[
  {k:"holes",c:"check",l:"Schraublöcher in der Rückwand"},
  {k:"sd",c:"seg",l:"Schraube Ø (mm)",o:[[3,"3"],[3.5,"3,5"],[4,"4"],[5,"5"],[6,"6"]],show:v=>v.holes},
  {k:"sk",c:"seg",l:"Schraubenkopf",o:[["senk","Senkkopf"],["flach","Flach- / Linsenkopf"]],show:v=>v.holes},
  {k:"sn",c:"seg",l:"Anzahl Schrauben",o:[[1,"1"],[2,"2"],[3,"3"],[4,"4"]],show:v=>v.holes}
];
```

**Screenshot:** prompt-log-bilder/29-vorher.jpg / 29-nachher.jpg

**Commit-Nachricht:** Prompt 29: Schraubengröße, Kopfform und Anzahl wählbar

**Nachtrag zu Prompt 29:**
- Fehler beim Online-Test gefunden: Der Browser hatte die neue Schrauben-Datei geladen, die vier Halterungsdateien aber noch aus dem Zwischenspeicher genommen. Die Schrauben-Auswahl fehlte deshalb online, obwohl GitHub schon die neue Version auslieferte. Lösung: Jede Datei wird jetzt mit einer Versionsnummer geladen (z. B. `ablage.js?v=29`). Nach jeder Änderung wird die Nummer erhöht, und der Browser holt alle Dateien gemeinsam neu. Die Regel steht in der CLAUDE.md.

**Betroffene Dateien:** index.html, CLAUDE.md

**Commit-Nachricht:** Prompt 29: Versionsnummer gegen gemischte Dateien im Browser

---

## Prompt 30 – Update im Browser nicht sichtbar (23.10.2026)

**Prompt:**
> Ich kenne das Update im Browser noch nicht sehen

**Entscheidung:**
- Auf GitHub war die neue Version schon online. Chrome zeigte aber noch die alte Startseite aus dem Zwischenspeicher. GitHub Pages erlaubt Browsern, die Seite bis zu 10 Minuten zwischenzuspeichern, und das lässt sich bei GitHub Pages nicht abschalten. Claude hat die Seite in Chrome mit einem Zusatz in der Adresse (`?v=29`) neu geöffnet, damit Chrome sie frisch lädt. Alternativ hilft Cmd+Shift+R.

**Betroffene Dateien:** keine

**Commit-Nachricht:** Prompt 30: Hinweis zum Zwischenspeicher protokolliert
