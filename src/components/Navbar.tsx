import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import gymLogo from '@/assets/gym-logo.png';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import ProfileDropdown from '@/components/ProfileDropdown';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, role } = useAuth();

  const navLinks =
    !user || role === 'user'
      ? [
          { label: 'Home', href: '/' },
          { label: 'Workouts', href: '/workouts' },
          { label: 'Exercises', href: '/exercises' },
          { label: 'Diet Plans', href: '/diet' },
          { label: 'Trainers', href: '/trainers' },
          { label: 'Community', href: '/community' },
          ...(user
            ? [
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Rewards', href: '/rewards' },
                { label: 'Subscriptions', href: '/subscriptions' },
                { label: 'Booking History', href: '/booking-history' },
                { label: 'Payment History', href: '/payment-history' },
              ]
            : []),
        ]
      : role === 'trainer'
      ? [
          { label: 'Trainer Dashboard', href: '/trainer-dashboard' },
          { label: 'Bookings', href: '/trainer-dashboard?tab=bookings' },
          { label: 'Payments', href: '/trainer-dashboard?tab=earnings' },
          { label: 'Available Slots', href: '/trainer-dashboard?tab=schedule' },
          { label: 'Profile', href: '/trainer-dashboard' },
        ]
      : [
          { label: 'Admin Dashboard', href: '/admin-dashboard' },
          { label: 'Users', href: '/admin-dashboard?tab=users' },
          { label: 'Trainers', href: '/admin-dashboard?tab=trainers' },
          { label: 'Bookings', href: '/admin-dashboard?tab=bookings' },
          { label: 'Payments', href: '/admin-dashboard?tab=payments' },
          { label: 'Subscriptions', href: '/admin-dashboard?tab=subscriptions' },
          { label: 'Analytics', href: '/admin-dashboard?tab=analytics' },
        ];

  return (
    <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/30">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={gymLogo} alt="Elite Fitness Gym Logo" className="h-8 w-8" />
          <span className="font-display text-2xl tracking-wider text-foreground">ELITE FITNESS</span>
        </Link>

        <div className="hidden lg:flex items-center gap-5">
          {navLinks.map(link => (
            <Link key={link.href} to={link.href} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <ProfileDropdown />
          ) : (
            <>
              <Link to="/user-login">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Sign In</Button>
              </Link>
              <Link to="/user-login?mode=signup">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">Get Started</Button>
              </Link>
              <Link to="/trainer-login">
                <Button variant="outline" size="sm" className="text-foreground border-border/50 hover:border-primary/50">
                  Trainer Login
                </Button>
              </Link>
            </>
          )}
        </div>

        <button className="lg:hidden text-foreground" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass-card border-t border-border/30">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
              {navLinks.map(link => (
                <Link key={link.href} to={link.href} onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-primary py-2">
                  {link.label}
                </Link>
              ))}
              {user ? (
                <ProfileDropdown />
              ) : (
                <div className="flex flex-col gap-2">
                  <Link to="/user-login" onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-primary text-primary-foreground">Get Started</Button>
                  </Link>
                  <Link to="/trainer-login" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full text-foreground border-border/50">Trainer Login</Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
