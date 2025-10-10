import { Request, Response } from "express";
import { AnalyserService } from "../../services/analyser/analyser.service";

export class AnalyserController {
  private analyserService = new AnalyserService();

  public analyse = async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).send({ message: "No file uploaded." });
      }

      const text = await this.analyserService.analyse(req.file);
      res.status(200).send({ text });
    } catch (error) {
      res.status(500).send({ message: "Internal server error", error });
    }
  };
}
