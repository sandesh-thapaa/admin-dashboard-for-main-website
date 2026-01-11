import api from "../api/axios";
import type {
  Service,
  ServicePayload,
  ServiceTech,
  ServiceOffering,
  CreateMetadataPayload,
} from "../types/service";

interface BackendService
  extends Omit<Service, "base_price" | "effective_price"> {
  base_price: string | number;
  effective_price: string | number;
}

const cleanPrice = (price: string | number | null | undefined): number => {
  if (price === null || price === undefined) return 0;
  return typeof price === "number" ? price : parseFloat(price) || 0;
};

const mapService = (data: BackendService): Service => ({
  ...data,
  base_price: cleanPrice(data.base_price),
  effective_price: cleanPrice(data.effective_price),
});

export const serviceService = {

  getAll: async (): Promise<Service[]> => {
    const { data } = await api.get<BackendService[]>("/admin/services/");
    return data.map(mapService);
  },

  getById: async (id: string): Promise<Service> => {
    const { data } = await api.get<BackendService>(`/admin/services/${id}`);
    return mapService(data);
  },

  create: async (payload: ServicePayload): Promise<Service> => {
    const { data } = await api.post<BackendService>(
      "/admin/services/",
      payload
    );
    return mapService(data);
  },

  update: async (
    id: string,
    payload: Partial<ServicePayload>
  ): Promise<Service> => {
    const { data } = await api.patch<BackendService>(
      `/admin/services/${id}`,
      payload
    );
    return mapService(data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/services/${id}`);
  },


  getTechs: async (): Promise<ServiceTech[]> => {
    const { data } = await api.get<ServiceTech[]>("/admin/service-techs");
    return data;
  },

  createTech: async (payload: CreateMetadataPayload): Promise<ServiceTech> => {
    const { data } = await api.post<ServiceTech>(
      "/admin/service-techs",
      payload
    );
    return data;
  },


  getOfferings: async (): Promise<ServiceOffering[]> => {
    const { data } = await api.get<ServiceOffering[]>(
      "/admin/service-offerings"
    );
    return data;
  },

  createOffering: async (
    payload: CreateMetadataPayload
  ): Promise<ServiceOffering> => {
    const { data } = await api.post<ServiceOffering>(
      "/admin/service-offerings",
      payload
    );
    return data;
  },
};
