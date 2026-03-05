import React from "react";
import { motion } from "framer-motion";
import { Badge } from "../ui/badge";
import { Pill } from "lucide-react";

export default function VitaminsPanel({ vitaminsJson }) {
  let vitamins = [];
  if (typeof vitaminsJson === "string") {
    try { vitamins = JSON.parse(vitaminsJson); } catch { vitamins = []; }
  } else if (Array.isArray(vitaminsJson)) {
    vitamins = vitaminsJson;
  }

  if (!vitamins.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
          <Pill className="w-4 h-4 text-white" />
        </div>
        <h3 className="font-semibold text-gray-800">Vitamins & Minerals</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {vitamins.map((v, i) => (
          <Badge
            key={i}
            variant="secondary"
            className="bg-white/80 text-emerald-700 border border-emerald-200 rounded-full px-3 py-1.5 text-xs font-medium"
          >
            {typeof v === "object" ? `${v.name}: ${v.amount}` : v}
          </Badge>
        ))}
      </div>
    </motion.div>
  );
}