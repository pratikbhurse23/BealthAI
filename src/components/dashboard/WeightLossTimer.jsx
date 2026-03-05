import React from "react";
import { Timer, TrendingDown, TrendingUp, CheckCircle2 } from "lucide-react";

export default function WeightLossTimer({ profile, budget }) {
  if (!profile?.goal_weight_kg || !profile?.weight_kg) return null;

  const diff = profile.goal_weight_kg - profile.weight_kg;
  if (Math.abs(diff) < 0.1) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-3xl p-5 flex items-center gap-4">
        <CheckCircle2 className="w-8 h-8 text-green-500 flex-shrink-0" />
        <div>
          <p className="font-bold text-green-700 dark:text-green-400">🎉 Goal Reached!</p>
          <p className="text-xs text-green-600 dark:text-green-300">You've reached your target weight. Set a new goal!</p>
        </div>
      </div>
    );
  }

  // 0.5 kg per week = 500 kcal deficit per day → 1 kg = 7700 kcal
  const kgToLose = Math.abs(diff);
  const totalKcalNeeded = kgToLose * 7700;
  const dailyDeficit = Math.abs(budget - (budget + (diff < 0 ? -500 : 500)));
  const effectiveDeficit = Math.max(300, 500); // assume 500 kcal/day deficit
  const daysNeeded = Math.round(totalKcalNeeded / effectiveDeficit);
  const weeksNeeded = (daysNeeded / 7).toFixed(1);

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + daysNeeded);
  const targetDateStr = targetDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  const isLosing = diff < 0;

  return (
    <div className={`rounded-3xl border p-5 ${isLosing ? "bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border-violet-200 dark:border-violet-800" : "bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20 border-blue-200 dark:border-blue-800"}`}>
      <div className="flex items-center gap-2 mb-3">
        <Timer className={`w-5 h-5 ${isLosing ? "text-violet-600" : "text-blue-500"}`} />
        <span className={`font-bold text-sm ${isLosing ? "text-violet-700 dark:text-violet-400" : "text-blue-700 dark:text-blue-400"}`}>
          Weight-Loss Timer
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className={`rounded-2xl p-3 ${isLosing ? "bg-violet-100 dark:bg-violet-900/30" : "bg-blue-100 dark:bg-blue-900/30"}`}>
          <p className={`text-xl font-extrabold ${isLosing ? "text-violet-700 dark:text-violet-300" : "text-blue-700 dark:text-blue-300"}`}>{kgToLose.toFixed(1)}</p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">kg to go</p>
        </div>
        <div className={`rounded-2xl p-3 ${isLosing ? "bg-violet-100 dark:bg-violet-900/30" : "bg-blue-100 dark:bg-blue-900/30"}`}>
          <p className={`text-xl font-extrabold ${isLosing ? "text-violet-700 dark:text-violet-300" : "text-blue-700 dark:text-blue-300"}`}>{daysNeeded}</p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">days left</p>
        </div>
        <div className={`rounded-2xl p-3 ${isLosing ? "bg-violet-100 dark:bg-violet-900/30" : "bg-blue-100 dark:bg-blue-900/30"}`}>
          <p className={`text-xl font-extrabold ${isLosing ? "text-violet-700 dark:text-violet-300" : "text-blue-700 dark:text-blue-300"}`}>{weeksNeeded}</p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">weeks</p>
        </div>
      </div>

      <p className={`text-xs mt-3 flex items-center gap-1.5 ${isLosing ? "text-violet-600 dark:text-violet-300" : "text-blue-600 dark:text-blue-300"}`}>
        {isLosing ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
        At 500 kcal/day {isLosing ? "deficit" : "surplus"}, you'll reach <strong className="ml-1">{profile.goal_weight_kg} kg</strong>&nbsp;by <strong>{targetDateStr}</strong>
      </p>
    </div>
  );
}