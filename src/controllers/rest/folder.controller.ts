import { Controller } from "@tsed/di";
import { FolderService } from "../../services/folder.service";
import { FileUploadService } from "../../services/FileUploadService";
import { Description, Get, Post, Put, Delete, Returns, Example, Summary } from "@tsed/schema";
import { BodyParams, Context, PathParams, QueryParams } from "@tsed/platform-params";
import { DecodedIdToken } from "firebase-admin/auth";
import { CustomAuth } from "../../decorators/CustomAuth";
import { Logger } from "../../utils/logger";
import {
  ApiResponse,
  CreateUserFolderDto,
  CreateFolderFrontendDto,
  UpdateUserFolderDto,
  CreateFolderHierarchyDto,
  MoveFolderDto,
  FolderUploadUrlDto
} from "../../schemas";
import { BadRequestException } from "../../exceptions/AppException";

@Controller("/folders")
export class FolderController {
  constructor(
    private readonly folderService: FolderService,
    private readonly fileUploadService: FileUploadService
  ) {}

  @Get("/")
  @Description("Get root folders for the current user")
  @CustomAuth("Get root folders")
  @Returns(200, ApiResponse)
  @Returns(401, ApiResponse)
  async getUserFolders(@Context("auth") auth: DecodedIdToken | undefined | null): Promise<ApiResponse<any>> {
    try {
      const folders = await this.folderService.getRootFolders(auth?.uid as string);
      return new ApiResponse(folders, "Root folders retrieved successfully");
    } catch (error) {
      throw error;
    }
  }

  @Post("/")
  @Summary("Create a new folder")
  @Description("Create a new folder with automatic path generation - only requires folderName, folderIcon, and parentId")
  @CustomAuth("Create folder")
  @Returns(201, ApiResponse)
  @Returns(400, ApiResponse)
  @Returns(401, ApiResponse)
  async createFolder(
    @BodyParams() folderData: CreateFolderFrontendDto,
    @Context("auth") auth: DecodedIdToken | undefined | null
  ): Promise<ApiResponse<any>> {
    try {
      // Validate required fields
      if (!folderData.folderName || !folderData.folderIcon) {
        return new BadRequestException("Both folderName and folderIcon are required");
      }

      // Handle parentId - convert null/undefined to undefined for service
      const parentId = folderData.parentId === null || folderData.parentId === undefined ? undefined : folderData.parentId;

      const folder = await this.folderService.createFolderSimple(auth?.uid as string, {
        folderName: folderData.folderName.trim(),
        folderIcon: folderData.folderIcon.trim(),
        parentId
      });

      return new ApiResponse(folder, "Folder created successfully");
    } catch (error) {
      // Handle specific error types
      if (error.message.includes("not found")) {
        return new BadRequestException(error.message);
      }
      if (error.message.includes("already exists")) {
        return new BadRequestException(error.message);
      }
      if (error.message.includes("does not belong")) {
        return new BadRequestException(error.message);
      }

      throw error;
    }
  }

  @Get("/hierarchy")
  @Description("Get folder hierarchy for the current user")
  @CustomAuth("Get user folder hierarchy")
  @Returns(200, ApiResponse)
  @Returns(401, ApiResponse)
  async getUserFolderHierarchy(@Context("auth") auth: DecodedIdToken | undefined | null): Promise<ApiResponse<any>> {
    try {
      const folders = await this.folderService.getUserFolderHierarchy(auth?.uid as string);
      return new ApiResponse(folders, "User folder hierarchy retrieved successfully");
    } catch (error) {
      throw error;
    }
  }

  @Get("/:id/subfolders")
  @Description("Get subfolders of a parent folder")
  @CustomAuth("Get subfolders")
  @Returns(200, ApiResponse)
  @Returns(401, ApiResponse)
  @Returns(404, ApiResponse)
  async getSubfolders(
    @PathParams("id") parentId: string,
    @Context("auth") auth: DecodedIdToken | undefined | null
  ): Promise<ApiResponse<any>> {
    try {
      // Verify user owns the parent folder
      const parentFolder = await this.folderService.getFolderById(parentId);
      if (!parentFolder || parentFolder.userId !== auth?.uid) {
        return new ApiResponse(null, "Parent folder not found or access denied");
      }

      const subfolders = await this.folderService.getSubfolders(parentId);
      return new ApiResponse(subfolders, "Subfolders retrieved successfully");
    } catch (error) {
      throw error;
    }
  }

