
import { Card } from "@/components/ui/card";
import { Code, Database, Bot, Share2 } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: <Code className="w-6 h-6 text-white" />,
      title: "Hanzo Code & App Builder",
      description: "Build applications faster with our AI-powered code editor and visual app builder"
    },
    {
      icon: <Database className="w-6 h-6 text-white" />,
      title: "Hanzo Analytics & Base",
      description: "Enterprise-ready infrastructure with real-time analytics and monitoring"
    },
    {
      icon: <Bot className="w-6 h-6 text-white" />,
      title: "Hanzo Dev AI Team",
      description: "Your AI development team that helps write, review, and optimize code"
    },
    {
      icon: <Share2 className="w-6 h-6 text-white" />,
      title: "Open Source & Extensible",
      description: "Built on open source technologies and designed for unlimited customization"
    }
  ];

  return (
    <div className="py-20 px-4 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-accent/5 backdrop-blur-3xl"></div>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-white">
              Accelerate Development with AI
            </h2>
            <p className="text-xl text-white/60">
              Integrate powerful AI tools into your development workflow. From smart code suggestions to automated testing, Hanzo's AI-powered platform helps you build better applications faster.
            </p>
          </div>
          <div className="grid gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="p-6 hover-lift glass-effect flex items-start gap-4 group transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                  <p className="text-white/60">{feature.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
