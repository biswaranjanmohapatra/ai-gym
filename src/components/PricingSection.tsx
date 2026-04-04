import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, CheckCircle, X, Star, Zap, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    description: 'Get started with basic features',
    icon: Star,
    iconColor: 'text-muted-foreground',
    iconBg: 'bg-secondary border-border/40',
    features: ['Basic workout plans', 'BMI calculator', 'Progress tracking', 'Community access'],
    popular: false,
    amount: 0,
    buttonStyle: 'bg-secondary/80 text-foreground hover:bg-secondary border border-border/40',
    buttonLabel: 'Get Started',
    cardStyle: 'bg-card/60 border-border/30',
  },
  {
    name: 'Pro',
    price: '₹499',
    period: '/month',
    description: 'Everything you need to transform',
    icon: Zap,
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10 border-primary/30',
    features: ['AI Fitness Guide', 'Custom diet plans', 'Advanced analytics', 'Weekly schedules', 'Priority support', 'All workout plans'],
    popular: true,
    amount: 499,
    buttonStyle: 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_25px_hsl(142_72%_50%/0.4)]',
    buttonLabel: 'Pay Now',
    cardStyle: 'bg-card/80 border-primary/40 shadow-[0_0_30px_hsl(142_72%_50%/0.1)]',
  },
  {
    name: 'Elite',
    price: '₹1,299',
    period: '/month',
    description: 'For serious athletes',
    icon: Crown,
    iconColor: 'text-yellow-400',
    iconBg: 'bg-yellow-400/10 border-yellow-400/30',
    features: ['Everything in Pro', '1-on-1 trainer access', 'Video consultations', 'Custom meal prep', 'Competition prep', 'Unlimited AI queries'],
    popular: false,
    amount: 1299,
    buttonStyle: 'bg-secondary/80 text-foreground hover:bg-secondary border border-border/40',
    buttonLabel: 'Pay Now',
    cardStyle: 'bg-card/60 border-border/30',
  },
];

function ConfettiEffect() {
  const colors = ['hsl(142 72% 50%)', 'hsl(174 72% 50%)', 'hsl(48 96% 53%)', 'hsl(0 84% 60%)'];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-sm"
          style={{ backgroundColor: colors[i % colors.length], left: `${Math.random() * 100}%`, top: '-10px' }}
          animate={{ y: [0, 400], rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)], opacity: [1, 0] }}
          transition={{ duration: 1.5 + Math.random(), delay: Math.random() * 0.5, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

export default function PricingSection() {
  const [paymentState, setPaymentState] = useState<'idle' | 'processing' | 'success'>('idle');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const navigate = useNavigate();

  const handlePayment = (plan: typeof plans[0]) => {
    if (plan.amount === 0) {
      navigate('/user-login?mode=signup');
      return;
    }
    // Redirect logged-in users to subscriptions page, others to login
    navigate('/subscriptions');
  };

  return (
    <section className="py-24 relative" id="pricing">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-primary tracking-widest uppercase text-sm font-medium mb-3">Pricing</p>
          <h2 className="font-display text-5xl md:text-6xl text-foreground font-black uppercase tracking-tight">
            Choose Your Plan
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
          {plans.map((plan, i) => {
            const PlanIcon = plan.icon;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                whileHover={{ y: plan.popular ? -4 : -2 }}
                className={`relative rounded-2xl border p-7 flex flex-col transition-all duration-300 ${plan.cardStyle} ${plan.popular ? 'mt-0 md:-mt-2' : 'mt-2'}`}
              >
                {/* MOST POPULAR badge */}
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                    <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-primary text-primary-foreground uppercase tracking-wider shadow-[0_0_20px_hsl(142_72%_50%/0.5)]">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${plan.iconBg}`}>
                    <PlanIcon className={`h-5 w-5 ${plan.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-foreground uppercase tracking-wide leading-tight">
                      {plan.name}
                    </h3>
                    <p className={`text-base font-bold leading-tight ${plan.popular ? 'text-primary' : plan.name === 'Elite' ? 'text-yellow-400' : 'text-muted-foreground'}`}>
                      {plan.price}{plan.period && <span className="text-sm font-normal text-muted-foreground"> / month</span>}
                    </p>
                  </div>
                </div>

                <p className="text-muted-foreground text-sm mb-5 leading-relaxed">{plan.description}</p>

                {/* Features */}
                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-sm text-foreground/80">
                      <Check className={`h-4 w-4 flex-shrink-0 ${plan.popular ? 'text-primary' : plan.name === 'Elite' ? 'text-yellow-400' : 'text-muted-foreground'}`} />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* Price display */}
                {plan.amount > 0 && (
                  <div className="flex items-baseline gap-1 mb-5">
                    <span className="text-muted-foreground text-lg">₹</span>
                    <span className={`font-black text-4xl ${plan.popular ? 'text-primary' : 'text-yellow-400'}`}>
                      {plan.amount.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground text-sm">/month</span>
                  </div>
                )}

                <Button
                  onClick={() => handlePayment(plan)}
                  className={`w-full py-5 text-sm font-bold uppercase tracking-wider transition-all duration-300 ${plan.buttonStyle}`}
                >
                  {plan.buttonLabel}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Success Modal — kept for direct click simulation on homepage */}
      <AnimatePresence>
        {paymentState === 'success' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="glass-card p-10 text-center relative max-w-sm mx-4"
            >
              <ConfettiEffect />
              <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }} transition={{ duration: 0.5 }}>
                <CheckCircle className="h-20 w-20 text-primary mx-auto mb-4" />
              </motion.div>
              <h3 className="font-display text-3xl text-foreground mb-2">Payment Successful!</h3>
              <p className="text-muted-foreground text-sm mb-2">
                Your <span className="text-primary font-semibold">{selectedPlan} Premium</span> is now active.
              </p>
              <div className="inline-block mt-2 px-4 py-1 rounded-full bg-primary/20 border border-primary/40">
                <span className="text-primary text-sm font-semibold">⭐ Premium Badge Activated</span>
              </div>
              <button
                onClick={() => { setPaymentState('idle'); setSelectedPlan(null); }}
                className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
