import React, { useState, useEffect, useCallback } from "react";
import { api } from "../api/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Settings, Target, ClipboardList, Save, Flame, Activity,
  Moon, Sun, Globe, Trash2, Edit2, Check, X, ChevronRight,
  HeartPulse, AlertTriangle, Calendar, Clock
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { calcBMR, calcTDEE, calcCalorieBudget } from "../components/bmr";

/* ─── Constants ──────────────────────────────────────────────────────── */

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "details", label: "Personal Details", icon: ClipboardList },
  { id: "goals", label: "Goals", icon: Target },
  { id: "settings", label: "Settings", icon: Settings },
];

const ACTIVITY_OPTIONS = [
  { value: "sedentary", label: "Sedentary", desc: "Little / no exercise" },
  { value: "active", label: "Active", desc: "Moderate exercise 3–5×/week" },
  { value: "athlete", label: "Athlete", desc: "Very hard exercise / physical job" },
];

const GOAL_OPTIONS = [
  { value: "lose", label: "Lose Weight", icon: "🔥", color: "from-rose-400 to-red-500", border: "border-rose-400", bg: "bg-rose-50 dark:bg-rose-900/20", text: "text-rose-700 dark:text-rose-300" },
  { value: "maintain", label: "Maintain Health", icon: "⚖️", color: "from-amber-400 to-orange-500", border: "border-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-700 dark:text-amber-300" },
  { value: "gain", label: "Gain Weight", icon: "💪", color: "from-emerald-400 to-green-500", border: "border-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-300" },
];

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi — हिन्दी" },
  { code: "mr", label: "Marathi — मराठी" },
  { code: "gu", label: "Gujarati — ગુજરાતી" },
  { code: "ta", label: "Tamil — தமிழ்" },
  { code: "te", label: "Telugu — తెలుగు" },
  { code: "kn", label: "Kannada — ಕನ್ನಡ" },
  { code: "bn", label: "Bengali — বাংলা" },
  { code: "es", label: "Spanish — Español" },
  { code: "fr", label: "French — Français" },
];

const DIET_OPTIONS = [
  { value: "veg", label: "🥦 Veg" },
  { value: "nonveg", label: "🍗 Non-Veg" },
  { value: "vegan", label: "🌿 Vegan" },
  { value: "jain", label: "🙏 Jain" },
];

const MEDICAL_OPTIONS = [
  { key: "diabetes", label: "🩸 Diabetes" },
  { key: "hypertension", label: "💊 Hypertension" },
  { key: "heart", label: "❤️ Heart" },
  { key: "thyroid", label: "🦋 Thyroid" },
  { key: "pcos", label: "🌸 PCOS" },
  { key: "kidney", label: "🫘 Kidney" },
];

/* ─── Theme helpers ───────────────────────────────────────────────────── */

function getStoredTheme() {
  return localStorage.getItem("bealthai_theme") || "light";
}
function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
  localStorage.setItem("bealthai_theme", theme);
}

/* ─── Confirmation Modal ─────────────────────────────────────────────── */

