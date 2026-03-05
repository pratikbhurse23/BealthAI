import React, { useState, useRef } from "react";
import { Search, Loader2, X } from "lucide-react";
import { Input } from "../ui/input";
import { api } from "../../api/client";

export default function FoodSearch({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounce = useRef(null);

  const search = (q) => {
    setQuery(q);
    if (!q.trim()) { setResults([]); setOpen(false); return; }
    clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      setLoading(true);
      setOpen(true);
      const res = await api.integrations.Core.InvokeLLM({
        prompt: `Give me nutrition info for "${q}". Return top 4 results with name, calories, protein, carbs, fats per 100g. Include both Indian and global foods if relevant.`,
        response_json_schema: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  food_name: { type: "string" },
                  calories: { type: "number" },
                  protein: { type: "number" },
                  carbs: { type: "number" },
                  fats: { type: "number" },
                  sugar: { type: "number" },
                  fiber: { type: "number" },
                  food_category: { type: "string", enum: ["healthy", "moderate", "unhealthy"] }
                }
              }
            }
          }
        }
      });
      setResults(res?.items || []);
      setLoading(false);
    }, 600);
  };

  const select = (item) => {
    onSelect(item);
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500 animate-spin pointer-events-none" />}
        {!loading && query && (
          <button onMouseDown={() => { setQuery(""); setResults([]); setOpen(false); }} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
        <Input
          placeholder="Search any food globally (e.g. Chicken Biryani, Oats…)"
          value={query}
          onChange={(e) => search(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          className="pl-9 rounded-2xl border-gray-200 bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        />
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-30 left-0 right-0 top-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
          {results.map((food, i) => (
            <button
              key={i}
              onMouseDown={() => select(food)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors text-left border-b border-gray-50 dark:border-gray-800 last:border-0"
            >
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-white">{food.food_name}</p>
                <p className="text-xs text-gray-400">P: {food.protein}g · C: {food.carbs}g · F: {food.fats}g · per 100g</p>
              </div>
              <div className="text-right flex-shrink-0 ml-3">
                <p className="text-sm font-bold text-amber-600">{food.calories} kcal</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${food.food_category === "healthy" ? "bg-green-100 text-green-700" : food.food_category === "unhealthy" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {food.food_category}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
      {open && loading && (
        <div className="absolute z-30 left-0 right-0 top-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl px-4 py-4 text-sm text-gray-400 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-amber-500" /> Searching nutrition database…
        </div>
      )}
    </div>
  );
}