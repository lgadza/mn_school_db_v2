import env from "./env";
import baseConfig from "./base";

/**
 * Application-specific configuration
 */
const appConfig = {
  // Base configuration
  ...baseConfig,

  // Cloudinary configuration
  cloudinary: {
    cloudName: env.CLOUDINARY_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    apiSecret: env.CLOUDINARY_API_SECRET,
  },

  // AWS S3 configuration
  aws: {
    s3: {
      region: env.AWS_REGION,
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      bucketName: env.AWS_S3_BUCKET_NAME,
      endpoint: `https://s3.${env.AWS_REGION}.amazonaws.com`,
    },
  },

  // Email configuration
  email: {
    smtp: {
      host: env.NODEMAILER_SMTP_HOST,
      port: env.NODEMAILER_SMTP_PORT,
      secure: true,
      auth: {
        user: env.SENDER_EMAIL,
        pass: env.NODEMAILER_SMTP_APP_PASSWORD,
      },
    },
    defaultFrom: env.SENDER_EMAIL,
    adminEmail: env.PERSONAL_EMAIL,
  },

  // Redis configuration
  redis: {
    url: env.REDIS_URL,
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
    username: env.REDIS_USERNAME,
  },

  // Database configuration
  database: {
    host: env.PG_HOST,
    port: env.PG_PORT,
    username: env.PG_USER,
    password: env.PG_PASSWORD,
    database: env.PG_DB,
    url:
      env.NODE_ENV === "production"
        ? env.PRODUCTION_DATABASE_URL
        : env.DATABASE_URL,
  },

  // Security configuration
  security: {
    cookieSecret: env.COOKIE_SECRET,
    jwtSecret: env.JWT_SECRET,
    jwtExpiresIn: env.JWT_EXPIRES_IN,
  },
};

export default appConfig;
