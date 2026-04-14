import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma'; // Assumes you have prisma exported from lib

// Support custom backend JWT locally or Supabase JWT
const JWT_SECRET = process.env.SUPABASE_JWT_SECRET || process.env.JWT_SECRET || 'supersecretjwtkeythatshouldbechanged';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  jwt.verify(token, JWT_SECRET, async (err, decoded: any) => {
    if (err) {
      res.status(403).json({ error: 'Invalid or expired token' });
      return;
    }
    
    // Support either Supabase JWT ("sub", "email") or custom JWT ("id", "email")
    const userId = decoded.sub || decoded.id;
    const userEmail = decoded.email;

    if (!userEmail) {
      res.status(403).json({ error: 'Invalid token payload' });
      return;
    }

    try {
      // Find the user in our Prisma database by email to get their custom backend ID and Role
      let user = await prisma.user.findUnique({ where: { email: userEmail } });

      // Lazy-sync: if they registered via Supabase first, we create them in Prisma
      if (!user) {
        user = await prisma.user.create({
          data: {
            id: userId, // Match Supabase UUID where possible
            email: userEmail,
            name: decoded.user_metadata?.name || '',
            password: '', // Password tracking handled by Supabase now
            role: 'user', // Default role
          }
        });
      }

      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
      };
      
      next();
    } catch (dbError) {
      console.error('Error fetching/creating user during authentication:', dbError);
      res.status(500).json({ error: 'Internal Server Error validating user session' });
    }
  });
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: `Requires one of roles: ${roles.join(', ')}` });
      return;
    }
    
    next();
  };
};