  @Get("/stats")
  @Summary("Get folder statistics")
  @Description("Get comprehensive folder statistics including total count, depth, and categorization")
  @CustomAuth("Get folder statistics")
  @Returns(200, ApiResponse)
  @Returns(401, ApiResponse)
  @Returns(404, ApiResponse)
  async getFolderStats(@Context("auth") _auth: DecodedIdToken | undefined | null): Promise<ApiResponse<any>> {
    try {
      Logger.debug("Stats endpoint called with auth:", _auth?.uid);
      const stats = await this.folderService.getFolderStats(_auth?.uid as string);
      return new ApiResponse(stats, "Folder statistics retrieved successfully");
    } catch (error) {
      Logger.error("Stats endpoint error:", error.message);
      if (error.message.includes("User not found")) {
        return new ApiResponse(null, "User not found", false);
      }
      return new ApiResponse(null, error.message, false);
    }
  }

  @Post("/:id/upload-url")
  @Description("Get presigned URL for file upload to a specific folder")
  @CustomAuth("Get folder upload URL")
  @Returns(200, ApiResponse)
  @Returns(401, ApiResponse)
  @Returns(404, ApiResponse)
  async getFolderUploadUrl(
    @PathParams("id") folderId: string,
    @BodyParams() uploadData: FolderUploadUrlDto,
    @Context("auth") auth: DecodedIdToken | undefined | null
  ): Promise<ApiResponse<any>> {
    try {
      // Verify user owns this folder
      const folder = await this.folderService.getFolderById(folderId);
      if (!folder || folder.userId !== auth?.uid) {
        return new ApiResponse(null, "Folder not found or access denied");
      }

      const uploadUrl = await this.folderService.getFolderUploadUrl(folderId, uploadData.fileName);
      return new ApiResponse(uploadUrl, "Upload URL generated successfully");
    } catch (error) {
      throw error;
    }
  }

  @Post("/hierarchy")
  @Description("Create a folder hierarchy")
  @CustomAuth("Create folder hierarchy")
  @Returns(201, ApiResponse)
  @Returns(400, ApiResponse)
  @Returns(401, ApiResponse)
  async createFolderHierarchy(
    @BodyParams() hierarchyData: CreateFolderHierarchyDto,
    @Context("auth") auth: DecodedIdToken | undefined | null
  ): Promise<ApiResponse<any>> {
    try {
      const folders = await this.folderService.createFolderHierarchy(auth?.uid as string, hierarchyData.folders);
      return new ApiResponse(folders, "Folder hierarchy created successfully");
    } catch (error) {
      throw error;
    }
  }

  @Put("/:id/move")
  @Summary("Move folder to new location")
  @Description("Move a folder to a new parent location - only requires newParentId. Automatically updates paths and handles subfolders.")
  @CustomAuth("Move folder")
  @Returns(200, ApiResponse)
  @Returns(400, ApiResponse)
  @Returns(401, ApiResponse)
  @Returns(404, ApiResponse)
  async moveFolder(
    @PathParams("id") id: string,
    @BodyParams() moveData: MoveFolderDto,
    @Context("auth") _auth: DecodedIdToken | undefined | null
  ): Promise<ApiResponse<any>> {
    try {
      const folder = await this.folderService.moveFolder(id, moveData);
      return new ApiResponse(folder, "Folder moved successfully");
    } catch (error) {
      if (error.message.includes("not found")) {
        return new ApiResponse(null, error.message, false);
      }
      if (error.message.includes("circular dependency")) {
        return new ApiResponse(null, error.message, false);
      }
      if (error.message.includes("already exists")) {
        return new ApiResponse(null, error.message, false);
      }
      if (error.message.includes("different user")) {
        return new ApiResponse(null, "Access denied", false);
      }
      throw error;
    }
  }

