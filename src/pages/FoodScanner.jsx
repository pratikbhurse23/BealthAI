import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Scale, CheckCircle2, Plus, Minus, Search, History, ChevronDown, Trash2, X } from "lucide-react";
import FoodImageUploader from "../components/food/FoodImageUploader";
import AnalysisResult from "../components/food/AnalysisResult";
import BealthAlert from "../components/food/BealthAlert";
import PortionCalculator from "../components/food/PortionCalculator";
import FoodSearch from "../components/food/FoodSearch";
import { api } from "../api/client";
import { analysesStore, calorieStore } from "../components/localStore";
import { matchFood } from "../components/indianFoodLibrary";

/* ─── Normalise raw LLM/library data into a consistent object ─── */
function buildAnalysisData(raw, image_url = "") {
  return {
    food_name: raw.food_name || "Unknown Food",
    food_category: raw.food_category || "moderate",
    serving_size: raw.serving_size || "100g",
    calories: Number(raw.calories) || 0,
    protein: Number(raw.protein) || 0,
    carbs: Number(raw.carbs) || 0,
    fats: Number(raw.fats) || 0,
    fiber: Number(raw.fiber) || 0,
    sugar: Number(raw.sugar) || 0,
    nationality: raw.nationality || "",
    health_warning: raw.health_warning || "",
    healthier_alternatives: raw.healthier_alternatives || "",
    image_url,
    vitamins: JSON.stringify(Array.isArray(raw.vitamins) ? raw.vitamins : []),
    exercises: JSON.stringify(Array.isArray(raw.exercises) ? raw.exercises : []),
    health_benefits: JSON.stringify([]),
    analysis_date: new Date().toISOString().split("T")[0],
  };
}

