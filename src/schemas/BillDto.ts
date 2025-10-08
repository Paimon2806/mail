import { Property, Required, Example, Enum } from "@tsed/schema";

export class CreateBillDto {
  @Property()
  @Required()
  @Example("Electricity Bill")
  billName: string;

  @Property()
  @Required()
  @Example(150.50)
  amount: number;

  @Property()
  @Example("USD")
  currency?: string;

  @Property()
  @Enum("weekly", "monthly", "quarterly", "yearly", "one-time")
  @Example("monthly")
  paymentCycle: string = "monthly";

  @Property()
  @Required()
  @Example("2024-01-15")
  paymentDate: string; // ISO date string

  @Property()
  @Example("Monthly electricity bill for apartment")
  description?: string;

  @Property()
  @Example("Utilities")
  category?: string;

  @Property()
  @Example("Electric Company")
  vendor?: string;

  @Property()
  @Example("1234567890")
  accountNumber?: string;

  @Property()
  @Example("REF123456")
  referenceNumber?: string;

  @Property()
  @Example("2024-01-10")
  reminderDate?: string; // ISO date string

  @Property()
  @Example("folder-uuid-here")
  folderId?: string;

  @Property()
  @Example({ scannedFrom: "camera", confidence: 0.95 })
  scannedData?: Record<string, any>;

  @Property()
  @Example({ source: "mobile_app", version: "1.0" })
  metadata?: Record<string, any>;
}

export class UpdateBillDto {
  @Property()
  @Example("Updated Electricity Bill")
  billName?: string;

  @Property()
  @Example(175.75)
  amount?: number;

  @Property()
  @Example("USD")
  currency?: string;

  @Property()
  @Enum("weekly", "monthly", "quarterly", "yearly", "one-time")
  @Example("monthly")
  paymentCycle?: string;

  @Property()
  @Example("2024-01-20")
  paymentDate?: string; // ISO date string

  @Property()
  @Example("Updated monthly electricity bill")
  description?: string;

  @Property()
  @Example("Utilities")
  category?: string;

  @Property()
  @Example("Electric Company")
  vendor?: string;

  @Property()
  @Example("1234567890")
  accountNumber?: string;

  @Property()
  @Example("REF123456")
  referenceNumber?: string;

  @Property()
  @Example(true)
  isPaid?: boolean;

  @Property()
  @Example("2024-01-15T10:30:00Z")
  paidAt?: string; // ISO datetime string

  @Property()
  @Example("2024-01-10")
  reminderDate?: string; // ISO date string

  @Property()
  @Example("folder-uuid-here")
  folderId?: string;

  @Property()
  @Example({ source: "mobile_app", version: "1.0" })
  metadata?: Record<string, any>;
}

export class BillResponseDto {
  @Property()
  @Example("bill-uuid-here")
  id: string;

  @Property()
  @Example("Electricity Bill")
  billName: string;

  @Property()
  @Example(150.50)
  amount: number;

  @Property()
  @Example("USD")
  currency?: string;

  @Property()
  @Example("monthly")
  paymentCycle: string;

  @Property()
  @Example("2024-01-15")
  paymentDate: string;

  @Property()
  @Example("Monthly electricity bill for apartment")
  description?: string;

  @Property()
  @Example("Utilities")
  category?: string;

  @Property()
  @Example("Electric Company")
  vendor?: string;

  @Property()
  @Example("1234567890")
  accountNumber?: string;

  @Property()
  @Example("REF123456")
  referenceNumber?: string;

  @Property()
  @Example(true)
  isActive: boolean;

  @Property()
  @Example(false)
  isPaid: boolean;

  @Property()
  @Example("2024-01-15T10:30:00Z")
  paidAt?: string;

  @Property()
  @Example("2024-01-10")
  reminderDate?: string;

  @Property()
  @Example({ scannedFrom: "camera", confidence: 0.95 })
  scannedData?: Record<string, any>;

  @Property()
  @Example({ source: "mobile_app", version: "1.0" })
  metadata?: Record<string, any>;

  @Property()
  @Example("folder-uuid-here")
  folderId?: string;

  @Property()
  @Example("Personal")
  folderName?: string;

  @Property()
  @Example("2024-01-01T00:00:00Z")
  createdAt: string;

  @Property()
  @Example("2024-01-01T00:00:00Z")
  updatedAt: string;
}

export class BillSearchDto {
  @Property()
  @Example("electricity")
  search?: string;

  @Property()
  @Example("true")
  isActive?: string;

  @Property()
  @Example("false")
  isPaid?: string;

  @Property()
  @Example("Utilities")
  category?: string;

  @Property()
  @Example("monthly")
  paymentCycle?: string;

  @Property()
  @Example("folder-uuid-here")
  folderId?: string;

  @Property()
  @Example("2024-01-01")
  startDate?: string;

  @Property()
  @Example("2024-12-31")
  endDate?: string;

  @Property()
  @Example("20")
  limit?: string;

  @Property()
  @Example("0")
  offset?: string;
}

export class ScanBillDto {
  @Property()
  @Required()
  @Example("base64-image-data-here")
  imageData: string;

  @Property()
  @Example("camera")
  source?: string; // "camera", "gallery", "manual"

  @Property()
  @Example("folder-uuid-here")
  folderId?: string;

  @Property()
  @Example({ source: "mobile_app", version: "1.0" })
  metadata?: Record<string, any>;
}

export class ScanBillResponseDto {
  @Property()
  @Example("Electricity Bill")
  billName?: string;

  @Property()
  @Example(150.50)
  amount?: number;

  @Property()
  @Example("USD")
  currency?: string;

  @Property()
  @Example("monthly")
  paymentCycle?: string;

  @Property()
  @Example("2024-01-15")
  paymentDate?: string;

  @Property()
  @Example("Utilities")
  category?: string;

  @Property()
  @Example("Electric Company")
  vendor?: string;

  @Property()
  @Example("1234567890")
  accountNumber?: string;

  @Property()
  @Example("REF123456")
  referenceNumber?: string;

  @Property()
  @Example(0.95)
  confidence?: number;

  @Property()
  @Example({ scannedFrom: "camera", processedAt: "2024-01-01T00:00:00Z" })
  scannedData?: Record<string, any>;
}

export class BillStatsDto {
  @Property()
  @Example(25)
  totalBills: number;

  @Property()
  @Example(5)
  paidBills: number;

  @Property()
  @Example(20)
  pendingBills: number;

  @Property()
  @Example(1250.75)
  totalAmount: number;

  @Property()
  @Example(250.15)
  paidAmount: number;

  @Property()
  @Example(1000.60)
  pendingAmount: number;

  @Property()
  @Example({ "Utilities": 5, "Insurance": 3, "Rent": 1 })
  categoryBreakdown: Record<string, number>;

  @Property()
  @Example({ "monthly": 15, "quarterly": 5, "yearly": 5 })
  cycleBreakdown: Record<string, number>;
}
