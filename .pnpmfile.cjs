// TypeScript 7 side-by-side arrangement (typescript-eslint#10940): tsc runs
// typescript@7, but typescript-eslint supports only the TS 6 API. Giving the
// lint packages typescript@6 as their OWN dependency makes require('typescript')
// resolve to 6 inside them while the project's typescript stays 7. Delete this
// file when typescript-eslint supports TS >= 7.1.
function readPackage(pkg) {
  if (pkg.name === 'typescript-eslint' || (pkg.name || '').startsWith('@typescript-eslint/')) {
    if (pkg.peerDependencies && pkg.peerDependencies.typescript) {
      delete pkg.peerDependencies.typescript
      pkg.dependencies = { ...pkg.dependencies, typescript: '6.0.3' }
    }
  }
  return pkg
}
module.exports = { hooks: { readPackage } }
