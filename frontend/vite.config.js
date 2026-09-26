import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    proxy: {
      // Proxy API calls to Flask backend during dev
      // This means you can also just set VITE_API_URL=http://localhost:5000
      '/auth':    { target: 'http://localhost:5000', changeOrigin: true },
      '/predict': { target: 'http://localhost:5000', changeOrigin: true },
      '/weather': { target: 'http://localhost:5000', changeOrigin: true },
      '/risk':    { target: 'http://localhost:5000', changeOrigin: true },
      '/schemes': { target: 'http://localhost:5000', changeOrigin: true },
      '/chatbot': { target: 'http://localhost:5000', changeOrigin: true },
      '/uploads': { target: 'http://localhost:5000', changeOrigin: true },
    },
  },
})
