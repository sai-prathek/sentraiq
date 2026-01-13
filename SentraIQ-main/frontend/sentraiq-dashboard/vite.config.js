import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 8081,
    hmr: false, // Disable Hot Module Replacement
    watch: null, // Disable file watching
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://49.50.99.89:8080',
        changeOrigin: true
      },
      '/data': {
        target: process.env.VITE_API_URL || 'http://49.50.99.89:8080',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  },
  // Define backend URL at build time for production
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(
      process.env.VITE_API_URL || 'http://49.50.99.89:8080'
    )
  }
})
