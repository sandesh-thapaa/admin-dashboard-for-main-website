export interface Mentor {
  id: string;
  name: string;
  specialization: string;
  photo_url: string;
}

export interface MentorPayload {
  name: string;
  photo_url: string;
  specialization: string;
}
