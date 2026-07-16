# Cyberball Web

Eigenständige, browserbasierte Neu-Implementierung des Cyberball-Ostrazismus-
Paradigmas (portiert aus dem Unity/C#-Quellcode CB5sourcev5402), ohne
Abhängigkeit von Unity oder einem Empirisoft-Server. Reines HTML/CSS/JS -
läuft direkt auf GitHub Pages.

## Struktur

```
cyberball-web/
├── index.html              Einstiegspunkt, drei Screens (Welcome/Play/ThankYou)
├── css/                    Layout & Spiel-Styling
├── js/
│   ├── engine/
│   │   ├── Config.js        Lädt config/experiment.json
│   │   ├── ScheduleManager.js  Wurf-Auswahl-Logik (Portierung aus Play.cs)
│   │   └── Game.js           Spielzustand, Timing, CSV-Logging
│   ├── ui/
│   │   ├── Renderer.js       Canvas-Zeichnung von Spielern & Ball
│   │   └── Screens.js        Screen-Umschaltung
│   └── app.js                Verdrahtet alles, liest URL-Parameter
└── config/
    └── experiment.json       Beide Bedingungen (Inklusion/Exklusion), aus cyberball.cbe konvertiert
```

## Bedienung / URL-Parameter

Die aktive Bedingung und die Teilnahme-ID werden per Query-String übergeben,
genauso wie bei der ursprünglichen Empirisoft-URL:

```
https://<user>.github.io/<repo>/?condition=1&pid=TEST001
```

- `condition=1` → Inklusion (Condition 1)
- `condition=2` → Exklusion (Condition 2)
- `pid=...` → wird im CSV-Log als Participant-ID verwendet (Default: "unknown")

## Lokal testen

Browser blockieren `fetch()` auf `file://`-Pfaden, daher braucht es einen
simplen lokalen Server (kein Build-Schritt nötig):

```bash
cd cyberball-web
python3 -m http.server 8000
```

Dann im Browser öffnen: `http://localhost:8000/?condition=1&pid=test`

## Ergebnisse speichern

Da GitHub Pages kein Backend hat, wird am Ende ein CSV-Download im Browser
ausgelöst (`cyberball_<pid>_<timestamp>.csv`), analog zu `Play.log` +
`ThankYou.SaveLog()` im Original. Die Testperson muss die Datei am Ende
herunterladen bzw. euch zusenden. Falls ihr die Daten stattdessen automatisch
sammeln wollt (z.B. in ein Google Sheet), kann das ergänzt werden - sag
Bescheid.

## Deployment auf GitHub Pages

1. Neues GitHub-Repository erstellen (für den kostenlosen Tarif: **public**,
   sonst sind private Repos + Pages nur mit GitHub Pro/Team/Edu möglich).
2. Inhalt dieses Ordners (`cyberball-web/`) in das Repo pushen:
   ```bash
   cd cyberball-web
   git init
   git add .
   git commit -m "Cyberball Web - initial version"
   git branch -M main
   git remote add origin https://github.com/<user>/<repo>.git
   git push -u origin main
   ```
   (Kein Admin-Recht, kein Unity, kein Build-Schritt nötig - reine Textdateien.)
3. Im Repo: **Settings → Pages → Source**: Branch `main`, Ordner `/ (root)`.
4. Nach kurzer Zeit erreichbar unter `https://<user>.github.io/<repo>/`.

## Bekannte Vereinfachungen ggü. dem Unity-Original

- Spieler werden als beschriftete Kreise gezeichnet statt als Sprite-Grafiken.
  Eigene Bilder lassen sich einfach ergänzen (`assets/players/*.png` +
  Anpassung in `Renderer.js`, `drawImage` statt `arc`).
- Chat-Nachrichten und Instruction-Screens sind im Code vorbereitet, aber
  nicht implementiert, da eure `experiment.json` keine enthält. Bei Bedarf
  ergänze ich das.
- `ThrowTo: "Any"` wurde im Original-C#-Code nie sauber behandelt (hätte zu
  einem Absturz geführt). Hier wird "any" sinnvoll als "zufälliger anderer
  Spieler" interpretiert - siehe Kommentar in `ScheduleManager.js`.
- `AskIDOnGameEnd` ist in eurer Config `false`; der Code unterstützt den
  `true`-Fall trotzdem vollständig (ID-Eingabefeld am Spielende).
