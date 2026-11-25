/* =====================================================================
   LX.Content – alle Inhalte als Daten (kein Spielcode).
   Koordinaten in Kacheln (16 px). Objekte: x = Mitte, y = Unterkante.
   [[…]] markiert Spanisch, {name} = Name der Figur, {o|a} = Endung Pedro|Sofía.
   ===================================================================== */
window.LX = window.LX || {};
LX.Content = {
  version: '1.2',
  village: 'Villapalabra',
  player: { speed: 88 },
  spawn: { x: 26.5, y: 26.2, dir: 'down' },
  map: {
    w: 52, h: 40, tile: 16,
    // Bodenflächen [x, y, Breite, Höhe] in Kacheln, in dieser Reihenfolge gemalt
    ground: [
      { t: 'plaza',  r: [19, 15, 15, 12], round: 2 },   // Dorfplatz
      { t: 'plaza',  r: [21, 9, 11, 2] },               // Vorplatz Dojo
      { t: 'plaza',  r: [25, 11, 3, 4] },               // Weg zum Dojo
      { t: 'path',   r: [4, 20, 15, 3] },               // Westweg
      { t: 'path',   r: [4, 5, 3, 15] },                // zum Tor Unidad 1
      { t: 'path',   r: [11, 12, 2, 8] },               // Hausweg Rosa
      { t: 'path',   r: [34, 20, 4, 3] },               // Ostweg
      { t: 'market', r: [38, 13, 12, 17], round: 1 },   // Markt
      { t: 'path',   r: [36, 11, 2, 9] },               // Hausweg Nordost
      { t: 'path',   r: [45, 6, 3, 7] },                // zum Tor Unidad 2
      { t: 'path',   r: [25, 27, 3, 9] },               // Südweg
      { t: 'path',   r: [6, 34, 30, 2] },               // Verbindungsweg unten
      { t: 'water',  r: [11, 28, 8, 5] }                // Teich
    ],
    beds: [[14, 5, 5, 3], [9, 12, 2, 1], [13, 12, 2, 1]],   // Blumenbeete
    garlands: [[20.5, 18.6, 32.5, 18.6], [20.5, 24.6, 32.5, 24.6]] // Papierfähnchen zwischen Laternen
  },

  intro: {
    name: 'Villapalabra',
    pages: [
      'Ein warmer Morgen in [[Villapalabra]].',
      '{name} möchte etwas sagen … doch kein einziges Wort kommt heraus.',
      'Jemand hat {name} die Worte gestohlen. Vielleicht wissen die Leute im Dorf mehr.',
      '{tip}'
    ]
  },
  tips: {
    keys: 'Tipp: Laufen mit WASD oder den Pfeiltasten. Mit E oder Enter sprichst du mit anderen. Esc öffnet das Menü.',
    touch: 'Tipp: Mit dem Joystick links läufst du. Mit dem E-Knopf rechts sprichst du mit anderen.'
  },

  areas: [
    { name: 'Dorfplatz', r: [18, 14, 17, 14] },
    { name: 'Mercado', r: [37, 12, 14, 19] },
    { name: 'Dojo', r: [19, 1, 15, 13] },
    { name: 'Teich', r: [8, 26, 14, 8] },
    { name: 'Weg zu Unidad 1', r: [2, 1, 7, 19] },
    { name: 'Rosas Garten', r: [9, 4, 10, 12] },
    { name: 'Weg zu Unidad 2', r: [43, 1, 7, 11] },
    { name: 'Weg zu Módulo 1', r: [23, 28, 8, 12] }
  ],
  defaultArea: 'Dorfrand',


  // Rückkehrpunkt auf der Hub-Map, wenn ein Lernraum verlassen wird
  returns: { raum_b1_u1_acercate: { x: 5.5, y: 6.5, dir: 'down', name: 'Weg zu Unidad 1' } },

  /* Lernräume. Welche Wörter es gibt, steht im JSON-Block #lx-lernstoff.
     Hier steht nur, WO etwas im Raum steht (Darstellung), verknüpft über Wort-IDs. */
  rooms: {
    raum_b1_u1_acercate: {
      abschnitt: 'b1_u1_acercate', w: 26, h: 16, wall: 4, floor: 'wood',
      spawn: { x: 13, y: 13.9, dir: 'up' },
      exit: { x: 13, name: 'Zurück zum Dorf' },
      windows: [{ x: 3.5, v: 0 }, { x: 7.5, v: 1 }, { x: 11.5, v: 2 }],   // Morgen, Nachmittag, Nacht
      sign: { x: 18.5, text: '¡ACÉRCATE!' },
      rug: [15, 7, 10, 7],
      doors: [{ x: 16, abschnitt: 'b1_u1_a' }, { x: 21, abschnitt: 'b1_u1_b' }],
      objects: [
        { k: 'plant', x: 1.6, y: 5.4 }, { k: 'plant', x: 24.4, y: 5.4 }, { k: 'plant', x: 1.6, y: 14.6 }, { k: 'plant', x: 24.4, y: 14.6 },
        { k: 'table', x: 5.6, y: 6.6 }, { k: 'bed', x: 13.7, y: 6.4 }, { k: 'coatrack', x: 3.2, y: 12.2 }, { k: 'bench', x: 2.6, y: 9.4 }
      ],
      // Monster im Raum (Position in Kacheln = Standpunkt der Füße; aktiv nur, wenn im Lernstoff "implementiert")
      monsters: [
        { id: 'mon_holamander', stufe: 1, x: 8.5, y: 10, scale: 0.6,
          texte: {
            gesperrt: ['Graue Fäden halten das Wesen fest. Es kann sich kaum bewegen.',
                       'Du hast {count} von {min} Wörtern entdeckt. Es fehlen noch {fehlt}.'],
            bereit: ['Holamander wartet auf dich.']
          } }
      ],
      // Personen, die ein Wort darstellen (icon = Bild in der Sprechblase)
      vocab: [
        { id: 'vo_buenos_dias',   word: 'w_buenos_dias',   look: 'r_manana',  x: 3.5,  y: 5.9,  dir: 'down',  icon: 'sun' },
        { id: 'vo_buenas_tardes', word: 'w_buenas_tardes', look: 'r_tarde',   x: 7.5,  y: 5.9,  dir: 'down',  icon: 'sunset' },
        { id: 'vo_buenas_noches', word: 'w_buenas_noches', look: 'r_noche',   x: 11.5, y: 5.9,  dir: 'down',  icon: 'moon' },
        { id: 'vo_hola',          word: 'w_hola',          look: 'r_hola',    x: 10.2, y: 13.3, dir: 'down',  icon: 'wave' },
        { id: 'vo_adios',         word: 'w_adios',         look: 'r_adios',   x: 16,   y: 13.7, dir: 'down',  icon: 'bye' },
        { id: 'vo_hasta_luego',   word: 'w_hasta_luego',   look: 'r_luego',   x: 5.2,  y: 11.6, dir: 'right', icon: 'later' },
        { id: 'vo_que_tal',       word: 'w_que_tal',       look: 'r_quetal',  x: 19.5, y: 10.6, dir: 'down',  icon: 'q' },
        { id: 'vo_muy_bien',      word: 'w_muy_bien',      look: 'r_muybien', x: 17,   y: 9.1,  dir: 'right', icon: 'great' },
        { id: 'vo_bien',          word: 'w_bien',          look: 'r_bien',    x: 22,   y: 9.1,  dir: 'left',  icon: 'good' },
        { id: 'vo_regular',       word: 'w_regular',       look: 'r_regular', x: 17,   y: 12.4, dir: 'right', icon: 'meh' },
        { id: 'vo_mal',           word: 'w_mal',           look: 'r_mal',     x: 22,   y: 12.4, dir: 'left',  icon: 'bad' }
      ]
    }
  },

  objects: [
    { k: 'dojo', x: 26.5, y: 9, talk: { name: 'Dojo', at: [26.5, 9.7], r: 22, bubble: [26.5, 6.6],
      pages: ['Über der Tür glänzt in goldenen Buchstaben: [[DOJO]].', 'Hier wirst du später deine Wörter trainieren.'] } },
    { k: 'house', x: 12, y: 12, v: 0, talk: { name: 'Rosas Haus', at: [12, 12.6], r: 18, bubble: [12, 10.4],
      pages: ['Die Tür ist verschlossen. Drinnen duftet es nach [[café]].'] } },
    { k: 'house', x: 37, y: 11, v: 1, talk: { name: 'Haustür', at: [37, 11.6], r: 18, bubble: [37, 9.4],
      pages: ['Niemand öffnet. An der Tür hängt ein Zettel, doch die Wörter darauf sind verschwunden.'] } },
    { k: 'house', x: 7, y: 34, v: 2, talk: { name: 'Haustür', at: [7, 34.6], r: 18, bubble: [7, 32.4],
      pages: ['Die Tür ist verschlossen.'] } },
    { k: 'house', x: 36, y: 34, v: 3, talk: { name: 'Haustür', at: [36, 34.6], r: 18, bubble: [36, 32.4],
      pages: ['Hinter der Tür miaut jemand leise. Ach nein, das kam von draußen.'] } },
    { k: 'fountain', x: 26.5, y: 22.5, talk: { name: 'Brunnen', at: [26.5, 21.4], r: 36, bubble: [26.5, 19.2],
      pages: ['Das Wasser plätschert ruhig.', 'Auf dem Brunnenrand steht: [[Las palabras son como el agua.]] Wörter sind wie Wasser.'] } },
    { k: 'stall', x: 41, y: 18, v: 0 },
    { k: 'stall', x: 46.5, y: 18, v: 1, talk: { name: 'Blumenstand', at: [46.5, 18.7], r: 20, bubble: [46.5, 15.7],
      pages: ['Rote [[rosas]], gelbe [[girasoles]] … aber gerade ist niemand da, der sie verkauft.'] } },
    { k: 'stall', x: 43.75, y: 26, v: 2, talk: { name: 'Brotstand', at: [43.75, 26.7], r: 20, bubble: [43.75, 23.7],
      pages: ['Es duftet nach frischem [[pan]]. Der Bäcker macht wohl gerade Pause.'] } },
    { k: 'gate', x: 5.5, y: 5, v: 'u1', label: 'UNIDAD 1', open: true, room: 'raum_b1_u1_acercate', talk: { name: 'Tor · Unidad 1', at: [5.5, 5.9], r: 20, bubble: [5.5, 2.8],
      pages: ['Unidad 1 · [[¿Qué tal?]]', 'Geh durch das Tor, um den Bereich [[¡Acércate!]] zu betreten.'] } },
    { k: 'gate', x: 46.5, y: 6, v: 'u2', label: 'UNIDAD 2', talk: { name: 'Tor · Unidad 2', at: [46.5, 6.7], r: 22, bubble: [46.5, 3.8],
      pages: ['Der Weg zu Unidad 2.', 'Dieser Bereich wird bald freigeschaltet.'] } },
    { k: 'gate', x: 26.5, y: 40, v: 'm1', label: 'MÓDULO 1', talk: { name: 'Tor · Módulo 1', at: [26.5, 35.6], r: 24, bubble: [26.5, 34.3],
      pages: ['Dieser Bereich wird bald freigeschaltet.'] } },
    { k: 'signpost', x: 28.9, y: 27.4, talk: { name: 'Wegweiser', at: [28.9, 27.9], r: 18, bubble: [28.9, 25.6],
      pages: ['↑ Dojo   ← Unidad 1   → Mercado   ↓ Módulo 1'] } },
    { k: 'marketsign', x: 38.7, y: 19.8, talk: { name: 'Schild', at: [38.7, 20.5], r: 18, bubble: [38.7, 17.7],
      pages: ['[[Mercado]] heißt Markt. Hier gibt es bald viel zu entdecken.'] } },

    { k: 'bench', x: 22.5, y: 17.5 }, { k: 'bench', x: 30.5, y: 17.5 },
    { k: 'bench', x: 22.5, y: 25.6 }, { k: 'bench', x: 30.5, y: 25.6 },
    { k: 'lantern', x: 20.5, y: 18.6 }, { k: 'lantern', x: 32.5, y: 18.6 },
    { k: 'lantern', x: 20.5, y: 24.6 }, { k: 'lantern', x: 32.5, y: 24.6 },
    { k: 'pot', x: 24.1, y: 15.9 }, { k: 'pot', x: 28.9, y: 15.9 },
    { k: 'pot', x: 35.6, y: 11.9 }, { k: 'pot', x: 38.4, y: 11.9 },
    { k: 'cypress', x: 20.3, y: 10.8 }, { k: 'cypress', x: 32.7, y: 10.8 },
    { k: 'tree', v: 'olive', x: 17, y: 11.5 }, { k: 'tree', v: 'olive', x: 15.5, y: 17.5 },
    { k: 'tree', v: 'orange', x: 8.5, y: 17.5 }, { k: 'tree', v: 'orange', x: 42, y: 10 },
    { k: 'tree', v: 'olive', x: 30.5, y: 31.5 }, { k: 'tree', v: 'olive', x: 22, y: 31.5 },
    { k: 'tree', v: 'orange', x: 14, y: 25.5 }, { k: 'tree', v: 'olive', x: 44, y: 34.5 },
    { k: 'tree', v: 'orange', x: 48.5, y: 36 }, { k: 'tree', v: 'orange', x: 3.6, y: 27 },
    { k: 'tree', v: 'round', x: 20, y: 5.5 }, { k: 'tree', v: 'round', x: 33.5, y: 5.2 },
    { k: 'bush', x: 19.8, y: 16.3, v: 1 }, { k: 'bush', x: 33.2, y: 16.3, v: 1 },
    { k: 'bush', x: 19.8, y: 26.9 }, { k: 'bush', x: 33.2, y: 26.9 },
    { k: 'bush', x: 14.6, y: 13.3, v: 1 }, { k: 'bush', x: 10.5, y: 27.6 },
    { k: 'bush', x: 23.6, y: 28.2, v: 1 }, { k: 'bush', x: 29.4, y: 28.2 },
    { k: 'fence', x: 14.5, y: 8.7 }, { k: 'fence', x: 15.5, y: 8.7 }, { k: 'fence', x: 16.5, y: 8.7 },
    { k: 'fence', x: 17.5, y: 8.7 }, { k: 'fence', x: 18.5, y: 8.7 },
    { k: 'crate', x: 39.3, y: 15.2 }, { k: 'crate', x: 48.6, y: 15.2 }, { k: 'crate', x: 48.6, y: 22.6 },
    { k: 'crate', x: 39.4, y: 28.8 }, { k: 'barrel', x: 48.6, y: 28.8 }, { k: 'barrel', x: 47.6, y: 29 },
    { k: 'reeds', x: 11.3, y: 28.6 }, { k: 'reeds', x: 18.6, y: 33.1 }, { k: 'reeds', x: 12.2, y: 33.2 },
    { k: 'rock', x: 19.4, y: 28.4 }, { k: 'rock', x: 9.6, y: 23.6 }
  ],

  npcs: [
    { id: 'carmen', name: 'Señora Carmen', look: 'carmen', x: 41, y: 16.75, dir: 'down', noBody: true, noShadow: true, fixed: true,
      talk: { at: [41, 18.75], r: 22 },
      pages: ['[[¡Hola, guap{o|a}!]] Willkommen auf unserem Markt!',
              'Sonst rufe ich hier laut [[naranjas]], [[tomates]] und [[pimientos]] aus. Heute fällt mir das Rufen seltsam schwer.',
              'Komm bald wieder, {name}. Dann gibt es hier mehr zu entdecken.'] },
    { id: 'lucia', name: 'Maestra Lucía', look: 'lucia', x: 29.6, y: 10.7, dir: 'down', looks: ['down', 'left', 'down', 'right'],
      pages: ['[[¡Bienvenid{o|a}, {name}!]]', 'Dies ist das Dojo. Hier wirst du später deine Wörter trainieren.',
              'Ein Wort, das man oft übt, kann einem niemand so leicht stehlen.'] },
    { id: 'tomas', name: 'Abuelo Tomás', look: 'tomas', x: 22.5, y: 17.4, dir: 'down', noBody: true, noShadow: true, fixed: true,
      talk: { at: [22.5, 18.3], r: 20 },
      pages: ['Ah, {name}. Setz dich ruhig einen Moment zu mir.',
              'Früher war dieser Platz voller Stimmen. Dann kamen die grauen Herren mit ihren Aktenkoffern …',
              'Seitdem ist es so still in Villapalabra. Man sagt, sie heften Wörter ab wie alte Akten.'] },
    { id: 'lola', name: 'Lola', look: 'lola', x: 23.5, y: 18.9, speed: 34,
      path: [[23.5, 18.9], [29.5, 18.9], [29.5, 24.1], [23.5, 24.1]],
      pages: ['[[¡Hola!]] Ich bin Lola. Ich laufe hundert Runden um den Brunnen!',
              'Hast du die Männer in Grau gesehen? Einer hatte eine Rose in der Hand. Komisch, oder?'] },
    { id: 'elena', name: 'Elena, die Briefträgerin', look: 'elena', x: 8, y: 21.6, speed: 26, pause: 1600,
      path: [[8, 21.6], [17.5, 21.6]],
      pages: ['Puh, so viele Briefe heute.', 'Aber schau mal: Alle Seiten sind leer. Kein einziges Wort steht mehr darauf.'] },
    { id: 'paco', name: 'Señor Paco', look: 'paco', x: 19.8, y: 31, dir: 'left', looks: ['left', 'left', 'down'],
      pages: ['Psst … die Fische beißen heute nicht.', 'Vielleicht haben auch sie ihre Wörter verloren. [[¡Qué día!]]'] },
    { id: 'rosa', name: 'Rosa', look: 'rosa', x: 9.8, y: 14, dir: 'up', looks: ['up', 'up', 'down', 'right'],
      pages: ['[[¡Buenos días!]] Meine Blumen brauchen jeden Tag ein bisschen Wasser.',
              'Mit Wörtern ist es genauso, sagt meine Oma: Man muss sie pflegen, sonst welken sie.'] },
    { id: 'diego', name: 'Diego', look: 'diego', x: 7.7, y: 6.6, dir: 'left', looks: ['left', 'down'],
      pages: ['Hinter diesem Tor beginnt der Weg zu Unidad 1.',
              'Der Schleier aus Buchstaben ist fort! Geh ruhig hinein, dort warten die ersten Wörter auf dich.'] },
    { id: 'gato', name: 'Gato', look: 'cat', x: 29, y: 34.9, speed: 14, pause: 3200, path: [[29, 34.9], [34, 34.9]],
      pages: ['[[¡Miau!]]', 'Der Kater schnurrt zufrieden. Wenigstens er hat seine Stimme noch.'] }
  ]
};
