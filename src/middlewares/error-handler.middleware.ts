import { Err, Middleware, MiddlewareMethods, Req, Res } from "@tsed/common";
import { Exception as TsEdException } from "@tsed/exceptions";
import { StatusCodes } from "http-status-codes";

import { ApiException, BusinessValidationException, ValidationException } from "../exceptions";
import { ApiResponse } from "@/schemas";

@Middleware()
class ErrorHandlerMiddleware implements MiddlewareMethods {
  public use(@Err() error: Error, @Req() _request: Req, @Res() response: Res): void {
    if (error instanceof ApiException) {
      response.status(error.status).send(ApiResponse.fromApiException(error));
    } else if (error instanceof TsEdException) {
      response.status(error.status).send(ApiResponse.fromTsEdException(error));
    } else if (error instanceof ValidationException || error instanceof BusinessValidationException) {
      response.status(StatusCodes.BAD_REQUEST).send(new ApiResponse(null, error.stack, error.message));
    } else {
      response.status(StatusCodes.INTERNAL_SERVER_ERROR).send(new ApiResponse(null, error.stack, error.message));
    }
  }
}

export { ErrorHandlerMiddleware };
