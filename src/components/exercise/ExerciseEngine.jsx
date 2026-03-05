import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Trees, Dumbbell, MapPin, CheckCircle2, XCircle, RefreshCw, Clock, Flame } from "lucide-react";
import { Button } from "../ui/button";
import { api } from "../../api/client";

const HOME_EXERCISES = {
  young: [
    { name: "Surya Namaskar", icon: "🌅", duration: "20 min", calories: 150, desc: "12-step yoga flow, full body warmup" },
    { name: "Pushups", icon: "💪", duration: "15 min", calories: 80, desc: "3 sets × 15 reps, chest & arms" },
    { name: "Squats", icon: "🦵", duration: "15 min", calories: 90, desc: "3 sets × 20 reps, legs & glutes" },
    { name: "Plank", icon: "🧱", duration: "10 min", calories: 50, desc: "3 sets × 1 min hold, core strength" },
    { name: "Jumping Jacks", icon: "⭐", duration: "10 min", calories: 100, desc: "Cardio burst, full body" },
  ],
  middle: [
    { name: "Yoga Flow", icon: "🧘", duration: "30 min", calories: 120, desc: "Gentle hatha yoga sequence" },
    { name: "Chair Squats", icon: "🪑", duration: "15 min", calories: 60, desc: "Low-impact leg strengthening" },
    { name: "Wall Pushups", icon: "🤲", duration: "10 min", calories: 40, desc: "Gentle upper body workout" },
    { name: "Walking in Place", icon: "🚶", duration: "20 min", calories: 80, desc: "Low impact cardio at home" },
    { name: "Pranayama", icon: "🌬️", duration: "20 min", calories: 30, desc: "Breathing exercises for wellness" },
  ],
  senior: [
    { name: "Chair Yoga", icon: "🧘", duration: "20 min", calories: 50, desc: "Seated yoga for flexibility" },
    { name: "Deep Breathing", icon: "🌬️", duration: "15 min", calories: 20, desc: "Stress reduction & lung health" },
    { name: "Gentle Stretching", icon: "🤸", duration: "20 min", calories: 40, desc: "Full body mobility routine" },
    { name: "Slow Walking", icon: "🚶", duration: "30 min", calories: 70, desc: "Steady pace indoor walking" },
  ],
};

const OUTDOOR_EXERCISES = [
  { name: "Brisk Walk", icon: "🚶", minsPerKcal: 0.25, desc: "~4 kcal/min — easy on joints, great for fat burn" },
  { name: "Running", icon: "🏃", minsPerKcal: 0.1, desc: "~10 kcal/min — high intensity cardio" },
  { name: "Cycling", icon: "🚴", minsPerKcal: 0.125, desc: "~8 kcal/min — low impact, high burn" },
  { name: "Jump Rope", icon: "🪢", minsPerKcal: 0.083, desc: "~12 kcal/min — portable & effective" },
];

const GYM_EXERCISES = [
  { name: "Treadmill Run", icon: "🏃", duration: "30 min", calories: 300, desc: "Moderate pace, 8 km/h" },
  { name: "Weight Training", icon: "🏋️", duration: "45 min", calories: 200, desc: "Full body strength split" },
  { name: "Yoga Class", icon: "🧘", duration: "60 min", calories: 150, desc: "Power yoga or hatha" },
  { name: "Cross Trainer", icon: "⚡", duration: "30 min", calories: 250, desc: "Elliptical, low impact" },
  { name: "Swimming", icon: "🏊", duration: "30 min", calories: 280, desc: "Full body aqua workout" },
  { name: "HIIT Class", icon: "🔥", duration: "30 min", calories: 400, desc: "High intensity intervals" },
];

function getAgeGroup(age) {
  if (!age || age < 35) return "young";
  if (age < 55) return "middle";
  return "senior";
}

