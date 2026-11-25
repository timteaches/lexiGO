// lexiGÓ – Bewegung mit Kollision gegen nicht begehbare Kacheln.
// Bekommt nur eine Richtung (egal ob Tastatur oder später Touch) und die Karte.

const HITBOX_SIZE = 20;      // Kollisionsbox in px, kleiner als eine Kachel (32)
const CORNER_ASSIST = 6;     // Eckenhilfe: so viele px darf die Figur zur Seite geschoben werden
const MAX_STEP_MS = 50;      // Zeitschritt begrenzen, damit nichts durch Wände springt
const EDGE_EPS = 0.0001;     // rechte/untere Boxkante zählt noch zur vorigen Kachel
const SNAP = 0.001;          // winziger Abstand zur Wand gegen Rundungsfehler

// Überlappt die Box mit Mittelpunkt (cx, cy) eine nicht begehbare Kachel?
function boxBlocked(map, cx, cy) {
  const half = HITBOX_SIZE / 2;
  const t = map.tile;
  const c0 = Math.floor((cx - half) / t);
  const c1 = Math.floor((cx + half - EDGE_EPS) / t);
  const r0 = Math.floor((cy - half) / t);
  const r1 = Math.floor((cy + half - EDGE_EPS) / t);
  for (let r = r0; r <= r1; r++) {
    for (let c = c0; c <= c1; c++) {
      if (!map.istBegehbar(c, r)) return true;
    }
  }
  return false;
}

// Bewegt pos entlang einer Achse ('x' oder 'y') um d. Bei Hindernis: erst Eckenhilfe,
// sonst genau an die Kachelkante setzen. pos wird verändert.
function moveAxis(map, pos, a, d, assist) {
  if (d === 0) return;
  const b = a === 'x' ? 'y' : 'x';
  const half = HITBOX_SIZE / 2;
  const t = map.tile;
  const blocked = (va, vb) => (a === 'x' ? boxBlocked(map, va, vb) : boxBlocked(map, vb, va));
  const target = pos[a] + d;

  if (!blocked(target, pos[b])) { pos[a] = target; return; }

  // Eckenhilfe: Streift die Box nur knapp eine Ecke, seitlich wegschieben statt hängenbleiben.
  if (assist) {
    for (let o = 1; o <= CORNER_ASSIST; o++) {
      for (const s of [-1, 1]) {
        if (!blocked(target, pos[b] + s * o)) {
          const shift = s * Math.min(o, Math.abs(d));
          if (!blocked(pos[a], pos[b] + shift)) { pos[b] += shift; return; }
        }
      }
    }
  }

  // An die Kachelkante setzen: so gleitet die Figur an Wänden entlang.
  if (d > 0) {
    pos[a] = Math.floor((target + half) / t) * t - half - SNAP;
  } else {
    pos[a] = (Math.floor((target - half) / t) + 1) * t + half + SNAP;
  }
}

// Bewegt die Position pos (Mittelpunkt der Figur) und liefert sie zurück.
// dir kommt von der Eingabe, speed in px/s, deltaMs aus der Szene.
function moveWithCollision(map, pos, dir, speed, deltaMs) {
  const dt = Math.min(deltaMs, MAX_STEP_MS) / 1000;
  const n = normalizeDirection(dir);
  // Eckenhilfe nur, wenn die Bewegung (fast) geradeaus geht; gilt auch für den analogen Joystick.
  const ax = Math.abs(n.x), ay = Math.abs(n.y);
  moveAxis(map, pos, 'x', n.x * speed * dt, ay <= ax * 0.25);
  moveAxis(map, pos, 'y', n.y * speed * dt, ax <= ay * 0.25);
  return pos;
}
