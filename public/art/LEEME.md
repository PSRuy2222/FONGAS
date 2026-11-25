# Arte del juego

Acá van las imágenes de los dibujos (fotos o escaneos, en PNG con fondo transparente).

Para usar un dibujo en un nivel, agregalo en la sección `"arte"` del JSON del nivel:

```json
"arte": { "stickman": "art/stickman.png" }
```

Claves que el juego ya entiende:

- `stickman`: reemplaza al stickman dibujado con líneas.

Si la imagen no está, el juego sigue andando con el dibujo por defecto.
