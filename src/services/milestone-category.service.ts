import { Injectable } from "@tsed/di";
import { MilestoneCategoryRepository } from "../repositories/milestone-category.repository";
import { Logger } from "../utils/logger";
import {
  IMilestoneCategory,
  ICreateMilestoneCategory,
  IUpdateMilestoneCategory,
  IMilestoneCategoryFilters,
  IMilestoneCategoryResponse,
  IMilestoneCategoryStats
} from "../interface/IMilestoneCategory";
import { NotFoundException, BadRequestException } from "../exceptions/AppException";
import { ValidationError } from "ajv";

@Injectable()
export class MilestoneCategoryService {
  constructor(private readonly milestoneCategoryRepository: MilestoneCategoryRepository) {}

  async createMilestoneCategory(createData: ICreateMilestoneCategory, userId: string): Promise<IMilestoneCategoryResponse> {
    // Check for duplicate name within the same scope
    const existingCategory = await this.milestoneCategoryRepository.findByName(createData.name, createData.isPublic ? undefined : userId);

    if (existingCategory) {
      throw new BadRequestException(`A milestone category with the name "${createData.name}" already exists`);
    }

    const categoryData: Partial<IMilestoneCategory> = {
      ...createData,
      userId: createData.isPublic ? undefined : userId,
      isActive: true
    };

    const category = await this.milestoneCategoryRepository.create(categoryData);
    return this.transformToResponse(category);
  }

  async getMilestoneCategoriesWithPagination(
    userId: string,
    filters: IMilestoneCategoryFilters = {},
    limit: number = 20,
    offset: number = 0
  ): Promise<{ categories: IMilestoneCategoryResponse[]; total: number; hasMore: boolean }> {
    const result = await this.milestoneCategoryRepository.findByUserWithPagination(userId, filters, limit, offset);

    const categories = result.categories.map((category) => this.transformToResponse(category));

    return {
      categories,
      total: result.total,
      hasMore: result.hasMore
    };
  }

  async getMilestoneCategoryById(id: string, userId: string): Promise<IMilestoneCategoryResponse> {
    const category = await this.milestoneCategoryRepository.findByIdAndUser(id, userId);
    if (!category) {
      throw new NotFoundException("Milestone category not found");
    }

    return this.transformToResponse(category);
  }

  async getPublicMilestoneCategories(filters: IMilestoneCategoryFilters = {}): Promise<IMilestoneCategoryResponse[]> {
    const categories = await this.milestoneCategoryRepository.findPublicCategories(filters);
    return categories.map((category) => this.transformToResponse(category));
  }

  async getPersonalMilestoneCategories(userId: string, filters: IMilestoneCategoryFilters = {}): Promise<IMilestoneCategoryResponse[]> {
    const categories = await this.milestoneCategoryRepository.findPersonalCategories(userId, filters);
    return categories.map((category) => this.transformToResponse(category));
  }

  async updateMilestoneCategory(id: string, updateData: IUpdateMilestoneCategory, userId: string): Promise<IMilestoneCategoryResponse> {
    const existingCategory = await this.milestoneCategoryRepository.findByIdAndUser(id, userId);
    if (!existingCategory) {
      throw new NotFoundException("Milestone category not found");
    }

    // Check if user can update this category
    if (!existingCategory.isPublic && existingCategory.userId !== userId) {
      throw new NotFoundException("Milestone category not found");
    }

    // Check for duplicate name if name is being updated
    if (updateData.name && updateData.name !== existingCategory.name) {
      const duplicateCategory = await this.milestoneCategoryRepository.findByName(
        updateData.name,
        existingCategory.isPublic ? undefined : userId
      );

      if (duplicateCategory && duplicateCategory.id !== id) {
        throw new BadRequestException(`A milestone category with the name "${updateData.name}" already exists`);
      }
    }

    const updatedCategory = await this.milestoneCategoryRepository.updateByUser(id, userId, updateData);
    if (!updatedCategory) {
      throw new NotFoundException("Milestone category not found");
    }

    return this.transformToResponse(updatedCategory);
  }

  async deleteMilestoneCategory(id: string, userId: string): Promise<boolean> {
    const existingCategory = await this.milestoneCategoryRepository.findByIdAndUser(id, userId);
    if (!existingCategory) {
      throw new NotFoundException("Milestone category not found");
    }

    // Only allow deletion of personal categories
    if (existingCategory.isPublic) {
      throw new BadRequestException("Cannot delete public milestone categories");
    }

    if (existingCategory.userId !== userId) {
      throw new NotFoundException("Milestone category not found");
    }

    return await this.milestoneCategoryRepository.deleteByUser(id, userId);
  }

  async getMilestoneCategoryStats(userId: string): Promise<IMilestoneCategoryStats> {
    return await this.milestoneCategoryRepository.getStats(userId);
  }

