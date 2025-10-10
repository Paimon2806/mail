import { Router } from "express";
import { AnalyserController } from "../controllers/rest/analyser.controller";
import upload from "../middlewares/multer.middleware";

const router = Router();
// This needs to be fixed, AnalyserController is not a default export
// const analyserController = new AnalyserController();

// router.post('/analyse', upload.single('attachment'), analyserController.analyse);

export default router;
