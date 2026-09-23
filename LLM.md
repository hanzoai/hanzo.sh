# hanzo.sh

The install surface: one URL that answers with an installer or with a page,
whichever the caller asked for. `curl hanzo.sh | sh` installs the Hanzo tools;
opening hanzo.sh in a browser renders the landing page. Same URL, two
representations, `Accept` decides — they used to be the same *file*, which is a
different and worse thing (see below).

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
and installed nothing. Line 1 of what `/` hands curl is `#!/bin/sh`, so making
the body POSIX also makes that shebang honest.

## One URL, two answers

The edge holds the whole routing rule — routers `hanzo-sh-page`,
`hanzo-sh-install` and `hanzo-sh` in hanzo/universe
`infra/aws/routes/sites.yaml`, over `s3://hanzo-sites/hanzo/sh`:

```
GET /            Accept contains text/html  ->  page.html
                 anything else              ->  install.sh  (application/x-sh)
everything else                             ->  the matching file, or 404
```

`/` is sent `Vary: Accept` and `Cache-Control: no-store, no-transform`.
Cloudflare honours `Vary` only on `Accept-Encoding`, so a shared cache could
keep one representation and hand it to the other kind of client, breaking either
the page or `curl | sh`; `no-transform` keeps the edge from rewriting either.

`pnpm build` is `vite build && node scripts/postbuild.js`. postbuild moves the
document to `dist/page.html`, the name the edge rewrites `/` to, and copies
`dist/install.sh` to `dist/install` — one file in git, two published names, made
from the same bytes so they cannot drift.

### Why not the polyglot it used to be

`dist/index.html` used to be a single file that was both: `#!/bin/sh` on line 1,
`<<\EOF` swallowing the whole document, the installer after the closing `EOF`.
Both halves worked, and the browser half was never honest. Anything before
`<!DOCTYPE html>` that is not whitespace or a comment puts the document in quirks
mode, so a real Chromium reported, at 390 and 1280:

- `document.compatMode === "BackCompat"`;
- `document.head.children.length === 1` — all fifteen head elements (title, the
  icons, viewport, description, every `og:` and `twitter:` tag) parsed into
  `<body>`, where they do nothing;
- `#!/bin/sh <<\EOF` as the first text node of the page, first string in
  `document.body.innerText`, pushing `<main>` down 24px.

There is no arrangement of those bytes that avoids it. Only whitespace and
comments may precede a DOCTYPE, and an HTML comment starts `<!`, which the shell
reads as a redirect from a file named `!--`; a POSIX script cannot begin with
those two bytes at all. The trick was unfixable, not unlucky. Content
negotiation is what HTTP has for this.

`public/install.sh` is also served at `/install.sh` and `/install` for anyone who
wants the installer alone. `public/{cli,mcp,dev,node,bot,desktop,full}` are
routing shims — they only `exec sh -c "$(curl -fsSL https://hanzo.sh)" -- <tool>`,
so the one installer stays the single place that knows which tools exist and what
to say about the ones that do not. They are extensionless on purpose (the URL is
the product), which is why they go out with no `Content-Type`; `curl` does not
care and a browser sniffs.

## Serving chain

```
push to main
  -> .github/workflows/cicd.yml   hanzoai/ci build.yml@v2, the platform's JIT runners
       test  (amd64 + arm64)      pnpm build; doctype at byte 0; dash -n AND bash -n
       site  (hanzo.yml)          dist/ -> s3://hanzo-sites/hanzo/sh, via /v1/projects/sh
  -> hanzo.sh                     the edge serves that prefix
```

Publishing reconciles the prefix against the build, so a file the build stops
producing leaves the host too. The only credential is the org's KMS pair; the
site lane reads its deploy token from KMS. GitHub is the plane that runs this:
the forge copy is a mirror with Actions off, so a caller under
`.hanzo/workflows` runs nowhere.

hanzo.sh was a Cloudflare Worker (`worker.js`) until 2026-09-23, when the edge
took the host (universe `dd71c07db`). The Accept rule is two router matches and a
`replacePath`, so nothing runs per request, and the Worker's custom domain can
no longer attach because the name now points at the edge.

