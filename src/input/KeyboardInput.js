// lexiGÓ – Tastatureingabe (Pfeiltasten und WASD).
// Liefert nur eine Richtung {x, y} mit Werten -1, 0 oder 1, keine Bewegung.

class KeyboardInput {
  constructor(scene) {
    this.keys = scene.input.keyboard.addKeys({
      up: 'UP', down: 'DOWN', left: 'LEFT', right: 'RIGHT',
      w: 'W', a: 'A', s: 'S', d: 'D'
    });
  }

  getDirection() {
    const k = this.keys;
    const x = (k.right.isDown || k.d.isDown ? 1 : 0) - (k.left.isDown || k.a.isDown ? 1 : 0);
    const y = (k.down.isDown || k.s.isDown ? 1 : 0) - (k.up.isDown || k.w.isDown ? 1 : 0);
    return { x, y };
  }
}