function ConfirmModal({ open, title, message, onConfirm, onCancel, danger }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-2xl p-6 max-w-sm w-full"
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{message}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors ${danger ? "bg-red-500 hover:bg-red-600" : "bg-amber-500 hover:bg-amber-600"}`}
          >
            Confirm
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Main Profile Page ──────────────────────────────────────────────── */

export default function Profile() {
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  // Profile tab
  const [displayName, setDisplayName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  // Personal Details
  const [form, setForm] = useState({
    age: "", gender: "male", weight_kg: "", height_cm: "",
    activity_level: "sedentary", doctor_calorie_target: "",
    diet_preference: "veg", disability_notes: "",
  });
  const [medicalConditions, setMedicalConditions] = useState({
    diabetes: false, hypertension: false, heart: false,
    thyroid: false, pcos: false, kidney: false,
  });

  // Goals
  const [goalType, setGoalType] = useState("maintain"); // lose | maintain | gain
  const [goalWeight, setGoalWeight] = useState("");
  const [goalDeadline, setGoalDeadline] = useState("");

  // Settings
  const [theme, setTheme] = useState(getStoredTheme);
  const [language, setLanguage] = useState(() => localStorage.getItem("bealthai_language") || "en");
  const [confirmModal, setConfirmModal] = useState(false);

  // Saving state
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  /* Load data */
  const loadData = useCallback(async () => {
    const me = await api.auth.me();
    setUser(me);
    const storedName = localStorage.getItem("bealthai_displayName") || "";
    setDisplayName(storedName);
    setNameInput(storedName);

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
        doctor_calorie_target: p.doctor_calorie_target || "",
        diet_preference: p.diet_preference || "veg",
        disability_notes: p.disability_notes || "",
      });
      if (p.medical_conditions) {
        try { setMedicalConditions(JSON.parse(p.medical_conditions)); } catch { /* noop */ }
      }
      setGoalType(p.goal_type || "maintain");
      setGoalWeight(p.goal_weight_kg || "");
      setGoalDeadline(p.goal_deadline || "");
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Keep theme in sync
  useEffect(() => { applyTheme(theme); }, [theme]);

  /* Derived BMR/TDEE */
  const bmr = form.age && form.weight_kg && form.height_cm
    ? Math.round(calcBMR(parseFloat(form.weight_kg), parseFloat(form.height_cm), parseFloat(form.age), form.gender))
    : null;
  const tdee = bmr ? Math.round(calcTDEE(bmr, form.activity_level)) : null;
  const budget = tdee && form.weight_kg
    ? calcCalorieBudget(tdee, parseFloat(form.weight_kg), goalWeight ? parseFloat(goalWeight) : null)
    : null;

  /* Helpers */
  const f = (v) => setForm(prev => ({ ...prev, ...v }));

  const handleSaveDetails = async () => {
    if (!form.age || !form.weight_kg || !form.height_cm) return;
    setSaving(true);
    const data = {
      age: parseFloat(form.age),
      gender: form.gender,
      weight_kg: parseFloat(form.weight_kg),
      height_cm: parseFloat(form.height_cm),
      activity_level: form.activity_level,
      diet_preference: form.diet_preference,
      disability_notes: form.disability_notes || "",
      medical_conditions: JSON.stringify(medicalConditions), // Still saving this, but UI is simplified
      doctor_calorie_target: Object.values(medicalConditions).some(Boolean) && form.doctor_calorie_target
        ? parseFloat(form.doctor_calorie_target) : null,
      goal_type: goalType,
      goal_weight_kg: goalWeight ? parseFloat(goalWeight) : null,
      goal_deadline: goalDeadline || null,
      start_weight_kg: profile?.start_weight_kg || parseFloat(form.weight_kg),
    };
    const me = await api.auth.me();
    const profileData = { ...data, created_by: me.email };
    if (profile) {
      await api.entities.UserProfile.update(profile.id, profileData);
    } else {
      await api.entities.UserProfile.create(profileData);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    loadData();
  };

  const handleSaveName = () => {
    localStorage.setItem("bealthai_displayName", nameInput.trim());
    setDisplayName(nameInput.trim());
    setEditingName(false);
  };

  const handleThemeToggle = (t) => {
    setTheme(t);
    applyTheme(t);
  };

  const handleLanguageChange = (code) => {
    setLanguage(code);
    localStorage.setItem("bealthai_language", code);
  };

  const handleDeleteAllData = () => {
    // Clear all bealthai localStorage keys
    const keys = Object.keys(localStorage).filter(k =>
      ["userProfiles", "currentUser", "bealthai_displayName", "bealthai_language"].includes(k) || k.startsWith("bealthai_")
    );
    keys.forEach(k => localStorage.removeItem(k));
    // Reset state
    setDisplayName("");
    setNameInput("");
    setProfile(null);
    setForm({ age: "", gender: "male", weight_kg: "", height_cm: "", activity_level: "sedentary", doctor_calorie_target: "", diet_preference: "veg", disability_notes: "" });
    setMedicalConditions({ diabetes: false, hypertension: false, heart: false, thyroid: false, pcos: false, kidney: false });
    setGoalType("maintain");
    setGoalWeight("");
    setGoalDeadline("");
    setConfirmModal(false);
  };

  const initials = displayName
    ? displayName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || "?";

  /* ── Render ── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-amber-50/50 dark:from-gray-950 dark:via-gray-950 dark:to-gray-950">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Page Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200/40 dark:shadow-violet-900/30">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
            <p className="text-sm text-gray-400">{user?.email || "Loading…"}</p>
          </div>
        </motion.div>

        {/* Tab Bar */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-2xl p-1 mb-6">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${active
                  ? "bg-white dark:bg-gray-900 text-violet-600 dark:text-violet-400 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  }`}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "profile" && (
            <ProfileTab
              key="profile"
              user={user}
              displayName={displayName}
              editingName={editingName}
              setEditingName={setEditingName}
              nameInput={nameInput}
              setNameInput={setNameInput}
              handleSaveName={handleSaveName}
              initials={initials}
              profile={profile}
              form={form}
              goalType={goalType}
              setActiveTab={setActiveTab} // Pass setActiveTab for navigation
            />
          )}
          {activeTab === "details" && (
            <DetailsTab
              key="details"
              form={form}
              f={f}
              medicalConditions={medicalConditions}
              setMedicalConditions={setMedicalConditions}
              saving={saving}
              saved={saved}
              handleSave={handleSaveDetails}
            />
          )}
          {activeTab === "goals" && (
            <GoalsTab
              key="goals"
              goalType={goalType}
              setGoalType={setGoalType}
              goalWeight={goalWeight}
              setGoalWeight={setGoalWeight}
              goalDeadline={goalDeadline}
              setGoalDeadline={setGoalDeadline}
              bmr={bmr}
              tdee={tdee}
              budget={budget}
              form={form}
              saving={saving}
              saved={saved}
              handleSave={handleSaveDetails}
            />
          )}
          {activeTab === "settings" && (
            <SettingsTab
              key="settings"
              theme={theme}
              handleThemeToggle={handleThemeToggle}
              language={language}
              handleLanguageChange={handleLanguageChange}
              onDeleteRequest={() => setConfirmModal(true)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={confirmModal}
        title="Delete All Data"
        message="This will permanently remove your profile, calorie logs, and all app data stored on this device. This cannot be undone."
        danger
        onConfirm={handleDeleteAllData}
        onCancel={() => setConfirmModal(false)}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   TAB: PROFILE
═══════════════════════════════════════════════════════ */

function ProfileTab({ user, displayName, editingName, setEditingName, nameInput, setNameInput, handleSaveName, initials, profile, form, goalType, setActiveTab }) {
  const goalOption = GOAL_OPTIONS.find(g => g.value === goalType);

  return (
    <motion.div key="profile" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.2 }} className="space-y-4">

      {/* Avatar + Name Card */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-5">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center shadow-xl shadow-violet-200/50 dark:shadow-violet-900/40 mb-3">
            <span className="text-2xl font-bold text-white">{initials}</span>
          </div>

          {/* Editable Name */}
          {editingName ? (
            <div className="flex items-center gap-2 mt-1">
              <input
                id="name-input"
                type="text"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleSaveName(); if (e.key === "Escape") setEditingName(false); }}
                placeholder="Your display name"
                autoFocus
                className="border border-violet-300 dark:border-violet-700 rounded-xl px-3 py-1.5 text-sm font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-violet-400 min-w-[180px] text-center"
              />
              <button onClick={handleSaveName} className="w-8 h-8 rounded-xl bg-violet-500 flex items-center justify-center text-white hover:bg-violet-600 transition-colors">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={() => setEditingName(false)} className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setNameInput(displayName); setEditingName(true); }}
              className="flex items-center gap-2 mt-1 group"
            >
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {displayName || "Add your name"}
              </span>
              <Edit2 className="w-4 h-4 text-gray-400 group-hover:text-violet-500 transition-colors" />
            </button>
          )}

          <p className="text-sm text-gray-400 mt-0.5">{user?.email}</p>
        </div>

        {/* Profile Summary Chips */}
        {profile ? (
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Weight", value: profile.weight_kg ? `${profile.weight_kg} kg` : "—" },
              { label: "Height", value: profile.height_cm ? `${profile.height_cm} cm` : "—" },
              { label: "Age", value: profile.age ? `${profile.age} yrs` : "—" },
              { label: "Gender", value: profile.gender ? (profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)) : "—" },
              { label: "Activity", value: ACTIVITY_OPTIONS.find(a => a.value === profile.activity_level)?.label || "—" },
              { label: "Goal", value: goalOption?.label || "—" },
            ].map(item => (
              <div key={item.label} className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-2.5 flex items-center justify-between">
                <span className="text-xs text-gray-400 font-medium">{item.label}</span>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{item.value}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-sm text-gray-400">
            Complete your <button onClick={() => setActiveTab("details")} className="text-violet-500 font-semibold underline">Personal Details</button> tab to see a summary here.
          </div>
        )}
      </div>


    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   TAB: PERSONAL DETAILS
