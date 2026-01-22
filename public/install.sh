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
    local W=$'\033[38;5;255m' D=$'\033[38;5;238m' L=$'\033[38;5;250m' M=$'\033[38;5;246m' K=$'\033[38;5;242m'
    echo -e "${L}    ${W}__${N}                          "
    echo -e "${M}   / /${W}_${M}  ${W}____${M} ${W}_____${M}  ${W}____${M}  ${W}____${M} "
    echo -e "${K}  / ${W}__${K} \\/ ${W}__${K} \`/ ${W}__${K} \\/${W}_${K}  / / ${W}__${K} \\"
    echo -e "${D} / / / / /${W}_${D}/ / / / / / /${W}_${D}/ /${W}_${D}/ /"
    echo -e "${D}/${W}_${D}/ /${W}_${D}/\\${W}__${D},${W}_${D}/${W}_${D}/ /${W}_${D}/ /${W}___${D}/\\${W}____${D}/${N} ${DM}ai dev platform${N}"
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
                         default  - cli + mcp
                         minimal  - cli only
                         full     - cli + mcp + agents + node
  -d, --dir PATH       install directory (default: ~/.local/bin)
  -u, --upgrade        upgrade existing installations
  -f, --force          force reinstall
  -q, --quiet          minimal output (skip extras suggestions)
  -h, --help           show this help

shortcuts:
  curl hanzo.sh | bash           # default (cli + mcp)
  curl hanzo.sh/cli | bash       # cli only
  curl hanzo.sh/mcp | bash       # mcp only
  curl hanzo.sh/agents | bash    # agents
  curl hanzo.sh/full | bash      # everything

extras (shown after install):
  - VS Code / Cursor extensions
  - Browser extensions (Chrome, Firefox)
  - Shell completions (zsh, bash, fish)
  - Claude Desktop MCP integration
  - Other AI tools (claude-code, aider)

examples:
  curl -fsSL hanzo.sh | bash
  curl -fsSL hanzo.sh | bash -s -- --upgrade
  curl -fsSL hanzo.sh | bash -s -- --bundle full

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
    # Naming strategy:
    # Python (uv):  hanzo, hanzo-mcp, hanzo-dev, hanzo-node, hanzo-agents (full names)
    # Rust (cargo): hanzo, mcp, dev, hanzod (short names)
    # Node (npm):   hanzo, mcp, dev, hanzod, agents (short names)
    # Go:           hanzo, hanzod, dev (short names)
    # Homebrew:     hanzo, hanzo-mcp, hanzo-dev, hanzo-node (formula names)

    # python (uv tool) - keeps full hanzo-* names
    echo -e "  ${BD}python (uv):${N}"
    local py_found=0
    if has_cmd uv; then
        local uv_list=$(uv tool list 2>/dev/null || true)
        for pkg in hanzo hanzo-mcp hanzo-dev hanzo-node hanzo-agents; do
            local info=$(echo "$uv_list" | grep -E "^${pkg} " || true)
            if [[ -n "$info" ]]; then
                local ver=$(echo "$info" | awk '{print $2}')
                local path=$(command -v "$pkg" 2>/dev/null || echo "~/.local/bin/$pkg")
                printf "    ${G}✓${N} %-16s %-10s %s\n" "$pkg" "$ver" "$path"
                py_found=1
            fi
        done
    fi
    [[ $py_found -eq 0 ]] && echo -e "    ${DM}(none)${N}"

    # rust (cargo) - short binary names
    echo -e "  ${BD}rust (cargo):${N}"
    local rs_found=0
    if has_cmd cargo; then
        local cargo_list=$(cargo install --list 2>/dev/null || true)
        for pair in "hanzo-cli:hanzo" "hanzo-mcp:mcp" "hanzo-dev:dev" "hanzo-node:hanzod"; do
            local crate="${pair%%:*}" bin="${pair##*:}"
            local info=$(echo "$cargo_list" | grep -E "^${crate} " || true)
            if [[ -n "$info" ]]; then
                local ver=$(echo "$info" | grep -oE 'v[0-9]+\.[0-9]+\.[0-9]+' || echo "?")
                local path=$(command -v "$bin" 2>/dev/null || echo "~/.cargo/bin/$bin")
                printf "    ${G}✓${N} %-16s %-10s %s\n" "$crate" "$ver" "$path"
                rs_found=1
            fi
        done
    fi
    [[ $rs_found -eq 0 ]] && echo -e "    ${DM}(none)${N}"

    # node (npm/pnpm) - @hanzo/* packages with short binary names
    echo -e "  ${BD}node (npm/pnpm):${N}"
    local ts_found=0
    for pair in "@hanzo/cli:hanzo" "@hanzo/mcp:mcp" "@hanzo/dev:dev" "@hanzo/node:hanzod" "@hanzo/agents:agents"; do
        local pkg="${pair%%:*}" bin="${pair##*:}"
        local path=$(command -v "$bin" 2>/dev/null || true)
        [[ -z "$path" ]] && continue
        # skip if python version (full names like hanzo-mcp)
        [[ "$path" == *".local/bin"* ]] && continue
        # skip if cargo version
        [[ "$path" == *".cargo/bin"* ]] && continue
        if [[ "$path" == *"node_modules"* || "$path" == *"npm"* || "$path" == *"pnpm"* || "$path" == *"fnm"* || "$path" == *"nvm"* ]]; then
            local ver=$("$bin" --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1 || echo "?")
            printf "    ${G}✓${N} %-16s %-10s %s\n" "$pkg" "$ver" "$path"
            ts_found=1
        fi
    done
    [[ $ts_found -eq 0 ]] && echo -e "    ${DM}(none)${N}"

    # go (go install) - short binary names
    echo -e "  ${BD}go (go install):${N}"
    local go_found=0
    local gobin="${GOBIN:-${GOPATH:-$HOME/go}/bin}"
    for pair in "hanzo-cli:hanzo" "hanzo-node:hanzod" "hanzo-dev:dev"; do
        local pkg="${pair%%:*}" bin="${pair##*:}"
        local path="$gobin/$bin"
        if [[ -x "$path" ]]; then
            local ver=$("$path" --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1 || echo "?")
            printf "    ${G}✓${N} %-16s %-10s %s\n" "$pkg" "$ver" "$path"
            go_found=1
        fi
    done
    [[ $go_found -eq 0 ]] && echo -e "    ${DM}(none)${N}"

    # homebrew - formula:binary mappings
    echo -e "  ${BD}homebrew:${N}"
    local brew_found=0
    if has_cmd brew; then
        local brew_list=$(brew list --formula 2>/dev/null || true)
        for pair in "hanzo:hanzo" "hanzo-mcp:hanzo-mcp" "hanzo-dev:hanzo-dev" "hanzo-node:hanzo-node" "hanzo-agents:hanzo-agents"; do
            local formula="${pair%%:*}" bin="${pair##*:}"
            if echo "$brew_list" | grep -q "^${formula}$"; then
                local path=$(brew --prefix "$formula" 2>/dev/null)/bin/$bin
                [[ ! -x "$path" ]] && path=$(command -v "$bin" 2>/dev/null || echo "?")
                local ver=$("$bin" --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1 || echo "?")
                printf "    ${G}✓${N} %-16s %-10s %s\n" "$formula" "$ver" "$path"
                brew_found=1
            fi
        done
    fi
    [[ $brew_found -eq 0 ]] && echo -e "    ${DM}(none)${N}"

    # other binaries (manual installs, /usr/local/bin, etc)
    echo -e "  ${BD}other:${N}"
    local other_found=0
    for bin in hanzo hanzo-mcp hanzo-dev hanzo-node hanzo-agents hanzod mcp dev agents; do
        local path=$(command -v "$bin" 2>/dev/null || true)
        [[ -z "$path" ]] && continue
        # skip if found in known ecosystems
        [[ "$path" == *".local/bin"* ]] && continue
        [[ "$path" == *".cargo/bin"* ]] && continue
        [[ "$path" == *"node_modules"* || "$path" == *"npm"* || "$path" == *"pnpm"* ]] && continue
        [[ "$path" == *"/go/bin"* ]] && continue
        [[ "$path" == *"homebrew"* || "$path" == *"Cellar"* ]] && continue
        local ver=$("$bin" --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1 || echo "?")
        printf "    ${G}✓${N} %-16s %-10s %s\n" "$bin" "$ver" "$path"
        other_found=1
    done
    [[ $other_found -eq 0 ]] && echo -e "    ${DM}(none)${N}"

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

