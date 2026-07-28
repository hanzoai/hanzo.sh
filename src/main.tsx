import { createRoot } from 'react-dom/client'

import './index.css'
import { App } from './App'

/**
 * Drop the polyglot's shell preamble from the rendered page.
 *
 * `dist/index.html` opens with `#!/bin/sh` and `<<\EOF` so `curl hanzo.sh | bash`
 * works (scripts/build-polyglot.js). Those two lines sit BEFORE `<!DOCTYPE html>`,
 * and the HTML parser has nowhere to put character data that precedes the
 * doctype except the top of `<body>` — so hanzo.sh has been shipping a visible
 * `#!/bin/sh <<\EOF` above its own header. It cannot be hidden with CSS (a text
 * node has no selector) and it cannot be commented out in the file (the shebang
 * must be byte one), so it is removed here, before the first paint.
 */
for (const node of Array.from(document.body.childNodes)) {
  if (node.nodeType === Node.TEXT_NODE) node.remove()
}

createRoot(document.getElementById('root')!).render(<App />)