## Deploying is the change, not a follow-up

**A merge is not evidence of a deploy.** The live bytes once lagged `main` by
seven weeks, because the workflow that published them had been deleted and
nothing noticed. After landing anything on `main`, read the run and the host:

```sh
gh run list -R hanzoai/hanzo.sh -L 1
curl -fsS https://hanzo.sh | cmp - dist/install.sh          # the installer, exactly
curl -fsS -H 'Accept: text/html' https://hanzo.sh | head -1  # <!DOCTYPE html>
```

`hanzoai/hanzo.sh` is the one home. `hanzo-apps/sh`, the copy the old
workflow ran from, is archived.

### Cloudflare is injecting a robots.txt this host cannot afford

`/robots.txt` is not in this repo. Cloudflare Managed Content synthesises one for
the zone, and it carries `Disallow: /` for ClaudeBot, GPTBot, Google-Extended,
CCBot, Bytespider, Amazonbot, Applebot-Extended and meta-externalagent, plus
`Content-Signal: ai-train=no`. This is the one host whose stated job is to be
read by agents: it publishes `/llms.txt` for exactly those readers and the
installer header reasons about "every agent reading llms.txt". Publishing an
agent manifest and then telling the agents to go away is one host contradicting
itself.

Shipping `public/robots.txt` does not fix it — the managed block is appended to
whatever the origin serves, and a per-agent group beats a `User-agent: *` allow.
The fix is the zone toggle: Cloudflare dashboard -> hanzo.sh -> AI Crawl Control
-> Managed robots.txt, off. `hanzo.ai` and `hanzo.app` do not have this block;
`hanzo.bot` does, and has the same problem for the same reason.

## The page

`src/pages/Index.tsx` renders `Hero` and nothing else. `Hero` is the whole page
— it carries its own header and its own footer — so any sibling rendered beside
it is a second header and a second footer on the same screen. That is what
shipped for months: a leftover scaffold-template `Navbar`, `Features` and
`Footer` rendered under the real page, adding a competing fixed nav, four
invented feature cards, sixteen `href="#"` links, a "Simplifying application
development and deployment with innovative container solutions" strapline for a
company that does not sell containers, and a `© 2024` ten pixels below the real
copyright line. All five leftover components are deleted; do not reintroduce a
component that renders chrome.

The mark, everywhere it appears, is the canonical five-path Hanzo mark from
hanzoai/brand (`assets/logo/favicon.svg`): inline in `Hero.tsx` with
`fill="currentColor"`, and in `public/favicon.{svg,ico}` +
`favicon-{16,32}.png` + `apple-touch-icon.png`, which are byte-identical to the
files hanzo.ai serves. Do not redraw it and do not publish a second copy of it
under another name — a stale `hanzo-logo.svg` sat at the root for months,
referenced by nothing. `/og-image.png` is built from `scripts/og-image.svg` with
`rsvg-convert -w 1200 -h 630`; every string on it is copy that is already on the
page. `og:image` is absolute, because scrapers do not all resolve relative URLs
— it pointed at `/og-image.svg`, a file that never existed in this repo, so
every social card resolved to a 404.

Zen and Zen Mono are served from `/fonts/` as two variable woff2, with the SIL
OFL notice beside them at `public/fonts/LICENSE-Zen.txt`. They are served from
this origin, not a CDN: a cross-origin font fetch that 404s is not a console
error, so a broken `@import` reads as a working page in the system fallback and
nothing surfaces it. The brand typeface is not something to borrow from a CDN on
the host whose whole job is one curl command.

## Stack

Vite 8 + React 19 + Tailwind 4, one route (`src/pages/Index.tsx`). pnpm 9;
`pnpm-lock.yaml` is what the build resolves (`--frozen-lockfile`).

```bash
pnpm install
pnpm dev      # vite, :8080
pnpm build    # -> dist/, page.html + install.sh
pnpm lint
```

Verify an installer change without deploying by running the built file under
BOTH published shells:

```sh
pnpm build
sh dist/install.sh
bash dist/install.sh
```
