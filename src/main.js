/* =====================================================================
   Start: Lernstoff per fetch laden, erst danach Oberfläche und Spiel starten.
   Das Spiel läuft nur über einen Webserver oder GitHub Pages (fetch geht nicht per file://).
   ===================================================================== */
{
  window.addEventListener('error', e => { try { LX.UI.toast('Fehler: ' + e.message, 6000); } catch (_) {} });
  const start = () => {
    LX.UI.init();
    if (window.Phaser && LX.Game) LX.Game.boot(); else LX.UI.engineMissing();
  };
  const datenFehler = (err) => {
    console.error('Lernstoff konnte nicht geladen werden:', err);
    document.getElementById('dataErr').hidden = false; document.getElementById('goBtn').disabled = true;
  };
  fetch('content/lernstoff.json?v=3.3')
    .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(daten => { LX.Lernstoff.init(daten); start(); })
    .catch(datenFehler);
}
