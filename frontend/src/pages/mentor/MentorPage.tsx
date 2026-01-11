import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Link,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  Search,
  Plus,
  Filter,
  ChevronRight,
  UserX,
  Loader2,
} from "lucide-react";
import type { Mentor } from "../../types/mentor";
import MentorCard from "./MentorCard";
import MentorModal from "./MentorModal";
import DeleteConfirmModal from "../DeleteConfirmModal"; // Import your custom modal
import { mentorService } from "../../services/mentorService";
import { toast } from "sonner";
import axios from "axios";

const MentorPage: React.FC = () => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const [deleteModalConfig, setDeleteModalConfig] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  const loadMentors = useCallback(async () => {
    try {
      setLoading(true);
      const data = await mentorService.getAll();
      setMentors(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load mentors from API");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMentors();
  }, [loadMentors]);

  const getSelectedMentor = () => {
    const segments = location.pathname.split("/");
    const editIndex = segments.indexOf("edit");
    if (editIndex !== -1 && segments[editIndex + 1]) {
      const id = segments[editIndex + 1];
      return mentors.find((m) => m.id === id) || null;
    }
    return null;
  };

  const handleAddNew = () => navigate("new");

  const handleEdit = (mentor: Mentor) => navigate(`edit/${mentor.id}`);

  const initiateDelete = (mentor: Mentor) => {
    setDeleteModalConfig({ id: mentor.id, title: mentor.name });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalConfig) return;
    setIsDeleting(true);
    try {
      await mentorService.delete(deleteModalConfig.id);
      toast.success("Mentor deleted");
      loadMentors();
    } catch (error: unknown) {
      let msg = "Delete failed";

      if (axios.isAxiosError(error)) {
        const data = error.response?.data;
        if (data?.detail) {
          msg = Array.isArray(data.detail) ? data.detail[0]?.msg : data.detail;
        }
      } else if (error instanceof Error) {
        msg = error.message;
      }

      toast.error(msg);
    } finally {
      setDeleteModalConfig(null);
      setIsDeleting(false);
    }
  };

  const filteredMentors = useMemo(() => {
    return mentors.filter((mentor) =>
      mentor.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, mentors]);

  return (
    <div className="flex h-screen w-full overflow-hidden font-display flex-col bg-[#F8FAFC]">
      <header className="shrink-0 px-4 md:px-8 pt-8 pb-6 bg-[#F8FAFC] sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto w-full flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <nav className="flex items-center gap-2 text-sm font-semibold text-slate-400">
              <Link
                className="hover:text-[#3AE39E] transition-colors"
                to="/dashboard"
              >
                Dashboard
              </Link>
              <ChevronRight size={14} />
              <span className="text-[#102359]">Mentors</span>
            </nav>
            <h1 className="text-3xl font-extrabold text-[#102359] tracking-tight">
              Mentor Management
            </h1>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-96 group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search
                  size={18}
                  className="text-slate-400 group-focus-within:text-[#3AE39E] transition-colors"
                />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:border-[#3AE39E] outline-none shadow-sm transition-all"
                placeholder="Search mentors..."
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button className="flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm font-bold hover:bg-slate-50 transition-all">
                <Filter size={18} /> Filter
              </button>
              <button
                onClick={handleAddNew}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-[#3AE39E] text-[#081E67] rounded-xl text-sm font-extrabold hover:brightness-105 transition-all shadow-md"
              >
                <Plus size={18} strokeWidth={3} /> Add New Mentor
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar">
        <div className="max-w-[1400px] mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 text-[#3AE39E] animate-spin" />
              <p className="text-[#102359] font-bold">Loading Mentors...</p>
            </div>
          ) : filteredMentors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMentors.map((mentor) => (
                <MentorCard
                  key={mentor.id}
                  mentor={mentor}
                  onEdit={handleEdit}
                  onDelete={() => initiateDelete(mentor)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
              <UserX size={48} className="text-slate-200 mb-4" />
              <p className="text-slate-500 font-bold">
                No mentors found matching your search.
              </p>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-slate-200 mt-12 pt-8 pb-8">
            <p className="text-sm font-semibold text-slate-500">
              Showing{" "}
              <span className="text-[#102359]">{filteredMentors.length}</span>{" "}
              mentors
            </p>
            <div className="flex gap-2">
              <button className="px-4 py-2 text-sm font-bold text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                Previous
              </button>
              <button className="px-4 py-2 text-sm font-bold text-[#081E67] bg-[#3AE39E] rounded-lg shadow-sm hover:brightness-105 transition-all">
                Next
              </button>
            </div>
          </div>
        </div>
      </main>

      <Routes>
        <Route
          path="new"
          element={
            <MentorModal
              isOpen={true}
              onClose={() => navigate("/dashboard/mentors", { replace: true })}
              onSuccess={loadMentors}
            />
          }
        />
        <Route
          path="edit/:id"
          element={
            <MentorModal
              isOpen={true}
              initialData={getSelectedMentor()}
              onClose={() => navigate("/dashboard/mentors", { replace: true })}
              onSuccess={loadMentors}
            />
          }
        />
      </Routes>

      <DeleteConfirmModal
        isOpen={!!deleteModalConfig}
        isDeleting={isDeleting}
        onClose={() => setDeleteModalConfig(null)}
        onConfirm={handleConfirmDelete}
        itemName={deleteModalConfig?.title || ""}
      />
    </div>
  );
};

export default MentorPage;
