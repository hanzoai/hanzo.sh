/**
 * Registers @hanzo/gui's v5 config with the type system, so the shorthand style
 * props this app is written in (`items` / `justify` / `minH` / `self` / `rounded`
 * / `bg` …) resolve to their concrete types.
 *
 * The v5 config sets `onlyShorthandStyleProps`, so the shorthands ARE the API —
 * without this augmentation TypeScript sees only the base React Native props and
 * every one of them reads as an unknown prop (`hoverStyle={{ bg }}` is the first
 * to fail). Ambient + type-only. Same file, same form, as hanzo/sites.
 */
import type { createGui } from '@hanzo/gui'
import type { defaultConfig } from '@hanzogui/config/v5'

type Conf = ReturnType<typeof createGui<typeof defaultConfig>>

declare module '@hanzogui/web' {
  interface GuiCustomConfig extends Conf {}
}

declare module '@hanzogui/core' {
  interface GuiCustomConfig extends Conf {}
}
