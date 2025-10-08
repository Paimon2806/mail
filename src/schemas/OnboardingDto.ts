import { Property, Required, MinLength, MaxLength, Description, Enum, Allow, Example, Nullable } from "@tsed/schema";
import { QuestionType } from "../entity/OnboardingQuestion";

// Onboarding Question DTOs
export class CreateOnboardingQuestionDto {
  @Property()
  @Required()
  @MinLength(5)
  @MaxLength(500)
  @Description("The question text")
  questionText: string;

  @Property()
  @Required()
  @Enum(QuestionType)
  @Description("Type of question")
  questionType: QuestionType;

  @Property()
  @Description("Sort order for display")
  sortOrder?: number;

  @Property()
  @Description("Whether the question is active")
  isActive?: boolean;

  @Property()
  @MaxLength(1000)
  @Description("Optional description for the question")
  description?: string;

  @Property()
  @Description("Whether the question is required")
  isRequired?: boolean;

  @Property()
  @MaxLength(50)
  @Description("Icon for the question (emoji or icon name)")
  @Example("❓")
  icon?: string;
}

export class UpdateOnboardingQuestionDto {
  @Property()
  @MinLength(5)
  @MaxLength(500)
  @Description("The question text")
  questionText?: string;

  @Property()
  @Enum(QuestionType)
  @Description("Type of question")
  questionType?: QuestionType;

  @Property()
  @Description("Sort order for display")
  sortOrder?: number;

  @Property()
  @Description("Whether the question is active")
  isActive?: boolean;

  @Property()
  @MaxLength(1000)
  @Description("Optional description for the question")
  description?: string;

  @Property()
  @Description("Whether the question is required")
  isRequired?: boolean;

  @Property()
  @MaxLength(50)
  @Description("Icon for the question (emoji or icon name)")
  @Example("❓")
  icon?: string;
}

// Onboarding Question Option DTOs
export class CreateOnboardingQuestionOptionDto {
  @Property()
  @Required()
  @MinLength(1)
  @MaxLength(200)
  @Description("The option text")
  optionText: string;

  @Property()
  @Required()
  @MinLength(1)
  @MaxLength(100)
  @Description("The option value")
  optionValue: string;

  @Property()
  @Description("Sort order for display")
  sortOrder?: number;

  @Property()
  @Description("Whether the option is active")
  isActive?: boolean;

  @Property()
  @MaxLength(500)
  @Description("Optional description for the option")
  description?: string;

  @Property()
  @Required()
  @Description("Question ID this option belongs to")
  questionId: string;
}

// Folder Template DTOs
export class CreateFolderTemplateDto {
  @Property()
  @Required()
  @MinLength(1)
  @MaxLength(100)
  @Description("Name of the folder")
  folderName: string;

  @Property()
  @MaxLength(500)
  @Description("Optional folder path")
  folderPath?: string;

  @Property()
  @Description("Parent folder template ID")
  parentId?: string;

  @Property()
  @Description("Sort order for display")
  sortOrder?: number;

  @Property()
  @Description("Whether the template is active")
  isActive?: boolean;

  @Property()
  @MaxLength(500)
  @Description("Optional description for the folder")
  description?: string;

  @Property()
  @Required()
  @Description("Question option ID this template belongs to")
  questionOptionId: string;

  @Property()
  @MaxLength(200)
  @Description("S3 prefix for the folder")
  s3Prefix?: string;
}

// User Onboarding Response DTOs
export class OnboardingResponseDto {
  @Property()
  @Required()
  @Description("Question ID from the onboarding questions")
  @Example("q1-priorities")
  questionId: string;

  @Property()
  @Description("Selected option ID for single choice questions (use this OR selectedOptionIds, not both)")
  @Example("opt-self-employed")
  selectedOptionId?: string;

  @Property()
  @Description("Selected option IDs for multiple choice questions (use this OR selectedOptionId, not both)")
  @Allow("string[]")
  @Example(["opt-backup-documents", "opt-family-easier"])
  selectedOptionIds?: string[];

  @Property()
  @MaxLength(2000)
  @Description("Text response for text questions (currently not used in UI)")
  textResponse?: string;

