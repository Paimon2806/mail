import { Service, Inject } from "@tsed/di";
import { UserRepository } from "../repositories/user.repository";
import { PinService } from "./pin.service";
import { IUserService, IUserRegistration, IUserResponse, IUpdateUser, IUserSearch, IUserStats, ICreateUser } from "../interface/IUser.js";
import { User } from "../entity/User.js";

@Service()
export class UserService implements IUserService {
  constructor(
    @Inject() private readonly userRepository: UserRepository,
    @Inject() private readonly pinService: PinService
  ) {}

  // Create a new user
  async createUser(userData: ICreateUser, firebaseUid: string): Promise<IUserResponse> {
    try {
      // Check if email already exists (if provided)
      if (userData.email) {
        const existingUser = await this.userRepository.findByEmail(userData.email);
        if (existingUser) {
          throw new Error("User with this email already exists");
        }
      }

      // Create user data
      const createUserData: ICreateUser = {
        firebaseUid,
        email: userData.email,
        fullName: userData.fullName,
        country: userData.country,
        emailNotification: userData.emailNotification,
        billNotification: userData.billNotification
      };

      // Create user
      const user = await this.userRepository.create(createUserData);

      // Return user response
      return this.mapUserToResponse(user);
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  // Get user by Firebase UID
  async getUserById(firebaseUid: string): Promise<IUserResponse | null> {
    try {
      const user = await this.userRepository.findByFirebaseUid(firebaseUid);
      return user ? this.mapUserToResponse(user) : null;
    } catch (error) {
      throw new Error(`Failed to get user by Firebase UID: ${error.message}`);
    }
  }

  // Get user by email
  async getUserByEmail(email: string): Promise<IUserResponse | null> {
    try {
      const user = await this.userRepository.findByEmail(email);
      return user ? this.mapUserToResponse(user) : null;
    } catch (error) {
      throw new Error(`Failed to get user by email: ${error.message}`);
    }
  }

  // Update user
  async updateUser(firebaseUid: string, userData: IUpdateUser): Promise<IUserResponse | null> {
    try {
      // Check if user exists by Firebase UID
      const existingUser = await this.userRepository.findByFirebaseUid(firebaseUid);
      if (!existingUser) {
        throw new Error("User not found");
      }

      // Check if email is being updated and if it already exists
      if (userData.email && userData.email !== existingUser.email) {
        const emailExists = await this.userRepository.emailExists(userData.email);
        if (emailExists) {
          throw new Error("Email already exists");
        }
      }

      // Update user using internal ID
      const updatedUser = await this.userRepository.updateById(existingUser.id, userData);
      return updatedUser ? this.mapUserToResponse(updatedUser) : null;
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  // Delete user
  async deleteUser(firebaseUid: string): Promise<boolean> {
    try {
      // Find user by Firebase UID first
      const user = await this.userRepository.findByFirebaseUid(firebaseUid);
      if (!user) {
        throw new Error("User not found");
      }

      const result = await this.userRepository.deleteById(user.id);
      return result;
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  // Search users
  async searchUsers(searchData: IUserSearch): Promise<IUserResponse[]> {
    try {
      let users: User[];

      if (searchData.query) {
        users = await this.userRepository.search(searchData.query);
      } else {
        users = await this.userRepository.findAll();
      }

      // Apply additional filters
      if (searchData.country) {
        users = users.filter((user) => user.country === searchData.country);
      }

      if (searchData.emailNotification !== undefined) {
        users = users.filter((user) => user.emailNotification === searchData.emailNotification);
      }

      if (searchData.billNotification !== undefined) {
        users = users.filter((user) => user.billNotification === searchData.billNotification);
      }

      return users.map((user) => this.mapUserToResponse(user));
    } catch (error) {
      throw new Error(`Failed to search users: ${error.message}`);
    }
  }

  // Get user statistics
  async getUserStats(): Promise<IUserStats> {
    try {
      const totalUsers = await this.userRepository.count();
      const allUsers = await this.userRepository.findAll();

      // Group users by country
      const usersByCountry: { [country: string]: number } = {};
      allUsers.forEach((user) => {
        if (user.country) {
          usersByCountry[user.country] = (usersByCountry[user.country] || 0) + 1;
        }
      });

      // Calculate recent registrations (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentRegistrations = allUsers.filter((user) => user.createdAt >= thirtyDaysAgo).length;

      // Calculate last login stats
      const today = new Date();
      const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thisMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const lastLoginStats = {
        today: allUsers.filter((user) => user.lastLoginAt && user.lastLoginAt >= today).length,
        thisWeek: allUsers.filter((user) => user.lastLoginAt && user.lastLoginAt >= thisWeek).length,
        thisMonth: allUsers.filter((user) => user.lastLoginAt && user.lastLoginAt >= thisMonth).length
      };

      // Calculate notification stats
      const notificationStats = {
        emailNotificationEnabled: allUsers.filter((user) => user.emailNotification === true).length,
        billNotificationEnabled: allUsers.filter((user) => user.billNotification === true).length
      };

      return {
        totalUsers,
        usersByCountry,
        recentRegistrations,
        lastLoginStats,
        notificationStats
      };
    } catch (error) {
      throw new Error(`Failed to get user stats: ${error.message}`);
    }
  }

  // Update last login
  async updateLastLogin(id: string): Promise<void> {
    try {
      await this.userRepository.updateLastLogin(id);
    } catch (error) {
      throw new Error(`Failed to update last login: ${error.message}`);
    }
  }

  // Helper method to map User entity to IUserResponse
  private mapUserToResponse(user: User): IUserResponse {
    return {
      id: user.id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      fullName: user.fullName,
      country: user.country,
      avatar: user.avatar,
      emailNotification: user.emailNotification,
      billNotification: user.billNotification,
      lastLoginAt: user.lastLoginAt,
      isOnboardingCompleted: user.isOnboardingCompleted || false,
      onboardingCompletedAt: user.onboardingCompletedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  // Helper method to validate user data
  private validateUserData(userData: IUserRegistration): void {
    if (userData.email && !userData.email.includes("@")) {
      throw new Error("Valid email format is required");
    }

    if (!userData.fullName || userData.fullName.trim().length < 2) {
      throw new Error("Full name must be at least 2 characters long");
    }

    if (userData.country && userData.country.trim().length < 2) {
      throw new Error("Country must be at least 2 characters long");
    }
  }

  // Set PIN for user (first time)
  async setUserPin(firebaseUid: string, pin: string, email?: string): Promise<boolean> {
    try {
      // Check if user exists by Firebase UID, if not create a basic user record
      let user = await this.userRepository.findByFirebaseUid(firebaseUid);
      if (!user) {
        // Auto-create user with Firebase UID and email from token
        const createUserData: ICreateUser = {
          firebaseUid,
          email: email || undefined,
          fullName: email ? email.split("@")[0] : "Firebase User", // Use email prefix as name
          emailNotification: true,
          billNotification: false
        };
        user = await this.userRepository.create(createUserData);
      }

      // Check if user already has a PIN
      const userWithPin = await this.userRepository.findByFirebaseUidWithPin(firebaseUid);
      if (userWithPin?.pinHash) {
        throw new Error("User already has a PIN. Use update PIN instead");
      }

      // Hash the PIN
      const pinHash = await this.pinService.hashPin(pin);

      // Save the PIN hash
      await this.userRepository.updateById(user.id, { pinHash });
      return true;
    } catch (error) {
      throw new Error(`Failed to set PIN: ${error.message}`);
    }
  }

  // Update user PIN
  async updateUserPin(firebaseUid: string, currentPin: string, newPin: string): Promise<boolean> {
    try {
      // Get user with PIN by Firebase UID
      let user = await this.userRepository.findByFirebaseUidWithPin(firebaseUid);
      if (!user) {
        throw new Error("User not found. Please set a PIN first");
      }

      if (!user.pinHash) {
        throw new Error("User does not have a PIN set. Use set PIN instead");
      }

      // Verify current PIN
      const isCurrentPinValid = await this.pinService.verifyPin(currentPin, user.pinHash);
      if (!isCurrentPinValid) {
        return false; // Current PIN is incorrect
      }

      // Hash new PIN
      const newPinHash = await this.pinService.hashPin(newPin);

      // Update PIN
      await this.userRepository.updateById(user.id, { pinHash: newPinHash });
      return true;
    } catch (error) {
      throw new Error(`Failed to update PIN: ${error.message}`);
    }
  }

  // Verify user PIN
  async verifyUserPin(firebaseUid: string, pin: string): Promise<boolean> {
    try {
      // Get user with PIN by Firebase UID
      const user = await this.userRepository.findByFirebaseUidWithPin(firebaseUid);
      if (!user) {
        throw new Error("User not found. Please set a PIN first");
      }

      if (!user.pinHash) {
        throw new Error("User does not have a PIN set");
      }

      // Verify PIN
      return await this.pinService.verifyPin(pin, user.pinHash);
    } catch (error) {
      throw new Error(`Failed to verify PIN: ${error.message}`);
    }
  }

}
