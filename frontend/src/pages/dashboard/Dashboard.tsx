import React, { useState, useEffect, useCallback } from "react";
import StatCard from "./StatCard";
import InternTable from "./InternTable";
import DeleteConfirmModal from "../DeleteConfirmModal";
import type { StatData } from "../../types/dashboard";
import type { User } from "../../types/user";
import { userService } from "../../services/userService";
import { trainingService } from "../../services/trainingService";
import { opportunityService } from "../../services/opportunityService";
import { Link } from "react-router-dom";
import {
  Users,
  Briefcase,
  Search,
  ChevronRight,
  Plus,
  CheckCircle,
  GraduationCap,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";

const Dashboard: React.FC = () => {
  const [interns, setInterns] = useState<User[]>([]);
  const [trainings, setTrainings] = useState<{ id: string; title: string }[]>(
    []
  );
  const [opportunities, setOpportunities] = useState<
    { id: string; title: string }[]
  >([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const [statsData, setStatsData] = useState({
    total: 0,
    visible: 0,
    teams: 0,
    openPositions: 0,
  });

  const [latestTraining, setLatestTraining] = useState<{
    title: string;
    description: string;
  } | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<string>("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [userData, trainingData, opportunityData] = await Promise.all([
        userService.getAll(),
        trainingService.getAll(),
        opportunityService.getAll(),
      ]);

      const sortedUsers = [...userData].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setInterns(sortedUsers.filter((u) => u.role === "INTERN"));
      setTrainings(trainingData);
      setOpportunities(opportunityData);

      setStatsData({
        total: userData.filter((u) => u.role === "INTERN").length,
        visible: userData.filter((u) => u.is_visible).length,
        teams: userData.filter((u) => u.role === "TEAM").length,
        openPositions: opportunityData.length,
      });

      if (trainingData && trainingData.length > 0) {
        const latest = trainingData[0];
        setLatestTraining({
          title: latest.title,
          description: latest.description || "Active Training Program",
        });
      }
    } catch (error: unknown) {
      console.error(error);
      toast.error("Failed to sync dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Global Search Logic
  const searchResults = {
    interns: interns
      .filter((i) => i.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 3),
    trainings: trainings
      .filter((t) => t.title.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 3),
    opportunities: opportunities
      .filter((o) => o.title.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 3),
  };

  const hasResults =
    searchTerm.length > 0 &&
    (searchResults.interns.length > 0 ||
      searchResults.trainings.length > 0 ||
      searchResults.opportunities.length > 0);

  const stats: StatData[] = [
    {
      label: "Total Interns",
      value: loading ? "..." : statsData.total.toString(),
      icon: <Users size={22} className="text-blue-600" />,
      trend: { text: "Total registered", type: "neutral" },
    },
    {
      label: "Team Members",
      value: loading ? "..." : statsData.teams.toString(),
      icon: <CheckCircle size={22} className="text-emerald-600" />,
      trend: { text: "Active staff", type: "success" },
    },
    {
      label: "Visible Profiles",
      value: loading ? "..." : statsData.visible.toString(),
      icon: <GraduationCap size={22} className="text-purple-600" />,
      trend: { text: "Public on site", type: "neutral" },
    },
    {
      label: "Open Positions",
      value: loading ? "..." : statsData.openPositions.toString(),
      icon: <Briefcase size={22} className="text-amber-600" />,
      trend: { text: "Live opportunities", type: "neutral" },
    },
  ];

  const handleToggleVisibility = async (id: string) => {
    const userIndex = interns.findIndex((u) => u.id === id);
    if (userIndex === -1) return;
    const originalUser = interns[userIndex];
    const newStatus = !originalUser.is_visible;

    setInterns((prev) =>
      prev.map((u) => (u.id === id ? { ...u, is_visible: newStatus } : u))
    );
    setStatsData((prev) => ({
      ...prev,
      visible: newStatus ? prev.visible + 1 : prev.visible - 1,
    }));

    try {
      await userService.update(id, { is_visible: newStatus });
      toast.success("Visibility updated ok.");
    } catch {
      setInterns((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, is_visible: originalUser.is_visible } : u
        )
      );
      setStatsData((prev) => ({
        ...prev,
        visible: originalUser.is_visible ? prev.visible : prev.visible,
      }));
      toast.error("Failed to sync.");
    }
  };

  const openDeleteModal = (id: string, name: string) => {
    setDeleteId(id);
    setUserToDelete(name);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      await userService.delete(deleteId);
      setInterns((prev) => prev.filter((u) => u.id !== deleteId));
      toast.success(`Removed ${userToDelete}`);
      setDeleteId(null);
    } catch {
      toast.error("Delete failed.");
    }
  };

  return (
    <div className="w-full flex flex-col h-full overflow-hidden bg-[#F8FAFC]">
      {/* Header with higher z-index */}
      <header className="h-20 bg-white flex items-center justify-between px-8 border-b border-slate-200/60 sticky top-0 z-[100] shrink-0">
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

        <div className="relative flex items-center gap-6">
          <div className="hidden md:flex items-center h-10 w-80 bg-white rounded-xl border border-slate-200 px-3 focus-within:border-blue-400 transition-all shadow-sm relative z-[110]">
            <Search size={18} className="text-slate-400" />
            <input
              className="w-full h-full border-none bg-transparent text-sm text-slate-700 focus:ring-0 ml-2 outline-none"
              placeholder="Search..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <X
                size={14}
                className="cursor-pointer text-slate-400 hover:text-slate-600"
                onClick={() => setSearchTerm("")}
              />
            )}
          </div>

          {/* SEARCH DROPDOWN - Uses z-[120] to ensure it stays on top */}
          {hasResults && (
            <>
              <div
                className="fixed inset-0 z-[105] bg-black/5"
                onClick={() => setSearchTerm("")}
              ></div>
              <div className="absolute top-12 left-0 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl z-[120] max-h-96 overflow-y-auto p-2">
                {searchResults.interns.length > 0 && (
                  <div className="mb-3">
                    <p className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Interns
                    </p>
                    {searchResults.interns.map((i) => (
                      <Link
                        key={i.id}
                        to="/dashboard/users"
                        onClick={() => setSearchTerm("")}
                        className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg font-medium"
                      >
                        {i.name}
                      </Link>
                    ))}
                  </div>
                )}
                {searchResults.trainings.length > 0 && (
                  <div className="mb-3">
                    <p className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Trainings
                    </p>
                    {searchResults.trainings.map((t) => (
                      <Link
                        key={t.id}
                        to="/dashboard/trainings"
                        onClick={() => setSearchTerm("")}
                        className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg font-medium"
                      >
                        {t.title}
                      </Link>
                    ))}
                  </div>
                )}
                {searchResults.opportunities.length > 0 && (
                  <div>
                    <p className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Jobs
                    </p>
                    {searchResults.opportunities.map((o) => (
                      <Link
                        key={o.id}
                        to="/dashboard/opportunities"
                        onClick={() => setSearchTerm("")}
                        className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg font-medium"
                      >
                        {o.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-[1400px] mx-auto flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <StatCard key={idx} {...stat} />
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 min-h-[400px]">
              {loading ? (
                <div className="h-64 flex items-center justify-center bg-white rounded-2xl border border-slate-100">
                  <Loader2 className="animate-spin text-blue-600" />
                </div>
              ) : (
                <InternTable
                  interns={interns.slice(0, 5)}
                  onToggleVisibility={handleToggleVisibility}
                  onDelete={openDeleteModal}
                />
              )}
            </div>

            <div className="flex flex-col gap-6">
              <div className="bg-[#081E67] p-6 rounded-2xl shadow-xl text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-blue-400/30 transition-colors"></div>
                <div className="relative z-10">
                  <h3 className="text-lg font-bold mb-1 uppercase">
                    {loading
                      ? "Loading..."
                      : latestTraining?.title || "No Training Found"}
                  </h3>
                  <p className="text-slate-300 text-[10px] mb-6 line-clamp-2">
                    {loading
                      ? "checking details..."
                      : latestTraining?.description}
                  </p>
                  <Link
                    to="/dashboard/trainings"
                    className="block w-full py-3 bg-[#3AE39E] text-[#081E67] text-center font-bold rounded-xl text-sm hover:brightness-105 transition-all"
                  >
                    Manage Program
                  </Link>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h4 className="text-[#102359] font-bold mb-4">Quick Actions</h4>
                <div className="space-y-3">
                  <Link
                    to="/dashboard/opportunities"
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                        <Plus size={20} />
                      </div>
                      <span className="text-sm font-medium">Post New Job</span>
                    </div>
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
