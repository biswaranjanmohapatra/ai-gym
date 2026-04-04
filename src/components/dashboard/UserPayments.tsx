import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { CreditCard, IndianRupee } from 'lucide-react';

interface Payment {
  id: string;
  userId: string; // Prisma camelCase
  trainerId: string;
  amount: number;
  date: string;
  status: string;
}

export default function UserPayments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    if (!user) return;
    fetchApi('/payments')
      .then(data => {
        if (data) setPayments(data);
      })
      .catch(err => console.error('Failed to fetch payments', err));
  }, [user]);

  if (!user || payments.length === 0) return null;

  return (
    <div className="glass-card p-6">
      <h3 className="font-display text-xl text-foreground mb-4 flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-primary" /> Payment History
      </h3>
      <div className="space-y-3">
        {payments.map(p => (
          <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
            <div>
              <p className="text-sm text-foreground">
                Session payment
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(p.date).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-primary font-medium flex items-center justify-end gap-1">
                <IndianRupee className="h-3 w-3" /> {p.amount}
              </p>
              <p className="text-[10px] text-muted-foreground">{p.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

