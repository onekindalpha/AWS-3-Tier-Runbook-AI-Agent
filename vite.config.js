import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/aws-3tier-architecture-docs/',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-dom/client']
  }
})
