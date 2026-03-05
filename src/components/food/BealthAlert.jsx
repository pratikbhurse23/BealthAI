import React from "react";
import { AlertTriangle, Leaf } from "lucide-react";

const HIGH_SAT_FAT_FOODS = ["butter", "ghee", "paneer", "cream", "coconut", "puri", "paratha", "samosa", "pakora", "vada", "bhatura", "jalebi", "ladoo", "halwa", "barfi"];
const HIGH_SUGAR_FOODS = ["jalebi", "gulab jamun", "rasgulla", "ladoo", "halwa", "barfi", "kheer", "mithai", "sweet", "dessert", "ice cream", "cola", "soda", "juice"];

const ALTERNATIVES = {
  default: "Try roti with dal, grilled paneer, or a bowl of sabzi with brown rice.",
  fried: "Try baked or air-fried version, or opt for tandoori preparation instead.",
  sweet: "Try a fruit chaat, dates with nuts, or a small bowl of dahi with honey.",
  fatty: "Try grilled chicken/tofu, low-fat dahi, or steamed vegetables with spices.",
};

function getAlert(food) {
  if (!food) return null;
  const name = food.food_name?.toLowerCase() || "";
  const fats = food.fats || 0;
  const sugar = food.sugar || 0;

  const isHighSatFat = fats > 15 || HIGH_SAT_FAT_FOODS.some(f => name.includes(f));
  const isHighSugar = sugar > 20 || HIGH_SUGAR_FOODS.some(f => name.includes(f));

  if (!isHighSatFat && !isHighSugar) return null;

  const isFried = ["fried", "puri", "samosa", "pakora", "vada", "bhatura", "tikki"].some(f => name.includes(f));
  const isSweet = HIGH_SUGAR_FOODS.some(f => name.includes(f));

  return {
    reason: isHighSugar
      ? `High sugar content (${sugar}g) — may cause blood sugar spikes`
      : `High saturated fat (${fats}g) — may raise cholesterol`,
    alternative: isFried ? ALTERNATIVES.fried : isSweet ? ALTERNATIVES.sweet : isHighSatFat ? ALTERNATIVES.fatty : ALTERNATIVES.default,
  };
}

export default function BealthAlert({ food }) {
  const alert = getAlert(food);
  if (!alert) return null;

  return (
    <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-red-700 dark:text-red-400 mb-1">⚠️ Bealth Alert</p>
          <p className="text-xs text-red-600 dark:text-red-300 mb-2">{alert.reason}</p>
          <div className="flex items-start gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-2.5">
            <Leaf className="w-3.5 h-3.5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-green-700 dark:text-green-300"><strong>Healthier choice:</strong> {alert.alternative}</p>
          </div>
        </div>
      </div>
    </div>
  );
}