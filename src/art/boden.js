/* =====================================================================
   LX.Art (Teil 2) – Boden, Wasser, Pflanzen
   ===================================================================== */
(function () {
const A = LX.Art, { cv, rgb, hash, rng, pen, outline, ell } = A;

/* ---------- Boden: ein großes Bild aus den Flächen-Daten ---------- */
A.buildGrid = function (C) {
  const MW = C.map.w, MH = C.map.h, grid = [];
  for (let y = 0; y < MH; y++) grid.push(new Array(MW).fill('grass'));
  for (const reg of C.map.ground) {
    const [x0, y0, w, h] = reg.r, n = reg.round || 0;
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const dx = Math.min(i, w - 1 - i), dy = Math.min(j, h - 1 - j);
      if (dx + dy < n) continue;
      const x = x0 + i, y = y0 + j; if (x >= 0 && y >= 0 && x < MW && y < MH) grid[y][x] = reg.t;
    }
  }
  return grid;
};

A.ground = function (C, shadows) {
  const T = C.map.tile, MW = C.map.w, MH = C.map.h, W = MW * T, H = MH * T, grid = A.buildGrid(C);
  const { c, g } = cv(W, H), img = g.createImageData(W, H), d = img.data;
  const P = { gA: rgb('#7cc35a'), gB: rgb('#79bf57'), gD: rgb('#5ea646'), gL: rgb('#98d46c'), pa: rgb('#e7cd93'), paD: rgb('#d5b77b'), paL: rgb('#f3e2b4'),
    mortar: rgb('#c2a17a'), stones: ['#ecd8b4', '#e3caa2', '#f1e1c2', '#dbc199'].map(rgb), stL: rgb('#f8ecd4'), stD: rgb('#cfb48c'),
    grout: rgb('#b5643c'), tA: rgb('#d98b5e'), tB: rgb('#cf7f52'), tL: rgb('#e7a072') };
  for (let y = 0; y < H; y++) { const ty = y >> 4; for (let x = 0; x < W; x++) {
    const t = grid[ty][x >> 4]; let col;
    if (t === 'path') { const h = hash(x, y, 2); col = h < 0.07 ? P.paD : h > 0.94 ? P.paL : P.pa; }
    else if (t === 'plaza') { const row = Math.floor(y / 6), off = (row & 1) * 4, lx = (x + off) & 7, ly = y - row * 6;
      if (lx === 0 || ly === 0) col = P.mortar; else { col = P.stones[Math.floor(hash((x + off) >> 3, row, 3) * 4)]; if (ly === 1 && lx < 7) col = P.stL; else if (ly === 5) col = P.stD; } }
    else if (t === 'market') { const lx = x & 7, ly = y & 7; if (lx === 0 || ly === 0) col = P.grout; else { col = (((x >> 3) + (y >> 3)) & 1) ? P.tA : P.tB; if (ly === 1 && lx < 7) col = P.tL; } }
    else { const h = hash(x, y, 1); col = h < 0.05 ? P.gD : h > 0.965 ? P.gL : (hash(x >> 3, y >> 3, 7) < 0.5 ? P.gA : P.gB); }
    const i = (y * W + x) * 4; d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2]; d[i + 3] = 255;
  } }
  g.putImageData(img, 0, 0);
  const { r, p } = pen(g);
  const soft = (x, y) => x < 0 || y < 0 || x >= MW || y >= MH || grid[y][x] === 'grass' || grid[y][x] === 'water';
  // weiche Grasränder an Wegen und Plätzen
  for (let ty = 0; ty < MH; ty++) for (let tx = 0; tx < MW; tx++) {
    const t = grid[ty][tx]; if (t === 'grass' || t === 'water') continue;
    const bx = tx * T, by = ty * T, stone = t !== 'path', curb = t === 'market' ? '#a85a35' : '#b39268';
    const depth = i => { const h = hash(bx + i, by + i * 3, 11); return stone ? (h < 0.6 ? 1 : 2) : (h < 0.3 ? 1 : h < 0.8 ? 2 : 3); };
    if (soft(tx, ty - 1)) for (let i = 0; i < 16; i++) { const k = depth(i); if (stone) p(bx + i, by + k, curb); r(bx + i, by, 1, k, '#78bd56'); p(bx + i, by + k - 1, '#5ea646'); }
    if (soft(tx, ty + 1)) for (let i = 0; i < 16; i++) { const k = depth(i + 20); if (stone) p(bx + i, by + 15 - k, curb); r(bx + i, by + 16 - k, 1, k, '#78bd56'); }
    if (soft(tx - 1, ty)) for (let i = 0; i < 16; i++) { const k = depth(i + 40); if (stone) p(bx + k, by + i, curb); r(bx, by + i, k, 1, '#78bd56'); p(bx + k - 1, by + i, '#5ea646'); }
    if (soft(tx + 1, ty)) for (let i = 0; i < 16; i++) { const k = depth(i + 60); if (stone) p(bx + 15 - k, by + i, curb); r(bx + 16 - k, by + i, k, 1, '#78bd56'); p(bx + 16 - k, by + i, '#5ea646'); }
  }
  // Grasbüschel, Wildblumen, Kiesel
  const R = rng(1234), FL = ['#ffffff', '#ffd84a', '#ff8fb1', '#b98ef0', '#ff6b5a'];
  for (let ty = 0; ty < MH; ty++) for (let tx = 0; tx < MW; tx++) {
    const t = grid[ty][tx], bx = tx * T, by = ty * T;
    if (t === 'grass') {
      if (R() < 0.5) { const x = bx + 2 + Math.floor(R() * 11), y = by + 3 + Math.floor(R() * 11); p(x, y, '#57a042'); p(x + 1, y - 1, '#57a042'); p(x + 2, y, '#57a042'); p(x + 1, y, '#a6dc7c'); }
      if (R() < 0.1) { const n = 1 + Math.floor(R() * 3), fc = FL[Math.floor(R() * FL.length)];
        for (let k = 0; k < n; k++) { const x = bx + 2 + Math.floor(R() * 12), y = by + 2 + Math.floor(R() * 12);
          p(x - 1, y, fc); p(x + 1, y, fc); p(x, y - 1, fc); p(x, y + 1, '#4f9a3c'); p(x, y, fc === '#ffd84a' ? '#f08a2b' : '#ffe27a'); } }
    } else if (t === 'path' && R() < 0.2) { const x = bx + 2 + Math.floor(R() * 12), y = by + 2 + Math.floor(R() * 12); r(x, y, 2, 1, '#c9a46c'); p(x, y - 1, '#f5e7c2'); }
  }
  // Blumenbeete
  const BED = ['#e8424a', '#ffd84a', '#ff8fb1', '#ffffff', '#b98ef0'];
  for (const [x0, y0, w, h] of C.map.beds) {
    const bx = x0 * T, by = y0 * T, bw = w * T, bh = h * T;
    r(bx + 1, by + 1, bw - 2, bh - 2, '#8d5f3e'); r(bx + 1, by + 1, bw - 2, 1, '#6f4a30');
    for (let y = by + 3; y < by + bh - 2; y += 3) for (let x = bx + 2 + ((y >> 1) & 1); x < bx + bw - 2; x += 3) {
      p(x, y + 1, '#4f9a3c'); p(x + 1, y + 1, '#3f8333'); p(x, y, BED[Math.floor(hash(x, y, 13) * BED.length)]);
    }
  }
  // Schatten der Objekte (Licht von oben links)
  g.fillStyle = 'rgba(32,58,26,0.22)';
  for (const s of shadows) { if (!s.sw) continue; const ry = Math.max(2.5, Math.min(7, s.sw * 0.16)); ell(g, s.x + 2, s.y - 1, s.sw, ry, 'rgba(32,58,26,0.22)'); }
  A.cache.grid = grid;
  return c;
};

