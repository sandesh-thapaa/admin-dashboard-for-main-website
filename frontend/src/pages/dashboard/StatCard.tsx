import React from "react";
import type { StatData } from "../../types/dashboard";

const StatCard: React.FC<StatData> = ({ label, value, icon, trend }) => {
  const getTrendStyles = () => {
    switch (trend?.type) {
      case "success":
        return "text-emerald-600 bg-emerald-50";
      case "warning":
        return "text-amber-600 bg-amber-50";
      case "neutral":
      default:
        return "text-slate-500 bg-slate-50";
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4 group hover:-translate-y-1 transition-all duration-300">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <p className="text-slate-500 text-sm font-medium">{label}</p>
          <h3 className="text-[#102359] text-3xl font-bold tracking-tight">
            {value}
          </h3>
        </div>

        <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center text-[#102359] group-hover:bg-[#3AE39E] group-hover:text-[#081E67] transition-all duration-300">
          {icon}
        </div>
      </div>

      {trend && (
        <div
          className={`flex items-center gap-1.5 text-xs font-bold w-fit px-2.5 py-1 rounded-lg transition-colors ${getTrendStyles()}`}
        >
          {trend.icon && (
            <span className="flex items-center justify-center">
              {trend.icon}
            </span>
          )}
          <span>{trend.text}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;