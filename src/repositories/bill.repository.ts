import { Repository, DataSource, Between } from "typeorm";
import { Bill } from "../entity/Bill";
import { MYSQL_DATA_SOURCE } from "../MysqlDatasource";
import { Inject, Injectable } from "@tsed/di";

export interface IBillFilters {
  search?: string;
  isActive?: boolean;
  isPaid?: boolean;
  category?: string;
  paymentCycle?: string;
  folderId?: string;
  startDate?: string;
  endDate?: string;
}

@Injectable()
export class BillRepository {
  constructor(@Inject(MYSQL_DATA_SOURCE) private readonly dataSource: DataSource) {}

  private get repository(): Repository<Bill> {
    return this.dataSource.getRepository(Bill);
  }

  async create(billData: Partial<Bill>): Promise<Bill> {
    const bill = this.repository.create(billData);
    return await this.repository.save(bill);
  }

  async findById(id: string): Promise<Bill | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ["user", "folder"]
    });
  }

  async findByIdAndUser(id: string, userId: string): Promise<Bill | null> {
    return await this.repository.findOne({
      where: { id, userId },
      relations: ["user", "folder"]
    });
  }

  async findByUser(userId: string, filters: IBillFilters = {}): Promise<Bill[]> {
    const queryBuilder = this.repository
      .createQueryBuilder("bill")
      .leftJoinAndSelect("bill.user", "user")
      .leftJoinAndSelect("bill.folder", "folder")
      .where("bill.userId = :userId", { userId });

    if (filters.isActive !== undefined) {
      queryBuilder.andWhere("bill.isActive = :isActive", { isActive: filters.isActive });
    }

    if (filters.isPaid !== undefined) {
      queryBuilder.andWhere("bill.isPaid = :isPaid", { isPaid: filters.isPaid });
    }

    if (filters.category) {
      queryBuilder.andWhere("bill.category = :category", { category: filters.category });
    }

    if (filters.paymentCycle) {
      queryBuilder.andWhere("bill.paymentCycle = :paymentCycle", { paymentCycle: filters.paymentCycle });
    }

    if (filters.folderId) {
      queryBuilder.andWhere("bill.folderId = :folderId", { folderId: filters.folderId });
    }

    if (filters.startDate && filters.endDate) {
      queryBuilder.andWhere("bill.paymentDate BETWEEN :startDate AND :endDate", {
        startDate: filters.startDate,
        endDate: filters.endDate
      });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        "(bill.billName LIKE :search OR bill.description LIKE :search OR bill.vendor LIKE :search OR bill.category LIKE :search)",
        { search: `%${filters.search}%` }
      );
    }

    // Order by payment date (upcoming first), then by created date
    queryBuilder
      .orderBy("bill.paymentDate", "ASC")
      .addOrderBy("bill.createdAt", "DESC");

    return await queryBuilder.getMany();
  }

  async findByFolder(folderId: string, userId: string): Promise<Bill[]> {
    return await this.repository.find({
      where: { folderId, userId },
      relations: ["user", "folder"],
      order: { paymentDate: "ASC" }
    });
  }

  async findUpcomingBills(userId: string, days: number = 7): Promise<Bill[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    return await this.repository.find({
      where: {
        userId,
        isActive: true,
        isPaid: false,
        paymentDate: Between(today, futureDate)
      },
      relations: ["user", "folder"],
      order: { paymentDate: "ASC" }
    });
  }

  async findOverdueBills(userId: string): Promise<Bill[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await this.repository.find({
      where: {
        userId,
        isActive: true,
        isPaid: false,
        paymentDate: Between(new Date("1900-01-01"), today)
      },
      relations: ["user", "folder"],
      order: { paymentDate: "ASC" }
    });
  }

  async update(id: string, updateData: Partial<Bill>): Promise<Bill | null> {
    const result = await this.repository.update(id, updateData);
    if ((result.affected ?? 0) > 0) {
      return await this.findById(id);
    }
    return null;
  }

  async updateByUser(id: string, userId: string, updateData: Partial<Bill>): Promise<Bill | null> {
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
    totalBills: number;
    paidBills: number;
    pendingBills: number;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    categoryBreakdown: Record<string, number>;
    cycleBreakdown: Record<string, number>;
  }> {
    const totalBills = await this.repository.count({
      where: { userId, isActive: true }
    });

    const paidBills = await this.repository.count({
      where: { userId, isActive: true, isPaid: true }
    });

    const pendingBills = await this.repository.count({
      where: { userId, isActive: true, isPaid: false }
    });

    const totalAmountResult = await this.repository
      .createQueryBuilder("bill")
      .select("SUM(bill.amount)", "total")
      .where("bill.userId = :userId AND bill.isActive = true", { userId })
      .getRawOne();

    const paidAmountResult = await this.repository
      .createQueryBuilder("bill")
      .select("SUM(bill.amount)", "total")
      .where("bill.userId = :userId AND bill.isActive = true AND bill.isPaid = true", { userId })
      .getRawOne();

    const pendingAmountResult = await this.repository
      .createQueryBuilder("bill")
      .select("SUM(bill.amount)", "total")
      .where("bill.userId = :userId AND bill.isActive = true AND bill.isPaid = false", { userId })
      .getRawOne();

    const categoryBreakdown = await this.repository
      .createQueryBuilder("bill")
      .select("bill.category", "category")
      .addSelect("COUNT(bill.id)", "count")
      .where("bill.userId = :userId AND bill.isActive = true", { userId })
      .groupBy("bill.category")
      .getRawMany();

    const cycleBreakdown = await this.repository
      .createQueryBuilder("bill")
      .select("bill.paymentCycle", "cycle")
      .addSelect("COUNT(bill.id)", "count")
      .where("bill.userId = :userId AND bill.isActive = true", { userId })
      .groupBy("bill.paymentCycle")
      .getRawMany();

    return {
      totalBills,
      paidBills,
      pendingBills,
      totalAmount: parseFloat(totalAmountResult?.total || "0"),
      paidAmount: parseFloat(paidAmountResult?.total || "0"),
      pendingAmount: parseFloat(pendingAmountResult?.total || "0"),
      categoryBreakdown: categoryBreakdown.reduce((acc, item) => {
        acc[item.category || "Uncategorized"] = parseInt(item.count);
        return acc;
      }, {} as Record<string, number>),
      cycleBreakdown: cycleBreakdown.reduce((acc, item) => {
        acc[item.cycle] = parseInt(item.count);
        return acc;
      }, {} as Record<string, number>)
    };
  }

  async searchBills(query: string, userId: string, limit: number = 20): Promise<Bill[]> {
    return await this.repository
      .createQueryBuilder("bill")
      .leftJoinAndSelect("bill.user", "user")
      .leftJoinAndSelect("bill.folder", "folder")
      .where("bill.userId = :userId", { userId })
      .andWhere(
        "(bill.billName LIKE :query OR bill.description LIKE :query OR bill.vendor LIKE :query OR bill.category LIKE :query)",
        { query: `%${query}%` }
      )
      .orderBy("bill.paymentDate", "ASC")
      .limit(limit)
      .getMany();
  }

  async findByUserAndDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<Bill[]> {
    return await this.repository.find({
      where: {
        userId,
        paymentDate: Between(startDate, endDate)
      },
      relations: ["user", "folder"],
      order: { paymentDate: "ASC" }
    });
  }
}
