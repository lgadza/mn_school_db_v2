import { Request, Response, NextFunction } from "express";
import JwtUtil, { TokenType } from "@/common/utils/auth/jwt";
import ResponseUtil from "@/common/utils/responses/responseUtil";
import logger from "@/common/utils/logging/logger";

/**
 * User role types
 */
export enum UserRole {
  ADMIN = "admin",
  MANAGER = "manager",
  USER = "user",
  GUEST = "guest",
}

/**
 * Extended Express Request interface with authentication properties
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email?: string;
        role?: string;
        permissions?: string[];
      };
      token?: string;
    }
  }
}

/**
 * Authentication Middleware
 * Provides middleware functions for different authentication scenarios
 */
export class AuthMiddleware {
  /**
   * Verify JWT token from Authorization header
   *
   * @param req - Express Request object
   * @param res - Express Response object
   * @param next - Express NextFunction
   */
  public static async verifyToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const token = this.extractTokenFromHeader(req);

      if (!token) {
        ResponseUtil.sendUnauthorized(res, "No authentication token provided");
        return;
      }

      // Verify the token
      const verificationResult = await JwtUtil.verifyToken(token);

      if (!verificationResult.isValid || !verificationResult.payload) {
        ResponseUtil.sendUnauthorized(
          res,
          verificationResult.error || "Invalid authentication token"
        );
        return;
      }

      const { payload } = verificationResult;

      // Check if it's an access token
      if (payload.type !== TokenType.ACCESS) {
        ResponseUtil.sendUnauthorized(res, "Invalid token type");
        return;
      }

      // Set user and token info in request object for route handlers
      req.user = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        permissions: payload.permissions,
      };
      req.token = token;

      next();
    } catch (error) {
      logger.error("Auth middleware error:", error);
      ResponseUtil.sendUnauthorized(res, "Authentication failed");
    }
  }

  /**
   * Middleware to verify user role
   *
   * @param allowedRoles - Roles that are allowed to access the route
   * @returns Express middleware
   */
  public static hasRole(
    allowedRoles: UserRole | UserRole[]
  ): (req: Request, res: Response, next: NextFunction) => void {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    return (req: Request, res: Response, next: NextFunction) => {
      // This middleware should be used after verifyToken
      if (!req.user) {
        return ResponseUtil.sendUnauthorized(res, "Authentication required");
      }

      const userRole = req.user.role as UserRole;

      // Check if user has an allowed role
      if (!userRole || !roles.includes(userRole)) {
        return ResponseUtil.sendForbidden(
          res,
          `Access denied. Required role: ${roles.join(" or ")}`
        );
      }

      next();
    };
  }

  /**
   * Middleware to verify user permissions
   *
   * @param requiredPermissions - Permissions required to access the route
   * @returns Express middleware
   */
  public static hasPermission(
    requiredPermissions: string | string[]
  ): (req: Request, res: Response, next: NextFunction) => void {
    const permissions = Array.isArray(requiredPermissions)
      ? requiredPermissions
      : [requiredPermissions];

    return (req: Request, res: Response, next: NextFunction) => {
      // This middleware should be used after verifyToken
      if (!req.user) {
        return ResponseUtil.sendUnauthorized(res, "Authentication required");
      }

      const userPermissions = req.user.permissions || [];

      // Check if user has all required permissions
      const hasAllPermissions = permissions.every((permission) =>
        userPermissions.includes(permission)
      );

      if (!hasAllPermissions) {
        return ResponseUtil.sendForbidden(
          res,
          `Access denied. Required permissions: ${permissions.join(", ")}`
        );
      }

      next();
    };
  }

  /**
   * Optional authentication - doesn't require auth but will process token if present
   *
   * @param req - Express Request object
   * @param res - Express Response object
   * @param next - Express NextFunction
   */
  public static async optionalAuth(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const token = this.extractTokenFromHeader(req);

      if (!token) {
        // No token, but that's okay for this middleware
        return next();
      }

      // Verify the token
      const verificationResult = await JwtUtil.verifyToken(token);

      if (verificationResult.isValid && verificationResult.payload) {
        const { payload } = verificationResult;

        // Set user info in request object
        req.user = {
          userId: payload.userId,
          email: payload.email,
          role: payload.role,
          permissions: payload.permissions,
        };
        req.token = token;
      }

      // Continue regardless of token validity
      next();
    } catch (error) {
      // Continue even if there's an error
      logger.debug("Optional auth error (continuing):", error);
      next();
    }
  }

  /**
   * Extract token from Authorization header
   *
   * @param req - Express Request object
   * @returns JWT token or null
   */
  private static extractTokenFromHeader(req: Request): string | null {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    return authHeader.substring(7); // Remove 'Bearer ' prefix
  }
}

export default AuthMiddleware;
