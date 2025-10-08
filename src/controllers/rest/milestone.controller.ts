import { Controller } from "@tsed/di";
import { MilestoneService } from "../../services/milestone.service";
import { Description, Get, Post, Put, Delete, Returns, Example, Summary } from "@tsed/schema";
import { BodyParams, Context, QueryParams, PathParams } from "@tsed/platform-params";
import { DecodedIdToken } from "firebase-admin/auth";
import { CustomAuth } from "../../decorators/CustomAuth";
import {
  ApiResponse,
  CreateMilestoneDto,
  UpdateMilestoneDto,
  MilestoneSearchDto,
  MilestoneResponseDto,
  MilestoneStatsDto
} from "../../schemas";
import { IMilestoneSearchFilters } from "../../interface/IMilestone";

@Controller("/milestones")
export class MilestoneController {
  constructor(private readonly milestoneService: MilestoneService) {}

  @Post("/")
  @Summary("Create a new milestone")
  @Description("Create a new milestone with photos, date, and metadata")
  @CustomAuth("Create a new milestone")
  @Returns(201, ApiResponse)
  @Returns(400, ApiResponse)
  @Returns(401, ApiResponse)
  @Example({
    title: "My Wedding Day",
    description: "The most beautiful day of my life",
    milestoneCategoryId: "category-uuid-here",
    milestoneDate: "2024-06-15",
    location: "Paris, France",
    tags: ["Wedding", "Anniversary", "Travel"],
    occasion: "Wedding Ceremony",
    notes: "Everything was perfect, from the ceremony to the reception",
    isPrivate: false
  })
  async createMilestone(
    @BodyParams() milestoneData: CreateMilestoneDto,
    @Context("auth") auth: DecodedIdToken | undefined | null
  ): Promise<ApiResponse<MilestoneResponseDto>> {
    try {
      const milestone = await this.milestoneService.createMilestone(auth?.uid as string, {
        ...milestoneData,
        milestoneDate: new Date(milestoneData.milestoneDate)
      });
      return new ApiResponse(milestone, "Milestone created successfully");
    } catch (error) {
      throw error;
    }
  }

  @Get("/")
  @Summary("Get user milestones")
  @Description("Get all milestones for the authenticated user with optional filtering and pagination")
  @CustomAuth("Get user milestones")
  @Returns(200, ApiResponse)
  @Returns(401, ApiResponse)
  @Example({
    milestones: [
      {
        id: "123e4567-e89b-12d3-a456-426614174000",
        title: "My Wedding Day",
        milestoneCategoryId: "category-uuid-here",
        milestoneCategory: {
          id: "category-uuid-here",
          name: "Relationship Moments",
          icon: "❤️",
          color: "#FF6B6B"
        },
        milestoneDate: "2024-06-15",
        location: "Paris, France",
        tags: ["Wedding", "Anniversary"],
        isPrivate: false,
        files: []
      }
    ],
    total: 1,
    hasMore: false
  })
  async getMilestones(
    @QueryParams() searchParams: MilestoneSearchDto,
    @Context("auth") auth: DecodedIdToken | undefined | null
  ): Promise<ApiResponse<{ milestones: MilestoneResponseDto[]; total: number; hasMore: boolean }>> {
    try {
      const filters: IMilestoneSearchFilters = {
        milestoneCategoryId: searchParams.milestoneCategoryId,
        tags: searchParams.tags,
        dateFrom: searchParams.dateFrom ? new Date(searchParams.dateFrom) : undefined,
        dateTo: searchParams.dateTo ? new Date(searchParams.dateTo) : undefined,
        location: searchParams.location,
        isPrivate: searchParams.isPrivate,
        search: searchParams.search
      };

      const limit = searchParams.limit ? parseInt(searchParams.limit) : 50;
      const offset = searchParams.offset ? parseInt(searchParams.offset) : 0;

      const result = await this.milestoneService.getMilestones(
        auth?.uid as string,
        filters,
        searchParams.sortBy || "milestoneDate",
        searchParams.sortOrder || "DESC",
        limit,
        offset
      );

      return new ApiResponse(result, "Milestones retrieved successfully");
    } catch (error) {
      throw error;
    }
  }

  @Get("/:id")
  @Summary("Get milestone by ID")
  @Description("Get a specific milestone by its ID")
  @CustomAuth("Get milestone by ID")
  @Returns(200, ApiResponse)
  @Returns(404, ApiResponse)
  @Returns(401, ApiResponse)
  async getMilestoneById(
    @PathParams("id") milestoneId: string,
    @Context("auth") auth: DecodedIdToken | undefined | null
  ): Promise<ApiResponse<MilestoneResponseDto>> {
    try {
      const milestone = await this.milestoneService.getMilestoneById(auth?.uid as string, milestoneId);
      return new ApiResponse(milestone, "Milestone retrieved successfully");
    } catch (error) {
      throw error;
    }
  }

