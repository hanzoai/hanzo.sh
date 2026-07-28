/**
 * The monospace family, from the design system rather than a hard-coded stack.
 *
 * `@hanzo/design` owns typography for every Hanzo surface and ships Geist Mono
 * self-hosted; `cssVar` is that package's one way to reach a token, and it
 * resolves through the live cascade (so a brand fork or a light/dark switch is
 * honoured) with the authored literal as its own fallback.
 *
 * Why not `fontFamily="$mono"`: `@hanzo/ui/gui-config` defines only `body` and
 * `heading` families, so `$mono` is not a token — it resolves to nothing and the
 * shell commands quietly render in Geist Sans. Why not `@hanzo/ui/core`'s
 * `fontMono`: that subpath is unresolvable in @hanzo/ui@8.0.26 (its exports map
 * points at `src/`, which `files: ["dist"]` does not publish).
 */
import type { TextProps } from '@hanzo/gui'
import { cssVar } from '@hanzo/design'

// The style type only admits font TOKENS; the design system's families are CSS
// custom properties, which is the one value it cannot name. Cast once, here.
export const mono = cssVar('--font-mono') as NonNullable<TextProps['fontFamily']>
