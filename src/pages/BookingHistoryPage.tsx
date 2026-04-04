import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Calendar, Clock, IndianRupee, CheckCircle, XCircle, Timer, AlertCircle, Loader2 } from 'lucide-react';

interface Booking {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
  session_type: string;
  payment_amount: number;
  payment_status: string;
  trainer_id: string;
  created_at: string;
  trainer_profiles?: {
    name: string;
    specialty: string;
    emoji: string;
  } | null;
}

const statusConfig: Record<string, { color: string; bg: string; icon: any; label: string }> = {
  pending:   { color: 'text-yellow-400', bg: 'bg-yellow-400/10',  icon: Timer,         label: 'Pending' },
  approved:  { color: 'text-primary',    bg: 'bg-primary/10',     icon: CheckCircle,    label: 'Approved' },
  active:    { color: 'text-primary',    bg: 'bg-primary/10',     icon: Timer,          label: 'Active' },
  completed: { color: 'text-green-400',  bg: 'bg-green-400/10',   icon: CheckCircle,    label: 'Completed' },
  cancelled: { color: 'text-destructive',bg: 'bg-destructive/10', icon: XCircle,        label: 'Cancelled' },
};

export default function BookingHistoryPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadBookings();
  }, [user]);

  const loadBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('trainer_bookings')
      .select('*, trainer_profiles(name, specialty, emoji)')
      .eq('user_id', user!.id)
      .order('booking_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (!error && data) setBookings(data as Booking[]);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Booking History</h1>
              <p className="text-muted-foreground text-sm">All your trainer session bookings</p>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : bookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 rounded-2xl bg-secondary/30 border border-border/30 flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No bookings yet</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              You haven't booked any trainer sessions. Visit the Trainers page to find a coach and book a session.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4 max-w-3xl">
            {/* Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Total', value: bookings.length, color: 'text-foreground' },
                { label: 'Pending', value: bookings.filter(b => b.status === 'pending').length, color: 'text-yellow-400' },
                { label: 'Approved', value: bookings.filter(b => b.status === 'approved' || b.status === 'active').length, color: 'text-primary' },
                { label: 'Cancelled', value: bookings.filter(b => b.status === 'cancelled').length, color: 'text-destructive' },
              ].map(stat => (
                <div key={stat.label} className="bg-secondary/20 border border-border/30 rounded-xl p-4 text-center">
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {bookings.map((booking, i) => {
              const cfg = statusConfig[booking.status] || statusConfig.pending;
              const StatusIcon = cfg.icon;
              const trainerName = booking.trainer_profiles?.name || 'Trainer';
              const trainerEmoji = booking.trainer_profiles?.emoji || '💪';

              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-secondary/20 border border-border/30 rounded-2xl p-5 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-2xl">
                        {trainerEmoji}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{trainerName}</p>
                        <p className="text-sm text-muted-foreground capitalize">{booking.session_type} Session</p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      {cfg.label}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-border/20">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Date</p>
                        <p className="text-foreground font-medium">
                          {new Date(booking.booking_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Time</p>
                        <p className="text-foreground font-medium">{booking.start_time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <IndianRupee className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Amount</p>
                        <p className="text-foreground font-medium">₹{booking.payment_amount?.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/10">
                    <span className="text-xs text-muted-foreground">
                      Booked on {new Date(booking.created_at).toLocaleDateString('en-IN')}
                    </span>
                    <span className={`text-xs font-medium ${
                      booking.payment_status === 'paid' ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      Payment: {booking.payment_status}
                    </span>
                  </div>

                  {booking.status === 'pending' && (
                    <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-400/5 border border-yellow-400/20">
                      <AlertCircle className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                      <p className="text-xs text-yellow-400">Awaiting trainer confirmation</p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
