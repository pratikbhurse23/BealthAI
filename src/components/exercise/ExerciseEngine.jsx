import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Clock, Flame, RefreshCw, ChevronDown, ChevronUp, MapPin, Play, Pause, RotateCcw, PartyPopper } from "lucide-react";
import {
  AGE_GROUPS, EXERCISE_DB, LOCATION_AVAILABILITY, LOCATION_META,
  MEDICAL_CONDITIONS, getAgeGroupKey
} from "./exerciseDatabase";
import SafetyBanner from "./SafetyBanner";
import BabyCard from "./BabyCard";

// ─── Parse duration string like "20 min", "30 sec", "1 min" → seconds ────────
function parseDurationSecs(durationStr) {
  if (!durationStr) return 60;
  const lower = durationStr.toLowerCase();
  const num = parseFloat(lower) || 0;
  if (lower.includes("sec")) return Math.round(num);
  if (lower.includes("min")) return Math.round(num * 60);
  // could be "20-30 min" → take first number
  const match = lower.match(/(\d+)/);
  return match ? parseInt(match[1]) * 60 : 60;
}

// ─── Format seconds as MM:SS ────────────────────────────────────────────────
function fmtTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── Daily exercise rotation seed (changes every day) ───────────────────────
function getDaySeed() {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}
function seededShuffle(arr, seed) {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Exercise Card with live countdown timer ─────────────────────────────────
function ExerciseCard({ exercise, onFeedback, completed, skipCount }) {
  const [phase, setPhase] = useState("idle"); // idle | running | paused | done
  const [secsLeft, setSecsLeft] = useState(null);
  const intervalRef = useRef(null);
  const totalSecs = parseDurationSecs(exercise.duration);

  const start = () => {
    setSecsLeft(s => s === null ? totalSecs : s);
    setPhase("running");
  };

  useEffect(() => {
    if (phase === "running") {
      intervalRef.current = setInterval(() => {
        setSecsLeft(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setPhase("done");
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [phase]);

  // Derived progress
  const current = secsLeft ?? totalSecs;
  const pct = ((totalSecs - current) / totalSecs) * 100;

  return (
    <div className={`rounded-2xl border p-4 transition-all ${completed
        ? "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20"
        : skipCount >= 3
          ? "opacity-40 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30"
          : "border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900"
      }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="text-2xl leading-none mt-0.5 flex-shrink-0">{exercise.icon}</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{exercise.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-0.5">{exercise.desc}</p>
            <div className="flex gap-3 mt-1.5 flex-wrap">
              {exercise.duration && (
                <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />{exercise.duration}
                </span>
              )}
              {exercise.calories > 0 && (
                <span className="text-xs text-orange-500 flex items-center gap-1">
                  <Flame className="w-3 h-3" />~{exercise.calories} kcal
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action area */}
        <div className="flex-shrink-0">
          {completed ? (
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          ) : skipCount >= 3 ? (
            <span className="text-xs text-gray-400">Removed</span>
          ) : (phase === "idle") ? (
            <button
              onClick={start}
              className="text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl px-3 py-1.5 min-h-[36px] font-medium shadow-sm flex items-center gap-1"
            >
              <Play className="w-3 h-3" /> Start
            </button>
          ) : (phase === "done") ? (
            <div className="flex flex-col items-end gap-1">
              <p className="text-xs text-gray-400">Timer done! Done?</p>
              <div className="flex gap-1">
                <button
                  onClick={() => { onFeedback(exercise.name, true); setPhase("idle"); setSecsLeft(null); }}
                  className="flex items-center gap-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl px-2.5 py-1.5 min-h-[36px] font-medium"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />Yes
                </button>
                <button
                  onClick={() => { onFeedback(exercise.name, false); setPhase("idle"); setSecsLeft(null); }}
                  className="flex items-center gap-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl px-2.5 py-1.5 min-h-[36px] font-medium"
                >
                  <XCircle className="w-3.5 h-3.5" />No
                </button>
              </div>
            </div>
          ) : (
            /* running | paused */
            <div className="flex flex-col items-end gap-1.5">
              <span className={`text-lg font-extrabold tabular-nums ${phase === "running" ? "text-amber-600 dark:text-amber-400" : "text-gray-400"}`}>
                {fmtTime(current)}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setPhase(p => p === "running" ? "paused" : "running")}
                  className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-700 dark:text-amber-400 hover:bg-amber-200 transition-colors"
                >
                  {phase === "running" ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => { setPhase("idle"); setSecsLeft(null); }}
                  className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-200 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Progress bar during timer */}
      {(phase === "running" || phase === "paused") && (
        <div className="mt-3 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
            style={{ width: `${pct}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      )}

      {skipCount >= 2 && skipCount < 3 && (
        <p className="text-xs text-orange-500 mt-2">⚠️ Skip once more and this exercise will be removed.</p>
      )}
    </div>
  );
}

// ─── Goal-completion banner ──────────────────────────────────────────────────
function GoalCompletedBanner({ totalBurned, caloriesBurned }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-200 dark:border-green-700 rounded-3xl p-5"
    >
      <div className="flex items-center gap-3 mb-2">
        <PartyPopper className="w-7 h-7 text-green-500 flex-shrink-0" />
        <div>
          <p className="font-bold text-green-700 dark:text-green-300">🎉 Today's exercise goal achieved!</p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
            You burned <strong>{totalBurned} kcal</strong> today. Excellent work — rest and come back tomorrow!
          </p>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-2xl px-4 py-3 text-sm text-green-700 dark:text-green-300 font-medium border border-green-100 dark:border-green-800">
        ✅ You can do exercise <strong>next day</strong> — your today's goal is complete. Take rest, hydrate well, and sleep early. 💪
      </div>
    </motion.div>
  );
}

// ─── Main ExerciseEngine ──────────────────────────────────────────────────────
export default function ExerciseEngine({ calories = 0, profile = null }) {
  const [manualAge, setManualAge] = useState(null);
  const [location, setLocation] = useState("home");
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [feedback, setFeedback] = useState({});   // name → skip count
  const [completed, setCompleted] = useState({}); // name → true
  const [showConditions, setShowConditions] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  const age = manualAge ?? profile?.age ?? null;
  const ageKey = getAgeGroupKey(age);
  const ageGroupMeta = AGE_GROUPS.find(g => g.key === ageKey) || AGE_GROUPS[7];
  const isBaby = ageGroupMeta.isBaby;

  // Available location tabs for this age group
  const availableLocations = LOCATION_AVAILABILITY[ageKey] || ["home", "park", "gym", "yoga", "pool"];

  useEffect(() => {
    if (!availableLocations.includes(location)) {
      setLocation(availableLocations[0] || "home");
    }
  }, [ageKey]);

  // ── Daily rotation: shuffle exercises deterministically by date ──
  const rawExercises = EXERCISE_DB[ageKey]?.[location] || [];
  const daySeed = getDaySeed();
  // Use location in seed so each location rotates independently
  const locationSeed = location.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const allExercises = seededShuffle(rawExercises, daySeed + locationSeed);

  const filteredExercises = allExercises.filter(ex => {
    if ((feedback[ex.name] || 0) >= 3) return false;
    if (!ex.blockedFor) return true;
    return !ex.blockedFor.some(cond => selectedConditions.includes(cond));
  });

  const handleFeedback = (name, didComplete) => {
    if (didComplete) {
      setCompleted(prev => ({ ...prev, [name]: true }));
    } else {
      setFeedback(prev => ({ ...prev, [name]: (prev[name] || 0) + 1 }));
    }
  };

  const toggleCondition = (key) => {
    setSelectedConditions(prev =>
      prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key]
    );
  };

  const resetAll = () => { setFeedback({}); setCompleted({}); };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLocation({ error: true })
      );
    }
  };

  const totalCaloriesBurned = Object.entries(completed)
    .filter(([, v]) => v)
    .reduce((sum, [name]) => {
      const ex = allExercises.find(e => e.name === name);
      return sum + (ex?.calories || 0);
    }, 0);

  // Goal completion: all visible exercises done OR burned ≥ 300 kcal
  const completedCount = filteredExercises.filter(ex => completed[ex.name]).length;
  const goalMet = filteredExercises.length > 0
    && (completedCount === filteredExercises.length || totalCaloriesBurned >= 300);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{ageGroupMeta.emoji}</span>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">Exercise Plan</p>
            <p className="text-xs text-gray-400">{ageGroupMeta.label} · {ageGroupMeta.mins}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {totalCaloriesBurned > 0 && (
            <span className="text-xs bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-full px-2.5 py-1 flex items-center gap-1">
              <Flame className="w-3 h-3" />{totalCaloriesBurned} burned
            </span>
          )}
          <button onClick={resetAll}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Reset">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Age Input */}
      {!profile?.age && (
        <div className="mb-4 bg-gray-50 dark:bg-gray-800 rounded-2xl p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">Your Age</p>
            <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{age || 25} yrs</span>
          </div>
          <input type="range" min={0} max={100} value={age || 25}
            onChange={e => setManualAge(Number(e.target.value))}
            className="w-full accent-amber-500" />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
          </div>
        </div>
      )}

      {/* Medical Conditions */}
      {!isBaby && (
        <div className="mb-4">
          <button onClick={() => setShowConditions(s => !s)}
            className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span>🏥 Health Conditions
              {selectedConditions.length > 0 && (
                <span className="ml-2 bg-amber-500 text-white rounded-full px-1.5 py-0.5 text-[10px]">
                  {selectedConditions.length}
                </span>
              )}
            </span>
            {showConditions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <AnimatePresence>
            {showConditions && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="flex flex-wrap gap-2 pt-3 px-1">
                  {MEDICAL_CONDITIONS.map(cond => (
                    <button key={cond.key} onClick={() => toggleCondition(cond.key)}
                      className={`flex items-center gap-1.5 text-xs rounded-full px-3 py-1.5 font-medium transition-all ${selectedConditions.includes(cond.key)
                        ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-transparent"}`}>
                      <span>{cond.emoji}</span>{cond.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2 px-1">Unsafe exercises for your conditions will be automatically hidden.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <SafetyBanner age={age} conditions={selectedConditions} />

      {/* Goal completion banner */}
      <AnimatePresence>
        {goalMet && (
          <motion.div key="goal-met" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-4">
            <GoalCompletedBanner totalBurned={totalCaloriesBurned} />
          </motion.div>
        )}
      </AnimatePresence>

      {isBaby ? (
        <BabyCard ageKey={ageKey} ageGroupMeta={ageGroupMeta} />
      ) : (
        <>
          {/* Location Tabs */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-2xl p-1 mb-5 overflow-x-auto">
            {availableLocations.map(loc => {
              const meta = LOCATION_META[loc];
              return (
                <button key={loc}
                  onClick={() => { setLocation(loc); if (loc === "park" || loc === "pool") getLocation(); }}
                  className={`flex-shrink-0 flex items-center justify-center gap-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all min-h-[44px] ${location === loc
                    ? "bg-white dark:bg-gray-700 text-amber-600 dark:text-amber-400 shadow-sm"
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}>
                  <span>{meta.icon}</span>
                  <span className="hidden sm:inline">{meta.label}</span>
                </button>
              );
            })}
          </div>

          {/* Exercise List */}
          <AnimatePresence mode="wait">
            <motion.div key={`${ageKey}-${location}-${daySeed}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-3">
              {filteredExercises.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-sm mb-2">All exercises hidden or skipped.</p>
                  <button onClick={resetAll} className="text-amber-500 text-sm underline">Reset & show all</button>
                </div>
              ) : (
                filteredExercises.map(ex => (
                  <ExerciseCard
                    key={ex.name}
                    exercise={ex}
                    onFeedback={handleFeedback}
                    completed={!!completed[ex.name]}
                    skipCount={feedback[ex.name] || 0}
                  />
                ))
              )}

              {/* Location find button */}
              {(location === "park" || location === "pool" || location === "gym") && (
                <div className="mt-2">
                  {userLocation && !userLocation.error ? (
                    <a href={`https://www.google.com/maps/search/${location === "pool" ? "swimming+pool" : location === "gym" ? "gym+yoga+center" : "park+ground"}+near+me/@${userLocation.lat},${userLocation.lng},14z`}
                      target="_blank" rel="noreferrer"
                      className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-white text-sm font-semibold bg-gradient-to-r ${LOCATION_META[location].color}`}>
                      <MapPin className="w-4 h-4" />Find {LOCATION_META[location].label} Near Me
                    </a>
                  ) : (
                    <button onClick={getLocation}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <MapPin className="w-4 h-4" />
                      {userLocation?.error ? "Location unavailable — enable GPS" : "Find Nearby →"}
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <p className="text-xs text-gray-400 text-center mt-4">
            {filteredExercises.length} exercises · {ageGroupMeta.label} · {completedCount}/{filteredExercises.length} done
            {" · "}Today's rotation refreshes at midnight
          </p>
        </>
      )}
    </div>
  );
}