import { Controller } from "@tsed/di";
import { MilestoneCategoryService } from "../../services/milestone-category.service";
import { Description, Get, Post, Put, Delete, Returns, Example, Summary } from "@tsed/schema";
import { BodyParams, Context, QueryParams, PathParams } from "@tsed/platform-params";
import { DecodedIdToken } from "firebase-admin/auth";
import { CustomAuth } from "../../decorators/CustomAuth";
import {
  ApiResponse,
  CreateMilestoneCategoryDto,
  UpdateMilestoneCategoryDto,
  MilestoneCategorySearchDto,
  MilestoneCategoryResponseDto,
  MilestoneCategoryStatsDto
} from "../../schemas";
import { IMilestoneCategoryFilters } from "../../interface/IMilestoneCategory";

@Controller("/milestone-categories")
export class MilestoneCategoryController {
  constructor(private readonly milestoneCategoryService: MilestoneCategoryService) {}

  @Get("/")
  @CustomAuth("Get milestone categories")
  async getMilestoneCategories(
    @QueryParams() searchDto: MilestoneCategorySearchDto,
    @Context("auth") _user: DecodedIdToken
  ): Promise<ApiResponse<{ categories: MilestoneCategoryResponseDto[]; total: number; hasMore: boolean }>> {
    const limit = parseInt(searchDto.limit || "20");
    const offset = parseInt(searchDto.offset || "0");
    
    const filters = {
      isPublic: searchDto.isPublic ? searchDto.isPublic === "true" : undefined,
      isActive: searchDto.isActive ? searchDto.isActive === "true" : undefined,
      search: searchDto.search
    };

    const result = await this.milestoneCategoryService.getMilestoneCategoriesWithPagination(
      _user.uid,
      filters,
      limit,
      offset
    );

    return new ApiResponse(
      result,
      "Milestone categories retrieved successfully"
    );
  }

  @Get("/public")
  @CustomAuth("Get public milestone categories")
  async getPublicMilestoneCategories(
    @QueryParams() searchDto: MilestoneCategorySearchDto
  ): Promise<ApiResponse<MilestoneCategoryResponseDto[]>> {
    const filters = {
      isActive: searchDto.isActive ? searchDto.isActive === "true" : undefined,
      search: searchDto.search
    };

    const categories = await this.milestoneCategoryService.getPublicMilestoneCategories(filters);

    return new ApiResponse(
      categories,
      "Public milestone categories retrieved successfully"
    );
  }

  @Get("/personal")
  @CustomAuth("Get personal milestone categories")
  async getPersonalMilestoneCategories(
    @QueryParams() searchDto: MilestoneCategorySearchDto,
    @Context("auth") _user: DecodedIdToken
  ): Promise<ApiResponse<MilestoneCategoryResponseDto[]>> {
    const filters = {
      isActive: searchDto.isActive ? searchDto.isActive === "true" : undefined,
      search: searchDto.search
    };

    const categories = await this.milestoneCategoryService.getPersonalMilestoneCategories(_user.uid, filters);

    return new ApiResponse(
      categories,
      "Personal milestone categories retrieved successfully"
    );
  }


  @Get("/:id")
  @CustomAuth("Get milestone category by ID")
  async getMilestoneCategoryById(
    @PathParams("id") id: string,
    @Context("auth") _user: DecodedIdToken
  ): Promise<ApiResponse<MilestoneCategoryResponseDto>> {
    const category = await this.milestoneCategoryService.getMilestoneCategoryById(id, _user.uid);

    return new ApiResponse(
      category,
      "Milestone category retrieved successfully"
    );
  }

  @Post("/")
  @CustomAuth("Create milestone category")
  async createMilestoneCategory(
    @BodyParams() createDto: CreateMilestoneCategoryDto,
    @Context("auth") _user: DecodedIdToken
  ): Promise<ApiResponse<MilestoneCategoryResponseDto>> {
    const category = await this.milestoneCategoryService.createMilestoneCategory(createDto, _user.uid);

    return new ApiResponse(
      category,
      "Milestone category created successfully"
    );
  }

