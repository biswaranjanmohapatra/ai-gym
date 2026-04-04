import { motion } from 'framer-motion';
import { Target, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface Props {
  profile: { goal: string | null; weightKg: number | null } | null;
  workoutLogs: { caloriesBurned: number | null }[];
}

const goalTargets: Record<string, { label: string; calorieTarget: number; workoutTarget: number }> = {
  weight_loss: { label: 'Weight Loss', calorieTarget: 15000, workoutTarget: 20 },
  muscle_gain: { label: 'Muscle Gain', calorieTarget: 12000, workoutTarget: 24 },
  endurance: { label: 'Endurance', calorieTarget: 18000, workoutTarget: 20 },
  flexibility: { label: 'Flexibility', calorieTarget: 8000, workoutTarget: 16 },
  general_fitness: { label: 'General Fitness', calorieTarget: 10000, workoutTarget: 16 },
};

export default function FitnessGoals({ profile, workoutLogs }: Props) {
  const goalKey = profile?.goal || 'general_fitness';
  const target = goalTargets[goalKey] || goalTargets.general_fitness;
  const totalCalories = workoutLogs.reduce((sum, l) => sum + (l.caloriesBurned || 0), 0);
  const totalWorkouts = workoutLogs.length;

  const calProgress = Math.min(100, Math.round((totalCalories / target.calorieTarget) * 100));
  const workoutProgress = Math.min(100, Math.round((totalWorkouts / target.workoutTarget) * 100));

  return (
    <div className="glass-card p-6 h-full">
      <h3 className="font-display text-xl text-foreground mb-4 flex items-center gap-2">
        <Target className="h-5 w-5 text-primary" /> Fitness Goals
      </h3>

      <div className="mb-2">
        <span className="text-xs text-muted-foreground">Current Goal:</span>
        <span className="ml-2 text-sm text-primary font-medium capitalize">{target.label}</span>
      </div>

      <div className="space-y-5 mt-4">
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">Calorie Goal</span>
            <span className="text-foreground">{totalCalories.toLocaleString()} / {target.calorieTarget.toLocaleString()}</span>
          </div>
          <Progress value={calProgress} className="h-2" />
          <p className="text-[10px] text-primary mt-1">{calProgress}% complete</p>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">Workout Goal</span>
            <span className="text-foreground">{totalWorkouts} / {target.workoutTarget}</span>
          </div>
          <Progress value={workoutProgress} className="h-2" />
          <p className="text-[10px] text-primary mt-1">{workoutProgress}% complete</p>
        </div>

        {calProgress >= 100 || workoutProgress >= 100 ? (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center p-3 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-primary text-sm font-medium">🎉 Goal Achieved!</p>
          </motion.div>
        ) : (
          <p className="text-center text-xs text-muted-foreground">
            <TrendingUp className="inline h-3 w-3 mr-1" />
            Keep pushing — you're making progress!
          </p>
        )}
      </div>
    </div>
  );
}
