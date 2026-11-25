/* =====================================================================
   LX.Leitner – Wiederholung nach dem Leitner-System (Box 1 bis 5).
   Gespeichert im Browser (localStorage, lexigo.leitner.v1): pro Wort Box, nächste Fälligkeit, letzte richtige Antwort.
   Alle Werte (Intervalle, Schwellen) stehen in content/lernlogik.json, Block "leitner".
   ===================================================================== */
(function () {
const DAY = 86400000;
LX.Leitner = {
  KEY: 'lexigo.leitner.v1', cfg: null, daten: { woerter: {} }, onChange: null, onAufstieg: null,
  init(logik) {
    this.cfg = logik.leitner; this.laden();
    LX.Sammlung.ids.forEach(id => this.neu(id));           // schon entdeckte Wörter dieser Sitzung aufnehmen
    this.changed();
  },
  laden() {
    try { const v = JSON.parse(localStorage.getItem(this.KEY) || 'null'); if (v && v.woerter) this.daten = v; } catch (e) {}
    Object.keys(this.daten.woerter).forEach(id => { if (!LX.Lernstoff.wort(id)) delete this.daten.woerter[id]; });
  },
  speichern() { try { localStorage.setItem(this.KEY, JSON.stringify(this.daten)); } catch (e) {} },
  changed() { if (this.onChange) this.onChange(); },
  intervall(box) { return this.cfg.intervalleTage[box - 1] * DAY; },
  maxBox() { return this.cfg.intervalleTage.length; },

  // Neues, entdecktes Wort: startet in Box 1
  neu(id) {
    if (!LX.Lernstoff.wort(id) || this.daten.woerter[id]) return false;
    const jetzt = Date.now();
    this.daten.woerter[id] = { box: 1, due: jetzt + this.cfg.neueWoerterFaelligNachTagen * DAY, last: jetzt };
    this.speichern(); this.changed(); return true;
  },
  hat(id) { return !!this.daten.woerter[id]; },
  alle() { return Object.keys(this.daten.woerter); },
  box(id) { const w = this.daten.woerter[id]; return w ? w.box : 0; },
  faellige() {
    const jetzt = Date.now();
    return this.alle().filter(id => this.daten.woerter[id].due <= jetzt).sort((a, b) => this.daten.woerter[a].due - this.daten.woerter[b].due);
  },
  anzahlFaellig() { return this.faellige().length; },

  // Richtig: Box +1 (höchstens die oberste), Fälligkeit nach dem Intervall der neuen Box
  richtig(id) {
    const w = this.daten.woerter[id]; if (!w) return 0;
    const alt = w.box, jetzt = Date.now();
    w.box = Math.min(this.maxBox(), alt + 1); w.due = jetzt + this.intervall(w.box); w.last = jetzt;
    this.speichern();
    if (w.box > alt && this.onAufstieg) this.onAufstieg(id, w.box);
    this.changed(); return w.box;
  },
  // Falsch: Box -1 (nicht unter 1), keine weitere Strafe
  falsch(id) {
    const w = this.daten.woerter[id]; if (!w) return 0;
    w.box = Math.max(1, w.box - 1); w.due = Date.now() + this.intervall(w.box);
    this.speichern(); this.changed(); return w.box;
  },
  // Verblasst: lange keine richtige Wiederholung mehr
  verblasst(id) { const w = this.daten.woerter[id]; return !!w && Date.now() - w.last > this.cfg.verblassenNachTagen * DAY; },
  sicher(id) { return this.box(id) === this.maxBox(); }
};
})();
