import React, { useState, useRef } from "react";
import { Search, Loader2, X, Plus } from "lucide-react";
import { Input } from "../ui/input";
import { api } from "../../api/client";
import { INDIAN_FOOD_LIBRARY } from "../indianFoodLibrary";

// Returns local library matches for a query (starts-with first, then includes)
function localMatches(q) {
  if (!q || q.trim().length === 0) return [];
  const lower = q.toLowerCase().trim();
  const lib = INDIAN_FOOD_LIBRARY.map(f => ({
    food_name: f.food_name,
    nationality: "Indian 🇮🇳",
    calories: f.calories,
    protein: f.protein,
    carbs: f.carbs,
    fats: f.fats,
    fiber: f.fiber || 0,
    sugar: f.sugar || 0,
    food_category: f.food_category || "moderate",
    source: "library",
  }));
  const startsWith = lib.filter(f => f.food_name.toLowerCase().startsWith(lower));
  const includes = lib.filter(f => !f.food_name.toLowerCase().startsWith(lower) && f.food_name.toLowerCase().includes(lower));
  return [...startsWith, ...includes].slice(0, 5);
}

function nationalityFlag(nat) {
  if (!nat) return "";
  const n = nat.toLowerCase();
  if (n.includes("indian")) return "🇮🇳";
  if (n.includes("italian")) return "🇮🇹";
  if (n.includes("chinese")) return "🇨🇳";
  if (n.includes("mexican")) return "🇲🇽";
  if (n.includes("american")) return "🇺🇸";
  if (n.includes("japanese")) return "🇯🇵";
  if (n.includes("thai")) return "🇹🇭";
  if (n.includes("french")) return "🇫🇷";
  if (n.includes("greek")) return "🇬🇷";
  if (n.includes("spanish")) return "🇪🇸";
  if (n.includes("korean")) return "🇰🇷";
  if (n.includes("turkish")) return "🇹🇷";
  if (n.includes("global") || n.includes("international")) return "🌍";
  return "🌐";
}

export default function FoodSearch({ onSelect, onDirectAdd }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);   // local instant suggestions
  const [aiResults, setAiResults] = useState([]); // AI results merged in
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const aiDebounce = useRef(null);

  const allResults = React.useMemo(() => {
    // Merge: local first, then AI-only ones (de-dup by name)
    const localNames = new Set(results.map(r => r.food_name.toLowerCase()));
    const aiOnly = aiResults.filter(r => !localNames.has(r.food_name.toLowerCase()));
    return [...results, ...aiOnly];
  }, [results, aiResults]);

  const handleChange = (val) => {
    setQuery(val);
    if (!val.trim()) {
      setResults([]);
      setAiResults([]);
      setOpen(false);
      clearTimeout(aiDebounce.current);
      return;
    }

    // ── Instant local suggestions ──
    const local = localMatches(val);
    setResults(local);
    setOpen(true);

    // ── AI suggestions after 650 ms debounce ──
    clearTimeout(aiDebounce.current);
    aiDebounce.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.integrations.Core.InvokeLLM({
          prompt: `List the top 5 food items whose names start with or contain "${val}". Include both Indian and global foods. For each, return name, nationality/cuisine origin, and macros per 100g.`,
          response_json_schema: {
            type: "object",
            properties: {
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    food_name: { type: "string" },
                    nationality: { type: "string" },
                    calories: { type: "number" },
                    protein: { type: "number" },
                    carbs: { type: "number" },
                    fats: { type: "number" },
                    food_category: { type: "string", enum: ["healthy", "moderate", "unhealthy"] },
                  }
                }
              }
            }
          }
        });
        setAiResults(res?.items || []);
      } catch {
        // AI failed — local results are still shown
      } finally {
        setLoading(false);
      }
    }, 650);
  };

  const select = (item) => {
    onSelect(item);
    setQuery("");
    setResults([]);
    setAiResults([]);
    setOpen(false);
  };

  const directAdd = (e, item) => {
    e.stopPropagation();
    if (onDirectAdd) {
      onDirectAdd(item);
      setQuery("");
      setResults([]);
      setAiResults([]);
      setOpen(false);
    }
  };

  const clear = () => {
    setQuery("");
    setResults([]);
    setAiResults([]);
    setOpen(false);
    clearTimeout(aiDebounce.current);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500 animate-spin pointer-events-none" />
        )}
        {!loading && query && (
          <button onMouseDown={clear} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
        <Input
          placeholder="Type a food name… (e.g. B for Biryani, Dal, Butter Chicken)"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => allResults.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          className="pl-9 rounded-2xl border-gray-200 bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        />
      </div>

      {/* Dropdown */}
      {open && allResults.length > 0 && (
        <div className="absolute z-30 left-0 right-0 top-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
          {allResults.map((food, i) => (
            <button
              key={`${food.food_name}-${i}`}
              onMouseDown={() => select(food)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors text-left border-b border-gray-50 dark:border-gray-800 last:border-0 group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">{food.food_name}</p>
                  {food.nationality && (
                    <span className="inline-flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium flex-shrink-0">
                      {nationalityFlag(food.nationality)} {food.nationality}
                    </span>
                  )}
                  {food.source === "library" && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-medium">local</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  P: {food.protein}g · C: {food.carbs}g · F: {food.fats}g · per 100g
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                <div className="text-right">
                  <p className="text-sm font-bold text-amber-600">{food.calories} kcal</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${food.food_category === "healthy" ? "bg-green-100 text-green-700" :
                      food.food_category === "unhealthy" ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"
                    }`}>
                    {food.food_category || "moderate"}
                  </span>
                </div>
                {onDirectAdd && (
                  <button
                    onMouseDown={(e) => directAdd(e, food)}
                    className="w-8 h-8 rounded-xl bg-amber-500 hover:bg-amber-600 flex items-center justify-center text-white transition-colors flex-shrink-0 shadow-sm"
                    title="Add to calorie tracker"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
            </button>
          ))}

          {/* Loading indicator for AI */}
          {loading && (
            <div className="px-4 py-2.5 flex items-center gap-2 text-xs text-gray-400 border-t border-gray-50 dark:border-gray-800">
              <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
              Loading more suggestions…
            </div>
          )}
        </div>
      )}

      {/* Empty state during AI load with no local results */}
      {open && allResults.length === 0 && loading && (
        <div className="absolute z-30 left-0 right-0 top-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl px-4 py-4 text-sm text-gray-400 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-amber-500" /> Searching…
        </div>
      )}
    </div>
  );
}