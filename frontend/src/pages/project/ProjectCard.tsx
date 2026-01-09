import React from "react";
import {
  ExternalLink,
  Pencil,
  Trash2,
  Star,
  MessageSquare,
} from "lucide-react";
import type { Project } from "../../types/project";

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onEdit,
  onDelete,
}) => {
  const latestFeedback = project.feedbacks?.[0] || null;

  return (
    <div className="group relative flex flex-col rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden h-full">
      <div className="h-48 w-full bg-slate-200 overflow-hidden relative shrink-0">
        <img
          alt={project.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          src={project.photo_url || "https://via.placeholder.com/800x400"}
        />
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 translate-y-[-10px] group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10">
          <button
            onClick={() => onEdit(project)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 text-slate-600 hover:text-[#102359] shadow-lg"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={() => onDelete(project.id)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 text-slate-600 hover:text-red-500 shadow-lg"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-6">
        <div className="mb-3">
          <h3 className="text-lg font-bold text-[#102359] leading-tight mb-1">
            {project.title}
          </h3>
          {project.project_link && (
            <a
              className="text-xs font-bold text-[#3AE39E] hover:text-emerald-600 inline-flex items-center gap-1 transition-colors"
              href={project.project_link}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="truncate max-w-[200px]">
                {project.project_link.replace(/(^\w+:|^)\/\//, "")}
              </span>
              <ExternalLink size={14} className="shrink-0" />
            </a>
          )}
        </div>

        <p className="mb-4 text-sm text-slate-500 line-clamp-2">
          {project.description}
        </p>

        <div className="mb-6 flex flex-wrap gap-2">
          {project.techs?.map((tech) => (
            <span
              key={tech}
              className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600"
            >
              {tech}
            </span>
          ))}
        </div>

        <div>
          <h4 className="text-xs font-bold text-[#102359] uppercase mb-3 flex items-center gap-2">
            <MessageSquare size={14} /> Client Feedback
          </h4>
          {latestFeedback ? (
            <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100/50 flex items-start gap-3">
              <img
                alt={latestFeedback.client_name}
                className="h-8 w-8 rounded-full object-cover shrink-0"
                src={
                  latestFeedback.client_photo ||
                  `https://ui-avatars.com/api/?name=${latestFeedback.client_name}`
                }
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-xs font-bold text-[#102359] truncate">
                    {latestFeedback.client_name}
                  </span>
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={10}
                        fill={
                          i < latestFeedback.rating ? "currentColor" : "none"
                        }
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs italic text-slate-600 line-clamp-2">
                  "{latestFeedback.feedback_description}"
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-slate-50/50 p-3 border border-dashed border-slate-200 text-center text-[10px] font-bold text-slate-400 uppercase">
              No feedback yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
