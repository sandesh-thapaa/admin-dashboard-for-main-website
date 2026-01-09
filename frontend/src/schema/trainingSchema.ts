import { z } from "zod";

export const trainingSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional().or(z.literal("")),
  photo_url: z.string().optional().or(z.literal("")),
  base_price: z.coerce.number().min(0, "Price cannot be negative"),
  discount_value: z.coerce.number().optional().default(0),
  discount_type: z.enum(["PERCENTAGE", "AMOUNT"]).default("PERCENTAGE"),
  benefits: z.array(z.string()).optional().default([]),
  mentor_ids: z.array(z.string()).optional().default([]),
});

export type TrainingFormData = z.infer<typeof trainingSchema>;
