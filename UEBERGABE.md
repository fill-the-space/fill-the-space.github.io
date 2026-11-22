# Übergabe: FILL THE SPACE auf einem neuen Rechner weiterentwickeln

Stand: 22.11.2026 · letzter Protokoll-Eintrag: **Prompt 102** (diese Übergabe); der nächste Prompt bekommt die Nummer **103**

Dieses Dokument ist für **Lioba** (Einrichten des neuen Rechners) und für **Claude** (wie weitergearbeitet und dokumentiert wird). Alles Nötige liegt im Repository, nichts muss vom alten Rechner kopiert werden – außer man möchte den alten Push-Zugang weiterverwenden (siehe Schritt 5).

---

## 1. Was ist FILL THE SPACE?

Web-App für den 3D-Druck: Halterungen und Boxen entwerfen, in 3D ansehen, an einer Wand bzw. in einem Kasten anordnen und als **STL** oder **3MF** (zweifarbig) speichern. Läuft im Browser, auf dem Handy auch als installierbare Web-App.

| | |
|---|---|
| **Live-App** | https://fill-the-space.github.io/ |
| **Repository** | https://github.com/fill-the-space/fill-the-space.github.io (Organisation „fill-the-space“, gehört zum Konto lioba-source) |
| **Veröffentlichung** | GitHub Pages, Branch `main`, Ordner `/`; jeder Push ist nach ca. 30 s–2 min online |
| **Technik** | reines HTML/CSS/JavaScript ohne Build-Schritt, 3D mit three.js r128 (von cdnjs) |
| **Protokoll** | `prompt-log.md` + Bilder in `prompt-log-bilder/` (101 Prompts, 6 Etappen-Zusammenfassungen; für die Prompts 21–59 und 62–79 fehlen noch Etappen, die lassen sich nachträglich bilden) |

### Was die App heute kann
- **Halterungen:** Köcher, Konsole (L-Form), Leiste. Befestigung mit Schrauben (Senkkopf, Anzahl/Lage automatisch), Türhaken oder IKEA SKÅDIS. Druckempfehlung nach Gewicht, Hebel und Material (PLA/PETG/PA-CF), Filamentverbrauch, Druckbett-Prüfung. („Individuell“ per Foto ist ausgeblendet, Code bleibt.)
- **Boxen:** Stapelbox, Deckelbox (Steck-, Schiebe-, Einlegedeckel, auch stapelbar), Sortierkasten; Fächer, Griffmulden, Etikettfeld, Wände ab 1 mm.
- **Anordnung:** Teile an Wand, SKÅDIS-Lochplatte (Raster, rastet ein) oder Schranktür bzw. im Kasten (Schublade/Kiste) platzieren, verschieben, duplizieren, drehen, stapeln (gleiche Art, gleiche Länge/Breite, Fuß muss passen), „Teil bearbeiten“, „Neu anfangen“.
- **Beschriftung:** Text und kleines Bild (SVG/PNG/GIF) als Relief – erhaben, eingelegt (bündig, zweifarbig) oder vertieft; Fläche wählbar (auch Deckel), Lage, 5 Schriftarten, fett/kursiv.
- **Export:** STL; mit Beschriftung zusätzlich 3MF mit zwei Teilen und wählbaren Farben (ein Objekt, Teile bleiben zusammen).
- **Handy:** Kopf bleibt, 3D-Vorschau fest oben mit eingebettetem Umschalter, wischbare Werkzeugleiste; installierbar über „Zum Home-Bildschirm“, offline nutzbar.

### Offene Punkte / noch nicht getestet
- Probedruck nach den Korrekturen der Prompts 96–98 (Schiebedeckel, dünne Wände) steht aus.
- 3MF in einem echten Slicer (PrusaSlicer, Bambu Studio, Orca) noch nicht geöffnet.
- Firefox und echte Android-Geräte nicht getestet (nur Chrome-Engine und Liobas iPhone).
- Netlify-Projekt (fill-the-space.netlify.app) wird nicht mehr genutzt und kann bei Netlify gelöscht werden; `netlify.toml` ist ein harmloses Überbleibsel.

---

## 2. Neuen Rechner einrichten (für Lioba, ohne Terminal)

### Schritt 1 – Programme installieren
1. **GitHub Desktop**: https://desktop.github.com → installieren → mit dem GitHub-Konto **lioba-source** anmelden.
2. **Claude** (Desktop-App mit Claude Code): https://claude.ai/download → installieren → anmelden.
3. **Google Chrome** (zum Anschauen der fertigen Seite).
4. Nur macOS: **Python 3** ist für den Test-Server nötig. Auf neueren Macs fragt das System beim ersten Mal nach, ob die „Command Line Developer Tools“ installiert werden sollen → „Installieren“ klicken.

### Schritt 2 – Projekt herunterladen (klonen)
1. GitHub Desktop → **File → Clone repository…**
2. Reiter **GitHub.com** → **fill-the-space/fill-the-space.github.io** auswählen.
3. **Local path** z. B. `Dokumente/fill-the-space` → **Clone**.

### Schritt 3 – Projekt in Claude öffnen
1. Claude Desktop-App → **Code** → neue Sitzung → als Ordner den eben geklonten Ordner wählen.
2. Als erste Nachricht z. B.: *„Lies UEBERGABE.md und CLAUDE.md und mach mit dem Projekt weiter.“*
   Claude liest `CLAUDE.md` ohnehin automatisch; darin steht, wie protokolliert, committet und gepusht wird.

