import { motion } from 'framer-motion';
import { Flame, Zap, Apple, Droplets } from 'lucide-react';

interface MealLog {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  logged_at: string;
}

interface NutritionSummaryProps {
  logs: MealLog[];
  dailyTarget?: { calories: number; protein: number; carbs: number; fat: number };
}

export default function NutritionSummary({ logs, dailyTarget }: NutritionSummaryProps) {
  const todayLogs = logs.filter(l => new Date(l.logged_at).toDateString() === new Date().toDateString());
  const totals = todayLogs.reduce(
    (acc, l) => ({
      calories: acc.calories + (l.calories || 0),
      protein: acc.protein + (Number(l.protein_g) || 0),
      carbs: acc.carbs + (Number(l.carbs_g) || 0),
      fat: acc.fat + (Number(l.fat_g) || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const target = dailyTarget || { calories: 2000, protein: 150, carbs: 250, fat: 65 };

  const macros = [
    { icon: Flame, label: 'Calories', value: totals.calories, target: target.calories, unit: 'kcal', color: 'text-primary' },
    { icon: Zap, label: 'Protein', value: Math.round(totals.protein), target: target.protein, unit: 'g', color: 'text-accent' },
    { icon: Apple, label: 'Carbs', value: Math.round(totals.carbs), target: target.carbs, unit: 'g', color: 'text-yellow-400' },
    { icon: Droplets, label: 'Fat', value: Math.round(totals.fat), target: target.fat, unit: 'g', color: 'text-orange-400' },
  ];

  return (
    <div className="glass-card p-6">
      <h3 className="font-display text-xl text-foreground mb-4 text-center">Daily Nutrition</h3>
      <div className="grid grid-cols-2 gap-4">
        {macros.map((m, i) => {
          const pct = Math.min((m.value / m.target) * 100, 100);
          return (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} className="text-center">
              <m.icon className={`h-5 w-5 mx-auto mb-1 ${m.color}`} />
              <p className={`font-display text-2xl ${m.color}`}>
                {m.value}<span className="text-xs text-muted-foreground">/{m.target}{m.unit}</span>
              </p>
              <div className="w-full h-1.5 rounded-full bg-secondary mt-1 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${m.color === 'text-primary' ? 'bg-primary' : m.color === 'text-accent' ? 'bg-accent' : m.color === 'text-yellow-400' ? 'bg-yellow-400' : 'bg-orange-400'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
