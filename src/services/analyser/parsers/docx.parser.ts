import mammoth from "mammoth";

export class DocxParser {
  async parse(file: Express.Multer.File): Promise<string> {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value;
  }
}
