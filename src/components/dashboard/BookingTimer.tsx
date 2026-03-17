import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Timer, AlertTriangle, Bell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function BookingTimer() {
  const { user } = useAuth();
  const [activeBooking, setActiveBooking] = useState<any>(null);
  const [timeRemaining, setTimeRemaining] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [alertShown, setAlertShown] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      supabase.from('trainer_bookings').select('*').eq('user_id', user.id).eq('status', 'active')
        .order('booking_date', { ascending: true }).limit(1)
        .then(({ data }) => {
          if (data && data.length > 0) setActiveBooking(data[0]);
        });
    }
  }, [user]);

  const showExpiryAlert = useCallback((minutes: number) => {
    const key = `${activeBooking?.id}-${minutes}`;
    if (alertShown.has(key)) return;
    setAlertShown(prev => new Set(prev).add(key));

    if (minutes === 30) {
      toast.warning('⏰ 30 minutes remaining in your training session!', { duration: 8000 });
    } else if (minutes === 10) {
      toast.warning('⚠️ Only 10 minutes left! Session ending soon.', { duration: 10000 });
    } else if (minutes === 5) {
      toast.error('🔔 Session ending in 5 minutes!', { duration: 15000 });
    }
  }, [activeBooking, alertShown]);

  useEffect(() => {
    if (!activeBooking) return;
    const interval = setInterval(() => {
      const endDateTime = new Date(`${activeBooking.booking_date}T${activeBooking.end_time}`);
      const now = new Date();
      const diff = endDateTime.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeRemaining({ hours: 0, minutes: 0, seconds: 0 });
        toast.info('✅ Training session completed!');
        clearInterval(interval);
        return;
      }
      const totalMinutes = Math.floor(diff / 60000);
      if (totalMinutes <= 30 && totalMinutes > 10) showExpiryAlert(30);
      if (totalMinutes <= 10 && totalMinutes > 5) showExpiryAlert(10);
      if (totalMinutes <= 5) showExpiryAlert(5);

      setTimeRemaining({
        hours: Math.floor(diff / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeBooking, showExpiryAlert]);

  if (!activeBooking) return null;

  const total = timeRemaining.hours + timeRemaining.minutes + timeRemaining.seconds;
  const isUrgent = timeRemaining.hours === 0 && timeRemaining.minutes <= 10;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card p-5 transition-all ${isUrgent ? 'border-destructive/50' : 'border-primary/30'}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Timer className={`h-5 w-5 ${isUrgent ? 'text-destructive animate-pulse' : 'text-primary'}`} />
          <h3 className="font-display text-lg text-foreground">Active Session</h3>
        </div>
        {isUrgent && total > 0 && (
          <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-3 w-3" /> Ending Soon
          </span>
        )}
      </div>
      {total > 0 ? (
        <div className="flex items-center justify-center gap-4">
          {[
            { value: timeRemaining.hours, label: 'Hours' },
            { value: timeRemaining.minutes, label: 'Min' },
            { value: timeRemaining.seconds, label: 'Sec' },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <motion.div
                animate={isUrgent ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
                className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                  isUrgent ? 'bg-destructive/10 border border-destructive/20' : 'bg-primary/10 border border-primary/20'
                }`}
              >
                <span className={`font-display text-2xl ${isUrgent ? 'text-destructive' : 'text-primary'}`}>
                  {String(item.value).padStart(2, '0')}
                </span>
              </motion.div>
              <p className="text-[10px] text-muted-foreground mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <Bell className="h-8 w-8 text-primary mx-auto mb-2" />
          <p className="text-foreground font-medium">Session completed!</p>
        </div>
      )}
      <p className="text-xs text-muted-foreground text-center mt-3">
        {new Date(activeBooking.booking_date).toLocaleDateString()} • {activeBooking.start_time} - {activeBooking.end_time}
      </p>
    </motion.div>
  );
}
