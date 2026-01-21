#!/bin/bash
# Hanzo Installer - Universal AI Development Platform
# Usage: curl -fsSL https://hanzo.sh/install | bash
#        curl -fsSL https://hanzo.sh/install | bash -s -- --bundle full
#
# Copyright (c) 2024-2026 Hanzo AI Inc.
# https://hanzo.ai

set -e

# Configuration via environment variables
HANZO_INSTALL_DIR="${HANZO_INSTALL_DIR:-$HOME/.local/bin}"
HANZO_BUNDLE="${HANZO_BUNDLE:-minimal}"
HANZO_PREFER_RUST="${HANZO_PREFER_RUST:-0}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'
HANZO_RED='\033[38;5;196m'

print_banner() {
    echo ""
    echo -e "${HANZO_RED}${BOLD}"
    echo "  ██╗  ██╗ █████╗ ███╗   ██╗███████╗ ██████╗ "
    echo "  ██║  ██║██╔══██╗████╗  ██║╚══███╔╝██╔═══██╗"
    echo "  ███████║███████║██╔██╗ ██║  ███╔╝ ██║   ██║"
    echo "  ██╔══██║██╔══██║██║╚██╗██║ ███╔╝  ██║   ██║"
    echo "  ██║  ██║██║  ██║██║ ╚████║███████╗╚██████╔╝"
    echo "  ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝ ╚═════╝ "
    echo -e "${NC}"
    echo -e "${CYAN}  Universal AI Development Platform${NC}"
    echo ""
}

info() { echo -e "${BLUE}info${NC}: $1"; }
success() { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}warning${NC}: $1"; }
error() { echo -e "${RED}error${NC}: $1"; exit 1; }

# Parse arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --bundle)
                HANZO_BUNDLE="$2"
                shift 2
                ;;
            --dir)
                HANZO_INSTALL_DIR="$2"
                shift 2
                ;;
            --prefer-rust)
                HANZO_PREFER_RUST=1
                shift
                ;;
            --help|-h)
                echo "Hanzo Installer"
                echo ""
                echo "Usage: curl -fsSL https://hanzo.sh/install | bash -s -- [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --bundle BUNDLE    Installation bundle (default: minimal)"
                echo "                     minimal  - Python CLI only"
                echo "                     python   - CLI, MCP, Agents, AI SDK"
                echo "                     rust     - Node, Dev, MCP (Rust)"
                echo "                     full     - Everything: Python + Rust"
                echo "  --dir PATH         Install directory (default: ~/.local/bin)"
                echo "  --prefer-rust      Prefer Rust implementations when available"
                echo "  --help             Show this help"
                echo ""
                echo "Environment Variables:"
                echo "  HANZO_BUNDLE       Default bundle"
                echo "  HANZO_INSTALL_DIR  Custom install directory"
                echo "  HANZO_PREFER_RUST  Set to 1 to prefer Rust tools"
                exit 0
                ;;
            *)
                warn "Unknown option: $1"
                shift
                ;;
        esac
    done
}

# Detect platform
detect_platform() {
    OS="$(uname -s)"
    ARCH="$(uname -m)"

    case "$OS" in
        Darwin) PLATFORM="macos" ;;
        Linux) PLATFORM="linux" ;;
        MINGW*|MSYS*|CYGWIN*) PLATFORM="windows" ;;
        *) error "Unsupported OS: $OS" ;;
    esac

    case "$ARCH" in
        x86_64|amd64) ARCH="x64" ;;
        arm64|aarch64) ARCH="arm64" ;;
        *) error "Unsupported architecture: $ARCH" ;;
    esac

    info "Platform: ${PLATFORM}-${ARCH}"
}

# Install uv (Python package manager)
install_uv() {
    if command -v uv >/dev/null 2>&1; then
        success "uv already installed: $(uv --version)"
        return
    fi

    info "Installing uv (Python package manager)..."
    curl -LsSf https://astral.sh/uv/install.sh | sh

    # Add to PATH for this session
    export PATH="$HOME/.local/bin:$PATH"

    if command -v uv >/dev/null 2>&1; then
        success "uv installed: $(uv --version)"
    else
        error "Failed to install uv"
    fi
}

# Install Python tools via uv
install_python_tools() {
    local tools=("$@")

    for tool in "${tools[@]}"; do
        case "$tool" in
            cli)
                info "Installing hanzo CLI..."
                uv tool install hanzo
                success "hanzo CLI installed"
                ;;
            mcp)
                info "Installing hanzo-mcp..."
                uv tool install hanzo-mcp
                success "hanzo-mcp installed"
                ;;
            agents)
                info "Installing hanzo-agents..."
                uv tool install hanzo-agents
                success "hanzo-agents installed"
                ;;
            ai)
                info "Installing hanzoai SDK..."
                uv tool install hanzoai
                success "hanzoai SDK installed"
                ;;
        esac
    done
}

