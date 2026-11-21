import { Terminal, Copy, Check, Code, Download, ExternalLink, Package, Cpu, Globe, BookOpen, Zap, Laptop } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const GitHubIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M12 0.297C5.37 0.297 0 5.67 0 12.297c0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

const HanzoLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 67 67" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M22.21 67V44.6369H0V67H22.21Z" fill="currentColor"/>
    <path d="M0 44.6369L22.21 46.8285V44.6369H0Z" fill="currentColor" opacity="0.867"/>
    <path d="M66.7038 22.3184H22.2534L0.0878906 44.6367H44.4634L66.7038 22.3184Z" fill="currentColor"/>
    <path d="M22.21 0H0V22.3184H22.21V0Z" fill="currentColor"/>
    <path d="M66.7198 0H44.5098V22.3184H66.7198V0Z" fill="currentColor"/>
    <path d="M66.6753 22.3185L44.5098 20.0822V22.3185H66.6753Z" fill="currentColor" opacity="0.867"/>
    <path d="M66.7198 67V44.6369H44.5098V67H66.7198Z" fill="currentColor"/>
  </svg>
);

// lucide 1.0 dropped its brand icons; these are the paths its Github icon drew.
const Github = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
    <path d="M9 18c-4.51 2-5-2-7-2"/>
  </svg>
);

// What a person pastes into a coding agent: the agent fetches setup.md, installs
// the CLI and hands back to the person, who runs `hanzo`.
const AGENT_LINE = "Set up Hanzo on this machine: follow https://hanzo.sh/setup.md";

const onWindows = () => typeof navigator !== "undefined" && /Windows/i.test(navigator.userAgent);

type PlatformTab = "unix" | "ps1" | "gitbash" | "cmd";

const PLATFORM_TABS: { id: PlatformTab; label: string; note: string }[] = [
  { id: "unix", label: "macOS / Linux / WSL", note: "POSIX sh / bash / zsh (Apple Silicon, Intel, Linux amd64/arm64)." },
  { id: "ps1", label: "Windows PowerShell", note: "Native Windows 10/11 (x64) — installs .exe binaries to ~\\.local\\bin and updates User PATH." },
  { id: "gitbash", label: "Windows Git Bash", note: "Git Bash / MSYS2 — runs the same curl | sh installer natively on Windows." },
  { id: "cmd", label: "Windows CMD", note: "Command Prompt — downloads install.cmd, verifies checksums via PowerShell, cleans up." },
];

const DESKTOP_APPS = [
  {
    name: "Hanzo App",
    domain: "hanzo.app",
    desc: "Native AI workspace & chat client with local models, MCP tools, and encrypted sync.",
    winUrl: "https://github.com/hanzoai/desktop/releases/latest",
    allUrl: "https://github.com/hanzoai/desktop/releases",
  },
  {
    name: "Hanzo Bot",
    domain: "hanzo.bot",
    desc: "Autonomous multi-channel desktop assistant, scheduler, and agent runner.",
    winUrl: "https://github.com/hanzoai/bot/releases/latest",
    allUrl: "https://github.com/hanzoai/bot/releases",
  },
  {
    name: "Hanzo Codes",
    domain: "hanzo.codes",
    desc: "Native AI IDE + local Git forge (`gitd`) for code review, editing, and agent sessions.",
    winUrl: "https://github.com/hanzoai/ide/releases/latest",
    allUrl: "https://github.com/hanzoai/codes/releases",
  },
  {
    name: "Hanzo Team",
    domain: "hanzo.team",
    desc: "Collaborative team workspace, project boards, and agent orchestration client.",
    winUrl: "https://github.com/hanzoai/team/releases/latest",
    allUrl: "https://github.com/hanzoai/team/releases",
  },
];

