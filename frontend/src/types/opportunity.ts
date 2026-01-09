export const OpportunityType = {
  JOB: "JOB",

  INTERNSHIP: "INTERNSHIP",
} as const;

export type OpportunityType =
  (typeof OpportunityType)[keyof typeof OpportunityType];

export interface Opportunity {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  requirements: string[];
  type: OpportunityType;
  job_details?: {
    employment_type: string;
    salary_range: string;
  };
  internship_details?: {
    duration_months: number;

    stipend: string;
  };
}

export interface OpportunityPayload {
  title: string;
  description?: string | null;
  location?: string | null;
  requirements: string[];
  type: OpportunityType;


  job_details?: {
    employment_type: string;

    salary_range: string;
  };

  internship_details?: {
    duration_months: number;

    stipend: string;
  };
}
