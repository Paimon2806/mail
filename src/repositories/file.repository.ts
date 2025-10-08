import { Injectable } from "@tsed/di";
import { Repository } from "typeorm";
import { mysqlDataSource } from "../MysqlDatasource";
import { File } from "../entity/File";

@Injectable()
export class FileRepository {
  private repository: Repository<File>;

  constructor() {
    this.repository = mysqlDataSource.getRepository(File);
  }

  /**
   * Create a new file record
   */
  async create(fileData: Partial<File>): Promise<File> {
    const file = this.repository.create(fileData);
    return await this.repository.save(file);
  }

  /**
   * Find file by ID
   */
  async findById(id: string): Promise<File | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ["user", "folder"]
    });
  }

  /**
   * Find file by S3 key
   */
  async findByS3Key(s3Key: string): Promise<File | null> {
    return await this.repository.findOne({
      where: { s3Key },
      relations: ["user", "folder"]
    });
  }

  /**
   * Find all files in a folder
   */
  async findByFolderId(folderId: string, userId?: string): Promise<File[]> {
    const whereCondition: any = { folderId, isActive: true };
    if (userId) {
      whereCondition.userId = userId;
    }

    return await this.repository.find({
      where: whereCondition,
      relations: ["user", "folder"],
      order: { createdAt: "DESC" }
    });
  }

  /**
   * Find all files for a user
   */
  async findByUserId(userId: string): Promise<File[]> {
    return await this.repository.find({
      where: { userId, isActive: true },
      relations: ["folder"],
      order: { createdAt: "DESC" }
    });
  }

  /**
   * Update file record
   */
  async update(id: string, updateData: Partial<File>): Promise<File | null> {
    await this.repository.update(id, updateData);
    return await this.findById(id);
  }

  /**
   * Soft delete file (mark as inactive)
   */
  async softDelete(id: string): Promise<boolean> {
    const result = await this.repository.update(id, { isActive: false });
    return result.affected ? result.affected > 0 : false;
  }

  /**
   * Hard delete file record
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }

  /**
   * Search files by filename or tags
   */
  async search(userId: string, query: string): Promise<File[]> {
    return await this.repository
      .createQueryBuilder("file")
      .leftJoinAndSelect("file.folder", "folder")
      .where("file.userId = :userId", { userId })
      .andWhere("file.isActive = :isActive", { isActive: true })
      .andWhere(
        "(file.fileName LIKE :query OR file.originalFileName LIKE :query OR file.tags LIKE :query OR file.description LIKE :query)",
        { query: `%${query}%` }
      )
      .orderBy("file.createdAt", "DESC")
      .getMany();
  }

  /**
   * Get file statistics for a user
   */
  async getFileStats(userId: string): Promise<{
    totalFiles: number;
    totalSize: number;
    filesByType: Record<string, number>;
  }> {
    const files = await this.repository.find({
      where: { userId, isActive: true },
      select: ["contentType", "fileSize"]
    });

    const totalFiles = files.length;
    const totalSize = files.reduce((sum, file) => sum + Number(file.fileSize), 0);

    const filesByType: Record<string, number> = {};
    files.forEach((file) => {
      const type = file.contentType || "unknown";
      filesByType[type] = (filesByType[type] || 0) + 1;
    });

    return { totalFiles, totalSize, filesByType };
  }

  /**
   * Increment download count
   */
  async incrementDownloadCount(id: string): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(File)
      .set({
        downloadCount: () => "COALESCE(downloadCount, 0) + 1",
        lastDownloadedAt: new Date()
      })
      .where("id = :id", { id })
      .execute();
  }

  /**
   * Update text extraction status
   */
  async updateTextExtraction(id: string, extractedText: string, jobId?: string): Promise<void> {
    await this.repository.update(id, {
      extractedText,
      isTextExtracted: true,
      textractJobId: jobId
    });
  }
}
