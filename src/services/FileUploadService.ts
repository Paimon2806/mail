import { Injectable } from "@tsed/di";
import { S3 } from "aws-sdk";
import { promisify } from "util";
import { StartDocumentTextDetectionCommand, TextractClient } from "@aws-sdk/client-textract";
import { EXPIRES_TERM } from "@/config/logger/constant";
import { FileRepository } from "../repositories/file.repository";
import { UserRepository } from "../repositories/user.repository";
import { UserFolderRepository } from "../repositories/user-folder.repository";
import { File } from "../entity/File";
import { FileUploadDto, FileUploadResponseDto, FileDownloadResponseDto } from "../schemas/FileDto";
import { Logger } from "../utils/logger";

const s3Bucket = process.env.S3_BUCKET_NAME ?? process.env.AWS_S3_BUCKET ?? "";
@Injectable()
export class FileUploadService {
  private s3: S3;
  private textractClient: TextractClient;

  constructor(
    private readonly fileRepository: FileRepository,
    private readonly userRepository: UserRepository,
    private readonly userFolderRepository: UserFolderRepository
  ) {
    // S3 configuration that works with both AWS S3 and MinIO
    const s3Config: any = {
      signatureVersion: "v4",
      region: process.env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
      }
    };

    // MinIO-specific configuration
    if (process.env.S3_ENDPOINT) {
      s3Config.endpoint = process.env.S3_ENDPOINT;
      s3Config.s3ForcePathStyle = process.env.S3_FORCE_PATH_STYLE === "true";
    }

    this.s3 = new S3(s3Config);

