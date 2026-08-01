import { Button } from "@/components/ui/button";
import { Terminal, Copy, Check, Code, ExternalLink, Package, Cpu, Globe, Github, BookOpen, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const HanzoLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 67 67" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M22.21 67V44.6369H0V67H22.21Z" fill="currentColor"/>
    <path d="M0 44.6369L22.21 46.8285V44.6369H0Z" fill="currentColor" opacity="0.7"/>
    <path d="M66.7038 22.3184H22.2534L0.0878906 44.6367H44.4634L66.7038 22.3184Z" fill="currentColor"/>
    <path d="M22.21 0H0V22.3184H22.21V0Z" fill="currentColor"/>
    <path d="M66.7198 0H44.5098V22.3184H66.7198V0Z" fill="currentColor"/>
    <path d="M66.6753 22.3185L44.5098 20.0822V22.3185H66.6753Z" fill="currentColor" opacity="0.7"/>
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

  // One install path. `| sh` because the installer is POSIX and the served
  // polyglot declares #!/bin/sh — the page and llms.txt used to disagree, and
  // the `sh` half died on dash before anything was downloaded.
  const installCommands = [
    { id: "curl", label: "Everything", cmd: "curl -fsSL hanzo.sh | sh" },
    { id: "curl-cli", label: "CLI", cmd: "curl -fsSL hanzo.sh/cli | sh" },
    { id: "curl-mcp", label: "MCP", cmd: "curl -fsSL hanzo.sh/mcp | sh" },
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
            <a href="https://github.com/hanzoai/python-sdk" className="px-3 py-1.5 text-sm text-white/60 hover:text-white transition-colors rounded-md hover:bg-white/5">
              SDK
            </a>
            <a href="https://github.com/hanzoai" className="ml-2 p-2 text-white/60 hover:text-white transition-colors rounded-md hover:bg-white/5">
              <Github className="w-5 h-5" />
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
              The Hanzo CLI and MCP server, as native binaries. One command,
              nothing to build.
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
            ].map((t) => (
              <div key={t.bin} className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className={`w-8 h-8 rounded-lg ${t.tint} flex items-center justify-center`}>
                    {t.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-white text-sm font-mono">{t.bin}</h3>
                    <a href={t.href} className="text-xs text-white/40 hover:text-white/60">source \u2192</a>
                  </div>
                </div>
                <p className="text-xs text-white/50 mb-3">{t.desc}</p>
                <p className="text-[11px] text-white/30">
                  also installed as <code className="text-white/50">{t.also}</code> \u2014 the same build, symlinked
                </p>
              </div>
            ))}
          </div>

          {/* Not included \u2014 say so rather than let someone find out */}
          <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
            <h2 className="text-sm font-medium text-white/60 mb-3">Not included yet</h2>
            <ul className="space-y-1.5 text-xs">
              {[
                { bin: "dev", why: "the agent `hanzo code` runs by default \u2014 source is not public yet" },
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

          {/* Resources */}
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="https://docs.hanzo.ai"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black font-medium text-sm hover:bg-white/90 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Documentation
            </a>
            <a
              href="https://github.com/hanzoai/python-sdk"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 text-white font-medium text-sm hover:bg-white/5 transition-colors"
            >
              <Github className="w-4 h-4" />
              Python SDK
            </a>
            <a
              href="https://github.com/hanzoai/js-sdk"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 text-white font-medium text-sm hover:bg-white/5 transition-colors"
            >
              <Github className="w-4 h-4" />
              JS SDK
            </a>
            <a
              href="https://hanzo.ai"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 text-white font-medium text-sm hover:bg-white/5 transition-colors"
            >
              <Zap className="w-4 h-4" />
              hanzo.ai
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <div className="flex items-center gap-2">
            <HanzoLogo className="w-4 h-4" />
            <span>© 2016–{new Date().getFullYear()} Hanzo AI, Inc.</span>
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
