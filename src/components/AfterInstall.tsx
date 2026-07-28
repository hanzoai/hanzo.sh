/**
 * The first four things to run once the installer has finished. Each line is
 * copyable for the same reason the hero command is: nobody retypes a command
 * they can take.
 */
import { Text, XStack, YStack } from '@hanzo/gui'
import { Panel } from '@hanzo/ui/product'
import { mono } from '../mono'

import { AFTER_INSTALL } from '../site'
import { Copyable } from './Copyable'

export function AfterInstall() {
  return (
    // `grow` (the default) puts `flex:1` on the card. That is right for the
    // side-by-side language panels; here the card is the only child of a COLUMN,
    // where `flex:1` means "min-height 0, take what's left" and the rows spill out
    // under the next section. A full-width card is what this is.
    <Panel title="After install" grow={false}>
      <YStack>
        {AFTER_INSTALL.map((line) => (
          <Copyable key={line.cmd} value={line.cmd} iconSize={14} rounded="$3" px="$2" hoverStyle={{ bg: '$color3' }}>
            <XStack items="center" gap="$2" flexBasis={0} grow={2} shrink={1} minW={0}>
              <Text fontFamily={mono} fontSize="$2" color="$color9" select="none">
                $
              </Text>
              <Text fontFamily={mono} fontSize="$2" color="$color12" text="left" flex={1} minW={0} numberOfLines={1}>
                {line.cmd}
              </Text>
            </XStack>
            <Text fontSize="$1" color="$color9" text="right" flexBasis={0} grow={1} shrink={1} minW={0} numberOfLines={1}>
              {line.desc}
            </Text>
          </Copyable>
        ))}
      </YStack>
    </Panel>
  )
}
