# Spielplan – Ida und der Pegasus

Ein Point-and-Click-Abenteuer im Buchstil für Kinder der 2. Klasse. Es läuft im Browser und wird später als Android-App verpackt.

## 1. Was das Kind erlebt

**Startbildschirm:** Ein Buchdeckel mit Titel, Silberwind und dem Schriftzug. Darunter zwei große Knöpfe: **„Weiterlesen“** (springt zur letzten Seite) und **„Von vorne“**.

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
- **Vorlesen ohne eigenen Knopf:** Der Seitentext wird beim Aufschlagen der Seite automatisch vorgelesen, eine Aufgabe beim Öffnen des Rätsels. Wer etwas noch einmal hören will, tippt einfach auf die Text-Karte oder die Aufgabe. Die Wörter werden beim Vorlesen mitmarkiert.
- **Dinge zum Antippen** reagieren mit einer kleinen Animation und einer Sprechblase, die vorgelesen werden kann. Einige öffnen ein Rätsel.
- **Unten links Rabat als Hilfe-Knopf:** Einmal tippen gibt einen Tipp, zweimal tippen einen deutlicheren Tipp.
- **Inventar-Leiste** mit den sieben Fundstücken. Die Laterne zeigt, wie viele Lichter schon darin sind.
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
| **Reihenfolge** | Karten in die richtige Reihenfolge schieben | S3 Sätze, S7 ABC, S15 Karte an Holunda, S21 ABC nach dem 2. Buchstaben, S27 Reise erzählen, Zauberwort |
| **Sortieren** | Karten in Körbe oder Kisten ziehen | S1 Aufräumen, S5 Kisten, S9 der/die/das, S13 Wortarten, S19 Wortfamilien, S23 Fundstück zu Person, S25 Wer wohnt wo, S27 Freundebuch |
| **Auswahl** | Aus 2–3 Antworten die richtige antippen | S7 Sp/St, S7 Tunwörter, S9 Ja/Nein, S11 Reime, S13 Punkt oder Fragezeichen, S13 Silbentrennung, S15 Kräutergläser, S17 au/eu/ei, S17 Gefühle, S19 Mehrzahl, S19 Gänge, S21 Verlängern ×2, S25 Abschiedsrätsel |
| **Paare finden** | Zwei zusammengehörige Karten antippen | S3 Gegenteile, S11 Reimpaare |
| **Fehler antippen** | Falsche Wörter antippen, sie werden dann richtig geschrieben | S5 Omas Tagebuch, S27 Idas Tagebuch |
| **Silben** | Silben zählen (Klatsch-Knopf) oder Silbenkarten zusammensetzen | S1 Spieluhr, S9 Wegweiser |
| **Wörter bauen** | Zwei Wortteile verbinden oder Buchstaben einsetzen | S5 Kofferschloss, S17 Perlas Lied |
| **Wortschlange** | Zwischen die Buchstaben Trennstriche tippen | S3 Kuckucksuhr |
| **Satz bauen** | Wortkarten zu einem Satz ordnen, mit großem Anfang und Punkt | S15 Rezept, S23 Gedanken ordnen |

Welche Rätsel zusammengehören, steht in Datendateien (JSON), eine pro Doppelseite. Wörter austauschen oder einen leichteren oder schwereren Modus nachrüsten heißt dann: nur die Datei ändern.

**Vorlesen bei Rätseln:**
- Die **Aufgabe** wird beim Öffnen automatisch vorgelesen. Ein Tippen auf den Aufgabentext liest sie noch einmal vor.
- Die **Wortkärtchen** werden nur vorgelesen, wenn im Elternbereich die „Lesehilfe“ eingeschaltet ist. Dann liest ein Kärtchen vor, sobald es angetippt wird. Ohne Lesehilfe würde das Vorlesen bei Lese-Rätseln die Lösung verraten.

## 4. Technik

