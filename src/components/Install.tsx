/**
 * The install block: the headline, the one command, and the shorter ways to say
 * the same thing (per-bundle paths, package managers).
 *
 * The command row is the page. Everything else on it is a variation of that row,
 * so they are all the same `Copyable`.
 */
import { useState } from 'react'
import { Anchor, H1, Separator, Text, XStack, YStack } from '@hanzo/gui'
import { Terminal } from '@hanzogui/lucide-icons-2/icons/Terminal'
import { mono } from '../mono'

import { INSTALLS, PACKAGE_MANAGERS, SHORTCUTS } from '../site'
import { Copyable } from './Copyable'
import { Pressable } from './Pressable'

export function Install() {
  const [active, setActive] = useState<string>(INSTALLS[0].id)
  const command = INSTALLS.find((i) => i.id === active) ?? INSTALLS[0]

  return (
    <YStack gap="$5" items="center" width="100%">
      <YStack gap="$2" items="center" maxW={560} width="100%">
        <H1 fontSize={40} $xs={{ fontSize: 56 }} fontWeight="700" letterSpacing={-1} text="center" color="$color12">
          curl hanzo.sh
        </H1>
        <Text fontSize="$4" color="$color10" text="center" lineHeight={24}>
          Install the Hanzo AI toolkit. CLI, MCP server, agents, SDKs.
        </Text>
      </YStack>

      <YStack gap="$2" width="100%" maxW={560}>
        {/* Which pipe — the three the installer documents. */}
        <XStack gap="$1" p="$1" bg="$color3" rounded="$4" self="center" flexWrap="wrap" justify="center">
          {INSTALLS.map((item) => (
            <Pressable
              key={item.id}
              px="$3"
              justify="center"
              rounded="$3"
              bg={active === item.id ? '$color12' : 'transparent'}
              hoverStyle={{ bg: active === item.id ? '$color12' : '$color4' }}
              onPress={() => setActive(item.id)}
              aria-pressed={active === item.id}
            >
              <Text fontSize="$2" color={active === item.id ? '$background' : '$color11'}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </XStack>

        <Copyable
          value={command.cmd}
          px="$3"
          rounded="$4"
          bg="$color2"
          borderWidth={1}
          borderColor="$borderColor"
          hoverStyle={{ borderColor: '$color8' }}
        >
          <Terminal size={16} color="$color10" />
          <Text
            fontFamily={mono}
            fontSize="$2"
            color="$color12"
            text="left"
            flex={1}
            minW={0}
            numberOfLines={1}
            selectable
          >
            {command.cmd}
          </Text>
        </Copyable>

        {/* The `uv` link is INLINE in a sentence — WCAG 2.5.5's inline exception.
            Padding it to 44px would break the line it sits in. */}
        <Text fontSize="$1" color="$color10" text="center">
          Requires bash. Installs{' '}
          <Anchor href="https://docs.astral.sh/uv/" target="_blank" rel="noopener noreferrer" color="$color11" fontSize="$1">
            uv
          </Anchor>{' '}
          if missing.
        </Text>
      </YStack>

      {/* The per-bundle shims this host actually serves. */}
      <XStack gap="$2" flexWrap="wrap" justify="center" width="100%">
        {SHORTCUTS.map((s) => (
          <Copyable
            key={s.path}
            value={`curl -fsSL hanzo.sh${s.path} | bash`}
            iconSize={13}
            px="$2.5"
            rounded="$3"
            bg="$color2"
            borderWidth={1}
            borderColor="$borderColor"
            hoverStyle={{ borderColor: '$color8' }}
            aria-label={`Copy the hanzo.sh${s.path} install command — ${s.label}`}
          >
            <Text fontFamily={mono} fontSize="$1" color="$color11">
              hanzo.sh{s.path}
            </Text>
          </Copyable>
        ))}
      </XStack>

      <Separator width="100%" />

      <YStack gap="$2" width="100%">
        <Text fontSize="$2" color="$color10" text="center">
          Or install via package manager:
        </Text>
        <XStack gap="$2" flexWrap="wrap" justify="center">
          {PACKAGE_MANAGERS.map((item) => (
            <Copyable
              key={item.id}
              value={item.cmd}
              iconSize={14}
              flexBasis={240}
              grow={1}
              maxW={320}
              px="$3"
              rounded="$4"
              bg="$color2"
              borderWidth={1}
              borderColor="$borderColor"
              hoverStyle={{ borderColor: '$color8' }}
            >
              <Text fontFamily={mono} fontSize="$1" color="$color11" text="left" flex={1} minW={0} numberOfLines={1}>
                {item.cmd}
              </Text>
            </Copyable>
          ))}
        </XStack>
      </YStack>
    </YStack>
  )
}
