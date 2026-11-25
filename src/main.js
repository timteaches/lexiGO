// lexiGÓ – Einstiegspunkt: Phaser-Konfiguration und Spielstart.

// Logische Auflösung (16:9) und Kachelgröße.
// Hinweis: 360 / 32 = 11,25 Kacheln Höhe – Karten später 11 Kacheln hoch oder Kamera scrollt.
const GAME_WIDTH = 640;
const GAME_HEIGHT = 360;
const TILE_SIZE = 32;

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#1d2b53',
  pixelArt: true,      // kein Weichzeichnen beim Skalieren
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [TitleScene]
};

const game = new Phaser.Game(config);
