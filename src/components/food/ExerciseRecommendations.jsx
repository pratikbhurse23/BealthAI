import React from "react";
import { motion } from "framer-motion";
import { Dumbbell, Clock, Zap, TrendingUp } from "lucide-react";

export default function ExerciseRecommendations({ exercisesJson, calories }) {
  let exercises = [];
  if (typeof exercisesJson === "string") {
    try { exercises = JSON.parse(exercisesJson); } catch { exercises = []; }
  } else if (Array.isArray(exercisesJson)) {
    exercises = exercisesJson;
  }

  if (!exercises.length) return null;

  const intensityColors = {
    low: "from-green-400 to-emerald-500",
    moderate: "from-amber-400 to-orange-500",
    high: "from-red-400 to-rose-500",
  };

  const intensityBg = {
    low: "bg-green-50 border-green-200",
    moderate: "bg-amber-50 border-amber-200",
    high: "bg-red-50 border-red-200",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-rose-50 to-orange-50 rounded-2xl p-5 border border-rose-100"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-400 to-orange-500 flex items-center justify-center">
            <Dumbbell className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Burn It Off</h3>
            <p className="text-xs text-gray-500">Exercises to offset {calories} kcal</p>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {exercises.map((ex, i) => {
          const intensity = (ex.intensity || "moderate").toLowerCase();
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-xl p-4 border ${intensityBg[intensity] || intensityBg.moderate}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">{ex.name || ex.exercise}</h4>
                  {ex.description && (
                    <p className="text-xs text-gray-500 mt-1">{ex.description}</p>
                  )}
                </div>
                <div className={`px-2 py-0.5 rounded-full bg-gradient-to-r ${intensityColors[intensity] || intensityColors.moderate} text-white text-[10px] font-semibold uppercase tracking-wider`}>
                  {intensity}
                </div>
              </div>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{ex.duration || "20 min"}</span>
                </div>
                {ex.calories_burned && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <Zap className="w-3.5 h-3.5" />
                    <span>{ex.calories_burned} kcal</span>
                  </div>
                )}
                {ex.sets && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{ex.sets}</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}