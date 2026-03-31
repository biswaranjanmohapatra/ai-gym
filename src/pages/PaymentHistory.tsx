import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CreditCard, IndianRupee } from "lucide-react";

interface Payment {
  id: string;
  user_id: string;
  trainer_id: string | null;
  amount: number;
  date: string;
  status: string;
  type?: string;
}

export default function PaymentHistory() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    async function loadPayments() {
      if (!user) return;
      const { data } = await supabase
        .from("payments" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      setPayments((data as Payment[]) || []);
    }

    loadPayments();
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <h1 className="font-display text-3xl md:text-4xl text-foreground mb-6 flex items-center gap-2">
          <CreditCard className="h-7 w-7 text-primary" />
          Payment History
        </h1>

        {payments.length === 0 ? (
          <p className="text-muted-foreground">No payments found yet.</p>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="glass-card p-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm text-muted-foreground">
                    Payment Type: {payment.type || "trainer"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Date: {new Date(payment.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-primary font-semibold flex items-center justify-end gap-1">
                    <IndianRupee className="h-4 w-4" />
                    {payment.amount}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {payment.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

