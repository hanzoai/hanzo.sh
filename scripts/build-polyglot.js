#!/usr/bin/env node
/**
 * Turn the built page into the polyglot, and emit the installer's second name.
 *
 * `dist/index.html` becomes a file that is simultaneously a shell script (line 1
 * is `#!/bin/sh`, line 2 opens a `<<\EOF` heredoc that swallows the document, and
 * the installer follows the closing `EOF`) and an HTML document (`</html>` is
 * rewritten to `</html><!--`, so the shell half is a comment). That is what makes
 * `curl hanzo.sh | sh` and opening hanzo.sh in a browser the same bytes.
 *
 * `dist/install` is the installer under the extensionless name — the path
 * hanzo.ai/install.sh's one-liner actually fetches. It is GENERATED, not a second
 * file in `public/`: two committed copies of an installer is one copy that
 * drifts, and the one that drifts is the one nobody reads. `public/install.sh` is
 * the only installer in this repo, and all three of its published faces — the
 * polyglot, `/install.sh`, `/install` — are read from it here.
 */

import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..')
const distDir = join(rootDir, 'dist')

const installer = readFileSync(join(rootDir, 'public', 'install.sh'), 'utf-8')

// The heredoc body is the page; the installer follows it MINUS its own shebang,
// because line 1 of the polyglot is already `#!/bin/sh`.
const html = readFileSync(join(distDir, 'index.html'), 'utf-8').replace('</html>', '</html><!--')
const body = installer.slice(installer.indexOf('\n') + 1)

writeFileSync(join(distDir, 'index.html'), `#!/bin/sh\n<<\\EOF\n${html}\nEOF\n\n${body}\n`)
writeFileSync(join(distDir, 'install'), installer)

console.log('✓ Created polyglot index.html')
console.log('  curl hanzo.sh | sh    →  runs installer')
console.log('  open hanzo.sh         →  shows landing page')
console.log('✓ Wrote dist/install — the installer under its extensionless name')
