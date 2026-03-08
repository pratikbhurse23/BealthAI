// Free Gemini AI — get a free key at https://aistudio.google.com/app/apikey
import { callGemini } from "../lib/aiWrapper";

const GEMINI_KEY_STORAGE = "nutriscan_gemini_key";

export function getGeminiKey() {
  return localStorage.getItem(GEMINI_KEY_STORAGE) || "";
}

export function setGeminiKey(key) {
  localStorage.setItem(GEMINI_KEY_STORAGE, key);
}

export function hasGeminiKey() {
  return !!getGeminiKey();
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function analyzeFood(imageFile) {
  const base64 = await fileToBase64(imageFile);
  const mimeType = imageFile.type || "image/jpeg";

  const prompt = `Identify this food and return ONLY compact JSON (no markdown):
{"food_name":"","food_category":"healthy|moderate|unhealthy","serving_size":"","calories":0,"protein":0,"carbs":0,"fats":0,"fiber":0,"sugar":0,"vitamins":[{"name":"","amount":""}],"health_warning":"","exercises":[{"name":"","duration":"","intensity":"low|moderate|high","calories_burned":0,"description":""}],"healthier_alternatives":""}
Nutrition per standard serving. health_warning and healthier_alternatives only if unhealthy/moderate.`;

  try {
    const raw = await callGemini(prompt, base64, mimeType);
    if (!raw) throw new Error("AI request failed");
    return raw;
  } catch (err) {
    const msg = err?.message || "";
    if (msg.includes("400") || msg.includes("403") || msg.includes("INVALID_KEY")) throw new Error("INVALID_KEY");
    throw new Error(msg || "AI request failed");
  }
}

export async function generateDietPlan(userProfile, recentFoods = []) {
  const foodList = recentFoods.length
    ? recentFoods.map((a) => `${a.food_name} (${a.calories} kcal)`).join(", ")
    : "No recent data";

  const {
    name = "User",
    age = 30,
    gender = "Not specified",
    height = 170,
    weight = 70,
    goal = "maintain",
    activityLevel = "moderate",
    diet_preference = "Not specified"
  } = userProfile || {};

  const prompt = `You are an expert sports nutritionist and dietitian. Generate a personalized 1-day diet plan for this user.

USER PROFILE:
Name: ${name}
Age: ${age}
Gender: ${gender}
Height: ${height} cm
Weight: ${weight} kg
Primary Goal: ${goal}
Activity Level: ${activityLevel}
Diet Preference: ${diet_preference}

Foods recently eaten (avoid if possible for variety): ${foodList}

Create a specific, actionable meal plan that hits their daily calorie and macronutrient targets based on their profile. 
The foods MUST align with their Diet Preference (e.g., if Vegan, no dairy/meat; if Jain, no root vegetables).

Return ONLY valid JSON (no markdown):
{
  "plan_name": "string (e.g., High-Protein Fat Loss Plan)",
  "daily_calorie_goal": 2000,
  "daily_macros": {
    "protein": 150,
    "carbs": 200,
    "fats": 65
  },
  "meals": [
    {
      "type": "Breakfast",
      "time_label": "8:00 AM",
      "food_items": [
        { "name": "Oatmeal with berries", "portion": "1 bowl (200g)", "calories": 300, "protein": 10, "carbs": 50, "fats": 5 }
      ],
      "total_calories": 300
    },
    {
      "type": "Lunch",
      "time_label": "1:00 PM",
      "food_items": [...],
      "total_calories": 0
    },
    {
      "type": "Snack",
      "time_label": "4:30 PM",
      "food_items": [...],
      "total_calories": 0
    },
    {
      "type": "Dinner",
      "time_label": "8:00 PM",
      "food_items": [...],
      "total_calories": 0
    }
  ],
  "hydration_tip": "string"
}

Ensure exactly 4 meal segments: Breakfast, Lunch, Snack, Dinner. Make the foods realistic and specific.`;

  try {
    const raw = await callGemini(prompt);
    if (!raw) throw new Error("AI request failed");
    return raw;
  } catch (err) {
    throw new Error(err?.message || "AI request failed");
  }
}