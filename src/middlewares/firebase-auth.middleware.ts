import { Context, Next, Req, Res } from "@tsed/common";
import { Middleware, MiddlewareMethods } from "@tsed/platform-middlewares";
import { Forbidden } from "@tsed/exceptions";
import { FirebaseAuthService } from "@/services/FirebaseAuthServices";
import { ForbiddenException } from "@/exceptions";
import { DecodedIdToken } from "firebase-admin/auth";

@Middleware()
export class FirebaseAuthMiddleware implements MiddlewareMethods {
  constructor(
    private readonly firebaseAuthService: FirebaseAuthService // private readonly jwtService: JWTService,
  ) {}

  // private method to get token from express request. from cookie or auth header
  private getToken(request: Req): string | undefined {
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.split(" ")[1];
    }
    return undefined;
  }

  async use(@Req() request: Req, @Res() _response: Res, @Context() context: Context, @Next() next: Next) {
    // skip auth for public routes
    context.logger.info(`Request path: ${request.path}`);
    context.logger.info(`Request method: ${request.method}`);
    // context.logger.info(`Request headers: ${JSON.stringify(request.headers)}`);
    context.logger.info(`Request cookies: ${JSON.stringify(request.cookies)}`);
    context.logger.info(`Request body: ${JSON.stringify(request.body)}`);
    context.logger.info(`Request query: ${JSON.stringify(request.query)}`);

    const token = this.getToken(request);
    const adminToken = request.headers.xadmintoken as string | undefined;
    context.logger.info(`Token: ${token}`);
    // verify token
    let user: DecodedIdToken;
    if (token) {
      try {
        // Verify token and set context
        user = await this.firebaseAuthService.verifyAuthToken(token);
        context.set("auth", user);
        next();
      } catch (error) {
        throw new Forbidden(error);
      }
    } else if (adminToken) {
      try {
        // const auth = await this.firebaseAuthService.verifyJwtAuthToken(adminToken);
        // context.set("auth", auth);
        next();
      } catch (error) {
        throw new Forbidden("Invalid token");
      }
    } else {
      throw new Forbidden("Missing or invalid authorization token");
    }
  }
}
