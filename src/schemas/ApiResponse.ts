/* eslint-disable @typescript-eslint/no-explicit-any */
import { Property } from "@tsed/schema";
import { ApiException } from "../exceptions";
import { Exception as TsEdException } from "@tsed/exceptions";

export class ApiResponse<T> {
  @Property()
  data?: T;

  @Property()
  error?: any;

  @Property()
  message?: string;

  constructor(data?: T, message?: string, error?: any) {
    this.data = data;
    this.error = error;
    this.message = message;
  }

  public static fromApiException(exception: ApiException): ApiResponse<any> {
    return new ApiResponse(null, exception.message, exception.stack);
  }

  public static fromTsEdException(exception: TsEdException): ApiResponse<any> {
    return new ApiResponse(null, exception.message, exception.stack);
  }
}
