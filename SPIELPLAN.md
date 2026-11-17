# Spielplan – Ida und der Pegasus

Ein Point-and-Click-Abenteuer im Buchstil für Kinder der 2. Klasse. Es läuft im Browser und wird später als Android-App verpackt.

## 1. Was das Kind erlebt

**Startbildschirm:** Ein geschlossenes Märchenbuch liegt auf einem Holztisch mit Tischdecke. Auf dem Deckel stehen der Titel und Omas altes Kinderfoto mit Silberwind. Das Ende (Idas Flug) wird nicht verraten. Daneben zwei große Knöpfe: **„Weiterlesen“** (springt zur letzten Seite) und **„Von vorne“**. Beim Tippen klappt der Deckel auf. Auf dem Titelblatt stehen kurz die Mitwirkenden (Idee und Konzept: Dominic Sattler, Bilder mit ChatGPT, programmiert mit Claude von Anthropic), dann taucht man ins Buch ein. Ein Tipp aufs offene Buch überspringt das Warten. Zwischen den Doppelseiten wird mit einer echten Umblätter-Bewegung geblättert.

**Eine Doppelseite:**

```
┌──────────────────────────────────────────────────────────────┐
│  [🏠]                     Seite 3–4                     [⚙]  │
│ ┌───────────────┐                                            │
│ │ Text-Karte    │      Hintergrundbild über beide Seiten     │
│ │ (Pergament)   │      mit Figuren und Dingen zum Antippen   │
│ │               │                                            │
│ └───────────────┘                     Ida   Rabat            │
│                                                              │
│ [Rabat-Hilfe] [🪶][🏮][🧭][🧣][🧤][✨][🌙]  ● ● ○  [Weiter ▶] │
└──────────────────────────────────────────────────────────────┘
```

- **Hintergrund** über die ganze Doppelseite, wie im Bilderbuch. In der Mitte ist ein leichter Buchfalz zu sehen.
- **Text-Karte** links auf Pergament, in großer Schrift. Sie lässt sich zuklappen, damit man das Bild ganz sieht.
- **Kein Vorlesen:** Das Kind liest alle Texte selbst. Darum sind die Texte kurz, in großer Schrift und in einfacher Sprache geschrieben.
- **Dinge zum Antippen** reagieren mit einer kleinen Animation und einer Sprechblase, die vorgelesen werden kann. Einige öffnen ein Rätsel.
- **Unten links Rabat als Hilfe-Knopf:** Einmal tippen gibt einen Tipp, zweimal tippen einen deutlicheren Tipp.
- **Inventar-Leiste** mit acht Fundstücken: den sieben aus der Geschichte und Holundas Honigkeksen (Seite 15–16, für Perla am Mondsee). Die Laterne zeigt, wie viele Lichter schon darin sind.
- **Drei Punkte** zeigen die drei Rätsel der Seite. Wenn alle gelöst sind, leuchtet **„Weiter“** auf, und die Seite blättert mit einer Animation um.
- **Versteckter Buchstabe:** Er glitzert leicht, ein Antippen sammelt ihn ein. Er ist freiwillig.

**Bedienung für kleine Hände:**
- Alle Knöpfe und Antipp-Flächen sind mindestens 64 × 64 Pixel groß. Die Schrift ist mindestens 24 px groß, in **Andika**, einer Schrift für Leseanfänger.
- Bedient wird nur durch **Tippen und Ziehen**, nie über die Tastatur. Wo ein Wort gebaut werden muss, gibt es Buchstaben- oder Silbenkärtchen.
- Querformat. Auf dem Handy erscheint im Hochformat der Hinweis: „Bitte dreh das Gerät.“

## 2. Kein Bestrafen bei Fehlern

| Situation | Was passiert |
| --- | --- |
| Falsche Antwort | Das Kärtchen wackelt sanft und rutscht zurück. Rabat sagt: „Fast! Versuch es nochmal.“ Kein roter Fehlerton, keine Punkte weg. |
| Zweimal falsch an derselben Stelle | Rabat gibt von selbst den ersten Tipp. |
| Dreimal falsch | Die richtige Stelle leuchtet sanft auf, das Kind macht den letzten Schritt selbst. |
| Richtige Antwort | Funkeln, ein kurzer freundlicher Satz, und das Kärtchen rastet ein. |
| Rätsel gelöst | Der Punkt unten leuchtet auf, Rabat freut sich. |

