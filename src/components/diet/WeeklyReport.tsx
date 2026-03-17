import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface MealLog {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  logged_at: string;
}

interface WeeklyReportProps {
  logs: MealLog[];
}

export default function WeeklyReport({ logs }: WeeklyReportProps) {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const chartData = last7Days.map(day => {
    const dayLogs = logs.filter(l => new Date(l.logged_at).toDateString() === day.toDateString());
    return {
      date: day.toLocaleDateString('en', { weekday: 'short' }),
      calories: dayLogs.reduce((s, l) => s + (l.calories || 0), 0),
      protein: dayLogs.reduce((s, l) => s + (Number(l.protein_g) || 0), 0),
    };
  });

  const avgCalories = Math.round(chartData.reduce((s, d) => s + d.calories, 0) / 7);

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="font-display text-xl text-foreground">Weekly Nutrition</h3>
        <span className="ml-auto text-sm text-muted-foreground">Avg: {avgCalories} kcal/day</span>
      </div>

      {chartData.some(d => d.calories > 0) ? (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 18%)" />
            <XAxis dataKey="date" stroke="hsl(220 10% 55%)" fontSize={12} />
            <YAxis stroke="hsl(220 10% 55%)" fontSize={12} />
            <Tooltip
              contentStyle={{
                background: 'hsl(220 18% 10%)',
                border: '1px solid hsl(220 15% 18%)',
                borderRadius: '8px',
                color: 'hsl(0 0% 95%)',
              }}
            />
            <Bar dataKey="calories" fill="hsl(142 72% 50%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-muted-foreground text-center py-12 text-sm">Log meals to see your weekly report!</p>
      )}
    </div>
  );
}
