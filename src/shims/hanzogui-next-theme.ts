/**
 * Stands in for `@hanzogui/next-theme` — a NEXT-ONLY package this Vite site
 * cannot install, and does not want.
 *
 * `@hanzo/ui@8.0.39` declares `@hanzogui/next-theme` an OPTIONAL peer, and it has
 * fixed half of what made that untrue: `ThemeToggleNext` is now its own module
 * (`dist/product/ThemeToggleNext.js`) rather than sharing a chunk with the two
 * agnostic toggles. What remains is one line in the barrel —
 *
 *     export { ThemeToggleNext } from './ThemeToggleNext.js'   (product/index.js)
 *
 * — a STATIC re-export, so importing anything at all from `@hanzo/ui/product`
 * still pulls that module into the graph, and with it the peer. The peer's entry
 * imports `next/script`, which no Vite app can resolve. hanzo/sites never hits
 * this because it is a Next app.
 *
 * `vite.config.ts` aliases the specifier here. Nothing on this page renders a
 * theme toggle (hanzo.sh is dark-only), so this hook is never called — it exists
 * only so the module graph resolves. `useTheme`/`useThemeSetting` upstream are
 * `useContext(ThemeSettingContext)`, whose value is undefined with no provider
 * mounted, which is exactly what this returns.
 *
 * DELETE THIS FILE, and the alias, the moment `@hanzo/ui/product`'s barrel stops
 * re-exporting `ThemeToggleNext` (the fix belongs there: a Next-only binding
 * needs a Next-only entry point, e.g. `@hanzo/ui/product/next`).
 */

/** The Next-bound theme setting. Undefined here: no provider, no Next. */
export const useThemeSetting = (): undefined => undefined

/** Same context upstream, same answer. */
export const useTheme = (): undefined => undefined
