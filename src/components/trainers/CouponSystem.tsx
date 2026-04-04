import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Star, Check, X, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface CouponSystemProps {
  originalPrice: number;
  onDiscountApplied: (discountedPrice: number, couponCode: string) => void;
}

interface Coupon {
  code: string;
  discount: number; // percentage
  description: string;
  pointsCost: number; // 0 = free coupon
  minPoints: number; // minimum points needed to unlock
}

const AVAILABLE_COUPONS: Coupon[] = [
  { code: 'FIT10', discount: 10, description: '10% off any session', pointsCost: 0, minPoints: 0 },
  { code: 'ELITE20', discount: 20, description: '20% off — earn 200+ points to unlock', pointsCost: 0, minPoints: 200 },
  { code: 'REWARD15', discount: 15, description: 'Redeem 150 points for 15% off', pointsCost: 150, minPoints: 0 },
  { code: 'PREMIUM25', discount: 25, description: 'Redeem 300 points for 25% off', pointsCost: 300, minPoints: 0 },
];

export default function CouponSystem({ originalPrice, onDiscountApplied }: CouponSystemProps) {
  const { user } = useAuth();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [showCoupons, setShowCoupons] = useState(false);

  useEffect(() => {
    if (user) {
      fetchApi('/rewards')
        .then((data) => {
          if (data) setTotalPoints(data.reduce((sum: number, p: any) => sum + p.points, 0));
        })
        .catch(err => console.error('Error fetching points in CouponSystem', err));
    }
  }, [user]);

  const applyCoupon = (coupon: Coupon) => {
    if (coupon.minPoints > 0 && totalPoints < coupon.minPoints) {
      toast.error(`Need ${coupon.minPoints} points to unlock this coupon. You have ${totalPoints}.`);
      return;
    }
    const discounted = Math.round(originalPrice * (1 - coupon.discount / 100));
    setAppliedCoupon(coupon);
    setCouponCode(coupon.code);
    onDiscountApplied(discounted, coupon.code);
    toast.success(`Coupon ${coupon.code} applied! ${coupon.discount}% off`);
    setShowCoupons(false);
  };

  const applyManualCoupon = () => {
    const found = AVAILABLE_COUPONS.find(c => c.code.toLowerCase() === couponCode.trim().toLowerCase());
    if (!found) { toast.error('Invalid coupon code'); return; }
    applyCoupon(found);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    onDiscountApplied(originalPrice, '');
    toast.info('Coupon removed');
  };

  return (
    <div className="space-y-3">
      {/* Coupon input */}
      {!appliedCoupon ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={couponCode}
                onChange={e => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter coupon code"
                className="pl-10 bg-secondary/50 border-border/30 text-sm uppercase"
              />
            </div>
            <Button size="sm" onClick={applyManualCoupon} disabled={!couponCode.trim()}
              className="bg-primary text-primary-foreground">
              Apply
            </Button>
          </div>
          <button
            onClick={() => setShowCoupons(!showCoupons)}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            <Tag className="h-3 w-3" /> View available coupons
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20"
        >
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary" />
            <div>
              <span className="text-sm text-primary font-medium">{appliedCoupon.code}</span>
              <span className="text-xs text-muted-foreground ml-2">({appliedCoupon.discount}% off)</span>
            </div>
          </div>
          <button onClick={removeCoupon} className="text-muted-foreground hover:text-destructive">
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}

      {/* Available coupons dropdown */}
      <AnimatePresence>
        {showCoupons && !appliedCoupon && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {AVAILABLE_COUPONS.map(coupon => {
              const locked = coupon.minPoints > 0 && totalPoints < coupon.minPoints;
              const needsPoints = coupon.pointsCost > 0 && totalPoints < coupon.pointsCost;
              const disabled = locked || needsPoints;

              return (
                <motion.button
                  key={coupon.code}
                  whileHover={!disabled ? { x: 4 } : {}}
                  onClick={() => !disabled && applyCoupon(coupon)}
                  disabled={disabled}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    disabled
                      ? 'bg-secondary/20 border-border/10 opacity-50 cursor-not-allowed'
                      : 'bg-secondary/40 border-border/20 hover:border-primary/30 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-primary font-bold">{coupon.code}</span>
                        <span className="text-xs text-foreground">{coupon.discount}% OFF</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{coupon.description}</p>
                    </div>
                    {coupon.pointsCost > 0 && (
                      <span className="flex items-center gap-1 text-xs" style={{ color: 'hsl(45 100% 55%)' }}>
                        <Star className="h-3 w-3" /> {coupon.pointsCost}
                      </span>
                    )}
                  </div>
                </motion.button>
              );
            })}
            <p className="text-[10px] text-muted-foreground text-center">
              Your balance: <span style={{ color: 'hsl(45 100% 55%)' }}>{totalPoints} pts</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Price display */}
      {appliedCoupon && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Discounted Price:</span>
          <div className="flex items-center gap-2">
            <span className="line-through text-muted-foreground text-xs">₹{originalPrice}</span>
            <span className="font-display text-xl text-primary">₹{Math.round(originalPrice * (1 - appliedCoupon.discount / 100))}</span>
          </div>
        </div>
      )}
    </div>
  );
}
