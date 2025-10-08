import { Injectable } from "@tsed/di";
import { MilestoneRepository } from "../repositories/milestone.repository";
import { MilestoneCategoryRepository } from "../repositories/milestone-category.repository";
import { ICreateMilestone, IUpdateMilestone, IMilestoneSearchFilters, IMilestoneResponse, IMilestoneStats } from "../interface/IMilestone";
import { ResourceNotFoundError } from "../exceptions/resource-not-found.exception";
import { BusinessValidationException } from "../exceptions/business-exception";

@Injectable()
export class MilestoneService {
  constructor(
    private readonly milestoneRepository: MilestoneRepository,
    private readonly milestoneCategoryRepository: MilestoneCategoryRepository
  ) {}

  async createMilestone(userId: string, milestoneData: ICreateMilestone): Promise<IMilestoneResponse> {
    // Validate milestone date is not in the future (optional business rule)
    const milestoneDate = new Date(milestoneData.milestoneDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    if (milestoneDate > today) {
      throw new BusinessValidationException("Milestone date cannot be in the future");
    }

    // Validate required fields
    if (!milestoneData.title?.trim()) {
      throw new BusinessValidationException("Milestone title is required");
    }

    if (!milestoneData.milestoneCategoryId?.trim()) {
      throw new BusinessValidationException("Milestone category is required");
    }

    // Validate milestone category exists and is accessible to user
    const category = await this.milestoneCategoryRepository.findByIdAndUser(
      milestoneData.milestoneCategoryId, 
      userId
    );
    if (!category) {
      throw new BusinessValidationException("Invalid milestone category");
    }

    // Clean and validate tags
    if (milestoneData.tags) {
      milestoneData.tags = milestoneData.tags
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
        .slice(0, 10); // Limit to 10 tags
    }

    const milestone = await this.milestoneRepository.create(userId, milestoneData);
    return this.transformMilestoneResponse(milestone);
  }

  async getMilestoneById(userId: string, milestoneId: string): Promise<IMilestoneResponse> {
    const milestone = await this.milestoneRepository.findById(milestoneId, userId);

    if (!milestone) {
      throw new ResourceNotFoundError("Milestone not found");
    }

    return this.transformMilestoneResponse(milestone);
  }

  async getMilestones(
    userId: string,
    filters: IMilestoneSearchFilters = {},
    sortBy: string = "milestoneDate",
    sortOrder: "ASC" | "DESC" = "DESC",
    limit: number = 50,
    offset: number = 0
  ): Promise<{ milestones: IMilestoneResponse[]; total: number; hasMore: boolean }> {
    // Validate pagination parameters
    const validatedLimit = Math.min(Math.max(limit, 1), 100); // Between 1 and 100
    const validatedOffset = Math.max(offset, 0);

    // Validate sort parameters
    const validSortFields = ["title", "milestoneDate", "createdAt"];
    const validatedSortBy = validSortFields.includes(sortBy) ? sortBy : "milestoneDate";
    const validatedSortOrder = ["ASC", "DESC"].includes(sortOrder) ? sortOrder : "DESC";

    const result = await this.milestoneRepository.findAllByUser(
      userId,
      filters,
      validatedSortBy,
      validatedSortOrder,
      validatedLimit,
      validatedOffset
    );

    const milestones = result.milestones.map((milestone) => this.transformMilestoneResponse(milestone));
    const hasMore = validatedOffset + validatedLimit < result.total;

    return {
      milestones,
      total: result.total,
      hasMore
    };
  }

  async updateMilestone(userId: string, milestoneId: string, updateData: IUpdateMilestone): Promise<IMilestoneResponse> {
    // Check if milestone exists
    const existingMilestone = await this.milestoneRepository.findById(milestoneId, userId);
    if (!existingMilestone) {
      throw new ResourceNotFoundError("Milestone not found");
    }

    // Validate milestone category if provided
    if (updateData.milestoneCategoryId) {
      const category = await this.milestoneCategoryRepository.findByIdAndUser(
        updateData.milestoneCategoryId, 
        userId
      );
      if (!category) {
        throw new BusinessValidationException("Invalid milestone category");
      }
    }

    // Validate milestone date if provided
    if (updateData.milestoneDate) {
      const milestoneDate = new Date(updateData.milestoneDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      if (milestoneDate > today) {
        throw new BusinessValidationException("Milestone date cannot be in the future");
      }
    }

    // Clean and validate tags if provided
    if (updateData.tags) {
      updateData.tags = updateData.tags
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
        .slice(0, 10);
    }

    const updatedMilestone = await this.milestoneRepository.update(milestoneId, userId, updateData);

    if (!updatedMilestone) {
      throw new ResourceNotFoundError("Milestone not found");
    }

    return this.transformMilestoneResponse(updatedMilestone);
  }

  async deleteMilestone(userId: string, milestoneId: string): Promise<{ success: boolean; message: string }> {
    const success = await this.milestoneRepository.delete(milestoneId, userId);

    if (!success) {
      throw new ResourceNotFoundError("Milestone not found");
    }

    return {
      success: true,
      message: "Milestone deleted successfully"
    };
  }

  async getMilestoneStats(userId: string): Promise<IMilestoneStats> {
    return await this.milestoneRepository.getStats(userId);
  }

  async getMilestoneCategories(userId: string): Promise<string[]> {
    return await this.milestoneRepository.getCategories(userId);
  }

  async getAvailableMilestoneCategories(userId: string): Promise<any[]> {
    // Get both public and user's personal categories
    const publicCategories = await this.milestoneCategoryRepository.findPublic();
    const personalCategories = await this.milestoneCategoryRepository.findByUserId(userId);
    
    return [...publicCategories, ...personalCategories].map(category => ({
      id: category.id,
      name: category.name,
      icon: category.icon,
      color: category.color,
      description: category.description,
      isPublic: category.isPublic,
      isActive: category.isActive
    }));
  }

  async getMilestoneTags(userId: string): Promise<string[]> {
    return await this.milestoneRepository.getTags(userId);
  }

  async getMilestonesByDateRange(userId: string, startDate: Date, endDate: Date): Promise<IMilestoneResponse[]> {
    const milestones = await this.milestoneRepository.findByDateRange(userId, startDate, endDate);
    return milestones.map((milestone) => this.transformMilestoneResponse(milestone));
  }

  async getUpcomingMilestones(userId: string, days: number = 30): Promise<IMilestoneResponse[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    return await this.getMilestonesByDateRange(userId, today, futureDate);
  }

  async getRecentMilestones(userId: string, days: number = 30): Promise<IMilestoneResponse[]> {
    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - days);

    return await this.getMilestonesByDateRange(userId, pastDate, today);
  }

  async searchMilestones(userId: string, searchTerm: string, limit: number = 20): Promise<IMilestoneResponse[]> {
    const filters: IMilestoneSearchFilters = {
      search: searchTerm
    };

    const result = await this.getMilestones(userId, filters, "createdAt", "DESC", limit, 0);
    return result.milestones;
  }

  private transformMilestoneResponse(milestone: any): IMilestoneResponse {
    return {
      id: milestone.id,
      title: milestone.title,
      description: milestone.description,
      milestoneCategoryId: milestone.milestoneCategoryId,
      milestoneCategory: {
        id: milestone.milestoneCategory?.id || milestone.milestoneCategoryId,
        name: milestone.milestoneCategory?.name || "Unknown Category",
        icon: milestone.milestoneCategory?.icon,
        color: milestone.milestoneCategory?.color
      },
      milestoneDate:
        milestone.milestoneDate instanceof Date ? milestone.milestoneDate.toISOString().split("T")[0] : milestone.milestoneDate,
      location: milestone.location,
      tags: milestone.tags,
      metadata: milestone.metadata,
      isActive: milestone.isActive,
      isPrivate: milestone.isPrivate,
      occasion: milestone.occasion,
      notes: milestone.notes,
      files:
        milestone.files?.map((file: any) => ({
          id: file.id,
          fileName: file.fileName,
          originalFileName: file.originalFileName,
          contentType: file.contentType,
          fileSize: file.fileSize,
          s3Key: file.s3Key,
          description: file.description,
          tags: file.tags,
          createdAt: file.createdAt instanceof Date ? file.createdAt.toISOString() : file.createdAt
        })) || [],
      createdAt: milestone.createdAt instanceof Date ? milestone.createdAt.toISOString() : milestone.createdAt,
      updatedAt: milestone.updatedAt instanceof Date ? milestone.updatedAt.toISOString() : milestone.updatedAt
    };
  }
}
