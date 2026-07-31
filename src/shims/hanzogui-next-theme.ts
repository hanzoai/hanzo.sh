/**
 * Stands in for `@hanzogui/next-theme` — a NEXT-ONLY package this Vite site
 * cannot install, and does not want.
 *
 * `@hanzo/ui@8.0.26` declares `@hanzogui/next-theme` an OPTIONAL peer, but its
 * published bundle does not honour that: tsup put `ThemeToggle`,
 * `AgnosticThemeToggle` and `ThemeToggleNext` in ONE chunk, and that chunk opens
 * with a top-level `import { useThemeSetting } from '@hanzogui/next-theme'`.
 * A static import cannot be tree-shaken away, so every consumer of
 * `@hanzo/ui/product` requires the peer — and `@hanzogui/next-theme`'s entry
 * imports `next/script`, which no Vite app can resolve. hanzo/sites never hit it
 * because it is a Next app.
 *
 * `vite.config.ts` aliases the specifier here. Nothing on this page renders a
 * theme toggle (hanzo.sh is dark-only), so this hook is never called — it exists
 * only so the module graph resolves. `useTheme`/`useThemeSetting` upstream are
 * `useContext(ThemeSettingContext)`, whose value is undefined with no provider
 * mounted, which is exactly what this returns.
 *
 * DELETE THIS FILE, and the alias, the moment @hanzo/ui splits that chunk (the
 * fix belongs there: `ThemeToggleNext` should be its own entry).
 */

/** The Next-bound theme setting. Undefined here: no provider, no Next. */
export const useThemeSetting = (): undefined => undefined

/** Same context upstream, same answer. */
export const useTheme = (): undefined => undefined
