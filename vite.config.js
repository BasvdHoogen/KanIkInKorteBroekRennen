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
  define: {
    // Drop vue-i18n's legacy API from the bundle and silence its esm-bundler warning.
    __VUE_I18N_FULL_INSTALL__: 'true',
    __VUE_I18N_LEGACY_API__: 'false',
    __INTLIFY_PROD_DEVTOOLS__: 'false'
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  test: {
    environment: 'happy-dom'
  }
})
