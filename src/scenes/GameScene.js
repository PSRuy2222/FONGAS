import Phaser from 'phaser';
import { Controls } from '../input/Controls.js';
import { Player } from '../objects/Player.js';

const COLORES = {
  pasto: { arriba: 0x5cbf4a, abajo: 0x8a5a3b },
  madera: { arriba: 0xc98b4f, abajo: 0x9a6535 },
  piedra: { arriba: 0xb8b8b8, abajo: 0x8c8c8c },
};

// GameScene: arma el nivel a partir del JSON y maneja la partida.
export class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  init(data) {
    this.datos = data.datos;
    this.terminado = false;
  }

  create() {
    const n = this.datos;
    this.physics.world.setBounds(0, 0, n.ancho, n.alto + 400);
    this.cameras.main.setBounds(0, 0, n.ancho, n.alto);
    this.cameras.main.setBackgroundColor(n.cielo || '#8fd3ff');

    this.dibujarFondo(n);

    // Plataformas: un rectángulo físico invisible + el dibujo encima.
    this.plataformas = this.physics.add.staticGroup();
    const g = this.add.graphics();
    for (const p of n.plataformas) {
      const rect = this.add.rectangle(p.x + p.w / 2, p.y + p.h / 2, p.w, p.h).setVisible(false);
      this.plataformas.add(rect);
      this.dibujarPlataforma(g, p);
    }

    // Meta (bandera)
    this.meta = this.crearMeta(n.meta.x, n.meta.y);

    // Jugador
    this.controles = new Controls(this);
    this.jugador = new Player(this, n.inicio.x, n.inicio.y, this.controles);
    this.physics.add.collider(this.jugador.cuerpo, this.plataformas);
    this.physics.add.overlap(this.jugador.cuerpo, this.meta, () => this.ganar());

    this.cameras.main.startFollow(this.jugador.cuerpo, true, 0.12, 0.12);
    this.cameras.main.setDeadzone(120, 80);

    this.crearCartel();
  }

  update(time, delta) {
    this.controles.actualizar();
    if (this.controles.reiniciarRecien) this.reiniciar();
    if (this.terminado) return;

    this.jugador.update(time, delta);

    // Si se cae del mapa, vuelve al inicio.
    if (this.jugador.y > this.datos.alto + 100) {
      this.jugador.ponerEn(this.datos.inicio.x, this.datos.inicio.y);
      this.cameras.main.flash(200, 255, 255, 255);
    }

    this.estadoJoystick.setText(this.controles.pad ? '🎮 Joystick conectado' : '🎮 Sin joystick (apretá un botón)');
  }

  reiniciar() {
    this.scene.restart({ datos: this.datos });
  }

  ganar() {
    if (this.terminado) return;
    this.terminado = true;
    this.jugador.body.setVelocity(0, 0);
    this.jugador.body.setAllowGravity(false);
    const cam = this.cameras.main;
    this.add.text(cam.width / 2, cam.height / 2, '¡Llegaste!', {
      fontFamily: 'Arial Black, Arial, sans-serif', fontSize: '64px', color: '#ffffff',
      stroke: '#1b1b1b', strokeThickness: 8,
    }).setOrigin(0.5).setScrollFactor(0);
    this.time.delayedCall(2500, () => this.reiniciar());
  }

  dibujarFondo(n) {
    // Sol
    this.add.circle(800, 110, 50, 0xffd54a).setScrollFactor(0.05);
    // Cuchillas (lomas) lejanas y cercanas, se mueven más lento que el jugador
    const capas = [
      { color: 0xa5d98f, factor: 0.25, base: n.alto - 260, alto: 90, ola: 500 },
      { color: 0x7fc46a, factor: 0.5, base: n.alto - 180, alto: 70, ola: 340 },
    ];
    for (const c of capas) {
      const g = this.add.graphics().setScrollFactor(c.factor, 1);
      g.fillStyle(c.color, 1);
      const ancho = n.ancho * c.factor + 1200;
      const puntos = [new Phaser.Math.Vector2(0, n.alto + 200)];
      for (let x = 0; x <= ancho; x += 20) {
        puntos.push(new Phaser.Math.Vector2(x, c.base - Math.sin(x / c.ola) * c.alto - Math.sin(x / (c.ola * 0.37)) * c.alto * 0.3));
      }
      puntos.push(new Phaser.Math.Vector2(ancho, n.alto + 200));
      g.fillPoints(puntos, true);
    }
  }

  dibujarPlataforma(g, p) {
    const col = COLORES[p.tipo] || COLORES.pasto;
    const r = Math.min(10, p.h / 2);
    g.fillStyle(col.abajo, 1);
    g.fillRoundedRect(p.x, p.y, p.w, p.h, r);
    g.fillStyle(col.arriba, 1);
    g.fillRoundedRect(p.x, p.y, p.w, Math.min(14, p.h), { tl: r, tr: r, bl: 2, br: 2 });
  }

  crearMeta(x, y) {
    // Mástil con bandera de franjas celestes y blancas.
    const g = this.add.graphics();
    g.fillStyle(0x444444, 1);
    g.fillRect(x - 2, y - 120, 4, 120);
    for (let i = 0; i < 5; i++) {
      g.fillStyle(i % 2 === 0 ? 0xffffff : 0x5aa9e6, 1);
      g.fillRect(x + 2, y - 120 + i * 8, 56, 8);
    }
    g.fillStyle(0xffffff, 1);
    g.fillRect(x + 2, y - 120, 22, 24);
    g.fillStyle(0xf4c430, 1);
    g.fillCircle(x + 13, y - 108, 7);

    const zona = this.add.zone(x + 20, y - 60, 60, 120);
    this.physics.add.existing(zona, true);
    return zona;
  }

  crearCartel() {
    const estilo = { fontFamily: 'Arial, sans-serif', fontSize: '16px', color: '#1b1b1b' };
    this.add.text(16, 12, this.datos.nombre || '', { ...estilo, fontSize: '20px', fontStyle: 'bold' }).setScrollFactor(0);
    this.add.text(16, 40, 'Teclado: ← → para correr · Espacio para saltar · R reinicia', estilo).setScrollFactor(0);
    this.add.text(16, 60, 'Joystick: stick o flechas para correr · X para saltar · Options reinicia', estilo).setScrollFactor(0);
    this.estadoJoystick = this.add.text(16, 84, '', estilo).setScrollFactor(0);
  }
}
