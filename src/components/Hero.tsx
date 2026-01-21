import { Button } from "@/components/ui/button";
import { Terminal, Copy, Check, Bot, Code, ExternalLink, Package, Cpu, Globe, Github } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const Hero = () => {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(null), 2000);
  };

  const installCommands = [
    { id: "curl", label: "Quick Install", cmd: "curl -fsSL hanzo.sh | bash" },
    { id: "curl-rust", label: "Rust Tools", cmd: "curl -fsSL hanzo.sh | bash -s -- --bundle rust" },
    { id: "curl-full", label: "Full Install", cmd: "curl -fsSL hanzo.sh | bash -s -- --bundle full" },
  ];

  const [activeInstall, setActiveInstall] = useState("curl");

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="https://hanzo.ai" className="flex items-center gap-2 text-white font-semibold text-lg">
            <span className="text-[#fd4444]">漢</span> Hanzo
          </a>
          <nav className="flex items-center gap-6">
            <a href="https://docs.hanzo.ai" className="text-sm text-white/60 hover:text-white transition-colors">Docs</a>
            <a href="https://github.com/hanzoai" className="text-white/60 hover:text-white transition-colors">
              <Github className="w-5 h-5" />
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-16">
          {/* Hero Header */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/80 text-sm">
              <Bot className="w-4 h-4 text-[#fd4444]" />
              Universal AI Development Platform
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="text-white">curl </span>
              <span className="bg-gradient-to-r from-[#fd4444] to-[#ff6b6b] bg-clip-text text-transparent">hanzo.sh</span>
            </h1>

            <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
              One command. Complete AI toolkit.<br className="hidden md:block" />
              CLI, MCP, Agents, Dev tools — Python, Rust, JavaScript.
            </p>
          </div>

          {/* Install Command */}
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex justify-center gap-1 p-1 bg-white/5 rounded-lg w-fit mx-auto">
              {installCommands.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveInstall(item.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeInstall === item.id
                      ? "bg-[#fd4444] text-white shadow-lg shadow-[#fd4444]/25"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="group relative flex items-center gap-3 bg-white/[0.03] border border-white/10 hover:border-white/20 p-4 rounded-xl transition-colors">
              <Terminal className="w-5 h-5 text-white/30 flex-shrink-0" />
              <code className="text-white/90 font-mono text-sm md:text-base flex-1 text-left">
                {installCommands.find((c) => c.id === activeInstall)?.cmd}
              </code>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-50 group-hover:opacity-100 hover:bg-white/10 transition-opacity"
                onClick={() =>
                  handleCopy(
                    installCommands.find((c) => c.id === activeInstall)?.cmd || "",
                    activeInstall
                  )
                }
              >
                {copied === activeInstall ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-white/30 text-sm">
              macOS & Linux • Installs uv + Hanzo tools
            </p>
          </div>

          {/* Alternative Methods */}
          <div className="space-y-4">
            <p className="text-white/40 text-sm">Or install directly:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                { id: "pip", label: "pip", cmd: "pip install hanzo[all]" },
                { id: "uvx", label: "uvx", cmd: "uvx hanzo" },
                { id: "cargo", label: "cargo", cmd: "cargo install hanzo-dev" },
                { id: "npm", label: "npm", cmd: "npm i -g @hanzoai/cli" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleCopy(item.cmd, item.id)}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 hover:border-white/20 text-sm transition-colors flex items-center gap-2"
                >
                  <span className="text-white/40">{item.label}:</span>
                  <code className="text-white/80 font-mono">{item.cmd}</code>
                  {copied === item.id && <Check className="w-3 h-3 text-green-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Packages Grid */}
          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {/* Python */}
            <div className="group bg-white/[0.02] border border-white/10 hover:border-green-500/30 rounded-2xl p-6 text-left transition-colors">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Code className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Python</h3>
                  <p className="text-xs text-white/40">PyPI</p>
                </div>
              </div>
              <ul className="space-y-2.5 text-sm">
                {["hanzo — CLI & Platform", "hanzo-mcp — MCP Server", "hanzo-agents — Multi-Agent", "hanzoai — AI SDK"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-white/60">
                    <Package className="w-3.5 h-3.5 text-white/30" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Rust */}
            <div className="group bg-white/[0.02] border border-white/10 hover:border-orange-500/30 rounded-2xl p-6 text-left transition-colors">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Rust</h3>
                  <p className="text-xs text-white/40">Cargo / GitHub</p>
                </div>
              </div>
              <ul className="space-y-2.5 text-sm">
                {["hanzo-node — AI Compute", "hanzo-dev — Coding Agent", "hanzo-mcp — Fast MCP"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-white/60">
                    <Package className="w-3.5 h-3.5 text-white/30" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* JavaScript */}
            <div className="group bg-white/[0.02] border border-white/10 hover:border-yellow-500/30 rounded-2xl p-6 text-left transition-colors">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">JavaScript</h3>
                  <p className="text-xs text-white/40">npm</p>
                </div>
              </div>
              <ul className="space-y-2.5 text-sm">
                {["@hanzoai/cli — CLI", "@hanzoai/sdk — SDK", "@hanzoai/mcp — MCP Client"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-white/60">
                    <Package className="w-3.5 h-3.5 text-white/30" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bundles */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-semibold text-white mb-6">Installation Bundles</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                { name: "minimal", desc: "Python CLI only", flag: "--bundle minimal", tag: "Default" },
                { name: "python", desc: "CLI, MCP, Agents, AI SDK", flag: "--bundle python" },
                { name: "rust", desc: "Node, Dev, MCP (Rust)", flag: "--bundle rust", tag: "Fast" },
                { name: "full", desc: "Everything: Python + Rust", flag: "--bundle full", tag: "Recommended", highlight: true },
              ].map((bundle) => (
                <div
                  key={bundle.name}
                  className={`p-4 rounded-xl text-left transition-colors ${
                    bundle.highlight
                      ? "bg-[#fd4444]/5 border border-[#fd4444]/20 hover:border-[#fd4444]/40"
                      : "bg-white/[0.02] border border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-white">{bundle.name}</h3>
                    {bundle.tag && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        bundle.highlight ? "bg-[#fd4444]/20 text-[#fd4444]" : "bg-white/10 text-white/50"
                      }`}>
                        {bundle.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-white/50">{bundle.desc}</p>
                  <code className="text-xs text-white/30 mt-2 block font-mono">{bundle.flag}</code>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Start */}
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-white mb-6">Quick Start</h2>
            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6 font-mono text-sm text-left space-y-3">
              {[
                { cmd: "hanzo install doctor", comment: "Check installation" },
                { cmd: "hanzo dev", comment: "Start AI coding session" },
                { cmd: "hanzo cloud deploy", comment: "Deploy to cloud" },
                { cmd: "hanzo-mcp", comment: "Start MCP server" },
              ].map((line, i) => (
                <div key={i} className="flex items-start gap-4">
                  <span className="text-white/30 select-none">$</span>
                  <span className="text-white/80">{line.cmd}</span>
                  <span className="text-white/30 ml-auto hidden md:block"># {line.comment}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <a
              href="https://hanzo.ai"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#fd4444] text-white font-medium hover:bg-[#fd4444]/90 transition-colors"
            >
              Learn More
              <ExternalLink className="w-4 h-4" />
            </a>
            <a
              href="https://docs.hanzo.ai"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/20 text-white font-medium hover:bg-white/5 transition-colors"
            >
              Documentation
            </a>
            <a
              href="https://github.com/hanzoai"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/20 text-white font-medium hover:bg-white/5 transition-colors"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/40">
          <div className="flex items-center gap-2">
            <span className="text-[#fd4444]">漢</span>
            <span>© 2017-{new Date().getFullYear()} Hanzo AI, Inc.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://hanzo.ai/privacy" className="hover:text-white transition-colors">Privacy</a>
            <a href="https://hanzo.ai/terms" className="hover:text-white transition-colors">Terms</a>
            <a href="https://status.hanzo.ai" className="hover:text-white transition-colors">Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Hero;
