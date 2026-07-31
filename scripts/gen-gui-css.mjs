// Regenerate src/gui.css — the @hanzo/gui base sheet, as a real static asset.
//
// Without this, GuiProvider builds the whole sheet in JS and injects a <style>
// tag on every page load: work the browser repeats per visit for bytes that
// never change. Generated here instead, Vite fingerprints the file into
// dist/assets and the browser caches it once. GuiProvider renders with
// disableInjectCSS so this file is the ONE source of the base gui styles —
// the same arrangement hanzo.ai and hanzo.app use, minus their Next specifics.
//
// First in `pnpm build`, so the sheet cannot drift from gui.config.ts. The
// generated file is committed so `pnpm dev` and `pnpm typecheck` work without
// a build step.
import { writeFileSync, rmSync } from 'node:fs'
import { buildSync } from 'esbuild'

const bundle = new URL('../.guicfg.gen.mjs', import.meta.url)

// gui.config.ts is TypeScript and pulls in the @hanzogui graph, so it has to
// be bundled before Node can import it. react-native is aliased to
// react-native-web for the same reason vite.config.ts does it: the bare
// specifier resolves to the native implementation, which has no business
// running here.
buildSync({
  entryPoints: [new URL('../src/gui.config.ts', import.meta.url).pathname],
  bundle: true,
  format: 'esm',
  platform: 'node',
  external: ['react', 'react-dom', 'react-native'],
  alias: { 'react-native': 'react-native-web' },
  outfile: bundle.pathname,
  logLevel: 'error',
})

const { default: config } = await import(bundle)
const css = config.getCSS()
writeFileSync(new URL('../src/gui.css', import.meta.url), css)
rmSync(bundle)
console.log(`src/gui.css regenerated — ${css.length.toLocaleString()} bytes`)
