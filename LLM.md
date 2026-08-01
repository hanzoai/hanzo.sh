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

- **`dev`** — `hanzoai/dev` is private, so an anonymous `curl | sh` gets 404. It
  also publishes no per-asset checksums. This is the one that hurts: `dev` is the
  agent `hanzo code` runs by default, so a public install produces a CLI whose
  headline command cannot run its own default backend (`hanzo code claude` and
  `hanzo code codex` name other backends). Making that repo public and adding
  `.sha256` siblings is all that is needed — then it is one row in `TOOLS`.
- **`node`** — `hanzoai/node` is private; same 404, no checksums. Its asset is
  also a ~277 MB zip with vendored runtimes rather than a lone binary, so it does
  not fit the one convention yet.
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

`public/install.sh` is also served at `/install.sh` for anyone who wants the
installer alone. `public/{cli,mcp,dev,node,bot,desktop,full}` are routing shims —
they only `exec sh -c "$(curl -fsSL https://hanzo.sh)" -- <tool>`, so the one
installer stays the single place that knows which tools exist and what to say
about the ones that do not.

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
repo while `curl hanzo.sh | bash` kept installing the old thing. Anyone changing
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

1. **The live bytes are not on `main`.** The running Worker was published from
   commit `340fd8f`, which lives on `origin/rescue/main-local`, not on `main`.
   `main` still `@import`s Geist from `cdn.jsdelivr.net` (`src/index.css` lines
   1-2) where `rescue/main-local` self-hosts it. The CR's CSP therefore allows
   `cdn.jsdelivr.net` for styles and fonts; land the self-hosting commit on
   `main` and both entries come out, leaving the policy same-origin.
2. **Promotion order.** publish an image -> set `spec.image.tag` in
   `crs/hanzo-sh.yaml` -> add `- hanzo-sh.yaml` to `crs/kustomization.yaml` ->
   confirm the pod is Running and that `curl <pod>/ | sh -s -- --help` prints the
   installer usage -> only then repoint hanzo.sh DNS off the Worker -> then
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

Verify an installer change without deploying by serving `dist/` and piping it to
BOTH shells — the polyglot must run under each:

```sh
cd dist && python3 -m http.server 8791 &
curl -fsSL http://127.0.0.1:8791 | sh
curl -fsSL http://127.0.0.1:8791 | bash
```
