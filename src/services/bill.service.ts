import { Injectable } from "@tsed/di";
import { BillRepository, IBillFilters } from "../repositories/bill.repository";
import { UserFolderRepository } from "../repositories/user-folder.repository";
import { 
  CreateBillDto, 
  UpdateBillDto, 
  BillResponseDto, 
  ScanBillDto, 
  ScanBillResponseDto,
  BillStatsDto
} from "../schemas/BillDto";
import { NotFoundException, BadRequestException } from "../exceptions/AppException";
import { Bill } from "../entity/Bill";

@Injectable()
export class BillService {
  constructor(
    private readonly billRepository: BillRepository,
    private readonly userFolderRepository: UserFolderRepository
  ) {}


  async createBill(createData: CreateBillDto, userId: string): Promise<BillResponseDto> {
    // Validate folder if provided
    if (createData.folderId) {
      const folder = await this.userFolderRepository.findById(createData.folderId);
      if (!folder || folder.userId !== userId) {
        throw new BadRequestException("Invalid folder selected");
      }
    }

    // Convert date strings to Date objects
    const paymentDate = new Date(createData.paymentDate);
    const reminderDate = createData.reminderDate ? new Date(createData.reminderDate) : undefined;

    const billData: Partial<Bill> = {
      billName: createData.billName,
      amount: createData.amount,
      currency: createData.currency || "USD",
      paymentCycle: createData.paymentCycle,
      paymentDate,
      description: createData.description,
      category: createData.category,
      vendor: createData.vendor,
      accountNumber: createData.accountNumber,
      referenceNumber: createData.referenceNumber,
      reminderDate,
      folderId: createData.folderId,
      scannedData: createData.scannedData,
      metadata: createData.metadata,
      userId,
      isActive: true,
      isPaid: false
    };

    const bill = await this.billRepository.create(billData);
    return this.transformToResponse(bill);
  }

  async getBills(userId: string, filters: IBillFilters = {}): Promise<BillResponseDto[]> {
    const bills = await this.billRepository.findByUser(userId, filters);
    return bills.map(bill => this.transformToResponse(bill));
  }

  async getBillById(id: string, userId: string): Promise<BillResponseDto> {
    const bill = await this.billRepository.findByIdAndUser(id, userId);
    if (!bill) {
      throw new NotFoundException("Bill not found");
    }

    return this.transformToResponse(bill);
  }

  async updateBill(id: string, updateData: UpdateBillDto, userId: string): Promise<BillResponseDto> {
    const existingBill = await this.billRepository.findByIdAndUser(id, userId);
    if (!existingBill) {
      throw new NotFoundException("Bill not found");
    }

    // Validate folder if provided
    if (updateData.folderId) {
      const folder = await this.userFolderRepository.findById(updateData.folderId);
      if (!folder || folder.userId !== userId) {
        throw new BadRequestException("Invalid folder selected");
      }
    }

    // Convert date strings to Date objects if provided
    const updateFields: Partial<Bill> = { ...updateData };
    
    if (updateData.paymentDate) {
      updateFields.paymentDate = new Date(updateData.paymentDate);
    }
    
    if (updateData.reminderDate) {
      updateFields.reminderDate = new Date(updateData.reminderDate);
    }
    
    if (updateData.paidAt) {
      updateFields.paidAt = new Date(updateData.paidAt);
    }

    const updatedBill = await this.billRepository.updateByUser(id, userId, updateFields);
    if (!updatedBill) {
      throw new NotFoundException("Bill not found");
    }

    return this.transformToResponse(updatedBill);
  }

  async deleteBill(id: string, userId: string): Promise<boolean> {
    const existingBill = await this.billRepository.findByIdAndUser(id, userId);
    if (!existingBill) {
      throw new NotFoundException("Bill not found");
    }

    return await this.billRepository.deleteByUser(id, userId);
  }


  private transformToResponse(bill: Bill): BillResponseDto {
    return {
      id: bill.id,
      billName: bill.billName,
      amount: bill.amount,
      currency: bill.currency,
      paymentCycle: bill.paymentCycle,
      paymentDate: bill.paymentDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
      description: bill.description,
      category: bill.category,
      vendor: bill.vendor,
      accountNumber: bill.accountNumber,
      referenceNumber: bill.referenceNumber,
      isActive: bill.isActive,
      isPaid: bill.isPaid,
      paidAt: bill.paidAt ? bill.paidAt.toISOString() : undefined,
      reminderDate: bill.reminderDate ? bill.reminderDate.toISOString().split('T')[0] : undefined,
      scannedData: bill.scannedData,
      metadata: bill.metadata,
      folderId: bill.folderId,
      folderName: bill.folder?.folderName,
      createdAt: bill.createdAt.toISOString(),
      updatedAt: bill.updatedAt.toISOString()
    };
  }
}
