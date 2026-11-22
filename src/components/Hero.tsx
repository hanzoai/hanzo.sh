import { Terminal, Copy, Check, Code, Download, ExternalLink, Package, Cpu, Globe, BookOpen, ShieldCheck, Laptop, ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const GitHubIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M12 0.297C5.37 0.297 0 5.67 0 12.297c0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

const HanzoLogo = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 67 67" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M22.21 67V44.6369H0V67H22.21Z" fill="currentColor" />
    <path d="M0 44.6369L22.21 46.8285V44.6369H0Z" fill="currentColor" opacity="0.867" />
    <path d="M66.7038 22.3184H22.2534L0.0878906 44.6367H44.4634L66.7038 22.3184Z" fill="currentColor" />
    <path d="M22.21 0H0V22.3184H22.21V0Z" fill="currentColor" />
    <path d="M66.7198 0H44.5098V22.3184H66.7198V0Z" fill="currentColor" />
    <path d="M66.6753 22.3185L44.5098 20.0822V22.3185H66.6753Z" fill="currentColor" opacity="0.867" />
    <path d="M66.7198 67V44.6369H44.5098V67H66.7198Z" fill="currentColor" />
  </svg>
);

const AGENT_LINE = "Set up Hanzo on this machine: follow https://hanzo.sh/setup.md";

const onWindows = () => typeof navigator !== "undefined" && /Windows/i.test(navigator.userAgent);

type PlatformTab = "unix" | "ps1" | "gitbash" | "cmd";

const PLATFORM_TABS: { id: PlatformTab; label: string; note: string }[] = [
  { id: "unix", label: "macOS / Linux / WSL", note: "POSIX sh / bash / zsh (Apple Silicon, Intel, Linux amd64/arm64)." },
  { id: "ps1", label: "Windows PowerShell", note: "Native Windows 10/11 (x64) — installs .exe binaries to ~\\.local\\bin and updates User PATH." },
  { id: "gitbash", label: "Windows Git Bash", note: "Git Bash / MSYS2 — runs the same curl -fsSL installer natively on Windows." },
  { id: "cmd", label: "Windows CMD", note: "Command Prompt — downloads install.cmd, verifies checksums via PowerShell, cleans up." },
];

const DESKTOP_APPS = [
  {
    name: "Hanzo Desktop",
    domain: "hanzo.app",
    desc: "Native AI workspace and coding client with local models, MCP tools, and encrypted sync.",
    winUrl: "https://hanzo.ai/download",
    allUrl: "https://github.com/hanzoai/desktop/releases",
  },
  {
    name: "Hanzo Bot",
    domain: "hanzo.bot",
    desc: "Local-first multi-channel assistant, scheduler, and agent runner.",
    winUrl: "https://github.com/hanzoai/bot/releases/latest",
    allUrl: "https://github.com/hanzoai/bot/releases",
  },
  {
    name: "Hanzo IDE",
    domain: "hanzo.codes",
    desc: "Native AI workspace built around repositories, agent diffs, inline reviews, and terminals.",
    winUrl: "https://github.com/hanzoai/ide/releases/latest",
    allUrl: "https://github.com/hanzoai/ide/releases",
  },
  {
    name: "Hanzo Team",
    domain: "hanzo.team",
    desc: "Shared workspace where your team and agents coordinate tasks, repositories, and approvals.",
    winUrl: "https://github.com/hanzoai/team/releases/latest",
    allUrl: "https://github.com/hanzoai/team/releases",
  },
];

