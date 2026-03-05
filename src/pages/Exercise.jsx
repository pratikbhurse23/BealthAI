import React, { useState, useEffect } from "react";
import { api } from "../api/client";
import { motion } from "framer-motion";
import { Home, MapPin, Dumbbell, CheckCircle2, XCircle, Clock, Flame, ChevronRight, Timer } from "lucide-react";
import { Button } from "../components/ui/button";
import { calorieStore } from "../components/localStore";
import { calcBMR, calcTDEE, calcCalorieBudget } from "../components/bmr";

const HOME_EXERCISES = {
  beginner: [
    { name: "Yoga – Surya Namaskar", duration: "20 min", calories: 120, icon: "🧘" },
    { name: "Squats", duration: "15 min", calories: 90, icon: "🏋️" },
    { name: "Pushups", duration: "10 min", calories: 70, icon: "💪" },
    { name: "Plank", duration: "5 min", calories: 30, icon: "🔥" },
  ],
  intermediate: [
    { name: "Yoga – Power Flow", duration: "30 min", calories: 200, icon: "🧘" },
    { name: "Burpees", duration: "15 min", calories: 180, icon: "💥" },
    { name: "Jump Squats", duration: "15 min", calories: 150, icon: "🏋️" },
    { name: "Mountain Climbers", duration: "10 min", calories: 100, icon: "⛰️" },
  ],
  advanced: [
    { name: "HIIT Circuit", duration: "30 min", calories: 350, icon: "🔥" },
    { name: "Advanced Yoga", duration: "45 min", calories: 280, icon: "🧘" },
    { name: "Tabata", duration: "20 min", calories: 240, icon: "⚡" },
    { name: "Pushup Variations", duration: "20 min", calories: 160, icon: "💪" },
  ]
};

const OUTDOOR_ROUTES = [
  { name: "Morning Walk", pace: "Brisk Walk", burnRate: 4, icon: "🚶", color: "from-green-400 to-emerald-500" },
  { name: "Jogging Route", pace: "Light Jog", burnRate: 8, icon: "🏃", color: "from-blue-400 to-cyan-500" },
  { name: "Running", pace: "Moderate Run", burnRate: 11, icon: "🏃‍♂️", color: "from-orange-400 to-red-500" },
];

