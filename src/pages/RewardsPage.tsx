import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Gift, Star, Zap, Crown, Dumbbell, Trophy, Ticket, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const rewardItems = [
  { id: 1, name: '10% Off Premium', description: 'Discount on premium subscription', cost: 500, icon: Crown, category: 'premium' },
  { id: 2, name: '₹100 Off Trainer', description: 'Discount on trainer booking', cost: 300, icon: Ticket, category: 'trainer' },
  { id: 3, name: 'Pro Workout Plan', description: 'Unlock advanced 12-week program', cost: 800, icon: Dumbbell, category: 'workout' },
  { id: 4, name: 'Elite Challenge', description: 'Access exclusive 30-day challenge', cost: 600, icon: Trophy, category: 'challenge' },
  { id: 5, name: '20% Off Premium', description: 'Big discount on yearly premium', cost: 1000, icon: Crown, category: 'premium' },
  { id: 6, name: 'Custom Meal Plan', description: 'AI-generated personalized meal plan', cost: 400, icon: ShoppingBag, category: 'diet' },
];

export default function RewardsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [totalPoints, setTotalPoints] = useState(0);
  const [pointsHistory, setPointsHistory] = useState<any[]>([]);

  useEffect(() => {
    if (user) fetchPoints();
  }, [user]);

  const fetchPoints = async () => {
    const { data } = await supabase.from('reward_points').select('*').eq('user_id', user!.id).order('earned_at', { ascending: false });
    if (data) {
      setPointsHistory(data);
      setTotalPoints(data.reduce((sum, p) => sum + p.points, 0));
    }
  };

  const redeemReward = async (reward: typeof rewardItems[0]) => {
    if (totalPoints < reward.cost) { toast.error('Not enough points!'); return; }
    const { error } = await supabase.from('reward_points').insert({
      user_id: user!.id,
      points: -reward.cost,
      reason: `Redeemed: ${reward.name}`,
    });
    if (error) toast.error('Failed to redeem');
    else { toast.success(`🎉 ${reward.name} redeemed!`); fetchPoints(); }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-12 text-center">
          <h1 className="font-display text-5xl text-foreground mb-4">Rewards Store</h1>
          <p className="text-muted-foreground mb-8">Sign in to earn and redeem fitness points.</p>
          <Button onClick={() => navigate('/auth')} className="bg-primary text-primary-foreground">Sign In</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="container mx-auto px-4 pt-24 pb-12">
        <motion.div variants={itemVariants} className="text-center mb-8">
          <p className="text-primary tracking-widest uppercase text-sm mb-2">Fitness Rewards</p>
          <h1 className="font-display text-5xl md:text-6xl text-foreground mb-4">Rewards Store</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">Earn points by completing workouts. Redeem them for amazing rewards!</p>
        </motion.div>

        {/* Points Balance */}
        <motion.div variants={itemVariants} className="max-w-md mx-auto mb-10">
          <div className="premium-card p-6 text-center gold-glow">
            <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center animate-pulse-gold"
              style={{ background: 'linear-gradient(135deg, hsl(45 100% 50% / 0.2), hsl(38 90% 40% / 0.15))', border: '2px solid hsl(45 100% 50% / 0.4)' }}>
              <Star className="h-8 w-8" style={{ color: 'hsl(45 100% 55%)' }} />
            </div>
            <p className="text-sm text-muted-foreground mb-1">Your Balance</p>
            <p className="font-display text-5xl gradient-gold-text">{totalPoints}</p>
            <p className="text-xs text-muted-foreground mt-1">fitness points</p>
          </div>
        </motion.div>

        {/* Rewards Grid */}
        <motion.div variants={itemVariants} className="mb-10">
          <h2 className="font-display text-2xl text-foreground mb-6 text-center">Redeem Rewards</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {rewardItems.map((reward, i) => (
              <motion.div key={reward.id} variants={itemVariants} whileHover={{ scale: 1.03, y: -4 }} className="glass-card p-5 flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <reward.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg text-foreground">{reward.name}</h3>
                    <p className="text-xs text-muted-foreground">{reward.description}</p>
                  </div>
                </div>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <span className="flex items-center gap-1 text-sm font-medium" style={{ color: 'hsl(45 100% 55%)' }}>
                    <Star className="h-3.5 w-3.5" /> {reward.cost} pts
                  </span>
                  <Button size="sm" onClick={() => redeemReward(reward)} disabled={totalPoints < reward.cost}
                    className={totalPoints >= reward.cost ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}>
                    Redeem
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Points History */}
        <motion.div variants={itemVariants} className="glass-card p-6 max-w-4xl mx-auto">
          <h3 className="font-display text-xl text-foreground mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" /> Points History
          </h3>
          {pointsHistory.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {pointsHistory.map(p => (
                <div key={p.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/30">
                  <div>
                    <p className="text-sm text-foreground">{p.reason}</p>
                    <p className="text-xs text-muted-foreground">{new Date(p.earned_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`font-medium text-sm ${p.points > 0 ? 'text-primary' : 'text-destructive'}`}>
                    {p.points > 0 ? '+' : ''}{p.points}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-6">Complete workouts to earn your first points!</p>
          )}
        </motion.div>
      </motion.div>
      <Footer />
    </div>
  );
}
