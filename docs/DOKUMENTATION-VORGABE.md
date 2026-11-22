# Vorgabe: So wird FILL THE SPACE dokumentiert

Diese Vorgabe gilt für jede weitere Arbeit am Projekt, egal auf welchem Rechner. Sie entspricht dem Skill „app-prompt-protokoll“, mit dem das Protokoll bisher geführt wurde. Ist der Skill verfügbar, wird er genutzt; sonst gilt diese Datei.

**Zweck:** Lioba präsentiert die App in einer Vorlesung. Gezeigt werden die Prompts aus der Entwicklung und was sie bewirkt haben. Das Protokoll entsteht nebenbei, damit am Ende mit einem Satz eine Präsentation daraus werden kann.

---

## 1. Wann wird protokolliert?

- **Nach jedem Prompt, der etwas an der App ändert** – ohne dass Lioba darum bitten muss.
- **Wichtige Entscheidungen** auch ohne Code-Änderung (z. B. „Adresse bleibt“, Umzug zu GitHub Pages) – dann als „Entscheidung“.
- **Nicht** protokolliert: reine Verständnisfragen ohne Folgen (z. B. „Wo liegt der Code?“, „Wie lösche ich das Netlify-Projekt?“).
- Rückfragen und nachgeschobene Nachrichten gehören zum selben Eintrag (als „Nachgeschoben: …“ zitieren).

## 2. Vorlage für einen Prompt-Eintrag

Immer **am Ende** von `prompt-log.md` anhängen, vorher eine Trennlinie `---`. Bestehende Einträge **nie umschreiben** (höchstens ein klar markierter „Nachtrag zu Prompt …“ direkt dahinter). Nummern laufen weiter; die letzte steht am Ende der Datei.

```markdown
---

## Prompt <Nr.> – <kurzer Titel> (<TT.MM.JJJJ>)

**Prompt:**
> <Liobas Prompt im genauen Wortlaut, Tippfehler bleiben stehen>

(optional: Vorgeschichte, Rückfrage von Claude und Liobas Antwort, nachgeschobene Nachricht)

**Was sich geändert hat:**
- <in 1–3 verständlichen Sätzen pro Punkt, ohne Fachchinesisch>
- <Fehler ehrlich: „Fehler beim Testen: … – sofort behoben“ bzw. „Fehler aus Prompt X: …“>
- **Geprüft:** <was konkret getestet wurde, mit Zahlen, Größen, Geräten>
- **Noch offen / nicht geprüft:** <z. B. Probedruck, echter Slicer, echtes Gerät>

**Betroffene Dateien:** <index.html (Versionsnummer <Nr.>), …>

**Wichtigster Code-Ausschnitt:** (optional, höchstens ~10 Zeilen)

**Screenshot:** prompt-log-bilder/<Nr>-<stichwort>.jpg / …

**Commit-Nachricht:** Prompt <Nr.>: <kurzer Titel>
```

Regeln:
- Prompt **wörtlich** übernehmen (Liobas Spracheingabe enthält oft Hörfehler wie „Stapel Barr“, „Skana“, „Masse“ – im Zitat stehen lassen, in der Beschreibung richtig schreiben).
- Verständlich für Kommilitoninnen und Dozenten schreiben: was man sieht und warum, nicht wie der Code heißt.
- Fehler und Umwege **ehrlich** festhalten, auch eigene. Das ist für die Präsentation interessant.
- **Screenshots:** bei sichtbaren Änderungen vorher/nachher, Desktop und bei Handy-Themen Handygröße (390 × 844). Dateiname beginnt mit der Prompt-Nummer. Bilder von Lioba (z. B. Fehler-Screenshots) ebenfalls ablegen (`<Nr>-vorher-….webp`).
- Datum im Format TT.MM.JJJJ.

## 3. Commit und Push

- Commit-Nachricht genau wie im Eintrag: `Prompt <Nr.>: <Titel>`, darunter die Co-Authored-By-Zeile des verwendeten Claude-Modells.
- Protokoll-Eintrag, Screenshots und Code-Änderung in **einem** Commit.
- Danach pushen und online prüfen (siehe `CLAUDE.md` / `UEBERGABE.md`).
- In der Antwort an Lioba die Commit-Nachricht nennen.

## 4. Etappen-Zusammenfassung

Wenn ein Abschnitt abgeschlossen ist (typisch 3–8 Prompts, oder Lioba sagt es), direkt nach dem letzten Prompt-Eintrag anhängen. Im Zweifel Lioba in einem Satz fragen, ob die Etappe abgeschlossen ist.

```markdown
### Etappe: <Name> (Prompts <von>–<bis>, <Zeitraum>)

**Ziel:** <was erreicht werden sollte, 1 Satz>
**Ergebnis:** <was die App danach kann, 1–3 Sätze>
**Schlüssel-Prompt:** Nr. <x> – <warum gerade dieser>
**Schwierigkeiten:** <Fehler, Umwege, Entscheidungen; ehrlich und kurz>
**Präsentationstauglich:** <ja/nein + Hinweis, z. B. gute Vorher-nachher-Screenshots>
```

Commit dafür: „Etappen-Zusammenfassung: <Name>“.

Bisher vorhandene Etappen: 1–6, 7–20, 60–61, 80–84, 85–94, 95–101. **Noch ohne Etappe:** 21–59 und 62–79 – auf Wunsch nachträglich bilden und an passender Stelle einfügen (dann ausnahmsweise mitten in der Datei, sonst nichts umschreiben).

## 5. Präsentation erstellen

Auslöser: Lioba sagt z. B. „Mach aus dem Prompt-Log eine Präsentation“.
1. `prompt-log.md` vollständig lesen.
2. Etappen-Zusammenfassungen als Gerüst (je Etappe 1–2 Folien); fehlende Etappen vorher bilden.
3. Insgesamt 6–12 aussagekräftigste Prompts als eigene Folien (Schlüssel-Prompts, interessante Fehler, Wendepunkte).
4. Folien: Titel (App-Name, Liobas Name, FH Südwestfalen, Datum) · Die Idee · je Etappe Überblick + ausgewählte Prompts (Prompt als Zitat, „Was sich geändert hat“, Screenshot) · Überblick (Anzahl Prompts, Zeitraum, Etappen, Fehlerkorrekturen) · Fazit (was gut lief, Grenzen von Vibe Coding, was gelernt wurde) · Live-Demo / Fragen.
5. Prompts 1–6 sind aus dem Ideen-Chat; bei rekonstruierten Prompts „sinngemäß“ kennzeichnen.
6. Vor dem Bauen Etappen und Prompt-Auswahl auflisten, damit Lioba streichen oder ergänzen kann.
7. Als Präsentation im Slides-Format erstellen (als PowerPoint herunterladbar); eine .pptx-Datei nur auf ausdrücklichen Wunsch.

## 6. Andere Dokumente aktuell halten

- **README.md:** bei neuen Dateien die Liste „Aufbau des Projekts“ ergänzen; bei neuen Funktionen die Übersicht.
- **CLAUDE.md:** bei geänderten Adressen, Zugängen oder Arbeitsweisen.
- **docs/TECHNIK-NOTIZEN.md:** neue Stolperfallen und ihre Lösung kurz nachtragen.
- **UEBERGABE.md:** Abschnitt „Was die App heute kann“ und „Offene Punkte“ bei größeren Änderungen nachziehen, Stand-Datum und letzte Prompt-Nummer oben anpassen.
