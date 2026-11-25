import Phaser from 'phaser';

// Controls: junta teclado y joystick en una sola respuesta.
// El resto del juego pregunta "¿izquierda?", "¿saltar?" sin importar
// de dónde viene la orden.
//
// Joystick PlayStation (mapeo "standard" del navegador):
//   X (cruz) = botón 0  -> saltar
//   Cuadrado = botón 2  -> saltar también
//   D-pad    = botones 14/15, o el stick izquierdo
//   Options  = botón 9  -> reiniciar nivel
const ZONA_MUERTA = 0.3;

export class Controls {
  constructor(scene) {
    this.scene = scene;
    const K = Phaser.Input.Keyboard.KeyCodes;
    this.teclas = scene.input.keyboard.addKeys({
      izq: K.LEFT, der: K.RIGHT, a: K.A, d: K.D,
      arriba: K.UP, w: K.W, espacio: K.SPACE, z: K.Z,
      reiniciar: K.R,
    });
    this.saltoAntes = false;
    this.reiniciarAntes = false;
  }

  get pad() {
    const gp = this.scene.input.gamepad;
    if (!gp || gp.total === 0) return null;
    return gp.getPad(0) || gp.gamepads.find(Boolean) || null;
  }

  boton(i) {
    const p = this.pad;
    return !!(p && p.buttons[i] && p.buttons[i].pressed);
  }

  ejeX() {
    const p = this.pad;
    if (!p || !p.axes[0]) return 0;
    const v = p.axes[0].getValue();
    return Math.abs(v) > ZONA_MUERTA ? v : 0;
  }

  get izquierda() {
    const t = this.teclas;
    return t.izq.isDown || t.a.isDown || this.boton(14) || this.ejeX() < 0;
  }

  get derecha() {
    const t = this.teclas;
    return t.der.isDown || t.d.isDown || this.boton(15) || this.ejeX() > 0;
  }

  // Se mantiene apretado (para saltos más altos si se deja apretado).
  get saltoApretado() {
    const t = this.teclas;
    return t.arriba.isDown || t.w.isDown || t.espacio.isDown || t.z.isDown ||
      this.boton(0) || this.boton(2);
  }

  // Llamar una vez por cuadro. Devuelve qué se acaba de apretar.
  actualizar() {
    const salto = this.saltoApretado;
    const reiniciar = this.teclas.reiniciar.isDown || this.boton(9);
    this.saltoRecien = salto && !this.saltoAntes;
    this.reiniciarRecien = reiniciar && !this.reiniciarAntes;
    this.saltoAntes = salto;
    this.reiniciarAntes = reiniciar;
  }
}
