import { useDecorators } from "@tsed/core";
import { Returns, Security, Summary } from "@tsed/schema";
import { UseAuth } from "@tsed/platform-middlewares";
import { FirebaseAuthMiddleware } from "@/middlewares";

export function CustomAuth(summary: string) {
  return useDecorators(Security("bearerAuth"), UseAuth(FirebaseAuthMiddleware), Summary(summary), Returns(401), Returns(403));
}
