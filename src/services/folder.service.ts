import { Injectable, Inject } from "@tsed/di";
import { UserFolderRepository } from "../repositories/user-folder.repository";
import { UserRepository } from "../repositories/user.repository";
import { FileRepository } from "../repositories/file.repository";
import { BillRepository } from "../repositories/bill.repository";
import { FileUploadService } from "./FileUploadService";
import { Logger } from "../utils/logger";
import { IUserFolder, ICreateUserFolder, IUpdateUserFolder } from "../interface/IOnboarding";
import {
  MoveFolderDto,
  CopyFolderDto,
  BulkFolderOperationDto,
  BulkFolderOperationResultDto,
  ShareFolderDto,
  FolderStatsDto,
  FolderStorageStatsDto
} from "../schemas/OnboardingDto";
import { UserFolder } from "../entity/UserFolder";

@Injectable()
export class FolderService {
  constructor(
    private readonly userFolderRepository: UserFolderRepository,
    private readonly userRepository: UserRepository,
    private readonly fileRepository: FileRepository,
    private readonly billRepository: BillRepository,
    private readonly fileUploadService: FileUploadService
  ) {}

  /**
   * Create a new user folder
   */
  async createFolder(data: ICreateUserFolder): Promise<UserFolder> {
    try {
      // Check if folder path already exists for this user
      const existingFolder = await this.userFolderRepository.findByPath(data.userId, data.folderPath);
      if (existingFolder) {
        throw new Error("Folder with this path already exists");
      }

      // Generate S3 path if not provided
      if (!data.s3Path) {
        data.s3Path = `${data.userId}/${data.folderPath}`;
      }

      const folder = await this.userFolderRepository.create(data);

      // Create S3 folder structure
      await this.createS3FolderStructure(folder.s3Path || "");

      return folder;
    } catch (error) {
      throw new Error(`Failed to create folder: ${error.message}`);
    }
  }

  /**
   * Create a folder with simplified input (only folderName required)
   */
  async createFolderSimple(
    firebaseUid: string,
    data: {
      folderName: string;
      folderIcon?: string;
      parentId?: string;
      description?: string;
    }
  ): Promise<UserFolder> {
    try {
      // Find user by Firebase UID
      const user = await this.userRepository.findByFirebaseUid(firebaseUid);
      if (!user) {
        throw new Error("User not found");
      }

      // Generate folder path
      let folderPath = this.sanitizeForS3(data.folderName);
      let s3Path = `${user.id}/${this.sanitizeForS3(data.folderName)}`;

      // If parent folder is specified, build nested path
      if (data.parentId) {
        const parentFolder = await this.userFolderRepository.findById(data.parentId);
        if (!parentFolder) {
          throw new Error("Parent folder not found");
        }
        if (parentFolder.userId !== user.id) {
          throw new Error("Parent folder does not belong to user");
        }
        folderPath = `${parentFolder.folderPath}/${this.sanitizeForS3(data.folderName)}`;
        s3Path = `${parentFolder.s3Path}/${this.sanitizeForS3(data.folderName)}`;
      }

      // Check if folder path already exists
      const existingFolder = await this.userFolderRepository.findByPath(user.id, folderPath);
      if (existingFolder) {
        throw new Error("Folder with this name already exists in this location");
      }

      const folderData: ICreateUserFolder = {
        folderName: data.folderName,
        folderIcon: data.folderIcon,
        folderPath,
        userId: user.id,
        parentId: data.parentId,
        s3Path,
        isActive: true,
        description: data.description,
        metadata: {
          createdFromFrontend: true
        }
      };

      const folder = await this.userFolderRepository.create(folderData);

      // Create S3 folder structure
      await this.createS3FolderStructure(folder.s3Path || "");

      return folder;
    } catch (error) {
      throw new Error(`Failed to create folder: ${error.message}`);
    }
  }

  /**
   * Get all folders for a user with bills included
   */
  async getUserFolders(firebaseUid: string): Promise<UserFolder[]> {
    try {
      // Find user by Firebase UID
      const user = await this.userRepository.findByFirebaseUid(firebaseUid);
      if (!user) {
        throw new Error("User not found");
      }

      const folders = await this.userFolderRepository.findByUserId(user.id);
      
      // Add bills to each folder
      for (const folder of folders) {
        const bills = await this.billRepository.findByFolder(folder.id, user.id);
        (folder as any).bills = bills;
      }

      return folders;
    } catch (error) {
      throw new Error(`Failed to get user folders: ${error.message}`);
    }
  }

