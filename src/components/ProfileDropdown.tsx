import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Brain, Dumbbell, Apple, Crown, Settings, LogOut, ChevronDown, Calendar, Target, Trophy, Star, Users, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { fetchApi } from '@/lib/api';
import { useUserRole } from '@/hooks/useUserRole';

const AVATARS = ['💪', '🏋️', '🧘', '🏃', '⚡', '🔥', '🥇', '🎯'];

export default function ProfileDropdown() {
  const [open, setOpen] = useState(false);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [avatar, setAvatar] = useState('💪');
  const ref = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { isTrainer, isPremium } = useUserRole();

  useEffect(() => {
    if (user) {
      if (user.name) {
        setProfileName(user.name);
      } else {
        fetchApi('/users/profile')
          .then((data) => {
            if (data?.name) setProfileName(data.name);
          })
          .catch(err => console.error('Error fetching profile in dropdown', err));
      }
      const saved = localStorage.getItem(`avatar_${user.id}`);
      if (saved) setAvatar(saved);
    }
  }, [user]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const menuItems = isTrainer
    ? [
        { icon: User, label: 'Trainer Dashboard', action: () => navigate('/trainer-dashboard') },
        { icon: Calendar, label: 'Schedule', action: () => navigate('/trainer-dashboard') },
        { icon: Settings, label: 'Settings', action: () => navigate('/trainer-dashboard') },
      ]
    : [
        { icon: User, label: 'Dashboard', action: () => navigate('/dashboard') },
        { icon: Brain, label: 'AI Guide', action: () => navigate('/dashboard') },
        { icon: Dumbbell, label: 'Workouts', action: () => navigate('/workouts') },
        { icon: Target, label: 'Exercises', action: () => navigate('/exercises') },
        { icon: Apple, label: 'Diet & Nutrition', action: () => navigate('/diet') },
        { icon: Calendar, label: 'Calendar', action: () => navigate('/calendar') },
        { icon: Trophy, label: 'Trainers', action: () => navigate('/trainers') },
        { icon: Star, label: 'Rewards', action: () => navigate('/rewards') },
        { icon: Users, label: 'Community', action: () => navigate('/community') },
      ];

  return (
    <div ref={ref} className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300"
        style={isPremium ? {
          background: 'linear-gradient(135deg, hsl(45 100% 50% / 0.1), hsl(38 90% 40% / 0.05))',
          border: '1.5px solid hsl(45 100% 50% / 0.4)',
          boxShadow: '0 0 12px hsl(45 100% 50% / 0.15)',
        } : {
          background: 'hsl(220 15% 16% / 0.6)',
          border: '1px solid hsl(220 15% 25% / 0.3)',
        }}
      >
        {/* Perfectly circular avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0"
          style={isPremium ? {
            background: 'linear-gradient(135deg, hsl(45 100% 50% / 0.2), hsl(38 90% 40% / 0.15))',
            border: '2px solid hsl(45 100% 50% / 0.5)',
            boxShadow: '0 0 10px hsl(45 100% 50% / 0.2)',
          } : {
            background: 'hsl(142 72% 50% / 0.15)',
            border: '1.5px solid hsl(142 72% 50% / 0.3)',
          }}
        >
          {avatar}
        </div>
        <span className="text-sm text-foreground hidden sm:block max-w-[100px] truncate font-medium">
          {profileName || 'Profile'}
        </span>
        {isPremium && <Crown className="h-3.5 w-3.5 flex-shrink-0" style={{ color: 'hsl(45 100% 55%)' }} />}
        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute right-0 top-full mt-2 w-64 shadow-2xl overflow-hidden z-50 rounded-xl ${
              isPremium ? 'premium-card' : 'glass-card border border-border/40'
            }`}
          >
            {/* Header */}
            <div className="p-4 border-b border-border/30"
              style={isPremium ? { background: 'linear-gradient(135deg, hsl(45 100% 50% / 0.08), transparent)' } : undefined}>
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                  style={isPremium ? {
                    background: 'linear-gradient(135deg, hsl(45 100% 50% / 0.2), hsl(38 90% 40% / 0.15))',
                    border: '2.5px solid hsl(45 100% 50% / 0.5)',
                    boxShadow: '0 0 20px hsl(45 100% 50% / 0.15)',
                  } : {
                    background: 'hsl(142 72% 50% / 0.15)',
                    border: '2px solid hsl(142 72% 50% / 0.3)',
                  }}
                >
                  {avatar}
                </div>
                <div className="min-w-0">
                  <p className="text-foreground font-medium text-sm truncate">{profileName || 'User'}</p>
                  <p className="text-muted-foreground text-xs truncate">{user?.email}</p>
                  {isPremium ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 tracking-wider"
                      style={{ color: 'hsl(45 100% 55%)', background: 'hsl(45 100% 50% / 0.1)', border: '1px solid hsl(45 100% 50% / 0.2)' }}>
                      <Shield className="h-2.5 w-2.5" /> PREMIUM
                    </span>
                  ) : isTrainer ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full mt-1">
                      <Trophy className="h-2.5 w-2.5" /> TRAINER
                    </span>
                  ) : (
                    <span className="inline-flex text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full mt-1">Free Plan</span>
                  )}
                </div>
              </div>
            </div>

            <div className="py-1 max-h-80 overflow-y-auto">
              {menuItems.map((item, i) => (
                <motion.button key={i} whileHover={{ x: 4 }} onClick={() => { item.action(); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </motion.button>
              ))}
            </div>

            <div className="border-t border-border/30 py-1">
              <motion.button whileHover={{ x: 4 }} onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors">
                <LogOut className="h-4 w-4" /> Sign Out
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
