import helmet from "helmet";
import { Express } from "express";
import { appConfig } from "@/config";

/**
 * Configure Helmet security middleware
 * Helmet helps secure Express apps by setting HTTP response headers
 *
 * @param app - Express application
 */
export const configureHelmet = (app: Express): void => {
  // Set up CSP (Content Security Policy)
  const cspOptions = {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: [
        "'self'",
        "data:",
        "blob:",
        `https://${appConfig.aws.s3.bucketName}.s3.amazonaws.com`,
      ],
      connectSrc: ["'self'", process.env.API_URL || ""],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  };

  // Apply Helmet middleware with options
  app.use(
    helmet({
      contentSecurityPolicy:
        process.env.NODE_ENV === "production" ? cspOptions : false,
      crossOriginEmbedderPolicy: false, // Allow loading resources from different origins
      crossOriginOpenerPolicy: { policy: "same-origin" },
      crossOriginResourcePolicy: { policy: "cross-origin" },
      dnsPrefetchControl: { allow: false },
      frameguard: { action: "deny" },
      hidePoweredBy: true,
      hsts: {
        maxAge: 15552000, // 180 days in seconds
        includeSubDomains: true,
        preload: true,
      },
      ieNoOpen: true,
      noSniff: true,
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
      xssFilter: true,
    })
  );
};

export default configureHelmet;
