import React from "react";
import { Pencil } from "lucide-react";
import type { User } from "../../types/user";

interface UserCardProps {
  user: User;
  onToggleVisibility: (id: string) => void;
  // onDelete: () => void;
  onEdit?: () => void;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  onToggleVisibility,
  // onDelete,
  onEdit,
}) => {
  const isHidden = !user.is_visible;

  return (
    <div className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative flex flex-col h-full">
      <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          title="Edit Intern"
          className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-[#3AE39E] hover:bg-slate-50 transition-colors"
        >
          <Pencil size={16} />
        </button>
        {/* <button
          title="Delete Intern"
          // onClick={onDelete}
          className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2 size={16} />
        </button> */}
      </div>

      <div className="flex flex-col items-center text-center mt-2 flex-1">
        <div
          className={`w-24 h-24 rounded-full p-1 bg-gradient-to-tr shrink-0 ${
            isHidden
              ? "from-slate-200 to-slate-100"
              : "from-[#3AE39E]/30 to-blue-400/30"
          } mb-4`}
        >
          <img
            src={
              user.photo_url ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user.name
              )}&background=random`
            }
            alt={user.name}
            className={`w-full h-full rounded-full object-cover border-4 border-white transition-all duration-300 ${
              isHidden ? "grayscale opacity-60" : ""
            }`}
          />
        </div>

        <h3 className="text-lg font-bold text-[#102359] leading-tight w-full truncate px-2">
          {user.name}
        </h3>

        <p
          className={`text-sm font-semibold mb-1 w-full truncate px-2 ${
            isHidden ? "text-slate-500" : "text-[#3AE39E]"
          }`}
        >
          {user.position}
        </p>

        <p className="text-xs font-medium text-slate-400 mb-6 w-full truncate px-2">
          {user.contact_email}
        </p>

        <div className="w-full pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
          <span
            className={`text-[10px] font-bold uppercase tracking-widest ${
              isHidden ? "text-slate-400" : "text-slate-500"
            }`}
          >
            {isHidden ? "Hidden" : "Visible"}
          </span>
          <button
            onClick={() => onToggleVisibility(user.id)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#3AE39E] focus:ring-offset-1 ${
              user.is_visible ? "bg-[#3AE39E]" : "bg-slate-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                user.is_visible ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
