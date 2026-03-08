import React, { useState, useEffect } from "react";
import { api } from "../api/client";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Progress } from "../components/ui/progress";
import { Flame, Target, Activity, User, ArrowRight, TrendingDown, TrendingUp, Minus, Scale } from "lucide-react";
import { calorieStore } from "../components/localStore";
import { calcBMR, calcTDEE, calcCalorieBudget, calcGoalProgress } from "../components/bmr";
import WeightLossTimer from "../components/dashboard/WeightLossTimer";
import AINutritionCoach from "../components/dashboard/AINutritionCoach";
import DietPlanGenerator from "../components/dashboard/DietPlanGenerator";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [todayLogs, setTodayLogs] = useState([]);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    const me = await api.auth.me();
    setUser(me);
    const profiles = await api.entities.UserProfile.filter({ created_by: me.email });
    if (profiles.length > 0) setProfile(profiles[0]);
    setTodayLogs(calorieStore.listByDate(today));
  }

  const bmr = profile
    ? Math.round(calcBMR(profile.weight_kg, profile.height_cm, profile.age, profile.gender))
    : null;
  const tdee = bmr ? calcTDEE(bmr, profile.activity_level) : null;
  const hasMedical = profile?.medical_conditions && (() => { try { return Object.values(JSON.parse(profile.medical_conditions)).some(Boolean); } catch { return false; } })();
  const budget = hasMedical && profile?.doctor_calorie_target
    ? profile.doctor_calorie_target
    : tdee
      ? calcCalorieBudget(tdee, profile.weight_kg, profile.goal_weight_kg || null)
      : 2000;

  const consumed = todayLogs.reduce((s, l) => s + (l.calories || 0), 0);
  const remaining = Math.max(0, budget - consumed);
  const calorieProgress = Math.min(100, Math.round((consumed / budget) * 100));

  const goalProgress = profile?.start_weight_kg && profile?.goal_weight_kg
    ? calcGoalProgress(profile.start_weight_kg, profile.weight_kg, profile.goal_weight_kg)
    : null;

  const weightDiff = profile?.goal_weight_kg && profile?.weight_kg
    ? (profile.goal_weight_kg - profile.weight_kg).toFixed(1)
    : null;

  const isLosing = weightDiff < 0;
  const isGaining = weightDiff > 0;

  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? "Good morning" : greetingHour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.full_name?.split(" ")[0] || "there";

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-amber-50/50 dark:from-gray-950 dark:via-gray-950 dark:to-gray-950">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12 space-y-5">

        {/* Greeting */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-sm text-gray-400 dark:text-gray-500">{greeting},</p>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">{firstName} 👋</h1>
        </motion.div>

        {/* No profile CTA */}
        {!profile && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl p-5 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-amber-800 dark:text-amber-300">Set up your profile</p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Get personalised calorie budget & goal tracking</p>
            </div>
            <Link to={createPageUrl("Profile")} className="flex-shrink-0">
              <button className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors min-h-[44px]">
                Start <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </motion.div>
        )}

        {/* Daily Calorie Budget Card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <span className="font-semibold text-gray-800 dark:text-white text-sm">Today's Calories</span>
            </div>
            <span className="text-xs text-gray-400">{consumed} / {budget} kcal</span>
          </div>

          <div className="mt-3 mb-2">
            <Progress value={calorieProgress}
              className={`h-4 rounded-full ${consumed > budget ? "[&>div]:bg-red-500" : consumed > budget * 0.9 ? "[&>div]:bg-orange-400" : "[&>div]:bg-gradient-to-r [&>div]:from-amber-400 [&>div]:to-orange-400"}`} />
          </div>

          <div className="flex justify-between text-xs text-gray-400 mb-5">
            <span>{calorieProgress}% of daily budget</span>
            <span className={remaining === 0 ? "text-red-500 font-semibold" : ""}>{remaining} kcal remaining</span>
          </div>

          {/* Macro summary */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Protein", value: todayLogs.reduce((s, l) => s + (l.protein || 0), 0).toFixed(0) + "g", color: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300" },
              { label: "Carbs", value: todayLogs.reduce((s, l) => s + (l.carbs || 0), 0).toFixed(0) + "g", color: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300" },
              { label: "Fats", value: todayLogs.reduce((s, l) => s + (l.fats || 0), 0).toFixed(0) + "g", color: "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300" },
            ].map(m => (
              <div key={m.label} className={`${m.color} rounded-2xl p-3 text-center`}>
                <p className="text-base font-bold">{m.value}</p>
                <p className="text-[10px] uppercase tracking-wide opacity-70">{m.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* AI Nutrition Coach */}
        <AINutritionCoach profile={profile} todayLogs={todayLogs} calorieBudget={budget} />

        {/* AI Diet Plan Generator */}
        <DietPlanGenerator profile={profile} todayLogs={todayLogs} />

        {/* Goal Progress Card */}
        {profile?.weight_goal && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-emerald-500" />
              <span className="font-semibold text-gray-800 dark:text-white text-sm">Goal Progress</span>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{profile.weight_kg} kg</p>
                <p className="text-xs text-gray-400 mt-0.5">Current weight</p>
              </div>
              <div className="flex flex-col items-center">
                {isLosing ? <TrendingDown className="w-5 h-5 text-emerald-500" /> : isGaining ? <TrendingUp className="w-5 h-5 text-blue-500" /> : <Minus className="w-5 h-5 text-gray-400" />}
                <span className={`text-xs font-semibold mt-0.5 ${isLosing ? "text-emerald-500" : isGaining ? "text-blue-500" : "text-gray-400"}`}>
                  {weightDiff > 0 ? `+${weightDiff}` : weightDiff} kg
                </span>
              </div>
              <div className="flex-1 text-right">
                <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{profile.goal_weight_kg} kg</p>
                <p className="text-xs text-gray-400 mt-0.5">Target weight</p>
              </div>
            </div>

            {goalProgress !== null && (
              <>
                <Progress value={goalProgress} className="h-3 rounded-full mb-1 [&>div]:bg-gradient-to-r [&>div]:from-emerald-400 [&>div]:to-green-500" />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{profile.weight_goal}</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{goalProgress}% complete</span>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* Stats row */}
        {profile && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="grid grid-cols-2 gap-3">
            {[
              { label: "BMR", value: bmr?.toLocaleString(), unit: "kcal/day", icon: Flame, color: "from-rose-400 to-red-500", desc: "Resting burn rate" },
              { label: "TDEE", value: tdee?.toLocaleString(), unit: "kcal/day", icon: Activity, color: "from-amber-400 to-orange-500", desc: "Total daily burn" },
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-3 shadow-sm">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white leading-none">{s.value}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">{s.label}</p>
                    <p className="text-xs text-gray-400">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* Weight Loss Timer */}
        {profile && <WeightLossTimer profile={profile} budget={budget} />}

        {/* Medical condition banner */}
        {hasMedical && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl px-4 py-3 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
            ❤️ <span><strong>Medical mode active</strong> — {profile.doctor_calorie_target ? `Doctor's target: ${profile.doctor_calorie_target} kcal/day` : "Please enter your doctor's calorie target in Profile."}</span>
          </motion.div>
        )}

        {/* Quick links */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="grid grid-cols-2 gap-3">
          {[
            { label: "Log Food", to: "CalorieTracker", emoji: "🍽️", desc: "Track what you eat" },
            { label: "Scan Food", to: "FoodScanner", emoji: "📷", desc: "AI photo + portion calc" },
            { label: "Exercise", to: "ExerciseEngine", emoji: "💪", desc: "Home, outdoor, gym" },
            { label: "Edit Profile", to: "Profile", emoji: "⚙️", desc: "Update your stats" },
          ].map(q => (
            <Link key={q.label} to={createPageUrl(q.to)}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-3 shadow-sm hover:border-amber-200 hover:shadow-md transition-all group">
              <span className="text-2xl">{q.emoji}</span>
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{q.label}</p>
                <p className="text-xs text-gray-400">{q.desc}</p>
              </div>
            </Link>
          ))}
        </motion.div>
      </div>
    </div>
  );
}