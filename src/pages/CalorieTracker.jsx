import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PullToRefresh from "../components/PullToRefresh";
import { Activity, Plus, Trash2, Flame, Beef, Wheat, Droplets } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import BottomSheetSelect from "../components/BottomSheetSelect";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Progress } from "../components/ui/progress";
import { calorieStore, analysesStore } from "../components/localStore";
import { calcBMR, calcTDEE, calcCalorieBudget } from "../components/bmr";
import { api } from "../api/client";

const mealColors = {
  breakfast: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  lunch: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  dinner: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  snack: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
};

export default function CalorieTracker() {
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ food_name: "", calories: "", protein: "", carbs: "", fats: "", meal_type: "snack", quantity: "100", unit: "g", base_calories: "", base_protein: "", base_carbs: "", base_fats: "" });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [logs, setLogs] = useState([]);
  const [recentAnalyses, setRecentAnalyses] = useState([]);

  useEffect(() => {
    setLogs(calorieStore.listByDate(selectedDate));
    setRecentAnalyses(analysesStore.list().slice(0, 6));
  }, [selectedDate]);

  useEffect(() => {
    api.auth.me().then(me =>
      api.entities.UserProfile.filter({ created_by: me.email }).then(profiles => {
        if (profiles.length > 0) {
          const p = profiles[0];
          if (p.doctor_calories) {
            setDailyGoal(p.doctor_calories);
          } else {
            const bmr = calcBMR(p.weight_kg, p.height_cm, p.age, p.gender);
            const tdee = calcTDEE(bmr, p.activity_level);
            setDailyGoal(calcCalorieBudget(tdee, p.weight_kg, p.goal_weight_kg || null));
          }
        }
      })
    ).catch(() => { });
  }, []);

  const totalCalories = logs.reduce((sum, l) => sum + (l.calories || 0), 0);
  const totalProtein = logs.reduce((sum, l) => sum + (l.protein || 0), 0);
  const totalCarbs = logs.reduce((sum, l) => sum + (l.carbs || 0), 0);
  const totalFats = logs.reduce((sum, l) => sum + (l.fats || 0), 0);
  const progress = Math.min((totalCalories / dailyGoal) * 100, 100);

  const grouped = logs.reduce((acc, log) => {
    const meal = log.meal_type || "snack";
    if (!acc[meal]) acc[meal] = [];
    acc[meal].push(log);
    return acc;
  }, {});

  const handleQuantityChange = (qty) => {
    const q = parseFloat(qty) || 0;
    if (form.base_calories !== "") {
      const ratio = q / 100;
      setForm((f) => ({
        ...f,
        quantity: qty,
        calories: (parseFloat(f.base_calories) * ratio).toFixed(1),
        protein: (parseFloat(f.base_protein) * ratio).toFixed(1),
        carbs: (parseFloat(f.base_carbs) * ratio).toFixed(1),
        fats: (parseFloat(f.base_fats) * ratio).toFixed(1),
      }));
    } else {
      setForm((f) => ({ ...f, quantity: qty }));
    }
  };

  const handleAdd = () => {
    if (!form.food_name || !form.calories) return;
    calorieStore.add({
      food_name: form.food_name,
      calories: parseFloat(form.calories) || 0,
      protein: parseFloat(form.protein) || 0,
      carbs: parseFloat(form.carbs) || 0,
      fats: parseFloat(form.fats) || 0,
      meal_type: form.meal_type,
      quantity: parseFloat(form.quantity) || null,
      unit: form.unit,
      log_date: selectedDate,
    });
    setForm({ food_name: "", calories: "", protein: "", carbs: "", fats: "", meal_type: "snack", quantity: "100", unit: "g", base_calories: "", base_protein: "", base_carbs: "", base_fats: "" });
    setShowAdd(false);
    setLogs(calorieStore.listByDate(selectedDate));
  };

  const handleDelete = (id) => {
    calorieStore.delete(id);
    setLogs(calorieStore.listByDate(selectedDate));
  };

  const quickAdd = (analysis) => {
    setForm({
      food_name: analysis.food_name,
      base_calories: String(analysis.calories || ""),
      base_protein: String(analysis.protein || ""),
      base_carbs: String(analysis.carbs || ""),
      base_fats: String(analysis.fats || ""),
      calories: String(analysis.calories || ""),
      protein: String(analysis.protein || ""),
      carbs: String(analysis.carbs || ""),
      fats: String(analysis.fats || ""),
      meal_type: "snack",
      quantity: "100",
      unit: "g",
    });
    setShowAdd(true);
  };

  return (
    <PullToRefresh onRefresh={() => setLogs(calorieStore.listByDate(selectedDate))}>
      <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-amber-50/50 dark:bg-gray-950 dark:from-gray-950 dark:via-gray-950 dark:to-gray-950">
        <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calorie Tracker</h1>
                <p className="text-xs text-gray-400">Daily goal: {dailyGoal} kcal</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="rounded-xl border-gray-200 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
              <Button onClick={() => setShowAdd(true)} className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white min-h-[44px]">
                <Plus className="w-4 h-4 mr-1" />Add
              </Button>
            </div>
          </div>

          {/* Summary */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Calories Consumed</span>
              <span className="text-sm text-gray-400">{totalCalories} / {dailyGoal} kcal</span>
            </div>
            <Progress value={progress} className="h-3 rounded-full mb-1" />
            <p className="text-xs text-gray-400 text-right">{Math.max(0, dailyGoal - totalCalories)} kcal remaining</p>

            {totalCalories > 0 && (
              <div className="mt-4 bg-orange-50 dark:bg-orange-900/20 rounded-2xl px-4 py-3 text-xs text-orange-700 dark:text-orange-300">
                <p className="font-semibold mb-1">🔥 Burn today's {totalCalories} kcal by:</p>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5">
                  <span>🚶 Walking ~{Math.round(totalCalories / 4)} min</span>
                  <span>🏃 Running ~{Math.round(totalCalories / 10)} min</span>
                  <span>🚴 Cycling ~{Math.round(totalCalories / 8)} min</span>
                  <span>🏊 Swimming ~{Math.round(totalCalories / 9)} min</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 mt-5">
              {[
                { label: "Protein", value: totalProtein, unit: "g", icon: Beef, color: "text-blue-500" },
                { label: "Carbs", value: totalCarbs, unit: "g", icon: Wheat, color: "text-amber-500" },
                { label: "Fats", value: totalFats, unit: "g", icon: Droplets, color: "text-purple-500" },
              ].map((n) => {
                const Icon = n.icon;
                return (
                  <div key={n.label} className="text-center bg-gray-50 dark:bg-gray-800 rounded-2xl p-3">
                    <Icon className={`w-5 h-5 ${n.color} mx-auto mb-1`} />
                    <p className="text-lg font-bold text-gray-800 dark:text-white">{n.value.toFixed(1)}<span className="text-xs text-gray-400 font-normal">{n.unit}</span></p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{n.label}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Meal Groups */}
          {logs.length === 0 ? (
            <div className="text-center py-16">
              <Flame className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-gray-400">No food logged for this day</p>
              <Button onClick={() => setShowAdd(true)} variant="outline" className="mt-4 rounded-xl border-amber-300 text-amber-600 min-h-[44px]">
                <Plus className="w-4 h-4 mr-1" /> Log Food
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {["breakfast", "lunch", "dinner", "snack"].map((meal) => {
                const items = grouped[meal];
                if (!items?.length) return null;
                return (
                  <div key={meal} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between px-5 py-3 border-b border-gray-50 dark:border-gray-800">
                      <span className={`text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${mealColors[meal]}`}>{meal}</span>
                      <span className="text-xs text-gray-400">{items.reduce((s, i) => s + (i.calories || 0), 0)} kcal</span>
                    </div>
                    <div className="divide-y divide-gray-50 dark:divide-gray-800">
                      {items.map((log) => (
                        <div key={log.id} className="flex items-center justify-between px-5 py-3 min-h-[44px]">
                          <div>
                            <p className="text-sm font-medium text-gray-800 dark:text-white">{log.food_name}{log.quantity ? <span className="text-gray-400 font-normal text-xs ml-1">({log.quantity}{log.unit || "g"})</span> : ""}</p>
                            <p className="text-xs text-gray-400">P: {log.protein || 0}g · C: {log.carbs || 0}g · F: {log.fats || 0}g</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{log.calories} kcal</span>
                            <button onClick={() => handleDelete(log.id)} className="text-gray-300 hover:text-red-400 transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Add */}
          {recentAnalyses.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Quick Add from Recent Scans</h3>
              <div className="flex flex-wrap gap-2">
                {recentAnalyses.map((a) => (
                  <button key={a.id} onClick={() => quickAdd(a)} className="text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:border-amber-300 hover:text-amber-700 transition-all min-h-[44px]">
                    {a.food_name} · {a.calories} kcal
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Add Food Dialog */}
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogContent className="rounded-2xl max-w-sm dark:bg-gray-900 dark:border-gray-800">
            <DialogHeader>
              <DialogTitle className="dark:text-white">Log Food</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <Input placeholder="Food name *" value={form.food_name} onChange={(e) => setForm({ ...form, food_name: e.target.value })} className="rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
              <BottomSheetSelect
                title="Meal Type"
                value={form.meal_type}
                onValueChange={(v) => setForm({ ...form, meal_type: v })}
                triggerClassName="w-full rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                options={[
                  { value: "breakfast", label: "Breakfast" },
                  { value: "lunch", label: "Lunch" },
                  { value: "dinner", label: "Dinner" },
                  { value: "snack", label: "Snack" },
                ]}
              />
              <div className="flex gap-2">
                <Input placeholder="Quantity" type="number" value={form.quantity} onChange={(e) => handleQuantityChange(e.target.value)} className="rounded-xl flex-1 dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
                <BottomSheetSelect
                  title="Unit"
                  value={form.unit}
                  onValueChange={(v) => setForm({ ...form, unit: v })}
                  triggerClassName="w-24 rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  options={[
                    { value: "g", label: "g" },
                    { value: "ml", label: "ml" },
                    { value: "serving", label: "serving" },
                    { value: "piece", label: "piece" },
                    { value: "cup", label: "cup" },
                    { value: "tbsp", label: "tbsp" },
                  ]}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Calories *" type="number" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} className="rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
                <Input placeholder="Protein (g)" type="number" value={form.protein} onChange={(e) => setForm({ ...form, protein: e.target.value })} className="rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
                <Input placeholder="Carbs (g)" type="number" value={form.carbs} onChange={(e) => setForm({ ...form, carbs: e.target.value })} className="rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
                <Input placeholder="Fats (g)" type="number" value={form.fats} onChange={(e) => setForm({ ...form, fats: e.target.value })} className="rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
              </div>
              {form.calories && parseFloat(form.calories) > 0 && (
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl px-3 py-2 text-xs text-orange-700 dark:text-orange-300 space-y-0.5">
                  <p className="font-semibold">🔥 To burn {parseFloat(form.calories).toFixed(0)} kcal:</p>
                  <p>Walking ~{Math.round(parseFloat(form.calories) / 4)} min · Running ~{Math.round(parseFloat(form.calories) / 10)} min · Cycling ~{Math.round(parseFloat(form.calories) / 8)} min</p>
                </div>
              )}
              <Button onClick={handleAdd} disabled={!form.food_name || !form.calories} className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white min-h-[44px]">
                Log Food
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PullToRefresh>
  );
}