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
 * shell commands quietly render in Geist Sans.
 *
 * Why not `@hanzo/ui/core`'s `fontMono` (resolvable since 8.0.27, and the same
 * idea): it reads `--font-geist-mono`, which `@hanzo/ui/theme.css` declares. This
 * page's token layer is `@hanzo/design`, which declares `--font-mono` and ships
 * the face it names. Importing both stylesheets to reach one family would be two
 * token layers on one page, which is how a surface ends up with two answers for
 * a colour.
 */
import type { TextProps } from '@hanzo/gui'
import { cssVar } from '@hanzo/design'

// The style type only admits font TOKENS; the design system's families are CSS
// custom properties, which is the one value it cannot name. Cast once, here.
export const mono = cssVar('--font-mono') as NonNullable<TextProps['fontFamily']>