const TOOLS = [
  {
    bin: "hanzo",
    also: "hanzo-cli",
    desc: "The Hanzo CLI — auth, billing, coding sessions, and every product of the Hanzo cloud.",
    href: "https://github.com/hanzoai/cli",
    icon: Cpu,
  },
  {
    bin: "hanzod",
    also: "hanzo-node",
    desc: "Hanzo Node — the local daemon, L1 network validator, consensus mesh, and JSON-RPC node.",
    href: "https://github.com/hanzoai/node",
    icon: Globe,
  },
  {
    bin: "hanzozt",
    also: "zt",
    desc: "ZT — zero-trust networking, tunnels, controller, and router.",
    href: "https://github.com/hanzozt/zt",
    icon: ShieldCheck,
  },
  {
    bin: "hanzo-gen",
    also: "gen",
    desc: "Hanzo Gen — the native Rust coding harness.",
    href: "https://github.com/hanzoai/gen",
    icon: Code,
  },
  {
    bin: "hanzo-dev",
    also: "dev",
    desc: "Hanzo Dev — the coding agent `hanzo dev` runs by default (co-installs hanzo-mcp).",
    href: "https://github.com/hanzoai/dev",
    icon: Terminal,
  },
  {
    bin: "hanzo-mcp",
    also: "mcp",
    desc: "The MCP server — the Hanzo toolset over stdio or HTTP for any MCP client.",
    href: "https://github.com/hanzoai/mcp",
    icon: Package,
  },
  {
    bin: "hanzo-cloud",
    also: "cloud",
    desc: "Hanzo Cloud — self-hosted AI gateway, encrypted KMS, IAM, and local control plane in one binary.",
    href: "https://github.com/hanzoai/cloud",
    icon: Globe,
  },
];

