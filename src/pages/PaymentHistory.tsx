import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { CreditCard, IndianRupee, Loader2, TrendingUp, User, Award } from 'lucide-react';

interface Payment {
  id: string;
  user_id: string;
  trainer_id: string | null;
  amount: number;
  date: string;
  status: string;
  type: string;
}

export default function PaymentHistory() {
  const { user, role } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadPayments();
  }, [user, role]);

  const loadPayments = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('payments' as any)
        .select('*')
        .order('date', { ascending: false });

      if (role === 'user') {
        query = query.eq('user_id', user!.id);
      } else if (role === 'trainer') {
        const { data: trainer } = await supabase
          .from('trainer_profiles')
          .select('id')
          .eq('user_id', user!.id)
          .maybeSingle();
        if (trainer?.id) {
          query = query.eq('trainer_id', trainer.id);
        } else {
          setPayments([]);
          setLoading(false);
          return;
        }
      }

      const { data, error } = await query;
      if (!error && data) setPayments(data as Payment[]);
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const totalPaid = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amount || 0), 0);
  const trainerPayments = payments.filter(p => p.type === 'trainer');
  const subPayments = payments.filter(p => p.type === 'subscription');

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Payment History</h1>
              <p className="text-muted-foreground text-sm">
                {role === 'trainer' ? 'Your earnings from sessions' : 'All your payment transactions'}
              </p>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : payments.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-secondary/30 border border-border/30 flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No payments yet</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              {role === 'trainer'
                ? 'No earnings yet. Accept bookings to start earning.'
                : 'No payment transactions found. Book a session or subscribe to see payments here.'}
            </p>
          </motion.div>
        ) : (
          <div className="max-w-3xl space-y-6">
            {/* Summary Cards */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5 text-center">
                <TrendingUp className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-xs text-muted-foreground mb-1">Total {role === 'trainer' ? 'Earned' : 'Paid'}</p>
                <p className="text-2xl font-bold text-primary flex items-center justify-center gap-1">
                  <IndianRupee className="h-5 w-5" />
                  {totalPaid.toLocaleString()}
                </p>
              </div>
              <div className="bg-secondary/20 border border-border/30 rounded-2xl p-5 text-center">
                <Award className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground mb-1">Trainer Sessions</p>
                <p className="text-2xl font-bold text-foreground">{trainerPayments.length}</p>
              </div>
              <div className="bg-secondary/20 border border-border/30 rounded-2xl p-5 text-center">
                <User className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground mb-1">Subscriptions</p>
                <p className="text-2xl font-bold text-foreground">{subPayments.length}</p>
              </div>
            </motion.div>

            {/* Payment List */}
            <div className="space-y-3">
              {payments.map((payment, i) => (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-secondary/20 border border-border/30 rounded-xl p-4 flex items-center justify-between hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      payment.type === 'subscription' ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-yellow-400/10 border border-yellow-400/20'
                    }`}>
                      {payment.type === 'subscription' ? (
                        <User className="h-5 w-5 text-purple-400" />
                      ) : (
                        <Award className="h-5 w-5 text-yellow-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground capitalize">
                        {payment.type === 'subscription' ? 'Subscription' : 'Trainer Session'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(payment.date).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary flex items-center justify-end gap-1">
                      <IndianRupee className="h-4 w-4" />
                      {payment.amount?.toLocaleString()}
                    </p>
                    <span className={`text-xs font-medium ${
                      payment.status === 'paid' ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {payment.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