const Hero = () => {
  const [copied, setCopied] = useState<string | null>(null);
  const [platform, setPlatform] = useState<PlatformTab>(() => (onWindows() ? "ps1" : "unix"));

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(null), 2000);
  };

  const installCommandsByPlatform: Record<PlatformTab, { id: string; label: string; cmd: string }[]> = {
    unix: [
      { id: "all", label: "Everything", cmd: "curl -fsSL hanzo.sh | sh" },
      { id: "cli", label: "CLI", cmd: "curl -fsSL hanzo.sh/cli | sh" },
      { id: "mcp", label: "MCP", cmd: "curl -fsSL hanzo.sh/mcp | sh" },
    ],
    ps1: [
      { id: "all", label: "Everything", cmd: "irm https://hanzo.sh/install.ps1 | iex" },
      { id: "cli", label: "CLI", cmd: "irm https://hanzo.sh/cli.ps1 | iex" },
      { id: "mcp", label: "MCP", cmd: "irm https://hanzo.sh/mcp.ps1 | iex" },
    ],
    gitbash: [
      { id: "all", label: "Everything", cmd: "curl -fsSL hanzo.sh | sh" },
      { id: "cli", label: "CLI", cmd: "curl -fsSL hanzo.sh/cli | sh" },
      { id: "mcp", label: "MCP", cmd: "curl -fsSL hanzo.sh/mcp | sh" },
    ],
    cmd: [
      { id: "all", label: "Everything", cmd: "curl -fsSL https://hanzo.sh/install.cmd -o install.cmd && install.cmd && del install.cmd" },
      { id: "cli", label: "CLI", cmd: "powershell -NoProfile -Command \"irm https://hanzo.sh/cli.ps1 | iex\"" },
      { id: "mcp", label: "MCP", cmd: "powershell -NoProfile -Command \"irm https://hanzo.sh/mcp.ps1 | iex\"" },
    ],
  };

  const installCommands = installCommandsByPlatform[platform];
  const [activeInstall, setActiveInstall] = useState("all");

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="https://hanzo.ai" className="flex items-center gap-2.5 text-white font-medium">
            <HanzoLogo className="w-6 h-6" />
            <span>Hanzo</span>
          </a>
          <nav className="flex items-center gap-1">
            <a href="https://docs.hanzo.ai" className="px-3 py-1.5 text-sm text-white/60 hover:text-white transition-colors rounded-md hover:bg-white/5">
              Docs
            </a>
            <a href="https://hanzo.ai/university" className="px-3 py-1.5 text-sm text-white/60 hover:text-white transition-colors rounded-md hover:bg-white/5">
              University
            </a>
            <a href="https://hanzo.market" className="px-3 py-1.5 text-sm text-white/60 hover:text-white transition-colors rounded-md hover:bg-white/5">
              Market
            </a>
            <a href="https://sensei.group" className="px-3 py-1.5 text-sm text-white/60 hover:text-white transition-colors rounded-md hover:bg-white/5">
              Sensei
            </a>
            <a href="https://github.com/hanzoai" aria-label="Hanzo GitHub" className="ml-2 p-2 text-white/60 hover:text-white transition-colors rounded-md hover:bg-white/5">
              <GitHubIcon className="w-5 h-5" />
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="pt-28 pb-16 px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              <code className="text-white/90">curl</code>{" "}
              <span className="bg-gradient-to-r from-[#d81c33] to-[#f0506a] bg-clip-text text-transparent">hanzo.sh</span>
            </h1>
            <p className="text-lg text-white/50 max-w-xl mx-auto">
              The Hanzo CLI, the MCP server and the coding agent, as native
              binaries. One command, nothing to build.
            </p>
          </div>

          {/* Main Install */}
          <div className="max-w-xl mx-auto space-y-3">
            {/* OS / Shell Selector (Antigravity-style platform switcher) */}
            <div className="flex flex-wrap justify-center gap-1 p-1 bg-white/[0.04] border border-white/10 rounded-lg w-fit mx-auto">
              {PLATFORM_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setPlatform(tab.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    platform === tab.id
                      ? "bg-[#d81c33] text-white"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex justify-center gap-1 p-1 bg-white/5 rounded-lg w-fit mx-auto">
              {installCommands.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveInstall(item.id)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    activeInstall === item.id
                      ? "bg-white text-black"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div
              className="group flex items-center gap-3 bg-[#0d1117] border border-white/10 hover:border-white/20 p-3 rounded-lg cursor-pointer transition-colors"
              onClick={() => handleCopy(installCommands.find((c) => c.id === activeInstall)?.cmd || "", activeInstall)}
            >
              <Terminal className="w-4 h-4 text-white/40 flex-shrink-0" />
              <code className="text-[#e6edf3] font-mono text-sm flex-1 select-all overflow-x-auto">
                {installCommands.find((c) => c.id === activeInstall)?.cmd}
              </code>
              {copied === activeInstall ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>

            <p className="text-center text-white/60 text-xs">
              {PLATFORM_TABS.find((t) => t.id === platform)?.note}
            </p>
            <p className="text-center text-white/40 text-xs">
              One prebuilt native binary per tool, SHA-256 verified. No runtime,
              no package manager, no build step. Re-run to upgrade.
            </p>
          </div>

          {/* Paste into your agent */}
          <div className="max-w-xl mx-auto space-y-2">
            <p className="text-center text-white/50 text-sm">
              Or paste this into Claude Code, Codex, Cursor or Antigravity
            </p>
            <button
              type="button"
              aria-label="Copy the line to paste into your coding agent"
              onClick={() => handleCopy(AGENT_LINE, "agent")}
              className="group w-full flex items-start gap-3 bg-[#0d1117] border border-white/10 hover:border-white/20 p-3 rounded-lg text-left transition-colors"
            >
              <Terminal className="w-4 h-4 text-white/40 flex-shrink-0 mt-0.5" />
              <code className="text-[#e6edf3] font-mono text-sm flex-1 break-words">{AGENT_LINE}</code>
              {copied === "agent" ? (
                <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <Copy className="w-4 h-4 text-white/40 flex-shrink-0 mt-0.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" />
              )}
            </button>
          </div>

          {/* Quick shortcuts */}
          <div className="flex flex-wrap justify-center gap-2 text-sm">
            {[
              { path: "/cli", label: "CLI Only" },
              { path: "/node", label: "Node" },
              { path: "/zt", label: "ZT" },
              { path: "/gen", label: "Gen" },
              { path: "/mcp", label: "MCP Server" },
              { path: "/cloud", label: "Cloud" },
            ].map((shortcut) => (
              <button
                key={shortcut.path}
                onClick={() => handleCopy(`curl -fsSL hanzo.sh${shortcut.path} | sh`, shortcut.path)}
                className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 hover:border-white/20 text-white/60 hover:text-white transition-colors font-mono text-xs"
              >
                hanzo.sh{shortcut.path}
                {copied === shortcut.path && <Check className="w-3 h-3 text-green-400 inline ml-1" />}
              </button>
            ))}
          </div>

          {/* What gets installed */}
          <div className="grid md:grid-cols-2 gap-3">
            {[
              {
                bin: "hanzo",
                also: "hanzo-cli",
                desc: "The Hanzo CLI \u2014 auth, billing, coding sessions, and every product of the Hanzo cloud.",
                href: "https://github.com/hanzoai/cli",
                icon: <Cpu className="w-4 h-4 text-orange-400" />,
                tint: "bg-orange-500/10",
              },
              {
                bin: "hanzod",
                also: "hanzo-node",
                desc: "Hanzo Node \u2014 the L1 network validator, consensus mesh and JSON-RPC node.",
                href: "https://github.com/hanzoai/node",
                icon: <Globe className="w-4 h-4 text-emerald-400" />,
                tint: "bg-emerald-500/10",
              },
              {
                bin: "hanzozt",
                also: "zt",
                desc: "ZT \u2014 zero-trust networking, tunnels, controller and router.",
                href: "https://github.com/hanzozt/zt",
                icon: <Cpu className="w-4 h-4 text-blue-400" />,
                tint: "bg-blue-500/10",
              },
              {
                bin: "hanzo-gen",
                also: "gen",
                desc: "Hanzo Gen \u2014 the native coding harness.",
                href: "https://github.com/hanzoai/gen",
                icon: <Code className="w-4 h-4 text-purple-400" />,
                tint: "bg-purple-500/10",
              },
              {
                bin: "hanzo-mcp",
                also: "mcp",
                desc: "The MCP server \u2014 the Hanzo toolset, for any MCP client.",
                href: "https://github.com/hanzoai/mcp",
                icon: <Package className="w-4 h-4 text-green-400" />,
                tint: "bg-green-500/10",
              },
              {
                bin: "hanzo-cloud",
                also: "cloud",
                desc: "Hanzo Cloud \u2014 self-hosted AI gateway, encrypted KMS, IAM and chat UI in one binary.",
                href: "https://github.com/hanzoai/cloud",
                icon: <Globe className="w-4 h-4 text-rose-400" />,
                tint: "bg-rose-500/10",
              },
            ].map((t) => (
              <div key={t.bin} className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className={`w-8 h-8 rounded-lg ${t.tint} flex items-center justify-center`}>
                    {t.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-white text-sm font-mono">{t.bin}</h3>
                    <a href={t.href} className="text-xs text-white/40 hover:text-white/60">source →</a>
                  </div>
                </div>
                <p className="text-xs text-white/50 mb-3">{t.desc}</p>
                {t.also && (
                  <p className="text-[11px] text-white/30">
                    alias: <code className="text-white/50">{t.also}</code>
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Apps */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
                <Laptop className="w-4 h-4 text-[#f0506a]" />
                <span>Desktop Apps (Windows x64, macOS, Linux)</span>
              </div>
              <span className="text-xs text-white/40">Native installers</span>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {DESKTOP_APPS.map((app) => (
                <div key={app.name} className="bg-white/[0.02] border border-white/10 rounded-xl p-5 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <h3 className="font-medium text-white text-sm">{app.name}</h3>
                      <span className="text-xs font-mono text-white/40">{app.domain}</span>
                    </div>
                    <p className="text-xs text-white/50">{app.desc}</p>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={app.winUrl}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white text-black text-xs font-medium hover:bg-white/90 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </a>
                    <a
                      href={app.allUrl}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-white/15 text-white/60 hover:text-white text-xs transition-colors"
                    >
                      All platforms →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* After install */}
          <div className="bg-[#0d1117] border border-white/10 rounded-xl p-5">
            <h2 className="text-sm font-medium text-white/60 mb-3">After install</h2>
            <div className="font-mono text-sm space-y-2">
              {[
                { cmd: "hanzo", desc: "Sign in, pick your coding agent, launch it" },
                { cmd: "hanzo dev --claude", desc: "Switch agent: --claude, --codex, --cursor, --agy" },
                { cmd: "hanzo -- -c", desc: "Continue the last conversation" },
                { cmd: "hanzo up", desc: "Run the cloud on this machine" },
                { cmd: "hanzo --help", desc: "Every command" },
                { cmd: "hanzo-mcp", desc: "Run the MCP server" },
              ].map((line, i) => (
                <div key={i} className="flex items-center gap-3 text-[#e6edf3]">
                  <span className="text-white/30 select-none w-4">$</span>
                  <span className="flex-1">{line.cmd}</span>
                  <span className="text-white/30 text-xs hidden md:block">{line.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Continuity: hanzo.sh -> Hanzo University (L1-L9) -> hanzo.market & sensei.group */}
          <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <h2 className="text-sm font-medium text-white">Continue from CLI to Credentials &amp; Marketplace</h2>
              <span className="text-xs font-mono text-white/40">One Hanzo IAM session across every surface</span>
            </div>
            <div className="grid md:grid-cols-3 gap-3 text-xs">
              <a
                href="https://hanzo.ai/university"
                className="block rounded-lg border border-white/10 bg-[#0d1117] p-4 hover:border-white/25 transition-colors"
              >
                <div className="font-mono text-white/40 mb-1">1 · hanzo.university</div>
                <div className="font-medium text-white mb-1">Start Free L1–L3 Track →</div>
                <p className="text-white/50">
                  Run labs locally with your CLI and Zen 6, track L1–L9 progress, and mint Chain 36963 credentials.
                </p>
              </a>
              <a
                href="https://sensei.group"
                className="block rounded-lg border border-white/10 bg-[#0d1117] p-4 hover:border-white/25 transition-colors"
              >
                <div className="font-mono text-white/40 mb-1">2 · sensei.group</div>
                <div className="font-medium text-white mb-1">Unlock L3–L9 Sensei Roster →</div>
                <p className="text-white/50">
                  Passing L3 unlocks verified human Sensei eligibility for enterprise and agent-escalated work.
                </p>
              </a>
              <a
                href="https://hanzo.market"
                className="block rounded-lg border border-white/10 bg-[#0d1117] p-4 hover:border-white/25 transition-colors"
              >
                <div className="font-mono text-white/40 mb-1">3 · hanzo.market</div>
                <div className="font-medium text-white mb-1">Apply, Deliver &amp; Settle →</div>
                <p className="text-white/50">
                  Complete org clearance at /sell, claim escrowed jobs, deliver verified work, and track payouts.
                </p>
              </a>
            </div>
          </div>

          {/* Resources */}
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="https://hanzo.ai/university"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black font-medium text-sm hover:bg-white/90 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Hanzo University (L1–L9)
            </a>
            <a
              href="https://hanzo.market"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 text-white font-medium text-sm hover:bg-white/5 transition-colors"
            >
              <Package className="w-4 h-4" />
              Hanzo Market
            </a>
            <a
              href="https://sensei.group"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 text-white font-medium text-sm hover:bg-white/5 transition-colors"
            >
              <Globe className="w-4 h-4" />
              Sensei Group
            </a>
            <a
              href="https://hanzo.ai/bounty"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 text-white font-medium text-sm hover:bg-white/5 transition-colors"
            >
              <Zap className="w-4 h-4" />
              Open Bounties
            </a>
            <a
              href="https://docs.hanzo.ai"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 text-white font-medium text-sm hover:bg-white/5 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Documentation
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <div className="flex items-center gap-2">
            <HanzoLogo className="w-4 h-4" />
            <span>© {new Date().getFullYear()} Hanzo AI, Inc.</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://hanzo.ai/privacy" className="hover:text-white transition-colors">Privacy</a>
            <a href="https://hanzo.ai/terms" className="hover:text-white transition-colors">Terms</a>
            <a href="https://status.hanzo.ai" className="hover:text-white transition-colors">Status</a>
            <a href="https://github.com/hanzoai" className="hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Hero;
