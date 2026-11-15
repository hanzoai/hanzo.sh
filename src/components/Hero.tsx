import { Copy, Check, Download, BookOpen, Zap } from "lucide-react";
import { useEffect, useLayoutEffect, useState } from "react";
import { toast } from "sonner";

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

const TOOLS = [
              {
                bin: "hanzo",
                also: "hanzo-cli",
                desc: "The Hanzo CLI \u2014 auth, billing, coding sessions, and every product of the Hanzo cloud.",
                href: "https://github.com/hanzoai/cli",
              },
              {
                bin: "hanzod",
                also: "hanzo-node",
                desc: "Hanzo Node \u2014 the L1 network validator, consensus mesh and JSON-RPC node.",
                href: "https://github.com/hanzoai/node",
              },
              {
                bin: "hanzozt",
                also: "zt",
                desc: "ZT \u2014 zero-trust networking, tunnels, controller and router.",
                href: "https://github.com/hanzozt/zt",
              },
              {
                bin: "hanzo-gen",
                also: "gen",
                desc: "Hanzo Gen \u2014 the native coding harness.",
                href: "https://github.com/hanzoai/gen",
              },
              {
                bin: "hanzo-dev",
                also: "dev",
                desc: "Hanzo Dev \u2014 the coding agent `hanzo dev` runs by default (co-installs hanzo-mcp).",
                href: "https://github.com/hanzoai/dev",
              },
              {
                bin: "hanzo-engine",
                also: "engine",
                desc: "Hanzo Engine \u2014 local OpenAI & Anthropic compatible LLM inference.",
                href: "https://github.com/hanzoai/engine",
              },
              {
                bin: "hanzo-mcp",
                also: "mcp",
                desc: "The MCP server \u2014 the Hanzo toolset, for any MCP client.",
                href: "https://github.com/hanzoai/mcp",
              },
              {
                bin: "hanzo-cloud",
                also: "cloud",
                desc: "Hanzo Cloud \u2014 self-hosted AI gateway, encrypted KMS, IAM and chat UI in one binary.",
                href: "https://github.com/hanzoai/cloud",
              },];

const SHORTCUTS = [
              { path: "/cli", label: "CLI Only" },
              { path: "/node", label: "Node" },
              { path: "/zt", label: "ZT" },
              { path: "/gen", label: "Gen" },
              { path: "/dev", label: "Dev Agent" },
              { path: "/engine", label: "Engine" },
              { path: "/mcp", label: "MCP Server" },
              { path: "/cloud", label: "Cloud" },];

const AFTER_INSTALL = [
              { cmd: "hanzo", desc: "Sign in, pick your coding agent, launch it" },
                { cmd: "hanzo dev --claude", desc: "Switch agent: --claude, --codex, --cursor, --agy" },
                { cmd: "hanzo -- -c", desc: "Continue the last conversation" },
                { cmd: "hanzo up", desc: "Run the cloud on this machine" },
                { cmd: "hanzo --help", desc: "Every command" },
                { cmd: "hanzo-mcp", desc: "Run the MCP server" },];

