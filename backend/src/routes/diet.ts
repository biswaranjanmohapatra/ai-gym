import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all meal logs for user
router.get('/meals', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const meals = await prisma.mealLog.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
    res.json(meals);
  } catch (error) {
    console.error('Fetch meals error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create meal log
router.post('/meals', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { mealName, calories, protein, carbs, fat, mealType, date } = req.body;
    
    const meal = await prisma.mealLog.create({
      data: {
        userId,
        mealName,
        calories: calories ? parseInt(calories) : null,
        protein: protein ? parseFloat(protein) : null,
        carbs: carbs ? parseFloat(carbs) : null,
        fat: fat ? parseFloat(fat) : null,
        mealType,
        date: date ? new Date(date) : new Date(),
      },
    });
    res.json(meal);
  } catch (error) {
    console.error('Create meal error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete meal log
router.delete('/meals/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.id;
    
    await prisma.mealLog.delete({
      where: { id, userId },
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete meal error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get water logs
router.get('/water', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const water = await prisma.waterLog.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
    res.json(water);
  } catch (error) {
    console.error('Fetch water error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create water log
router.post('/water', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { amountMl, date } = req.body;
    
    const log = await prisma.waterLog.create({
      data: {
        userId,
        amountMl: parseInt(amountMl),
        date: date ? new Date(date) : new Date(),
      },
    });
    res.json(log);
  } catch (error) {
    console.error('Create water error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete last water log (simple undo)
router.delete('/water/last', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const lastLog = await prisma.waterLog.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
    });
    
    if (lastLog) {
      await prisma.waterLog.delete({ where: { id: lastLog.id } });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Delete last water log error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
