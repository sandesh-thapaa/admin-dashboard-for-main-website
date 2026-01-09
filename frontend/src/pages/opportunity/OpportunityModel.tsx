import React, { useState, useEffect } from "react";
import { X, Loader2, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { opportunityService } from "../../services/opportunityService";
import { OpportunityType } from "../../types/opportunity";
import type { Opportunity, OpportunityPayload } from "../../types/opportunity";
import { opportunitySchema } from "../../schema/opportunitySchema";
import { toast } from "sonner";
import { z } from "zod";

type OpportunityFormData = z.infer<typeof opportunitySchema>;

interface BackendError {
  response?: {
    data?: {
      detail?: string | Array<{ msg: string }>;
    };
  };
}

interface OpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Opportunity | null;
  defaultType: OpportunityType;
}

const OpportunityModal: React.FC<OpportunityModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  defaultType,
}) => {
  const [loading, setLoading] = useState(false);
  const [reqInput, setReqInput] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OpportunityFormData>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: {
      requirements: [],
      type: defaultType,
    },
  });

  const requirements = watch("requirements") || [];
  const isEdit = Boolean(initialData?.id);

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title,
        description: initialData.description || "",
        location: initialData.location || "",
        requirements: initialData.requirements || [],
        type: initialData.type,
        duration:
          initialData.type === "JOB"
            ? initialData.job_details?.employment_type
            : initialData.internship_details?.duration_months?.toString(),
        compensation:
          initialData.type === "JOB"
            ? initialData.job_details?.salary_range
            : initialData.internship_details?.stipend,
      });
    } else {
      reset({
        title: "",
        description: "",
        duration: "",
        compensation: "",
        location: "",
        requirements: [],
        type: defaultType,
      });
    }
  }, [initialData, isOpen, reset, defaultType]);

  const addRequirement = () => {
    const trimmed = reqInput.trim();
    if (trimmed && !requirements.includes(trimmed)) {
      setValue("requirements", [...requirements, trimmed], {
        shouldValidate: true,
      });
      setReqInput("");
    }
  };

  const removeRequirement = (index: number) => {
    setValue(
      "requirements",
      requirements.filter((_, i) => i !== index),
      { shouldValidate: true }
    );
  };

  const onSubmit = async (data: OpportunityFormData) => {
    setLoading(true);
    try {
      const payload: OpportunityPayload = {
        title: data.title,
        description: data.description,
        location: data.location,
        type: data.type,
        requirements: data.requirements || [],
      };

      if (data.type === "JOB") {
        payload.job_details = {
          employment_type: data.duration || "Full-time",
          salary_range: data.compensation || "Negotiable",
        };
      } else if (data.type === "INTERNSHIP") {
        payload.internship_details = {
          duration_months: parseInt(data.duration || "0") || 0,
          stipend: data.compensation || "N/A",
        };
      }

      if (isEdit && initialData?.id) {
        await opportunityService.update(initialData.id, payload);
        toast.success("Updated successfully!");
      } else {
        await opportunityService.create(payload);
        toast.success("Created successfully!");
      }
      onSuccess();
      handleClose();
    } catch (error: unknown) {
      const err = error as BackendError;
      const detail = err.response?.data?.detail;

      const msg = Array.isArray(detail)
        ? detail[0]?.msg
        : detail || "Operation failed";

      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#102359]/20 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-[#F8FAFC]">
          <div>
            <h2 className="text-xl font-extrabold text-[#102359]">
              {isEdit ? "Edit " : "Post New "}
              {defaultType === "JOB" ? "Job" : "Internship"}
            </h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
              Opportunity Details
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-all"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="overflow-y-auto p-8 custom-scrollbar">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-[#102359] mb-2">
                  Title
                </label>
                <input
                  {...register("title")}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.title ? "border-red-500" : "border-slate-200"
                  } focus:border-[#3AE39E] outline-none transition-all font-medium`}
                  placeholder="e.g. Senior Frontend Developer"
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1 font-bold">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-[#102359] mb-2">
                  Location
                </label>
                <input
                  {...register("location")}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.location ? "border-red-500" : "border-slate-200"
                  } focus:border-[#3AE39E] outline-none transition-all font-medium`}
                  placeholder="e.g. Remote / New York"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#102359] mb-2">
                  {defaultType === "JOB"
                    ? "Employment Type"
                    : "Duration (Months)"}
                </label>
                <input
                  {...register("duration")}
                  type={defaultType === "INTERNSHIP" ? "number" : "text"}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.duration ? "border-red-500" : "border-slate-200"
                  } focus:border-[#3AE39E] outline-none transition-all font-medium`}
                  placeholder={
                    defaultType === "JOB" ? "e.g. Full-time" : "e.g. 6"
                  }
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-[#102359] mb-2">
                  {defaultType === "JOB" ? "Salary Range" : "Stipend"}
                </label>
                <input
                  {...register("compensation")}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.compensation ? "border-red-500" : "border-slate-200"
                  } focus:border-[#3AE39E] outline-none transition-all font-medium`}
                  placeholder={
                    defaultType === "JOB" ? "e.g. $5,000/mo" : "e.g. $500/mo"
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#102359] mb-2">
                Description
              </label>
              <textarea
                {...register("description")}
                rows={4}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.description ? "border-red-500" : "border-slate-200"
                } focus:border-[#3AE39E] outline-none transition-all font-medium resize-none`}
                placeholder="Describe the role and responsibilities..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#102359] mb-2">
                Requirements
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-[#3AE39E] outline-none transition-all font-medium"
                  placeholder="Press Enter to add"
                  value={reqInput}
                  onChange={(e) => setReqInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addRequirement();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addRequirement}
                  className="px-4 bg-[#102359] text-white rounded-xl hover:bg-[#1a3a8a] transition-all"
                >
                  <Plus size={20} />
                </button>
              </div>
              {errors.requirements && (
                <p className="text-red-500 text-xs mb-2 font-bold">
                  {errors.requirements.message}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {requirements.map((req, index) => (
                  <span
                    key={index}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#3AE39E]/10 border border-[#3AE39E]/20 text-[#102359] text-xs font-bold rounded-lg"
                  >
                    {req}
                    <button
                      type="button"
                      onClick={() => removeRequirement(index)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full py-4 bg-[#3AE39E] text-[#081E67] rounded-2xl font-extrabold shadow-lg shadow-[#3AE39E]/20 hover:brightness-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : isEdit ? (
                "Update Listing"
              ) : (
                "Post Opportunity"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OpportunityModal;
