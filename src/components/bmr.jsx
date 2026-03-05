/**
 * BMR & TDEE calculations using Mifflin-St Jeor equation
 */

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  active: 1.55,
  athlete: 1.9,
};

export function calcBMR(weightKg, heightCm, age, gender) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === "male" ? base + 5 : base - 161;
}

export function calcTDEE(bmr, activityLevel) {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] ?? 1.2;
  return Math.round(bmr * multiplier);
}

export function calcCalorieBudget(tdee, currentWeight, goalWeight) {
  if (!goalWeight) return tdee;
  const diff = goalWeight - currentWeight;
  if (Math.abs(diff) < 0.5) return tdee;
  const adjustment = diff < 0 ? -500 : 500;
  return Math.max(1200, tdee + adjustment);
}

export function calcGoalProgress(startWeight, currentWeight, goalWeight) {
  if (!startWeight || !goalWeight || startWeight === goalWeight) return 0;
  const total = Math.abs(goalWeight - startWeight);
  const done = Math.abs(currentWeight - startWeight);
  return Math.min(100, Math.round((done / total) * 100));
}

export const ACTIVITY_LABELS = {
  sedentary: "Sedentary",
  active: "Active",
  athlete: "Athlete",
};