### Schritt 4 – Protokoll-Skill (optional)
Auf dem alten Rechner gab es den Skill **„app-prompt-protokoll“**. Wenn er im Konto verfügbar ist, nutzt Claude ihn. Falls nicht, ist das kein Problem: Die komplette Vorgabe steht in **`docs/DOKUMENTATION-VORGABE.md`**, und Claude arbeitet danach.

### Schritt 5 – Push-Zugang für Claude
Auf dem alten Mac pushte Claude über einen **Deploy Key**, dessen geheimer Teil nur auf dem alten Mac liegt (`~/.ssh/halterungs-generator_deploy`). Auf dem neuen Rechner gibt es zwei Wege:

**Weg A – neuer Schlüssel für den neuen Rechner (empfohlen, Claude pusht wieder selbst)**
1. Claude bitten: *„Erzeuge einen Deploy Key nur für dieses Repository. Ich erlaube das und trage ihn auf GitHub ein.“*
   Claude erzeugt den Schlüssel und zeigt den **öffentlichen** Teil (beginnt mit `ssh-ed25519 …`).
2. Auf GitHub: Repository **fill-the-space.github.io → Settings → Deploy keys → Add deploy key**
   Titel z. B. „Claude Code (neuer Rechner)“, Schlüssel einfügen, **„Allow write access“ anhaken** → **Add key**.
3. Wichtig: In der Organisation müssen Deploy Keys erlaubt sein (ist seit 25.10.2026 so): Organisation **fill-the-space → Settings → Deploy keys → „Enabled“**. Nicht verwechseln mit „Member privileges“.
4. Claude testet den Push.
5. Den alten Schlüssel „Claude Code“ kann man später unter Deploy keys löschen, wenn der alte Mac nicht mehr benutzt wird.

**Weg B – Lioba pusht selbst**
Claude committet, und Lioba klickt in GitHub Desktop auf **„Push origin“**. Danach prüft Claude online, ob es angekommen ist.

### Schritt 6 – Test
- Claude startet den Test-Server (`.claude/launch.json`, Port 8766; Datei liegt im Repository) und öffnet die App im Browser-Bereich.
- Live-App in Chrome öffnen: https://fill-the-space.github.io/
- Auf dem iPhone: App über Safari/Chrome → Teilen → „Zum Home-Bildschirm“ (falls noch die alte Netlify-Version auf dem Home-Bildschirm liegt: löschen und neu hinzufügen).

---

## 3. Weiterarbeiten – so lief es bisher (Vorgabe)

Ablauf pro Wunsch („Prompt“) von Lioba:
1. Lioba beschreibt den Wunsch auf Deutsch (oft per Sprache, daher Tippfehler – Sinn erschließen, bei echter Mehrdeutigkeit kurz nachfragen).
2. Claude setzt um, **testet im Browser** (Desktop **und** Handygröße 390 × 844, bei Bedarf 320 px), prüft die Konsole auf Fehler.
3. **Versionsnummer** in `index.html` auf die neue Prompt-Nummer setzen (`?v=<Nr.>`).
4. **Protokoll-Eintrag** an `prompt-log.md` (Vorgabe: `docs/DOKUMENTATION-VORGABE.md`), Screenshots nach `prompt-log-bilder/<Nr>-….jpg|png`.
5. **Commit** mit „Prompt <Nr.>: <Titel>“ (+ Co-Authored-By-Zeile), **Push**, `git fetch origin`.
6. **Online prüfen** (neue Versionsnummer auf https://fill-the-space.github.io/ angekommen?), Seite in Chrome öffnen.
7. Antwort an Lioba auf Deutsch: was sich geändert hat, was geprüft wurde, was offen ist; Commit-Nachricht nennen.
8. Nach 3–8 Prompts bzw. wenn Lioba einen Abschnitt für abgeschlossen erklärt: **Etappen-Zusammenfassung**.

Wichtig im Umgang:
- Keine Terminal-Befehle von Lioba verlangen, Klickanleitungen geben.
- Keine Passwörter für Lioba eingeben, keine Konten anlegen; Sicherheits- oder Kontoeinstellungen nur nach ausdrücklichem Okay.
- Fehler ehrlich nennen und protokollieren, auch eigene (z. B. „Korrektur aus Prompt 96 hat das Problem verschärft“).
- Unterscheidung „nur Handy“ / „nur Computer“ / „beide“ ernst nehmen; Lioba sagt das meist dazu.

---

## 4. Weitere Dokumente im Repository

| Datei | Inhalt |
|---|---|
| `CLAUDE.md` | Kurzvorgaben für Claude (wird automatisch gelesen) |
| `UEBERGABE.md` | dieses Dokument |
| `docs/DOKUMENTATION-VORGABE.md` | wie protokolliert wird: Vorlagen für Prompt-Einträge und Etappen, Regeln, Präsentation |
| `docs/TECHNIK-NOTIZEN.md` | Aufbau im Detail, Konventionen, bekannte Stolperfallen und ihre Lösungen |
| `README.md` | Überblick, Dateistruktur, neue Halterungs-/Boxenart hinzufügen |
| `prompt-log.md` | das Protokoll für die Vorlesung (Prompts 1–101, Etappen) |
