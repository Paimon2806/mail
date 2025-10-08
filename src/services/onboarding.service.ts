import { Injectable, Inject } from "@tsed/di";
import { OnboardingRepository } from "../repositories/onboarding.repository";
import { UserFolderRepository } from "../repositories/user-folder.repository";
import { UserRepository } from "../repositories/user.repository";
import { FileUploadService } from "./FileUploadService";
import {
  IOnboardingQuestion,
  IUserOnboardingResponse,
  IOnboardingResult,
  IOnboardingSubmissionResponse,
  ICreateUserOnboardingResponse,
  IUserFolder,
  ICreateUserFolder
} from "../interface/IOnboarding";
import { OnboardingQuestion } from "../entity/OnboardingQuestion";
import { UserOnboardingResponse } from "../entity/UserOnboardingResponse";
import { FolderTemplate } from "../entity/FolderTemplate";
import { UserFolder } from "../entity/UserFolder";

@Injectable()
export class OnboardingService {
  constructor(
    private readonly onboardingRepository: OnboardingRepository,
    private readonly userFolderRepository: UserFolderRepository,
    private readonly userRepository: UserRepository,
    private readonly fileUploadService: FileUploadService
  ) {}

  /**
   * Get all active onboarding questions with their options
   */
  async getOnboardingQuestions(): Promise<OnboardingQuestion[]> {
    try {
      return await this.onboardingRepository.findActiveQuestions();
    } catch (error) {
      throw new Error(`Failed to fetch onboarding questions: ${error.message}`);
    }
  }

