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

`/` is two resources, chosen by the `Accept` header in `worker.js`: the built
document (`dist/page.html`) to a browser, `public/install.sh` to curl. It used to
be one **polyglot** file that was both at once — HTML wrapped in a shell heredoc
— which no browser can be handed honestly: bytes before `<!DOCTYPE html>` put the
document in quirks mode and every `<head>` element ends up in `<body>`. A POSIX
script cannot begin with `<!` either, so there was no arrangement that worked.
`scripts/postbuild.js` moves the document off `index.html` (an asset at that name
outranks the Worker, and curl would get HTML) and writes `/install` next to
`/install.sh` from the same bytes.

Downloading is NOT implemented here. `hanzoai/cli/install.sh` is the one
implementation of "fetch a Hanzo binary" — platform detection, asset naming,
checksum verification, the second-name symlink — and this drives it once per
tool. Keep it that way; a second copy of platform detection is a second thing to
drift.

```sh
pnpm install
pnpm dev      # vite, :8080
pnpm build    # -> dist/, page.html + install.sh
pnpm lint
```

Serve it exactly as Cloudflare will — same Worker, same asset rules — and test
an installer change without deploying, under **both** published shells:

```sh
pnpm build && npx wrangler@3 dev --local --port 8788
curl -fsSL http://127.0.0.1:8788 | sh
curl -fsSL http://127.0.0.1:8788 | bash
curl -fsSL http://127.0.0.1:8788 -H 'Accept: text/html' | head -1   # <!DOCTYPE html>
```

## Deploying

`.github/workflows/deploy.yml` builds, publishes the Cloudflare Worker, then
re-fetches https://hanzo.sh and **fails if the live bytes are not the bytes it
just built**. This host was hand-published for a long time, which is how a merged
fix sat unseen for weeks while `curl hanzo.sh | sh` kept handing out the old
installer — so verifying the live URL is part of deploying, not a follow-up.

A push to `main` deploys — measured, not assumed (run 30823263229 published
8a5d333). To republish without a commit:

```sh
gh workflow run deploy.yml -R hanzoai/hanzo.sh --ref main
```

What the job asserts, after publishing, is what a stranger gets:

```sh
curl -sS https://hanzo.sh | md5sum                        # the installer
curl -sS -H 'Accept: text/html' https://hanzo.sh | md5sum # the document
```

`LLM.md` has the details, including why the `hanzoai/static` image path is not a
drop-in replacement for the Worker.
