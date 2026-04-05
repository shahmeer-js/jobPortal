import express from "express";
import { careerGuidance, resumeAnalyzer, uploadFile } from "./controller.js";

const router = express.Router();

router.post("/upload", uploadFile);
router.post("/career", careerGuidance);
router.post("/resume-analyzer", resumeAnalyzer);

export default router;
