import express from "express";

import { isAuth } from "../middlewares/auth.js";
import uploadFile from "../middlewares/multer.js";
import {
  createCompany,
  createJob,
  deleteCompany,
  getAllActiveJobs,
  getAllApplicationForJob,
  getAllCompany,
  getCompanyDetails,
  getSingleJob,
  updateApplication,
  updateJob,
} from "../controllers/job.js";

const router = express.Router();

// Company routes
router.get("/company", isAuth, getAllCompany);
router.post("/company/new", isAuth, uploadFile, createCompany);
router.get("/company/:companyId", getCompanyDetails);
router.delete("/company/:companyId", isAuth, deleteCompany);

// Job routes
router.get("/", isAuth, getAllActiveJobs);
router.post("/new", isAuth, createJob);
router.put("/:jobId", isAuth, updateJob);
router.get("/:jobId", getSingleJob);

//job applications
router.get("/application/:jobId", isAuth, getAllApplicationForJob);
router.put("/application/:applicationId", isAuth, updateApplication);

export default router;