- Es gibt keine Zeitlimits, keine Leben und kein „Game Over“.
- Der Fortschritt wird nach **jedem** gelösten Rätsel gespeichert.

## 3. Die Rätsel: 10 Bausteine statt 45 Einzelprogrammen

Die über 40 Rätsel der Geschichte lassen sich auf 10 wiederverwendbare Rätseltypen zurückführen. Jedes Rätsel ist dann nur noch ein Datensatz.

| Typ | So funktioniert er | Rätsel aus der Geschichte |
| --- | --- | --- |
| **Lücken füllen** | Wortkarten in Lücken ziehen | S1 Brief, S11 Gedicht, S25 Brummbarts Brief |
| **Reihenfolge** | Karten in die richtige Reihenfolge schieben | S3 Sätze, S7 ABC, S15 Karte an Holunda, S21 ABC nach dem 2. Buchstaben, S27 Reise erzählen |
| **Sortieren** | Karten in Körbe oder Kisten ziehen | S1 Aufräumen, S5 Kisten, S9 der/die/das, S13 Wortarten, S19 Wortfamilien |
| **Auswahl** | Aus 2–3 Antworten die richtige antippen | S7 Sp/St, S7 Verben, S9 Ja/Nein, S11 Reime, S13 Punkt oder Fragezeichen, S13 Silbentrennung, S15 Kräutergläser, S17 au/eu/ei, S17 Gefühle, S19 Mehrzahl, S19 Gänge, S21 Wiewörter, S25 Abschiedsrätsel, S27 Freundebuch |
| **Paare finden** | Zwei zusammengehörige Karten antippen (bei langen Sätzen als Liste) | S3 Gegenteile, S11 Reimpaare, S23 Fundstück zu Person, S25 Wer wohnt wo |
| **Fehler antippen** | Falsche Wörter antippen, sie werden dann richtig geschrieben | S5 Omas Tagebuch, S27 Idas Tagebuch |
| **Silben** | Silben zählen (Klatsch-Knopf) oder Silbenkarten zusammensetzen | S1 Spieluhr, S9 Wegweiser |
| **Wörter bauen** | Zwei Wortteile verbinden oder Buchstaben einsetzen | S5 Kofferschloss, S17 Perlas Lied |
| **Wortschlange** | Zwischen die Buchstaben Trennstriche tippen | S3 Kuckucksuhr |
| **Satz bauen** | Wortkarten der Reihe nach antippen; das erste Wort wird beim Einrasten groß, zum Schluss kommt der Punkt (Typ `satzbau`) | S15 Rezept, S23 Gedanken ordnen |
| **Zauberwort** | Die goldenen Buchstaben der Reise der Reihe nach antippen, sie rasten in zwei Wortfelder ein (Typ `zauberwort`) | S23 MUTIGES HERZ |

Welche Rätsel zusammengehören, steht in Datendateien (JSON), eine pro Doppelseite. Wörter austauschen oder einen leichteren oder schwereren Modus nachrüsten heißt dann: nur die Datei ändern.

## 4. Technik

| Bereich | Wahl | Warum |
| --- | --- | --- |
| Grundgerüst | **Vite + TypeScript + Preact** | Klein und schnell. Bildschirme lassen sich als Bausteine bauen, und am Ende entsteht eine einfache Webseite, die sich auch als App verpacken lässt. |
| Darstellung | HTML/CSS, keine Spiele-Engine | Text, große Knöpfe und Ziehen gehen mit HTML am einfachsten und am barrierefreiesten. Die Bühne ist 16:9 und passt sich an jede Bildschirmgröße an. |
| Speichern | Speicher im Browser, in der App der Speicher des Geräts | Funktioniert ohne Internet und ohne Konto. |
| Offline | Progressive Web-App (PWA) | Das Spiel lässt sich auf dem Tablet „installieren“ und läuft ohne Internet. |
| Android | **Capacitor** verpackt dieselbe Webseite als App | Ein einziger Code für Browser und App. |
| Bilder | Ein Build-Skript macht WebP-Dateien in passender Größe daraus | Die 40 MB Einzelteile schrumpfen auf ungefähr 8–10 MB. Das ist wichtig für die App. |
| Tests | Vitest prüft die Lösungslogik, ein Prüf-Skript die Inhalte | Das Prüf-Skript stellt sicher, dass jedes Bild existiert, jedes Rätsel eine Lösung hat und die versteckten Buchstaben MUTIGES HERZ ergeben. |