# Install Rust tools via cargo or GitHub releases
install_rust_tools() {
    local tools=("$@")

    # Check for cargo
    if ! command -v cargo >/dev/null 2>&1; then
        info "Installing Rust toolchain..."
        curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
        source "$HOME/.cargo/env"
    fi

    for tool in "${tools[@]}"; do
        case "$tool" in
            node)
                info "Installing hanzo-node..."
                install_github_release "hanzoai/node" "hanzo-node"
                ;;
            dev)
                info "Installing hanzo-dev..."
                install_github_release "hanzoai/dev" "hanzo-dev"
                ;;
            mcp-rs)
                info "Installing hanzo-mcp (Rust)..."
                install_github_release "hanzoai/mcp" "hanzo-mcp"
                ;;
        esac
    done
}

# Install from GitHub releases
install_github_release() {
    local repo="$1"
    local binary="$2"
    local api_url="https://api.github.com/repos/${repo}/releases/latest"

    # Determine asset name based on platform
    local asset_suffix=""
    case "$PLATFORM-$ARCH" in
        macos-arm64) asset_suffix="darwin-arm64" ;;
        macos-x64) asset_suffix="darwin-x64" ;;
        linux-x64) asset_suffix="linux-x64" ;;
        linux-arm64) asset_suffix="linux-arm64" ;;
        *) error "No binary available for $PLATFORM-$ARCH" ;;
    esac

    # Get download URL from GitHub API
    local download_url
    download_url=$(curl -sL "$api_url" | grep "browser_download_url" | grep "$asset_suffix" | head -1 | cut -d '"' -f 4)

    if [ -z "$download_url" ]; then
        warn "No release found for $repo ($asset_suffix), skipping..."
        return
    fi

    # Download and install
    mkdir -p "$HANZO_INSTALL_DIR"
    local tmp_file="/tmp/${binary}-$$"

    curl -sL "$download_url" -o "$tmp_file"

    # Handle tar.gz or direct binary
    if [[ "$download_url" == *.tar.gz ]]; then
        tar -xzf "$tmp_file" -C "$HANZO_INSTALL_DIR"
    elif [[ "$download_url" == *.zip ]]; then
        unzip -o "$tmp_file" -d "$HANZO_INSTALL_DIR"
    else
        mv "$tmp_file" "$HANZO_INSTALL_DIR/$binary"
        chmod +x "$HANZO_INSTALL_DIR/$binary"
    fi

    rm -f "$tmp_file"
    success "$binary installed to $HANZO_INSTALL_DIR"
}

# Install JavaScript tools via npm/pnpm/bun
install_js_tools() {
    local tools=("$@")
    local pkg_manager=""

    if command -v bun >/dev/null 2>&1; then
        pkg_manager="bun"
    elif command -v pnpm >/dev/null 2>&1; then
        pkg_manager="pnpm"
    elif command -v npm >/dev/null 2>&1; then
        pkg_manager="npm"
    else
        warn "No JavaScript package manager found, skipping JS tools"
        return
    fi

    for tool in "${tools[@]}"; do
        case "$tool" in
            cli-js)
                info "Installing @hanzoai/cli..."
                $pkg_manager install -g @hanzoai/cli
                success "@hanzoai/cli installed"
                ;;
            mcp-js)
                info "Installing @hanzoai/mcp..."
                $pkg_manager install -g @hanzoai/mcp
                success "@hanzoai/mcp installed"
                ;;
        esac
    done
}

# Install bundle
install_bundle() {
    local bundle="$1"

    info "Installing bundle: $bundle"
    echo ""

    case "$bundle" in
        minimal)
            install_python_tools cli
            ;;
        python)
            install_python_tools cli mcp agents ai
            ;;
        rust)
            install_rust_tools node dev mcp-rs
            ;;
        javascript|js)
            install_js_tools cli-js mcp-js
            ;;
        full)
            install_python_tools cli mcp agents ai
            install_rust_tools node dev mcp-rs
            ;;
        dev)
            install_python_tools cli mcp
            install_rust_tools dev
            ;;
        *)
            error "Unknown bundle: $bundle. Use: minimal, python, rust, javascript, full, dev"
            ;;
    esac
}

# Print post-install instructions
print_instructions() {
    echo ""
    echo -e "${GREEN}${BOLD}Installation Complete!${NC}"
    echo ""
    echo "Installed bundle: $HANZO_BUNDLE"
    echo ""
    echo "Quick start:"
    echo ""
    echo -e "  ${CYAN}hanzo install doctor${NC}     # Verify installation"
    echo -e "  ${CYAN}hanzo dev${NC}                # Start AI coding session"
    echo -e "  ${CYAN}hanzo cloud deploy${NC}       # Deploy to cloud"
    echo -e "  ${CYAN}hanzo-mcp${NC}                # Start MCP server"
    echo ""
    echo "Documentation: https://docs.hanzo.ai"
    echo "GitHub:        https://github.com/hanzoai"
    echo ""

    # Remind about PATH
    if [[ ":$PATH:" != *":$HANZO_INSTALL_DIR:"* ]]; then
        echo -e "${YELLOW}Note:${NC} Add to your shell profile:"
        echo ""
        echo "  export PATH=\"\$HOME/.local/bin:\$PATH\""
        echo ""
    fi
}

# Main
main() {
    parse_args "$@"
    print_banner

    info "Starting Hanzo installation..."
    info "Bundle: $HANZO_BUNDLE"
    echo ""

    detect_platform
    install_uv

    echo ""
    install_bundle "$HANZO_BUNDLE"

    print_instructions
}

main "$@"
