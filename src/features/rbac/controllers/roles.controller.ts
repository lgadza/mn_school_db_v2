import { Request, Response } from "express";
import { IRoleService } from "../interfaces/roles.interface";
import roleService from "../services/roles.service";
import ResponseUtil, {
  HttpStatus,
} from "@/common/utils/responses/responseUtil";
import logger from "@/common/utils/logging/logger";
import { AppError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

export class RoleController {
  private service: IRoleService;

  constructor(service: IRoleService) {
    this.service = service;
  }

  /**
   * Get all roles
   */
  public getAllRoles = async (req: Request, res: Response): Promise<void> => {
    try {
      const roles = await this.service.getAllRoles();
      ResponseUtil.sendSuccess(
        res,
        {
          roles,
          count: roles.length,
        },
        "Roles retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getAllRoles controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving roles",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get a role by ID
   */
  public getRoleById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const role = await this.service.getRoleById(id);
      ResponseUtil.sendSuccess(res, role, "Role retrieved successfully");
    } catch (error) {
      logger.error(
        `Error in getRoleById controller (${req.params.id}):`,
        error
      );
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving role",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Create a new role
   */
  public createRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const roleData = req.body;
      const newRole = await this.service.createRole(roleData);
      ResponseUtil.sendSuccess(
        res,
        newRole,
        "Role created successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in createRole controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error creating role",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Update an existing role
   */
  public updateRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const roleData = req.body;
      const updatedRole = await this.service.updateRole(id, roleData);
      ResponseUtil.sendSuccess(res, updatedRole, "Role updated successfully");
    } catch (error) {
      logger.error(`Error in updateRole controller (${req.params.id}):`, error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error updating role",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Delete a role
   */
  public deleteRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.service.deleteRole(id);
      ResponseUtil.sendSuccess(
        res,
        { success: true },
        "Role deleted successfully"
      );
    } catch (error) {
      logger.error(`Error in deleteRole controller (${req.params.id}):`, error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error deleting role",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Add permissions to a role
   */
  public addPermissionsToRole = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { permissionIds } = req.body;

      await this.service.addPermissionsToRole(id, permissionIds);
      ResponseUtil.sendSuccess(
        res,
        { success: true },
        "Permissions added to role successfully"
      );
    } catch (error) {
      logger.error(
        `Error in addPermissionsToRole controller (${req.params.id}):`,
        error
      );
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error adding permissions to role",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Remove permissions from a role
   */
  public removePermissionsFromRole = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { permissionIds } = req.body;

      await this.service.removePermissionsFromRole(id, permissionIds);
      ResponseUtil.sendSuccess(
        res,
        { success: true },
        "Permissions removed from role successfully"
      );
    } catch (error) {
      logger.error(
        `Error in removePermissionsFromRole controller (${req.params.id}):`,
        error
      );
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error removing permissions from role",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get permissions for a role
   */
  public getRolePermissions = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const permissions = await this.service.getRolePermissions(id);
      ResponseUtil.sendSuccess(
        res,
        { permissions },
        "Role permissions retrieved successfully"
      );
    } catch (error) {
      logger.error(
        `Error in getRolePermissions controller (${req.params.id}):`,
        error
      );
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving role permissions",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };
}

export default new RoleController(roleService);
