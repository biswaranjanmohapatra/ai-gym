import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Gift, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function RewardPointsCard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    if (user) {
      supabase.from('reward_points').select('points').eq('user_id', user.id)
        .then(({ data }) => {
          if (data) setTotalPoints(data.reduce((sum, p) => sum + p.points, 0));
        });
    }
  }, [user]);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="premium-card p-5 cursor-pointer"
      onClick={() => navigate('/rewards')}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-lg text-foreground flex items-center gap-2">
          <Gift className="h-5 w-5" style={{ color: 'hsl(45 100% 55%)' }} /> Reward Points
        </h3>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full flex items-center justify-center animate-pulse-gold"
          style={{ background: 'linear-gradient(135deg, hsl(45 100% 50% / 0.2), hsl(38 90% 40% / 0.15))', border: '2px solid hsl(45 100% 50% / 0.4)' }}>
          <Star className="h-6 w-6" style={{ color: 'hsl(45 100% 55%)' }} />
        </div>
        <div>
          <p className="font-display text-3xl gradient-gold-text">{totalPoints}</p>
          <p className="text-xs text-muted-foreground">Total Points</p>
        </div>
      </div>
    </motion.div>
  );
}
