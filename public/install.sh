#!/bin/bash
# hanzo installer
# usage: curl -fsSL hanzo.sh | bash
#
# copyright (c) 2024-2026 hanzo ai inc.
# https://hanzo.ai

set -euo pipefail

# config
HANZO_DIR="${HANZO_INSTALL_DIR:-$HOME/.local/bin}"
HANZO_BUNDLE="${HANZO_BUNDLE:-default}"
HANZO_FORCE="${HANZO_FORCE:-0}"
HANZO_UPGRADE="${HANZO_UPGRADE:-0}"
HANZO_QUIET="${HANZO_QUIET:-0}"

# colors
if [[ -t 1 ]] && [[ "${TERM:-}" != "dumb" ]]; then
    R='\033[0;31m' G='\033[0;32m' Y='\033[0;33m' B='\033[0;34m' C='\033[0;36m'
    N='\033[0m' BD='\033[1m' DM='\033[2m' HR='\033[38;5;196m'
else
    R='' G='' Y='' B='' C='' N='' BD='' DM='' HR=''
fi

# tracking
declare -a INSTALLED=() SKIPPED=() UPGRADED=() FAILED=()

banner() {
    [[ "$HANZO_QUIET" == "1" ]] && return
    echo ""
    echo -e "${C}"
    echo "    __                          "
    echo "   / /_  ____ _____  ____  ____ "
    echo "  / __ \\/ __ \`/ __ \\/_  / / __ \\"
    echo " / / / / /_/ / / / / / /_/ /_/ /"
    echo "/_/ /_/\\__,_/_/ /_/ /___/\\____/ "
    echo -e "${N}"
    echo -e "${DM}  ai development platform${N}"
    echo ""
}

log() { [[ "$HANZO_QUIET" != "1" ]] && echo -e "  $1"; }
ok() { echo -e "  ${G}✓${N} $1"; }
skip() { echo -e "  ${DM}○ $1${N}"; }
warn() { echo -e "  ${Y}! $1${N}"; }
fail() { echo -e "  ${R}✗ $1${N}"; }
die() { fail "$1"; exit 1; }

parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --bundle|-b) HANZO_BUNDLE="$2"; shift 2 ;;
            --dir|-d) HANZO_DIR="$2"; shift 2 ;;
            --force|-f) HANZO_FORCE=1; shift ;;
            --upgrade|-u) HANZO_UPGRADE=1; shift ;;
            --quiet|-q) HANZO_QUIET=1; shift ;;
            --help|-h)
                cat << 'EOF'
hanzo installer

usage: curl -fsSL hanzo.sh | bash
       curl -fsSL hanzo.sh | bash -s -- [options]

options:
  -b, --bundle NAME    installation bundle (default: default)
                         default  - cli + mcp + dev tools
                         minimal  - cli only
                         full     - everything
  -d, --dir PATH       install directory (default: ~/.local/bin)
  -u, --upgrade        upgrade existing installations
  -f, --force          force reinstall
  -q, --quiet          minimal output
  -h, --help           show this help

shortcuts:
  curl hanzo.sh | bash           # default (cli + mcp)
  curl hanzo.sh/cli | bash       # cli only
  curl hanzo.sh/mcp | bash       # mcp only
  curl hanzo.sh/dev | bash       # dev tools
  curl hanzo.sh/full | bash      # everything

examples:
  curl -fsSL hanzo.sh | bash
  curl -fsSL hanzo.sh | bash -s -- --upgrade
  curl -fsSL hanzo.sh | bash -s -- --force

EOF
                exit 0 ;;
            -*) warn "unknown option: $1"; shift ;;
            *) HANZO_BUNDLE="$1"; shift ;;
        esac
    done
}

detect_platform() {
    OS="$(uname -s)"
    ARCH="$(uname -m)"

    case "$OS" in
        Darwin) PLATFORM="macos" ;;
        Linux) PLATFORM="linux" ;;
        MINGW*|MSYS*|CYGWIN*) PLATFORM="windows" ;;
        *) die "unsupported os: $OS" ;;
    esac

    case "$ARCH" in
        x86_64|amd64) ARCH="x64" ;;
        arm64|aarch64) ARCH="arm64" ;;
        armv7*) ARCH="arm" ;;
        *) die "unsupported arch: $ARCH" ;;
    esac

    log "${PLATFORM}-${ARCH}"
}

has_cmd() { command -v "$1" >/dev/null 2>&1; }
has_uv_tool() { uv tool list 2>/dev/null | grep -q "^${1} " 2>/dev/null; }
get_uv_version() { uv tool list 2>/dev/null | grep "^${1} " | awk '{print $2}' | tr -d 'v'; }

