// lexiGÓ – erste Szene: einfarbiger Hintergrund mit dem Spieltitel.

class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    const { width, height } = this.scale;

    this.add.text(width / 2, height / 2, 'lexiGÓ', {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '64px',
      fontStyle: 'bold',
      color: '#ffec27'
    }).setOrigin(0.5);
  }
}
