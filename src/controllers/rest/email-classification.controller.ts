import { Controller } from "@tsed/di";
import { Post, Returns, Summary, Description, Example } from "@tsed/schema";
import { BodyParams, Context } from "@tsed/platform-params";
import { DecodedIdToken } from "firebase-admin/auth";
import { CustomAuth } from "../../decorators/CustomAuth";
import { ApiResponse } from "../../schemas/ApiResponse";
import { EmailClassificationService } from "../../services/email-classification.service";
import { EmailClassificationRequestDto, ClassificationResultDto } from "../../schemas/EmailClassificationDto";

@Controller("/email-classification")
export class EmailClassificationController {
  constructor(private readonly emailClassificationService: EmailClassificationService) {}

  @Post("/")
  @CustomAuth("Classify email content")
  @Summary("Classify email content using zero-shot learning")
  @Description("Sends email content to a zero-shot classification model and returns the label with the highest probability score.")
  @Returns(200, ApiResponse).Of(ClassificationResultDto).Example({
    success: true,
    message: "Email classified successfully",
    data: [
      { label: "Shipping Update", score: 0.975 }
    ]
  })
  @Returns(400, ApiResponse)
  @Returns(401, ApiResponse)
  async classifyEmail(
    @BodyParams() request: EmailClassificationRequestDto,
    @Context("auth") auth: DecodedIdToken
  ): Promise<ApiResponse<ClassificationResultDto[]>> {
    try {
      // In a real application, you might want to use auth.uid for logging or specific user-related logic
      // For this task, we are focusing on the classification logic itself.

      const results = await this.emailClassificationService.classifyEmail(
        request.emailContent,
        request.candidateLabels
      );

      return new ApiResponse(results, "Email classified successfully");
    } catch (error) {
      return new ApiResponse(undefined, error.message, false);
    }
  }
}
