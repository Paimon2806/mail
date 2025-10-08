import { Repository, DataSource } from "typeorm";
import { MilestoneCategory } from "../entity/MilestoneCategory";
import { MYSQL_DATA_SOURCE } from "../MysqlDatasource";
import { Inject, Injectable } from "@tsed/di";
import { IMilestoneCategoryFilters } from "../interface/IMilestoneCategory";

@Injectable()
export class MilestoneCategoryRepository {
  constructor(@Inject(MYSQL_DATA_SOURCE) private readonly dataSource: DataSource) {}

  private get repository(): Repository<MilestoneCategory> {
    return this.dataSource.getRepository(MilestoneCategory);
  }

  async create(milestoneCategoryData: Partial<MilestoneCategory>): Promise<MilestoneCategory> {
    const milestoneCategory = this.repository.create(milestoneCategoryData);
    return await this.repository.save(milestoneCategory);
  }

  async findById(id: string): Promise<MilestoneCategory | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ["user"]
    });
  }

  async findByIdAndUser(id: string, userId: string): Promise<MilestoneCategory | null> {
    return await this.repository.findOne({
      where: [
        { id, userId }, // Personal category
        { id, isPublic: true } // Public category
      ],
      relations: ["user"]
    });
  }

  async findByUserWithPagination(
    userId: string,
    filters: IMilestoneCategoryFilters = {},
    limit: number = 20,
    offset: number = 0
  ): Promise<{ categories: MilestoneCategory[]; total: number; hasMore: boolean }> {
    const queryBuilder = this.repository
      .createQueryBuilder("milestoneCategory")
      .leftJoinAndSelect("milestoneCategory.user", "user")
      .leftJoin("milestoneCategory.milestones", "milestone")
      .addSelect("COUNT(milestone.id)", "milestoneCount")
      .where("milestoneCategory.userId = :userId OR milestoneCategory.isPublic = true", { userId })
      .groupBy("milestoneCategory.id");

    if (filters.isPublic !== undefined) {
      queryBuilder.andWhere("milestoneCategory.isPublic = :isPublic", { isPublic: filters.isPublic });
    }

    if (filters.isActive !== undefined) {
      queryBuilder.andWhere("milestoneCategory.isActive = :isActive", { isActive: filters.isActive });
    }


    if (filters.search) {
      queryBuilder.andWhere("(milestoneCategory.name LIKE :search OR milestoneCategory.description LIKE :search)", {
        search: `%${filters.search}%`
      });
    }

    // Order by: Public first, then private, then by sortOrder, then by name
    queryBuilder
      .orderBy("milestoneCategory.isPublic", "DESC")
      .addOrderBy("milestoneCategory.sortOrder", "ASC")
      .addOrderBy("milestoneCategory.name", "ASC");

    // Get total count
    const totalQuery = this.repository
      .createQueryBuilder("milestoneCategory")
      .where("milestoneCategory.userId = :userId OR milestoneCategory.isPublic = true", { userId });

    if (filters.isPublic !== undefined) {
      totalQuery.andWhere("milestoneCategory.isPublic = :isPublic", { isPublic: filters.isPublic });
    }

    if (filters.isActive !== undefined) {
      totalQuery.andWhere("milestoneCategory.isActive = :isActive", { isActive: filters.isActive });
    }


    if (filters.search) {
      totalQuery.andWhere("(milestoneCategory.name LIKE :search OR milestoneCategory.description LIKE :search)", {
        search: `%${filters.search}%`
      });
    }

    const total = await totalQuery.getCount();

    // Apply pagination
    queryBuilder.limit(limit).offset(offset);

    const categories = await queryBuilder.getMany();
    const hasMore = offset + limit < total;

    return {
      categories,
      total,
      hasMore
    };
  }

  async findPublicCategories(filters: IMilestoneCategoryFilters = {}): Promise<MilestoneCategory[]> {
    const queryBuilder = this.repository
      .createQueryBuilder("milestoneCategory")
      .leftJoinAndSelect("milestoneCategory.user", "user")
      .leftJoin("milestoneCategory.milestones", "milestone")
      .addSelect("COUNT(milestone.id)", "milestoneCount")
      .where("milestoneCategory.isPublic = true")
      .groupBy("milestoneCategory.id");

    if (filters.isActive !== undefined) {
      queryBuilder.andWhere("milestoneCategory.isActive = :isActive", { isActive: filters.isActive });
    }


    if (filters.search) {
      queryBuilder.andWhere("(milestoneCategory.name LIKE :search OR milestoneCategory.description LIKE :search)", {
        search: `%${filters.search}%`
      });
    }

    queryBuilder.orderBy("milestoneCategory.sortOrder", "ASC").addOrderBy("milestoneCategory.name", "ASC");

    return await queryBuilder.getMany();
  }

  async findPersonalCategories(userId: string, filters: IMilestoneCategoryFilters = {}): Promise<MilestoneCategory[]> {
    const queryBuilder = this.repository
      .createQueryBuilder("milestoneCategory")
      .leftJoinAndSelect("milestoneCategory.user", "user")
      .leftJoin("milestoneCategory.milestones", "milestone")
      .addSelect("COUNT(milestone.id)", "milestoneCount")
      .where("milestoneCategory.userId = :userId", { userId })
      .groupBy("milestoneCategory.id");

    if (filters.isActive !== undefined) {
      queryBuilder.andWhere("milestoneCategory.isActive = :isActive", { isActive: filters.isActive });
    }


    if (filters.search) {
      queryBuilder.andWhere("(milestoneCategory.name LIKE :search OR milestoneCategory.description LIKE :search)", {
        search: `%${filters.search}%`
      });
    }

    queryBuilder.orderBy("milestoneCategory.sortOrder", "ASC").addOrderBy("milestoneCategory.name", "ASC");

    return await queryBuilder.getMany();
  }


  async update(id: string, updateData: Partial<MilestoneCategory>): Promise<MilestoneCategory | null> {
    const result = await this.repository.update(id, updateData);
    if ((result.affected ?? 0) > 0) {
      return await this.findById(id);
    }
    return null;
  }

  async updateByUser(id: string, userId: string, updateData: Partial<MilestoneCategory>): Promise<MilestoneCategory | null> {
    const result = await this.repository.update({ id, userId }, updateData);
    if ((result.affected ?? 0) > 0) {
      return await this.findById(id);
    }
    return null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async deleteByUser(id: string, userId: string): Promise<boolean> {
    const result = await this.repository.delete({ id, userId });
    return (result.affected ?? 0) > 0;
  }

  async getStats(userId: string): Promise<{
    totalCategories: number;
    publicCategories: number;
    personalCategories: number;
    activeCategories: number;
    mostUsedCategories: Array<{ id: string; name: string; count: number }>;
  }> {
    const totalCategories = await this.repository.count({
      where: [{ userId }, { isPublic: true }]
    });

    const publicCategories = await this.repository.count({
      where: { isPublic: true }
    });

    const personalCategories = await this.repository.count({
      where: { userId }
    });

    const activeCategories = await this.repository.count({
      where: [
        { userId, isActive: true },
        { isPublic: true, isActive: true }
      ]
    });

    const mostUsedCategories = await this.repository
      .createQueryBuilder("milestoneCategory")
      .leftJoin("milestoneCategory.milestones", "milestone")
      .select("milestoneCategory.id", "id")
      .addSelect("milestoneCategory.name", "name")
      .addSelect("COUNT(milestone.id)", "count")
      .where("milestoneCategory.userId = :userId OR milestoneCategory.isPublic = true", { userId })
      .groupBy("milestoneCategory.id")
      .orderBy("count", "DESC")
      .limit(5)
      .getRawMany();

    return {
      totalCategories,
      publicCategories,
      personalCategories,
      activeCategories,
      mostUsedCategories: mostUsedCategories.map((item) => ({
        id: item.id,
        name: item.name,
        count: parseInt(item.count)
      }))
    };
  }

  async findByName(name: string, userId?: string): Promise<MilestoneCategory | null> {
    const whereConditions: any[] = [{ name }];

    if (userId) {
      whereConditions.push({ name, userId });
    }

    return await this.repository.findOne({
      where: whereConditions
    });
  }
}
