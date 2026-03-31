import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Dumbbell, Clock, Flame, ChevronDown, ChevronUp, Check, Star, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';

const workoutPlans = {
  beginner: [
    { name: 'Full Body Basics', muscle: 'Full Body', duration: 30, calories: 200, points: 20, exercises: [
      { name: 'Push-ups', sets: 3, reps: 10, weight: 0 },
      { name: 'Bodyweight Squats', sets: 3, reps: 15, weight: 0 },
      { name: 'Plank', sets: 3, reps: 30, weight: 0 },
      { name: 'Lunges', sets: 3, reps: 10, weight: 0 },
      { name: 'Jumping Jacks', sets: 3, reps: 20, weight: 0 },
    ]},
    { name: 'Core Starter', muscle: 'Core', duration: 20, calories: 150, points: 15, exercises: [
      { name: 'Crunches', sets: 3, reps: 15, weight: 0 },
      { name: 'Leg Raises', sets: 3, reps: 10, weight: 0 },
      { name: 'Mountain Climbers', sets: 3, reps: 15, weight: 0 },
      { name: 'Side Plank', sets: 2, reps: 20, weight: 0 },
    ]},
    { name: 'Upper Body Intro', muscle: 'Chest & Arms', duration: 25, calories: 180, points: 18, exercises: [
      { name: 'Wall Push-ups', sets: 3, reps: 12, weight: 0 },
      { name: 'Diamond Push-ups', sets: 3, reps: 8, weight: 0 },
      { name: 'Tricep Dips', sets: 3, reps: 10, weight: 0 },
      { name: 'Arm Circles', sets: 3, reps: 20, weight: 0 },
    ]},
  ],
  intermediate: [
    { name: 'Push Day', muscle: 'Chest & Shoulders', duration: 45, calories: 350, points: 35, exercises: [
      { name: 'Bench Press', sets: 4, reps: 10, weight: 60 },
      { name: 'Incline Dumbbell Press', sets: 3, reps: 12, weight: 20 },
      { name: 'Overhead Press', sets: 4, reps: 10, weight: 40 },
      { name: 'Cable Flyes', sets: 3, reps: 12, weight: 15 },
      { name: 'Lateral Raises', sets: 3, reps: 15, weight: 8 },
    ]},
    { name: 'Pull Day', muscle: 'Back & Biceps', duration: 45, calories: 330, points: 33, exercises: [
      { name: 'Deadlifts', sets: 4, reps: 8, weight: 80 },
      { name: 'Pull-ups', sets: 4, reps: 10, weight: 0 },
      { name: 'Barbell Rows', sets: 4, reps: 10, weight: 50 },
      { name: 'Face Pulls', sets: 3, reps: 15, weight: 15 },
      { name: 'Bicep Curls', sets: 3, reps: 12, weight: 12 },
    ]},
    { name: 'Leg Day', muscle: 'Legs', duration: 50, calories: 400, points: 40, exercises: [
      { name: 'Squats', sets: 4, reps: 10, weight: 70 },
      { name: 'Romanian Deadlifts', sets: 4, reps: 10, weight: 60 },
      { name: 'Leg Press', sets: 3, reps: 12, weight: 100 },
      { name: 'Leg Curls', sets: 3, reps: 12, weight: 30 },
      { name: 'Calf Raises', sets: 4, reps: 15, weight: 40 },
    ]},
  ],
  advanced: [
    { name: 'Power Chest & Tris', muscle: 'Chest & Triceps', duration: 60, calories: 500, points: 50, exercises: [
      { name: 'Heavy Bench Press', sets: 5, reps: 5, weight: 100 },
      { name: 'Weighted Dips', sets: 4, reps: 8, weight: 20 },
      { name: 'Incline DB Press', sets: 4, reps: 10, weight: 30 },
      { name: 'Cable Crossovers', sets: 4, reps: 12, weight: 20 },
      { name: 'Skull Crushers', sets: 3, reps: 12, weight: 25 },
      { name: 'Tricep Pushdowns', sets: 3, reps: 15, weight: 20 },
    ]},
    { name: 'Destroyer Back', muscle: 'Back & Biceps', duration: 60, calories: 480, points: 48, exercises: [
      { name: 'Heavy Deadlifts', sets: 5, reps: 5, weight: 140 },
      { name: 'Weighted Pull-ups', sets: 4, reps: 8, weight: 15 },
      { name: 'T-Bar Rows', sets: 4, reps: 10, weight: 50 },
      { name: 'Single-arm DB Rows', sets: 3, reps: 12, weight: 30 },
      { name: 'Hammer Curls', sets: 3, reps: 12, weight: 14 },
      { name: 'Preacher Curls', sets: 3, reps: 10, weight: 20 },
    ]},
    { name: 'Titan Legs', muscle: 'Legs', duration: 65, calories: 550, points: 55, exercises: [
      { name: 'Heavy Squats', sets: 5, reps: 5, weight: 120 },
      { name: 'Front Squats', sets: 4, reps: 8, weight: 80 },
      { name: 'Bulgarian Split Squats', sets: 3, reps: 10, weight: 20 },
      { name: 'Leg Extensions', sets: 4, reps: 12, weight: 40 },
      { name: 'Leg Curls', sets: 4, reps: 12, weight: 35 },
      { name: 'Standing Calf Raises', sets: 5, reps: 15, weight: 50 },
    ]},
  ],
};

