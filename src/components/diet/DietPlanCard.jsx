import React from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Bell, BellOff, Trash2, Clock } from "lucide-react";

export default function DietPlanCard({ plan, onToggleNotifications, onDelete }) {
  let meals = [];
  try { meals = JSON.parse(plan.meal_schedule || "[]"); } catch { meals = []; }
  let times = [];
  try { times = JSON.parse(plan.notification_times || "[]"); } catch { times = []; }

  return (
    <Card className="rounded-2xl border border-gray-100 overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-bold text-lg text-gray-900">{plan.plan_name}</h3>
            <p className="text-sm text-gray-500">
              Target: {plan.daily_calorie_goal} kcal/day
            </p>
          </div>
          <div className="flex items-center gap-2">
            {plan.is_active && (
              <Badge className="bg-green-100 text-green-700 border-green-200 rounded-full">Active</Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggleNotifications(plan)}
              className="h-8 w-8"
            >
              {plan.notifications_enabled ? (
                <Bell className="w-4 h-4 text-amber-500" />
              ) : (
                <BellOff className="w-4 h-4 text-gray-400" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(plan)}
              className="h-8 w-8 hover:text-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {meals.length > 0 && (
          <div className="space-y-2 mt-4">
            {meals.map((meal, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-white text-xs font-bold">
                  {meal.time_label?.[0] || (i + 1)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">
                    {meal.time_label || `Meal ${i + 1}`}
                  </p>
                  <p className="text-xs text-gray-500">{meal.suggestion || meal.foods}</p>
                </div>
                {meal.calories && (
                  <span className="text-xs text-gray-400">{meal.calories} kcal</span>
                )}
              </div>
            ))}
          </div>
        )}

        {times.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {times.map((t, i) => (
              <span key={i} className="flex items-center gap-1 text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2.5 py-1">
                <Clock className="w-3 h-3" />
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}