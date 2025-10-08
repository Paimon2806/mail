import { BusinessValidationException } from "@/exceptions";
import { ContextLogger, Service } from "@tsed/di";
import { DecodedIdToken, UserRecord, getAuth } from "firebase-admin/auth";

@Service()
export class FirebaseAuthService {
  async verifyAuthToken(idToken: string): Promise<DecodedIdToken> {
    try {
      const data: DecodedIdToken = await getAuth().verifyIdToken(idToken);
      return data;
    } catch (error) {
      throw new BusinessValidationException(error.message);
    }
  }

  async getUserDataByEmail(logger: ContextLogger, email: string): Promise<UserRecord> {
    logger.info({
      class: FirebaseAuthService.name,
      function: "getUserDataByEmail",
      data: { email }
    });
    return await getAuth().getUserByEmail(email);
  }

  async getUserByPhoneNumber(logger: ContextLogger, phoneNumber: string): Promise<UserRecord> {
    logger.info({
      class: FirebaseAuthService.name,
      function: "getUserByPhoneNumber",
      data: { phoneNumber }
    });
    return await getAuth().getUserByPhoneNumber(phoneNumber);
  }
}
