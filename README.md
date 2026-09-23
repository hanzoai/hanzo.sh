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

`/` is two resources, chosen by the `Accept` header at the edge (hanzo/universe
`infra/aws/routes/sites.yaml`): the built document (`dist/page.html`) to a
browser, `public/install.sh` to curl. It used to be one **polyglot** file that
was both at once — HTML wrapped in a shell heredoc — which no browser can be
handed honestly: bytes before `<!DOCTYPE html>` put the document in quirks mode
and every `<head>` element ends up in `<body>`. A POSIX script cannot begin with
`<!` either, so there was no arrangement that worked.
`scripts/postbuild.js` moves the document to `page.html`, the name the edge
rewrites `/` to, and writes `/install` next to `/install.sh` from the same bytes.

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

Test an installer change without deploying, under **both** published shells:

```sh
pnpm build
sh dist/install.sh
bash dist/install.sh
```

## Deploying

Every push to `main` runs `.github/workflows/cicd.yml`, which imports
[hanzoai/ci](https://github.com/hanzoai/ci) and reads `hanzo.yml`: the `test:`
gate builds and checks the page and the installer on amd64 and arm64, then
`site:` publishes `dist/` to `s3://hanzo-sites/hanzo/sh`, which the edge serves as
hanzo.sh. Nobody publishes by hand. A merge is still not evidence of a deploy, so
check the run and the host:

```sh
gh run list -R hanzoai/hanzo.sh -L 1
curl -fsS https://hanzo.sh | cmp - dist/install.sh
```
