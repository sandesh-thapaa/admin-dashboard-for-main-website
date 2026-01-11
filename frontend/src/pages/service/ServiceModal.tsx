import React, { useEffect, useState, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import {
  X,
  Cpu,
  DollarSign,
  ImageIcon,
  Loader2,
  Plus,
} from "lucide-react";
import type {
  Service,
  ServiceTech,
  ServiceOffering,
} from "../../types/service";
import { DiscountType } from "../../types/service";
import { serviceService } from "../../services/serviceService";
import {
  serviceSchema,
  type ServiceFormData,
} from "../../schema/serviceSchema";
import { uploadImageFlow } from "../../utils/cloudinary";
import { toast } from "sonner";

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Service | null;
}

interface BackendValidationError {
  detail?: Array<{
    msg: string;
  }>;
}

const ServiceModal: React.FC<ServiceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}) => {
  const [availableTechs, setAvailableTechs] = useState<ServiceTech[]>([]);
  const [availableOfferings, setAvailableOfferings] = useState<
    ServiceOffering[]
  >([]);
  const [isUploading, setIsUploading] = useState(false);

  const [techSearch, setTechSearch] = useState("");
  const [offeringSearch, setOfferingSearch] = useState("");

  const [debouncedTechSearch, setDebouncedTechSearch] = useState("");
  const [debouncedOfferingSearch, setDebouncedOfferingSearch] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTechSearch(techSearch), 500);
    return () => clearTimeout(timer);
  }, [techSearch]);

  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedOfferingSearch(offeringSearch),
      500
    );
    return () => clearTimeout(timer);
  }, [offeringSearch]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      title: "",
      description: "",
      photo_url: "",
      tech_ids: [],
      offering_ids: [],
      base_price: 0,
      discount_type: DiscountType.PERCENTAGE,
      discount_value: 0,
    },
  });

  const selectedTechIds = useWatch({ control, name: "tech_ids" }) || [];
  const selectedOfferingIds = useWatch({ control, name: "offering_ids" }) || [];
  const currentPhotoUrl = useWatch({ control, name: "photo_url" });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [t, o] = await Promise.all([
          serviceService.getTechs(),
          serviceService.getOfferings(),
        ]);
        setAvailableTechs(t || []);
        setAvailableOfferings(o || []);
      } catch {
        toast.error("Failed to load options");
      }
    };
    if (isOpen) loadData();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      reset({
        title: initialData.title,
        description: initialData.description || "",
        photo_url: initialData.photo_url || "",
        tech_ids:
          initialData.techs
            ?.map(
              (name) => availableTechs.find((t) => t.name === name)?.id || ""
            )
            .filter((id) => id !== "") || [],
        offering_ids:
          initialData.offerings
            ?.map(
              (name) =>
                availableOfferings.find((o) => o.name === name)?.id || ""
            )
            .filter((id) => id !== "") || [],
        base_price: Number(initialData.base_price) || 0,
        discount_type: initialData.discount_type || DiscountType.PERCENTAGE,
        discount_value: initialData.discount_value || 0,
      });
    } else {
      reset({
        title: "",
        description: "",
        photo_url: "",
        tech_ids: [],
        offering_ids: [],
        base_price: 0,
        discount_type: DiscountType.PERCENTAGE,
        discount_value: 0,
      });
    }
  }, [isOpen, initialData, reset, availableTechs, availableOfferings]);

  const handleToggleId = (
    field: "tech_ids" | "offering_ids",
    value: string
  ) => {
    const current = getValues(field) || [];
    if (current.includes(value)) {
      setValue(
        field,
        current.filter((i: string) => i !== value),
        { shouldValidate: true }
      );
    } else {
      setValue(field, [...current, value], { shouldValidate: true });
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    field: "tech_ids" | "offering_ids",
    searchValue: string,
    setSearchValue: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (searchValue.trim()) {
        handleToggleId(field, searchValue.trim());
        setSearchValue("");
      }
    }
  };

  const onSubmit = async (data: ServiceFormData) => {
    try {
      const uuidRegex = /^[0-9a-fA-F-]{36}$/;

      const resolve = async (
        ids: string[],
        creator: (p: { name: string }) => Promise<{ id: string }>
      ) => {
        return Promise.all(
          ids.map(async (id) =>
            uuidRegex.test(id) ? id : (await creator({ name: id })).id
          )
        );
      };

      const [finalTechIds, finalOfferingIds] = await Promise.all([
        resolve(data.tech_ids, serviceService.createTech),
        resolve(data.offering_ids, serviceService.createOffering),
      ]);

      const payload = {
        ...data,
        tech_ids: finalTechIds,
        offering_ids: finalOfferingIds,
        base_price: Number(data.base_price),
        discount_value: Number(data.discount_value),
      };

      if (initialData?.id) {
        await serviceService.update(initialData.id, payload);
        toast.success("Service updated");
      } else {
        await serviceService.create(payload);
        toast.success("Service launched");
      }
      onSuccess();
      onClose();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<BackendValidationError>;
        toast.error(
          axiosError.response?.data?.detail?.[0]?.msg ||
            "Server validation failed"
        );
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const secureUrl = await uploadImageFlow(file);
      setValue("photo_url", secureUrl, { shouldValidate: true });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#102359]/40 backdrop-blur-sm">
      <div className="bg-white rounded-[28px] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-[#F8FAFC]">
          <div>
            <h2 className="text-2xl font-black text-[#102359]">
              {initialData ? "Edit Service" : "New Service Offer"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full text-slate-400"
          >
            <X size={24} />
          </button>
        </div>

        <form
          id="service-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto p-8 no-scrollbar"
        >
          <div className="space-y-8">
            <section className="space-y-4">
              <div
                onClick={() =>
                  !isUploading && !isSubmitting && fileInputRef.current?.click()
                }
                className={`relative h-44 w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                  currentPhotoUrl
                    ? "border-solid border-[#3AE39E]"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*"
                />
                {isUploading ? (
                  <Loader2 className="animate-spin text-[#3AE39E]" size={32} />
                ) : currentPhotoUrl ? (
                  <img
                    src={currentPhotoUrl}
                    className="absolute inset-0 w-full h-full object-cover"
                    alt="Preview"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <ImageIcon size={24} className="text-slate-400" />
                    <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">
                      Upload Cover
                    </span>
                  </div>
                )}
              </div>

              <input
                {...register("title")}
                placeholder="Service Title"
                className={`w-full px-5 py-4 bg-slate-50 border rounded-2xl outline-none font-bold text-[#102359] ${
                  errors.title
                    ? "border-red-500"
                    : "border-slate-100 focus:border-[#3AE39E]"
                }`}
              />
              <textarea
                {...register("description")}
                placeholder="Description..."
                rows={3}
                className={`w-full px-5 py-4 bg-slate-50 border rounded-2xl outline-none text-slate-600 font-medium ${
                  errors.description
                    ? "border-red-500"
                    : "border-slate-100 focus:border-[#3AE39E]"
                }`}
              />
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Tech Stack with Debounce */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-slate-400">
                  <Cpu size={16} />
                  <span className="text-[10px] font-black tracking-widest uppercase">
                    Tech Stack
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={techSearch}
                    onChange={(e) => setTechSearch(e.target.value)}
                    onKeyDown={(e) =>
                      handleKeyDown(e, "tech_ids", techSearch, setTechSearch)
                    }
                    placeholder="Search tech..."
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-bold text-[#102359]"
                  />
                  {debouncedTechSearch && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-40 overflow-y-auto p-1">
                      {availableTechs
                        .filter(
                          (t) =>
                            t.name
                              .toLowerCase()
                              .includes(debouncedTechSearch.toLowerCase()) &&
                            !selectedTechIds.includes(t.id)
                        )
                        .map((t) => (
                          <div
                            key={t.id}
                            onClick={() => {
                              handleToggleId("tech_ids", t.id);
                              setTechSearch("");
                            }}
                            className="px-4 py-2 hover:bg-slate-50 rounded-lg cursor-pointer text-sm font-bold text-[#102359]"
                          >
                            {t.name}
                          </div>
                        ))}
                      {!availableTechs.some(
                        (t) =>
                          t.name.toLowerCase() ===
                          debouncedTechSearch.toLowerCase()
                      ) && (
                        <div
                          onClick={() => {
                            handleToggleId("tech_ids", debouncedTechSearch);
                            setTechSearch("");
                          }}
                          className="px-4 py-2 hover:bg-[#3AE39E]/10 rounded-lg cursor-pointer text-sm font-black text-[#102359] border-t flex items-center gap-2 mt-1"
                        >
                          <Plus size={14} /> Add "{debouncedTechSearch}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedTechIds.map((id) => (
                    <span
                      key={id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-[#102359] rounded-lg text-[11px] font-bold border border-slate-200"
                    >
                      {availableTechs.find((t) => t.id === id)?.name || id}
                      <X
                        size={14}
                        className="ml-1 cursor-pointer"
                        onClick={() => handleToggleId("tech_ids", id)}
                      />
                    </span>
                  ))}
                </div>
              </section>

              {/* Offerings with Debounce */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="text-[10px] font-black tracking-widest uppercase">
                    Offerings
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={offeringSearch}
                    onChange={(e) => setOfferingSearch(e.target.value)}
                    onKeyDown={(e) =>
                      handleKeyDown(
                        e,
                        "offering_ids",
                        offeringSearch,
                        setOfferingSearch
                      )
                    }
                    placeholder="Search offerings..."
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-bold text-[#102359]"
                  />
                  {debouncedOfferingSearch && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-40 overflow-y-auto p-1">
                      {availableOfferings
                        .filter(
                          (o) =>
                            o.name
                              .toLowerCase()
                              .includes(
                                debouncedOfferingSearch.toLowerCase()
                              ) && !selectedOfferingIds.includes(o.id)
                        )
                        .map((o) => (
                          <div
                            key={o.id}
                            onClick={() => {
                              handleToggleId("offering_ids", o.id);
                              setOfferingSearch("");
                            }}
                            className="px-4 py-2 hover:bg-slate-50 rounded-lg cursor-pointer text-sm font-bold text-[#102359]"
                          >
                            {o.name}
                          </div>
                        ))}
                      {!availableOfferings.some(
                        (o) =>
                          o.name.toLowerCase() ===
                          debouncedOfferingSearch.toLowerCase()
                      ) && (
                        <div
                          onClick={() => {
                            handleToggleId(
                              "offering_ids",
                              debouncedOfferingSearch
                            );
                            setOfferingSearch("");
                          }}
                          className="px-4 py-2 hover:bg-[#3AE39E]/10 rounded-lg cursor-pointer text-sm font-black text-[#102359] border-t flex items-center gap-2 mt-1"
                        >
                          <Plus size={14} /> Add "{debouncedOfferingSearch}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedOfferingIds.map((id) => (
                    <span
                      key={id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-[#102359] rounded-lg text-[11px] font-bold border border-slate-200"
                    >
                      {availableOfferings.find((o) => o.id === id)?.name || id}
                      <X
                        size={14}
                        className="ml-1 cursor-pointer"
                        onClick={() => handleToggleId("offering_ids", id)}
                      />
                    </span>
                  ))}
                </div>
              </section>
            </div>

            <section className="p-6 bg-[#F8FAFC] rounded-[24px] border border-slate-100 space-y-5">
              <div className="flex items-center gap-2 text-slate-400">
                <DollarSign size={18} />
                <span className="text-xs font-black tracking-widest uppercase">
                  Pricing
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400">
                    Base Price
                  </label>
                  <input
                    type="number"
                    {...register("base_price", { valueAsNumber: true })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-[#102359]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400">
                    Type
                  </label>
                  <select
                    {...register("discount_type")}
                    className="w-full mt-1 px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-sm text-[#102359]"
                  >
                    <option value={DiscountType.PERCENTAGE}>
                      Percentage (%)
                    </option>
                    <option value={DiscountType.AMOUNT}>Fixed ($)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400">
                    Value
                  </label>
                  <input
                    type="number"
                    {...register("discount_value", { valueAsNumber: true })}
                    className="w-full mt-1 px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-[#102359]"
                  />
                </div>
              </div>
            </section>
          </div>
        </form>

        <div className="p-8 border-t border-slate-100 flex gap-3">
          <button
            onClick={onClose}
            type="button"
            className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold"
          >
            Cancel
          </button>
          <button
            form="service-form"
            type="submit"
            disabled={isSubmitting || isUploading}
            className="flex-[2] py-4 bg-[#3AE39E] text-[#102359] rounded-2xl font-black shadow-lg disabled:opacity-50"
          >
            {isSubmitting
              ? "Saving..."
              : initialData
              ? "Update Service"
              : "Launch Service"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceModal;
