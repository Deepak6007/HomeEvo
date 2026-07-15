export type MilestoneStatus = 'released' | 'pending' | 'upcoming' | 'in_progress';

export interface Milestone {
  id: string;
  title: string;
  status: MilestoneStatus;
  amount: number;
  dueDate: string;
  approvedAt?: string;
}

export interface Project {
  id: string;
  title: string;
  status: string;
  budget: number;
  startDate: string;
  vendorId?: string;
  clientId: string;
  milestones: Milestone[];
  sitePhotos: string[];
  location: string;
  category?: string;
  description?: string;
}

export interface CreateProjectDTO {
  title: string;
  description: string;
  category: string;
  budget: number;
  location: string;
  timeline: string;
}

export interface MilestoneEvent {
  id: string;
  milestoneId: string;
  title: string;
  status: MilestoneStatus;
  timestamp: string;
  description?: string;
}
