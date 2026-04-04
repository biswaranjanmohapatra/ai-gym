import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Users, Calendar, IndianRupee, Clock, CheckCircle, XCircle, Award,
  Plus, Trash2, BarChart3, Loader2, AlertCircle, TrendingUp
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

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

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function TrainerDashboard() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [trainerProfile, setTrainerProfile] = useState<any>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'schedule' | 'earnings'>('overview');
  const [newSlot, setNewSlot] = useState({ day: 1, start: '09:00', end: '10:00' });
  const [sessionPrice, setSessionPrice] = useState<number>(500);
  const [loading, setLoading] = useState(true);
  const [updatingPrice, setUpdatingPrice] = useState(false);

  // Profile setup form (if no profile yet)
  const [setupName, setSetupName] = useState('');
  const [setupSpecialty, setSetupSpecialty] = useState('');
  const [setupExp, setSetupExp] = useState('1-3 years');
  const [setupBio, setSetupBio] = useState('');
  const [creatingProfile, setCreatingProfile] = useState(false);

  useEffect(() => {
    const tab = searchParams.get('tab') as any;
    if (['overview', 'bookings', 'schedule', 'earnings'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    await fetchTrainerProfile();
    setLoading(false);
  };

  const fetchTrainerProfile = async () => {
    const { data: tp } = await supabase
      .from('trainer_profiles')
      .select('*')
      .eq('user_id', user!.id)
      .maybeSingle();

    if (tp) {
      setTrainerProfile(tp);
      setSessionPrice(tp.price_per_session || 500);

      // Fetch bookings
      const { data: bk } = await supabase
        .from('trainer_bookings')
        .select('*')
        .eq('trainer_id', tp.id)
        .order('booking_date', { ascending: false });
      if (bk) setBookings(bk);

      // Fetch payments
      const { data: py } = await supabase
        .from('payments' as any)
        .select('*')
        .eq('trainer_id', tp.id)
        .order('date', { ascending: false });
      if (py) setPayments(py as any[]);

      // Fetch time slots
      const { data: ts } = await supabase
        .from('trainer_time_slots')
        .select('*')
        .eq('trainer_id', tp.id)
        .order('day_of_week');
      if (ts) setTimeSlots(ts);
    }
  };

  const createProfile = async () => {
    if (!setupName.trim()) { toast.error('Please enter your name'); return; }
    setCreatingProfile(true);
    try {
      const { error } = await supabase.from('trainer_profiles').insert({
        user_id: user!.id,
        name: setupName.trim(),
        specialty: setupSpecialty.trim() || 'Fitness Coach',
        experience: setupExp,
        bio: setupBio.trim() || `${setupName} — Professional fitness trainer.`,
        price_per_session: 500,
        is_active: true,
        certifications: [],
        specializations: [],
        availability: [],
        emoji: '💪',
      } as any);

      if (error) { toast.error('Failed to create profile: ' + error.message); return; }
      toast.success('Trainer profile created!');
      await fetchTrainerProfile();
    } finally {
      setCreatingProfile(false);
    }
  };

  const updateSessionPrice = async () => {
    if (!user || !trainerProfile) return;
    if (sessionPrice < 0) { toast.error('Price cannot be negative'); return; }
    setUpdatingPrice(true);
    const { error } = await supabase
      .from('trainer_profiles')
      .update({ price_per_session: sessionPrice } as any)
      .eq('user_id', user.id);
    setUpdatingPrice(false);
    if (error) { toast.error('Failed to update price'); return; }
    toast.success('Session price updated! Users will now see ₹' + sessionPrice.toLocaleString());
    fetchTrainerProfile();
  };

  const updateBookingStatus = async (booking: Booking, newStatus: 'approved' | 'cancelled') => {
    if (!trainerProfile) return;

    const { error } = await supabase
      .from('trainer_bookings')
      .update({
        status: newStatus,
        payment_status: newStatus === 'approved' ? 'paid' : 'cancelled',
      } as any)
      .eq('id', booking.id);

    if (error) { toast.error('Failed to update booking'); return; }

    // Insert payment record when approved
    if (newStatus === 'approved' && booking.payment_amount > 0) {
      await supabase.from('payments' as any).insert({
        user_id: booking.user_id,
        trainer_id: trainerProfile.id,
        amount: booking.payment_amount,
        date: new Date().toISOString(),
        status: 'paid',
        type: 'trainer',
      });
    }

    toast.success(`Booking ${newStatus === 'approved' ? 'approved ✓' : 'rejected ✗'}`);
    fetchTrainerProfile();
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

  // Stats
  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const approvedBookings = bookings.filter(b => b.status === 'approved' || b.status === 'active');
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const totalEarnings = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const uniqueClients = new Set(bookings.map(b => b.user_id)).size;

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: BarChart3 },
    { id: 'bookings' as const, label: `Bookings${pendingBookings.length > 0 ? ` (${pendingBookings.length})` : ''}`, icon: Calendar },
    { id: 'schedule' as const, label: 'Schedule', icon: Clock },
    { id: 'earnings' as const, label: 'Earnings', icon: IndianRupee },
  ];

  const setTab = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="container mx-auto px-4 pt-24 pb-12">

        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center gap-3 mb-7">
          <div className="w-10 h-10 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center">
            <Award className="h-5 w-5 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Trainer Dashboard</h1>
            <p className="text-muted-foreground text-sm">Manage bookings, schedule, and earnings</p>
          </div>
        </motion.div>

        {/* NO PROFILE STATE — Setup Form */}
        {!trainerProfile && (
          <motion.div variants={itemVariants} className="bg-yellow-400/5 border border-yellow-400/20 rounded-2xl p-8 mb-8 max-w-lg">
            <div className="flex items-center gap-3 mb-4">
              <Award className="h-6 w-6 text-yellow-400" />
              <h3 className="font-bold text-xl text-foreground">Set Up Your Trainer Profile</h3>
            </div>
            <p className="text-muted-foreground text-sm mb-5">
              Create your profile to start accepting bookings from users.
            </p>
            <div className="space-y-3">
              <Input
                placeholder="Your full name"
                value={setupName}
                onChange={e => setSetupName(e.target.value)}
                className="bg-secondary/50 border-border/30"
              />
              <Input
                placeholder="Specialty (e.g. Strength & HIIT)"
                value={setupSpecialty}
                onChange={e => setSetupSpecialty(e.target.value)}
                className="bg-secondary/50 border-border/30"
              />
              <select
                value={setupExp}
                onChange={e => setSetupExp(e.target.value)}
                className="w-full rounded-lg bg-secondary/50 border border-border/30 px-3 py-2 text-sm text-foreground"
              >
                <option value="1-3 years">1-3 years</option>
                <option value="3-5 years">3-5 years</option>
                <option value="5-10 years">5-10 years</option>
                <option value="10+ years">10+ years</option>
              </select>
              <textarea
                placeholder="Short bio (optional)"
                value={setupBio}
                onChange={e => setSetupBio(e.target.value)}
                className="w-full rounded-lg bg-secondary/50 border border-border/30 px-3 py-2 text-sm text-foreground resize-none"
                rows={3}
              />
              <Button
                onClick={createProfile}
                disabled={creatingProfile}
                className="w-full bg-yellow-500 text-black hover:bg-yellow-400 font-bold"
              >
                {creatingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create My Trainer Profile'}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          {[
            { icon: Users, label: 'Unique Clients', value: uniqueClients, color: 'text-primary' },
            { icon: Calendar, label: 'Pending', value: pendingBookings.length, color: 'text-yellow-400', highlight: pendingBookings.length > 0 },
            { icon: CheckCircle, label: 'Approved', value: approvedBookings.length, color: 'text-primary' },
            { icon: TrendingUp, label: 'Total Earned', value: `₹${totalEarnings.toLocaleString()}`, color: 'text-yellow-400' },
          ].map((stat, i) => (
            <motion.div key={i} whileHover={{ y: -2 }}
              className={`rounded-2xl p-5 border ${stat.highlight ? 'bg-yellow-400/10 border-yellow-400/30' : 'bg-secondary/20 border-border/30'}`}>
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <p className={`font-bold text-2xl ${stat.color}`}>{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs */}
        <motion.div variants={itemVariants} className="flex gap-2 mb-7 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow-[0_0_15px_hsl(142_72%_50%/0.3)]'
                  : 'bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary/70'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* ─── OVERVIEW TAB ─── */}
        {activeTab === 'overview' && trainerProfile && (
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Profile Card */}
            <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-16 h-16 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-3xl">
                  {trainerProfile.emoji || '💪'}
                </div>
                <div>
                  <h3 className="font-bold text-xl text-foreground flex items-center gap-2">
                    {trainerProfile.name}
                    <Award className="h-4 w-4 text-yellow-400" />
                  </h3>
                  <p className="text-sm text-muted-foreground">{trainerProfile.specialty}</p>
                  <p className="text-xs text-muted-foreground">{trainerProfile.experience} experience</p>
                </div>
              </div>

              {/* Price Update */}
              <div className="border-t border-yellow-400/20 pt-4">
                <p className="text-sm font-medium text-foreground mb-2">Session Price</p>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-bold">₹</span>
                    <Input
                      type="number"
                      value={sessionPrice}
                      onChange={e => setSessionPrice(Number(e.target.value))}
                      className="pl-7 max-w-[160px] bg-secondary/50 border-border/30"
                      min={0}
                    />
                  </div>
                  <Button onClick={updateSessionPrice} disabled={updatingPrice} className="bg-yellow-500 text-black hover:bg-yellow-400 font-bold">
                    {updatingPrice ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update Price'}
                  </Button>
                  <span className="text-xs text-muted-foreground">Current: ₹{trainerProfile.price_per_session?.toLocaleString()}/session</span>
                </div>
              </div>
            </div>

            {/* Pending Bookings Alert */}
            {pendingBookings.length > 0 && (
              <div className="bg-yellow-400/5 border border-yellow-400/30 rounded-2xl p-4 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                <p className="text-sm text-yellow-400">
                  You have <strong>{pendingBookings.length}</strong> pending booking{pendingBookings.length > 1 ? 's' : ''} awaiting your response.{' '}
                  <button onClick={() => setTab('bookings')} className="underline font-bold">Review now →</button>
                </p>
              </div>
            )}

            {/* Recent Bookings */}
            <div className="bg-secondary/20 border border-border/30 rounded-2xl p-6">
              <h3 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" /> Recent Bookings
              </h3>
              {bookings.length > 0 ? (
                <div className="space-y-3">
                  {bookings.slice(0, 5).map(booking => (
                    <div key={booking.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          {new Date(booking.booking_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        <p className="text-xs text-muted-foreground">{booking.start_time} • {booking.session_type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-primary font-bold text-sm">₹{booking.payment_amount?.toLocaleString()}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          booking.status === 'pending' ? 'bg-yellow-400/10 text-yellow-400' :
                          booking.status === 'approved' ? 'bg-primary/10 text-primary' :
                          booking.status === 'cancelled' ? 'bg-destructive/10 text-destructive' :
                          'bg-secondary text-muted-foreground'
                        }`}>{booking.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-6 text-sm">No bookings yet. Make sure your profile is active!</p>
              )}
            </div>
          </motion.div>
        )}

        {/* ─── BOOKINGS TAB ─── */}
        {activeTab === 'bookings' && (
          <motion.div variants={itemVariants} className="bg-secondary/20 border border-border/30 rounded-2xl p-6">
            <h3 className="font-bold text-xl text-foreground mb-5 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" /> All Bookings
            </h3>
            {bookings.length === 0 ? (
              <p className="text-muted-foreground text-center py-10 text-sm">No bookings yet.</p>
            ) : (
              <div className="space-y-3">
                {bookings.map(booking => (
                  <div key={booking.id}
                    className={`p-4 rounded-xl border transition-colors ${
                      booking.status === 'pending' ? 'bg-yellow-400/5 border-yellow-400/20' : 'bg-secondary/30 border-border/20'
                    }`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-foreground">
                            {new Date(booking.booking_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                          </p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            booking.status === 'pending' ? 'bg-yellow-400/15 text-yellow-400' :
                            booking.status === 'approved' ? 'bg-primary/10 text-primary' :
                            booking.status === 'cancelled' ? 'bg-destructive/10 text-destructive' :
                            'bg-secondary text-muted-foreground'
                          }`}>{booking.status}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{booking.start_time} • {booking.session_type}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">User ID: {booking.user_id.substring(0, 8)}...</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-primary">₹{booking.payment_amount?.toLocaleString()}</p>
                        {booking.status === 'pending' && (
                          <div className="flex gap-2 mt-2">
                            <Button
                              size="sm"
                              onClick={() => updateBookingStatus(booking, 'approved')}
                              className="bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-primary-foreground text-xs h-7"
                            >
                              <CheckCircle className="h-3.5 w-3.5 mr-1" /> Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateBookingStatus(booking, 'cancelled')}
                              className="text-destructive border-destructive/30 hover:bg-destructive hover:text-white text-xs h-7"
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ─── SCHEDULE TAB ─── */}
        {activeTab === 'schedule' && trainerProfile && (
          <motion.div variants={itemVariants} className="space-y-5">
            <div className="bg-secondary/20 border border-border/30 rounded-2xl p-6">
              <h3 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" /> Add Time Slot
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <select
                  value={newSlot.day}
                  onChange={e => setNewSlot({ ...newSlot, day: +e.target.value })}
                  className="rounded-xl bg-secondary/50 border border-border/30 px-3 py-2.5 text-sm text-foreground"
                >
                  {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                </select>
                <Input type="time" value={newSlot.start} onChange={e => setNewSlot({ ...newSlot, start: e.target.value })} className="bg-secondary/50 border-border/30" />
                <Input type="time" value={newSlot.end} onChange={e => setNewSlot({ ...newSlot, end: e.target.value })} className="bg-secondary/50 border-border/30" />
                <Button onClick={addTimeSlot} className="bg-primary text-primary-foreground">
                  <Plus className="h-4 w-4 mr-1" /> Add Slot
                </Button>
              </div>
            </div>

            <div className="bg-secondary/20 border border-border/30 rounded-2xl p-6">
              <h3 className="font-bold text-lg text-foreground mb-4">Your Time Slots</h3>
              {timeSlots.length > 0 ? (
                <div className="space-y-2">
                  {timeSlots.map(slot => (
                    <div key={slot.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-primary font-bold w-24">{DAYS[slot.day_of_week]}</span>
                        <span className="text-sm text-foreground">{slot.start_time} – {slot.end_time}</span>
                      </div>
                      <button onClick={() => removeTimeSlot(slot.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-6 text-sm">No time slots configured. Add some above.</p>
              )}
            </div>
          </motion.div>
        )}

        {/* ─── EARNINGS TAB ─── */}
        {activeTab === 'earnings' && (
          <motion.div variants={itemVariants} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Total Earned', value: `₹${totalEarnings.toLocaleString()}`, color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' },
                { label: 'Total Sessions', value: bookings.length, color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
                { label: 'Avg Per Session', value: `₹${bookings.length > 0 ? Math.round(totalEarnings / Math.max(payments.length, 1)).toLocaleString() : 0}`, color: 'text-foreground', bg: 'bg-secondary/30 border-border/30' },
              ].map((stat, i) => (
                <div key={i} className={`rounded-2xl border p-6 text-center ${stat.bg}`}>
                  <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                  <p className={`font-black text-3xl ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-secondary/20 border border-border/30 rounded-2xl p-6">
              <h3 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" /> Payment History
              </h3>
              {payments.length > 0 ? (
                <div className="space-y-3">
                  {payments.map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
                      <div>
                        <p className="text-sm font-medium text-foreground">Session Earned</p>
                        <p className="text-xs text-muted-foreground">{new Date(p.date).toLocaleDateString('en-IN')}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">₹{p.amount?.toLocaleString()}</p>
                        <span className="text-[10px] text-green-400">{p.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-6 text-sm">No earnings yet. Accept bookings to start earning!</p>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
