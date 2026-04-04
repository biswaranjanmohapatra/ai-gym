import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Mail, Lock, ArrowRight, Loader2, User, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const AVATARS = ['💪', '🏋️', '🧘', '🏃', '⚡', '🔥', '🥇', '🎯'];

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('💪');
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();



  if (user) {
    navigate('/dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) { toast.error('Please fill in all fields'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (!isLogin && password !== confirmPassword) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      if (isLogin) {
        const role = await signIn(email, password);
        toast.success('Welcome back!');
        if (role === 'trainer') navigate('/trainer-dashboard');
        else if (role === 'admin') navigate('/admin-dashboard');
        else navigate('/dashboard');
      } else {
        await signUp(email, password, 'user', name.trim() || undefined);
        localStorage.setItem(`avatar_pending_${email}`, selectedAvatar);
        toast.success('Account created! Please verify your email before logging in.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, hsl(220 20% 6%) 0%, hsl(220 25% 10%) 50%, hsl(142 30% 8%) 100%)' }}>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-accent/5 rounded-full blur-[100px]" />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md relative z-10">
        <div className="glass-card p-8 backdrop-blur-2xl border-border/20 shadow-[0_8px_32px_hsl(0_0%_0%/0.4)]">
          <div className="text-center mb-8">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
              <Dumbbell className="h-8 w-8 text-primary" />
            </motion.div>
            <AnimatePresence mode="wait">
              <motion.div key={isLogin ? 'login' : 'signup'} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <h2 className="font-display text-3xl text-foreground mb-1">{isLogin ? 'Welcome back' : 'Create Account'}</h2>
                <p className="text-muted-foreground text-sm">{isLogin ? 'Please sign in to continue' : 'Begin your transformation'}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div key="signup-fields" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Choose your avatar</p>
                    <div className="flex gap-2 justify-center flex-wrap">
                      {AVATARS.map(a => (
                        <motion.button key={a} type="button" whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} onClick={() => setSelectedAvatar(a)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all ${
                            selectedAvatar === a ? 'bg-primary/20 ring-2 ring-primary shadow-[0_0_10px_hsl(142_72%_50%/0.3)]' : 'bg-secondary/50 hover:bg-secondary'
                          }`}>{a}</motion.button>
                      ))}
                    </div>
                  </div>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)}
                      className="pl-10 bg-secondary/50 border-border/30 text-foreground placeholder:text-muted-foreground focus:border-primary focus:shadow-[0_0_10px_hsl(142_72%_50%/0.15)] transition-shadow" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)}
                className="pl-10 bg-secondary/50 border-border/30 text-foreground placeholder:text-muted-foreground focus:border-primary focus:shadow-[0_0_10px_hsl(142_72%_50%/0.15)] transition-shadow" />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
                className="pl-10 pr-10 bg-secondary/50 border-border/30 text-foreground placeholder:text-muted-foreground focus:border-primary focus:shadow-[0_0_10px_hsl(142_72%_50%/0.15)] transition-shadow" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div key="confirm-field" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    className="pl-10 bg-secondary/50 border-border/30 text-foreground placeholder:text-muted-foreground focus:border-primary focus:shadow-[0_0_10px_hsl(142_72%_50%/0.15)] transition-shadow" />
                </motion.div>
              )}
            </AnimatePresence>

            {isLogin && (
              <div className="flex justify-end">
                <button type="button" className="text-xs text-muted-foreground hover:text-primary transition-colors">Forgot password?</button>
              </div>
            )}

            <Button type="submit" disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_25px_hsl(142_72%_50%/0.3)] py-6 transition-all duration-300">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{isLogin ? 'Sign In' : 'Create Account'} <ArrowRight className="ml-2 h-4 w-4" /></>}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline font-medium">
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>

          <div className="text-center mt-3 space-y-2">
            <button onClick={() => navigate('/trainer-login')} className="text-xs text-muted-foreground hover:text-foreground transition-colors block">
              Are you a trainer? Login here →
            </button>
            <button onClick={() => navigate('/admin-login')} className="text-xs text-muted-foreground hover:text-foreground transition-colors block">
              Are you an admin? Login here →
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