**Hotspot-Editor (nur für die Entwicklung):** Auf jedem Hintergrund müssen die Flächen zum Antippen festgelegt werden. Bei 14 Szenen mit je etwa 5–8 Dingen geht das mit einem kleinen Editor schnell. Er wird mit `?editor` geöffnet: Man zieht Rechtecke auf dem Bild auf und platziert Figuren, und der Editor gibt die Koordinaten für die Datendatei aus.

**Ordner und Repo:** Der Ordner `ida-pegasus` wird zum Git-Repo und mit dem bisher leeren GitHub-Repo [dominicsattlerdesign/reading-Story](https://github.com/dominicsattlerdesign/reading-Story) verbunden. So liegen Geschichte, Bilder, Plan und Spiel zusammen und sind gesichert. Das Spiel kommt in den Unterordner `spiel/`. Die Bilder werden aus `bilder/` übernommen, die Originale bleiben unberührt. Nach jeder Etappe gibt es einen Commit. Hochgeladen wird erst nach deinem Okay.

Die leere Kopie unter `C:\Users\Admin\.copilot\repos\reading-Story` wird nicht gebraucht.

## 5. Elternbereich

Er öffnet sich über das Zahnrad. Damit Kinder nicht hineinkommen, muss man den Knopf 3 Sekunden gedrückt halten. Darin:
- Kapitelübersicht: zu jeder gespielten Seite springen
- Fortschritt zurücksetzen

## 6. Umsetzung in Etappen

| Etappe | Inhalt | Ergebnis |
| --- | --- | --- |
| **0 Grundgerüst** | Projekt aufsetzen, Bild-Pipeline, Bühne mit 16:9, Buchrahmen, Schrift, Speichern | Ein leeres Buch, das sich im Browser öffnet |
| **1 Probeseite** | **Seite 1–2 komplett spielbar:** Idas Zimmer, Text, Dinge zum Antippen, Lückentext, Aufräumen, Silben klatschen, Buchstabe M, Silberfeder, Rabat-Hilfe, Umblättern | **Halt: Du (und am besten das Kind) testest die Probeseite.** Danach passen wir Größe, Tempo und Ton an, bevor alle Seiten gebaut werden. |
| **2 Bausteine** | Die übrigen Rätseltypen und der Hotspot-Editor | Alle Rätselarten funktionieren |
| **3 Teil 1** | Seiten 3–10 (Wohnzimmer bis Waldrand) | Ersten Teil durchspielen |
| **4 Teil 2** | Seiten 11–20 (Brücke bis Echohöhle) | Zweiten Teil durchspielen |
| **5 Teil 3** | Seiten 21–28, Zauberwort, Flug, Ende, Startbildschirm | Ganzes Spiel durchspielbar |
| **6 Feinschliff** | Elternbereich, Offline (PWA), Ladezeiten, Prüfung auf Tablet und Handy. **Handy-Ansicht:** Auf kleinen Handys wird die Bühne auf ca. 40 % verkleinert, und die Knöpfe wären nur noch ca. 37 px groß. Dort werden Knöpfe, Leiste und Schrift deshalb vergrößert, damit sie mindestens 48 px groß bleiben. | Fertig für den Browser |
| **7 Android** | Capacitor einrichten, App-Symbol, Test auf einem Gerät oder Emulator | Installierbare App (APK) |

Für Etappe 7 sind noch nötig: **Android Studio mit Java (JDK)**. Ein Android-SDK-Ordner ist auf dem Rechner schon vorhanden, Java und die Android-Werkzeuge sind aber nicht eingerichtet.

Für Etappe 0 wird **Git** gebraucht. Das Programm `git` selbst ist auf dem Rechner noch nicht installiert. Das Repo existiert schon auf GitHub.

## 6a. Musik

Vor dem Buch erscheint nur ein großer **Start-Knopf** über dem unscharfen Tisch. Das Antippen ist nötig, weil Browser erst danach Ton abspielen dürfen.

Jede Szene hat einen Musik-Loop, der endlos läuft. Beim Umblättern blendet die Musik in 2,5 Sekunden weich zur nächsten über. Im Elternbereich lässt sich die Musik ausschalten.

Die Originale liegen unverändert in `musik/originale/`. `npm run musik` schneidet die ersten 10 Sekunden ab, sucht gegen Ende die Stelle, die am besten zum Anfang passt, blendet dort 3 Sekunden weich über und speichert die Loops als MP3 in `musik/loops/`.

| Loop | Original | Wo |
| --- | --- | --- |
| `titel_zuhause` | titel melodie und zuhause | Startseite, Seite 1–6 (Zimmer, Wohnzimmer, Dachboden), Seite 27–28 |
| `nachtlied` | Spring Night Lullaby | Seite 11–12 (Brücke) |
| `garten_waldrand` | garten und waldrand | Seite 7–10 (Garten, Waldrand) |
| `nebelwald` | Nebelwald | Seite 13–14 (Nebelwald) |
| `hexenhaus` | holundas hexenhaus | Seite 15–16 |
| `mondsee` | mondsee | Seite 17–18 |
| `echohoehle` | echohöhle | Seite 19–20 |
| `wolkenpfad_gipfel` | wolkenpfad und gipfel | Seite 21–24 |
| `flug_finale` | flugnachhause und finale | Seite 25–26 |

## 6b. Versteckte Buchstaben

Die goldenen Buchstaben erscheinen bewusst **nicht** in der Reihenfolge von MUTIGES HERZ, damit das Kind am Ende daraus das Zauberwort zusammensetzen muss. Ein Test prüft, dass alle Buchstaben zusammen genau aus MUTIGES HERZ stammen.

| Seite | Buchstabe | Versteck |
| --- | --- | --- |
| 1–2 | E | auf dem Bett, wo Rabat geschlafen hat |
| 3–4 | U | Schild des Kuckucks |
| 5–6 | R | Sattel des Schaukelpferds |
| 7–8 | Z | am Vogelhaus beim Rotkehlchen |
| 9–10 | M | in der Laterne am Gartentor |
| 11–12 | E | hinter dem Mond (erscheint beim Antippen) |
| 13–14 | S | in der Spirale auf dem Stein (erscheint beim Antippen) |
| 15–16 | H | unter dem Flügel von Rabe Kasimir (beim zweiten Antippen) |
| 17–18 | I | in der größten Seerose (Geschichte nennt E, das ist aber schon zweimal vergeben) |
| 19–20 | G | im blauen Kristall am Höhlenausgang (Geschichte nennt R, das ist schon vergeben) |
| 21–22 | T | im Nest auf dem Felsen am Steinbogen, sichtbar, wenn Frau Flocke weitergeflogen ist |
| 23–24 | – | kein Buchstabe mehr: hier legt das Kind aus allen elf Buchstaben das Zauberwort MUTIGES HERZ (Rätseltyp `zauberwort`) |

## 7. Was es noch nicht gibt (Entscheidungen mit Vorschlag)

| Punkt | Vorschlag |
| --- | --- |
| **Geräusche und Musik** | Musik ist da (siehe 6a). Geräusche (Funkeln, Umblättern, Klopfen) fehlen noch. |
| **Startbild / Buchdeckel** | Entschieden: geschlossenes Buch (`buchdeckel_maerchenbuch`) auf dem Tisch (`start_tisch_tischdecke`), auf dem Deckel Titel und Omas altes Kinderfoto mit Silberwind. Das Flug-Panorama mit Silberwind verrät das Ende und wird nicht verwendet. |
| **Zweites Mädchen auf „Familie in der Tür“** | Das Bild nur verwenden, wenn es dich nicht stört. Sonst bleibt es weg, oder ein neues Bild wird erzeugt. |
| **Kuckuck mit „A“** | Erledigt: `kuckuck_u` hat ein übermaltes Schild mit **U**. |