  @Put("/:id")
  @Summary("Update milestone")
  @Description("Update an existing milestone")
  @CustomAuth("Update milestone")
  @Returns(200, ApiResponse)
  @Returns(404, ApiResponse)
  @Returns(400, ApiResponse)
  @Returns(401, ApiResponse)
  async updateMilestone(
    @PathParams("id") milestoneId: string,
    @BodyParams() updateData: UpdateMilestoneDto,
    @Context("auth") auth: DecodedIdToken | undefined | null
  ): Promise<ApiResponse<MilestoneResponseDto>> {
    try {
      const milestone = await this.milestoneService.updateMilestone(auth?.uid as string, milestoneId, {
        ...updateData,
        milestoneDate: updateData.milestoneDate ? new Date(updateData.milestoneDate) : undefined
      });
      return new ApiResponse(milestone, "Milestone updated successfully");
    } catch (error) {
      throw error;
    }
  }

  @Delete("/:id")
  @Summary("Delete milestone")
  @Description("Delete a milestone (soft delete)")
  @CustomAuth("Delete milestone")
  @Returns(200, ApiResponse)
  @Returns(404, ApiResponse)
  @Returns(401, ApiResponse)
  async deleteMilestone(
    @PathParams("id") milestoneId: string,
    @Context("auth") auth: DecodedIdToken | undefined | null
  ): Promise<ApiResponse<{ success: boolean; message: string }>> {
    try {
      const result = await this.milestoneService.deleteMilestone(auth?.uid as string, milestoneId);
      return new ApiResponse(result, "Milestone deleted successfully");
    } catch (error) {
      throw error;
    }
  }

  @Get("/stats/overview")
  @Summary("Get milestone statistics")
  @Description("Get comprehensive statistics about user's milestones")
  @CustomAuth("Get milestone statistics")
  @Returns(200, ApiResponse)
  @Returns(401, ApiResponse)
  async getMilestoneStats(@Context("auth") auth: DecodedIdToken | undefined | null): Promise<ApiResponse<MilestoneStatsDto>> {
    try {
      const stats = await this.milestoneService.getMilestoneStats(auth?.uid as string);
      return new ApiResponse(stats, "Milestone statistics retrieved successfully");
    } catch (error) {
      throw error;
    }
  }

  @Get("/categories/available")
  @Summary("Get available milestone categories")
  @Description("Get all milestone categories available to the user (public + personal)")
  @CustomAuth("Get available milestone categories")
  @Returns(200, ApiResponse)
  @Returns(401, ApiResponse)
  async getAvailableMilestoneCategories(@Context("auth") auth: DecodedIdToken | undefined | null): Promise<ApiResponse<any[]>> {
    try {
      const categories = await this.milestoneService.getAvailableMilestoneCategories(auth?.uid as string);
      return new ApiResponse(categories, "Available categories retrieved successfully");
    } catch (error) {
      throw error;
    }
  }

  @Get("/tags/list")
  @Summary("Get milestone tags")
  @Description("Get all unique tags used by the user")
  @CustomAuth("Get milestone tags")
  @Returns(200, ApiResponse)
  @Returns(401, ApiResponse)
  async getMilestoneTags(@Context("auth") auth: DecodedIdToken | undefined | null): Promise<ApiResponse<string[]>> {
    try {
      const tags = await this.milestoneService.getMilestoneTags(auth?.uid as string);
      return new ApiResponse(tags, "Tags retrieved successfully");
    } catch (error) {
      throw error;
    }
  }

  @Get("/search/upcoming")
  @Summary("Get upcoming milestones")
  @Description("Get milestones occurring in the next specified number of days")
  @CustomAuth("Get upcoming milestones")
  @Returns(200, ApiResponse)
  @Returns(401, ApiResponse)
  async getUpcomingMilestones(
    @QueryParams("days") days: number = 30,
    @Context("auth") auth: DecodedIdToken | undefined | null
  ): Promise<ApiResponse<MilestoneResponseDto[]>> {
    try {
      const milestones = await this.milestoneService.getUpcomingMilestones(auth?.uid as string, days);
      return new ApiResponse(milestones, "Upcoming milestones retrieved successfully");
    } catch (error) {
      throw error;
    }
  }

  @Get("/search/recent")
  @Summary("Get recent milestones")
  @Description("Get milestones from the past specified number of days")
  @CustomAuth("Get recent milestones")
  @Returns(200, ApiResponse)
  @Returns(401, ApiResponse)
  async getRecentMilestones(
    @QueryParams("days") days: number = 30,
    @Context("auth") auth: DecodedIdToken | undefined | null
  ): Promise<ApiResponse<MilestoneResponseDto[]>> {
    try {
      const milestones = await this.milestoneService.getRecentMilestones(auth?.uid as string, days);
      return new ApiResponse(milestones, "Recent milestones retrieved successfully");
    } catch (error) {
      throw error;
    }
  }

  @Get("/search/query")
  @Summary("Search milestones")
  @Description("Search milestones by title, description, occasion, or notes")
  @CustomAuth("Search milestones")
  @Returns(200, ApiResponse)
  @Returns(401, ApiResponse)
  async searchMilestones(
    @QueryParams("q") searchTerm: string,
    @QueryParams("limit") limit: number = 20,
    @Context("auth") auth: DecodedIdToken | undefined | null
  ): Promise<ApiResponse<MilestoneResponseDto[]>> {
    try {
      if (!searchTerm?.trim()) {
        return new ApiResponse([], "Search term is required");
      }

      const milestones = await this.milestoneService.searchMilestones(auth?.uid as string, searchTerm.trim(), limit);
      return new ApiResponse(milestones, "Search results retrieved successfully");
    } catch (error) {
      throw error;
    }
  }
}
