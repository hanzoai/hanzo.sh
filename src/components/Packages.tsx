/**
 * What each language actually gets — one `Panel` per language, wrapping rather
 * than breaking at a breakpoint, so the three columns become one on a phone
 * without a media query anywhere.
 */
import { Anchor, Text, XStack, YStack } from '@hanzo/gui'
import { Panel } from '@hanzo/ui/product'
import { TAP } from '@hanzo/ui/framework'
import { Code } from '@hanzogui/lucide-icons-2/icons/Code'
import { Cpu } from '@hanzogui/lucide-icons-2/icons/Cpu'
import { Globe } from '@hanzogui/lucide-icons-2/icons/Globe'
import { mono } from '../mono'

import { LANGUAGES, type Language } from '../site'

const GLYPH: Record<Language['icon'], typeof Code> = {
  Code,
  Cpu,
  Globe,
}

export function Packages() {
  return (
    <XStack gap="$3" flexWrap="wrap" items="stretch" width="100%">
      {LANGUAGES.map((lang) => {
        const Glyph = GLYPH[lang.icon]
        return (
          <Panel
            key={lang.id}
            title={lang.name}
            right={
              <Anchor
                href={lang.registry.href}
                target="_blank"
                rel="noopener noreferrer"
                display="flex"
                flexDirection="row"
                items="center"
                justify="flex-end"
                minH={TAP}
                minW={TAP}
                fontSize="$1"
                color="$color10"
                hoverStyle={{ color: '$color12' }}
              >
                {lang.registry.label} →
              </Anchor>
            }
          >
            <XStack items="center" gap="$2">
              <Glyph size={16} color="$color11" />
              <Text fontSize="$1" color="$color10">
                {lang.packages.length} packages
              </Text>
            </XStack>
            <YStack gap="$1.5">
              {lang.packages.map((p) => (
                <XStack key={p.pkg} items="center" justify="space-between" gap="$3">
                  <Text fontFamily={mono} fontSize="$1" color="$color12">
                    {p.pkg}
                  </Text>
                  <Text fontSize="$1" color="$color10" text="right" shrink={1}>
                    {p.desc}
                  </Text>
                </XStack>
              ))}
            </YStack>
          </Panel>
        )
      })}
    </XStack>
  )
}
