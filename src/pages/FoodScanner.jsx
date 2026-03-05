import React, { useState } from "react";
import { motion } from "framer-motion";
import { Camera, Scale } from "lucide-react";
import FoodImageUploader from "../components/food/FoodImageUploader";
import AnalysisResult from "../components/food/AnalysisResult";
import BealthAlert from "../components/food/BealthAlert";
import PortionCalculator from "../components/food/PortionCalculator";
import { api } from "../api/client";
import { analysesStore, calorieStore } from "../components/localStore";
import { INDIAN_FOOD_LIBRARY, matchFood } from "../components/indianFoodLibrary";

function buildAnalysisData(raw, image_url = "") {
  return {
    food_name: raw.food_name || "Unknown Food",
    food_category: raw.food_category || "moderate",
    serving_size: raw.serving_size || "100g",
    calories: raw.calories || 0,
    protein: raw.protein || 0,
    carbs: raw.carbs || 0,
    fats: raw.fats || 0,
    fiber: raw.fiber || 0,
    sugar: raw.sugar || 0,
    health_warning: raw.health_warning || "",
    healthier_alternatives: raw.healthier_alternatives || "",
    image_url,
    vitamins: JSON.stringify(Array.isArray(raw.vitamins) ? raw.vitamins : []),
    exercises: JSON.stringify(Array.isArray(raw.exercises) ? raw.exercises : []),
    health_benefits: JSON.stringify([]),
    analysis_date: new Date().toISOString().split("T")[0],
  };
}

export default function FoodScanner() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [logged, setLogged] = useState(false);
  const [tab, setTab] = useState("scan"); // "scan" | "portion"

  const handleImageUploaded = async (file) => {
    setIsAnalyzing(true);
    setAnalysis(null);
    setLogged(false);

    const { file_url } = await api.integrations.Core.UploadFile({ file });

    const nameResult = await api.integrations.Core.InvokeLLM({
      prompt: `Look at this food image and return ONLY a JSON with the most likely Indian food name. {"food_name": "..."}`,
      file_urls: [file_url],
      response_json_schema: { type: "object", properties: { food_name: { type: "string" } } }
    });

    const identified = nameResult?.food_name || "";
    const libraryMatch = matchFood(identified);

    if (libraryMatch) {
      const saved = analysesStore.add(buildAnalysisData(libraryMatch, file_url));
      setAnalysis(saved);
    } else {
      const result = await api.integrations.Core.InvokeLLM({
        prompt: `Analyze this food image and return complete nutrition data per 100g as JSON. Food: "${identified}". Include calories, protein, carbs, fats, fiber, sugar, health_warning if unhealthy, healthier_alternatives.`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            food_name: { type: "string" },
            food_category: { type: "string", enum: ["healthy", "moderate", "unhealthy"] },
            serving_size: { type: "string" },
            calories: { type: "number" }, protein: { type: "number" }, carbs: { type: "number" },
            fats: { type: "number" }, fiber: { type: "number" }, sugar: { type: "number" },
            vitamins: { type: "array", items: { type: "object", properties: { name: { type: "string" }, amount: { type: "string" } } } },
            health_warning: { type: "string" },
            exercises: { type: "array", items: { type: "object", properties: { name: { type: "string" }, duration: { type: "string" }, intensity: { type: "string" }, calories_burned: { type: "number" }, description: { type: "string" } } } },
            healthier_alternatives: { type: "string" },
          }
        }
      });
      const saved = analysesStore.add(buildAnalysisData(result, file_url));
      setAnalysis(saved);
    }
    setIsAnalyzing(false);
  };

  const handleLog = (foodData) => {
    const today = new Date().toISOString().split("T")[0];
    calorieStore.add({ ...foodData, meal_type: "snack", log_date: today });
    setLogged(true);
  };

  const handlePortionLog = (foodData) => {
    const today = new Date().toISOString().split("T")[0];
    calorieStore.add({ ...foodData, meal_type: "snack", log_date: today });
    setLogged(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-amber-50/50 dark:from-gray-950 dark:via-gray-950 dark:to-gray-950">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Food Scanner</h1>
            <p className="text-sm text-gray-400">AI photo analysis + Portion Calculator</p>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-2xl p-1 mb-6">
          {[{ key: "scan", label: "📷 Scan Food", icon: Camera }, { key: "portion", label: "⚖️ Portion Calc", icon: Scale }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all min-h-[44px] ${tab === t.key ? "bg-white dark:bg-gray-700 text-amber-600 dark:text-amber-400 shadow-sm" : "text-gray-400"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "scan" && (
          <div className="space-y-5">
            <FoodImageUploader onImageUploaded={handleImageUploaded} isAnalyzing={isAnalyzing} />
            {analysis && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <AnalysisResult analysis={analysis} />
                <BealthAlert food={analysis} />
                {!logged ? (
                  <button onClick={() => handleLog({ food_name: analysis.food_name, calories: analysis.calories, protein: analysis.protein, carbs: analysis.carbs, fats: analysis.fats, quantity: 100, unit: "g" })}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm min-h-[48px]">
                    + Log to Calorie Tracker
                  </button>
                ) : (
                  <div className="text-center py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl text-green-600 font-semibold text-sm">
                    ✓ Logged to today's tracker!
                  </div>
                )}
              </motion.div>
            )}
          </div>
        )}

        {tab === "portion" && (
          <PortionCalculator onLog={handlePortionLog} />
        )}
      </div>
    </div>
  );
}