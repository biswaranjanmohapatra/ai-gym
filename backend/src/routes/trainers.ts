import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';

const router = Router();

// Get all active trainers (Public)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const trainers = await prisma.trainerProfile.findMany({
      where: { isActive: true },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    // Parse JSON stringified fields
    const parsedTrainers = trainers.map(t => ({
      ...t,
      certifications: JSON.parse(t.certifications),
      specializations: JSON.parse(t.specializations),
      availability: JSON.parse(t.availability),
    }));

    res.json(parsedTrainers);
  } catch (error) {
    console.error('Fetch trainers error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get own profile (Trainer)
router.get('/me', authenticateToken, requireRole(['trainer']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const trainer = await prisma.trainerProfile.findUnique({
      where: { userId },
      include: {
        timeSlots: true,
        bookings: { include: { user: { select: { name: true } } }, orderBy: { bookingDate: 'desc' } },
        payments: { include: { user: { select: { name: true } } }, orderBy: { date: 'desc' } }
      }
    });

    if (!trainer) {
      res.status(404).json({ error: 'Trainer profile not found' });
      return;
    }

    res.json(trainer);
  } catch (error) {
    console.error('Fetch own trainer profile error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update own trainer profile
router.put('/me', authenticateToken, requireRole(['trainer']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { name, specialty, experience, pricePerSession, bio, emoji } = req.body;

    const trainer = await prisma.trainerProfile.upsert({
      where: { userId },
      update: {
        name,
        specialty,
        experience,
        pricePerSession: pricePerSession ? Number(pricePerSession) : undefined,
        bio,
        emoji,
      },
      create: {
        userId,
        name: name || req.user!.email.split('@')[0],
        specialty: specialty || 'Fitness Coach',
        experience: experience || '1-3 years',
        pricePerSession: Number(pricePerSession) || 500,
        bio: bio || '',
        emoji: emoji || '💪',
      }
    });

    res.json(trainer);
  } catch (error) {
    console.error('Update trainer profile error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add time slot
router.post('/time-slots', authenticateToken, requireRole(['trainer']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { dayOfWeek, startTime, endTime } = req.body;

    const trainer = await prisma.trainerProfile.findUnique({ where: { userId } });
    if (!trainer) {
      res.status(404).json({ error: 'Trainer profile not found' });
      return;
    }

    const slot = await prisma.trainerTimeSlot.create({
      data: {
        trainerId: trainer.id,
        dayOfWeek: Number(dayOfWeek),
        startTime,
        endTime,
      }
    });

    res.status(201).json(slot);
  } catch (error) {
    console.error('Add time slot error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete time slot
router.delete('/time-slots/:id', authenticateToken, requireRole(['trainer']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const trainer = await prisma.trainerProfile.findUnique({ where: { userId } });
    const slot = await prisma.trainerTimeSlot.findUnique({ where: { id: id as string } });

    if (!trainer || !slot || slot.trainerId !== trainer.id) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    await prisma.trainerTimeSlot.delete({ where: { id: id as string } });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete time slot error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
