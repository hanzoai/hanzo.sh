#!/bin/sh
# Exercise the real coordinator with a local downloader fixture; no network.
set -eu
root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
fixture=$(mktemp -d)
trap 'rm -rf "$fixture"' EXIT HUP INT TERM
mkdir -p "$fixture/tools"
cat > "$fixture/tools/curl" <<'SH'
#!/bin/sh
while [ $# -gt 0 ]; do
    if [ "$1" = -o ]; then cp "$INSTALL_FIXTURE/one.sh" "$2"; exit 0; fi
    shift
done
exit 1
SH
cat > "$fixture/one.sh" <<'SH'
#!/bin/sh
set -eu
if [ "${FAIL_TOOL:-}" = "$HANZO_INSTALL_BIN" ]; then
    echo "$HANZO_INSTALL_BIN: simulated download failure" >&2
    exit 1
fi
if [ "${PASSED_PROVENANCE:-}" = "$HANZO_INSTALL_BIN" ]; then
    echo "$HANZO_INSTALL_BIN: provenance: hanzoai/gen/.github/workflows/release.yml built gen-darwin-arm64.tar.gz"
fi
if [ "${UNVERIFIED_TOOL:-}" = "$HANZO_INSTALL_BIN" ]; then
    echo "$HANZO_INSTALL_BIN: provenance not checked (fixture verifier too old)"
fi
if [ "${EXPECT_STRICT:-0}" = 1 ]; then
    [ "${HANZO_INSTALL_STRICT:-0}" = 1 ] || exit 1
fi
mkdir -p "$HANZO_INSTALL_PREFIX"
printf '#!/bin/sh\necho "%s 1.2.3"\n' "$HANZO_INSTALL_BIN" > "$HANZO_INSTALL_PREFIX/$HANZO_INSTALL_BIN"
chmod +x "$HANZO_INSTALL_PREFIX/$HANZO_INSTALL_BIN"
if [ -n "$HANZO_INSTALL_ALIAS" ]; then
    ln -sf "$HANZO_INSTALL_BIN" "$HANZO_INSTALL_PREFIX/$HANZO_INSTALL_ALIAS"
fi
printf '%s: %s is not on PATH — add it:\n  export PATH="%s:$PATH"\n' "$HANZO_INSTALL_BIN" "$HANZO_INSTALL_PREFIX" "$HANZO_INSTALL_PREFIX"
SH
chmod +x "$fixture/tools/curl"
export INSTALL_FIXTURE="$fixture"
PATH="$fixture/tools:$PATH"
export PATH

for shell in sh bash; do
    for invalid in --strcit --dir; do
        if "$shell" "$root/public/install.sh" "$invalid" > "$fixture/invalid.log" 2>&1; then exit 1; fi
        grep -q 'see --help' "$fixture/invalid.log"
    done
    if "$shell" "$root/public/install.sh" --dir "$fixture/mixed" hanzo hanzo-bot > "$fixture/mixed.log" 2>&1; then exit 1; fi
    grep -q 'source is public' "$fixture/mixed.log"
    [ ! -e "$fixture/mixed/hanzo" ]
    PASSED_PROVENANCE=gen "$shell" "$root/public/install.sh" --dir "$fixture/all" > "$fixture/all.log" 2>&1
    grep -q 'Installed and available.*hanzo hanzod hanzozt hanzo-gen hanzo-dev hanzo-engine hanzo-mcp hanzo-cloud' "$fixture/all.log"
    if grep -q 'same build' "$fixture/all.log"; then exit 1; fi
    if grep -q 'provenance:' "$fixture/all.log"; then exit 1; fi
    "$fixture/all/hanzo-engine" --version | grep -q 'hanzo-engine 1.2.3'
    "$fixture/all/engine" --version | grep -q 'hanzo-engine 1.2.3'
    "$fixture/all/hanzod" --version | grep -q 'hanzod 1.2.3'
    "$fixture/all/hanzo-node" --version | grep -q 'hanzod 1.2.3'
    "$fixture/all/hanzozt" --version | grep -q 'zt 1.2.3'
    "$fixture/all/hanzo-zt" --version | grep -q 'zt 1.2.3'
    "$fixture/all/hanzo-cloud" --version | grep -q 'hanzo-cloud 1.2.3'
    "$fixture/all/cloud" --version | grep -q 'hanzo-cloud 1.2.3'
    "$shell" "$root/public/install.sh" --dir "$fixture/installed" hanzo dev gen > "$fixture/success.log" 2>&1
    grep -q 'ready' "$fixture/success.log"
    [ "$(grep -c 'export PATH=' "$fixture/success.log")" -eq 1 ]
    grep -q 'Installed and available.*hanzo hanzo-gen hanzo-dev hanzo-mcp' "$fixture/success.log"
    "$fixture/installed/hanzo-mcp" --version | grep -q 'hanzo-mcp 1.2.3'
    "$fixture/installed/dev" --version | grep -q 'dev 1.2.3'
    "$fixture/installed/hanzo-dev" --version | grep -q 'dev 1.2.3'
    "$fixture/installed/hanzo-gen" --version | grep -q 'gen 1.2.3'

    UNVERIFIED_TOOL=gen "$shell" "$root/public/install.sh" --dir "$fixture/warning" hanzo-gen > "$fixture/warning.log" 2>&1
    grep -q 'installed; provenance unverified' "$fixture/warning.log"
    if grep -q '✓ hanzo-gen' "$fixture/warning.log"; then exit 1; fi
    EXPECT_STRICT=1 "$shell" "$root/public/install.sh" --strict --dir "$fixture/strict" hanzo-dev > "$fixture/strict.log" 2>&1

    if FAIL_TOOL=gen "$shell" "$root/public/install.sh" --dir "$fixture/partial" hanzo dev gen > "$fixture/partial.log" 2>&1; then
        echo "$shell: a partial install incorrectly returned success" >&2
        exit 1
    fi
    grep -q 'simulated download failure' "$fixture/partial.log"
    grep -q 'Installed and available.*hanzo hanzo-dev hanzo-mcp' "$fixture/partial.log"
    grep -q 'tools listed as installed above still work' "$fixture/partial.log"
    grep -q 'incomplete' "$fixture/partial.log"
    if grep -q 'ready' "$fixture/partial.log"; then exit 1; fi
    [ "$(grep -c 'export PATH=' "$fixture/partial.log")" -eq 1 ]
    "$fixture/partial/dev" --version | grep -q 'dev 1.2.3'
    echo "$shell: full and partial installation output passed"
done
