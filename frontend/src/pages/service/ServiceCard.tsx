import React from "react";
import { Pencil, Trash2, CheckCircle2 } from "lucide-react";
import type { Service } from "../../types/service";

interface ServiceCardProps {
  service: Service;
  onEdit?: (item: Service) => void;
  onDelete?: (id: string) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onEdit,
  onDelete,
}) => {
  console.log("Card Data for:", service.title, " -> URL:", service.photo_url);
  const displayImage =
    service.photo_url && service.photo_url.trim() !== ""
      ? service.photo_url
      : "https://via.placeholder.com/400x300?text=No+Image";

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-300 relative overflow-hidden h-[580px] w-full">
      <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex gap-2">
        <button
          onClick={() => onEdit?.(service)}
          className="h-9 w-9 rounded-full bg-white/95 backdrop-blur shadow-md flex items-center justify-center text-slate-500 hover:text-[#102359] hover:scale-105 transition-all"
        >
          <Pencil size={18} />
        </button>
        <button
          onClick={() => onDelete?.(service.id)}
          className="h-9 w-9 rounded-full bg-white/95 backdrop-blur shadow-md flex items-center justify-center text-slate-500 hover:text-red-500 hover:scale-105 transition-all"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="h-44 w-full bg-slate-100 relative overflow-hidden border-b border-slate-50 shrink-0">
        <img
          alt={service.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          src={displayImage}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-lg font-bold text-white leading-tight line-clamp-2 break-words">
            {service.title}
          </h3>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1 overflow-hidden">
        {/* Description */}
        <div className="mb-4 shrink-0 min-h-[3rem]">
          <p className="text-slate-500 text-xs leading-[1rem] h-[3rem] line-clamp-3 break-words overflow-hidden">
            {service.description || "No description provided."}
          </p>
        </div>

        <div className="mb-4 shrink-0">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
            Tech Stack
          </p>
          <div className="flex flex-wrap gap-1.5 h-[52px] overflow-hidden content-start">
            {(service.techs || []).map((tech) => (
              <span
                key={tech}
                className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded text-[10px] font-bold text-[#102359] whitespace-nowrap max-w-[120px] truncate"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-4 flex-1 overflow-hidden">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
            Offerings
          </p>
          <ul className="flex flex-col gap-1.5 overflow-hidden">
            {(service.offerings || []).slice(0, 4).map((offering, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-[11px] text-slate-600 min-w-0"
              >
                <CheckCircle2
                  size={12}
                  className="text-[#3AE39E] mt-0.5 shrink-0"
                />
                <span className="line-clamp-1 break-words">{offering}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pricing */}
        <div className="pt-4 border-t border-slate-100 shrink-0 mt-auto">
          <div className="flex items-center justify-between mb-3 bg-[#F8FAFC] p-3 rounded-xl border border-slate-200/60">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">
                Base Price
              </span>
              <span className="text-xs text-slate-400 line-through">
                 रु{(service.base_price || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[9px] font-bold text-[#3AE39E] uppercase tracking-tight">
                Effective
              </span>
              <span className="text-lg font-black text-[#102359]">
                 रु{(service.effective_price || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
