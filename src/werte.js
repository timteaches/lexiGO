/* =====================================================================
   LX.Werte – Werte gefangener Monster (ATK, DEF, LP), Level, XP und die Währung Fortuna.
   Gespeichert im Browser (localStorage, lexigo.werte.v1). Grundwerte stehen im Lernstoff (monster.basis),
   alle Zahlen (Tick, Bonus, Level-Schwellen, Belohnungen) in content/lernlogik.json.
   Wörter steigen in der Leitner-Box auf → kleiner Stat-Tick; Fehler nehmen nie etwas weg.
   ===================================================================== */
(function () {
LX.Werte = {
  KEY: 'lexigo.werte.v1', cfg: null, daten: { monster: {}, fortuna: 0 }, onChange: null,
  init(logik) {
    this.cfg = logik; this.laden();
    LX.Leitner.onAufstieg = (wid, box) => this.tick(wid, box);
    this.changed();
  },
  laden() { try { const v = JSON.parse(localStorage.getItem(this.KEY) || 'null'); if (v && v.monster) this.daten = v; } catch (e) {} },
  speichern() { try { localStorage.setItem(this.KEY, JSON.stringify(this.daten)); } catch (e) {} },
  changed() { if (this.onChange) this.onChange(); },
  get fortuna() { return this.daten.fortuna || 0; },
  rec(id) { return this.daten.monster[id] || (this.daten.monster[id] = { xp: 0, ticks: { atk: 0, def: 0, lp: 0 }, tickIdx: 0, siege: {} }); },

  // Ein Wort ist in eine höhere Box aufgestiegen: Tick für das Monster seines Wortnetzes (im Wechsel ATK, DEF, LP)
  tick(wid, box) {
    const w = LX.Lernstoff.wort(wid), netz = w && LX.Lernstoff.netz(w.wortnetz), monId = netz && netz.monster;
    if (!monId || !LX.Lernstoff.monster(monId)) return;
    const r = this.rec(monId), M = this.cfg.monster, stat = M.statReihenfolge[r.tickIdx % M.statReihenfolge.length];
    r.tickIdx++; r.ticks[stat] += box === LX.Leitner.maxBox() ? LX.Leitner.cfg.statBonusBox5 : M.statTick;
    this.speichern(); this.changed();
  },
  level(xp) { let lv = 1; this.cfg.level.xpFuerLevel.forEach((v, i) => { if (xp >= v) lv = i + 1; }); return lv; },

  // Alle Werte eines Monsters: Grundwerte + Ticks + Level-Bonus, ATK mit Verblassen-Malus
  werte(id) {
    const LS = LX.Lernstoff, m = LS.monster(id), b = m.basis, r = this.rec(id), L = this.cfg.level, lv = this.level(r.xp);
    let atk = b.atk + r.ticks.atk, def = b.def + r.ticks.def, lp = b.lp + r.ticks.lp;
    for (let l = 2; l <= lv; l++) { lp += L.bonusLp; if (l % 2 === 0) atk += L.bonusAtkOderDef; else def += L.bonusAtkOderDef; }
    const wörter = LS.woerterImNetz(m.wortnetz), verblasst = wörter.filter(w => LX.Leitner.hat(w.id) && LX.Leitner.verblasst(w.id)).length;
    const malus = verblasst ? this.cfg.monster.verblassenAtkMalus : 0;
    return { level: lv, xp: r.xp, xpNaechst: lv < L.xpFuerLevel.length ? L.xpFuerLevel[lv] : null, atk, def, lp, malus, atkEff: Math.max(0, atk - malus), verblasst,
      sicher: wörter.filter(w => LX.Leitner.sicher(w.id)).length, woerterGesamt: wörter.length };
  },

  // Kampfsieg ("geschwaecht" oder "gefangen"): XP für das Monster, Fortuna für die Figur, je Monster und Art einmal
  sieg(id, art) {
    const b = this.cfg.belohnung[art], r = this.rec(id); if (!b || r.siege[art]) return null;
    const alt = this.level(r.xp); r.siege[art] = true; r.xp += b.xp; this.daten.fortuna = this.fortuna + b.fortuna;
    this.speichern(); this.changed();
    return { xp: b.xp, fortuna: b.fortuna, levelAlt: alt, levelNeu: this.level(r.xp) };
  }
};
})();
