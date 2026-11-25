/* =====================================================================
   LX.State, LX.Text
   ===================================================================== */
(function () {
/* ---------- Spielerzustand (bleibt in der Sitzung erhalten) ---------- */
const S = LX.State = {
  figur: 'pedro', introSeen: false,
  get name() { return this.figur === 'sofia' ? 'Sofía' : 'Pedro'; },
  load() {
    try { const v = sessionStorage.getItem('lexigo.figur'); if (v === 'pedro' || v === 'sofia') this.figur = v; this.introSeen = sessionStorage.getItem('lexigo.intro') === '1'; } catch (e) {}
    try { const q = new URLSearchParams(location.search).get('figur') || location.hash.slice(1); if (q === 'sofia' || q === 'pedro') this.figur = q; } catch (e) {}
  },
  save() { try { sessionStorage.setItem('lexigo.figur', this.figur); sessionStorage.setItem('lexigo.intro', this.introSeen ? '1' : '0'); } catch (e) {} },
  set(f) { this.figur = f; this.save(); }
};
S.load();

/* ---------- Texte: {name}, {tip} und Genus {o|a} ---------- */
LX.Text = {
  fmt(s) {
    return s.replace(/\{name\}/g, S.name)
      .replace(/\{tip\}/g, LX.Content.tips[LX.UI && LX.UI.isTouch ? 'touch' : 'keys'])
      .replace(/\{([^{}|]*)\|([^{}|]*)\}/g, (m, a, b) => S.figur === 'sofia' ? b : a);
  }
};
})();
