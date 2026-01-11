// src/components/trainings/TrainingForm.tsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { trainingService } from "../../services/trainingService";
import { mentorService } from "../../services/mentorService";
import type { DiscountType, TrainingFormData } from "../../types/training";
import type { Mentor } from "../../types/mentor";
import { trainingSchema } from "../../../src/schema/trainingSchema";
import { uploadImageFlow } from "../../utils/cloudinary";
import { toast } from "sonner";
import { Trash2, Loader2, ImagePlus, Search, Plus } from "lucide-react";

type FormErrors = Record<string, string>;

const TrainingForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [errors, setErrors] = useState<FormErrors>({});
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [allMentors, setAllMentors] = useState<Mentor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");

  const [formData, setFormData] = useState<TrainingFormData>({
    title: "",
    description: "",
    photo_url: "",
    base_price: 0,
    discount_value: 0,
    discount_type: "PERCENTAGE",
    benefits: [], 
    mentor_ids: [],
  });

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        const mentorsData = await mentorService.getAll();
        setAllMentors(mentorsData);

        if (isEdit && id) {
          const programData = await trainingService.getById(id);

          const matchedIds = programData.mentors
            .map(
              (mObj) =>
                mentorsData.find((am: Mentor) => am.name === mObj.name)?.id
            )
            .filter((mid): mid is string => !!mid);

          setFormData({
            title: programData.title,
            description: programData.description || "",
            photo_url: programData.photo_url || "",
            base_price: programData.base_price,
            discount_value: programData.discount_value ?? 0,
            discount_type:
              (programData.discount_type as DiscountType) ?? "PERCENTAGE",
            benefits: programData.benefits || [],
            mentor_ids: matchedIds,
          });
          setPreview(programData.photo_url || "");
        }
      } catch {
        toast.error("Failed to sync with backend services.");
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [id, isEdit]);

  const filteredMentors = useMemo(
    () =>
      allMentors.filter((m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [allMentors, searchQuery]
  );

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setFormData((prev) => ({ ...prev, photo_url: "awaiting_upload" }));
    }
  };

  const toggleMentorSelection = (mentorId: string) => {
    setFormData((prev) => {
      const isSelected = prev.mentor_ids.includes(mentorId);
      return {
        ...prev,
        mentor_ids: isSelected
          ? prev.mentor_ids.filter((id) => id !== mentorId)
          : [...prev.mentor_ids, mentorId],
      };
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    const mainToast = toast.loading(
      isEdit ? "Updating program..." : "Creating program..."
    );

    const cleanedFormData = {
      ...formData,
      benefits: formData.benefits.filter((b) => b.trim() !== ""),
    };

    const result = trainingSchema.safeParse(cleanedFormData);
    if (!result.success) {
      const formatted: FormErrors = {};
      result.error.issues.forEach((i) => {
        formatted[i.path.join(".")] = i.message;
      });
      setErrors(formatted);
      toast.error("Validation failed", { id: mainToast });
      return;
    }

    try {
      setSubmitting(true);
      let finalPhotoUrl =
        formData.photo_url === "awaiting_upload" ? "" : formData.photo_url;

      if (selectedFile) {
        finalPhotoUrl = await uploadImageFlow(selectedFile);
      }

      const submissionData = { ...cleanedFormData, photo_url: finalPhotoUrl };

      if (isEdit && id) {
        await trainingService.update(id, submissionData);
        toast.success("Program updated successfully", { id: mainToast });
      } else {
        await trainingService.create(submissionData);
        toast.success("Program created successfully", { id: mainToast });
      }
      navigate("..");
    } catch {
      toast.error("Submission failed", { id: mainToast });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-[400px] flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-[#3AE39E]" size={40} />
        <p className="text-[#102359] font-bold">Fetching Training Data...</p>
      </div>
    );

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F8FAFC]">
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 no-scrollbar">
        <div className="max-w-[1024px] mx-auto pb-20">
          <header className="mb-8">
            <h1 className="text-4xl font-black text-[#102359]">
              {isEdit ? "Update Program" : "Add Training"}
            </h1>
          </header>

          <form
            id="training-form"
            className="flex flex-col gap-8"
            onSubmit={handleSubmit}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Photo Upload */}
              <div className="lg:col-span-4">
                <label className="text-sm font-black text-[#102359] uppercase block mb-2">
                  Cover Photo
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
                <div
                  onClick={() => !submitting && fileInputRef.current?.click()}
                  className={`aspect-square rounded-[32px] border-4 border-dashed flex items-center justify-center cursor-pointer overflow-hidden transition-all ${
                    preview
                      ? "border-[#3AE39E]"
                      : "bg-white border-slate-200 hover:border-[#3AE39E]/50"
                  } ${errors.photo_url ? "border-red-400" : ""}`}
                >
                  {preview ? (
                    <img
                      src={preview}
                      className="w-full h-full object-cover"
                      alt="Preview"
                    />
                  ) : (
                    <ImagePlus size={48} className="text-slate-300" />
                  )}
                </div>
                {errors.photo_url && (
                  <p className="text-red-500 text-[10px] mt-2 font-bold uppercase">
                    {errors.photo_url}
                  </p>
                )}
              </div>

              <div className="lg:col-span-8 space-y-6 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                <div>
                  <label className="block text-sm font-black text-[#102359] uppercase mb-2">
                    Title
                  </label>
                  <input
                    className={`w-full px-5 py-4 bg-slate-50 border rounded-2xl outline-none focus:border-[#3AE39E] transition-all font-bold ${
                      errors.title ? "border-red-400" : "border-slate-100"
                    }`}
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Enter training title"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-xs mt-1 font-bold">
                      {errors.title}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-black text-[#102359] uppercase mb-2">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    className={`w-full px-5 py-4 bg-slate-50 border rounded-2xl outline-none focus:border-[#3AE39E] transition-all font-medium ${
                      errors.description ? "border-red-400" : "border-slate-100"
                    }`}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="What is this training about?"
                  />
                  {errors.description && (
                    <p className="text-red-500 text-xs mt-1 font-bold">
                      {errors.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
              <h3 className="font-black text-[#102359] mb-6 uppercase text-sm tracking-wider">
                Pricing Configuration
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">
                    Base Price
                  </label>
                  <input
                    type="number"
                    className={`w-full px-5 py-4 bg-slate-50 border rounded-2xl outline-none focus:border-[#3AE39E] font-bold ${
                      errors.base_price ? "border-red-400" : "border-slate-100"
                    }`}
                    value={formData.base_price || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        base_price: Number(e.target.value),
                      })
                    }
                  />
                  {errors.base_price && (
                    <p className="text-red-500 text-[10px] font-bold">
                      {errors.base_price}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">
                    Discount Value
                  </label>
                  <input
                    type="number"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#3AE39E] font-bold"
                    value={formData.discount_value || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discount_value: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">
                    Type
                  </label>
                  <select
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#3AE39E] font-bold cursor-pointer"
                    value={formData.discount_type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discount_type: e.target.value as DiscountType,
                      })
                    }
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="AMOUNT">Fixed Amount</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h3 className="font-black text-[#102359] uppercase text-sm tracking-wider">
                  Assign Mentors
                </h3>
                <div className="relative w-full sm:w-64">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                  <input
                    placeholder="Search mentors..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:border-[#3AE39E]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[400px] overflow-y-auto p-1 no-scrollbar">
                {filteredMentors.map((m) => {
                  const isSelected = formData.mentor_ids.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggleMentorSelection(m.id)}
                      className={`group p-4 rounded-[24px] border-2 transition-all flex flex-col items-center text-center ${
                        isSelected
                          ? "border-[#3AE39E] bg-[#3AE39E]/5 ring-4 ring-[#3AE39E]/10"
                          : "border-slate-50 bg-slate-50 hover:border-slate-200"
                      }`}
                    >
                      <div className="relative mb-3">
                        <img
                          src={
                            m.photo_url ||
                            `https://ui-avatars.com/api/?name=${m.name}`
                          }
                          className="size-14 rounded-2xl object-cover shadow-sm"
                          alt={m.name}
                        />
                        {isSelected && (
                          <div className="absolute -top-2 -right-2 bg-[#3AE39E] text-[#102359] rounded-full p-1 shadow-md">
                            <Plus size={12} className="rotate-45" />
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] font-black text-[#102359] uppercase leading-tight truncate w-full">
                        {m.name}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-[#102359] uppercase text-sm tracking-wider">
                  Program Benefits
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      benefits: [...formData.benefits, ""],
                    })
                  }
                  className="bg-[#102359] text-white px-4 py-2 rounded-xl text-[10px] font-black hover:bg-[#102359]/90 transition-all"
                >
                  + ADD BENEFIT
                </button>
              </div>
              <div className="space-y-3">
                {formData.benefits.map((b, i) => (
                  <div key={i} className="flex gap-3 group">
                    <input
                      className="flex-1 px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-[#3AE39E] font-medium"
                      value={b}
                      onChange={(e) => {
                        const next = [...formData.benefits];
                        next[i] = e.target.value;
                        setFormData({ ...formData, benefits: next });
                      }}
                      placeholder="e.g. Lifetime Access"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          benefits: formData.benefits.filter(
                            (_, idx) => idx !== i
                          ),
                        })
                      }
                      className="text-slate-300 hover:text-red-500 transition-colors p-2"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
                {errors.benefits && (
                  <p className="text-red-500 text-xs font-bold uppercase tracking-tighter">
                    {errors.benefits}
                  </p>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      <footer className="p-8 bg-white border-t border-slate-100 flex justify-between items-center">
        <button
          onClick={() => navigate("..")}
          className="text-xs font-black text-slate-400 hover:text-[#102359] uppercase tracking-widest transition-colors"
        >
          Discard Changes
        </button>
        <button
          form="training-form"
          type="submit"
          disabled={submitting}
          className="bg-[#3AE39E] text-[#102359] px-12 py-4 rounded-2xl font-black shadow-xl shadow-[#3AE39E]/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all flex items-center gap-3"
        >
          {submitting ? <Loader2 className="animate-spin" size={20} /> : null}
          {submitting ? "SAVING PROGRAM..." : "SAVE PROGRAM"}
        </button>
      </footer>
    </div>
  );
};

export default TrainingForm;
