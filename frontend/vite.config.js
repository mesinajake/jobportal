import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173,
    host: true,
    hmr: {
      overlay: true,
      clientPort: 5173
    },
    watch: {
      usePolling: false // Set to true if file changes aren't detected
    }
  }
  // Removed proxy - direct browser connections work even though curl/proxy doesn't
})
