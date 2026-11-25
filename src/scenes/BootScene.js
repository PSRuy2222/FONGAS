import Phaser from 'phaser';

// BootScene: carga el nivel (JSON) y las imágenes que ese nivel pida.
// Cuando tengamos dibujos escaneados, alcanza con nombrarlos en el JSON
// (sección "arte") y ponerlos en public/art/.
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  init(data) {
    this.nivel = data.nivel || 'nivel-prueba';
  }

  preload() {
    this.load.json('nivel', `levels/${this.nivel}.json`);
  }

  create() {
    const datos = this.cache.json.get('nivel');
    const arte = datos.arte || {};
    const claves = Object.keys(arte);

    if (claves.length === 0) {
      this.scene.start('Game', { datos });
      return;
    }

    // Segunda tanda: imágenes del nivel. Si alguna falta, el juego usa
    // el dibujo por defecto (no se rompe).
    for (const clave of claves) this.load.image(clave, arte[clave]);
    this.load.on('loaderror', (archivo) => {
      console.warn(`No se encontró la imagen "${archivo.key}" (${archivo.src}). Uso el dibujo por defecto.`);
    });
    this.load.once('complete', () => this.scene.start('Game', { datos }));
    this.load.start();
  }
}
