import { Property, Required, Pattern, Description } from "@tsed/schema";

export class UpdatePinDto {
  @Property()
  @Required()
  @Pattern(/^\d{4,6}$/)
  @Description("Current PIN (4-6 digits only)")
  currentPin: string;

  @Property()
  @Required()
  @Pattern(/^\d{4,6}$/)
  @Description("New PIN (4-6 digits only)")
  newPin: string;
}
