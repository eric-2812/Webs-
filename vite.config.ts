import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Rutas relativas: la web funciona igual en la raíz de un dominio o en una subcarpeta (GitHub Pages, etc.).
  base: './',
  plugins: [react()],
  // three.js va en su propio chunk diferido; ~280 kB gzip es esperable.
  build: { chunkSizeWarningLimit: 1100 },
})
