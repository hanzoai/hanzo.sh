import { Button } from "@/components/ui/button";
import { Terminal, Copy, Check, Bot, Zap, Code, ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const Hero = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText("curl -fsSL hanzo.sh/install.sh | sh");
    setCopied(true);
    toast.success("Command copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 bg-background">
      <div className="max-w-5xl mx-auto text-center space-y-12">
        {/* Hero Header */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#fd4444]/10 border border-[#fd4444]/30 text-[#fd4444] text-sm font-medium">
            <Bot className="w-4 h-4" />
            AI-Powered Development Tools
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
            Install <span className="text-[#fd4444]">Hanzo</span>
          </h1>

          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Get Hanzo Dev (AI coding agent) and Hanzo CLI in one command.
            Build faster with AI that understands your codebase.
          </p>
        </div>

        {/* Install Command */}
        <div className="max-w-xl mx-auto">
          <div className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
            <Terminal className="w-5 h-5 text-neutral-500 flex-shrink-0" />
            <code className="text-white font-mono text-lg flex-1 text-left">
              curl -fsSL hanzo.sh/install.sh | sh
            </code>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-white/10 flex-shrink-0"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 text-neutral-400" />
              )}
            </Button>
          </div>
          <p className="text-neutral-500 text-sm mt-3">
            Requires Node.js 18+. Works on macOS and Linux.
          </p>
        </div>

        {/* Alternative Install Methods */}
        <div className="flex flex-wrap justify-center gap-4">
          <div className="px-4 py-2 rounded-lg bg-neutral-900/50 border border-neutral-800 text-sm">
            <span className="text-neutral-500">npm:</span>
            <code className="text-white ml-2 font-mono">npm i -g @hanzo/dev</code>
          </div>
          <div className="px-4 py-2 rounded-lg bg-neutral-900/50 border border-neutral-800 text-sm">
            <span className="text-neutral-500">npx:</span>
            <code className="text-white ml-2 font-mono">npx @hanzo/dev</code>
          </div>
          <div className="px-4 py-2 rounded-lg bg-neutral-900/50 border border-neutral-800 text-sm">
            <span className="text-neutral-500">bun:</span>
            <code className="text-white ml-2 font-mono">bun i -g @hanzo/dev</code>
          </div>
        </div>

        {/* What's Included */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 text-left">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#fd4444]/10 flex items-center justify-center">
                <Bot className="w-5 h-5 text-[#fd4444]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Hanzo Dev</h3>
                <p className="text-sm text-neutral-500">@hanzo/dev</p>
              </div>
            </div>
            <p className="text-neutral-400 text-sm mb-4">
              AI coding agent for your terminal. Understands your codebase, edits files coherently, runs tests, and opens PRs.
            </p>
            <div className="space-y-2 text-sm text-neutral-500">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                <span>Generate APIs, components, tests</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>Multi-agent orchestration</span>
              </div>
            </div>
          </div>

          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 text-left">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Terminal className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Hanzo CLI</h3>
                <p className="text-sm text-neutral-500">@hanzo/cli</p>
              </div>
            </div>
            <p className="text-neutral-400 text-sm mb-4">
              Command-line interface for Hanzo Cloud. Deploy, manage, and monitor your applications.
            </p>
            <div className="space-y-2 text-sm text-neutral-500">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>Deploy to Hanzo Cloud</span>
              </div>
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                <span>Manage projects & secrets</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Start */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6">Quick Start</h2>
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 font-mono text-sm text-left">
            <div className="space-y-2">
              <div>
                <span className="text-neutral-500">$ </span>
                <span className="text-purple-400">dev</span>
                <span className="text-green-400"> "Fix the rate limiting bug in auth.ts"</span>
              </div>
              <div className="text-neutral-600 pl-2">
                ✓ Reading codebase...<br />
                ✓ Found auth.ts with rate limiting logic<br />
                ✓ Identified bug in token bucket implementation<br />
                <span className="text-green-400">✓ Fixed and tests passing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="https://hanzo.ai/dev"
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
            href="https://github.com/hanzoai/dev"
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
