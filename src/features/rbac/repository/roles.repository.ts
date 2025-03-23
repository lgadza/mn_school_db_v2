import { IRoleRepository } from "../interfaces/roles.interface";
import {
  RoleInterface,
  CreateRoleDto,
  UpdateRoleDto,
} from "../interfaces/roles.interface";
import Role from "../models/roles.model";
import { DatabaseError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";
import logger from "@/common/utils/logging/logger";

export class RoleRepository implements IRoleRepository {
  /**
   * Find all roles
   */
  public async findAll(): Promise<RoleInterface[]> {
    try {
      return await Role.findAll();
    } catch (error) {
      logger.error("Error finding all roles:", error);
      throw new DatabaseError("Database error while retrieving roles", {
        additionalInfo: { errorCode: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Find a role by ID
   */
  public async findById(id: string): Promise<RoleInterface | null> {
    try {
      return await Role.findByPk(id);
    } catch (error) {
      logger.error(`Error finding role by ID (${id}):`, error);
      throw new DatabaseError("Database error while retrieving role", {
        additionalInfo: { errorCode: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Find a role by name
   */
  public async findByName(name: string): Promise<RoleInterface | null> {
    try {
      return await Role.findOne({ where: { name } });
    } catch (error) {
      logger.error(`Error finding role by name (${name}):`, error);
      throw new DatabaseError("Database error while retrieving role", {
        additionalInfo: { errorCode: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Create a new role
   */
  public async create(data: CreateRoleDto): Promise<RoleInterface> {
    try {
      return await Role.create(data as any);
    } catch (error) {
      logger.error("Error creating role:", error);
      throw new DatabaseError("Database error while creating role", {
        additionalInfo: { errorCode: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Update an existing role
   */
  public async update(
    id: string,
    data: UpdateRoleDto
  ): Promise<RoleInterface | null> {
    try {
      const role = await Role.findByPk(id);
      if (!role) return null;

      await role.update(data);
      return role;
    } catch (error) {
      logger.error(`Error updating role (${id}):`, error);
      throw new DatabaseError("Database error while updating role", {
        additionalInfo: { errorCode: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Delete a role
   */
  public async delete(id: string): Promise<boolean> {
    try {
      const result = await Role.destroy({ where: { id } });
      return result > 0;
    } catch (error) {
      logger.error(`Error deleting role (${id}):`, error);
      throw new DatabaseError("Database error while deleting role", {
        additionalInfo: { errorCode: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Add permissions to a role
   * Note: This would require a RolePermission model in a real implementation
   */
  public async addPermissionsToRole(
    roleId: string,
    permissionIds: string[]
  ): Promise<boolean> {
    try {
      // Placeholder for role-permission association
      // In a real implementation, you would use a RolePermission model
      logger.info(
        `Added permissions ${permissionIds.join(", ")} to role ${roleId}`
      );
      return true;
    } catch (error) {
      logger.error(`Error adding permissions to role (${roleId}):`, error);
      throw new DatabaseError("Database error while adding permissions", {
        additionalInfo: { errorCode: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Remove permissions from a role
   */
  public async removePermissionsFromRole(
    roleId: string,
    permissionIds: string[]
  ): Promise<boolean> {
    try {
      // Placeholder for role-permission disassociation
      logger.info(
        `Removed permissions ${permissionIds.join(", ")} from role ${roleId}`
      );
      return true;
    } catch (error) {
      logger.error(`Error removing permissions from role (${roleId}):`, error);
      throw new DatabaseError("Database error while removing permissions", {
        additionalInfo: { errorCode: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Get permissions for a role
   */
  public async getRolePermissions(roleId: string): Promise<string[]> {
    try {
      // Placeholder for getting role permissions
      return []; // In a real implementation, fetch and return actual permissions
    } catch (error) {
      logger.error(`Error getting permissions for role (${roleId}):`, error);
      throw new DatabaseError("Database error while retrieving permissions", {
        additionalInfo: { errorCode: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }
}

export default new RoleRepository();
