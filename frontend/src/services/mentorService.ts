import api from "../api/axios";
import type { Mentor, MentorPayload } from "../types/mentor";

export const mentorService = {
  // GET /admin/mentors/
  getAll: async (): Promise<Mentor[]> => {
    const response = await api.get<Mentor[]>("/admin/mentors/");
    return response.data;
  },

  // POST /admin/mentors/
  create: async (data: MentorPayload): Promise<Mentor> => {
    const response = await api.post<Mentor>("/admin/mentors/", data);
    return response.data;
  },

  // GET /admin/mentors/{mentor_id}
  getById: async (id: string): Promise<Mentor> => {
    const response = await api.get<Mentor>(`/admin/mentors/${id}`);
    return response.data;
  },

  // PUT /admin/mentors/{mentor_id}
  update: async (id: string, data: MentorPayload): Promise<Mentor> => {
    const response = await api.put<Mentor>(`/admin/mentors/${id}`, data);
    return response.data;
  },

  // DELETE /admin/mentors/{mentor_id}
  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/mentors/${id}`);
  },
};
