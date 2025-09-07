import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor libraries
          'vendor-vue': ['vue', 'vue-router', 'pinia'],
          'vendor-primevue': ['primevue/config', 'primevue/button', 'primevue/inputtext', 'primevue/menubar', 'primevue/message', 'primevue/select', 'primevue/toast', 'primevue/toastservice', 'primevue/confirmationservice'],
          'vendor-forms': ['@primevue/forms', 'primevue/password'],
          'vendor-utils': ['lodash']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