install_uv() {
    if has_cmd uv; then
        ok "uv $(uv --version 2>/dev/null | awk '{print $2}')"
        return 0
    fi

    log "installing uv..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    export PATH="$HOME/.local/bin:$HOME/.cargo/bin:$PATH"

    has_cmd uv && ok "uv installed" || die "failed to install uv"
}

install_tool() {
    local tool="$1" name="${2:-$1}"

    if has_uv_tool "$tool"; then
        local ver=$(get_uv_version "$tool")
        local path=$(command -v "$name" 2>/dev/null || echo "~/.local/bin/$name")

        if [[ "$HANZO_FORCE" == "1" ]]; then
            log "reinstalling $name..."
            uv tool install "$tool" --force 2>/dev/null && { INSTALLED+=("$name $ver"); ok "$name $ver"; } || { FAILED+=("$name"); fail "$name"; }
        elif [[ "$HANZO_UPGRADE" == "1" ]]; then
            log "upgrading $name..."
            uv tool upgrade "$tool" 2>/dev/null
            local new_ver=$(get_uv_version "$tool")
            [[ "$ver" != "$new_ver" ]] && { UPGRADED+=("$name $ver → $new_ver"); ok "$name $ver → $new_ver"; } || { SKIPPED+=("$name $ver @ $path"); skip "$name $ver"; }
        else
            SKIPPED+=("$name $ver @ $path"); skip "$name $ver"
        fi
        return 0
    fi

    log "installing $name..."
    uv tool install "$tool" 2>/dev/null && {
        local ver=$(get_uv_version "$tool")
        INSTALLED+=("$name $ver"); ok "$name $ver";
    } || { FAILED+=("$name"); fail "$name"; return 1; }
}

has_bin() { [[ -x "$HANZO_DIR/$1" ]] || has_cmd "$1"; }
get_bin_version() {
    local p="$HANZO_DIR/$1"
    [[ -x "$p" ]] || p="$(command -v "$1" 2>/dev/null)"
    [[ -n "$p" ]] && "$p" --version 2>/dev/null | head -1 || echo "?"
}

install_release() {
    local repo="$1" bin="$2" name="${3:-$2}"

    if has_bin "$bin"; then
        local ver=$(get_bin_version "$bin")
        if [[ "$HANZO_FORCE" != "1" ]]; then
            SKIPPED+=("$name"); skip "$name ($ver)"
            return 0
        fi
        log "reinstalling $name..."
    else
        log "installing $name..."
    fi

    local api="https://api.github.com/repos/${repo}/releases/latest"
    local pat=""
    case "$PLATFORM-$ARCH" in
        macos-arm64)  pat="darwin.*arm64\|macos.*arm64\|apple.*arm64" ;;
        macos-x64)    pat="darwin.*x64\|darwin.*amd64\|macos.*x64" ;;
        linux-x64)    pat="linux.*x64\|linux.*amd64" ;;
        linux-arm64)  pat="linux.*arm64\|linux.*aarch64" ;;
        *) warn "no binary for $PLATFORM-$ARCH"; return 1 ;;
    esac

    local info url
    info=$(curl -sL "$api" 2>/dev/null) || { FAILED+=("$name"); fail "$name"; return 1; }
    url=$(echo "$info" | grep "browser_download_url" | grep -iE "$pat" | head -1 | cut -d '"' -f 4)
    [[ -z "$url" ]] && { warn "no release for $repo"; FAILED+=("$name"); return 1; }

    mkdir -p "$HANZO_DIR"
    local tmp="/tmp/${bin}-$$"
    curl -sL "$url" -o "$tmp" || { FAILED+=("$name"); rm -f "$tmp"; return 1; }

    if [[ "$url" == *.tar.gz ]] || [[ "$url" == *.tgz ]]; then
        tar -xzf "$tmp" -C "$HANZO_DIR" 2>/dev/null || {
            local d="/tmp/${bin}-ext-$$"; mkdir -p "$d"
            tar -xzf "$tmp" -C "$d"
            find "$d" -name "$bin" -type f -exec mv {} "$HANZO_DIR/$bin" \;
            rm -rf "$d"
        }
    elif [[ "$url" == *.zip ]]; then
        unzip -o "$tmp" -d "$HANZO_DIR" 2>/dev/null || {
            local d="/tmp/${bin}-ext-$$"; mkdir -p "$d"
            unzip -o "$tmp" -d "$d"
            find "$d" -name "$bin" -type f -exec mv {} "$HANZO_DIR/$bin" \;
            rm -rf "$d"
        }
    else
        mv "$tmp" "$HANZO_DIR/$bin"
    fi

    chmod +x "$HANZO_DIR/$bin" 2>/dev/null || true
    rm -f "$tmp"
    INSTALLED+=("$name"); ok "$name"
}

