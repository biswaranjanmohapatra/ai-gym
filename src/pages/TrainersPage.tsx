import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Star, Clock, Award, Calendar, X, Loader2, CheckCircle, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import CouponSystem from '@/components/trainers/CouponSystem';

interface Trainer {
  id?: string;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  reviews: number;
  price: number;
  emoji: string;
  bio: string;
  certifications: string[];
  specializations: string[];
  availability: string[];
}

const demoTrainers: Trainer[] = [
  { name: 'Rahul', specialty: 'Strength & HIIT', experience: '12 years', rating: 4.9, reviews: 284, price: 799, emoji: '💪',
    bio: 'Certified strength coach with over a decade of experience transforming bodies. Specializes in powerlifting and HIIT circuits.',
    certifications: ['NSCA-CSCS', 'ACE Certified', 'CrossFit L2'], specializations: ['Weight Loss', 'Muscle Gain', 'Strength'],
    availability: ['Mon-Fri: 6AM-12PM', 'Sat: 8AM-2PM'] },
  { name: 'Biswa', specialty: 'Yoga & Flexibility', experience: '8 years', rating: 4.8, reviews: 192, price: 599, emoji: '🧘',
    bio: 'Hatha and Vinyasa yoga instructor focused on mind-body balance.',
    certifications: ['RYT-500', 'Yoga Alliance', 'Sports Mobility Cert'], specializations: ['Yoga', 'Flexibility', 'Recovery'],
    availability: ['Mon-Sat: 5AM-10AM', 'Mon-Fri: 5PM-8PM'] },
  { name: 'Muskan Padhan', specialty: 'Nutrition & CrossFit', experience: '10 years', rating: 4.9, reviews: 347, price: 899, emoji: '🏋️',
    bio: 'Nutrition expert and CrossFit coach who combines dietary planning with high-intensity training.',
    certifications: ['Precision Nutrition L2', 'CrossFit L3', 'ISSA CPT'], specializations: ['CrossFit', 'Nutrition', 'Cardio'],
    availability: ['Mon-Fri: 7AM-3PM', 'Sun: 9AM-1PM'] },
  { name: 'Arjun', specialty: 'Bodybuilding & Posing', experience: '15 years', rating: 4.7, reviews: 156, price: 999, emoji: '🏆',
    bio: 'Former competitive bodybuilder with 15 years of coaching.',
    certifications: ['IFBB Pro Card', 'NASM-CPT', 'Sports Nutrition'], specializations: ['Bodybuilding', 'Competition Prep', 'Muscle Gain'],
    availability: ['Mon-Sat: 8AM-6PM'] },
  { name: 'Priya', specialty: 'Cardio & Dance Fitness', experience: '6 years', rating: 4.8, reviews: 211, price: 499, emoji: '💃',
    bio: 'Energetic dance fitness instructor who makes cardio fun.',
    certifications: ['Zumba Licensed', 'ACE GFI', 'First Aid CPR'], specializations: ['Cardio', 'Dance Fitness', 'Weight Loss'],
    availability: ['Mon-Fri: 4PM-9PM', 'Sat-Sun: 7AM-12PM'] },
  { name: 'Vikram', specialty: 'Martial Arts & Combat', experience: '14 years', rating: 4.9, reviews: 189, price: 849, emoji: '🥊',
    bio: 'Black belt martial artist and combat fitness coach.',
    certifications: ['Black Belt 3rd Dan', 'Krav Maga Instructor', 'NASM-CPT'], specializations: ['Martial Arts', 'Self-Defense', 'Strength'],
    availability: ['Mon-Sat: 6AM-2PM'] },
];

