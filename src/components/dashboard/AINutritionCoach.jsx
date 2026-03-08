import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sparkles, RefreshCw, ChevronRight, Utensils,
    Dumbbell, Lightbulb, KeyRound, Star, Check, ExternalLink
} from "lucide-react";
import { getDailyAISummary } from "../../lib/aiWrapper";
import { hasGeminiKey, setGeminiKey, getGeminiKey } from "../geminiAI";

// Grade colour config
const GRADE_CONFIG = {
    A: { bg: "from-emerald-400 to-green-500", ring: "ring-emerald-300 dark:ring-emerald-700", text: "text-emerald-600 dark:text-emerald-400", label: "Excellent 🌟" },
    B: { bg: "from-amber-400 to-yellow-500", ring: "ring-amber-300 dark:ring-amber-700", text: "text-amber-600 dark:text-amber-400", label: "Good 👍" },
    C: { bg: "from-orange-400 to-orange-500", ring: "ring-orange-300 dark:ring-orange-700", text: "text-orange-600 dark:text-orange-400", label: "Moderate ⚠️" },
    D: { bg: "from-red-400 to-rose-500", ring: "ring-red-300 dark:ring-red-700", text: "text-red-600 dark:text-red-400", label: "Needs work 💪" },
};

function scoreToGrade(score) {
    if (score >= 90) return "A";
    if (score >= 70) return "B";
    if (score >= 50) return "C";
    return "D";
}

// Shimmer skeleton loader
function Shimmer({ className }) {
    return (
        <div className={`bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse ${className}`} />
    );
}

function LoadingState() {
    return (
        <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
                <Shimmer className="w-16 h-16 rounded-2xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                    <Shimmer className="h-4 w-3/4" />
                    <Shimmer className="h-3 w-full" />
                    <Shimmer className="h-3 w-5/6" />
                </div>
            </div>
            <Shimmer className="h-20 w-full rounded-2xl" />
            <Shimmer className="h-16 w-full rounded-2xl" />
        </div>
    );
}

