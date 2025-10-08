import { Injectable } from "@tsed/di";
import axios from "axios";
import { ClassificationResultDto } from "../schemas/EmailClassificationDto";
import { Logger } from "../utils/logger";

@Injectable()
export class EmailClassificationService {
  private readonly HUGGING_FACE_API_URL: string = process.env.HUGGING_FACE_API_URL || "https://api-inference.huggingface.co/models/facebook/bart-large-mnli";
  private readonly HUGGING_FACE_API_KEY: string = process.env.HUGGING_FACE_API_KEY || "";

  constructor() {
    if (!this.HUGGING_FACE_API_KEY) {
      Logger.warn("HUGGING_FACE_API_KEY is not set. Email classification may fail.");
    }
  }

  async classifyEmail(
    emailContent: string,
    candidateLabels: string[]
  ): Promise<ClassificationResultDto[]> {
    try {
      Logger.info("Sending email content for classification...");
      const response = await axios.post(
        this.HUGGING_FACE_API_URL,
        {
          inputs: emailContent,
          parameters: { candidate_labels: candidateLabels },
        },
        {
          headers: {
            Authorization: `Bearer ${this.HUGGING_FACE_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const { labels, scores } = response.data;
      const results: ClassificationResultDto[] = labels.map(
        (label: string, index: number) => ({
          label,
          score: scores[index],
        })
      );

      // Find the result with the highest score
      const highestScoreResult = results.reduce(
        (max, current) => (current.score > max.score ? current : max),
        results[0]
      );

      Logger.info("Email classification successful.");
      return [highestScoreResult]; // Return only the highest score result
    } catch (error) {
      Logger.error("Error classifying email:", error.message);
      if (axios.isAxiosError(error)) {
        Logger.error("Axios error details:", error.response?.data || error.message);
      }
      throw new Error("Failed to classify email content.");
    }
  }
}
