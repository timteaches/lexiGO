/* =====================================================================
   Lernstoff-Daten liegen in content/lernstoff.json (reines JSON, kein Code) und werden
   beim Start per fetch geladen (siehe main.js), dann LX.Lernstoff.init(daten).
   Aufbau: lehrwerke → baende → einheiten (unidad | modulo) → abschnitte (acercate | A | B)
           → wortnetze (IDs) ; wortnetze → monster ; woerter → wortnetz
   Regeln: stabile IDs (Kleinbuchstaben, keine Umlaute), sichtbare Texte nur in titel/es/de.
           "spielbar": false = in der Architektur vorhanden, aber noch nicht betretbar.
   ===================================================================== */

/* =====================================================================
   LX.Lernstoff – liest den JSON-Block #lx-lernstoff und bietet Abfragen.
   LX.Sammlung  – entdeckte Wörter dieser Sitzung (sessionStorage).
   LX.Speech    – Aussprache über die Sprachsynthese des Browsers (es-ES).
   ===================================================================== */
(function () {
  const raw = { lehrwerke: [], wortnetze: [], monster: [], woerter: [] };   // wird von LX.Lernstoff.init(daten) gefüllt
  const idx = { woerter: {}, netze: {}, abschnitte: {}, einheiten: {}, monster: {} };
  function indexieren() {
  raw.woerter.forEach(w => idx.woerter[w.id] = w);
  raw.wortnetze.forEach(n => idx.netze[n.id] = n);
  raw.monster.forEach(m => idx.monster[m.id] = m);
  raw.lehrwerke.forEach(lw => lw.baende.forEach(bd => bd.einheiten.forEach(e => {
    idx.einheiten[e.id] = Object.assign({}, e, { band: bd.id, lehrwerk: lw.id });
    (e.abschnitte || []).forEach(a => idx.abschnitte[a.id] = Object.assign({}, a, { einheit: e.id }));
  })));
  }
  const L = LX.Lernstoff = {
    raw,
    init(daten) { Object.assign(raw, daten); indexieren(); pruefen(); LX.Sammlung.load(); LX.Monster.load(); },
    wort: id => idx.woerter[id], netz: id => idx.netze[id], abschnitt: id => idx.abschnitte[id], einheit: id => idx.einheiten[id], monster: id => idx.monster[id],
    woerterImNetz: nid => raw.woerter.filter(w => w.wortnetz === nid),
    woerterImAbschnitt: aid => { const a = idx.abschnitte[aid]; return a ? a.wortnetze.flatMap(n => L.woerterImNetz(n)) : []; },
    abschnittVonWort: wid => { const w = idx.woerter[wid], n = w && idx.netze[w.wortnetz]; return n && n.abschnitte ? idx.abschnitte[n.abschnitte[0]] : null; },
    abschnitteDerEinheit: eid => Object.values(idx.abschnitte).filter(a => a.einheit === eid),
    spielbareAbschnitte: () => Object.values(idx.abschnitte).filter(a => a.spielbar),
    // „Unidad 1 · ¡Acércate!“ bzw. „Unidad 1 · A – En el recreo“
    label(aid) {
      const a = idx.abschnitte[aid]; if (!a) return ''; const e = idx.einheiten[a.einheit];
      const head = (e.typ === 'unidad' ? 'Unidad ' : 'Módulo ') + e.nummer;
      return head + ' · ' + (a.typ === 'acercate' ? a.titel : a.typ + ' – ' + a.titel);
    },
    einheitLabel(eid) { const e = idx.einheiten[eid]; return e ? (e.typ === 'unidad' ? 'Unidad ' : 'Módulo ') + e.nummer + ' · ' + e.titel : ''; },
    gesamt() { return L.spielbareAbschnitte().reduce((s, a) => s + L.woerterImAbschnitt(a.id).length, 0); }
  };
  function pruefen() {
  // Datenprüfung: jede Referenz muss existieren (Hinweise nur in der Konsole)
  raw.woerter.forEach(w => { if (!idx.netze[w.wortnetz]) console.warn('Wort ohne gültiges Wortnetz:', w.id); });
  raw.wortnetze.forEach(n => { if (n.monster && !idx.monster[n.monster]) console.warn('Wortnetz mit unbekanntem Monster:', n.id); (n.abschnitte || []).forEach(a => { if (!idx.abschnitte[a]) console.warn('Wortnetz mit unbekanntem Abschnitt:', n.id, a); }); });
  }

  LX.Sammlung = {
    ids: [], KEY: 'lexigo.sammlung.v1',
    load() { try { const v = JSON.parse(sessionStorage.getItem(this.KEY) || '[]'); if (Array.isArray(v)) this.ids = v.filter(id => L.wort(id)); } catch (e) {} },
    save() { try { sessionStorage.setItem(this.KEY, JSON.stringify(this.ids)); } catch (e) {} },
    has(id) { return this.ids.includes(id); },
    add(id) { if (!L.wort(id) || this.has(id)) return false; this.ids.push(id); this.save(); if (LX.Leitner) LX.Leitner.neu(id); return true; },
    count() { return this.ids.length; }
  };

  // Gefangene Monster dieser Sitzung (sessionStorage), nach dem Muster von LX.Sammlung
  LX.Monster = {
    ids: [], KEY: 'lexigo.monster.v1',
    load() { try { const v = JSON.parse(sessionStorage.getItem(this.KEY) || '[]'); if (Array.isArray(v)) this.ids = v.filter(id => L.monster(id)); } catch (e) {} },
    save() { try { sessionStorage.setItem(this.KEY, JSON.stringify(this.ids)); } catch (e) {} },
    has(id) { return this.ids.includes(id); },
    add(id) { if (!L.monster(id) || this.has(id)) return false; this.ids.push(id); this.save(); return true; },
    count() { return this.ids.length; }
  };

  LX.Speech = {
    ok: 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window, voice: null,
    init() {
      if (!this.ok) return;
      const pick = () => { const vs = speechSynthesis.getVoices() || []; this.voice = vs.find(v => /^es[-_]ES/i.test(v.lang)) || vs.find(v => /^es/i.test(v.lang)) || null; };
      pick(); try { speechSynthesis.addEventListener('voiceschanged', pick); } catch (e) { speechSynthesis.onvoiceschanged = pick; }
    },
    speak(text) {
      if (!this.ok) return false;
      try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'es-ES'; if (this.voice) u.voice = this.voice; u.rate = 0.85; speechSynthesis.speak(u); return true; }
      catch (e) { return false; }
    }
  };
  LX.Speech.init();
})();
