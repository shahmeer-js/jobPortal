import bcrypt from "bcrypt";
import axios from "axios";
import jwt from "jsonwebtoken";

import { db } from "../utils/db.js";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/TryCatch.js";
import getBuffer from "../utils/buffer.js";
import { forgotPasswordTemplate } from "../template.js";
import { publishToTopic } from "../producer.js";
import { redisClient } from "../services/redis.js";
import { logger } from "../utils/monitoring.js";

export const registerUser = TryCatch(async (req, res, next) => {
  const { name, email, password, phone_number, role, bio } = req.body;

  if (!name || !email || !password || !phone_number || !role) {
    throw new ErrorHandler(400, "Please fill all details!");
  }

  const existingUsers =
    await db`SELECT user_id FROM users Where email = ${email}`;
  if (existingUsers.length > 0) {
    throw new ErrorHandler(409, "User with this email already exits!");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  let registeredUser;

  if (role === "recruiter") {
    const [user] =
      await db`INSERT INTO users (name, email, password, phone_number, role) VALUES (${name}, ${email}, ${hashedPassword}, ${phone_number}, ${role}) RETURNING user_id, name, email, phone_number, role, created_at`;

    registeredUser = user;
  } else if (role === "jobseeker") {
    const file = req.file;

    if (!file) {
      throw new ErrorHandler(400, "Please upload a resume!");
    }

    const fileBuffer = getBuffer(file);

    if (!fileBuffer || !fileBuffer.content) {
      throw new ErrorHandler(500, "Failed to process the uploaded resume!");
    }

    const { data } = await axios.post(
      `${process.env.UPLOAD_SERVICE_URL}/api/utils/upload`,
      {
        buffer: fileBuffer.content,
      },
    );

    const [user] =
      await db`INSERT INTO users (name, email, password, phone_number, role, bio, resume, resume_public_id) VALUES (${name}, ${email}, ${hashedPassword}, ${phone_number}, ${role}, ${bio}, ${data.url}, ${data.public_id}) RETURNING user_id, name, email, phone_number, role, bio, resume, resume_public_id, created_at`;

    registeredUser = user;
  }

  const token = jwt.sign(
    { id: registeredUser?.user_id },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "15d",
    },
  );

  res.status(201).json({
    user: registeredUser,
    token,
    message: "Registered Successfully",
  });
});

export const loginUser = TryCatch(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ErrorHandler(400, "All fields are required!");
  }

  const user = await db`
  SELECT u.user_id, u.name, u.email, u.password, u.phone_number, u.role, u.bio, u.resume, u.profile_pic, u.subscription, ARRAY_AGG(s.name) FILTER (WHERE s.name IS NOT NULL) as skills FROM users u LEFT JOIN user_skills us ON u.user_id = us.user_id 
  LEFT JOIN skills s ON us.skill_id = s.skill_id
  WHERE u.email = ${email} GROUP BY u.user_id;
  `;

  if (user.length === 0) {
    throw new ErrorHandler(404, "User not found");
  }

  const userObject = user[0];

  const matchPassword = await bcrypt.compare(password, userObject.password);

  if (!matchPassword) {
    throw new ErrorHandler(401, "Invalid credentials");
  }

  userObject.skills = userObject.skills || [];

  delete userObject.password;

  const token = jwt.sign(
    { id: userObject?.user_id },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "15d",
    },
  );

  res.status(200).json({
    user: userObject,
    token,
    message: "Logged In Successfully",
  });
});

export const forgotPassword = TryCatch(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    throw new ErrorHandler(400, "Email is required");
  }

  const users =
    await db`SELECT user_id, email FROM users WHERE email = ${email}`;

  if (users.length === 0) {
    return res.json({
      message: "If that email exists, we have sent a reset link",
    });
  }

  const user = users[0];

  const resetToken = jwt.sign(
    {
      email: user.email,
      type: "reset",
    },
    process.env.JWT_SECRET as string,
    { expiresIn: "15m" },
  );

  const resetLink = `${process.env.FRONTEND_URL}/reset/${resetToken}`;

  await redisClient.set(`forgot-password:${email}`, resetToken, {
    EX: 900,
  });

  const message = {
    to: email,
    subject: "Reset Your Password - Query Jobs",
    html: forgotPasswordTemplate(resetLink),
  };

  publishToTopic("send-mail", message).catch((error) => {
    logger.error("Failed to publish message to send-mail topic:", { error });
  });

  return res.json({
    message: "If that email exists, we have sent a reset link",
  });
});

export const resetPassword = TryCatch(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  let decoded: any;

  try {
    decoded = jwt.verify(token as string, process.env.JWT_SECRET as string);
  } catch (error) {
    throw new ErrorHandler(400, "Token has been expired");
  }
  if (decoded.type !== "reset") {
    throw new ErrorHandler(400, "Invalid token type");
  }

  const email = decoded.email;

  const storedToken = await redisClient.get(`forgot-password:${email}`);

  if (!storedToken || storedToken !== token) {
    throw new ErrorHandler(400, "Token has been expired");
  }

  const users = await db`SELECT user_id FROM users WHERE email = ${email}`;

  if (users.length === 0) {
    throw new ErrorHandler(404, "User not Found");
  }

  const user = users[0];

  const hashedPassword = await bcrypt.hash(password, 10);

  await db`UPDATE users SET password = ${hashedPassword} WHERE user_id = ${user.user_id}`;

  await redisClient.del(`forgot-password:${email}`);

  res.json({ message: "Password Changed Successfully" });
});
