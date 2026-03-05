import React, { useState, useEffect } from "react";
import { api } from "../api/client";
import { motion } from "framer-motion";
import { User, Save, Flame, Activity, Target, Calculator, HeartPulse } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { calcBMR, calcTDEE, calcCalorieBudget, ACTIVITY_LABELS } from "../components/bmr";
import { generateWeeklyPlan, weeklyPlanToCsv } from '../lib/mealPlans';

const ACTIVITY_OPTIONS = [
  { value: "sedentary", label: "Sedentary", desc: "Little or no exercise, desk job" },
  { value: "active", label: "Active", desc: "Moderate exercise 3–5 days/week" },
  { value: "athlete", label: "Athlete", desc: "Very hard exercise or physical job" },
];

export default function Profile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    age: "", gender: "male", weight_kg: "", height_cm: "",
    activity_level: "sedentary", weight_goal: "", goal_weight_kg: ""
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [medicalConditions, setMedicalConditions] = useState({ diabetes: false, hypertension: false, heart: false });
  const [generatedPlan, setGeneratedPlan] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const me = await api.auth.me();
    setUser(me);
    const profiles = await api.entities.UserProfile.filter({ created_by: me.email });
    if (profiles.length > 0) {
      const p = profiles[0];
      setProfile(p);
      setForm({
        age: p.age || "",
        gender: p.gender || "male",
        weight_kg: p.weight_kg || "",
        height_cm: p.height_cm || "",
        activity_level: p.activity_level || "sedentary",
        weight_goal: p.weight_goal || "",
        goal_weight_kg: p.goal_weight_kg || "",
        doctor_calorie_target: p.doctor_calorie_target || "",
      });
      if (p.medical_conditions) {
        try { setMedicalConditions(JSON.parse(p.medical_conditions)); } catch { }
      }
    }
  }

  const bmr = form.age && form.weight_kg && form.height_cm
    ? Math.round(calcBMR(parseFloat(form.weight_kg), parseFloat(form.height_cm), parseFloat(form.age), form.gender))
    : null;

  const tdee = bmr ? calcTDEE(bmr, form.activity_level) : null;

  const budget = tdee && form.weight_kg
    ? calcCalorieBudget(tdee, parseFloat(form.weight_kg), form.goal_weight_kg ? parseFloat(form.goal_weight_kg) : null)
    : null;

  const handleSave = async () => {
    if (!form.age || !form.weight_kg || !form.height_cm) return;
    setSaving(true);
    const hasMedical = Object.values(medicalConditions).some(Boolean);
    const data = {
      age: parseFloat(form.age),
      gender: form.gender,
      weight_kg: parseFloat(form.weight_kg),
      height_cm: parseFloat(form.height_cm),
      activity_level: form.activity_level,
      weight_goal: form.weight_goal,
      goal_weight_kg: form.goal_weight_kg ? parseFloat(form.goal_weight_kg) : null,
      start_weight_kg: profile?.start_weight_kg || parseFloat(form.weight_kg),
      medical_conditions: JSON.stringify(medicalConditions),
      doctor_calorie_target: hasMedical && form.doctor_calorie_target ? parseFloat(form.doctor_calorie_target) : null,
    };
    if (profile) {
      await api.entities.UserProfile.update(profile.id, data);
    } else {
      await api.entities.UserProfile.create(data);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    loadData();
  };

  const f = (v) => setForm(prev => ({ ...prev, ...v }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-amber-50/50 dark:from-gray-950 dark:via-gray-950 dark:to-gray-950">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200/50">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
            {user && <p className="text-sm text-gray-400">{user.email}</p>}
          </div>
        </motion.div>

        {/* Live BMR/TDEE Preview */}
        {bmr && (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "BMR", value: bmr, unit: "kcal", icon: Flame, color: "from-rose-400 to-red-500", desc: "Base metabolic rate" },
              { label: "TDEE", value: tdee, unit: "kcal", icon: Activity, color: "from-amber-400 to-orange-500", desc: "Total daily energy" },
              { label: "Daily Budget", value: budget, unit: "kcal", icon: Target, color: "from-emerald-400 to-green-500", desc: "Your calorie goal" },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 text-center shadow-sm">
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mx-auto mb-2`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{s.value?.toLocaleString()}</p>
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{s.label}</p>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* Meal plan generation temporarily disabled while fixing syntax */}
        <div className="mt-6 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <p className="text-sm text-gray-500">Meal plans temporarily disabled.</p>
        </div>

        {/* Form */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 space-y-5">

          {/* Gender */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Gender</label>
            <div className="grid grid-cols-2 gap-3">
              {["male", "female"].map(g => (
                <button key={g} onClick={() => f({ gender: g })}
                  className={`py-3 rounded-xl border text-sm font-medium capitalize transition-all ${form.gender === g ? "bg-amber-500 border-amber-500 text-white" : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-amber-300"}`}>
                  {g === "male" ? "👨 Male" : "👩 Female"}
                </button>
              ))}
            </div>
          </div>

          {/* Age, Weight, Height */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Age</label>
              <Input type="number" placeholder="25" value={form.age} onChange={e => f({ age: e.target.value })}
                className="rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white text-center" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Weight (kg)</label>
              <Input type="number" placeholder="70" value={form.weight_kg} onChange={e => f({ weight_kg: e.target.value })}
                className="rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white text-center" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Height (cm)</label>
              <Input type="number" placeholder="170" value={form.height_cm} onChange={e => f({ height_cm: e.target.value })}
                className="rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white text-center" />
            </div>
          </div>

          {/* Activity Level */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Activity Level</label>
            <div className="space-y-2">
              {ACTIVITY_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => f({ activity_level: opt.value })}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all ${form.activity_level === opt.value ? "bg-amber-50 dark:bg-amber-900/20 border-amber-400 dark:border-amber-600" : "border-gray-200 dark:border-gray-700 hover:border-amber-200"}`}>
                  <div>
                    <p className={`text-sm font-semibold ${form.activity_level === opt.value ? "text-amber-700 dark:text-amber-400" : "text-gray-700 dark:text-gray-300"}`}>{opt.label}</p>
                    <p className="text-xs text-gray-400">{opt.desc}</p>
                  </div>
                  {form.activity_level === opt.value && <div className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Weight Goal */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Weight Goal</label>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder='e.g. Lose 5kg' value={form.weight_goal} onChange={e => f({ weight_goal: e.target.value })}
                className="rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
              <Input type="number" placeholder="Goal weight (kg)" value={form.goal_weight_kg} onChange={e => f({ goal_weight_kg: e.target.value })}
                className="rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">Setting a goal weight adjusts your daily calorie budget (+/– 500 kcal).</p>
          </div>

          {/* Medical Conditions */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-red-400" />Medical Conditions
            </label>
            <div className="grid grid-cols-3 gap-2">
              [
              {key: "diabetes", label: "🩸 Diabetes" },
              {key: "hypertension", label: "💊 Hypertension" },
              {key: "heart", label: "❤️ Heart" },
              ].map(c => (
              <button key={c.key} onClick={() => setMedicalConditions(prev => ({ ...prev, [c.key]: !prev[c.key] }))}
                className={`py-2.5 rounded-xl border text-xs font-semibold transition-all min-h-[44px] ${medicalConditions[c.key] ? "bg-red-50 dark:bg-red-900/20 border-red-400 text-red-700 dark:text-red-400" : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-red-200"}`}>
                {c.label}
              </button>
              ))}
            </div>
            {Object.values(medicalConditions).some(Boolean) && (
              <div className="mt-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-3">
                <p className="text-xs text-red-700 dark:text-red-300 mb-2 font-medium">⚠️ Auto-calorie targets disabled. Enter your doctor's recommended daily intake:</p>
                <input type="number" placeholder="e.g. 1500" value={form.doctor_calorie_target || ""}
                  onChange={e => f({ doctor_calorie_target: e.target.value })}
                  className="w-full rounded-xl border border-red-300 dark:border-red-700 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
              </div>
            )}
          </div>

          <Button onClick={handleSave} disabled={saving || !form.age || !form.weight_kg || !form.height_cm}
            className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white min-h-[48px] text-base font-semibold shadow-lg shadow-amber-200/50">
            {saving ? "Saving…" : saved ? "✓ Saved!" : <><Save className="w-4 h-4 mr-2" /> Save Profile</>}
          </Button>
        </motion.div>

        {bmr && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="mt-4 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-200 dark:border-violet-800 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <Calculator className="w-4 h-4 text-violet-600 dark:text-violet-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-violet-700 dark:text-violet-300 leading-relaxed">
                <strong>Mifflin-St Jeor equation</strong> — BMR = 10×weight + 6.25×height − 5×age {form.gender === "male" ? "+ 5" : "− 161"}.
                TDEE multiplies BMR by your activity factor ({form.activity_level === "sedentary" ? "1.2" : form.activity_level === "active" ? "1.55" : "1.9"}x).
                {form.goal_weight_kg && parseFloat(form.goal_weight_kg) !== parseFloat(form.weight_kg) &&
                  ` Your daily budget is ${parseFloat(form.goal_weight_kg) < parseFloat(form.weight_kg) ? "500 kcal below" : "500 kcal above"} TDEE to ${parseFloat(form.goal_weight_kg) < parseFloat(form.weight_kg) ? "lose" : "gain"} ~0.5kg/week.`
                }
              </p>
            </div>
          </motion.div>

        )}

        {/* Personalized recommendations */}
        {budget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
            <h3 className="text-lg font-semibold mb-2">Personalized Plan</h3>
            <p className="text-sm text-gray-500 mb-3">Daily calorie budget: <strong>{budget} kcal</strong></p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Sample Meals</h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li><strong>Breakfast</strong> — Oats with milk, banana, nuts ({Math.round(budget * 0.3)} kcal)</li>
                  <li><strong>Lunch</strong> — Rice/roti, lean protein, vegetables ({Math.round(budget * 0.4)} kcal)</li>
                  <li><strong>Dinner</strong> — Salad + protein or light curry ({Math.round(budget * 0.25)} kcal)</li>
                  <li><strong>Snack</strong> — Yogurt / fruit ({Math.round(budget * 0.05)} kcal)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Exercise Suggestions</h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  {form.activity_level === 'sedentary' && <li>Start with 20–30 min brisk walking 4×/week and 2×/week light strength training.</li>}
                  {form.activity_level === 'active' && <li>Mix cardio (30–45 min) 3×/week with strength sessions 3×/week.</li>}
                  {form.activity_level === 'athlete' && <li>Maintain high-intensity workouts; include recovery and mobility work.</li>}
                  {form.goal_weight_kg && parseFloat(form.goal_weight_kg) < parseFloat(form.weight_kg) && <li className="text-red-600">Goal: Weight loss — prioritize cardio and a calorie deficit.</li>}
                  {form.goal_weight_kg && parseFloat(form.goal_weight_kg) > parseFloat(form.weight_kg) && <li className="text-green-600">Goal: Weight gain — include progressive resistance training and calorie surplus.</li>}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}