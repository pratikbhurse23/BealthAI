import React from "react";
import { motion } from "framer-motion";
import { Heart, ShieldCheck, Zap, Droplets, Dumbbell, TrendingUp, Brain, Leaf } from "lucide-react";

const BENEFIT_ICONS = {
  "blood": Droplets,
  "muscle": Dumbbell,
  "weight": TrendingUp,
  "immune": ShieldCheck,
  "energy": Zap,
  "heart": Heart,
  "brain": Brain,
  "default": Leaf,
};

function getBenefitIcon(benefit) {
  const lower = benefit.toLowerCase();
  if (lower.includes("blood")) return Droplets;
  if (lower.includes("muscle") || lower.includes("strength")) return Dumbbell;
  if (lower.includes("weight") || lower.includes("gain") || lower.includes("loss")) return TrendingUp;
  if (lower.includes("immune") || lower.includes("protect")) return ShieldCheck;
  if (lower.includes("energy") || lower.includes("stamina")) return Zap;
  if (lower.includes("heart") || lower.includes("cardio")) return Heart;
  if (lower.includes("brain") || lower.includes("memory") || lower.includes("focus")) return Brain;
  return Leaf;
}

export default function HealthBenefits({ benefitsJson, foodCategory }) {
  let benefits = [];

  try {
    const parsed = typeof benefitsJson === "string" ? JSON.parse(benefitsJson) : benefitsJson;
    if (Array.isArray(parsed)) benefits = parsed;
  } catch {
    return null;
  }

  if (!benefits.length) return null;

  const cardColor =
    foodCategory === "healthy"
      ? "from-emerald-50 to-green-50 border-emerald-200"
      : foodCategory === "unhealthy"
        ? "from-rose-50 to-orange-50 border-rose-200"
        : "from-amber-50 to-yellow-50 border-amber-200";

  const titleColor =
    foodCategory === "healthy" ? "text-emerald-800" : foodCategory === "unhealthy" ? "text-rose-800" : "text-amber-800";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`bg-gradient-to-br ${cardColor} border rounded-2xl p-5`}
    >
      <h3 className={`font-semibold ${titleColor} mb-3 flex items-center gap-2`}>
        <span className="text-lg">🌿</span> Why This Food Matters
      </h3>
      <ul className="space-y-2">
        {benefits.map((b, i) => {
          const Icon = getBenefitIcon(b.title || b);
          const title = typeof b === "string" ? b : b.title;
          const desc = typeof b === "string" ? null : b.description;
          return (
            <li key={i} className="flex items-start gap-3">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${foodCategory === "healthy" ? "bg-emerald-100" : foodCategory === "unhealthy" ? "bg-rose-100" : "bg-amber-100"}`}>
                <Icon className={`w-3.5 h-3.5 ${foodCategory === "healthy" ? "text-emerald-600" : foodCategory === "unhealthy" ? "text-rose-600" : "text-amber-600"}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{title}</p>
                {desc && <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>}
              </div>
            </li>
          );
        })}
      </ul>
    </motion.div>
  );
}