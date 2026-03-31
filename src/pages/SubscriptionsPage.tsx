import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const plans = [
  {
    name: "Starter",
    priceLabel: "Free",
    priceValue: 0,
    description: "Perfect to explore Elite Fitness and track basic workouts.",
  },
  {
    name: "Pro",
    priceLabel: "₹499 / month",
    priceValue: 499,
    description: "Unlock advanced workouts, detailed analytics, and trainer booking perks.",
  },
  {
    name: "Elite",
    priceLabel: "₹1299 / month",
    priceValue: 1299,
    description: "Everything in Pro plus priority trainer access and exclusive programs.",
  },
];

export default function SubscriptionsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubscribe = async (plan: string, price: number) => {
    if (!user) {
      toast.error("Please login first");
      navigate("/user-login");
      return;
    }

    const { error: subscriptionError } = await supabase.from("subscriptions").insert({
      user_id: user.id,
      plan,
      price,
      status: "active",
    } as any);

    if (subscriptionError) {
      toast.error("Failed to activate subscription.");
      return;
    }

    const { error: paymentError } = await supabase.from("payments" as any).insert({
      user_id: user.id,
      trainer_id: null,
      amount: price,
      date: new Date().toISOString(),
      status: "paid",
      type: "subscription",
    });

    if (paymentError) {
      toast.error("Subscription saved but payment entry failed.");
      navigate("/subscription-history");
      return;
    }

    toast.success("Subscription successful.");
    navigate("/subscription-history");
  };

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
                {plan.priceLabel}
              </p>
              <p className="text-sm text-muted-foreground flex-1">
                {plan.description}
              </p>
              <Button className="mt-4" onClick={() => handleSubscribe(plan.name, plan.priceValue)}>
                Subscribe
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

