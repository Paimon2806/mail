import { Property, Required, MinLength, MaxLength, Example, CollectionOf, MinItems } from "@tsed/schema";
import { ApiResponse } from "./ApiResponse";

export class EmailClassificationRequestDto {
  @Property()
  @Required()
  @MinLength(10)
  @Example("Dear customer, your order #12345 has been shipped and will arrive soon. Track your package here: [link]")
  emailContent: string;

  @Property()
  @Required()
  @CollectionOf(String)
  @MinItems(1)
  @Example(["Shipping Update", "Promotional", "Spam", "Invoice"])
  candidateLabels: string[];
}

export class ClassificationResultDto {
  @Property()
  @Example("Shipping Update")
  label: string;

  @Property()
  @Example(0.975)
  score: number;
}

export class EmailClassificationResponseDto extends ApiResponse<ClassificationResultDto[]> {
  @Property()
  @Example(true)
  success: boolean;

  @Property()
  @Example("Email classified successfully")
  message: string;

  @Property()
  @Example([
    { label: "Shipping Update", score: 0.975 },
    { label: "Promotional", score: 0.015 },
    { label: "Spam", score: 0.005 },
    { label: "Invoice", score: 0.005 }
  ])
  data: ClassificationResultDto[];
}
