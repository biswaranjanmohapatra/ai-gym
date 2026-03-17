import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import MealLogger from '@/components/diet/MealLogger';
import WaterTracker from '@/components/diet/WaterTracker';
import NutritionSummary from '@/components/diet/NutritionSummary';
import AIMealPlan from '@/components/diet/AIMealPlan';
import WeeklyReport from '@/components/diet/WeeklyReport';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function DietPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [mealLogs, setMealLogs] = useState<any[]>([]);
  const [waterLogs, setWaterLogs] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [dailyTarget, setDailyTarget] = useState<{ calories: number; protein: number; carbs: number; fat: number } | undefined>();

  useEffect(() => {
    if (user) {
      fetchMealLogs();
      fetchWaterLogs();
      fetchProfile();
    }
  }, [user]);

  const fetchMealLogs = async () => {
    const { data } = await supabase
      .from('meal_logs')
      .select('*')
      .eq('user_id', user!.id)
      .order('logged_at', { ascending: false })
      .limit(100);
    if (data) setMealLogs(data);
  };

  const fetchWaterLogs = async () => {
    const { data } = await supabase
      .from('water_logs')
      .select('*')
      .eq('user_id', user!.id)
      .order('logged_at', { ascending: false })
      .limit(50);
    if (data) setWaterLogs(data);
  };

  const fetchProfile = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('user_id', user!.id).single();
    if (data) setProfile(data);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-12 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-5xl text-foreground mb-4">Diet & Nutrition</h1>
            <p className="text-muted-foreground mb-8">Sign in to access personalized diet tracking and AI meal plans.</p>
            <Button onClick={() => navigate('/auth')} className="bg-primary text-primary-foreground">
              Sign In to Get Started
            </Button>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <p className="text-primary tracking-widest uppercase text-sm mb-2">Diet & Nutrition</p>
          <h1 className="font-display text-5xl md:text-6xl text-foreground mb-4">Fuel Your Body</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">Track meals, monitor macros, and get AI-powered nutrition plans.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            <NutritionSummary logs={mealLogs} dailyTarget={dailyTarget} />
            <MealLogger logs={mealLogs} onRefresh={fetchMealLogs} />
            <WeeklyReport logs={mealLogs} />
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <WaterTracker logs={waterLogs} onRefresh={fetchWaterLogs} />
            <AIMealPlan profile={profile} onTargetUpdate={setDailyTarget} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
