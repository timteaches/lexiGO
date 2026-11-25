# lexiGÓ – Projektregeln für Claude Code

## Ziel
2D-Wortschatz-Monstersammelspiel für den Spanischunterricht (Apúntate, Cornelsen, Sachsen). Spielbar im Browser über einen Link.

## Wichtige Dokumente
- Das Game Design Document (GDD) liegt im Claude-Projekt "lexiGÓ" als `lexiGO-GDD.md`. Bei Fragen zum Spielprinzip zuerst dort nachsehen.
- Der aktuelle Baustand steht in `lexiGO-Baustatus.md` (ebenfalls im Projekt).

## Technik
- Client: Phaser.js (per Script-Tag, keine Paketinstallation nötig für den Prototyp).
- Später Backend: Supabase (erst in Phase 6, nicht vorher einbauen).

## Regeln
- Lerninhalte (Wörter, Monster, Lektionen) gehören in Datendateien, nicht in den Code.
- Name der Spielfigur (Pedro/Sofía) immer als Variable, nie fest im Text.
- Spanische Texte mit korrekten Akzenten: á é í ó ú ñ ü ¡ ¿.
- Keine Originaltexte oder Übungen aus Apúntate übernehmen.
- Ein Schritt pro Sitzung. Am Ende kurz beschreiben, was funktioniert und was offen ist.
- Keine Dateien ohne Plan-Freigabe löschen oder umbenennen.
