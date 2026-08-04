import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        // `public/`-rooted asset paths (e.g. src="/foo.png") aren't imports —
        // leave `img` src literal instead of resolving it as a module
        // (plain `transformAssetUrls: false` is ignored under Vitest's dev-server transform).
        transformAssetUrls: { img: [] }
      }
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  test: {
    environment: 'happy-dom'
  }
})
