import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Users, Calendar, DollarSign, Clock, CheckCircle, XCircle, Award, Plus, Trash2, BarChart3 } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Booking {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
  session_type: string;
  payment_amount: number;
  payment_status: string;
  user_id: string;
  created_at: string;
}

interface TimeSlot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TrainerDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [trainerProfile, setTrainerProfile] = useState<any>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'schedule' | 'earnings'>('overview');
  const [newSlot, setNewSlot] = useState({ day: 1, start: '09:00', end: '10:00' });
  const [sessionPrice, setSessionPrice] = useState<number>(500);

  useEffect(() => {
    if (user) fetchTrainerProfile();
  }, [user]);

  const fetchTrainerProfile = async () => {
    const { data: tp } = await supabase.from('trainer_profiles').select('*').eq('user_id', user!.id).single();
    if (tp) {
      setTrainerProfile(tp);
      setSessionPrice(tp.price_per_session || 500);
      const { data: bk } = await supabase.from('trainer_bookings').select('*').eq('trainer_id', tp.id).order('booking_date', { ascending: false });
      if (bk) setBookings(bk);
      const { data: py } = await supabase.from('payments' as any).select('*').eq('trainer_id', tp.id).order('date', { ascending: false });
      if (py) setPayments(py);
      const { data: ts } = await supabase.from('trainer_time_slots').select('*').eq('trainer_id', tp.id).order('day_of_week');
      if (ts) setTimeSlots(ts);
    }
  };

  const addTimeSlot = async () => {
    if (!trainerProfile) return;
    const { error } = await supabase.from('trainer_time_slots').insert({
      trainer_id: trainerProfile.id,
      day_of_week: newSlot.day,
      start_time: newSlot.start,
      end_time: newSlot.end,
    });
    if (error) toast.error('Failed to add slot');
    else { toast.success('Time slot added!'); fetchTrainerProfile(); }
  };

  const removeTimeSlot = async (id: string) => {
    await supabase.from('trainer_time_slots').delete().eq('id', id);
    toast.success('Slot removed');
    fetchTrainerProfile();
  };

  const updateSessionPrice = async () => {
    if (!user) return;
    const { error } = await supabase
      .from('trainer_profiles')
      .update({ price_per_session: sessionPrice } as any)
      .eq('user_id', user.id);
    if (error) {
      toast.error('Failed to update session price');
      return;
    }
    toast.success('Session price updated');
    fetchTrainerProfile();
  };

  const activeBookings = bookings.filter(b => b.status === 'active');
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const totalEarnings = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const uniqueClients = new Set(bookings.map(b => b.user_id)).size;

  const updateBookingStatus = async (booking: Booking, status: 'approved' | 'cancelled') => {
    if (!trainerProfile) return;
    const updates: Partial<Booking> = {
      status,
      payment_status: status === 'approved' ? 'paid' : 'cancelled',
    };

    const { error } = await supabase
      .from('trainer_bookings')
      .update(updates)
      .eq('id', booking.id);

    if (error) {
      toast.error('Failed to update booking.');
      return;
    }

    if (status === 'approved' && booking.payment_amount) {
      const { error: payError } = await supabase
        .from('payments' as any)
        .insert({
          user_id: booking.user_id,
          trainer_id: trainerProfile.id,
          amount: booking.payment_amount,
          date: new Date().toISOString(),
          status: 'paid',
          type: 'trainer',
        });
      if (payError) {
        console.error(payError);
      }
    }

    toast.success(`Booking ${status === 'approved' ? 'approved' : 'cancelled'}.`);
    fetchTrainerProfile();
  };

  const tabs = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'bookings' as const, label: 'Bookings' },
    { id: 'schedule' as const, label: 'Schedule' },
    { id: 'earnings' as const, label: 'Earnings' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="container mx-auto px-4 pt-24 pb-12">
        <motion.div variants={itemVariants} className="mb-6">
          <h1 className="font-display text-4xl md:text-5xl text-foreground mb-1">Trainer Dashboard</h1>
          <p className="text-muted-foreground">Manage your clients, bookings, and schedule.</p>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={itemVariants} className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
              }`}>
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Stats — always visible */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Users, label: 'Unique Clients', value: uniqueClients, color: 'text-primary' },
            { icon: Calendar, label: 'Active Sessions', value: activeBookings.length, color: 'text-accent' },
            { icon: CheckCircle, label: 'Completed', value: completedBookings.length, color: 'text-primary' },
            { icon: DollarSign, label: 'Total Earnings', value: `₹${totalEarnings.toLocaleString()}`, color: 'text-accent' },
          ].map((stat, i) => (
            <motion.div key={i} whileHover={{ y: -2 }} className="glass-card p-5">
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <p className={`font-display text-2xl ${stat.color}`}>{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Trainer Profile Card */}
        {trainerProfile && activeTab === 'overview' && (
          <motion.div variants={itemVariants} className="premium-card p-6 mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                style={{ background: 'linear-gradient(135deg, hsl(45 100% 50% / 0.2), hsl(38 90% 40% / 0.15))', border: '2px solid hsl(45 100% 50% / 0.4)' }}>
                {trainerProfile.emoji || '💪'}
              </div>
              <div>
                <h3 className="font-display text-xl text-foreground flex items-center gap-2">
                  {trainerProfile.name}
                  <Award className="h-4 w-4" style={{ color: 'hsl(45 100% 55%)' }} />
                </h3>
                <p className="text-sm text-muted-foreground">{trainerProfile.specialty}</p>
                <p className="text-xs text-muted-foreground">{trainerProfile.experience} experience</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(trainerProfile.certifications || []).map((c: string) => (
                <span key={c} className="text-xs px-2 py-1 rounded-full border"
                  style={{ borderColor: 'hsl(45 100% 50% / 0.2)', color: 'hsl(45 100% 55%)', background: 'hsl(45 100% 50% / 0.05)' }}>{c}</span>
              ))}
            </div>
            <div className="mt-5 flex items-center gap-3">
              <Input
                type="number"
                value={sessionPrice}
                onChange={e => setSessionPrice(Number(e.target.value))}
                className="max-w-[180px] bg-secondary border-border/50"
              />
              <Button onClick={updateSessionPrice}>Set Price</Button>
            </div>
          </motion.div>
        )}

        {!trainerProfile && (
          <motion.div variants={itemVariants} className="glass-card p-8 text-center mb-8">
            <Award className="h-12 w-12 mx-auto mb-4" style={{ color: 'hsl(45 100% 55%)' }} />
            <h3 className="font-display text-xl text-foreground mb-2">Set Up Your Trainer Profile</h3>
            <p className="text-muted-foreground text-sm mb-4">Create your profile to start accepting bookings.</p>
          </motion.div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <motion.div variants={itemVariants} className="glass-card p-6">
            <h3 className="font-display text-xl text-foreground mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" /> All Bookings
            </h3>
            {bookings.length > 0 ? (
              <div className="space-y-3">
                {bookings.map(booking => (
                  <motion.div key={booking.id} whileHover={{ x: 4 }} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors">
                    <div>
                      <p className="text-foreground font-medium">{new Date(booking.booking_date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                      <p className="text-xs text-muted-foreground">{booking.start_time} - {booking.end_time} • {booking.session_type}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Booked: {new Date(booking.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-primary font-medium">₹{booking.payment_amount}</p>
                      <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full ${
                        booking.status === 'active' ? 'bg-primary/10 text-primary' :
                        booking.status === 'completed' ? 'bg-accent/10 text-accent' :
                        booking.status === 'cancelled' ? 'bg-destructive/10 text-destructive' :
                        'bg-muted/10 text-muted-foreground'
                      }`}>{booking.status}</span>
                      {booking.status === 'pending' && (
                        <div className="flex gap-1 justify-end">
                          <Button size="xs" variant="outline" onClick={() => updateBookingStatus(booking, 'approved')}>
                            Accept
                          </Button>
                          <Button
                            size="xs"
                            variant="outline"
                            className="text-destructive border-destructive/40"
                            onClick={() => updateBookingStatus(booking, 'cancelled')}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No bookings yet.</p>
            )}
          </motion.div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && trainerProfile && (
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="font-display text-xl text-foreground mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" /> Add Time Slot
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <select value={newSlot.day} onChange={e => setNewSlot({ ...newSlot, day: +e.target.value })}
                  className="rounded-lg bg-secondary border border-border/50 px-3 py-2 text-sm text-foreground">
                  {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                </select>
                <Input type="time" value={newSlot.start} onChange={e => setNewSlot({ ...newSlot, start: e.target.value })} className="bg-secondary border-border/50" />
                <Input type="time" value={newSlot.end} onChange={e => setNewSlot({ ...newSlot, end: e.target.value })} className="bg-secondary border-border/50" />
                <Button onClick={addTimeSlot} className="bg-primary text-primary-foreground">
                  <Plus className="h-4 w-4 mr-1" /> Add Slot
                </Button>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="font-display text-xl text-foreground mb-4">Your Time Slots</h3>
              {timeSlots.length > 0 ? (
                <div className="space-y-2">
                  {timeSlots.map(slot => (
                    <div key={slot.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-primary font-medium w-24">{DAYS[slot.day_of_week]}</span>
                        <span className="text-sm text-foreground">{slot.start_time} - {slot.end_time}</span>
                      </div>
                      <button onClick={() => removeTimeSlot(slot.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-6">No time slots configured. Add some above.</p>
              )}
            </div>
          </motion.div>
        )}

        {/* Earnings Tab */}
        {activeTab === 'earnings' && (
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="premium-card p-6 text-center">
                <p className="text-xs text-muted-foreground mb-1">Total Earnings</p>
                <p className="font-display text-3xl gradient-gold-text">₹{totalEarnings.toLocaleString()}</p>
              </div>
              <div className="glass-card p-6 text-center">
                <p className="text-xs text-muted-foreground mb-1">Total Sessions</p>
                <p className="font-display text-3xl text-primary">{bookings.length}</p>
              </div>
              <div className="glass-card p-6 text-center">
                <p className="text-xs text-muted-foreground mb-1">Avg Per Session</p>
                <p className="font-display text-3xl text-accent">₹{bookings.length > 0 ? Math.round(totalEarnings / bookings.length) : 0}</p>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="font-display text-xl text-foreground mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" /> Payment History
              </h3>
              {payments.length > 0 ? (
                <div className="space-y-2">
                  {payments.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                      <div>
                        <p className="text-sm text-foreground">{new Date(p.date).toLocaleDateString()}</p>
                        <p className="text-xs text-muted-foreground">User: {p.user_id}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-primary font-medium">₹{p.amount}</p>
                        <span className="text-[10px] text-accent">{p.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-6">No payments received yet.</p>
              )}
            </div>
          </motion.div>
        )}

        {/* Overview recent bookings */}
        {activeTab === 'overview' && (
          <motion.div variants={itemVariants} className="glass-card p-6">
            <h3 className="font-display text-xl text-foreground mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" /> Recent Bookings
            </h3>
            {bookings.length > 0 ? (
              <div className="space-y-3">
                {bookings.slice(0, 5).map(booking => (
                  <motion.div key={booking.id} whileHover={{ x: 4 }} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                    <div>
                      <p className="text-foreground font-medium">{new Date(booking.booking_date).toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground">{booking.start_time} - {booking.end_time} • {booking.session_type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-primary font-medium">₹{booking.payment_amount}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        booking.status === 'active' ? 'bg-primary/10 text-primary' :
                        booking.status === 'completed' ? 'bg-accent/10 text-accent' : 'bg-destructive/10 text-destructive'
                      }`}>{booking.status}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No bookings yet.</p>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
