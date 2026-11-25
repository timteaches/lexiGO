/* =====================================================================
   LX.UI
   ===================================================================== */
(function () {
const S = LX.State, I = LX.Input;
/* ---------- Oberfläche ---------- */
const $ = s => document.querySelector(s);
const esc = s => s.replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
function tokens(s) { const out = [], re = /\[\[(.+?)\]\]/g; let i = 0, m; while ((m = re.exec(s))) { if (m.index > i) out.push({ t: s.slice(i, m.index) }); out.push({ t: m[1], es: true }); i = re.lastIndex; } if (i < s.length) out.push({ t: s.slice(i) }); return out; }
function renderTokens(tk, n) {
  let html = '', left = n;
  const wrap = (t, es) => t ? (es ? `<em class="es">${esc(t)}</em>` : esc(t)) : '';
  for (const k of tk) { const a = k.t.slice(0, Math.max(0, left)), b = k.t.slice(Math.max(0, left)); left -= k.t.length; html += wrap(a, k.es) + (b ? `<span class="ghost">${wrap(b, k.es)}</span>` : ''); }
  return html;
}

const UI = LX.UI = {
  screen: 'start', dlg: null, menu: false, pending: false, isTouch: false, card: null, wordsOpen: false, monstersOpen: false,
  isBlocking() { return this.screen !== 'game' || !!this.dlg || this.menu || !!this.card || this.wordsOpen || this.monstersOpen; },
  init() {
    this.el = { start: $('#start'), hud: $('#hud'), hint: $('#hint'), hintName: $('#hintName'), dialog: $('#dialog'), dlgName: $('#dlgName'), dlgText: $('#dlgText'), dlgMore: $('#dlgMore'),
      menu: $('#menu'), touch: $('#touch'), name: $('#hudName'), loc: $('#hudLoc'), face: $('#hudFace'), toast: $('#toast'), ctrl: $('#ctrlBox'), menuWho: $('#menuWho'),
      wordcard: $('#wordcard'), wcNew: $('#wcNew'), wcEs: $('#wcEs'), wcDe: $('#wcDe'), wcCtx: $('#wcCtx'), wcCount: $('#wcCount'), wcSpeak: $('#wcSpeak'),
      words: $('#words'), wordsList: $('#wordsList'), wordsSum: $('#wordsSum'), wordsCount: $('#wordsCount'), wordsBtn: $('#wordsBtn'), monsters: $('#monsters'), monstersList: $('#monstersList'), monstersSum: $('#monstersSum'), dojoBtn: $('#dojoBtn'), dojoBadge: $('#dojoBadge'), coinsCount: $('#coinsCount') };
    this.speakerSvg = this.el.wcSpeak.innerHTML;
    this.isTouch = I.isTouch(); document.body.classList.toggle('touch-on', this.isTouch);
    document.querySelectorAll('.k-keys').forEach(e => e.hidden = this.isTouch);
    document.querySelectorAll('.k-touch').forEach(e => e.hidden = !this.isTouch);
    this.cards = [...document.querySelectorAll('.card')];
    this.cards.forEach(cd => cd.addEventListener('click', () => this.select(cd.dataset.figur)));
    $('#goBtn').addEventListener('click', () => this.start());
    this.select(S.figur);
    this.animateCards();
    document.addEventListener('keydown', e => this.onKey(e));
    this.el.dialog.addEventListener('pointerdown', e => { e.preventDefault(); this.advance(); });
    $('#menuBtn').addEventListener('click', () => this.toggleMenu());
    this.el.menu.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (b) this.menuAct(b.dataset.act); else if (e.target === this.el.menu) this.closeMenu(); });
    I.initTouch(() => this.action());
    // Wortkarte und Sammlung
    $('#wcClose').addEventListener('click', () => this.closeWord());
    this.el.wcSpeak.addEventListener('click', () => { const w = LX.Lernstoff.wort(this.card); if (w) LX.Speech.speak(w.es); });
    this.el.wordsBtn.addEventListener('click', () => this.toggleWords());
    this.el.words.addEventListener('click', e => {
      const say = e.target.closest('[data-say]'); if (say) { const w = LX.Lernstoff.wort(say.dataset.say); if (w) LX.Speech.speak(w.es); return; }
      const b = e.target.closest('[data-act]'); if (b || e.target === this.el.words) this.closeWords();
    });
    this.el.monsters.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (b || e.target === this.el.monsters) this.closeMonsters(); });
    this.el.dojoBtn.addEventListener('click', () => { if (!this.isBlocking()) LX.Dojo.open(); });
    LX.Werte.onChange = () => this.updateCoins(); this.updateCoins();
    LX.Leitner.onChange = () => this.updateDojoBadge(); this.updateDojoBadge(); setInterval(() => this.updateDojoBadge(), 30000);
    this.updateWordsBtn(false);
    ['gesturestart', 'dblclick'].forEach(ev => document.addEventListener(ev, e => e.preventDefault()));
  },
  onKey(e) {
    const k = e.key;
    if (this.screen === 'start') {
      if (['ArrowLeft', 'a', 'A'].includes(k)) { e.preventDefault(); this.select('pedro'); }
      else if (['ArrowRight', 'd', 'D'].includes(k)) { e.preventDefault(); this.select('sofia'); }
      else if (['Enter', ' ', 'e', 'E'].includes(k)) { e.preventDefault(); this.start(); }
      return;
    }
    if (k === 'Escape') { e.preventDefault(); if (this.card) this.closeWord(); else if (this.dlg) this.closeDialog(); else if (this.wordsOpen) this.closeWords(); else if (this.monstersOpen) this.closeMonsters(); else if (this.menu) this.closeMenu(); else this.openMenu(); return; }
    if (this.menu || this.wordsOpen || this.monstersOpen) return;     // dort bedient Enter die Knöpfe
    if (k === 'e' || k === 'E' || k === 'Enter') { e.preventDefault(); if (!e.repeat) this.action(); }
  },
  action() {
    if (this.screen !== 'game' || this.menu || this.wordsOpen || this.monstersOpen) return;
    if (this.card) this.closeWord(); else if (this.dlg) this.advance(); else if (LX.Game) LX.Game.interact();
  },
  select(f) {
    S.set(f);
    this.cards.forEach(cd => cd.setAttribute('aria-pressed', cd.dataset.figur === f ? 'true' : 'false'));
  },
  animateCards() {
    const items = this.cards.map(cd => { const g = cd.querySelector('canvas').getContext('2d'); g.imageSmoothingEnabled = false; return { cd, g, sheet: LX.Art.getChar(cd.dataset.figur) }; });
    const t0 = performance.now();
    const loop = t => {
      if (this.screen === 'start') { const step = Math.floor((t - t0) / 150);
        items.forEach(o => { const sel = o.cd.getAttribute('aria-pressed') === 'true', f = sel ? [1, 0, 2, 0][step % 4] : [0, 0, 0, 0, 3, 3, 3, 3][step % 8];
          o.g.clearRect(0, 0, 16, 24); o.g.drawImage(o.sheet, f * 16, 0, 16, 24, 0, 0, 16, 24); }); }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  },
  start() {
    if (this.screen !== 'start') return;
    if (!window.Phaser) { this.toast('Die Spiel-Engine ist nicht geladen.'); return; }
    this.screen = 'game';
    this.el.start.hidden = true; this.el.hud.hidden = false; this.el.touch.hidden = !this.isTouch;
    this.el.name.textContent = S.name; this.updateWordsBtn(false);
    const g = this.el.face.getContext('2d'); g.imageSmoothingEnabled = false; g.clearRect(0, 0, 16, 16); g.drawImage(LX.Art.getChar(S.figur), 0, 0, 16, 16, 0, 0, 16, 16);
    if (document.activeElement) document.activeElement.blur();
    if (LX.Game && LX.Game.scene) this.go(); else this.pending = true;
  },
  sceneReady() { if (this.pending) { this.pending = false; this.go(); } },
  go() {
    LX.Game.start(S.figur);
    if (!S.introSeen) { S.introSeen = true; S.save(); setTimeout(() => { if (this.screen === 'game') this.openDialog(LX.Content.intro.name, LX.Content.intro.pages); }, 450); }
  },
  backToStart() {
    this.closeMenu(); this.closeDialog(); this.closeWord(); this.closeWords(); this.closeMonsters(); this.screen = 'start';
    this.el.hud.hidden = true; this.el.touch.hidden = true; this.el.hint.hidden = true; this.el.start.hidden = false;
    I.touch = { x: 0, y: 0 }; LX.Game.toStart();
    const sel = this.cards.find(c => c.dataset.figur === S.figur); if (sel) sel.focus();
  },
  setHint(name) { if (!name || this.isBlocking()) { this.el.hint.hidden = true; return; } this.el.hintName.textContent = '· ' + name; this.el.hint.hidden = false; },
  setLocation(name, full) { const t = full ? name : LX.Content.village + ' · ' + name; if (this.el.loc.textContent !== t) this.el.loc.textContent = t; this.lastLoc = full ? name : LX.Content.village + ' · ' + name; },
  /* Wortkarte: Spanisch, Deutsch, Aussprache; beim ersten Fund „Neues Wort!“ */
  showWord(id, onClose) {
    const LS = LX.Lernstoff, w = LS.wort(id); if (!w) return false;
    this.closeDialog(); this.closeWord();
    const isNew = LX.Sammlung.add(id), e = this.el, n = LS.netz(w.wortnetz), ab = LS.abschnittVonWort(id);
    this.card = id; this.onWordClose = onClose || null;
    e.wcEs.textContent = w.es; e.wcDe.textContent = w.de;
    e.wcCtx.textContent = (ab ? LS.label(ab.id) + ' · ' : '') + (n ? n.titel : '');
    e.wcNew.hidden = !isNew; e.wordcard.classList.toggle('isnew', isNew); e.wcSpeak.hidden = !LX.Speech.ok;
    e.wcCount.textContent = LX.Sammlung.count() + ' von ' + LS.gesamt() + ' Wörtern entdeckt';
    e.wordcard.hidden = false; e.hint.hidden = true;
    this.updateWordsBtn(isNew); LX.Speech.speak(w.es);
    return isNew;
  },
  closeWord() { if (!this.card) return; this.card = null; this.el.wordcard.hidden = true; const f = this.onWordClose; this.onWordClose = null; if (f) f(); },
  updateCoins() { this.el.coinsCount.textContent = LX.Werte.fortuna; },
  // Anzahl fälliger Wörter am Dojo-Knopf; bei 0 kein Badge
  updateDojoBadge() { const n = LX.Leitner.anzahlFaellig(), b = this.el.dojoBadge; b.hidden = n === 0; b.textContent = n; },
  updateWordsBtn(bump) {
    const b = this.el.wordsBtn; this.el.wordsCount.textContent = LX.Sammlung.count() + '/' + LX.Lernstoff.gesamt();
    if (bump) { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }
  },
  /* Sammlung „Meine Wörter“ */
  openWords() {
    if (this.screen !== 'game') return; this.closeWord(); this.closeDialog(); this.closeMenu(); this.closeMonsters();
    const LS = LX.Lernstoff, S2 = LX.Sammlung, svg = this.speakerSvg; let html = '';
    LS.spielbareAbschnitte().forEach(ab => {
      ab.wortnetze.forEach(nid => {
        const n = LS.netz(nid);
        html += `<div class="wgroup">${esc(LS.label(ab.id))} · ${esc(n ? n.titel : '')}</div>`;
        LS.woerterImNetz(nid).forEach(w => {
          html += S2.has(w.id)
            ? `<div class="wrow"><b lang="es">${esc(w.es)}</b><span>${esc(w.de)}</span>${LX.Speech.ok ? `<button class="speak" data-say="${esc(w.id)}" aria-label="Aussprache ${esc(w.es)}">${svg}</button>` : ''}</div>`
            : `<div class="wrow locked"><b>· · ·</b><span>noch nicht entdeckt</span></div>`;
        });
      });
      const rest = LS.abschnitteDerEinheit(ab.einheit).filter(a => !a.spielbar);
      if (rest.length) html += `<p class="wsoon">Noch nicht freigeschaltet: ${rest.map(a => esc(LS.label(a.id))).join(', ')}</p>`;
    });
    this.el.wordsList.innerHTML = html;
    this.el.wordsSum.textContent = S2.count() + ' von ' + LS.gesamt() + ' Wörtern entdeckt';
    this.wordsOpen = true; this.el.words.hidden = false; this.el.hint.hidden = true;
    const b = this.el.words.querySelector('.btn'); if (b) b.focus();
  },
  closeWords() { if (!this.wordsOpen) return; this.wordsOpen = false; this.el.words.hidden = true; if (document.activeElement) document.activeElement.blur(); },
  /* „Meine Monster“: gefangene Monster mit Stufen (Stufe 2 und 3 noch gesperrt) */
  openMonsters() {
    if (this.screen !== 'game') return; this.closeWord(); this.closeDialog(); this.closeMenu(); this.closeWords();
    const LS = LX.Lernstoff, T = LX.Content.monsterliste, list = this.el.monstersList, fill = (s, o) => Object.keys(o).reduce((t, k) => t.split('{' + k + '}').join(o[k]), s);
    list.textContent = ''; this.stopMonsterAnim();
    const anims = [];
    LS.raw.monster.filter(m => m.implementiert).forEach(m0 => {
      const id = m0.id, mon = LS.monster(id), art = LX.Art[LX.Content.monsterArt[id]], caught = LX.Monster.has(id); if (!mon || !art) return;
      const netz = LS.netz(mon.wortnetz), words = LS.woerterImNetz(mon.wortnetz), got = words.filter(w => LX.Sammlung.has(w.id)).length;
      const card = document.createElement('div'); card.className = 'mcard' + (caught ? '' : ' grey');
      card.innerHTML = `<div class="mhead"><b>${esc(mon.name)}</b><span>${esc(netz ? netz.titel : '')}</span><span class="mcount">${esc(fill(T.woerter, { n: got, m: words.length }))}</span></div>${caught ? this.statsHtml(id) : ''}<div class="mtiles"></div>`;
      const tiles = card.querySelector('.mtiles');
      [1, 2, 3].forEach(st => {
        const lock = st > mon.stufe, locked = lock || !caught, tile = document.createElement('div'); tile.className = 'mtile' + (locked ? ' locked' : '');
        const cv = document.createElement('canvas'); cv.width = cv.height = 64; const g = cv.getContext('2d', { willReadFrequently: true }); g.imageSmoothingEnabled = false;
        const frames = [art(st, 0, false), art(st, 1, false), art(st, 0, true)];
        const draw = f => { g.clearRect(0, 0, 64, 64); g.drawImage(frames[f], 0, 0);
          if (locked) { const d = g.getImageData(0, 0, 64, 64), p = d.data; for (let i = 0; i < p.length; i += 4) if (p[i + 3]) { p[i] = 42; p[i + 1] = 36; p[i + 2] = 56; } g.putImageData(d, 0, 0); } };
        draw(0); if (!locked) anims.push(draw);
        tile.appendChild(cv);
        tile.insertAdjacentHTML('beforeend', `<small>${esc(fill(T.stufe, { n: st }))}</small>` + (lock ? `<svg class="lock" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" fill="#f1ead8" stroke="#17393f" stroke-width="2"/><path d="M8 11V8a4 4 0 018 0v3" fill="none" stroke="#17393f" stroke-width="2.4"/></svg>` : '') + (locked ? `<span>${esc(!caught && st === 1 ? T.ungefangen : T.gesperrt)}</span>` : ''));
        tiles.appendChild(tile);
      });
      list.appendChild(card);
    });
    const total = LS.raw.monster.filter(m => m.implementiert).length;
    this.el.monstersSum.textContent = fill(T.summe, { n: LX.Monster.count(), m: total });
    // Animation Stufe 1: Bildfolge wie im Lernraum, 2 Bilder pro Sekunde
    const seq = [0, 1, 0, 1, 0, 1, 0, 1, 2]; let step = 0;
    if (anims.length) this.monsterTimer = setInterval(() => { step = (step + 1) % seq.length; anims.forEach(d => d(seq[step])); }, 500);
    this.monstersOpen = true; this.el.monsters.hidden = false; this.el.hint.hidden = true;
    const b = this.el.monsters.querySelector('.btn'); if (b) b.focus();
  },
  // Level, XP, ATK, DEF, LP und sichere Wörter eines gefangenen Monsters
  statsHtml(id) {
    const w = LX.Werte.werte(id), Z = LX.Content.werte, f = (s, o) => Object.keys(o).reduce((t, k) => t.split('{' + k + '}').join(o[k]), s);
    return `<div class="mstats"><div class="mlv"><b>${esc(f(Z.level, { n: w.level }))}</b><span>${esc(w.xpNaechst != null ? f(Z.xp, { n: w.xp, m: w.xpNaechst }) : f(Z.xpMax, { n: w.xp }))}</span></div>`
      + `<div class="mgrid"><span><small>${esc(Z.atk)}</small><b class="${w.malus ? 'malus' : ''}">${w.atkEff}</b>${w.malus ? `<em>${esc(f(Z.verblasst, { n: w.malus }))}</em>` : ''}</span>`
      + `<span><small>${esc(Z.def)}</small><b>${w.def}</b></span><span><small>${esc(Z.lp)}</small><b>${w.lp}</b></span></div>`
      + `<div class="msafe">${esc(f(Z.sicher, { n: w.sicher, m: w.woerterGesamt }))}</div></div>`;
  },
  stopMonsterAnim() { if (this.monsterTimer) { clearInterval(this.monsterTimer); this.monsterTimer = null; } },
  closeMonsters() { if (!this.monstersOpen) return; this.monstersOpen = false; this.el.monsters.hidden = true; this.stopMonsterAnim(); if (document.activeElement) document.activeElement.blur(); },
  toggleWords() { if (this.wordsOpen) this.closeWords(); else this.openWords(); },
  /* Dialog mit Schreibmaschinen-Effekt */
  openDialog(name, pages, onClose) {
    this.closeDialog();
    this.dlg = { pages: pages.map(s => tokens(LX.Text.fmt(s))), i: 0, n: 0, len: 0, onClose };
    this.el.dlgName.textContent = LX.Text.fmt(name); this.el.dialog.hidden = false; this.el.hint.hidden = true; this.showPage();
  },
  showPage() {
    const d = this.dlg; d.n = 0; d.len = d.pages[d.i].reduce((a, t) => a + t.t.length, 0);
    this.el.dlgMore.hidden = true; clearInterval(this.typer);
    this.typer = setInterval(() => { d.n += 1; this.renderPage(); if (d.n >= d.len) this.finishTyping(); }, 22);
    this.renderPage();
  },
  finishTyping() { clearInterval(this.typer); this.typer = null; const d = this.dlg; if (!d) return; d.n = d.len; this.renderPage(); this.el.dlgMore.textContent = d.i < d.pages.length - 1 ? '▼ weiter' : '✓ schließen'; this.el.dlgMore.hidden = false; },
  renderPage() { const d = this.dlg; if (d) this.el.dlgText.innerHTML = renderTokens(d.pages[d.i], d.n); },
  advance() { const d = this.dlg; if (!d) return; if (d.n < d.len) { this.finishTyping(); return; } if (d.i < d.pages.length - 1) { d.i++; this.showPage(); } else this.closeDialog(); },
  closeDialog() { if (!this.dlg) return; clearInterval(this.typer); this.typer = null; const cb = this.dlg.onClose; this.dlg = null; this.el.dialog.hidden = true; if (cb) cb(); },
  /* Menü */
  openMenu() {
    if (this.screen !== 'game') return; this.closeDialog(); this.menu = true; this.el.hint.hidden = true;
    this.el.menuWho.textContent = S.name + ' · ' + (this.lastLoc || LX.Content.village);
    this.el.menu.hidden = false; const b = this.el.menu.querySelector('.btn'); if (b) b.focus();
  },
  closeMenu() { if (!this.menu) return; this.menu = false; this.el.menu.hidden = true; this.el.ctrl.hidden = true; if (document.activeElement) document.activeElement.blur(); },
  toggleMenu() { if (this.menu) this.closeMenu(); else this.openMenu(); },
  menuAct(a) { if (a === 'resume') this.closeMenu(); else if (a === 'controls') this.el.ctrl.hidden = !this.el.ctrl.hidden; else if (a === 'switch') this.backToStart(); else if (a === 'words') this.openWords(); else if (a === 'monsters') this.openMonsters(); },
  toast(msg, ms = 4000) { const t = this.el.toast; t.textContent = msg; t.hidden = false; clearTimeout(this.tt); this.tt = setTimeout(() => t.hidden = true, ms); },
  engineMissing() { document.getElementById('engineErr').hidden = false; document.getElementById('goBtn').disabled = true; }
};
})();
