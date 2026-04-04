import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Get community posts with likes and comments
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const posts = await prisma.communityPost.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, role: true } },
        likes: { select: { userId: true } },
        _count: { select: { comments: true } },
      },
      take: 50,
    });
    res.json(posts);
  } catch (error) {
    console.error('Fetch community posts error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create community post
router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { content, postType } = req.body;
    
    const post = await prisma.communityPost.create({
      data: {
        userId,
        content,
        postType,
      },
    });
    res.json(post);
  } catch (error) {
    console.error('Create community post error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get comments for a post
router.get('/:id/comments', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id: postId } = req.params;
    const comments = await prisma.communityComment.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
      include: {
        user: { select: { id: true, name: true } },
      },
    });
    res.json(comments);
  } catch (error) {
    console.error('Fetch comments error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add comment to post
router.post('/:id/comments', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id: postId } = req.params;
    const { content } = req.body;
    
    const comment = await prisma.communityComment.create({
      data: {
        userId,
        postId,
        content,
      },
    });
    res.json(comment);
  } catch (error) {
    console.error('Add comment error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle like for a post
router.post('/:id/like', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id: postId } = req.params;
    
    const existingLike = await prisma.communityLike.findUnique({
      where: { postId_userId: { postId, userId } },
    });
    
    if (existingLike) {
      await prisma.communityLike.delete({
        where: { postId_userId: { postId, userId } },
      });
      res.json({ liked: false });
    } else {
      await prisma.communityLike.create({
        data: { postId, userId },
      });
      res.json({ liked: true });
    }
  } catch (error) {
    console.error('Toggle like error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
