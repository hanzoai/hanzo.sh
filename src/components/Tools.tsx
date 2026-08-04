/**
 * What the installer actually puts on PATH — one `Panel` per binary, wrapping
 * rather than breaking at a breakpoint, so three columns become one on a phone
 * without a media query anywhere.
 */
import { Anchor, Text, XStack, YStack } from '@hanzo/gui'
import { Panel } from '@hanzo/ui/product'
import { TAP } from '@hanzo/ui/framework'
import { Code } from '@hanzogui/lucide-icons-2/icons/Code'
import { Cpu } from '@hanzogui/lucide-icons-2/icons/Cpu'
import { Terminal } from '@hanzogui/lucide-icons-2/icons/Terminal'
import { mono } from '../mono'

import { TOOLS, type Tool } from '../site'

const GLYPH: Record<Tool['icon'], typeof Code> = {
  Code,
  Cpu,
  Terminal,
}

export function Tools() {
  return (
    <XStack gap="$3" flexWrap="wrap" items="stretch" width="100%">
      {TOOLS.map((tool) => {
        const Glyph = GLYPH[tool.icon]
        return (
          <Panel
            key={tool.bin}
            title={tool.bin}
            right={
              <Anchor
                href={tool.href}
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
                source →
              </Anchor>
            }
          >
            <XStack items="flex-start" gap="$2">
              <Glyph size={16} color="$color11" />
              <Text fontSize="$1" color="$color10" lineHeight={18} flex={1} minW={0}>
                {tool.desc}
              </Text>
            </XStack>
            {/* Both names are ONE build, symlinked — say so, because two names that
                can drift into two versions is exactly what the symlink prevents. */}
            {tool.also ? (
              <YStack>
                <Text fontSize="$1" color="$color9">
                  also installed as{' '}
                  <Text fontFamily={mono} fontSize="$1" color="$color11">
                    {tool.also}
                  </Text>{' '}
                  — the same build, symlinked
                </Text>
              </YStack>
            ) : null}
          </Panel>
        )
      })}
    </XStack>
  )
}
