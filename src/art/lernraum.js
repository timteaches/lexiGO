/* =====================================================================
   LX.Art (Teil 4) – Lernraum: Boden, Wände, Fenster, Türen, Möbel,
   Sprechblasen mit Bild-Hinweisen für die Wörter (Platzhalter-Stil, Phase 3b ersetzt)
   ===================================================================== */
(function () {
const A = LX.Art, { cv, hash, rng, pen, outline, ell } = A;
const T = 16;

/* ---------- Raum-Hintergrund aus den Raumdaten ---------- */
A.roomGround = function (R, LS) {
  const W = R.w * T, H = R.h * T, WALL = R.wall * T, { c, g } = cv(W, H), { r, p } = pen(g);
  // Holzdielen
  for (let y = WALL; y < H; y += 8) {
    const row = (y - WALL) >> 3, off = (row % 4) * 9;
    r(0, y, W, 8, row % 2 ? '#c98f55' : '#c38a50'); r(0, y, W, 1, '#d9a56c'); r(0, y + 7, W, 1, '#9a6438');
    for (let x = -off; x < W; x += 36) r(x, y, 1, 8, '#9a6438');
    for (let k = 0; k < 6; k++) { const x = Math.floor(hash(k, row, 51) * W); p(x, y + 3, '#a8703f'); p(x + 1, y + 3, '#a8703f'); }
  }
  // Teppich unter der ¿Qué tal?-Runde
  if (R.rug) { const [rx, ry, rw, rh] = R.rug.map(v => v * T);
    r(rx, ry, rw, rh, '#b8402e'); r(rx + 4, ry + 4, rw - 8, rh - 8, '#e9c46a'); r(rx + 8, ry + 8, rw - 16, rh - 16, '#2a7f7a');
    for (let x = rx + 10; x < rx + rw - 10; x += 8) for (let y = ry + 10; y < ry + rh - 10; y += 8) if (((x + y) >> 3) % 2) r(x, y, 3, 3, '#3a9b95');
    for (let x = rx + 2; x < rx + rw - 2; x += 4) { p(x, ry - 1, '#e9c46a'); p(x, ry + rh, '#e9c46a'); } }
  // Wand mit Putz, Balken und Holzverkleidung
  r(0, 0, W, WALL, '#f1e3c6'); for (let k = 0; k < 160; k++) p(Math.floor(hash(k, 1, 52) * W), 6 + Math.floor(hash(k, 2, 52) * 38), '#e3d1ae');
  r(0, 0, W, 6, '#7a4b2a'); r(0, 5, W, 1, '#5e3a20'); r(0, WALL - 20, W, 20, '#a8693a'); r(0, WALL - 20, W, 2, '#c4834f');
  for (let x = 8; x < W; x += 24) { r(x, WALL - 16, 18, 10, '#9a5e31'); r(x, WALL - 16, 18, 1, '#b57444'); }
  r(0, WALL - 4, W, 4, '#6e4425');
  g.fillStyle = 'rgba(60,30,10,0.22)'; g.fillRect(0, WALL, W, 4);
  // Fenster: Morgen, Nachmittag, Nacht
  (R.windows || []).forEach(({ x, v }) => {
    const wx = Math.round(x * T) - 15, wy = 10, P = pen(g, wx, wy);
    P.r(-2, -2, 34, 30, '#6e4425'); P.r(0, 0, 30, 26, ['#ffd9b0', '#7fc7f0', '#1d2b55'][v]);
    if (v === 0) { P.r(0, 0, 30, 9, '#bfe3f5'); P.r(0, 9, 30, 6, '#ffe7c2'); ell(g, 15, 21, 6, 6, '#ffc93c', wx, wy); P.r(0, 20, 30, 6, '#62c370'); P.r(0, 20, 30, 1, '#8ed97e'); }
    if (v === 1) { ell(g, 21, 8, 5, 5, '#fff3b0', wx, wy); ell(g, 21, 8, 3.5, 3.5, '#ffe066', wx, wy); P.r(0, 21, 30, 5, '#62c370'); P.r(3, 6, 8, 2, '#ffffff'); P.r(5, 5, 4, 1, '#ffffff'); }
    if (v === 2) { ell(g, 19, 9, 5, 5, '#fff1b8', wx, wy); ell(g, 21, 7.5, 4.5, 4.5, '#1d2b55', wx, wy); [[5, 5], [10, 15], [25, 18], [6, 19], [26, 4]].forEach(([a, b]) => P.p(a, b, '#ffffff')); P.r(0, 22, 30, 4, '#2c3e6b'); }
    P.r(14, 0, 2, 26, '#8a5a34'); P.r(0, 12, 30, 2, '#8a5a34');
    P.r(-4, -3, 6, 32, '#d9603b'); P.r(28, -3, 6, 32, '#d9603b'); P.r(-4, -3, 2, 32, '#b04b2f'); P.r(32, -3, 2, 32, '#b04b2f');
    P.r(-3, 28, 36, 3, '#c4a777');
  });
  // Türen zu den Abschnitten A und B (noch verschlossen)
  (R.doors || []).forEach(d => {
    const ab = LS.abschnitt(d.abschnitt), dx = Math.round(d.x * T) - 14, P = pen(g, dx, 0);
    P.r(-2, 14, 32, WALL - 14, '#6e4425'); P.r(0, 16, 28, WALL - 16, '#8a4a2a'); P.r(13, 16, 2, WALL - 16, '#6e3a20');
    for (let y = 22; y < WALL - 4; y += 10) { P.r(3, y, 8, 6, '#9c5a36'); P.r(17, y, 8, 6, '#9c5a36'); }
    P.r(6, 19, 16, 13, '#fff1cf'); P.r(6, 19, 16, 1, '#e3d3b0'); A.drawText(g, ab ? ab.typ : '?', dx + 14 - Math.floor(A.textWidth(ab ? ab.typ : '?', 2) / 2), 21, '#b8402e', 2);
    P.r(11, 40, 6, 5, '#b7b7c2'); P.r(12, 37, 4, 1, '#8a8a96'); P.r(11, 38, 1, 2, '#8a8a96'); P.r(16, 38, 1, 2, '#8a8a96'); P.p(14, 42, '#3a3a44');
  });
  // Schild mit dem Namen des Abschnitts
  if (R.sign) { const tw = A.textWidth(R.sign.text), bw = tw + 12, sx = Math.round(R.sign.x * T) - (bw >> 1);
    r(sx, 12, bw, 15, '#5a2a1e'); r(sx, 12, bw, 1, '#e9b941'); r(sx, 26, bw, 1, '#e9b941'); r(sx + 6, 18, tw, 5, '#5a2a1e'); A.drawText(g, R.sign.text, sx + 6, 18, '#f4cc57'); }
  // Seitenwände und untere Wand mit Ausgang
  r(0, 0, 6, H, '#4a2e22'); r(6, WALL, 2, H - WALL, '#6e4425'); r(W - 6, 0, 6, H, '#4a2e22'); r(W - 8, WALL, 2, H - WALL, '#6e4425');
  const ex = Math.round(R.exit.x * T), gap = 18;
  r(0, H - 10, ex - gap, 10, '#4a2e22'); r(ex + gap, H - 10, W - ex - gap, 10, '#4a2e22'); r(0, H - 12, ex - gap, 2, '#6e4425'); r(ex + gap, H - 12, W - ex - gap, 2, '#6e4425');
  r(ex - gap, H - 6, gap * 2, 6, '#bfe6a0'); r(ex - gap, H - 8, gap * 2, 2, '#d9cdb2');
  for (let k = 0; k < 2; k++) { const y = H - 30 + k * 7; for (let i = 0; i < 6; i++) { p(ex - 6 + i, y + i, '#fff1cf'); p(ex + 5 - i, y + i, '#fff1cf'); p(ex - 6 + i, y + i + 1, '#e3c79a'); p(ex + 5 - i, y + i + 1, '#e3c79a'); } }
  return c;
};

/* ---------- Möbel und Pflanzen ---------- */
A.roomObjects = function () {
  const { c, g } = cv(96, 32), frames = [];
  const F = (n, x, y, w, h, fn) => { const P = pen(g, x, y); fn(P.r, P.p, x, y); outline(g, x, y, w, h, '#3a2620'); frames.push([n, x, y, w, h]); };
  F('plant', 0, 0, 16, 28, (r, p, x, y) => { r(4, 19, 8, 7, '#c4603a'); r(3, 18, 10, 2, '#d9774e'); r(10, 20, 2, 6, '#a8452a');
    ell(g, 8, 12, 6, 7, '#4f9a3c', x, y); ell(g, 6, 9, 3.5, 4, '#6fbf55', x, y); ell(g, 11, 13, 2.5, 3, '#3f8333', x, y); p(8, 3, '#6fbf55'); p(7, 2, '#4f9a3c'); });
  F('table', 16, 0, 26, 20, (r, p) => { r(1, 5, 24, 5, '#b8783f'); r(1, 5, 24, 1, '#d29a5f'); r(3, 10, 2, 9, '#7a4b29'); r(21, 10, 2, 9, '#7a4b29');
    r(5, 1, 4, 4, '#ffffff'); r(9, 2, 1, 2, '#ffffff'); r(6, 2, 2, 1, '#6e4425'); ell(g, 18.5, 3.5, 4, 1.8, '#e0a85f', 16, 0); p(17, 3, '#a86a32'); });
  F('bed', 42, 0, 34, 28, (r, p) => { r(1, 2, 32, 6, '#8a5a34'); r(1, 2, 32, 1, '#a8744a'); r(2, 8, 30, 16, '#f6f1e6'); r(3, 9, 12, 6, '#ffffff'); r(3, 14, 12, 1, '#d8cebb');
    r(2, 13, 30, 11, '#5f86c8'); r(2, 13, 30, 1, '#86a8e0'); for (let x = 4; x < 32; x += 6) r(x, 16, 3, 3, '#86a8e0'); r(1, 24, 32, 2, '#6e4425'); r(1, 26, 2, 2, '#6e4425'); r(31, 26, 2, 2, '#6e4425'); });
  F('coatrack', 76, 0, 14, 32, (r, p) => { r(6, 4, 2, 26, '#7a4b29'); r(3, 29, 8, 2, '#7a4b29'); p(4, 4, '#7a4b29'); p(9, 4, '#7a4b29'); p(5, 3, '#7a4b29'); p(8, 3, '#7a4b29');
    r(2, 6, 6, 10, '#d4603a'); r(2, 6, 6, 1, '#e98456'); r(7, 7, 4, 4, '#ffd23f'); r(8, 11, 2, 2, '#ffd23f'); });
  return { canvas: c, frames };
};

/* ---------- Sprechblasen mit Bild-Hinweis (Zeile 0: unentdeckt, Zeile 1: entdeckt) ---------- */
const ICONS = ['sun', 'sunset', 'moon', 'wave', 'bye', 'later', 'q', 'great', 'good', 'meh', 'bad'];
A.ICONS = ICONS;
function drawIcon(g, x, y, k) {
  const { r, p } = pen(g, x, y), D = '#2b1d1f', SK = '#eab78f';
  const face = (col) => { ell(g, 5, 5, 4.5, 4.5, col, x, y); p(3, 4, D); p(7, 4, D); };
  if (k === 'sun') { r(0, 8, 10, 2, '#62c370'); ell(g, 5, 8, 3.5, 3.5, '#ffc93c', x, y); r(0, 8, 10, 2, '#62c370'); p(5, 2, '#ffb000'); p(1, 4, '#ffb000'); p(9, 4, '#ffb000'); }
  if (k === 'sunset') { ell(g, 5, 5, 3, 3, '#ff8c42', x, y); [[5, 0], [5, 9], [0, 5], [9, 5], [1, 1], [8, 1], [1, 8], [8, 8]].forEach(([a, b]) => p(a, b, '#ffb000')); }
  if (k === 'moon') { for (let yy = 0; yy < 10; yy++) for (let xx = 0; xx < 10; xx++) { const a = Math.hypot(xx + 0.5 - 5, yy + 0.5 - 5) <= 4.2, b = Math.hypot(xx + 0.5 - 7, yy + 0.5 - 3.6) <= 3.4; if (a && !b) p(xx, yy, '#f4cc57'); } p(1, 1, '#f4cc57'); p(9, 8, '#f4cc57'); }
  if (k === 'wave') { r(3, 4, 4, 5, SK); [3, 4, 5, 6].forEach((a, i) => r(a, 1 + (i % 2), 1, 3, SK)); r(7, 5, 1, 2, SK); p(0, 3, '#1f8a86'); p(0, 6, '#1f8a86'); p(9, 2, '#1f8a86'); p(9, 5, '#1f8a86'); }
  if (k === 'bye') { r(1, 4, 3, 4, SK); [1, 2, 3].forEach((a, i) => r(a, 2 + (i % 2), 1, 2, SK)); r(5, 5, 4, 1, '#d4603a'); p(7, 4, '#d4603a'); p(7, 6, '#d4603a'); p(8, 5, '#d4603a'); p(9, 5, '#d4603a'); }
  if (k === 'later') { ell(g, 5, 5, 4.5, 4.5, D, x, y); ell(g, 5, 5, 3.5, 3.5, '#ffffff', x, y); r(5, 2, 1, 3, D); r(5, 5, 2, 1, D); }
  if (k === 'q') { const Q = '#1f8a86'; r(3, 0, 4, 2, Q); r(2, 1, 2, 2, Q); r(6, 1, 2, 3, Q); r(5, 3, 2, 2, Q); r(4, 5, 2, 2, Q); r(4, 8, 2, 2, Q); }
  if (k === 'great') { face('#ffd23f'); r(3, 6, 5, 1, D); r(4, 7, 3, 1, '#e8424a'); p(0, 0, '#ffb000'); p(9, 1, '#ffb000'); }
  if (k === 'good') { face('#ffd23f'); p(3, 6, D); r(4, 7, 3, 1, D); p(7, 6, D); }
  if (k === 'meh') { face('#f2e29a'); p(3, 7, D); p(4, 6, D); p(5, 7, D); p(6, 6, D); p(7, 7, D); }
  if (k === 'bad') { face('#9cc3ea'); r(4, 6, 3, 1, D); p(3, 7, D); p(7, 7, D); p(8, 2, '#5f86c8'); }
}
A.bubbles = function () {
  const CW = 18, CH = 17, { c, g } = cv(CW * ICONS.length, CH * 2), frames = [];
  ICONS.forEach((k, i) => [0, 1].forEach(st => {
    const x = i * CW, y = st * CH, { r, p } = pen(g, x, y), fill = st ? '#ffffff' : '#ffe08a';
    r(2, 1, 14, 1, fill); r(1, 2, 16, 10, fill); r(2, 12, 14, 1, fill); r(7, 13, 4, 1, fill); r(8, 14, 2, 1, fill);
    drawIcon(g, x + 4, y + 2, k); outline(g, x, y, CW, CH, st ? '#2b1d1f' : '#d4603a');
    frames.push([k + '_' + st, x, y, CW, CH]);
  }));
  return { canvas: c, frames };
};

/* ---------- Offenes Tor (Licht statt Buchstaben-Schleier) ---------- */
A.gateOpen = function (label) {
  const { c, g } = cv(256, 64), base = A.gate(label);
  for (let f = 0; f < 4; f++) {
    const o = f * 64; g.drawImage(base, o, 0, 64, 64, o, 0, 64, 64);
    const { r, p } = pen(g, o, 0);
    for (let y = 20; y < 60; y++) { const t = (y - 20) / 40; r(15, y, 34, 1, t < 0.35 ? '#fff4c9' : t < 0.7 ? '#ffe7a0' : '#e9cf8e'); }
    r(23, 20, 18, 40, '#e7cd93'); r(23, 20, 1, 40, '#d5b77b'); r(40, 20, 1, 40, '#d5b77b');
    const R = rng(8); for (let k = 0; k < 7; k++) { const sx = 16 + Math.floor(R() * 31), sy = 22 + ((Math.floor(R() * 36) - f * 4 + 72) % 36); p(sx, sy, '#ffffff'); if (k % 2) p(sx + 1, sy, '#fff1b8'); }
    r(15, 60, 34, 2, '#d4b479');
    outline(g, o, 0, 64, 64, '#4a3a2c');
  }
  return c;
};

/* ---------- Registrierung der Raumgrafiken ---------- */
A.registerRoomArt = function (scene) {
  const add = (key, canvas, frames) => { const t = scene.textures.addCanvas(key, canvas); if (frames) frames.forEach(([n, x, y, w, h]) => t.add(n, 0, x, y, w, h)); };
  const ro = A.roomObjects(); add('roomobj', ro.canvas, ro.frames);
  const bb = A.bubbles(); add('bub', bb.canvas, bb.frames);
};
})();
