import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

// Diagnostic helper to verify DB connection
export const checkDbConnection = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'connected' };
  } catch (error: any) {
    console.error('DATABASE_CONNECTION_ERROR:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    return { 
      status: 'error', 
      message: 'Failed to connect to the database. Check Neon IP whitelisting and credentials.',
      debug: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
  }
};

export default prisma;
