import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // Clear existing trainers if needed (depends on how you want to handle reruns)
  // await prisma.trainerProfile.deleteMany();

  // Check for users
  const userCount = await prisma.user.count();
  if (userCount === 0) {
    console.log('Inserting demo users...');
    const hashedPassword = await bcrypt.hash('trainer123', 10);
    const adminPassword = await bcrypt.hash('admin123', 10);

    // Create trainer user
    const trainerUser = await prisma.user.create({
      data: {
        email: 'trainer@example.com',
        password: hashedPassword,
        name: 'Rahul',
        role: 'trainer',
        trainerProfile: {
          create: {
            name: 'Rahul',
            specialty: 'Strength & HIIT',
            experience: '12 years',
            pricePerSession: 500,
            isActive: true,
            bio: 'Certified strength coach.',
            certifications: JSON.stringify(['NSCA-CSCS', 'ACE Certified']),
            specializations: JSON.stringify(['Weight Loss', 'Strength']),
            availability: JSON.stringify(['Mon-Fri: 6AM-12PM']),
            emoji: '💪',
            rating: 4.9,
            reviewsCount: 284,
          }
        }
      }
    });

    // Create admin user
    await prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: adminPassword,
        name: 'Admin User',
        role: 'admin',
      }
    });

    // Create regular user
    await prisma.user.create({
      data: {
        email: 'user@example.com',
        password: await bcrypt.hash('user123', 10),
        name: 'John Doe',
        role: 'user',
        profile: {
          create: {
            name: 'John Doe',
            age: 28,
            gender: 'male',
            goal: 'Muscle Gain',
          }
        }
      }
    });
    
    console.log('Demo users (trainer, admin, user) inserted successfully.');
  }

  const count = await prisma.trainerProfile.count();
  if (count <= 1) { // 1 if we just created Rahul above
    console.log('Inserting additional demo trainers...');
    await prisma.trainerProfile.createMany({
      data: [
        {
          name: 'Muskan',
          specialty: 'Yoga & Flexibility',
          experience: '8 years',
          pricePerSession: 400,
          isActive: true,
          bio: 'Yoga instructor.',
          certifications: JSON.stringify(['RYT-500']),
          specializations: JSON.stringify(['Yoga', 'Flexibility']),
          availability: JSON.stringify(['Mon-Sat: 5AM-10AM']),
          emoji: '🧘',
          rating: 4.8,
          reviewsCount: 192,
        },
        {
          name: 'Arjun',
          specialty: 'CrossFit & Nutrition',
          experience: '10 years',
          pricePerSession: 700,
          isActive: true,
          bio: 'CrossFit coach.',
          certifications: JSON.stringify(['CrossFit L3']),
          specializations: JSON.stringify(['CrossFit', 'Nutrition']),
          availability: JSON.stringify(['Mon-Fri: 7AM-3PM']),
          emoji: '🏋️',
          rating: 4.9,
          reviewsCount: 347,
        },
        {
          name: 'Priya',
          specialty: 'Cardio & Dance',
          experience: '6 years',
          pricePerSession: 450,
          isActive: true,
          bio: 'Dance fitness instructor.',
          certifications: JSON.stringify(['Zumba Licensed']),
          specializations: JSON.stringify(['Cardio', 'Dance']),
          availability: JSON.stringify(['Mon-Fri: 4PM-9PM']),
          emoji: '💃',
          rating: 4.8,
          reviewsCount: 211,
        }
      ]
    });
    console.log('Demo trainers inserted successfully.');
  } else {
    console.log('Trainers already exist, skipping seed.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
