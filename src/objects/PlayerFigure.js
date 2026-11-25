// lexiGÓ – Platzhalterfigur: farbiges Rechteck mit Richtungspunkt, im Code gezeichnet.

const FIGURE_SIZE = 24;

class PlayerFigure {
  constructor(scene, x, y, farbe) {
    this.container = scene.add.container(x, y);

    const body = scene.add.rectangle(0, 0, FIGURE_SIZE, FIGURE_SIZE, farbe)
      .setStrokeStyle(2, 0x000000);
    // Kleines "Gesicht": zwei Augen, die in Blickrichtung wandern.
    this.eyeL = scene.add.rectangle(0, 0, 4, 4, 0xffffff);
    this.eyeR = scene.add.rectangle(0, 0, 4, 4, 0xffffff);

    this.container.add([body, this.eyeL, this.eyeR]);
    this.face({ x: 0, y: 1 });
  }

  get x() { return this.container.x; }
  get y() { return this.container.y; }

  setPosition(x, y) {
    this.container.setPosition(x, y);
  }

  // Augen zeigen in die zuletzt gelaufene Richtung.
  face(dir) {
    if (dir.x === 0 && dir.y === 0) return;
    const ox = Math.sign(dir.x) * 5;
    const oy = Math.sign(dir.y) * 5;
    // Abstand der Augen quer zur Blickrichtung
    const px = dir.y !== 0 ? 4 : 0;
    const py = dir.y === 0 ? 4 : 0;
    this.eyeL.setPosition(ox - px, oy - py);
    this.eyeR.setPosition(ox + px, oy + py);
  }
}
