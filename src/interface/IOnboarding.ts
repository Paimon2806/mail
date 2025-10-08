import { QuestionType } from "../entity/OnboardingQuestion";

// Onboarding Question Interfaces
export interface IOnboardingQuestion {
  id: string;
  questionText: string;
  questionType: QuestionType;
  sortOrder: number;
  isActive: boolean;
  description?: string;
  isRequired: boolean;
  icon?: string;
  options: IOnboardingQuestionOption[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateOnboardingQuestion {
  questionText: string;
  questionType: QuestionType;
  sortOrder?: number;
  isActive?: boolean;
  description?: string;
  isRequired?: boolean;
  icon?: string;
}

export interface IUpdateOnboardingQuestion {
  questionText?: string;
  questionType?: QuestionType;
  sortOrder?: number;
  isActive?: boolean;
  description?: string;
  isRequired?: boolean;
  icon?: string;
}

// Onboarding Question Option Interfaces
export interface IOnboardingQuestionOption {
  id: string;
  optionText: string;
  optionValue: string;
  sortOrder: number;
  isActive: boolean;
  description?: string;
  questionId: string;
  folderTemplates: IFolderTemplate[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateOnboardingQuestionOption {
  optionText: string;
  optionValue: string;
  sortOrder?: number;
  isActive?: boolean;
  description?: string;
  questionId: string;
}

export interface IUpdateOnboardingQuestionOption {
  optionText?: string;
  optionValue?: string;
  sortOrder?: number;
  isActive?: boolean;
  description?: string;
}

// Folder Template Interfaces
export interface IFolderTemplate {
  id: string;
  folderName: string;
  folderPath?: string;
  parentId?: string;
  parent?: IFolderTemplate;
  children: IFolderTemplate[];
  sortOrder: number;
  isActive: boolean;
  description?: string;
  questionOptionId: string;
  s3Prefix?: string;
  folderIcon?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateFolderTemplate {
  folderName: string;
  folderPath?: string;
  parentId?: string;
  sortOrder?: number;
  isActive?: boolean;
  description?: string;
  questionOptionId: string;
  s3Prefix?: string;
  folderIcon?: string;
}

export interface IUpdateFolderTemplate {
  folderName?: string;
  folderPath?: string;
  parentId?: string;
  sortOrder?: number;
  isActive?: boolean;
  description?: string;
  s3Prefix?: string;
  folderIcon?: string;
}

// User Folder Interfaces
export interface IUserFolder {
  id: string;
  folderName: string;
  folderIcon?: string;
  folderPath: string;
  parentId?: string;
  parent?: IUserFolder;
  children: IUserFolder[];
  userId: string;
  s3Path?: string;
  isActive: boolean;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateUserFolder {
  folderName: string;
  folderIcon?: string;
  folderPath: string;
  parentId?: string;
  userId: string;
  s3Path?: string;
  isActive?: boolean;
  description?: string;
  metadata?: Record<string, any>;
}

export interface IUpdateUserFolder {
  folderName?: string;
  folderIcon?: string;
  folderPath?: string;
  parentId?: string;
  s3Path?: string;
  isActive?: boolean;
  description?: string;
  metadata?: Record<string, any>;
}

// User Onboarding Response Interfaces
export interface IUserOnboardingResponse {
  id: string;
  userId: string;
  questionId: string;
  selectedOptionId?: string;
  selectedOptionIds?: string[];
  textResponse?: string;
  booleanResponse?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateUserOnboardingResponse {
  userId: string;
  questionId: string;
  selectedOptionId?: string;
  selectedOptionIds?: string[];
  textResponse?: string;
  booleanResponse?: boolean;
}

export interface IUpdateUserOnboardingResponse {
  selectedOptionId?: string;
  selectedOptionIds?: string[];
  textResponse?: string;
  booleanResponse?: boolean;
}

// Onboarding Flow Interfaces
export interface IOnboardingFlow {
  questions: IOnboardingQuestion[];
  currentQuestionIndex: number;
  totalQuestions: number;
  completedQuestions: number;
  isCompleted: boolean;
}

export interface IOnboardingSubmission {
  responses: IOnboardingSubmissionResponse[];
}

export interface IOnboardingSubmissionResponse {
  questionId: string;
  selectedOptionId?: string;
  selectedOptionIds?: string[];
  textResponse?: string;
  booleanResponse?: boolean;
}

export interface IOnboardingResult {
  success: boolean;
  message: string;
  foldersCreated: IUserFolder[];
  onboardingCompleted: boolean;
}

// Repository Interfaces
export interface IOnboardingQuestionRepository {
  create(data: ICreateOnboardingQuestion): Promise<IOnboardingQuestion>;
  findAll(): Promise<IOnboardingQuestion[]>;
  findById(id: string): Promise<IOnboardingQuestion | null>;
  findActiveQuestions(): Promise<IOnboardingQuestion[]>;
  update(id: string, data: IUpdateOnboardingQuestion): Promise<IOnboardingQuestion | null>;
  delete(id: string): Promise<boolean>;
}

export interface IUserFolderRepository {
  create(data: ICreateUserFolder): Promise<IUserFolder>;
  findByUserId(userId: string): Promise<IUserFolder[]>;
  findById(id: string): Promise<IUserFolder | null>;
  findByPath(userId: string, path: string): Promise<IUserFolder | null>;
  update(id: string, data: IUpdateUserFolder): Promise<IUserFolder | null>;
  delete(id: string): Promise<boolean>;
}

export interface IUserOnboardingResponseRepository {
  create(data: ICreateUserOnboardingResponse): Promise<IUserOnboardingResponse>;
  findByUserId(userId: string): Promise<IUserOnboardingResponse[]>;
  findByUserAndQuestion(userId: string, questionId: string): Promise<IUserOnboardingResponse | null>;
  update(id: string, data: IUpdateUserOnboardingResponse): Promise<IUserOnboardingResponse | null>;
  delete(id: string): Promise<boolean>;
}

// Service Interfaces
export interface IOnboardingService {
  getOnboardingQuestions(): Promise<IOnboardingQuestion[]>;
  submitOnboardingResponses(userId: string, responses: IOnboardingSubmissionResponse[]): Promise<IOnboardingResult>;
  getUserOnboardingStatus(userId: string): Promise<{ isCompleted: boolean; responses: IUserOnboardingResponse[] }>;
  createUserFoldersFromResponses(userId: string, responses: IUserOnboardingResponse[]): Promise<IUserFolder[]>;
}

export interface IFolderService {
  createFolder(data: ICreateUserFolder): Promise<IUserFolder>;
  getUserFolders(userId: string): Promise<IUserFolder[]>;
  getFolderById(id: string): Promise<IUserFolder | null>;
  updateFolder(id: string, data: IUpdateUserFolder): Promise<IUserFolder | null>;
  deleteFolder(id: string): Promise<boolean>;
  createFolderHierarchy(userId: string, templates: IFolderTemplate[]): Promise<IUserFolder[]>;
}
