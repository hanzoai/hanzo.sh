# hanzo.sh

The install surface: one page that is also one installer. `curl hanzo.sh | bash`
installs the Hanzo toolkit; opening hanzo.sh in a browser renders the landing
page. Both are the same file.

## The polyglot

`pnpm build` is `vite build && node scripts/build-polyglot.js`. The second step
rewrites `dist/index.html` into a file that is simultaneously:

- a shell script — line 1 is `#!/bin/sh`, line 2 opens a `<<\EOF` heredoc that
  swallows the whole HTML document, and the installer (`public/install.sh`, minus
  its own shebang) follows the closing `EOF`;
- an HTML document — the heredoc content is the real page, and `</html>` is
  rewritten to `</html><!--` so the shell half is an HTML comment.

The installer body uses bash arrays, so the contract is `curl hanzo.sh | bash`,
not `| sh`. The Dockerfile asserts all three properties (shebang, `<!DOCTYPE
html>`, `bash -n`) and fails the build if any is lost — nothing downstream can
catch it, because everything downstream is bytes.

`public/install.sh` is also served at `/install.sh` for anyone who wants the
installer alone; `public/{bot,cli,agents,dev,full,mcp,node,python,rust}` are
per-bundle shims.

## Serving chain

```
push to main
  -> .github/workflows/sync.yml     carries refs to git.hanzo.ai (nothing else)
  -> .hanzo/workflows/deploy.yml    runs natively on the forge
       docker build .               Dockerfile: pnpm build -> polyglot assert
                                    -> FROM ghcr.io/hanzoai/static:v0.5.1
       docker push                  ghcr.io/hanzoai/hanzo-sh:<short-sha>
  -> hanzoai/universe               infra/k8s/operator/crs/hanzo-sh.yaml
       spec.image.tag: <short-sha>  set by a human, never by the build
  -> hanzoai/ingress                hanzo.sh -> Service hanzo-sh:80 -> :3000
```

`hanzoai/static` is a Go binary on scratch. It defaults to `-port 3000 -root
/public` and answers with `http.ServeContent`, so a file goes out byte-for-byte
with no rewrite, minify or injection — which is the only reason a polyglot can be
served from an ordinary static server at all. It runs WITHOUT `-spa`: this app has
exactly one route, so a mistyped path must 404 rather than return the installer.

`HANZO_STATIC_CSP` in the CR is a response header only; it cannot touch the body.
It sets `script-src 'self'`, which also means the third-party
`the scaffold generator's injected script` tag still sitting in `index.html` does not load —
that is intended, and the app does not depend on it.

## Not live from here yet

hanzo.sh is served today by a Cloudflare assets Worker named `hanzo-sh`
(`wrangler.toml`, `custom_domain = true`), published by hand with
`pnpm build && npx wrangler@3 deploy`. `wrangler.toml` stays until the image is
promoted; deleting it first would strand the live host.

Two things must be reconciled BEFORE anyone pins a tag in the CR:

1. **The CSP can come down to same-origin.** `main` used to `@import` Geist from
   `cdn.jsdelivr.net`, which is why the CR's CSP allows that host for styles and
   fonts. It does not any more: `@hanzo/design` ships both Geist faces as
   `woff2` inside the package and the build emits them into `dist/assets/`, so
   the page makes no third-party request at all. Drop `cdn.jsdelivr.net` from
   `HANZO_STATIC_CSP` when the image is promoted.
2. **Promotion order.** publish an image -> set `spec.image.tag` in
   `crs/hanzo-sh.yaml` -> add `- hanzo-sh.yaml` to `crs/kustomization.yaml` ->
   confirm the pod is Running and that `curl <pod>/ | bash -s -- --help` prints
   the installer usage -> only then repoint hanzo.sh DNS off the Worker -> then
   delete `wrangler.toml`.

The CR is committed INERT (empty tag, absent from `kustomization.yaml`).
Promoting an App with no image tag takes the host down instead of leaving it
alone.

## Stack

Vite 5 + React 19 on **@hanzo/ui** over the **@hanzo/gui** backend. One route
(`src/pages/Index.tsx`), no router — `hanzoai/static` runs without `-spa`, so the
routing decision is already made and a client-side router would only pretend to
make it again. pnpm 9; `pnpm-lock.yaml` is what the build resolves
(`--frozen-lockfile`).

```bash
pnpm install
pnpm dev        # vite, :8080
pnpm build      # -> dist/, including the polyglot rewrite
pnpm typecheck
pnpm lint
```

`scripts/polyglot.sh` is an unwired duplicate of `scripts/build-polyglot.js`;
only the `.js` is in `pnpm build`.

### Where the page comes from

There is no Tailwind, no shadcn and no Radix; the 48 generated `components/ui/*`
files and the 27 Radix packages behind them are gone.

- **@hanzo/products** — the header's launcher and the whole footer index. The
  content of both is settled once for the estate; hanzo.sh only declares its own
  four nav links and its one call-to-action (`src/site.ts`), because
  `@hanzo/products@0.2.0` has no `hanzo.sh` `SiteId` yet. When it does, `HEADER`
  collapses to `HEADERS['hanzo.sh']`.
- **@hanzo/ui/product** — `SiteNav`, `SiteFooter`, `BrandMark`, `Panel`,
  `StatusTag`, `ToastProvider`. The page used to draw two headers and two footers
  (a `Navbar` above a `Hero` that carried its own header, and a hand-written
  footer of `href="#"` links below the real one); these are the components that
  end that.
- **@hanzo/gui** — every primitive under it (`YStack`/`XStack`/`Text`/`Anchor`/
  `Separator`), on the shared scale from `@hanzo/ui/gui-config`.
- **@hanzo/design** — the token layer: monochrome, dark by default, Geist Sans
  and Geist Mono self-hosted in the package. `src/index.css` imports it and does
  nothing else.
- **@hanzo/logo** — the mark, through `BrandMark`.

`src/site.ts` is the page as data; `src/components/` renders it. Responsiveness
is `flexWrap` + `minW`, not breakpoints: the same tree reflows from 390px to
1280px with one media prop in the whole app.

### Two workarounds, both with a delete condition

`@hanzo/ui@8.0.26` has two defects this app has to route around. Both are marked
in place; remove them when the package is fixed.

1. `src/shims/hanzogui-next-theme.ts` — `@hanzo/ui/product` statically imports
   `@hanzogui/next-theme` (an *optional* peer whose entry imports `next/script`),
   because tsup put `ThemeToggle` and `ThemeToggleNext` in one chunk. No Vite app
   can resolve it. `vite.config.ts` aliases the specifier to a stub; nothing here
   renders a theme toggle.
2. `src/gui.config.ts` — `SiteNav` writes `$sm` meaning "phone", but v5 defines
   `sm` as `minWidth: 640`, so on the stock scale a phone gets the desktop link
   row and a desktop gets a hamburger. This app redefines that ONE key as
   `maxWidth: 639.98`; nothing else it renders reads `sm`.

Also unusable in 8.0.26: `@hanzo/ui/core`, `/tokens`, `/gui`, `/shadcn`,
`/components`, `/models`, `/primitives` — the exports map points them at `src/`,
which `files: ["dist"]` does not publish. `src/mono.ts` reaches the mono family
through `@hanzo/design` instead.
