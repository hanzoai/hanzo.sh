# hanzo.sh

The install surface. One page, one command: `curl -fsSL hanzo.sh | bash`.

## Serving

`hanzo.sh` is a Cloudflare **assets Worker** (`wrangler.toml`, name `hanzo-sh`), not Pages and
not GitHub Pages. `.github/workflows/deploy.yml` builds and runs `wrangler deploy` on push to
main — that is the only path to production.

`dist/index.html` is a **polyglot**: a shell script whose HTML lives in a heredoc
(`scripts/build-polyglot.js`). One byte stream serves both `curl | bash` and browsers, so no
client sniffing can misfire. Consequence: the shell prefix precedes `<!DOCTYPE html>`, so the
browser parses in quirks mode and keeps a short text node at the top of `<body>` (covered by
the fixed header). Do not "fix" that by content-negotiating at the edge without a hard gate —
serving HTML to a piped shell is the one unacceptable failure on this surface.

## Structure

```
index.html          document shell
src/main.tsx        mount
src/Install.tsx     the page — header, install commands, footer. Exactly one of each.
src/index.css       Tailwind v4 entry: @font-face + @theme + base
src/fonts/          Geist Sans/Mono variable woff2, self-hosted
public/             served verbatim — install.sh and the /cli /mcp /dev /full shortcuts
scripts/            polyglot post-build
```

Theme lives in `src/index.css` (`@theme`), not a JS config. `--font-sans` / `--font-mono` feed
both Tailwind's preflight and the `font-sans` / `font-mono` utilities from one place.

## Fonts

Geist is **self-hosted** (`src/fonts/*.woff2`, bundled and hashed by Vite). A CDN `@import` was
tried and could not work: the URL 404s, and an `@import` cannot put an `@font-face` in our own
bundle. The build asserts the served CSS carries `@font-face`, `Geist`, an emitted `.woff2`,
and no remote `@import` — a source fix that misses the bundle is not a fix.

Verify in a real browser, not with `document.fonts.check()` (it returns true with zero
`@font-face` rules). Use CDP `CSS.getPlatformFontsForNode` and require `isCustomFont: true`; on
a box with Geist installed system-wide that flag is the only thing separating our webfont from
a system fallback.

## Build & run

```bash
pnpm install
pnpm build     # vite build + polyglot
pnpm dev
```
