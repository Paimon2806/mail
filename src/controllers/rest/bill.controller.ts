import { Controller } from "@tsed/di";
import { BillService } from "../../services/bill.service";
import { Description, Get, Post, Put, Delete, Returns, Example, Summary } from "@tsed/schema";
import { BodyParams, Context, QueryParams, PathParams } from "@tsed/platform-params";
import { DecodedIdToken } from "firebase-admin/auth";
import { CustomAuth } from "../../decorators/CustomAuth";
import { ApiResponse, CreateBillDto, UpdateBillDto, BillResponseDto, BillSearchDto } from "../../schemas";
import { IBillFilters } from "../../repositories/bill.repository";

@Controller("/bills")
export class BillController {
  constructor(private readonly billService: BillService) {}

  @Post("/")
  @CustomAuth("Create bill")
  @Summary("Create a new bill")
  @Description("Create a new bill with the provided data")
  async createBill(@BodyParams() createDto: CreateBillDto, @Context("auth") user: DecodedIdToken): Promise<ApiResponse<BillResponseDto>> {
    const bill = await this.billService.createBill(createDto, user.uid);

    return new ApiResponse(bill, "Bill created successfully");
  }

  @Get("/")
  @CustomAuth("Get bills")
  @Summary("Get user's bills")
  @Description("Retrieve all bills for the user")
  async getBills(@QueryParams() searchDto: BillSearchDto, @Context("auth") user: DecodedIdToken): Promise<ApiResponse<BillResponseDto[]>> {
    const filters: IBillFilters = {
      search: searchDto.search,
      isActive: searchDto.isActive ? searchDto.isActive === "true" : undefined,
      isPaid: searchDto.isPaid ? searchDto.isPaid === "true" : undefined,
      category: searchDto.category,
      paymentCycle: searchDto.paymentCycle,
      folderId: searchDto.folderId,
      startDate: searchDto.startDate,
      endDate: searchDto.endDate
    };

    const bills = await this.billService.getBills(user.uid, filters);

    return new ApiResponse(bills, "Bills retrieved successfully");
  }

  @Get("/:id")
  @CustomAuth("Get bill by ID")
  @Summary("Get bill by ID")
  @Description("Retrieve a specific bill by its ID")
  async getBillById(@PathParams("id") id: string, @Context("auth") user: DecodedIdToken): Promise<ApiResponse<BillResponseDto>> {
    const bill = await this.billService.getBillById(id, user.uid);

    return new ApiResponse(bill, "Bill retrieved successfully");
  }

  @Put("/:id")
  @CustomAuth("Update bill")
  @Summary("Update bill")
  @Description("Update an existing bill")
  async updateBill(
    @PathParams("id") id: string,
    @BodyParams() updateDto: UpdateBillDto,
    @Context("auth") user: DecodedIdToken
  ): Promise<ApiResponse<BillResponseDto>> {
    const bill = await this.billService.updateBill(id, updateDto, user.uid);

    return new ApiResponse(bill, "Bill updated successfully");
  }

  @Delete("/:id")
  @CustomAuth("Delete bill")
  @Summary("Delete bill")
  @Description("Delete a bill permanently")
  async deleteBill(
    @PathParams("id") id: string,
    @Context("auth") user: DecodedIdToken
  ): Promise<ApiResponse<{ success: boolean; message: string }>> {
    const success = await this.billService.deleteBill(id, user.uid);

    return new ApiResponse({ success, message: "Bill deleted successfully" }, "Bill deleted successfully");
  }
}
