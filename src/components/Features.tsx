/**
 * What the toolkit is for, once installed — the section that was already on this
 * page, with its copy unchanged and its markup moved onto the design system.
 */
import { H2, Text, XStack, YStack } from '@hanzo/gui'
import { Bot } from '@hanzogui/lucide-icons-2/icons/Bot'
import { Code } from '@hanzogui/lucide-icons-2/icons/Code'
import { Database } from '@hanzogui/lucide-icons-2/icons/Database'
import { Share2 } from '@hanzogui/lucide-icons-2/icons/Share2'

import { FEATURES, FEATURES_BLURB, FEATURES_TITLE, type Feature } from '../site'

const GLYPH: Record<Feature['icon'], typeof Code> = {
  Bot,
  Code,
  Database,
  Share2,
}

export function Features() {
  return (
    <XStack gap="$5" flexWrap="wrap" items="flex-start" width="100%">
      <YStack gap="$3" flexBasis={300} grow={1} minW={260}>
        <H2 fontSize={28} fontWeight="700" letterSpacing={-0.5} color="$color12">
          {FEATURES_TITLE}
        </H2>
        <Text fontSize="$4" color="$color10" lineHeight={24}>
          {FEATURES_BLURB}
        </Text>
      </YStack>

      <YStack gap="$2" flexBasis={320} grow={1} minW={260}>
        {FEATURES.map((feature) => {
          const Glyph = GLYPH[feature.icon]
          return (
            <XStack
              key={feature.title}
              gap="$3"
              p="$3"
              items="flex-start"
              rounded="$4"
              bg="$color2"
              borderWidth={1}
              borderColor="$borderColor"
              hoverStyle={{ borderColor: '$color8' }}
            >
              <YStack width={36} height={36} rounded="$3" bg="$color4" items="center" justify="center">
                <Glyph size={18} color="$color12" />
              </YStack>
              <YStack gap="$1" flex={1} minW={0}>
                <Text fontSize="$4" fontWeight="500" color="$color12">
                  {feature.title}
                </Text>
                <Text fontSize="$2" color="$color10" lineHeight={20}>
                  {feature.description}
                </Text>
              </YStack>
            </XStack>
          )
        })}
      </YStack>
    </XStack>
  )
}