  /**
   * Get folder hierarchy for a user
   */
  async getUserFolderHierarchy(firebaseUid: string): Promise<UserFolder[]> {
    try {
      // Find user by Firebase UID
      const user = await this.userRepository.findByFirebaseUid(firebaseUid);
      if (!user) {
        throw new Error("User not found");
      }

      return await this.userFolderRepository.getFolderHierarchy(user.id);
    } catch (error) {
      throw new Error(`Failed to get user folder hierarchy: ${error.message}`);
    }
  }

  /**
   * Get root folders for a user (folders without parents)
   */
  async getRootFolders(firebaseUid: string, includeChildren: boolean = false): Promise<UserFolder[]> {
    try {
      // Find user by Firebase UID
      const user = await this.userRepository.findByFirebaseUid(firebaseUid);
      if (!user) {
        throw new Error("User not found");
      }

      return await this.userFolderRepository.findRootFolders(user.id, includeChildren);
    } catch (error) {
      throw new Error(`Failed to get root folders: ${error.message}`);
    }
  }

  /**
   * Get folder by ID
   */
  async getFolderById(id: string, firebaseUid?: string): Promise<UserFolder | null> {
    try {
      const folder = await this.userFolderRepository.findById(id);

      if (!folder) {
        return null;
      }

      // If Firebase UID is provided, verify the user owns this folder
      if (firebaseUid) {
        const user = await this.userRepository.findByFirebaseUid(firebaseUid);
        if (!user || folder.userId !== user.id) {
          throw new Error("Access denied");
        }
      }

      return folder;
    } catch (error) {
      throw new Error(`Failed to get folder: ${error.message}`);
    }
  }

  /**
   * Get folder details with subfolders, files, and bills
   */
  async getFolderDetails(
    id: string,
    firebaseUid: string
  ): Promise<{
    folder: UserFolder;
    subfolders: UserFolder[];
    files: any[];
    bills: any[];
  } | null> {
    try {
      // Find user by Firebase UID
      const user = await this.userRepository.findByFirebaseUid(firebaseUid);
      if (!user) {
        throw new Error("User not found");
      }

      // Get the main folder
      const folder = await this.userFolderRepository.findById(id);
      if (!folder) {
        return null;
      }

      // Verify ownership
      if (folder.userId !== user.id) {
        throw new Error("Access denied");
      }

      // Get subfolders
      const subfolders = await this.userFolderRepository.findByParentId(id);

      // Get files in this folder
      const files = await this.fileRepository.findByFolderId(id, user.id);

      // Get bills in this folder
      const bills = await this.billRepository.findByFolder(id, user.id);

      return {
        folder,
        subfolders,
        files,
        bills
      };
    } catch (error) {
      throw new Error(`Failed to get folder details: ${error.message}`);
    }
  }

  /**
   * Update folder
   */
  async updateFolder(id: string, data: IUpdateUserFolder): Promise<UserFolder | null> {
    try {
      const folder = await this.userFolderRepository.findById(id);
      if (!folder) {
        throw new Error("Folder not found");
      }

      // If folder path is being updated, check for conflicts
      if (data.folderPath && data.folderPath !== folder.folderPath) {
        const existingFolder = await this.userFolderRepository.findByPath(folder.userId, data.folderPath);
        if (existingFolder && existingFolder.id !== id) {
          throw new Error("Folder with this path already exists");
        }
      }

      // Update S3 path if folder path changes
      if (data.folderPath && data.folderPath !== folder.folderPath) {
        data.s3Path = `${folder.userId}/${data.folderPath}`;

        // Move S3 folder if needed
        if (folder.s3Path) {
          await this.moveS3Folder(folder.s3Path, data.s3Path);
        }
      }

      return await this.userFolderRepository.update(id, data);
    } catch (error) {
      throw new Error(`Failed to update folder: ${error.message}`);
    }
  }

  /**
   * Delete folder (soft delete)
   */
  async deleteFolder(id: string): Promise<boolean> {
    try {
      const folder = await this.userFolderRepository.findById(id);
      if (!folder) {
        throw new Error("Folder not found");
      }

      // Check if folder has children
      const children = await this.userFolderRepository.findByParentId(id);
      if (children.length > 0) {
        throw new Error("Cannot delete folder with subfolders. Delete subfolders first.");
      }

      return await this.userFolderRepository.delete(id);
    } catch (error) {
      throw new Error(`Failed to delete folder: ${error.message}`);
    }
  }

  /**
   * Get subfolders of a parent folder
   */
  async getSubfolders(parentId: string): Promise<UserFolder[]> {
    try {
      return await this.userFolderRepository.findByParentId(parentId);
    } catch (error) {
      throw new Error(`Failed to get subfolders: ${error.message}`);
    }
  }

