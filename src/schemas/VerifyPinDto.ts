import { Property, Required, Pattern, Description } from "@tsed/schema";

export class VerifyPinDto {
  @Property()
  @Required()
  @Pattern(/^\d{4,6}$/)
  @Description("PIN to verify (4-6 digits only)")
  pin: string;
}
