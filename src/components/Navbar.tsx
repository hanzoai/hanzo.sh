import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="text-2xl font-bold">BLUEPEAK</div>
        <div className="flex items-center space-x-8">
          <a href="#" className="hover:text-accent">Home</a>
          <a href="#" className="hover:text-accent">Product</a>
          <a href="#" className="hover:text-accent">Feature</a>
          <a href="#" className="hover:text-accent">Pricing</a>
          <Button variant="outline" className="flex items-center gap-2">
            <LogIn className="w-4 h-4" />
            Log In
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;