import { AxiosError } from "axios";
import api from "../api/axios";
import { toast } from "sonner";

interface BackendErrorDetail {
  loc: (string | number)[];
  msg: string;
  type: string;
}

interface BackendErrorResponse {
  detail: BackendErrorDetail[] | string;
}

export const uploadImageFlow = async (file: File): Promise<string> => {
  const MAX_SIZE = 1024 * 1024;
  if (file.size > MAX_SIZE) {
    toast.error("File is too large. Max 1MB allowed. ok.");
    throw new Error("File size limit exceeded");
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await api.post<{ image_url: string }>(
      "/admin/uploads/image", 
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data.image_url;
  } catch (err: unknown) {
    const error = err as AxiosError<BackendErrorResponse>;
    console.error("Upload failed:", error);

    const backendMessage = Array.isArray(error.response?.data?.detail)
      ? error.response?.data?.detail[0]?.msg
      : typeof error.response?.data?.detail === "string"
      ? error.response?.data?.detail
      : null;

    toast.error(
      backendMessage || "Upload failed. Check file type and size. ok."
    );

    throw error;
  }
};
