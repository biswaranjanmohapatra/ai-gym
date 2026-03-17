import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, Beef, Leaf } from 'lucide-react';
import { toast } from 'sonner';

interface Profile {
  age: number | null;
  gender: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  goal: string | null;
  bmi: number | null;
  activity_level?: string | null;
}

interface Meal {
  meal_type: string;
  name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  items: string[];
}

interface MealPlanData {
  daily_calories: number;
  daily_protein_g: number;
  daily_carbs_g: number;
  daily_fat_g: number;
  meals: Meal[];
  tips: string[];
}

interface AIMealPlanProps {
  profile: Profile | null;
  onTargetUpdate?: (target: { calories: number; protein: number; carbs: number; fat: number }) => void;
}

export default function AIMealPlan({ profile, onTargetUpdate }: AIMealPlanProps) {
  const [plan, setPlan] = useState<MealPlanData | null>(null);
  const [loading, setLoading] = useState(false);
  const [dietType, setDietType] = useState<'vegetarian' | 'non-vegetarian'>('non-vegetarian');

  const generatePlan = async () => {
    if (!profile) { toast.error('Please complete your profile first'); return; }
    setLoading(true);

    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-diet-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ profile, dietType }),
      });

      if (resp.status === 429) { toast.error('Rate limited. Try again in a moment.'); return; }
      if (resp.status === 402) { toast.error('AI usage limit reached.'); return; }
      if (!resp.ok) throw new Error('Failed to generate plan');

      const data = await resp.json();
      if (data.error) throw new Error(data.error);
      setPlan(data);
      onTargetUpdate?.({
        calories: data.daily_calories,
        protein: data.daily_protein_g,
        carbs: data.daily_carbs_g,
        fat: data.daily_fat_g,
      });
      toast.success('AI meal plan generated! 🍽️');
    } catch (err) {
      toast.error('Failed to generate meal plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-xl text-foreground flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" /> AI Meal Plan
        </h3>
      </div>

      <div className="flex gap-2 mb-4">
        <Button
          size="sm"
          onClick={() => setDietType('non-vegetarian')}
          className={dietType === 'non-vegetarian' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}
        >
          <Beef className="h-4 w-4 mr-1" /> Non-Veg
        </Button>
        <Button
          size="sm"
          onClick={() => setDietType('vegetarian')}
          className={dietType === 'vegetarian' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}
        >
          <Leaf className="h-4 w-4 mr-1" /> Vegetarian
        </Button>
      </div>

      <Button onClick={generatePlan} disabled={loading} className="w-full bg-primary text-primary-foreground mb-4">
        {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4 mr-2" /> Generate My Plan</>}
      </Button>

      {plan && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="grid grid-cols-4 gap-2 text-center p-3 rounded-lg bg-secondary/50">
            <div><p className="font-display text-lg text-primary">{plan.daily_calories}</p><p className="text-xs text-muted-foreground">kcal</p></div>
            <div><p className="font-display text-lg text-accent">{plan.daily_protein_g}g</p><p className="text-xs text-muted-foreground">protein</p></div>
            <div><p className="font-display text-lg text-yellow-400">{plan.daily_carbs_g}g</p><p className="text-xs text-muted-foreground">carbs</p></div>
            <div><p className="font-display text-lg text-orange-400">{plan.daily_fat_g}g</p><p className="text-xs text-muted-foreground">fat</p></div>
          </div>

          {plan.meals.map((meal, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="p-4 rounded-lg bg-secondary/50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-primary tracking-widest uppercase font-medium">{meal.meal_type}</span>
                <span className="text-xs text-muted-foreground">{meal.calories} kcal</span>
              </div>
              <h4 className="font-display text-lg text-foreground mb-1">{meal.name}</h4>
              <p className="text-xs text-muted-foreground mb-2">P:{meal.protein_g}g • C:{meal.carbs_g}g • F:{meal.fat_g}g</p>
              <ul className="space-y-1">
                {meal.items.map((item, j) => (
                  <li key={j} className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-primary flex-shrink-0" />{item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          {plan.tips.length > 0 && (
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-xs font-medium text-primary mb-1">💡 Tips</p>
              <ul className="space-y-1">
                {plan.tips.map((tip, i) => (
                  <li key={i} className="text-xs text-muted-foreground">• {tip}</li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
