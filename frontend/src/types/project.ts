export interface ProjectFeedback {
  id?: string;
  client_name: string;
  client_photo?: string; 
  feedback_description: string;
  rating: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  photo_url: string;
  techs: string[]; 
  project_link: string;
  feedbacks: ProjectFeedback[];
  created_at: string;
  updated_at: string;
}

export interface ProjectPayload {
  title: string;
  description: string;
  photo_url: string; 
  tech_ids: string[]; 
  project_link: string;
}

export type ProjectFormData = ProjectPayload;