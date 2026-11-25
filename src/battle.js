/* =====================================================================
   LX.Battle      – rundenbasierter Kampf mit Multiple Choice (HTML-Overlay + Logik)
   LX.BattleScene – Phaser-Szene "battle": Bühne mit Holamander und der Spielfigur
   Alle Werte kommen aus dem Block "kampf" in content/lernstoff.json, alle Texte aus LX.Content.battle.
   ===================================================================== */
(function () {
const C = LX.Content, $ = s => document.querySelector(s);
const esc = s => s.replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const rich = s => esc(s).replace(/\[\[(.+?)\]\]/g, '<em class="es">$1</em>');          // [[…]] = Spanisch, farbig
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
const text = (s, extra) => LX.Text.fmt(Object.keys(extra || {}).reduce((t, k) => t.split('{' + k + '}').join(extra[k]), s));

const B = LX.Battle = {
  active: false, el: null,
  init() {
    this.el = { root: $('#battle'), top: $('.bt-top'), name: $('#btName'), fill: $('#btFill'), lp: $('#btLp'), back: $('#btBack'), panel: $('#btPanel'), msg: $('#btMsg'),
      es: $('#btEs'), speak: $('#btSpeak'), ans: $('#btAns'), next: $('#btNext'), weak: $('#btWeak'), weakText: $('#btWeakText'), catch: $('#btCatch') };
    const e = this.el;
    e.back.addEventListener('click', () => this.leave());
    e.speak.addEventListener('click', () => { if (this.cur) LX.Speech.speak(this.cur.es); });
    e.ans.addEventListener('click', ev => { const b = ev.target.closest('button[data-id]'); if (b) this.answer(b.dataset.id); });
    e.next.addEventListener('click', () => this.nextQuestion());
    e.catch.addEventListener('click', () => LX.UI.toast(text(C.battle.fangenBald), 2500));
    document.addEventListener('keydown', ev => { if (this.active && ev.key === 'Escape') { ev.preventDefault(); this.leave(); } });
  },

  open(scene, data) {
    if (!this.el) this.init();
    const K = LX.Lernstoff.raw.kampf, mon = LX.Lernstoff.monster(data.monster.id), UI = LX.UI, e = this.el;
    Object.assign(this, { scene, K, mon, active: true, lp: K.monsterLP, weak: false, last: null, queue: [], busy: false, cur: null });
    UI.closeDialog(); UI.closeWord(); UI.closeWords(); UI.closeMenu();
    UI.screen = 'battle'; UI.el.hud.hidden = true; UI.el.touch.hidden = true; UI.el.hint.hidden = true; LX.Input.touch = { x: 0, y: 0 };
    e.root.hidden = false; e.name.textContent = mon.name; e.weak.hidden = true; e.next.hidden = true; e.speak.hidden = !LX.Speech.ok;
    this.updateLp(); this.say(text(C.battle.start));
    this.nextQuestion();
  },

  leave() {
    if (!this.active) return;
    this.active = false; clearTimeout(this.timer);
    const UI = LX.UI, e = this.el;
    e.root.hidden = true; e.weak.hidden = true;
    try { speechSynthesis.cancel(); } catch (_) {}
    UI.screen = 'game'; UI.el.hud.hidden = false; UI.el.touch.hidden = !UI.isTouch; UI.setHint(null);
    this.scene.leaveBattle();            // Monster erholt sich von selbst: LP werden bei jedem Kampf neu gesetzt
  },

  say(msg) { this.el.msg.innerHTML = rich(msg); },
  updateLp() {
    const e = this.el, K = this.K;
    e.fill.style.width = Math.max(0, this.lp / K.monsterLP * 100) + '%';
    e.lp.textContent = C.battle.lp + ' ' + this.lp + '/' + K.monsterLP;
  },
  // Bühne über dem Fragefeld, unter der oberen Leiste (für die Szene)
  stage() {
    const t = this.el.top.getBoundingClientRect(), p = this.el.panel.getBoundingClientRect();
    return { top: t.bottom + 8, bottom: p.top - 8 };
  },

  /* ---------- Fragen ---------- */
  pool() { return LX.Sammlung.ids.filter(id => LX.Lernstoff.wort(id)); },       // nur entdeckte Wörter
  nextId() {
    const pool = this.pool(); if (!pool.length) return null;
    if (!this.queue.length) this.queue = shuffle(pool);
    if (pool.length > 1 && this.queue[0] === this.last) {                          // nie zweimal direkt hintereinander
      const i = this.queue.findIndex(id => id !== this.last);
      if (i > 0) { const t = this.queue[0]; this.queue[0] = this.queue[i]; this.queue[i] = t; }
      else this.queue = shuffle(pool.filter(id => id !== this.last)).concat(this.queue);
    }
    return this.queue.shift();
  },
  // richtige Antwort plus bis zu drei falsche aus demselben Wortnetz (nur entdeckte Wörter, verschiedene Übersetzungen)
  options(w) {
    const got = new Set(this.pool()), seen = new Set([w.de]), others = [];
    shuffle(LX.Lernstoff.woerterImNetz(w.wortnetz)).forEach(x => { if (x.id !== w.id && got.has(x.id) && !seen.has(x.de) && others.length < 3) { seen.add(x.de); others.push(x); } });
    return shuffle(others.concat(w));
  },
  nextQuestion() {
    if (!this.active) return;
    const id = this.nextId(); if (!id) return;
    const w = this.cur = LX.Lernstoff.wort(id); this.last = id; this.busy = false;
    this.say(text(C.battle.frage));
    this.el.es.textContent = w.es; this.el.next.hidden = true; this.el.ans.classList.remove('locked');
    this.el.ans.innerHTML = this.options(w).map(o => `<button type="button" data-id="${esc(o.id)}">${esc(o.de)}</button>`).join('');
    LX.Speech.speak(w.es);
    this.scene.layout();
  },
  answer(id) {
    if (!this.active || this.busy || !this.cur) return;
    this.busy = true;
    const w = this.cur, ok = id === w.id, e = this.el;
    e.ans.classList.add('locked');
    e.ans.querySelectorAll('button').forEach(b => { if (b.dataset.id === w.id) b.classList.add('right'); else if (b.dataset.id === id) b.classList.add('wrong'); });
    if (ok) {
      this.say(text(pick(C.battle.richtig)));
      this.scene.flyWord(w.es, () => {
        this.scene.monsterHit();
        this.lp = Math.max(1, this.lp - 1);                // das Monster wird nie besiegt, nur geschwächt
        this.updateLp();
        if (!this.weak && this.lp <= this.K.geschwaechtAb) { this.weak = true; e.weakText.textContent = text(C.battle.geschwaecht); e.weak.hidden = false; this.scene.monsterWeak(); this.scene.layout(); }
        this.timer = setTimeout(() => this.nextQuestion(), 900);
      });
    } else {
      this.say(text(C.battle.falsch, { antwort: w.de }));
      this.scene.monsterWard();
      this.queue = this.queue.filter(x => x !== w.id); this.queue.splice(Math.min(2, this.queue.length), 0, w.id);   // kommt früher wieder
      e.next.hidden = false; this.scene.layout();
    }
  }
};

/* ---------- Phaser-Szene ---------- */
LX.BattleScene = class BattleScene extends Phaser.Scene {
  constructor() { super('battle'); }
  init(data) { this.d = data; }
  create() {
    const md = this.d.monster, key = 'holamander-' + md.stufe + '-gebannt', figur = LX.State.figur, rkey = 'room-' + this.d.room;
    this.cameras.main.setBackgroundColor('#241a17');
    this.bg = this.textures.exists(rkey) ? this.add.image(0, 0, rkey).setOrigin(0.5, 0).setDepth(0) : null;     // Lernraum-Hintergrund
    this.mshadow = this.add.image(0, 0, 'misc', 'shadow').setDepth(1);
    this.hshadow = this.add.image(0, 0, 'misc', 'shadow').setDepth(1);
    this.mon = this.add.sprite(0, 0, key, 0).setOrigin(0.5, 0.83).setDepth(5); this.mon.anims.play(key + '-idle');
    this.hero = this.add.sprite(0, 0, 'chr-' + figur, 12).setOrigin(0.5, 1).setDepth(6); this.hero.anims.play(figur + '-idle-up');   // von hinten
    this.scale.on('resize', this.layout, this);
    this.events.once('shutdown', () => this.scale.off('resize', this.layout, this));
    this.cameras.main.fadeIn(220, 20, 14, 12);
    LX.Battle.open(this, this.d);
    this.layout();
  }
  layout() {
    if (!this.mon || !this.mon.scene) return;
    const gs = this.scale.gameSize, w = gs.width, h = gs.height, cam = this.cameras.main;
    cam.setSize(w, h); cam.setZoom(1);
    if (this.bg) { const k = Math.max(1, Math.ceil(Math.max(w / this.bg.width, h / this.bg.height))); this.bg.setScale(k).setPosition(w / 2, 0); }
    const st = LX.Battle.stage(), feet = st.bottom - 28;
    const k = (feet - st.top >= 0.83 * 64 * 3 + 6 && w >= 480) ? 3 : 2;        // Faktor 3, bei sehr kleiner Bühne 2
    this.k = k; this.mx = Math.round(w * 0.68); this.my = Math.round(feet);
    if (!this.shaking) this.mon.setPosition(this.mx, this.my);
    this.mon.setScale(k);
    this.mshadow.setPosition(this.mx, this.my - 1).setScale(k * 0.8, k * 0.5);
    const hx = Math.round(w * 0.26), hy = Math.round(Math.min(feet + 12, st.bottom - 4));
    this.hero.setPosition(hx, hy).setScale(k); this.hshadow.setPosition(hx, hy - 1).setScale(k * 0.55, k * 0.4);
  }
  // Das zurückeroberte Wort fliegt als Text zum Monster
  flyWord(word, cb) {
    const sx = this.hero.x + 6 * this.k, sy = this.hero.y - this.hero.displayHeight * 0.85, tx = this.mon.x, ty = this.mon.y - this.mon.displayHeight * 0.4;
    const t = this.add.text(sx, sy, word, { fontFamily: 'Fredoka, Nunito, sans-serif', fontSize: '32px', fontStyle: 'bold', color: '#ffd23f', stroke: '#17393f', strokeThickness: 6 }).setOrigin(0.5).setDepth(50);
    this.tweens.add({ targets: t, scale: 1.4, duration: 650, ease: 'Sine.easeIn' });
    this.tweens.add({ targets: t, x: { value: tx, ease: 'Linear' }, y: { value: ty, ease: 'Quad.easeIn' }, duration: 650, onComplete: () => { t.destroy(); cb(); } });
  }
  monsterHit() {
    const m = this.mon, x0 = this.mx; this.shaking = true;
    m.setTintFill(0xffffff); this.time.delayedCall(110, () => m.clearTint());
    this.tweens.add({ targets: m, x: { from: x0 - 12, to: x0 }, scaleY: { from: this.k * 0.9, to: this.k }, duration: 300, ease: 'Bounce.easeOut', onComplete: () => { this.shaking = false; m.setPosition(this.mx, this.my); } });
  }
  monsterWard() {                      // abwehren: schütteln
    const m = this.mon, x0 = this.mx; this.shaking = true;
    this.tweens.add({ targets: m, x: x0 + 9, duration: 65, yoyo: true, repeat: 4, onComplete: () => { this.shaking = false; m.setPosition(this.mx, this.my); } });
  }
  monsterWeak() { this.mon.anims.timeScale = 0.5; this.mon.setAlpha(0.92); }
  leaveBattle() {
    const cam = this.cameras.main;
    cam.once('camerafadeoutcomplete', () => { this.scene.stop(); this.scene.wake('room'); });
    cam.fadeOut(220, 20, 14, 12);
  }
};
})();
