import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { fetchApi } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Check, Zap, Crown, Star, Loader2, IndianRupee } from 'lucide-react';

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    priceLabel: '₹199 / month',
    priceValue: 199,
    icon: Star,
    color: 'text-muted-foreground',
    borderColor: 'border-border/40',
    bgColor: 'bg-secondary/20',
    buttonStyle: 'bg-secondary text-foreground hover:bg-secondary/80',
    description: 'Perfect to explore EVO Fitness and track your basic workouts.',
    features: [
      'Access to trainer profiles',
      'Basic workout tracking',
      'Community access',
      '1 trainer booking/month',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    priceLabel: '₹499 / month',
    priceValue: 499,
    icon: Zap,
    color: 'text-primary',
    borderColor: 'border-primary/40',
    bgColor: 'bg-primary/5',
    buttonStyle: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_hsl(142_72%_50%/0.3)]',
    badge: 'Most Popular',
    description: 'Unlock advanced workouts, analytics, and unlimited trainer bookings.',
    features: [
      'Everything in Basic',
      'Unlimited trainer bookings',
      'Advanced workout plans',
      'Diet & nutrition tracking',
      'Priority support',
    ],
  },
  {
    id: 'elite',
    name: 'Elite',
    priceLabel: '₹999 / month',
    priceValue: 999,
    icon: Crown,
    color: 'text-yellow-400',
    borderColor: 'border-yellow-400/40',
    bgColor: 'bg-yellow-400/5',
    buttonStyle: 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-[0_0_20px_hsl(45_100%_50%/0.3)] font-bold',
    description: 'Everything in Pro plus priority trainer access and exclusive programs.',
    features: [
      'Everything in Pro',
      'Priority trainer access',
      'Exclusive training programs',
      'Monthly 1-on-1 consultation',
      'Dedicated support',
      'Custom meal plans',
    ],
  },
];

export default function SubscriptionsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubscribe = async (plan: typeof plans[0]) => {
    if (!user) {
      toast.error('Please sign in first');
      navigate('/user-login');
      return;
    }

    setLoadingPlan(plan.id);
    setSuccess(null);

    const safetyTimer = setTimeout(() => {
      setLoadingPlan(null);
      toast.error('Request timed out. Please try again.');
    }, 10000);

    try {
      await fetchApi('/subscriptions', {
        method: 'POST',
        body: JSON.stringify({
          plan: plan.name,
          price: plan.priceValue,
        }),
      });

      clearTimeout(safetyTimer);

      // Insert payment record (best effort)
      fetchApi('/payments', {
        method: 'POST',
        body: JSON.stringify({
          amount: plan.priceValue,
          status: 'paid',
          type: 'subscription',
        }),
      }).catch(err => console.warn('Payment record insert failed:', err.message));

      setLoadingPlan(null);
      setSuccess(plan.id);
      toast.success(`🎉 ${plan.name} plan activated!`);
      setTimeout(() => {
        setSuccess(null);
        navigate('/payment-history');
      }, 2000);
    } catch (err: any) {
      clearTimeout(safetyTimer);
      setLoadingPlan(null);
      toast.error(err.message || 'Something went wrong. Please try again.');
    }
  };


  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Crown className="h-4 w-4 text-primary" />
            <span className="text-primary text-sm font-medium">Subscription Plans</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
            Choose Your Plan
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Unlock your fitness potential with the right plan. All plans include access to our world-class trainers.
          </p>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          {plans.map((plan, i) => {
            const PlanIcon = plan.icon;
            const isLoading = loadingPlan === plan.id;
            const isSuccess = success === plan.id;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className={`relative rounded-2xl border p-6 flex flex-col transition-all duration-300 ${plan.bgColor} ${plan.borderColor} hover:shadow-[0_8px_32px_hsl(0_0%_0%/0.2)]`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary text-primary-foreground shadow-[0_0_15px_hsl(142_72%_50%/0.4)]">
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-current/10 border flex items-center justify-center ${plan.color}`}
                    style={{ borderColor: 'currentColor', opacity: 1 }}>
                    <PlanIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-xl text-foreground">{plan.name}</h2>
                    <p className={`text-lg font-semibold ${plan.color}`}>{plan.priceLabel}</p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{plan.description}</p>

                {/* Features */}
                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map(feature => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-current/10 ${plan.color}`}>
                        <Check className="h-3 w-3" />
                      </div>
                      <span className="text-foreground/80">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Price Display */}
                {plan.priceValue > 0 && (
                  <div className="flex items-center gap-1 mb-4 justify-center">
                    <IndianRupee className={`h-5 w-5 ${plan.color}`} />
                    <span className={`text-3xl font-black ${plan.color}`}>{plan.priceValue.toLocaleString()}</span>
                    <span className="text-muted-foreground text-sm">/month</span>
                  </div>
                )}

                {/* CTA Button */}
                <Button
                  className={`w-full py-5 text-base font-semibold transition-all duration-300 ${plan.buttonStyle}`}
                  onClick={() => handleSubscribe(plan)}
                  disabled={isLoading || isSuccess}
                >
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : isSuccess ? (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-2"
                      >
                        <Check className="h-5 w-5" />
                        Activated!
                      </motion.span>
                    ) : (
                      <span>
                        {`Subscribe to ${plan.name}`}
                      </span>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          All plans include a 7-day free trial. Cancel anytime.
        </p>
      </div>
    </div>
  );
}
