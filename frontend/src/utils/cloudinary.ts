// utils/cloudinary.ts
import api from "../api/axios";
import axios from "axios";

export const uploadImageFlow = async (file: File): Promise<string> => {
  const { data: sigData } = await api.post("/admin/uploads/signature");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", sigData.api_key);
  formData.append("timestamp", sigData.timestamp.toString());
  formData.append("signature", sigData.signature);
  formData.append("folder", sigData.folder);

  const cloudUrl = `https://api.cloudinary.com/v1_1/${sigData.cloud_name}/image/upload`;

  const response = await axios.post(cloudUrl, formData);

  return response.data.secure_url;
};
