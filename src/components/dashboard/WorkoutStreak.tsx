import { motion } from 'framer-motion';
import { Flame, Zap } from 'lucide-react';

interface WorkoutLog {
  completedAt: string;
}

function calculateStreak(logs: WorkoutLog[]): number {
  if (logs.length === 0) return 0;
  const dates = [...new Set(logs.map(l => new Date(l.completedAt).toDateString()))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < dates.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    if (new Date(dates[i]).toDateString() === expected.toDateString()) {
      streak++;
    } else if (i === 0 && new Date(dates[i]).toDateString() === new Date(today.getTime() - 86400000).toDateString()) {
      // Yesterday counts if today hasn't been logged yet
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function getLast7Days(logs: WorkoutLog[]): boolean[] {
  const result: boolean[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateSet = new Set(logs.map(l => new Date(l.completedAt).toDateString()));
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    result.push(dateSet.has(d.toDateString()));
  }
  return result;
}

const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function WorkoutStreak({ workoutLogs }: { workoutLogs: WorkoutLog[] }) {
  const streak = calculateStreak(workoutLogs);
  const last7 = getLast7Days(workoutLogs);
  const today = new Date().getDay();

  return (
    <div className="glass-card p-6 h-full">
      <h3 className="font-display text-xl text-foreground mb-4 flex items-center gap-2">
        <Flame className="h-5 w-5 text-accent" /> Workout Streak
      </h3>
      <div className="text-center mb-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${
            streak >= 7 ? 'bg-accent/20 ring-2 ring-accent/50 shadow-[0_0_20px_hsl(var(--accent)/0.3)]' :
            streak >= 3 ? 'bg-primary/20 ring-2 ring-primary/50' : 'bg-secondary ring-2 ring-border/30'
          }`}
        >
          <div className="text-center">
            <p className="font-display text-3xl text-foreground">{streak}</p>
            <p className="text-[10px] text-muted-foreground">days</p>
          </div>
        </motion.div>
      </div>

      {/* Last 7 days */}
      <div className="flex justify-center gap-2">
        {last7.map((active, i) => {
          const dayIdx = (today - 6 + i + 7) % 7;
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                  active
                    ? 'bg-primary/20 text-primary ring-1 ring-primary/40'
                    : 'bg-secondary/50 text-muted-foreground'
                }`}
              >
                {active ? <Zap className="h-3.5 w-3.5" /> : dayNames[dayIdx]}
              </motion.div>
              <span className="text-[9px] text-muted-foreground">{dayNames[dayIdx]}</span>
            </div>
          );
        })}
      </div>

      {streak >= 3 && (
        <p className="text-center text-xs text-primary mt-3">🔥 You're on fire! Keep it going!</p>
      )}
    </div>
  );
}
