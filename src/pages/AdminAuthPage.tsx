import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Mail, Lock, ArrowRight, Loader2, User, Eye, EyeOff, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function AdminAuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate('/admin-dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) { toast.error('Please fill in all fields'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (!isLogin && password !== confirmPassword) { toast.error('Passwords do not match'); return; }
    if (!isLogin && !name.trim()) { toast.error('Please enter your name'); return; }

    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
        toast.success('Welcome back, Administrator!');
        navigate('/admin-dashboard');
      } else {
        await signUp(email, password, 'admin');
        localStorage.setItem(`pending_admin_${email}`, JSON.stringify({ name }));
        toast.success('Admin account created! You can now sign in.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, hsl(220 20% 6%) 0%, hsl(220 25% 10%) 50%, hsl(280 30% 10%) 100%)' }}
    >
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px]" style={{ background: 'hsl(280 100% 50% / 0.05)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full blur-[100px]" style={{ background: 'hsl(142 72% 50% / 0.05)' }} />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md relative z-10">
        <div className="glass-card p-8 backdrop-blur-2xl border-border/20 shadow-[0_8px_32px_hsl(0_0%_0%/0.4)]" style={{ borderColor: 'hsl(280 100% 50% / 0.15)' }}>
          <div className="text-center mb-8">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'hsl(280 100% 50% / 0.1)', border: '1px solid hsl(280 100% 50% / 0.2)' }}>
              <Shield className="h-8 w-8" style={{ color: 'hsl(280 100% 50%)' }} />
            </motion.div>
            <h2 className="font-display text-3xl text-foreground mb-1">
              {isLogin ? 'Admin Login' : 'Admin Registration'}
            </h2>
            <p className="text-muted-foreground text-sm">
              {isLogin ? 'Access admin dashboard' : 'Register as administrator'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div key="signup-fields" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)}
                      className="pl-10 bg-secondary/50 border-border/30 text-foreground placeholder:text-muted-foreground" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)}
                className="pl-10 bg-secondary/50 border-border/30 text-foreground placeholder:text-muted-foreground" />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
                className="pl-10 pr-10 bg-secondary/50 border-border/30 text-foreground placeholder:text-muted-foreground" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {!isLogin && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  className="pl-10 bg-secondary/50 border-border/30 text-foreground placeholder:text-muted-foreground" />
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full py-6 transition-all duration-300"
              style={{ background: 'linear-gradient(135deg, hsl(280 100% 50%), hsl(280 90% 40%))', color: 'hsl(220 20% 6%)' }}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                <>{isLogin ? 'Sign In as Admin' : 'Register as Admin'} <ArrowRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {isLogin ? "Don't have an admin account?" : 'Already have an admin account?'}{' '}
            <button onClick={() => setIsLogin(!isLogin)} className="font-medium hover:underline" style={{ color: 'hsl(280 100% 55%)' }}>
              {isLogin ? 'Register' : 'Sign In'}
            </button>
          </p>

          <div className="text-center mt-3 space-y-2">
            <button onClick={() => navigate('/auth')} className="text-xs text-muted-foreground hover:text-foreground transition-colors block">
              ← Back to User Login
            </button>
            <button onClick={() => navigate('/trainer-auth')} className="text-xs text-muted-foreground hover:text-foreground transition-colors block">
              ← Back to Trainer Login
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

