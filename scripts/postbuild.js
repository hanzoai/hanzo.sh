#!/usr/bin/env node
/**
 * Two things Vite cannot know about the shape hanzo.sh is served in.
 *
 * 1. The document must NOT be dist/index.html. Static Assets serve an exact
 *    match before the Worker ever runs, so a file at that name would be handed
 *    to `curl hanzo.sh | sh` as HTML. It moves to page.html; worker.js decides
 *    which of page.html and install.sh `/` means.
 * 2. /install is a published alias of /install.sh (some deployed callers ask
 *    for it). One file in git, two names in dist — copied here rather than
 *    committed twice, and made from the same bytes so they cannot drift.
 */

import { copyFileSync, renameSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist')

renameSync(join(dist, 'index.html'), join(dist, 'page.html'))
copyFileSync(join(dist, 'install.sh'), join(dist, 'install'))

console.log('dist/page.html  the document, <!DOCTYPE html> at byte 0')
console.log('dist/install.sh the installer, also served as /install')
console.log('/               whichever of the two the Accept header asks for')
