import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Get own subscriptions
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const subscriptions = await prisma.subscription.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(subscriptions);
  } catch (error) {
    console.error('Fetch subscriptions error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create subscription
router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { plan, price } = req.body;

    const subscription = await prisma.subscription.create({
      data: {
        userId,
        plan,
        price,
        status: 'active'
      }
    });

    res.status(201).json(subscription);
  } catch (error) {
    console.error('Create subscription error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
