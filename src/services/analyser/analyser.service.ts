import { PdfParser } from "./parsers/pdf.parser";
import { DocxParser } from "./parsers/docx.parser";
import { ImageParser } from "./parsers/image.parser";

export class AnalyserService {
  private pdfParser = new PdfParser();
  private docxParser = new DocxParser();
  private imageParser = new ImageParser();

  public async analyse(file: Express.Multer.File): Promise<string> {
    let extractedText = "";

    try {
      switch (file.mimetype) {
        case "application/pdf":
          extractedText = await this.pdfParser.parse(file);
          break;
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          extractedText = await this.docxParser.parse(file);
          break;
        case "text/plain":
          extractedText = file.buffer.toString("utf-8");
          break;
        case "image/png":
        case "image/jpeg":
          extractedText = await this.imageParser.parse(file);
          break;
        default:
          throw new Error(`Unsupported file type: ${file.mimetype}`);
      }
    } catch (error) {
      // Log the original error for debugging
      console.error("File parsing error:", error);
      // Throw a more generic error to the controller
      throw new Error("Failed to parse the uploaded file. It may be corrupted or password-protected.");
    }

    return extractedText.substring(0, 500);
  }
}
