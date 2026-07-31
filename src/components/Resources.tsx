/**
 * Where to go next. One filled action (the docs) and three quiet ones — the
 * `SiteNav` rule that a surface gets exactly one primary action, applied to the
 * bottom of the page as well as the top.
 */
import { Anchor, Text, XStack } from '@hanzo/gui'
import { TAP } from '@hanzo/ui/framework'
import { BookOpen, Github, Zap } from '@hanzogui/lucide-icons-2'

import { RESOURCES, type Resource } from '../site'

const GLYPH: Record<Resource['icon'], typeof BookOpen> = {
  BookOpen,
  Github,
  Zap,
}

export function Resources() {
  return (
    <XStack gap="$2" flexWrap="wrap" justify="center" width="100%">
      {RESOURCES.map((r) => {
        const Glyph = GLYPH[r.icon]
        const primary = r.primary === true
        return (
          <Anchor
            key={r.id}
            href={r.href}
            target="_blank"
            rel="noopener noreferrer"
            display="flex"
            flexDirection="row"
            items="center"
            gap="$2"
            minH={TAP}
            px="$3.5"
            rounded="$4"
            bg={primary ? '$color12' : 'transparent'}
            borderWidth={1}
            borderColor={primary ? '$color12' : '$borderColor'}
            hoverStyle={primary ? { opacity: 0.9 } : { bg: '$color3' }}
          >
            <Glyph size={16} color={primary ? '$background' : '$color11'} />
            <Text fontSize="$2" color={primary ? '$background' : '$color12'}>
              {r.label}
            </Text>
          </Anchor>
        )
      })}
    </XStack>
  )
}
