import React from "react";
import type { Mentor } from "../../types/mentor";
import { Pencil, Trash2 } from "lucide-react";

interface MentorCardProps {
  mentor: Mentor;
  onEdit?: (mentor: Mentor) => void;
  onDelete?: (id: string) => void;
}

const MentorCard: React.FC<MentorCardProps> = ({
  mentor,
  onEdit,
  onDelete,
}) => {
  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
  ) => {
    e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${mentor.name}`;
  };

  return (
    <div className="group bg-white rounded-2xl p-6 flex flex-col items-center text-center shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_-6px_rgba(0,0,0,0.1)] border border-transparent hover:border-slate-100 transition-all duration-300 relative overflow-hidden h-full">
      <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
        <button
          onClick={() => onEdit?.(mentor)}
          className="p-1.5 rounded-full bg-slate-50 text-slate-500 hover:text-primary hover:bg-primary/10 transition-colors"
          title="Edit"
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={() => onDelete?.(mentor.id)}
          className="p-1.5 rounded-full bg-slate-50 text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="w-24 h-24 rounded-full bg-slate-100 mb-4 overflow-hidden border-2 border-slate-50 group-hover:border-primary/30 transition-colors shrink-0">
        <img
          alt={`Portrait of ${mentor.name}`}
          className="w-full h-full object-cover"
          src={
            mentor.photo_url ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${mentor.name}`
          }
          onError={handleImageError}
        />
      </div>

      <div className="w-full min-w-0">
        <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-sidebar-bg transition-colors break-words line-clamp-2 px-2">
          {mentor.name}
        </h3>
        <p
          className="text-sm font-semibold text-[#3AE39E] mb-2 truncate px-2"
          title={mentor.specialization}
        >
          {mentor.specialization || "Mentor"}
        </p>
      </div>
    </div>
  );
};

export default MentorCard;
