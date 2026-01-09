import { z } from "zod";

export const projectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  photo_url: z.string().optional().or(z.literal("")),
  project_link: z.string().optional().or(z.literal("")),
  tech_ids: z.array(z.string()).min(1, "Select at least one tech"),
  feedbacks: z
    .array(
      z.object({
        client_name: z.string().min(1, "Client name is required"),
        feedback_description: z.string().min(1, "Description is required"),
        rating: z.number().min(1).max(5),
      })
    )
    .optional(),
});

export type ProjectFormData = z.infer<typeof projectSchema>;
