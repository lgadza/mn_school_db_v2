import { cleanEnv, str, port, url, num, bool } from "envalid";
import { config } from "dotenv";

// Load environment variables from .env file
config();

/**
 * Validated environment variables
 * This ensures all required variables are present with correct types
 * @throws {Error} If any required variables are missing or invalid
 */
const env = cleanEnv(process.env, {
  // Server
  PORT: port({ default: 3001, desc: "API server port" }),
  NODE_ENV: str({
    choices: ["development", "test", "production"],
    default: "development",
  }),

  // Database
  PG_HOST: str({ desc: "PostgreSQL host" }),
  PG_PORT: port({ default: 5432, desc: "PostgreSQL port" }),
  PG_USER: str({ desc: "PostgreSQL username" }),
  PG_PASSWORD: str({ desc: "PostgreSQL password" }),
  PG_DB: str({ desc: "PostgreSQL database name" }),
  DATABASE_URL: url({ desc: "PostgreSQL connection URL for development" }),
  PRODUCTION_DATABASE_URL: url({
    desc: "PostgreSQL connection URL for production",
  }),

  // Redis
  REDIS_URL: str({ desc: "Redis connection URL" }),
  REDIS_HOST: str({ desc: "Redis host" }),
  REDIS_PORT: port({ desc: "Redis port" }),
  REDIS_PASSWORD: str({ desc: "Redis password" }),
  REDIS_USERNAME: str({ default: "default", desc: "Redis username" }),

  // Auth
  JWT_SECRET: str({ desc: "JWT secret key" }),
  JWT_EXPIRES_IN: str({ default: "24h", desc: "JWT expiration time" }),
  COOKIE_SECRET: str({ desc: "Secret key for cookie signing" }),

  // Frontend URLs
  FE_DEV_URL: url({ desc: "Frontend development URL" }),
  FE_PROD_URL: url({ desc: "Frontend production URL" }),
  ALLOWED_ORIGINS: str({
    desc: "Comma-separated list of allowed CORS origins",
  }),

  // Cloudinary
  CLOUDINARY_API_KEY: str({ desc: "Cloudinary API key" }),
  CLOUDINARY_API_SECRET: str({ desc: "Cloudinary API secret" }),
  CLOUDINARY_NAME: str({ desc: "Cloudinary cloud name" }),

  // AWS S3
  AWS_ACCESS_KEY_ID: str({ desc: "AWS access key ID" }),
  AWS_SECRET_ACCESS_KEY: str({ desc: "AWS secret access key" }),
  AWS_REGION: str({ default: "eu-central-1", desc: "AWS region" }),
  AWS_S3_BUCKET_NAME: str({ desc: "AWS S3 bucket name" }),

  // Email
  SENDER_EMAIL: str({ desc: "Sender email address" }),
  PERSONAL_EMAIL: str({ desc: "Personal email address" }),
  NODEMAILER_SMTP_HOST: str({ desc: "SMTP host" }),
  NODEMAILER_SMTP_PORT: port({ desc: "SMTP port" }),
  NODEMAILER_SMTP_APP_PASSWORD: str({ desc: "SMTP app password" }),

  // System
  SYSTEM_USER_ID: str({ desc: "System user ID" }),
  CONVERSATION_LIMIT: num({ default: 100, desc: "Conversation limit" }),
});

export default env;
