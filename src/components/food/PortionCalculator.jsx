import React, { useState } from "react";
import { api } from "../../api/client";
import { Search, Loader2, Scale, AlertTriangle } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import BealthAlert from "./BealthAlert";
import { INDIAN_FOOD_LIBRARY, matchFood } from "../indianFoodLibrary";

export default function PortionCalculator({ onLog }) {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [food, setFood] = useState(null);
  const [grams, setGrams] = useState(100);
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const localSearch = (q) => {
    if (!q.trim()) return [];
    const lower = q.toLowerCase();
    return INDIAN_FOOD_LIBRARY.filter(f => f.food_name.toLowerCase().includes(lower)).slice(0, 6);
  };

  const handleInput = (val) => {
    setQuery(val);
    const local = localSearch(val);
    if (local.length) {
      setResults(local.map(f => ({ food_name: f.food_name, calories: f.calories, protein: f.protein, carbs: f.carbs, fats: f.fats, fiber: f.fiber || 0, sugar: f.sugar || 0, source: "library" })));
      setShowDropdown(true);
    } else {
      setResults([]);
      setShowDropdown(val.length > 2);
    }
  };

  const aiSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setShowDropdown(false);

    const libraryMatch = matchFood(query);
    if (libraryMatch) {
      setFood({ food_name: libraryMatch.food_name, calories: libraryMatch.calories, protein: libraryMatch.protein, carbs: libraryMatch.carbs, fats: libraryMatch.fats, fiber: libraryMatch.fiber || 0, sugar: libraryMatch.sugar || 0 });
      setGrams(100);
      setSearching(false);
      return;
    }

    const result = await api.integrations.Core.InvokeLLM({
      prompt: `Give me nutritional data per 100g for: "${query}". Return accurate data.`,
      response_json_schema: {
        type: "object",
        properties: {
          food_name: { type: "string" },
          calories: { type: "number" },
          protein: { type: "number" },
          carbs: { type: "number" },
          fats: { type: "number" },
          fiber: { type: "number" },
          sugar: { type: "number" },
        }
      }
    });
    setFood(result);
    setGrams(100);
    setSearching(false);
  };

  const selectResult = (item) => {
    setFood(item);
    setQuery(item.food_name);
    setGrams(100);
    setResults([]);
    setShowDropdown(false);
  };

  const ratio = grams / 100;
  const calc = food ? {
    calories: Math.round(food.calories * ratio),
    protein: (food.protein * ratio).toFixed(1),
    carbs: (food.carbs * ratio).toFixed(1),
    fats: (food.fats * ratio).toFixed(1),
    fiber: (food.fiber * ratio).toFixed(1),
    sugar: (food.sugar * ratio).toFixed(1),
  } : null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-5">
        <Scale className="w-5 h-5 text-violet-500" />
        <h2 className="font-bold text-gray-900 dark:text-white text-base">Portion Calculator</h2>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <Input
              placeholder="Search any food (e.g. Chicken, Apple, Dal…)"
              value={query}
              onChange={e => handleInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && aiSearch()}
              className="pl-9 rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
          <Button onClick={aiSearch} disabled={searching} className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white flex-shrink-0">
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </div>

        {showDropdown && results.length > 0 && (
          <div className="absolute z-30 left-0 right-0 top-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
            {results.map(item => (
              <button key={item.food_name} onMouseDown={() => selectResult(item)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-violet-50 dark:hover:bg-violet-900/20 border-b border-gray-50 dark:border-gray-800 last:border-0 text-left">
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">{item.food_name}</p>
                  <p className="text-xs text-gray-400">P: {item.protein}g · C: {item.carbs}g · F: {item.fats}g</p>
                </div>
                <span className="text-sm font-bold text-violet-600">{item.calories} kcal</span>
              </button>
            ))}
            {showDropdown && results.length === 0 && query.length > 2 && (
              <button onMouseDown={aiSearch} className="w-full px-4 py-3 text-sm text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20">
                🤖 Search "{query}" with AI
              </button>
            )}
          </div>
        )}
      </div>

      {food && (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">Weight (grams)</label>
            <div className="flex items-center gap-3">
              <Input type="number" value={grams} min={1} max={2000}
                onChange={e => setGrams(Math.max(1, parseFloat(e.target.value) || 1))}
                className="rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white w-28 text-center text-lg font-bold" />
              <div className="flex gap-2">
                {[50, 100, 150, 200].map(g => (
                  <button key={g} onClick={() => setGrams(g)}
                    className={`text-xs px-2.5 py-1.5 rounded-xl border font-medium min-h-[36px] transition-all ${grams === g ? "border-violet-400 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400" : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400"}`}>
                    {g}g
                  </button>
                ))}
              </div>
            </div>
          </div>

          {calc && (
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="font-bold text-gray-900 dark:text-white text-sm">{food.food_name}</p>
                <span className="text-xs text-gray-400">{grams}g portion</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-white dark:bg-gray-900 rounded-xl p-3 text-center">
                  <p className="text-2xl font-extrabold text-orange-500">{calc.calories}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">kcal</p>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { label: "Protein", value: calc.protein + "g", color: "text-blue-500" },
                    { label: "Carbs", value: calc.carbs + "g", color: "text-amber-500" },
                    { label: "Fats", value: calc.fats + "g", color: "text-purple-500" },
                  ].map(n => (
                    <div key={n.label} className="bg-white dark:bg-gray-900 rounded-xl p-2 text-center">
                      <p className={`text-sm font-bold ${n.color}`}>{n.value}</p>
                      <p className="text-[9px] text-gray-400">{n.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <BealthAlert food={{ ...food, fats: food.fats, sugar: food.sugar }} />

              {onLog && (
                <button onClick={() => onLog({ food_name: food.food_name, calories: calc.calories, protein: parseFloat(calc.protein), carbs: parseFloat(calc.carbs), fats: parseFloat(calc.fats), quantity: grams, unit: "g" })}
                  className="w-full mt-3 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white text-sm font-bold min-h-[44px] transition-all hover:shadow-md">
                  + Log to Calorie Tracker
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {!food && !searching && (
        <div className="text-center py-6 text-gray-300 dark:text-gray-600 text-sm">
          <Scale className="w-10 h-10 mx-auto mb-2 opacity-30" />
          Search a food to calculate portion nutrients
        </div>
      )}
    </div>
  );
}