import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  Briefcase,
  GraduationCap,
  Loader2,
  FileQuestion,
  ChevronLeft,
} from "lucide-react";
import { opportunityService } from "../../services/opportunityService";
import { OpportunityType } from "../../types/opportunity";
import type { Opportunity } from "../../types/opportunity";
import OpportunityCard from "./OpportunityCard";
import OpportunityModal from "./OpportunityModel";
import DeleteConfirmModal from "../DeleteConfirmModal";
import { toast } from "sonner";

interface OpportunityPageProps {
  type: OpportunityType;
}

const OpportunityPage: React.FC<OpportunityPageProps> = ({ type }) => {
  const [items, setItems] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Delete State
  const [deleteModalConfig, setDeleteModalConfig] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  const isJobMode = type === "JOB";
  const basePath = isJobMode ? "/dashboard/jobs" : "/dashboard/internships";

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await opportunityService.getAll({ type });
      setItems(data);
      setCurrentPage(1);
    } catch (error) {
      console.error(error);
      toast.error(`Failed to load ${isJobMode ? "jobs" : "internships"}`);
    } finally {
      setLoading(false);
    }
  }, [type, isJobMode]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- URL PARSING LOGIC ---
  const getSelectedOpportunity = () => {
    const segments = location.pathname.split("/");
    const editIndex = segments.indexOf("edit");
    if (editIndex !== -1 && segments[editIndex + 1]) {
      const id = segments[editIndex + 1];
      return items.find((item) => item.id === id) || null;
    }
    return null;
  };

  const handleAddNew = () => navigate(`${basePath}/new`);

  const handleEdit = (item: Opportunity) =>
    navigate(`${basePath}/edit/${item.id}`);

  const initiateDelete = (item: Opportunity) => {
    setDeleteModalConfig({ id: item.id, title: item.title });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalConfig) return;
    setIsDeleting(true);
    try {
      await opportunityService.delete(deleteModalConfig.id);
      toast.success("Deleted successfully");
      loadData();
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleteModalConfig(null);
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, items]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex h-screen w-full overflow-hidden flex-col bg-[#F8FAFC]">
      <header className="shrink-0 px-4 md:px-8 pt-8 pb-6 bg-[#F8FAFC]">
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
              <span className="text-[#102359]">
                {isJobMode ? "Jobs" : "Internships"}
              </span>
            </nav>
            <h1 className="text-3xl font-extrabold text-[#102359] tracking-tight flex items-center gap-3">
              {isJobMode ? (
                <Briefcase className="text-[#3AE39E]" size={28} />
              ) : (
                <GraduationCap className="text-[#3AE39E]" size={28} />
              )}
              {isJobMode ? "Job Management" : "Internship Management"}
            </h1>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-96 group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search
                  size={18}
                  className="text-slate-400 group-focus-within:text-[#3AE39E]"
                />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:border-[#3AE39E] outline-none shadow-sm transition-all"
                placeholder={`Search ${isJobMode ? "jobs" : "internships"}...`}
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
                <Plus size={18} strokeWidth={3} /> Add{" "}
                {isJobMode ? "Job" : "Internship"}
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
              <p className="text-[#102359] font-bold">Fetching listings...</p>
            </div>
          ) : paginatedItems.length > 0 ? (
            <div className="flex flex-col gap-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedItems.map((item) => (
                  <OpportunityCard
                    key={item.id}
                    opportunity={item}
                    onEdit={handleEdit}
                    onDelete={() => initiateDelete(item)}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pb-8">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-all"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                        currentPage === i + 1
                          ? "bg-[#102359] text-white shadow-lg"
                          : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-all"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[32px] border border-dashed border-slate-200">
              <FileQuestion size={48} className="text-slate-200 mb-4" />
              <p className="text-slate-500 font-bold">
                No {type.toLowerCase()}s found.
              </p>
              <button
                onClick={handleAddNew}
                className="mt-4 text-[#3AE39E] font-bold hover:underline"
              >
                Create the first one
              </button>
            </div>
          )}
        </div>
      </main>

      <Routes>
        <Route
          path="new"
          element={
            <OpportunityModal
              isOpen={true}
              onClose={() => navigate(basePath)}
              onSuccess={loadData}
              defaultType={type}
            />
          }
        />
        <Route
          path="edit/:id"
          element={
            <OpportunityModal
              isOpen={true}
              initialData={getSelectedOpportunity()}
              onClose={() => navigate(basePath)}
              onSuccess={loadData}
              defaultType={type}
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

export default OpportunityPage;
