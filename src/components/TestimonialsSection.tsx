import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  { name: 'Rahul', text: 'IronForge completely transformed my fitness journey. The AI recommendations are incredibly accurate!', rating: 5, emoji: '💪' },
  { name: 'Muskan', text: 'Lost 30 pounds in 4 months following the AI diet plan. The tracking dashboard kept me motivated.', rating: 5, emoji: '🏋️' },
  { name: 'Biswa', text: 'As a beginner, the structured workout plans made it easy to get started without feeling overwhelmed.', rating: 5, emoji: '⚡' },
];

export default function TestimonialsSection() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-primary tracking-widest uppercase text-sm mb-2">Testimonials</p>
          <h2 className="font-display text-5xl md:text-6xl text-foreground">Success Stories</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ scale: 1.03, rotateY: 3 }}
              style={{ transformPerspective: 800 }}
              className="glass-card p-8 cursor-pointer transition-shadow duration-300 hover:shadow-[0_0_25px_hsl(142_72%_50%/0.15)]"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 text-primary fill-primary" />
                ))}
              </div>
              <p className="text-muted-foreground leading-relaxed mb-6">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-lg">
                  {t.emoji}
                </div>
                <span className="text-foreground font-medium">{t.name}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
