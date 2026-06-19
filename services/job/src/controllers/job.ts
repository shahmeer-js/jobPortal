import axios from "axios";
import { AuthenticatedRequest } from "../middlewares/auth.js";
import getBuffer from "../utils/buffer.js";
import { db } from "../utils/db.js";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/TryCatch.js";
import { applicationStatusUpdateTemplate } from "../templete.js";
import { publishToTopic } from "../producer.js";
import { logger } from "../utils/monitoring.js";

export const getAllCompany = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const companies = await db`
  SELECT * FROM companies WHERE recruiter_id = ${req.user?.user_id}
  `;

    res.json(companies);
  },
);

export const createCompany = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
      throw new ErrorHandler(401, "Authentication Required");
    }

    if (user.role !== "recruiter") {
      throw new ErrorHandler(
        403,
        "Forbidden: Only recruiter can create a company",
      );
    }

    const { name, description, website } = req.body;

    if (!name || !description || !website) {
      throw new ErrorHandler(400, "All fields are required");
    }

    const existingCompany = await db`
    SELECT company_id FROM companies WHERE name = ${name}
    `;

    if (existingCompany.length > 0) {
      throw new ErrorHandler(
        409,
        `A company with the name ${name} already exits`,
      );
    }

    const file = req.file;

    if (!file) {
      throw new ErrorHandler(400, "Company logo is required");
    }

    const fileBuffer = getBuffer(file);

    if (!fileBuffer || !fileBuffer.content) {
      throw new ErrorHandler(500, "Failed to create file buffer");
    }

    const { data } = await axios.post(
      `${process.env.UPLOAD_SERVICE_URL}/upload`,
      { buffer: fileBuffer.content },
    );

    const [newCompany] = await db`
    INSERT INTO companies (name, description, website, logo, logo_public_id, recruiter_id) 
    VALUES (${name}, ${description}, ${website}, ${data.url}, ${data.public_id}, ${req.user?.user_id})
    RETURNING *
    `;

    res.json({
      message: "Company created successfully",
      company: newCompany,
    });
  },
);

export const deleteCompany = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    const { companyId } = req.params;

    const [company] = await db`
    SELECT logo_public_id FROM companies WHERE company_id = ${companyId} AND recruiter_id = ${user?.user_id}
    `;

    if (!company) {
      throw new ErrorHandler(
        404,
        "Company not found or you are not authorized",
      );
    }

    await db`
    DELETE FROM companies WHERE company_id = ${companyId}
    `;

    res.json({
      message: "Company and all associated jobs have been deleted",
    });
  },
);

export const getCompanyDetails = TryCatch(async (req, res) => {
  const { companyId } = req.params;

  if (!companyId) {
    throw new ErrorHandler(400, "Company id is required");
  }

  const [companyData] = await db`
    SELECT c.*, COALESCE(
    (
     SELECT json_agg(j.*) FROM jobs j WHERE j.company_id = c.company_id
    ),
    '[]'::json
    ) AS jobs
     FROM companies c WHERE c.company_id = ${companyId} GROUP BY c.company_id;
    `;

  if (!companyData) {
    throw new ErrorHandler(404, "Company not found");
  }

  res.json(companyData);
});

export const createJob = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;

  if (!user) {
    throw new ErrorHandler(401, "Authentication Required");
  }

  if (user.role !== "recruiter") {
    throw new ErrorHandler(403, "Forbidden: Only recruiter can create a job");
  }

  const {
    title,
    description,
    salary,
    location,
    role,
    job_type,
    work_location,
    company_id,
    openings,
  } = req.body;

  if (!title || !description || !salary || !location || !role || !openings) {
    throw new ErrorHandler(400, "All fields are required");
  }

  const [company] = await db`
  SELECT company_id FROM companies WHERE company_id = ${company_id} AND recruiter_id = ${user.user_id}
  `;

  if (!company) {
    throw new ErrorHandler(404, "Company not found");
  }

  const [newJob] = await db`
  INSERT INTO jobs (title, description, salary, location, role, job_type, work_location, company_id, posted_by_recruiter, openings) VALUES (${title}, ${description}, ${salary}, ${location}, ${role}, ${job_type}, ${work_location}, ${company_id}, ${user.user_id}, ${openings}) RETURNING *
  `;

  res.json({
    message: "Job posted successfully",
    job: newJob,
  });
});

