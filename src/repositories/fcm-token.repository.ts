import { Injectable, Inject } from "@tsed/di";
import { DataSource, Repository } from "typeorm";
import { FcmToken } from "../entity/FcmToken";
import { MYSQL_DATA_SOURCE } from "../MysqlDatasource";

export interface CreateFcmTokenData {
  token: string;
  userId: string;
}

@Injectable()
export class FcmTokenRepository {
  private repository: Repository<FcmToken>;

  constructor(@Inject(MYSQL_DATA_SOURCE) private readonly dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(FcmToken);
  }

  // Create a new FCM token
  async create(tokenData: CreateFcmTokenData): Promise<FcmToken> {
    const fcmToken = this.repository.create(tokenData);
    return await this.repository.save(fcmToken);
  }

  // Find FCM token by token value
  async findByToken(token: string): Promise<FcmToken | null> {
    return await this.repository.findOne({
      where: { token },
      relations: ["user"]
    });
  }

  // Find FCM tokens by user ID
  async findByUserId(userId: string): Promise<FcmToken[]> {
    return await this.repository.find({
      where: { userId },
      order: { createdAt: "DESC" }
    });
  }

  // Find FCM token by user ID and token
  async findByUserIdAndToken(userId: string, token: string): Promise<FcmToken | null> {
    return await this.repository.findOne({
      where: { userId, token }
    });
  }

  // Update or create FCM token for user
  async upsertByUserId(userId: string, token: string): Promise<FcmToken> {
    // First, try to find existing token for this user
    const existingToken = await this.repository.findOne({
      where: { userId, token }
    });

    if (existingToken) {
      return existingToken;
    }

    // If token doesn't exist for this user, create new one
    // But first, check if this token exists for another user and remove it
    const existingTokenForOtherUser = await this.repository.findOne({
      where: { token }
    });

    if (existingTokenForOtherUser) {
      await this.repository.delete(existingTokenForOtherUser.id);
    }

    // Create new token for this user
    return await this.create({ token, userId });
  }

  // Delete FCM token by token value
  async deleteByToken(token: string): Promise<boolean> {
    const result = await this.repository.delete({ token });
    return result.affected !== 0;
  }

  // Delete FCM token by ID
  async deleteById(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== 0;
  }

  // Delete all FCM tokens for a user
  async deleteByUserId(userId: string): Promise<boolean> {
    const result = await this.repository.delete({ userId });
    return result.affected !== 0;
  }

  // Get all FCM tokens
  async findAll(): Promise<FcmToken[]> {
    return await this.repository.find({
      relations: ["user"],
      order: { createdAt: "DESC" }
    });
  }

  // Get FCM token count
  async count(): Promise<number> {
    return await this.repository.count();
  }

  // Get FCM token count by user
  async countByUserId(userId: string): Promise<number> {
    return await this.repository.count({ where: { userId } });
  }
}
