// Free Gemini AI — get a free key at https://aistudio.google.com/app/apikey

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
  const apiKey = getGeminiKey();
  if (!apiKey) throw new Error("NO_API_KEY");

  const base64 = await fileToBase64(imageFile);
  const mimeType = imageFile.type || "image/jpeg";

  const prompt = `Identify this food and return ONLY compact JSON (no markdown):
{"food_name":"","food_category":"healthy|moderate|unhealthy","serving_size":"","calories":0,"protein":0,"carbs":0,"fats":0,"fiber":0,"sugar":0,"vitamins":[{"name":"","amount":""}],"health_warning":"","exercises":[{"name":"","duration":"","intensity":"low|moderate|high","calories_burned":0,"description":""}],"healthier_alternatives":""}
Nutrition per standard serving. health_warning and healthier_alternatives only if unhealthy/moderate.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: base64 } }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    if (response.status === 400 || response.status === 403) throw new Error("INVALID_KEY");
    throw new Error(err?.error?.message || "AI request failed");
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  const raw = JSON.parse(text);
  return raw;
}

export async function generateDietPlan(recentFoods) {
  const apiKey = getGeminiKey();
  if (!apiKey) throw new Error("NO_API_KEY");

  const foodList = recentFoods.length
    ? recentFoods.map((a) => `${a.food_name} (${a.calories} kcal, ${a.food_category})`).join(", ")
    : "No recent data";

  const prompt = `You are a certified nutritionist. Generate a personalized daily diet plan.

Recent foods eaten: ${foodList}

Return ONLY valid JSON (no markdown):
{
  "plan_name": "string",
  "daily_calorie_goal": 2000,
  "meals": [{"time_label": "string", "suggestion": "string", "calories": 0}],
  "notification_times": ["7:30 AM"]
}

Include 5-6 balanced meals. Focus on healthy nutrition.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    }
  );

  if (!response.ok) throw new Error("AI request failed");
  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  return JSON.parse(text);
}