import { Request, Response, NextFunction } from "express";
import { ForbiddenError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";
import logger from "@/common/utils/logging/logger";
import Role from "@/features/rbac/models/roles.model";
import UserRole from "@/features/users/user-role.model";
import Permission from "@/features/rbac/models/permissions.model";
import RolePermission from "@/features/rbac/models/role-permission.model";
import cache from "@/common/utils/cache/cacheUtil";
import { PermissionAction } from "@/features/rbac/interfaces/roles.interface";
import PermissionService from "@/features/rbac/services/permission.service";

/**
 * Permission Middleware
 * Provides methods for checking permissions and roles before granting access to resources
 */
class PermissionMiddleware {
  /**
   * Cache key prefix for permission caching
   */
  private static readonly CACHE_PREFIX = "permissions:";

  /**
   * Cache expiration for permission data (in seconds)
   */
  private static readonly CACHE_TTL = 600; // 10 minutes

  /**
   * Permission hierarchy mapping - which permissions imply others
   * Imported from PermissionService to maintain consistency
   */
  private static readonly permissionHierarchy = {
    // Reference the same hierarchy defined in PermissionService
    [PermissionAction.MANAGE]: [
      PermissionAction.CREATE,
      PermissionAction.READ,
      PermissionAction.UPDATE,
      PermissionAction.APPROVE,
      PermissionAction.REJECT,
      PermissionAction.VIEW_REPORTS,
      PermissionAction.DOWNLOAD_DATA,
      PermissionAction.EXPORT,
      PermissionAction.IMPORT,
      PermissionAction.ARCHIVE,
      PermissionAction.RESTORE,
      PermissionAction.PUBLISH,
      PermissionAction.UNPUBLISH,
      PermissionAction.ASSIGN,
      PermissionAction.TRANSFER,
    ],
  };

  /**
   * Middleware to check if a user has a specific permission on a resource
   *
   * @param resource - The resource being accessed
   * @param action - The action being performed (create, read, update, delete, manage)
   * @param options - Additional options
   * @returns Express middleware function
   */
  public static hasPermission(
    resource: string,
    action: string | PermissionAction,
    options: { superAdminBypass?: boolean; ownershipCheck?: boolean } = {
      superAdminBypass: true,
      ownershipCheck: false,
    }
  ) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const user = req.user;

        // If no user or userId, access is denied
        if (!user || !user.userId) {
          throw new ForbiddenError("Access denied", {
            additionalInfo: {
              errorCode: ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS,
              resource,
              action,
              reason: "No authenticated user found",
            },
          });
        }

        // Super admin bypass check - admins have access to everything if enabled
        if (
          options.superAdminBypass &&
          (user.role === "admin" || user.role === "super_admin")
        ) {
          return next();
        }

        // Get user permissions
        const userPermissions = await this.getUserPermissions(user.userId);

        // Check if user has the required permission (direct match)
        const hasDirectPermission = userPermissions.some(
          (permission) =>
            permission.resource === resource && permission.action === action
        );

        // Check if user has a higher permission that implies this permission
        const hasImpliedPermission = userPermissions.some((permission) => {
          if (permission.resource !== resource) return false;

          // If user has MANAGE permission, check if it implies the requested action
          if (permission.action === PermissionAction.MANAGE) {
            return this.permissionHierarchy[PermissionAction.MANAGE].includes(
              action as PermissionAction
            );
          }

          // Add checks for any other hierarchical permissions here

          return false;
        });

        // Check for wildcard permissions (resource: "*", action: "*")
        const hasWildcardPermission = userPermissions.some(
          (permission) =>
            (permission.resource === "*" && permission.action === "*") ||
            (permission.resource === "*" && permission.action === action) ||
            (permission.resource === resource && permission.action === "*")
        );

        if (
          hasDirectPermission ||
          hasImpliedPermission ||
          hasWildcardPermission
        ) {
          return next();
        }

        // Ownership check if enabled
        if (options.ownershipCheck && req.params.id) {
          const isOwner = await this.checkOwnership(
            user.userId,
            resource,
            req.params.id
          );
          if (isOwner) {
            return next();
          }
        }

        // If we get here, access is denied
        throw new ForbiddenError("Insufficient permissions", {
          additionalInfo: {
            errorCode: ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS,
            resource,
            action,
            userId: user.userId,
          },
        });
      } catch (error) {
        if (error instanceof ForbiddenError) {
          next(error);
        } else {
          logger.error("Error in permission middleware:", error);
          next(
            new ForbiddenError("Permission check failed", {
              additionalInfo: {
                errorCode: ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS,
                resource,
                action,
              },
            })
          );
        }
      }
    };
  }

  /**
   * Middleware to check if a user has at least one of the specified roles
   *
   * @param roles - Array of role names to check
   * @returns Express middleware function
   */
  public static hasRole(roles: string[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const user = req.user;

        // If no user or userId, access is denied
        if (!user || !user.userId) {
          throw new ForbiddenError("Access denied", {
            additionalInfo: {
              errorCode: ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS,
              roles,
              reason: "No authenticated user found",
            },
          });
        }

        // Super admin bypass - admins have access to everything
        if (user.role === "admin") {
          return next();
        }

        // Get user roles
        const userRoles = await this.getUserRoles(user.userId);
        const userRoleNames = userRoles.map((role) => role.name);

        // Check if user has at least one of the required roles
        const hasRequiredRole = roles.some((role) =>
          userRoleNames.includes(role)
        );

        if (hasRequiredRole) {
          return next();
        }

        // If we get here, access is denied
        throw new ForbiddenError("Insufficient roles", {
          additionalInfo: {
            errorCode: ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS,
            requiredRoles: roles,
            userRoles: userRoleNames,
            userId: user.userId,
          },
        });
      } catch (error) {
        if (error instanceof ForbiddenError) {
          next(error);
        } else {
          logger.error("Error in role check middleware:", error);
          next(
            new ForbiddenError("Role check failed", {
              additionalInfo: {
                errorCode: ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS,
                roles,
              },
            })
          );
        }
      }
    };
  }

  /**
   * Get all permissions for a user
   * Uses caching for performance
   *
   * @param userId - User ID to check permissions for
   * @returns Array of permission objects
   */
  private static async getUserPermissions(
    userId: string
  ): Promise<Array<{ resource: string; action: string }>> {
    const cacheKey = `${this.CACHE_PREFIX}${userId}`;

    // Try to get from cache first
    const cachedPermissions = await cache.get(cacheKey);
    if (cachedPermissions) {
      return JSON.parse(cachedPermissions);
    }

    try {
      // Find all user roles
      const userRoleRecords = await UserRole.findAll({
        where: { userId },
        include: [
          {
            model: Role,
            as: "role",
            include: [
              {
                model: Permission,
                as: "permissions",
                through: { attributes: [] }, // Don't include join table attributes
              },
            ],
          },
        ],
      });

      // Extract unique permissions
      const permissionsMap = new Map<
        string,
        { resource: string; action: string }
      >();

      userRoleRecords.forEach((userRole) => {
        const role = userRole.get("role") as any;
        if (role && role.permissions) {
          role.permissions.forEach((permission: any) => {
            const key = `${permission.resource}:${permission.action}`;
            permissionsMap.set(key, {
              resource: permission.resource,
              action: permission.action,
            });
          });
        }
      });

      const permissions = Array.from(permissionsMap.values());

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(permissions), this.CACHE_TTL);

      return permissions;
    } catch (error) {
      logger.error(`Error fetching permissions for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Get all roles for a user
   *
   * @param userId - User ID to check roles for
   * @returns Array of role objects
   */
  private static async getUserRoles(
    userId: string
  ): Promise<Array<{ id: string; name: string }>> {
    try {
      const userRoleRecords = await UserRole.findAll({
        where: { userId },
        include: [
          {
            model: Role,
            as: "role",
          },
        ],
      });

      return userRoleRecords.map((userRole) => {
        const role = userRole.get("role") as any;
        return {
          id: role.id,
          name: role.name,
        };
      });
    } catch (error) {
      logger.error(`Error fetching roles for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Check if a user is the owner of a resource
   * This is a template method that should be overridden with actual implementation
   * based on your data model
   *
   * @param userId - User ID to check
   * @param resource - Resource type (e.g., 'posts', 'comments')
   * @param resourceId - ID of the specific resource
   * @returns Whether the user is the owner
   */
  private static async checkOwnership(
    userId: string,
    resource: string,
    resourceId: string
  ): Promise<boolean> {
    try {
      // This is a placeholder for actual ownership check logic
      // You should implement this based on your application's data model

      // Example implementation for a 'posts' resource:
      // if (resource === 'posts') {
      //   const post = await Post.findByPk(resourceId);
      //   return post?.userId === userId;
      // }

      logger.warn(
        `Ownership check not implemented for resource type: ${resource}`
      );
      return false;
    } catch (error) {
      logger.error(
        `Error checking ownership for user ${userId} on ${resource} ${resourceId}:`,
        error
      );
      return false;
    }
  }

  /**
   * Clear permission cache for a user
   * Should be called when user roles or permissions change
   *
   * @param userId - User ID to clear cache for
   */
  public static async clearPermissionCache(userId: string): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}${userId}`;
    await cache.del(cacheKey);
    logger.debug(`Cleared permission cache for user ${userId}`);
  }
}

export default PermissionMiddleware;
