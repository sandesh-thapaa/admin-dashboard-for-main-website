import api from "../api/axios";
import type {
  TrainingProgram,
  TrainingFormData,
  TrainingCreatePayload,
  TrainingUpdatePayload,
} from "../types/training";

const cleanPrice = (price: string | number | null | undefined): number => {
  if (price === null || price === undefined) return 0;
  return typeof price === "number" ? price : parseFloat(price) || 0;
};

export const trainingService = {
  getAll: async (search?: string): Promise<TrainingProgram[]> => {
    const { data } = await api.get("/admin/trainings/", {
      // API defaults to 20 items. We request 100 to ensure the user sees all trainings.
      // We keep 'search' in case the backend supports it, though docs only list pagination.
      params: { ...(search ? { search } : {}), page_size: 100 },
    });
    return data?.items || (Array.isArray(data) ? data : []);
  },

  getById: async (id: string): Promise<TrainingProgram> => {
    const { data } = await api.get<TrainingProgram>(`/admin/trainings/${id}`);
    return data;
  },

  create: async (formData: TrainingFormData): Promise<TrainingProgram> => {
    const payload: TrainingCreatePayload = {
      title: formData.title,
      description: formData.description,
      photo_url: formData.photo_url,
      base_price: cleanPrice(formData.base_price),
      discount_type: formData.discount_type,
      discount_value: cleanPrice(formData.discount_value),
      benefits: formData.benefits.filter((b) => b.trim() !== ""),
      mentor_ids: formData.mentor_ids,
    };

    const { data } = await api.post<TrainingProgram>(
      "/admin/trainings/",
      payload
    );
    return data;
  },

  update: async (
    id: string,
    formData: TrainingFormData
  ): Promise<TrainingProgram> => {
    const payload: TrainingUpdatePayload = {
      title: formData.title,
      description: formData.description,
      photo_url: formData.photo_url,
      base_price: cleanPrice(formData.base_price),
      discount_type: formData.discount_type,
      discount_value: cleanPrice(formData.discount_value),
      benefits: formData.benefits.filter((b) => b.trim() !== ""),
      mentor_ids: formData.mentor_ids,
    };

    const { data } = await api.put<TrainingProgram>(
      `/admin/trainings/${id}`,
      payload
    );
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/trainings/${id}`);
  },
};
