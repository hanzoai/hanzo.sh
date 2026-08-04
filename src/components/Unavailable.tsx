/**
 * The tools the installer does NOT install, and why.
 *
 * Named on the page for the same reason `public/install.sh` names them in its
 * output: the alternative is someone discovering it, and the alternative to THAT
 * is an installer that reaches for a package manager so the list looks complete.
 */
import { Text, XStack, YStack } from '@hanzo/gui'
import { Panel } from '@hanzo/ui/product'
import { mono } from '../mono'

import { UNAVAILABLE } from '../site'

export function Unavailable() {
  // `grow={false}`: the card is the only child of a COLUMN, where the default
  // `flex:1` means "min-height 0, take what is left" and the rows spill out under
  // the next section. Full width is what this is.
  return (
    <Panel title="Not installed yet" grow={false}>
      <YStack gap="$1.5">
        {UNAVAILABLE.map((row) => (
          <XStack key={row.bin} items="flex-start" justify="space-between" gap="$4">
            <Text fontFamily={mono} fontSize="$1" color="$color12" shrink={0}>
              {row.bin}
            </Text>
            <Text fontSize="$1" color="$color10" text="right" shrink={1} lineHeight={18}>
              {row.why}
            </Text>
          </XStack>
        ))}
      </YStack>
    </Panel>
  )
}
