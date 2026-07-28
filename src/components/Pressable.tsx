/**
 * A pressable row that is a real `<button>`.
 *
 * `accessibilityRole="button"` on a gui stack renders NOTHING on web — no `role`,
 * no tab stop — so a div styled to look like a control is unreachable by keyboard
 * and silent to assistive tech. gui's own `Button` solves this by handing
 * `styled()` the element to render; this does the same, minus `Button`'s label
 * layout (these rows compose an icon, a command and a state glyph themselves).
 *
 * It also carries the tap floor, so every control on the page inherits 44px from
 * one place rather than remembering it four times.
 *
 * It cannot carry text alignment: a `<button>` centres its text by UA default and
 * `textAlign` is a TEXT style, which a stack does not accept. The rows that must
 * read left say so on their own `Text`.
 */
import { styled, XStack } from '@hanzo/gui'
import { TAP } from '@hanzo/ui/framework'

export const Pressable = styled(XStack, {
  name: 'Pressable',
  role: 'button',
  render: <button type="button" />,
  tabIndex: 0,
  minH: TAP,
  items: 'center',
  gap: '$2',
  cursor: 'pointer',
  borderWidth: 0,
  bg: 'transparent',
  focusVisibleStyle: { outlineColor: '$color8', outlineStyle: 'solid', outlineWidth: 2 },
})
