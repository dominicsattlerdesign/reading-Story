import { defineConfig } from 'vitest/config';
import preact from '@preact/preset-vite';

export default defineConfig({
  plugins: [preact()],
  // relative Pfade, damit das Spiel auch in der Android-App (Capacitor) und offline laeuft
  base: './',
  server: { port: 5173, host: true },
  test: {
    environment: 'jsdom',
  },
});
