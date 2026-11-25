// lexiGÓ – Weltszene: lädt eine Karte aus content/maps, zeigt sie und lässt die Figur darüber laufen.
// Start mit  this.scene.start('WorldScene', { map: 'kartenname' })  – ohne Angabe gilt START_MAP.

const PLAYER_SPEED = 96; // Pixel pro Sekunde (3 Kacheln/s)

class WorldScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WorldScene' });
  }

  init(data) {
    this.mapName = (data && data.map) || START_MAP;
    this.map = null;
    this.ladefehler = null;
  }

  preload() {
    this.load.on('loaderror', (file) => {
      this.ladefehler = 'Datei nicht gefunden: ' + file.src;
    });
    MapLoader.queue(this, this.mapName);
  }

  create() {
    try {
      this.map = MapLoader.get(this, this.mapName);
    } catch (e) {
      console.error(e);
      this.zeigeFehler(this.ladefehler ? e.message + '\n' + this.ladefehler : e.message);
      return;
    }

    const texKey = 'mapTex:' + this.mapName;
    this.map.baueTextur(this, texKey);
    this.add.image(0, 0, texKey).setOrigin(0, 0);

    const t = this.map.tile;
    const startX = (this.map.start.x + 0.5) * t;
    const startY = (this.map.start.y + 0.5) * t;

    this.player = new PlayerFigure(this, startX, startY, getFigurFarbe(PlayerState));

    // Namensschild aus den Spielerdaten (kein fester Name im Code).
    this.nameLabel = this.add.text(0, 0, PlayerState.name, {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '10px',
      color: '#ffffff'
    }).setOrigin(0.5, 1);
    this.updateLabel();

    // Versionsanzeige bleibt fest am Bildschirm.
    this.versionLabel = this.add.text(this.scale.width - 4, this.scale.height - 4, 'v' + GAME_VERSION, {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '8px',
      color: '#ffffff'
    }).setOrigin(1, 1).setScrollFactor(0).setAlpha(0.7);

    this.inputSource = new KeyboardInput(this);

    // Kamera: sanft folgen, innerhalb der Karte bleiben, Start ohne Anflug.
    const cam = this.cameras.main;
    cam.setBounds(0, 0, this.map.widthPx, this.map.heightPx);
    cam.centerOn(startX, startY);
    cam.startFollow(this.player.container, true, 0.1, 0.1);
  }

  update(time, delta) {
    if (!this.map) return;
    const dir = this.inputSource.getDirection();
    const pos = { x: this.player.x, y: this.player.y };
    moveWithCollision(this.map, pos, dir, PLAYER_SPEED, delta);
    this.player.setPosition(pos.x, pos.y);
    this.player.face(dir);
    this.updateLabel();
  }

  updateLabel() {
    this.nameLabel.setPosition(this.player.x, this.player.y - FIGURE_SIZE / 2 - 2);
  }

  zeigeFehler(text) {
    this.add.text(this.scale.width / 2, this.scale.height / 2, 'Fehler beim Laden der Karte\n\n' + text, {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '12px',
      color: '#ff8080',
      align: 'center',
      wordWrap: { width: this.scale.width - 40 }
    }).setOrigin(0.5);
  }
}
