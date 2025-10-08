import { Controller } from "@tsed/di";
import { FileUploadService } from "../../services/FileUploadService";
import { Description, Get, Post, Put, Delete, Returns, Example, Summary } from "@tsed/schema";
import { BodyParams, Context, PathParams, QueryParams } from "@tsed/platform-params";
import { DecodedIdToken } from "firebase-admin/auth";
import { CustomAuth } from "../../decorators/CustomAuth";
import {
  ApiResponse,
  FileUploadDto,
  FileUploadResponseDto,
  FileUploadConfirmationDto,
  FileDownloadResponseDto,
  FileResponseDto,
  FileUpdateDto,
  FileSearchDto,
  FileSearchResponseDto,
  MoveFileDto
} from "../../schemas";
import { BadRequestException } from "../../exceptions/AppException";

@Controller("/files")
export class FileController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post("/folders/:folderId/upload")
  @Summary("Create file upload URL")
  @Description("Generate a presigned URL for uploading a file to a specific folder (Phase 1 - No DB record created yet)")
  @CustomAuth("Upload file to folder")
  @Returns(200, ApiResponse<FileUploadResponseDto>)
  @Returns(400, ApiResponse)
  @Returns(401, ApiResponse)
  @Returns(404, ApiResponse)
  @Example({
    fileName: "document.pdf",
    contentType: "application/pdf",
    fileSize: 1024000,
    description: "Important contract document",
    tags: "contract,legal,important"
  })
  async createFileUpload(
    @PathParams("folderId") folderId: string,
    @BodyParams() uploadData: FileUploadDto,
    @Context("auth") auth: DecodedIdToken | undefined | null
  ): Promise<ApiResponse<FileUploadResponseDto>> {
    try {
      if (!auth?.uid) {
        throw new BadRequestException("Authentication required");
      }

      // Validate required fields
      if (!uploadData.fileName || uploadData.fileName.trim() === "") {
        throw new BadRequestException("fileName is required");
      }

      const result = await this.fileUploadService.createFileUpload(auth.uid, folderId, uploadData);

      return new ApiResponse(result, "Upload URL created successfully. Use the confirmation endpoint after upload.");
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      const message = error.message;
      if (message.includes("not found")) {
        return new ApiResponse<FileUploadResponseDto>(undefined as any, message, false);
      }
      if (message.includes("access denied")) {
        return new ApiResponse<FileUploadResponseDto>(undefined as any, "Access denied", false);
      }

      throw error;
    }
  }

  @Post("/confirm-upload")
  @Summary("Confirm file upload")
  @Description("Confirm successful file upload and create database record (Phase 2)")
  @CustomAuth("Confirm file upload")
  @Returns(200, ApiResponse<FileResponseDto>)
  @Returns(400, ApiResponse)
  @Returns(401, ApiResponse)
  @Returns(404, ApiResponse)
  @Example({
    s3Key: "user-id/folder-path/timestamp_filename.pdf",
    fileName: "filename.pdf",
    originalFileName: "My Document.pdf",
    contentType: "application/pdf",
    fileSize: 1024000,
    userId: "user-uuid",
    folderId: "folder-uuid",
    description: "Important document",
    tags: "important,work",
    s3Bucket: "test-bucket"
  })
  async confirmFileUpload(
    @BodyParams() confirmationData: FileUploadConfirmationDto,
    @Context("auth") auth: DecodedIdToken | undefined | null
  ): Promise<ApiResponse<FileResponseDto>> {
    try {
      if (!auth?.uid) {
        throw new BadRequestException("Authentication required");
      }

      // Validate required fields
      if (!confirmationData.s3Key || !confirmationData.fileName || !confirmationData.userId || !confirmationData.folderId) {
        throw new BadRequestException("s3Key, fileName, userId, and folderId are required");
      }

      const file = await this.fileUploadService.confirmFileUpload(auth.uid, confirmationData);

      const fileResponse: FileResponseDto = {
        id: file.id,
        fileName: file.fileName,
        originalFileName: file.originalFileName,
        contentType: file.contentType,
        fileSize: file.fileSize,
        description: file.description,
        tags: file.tags,
        downloadCount: file.downloadCount,
        isTextExtracted: file.isTextExtracted,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt
      };

      return new ApiResponse(fileResponse, "File upload confirmed and saved successfully");
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      const message = error.message;
      if (message.includes("not found")) {
        return new ApiResponse<FileResponseDto>(undefined as any, message, false);
      }
      if (message.includes("access denied")) {
        return new ApiResponse<FileResponseDto>(undefined as any, "Access denied", false);
      }
      if (message.includes("Upload may have failed")) {
        return new ApiResponse<FileResponseDto>(undefined as any, "File upload verification failed. File not found in storage.", false);
      }

      throw error;
    }
  }

  @Get("/:fileId/download")
  @Summary("Get file download URL")
  @Description("Generate a presigned URL for downloading a file")
  @CustomAuth("Download file")
  @Returns(200, ApiResponse<FileDownloadResponseDto>)
  @Returns(401, ApiResponse)
  @Returns(404, ApiResponse)
  async getFileDownloadUrl(
    @PathParams("fileId") fileId: string,
    @Context("auth") auth: DecodedIdToken | undefined | null
  ): Promise<ApiResponse<FileDownloadResponseDto>> {
    try {
      if (!auth?.uid) {
        throw new BadRequestException("Authentication required");
      }

      const result = await this.fileUploadService.getFileDownloadUrl(fileId, auth.uid);
      return new ApiResponse(result, "Download URL generated successfully");
    } catch (error) {
      const message = error.message;
      if (message.includes("not found") || message.includes("access denied")) {
        return new ApiResponse<FileDownloadResponseDto>(undefined as any, "File not found or access denied", false);
      }
      throw error;
    }
  }

  @Get("/:fileId")
  @Summary("Get file details")
  @Description("Get detailed information about a specific file")
  @CustomAuth("Get file details")
  @Returns(200, ApiResponse<FileResponseDto>)
  @Returns(401, ApiResponse)
  @Returns(404, ApiResponse)
  async getFile(
    @PathParams("fileId") fileId: string,
    @Context("auth") auth: DecodedIdToken | undefined | null
  ): Promise<ApiResponse<FileResponseDto>> {
    try {
      if (!auth?.uid) {
        throw new BadRequestException("Authentication required");
      }

      const file = await this.fileUploadService.getFile(fileId, auth.uid);
      if (!file) {
        return new ApiResponse<FileResponseDto>(undefined as any, "File not found or access denied", false);
      }

      // Generate file URL for direct access
      const fileUrl = await this.fileUploadService.getSignedUrl(file.s3Key);

      const fileResponse: FileResponseDto = {
        id: file.id,
        fileName: file.fileName,
        originalFileName: file.originalFileName,
        contentType: file.contentType,
        fileSize: file.fileSize,
        description: file.description,
        tags: file.tags,
        downloadCount: file.downloadCount,
        isTextExtracted: file.isTextExtracted,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt,
        folder: file.folder
          ? {
              id: file.folder.id,
              folderName: file.folder.folderName,
              folderPath: file.folder.folderPath
            }
          : undefined,
        fileUrl: fileUrl
      };

      return new ApiResponse(fileResponse, "File details retrieved successfully");
    } catch (error) {
      throw error;
    }
  }

  @Get("/folders/:folderId")
  @Summary("Get files in folder")
  @Description("Get all files in a specific folder")
  @CustomAuth("Get folder files")
  @Returns(200, ApiResponse<FileResponseDto[]>)
  @Returns(401, ApiResponse)
  @Returns(404, ApiResponse)
  async getFolderFiles(
    @PathParams("folderId") folderId: string,
    @Context("auth") auth: DecodedIdToken | undefined | null
  ): Promise<ApiResponse<FileResponseDto[]>> {
    try {
      if (!auth?.uid) {
        throw new BadRequestException("Authentication required");
      }

      const files = await this.fileUploadService.getFolderFiles(folderId, auth.uid);

      const fileResponses: FileResponseDto[] = await Promise.all(
        files.map(async (file) => {
          // Generate file URL for direct access
          const fileUrl = await this.fileUploadService.getSignedUrl(file.s3Key);

          return {
            id: file.id,
            fileName: file.fileName,
            originalFileName: file.originalFileName,
            contentType: file.contentType,
            fileSize: file.fileSize,
            description: file.description,
            tags: file.tags,
            downloadCount: file.downloadCount,
            isTextExtracted: file.isTextExtracted,
            createdAt: file.createdAt,
            updatedAt: file.updatedAt,
            folder: file.folder
              ? {
                  id: file.folder.id,
                  folderName: file.folder.folderName,
                  folderPath: file.folder.folderPath
                }
              : undefined,
            fileUrl: fileUrl
          };
        })
      );

      return new ApiResponse(fileResponses, "Folder files retrieved successfully");
    } catch (error) {
      const message = error.message;
      if (message.includes("not found") || message.includes("access denied")) {
        return new ApiResponse([], "Folder not found or access denied", false);
      }
      throw error;
    }
  }

  @Put("/:fileId")
  @Summary("Update file metadata")
  @Description("Update file name, description, or tags")
  @CustomAuth("Update file")
  @Returns(200, ApiResponse<FileResponseDto>)
  @Returns(401, ApiResponse)
  @Returns(404, ApiResponse)
  @Example({
    fileName: "updated-document.pdf",
    description: "Updated contract document",
    tags: "contract,legal,updated"
  })
  async updateFile(
    @PathParams("fileId") fileId: string,
    @BodyParams() updateData: FileUpdateDto,
    @Context("auth") auth: DecodedIdToken | undefined | null
  ): Promise<ApiResponse<FileResponseDto>> {
    try {
      if (!auth?.uid) {
        throw new BadRequestException("Authentication required");
      }

      const updatedFile = await this.fileUploadService.updateFile(fileId, auth.uid, updateData);
      if (!updatedFile) {
        return new ApiResponse<FileResponseDto>(undefined as any, "File not found or access denied", false);
      }

      const fileResponse: FileResponseDto = {
        id: updatedFile.id,
        fileName: updatedFile.fileName,
        originalFileName: updatedFile.originalFileName,
        contentType: updatedFile.contentType,
        fileSize: updatedFile.fileSize,
        description: updatedFile.description,
        tags: updatedFile.tags,
        downloadCount: updatedFile.downloadCount,
        isTextExtracted: updatedFile.isTextExtracted,
        createdAt: updatedFile.createdAt,
        updatedAt: updatedFile.updatedAt
      };

      return new ApiResponse(fileResponse, "File updated successfully");
    } catch (error) {
      const message = error.message;
      if (message.includes("not found") || message.includes("access denied")) {
        return new ApiResponse<FileResponseDto>(undefined as any, "File not found or access denied", false);
      }
      throw error;
    }
  }

  @Put("/:fileId/move")
  @Summary("Move file to another folder")
  @Description("Move a file from one folder to another folder")
  @CustomAuth("Move file")
  @Returns(200, ApiResponse<FileResponseDto>)
  @Returns(401, ApiResponse)
  @Returns(404, ApiResponse)
  @Example({
    targetFolderId: "folder-uuid-456"
  })
  async moveFile(
    @PathParams("fileId") fileId: string,
    @BodyParams() moveData: MoveFileDto,
    @Context("auth") auth: DecodedIdToken | undefined | null
  ): Promise<ApiResponse<FileResponseDto>> {
    try {
      if (!auth?.uid) {
        throw new BadRequestException("Authentication required");
      }

      const movedFile = await this.fileUploadService.moveFile(fileId, moveData.targetFolderId, auth.uid);
      if (!movedFile) {
        return new ApiResponse<FileResponseDto>(undefined as any, "File not found or access denied", false);
      }

      // Generate file URL for direct access
      const fileUrl = await this.fileUploadService.getSignedUrl(movedFile.s3Key);

      const fileResponse: FileResponseDto = {
        id: movedFile.id,
        fileName: movedFile.fileName,
        originalFileName: movedFile.originalFileName,
        contentType: movedFile.contentType,
        fileSize: movedFile.fileSize,
        description: movedFile.description,
        tags: movedFile.tags,
        downloadCount: movedFile.downloadCount,
        isTextExtracted: movedFile.isTextExtracted,
        createdAt: movedFile.createdAt,
        updatedAt: movedFile.updatedAt,
        folder: movedFile.folder
          ? {
              id: movedFile.folder.id,
              folderName: movedFile.folder.folderName,
              folderPath: movedFile.folder.folderPath
            }
          : undefined,
        fileUrl: fileUrl
      };

      return new ApiResponse(fileResponse, "File moved successfully");
    } catch (error) {
      const message = error.message;
      if (message.includes("not found") || message.includes("access denied")) {
        return new ApiResponse<FileResponseDto>(undefined as any, "File not found or access denied", false);
      }
      if (message.includes("Target folder not found")) {
        return new ApiResponse<FileResponseDto>(undefined as any, "Target folder not found or access denied", false);
      }
      throw error;
    }
  }

  @Delete("/:fileId")
  @Summary("Delete file")
  @Description("Delete a file from storage and database")
  @CustomAuth("Delete file")
  @Returns(200, ApiResponse<boolean>)
  @Returns(401, ApiResponse)
  @Returns(404, ApiResponse)
  async deleteFile(
    @PathParams("fileId") fileId: string,
    @Context("auth") auth: DecodedIdToken | undefined | null
  ): Promise<ApiResponse<boolean>> {
    try {
      if (!auth?.uid) {
        throw new BadRequestException("Authentication required");
      }

      const success = await this.fileUploadService.deleteFile(fileId, auth.uid);
      return new ApiResponse(success, success ? "File deleted successfully" : "Failed to delete file");
    } catch (error) {
      const message = error.message;
      if (message.includes("not found") || message.includes("access denied")) {
        return new ApiResponse(false, "File not found or access denied", false);
      }
      throw error;
    }
  }

  @Post("/search")
  @Summary("Search files")
  @Description("Search files by name, description, or tags")
  @CustomAuth("Search files")
  @Returns(200, ApiResponse<FileSearchResponseDto>)
  @Returns(401, ApiResponse)
  @Example({
    query: "contract",
    folderId: "folder-uuid",
    contentType: "application/pdf"
  })
  async searchFiles(
    @BodyParams() searchData: FileSearchDto,
    @Context("auth") auth: DecodedIdToken | undefined | null
  ): Promise<ApiResponse<FileSearchResponseDto>> {
    try {
      if (!auth?.uid) {
        throw new BadRequestException("Authentication required");
      }

      if (!searchData.query || searchData.query.trim() === "") {
        throw new BadRequestException("Search query is required");
      }

      const files = await this.fileUploadService.searchFiles(auth.uid, searchData.query);

      const fileResponses: FileResponseDto[] = await Promise.all(
        files.map(async (file) => {
          // Generate file URL for direct access
          const fileUrl = await this.fileUploadService.getSignedUrl(file.s3Key);

          return {
            id: file.id,
            fileName: file.fileName,
            originalFileName: file.originalFileName,
            contentType: file.contentType,
            fileSize: file.fileSize,
            description: file.description,
            tags: file.tags,
            downloadCount: file.downloadCount,
            isTextExtracted: file.isTextExtracted,
            createdAt: file.createdAt,
            updatedAt: file.updatedAt,
            folder: file.folder
              ? {
                  id: file.folder.id,
                  folderName: file.folder.folderName,
                  folderPath: file.folder.folderPath
                }
              : undefined,
            fileUrl: fileUrl
          };
        })
      );

      const searchResponse: FileSearchResponseDto = {
        files: fileResponses,
        total: fileResponses.length,
        query: searchData.query
      };

      return new ApiResponse(searchResponse, "Search completed successfully");
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw error;
    }
  }
}
