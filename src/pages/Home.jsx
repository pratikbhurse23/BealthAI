import React, { useState, useEffect } from "react";
import { api } from "../api/client";
import { motion } from "framer-motion";
import { Sparkles, History, ArrowRight, Search } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import FoodImageUploader from "../components/food/FoodImageUploader";
import FoodSearch from "../components/food/FoodSearch";
import AnalysisResult from "../components/food/AnalysisResult";
import HistoryCard from "../components/food/HistoryCard";
import { analysesStore } from "../components/localStore";
import { INDIAN_FOOD_LIBRARY, matchFood } from "../components/indianFoodLibrary";

export default function Home() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    setRecentAnalyses(analysesStore.list().slice(0, 5));
  }, []);

  // Search local food library
  const handleSearch = (q) => {
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults([]); return; }
    const lower = q.toLowerCase();
    const results = INDIAN_FOOD_LIBRARY.filter(f =>
      f.food_name.toLowerCase().includes(lower)
    ).slice(0, 8);
    setSearchResults(results);
  };

  const selectFromLibrary = (food) => {
    const analysisData = buildAnalysisData(food);
    const saved = analysesStore.add(analysisData);
    setCurrentAnalysis(saved);
    setRecentAnalyses(analysesStore.list().slice(0, 5));
    setSearchQuery("");
    setSearchResults([]);
    setShowSearch(false);
    setSelectedHistory(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  function generateBenefits(raw) {
    const benefits = [];
    if (raw.protein >= 10) benefits.push({ title: "Muscle Building", description: `High protein content (${raw.protein}g) helps repair and build muscles. Great for post-workout recovery.` });
    if (raw.iron_flag || (raw.vitamins || []).some?.(v => v?.name?.includes("Iron"))) benefits.push({ title: "Blood Production", description: "Contains iron which aids in haemoglobin production and helps prevent anaemia." });
    if (raw.calories >= 300 && raw.protein >= 8) benefits.push({ title: "Weight & Mass Gain", description: `Calorie-dense (${raw.calories} kcal) with good protein — supports healthy weight gain when eaten regularly.` });
    if (raw.fiber >= 5) benefits.push({ title: "Digestive Health", description: `Rich in dietary fibre (${raw.fiber}g) which promotes healthy digestion and gut health.` });
    if (raw.calories <= 80 && raw.food_category === "healthy") benefits.push({ title: "Weight Management", description: "Low in calories while being nutrient-rich — ideal for maintaining a healthy weight." });
    if ((raw.vitamins || []).some?.(v => v?.name?.includes("Vitamin C"))) benefits.push({ title: "Immunity Boost", description: "Contains Vitamin C which strengthens the immune system and protects against infections." });
    if ((raw.vitamins || []).some?.(v => v?.name?.toLowerCase().includes("omega"))) benefits.push({ title: "Heart & Brain Health", description: "Omega-3 fatty acids support cardiovascular health and improve brain function." });
    if (raw.food_category === "unhealthy") {
      benefits.length = 0;
      benefits.push({ title: "High Calorie Load", description: `At ${raw.calories} kcal, this food can contribute to weight gain if consumed frequently.` });
      if (raw.sugar > 15) benefits.push({ title: "Blood Sugar Spike", description: `Contains ${raw.sugar}g of sugar which can cause rapid blood sugar spikes — limit if diabetic.` });
      if (raw.fats > 15) benefits.push({ title: "High Fat Content", description: `Contains ${raw.fats}g of fat. Excess saturated fat can raise cholesterol and strain the heart.` });
    }
    return benefits.slice(0, 4);
  }

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
      health_benefits: JSON.stringify(Array.isArray(raw.health_benefits) ? raw.health_benefits : generateBenefits(raw)),
      analysis_date: new Date().toISOString().split("T")[0],
    };
  }

  const handleImageUploaded = async (file) => {
    setIsAnalyzing(true);
    setCurrentAnalysis(null);
    setSelectedHistory(null);
    setError(null);

    // Upload image for display
    const { file_url } = await api.integrations.Core.UploadFile({ file });

    // Try to identify food name from image using AI
    const nameResult = await api.integrations.Core.InvokeLLM({
      prompt: `Look at this food image and return ONLY a JSON with the most likely Indian food name. {"food_name": "..."}`,
      file_urls: [file_url],
      response_json_schema: {
        type: "object",
        properties: { food_name: { type: "string" } }
      }
    });

    const identified = nameResult?.food_name || "";

    // Try matching against local library first
    const libraryMatch = matchFood(identified);

    if (libraryMatch) {
      const saved = analysesStore.add(buildAnalysisData(libraryMatch, file_url));
      setCurrentAnalysis(saved);
    } else {
      // Fallback: get full nutrition from AI
      const result = await api.integrations.Core.InvokeLLM({
        prompt: `Analyze this food image and return nutrition data as JSON. Food identified: "${identified}". Include calories, protein, carbs, fats, fiber, sugar per 100g, health_warning if unhealthy, healthier_alternatives, exercises to burn calories, vitamins, and health_benefits (2-4 specific benefits like blood production, muscle building, weight gain/loss, immunity, energy, heart health, brain health - explain why this food is beneficial or harmful with title and description for each).`,
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
            health_benefits: { type: "array", items: { type: "object", properties: { title: { type: "string" }, description: { type: "string" } } } }
          }
        }
      });
      const saved = analysesStore.add(buildAnalysisData(result, file_url));
      setCurrentAnalysis(saved);
    }

    setRecentAnalyses(analysesStore.list().slice(0, 5));
    setIsAnalyzing(false);
  };

  const displayedAnalysis = selectedHistory || currentAnalysis;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-amber-50/50">
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            AI-Powered Food Analysis
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-3">
            Bealth<span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">AI</span>
          </h1>
          <p className="text-gray-500 max-w-md mx-auto text-base">
            Snap a photo or search any Indian dish — get instant nutrition insights, health ratings, and exercise plans.
          </p>
        </motion.div>

        {/* Global AI Food Search removed (duplicate) */}

        {/* Search food library */}
        <div className="mb-6 relative z-30">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <Input
              placeholder="Search Indian foods (e.g. Biryani, Samosa…)"
              value={searchQuery}
              onChange={(e) => { handleSearch(e.target.value); setShowSearch(true); }}
              onFocus={() => setShowSearch(true)}
              onBlur={() => setTimeout(() => setShowSearch(false), 150)}
              className="pl-9 rounded-2xl border-gray-200 bg-white shadow-sm text-gray-900 dark:text-gray-900"
            />
            {searchQuery && (
              <button
                onMouseDown={(e) => { e.preventDefault(); setSearchQuery(""); setSearchResults([]); setShowSearch(false); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
          {showSearch && searchResults.length > 0 && (
            <div className="absolute z-30 left-0 right-0 top-12 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
              {searchResults.map((food) => (
                <button
                  key={food.food_name}
                  onMouseDown={(e) => { e.preventDefault(); selectFromLibrary(food); }}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-amber-50 transition-colors text-left border-b border-gray-50 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">{food.food_name}</p>
                    <p className="text-xs text-gray-400">P: {food.protein}g · C: {food.carbs}g · F: {food.fats}g</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-amber-600">{food.calories} kcal</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${food.food_category === "healthy" ? "bg-green-100 text-green-700" : food.food_category === "unhealthy" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {food.food_category}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
          {showSearch && searchResults.length === 0 && searchQuery && (
            <div className="absolute z-30 left-0 right-0 top-12 bg-white rounded-2xl border border-gray-100 shadow-xl px-4 py-3 text-sm text-gray-400">
              No matches — scan image for AI analysis
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm">{error}</div>
        )}

        {/* Uploader */}
        <FoodImageUploader onImageUploaded={handleImageUploaded} isAnalyzing={isAnalyzing} />

        {/* Results */}
        {displayedAnalysis && (
          <div className="mt-8">
            <AnalysisResult analysis={displayedAnalysis} showPortionCalculator={false} />
          </div>
        )}

        {/* Recent History */}
        {recentAnalyses.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <History className="w-5 h-5 text-amber-500" />
                Recent Scans
              </h2>
              <Link to={createPageUrl("History")}>
                <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {recentAnalyses.map((item) => (
                <HistoryCard key={item.id} item={item} onClick={() => {
                  setSelectedHistory(item);
                  setCurrentAnalysis(null);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }} />
              ))}
            </div>
          </div>
        )}

        {/* Food Library Quick Browse */}
        <div className="mt-12">
          <h2 className="text-lg font-bold text-gray-900 mb-4">🇮🇳 Popular Indian Dishes</h2>
          <div className="flex flex-wrap gap-2">
            {INDIAN_FOOD_LIBRARY.slice(0, 20).map((food) => (
              <button
                key={food.food_name}
                onClick={() => selectFromLibrary(food)}
                className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1.5 text-gray-600 hover:border-amber-300 hover:text-amber-700 hover:bg-amber-50 transition-all shadow-sm"
              >
                {food.food_name} · {food.calories} kcal
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}