import React, { useState, useEffect } from "react";
import { api } from "../api/client";
import { motion } from "framer-motion";
import { Dumbbell } from "lucide-react";
import ExerciseEngineComponent from "../components/exercise/ExerciseEngine";
import WeightLossTimer from "../components/dashboard/WeightLossTimer";
import { calcBMR, calcTDEE, calcCalorieBudget } from "../components/bmr";
import { calorieStore } from "../components/localStore";

export default function ExerciseEnginePage() {
  const [profile, setProfile] = useState(null);
  const [todayCalories, setTodayCalories] = useState(0);
  const [budget, setBudget] = useState(2000);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setTodayCalories(calorieStore.listByDate(today).reduce((s, l) => s + (l.calories || 0), 0));
    api.auth.me().then(me =>
      api.entities.UserProfile.filter({ created_by: me.email }).then(profiles => {
        if (profiles.length > 0) {
          const p = profiles[0];
          setProfile(p);
          const bmr = calcBMR(p.weight_kg, p.height_cm, p.age, p.gender);
          const tdee = calcTDEE(bmr, p.activity_level);
          setBudget(calcCalorieBudget(tdee, p.weight_kg, p.goal_weight_kg || null));
        }
      })
    ).catch(() => { });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-amber-50/50 dark:from-gray-950 dark:via-gray-950 dark:to-gray-950">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12 space-y-5">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Exercise Engine</h1>
            <p className="text-sm text-gray-400">Personalized workouts based on your profile & location</p>
          </div>
        </motion.div>

        <WeightLossTimer profile={profile} budget={budget} />
        <ExerciseEngineComponent calories={todayCalories} profile={profile} />
      </div>
    </div>
  );
}