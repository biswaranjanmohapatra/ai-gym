import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get own payments
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;

    if (role === 'trainer') {
      const trainer = await prisma.trainerProfile.findUnique({ where: { userId } });
      if (!trainer) {
        res.json([]);
        return;
      }
      const payments = await prisma.payment.findMany({
        where: { trainerId: trainer.id },
        include: { user: { select: { name: true, email: true } }, trainer: { select: { name: true } } },
        orderBy: { date: 'desc' }
      });
      res.json(payments);
    } else {
      const payments = await prisma.payment.findMany({
        where: { userId },
        include: { trainer: { select: { name: true } } },
        orderBy: { date: 'desc' }
      });
      res.json(payments);
    }
  } catch (error) {
    console.error('Fetch payments error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create payment
router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { amount, status, type, trainerId } = req.body;

    const payment = await prisma.payment.create({
      data: {
        userId,
        amount,
        status,
        type,
        trainerId
      }
    });

    res.status(201).json(payment);
  } catch (error) {
    console.error('Create payment error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