const Hero = () => {
  const [copied, setCopied] = useState<string | null>(null);
  const [platform, setPlatform] = useState<PlatformTab>(() => (onWindows() ? "ps1" : "unix"));

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(null), 2000);
  };

  const installCommandsByPlatform: Record<PlatformTab, { id: string; label: string; cmd: string }[]> = {
    unix: [
      { id: "all", label: "Everything", cmd: "curl -fsSL https://hanzo.sh | sh" },
      { id: "cli", label: "CLI", cmd: "curl -fsSL https://hanzo.sh/cli | sh" },
      { id: "mcp", label: "MCP", cmd: "curl -fsSL https://hanzo.sh/mcp | sh" },
      { id: "dev", label: "Dev", cmd: "curl -fsSL https://hanzo.sh/dev | sh" },
    ],
    ps1: [
      { id: "all", label: "Everything", cmd: "irm https://hanzo.sh/install.ps1 | iex" },
      { id: "cli", label: "CLI", cmd: "irm https://hanzo.sh/cli.ps1 | iex" },
      { id: "mcp", label: "MCP", cmd: "irm https://hanzo.sh/mcp.ps1 | iex" },
      { id: "dev", label: "Dev", cmd: "irm https://hanzo.sh/dev.ps1 | iex" },
    ],
    gitbash: [
      { id: "all", label: "Everything", cmd: "curl -fsSL https://hanzo.sh | sh" },
      { id: "cli", label: "CLI", cmd: "curl -fsSL https://hanzo.sh/cli | sh" },
      { id: "mcp", label: "MCP", cmd: "curl -fsSL https://hanzo.sh/mcp | sh" },
      { id: "dev", label: "Dev", cmd: "curl -fsSL https://hanzo.sh/dev | sh" },
    ],
    cmd: [
      { id: "all", label: "Everything", cmd: "curl -fsSL https://hanzo.sh/install.cmd -o install.cmd && install.cmd && del install.cmd" },
      { id: "cli", label: "CLI", cmd: "powershell -NoProfile -Command \"irm https://hanzo.sh/cli.ps1 | iex\"" },
      { id: "mcp", label: "MCP", cmd: "powershell -NoProfile -Command \"irm https://hanzo.sh/mcp.ps1 | iex\"" },
      { id: "dev", label: "Dev", cmd: "powershell -NoProfile -Command \"irm https://hanzo.sh/dev.ps1 | iex\"" },
    ],
  };

  const installCommands = installCommandsByPlatform[platform];
  const [activeInstall, setActiveInstall] = useState("all");
  const currentCmd = installCommands.find((c) => c.id === activeInstall)?.cmd || installCommands[0].cmd;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      {/* Masthead — mirrors hanzo.ai */}
      <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--bg)]/90 backdrop-blur-xl">
        <div className="max-w-[1200px] mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <a href="https://hanzo.ai" className="inline-flex items-center gap-2 font-semibold tracking-tight text-[var(--ink)]">
              <HanzoLogo className="w-5 h-5" />
              <span>Hanzo AI</span>
            </a>
            <nav className="hidden sm:flex items-center gap-1" aria-label="Primary">
              <a href="https://docs.hanzo.ai" className="px-3 py-1.5 text-sm text-[var(--soft)] hover:text-[var(--ink)] transition-colors rounded-full">
                Docs
              </a>
              <a href="https://hanzoskills.com" className="px-3 py-1.5 text-sm text-[var(--soft)] hover:text-[var(--ink)] transition-colors rounded-full">
                Skills
              </a>
              <a href="https://hanzo.ai/download" className="px-3 py-1.5 text-sm text-[var(--soft)] hover:text-[var(--ink)] transition-colors rounded-full">
                Download
              </a>
              <a href="https://hanzo.ai/security" className="px-3 py-1.5 text-sm text-[var(--soft)] hover:text-[var(--ink)] transition-colors rounded-full">
                Security
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/hanzoai/hanzo.sh"
              aria-label="hanzo.sh on GitHub"
              className="p-2 text-[var(--soft)] hover:text-[var(--ink)] transition-colors rounded-full"
            >
              <GitHubIcon className="w-[18px] h-[18px]" />
            </a>
            <a
              href="https://hanzo.app"
              className="inline-flex items-center justify-center rounded-full bg-[var(--solid-bg)] text-[var(--solid-ink)] hover:bg-[var(--solid-hover)] px-4 py-1.5 text-sm font-medium transition-colors"
            >
              Try Hanzo
            </a>
          </div>
        </div>
      </header>

      {/* Hero with hanzo.ai edge halftone field */}
      <section className="hz-hero border-b border-[var(--line)]">
        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-16 pb-16 md:pt-20 md:pb-20 space-y-10">
          {/* Headline */}
          <div className="text-center space-y-4">
            <a
              href="https://hanzo.ai/security"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--line-strong)] bg-[var(--bg)] px-3.5 py-1 text-xs font-mono text-[var(--soft)] hover:text-[var(--ink)] hover:border-[var(--ink)] transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Open source · SHA-256 verified binaries</span>
              <ArrowRight className="w-3 h-3" aria-hidden="true" />
            </a>
            <h1 className="text-[clamp(2rem,4.6vw,3.5rem)] font-semibold tracking-[-0.038em] leading-[1.06] text-[var(--ink)]">
              <span className="block font-normal text-[0.58em] tracking-[-0.02em] text-[var(--soft)] mb-2">
                One command. Native binaries.
              </span>
              <code className="font-mono font-semibold text-[0.76em] tracking-[-0.03em]">
                curl -fsSL https://hanzo.sh | sh
              </code>
            </h1>
            <p className="text-base md:text-lg text-[var(--soft)] max-w-xl mx-auto leading-relaxed">
              The Hanzo CLI, MCP server, and coding agent as prebuilt native binaries.
              No runtime, no package manager, nothing to build.
            </p>
          </div>

          {/* Interactive Install Terminal */}
          <div className="max-w-2xl mx-auto space-y-3">
            {/* OS / Shell Selector */}
            <div className="flex flex-wrap justify-center gap-1 p-1 bg-[var(--surface-2)] border border-[var(--line)] rounded-full w-fit mx-auto">
              {PLATFORM_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setPlatform(tab.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                    platform === tab.id
                      ? "bg-[var(--solid-bg)] text-[var(--solid-ink)]"
                      : "text-[var(--soft)] hover:text-[var(--ink)]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Dark terminal card matching hanzo.ai hero */}
            <div className="hz-term rounded-2xl overflow-hidden shadow-[0_20px_50px_-24px_rgba(0,0,0,0.45)]">
              <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-white/10">
                <div className="flex items-center gap-1.5" aria-hidden="true">
                  <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                </div>
                <div className="flex items-center gap-1" role="tablist" aria-label="Install target">
                  {installCommands.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      role="tab"
                      aria-selected={activeInstall === item.id}
                      onClick={() => setActiveInstall(item.id)}
                      className={`px-2.5 py-0.5 rounded-full text-xs font-mono transition-colors cursor-pointer ${
                        activeInstall === item.id
                          ? "bg-white text-black font-medium"
                          : "text-white/55 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(currentCmd, activeInstall)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-2.5 py-0.5 text-xs font-mono text-white/75 hover:text-white hover:border-white/35 transition-colors cursor-pointer"
                  aria-label="Copy install command"
                >
                  {copied === activeInstall ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(currentCmd, activeInstall)}
                className="w-full px-5 py-4 flex items-center gap-3 text-left hover:bg-white/[0.03] transition-colors cursor-pointer"
                aria-label="Click to copy install command"
              >
                <span className="font-mono text-sm text-white/40 select-none">$</span>
                <code className="font-mono text-sm md:text-[15px] text-white flex-1 overflow-x-auto select-all">
                  {currentCmd}
                </code>
              </button>
            </div>

            <div className="text-center space-y-1 pt-1">
              <p className="text-xs text-[var(--soft)]">
                {PLATFORM_TABS.find((t) => t.id === platform)?.note}
              </p>
              <p className="text-xs text-[var(--faint)]">
                SHA-256 verified against GitHub Releases. Pass{" "}
                <code className="font-mono text-[var(--soft)]">--strict</code> for attestation verification,{" "}
                <a href="https://hanzo.sh/install.sh" className="underline underline-offset-4 hover:text-[var(--ink)]">
                  inspect install.sh
                </a>
                , or re-run to upgrade.
              </p>
            </div>
          </div>

          {/* Paste into your agent */}
          <div className="max-w-2xl mx-auto space-y-2">
            <p className="text-center text-xs font-mono uppercase tracking-[0.12em] text-[var(--faint)]">
              Or paste into Claude Code, Codex, Cursor, or Antigravity
            </p>
            <button
              type="button"
              aria-label="Copy the line to paste into your coding agent"
              onClick={() => handleCopy(AGENT_LINE, "agent")}
              className="group w-full flex items-center gap-3 bg-[var(--surface)] border border-[var(--line-strong)] hover:border-[var(--ink)] px-4 py-3 rounded-xl text-left transition-colors cursor-pointer"
            >
              <Terminal className="w-4 h-4 text-[var(--faint)] flex-shrink-0" />
              <code className="text-[var(--ink)] font-mono text-xs md:text-sm flex-1 break-words">
                {AGENT_LINE}
              </code>
              <span className="inline-flex items-center gap-1 text-xs font-mono text-[var(--soft)] group-hover:text-[var(--ink)] flex-shrink-0">
                {copied === "agent" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied === "agent" ? "Copied" : "Copy"}</span>
              </span>
            </button>
          </div>

          {/* Per-tool shortcuts */}
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { path: "/cli", label: "hanzo.sh/cli" },
              { path: "/node", label: "hanzo.sh/node" },
              { path: "/zt", label: "hanzo.sh/zt" },
              { path: "/gen", label: "hanzo.sh/gen" },
              { path: "/dev", label: "hanzo.sh/dev" },
              { path: "/mcp", label: "hanzo.sh/mcp" },
              { path: "/cloud", label: "hanzo.sh/cloud" },
            ].map((shortcut) => (
              <button
                key={shortcut.path}
                type="button"
                onClick={() => handleCopy(`curl -fsSL https://hanzo.sh${shortcut.path} | sh`, shortcut.path)}
                className="px-3 py-1.5 rounded-full bg-[var(--bg)] border border-[var(--line-strong)] hover:border-[var(--ink)] text-[var(--soft)] hover:text-[var(--ink)] transition-colors font-mono text-xs cursor-pointer"
              >
                {shortcut.label}
                {copied === shortcut.path && <Check className="w-3 h-3 inline ml-1.5" />}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-16 space-y-16">
        {/* What gets installed */}
        <section className="space-y-5">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-xl font-semibold tracking-[-0.025em]">Included native binaries</h2>
            <a
              href="https://github.com/hanzoai/cli"
              className="text-xs font-mono text-[var(--soft)] hover:text-[var(--ink)] underline underline-offset-4"
            >
              Build from source →
            </a>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {TOOLS.map((t) => {
              const Icon = t.icon;
              return (
                <div
                  key={t.bin}
                  className="bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--line-strong)] rounded-2xl p-5 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[var(--surface-2)] border border-[var(--line)] flex items-center justify-center text-[var(--ink)]">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="font-mono font-medium text-sm text-[var(--ink)]">{t.bin}</h3>
                    </div>
                    <a
                      href={t.href}
                      className="text-xs font-mono text-[var(--faint)] hover:text-[var(--ink)] transition-colors"
                    >
                      source →
                    </a>
                  </div>
                  <p className="text-sm text-[var(--soft)] leading-relaxed mb-3">{t.desc}</p>
                  {t.also && (
                    <p className="text-xs text-[var(--faint)] font-mono">
                      alias: <code className="text-[var(--soft)]">{t.also}</code>
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Desktop Apps */}
        <section className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Laptop className="w-4 h-4 text-[var(--soft)]" />
              <h2 className="text-xl font-semibold tracking-[-0.025em]">Desktop applications</h2>
            </div>
            <span className="text-xs font-mono text-[var(--faint)]">macOS · Windows · Linux</span>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {DESKTOP_APPS.map((app) => (
              <div
                key={app.name}
                className="bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--line-strong)] rounded-2xl p-5 flex flex-col justify-between gap-4 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <h3 className="font-semibold text-sm text-[var(--ink)]">{app.name}</h3>
                    <span className="text-xs font-mono text-[var(--faint)]">{app.domain}</span>
                  </div>
                  <p className="text-sm text-[var(--soft)] leading-relaxed">{app.desc}</p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={app.winUrl}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[var(--solid-bg)] text-[var(--solid-ink)] hover:bg-[var(--solid-hover)] text-xs font-medium transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </a>
                  <a
                    href={app.allUrl}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-[var(--line-strong)] text-[var(--soft)] hover:text-[var(--ink)] hover:border-[var(--ink)] text-xs transition-colors"
                  >
                    Releases →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* After install */}
        <section className="hz-term rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono uppercase tracking-[0.12em] text-white/60">After install</h2>
            <span className="text-xs font-mono text-white/40">~/.local/bin</span>
          </div>
          <div className="font-mono text-sm space-y-2.5">
            {[
              { cmd: "hanzo", desc: "Sign in, pick your coding agent, launch it" },
              { cmd: "hanzo doctor --verify", desc: "Verify installed binaries against GitHub Release checksums" },
              { cmd: "hanzo dev --claude", desc: "Switch agent: --claude, --codex, --cursor, --agy" },
              { cmd: "hanzo -- -c", desc: "Continue the last conversation" },
              { cmd: "hanzo up", desc: "Run the local cloud on this machine" },
              { cmd: "hanzo-mcp", desc: "Run the MCP server" },
            ].map((line, i) => (
              <div key={i} className="flex items-center gap-3 text-white/95">
                <span className="text-white/35 select-none w-4">$</span>
                <span className="flex-1 overflow-x-auto">{line.cmd}</span>
                <span className="text-white/45 text-xs hidden md:block">{line.desc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Resources */}
        <section className="flex flex-wrap justify-center gap-2.5">
          <a
            href="https://hanzo.ai/download"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--solid-bg)] text-[var(--solid-ink)] hover:bg-[var(--solid-hover)] font-medium text-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            All Downloads
          </a>
          <a
            href="https://hanzoskills.com"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[var(--line-strong)] text-[var(--ink)] hover:border-[var(--ink)] font-medium text-sm transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Hanzo Skills
          </a>
          <a
            href="https://docs.hanzo.ai"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[var(--line-strong)] text-[var(--ink)] hover:border-[var(--ink)] font-medium text-sm transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Documentation
          </a>
          <a
            href="https://hanzo.ai/security"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[var(--line-strong)] text-[var(--ink)] hover:border-[var(--ink)] font-medium text-sm transition-colors"
          >
            <ShieldCheck className="w-4 h-4" />
            Security
          </a>
        </section>
      </main>

      {/* Footer — mirrors hanzo.ai */}
      <footer className="border-t border-[var(--line)] py-8 px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--soft)]">
          <div className="flex items-center gap-2">
            <HanzoLogo className="w-4 h-4 text-[var(--ink)]" />
            <span>© {new Date().getFullYear()} Hanzo AI, Inc.</span>
          </div>
          <div className="flex items-center gap-5">
            <a href="https://hanzo.ai/security" className="hover:text-[var(--ink)] transition-colors">Security</a>
            <a href="https://hanzo.ai/privacy" className="hover:text-[var(--ink)] transition-colors">Privacy</a>
            <a href="https://hanzo.ai/terms" className="hover:text-[var(--ink)] transition-colors">Terms</a>
            <a href="https://status.hanzo.ai" className="hover:text-[var(--ink)] transition-colors">Status</a>
            <a href="https://github.com/hanzoai" className="hover:text-[var(--ink)] transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Hero;
