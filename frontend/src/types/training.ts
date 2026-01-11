import type { Mentor } from "./mentor";

export type DiscountType = "PERCENTAGE" | "AMOUNT";

export interface TrainingProgram {
  id: string;
  photo_url: string;
  title: string;
  description: string;
  base_price: number;
  discount_value: number | null;
  discount_type: DiscountType | null;
  effective_price: number;
  benefits: string[];
  mentors: Mentor[];
  created_at: string;
  updated_at: string;
}

export interface TrainingFormData {
  title: string;
  description: string;
  photo_url: string;
  base_price: number;
  discount_value: number;
  discount_type: DiscountType;
  benefits: string[];
  mentor_ids: string[];
}

// Since Create and Update use the exact same fields,
// let's use a single source of truth.
export interface TrainingPayload {
  title: string;
  description: string;
  photo_url: string;
  base_price: number;
  discount_type: DiscountType;
  discount_value: number;
  benefits: string[];
  mentor_ids: string[];
}

// You can keep these as aliases if you want to be explicit,
// but they MUST point to the same structure.
export type TrainingCreatePayload = TrainingPayload;
export type TrainingUpdatePayload = TrainingPayload;
