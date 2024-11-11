import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const Hero = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 bg-background">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
            Responsible Banking Made Easier
          </h1>
          <p className="text-lg text-white/80 max-w-xl">
            Financial services, including P2P payments, balance check and top-ups - are now available from any mobile app, including all messaging ones.
          </p>
          <Button className="px-8 py-6 text-lg bg-white text-black hover:bg-white/90 flex items-center gap-2">
            <Download className="w-5 h-5" />
            Download Application
          </Button>
          <div className="grid grid-cols-3 gap-8 pt-8">
            <div>
              <div className="text-3xl font-bold text-white">5000+</div>
              <div className="text-white/60">Active users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">30.3k</div>
              <div className="text-white/60">Download</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">1200+</div>
              <div className="text-white/60">Reviews</div>
            </div>
          </div>
        </div>
        <div className="relative">
          <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1288&auto=format&fit=crop"
              alt="Banking App"
              className="w-full h-auto"
            />
          </div>
          <div className="absolute -bottom-4 -right-4 w-72 h-72 bg-accent/20 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
};

export default Hero;