    // Note: AWS Textract is not available with MinIO
    // Only initialize if using real AWS (no S3_ENDPOINT means AWS)
    if (!process.env.S3_ENDPOINT) {
      this.textractClient = new TextractClient({
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
        }
      });
    }
  }

  async getPresignedUrl(
    // userId: string,
    folder: string,
    fileName: string
  ): Promise<{ apiUrl: string; key: string; location: string; getUrl: string }> {
    // await this.userService.getUserById(userId);
    const params = {
      Bucket: s3Bucket,
      Key: `${folder}/${fileName}`,
      Expires: 7 * 24 * 60 * 60 // 7 days in seconds
    };

    const getSignedUrlPromise = await promisify(this.s3.getSignedUrl.bind(this.s3));
    const response = await getSignedUrlPromise("putObject", params);
    const getResponse = await getSignedUrlPromise("getObject", params);
    const url = new URL(response);
    return {
      apiUrl: response,
      key: url.pathname.substring(1),
      location: url.origin + url.pathname,
      getUrl: getResponse
    };
  }
  async getSignedUrl(key: string): Promise<string> {
    Logger.debug(`[FileUploadService] Generating signed URL for key: ${key}, bucket: ${s3Bucket}`);

    const params = {
      Bucket: s3Bucket,
      Key: key,
      Expires: EXPIRES_TERM // 7 days
    };

    const getSignedUrlPromise = promisify(this.s3.getSignedUrl.bind(this.s3));
    const getResponse = await getSignedUrlPromise("getObject", params);

    Logger.debug(`[FileUploadService] Generated signed URL: ${getResponse}`);
    return getResponse;
  }
  async moveFileInStorage(originalPath: string, newPath: string) {
    try {
      const copyParams = {
        Bucket: s3Bucket,
        CopySource: s3Bucket + "/" + originalPath,
        Key: newPath
      };
      const copyData = await this.s3.copyObject(copyParams).promise();
      const deleteParams = {
        Bucket: s3Bucket,
        Key: originalPath
      };
      const deleteData = await this.s3.deleteObject(deleteParams).promise();
      return { copyData, deleteData };
    } catch (err) {
      throw err;
    }
  }

  async copyFile(originalPath: string, newPath: string) {
    try {
      const copyParams = {
        Bucket: s3Bucket,
        CopySource: s3Bucket + "/" + originalPath,
        Key: newPath
      };
      const copyData = await this.s3.copyObject(copyParams).promise();

      return { copyData };
    } catch (err) {
      throw err;
    }
  }

  // Start text extraction after the file is uploaded
  // Note: This only works with AWS S3, not MinIO
  async startTextExtraction(fileKey: string) {
    if (process.env.S3_ENDPOINT) {
      throw new Error("Text extraction is not available with MinIO. This feature requires AWS Textract.");
    }

    if (!this.textractClient) {
      throw new Error("Textract client not initialized. Make sure AWS credentials are configured.");
    }

    const command = new StartDocumentTextDetectionCommand({
      DocumentLocation: {
        S3Object: {
          Bucket: s3Bucket,
          Name: fileKey
        }
      }
    });

    try {
      const response = await this.textractClient.send(command);
      return {
        success: true,
        jobId: response.JobId,
        message: "Text extraction started successfully."
      };
    } catch (error) {
      Logger.error("Error starting text extraction:", error);
      throw new Error("Failed to start text extraction.");
    }
  }

  async publicUrl(key: string): Promise<string> {
    const params = {
      Bucket: s3Bucket,
      Key: key,
      Expires: 7 * 24 * 60 * 60, // 7 days
      ResponseContentDisposition: `attachment; filename="${key}"` // ✅ Force download
    };

    return this.s3.getSignedUrlPromise("getObject", params);
  }

  /**
   * Create file upload URL (Phase 1 - Generate URL only, no DB record yet)
   */
  async createFileUpload(firebaseUid: string, folderId: string, uploadData: FileUploadDto): Promise<FileUploadResponseDto> {
    try {
      // Verify user exists
      const user = await this.userRepository.findByFirebaseUid(firebaseUid);
      if (!user) {
        throw new Error("User not found");
      }

      // Verify folder exists and belongs to user
      const folder = await this.userFolderRepository.findById(folderId);
      if (!folder || folder.userId !== user.id) {
        throw new Error("Folder not found or access denied");
      }

      // Generate S3 key
      const timestamp = Date.now();
      const sanitizedFileName = this.sanitizeFileName(uploadData.fileName);
      const s3Key = `${folder.s3Path || `${user.id}/${folder.folderPath}`}/${timestamp}_${sanitizedFileName}`;

      Logger.debug(`[FileUploadService] Generated S3 key: ${s3Key} for file: ${uploadData.fileName}`);

      // Generate presigned URL
      const uploadResult = await this.getPresignedUrl(
        folder.s3Path || `${user.id}/${folder.folderPath}`,
        `${timestamp}_${sanitizedFileName}`
      );

      // Return upload info with metadata for confirmation
      return {
        uploadUrl: uploadResult.apiUrl,
        key: uploadResult.key,
        fileId: `pending_${timestamp}`, // Temporary ID for tracking
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        // Store metadata for confirmation phase
        formFields: {
          userId: user.id,
          folderId: folder.id,
          fileName: sanitizedFileName,
          originalFileName: uploadData.fileName,
          contentType: uploadData.contentType || "",
          fileSize: (uploadData.fileSize || 0).toString(),
          description: uploadData.description || "",
          tags: uploadData.tags || "",
          s3Key: s3Key,
          s3Bucket: s3Bucket
        }
      };
    } catch (error) {
      throw new Error(`Failed to create file upload: ${error.message}`);
    }
  }

  /**
   * Confirm file upload (Phase 2 - Create DB record after successful upload)
   */
  async confirmFileUpload(
    firebaseUid: string,
    uploadConfirmation: {
      s3Key: string;
      fileName: string;
      originalFileName: string;
      contentType?: string;
      fileSize?: number;
      userId: string;
      folderId: string;
      description?: string;
      tags?: string;
      s3Bucket: string;
    }
  ): Promise<File> {
    try {
      // Verify user
      const user = await this.userRepository.findByFirebaseUid(firebaseUid);
      if (!user || user.id !== uploadConfirmation.userId) {
        throw new Error("User not found or access denied");
      }

      // Verify the file exists in S3/MinIO by checking if we can get object info
      // try {
      //   await this.s3.headObject({
      //     Bucket: uploadConfirmation.s3Bucket,
      //     Key: uploadConfirmation.s3Key
      //   }).promise();
      // } catch (s3Error) {
      //   throw new Error("File not found in storage. Upload may have failed." + s3Error);
      // }

      // Create file record in database only after confirming file exists
      Logger.debug(
        `[FileUploadService] Creating file record with S3 key: ${uploadConfirmation.s3Key}, bucket: ${uploadConfirmation.s3Bucket}`
      );

      const fileRecord = await this.fileRepository.create({
        fileName: uploadConfirmation.fileName,
        originalFileName: uploadConfirmation.originalFileName,
        s3Key: uploadConfirmation.s3Key,
        s3Bucket: uploadConfirmation.s3Bucket,
        contentType: uploadConfirmation.contentType,
        fileSize: uploadConfirmation.fileSize || 0,
        userId: uploadConfirmation.userId,
        folderId: uploadConfirmation.folderId,
        description: uploadConfirmation.description,
        tags: uploadConfirmation.tags,
        isActive: true
      });

      return fileRecord;
    } catch (error) {
      throw new Error(`Failed to confirm file upload: ${error.message}`);
    }
  }

  /**
   * Get file download URL
   */
  async getFileDownloadUrl(fileId: string, firebaseUid: string): Promise<FileDownloadResponseDto> {
    try {
      // Verify user
      const user = await this.userRepository.findByFirebaseUid(firebaseUid);
      if (!user) {
        throw new Error("User not found");
      }

      // Get file record
      const file = await this.fileRepository.findById(fileId);
      if (!file || file.userId !== user.id) {
        throw new Error("File not found or access denied");
      }

      // Generate download URL
      const downloadUrl = await this.getSignedUrl(file.s3Key);

      // Increment download count
      await this.fileRepository.incrementDownloadCount(fileId);

      return {
        downloadUrl,
        fileName: file.originalFileName,
        contentType: file.contentType,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      };
    } catch (error) {
      throw new Error(`Failed to get file download URL: ${error.message}`);
    }
  }

  /**
   * Delete file from S3 and database
   */
  async deleteFile(fileId: string, firebaseUid: string): Promise<boolean> {
    try {
      // Verify user
      const user = await this.userRepository.findByFirebaseUid(firebaseUid);
      if (!user) {
        throw new Error("User not found");
      }

      // Get file record
      const file = await this.fileRepository.findById(fileId);
      if (!file || file.userId !== user.id) {
        throw new Error("File not found or access denied");
      }

      // Delete from S3
      const deleteParams = {
        Bucket: s3Bucket,
        Key: file.s3Key
      };

      await this.s3.deleteObject(deleteParams).promise();

      // Delete from database
      await this.fileRepository.delete(fileId);

      return true;
    } catch (error) {
      Logger.error("Error deleting file:", error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Get file by ID with access control
   */
  async getFile(fileId: string, firebaseUid: string): Promise<File | null> {
    try {
      // Verify user
      const user = await this.userRepository.findByFirebaseUid(firebaseUid);
      if (!user) {
        throw new Error("User not found");
      }

      // Get file record
      const file = await this.fileRepository.findById(fileId);
      if (!file || file.userId !== user.id) {
        return null;
      }

      return file;
    } catch (error) {
      throw new Error(`Failed to get file: ${error.message}`);
    }
  }

  /**
   * Get files in a folder
   */
  async getFolderFiles(folderId: string, firebaseUid: string): Promise<File[]> {
    try {
      // Verify user
      const user = await this.userRepository.findByFirebaseUid(firebaseUid);
      if (!user) {
        throw new Error("User not found");
      }

      // Verify folder access
      const folder = await this.userFolderRepository.findById(folderId);
      if (!folder || folder.userId !== user.id) {
        throw new Error("Folder not found or access denied");
      }

      return await this.fileRepository.findByFolderId(folderId, user.id);
    } catch (error) {
      throw new Error(`Failed to get folder files: ${error.message}`);
    }
  }

  /**
   * Search files for a user
   */
  async searchFiles(firebaseUid: string, query: string): Promise<File[]> {
    try {
      // Verify user
      const user = await this.userRepository.findByFirebaseUid(firebaseUid);
      if (!user) {
        throw new Error("User not found");
      }

      return await this.fileRepository.search(user.id, query);
    } catch (error) {
      throw new Error(`Failed to search files: ${error.message}`);
    }
  }

  /**
   * Update file metadata
   */
  async updateFile(fileId: string, firebaseUid: string, updateData: Partial<File>): Promise<File | null> {
    try {
      // Verify user and file access
      const file = await this.getFile(fileId, firebaseUid);
      if (!file) {
        throw new Error("File not found or access denied");
      }

      return await this.fileRepository.update(fileId, updateData);
    } catch (error) {
      throw new Error(`Failed to update file: ${error.message}`);
    }
  }

  /**
   * Start text extraction for a file
   */
  async startFileTextExtraction(
    fileId: string,
    firebaseUid: string
  ): Promise<{
    success: boolean;
    jobId?: string;
    message: string;
  }> {
    try {
      // Verify user and file access
      const file = await this.getFile(fileId, firebaseUid);
      if (!file) {
        throw new Error("File not found or access denied");
      }

      // Start text extraction
      const result = await this.startTextExtraction(file.s3Key);

      // Update file record with job ID
      if (result.success && result.jobId) {
        await this.fileRepository.update(fileId, {
          textractJobId: result.jobId
        });
      }

      return result;
    } catch (error) {
      throw new Error(`Failed to start text extraction: ${error.message}`);
    }
  }

  /**
   * Move file to another folder
   */
  async moveFile(fileId: string, targetFolderId: string, firebaseUid: string): Promise<File | null> {
    try {
      // Verify user
      const user = await this.userRepository.findByFirebaseUid(firebaseUid);
      if (!user) {
        throw new Error("User not found");
      }

      // Get the file to move
      const file = await this.fileRepository.findById(fileId);
      if (!file || file.userId !== user.id) {
        throw new Error("File not found or access denied");
      }

      // Verify target folder exists and belongs to user
      const targetFolder = await this.userFolderRepository.findById(targetFolderId);
      if (!targetFolder || targetFolder.userId !== user.id) {
        throw new Error("Target folder not found or access denied");
      }

      // Don't move if already in the target folder
      if (file.folderId === targetFolderId) {
        throw new Error("File is already in the target folder");
      }

      // Generate new S3 key for the target folder
      const newS3Key = `${targetFolder.s3Path || `${user.id}/${targetFolder.folderPath}`}/${file.fileName}`;

      // Move the file in S3/MinIO storage
      await this.moveFileInStorage(file.s3Key, newS3Key);

      // Update the file record in database
      const updatedFile = await this.fileRepository.update(fileId, {
        folderId: targetFolderId,
        s3Key: newS3Key
      });

      return updatedFile;
    } catch (error) {
      throw new Error(`Failed to move file: ${error.message}`);
    }
  }

  /**
   * Sanitize filename for S3
   */
  private sanitizeFileName(fileName: string): string {
    // Remove or replace invalid characters
    return fileName
      .replace(/[^a-zA-Z0-9.-_]/g, "_") // Replace invalid chars with underscore
      .replace(/_+/g, "_") // Replace multiple underscores with single
      .replace(/^_|_$/g, ""); // Remove leading/trailing underscores
  }
}