  async searchMilestoneCategories(query: string, userId: string, limit: number = 20): Promise<IMilestoneCategoryResponse[]> {
    const filters: IMilestoneCategoryFilters = {
      search: query
    };

    const result = await this.milestoneCategoryRepository.findByUserWithPagination(userId, filters, limit, 0);

    return result.categories.map((category) => this.transformToResponse(category));
  }

  // Admin methods for managing default categories
  async getDefaultCategories(): Promise<IMilestoneCategoryResponse[]> {
    const categories = await this.milestoneCategoryRepository.findPublicCategories({ isActive: true });
    return categories.map((category) => this.transformToResponse(category));
  }

  async createDefaultCategory(createData: ICreateMilestoneCategory): Promise<IMilestoneCategoryResponse> {
    // Force public category for admin
    const categoryData: Partial<IMilestoneCategory> = {
      ...createData,
      isPublic: true,
      userId: undefined, // Public categories don't have userId
      isActive: true
    };

    // Check for duplicate name in public categories
    const existingCategory = await this.milestoneCategoryRepository.findByName(createData.name);
    if (existingCategory) {
      throw new BadRequestException(`A milestone category with the name "${createData.name}" already exists`);
    }

    const category = await this.milestoneCategoryRepository.create(categoryData);
    return this.transformToResponse(category);
  }

  async updateDefaultCategory(id: string, updateData: IUpdateMilestoneCategory): Promise<IMilestoneCategoryResponse> {
    const existingCategory = await this.milestoneCategoryRepository.findById(id);
    if (!existingCategory) {
      throw new NotFoundException("Milestone category not found");
    }

    // Only allow updating public categories
    if (!existingCategory.isPublic) {
      throw new BadRequestException("Cannot update personal categories through admin endpoint");
    }

    // Check for duplicate name if name is being updated
    if (updateData.name && updateData.name !== existingCategory.name) {
      const duplicateCategory = await this.milestoneCategoryRepository.findByName(updateData.name);
      if (duplicateCategory && duplicateCategory.id !== id) {
        throw new BadRequestException(`A milestone category with the name "${updateData.name}" already exists`);
      }
    }

    const updatedCategory = await this.milestoneCategoryRepository.update(id, updateData);
    if (!updatedCategory) {
      throw new NotFoundException("Milestone category not found");
    }

    return this.transformToResponse(updatedCategory);
  }

  async deleteDefaultCategory(id: string): Promise<boolean> {
    const existingCategory = await this.milestoneCategoryRepository.findById(id);
    if (!existingCategory) {
      throw new NotFoundException("Milestone category not found");
    }

    // Only allow deleting public categories
    if (!existingCategory.isPublic) {
      throw new BadRequestException("Cannot delete personal categories through admin endpoint");
    }

    return await this.milestoneCategoryRepository.delete(id);
  }

  async seedDefaultCategories(): Promise<{ success: boolean; message: string; categories: IMilestoneCategoryResponse[] }> {
    const defaultCategories = [
      {
        name: "Relationship Moments",
        description: "Special moments with loved ones and relationships",
        icon: "❤️",
        color: "#FF6B6B",
        sortOrder: 1
      },
      {
        name: "Family Life",
        description: "Family milestones and precious family moments",
        icon: "👨‍👩‍👧",
        color: "#4ECDC4",
        sortOrder: 2
      },
      {
        name: "Home Sweet Home",
        description: "Home-related achievements and milestones",
        icon: "🏠",
        color: "#45B7D1",
        sortOrder: 3
      },
      {
        name: "Travel & Adventures",
        description: "Travel experiences and adventure milestones",
        icon: "🚗",
        color: "#96CEB4",
        sortOrder: 4
      },
      {
        name: "My gratitude",
        description: "Moments of gratitude and appreciation",
        icon: "📖",
        color: "#FFEAA7",
        sortOrder: 5
      },
      {
        name: "Everyday Wins",
        description: "Small victories and daily achievements",
        icon: "🏅",
        color: "#DDA0DD",
        sortOrder: 6
      }
    ];

    const createdCategories: IMilestoneCategoryResponse[] = [];

    for (const categoryData of defaultCategories) {
      try {
        // Check if category already exists
        const existingCategory = await this.milestoneCategoryRepository.findByName(categoryData.name);
        if (!existingCategory) {
          const category = await this.milestoneCategoryRepository.create({
            ...categoryData,
            isPublic: true,
            isActive: true,
            userId: undefined
          });
          createdCategories.push(this.transformToResponse(category));
        }
      } catch (error) {
        Logger.error(`Failed to create category ${categoryData.name}:`, error);
      }
    }

    return {
      success: true,
      message: `Successfully seeded ${createdCategories.length} default categories`,
      categories: createdCategories
    };
  }

  private transformToResponse(category: IMilestoneCategory): IMilestoneCategoryResponse {
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      icon: category.icon,
      color: category.color,
      isPublic: category.isPublic,
      isActive: category.isActive,
      sortOrder: category.sortOrder,
      userId: category.userId,
      metadata: category.metadata,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      milestoneCount: 0 // This would need to be calculated if needed
    };
  }
}
