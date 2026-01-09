export const DiscountType = {
  PERCENTAGE: "PERCENTAGE",
  AMOUNT: "AMOUNT",
} as const;

export type DiscountType = (typeof DiscountType)[keyof typeof DiscountType];

export interface ServiceTech {
  id: string;
  name: string;
}

export interface ServiceOffering {
  id: string;
  name: string;
}

export interface Service {
  id: string;
  title: string;
  description: string | null;
  photo_url: string | null;
  techs: string[]; 
  offerings: string[]; 
  base_price: number;
  effective_price: number;
  created_at: string;
  updated_at: string;
  discount_type: DiscountType; 
  discount_value: number;
}

export interface ServicePayload {
  title: string;
  description: string;
  photo_url?: string;
  tech_ids: string[];
  offering_ids: string[];
  base_price: number;
  discount_type: DiscountType;
  discount_value: number;
}

export interface CreateMetadataPayload {
  name: string;
}
