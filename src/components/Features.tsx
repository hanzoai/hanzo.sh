import { Card } from "@/components/ui/card";
import { Wallet, Shield, CreditCard } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: <Wallet className="w-6 h-6 text-white" />,
      title: "Mobile Banking",
      description: "Manage your finances on the go with our secure mobile banking platform"
    },
    {
      icon: <Shield className="w-6 h-6 text-white" />,
      title: "Secure Transactions",
      description: "Bank-grade security for all your transactions and personal data"
    },
    {
      icon: <CreditCard className="w-6 h-6 text-white" />,
      title: "Digital Cards",
      description: "Virtual and physical cards with advanced control features"
    }
  ];

  return (
    <div className="py-20 px-4 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-accent/5 backdrop-blur-3xl"></div>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-white">
              All the experience in the new application
            </h2>
            <p className="text-xl text-white/60">
              Simple transfers, payments for utilities, functional statements, card settings, for which you used to have to go to the branch online-banking
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