═══════════════════════════════════════════════════════ */

function DetailsTab({ form, f, medicalConditions, setMedicalConditions, saving, saved, handleSave }) {
  const hasMedical = Object.values(medicalConditions).some(Boolean);
  return (
    <motion.div key="details" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.2 }} className="space-y-4">

      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 space-y-5">

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

        {/* Age / Weight / Height */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { key: "age", label: "Age", placeholder: "25" },
            { key: "weight_kg", label: "Weight (kg)", placeholder: "70" },
            { key: "height_cm", label: "Height (cm)", placeholder: "170" },
          ].map(field => (
            <div key={field.key}>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">{field.label}</label>
              <Input type="number" placeholder={field.placeholder} value={form[field.key]} onChange={e => f({ [field.key]: e.target.value })}
                className="rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white text-center" />
            </div>
          ))}
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
                {form.activity_level === opt.value && <div className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        {/* Diet Preference */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">🥗 Diet Preference</label>
          <div className="grid grid-cols-4 gap-2">
            {DIET_OPTIONS.map(d => (
              <button key={d.value} onClick={() => f({ diet_preference: d.value })}
                className={`py-2.5 rounded-xl border text-xs font-semibold transition-all min-h-[44px] ${form.diet_preference === d.value
                  ? "bg-green-50 dark:bg-green-900/20 border-green-400 text-green-700 dark:text-green-400"
                  : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-green-200"
                  }`}>
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Medical Conditions */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-red-400" />Medical Conditions
          </label>
          <div className="grid grid-cols-3 gap-2">
            {MEDICAL_OPTIONS.map(c => (
              <button key={c.key}
                onClick={() => setMedicalConditions(prev => ({ ...prev, [c.key]: !prev[c.key] }))}
                className={`py-2.5 rounded-xl border text-xs font-semibold transition-all min-h-[44px] ${medicalConditions[c.key] ? "bg-red-50 dark:bg-red-900/20 border-red-400 text-red-700 dark:text-red-400" : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-red-200"}`}>
                {c.label}
              </button>
            ))}
          </div>
          {hasMedical && (
            <div className="mt-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-3">
              <p className="text-xs text-red-700 dark:text-red-300 mb-2 font-medium">⚠️ Auto-calorie target disabled. Enter your doctor's recommended daily intake:</p>
              <input type="number" placeholder="e.g. 1500" value={form.doctor_calorie_target}
                onChange={e => f({ doctor_calorie_target: e.target.value })}
                className="w-full rounded-xl border border-red-300 dark:border-red-700 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
            </div>
          )}
          {/* Disability / other condition — free text */}
          <div className="mt-3">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
              Disability / Other Condition (optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. visual impairment, leg disability, chronic back pain…"
              value={form.disability_notes}
              onChange={e => f({ disability_notes: e.target.value })}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-violet-300 dark:focus:ring-violet-700"
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving || !form.age || !form.weight_kg || !form.height_cm}
          className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white min-h-[48px] text-base font-semibold shadow-lg shadow-amber-200/50">
          {saving ? "Saving…" : saved ? "✓ Saved!" : <><Save className="w-4 h-4 mr-2" />Save Details</>}
        </Button>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   TAB: GOALS
═══════════════════════════════════════════════════════ */

function GoalsTab({ goalType, setGoalType, goalWeight, setGoalWeight, goalDeadline, setGoalDeadline, bmr, tdee, budget, form, saving, saved, handleSave }) {

  /* ── Deadline / timeline analysis ── */
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weightDiff = goalWeight && form.weight_kg
    ? Math.abs(parseFloat(goalWeight) - parseFloat(form.weight_kg))
    : null;

  // Safe rate: ~0.5 kg/week (recommended max)
  const safeWeeks = weightDiff ? Math.ceil(weightDiff / 0.5) : null;

  let weeksAvailable = null;
  let deadlineWarning = null; // "danger" | "caution" | "ok" | null
  let deadlineMessage = null;
  let deadlineSub = null;

  if (goalDeadline && goalType !== "maintain" && safeWeeks !== null) {
    const deadline = new Date(goalDeadline);
    deadline.setHours(0, 0, 0, 0);
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    weeksAvailable = Math.max(0, (deadline - today) / msPerWeek);

    if (deadline <= today) {
      deadlineWarning = "danger";
      deadlineMessage = "⚠️ Deadline is in the past!";
      deadlineSub = "Please choose a future date.";
    } else if (weeksAvailable < safeWeeks * 0.5) {
      // Very aggressive — less than half the safe time
      deadlineWarning = "danger";
      const kgPerWeek = (weightDiff / weeksAvailable).toFixed(2);
      deadlineMessage = "🚨 This timeline is dangerously fast!";
      deadlineSub = `At ${kgPerWeek} kg/week, this could seriously harm your health. Safe rate is ~0.5 kg/week. We cannot support this goal — please extend your deadline to at least ${safeWeeks} weeks from today.`;
    } else if (weeksAvailable < safeWeeks * 0.7) {
      // Aggressive but not extreme
      deadlineWarning = "caution";
      const kgPerWeek = (weightDiff / weeksAvailable).toFixed(2);
      deadlineMessage = "⚠️ This timeline is too aggressive for safe weight change";
      deadlineSub = `At ${kgPerWeek} kg/week, you risk nutritional deficiencies and muscle loss. We recommend at least ${safeWeeks} weeks (0.5 kg/week). Consult a doctor before proceeding.`;
    } else {
      // Healthy timeline
      deadlineWarning = "ok";
      const kgPerWeek = (weightDiff / weeksAvailable).toFixed(2);
      const estDate = new Date(today.getTime() + safeWeeks * 7 * 24 * 60 * 60 * 1000);
      deadlineMessage = `✅ Great! Achievable in ~${Math.ceil(weeksAvailable)} weeks`;
      deadlineSub = `Targeting ~${kgPerWeek} kg/week. At safe pace (0.5 kg/wk) you'd reach your goal around ${estDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}.`;
    }
  }

  // Min date for the deadline picker (today + 1 day)
  const minDate = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  // Human-friendly relative description of the deadline
  const relativeTime = (() => {
    if (!goalDeadline) return null;
    const dl = new Date(goalDeadline);
    dl.setHours(0, 0, 0, 0);
    const totalDays = Math.round((dl - today) / (24 * 60 * 60 * 1000));
    if (totalDays <= 0) return null;
    const years = Math.floor(totalDays / 365);
    const months = Math.floor((totalDays % 365) / 30);
    const days = totalDays % 30;
    if (years > 0 && months > 0) return `in ${years} year${years > 1 ? "s" : ""} ${months} month${months > 1 ? "s" : ""}`;
    if (years > 0) return `in ${years} year${years > 1 ? "s" : ""}`;
    if (months > 0 && days > 0) return `in ${months} month${months > 1 ? "s" : ""} ${days} day${days > 1 ? "s" : ""}`;
    if (months > 0) return `in ${months} month${months > 1 ? "s" : ""}`;
    return `in ${totalDays} day${totalDays > 1 ? "s" : ""}`;
  })();

  return (
    <motion.div key="goals" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.2 }} className="space-y-4">

      {/* BMR/TDEE Preview */}
      {bmr && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "BMR", value: bmr, icon: Flame, color: "from-rose-400 to-red-500", desc: "Base metabolic rate" },
            { label: "TDEE", value: tdee, icon: Activity, color: "from-amber-400 to-orange-500", desc: "Daily energy use" },
            { label: "Budget", value: budget, icon: Target, color: "from-emerald-400 to-green-500", desc: "Your calorie target" },
          ].map(stat => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 text-center shadow-sm">
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-2`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{stat.value?.toLocaleString() ?? "—"}</p>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{stat.label}</p>
              </div>
            );
          })}
        </div>
      )}

      {!bmr && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl p-4 text-center text-sm text-amber-700 dark:text-amber-300">
          ℹ️ Fill in your personal details first to see live calorie calculations.
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 space-y-5">

        {/* Goal Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Your Goal</label>
          <div className="grid grid-cols-3 gap-3">
            {GOAL_OPTIONS.map(g => (
              <button key={g.value} onClick={() => setGoalType(g.value)}
                className={`flex flex-col items-center gap-2 py-4 rounded-2xl border-2 font-medium text-sm transition-all duration-200 ${goalType === g.value
                  ? `${g.bg} ${g.border} ${g.text} shadow-sm`
                  : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300"
                  }`}>
                <span className="text-2xl">{g.icon}</span>
                <span className="text-xs font-semibold leading-tight text-center">{g.label}</span>
                {goalType === g.value && <div className="w-1.5 h-1.5 rounded-full bg-current" />}
              </button>
            ))}
          </div>
        </div>

        {/* Goal Weight */}
        {goalType !== "maintain" && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {goalType === "lose" ? "🎯 Target Weight (kg)" : "🎯 Goal Weight (kg)"}
            </label>
            <Input
              type="number"
              placeholder={goalType === "lose" ? "e.g. 65" : "e.g. 80"}
              value={goalWeight}
              onChange={e => setGoalWeight(e.target.value)}
              className="rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
            {goalWeight && form.weight_kg && (
              <p className="text-xs text-gray-400 mt-1.5">
                {parseFloat(goalWeight) < parseFloat(form.weight_kg)
                  ? `📉 Lose ${(parseFloat(form.weight_kg) - parseFloat(goalWeight)).toFixed(1)} kg — daily budget set ~500 kcal below TDEE.`
                  : `📈 Gain ${(parseFloat(goalWeight) - parseFloat(form.weight_kg)).toFixed(1)} kg — daily budget set ~500 kcal above TDEE.`}
              </p>
            )}
          </div>
        )}

        {/* Deadline Picker — only for lose / gain */}
        {goalType !== "maintain" && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-violet-400" />
              Target Deadline
              <span className="text-xs font-normal text-gray-400">(optional)</span>
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="date"
                min={minDate}
                value={goalDeadline}
                onChange={e => setGoalDeadline(e.target.value)}
                className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-300 dark:focus:ring-violet-700"
              />
              {goalDeadline && (
                <button
                  onClick={() => setGoalDeadline("")}
                  className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {/* Relative time display */}
            {relativeTime && (
              <div className="flex items-center gap-1.5 mt-1.5 px-1">
                <Clock className="w-3.5 h-3.5 text-violet-400" />
                <span className="text-sm font-semibold text-violet-600 dark:text-violet-400">{relativeTime}</span>
                {safeWeeks && (
                  <span className="text-xs text-gray-400">· safe minimum: {safeWeeks} weeks</span>
                )}
              </div>
            )}

            {/* Timeline Warning / Info */}
            <AnimatePresence mode="wait">
              {deadlineWarning && (
                <motion.div
                  key={deadlineWarning}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`mt-3 rounded-xl p-3.5 border ${deadlineWarning === "danger"
                    ? "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700"
                    : deadlineWarning === "caution"
                      ? "bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700"
                      : "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700"
                    }`}
                >
                  <div className="flex items-start gap-2">
                    {deadlineWarning !== "ok" ? (
                      <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${deadlineWarning === "danger" ? "text-red-500" : "text-orange-500"
                        }`} />
                    ) : (
                      <Clock className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-500" />
                    )}
                    <div>
                      <p className={`text-sm font-semibold ${deadlineWarning === "danger" ? "text-red-700 dark:text-red-300"
                        : deadlineWarning === "caution" ? "text-orange-700 dark:text-orange-300"
                          : "text-emerald-700 dark:text-emerald-300"
                        }`}>{deadlineMessage}</p>
                      <p className={`text-xs mt-0.5 leading-relaxed ${deadlineWarning === "danger" ? "text-red-600 dark:text-red-400"
                        : deadlineWarning === "caution" ? "text-orange-600 dark:text-orange-400"
                          : "text-emerald-600 dark:text-emerald-400"
                        }`}>{deadlineSub}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {goalType === "maintain" && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-3 text-sm text-amber-700 dark:text-amber-300">
            ⚖️ Maintaining — your daily calorie budget matches your TDEE.
          </div>
        )}

        {/* Current weight for reference */}
        {form.weight_kg && (
          <div className="flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3">
            <span className="text-gray-500 dark:text-gray-400">Current weight</span>
            <span className="font-bold text-gray-800 dark:text-gray-200">{form.weight_kg} kg</span>
          </div>
        )}

        <Button onClick={handleSave} disabled={saving}
          className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white min-h-[48px] text-base font-semibold shadow-lg shadow-amber-200/50">
          {saving ? "Saving…" : saved ? "✓ Saved!" : <><Save className="w-4 h-4 mr-2" />Save Goal</>}
        </Button>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   TAB: SETTINGS
═══════════════════════════════════════════════════════ */

function SettingsTab({ theme, handleThemeToggle, language, handleLanguageChange, onDeleteRequest }) {
  const [langOpen, setLangOpen] = useState(false);
  const selectedLang = LANGUAGES.find(l => l.code === language)?.label || "English";

  return (
    <motion.div key="settings" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.2 }} className="space-y-4">

      {/* Appearance */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 space-y-1">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Appearance</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
              {theme === "dark" ? <Moon className="w-4 h-4 text-violet-500" /> : <Sun className="w-4 h-4 text-amber-500" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Theme</p>
              <p className="text-xs text-gray-400">{theme === "dark" ? "Dark mode" : "Light mode"}</p>
            </div>
          </div>
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            <button
              onClick={() => handleThemeToggle("light")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${theme === "light" ? "bg-white dark:bg-gray-700 text-amber-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>
              <Sun className="w-3.5 h-3.5" />Light
            </button>
            <button
              onClick={() => handleThemeToggle("dark")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${theme === "dark" ? "bg-gray-700 text-violet-400 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>
              <Moon className="w-3.5 h-3.5" />Dark
            </button>
          </div>
        </div>
      </div>

      {/* Language */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Language</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <Globe className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">App Language</p>
              <p className="text-xs text-gray-400">{selectedLang}</p>
            </div>
          </div>
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="text-xs font-semibold text-violet-500 hover:text-violet-600 transition-colors"
          >
            Change
          </button>
        </div>
        {langOpen && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => { handleLanguageChange(lang.code); setLangOpen(false); }}
                className={`py-2 px-3 rounded-xl border text-xs font-medium text-left transition-all ${language === lang.code ? "bg-blue-50 dark:bg-blue-900/20 border-blue-400 text-blue-700 dark:text-blue-300" : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-200"}`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Data Management */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Data</p>
        <button
          onClick={onDeleteRequest}
          className="w-full flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-2xl px-4 py-3.5 text-left hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors group"
        >
          <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-4 h-4 text-red-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">Delete All Data</p>
            <p className="text-xs text-red-500/70 dark:text-red-500/60">Permanently remove all your app data</p>
          </div>
          <ChevronRight className="w-4 h-4 text-red-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* About */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">About</p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">BealthAI</span>
          <span className="text-gray-400 text-xs">v1.0.0</span>
        </div>
        <p className="text-xs text-gray-400 mt-2 leading-relaxed">
          Your personal AI-powered nutrition & health companion. Data is stored locally on your device.
        </p>
      </div>
    </motion.div>
  );
}