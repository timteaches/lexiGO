// lexiGÓ – Einstiegspunkt: Phaser-Konfiguration und Spielstart.

// Logische Auflösung (16:9) und Kachelgröße.
// Hinweis: 360 / 32 = 11,25 Kacheln Höhe – Karten später 11 Kacheln hoch oder Kamera scrollt.
const GAME_WIDTH = 640;
const GAME_HEIGHT = 360;
const TILE_SIZE = 32;

// Versionsstand, unten rechts im Spiel angezeigt (zum Prüfen, ob der neue Stand geladen ist).
const GAME_VERSION = '0.3.0';

// Karte, die beim Start geladen wird (Datei content/maps/<name>.json).
const START_MAP = 'testwelt';

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#1d2b53',
  input: { activePointers: 4 },   // mehrere Finger gleichzeitig (Joystick + Tippen)
  pixelArt: true,      // kein Weichzeichnen beim Skalieren
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [WorldScene]
};

const game = new Phaser.Game(config);

// Nach Drehen des Geräts oder Größenänderung die Spielfläche neu anpassen.
// Safari meldet die neue Größe beim Drehen manchmal verspätet, daher mehrere Versuche.
function passeSpielflaecheAn() {
  [0, 150, 400, 900].forEach((ms) => setTimeout(() => game.scale.refresh(), ms));
}
window.addEventListener('resize', passeSpielflaecheAn);
window.addEventListener('orientationchange', passeSpielflaecheAn);
if (window.visualViewport) window.visualViewport.addEventListener('resize', passeSpielflaecheAn);
