import React, { useState, useRef, useEffect } from "react";
import { X, Loader2, Upload, ImageIcon } from "lucide-react";
import { mentorService } from "../../services/mentorService";
import { uploadImageFlow } from "../../utils/upload"; 
import { toast } from "sonner";
import type { Mentor } from "../../types/mentor";
import { AxiosError } from "axios";

interface MentorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Mentor | null;
}

interface BackendError {
  detail?: Array<{ msg: string }> | string;
}

const MentorModal: React.FC<MentorModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEdit = Boolean(initialData?.id);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setPreviewUrl(initialData.photo_url || null);
      } else {
        setName("");
        setPreviewUrl(null);
        setSelectedFile(null);
      }
    }
  }, [initialData, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleClose = () => {
    setName("");
    setSelectedFile(null);
    setPreviewUrl(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalPhotoUrl = initialData?.photo_url || "";

      if (selectedFile) {
        const uploadToast = toast.loading("Uploading image...");
        try {
          finalPhotoUrl = await uploadImageFlow(selectedFile);
          toast.dismiss(uploadToast);
        } catch {
          toast.dismiss(uploadToast);
          toast.error("Image upload failed");
          setLoading(false);
          return;
        }
      }

      const payload = {
        name: name,
        photo_url: finalPhotoUrl,
      };

      if (isEdit && initialData?.id) {
        await mentorService.update(initialData.id, payload);
        toast.success("Mentor updated!");
      } else {
        await mentorService.create(payload);
        toast.success("Mentor created!");
      }

      onSuccess();
      handleClose();
    } catch (error: unknown) {
      const axiosError = error as AxiosError<BackendError>;
      console.error("Backend Error:", axiosError.response?.data);

      const data = axiosError.response?.data;
      let msg = "Something went wrong";

      if (data?.detail) {
        msg = Array.isArray(data.detail) ? data.detail[0]?.msg : data.detail;
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#102359]/20 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-[#F8FAFC]">
          <h2 className="text-xl font-extrabold text-[#102359]">
            {isEdit ? "Edit Mentor" : "Add New Mentor"}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-[#102359] mb-2">
              Full Name
            </label>
            <input
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#3AE39E] outline-none transition-all"
              placeholder="e.g. Ajaj Ahamed"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#102359] mb-2">
              Mentor Photo
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative group cursor-pointer border-2 border-dashed border-slate-200 rounded-2xl h-48 flex flex-col items-center justify-center hover:border-[#3AE39E] hover:bg-[#3AE39E]/5 transition-all overflow-hidden"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
              {previewUrl ? (
                <div className="absolute inset-0 w-full h-full">
                  <img
                    src={previewUrl}
                    className="w-full h-full object-cover"
                    alt="Preview"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity text-white flex-col">
                    <Upload size={24} />
                    <span className="text-xs font-bold mt-1">Change Photo</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <ImageIcon size={32} className="text-slate-400 mb-2" />
                  <p className="text-xs font-bold text-slate-500">
                    Click to upload image
                  </p>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#3AE39E] text-[#081E67] rounded-2xl font-extrabold shadow-lg hover:brightness-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : isEdit ? (
              "Save Changes"
            ) : (
              "Create Mentor"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MentorModal;
