import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, CreditCard, CheckCircle, XCircle, Timer, ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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
}

const statusConfig: Record<string, { color: string; bg: string; icon: any }> = {
  active: { color: 'text-primary', bg: 'bg-primary/10', icon: Timer },
  completed: { color: 'text-accent', bg: 'bg-accent/10', icon: CheckCircle },
  cancelled: { color: 'text-destructive', bg: 'bg-destructive/10', icon: XCircle },
};

export default function BookingHistory() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [trainerNames, setTrainerNames] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      supabase.from('trainer_bookings').select('*').eq('user_id', user.id)
        .order('booking_date', { ascending: false }).limit(20)
        .then(async ({ data }) => {
          if (!data) return;
          setBookings(data);
          const trainerIds = Array.from(new Set(data.map(b => b.trainer_id)));
          if (trainerIds.length === 0) return;
          const { data: trainerData } = await supabase
            .from('trainer_profiles')
            .select('id, name')
            .in('id', trainerIds);
          if (trainerData) {
            const byId = trainerData.reduce((acc, t) => {
              acc[t.id] = t.name;
              return acc;
            }, {} as Record<string, string>);
            setTrainerNames(byId);
          }
        });
    }
  }, [user]);

  if (bookings.length === 0) return null;

  return (
    <div className="glass-card p-6">
      <h3 className="font-display text-xl text-foreground mb-4 flex items-center gap-2">
        <Calendar className="h-5 w-5 text-primary" /> Booking History
      </h3>
      <div className="space-y-3">
        {bookings.map(booking => {
          const cfg = statusConfig[booking.status] || statusConfig.active;
          const StatusIcon = cfg.icon;
          const isExpanded = expanded === booking.id;

          return (
            <motion.div key={booking.id} whileHover={{ x: 2 }} className="rounded-lg bg-secondary/30 overflow-hidden">
              <button
                onClick={() => setExpanded(isExpanded ? null : booking.id)}
                className="w-full flex items-center justify-between p-3 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${cfg.bg} flex items-center justify-center`}>
                    <StatusIcon className={`h-4 w-4 ${cfg.color}`} />
                  </div>
                  <div>
                    <p className="text-foreground text-sm font-medium">
                      {new Date(booking.booking_date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Trainer: {trainerNames[booking.trainer_id] || booking.trainer_id} • {booking.session_type}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-primary text-sm font-medium">₹{booking.payment_amount}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                      {booking.status}
                    </span>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border/20"
                  >
                    <div className="p-3 space-y-3">
                      {/* Timeline */}
                      <div className="space-y-2">
                        {[
                          { label: 'Booking Created', time: new Date(booking.created_at).toLocaleString(), done: true },
                          { label: 'Payment Completed', time: booking.payment_status === 'paid' ? 'Paid' : 'Pending', done: booking.payment_status === 'paid' },
                          { label: 'Session Started', time: booking.start_time, done: booking.status !== 'cancelled' },
                          { label: 'Session Completed', time: booking.end_time, done: booking.status === 'completed' },
                        ].map((step, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${step.done ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                            <div className="flex-1 flex items-center justify-between">
                              <span className={`text-xs ${step.done ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</span>
                              <span className="text-[10px] text-muted-foreground">{step.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {booking.session_type}</span>
                        <span className="flex items-center gap-1"><CreditCard className="h-3 w-3" /> {booking.payment_status}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
