# hanzo.sh

The install surface: one page that is also one installer. `curl hanzo.sh | sh`
installs the Hanzo tools; opening hanzo.sh in a browser renders the landing page.
Both are the same file.

## What the installer does

Downloads one prebuilt native binary per tool, verifies its sha256, puts it on
PATH. That is all of it. No package manager, no runtime, no build step, no
compiler — and specifically nothing that installs a language toolchain in order
to deliver a program written in a different language.

It installs, and this list is the whole list:

| tool | repo | binary | second name |
|---|---|---|---|
| `hanzo` | hanzoai/cli | `hanzo` | `hanzo-node` |
| `mcp` | hanzoai/mcp | `hanzo-mcp` | `mcp` |
| `dev` | hanzoai/dev | `dev` | — |

`dev` takes no second name. cli/install.sh defaults the alias to `hanzo-node`,
which the CLI already owns; giving it to `dev` too would leave the delegate name
pointing at a different program.

Both names of a pair are ONE build — a symlink, so they cannot drift. That
property is load-bearing for the CLI: cloud's control binary resolves
`hanzo-node` before `hanzo` and delegates to it, so two versions under two names
means a user types `hanzo` and silently runs an old build.

### It does not re-implement downloading

`hanzoai/cli/install.sh` is the ONE implementation of "fetch a Hanzo binary".
Platform detection, asset naming, checksum verification, the second-name symlink
and the PATH-shadow warning all live there, once. `public/install.sh` fetches it
and runs it once per tool, varying three env vars:

```
HANZO_INSTALL_REPO   HANZO_INSTALL_BIN   HANZO_INSTALL_ALIAS
```

That works because every published Hanzo binary follows one convention: asset
`<BIN>-<os>-<arch>.tar.gz`, a sibling `<asset>.sha256`, unpacking to a single
file named `<BIN>`. `BIN` alone therefore determines the asset, the checksum and
the payload — which is why adding a tool is one row in `TOOLS` and no new code.

A second copy of platform detection here would be the same class of bug as two
copies of a route table, and the copy that drifts is the one nobody reads.

### Tools it does NOT install, and why

Named in the output rather than quietly substituted. An installer that reaches
for a package manager so the list looks complete is the exact defect this file
was rewritten to remove.

- **`node`** — `hanzoai/node` is private; a 404 to an anonymous fetch, and no
  per-asset checksums. Its asset is also a ~277 MB zip with vendored runtimes
  rather than a lone binary, so it does not fit the one convention yet.
- **`desktop`** — `hanzoai/desktop` is private, and its latest release is
  linux-amd64 only with an orphaned macOS signature. `hanzo desktop` (a CLI verb)
  is unaffected and works; the standalone Tauri app is what is unavailable.
- **`bot`** — not a native binary at all. `hanzo bot` (a CLI verb) works; the
  standalone bot node is a JS package, so installing it here would mean shelling
  out to a package manager.

**Name collision to keep in mind:** the CLI installs its second name as
`hanzo-node`, and `hanzoai/node` also builds a binary called `hanzo-node`. They
are different programs. Nothing collides today because `node` is not installed,
but whoever makes `hanzoai/node` public must rename one of them first.

### POSIX on purpose

The installer is POSIX sh: no arrays, no `[[ ]]`, no `<<<`, no `echo -e`, no
`set -o pipefail`. Both published one-liners therefore work.

They did not before. The page said `| bash` and `public/llms.txt` said `| sh`
while the script was bash-only, so everyone who copied the `sh` form — including
every agent reading llms.txt — got `set: Illegal option -o pipefail` out of dash
and installed nothing. The polyglot already declares `#!/bin/sh`, so making the
body POSIX also makes that shebang honest.

## The polyglot

`pnpm build` is `vite build && node scripts/build-polyglot.js`. The second step
rewrites `dist/index.html` into a file that is simultaneously:

- a shell script — line 1 is `#!/bin/sh`, line 2 opens a `<<\EOF` heredoc that
  swallows the whole HTML document, and the installer (`public/install.sh`, minus
  its own shebang) follows the closing `EOF`;
- an HTML document — the heredoc content is the real page, and `</html>` is
  rewritten to `</html><!--` so the shell half is an HTML comment.

The Dockerfile asserts all four properties (shebang, `<!DOCTYPE html>`, `dash -n`
AND `bash -n`) and fails the build if any is lost — nothing downstream can catch
it, because everything downstream is bytes. `dash` is the strict one; a bash-only
assert is what let the pipefail break ship in the first place.

