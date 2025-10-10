import { AnalyserService } from "../../src/services/analyser/analyser.service";
import { PdfParser } from "../../src/services/analyser/parsers/pdf.parser";
import { DocxParser } from "../../src/services/analyser/parsers/docx.parser";
import { ImageParser } from "../../src/services/analyser/parsers/image.parser";

// Mock the parsers
jest.mock("../../src/services/analyser/parsers/pdf.parser");
jest.mock("../../src/services/analyser/parsers/docx.parser");
jest.mock("../../src/services/analyser/parsers/image.parser");

describe("AnalyserService", () => {
  let analyserService: AnalyserService;

  beforeEach(() => {
    analyserService = new AnalyserService();
  });

  it("should call the PDF parser for pdf files", async () => {
    const file = { mimetype: "application/pdf" } as Express.Multer.File;
    await analyserService.analyse(file);
    expect(PdfParser.prototype.parse).toHaveBeenCalledWith(file);
  });

  it("should call the DOCX parser for docx files", async () => {
    const file = { mimetype: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" } as Express.Multer.File;
    await analyserService.analyse(file);
    expect(DocxParser.prototype.parse).toHaveBeenCalledWith(file);
  });

  it("should call the Image parser for png files", async () => {
    const file = { mimetype: "image/png" } as Express.Multer.File;
    await analyserService.analyse(file);
    expect(ImageParser.prototype.parse).toHaveBeenCalledWith(file);
  });

  it("should handle txt files directly", async () => {
    const file = { mimetype: "text/plain", buffer: Buffer.from("hello world") } as Express.Multer.File;
    const text = await analyserService.analyse(file);
    expect(text).toBe("hello world");
  });

  it("should truncate text to 500 characters", async () => {
    const longText = "a".repeat(600);
    const file = { mimetype: "text/plain", buffer: Buffer.from(longText) } as Express.Multer.File;
    const text = await analyserService.analyse(file);
    expect(text.length).toBe(500);
  });
});