extras() {
    [[ "$HANZO_QUIET" == "1" ]] && return

    echo -e "  ${BD}optional extras:${N}"
    echo ""

    # VS Code extension
    if has_cmd code; then
        if ! code --list-extensions 2>/dev/null | grep -q "hanzo.hanzo-ai"; then
            echo -e "    ${C}code --install-extension hanzo.hanzo-ai${N}"
            echo -e "      └─ VS Code extension for Hanzo AI"
        fi
    fi

    # Cursor extension
    if has_cmd cursor; then
        echo -e "    ${C}cursor --install-extension hanzo.hanzo-ai${N}"
        echo -e "      └─ Cursor extension for Hanzo AI"
    fi

    # Shell completions
    echo ""
    echo -e "    ${BD}shell completions:${N}"
    if [[ -n "$ZSH_VERSION" ]] || [[ "$SHELL" == *"zsh"* ]]; then
        echo -e "    ${C}hanzo completion zsh > ~/.zsh/completions/_hanzo${N}"
    fi
    if [[ -n "$BASH_VERSION" ]] || [[ "$SHELL" == *"bash"* ]]; then
        echo -e "    ${C}hanzo completion bash > ~/.bash_completion.d/hanzo${N}"
    fi
    if [[ "$SHELL" == *"fish"* ]]; then
        echo -e "    ${C}hanzo completion fish > ~/.config/fish/completions/hanzo.fish${N}"
    fi

    # Browser extensions
    echo ""
    echo -e "    ${BD}browser extensions:${N}"
    echo -e "    ${C}https://chrome.google.com/webstore/detail/hanzo-ai${N}"
    echo -e "      └─ Chrome/Edge/Brave extension"
    echo -e "    ${C}https://addons.mozilla.org/addon/hanzo-ai${N}"
    echo -e "      └─ Firefox extension"

    # Claude Desktop MCP
    if [[ -d "$HOME/Library/Application Support/Claude" ]] || [[ -d "$HOME/.config/claude" ]]; then
        echo ""
        echo -e "    ${BD}claude desktop mcp:${N}"
        echo -e "    ${C}hanzo-mcp install claude${N}"
        echo -e "      └─ Add Hanzo MCP to Claude Desktop"
    fi

    # Other CLI tools
    echo ""
    echo -e "    ${BD}other ai tools:${N}"
    echo -e "    ${C}uv tool install claude-code${N}      # Claude Code CLI"
    echo -e "    ${C}uv tool install aider-chat${N}       # Aider pair programming"
    echo -e "    ${C}npm i -g @anthropic-ai/claude${N}    # Claude CLI (official)"

    echo ""
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
    extras

    [[ ${#FAILED[@]} -gt 0 ]] && exit 1
    exit 0
}

main "$@"
