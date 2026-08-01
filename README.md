# hanzo.sh

The install surface for the Hanzo tools. One command:

```sh
curl -fsSL https://hanzo.sh | sh
```

That downloads one prebuilt native binary per tool, verifies its sha256, and puts
it on PATH — no runtime, no package manager, no build step:

| tool | also installed as | source |
|---|---|---|
| `hanzo` | `hanzo-node` | [hanzoai/cli](https://github.com/hanzoai/cli) |
| `hanzo-mcp` | `mcp` | [hanzoai/mcp](https://github.com/hanzoai/mcp) |

Each pair is one build, symlinked, so the two names can never be two versions.
Re-run to upgrade. One tool at a time:

```sh
curl -fsSL https://hanzo.sh/cli | sh
curl -fsSL https://hanzo.sh/mcp | sh
```

## This repo

`dist/index.html` is a **polyglot** — the same bytes are the landing page in a
browser and the installer under `sh`. `public/install.sh` is the installer;
`scripts/build-polyglot.js` wraps the built HTML in a heredoc and appends it.

Downloading is NOT implemented here. `hanzoai/cli/install.sh` is the one
implementation of "fetch a Hanzo binary" — platform detection, asset naming,
checksum verification, the second-name symlink — and this drives it once per
tool. Keep it that way; a second copy of platform detection is a second thing to
drift.

```sh
pnpm install
pnpm dev      # vite, :8080
pnpm build    # -> dist/, including the polyglot rewrite
pnpm lint
```

Test an installer change without deploying, under **both** published shells:

```sh
cd dist && python3 -m http.server 8791 &
curl -fsSL http://127.0.0.1:8791 | sh
curl -fsSL http://127.0.0.1:8791 | bash
```

## Deploying

`.github/workflows/deploy.yml` builds, publishes the Cloudflare Worker, then
re-fetches https://hanzo.sh and **fails if the live bytes are not the bytes it
just built**. This host was hand-published for a long time, which is how a merged
fix sat unseen for weeks while `curl hanzo.sh | sh` kept handing out the old
installer — so verifying the live URL is part of deploying, not a follow-up.

```sh
gh workflow run deploy.yml -R hanzo-apps/hanzo.sh --ref main
```

Run it explicitly. The workflow declares `on: push` too, but pushes to this repo
are **not** currently creating runs — measured, cause not established; see
`LLM.md`. Until that is fixed, a merge is not a deploy, so check:

```sh
curl -sS https://hanzo.sh | md5sum
```

`LLM.md` has the details, including the unfinished migration to `hanzoai/static`.
