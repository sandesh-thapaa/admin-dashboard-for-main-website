import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(2, "Name is required"),
  position: z.string().min(2, "Position is required"),
  photo_url: z.string().optional(),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().nullable().or(z.literal("")),
  contact_email: z.string().email("Invalid contact email"),
  personal_email: z.string().email().nullable().or(z.literal("")),
  contact_number: z.string().nullable().or(z.literal("")),
  is_visible: z.boolean().default(true),
  role: z.enum(["TEAM", "INTERN"]),
  social_media: z.object({
    linkedin: z.string().url().or(z.literal("")).optional(),
    twitter: z.string().url().or(z.literal("")).optional(),
    github: z.string().url().or(z.literal("")).optional(),
  }),
});

export type UserFormData = z.infer<typeof userSchema>;
