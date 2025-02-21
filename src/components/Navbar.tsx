
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-background/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg
            className="w-8 h-8 text-white"
            viewBox="0 0 400 400"
            fill="currentColor"
          >
            <path d="M100 50h75v75h-75zM225 50h75v75h-75zM100 275h75v75h-75zM225 275h75v75h-75zM137.5 125v150h125V125h-125z" />
          </svg>
          <span className="text-2xl font-bold text-white">Hanzo</span>
        </div>
        <div className="hidden md:flex items-center space-x-8">
          <a href="https://docs.hanzo.ai" className="text-white/80 hover:text-white transition-colors">Docs</a>
          <a href="https://hanzo.ai/pricing" className="text-white/80 hover:text-white transition-colors">Pricing</a>
          <Button 
            variant="outline" 
            className="text-white border-white/20 hover:bg-white/10"
            onClick={() => window.location.href = 'https://console.hanzo.ai'}
          >
            Console
          </Button>
          <Button 
            className="bg-white text-black hover:bg-white/90"
            onClick={() => window.location.href = 'https://auth.hanzo.ai'}
          >
            Sign in
            <LogIn className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
