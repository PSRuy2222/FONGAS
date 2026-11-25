import { defineConfig } from 'vite';

// base './' hace que el juego funcione en cualquier carpeta (ej. GitHub Pages).
export default defineConfig({
  base: './',
  server: { host: true },
});
