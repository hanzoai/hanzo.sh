import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Hero = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-20">
      <h1 className="text-6xl font-bold text-center max-w-4xl leading-tight mb-6">
        Manage your secrete finance system with safety
      </h1>
      <p className="text-xl text-secondary-foreground text-center max-w-2xl mb-12">
        Monie is a secrate and trusted platform to save your money. We make clear
        transaction and keep your finance safe.
      </p>
      <div className="flex flex-col items-center gap-8">
        <Button className="px-8 py-6 text-lg">
          Get Started
        </Button>
        <div className="flex items-center -space-x-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Avatar key={i} className="border-2 border-white">
              <AvatarImage src={`https://i.pravatar.cc/150?img=${i}`} />
              <AvatarFallback>U{i}</AvatarFallback>
            </Avatar>
          ))}
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white">
            <Plus className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;