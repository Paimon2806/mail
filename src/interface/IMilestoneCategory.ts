export interface IMilestoneCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  isPublic: boolean;
  isActive: boolean;
  sortOrder: number;
  userId?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateMilestoneCategory {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  isPublic?: boolean;
  sortOrder?: number;
  metadata?: any;
}

export interface IUpdateMilestoneCategory {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  isPublic?: boolean;
  isActive?: boolean;
  sortOrder?: number;
  metadata?: any;
}

export interface IMilestoneCategoryResponse {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  isPublic: boolean;
  isActive: boolean;
  sortOrder: number;
  userId?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
  milestoneCount?: number; // Number of milestones using this category
}

export interface IMilestoneCategoryFilters {
  isPublic?: boolean;
  isActive?: boolean;
  userId?: string;
  search?: string;
}

export interface IMilestoneCategoryStats {
  totalCategories: number;
  publicCategories: number;
  personalCategories: number;
  activeCategories: number;
  mostUsedCategories: Array<{
    id: string;
    name: string;
    count: number;
  }>;
}
