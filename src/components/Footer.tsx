import { Dumbbell } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-border/30 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-6 w-6 text-primary" />
            <span className="font-display text-xl text-foreground">IRONFORGE</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <Link to="/workouts" className="hover:text-primary transition-colors">Workouts</Link>
            <Link to="/diet" className="hover:text-primary transition-colors">Diet</Link>
            <Link to="/user-login" className="hover:text-primary transition-colors">Sign In</Link>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 IronForge. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