  @Property()
  @Description("Boolean response for boolean questions (currently not used in UI)")
  booleanResponse?: boolean;
}

export class SubmitOnboardingDto {
  @Property()
  @Required()
  @Description("Array of onboarding responses - one for each question the user answered")
  @Example([
    {
      questionId: "q1-priorities",
      selectedOptionIds: ["opt-backup-documents", "opt-family-easier"]
    },
    {
      questionId: "q2-family",
      selectedOptionIds: ["opt-partner", "opt-have-children"]
    },
    {
      questionId: "q3-employment",
      selectedOptionId: "opt-self-employed"
    },
    {
      questionId: "q4-investments",
      selectedOptionIds: ["opt-shares-etfs", "opt-cryptocurrency"]
    }
  ])
  responses: OnboardingResponseDto[];
}

// User Folder DTOs
export class CreateUserFolderDto {
  @Property()
  @Required()
  @MinLength(1)
  @MaxLength(100)
  @Description("Name of the folder")
  folderName: string;

  @Property()
  @MaxLength(50)
  @Description("Folder icon (emoji or icon name)")
  folderIcon?: string;

  @Property()
  @Required()
  @MinLength(1)
  @MaxLength(500)
  @Description("Folder path")
  folderPath: string;

  @Property()
  @Description("Parent folder ID")
  parentId?: string;

  @Property()
  @MaxLength(500)
  @Description("S3 path for the folder")
  s3Path?: string;

  @Property()
  @Description("Whether the folder is active")
  isActive?: boolean;

  @Property()
  @MaxLength(500)
  @Description("Optional description for the folder")
  description?: string;

  @Property()
  @Description("Additional metadata for the folder")
  metadata?: Record<string, any>;
}

// Simplified DTO for frontend folder creation - exactly what frontend sends
export class CreateFolderFrontendDto {
  @Property()
  @Required()
  @MinLength(1)
  @MaxLength(100)
  @Description("Name of the folder")
  @Example("My Documents")
  folderName: string;

  @Property()
  @Required()
  @MaxLength(50)
  @Description("Folder icon (emoji or icon name)")
  @Example("📁")
  folderIcon: string;

  @Property()
  @Description("Parent folder ID (null for root level, omit field or set to null)")
  @Example("parent-folder-uuid")
  @Allow(null)
  parentId?: string | null;
}

// Legacy simplified DTO (keeping for backward compatibility)
export class CreateFolderSimpleDto {
  @Property()
  @Required()
  @MinLength(1)
  @MaxLength(100)
  @Description("Name of the folder")
  folderName: string;

  @Property()
  @MaxLength(50)
  @Description("Folder icon (emoji or icon name)")
  folderIcon?: string;

  @Property()
  @Description("Parent folder ID (optional)")
  parentId?: string;

  @Property()
  @MaxLength(500)
  @Description("Optional description for the folder")
  description?: string;
}

export class UpdateUserFolderDto {
  @Property()
  @MinLength(1)
  @MaxLength(100)
  @Description("Name of the folder")
  folderName?: string;

  @Property()
  @MaxLength(50)
  @Description("Folder icon (emoji or icon name)")
  folderIcon?: string;

  @Property()
  @MinLength(1)
  @MaxLength(500)
  @Description("Folder path")
  folderPath?: string;

  @Property()
  @Description("Parent folder ID")
  parentId?: string;

  @Property()
  @MaxLength(500)
  @Description("S3 path for the folder")
  s3Path?: string;

  @Property()
  @Description("Whether the folder is active")
  isActive?: boolean;

  @Property()
  @MaxLength(500)
  @Description("Optional description for the folder")
  description?: string;

  @Property()
  @Description("Additional metadata for the folder")
  metadata?: Record<string, any>;
}

// Folder Hierarchy DTOs
export class CreateFolderHierarchyDto {
  @Property()
  @Required()
  @Description("Array of folders to create in hierarchy")
  folders: CreateFolderHierarchyItemDto[];
}

export class CreateFolderHierarchyItemDto {
  @Property()
  @Required()
  @MinLength(1)
  @MaxLength(100)
  @Description("Name of the folder")
  folderName: string;

