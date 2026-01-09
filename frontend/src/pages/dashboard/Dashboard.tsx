import React, { useState } from "react";
import StatCard from "./StatCard";
import InternTable from "./InternTable";
import DeleteConfirmModal from "../DeleteConfirmModal";
import type { StatData } from "../../types/dashboard";
import type { User } from "../../types/user";
import {
  Users,
  Briefcase,
  Search,
  Bell,
  ChevronRight,
  Plus,
  CheckCircle,
  AlertCircle,
  GraduationCap,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

const Dashboard: React.FC = () => {
  const [interns, setInterns] = useState<User[]>([
    {
      id: "1",
      name: "Aman Gupta",
      position: "Frontend Developer",
      photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aman",
      contact_email: "aman@leafclutch.com",
      personal_email: "aman.dev@gmail.com",
      contact_number: "+91 98765 43210",
      is_visible: true,
      start_date: "2025-12-01",
      end_date: "2026-06-01",
      role: "INTERN",
      social_media: {
        linkedin: "https://linkedin.com/in/aman",
        github: "https://github.com/aman",
        twitter: "https://twitter.com/aman",
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "2",
      name: "Sanya Malhotra",
      position: "UI/UX Designer",
      photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sanya",
      contact_email: "sanya@leafclutch.com",
      personal_email: "sanya.design@gmail.com",
      contact_number: "+91 98221 12233",
      is_visible: true,
      start_date: "2026-01-02",
      end_date: null,
      role: "INTERN",
      social_media: {
        linkedin: "https://linkedin.com/in/sanya",
        github: "https://github.com/sanya",
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "3",
      name: "Rahul Verma",
      position: "Backend Intern",
      photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul",
      contact_email: "rahul@leafclutch.com",
      personal_email: "rahul.v@outlook.com",
      contact_number: "+91 77665 54433",
      is_visible: false,
      role: "INTERN",
      start_date: "2025-11-15",
      end_date: "2026-02-15",
      social_media: { github: "https://github.com/rahul" },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);

  // Delete States
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<string>("");

  const stats: StatData[] = [
    {
      label: "Total Interns",
      value: "1,240",
      icon: <Users size={22} className="text-blue-600" />,
      trend: { text: "24 Joined this week", type: "neutral" },
    },
    {
      label: "Training Completion",
      value: "88%",
      icon: <GraduationCap size={22} className="text-purple-600" />,
      trend: {
        text: "Above target",
        type: "success",
        icon: <CheckCircle size={14} />,
      },
    },
    {
      label: "Open Positions",
      value: "15",
      icon: <Briefcase size={22} className="text-amber-600" />,
      trend: {
        text: "5 Urgent",
        type: "warning",
        icon: <AlertCircle size={14} />,
      },
    },
  ];

  const handleToggleVisibility = (id: string) => {
    setInterns((prev) =>
      prev.map((user) =>
        user.id === id ? { ...user, is_visible: !user.is_visible } : user
      )
    );
    toast.success("Visibility updated ok.");
  };

  // Open the custom modal instead of window.confirm
  const openDeleteModal = (id: string, name: string) => {
    setDeleteId(id);
    setUserToDelete(name);
  };

  const handleConfirmDelete = () => {
    if (!deleteId) return;
    setInterns((prev) => prev.filter((user) => user.id !== deleteId));

    toast.error(`Removed ${userToDelete}`, {
      icon: <Trash2 size={18} className="text-white" />,
      style: { background: "#EF4444", color: "#fff", border: "none" },
    });

    setDeleteId(null);
  };

  return (
    <div className="w-full flex flex-col h-full overflow-hidden bg-[#F8FAFC]">
      {/* Header */}
      <header className="h-20 bg-white flex items-center justify-between px-8 border-b border-slate-200/60 sticky top-0 z-10 shrink-0">
        <div className="flex flex-col">
          <h2 className="text-[#102359] text-xl font-bold leading-tight">
            Dashboard Overview
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-0.5">
            <span>Home</span>
            <ChevronRight size={12} className="text-slate-400" />
            <span className="text-blue-600 font-semibold">Overview</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center h-10 w-80 bg-white rounded-xl border border-slate-200 px-3 focus-within:border-blue-400 transition-all shadow-sm">
            <Search size={18} className="text-slate-400" />
            <input
              className="w-full h-full border-none bg-transparent text-sm text-slate-700 focus:ring-0 ml-2 outline-none"
              placeholder="Search interns, jobs..."
              type="text"
            />
          </div>
          <button className="relative p-2 rounded-full hover:bg-slate-50 text-slate-500 transition-colors">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 border border-white"></span>
          </button>
        </div>
      </header>

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-[1400px] mx-auto flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <StatCard key={idx} {...stat} />
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 min-h-[400px]">
              <InternTable
                interns={interns}
                onToggleVisibility={handleToggleVisibility}
                onDelete={openDeleteModal} // Connect this to the modal trigger
              />
            </div>

            <div className="flex flex-col gap-6">
              <div className="bg-[#081E67] p-6 rounded-2xl shadow-xl text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-blue-400/30 transition-colors"></div>
                <div className="relative z-10">
                  <h3 className="text-lg font-bold mb-1">
                    Latest Training Program
                  </h3>
                  <p className="text-slate-300 text-xs mb-6">
                    AI & ML Spring Cohort
                  </p>
                  <button className="w-full py-3 bg-[#3AE39E] text-[#081E67] font-bold rounded-xl text-sm hover:brightness-105 transition-all">
                    Manage Pricing
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h4 className="text-[#102359] font-bold mb-4">Quick Actions</h4>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 group transition-all">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                        <Plus size={20} />
                      </div>
                      <span className="text-sm font-medium">Post New Job</span>
                    </div>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Delete Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteId}
        itemName={userToDelete}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default Dashboard;
