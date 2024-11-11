import { Card } from "@/components/ui/card";
import { LineChart, DollarSign, Shield } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: <LineChart className="w-6 h-6" />,
      title: "Track Progress",
      description: "Monitor your financial growth with intuitive charts and analytics"
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: "Secure Transactions",
      description: "Every transaction is encrypted and protected"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Bank-Grade Security",
      description: "Your data is protected with military-grade encryption"
    }
  ];

  return (
    <div className="py-20 px-4">
      <h2 className="text-4xl font-bold text-center mb-4">
        Meet our most popular features to establish smooth transaction
      </h2>
      <p className="text-xl text-secondary-foreground text-center mb-12">
        Monie is a secrate and trusted platform to save your money
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {features.map((feature, index) => (
          <Card key={index} className="p-6 hover-lift">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
              {feature.icon}
            </div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-secondary-foreground">{feature.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Features;