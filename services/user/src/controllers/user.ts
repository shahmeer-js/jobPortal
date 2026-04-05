import axios from "axios";

import { AuthenticatedRequest } from "../middlewares/auth.js";
import getBuffer from "../utils/buffer.js";
import { db } from "../utils/db.js";
import ErrorHandler from "../utils/errorHandler.js";
import { logger } from "../utils/monitoring.js";
import { TryCatch } from "../utils/TryCatch.js";

export const myProfile = TryCatch(
  async (req: AuthenticatedRequest, res, next) => {
    const user = req.user;

    return res.json(user);
  },
);

export const getUserProfile = TryCatch(async (req, res, next) => {
  const { userId } = req.params;

  const users = await db`
      SELECT u.user_id, u.name, u.email, u.phone_number, u.role, u.bio, u.resume, u.resume_public_id, u.profile_pic, u.profile_pic_public_id, u.subscription,
      ARRAY_AGG(s.name) FILTER(WHERE s.name IS NOT NULL) as skills FROM users u LEFT JOIN user_skills us ON u.user_id = us.user_id LEFT JOIN skills s ON us.skill_id = s.skill_id WHERE u.user_id = ${userId} GROUP BY u.user_id
          `;

  if (users.length === 0) {
    throw new ErrorHandler(404, "User not Found");
  }

  const user = users[0];

  user.skills = user.skills || [];

  return res.json(user);
});

export const updateUserProfile = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
      throw new ErrorHandler(401, "Authentication Required");
    }

    const { name, phoneNumber, bio } = req.body;

    const newName = name || user.name;
    const newPhoneNumber = phoneNumber || user.phone_number;
    const newBio = bio || user.bio;

    const [updatedUser] = await db`
    UPDATE users SET name = ${newName}, phone_number = ${newPhoneNumber}, bio = ${newBio} WHERE user_id = ${user.user_id} RETURNING user_id, name, email, phone_number, bio
    `;

    return res.json({
      message: "Profile Updated Successfully",
      updatedUser,
    });
  },
);

export const updateProfilePic = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
      throw new ErrorHandler(401, "Authentication Required");
    }

    const file = req.file;

    if (!file) {
      throw new ErrorHandler(400, "No image file provided");
    }

    const oldPublicId = user.profile_pic_public_id;

    const fileBuffer = getBuffer(file);

    if (!fileBuffer || !fileBuffer.content) {
      logger.error("Failed to generate file buffer");
      throw new ErrorHandler(500, "Failed to generate file buffer");
    }

    const { data: uploadResult }: { data: { url: string; public_id: string } } =
      await axios.post(`${process.env.UPLOAD_SERVICE_URL}/api/utils/upload`, {
        buffer: fileBuffer.content,
        public_id: oldPublicId,
      });

    const [updatedUser] = await db`
    UPDATE users SET profile_pic = ${uploadResult.url}, profile_pic_public_id = ${uploadResult.public_id} WHERE user_id = ${user.user_id} RETURNING user_id, name, profile_pic;
    `;

    return res.json({
      message: "Profile Pic Updated",
      updatedUser,
    });
  },
);

export const updateResume = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;

  if (!user) {
    throw new ErrorHandler(401, "Authentication Required");
  }

  const file = req.file;

  if (!file) {
    throw new ErrorHandler(400, "No pdf file provided");
  }

  const oldPublicId = user.resume_public_id;

  const fileBuffer = getBuffer(file);

  if (!fileBuffer || !fileBuffer.content) {
    logger.error("Failed to generate file buffer");
    throw new ErrorHandler(500, "Failed to generate file buffer");
  }

  const { data: uploadResult }: { data: { url: string; public_id: string } } =
    await axios.post(`${process.env.UPLOAD_SERVICE_URL}/api/utils/upload`, {
      buffer: fileBuffer.content,
      public_id: oldPublicId,
    });

  const [updatedUser] = await db`
    UPDATE users SET resume = ${uploadResult.url}, resume_public_id = ${uploadResult.public_id} WHERE user_id = ${user.user_id} RETURNING user_id, name, resume;
    `;

  return res.json({
    message: "Resume Updated",
    updatedUser,
  });
});

