import { z } from "zod";
import { DiscountType } from "../types/service";

export const serviceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  photo_url: z.string().optional(), 
  tech_ids: z.array(z.string()).min(1, "Select at least one tech"),
  offering_ids: z.array(z.string()).min(1, "Select at least one offering"),

  base_price: z.number().min(0, "Price must be positive"),
  discount_type: z.nativeEnum(DiscountType),
  discount_value: z.number().min(0, "Discount must be positive"),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;
