import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Dumbbell, LogOut, User, Shield, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/user-login');
  };

  // ─── Role-based nav links (STRICT SEPARATION) ────────────────
  const userNavLinks = [
    { label: 'Home', href: '/' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Workouts', href: '/workouts' },
    { label: 'Exercises', href: '/exercises' },
    { label: 'Diet Plans', href: '/diet' },
    { label: 'Trainers', href: '/trainers' },
    { label: 'Community', href: '/community' },
    { label: 'Rewards', href: '/rewards' },
    { label: 'Subscriptions', href: '/subscriptions' },
    { label: 'Booking History', href: '/booking-history' },
    { label: 'Payment History', href: '/payment-history' },
  ];

  const trainerNavLinks = [
    { label: 'Dashboard', href: '/trainer-dashboard' },
    { label: 'Booking Requests', href: '/trainer-dashboard?tab=bookings' },
    { label: 'My Earnings', href: '/trainer-dashboard?tab=earnings' },
    { label: 'Set Price', href: '/trainer-dashboard?tab=overview' },
    { label: 'Schedule', href: '/trainer-dashboard?tab=schedule' },
    { label: 'Booking History', href: '/trainer-dashboard?tab=bookings' },
  ];

  const adminNavLinks = [
    { label: 'Dashboard', href: '/admin-dashboard' },
    { label: 'Users', href: '/admin-dashboard?tab=users' },
    { label: 'Trainers', href: '/admin-dashboard?tab=trainers' },
    { label: 'Bookings', href: '/admin-dashboard?tab=bookings' },
    { label: 'Payments', href: '/admin-dashboard?tab=payments' },
    { label: 'Subscriptions', href: '/admin-dashboard?tab=subscriptions' },
  ];

  const publicNavLinks = [
    { label: 'Home', href: '/' },
  ];

  const navLinks = !user
    ? publicNavLinks
    : role === 'trainer'
    ? trainerNavLinks
    : role === 'admin'
    ? adminNavLinks
    : userNavLinks;

  const roleIcon = role === 'admin' ? Shield : role === 'trainer' ? Award : User;
  const RoleIcon = roleIcon;

  const roleColor =
    role === 'admin' ? 'text-purple-400' : role === 'trainer' ? 'text-yellow-400' : 'text-primary';

  const roleLabel =
    role === 'admin' ? 'Admin' : role === 'trainer' ? 'Trainer' : 'Member';

  const loginLink = '/user-login';

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/30"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to={user ? (role === 'trainer' ? '/trainer-dashboard' : role === 'admin' ? '/admin-dashboard' : '/dashboard') : '/'} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Dumbbell className="h-4 w-4 text-primary" />
          </div>
          <span className="font-bold text-lg text-foreground tracking-tight">
            <span className="text-primary">EVO</span> FITNESS
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map(link => (
            <Link
              key={link.href}
              to={link.href}
              className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/30">
                <RoleIcon className={`h-4 w-4 ${roleColor}`} />
                <span className={`text-xs font-medium ${roleColor}`}>{roleLabel}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-destructive gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/user-login">
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  User Login
                </Button>
              </Link>
              <Link to="/trainer-login">
                <Button variant="outline" size="sm" className="border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10">
                  Trainer Login
                </Button>
              </Link>
              <Link to="/admin-login">
                <Button variant="outline" size="sm" className="border-purple-500/40 text-purple-400 hover:bg-purple-500/10">
                  Admin Login
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="lg:hidden text-foreground p-2" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-border/30 bg-background/95 backdrop-blur-xl"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 border-t border-border/30 mt-2">
                {user ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setIsOpen(false); handleSignOut(); }}
                    className="w-full justify-start text-muted-foreground hover:text-destructive gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link to="/user-login" onClick={() => setIsOpen(false)}>
                      <Button className="w-full bg-primary text-primary-foreground">User Login</Button>
                    </Link>
                    <Link to="/trainer-login" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full border-yellow-500/40 text-yellow-400">Trainer Login</Button>
                    </Link>
                    <Link to="/admin-login" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full border-purple-500/40 text-purple-400">Admin Login</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
