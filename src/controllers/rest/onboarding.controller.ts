import { Controller } from "@tsed/di";
import { OnboardingService } from "../../services/onboarding.service";
import { Description, Get, Post, Put, Returns, Example, Summary } from "@tsed/schema";
import { BodyParams, Context } from "@tsed/platform-params";
import { DecodedIdToken } from "firebase-admin/auth";
import { CustomAuth } from "../../decorators/CustomAuth";
import { ApiResponse, SubmitOnboardingDto } from "../../schemas";

@Controller("/onboarding")
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Get("/questions")
  @Description("Get all active onboarding questions")
  @CustomAuth("Get onboarding questions")
  @Returns(200, ApiResponse)
  @Returns(401, ApiResponse)
  async getOnboardingQuestions(@Context("auth") auth: DecodedIdToken | undefined | null): Promise<ApiResponse<any>> {
    try {
      const questions = await this.onboardingService.getOnboardingQuestions();
      return new ApiResponse(questions, "Onboarding questions retrieved successfully");
    } catch (error) {
      throw error;
    }
  }

  @Post("/submit")
  @Summary("Submit onboarding responses")
  @Description("Submit onboarding responses and automatically create personalized user folders based on selected options")
  @CustomAuth("Submit onboarding responses")
  @Returns(201, ApiResponse)
  @Returns(400, ApiResponse)
  @Returns(401, ApiResponse)
  @Returns(409, ApiResponse)
  @Description("User has already completed onboarding")
  @Example({
    responses: [
      {
        questionId: "q1-priorities",
        selectedOptionIds: ["opt-backup-documents", "opt-family-easier"]
      },
      {
        questionId: "q2-family",
        selectedOptionIds: ["opt-partner", "opt-have-children"]
      },
      {
        questionId: "q3-employment",
        selectedOptionId: "opt-self-employed"
      },
      {
        questionId: "q4-investments",
        selectedOptionIds: ["opt-shares-etfs", "opt-cryptocurrency"]
      }
    ]
  })
  async submitOnboardingResponses(
    @BodyParams() onboardingData: SubmitOnboardingDto,
    @Context("auth") auth: DecodedIdToken | undefined | null
  ): Promise<ApiResponse<any>> {
    try {
      const result = await this.onboardingService.submitOnboardingResponses(auth?.uid as string, onboardingData.responses);

      if (!result.success) {
        return new ApiResponse(result, result.message, result.success ? 201 : 400);
      }

      return new ApiResponse(result, "Onboarding completed successfully");
    } catch (error) {
      throw error;
    }
  }

  @Get("/status")
  @Description("Get user onboarding status and responses")
  @CustomAuth("Get onboarding status")
  @Returns(200, ApiResponse)
  @Returns(401, ApiResponse)
  @Returns(404, ApiResponse)
  async getOnboardingStatus(@Context("auth") auth: DecodedIdToken | undefined | null): Promise<ApiResponse<any>> {
    try {
      const status = await this.onboardingService.getUserOnboardingStatus(auth?.uid as string);
      return new ApiResponse(status, "Onboarding status retrieved successfully");
    } catch (error) {
      throw error;
    }
  }

  @Put("/update")
  @Description("Update onboarding responses and recreate folders")
  @CustomAuth("Update onboarding responses")
  @Returns(200, ApiResponse)
  @Returns(400, ApiResponse)
  @Returns(401, ApiResponse)
  @Returns(404, ApiResponse)
  async updateOnboardingResponses(
    @BodyParams() onboardingData: SubmitOnboardingDto,
    @Context("auth") auth: DecodedIdToken | undefined | null
  ): Promise<ApiResponse<any>> {
    try {
      const result = await this.onboardingService.updateOnboardingResponses(auth?.uid as string, onboardingData.responses);

      return new ApiResponse(result, "Onboarding responses updated successfully");
    } catch (error) {
      throw error;
    }
  }

  @Get("/recommendations")
  @Description("Get folder recommendations based on user responses")
  @CustomAuth("Get folder recommendations")
  @Returns(200, ApiResponse)
  @Returns(401, ApiResponse)
  @Returns(404, ApiResponse)
  async getFolderRecommendations(@Context("auth") auth: DecodedIdToken | undefined | null): Promise<ApiResponse<any>> {
    try {
      const recommendations = await this.onboardingService.getFolderRecommendations(auth?.uid as string);
      return new ApiResponse(recommendations, "Folder recommendations retrieved successfully");
    } catch (error) {
      throw error;
    }
  }
}
