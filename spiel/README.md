# Ida und der Pegasus – das Spiel

Ein Point-and-Click-Abenteuer im Buchstil für die 2. Klasse. Den Plan dazu findest du in [../SPIELPLAN.md](../SPIELPLAN.md).

## Starten

Einmalig die Abhängigkeiten installieren:

```bash
npm install
```

Spiel im Browser starten (http://localhost:5173):

```bash
npm run dev
```

## Weitere Befehle

| Befehl | Was er macht |
| --- | --- |
| `npm run bilder` | Wandelt die Bilder aus `../bilder` in WebP um und legt sie in `public/assets` ab. Das passiert automatisch bei `dev` und `build`. |
| `npm run build` | Baut das fertige Spiel in den Ordner `dist/` |
| `npm run pruefen` | Typprüfung und Tests |

## Aufbau

| Ordner | Inhalt |
| --- | --- |
| `src/inhalt/seiten/` | Eine JSON-Datei pro Doppelseite: Text, Hintergrund, Objekte zum Antippen, Rätsel, Rabat-Tipps. Das Format ist in `src/inhalt/typen.ts` beschrieben. |
| `src/inhalt/inhalt.test.ts` | Prüft alle Seiten-Dateien: Gibt es jedes Bild, jedes Rätsel, jedes Objekt, auf das verwiesen wird? |
| `src/engine/` | Spiellogik (`logik.ts`) und Speichern (`speicher.ts`), mit Tests |
| `src/ui/` | Bühne, Buchdeckel, Doppelseite, Szene, Text-Karte, Leiste, Elternbereich |
| `src/ui/raetsel/` | Rätsel-Bausteine: Lückentext, Sortieren, Silben, dazu Ziehen/Antippen und Fehler-Hilfe |
| `scripts/bilder.mjs` | Bild-Umwandlung |

Die Bühne ist immer 1600 × 900 Punkte groß und wird ins Fenster eingepasst. Alle Positionen in den Seiten-Dateien beziehen sich auf diese Größe.

Der Elternbereich öffnet sich, wenn man das Zahnrad **3 Sekunden gedrückt hält**.
