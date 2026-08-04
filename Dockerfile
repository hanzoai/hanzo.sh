# hanzo.sh — a Vite build served by hanzoai/static, the house static server (a Go
# binary on scratch). No GitHub Pages, no Cloudflare: the site is an image the
# operator runs behind hanzoai/ingress like every other Hanzo surface.
#
# dist/index.html is a POLYGLOT — an HTML document AND the installer that
# `curl hanzo.sh | sh` executes. scripts/build-polyglot.js wraps the built HTML
# in a heredoc and appends public/install.sh. hanzoai/static answers with file
# bytes verbatim (Go ServeContent: no rewrite, no minify, no injection), so the
# contract survives being served from here — measured byte-identical against the
# live response, and the served bytes still run under bash.

FROM node:22 AS build
WORKDIR /src
RUN npm i -g pnpm@9
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# Both halves, or there is no image. A shell that cannot parse index.html breaks
# `curl hanzo.sh | sh`; a document that does not open with <!DOCTYPE html>
# breaks the browser.
#
# Checked under dash AND bash, because both are published: the page says `| sh`
# and readers type `| bash` anyway. The installer used to be bash-only while the
# file declared #!/bin/sh, so the `sh` half died on dash at `set -o pipefail`
# before anything downloaded — and a bash-only assert could never have caught it.
# dash is the strict one; bash proves the other published form still parses.
RUN head -1 dist/index.html | grep -qx '#!/bin/sh' \
 && grep -qx '<!DOCTYPE html>' dist/index.html \
 && dash -n dist/index.html \
 && bash -n dist/index.html

# The installer's other two names. `/install.sh` is what the docs and release
# notes say; `/install` is what hanzo.ai/install.sh's one-liner fetches, and a
# 404 there is silent — curl -f writes nothing, exits 22, and `sh` reading an
# empty script exits 0, so the documented command reports success and installs
# nothing. Both are read from public/install.sh by the build rather than
# committed twice, and this is what holds them to that.
RUN cmp dist/install dist/install.sh \
 && head -1 dist/install | grep -qx '#!/bin/sh' \
 && dash -n dist/install

# hanzoai/static defaults to -port 3000 -root /public, so it needs no arguments.
# No -spa: the app has exactly one route, so a mistyped path must 404 rather than
# hand back the installer under a name that promises something else.
FROM ghcr.io/hanzoai/static:v0.5.1
COPY --from=build /src/dist /public
