# FILL THE SPACE (Halterungs-Generator) – Hinweise für Claude

Web-App ohne Build-Schritt: `index.html` lädt die Skripte aus `js/` der Reihe nach (klassische `<script>`-Tags, keine Module), damit sie per Doppelklick und auf GitHub Pages läuft. Aufbau und „Neue Halterungsart hinzufügen“ stehen in der README.

- Live: https://fill-the-space.github.io/ (GitHub Pages der Organisation „fill-the-space“, Branch `main`, Ordner `/`; ohne Kontonamen in der Adresse)
- Repository: https://github.com/fill-the-space/fill-the-space.github.io (seit 25.10.2026; vorher lioba-source/fill-the-space bzw. halterungs-generator)
- Netlify (fill-the-space.netlify.app) wird nicht mehr benutzt: Das kostenlose Guthaben war nach etwa 20 Veröffentlichungen im Monat aufgebraucht. `netlify.toml` ist nur noch ein Überbleibsel.
- **Versionsnummer:** Alle eigenen Dateien werden in `index.html` mit `?v=<Prompt-Nr.>` geladen. Bei jeder Änderung an CSS oder JS die Nummer überall in `index.html` hochsetzen, sonst mischen Browser alte und neue Dateien aus dem Zwischenspeicher.
- Die Seite muss außerhalb von Claude funktionieren: keine `window.claude`-Funktionen voraussetzen, Änderungen im Browser über einen lokalen Server testen (`.claude/launch.json`, Port 8766).

## Arbeitsweise mit Lioba

- Lioba arbeitet nicht mit dem Terminal, sondern mit GitHub Desktop. Keine Terminal-Befehle von ihr verlangen. Antworten auf Deutsch.
- **Protokoll:** Nach jedem Prompt, der etwas ändert oder eine wichtige Entscheidung auslöst, mit dem Skill `app-prompt-protokoll` einen Eintrag an `prompt-log.md` anhängen, ohne dass Lioba darum bitten muss. Den Prompt im genauen Wortlaut übernehmen, Fehler ehrlich festhalten, nach einer Etappe eine Zusammenfassung schreiben. Die Nummern laufen weiter; die letzte steht am Ende von `prompt-log.md`.
- **Commit:** Nach jeder Änderung selbst lokal committen, mit der Commit-Nachricht aus dem Protokoll (Format „Prompt <Nr.>: <Titel>“). Lioba hat das ausdrücklich so gewünscht.
- **Push:** Nach jedem Commit selbst pushen (siehe unten), Lioba muss nichts klicken.
- **Prüfen statt glauben:** Nach jedem Push mit `git fetch` und auf der Live-Seite prüfen, ob die Änderung angekommen ist. GitHub Pages braucht meist ein bis zwei Minuten.

## Zugang zum Pushen

Eingerichtet am 23.10.2026: Deploy Key mit Schreibzugriff nur für dieses Repository (`~/.ssh/halterungs-generator_deploy`, auf GitHub unter Settings → Deploy keys als „Claude Code“). Die lokale Git-Einstellung `core.sshCommand` nutzt ihn.

- Pushen: `git push claude main`, danach `git fetch origin`, damit GitHub Desktop den Stand kennt.
- `origin` bleibt die HTTPS-Adresse für GitHub Desktop, nicht umstellen.
- Schlägt der Push fehl (z. B. Schlüssel auf GitHub gelöscht), Lioba bitten, in GitHub Desktop auf „Push origin“ zu klicken.
