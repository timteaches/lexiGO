# lexiGÓ – Projektregeln für Claude Code

## Ziel
2D-Wortschatz-Monstersammelspiel für den Spanischunterricht (Apúntate, Cornelsen, Sachsen). Spielbar im Browser über einen Link.

## Wichtige Dokumente
- Das Game Design Document (GDD) liegt im Claude-Projekt "lexiGÓ" als `lexiGO-GDD.md`. Bei Fragen zum Spielprinzip zuerst dort nachsehen.
- Der aktuelle Baustand steht in `lexiGO-Baustatus.md` (ebenfalls im Projekt).

## Technik
- Client: Phaser 3.80.1 per Script-Tag vom CDN (cdnjs), keine Paketinstallation.
- Stand: `index.html` ist die Version 1.2 aus dem Chat (eine einzelne Datei), Kachelgröße 16 px.
- Später Backend: Supabase (erst in Phase 6, nicht vorher einbauen).

## Regeln
- Lerninhalte (Wörter, Monster, Lektionen) gehören in Datendateien, nicht in den Code.
- Name der Spielfigur (Pedro/Sofía) immer als Variable, nie fest im Text.
- Spanische Texte mit korrekten Akzenten: á é í ó ú ñ ü ¡ ¿.
- Keine Originaltexte oder Übungen aus Apúntate übernehmen.
- Ein Schritt pro Sitzung.
- Dateien nur nach Rückfrage löschen oder umbenennen (nicht rückgängig zu machen).

## Arbeitsweise (verbindlich)
- Sofort loslegen, nie auf die Freigabe eines Plans warten. Einen Plan gibt es nur, wenn der Prompt ausdrücklich "Mach zuerst nur einen Plan" verlangt.
- Nur nachfragen, wenn etwas nicht rückgängig zu machen ist oder der Auftrag sich widerspricht.
- Antworten kurz: am Ende höchstens fünf Zeilen (was geändert wurde, wo ich es sehe, was offen ist). Keine Zusammenfassung der Schritte.
- Prüfen nur das Nötigste: Syntaxprüfung (`node --check`) und ein kurzer Check des Geänderten. Keine langen Testläufe, keine Screenshot-Serien, keine Randfälle, außer ich verlange es. Fehler findet der Nutzer auf dem iPad.
- Verhalten, Optik und Texte nur ändern, wenn es im Prompt steht.
- Ein Commit pro Schritt mit kurzer Beschreibung, Push auf main.
- Am Ende eines Schritts nur einen kurzen Text für das Baustatus-Dokument ausgeben (drei bis fünf Zeilen), falls das Projektdokument nicht schreibbar ist.
