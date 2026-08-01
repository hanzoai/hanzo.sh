#!/bin/sh
# hanzo installer
#
#   curl -fsSL hanzo.sh | sh
#   curl -fsSL hanzo.sh | bash
#
# copyright (c) 2024-2026 hanzo ai inc.
# https://hanzo.ai
#
# Downloads one prebuilt native binary per tool, verifies its sha256, and puts it
# on PATH. That is the whole design. Nothing is built here, no package manager is
# involved, and there is no runtime to install first.
#
# POSIX sh on purpose. The site published `| bash` and llms.txt published `| sh`,
# and the script was bash-only — so every reader who copied the `sh` form (every
# agent reading llms.txt) got `set: Illegal option -o pipefail` from dash and
# nothing installed. Rather than pick a winner and leave the other broken, this
# runs under both: no arrays, no [[ ]], no <<<, no echo -e, no pipefail. The
# polyglot the site serves already declares #!/bin/sh, so this also makes that
# shebang honest.
#
# It does NOT re-implement downloading. hanzoai/cli/install.sh is the one
# implementation of "fetch a Hanzo binary" — platform detection, asset naming,
# checksum verification and the second-name symlink all live there, once. This
# fetches it and drives it once per tool. Two copies of platform detection would
# be the same class of bug as two copies of a route table.
#
# Every tool below is a published, public, checksummed native binary. A tool that
# is not one is NOT installed by some other mechanism to pad the list — it is
# named, with the reason. An installer that quietly reaches for a package manager
# to look complete is the defect this file exists to remove.

set -eu

HANZO_DIR="${HANZO_INSTALL_DIR:-$HOME/.local/bin}"
HANZO_QUIET="${HANZO_QUIET:-0}"
CLI_REPO="${HANZO_CLI_REPO:-hanzoai/cli}"

# The complete set of Hanzo tools that ship as a public, checksummed, native
# binary today, as <name>:<repo>:<binary>:<second-name>.
#
# The binary is also the asset prefix and the name inside the tarball — the
# convention hanzoai/cli/install.sh relies on. Adding a tool is one line, the day
# its repo is public and publishes <binary>-<os>-<arch>.tar.gz.sha256.
TOOLS='hanzo:hanzoai/cli:hanzo:hanzo-node
mcp:hanzoai/mcp:hanzo-mcp:mcp'

# Named, not silently skipped, and never substituted with something else.
#
# `dev` matters most: it is the agent `hanzo code` runs by default, so until its
# source is public `hanzo code` cannot run its own default backend. Saying that
# here beats letting someone discover it at the first `hanzo code`.
unavailable_rows() {
    cat <<'ROWS'
dev|the agent `hanzo code` runs by default — source is not public yet
node|source is not public yet
desktop|`hanzo desktop` is in the CLI; the standalone app is not public yet
bot|`hanzo bot` is in the CLI; the standalone node is not native yet
ROWS
}

if [ -t 1 ] && [ "${TERM:-}" != dumb ]; then
    R=$(printf '\033[0;31m'); G=$(printf '\033[0;32m'); Y=$(printf '\033[0;33m')
    C=$(printf '\033[0;36m'); N=$(printf '\033[0m');    BD=$(printf '\033[1m')
    DM=$(printf '\033[2m')
else
    R=''; G=''; Y=''; C=''; N=''; BD=''; DM=''
fi

INSTALLED_N=0
FAILED_N=0
FAILED_LIST=''

log()  { [ "$HANZO_QUIET" = 1 ] || printf '  %s\n' "$1"; }
ok()   { printf '  %s✓%s %s\n' "$G" "$N" "$1"; }
warn() { printf '  %s!%s %s\n' "$Y" "$N" "$1"; }
fail() { printf '  %s✗%s %s\n' "$R" "$N" "$1"; }
die()  { fail "$1"; exit 1; }

