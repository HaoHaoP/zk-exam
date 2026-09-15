import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: { host: true, port: 5175 },
  build: { outDir: 'dist', assetsInlineLimit: 0 }
})
