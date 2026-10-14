import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // three.js va en su propio chunk diferido; ~280 kB gzip es esperable.
  build: { chunkSizeWarningLimit: 1100 },
})
