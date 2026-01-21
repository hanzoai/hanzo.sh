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

  const installCommands = [
    { id: "curl", label: "Default", cmd: "curl -fsSL hanzo.sh | bash" },
    { id: "curl-full", label: "Full", cmd: "curl -fsSL hanzo.sh | bash -s -- --bundle full" },
    { id: "curl-rust", label: "Rust", cmd: "curl -fsSL hanzo.sh | bash -s -- --bundle rust" },
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
              <span className="bg-gradient-to-r from-[#fd4444] to-[#ff6b6b] bg-clip-text text-transparent">hanzo.sh</span>
            </h1>
            <p className="text-lg text-white/50 max-w-xl mx-auto">
              Install the Hanzo AI toolkit. CLI, MCP server, agents, SDKs.
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
              Requires bash. Installs <a href="https://docs.astral.sh/uv/" className="text-white/60 hover:text-white underline underline-offset-2">uv</a> if missing.
            </p>
          </div>

          {/* Quick shortcuts */}
          <div className="flex flex-wrap justify-center gap-2 text-sm">
            {[
              { path: "/dev", label: "Dev Agent" },
              { path: "/mcp", label: "MCP Server" },
              { path: "/cli", label: "CLI Only" },
              { path: "/python", label: "Python Bundle" },
              { path: "/rust", label: "Rust Bundle" },
            ].map((shortcut) => (
              <button
                key={shortcut.path}
                onClick={() => handleCopy(`curl -fsSL hanzo.sh${shortcut.path} | bash`, shortcut.path)}
                className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 hover:border-white/20 text-white/60 hover:text-white transition-colors font-mono text-xs"
              >
                hanzo.sh{shortcut.path}
                {copied === shortcut.path && <Check className="w-3 h-3 text-green-400 inline ml-1" />}
              </button>
            ))}
          </div>

          {/* Alternative installs */}
          <div className="border-t border-white/10 pt-8">
            <p className="text-center text-white/40 text-sm mb-4">Or install via package manager:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-w-2xl mx-auto">
              {[
                { id: "pip", cmd: "pip install hanzo" },
                { id: "uvx", cmd: "uvx hanzo" },
                { id: "cargo", cmd: "cargo install hanzo-dev" },
                { id: "npm", cmd: "npm i -g @hanzoai/cli" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleCopy(item.cmd, item.id)}
                  className="p-2.5 rounded-lg bg-white/[0.02] border border-white/10 hover:border-white/20 text-left transition-colors group"
                >
                  <code className="text-white/70 font-mono text-xs block truncate">{item.cmd}</code>
                  {copied === item.id && <span className="text-green-400 text-xs">Copied!</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Packages */}
          <div className="grid md:grid-cols-3 gap-3">
            {/* Python */}
            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Code className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white text-sm">Python</h3>
                  <a href="https://pypi.org/project/hanzo/" className="text-xs text-white/40 hover:text-white/60">PyPI →</a>
                </div>
              </div>
              <ul className="space-y-1.5 text-xs">
                {[
                  { pkg: "hanzo", desc: "CLI & cloud" },
                  { pkg: "hanzo-mcp", desc: "MCP server" },
                  { pkg: "hanzo-agents", desc: "Multi-agent framework" },
                  { pkg: "hanzoai", desc: "API client SDK" },
                ].map((item) => (
                  <li key={item.pkg} className="flex items-center justify-between text-white/60">
                    <code className="text-white/80">{item.pkg}</code>
                    <span className="text-white/40">{item.desc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Rust */}
            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Cpu className="w-4 h-4 text-orange-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white text-sm">Rust</h3>
                  <a href="https://github.com/hanzoai/node" className="text-xs text-white/40 hover:text-white/60">GitHub →</a>
                </div>
              </div>
              <ul className="space-y-1.5 text-xs">
                {[
                  { pkg: "hanzo-node", desc: "Compute node" },
                  { pkg: "hanzo-dev", desc: "Coding agent" },
                  { pkg: "hanzo-mcp", desc: "Fast MCP" },
                ].map((item) => (
                  <li key={item.pkg} className="flex items-center justify-between text-white/60">
                    <code className="text-white/80">{item.pkg}</code>
                    <span className="text-white/40">{item.desc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* JavaScript */}
            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white text-sm">JavaScript</h3>
                  <a href="https://www.npmjs.com/org/hanzoai" className="text-xs text-white/40 hover:text-white/60">npm →</a>
                </div>
              </div>
              <ul className="space-y-1.5 text-xs">
                {[
                  { pkg: "@hanzoai/cli", desc: "CLI" },
                  { pkg: "@hanzoai/sdk", desc: "API client" },
                  { pkg: "@hanzoai/mcp", desc: "MCP client" },
                ].map((item) => (
                  <li key={item.pkg} className="flex items-center justify-between text-white/60">
                    <code className="text-white/80">{item.pkg}</code>
                    <span className="text-white/40">{item.desc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bundles */}
          <div>
            <h2 className="text-sm font-medium text-white/60 mb-3 text-center">Installation Bundles</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { name: "minimal", desc: "CLI only", flag: "--bundle minimal", default: true },
                { name: "python", desc: "CLI + MCP + agents", flag: "--bundle python" },
                { name: "rust", desc: "High-perf binaries", flag: "--bundle rust" },
                { name: "full", desc: "Everything", flag: "--bundle full", highlight: true },
              ].map((bundle) => (
                <div
                  key={bundle.name}
                  className={`p-3 rounded-lg text-left ${
                    bundle.highlight
                      ? "bg-[#fd4444]/10 border border-[#fd4444]/30"
                      : "bg-white/[0.02] border border-white/10"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-white text-sm font-medium">{bundle.name}</code>
                    {bundle.default && <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/50">default</span>}
                    {bundle.highlight && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#fd4444]/20 text-[#fd4444]">recommended</span>}
                  </div>
                  <p className="text-xs text-white/40">{bundle.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* After install */}
          <div className="bg-[#0d1117] border border-white/10 rounded-xl p-5">
            <h2 className="text-sm font-medium text-white/60 mb-3">After install</h2>
            <div className="font-mono text-sm space-y-2">
              {[
                { cmd: "hanzo --help", desc: "Show all commands" },
                { cmd: "hanzo auth login", desc: "Authenticate with Hanzo Cloud" },
                { cmd: "hanzo dev", desc: "Start AI coding session" },
                { cmd: "hanzo-mcp", desc: "Run MCP server for Claude/IDEs" },
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
