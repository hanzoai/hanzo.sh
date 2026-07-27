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

1. **The live bytes are not on `main`.** The running Worker was published from
   commit `340fd8f`, which lives on `origin/rescue/main-local`, not on `main`.
   `main` still `@import`s Geist from `cdn.jsdelivr.net` (`src/index.css` lines
   1-2) where `rescue/main-local` self-hosts it. The CR's CSP therefore allows
   `cdn.jsdelivr.net` for styles and fonts; land the self-hosting commit on
   `main` and both entries come out, leaving the policy same-origin.
2. **Promotion order.** publish an image -> set `spec.image.tag` in
   `crs/hanzo-sh.yaml` -> add `- hanzo-sh.yaml` to `crs/kustomization.yaml` ->
   confirm the pod is Running and that `curl <pod>/ | bash -s -- --help` prints
   the installer usage -> only then repoint hanzo.sh DNS off the Worker -> then
   delete `wrangler.toml`.

The CR is committed INERT (empty tag, absent from `kustomization.yaml`).
Promoting an App with no image tag takes the host down instead of leaving it
alone.

## Stack

Vite 5 + React 19 + Tailwind 4, one route (`src/pages/Index.tsx`). pnpm 9;
`pnpm-lock.yaml` is what the build resolves (`--frozen-lockfile`).

```bash
pnpm install
pnpm dev      # vite, :8080
pnpm build    # -> dist/, including the polyglot rewrite
pnpm lint
```

`scripts/polyglot.sh` is an unwired duplicate of `scripts/build-polyglot.js`;
only the `.js` is in `pnpm build`.
