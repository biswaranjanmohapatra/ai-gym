import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { fetchApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Activity, TrendingUp, Flame, Dumbbell, Calculator, MessageSquare,
  Crown, Target, Zap, Calendar, BarChart3, Star
} from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import AIChatbot from '@/components/AIChatbot';
import { useNavigate } from 'react-router-dom';
import DashboardProfile from '@/components/dashboard/DashboardProfile';
import FitnessGoals from '@/components/dashboard/FitnessGoals';
import WorkoutStreak from '@/components/dashboard/WorkoutStreak';
import AchievementBadges from '@/components/dashboard/AchievementBadges';
import RewardPointsCard from '@/components/dashboard/RewardPointsCard';
import BookingTimer from '@/components/dashboard/BookingTimer';
import BookingHistory from '@/components/dashboard/BookingHistory';
import UserPayments from '@/components/dashboard/UserPayments';

interface Profile {
  name: string | null;
  age: number | null;
  gender: string | null;
  heightCm: number | null; // Prisma camelCase
  weightKg: number | null;
  goal: string | null;
  bmi: number | null;
  activityLevel: string | null;
  premiumUntil?: string | null;
}

interface WorkoutLog {
  id: string;
  workoutName: string; // Prisma camelCase
  muscleGroup: string | null;
  durationMinutes: number | null;
  caloriesBurned: number | null;
  completedAt: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [showChat, setShowChat] = useState(false);
  const isPremium = profile?.premiumUntil ? new Date(profile.premiumUntil) > new Date() : false;

  useEffect(() => {
    if (user) { fetchProfile(); fetchWorkoutLogs(); }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const data = await fetchApi('/users/me');
      if (data) {
        if (data.profile) setProfile(data.profile);
        if (data.workoutLogs) setWorkoutLogs(data.workoutLogs);
      }
    } catch (e) {
      console.error('Failed to fetch user dashboard data', e);
    }
  };

  const fetchWorkoutLogs = async () => {
    // Handled in fetchProfile combined fetch
  };

  const totalCalories = workoutLogs.reduce((sum, l) => sum + (l.caloriesBurned || 0), 0);
  const totalWorkouts = workoutLogs.length;
  const totalMinutes = workoutLogs.reduce((sum, l) => sum + (l.durationMinutes || 0), 0);
  const avgCalories = totalWorkouts > 0 ? Math.round(totalCalories / totalWorkouts) : 0;

  const caloriesChartData = workoutLogs.slice(0, 10).reverse().map(l => ({
    date: new Date(l.completedAt).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    calories: l.caloriesBurned || 0,
    duration: l.durationMinutes || 0,
  }));