const Hero = () => {
  const [copied, setCopied] = useState<string | null>(null);
  const [platform, setPlatform] = useState<PlatformTab>(() => (onWindows() ? "ps1" : "unix"));

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(null), 1600);
  };

  const installCommandsByPlatform: Record<PlatformTab, { id: string; label: string; cmd: string }[]> = {
    unix: [
      { id: "all", label: "Everything", cmd: "curl -fsSL hanzo.sh | sh" },
      { id: "cli", label: "CLI", cmd: "curl -fsSL hanzo.sh/cli | sh" },
      { id: "mcp", label: "MCP", cmd: "curl -fsSL hanzo.sh/mcp | sh" },
      { id: "dev", label: "Dev", cmd: "curl -fsSL hanzo.sh/dev | sh" },
    ],
    ps1: [
      { id: "all", label: "Everything", cmd: "irm https://hanzo.sh/install.ps1 | iex" },
      { id: "cli", label: "CLI", cmd: "irm https://hanzo.sh/cli.ps1 | iex" },
      { id: "mcp", label: "MCP", cmd: "irm https://hanzo.sh/mcp.ps1 | iex" },
      { id: "dev", label: "Dev", cmd: "irm https://hanzo.sh/dev.ps1 | iex" },
    ],
    gitbash: [
      { id: "all", label: "Everything", cmd: "curl -fsSL hanzo.sh | sh" },
      { id: "cli", label: "CLI", cmd: "curl -fsSL hanzo.sh/cli | sh" },
      { id: "mcp", label: "MCP", cmd: "curl -fsSL hanzo.sh/mcp | sh" },
      { id: "dev", label: "Dev", cmd: "curl -fsSL hanzo.sh/dev | sh" },
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

  const active = installCommands.find((c) => c.id === activeInstall);
  const cmdText = active?.cmd ?? "";
  // The command types itself once and again on every tab change. The whole string is always in the DOM
  // (the untyped rest is only transparent), so screen readers and reduced motion get it whole.
  const [typed, setTyped] = useState(cmdText.length);
  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setTyped(cmdText.length); return; }
    let raf = 0;
    let start = 0;
    setTyped(0);
    const tick = (now: number) => {
      start ||= now;
      const n = Math.min(cmdText.length, Math.floor(((now - start) / 600) * cmdText.length));
      setTyped(n);
      if (n < cmdText.length) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [cmdText]);
  const platformIndex = PLATFORM_TABS.findIndex((t) => t.id === platform);
  const toolIndex = installCommands.findIndex((c) => c.id === activeInstall);
  const note = PLATFORM_TABS.find((t) => t.id === platform)?.note;

  return (
    <div className="hz">
      <header className="hz-wrap hzb-bar">
        <a href="https://hanzo.ai" className="hzb-logo">
          <HanzoLogo className="w-6 h-6" />
          <span>Hanzo</span>
        </a>
        <nav>
          <a href="https://docs.hanzo.ai" className="hz-btn hz-btn-quiet">Docs</a>
          <a href="https://github.com/hanzoai/python-sdk" className="hz-btn hz-btn-quiet">SDK</a>
          <a href="https://github.com/hanzoai" className="hz-btn hz-btn-quiet" style={{ minWidth: 44 }}>
            <Github className="w-5 h-5" />
          </a>
        </nav>
      </header>

      <main>
        <section className="hz-wrap hz-section hz-arrive">
          <div className="hz-head hz-arrive">
            <h1 className="hz-display">
              <code style={{ font: "inherit" }}>curl</code> <span>hanzo.sh</span>
            </h1>
            <p>
              The Hanzo CLI, the MCP server and the coding agent, as native
              binaries. One command, nothing to build.
            </p>
          </div>

          <div className="hzb-stack hzb-tabs">
              <div className="hz-seg hzb-os" style={{ "--hz-seg-n": 4, "--hz-seg-i": platformIndex } as React.CSSProperties}>
                {PLATFORM_TABS.map((tab) => (
                  <button key={tab.id} type="button" aria-pressed={platform === tab.id} onClick={() => setPlatform(tab.id)}>
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="hz-seg hzb-seg-4" style={{ "--hz-seg-n": 4, "--hz-seg-i": toolIndex } as React.CSSProperties}>
                {installCommands.map((item) => (
                  <button key={item.id} type="button" aria-pressed={activeInstall === item.id} onClick={() => setActiveInstall(item.id)}>
                    {item.label}
                  </button>
                ))}
              </div>
          </div>

          <div className="hz-stage">
            <div className="hzb-stack">
              <div className="hzb-term hz-codeblock hz-gleam">
                <button
                  type="button"
                  className={`hz-btn hz-btn-primary hz-copy${copied === activeInstall ? " is-copied" : ""}`}
                  aria-labelledby="install-cmd"
                  onClick={() => handleCopy(active?.cmd || "", activeInstall)}
                >
                  {copied === activeInstall ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
                <div className="hzb-body">
                  <div className="hzb-run">
                    <span aria-hidden="true">$</span>
                    <code id="install-cmd">{cmdText.slice(0, typed)}<span style={{ color: "transparent" }}>{cmdText.slice(typed)}</span></code>
                    {/* every command, unseen, in the same cell: the card keeps the height of the longest one */}
                    {Object.values(installCommandsByPlatform).flat().map((c, i) => <code key={i} className="hzb-ghost" aria-hidden="true">{c.cmd}</code>)}
                  </div>
                  <div className="hzb-out">
                    <div className="hzb-note">
                      <p key={platform} className="hz-swap is-in">{note}</p>
                      {PLATFORM_TABS.map((t) => <p key={t.id} className="hzb-ghost" aria-hidden="true">{t.note}</p>)}
                    </div>
                    <p>
                      One prebuilt native binary per tool, SHA-256 verified. No runtime,
                      no package manager, no build step. Re-run to upgrade.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="hzb-stack">
              <p className="hzb-lead">Or paste this into Claude Code, Codex, Cursor or Antigravity</p>
              <button
                type="button"
                aria-label="Copy the line to paste into your coding agent"
                onClick={() => handleCopy(AGENT_LINE, "agent")}
                className={`hz-codeline hzb-agent${copied === "agent" ? " is-copied" : ""}`}
                style={{ height: "auto", padding: "12px 18px", borderRadius: "var(--hz-r16)", color: "inherit", textAlign: "start" }}
              >
                <code style={{ whiteSpace: "normal" }}>{AGENT_LINE}</code>
                {copied === "agent" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>

              <div className="hz-tags hzb-pills" style={{ justifyContent: "center" }}>
                {SHORTCUTS.map((shortcut) => (
                  <button
                    key={shortcut.path}
                    type="button"
                    onClick={() => handleCopy(`curl -fsSL hanzo.sh${shortcut.path} | sh`, shortcut.path)}
                    className={`hz-btn hz-btn-sm${copied === shortcut.path ? " is-copied" : ""}`}
                  >
                    <span>hanzo.sh{shortcut.path}</span>
                    {copied === shortcut.path && <Check className="w-3 h-3" />}
                  </button>
                ))}
              </div>
          </div>
        </section>

        <section className="hz-wrap hz-section">
          <div className="hz-grid hz-grid-4">
            {TOOLS.map((t) => (
              <div key={t.bin} className="hz-card hz-lift">
                <h3 className="font-mono">{t.bin}</h3>
                <p className="hz-small">{t.desc}</p>
                <div className="hz-tags">
                  <span className="hz-tag">alias: <code>{t.also}</code></span>
                  <a href={t.href} className="hz-tag">source <span className="hz-arrow">→</span></a>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="hz-wrap hz-section">
          <div className="hz-head">
            <h2>Desktop Apps (Windows x64, macOS, Linux)</h2>
            <p>Native installers</p>
          </div>
          <div className="hz-grid hz-grid-4">
            {DESKTOP_APPS.map((app) => (
              <div key={app.name} className="hz-card hz-lift">
                <h3>{app.name}</h3>
                <span className="hz-label">{app.domain}</span>
                <p className="hz-small">{app.desc}</p>
                <div className="hzb-acts">
                  <a href={app.winUrl} className="hz-btn hz-btn-sm">
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </a>
                  <a href={app.allUrl} className="hz-btn hz-btn-sm hz-btn-quiet">All platforms <span className="hz-arrow">→</span></a>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="hz-wrap hz-section">
          <div className="hz-head">
            <h2>After install</h2>
          </div>
          <dl className="hz-ledger hzb-ledger">
            {AFTER_INSTALL.map((line) => (
              <div key={line.cmd} className="hzb-cmdrow">
                <dt><span aria-hidden="true">$</span>{line.cmd}</dt>
                <dd>{line.desc}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="hz-wrap hz-section">
          <div className="hz-actions">
            <a href="https://docs.hanzo.ai" className="hz-btn"><BookOpen className="w-4 h-4" />Documentation</a>
            <a href="https://github.com/hanzoai/python-sdk" className="hz-btn"><Github className="w-4 h-4" />Python SDK</a>
            <a href="https://github.com/hanzoai/js-sdk" className="hz-btn"><Github className="w-4 h-4" />JS SDK</a>
            <a href="https://hanzo.ai" className="hz-btn"><Zap className="w-4 h-4" />hanzo.ai</a>
          </div>
        </section>
      </main>

      <footer className="hz-wrap hzb-foot">
        <div>
          <HanzoLogo className="w-4 h-4" />
          <span>© {new Date().getFullYear()} Hanzo AI, Inc.</span>
        </div>
        <nav>
          <a href="https://hanzo.ai/privacy" className="hz-btn hz-btn-quiet hz-btn-sm">Privacy</a>
          <a href="https://hanzo.ai/terms" className="hz-btn hz-btn-quiet hz-btn-sm">Terms</a>
          <a href="https://status.hanzo.ai" className="hz-btn hz-btn-quiet hz-btn-sm">Status</a>
          <a href="https://github.com/hanzoai" className="hz-btn hz-btn-quiet hz-btn-sm">GitHub</a>
        </nav>
      </footer>
    </div>
  );
};

export default Hero;
