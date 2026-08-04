/**
 * hanzo.sh — the install surface, and the only route this app has.
 *
 * One header and one footer, both the estate's shared ones: `SiteNav` renders
 * this property's nav plus the ecosystem launcher, `SiteFooter` renders
 * `@hanzo/products`' `FOOTER`. The page used to carry two of each (a `Navbar`
 * above a section that drew its own header, and a hand-written footer of
 * `href="#"` links below the real one) — which is the drift those two components
 * exist to end.
 *
 * The sections below say exactly what `public/install.sh` does and nothing more:
 * the one command, the three tools it installs, the three it does not, and what
 * to run afterwards. A "Features" section of invented product claims used to sit
 * here; it was template filler and it is gone.
 */
import { Separator, YStack } from '@hanzo/gui'
import { BrandMark, SiteFooter, SiteNav } from '@hanzo/ui/product'
import { FOOTER } from '@hanzo/products'
import { Github } from '@hanzogui/lucide-icons-2'

import { AfterInstall } from '../components/AfterInstall'
import { Install } from '../components/Install'
import { Resources } from '../components/Resources'
import { Tools } from '../components/Tools'
import { Unavailable } from '../components/Unavailable'
import { barLink, link } from '../components/link'
import { FOOTER_TAGLINE, HEADER, LAUNCHER } from '../site'

/** The launcher's glyph resolver — every entry that has a glyph here, gets one. */
const icon = (id: string) => (id === 'github' ? <Github size={16} color="$color11" /> : null)

export function Index() {
  // No `flex={1}` on the body and no `overflow` on the shell: gui primitives carry
  // React Native's flex semantics (`flex:1` implies `min-height:0`), so a flexing
  // body inside a 100vh column CLIPS its content instead of growing the page — the
  // sections paint on top of each other and the document stops at one viewport.
  // A document grows by content height; let it.
  return (
    <YStack minH="100vh" bg="$background">
      <SiteNav header={HEADER} menu={LAUNCHER} brand={<BrandMark size={18} animated={false} />} icon={icon} link={barLink} />

      <YStack items="center" px="$4" py="$6" width="100%">
        <YStack width="100%" maxW={960} gap="$7">
          <Install />
          <Tools />
          <Unavailable />
          <AfterInstall />
          <Separator />
          <Resources />
        </YStack>
      </YStack>

      <SiteFooter footer={FOOTER} brand={<BrandMark size={18} animated={false} />} tagline={FOOTER_TAGLINE} link={link} />
    </YStack>
  )
}