banner() {
    [ "$HANZO_QUIET" = 1 ] && return 0
    printf '%s' "$DM"
    cat <<'ART'
    __
   / /_  ____ _____  ____  ____
  / __ \/ __ `/ __ \/_  / / __ \
 / / / / /_/ / / / / / /_/ /_/ /
/_/ /_/\__,_/_/ /_/ /___/\____/
ART
    printf '%s\n' "$N"
}

usage() {
    cat <<'EOF'
hanzo installer

usage: curl -fsSL hanzo.sh | sh
       curl -fsSL hanzo.sh | sh -s -- [options] [tool...]

Downloads one prebuilt native binary per tool and verifies its checksum.
With no tool named, installs every tool that ships as a public native binary.

tools:
  hanzo    the Hanzo CLI    (also installed as hanzo-node, the same build)
  mcp      the MCP server   (also installed as hanzo-mcp, the same build)

options:
  -d, --dir PATH       install directory (default: ~/.local/bin)
      --version TAG    pin the CLI release (default: latest)
  -q, --quiet          less output
  -h, --help           show this help

shortcuts:
  curl -fsSL hanzo.sh | sh           # every installable tool
  curl -fsSL hanzo.sh/cli | sh       # the CLI only
  curl -fsSL hanzo.sh/mcp | sh       # the MCP server only

Re-run any time to upgrade; installing is just downloading the current build.
EOF
    exit 0
}

WANT=''
parse_args() {
    while [ $# -gt 0 ]; do
        case $1 in
            --dir|-d)   HANZO_DIR="$2"; shift 2 ;;
            --version)  HANZO_VERSION="$2"; export HANZO_VERSION; shift 2 ;;
            --quiet|-q) HANZO_QUIET=1; shift ;;
            --help|-h)  usage ;;
            # Retired flags. Installing IS upgrading — there is one path and it
            # always fetches the current build — so these mean nothing now.
            # Accept and ignore rather than failing an install someone scripted.
            --upgrade|-u|--force|-f) shift ;;
            --bundle|-b) WANT="$WANT $2"; shift 2 ;;
            -*)          warn "ignoring unknown option: $1"; shift ;;
            *)           WANT="$WANT $1"; shift ;;
        esac
    done
}

# wanted <name> <binary> — did the caller ask for this tool?
# `default`, `full` and `all` named the old bundles. They meant "everything",
# which is what naming nothing means, so they map to that rather than failing an
# install someone already scripted.
wanted() {
    for w in $WANT; do
        case $w in
            "$1"|"$2"|default|full|all) return 0 ;;
        esac
    done
    return 1
}

# hanzoai/cli/install.sh, fetched once and reused for every tool.
#
# Prefer the API with an explicit raw Accept: it serves the CURRENT file, while
# raw.githubusercontent sits behind a CDN that hands back a copy from some
# minutes ago. Serving a stale script is the exact bug this rewrite removes, so
# do not risk it — but fall back to raw when the API is unreachable or has
# rate-limited an anonymous caller, because a rate limit must not stop an install.
ONE_INSTALLER=''
fetch_one_installer() {
    api="https://api.github.com/repos/${CLI_REPO}/contents/install.sh?ref=main"
    token="${HANZO_INSTALL_TOKEN:-${GH_TOKEN:-${GITHUB_TOKEN:-}}}"

    # Never interpolate a token into an unquoted argument list; branch instead.
    if [ -n "$token" ]; then
        curl -fsSL -H "Accept: application/vnd.github.raw" \
             -H "Authorization: Bearer $token" "$api" -o "$1" 2>/dev/null && return 0
    else
        curl -fsSL -H "Accept: application/vnd.github.raw" "$api" -o "$1" 2>/dev/null && return 0
    fi
    curl -fsSL "https://raw.githubusercontent.com/${CLI_REPO}/main/install.sh" -o "$1" 2>/dev/null
}

# install <repo> <binary> <second-name>
install_tool() {
    i_repo="$1"; i_bin="$2"; i_alias="$3"

    # HANZO_VERSION names a CLI release. Passing it to anything else would pin a
    # tag that repo has never published, so it reaches exactly one tool.
    i_pin=''
    if [ "$i_repo" = "$CLI_REPO" ]; then i_pin="${HANZO_VERSION:-}"; fi

    if i_out=$(HANZO_INSTALL_PREFIX="$HANZO_DIR" \
               HANZO_INSTALL_REPO="$i_repo" \
               HANZO_INSTALL_BIN="$i_bin" \
               HANZO_INSTALL_ALIAS="$i_alias" \
               HANZO_VERSION="$i_pin" \
               sh "$ONE_INSTALLER" 2>&1); then
        # Surface the installer's own warnings (PATH shadowing, PATH missing).
        # They are the difference between an install that worked and one the user
        # will never actually run — so carry the CONTINUATION lines too. The
        # shadow warning's second line is the half that says what to do about it,
        # and a filter that keeps only the alarm and drops the remedy is worse
        # than not warning at all.
        printf '%s\n' "$i_out" \
          | grep -E 'WARNING|Remove it, or put|not on PATH|export PATH' \
          | sed 's/^/    /' || true
    else
        printf '%s\n' "$i_out" | sed 's/^/    /'
        FAILED_N=$((FAILED_N + 1)); FAILED_LIST="$FAILED_LIST $i_bin"
        fail "$i_bin"; return 1
    fi

    # Trust the artifact, not the log line: ask the binary that is now on disk.
    if [ ! -x "$HANZO_DIR/$i_bin" ]; then
        FAILED_N=$((FAILED_N + 1)); FAILED_LIST="$FAILED_LIST $i_bin"
        fail "$i_bin (nothing at $HANZO_DIR/$i_bin)"; return 1
    fi
    i_ver=$("$HANZO_DIR/$i_bin" --version 2>/dev/null | head -1 | awk '{print $NF}')
    [ -n "${i_ver:-}" ] || i_ver='?'

    if [ -n "$i_alias" ]; then
        # Both names or it is not a finished install. A missing second name falls
        # through to whatever older copy is already on the box, silently.
        if [ ! -e "$HANZO_DIR/$i_alias" ]; then
            FAILED_N=$((FAILED_N + 1)); FAILED_LIST="$FAILED_LIST $i_alias"
            fail "$i_alias was not installed alongside $i_bin"; return 1
        fi
        ok "$i_bin $i_ver ${DM}(+ $i_alias, same build)${N}"
    else
        ok "$i_bin $i_ver"
    fi
    INSTALLED_N=$((INSTALLED_N + 1))
}

show_unavailable() {
    [ "$HANZO_QUIET" = 1 ] && return 0
    printf '\n  %snot included:%s\n' "$BD" "$N"
    unavailable_rows | while IFS='|' read -r u_name u_why; do
        printf '    %s○ %-8s %s%s\n' "$DM" "$u_name" "$u_why" "$N"
    done
}

finish() {
    printf '\n'
    if [ "$INSTALLED_N" -eq 0 ]; then die "nothing was installed"; fi

    # Never say "ready" over a failure. A partial install that reads as success
    # is how someone spends an afternoon on a tool that was never there.
    if [ "$FAILED_N" -gt 0 ]; then
        printf '  %s%sincomplete%s — did not install:%s\n' "$R" "$BD" "$N" "$N"
        for f in $FAILED_LIST; do printf '    %s✗%s %s\n' "$R" "$N" "$f"; done
        printf '\n'
        return 0
    fi

    printf '  %sready%s %s→ %s%s\n\n' "$G" "$N" "$DM" "$HANZO_DIR" "$N"
    printf '  quick start:\n'
    printf '    %shanzo auth login%s     # authenticate\n' "$C" "$N"
    printf '    %shanzo code%s           # start a coding session\n' "$C" "$N"
    printf '    %shanzo --help%s         # every command\n' "$C" "$N"
    if [ -x "$HANZO_DIR/hanzo-mcp" ]; then
        printf '    %shanzo-mcp --help%s     # the MCP server\n' "$C" "$N"
    fi
    printf '\n  docs: https://docs.hanzo.ai\n\n'
}

main() {
    parse_args "$@"
    banner

    command -v curl >/dev/null 2>&1 || die "need curl on PATH"

    tmp=$(mktemp -d)
    trap 'rm -rf "$tmp"' EXIT
    ONE_INSTALLER="$tmp/install.sh"
    fetch_one_installer "$ONE_INSTALLER" \
        || die "could not fetch the installer from ${CLI_REPO}"
    [ -s "$ONE_INSTALLER" ] || die "the installer fetched from ${CLI_REPO} is empty"

    mkdir -p "$HANZO_DIR"

    selected=0
    for row in $TOOLS; do
        t_name=${row%%:*};  rest=${row#*:}
        t_repo=${rest%%:*}; rest=${rest#*:}
        t_bin=${rest%%:*};  t_alias=${rest#*:}
        if [ -n "$WANT" ] && ! wanted "$t_name" "$t_bin"; then continue; fi
        selected=1
        install_tool "$t_repo" "$t_bin" "$t_alias" || true
    done

    if [ "$selected" -eq 0 ]; then
        # Asked for something real that we publish no binary for. Answer with the
        # reason from the one place that holds it, rather than a "no such tool"
        # that reads like a typo. Non-zero: they asked for an install and did not
        # get one.
        for w in $WANT; do
            why=$(unavailable_rows | while IFS='|' read -r u_name u_why; do
                      if [ "$u_name" = "$w" ]; then printf '%s' "$u_why"; fi
                  done)
            if [ -n "$why" ]; then
                fail "$w — $why"
                printf '  %sinstallable today: hanzo mcp%s\n' "$DM" "$N"
                exit 1
            fi
        done
        die "no such tool:$WANT — installable today: hanzo mcp"
    fi

    if [ -z "$WANT" ]; then show_unavailable; fi
    finish

    # A failed download or a missing second name is a failed install, and the
    # exit code has to say so — a half-install discovered days later is worse
    # than one that stopped here.
    if [ "$FAILED_N" -gt 0 ]; then exit 1; fi
    exit 0
}

main "$@"
