import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface MealLog {
  id: string;
  meal_type: string;
  meal_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  logged_at: string;
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
    meal_type: 'breakfast',
    meal_name: '',
    calories: '',
    protein_g: '',
    carbs_g: '',
    fat_g: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.meal_name) return;

    const { error } = await supabase.from('meal_logs').insert({
      user_id: user.id,
      meal_type: form.meal_type,
      meal_name: form.meal_name,
      calories: parseInt(form.calories) || 0,
      protein_g: parseFloat(form.protein_g) || 0,
      carbs_g: parseFloat(form.carbs_g) || 0,
      fat_g: parseFloat(form.fat_g) || 0,
    });

    if (error) toast.error('Failed to log meal');
    else {
      toast.success('Meal logged! 🍽️');
      setForm({ meal_type: 'breakfast', meal_name: '', calories: '', protein_g: '', carbs_g: '', fat_g: '' });
      setShowForm(false);
      onRefresh();
    }
  };

  const deleteMeal = async (id: string) => {
    const { error } = await supabase.from('meal_logs').delete().eq('id', id);
    if (error) toast.error('Failed to delete');
    else { toast.success('Meal removed'); onRefresh(); }
  };

  const todayLogs = logs.filter(l => new Date(l.logged_at).toDateString() === new Date().toDateString());

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
            value={form.meal_type}
            onChange={e => setForm({ ...form, meal_type: e.target.value })}
            className="w-full rounded-lg bg-secondary border border-border/50 px-3 py-2 text-sm text-foreground"
          >
            {mealTypes.map(t => (
              <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
          <Input placeholder="Meal name" value={form.meal_name} onChange={e => setForm({ ...form, meal_name: e.target.value })} className="bg-secondary border-border/50" />
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Calories" type="number" value={form.calories} onChange={e => setForm({ ...form, calories: e.target.value })} className="bg-secondary border-border/50" />
            <Input placeholder="Protein (g)" type="number" value={form.protein_g} onChange={e => setForm({ ...form, protein_g: e.target.value })} className="bg-secondary border-border/50" />
            <Input placeholder="Carbs (g)" type="number" value={form.carbs_g} onChange={e => setForm({ ...form, carbs_g: e.target.value })} className="bg-secondary border-border/50" />
            <Input placeholder="Fat (g)" type="number" value={form.fat_g} onChange={e => setForm({ ...form, fat_g: e.target.value })} className="bg-secondary border-border/50" />
          </div>
          <Button type="submit" className="w-full bg-primary text-primary-foreground">Save Meal</Button>
        </motion.form>
      )}

      {todayLogs.length > 0 ? (
        <div className="space-y-2">
          {todayLogs.map(log => (
            <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div>
                <p className="text-foreground font-medium text-sm">{log.meal_name}</p>
                <p className="text-xs text-muted-foreground capitalize">{log.meal_type} • {log.calories} cal • P:{log.protein_g}g C:{log.carbs_g}g F:{log.fat_g}g</p>
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
