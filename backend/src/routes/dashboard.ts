import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Admin Dashboard Stats
router.get('/admin', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalUsers = await prisma.user.count({ where: { role: 'user' } });
    const totalTrainers = await prisma.trainerProfile.count();
    const activeBookings = await prisma.trainerBooking.count({ where: { status: 'active' } });
    const pendingBookings = await prisma.trainerBooking.count({ where: { status: 'pending' } });
    const totalRevenueResult = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'paid' }
    });

    const [allUsers, allTrainers, allBookings, allPayments, allSubscriptions] = await Promise.all([
      prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, createdAt: true } }),
      prisma.trainerProfile.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.trainerBooking.findMany({
        orderBy: { bookingDate: 'desc' },
        include: { user: { select: { name: true } }, trainer: { select: { name: true } } }
      }),
      prisma.payment.findMany({ orderBy: { date: 'desc' }, include: { user: { select: { name: true } } } }),
      prisma.subscription.findMany({ orderBy: { createdAt: 'desc' }, include: { user: { select: { name: true } } } }),
    ]);

    res.json({
      allUsers,
      allTrainers,
      allBookings,
      allPayments,
      allSubscriptions,
      stats: {
        totalUsers,
        totalTrainers,
        activeBookings,
        pendingBookings,
        totalRevenue: totalRevenueResult._sum.amount || 0,
      }
    });
  } catch (error) {
    console.error('Fetch admin stats error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user
router.delete('/admin/users/:id', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.user.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete user error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete trainer
router.delete('/admin/trainers/:id', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const trainerId = req.params.id as string;
    const trainer = await prisma.trainerProfile.findUnique({ where: { id: trainerId } });
    if (trainer && trainer.userId) {
      await prisma.user.delete({ where: { id: trainer.userId } }); // Cascade will delete trainerProfile automatically if set, otherwise delete trainerProfile
    } else {
      await prisma.trainerProfile.delete({ where: { id: trainerId } });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete trainer error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
