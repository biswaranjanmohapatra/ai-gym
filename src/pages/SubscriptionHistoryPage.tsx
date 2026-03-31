import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Subscription {
  id: string;
  user_id: string;
  plan: string;
  price: number;
  status: string;
  created_at: string;
}

export default function SubscriptionHistoryPage() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  useEffect(() => {
    const loadSubscriptions = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("subscriptions" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setSubscriptions((data as Subscription[]) || []);
    };
    loadSubscriptions();
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <h1 className="font-display text-3xl md:text-4xl text-foreground mb-6">
          Subscription History
        </h1>
        {subscriptions.length === 0 ? (
          <p className="text-muted-foreground">No subscriptions found.</p>
        ) : (
          <div className="space-y-3">
            {subscriptions.map((sub) => (
              <div key={sub.id} className="glass-card p-4 flex items-center justify-between">
                <div>
                  <p className="text-foreground font-medium">{sub.plan}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(sub.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-primary font-semibold">₹{sub.price}</p>
                  <p className="text-[10px] text-muted-foreground">{sub.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