  @Put("/:id")
  @CustomAuth("Update milestone category")
  async updateMilestoneCategory(
    @PathParams("id") id: string,
    @BodyParams() updateDto: UpdateMilestoneCategoryDto,
    @Context("auth") _user: DecodedIdToken
  ): Promise<ApiResponse<MilestoneCategoryResponseDto>> {
    const category = await this.milestoneCategoryService.updateMilestoneCategory(id, updateDto, _user.uid);

    return new ApiResponse(
      category,
      "Milestone category updated successfully"
    );
  }

  @Delete("/:id")
  @CustomAuth("Delete milestone category")
  async deleteMilestoneCategory(
    @PathParams("id") id: string,
    @Context("auth") _user: DecodedIdToken
  ): Promise<ApiResponse<{ success: boolean; message: string }>> {
    const success = await this.milestoneCategoryService.deleteMilestoneCategory(id, _user.uid);

    return new ApiResponse(
      { success, message: "Milestone category deleted successfully" },
      "Milestone category deleted successfully"
    );
  }

  @Get("/stats/overview")
  @CustomAuth("Get milestone category statistics")
  async getMilestoneCategoryStats(
    @Context("auth") _user: DecodedIdToken
  ): Promise<ApiResponse<MilestoneCategoryStatsDto>> {
    const stats = await this.milestoneCategoryService.getMilestoneCategoryStats(_user.uid);

    return new ApiResponse(
      stats,
      "Milestone category statistics retrieved successfully"
    );
  }

  @Get("/search/query")
  @CustomAuth("Search milestone categories")
  async searchMilestoneCategories(
    @QueryParams("q") query: string,
    @QueryParams("limit") limit: string = "20",
    @Context("auth") _user: DecodedIdToken
  ): Promise<ApiResponse<MilestoneCategoryResponseDto[]>> {
    const searchLimit = parseInt(limit);
    const categories = await this.milestoneCategoryService.searchMilestoneCategories(query, _user.uid, searchLimit);

    return new ApiResponse(
      categories,
      "Search results retrieved successfully"
    );
  }

  // Admin endpoints for managing default categories
  @Get("/admin/default")
  @CustomAuth("Admin: Get default milestone categories")
  async getDefaultMilestoneCategories(
    @Context("auth") _user: DecodedIdToken
  ): Promise<ApiResponse<MilestoneCategoryResponseDto[]>> {
    const categories = await this.milestoneCategoryService.getDefaultCategories();

    return new ApiResponse(
      categories,
      "Default milestone categories retrieved successfully"
    );
  }

  @Post("/admin/default")
  @CustomAuth("Admin: Create default milestone category")
  async createDefaultMilestoneCategory(
    @BodyParams() createDto: CreateMilestoneCategoryDto,
    @Context("auth") _user: DecodedIdToken
  ): Promise<ApiResponse<MilestoneCategoryResponseDto>> {
    const category = await this.milestoneCategoryService.createDefaultCategory(createDto);

    return new ApiResponse(
      category,
      "Default milestone category created successfully"
    );
  }

  @Put("/admin/default/:id")
  @CustomAuth("Admin: Update default milestone category")
  async updateDefaultMilestoneCategory(
    @PathParams("id") id: string,
    @BodyParams() updateDto: UpdateMilestoneCategoryDto,
    @Context("auth") _user: DecodedIdToken
  ): Promise<ApiResponse<MilestoneCategoryResponseDto>> {
    const category = await this.milestoneCategoryService.updateDefaultCategory(id, updateDto);

    return new ApiResponse(
      category,
      "Default milestone category updated successfully"
    );
  }

  @Delete("/admin/default/:id")
  @CustomAuth("Admin: Delete default milestone category")
  async deleteDefaultMilestoneCategory(
    @PathParams("id") id: string,
    @Context("auth") _user: DecodedIdToken
  ): Promise<ApiResponse<{ success: boolean; message: string }>> {
    const success = await this.milestoneCategoryService.deleteDefaultCategory(id);

    return new ApiResponse(
      { success, message: "Default milestone category deleted successfully" },
      "Default milestone category deleted successfully"
    );
  }

  @Post("/admin/seed-defaults")
  @CustomAuth("Admin: Seed default milestone categories")
  async seedDefaultCategories(
    @Context("auth") _user: DecodedIdToken
  ): Promise<ApiResponse<{ success: boolean; message: string; categories: MilestoneCategoryResponseDto[] }>> {
    const result = await this.milestoneCategoryService.seedDefaultCategories();

    return new ApiResponse(
      result,
      "Default milestone categories seeded successfully"
    );
  }
}