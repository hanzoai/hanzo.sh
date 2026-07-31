/**
 * The Hanzo scale, with ONE media key redefined.
 *
 * The scale itself is `@hanzo/ui/gui-config` — the same config the console and
 * hanzo/sites render against — and nothing here touches its tokens, fonts, radii
 * or themes.
 *
 * What it changes: `@hanzo/ui@8.0.26`'s `SiteNav` authors `$sm` with PHONE
 * (max-width) semantics — it hides the local nav row and shows the menu button
 * "at `$sm`" — while `@hanzogui/config/v5` defines `sm` as `minWidth: 640`. The
 * two disagree, and the result on the default scale is exactly inverted: a phone
 * gets the desktop link row (which no longer fits once its links carry a 44px
 * target) and a desktop gets a hamburger. Redefining `sm` as "narrower than 640"
 * makes the component behave the way it is written to, at both widths.
 *
 * Only `sm` moves. `$md` / `$lg` appear in `Field`, `PageHeader` and `SlideOver`,
 * none of which this page renders, and the one media prop in `src/` is the
 * headline's `$xs`, which keeps its default min-width meaning. So `sm` is the
 * only key whose reading changes, and `SiteNav` is the only thing reading it.
 *
 * DELETE THIS FILE the moment `SiteNav` is fixed upstream (its `$sm` blocks
 * should be `$gtSm`, or the props should be inverted); `App.tsx` goes back to
 * importing `@hanzo/ui/gui-config` directly.
 */
import { createGui } from '@hanzo/gui'
import base from '@hanzo/ui/gui-config'

export default createGui({
  ...base,
  media: { ...base.media, sm: { maxWidth: 639.98 } },
})