type Exercise = { name: string; sets: number; reps: number; weight: number };

export default function WorkoutsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [customExercises, setCustomExercises] = useState<Record<string, Exercise[]>>({});

  const logWorkout = async (workout: typeof workoutPlans.beginner[0]) => {
    if (!user) { toast.error('Please sign in to log workouts'); navigate('/user-login'); return; }
    
    // Log workout
    const { error } = await supabase.from('workout_logs').insert({
      user_id: user.id,
      workout_name: workout.name,
      muscle_group: workout.muscle,
      duration_minutes: workout.duration,
      calories_burned: workout.calories,
    });
    if (error) { toast.error('Failed to log workout'); return; }

    // Award reward points
    await supabase.from('reward_points').insert({
      user_id: user.id,
      points: workout.points,
      reason: `Completed: ${workout.name} (${level})`,
    });

    toast.success(
      <div className="flex items-center gap-2">
        <span>{workout.name} logged! 🔥</span>
        <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: 'hsl(45 100% 55%)' }}>
          +{workout.points} pts
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <p className="text-primary tracking-widest uppercase text-sm mb-2">Workout Plans</p>
          <h1 className="font-display text-5xl md:text-6xl text-foreground mb-4">Train Like A Champion</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">Choose your level, customize exercises, and earn reward points.</p>
        </motion.div>

        <div className="flex justify-center gap-3 mb-10">
          {(['beginner', 'intermediate', 'advanced'] as const).map(l => (
            <Button key={l} onClick={() => { setLevel(l); setExpanded(null); }}
              className={`capitalize ${level === l ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}>
              {l}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {workoutPlans[level].map((workout, i) => (
            <motion.div key={`${level}-${i}`} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="glass-card overflow-hidden">
              <div className="h-2 gradient-primary" />
              <div className="p-6">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-display text-2xl text-foreground">{workout.name}</h3>
                  <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ color: 'hsl(45 100% 55%)', background: 'hsl(45 100% 50% / 0.1)' }}>
                    <Star className="h-3 w-3" /> {workout.points} pts
                  </span>
                </div>
                <p className="text-primary text-sm mb-4">{workout.muscle}</p>

                <div className="flex gap-4 mb-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {workout.duration} min</span>
                  <span className="flex items-center gap-1"><Flame className="h-4 w-4" /> {workout.calories} cal</span>
                </div>

                <button onClick={() => setExpanded(expanded === i ? null : i)} className="flex items-center gap-1 text-sm text-primary mb-3">
                  Exercises ({workout.exercises.length}) {expanded === i ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                {expanded === i && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-4">
                    <div className="space-y-2">
                      {workout.exercises.map((ex, j) => (
                        <div key={j} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 text-sm">
                          <div className="flex items-center gap-2">
                            <Dumbbell className="h-3 w-3 text-primary flex-shrink-0" />
                            <span className="text-foreground">{ex.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{ex.sets}×{ex.reps}</span>
                            {ex.weight > 0 && <span className="text-primary">{ex.weight}kg</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                <Button onClick={() => logWorkout(workout)} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  <Check className="h-4 w-4 mr-2" /> Complete Workout
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
