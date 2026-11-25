// lexiGÓ – Bewegungslogik, unabhängig von der Eingabequelle (Tastatur, später Touch).

// Normiert eine Richtung auf Länge höchstens 1, damit Diagonalen nicht schneller sind.
function normalizeDirection(dir) {
  const len = Math.hypot(dir.x, dir.y);
  if (len === 0) return { x: 0, y: 0 };
  const scale = len > 1 ? 1 / len : 1;
  return { x: dir.x * scale, y: dir.y * scale };
}

// Berechnet die neue Position. speed in Pixeln pro Sekunde, deltaMs aus der Szene.
// bounds = { minX, maxX, minY, maxY } hält die Figur im Spielfeld.
function stepPosition(pos, dir, speed, deltaMs, bounds) {
  const n = normalizeDirection(dir);
  const dist = speed * (deltaMs / 1000);
  return {
    x: Phaser.Math.Clamp(pos.x + n.x * dist, bounds.minX, bounds.maxX),
    y: Phaser.Math.Clamp(pos.y + n.y * dist, bounds.minY, bounds.maxY)
  };
}
