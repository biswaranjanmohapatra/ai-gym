import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get own bookings (User or Trainer)
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
      const bookings = await prisma.trainerBooking.findMany({
        where: { trainerId: trainer.id },
        include: { user: { select: { name: true, email: true } }, trainer: true },
        orderBy: { bookingDate: 'desc' }
      });
      res.json(bookings);
    } else {
      const bookings = await prisma.trainerBooking.findMany({
        where: { userId },
        include: { trainer: true },
        orderBy: { bookingDate: 'desc' }
      });
      res.json(bookings);
    }
  } catch (error) {
    console.error('Fetch bookings error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create booking (User)
router.post('/', authenticateToken, requireRole(['user']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { trainerId, bookingDate, startTime, endTime, sessionType } = req.body;

    const booking = await prisma.trainerBooking.create({
      data: {
        userId,
        trainerId,
        bookingDate: new Date(bookingDate),
        startTime,
        endTime,
        sessionType,
        status: 'pending',
        paymentStatus: 'pending',
        paymentAmount: 0 // Will map properly in real app
      }
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error('Create booking error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update booking status (Trainer)
router.patch('/:id/status', authenticateToken, requireRole(['trainer']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user!.id;

    // Verify trainer owns this booking
    const trainer = await prisma.trainerProfile.findUnique({ where: { userId } });
    const booking = await prisma.trainerBooking.findUnique({ where: { id: id as string } });

    if (!trainer || !booking || booking.trainerId !== trainer.id) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const updated = await prisma.trainerBooking.update({
      where: { id: id as string },
      data: { 
        status,
        paymentStatus: status === 'approved' ? 'paid' : undefined 
      }
    });

    // Create payment record on approval
    if (status === 'approved' && updated.paymentAmount > 0) {
      await prisma.payment.create({
        data: {
          userId: updated.userId,
          trainerId: updated.trainerId,
          amount: updated.paymentAmount,
          status: 'paid',
          type: 'trainer',
          date: new Date()
        }
      });
    }

    res.json(updated);
  } catch (error) {
    console.error('Update booking error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
