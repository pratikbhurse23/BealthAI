import React from "react";
import { motion } from "framer-motion";
import { Flame, Beef, Wheat, Droplets, CakeSlice, Leaf } from "lucide-react";

const nutrients = [
  { key: "calories", label: "Calories", unit: "kcal", icon: Flame, color: "from-red-400 to-orange-400", bg: "bg-red-50", text: "text-red-600" },
  { key: "protein", label: "Protein", unit: "g", icon: Beef, color: "from-blue-400 to-cyan-400", bg: "bg-blue-50", text: "text-blue-600" },
  { key: "carbs", label: "Carbs", unit: "g", icon: Wheat, color: "from-amber-400 to-yellow-400", bg: "bg-amber-50", text: "text-amber-600" },
  { key: "fats", label: "Fats", unit: "g", icon: Droplets, color: "from-purple-400 to-pink-400", bg: "bg-purple-50", text: "text-purple-600" },
  { key: "fiber", label: "Fiber", unit: "g", icon: Leaf, color: "from-green-400 to-emerald-400", bg: "bg-green-50", text: "text-green-600" },
  { key: "sugar", label: "Sugar", unit: "g", icon: CakeSlice, color: "from-pink-400 to-rose-400", bg: "bg-pink-50", text: "text-pink-600" },
];

export default function NutritionCard({ data }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {nutrients.map((n, i) => {
        const Icon = n.icon;
        const value = data[n.key];
        if (value === undefined || value === null) return null;
        return (
          <motion.div
            key={n.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`${n.bg} rounded-2xl p-4 border border-white/50`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${n.color} flex items-center justify-center`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {n.label}
              </span>
            </div>
            <p className={`text-2xl font-bold ${n.text}`}>
              {typeof value === "number" ? value.toFixed(1) : value}
              <span className="text-sm font-normal text-gray-400 ml-1">{n.unit}</span>
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}