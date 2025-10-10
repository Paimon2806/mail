import pdf from "pdf-parse";

export class PdfParser {
  async parse(file: Express.Multer.File): Promise<string> {
    const data = await pdf(file.buffer);
    return data.text;
  }
}
