# FONGAS

Juego de plataformas 2D: un stickman que se encogió en un experimento de laboratorio y quiere volver a ser grande. Hecho con [Phaser 3](https://phaser.io) y [Vite](https://vite.dev).

## Jugar

- **Online:** https://psruy2222.github.io/FONGAS/ (se publica solo cada vez que se actualiza `main`).
- **En la compu:**
  ```bash
  npm install
  npm run dev
  ```
  y abrir el link que aparece (http://localhost:5173).

### Controles

| Acción    | Teclado              | Joystick PlayStation        |
|-----------|----------------------|-----------------------------|
| Correr    | ← → (o A / D)        | Stick izquierdo o D-pad     |
| Saltar    | Espacio, ↑, W o Z    | X (cruz) o Cuadrado         |
| Reiniciar | R                    | Options                     |

Mantener apretado el salto = salto más alto. El joystick aparece cuando apretás cualquier botón (es una regla del navegador).

## Cómo está armado

```
index.html                 página que contiene el juego
src/main.js                configuración de Phaser (tamaño, física, escenas)
src/scenes/BootScene.js    carga el nivel (JSON) y las imágenes que pida
src/scenes/GameScene.js    arma el nivel, la cámara, la meta y el cartel
src/objects/Player.js      el stickman: movimiento, salto y dibujo
src/input/Controls.js      junta teclado y joystick en una sola respuesta
public/levels/*.json       los niveles
public/art/                los dibujos escaneados (ver LEEME.md ahí)
```

- **Niveles en JSON.** Un nivel es una lista de rectángulos (`x`, `y`, `w`, `h`, `tipo`), más el punto de `inicio` y la `meta`. La coordenada `y` crece hacia abajo. Para pasar un dibujo de nivel al juego alcanza con medir las plataformas y escribirlas acá. Más adelante podemos usar [Tiled](https://www.mapeditor.org/) si se vuelve tedioso.
- **Arte desde dibujos.** La sección `"arte"` del nivel lista imágenes de `public/art/`. Si existe la imagen `stickman`, reemplaza al dibujo con líneas. Si falta una imagen, el juego sigue con el dibujo por defecto.
- **Sensación del movimiento.** Todos los números (velocidad, altura del salto, etc.) están juntos en `AJUSTES` al principio de `src/objects/Player.js`. Incluye "coyote time" (podés saltar un instante después de dejar el borde) y "buffer" (se recuerda un salto apretado justo antes de tocar el piso), que hacen que el parkour se sienta justo.
- **Controles en un solo lugar.** `Controls` responde `izquierda`, `derecha`, `saltoRecien`, etc. Si queremos agregar un botón nuevo (por ejemplo para una habilidad), se agrega ahí.
