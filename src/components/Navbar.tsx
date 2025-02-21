
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-background/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg 
            width="32" 
            height="32" 
            viewBox="0 0 61 61" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M20.2218 60.0521V40.0081H0V60.0521H20.2218Z" fill="white"/>
            <path d="M0 40.0081L20.2218 41.9724V40.0081H0Z" fill="#D3D3D3"/>
            <path d="M60.733 20.0039H20.2618L0.0805664 40.0079H40.4836L60.733 20.0039Z" fill="white"/>
            <path d="M20.2218 0H0V20.004H20.2218V0Z" fill="white"/>
            <path d="M60.7452 0H40.5234V20.004H60.7452V0Z" fill="white"/>
            <path d="M60.7047 20.0039L40.5234 17.9995V20.0039H60.7047Z" fill="#D3D3D3"/>
            <path d="M60.7452 60.0521V40.0081H40.5234V60.0521H60.7452Z" fill="white"/>
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
