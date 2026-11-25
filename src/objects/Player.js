import Phaser from 'phaser';

// Ajustes del movimiento. Cambiar estos números cambia cómo se siente el juego.
export const AJUSTES = {
  velocidadMax: 260,      // qué tan rápido corre
  aceleracionPiso: 2200,  // qué tan rápido arranca en el piso
  aceleracionAire: 1400,  // control en el aire
  frenadoPiso: 2600,      // qué tan rápido frena al soltar
  fuerzaSalto: 620,       // altura del salto
  cortarSalto: 0.45,      // al soltar el botón antes, el salto queda más bajo
  caidaMax: 900,          // velocidad máxima de caída
  tiempoCoyote: 100,      // ms en que todavía podés saltar después de dejar el borde
  bufferSalto: 120,       // ms en que se "recuerda" un salto apretado antes de tocar el piso
};

const ANCHO = 18;
const ALTO = 40;

// Player: el stickman. Tiene un cuerpo físico invisible (rectángulo)
// y un dibujo encima. Si el nivel trae una imagen "stickman" (dibujo
// escaneado), se usa esa; si no, se dibuja con líneas.
export class Player {
  constructor(scene, x, y, controles) {
    this.scene = scene;
    this.controles = controles;

    this.cuerpo = scene.add.rectangle(x, y, ANCHO, ALTO).setVisible(false);
    scene.physics.add.existing(this.cuerpo);
    this.body = this.cuerpo.body;
    this.body.setMaxVelocityY(AJUSTES.caidaMax);
    this.body.setCollideWorldBounds(false);

    if (scene.textures.exists('stickman')) {
      this.imagen = scene.add.image(x, y, 'stickman');
      this.imagen.setDisplaySize(ANCHO * 1.6, ALTO);
    } else {
      this.dibujo = scene.add.graphics();
    }

    this.mirando = 1;      // 1 = derecha, -1 = izquierda
    this.fase = 0;         // para animar las piernas al correr
    this.ultimoPiso = 0;   // última vez que tocó el piso (ms)
    this.ultimoSalto = -1000;
  }

  get x() { return this.cuerpo.x; }
  get y() { return this.cuerpo.y; }
  get enPiso() { return this.body.blocked.down || this.body.touching.down; }

  ponerEn(x, y) {
    this.body.reset(x, y);
  }

  update(time, delta) {
    const dt = delta / 1000;
    const c = this.controles;
    const b = this.body;

    // --- Correr ---
    const dir = (c.derecha ? 1 : 0) - (c.izquierda ? 1 : 0);
    const piso = this.enPiso;
    if (dir !== 0) {
      this.mirando = dir;
      const acel = piso ? AJUSTES.aceleracionPiso : AJUSTES.aceleracionAire;
      b.velocity.x = Phaser.Math.Clamp(b.velocity.x + dir * acel * dt, -AJUSTES.velocidadMax, AJUSTES.velocidadMax);
    } else if (piso) {
      const frenar = AJUSTES.frenadoPiso * dt;
      b.velocity.x = Math.abs(b.velocity.x) <= frenar ? 0 : b.velocity.x - Math.sign(b.velocity.x) * frenar;
    }

    // --- Saltar (con "coyote time" y "buffer" para que sea justo) ---
    if (piso) this.ultimoPiso = time;
    if (c.saltoRecien) this.ultimoSalto = time;
    const puedeSaltar = time - this.ultimoPiso <= AJUSTES.tiempoCoyote;
    const quiereSaltar = time - this.ultimoSalto <= AJUSTES.bufferSalto;
    if (puedeSaltar && quiereSaltar) {
      b.velocity.y = -AJUSTES.fuerzaSalto;
      this.ultimoPiso = -1000;
      this.ultimoSalto = -1000;
      this.scene.events.emit('salto');
    }
    // Soltar el botón antes = salto más bajito
    if (!c.saltoApretado && b.velocity.y < 0) {
      b.velocity.y *= AJUSTES.cortarSalto;
    }

    this.dibujar(dt, piso);
  }

  dibujar(dt, piso) {
    const x = this.x;
    const y = this.y;
    const vx = this.body.velocity.x;

    if (this.imagen) {
      this.imagen.setPosition(x, y).setFlipX(this.mirando < 0);
      return;
    }

    const g = this.dibujo;
    g.clear();
    g.lineStyle(3, 0x1b1b1b, 1);

    const corriendo = piso && Math.abs(vx) > 10;
    if (corriendo) this.fase += Math.abs(vx) * dt * 0.06;
    else if (piso) this.fase = 0;

    const cabezaY = y - ALTO / 2 + 6;
    const cuelloY = cabezaY + 6;
    const caderaY = y + 4;
    const pieY = y + ALTO / 2;
    const m = this.mirando;

    // Cabeza
    g.fillStyle(0xffffff, 1);
    g.fillCircle(x, cabezaY, 6);
    g.strokeCircle(x, cabezaY, 6);
    // Ojo (mira para donde va)
    g.fillStyle(0x1b1b1b, 1);
    g.fillCircle(x + 2.5 * m, cabezaY - 1, 1.3);

    // Torso (se inclina un poco al correr)
    const incl = corriendo ? 3 * m : 0;
    g.lineBetween(x + incl, cuelloY, x, caderaY);

    // Piernas y brazos
    const largoPierna = pieY - caderaY;
    let pA, pB, bA, bB;
    if (!piso) {
      // En el aire: piernas encogidas, brazos arriba
      pA = 0.5 * m; pB = -0.2 * m;
      bA = 2.5; bB = -2.5;
    } else if (corriendo) {
      const s = Math.sin(this.fase);
      pA = 0.6 * s; pB = -0.6 * s;
      bA = -0.8 * s; bB = 0.8 * s;
    } else {
      pA = 0.2; pB = -0.2;
      bA = 0.35; bB = -0.35;
    }
    const pierna = (ang) => g.lineBetween(x, caderaY, x + Math.sin(ang) * largoPierna, caderaY + Math.cos(ang) * largoPierna);
    const brazo = (ang) => g.lineBetween(x + incl * 0.7, cuelloY + 3, x + incl * 0.7 + Math.sin(ang) * 12, cuelloY + 3 + Math.cos(ang) * 12);
    pierna(pA); pierna(pB);
    brazo(bA); brazo(bB);
  }
}
