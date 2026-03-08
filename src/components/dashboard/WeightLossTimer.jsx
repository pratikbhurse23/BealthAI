import React from "react";
import { Timer, TrendingDown, TrendingUp, CheckCircle2 } from "lucide-react";

// Human-friendly relative time label
function formatRelative(daysTotal) {
  if (daysTotal <= 0) return null;
  const years = Math.floor(daysTotal / 365);
  const months = Math.floor((daysTotal % 365) / 30);
  const days = daysTotal % 30;
  if (years > 0 && months > 0) return `${years}y ${months}m`;
  if (years > 0) return `${years} year${years > 1 ? "s" : ""}`;
  if (months > 0 && days > 0) return `${months}mo ${days}d`;
  if (months > 0) return `${months} month${months > 1 ? "s" : ""}`;
  return `${daysTotal} day${daysTotal !== 1 ? "s" : ""}`;
}

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

  const kgToLose = Math.abs(diff);
  const totalKcalNeeded = kgToLose * 7700;
  const effectiveDeficit = 500; // kcal/day
  const daysNeeded = Math.round(totalKcalNeeded / effectiveDeficit);
  const relLabel = formatRelative(daysNeeded);

  const isLosing = diff < 0;

  // If user has set a custom deadline, show time to deadline too
  const deadlineLabel = (() => {
    if (!profile.goal_deadline) return null;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const dl = new Date(profile.goal_deadline); dl.setHours(0, 0, 0, 0);
    const d = Math.round((dl - today) / (24 * 60 * 60 * 1000));
    if (d <= 0) return "Deadline passed";
    return formatRelative(d) + " to deadline";
  })();

  return (
    <div className={`rounded-3xl border p-5 ${isLosing
      ? "bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border-violet-200 dark:border-violet-800"
      : "bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20 border-blue-200 dark:border-blue-800"}`}>
      <div className="flex items-center gap-2 mb-3">
        <Timer className={`w-5 h-5 ${isLosing ? "text-violet-600" : "text-blue-500"}`} />
        <span className={`font-bold text-sm ${isLosing ? "text-violet-700 dark:text-violet-400" : "text-blue-700 dark:text-blue-400"}`}>
          {isLosing ? "Weight-Loss" : "Weight-Gain"} Timer
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          { label: "kg to go", value: kgToLose.toFixed(1) },
          { label: "days (safe pace)", value: daysNeeded },
          { label: "time needed", value: relLabel },
        ].map(stat => (
          <div key={stat.label} className={`rounded-2xl p-3 ${isLosing ? "bg-violet-100 dark:bg-violet-900/30" : "bg-blue-100 dark:bg-blue-900/30"}`}>
            <p className={`text-lg font-extrabold ${isLosing ? "text-violet-700 dark:text-violet-300" : "text-blue-700 dark:text-blue-300"}`}>
              {stat.value}
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide leading-tight mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <p className={`text-xs mt-3 flex items-center gap-1.5 ${isLosing ? "text-violet-600 dark:text-violet-300" : "text-blue-600 dark:text-blue-300"}`}>
        {isLosing ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
        At 500 kcal/day {isLosing ? "deficit" : "surplus"}: reach{" "}
        <strong className="mx-0.5">{profile.goal_weight_kg} kg</strong> in{" "}
        <strong className="mx-0.5">{relLabel}</strong>
        {deadlineLabel && <span className="ml-1 text-violet-400 dark:text-violet-500">· {deadlineLabel}</span>}
      </p>
    </div>
  );
}