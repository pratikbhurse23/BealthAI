import React from "react";
import { ShieldCheck, ShieldAlert, AlertTriangle } from "lucide-react";

const config = {
  healthy: {
    icon: ShieldCheck,
    label: "Healthy Choice",
    bg: "bg-gradient-to-r from-green-500 to-emerald-500",
    glow: "shadow-green-200/50",
  },
  moderate: {
    icon: AlertTriangle,
    label: "Eat in Moderation",
    bg: "bg-gradient-to-r from-amber-500 to-orange-500",
    glow: "shadow-amber-200/50",
  },
  unhealthy: {
    icon: ShieldAlert,
    label: "Health Warning",
    bg: "bg-gradient-to-r from-red-500 to-rose-500",
    glow: "shadow-red-200/50",
  },
};

export default function HealthBadge({ category }) {
  const c = config[category] || config.moderate;
  const Icon = c.icon;

  return (
    <div className={`inline-flex items-center gap-2 ${c.bg} text-white rounded-full px-4 py-2 text-sm font-semibold shadow-lg ${c.glow}`}>
      <Icon className="w-4 h-4" />
      {c.label}
    </div>
  );
}