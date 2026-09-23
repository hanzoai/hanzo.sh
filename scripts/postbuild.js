#!/usr/bin/env node
/**
 * Two things Vite cannot know about the shape hanzo.sh is served in.
 *
 * 1. The document is also page.html, the name hanzo.sh's edge rule rewrites
 *    `/` to for a browser (install.sh for anything else). index.html stays: the
 *    Sites plane serves and reads back an export by its index.
 * 2. /install is a published alias of /install.sh (some deployed callers ask
 *    for it). One file in git, two names in dist — copied here rather than
 *    committed twice, and made from the same bytes so they cannot drift.
 */

import { copyFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist')

copyFileSync(join(dist, 'index.html'), join(dist, 'page.html'))
copyFileSync(join(dist, 'install.sh'), join(dist, 'install'))

console.log('dist/page.html  the document, <!DOCTYPE html> at byte 0')
console.log('dist/install.sh the installer, also served as /install')
console.log('/               whichever of the two the Accept header asks for')
