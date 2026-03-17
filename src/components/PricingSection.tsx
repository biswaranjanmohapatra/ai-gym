import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    description: 'Get started with basic features',
    features: ['Basic workout plans', 'BMI calculator', 'Progress tracking', 'Community access'],
    popular: false,
    amount: 0,
  },
  {
    name: 'Pro',
    price: '₹499',
    period: '/month',
    description: 'Everything you need to transform',
    features: ['AI Fitness Guide', 'Custom diet plans', 'Advanced analytics', 'Weekly schedules', 'Priority support', 'All workout plans'],
    popular: true,
    amount: 499,
  },
  {
    name: 'Elite',
    price: '₹1,299',
    period: '/month',
    description: 'For serious athletes',
    features: ['Everything in Pro', '1-on-1 trainer access', 'Video consultations', 'Custom meal prep', 'Competition prep', 'Unlimited AI queries'],
    popular: false,
    amount: 1299,
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
          style={{
            backgroundColor: colors[i % colors.length],
            left: `${Math.random() * 100}%`,
            top: '-10px',
          }}
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

  const handlePayment = (planName: string, amount: number) => {
    if (amount === 0) return;
    setSelectedPlan(planName);
    setPaymentState('processing');
    setTimeout(() => {
      setPaymentState('success');
      setTimeout(() => {
        setPaymentState('idle');
        setSelectedPlan(null);
      }, 3000);
    }, 2000);
  };

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-primary tracking-widest uppercase text-sm mb-2">Pricing</p>
          <h2 className="font-display text-5xl md:text-6xl text-foreground">Choose Your Plan</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ scale: 1.02 }}
              className={`glass-card p-8 relative ${plan.popular ? 'neon-border border-primary/40' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-semibold tracking-wider uppercase">
                  Most Popular
                </div>
              )}
              <h3 className="font-display text-3xl text-foreground mb-1">{plan.name}</h3>
              <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
              <div className="mb-6">
                <span className="font-display text-5xl text-foreground">{plan.price}</span>
                {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => handlePayment(plan.name, plan.amount)}
                disabled={paymentState !== 'idle' && selectedPlan === plan.name}
                className={`w-full ${plan.popular ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_20px_hsl(142_72%_50%/0.3)]' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'} transition-all duration-300`}
              >
                {plan.amount === 0 ? 'Get Started' : 'Pay Now'}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {paymentState !== 'idle' && (
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
              {paymentState === 'success' && <ConfettiEffect />}

              {paymentState === 'processing' ? (
                <>
                  <Loader2 className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" />
                  <h3 className="font-display text-2xl text-foreground mb-2">Processing Payment</h3>
                  <p className="text-muted-foreground text-sm">Please wait...</p>
                </>
              ) : (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ duration: 0.5 }}
                  >
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
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
