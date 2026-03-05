import React from "react";
import { AlertCircle } from "lucide-react";
import { Input } from "../ui/input";

const CONDITIONS = ["Diabetes", "Hypertension", "Heart Disease", "Thyroid Disorder", "PCOD/PCOS", "Kidney Disease"];

export default function MedicalConditionToggle({ medicalCondition, doctorCalories, onChange }) {
  return (
    <div className="border border-orange-200 dark:border-orange-700 rounded-2xl p-4 bg-orange-50/50 dark:bg-orange-900/10">
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="w-4 h-4 text-orange-500" />
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Medical Condition</p>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        {CONDITIONS.map(c => (
          <button key={c} onClick={() => onChange({ medicalCondition: medicalCondition === c ? "" : c })}
            className={`text-xs px-3 py-2 rounded-xl border font-medium transition-all min-h-[44px] text-left ${medicalCondition === c ? "bg-orange-500 border-orange-500 text-white" : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-orange-300 bg-white dark:bg-gray-800"}`}>
            {c}
          </button>
        ))}
      </div>
      {medicalCondition && (
        <div className="mt-3 p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
          <p className="text-xs text-orange-700 dark:text-orange-300 mb-2 font-medium">
            ⚠️ Auto-calorie targets are disabled. Please enter your doctor's recommended daily intake:
          </p>
          <Input
            type="number"
            placeholder="Doctor's calorie target (kcal/day)"
            value={doctorCalories || ""}
            onChange={(e) => onChange({ doctorCalories: e.target.value })}
            className="rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white text-center"
          />
        </div>
      )}
    </div>
  );
}