import { Injectable, Inject } from "@tsed/di";
import { Repository, DataSource, Between, Like, In, IsNull, Not } from "typeorm";
import { Milestone } from "../entity/Milestone";
import { ICreateMilestone, IUpdateMilestone, IMilestoneSearchFilters, IMilestoneStats } from "../interface/IMilestone";
import { MYSQL_DATA_SOURCE } from "../MysqlDatasource";

@Injectable()
export class MilestoneRepository {
  private repository: Repository<Milestone>;

  constructor(@Inject(MYSQL_DATA_SOURCE) private readonly dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(Milestone);
  }

  async create(userId: string, milestoneData: ICreateMilestone): Promise<Milestone> {
    const milestone = this.repository.create({
      ...milestoneData,
      userId,
      milestoneDate: new Date(milestoneData.milestoneDate)
    });

    return await this.repository.save(milestone);
  }

  async findById(id: string, userId: string): Promise<Milestone | null> {
    return await this.repository.findOne({
      where: { id, userId, isActive: true },
      relations: ["files", "milestoneCategory"],
      order: { createdAt: "DESC" }
    });
  }

  async findAllByUser(
    userId: string,
    filters: IMilestoneSearchFilters = {},
    sortBy: string = "milestoneDate",
    sortOrder: "ASC" | "DESC" = "DESC",
    limit: number = 50,
    offset: number = 0
  ): Promise<{ milestones: Milestone[]; total: number }> {
    const queryBuilder = this.repository
      .createQueryBuilder("milestone")
      .leftJoinAndSelect("milestone.files", "files")
      .leftJoinAndSelect("milestone.milestoneCategory", "milestoneCategory")
      .where("milestone.userId = :userId", { userId })
      .andWhere("milestone.isActive = :isActive", { isActive: true });

    // Apply filters
    if (filters.milestoneCategoryId) {
      queryBuilder.andWhere("milestone.milestoneCategoryId = :milestoneCategoryId", { milestoneCategoryId: filters.milestoneCategoryId });
    }

    if (filters.tags && filters.tags.length > 0) {
      queryBuilder.andWhere("JSON_OVERLAPS(milestone.tags, :tags)", { tags: JSON.stringify(filters.tags) });
    }

    if (filters.dateFrom && filters.dateTo) {
      queryBuilder.andWhere("milestone.milestoneDate BETWEEN :dateFrom AND :dateTo", {
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo
      });
    } else if (filters.dateFrom) {
      queryBuilder.andWhere("milestone.milestoneDate >= :dateFrom", { dateFrom: filters.dateFrom });
    } else if (filters.dateTo) {
      queryBuilder.andWhere("milestone.milestoneDate <= :dateTo", { dateTo: filters.dateTo });
    }

    if (filters.location) {
      queryBuilder.andWhere("milestone.location LIKE :location", { location: `%${filters.location}%` });
    }

    if (filters.isPrivate !== undefined) {
      queryBuilder.andWhere("milestone.isPrivate = :isPrivate", { isPrivate: filters.isPrivate });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        "(milestone.title LIKE :search OR milestone.description LIKE :search OR milestone.occasion LIKE :search OR milestone.notes LIKE :search)",
        { search: `%${filters.search}%` }
      );
    }

    // Apply sorting
    const validSortFields = ["title", "milestoneDate", "createdAt"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "milestoneDate";
    queryBuilder.orderBy(`milestone.${sortField}`, sortOrder);

    // Apply pagination
    queryBuilder.skip(offset).take(limit);

    const [milestones, total] = await queryBuilder.getManyAndCount();

    return { milestones, total };
  }

  async update(id: string, userId: string, updateData: IUpdateMilestone): Promise<Milestone | null> {
    const milestone = await this.findById(id, userId);
    if (!milestone) {
      return null;
    }

    // Convert date string to Date object if provided
    if (updateData.milestoneDate) {
      updateData.milestoneDate = new Date(updateData.milestoneDate) as any;
    }

    await this.repository.update(id, updateData);
    return await this.findById(id, userId);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await this.repository.update({ id, userId }, { isActive: false });
    return (result.affected ?? 0) > 0;
  }

