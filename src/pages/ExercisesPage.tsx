import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Dumbbell, Target, Zap, ChevronDown, ChevronUp } from 'lucide-react';

interface Exercise {
  name: string;
  muscleGroup: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  muscles: string[];
  instructions: string[];
  emoji: string;
}

const exercises: Exercise[] = [
  { name: 'Push-Up', muscleGroup: 'Chest', difficulty: 'Beginner', muscles: ['Pectorals', 'Triceps', 'Anterior Deltoid'], instructions: ['Start in plank position with hands shoulder-width apart', 'Lower your chest toward the floor', 'Push back up to starting position', 'Keep core tight throughout'], emoji: '💪' },
  { name: 'Bench Press', muscleGroup: 'Chest', difficulty: 'Intermediate', muscles: ['Pectorals', 'Triceps', 'Shoulders'], instructions: ['Lie on bench, grip bar slightly wider than shoulder-width', 'Unrack and lower bar to mid-chest', 'Press bar up until arms are extended', 'Keep feet flat on the floor'], emoji: '🏋️' },
  { name: 'Pull-Up', muscleGroup: 'Back', difficulty: 'Intermediate', muscles: ['Latissimus Dorsi', 'Biceps', 'Rhomboids'], instructions: ['Hang from bar with overhand grip', 'Pull yourself up until chin clears bar', 'Lower slowly with control', 'Avoid swinging'], emoji: '🔝' },
  { name: 'Deadlift', muscleGroup: 'Back', difficulty: 'Advanced', muscles: ['Erector Spinae', 'Glutes', 'Hamstrings', 'Traps'], instructions: ['Stand with feet hip-width apart, bar over mid-foot', 'Hinge at hips, grip bar outside knees', 'Drive through heels, keeping back straight', 'Lock out hips at top'], emoji: '⚡' },
  { name: 'Squat', muscleGroup: 'Legs', difficulty: 'Beginner', muscles: ['Quadriceps', 'Glutes', 'Hamstrings', 'Core'], instructions: ['Stand with feet shoulder-width apart', 'Bend knees and lower hips as if sitting', 'Keep chest up and knees over toes', 'Drive back up through heels'], emoji: '🦵' },
  { name: 'Barbell Squat', muscleGroup: 'Legs', difficulty: 'Intermediate', muscles: ['Quadriceps', 'Glutes', 'Hamstrings', 'Core'], instructions: ['Place bar on upper traps', 'Unrack and step back, feet shoulder-width', 'Squat to parallel or below', 'Drive back up keeping chest high'], emoji: '🏋️' },
  { name: 'Romanian Deadlift', muscleGroup: 'Legs', difficulty: 'Intermediate', muscles: ['Hamstrings', 'Glutes', 'Lower Back'], instructions: ['Hold bar at hip level with overhand grip', 'Hinge at hips, pushing them back', 'Lower bar along shins until hamstring stretch', 'Drive hips forward to return'], emoji: '🔥' },
  { name: 'Overhead Press', muscleGroup: 'Shoulders', difficulty: 'Intermediate', muscles: ['Deltoids', 'Triceps', 'Upper Chest'], instructions: ['Hold bar at shoulder height', 'Press bar overhead until arms lock out', 'Move head through to avoid hitting chin', 'Lower with control'], emoji: '🙌' },
  { name: 'Lateral Raise', muscleGroup: 'Shoulders', difficulty: 'Beginner', muscles: ['Lateral Deltoid'], instructions: ['Hold dumbbells at sides', 'Raise arms out to sides until parallel', 'Keep slight bend in elbows', 'Lower slowly'], emoji: '✋' },
  { name: 'Bicep Curl', muscleGroup: 'Arms', difficulty: 'Beginner', muscles: ['Biceps', 'Brachialis'], instructions: ['Hold dumbbells at sides, palms forward', 'Curl weights toward shoulders', 'Squeeze at top', 'Lower slowly with control'], emoji: '💪' },
  { name: 'Tricep Dips', muscleGroup: 'Arms', difficulty: 'Intermediate', muscles: ['Triceps', 'Chest', 'Shoulders'], instructions: ['Grip parallel bars, arms straight', 'Lower body by bending elbows to 90°', 'Press back up to starting position', 'Lean slightly forward for chest engagement'], emoji: '⬇️' },
  { name: 'Plank', muscleGroup: 'Core', difficulty: 'Beginner', muscles: ['Rectus Abdominis', 'Transverse Abdominis', 'Obliques'], instructions: ['Start in forearm plank position', 'Keep body in straight line', 'Engage core and glutes', 'Hold position for time'], emoji: '🧘' },
  { name: 'Hanging Leg Raise', muscleGroup: 'Core', difficulty: 'Advanced', muscles: ['Lower Abs', 'Hip Flexors', 'Obliques'], instructions: ['Hang from pull-up bar', 'Raise legs to 90° or higher', 'Lower with control, avoid swinging', 'Keep core engaged throughout'], emoji: '🦾' },
  { name: 'Burpees', muscleGroup: 'Full Body', difficulty: 'Intermediate', muscles: ['Full Body', 'Cardio'], instructions: ['Start standing, drop to squat position', 'Kick feet back into plank', 'Perform a push-up', 'Jump feet forward and jump up with arms overhead'], emoji: '🏃' },
  { name: 'Mountain Climbers', muscleGroup: 'Full Body', difficulty: 'Beginner', muscles: ['Core', 'Shoulders', 'Hip Flexors', 'Cardio'], instructions: ['Start in push-up position', 'Drive one knee toward chest', 'Quickly switch legs', 'Keep hips low and core tight'], emoji: '⛰️' },
  { name: 'Box Jump', muscleGroup: 'Legs', difficulty: 'Advanced', muscles: ['Quadriceps', 'Glutes', 'Calves'], instructions: ['Stand facing a stable box', 'Swing arms and jump onto box', 'Land softly with both feet', 'Step back down and repeat'], emoji: '📦' },
];

