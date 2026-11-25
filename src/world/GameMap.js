// lexiGÓ – eine geladene Karte: Raster, Legende, Abfragen und Zeichnen.
// Enthält keine Spiellogik für Türen, Objekte oder Wörter (kommt in Phase 2).

class GameMap {
  constructor(data) {
    this.name = data.name;
    this.tile = data.kachelgroesse;
    this.breite = data.breite;
    this.hoehe = data.hoehe;
    this.raster = data.raster;
    this.legende = data.legende;
    this.start = data.start;
  }

  get widthPx() { return this.breite * this.tile; }
  get heightPx() { return this.hoehe * this.tile; }

  // Außerhalb der Karte ist nichts begehbar.
  istBegehbar(spalte, zeile) {
    if (spalte < 0 || zeile < 0 || spalte >= this.breite || zeile >= this.hoehe) return false;
    return this.legende[this.raster[zeile][spalte]].begehbar === true;
  }

  // Zeichnet alle Kacheln einmalig in EINE Textur. Ein einziges Bild hat keine
  // Kachelnähte und flimmert daher beim Scrollen nicht.
  baueTextur(scene, key) {
    if (scene.textures.exists(key)) scene.textures.remove(key);
    const farben = {};
    for (const id of Object.keys(this.legende)) {
      farben[id] = Phaser.Display.Color.HexStringToColor(this.legende[id].farbe).color;
    }
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    for (let z = 0; z < this.hoehe; z++) {
      for (let s = 0; s < this.breite; s++) {
        g.fillStyle(farben[this.raster[z][s]], 1);
        g.fillRect(s * this.tile, z * this.tile, this.tile, this.tile);
      }
    }
    g.generateTexture(key, this.widthPx, this.heightPx);
    g.destroy();
  }
}
