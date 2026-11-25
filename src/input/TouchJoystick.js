// lexiGÓ – virtueller Joystick (DOM-Element über dem Spiel, fest unten links).
// Liefert wie die Tastatur nur eine Richtung {x, y}, hier aber analog (Länge 0 bis 1).
// Der Joystick ist ein eigenes Element, nur seine Fläche fängt Berührungen ab:
// der restliche Bildschirm bleibt frei (später Tippen auf Objekte).

// Erkennt Touch-Geräte. iPads melden sich in Safari oft als Mac ("MacIntel"),
// haben aber – anders als echte Macs – mehrere Touchpunkte.
function erkenneTouchGeraet() {
  const nav = navigator;
  const grobeEingabe = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
  const ipadAlsMac = /Mac/i.test(nav.platform || nav.userAgent || '') && nav.maxTouchPoints > 1;
  const mobilGeraet = /iPhone|iPad|iPod|Android/i.test(nav.userAgent || '');
  return grobeEingabe || ipadAlsMac || mobilGeraet;
}

class TouchJoystick {
  constructor(parent) {
    this.dir = { x: 0, y: 0 };
    this.pointerId = null;
    this.TOTZONE = 0.15;          // kleine Auslenkungen zählen nicht (Daumen zittert)

    this.zone = document.createElement('div');
    this.zone.id = 'joystick';
    this.base = document.createElement('div');
    this.base.className = 'base';
    this.knob = document.createElement('div');
    this.knob.className = 'knob';
    this.zone.append(this.base, this.knob);
    parent.appendChild(this.zone);

    const z = this.zone;
    z.addEventListener('pointerdown', (e) => this.onDown(e));
    z.addEventListener('pointermove', (e) => this.onMove(e));
    z.addEventListener('pointerup', (e) => this.onEnd(e));
    z.addEventListener('pointercancel', (e) => this.onEnd(e));
    z.addEventListener('lostpointercapture', (e) => this.onEnd(e));
    // Die Berührung im Joystick gehört dem Joystick, nicht dem Spiel: Phaser soll sie weder als
    // Zeiger zählen (sonst fehlt ihm ein Platz für den zweiten Finger) noch als Tippen auf Objekte.
    ['touchstart', 'touchmove', 'touchend', 'touchcancel'].forEach((name) => {
      z.addEventListener(name, (e) => {
        e.stopPropagation();
        if (e.cancelable) e.preventDefault();   // unterdrückt auch nachgebaute Mausereignisse
      }, { passive: false });
    });
    window.addEventListener('blur', () => this.release());
    document.addEventListener('visibilitychange', () => { if (document.hidden) this.release(); });

    if (erkenneTouchGeraet()) {
      this.zeige();
    } else {
      // Falls die Erkennung ein Touch-Gerät verpasst: erste echte Berührung schaltet ihn ein.
      const ersteBerührung = (e) => {
        if (e.pointerType === 'touch' || e.pointerType === 'pen') {
          this.zeige();
          window.removeEventListener('pointerdown', ersteBerührung, true);
        }
      };
      window.addEventListener('pointerdown', ersteBerührung, true);
    }
  }

  zeige() {
    document.documentElement.classList.add('touch-device');
  }

  get sichtbar() {
    return document.documentElement.classList.contains('touch-device');
  }

  getDirection() {
    return { x: this.dir.x, y: this.dir.y };
  }

  onDown(e) {
    if (e.pointerType === 'mouse') return;       // Maus bedient den Joystick nicht
    if (this.pointerId !== null) return;          // zweiter Finger im Joystick wird ignoriert
    e.preventDefault();
    this.pointerId = e.pointerId;
    try { this.zone.setPointerCapture(e.pointerId); } catch (err) { /* nicht kritisch */ }
    this.zone.classList.add('aktiv');
    this.update(e);
  }

  onMove(e) {
    if (e.pointerId !== this.pointerId) return;   // andere Finger stören nicht
    e.preventDefault();
    this.update(e);
  }

  onEnd(e) {
    if (e.pointerId !== this.pointerId) return;
    this.release();
  }

  release() {
    if (this.pointerId !== null) {
      try { this.zone.releasePointerCapture(this.pointerId); } catch (err) { /* schon frei */ }
    }
    this.pointerId = null;
    this.dir = { x: 0, y: 0 };
    this.zone.classList.remove('aktiv');
    this.knob.style.setProperty('--kx', '0px');
    this.knob.style.setProperty('--ky', '0px');
  }

  // Mittelpunkt und Radius werden bei jeder Berührung neu gemessen,
  // so stimmt alles auch nach dem Drehen des Geräts.
  update(e) {
    const r = this.base.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const maxDist = (r.width / 2) * 0.8;          // so weit darf der Knopf aus der Mitte
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const len = Math.hypot(dx, dy);

    const geklemmt = Math.min(len, maxDist);
    const ux = len > 0 ? dx / len : 0;
    const uy = len > 0 ? dy / len : 0;
    this.knob.style.setProperty('--kx', (ux * geklemmt).toFixed(1) + 'px');
    this.knob.style.setProperty('--ky', (uy * geklemmt).toFixed(1) + 'px');

    // Stärke 0..1, mit Totzone und weichem Einsatz danach (analog).
    const roh = geklemmt / maxDist;
    const staerke = roh < this.TOTZONE ? 0 : (roh - this.TOTZONE) / (1 - this.TOTZONE);
    this.dir = { x: ux * staerke, y: uy * staerke };
  }
}

const touchJoystick = new TouchJoystick(document.body);
