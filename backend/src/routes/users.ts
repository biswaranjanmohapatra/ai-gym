import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Get own full profile and workout logs
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    
    // Get profile
    let profile = await prisma.profile.findUnique({ where: { userId } });
    
    // Auto-create profile if missing (first dashboard visit)
    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          userId,
          name: req.user!.email.split('@')[0],
        }
      });
    }

    // Get workout logs
    const workoutLogs = await prisma.workoutLog.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      take: 30
    });

    res.json({
      profile,
      workoutLogs
    });
  } catch (error) {
    console.error('Fetch user data error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update profile
router.put('/profile', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { name, age, gender, heightCm, weightKg, goal, bmi, activityLevel } = req.body;

    const profile = await prisma.profile.upsert({
      where: { userId },
      update: {
        name,
        age: age ? Number(age) : undefined,
        gender,
        heightCm: heightCm ? Number(heightCm) : undefined,
        weightKg: weightKg ? Number(weightKg) : undefined,
        goal,
        bmi: bmi ? Number(bmi) : undefined,
        activityLevel,
      },
      create: {
        userId,
        name,
        age: age ? Number(age) : undefined,
        gender,
        heightCm: heightCm ? Number(heightCm) : undefined,
        weightKg: weightKg ? Number(weightKg) : undefined,
        goal,
        bmi: bmi ? Number(bmi) : undefined,
        activityLevel,
      }
    });

    res.json(profile);
  } catch (error) {
    console.error('Update profile error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Log a workout
router.post('/workout-logs', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { workoutName, muscleGroup, durationMinutes, caloriesBurned } = req.body;

    const log = await prisma.workoutLog.create({
      data: {
        userId,
        workoutName,
        muscleGroup,
        durationMinutes: durationMinutes ? Number(durationMinutes) : 0,
        caloriesBurned: caloriesBurned ? Number(caloriesBurned) : 0,
        completedAt: new Date(),
      }
    });

    res.status(201).json(log);
  } catch (error) {
    console.error('Create workout log error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
