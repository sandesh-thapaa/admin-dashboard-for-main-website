import React from "react";
import type { User } from "../../types/user";
import { ArrowRight, UserX } from "lucide-react";
import { Link } from "react-router-dom";

interface InternTableProps {
  interns: User[];
  onToggleVisibility: (id: string) => void;
  onDelete: (id: string, name: string) => void;
}

const InternTable: React.FC<InternTableProps> = ({
  interns,
  onToggleVisibility,
  // onDelete,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-slate-50 flex items-center justify-between">
        <h3 className="text-[#102359] text-lg font-bold">Recent Interns</h3>
        <Link
          to="/dashboard/interns"
          className="text-blue-600 text-sm font-semibold hover:text-blue-700 flex items-center gap-1 transition-colors"
        >
          View All <ArrowRight size={16} />
        </Link>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        {interns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <UserX size={40} className="mb-2 opacity-20" />
            <p className="text-sm font-medium">No interns found</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Intern Name
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {interns.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-slate-50/30 transition-colors group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          user.photo_url ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`
                        }
                        alt={user.name}
                        className="h-10 w-10 rounded-full border border-slate-100 object-cover"
                      />
                      <div className="flex flex-col">
                        <span className="text-[#102359] text-sm font-bold">
                          {user.name}
                        </span>
                        <span className="text-slate-400 text-xs lowercase">
                          {user.contact_email}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold border border-blue-100 bg-blue-50 text-blue-600 uppercase tracking-tight">
                      {user.position}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-4">
                      <button
                        onClick={() => onToggleVisibility(user.id)}
                        className={`relative inline-flex h-5 w-10 items-center rounded-full transition-all duration-200 focus:outline-none ${
                          user.is_visible ? "bg-[#3AE39E]" : "bg-slate-200"
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition duration-200 ease-in-out ${
                            user.is_visible ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default InternTable;
