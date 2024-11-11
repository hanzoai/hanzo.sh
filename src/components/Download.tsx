import { Button } from "@/components/ui/button";
import { Apple, Play } from "lucide-react";

const Download = () => {
  return (
    <div className="py-20 px-4 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-accent/5 backdrop-blur-3xl"></div>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Get Started Today
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Download our app and experience the future of banking. Available on iOS and Android.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="px-8 py-6 text-lg bg-white text-black hover:bg-white/90 flex items-center gap-2">
              <Apple className="w-5 h-5" />
              App Store
            </Button>
            <Button className="px-8 py-6 text-lg glass-effect hover:bg-white/10 flex items-center gap-2">
              <Play className="w-5 h-5" />
              Play Store
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Download;