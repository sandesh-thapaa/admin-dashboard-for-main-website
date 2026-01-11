export type UserRole = "TEAM" | "INTERN";

export interface UserSocialMedia {
  linkedin?: string;
  github?: string;
  twitter?: string;
}

export interface User {
  id: string;
  photo_url: string;
  name: string;
  position: string;
  start_date: string;
  end_date?: string | null;
  social_media: UserSocialMedia;
  contact_email: string;
  personal_email: string | null; 
  contact_number: string | null;
  is_visible: boolean;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface UserFormData {
  name: string;
  position: string;
  photo_url: string;
  role: UserRole;
  start_date: string;
  end_date: string | null; 
  social_media: UserSocialMedia;
  contact_email: string;
  personal_email: string | null;
  contact_number: string | null;
  is_visible: boolean;
}
