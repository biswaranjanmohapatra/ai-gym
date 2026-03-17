import Navbar from "@/components/Navbar";

const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect to explore Elite Fitness and track basic workouts.",
  },
  {
    name: "Pro",
    price: "₹499 / month",
    description: "Unlock advanced workouts, detailed analytics, and trainer booking perks.",
  },
  {
    name: "Elite",
    price: "₹1299 / month",
    description: "Everything in Pro plus priority trainer access and exclusive programs.",
  },
];

export default function SubscriptionsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <h1 className="font-display text-4xl md:text-5xl text-foreground mb-8">
          Subscription Plans
        </h1>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.name} className="glass-card p-6 flex flex-col">
              <h2 className="font-display text-2xl text-foreground mb-2">
                {plan.name}
              </h2>
              <p className="text-primary text-xl font-semibold mb-3">
                {plan.price}
              </p>
              <p className="text-sm text-muted-foreground flex-1">
                {plan.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

