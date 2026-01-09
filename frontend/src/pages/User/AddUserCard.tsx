import React from "react";
import { Plus } from "lucide-react";

interface AddInternCardProps {
  type: "interns" | "teams";
  onClick?: () => void;
}

const AddUserCard: React.FC<AddInternCardProps> = ({ type, onClick }) => {
  const label = type === "teams" ? "Member" : "Intern";
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-6 hover:border-[#3AE39E] hover:bg-[#3AE39E]/5 transition-all duration-300 group cursor-pointer h-full min-h-[300px]"
    >
      <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center group-hover:bg-[#3AE39E] group-hover:text-[#102359] text-slate-500 transition-all duration-300 shadow-sm group-hover:rotate-90">
        <Plus size={32} strokeWidth={3} />
      </div>

      <div className="text-center">
        <p className="text-lg font-bold text-slate-700 group-hover:text-[#102359] transition-colors">
          {`Add New ${label}`}
        </p>
        <p className="text-sm font-medium text-slate-400">
          Register a new profile
        </p>
      </div>
    </button>
  );
};

export default AddUserCard;
