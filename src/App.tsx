/**
 * The app shell: the ONE Hanzo scale (`@hanzo/ui/gui-config`, the same config the
 * console and hanzo.sites render against, so this property cannot drift from
 * them), dark by default, and the toast host `Copyable` reports into.
 *
 * The scale arrives through `./gui.config`, which is that config with ONE media
 * key redefined and nothing else touched — see the file for why, and for the
 * condition under which it is deleted.
 *
 * There is no router. This app has exactly one route — `hanzoai/static` serves it
 * WITHOUT `-spa` precisely so a mistyped path 404s instead of handing back the
 * installer — so a client-side router would only be a dependency pretending to
 * make a decision that has already been made.
 */
import { GuiProvider } from '@hanzo/gui'
import { ToastProvider } from '@hanzo/ui/product'

import guiConfig from './gui.config'
import { Index } from './pages/Index'

export function App() {
  return (
    <GuiProvider config={guiConfig} defaultTheme="dark">
      <ToastProvider>
        <Index />
      </ToastProvider>
    </GuiProvider>
  )
}
