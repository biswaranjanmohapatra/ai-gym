import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Crown, Shield, Edit3, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Profile {
  name: string | null;
  age: number | null;
  gender: string | null;
  heightCm: number | null;
  weightKg: number | null;
  goal: string | null;
  bmi: number | null;
  activityLevel: string | null;
  premiumUntil?: string | null;
}

interface Props {
  profile: Profile | null;
  onUpdate: () => void;
  isPremium?: boolean;
}

export default function DashboardProfile({ profile, onUpdate, isPremium = false }: Props) {
  const { user } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    age: String(profile?.age || ''),
    gender: profile?.gender || 'male',
    heightCm: String(profile?.heightCm || ''),
    weightKg: String(profile?.weightKg || ''),
    goal: profile?.goal || 'general_fitness',
    activityLevel: profile?.activityLevel || 'moderate',
  });

  const avatar = typeof window !== 'undefined' ? localStorage.getItem(`avatar_${user?.id}`) || '💪' : '💪';

  const saveProfile = async () => {
    const height = parseFloat(formData.heightCm);
    const weight = parseFloat(formData.weightKg);
    const bmi = height && weight ? +(weight / ((height / 100) ** 2)).toFixed(1) : null;
    try {
      await fetchApi('/users/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name: formData.name || null,
          age: formData.age ? parseInt(formData.age) : null,
          gender: formData.gender,
          heightCm: height || null,
          weightKg: weight || null,
          goal: formData.goal,
          activityLevel: formData.activityLevel,
          bmi,
        }),
      });
      toast.success('Profile updated!');
      setEditMode(false);
      onUpdate();
    } catch {
      toast.error('Failed to save profile');
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-xl ${isPremium ? 'premium-card gold-glow' : 'glass-card'}`}>
      {/* Premium shimmer overlay */}
      {isPremium && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] animate-[shimmer_6s_linear_infinite]"
            style={{ background: 'linear-gradient(45deg, transparent 40%, hsl(45 100% 50% / 0.03) 50%, transparent 60%)' }} />
        </div>
      )}

      <div className="relative p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-xl text-foreground flex items-center gap-2">
            {isPremium ? (
              <Crown className="h-5 w-5" style={{ color: 'hsl(45 100% 55%)' }} />
            ) : (
              <User className="h-5 w-5 text-primary" />
            )}
            Profile
          </h3>
          <Button variant="ghost" size="sm" onClick={() => setEditMode(!editMode)}
            className={isPremium ? 'hover:bg-[hsl(45_100%_50%/0.1)]' : 'text-primary hover:text-primary/80'}>
            {editMode ? 'Cancel' : <><Edit3 className="h-3.5 w-3.5 mr-1" /> Edit</>}
          </Button>
        </div>

        {/* Avatar with gold ring for premium */}
        <div className="flex justify-center mb-5">
          <motion.div
            whileHover={{ scale: 1.08, rotate: 3 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="relative"
          >
            {/* Outer glow ring for premium */}
            {isPremium && (
              <div className="absolute -inset-1 rounded-full animate-pulse-gold"
                style={{ background: 'linear-gradient(135deg, hsl(45 100% 50% / 0.4), hsl(38 90% 40% / 0.3), hsl(45 100% 65% / 0.4))' }} />
            )}
            <div
              className={`relative w-24 h-24 rounded-full flex items-center justify-center text-4xl ${
                isPremium ? '' : 'bg-primary/20 ring-2 ring-primary/30'
              }`}
              style={isPremium ? {
                background: 'linear-gradient(135deg, hsl(45 100% 50% / 0.15), hsl(220 18% 12%), hsl(45 100% 50% / 0.1))',
                border: '3px solid hsl(45 100% 50% / 0.6)',
                boxShadow: '0 0 30px hsl(45 100% 50% / 0.2), inset 0 0 20px hsl(45 100% 50% / 0.05)',
              } : undefined}
            >
              {avatar}
            </div>
            {/* Crown floating above avatar for premium */}
            {isPremium && (
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-3 left-1/2 -translate-x-1/2"
              >
                <Crown className="h-6 w-6 drop-shadow-lg" style={{ color: 'hsl(45 100% 55%)', filter: 'drop-shadow(0 0 6px hsl(45 100% 50% / 0.5))' }} />
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Name & Badge */}
        <div className="text-center mb-5">
          <p className="font-display text-lg text-foreground mb-1.5">{profile?.name || 'Fitness User'}</p>
          {isPremium ? (
            <motion.span
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-1.5 rounded-full tracking-wider"
              style={{
                color: 'hsl(45 100% 55%)',
                background: 'linear-gradient(135deg, hsl(45 100% 50% / 0.15), hsl(38 90% 40% / 0.1))',
                border: '1px solid hsl(45 100% 50% / 0.35)',
                boxShadow: '0 0 15px hsl(45 100% 50% / 0.1)',
              }}
            >
              <Shield className="h-3 w-3" /> PREMIUM MEMBER
            </motion.span>
          ) : (
            <span className="inline-flex text-[10px] text-muted-foreground bg-secondary px-3 py-1 rounded-full">
              Free Plan
            </span>
          )}
        </div>

        {editMode ? (
          <div className="space-y-3">
            <Input placeholder="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="bg-secondary border-border/50" />
            <Input placeholder="Age" type="number" value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} className="bg-secondary border-border/50" />
            <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="w-full rounded-lg bg-secondary border border-border/50 px-3 py-2 text-sm text-foreground">
              <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
            </select>
            <Input placeholder="Height (cm)" type="number" value={formData.heightCm} onChange={e => setFormData({ ...formData, heightCm: e.target.value })} className="bg-secondary border-border/50" />
            <Input placeholder="Weight (kg)" type="number" value={formData.weightKg} onChange={e => setFormData({ ...formData, weightKg: e.target.value })} className="bg-secondary border-border/50" />
            <select value={formData.goal} onChange={e => setFormData({ ...formData, goal: e.target.value })} className="w-full rounded-lg bg-secondary border border-border/50 px-3 py-2 text-sm text-foreground">
              <option value="weight_loss">Weight Loss</option><option value="muscle_gain">Muscle Gain</option>
              <option value="endurance">Endurance</option><option value="flexibility">Flexibility</option>
              <option value="general_fitness">General Fitness</option>
            </select>
            <select value={formData.activityLevel} onChange={e => setFormData({ ...formData, activityLevel: e.target.value })} className="w-full rounded-lg bg-secondary border border-border/50 px-3 py-2 text-sm text-foreground">
              <option value="sedentary">Sedentary</option><option value="light">Light</option>
              <option value="moderate">Moderate</option><option value="active">Active</option>
              <option value="very_active">Very Active</option>
            </select>
            <Button onClick={saveProfile} className="w-full bg-primary text-primary-foreground">
              <Save className="h-4 w-4 mr-2" /> Save Profile
            </Button>
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            {[
              { label: 'Age', value: profile?.age || '—' },
              { label: 'Gender', value: profile?.gender || '—' },
              { label: 'Height', value: profile?.heightCm ? `${profile.heightCm} cm` : '—' },
              { label: 'Weight', value: profile?.weightKg ? `${profile.weightKg} kg` : '—' },
              { label: 'BMI', value: profile?.bmi ?? '—' },
              { label: 'Goal', value: profile?.goal?.replace(/_/g, ' ') || '—' },
              { label: 'Activity', value: profile?.activityLevel?.replace(/_/g, ' ') || '—' },
            ].map((item, i) => (
              <div key={i} className="flex justify-between py-1 px-1">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="text-foreground capitalize font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