export default function TrainersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trainers, setTrainers] = useState<Trainer[]>(demoTrainers);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [bookingState, setBookingState] = useState<'idle' | 'booking' | 'processing' | 'success'>('idle');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [sessionType, setSessionType] = useState<'online' | 'offline'>('offline');
  const [finalPrice, setFinalPrice] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState('');

  useEffect(() => {
    if (selectedTrainer) setFinalPrice(selectedTrainer.price);
  }, [selectedTrainer]);

  useEffect(() => {
    const loadTrainers = async () => {
      // Try to seed demo trainers if missing (silently ignore permission errors)
      try {
        const { data: existing } = await supabase
          .from('trainer_profiles')
          .select('name')
          .in('name', demoTrainers.map(t => t.name));

        const existingNames = new Set((existing || []).map(t => t.name));
        const missing = demoTrainers.filter(t => !existingNames.has(t.name));

        if (missing.length > 0) {
          await supabase.from('trainer_profiles').insert(
            missing.map(t => ({
              user_id: crypto.randomUUID(),
              name: t.name,
              specialty: t.specialty,
              experience: t.experience,
              price_per_session: t.price,
              rating: t.rating,
              reviews_count: t.reviews,
              emoji: t.emoji,
              bio: t.bio,
              certifications: t.certifications,
              specializations: t.specializations,
              availability: t.availability,
              is_active: true,
            })),
          );
        }
      } catch {
        // no-op
      }

      const { data } = await supabase
        .from('trainer_profiles')
        .select('*')
        .eq('is_active', true);

      if (data && data.length > 0) {
        setTrainers(
          data.map((t) => ({
            id: t.id,
            name: t.name,
            specialty: t.specialty || 'Fitness Coach',
            experience: t.experience || 'N/A',
            rating: t.rating || 4.7,
            reviews: t.reviews_count || 0,
            price: t.price_per_session || 499,
            emoji: t.emoji || '💪',
            bio: t.bio || 'Elite trainer profile',
            certifications: t.certifications || [],
            specializations: t.specializations || [],
            availability: t.availability || [],
          })),
        );
      }
    };

    loadTrainers();
  }, []);

  const handleBook = async () => {
    if (!selectedDate || !selectedTime) { toast.error('Please select date and time'); return; }
    if (!user) { toast.error('Please sign in to book'); navigate('/user-login'); return; }
    if (!selectedTrainer) { toast.error('Please select a trainer'); return; }

    setBookingState('processing');

    try {
      // Deduct coupon points if needed
      if (appliedCoupon === 'REWARD15' || appliedCoupon === 'PREMIUM25') {
        const cost = appliedCoupon === 'REWARD15' ? 150 : 300;
        await supabase.from('reward_points').insert({
          user_id: user.id, points: -cost, reason: `Coupon redeemed: ${appliedCoupon}`,
        });
      }

      const trainerId = selectedTrainer.id || selectedTrainer.name;

      // Create booking in Supabase (trainer_bookings used as bookings store)
      const { error: bookingError } = await supabase.from('trainer_bookings').insert({
        user_id: user.id,
        trainer_id: trainerId,
        booking_date: selectedDate,
        start_time: selectedTime,
        end_time: selectedTime,
        session_type: sessionType,
        status: 'pending',
        payment_amount: finalPrice,
        payment_status: 'pending',
      });

      if (bookingError) {
        console.error(bookingError);
        toast.error('Failed to create booking. Please try again.');
        setBookingState('idle');
        return;
      }

      setBookingState('success');
      toast.success('Session booked successfully! 🎉');
      setTimeout(() => {
        setBookingState('idle');
        setSelectedTrainer(null);
        setSelectedDate('');
        setSelectedTime('');
        setAppliedCoupon('');
      }, 2500);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Something went wrong while booking.');
      setBookingState('idle');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <p className="text-primary tracking-widest uppercase text-sm mb-2">Personal Trainers</p>
          <h1 className="font-display text-5xl md:text-6xl text-foreground mb-4">Find Your Coach</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">Browse expert trainers, view profiles, and book sessions.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {trainers.map((trainer, i) => (
            <motion.div key={trainer.name} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }} className="glass-card overflow-hidden cursor-pointer group" onClick={() => setSelectedTrainer(trainer)}>
              <div className="h-40 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <motion.div whileHover={{ scale: 1.1 }}
                  className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center text-4xl">
                  {trainer.emoji}
                </motion.div>
              </div>
              <div className="p-5">
                <h3 className="font-display text-xl text-foreground">{trainer.name}</h3>
                <p className="text-primary text-sm mb-2">{trainer.specialty}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {trainer.specializations.map(s => (
                    <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{s}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Star className="h-3.5 w-3.5 text-primary fill-primary" /> {trainer.rating} ({trainer.reviews})
                  </span>
                  <span className="text-primary font-medium">₹{trainer.price}/session</span>
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <Award className="h-3 w-3" /> {trainer.experience}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Trainer Detail + Booking Modal */}
      <AnimatePresence>
        {selectedTrainer && bookingState === 'idle' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
            onClick={() => setSelectedTrainer(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center text-3xl">
                    {selectedTrainer.emoji}
                  </div>
                  <div>
                    <h3 className="font-display text-2xl text-foreground">{selectedTrainer.name}</h3>
                    <p className="text-primary text-sm">{selectedTrainer.specialty}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Star className="h-3 w-3 text-primary fill-primary" />
                      <span className="text-xs text-muted-foreground">{selectedTrainer.rating} ({selectedTrainer.reviews} reviews)</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedTrainer(null)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
              </div>

              <p className="text-muted-foreground text-sm mb-4">{selectedTrainer.bio}</p>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Certifications</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTrainer.certifications.map(c => (
                      <span key={c} className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">{c}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Availability</h4>
                  {selectedTrainer.availability.map(a => (
                    <p key={a} className="text-sm text-foreground flex items-center gap-2"><Clock className="h-3 w-3 text-primary" /> {a}</p>
                  ))}
                </div>

                <div>
                  <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Book a Session</h4>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="rounded-lg bg-secondary border border-border/50 px-3 py-2 text-sm text-foreground" />
                    <select value={selectedTime} onChange={e => setSelectedTime(e.target.value)} className="rounded-lg bg-secondary border border-border/50 px-3 py-2 text-sm text-foreground">
                      <option value="">Select Time</option>
                      {['6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '4:00 PM', '5:00 PM', '6:00 PM'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2 mb-4">
                    {(['offline', 'online'] as const).map(type => (
                      <button key={type} onClick={() => setSessionType(type)}
                        className={`flex-1 py-2 rounded-lg text-sm capitalize transition-colors ${
                          sessionType === type ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-secondary text-muted-foreground'
                        }`}>{type}</button>
                    ))}
                  </div>
                </div>

                {/* Coupon System */}
                <CouponSystem
                  originalPrice={selectedTrainer.price}
                  onDiscountApplied={(price, code) => { setFinalPrice(price); setAppliedCoupon(code); }}
                />

                {/* Price */}
                {!appliedCoupon && (
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-muted-foreground text-sm">Session Price:</span>
                    <span className="font-display text-2xl text-primary">₹{selectedTrainer.price}</span>
                  </div>
                )}

                <Button onClick={handleBook} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-5">
                  <Calendar className="h-4 w-4 mr-2" /> Book {sessionType} Session — ₹{finalPrice}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {bookingState !== 'idle' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="glass-card p-10 text-center max-w-sm">
              {bookingState === 'processing' ? (
                <>
                  <Loader2 className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" />
                  <h3 className="font-display text-2xl text-foreground mb-2">Booking Session</h3>
                  <p className="text-muted-foreground text-sm">Processing your booking...</p>
                </>
              ) : (
                <>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }}>
                    <CheckCircle className="h-20 w-20 text-primary mx-auto mb-4" />
                  </motion.div>
                  <h3 className="font-display text-3xl text-foreground mb-2">Session Booked!</h3>
                  <p className="text-muted-foreground text-sm">Your training session has been confirmed.</p>
                  {appliedCoupon && <p className="text-xs text-primary mt-2">Coupon {appliedCoupon} applied ✓</p>}
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <Footer />
    </div>
  );
}