  const muscleGroups = workoutLogs.reduce((acc, l) => {
    const group = l.muscleGroup || 'Other';
    acc[group] = (acc[group] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const muscleChartData = Object.entries(muscleGroups).map(([name, count]) => ({ name, count }));

  const bmiCategory = (bmi: number | null) => {
    if (!bmi) return { label: 'N/A', color: 'text-muted-foreground' };
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-accent' };
    if (bmi < 25) return { label: 'Normal', color: 'text-primary' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-yellow-400' };
    return { label: 'Obese', color: 'text-destructive' };
  };
  const bmiInfo = bmiCategory(profile?.bmi ?? null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="font-display text-4xl md:text-5xl text-foreground mb-1 flex items-center gap-3">
            Welcome{profile?.name ? `, ${profile.name}` : ''}
            {isPremium && <Crown className="h-7 w-7" style={{ color: 'hsl(45 100% 55%)' }} />}
          </h1>
          <p className="text-muted-foreground">Track your progress and crush your goals.</p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          {[
            { icon: Dumbbell, label: 'Workouts', action: () => navigate('/workouts'), color: 'text-primary' },
            { icon: Activity, label: 'Diet Plans', action: () => navigate('/diet'), color: 'text-accent' },
            { icon: Calendar, label: 'Calendar', action: () => navigate('/calendar'), color: 'text-primary' },
            { icon: Target, label: 'Exercises', action: () => navigate('/exercises'), color: 'text-accent' },
            { icon: Star, label: 'Rewards', action: () => navigate('/rewards'), color: 'text-primary' },
          ].map((item, i) => (
            <motion.button key={i} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} onClick={item.action}
              className="glass-card p-4 flex flex-col items-center gap-2 cursor-pointer transition-shadow hover:shadow-[0_0_20px_hsl(var(--primary)/0.15)]">
              <item.icon className={`h-6 w-6 ${item.color}`} />
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Stats Row */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { icon: Activity, label: 'Total Workouts', value: totalWorkouts, color: 'text-primary', sub: 'sessions' },
            { icon: Flame, label: 'Calories Burned', value: totalCalories.toLocaleString(), color: 'text-accent', sub: 'kcal' },
            { icon: Zap, label: 'Avg / Workout', value: avgCalories, color: 'text-primary', sub: 'kcal' },
            { icon: Calculator, label: 'BMI', value: profile?.bmi ?? 'N/A', color: bmiInfo.color, sub: bmiInfo.label },
            { icon: TrendingUp, label: 'Total Minutes', value: totalMinutes, color: 'text-accent', sub: 'min trained' },
          ].map((stat, i) => (
            <motion.div key={i} whileHover={{ y: -2 }} className="glass-card p-5">
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <p className={`font-display text-2xl ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{stat.sub}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Profile + Rewards + Timer Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <motion.div variants={itemVariants}>
            <DashboardProfile profile={profile} onUpdate={fetchProfile} isPremium={isPremium} />
          </motion.div>
          <motion.div variants={itemVariants} className="space-y-6">
            <RewardPointsCard />
            <BookingTimer />
          </motion.div>
          <motion.div variants={itemVariants}>
            <WorkoutStreak workoutLogs={workoutLogs} />
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div variants={itemVariants} className="glass-card p-6">
            <h3 className="font-display text-xl text-foreground mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" /> Workout Performance
            </h3>
            {caloriesChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={caloriesChartData}>
                  <defs>
                    <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142 72% 50%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(142 72% 50%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 18%)" />
                  <XAxis dataKey="date" stroke="hsl(220 10% 55%)" fontSize={11} />
                  <YAxis stroke="hsl(220 10% 55%)" fontSize={11} />
                  <Tooltip contentStyle={{ background: 'hsl(220 18% 10%)', border: '1px solid hsl(220 15% 18%)', borderRadius: '8px', color: 'hsl(0 0% 95%)' }} />
                  <Area type="monotone" dataKey="calories" stroke="hsl(142 72% 50%)" fill="url(#colorCalories)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-12">Complete workouts to see your chart!</p>
            )}
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card p-6">
            <h3 className="font-display text-xl text-foreground mb-4 flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-accent" /> Muscle Groups Trained
            </h3>
            {muscleChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={muscleChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 18%)" />
                  <XAxis dataKey="name" stroke="hsl(220 10% 55%)" fontSize={11} />
                  <YAxis stroke="hsl(220 10% 55%)" fontSize={11} />
                  <Tooltip contentStyle={{ background: 'hsl(220 18% 10%)', border: '1px solid hsl(220 15% 18%)', borderRadius: '8px', color: 'hsl(0 0% 95%)' }} />
                  <Bar dataKey="count" fill="hsl(174 72% 50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-12">Train different muscle groups to see distribution!</p>
            )}
          </motion.div>
        </div>

        {/* Goals & Badges */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div variants={itemVariants}>
            <FitnessGoals profile={profile} workoutLogs={workoutLogs} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <AchievementBadges workoutLogs={workoutLogs} totalCalories={totalCalories} />
          </motion.div>
        </div>

        {/* Booking & Payments */}
        <motion.div variants={itemVariants} className="mb-8 space-y-4">
          <BookingHistory />
          <UserPayments />
        </motion.div>

        {/* Recent Workouts */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-xl text-foreground flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary" /> Recent Workouts
            </h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/workouts')} className="text-primary hover:text-primary/80">View All</Button>
          </div>
          {workoutLogs.length > 0 ? (
            <div className="space-y-3">
              {workoutLogs.slice(0, 5).map(log => (
                <motion.div key={log.id} whileHover={{ x: 4 }} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 transition-colors hover:bg-secondary/70">
                  <div>
                    <p className="text-foreground font-medium">{log.workoutName}</p>
                    <p className="text-xs text-muted-foreground">{log.muscleGroup} • {log.durationMinutes} min</p>
                  </div>
                  <div className="text-right">
                    <p className="text-primary font-medium">{log.caloriesBurned} cal</p>
                    <p className="text-xs text-muted-foreground">{new Date(log.completedAt).toLocaleDateString()}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No workouts logged yet. Start training!</p>
          )}
        </motion.div>
      </motion.div>

      {/* AI Chat FAB */}
      <button onClick={() => setShowChat(!showChat)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg animate-pulse-neon hover:scale-110 transition-transform">
        <MessageSquare className="h-6 w-6" />
      </button>
      {showChat && <AIChatbot onClose={() => setShowChat(false)} profile={profile} />}
    </div>
  );
}