  async getStats(userId: string): Promise<IMilestoneStats> {
    // Get total milestones
    const totalMilestones = await this.repository.count({
      where: { userId, isActive: true }
    });

    // Get milestones by category
    const categoryStats = await this.repository
      .createQueryBuilder("milestone")
      .leftJoin("milestone.milestoneCategory", "category")
      .select("COALESCE(category.name, 'Unknown Category')", "categoryName")
      .addSelect("COUNT(*)", "count")
      .where("milestone.userId = :userId", { userId })
      .andWhere("milestone.isActive = :isActive", { isActive: true })
      .groupBy("category.name")
      .getRawMany();

    const milestonesByCategory = categoryStats.reduce(
      (acc, stat) => {
        acc[stat.categoryName] = parseInt(stat.count);
        return acc;
      },
      {} as Record<string, number>
    );

    // Get milestones by year
    const yearStats = await this.repository
      .createQueryBuilder("milestone")
      .select("YEAR(milestone.milestoneDate)", "year")
      .addSelect("COUNT(*)", "count")
      .where("milestone.userId = :userId", { userId })
      .andWhere("milestone.isActive = :isActive", { isActive: true })
      .groupBy("YEAR(milestone.milestoneDate)")
      .orderBy("year", "DESC")
      .getRawMany();

    const milestonesByYear = yearStats.reduce(
      (acc, stat) => {
        acc[stat.year] = parseInt(stat.count);
        return acc;
      },
      {} as Record<string, number>
    );

    // Get recent milestones (last 5)
    const recentMilestones = await this.repository.find({
      where: { userId, isActive: true },
      relations: ["files", "milestoneCategory"],
      order: { createdAt: "DESC" },
      take: 5
    });

    // Get upcoming milestones (next 5)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingMilestones = await this.repository.find({
      where: {
        userId,
        isActive: true,
        milestoneDate: Not(IsNull())
      },
      relations: ["files", "milestoneCategory"],
      order: { milestoneDate: "ASC" },
      take: 5
    });

    return {
      totalMilestones,
      milestonesByCategory,
      milestonesByYear,
      recentMilestones: recentMilestones.map(this.transformMilestone),
      upcomingMilestones: upcomingMilestones.map(this.transformMilestone)
    };
  }

  async getCategories(userId: string): Promise<string[]> {
    const categories = await this.repository
      .createQueryBuilder("milestone")
      .leftJoin("milestone.milestoneCategory", "category")
      .select("DISTINCT COALESCE(category.name, 'Unknown Category')", "categoryName")
      .where("milestone.userId = :userId", { userId })
      .andWhere("milestone.isActive = :isActive", { isActive: true })
      .orderBy("categoryName", "ASC")
      .getRawMany();

    return categories.map((cat) => cat.categoryName);
  }

  async getTags(userId: string): Promise<string[]> {
    const milestones = await this.repository.find({
      where: { userId, isActive: true },
      select: ["tags"]
    });

    const allTags = new Set<string>();
    milestones.forEach((milestone) => {
      if (milestone.tags) {
        milestone.tags.forEach((tag) => allTags.add(tag));
      }
    });

    return Array.from(allTags).sort();
  }

  async findByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Milestone[]> {
    return await this.repository.find({
      where: {
        userId,
        isActive: true,
        milestoneDate: Between(startDate, endDate)
      },
      relations: ["files", "milestoneCategory"],
      order: { milestoneDate: "ASC" }
    });
  }

  private transformMilestone(milestone: Milestone): any {
    return {
      id: milestone.id,
      title: milestone.title,
      description: milestone.description,
      milestoneCategoryId: milestone.milestoneCategoryId,
      milestoneCategory: {
        id: milestone.milestoneCategory?.id || milestone.milestoneCategoryId,
        name: milestone.milestoneCategory?.name || "Unknown Category",
        icon: milestone.milestoneCategory?.icon,
        color: milestone.milestoneCategory?.color
      },
      milestoneDate: milestone.milestoneDate.toISOString().split("T")[0],
      location: milestone.location,
      tags: milestone.tags,
      metadata: milestone.metadata,
      isActive: milestone.isActive,
      isPrivate: milestone.isPrivate,
      occasion: milestone.occasion,
      notes: milestone.notes,
      files:
        milestone.files?.map((file) => ({
          id: file.id,
          fileName: file.fileName,
          originalFileName: file.originalFileName,
          contentType: file.contentType,
          fileSize: file.fileSize,
          s3Key: file.s3Key,
          description: file.description,
          tags: file.tags,
          createdAt: file.createdAt.toISOString()
        })) || [],
      createdAt: milestone.createdAt.toISOString(),
      updatedAt: milestone.updatedAt.toISOString()
    };
  }
}
