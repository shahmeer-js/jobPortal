import express from "express";
import { registerUser, loginUser, forgotPassword, resetPassword } from "../controllers/auth.js";
import uploadFile from "../middleware/multer.js";

const router = express.Router();

router.post("/register", uploadFile, registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.get("/health", (req, res) => res.send("Auth service is healthy!"));

export default router;
