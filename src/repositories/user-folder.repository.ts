import { Injectable, Inject } from "@tsed/di";
import { DataSource, Repository } from "typeorm";
import { UserFolder } from "../entity/UserFolder";
import { ICreateUserFolder, IUpdateUserFolder } from "../interface/IOnboarding";
import { MYSQL_DATA_SOURCE } from "../MysqlDatasource";

@Injectable()
export class UserFolderRepository {
  private repository: Repository<UserFolder>;

  constructor(@Inject(MYSQL_DATA_SOURCE) private readonly dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(UserFolder);
  }

  async create(data: ICreateUserFolder): Promise<UserFolder> {
    const folder = this.repository.create(data);
    return await this.repository.save(folder);
  }

  async findByUserId(userId: string): Promise<UserFolder[]> {
    return await this.repository.find({
      where: { userId, isActive: true },
      relations: ["children", "parent"],
      order: { folderPath: "ASC" }
    });
  }

  async findById(id: string): Promise<UserFolder | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ["children", "parent", "user"]
    });
  }

  async findByPath(userId: string, folderPath: string): Promise<UserFolder | null> {
    return await this.repository.findOne({
      where: { userId, folderPath, isActive: true },
      relations: ["children", "parent"]
    });
  }

  async findRootFolders(userId: string, includeChildren: boolean = false): Promise<UserFolder[]> {
    const queryOptions: any = {
      where: { userId, parentId: null, isActive: true },
      order: { folderName: "ASC" }
    };

    if (includeChildren) {
      queryOptions.relations = ["children"];
    }

    return await this.repository.find(queryOptions);
  }

  async findByParentId(parentId: string): Promise<UserFolder[]> {
    return await this.repository.find({
      where: { parentId, isActive: true },
      relations: ["children"],
      order: { folderName: "ASC" }
    });
  }

  async update(id: string, data: IUpdateUserFolder): Promise<UserFolder | null> {
    await this.repository.update(id, data);
    return await this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.update(id, { isActive: false });
    return result.affected ? result.affected > 0 : false;
  }

  async hardDelete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }

  async createBulk(folders: ICreateUserFolder[]): Promise<UserFolder[]> {
    const folderEntities = this.repository.create(folders);
    return await this.repository.save(folderEntities);
  }

  async findByS3Path(userId: string, s3Path: string): Promise<UserFolder | null> {
    return await this.repository.findOne({
      where: { userId, s3Path, isActive: true }
    });
  }

  async updateS3Path(id: string, s3Path: string): Promise<UserFolder | null> {
    await this.repository.update(id, { s3Path });
    return await this.findById(id);
  }

  async getFolderHierarchy(userId: string): Promise<UserFolder[]> {
    // Get all folders and build hierarchy
    const allFolders = await this.repository.find({
      where: { userId, isActive: true },
      relations: ["children", "parent"],
      order: { folderPath: "ASC" }
    });

    // Filter to get only root folders with their children loaded
    return allFolders.filter((folder) => !folder.parentId);
  }

  async getFolderCount(userId: string): Promise<number> {
    return await this.repository.count({
      where: { userId, isActive: true }
    });
  }

  async searchFolders(userId: string, searchTerm: string): Promise<UserFolder[]> {
    return await this.repository
      .createQueryBuilder("folder")
      .where("folder.userId = :userId", { userId })
      .andWhere("folder.isActive = :isActive", { isActive: true })
      .andWhere("(folder.folderName LIKE :searchTerm OR folder.description LIKE :searchTerm)", {
        searchTerm: `%${searchTerm}%`
      })
      .leftJoinAndSelect("folder.children", "children")
      .leftJoinAndSelect("folder.parent", "parent")
      .orderBy("folder.folderPath", "ASC")
      .getMany();
  }
}
