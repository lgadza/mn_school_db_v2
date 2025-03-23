import { IUserRepository } from "./interfaces/services";
import { UserInterface } from "./interfaces";
import User from "./model";
import Role from "../rbac/models/roles.model";
import UserRole from "./user-role.model";
import Permission from "../rbac/models/permissions.model";
import RolePermission from "../rbac/models/role-permission.model";
import { Transaction, Op, WhereOptions } from "sequelize";
import { UserListQueryParams, RoleDTO, PermissionDTO } from "./dto";
import logger from "@/common/utils/logging/logger";
import { DatabaseError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";
import db from "@/config/database";

export class UserRepository implements IUserRepository {
  /**
   * Find a user by ID with roles and permissions
   */
  public async findUserById(
    id: string
  ): Promise<(UserInterface & { roles?: any[]; permissions?: any[] }) | null> {
    try {
      const user = await User.findByPk(id, {
        include: [
          {
            model: Role,
            as: "roles",
            through: { attributes: [] }, // Exclude join table attributes
            include: [
              {
                model: Permission,
                as: "permissions",
                through: { attributes: [] }, // Exclude join table attributes
              },
            ],
          },
        ],
      });

      if (!user) return null;

      // Flatten and deduplicate permissions across all roles
      const permissionSet = new Set<string>();
      const permissions: any[] = [];

      const roles = (user.get("roles") as any[]) || [];

      roles.forEach((role) => {
        const rolePermissions = role.permissions || [];
        rolePermissions.forEach((permission: PermissionDTO) => {
          const permKey: string = `${permission.resource}:${permission.action}`;
          if (!permissionSet.has(permKey)) {
            permissionSet.add(permKey);
            permissions.push(permission);
          }
        });
      });

      // Add permissions to user object
      (user as any).permissions = permissions;

      return user as UserInterface & { roles?: any[]; permissions?: any[] };
    } catch (error) {
      logger.error("Error finding user by ID:", error);
      throw new DatabaseError("Database error while finding user", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, userId: id },
      });
    }
  }

  /**
   * Find a user by email
   */
  public async findUserByEmail(email: string): Promise<UserInterface | null> {
    try {
      return await User.findOne({
        where: { email },
        include: [
          {
            model: Role,
            as: "roles",
            through: { attributes: [] },
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding user by email:", error);
      throw new DatabaseError("Database error while finding user by email", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, email },
      });
    }
  }

  /**
   * Find a user by username
   */
  public async findUserByUsername(
    username: string
  ): Promise<UserInterface | null> {
    try {
      return await User.findOne({
        where: { username },
        include: [
          {
            model: Role,
            as: "roles",
            through: { attributes: [] },
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding user by username:", error);
      throw new DatabaseError("Database error while finding user by username", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, username },
      });
    }
  }

  /**
   * Create a new user
   */
  public async createUser(
    userData: Partial<UserInterface>,
    transaction?: Transaction
  ): Promise<UserInterface> {
    try {
      return await User.create(userData as any, { transaction });
    } catch (error) {
      logger.error("Error creating user:", error);
      throw new DatabaseError("Database error while creating user", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Update a user
   */
  public async updateUser(
    id: string,
    userData: Partial<UserInterface>,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const [updated] = await User.update(userData as any, {
        where: { id },
        transaction,
      });
      return updated > 0;
    } catch (error) {
      logger.error("Error updating user:", error);
      throw new DatabaseError("Database error while updating user", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, userId: id },
      });
    }
  }

  /**
   * Soft delete a user (set isActive to false)
   */
  public async softDeleteUser(id: string): Promise<boolean> {
    try {
      const [updated] = await User.update(
        { isActive: false },
        { where: { id } }
      );
      return updated > 0;
    } catch (error) {
      logger.error("Error soft deleting user:", error);
      throw new DatabaseError("Database error while soft deleting user", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, userId: id },
      });
    }
  }

  /**
   * Hard delete a user (permanent)
   */
  public async hardDeleteUser(id: string): Promise<boolean> {
    try {
      // Start a transaction
      const transaction = await db.sequelize.transaction();

      try {
        // First delete user roles
        await UserRole.destroy({
          where: { userId: id },
          transaction,
        });

        // Then delete the user
        const deleted = await User.destroy({
          where: { id },
          transaction,
        });

        // Commit the transaction
        await transaction.commit();

        return deleted > 0;
      } catch (error) {
        // Rollback the transaction on error
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      logger.error("Error hard deleting user:", error);
      throw new DatabaseError("Database error while hard deleting user", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, userId: id },
      });
    }
  }

  /**
   * Get user list with filtering and pagination
   */
  public async getUserList(params: UserListQueryParams): Promise<{
    users: (UserInterface & { roles?: any[] })[];
    total: number;
  }> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sortBy = "createdAt",
        sortOrder = "desc",
        isActive,
        role,
        createdAfter,
        createdBefore,
      } = params;

      // Build where clause
      const where: WhereOptions<any> = {};

      // Filter by active status if specified
      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      // Search filter
      if (search) {
        Object.assign(where, {
          [Op.or]: [
            { firstName: { [Op.iLike]: `%${search}%` } },
            { lastName: { [Op.iLike]: `%${search}%` } },
            { email: { [Op.iLike]: `%${search}%` } },
            { username: { [Op.iLike]: `%${search}%` } },
          ],
        });
      }

      // Date range filter
      if (createdAfter || createdBefore) {
        where.createdAt = {};
        if (createdAfter) {
          where.createdAt[Op.gte] = new Date(createdAfter);
        }
        if (createdBefore) {
          where.createdAt[Op.lte] = new Date(createdBefore);
        }
      }

      // Role filter
      const includeOptions: any[] = [
        {
          model: Role,
          as: "roles",
          through: { attributes: [] },
        },
      ];

      if (role) {
        includeOptions[0] = {
          model: Role,
          as: "roles",
          through: { attributes: [] },
          where: { name: role },
        };
      }

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Get users and total count
      const { count, rows } = await User.findAndCountAll({
        where,
        include: includeOptions,
        order: [[sortBy, sortOrder]],
        limit,
        offset,
        distinct: true, // Important for correct count with associations
      });

      return {
        users: rows,
        total: count,
      };
    } catch (error) {
      logger.error("Error getting user list:", error);
      throw new DatabaseError("Database error while getting user list", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, params },
      });
    }
  }

  /**
   * Update user password
   */
  public async updatePassword(id: string, password: string): Promise<boolean> {
    try {
      const [updated] = await User.update({ password }, { where: { id } });
      return updated > 0;
    } catch (error) {
      logger.error("Error updating user password:", error);
      throw new DatabaseError("Database error while updating user password", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, userId: id },
      });
    }
  }

  /**
   * Get user roles
   */
  public async getUserRoles(userId: string): Promise<RoleDTO[]> {
    try {
      const userWithRoles = await User.findByPk(userId, {
        include: [
          {
            model: Role,
            as: "roles",
            through: { attributes: [] },
          },
        ],
      });

      if (!userWithRoles) {
        return [];
      }

      const roles = (userWithRoles.get("roles") as any[]) || [];

      return roles.map((role) => ({
        id: role.id,
        name: role.name,
        description: role.description || "",
      }));
    } catch (error) {
      logger.error("Error getting user roles:", error);
      throw new DatabaseError("Database error while getting user roles", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, userId },
      });
    }
  }

  /**
   * Get user permissions
   */
  public async getUserPermissions(userId: string): Promise<PermissionDTO[]> {
    try {
      // Get all user roles
      const userRoles = await UserRole.findAll({
        where: { userId },
        include: [
          {
            model: Role,
            as: "role",
            include: [
              {
                model: Permission,
                as: "permissions",
                through: { attributes: [] },
              },
            ],
          },
        ],
      });

      // Extract permissions from roles
      const permissionMap = new Map<string, PermissionDTO>();

      userRoles.forEach((userRole) => {
        const role = userRole.get("role") as any;

        if (role && role.permissions) {
          role.permissions.forEach((permission: any) => {
            // Use a unique key to deduplicate permissions
            const key = `${permission.resource}:${permission.action}`;
            if (!permissionMap.has(key)) {
              permissionMap.set(key, {
                id: permission.id,
                resource: permission.resource,
                action: permission.action,
                description: permission.description || "",
              });
            }
          });
        }
      });

      return Array.from(permissionMap.values());
    } catch (error) {
      logger.error("Error getting user permissions:", error);
      throw new DatabaseError("Database error while getting user permissions", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, userId },
      });
    }
  }

  /**
   * Add roles to user
   */
  public async addRolesToUser(
    userId: string,
    roleIds: string[],
    transaction?: Transaction
  ): Promise<void> {
    try {
      // Create array of user-role pairs
      const userRoles = roleIds.map((roleId) => ({ userId, roleId }));

      // Use bulkCreate with updateOnDuplicate option to avoid duplicate key errors
      await UserRole.bulkCreate(userRoles, {
        transaction,
        ignoreDuplicates: true,
      });
    } catch (error) {
      logger.error("Error adding roles to user:", error);
      throw new DatabaseError("Database error while adding roles to user", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, userId, roleIds },
      });
    }
  }

  /**
   * Remove roles from user
   */
  public async removeRolesFromUser(
    userId: string,
    roleIds: string[],
    transaction?: Transaction
  ): Promise<void> {
    try {
      await UserRole.destroy({
        where: {
          userId,
          roleId: { [Op.in]: roleIds },
        },
        transaction,
      });
    } catch (error) {
      logger.error("Error removing roles from user:", error);
      throw new DatabaseError("Database error while removing roles from user", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, userId, roleIds },
      });
    }
  }

  /**
   * Set user roles (replace existing)
   */
  public async setUserRoles(
    userId: string,
    roleIds: string[],
    transaction?: Transaction
  ): Promise<void> {
    try {
      // Start a transaction if one isn't provided
      const useTransaction = transaction || (await db.sequelize.transaction());

      try {
        // Remove all existing roles
        await UserRole.destroy({
          where: { userId },
          transaction: useTransaction,
        });

        // Add new roles if any
        if (roleIds.length > 0) {
          const userRoles = roleIds.map((roleId) => ({ userId, roleId }));
          await UserRole.bulkCreate(userRoles, {
            transaction: useTransaction,
          });
        }

        // Commit the transaction if we started it
        if (!transaction) {
          await useTransaction.commit();
        }
      } catch (error) {
        // Rollback the transaction if we started it
        if (!transaction) {
          await useTransaction.rollback();
        }
        throw error;
      }
    } catch (error) {
      logger.error("Error setting user roles:", error);
      throw new DatabaseError("Database error while setting user roles", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, userId, roleIds },
      });
    }
  }

  /**
   * Update user avatar
   */
  public async updateAvatar(
    userId: string,
    avatarUrl: string
  ): Promise<boolean> {
    try {
      const [updated] = await User.update(
        { avatar: avatarUrl },
        { where: { id: userId } }
      );
      return updated > 0;
    } catch (error) {
      logger.error("Error updating user avatar:", error);
      throw new DatabaseError("Database error while updating user avatar", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, userId },
      });
    }
  }

  /**
   * Check if user has specific role
   */
  public async hasRole(userId: string, roleName: string): Promise<boolean> {
    try {
      const count = await UserRole.count({
        where: { userId },
        include: [
          {
            model: Role,
            as: "role",
            where: { name: roleName },
          },
        ],
      });

      return count > 0;
    } catch (error) {
      logger.error("Error checking if user has role:", error);
      throw new DatabaseError("Database error while checking user role", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, userId, roleName },
      });
    }
  }
}

// Create and export repository instance
export default new UserRepository();