The same step writes `dist/install`, the installer under its extensionless name —
the path `hanzo.ai/install.sh`'s one-liner fetches, where a 404 is SILENT (`curl
-f` writes nothing and exits 22, and `sh` reading an empty script exits 0, so the
documented command reports success and installs nothing). It is generated from
`public/install.sh`, not committed a second time; it was a byte-identical copy in
`public/` with a comment saying the two must stay identical, which is a contract
with no enforcement. The Dockerfile now `cmp`s them.

So `public/install.sh` is the ONE installer, published under three names —
`/`, `/install.sh`, `/install` — all read from that file by the build.
`public/{cli,mcp,dev,node,bot,desktop,full}` are routing shims: they only
`exec sh -c "$(curl -fsSL https://hanzo.sh)" -- <tool>`, so the one installer
stays the single place that knows which tools exist and what to say about the
ones that do not.

## Serving chain

```
push to main
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
It sets `script-src 'self'`, which the page now satisfies outright: the
third-party `the scaffold generator's injected script` tag is gone from `index.html` (it was
a build-tool artifact the CSP was already blocking and nothing depended on), and
so is the CDN font `@import`.

## Not live from here yet — and the staleness this causes

hanzo.sh is served today by a Cloudflare assets Worker named `hanzo-sh`
(`wrangler.toml`, `custom_domain = true`), published BY HAND with
`pnpm build && npx wrangler@3 deploy`. `wrangler.toml` stays until the image is
promoted; deleting it first would strand the live host.

`.github/workflows/deploy.yml` now does that publish and then re-fetches
https://hanzo.sh, failing unless the live md5 equals the file it just built.

**Open, and it matters: `on: push` does not fire on this repo.** Measured
2026-08-01 — four consecutive pushes to `main` (`db9c4d8`, `fdc08d5`, `85c7e11`,
`6214745`) created zero workflow runs and zero PushEvents, while `repos/.../
pushed_at` advanced each time, so GitHub received them. `workflow_dispatch` on
the identical file works every time. Not the cause: Actions is enabled
(`allowed_actions: all`), the workflow is `active`, the file is on `main` with
`branches: [main]`, there are no rulesets, the repo is public (so Actions minutes
do not apply), and pushing via the canonical `hanzo-apps/hanzo.sh` remote rather
than the `hanzoai/hanzo.sh` redirect changed nothing. The last push-triggered run
here was 2026-07-27. Other repos in the org do have push runs, so it is not an
org-wide block.

Until that is understood, **a merge is not a deploy** — dispatch it:

```sh
gh workflow run deploy.yml -R hanzo-apps/hanzo.sh --ref main
```

**A hand-published host is why a fix can be merged and still not reach anyone.**
The live bytes lagged `main` by weeks — long enough that a correct fix sat in the
repo while `curl hanzo.sh | sh` kept installing the old thing. Anyone changing
`public/install.sh` must therefore treat deploying as part of the change, and
verify against the live URL, not the repo:

```sh
curl -sS https://hanzo.sh | md5sum          # before
# ... deploy ...
curl -sS https://hanzo.sh | md5sum          # must differ
curl -sS https://hanzo.sh | grep -c astral  # must be 0
```

Cloudflare answers `cf-cache-status: HIT` with `max-age=0, must-revalidate`, so a
purge is part of deploying too, not an afterthought.

Two things must still be reconciled BEFORE anyone pins a tag in the CR:

1. **The CSP can come down to same-origin.** `main` used to `@import` Geist from
   `cdn.jsdelivr.net`, which is why the CR's CSP allows that host for styles and
   fonts. It does not any more: `@hanzo/design` ships both Geist faces as
   `woff2` inside the package and the build emits them into `dist/assets/`, so
   the page makes no third-party request at all. Drop `cdn.jsdelivr.net` from
   `HANZO_STATIC_CSP` when the image is promoted.
2. **Promotion order.** publish an image -> set `spec.image.tag` in
   `crs/hanzo-sh.yaml` -> add `- hanzo-sh.yaml` to `crs/kustomization.yaml` ->
   confirm the pod is Running and that `curl <pod>/ | sh -s -- --help` prints the
   installer usage -> only then repoint hanzo.sh DNS off the Worker -> then
   delete `wrangler.toml`.

The CR is committed INERT (empty tag, absent from `kustomization.yaml`).
Promoting an App with no image tag takes the host down instead of leaving it
alone.

## The page

`src/pages/Index.tsx` is the whole page: one `SiteNav`, five sections, one
`SiteFooter`. Chrome comes from `@hanzo/ui/product`, so no component here draws a
header or a footer — that rule is what ended the months this site shipped TWO of
each (a leftover scaffold-template `Navbar` above a `Hero` that carried its own,
and a hand-written footer of sixteen `href="#"` links below the real one).

