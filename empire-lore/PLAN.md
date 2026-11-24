# Empire Lore – Folgenplan und Produktionsregeln

Kanal: Empire Lore (@EmpireLoreTV / Instagram empireloretv / TikTok empireloretv).
Englische, animierte Geschichts-Shorts für junge, geschichtsinteressierte Menschen. Ziel: Monetarisierung.

## Folgen

Die nächtliche Automatisierung nimmt die erste Zeile mit `[ ]`, baut sie und hakt sie danach mit `[x]` ab (mit Datum).
Neue Themen unten anhängen. Reihenfolge darf der Nutzer jederzeit ändern.

- [x] 1 How Rome REALLY Fell (Part 1) – 2026-11-22
- [x] 2 The Empire That Refused to Die (Part 2, Byzanz) – 2026-11-22
- [x] 3 Napoleon Wasn't Short (Napoleon Part 1, Cliffhanger: "Did they shoot?") – 2026-11-23
- [ ] 4 Napoleon Part 2: What the soldiers did at Laffrey (1815), the Hundred Days, Waterloo, exile to St Helena. Löst den Cliffhanger aus Folge 3 auf.
- [ ] 5 WW1: How a wrong turn started World War 1 (Sarajevo 1914, the driver's wrong turn, the sandwich myth debunked)
- [ ] 6 WW1: The Christmas Truce of 1914
- [ ] 7 The Mongol Empire: the largest connected land empire ever, and how it fell apart
- [ ] 8 Rome's craziest emperors (Caligula, Nero, Commodus) – nur belegte Fakten, Legenden klar als Legende kennzeichnen
- [ ] 9 The Ottoman Empire: from tiny tribe to 600-year empire
- [ ] 10 WW2: Operation Mincemeat – the dead man who fooled Hitler (1943)
- [ ] 11 The Aztec Empire: a city on a lake bigger than any in Spain
- [ ] 12 Alexander the Great: an empire in 10 years, gone after his death

## Regeln für jede Folge

- **Länge:** 38–48 Sekunden, 9:16 (1080×1920), 30 fps, fertig mit Ton.
- **Sprache:** Englisch. Lockerer, schneller, aufgeregter Erzähler.
- **Stil:** Strichmännchen + Karten im Papier-Look (wie Folge 1–3), Wort-für-Wort-Untertitel.
- **Ton:** Stimme + Soundeffekte (Schläge auf Schnitten, Kamerawackeln bei Treffern). Leise, passende Hintergrundmusik ist erlaubt (im Code synthetisiert, z. B. dunkle Streicher/Pauken; deutlich leiser als die Stimme und unter der Stimme geduckt). Die Stimme muss immer klar verständlich bleiben.
- **Freigabe:** Der Nutzer hat erlaubt, dass Skript und Video ohne Rückfrage erstellt und veröffentlicht werden; er kontrolliert regelmäßig selbst.
- **Hook:** Sofort in den ersten 2 Sekunden, mitten in der Situation, mit Soundeffekt.
- **Cliffhanger** am Ende (bei Mehrteilern "PART 2"). Keine A/B-Frage in der Mitte.
- **Schockfaktor:** ein wenig erlaubt, nie blutig oder brutal. Keine extremistischen Symbole.
- **Faktencheck:** JEDE Zahl, jedes Datum und jeden Namen vorher per Websuche belegen (Britannica, World History Encyclopedia, HISTORY.com o. Ä.). Unsichere Aussagen weglassen oder umformulieren.
- **Vor dem Posten prüfen:** Stills ansehen (Text lesbar, nichts verdeckt), Ton messen (-14 LUFS, Spitzenpegel der fertigen MP4 unter -1 dB), Stimme gut hörbar über den Effekten.

## Technik (Vorlage in `empire-lore/template/`)

- Animation mit dem Skill **animation-studio** (`new-project.js <ordner> --format 9:16`), danach `index.html` aus der Vorlage übernehmen (lädt `vo_timing.js`).
- Stimme: kokoro-onnx (`pip install --break-system-packages kokoro-onnx soundfile`), Modell von GitHub:
  `https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx` und `voices-v1.0.bin`.
  Stimme `am_michael`, Tempo 1.25, mit `template/tts_gen.py` (Pfade anpassen).
- `prep-vo.js` misst die Zeilen und schreibt `vo_timing.js` (Untertitel mit Ziffern, Silben-Gewichte für Zahlen setzen).
- `score.js`, `song.js`, `film.js` aus Folge 3 als Vorlage für Aufbau, Helfer und Soundeffekte.
- Rendern: `node song.js` → `node engine/render.js video` (im Hintergrund) → `mux` → `verify` → `check`.
  Danach Ton neu kodieren, falls die MP4 übersteuert: `ffmpeg -i in.mp4 -i out/music.wav -map 0:v -map 1:a -c:v copy -af "alimiter=limit=0.7:level=disabled" -c:a aac -b:a 256k out.mp4`
  und Video kleiner machen: `-c:v libx264 -preset veryfast -crf 20`.

## Upload (Datei zuerst in dieses Repo nach `videos/empire-lore/partN-<slug>.mp4`, dann Rohlink nutzen)

Rohlink: `https://raw.githubusercontent.com/odinmaxim838-debug/Survival-Storys-/main/videos/empire-lore/<datei>.mp4`

- **YouTube:** Zapier, Aktion "Upload Video", Verbindung `02394ab5-6655-8233-ae63-98e00aaf1200` (= @EmpireLoreTV, NICHT die Standardverbindung KI Survival Storys). public, Kategorie 27 (Bildung), nicht für Kinder, Sprache en. Titel max. 100 Zeichen inkl. 2–3 Hashtags + #shorts. Beschreibung mit Quellen.
- **Instagram:** Windsor, Konnektor `instagram`, Aktion `create_video_post`, Account `17841432612455170` (empireloretv), share_to_feed true. Caption mit max. 5 Hashtags.
- **TikTok:** Zapier → Buffer, Aktion "Add to Queue", Verbindung `02c8b04e-bc3f-81e0-8aed-991c9a7668a5`, Organisation `6b0445033740575459e442ff`, Kanal `6b044bf28541f09ecb76d9c8` (empireloretv TikTok, NICHT kisurvivalstorys), method share_now, attachment video, scheduling_type direct. Text mit max. 5 Hashtags.
- Vor jedem Upload prüfen, dass die Folge dort noch nicht online ist (keine Doppel-Posts).

## Upload-Zeit

Täglich um **0:00 Uhr Berliner Zeit** (= 18 Uhr New York). Grund: bestes eigenes Reel (Teil 2, 23:59 Uhr) und US-Abend-Peak.
Ab 100 Followern echte Online-Zeiten in Instagram/TikTok-Statistik prüfen und anpassen.
