import React, { useState, useEffect } from "react";
import { api } from "../api/client";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import { Loader2, Salad, Sparkles } from "lucide-react";
import DietPlanCard from "../components/diet/DietPlanCard";
import { dietStore, analysesStore } from "../components/localStore";

export default function DietPlan() {
  const [generating, setGenerating] = useState(false);
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    setPlans(dietStore.list());
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    const recentAnalyses = analysesStore.list().slice(0, 10);
    const foodList = recentAnalyses.length
      ? recentAnalyses.map((a) => `${a.food_name} (${a.calories} kcal, ${a.food_category})`).join(", ")
      : "No recent data";

    const result = await api.integrations.Core.InvokeLLM({
      prompt: `You are a certified nutritionist. Generate a personalized daily diet plan.
Recent foods eaten: ${foodList}
Include 5-6 balanced meals. Focus on healthy nutrition.`,
      response_json_schema: {
        type: "object",
        properties: {
          plan_name: { type: "string" },
          daily_calorie_goal: { type: "number" },
          meals: { type: "array", items: { type: "object", properties: { time_label: { type: "string" }, suggestion: { type: "string" }, calories: { type: "number" } } } },
          notification_times: { type: "array", items: { type: "string" } }
        }
      }
    });

    dietStore.add({
      plan_name: result.plan_name || "My Diet Plan",
      daily_calorie_goal: result.daily_calorie_goal || 2000,
      meal_schedule: JSON.stringify(result.meals || []),
      is_active: true,
      notifications_enabled: true,
      notification_times: JSON.stringify(result.notification_times || []),
    });

    setPlans(dietStore.list());
    setGenerating(false);
  };

  const toggleNotifications = (plan) => {
    dietStore.update(plan.id, { notifications_enabled: !plan.notifications_enabled });
    setPlans(dietStore.list());
  };

  const deletePlan = (plan) => {
    dietStore.delete(plan.id);
    setPlans(dietStore.list());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-amber-50/50">
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
              <Salad className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Diet Plans</h1>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-200/50"
          >
            {generating ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-2" />Generate AI Plan</>
            )}
          </Button>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          AI generates personalized diet plans based on your recent food scans.
        </p>

        {plans.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <Salad className="w-10 h-10 text-green-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-400 mb-2">No Plans Yet</h3>
            <p className="text-gray-300 text-sm mb-6">Generate your first AI-powered diet plan</p>
            <Button onClick={handleGenerate} disabled={generating} className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white">
              <Sparkles className="w-4 h-4 mr-2" />Create My First Plan
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {plans.map((plan) => (
              <motion.div key={plan.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <DietPlanCard plan={plan} onToggleNotifications={toggleNotifications} onDelete={deletePlan} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}