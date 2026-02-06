import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: '../resources/static',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1500, // Increase limit to 1500 kB to accommodate large vendor bundles
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Split vendor chunks for better caching
          if (id.indexOf('node_modules') !== -1) {
            // Markdown Editor (large bundle, separate it first)
            if (id.indexOf('@uiw/react-md-editor') !== -1) {
              return 'editor-vendor';
            }
            // React Router (separate from React core)
            if (id.indexOf('react-router') !== -1) {
              return 'react-router-vendor';
            }
            // Redux stack (no React dependencies)
            if (id.indexOf('/redux/') !== -1 || id.indexOf('react-redux') !== -1 || id.indexOf('redux-saga') !== -1) {
              return 'redux-vendor';
            }
            // Heroicons (small, separate)
            if (id.indexOf('@heroicons/') !== -1) {
              return 'icons-vendor';
            }
            // React + Material UI + Emotion together (they're interdependent, so group them)
            // This prevents circular dependencies between mui-vendor and react-vendor
            if (id.indexOf('/react/') !== -1 ||
                id.indexOf('/react-dom/') !== -1 ||
                id.indexOf('@mui/') !== -1 ||
                id.indexOf('@emotion/') !== -1) {
              return 'react-ui-vendor';
            }
          }
        },
      },
    },
  }
})
