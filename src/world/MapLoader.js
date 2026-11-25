// lexiGÓ – Karten-Lader: lädt content/maps/<name>.json, prüft sie und liefert eine GameMap.
// Zwei Schritte, passend zum Phaser-Ablauf:
//   preload(): MapLoader.queue(this, 'testwelt');
//   create():  const map = MapLoader.get(this, 'testwelt');   // wirft bei Fehlern eine Error-Meldung

const MapLoader = {
  pfad(name) {
    return 'content/maps/' + name + '.json?v=' + GAME_VERSION;
  },

  key(name) {
    return 'map:' + name;
  },

  queue(scene, name) {
    const key = MapLoader.key(name);
    if (!scene.cache.json.exists(key)) scene.load.json(key, MapLoader.pfad(name));
  },

  get(scene, name) {
    const data = scene.cache.json.get(MapLoader.key(name));
    if (!data) {
      throw new Error('Karte "' + name + '" konnte nicht geladen werden (' + MapLoader.pfad(name) + ').');
    }
    MapLoader.pruefe(data, name);
    return new GameMap(data);
  },

  // Prüft die Datei und nennt im Fehlerfall genau, was nicht stimmt.
  pruefe(d, name) {
    const fehler = (text) => { throw new Error('Karte "' + name + '": ' + text); };

    if (d.kachelgroesse !== TILE_SIZE) fehler('kachelgroesse ist ' + d.kachelgroesse + ', erwartet ' + TILE_SIZE + '.');
    if (!Number.isInteger(d.breite) || !Number.isInteger(d.hoehe) || d.breite < 1 || d.hoehe < 1) {
      fehler('breite und hoehe müssen ganze Zahlen ab 1 sein.');
    }
    if (!d.legende || typeof d.legende !== 'object') fehler('legende fehlt.');
    for (const id of Object.keys(d.legende)) {
      const l = d.legende[id];
      if (typeof l.farbe !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(l.farbe)) fehler('legende ' + id + ': farbe muss wie "#4f9d4f" aussehen.');
      if (typeof l.begehbar !== 'boolean') fehler('legende ' + id + ': begehbar muss true oder false sein.');
    }
    if (!Array.isArray(d.raster) || d.raster.length !== d.hoehe) {
      fehler('raster hat ' + (d.raster ? d.raster.length : 0) + ' Zeilen, erwartet ' + d.hoehe + '.');
    }
    d.raster.forEach((zeile, z) => {
      if (!Array.isArray(zeile) || zeile.length !== d.breite) {
        fehler('Zeile ' + z + ' hat ' + (zeile ? zeile.length : 0) + ' Kacheln, erwartet ' + d.breite + '.');
      }
      zeile.forEach((id, s) => {
        if (!(id in d.legende)) fehler('Kachel (' + s + ', ' + z + ') hat die ID ' + id + ', die nicht in der legende steht.');
      });
    });
    const st = d.start;
    if (!st || !Number.isInteger(st.x) || !Number.isInteger(st.y)) fehler('start braucht ganze Zahlen x und y (in Kacheln).');
    if (st.x < 0 || st.y < 0 || st.x >= d.breite || st.y >= d.hoehe) fehler('start liegt außerhalb der Karte.');
    if (!d.legende[d.raster[st.y][st.x]].begehbar) fehler('start liegt auf einer nicht begehbaren Kachel.');
  }
};