The sections say what `public/install.sh` does and stop there: the one command,
the three tools it installs, the three it does not, what to run afterwards, where
to read more. The template also shipped four invented feature cards and a
"Simplifying application development and deployment with innovative container
solutions" strapline for a company that does not sell containers; those are
deleted. Nothing on this page may claim something the installer does not do.

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
pnpm typecheck  # tsgo
pnpm lint
```

`typecheck` runs **tsgo**, the native (Go) TypeScript 7 compiler, from
`@typescript/native-preview`. It accepts this project's config as-is — no
`baseUrl`, `moduleResolution: bundler` — and reports the same errors `tsc` 5.9
does, which is how the one workaround in `App.tsx` was confirmed to be an
upstream type break rather than a compiler difference. `typescript` 5 stays
installed because `typescript-eslint` parses with it; nothing else uses it.

Verify an installer change without deploying by serving `dist/` and piping it to
BOTH shells — the polyglot must run under each:

```sh
cd dist && python3 -m http.server 8791 &
curl -fsSL http://127.0.0.1:8791 | sh
curl -fsSL http://127.0.0.1:8791 | bash
```

### Where the page comes from

There is no Tailwind, no shadcn and no Radix; the 48 generated `components/ui/*`
files and the 27 Radix packages behind them are gone.

- **@hanzo/products** — the header's launcher and the whole footer index. The
  content of both is settled once for the estate; hanzo.sh only declares its own
  four nav links and its one call-to-action (`src/site.ts`), because
  `@hanzo/products@0.2.0` has no `hanzo.sh` `SiteId` yet. When it does, `HEADER`
  collapses to `HEADERS['hanzo.sh']`.
- **@hanzo/ui/product** — `SiteNav`, `SiteFooter`, `BrandMark`, `Panel`,
  `ToastProvider`. The page used to draw two headers and two footers (a `Navbar`
  above a `Hero` that carried its own header, and a hand-written footer of
  `href="#"` links below the real one); these are the components that end that.
- **@hanzo/gui** — every primitive under it (`YStack`/`XStack`/`Text`/`Anchor`/
  `Separator`), on the shared scale from `@hanzo/ui/gui-config`, imported
  UNMODIFIED. `src/gui.config.ts` used to re-create it to redefine `sm`, because
  `@hanzogui/config@7`'s `sm` was `minWidth: 640` while `SiteNav` writes `$sm`
  meaning "phone" — a phone got the desktop link row and a desktop got the
  hamburger. `@hanzogui/config@8` defines `sm` as `maxWidth: 800`; the override
  is deleted.
- **@hanzogui/lucide-icons-2** — icons, from the package ROOT
  (`import { Terminal } from '@hanzogui/lucide-icons-2'`), never the
  `./icons/<Name>` subpath. The subpath exports carry no `types` condition in
  8.0.1, so every deep import is an implicit `any` under `noImplicitAny`. The
  root barrel is typed and the package is `sideEffects: false`, so Rollup drops
  the ~1750 icons this page does not render — verified in `dist/`.
- **@hanzo/design** — the token layer: monochrome, dark by default, Geist Sans
  and Geist Mono self-hosted in the package. `src/index.css` imports it and does
  nothing else.
- **@hanzo/logo** — the mark, through `BrandMark`. Not a direct dependency:
  `@hanzo/ui` already depends on it, and declaring a package nothing here imports
  is how a dependency list starts lying. `@hanzo/brand` is deliberately absent
  too — it is the MULTI-brand registry, and hanzo.sh is one brand. Reaching for
  it here is how a Lux or Zoo mark ends up on a Hanzo surface.
- **@hanzo/data** — the one dependency nothing in `src/` imports, and it is not a
  mistake: it is a PEER of `@hanzo/ui`, whose `product` barrel imports it, and a
  peer is the app's to provide. Under pnpm's strict layout, dropping it does not
  shrink anything — it breaks resolution at build time.

`src/site.ts` is the page as data; `src/components/` renders it. Responsiveness
is `flexWrap` + `minW`, not breakpoints: the same tree reflows from 390px to
1280px with one media prop in the whole app.

### Two workarounds, both with a delete condition

`@hanzo/ui@8.0.39` + `@hanzo/gui@8.0.1` leave two things this app routes around.
Both are marked in place; remove them when the packages are fixed, and the fix
belongs upstream in both cases.

1. `src/shims/hanzogui-next-theme.ts` — `@hanzo/ui/product`'s barrel statically
   re-exports `ThemeToggleNext`, whose module imports `@hanzogui/next-theme`, an
   *optional* peer whose own entry imports `next/script`. No Vite app can resolve
   it. `vite.config.ts` aliases the specifier to a stub; nothing here renders a
   theme toggle. (8.0.39 already split `ThemeToggleNext` into its own module —
   what is left is the one re-export line.)
2. The config cast in `src/App.tsx` — the type `@hanzo/ui/gui-config` publishes is
   not assignable to the `config` prop `@hanzo/gui`'s `GuiProvider` declares, on
   `animations` and on `defaultProps.View`. Declaration-level only; one object,
   and neither field is set here. `tsc` 5.9 rejects it identically, so it is not
   a tsgo difference. Re-creating the scale locally would silence it and fork the
   scale, which is the thing `@hanzo/ui/gui-config` exists to prevent.

The subpaths that were unresolvable in 8.0.26 — `@hanzo/ui/core`, `/tokens`,
`/models`, `/primitives` — resolve now. `src/mono.ts` still reaches the mono
family through `@hanzo/design` rather than `@hanzo/ui/core`'s `fontMono`: that
one reads `--font-geist-mono` from `@hanzo/ui/theme.css`, and importing a second
stylesheet to name one family would put two token layers on one page.
