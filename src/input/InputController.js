// lexiGÓ – fasst die Eingabequellen zusammen (Tastatur, Touch-Joystick).
// Die Bewegungslogik bekommt nur eine Richtung und weiß nichts von der Quelle.

class InputController {
  constructor(scene) {
    this.keyboard = new KeyboardInput(scene);
  }

  // Tastatur hat Vorrang, wenn gedrückt; sonst gilt der Joystick (analog, Länge 0 bis 1).
  getDirection() {
    const k = this.keyboard.getDirection();
    if (k.x !== 0 || k.y !== 0) return k;
    return touchJoystick.getDirection();
  }
}
