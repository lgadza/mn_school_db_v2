import dotenv from "dotenv";
import path from "path";

// Load the appropriate .env file based on environment
const envPath = path.resolve(
  __dirname,
  "../../",
  process.env.NODE_ENV === "test" ? ".env.test" : ".env"
);

dotenv.config({ path: envPath });

// Helper function to ensure env values are strings
const getEnvAsString = (key: string, defaultValue: string = ""): string => {
  const value = process.env[key];
  return value !== undefined ? String(value) : defaultValue;
};

// Helper function to parse env values as numbers
const getEnvAsNumber = (key: string, defaultValue: number): number => {
  const value = process.env[key];
  if (value === undefined) return defaultValue;

  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Helper function to parse env values as booleans
const getEnvAsBoolean = (key: string, defaultValue: boolean): boolean => {
  const value = process.env[key];
  if (value === undefined) return defaultValue;

  return value.toLowerCase() === "true";
};

/**
 * Environment variables with proper type handling
 */
const env = {
  // Server
  NODE_ENV: getEnvAsString("NODE_ENV", "development"),
  PORT: getEnvAsNumber("PORT", 3000),
  APP_URL: getEnvAsString("APP_URL", "http://localhost:3000"),

  // CORS
  ALLOWED_ORIGINS: getEnvAsString("ALLOWED_ORIGINS", "*"),

  // Database
  PG_HOST: getEnvAsString("PG_HOST", "localhost"),
  PG_PORT: getEnvAsNumber("PG_PORT", 5432),
  PG_DB: getEnvAsString("PG_DB", "mn_school_db"),
  PG_USER: getEnvAsString("PG_USER", "postgres"),
  PG_PASSWORD: getEnvAsString("PG_PASSWORD", ""),
  DATABASE_URL: getEnvAsString("DATABASE_URL", ""),
  PRODUCTION_DATABASE_URL: getEnvAsString("PRODUCTION_DATABASE_URL", ""),

  // Redis
  REDIS_URL: getEnvAsString("REDIS_URL", ""),
  REDIS_HOST: getEnvAsString("REDIS_HOST", "localhost"),
  REDIS_PORT: getEnvAsNumber("REDIS_PORT", 6379),
  REDIS_PASSWORD: getEnvAsString("REDIS_PASSWORD", ""),
  REDIS_USERNAME: getEnvAsString("REDIS_USERNAME", ""),

  // JWT
  JWT_SECRET: getEnvAsString("JWT_SECRET", "mn-school-db-secret"),
  JWT_EXPIRES_IN: getEnvAsString("JWT_EXPIRES_IN", "1d"),

  // Security
  COOKIE_SECRET: getEnvAsString("COOKIE_SECRET", "mn-school-db-cookie-secret"),

  // AWS
  AWS_REGION: getEnvAsString("AWS_REGION", "us-east-1"),
  AWS_ACCESS_KEY_ID: getEnvAsString("AWS_ACCESS_KEY_ID", ""),
  AWS_SECRET_ACCESS_KEY: getEnvAsString("AWS_SECRET_ACCESS_KEY", ""),
  AWS_S3_BUCKET_NAME: getEnvAsString("AWS_S3_BUCKET_NAME", ""),

  // Email
  NODEMAILER_SMTP_HOST: getEnvAsString("NODEMAILER_SMTP_HOST", ""),
  NODEMAILER_SMTP_PORT: getEnvAsNumber("NODEMAILER_SMTP_PORT", 587),
  NODEMAILER_SMTP_APP_PASSWORD: getEnvAsString(
    "NODEMAILER_SMTP_APP_PASSWORD",
    ""
  ),
  SENDER_EMAIL: getEnvAsString("SENDER_EMAIL", ""),
  PERSONAL_EMAIL: getEnvAsString("PERSONAL_EMAIL", ""),

  // Cloudinary
  CLOUDINARY_NAME: getEnvAsString("CLOUDINARY_NAME", ""),
  CLOUDINARY_API_KEY: getEnvAsString("CLOUDINARY_API_KEY", ""),
  CLOUDINARY_API_SECRET: getEnvAsString("CLOUDINARY_API_SECRET", ""),

  // Frontend URLs
  FE_DEV_URL: getEnvAsString("FE_DEV_URL", "http://localhost:5173"),
  FE_PROD_URL: getEnvAsString("FE_PROD_URL", ""),

  // System
  SYSTEM_USER_ID: getEnvAsString("SYSTEM_USER_ID", "system"),
  CONVERSATION_LIMIT: getEnvAsNumber("CONVERSATION_LIMIT", 5),
};

export default env;
