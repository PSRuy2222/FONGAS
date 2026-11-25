import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { GameScene } from './scenes/GameScene.js';

// Configuración general del juego.
// El juego se dibuja en 960x540 y se escala para llenar la ventana.
new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'juego',
  width: 960,
  height: 540,
  backgroundColor: '#8fd3ff',
  antialias: true, // estilo liso, no pixelado
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  input: { gamepad: true }, // joystick (PlayStation, Xbox, etc.)
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 1400 }, debug: false },
  },
  scene: [BootScene, GameScene],
});
