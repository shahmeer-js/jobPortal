import { AuthenticatedRequest } from "../middlewares/auth.js";
import { stripe } from "../services/payment.js";
import { db } from "../utils/db.js";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/TryCatch.js";

export const checkout = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;
  if (!user) {
    throw new ErrorHandler(401, "Unauthorized");
  }

  const { priceId } = req.body;

  if (!priceId) {
    throw new ErrorHandler(400, "Price ID is required");
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    client_reference_id: user.user_id.toString(),
    success_url: `${process.env.FRONTEND_URL}/subscribe/success/?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/subscribe/cancel`,
  });

  res.json({ url: checkoutSession.url });
});

export const verifyPayment = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      throw new ErrorHandler(401, "Unauthorized");
    }

    const [user] =
      await db`SELECT * FROM users WHERE user_id = ${req.user.user_id}`;

    if (!user) {
      throw new ErrorHandler(404, "User not found");
    }

    const existingSubscription = new Date(user.subscription);

    if (existingSubscription.getTime() > Date.now()) {
      throw new ErrorHandler(400, "User already purchased the subscription");
    }

    const sessionId = req.query.session_id as string;

    if (!sessionId) {
      throw new ErrorHandler(400, "Session ID is required");
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      throw new ErrorHandler(404, "Session not found");
    }

    if (
      session.payment_status === "paid" &&
      session.client_reference_id === req.user.user_id.toString()
    ) {
      const now = new Date();

      const thirtyDays = 30 * 24 * 60 * 60 * 1000;

      const expiryDate = new Date(now.getTime() + thirtyDays);

      const [updatedUser] =
        await db`UPDATE users SET subscription = ${expiryDate} WHERE user_id = ${req.user.user_id} RETURNING *`;

      if (!updatedUser) {
        throw new ErrorHandler(404, "User not found");
      }

      res.json({
        user: updatedUser,
        message: "Payment successful, subscription updated",
      });
    } else {
      throw new ErrorHandler(400, "Payment not successful");
    }
  },
);
