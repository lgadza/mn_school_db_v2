/**
 * Error codes organized by domain
 * Format: <DOMAIN>_<CATEGORY>_<SPECIFIC>
 * This makes error codes more self-documenting and traceable
 */
export enum ErrorCode {
  // Generic errors (GEN prefix)
  GEN_INTERNAL_ERROR = "GEN-001",
  GEN_NOT_IMPLEMENTED = "GEN-002",

  // Authentication errors (AUTH prefix)
  AUTH_INVALID_CREDENTIALS = "AUTH-001",
  AUTH_EXPIRED_TOKEN = "AUTH-002",
  AUTH_INVALID_TOKEN = "AUTH-003",
  AUTH_MISSING_TOKEN = "AUTH-004",
  AUTH_INSUFFICIENT_PERMISSIONS = "AUTH-005",

  // Validation errors (VAL prefix)
  VAL_MISSING_REQUIRED_FIELD = "VAL-001",
  VAL_INVALID_FORMAT = "VAL-002",
  VAL_EXCEEDS_LIMIT = "VAL-003",

  // Resource errors (RES prefix)
  RES_NOT_FOUND = "RES-001",
  RES_ALREADY_EXISTS = "RES-002",
  RES_CONFLICT = "RES-003",

  // Database errors (DB prefix)
  DB_CONNECTION_ERROR = "DB-001",
  DB_QUERY_FAILED = "DB-002",
  DB_CONSTRAINT_VIOLATION = "DB-003",
  DB_TRANSACTION_FAILED = "DB-004",

  // File errors (FILE prefix)
  FILE_ERROR = "FILE-000", // Generic file error
  FILE_UPLOAD_FAILED = "FILE-001",
  FILE_SIZE_EXCEEDED = "FILE-002",
  FILE_TYPE_NOT_ALLOWED = "FILE-003",
  FILE_NOT_FOUND = "FILE-004", // Changed from numeric to string format
  FILE_DELETE_FAILED = "FILE-005", // Changed from numeric to string format

  // External service errors (EXT prefix)
  EXT_SERVICE_UNAVAILABLE = "EXT-001",
  EXT_REQUEST_FAILED = "EXT-002",
  EXT_RESPONSE_INVALID = "EXT-003",

  // Rate limiting errors (RATE prefix)
  RATE_LIMIT_EXCEEDED = "RATE-001",

  // Network errors (NET prefix)
  NET_CONNECTION_FAILED = "NET-001",
  NET_TIMEOUT = "NET-002",
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  DEBUG = "debug",
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  CRITICAL = "critical",
}

/**
 * Error metadata interface
 */
export interface ErrorMetadata {
  code: ErrorCode;
  userId?: string;
  requestId?: string;
  timestamp: string;
  severity: ErrorSeverity;
  source?: string;
  additionalInfo?: Record<string, any>;
}

/**
 * Creates error metadata
 */
export function createErrorMetadata(
  code: ErrorCode,
  severity: ErrorSeverity = ErrorSeverity.ERROR,
  additionalInfo?: Record<string, any>
): ErrorMetadata {
  return {
    code,
    timestamp: new Date().toISOString(),
    severity,
    additionalInfo,
  };
}

export default ErrorCode;
