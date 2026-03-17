import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Dumbbell, Flame, Calendar as CalIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CalendarPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [workoutDays, setWorkoutDays] = useState<Record<string, { count: number; calories: number }>>({});

  useEffect(() => {
    if (user) fetchMonthData();
  }, [user, currentMonth]);

  const fetchMonthData = async () => {
    const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString();
    const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59).toISOString();
    const { data } = await supabase.from('workout_logs').select('completed_at, calories_burned').eq('user_id', user!.id).gte('completed_at', start).lte('completed_at', end);
    if (data) {
      const grouped: Record<string, { count: number; calories: number }> = {};
      data.forEach(d => {
        const day = new Date(d.completed_at).getDate().toString();
        if (!grouped[day]) grouped[day] = { count: 0, calories: 0 };
        grouped[day].count++;
        grouped[day].calories += d.calories_burned || 0;
      });
      setWorkoutDays(grouped);
    }
  };

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const monthName = currentMonth.toLocaleDateString('en', { month: 'long', year: 'numeric' });
  const today = new Date();
  const isCurrentMonth = today.getMonth() === currentMonth.getMonth() && today.getFullYear() === currentMonth.getFullYear();
  const totalWorkouts = Object.values(workoutDays).reduce((s, d) => s + d.count, 0);
  const totalCalories = Object.values(workoutDays).reduce((s, d) => s + d.calories, 0);
  const activeDays = Object.keys(workoutDays).length;

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-12 text-center">
          <h1 className="font-display text-5xl text-foreground mb-4">Workout Calendar</h1>
          <p className="text-muted-foreground mb-8">Sign in to track your workout schedule.</p>
          <Button onClick={() => navigate('/auth')} className="bg-primary text-primary-foreground">Sign In</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <p className="text-primary tracking-widest uppercase text-sm mb-2">Workout Calendar</p>
          <h1 className="font-display text-5xl md:text-6xl text-foreground mb-4">Stay Consistent</h1>
        </motion.div>

        {/* Month Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Workouts', value: totalWorkouts, icon: Dumbbell },
            { label: 'Active Days', value: activeDays, icon: CalIcon },
            { label: 'Calories', value: totalCalories.toLocaleString(), icon: Flame },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card p-4 text-center">
              <s.icon className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="font-display text-2xl text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Calendar */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h3 className="font-display text-2xl text-foreground">{monthName}</h3>
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-xs text-muted-foreground py-2">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayStr = day.toString();
              const workout = workoutDays[dayStr];
              const isToday = isCurrentMonth && day === today.getDate();

              return (
                <motion.div
                  key={day}
                  whileHover={{ scale: 1.1 }}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm relative cursor-default transition-all ${
                    workout
                      ? 'bg-primary/15 text-primary ring-1 ring-primary/30'
                      : 'text-muted-foreground hover:bg-secondary/50'
                  } ${isToday ? 'ring-2 ring-accent' : ''}`}
                >
                  <span className={`text-sm ${workout ? 'font-medium text-foreground' : ''}`}>{day}</span>
                  {workout && (
                    <span className="text-[8px] text-primary">{workout.count}×</span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-center gap-6 mt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-primary/15 ring-1 ring-primary/30" /> Workout Day</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-secondary/50" /> Rest Day</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded ring-2 ring-accent" /> Today</span>
        </div>
      </div>
      <Footer />
    </div>
  );
}
