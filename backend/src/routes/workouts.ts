import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Get workout logs for calendar/history
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { start, end } = req.query;
    
    let where: any = { userId };
    if (start && end) {
      where.completedAt = {
        gte: new Date(start as string),
        lte: new Date(end as string),
      };
    }
    
    const logs = await prisma.workoutLog.findMany({
      where,
      orderBy: { completedAt: 'desc' },
    });
    res.json(logs);
  } catch (error) {
    console.error('Fetch workout logs error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create workout log
router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { workoutName, muscleGroup, durationMinutes, caloriesBurned, completedAt } = req.body;
    
    const log = await prisma.workoutLog.create({
      data: {
        userId,
        workoutName,
        muscleGroup,
        durationMinutes: durationMinutes ? parseInt(durationMinutes) : null,
        caloriesBurned: caloriesBurned ? parseInt(caloriesBurned) : null,
        completedAt: completedAt ? new Date(completedAt) : new Date(),
      },
    });
    res.json(log);
  } catch (error) {
    console.error('Create workout log error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