export default function Exercise() {
  const [location, setLocation] = useState("home");
  const [profile, setProfile] = useState(null);
  const [todayCalories, setTodayCalories] = useState(0);
  const [feedback, setFeedback] = useState({}); // exerciseName -> true/false
  const [noCount, setNoCount] = useState({});
  const [skippedExercises, setSkippedExercises] = useState(new Set());
  const [daysToGoal, setDaysToGoal] = useState(null);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    api.auth.me().then(me =>
      api.entities.UserProfile.filter({ created_by: me.email }).then(ps => {
        if (ps.length > 0) setProfile(ps[0]);
      })
    ).catch(() => { });
    const logs = calorieStore.listByDate(today);
    setTodayCalories(logs.reduce((s, l) => s + (l.calories || 0), 0));
  }, []);

  useEffect(() => {
    if (!profile) return;
    const bmr = calcBMR(profile.weight_kg, profile.height_cm, profile.age, profile.gender);
    const tdee = calcTDEE(bmr, profile.activity_level);
    const budget = calcCalorieBudget(tdee, profile.weight_kg, profile.goal_weight_kg || null);
    const dailyDeficit = tdee - budget;
    if (dailyDeficit > 0 && profile.weight_kg && profile.goal_weight_kg) {
      const kgToLose = Math.abs(profile.weight_kg - profile.goal_weight_kg);
      const days = Math.ceil((kgToLose * 7700) / dailyDeficit);
      setDaysToGoal(days);
    }
  }, [profile]);

  const age = profile?.age || 30;
  const fitnessLevel = age > 50 ? "beginner" : age > 35 ? "intermediate" : "advanced";
  const exercises = HOME_EXERCISES[fitnessLevel].filter(e => !skippedExercises.has(e.name));

  const handleFeedback = (name, completed) => {
    setFeedback(f => ({ ...f, [name]: completed }));
    if (!completed) {
      const count = (noCount[name] || 0) + 1;
      setNoCount(n => ({ ...n, [name]: count }));
      if (count >= 3) {
        setSkippedExercises(s => new Set([...s, name]));
      }
    }
  };

  const locationTabs = [
    { key: "home", label: "Home", icon: Home },
    { key: "outdoor", label: "Outdoor", icon: MapPin },
    { key: "gym", label: "Gym / Yoga", icon: Dumbbell },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-amber-50/50 dark:from-gray-950 dark:via-gray-950 dark:to-gray-950">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Exercise Engine</h1>
            <p className="text-xs text-gray-400">Personalised to your age & fitness level</p>
          </div>
        </motion.div>

        {/* Weight-Loss Timer */}
        {daysToGoal && profile?.goal_weight_kg && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-4 mb-5 text-white">
            <div className="flex items-center gap-3">
              <Timer className="w-6 h-6 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold opacity-90">Weight-Loss Timer</p>
                <p className="text-xl font-extrabold">{daysToGoal} days to reach {profile.goal_weight_kg} kg</p>
                <p className="text-xs opacity-70 mt-0.5">Based on your daily calorie deficit — stay consistent!</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Location Toggle */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-1.5 flex gap-1 mb-6 shadow-sm">
          {locationTabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.key} onClick={() => setLocation(tab.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[44px] ${location === tab.key ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow" : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"}`}>
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Home Exercises */}
        {location === "home" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
              {fitnessLevel} level · Age {age} · Equipment-free
            </p>
            {exercises.map(ex => (
              <div key={ex.name} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{ex.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">{ex.name}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-2">
                        <Clock className="w-3 h-3" /> {ex.duration}
                        <Flame className="w-3 h-3 text-orange-400" /> ~{ex.calories} kcal
                      </p>
                    </div>
                  </div>
                  {feedback[ex.name] === undefined ? (
                    <div className="flex gap-2">
                      <button onClick={() => handleFeedback(ex.name, true)}
                        className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-xl font-medium hover:bg-green-200 transition-colors min-h-[44px]">
                        Done ✓
                      </button>
                      <button onClick={() => handleFeedback(ex.name, false)}
                        className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 px-3 py-1.5 rounded-xl font-medium hover:bg-gray-200 transition-colors min-h-[44px]">
                        Skip
                      </button>
                    </div>
                  ) : feedback[ex.name] ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <XCircle className="w-4 h-4 text-red-400" />
                      <span>{noCount[ex.name] >= 3 ? "Removed" : `Skip ${noCount[ex.name]}/3`}</span>
                    </div>
                  )}
                </div>
                {noCount[ex.name] >= 2 && noCount[ex.name] < 3 && (
                  <p className="text-xs text-orange-500 mt-2">⚠️ Skip once more and this will be replaced with an easier option.</p>
                )}
              </div>
            ))}
          </motion.div>
        )}

        {/* Outdoor Routes */}
        {location === "outdoor" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-2xl p-4 text-sm text-blue-700 dark:text-blue-300">
              🗺️ Based on your <strong>{todayCalories} kcal</strong> logged today, here are suggested routes to burn them off.
            </div>
            {OUTDOOR_ROUTES.map(route => {
              const mins = todayCalories > 0 ? Math.round(todayCalories / route.burnRate) : "—";
              return (
                <div key={route.name} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${route.color} flex items-center justify-center text-xl flex-shrink-0`}>
                      {route.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">{route.name}</p>
                      <p className="text-xs text-gray-400">{route.pace} · ~{route.burnRate} kcal/min</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-800 dark:text-white">{mins}</p>
                      <p className="text-xs text-gray-400">minutes</p>
                    </div>
                  </div>
                  <button
                    onClick={() => window.open(`https://www.google.com/maps/search/running+track+near+me`, "_blank")}
                    className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium min-h-[44px]">
                    <MapPin className="w-4 h-4" /> Find Route Near Me
                  </button>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* Gym / Yoga */}
        {location === "gym" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-2xl p-4 text-sm text-purple-700 dark:text-purple-300">
              🏋️ Find the nearest gyms and yoga centers.
            </div>
            {[
              { label: "Gyms Near Me", query: "gym+near+me", icon: "🏋️", color: "from-purple-500 to-violet-600" },
              { label: "Yoga Centers", query: "yoga+center+near+me", icon: "🧘", color: "from-rose-400 to-pink-600" },
              { label: "Fitness Classes", query: "fitness+class+near+me", icon: "⚡", color: "from-amber-400 to-orange-500" },
            ].map(place => (
              <div key={place.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${place.color} flex items-center justify-center text-2xl flex-shrink-0`}>
                  {place.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">{place.label}</p>
                  <p className="text-xs text-gray-400">Opens Google Maps near you</p>
                </div>
                <button
                  onClick={() => window.open(`https://www.google.com/maps/search/${place.query}`, "_blank")}
                  className="flex items-center gap-1 text-sm font-semibold text-purple-600 dark:text-purple-400 min-h-[44px]">
                  Navigate <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}