import api from "../api/axios"; 
import type { Project, ProjectFeedback } from "../types/project";
import type { ProjectFormData } from "../schema/projectSchema";

export const projectService = {
  getAll: async (): Promise<Project[]> => {
    const response = await api.get<Project[]>("/admin/projects");
    return response.data;
  },

  create: async (data: ProjectFormData): Promise<Project> => {
    const response = await api.post<Project>("/admin/projects", {
      title: data.title,
      description: data.description,
      photo_url: data.photo_url,
      project_link: data.project_link,
      tech_ids: data.tech_ids,
    });
    return response.data;
  },

  update: async (id: string, data: ProjectFormData): Promise<Project> => {
    const response = await api.patch<Project>(`/admin/projects/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/projects/${id}`);
  },

  addFeedback: async (projectId: string, feedback: ProjectFeedback): Promise<void> => {
    await api.post(`/admin/projects/${projectId}/feedbacks`, feedback);
  }
};