const muscleGroups = ['All', ...Array.from(new Set(exercises.map(e => e.muscleGroup)))];
const difficultyLevels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const difficultyColor: Record<string, string> = {
  Beginner: 'text-primary bg-primary/10 border-primary/20',
  Intermediate: 'text-accent bg-accent/10 border-accent/20',
  Advanced: 'text-destructive bg-destructive/10 border-destructive/20',
};

export default function ExercisesPage() {
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [expanded, setExpanded] = useState<number | null>(null);

  const filtered = exercises.filter(e => {
    if (search && !e.name.toLowerCase().includes(search.toLowerCase()) && !e.muscleGroup.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedMuscle !== 'All' && e.muscleGroup !== selectedMuscle) return false;
    if (selectedDifficulty !== 'All' && e.difficulty !== selectedDifficulty) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <p className="text-primary tracking-widest uppercase text-sm mb-2">Exercise Library</p>
          <h1 className="font-display text-5xl md:text-6xl text-foreground mb-4">Master Every Move</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">Browse exercises by muscle group, search, and learn proper form.</p>
        </motion.div>

        {/* Filters */}
        <div className="max-w-4xl mx-auto mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search exercises..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 bg-secondary/50 border-border/30"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {muscleGroups.map(g => (
              <Button
                key={g}
                size="sm"
                variant={selectedMuscle === g ? 'default' : 'secondary'}
                onClick={() => setSelectedMuscle(g)}
                className={selectedMuscle === g ? 'bg-primary text-primary-foreground' : ''}
              >
                {g}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {difficultyLevels.map(d => (
              <Button
                key={d}
                size="sm"
                variant={selectedDifficulty === d ? 'default' : 'secondary'}
                onClick={() => setSelectedDifficulty(d)}
                className={selectedDifficulty === d ? 'bg-accent text-accent-foreground' : ''}
              >
                {d}
              </Button>
            ))}
          </div>
        </div>

        {/* Exercise Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {filtered.map((ex, i) => (
            <motion.div
              key={ex.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              whileHover={{ scale: 1.02 }}
              className="glass-card overflow-hidden cursor-pointer"
              onClick={() => setExpanded(expanded === i ? null : i)}
            >
              <div className="h-1.5 gradient-primary" />
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{ex.emoji}</span>
                    <div>
                      <h3 className="font-display text-lg text-foreground">{ex.name}</h3>
                      <p className="text-xs text-muted-foreground">{ex.muscleGroup}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${difficultyColor[ex.difficulty]}`}>
                    {ex.difficulty}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 mb-2">
                  {ex.muscles.map(m => (
                    <span key={m} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{m}</span>
                  ))}
                </div>

                <button className="flex items-center gap-1 text-xs text-primary">
                  Instructions {expanded === i ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>

                <AnimatePresence>
                  {expanded === i && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3"
                    >
                      <ol className="space-y-1.5">
                        {ex.instructions.map((step, j) => (
                          <li key={j} className="text-xs text-muted-foreground flex gap-2">
                            <span className="text-primary font-medium">{j + 1}.</span> {step}
                          </li>
                        ))}
                      </ol>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground mt-12">No exercises found. Try different filters.</p>
        )}
      </div>
      <Footer />
    </div>
  );
}
