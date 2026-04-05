import express, { Request, Response } from "express";

import { isAuth } from "../middlewares/auth.js";
import uploadFile from "../middlewares/multer.js";
import { register } from "../utils/monitoring.js";
import {
  addSkillToUser,
  applyForJob,
  getAllApplications,
  getUserProfile,
  myProfile,
  removeSkillFromUser,
  updateProfilePic,
  updateResume,
  updateUserProfile,
} from "../controllers/user.js";

const router = express.Router();

router.get("/health", (req: Request, res: Response) =>
  res.send("User Service is Healthy"),
);

router.get("/metrics", async (req: Request, res: Response) => {
  res.setHeader("Content-Type", register.contentType);
  res.send(await register.metrics());
});

//user profile
router.get("/me", isAuth, myProfile);
router.get("/:userId", isAuth, getUserProfile);
router.put("/update/profile", isAuth, updateUserProfile);
router.put("/update/pic", isAuth, uploadFile, updateProfilePic);
router.put("/update/resume", isAuth, uploadFile, updateResume);

//user skills
router.post("/skill/add", isAuth, addSkillToUser);
router.put("/skill/remove", isAuth, removeSkillFromUser);

//job application
router.post("/apply/job", isAuth, applyForJob);
router.get("/application/all", isAuth, getAllApplications);

export default router;
