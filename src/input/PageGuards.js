// lexiGÓ – Seitenschutz: die Seite soll sich wie eine App verhalten, nicht wie eine Webseite.
// Ergänzt CSS (touch-action, user-select, overscroll-behavior) und die Meta-Tags in index.html.
// Safari auf dem iPad ignoriert einiges davon, deshalb zusätzlich per Skript.

(function installPageGuards() {
  const stop = (e) => e.preventDefault();

  // Pinch-Zoom in Safari (iOS-eigene Gestenereignisse)
  ['gesturestart', 'gesturechange', 'gestureend'].forEach((name) => {
    document.addEventListener(name, stop, { passive: false });
  });

  // Kein Scrollen, kein Überziehen, kein Pinch: Wischbewegungen gehören dem Spiel.
  document.addEventListener('touchmove', stop, { passive: false });

  // Doppeltippen soll nicht zoomen (zwei Berührungen in kurzem Abstand).
  let letztesEnde = 0;
  document.addEventListener('touchend', (e) => {
    const jetzt = Date.now();
    if (jetzt - letztesEnde < 350) e.preventDefault();
    letztesEnde = jetzt;
  }, { passive: false });

  // Kein Kontextmenü beim langen Drücken, keine Auswahl, kein Ziehen.
  document.addEventListener('contextmenu', stop);
  document.addEventListener('selectstart', stop);
  document.addEventListener('dragstart', stop);
})();