  /**
   * Search folders by name or description
   */
  async searchFolders(userId: string, searchTerm: string): Promise<UserFolder[]> {
    try {
      return await this.userFolderRepository.searchFolders(userId, searchTerm);
    } catch (error) {
      throw new Error(`Failed to search folders: ${error.message}`);
    }
  }

  /**
   * Get folder statistics
   */
  async getFolderStats(firebaseUid: string): Promise<FolderStatsDto> {
    try {
      Logger.debug("Getting stats for Firebase UID:", firebaseUid);

      // Find user by Firebase UID
      const user = await this.userRepository.findByFirebaseUid(firebaseUid);
      if (!user) {
        Logger.warn("User not found for Firebase UID:", firebaseUid);
        throw new Error("User not found for stats");
      }

      Logger.debug("Found user:", user.id);

      const totalFolders = await this.userFolderRepository.getFolderCount(user.id);
      const rootFolders = await this.userFolderRepository.findRootFolders(user.id);
      const allFolders = await this.userFolderRepository.findByUserId(user.id);

      Logger.debug("Stats data:", { totalFolders, rootFoldersCount: rootFolders.length, allFoldersCount: allFolders.length });

      // Calculate max depth
      let maxDepth = 0;
      for (const folder of allFolders) {
        const depth = this.calculateFolderDepth(folder, allFolders);
        maxDepth = Math.max(maxDepth, depth);
      }

      // Calculate folders by type (based on metadata)
      const foldersByType: Record<string, number> = {};
      allFolders.forEach((folder) => {
        const type = folder.metadata?.category || "general";
        foldersByType[type] = (foldersByType[type] || 0) + 1;
      });

      const storageStats: FolderStorageStatsDto = {
        totalFiles: 0, // Will be implemented with file tracking
        totalSize: 0,
        avgFilesPerFolder: 0
      };

      return {
        totalFolders,
        rootFolders: rootFolders.length,
        maxDepth,
        foldersByType,
        storageStats
      };
    } catch (error) {
      throw new Error(`Failed to get folder statistics: ${error.message}`);
    }
  }

  /**
   * Create folder hierarchy from templates
   */
  async createFolderHierarchy(userId: string, folderData: any[]): Promise<UserFolder[]> {
    try {
      const createdFolders: UserFolder[] = [];
      const folderMap = new Map<string, string>(); // temp ID -> real ID

      // Sort by hierarchy level (parents first)
      const sortedData = this.sortByHierarchy(folderData);

      for (const data of sortedData) {
        const createData: ICreateUserFolder = {
          ...data,
          userId,
          parentId: data.parentTempId ? folderMap.get(data.parentTempId) : undefined
        };

        const folder = await this.createFolder(createData);
        createdFolders.push(folder);

        if (data.tempId) {
          folderMap.set(data.tempId, folder.id);
        }
      }

      return createdFolders;
    } catch (error) {
      throw new Error(`Failed to create folder hierarchy: ${error.message}`);
    }
  }

  /**
   * Get presigned URL for file upload to a specific folder
   */
  async getFolderUploadUrl(
    folderId: string,
    fileName: string
  ): Promise<{
    apiUrl: string;
    key: string;
    location: string;
    getUrl: string;
  }> {
    try {
      const folder = await this.userFolderRepository.findById(folderId);
      if (!folder) {
        throw new Error("Folder not found");
      }

      const s3Folder = folder.s3Path || `${folder.userId}/${folder.folderPath}`;
      return await this.fileUploadService.getPresignedUrl(s3Folder, fileName);
    } catch (error) {
      throw new Error(`Failed to get folder upload URL: ${error.message}`);
    }
  }

  // Private helper methods

  private async moveS3Folder(oldPath: string, newPath: string): Promise<void> {
    try {
      // Implementation would depend on your S3 file management strategy
      // You might need to move all files in the folder
      Logger.debug(`S3 folder would be moved from ${oldPath} to ${newPath}`);
    } catch (error) {
      Logger.error(`Failed to move S3 folder: ${error.message}`);
    }
  }

  private calculateFolderDepth(folder: UserFolder, allFolders: UserFolder[]): number {
    if (!folder.parentId) return 1;

    const parent = allFolders.find((f) => f.id === folder.parentId);
    if (!parent) return 1;

    return 1 + this.calculateFolderDepth(parent, allFolders);
  }

  private sortByHierarchy(folderData: any[]): any[] {
    const sorted: any[] = [];
    const processed = new Set<string>();

    const processFolder = (data: any) => {
      if (!data.tempId || processed.has(data.tempId)) return;

      // If has parent, process parent first
      if (data.parentTempId) {
        const parent = folderData.find((f) => f.tempId === data.parentTempId);
        if (parent && !processed.has(parent.tempId)) {
          processFolder(parent);
        }
      }

      sorted.push(data);
      processed.add(data.tempId);
    };

    folderData.forEach(processFolder);
    return sorted;
  }

