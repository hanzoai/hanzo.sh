/**
 * The link renderers this site injects into `SiteNav` and `SiteFooter`.
 *
 * Both components take a `link` prop precisely so the host decides what a
 * destination is — usually to hand them a framework's navigation primitive.
 * There is no framework here (one route, one document), so what this supplies
 * instead is the TAP TARGET: a bare `<a>` around 13px text is ~20px tall, and a
 * footer index of those is unusable with a thumb. `TAP` is @hanzo/ui's own
 * definition of the floor (WCAG 2.5.5 / iOS HIG, 44px).
 *
 * One implementation, two configurations, because the two containers impose
 * different constraints:
 *
 *   • `link` — the footer index. A vertical list, free to grow; 44px rows are
 *     simply 44px rows.
 *   • `barLink` — the 52px header. `SiteNav` wraps each destination in a row with
 *     6px of vertical padding, so a 44px anchor makes a 56px wrapper that spills
 *     past the bar and paints over its bottom border (most visibly on the filled
 *     call-to-action). The negative vertical margin cancels exactly that padding:
 *     the target stays 44px, the wrapper goes back to 44px, and it sits inside the
 *     bar. It is not spacing — it is the padding it undoes.
 */
import { Anchor, type AnchorProps } from '@hanzo/gui'
import { TAP } from '@hanzo/ui/framework'
import type { LinkRender } from '@hanzo/ui/product'

/** Absolute URLs leave the property; site-relative paths stay. */
const isExternal = (href: string) => /^https?:\/\//.test(href)

const render =
  (extra: AnchorProps): LinkRender =>
  ({ href, children, onNavigate }) => (
    <Anchor
      href={href}
      onPress={onNavigate}
      {...(isExternal(href) ? { target: '_blank', rel: 'noopener noreferrer' } : null)}
      display="flex"
      flexDirection="row"
      items="center"
      justify="center"
      minH={TAP}
      minW={TAP}
      color="inherit"
      textDecorationLine="none"
      hoverStyle={{ textDecorationLine: 'none' }}
      {...extra}
    >
      {children}
    </Anchor>
  )

/** The footer index. */
export const link = render({ justify: 'flex-start' })

/** The 52px header bar. */
export const barLink = render({ my: -6 })
