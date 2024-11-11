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
    <div className="py-20 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-white text-center mb-4">
          All the experience in the new application
        </h2>
        <p className="text-xl text-white/60 text-center mb-12 max-w-2xl mx-auto">
          Simple transfers, payments for utilities, functional statements, card settings, for which you used to have to go to the branch online-banking
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 hover-lift bg-white/5 backdrop-blur border-white/10">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
              <p className="text-white/60">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;