  /**
   * Move folder to a new location (automatically generates paths)
   */
  async moveFolder(folderId: string, moveData: MoveFolderDto): Promise<UserFolder | null> {
    try {
      const folder = await this.userFolderRepository.findById(folderId);
      if (!folder) {
        throw new Error("Folder not found");
      }

      // Handle null/undefined/empty parentId for root level
      const newParentId =
        !moveData.newParentId || moveData.newParentId === null || moveData.newParentId === undefined ? undefined : moveData.newParentId;

      // Check for circular dependency
      if (newParentId) {
        const isCircular = await this.checkCircularDependency(folderId, newParentId);
        if (isCircular) {
          throw new Error("Cannot move folder: would create circular dependency");
        }

        // Verify new parent exists and belongs to same user
        const newParent = await this.userFolderRepository.findById(newParentId);
        if (!newParent) {
          throw new Error("New parent folder not found");
        }
        if (newParent.userId !== folder.userId) {
          throw new Error("Cannot move folder to different user's folder");
        }
      }

      // Generate new folder path and S3 path
      let newFolderPath: string;
      let newS3Path: string;

      if (newParentId) {
        // Moving to a parent folder
        const parentFolder = await this.userFolderRepository.findById(newParentId);
        newFolderPath = `${parentFolder!.folderPath}/${this.sanitizeForS3(folder.folderName)}`;
        newS3Path = `${parentFolder!.s3Path}/${this.sanitizeForS3(folder.folderName)}`;
      } else {
        // Moving to root level
        newFolderPath = `/${this.sanitizeForS3(folder.folderName)}`;
        newS3Path = `${folder.userId}/${this.sanitizeForS3(folder.folderName)}`;
      }

      // Check if the new path already exists
      const existingFolder = await this.userFolderRepository.findByPath(folder.userId, newFolderPath);
      if (existingFolder && existingFolder.id !== folderId) {
        throw new Error("A folder with this name already exists in the destination");
      }

      const updateData: IUpdateUserFolder = {
        parentId: newParentId,
        folderPath: newFolderPath,
        s3Path: newS3Path
      };

      // Update the folder
      const updatedFolder = await this.userFolderRepository.update(folderId, updateData);

      // Update all child folders' paths recursively
      await this.updateChildrenPaths(folderId);

      // Move S3 folder structure (if needed)
      if (folder.s3Path && folder.s3Path !== newS3Path) {
        await this.moveS3Folder(folder.s3Path, newS3Path);
      }

      return updatedFolder;
    } catch (error) {
      throw new Error(`Failed to move folder: ${error.message}`);
    }
  }

  /**
   * Copy folder to a new location
   */
  async copyFolder(folderId: string, copyData: CopyFolderDto): Promise<UserFolder> {
    try {
      const sourceFolder = await this.userFolderRepository.findById(folderId);
      if (!sourceFolder) {
        throw new Error("Source folder not found");
      }

      const newFolderData: ICreateUserFolder = {
        folderName: copyData.newFolderName,
        folderPath: `${copyData.targetParentId ? "subfolder" : "root"}/${copyData.newFolderName}`,
        userId: sourceFolder.userId,
        parentId: copyData.targetParentId,
        description: sourceFolder.description,
        metadata: { ...sourceFolder.metadata, copiedFrom: folderId },
        s3Path: `${sourceFolder.userId}/${copyData.newFolderName}`
      };

      const newFolder = await this.userFolderRepository.create(newFolderData);

      // Copy subfolders if requested
      if (copyData.copySubfolders) {
        const subfolders = await this.userFolderRepository.findByParentId(folderId);
        for (const subfolder of subfolders) {
          await this.copyFolder(subfolder.id, {
            targetParentId: newFolder.id,
            newFolderName: subfolder.folderName,
            copySubfolders: true
          });
        }
      }

      return newFolder;
    } catch (error) {
      throw new Error(`Failed to copy folder: ${error.message}`);
    }
  }

