import React from "react";
import BealthAlert from "./BealthAlert";
import PortionCalculator from "./PortionCalculator";
import { motion } from "framer-motion";
import { Card } from "../ui/card";
import { Utensils, Lightbulb } from "lucide-react";
import NutritionCard from "./NutritionCard";
import VitaminsPanel from "./VitaminsPanel";
import ExerciseRecommendations from "./ExerciseRecommendations";
import HealthBadge from "./HealthBadge";
import HealthBenefits from "./HealthBenefits";

export default function AnalysisResult({ analysis, showPortionCalculator = true }) {
  if (!analysis) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-200/50">
            <Utensils className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{analysis.food_name}</h2>
            {analysis.serving_size && (
              <p className="text-sm text-gray-500">Serving: {analysis.serving_size}</p>
            )}
          </div>
        </div>
        <HealthBadge category={analysis.food_category} />
      </div>

      {/* Nutrition Grid */}
      <NutritionCard data={analysis} />

      {/* Vitamins */}
      <VitaminsPanel vitaminsJson={analysis.vitamins} />

      {/* Health Benefits */}
      <HealthBenefits benefitsJson={analysis.health_benefits} foodCategory={analysis.food_category} />

      {/* Health Warning */}
      {analysis.health_warning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-5"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Lightbulb className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <h3 className="font-semibold text-red-800 mb-1">Health Advisory</h3>
              <p className="text-sm text-red-700 leading-relaxed">{analysis.health_warning}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Exercises */}
      {analysis.food_category !== "healthy" && analysis.exercises && (
        <ExerciseRecommendations exercisesJson={analysis.exercises} calories={analysis.calories} />
      )}

      {/* Portion Calculator (optional) */}
      {showPortionCalculator && <PortionCalculator food={analysis} />}

      {/* Bealth Alert */}
      <BealthAlert food={analysis} />

      {/* Healthier Alternatives */}
      {analysis.healthier_alternatives && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gradient-to-br from-sky-50 to-indigo-50 border border-sky-200 rounded-2xl p-5"
        >
          <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <span className="text-lg">💡</span> Healthier Alternatives
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">{analysis.healthier_alternatives}</p>
        </motion.div>
      )}
    </motion.div>
  );
}