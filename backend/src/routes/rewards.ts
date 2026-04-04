import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Get reward points for user
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const points = await prisma.rewardPoint.findMany({
      where: { userId },
      orderBy: { earnedAt: 'desc' },
    });
    res.json(points);
  } catch (error) {
    console.error('Fetch reward points error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add reward points
router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { points, description } = req.body;
    
    const award = await prisma.rewardPoint.create({
      data: {
        userId,
        points: parseInt(points),
        description,
      },
    });
    res.json(award);
  } catch (error) {
    console.error('Add reward points error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
