/**
 * @file Application interfaces
 */

// User Interfaces
export * from "./IUser";

// Onboarding Interfaces
export * from "./IOnboarding";

// Folder Operations Interfaces
export * from "./IFolderOperations";

// Milestone Interfaces
export * from "./IMilestone";
export * from "./IMilestoneCategory";

// Re-export commonly used interfaces
export type {
  IUser,
  ICreateUser,
  IUpdateUser,
  IUserResponse,
  IUserProfile,
  IUserAuth,
  IUserRegistration,
  IUserLogin,
  IUserSearch,
  IUserFilter,
  IUserPagination,
  IUserStats,
  IUserRepository,
  IUserService,
  IUserValidation,
  IUserError,
  IUserSuccessResponse,
  IUserErrorResponse,
  IUserListResponse
} from "./IUser";

export type {
  IOnboardingQuestion,
  IOnboardingQuestionOption,
  IFolderTemplate,
  IUserFolder,
  IUserOnboardingResponse,
  IOnboardingFlow,
  IOnboardingSubmission,
  IOnboardingResult,
  IOnboardingService,
  IFolderService
} from "./IOnboarding";

export type {
  IFolderMove,
  IFolderCopy,
  IFolderShare,
  IFolderPermission,
  IBulkFolderOperation,
  IBulkOperationResult,
  IFolderFile,
  IFileUploadRequest,
  IFileUploadResponse,
  IFolderSearchCriteria,
  IFolderSearchResult,
  IFolderAnalytics,
  IFolderPreset,
  IFolderHistory,
  IFolderOperationsRepository,
  IFolderOperationsService,
  IUserFolderExtended
} from "./IFolderOperations";

export type {
  IMilestone,
  ICreateMilestone,
  IUpdateMilestone,
  IMilestoneResponse,
  IMilestoneSearchFilters,
  IMilestoneStats,
  IMilestoneCategory,
  IMilestoneTag
} from "./IMilestone";
