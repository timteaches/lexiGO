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
  const laden = name => fetch('content/' + name + '.json?v=4.2').then(r => { if (!r.ok) throw new Error(name + ': HTTP ' + r.status); return r.json(); });
  Promise.all([laden('lernstoff'), laden('lernlogik')])
    .then(([daten, logik]) => { LX.Lernstoff.init(daten); LX.Leitner.init(logik); LX.Werte.init(logik); start(); })
    .catch(datenFehler);
}
