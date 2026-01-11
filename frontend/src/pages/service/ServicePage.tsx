import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Search, Plus, ChevronRight, LayoutGrid, Loader2 } from "lucide-react";
import { serviceService } from "../../services/serviceService";
import type { Service } from "../../types/service";
import ServiceCard from "./ServiceCard";
import ServiceModal from "./ServiceModal";
import DeleteConfirmModal from "../DeleteConfirmModal";
import { toast } from "sonner";

const ServicePage: React.FC = () => {
  const [items, setItems] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [deleteModalConfig, setDeleteModalConfig] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await serviceService.getAll();
      setItems(data || []);
    } catch {
      toast.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const processedItems = useMemo(() => {
    const filtered = items.filter((i) =>
      i.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return [...filtered].sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;

      if (timeB !== timeA) {
        return timeB - timeA;
      }

      // Fallback to ID sort if timestamps are missing or identical
      return b.id.localeCompare(a.id);
    });
  }, [items, searchQuery]);

  const getSelectedService = () => {
    const segments = location.pathname.split("/");
    const editIndex = segments.indexOf("edit");
    if (editIndex !== -1 && segments[editIndex + 1]) {
      const id = segments[editIndex + 1];
      return items.find((s) => s.id === id) || null;
    }
    return null;
  };

  const initiateDelete = (service: Service) => {
    setDeleteModalConfig({ id: service.id, title: service.title });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalConfig) return;

    setIsDeleting(true);
    try {
      await serviceService.delete(deleteModalConfig.id);
      toast.success("Service deleted successfully");
      await loadData();
      setDeleteModalConfig(null);
    } catch {
      toast.error("Delete failed. Server is taking too long.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden flex-col bg-[#F8FAFC]">
      <header className="shrink-0 px-8 pt-8 pb-6">
        <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <nav className="flex items-center gap-2 text-sm font-semibold text-slate-400">
              <Link
                to="/dashboard"
                className="hover:text-[#3AE39E] transition-colors"
              >
                Dashboard
              </Link>
              <ChevronRight size={14} />
              <span className="text-[#102359]">Services</span>
            </nav>
            <h1 className="text-3xl font-extrabold text-[#102359] flex items-center gap-3">
              <LayoutGrid className="text-[#3AE39E]" size={28} />
              Services Management
            </h1>
          </div>

          <div className="flex justify-between items-center gap-4">
            <div className="relative w-96 group">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3AE39E] transition-colors"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:border-[#3AE39E] transition-all"
                placeholder="Search services..."
              />
            </div>
            <Link
              to="new"
              className="px-6 py-3 bg-[#3AE39E] text-[#081E67] rounded-xl font-extrabold shadow-md flex items-center gap-2 hover:brightness-105 transition-all active:scale-95"
            >
              <Plus size={18} /> Add Service
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-8 no-scrollbar">
        <div className="max-w-[1400px] mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-[#3AE39E] w-10 h-10" />
              <p className="text-[#102359] font-bold">Loading services...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-10">
              {processedItems.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onEdit={() => navigate(`edit/${service.id}`)}
                  onDelete={() => initiateDelete(service)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Routes>
        <Route
          path="new"
          element={
            <ServiceModal
              isOpen={true}
              onClose={() => navigate("/dashboard/services", { replace: true })}
              onSuccess={loadData}
            />
          }
        />
        <Route
          path="edit/:id"
          element={
            <ServiceModal
              isOpen={true}
              initialData={getSelectedService()}
              onClose={() => navigate("/dashboard/services", { replace: true })}
              onSuccess={loadData}
            />
          }
        />
      </Routes>

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

export default ServicePage;
