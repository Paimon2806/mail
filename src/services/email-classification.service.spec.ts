import axios from "axios";
import { EmailClassificationService } from "./email-classification.service";
import { Logger } from "../utils/logger";

// Mock axios and Logger
jest.mock("axios");
jest.mock("../utils/logger");

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("EmailClassificationService", () => {
  let service: EmailClassificationService;

  beforeEach(() => {
    service = new EmailClassificationService();
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("classifyEmail", () => {
    const emailContent = "Your order has shipped!";
    const candidateLabels = ["Spam", "Shipping Update", "Invoice"];

    it("should return only the label with the highest score", async () => {
      const mockResponse = {
        data: {
          sequence: "Your order has shipped!",
          labels: ["Shipping Update", "Invoice", "Spam"],
          scores: [0.98, 0.01, 0.01]
        }
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await service.classifyEmail(emailContent, candidateLabels);

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].label).toBe("Shipping Update");
      expect(result[0].score).toBe(0.98);
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });

    it("should handle API errors gracefully", async () => {
      const errorMessage = "Hugging Face API is down";
      mockedAxios.post.mockRejectedValue(new Error(errorMessage));

      await expect(service.classifyEmail(emailContent, candidateLabels)).rejects.toThrow("Failed to classify email content.");
      expect(Logger.error).toHaveBeenCalledWith("Error classifying email:", errorMessage);
    });

    it("should return the highest score even if it is not the first label", async () => {
      const mockResponse = {
        data: {
          sequence: "Your order has shipped!",
          labels: ["Spam", "Shipping Update", "Invoice"],
          scores: [0.1, 0.95, 0.05]
        }
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await service.classifyEmail(emailContent, candidateLabels);

      expect(result.length).toBe(1);
      expect(result[0].label).toBe("Shipping Update");
      expect(result[0].score).toBe(0.95);
    });
  });
});
