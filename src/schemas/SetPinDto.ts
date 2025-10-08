import { Property, Required, Pattern, Description } from "@tsed/schema";

export class SetPinDto {
  @Property()
  @Required()
  @Pattern(/^\d{4,6}$/)
  @Description("New PIN (4-6 digits only)")
  pin: string;
}
