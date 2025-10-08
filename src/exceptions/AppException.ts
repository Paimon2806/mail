import { HTTPException } from "@tsed/exceptions";

/**
 * Base application exception class
 * All custom exceptions should extend this class
 */
export abstract class AppException extends HTTPException {
  constructor(
    message: string,
    status: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(status, message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Bad Request Exception (400)
 * Used for validation errors and malformed requests
 */
export class BadRequestException extends AppException {
  constructor(message: string = "Bad Request", details?: any) {
    super(message, 400, "BAD_REQUEST", details);
  }
}

/**
 * Unauthorized Exception (401)
 * Used for authentication failures
 */
export class UnauthorizedException extends AppException {
  constructor(message: string = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
  }
}

/**
 * Forbidden Exception (403)
 * Used for authorization failures
 */
export class ForbiddenException extends AppException {
  constructor(message: string = "Forbidden") {
    super(message, 403, "FORBIDDEN");
  }
}

/**
 * Not Found Exception (404)
 * Used when requested resource is not found
 */
export class NotFoundException extends AppException {
  constructor(message: string = "Resource not found") {
    super(message, 404, "NOT_FOUND");
  }
}

/**
 * Internal Server Error Exception (500)
 * Used for unexpected server errors
 */
export class InternalServerErrorException extends AppException {
  constructor(message: string = "Internal Server Error", details?: any) {
    super(message, 500, "INTERNAL_SERVER_ERROR", details);
  }
}
