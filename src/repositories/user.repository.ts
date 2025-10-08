import { Injectable, Inject } from "@tsed/di";
import { DataSource, Repository } from "typeorm";
import { User } from "../entity/User";
import { MYSQL_DATA_SOURCE } from "../MysqlDatasource";

export interface CreateUserData {
  id?: string;
  firebaseUid: string;
  email?: string;
  fullName: string;
  country?: string;
  avatar?: string;
  pinHash?: string;
  emailNotification?: boolean;
  billNotification?: boolean;
  isOnboardingCompleted?: boolean;
  onboardingCompletedAt?: Date;
}

export interface UpdateUserData {
  email?: string;
  fullName?: string;
  country?: string;
  avatar?: string;
  pinHash?: string;
  emailNotification?: boolean;
  billNotification?: boolean;
  isOnboardingCompleted?: boolean;
  onboardingCompletedAt?: Date;
  lastLoginAt?: Date;
}

@Injectable()
export class UserRepository {
  private repository: Repository<User>;

  constructor(@Inject(MYSQL_DATA_SOURCE) private readonly dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(User);
  }

  // Create a new user
  async create(userData: CreateUserData): Promise<User> {
    const user = this.repository.create(userData);
    return await this.repository.save(user);
  }

  // Create a new user with specific ID (for Firebase UID)
  async createWithId(id: string, userData: CreateUserData): Promise<User> {
    const user = this.repository.create({ ...userData, id });
    return await this.repository.save(user);
  }

  // Find user by ID
  async findById(id: string): Promise<User | null> {
    return await this.repository.findOne({ where: { id } });
  }

  // Find user by ID with PIN (includes pinHash field)
  async findByIdWithPin(id: string): Promise<User | null> {
    return await this.repository.findOne({
      where: { id },
      select: [
        "id",
        "email",
        "fullName",
        "country",
        "avatar",
        "pinHash",
        "emailNotification",
        "billNotification",
        "lastLoginAt",
        "createdAt",
        "updatedAt"
      ]
    });
  }

  // Find user by email
  async findByEmail(email: string): Promise<User | null> {
    return await this.repository.findOne({ where: { email } });
  }

  // Find user by Firebase UID
  async findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    return await this.repository.findOne({ where: { firebaseUid } });
  }

  // Find user by Firebase UID with PIN (includes pinHash field)
  async findByFirebaseUidWithPin(firebaseUid: string): Promise<User | null> {
    return await this.repository.findOne({
      where: { firebaseUid },
      select: [
        "id",
        "firebaseUid",
        "email",
        "fullName",
        "country",
        "avatar",
        "pinHash",
        "emailNotification",
        "billNotification",
        "lastLoginAt",
        "createdAt",
        "updatedAt"
      ]
    });
  }

  // Get all users
  async findAll(): Promise<User[]> {
    return await this.repository.find();
  }

  // Update user by ID
  async updateById(id: string, userData: UpdateUserData): Promise<User | null> {
    await this.repository.update(id, userData);
    return await this.findById(id);
  }

  // Update user's last login
  async updateLastLogin(id: string): Promise<void> {
    await this.repository.update(id, { lastLoginAt: new Date() });
  }

  // Delete user by ID
  async deleteById(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== 0;
  }

  // Check if email exists
  async emailExists(email: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    return user !== null;
  }

  // Get user count
  async count(): Promise<number> {
    return await this.repository.count();
  }

  // Search users by name or email
  async search(query: string): Promise<User[]> {
    return await this.repository
      .createQueryBuilder("user")
      .where("user.fullName LIKE :query OR user.email LIKE :query", {
        query: `%${query}%`
      })
      .getMany();
  }

  // Get users by country
  async findByCountry(country: string): Promise<User[]> {
    return await this.repository.find({ where: { country } });
  }
}
