import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface MealLog {
  id: string;
  mealType: string;
  mealName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string;
}

interface MealLoggerProps {
  logs: MealLog[];
  onRefresh: () => void;
}

const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

export default function MealLogger({ logs, onRefresh }: MealLoggerProps) {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    mealType: 'breakfast',
    mealName: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.mealName) return;

    try {
      await fetchApi('/diet/meals', {
        method: 'POST',
        body: JSON.stringify({
          mealType: form.mealType,
          mealName: form.mealName,
          calories: form.calories,
          protein: form.protein,
          carbs: form.carbs,
          fat: form.fat
        }),
      });
      toast.success('Meal logged! 🍽️');
      setForm({ mealType: 'breakfast', mealName: '', calories: '', protein: '', carbs: '', fat: '' });
      setShowForm(false);
      onRefresh();
    } catch {
      toast.error('Failed to log meal');
    }
  };

  const deleteMeal = async (id: string) => {
    try {
      await fetchApi(`/diet/meals/${id}`, { method: 'DELETE' });
      toast.success('Meal removed');
      onRefresh();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const todayLogs = logs.filter(l => new Date(l.date).toDateString() === new Date().toDateString());

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-xl text-foreground">Today's Meals</h3>
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="bg-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-1" /> Log Meal
        </Button>
      </div>

      {showForm && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          onSubmit={handleSubmit}
          className="space-y-3 mb-4 p-4 rounded-lg bg-secondary/50"
        >
          <select
            value={form.mealType}
            onChange={e => setForm({ ...form, mealType: e.target.value })}
            className="w-full rounded-lg bg-secondary border border-border/50 px-3 py-2 text-sm text-foreground"
          >
            {mealTypes.map(t => (
              <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
          <Input placeholder="Meal name" value={form.mealName} onChange={e => setForm({ ...form, mealName: e.target.value })} className="bg-secondary border-border/50" />
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Calories" type="number" value={form.calories} onChange={e => setForm({ ...form, calories: e.target.value })} className="bg-secondary border-border/50" />
            <Input placeholder="Protein (g)" type="number" value={form.protein} onChange={e => setForm({ ...form, protein: e.target.value })} className="bg-secondary border-border/50" />
            <Input placeholder="Carbs (g)" type="number" value={form.carbs} onChange={e => setForm({ ...form, carbs: e.target.value })} className="bg-secondary border-border/50" />
            <Input placeholder="Fat (g)" type="number" value={form.fat} onChange={e => setForm({ ...form, fat: e.target.value })} className="bg-secondary border-border/50" />
          </div>
          <Button type="submit" className="w-full bg-primary text-primary-foreground">Save Meal</Button>
        </motion.form>
      )}

      {todayLogs.length > 0 ? (
        <div className="space-y-2">
          {todayLogs.map(log => (
            <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div>
                <p className="text-foreground font-medium text-sm">{log.mealName}</p>
                <p className="text-xs text-muted-foreground capitalize">{log.mealType} • {log.calories} cal • P:{log.protein}g C:{log.carbs}g F:{log.fat}g</p>
              </div>
              <button onClick={() => deleteMeal(log.id)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-6 text-sm">No meals logged today. Start tracking!</p>
      )}
    </div>
  );
}
