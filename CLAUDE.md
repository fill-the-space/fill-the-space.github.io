# Halterungs-Generator – Hinweise für Claude

Web-App ohne Build-Schritt: `index.html` lädt die Skripte aus `js/` der Reihe nach (klassische `<script>`-Tags, keine Module), damit sie per Doppelklick und auf GitHub Pages läuft. Aufbau und „Neue Halterungsart hinzufügen“ stehen in der README.

- Live: https://lioba-source.github.io/halterungs-generator/ (GitHub Pages, Branch `main`, Ordner `/`)
- Repository: https://github.com/lioba-source/halterungs-generator
- Die Seite muss außerhalb von Claude funktionieren: keine `window.claude`-Funktionen voraussetzen, Änderungen im Browser über einen lokalen Server testen (`.claude/launch.json`, Port 8765).

## Arbeitsweise mit Lioba

- Lioba arbeitet nicht mit dem Terminal, sondern mit GitHub Desktop. Keine Terminal-Befehle von ihr verlangen. Antworten auf Deutsch.
- **Protokoll:** Nach jedem Prompt, der etwas ändert oder eine wichtige Entscheidung auslöst, mit dem Skill `app-prompt-protokoll` einen Eintrag an `prompt-log.md` anhängen, ohne dass Lioba darum bitten muss. Den Prompt im genauen Wortlaut übernehmen, Fehler ehrlich festhalten, nach einer Etappe eine Zusammenfassung schreiben. Die Nummern laufen weiter; die letzte steht am Ende von `prompt-log.md`.
- **Commit:** Nach jeder Änderung selbst lokal committen, mit der Commit-Nachricht aus dem Protokoll (Format „Prompt <Nr.>: <Titel>“). Lioba hat das ausdrücklich so gewünscht.
- **Push:** Selbst pushen, sobald ein Zugang eingerichtet ist (siehe unten). Solange nicht, Lioba bitten, in GitHub Desktop auf „Push origin“ zu klicken.
- **Prüfen statt glauben:** Nach jedem Push mit `git fetch` und auf der Live-Seite prüfen, ob die Änderung angekommen ist. GitHub Pages speichert Dateien etwa 10 Minuten zwischen.

## Zugang zum Pushen

Noch nicht eingerichtet. Auf dem Mac ist keine GitHub-Anmeldung für die Kommandozeile gespeichert; die Anmeldung kennt nur GitHub Desktop.
