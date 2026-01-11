import { z } from "zod";
import { OpportunityType } from "../types/opportunity";

export const opportunitySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(1, "Description is required").nullable(),
  duration: z.string().optional(),
  compensation: z.string().min(1, "Compensation is required").nullable(),
  location: z.string().min(1, "Location is required").nullable(),
  requirements: z.array(z.string()).optional(),
  type: z.nativeEnum(OpportunityType),
});
