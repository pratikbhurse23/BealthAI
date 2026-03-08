import React from "react";
import { motion } from "framer-motion";
import { BABY_FOOD_DB } from "./babyFoodDatabase";
import { EXERCISE_DB, LOCATION_AVAILABILITY, LOCATION_META } from "./exerciseDatabase";
import { ShieldAlert, Utensils, Activity } from "lucide-react";

export default function BabyCard({ ageKey, ageGroupMeta }) {
    const foodData = BABY_FOOD_DB[ageKey];
    const exercises = EXERCISE_DB[ageKey] || {};
    const availableLocations = LOCATION_AVAILABILITY[ageKey] || ["home"];

    return (
        <div className="space-y-5">
            {/* Safety notice */}
            <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-2xl p-4"
            >
                <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center flex-shrink-0">
                        <ShieldAlert className="w-5 h-5 text-rose-500" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-rose-700 dark:text-rose-300 mb-1">
                            Parent / Caregiver Supervision Required
                        </p>
                        <p className="text-xs text-rose-600 dark:text-rose-400 leading-relaxed">
                            {foodData?.safetyNote || "All activities require adult supervision at all times."}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Gentle Activities */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-4 h-4 text-amber-500" />
                    <h3 className="text-sm font-bold text-gray-800 dark:text-white">
                        Gentle Activities {ageGroupMeta.emoji}
                    </h3>
                    <span className="ml-auto text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-full px-2.5 py-0.5">
                        {ageGroupMeta.mins}
                    </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">
                    {foodData?.activityNote}
                </p>
                <div className="space-y-2">
                    {availableLocations.map(loc => {
                        const locMeta = LOCATION_META[loc];
                        const locExercises = exercises[loc] || [];
                        if (!locExercises.length) return null;
                        return (
                            <div key={loc} className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 p-3">
                                <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                                    <span>{locMeta.icon}</span> {locMeta.label}
                                </p>
                                <div className="space-y-2">
                                    {locExercises.map(ex => (
                                        <div key={ex.name} className="flex items-start gap-2.5">
                                            <span className="text-lg leading-none mt-0.5">{ex.icon}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold text-gray-800 dark:text-white">{ex.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{ex.desc}</p>
                                            </div>
                                            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium flex-shrink-0">{ex.duration}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Feeding Guide */}
            {foodData && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <div className="flex items-center gap-2 mb-3">
                        <Utensils className="w-4 h-4 text-green-500" />
                        <h3 className="text-sm font-bold text-gray-800 dark:text-white">Feeding Guide 🍼</h3>
                    </div>
                    <div className="space-y-3">
                        {foodData.feeding.map((phase, i) => (
                            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                                <div className={`bg-gradient-to-r ${phase.color} p-3 flex items-center gap-2`}>
                                    <span className="text-xl">{phase.icon}</span>
                                    <p className="text-sm font-bold text-white">{phase.phase}</p>
                                </div>
                                <div className="p-3 space-y-2">
                                    {phase.foods.map((food, j) => (
                                        <div key={j} className="flex items-start gap-2 py-1.5 border-b border-gray-50 dark:border-gray-800 last:border-0">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold text-gray-800 dark:text-white">{food.item}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">{food.note}</p>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg px-2 py-0.5 font-medium">
                                                    {food.quantity}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    {phase.importantNote && (
                                        <div className="mt-2 bg-amber-50 dark:bg-amber-950/30 rounded-xl p-2.5">
                                            <p className="text-xs text-amber-700 dark:text-amber-400">
                                                💡 {phase.importantNote}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
