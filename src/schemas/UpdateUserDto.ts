import { Property, Email, MinLength, MaxLength, Description } from "@tsed/schema";

export class UpdateUserDto {
  @Property()
  @Email()
  @Description("User's email address (optional)")
  email?: string;

  @Property()
  @MinLength(2)
  @MaxLength(100)
  @Description("User's full name (optional)")
  fullName?: string;

  @Property()
  @MaxLength(100)
  @Description("User's country (optional)")
  country?: string;

  @Property()
  @Description("URL to user's avatar image (optional)")
  avatar?: string;

  @Property()
  @Description("Enable email notifications")
  emailNotification?: boolean;

  @Property()
  @Description("Enable bill notifications")
  billNotification?: boolean;
}
