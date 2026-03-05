import React from "react";
import { format } from "date-fns";
import { Flame, Beef, Wheat } from "lucide-react";
import HealthBadge from "./HealthBadge";

export default function HistoryCard({ item, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-lg hover:shadow-amber-100/30 transition-all duration-300 cursor-pointer group"
    >
      <div className="flex gap-4">
        {item.image_url && (
          <img
            src={item.image_url}
            alt={item.food_name}
            className="w-20 h-20 rounded-xl object-cover flex-shrink-0 group-hover:scale-105 transition-transform"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 truncate">{item.food_name}</h3>
            <HealthBadge category={item.food_category} />
          </div>
          <div className="flex items-center gap-4 mt-2">
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Flame className="w-3 h-3 text-red-400" />
              {item.calories} kcal
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Beef className="w-3 h-3 text-blue-400" />
              {item.protein}g protein
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Wheat className="w-3 h-3 text-amber-400" />
              {item.carbs}g carbs
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            {item.created_date ? format(new Date(item.created_date), "MMM d, yyyy · h:mm a") : ""}
          </p>
        </div>
      </div>
    </div>
  );
}