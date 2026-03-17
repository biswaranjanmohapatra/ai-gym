import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Droplets, Plus, Minus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface WaterLog {
  id: string;
  amount_ml: number;
  logged_at: string;
}

interface WaterTrackerProps {
  logs: WaterLog[];
  onRefresh: () => void;
}

const DAILY_GOAL_ML = 3000;

export default function WaterTracker({ logs, onRefresh }: WaterTrackerProps) {
  const { user } = useAuth();
  const todayLogs = logs.filter(l => new Date(l.logged_at).toDateString() === new Date().toDateString());
  const totalMl = todayLogs.reduce((s, l) => s + l.amount_ml, 0);
  const progress = Math.min((totalMl / DAILY_GOAL_ML) * 100, 100);
  const glasses = Math.floor(totalMl / 250);

  const addWater = async (amount: number) => {
    if (!user) return;
    const { error } = await supabase.from('water_logs').insert({ user_id: user.id, amount_ml: amount });
    if (error) toast.error('Failed to log water');
    else { toast.success(`+${amount}ml 💧`); onRefresh(); }
  };

  const removeLastGlass = async () => {
    if (todayLogs.length === 0) return;
    const last = todayLogs[todayLogs.length - 1];
    const { error } = await supabase.from('water_logs').delete().eq('id', last.id);
    if (error) toast.error('Failed to remove');
    else { onRefresh(); }
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Droplets className="h-5 w-5 text-accent" />
        <h3 className="font-display text-xl text-foreground">Water Intake</h3>
      </div>

      <div className="text-center mb-4">
        <p className="font-display text-4xl text-accent">{totalMl}<span className="text-lg text-muted-foreground">ml</span></p>
        <p className="text-sm text-muted-foreground">of {DAILY_GOAL_ML}ml goal • {glasses} glasses</p>
      </div>

      {/* Progress bar */}
      <div className="w-full h-3 rounded-full bg-secondary mb-4 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-accent"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="flex gap-2 justify-center">
        <Button size="sm" variant="outline" onClick={removeLastGlass} className="border-border/50 text-muted-foreground">
          <Minus className="h-4 w-4" />
        </Button>
        {[150, 250, 500].map(ml => (
          <Button key={ml} size="sm" onClick={() => addWater(ml)} className="bg-accent/20 text-accent hover:bg-accent/30 border border-accent/30">
            <Plus className="h-3 w-3 mr-1" />{ml}ml
          </Button>
        ))}
      </div>
    </div>
  );
}
