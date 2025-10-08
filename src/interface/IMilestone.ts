import { File } from "../entity/File";

export interface IMilestone {
  id: string;
  title: string;
  description?: string;
  category: string;
  milestoneDate: Date;
  location?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  isActive: boolean;
  isPrivate: boolean;
  occasion?: string;
  notes?: string;
  userId: string;
  files?: File[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateMilestone {
  title: string;
  description?: string;
  milestoneCategoryId: string;
  milestoneDate: Date;
  location?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  isPrivate?: boolean;
  occasion?: string;
  notes?: string;
}

export interface IUpdateMilestone {
  title?: string;
  description?: string;
  milestoneCategoryId?: string;
  milestoneDate?: Date;
  location?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  isPrivate?: boolean;
  occasion?: string;
  notes?: string;
}

export interface IMilestoneResponse {
  id: string;
  title: string;
  description?: string;
  milestoneCategoryId: string;
  milestoneCategory: {
    id: string;
    name: string;
    icon?: string;
    color?: string;
  };
  milestoneDate: string; // ISO date string
  location?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  isActive: boolean;
  isPrivate: boolean;
  occasion?: string;
  notes?: string;
  files?: {
    id: string;
    fileName: string;
    originalFileName: string;
    contentType?: string;
    fileSize: number;
    s3Key: string;
    description?: string;
    tags?: string;
    createdAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface IMilestoneSearchFilters {
  milestoneCategoryId?: string;
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  location?: string;
  isPrivate?: boolean;
  search?: string; // Search in title, description, occasion, notes
}

export interface IMilestoneStats {
  totalMilestones: number;
  milestonesByCategory: Record<string, number>;
  milestonesByYear: Record<string, number>;
  recentMilestones: IMilestoneResponse[];
  upcomingMilestones: IMilestoneResponse[];
}

export interface IMilestoneCategory {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  isActive: boolean;
}

export interface IMilestoneTag {
  id: string;
  name: string;
  color?: string;
  usageCount: number;
}
