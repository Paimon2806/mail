// Folder Operations Interfaces
export interface IFolderMove {
  newParentId?: string;
  newFolderPath?: string;
  preserveStructure?: boolean;
}

export interface IFolderCopy {
  targetParentId?: string;
  newFolderName: string;
  copySubfolders?: boolean;
  preserveMetadata?: boolean;
}

export interface IFolderShare {
  shareWithUserId: string;
  shareWithEmail: string;
  permission: "read" | "write" | "admin";
  expiresAt?: Date;
  message?: string;
}

export interface IFolderPermission {
  id: string;
  folderId: string;
  userId: string;
  permission: "read" | "write" | "admin";
  grantedBy: string;
  grantedAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}

// Bulk Operations
export interface IBulkFolderOperation {
  folderIds: string[];
  operation: "delete" | "move" | "copy" | "activate" | "deactivate" | "share";
  targetParentId?: string;
  shareData?: IFolderShare;
}

export interface IBulkOperationResult {
  successCount: number;
  failureCount: number;
  succeeded: string[];
  failed: Array<{ folderId: string; error: string }>;
  details?: Record<string, any>;
}

// File Operations within Folders
export interface IFolderFile {
  id: string;
  folderId: string;
  fileName: string;
  filePath: string;
  s3Key: string;
  fileSize: number;
  contentType: string;
  uploadedAt: Date;
  uploadedBy: string;
  metadata?: Record<string, any>;
  isActive: boolean;
}

export interface IFileUploadRequest {
  fileName: string;
  contentType?: string;
  fileSize?: number;
  metadata?: Record<string, any>;
}

export interface IFileUploadResponse {
  uploadUrl: string;
  key: string;
  downloadUrl: string;
  formFields?: Record<string, string>;
  expiresAt: Date;
}

// Search and Query Interfaces
export interface IFolderSearchCriteria {
  query?: string;
  userId?: string;
  parentId?: string;
  includeInactive?: boolean;
  folderType?: string;
  tags?: string[];
  dateRange?: {
    from: Date;
    to: Date;
    field: "createdAt" | "updatedAt";
  };
  metadata?: Record<string, any>;
}

export interface IFolderSearchResult {
  folders: IUserFolder[];
  totalCount: number;
  searchTime: number;
  facets?: {
    types: Record<string, number>;
    tags: Record<string, number>;
    parents: Record<string, number>;
  };
}

// Analytics and Statistics
export interface IFolderAnalytics {
  totalFolders: number;
  activeFolders: number;
  inactiveFolders: number;
  rootFolders: number;
  maxDepth: number;
  avgDepth: number;
  foldersByType: Record<string, number>;
  recentActivity: {
    created: number;
    updated: number;
    deleted: number;
    timeframe: "24h" | "7d" | "30d";
  };
  storageUsage: {
    totalFiles: number;
    totalSize: number;
    avgFilesPerFolder: number;
    avgSizePerFolder: number;
    largestFolders: Array<{
      folderId: string;
      folderName: string;
      fileCount: number;
      totalSize: number;
    }>;
  };
}

// Folder Templates and Presets
export interface IFolderPreset {
  id: string;
  name: string;
  description: string;
  category: string;
  structure: IFolderPresetItem[];
  isPublic: boolean;
  createdBy: string;
  usageCount: number;
  tags: string[];
}

export interface IFolderPresetItem {
  name: string;
  path: string;
  description?: string;
  metadata?: Record<string, any>;
  children?: IFolderPresetItem[];
}

// Folder History and Versioning
export interface IFolderHistory {
  id: string;
  folderId: string;
  action: "created" | "updated" | "moved" | "copied" | "deleted" | "shared";
  changes: Record<string, { old: any; new: any }>;
  performedBy: string;
  performedAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

// Repository Interfaces for Extended Operations
export interface IFolderOperationsRepository {
  // Bulk operations
  bulkUpdate(folderIds: string[], updates: Partial<IUserFolder>): Promise<IBulkOperationResult>;
  bulkDelete(folderIds: string[]): Promise<IBulkOperationResult>;
  bulkMove(folderIds: string[], newParentId: string): Promise<IBulkOperationResult>;

