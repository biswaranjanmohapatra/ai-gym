import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { fetchApi } from '@/lib/api';
import { Star, Clock, Award, Calendar, X, Loader2, CheckCircle, IndianRupee, Dumbbell, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';

interface Trainer {
  id: string;
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
  is_active: boolean;
}

// Static demo trainer fallback (shown when DB is empty or unreachable)
const staticDemoTrainers: Omit<Trainer, 'id'>[] = [
  {
    name: 'Rahul', specialty: 'Strength & HIIT', experience: '12 years', rating: 4.9, reviews: 284, price: 500,
    emoji: '💪', bio: 'Certified strength coach with over a decade of experience transforming bodies.',
    certifications: ['NSCA-CSCS', 'ACE Certified', 'CrossFit L2'], specializations: ['Weight Loss', 'Muscle Gain', 'Strength'],
    availability: ['Mon-Fri: 6AM-12PM', 'Sat: 8AM-2PM'], is_active: true,
  },
  {
    name: 'Muskan', specialty: 'Yoga & Flexibility', experience: '8 years', rating: 4.8, reviews: 192, price: 400,
    emoji: '🧘', bio: 'Hatha and Vinyasa yoga instructor focused on mind-body balance.',
    certifications: ['RYT-500', 'Yoga Alliance'], specializations: ['Yoga', 'Flexibility', 'Recovery'],
    availability: ['Mon-Sat: 5AM-10AM'], is_active: true,
  },
  {
    name: 'Arjun', specialty: 'CrossFit & Nutrition', experience: '10 years', rating: 4.9, reviews: 347, price: 700,
    emoji: '🏋️', bio: 'Nutrition expert and CrossFit coach combining dietary planning with HIIT.',
    certifications: ['Precision Nutrition L2', 'CrossFit L3'], specializations: ['CrossFit', 'Nutrition', 'Cardio'],
    availability: ['Mon-Fri: 7AM-3PM'], is_active: true,
  },
  {
    name: 'Priya', specialty: 'Cardio & Dance Fitness', experience: '6 years', rating: 4.8, reviews: 211, price: 450,
    emoji: '💃', bio: 'Energetic dance fitness instructor who makes cardio fun and effective.',
    certifications: ['Zumba Licensed', 'ACE GFI'], specializations: ['Cardio', 'Dance Fitness', 'Weight Loss'],
    availability: ['Mon-Fri: 4PM-9PM', 'Sat-Sun: 7AM-12PM'], is_active: true,
  },
  {
    name: 'Vikram', specialty: 'Bodybuilding & Posing', experience: '15 years', rating: 4.7, reviews: 156, price: 800,
    emoji: '🏆', bio: 'Former competitive bodybuilder with 15 years of elite coaching experience.',
    certifications: ['IFBB Pro Card', 'NASM-CPT'], specializations: ['Bodybuilding', 'Competition Prep', 'Muscle Gain'],
    availability: ['Mon-Sat: 8AM-6PM'], is_active: true,
  },
];

export default function TrainersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [bookingState, setBookingState] = useState<'idle' | 'processing' | 'success'>('idle');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [sessionType, setSessionType] = useState<'online' | 'offline'>('offline');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTrainers();
  }, []);

  const loadTrainers = async () => {
    setLoading(true);
    try {
      const data = await fetchApi('/trainers');
      if (data && data.length > 0) {
        setTrainers(
          data.map((t: any) => ({
            id: t.id,
            name: t.name,
            specialty: t.specialty || 'Fitness Coach',
            experience: t.experience || 'N/A',
            rating: t.rating || 4.7,
            reviews: t.reviewsCount || 0, // Prisma camelCase
            price: t.pricePerSession || 500, // Prisma camelCase
            emoji: t.emoji || '💪',
            bio: t.bio || 'Elite certified trainer.',
            certifications: t.certifications || [],
            specializations: t.specializations || [],
            availability: t.availability || [],
            is_active: t.isActive, // Prisma camelCase
          }))
        );
      } else {
        setTrainers(staticDemoTrainers.map((t, i) => ({ ...t, id: `demo-${i}` })));
      }
    } catch {
      setTrainers(staticDemoTrainers.map((t, i) => ({ ...t, id: `demo-${i}` })));
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    if (!user) {
      toast.error('Please sign in to book a session');
      navigate('/user-login');
      return;
    }
    if (!selectedTrainer) return;
    if (!selectedDate) { toast.error('Please select a date'); return; }
    if (!selectedTime) { toast.error('Please select a time'); return; }
    if (selectedTrainer.id.startsWith('demo-')) {
      toast.error('This is a demo trainer. Real trainers can register via Trainer Login.');
      return;
    }

    setBookingState('processing');

    try {
      await fetchApi('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          trainerId: selectedTrainer.id,
          bookingDate: selectedDate,
          startTime: selectedTime,
          endTime: selectedTime,
          sessionType,
        }),
      });

      setBookingState('success');
      toast.success('Session booked! Awaiting trainer confirmation.');
      setTimeout(() => {
        setBookingState('idle');
        setSelectedTrainer(null);
        setSelectedDate('');
        setSelectedTime('');
      }, 2500);
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
      setBookingState('idle');
    }
  };

  const filteredTrainers = trainers.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.specializations.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Dumbbell className="h-4 w-4 text-primary" />
            <span className="text-primary text-sm font-medium">Expert Trainers</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">Find Your Coach</h1>
          <p className="text-muted-foreground max-w-lg mx-auto mb-6">
            Browse certified trainers, view their specialties and pricing, then book a session.
          </p>
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, specialty..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary/50 border-border/30"
            />
          </div>
        </motion.div>

        {/* Trainer Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
          </div>
        ) : filteredTrainers.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No trainers found matching "{searchQuery}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {filteredTrainers.map((trainer, i) => (
              <motion.div
                key={trainer.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="bg-secondary/20 border border-border/30 rounded-2xl overflow-hidden cursor-pointer group hover:border-primary/40 hover:shadow-[0_8px_32px_hsl(142_72%_50%/0.1)] transition-all duration-300"
                onClick={() => setSelectedTrainer(trainer)}
              >
                {/* Card Header */}
                <div className="h-36 bg-gradient-to-br from-primary/15 via-secondary/30 to-accent/10 flex items-center justify-center relative">
                  <motion.div
                    whileHover={{ scale: 1.15 }}
                    className="w-20 h-20 rounded-full bg-background/40 border-2 border-primary/30 flex items-center justify-center text-4xl shadow-lg"
                  >
                    {trainer.emoji}
                  </motion.div>
                  {trainer.id.startsWith('demo-') && (
                    <span className="absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                      Demo
                    </span>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-xl text-foreground mb-1">{trainer.name}</h3>
                  <p className="text-primary text-sm mb-3">{trainer.specialty}</p>

                  {trainer.specializations.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {trainer.specializations.slice(0, 3).map(s => (
                        <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                      <span className="text-foreground font-medium">{trainer.rating}</span>
                      <span>({trainer.reviews})</span>
                    </span>
                    <span className="flex items-center gap-0.5 text-primary font-bold text-base">
                      <IndianRupee className="h-4 w-4" />
                      {trainer.price.toLocaleString()}
                      <span className="text-xs font-normal text-muted-foreground">/session</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                    <Award className="h-3.5 w-3.5" />
                    {trainer.experience} experience
                  </div>

                  <Button
                    className="w-full bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-primary-foreground transition-all"
                    onClick={e => { e.stopPropagation(); setSelectedTrainer(trainer); }}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Now
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {selectedTrainer && bookingState === 'idle' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setSelectedTrainer(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-background border border-border/40 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Trainer Header */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-3xl">
                    {selectedTrainer.emoji}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-foreground">{selectedTrainer.name}</h3>
                    <p className="text-primary text-sm">{selectedTrainer.specialty}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs text-muted-foreground">{selectedTrainer.rating} ({selectedTrainer.reviews} reviews)</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedTrainer(null)} className="text-muted-foreground hover:text-foreground p-1">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-muted-foreground text-sm mb-5 leading-relaxed">{selectedTrainer.bio}</p>

              {/* Certifications */}
              {selectedTrainer.certifications.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-medium">Certifications</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTrainer.certifications.map(c => (
                      <span key={c} className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">{c}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Availability */}
              {selectedTrainer.availability.length > 0 && (
                <div className="mb-5">
                  <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-medium">Availability</h4>
                  {selectedTrainer.availability.map(a => (
                    <p key={a} className="text-sm text-foreground flex items-center gap-2 mb-1">
                      <Clock className="h-3 w-3 text-primary" /> {a}
                    </p>
                  ))}
                </div>
              )}

              {/* Booking Form */}
              <div className="border-t border-border/30 pt-5">
                <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-medium">Book a Session</h4>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={e => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full rounded-lg bg-secondary/50 border border-border/40 px-3 py-2 text-sm text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Time</label>
                    <select
                      value={selectedTime}
                      onChange={e => setSelectedTime(e.target.value)}
                      className="w-full rounded-lg bg-secondary/50 border border-border/40 px-3 py-2 text-sm text-foreground"
                    >
                      <option value="">Select Time</option>
                      {['6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 mb-5">
                  {(['offline', 'online'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setSessionType(type)}
                      className={`flex-1 py-2 rounded-lg text-sm capitalize font-medium transition-all ${
                        sessionType === type
                          ? 'bg-primary text-primary-foreground shadow-[0_0_15px_hsl(142_72%_50%/0.3)]'
                          : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {/* Price Summary */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/20 mb-4">
                  <span className="text-sm text-muted-foreground">Session Price ({sessionType})</span>
                  <span className="font-bold text-xl text-primary flex items-center gap-1">
                    <IndianRupee className="h-5 w-5" />
                    {selectedTrainer.price.toLocaleString()}
                  </span>
                </div>

                <Button
                  onClick={handleBook}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6 font-semibold text-base"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Confirm Booking — ₹{selectedTrainer.price.toLocaleString()}
                </Button>

                {!user && (
                  <p className="text-center text-xs text-muted-foreground mt-2">
                    You need to <button onClick={() => navigate('/user-login')} className="text-primary underline">sign in</button> to book
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Processing/Success State */}
        {bookingState !== 'idle' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="bg-background border border-border/40 rounded-2xl p-10 text-center max-w-sm shadow-2xl"
            >
              {bookingState === 'processing' ? (
                <>
                  <Loader2 className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" />
                  <h3 className="font-bold text-2xl text-foreground mb-2">Processing Booking</h3>
                  <p className="text-muted-foreground text-sm">Please wait...</p>
                </>
              ) : (
                <>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }}>
                    <CheckCircle className="h-20 w-20 text-primary mx-auto mb-4" />
                  </motion.div>
                  <h3 className="font-bold text-3xl text-foreground mb-2">Booking Sent! 🎉</h3>
                  <p className="text-muted-foreground text-sm">Your session request has been sent to the trainer. They will confirm shortly.</p>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