  @Get("/:id/files")
  @Description("Get files in a specific folder")
  @CustomAuth("Get folder files")
  @Returns(200, ApiResponse)
  @Returns(401, ApiResponse)
  @Returns(404, ApiResponse)
  async getFolderFiles(
    @PathParams("id") id: string,
    @QueryParams("page") page: number = 1,
    @QueryParams("limit") limit: number = 20,
    @Context("auth") auth: DecodedIdToken | undefined | null
  ): Promise<ApiResponse<any>> {
    try {
      // Verify user owns this folder
      const folder = await this.folderService.getFolderById(id);
      if (!folder || folder.userId !== auth?.uid) {
        return new ApiResponse(null, "Folder not found or access denied");
      }

      const files = await this.folderService.getFolderFiles(id, page, limit);
      return new ApiResponse(files, "Folder files retrieved successfully");
    } catch (error) {
      throw error;
    }
  }

  @Post("/search")
  @Description("Advanced folder search")
  @CustomAuth("Search folders")
  @Returns(200, ApiResponse)
  @Returns(401, ApiResponse)
  async advancedFolderSearch(
    @BodyParams() searchData: { query: string; includeInactive?: boolean; parentId?: string },
    @Context("auth") auth: DecodedIdToken | undefined | null
  ): Promise<ApiResponse<any>> {
    try {
      const folders = await this.folderService.advancedSearch(auth?.uid as string, searchData);
      return new ApiResponse(folders, "Folder search completed successfully");
    } catch (error) {
      throw error;
    }
  }

  @Get("/:id")
  @Description("Get folder details with subfolders and files")
  @CustomAuth("Get folder details")
  @Returns(200, ApiResponse)
  @Returns(401, ApiResponse)
  @Returns(404, ApiResponse)
  async getFolderById(@PathParams("id") id: string, @Context("auth") auth: DecodedIdToken | undefined | null): Promise<ApiResponse<any>> {
    try {
      const folderDetails = await this.folderService.getFolderDetails(id, auth?.uid as string);
      if (!folderDetails) {
        return new ApiResponse(null, "Folder not found");
      }

      // Generate file URLs for all files
      const filesWithUrls = await Promise.all(
        folderDetails.files.map(async (file: any) => {
          const fileUrl = await this.fileUploadService.getSignedUrl(file.s3Key);
          return {
            ...file,
            fileUrl: fileUrl
          };
        })
      );

      return new ApiResponse(
        {
          ...folderDetails,
          files: filesWithUrls
        },
        "Folder details retrieved successfully"
      );
    } catch (error) {
      throw error;
    }
  }

  @Put("/:id")
  @Description("Update a folder")
  @CustomAuth("Update folder")
  @Returns(200, ApiResponse)
  @Returns(400, ApiResponse)
  @Returns(401, ApiResponse)
  @Returns(404, ApiResponse)
  async updateFolder(
    @PathParams("id") id: string,
    @BodyParams() folderData: UpdateUserFolderDto,
    @Context("auth") auth: DecodedIdToken | undefined | null
  ): Promise<ApiResponse<any>> {
    try {
      // Verify user owns this folder
      const existingFolder = await this.folderService.getFolderById(id);
      if (!existingFolder || existingFolder.userId !== auth?.uid) {
        return new ApiResponse(null, "Folder not found or access denied");
      }

      const folder = await this.folderService.updateFolder(id, folderData);
      return new ApiResponse(folder, "Folder updated successfully");
    } catch (error) {
      throw error;
    }
  }

  @Delete("/:id")
  @Description("Delete a folder")
  @CustomAuth("Delete folder")
  @Returns(200, ApiResponse)
  @Returns(401, ApiResponse)
  @Returns(404, ApiResponse)
  async deleteFolder(
    @PathParams("id") id: string,
    @Context("auth") auth: DecodedIdToken | undefined | null
  ): Promise<ApiResponse<boolean>> {
    try {
      // Verify user owns this folder
      const existingFolder = await this.folderService.getFolderById(id);
      if (!existingFolder || existingFolder.userId !== auth?.uid) {
        return new ApiResponse(false, "Folder not found or access denied");
      }

      const deleted = await this.folderService.deleteFolder(id);
      return new ApiResponse(deleted, deleted ? "Folder deleted successfully" : "Failed to delete folder");
    } catch (error) {
      throw error;
    }
  }
}
