# FILL THE SPACE (Halterungs-Generator) – Hinweise für Claude

Web-App ohne Build-Schritt: `index.html` lädt die Skripte aus `js/` der Reihe nach (klassische `<script>`-Tags, keine Module), damit sie per Doppelklick und auf GitHub Pages läuft.

**Zuerst lesen, wenn das Projekt neu geöffnet wird (z. B. auf einem anderen Rechner):**
- `UEBERGABE.md` – Stand, was die App kann, offene Punkte, Einrichtung eines neuen Rechners, Arbeitsablauf
- `docs/DOKUMENTATION-VORGABE.md` – **verbindliche Vorgabe für das Protokoll** (Vorlagen für Prompt-Einträge und Etappen, Präsentation)
- `docs/TECHNIK-NOTIZEN.md` – Aufbau, Konventionen, bekannte Stolperfallen
- `README.md` – Dateistruktur, neue Halterungs-/Boxenart hinzufügen

- Live: https://fill-the-space.github.io/ (GitHub Pages der Organisation „fill-the-space“, Branch `main`, Ordner `/`; ohne Kontonamen in der Adresse)
- Repository: https://github.com/fill-the-space/fill-the-space.github.io (seit 25.10.2026; vorher lioba-source/fill-the-space bzw. halterungs-generator)
- Netlify (fill-the-space.netlify.app) wird nicht mehr benutzt: Das kostenlose Guthaben war nach etwa 20 Veröffentlichungen im Monat aufgebraucht. `netlify.toml` ist nur noch ein Überbleibsel.
- **Versionsnummer:** Alle eigenen Dateien werden in `index.html` mit `?v=<Prompt-Nr.>` geladen. Bei jeder Änderung an CSS oder JS die Nummer überall in `index.html` hochsetzen, sonst mischen Browser alte und neue Dateien aus dem Zwischenspeicher.
- Die Seite muss außerhalb von Claude funktionieren: keine `window.claude`-Funktionen voraussetzen, Änderungen im Browser über einen lokalen Server testen (`.claude/launch.json`, Port 8766 – liegt im Repository).
- Testen immer am Computer **und** in Handygröße (390 × 844, kleinste 320 × 568); Konsole auf Fehler prüfen.

## Arbeitsweise mit Lioba

- Lioba (GitHub: lioba-source) entwickelt per Vibe Coding und präsentiert die Prompts in einer Vorlesung (FH Südwestfalen). Sie arbeitet nicht mit dem Terminal, sondern mit GitHub Desktop. Keine Terminal-Befehle von ihr verlangen, Klickanleitungen geben. Antworten auf Deutsch.
- Ihre Nachrichten kommen oft per Spracheingabe (z. B. „Stapel Barr“ = stapelbar, „Skana“ = SKÅDIS). Sinn erschließen; nur bei echter Mehrdeutigkeit kurz nachfragen. Sie sagt meist dazu, ob etwas nur fürs Handy, nur für den Computer oder für beide gilt.
- **Protokoll:** Nach jedem Prompt, der etwas ändert oder eine wichtige Entscheidung auslöst, einen Eintrag an `prompt-log.md` anhängen, ohne dass Lioba darum bitten muss – mit dem Skill `app-prompt-protokoll`, falls verfügbar, sonst nach `docs/DOKUMENTATION-VORGABE.md` (beide sind gleichwertig). Prompt im genauen Wortlaut, Fehler ehrlich festhalten, nach einer Etappe eine Zusammenfassung. Die Nummern laufen weiter; die letzte steht am Ende von `prompt-log.md`.
- **Commit:** Nach jeder Änderung selbst committen, mit der Commit-Nachricht aus dem Protokoll (Format „Prompt <Nr.>: <Titel>“). Lioba hat das ausdrücklich so gewünscht.
- **Push:** Nach jedem Commit selbst pushen (siehe unten), Lioba muss nichts klicken.
- **Prüfen statt glauben:** Nach jedem Push mit `git fetch` und auf der Live-Seite prüfen, ob die Änderung angekommen ist (neue `?v=`-Nummer). GitHub Pages braucht meist 30 Sekunden bis zwei Minuten. Danach die Live-App in Google Chrome öffnen (`open -a "Google Chrome" https://fill-the-space.github.io/`), das wünscht sich Lioba.
- Keine Passwörter für Lioba eingeben, keine Konten anlegen; Sicherheits- und Kontoeinstellungen nur mit ihrem ausdrücklichen Okay ändern.
- Weitere Dokumente (README, UEBERGABE, TECHNIK-NOTIZEN) bei größeren Änderungen mit aktualisieren – siehe Abschnitt 6 in `docs/DOKUMENTATION-VORGABE.md`.

## Zugang zum Pushen

Der Push läuft über einen **Deploy Key pro Rechner** mit Schreibzugriff nur für dieses Repository. Die lokale Git-Einstellung `core.sshCommand` zeigt auf den privaten Schlüssel, Remote `claude` = `git@github.com:fill-the-space/fill-the-space.github.io.git`.

- Pushen: `git push claude main`, danach `git fetch origin`, damit GitHub Desktop den Stand kennt.
- `origin` bleibt die HTTPS-Adresse für GitHub Desktop, nicht umstellen.
- **Neuer Rechner:** Der Schlüssel des alten Macs (`~/.ssh/halterungs-generator_deploy`, auf GitHub „Claude Code“) liegt nur dort. Auf einem neuen Rechner mit Liobas Erlaubnis einen neuen Schlüssel erzeugen (nur für dieses Repository), Remote `claude` und `core.sshCommand` einrichten und Lioba den öffentlichen Teil unter Repository → Settings → Deploy keys mit „Allow write access“ eintragen lassen. In der Organisation müssen Deploy Keys erlaubt sein (Organisation → Settings → Deploy keys → Enabled). Schritt für Schritt in `UEBERGABE.md`, Schritt 5.
- **Windows-Rechner (seit Prompt 103):** Schlüssel `C:\Users\Admin\.ssh\fill-the-space_deploy` (auf GitHub „Claude Code (Windows-Rechner)“), `core.sshCommand` nutzt `C:/Windows/System32/OpenSSH/ssh.exe`. Git ist nicht im PATH – das Git von GitHub Desktop benutzen: `%LOCALAPPDATA%\GitHubDesktop\app-<Version>\resources\app\git\cmd\git.exe`. Test-Server: Eintrag `halterung-windows` in `.claude/launch.json` (`python` statt `python3`). Chrome öffnen: `Start-Process chrome https://fill-the-space.github.io/`.
- Schlägt der Push fehl, Lioba bitten, in GitHub Desktop auf „Push origin“ zu klicken, und danach online prüfen.
