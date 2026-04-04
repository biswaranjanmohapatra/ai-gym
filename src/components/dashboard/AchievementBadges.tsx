import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

interface Props {
  workoutLogs: { completedAt: string }[];
  totalCalories: number;
}

const badges = [
  { id: 'first', icon: '🎯', label: 'First Workout', check: (w: number) => w >= 1 },
  { id: 'five', icon: '💪', label: '5 Workouts', check: (w: number) => w >= 5 },
  { id: 'ten', icon: '🔥', label: '10 Workouts', check: (w: number) => w >= 10 },
  { id: 'twenty', icon: '⚡', label: '20 Workouts', check: (w: number) => w >= 20 },
  { id: 'fifty', icon: '🏆', label: '50 Workouts', check: (w: number) => w >= 50 },
  { id: 'cal1k', icon: '🥇', label: '1K Calories', check: (_: number, c: number) => c >= 1000 },
  { id: 'cal5k', icon: '🏅', label: '5K Calories', check: (_: number, c: number) => c >= 5000 },
  { id: 'cal10k', icon: '👑', label: '10K Calories', check: (_: number, c: number) => c >= 10000 },
];

export default function AchievementBadges({ workoutLogs, totalCalories }: Props) {
  const count = workoutLogs.length;
  const earned = badges.filter(b => b.check(count, totalCalories));
  const locked = badges.filter(b => !b.check(count, totalCalories));

  return (
    <div className="glass-card p-6 h-full">
      <h3 className="font-display text-xl text-foreground mb-4 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-yellow-500" /> Achievements
      </h3>

      <div className="grid grid-cols-4 gap-2">
        {earned.map((b, i) => (
          <motion.div
            key={b.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="flex flex-col items-center gap-1 p-2 rounded-lg bg-primary/10 border border-primary/20"
          >
            <span className="text-2xl">{b.icon}</span>
            <span className="text-[9px] text-primary text-center leading-tight">{b.label}</span>
          </motion.div>
        ))}
        {locked.map(b => (
          <div key={b.id} className="flex flex-col items-center gap-1 p-2 rounded-lg bg-secondary/30 border border-border/20 opacity-40">
            <span className="text-2xl grayscale">{b.icon}</span>
            <span className="text-[9px] text-muted-foreground text-center leading-tight">{b.label}</span>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground mt-3">
        {earned.length}/{badges.length} unlocked
      </p>
    </div>
  );
}