  /**
   * Submit user onboarding responses and create corresponding folders
   */
  async submitOnboardingResponses(userId: string, responses: IOnboardingSubmissionResponse[]): Promise<IOnboardingResult> {
    try {
      // Check if user exists
      const user = await this.userRepository.findByFirebaseUid(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Check if user has already completed onboarding
      if (user.isOnboardingCompleted) {
        return {
          success: false,
          message: "User has already completed onboarding",
          foldersCreated: [],
          onboardingCompleted: false
        };
      }

      // Delete any existing responses for this user
      await this.onboardingRepository.deleteUserResponses(user.id);

      // Create new responses
      const userResponses: UserOnboardingResponse[] = [];

      for (const response of responses) {
        const responseData: ICreateUserOnboardingResponse = {
          userId: user.id,
          questionId: response.questionId,
          selectedOptionId: response.selectedOptionId,
          selectedOptionIds: response.selectedOptionIds,
          textResponse: response.textResponse || undefined,
          booleanResponse: response.booleanResponse || undefined
        };

        const savedResponse = await this.onboardingRepository.createUserResponse(responseData);
        userResponses.push(savedResponse);
      }

      // Get folder templates based on responses
      const folderTemplates = await this.onboardingRepository.findFolderTemplatesByResponses(userResponses);

      // Create user folders based on templates
      const createdFolders = await this.createUserFoldersFromTemplates(user.id, folderTemplates);

      // Mark onboarding as completed
      await this.userRepository.updateById(user.id, {
        isOnboardingCompleted: true,
        onboardingCompletedAt: new Date()
      });

      return {
        success: true,
        message: "Onboarding completed successfully",
        foldersCreated: createdFolders,
        onboardingCompleted: true
      };
    } catch (error) {
      throw new Error(`Failed to submit onboarding responses: ${error.message}`);
    }
  }

  /**
   * Get user onboarding status and responses
   */
  async getUserOnboardingStatus(userId: string): Promise<{
    isCompleted: boolean;
    responses: UserOnboardingResponse[];
    questions: OnboardingQuestion[];
  }> {
    try {
      const user = await this.userRepository.findByFirebaseUid(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const responses = await this.onboardingRepository.findUserResponses(user.id);
      const questions = await this.getOnboardingQuestions();

      return {
        isCompleted: user.isOnboardingCompleted || false,
        responses,
        questions
      };
    } catch (error) {
      throw new Error(`Failed to get user onboarding status: ${error.message}`);
    }
  }

  /**
   * Create user folders from folder templates
   */
  async createUserFoldersFromTemplates(userId: string, templates: FolderTemplate[]): Promise<UserFolder[]> {
    try {
      const createdFolders: UserFolder[] = [];
      const folderMap = new Map<string, UserFolder>(); // template ID -> created folder

      // Sort templates by hierarchy (parents first)
      const sortedTemplates = this.sortTemplatesByHierarchy(templates);

      for (const template of sortedTemplates) {
        const folderPath = await this.generateFolderPath(template, folderMap);

        const folderData: ICreateUserFolder = {
          folderName: template.folderName,
          folderPath,
          userId,
          parentId: template.parentId ? folderMap.get(template.parentId)?.id : undefined,
          description: template.description || undefined,
          folderIcon: template.folderIcon || undefined,
          s3Path: template.s3Prefix
            ? `${userId}/${template.s3Prefix}/${this.sanitizeForS3(template.folderName)}`
            : `${userId}/${this.sanitizeForS3(template.folderName)}`,
          isActive: true,
          metadata: {
            templateId: template.id,
            questionOptionId: template.questionOptionId,
            createdFromOnboarding: true
          }
        };

        const createdFolder = await this.userFolderRepository.create(folderData);
        createdFolders.push(createdFolder);
        folderMap.set(template.id, createdFolder);

        // Create S3 folder structure (optional)
        await this.createS3FolderStructure(createdFolder.s3Path || "");
      }

      return createdFolders;
    } catch (error) {
      throw new Error(`Failed to create user folders from templates: ${error.message}`);
    }
  }

  /**
   * Sort templates by hierarchy to ensure parents are created before children
   */
  private sortTemplatesByHierarchy(templates: FolderTemplate[]): FolderTemplate[] {
    const sorted: FolderTemplate[] = [];
    const templateMap = new Map(templates.map((t) => [t.id, t]));
    const processed = new Set<string>();

    const processTemplate = (template: FolderTemplate) => {
      if (processed.has(template.id)) return;

      // If has parent, process parent first
      if (template.parentId && templateMap.has(template.parentId)) {
        const parent = templateMap.get(template.parentId)!;
        if (!processed.has(parent.id)) {
          processTemplate(parent);
        }
      }

      sorted.push(template);
      processed.add(template.id);
    };

    templates.forEach(processTemplate);
    return sorted;
  }

  /**
   * Generate folder path based on template and parent structure
   */
  private async generateFolderPath(template: FolderTemplate, folderMap: Map<string, UserFolder>): Promise<string> {
    let path = template.folderName;

    if (template.parentId && folderMap.has(template.parentId)) {
      const parentFolder = folderMap.get(template.parentId)!;
      path = `${parentFolder.folderPath}/${template.folderName}`;
    } else if (template.folderPath) {
      path = template.folderPath;
    }

    return path;
  }

  /**
   * Create S3 folder structure (placeholder folder)
   */
  private async createS3FolderStructure(s3Path: string): Promise<void> {
    try {
      // S3 doesn't have actual folders, but we can create a placeholder file
      // This is optional and depends on your S3 strategy
      // You might want to implement this based on your file upload service
      console.log(`S3 folder structure created for: ${s3Path}`);
    } catch (error) {
      console.error(`Failed to create S3 folder structure: ${error.message}`);
      // Don't throw error here as folder creation should continue
    }
  }

  /**
   * Update user onboarding responses
   */
  async updateOnboardingResponses(userId: string, responses: IOnboardingSubmissionResponse[]): Promise<IOnboardingResult> {
    try {
      const user = await this.userRepository.findByFirebaseUid(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Delete existing folders created from onboarding
      const existingFolders = await this.userFolderRepository.findByUserId(user.id);
      const onboardingFolders = existingFolders.filter((folder) => folder.metadata?.createdFromOnboarding === true);

      for (const folder of onboardingFolders) {
        await this.userFolderRepository.delete(folder.id);
      }

      // Reset onboarding completion status
      await this.userRepository.updateById(user.id, {
        isOnboardingCompleted: false,
        onboardingCompletedAt: undefined
      });

      // Submit new responses
      return await this.submitOnboardingResponses(userId, responses);
    } catch (error) {
      throw new Error(`Failed to update onboarding responses: ${error.message}`);
    }
  }

  /**
   * Get folder recommendations based on user responses
   */
  async getFolderRecommendations(userId: string): Promise<FolderTemplate[]> {
    try {
      const user = await this.userRepository.findByFirebaseUid(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const responses = await this.onboardingRepository.findUserResponses(user.id);
      return await this.onboardingRepository.findFolderTemplatesByResponses(responses);
    } catch (error) {
      throw new Error(`Failed to get folder recommendations: ${error.message}`);
    }
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
}