/* ---------- Teich mit drei Wasser-Frames ---------- */
A.pond = function (C) {
  const T = C.map.tile, reg = C.map.ground.find(q => q.t === 'water'), [x0, y0, w, h] = reg.r;
  const PW = w * T, PH = h * T, rr = 14, { c, g } = cv(PW * 3, PH);
  const lily = rng(31), pads = []; for (let k = 0; k < 5; k++) pads.push([20 + lily() * (PW - 40), 18 + lily() * (PH - 32)]);
  const rip = rng(32), rips = []; for (let k = 0; k < 12; k++) rips.push([8 + rip() * (PW - 20), 12 + rip() * (PH - 20)]);
  for (let f = 0; f < 3; f++) {
    const o = f * PW, { r, p } = pen(g, o, 0);
    for (let y = 0; y < PH; y++) for (let x = 0; x < PW; x++) {
      const qx = Math.max(rr - x, 0, x - (PW - 1 - rr)), qy = Math.max(rr - y, 0, y - (PH - 1 - rr));
      let e; if (qx > 0 && qy > 0) { const cd = Math.hypot(qx, qy); if (cd > rr) continue; e = rr - cd; } else e = Math.min(x, y, PW - 1 - x, PH - 1 - y);
      let col = e < 2 ? '#e3cd95' : e < 3 ? '#b99d66' : e < 4 ? '#dff4f8' : (y < 9 ? '#3487b8' : e < 9 ? '#57b6de' : '#3f9cc8');
      if (e >= 9 && hash(x >> 2, y >> 1, 40) < 0.06) col = '#4aa8d4';
      p(x, y, col);
    }
    rips.forEach(([x, y], k) => { const sx = Math.round(x + ((f + k) % 3) * 2); r(sx, Math.round(y), 3, 1, '#a8e4f5'); if ((k + f) % 3 === 0) p(sx + 1, Math.round(y) - 1, '#ffffff'); });
    pads.forEach(([x, y], k) => { ell(g, x, y, 4, 2.6, '#5fae4c', o); ell(g, x - 1, y - 0.5, 2, 1.2, '#8fd46d', o); p(Math.round(x) + 2, Math.round(y) - 1, '#3f9cc8'); if (k === 1) { p(Math.round(x), Math.round(y) - 2, '#ff8fb8'); p(Math.round(x) + 1, Math.round(y) - 2, '#ffc2d8'); } });
  }
  return { canvas: c, x: x0 * T, y: y0 * T, w: PW, h: PH };
};

