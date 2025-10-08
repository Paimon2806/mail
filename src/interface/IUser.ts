import { User } from "../entity/User";

// Base User Interface
export interface IUser {
  id: string;
  firebaseUid: string;
  email?: string;
  fullName: string;
  country?: string;
  avatar?: string;
  emailNotification?: boolean;
  billNotification?: boolean;
  lastLoginAt?: Date;
  isOnboardingCompleted: boolean;
  onboardingCompletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// User Creation Interface
export interface ICreateUser {
  firebaseUid: string;
  email?: string;
  fullName: string;
  country?: string;
  avatar?: string;
  emailNotification?: boolean;
  billNotification?: boolean;
}

// User Update Interface
export interface IUpdateUser {
  email?: string;
  fullName?: string;
  country?: string;
  avatar?: string;
  emailNotification?: boolean;
  billNotification?: boolean;
  lastLoginAt?: Date;
  isOnboardingCompleted?: boolean;
  onboardingCompletedAt?: Date;
}

// User Response Interface (without sensitive data)
export interface IUserResponse {
  id: string;
  firebaseUid: string;
  email?: string;
  fullName: string;
  country?: string;
  avatar?: string;
  emailNotification?: boolean;
  billNotification?: boolean;
  lastLoginAt?: Date;
  isOnboardingCompleted: boolean;
  onboardingCompletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// User Profile Interface
export interface IUserProfile {
  id: string;
  firebaseUid: string;
  email?: string;
  fullName: string;
  country?: string;
  avatar?: string;
  lastLoginAt?: Date;
}

// User Registration Interface (simplified without password)
export interface IUserRegistration {
  firebaseUid: string;
  email?: string;
  fullName: string;
  country?: string;
  emailNotification?: boolean;
  billNotification?: boolean;
}

// User Search Interface
export interface IUserSearch {
  query: string;
  country?: string;
  emailNotification?: boolean;
  billNotification?: boolean;
}

// User Filter Interface
export interface IUserFilter {
  country?: string;
  emailNotification?: boolean;
  billNotification?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
  lastLoginAfter?: Date;
  lastLoginBefore?: Date;
}

// User Pagination Interface
export interface IUserPagination {
  page: number;
  limit: number;
  sortBy?: "fullName" | "email" | "country" | "createdAt" | "lastLoginAt";
  sortOrder?: "ASC" | "DESC";
}

// User Statistics Interface
export interface IUserStats {
  totalUsers: number;
  usersByCountry: { [country: string]: number };
  recentRegistrations: number;
  lastLoginStats: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  notificationStats: {
    emailNotificationEnabled: number;
    billNotificationEnabled: number;
  };
}

// User Repository Interface
export interface IUserRepository {
  create(userData: ICreateUser): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  updateById(id: string, userData: IUpdateUser): Promise<User | null>;
  updateLastLogin(id: string): Promise<void>;
  deleteById(id: string): Promise<boolean>;
  emailExists(email: string): Promise<boolean>;
  count(): Promise<number>;
  search(query: string): Promise<User[]>;
  findByCountry(country: string): Promise<User[]>;
}

// User Service Interface
export interface IUserService {
  createUser(userData: ICreateUser, firebaseUid: string): Promise<IUserResponse>;
  getUserById(id: string): Promise<IUserResponse | null>;
  getUserByEmail(email: string): Promise<IUserResponse | null>;
  updateUser(id: string, userData: IUpdateUser): Promise<IUserResponse | null>;
  deleteUser(id: string): Promise<boolean>;
  searchUsers(searchData: IUserSearch): Promise<IUserResponse[]>;
  getUserStats(): Promise<IUserStats>;
  updateLastLogin(id: string): Promise<void>;
}

// User Validation Interface
export interface IUserValidation {
  email: boolean;
  fullName: boolean;
  country: boolean;
  pin?: boolean;
}

// User Error Interface
export interface IUserError {
  field: string;
  message: string;
  code: string;
}

// User Success Response Interface
export interface IUserSuccessResponse {
  success: boolean;
  message: string;
  data: IUserResponse;
}

// User Error Response Interface
export interface IUserErrorResponse {
  success: boolean;
  message: string;
  errors: IUserError[];
}

// User List Response Interface
export interface IUserListResponse {
  success: boolean;
  message: string;
  data: IUserResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
