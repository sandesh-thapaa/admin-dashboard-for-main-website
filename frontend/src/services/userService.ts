import api from "../api/axios";
import type { User, UserFormData } from "../types/user";

export const userService = {
  // Fetch all users (Members in backend)
  getAll: async () => {
    const response = await api.get<User[]>("/admin/members");
    return response.data;
  },

  // Get specific groups
  getTeams: async () => {
    const response = await api.get<User[]>("/admin/members/teams");
    return response.data;
  },

  getInterns: async () => {
    const response = await api.get<User[]>("/admin/members/interns");
    return response.data;
  },

  // Create new user
  create: async (data: UserFormData) => {
    const response = await api.post<User>("/admin/members", data);
    return response.data;
  },

  // Update existing user
  update: async (id: string, data: Partial<UserFormData>) => {
    const response = await api.patch<User>(`/admin/members/${id}`, data);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<User>(`/admin/members/${id}`);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/admin/members/${id}`);
    return response.data;
  },
};
