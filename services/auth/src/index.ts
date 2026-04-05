import app from "./app.js";
import dotenv from "dotenv";
import { db } from "./utils/db.js";
import { connectRedis } from "./services/redis.js";
import { logger } from "./utils/monitoring.js";

dotenv.config();
connectRedis();

async function initDb() {
  try {
    await db`
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
            CREATE TYPE user_role AS ENUM ('jobseeker', 'recruiter');
        END IF;
    END $$;
    `;

    await db`
    CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    role user_role NOT NULL,
    bio TEXT,
    resume VARCHAR(255),
    resume_public_id VARCHAR(255),
    profile_pic VARCHAR(255),
    profile_pic_public_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    subscription TIMESTAMPTZ
  )
    `;

    await db`
    CREATE TABLE IF NOT EXISTS skills(
     skill_id SERIAL PRIMARY KEY,
     name VARCHAR(50) UNIQUE NOT NULL
    )
    `;

    await db`
    CREATE TABLE IF NOT EXISTS user_skills(
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    skill_id INT REFERENCES skills(skill_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, skill_id)
  )
    `;

    logger.info("Database setup done");
  } catch (error) {
    logger.error(`Something went wrong buddy`, { error });
    process.exit(1);
  }
}

initDb().then(() => {
  app.listen(process.env.PORT, () => {
    logger.info(`Auth service is running on PORT ${process.env.PORT}`);
  });
});