/* ---------- Baumkronen mit Lichtseite oben links ---------- */
function canopy(g, ox, blobs, pal, seed, cw, ch) {
  for (let y = 1; y < ch - 1; y++) for (let x = 1; x < cw - 1; x++) {
    let best = -1, bn = null;
    for (const b of blobs) { const dx = (x + 0.5 - b[0]) / b[2], dy = (y + 0.5 - b[1]) / b[2], dd = dx * dx + dy * dy; if (dd <= 1 && 1 - dd > best) { best = 1 - dd; bn = [dx, dy, dd]; } }
    if (!bn) continue;
    let s = -0.62 * bn[0] - 0.78 * bn[1] + (hash((x + (y & 1)) >> 1, y >> 1, seed) - 0.5) * 0.75; if (bn[2] > 0.72) s -= 0.25;
    g.fillStyle = pal[s > 0.42 ? 0 : s > -0.05 ? 1 : s > -0.5 ? 2 : 3]; g.fillRect(ox + x, y, 1, 1);
  }
}
A.tree = function (kind) {
  const { c, g } = cv(64, 40);
  for (let f = 0; f < 2; f++) {
    const o = f * 32, { r, p } = pen(g, o, 0), s = f;
    if (kind === 'olive') {
      r(14, 24, 4, 13, '#857463'); r(13, 30, 2, 5, '#857463'); r(16, 24, 2, 13, '#6a5b4c'); r(12, 35, 8, 3, '#6a5b4c'); p(14, 27, '#a39380'); p(15, 32, '#a39380');
      canopy(g, o, [[16 + s, 13, 11], [8, 19, 7.5], [23.5 + s, 18, 7], [16, 21, 8]], ['#b6cb7d', '#8ea957', '#66843e', '#4b6830'], 3, 32, 40);
      [[9, 15], [20, 10], [24, 20], [13, 22]].forEach(([x, y]) => p(x + (y < 14 ? s : 0), y, '#4a3a5a'));
    } else {
      r(14, 26, 4, 11, '#7b5236'); r(16, 26, 2, 11, '#5e3d27'); r(12, 35, 8, 3, '#5e3d27');
      if (kind === 'orange') {
        canopy(g, o, [[16 + s, 14, 12], [8.5, 20, 7.5], [23 + s, 20, 7.5]], ['#74c45a', '#4c9e43', '#337d36', '#245e2b'], 5, 32, 40);
        const R = rng(9); for (let k = 0; k < 10; k++) { const fx = Math.round(7 + R() * 17), fy = Math.round(6 + R() * 18); r(fx + (fy < 14 ? s : 0), fy, 2, 2, '#f6a23a'); p(fx + (fy < 14 ? s : 0), fy, '#ffd27a'); }
        [[11, 9], [21, 13], [17, 22]].forEach(([x, y]) => p(x + (y < 14 ? s : 0), y, '#ffffff'));
      } else canopy(g, o, [[16 + s, 13, 12], [9, 20, 7.5], [23 + s, 20, 7.5], [16, 23, 8.5]], ['#82c25a', '#5e9f45', '#447f37', '#305f2a'], 7, 32, 40);
    }
    outline(g, o, 0, 32, 40, '#2c3a22');
  }
  return c;
};
A.cypress = function () {
  const { c, g } = cv(32, 48), pal = ['#5fa04a', '#3f8139', '#2d6431', '#1f4925'];
  for (let f = 0; f < 2; f++) {
    const o = f * 16; pen(g, o, 0).r(7, 40, 2, 6, '#6a4a30');
    for (let y = 2; y < 43; y++) { const t = (y - 1) / 42, hw = 6 * Math.pow(Math.sin(Math.PI * Math.min(t * 1.15, 1)), 0.7), sh = f && y < 16 ? 1 : 0;
      for (let x = 1; x < 15; x++) { const dx = (x + 0.5 - 8 - sh) / Math.max(hw, 0.5); if (Math.abs(dx) > 1) continue;
        const s = -0.7 * dx - 0.4 * (t - 0.4) + (hash(x >> 1, y >> 1, 21 + f) - 0.5) * 0.7; g.fillStyle = pal[s > 0.4 ? 0 : s > -0.1 ? 1 : s > -0.55 ? 2 : 3]; g.fillRect(o + x, y, 1, 1); } }
    outline(g, o, 0, 16, 48, '#1c3a1c');
  }
  return c;
};
A.bushes = function () {
  const { c, g } = cv(32, 14);
  for (let v = 0; v < 2; v++) {
    const o = v * 16; canopy(g, o, [[5, 8, 4.5], [11, 8, 4.5], [8, 6, 4.5]], ['#8fd165', '#64ae48', '#468d3a', '#316c2e'], 11 + v, 16, 14);
    if (v) [[4, 6], [8, 4], [11, 7], [6, 9], [10, 10]].forEach(([x, y], k) => pen(g, o, 0).p(x, y, k % 2 ? '#ffffff' : '#ff8fb8'));
    outline(g, o, 0, 16, 14, '#24502a');
  }
  return c;
};
})();
