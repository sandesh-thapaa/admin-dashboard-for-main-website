import React, { useEffect, useState, useRef } from "react";
import { useForm, useWatch, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Plus, Cpu, Trash2, Upload, Loader2 } from "lucide-react";
import type { Project } from "../../types/project";
import {
  projectSchema,
  type ProjectFormData,
} from "../../schema/projectSchema";
import { projectService } from "../../services/projectService";
import { serviceService } from "../../services/serviceService";
import { uploadImageFlow } from "../../utils/cloudinary";
import { toast } from "sonner";

type SyncableFeedback = {
  id?: string;
  client_name: string;
  feedback_description: string;
  rating: number;
};

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Project | null;
}

const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}) => {
  const [availableTechs, setAvailableTechs] = useState<
    { id: string; name: string }[]
  >([]);
  const [techSearch, setTechSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { isSubmitting },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      photo_url: "",
      tech_ids: [],
      project_link: "",
      feedbacks: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "feedbacks",
  });

  const selectedTechIds = useWatch({ control, name: "tech_ids" }) || [];

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(techSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [techSearch]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const techs = await serviceService.getTechs();
        setAvailableTechs(techs);

        if (initialData) {
          const mappedTechIds = (initialData.techs || []).map((techName) => {
            const found = techs.find((t) => t.name === techName);
            return found ? found.id : techName;
          });

          reset({
            title: initialData.title,
            description: initialData.description,
            photo_url: initialData.photo_url,
            project_link: initialData.project_link,
            tech_ids: mappedTechIds,
            feedbacks: initialData.feedbacks || [],
          });
          setPreview(initialData.photo_url);
        } else {
          reset({
            title: "",
            description: "",
            photo_url: "",
            tech_ids: [],
            project_link: "",
            feedbacks: [],
          });
          setPreview(null);
          setSelectedFile(null);
        }
      } catch {
        toast.error("Failed to sync data");
      }
    };

    if (isOpen) {
      loadData();
    }
  }, [isOpen, initialData, reset]);

  const handleTechKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = techSearch.trim();
      if (val) {
        const existing = availableTechs.find(
          (t) => t.name.toLowerCase() === val.toLowerCase()
        );
        const toAdd = existing ? existing.id : val;
        if (!selectedTechIds.includes(toAdd)) {
          setValue("tech_ids", [...selectedTechIds, toAdd], {
            shouldValidate: true,
          });
        }
        setTechSearch("");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setValue("photo_url", "awaiting_upload", { shouldValidate: true });
    }
  };

  const onSubmit = async (data: ProjectFormData) => {
    setIsUploading(true);
    const mainToast = toast.loading("Processing project...");

    const syncFeedbacks = async (
      projectId: string,
      original: SyncableFeedback[],
      current: SyncableFeedback[] | undefined
    ) => {
      const currentSafe = current || [];

      const currentIds = new Set(
        currentSafe.filter((f) => f.id).map((f) => f.id!)
      );

      const toDelete = (original || []).filter(
        (f) => f.id && !currentIds.has(f.id)
      );

      const toAdd = currentSafe.filter((f) => !f.id);

      const deletePromises = toDelete.map((f) =>
        projectService.deleteFeedback(f.id!)
      );

      const addPromises = toAdd.map((f) =>
        projectService.addFeedback(projectId, f)
      );

      await Promise.all([...deletePromises, ...addPromises]);
    };

    try {
      const finalTechIds = await Promise.all(
        data.tech_ids.map(async (idOrName) => {
          const isUuid = /^[0-9a-fA-F-]{36}$/.test(idOrName);
          if (isUuid) return idOrName;
          const newTech = await serviceService.createTech({ name: idOrName });
          return newTech.id;
        })
      );

      let finalPhotoUrl = initialData?.photo_url || "";
      if (selectedFile) {
        finalPhotoUrl = await uploadImageFlow(selectedFile);
      }

      const payload = {
        ...data,
        tech_ids: finalTechIds,
        photo_url: finalPhotoUrl,
      };

      let project: Project;
      if (initialData?.id) {
        project = await projectService.update(initialData.id, payload);
        await syncFeedbacks(
          project.id,
          initialData.feedbacks || [],
          data.feedbacks || []
        );
      } else {
        project = await projectService.create(payload);
        if (data.feedbacks && data.feedbacks.length > 0) {
          await Promise.all(
            data.feedbacks.map((fb) =>
              projectService.addFeedback(project.id, fb)
            )
          );
        }
      }

      toast.success(initialData ? "Project updated" : "Project created", {
        id: mainToast,
      });
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error(errorMessage, { id: mainToast });
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  const filteredTechs = availableTechs.filter((t) =>
    t.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#102359]/40 backdrop-blur-sm">
      <div className="bg-white rounded-[28px] w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-[#F8FAFC]">
          <h2 className="text-2xl font-black text-[#102359]">
            {initialData ? "Edit Project" : "New Portfolio Project"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full text-slate-400"
          >
            <X size={24} />
          </button>
        </div>

        <form
          id="project-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto p-8 no-scrollbar space-y-8"
        >
          {/* Main Info Section */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div
                onClick={() =>
                  !isSubmitting && !isUploading && fileInputRef.current?.click()
                }
                className="group relative h-48 w-full rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:border-[#3AE39E] transition-all overflow-hidden"
              >
                {preview ? (
                  <>
                    <img
                      src={preview}
                      className="absolute inset-0 w-full h-full object-cover"
                      alt="Preview"
                    />
                    {(isUploading || isSubmitting) && (
                      <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                        <Loader2 className="animate-spin text-[#102359]" />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center text-slate-400">
                    <Upload size={32} strokeWidth={1.5} />
                    <span className="text-xs font-bold mt-2">
                      Upload Cover Image
                    </span>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
              <input
                {...register("project_link")}
                placeholder="Live Project Link (https://...)"
                className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:border-[#3AE39E]"
              />
            </div>

            <div className="space-y-4">
              <input
                {...register("title")}
                placeholder="Project Title"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-[#102359] focus:border-[#3AE39E]"
              />
              <textarea
                {...register("description")}
                placeholder="Short Description..."
                rows={4}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-slate-600 font-medium focus:border-[#3AE39E]"
              />
            </div>
          </section>

          {/* Tech Stack Section */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-wider">
              <Cpu size={16} /> Tech Stack
            </div>
            <div className="relative">
              <input
                type="text"
                value={techSearch}
                onChange={(e) => setTechSearch(e.target.value)}
                onKeyDown={handleTechKeyDown}
                placeholder="Type tech and press Enter..."
                className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-sm focus:border-[#3AE39E]"
              />
              {debouncedSearch && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-100 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                  {filteredTechs.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => {
                        if (!selectedTechIds.includes(t.id))
                          setValue("tech_ids", [...selectedTechIds, t.id], {
                            shouldValidate: true,
                          });
                        setTechSearch("");
                      }}
                      className="px-4 py-2 hover:bg-[#3AE39E]/10 cursor-pointer text-sm font-bold text-[#102359]"
                    >
                      {t.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedTechIds.map((idOrName) => {
                const tech = availableTechs.find((t) => t.id === idOrName);
                return (
                  <span
                    key={idOrName}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#102359] text-white rounded-lg text-xs font-bold"
                  >
                    {tech ? tech.name : idOrName}
                    <X
                      size={14}
                      className="cursor-pointer hover:text-red-400"
                      onClick={() => {
                        const next = selectedTechIds.filter(
                          (t) => t !== idOrName
                        );
                        setValue("tech_ids", next, { shouldValidate: true });
                      }}
                    />
                  </span>
                );
              })}
            </div>
          </section>

          {/* Feedbacks Section */}
          <section className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                Client Feedbacks
              </span>
              <button
                type="button"
                onClick={() =>
                  append({
                    client_name: "",
                    feedback_description: "",
                    rating: 5,
                  })
                }
                className="text-xs font-bold text-[#3AE39E] flex items-center gap-1"
              >
                <Plus size={14} /> Add Feedback
              </button>
            </div>
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-4 bg-[#F8FAFC] rounded-2xl border border-slate-100 relative group"
                >
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-white text-red-400 rounded-full flex items-center justify-center shadow-md border border-slate-100 hover:bg-red-50 transition-colors z-10"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <input
                      {...register(`feedbacks.${index}.client_name`)}
                      placeholder="Client Name"
                      className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-[#3AE39E]"
                    />
                    <select
                      {...register(`feedbacks.${index}.rating`, {
                        valueAsNumber: true,
                      })}
                      className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none"
                    >
                      {[5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={n}>
                          {n} Stars
                        </option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    {...register(`feedbacks.${index}.feedback_description`)}
                    placeholder="Feedback Description..."
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#3AE39E]"
                  />
                </div>
              ))}
            </div>
          </section>
        </form>

        <div className="p-8 border-t border-slate-100 flex gap-3 bg-white">
          <button
            onClick={onClose}
            type="button"
            className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold"
          >
            Cancel
          </button>
          <button
            form="project-form"
            type="submit"
            disabled={isSubmitting || isUploading}
            className="flex-[2] px-6 py-4 bg-[#3AE39E] text-[#102359] rounded-2xl font-black shadow-lg disabled:opacity-50"
          >
            {isSubmitting || isUploading ? "Saving..." : "Save Project"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;
