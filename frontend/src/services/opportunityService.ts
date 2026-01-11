import api from "../api/axios";
import type {
  Opportunity,
  OpportunityPayload,
  OpportunityType,
} from "../types/opportunity";

export const opportunityService = {
  // GET /api/admin/opportunities
  getAll: async (params?: {
    type?: OpportunityType;
    location?: string;
    search?: string;
  }): Promise<Opportunity[]> => {
    const response = await api.get("/api/admin/opportunities", { params });
    return response.data;
  }, // GET /api/admin/opportunities/{id}

  getById: async (id: string): Promise<Opportunity> => {
    const response = await api.get(`/api/admin/opportunities/${id}`);
    return response.data;
  }, // POST /api/admin/opportunities

  create: async (data: OpportunityPayload): Promise<Opportunity> => {
    const payload = { ...data };
    if (data.type === "JOB") delete payload.internship_details;
    if (data.type === "INTERNSHIP") delete payload.job_details;

    const response = await api.post("/api/admin/opportunities", payload);
    return response.data;
  }, // PATCH /api/admin/opportunities/{id}

  update: async (
    id: string,
    data: Partial<OpportunityPayload>
  ): Promise<Opportunity> => {
    const response = await api.patch(`/api/admin/opportunities/${id}`, data);
    return response.data;
  }, // DELETE /api/admin/opportunities/{id}

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/admin/opportunities/${id}`);
  },
};
