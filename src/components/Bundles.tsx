/**
 * The four `--bundle` values `public/install.sh` accepts. Each cell copies the
 * command that selects it, so the list is not just documentation.
 */
import { Text, XStack, YStack } from '@hanzo/gui'
import { StatusTag } from '@hanzo/ui/product'
import { mono } from '../mono'

import { BUNDLES } from '../site'
import { Copyable } from './Copyable'

export function Bundles() {
  return (
    <YStack gap="$2" width="100%">
      <Text fontSize="$2" color="$color10" text="center">
        Installation bundles
      </Text>
      <XStack gap="$2" flexWrap="wrap" items="stretch" width="100%">
        {BUNDLES.map((bundle) => (
          <Copyable
            key={bundle.name}
            value={`curl -fsSL hanzo.sh | bash -s -- --bundle ${bundle.name}`}
            iconSize={14}
            items="flex-start"
            py="$2.5"
            px="$3"
            flexBasis={220}
            grow={1}
            rounded="$4"
            bg="$color2"
            borderWidth={1}
            borderColor={bundle.emphasis ? '$color8' : '$borderColor'}
            hoverStyle={{ borderColor: '$color8' }}
          >
            <YStack gap="$1" flex={1} minW={0}>
              <XStack items="center" gap="$2" flexWrap="wrap">
                <Text fontFamily={mono} fontSize="$2" color="$color12" text="left">
                  {bundle.name}
                </Text>
                {bundle.note ? <StatusTag status={bundle.note} /> : null}
              </XStack>
              <Text fontSize="$1" color="$color10" text="left">
                {bundle.desc}
              </Text>
            </YStack>
          </Copyable>
        ))}
      </XStack>
    </YStack>
  )
}
