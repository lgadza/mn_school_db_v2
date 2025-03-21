import { createLogger, format, transports } from "winston";
import * as path from "path";

const { combine, timestamp, printf, colorize, errors } = format;

// Define custom log format
const customFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

// Create the logger instance
const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(
    errors({ stack: true }), // Enable stack trace in error logs
    timestamp(),
    customFormat
  ),
  transports: [
    new transports.Console({
      format: combine(colorize(), customFormat),
    }),
    new transports.File({
      filename: path.join(__dirname, "../../logs/error.log"),
      level: "error",
      format: combine(customFormat),
    }),
    new transports.File({
      filename: path.join(__dirname, "../../logs/combined.log"),
      format: combine(customFormat),
    }),
  ],
  exceptionHandlers: [
    new transports.File({
      filename: path.join(__dirname, "../../logs/exceptions.log"),
    }),
  ],
  rejectionHandlers: [
    new transports.File({
      filename: path.join(__dirname, "../../logs/rejections.log"),
    }),
  ],
});

export default logger;
