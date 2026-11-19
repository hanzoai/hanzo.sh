import { Button } from "@/components/ui/button";
import { Terminal, Copy, Check, Code, ExternalLink, Package, Cpu, Globe, BookOpen, Zap } from "lucide-react";
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

const Hero = () => {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(null), 2000);
  };

  // One install path. `| sh` because the installer is POSIX and the file the
  // site hands curl declares #!/bin/sh — the page and llms.txt used to
  // disagree, and the `sh` half died on dash before anything was downloaded.
  const installCommands = [
    { id: "curl", label: "Everything", cmd: "curl -fsSL hanzo.sh | sh" },
    { id: "curl-cli", label: "CLI", cmd: "curl -fsSL hanzo.sh/cli | sh" },
    { id: "curl-mcp", label: "MCP", cmd: "curl -fsSL hanzo.sh/mcp | sh" },
    { id: "curl-dev", label: "Dev", cmd: "curl -fsSL hanzo.sh/dev | sh" },
  ];

  const [activeInstall, setActiveInstall] = useState("curl");

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
              <code className="text-[#e6edf3] font-mono text-sm flex-1 select-all">
                {installCommands.find((c) => c.id === activeInstall)?.cmd}
              </code>
              {copied === activeInstall ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>

            <p className="text-center text-white/40 text-xs">
              One prebuilt native binary per tool, checksum-verified. No runtime,
              no package manager, no build step. Re-run to upgrade.
            </p>
          </div>

          {/* Quick shortcuts */}
          <div className="flex flex-wrap justify-center gap-2 text-sm">
            {[
              { path: "/cli", label: "CLI Only" },
              { path: "/mcp", label: "MCP Server" },
              { path: "/dev", label: "Dev Agent" },
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
                also: "hanzo-node",
                desc: "The Hanzo CLI \u2014 auth, billing, coding sessions, and every product of the Hanzo cloud.",
                href: "https://github.com/hanzoai/cli",
                icon: <Cpu className="w-4 h-4 text-orange-400" />,
                tint: "bg-orange-500/10",
              },
              {
                bin: "hanzo-mcp",
                also: "mcp",
                desc: "The MCP server \u2014 the Hanzo toolset, for any MCP client.",
                href: "https://github.com/hanzoai/mcp",
                icon: <Code className="w-4 h-4 text-green-400" />,
                tint: "bg-green-500/10",
              },
              {
                bin: "dev",
                also: null,
                desc: "Hanzo Dev \u2014 the coding agent `hanzo code` runs by default.",
                href: "https://github.com/hanzoai/dev",
                icon: <Terminal className="w-4 h-4 text-sky-400" />,
                tint: "bg-sky-500/10",
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
                    also installed as <code className="text-white/50">{t.also}</code> — the same build, symlinked
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Not included — say so rather than let someone find out */}
          <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
            <h2 className="text-sm font-medium text-white/60 mb-3">Not included yet</h2>
            <ul className="space-y-1.5 text-xs">
              {[
                { bin: "node", why: "source is not public yet" },
                { bin: "desktop", why: "`hanzo desktop` is in the CLI; the standalone app is not public yet" },
                { bin: "bot", why: "`hanzo bot` is in the CLI; the standalone node is not native yet" },
              ].map((item) => (
                <li key={item.bin} className="flex items-start justify-between gap-4 text-white/50">
                  <code className="text-white/70 shrink-0">{item.bin}</code>
                  <span className="text-white/35 text-right">{item.why}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* After install */}
          <div className="bg-[#0d1117] border border-white/10 rounded-xl p-5">
            <h2 className="text-sm font-medium text-white/60 mb-3">After install</h2>
            <div className="font-mono text-sm space-y-2">
              {[
                { cmd: "hanzo auth login", desc: "Sign in through Hanzo IAM" },
                { cmd: "hanzo code", desc: "Start a coding session" },
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
