/* =====================================================================
   LX.World – Phaser-Szenen
   MapScene  gemeinsame Grundlage (Spielfigur, Kollision, NPCs, Interaktion)
   WorldScene  Hub-Map „Villapalabra“ (aus Version 1.1)
   RoomScene   Lernräume (Phase 2: Unidad 1 · ¡Acércate!)
   ===================================================================== */
(function () {
const C = LX.Content, T = C.map.tile, tp = v => v * T;

// Objekttypen: Grafik, Kollisionsrechteck(e) [dx, dy, w, h] relativ zur Unterkante-Mitte, Schattenbreite
const TYPES = {
  house: { tex: 'house', frame: o => o.v, coll: [-46, -52, 92, 50], sw: 50 },
  dojo: { tex: 'dojo', coll: [-78, -66, 156, 64], sw: 84 },
  stall: { parts: [{ tex: 'stall', frame: o => o.v, dd: -22 }, { tex: 'stall', frame: o => o.v + 3, dd: 0 }], coll: [-30, -26, 60, 24], sw: 34 },
  fountain: { tex: 'fountain', frames: 3, every: 170, coll: [-22, -28, 44, 26], sw: 26 },
  gate: { tex: o => 'gate-' + o.v, frames: 4, every: 220, sw: 34,
    coll: o => o.open ? [[-31, -50, 15, 49], [16, -50, 15, 49]] : o.v === 'm1' ? [-32, -68, 64, 66] : [-32, -22, 64, 21] },
  tree: { tex: o => 'tree-' + (o.v || 'round'), coll: [-5, -7, 10, 6], sway: true, sw: 13 },
  cypress: { tex: 'cypress', coll: [-4, -6, 8, 5], sway: true, sw: 7 },
  bush: { tex: 'bush', frame: o => o.v || 0, coll: [-6, -7, 12, 6], sw: 8 },
  bench: { parts: [{ tex: 'misc', frame: 'benchB', dd: -11 }, { tex: 'misc', frame: 'benchF', dd: 0 }], coll: [-15, -12, 30, 11], sw: 16 },
  lantern: { tex: 'misc', frame: 'lantern', coll: [-3, -4, 6, 3], sw: 4 },
  pot: { tex: 'misc', frame: 'pot', coll: [-5, -6, 10, 5], sw: 6 },
  fence: { tex: 'misc', frame: 'fence', coll: [-8, -5, 16, 4], sw: 0 },
  crate: { tex: 'misc', frame: 'crate', coll: [-7, -9, 14, 8], sw: 8 },
  barrel: { tex: 'misc', frame: 'barrel', coll: [-6, -9, 12, 8], sw: 7 },
  signpost: { tex: 'misc', frame: 'signpost', coll: [-3, -4, 6, 3], sw: 4 },
  marketsign: { tex: 'misc', frame: 'marketsign', coll: [-15, -4, 30, 3], sw: 12 },
  reeds: { tex: 'misc', frame: 'reeds', sw: 0 },
  rock: { tex: 'misc', frame: 'rock', coll: [-6, -5, 12, 4], sw: 0 },
  plant: { tex: 'roomobj', frame: 'plant', coll: [-6, -6, 12, 5] },
  table: { tex: 'roomobj', frame: 'table', coll: [-12, -10, 24, 9] },
  bed: { tex: 'roomobj', frame: 'bed', coll: [-16, -24, 32, 23] },
  coatrack: { tex: 'roomobj', frame: 'coatrack', coll: [-4, -4, 8, 3] }
};
const val = (v, o) => typeof v === 'function' ? v(o) : v;
const posOf = o => ({ x: o.px != null ? o.px : tp(o.x), y: o.py != null ? o.py : tp(o.y) });
const dirTo = (dx, dy) => Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down');

// Waldrand rund um die Hub-Map (Lücken vor den Toren)
function borderTrees() {
  const W = C.map.w * T, H = C.map.h * T, out = [], R = LX.Art.rng(77), kinds = ['round', 'round', 'round', 'olive'];
  const gates = C.objects.filter(o => o.k === 'gate').map(posOf);
  const add = (x, y) => { if (gates.some(g => Math.abs(g.x - x) < 40 && y > g.y - 50 && y < g.y + 30)) return; out.push({ k: 'tree', v: kinds[Math.floor(R() * kinds.length)], px: Math.round(x), py: Math.round(y) }); };
  for (let x = -4; x < W + 16; x += 21) { add(x + R() * 6, 24 + R() * 4); add(x + 10 + R() * 6, 48 + R() * 4); add(x + R() * 6, 72 + R() * 4); add(x + R() * 6, H - 22 + R() * 4); add(x + 10 + R() * 6, H + 2); }
  for (let y = 92; y < H - 30; y += 21) { add(6 + R() * 4, y + R() * 5); add(26 + R() * 4, y + 10 + R() * 5); add(W - 6 - R() * 4, y + R() * 5); add(W - 26 - R() * 4, y + 10 + R() * 5); }
  return out;
}

/* ===================== Gemeinsame Grundlage ===================== */
class MapScene extends Phaser.Scene {
  initMap(W, H) {
    this.W = W; this.H = H;
    this.walls = []; this.trees = []; this.animated = []; this.interactables = []; this.npcs = []; this.npcBodies = []; this.colliders = [];
    this.target = null; this.swayTimer = 0; this.transitioning = false; this.player = null;
    this.keys = this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT');
    this.bubble = this.add.image(0, 0, 'misc', 'bubble').setOrigin(0.5, 1).setDepth(9500).setVisible(false);
    this.physics.world.setBounds(0, 0, W, H);
    this.scale.on('resize', this.onResize, this);
    this.events.once('shutdown', () => this.scale.off('resize', this.onResize, this));
    this.onResize(this.scale.gameSize);
  }
  zoomFor(w, h) { return Math.max(2, Math.floor(Math.min(w / 300, h / 200))); }
  onResize(gs) { const cam = this.cameras.main; cam.setSize(gs.width, gs.height); cam.setZoom(this.zoomFor(gs.width, gs.height)); }

  addWall(x, y, w, h) { const z = this.add.zone(x + w / 2, y + h / 2, w, h); this.physics.add.existing(z, true); this.walls.push(z); }
  buildObject(o) {
    const ty = TYPES[o.k]; if (!ty) return;
    const { x, y } = posOf(o), rx = Math.round(x), ry = Math.round(y);
    const parts = ty.parts || [{ tex: ty.tex, frame: ty.frame, dd: 0 }];
    parts.forEach(pt => {
      const img = this.add.image(rx, ry, val(pt.tex, o) || 'misc', pt.frame != null ? val(pt.frame, o) : undefined).setOrigin(0.5, 1).setDepth(y + pt.dd);
      if (ty.sway) { img._f = 0; this.trees.push(img); }
      if (ty.frames) this.animated.push({ img, n: ty.frames, every: ty.every, phase: Math.random() * 10, f: 0 });
    });
    const coll = val(ty.coll, o);
    if (coll) (Array.isArray(coll[0]) ? coll : [coll]).forEach(([dx, dy, w, h]) => this.addWall(x + dx, y + dy, w, h));
    if (o.talk) { const t = o.talk; this.interactables.push({ name: t.name, pages: t.pages, x: tp(t.at[0]), y: tp(t.at[1]), r: t.r || 20, bx: tp(t.bubble[0]), by: tp(t.bubble[1]) }); }
  }
  // NPC: Person aus den Content-Daten; extra = zusätzliche Felder für das Interaktionsobjekt
  buildNpc(n, extra) {
    const x = tp(n.x), y = tp(n.y), cat = n.look === 'cat', key = 'chr-' + n.look;
    const s = n.noBody ? this.add.sprite(x, y, key, 0) : this.physics.add.sprite(x, y, key, 0);
    s.setOrigin(0.5, 1).setDepth(y);
    if (!n.noBody) { s.body.setSize(cat ? 10 : 12, 5, false); s.body.setOffset(cat ? 3 : 2, cat ? 9 : 19); s.body.setImmovable(true); s.body.pushable = false; this.npcBodies.push(s); }
    const shadow = n.noShadow ? null : this.add.image(x, y - 1, 'misc', 'shadow').setDepth(1);
    const npc = { def: n, sprite: s, shadow, cat, dir: n.dir || 'down', hdir: n.dir === 'right' ? 'right' : 'left', path: n.path ? n.path.map(([a, b]) => ({ x: tp(a), y: tp(b) })) : null, wp: 1, wait: 0, talking: false, look: 1500 + Math.random() * 3000 };
    this.npcs.push(npc);
    const it = Object.assign({ name: n.name, pages: n.pages, npc, r: (n.talk && n.talk.r) || 22 }, extra || {});
    if (n.talk) { it.fixedPoint = true; it.x = tp(n.talk.at[0]); it.y = tp(n.talk.at[1]); }
    this.interactables.push(it);
    this.playNpc(npc, false);
    return { npc, it };
  }

  /* ---------- Spielfigur ---------- */
  spawnPlayer(x, y, dir) {
    this.removePlayer();
    const figur = LX.State.figur; this.look = figur; this.dir = dir || 'down';
    const p = this.physics.add.sprite(x, y, 'chr-' + figur, 0).setOrigin(0.5, 1);
    p.body.setSize(10, 6, false); p.body.setOffset(3, 18); p.setCollideWorldBounds(true);
    this.colliders = [this.physics.add.collider(p, this.walls), this.physics.add.collider(p, this.npcBodies)];
    this.pshadow = this.add.image(p.x, p.y - 1, 'misc', 'shadow').setDepth(1);
    this.player = p; p.anims.play(`${figur}-idle-${this.dir}`);
    return p;
  }
  removePlayer() {
    this.colliders.forEach(c => c.destroy()); this.colliders = [];
    if (this.player) { this.player.destroy(); this.pshadow.destroy(); this.player = null; }
    this.target = null; if (this.bubble) this.bubble.setVisible(false);
  }
  stepPlayer() {
    const p = this.player, blocking = LX.UI.isBlocking() || this.transitioning;
    const v = blocking ? { x: 0, y: 0 } : LX.Input.vector(this.keys);
    let len = Math.hypot(v.x, v.y); if (len > 1) { v.x /= len; v.y /= len; len = 1; }
    const sp = C.player.speed; p.body.setVelocity(v.x * sp, v.y * sp);
    if (len > 0.12) {
      const ax = Math.abs(v.x), ay = Math.abs(v.y); let d = this.dir;
      const keeps = (d === 'left' && v.x < 0) || (d === 'right' && v.x > 0) || (d === 'up' && v.y < 0) || (d === 'down' && v.y > 0);
      if (ax > ay + 0.1) d = v.x < 0 ? 'left' : 'right'; else if (ay > ax + 0.1) d = v.y < 0 ? 'up' : 'down'; else if (!keeps) d = dirTo(v.x, v.y);
      this.dir = d; p.anims.play(`${this.look}-walk-${d}`, true); p.anims.timeScale = Math.max(0.55, len);
    } else { p.anims.play(`${this.look}-idle-${this.dir}`, true); p.anims.timeScale = 1; }
    p.setDepth(p.y); this.pshadow.setPosition(p.x, p.y - 1);
    this.updateTarget(blocking);
  }

  /* ---------- Interaktion ---------- */
  pointOf(it) { return it.npc && !it.fixedPoint ? { x: it.npc.sprite.x, y: it.npc.sprite.y } : { x: it.x, y: it.y }; }
  hintName(it) { return LX.Text.fmt(it.name); }
  updateTarget(blocking) {
    const p = this.player; let best = null, bd = 1e9;
    if (!blocking) for (const it of this.interactables) { const q = this.pointOf(it), d = Math.hypot(q.x - p.x, q.y - (p.y - 3)); if (d < it.r && d < bd) { bd = d; best = it; } }
    if (best !== this.target) { this.target = best; LX.UI.setHint(best ? this.hintName(best) : null); }
    if (best && !best.noBubble) {
      const bx = best.npc ? best.npc.sprite.x : best.bx, by = best.npc ? best.npc.sprite.y - (best.npc.cat ? 14 : 25) : best.by;
      this.bubble.setVisible(true).setPosition(Math.round(bx), Math.round(by + Math.sin(this.time.now / 180) * 1.5));
    } else this.bubble.setVisible(false);
  }
  interact() { const t = this.target; if (t && this.player && !LX.UI.isBlocking() && !this.transitioning) this.use(t); }
  use(t) {
    const p = this.player, q = this.pointOf(t);
    if (p) { this.dir = dirTo(q.x - p.x, q.y - p.y); p.anims.play(`${this.look}-idle-${this.dir}`, true); }
    const n = t.npc; if (n) { n.talking = true; if (!n.def.fixed && p) this.faceToward(n, p.x, p.y); }
    this.bubble.setVisible(false); this.target = null; LX.UI.setHint(null);
    const done = () => { if (n) n.talking = false; };
    if (t.onUse) t.onUse(t, done); else LX.UI.openDialog(t.name, t.pages, done);
  }

  /* ---------- NPCs ---------- */
  faceToward(n, x, y) { const d = dirTo(x - n.sprite.x, y - n.sprite.y); n.dir = d; if (d === 'left' || d === 'right') n.hdir = d; }
  playNpc(n, walking) {
    const k = n.def.look;
    if (n.cat) n.sprite.anims.play(`cat-${walking ? 'walk' : 'idle'}-${n.hdir}`, true);
    else n.sprite.anims.play(`${k}-${walking ? 'walk' : 'idle'}-${n.dir}`, true);
  }
  updateNpc(n, dt) {
    const s = n.sprite, p = this.player, near = p && Math.hypot(s.x - p.x, s.y - p.y) < 30;
    let walking = false, vx = 0, vy = 0;
    if (n.talking || (near && !n.def.fixed)) { if (p && !n.def.fixed) this.faceToward(n, p.x, p.y); }
    else if (n.path) {
      if (n.wait > 0) n.wait -= dt;
      else { const t = n.path[n.wp], dx = t.x - s.x, dy = t.y - s.y, dist = Math.hypot(dx, dy), sp = n.def.speed || 30;
        if (dist < 1.5) { n.wp = (n.wp + 1) % n.path.length; n.wait = n.def.pause || 0; }
        else { vx = dx / dist * sp; vy = dy / dist * sp; walking = true; n.dir = dirTo(dx, dy); if (Math.abs(dx) > 0.5) n.hdir = dx < 0 ? 'left' : 'right'; } }
    } else if (!n.def.fixed) {
      n.look -= dt; if (n.look <= 0) { n.look = 2500 + Math.random() * 4000; const opts = n.def.looks || [n.def.dir || 'down']; n.dir = opts[Math.floor(Math.random() * opts.length)]; }
    }
    if (s.body) s.body.setVelocity(vx, vy);
    this.playNpc(n, walking);
    s.setDepth(s.y); if (n.shadow) n.shadow.setPosition(s.x, s.y - 1);
  }
  animateFrames(time) { for (const a of this.animated) { const f = Math.floor(time / a.every + a.phase) % a.n; if (f !== a.f) { a.f = f; a.img.setFrame(f); } } }
  // weicher Szenenwechsel
  fadeTo(cb) {
    if (this.transitioning) return; this.transitioning = true; if (this.player) this.player.body.setVelocity(0, 0);
    LX.UI.setHint(null); const cam = this.cameras.main; cam.once('camerafadeoutcomplete', cb); cam.fadeOut(220, 20, 14, 12);
  }
}

/* ===================== Hub-Map ===================== */
class WorldScene extends MapScene {
  constructor() { super('world'); }
  create() {
    const W = C.map.w * T, H = C.map.h * T;
    this.allObjects = C.objects.concat(borderTrees());
    LX.Art.register(this, this.allObjects.map(o => ({ ...posOf(o), sw: (TYPES[o.k] || {}).sw || 0 })));
    this.initMap(W, H);
    this.add.image(0, 0, 'ground').setOrigin(0).setDepth(0);
    const pd = LX.Art.cache.pond;
    this.animated.push({ img: this.add.image(pd.x, pd.y, 'pond', 0).setOrigin(0).setDepth(0.5), n: 3, every: 300, phase: 0, f: 0 });
    this.buildBorders();
    this.allObjects.forEach(o => this.buildObject(o));
    this.portals = C.objects.filter(o => o.k === 'gate' && o.open && o.room).map(o => ({ ...posOf(o), room: o.room }));
    this.buildGarlands();
    C.npcs.forEach(n => this.buildNpc(n));
    this.buildAmbient();
    const cam = this.cameras.main; cam.setBounds(0, 0, W, H); cam.setRoundPixels(true);
    this.game.events.on('blur', () => this.input.keyboard.resetKeys());
    this.events.on('wake', (sys, data) => this.onWake(data));
    this.areaTimer = 0;
    this.startIntroPan();
    LX.Game.world = this; LX.Game.active = this; LX.UI.sceneReady();
  }
  onResize(gs) {
    const w = gs.width, h = gs.height, cam = this.cameras.main; cam.setSize(w, h);
    cam.setZoom(Math.max(this.zoomFor(w, h), Math.ceil(w / this.W), Math.ceil(h / this.H)));
  }
  buildBorders() {
    const W = this.W, H = this.H;
    // oberer Rand: Lücken in offenen Toren, damit man hineinlaufen kann
    const open = C.objects.filter(o => o.k === 'gate' && o.open).map(o => tp(o.x));
    let x0 = 0; open.sort((a, b) => a - b).forEach(gx => { this.addWall(x0, 0, gx - 16 - x0, 76); x0 = gx + 16; }); this.addWall(x0, 0, W - x0, 76);
    open.forEach(gx => this.addWall(gx - 16, 0, 32, 40));
    this.addWall(0, H - 62, W, 62); this.addWall(0, 0, 40, H); this.addWall(W - 40, 0, 40, H);
    const grid = LX.Art.buildGrid(C);
    grid.forEach((row, y) => { let s = -1; for (let x = 0; x <= row.length; x++) { const wtr = row[x] === 'water';
      if (wtr && s < 0) s = x; if (!wtr && s >= 0) { this.addWall(tp(s) + 3, tp(y) + 2, tp(x - s) - 6, T - 2); s = -1; } } });
  }
  buildGarlands() {
    (C.map.garlands || []).forEach(([x1, y1, x2], i) => {
      const ax = Math.round(tp(x1)), bx = Math.round(tp(x2)), ay = Math.round(tp(y1)) - 29, w = bx - ax, key = 'garland' + i;
      if (!this.textures.exists || !this.textures.exists(key)) { const t = this.textures.addCanvas(key, LX.Art.garland(w)); t.add(0, 0, 0, 0, w, 16); t.add(1, 0, 0, 16, w, 16); }
      this.animated.push({ img: this.add.image(ax, ay, key, 0).setOrigin(0).setDepth(8000), n: 2, every: 520, phase: i * 0.5, f: 0 });
    });
  }
  buildAmbient() {
    this.flies = [[16.5, 6.5], [20, 16], [33, 27], [12, 26.5], [44, 12]].map(([hx, hy], i) => {
      const s = this.add.sprite(tp(hx), tp(hy), 'fly', 0).setDepth(8500).play('fly'); s.setTint([0xffffff, 0xffd34d, 0xff9ec4, 0xa8d8ff, 0xffe2a8][i]);
      return { s, hx: tp(hx), hy: tp(hy), a: 0.5 + Math.random() * 0.5, b: 0.9 + Math.random() * 0.6, ph: Math.random() * 6 };
    });
    const pd = LX.Art.cache.pond;
    this.ducks = [0, 1].map(i => { const y0 = pd.y + 26 + i * 26, s = this.add.sprite(pd.x + 30 + i * 50, y0, 'duck', 0).setOrigin(0.5, 1).play('duck');
      return { s, y0, vx: i ? 7 : -6, min: pd.x + 16, max: pd.x + pd.w - 16, ph: i * 2 }; });
    this.clouds = [0, 1].map(i => ({ img: this.add.image(Math.random() * this.W, 140 + i * 280, 'cloud').setDepth(9000).setAlpha(0.07).setScale(2), v: 5 + i * 2 }));
  }
  startIntroPan() {
    const cam = this.cameras.main; cam.stopFollow(); cam.centerOn(430, 300);
    if (this.panTween) this.panTween.stop();
    const sx = cam.scrollX;
    this.panTween = this.tweens.add({ targets: cam, scrollX: { from: sx - 110, to: sx + 150 }, duration: 16000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }
  startPlaying() {
    if (this.panTween) { this.panTween.stop(); this.panTween = null; }
    const s = C.spawn; this.placePlayer(tp(s.x), tp(s.y), s.dir);
  }
  placePlayer(x, y, dir) {
    const p = this.spawnPlayer(x, y, dir), cam = this.cameras.main;
    cam.centerOn(p.x, p.y - 12); cam.startFollow(p, true, 0.14, 0.14, 0, 12);
  }
  toStart() { this.removePlayer(); this.startIntroPan(); }

  update(time, dt) {
    this.updateAmbient(time, dt);
    this.npcs.forEach(n => this.updateNpc(n, dt));
    if (!this.player) return;
    this.stepPlayer();
    // durch ein offenes Tor laufen → Lernraum
    const p = this.player;
    if (!this.transitioning) for (const g of this.portals) if (Math.abs(p.x - g.x) < 15 && p.y < g.y - 6) { this.enterRoom(g.room); break; }
    this.areaTimer -= dt; if (this.areaTimer <= 0) { this.areaTimer = 300; this.updateArea(); }
  }
  enterRoom(roomId) {
    this.fadeTo(() => { this.scene.sleep(); this.scene.run('room', { room: roomId }); });
  }
  onWake(data) {
    const r = data && C.returns[data.from];
    this.input.keyboard.resetKeys(); this.transitioning = false;
    if (r) this.placePlayer(tp(r.x), tp(r.y), r.dir);
    this.cameras.main.fadeIn(220, 20, 14, 12);
    LX.Game.active = this; this.areaTimer = 0;
  }
  updateArea() {
    const p = this.player, tx = p.x / T, ty = p.y / T;
    const a = C.areas.find(({ r: [x, y, w, h] }) => tx >= x && tx < x + w && ty >= y && ty < y + h);
    LX.UI.setLocation(a ? a.name : C.defaultArea);
  }
  updateAmbient(time, dt) {
    const sec = dt / 1000, t = time / 1000;
    this.animateFrames(time);
    this.swayTimer -= dt;
    if (this.swayTimer <= 0) { this.swayTimer = 120; for (const tr of this.trees) { const f = Math.sin(time / 700 - tr.x * 0.012 + tr.y * 0.006) > 0.55 ? 1 : 0; if (f !== tr._f) { tr._f = f; tr.setFrame(f); } } }
    for (const f of this.flies) { f.s.x = f.hx + Math.sin(t * f.a + f.ph) * 22; f.s.y = f.hy + Math.sin(t * f.b * 1.3 + f.ph) * 10 - 6; f.s.setFlipX(Math.cos(t * f.a + f.ph) < 0); }
    for (const d of this.ducks) { d.s.x += d.vx * sec; if (d.s.x < d.min || d.s.x > d.max) { d.vx *= -1; d.s.x = Math.max(d.min, Math.min(d.max, d.s.x)); } d.s.setFlipX(d.vx > 0); d.s.y = d.y0 + Math.sin(t * 0.9 + d.ph) * 3; d.s.setDepth(d.s.y); }
    for (const c of this.clouds) { c.img.x += c.v * sec; if (c.img.x > this.W + 140) c.img.x = -140; }
  }
}

/* ===================== Lernraum ===================== */
class RoomScene extends MapScene {
  constructor() { super('room'); }
  create(data) {
    const id = (data && data.room) || 'raum_b1_u1_acercate', R = this.R = C.rooms[id], LS = LX.Lernstoff;
    this.roomId = id; this.abschnitt = LS.abschnitt(R.abschnitt);
    const W = R.w * T, H = R.h * T, WALL = R.wall * T;
    this.initMap(W, H);
    this.cameras.main.setBackgroundColor('#241a17');
    const key = 'room-' + id;
    if (!this.textures.exists || !this.textures.exists(key)) this.textures.addCanvas(key, LX.Art.roomGround(R, LS));
    this.add.image(0, 0, key).setOrigin(0).setDepth(0);
    // Wände
    const ex = tp(R.exit.x);
    this.addWall(0, 0, W, WALL + 2); this.addWall(0, 0, 10, H); this.addWall(W - 10, 0, 10, H);
    this.addWall(0, H - 10, ex - 18, 10); this.addWall(ex + 18, H - 10, W - ex - 18, 10); this.addWall(ex - 18, H + 6, 36, 10);
    (R.objects || []).forEach(o => this.buildObject(o));
    // verschlossene Türen zu A und B
    (R.doors || []).forEach(d => { const ab = LS.abschnitt(d.abschnitt); if (!ab) return;
      this.interactables.push({ name: LS.label(ab.id), x: tp(d.x), y: WALL + 6, r: 20, bx: tp(d.x), by: 14,
        pages: [ab.spielbar ? 'Hier geht es weiter.' : 'Dieser Abschnitt wird bald freigeschaltet.'] }); });
    // Ausgang
    this.interactables.push({ name: R.exit.name, x: ex, y: H - 8, r: 18, noBubble: true, onUse: () => this.exitRoom() });
    // Personen mit Wörtern
    this.vocab = [];
    (R.vocab || []).forEach(v => {
      if (!LS.wort(v.word)) { console.warn('Unbekanntes Wort im Raum:', v.word); return; }
      const { npc, it } = this.buildNpc({ name: 'Wort entdecken', look: v.look, x: v.x, y: v.y, dir: v.dir, looks: [v.dir] }, { word: v.word, r: 24, noBubble: true, onUse: (t, done) => this.useWord(t, done) });
      const mark = this.add.image(npc.sprite.x, npc.sprite.y - 25, 'bub', v.icon + '_' + (LX.Sammlung.has(v.word) ? 1 : 0)).setOrigin(0.5, 1).setDepth(9000);
      const entry = { v, npc, it, mark, base: npc.sprite.y - 25, ph: Math.random() * 6 };
      it.entry = entry; this.vocab.push(entry);
      // antippen / anklicken
      [npc.sprite, mark].forEach(go => { go.setInteractive({ useHandCursor: true }); go.on('pointerdown', () => this.tap(it)); });
    });
    this.monsterObjs = []; (R.monsters || []).forEach(m => this.buildMonster(m));
    if (this._wakeH) this.events.off('wake', this._wakeH); this._wakeH = () => this.onWake(); this.events.on('wake', this._wakeH);
    this.events.on('shutdown', () => { this.vocab = []; });
    // Spielfigur und Kamera
    const s = R.spawn; this.spawnPlayer(tp(s.x), tp(s.y), s.dir);
    this.cameras.main.setZoom(this.zoomFor(this.scale.width, this.scale.height)); this.followCam(true);
    this.cameras.main.fadeIn(220, 20, 14, 12);
    this.input.keyboard.resetKeys();
    LX.UI.setLocation(LS.label(R.abschnitt), true);
    LX.Game.active = this;
  }
  // Kamera folgt; ist der Raum kleiner als der Bildschirm, bleibt er mittig
  followCam(snap) {
    const cam = this.cameras.main, z = cam.zoom, vw = cam.width / z, vh = cam.height / z, p = this.player;
    const mx = vw >= this.W ? this.W / 2 : Math.max(vw / 2, Math.min(this.W - vw / 2, p.x));
    const my = vh >= this.H ? this.H / 2 : Math.max(vh / 2, Math.min(this.H - vh / 2, p.y - 12));
    const tx = mx - cam.width / 2, ty = my - cam.height / 2, k = snap ? 1 : 0.14;
    cam.scrollX += (tx - cam.scrollX) * k; cam.scrollY += (ty - cam.scrollY) * k;
  }
  hintName(it) { return it.word ? (LX.Sammlung.has(it.word) ? LX.Lernstoff.wort(it.word).es : 'Wort entdecken') : LX.Text.fmt(it.name); }
  tap(it) { if (LX.UI.isBlocking() || this.transitioning || !this.player) return; this.use(it); }
  useWord(it, done) {
    const e = it.entry, s = e.npc.sprite;
    // sichtbare Reaktion: kleiner Hüpfer der Person und der Sprechblase
    this.tweens.add({ targets: s, y: s.y - 4, duration: 110, yoyo: true, ease: 'Quad.easeOut' });
    this.tweens.add({ targets: e.mark, scale: 1.25, duration: 140, yoyo: true });
    LX.UI.showWord(it.word, () => { e.mark.setFrame(e.v.icon + '_1'); done(); });
    e.mark.setFrame(e.v.icon + '_1');
  }
  // Verzaubertes Monster: Daten aus dem Raum (Position, Texte) und dem Lernstoff (implementiert?)
  buildMonster(m) {
    const mon = LX.Lernstoff.monster(m.id); if (!mon || !mon.implementiert || LX.Monster.has(m.id)) return;
    const x = tp(m.x), y = tp(m.y), key = 'holamander-' + m.stufe + '-gebannt';
    const shadow = this.add.image(x, y - 1, 'misc', 'shadow').setDepth(1).setScale(2.4, 1.5);
    const s = this.add.sprite(x, y, key, 0).setOrigin(0.5, 0.83).setScale(m.scale || 1).setDepth(y);
    s.anims.play(key + '-idle');
    this.addWall(x - 11, y - 6, 22, 7); const wall = this.walls[this.walls.length - 1];
    const it = { name: mon.name, x, y, r: 30, bx: x, by: y - 34, monster: m, onUse: (t, done) => this.useMonster(t, done) };
    this.interactables.push(it);
    s.setInteractive({ useHandCursor: true }); s.on('pointerdown', () => this.tap(it));
    this.monsterObjs.push({ id: m.id, parts: [shadow, s], wall, it });
  }
  useMonster(it, done) {
    const m = it.monster, K = LX.Lernstoff.raw.kampf, n = LX.Sammlung.count();
    if (n >= K.minWoerter) { done(); this.fadeTo(() => { this.scene.sleep(); this.scene.run('battle', { room: this.roomId, monster: m }); }); return; }
    LX.UI.openDialog(it.name, m.texte.gesperrt.map(t => t.replace('{count}', n).replace('{min}', K.minWoerter).replace('{fehlt}', K.minWoerter - n)), done);
  }
  // zurück aus dem Kampf
  onWake() {
    this.input.keyboard.resetKeys(); this.transitioning = false; this.cameras.main.fadeIn(220, 20, 14, 12);
    // gefangene Monster sind weg: Grafik, Kollision und Interaktion entfernen
    this.monsterObjs.filter(o => LX.Monster.has(o.id)).forEach(o => { o.parts.forEach(p => p.destroy()); o.wall.body.enable = false; this.interactables = this.interactables.filter(i => i !== o.it); if (this.target === o.it) this.target = null; });
    this.monsterObjs = this.monsterObjs.filter(o => !LX.Monster.has(o.id));
    LX.Game.active = this; LX.UI.setLocation(LX.Lernstoff.label(this.R.abschnitt), true);
  }
  exitRoom() { this.fadeTo(() => { const id = this.roomId; this.removePlayer(); this.scene.stop(); this.scene.wake('world', { from: id }); }); }
  update(time, dt) {
    this.animateFrames(time);
    this.npcs.forEach(n => this.updateNpc(n, dt));
    for (const e of this.vocab) { e.mark.x = e.npc.sprite.x; e.mark.y = Math.round(e.npc.sprite.y - 25 + Math.sin(time / 400 + e.ph) * 1.2); if (!e.it.npc.talking) e.mark.setScale(this.target === e.it ? 1.2 : 1); }
    if (!this.player) return;
    this.stepPlayer();
    this.followCam(false);
    const p = this.player;
    if (!this.transitioning && p.y > this.H - 12 && Math.abs(p.x - tp(this.R.exit.x)) < 18) this.exitRoom();
  }
}

/* ---------- Start ---------- */
LX.Game = {
  world: null, active: null,
  get scene() { return this.world; },
  boot() {
    this.game = new Phaser.Game({
      type: Phaser.AUTO, parent: 'game', backgroundColor: '#3d7340', pixelArt: true, roundPixels: true,
      scale: { mode: Phaser.Scale.RESIZE, width: window.innerWidth, height: window.innerHeight },
      physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 }, debug: false } },
      scene: [WorldScene, RoomScene, LX.BattleScene]
    });
  },
  start() { if (this.world) this.world.startPlaying(); },
  toStart() {
    const w = this.world; if (!w) return;
    if (this.active && this.active !== w) { const r = this.active; r.removePlayer(); r.scene.stop(); w.scene.wake(); w.transitioning = false; w.cameras.main.fadeIn(1); this.active = w; }
    w.toStart();
  },
  interact() { if (this.active) this.active.interact(); }
};
})();
