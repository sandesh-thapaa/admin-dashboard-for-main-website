import api from "../api/axios";
import type {
  TrainingProgram,
  TrainingFormData,
  TrainingCreatePayload,
} from "../types/training";
import type { Mentor } from "../types/mentor";

export const trainingService = {
  getAll: async (search?: string): Promise<TrainingProgram[]> => {
    const { data } = await api.get("/admin/trainings/", {
      params: search ? { search } : {},
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
      base_price: Number(formData.base_price) || 0,
      discount_type: formData.discount_type,
      discount_value: Number(formData.discount_value) || 0,
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
    formData: TrainingFormData,
    allMentors: Mentor[]
  ): Promise<TrainingProgram> => {
    const selectedMentorObjects = allMentors
      .filter((m) => formData.mentor_ids.includes(m.id))
      .map((m) => ({
        name: m.name,
        photo_url: m.photo_url || "",
      }));

    const payload = {
      title: formData.title,
      description: formData.description,
      photo_url: formData.photo_url,
      base_price: Number(formData.base_price) || 0,
      discount_type: formData.discount_type,
      discount_value: Number(formData.discount_value) || 0,
      benefits: formData.benefits.filter((b) => b.trim() !== ""),
      mentors: selectedMentorObjects, 
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
