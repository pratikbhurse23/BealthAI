// ─────────────────────────────────────────────────────────────────────────────
// BealthAI — Central AI Wrapper
// Wraps Gemini 2.0 Flash for all intelligent coaching features.
// All functions return null on failure — never crash the UI.
// ─────────────────────────────────────────────────────────────────────────────

import { getGeminiKey } from "../components/geminiAI";

// Try gemini-2.0-flash first; fall back to gemini-1.5-flash on 429/404
const MODELS = [
    "gemini-2.0-flash",
    "gemini-1.5-flash",
];

function geminiUrl(model) {
    return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
}

let apiQueue = Promise.resolve();
const rateWindowMs = 60000;
const maxReqsPerMin = 5;
const requestStamps = [];

const cache = new Map();
const CACHE_TTL_MS = 60000;

function cleanCache() {
    const now = Date.now();
    for (const [key, { expiry }] of cache.entries()) {
        if (now > expiry) cache.delete(key);
    }
}

async function executeWithRetryAndLimits(prompt, base64Image = null, mimeType = null) {
    const apiKey = getGeminiKey();
    if (!apiKey) throw new Error("400: NO_API_KEY");

    const cacheKey = prompt + (base64Image ? "IMAGE" : "");
    cleanCache();
    if (cache.has(cacheKey)) {
        return cache.get(cacheKey).result;
    }

    // Wait if rate limit reached
    const now = Date.now();
    while (requestStamps.length > 0 && requestStamps[0] <= now - rateWindowMs) {
        requestStamps.shift();
    }
    if (requestStamps.length >= maxReqsPerMin) {
        const oldest = requestStamps[0];
        const waitTime = oldest + rateWindowMs - Date.now();
        if (waitTime > 0) {
            await new Promise((r) => setTimeout(r, waitTime));
        }
    }
    requestStamps.push(Date.now());

    let lastError = null;

    for (const model of MODELS) {
        const parts = [{ text: prompt }];
        if (base64Image) {
            parts.push({ inline_data: { mime_type: mimeType || "image/jpeg", data: base64Image } });
        }

        const runFetch = async () => {
            return await fetch(`${geminiUrl(model)}?key=${apiKey}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts }],
                }),
            });
        };

        let res = await runFetch();

        // Retry once on 429
        if (res.status === 429) {
            await new Promise(r => setTimeout(r, 8000));
            res = await runFetch();
        }

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            const msg = errData?.error?.message || res.statusText;
            lastError = new Error(`${res.status}: ${msg}`);
            // Only retry on 404 (model missing from region/tier) - for 429/403 fail immediately if second try fails
            if (res.status !== 404) throw lastError;
            continue;
        }

        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) return null;

        const clean = text
            .replace(/^```(?:json)?\s*/i, "")
            .replace(/\s*```\s*$/i, "")
            .trim();

        try {
            const result = JSON.parse(clean);
            cache.set(cacheKey, { result, expiry: Date.now() + CACHE_TTL_MS });
            return result;
        } catch { return null; }
    }

    if (lastError) throw lastError;
    return null;
}

// Global queue to ensure 1 concurrent request
export function callGemini(prompt, base64Image = null, mimeType = null) {
    return new Promise((resolve, reject) => {
        apiQueue = apiQueue.then(async () => {
            try {
                const res = await executeWithRetryAndLimits(prompt, base64Image, mimeType);
                resolve(res);
            } catch (e) {
                reject(e);
            }
        });
    });
}

// ─── 1. Meal Health Score ─────────────────────────────────────────────────────
// Returns: { score: 0-100, grade: "A"|"B"|"C"|"D", summary: string, tips: string[] }
export async function scoreMealHealth(todayFoods) {
    if (!todayFoods?.length) return null;

    const foodList = todayFoods
        .map(
            (f) =>
                `${f.food_name}: ${f.calories} kcal, ${f.protein}g protein, ${f.carbs}g carbs, ${f.fats}g fat (${f.food_category})`
        )
        .join("\n");

    const prompt = `You are a certified nutritionist AI. Analyse these foods eaten today:
${foodList}

Return ONLY compact JSON (no markdown, no explanation):
{
  "score": <integer 0-100, overall health score>,
  "grade": "<A|B|C|D>",
  "summary": "<1-2 sentence honest assessment of today's nutrition>",
  "tips": ["<actionable tip 1>", "<actionable tip 2>"]
}

Scoring guide: A=90-100 (excellent), B=70-89 (good), C=50-69 (moderate), D=0-49 (poor).
Be concise and practical.`;

    return await callGemini(prompt);
}

// ─── 2. Next Meal Suggestion ──────────────────────────────────────────────────
// Returns: { meal: string, reason: string, calories: number, emoji: string }
export async function getNextMealSuggestion(profile, caloriesConsumed, calorieBudget) {
    const remaining = Math.max(0, calorieBudget - caloriesConsumed);
    const timeOfDay = (() => {
        const h = new Date().getHours();
        if (h < 10) return "morning (breakfast time)";
        if (h < 13) return "mid-morning (snack or early lunch)";
        if (h < 16) return "afternoon (lunch or snack)";
        if (h < 20) return "evening (dinner time)";
        return "night (light snack if needed)";
    })();

    const profileCtx = profile
        ? `Age: ${profile.age || "unknown"}, Gender: ${profile.gender || "unknown"}, Goal: ${profile.weight_goal || "maintain"}, Activity: ${profile.activity_level || "sedentary"}`
        : "No profile available";

    const prompt = `You are a nutritionist AI for an Indian health app. Suggest ONE next meal for the user.

User profile: ${profileCtx}
Calories consumed today: ${caloriesConsumed} kcal
Daily calorie budget: ${calorieBudget} kcal
Remaining calories: ${remaining} kcal
Time of day: ${timeOfDay}

Suggest an Indian or healthy meal that fits the remaining calories.
Return ONLY compact JSON (no markdown):
{
  "meal": "<meal name and brief description, eg: Dal Tadka with brown rice>",
  "reason": "<1 sentence why this is a good choice right now>",
  "calories": <estimated kcal integer>,
  "emoji": "<one food emoji>"
}`;

    return await callGemini(prompt);
}

// ─── 3. Daily AI Summary ──────────────────────────────────────────────────────
// Returns: { greeting: string, calorieMessage: string, nextMeal: object,
//            exerciseTip: string, weeklyTip: string, overallScore: number }
export async function getDailyAISummary(profile, todayLogs, calorieBudget) {
    const consumed = todayLogs.reduce((s, l) => s + (l.calories || 0), 0);
    const remaining = Math.max(0, calorieBudget - consumed);
    const foodSummary = todayLogs.length
        ? todayLogs.map((l) => `${l.food_name} (${l.calories} kcal)`).join(", ")
        : "Nothing logged yet today";

    const hour = new Date().getHours();
    const timeCtx =
        hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";

    const profileCtx = profile
        ? `Name: ${profile.display_name || "User"}, Age: ${profile.age || "?"}, Gender: ${profile.gender || "?"}, Weight: ${profile.weight_kg || "?"}kg, Goal: ${profile.weight_goal || "maintain"}, Activity: ${profile.activity_level || "sedentary"}`
        : "No profile";

    const medicalCtx = (() => {
        if (!profile?.medical_conditions) return "None";
        try {
            const mc = JSON.parse(profile.medical_conditions);
            const active = Object.entries(mc)
                .filter(([, v]) => v)
                .map(([k]) => k);
            return active.length ? active.join(", ") : "None";
        } catch {
            return profile.medical_conditions || "None";
        }
    })();

    const prompt = `You are a personal AI health coach for BealthAI, an Indian health and nutrition app. Provide a daily coaching summary.

User profile: ${profileCtx}
Medical conditions: ${medicalCtx}
Time of day: ${timeCtx}
Calorie budget today: ${calorieBudget} kcal
Calories consumed: ${consumed} kcal
Remaining: ${remaining} kcal
Foods eaten today: ${foodSummary}

Return ONLY compact JSON (no markdown):
{
  "greeting": "<warm personal greeting using time of day, max 1 sentence>",
  "calorieMessage": "<short message about today's calorie status, eg: You have 800 kcal left — a balanced dinner fits perfectly>",
  "nextMeal": {
    "meal": "<Indian or healthy meal name + description>",
    "reason": "<why this meal is good right now, 1 sentence>",
    "calories": <estimated kcal integer>,
    "emoji": "<food emoji>"
  },
  "exerciseTip": "<specific exercise suggestion based on calories consumed, eg: A 20-min brisk walk will burn ~100 kcal and improve your digestion>",
  "weeklyTip": "<one actionable general health or nutrition tip, fresh and practical>",
  "overallScore": <integer 0-100, today's overall health score based on foods eaten>
}

Keep responses concise and encouraging. Focus on Indian foods and culture.`;

    return await callGemini(prompt);
}
