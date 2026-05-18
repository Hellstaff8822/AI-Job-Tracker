export type JobStatus =
  | 'Backlog'
  | 'Contacted'
  | 'Screening'
  | 'Tech Interview'
  | 'Offer'
  | 'Reject';

export interface Note {
  id: string;
  text: string;
  createdAt: Date;
}

export interface Job {
  id: string;
  company: string;
  position: string;
  status: JobStatus;
  technologies: string[];
  logoUrl?: string | null;
  salary?: string;
  workFormat?: string;
  contactInfo?: string;
  description?: string;
  url?: string;
  notes: Note[];
  aiInsights?: string;
  history?: StatusHistory[];
}

export interface StatusHistory {
  id: string;
  jobId: string;
  status: string;
  createdAt: Date | string;
}