  /**
   * Perform bulk operations on folders
   */
  async bulkFolderOperation(userId: string, operationData: BulkFolderOperationDto): Promise<BulkFolderOperationResultDto> {
    const result: BulkFolderOperationResultDto = {
      successCount: 0,
      failureCount: 0,
      succeeded: [],
      failed: []
    };

    for (const folderId of operationData.folderIds) {
      try {
        // Verify user owns the folder
        const folder = await this.userFolderRepository.findById(folderId);
        if (!folder || folder.userId !== userId) {
          throw new Error("Folder not found or access denied");
        }

        switch (operationData.operation) {
          case "delete":
            await this.userFolderRepository.delete(folderId);
            break;
          case "activate":
            await this.userFolderRepository.update(folderId, { isActive: true });
            break;
          case "deactivate":
            await this.userFolderRepository.update(folderId, { isActive: false });
            break;
          case "move":
            if (operationData.targetParentId) {
              await this.userFolderRepository.update(folderId, { parentId: operationData.targetParentId });
            }
            break;
          default:
            throw new Error(`Unsupported operation: ${operationData.operation}`);
        }

        result.successCount++;
        result.succeeded.push(folderId);
      } catch (error) {
        result.failureCount++;
        result.failed.push({ folderId, error: error.message });
      }
    }

    return result;
  }

  /**
   * Share folder with another user
   */
  async shareFolder(folderId: string, shareData: ShareFolderDto): Promise<{ success: boolean; message: string }> {
    try {
      // This is a placeholder implementation
      // In a real system, you'd create a folder_shares table and handle permissions
      Logger.info(`Sharing folder ${folderId} with ${shareData.shareWithEmail} with ${shareData.permission} permission`);

      return {
        success: true,
        message: `Folder shared with ${shareData.shareWithEmail}`
      };
    } catch (error) {
      throw new Error(`Failed to share folder: ${error.message}`);
    }
  }

  /**
   * Get files in a folder with pagination
   */
  async getFolderFiles(
    folderId: string,
    page: number,
    limit: number
  ): Promise<{
    files: any[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    try {
      const folder = await this.userFolderRepository.findById(folderId);
      if (!folder) {
        throw new Error("Folder not found");
      }

      // Get all files in the folder (we'll implement pagination later if needed)
      const allFiles = await this.fileRepository.findByFolderId(folderId);
      const totalFiles = allFiles.length;

      // Simple pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const files = allFiles.slice(startIndex, endIndex);

      return {
        files,
        pagination: {
          page,
          limit,
          total: totalFiles,
          totalPages: Math.ceil(totalFiles / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to get folder files: ${error.message}`);
    }
  }

  /**
   * Advanced folder search
   */
  async advancedSearch(
    userId: string,
    searchData: {
      query: string;
      includeInactive?: boolean;
      parentId?: string;
    }
  ): Promise<UserFolder[]> {
    try {
      return await this.userFolderRepository.searchFolders(userId, searchData.query);
    } catch (error) {
      throw new Error(`Failed to perform advanced search: ${error.message}`);
    }
  }

  /**
   * Update paths for all child folders recursively when parent is moved
   */
  private async updateChildrenPaths(parentId: string): Promise<void> {
    try {
      const parent = await this.userFolderRepository.findById(parentId);
      if (!parent) return;

      const children = await this.userFolderRepository.findByParentId(parentId);

      for (const child of children) {
        // Generate new paths based on updated parent
        const newFolderPath = `${parent.folderPath}/${this.sanitizeForS3(child.folderName)}`;
        const newS3Path = `${parent.s3Path}/${this.sanitizeForS3(child.folderName)}`;

        // Update child folder
        await this.userFolderRepository.update(child.id, {
          folderPath: newFolderPath,
          s3Path: newS3Path
        });

        // Recursively update grandchildren
        await this.updateChildrenPaths(child.id);
      }
    } catch (error) {
      Logger.error(`Failed to update children paths for parent ${parentId}:`, error);
    }
  }

  /**
   * Check for circular dependency when moving folders
   */
  private async checkCircularDependency(folderId: string, newParentId: string): Promise<boolean> {
    if (folderId === newParentId) return true;

    const parent = await this.userFolderRepository.findById(newParentId);
    if (!parent || !parent.parentId) return false;

    return this.checkCircularDependency(folderId, parent.parentId);
  }

  /**
   * Sanitize folder names for S3 paths (remove spaces and special characters)
   */
  private sanitizeForS3(folderName: string): string {
    return folderName
      .toLowerCase()
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/[^a-z0-9\-_]/g, "") // Remove special characters except hyphens and underscores
      .replace(/--+/g, "-") // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
  }

  /**
   * Create S3 folder structure (placeholder)
   */
  private async createS3FolderStructure(s3Path: string): Promise<void> {
    try {
      // This is a placeholder for S3 folder creation
      Logger.debug(`S3 folder structure created: ${s3Path}`);
    } catch (error) {
      Logger.error(`Failed to create S3 folder structure: ${error.message}`);
    }
  }
}
