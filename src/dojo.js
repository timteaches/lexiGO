/* =====================================================================
   LX.Dojo – Dojo-Training: alle fälligen Wörter der Reihe nach (Leitner), Multiple Choice.
   Texte stehen in LX.Content.dojo, Intervalle und Boxen in LX.Leitner (content/lernlogik.json).
   ===================================================================== */
(function () {
const C = LX.Content, $ = s => document.querySelector(s);
const esc = s => s.replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const rich = s => esc(s).replace(/\[\[(.+?)\]\]/g, '<em class="es">$1</em>');
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
const text = (s, extra) => LX.Text.fmt(Object.keys(extra || {}).reduce((t, k) => t.split('{' + k + '}').join(extra[k]), s));

LX.Dojo = {
  active: false, el: null,
  init() {
    this.el = { root: $('#dojo'), lucia: $('#djLucia'), luciaName: $('#djLuciaName'), prog: $('#djProg'), msg: $('#djMsg'), es: $('#djEs'), speak: $('#djSpeak'),
      ans: $('#djAns'), next: $('#djNext'), end: $('#djEnd'), q: $('#djQ') };
    const e = this.el;
    e.end.addEventListener('click', () => this.close());
    e.speak.addEventListener('click', () => { if (this.cur) LX.Speech.speak(this.cur.es); });
    e.ans.addEventListener('click', ev => { const b = ev.target.closest('button[data-id]'); if (b) this.answer(b.dataset.id); });
    e.next.addEventListener('click', () => this.nextQuestion());
    document.addEventListener('keydown', ev => { if (this.active && ev.key === 'Escape') { ev.preventDefault(); this.close(); } });
  },

  open(onClose) {
    if (!this.el) this.init();
    const UI = LX.UI, e = this.el;
    UI.closeDialog(); UI.closeWord(); UI.closeWords(); UI.closeMenu(); UI.closeMonsters();
    UI.screen = 'dojo'; UI.el.hud.hidden = true; UI.el.touch.hidden = true; UI.el.hint.hidden = true; LX.Input.touch = { x: 0, y: 0 };
    const due = LX.Leitner.faellige().filter(id => LX.Lernstoff.wort(id));
    Object.assign(this, { active: true, onClose, queue: due.slice(), total: due.length, done: 0, seen: new Set(), busy: false, cur: null });
    const lu = C.npcs.find(n => n.id === 'lucia');
    e.luciaName.textContent = lu ? lu.name : ''; e.root.hidden = false; e.next.hidden = true; e.speak.hidden = !LX.Speech.ok;
    if (!due.length) { this.fertig(C.dojo.leer); return; }
    this.lucia(pick(C.dojo.satz)); this.updateProg(); this.nextQuestion();
  },
  close() {
    if (!this.active) return;
    this.active = false; clearTimeout(this.timer);
    try { speechSynthesis.cancel(); } catch (_) {}
    const UI = LX.UI, f = this.onClose; this.onClose = null;
    this.el.root.hidden = true;
    UI.screen = 'game'; UI.el.hud.hidden = false; UI.el.touch.hidden = !UI.isTouch; UI.setHint(null); UI.updateDojoBadge();
    if (f) f();
  },

  lucia(msg) { this.el.lucia.innerHTML = rich(text(msg)); },
  say(msg) { this.el.msg.innerHTML = rich(msg); },
  updateProg() { this.el.prog.textContent = text(C.dojo.fortschritt, { n: this.done, m: this.total }); },
  fertig(msg) {
    const e = this.el; this.cur = null;
    e.es.textContent = ''; e.ans.innerHTML = ''; e.next.hidden = true; e.speak.hidden = true; e.msg.textContent = '';
    this.lucia(msg); this.updateProg();
  },

  // vier Antworten (Deutsch) aus demselben Wortnetz, nur aus bekannten Wörtern; bei weniger Wörtern weniger
  options(w) {
    const seen = new Set([w.de]), others = [];
    shuffle(LX.Lernstoff.woerterImNetz(w.wortnetz)).forEach(x => { if (x.id !== w.id && LX.Leitner.hat(x.id) && !seen.has(x.de) && others.length < 3) { seen.add(x.de); others.push(x); } });
    return shuffle(others.concat(w));
  },
  nextQuestion() {
    if (!this.active) return;
    if (!this.queue.length) { this.fertig(pick(C.dojo.fertig)); return; }
    const w = this.cur = LX.Lernstoff.wort(this.queue.shift()); this.busy = false;
    const e = this.el; e.msg.textContent = ''; e.next.hidden = true; e.ans.classList.remove('locked');
    e.es.textContent = w.es; e.speak.hidden = !LX.Speech.ok;
    e.ans.innerHTML = this.options(w).map(o => `<button type="button" data-id="${esc(o.id)}">${esc(o.de)}</button>`).join('');
    LX.Speech.speak(w.es);
  },
  answer(id) {
    if (!this.active || this.busy || !this.cur) return;
    this.busy = true;
    const w = this.cur, ok = id === w.id, e = this.el, erst = !this.seen.has(w.id);
    e.ans.classList.add('locked');
    e.ans.querySelectorAll('button').forEach(b => { if (b.dataset.id === w.id) b.classList.add('right'); else if (b.dataset.id === id) b.classList.add('wrong'); });
    if (erst) { this.seen.add(w.id); if (ok) LX.Leitner.richtig(w.id); else LX.Leitner.falsch(w.id); }   // Wiederholungen ändern die Box nicht mehr
    LX.UI.updateDojoBadge();
    if (ok) {
      this.done++; this.updateProg(); this.say(text(pick(C.dojo.richtig)));
      this.timer = setTimeout(() => this.nextQuestion(), 900);
    } else {
      this.say(text(C.dojo.falsch, { antwort: w.de }));
      this.queue.splice(Math.min(2, this.queue.length), 0, w.id);            // kommt noch einmal in dieser Sitzung
      e.next.hidden = false;
    }
  }
};
})();
