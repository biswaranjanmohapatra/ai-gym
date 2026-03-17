import { motion } from 'framer-motion';
import { Star, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const trainers = [
  { name: 'Rahul', specialty: 'Strength & HIIT', rating: 4.9, experience: '12 years', emoji: '💪' },
  { name: 'Biswa', specialty: 'Yoga & Flexibility', rating: 4.8, experience: '8 years', emoji: '🧘' },
  { name: 'Muskan Padhan', specialty: 'Nutrition & CrossFit', rating: 4.9, experience: '10 years', emoji: '🏋️' },
];

export default function TrainersSection() {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-primary tracking-widest uppercase text-sm mb-2">Expert Trainers</p>
          <h2 className="font-display text-5xl md:text-6xl text-foreground">Meet Our Team</h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {trainers.map((trainer, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ scale: 1.03, rotateY: 5, rotateX: 3 }}
              style={{ transformPerspective: 800 }}
              className="glass-card overflow-hidden group cursor-pointer transition-shadow duration-300 hover:shadow-[0_0_25px_hsl(var(--primary)/0.15)]"
              onClick={() => navigate('/trainers')}
            >
              <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-24 h-24 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center text-4xl"
                >
                  {trainer.emoji}
                </motion.div>
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl text-foreground">{trainer.name}</h3>
                <p className="text-primary text-sm mb-2">{trainer.specialty}</p>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Star className="h-3 w-3 text-primary fill-primary" /> {trainer.rating}</span>
                  <span>{trainer.experience}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button onClick={() => navigate('/trainers')} variant="ghost" className="text-primary hover:text-primary/80">
            View All Trainers <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
