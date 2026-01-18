import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/edenta/api/dashboard/',
  build: {
    outDir: '../api/public',
    emptyOutDir: true
  },
  server: {
    host: true,
    port: 3000
  }
})