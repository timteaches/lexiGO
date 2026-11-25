/* =====================================================================
   LX.Art (Teil 1) – Werkzeuge, Pixel-Schrift und Figuren.
   Alles wird pixelgenau auf Canvas gezeichnet und danach automatisch umrandet.
   ===================================================================== */
(function () {
const A = LX.Art = { cache: {}, chars: {} };

function cv(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d', { willReadFrequently: true }); g.imageSmoothingEnabled = false; return { c, g }; }
function rgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function hash(x, y, s) { let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 1442695041)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; }
function rng(seed) { let s = (Math.imul(seed | 0, 2654435761) >>> 0) || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
function pen(g, ox = 0, oy = 0) { return { r: (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(ox + x, oy + y, w, h); }, p: (x, y, c) => { g.fillStyle = c; g.fillRect(ox + x, oy + y, 1, 1); } }; }
// Fügt einen 1-px-Umriss um alle deckenden Pixel eines Bereichs hinzu
function outline(g, x0, y0, w, h, col) {
  const img = g.getImageData(x0, y0, w, h), d = img.data, mark = new Uint8Array(w * h);
  const a = (x, y) => x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] > 40;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (!a(x, y) && (a(x - 1, y) || a(x + 1, y) || a(x, y - 1) || a(x, y + 1))) mark[y * w + x] = 1;
  const [r, gg, b] = rgb(col);
  for (let i = 0; i < mark.length; i++) if (mark[i]) { d[i * 4] = r; d[i * 4 + 1] = gg; d[i * 4 + 2] = b; d[i * 4 + 3] = 255; }
  g.putImageData(img, x0, y0);
}
// Gefüllte Pixel-Ellipse
function ell(g, cx, cy, rx, ry, col, ox = 0, oy = 0) {
  g.fillStyle = col;
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
    const dy = (y + 0.5 - cy) / ry; if (Math.abs(dy) > 1) continue;
    const half = rx * Math.sqrt(1 - dy * dy), x0 = Math.round(cx - half), x1 = Math.round(cx + half);
    if (x1 > x0) g.fillRect(ox + x0, oy + y, x1 - x0, 1);
  }
}
Object.assign(A, { cv, rgb, hash, rng, pen, outline, ell });

/* ---------- Pixel-Schrift (3x5) für Schilder ---------- */
const FONT = { A: ['010','101','111','101','101'], C: ['011','100','100','100','011'], D: ['110','101','101','101','110'],
  E: ['111','100','110','100','111'], I: ['111','010','010','010','111'], J: ['001','001','001','101','010'],
  L: ['100','100','100','100','111'], M: ['10001','11011','10101','10001','10001'], N: ['1001','1101','1011','1001','1001'],
  O: ['010','101','101','101','010'], R: ['110','101','110','101','101'], U: ['101','101','101','101','111'],
  1: ['010','110','010','010','111'], 2: ['110','001','010','100','111'], ' ': ['00','00','00','00','00'],
  T: ['111','010','010','010','010'], S: ['011','100','010','001','110'], B: ['110','101','110','101','110'],
  '!': ['1','1','1','0','1'], '¡': ['1','0','1','1','1'] };
const gk = ch => ch === 'Ó' ? 'O' : ch === 'Ñ' ? 'N' : ch === 'É' ? 'E' : ch;
A.textWidth = (s, sc = 1) => { let w = 0; for (const ch of s) w += (FONT[gk(ch)] || FONT[' '])[0].length + 1; return (w - 1) * sc; };
A.drawText = (g, s, x, y, col, sc = 1) => {
  g.fillStyle = col; let cx = x;
  for (const ch of s) {
    const gl = FONT[gk(ch)] || FONT[' '];
    gl.forEach((row, ry) => { for (let rx = 0; rx < row.length; rx++) if (row[rx] === '1') g.fillRect(cx + rx * sc, y + ry * sc, sc, sc); });
    if (ch === 'Ó' || ch === 'É') g.fillRect(cx + 2 * sc, y - 2 * sc, sc, sc);
    if (ch === 'Ñ') { g.fillRect(cx, y - 2 * sc, sc, sc); g.fillRect(cx + sc, y - 3 * sc, sc, sc); g.fillRect(cx + 2 * sc, y - 2 * sc, sc, sc); g.fillRect(cx + 3 * sc, y - 3 * sc, sc, sc); }
    cx += (gl[0].length + 1) * sc;
  }
};

/* ---------- Figuren: Aussehen als Daten ---------- */
const OUT = '#2b1d1f', EYE = '#2b1d1f', BLUSH = '#f0907a';
const SK1 = { skin: '#eab78f', skinS: '#cf9270' }, SK2 = { skin: '#dca47b', skinS: '#bd8460' }, SK3 = { skin: '#c98d63', skinS: '#a8714c' }, SK4 = { skin: '#f0c6a2', skinS: '#d6a27e' };
const BOOT = { shoe: '#3a2a22', shoeS: '#271c17' };
const LOOKS = A.LOOKS = {
  pedro: { ...SK1, style: 'curlyShort', hair: '#3b2419', hairL: '#6a4430', shirt: '#3f86d8', shirtS: '#2b62a6', shirtL: '#76b0ef', pants: '#3c4660', pantsS: '#2a3146', shoe: '#e9483f', shoeS: '#a9332e',
    chest: (r, p, y) => { r(6, y + 2, 4, 1, '#eaf4ff'); p(7, y + 3, '#eaf4ff'); } },
  sofia: { ...SK2, style: 'curlyLong', hair: '#34201a', hairL: '#62402e', shirt: '#f27a4f', shirtS: '#c9583a', shirtL: '#ffab84', pants: '#3e70aa', pantsS: '#2c5285', shoe: '#f6f2ea', shoeS: '#bdb5a6',
    chest: (r, p, y) => { r(6, y + 2, 4, 1, '#ffd34d'); } },
  carmen: { ...SK3, ...BOOT, style: 'scarf', hair: '#2b1b16', hairL: '#4a3024', sc: '#d64545', scS: '#a53232', shirt: '#3b9b8f', shirtS: '#2b7a70', shirtL: '#62bfb2', pants: '#5b3f6e', pantsS: '#43304f',
    chest: (r, p, y) => { r(5, y + 1, 6, 5, '#fff4e3'); r(5, y + 5, 6, 1, '#e6d6bd'); } },
  lucia: { ...SK4, ...BOOT, style: 'bun', hair: '#1f1715', hairL: '#4a3a32', shirt: '#f6f1e6', shirtS: '#d8cebb', shirtL: '#ffffff', pants: '#f0e9dc', pantsS: '#d3c9b6', belt: '#c0392b',
    chest: (r, p, y) => { p(7, y + 1, '#d8cebb'); p(8, y + 2, '#d8cebb'); } },
  tomas: { ...SK1, ...BOOT, style: 'bald', hair: '#e3e0da', hairL: '#ffffff', shirt: '#8b6a48', shirtS: '#6c5036', shirtL: '#a8865f', pants: '#4c5a4a', pantsS: '#394436',
    chest: (r, p, y) => { r(7, y, 2, 4, '#f1ead8'); } },
  lola: { ...SK2, style: 'pigtails', hair: '#5c3420', hairL: '#8a5636', rib: '#ff5f87', shirt: '#f6c840', shirtS: '#d7a41f', shirtL: '#ffe38a', pants: '#7d4a8c', pantsS: '#5f376b', skirt: '#ff7aa0', shoe: '#e9483f', shoeS: '#a9332e' },
  elena: { ...SK4, ...BOOT, style: 'cap', hair: '#3d2a20', hairL: '#5e4231', cap: '#2f6fb3', capS: '#20508a', shirt: '#f5c242', shirtS: '#d29e22', shirtL: '#ffe08a', pants: '#2f5f9e', pantsS: '#22467a',
    chest: (r, p, y) => { for (let i = 0; i < 5; i++) p(5 + i, y + i, '#7a5232'); } },
  paco: { ...SK3, ...BOOT, style: 'hat', hair: '#4a3a30', hairL: '#6b584a', hat: '#ecd391', hatS: '#c9ad62', hatL: '#fff0bd', band: '#b8402e', shirt: '#5a9150', shirtS: '#41713a', shirtL: '#7db571', pants: '#6b5844', pantsS: '#514231' },
  rosa: { ...SK1, style: 'bob', hair: '#8a3a22', hairL: '#b8603e', shirt: '#c86aa6', shirtS: '#a14f85', shirtL: '#e595c6', pants: '#4b4f7a', pantsS: '#383b5e', shoe: '#f6f2ea', shoeS: '#bdb5a6' },
  diego: { ...SK2, ...BOOT, style: 'short', hair: '#1f1512', hairL: '#3d2b24', shirt: '#56743f', shirtS: '#3f5a2d', shirtL: '#7a9a5e', pants: '#3a3a30', pantsS: '#2a2a22', belt: '#6b4a2e' }
};

// Figuren im Lernraum ¡Acércate! (Farben werden aus wenigen Grundwerten abgeleitet)
function shade(hex, amt) { return '#' + rgb(hex).map(v => Math.max(0, Math.min(255, v + amt)).toString(16).padStart(2, '0')).join(''); }
A.shade = shade;
function look(sk, style, hair, shirt, pants, extra) {
  return Object.assign({ ...sk, style, hair, hairL: shade(hair, 40), shirt, shirtS: shade(shirt, -40), shirtL: shade(shirt, 45),
    pants, pantsS: shade(pants, -30), shoe: '#3a2a22', shoeS: '#271c17' }, extra || {});
}
Object.assign(LOOKS, {
  r_manana:  look(SK4, 'bob', '#5a3a2a', '#f2b33d', '#4b6a8a'),
  r_tarde:   look(SK3, 'short', '#2b1b16', '#e07b39', '#3e4a5e'),
  r_noche:   look(SK1, 'cap', '#7a4a2a', '#9cc3ea', '#9cc3ea', { cap: '#5f86c8', capS: '#4a6aa6', shoe: '#e8d6b0', shoeS: '#c4b08a', chest: (r, p, y) => { for (let i = 0; i < 3; i++) r(4, y + 1 + i * 2, 8, 1, '#c6defa'); } }),
  r_hola:    look(SK2, 'pigtails', '#3b2419', '#2ec4b6', '#3c4660', { rib: '#ffd23f' }),
  r_adios:   look(SK1, 'short', '#c8873e', '#8b5cc8', '#3c4660', { chest: (r, p, y) => { r(4, y + 1, 1, 4, '#6b4a2e'); r(11, y + 1, 1, 4, '#6b4a2e'); } }),
  r_luego:   look(SK3, 'bob', '#1f1512', '#e8424a', '#2f5f9e'),
  r_quetal:  look(SK2, 'curlyShort', '#1f1512', '#1f8a86', '#3a3a30'),
  r_muybien: look(SK4, 'curlyLong', '#a0522d', '#62c370', '#4b4f7a'),
  r_bien:    look(SK1, 'short', '#3b2419', '#5aa0e0', '#b59a72'),
  r_regular: look(SK3, 'bun', '#2b1b16', '#b8a07a', '#5b4a3a'),
  r_mal:     look(SK2, 'short', '#4a3024', '#6b7a8a', '#3a3a44')
});

/* ---------- Frisuren ---------- */
const each = (p, list, c, y) => list.forEach(([a, b]) => p(a, b + y, c));
function topCap(r, h, y) { r(5, 1 + y, 6, 1, h); r(4, 2 + y, 8, 1, h); r(3, 3 + y, 10, 2, h); }
const HAIR = {
  curlyShort(r, p, L, d, y) { const h = L.hair, l = L.hairL;
    if (d === 'down') { [5, 6, 9, 10].forEach(x => p(x, 1 + y, h)); r(4, 2 + y, 8, 1, h); r(3, 3 + y, 10, 2, h); [3, 4, 5, 7, 8, 10, 11, 12].forEach(x => p(x, 5 + y, h));
      p(3, 6 + y, h); p(12, 6 + y, h); p(2, 4 + y, h); p(13, 4 + y, h); each(p, [[5, 2], [9, 2], [4, 3], [7, 3], [11, 3], [6, 4], [9, 4]], l, y); }
    else if (d === 'up') { [5, 6, 9, 10].forEach(x => p(x, 1 + y, h)); r(4, 2 + y, 8, 1, h); r(3, 3 + y, 10, 7, h); r(4, 10 + y, 8, 1, h);
      [4, 7].forEach(v => { p(2, v + y, h); p(13, v + y, h); }); each(p, [[5, 2], [9, 2], [4, 4], [8, 4], [11, 5], [6, 6], [10, 7], [4, 8], [8, 9]], l, y); }
    else { [6, 7, 10, 11].forEach(x => p(x, 1 + y, h)); r(4, 2 + y, 9, 1, h); r(3, 3 + y, 11, 2, h); p(3, 5 + y, h); p(4, 5 + y, h); r(7, 5 + y, 7, 1, h); r(9, 6 + y, 5, 4, h); r(9, 10 + y, 3, 1, h);
      p(14, 5 + y, h); p(8, 6 + y, h); each(p, [[6, 2], [10, 2], [5, 3], [9, 3], [12, 4], [11, 6], [10, 8], [12, 9]], l, y); p(8, 7 + y, L.skinS); p(8, 8 + y, L.skinS); }
  },
  curlyLong(r, p, L, d, y) { const h = L.hair, l = L.hairL;
    if (d === 'down') { topCap(r, h, y); [3, 4, 5, 8, 9, 10, 11, 12].forEach(x => p(x, 5 + y, h)); p(3, 6 + y, h); p(4, 6 + y, h); p(11, 6 + y, h); p(12, 6 + y, h);
      r(2, 4 + y, 2, 8, h); r(12, 4 + y, 2, 8, h); [6, 9].forEach(v => p(1, v + y, h)); [7, 10].forEach(v => p(14, v + y, h));
      r(1, 12 + y, 2, 4, h); r(13, 12 + y, 2, 4, h); p(2, 16 + y, h); p(13, 16 + y, h);
      each(p, [[6, 2], [9, 2], [4, 3], [11, 3], [2, 6], [13, 8], [3, 9], [12, 11], [1, 13], [14, 14]], l, y); }
    else if (d === 'up') { topCap(r, h, y); r(3, 5 + y, 10, 7, h); r(2, 4 + y, 1, 8, h); r(13, 4 + y, 1, 8, h); r(2, 12 + y, 12, 4, h); r(3, 16 + y, 4, 1, h); r(9, 16 + y, 4, 1, h);
      each(p, [[6, 2], [9, 3], [4, 5], [11, 6], [6, 8], [9, 10], [4, 12], [11, 13], [7, 14]], l, y); }
    else { topCap(r, h, y); p(3, 5 + y, h); p(4, 5 + y, h); p(5, 5 + y, h); r(7, 5 + y, 7, 1, h); r(8, 6 + y, 6, 6, h); r(9, 12 + y, 5, 4, h); p(10, 16 + y, h); p(12, 16 + y, h);
      p(14, 7 + y, h); p(14, 11 + y, h); each(p, [[6, 2], [10, 3], [12, 5], [10, 7], [12, 9], [10, 12], [12, 14]], l, y); }
  },
  short(r, p, L, d, y, bun) { const h = L.hair, l = L.hairL;
    if (d === 'down') { topCap(r, h, y); p(3, 5 + y, h); p(4, 5 + y, h); p(11, 5 + y, h); p(12, 5 + y, h); p(3, 6 + y, h); p(12, 6 + y, h); each(p, [[6, 2], [9, 3], [4, 4]], l, y); if (bun) { r(6, 0 + y, 4, 1, h); p(7, 0 + y, l); } }
    else if (d === 'up') { topCap(r, h, y); r(3, 5 + y, 10, 5, h); r(4, 10 + y, 8, 1, h); each(p, [[6, 3], [9, 5], [5, 7]], l, y); if (bun) { r(6, 0 + y, 4, 1, h); p(7, 0 + y, l); } }
    else { topCap(r, h, y); p(3, 5 + y, h); p(4, 5 + y, h); r(8, 5 + y, 5, 1, h); r(9, 6 + y, 4, 4, h); p(8, 7 + y, L.skinS); p(8, 8 + y, L.skinS); each(p, [[6, 2], [10, 4]], l, y); if (bun) { r(9, 0 + y, 3, 1, h); p(10, 0 + y, l); } }
  },
  bun(r, p, L, d, y) { HAIR.short(r, p, L, d, y, true); },
  bald(r, p, L, d, y) { const h = L.hair;
    if (d === 'down') { r(3, 5 + y, 1, 4, h); r(12, 5 + y, 1, 4, h); p(5, 6 + y, h); p(10, 6 + y, h); r(6, 10 + y, 4, 1, h); p(6, 3 + y, '#fde7cf'); p(7, 3 + y, '#fde7cf'); }
    else if (d === 'up') { r(3, 6 + y, 10, 3, h); }
    else { r(9, 5 + y, 4, 4, h); p(4, 6 + y, h); p(3, 10 + y, h); p(4, 10 + y, h); p(6, 3 + y, '#fde7cf'); }
  },
  cap(r, p, L, d, y) { const h = L.hair;
    r(4, 1 + y, 8, 1, L.cap); r(3, 2 + y, 10, 3, L.cap);
    if (d === 'down') { r(2, 5 + y, 12, 1, L.capS); p(7, 3 + y, '#ffd84a'); p(8, 3 + y, '#ffd84a'); p(3, 6 + y, h); p(12, 6 + y, h); p(3, 7 + y, h); p(12, 7 + y, h); }
    else if (d === 'up') { r(4, 5 + y, 8, 1, L.capS); r(3, 6 + y, 10, 4, h); r(7, 10 + y, 2, 3, h); }
    else { r(1, 5 + y, 6, 1, L.capS); r(8, 5 + y, 5, 4, h); r(12, 8 + y, 2, 3, h); p(8, 3 + y, '#ffd84a'); }
  },
  hat(r, p, L, d, y) { const h = L.hair;
    r(5, 1 + y, 6, 1, L.hat); r(4, 2 + y, 8, 2, L.hat); r(4, 3 + y, 8, 1, L.band); r(1, 4 + y, 14, 2, L.hatS); r(2, 4 + y, 12, 1, L.hat); p(6, 2 + y, L.hatL);
    if (d === 'down') { p(3, 6 + y, h); p(12, 6 + y, h); } else if (d === 'up') r(3, 6 + y, 10, 4, h); else r(9, 6 + y, 4, 3, h);
  },
  scarf(r, p, L, d, y) { const s = L.sc, w = '#fff4e6';
    r(5, 1 + y, 6, 1, s); r(4, 2 + y, 8, 1, s); r(3, 3 + y, 10, 3, s);
    if (d === 'down') { r(3, 6 + y, 1, 4, s); r(12, 6 + y, 1, 4, s); [4, 5, 10, 11].forEach(x => p(x, 6 + y, L.hair)); each(p, [[5, 3], [8, 4], [10, 2], [6, 5], [11, 4]], w, y); }
    else if (d === 'up') { r(3, 6 + y, 10, 4, s); r(7, 10 + y, 2, 2, L.scS); each(p, [[5, 3], [9, 5], [6, 7], [10, 8]], w, y); }
    else { r(8, 6 + y, 5, 4, s); p(13, 9 + y, L.scS); p(4, 6 + y, L.hair); each(p, [[5, 3], [9, 4], [11, 7]], w, y); }
  },
  pigtails(r, p, L, d, y) { const h = L.hair;
    HAIR.short(r, p, L, d, y);
    if (d === 'left') { r(12, 6 + y, 2, 4, h); p(12, 5 + y, L.rib); }
    else { r(1, 6 + y, 2, 4, h); r(13, 6 + y, 2, 4, h); p(2, 5 + y, L.rib); p(13, 5 + y, L.rib); }
  },
  bob(r, p, L, d, y) { const h = L.hair, l = L.hairL;
    r(5, 1 + y, 6, 1, h); r(4, 2 + y, 8, 1, h); r(3, 3 + y, 10, 3, h);
    if (d === 'down') { r(2, 5 + y, 2, 6, h); r(12, 5 + y, 2, 6, h); each(p, [[6, 2], [9, 3], [2, 7], [13, 8]], l, y); }
    else if (d === 'up') { r(3, 6 + y, 10, 5, h); r(2, 5 + y, 1, 6, h); r(13, 5 + y, 1, 6, h); each(p, [[6, 3], [10, 6], [5, 8]], l, y); }
    else { r(8, 6 + y, 6, 5, h); each(p, [[6, 2], [11, 7]], l, y); }
  }
};

/* ---------- Eine Figur in einen 16x24-Rahmen zeichnen ---------- */
// dir: down | left | up ; pose: 0 Stand, 1 Schritt A, 2 Schritt B, 3 Atmen
function drawChar(g, L, dir, pose) {
  const { r, p } = pen(g);
  const b = pose === 0 ? 0 : 1, side = dir === 'left', up = dir === 'up';
  // Beine
  if (!side) {
    const leg = (x, lift, inner) => { r(x, 18, 2, 3 - lift, L.pants); r(inner, 18, 1, 3 - lift, L.pantsS); r(x, 21 - lift, 2, 2, L.shoe); r(x, 22 - lift, 2, 1, L.shoeS); };
    leg(5, pose === 2 ? 1 : 0, 6); leg(9, pose === 1 ? 1 : 0, 9); r(5, 18, 6, 1, L.pants);
  } else if (pose === 1 || pose === 2) {
    r(9, 18, 2, 3, L.pantsS); r(9, 21, 3, 2, L.shoeS); r(5, 18, 2, 3, L.pants); r(4, 21, 3, 1, L.shoe); r(4, 22, 3, 1, L.shoeS); r(6, 18, 4, 1, L.pants);
  } else { r(6, 18, 4, 3, L.pants); r(9, 18, 1, 3, L.pantsS); r(5, 21, 5, 1, L.shoe); r(5, 22, 5, 1, L.shoeS); }
  if (L.skirt) { if (side) r(5, 17 + b, 6, 3, L.skirt); else r(4, 17 + b, 8, 3, L.skirt); }
  // Oberkörper und Arme
  const ty = 12 + b;
  if (!side) {
    r(4, ty, 8, 6, L.shirt); r(4, ty + 5, 8, 1, L.shirtS); r(11, ty, 1, 5, L.shirtS); r(5, ty, 6, 1, L.shirtL);
    if (!up) { p(7, ty, L.skinS); p(8, ty, L.skinS); if (L.chest) L.chest(r, p, ty); }
    if (L.belt) r(4, ty + 4, 8, 1, L.belt);
    const arm = (x, len) => { r(x, ty, 1, 2, L.shirtS); r(x, ty + 2, 1, len - 2, L.skin); };
    arm(3, pose === 1 ? 5 : pose === 2 ? 3 : 4); arm(12, pose === 2 ? 5 : pose === 1 ? 3 : 4);
  } else {
    r(5, ty, 6, 6, L.shirt); r(10, ty, 1, 6, L.shirtS); r(5, ty + 5, 6, 1, L.shirtS); r(5, ty, 5, 1, L.shirtL);
    if (L.belt) r(5, ty + 4, 6, 1, L.belt);
    const ax = pose === 1 ? 5 : pose === 2 ? 9 : 7;
    r(ax, ty + 1, 2, 2, L.shirtS); r(ax, ty + 3, 2, 2, L.skin); if (pose === 1) p(4, ty + 4, L.skin);
  }
  // Kopf
  const hy = b;
  [[2, 5, 10], [3, 4, 11], [4, 3, 12], [5, 3, 12], [6, 3, 12], [7, 3, 12], [8, 3, 12], [9, 3, 12], [10, 4, 11], [11, 5, 10]]
    .forEach(([y, a, c]) => r(a, y + hy, c - a + 1, 1, L.skin));
  if (dir === 'down') {
    r(12, 5 + hy, 1, 5, L.skinS); r(5, 11 + hy, 6, 1, L.skinS);
    p(5, 7 + hy, EYE); p(5, 8 + hy, EYE); p(10, 7 + hy, EYE); p(10, 8 + hy, EYE);
    p(4, 9 + hy, BLUSH); p(11, 9 + hy, BLUSH); p(7, 10 + hy, L.skinS); p(8, 10 + hy, L.skinS);
  } else if (side) {
    r(5, 11 + hy, 5, 1, L.skinS); p(4, 7 + hy, EYE); p(4, 8 + hy, EYE); p(5, 9 + hy, BLUSH); p(2, 8 + hy, L.skin); p(3, 10 + hy, L.skinS);
  } else r(5, 11 + hy, 6, 1, L.skinS);
  HAIR[L.style](r, p, L, dir, hy);
}

// Spritesheet 64x96: Zeilen unten/links/rechts/oben, Spalten Pose 0–3
A.charSheet = function (L) {
  const { c, g } = cv(64, 96);
  ['down', 'left', 'right', 'up'].forEach((d, ri) => {
    for (let f = 0; f < 4; f++) {
      const t = cv(16, 24); drawChar(t.g, L, d === 'right' ? 'left' : d, f); outline(t.g, 0, 0, 16, 24, OUT);
      if (d === 'right') { g.save(); g.translate(f * 16 + 16, ri * 24); g.scale(-1, 1); g.drawImage(t.c, 0, 0); g.restore(); }
      else g.drawImage(t.c, f * 16, ri * 24);
    }
  });
  return c;
};
A.getChar = k => A.chars[k] || (A.chars[k] = A.charSheet(LOOKS[k]));

/* ---------- Kater (16x14, Zeile 0 links, Zeile 1 rechts) ---------- */
function drawCat(g, f) {
  const { r, p } = pen(g), O = '#ec9a4e', D = '#bc6a2f', L = '#f8cf96', W = '#fff3e2';
  if (f < 3) {
    r(5, 6, 8, 4, O); r(6, 5, 6, 1, O); p(7, 6, D); p(9, 6, D); p(11, 6, D); r(6, 9, 6, 1, L);
    r(1, 3, 5, 5, O); p(1, 2, O); p(4, 2, O); p(2, 3, D); p(2, 5, EYE); p(1, 6, W); p(2, 7, W); p(1, 5, '#e87c8a');
    r(13, 3, 1, 4, O); p(14, 2, O); p(13, 2, D);
    (f === 0 ? [5, 7, 10, 12] : f === 1 ? [4, 7, 11, 12] : [5, 6, 10, 13]).forEach(x => r(x, 10, 1, 2, x % 2 ? O : D));
  } else {
    r(6, 5, 6, 6, O); r(5, 8, 8, 3, O); r(6, 8, 3, 3, L); r(2, 2, 5, 5, O); p(2, 1, O); p(5, 1, O); p(3, 4, EYE); p(2, 6, W); p(2, 5, '#e87c8a');
    r(12, 10, 3, 1, O); p(14, 9, O); p(8, 5, D); p(10, 6, D);
  }
}
A.catSheet = function () {
  const { c, g } = cv(64, 28);
  for (let f = 0; f < 4; f++) {
    const t = cv(16, 14); drawCat(t.g, f); outline(t.g, 0, 0, 16, 14, '#3a2418');
    g.drawImage(t.c, f * 16, 0); g.save(); g.translate(f * 16 + 16, 14); g.scale(-1, 1); g.drawImage(t.c, 0, 0); g.restore();
  }
  return c;
};
})();
