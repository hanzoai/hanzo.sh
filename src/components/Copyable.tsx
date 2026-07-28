/**
 * The ONE copy affordance on this page.
 *
 * Every clickable thing here does the same job — put a shell command on the
 * clipboard — so it is one component, not four hand-rolled onClick handlers with
 * four `copied` states that drifted apart. Callers supply the shell (a command
 * row, a chip, a grid cell) as style props; the behaviour, the confirmation
 * icon, the label and the tap target come from here.
 */
import { useCallback, useState, type ReactNode } from 'react'
import type { XStackProps } from '@hanzo/gui'
import { useToast } from '@hanzo/ui/product'
import { Check } from '@hanzogui/lucide-icons-2/icons/Check'
import { Copy } from '@hanzogui/lucide-icons-2/icons/Copy'

import { Pressable } from './Pressable'

export type CopyableProps = Omit<XStackProps, 'children'> & {
  /**
   * What lands on the clipboard. NOT named `text`: that is the v5 shorthand for
   * `textAlign`, and a prop of the same name intersects the style prop to `never`
   * — every call site then fails to typecheck with no hint as to why.
   */
  value: string
  /** The row's contents, left of the state icon. */
  children: ReactNode
  /** Size of the trailing state icon. */
  iconSize?: number
}

export function Copyable({ value, children, iconSize = 16, ...rest }: CopyableProps) {
  const [copied, setCopied] = useState(false)
  const { success, error } = useToast()

  const copy = useCallback(() => {
    navigator.clipboard.writeText(value).then(
      () => {
        setCopied(true)
        success('Copied', value)
        setTimeout(() => setCopied(false), 2000)
      },
      () => error('Could not copy', 'Select the command and copy it by hand.'),
    )
  }, [value, success, error])

  return (
    <Pressable onPress={copy} aria-label={`Copy ${value}`} {...rest}>
      {children}
      {copied ? <Check size={iconSize} color="$color12" /> : <Copy size={iconSize} color="$color10" />}
    </Pressable>
  )
}
