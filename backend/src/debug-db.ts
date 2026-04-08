import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

async function check() {
  try {
    console.log('Database URL:', process.env.DATABASE_URL);
    await prisma.$connect();
    console.log('Successfully connected to database');
    const userCount = await prisma.user.count();
    console.log('User count:', userCount);
  } catch (error) {
    console.error('Connection error details:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

check();
