import express from "express";
import { checkout, verifyPayment } from "../controllers/payment.js";
import { isAuth } from "../middlewares/auth.js";

const router = express.Router();

router.post("/checkout", isAuth, checkout);
router.get("/verify", isAuth, verifyPayment);

export default router;

