import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Heart, Activity } from "lucide-react";

export default function SafetyBanner({ age, conditions = [] }) {
    const isSenior = age >= 60;
    const hasConditions = conditions.length > 0;

    if (!isSenior && !hasConditions) return null;

    const conditionLabels = conditions.map(c => {
        const map = {
            diabetes: "Diabetes",
            heart_disease: "Heart Disease",
            knee_pain: "Knee Pain",
            hypertension: "High BP",
            obesity: "Obesity",
            arthritis: "Arthritis",
        };
        return map[c] || c;
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 mb-4"
        >
            <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-1">
                        {isSenior ? "Senior Safety Guidelines" : "Health Condition Advisory"}
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                        {isSenior && hasConditions
                            ? `Exercises are personalised for age ${age} with ${conditionLabels.join(", ")}. `
                            : isSenior
                                ? `Exercises are personalised for age ${age}. `
                                : `Exercises have been filtered for: ${conditionLabels.join(", ")}. `}
                        Always consult your doctor before starting a new exercise routine. Start slow and stop if you feel discomfort.
                    </p>
                    {hasConditions && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {conditionLabels.map(c => (
                                <span key={c} className="text-xs bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-300 rounded-full px-2 py-0.5 font-medium">
                                    {c}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {isSenior && (
                <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-800 flex gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400">
                        <Heart className="w-3.5 h-3.5" />
                        <span>Stop if chest pain</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400">
                        <Activity className="w-3.5 h-3.5" />
                        <span>Rest between sets</span>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
