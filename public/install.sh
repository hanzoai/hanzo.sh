#!/bin/sh
# Hanzo Installer - Install Hanzo Dev and CLI
# Usage: curl -fsSL hanzo.sh/install.sh | sh
#
# Copyright (c) 2024-2026 Hanzo AI Inc.
# https://hanzo.ai

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Hanzo branding
HANZO_RED='\033[38;5;196m'

print_banner() {
    echo ""
    echo "${HANZO_RED}${BOLD}"
    echo "  ██╗  ██╗ █████╗ ███╗   ██╗███████╗ ██████╗ "
    echo "  ██║  ██║██╔══██╗████╗  ██║╚══███╔╝██╔═══██╗"
    echo "  ███████║███████║██╔██╗ ██║  ███╔╝ ██║   ██║"
    echo "  ██╔══██║██╔══██║██║╚██╗██║ ███╔╝  ██║   ██║"
    echo "  ██║  ██║██║  ██║██║ ╚████║███████╗╚██████╔╝"
    echo "  ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝ ╚═════╝ "
    echo "${NC}"
    echo "${CYAN}  AI-Powered Development Tools${NC}"
    echo ""
}

info() {
    echo "${BLUE}info${NC}: $1"
}

success() {
    echo "${GREEN}✓${NC} $1"
}

warn() {
    echo "${YELLOW}warning${NC}: $1"
}

error() {
    echo "${RED}error${NC}: $1"
    exit 1
}

# Detect OS and architecture
detect_platform() {
    OS="$(uname -s)"
    ARCH="$(uname -m)"

    case "$OS" in
        Darwin)
            PLATFORM="macos"
            ;;
        Linux)
            PLATFORM="linux"
            ;;
        MINGW* | MSYS* | CYGWIN*)
            PLATFORM="windows"
            ;;
        *)
            error "Unsupported operating system: $OS"
            ;;
    esac

    case "$ARCH" in
        x86_64 | amd64)
            ARCH="x64"
            ;;
        arm64 | aarch64)
            ARCH="arm64"
            ;;
        *)
            error "Unsupported architecture: $ARCH"
            ;;
    esac

    info "Detected platform: ${PLATFORM}-${ARCH}"
}

# Check for required tools
check_requirements() {
    # Check for Node.js
    if command -v node >/dev/null 2>&1; then
        NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -ge 18 ]; then
            success "Node.js $(node -v) detected"
        else
            warn "Node.js version 18+ recommended (found $(node -v))"
        fi
    else
        warn "Node.js not found - some features may be limited"
        NEED_NODE=true
    fi

    # Check for npm/pnpm/bun
    if command -v bun >/dev/null 2>&1; then
        PKG_MANAGER="bun"
        success "Bun detected - using bun for installation"
    elif command -v pnpm >/dev/null 2>&1; then
        PKG_MANAGER="pnpm"
        success "pnpm detected"
    elif command -v npm >/dev/null 2>&1; then
        PKG_MANAGER="npm"
        success "npm detected"
    else
        error "No package manager found. Please install Node.js first: https://nodejs.org"
    fi
}

# Install Node.js if needed (via nvm or direct download)
install_node() {
    if [ "$NEED_NODE" = true ]; then
        info "Installing Node.js..."

        if command -v curl >/dev/null 2>&1; then
            # Install nvm and node
            curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
            export NVM_DIR="$HOME/.nvm"
            [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
            nvm install 22
            nvm use 22
            success "Node.js installed via nvm"
        else
            error "curl not found. Please install Node.js manually: https://nodejs.org"
        fi
    fi
}

# Install Hanzo Dev
install_hanzo_dev() {
    info "Installing Hanzo Dev (AI coding agent)..."

    case "$PKG_MANAGER" in
        bun)
            bun install -g @hanzo/dev
            ;;
        pnpm)
            pnpm install -g @hanzo/dev
            ;;
        npm)
            npm install -g @hanzo/dev
            ;;
    esac

    if command -v dev >/dev/null 2>&1; then
        success "Hanzo Dev installed successfully"
    elif command -v coder >/dev/null 2>&1; then
        success "Hanzo Dev installed as 'coder' (dev command may conflict with another tool)"
    else
        warn "Installation completed but 'dev' command not found in PATH"
        warn "You may need to restart your terminal or add npm global bin to PATH"
    fi
}

# Install Hanzo CLI (optional)
install_hanzo_cli() {
    info "Installing Hanzo CLI..."

    case "$PKG_MANAGER" in
        bun)
            bun install -g @hanzo/cli
            ;;
        pnpm)
            pnpm install -g @hanzo/cli
            ;;
        npm)
            npm install -g @hanzo/cli
            ;;
    esac

    if command -v hanzo >/dev/null 2>&1; then
        success "Hanzo CLI installed successfully"
    else
        warn "Hanzo CLI installation completed - restart terminal to use 'hanzo' command"
    fi
}

# Print post-install instructions
print_instructions() {
    echo ""
    echo "${GREEN}${BOLD}Installation Complete!${NC}"
    echo ""
    echo "Get started:"
    echo ""
    echo "  ${CYAN}dev${NC}              # Start Hanzo Dev (AI coding agent)"
    echo "  ${CYAN}dev --help${NC}       # Show available commands"
    echo "  ${CYAN}hanzo --help${NC}     # Hanzo CLI help"
    echo ""
    echo "Quick commands:"
    echo ""
    echo "  ${CYAN}dev \"Fix the bug in auth.ts\"${NC}"
    echo "  ${CYAN}dev \"Add rate limiting to the API\"${NC}"
    echo "  ${CYAN}dev \"Write tests for the user service\"${NC}"
    echo ""
    echo "Documentation: ${BLUE}https://docs.hanzo.ai${NC}"
    echo "GitHub:        ${BLUE}https://github.com/hanzoai${NC}"
    echo ""
}

# Main installation flow
main() {
    print_banner

    info "Starting Hanzo installation..."
    echo ""

    detect_platform
    check_requirements
    install_node

    echo ""
    install_hanzo_dev
    install_hanzo_cli

    print_instructions
}

# Run main
main "$@"
