import path from "path";
import env from "./env";

/**
 * Base application configuration
 */
const baseConfig = {
  // Server configuration
  env: env.NODE_ENV,
  isDevelopment: env.NODE_ENV === "development",
  isProduction: env.NODE_ENV === "production",
  isTest: env.NODE_ENV === "test",
  port: env.PORT,

  // Root paths
  rootDir: path.resolve(__dirname, "../../"),
  srcDir: path.resolve(__dirname, "../"),

  // CORS configuration
  cors: {
    allowedOrigins: env.ALLOWED_ORIGINS.split(","),
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    maxAge: 86400, // 24 hours
  },

  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },

  // Security
  security: {
    jwtSecret: env.JWT_SECRET,
    jwtExpiresIn: env.JWT_EXPIRES_IN,
  },

  // Logging
  logging: {
    level: env.NODE_ENV === "production" ? "info" : "debug",
    format: env.NODE_ENV === "production" ? "json" : "pretty",
  },

  // System
  system: {
    systemUserId: env.SYSTEM_USER_ID,
    conversationLimit: env.CONVERSATION_LIMIT,
  },

  // Frontend URLs
  frontendUrls: {
    development: env.FE_DEV_URL,
    production: env.FE_PROD_URL,
  },
};

export default baseConfig;