  @Property()
  @MinLength(1)
  @MaxLength(500)
  @Description("Folder path")
  folderPath?: string;

  @Property()
  @Description("Temporary ID for parent reference")
  tempId?: string;

  @Property()
  @Description("Parent temporary ID")
  parentTempId?: string;

  @Property()
  @MaxLength(500)
  @Description("Optional description for the folder")
  description?: string;

  @Property()
  @Description("Additional metadata for the folder")
  metadata?: Record<string, any>;
}

// Folder Search DTOs
export class FolderSearchDto {
  @Property()
  @Required()
  @MinLength(2)
  @MaxLength(100)
  @Description("Search term for folder name or description")
  query: string;

  @Property()
  @Description("Include inactive folders in search")
  includeInactive?: boolean;

  @Property()
  @Description("Search only in specific parent folder")
  parentId?: string;
}

// Folder Move DTOs
export class MoveFolderDto {
  @Property()
  @Description("New parent folder ID (null for root level)")
  @Example("parent-folder-uuid-123")
  newParentId?: string;
}

// Folder Copy DTOs
export class CopyFolderDto {
  @Property()
  @Description("Target parent folder ID")
  targetParentId?: string;

  @Property()
  @Required()
  @MinLength(1)
  @MaxLength(100)
  @Description("New folder name")
  newFolderName: string;

  @Property()
  @Description("Whether to copy subfolders")
  copySubfolders?: boolean;
}

// Folder Stats Response DTOs
export class FolderStorageStatsDto {
  @Property()
  @Description("Total files count")
  totalFiles?: number;

  @Property()
  @Description("Total storage used in bytes")
  totalSize?: number;

  @Property()
  @Description("Average files per folder")
  avgFilesPerFolder?: number;
}

export class FolderStatsDto {
  @Property()
  @Description("Total number of folders")
  totalFolders: number;

  @Property()
  @Description("Number of root folders")
  rootFolders: number;

  @Property()
  @Description("Maximum folder depth")
  maxDepth: number;

  @Property()
  @Description("Number of folders by type")
  foldersByType?: Record<string, number>;

  @Property()
  @Description("Storage usage statistics")
  storageStats?: FolderStorageStatsDto;
}

// Folder Upload DTOs
export class FolderUploadUrlDto {
  @Property()
  @Required()
  @MinLength(1)
  @MaxLength(255)
  @Description("Name of the file to upload")
  fileName: string;

  @Property()
  @MaxLength(100)
  @Description("Content type of the file")
  contentType?: string;

  @Property()
  @Description("File size in bytes")
  fileSize?: number;
}

export class FolderUploadResponseDto {
  @Property()
  @Description("Presigned upload URL")
  uploadUrl: string;

  @Property()
  @Description("S3 object key")
  key: string;

  @Property()
  @Description("Download URL")
  downloadUrl: string;

  @Property()
  @Description("Upload form fields for browser upload")
  formFields?: Record<string, string>;

  @Property()
  @Description("URL expiration time")
  expiresAt: Date;
}

// Folder Sharing DTOs
export class ShareFolderDto {
  @Property()
  @Required()
  @Description("Email of user to share with")
  shareWithEmail: string;

  @Property()
  @Description("Permission level: read, write, admin")
  permission?: "read" | "write" | "admin";

  @Property()
  @MaxLength(500)
  @Description("Optional message to include")
  message?: string;
}

// Bulk Operations DTOs
export class BulkFolderOperationDto {
  @Property()
  @Required()
  @Description("Array of folder IDs to operate on")
  folderIds: string[];

  @Property()
  @Required()
  @Description("Operation type")
  operation: "delete" | "move" | "copy" | "activate" | "deactivate";

  @Property()
  @Description("Target parent ID for move/copy operations")
  targetParentId?: string;
}

export class BulkFolderOperationResultDto {
  @Property()
  @Description("Number of successful operations")
  successCount: number;

  @Property()
  @Description("Number of failed operations")
  failureCount: number;

  @Property()
  @Description("Array of folder IDs that succeeded")
  succeeded: string[];

  @Property()
  @Description("Array of folder IDs that failed with error messages")
  failed: Array<{ folderId: string; error: string }>;
}