export const updateJob = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;

  const jobId = req.params.jobId;

  if (!user) {
    throw new ErrorHandler(401, "Authentication Required");
  }

  if (!jobId) {
    throw new ErrorHandler(400, "Job id is required");
  }

  if (user.role !== "recruiter") {
    throw new ErrorHandler(403, "Forbidden: Only recruiter can update a job");
  }

  const {
    title,
    description,
    salary,
    location,
    role,
    job_type,
    work_location,
    company_id,
    openings,
    is_active,
  } = req.body;

  if (!title || !description || !salary || !location || !role || !openings) {
    throw new ErrorHandler(400, "All fields are required");
  }

  const [existingJob] = await db`
  SELECT posted_by_recruiter FROM jobs WHERE job_id = ${jobId}
  `;

  if (!existingJob) {
    throw new ErrorHandler(404, "Job not found");
  }

  if (existingJob.posted_by_recruiter !== user.user_id) {
    throw new ErrorHandler(403, "Forbidden: You are not allowed");
  }

  const [updatedJob] = await db`
  UPDATE jobs SET title = ${title},
  description = ${description},
  salary = ${salary},
  location = ${location}, 
  role = ${role},
  job_type = ${job_type},
  work_location = ${work_location},
  openings = ${openings},
  is_active = ${is_active}
  WHERE job_id = ${jobId} RETURNING *;
  `;

  res.json({
    message: "Job has been updated",
    job: updatedJob,
  });
});

export const getAllActiveJobs = TryCatch(async (req, res) => {
  const { title, location } = req.query as {
    title?: string;
    location?: string;
  };

  let queryString = `SELECT j.job_id, j.title, j.description, j.salary, j.location, j.job_type, j.role, j.work_location, j.created_at, c.name AS company_name, c.logo AS company_logo, c.company_id AS company_id FROM jobs j JOIN companies c ON j.company_id = c.company_id WHERE j.is_active = true`;

  const values = [];

  let paramsIndex = 1;

  if (title) {
    queryString += ` AND j.title ILIKE $${paramsIndex}`;
    values.push(`%${title}%`);
    paramsIndex++;
  }

  if (location) {
    queryString += ` AND j.location ILIKE $${paramsIndex}`;
    values.push(`%${location}%`);
    paramsIndex++;
  }

  queryString += " ORDER BY j.created_at DESC";

  const jobs = (await db.query(queryString, values)) as any[];

  res.json(jobs);
});

export const getSingleJob = TryCatch(async (req, res) => {
  const { jobId } = req.params;

  if (!jobId) {
    throw new ErrorHandler(400, "Job id is required");
  }

  const [job] = await db`
  SELECT * FROM jobs WHERE job_id = ${jobId}
  `;

  if (!job) {
    throw new ErrorHandler(404, "Job not found");
  }

  res.json(job);
});

export const getAllApplicationForJob = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    const jobId = req.params.jobId;

    if (!user) {
      throw new ErrorHandler(401, "Authentication Required");
    }

    if (!jobId) {
      throw new ErrorHandler(400, "Job id is required");
    }

    if (user.role !== "recruiter") {
      throw new ErrorHandler(403, "Forbidden: Only recruiter can access this");
    }

    const [job] =
      await db`SELECT posted_by_recruiter FROM jobs WHERE job_id = ${jobId}`;

    if (!job) {
      throw new ErrorHandler(404, "Job not found");
    }

    if (job.posted_by_recruiter !== user.user_id) {
      throw new ErrorHandler(403, "Forbidden: you are not allowed");
    }

    const applications = await db`
    SELECT * FROM applications WHERE job_id = ${jobId} ORDER BY subscribed DESC
    `;

    res.json(applications);
  },
);

export const updateApplication = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    const applicationId = req.params.applicationId;

    if (!user) {
      throw new ErrorHandler(401, "Authentication Required");
    }

    if (!applicationId) {
      throw new ErrorHandler(400, "Application id is required");
    }

    if (user.role !== "recruiter") {
      throw new ErrorHandler(403, "Forbidden: Only recruiter can access this");
    }

    const [application] = await db`
    SELECT * FROM applications WHERE application_id = ${applicationId}
    `;

    if (!application) {
      throw new ErrorHandler(404, "Application not found");
    }

    const [job] = await db`
    SELECT posted_by_recruiter, title FROM jobs WHERE job_id = ${application.job_id}
    `;

    if (!job) {
      throw new ErrorHandler(404, "Job not found");
    }

    if (job.posted_by_recruiter !== user.user_id) {
      throw new ErrorHandler(403, "Forbidden: you are not allowed");
    }

    const [updatedApplication] = await db`
    UPDATE applications SET status = ${req.body.status} WHERE application_id = ${applicationId} RETURNING *
    `;

    const message = {
      to: application.applicant_email,
      subject: "Application - Jobz Mela",
      html: applicationStatusUpdateTemplate(job.title),
    };

    publishToTopic("send-mail", message).catch((error) => {
      logger.error("Failed to publish update application mail to kafka", {
        error,
      });
    });

    res.json({
      message: "Application Updated",
      job,
      updatedApplication,
    });
  },
);