/* ─── Log to Calorie Tracker Panel ─── */
function LogPanel({ analysis }) {
  const [qty, setQty] = useState(100);
  const [unit, setUnit] = useState("g");
  const [mealType, setMealType] = useState("snack");
  const [added, setAdded] = useState(false);

  const ratio = qty / 100;
  const scaledCals = Math.round((analysis.calories || 0) * ratio);
  const scaledProtein = ((analysis.protein || 0) * ratio).toFixed(1);
  const scaledCarbs = ((analysis.carbs || 0) * ratio).toFixed(1);
  const scaledFats = ((analysis.fats || 0) * ratio).toFixed(1);

  const handleAdd = () => {
    const today = new Date().toISOString().split("T")[0];
    calorieStore.add({
      food_name: analysis.food_name,
      calories: scaledCals,
      protein: parseFloat(scaledProtein),
      carbs: parseFloat(scaledCarbs),
      fats: parseFloat(scaledFats),
      meal_type: mealType,
      quantity: qty,
      unit,
      log_date: today,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];
  const UNITS = ["g", "ml", "serving", "piece", "cup", "tbsp"];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 space-y-4">
      <p className="text-sm font-bold text-gray-800 dark:text-white">🍽️ Add to Calorie Tracker</p>

      {/* Meal type */}
      <div className="flex gap-1.5 flex-wrap">
        {MEAL_TYPES.map(m => (
          <button key={m} onClick={() => setMealType(m)}
            className={`capitalize text-xs font-semibold px-3 py-1.5 rounded-full border transition-all min-h-[36px] ${mealType === m
              ? "bg-amber-500 border-amber-500 text-white"
              : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-amber-300"}`}>
            {m}
          </button>
        ))}
      </div>

      {/* Quantity + unit */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2 flex-1">
          <button onClick={() => setQty(q => Math.max(1, q - 10))}
            className="w-7 h-7 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center hover:bg-amber-50 transition-colors">
            <Minus className="w-3 h-3 text-gray-600 dark:text-gray-300" />
          </button>
          <input type="number" min={1} value={qty}
            onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-14 text-center font-bold text-gray-900 dark:text-white text-sm bg-transparent outline-none" />
          <button onClick={() => setQty(q => q + 10)}
            className="w-7 h-7 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center hover:bg-amber-50 transition-colors">
            <Plus className="w-3 h-3 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
        <select value={unit} onChange={e => setUnit(e.target.value)}
          className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300 min-h-[44px]">
          {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
      </div>

      {/* Scaled nutrition preview */}
      <div className="flex gap-2 text-center">
        {[
          { label: "Cal", value: scaledCals, color: "text-orange-500" },
          { label: "Protein", value: scaledProtein + "g", color: "text-blue-500" },
          { label: "Carbs", value: scaledCarbs + "g", color: "text-amber-500" },
          { label: "Fats", value: scaledFats + "g", color: "text-purple-500" },
        ].map(n => (
          <div key={n.label} className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-xl py-2">
            <p className={`text-sm font-bold ${n.color}`}>{n.value}</p>
            <p className="text-[10px] text-gray-400">{n.label}</p>
          </div>
        ))}
      </div>

      {/* Add / Confirmation */}
      <AnimatePresence mode="wait">
        {!added ? (
          <motion.button key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleAdd}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm min-h-[48px] shadow-md hover:shadow-lg active:scale-95 transition-all">
            + Add to Calorie Tracker
          </motion.button>
        ) : (
          <motion.div key="added" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="w-full py-3 rounded-2xl bg-green-500 text-white font-bold text-sm min-h-[48px] flex items-center justify-center gap-2 shadow-md shadow-green-200/40">
            <CheckCircle2 className="w-5 h-5" /> Added to today's tracker!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── History Card ─── */
function HistoryCard({ item, onReview }) {
  const catColors = {
    healthy: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    moderate: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    unhealthy: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };
  return (
    <button onClick={() => onReview(item)}
      className="w-full flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-amber-300 dark:hover:border-amber-700 shadow-sm hover:shadow-md transition-all text-left group">
      {item.image_url ? (
        <img src={item.image_url} alt={item.food_name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
      ) : (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center flex-shrink-0 text-xl">
          🍽️
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{item.food_name}</p>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          {item.nationality && <span className="text-xs text-gray-400">{item.nationality}</span>}
          <span className="text-xs text-gray-400 tabular-nums">{item.calories} kcal</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${catColors[item.food_category] || catColors.moderate}`}>
          {item.food_category}
        </span>
        <span className="text-[10px] text-gray-300 dark:text-gray-600">
          {new Date(item.created_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
        </span>
      </div>
    </button>
  );
}

/* ─── Main Page ─── */
export default function FoodScanner() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [tab, setTab] = useState("scan"); // "scan" | "portion"
  const [scanError, setScanError] = useState("");
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [searchLabel, setSearchLabel] = useState(""); // "" | "search" — to know origin of result

  useEffect(() => {
    setHistory(analysesStore.list().slice(0, 20));
  }, [analysis]);

  /* ── Photo scan ── */
  const handleImageUploaded = async (file) => {
    setIsAnalyzing(true);
    setAnalysis(null);
    setScanError("");
    setSearchLabel("");

    try {
      const { file_url } = await api.integrations.Core.UploadFile({ file });

      const nameResult = await api.integrations.Core.InvokeLLM({
        prompt: `Look at this food image. Identify the food and return ONLY a JSON object with the food name. Example: {"food_name": "Chicken Biryani"}`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: { food_name: { type: "string" } },
          required: ["food_name"]
        }
      });

      const identified = nameResult?.food_name?.trim() || "";
      const libraryMatch = identified ? matchFood(identified) : null;

      if (libraryMatch) {
        const saved = analysesStore.add(buildAnalysisData({ ...libraryMatch, nationality: "Indian 🇮🇳" }, file_url));
        setAnalysis(saved);
      } else {
        const result = await api.integrations.Core.InvokeLLM({
          prompt: `You are a nutrition expert. Analyse this food image${identified ? ` (appears to be "${identified}")` : ""}. Return complete nutritional data per 100g. Also include the cuisine/nationality origin (e.g. "Indian", "Italian", "Chinese", "Mexican", "American", etc.).`,
          file_urls: [file_url],
          response_json_schema: {
            type: "object",
            properties: {
              food_name: { type: "string" },
              food_category: { type: "string", enum: ["healthy", "moderate", "unhealthy"] },
              serving_size: { type: "string" },
              nationality: { type: "string" },
              calories: { type: "number" }, protein: { type: "number" }, carbs: { type: "number" },
              fats: { type: "number" }, fiber: { type: "number" }, sugar: { type: "number" },
              vitamins: { type: "array", items: { type: "object", properties: { name: { type: "string" }, amount: { type: "string" } } } },
              health_warning: { type: "string" },
              exercises: { type: "array", items: { type: "object", properties: { name: { type: "string" }, duration: { type: "string" }, intensity: { type: "string" }, calories_burned: { type: "number" }, description: { type: "string" } } } },
              healthier_alternatives: { type: "string" },
            },
            required: ["food_name", "calories", "protein", "carbs", "fats"]
          }
        });
        if (!result?.food_name) {
          setScanError("Could not analyse this image. Please try a clearer photo of the food.");
        } else {
          const saved = analysesStore.add(buildAnalysisData(result, file_url));
          setAnalysis(saved);
        }
      }
    } catch (err) {
      console.error("Scan error:", err);
      setScanError("Something went wrong. Please try again with a clearer photo.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  /* ── History item tapped ── */
  const handleHistoryReview = (item) => {
    setAnalysis(item);
    setSearchLabel("");
    setScanError("");
    setShowHistory(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ── Food search result selected → treat as full analysis ── */
  const handleSearchSelect = (food) => {
    // Normalise into the same shape as a scan result and save to history
    const normalised = buildAnalysisData({
      food_name: food.food_name || "Unknown",
      food_category: food.food_category || "moderate",
      serving_size: "100g",
      nationality: food.nationality || "",
      calories: food.calories || 0,
      protein: food.protein || 0,
      carbs: food.carbs || 0,
      fats: food.fats || 0,
      fiber: food.fiber || 0,
      sugar: food.sugar || 0,
      health_warning: food.health_warning || "",
      healthier_alternatives: food.healthier_alternatives || "",
      vitamins: food.vitamins || [],
      exercises: food.exercises || [],
    });
    const saved = analysesStore.add(normalised);
    setAnalysis(saved);
    setSearchLabel("search");
    setScanError("");
    // Scroll down to result after dropdown closes
    setTimeout(() => { const el = document.getElementById("scanner-result"); el?.scrollIntoView({ behavior: "smooth" }); }, 150);
  };

  const handlePortionLog = (foodData) => {
    const today = new Date().toISOString().split("T")[0];
    calorieStore.add({ ...foodData, meal_type: "snack", log_date: today });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-amber-50/50 dark:from-gray-950 dark:via-gray-950 dark:to-gray-950">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12 space-y-5">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-200/40">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Food Scanner</h1>
            <p className="text-sm text-gray-400">AI photo analysis + Portion Calculator</p>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-2xl p-1">
          {[{ key: "scan", label: "📷 Scan Food" }, { key: "portion", label: "⚖️ Portion Calc" }].map(t => (
            <button key={t.key}
              onClick={() => { setTab(t.key); setAnalysis(null); setSearchLabel(""); setScanError(""); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all min-h-[44px] ${tab === t.key
                ? "bg-white dark:bg-gray-700 text-amber-600 dark:text-amber-400 shadow-sm"
                : "text-gray-400 dark:text-gray-500"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ═══ SCAN TAB ═══ */}
        {tab === "scan" && (
          <div className="space-y-5">

            {/* ── Food Name Search ── */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Search className="w-3 h-3" /> Search food by name
              </p>
              <FoodSearch
                onSelect={handleSearchSelect}
                onDirectAdd={(food) => {
                  const today = new Date().toISOString().split("T")[0];
                  calorieStore.add({ food_name: food.food_name, calories: food.calories || 0, protein: food.protein || 0, carbs: food.carbs || 0, fats: food.fats || 0, meal_type: "snack", quantity: 100, unit: "g", log_date: today });
                }}
              />
            </div>

            {/* Search result is now shown via the shared `analysis` block below */}

            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
              <span className="text-xs text-gray-400 font-medium">or scan a photo</span>
              <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
            </div>

            {/* ── Photo Uploader ── */}
            <FoodImageUploader onImageUploaded={handleImageUploaded} isAnalyzing={isAnalyzing} />

            {/* Scan error */}
            {scanError && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-2xl p-4 text-sm text-red-700 dark:text-red-300 text-center">
                ⚠️ {scanError}
              </motion.div>
            )}

            {/* ── Scan / Search Result (shared display) ── */}
            <AnimatePresence>
              {analysis && (
                <motion.div id="scanner-result" key={analysis.id || analysis.food_name} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                  {/* Source label */}
                  {searchLabel === "search" && (
                    <div className="flex items-center gap-2 px-1">
                      <Search className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-xs font-medium text-blue-500">Search result — {analysis.food_name}</span>
                    </div>
                  )}
                  {/* Full nutrition info — same as original scan result */}
                  <AnalysisResult analysis={analysis} showPortionCalculator={false} />
                  {/* Log to calorie tracker with quantity selector */}
                  <LogPanel analysis={analysis} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── History Section ── */}
            {history.length > 0 && (
              <div>
                <button
                  onClick={() => setShowHistory(v => !v)}
                  className="w-full flex items-center justify-between px-1 py-2 group"
                >
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-gray-400" />
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recent Scans</p>
                    <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">{history.length}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showHistory ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {showHistory && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-2 pt-2 pb-1">
                        {history.map(item => (
                          <HistoryCard key={item.id} item={item} onReview={handleHistoryReview} />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}

        {/* ═══ PORTION CALC TAB ═══ */}
        {tab === "portion" && (
          <PortionCalculator onLog={handlePortionLog} />
        )}

      </div>
    </div>
  );
}