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

`worker.js` is the whole routing rule:

```
GET /            Accept contains text/html  ->  dist/page.html
                 anything else              ->  dist/install.sh
everything else                             ->  the matching asset, or 404
```

`/` is sent `vary: accept` and `cache-control: no-store, no-transform`.
Cloudflare honours `Vary` only on `Accept-Encoding`, and a shared cache that
keeps one representation and hands it to the other kind of client breaks either
the page or `curl | sh`. `no-transform` is for a second edge behaviour: this zone
has Web Analytics auto-injection on, and it appends a
`static.cloudflareinsights.com` beacon to HTML that a **Worker** returns — it
leaves plain assets alone, which is why the page carried no beacon while it was
a static file and picked one up the moment `/` became a Worker response. This
host does not ship third-party script it did not write. The assets behind `/`
cache normally.

That is also why the deploy gate compares the document at `/page.html` rather
than at `/`: an edge injection the Worker asks for and does not control cannot be
allowed to fail a deploy. What it asserts about `/` is that a browser gets a
document whose first 15 bytes are `<!DOCTYPE html>` and that names this build's
content-hashed stylesheet, which is the staleness question that actually
matters.

`pnpm build` is `vite build && node scripts/postbuild.js`. postbuild does two
things Vite cannot know about: it moves the document to `dist/page.html` (Static
Assets serve an exact path match BEFORE the Worker runs, so a file at
`dist/index.html` would be handed to `curl hanzo.sh | sh` as HTML), and it copies
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
  -> .github/workflows/deploy.yml   ubuntu-latest (this org registers no runner)
       pnpm build                   -> dist/page.html + dist/install.sh
       assert                       doctype at byte 0; dash -n AND bash -n
       npx wrangler@3 deploy        Worker `hanzo-sh` + its static assets
       purge, then RE-FETCH         fails unless the live installer and the
                                    live document are the ones just built
  -> hanzo.sh                       custom_domain route on the Worker
```

Credentials are `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` from GitHub org
secrets, not KMS — the one thing about this path that does not follow the house
rule, and it stays that way until the host moves off Cloudflare.

`routes` lives ABOVE `[assets]` in `wrangler.toml`. TOML puts every key after a
table header inside that table, so it used to parse as `assets.routes` and
wrangler dropped it with a warning; the custom domain survived only because it
was attached out of band.

### The hanzoai/static image path is not a drop-in, and no longer exists here

`Dockerfile` and `.hanzo/workflows/deploy.yml` used to draft a move to
`ghcr.io/hanzoai/static` behind `hanzoai/ingress`. Both are deleted. They had
never produced an image (the forge job named a runner pool that does not exist,
so it queued to the 24h timeout in silence), and with the polyglot gone they
could not have produced a working one: `hanzoai/static` answers with
`http.ServeContent` and has no way to choose a representation from `Accept`, so
`/` would be either the page or the installer, never both. Moving this host into
the canonical image lane needs that rule in `hanzoai/static` first. Until then
the Worker is the honest answer, and `wrangler.toml` is not a placeholder.

## Deploying is the change, not a follow-up

**`on: push` fires here only sometimes, so dispatch and then check.** Measured,
by commit:

| push | run |
|---|---|
| `94931c7` 2026-08-01 | 30724256412 |
| `8a5d333` 2026-08-03 | 30823263229 |
| `0c0a52a` 2026-08-05 | none |
| `4be78b6` 2026-08-05 | none |

Same repo, same workflow, same pusher (`zeekay`, the identity that pushed
`8a5d333`), no run either time. `workflow_dispatch` on the identical file has
never failed to start. So the earlier note in this file — that push never fires
— was too strong, and its replacement — that push always fires — was too
generous. Both are wrong in the same way: **a merge is not evidence of a
deploy.** After landing anything on `main`:

```sh
gh run list -R hanzoai/hanzo.sh -L 1        # a run for your sha, or
gh workflow run deploy.yml -R hanzoai/hanzo.sh --ref main
```

Untested hypothesis worth someone's hour: this repo answers to two names —
`hanzoai/hanzo.sh` redirects to `hanzo-apps/hanzo.sh` — and GitHub is known to
drop workflow triggers for pushes that arrive over a rename redirect. The
remote here is the redirecting one.

The job then re-fetches the live host and fails unless the installer at `/` and
the document at `/page.html` are the ones it just built, unless what a browser
gets at `/` names this build's stylesheet, and unless every path the head
declares answers 200. **A hand-published host is why a fix can be merged and
still not reach anyone**: the live bytes once lagged `main` by weeks, long enough
that a correct fix sat in the repo while `curl hanzo.sh | bash` kept installing
the old thing. Anyone changing `public/install.sh` verifies against the live URL,
not the repo:

```sh
curl -sS https://hanzo.sh | md5sum            # the installer, exactly
curl -sS https://hanzo.sh/page.html | md5sum  # the document, exactly
curl -sS https://hanzo.sh | grep -c astral    # must be 0
```

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

Geist and Geist Mono are served from `/fonts/` (OFL, `public/fonts/OFL.txt`).
They used to be `@import`ed from `cdn.jsdelivr.net/npm/geist@1.3.1/dist/fonts/`,
a path that package no longer has: both requests 404'd, `document.fonts.size`
was 0, and every visitor read the page in their system fallback. Nothing
surfaced it, because a cross-origin fetch that fails is not a console error. The
brand typeface is not something to borrow from a CDN on the host whose whole job
is one curl command.

## Stack

Vite 5 + React 19 + Tailwind 4, one route (`src/pages/Index.tsx`). pnpm 9;
`pnpm-lock.yaml` is what the build resolves (`--frozen-lockfile`).

```bash
pnpm install
pnpm dev      # vite, :8080
pnpm build    # -> dist/, page.html + install.sh
pnpm lint
```

Verify a change without deploying by running the real Worker over the real
assets, and piping it to BOTH published shells:

```sh
pnpm build && npx wrangler@3 dev --local --port 8788
curl -fsSL http://127.0.0.1:8788 | sh
curl -fsSL http://127.0.0.1:8788 | bash
curl -fsSL http://127.0.0.1:8788 -H 'Accept: text/html' | head -1   # <!DOCTYPE html>
```
