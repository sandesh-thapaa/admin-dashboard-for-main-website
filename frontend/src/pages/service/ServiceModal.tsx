import React, { useEffect, useState, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import {
  X,
  Globe,
  Cpu,
  DollarSign,
  Image as ImageIcon,
  Upload,
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

  // States for custom search logic
  const [techSearch, setTechSearch] = useState("");
  const [offeringSearch, setOfferingSearch] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (isOpen) {
      if (initialData) {
        reset({
          title: initialData.title,
          description: initialData.description || "",
          photo_url: initialData.photo_url || "",
          tech_ids:
            initialData.techs
              ?.map(
                (techName) =>
                  availableTechs.find((t) => t.name === techName)?.id || ""
              )
              .filter((id) => id !== "") || [],
          offering_ids:
            initialData.offerings
              ?.map(
                (offName) =>
                  availableOfferings.find((o) => o.name === offName)?.id || ""
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
      setTechSearch("");
      setOfferingSearch("");
    }
  }, [initialData, isOpen, reset, availableTechs, availableOfferings]);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const uploadToast = toast.loading("Processing image...");
    try {
      const secureUrl = await uploadImageFlow(file);
      setValue("photo_url", secureUrl, { shouldValidate: true });
      toast.success("Image ready", { id: uploadToast });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed";
      toast.error(message, { id: uploadToast });
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: ServiceFormData) => {
    try {
      const finalTechIds = await Promise.all(
        data.tech_ids.map(async (idOrName) => {
          const isUuid = /^[0-9a-fA-F-]{36}$/.test(idOrName);
          if (isUuid) return idOrName;
          const newTech = await serviceService.createTech({ name: idOrName });
          return newTech.id;
        })
      );

      const finalOfferingIds = await Promise.all(
        data.offering_ids.map(async (idOrName) => {
          const isUuid = /^[0-9a-fA-F-]{36}$/.test(idOrName);
          if (isUuid) return idOrName;
          const newOffering = await serviceService.createOffering({
            name: idOrName,
          });
          return newOffering.id;
        })
      );

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
        const errorMessage =
          axiosError.response?.data?.detail?.[0]?.msg ||
          "Server validation failed";
        toast.error(errorMessage);
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#102359]/40 backdrop-blur-sm">
      <div className="bg-white rounded-[28px] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-[#F8FAFC]">
          <div>
            <h2 className="text-2xl font-black text-[#102359]">
              {initialData ? "Edit Service" : "New Service Offer"}
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              Define details and pricing.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"
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
              <div className="flex items-center gap-2 text-[#3AE39E] mb-2">
                <Globe size={18} />
                <span className="text-xs font-black tracking-widest text-slate-400">
                  Basic Info
                </span>
              </div>

              <div
                onClick={() =>
                  !isUploading && !isSubmitting && fileInputRef.current?.click()
                }
                className={`relative h-44 w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all group overflow-hidden ${
                  currentPhotoUrl
                    ? "border-solid border-[#3AE39E]"
                    : "border-slate-200 hover:border-[#3AE39E] bg-slate-50"
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
                  <div className="flex flex-col items-center gap-2">
                    <Loader2
                      className="animate-spin text-[#3AE39E]"
                      size={32}
                    />
                    <span className="text-xs font-bold text-slate-500">
                      Processing...
                    </span>
                  </div>
                ) : currentPhotoUrl ? (
                  <>
                    <img
                      src={currentPhotoUrl}
                      alt="Preview"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-[#102359]/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Upload size={24} className="text-white" />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <ImageIcon size={24} className="text-slate-400" />
                    <span className="text-[10px] font-black text-slate-400 tracking-widest">
                      Upload Cover
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <input
                  {...register("title")}
                  placeholder="Service Title"
                  className={`w-full px-5 py-4 bg-slate-50 border rounded-2xl outline-none font-bold text-[#102359] ${
                    errors.title
                      ? "border-red-500"
                      : "border-slate-100 focus:border-[#3AE39E]"
                  }`}
                />
                {errors.title && (
                  <p className="text-red-500 text-[10px] font-bold px-2 tracking-wider">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
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
                {errors.description && (
                  <p className="text-red-500 text-[10px] font-bold px-2 tracking-wider">
                    {errors.description.message}
                  </p>
                )}
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Tech Stack Selection */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-slate-400">
                  <Cpu size={16} />
                  <span className="text-[10px] font-black tracking-widest">
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
                    placeholder="Search or add tech..."
                    className={`w-full px-4 py-2 bg-slate-50 border rounded-xl outline-none text-sm font-bold text-[#102359] ${
                      errors.tech_ids
                        ? "border-red-500"
                        : "border-slate-100 focus:border-[#3AE39E]"
                    }`}
                  />
                  {techSearch && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-40 overflow-y-auto p-1">
                      {availableTechs
                        .filter(
                          (t) =>
                            t.name
                              .toLowerCase()
                              .includes(techSearch.toLowerCase()) &&
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
                        (t) => t.name.toLowerCase() === techSearch.toLowerCase()
                      ) && (
                        <div
                          onClick={() => {
                            handleToggleId("tech_ids", techSearch);
                            setTechSearch("");
                          }}
                          className="px-4 py-2 hover:bg-[#3AE39E]/10 rounded-lg cursor-pointer text-sm font-black text-[#102359] border-t flex items-center gap-2 mt-1"
                        >
                          <Plus size={14} /> Add "{techSearch}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {errors.tech_ids && (
                  <p className="text-red-500 text-[10px] font-bold px-1 tracking-wider">
                    {errors.tech_ids.message}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {selectedTechIds.map((id) => (
                    <span
                      key={id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-[#102359] rounded-lg text-[11px] font-bold border border-slate-200"
                    >
                      {availableTechs.find((t) => t.id === id)?.name || id}
                      <X
                        size={14}
                        className="ml-1 cursor-pointer hover:text-red-500"
                        onClick={() => handleToggleId("tech_ids", id)}
                      />
                    </span>
                  ))}
                </div>
              </section>

              {/* Offerings Selection */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="text-[10px] font-black tracking-widest">
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
                    placeholder="Search or add offering..."
                    className={`w-full px-4 py-2 bg-slate-50 border rounded-xl outline-none text-sm font-bold text-[#102359] ${
                      errors.offering_ids
                        ? "border-red-500"
                        : "border-slate-100 focus:border-[#3AE39E]"
                    }`}
                  />
                  {offeringSearch && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-40 overflow-y-auto p-1">
                      {availableOfferings
                        .filter(
                          (o) =>
                            o.name
                              .toLowerCase()
                              .includes(offeringSearch.toLowerCase()) &&
                            !selectedOfferingIds.includes(o.id)
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
                          o.name.toLowerCase() === offeringSearch.toLowerCase()
                      ) && (
                        <div
                          onClick={() => {
                            handleToggleId("offering_ids", offeringSearch);
                            setOfferingSearch("");
                          }}
                          className="px-4 py-2 hover:bg-[#3AE39E]/10 rounded-lg cursor-pointer text-sm font-black text-[#102359] border-t flex items-center gap-2 mt-1"
                        >
                          <Plus size={14} /> Add "{offeringSearch}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {errors.offering_ids && (
                  <p className="text-red-500 text-[10px] font-bold px-1 tracking-wider">
                    {errors.offering_ids.message}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {selectedOfferingIds.map((id) => (
                    <span
                      key={id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-[#102359] rounded-lg text-[11px] font-bold border border-slate-200"
                    >
                      {availableOfferings.find((o) => o.id === id)?.name || id}
                      <X
                        size={14}
                        className="ml-1 cursor-pointer hover:text-red-500"
                        onClick={() => handleToggleId("offering_ids", id)}
                      />
                    </span>
                  ))}
                </div>
              </section>
            </div>

            {/* Pricing Section */}
            <section className="p-6 bg-[#F8FAFC] rounded-[24px] border border-slate-100 space-y-5">
              <div className="flex items-center gap-2 text-slate-400">
                <DollarSign size={18} />
                <span className="text-xs font-black tracking-widest">
                  Pricing Details
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
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
                    Discount Type
                  </label>
                  <select
                    {...register("discount_type")}
                    className="w-full mt-1 px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-sm text-[#102359]"
                  >
                    <option value={DiscountType.PERCENTAGE}>
                      Percentage (%)
                    </option>
                    <option value={DiscountType.AMOUNT}>
                      Fixed Amount ($)
                    </option>
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
            className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
          >
            Cancel
          </button>
          <button
            form="service-form"
            type="submit"
            disabled={isSubmitting || isUploading}
            className="flex-[2] px-6 py-4 bg-[#3AE39E] text-[#102359] rounded-2xl font-black hover:brightness-105 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