export default function AINutritionCoach({ profile, todayLogs = [], calorieBudget = 2000 }) {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [keyActive, setKeyActive] = useState(() => hasGeminiKey());
    const [keyInput, setKeyInput] = useState("");
    const [keySaved, setKeySaved] = useState(false);

    const refresh = useCallback(async () => {
        if (!keyActive) return;
        setLoading(true);
        setError(null);
        try {
            const result = await getDailyAISummary(profile, todayLogs, calorieBudget);
            if (result) {
                setSummary(result);
            } else {
                setError("Gemini returned an empty response. Try again.");
            }
        } catch (err) {
            const raw = err?.message || "";
            const geminiMsg = raw.includes(": ") ? raw.split(": ").slice(1).join(": ") : raw;
            if (raw.includes("429") || raw.toLowerCase().includes("quota")) {
                localStorage.removeItem("nutriscan_gemini_key");
                setKeyActive(false);
                setKeyInput("");
                setKeySaved(false);
                setError("Your Gemini free tier quota has been reached today. Please wait, or use a new key.");
            } else if (raw.includes("403") || raw.includes("400") || raw.toLowerCase().includes("api key") || raw.includes("API_KEY")) {
                localStorage.removeItem("nutriscan_gemini_key");
                setKeyActive(false);
                setKeyInput("");
                setKeySaved(false);
                setError("API key is invalid or expired. Make sure you copied the correct key starting with 'AIza...'.");
            } else if (raw.includes("400")) {
                setError(`Request error: ${geminiMsg}`);
            } else {
                setError(geminiMsg || "Couldn't reach Gemini AI. Check your connection.");
            }
        } finally {
            setLoading(false);
        }
    }, [profile, todayLogs, calorieBudget, keyActive]);

    const handleSaveKey = () => {
        const trimmed = keyInput.trim();
        if (!trimmed) return;
        setGeminiKey(trimmed);
        setKeyActive(true);
        setKeySaved(true);
        setError(null);
    };

    const handleChangeKey = () => {
        localStorage.removeItem("nutriscan_gemini_key");
        setKeyActive(false);
        setKeyInput("");
        setKeySaved(false);
        setSummary(null);
        setError(null);
    };

    const grade = summary?.overallScore != null
        ? scoreToGrade(summary.overallScore)
        : null;
    const gradeConfig = grade ? GRADE_CONFIG[grade] : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
        >
            {/* Header */}
            <div className="px-5 pt-5 pb-4 bg-gradient-to-r from-violet-500 to-indigo-600">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">AI Nutrition Coach</p>
                            <p className="text-xs text-violet-200">Powered by Gemini 2.0</p>
                        </div>
                    </div>
                    {keyActive && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleChangeKey}
                                className="text-white/60 hover:text-white text-[10px] uppercase font-bold tracking-wider transition-colors px-1"
                            >
                                Change Key
                            </button>
                            <button
                                onClick={refresh}
                                disabled={loading}
                                className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors min-h-[36px]"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                                {loading ? "Analysing…" : summary ? "Refresh" : "Analyse"}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Body */}
            <div className="p-5">

                {/* No API Key state — inline entry */}
                {!keyActive && (
                    <div className="py-2 space-y-4">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-3">
                                <KeyRound className="w-6 h-6 text-violet-500" />
                            </div>
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Gemini API Key Required</p>
                            <p className="text-xs text-gray-400">
                                Add your free Gemini key to unlock AI coaching, daily health analysis, and smart meal suggestions.
                            </p>
                            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-violet-500 hover:text-violet-600 mt-1">
                                <ExternalLink className="w-3 h-3" /> Get a free key from Google AI Studio
                            </a>
                        </div>
                        {/* Inline paste input */}
                        {!keySaved ? (
                            <div className="space-y-2">
                                <input
                                    type="password"
                                    placeholder="Paste your Gemini API key here (AIza...)"
                                    value={keyInput}
                                    onChange={e => { setKeyInput(e.target.value); setError(null); }}
                                    onKeyDown={e => e.key === "Enter" && handleSaveKey()}
                                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-300 dark:focus:ring-violet-700 font-mono"
                                />
                                <button
                                    onClick={handleSaveKey}
                                    disabled={!keyInput.trim()}
                                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-opacity min-h-[44px]"
                                >
                                    <Check className="w-4 h-4" /> Save &amp; Activate
                                </button>
                            </div>
                        ) : (
                            // Saved — encourage user to analyse
                            <div className="text-center space-y-3">
                                <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 font-semibold text-sm">
                                    <Check className="w-4 h-4" /> Key saved! Ready to coach you.
                                </div>
                                <button onClick={refresh}
                                    className="flex items-center gap-2 mx-auto bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl">
                                    <Sparkles className="w-4 h-4" /> Get AI Analysis
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Error state — show regardless of keyActive if error exists */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 text-center mb-4">
                        <p className="text-sm text-red-600 dark:text-red-400 mb-2">{error}</p>
                        {keyActive && <button onClick={refresh} className="text-xs text-red-500 hover:text-red-700 underline font-medium">Try analysis again</button>}
                    </div>
                )}

                {/* Loading state */}
                {loading && <LoadingState />}

                {/* Empty state — key exists but not yet analysed */}
                {keyActive && !loading && !summary && !error && (
                    <div className="text-center py-6">
                        <div className="text-4xl mb-3">🤖</div>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Ready to coach you</p>
                        <p className="text-xs text-gray-400 mb-4">
                            {todayLogs.length > 0
                                ? `You've logged ${todayLogs.length} meal(s) today. Let me analyse your nutrition.`
                                : "Log some food first, then I'll give you personalised coaching."}
                        </p>
                        {todayLogs.length > 0 && (
                            <button
                                onClick={refresh}
                                className="flex items-center gap-2 mx-auto bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl"
                            >
                                <Sparkles className="w-4 h-4" /> Get AI Analysis
                            </button>
                        )}
                    </div>
                )}

                {/* Summary loaded */}
                <AnimatePresence>
                    {!loading && summary && (
                        <motion.div
                            key="summary"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="space-y-4"
                        >
                            {/* Greeting */}
                            {summary.greeting && (
                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {summary.greeting}
                                </p>
                            )}

                            {/* Health Score */}
                            {grade && gradeConfig && (
                                <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4">
                                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradeConfig.bg} flex flex-col items-center justify-center shadow-lg ring-4 ${gradeConfig.ring} flex-shrink-0`}>
                                        <span className="text-2xl font-extrabold text-white leading-none">{grade}</span>
                                        <Star className="w-3 h-3 text-white/70 mt-0.5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-bold ${gradeConfig.text}`}>{gradeConfig.label}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                                            {summary.calorieMessage}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Next Meal Suggestion */}
                            {summary.nextMeal && (
                                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900 rounded-2xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Utensils className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                        <p className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wide">Next Meal</p>
                                        {summary.nextMeal.calories > 0 && (
                                            <span className="ml-auto text-xs bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-300 rounded-full px-2 py-0.5 font-semibold">
                                                ~{summary.nextMeal.calories} kcal
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="text-2xl leading-none flex-shrink-0">
                                            {summary.nextMeal.emoji || "🍽️"}
                                        </span>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800 dark:text-white">
                                                {summary.nextMeal.meal}
                                            </p>
                                            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                                                {summary.nextMeal.reason}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Exercise Tip */}
                            {summary.exerciseTip && (
                                <div className="bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900 rounded-2xl p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0">
                                            <Dumbbell className="w-4 h-4 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wide mb-1">Exercise Tip</p>
                                            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                                                {summary.exerciseTip}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Weekly Tip */}
                            {summary.weeklyTip && (
                                <div className="flex items-start gap-3 px-1">
                                    <Lightbulb className="w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                        <span className="font-semibold text-violet-600 dark:text-violet-400">Health tip: </span>
                                        {summary.weeklyTip}
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