doctor() {
    echo "  installed:"
    local found=0
    for cmd in hanzo hanzo-mcp hanzo-agents hanzo-dev hanzo-node hanzo-ai hanzo-chat hanzo-repl; do
        local path=$(command -v "$cmd" 2>/dev/null)
        if [[ -n "$path" ]]; then
            local out=$("$cmd" --version 2>&1 | head -1)
            local ver=$(echo "$out" | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
            [[ -z "$ver" ]] && ver="?"
            printf "    ${G}✓${N} %-14s %-10s %s\n" "$cmd" "$ver" "$path"
            found=1
        fi
    done
    [[ $found -eq 0 ]] && echo "    (none found)"
    echo ""
}

install_bundle() {
    local bundle="$1"
    echo ""

    case "$bundle" in
        default)
            # default: cli + mcp
            install_tool "hanzo" "hanzo"
            install_tool "hanzo-mcp" "hanzo-mcp"
            ;;
        minimal|cli)
            install_tool "hanzo" "hanzo"
            ;;
        mcp)
            install_tool "hanzo-mcp" "hanzo-mcp"
            ;;
        agents)
            install_tool "hanzo-agents" "hanzo-agents"
            ;;
        node)
            install_tool "hanzo-node" "hanzo-node"
            # hanzo-node install handled by the package
            ;;
        dev)
            install_tool "hanzo" "hanzo"
            install_tool "hanzo-mcp" "hanzo-mcp"
            ;;
        full|all)
            install_tool "hanzo" "hanzo"
            install_tool "hanzo-mcp" "hanzo-mcp"
            install_tool "hanzo-agents" "hanzo-agents"
            install_tool "hanzo-node" "hanzo-node"
            ;;
        *)
            die "unknown bundle: $bundle"
            ;;
    esac
}

summary() {
    echo ""

    if [[ ${#INSTALLED[@]} -gt 0 ]]; then
        echo -e "  ${G}${BD}installed:${N}"
        for i in "${INSTALLED[@]}"; do echo -e "    ${G}✓${N} $i"; done
    fi

    if [[ ${#UPGRADED[@]} -gt 0 ]]; then
        echo -e "  ${C}${BD}upgraded:${N}"
        for i in "${UPGRADED[@]}"; do echo -e "    ${C}↑${N} $i"; done
    fi

    if [[ ${#SKIPPED[@]} -gt 0 ]] && [[ "$HANZO_QUIET" != "1" ]]; then
        echo -e "  ${DM}skipped:${N}"
        for i in "${SKIPPED[@]}"; do echo -e "    ${DM}○ $i${N}"; done
    fi

    if [[ ${#FAILED[@]} -gt 0 ]]; then
        echo -e "  ${R}${BD}failed:${N}"
        for i in "${FAILED[@]}"; do echo -e "    ${R}✗${N} $i"; done
    fi
}

finish() {
    echo ""

    if [[ ${#INSTALLED[@]} -gt 0 ]] || [[ ${#UPGRADED[@]} -gt 0 ]]; then
        echo -e "  ${G}ready!${N}"
        echo ""
        echo "  quick start:"
        echo -e "    ${C}hanzo --help${N}        # see commands"
        echo -e "    ${C}hanzo cloud login${N}   # login"
        has_uv_tool "hanzo-mcp" && echo -e "    ${C}hanzo-mcp${N}           # start mcp server"
        echo ""
        echo "  docs: https://docs.hanzo.ai"
        echo ""
    elif [[ ${#SKIPPED[@]} -gt 0 ]]; then
        echo -e "  ${G}already up to date${N}"
        echo ""
        doctor
        echo "  to upgrade: curl -fsSL hanzo.sh | bash -s -- -u"
        echo ""
    fi

    if [[ ":$PATH:" != *":$HANZO_DIR:"* ]] && [[ ${#INSTALLED[@]} -gt 0 ]]; then
        echo -e "  ${Y}add to path:${N}"
        echo "    export PATH=\"$HANZO_DIR:\$PATH\""
        echo ""
    fi
}

main() {
    parse_args "$@"
    banner

    log "bundle: $HANZO_BUNDLE"
    [[ "$HANZO_UPGRADE" == "1" ]] && log "mode: upgrade"
    [[ "$HANZO_FORCE" == "1" ]] && log "mode: force"
    echo ""

    detect_platform
    install_uv

    install_bundle "$HANZO_BUNDLE"

    summary
    finish

    [[ ${#FAILED[@]} -gt 0 ]] && exit 1
    exit 0
}

main "$@"
