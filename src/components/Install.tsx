/**
 * The install block: the headline, the one command, and the shorter ways to say
 * the same thing.
 *
 * The command row is the page. Everything else on it is a variation of that row,
 * so they are all the same `Copyable`.
 */
import { useState } from 'react'
import { H1, Text, XStack, YStack } from '@hanzo/gui'
import { Terminal } from '@hanzogui/lucide-icons-2'
import { mono } from '../mono'

import { INSTALLS, INSTALL_NOTE, SHORTCUTS } from '../site'
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
          The Hanzo CLI, the MCP server and the coding agent, as native binaries. One command, nothing to build.
        </Text>
      </YStack>

      <YStack gap="$2" width="100%" maxW={560}>
        {/* Which tool — the installer's whole set, and its default. */}
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

        <Text fontSize="$1" color="$color10" text="center" lineHeight={18}>
          {INSTALL_NOTE}
        </Text>
      </YStack>

      {/* The per-tool shims this host actually serves. */}
      <XStack gap="$2" flexWrap="wrap" justify="center" width="100%">
        {SHORTCUTS.map((s) => (
          <Copyable
            key={s.path}
            value={s.cmd}
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
    </YStack>
  )
}
