#!/usr/bin/env node
/**
 * Post-build script to create polyglot index.html
 * Makes the site work with: curl hanzo.sh | bash
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const distDir = join(rootDir, 'dist');
const publicDir = join(rootDir, 'public');

// Read the built HTML
const indexPath = join(distDir, 'index.html');
let html = readFileSync(indexPath, 'utf-8');

// Read the install script (skip shebang)
const installScript = readFileSync(join(publicDir, 'install.sh'), 'utf-8');
const scriptContent = installScript.split('\n').slice(1).join('\n');

// Modify HTML closing tag to start HTML comment (hides shell script from browser)
html = html.replace('</html>', '</html><!--');

// Create polyglot file
const polyglot = `#!/bin/sh
<<\\EOF
${html}
EOF

${scriptContent}
`;

writeFileSync(indexPath, polyglot);
console.log('✓ Created polyglot index.html');
console.log('  curl hanzo.sh | bash  →  runs installer');
console.log('  open hanzo.sh         →  shows landing page');
