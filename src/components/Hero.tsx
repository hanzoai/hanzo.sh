import { Button } from "@/components/ui/button";
import { Terminal, Copy, Check, Bot, Zap, Code, ExternalLink, Package, Cpu, Globe } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const Hero = () => {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success("Command copied to clipboard!");
    setTimeout(() => setCopied(null), 2000);
  };

  const installCommands = [
    { id: "curl", label: "Quick Install", cmd: "curl -fsSL https://hanzo.sh/install | bash" },
    { id: "curl-rust", label: "Rust Tools", cmd: "curl -fsSL https://hanzo.sh/install | bash -s -- --bundle rust" },
    { id: "curl-full", label: "Full Install", cmd: "curl -fsSL https://hanzo.sh/install | bash -s -- --bundle full" },
  ];

  const [activeInstall, setActiveInstall] = useState("curl");

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 bg-background">
      <div className="max-w-5xl mx-auto text-center space-y-12">
        {/* Hero Header */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#fd4444]/10 border border-[#fd4444]/30 text-[#fd4444] text-sm font-medium">
            <Bot className="w-4 h-4" />
            Universal AI Development Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
            Install <span className="text-[#fd4444]">Hanzo</span>
          </h1>

          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            One command to install the complete Hanzo AI toolkit.
            CLI, MCP, Agents, Dev tools — in Python, Rust, or JavaScript.
          </p>
        </div>

        {/* Install Command Tabs */}
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-center gap-2 mb-4">
            {installCommands.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveInstall(item.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeInstall === item.id
                    ? "bg-[#fd4444] text-white"
                    : "bg-neutral-900 text-neutral-400 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
            <Terminal className="w-5 h-5 text-neutral-500 flex-shrink-0" />
            <code className="text-white font-mono text-sm md:text-base flex-1 text-left overflow-x-auto">
              {installCommands.find((c) => c.id === activeInstall)?.cmd}
            </code>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-white/10 flex-shrink-0"
              onClick={() =>
                handleCopy(
                  installCommands.find((c) => c.id === activeInstall)?.cmd || "",
                  activeInstall
                )
              }
            >
              {copied === activeInstall ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 text-neutral-400" />
              )}
            </Button>
          </div>
          <p className="text-neutral-500 text-sm mt-3">
            Works on macOS and Linux. Installs uv, then Hanzo tools.
          </p>
        </div>

        {/* Alternative Install Methods */}
        <div className="space-y-4">
          <p className="text-neutral-400 text-sm">Or install specific tools:</p>
          <div className="flex flex-wrap justify-center gap-3">
            <div
              className="px-4 py-2 rounded-lg bg-neutral-900/50 border border-neutral-800 text-sm cursor-pointer hover:border-neutral-700 transition-colors"
              onClick={() => handleCopy("pip install hanzo[all]", "pip")}
            >
              <span className="text-neutral-500">pip:</span>
              <code className="text-white ml-2 font-mono">pip install hanzo[all]</code>
              {copied === "pip" && <Check className="w-3 h-3 text-green-500 inline ml-2" />}
            </div>
            <div
              className="px-4 py-2 rounded-lg bg-neutral-900/50 border border-neutral-800 text-sm cursor-pointer hover:border-neutral-700 transition-colors"
              onClick={() => handleCopy("uvx hanzo", "uvx")}
            >
              <span className="text-neutral-500">uvx:</span>
              <code className="text-white ml-2 font-mono">uvx hanzo</code>
              {copied === "uvx" && <Check className="w-3 h-3 text-green-500 inline ml-2" />}
            </div>
            <div
              className="px-4 py-2 rounded-lg bg-neutral-900/50 border border-neutral-800 text-sm cursor-pointer hover:border-neutral-700 transition-colors"
              onClick={() => handleCopy("cargo install hanzo-dev", "cargo")}
            >
              <span className="text-neutral-500">cargo:</span>
              <code className="text-white ml-2 font-mono">cargo install hanzo-dev</code>
              {copied === "cargo" && <Check className="w-3 h-3 text-green-500 inline ml-2" />}
            </div>
            <div
              className="px-4 py-2 rounded-lg bg-neutral-900/50 border border-neutral-800 text-sm cursor-pointer hover:border-neutral-700 transition-colors"
              onClick={() => handleCopy("npm i -g @hanzoai/cli", "npm")}
            >
              <span className="text-neutral-500">npm:</span>
              <code className="text-white ml-2 font-mono">npm i -g @hanzoai/cli</code>
              {copied === "npm" && <Check className="w-3 h-3 text-green-500 inline ml-2" />}
            </div>
          </div>
        </div>

        {/* What's Included - 3 Column Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 text-left">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Code className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Python</h3>
                <p className="text-sm text-neutral-500">PyPI</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li className="flex items-center gap-2">
                <Package className="w-4 h-4 text-neutral-500" />
                <span>hanzo — CLI & Platform</span>
              </li>
              <li className="flex items-center gap-2">
                <Package className="w-4 h-4 text-neutral-500" />
                <span>hanzo-mcp — MCP Server</span>
              </li>
              <li className="flex items-center gap-2">
                <Package className="w-4 h-4 text-neutral-500" />
                <span>hanzo-agents — Multi-Agent</span>
              </li>
              <li className="flex items-center gap-2">
                <Package className="w-4 h-4 text-neutral-500" />
                <span>hanzoai — AI SDK</span>
              </li>
            </ul>
          </div>

          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 text-left">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Rust</h3>
                <p className="text-sm text-neutral-500">Cargo / GitHub</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li className="flex items-center gap-2">
                <Package className="w-4 h-4 text-neutral-500" />
                <span>hanzo-node — AI Compute</span>
              </li>
              <li className="flex items-center gap-2">
                <Package className="w-4 h-4 text-neutral-500" />
                <span>hanzo-dev — Coding Agent</span>
              </li>
              <li className="flex items-center gap-2">
                <Package className="w-4 h-4 text-neutral-500" />
                <span>hanzo-mcp — Fast MCP</span>
              </li>
            </ul>
          </div>

          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 text-left">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Globe className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">JavaScript</h3>
                <p className="text-sm text-neutral-500">npm</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li className="flex items-center gap-2">
                <Package className="w-4 h-4 text-neutral-500" />
                <span>@hanzoai/cli — CLI</span>
              </li>
              <li className="flex items-center gap-2">
                <Package className="w-4 h-4 text-neutral-500" />
                <span>@hanzoai/sdk — SDK</span>
              </li>
              <li className="flex items-center gap-2">
                <Package className="w-4 h-4 text-neutral-500" />
                <span>@hanzoai/mcp — MCP Client</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bundles */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6">Installation Bundles</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 text-left">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white">minimal</h3>
                <span className="text-xs text-neutral-500">Default</span>
              </div>
              <p className="text-sm text-neutral-400">Python CLI only</p>
              <code className="text-xs text-neutral-500 mt-2 block">--bundle minimal</code>
            </div>
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 text-left">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white">python</h3>
              </div>
              <p className="text-sm text-neutral-400">CLI, MCP, Agents, AI SDK</p>
              <code className="text-xs text-neutral-500 mt-2 block">--bundle python</code>
            </div>
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 text-left">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white">rust</h3>
                <span className="text-xs text-[#fd4444]">High Performance</span>
              </div>
              <p className="text-sm text-neutral-400">Node, Dev, MCP (Rust)</p>
              <code className="text-xs text-neutral-500 mt-2 block">--bundle rust</code>
            </div>
            <div className="bg-neutral-950 border border-[#fd4444]/30 rounded-xl p-5 text-left">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white">full</h3>
                <span className="text-xs text-[#fd4444]">Recommended</span>
              </div>
              <p className="text-sm text-neutral-400">Everything: Python + Rust</p>
              <code className="text-xs text-neutral-500 mt-2 block">--bundle full</code>
            </div>
          </div>
        </div>

        {/* Quick Start */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6">Quick Start</h2>
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 font-mono text-sm text-left">
            <div className="space-y-3">
              <div>
                <span className="text-neutral-500">$ </span>
                <span className="text-purple-400">hanzo install</span>
                <span className="text-green-400"> doctor</span>
                <span className="text-neutral-500 ml-4"># Check installation</span>
              </div>
              <div>
                <span className="text-neutral-500">$ </span>
                <span className="text-purple-400">hanzo</span>
                <span className="text-green-400"> dev</span>
                <span className="text-neutral-500 ml-4"># Start AI coding session</span>
              </div>
              <div>
                <span className="text-neutral-500">$ </span>
                <span className="text-purple-400">hanzo</span>
                <span className="text-green-400"> cloud deploy</span>
                <span className="text-neutral-500 ml-4"># Deploy to cloud</span>
              </div>
              <div>
                <span className="text-neutral-500">$ </span>
                <span className="text-purple-400">hanzo-mcp</span>
                <span className="text-neutral-500 ml-4"># Start MCP server</span>
              </div>
            </div>
          </div>
        </div>

        {/* Environment Variables */}
        <div className="max-w-2xl mx-auto text-left">
          <h2 className="text-xl font-bold text-white mb-4 text-center">Environment Variables</h2>
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 font-mono text-sm">
            <div className="space-y-2">
              <div>
                <span className="text-blue-400">HANZO_INSTALL_DIR</span>
                <span className="text-neutral-500"> — Custom install directory</span>
              </div>
              <div>
                <span className="text-blue-400">HANZO_PREFER_RUST</span>
                <span className="text-neutral-500">=1 — Prefer Rust implementations</span>
              </div>
              <div>
                <span className="text-blue-400">HANZO_BUNDLE</span>
                <span className="text-neutral-500"> — Default bundle (minimal, python, rust, full)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="https://hanzo.ai"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#fd4444] text-white font-medium hover:bg-[#fd4444]/90 transition-colors"
          >
            Learn More
            <ExternalLink className="w-4 h-4" />
          </a>
          <a
            href="https://docs.hanzo.ai"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-neutral-700 text-white font-medium hover:bg-neutral-900 transition-colors"
          >
            Documentation
            <ExternalLink className="w-4 h-4" />
          </a>
          <a
            href="https://github.com/hanzoai"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-neutral-700 text-white font-medium hover:bg-neutral-900 transition-colors"
          >
            GitHub
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Hero;
