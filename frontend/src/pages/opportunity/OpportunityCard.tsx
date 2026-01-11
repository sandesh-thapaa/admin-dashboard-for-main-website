import React from "react";
import { Pencil, Trash2, Clock, Banknote, MapPin, Plus } from "lucide-react";
import type { Opportunity } from "../../types/opportunity";

interface OpportunityCardProps {
  opportunity: Opportunity;
  onEdit?: (item: Opportunity) => void;
  onDelete?: (id: string) => void;
}

const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  onEdit,
  onDelete,
}) => {
  console.log(opportunity);
  const accentColor = "#3AE39E";

  return (
    <div className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] hover:-translate-y-2 transition-all duration-300 flex flex-col h-full relative overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-[#102359] leading-tight break-words line-clamp-2 group-hover:text-[#3AE39E] transition-colors">
            {opportunity.title}
          </h3>
        </div>
        <div className="flex gap-1 shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit?.(opportunity)}
            className="p-2 text-slate-400 hover:text-[#3AE39E] hover:bg-[#3AE39E]/10 rounded-lg transition-colors"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={() => onDelete?.(opportunity.id)}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <p className="text-sm text-slate-500 mb-5 line-clamp-3 break-words">
        {opportunity.description || "No description provided."}
      </p>

      <div className="space-y-3 mb-5 pb-5 border-b border-slate-100 border-dashed">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-hidden">
            <Clock
              size={16}
              className="shrink-0"
              style={{ color: accentColor }}
            />
            <span className="text-sm font-semibold text-slate-700 truncate">
              {opportunity.type === "INTERNSHIP"
                ? `${opportunity.internship_details?.duration_months} Months`
                : opportunity.job_details?.employment_type || "N/A"}
            </span>
          </div>
          <div className="flex items-center gap-2 overflow-hidden">
            <Banknote
              size={16}
              className="shrink-0"
              style={{ color: accentColor }}
            />
            <span className="text-sm font-semibold text-slate-700 truncate">
              रु{opportunity.type === "INTERNSHIP"
                ? opportunity.internship_details?.stipend
                : opportunity.job_details?.salary_range || "N/A"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-hidden">
          <MapPin
            size={16}
            className="shrink-0"
            style={{ color: accentColor }}
          />
          <span className="text-sm font-semibold text-slate-700 truncate">
            {opportunity.location || "Remote"}
          </span>
        </div>
      </div>

      <div className="mt-auto">
        <h4 className="text-[10px] font-black uppercase text-slate-300 mb-2 tracking-widest">
          Requirements
        </h4>
        <ul className="text-sm text-slate-500 space-y-1.5">
          {opportunity.requirements.slice(0, 3).map((req, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3AE39E] mt-1.5 shrink-0"></span>
              <span className="line-clamp-1">{req}</span>
            </li>
          ))}
          {opportunity.requirements.length > 3 && (
            <li className="text-xs font-bold text-slate-400 pl-3.5">
              +{opportunity.requirements.length - 3} more
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export const CreateCard: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl p-6 border-2 border-slate-100 border-dashed hover:border-[#3AE39E] hover:bg-[#3AE39E]/5 transition-all duration-300 flex flex-col items-center justify-center h-full min-h-[350px] cursor-pointer"
    >
      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-[#3AE39E] mb-3 group-hover:scale-110 group-hover:bg-[#3AE39E] group-hover:text-white transition-all duration-300">
        <Plus size={32} strokeWidth={3} />
      </div>
      <h3 className="text-lg font-bold text-[#102359]">Create New Listing</h3>
      <p className="text-sm text-slate-400 text-center mt-1 max-w-[200px]">
        Add a new opening to the platform.
      </p>
    </div>
  );
};

export default OpportunityCard;
