import { IRoleService } from "../interfaces/roles.interface";
import { IRoleRepository } from "../interfaces/roles.interface";
import { RoleInterface, CreateRoleDto, UpdateRoleDto } from "../interfaces";
import roleRepository from "../repository/roles.repository";
import {
  NotFoundError,
  BadRequestError,
} from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";
import logger from "@/common/utils/logging/logger";

export class RoleService implements IRoleService {
  private repository: IRoleRepository;

  constructor(repository: IRoleRepository) {
    this.repository = repository;
  }

  /**
   * Get all roles
   */
  public async getAllRoles(): Promise<RoleInterface[]> {
    try {
      return await this.repository.findAll();
    } catch (error) {
      logger.error("Error getting all roles:", error);
      throw error;
    }
  }

  /**
   * Get a role by ID
   */
  public async getRoleById(id: string): Promise<RoleInterface> {
    try {
      const role = await this.repository.findById(id);
      if (!role) {
        throw new NotFoundError("Role not found", {
          additionalInfo: { errorCode: ErrorCode.RES_NOT_FOUND },
        });
      }
      return role;
    } catch (error) {
      logger.error(`Error getting role by ID (${id}):`, error);
      throw error;
    }
  }

  /**
   * Create a new role
   */
  public async createRole(data: CreateRoleDto): Promise<RoleInterface> {
    try {
      // Check if role with same name already exists
      const existingRole = await this.repository.findByName(data.name);
      if (existingRole) {
        throw new BadRequestError(
          "Role with this name already exists",
          ErrorCode.RES_ALREADY_EXISTS,
          { additionalInfo: { field: "name" } }
        );
      }

      return await this.repository.create(data);
    } catch (error) {
      logger.error("Error creating role:", error);
      throw error;
    }
  }

  /**
   * Update an existing role
   */
  public async updateRole(
    id: string,
    data: UpdateRoleDto
  ): Promise<RoleInterface> {
    try {
      // Check if role exists
      const role = await this.repository.findById(id);
      if (!role) {
        throw new NotFoundError("Role not found", {
          additionalInfo: { errorCode: ErrorCode.RES_NOT_FOUND },
        });
      }

      // If name is being updated, check it doesn't conflict
      if (data.name && data.name !== role.name) {
        const existingRole = await this.repository.findByName(data.name);
        if (existingRole && existingRole.id !== id) {
          throw new BadRequestError(
            "Another role with this name already exists",
            ErrorCode.RES_ALREADY_EXISTS,
            { additionalInfo: { field: "name" } }
          );
        }
      }

      const updatedRole = await this.repository.update(id, data);
      return updatedRole as RoleInterface;
    } catch (error) {
      logger.error(`Error updating role (${id}):`, error);
      throw error;
    }
  }

  /**
   * Delete a role
   */
  public async deleteRole(id: string): Promise<boolean> {
    try {
      // Check if role exists
      const role = await this.repository.findById(id);
      if (!role) {
        throw new NotFoundError("Role not found", {
          additionalInfo: { errorCode: ErrorCode.RES_NOT_FOUND },
        });
      }

      // Prevent deletion of system roles
      if (["admin", "user"].includes(role.name)) {
        throw new BadRequestError(
          "Cannot delete system role",
          ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS,
          { additionalInfo: { roleName: role.name } }
        );
      }

      return await this.repository.delete(id);
    } catch (error) {
      logger.error(`Error deleting role (${id}):`, error);
      throw error;
    }
  }

  /**
   * Add permissions to a role
   */
  public async addPermissionsToRole(
    roleId: string,
    permissionIds: string[]
  ): Promise<boolean> {
    try {
      // Check if role exists
      const role = await this.repository.findById(roleId);
      if (!role) {
        throw new NotFoundError("Role not found", {
          additionalInfo: { errorCode: ErrorCode.RES_NOT_FOUND },
        });
      }

      return await this.repository.addPermissionsToRole(roleId, permissionIds);
    } catch (error) {
      logger.error(`Error adding permissions to role (${roleId}):`, error);
      throw error;
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
      // Check if role exists
      const role = await this.repository.findById(roleId);
      if (!role) {
        throw new NotFoundError("Role not found", {
          additionalInfo: { errorCode: ErrorCode.RES_NOT_FOUND },
        });
      }

      return await this.repository.removePermissionsFromRole(
        roleId,
        permissionIds
      );
    } catch (error) {
      logger.error(`Error removing permissions from role (${roleId}):`, error);
      throw error;
    }
  }

  /**
   * Get permissions for a role
   */
  public async getRolePermissions(roleId: string): Promise<string[]> {
    try {
      // Check if role exists
      const role = await this.repository.findById(roleId);
      if (!role) {
        throw new NotFoundError("Role not found", {
          additionalInfo: { errorCode: ErrorCode.RES_NOT_FOUND },
        });
      }

      return await this.repository.getRolePermissions(roleId);
    } catch (error) {
      logger.error(`Error getting permissions for role (${roleId}):`, error);
      throw error;
    }
  }
}

export default new RoleService(roleRepository);
