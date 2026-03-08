import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Utensils, Droplets, Flame, Activity, Check, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { generateDietPlan } from "../../components/geminiAI";

const DietPlanGenerator = ({ profile, todayLogs }) => {
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [expandedMeal, setExpandedMeal] = useState(null);

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await generateDietPlan(profile, todayLogs);
            setPlan(data);
        } catch (err) {
            setError(err?.message || "Failed to generate diet plan. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden mt-6">
            <div className="px-5 pt-5 pb-4 bg-gradient-to-r from-emerald-500 to-teal-600">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                            <Utensils className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">AI Diet Plan Generator</p>
                            <p className="text-xs text-emerald-100">Personalised to your goals</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-5">
                {!plan && !loading && (
                    <div className="text-center py-6">
                        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Activity className="w-8 h-8 text-emerald-500" />
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 max-w-sm mx-auto">
                            Generate a custom 1-day meal plan based on your height, weight, activity level, and goals.
                        </p>
                        <button
                            onClick={handleGenerate}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold flex items-center justify-center gap-2 px-6 py-3 rounded-2xl mx-auto transition-colors"
                        >
                            <Utensils className="w-4 h-4" />
                            Generate My Plan
                        </button>
                    </div>
                )}

                {loading && (
                    <div className="py-12 flex flex-col items-center justify-center">
                        <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin mb-4" />
                        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                            Designing your perfect menu...
                        </p>
                        <p className="text-xs text-gray-400 mt-2">Analysing your profile and goals</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 text-center mt-2">
                        <AlertTriangle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                        <p className="text-sm text-red-600 dark:text-red-400 mb-3">{error}</p>
                        <button onClick={handleGenerate} className="text-xs bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300 px-4 py-2 rounded-xl font-medium">Try again</button>
                    </div>
                )}

                {!loading && plan && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                        <div className="text-center space-y-1">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{plan.plan_name}</h3>
                            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                Target: {plan.daily_calorie_goal} kcal
                            </p>
                        </div>

                        {/* Daily Macros */}
                        {plan.daily_macros && (
                            <div className="grid grid-cols-3 gap-3 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl">
                                <div className="text-center">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-1">Protein</p>
                                    <p className="text-lg font-bold text-indigo-500">{plan.daily_macros.protein}g</p>
                                </div>
                                <div className="text-center border-l border-r border-gray-200 dark:border-gray-700">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-1">Carbs</p>
                                    <p className="text-lg font-bold text-amber-500">{plan.daily_macros.carbs}g</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-1">Fats</p>
                                    <p className="text-lg font-bold text-rose-500">{plan.daily_macros.fats}g</p>
                                </div>
                            </div>
                        )}

                        {/* Meals List */}
                        <div className="space-y-3">
                            {plan.meals?.map((meal, idx) => (
                                <div key={idx} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors">
                                    <button
                                        onClick={() => setExpandedMeal(expandedMeal === idx ? null : idx)}
                                        className="w-full flex items-center justify-between p-4"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                                                <Flame className="w-5 h-5 text-emerald-500" />
                                            </div>
                                            <div className="text-left">
                                                <h4 className="font-bold text-gray-900 dark:text-white text-sm">{meal.type}</h4>
                                                <p className="text-xs text-gray-500">{meal.time_label} • {meal.total_calories} kcal</p>
                                            </div>
                                        </div>
                                        {expandedMeal === idx ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                    </button>

                                    <AnimatePresence>
                                        {expandedMeal === idx && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="border-t border-gray-100 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/30"
                                            >
                                                <div className="p-4 space-y-3">
                                                    {meal.food_items?.map((item, i) => (
                                                        <div key={i} className="flex flex-col gap-2 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{item.name}</p>
                                                                    <p className="text-xs text-gray-500 mt-0.5">{item.portion}</p>
                                                                </div>
                                                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-lg shrink-0">
                                                                    {item.calories} kcal
                                                                </span>
                                                            </div>
                                                            <div className="flex gap-3 text-[10px] font-medium text-gray-500 uppercase tracking-wider mt-1 border-t border-gray-50 dark:border-gray-700 pt-2">
                                                                <span>P: <span className="text-indigo-500 font-bold">{item.protein}g</span></span>
                                                                <span>C: <span className="text-amber-500 font-bold">{item.carbs}g</span></span>
                                                                <span>F: <span className="text-rose-500 font-bold">{item.fats}g</span></span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>

                        {plan.hydration_tip && (
                            <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800">
                                <Droplets className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed text-left">
                                    <span className="font-bold block mb-1">Hydration Tip</span>
                                    {plan.hydration_tip}
                                </p>
                            </div>
                        )}

                        <div className="pt-2">
                            <button onClick={handleGenerate} className="w-full py-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-xl transition-colors">
                                Regenerate Plan
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default DietPlanGenerator;
