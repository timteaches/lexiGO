// lexiGÓ – erste Szene: einfarbiger Hintergrund, Titel und bewegliche Platzhalterfigur.

const PLAYER_SPEED = 96; // Pixel pro Sekunde (3 Kacheln/s)

class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    const { width, height } = this.scale;

    this.add.text(width / 2, 40, 'lexiGÓ', {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '32px',
      fontStyle: 'bold',
      color: '#ffec27'
    }).setOrigin(0.5);

    this.player = new PlayerFigure(this, width / 2, height / 2, getFigurFarbe(PlayerState));

    // Namensschild aus den Spielerdaten (kein fester Name im Code).
    this.nameLabel = this.add.text(0, 0, PlayerState.name, {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '10px',
      color: '#ffffff'
    }).setOrigin(0.5, 1);

    this.inputSource = new KeyboardInput(this);

    const half = FIGURE_SIZE / 2;
    this.bounds = { minX: half, maxX: width - half, minY: half, maxY: height - half };
    this.updateLabel();
  }

  update(time, delta) {
    const dir = this.inputSource.getDirection();
    const next = stepPosition({ x: this.player.x, y: this.player.y }, dir, PLAYER_SPEED, delta, this.bounds);
    this.player.setPosition(next.x, next.y);
    this.player.face(dir);
    this.updateLabel();
  }

  updateLabel() {
    this.nameLabel.setPosition(this.player.x, this.player.y - FIGURE_SIZE / 2 - 2);
  }
}
