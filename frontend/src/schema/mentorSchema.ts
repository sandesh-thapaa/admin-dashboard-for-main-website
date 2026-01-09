import { z } from "zod";

export const mentorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  photo_url: z.string().url().or(z.literal("")).optional(),
});

export type MentorFormData = z.infer<typeof mentorSchema>;