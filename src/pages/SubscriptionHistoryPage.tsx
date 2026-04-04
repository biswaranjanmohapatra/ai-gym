import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { fetchApi } from '@/lib/api';
import { Crown, Star, Zap, Loader2, Calendar, IndianRupee } from 'lucide-react';

interface Subscription {
  id: string;
  userId: string;
  plan: string;
  price: number;
  status: string;
  createdAt: string;
}

const planIcons: Record<string, any> = {
  Starter: Star,
  Pro: Zap,
  Elite: Crown,
};
const planColors: Record<string, string> = {
  Starter: 'text-muted-foreground',
  Pro: 'text-primary',
  Elite: 'text-yellow-400',
};

export default function SubscriptionHistoryPage() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadSubscriptions();
  }, [user]);

  const loadSubscriptions = async () => {
    setLoading(true);
    try {
      const data = await fetchApi('/subscriptions');
      setSubscriptions(data || []);
    } catch (err) {
      console.error('Fetch subscriptions error', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Crown className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Subscription History</h1>
              <p className="text-muted-foreground text-sm">Your active and past subscription plans</p>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : subscriptions.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-secondary/30 border border-border/30 flex items-center justify-center mx-auto mb-4">
              <Crown className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No subscriptions yet</h3>
            <p className="text-muted-foreground text-sm">
              Visit the <a href="/subscriptions" className="text-primary underline">Subscriptions page</a> to pick a plan.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4 max-w-2xl">
            {subscriptions.map((sub, i) => {
              const PlanIcon = planIcons[sub.plan] || Crown;
              const color = planColors[sub.plan] || 'text-primary';
              return (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-secondary/20 border border-border/30 rounded-2xl p-5 flex items-center justify-between hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center bg-current/5 ${color}`}
                      style={{ borderColor: 'currentColor' }}>
                      <PlanIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className={`font-bold text-lg ${color}`}>{sub.plan} Plan</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <Calendar className="h-3 w-3" />
                        {new Date(sub.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-xl flex items-center gap-1 justify-end ${color}`}>
                      <IndianRupee className="h-4 w-4" />
                      {sub.price.toLocaleString()}
                    </p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      sub.status === 'active' ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'
                    }`}>
                      {sub.status}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