  // Search operations
  advancedSearch(criteria: IFolderSearchCriteria): Promise<IFolderSearchResult>;
  searchByMetadata(metadata: Record<string, any>): Promise<IUserFolder[]>;
  searchByTags(tags: string[]): Promise<IUserFolder[]>;

  // Analytics
  getFolderAnalytics(userId: string, timeframe?: string): Promise<IFolderAnalytics>;
  getUsageStatistics(userId: string): Promise<any>;

  // History
  getFolderHistory(folderId: string, limit?: number): Promise<IFolderHistory[]>;
  logFolderAction(folderId: string, action: string, changes: any, userId: string): Promise<void>;
}

// Service Interfaces for Extended Operations
export interface IFolderOperationsService {
  // Advanced folder operations
  moveFolder(folderId: string, moveData: IFolderMove): Promise<IUserFolder>;
  copyFolder(folderId: string, copyData: IFolderCopy): Promise<IUserFolder>;
  duplicateFolder(folderId: string, newName: string): Promise<IUserFolder>;

  // Bulk operations
  bulkOperation(userId: string, operation: IBulkFolderOperation): Promise<IBulkOperationResult>;

  // Sharing and permissions
  shareFolder(folderId: string, shareData: IFolderShare): Promise<IFolderPermission>;
  unshareFolder(folderId: string, userId: string): Promise<boolean>;
  getFolderPermissions(folderId: string): Promise<IFolderPermission[]>;
  updateFolderPermission(permissionId: string, permission: string): Promise<IFolderPermission>;

  // File operations
  getFolderFiles(folderId: string, page: number, limit: number): Promise<{ files: IFolderFile[]; pagination: any }>;
  getFileUploadUrl(folderId: string, fileData: IFileUploadRequest): Promise<IFileUploadResponse>;
  deleteFile(folderId: string, fileId: string): Promise<boolean>;

  // Search and analytics
  advancedSearch(userId: string, criteria: IFolderSearchCriteria): Promise<IFolderSearchResult>;
  getFolderAnalytics(userId: string): Promise<IFolderAnalytics>;
  exportFolderStructure(userId: string, format: "json" | "csv" | "xlsx"): Promise<any>;

  // Templates and presets
  createFolderFromPreset(userId: string, presetId: string, parentId?: string): Promise<IUserFolder[]>;
  saveFolderAsPreset(folderId: string, presetData: Partial<IFolderPreset>): Promise<IFolderPreset>;
  getFolderPresets(category?: string): Promise<IFolderPreset[]>;

  // Validation and utilities
  validateFolderStructure(folderIds: string[]): Promise<{ valid: boolean; errors: string[] }>;
  optimizeFolderStructure(userId: string): Promise<{ suggestions: string[]; applied: string[] }>;
  calculateFolderSize(folderId: string): Promise<{ fileCount: number; totalSize: number }>;
}

// Extended User Folder Interface
export interface IUserFolderExtended extends IUserFolder {
  // Computed properties
  depth?: number;
  childCount?: number;
  fileCount?: number;
  totalSize?: number;
  lastActivityAt?: Date;

  // Permissions
  permissions?: IFolderPermission[];
  sharedWith?: string[];
  isShared?: boolean;

  // Analytics
  accessCount?: number;
  lastAccessedAt?: Date;

  // History
  history?: IFolderHistory[];

  // File information
  files?: IFolderFile[];

  // Computed folder path
  fullPath?: string;
  breadcrumbs?: Array<{ id: string; name: string; path: string }>;
}

// Import the base interfaces
import { IUserFolder } from "./IOnboarding";
