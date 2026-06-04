import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Increase the chunk size warning limit to avoid warnings for large bundles.
    chunkSizeWarningLimit: 2000 // in KB
  }
})
