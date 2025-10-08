import { Property, Required, Email, MinLength, MaxLength, Description } from "@tsed/schema";

export class CreateUserDto {
  @Property()
  @Email()
  @Description("User's email address (optional)")
  email?: string;

  @Property()
  @Required()
  @MinLength(2)
  @MaxLength(100)
  @Description("User's full name")
  fullName: string;

  @Property()
  @MaxLength(100)
  @Description("User's country (optional)")
  country?: string;

  @Property()
  @Description("URL to user's avatar image (optional)")
  avatar?: string;

  @Property()
  @Description("Enable email notifications (default: true)")
  emailNotification?: boolean;

  @Property()
  @Description("Enable bill notifications (default: false)")
  billNotification?: boolean;
}
