import { motion } from 'framer-motion';
import { Brain, Dumbbell, Apple, BarChart3, Calendar, Target, Trophy, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const features = [
  { icon: Brain, title: 'AI Fitness Coach', description: 'Get personalized workout and diet recommendations powered by AI.', href: '/dashboard' },
  { icon: Dumbbell, title: 'Custom Workouts', description: 'Beginner to advanced plans targeting every muscle group.', href: '/workouts' },
  { icon: Target, title: 'Exercise Library', description: '100+ exercises with instructions, muscle targeting, and difficulty levels.', href: '/exercises' },
  { icon: Apple, title: 'Diet & Nutrition', description: 'AI-generated meal plans, calorie tracking, and macro monitoring.', href: '/diet' },
  { icon: Calendar, title: 'Workout Calendar', description: 'Track your schedule, streaks, and rest days with a visual calendar.', href: '/calendar' },
  { icon: BarChart3, title: 'Progress Dashboard', description: 'Track BMI, calories, body measurements with beautiful charts.', href: '/dashboard' },
  { icon: Users, title: 'Personal Trainers', description: 'Browse expert trainers, book sessions, and get 1-on-1 coaching.', href: '/trainers' },
  { icon: Trophy, title: 'Achievements', description: 'Earn badges, maintain streaks, and track your fitness milestones.', href: '/dashboard' },
];

export default function FeaturesSection() {
  const navigate = useNavigate();

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-primary tracking-widest uppercase text-sm mb-2">Why Choose Us</p>
          <h2 className="font-display text-5xl md:text-6xl text-foreground">Powered By Innovation</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              onClick={() => navigate(feature.href)}
              whileHover={{ scale: 1.04, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="glass-card p-8 group cursor-pointer transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_25px_hsl(142_72%_50%/0.15)]"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 group-hover:shadow-[0_0_15px_hsl(142_72%_50%/0.3)] transition-all duration-300">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-display text-2xl text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
