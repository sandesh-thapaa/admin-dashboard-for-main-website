import React, { useState, useEffect, useCallback } from "react";
import { Search, Plus, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import ProjectCard from "./ProjectCard";
import ProjectModal from "./ProjectModel";
import { projectService } from "../../services/projectService";
import type { Project } from "../../types/project";
import { toast } from "sonner";

const ProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 6;

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await projectService.getAll();
      const sortedData = Array.isArray(data) ? [...data].reverse() : [];
      setProjects(sortedData);
    } catch {
      setProjects([]);
      toast.error("Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    const path = location.pathname;
    if (path.endsWith("/new")) {
      setSelectedProject(null);
      setIsModalOpen(true);
    } else if (path.includes("/edit/")) {
      const id = path.split("/").pop();
      const projectToEdit = projects.find((p) => p.id === id);
      if (projectToEdit) {
        setSelectedProject(projectToEdit);
        setIsModalOpen(true);
      }
    } else {
      setIsModalOpen(false);
    }
  }, [location.pathname, projects]);

  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredProjects.slice(
    indexOfFirstProject,
    indexOfLastProject
  );

  return (
    <div className="p-8 min-h-[calc(100vh-80px)] flex flex-col space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#102359]">Portfolio</h1>
          <p className="text-slate-500 font-medium">
            Manage projects and client feedback.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3AE39E]"
              size={18}
            />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-11 pr-5 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:border-[#3AE39E] font-medium"
            />
          </div>
          <button
            onClick={() => navigate("/dashboard/projects/new")}
            className="flex items-center gap-2 bg-[#3AE39E] text-[#102359] px-6 py-3 rounded-2xl font-black shadow-lg shadow-[#3AE39E]/20 hover:scale-[1.02] transition-transform"
          >
            <Plus size={20} />
            <span className="hidden md:block">Add Project</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-3 py-20">
            <Loader2 className="w-10 h-10 text-[#3AE39E] animate-spin" />
            <p className="text-[#102359] font-bold animate-pulse">
              Loading projects...
            </p>
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {currentProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={() =>
                  navigate(`/dashboard/projects/edit/${project.id}`)
                }
                onDelete={async () => {
                  if (confirm("Delete?")) {
                    await projectService.delete(project.id);
                    loadProjects();
                  }
                }}
              />
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400">
            <p className="text-lg font-bold">No projects found</p>
            <p className="text-sm">
              Try adjusting your search or add a new project.
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-auto">
        <p className="text-sm text-slate-500 font-medium">
          Showing{" "}
          <span className="font-bold text-[#102359]">
            {isLoading ? 0 : currentProjects.length}
          </span>{" "}
          of{" "}
          <span className="font-bold text-[#102359]">
            {isLoading ? 0 : filteredProjects.length}
          </span>{" "}
          projects
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || isLoading}
            className="p-2 text-slate-400 hover:text-[#102359] disabled:opacity-20 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex items-center gap-1">
            {[...Array(Math.max(totalPages, 1))].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                disabled={isLoading}
                className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${
                  currentPage === i + 1
                    ? "bg-[#102359] text-white"
                    : "text-slate-400 hover:bg-slate-50"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={
              currentPage === totalPages || totalPages <= 1 || isLoading
            }
            className="p-2 text-slate-400 hover:text-[#102359] disabled:opacity-20 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => navigate("/dashboard/projects")}
        onSuccess={loadProjects}
        initialData={selectedProject}
      />
    </div>
  );
};

export default ProjectPage;