export default function ExerciseEngine({ calories = 0, profile = null }) {
  const [location, setLocation] = useState("home");
  const [feedback, setFeedback] = useState({}); // exerciseName -> count of "No"
  const [completed, setCompleted] = useState({});
  const [userLocation, setUserLocation] = useState(null);

  const ageGroup = getAgeGroup(profile?.age);

  const homeExercises = HOME_EXERCISES[ageGroup].filter(ex => {
    const noCount = feedback[ex.name] || 0;
    if (noCount >= 3) return false; // hide after 3 declines
    return true;
  });

  // Substitute running → walking if declined 3 times
  const outdoorExercises = OUTDOOR_EXERCISES.map(ex => {
    if (ex.name === "Running" && (feedback["Running"] || 0) >= 3) {
      return { ...ex, name: "Power Walk", icon: "🚶‍♂️", desc: "~5 kcal/min — upgraded walking pace" };
    }
    return ex;
  });

  const handleFeedback = (name, didComplete) => {
    if (didComplete) {
      setCompleted(prev => ({ ...prev, [name]: true }));
    } else {
      setFeedback(prev => ({ ...prev, [name]: (prev[name] || 0) + 1 }));
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLocation({ error: true })
      );
    }
  };

  const LOCATION_TABS = [
    { key: "home", label: "Home", icon: Home },
    { key: "outdoor", label: "Outdoor", icon: Trees },
    { key: "gym", label: "Gym / Yoga", icon: Dumbbell },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-5">
        <Flame className="w-5 h-5 text-orange-500" />
        <h2 className="font-bold text-gray-900 dark:text-white text-base">Exercise Engine</h2>
        {calories > 0 && <span className="ml-auto text-xs text-gray-400 bg-orange-50 dark:bg-orange-900/20 rounded-full px-3 py-1">Burn {calories} kcal</span>}
      </div>

      {/* Location Toggle */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-2xl p-1 mb-5">
        {LOCATION_TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.key} onClick={() => { setLocation(tab.key); if (tab.key === "outdoor") getLocation(); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all min-h-[44px] ${location === tab.key ? "bg-white dark:bg-gray-700 text-amber-600 dark:text-amber-400 shadow-sm" : "text-gray-400"}`}>
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* HOME */}
        {location === "home" && (
          <motion.div key="home" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-3">
            {homeExercises.length === 0 && (
              <div className="text-center py-6 text-gray-400 text-sm">You've skipped all exercises. <button onClick={() => setFeedback({})} className="text-amber-500 underline">Reset</button></div>
            )}
            {homeExercises.map(ex => (
              <ExerciseCard key={ex.name} exercise={ex} onFeedback={handleFeedback} completed={completed[ex.name]} />
            ))}
            <p className="text-xs text-gray-400 text-center mt-2">Exercises filtered for {ageGroup === "young" ? "under 35" : ageGroup === "middle" ? "35–55" : "55+"} age group</p>
          </motion.div>
        )}

        {/* OUTDOOR */}
        {location === "outdoor" && (
          <motion.div key="outdoor" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-3">
            {outdoorExercises.map(ex => {
              const mins = calories > 0 ? Math.round(calories * ex.minsPerKcal) : null;
              return (
                <ExerciseCard
                  key={ex.name}
                  exercise={{ ...ex, duration: mins ? `~${mins} min` : null, calories: mins ? Math.round(mins / ex.minsPerKcal) : null }}
                  onFeedback={handleFeedback}
                  completed={completed[ex.name]}
                />
              );
            })}
            {userLocation && !userLocation.error && (
              <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-3 flex items-center gap-3">
                <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">Location detected</p>
                  <p className="text-xs text-blue-500">{userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</p>
                  <a href={`https://www.google.com/maps/search/running+track+near+me/@${userLocation.lat},${userLocation.lng},14z`}
                    target="_blank" rel="noreferrer"
                    className="text-xs text-blue-600 underline font-medium">Find running tracks nearby →</a>
                </div>
              </div>
            )}
            {userLocation?.error && <p className="text-xs text-gray-400 text-center">Location not available — please enable GPS</p>}
            {!userLocation && (
              <button onClick={getLocation} className="w-full py-2 text-xs text-blue-500 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors">
                <MapPin className="w-3.5 h-3.5 inline mr-1" />Detect my location for route suggestions
              </button>
            )}
          </motion.div>
        )}

        {/* GYM */}
        {location === "gym" && (
          <motion.div key="gym" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-3">
            {GYM_EXERCISES.map(ex => (
              <ExerciseCard key={ex.name} exercise={ex} onFeedback={handleFeedback} completed={completed[ex.name]} />
            ))}
            {userLocation && !userLocation.error && (
              <a href={`https://www.google.com/maps/search/gym+yoga+center/@${userLocation.lat},${userLocation.lng},14z`}
                target="_blank" rel="noreferrer"
                className="block mt-3 text-center py-3 rounded-2xl border border-emerald-300 text-emerald-600 text-sm font-semibold hover:bg-emerald-50 transition-colors">
                🗺️ Find Gyms & Yoga Centers Near Me
              </a>
            )}
            <button onClick={getLocation} className="w-full py-2 text-xs text-emerald-500 border border-emerald-200 rounded-xl hover:bg-emerald-50 transition-colors">
              <MapPin className="w-3.5 h-3.5 inline mr-1" />Find nearest gym
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ExerciseCard({ exercise, onFeedback, completed }) {
  const [asked, setAsked] = useState(false);

  return (
    <div className={`rounded-2xl border p-4 transition-all ${completed ? "border-green-300 bg-green-50 dark:bg-green-900/20" : "border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{exercise.icon}</span>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{exercise.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{exercise.desc}</p>
            <div className="flex gap-3 mt-1">
              {exercise.duration && <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1"><Clock className="w-3 h-3" />{exercise.duration}</span>}
              {exercise.calories && <span className="text-xs text-orange-500 flex items-center gap-1"><Flame className="w-3 h-3" />{exercise.calories} kcal</span>}
            </div>
          </div>
        </div>
        {completed ? (
          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
        ) : !asked ? (
          <button onClick={() => setAsked(true)} className="text-xs bg-amber-500 text-white rounded-xl px-3 py-1.5 min-h-[36px] font-medium flex-shrink-0">
            Start
          </button>
        ) : (
          <div className="flex flex-col items-end gap-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">Did you complete it?</p>
            <div className="flex gap-1">
              <button onClick={() => { onFeedback(exercise.name, true); setAsked(false); }}
                className="flex items-center gap-1 text-xs bg-green-100 text-green-700 rounded-xl px-2.5 py-1.5 min-h-[36px]">
                <CheckCircle2 className="w-3.5 h-3.5" />Yes
              </button>
              <button onClick={() => { onFeedback(exercise.name, false); setAsked(false); }}
                className="flex items-center gap-1 text-xs bg-red-100 text-red-700 rounded-xl px-2.5 py-1.5 min-h-[36px]">
                <XCircle className="w-3.5 h-3.5" />No
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}