import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: { host: true, port: 5175 },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        /* KaTeX 约 270KB，只有「公式速查」页和含 $...$ 的题卡用到。
           单独拆包 → 首页/其他页不必先下载它。 */
        manualChunks(id) {
          if (id.includes('node_modules/katex')) return 'katex'
          if (id.includes('node_modules')) return 'vendor'
        },
      },
    },
  },
})
