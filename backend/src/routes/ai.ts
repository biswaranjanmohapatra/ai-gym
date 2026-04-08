import { Router, Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';

const router = Router();

// Rule-based AI Fitness Chat using Database Context
router.post('/chat', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { messages } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    // Fetch user profile for context
    const profile = await prisma.profile.findUnique({ where: { userId } });
    const lastWorkout = await prisma.workoutLog.findFirst({
      where: { userId },
      orderBy: { completedAt: 'desc' }
    });

    const lastMessage = messages[messages.length - 1].content.toLowerCase();

    // Set headers for SSE to mimic streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let responseText = "";

    // Recommendation logic based on profile and keywords
    if (lastMessage.includes('hello') || lastMessage.includes('hi')) {
      responseText = `Hello ${profile?.name || 'there'}! I'm your AI fitness coach. `;
      if (profile?.goal) {
        responseText += `I see your goal is ${profile.goal}. How can I help you move closer to that today? 💪`;
      } else {
        responseText += "I'm ready to help you reach your goals. What would you like to focus on today? 💪";
      }
    } else if (lastMessage.includes('workout') || lastMessage.includes('train')) {
      if (lastWorkout) {
        responseText = `Great job on your last ${lastWorkout.workoutName} workout! `;
      }
      if (profile?.goal?.toLowerCase().includes('gain')) {
        responseText += "For muscle gain, I recommend heavy compound movements (squats, bench press, deadlifts) with 8-12 reps per set. 🏋️‍♂️";
      } else if (profile?.goal?.toLowerCase().includes('lose') || profile?.goal?.toLowerCase().includes('weight')) {
        responseText += "To support weight loss, try a mix of HIIT and strength training to keep your metabolism high! 🏃‍♂️";
      } else {
        responseText += "Focus on consistency! 30-45 minutes of active movement today will make a big difference. 🏋️‍♂️";
      }
    } else if (lastMessage.includes('diet') || lastMessage.includes('eat')) {
      if (profile?.weightKg) {
        const protein = Math.round(profile.weightKg * 1.8);
        responseText = `Based on your weight (${profile.weightKg}kg), you should aim for about ${protein}g of protein daily to support recovery. `;
      }
      responseText += "Remember: clean whole foods, plenty of protein, and lots of water! 🥗";
    } else {
      responseText = "I'm here to help! Whether it's form tips, motivation, or specific workout advice, just ask. Let's stay consistent! 📈";
    }

    // Simulate streaming
    const words = responseText.split(' ');
    for (const word of words) {
      const data = JSON.stringify({
        choices: [{ delta: { content: word + ' ' } }]
      });
      res.write(`data: ${data}\n\n`);
      await new Promise(resolve => setTimeout(resolve, 30));
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('AI Chat error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// AI Diet Plan Generation (Rule-based)
router.post('/diet-plan', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { dietType } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    const profile = await prisma.profile.findUnique({ where: { userId } });

    // Mifflin-St Jeor Equation
    let bmr = 0;
    if (profile?.weightKg && profile?.heightCm && profile?.age) {
      if (profile.gender?.toLowerCase() === 'male') {
        bmr = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age + 5;
      } else {
        bmr = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age - 161;
      }
    } else {
      bmr = 1500; // Fallback
    }

    // Activity Multiplier (default to 1.375 for Moderate)
    let tdee = bmr * 1.375;
    
    // Adjust for goal
    if (profile?.goal?.toLowerCase().includes('lose')) tdee -= 500;
    if (profile?.goal?.toLowerCase().includes('gain')) tdee += 300;

    const targetCalories = Math.round(tdee);
    const proteinG = Math.round((targetCalories * 0.3) / 4);
    const carbsG = Math.round((targetCalories * 0.4) / 4);
    const fatG = Math.round((targetCalories * 0.3) / 9);

    const plan = {
      dailyCalories: targetCalories,
      dailyProtein: proteinG,
      dailyCarbs: carbsG,
      dailyFat: fatG,
      meals: [
        {
          mealType: 'breakfast',
          name: 'High Protein Breakfast Bowl',
          calories: Math.round(targetCalories * 0.25),
          protein: Math.round(proteinG * 0.25),
          carbs: Math.round(carbsG * 0.25),
          fat: Math.round(fatG * 0.25),
          items: ['Oats', 'Whey Protein', 'Berries', 'Seeds']
        },
        {
          mealType: 'lunch',
          name: dietType === 'vegetarian' ? 'Lentil & Quinoa Bowl' : 'Grilled Chicken & Rice',
          calories: Math.round(targetCalories * 0.35),
          protein: Math.round(proteinG * 0.35),
          carbs: Math.round(carbsG * 0.35),
          fat: Math.round(fatG * 0.35),
          items: ['Green Salad', 'Healthy Carbs', 'Protein Source', 'Avocado']
        },
        {
          mealType: 'snack',
          name: 'Recovery Snack',
          calories: Math.round(targetCalories * 0.1),
          protein: Math.round(proteinG * 0.1),
          carbs: Math.round(carbsG * 0.1),
          fat: Math.round(fatG * 0.1),
          items: ['Fruit', 'Handful of Nuts']
        },
        {
          mealType: 'dinner',
          name: dietType === 'vegetarian' ? 'Tofu Stir-fry' : 'Baked Fish & Sweet Potato',
          calories: Math.round(targetCalories * 0.3),
          protein: Math.round(proteinG * 0.3),
          carbs: Math.round(carbsG * 0.3),
          fat: Math.round(fatG * 0.3),
          items: ['Steamed Vegetables', 'Lean Protein', 'Complex Carbs']
        }
      ],
      tips: [
        'Stay hydrated with 3-4 liters of water.',
        'Prioritize sleep for muscle recovery.',
        'Eat mindfully and chew slowly.'
      ]
    };

    res.json(plan);
  } catch (error) {
    console.error('Diet plan generation error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