export const addSkillToUser = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const userId = req.user?.user_id;

    if (!userId) {
      throw new ErrorHandler(401, "Authentication Required");
    }

    const { skillName } = req.body;

    if (!skillName || skillName.trim() === "") {
      throw new ErrorHandler(400, "Please provide skill name");
    }

    let wasSkillAdded = false;

    try {
      await db`BEGIN`;
      const users =
        await db`SELECT user_id FROM users WHERE user_id = ${userId}`;
      if (users.length === 0) {
        throw new ErrorHandler(404, "User not found");
      }

      const [skill] =
        await db`INSERT INTO skills (name) VALUES (${skillName.trim()}) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING skill_id`;

      const skillId = skill.skill_id;

      const insertionResult = await db`
    INSERT INTO user_skills (user_id, skill_id) VALUES (${userId}, ${skillId}) ON CONFLICT (user_id, skill_id) DO NOTHING RETURNING user_id
    `;

      if (insertionResult.length > 0) {
        wasSkillAdded = true;
      }

      await db`COMMIT`;
    } catch (error) {
      await db`ROLLBACK`;
      throw error;
    }

    if (!wasSkillAdded) {
      return res.json({
        message: "User already possess this skill",
      });
    }

    return res.json({
      message: `Skill ${skillName.trim()} is added successfully`,
    });
  },
);

export const removeSkillFromUser = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
      throw new ErrorHandler(401, "Authentication Required");
    }

    const { skillName } = req.body;

    if (!skillName || skillName.trim() === "") {
      throw new ErrorHandler(400, "Please provide a skill name");
    }

    const result = await db`
    DELETE from user_skills WHERE user_id = ${user.user_id} AND skill_id = (SELECT skill_id FROM skills WHERE name = ${skillName.trim()}) RETURNING user_id;
    `;

    if (result.length === 0) {
      throw new ErrorHandler(404, `Skill ${skillName.trim()} was not found`);
    }

    return res.json({
      message: `Skill ${skillName.trim()} deleted successfully`,
    });
  },
);

export const applyForJob = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;

  if (!user) {
    throw new ErrorHandler(401, "Authentication required");
  }

  if (user.role !== "jobseeker") {
    throw new ErrorHandler(
      403,
      "Forbidden: you are not allowed for this action",
    );
  }

  const applicant_id = user.user_id;

  const resume = user.resume;

  if (!resume) {
    throw new ErrorHandler(400, "Please add resume before applying to a job");
  }

  const { job_id } = req.body;

  if (!job_id) {
    throw new ErrorHandler(400, "Job id is required");
  }

  const [job] = await db`
  SELECT is_active FROM jobs WHERE job_id = ${job_id}
  `;

  if (!job) {
    throw new ErrorHandler(404, "No jobs with this id found");
  }

  if (!job.is_active) {
    throw new ErrorHandler(400, "Job is not active");
  }

  const now = Date.now();

  const subTime = req.user?.subscription
    ? new Date(req.user.subscription).getTime()
    : 0;

  const isSubscribed = subTime > now;

  let newApplication;

  try {
    [newApplication] = await db`
    INSERT INTO applications (job_id, applicant_id, applicant_email, resume, subscribed) VALUES (${job_id}, ${applicant_id},${user.email} ,${resume}, ${isSubscribed})
    `;
  } catch (error: any) {
    if (error.code === "23505") {
      throw new ErrorHandler(409, "You have already applied to this job");
    }
    throw error;
  }

  res.json({
    message: "Job applied successfully",
    application: newApplication,
  });
});

export const getAllApplications = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const applications = await db`
  SELECT a.*, j.title AS job_title, j.salary AS job_salary, j.location AS job_location FROM applications a JOIN jobs j ON a.job_id = j.job_id WHERE a.applicant_id = ${req.user?.user_id}
  `;

    if (!applications || applications.length === 0) {
      throw new ErrorHandler(404, "No job applications found");
    }

    res.json(applications);
  },
);
