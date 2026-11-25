/* =====================================================================
   LX.Art (Teil 3) – Gebäude, Marktstände, Brunnen, Tore, Kleinkram
   und Übergabe aller Grafiken an Phaser (register).
   ===================================================================== */
(function () {
const A = LX.Art, { cv, hash, rng, pen, outline, ell } = A;

/* ---------- Häuser: weiße Wände, Terrakotta-Dach, blaue Akzente ---------- */
const HV = [
  { wall: '#f8f2e4', wallS: '#e1d4b8', base: '#3f7fc4', baseS: '#2f62a0', baseL: '#6aa0dc', door: '#2f6fb3', doorS: '#22548c', doorL: '#4f8ed0', shut: '#3b82c4', shutS: '#2b65a0' },
  { wall: '#f4da92', wallS: '#d8bb6c', base: '#b9663f', baseS: '#944c2c', baseL: '#d4875e', door: '#3f8a5a', doorS: '#2c6842', doorL: '#5aab74', shut: '#4b9a66', shutS: '#367a4e' },
  { wall: '#f6efe2', wallS: '#dccfb3', base: '#c06a3e', baseS: '#9a4f2c', baseL: '#d88a60', door: '#a5452f', doorS: '#7f3221', doorL: '#c4644a', shut: '#2f7fa6', shutS: '#226287' },
  { wall: '#f6d8ca', wallS: '#dcb8a6', base: '#5a7fb0', baseS: '#42628e', baseL: '#7c9ecc', door: '#2f6fb3', doorS: '#22548c', doorL: '#4f8ed0', shut: '#6a93c9', shutS: '#4f77aa' }];
A.houses = function () {
  const { c, g } = cv(384, 96);
  HV.forEach((v, i) => {
    const o = i * 96, { r, p } = pen(g, o, 0);
    for (let row = 0, y = 6; y < 42; y += 6, row++) { r(1, y, 94, 6, '#d4613b'); r(1, y + 4, 94, 2, '#b04b2f');
      for (let x = 1 + (row & 1) * 4; x < 95; x += 8) { r(x, y, 1, 5, '#9e412a'); r(x + 1, y, 2, 1, '#ea8a5f'); } }
    r(3, 2, 90, 4, '#e98456'); r(3, 2, 90, 1, '#f4a57c'); r(1, 41, 94, 3, '#963c27');
    r(70, 1, 10, 10, v.wall); r(77, 1, 3, 10, v.wallS); r(69, 1, 12, 2, '#a8432a');
    r(4, 44, 88, 50, v.wall); r(4, 44, 88, 4, v.wallS); r(89, 44, 3, 50, v.wallS);
    for (let k = 0; k < 70; k++) p(4 + Math.floor(hash(k, i, 4) * 86), 49 + Math.floor(hash(k, i, 5) * 35), v.wallS);
    for (let x = 1; x < 95; x += 8) { r(x + 1, 44, 6, 1, '#963c27'); r(x + 2, 45, 4, 1, '#963c27'); }
    r(4, 86, 88, 8, v.base); r(4, 86, 88, 1, v.baseL); for (let x = 4; x < 92; x += 8) r(x, 87, 1, 7, v.baseS);
    // Tür mit Rundbogen
    r(42, 61, 12, 1, v.door); r(41, 62, 14, 1, v.door); r(40, 63, 16, 31, v.door);
    [44, 48, 52].forEach(x => r(x, 64, 1, 30, v.doorS)); r(41, 63, 1, 30, v.doorL); p(52, 78, '#f2c14e'); p(52, 79, '#c99a2e');
    r(39, 62, 1, 32, v.wallS); r(56, 62, 1, 32, v.wallS); r(36, 94, 24, 2, '#d9cdb2');
    // Fenster mit Läden und Blumenkasten
    [14, 66].forEach(wx => {
      r(wx + 3, 55, 10, 14, '#a9d8ec'); r(wx + 3, 55, 10, 3, '#7fbfdc'); r(wx + 7, 55, 2, 14, v.wall); r(wx + 3, 61, 10, 1, v.wall);
      p(wx + 4, 58, '#e8f7fd'); p(wx + 5, 59, '#e8f7fd'); p(wx + 10, 63, '#e8f7fd');
      r(wx, 54, 3, 16, v.shut); r(wx + 13, 54, 3, 16, v.shut); for (let y = 56; y < 70; y += 2) { r(wx, y, 3, 1, v.shutS); r(wx + 13, y, 3, 1, v.shutS); }
      r(wx - 1, 69, 18, 2, '#dccfb4'); r(wx, 71, 16, 4, '#b5552f'); r(wx, 71, 16, 1, '#d0734a');
      for (let k = 0; k < 16; k++) { const col = k % 3 === 0 ? '#e8424a' : k % 3 === 1 ? '#4f9a3c' : '#ff7aa2'; p(wx + k, 68 + (k % 2), col); p(wx + k, 70, k % 2 ? '#4f9a3c' : col); }
    });
    // blaue Wandtöpfe wie in andalusischen Innenhöfen
    [33, 59].forEach(x => { r(x, 52, 5, 4, '#2f6fb3'); r(x, 52, 5, 1, '#5b93d1'); r(x, 51, 5, 1, '#4f9a3c'); p(x + 1, 50, '#e8424a'); p(x + 3, 50, '#ff7aa2'); p(x + 2, 49, '#e8424a'); p(x, 56, '#4f9a3c'); p(x + 4, 57, '#4f9a3c'); });
    outline(g, o, 0, 96, 96, '#5b3a2c');
  });
  return c;
};

/* ---------- Dojo ---------- */
A.dojo = function () {
  const { c, g } = cv(160, 112), { r, p } = pen(g);
  const SL = '#4a7480', SD = '#335660', SLL = '#6f9ea6', GOLD = '#e9b941', RED = '#b8402e', WOOD = '#8a3b2a', WOODL = '#a8513b', PL = '#f3e6cc';
  const roof = (x, y, w, h) => { r(x, y, w, h, SL); for (let yy = y + 4; yy < y + h; yy += 5) r(x, yy, w, 1, SD); for (let xx = x + 2; xx < x + w; xx += 6) { r(xx, y, 1, h, SLL); r(xx + 1, y, 1, h, SD); } };
  roof(2, 34, 156, 23); r(2, 31, 3, 3, SL); p(2, 30, GOLD); r(155, 31, 3, 3, SL); p(157, 30, GOLD); r(2, 56, 156, 3, RED);
  roof(22, 8, 116, 25); r(20, 32, 120, 2, RED); r(18, 5, 124, 4, SD); r(18, 5, 124, 1, SLL);
  r(14, 3, 6, 4, GOLD); r(140, 3, 6, 4, GOLD); p(13, 2, GOLD); p(146, 2, GOLD);
  r(6, 59, 148, 45, PL); r(6, 59, 148, 5, WOOD);
  [6, 42, 110, 146].forEach(x => { r(x, 59, 8, 45, WOOD); r(x, 59, 2, 45, WOODL); });
  [[16, 70], [120, 70]].forEach(([x, y]) => { r(x, y, 24, 22, '#e9d7b0'); for (let k = 0; k <= 24; k += 6) r(x + k, y, 1, 22, '#9a6a45'); for (let k = 0; k <= 21; k += 5) r(x, y + k, 24, 1, '#9a6a45'); });
  r(58, 66, 44, 38, WOOD); r(61, 69, 38, 35, '#f0e2c4');
  for (let k = 61; k < 99; k += 6) r(k, 69, 1, 35, '#a0603c'); for (let k = 69; k < 104; k += 7) r(61, k, 38, 1, '#a0603c');
  r(76, 70, 8, 34, '#3d2620'); r(79, 69, 2, 35, WOOD);
  // Schild mit „DOJO“ und Ñ-Emblemen
  r(50, 37, 60, 19, '#5a2a1e'); r(50, 37, 60, 1, GOLD); r(50, 55, 60, 1, GOLD); r(50, 37, 1, 19, GOLD); r(109, 37, 1, 19, GOLD);
  A.drawText(g, 'DOJO', 50 + Math.floor((60 - A.textWidth('DOJO', 2)) / 2), 41, '#f4cc57', 2);
  [32, 128].forEach(cx => { ell(g, cx, 46, 7, 7, GOLD); ell(g, cx, 46, 5.5, 5.5, '#f4d57a'); A.drawText(g, 'Ñ', cx - 2, 44, '#5a2a1e'); });
  [26, 134].forEach(x => { p(x, 59, '#2b1d1f'); r(x - 2, 60, 5, 1, GOLD); ell(g, x + 0.5, 66, 3.5, 5, '#e0483a'); r(x - 1, 63, 3, 1, '#f37a6a'); r(x - 2, 71, 5, 1, GOLD); p(x, 72, GOLD); });
  r(56, 104, 48, 4, '#cfc6b4'); r(56, 104, 48, 1, '#e6dfd0'); r(52, 108, 56, 3, '#b8ae9b');
  outline(g, 0, 0, 160, 112, '#3a2620');
  return c;
};

/* ---------- Marktstände: Zeile 0 Rückteil, Zeile 1 Theke (Verkäuferin steht dazwischen) ---------- */
A.stalls = function () {
  const { c, g } = cv(192, 112), AW = [['#e0483a', '#fff4e6'], ['#f6c23e', '#ef8a2f'], ['#3f86d8', '#fff4e6']];
  for (let v = 0; v < 3; v++) {
    const o = v * 64, B = pen(g, o, 0), F = pen(g, o, 56), [a1, a2] = AW[v];
    B.r(7, 13, 50, 25, '#c9a77b'); for (let y = 17; y < 38; y += 4) B.r(7, y, 50, 1, '#b08d62'); B.r(7, 14, 50, 2, '#a9865c');
    B.r(4, 11, 3, 33, '#9a6438'); B.r(57, 11, 3, 33, '#9a6438'); B.r(4, 11, 1, 33, '#bb8150'); B.r(57, 11, 1, 33, '#bb8150');
    for (let k = 0; k < 6; k++) { const x = 2 + k * 10, col = k % 2 ? a2 : a1; B.r(x, 1, 10, 10, col); B.r(x, 1, 10, 2, k % 2 ? '#ffffff' : '#ff7a62'); B.r(x + 1, 11, 8, 1, col); B.r(x + 2, 12, 6, 1, col); B.r(x + 3, 13, 4, 1, col); }
    if (v === 0) {
      [[6, '#f6a23a', '#ffd27a'], [24, '#e5433a', '#ff8a7a'], [42, '#4fa63c', '#8fd46d']].forEach(([x, cA, cL], k) => {
        F.r(x, 30, 16, 6, '#b88450'); F.r(x, 33, 16, 1, '#94683c');
        for (let i = 0; i < 5; i++) { F.r(x + 1 + i * 3, 28 + (i % 2), 2, 2, k === 2 && i % 2 ? '#f2c23a' : cA); F.p(x + 1 + i * 3, 28 + (i % 2), cL); } });
    } else if (v === 1) {
      [[8, '#e8424a'], [27, '#ffd23f'], [46, '#ff8fb8']].forEach(([x, col]) => {
        F.r(x, 30, 10, 6, '#8b98a5'); F.r(x, 30, 10, 1, '#b4bfca');
        for (let i = 0; i < 4; i++) { F.r(x + 1 + i * 2, 26, 1, 4, '#4f9a3c'); F.r(x + i * 2 + (i % 2), 23 + (i % 2), 2, 2, col); if (col === '#ffd23f') F.p(x + i * 2 + (i % 2), 23 + (i % 2), '#7a4b2a'); } });
    } else {
      [[10, 31], [22, 30], [46, 31]].forEach(([x, y]) => { ell(g, x + 4, y + 2.5, 5, 2.8, '#d99a52', o, 56); ell(g, x + 3, y + 1.5, 3, 1.2, '#f0c27e', o, 56); F.p(x + 2, y + 2, '#a86a32'); F.p(x + 5, y + 2, '#a86a32'); });
      for (let i = 0; i < 9; i++) { F.r(32 + i, 33 - Math.floor(i / 2), 2, 2, '#e0a85f'); } F.p(35, 31, '#f6d39a');
    }
    F.r(2, 36, 60, 4, '#c48a55'); F.r(2, 36, 60, 1, '#dba675'); F.r(2, 40, 60, 14, '#9a6438'); for (let x = 2; x < 62; x += 10) F.r(x, 40, 1, 14, '#7a4b29');
    F.r(2, 53, 60, 1, '#6e4425'); F.r(2, 40, 60, 1, '#7a4b29'); F.r(26, 43, 12, 6, '#fff6df'); F.r(28, 45, 3, 1, a1); F.r(32, 45, 4, 1, '#5a3a2a'); F.r(28, 47, 8, 1, '#c9b48f');
    outline(g, o, 0, 64, 56, '#4a2c1e'); outline(g, o, 56, 64, 56, '#4a2c1e');
  }
  return c;
};

/* ---------- Brunnen (3 Frames) ---------- */
A.fountain = function () {
  const { c, g } = cv(144, 48);
  for (let f = 0; f < 3; f++) {
    const o = f * 48, { r, p } = pen(g, o, 0);
    ell(g, 24, 38, 22, 8, '#c3ad86', o); ell(g, 24, 32, 22, 9, '#e8dbbd', o); ell(g, 24, 31.4, 21, 8, '#f4ecd8', o); ell(g, 24, 32, 18, 6.2, '#4fb3d9', o); ell(g, 24, 33, 16, 4.5, '#3f9cc8', o);
    for (let x = 4; x < 45; x += 6) r(x, 40, 1, 5, '#ad9772'); r(3, 42, 42, 1, '#b39d78');
    for (let a = 0; a < 360; a += 24) { const t = a * Math.PI / 180; p(Math.round(24 + Math.cos(t) * (6 + f * 3.5)), Math.round(32 + Math.sin(t) * (2 + f * 1.2)), '#9fe0f4'); }
    r(21, 14, 6, 18, '#e0d0ae'); r(25, 14, 2, 18, '#c3ad86'); r(21, 14, 1, 18, '#f4ead2');
    ell(g, 24, 14, 9, 3.5, '#e8dbbd', o); ell(g, 24, 13.5, 6.5, 2, '#4fb3d9', o);
    outline(g, o, 0, 48, 48, '#6b5a44');
    for (let y = 2; y < 12; y++) if ((y + f) % 3) p(24, y, '#c8f0fb');
    p(23, 3 + f * 2, '#ffffff'); p(25, 4 + ((f + 1) % 3) * 2, '#ffffff');
    [-1, 1].forEach(sd => { for (let k = 0; k < 5; k++) { const t = (k * 0.2 + f / 3) % 1; p(Math.round(24 + sd * (7 + t * 9)), Math.round(14 + t * t * 15), '#d8f5fc'); } });
  }
  return c;
};

/* ---------- Tore zu Lernbereichen mit Buchstaben-Schleier (4 Frames) ---------- */
A.gate = function (label) {
  const { c, g } = cv(256, 64), LET = 'AEIOUÑ';
  for (let f = 0; f < 4; f++) {
    const o = f * 64, { r, p } = pen(g, o, 0);
    for (let y = 20; y < 60; y++) for (let x = 15; x < 49; x++) { const h = hash(x, y + f * 7, 9); g.fillStyle = h < 0.07 ? '#e4dcff' : ((((x + y + f) >> 1) & 1) ? '#a796ea' : '#9584e0'); g.fillRect(o + x, y, 1, 1); }
    const R = rng(5); for (let k = 0; k < 5; k++) { const lx = 17 + Math.floor(R() * 27), ly = 22 + ((Math.floor(R() * 34) - f * 3 + 68) % 32); A.drawText(g, LET[k % LET.length], o + lx, ly, '#f6f2ff'); }
    r(15, 60, 34, 2, '#d4b479');
    [2, 49].forEach(x => { r(x, 14, 13, 48, '#e6cd9d'); r(x + 10, 14, 3, 48, '#c9ad7a'); r(x, 14, 1, 48, '#f6e6c4');
      for (let y = 22; y < 60; y += 8) { r(x, y, 13, 1, '#c4a777'); r(x + ((y >> 3) & 1 ? 6 : 3), y - 7, 1, 7, '#d1b685'); } r(x - 1, 58, 15, 4, '#c9ad7a'); });
    r(15, 14, 34, 6, '#e6cd9d'); r(15, 19, 34, 1, '#c9ad7a'); r(15, 20, 3, 2, '#e6cd9d'); r(46, 20, 3, 2, '#e6cd9d');
    [0, 47].forEach(x => { r(x, 10, 17, 4, '#d4603a'); r(x, 10, 17, 1, '#e98456'); r(x, 13, 17, 1, '#a8432a'); });
    p(20, 12, '#3a2a22'); p(20, 13, '#3a2a22'); p(43, 12, '#3a2a22'); p(43, 13, '#3a2a22');
    r(10, 1, 44, 11, '#8a5a34'); r(10, 1, 44, 1, '#b07a4c'); r(10, 11, 44, 1, '#5e3b22'); r(11, 2, 42, 9, '#9c6a40');
    A.drawText(g, label, o + 10 + Math.floor((44 - A.textWidth(label)) / 2), 4, '#fff1cf');
    outline(g, o, 0, 64, 64, '#4a3a2c');
  }
  return c;
};

/* ---------- Kleine Objekte in einem Atlas ---------- */
A.misc = function () {
  const { c, g } = cv(128, 64), frames = [];
  const F = (n, x, y, w, h, fn, ol = '#2b1d1f') => { const P = pen(g, x, y); fn(P.r, P.p, x, y); if (ol) outline(g, x, y, w, h, ol); frames.push([n, x, y, w, h]); };
  F('benchB', 0, 0, 32, 16, r => { r(3, 1, 2, 9, '#4a4a52'); r(27, 1, 2, 9, '#4a4a52'); r(2, 2, 28, 2, '#c08048'); r(2, 2, 28, 1, '#d79a62'); r(2, 5, 28, 2, '#b0703c'); });
  F('benchF', 0, 16, 32, 16, r => { r(1, 8, 30, 3, '#c88a50'); r(1, 8, 30, 1, '#e0a66e'); r(1, 10, 30, 1, '#a8703f'); r(3, 11, 2, 4, '#4a4a52'); r(27, 11, 2, 4, '#4a4a52'); });
  F('lantern', 32, 0, 12, 32, (r, p) => { r(5, 10, 2, 19, '#3b3d4a'); r(3, 28, 6, 3, '#3b3d4a'); r(2, 2, 8, 2, '#3b3d4a'); p(5, 1, '#3b3d4a'); p(6, 1, '#3b3d4a');
    r(3, 4, 6, 6, '#ffe39a'); r(5, 4, 2, 6, '#fff6d0'); r(3, 4, 1, 6, '#3b3d4a'); r(8, 4, 1, 6, '#3b3d4a'); r(2, 10, 8, 1, '#3b3d4a'); r(4, 11, 4, 1, '#3b3d4a'); });
  F('pot', 44, 0, 16, 16, (r, p) => { r(4, 9, 8, 6, '#c4603a'); r(3, 8, 10, 2, '#d9774e'); r(10, 10, 2, 5, '#a8452a'); ell(g, 8, 6, 5, 3, '#4f9a3c', 44, 0); ell(g, 7, 5, 3, 1.6, '#6fbf55', 44, 0);
    [[4, 5], [7, 3], [10, 5], [6, 6], [11, 3], [9, 2]].forEach(([x, y], k) => p(x, y, k % 2 ? '#ff8a8a' : '#e8424a')); });
  F('fence', 60, 0, 16, 16, (r, p) => { r(0, 6, 16, 2, '#cfa06a'); r(0, 11, 16, 2, '#cfa06a'); r(0, 7, 16, 1, '#b5834f'); r(0, 12, 16, 1, '#b5834f');
    r(2, 4, 2, 11, '#e0bd88'); r(12, 4, 2, 11, '#e0bd88'); r(3, 4, 1, 11, '#c9995e'); r(13, 4, 1, 11, '#c9995e'); p(2, 3, '#e0bd88'); p(12, 3, '#e0bd88'); });
  F('crate', 76, 0, 16, 14, (r, p) => { r(1, 4, 14, 9, '#b88450'); r(1, 4, 14, 1, '#d29e68'); r(1, 8, 14, 1, '#94683c'); r(1, 12, 14, 1, '#7c552f'); r(1, 4, 1, 9, '#94683c'); r(14, 4, 1, 9, '#94683c');
    [[2, 2], [5, 1], [8, 2], [11, 1]].forEach(([x, y]) => { r(x, y, 3, 3, '#f6a23a'); p(x, y, '#ffd27a'); }); });
  F('barrel', 92, 0, 14, 16, (r) => { r(2, 2, 10, 13, '#9a6438'); r(1, 4, 12, 9, '#9a6438'); r(3, 2, 8, 2, '#c08a58'); r(1, 5, 12, 1, '#5b5b63'); r(1, 11, 12, 1, '#5b5b63');
    r(5, 4, 1, 11, '#7a4b29'); r(9, 4, 1, 11, '#7a4b29'); r(3, 4, 1, 10, '#b47a48'); });
  F('signpost', 106, 0, 18, 24, (r) => { r(8, 6, 2, 17, '#8a5a34'); r(8, 6, 1, 17, '#a8744a'); r(2, 3, 13, 5, '#d29a5f'); r(2, 3, 13, 1, '#e8b77c'); r(1, 4, 1, 3, '#d29a5f');
    r(4, 10, 12, 4, '#c48a55'); r(16, 11, 1, 2, '#c48a55'); r(4, 5, 8, 1, '#8a5a34'); r(6, 12, 8, 1, '#7a4b29'); });
  F('marketsign', 0, 32, 36, 26, (r) => { r(4, 12, 2, 13, '#8a5a34'); r(30, 12, 2, 13, '#8a5a34'); r(1, 2, 34, 11, '#fbefd2'); r(1, 2, 34, 1, '#d4603a'); r(1, 12, 34, 1, '#b04b2f'); r(1, 2, 1, 11, '#d4603a'); r(34, 2, 1, 11, '#d4603a');
    A.drawText(g, 'MERCADO', 0 + 1 + Math.floor((34 - A.textWidth('MERCADO')) / 2), 32 + 5, '#b8402e'); });
  F('reeds', 36, 32, 16, 14, (r) => { [[2, 6], [4, 3], [6, 5], [9, 2], [11, 4], [13, 6]].forEach(([x, t], k) => { r(x, t, 1, 13 - t, '#5f9e45'); r(x + 1, t + 2, 1, 11 - t, '#86c062'); if (k % 2) r(x, t, 1, 3, '#7a4b2a'); }); }, '#2f5a26');
  F('rock', 52, 32, 14, 10, (r) => { ell(g, 7, 5.5, 6, 4, '#b8b2a6', 52, 32); ell(g, 6, 4.5, 4, 2.5, '#d6d1c6', 52, 32); r(3, 8, 9, 1, '#8f897e'); }, '#5a554c');
  F('bubble', 66, 32, 15, 15, (r, p) => { r(2, 1, 11, 1, '#ffffff'); r(1, 2, 13, 8, '#ffffff'); r(2, 10, 11, 1, '#ffffff'); r(6, 11, 3, 1, '#ffffff'); p(7, 12, '#ffffff'); A.drawText(g, 'E', 66 + 6, 32 + 3, '#d4603a'); });
  F('shadow', 81, 32, 14, 6, () => { ell(g, 7, 3, 6.5, 2.6, 'rgba(28,40,22,0.32)', 81, 32); }, null);
  return { canvas: c, frames };
};

/* ---------- Papierfähnchen (Papel picado), 2 Frames ---------- */
A.garland = function (w) {
  const { c, g } = cv(w, 32), cols = ['#ff5f87', '#ffd23f', '#2ec4b6', '#ff8c42', '#9b5de5', '#62c370'];
  for (let f = 0; f < 2; f++) {
    const oy = f * 16, yAt = x => 1 + Math.round(6 * 4 * (x / w) * (1 - x / w));
    for (let x = 0; x < w; x++) { g.fillStyle = '#5a3a2a'; g.fillRect(x, oy + yAt(x), 1, 1); }
    for (let x = 4, k = 0; x < w - 8; x += 9, k++) {
      const fy = yAt(x + 2) + 1 + (f && k % 2 ? 1 : 0); g.fillStyle = cols[k % cols.length]; g.fillRect(x, oy + fy, 6, 6);
      g.clearRect(x + 2, oy + fy + 2, 2, 1); g.clearRect(x + 1, oy + fy + 5, 1, 1); g.clearRect(x + 4, oy + fy + 5, 1, 1);
    }
  }
  return c;
};
A.cloud = function () { const { c, g } = cv(120, 60); for (let y = 0; y < 60; y++) for (let x = 0; x < 120; x++) { const d = ((x - 60) / 56) ** 2 + ((y - 30) / 26) ** 2; if (d < 0.7 || (d < 1 && (x + y) % 2 === 0)) { g.fillStyle = '#1d2b33'; g.fillRect(x, y, 1, 1); } } return c; };
A.duck = function () {
  const { c, g } = cv(24, 10);
  for (let f = 0; f < 2; f++) { const o = f * 12, { r, p } = pen(g, o, 0);
    ell(g, 6.5, 6 - f * 0.4, 4.5, 2.6, '#fbfbf7', o); r(3, 7, 7, 1, '#d9dde0'); r(1, 2, 3, 3, '#fbfbf7'); p(2, 3, '#222222'); p(0, 4, '#f29a2e'); p(0, 3, '#f29a2e'); p(10, 4, '#fbfbf7'); p(7, 5, '#d9dde0');
    outline(g, o, 0, 12, 10, '#4a5560'); r(2 + f, 9, 8, 1, '#bfeaf8'); }
  return c;
};
A.fly = function () { const { c, g } = cv(16, 6), { p } = pen(g), W = '#ffffff', B = '#3a2a2a';
  [[1, 1], [2, 1], [1, 2], [2, 2], [5, 1], [6, 1], [5, 2], [6, 2], [2, 3], [5, 3]].forEach(([x, y]) => p(x, y, W)); [1, 2, 3].forEach(y => { p(3, y, B); p(4, y, B); });
  [[10, 0], [10, 1], [13, 0], [13, 1], [10, 2], [13, 2]].forEach(([x, y]) => p(x, y, W)); [1, 2, 3].forEach(y => { p(11, y, B); p(12, y, B); }); return c; };

/* ---------- Holamander „gebannt“: etwa 40 % entsättigt, graue Kette um den Hals ---------- */
A.bannen = function (src) {
  const { c, g } = cv(src.width, src.height);
  g.drawImage(src, 0, 0);
  const img = g.getImageData(0, 0, c.width, c.height), d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const gr = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    d[i] += (gr - d[i]) * 0.4; d[i + 1] += (gr - d[i + 1]) * 0.4; d[i + 2] += (gr - d[i + 2]) * 0.4;
  }
  g.putImageData(img, 0, 0);
  // Kette: Glieder quer über den Hals, am Ende hängen drei Glieder herab
  const links = [[24, 24], [24, 26], [23, 28], [23, 30], [22, 32], [22, 34], [22, 36], [23, 38], [23, 40]];
  links.forEach(([x, y], k) => { g.fillStyle = '#2a2a33'; g.fillRect(x - 1, y - 1, 4, 4); });
  links.forEach(([x, y], k) => { g.fillStyle = k % 2 ? '#7d808c' : '#c2c5cf'; g.fillRect(x, y, 2, 2); });
  return c;
};

/* ---------- Alle Grafiken an Phaser übergeben ---------- */
A.register = function (scene, shadows) {
  const C = LX.Content, tx = scene.textures;
  const add = (key, canvas, frames) => { const t = tx.addCanvas(key, canvas); if (frames) frames.forEach(([n, x, y, w, h]) => t.add(n, 0, x, y, w, h)); return t; };
  const grid = (key, canvas, fw, fh, count) => { const cols = Math.floor(canvas.width / fw), fr = []; for (let i = 0; i < count; i++) fr.push([i, (i % cols) * fw, Math.floor(i / cols) * fh, fw, fh]); return add(key, canvas, fr); };
  add('ground', A.ground(C, shadows));
  const pond = A.cache.pond = A.pond(C); grid('pond', pond.canvas, pond.w, pond.h, 3);
  Object.keys(A.LOOKS).forEach(k => grid('chr-' + k, A.getChar(k), 16, 24, 16));
  grid('chr-cat', A.catSheet(), 16, 14, 8);
  ['olive', 'orange', 'round'].forEach(k => grid('tree-' + k, A.tree(k), 32, 40, 2));
  grid('cypress', A.cypress(), 16, 48, 2); grid('bush', A.bushes(), 16, 14, 2);
  grid('house', A.houses(), 96, 96, 4); add('dojo', A.dojo()); grid('stall', A.stalls(), 64, 56, 6); grid('fountain', A.fountain(), 48, 48, 3);
  C.objects.filter(o => o.k === 'gate').forEach(o => grid('gate-' + o.v, o.open ? A.gateOpen(o.label) : A.gate(o.label), 64, 64, 4));
  if (A.registerRoomArt) A.registerRoomArt(scene);
  const m = A.misc(); add('misc', m.canvas, m.frames);
  grid('duck', A.duck(), 12, 10, 2); grid('fly', A.fly(), 8, 6, 2); add('cloud', A.cloud());
  // Animationen
  const an = scene.anims;
  Object.keys(A.LOOKS).forEach(k => ['down', 'left', 'right', 'up'].forEach((d, ri) => {
    an.create({ key: `${k}-walk-${d}`, frames: [1, 0, 2, 0].map(f => ({ key: 'chr-' + k, frame: ri * 4 + f })), frameRate: 8, repeat: -1 });
    an.create({ key: `${k}-idle-${d}`, frames: [0, 3].map(f => ({ key: 'chr-' + k, frame: ri * 4 + f })), frameRate: 1.6, repeat: -1 });
  }));
  ['left', 'right'].forEach((d, ri) => {
    an.create({ key: `cat-walk-${d}`, frames: [1, 2].map(f => ({ key: 'chr-cat', frame: ri * 4 + f })), frameRate: 5, repeat: -1 });
    an.create({ key: `cat-idle-${d}`, frames: [{ key: 'chr-cat', frame: ri * 4 + 3 }], frameRate: 1, repeat: -1 });
  });
  an.create({ key: 'fly', frames: [0, 1].map(f => ({ key: 'fly', frame: f })), frameRate: 9, repeat: -1 });
  an.create({ key: 'duck', frames: [0, 1].map(f => ({ key: 'duck', frame: f })), frameRate: 2, repeat: -1 });
  // Holamander (Stufe 1–3): Textur "holamander-<stufe>" mit 3 Frames (offen, offen, Blinzeln) und Animation "-idle";
  // dazu "holamander-<stufe>-gebannt" (verzaubert) mit eigener Animation
  if (A.holamander) [1, 2, 3].forEach(st => [false, true].forEach(gebannt => {
    const key = 'holamander-' + st + (gebannt ? '-gebannt' : ''), sheet = document.createElement('canvas');
    sheet.width = 192; sheet.height = 64;
    const sg = sheet.getContext('2d', { willReadFrequently: true }); sg.imageSmoothingEnabled = false;
    [[0, false], [1, false], [0, true]].forEach(([ph, bl], i) => { const f = A.holamander(st, ph, bl); sg.drawImage(gebannt ? A.bannen(f) : f, i * 64, 0); });
    grid(key, sheet, 64, 64, 3).setFilter(Phaser.Textures.FilterMode.NEAREST);
    an.create({ key: key + '-idle', frames: [0, 1, 0, 1, 0, 1, 0, 1, 2].map(f => ({ key, frame: f })), frameRate: 2, repeat: -1 });
  }));
};
})();
