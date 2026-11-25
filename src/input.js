/* =====================================================================
   LX.Input
   ===================================================================== */
(function () {
/* ---------- Eingabe: liefert nur eine Richtung ---------- */
const I = LX.Input = {
  touch: { x: 0, y: 0 },
  isTouch() { return (navigator.maxTouchPoints || 0) > 0 || 'ontouchstart' in window || (window.matchMedia && matchMedia('(pointer: coarse)').matches); },
  vector(k) {
    let x = 0, y = 0;
    if (k) { if (k.A.isDown || k.LEFT.isDown) x -= 1; if (k.D.isDown || k.RIGHT.isDown) x += 1; if (k.W.isDown || k.UP.isDown) y -= 1; if (k.S.isDown || k.DOWN.isDown) y += 1; }
    if (x || y) { const l = Math.hypot(x, y); return { x: x / l, y: y / l }; }   // diagonal nicht schneller
    return { x: this.touch.x, y: this.touch.y };
  },
  initTouch(onAction) {
    const stick = document.getElementById('stick'), knob = document.getElementById('knob'), ab = document.getElementById('abtn'), RAD = 46;
    let id = null;
    const upd = e => { const b = stick.getBoundingClientRect(); let dx = e.clientX - (b.left + b.width / 2), dy = e.clientY - (b.top + b.height / 2); const l = Math.hypot(dx, dy);
      if (l > RAD) { dx = dx / l * RAD; dy = dy / l * RAD; } knob.style.transform = `translate(${dx}px,${dy}px)`;
      let vx = dx / RAD, vy = dy / RAD; if (Math.hypot(vx, vy) < 0.18) { vx = 0; vy = 0; } this.touch = { x: vx, y: vy }; };
    const end = e => { if (e.pointerId !== id) return; id = null; this.touch = { x: 0, y: 0 }; knob.style.transform = ''; };
    stick.addEventListener('pointerdown', e => { e.preventDefault(); id = e.pointerId; try { stick.setPointerCapture(id); } catch (_) {} upd(e); });
    stick.addEventListener('pointermove', e => { if (e.pointerId === id) upd(e); });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => stick.addEventListener(ev, end));
    ab.addEventListener('pointerdown', e => { e.preventDefault(); ab.classList.add('down'); onAction(); });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => ab.addEventListener(ev, () => ab.classList.remove('down')));
  }
};
})();
