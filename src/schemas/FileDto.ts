import { Property, Required, MinLength, MaxLength, Description, Example } from "@tsed/schema";

// File Upload DTOs
export class FileUploadDto {
  @Property()
  @Required()
  @MinLength(1)
  @MaxLength(255)
  @Description("Name of the file to upload")
  @Example("document.pdf")
  fileName: string;

  @Property()
  @MaxLength(100)
  @Description("Content type of the file")
  @Example("application/pdf")
  contentType?: string;

  @Property()
  @Description("File size in bytes")
  @Example(1024000)
  fileSize?: number;

  @Property()
  @MaxLength(500)
  @Description("Optional description for the file")
  @Example("Important contract document")
  description?: string;

  @Property()
  @Description("Tags for the file (comma-separated)")
  @Example("contract,legal,important")
  tags?: string;
}

export class FileUploadResponseDto {
  @Property()
  @Description("Presigned upload URL")
  uploadUrl: string;

  @Property()
  @Description("S3 object key")
  key: string;

  @Property()
  @Description("Temporary file ID for tracking (use confirmation endpoint after upload)")
  fileId: string;

  @Property()
  @Description("Upload expiration time")
  expiresAt: Date;

  @Property()
  @Description("Form fields containing metadata for confirmation after upload")
  formFields?: Record<string, string>;
}

// File Upload Confirmation DTO
export class FileUploadConfirmationDto {
  @Property()
  @Required()
  @Description("S3 object key")
  @Example("user-id/folder-path/timestamp_filename.pdf")
  s3Key: string;

  @Property()
  @Required()
  @Description("Sanitized file name")
  @Example("filename.pdf")
  fileName: string;

  @Property()
  @Required()
  @Description("Original file name")
  @Example("My Document.pdf")
  originalFileName: string;

  @Property()
  @Description("Content type")
  @Example("application/pdf")
  contentType?: string;

  @Property()
  @Description("File size in bytes")
  @Example(1024000)
  fileSize?: number;

  @Property()
  @Required()
  @Description("User ID")
  @Example("user-uuid-123")
  userId: string;

  @Property()
  @Required()
  @Description("Folder ID")
  @Example("folder-uuid-456")
  folderId: string;

  @Property()
  @Description("File description")
  @Example("Important document")
  description?: string;

  @Property()
  @Description("File tags")
  @Example("important,work")
  tags?: string;

  @Property()
  @Required()
  @Description("S3 bucket name")
  @Example("test-bucket")
  s3Bucket: string;
}

// File Response DTOs
export class FileResponseDto {
  @Property()
  @Description("File ID")
  id: string;

  @Property()
  @Description("File name")
  fileName: string;

  @Property()
  @Description("Original file name")
  originalFileName: string;

  @Property()
  @Description("Content type")
  contentType?: string;

  @Property()
  @Description("File size in bytes")
  fileSize: number;

  @Property()
  @Description("File description")
  description?: string;

  @Property()
  @Description("File tags")
  tags?: string;

  @Property()
  @Description("Download count")
  downloadCount?: number;

  @Property()
  @Description("Whether text has been extracted")
  isTextExtracted: boolean;

  @Property()
  @Description("Upload date")
  createdAt: Date;

  @Property()
  @Description("Last update date")
  updatedAt: Date;

  @Property()
  @Description("Folder information")
  folder?: {
    id: string;
    folderName: string;
    folderPath: string;
  };

  @Property()
  @Description("Direct file URL for viewing/downloading")
  fileUrl?: string;
}

export class MoveFileDto {
  @Property()
  @Required()
  @Description("Target folder ID to move the file to")
  @Example("folder-uuid-456")
  targetFolderId: string;
}

export class FileDownloadResponseDto {
  @Property()
  @Description("Download URL")
  downloadUrl: string;

  @Property()
  @Description("File name")
  fileName: string;

  @Property()
  @Description("Content type")
  contentType?: string;

  @Property()
  @Description("URL expiration time")
  expiresAt: Date;
}

// File Update DTOs
export class FileUpdateDto {
  @Property()
  @MaxLength(255)
  @Description("New file name")
  fileName?: string;

  @Property()
  @MaxLength(500)
  @Description("File description")
  description?: string;

  @Property()
  @Description("File tags (comma-separated)")
  tags?: string;
}

// File Search DTOs
export class FileSearchDto {
  @Property()
  @Required()
  @MinLength(1)
  @Description("Search query")
  @Example("contract")
  query: string;

  @Property()
  @Description("Folder ID to search within")
  folderId?: string;

  @Property()
  @Description("File type filter")
  contentType?: string;
}

export class FileSearchResponseDto {
  @Property()
  @Description("Search results")
  files: FileResponseDto[];

  @Property()
  @Description("Total number of results")
  total: number;

  @Property()
  @Description("Search query used")
  query: string;
}

// File Statistics DTOs
export class FileStatsDto {
  @Property()
  @Description("Total number of files")
  totalFiles: number;

  @Property()
  @Description("Total storage used in bytes")
  totalSize: number;

  @Property()
  @Description("Files by type")
  filesByType: Record<string, number>;

  @Property()
  @Description("Storage by folder")
  storageByFolder?: Record<string, number>;
}

// Bulk File Operations DTOs
export class BulkFileOperationDto {
  @Property()
  @Required()
  @Description("Array of file IDs")
  fileIds: string[];

  @Property()
  @Description("Target folder ID for move operations")
  targetFolderId?: string;
}

export class BulkFileOperationResponseDto {
  @Property()
  @Description("Number of files processed successfully")
  successCount: number;

  @Property()
  @Description("Number of files that failed to process")
  failureCount: number;

  @Property()
  @Description("Details of failed operations")
  failures?: Array<{
    fileId: string;
    error: string;
  }>;
}

// Text Extraction DTOs
export class TextExtractionResponseDto {
  @Property()
  @Description("Whether text extraction was started")
  success: boolean;

  @Property()
  @Description("Textract job ID")
  jobId?: string;

  @Property()
  @Description("Extracted text (if available)")
  extractedText?: string;

  @Property()
  @Description("Status message")
  message: string;
}
