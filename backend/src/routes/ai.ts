import { Router, Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Mock AI Fitness Chat (Streaming)
// In a real app, you'd use OpenAI/Anthropic API here
router.post('/chat', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { messages, profileContext } = req.body;
    const lastMessage = messages[messages.length - 1].content.toLowerCase();

    // Set headers for SSE (Server-Sent Events) to mimic streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let responseText = "";
    
    if (lastMessage.includes('hello') || lastMessage.includes('hi')) {
      responseText = "Hello! I'm your AI fitness coach. Based on your profile, I can help you reach your goals. What would you like to focus on today? 💪";
    } else if (lastMessage.includes('workout') || lastMessage.includes('train')) {
      responseText = "For a great workout today, I recommend focusing on compound movements. Since you're looking to improve, try 3 sets of squats, push-ups, and planks. Remember to stay hydrated! 🏋️‍♂️";
    } else if (lastMessage.includes('diet') || lastMessage.includes('eat')) {
      responseText = "Nutrition is 70% of the work! Focus on high protein and complex carbs. Avoid processed sugars for the next few days to see a boost in your energy levels. 🥗";
    } else {
      responseText = "That's a great question! As your AI coach, I recommend staying consistent with your current routine. Consistency is key to long-term success. Do you have any specific exercises you'd like to learn more about? 📈";
    }

    // Simulate streaming by sending chunks
    const words = responseText.split(' ');
    for (const word of words) {
      const data = JSON.stringify({
        choices: [
          {
            delta: {
              content: word + ' '
            }
          }
        ]
      });
      res.write(`data: ${data}\n\n`);
      await new Promise(resolve => setTimeout(resolve, 50)); // Simulating delay
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('AI Chat error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// AI Diet Plan Generation
router.post('/diet-plan', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { profile, dietType } = req.body;
    
    // In a real app, this would call OpenAI/Gemini
    // Mocking response for now to match frontend expectations
    const targetCalories = 2200;
    
    const mockPlan = {
      dailyCalories: targetCalories,
      dailyProtein: 150,
      dailyCarbs: 250,
      dailyFat: 70,
      meals: [
        {
          mealType: 'breakfast',
          name: 'Protein Oats',
          calories: 450,
          protein: 30,
          carbs: 60,
          fat: 10,
          items: ['50g Oats', '1 scoop Whey', 'Blueberries', 'Almonds']
        },
        {
          mealType: 'lunch',
          name: dietType === 'vegetarian' ? 'Paneer Salad' : 'Chicken Salad',
          calories: 600,
          protein: 40,
          carbs: 20,
          fat: 25,
          items: ['Fresh Greens', dietType === 'vegetarian' ? '200g Paneer' : '150g Chicken', 'Olive Oil', 'Avocado']
        },
        {
          mealType: 'dinner',
          name: dietType === 'vegetarian' ? 'Lentil Soup' : 'Salmon with Quinoa',
          calories: 700,
          protein: 45,
          carbs: 80,
          fat: 20,
          items: [dietType === 'vegetarian' ? '2 cups Dal' : '150g Salmon', '100g Quinoa', 'Steamed Broccoli']
        },
        {
          mealType: 'snack',
          name: 'Greek Yogurt',
          calories: 250,
          protein: 20,
          carbs: 15,
          fat: 5,
          items: ['200g Yogurt', 'Honey']
        }
      ],
      tips: [
        'Stay hydrated with 3L+ water daily.',
        'Prioritize protein in every meal.',
        'Avoid processed sugars.'
      ]
    };
    
    res.json(mockPlan);
  } catch (error) {
    console.error('AI diet plan error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
