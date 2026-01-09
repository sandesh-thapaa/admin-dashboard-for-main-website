import React, { useState, useRef, useEffect } from "react";
import { X, Upload } from "lucide-react";
import type { User, UserRole, UserFormData } from "../../types/user";
import { userSchema } from "../../schema/userSchema";
import { userService } from "../../services/userService";
import { uploadImageFlow } from "../../utils/cloudinary";
import { toast } from "sonner";

interface AddUserModalProps {
  type: "interns" | "teams";
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: User | null;
}

interface ApiError {
  response?: {
    data?: {
      detail?: string | Array<{ msg: string }>;
    };
  };
}

type SocialPlatform = "linkedin" | "twitter" | "github";
const SOCIAL_PLATFORMS: SocialPlatform[] = ["linkedin", "twitter", "github"];

const AddUserModal: React.FC<AddUserModalProps> = ({
  type,
  isOpen,
  onClose,
  onSuccess,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    contact_email: "",
    personal_email: "",
    contact_number: "",
    is_visible: true,
    social_media: {
      linkedin: "",
      twitter: "",
      github: "",
    },
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEmployee = type === "teams";
  const entityName = isEmployee ? "Employee" : "Intern";
  const positionLabel = isEmployee ? "Designation" : "Internship Role";
  const dateLabel = isEmployee ? "Joined Date" : "Start Date";

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name,
          position: initialData.position,
          start_date: initialData.start_date,
          end_date: initialData.end_date || "",
          contact_email: initialData.contact_email,
          personal_email: initialData.personal_email || "",
          contact_number: initialData.contact_number || "",
          is_visible: initialData.is_visible,
          social_media: {
            linkedin: initialData.social_media?.linkedin || "",
            twitter: initialData.social_media?.twitter || "",
            github: initialData.social_media?.github || "",
          },
        });
        setPreviewImage(initialData.photo_url);
      } else {
        setFormData({
          name: "",
          position: "",
          start_date: new Date().toISOString().split("T")[0],
          end_date: "",
          contact_email: "",
          personal_email: "",
          contact_number: "",
          is_visible: true,
          social_media: { linkedin: "", twitter: "", github: "" },
        });
        setPreviewImage(null);
        setSelectedFile(null);
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));

      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.photo_url;
        return newErrors;
      });
    }
  };

  const handleSocialChange = (platform: SocialPlatform, value: string) => {
    setFormData((prev) => ({
      ...prev,
      social_media: { ...prev.social_media, [platform]: value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let finalPhotoUrl = initialData?.photo_url || "";

      if (selectedFile) {
        const uploadToast = toast.loading("Uploading image...");
        try {
          finalPhotoUrl = await uploadImageFlow(selectedFile);
          toast.dismiss(uploadToast);
        } catch {
          toast.dismiss(uploadToast);
          toast.error("Cloudinary upload failed.");
          setIsSubmitting(false);
          return;
        }
      }

      const payload: UserFormData = {
        ...formData,
        photo_url: finalPhotoUrl,
        role: (type === "teams" ? "TEAM" : "INTERN") as UserRole,
        end_date: formData.end_date.trim() === "" ? null : formData.end_date,
        personal_email:
          formData.personal_email.trim() === ""
            ? null
            : formData.personal_email,
        contact_number:
          formData.contact_number.trim() === ""
            ? null
            : formData.contact_number,
      };

      const result = userSchema.safeParse(payload);
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.issues.forEach((issue) => {
          fieldErrors[issue.path.join(".")] = issue.message;
        });
        setErrors(fieldErrors);
        setIsSubmitting(false);
        return;
      }

      if (initialData?.id) {
        await userService.update(initialData.id, payload);
        toast.success("Updated successfully");
      } else {
        await userService.create(payload);
        toast.success("Created successfully");
      }

      onSuccess();
      onClose();
    } catch (error: unknown) {
      const err = error as ApiError;
      const detail = err.response?.data?.detail;
      const msg = Array.isArray(detail) ? detail[0]?.msg : "Operation failed";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const getInputClass = (errorKey: string) => `
    w-full px-4 py-3 rounded-2xl border outline-none text-sm font-medium transition-all
    ${
      errors[errorKey]
        ? "border-red-500 bg-red-50/30 focus:ring-1 focus:ring-red-500"
        : "border-slate-200 focus:ring-1 focus:ring-[#3AE39E] focus:border-[#3AE39E]"
    }
  `;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-[#102359]">
            {initialData ? "Edit" : "Add New"} {entityName}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto p-8 space-y-8 no-scrollbar"
        >
          <div className="flex flex-col items-center gap-2">
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`w-32 h-32 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden group relative transition-colors ${
                errors.photo_url
                  ? "border-red-500 bg-red-50"
                  : "border-slate-200 bg-slate-50 hover:border-[#3AE39E]"
              }`}
            >
              {previewImage ? (
                <img
                  src={previewImage}
                  className="w-full h-full object-cover"
                  alt="Profile"
                />
              ) : (
                <Upload className="text-slate-400" />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold">
                Change Photo
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
              accept="image/*"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="block">
              <span className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">
                Full Name
              </span>
              <input
                className={getInputClass("name")}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g. Aman Gupta"
              />
            </label>

            <label className="block">
              <span className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">
                {positionLabel}
              </span>
              <input
                className={getInputClass("position")}
                value={formData.position}
                onChange={(e) =>
                  setFormData({ ...formData, position: e.target.value })
                }
                placeholder={isEmployee ? "Engineer" : "Intern"}
              />
            </label>

            <label className="block">
              <span className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">
                {dateLabel}
              </span>
              <input
                type="date"
                className={getInputClass("start_date")}
                value={formData.start_date}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
              />
            </label>

            <label className="block">
              <span className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">
                End Date (Optional)
              </span>
              <input
                type="date"
                className={getInputClass("end_date")}
                value={formData.end_date}
                onChange={(e) =>
                  setFormData({ ...formData, end_date: e.target.value })
                }
              />
            </label>

            <label className="block">
              <span className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">
                Work Email
              </span>
              <input
                className={getInputClass("contact_email")}
                value={formData.contact_email}
                onChange={(e) =>
                  setFormData({ ...formData, contact_email: e.target.value })
                }
              />
            </label>

            <label className="block">
              <span className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">
                Personal Email
              </span>
              <input
                className={getInputClass("personal_email")}
                value={formData.personal_email}
                onChange={(e) =>
                  setFormData({ ...formData, personal_email: e.target.value })
                }
                placeholder="personal@example.com"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">
                Contact Number
              </span>
              <input
                className={getInputClass("contact_number")}
                value={formData.contact_number}
                onChange={(e) =>
                  setFormData({ ...formData, contact_number: e.target.value })
                }
                placeholder="+91 ..."
              />
            </label>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-extrabold text-[#102359]">
              Social Media Links
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SOCIAL_PLATFORMS.map((platform) => (
                <div key={platform}>
                  <span className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">
                    {platform}
                  </span>
                  <input
                    className={getInputClass(`social_media.${platform}`)}
                    value={formData.social_media[platform]}
                    onChange={(e) =>
                      handleSocialChange(platform, e.target.value)
                    }
                    placeholder={`https://${platform}.com/...`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-2xl border font-bold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] px-6 py-4 rounded-2xl bg-[#3AE39E] text-[#102359] font-extrabold hover:shadow-lg disabled:opacity-50"
            >
              {isSubmitting
                ? "Processing..."
                : initialData
                ? `Update ${entityName}`
                : `Add ${entityName}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
