import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { trainingService } from "../../services/trainingService";
import type { TrainingProgram } from "../../types/training";
import DeleteConfirmModal from "../DeleteConfirmModal";
import { toast } from "sonner";
import {
  Check,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  SearchX,
  Loader2,
} from "lucide-react";

interface TrainingListProps {
  searchQuery: string;
}

const TrainingList: React.FC<TrainingListProps> = ({ searchQuery }) => {
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [deleteModalConfig, setDeleteModalConfig] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await trainingService.getAll(searchQuery);
      setPrograms(data || []);
    } catch (error) {
      console.error("Failed to fetch programs:", error);
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Handler to open the modal
  const initiateDelete = (program: TrainingProgram) => {
    setDeleteModalConfig({ id: program.id, title: program.title });
  };

  // Logic to actually call the API
  const handleConfirmDelete = async () => {
    if (!deleteModalConfig) return;

    setIsDeleting(true);
    try {
      await trainingService.delete(deleteModalConfig.id);
      toast.success("Program deleted successfully");
      await loadData(); // Refresh the list
      setDeleteModalConfig(null);
    } catch (err) {
      toast.error("Delete failed. Server might be slow.");
      console.error("Delete failed", err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Pagination Logic
  const totalItems = Array.isArray(programs) ? programs.length : 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentItems = useMemo(() => {
    return Array.isArray(programs)
      ? programs.slice(indexOfFirstItem, indexOfLastItem)
      : [];
  }, [programs, indexOfFirstItem, indexOfLastItem]);

  const paginate = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-[#3AE39E]" size={40} />
          <p className="text-slate-500 font-medium">Loading programs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth bg-[#f8fafc]">
        <div className="max-w-[1600px] mx-auto flex flex-col gap-8 pb-10">
          {totalItems > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentItems.map((program) => (
                <div
                  key={program.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group h-[520px] overflow-hidden isolate"
                >
                  <Link
                    to={`${program.id}`}
                    className="flex-1 flex flex-col focus:outline-none overflow-hidden"
                  >
                    <div className="relative h-40 w-full overflow-hidden flex-shrink-0">
                      <div
                        className="bg-cover bg-center w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out will-change-transform"
                        style={{
                          backgroundImage: `url('${program.photo_url}')`,
                        }}
                      ></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                    </div>

                    <div className="p-5 flex flex-col flex-1 overflow-hidden">
                      <div className="h-12 mb-2 overflow-hidden">
                        <h3 className="text-base font-bold text-[#102359] line-clamp-2 break-words leading-tight group-hover:text-[#3AE39E] transition-colors duration-300">
                          {program.title}
                        </h3>
                      </div>

                      <div className="h-[3rem] mb-4 overflow-hidden">
                        <p className="text-slate-500 text-xs line-clamp-3 break-words leading-relaxed">
                          {program.description}
                        </p>
                      </div>

                      <div className="mb-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                          Benefits
                        </p>
                        <ul className="space-y-1.5">
                          {program.benefits?.slice(0, 2).map((benefit, idx) => (
                            <li
                              key={idx}
                              className="flex items-center gap-2 text-xs text-slate-600 font-medium min-w-0"
                            >
                              <Check
                                size={14}
                                className="text-[#3AE39E] flex-shrink-0"
                              />
                              <span className="truncate">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-auto">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                          Mentors
                        </p>
                        <div className="flex flex-row items-center gap-2 w-full">
                          {program.mentors?.slice(0, 2).map((mentor, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 bg-slate-50 px-2 py-1.5 rounded-full border border-slate-100 flex-1 min-w-0 max-w-[50%]"
                            >
                              <div
                                className="size-5 rounded-full bg-cover bg-center border border-white flex-shrink-0"
                                style={{
                                  backgroundImage: `url('${mentor.photo_url}')`,
                                }}
                              ></div>
                              <span className="text-[10px] text-slate-700 font-bold truncate">
                                {mentor.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>

                  <div className="px-5 pb-5 mt-auto">
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex flex-col min-w-0">
                        {/* The "Starting From" Label */}
                        <span className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">
                          Starts from
                        </span>
                        <div className="flex flex-col">
                          {/* The Enroll From Price - The CEO's priority */}
                          <span className="text-sm font-bold text-[#102359] leading-none mb-1.5">
                            रु{program.enroll_from_price?.toLocaleString()}
                          </span>

                          {/* The Main Effective Price */}
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-extrabold text-[#3AE39E] leading-none truncate">
                              रु{program.effective_price?.toLocaleString()}
                            </span>
                            {program.base_price > program.effective_price && (
                              <span className="text-[10px] text-slate-300 line-through font-bold truncate">
                                रु{program.base_price?.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Link
                          to={`${program.id}/edit`}
                          className="size-9 rounded-xl text-slate-400 hover:text-[#3AE39E] hover:bg-[#3AE39E]/10 flex items-center justify-center transition-all"
                        >
                          <Pencil size={18} />
                        </Link>
                        <button
                          onClick={() => initiateDelete(program)}
                          className="size-9 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
              <SearchX size={48} className="text-slate-300 mb-4" />
              <h3 className="text-xl font-bold text-[#102359]">
                No programs found
              </h3>
              <p className="text-slate-500 text-sm">
                Try searching for a different keyword.
              </p>
            </div>
          )}

          {totalItems > 0 && (
            <div className="flex items-center justify-between border-t border-slate-200 pt-6">
              <p className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-bold text-[#102359]">
                  {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)}
                </span>{" "}
                of{" "}
                <span className="font-bold text-[#102359]">{totalItems}</span>{" "}
                results
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-white disabled:opacity-50 flex items-center gap-1"
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-white disabled:opacity-50 flex items-center gap-1"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={!!deleteModalConfig}
        isDeleting={isDeleting}
        onClose={() => !isDeleting && setDeleteModalConfig(null)}
        onConfirm={handleConfirmDelete}
        itemName={deleteModalConfig?.title || ""}
      />
    </div>
  );
};

export default TrainingList;
