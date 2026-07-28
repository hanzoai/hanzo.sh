import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

const shim = (p: string) => fileURLToPath(new URL(p, import.meta.url))

/**
 * @hanzo/gui is consumed at RUNTIME — the provider injects its CSS itself, and
 * the optimizing compiler is an optimization, not a requirement. Same
 * arrangement as hanzo/sites and the console, for the same reason.
 *
 * The two settings that are not optional:
 *   • `react-native` → `react-native-web`, because the gui primitives are
 *     cross-platform and resolve the native module by name on web too.
 *   • `.web.*` FIRST in `resolve.extensions`, which is what makes packages in the
 *     react-native ecosystem hand back their web variant instead of Flow source.
 */
export default defineConfig({
  // Relative asset paths: the built index.html is a POLYGLOT served from the
  // domain root, and a relative src survives being read as bytes anywhere.
  base: './',
  server: {
    host: '::',
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      'react-native': 'react-native-web',
      // Why this exists: src/shims/hanzogui-next-theme.ts.
      '@hanzogui/next-theme': shim('./src/shims/hanzogui-next-theme.ts'),
    },
    extensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
  },
  build: {
    target: 'es2022',
  },
})
