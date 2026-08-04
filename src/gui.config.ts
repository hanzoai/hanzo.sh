/**
 * The Hanzo scale, with ONE media key redefined.
 *
 * The scale itself is `@hanzo/ui/gui-config` — the same config the console and
 * hanzo/sites render against — and nothing here touches its tokens, fonts, radii
 * or themes.
 *
 * What it changes: `@hanzo/ui@8.0.39`'s `SiteNav` authors `$sm` with PHONE
 * (max-width) semantics — it hides the local nav row and shows the menu button
 * "at `$sm`" — while `@hanzogui/config@8`'s v5 defines `sm` as
 * `minWidth: 640`. The two disagree, and the result on the stock scale is exactly
 * inverted: a 390px phone gets the desktop link row (which overflows the bar —
 * measured, 399px of content in a 390px viewport) and a desktop gets a
 * hamburger. Redefining `sm` as "narrower than 640" makes the component behave
 * the way it is written to, at both widths.
 *
 * Only `sm` moves. Of everything this page renders, `SiteNav` is the only reader
 * of any `sm` key — `SiteFooter`, `Panel` and `BrandMark` declare no media props
 * at all — so nothing else changes meaning.
 *
 * DELETE THIS FILE the moment `SiteNav` is fixed upstream. v5 already ships the
 * key it wants: `max-sm` is `maxWidth: 639.98`, so those two blocks should read
 * `$maxSm`, and then `App.tsx` imports `@hanzo/ui/gui-config` directly.
 */
import { createGui, type CreateGuiProps } from '@hanzo/gui'
import base from '@hanzo/ui/gui-config'

/**
 * The one cast in this app, and it is here rather than at the mount point.
 *
 * `@hanzo/ui/gui-config` publishes a CREATED config (`GuiInternalConfig`), which
 * is a superset of the props `createGui` takes — feeding one back in is how you
 * override a key without restating the scale, and it is what the runtime
 * supports. Its DECLARED type is not assignable to `CreateGuiProps` in two
 * fields: `animations` (v5's is an `AnimationDriver`; `CreateGuiConfig` narrowed
 * the field to an object with a required `default` key) and `defaultProps.View`
 * (the emitted `.d.ts` carries the longhand form, while an app that augments
 * `GuiCustomConfig` — see `gui-env.d.ts`, which is what makes `bg` and `rounded`
 * typecheck at all — reads the shorthand-only form). `tsc` 5.9 rejects it
 * identically to `tsgo`, so it is an upstream declaration break, not a compiler
 * difference. Neither field is set here, and the object is unchanged.
 *
 * The whole cast goes when this file does.
 */
const props = base as unknown as CreateGuiProps

export default createGui({
  ...props,
  media: { ...props.media, sm: { maxWidth: 639.98 } },
})
