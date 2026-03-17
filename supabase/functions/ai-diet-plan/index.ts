import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { profile, dietType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert nutritionist. Generate a personalized daily meal plan based on the user's profile.

User Profile:
- Age: ${profile?.age || 'Unknown'}
- Gender: ${profile?.gender || 'Unknown'}
- Height: ${profile?.height_cm || 'Unknown'} cm
- Weight: ${profile?.weight_kg || 'Unknown'} kg
- BMI: ${profile?.bmi || 'Unknown'}
- Goal: ${profile?.goal || 'general fitness'}
- Activity Level: ${profile?.activity_level || 'moderate'}
- Diet Preference: ${dietType || 'non-vegetarian'}

Calculate their estimated daily calorie needs using the Mifflin-St Jeor equation adjusted for their activity level and goal.

Return ONLY valid JSON (no markdown, no code blocks) in this exact format:
{
  "daily_calories": number,
  "daily_protein_g": number,
  "daily_carbs_g": number,
  "daily_fat_g": number,
  "meals": [
    {
      "meal_type": "breakfast|lunch|dinner|snack",
      "name": "string",
      "calories": number,
      "protein_g": number,
      "carbs_g": number,
      "fat_g": number,
      "items": ["ingredient 1", "ingredient 2"]
    }
  ],
  "tips": ["tip 1", "tip 2", "tip 3"]
}

Include 4 meals (breakfast, lunch, snack, dinner). Make it practical and realistic.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Generate my personalized meal plan." },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Try to parse JSON from the response
    let mealPlan;
    try {
      // Remove potential markdown code blocks
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      mealPlan = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse meal plan JSON:", content);
      return new Response(JSON.stringify({ error: "Failed to generate meal plan. Please try again." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(mealPlan), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("diet plan error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
