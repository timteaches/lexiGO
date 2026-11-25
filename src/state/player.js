// lexiGÓ – Spielerdaten.
// Name und Figur stehen nur hier; Texte im Spiel lesen sie aus PlayerState.

// Wählbare Figuren mit Standardname und Platzhalterfarbe.
const FIGUREN = {
  pedro: { name: 'Pedro', farbe: 0x2f6fdf },
  sofia: { name: 'Sofía', farbe: 0xf28c28 }
};

const PlayerState = (() => {
  const state = {
    name: FIGUREN.pedro.name,
    figur: 'pedro'
  };

  // Test-Umschalter per URL, z. B. index.html?figur=sofia
  const param = new URLSearchParams(window.location.search).get('figur');
  if (param && FIGUREN[param.toLowerCase()]) {
    state.figur = param.toLowerCase();
    state.name = FIGUREN[state.figur].name;
  }

  return state;
})();

function getFigurFarbe(state) {
  return FIGUREN[state.figur].farbe;
}