| Bereich | Wahl | Warum |
| --- | --- | --- |
| Grundgerüst | **Vite + TypeScript + Preact** | Klein und schnell. Bildschirme lassen sich als Bausteine bauen, und am Ende entsteht eine einfache Webseite, die sich auch als App verpacken lässt. |
| Darstellung | HTML/CSS, keine Spiele-Engine | Text, große Knöpfe, Ziehen und Vorlesen gehen mit HTML am einfachsten und am barrierefreiesten. Die Bühne ist 16:9 und passt sich an jede Bildschirmgröße an. |
| Vorlesen | Sprachausgabe des Browsers (deutsche Stimme), auf Android über ein Capacitor-Plugin | Sofort und kostenlos verfügbar. Alles läuft über eine eigene Zwischenschicht. So können später **eigene Aufnahmen** die Computerstimme ersetzen, ohne dass sich am Spiel etwas ändert. |
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
- Automatisches Vorlesen an oder aus (standardmäßig an), Stimme und Sprechtempo
- Lesehilfe für Rätselwörter an oder aus
- Kapitelübersicht: zu jeder gespielten Seite springen
- Fortschritt zurücksetzen

## 6. Umsetzung in Etappen

| Etappe | Inhalt | Ergebnis |
| --- | --- | --- |
| **0 Grundgerüst** | Projekt aufsetzen, Bild-Pipeline, Bühne mit 16:9, Buchrahmen, Schrift, Vorlese-Schicht, Speichern | Ein leeres Buch, das sich im Browser öffnet |
| **1 Probeseite** | **Seite 1–2 komplett spielbar:** Idas Zimmer, Text mit Vorlesen, Dinge zum Antippen, Lückentext, Aufräumen, Silben klatschen, Buchstabe M, Silberfeder, Rabat-Hilfe, Umblättern | **Halt: Du (und am besten das Kind) testest die Probeseite.** Danach passen wir Größe, Tempo und Ton an, bevor alle Seiten gebaut werden. |
| **2 Bausteine** | Die übrigen Rätseltypen und der Hotspot-Editor | Alle Rätselarten funktionieren |
| **3 Teil 1** | Seiten 3–10 (Wohnzimmer bis Waldrand) | Ersten Teil durchspielen |
| **4 Teil 2** | Seiten 11–20 (Brücke bis Echohöhle) | Zweiten Teil durchspielen |
| **5 Teil 3** | Seiten 21–28, Zauberwort, Flug, Ende, Startbildschirm | Ganzes Spiel durchspielbar |
| **6 Feinschliff** | Elternbereich, Offline (PWA), Ladezeiten, Prüfung auf Tablet und Handy. **Handy-Ansicht:** Auf kleinen Handys wird die Bühne auf ca. 40 % verkleinert, und die Knöpfe wären nur noch ca. 37 px groß. Dort werden Knöpfe, Leiste und Schrift deshalb vergrößert, damit sie mindestens 48 px groß bleiben. | Fertig für den Browser |
| **7 Android** | Capacitor einrichten, App-Symbol, Test auf einem Gerät oder Emulator | Installierbare App (APK) |

Für Etappe 7 sind noch nötig: **Android Studio mit Java (JDK)**. Ein Android-SDK-Ordner ist auf dem Rechner schon vorhanden, Java und die Android-Werkzeuge sind aber nicht eingerichtet.

Für Etappe 0 wird **Git** gebraucht. Das Programm `git` selbst ist auf dem Rechner noch nicht installiert. Das Repo existiert schon auf GitHub.

## 7. Was es noch nicht gibt (Entscheidungen mit Vorschlag)

| Punkt | Vorschlag |
| --- | --- |
| **Vorlesestimme** | Wir beginnen mit der Computerstimme. Wenn sie auf dem Tablet zu blechern klingt, kann jemand aus der Familie die Texte einsprechen. Die Aufnahmen lassen sich dann einfach hineinlegen. |
| **Geräusche und Musik** | Es gibt noch keine. Vorschlag: In Etappe 6 ein paar freie Geräusche (Funkeln, Umblättern, Klopfen) und leise Hintergrundmusik, beides abschaltbar. Bis dahin ist das Spiel stumm, abgesehen von der Stimme. |
| **Startbild / Buchdeckel** | Es gibt kein eigenes Bild. Vorschlag: Ich setze den Deckel aus dem Flug-Panorama, Silberwind und dem Schriftzug zusammen. |
| **Zweites Mädchen auf „Familie in der Tür“** | Das Bild nur verwenden, wenn es dich nicht stört. Sonst bleibt es weg, oder ein neues Bild wird erzeugt. |
| **Kuckuck mit „A“** | Der Buchstabe U wird im Spiel über das Schild gelegt. |
