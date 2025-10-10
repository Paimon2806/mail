import { createWorker } from "tesseract.js";

export class ImageParser {
  async parse(file: Express.Multer.File): Promise<string> {
    const worker = await createWorker();
    const ret = await worker.recognize(file.buffer);
    await worker.terminate();
    return ret.data.text;
  }
}
